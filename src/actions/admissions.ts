'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db/db'
import { requireAdminStaff } from '@/lib/auth/guard'
import { audit } from '@/lib/auth/rate-limit'

const reviewSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(['REVIEW', 'REVISION_REQUIRED', 'ACCEPTED', 'REJECTED']),
  reason: z.string().trim().max(500).optional(),
})

export interface ReviewState {
  error?: string
  success?: boolean
}

export async function reviewAdmissionAction(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const user = await requireAdminStaff()
  const parsed = reviewSchema.safeParse({
    id: formData.get('id'),
    status: formData.get('status'),
    reason: formData.get('reason') || undefined,
  })
  if (!parsed.success) return { error: 'Data tidak valid. Muat ulang halaman.' }
  if (parsed.data.status === 'REJECTED' && (!parsed.data.reason || parsed.data.reason.length < 5)) {
    return { error: 'Tuliskan alasan penolakan (minimal 5 karakter).' }
  }

  const existing = await db.admission.findUnique({ where: { id: parsed.data.id }, select: { id: true, status: true } })
  if (!existing) return { error: 'Pendaftaran tidak ditemukan.' }
  if (existing.status === 'ENROLLED') return { error: 'Pendaftar sudah menjadi siswa, status tidak dapat diubah.' }

  await db.admission.update({
    where: { id: parsed.data.id },
    data: {
      status: parsed.data.status,
      rejectionReason: parsed.data.status === 'REJECTED' ? parsed.data.reason : null,
      reviewedBy: user.id,
      reviewedAt: new Date(),
    },
  })
  await audit({
    userId: user.id,
    action: 'ADMISSION_REVIEW',
    entityType: 'Admission',
    entityId: parsed.data.id,
    beforeJson: JSON.stringify({ status: existing.status }),
    afterJson: JSON.stringify({ status: parsed.data.status }),
  })
  revalidatePath('/ppdb')
  revalidatePath('/dashboard')
  return { success: true }
}
