'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db/db'
import { getSessionUser, requireAuth } from '@/lib/auth/guard'
import { audit } from '@/lib/auth/rate-limit'

const ATT_STATUSES = ['PRESENT', 'SICK', 'PERMISSION', 'ABSENT'] as const

type AttStatus = (typeof ATT_STATUSES)[number]

interface Row {
  studentId: number
  fullName: string
  studentCode: string
  gender: string
  status: AttStatus | null
  note: string | null
}

const bulkSchema = z.object({
  classId: z.coerce.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal tidak valid.'),
  entries: z.array(
    z.object({
      studentId: z.coerce.number().int().positive(),
      status: z.enum(ATT_STATUSES),
      note: z.string().max(200).optional(),
    })
  ).min(1, 'Tidak ada data presensi.'),
})

export interface BulkResult {
  success?: boolean
  error?: string
  saved?: number
}

/** Cek akses kelas: admin/staff semua, guru hanya homeroom-nya. */
async function assertClassAccess(classId: number): Promise<{ userId: number; allowed: boolean } | null> {
  const user = await getSessionUser()
  if (!user) return null
  if (user.role === 'ADMIN' || user.role === 'STAFF') return { userId: user.id, allowed: true }
  if (user.role === 'TEACHER') {
    const teacher = await db.teacher.findUnique({ where: { userId: user.id } })
    if (!teacher) return null
    const klass = await db.class.findUnique({ where: { id: classId } })
    return { userId: user.id, allowed: klass?.teacherId === teacher.id }
  }
  return null
}

export async function saveAttendanceAction(_prev: BulkResult, formData: FormData): Promise<BulkResult> {
  const raw = formData.get('payload')
  if (typeof raw !== 'string') return { error: 'Data tidak lengkap.' }

  let parsedJson: unknown
  try {
    parsedJson = JSON.parse(raw)
  } catch {
    return { error: 'Format data tidak valid.' }
  }

  const parsed = bulkSchema.safeParse(parsedJson)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Periksa kembali data presensi.' }
  }
  const { classId, entries } = parsed.data

  const access = await assertClassAccess(classId)
  if (!access) return { error: 'Anda tidak memiliki akses.' }
  if (!access.allowed) return { error: 'Kelas ini bukan assignment Anda.' }

  // Validasi tanggal dalam rentang tahun ajaran aktif kelas (PRD §12.3)
  const klass = await db.class.findUnique({ where: { id: classId }, include: { academicYear: true } })
  if (!klass) return { error: 'Kelas tidak ditemukan.' }
  const date = new Date(`${parsed.data.date}T00:00:00`)
  if (date < klass.academicYear.startDate || date > klass.academicYear.endDate) {
    return { error: 'Tanggal di luar periode tahun ajaran.' }
  }

  // Hanya siswa yang terdaftar di kelas ini boleh dipresensi
  const enrolled = await db.enrollment.findMany({
    where: { classId, academicYearId: klass.academicYearId },
    select: { studentId: true },
  })
  const enrolledIds = new Set(enrolled.map((e) => e.studentId))
  const invalid = entries.filter((e) => !enrolledIds.has(e.studentId))
  if (invalid.length > 0) return { error: 'Ada siswa yang tidak terdaftar di kelas ini.' }

  try {
    const saved = await db.$transaction(async (tx) => {
      let count = 0
      for (const entry of entries) {
        const existing = await tx.attendance.findUnique({
          where: { studentId_attendanceDate: { studentId: entry.studentId, attendanceDate: date } },
        })
        if (existing) {
          await tx.attendance.update({ where: { id: existing.id }, data: { status: entry.status, note: entry.note ?? null, recordedBy: access.userId, updatedAt: new Date() } })
        } else {
          await tx.attendance.create({
            data: {
              studentId: entry.studentId,
              classId,
              attendanceDate: date,
              status: entry.status,
              note: entry.note ?? null,
              recordedBy: access.userId,
            },
          })
        }
        count++
      }
      return count
    })

    await audit({
      userId: access.userId,
      action: 'ATTENDANCE_BULK_SAVE',
      entityType: 'Class',
      entityId: classId,
      afterJson: JSON.stringify({ date: parsed.data.date, total: saved }),
    })
    revalidatePath('/presensi')
    revalidatePath('/guru/presensi')
    return { success: true, saved }
  } catch (err) {
    console.error('[attendance] gagal simpan:', err)
    return { error: 'Gagal menyimpan presensi.' }
  }
}

/** Muat roster + presensi existing untuk kelas+tanggal. */
export async function loadRosterAction(classId: number, dateStr: string) {
  await requireAuth()
  const access = await assertClassAccess(classId)
  if (!access || !access.allowed) return { allowed: false as const }

  const date = new Date(`${dateStr}T00:00:00`)
  const enrollments = await db.enrollment.findMany({
    where: { classId },
    include: { student: { select: { id: true, fullName: true, studentCode: true, gender: true } } },
    orderBy: { student: { fullName: 'asc' } },
  })
  const existing = await db.attendance.findMany({ where: { classId, attendanceDate: date } })
  const byStudent = new Map(existing.map((a) => [a.studentId, a]))

  return {
    allowed: true as const,
    rows: enrollments.map((e) => ({
      studentId: e.student.id,
      fullName: e.student.fullName,
      studentCode: e.student.studentCode,
      gender: e.student.gender,
      status: (byStudent.get(e.student.id)?.status ?? null) as Row['status'],
      note: byStudent.get(e.student.id)?.note ?? null,
    })),
  }
}
