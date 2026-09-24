'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db/db'
import { getSessionUser, requireAdminStaff } from '@/lib/auth/guard'
import { audit } from '@/lib/auth/rate-limit'

const expenseSchema = z.object({
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal tidak valid.'),
  category: z.string().trim().min(2, 'Kategori wajib diisi.').max(100),
  description: z.string().trim().min(3, 'Keterangan wajib diisi.').max(500),
  amount: z.coerce.number().int().positive('Nominal harus lebih dari nol.'),
  vendor: z.string().trim().max(200).optional(),
  paymentMethod: z.enum(['CASH', 'TRANSFER', 'OTHER']),
})

export interface ExpenseState {
  error?: string
  success?: boolean
}

export async function createExpenseAction(_prev: ExpenseState, formData: FormData): Promise<ExpenseState> {
  const user = await requireAdminStaff()
  const parsed = expenseSchema.safeParse({
    expenseDate: formData.get('expenseDate'),
    category: formData.get('category'),
    description: formData.get('description'),
    amount: formData.get('amount'),
    vendor: formData.get('vendor') || undefined,
    paymentMethod: formData.get('paymentMethod'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Periksa data pengeluaran.' }
  const data = parsed.data

  try {
    let seq = (await db.expense.count()) + 1
    let expenseNo = `EXP-${new Date().getFullYear()}-${String(seq).padStart(5, '0')}`
    while (await db.expense.findUnique({ where: { expenseNo } })) {
      expenseNo = `EXP-${new Date().getFullYear()}-${String(++seq).padStart(5, '0')}`
    }

    const exp = await db.expense.create({
      data: {
        expenseNo,
        expenseDate: new Date(data.expenseDate),
        category: data.category,
        description: data.description,
        amount: data.amount,
        vendor: data.vendor ?? null,
        paymentMethod: data.paymentMethod,
        status: 'POSTED',
        createdBy: user.id,
      },
    })
    await audit({
      userId: user.id, action: 'EXPENSE_CREATE', entityType: 'Expense', entityId: exp.id,
      afterJson: JSON.stringify({ expenseNo, amount: data.amount }),
    })
    revalidatePath('/keuangan/pengeluaran')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err) {
    console.error('[expense] gagal:', err)
    return { error: 'Gagal menyimpan pengeluaran.' }
  }
}

export async function voidExpenseAction(formData: FormData): Promise<void> {
  const user = await getSessionUser()
  if (!user || user.role !== 'ADMIN') return
  const id = Number(formData.get('id'))
  const reason = String(formData.get('reason') ?? '').trim()
  if (!Number.isInteger(id)) return
  if (reason.length < 5) return

  const exp = await db.expense.findUnique({ where: { id } })
  if (!exp || exp.status === 'VOID') return
  await db.expense.update({ where: { id }, data: { status: 'VOID', voidReason: reason } })
  await audit({ userId: user.id, action: 'EXPENSE_VOID', entityType: 'Expense', entityId: id, afterJson: JSON.stringify({ reason }) })
  revalidatePath('/keuangan/pengeluaran')
}
