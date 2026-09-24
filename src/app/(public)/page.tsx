import Link from 'next/link'
import { db } from '@/lib/db/db'
import { formatTanggalSingkat } from '@/lib/formatting/format'
import { SiteHeader } from '@/components/public/site-header'
import { HeroSlider } from '@/components/public/hero-slider'
import { Reveal, CountUp } from '@/components/public/reveal'
import { IMG } from '@/lib/assets/public-images'

export const metadata = { title: 'TK Orchid — Rumah Belajar Pertama Anak Hebat' }

// Selalu render fresh dari database (bukan cache statis)
export const revalidate = 0

const SECTION_HEAD = 'text-center'
const SECTION_TITLE = 'text-2xl font-bold tracking-tight sm:text-3xl'
const SECTION_SUB = 'mt-2 text-sm text-[var(--muted-foreground)] sm:text-base'
const ACCENT_LINE = 'mx-auto mt-4 block h-1 w-16 rounded-full bg-[var(--primary)]'

function ProgramCard({
  title,
  icon,
  desc,
  points,
  href,
  image,
  reverse,
}: {
  title: string
  icon: string
  desc: string
  points: string[]
  href: string
  image: string
  reverse?: boolean
}) {
  return (
    <div className={`flex overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition-shadow duration-300 hover:shadow-lg md:h-[340px] ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
      {/* Gambar */}
      <div className="relative hidden w-2/5 overflow-hidden md:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
        <span aria-hidden="true" className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-xl backdrop-blur-md">
          {icon}
        </span>
      </div>
      {/* Konten */}
      <div className="flex flex-1 flex-col justify-center p-7 sm:p-9">
        <h3 className="text-lg font-bold sm:text-xl">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">{desc}</p>
        <ul className="mt-5 grid gap-2.5 text-sm sm:grid-cols-2">
          {points.map((p) => (
            <li key={p} className="flex items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2">
              <span aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/15 text-[10px] text-[var(--primary)]">✓</span>
              {p}
            </li>
          ))}
        </ul>
        <Link href={href} className="group/link mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--primary)] hover:underline">
          Lihat Detail
          <span aria-hidden="true" className="transition-transform duration-300 group-hover/link:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  )
}

export default async function HomePage() {
  const [announcements, activities] = await Promise.all([
    db.announcement.findMany({ where: { status: 'PUBLISHED', audience: 'PUBLIC' }, orderBy: { publishAt: 'desc' }, take: 3 }),
    db.activity.findMany({ where: { status: 'PUBLISHED', visibility: 'PUBLIC' }, orderBy: { startDatetime: 'desc' }, take: 3 }),
  ])

  const galeriImages = [IMG.galeri1, IMG.galeri2, IMG.galeri3]

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      <HeroSlider />

      {/* INFORMASI & ARTIKEL */}
      <section className="mx-auto max-w-[1100px] px-4 py-16 sm:py-20">
        <div className={SECTION_HEAD}>
          <h2 className={SECTION_TITLE}>Informasi &amp; Artikel</h2>
          <p className={SECTION_SUB}>Ikuti perkembangan terbaru dan berbagai kegiatan menarik di TK Orchid</p>
          <span aria-hidden="true" className={ACCENT_LINE} />
        </div>

        <div className="mt-10 grid gap-7 md:grid-cols-3">
          {announcements.length === 0 && (
            <p className="col-span-3 text-center text-sm text-[var(--muted-foreground)]">Belum ada pengumuman.</p>
          )}
          {announcements.map((a, i) => (
            <Reveal key={a.id} delay={i * 110}>
            <article
              className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
            >
              <div className="relative h-44 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={IMG.berita}
                  alt={a.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <time className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                  {formatTanggalSingkat(a.publishAt ?? a.createdAt)}
                </time>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="line-clamp-2 font-semibold leading-snug transition-colors duration-200 group-hover:text-[var(--primary)]">{a.title}</h3>
                <p className="mt-2.5 line-clamp-3 flex-1 text-sm leading-relaxed text-[var(--muted-foreground)]">{a.content}</p>
                <Link href="/pengumuman" className="group/link mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--primary)] hover:underline">
                  Baca selengkapnya
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover/link:translate-x-1">→</span>
                </Link>
              </div>
            </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PROGRAM UNGGULAN — kartu foto alternating */}
      <section className="border-y border-[var(--border)] bg-[var(--muted)] py-16 sm:py-20">
        <div className="mx-auto max-w-[1100px] px-4">
          <div className={SECTION_HEAD}>
            <h2 className={SECTION_TITLE}>Program Unggulan &amp; Kegiatan Sekolah</h2>
            <p className={SECTION_SUB}>Mewujudkan anak berkarakter, kreatif, dan percaya diri</p>
            <span aria-hidden="true" className={ACCENT_LINE} />
          </div>

          <div className="mt-12 space-y-9">
            <Reveal>
            <ProgramCard
              title="Pembelajaran Tematik Kurikulum Merdeka"
              icon="📚"
              desc="Belajar menyenangkan melalui tema dekat dengan dunia anak, membangun literasi, numerasi, dan karakter sejak dini."
              points={['Literasi & numerasi dasar', 'Proyek seni & kreativitas', 'Pembiasaan karakter kristiani', 'Kelas inklusif penuh kasih']}
              href="/profil"
              image={IMG.programTematik}
            />
            </Reveal>
            <Reveal>
            <ProgramCard
              title="Seni, Musik & Motorik"
              icon="🎨"
              desc="Melatih ekspresi, koordinasi, dan kepercayaan diri anak melalui lagu, tari, dan permainan gerak."
              points={['Seni musik & tari', 'Motorik kasar & halus', 'Penampilan setiap semester', 'Festival seni tahunan']}
              href="/kegiatan"
              image={IMG.programSeni}
              reverse
            />
            </Reveal>
          </div>

          <Reveal className="mt-11 text-center">
            <Link
              href="/kegiatan"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/40 bg-[var(--card)] px-8 py-3 font-semibold text-[var(--primary)] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:shadow-lg"
            >
              Lihat Semua Kegiatan <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* GALERI KEGIATAN — masonry ala instagram */}
      <section className="mx-auto max-w-[1100px] px-4 py-16 sm:py-20">
        <div className={SECTION_HEAD}>
          <h2 className={SECTION_TITLE}>Galeri Kegiatan</h2>
          <p className={SECTION_SUB}>Momen berharga perjalanan belajar si kecil</p>
          <span aria-hidden="true" className={ACCENT_LINE} />
        </div>

        <div className="mt-10 grid gap-7 sm:grid-cols-3">
          {activities.length === 0 && (
            <p className="col-span-3 text-center text-sm text-[var(--muted-foreground)]">Belum ada kegiatan.</p>
          )}
          {activities.map((g, i) => (
            <Reveal key={g.id} delay={i * 120}>
            <figure
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={galeriImages[i % galeriImages.length]}
                alt={g.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-5">
                <time className="text-xs font-medium uppercase tracking-wide text-white/70">{formatTanggalSingkat(g.startDatetime)}</time>
                <p className="mt-1 line-clamp-2 text-sm font-semibold text-white">{g.title}</p>
              </figcaption>
            </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA PPDB — gradasi orchid */}
      <section className="relative overflow-hidden px-4 py-16 text-center sm:py-20">
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#A64CA6] via-[var(--primary)] to-[#7C3AED]" />
        <div aria-hidden="true" className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden="true" className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-black/15 blur-2xl" />
        <div className="relative mx-auto max-w-3xl text-white">
          <span className="mb-4 inline-block rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-md">
            🎒 PPDB 2026/2027 Dibuka
          </span>
          <h2 className="text-2xl font-bold sm:text-3xl">Siap Bergabung dengan Keluarga TK Orchid?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm opacity-90 sm:text-base">
            Kuota terbatas untuk setiap kelompok usia. Proses pendaftaran mudah, cepat, sepenuhnya online.
          </p>
          <Link
            href="/pendaftaran"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-9 py-3.5 font-bold text-[#23071F] shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
          >
            Daftar PPDB Online <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto grid max-w-[1100px] gap-10 px-4 py-14 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-[var(--primary-foreground)]">🌸</span>
              <div>
                <p className="font-bold">TK Orchid</p>
                <p className="text-xs text-[var(--muted-foreground)]">Taman Kanak-Kanak</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--primary)]">Visi Kami</p>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted-foreground)]">
                Menjadi taman kanak-kanak unggulan yang menghasilkan anak berkarakter, kreatif, dan siap melangkah ke jenjang berikutnya.
              </p>
            </div>
            <div className="mt-4 flex gap-2.5">
              {['f', '◎', '▶', '✉'].map((s) => (
                <a key={s} href="#" aria-label="Media sosial" className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-sm text-[var(--muted-foreground)] transition-all duration-200 hover:border-[var(--primary)] hover:text-[var(--primary)]">
                  {s}
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer">
            <p className="font-bold">Menu Utama</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                ['/', 'Beranda'],
                ['/profil', 'Tentang Kami'],
                ['/kegiatan', 'Kegiatan'],
                ['/pengumuman', 'Pengumuman'],
                ['/pendaftaran', 'PPDB Online'],
                ['/login', 'Portal Orang Tua'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-[var(--muted-foreground)] transition-colors duration-200 hover:text-[var(--primary)]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="font-bold">Kontak Kami</p>
            <ul className="mt-4 space-y-3 text-sm text-[var(--muted-foreground)]">
              <li>📍 Jl. Contoh Alamat No. 12, Bekasi, Jawa Barat</li>
              <li>📞 (021) 000-0000</li>
              <li>✉️ info@tk-orchid.sch.id</li>
            </ul>
            <div className="mt-5 space-y-1 border-t border-[var(--border)] pt-4 text-xs text-[var(--muted-foreground)]">
              <p>Jam Operasional:</p>
              <p>Senin – Jumat: 07.00 – 16.00 WIB</p>
              <p>NPSN: — · Akreditasi: —</p>
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--border)] py-4">
          <p className="text-center text-xs text-[var(--muted-foreground)]">
            © 2026 TK Orchid. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  )
}
