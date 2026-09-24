'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db/db'
import { requireAdminStaff, getSessionUser } from '@/lib/auth/guard'
import { audit } from '@/lib/auth/rate-limit'

const studentSchema = z.object({
  fullName: z.string().trim().min(2, 'Nama lengkap wajib diisi (2-120 karakter).').max(120),
  nickname: z.string().trim().max(50).optional().or(z.literal('')),
  gender: z.enum(['L', 'P'], { message: 'Jenis kelamin wajib dipilih.' }),
  birthPlace: z.string().trim().max(100).optional().or(z.literal('')),
  birthDate: z.string().min(1, 'Tanggal lahir wajib diisi.').refine((v) => {
    const d = new Date(v)
    return !isNaN(d.getTime()) && d <= new Date()
  }, 'Tanggal lahir tidak valid atau di masa depan.'),
  address: z.string().trim().max(255).optional().or(z.literal('')),
  city: z.string().trim().max(100).optional().or(z.literal('')),
  province: z.string().trim().max(100).optional().or(z.literal('')),
  religion: z.string().trim().max(50).optional().or(z.literal('')),
  nis: z.string().trim().max(20).optional().or(z.literal('')),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
})

export interface StudentFormState {
  error?: string
  fields?: Record<string, string>
  success?: boolean
  studentId?: number
}

function collectFields(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    if (!fields[key]) fields[key] = issue.message
  }
  return fields
}

async function nextStudentCode(): Promise<string> {
  const year = new Date().getFullYear()
  const count = await db.student.count()
  return `STD-${year}-${String(count + 1).padStart(3, '0')}`
}

export async function createStudentAction(_prev: StudentFormState, formData: FormData): Promise<StudentFormState> {
  const user = await requireAdminStaff()

  const parsed = studentSchema.safeParse({
    fullName: formData.get('fullName'),
    nickname: formData.get('nickname'),
    gender: formData.get('gender'),
    birthPlace: formData.get('birthPlace'),
    birthDate: formData.get('birthDate'),
    address: formData.get('address'),
    city: formData.get('city'),
    province: formData.get('province'),
    religion: formData.get('religion'),
    nis: formData.get('nis'),
    notes: formData.get('notes'),
  })
  if (!parsed.success) {
    return { error: 'Periksa kembali data yang diisi.', fields: collectFields(parsed.error) }
  }
  const data = parsed.data

  // NIS unik jika diisi
  if (data.nis) {
    const dup = await db.student.findUnique({ where: { nis: data.nis } })
    if (dup) return { error: 'NIS sudah digunakan siswa lain.', fields: { nis: 'NIS sudah terdaftar.' } }
  }

  try {
    const student = await db.student.create({
      data: {
        studentCode: await nextStudentCode(),
        nis: data.nis || null,
        fullName: data.fullName,
        nickname: data.nickname || null,
        gender: data.gender,
        birthPlace: data.birthPlace || null,
        birthDate: new Date(data.birthDate),
        address: data.address || null,
        city: data.city || null,
        province: data.province || null,
        religion: data.religion || null,
        status: 'ACTIVE',
        admissionDate: new Date(),
        notes: [data.notes, 'input manual'].filter(Boolean).join(' | '),
      },
    })
    await audit({
      userId: user.id,
      action: 'STUDENT_CREATE',
      entityType: 'Student',
      entityId: student.id,
      afterJson: JSON.stringify({ studentCode: student.studentCode, fullName: student.fullName }),
    })
    revalidatePath('/siswa')
    return { success: true, studentId: student.id }
  } catch (err) {
    console.error('[students] create gagal:', err)
    return { error: 'Gagal menyimpan data siswa. Coba lagi.' }
  }
}

const updateSchema = studentSchema.partial().extend({ id: z.coerce.number().int().positive() })

export async function updateStudentAction(_prev: StudentFormState, formData: FormData): Promise<StudentFormState> {
  const user = await requireAdminStaff()
  const parsed = updateSchema.safeParse({
    id: formData.get('id'),
    fullName: formData.get('fullName'),
    nickname: formData.get('nickname'),
    gender: formData.get('gender'),
    birthPlace: formData.get('birthPlace'),
    birthDate: formData.get('birthDate'),
    address: formData.get('address'),
    city: formData.get('city'),
    province: formData.get('province'),
    religion: formData.get('religion'),
    nis: formData.get('nis'),
    notes: formData.get('notes'),
  })
  if (!parsed.success) {
    return { error: 'Periksa kembali data yang diisi.', fields: collectFields(parsed.error) }
  }
  const { id, ...rest } = parsed.data
  const existing = await db.student.findUnique({ where: { id } })
  if (!existing) return { error: 'Siswa tidak ditemukan.' }

  if (rest.nis) {
    const duplicate = await db.student.findFirst({ where: { nis: rest.nis, id: { not: id } }, select: { id: true } })
    if (duplicate) return { error: 'NIS sudah digunakan siswa lain.', fields: { nis: 'NIS sudah terdaftar.' } }
  }

  try {
    const student = await db.student.update({
      where: { id },
      data: {
        ...(rest.fullName !== undefined ? { fullName: rest.fullName } : {}),
        ...(rest.nickname !== undefined ? { nickname: rest.nickname || null } : {}),
        ...(rest.gender !== undefined ? { gender: rest.gender } : {}),
        ...(rest.birthPlace !== undefined ? { birthPlace: rest.birthPlace || null } : {}),
        ...(rest.birthDate ? { birthDate: new Date(rest.birthDate) } : {}),
        ...(rest.address !== undefined ? { address: rest.address || null } : {}),
        ...(rest.city !== undefined ? { city: rest.city || null } : {}),
        ...(rest.province !== undefined ? { province: rest.province || null } : {}),
        ...(rest.religion !== undefined ? { religion: rest.religion || null } : {}),
        ...(rest.nis !== undefined ? { nis: rest.nis || null } : {}),
        ...(rest.notes !== undefined ? { notes: rest.notes || null } : {}),
      },
    })
    await audit({
      userId: user.id,
      action: 'STUDENT_UPDATE',
      entityType: 'Student',
      entityId: id,
      beforeJson: JSON.stringify({ fullName: existing.fullName, status: existing.status }),
      afterJson: JSON.stringify({ fullName: student.fullName }),
    })
    revalidatePath('/siswa')
    revalidatePath(`/siswa/${id}`)
    return { success: true, studentId: id }
  } catch (err) {
    console.error('[students] update gagal:', err)
    return { error: 'Gagal memperbarui data siswa.' }
  }
}

/** Deaktivasi (bukan delete permanen — PRD §43/§54.9). */
export async function deactivateStudentAction(formData: FormData): Promise<void> {
  const user = await getSessionUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) return

  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) return

  const existing = await db.student.findUnique({ where: { id } })
  if (!existing) return

  await db.student.update({ where: { id }, data: { status: 'INACTIVE', withdrawalDate: new Date() } })
  await audit({
    userId: user.id,
    action: 'STUDENT_DEACTIVATE',
    entityType: 'Student',
    entityId: id,
    beforeJson: JSON.stringify({ status: existing.status }),
    afterJson: JSON.stringify({ status: 'INACTIVE' }),
  })
  revalidatePath('/siswa')
}

/** Query list siswa dengan search/sort/pagination server-side (PRD §33). */
export async function listStudents(opts: {
  page?: number
  pageSize?: number
  search?: string
  status?: string
}) {
  await requireAdminStaff()
  const page = Math.max(1, opts.page ?? 1)
  const pageSize = Math.min(100, Math.max(10, opts.pageSize ?? 20))
  const where = {
    AND: [
      opts.search
        ? { OR: [{ fullName: { contains: opts.search } }, { studentCode: { contains: opts.search } }, { nis: { contains: opts.search } }] }
        : {},
      opts.status ? { status: opts.status } : {},
    ],
  }
  const [total, rows] = await Promise.all([
    db.student.count({ where }),
    db.student.findMany({
      where,
      include: {
        enrollments: { include: { klass: { select: { name: true } } }, orderBy: { id: 'desc' }, take: 1 },
        studentGuardians: { include: { guardian: { select: { fullName: true } } }, take: 1 },
      },
      orderBy: { fullName: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])
  return { total, page, pageSize, rows }
}
