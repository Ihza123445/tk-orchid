'use server'

import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { z } from 'zod'
import { db } from '@/lib/db/db'
import { requireAdminStaff, getSessionUser } from '@/lib/auth/guard'
import { audit } from '@/lib/auth/rate-limit'

const guardianSchema = z.object({
  fullName: z.string().trim().min(2, 'Nama lengkap wajib diisi.').max(120),
  relationship: z.enum(['AYAH', 'IBU', 'WALI', 'LAINNYA'], { message: 'Hubungan wajib dipilih.' }),
  phone: z.string().trim().min(8, 'Nomor telepon wajib diisi.').max(20),
  email: z.string().trim().email('Format email tidak valid.').optional().or(z.literal('')),
  occupation: z.string().trim().max(100).optional().or(z.literal('')),
  address: z.string().trim().max(255).optional().or(z.literal('')),
  createAccount: z.boolean().optional(),
})

export interface GuardianFormState {
  error?: string
  fields?: Record<string, string>
  success?: boolean
  guardianId?: number
}

function collectFields(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    if (!fields[key]) fields[key] = issue.message
  }
  return fields
}

export async function createGuardianAction(_prev: GuardianFormState, formData: FormData): Promise<GuardianFormState> {
  const user = await requireAdminStaff()

  const parsed = guardianSchema.safeParse({
    fullName: formData.get('fullName'),
    relationship: formData.get('relationship'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    occupation: formData.get('occupation'),
    address: formData.get('address'),
    createAccount: formData.get('createAccount') === 'on',
  })
  if (!parsed.success) return { error: 'Periksa kembali data yang diisi.', fields: collectFields(parsed.error) }
  const data = parsed.data

  try {
    let userId: number | undefined
    if (data.createAccount) {
      if (!data.email) {
        return { error: 'Email wajib diisi untuk membuat akun.', fields: { email: 'Email wajib untuk akun.' } }
      }
      const dup = await db.user.findUnique({ where: { email: data.email } })
      if (dup) return { error: 'Email sudah dipakai akun lain.', fields: { email: 'Email sudah terdaftar.' } }
      // password awal random; reset via fitur lupa password
      const tempPassword = crypto.randomBytes(12).toString('base64url')
      const hash = await bcrypt.hash(tempPassword, 12)
      const newUser = await db.user.create({
        data: { name: data.fullName, email: data.email, passwordHash: hash, role: 'PARENT' },
      })
      userId = newUser.id
    }

    const guardian = await db.guardian.create({
      data: {
        userId: userId ?? null,
        fullName: data.fullName,
        relationship: data.relationship,
        phone: data.phone,
        email: data.email || null,
        occupation: data.occupation || null,
        address: data.address || null,
        notes: 'input manual',
      },
    })
    await audit({ userId: user.id, action: 'GUARDIAN_CREATE', entityType: 'Guardian', entityId: guardian.id, afterJson: JSON.stringify({ fullName: guardian.fullName }) })
    revalidatePath('/wali')
    return { success: true, guardianId: guardian.id }
  } catch (err) {
    console.error('[guardians] create gagal:', err)
    return { error: 'Gagal menyimpan data wali.' }
  }
}

/** Hubungkan siswa <-> wali */
export async function linkStudentGuardianAction(formData: FormData): Promise<void> {
  const user = await getSessionUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) return

  const studentId = Number(formData.get('studentId'))
  const guardianId = Number(formData.get('guardianId'))
  const isPrimary = formData.get('isPrimary') === 'on'
  if (!Number.isInteger(studentId) || !Number.isInteger(guardianId)) return

  const [student, guardian] = await Promise.all([
    db.student.findUnique({ where: { id: studentId } }),
    db.guardian.findUnique({ where: { id: guardianId } }),
  ])
  if (!student || !guardian) return

  const existing = await db.studentGuardian.findUnique({
    where: { studentId_guardianId: { studentId, guardianId } },
  })
  if (existing) return

  if (isPrimary) {
    await db.studentGuardian.updateMany({ where: { studentId }, data: { isPrimary: false } })
  }
  await db.studentGuardian.create({ data: { studentId, guardianId, isPrimary } })
  await audit({
    userId: user.id, action: 'GUARDIAN_LINK', entityType: 'Student',
    entityId: studentId,
    afterJson: JSON.stringify({ guardianId, isPrimary }),
  })
  revalidatePath(`/siswa/${studentId}`)
  revalidatePath('/wali')
}

export async function listGuardians(opts: { page?: number; search?: string }) {
  await requireAdminStaff()
  const page = Math.max(1, opts.page ?? 1)
  const pageSize = 20
  const where = opts.search
    ? { OR: [{ fullName: { contains: opts.search } }, { phone: { contains: opts.search } }] }
    : {}
  const [total, rows] = await Promise.all([
    db.guardian.count({ where }),
    db.guardian.findMany({
      where,
      include: { user: { select: { email: true, isActive: true } }, studentGuardians: { include: { student: { select: { fullName: true } } } } },
      orderBy: { fullName: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])
  return { total, page, pageSize, rows }
}
