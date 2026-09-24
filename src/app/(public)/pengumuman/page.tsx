import { db } from '@/lib/db/db'
import { formatTanggalSingkat } from '@/lib/formatting/format'
import { SiteHeader } from '@/components/public/site-header'
import { Reveal } from '@/components/public/reveal'
import { IMG } from '@/lib/assets/public-images'

export const metadata = { title: 'Pengumuman — TK Orchid' }

// Selalu render fresh dari database (bukan cache statis)
export const revalidate = 0

export default async function PengumumanPublikPage() {
  const announcements = await db.announcement.findMany({
    where: { status: 'PUBLISHED', audience: 'PUBLIC' },
    orderBy: { publishAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.berita} alt="Pengumuman TK Orchid" className="absolute inset-0 h-full w-full object-cover" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/35" />
        <div className="relative mx-auto max-w-[1100px] px-4 py-20 text-center sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-md">
            📢 Informasi Terkini
          </span>
          <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight text-white drop-shadow sm:text-5xl">Pengumuman</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/90 drop-shadow sm:text-lg">
            Kabaran terbaru seputar kegiatan sekolah untuk seluruh keluarga besar TK Orchid.
          </p>
        </div>
      </section>

      {/* TIMELINE pengumuman */}
      <main className="mx-auto max-w-[860px] px-4 py-16">
        {announcements.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-12 text-center text-sm text-[var(--muted-foreground)]">Belum ada pengumuman publik.</p>
        ) : (
          <ol className="relative space-y-8 border-l-2 border-[var(--border)] pl-8">
            {announcements.map((a, i) => (
              <Reveal key={a.id} delay={(i % 3) * 100}>
              <li className="relative">
                {/* dot timeline */}
                <span aria-hidden="true" className="absolute -left-[41px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[var(--primary)] bg-[var(--background)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                </span>
                <article className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <time className="inline-block rounded-full bg-[var(--primary)]/15 px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                    {formatTanggalSingkat(a.publishAt ?? a.createdAt)}
                  </time>
                  <h2 className="mt-3 font-semibold leading-snug group-hover:text-[var(--primary)]">{a.title}</h2>
                  <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-[var(--muted-foreground)]">{a.content}</p>
                </article>
              </li>
              </Reveal>
            ))}
          </ol>
        )}
      </main>
    </div>
  )
}
