import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { submitReportAction } from '@/actions/reports'
import { LaporanForm } from '@/components/reports/laporan-form'

export const metadata = { title: 'Perkembangan — Guru' }

const STATUS_LABEL: Record<string, string> = { DRAFT: 'Draft', REVIEW: 'Review', PUBLISHED: 'Terbit' }

export default async function GuruPerkembanganPage() {
  const user = await requireRole('TEACHER')
  const teacher = await db.teacher.findUnique({ where: { userId: user.id } })

  const ay = await db.academicYear.findFirst({ where: { status: 'ACTIVE' } })
  if (!teacher || !ay) {
    return <p className="text-sm text-[var(--muted-foreground)]">Data tidak tersedia.</p>
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
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Laporan Perkembangan</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Rapor naratif per siswa per periode.</p>
      </header>

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
        <h2 className="text-base font-semibold">Daftar Laporan</h2>
        {reports.length === 0 ? (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-[var(--muted-foreground)]">Belum ada laporan.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-[var(--card)]">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b bg-[var(--muted)] text-left">
                  <th className="px-4 py-3 font-medium">Siswa</th>
                  <th className="px-4 py-3 font-medium">Periode</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Domain terisi</th>
                  <th className="px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{r.student.fullName}</td>
                    <td className="px-4 py-3">{r.period}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${r.status === 'PUBLISHED' ? 'bg-[var(--secondary)] text-[var(--primary)]' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}>
                        {STATUS_LABEL[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{r.items.length}/{domains.length}</td>
                    <td className="px-4 py-3">
                      {r.status === 'DRAFT' && (
                        <form action={submitReportAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <button type="submit" className="text-sm underline underline-offset-4">Submit untuk review</button>
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
