'use server'

import { z } from 'zod'
import { db } from '@/lib/db/db'
import { audit } from '@/lib/auth/rate-limit'

const schema = z.object({
  childFullName: z.string().min(3, 'Nama anak minimal 3 karakter.').max(150),
  childGender: z.enum(['L', 'P'], { message: 'Pilih jenis kelamin.' }),
  childBirthPlace: z.string().min(2, 'Tempat lahir wajib diisi.').max(100),
  childBirthDate: z.string().min(8, 'Tanggal lahir wajib diisi.'),
  parentName: z.string().min(3, 'Nama orang tua/wali minimal 3 karakter.').max(150),
  relationship: z.enum(['AYAH', 'IBU', 'WALI'], { message: 'Pilih hubungan.' }),
  phone: z.string().regex(/^(\+62|62|0)8[0-9]{7,13}$/, 'Format nomor HP tidak valid.'),
  email: z.string().email('Email tidak valid.').optional().or(z.literal('')),
  address: z.string().min(5, 'Alamat minimal 5 karakter.').max(500),
  notes: z.string().max(500).optional().or(z.literal('')),
})

export type PpdbState = {
  error?: string
  fieldErrors?: Record<string, string[]>
  success?: boolean
  regNo?: string
}

export async function submitAdmissionAction(_prev: PpdbState, formData: FormData): Promise<PpdbState> {
  const raw = Object.fromEntries(formData.entries())
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }
  const d = parsed.data
  const birthDate = new Date(d.childBirthDate)
  if (Number.isNaN(birthDate.getTime())) return { error: 'Tanggal lahir tidak valid.' }

  // Usia 4-6 tahun saat mendaftar
  const now = new Date()
  const ageYears = (now.getTime() - birthDate.getTime()) / (365.25 * 24 * 3600 * 1000)
  if (ageYears < 4 || ageYears > 6) {
    return { error: 'Usia anak harus antara 4 dan 6 tahun pada saat pendaftaran.' }
  }

  // Periode PPDB aktif?
  const period = await db.admissionPeriod.findFirst({ where: { isActive: true } })
  if (!period) {
    return { error: 'Pendaftaran online sedang ditutup. Silakan hubungi sekolah.' }
  }
  if (period.startDate > now || period.endDate < now) {
    return { error: 'Di luar periode pendaftaran. Hubungi sekolah untuk info.' }
  }

  try {
    const count = await db.admission.count()
    const regNo = `PPDB/${period.name.replace(/\s+/g, '').toUpperCase()}/${String(count + 1).padStart(4, '0')}`

    await db.$transaction(async (tx) => {
      const admission = await tx.admission.create({
        data: {
          applicationNo: regNo,
          admissionPeriodId: period.id,
          studentFullName: d.childFullName,
          studentGender: d.childGender,
          studentBirthPlace: d.childBirthPlace,
          studentBirthDate: birthDate,
          guardianName: d.parentName,
          guardianRelationship: d.relationship,
          guardianPhone: d.phone,
          guardianEmail: d.email || null,
          guardianAddress: d.address,
          notes: d.notes || null,
          status: 'SUBMITTED',
        },
      })
      await audit({ userId: null, action: 'CREATE', entityType: 'Admission', entityId: admission.id, afterJson: `PPDB online: ${d.childFullName}` })
    })

    return { success: true, regNo }
  } catch {
    return { error: 'Gagal menyimpan pendaftaran. Coba lagi atau hubungi sekolah.' }
  }
}
