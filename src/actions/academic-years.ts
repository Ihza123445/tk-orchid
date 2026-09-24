'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db/db'
import { requireAdminStaff, getSessionUser } from '@/lib/auth/guard'
import { audit } from '@/lib/auth/rate-limit'

const aySchema = z
  .object({
    name: z.string().trim().regex(/^\d{4}\/\d{4}$/, 'Format harus YYYY/YYYY (contoh: 2026/2027).'),
    startDate: z.string().min(1, 'Tanggal mulai wajib diisi.'),
    endDate: z.string().min(1, 'Tanggal selesai wajib diisi.'),
  })
  .refine((v) => new Date(v.endDate) > new Date(v.startDate), {
    message: 'Tanggal selesai harus setelah tanggal mulai.',
    path: ['endDate'],
  })

export interface AcademicYearFormState {
  error?: string
  fields?: Record<string, string>
  success?: boolean
}

export async function createAcademicYearAction(_prev: AcademicYearFormState, formData: FormData): Promise<AcademicYearFormState> {
  const user = await requireAdminStaff()
  const parsed = aySchema.safeParse({
    name: formData.get('name'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
  })
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form')
      if (!fields[key]) fields[key] = issue.message
    }
    return { error: 'Periksa kembali data yang diisi.', fields }
  }

  try {
    // Hanya satu tahun ajaran aktif (PRD §11.1): baru dibuat sebagai PLANNED
    const ay = await db.academicYear.create({
      data: { ...parsed.data, status: 'PLANNED' },
    })
    await audit({ userId: user.id, action: 'ACADEMIC_YEAR_CREATE', entityType: 'AcademicYear', entityId: ay.id, afterJson: JSON.stringify({ name: ay.name }) })
    revalidatePath('/tahun-ajaran')
    return { success: true }
  } catch (err: unknown) {
    if (String(err).includes('Unique')) return { error: 'Tahun ajaran sudah ada.', fields: { name: 'Sudah terdaftar.' } }
    console.error('[academic-years] create gagal:', err)
    return { error: 'Gagal menyimpan tahun ajaran.' }
  }
}

export async function activateAcademicYearAction(formData: FormData): Promise<void> {
  const user = await getSessionUser()
  if (!user || user.role !== 'ADMIN') return

  const id = Number(formData.get('id'))
  if (!Number.isInteger(id)) return

  const ay = await db.academicYear.findUnique({ where: { id } })
  if (!ay || ay.status === 'CLOSED') return

  await db.$transaction([
    db.academicYear.updateMany({ where: { status: 'ACTIVE' }, data: { status: 'CLOSED' } }),
    db.academicYear.update({ where: { id }, data: { status: 'ACTIVE' } }),
  ])
  await audit({ userId: user.id, action: 'ACADEMIC_YEAR_ACTIVATE', entityType: 'AcademicYear', entityId: id, afterJson: JSON.stringify({ name: ay.name }) })
  revalidatePath('/tahun-ajaran')
}

export async function listAcademicYears() {
  await requireAdminStaff()
  return db.academicYear.findMany({
    include: { _count: { select: { classes: true, enrollments: true } } },
    orderBy: { name: 'desc' },
  })
}
