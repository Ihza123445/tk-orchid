import { CalendarDays, MapPin, Sparkles } from 'lucide-react'
import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { formatTanggalSingkat } from '@/lib/formatting/format'
import { EmptyState, PageHeader, Pill } from '@/components/dashboard/primitives'

export const metadata = { title: 'Kegiatan — Guru' }

const VISIBILITY: Record<string, { label: string; tone: 'info' | 'brand' | 'neutral' }> = {
  PUBLIC: { label: 'Publik', tone: 'info' },
  PARENT_ONLY: { label: 'Orang tua', tone: 'brand' },
  INTERNAL: { label: 'Internal', tone: 'neutral' },
}

export default async function GuruKegiatanPage() {
  await requireRole('TEACHER')

  const activities = await db.activity.findMany({
    where: { status: 'PUBLISHED', visibility: { in: ['PUBLIC', 'PARENT_ONLY', 'INTERNAL'] } },
    orderBy: { startDatetime: 'desc' },
    take: 30,
  })

  return (
    <div className="space-y-6">
      <PageHeader icon={Sparkles} eyebrow="Sekolah" title="Kegiatan Sekolah" description="Agenda dan dokumentasi kegiatan yang sudah terbit." />

      {activities.length === 0 ? (
        <EmptyState icon={Sparkles} title="Belum ada kegiatan" description="Kegiatan yang diterbitkan admin akan tampil di sini." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activities.map((a) => {
            const vis = VISIBILITY[a.visibility] ?? { label: a.visibility, tone: 'neutral' as const }
            return (
              <article key={a.id} className="app-card flex flex-col p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-raised)]">
                <div className="flex items-start gap-4">
                  {a.startDatetime ? (
                    <span className="flex w-14 shrink-0 flex-col items-center rounded-2xl bg-[var(--primary)]/10 py-2 text-[var(--primary)]">
                      <span className="font-heading text-xl font-bold leading-none">{new Intl.DateTimeFormat('id-ID', { day: 'numeric', timeZone: 'Asia/Jakarta' }).format(a.startDatetime)}</span>
                      <span className="mt-0.5 text-[10px] font-semibold uppercase">{new Intl.DateTimeFormat('id-ID', { month: 'short', timeZone: 'Asia/Jakarta' }).format(a.startDatetime)}</span>
                    </span>
                  ) : (
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--muted)] text-[var(--muted-foreground)]"><CalendarDays className="size-5" /></span>
                  )}
                  <div className="min-w-0">
                    <Pill tone={vis.tone}>{vis.label}</Pill>
                    <h2 className="mt-1.5 font-heading text-base font-bold leading-snug">{a.title}</h2>
                  </div>
                </div>
                <p className="mt-3 line-clamp-3 flex-1 whitespace-pre-line text-sm text-[var(--muted-foreground)]">{a.description}</p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted-foreground)]">
                  <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" />
                    {a.startDatetime
                      ? `${formatTanggalSingkat(a.startDatetime)}${a.endDatetime ? ` – ${formatTanggalSingkat(a.endDatetime)}` : ''}`
                      : 'Jadwal menyusul'}
                  </span>
                  {a.location && <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {a.location}</span>}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
