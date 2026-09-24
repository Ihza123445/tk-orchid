'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db/db'
import { getSessionUser, requireAdminStaff } from '@/lib/auth/guard'
import { audit } from '@/lib/auth/rate-limit'

const itemSchema = z.object({
  feeTypeId: z.coerce.number().int().positive('Jenis biaya wajib dipilih.'),
  description: z.string().trim().max(200).optional(),
  quantity: z.coerce.number().int().min(1).max(12),
  unitAmount: z.coerce.number().int().min(0, 'Nominal tidak boleh negatif.'),
})

const invoiceSchema = z.object({
  studentId: z.coerce.number().int().positive('Siswa wajib dipilih.'),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal terbit tidak valid.'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal jatuh tempo tidak valid.'),
  notes: z.string().trim().max(500).optional(),
  items: z.array(itemSchema).min(1, 'Minimal satu item biaya.'),
})

export interface InvoiceState {
  error?: string
  success?: boolean
  invoiceNo?: string
}

export async function createInvoiceAction(_prev: InvoiceState, formData: FormData): Promise<InvoiceState> {
  const user = await requireAdminStaff()

  let rawItems: unknown
  try {
    rawItems = JSON.parse(String(formData.get('items') ?? '[]'))
  } catch {
    return { error: 'Format item tidak valid.' }
  }

  const parsed = invoiceSchema.safeParse({
    studentId: formData.get('studentId'),
    issueDate: formData.get('issueDate'),
    dueDate: formData.get('dueDate'),
    notes: formData.get('notes') || undefined,
    items: rawItems,
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Periksa data tagihan.' }
  const data = parsed.data

  if (new Date(data.dueDate) < new Date(data.issueDate)) {
    return { error: 'Jatuh tempo tidak boleh sebelum tanggal terbit.' }
  }

  const student = await db.student.findUnique({ where: { id: data.studentId } })
  if (!student) return { error: 'Siswa tidak ditemukan.' }

  const ay = await db.academicYear.findFirst({ where: { status: 'ACTIVE' } })

  try {
    // invoiceNo: INV-<TA>-<student>-<seq> unik global
    let seq = await db.invoice.count() + 1
    const aySlug = ay ? ay.name.replace('/', '-') : 'NA'
    let invoiceNo = `INV-${aySlug}-${student.studentCode}-${String(seq).padStart(4, '0')}`
    // jaga-jaga collision
    while (await db.invoice.findUnique({ where: { invoiceNo } })) {
      invoiceNo = `INV-${aySlug}-${student.studentCode}-${String(++seq).padStart(4, '0')}`
    }

    const total = data.items.reduce((s, i) => s + i.quantity * i.unitAmount, 0)
    if (total <= 0) return { error: 'Total tagihan harus lebih dari nol.' }

    const inv = await db.invoice.create({
      data: {
        invoiceNo,
        studentId: data.studentId,
        academicYearId: ay?.id ?? null,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        status: 'ISSUED',
        notes: data.notes ?? null,
        createdBy: user.id,
        items: {
          create: data.items.map((i) => ({
            feeTypeId: i.feeTypeId,
            description: i.description || '',
            quantity: i.quantity,
            unitAmount: i.unitAmount,
            subtotal: i.quantity * i.unitAmount,
          })),
        },
      },
    })
    await audit({
      userId: user.id, action: 'INVOICE_CREATE', entityType: 'Invoice', entityId: inv.id,
      afterJson: JSON.stringify({ invoiceNo, total }),
    })
    revalidatePath('/keuangan/tagihan')
    return { success: true, invoiceNo }
  } catch (err) {
    console.error('[invoice] gagal:', err)
    return { error: 'Gagal membuat tagihan.' }
  }
}

export async function voidInvoiceAction(formData: FormData): Promise<void> {
  const user = await getSessionUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) return
  const id = Number(formData.get('id'))
  const reason = String(formData.get('reason') ?? '').trim()
  if (!Number.isInteger(id)) return
  if (reason.length < 5) return

  const inv = await db.invoice.findUnique({
    where: { id },
    include: { allocations: true },
  })
  if (!inv || inv.status === 'PAID' || inv.status === 'VOID') return
  if (inv.allocations.length > 0) return // sudah ada pembayaran — tidak boleh void langsung

  await db.invoice.update({ where: { id }, data: { status: 'VOID', notes: reason } })
  await audit({ userId: user.id, action: 'INVOICE_VOID', entityType: 'Invoice', entityId: id, afterJson: JSON.stringify({ reason }) })
  revalidatePath('/keuangan/tagihan')
}
