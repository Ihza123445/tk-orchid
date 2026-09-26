import Link from 'next/link'
import { requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { publishReportAction } from '@/actions/reports'
import { ChartNoAxesCombined, Send } from 'lucide-react'
import { Avatar, EmptyState, PageHeader, REPORT_STATUS, Stat, StatGroup, StatusPill } from '@/components/dashboard/primitives'

export const metadata = { title: 'Perkembangan' }

export default async function PerkembanganPage() {
  await requireAdminStaff()

  const ay = await db.academicYear.findFirst({ where: { status: 'ACTIVE' } })
  const reports = await db.developmentReport.findMany({
    where: ay ? { academicYearId: ay.id } : {},
    include: {
      student: { select: { fullName: true, studentCode: true } },
      klass: { select: { name: true } },
      writer: { select: { fullName: true } },
      items: true,
    },
    orderBy: [{ status: 'asc' }, { reportUpdatedAt: 'desc' }],
  })

  return (
    <div className="space-y-6">
      <PageHeader icon={ChartNoAxesCombined} eyebrow={ay ? `Akademik · ${ay.name}` : 'Akademik'} title="Laporan Perkembangan" description="Tinjau rapor yang disusun guru lalu publikasikan ke portal orang tua." />

      <StatGroup columns={3}>
        <Stat label="Draf" value={reports.filter((r) => r.status === 'DRAFT').length} hint="Masih disusun guru" />
        <Stat label="Menunggu review" value={reports.filter((r) => r.status === 'REVIEW').length} hint="Siap dipublikasikan" tone={reports.some((r) => r.status === 'REVIEW') ? 'warning' : 'default'} />
        <Stat label="Terbit" value={reports.filter((r) => r.status === 'PUBLISHED').length} hint="Terlihat di portal orang tua" tone="success" />
      </StatGroup>

      {reports.length === 0 ? (
        <EmptyState icon={ChartNoAxesCombined} title="Belum ada laporan" description="Laporan perkembangan yang dibuat guru akan muncul di sini." />
      ) : (
        <div className="table-card">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-3">No. Laporan</th>
                <th className="px-4 py-3">Siswa</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Periode</th>
                <th className="px-4 py-3">Penyusun</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-mono text-xs">{r.reportNo}</td>
                  <td className="px-4 py-3">
                    <Link href={`/siswa/${r.studentId}`} className="flex items-center gap-2.5 hover:text-[var(--primary)]"><Avatar name={r.student.fullName} size="sm" /> {r.student.fullName}</Link>
                  </td>
                  <td className="px-4 py-3">{r.klass.name}</td>
                  <td className="px-4 py-3">{r.period}</td>
                  <td className="px-4 py-3">{r.writer?.fullName ?? '-'}</td>
                  <td className="px-4 py-3">
                    <StatusPill map={REPORT_STATUS} status={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    {r.status === 'REVIEW' ? (
                      <form action={publishReportAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <button type="submit" className="link-action"><Send className="size-3.5" /> Publikasikan</button>
                      </form>
                    ) : (
                      <span className="text-xs text-[var(--muted-foreground)]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
