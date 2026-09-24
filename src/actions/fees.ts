'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db/db'
import { getSessionUser, requireAdminStaff } from '@/lib/auth/guard'
import { audit } from '@/lib/auth/rate-limit'

// ============ FEE TYPES ============

const feeTypeSchema = z.object({
  code: z.string().trim().min(1, 'Kode wajib diisi.').max(30),
  name: z.string().trim().min(2, 'Nama wajib diisi.').max(100),
  description: z.string().trim().max(500).optional(),
  defaultAmount: z.coerce.number().int().min(0, 'Nominal tidak boleh negatif.'),
  recurring: z.coerce.boolean().optional(),
})

export interface FeeTypeState {
  error?: string
  success?: boolean
}

export async function createFeeTypeAction(_prev: FeeTypeState, formData: FormData): Promise<FeeTypeState> {
  const user = await requireAdminStaff()
  const parsed = feeTypeSchema.safeParse({
    code: formData.get('code'),
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    defaultAmount: formData.get('defaultAmount'),
    recurring: formData.get('recurring') === 'on',
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Periksa data.' }
  const data = parsed.data

  try {
    await db.feeType.create({ data: { ...data, isActive: true } })
    await audit({
      userId: user.id, action: 'FEE_TYPE_CREATE', entityType: 'FeeType',
      afterJson: JSON.stringify({ code: data.code }),
    })
    revalidatePath('/keuangan/jenis-biaya')
    return { success: true }
  } catch (err) {
    if (String(err).includes('Unique')) return { error: `Kode "${data.code}" sudah dipakai.` }
    console.error('[feeType] gagal:', err)
    return { error: 'Gagal menyimpan jenis biaya.' }
  }
}

export async function toggleFeeTypeAction(formData: FormData): Promise<void> {
  const user = await getSessionUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) return
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id)) return
  const ft = await db.feeType.findUnique({ where: { id }, include: { _count: { select: { items: true } } } })
  if (!ft) return
  // Nonaktif hanya jika tidak dipakai item invoice (integritas historis)
  if (ft.isActive && ft._count.items > 0) return

  await db.feeType.update({ where: { id }, data: { isActive: !ft.isActive } })
  await audit({ userId: user.id, action: ft.isActive ? 'FEE_TYPE_DEACTIVATE' : 'FEE_TYPE_ACTIVATE', entityType: 'FeeType', entityId: id })
  revalidatePath('/keuangan/jenis-biaya')
}
