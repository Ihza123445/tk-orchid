import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatTanggalSingkat } from '@/lib/formatting/format'

export default async function GuruKegiatanPage() {
  await requireRole('TEACHER')

  const activities = await db.activity.findMany({
    where: { status: 'PUBLISHED', visibility: { in: ['PUBLIC', 'PARENT_ONLY', 'INTERNAL'] } },
    orderBy: { startDatetime: 'desc' },
    take: 30,
  })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Kegiatan Sekolah</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Agenda dan kegiatan terbit.</p>
      </header>

      {activities.length === 0 ? (
        <p className="rounded-lg border border-dashed p-10 text-center text-sm text-[var(--muted-foreground)]">Belum ada kegiatan.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {activities.map((a) => (
            <Card key={a.id}>
              <CardHeader>
                <CardTitle className="text-base">{a.title}</CardTitle>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {a.startDatetime
                    ? `${formatTanggalSingkat(a.startDatetime)}${a.endDatetime ? ` – ${formatTanggalSingkat(a.endDatetime)}` : ''}`
                    : 'Jadwal menyusul'}
                  {a.location ? ` · ${a.location}` : ''}
                </p>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 whitespace-pre-line text-sm">{a.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
