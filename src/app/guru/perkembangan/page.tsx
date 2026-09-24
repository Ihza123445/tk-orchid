import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { submitReportAction } from '@/actions/reports'
import { LaporanForm } from '@/components/reports/laporan-form'
import { ChartNoAxesCombined, Send } from 'lucide-react'
import { Avatar, EmptyState, PageHeader, REPORT_STATUS, SectionHeader, StatusPill } from '@/components/dashboard/primitives'

export const metadata = { title: 'Perkembangan — Guru' }

export default async function GuruPerkembanganPage() {
  const user = await requireRole('TEACHER')
  const teacher = await db.teacher.findUnique({ where: { userId: user.id } })

  const ay = await db.academicYear.findFirst({ where: { status: 'ACTIVE' } })
  if (!teacher || !ay) {
    return <EmptyState icon={ChartNoAxesCombined} title="Data tidak tersedia" description="Belum ada tahun ajaran aktif atau profil guru belum terhubung." />
  }

  const classes = await db.class.findMany({ where: { teacherId: teacher.id, academicYearId: ay.id }, select: { id: true, name: true, code: true } })
  const classIds = classes.map((c) => c.id)
  const enrollments = await db.enrollment.findMany({
    where: { academicYearId: ay.id, classId: { in: classIds.length ? classIds : [-1] } },
    select: { classId: true, student: { select: { id: true, fullName: true, studentCode: true } } },
  })
  const [domains, scales] = await Promise.all([
    db.assessmentDomain.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    db.assessmentScale.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
  ])
  const reports = await db.developmentReport.findMany({
    where: { classId: { in: classIds.length ? classIds : [-1] } },
    include: { student: { select: { fullName: true } }, items: { include: { domain: true, scale: true } } },
    orderBy: { reportUpdatedAt: 'desc' },
  })

  const studentsByClass: Record<number, { id: number; label: string }[]> = {}
  for (const e of enrollments) {
    ;(studentsByClass[e.classId] ??= []).push({ id: e.student.id, label: `${e.student.fullName} (${e.student.studentCode})` })
  }
  const periods = ['Semester 1', 'Semester 2']

  return (
    <div className="space-y-6">
      <PageHeader icon={ChartNoAxesCombined} eyebrow={`Kelas saya · ${ay.name}`} title="Laporan Perkembangan" description="Susun rapor naratif per siswa per periode, lalu kirim ke admin untuk ditinjau." />

      <LaporanForm
        classes={classes.map((c) => ({ id: c.id, label: `${c.name} (${c.code})` }))}
        studentsByClass={studentsByClass}
        domains={domains.map((d) => ({ id: d.id, label: d.name }))}
        scales={scales.map((s) => ({ id: s.id, label: s.label, description: s.description }))}
        periods={periods}
        existingReports={Object.fromEntries(reports.map((report) => [
          `${report.studentId}:${report.period}`,
          {
            status: report.status,
            summary: report.summary ?? '',
            homeRecommendation: report.homeRecommendation ?? '',
            items: report.items.map((item) => ({ domainId: item.domainId, scaleId: item.scaleId, narrative: item.narrative ?? '' })),
          },
        ]))}
      />

      <section className="space-y-3">
        <SectionHeader title="Daftar laporan" description={`${reports.length} laporan`} />
        {reports.length === 0 ? (
          <EmptyState icon={ChartNoAxesCombined} title="Belum ada laporan" description="Gunakan formulir di atas untuk menyusun laporan pertama." />
        ) : (
          <div className="table-card">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-3">Siswa</th>
                  <th className="px-4 py-3">Periode</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Domain terisi</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3"><span className="flex items-center gap-2.5 font-medium"><Avatar name={r.student.fullName} size="sm" /> {r.student.fullName}</span></td>
                    <td className="px-4 py-3">{r.period}</td>
                    <td className="px-4 py-3">
                      <StatusPill map={REPORT_STATUS} status={r.status} />
                    </td>
                    <td className="px-4 py-3 tabular-nums">{r.items.length}/{domains.length}</td>
                    <td className="px-4 py-3">
                      {r.status === 'DRAFT' && (
                        <form action={submitReportAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <button type="submit" className="link-action"><Send className="size-3.5" /> Kirim untuk review</button>
                        </form>
                      )}
                      {r.status === 'REVIEW' && <span className="text-xs text-[var(--muted-foreground)]">Menunggu admin</span>}
                      {r.status === 'PUBLISHED' && <span className="text-xs text-[var(--muted-foreground)]">Terbit</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
