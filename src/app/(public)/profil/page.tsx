import Link from 'next/link'
import { db } from '@/lib/db/db'
import { formatTanggalSingkat } from '@/lib/formatting/format'
import { SiteHeader } from '@/components/public/site-header'
import { Reveal } from '@/components/public/reveal'
import { IMG } from '@/lib/assets/public-images'

export const metadata = { title: 'Profil — TK Orchid' }

// Selalu render fresh dari database (bukan cache statis)
export const revalidate = 0

export default async function ProfilPage() {
  const activities = await db.activity.findMany({
    where: { status: 'PUBLISHED', visibility: 'PUBLIC' },
    orderBy: { startDatetime: 'desc' },
    take: 6,
  })

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      {/* HERO dengan foto */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={IMG.hero3}
          alt="Suasana kelas TK Orchid"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/35" />
        <div className="relative mx-auto max-w-[1100px] px-4 py-20 sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-md">
            🌸 Tentang Kami
          </span>
          <h1 className="mt-5 max-w-2xl font-heading text-3xl font-bold tracking-tight text-white drop-shadow sm:text-5xl">
            Profil TK Orchid
          </h1>
          <p className="mt-4 max-w-xl text-sm text-white/90 drop-shadow sm:text-lg">
            Taman kanak-kanak yang mengutamakan bermain, karakter, dan nilai Kristiani dalam setiap hari belajar.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-[1100px] space-y-16 px-4 py-16">
        {/* VISI MISI KURIKULUM — kartu ikon besar */}
        <section className="grid gap-7 md:grid-cols-3">
          {[
            {
              icon: '🎯',
              title: 'Visi',
              body: (
                <p>Menjadi sekolah PAUD yang menumbuhkan anak cerdas, mandiri, dan berakhlak mulia.</p>
              ),
            },
            {
              icon: '🚀',
              title: 'Misi',
              body: (
                <ul className="space-y-2">
                  <li className="flex gap-2"><span aria-hidden="true" className="text-[var(--primary)]">✓</span> Lingkungan belajar aman & menyenangkan</li>
                  <li className="flex gap-2"><span aria-hidden="true" className="text-[var(--primary)]">✓</span> Perkembangan anak sesuai STPPA</li>
                  <li className="flex gap-2"><span aria-hidden="true" className="text-[var(--primary)]">✓</span> Kemitraan erat dengan orang tua</li>
                </ul>
              ),
            },
            {
              icon: '📚',
              title: 'Kurikulum',
              body: (
                <p>Kurikulum Merdeka PAUD dengan pendekatan belajar melalui bermain (STPPA) dan pembiasaan nilai kristiani.</p>
              ),
            },
          ].map((c) => (
            <Reveal key={c.title} delay={['Visi', 'Misi', 'Kurikulum'].indexOf(c.title) * 120}>
            <div
              className="h-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/15 text-2xl">
                {c.icon}
              </span>
              <h2 className="mt-4 font-bold">{c.title}</h2>
              <div className="mt-2.5 text-sm leading-relaxed text-[var(--muted-foreground)]">{c.body}</div>
            </div>
            </Reveal>
          ))}
        </section>

        {/* FASILITAS — strip foto */}
        <section>
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Fasilitas Sekolah</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">Ruang belajar yang aman, bersih, dan menyenangkan</p>
            <span aria-hidden="true" className="mx-auto mt-4 block h-1 w-16 rounded-full bg-[var(--primary)]" />
          </div>
          <div className="mt-9 grid gap-6 sm:grid-cols-3">
            {[
              { img: IMG.programTematik, label: 'Ruang Kelas Tematik' },
              { img: IMG.galeri1, label: 'Area Bermain Outdoor' },
              { img: IMG.galeri3, label: 'Kelas Seni & Kreativitas' },
            ].map((f, i) => (
              <Reveal key={f.label} delay={i * 120}>
              <figure className="group relative aspect-[4/3] overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.img} alt={f.label} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-4 text-sm font-semibold text-white">{f.label}</figcaption>
              </figure>
              </Reveal>
            ))}
          </div>
        </section>

        {/* GALERI KEGIATAN — foto cards */}
        <section>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Galeri Kegiatan</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">Dokumentasi kegiatan terbaru</p>
            </div>
            <Link href="/kegiatan" className="group/link hidden items-center gap-1.5 text-sm font-semibold text-[var(--primary)] hover:underline sm:inline-flex">
              Semua Kegiatan <span aria-hidden="true" className="transition-transform duration-300 group-hover/link:translate-x-1">→</span>
            </Link>
          </div>
          {activities.length === 0 ? (
            <p className="mt-8 rounded-2xl border border-dashed p-10 text-center text-sm text-[var(--muted-foreground)]">Belum ada kegiatan yang dipublikasikan.</p>
          ) : (
            <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {activities.map((a, i) => {
                const imgs = [IMG.galeri1, IMG.galeri2, IMG.galeri3]
                return (
                  <Reveal key={a.id} delay={(i % 3) * 120}>
                  <article className="group h-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                    <div className="relative h-40 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgs[i % imgs.length]} alt={a.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <time className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                        {a.startDatetime ? formatTanggalSingkat(a.startDatetime) : ''}
                      </time>
                    </div>
                    <div className="p-5">
                      <h3 className="line-clamp-1 font-semibold group-hover:text-[var(--primary)]">{a.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{a.description}</p>
                      {a.location && <p className="mt-3 text-xs text-[var(--muted-foreground)]">📍 {a.location}</p>}
                    </div>
                  </article>
                  </Reveal>
                )
              })}
            </div>
          )}
        </section>

        {/* CTA PPDB mini */}
        <section className="relative overflow-hidden rounded-3xl px-8 py-12 text-center text-white">
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#A64CA6] via-[var(--primary)] to-[#7C3AED]" />
          <div className="relative">
            <h2 className="text-xl font-bold sm:text-2xl">Ingin Melihat TK Orchid Langsung?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm opacity-90">Jadwalkan kunjungan dan temui kami — atau langsung daftarkan si kecil.</p>
            <Link
              href="/pendaftaran"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 font-bold text-[#23071F] shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              Daftar PPDB Online <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
