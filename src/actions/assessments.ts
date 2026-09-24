'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db/db'
import { getSessionUser } from '@/lib/auth/guard'
import { audit } from '@/lib/auth/rate-limit'

const assessmentSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  classId: z.coerce.number().int().positive(),
  period: z.string().trim().min(1, 'Periode wajib diisi.').max(50),
  domainId: z.coerce.number().int().positive('Domain wajib dipilih.'),
  scaleId: z.coerce.number().int().positive('Skala wajib dipilih.'),
  narrative: z.string().trim().max(1000, 'Narasi maksimal 1000 karakter.').optional().or(z.literal('')),
})

export interface AssessmentState {
  error?: string
  success?: boolean
}

async function assertTeacherClass(classId: number): Promise<{ userId: number } | null> {
  const user = await getSessionUser()
  if (!user) return null
  if (user.role === 'ADMIN' || user.role === 'STAFF') return { userId: user.id }
  if (user.role === 'TEACHER') {
    const teacher = await db.teacher.findUnique({ where: { userId: user.id } })
    if (!teacher) return null
    const klass = await db.class.findUnique({ where: { id: classId } })
    if (klass?.teacherId !== teacher.id) return null
    return { userId: user.id }
  }
  return null
}

/** Upsert satu penilaian (unique per student+year+period+domain, PRD §13.3). */
export async function saveAssessmentAction(_prev: AssessmentState, formData: FormData): Promise<AssessmentState> {
  const parsed = assessmentSchema.safeParse({
    studentId: formData.get('studentId'),
    classId: formData.get('classId'),
    period: formData.get('period'),
    domainId: formData.get('domainId'),
    scaleId: formData.get('scaleId'),
    narrative: formData.get('narrative'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Periksa kembali data.' }
  }

  const access = await assertTeacherClass(parsed.data.classId)
  if (!access) return { error: 'Anda tidak memiliki akses ke kelas ini.' }

  // student harus enrolled di kelas tsb
  const enrollment = await db.enrollment.findFirst({
    where: { studentId: parsed.data.studentId, classId: parsed.data.classId },
  })
  if (!enrollment) return { error: 'Siswa tidak terdaftar di kelas ini.' }

  try {
    const existing = await db.assessment.findUnique({
      where: {
        studentId_academicYearId_period_domainId: {
          studentId: parsed.data.studentId,
          academicYearId: enrollment.academicYearId,
          period: parsed.data.period,
          domainId: parsed.data.domainId,
        },
      },
    })

    const data = {
      scaleId: parsed.data.scaleId,
      narrative: parsed.data.narrative || null,
      teacherNote: null,
      updatedAt: new Date(),
    }

    if (existing) {
      await db.assessment.update({ where: { id: existing.id }, data })
    } else {
      await db.assessment.create({
        data: {
          studentId: parsed.data.studentId,
          academicYearId: enrollment.academicYearId,
          classId: parsed.data.classId,
          period: parsed.data.period,
          domainId: parsed.data.domainId,
          createdBy: access.userId,
          ...data,
        },
      })
    }
    await audit({
      userId: access.userId, action: existing ? 'ASSESSMENT_UPDATE' : 'ASSESSMENT_CREATE',
      entityType: 'Student', entityId: parsed.data.studentId,
      afterJson: JSON.stringify({ period: parsed.data.period, domainId: parsed.data.domainId }),
    })
    revalidatePath('/penilaian')
    revalidatePath('/guru/penilaian')
    return { success: true }
  } catch (err) {
    console.error('[assessment] gagal:', err)
    return { error: 'Gagal menyimpan penilaian.' }
  }
}

export async function getAssessmentOptions() {
  const [domains, scales, periods] = await Promise.all([
    db.assessmentDomain.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    db.assessmentScale.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    Promise.resolve(['Semester 1', 'Semester 2']),
  ])
  return { domains, scales, periods }
}
