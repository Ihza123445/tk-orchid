import Link from 'next/link'
import { requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { publishReportAction } from '@/actions/reports'

export const metadata = { title: 'Perkembangan' }

const STATUS_LABEL: Record<string, string> = { DRAFT: 'Draft', REVIEW: 'Review', PUBLISHED: 'Terbit' }

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
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Laporan Perkembangan</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Review dan publikasikan rapor ke orang tua.</p>
      </header>

      {reports.length === 0 ? (
        <p className="rounded-lg border border-dashed p-10 text-center text-sm text-[var(--muted-foreground)]">Belum ada laporan.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-[var(--card)]">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b bg-[var(--muted)] text-left">
                <th className="px-4 py-3 font-medium">No. Laporan</th>
                <th className="px-4 py-3 font-medium">Siswa</th>
                <th className="px-4 py-3 font-medium">Kelas</th>
                <th className="px-4 py-3 font-medium">Periode</th>
                <th className="px-4 py-3 font-medium">Penyusun</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{r.reportNo}</td>
                  <td className="px-4 py-3">
                    <Link href={`/siswa/${r.studentId}`} className="underline-offset-4 hover:underline">{r.student.fullName}</Link>
                  </td>
                  <td className="px-4 py-3">{r.klass.name}</td>
                  <td className="px-4 py-3">{r.period}</td>
                  <td className="px-4 py-3">{r.writer?.fullName ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${r.status === 'PUBLISHED' ? 'bg-[var(--secondary)] text-[var(--primary)]' : r.status === 'REVIEW' ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}>
                      {STATUS_LABEL[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === 'REVIEW' ? (
                      <form action={publishReportAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <button type="submit" className="underline underline-offset-4">Publikasikan</button>
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
