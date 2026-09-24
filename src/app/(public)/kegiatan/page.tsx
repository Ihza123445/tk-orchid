import { db } from '@/lib/db/db'
import { formatTanggalSingkat } from '@/lib/formatting/format'
import { SiteHeader } from '@/components/public/site-header'
import { Reveal } from '@/components/public/reveal'
import { IMG } from '@/lib/assets/public-images'

export const metadata = { title: 'Kegiatan — TK Orchid' }

// Selalu render fresh dari database (bukan cache statis)
export const revalidate = 0

const KEGIATAN_IMAGES = [IMG.galeri1, IMG.galeri2, IMG.galeri3, IMG.programTematik, IMG.programSeni, IMG.berita]

export default async function KegiatanPublikPage() {
  const activities = await db.activity.findMany({
    where: { status: 'PUBLISHED', visibility: 'PUBLIC' },
    orderBy: { startDatetime: 'desc' },
  })

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.galeri1} alt="Kegiatan anak TK Orchid" className="absolute inset-0 h-full w-full object-cover" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/35" />
        <div className="relative mx-auto max-w-[1100px] px-4 py-20 text-center sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-md">
            ✨ Dokumentasi
          </span>
          <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight text-white drop-shadow sm:text-5xl">Kegiatan Sekolah</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/90 drop-shadow sm:text-lg">
            Beragam aktivitas seru yang menumbuhkan karakter, kreativitas, dan kepercayaan diri anak.
          </p>
        </div>
      </section>

      {/* GRID KEGIATAN — foto cards masonry-feel */}
      <main className="mx-auto max-w-[1100px] px-4 py-16">
        {activities.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-12 text-center text-sm text-[var(--muted-foreground)]">Belum ada kegiatan.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((a, i) => (
              <Reveal key={a.id} delay={(i % 3) * 110}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                <div className="relative h-48 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={KEGIATAN_IMAGES[i % KEGIATAN_IMAGES.length]} alt={a.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <time className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                    {a.startDatetime ? formatTanggalSingkat(a.startDatetime) : ''}
                  </time>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="line-clamp-2 font-semibold leading-snug group-hover:text-[var(--primary)]">{a.title}</h2>
                  <p className="mt-2.5 line-clamp-3 flex-1 text-sm leading-relaxed text-[var(--muted-foreground)]">{a.description}</p>
                  {a.location && (
                    <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)]">
                      📍 {a.location}
                    </p>
                  )}
                </div>
              </article>
              </Reveal>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
