import { BellRing, CalendarDays, CheckCircle2, Info } from 'lucide-react'
import { db } from '@/lib/db/db'
import { formatTanggalSingkat } from '@/lib/formatting/format'
import { IMG } from '@/lib/assets/public-images'
import { SiteHeader } from '@/components/public/site-header'
import { Reveal } from '@/components/public/reveal'
import { AdmissionCta, PublicPage, PublicPageHero, SectionHeading, SiteFooter } from '@/components/public/public-chrome'

export const metadata = { title: 'Pengumuman' }
export const revalidate = 0

export default async function PengumumanPublikPage() {
  const now = new Date()
  const announcements = await db.announcement.findMany({
    where: {
      status: 'PUBLISHED',
      audience: 'PUBLIC',
      AND: [
        { OR: [{ publishAt: null }, { publishAt: { lte: now } }] },
        { OR: [{ expireAt: null }, { expireAt: { gt: now } }] },
      ],
    },
    orderBy: { publishAt: 'desc' },
  })

  return (
    <PublicPage>
      <SiteHeader />
      <PublicPageHero
        index="05"
        eyebrow="Informasi terkini"
        title="Kabar sekolah,"
        accent="tersusun rapi."
        description="Agenda, pengingat, dan informasi penting TK Orchid dalam satu papan kabar yang mudah dipantau keluarga."
        image={IMG.berita}
        imageAlt="Kegiatan kreatif anak TK Orchid"
      />

      <main id="main-content">
        <section className="school-section">
          <div className="public-container grid gap-12 lg:grid-cols-[.68fr_1.32fr] lg:items-start lg:gap-20">
            <Reveal variant="left" className="lg:sticky lg:top-36">
              <SectionHeading
                eyebrow="Papan kabar"
                title="Tidak ada informasi penting yang"
                accent="terlewat."
                description="Hanya pengumuman publik yang masih aktif yang tampil di sini, diurutkan dari yang paling baru."
              />
              <div className="mt-7 flex items-start gap-3 rounded-2xl bg-[var(--secondary)] p-5 text-sm leading-6 text-[var(--muted-foreground)]">
                <Info className="mt-0.5 size-5 shrink-0 text-[var(--primary)]" />
                Informasi khusus siswa dan orang tua tersedia setelah masuk ke portal keluarga.
              </div>
            </Reveal>

            <div>
              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="text-sm font-bold">{announcements.length} informasi aktif</p>
                <span className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,var(--card))] px-3 py-2 text-[11px] font-bold text-[var(--warning)]"><span className="size-2 animate-pulse rounded-full bg-[var(--accent)]" /> Diperbarui</span>
              </div>

              {announcements.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-[var(--border)] bg-[var(--card)] p-10 text-center">
                  <BellRing className="mx-auto size-8 text-[var(--primary)]" />
                  <h2 className="mt-4 text-xl font-bold">Belum ada pengumuman publik.</h2>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">Informasi terbaru akan muncul di halaman ini.</p>
                </div>
              ) : (
                <ol className="grid gap-4">
                  {announcements.map((announcement, index) => (
                    <Reveal key={announcement.id} delay={(index % 4) * 70} variant="right">
                      <li className="group rounded-[1.6rem] border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--primary)_38%,var(--border))] hover:shadow-[0_18px_45px_color-mix(in_srgb,var(--foreground)_8%,transparent)] sm:p-7">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <time className="inline-flex items-center gap-2 rounded-full bg-[var(--secondary)] px-3 py-2 text-[11px] font-bold text-[var(--primary)]"><CalendarDays className="size-3.5" /> {formatTanggalSingkat(announcement.publishAt ?? announcement.createdAt)}</time>
                          <span className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--muted-foreground)]"><CheckCircle2 className="size-3.5 text-[var(--primary)]" /> Informasi aktif</span>
                        </div>
                        <h2 className="mt-5 text-xl font-extrabold leading-snug tracking-[-.03em] transition-colors group-hover:text-[var(--primary)] sm:text-2xl">{announcement.title}</h2>
                        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--muted-foreground)]">{announcement.content}</p>
                      </li>
                    </Reveal>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </section>

        <AdmissionCta title="Masih ada hal yang ingin ditanyakan?" description="Tim sekolah siap membantu menjelaskan kegiatan, jadwal kunjungan, dan proses penerimaan murid baru." />
      </main>
      <SiteFooter />
    </PublicPage>
  )
}
