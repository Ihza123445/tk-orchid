'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db/db'
import { requireAdminStaff, getSessionUser } from '@/lib/auth/guard'
import { audit } from '@/lib/auth/rate-limit'

const classSchema = z.object({
  academicYearId: z.coerce.number().int().positive('Tahun ajaran wajib dipilih.'),
  code: z.string().trim().min(1, 'Kode kelas wajib diisi.').max(20),
  name: z.string().trim().min(2, 'Nama kelas wajib diisi.').max(100),
  level: z.string().trim().min(1, 'Level/kelompok wajib diisi.').max(50),
  room: z.string().trim().max(50).optional().or(z.literal('')),
  teacherId: z.coerce.number().int().positive().optional(),
  capacity: z.coerce.number().int().min(1, 'Kapasitas minimal 1.').max(60, 'Kapasitas maksimal 60.'),
})

export interface ClassFormState {
  error?: string
  fields?: Record<string, string>
  success?: boolean
  classId?: number
}

function collectFields(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    if (!fields[key]) fields[key] = issue.message
  }
  return fields
}

export async function createClassAction(_prev: ClassFormState, formData: FormData): Promise<ClassFormState> {
  const user = await requireAdminStaff()
  const parsed = classSchema.safeParse({
    academicYearId: formData.get('academicYearId'),
    code: formData.get('code'),
    name: formData.get('name'),
    level: formData.get('level'),
    room: formData.get('room'),
    teacherId: formData.get('teacherId') || undefined,
    capacity: formData.get('capacity'),
  })
  if (!parsed.success) return { error: 'Periksa kembali data yang diisi.', fields: collectFields(parsed.error) }
  const data = parsed.data

  try {
    const klass = await db.class.create({
      data: {
        academicYearId: data.academicYearId,
        code: data.code,
        name: data.name,
        level: data.level,
        room: data.room || null,
        teacherId: data.teacherId ?? null,
        capacity: data.capacity,
        status: 'ACTIVE',
      },
    })
    await audit({ userId: user.id, action: 'CLASS_CREATE', entityType: 'Class', entityId: klass.id, afterJson: JSON.stringify({ code: klass.code, name: klass.name }) })
    revalidatePath('/kelas')
    return { success: true, classId: klass.id }
  } catch (err: unknown) {
    if (String(err).includes('Unique')) {
      return { error: 'Kode kelas sudah dipakai di tahun ajaran ini.', fields: { code: 'Kode sudah ada.' } }
    }
    console.error('[classes] create gagal:', err)
    return { error: 'Gagal menyimpan kelas.' }
  }
}

/** Pindahkan siswa ke kelas (buat enrollment tahun aktif) */
const enrollSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  classId: z.coerce.number().int().positive(),
})

export async function enrollStudentAction(formData: FormData): Promise<void> {
  const user = await getSessionUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) return

  const parsed = enrollSchema.safeParse({ studentId: formData.get('studentId'), classId: formData.get('classId') })
  if (!parsed.success) return

  const klass = await db.class.findUnique({ where: { id: parsed.data.classId }, include: { _count: { select: { enrollments: true } } } })
  if (!klass) return
  if (klass._count.enrollments >= klass.capacity) return // penuh

  const student = await db.student.findUnique({ where: { id: parsed.data.studentId } })
  if (!student) return

  try {
    await db.enrollment.create({
      data: {
        studentId: parsed.data.studentId,
        academicYearId: klass.academicYearId,
        classId: klass.id,
        enrollmentDate: new Date(),
        status: 'ACTIVE',
        notes: 'enrollment manual',
      },
    })
    await audit({
      userId: user.id, action: 'ENROLLMENT_CREATE', entityType: 'Student', entityId: parsed.data.studentId,
      afterJson: JSON.stringify({ classId: klass.id }),
    })
    revalidatePath(`/kelas/${klass.id}`)
    revalidatePath('/siswa')
  } catch (err: unknown) {
    // unique(studentId, academicYearId) — sudah terdaftar di tahun ini
    if (!String(err).includes('Unique')) console.error('[enrollment] gagal:', err)
  }
}

export async function listClasses(opts: { academicYearId?: number }) {
  await requireAdminStaff()
  return db.class.findMany({
    where: opts.academicYearId ? { academicYearId: opts.academicYearId } : {},
    include: {
      academicYear: { select: { name: true, status: true } },
      teacher: { select: { fullName: true } },
      _count: { select: { enrollments: true, schedules: true } },
    },
    orderBy: [{ academicYearId: 'desc' }, { code: 'asc' }],
  })
}
