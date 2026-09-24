import { CalendarDays, Camera, MapPin, Sparkles } from 'lucide-react'
import { db } from '@/lib/db/db'
import { formatTanggalSingkat } from '@/lib/formatting/format'
import { IMG } from '@/lib/assets/public-images'
import { SiteHeader } from '@/components/public/site-header'
import { Reveal } from '@/components/public/reveal'
import { AdmissionCta, PublicPage, PublicPageHero, SectionHeading, SiteFooter } from '@/components/public/public-chrome'

export const metadata = { title: 'Kegiatan' }
export const revalidate = 0

const IMAGES = [IMG.galeri1, IMG.galeri3, IMG.programSeni, IMG.programTematik, IMG.hero2, IMG.berita]

export default async function KegiatanPublikPage() {
  const activities = await db.activity.findMany({
    where: { status: 'PUBLISHED', visibility: 'PUBLIC' },
    orderBy: { startDatetime: 'desc' },
  })

  const [featured, ...others] = activities

  return (
    <PublicPage>
      <SiteHeader />
      <PublicPageHero
        index="04"
        eyebrow="Kegiatan sekolah"
        title="Hari-hari yang"
        accent="penuh cerita."
        description="Dokumentasi pengalaman anak saat bermain, berkarya, bekerja sama, dan menemukan sesuatu untuk pertama kalinya."
        image={IMG.programSeni}
        imageAlt="Anak-anak berekspresi dalam kegiatan sekolah"
      />

      <main id="main-content">
        <section className="school-section">
          <div className="public-container">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading
                eyebrow="Cerita terbaru"
                title="Belajar terlihat dari"
                accent="hal-hal kecil."
                description="Setiap foto menyimpan proses: keberanian mencoba, kesabaran mengulang, dan kegembiraan saat berhasil."
              />
              <p className="rounded-full bg-[var(--secondary)] px-4 py-2 text-xs font-bold text-[var(--primary)]">{activities.length} cerita diterbitkan</p>
            </div>

            {!featured ? (
              <div className="mt-12 rounded-[1.75rem] border border-dashed border-[var(--border)] bg-[var(--card)] p-10 text-center">
                <Camera className="mx-auto size-8 text-[var(--primary)]" />
                <h2 className="mt-4 text-xl font-bold">Belum ada cerita kegiatan.</h2>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">Dokumentasi terbaru akan hadir di halaman ini.</p>
              </div>
            ) : (
              <>
                <Reveal className="mt-12" variant="scale">
                  <article className="group grid overflow-hidden rounded-[2rem] bg-[var(--primary)] text-white shadow-[0_24px_60px_color-mix(in_srgb,var(--primary)_20%,transparent)] lg:grid-cols-[1.18fr_.82fr]">
                    <figure className="min-h-[330px] overflow-hidden lg:min-h-[500px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={featured.coverImage || IMAGES[0]} alt={featured.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]" />
                    </figure>
                    <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-[11px] font-bold uppercase tracking-[.12em]"><Sparkles className="size-3.5" /> Pilihan terbaru</span>
                      <h2 className="mt-6 text-3xl font-extrabold leading-tight tracking-[-.045em] sm:text-4xl">{featured.title}</h2>
                      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-white/75">{featured.description}</p>
                      <div className="mt-7 flex flex-wrap gap-4 text-xs font-bold text-white/80">
                        <time className="flex items-center gap-2"><CalendarDays className="size-4" /> {formatTanggalSingkat(featured.startDatetime)}</time>
                        {featured.location && <span className="flex items-center gap-2"><MapPin className="size-4" /> {featured.location}</span>}
                      </div>
                    </div>
                  </article>
                </Reveal>

                {others.length > 0 && (
                  <div className="school-activity-grid">
                    {others.map((activity, index) => (
                      <Reveal key={activity.id} delay={(index % 3) * 80} variant="scale">
                        <article className="school-activity-card h-full">
                          <figure>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={activity.coverImage || IMAGES[(index + 1) % IMAGES.length]} alt={activity.title} loading="lazy" />
                            <time>{formatTanggalSingkat(activity.startDatetime)}</time>
                          </figure>
                          <div className="school-activity-card-body">
                            <h2>{activity.title}</h2>
                            <p className="line-clamp-3 whitespace-pre-line">{activity.description}</p>
                            {activity.location && <span className="school-activity-meta"><MapPin /> {activity.location}</span>}
                          </div>
                        </article>
                      </Reveal>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <AdmissionCta title="Ingin si kecil menjadi bagian dari cerita berikutnya?" description="Kenali lingkungan belajar TK Orchid dan lihat bagaimana kegiatan harian membantu anak tumbuh dengan bahagia." />
      </main>
      <SiteFooter />
    </PublicPage>
  )
}
