'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db/db'
import { getSessionUser } from '@/lib/auth/guard'
import { audit } from '@/lib/auth/rate-limit'

const itemSchema = z.object({
  domainId: z.coerce.number().int().positive(),
  scaleId: z.coerce.number().int().positive(),
  narrative: z.string().trim().max(1000).optional(),
})

const reportSchema = z.object({
  studentId: z.coerce.number().int().positive('Siswa wajib dipilih.'),
  classId: z.coerce.number().int().positive(),
  period: z.string().trim().min(1).max(50),
  summary: z.string().trim().max(2000).optional(),
  homeRecommendation: z.string().trim().max(2000).optional(),
  items: z.array(itemSchema).min(1, 'Minimal satu domain diisi.'),
})

export interface ReportState {
  error?: string
  success?: boolean
  reportId?: number
}

async function assertClassWriteAccess(classId: number): Promise<{ userId: number; teacherId: number | null } | null> {
  const user = await getSessionUser()
  if (!user) return null
  if (user.role === 'ADMIN' || user.role === 'STAFF') return { userId: user.id, teacherId: null }
  if (user.role === 'TEACHER') {
    const teacher = await db.teacher.findUnique({ where: { userId: user.id } })
    if (!teacher) return null
    const klass = await db.class.findUnique({ where: { id: classId } })
    if (klass?.teacherId !== teacher.id) return null
    return { userId: user.id, teacherId: teacher.id }
  }
  return null
}

export async function saveDevelopmentReportAction(_prev: ReportState, formData: FormData): Promise<ReportState> {
  let rawItems: unknown
  try {
    rawItems = JSON.parse(String(formData.get('items') ?? '[]'))
  } catch {
    return { error: 'Format item tidak valid.' }
  }

  const parsed = reportSchema.safeParse({
    studentId: formData.get('studentId'),
    classId: formData.get('classId'),
    period: formData.get('period'),
    summary: formData.get('summary') || undefined,
    homeRecommendation: formData.get('homeRecommendation') || undefined,
    items: rawItems,
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Periksa data laporan.' }

  const access = await assertClassWriteAccess(parsed.data.classId)
  if (!access) return { error: 'Anda tidak memiliki akses ke kelas ini.' }

  const enrollment = await db.enrollment.findFirst({
    where: { studentId: parsed.data.studentId, classId: parsed.data.classId },
  })
  if (!enrollment) return { error: 'Siswa tidak terdaftar di kelas ini.' }
  const ayId = enrollment.academicYearId

  // Domain duplikat ditolak
  const domainIds = new Set(parsed.data.items.map((i) => i.domainId))
  if (domainIds.size !== parsed.data.items.length) return { error: 'Ada domain yang berulang.' }

  try {
    // reportNo unik: RPT-<ay>-<student>-<period>
    const periodSlug = parsed.data.period.replace(/\s+/g, '').toUpperCase()
    const reportNo = `RPT-${ayId}-${parsed.data.studentId}-${periodSlug}`
    const uniqueWhere = {
      studentId_academicYearId_period: {
        studentId: parsed.data.studentId,
        academicYearId: ayId,
        period: parsed.data.period,
      },
    }
    const existing = await db.developmentReport.findUnique({ where: uniqueWhere, select: { status: true } })
    if (existing && existing.status !== 'DRAFT') {
      return { error: 'Laporan yang sudah dikirim untuk review atau diterbitkan tidak dapat diubah.' }
    }

    const report = await db.$transaction(async (tx) => {
      const saved = await tx.developmentReport.upsert({
        where: uniqueWhere,
        create: {
          reportNo,
          studentId: parsed.data.studentId,
          academicYearId: ayId,
          classId: parsed.data.classId,
          period: parsed.data.period,
          summary: parsed.data.summary ?? null,
          homeRecommendation: parsed.data.homeRecommendation ?? null,
          status: 'DRAFT',
          createdBy: access.userId,
          teacherId: access.teacherId,
        },
        update: {
          summary: parsed.data.summary ?? null,
          homeRecommendation: parsed.data.homeRecommendation ?? null,
          reportUpdatedAt: new Date(),
        },
      })

      await tx.developmentItem.deleteMany({ where: { reportId: saved.id } })
      await tx.developmentItem.createMany({
        data: parsed.data.items.map((item, idx) => ({
          reportId: saved.id,
          domainId: item.domainId,
          scaleId: item.scaleId,
          narrative: item.narrative ?? null,
          sortOrder: idx,
        })),
      })
      return saved
    })

    await audit({
      userId: access.userId, action: 'REPORT_SAVE', entityType: 'DevelopmentReport', entityId: report.id,
      afterJson: JSON.stringify({ studentId: parsed.data.studentId, period: parsed.data.period }),
    })
    revalidatePath('/perkembangan')
    revalidatePath('/guru/perkembangan')
    revalidatePath('/portal/perkembangan')
    return { success: true, reportId: report.id }
  } catch (err) {
    console.error('[report] gagal:', err)
    return { error: 'Gagal menyimpan laporan.' }
  }
}

/** Submit ke review (DRAFT → REVIEW). */
export async function submitReportAction(formData: FormData): Promise<void> {
  const user = await getSessionUser()
  if (!user) return
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id)) return

  const report = await db.developmentReport.findUnique({ where: { id } })
  if (!report) return

  const access = await assertClassWriteAccess(report.classId)
  if (!access) return
  if (report.status !== 'DRAFT') return

  await db.developmentReport.update({ where: { id }, data: { status: 'REVIEW' } })
  await audit({ userId: user.id, action: 'REPORT_SUBMIT', entityType: 'DevelopmentReport', entityId: id })
  revalidatePath('/perkembangan')
  revalidatePath('/guru/perkembangan')
}

/** Publish (REVIEW → PUBLISHED), hanya admin/staff. */
export async function publishReportAction(formData: FormData): Promise<void> {
  const user = await getSessionUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) return
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id)) return

  const report = await db.developmentReport.findUnique({ where: { id } })
  if (!report || report.status !== 'REVIEW') return

  await db.developmentReport.update({
    where: { id },
    data: { status: 'PUBLISHED', publishedBy: user.id, publishedAt: new Date() },
  })
  await audit({ userId: user.id, action: 'REPORT_PUBLISH', entityType: 'DevelopmentReport', entityId: id })
  revalidatePath('/perkembangan')
  revalidatePath('/portal/perkembangan')
}
