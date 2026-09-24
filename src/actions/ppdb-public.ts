'use server'

import { z } from 'zod'
import crypto from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db/db'
import { audit } from '@/lib/auth/rate-limit'
import { LEVELS, MAX_AGE, MIN_AGE, ageAt, ageReferenceDate, findLevel, formatAge, formatReferenceDate, levelForAge, parseBirthDate } from '@/lib/ppdb/levels'

const schema = z.object({
  childFullName: z.string().trim().min(3, 'Nama anak minimal 3 karakter.').max(150),
  childGender: z.enum(['L', 'P'], { message: 'Pilih jenis kelamin.' }),
  childBirthPlace: z.string().trim().min(2, 'Tempat lahir wajib diisi.').max(100),
  childBirthDate: z.string().min(8, 'Tanggal lahir wajib diisi.'),
  preferredLevel: z.enum(LEVELS.map((level) => level.value) as [string, ...string[]], { message: 'Pilih jenjang yang dituju.' }),
  previousSchool: z.string().trim().max(150).optional().or(z.literal('')),
  parentName: z.string().trim().min(3, 'Nama orang tua/wali minimal 3 karakter.').max(150),
  relationship: z.enum(['AYAH', 'IBU', 'WALI'], { message: 'Pilih hubungan.' }),
  phone: z.string().trim().transform((value) => value.replace(/[\s-]/g, '')).pipe(z.string().regex(/^(\+62|62|0)8[0-9]{7,13}$/, 'Format nomor HP tidak valid. Contoh: 081234567890.')),
  email: z.string().trim().email('Email tidak valid.').optional().or(z.literal('')),
  address: z.string().trim().min(5, 'Alamat minimal 5 karakter.').max(500),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
})

export type PpdbState = {
  error?: string
  fieldErrors?: Record<string, string[]>
  success?: boolean
  regNo?: string
  levelLabel?: string
}

/** Simpan nomor HP dalam format 08xxxxxxxxxx agar seragam. */
function normalizePhone(phone: string) {
  if (phone.startsWith('+62')) return `0${phone.slice(3)}`
  if (phone.startsWith('62')) return `0${phone.slice(2)}`
  return phone
}

export async function submitAdmissionAction(_prev: PpdbState, formData: FormData): Promise<PpdbState> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) {
    return { error: 'Periksa kembali isian yang ditandai.', fieldErrors: parsed.error.flatten().fieldErrors }
  }
  const d = parsed.data

  const now = new Date()
  const period = await db.admissionPeriod.findFirst({ where: { isActive: true } })
  if (!period) return { error: 'Pendaftaran online sedang ditutup. Silakan hubungi sekolah.' }
  if (period.startDate > now || period.endDate < now) return { error: 'Di luar periode pendaftaran. Hubungi sekolah untuk info.' }

  const birthDate = parseBirthDate(d.childBirthDate)
  if (!birthDate || birthDate > now) return { error: 'Periksa kembali isian yang ditandai.', fieldErrors: { childBirthDate: ['Tanggal lahir tidak valid.'] } }

  // Usia dihitung pada awal tahun ajaran (1 Juli), bukan pada hari mendaftar
  const reference = ageReferenceDate(period.endDate)
  const age = ageAt(birthDate, reference)
  const level = findLevel(d.preferredLevel)!
  const suitable = levelForAge(age.years)
  const when = `per ${formatReferenceDate(reference)}`
  if (!suitable) {
    return {
      error: 'Periksa kembali isian yang ditandai.',
      fieldErrors: {
        childBirthDate: [`Usia anak ${when} adalah ${formatAge(age)}. TK Orchid menerima anak usia ${MIN_AGE}–${MAX_AGE - 1} tahun.`],
      },
    }
  }
  if (suitable.value !== level.value) {
    return {
      error: 'Periksa kembali isian yang ditandai.',
      fieldErrors: {
        preferredLevel: [`Usia anak ${when} adalah ${formatAge(age)}, sesuai untuk ${suitable.label}. Silakan pilih jenjang tersebut.`],
      },
    }
  }

  // Cegah pendaftaran ganda untuk anak yang sama pada periode yang sama
  const duplicate = await db.admission.findFirst({
    where: {
      admissionPeriodId: period.id,
      studentBirthDate: birthDate,
      studentFullName: d.childFullName,
      status: { not: 'REJECTED' },
    },
    select: { applicationNo: true },
  })
  if (duplicate) {
    return { error: `Anak ini sudah terdaftar pada periode ini dengan nomor ${duplicate.applicationNo}. Hubungi sekolah bila ada perubahan data.` }
  }

  try {
    const datePart = now.toISOString().slice(0, 10).replaceAll('-', '')
    const regNo = `PPDB-${reference.getUTCFullYear()}-${datePart}-${crypto.randomInt(100000, 1000000)}`

    const admission = await db.admission.create({
      data: {
        applicationNo: regNo,
        admissionPeriodId: period.id,
        studentFullName: d.childFullName,
        studentGender: d.childGender,
        studentBirthPlace: d.childBirthPlace,
        studentBirthDate: birthDate,
        preferredLevel: level.value,
        previousSchool: d.previousSchool || null,
        guardianName: d.parentName,
        guardianRelationship: d.relationship,
        guardianPhone: normalizePhone(d.phone),
        guardianEmail: d.email || null,
        guardianAddress: d.address,
        notes: d.notes || null,
        status: 'SUBMITTED',
        submittedAt: now,
      },
    })
    await audit({ userId: null, action: 'CREATE', entityType: 'Admission', entityId: admission.id, afterJson: `PPDB online: ${d.childFullName} (${level.value})` })
    revalidatePath('/ppdb')
    revalidatePath('/dashboard')

    return { success: true, regNo, levelLabel: level.label }
  } catch (err) {
    console.error('[ppdb] simpan pendaftaran gagal:', err)
    return { error: 'Gagal menyimpan pendaftaran. Coba lagi atau hubungi sekolah.' }
  }
}
