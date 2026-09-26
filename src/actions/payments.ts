'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db/db'
import { getSessionUser, requireAdminStaff } from '@/lib/auth/guard'
import { audit } from '@/lib/auth/rate-limit'
import { invoiceStatus } from '@/lib/finance/invoice-status'

const allocationSchema = z.object({
  invoiceId: z.coerce.number().int().positive('Tagihan wajib dipilih.'),
  amount: z.coerce.number().int().positive('Alokasi harus lebih dari nol.'),
})

const paymentSchema = z.object({
  studentId: z.coerce.number().int().positive('Siswa wajib dipilih.'),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal tidak valid.'),
  method: z.enum(['CASH', 'TRANSFER', 'QRIS', 'OTHER']),
  referenceNo: z.string().trim().max(100).optional(),
  note: z.string().trim().max(500).optional(),
  allocations: z.array(allocationSchema).min(1, 'Minimal satu alokasi ke tagihan.'),
})

export interface PaymentState {
  error?: string
  success?: boolean
  receiptNo?: string
}

/**
 * Catat pembayaran + alokasi dalam SATU transaksi atomik (PRD §16.3).
 * - Total alokasi == jumlah bayar (tidak boleh lebih)
 * - Alokasi per invoice tidak melebihi sisa tagihan
 * - Status invoice dihitung ulang: PARTIAL / PAID
 */
export async function createPaymentAction(_prev: PaymentState, formData: FormData): Promise<PaymentState> {
  const user = await requireAdminStaff()

  let rawAllocations: unknown
  try {
    rawAllocations = JSON.parse(String(formData.get('allocations') ?? '[]'))
  } catch {
    return { error: 'Format alokasi tidak valid.' }
  }

  const parsed = paymentSchema.safeParse({
    studentId: formData.get('studentId'),
    paymentDate: formData.get('paymentDate'),
    method: formData.get('method'),
    referenceNo: formData.get('referenceNo') || undefined,
    note: formData.get('note') || undefined,
    allocations: rawAllocations,
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Periksa data pembayaran.' }
  const data = parsed.data

  const totalPaid = data.allocations.reduce((s, a) => s + a.amount, 0)
  if (totalPaid <= 0) return { error: 'Jumlah pembayaran harus lebih dari nol.' }

  // invoice duplikat ditolak
  const invoiceIds = new Set(data.allocations.map((a) => a.invoiceId))
  if (invoiceIds.size !== data.allocations.length) {
    return { error: 'Ada tagihan yang muncul dua kali.' }
  }

  try {
    const result = await db.$transaction(async (tx) => {
      // Validasi semua invoice milik siswa & belum lunas
      for (const alloc of data.allocations) {
        const inv = await tx.invoice.findUnique({
          where: { id: alloc.invoiceId },
          include: { items: true, allocations: { include: { payment: true } } },
        })
        if (!inv) throw new Error(`Tagihan #${alloc.invoiceId} tidak ditemukan.`)
        if (inv.studentId !== data.studentId) throw new Error('Tagihan bukan milik siswa ini.')
        if (inv.status === 'VOID') throw new Error('Tagihan sudah dibatalkan.')
        const allocatedSoFar = inv.allocations.filter((al) => al.payment.status === 'POSTED').reduce((s, al) => s + al.amount, 0)
        const total = inv.items.reduce((s, i) => s + i.subtotal, 0)
        const remaining = total - allocatedSoFar
        if (remaining <= 0) throw new Error('Tagihan sudah lunas.')
        if (alloc.amount > remaining) throw new Error(`Alokasi melebihi sisa tagihan (sisa Rp${remaining.toLocaleString('id-ID')}).`)
      }

      // receiptNo unik
      let seq = (await tx.payment.count()) + 1
      let receiptNo = `RCP-${new Date().getFullYear()}-${String(seq).padStart(5, '0')}`
      while (await tx.payment.findUnique({ where: { receiptNo } })) {
        receiptNo = `RCP-${new Date().getFullYear()}-${String(++seq).padStart(5, '0')}`
      }

      const payment = await tx.payment.create({
        data: {
          receiptNo,
          studentId: data.studentId,
          paymentDate: new Date(data.paymentDate),
          amount: totalPaid,
          method: data.method,
          referenceNo: data.referenceNo ?? null,
          note: data.note ?? null,
          status: 'POSTED',
          recordedBy: user.id,
          allocations: {
            create: data.allocations.map((a) => ({ invoiceId: a.invoiceId, amount: a.amount })),
          },
        },
      })

      // Update status tiap invoice terdampak
      for (const invId of invoiceIds) {
        const inv = await tx.invoice.findUnique({
          where: { id: invId },
          include: { items: true, allocations: { include: { payment: true } } },
        })
        const total = inv!.items.reduce((s, i) => s + i.subtotal, 0)
        const allocated = inv!.allocations.filter((al) => al.payment.status === 'POSTED').reduce((s, al) => s + al.amount, 0)
        const status = invoiceStatus(total, allocated)
        await tx.invoice.update({ where: { id: invId }, data: { status } })
      }

      return payment
    })

    await audit({
      userId: user.id, action: 'PAYMENT_CREATE', entityType: 'Payment', entityId: result.id,
      afterJson: JSON.stringify({ receiptNo: result.receiptNo, amount: totalPaid }),
    })
    revalidatePath('/keuangan/pembayaran')
    revalidatePath('/keuangan/tagihan')
    revalidatePath('/dashboard')
    return { success: true, receiptNo: result.receiptNo }
  } catch (err) {
    const msg = err instanceof Error ? err.message : null
    if (msg && !msg.includes('\n')) return { error: msg }
    console.error('[payment] gagal:', err)
    return { error: 'Gagal mencatat pembayaran.' }
  }
}

export async function voidPaymentAction(formData: FormData): Promise<void> {
  const user = await getSessionUser()
  if (!user || user.role !== 'ADMIN') return // hanya ADMIN boleh void pembayaran
  const id = Number(formData.get('id'))
  const reason = String(formData.get('reason') ?? '').trim()
  if (!Number.isInteger(id)) return
  if (reason.length < 5) return

  try {
    await db.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id },
        include: { allocations: true },
      })
      if (!payment || payment.status === 'VOID') return

      await tx.payment.update({ where: { id }, data: { status: 'VOID', voidReason: reason } })

      // Hitung ulang status semua invoice yang tadinya dialokasi
      for (const alloc of payment.allocations) {
        const inv = await tx.invoice.findUnique({
          where: { id: alloc.invoiceId },
          include: { items: true, allocations: { include: { payment: true } } },
        })
        if (!inv || inv.status === 'VOID') continue
        const total = inv.items.reduce((s, i) => s + i.subtotal, 0)
        const allocated = inv.allocations.filter((al) => al.payment.status === 'POSTED').reduce((s, al) => s + al.amount, 0)
        const status = invoiceStatus(total, allocated)
        await tx.invoice.update({ where: { id: inv.id }, data: { status } })
      }
    })
    await audit({ userId: user.id, action: 'PAYMENT_VOID', entityType: 'Payment', entityId: id, afterJson: JSON.stringify({ reason }) })
    revalidatePath('/keuangan/pembayaran')
    revalidatePath('/keuangan/tagihan')
  } catch (err) {
    console.error('[payment-void] gagal:', err)
  }
}
