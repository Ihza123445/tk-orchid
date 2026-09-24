import { ChartNoAxesCombined } from 'lucide-react'
import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { Avatar, EmptyState, PageHeader } from '@/components/dashboard/primitives'
import { ReportCard, ScaleLegend } from '@/components/reports/report-card'

export const metadata = { title: 'Rapor Perkembangan' }

export default async function PortalPerkembanganPage() {
  const user = await requireRole('PARENT')
  const students = await db.student.findMany({
    where: { studentGuardians: { some: { guardian: { userId: user.id } } }, status: 'ACTIVE' },
    select: { id: true },
  })
  if (students.length === 0) {
    return <EmptyState icon={ChartNoAxesCombined} title="Belum ada data anak" description="Hubungi pihak sekolah untuk menghubungkan data anak ke akun Anda." />
  }

  // HANYA status PUBLISHED yang terlihat orang tua (PRD §14.4)
  const reports = await db.developmentReport.findMany({
    where: { studentId: { in: students.map((s) => s.id) }, status: 'PUBLISHED' },
    include: {
      student: { select: { fullName: true } },
      items: { include: { domain: true, scale: true }, orderBy: { sortOrder: 'asc' } },
    },
    orderBy: [{ studentId: 'asc' }, { period: 'desc' }],
  })

  const byStudent = new Map<number, typeof reports>()
  for (const r of reports) {
    const arr = byStudent.get(r.studentId)
    if (arr) arr.push(r)
    else byStudent.set(r.studentId, [r])
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={ChartNoAxesCombined} title="Rapor Perkembangan" description="Laporan perkembangan anak yang telah diterbitkan sekolah." />

      {byStudent.size === 0 ? (
        <EmptyState icon={ChartNoAxesCombined} title="Belum ada rapor yang diterbitkan" description="Rapor akan tampil di sini setelah ditinjau dan diterbitkan oleh sekolah." />
      ) : (
        <>
          <div className="app-card px-5 py-3"><ScaleLegend /></div>
          {[...byStudent.entries()].map(([studentId, reps]) => (
            <section key={studentId} className="space-y-3">
              <h2 className="flex items-center gap-3 font-heading text-lg font-bold">
                <Avatar name={reps[0].student.fullName} /> {reps[0].student.fullName}
              </h2>
              {reps.map((r) => <ReportCard key={r.id} report={r} />)}
            </section>
          ))}
        </>
      )}
    </div>
  )
}
