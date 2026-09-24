import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { formatTanggalSingkat } from '@/lib/formatting/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function PortalPerkembanganPage() {
  const user = await requireRole('PARENT')
  const students = await db.student.findMany({
    where: { studentGuardians: { some: { guardian: { userId: user.id } } }, status: 'ACTIVE' },
    select: { id: true },
  })
  if (students.length === 0) {
    return <p className="text-sm text-[var(--muted-foreground)]">Belum ada data anak.</p>
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
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Rapor Perkembangan</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Laporan yang telah diterbitkan sekolah.</p>
      </header>

      {[...byStudent.entries()].length === 0 ? (
        <p className="rounded-lg border border-dashed p-10 text-center text-sm text-[var(--muted-foreground)]">Belum ada rapor yang diterbitkan.</p>
      ) : (
        [...byStudent.entries()].map(([studentId, reps]) => (
          <section key={studentId} className="space-y-3">
            <h2 className="text-base font-semibold">{reps[0].student.fullName}</h2>
            {reps.map((r) => (
              <Card key={r.id}>
                <CardHeader>
                  <CardTitle className="text-base">{r.period}</CardTitle>
                  <p className="text-xs text-[var(--muted-foreground)]">Terbit {r.publishedAt ? formatTanggalSingkat(r.publishedAt) : '-'}</p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {r.items.map((item) => (
                      <li key={item.id} className="rounded border px-3 py-1.5">
                        <div className="flex justify-between gap-2">
                          <span>{item.domain.name}</span>
                          <span className="font-medium">{item.scale.code}</span>
                        </div>
                        {item.narrative && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{item.narrative}</p>}
                      </li>
                    ))}
                  </ul>
                  {r.summary && <p><span className="font-medium">Ringkasan guru:</span> {r.summary}</p>}
                  {r.homeRecommendation && <p><span className="font-medium">Rekomendasi di rumah:</span> {r.homeRecommendation}</p>}
                  {r.attendanceSummary && <p className="text-xs text-[var(--muted-foreground)]">{r.attendanceSummary}</p>}
                </CardContent>
              </Card>
            ))}
          </section>
        ))
      )}
    </div>
  )
}
