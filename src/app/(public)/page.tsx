import Link from 'next/link'
import { ArrowRight, ArrowUpRight, CheckCircle2, HeartHandshake, MapPin, ShieldCheck, Sparkles, UsersRound } from 'lucide-react'
import { db } from '@/lib/db/db'
import { formatTanggalSingkat } from '@/lib/formatting/format'
import { IMG } from '@/lib/assets/public-images'
import { getFacilities, getHeroSlides } from '@/lib/cms/content'
import { SiteHeader } from '@/components/public/site-header'
import { HeroSlider } from '@/components/public/hero-slider'
import { Reveal } from '@/components/public/reveal'
import { AdmissionCta, PublicPage, SchoolMarquee, SectionHeading, SiteFooter } from '@/components/public/public-chrome'
import { FaqSection, LevelsSection, LocationSection, PrincipalMessage, QuickHub, TestimonialsSection } from '@/components/public/school-sections'

export const metadata = { title: { absolute: 'TK Orchid — Tumbuh dengan Bahagia' } }
export const revalidate = 0

const VALUES = [
  { icon: HeartHandshake, title: 'Pendampingan hangat', body: 'Setiap anak dikenal, didengar, dan didampingi sesuai tahap tumbuhnya.' },
  { icon: ShieldCheck, title: 'Lingkungan aman', body: 'Ruang belajar bersih dan rutinitas sekolah dirancang ramah anak.' },
  { icon: Sparkles, title: 'Belajar bermakna', body: 'Konsep dikenalkan lewat pengalaman nyata, bukan sekadar lembar kerja.' },
  { icon: UsersRound, title: 'Dekat dengan keluarga', body: 'Orang tua menjadi rekan dalam memahami perkembangan si kecil.' },
]

export default async function HomePage() {
  const now = new Date()
  const [announcements, activities, activeStudents, activeTeachers, activityCount, admissionPeriod, slides, facilities] = await Promise.all([
    db.announcement.findMany({
      where: {
        status: 'PUBLISHED',
        audience: 'PUBLIC',
        AND: [
          { OR: [{ publishAt: null }, { publishAt: { lte: now } }] },
          { OR: [{ expireAt: null }, { expireAt: { gt: now } }] },
        ],
      },
      orderBy: { publishAt: 'desc' },
      take: 3,
    }),
    db.activity.findMany({ where: { status: 'PUBLISHED', visibility: 'PUBLIC' }, orderBy: { startDatetime: 'desc' }, take: 3 }),
    db.student.count({ where: { status: 'ACTIVE' } }),
    db.teacher.count({ where: { isActive: true } }),
    db.activity.count({ where: { status: 'PUBLISHED', visibility: 'PUBLIC' } }),
    db.admissionPeriod.findFirst({ where: { isActive: true }, orderBy: { startDate: 'desc' } }),
    getHeroSlides(),
    getFacilities(),
  ])
  const registrationOpen = Boolean(admissionPeriod && admissionPeriod.startDate <= now && admissionPeriod.endDate >= now)
  const activityImages = [IMG.galeri1, IMG.galeri3, IMG.programSeni]

  return (
    <PublicPage>
      <SiteHeader />
      <HeroSlider slides={slides.map(({ id, eyebrow, title, accent, description, image, imageAlt }) => ({ id, eyebrow, title, accent, description, image, imageAlt }))} stats={{ students: activeStudents, teachers: activeTeachers, activities: activityCount }} />
      <SchoolMarquee />

      <main id="main-content">
        <section className="school-section">
          <div className="public-container school-intro-grid">
            <Reveal variant="left" className="school-intro-collage">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.programTematik} alt="Guru mendampingi kegiatan belajar anak" loading="lazy" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.galeri3} alt="Kegiatan seni anak" loading="lazy" />
            </Reveal>
            <Reveal variant="right">
              <SectionHeading
                eyebrow="Sekilas TK Orchid"
                title="Sekolah pertama yang"
                accent="terasa seperti rumah."
                description="Masa kanak-kanak adalah waktu untuk mencoba, bertanya, tertawa, dan membangun rasa percaya diri. TK Orchid hadir untuk menjaga proses itu tetap hangat dan bermakna."
              />
              <ul className="school-feature-list">
                <li><CheckCircle2 /> Kurikulum Merdeka PAUD yang dekat dengan kehidupan anak</li>
                <li><CheckCircle2 /> Kegiatan yang seimbang antara karakter, kreativitas, dan kesiapan akademik</li>
                <li><CheckCircle2 /> Komunikasi rutin antara guru dan orang tua</li>
              </ul>
              <Link href="/profil" className="school-text-link">Kenali TK Orchid <ArrowRight /></Link>
            </Reveal>
          </div>
        </section>

        <QuickHub />

        <section className="school-section soft">
          <div className="public-container">
            <SectionHeading
              eyebrow="Mengapa keluarga memilih Orchid"
              title="Kecil kelasnya,"
              accent="besar perhatiannya."
              description="Kami menjaga pengalaman belajar tetap personal, aman, dan mudah dipahami keluarga."
              align="center"
            />
            <div className="school-values-grid">
              {VALUES.map((value, index) => (
                <Reveal key={value.title} delay={index * 90} variant="scale">
                  <article className="school-value-card">
                    <span><value.icon /></span>
                    <h3>{value.title}</h3>
                    <p>{value.body}</p>
                    <i aria-hidden="true" />
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <LevelsSection />
        <PrincipalMessage />

        <section className="school-section soft">
          <div className="public-container">
            <SectionHeading
              eyebrow="Program belajar"
              title="Bermain adalah cara anak"
              accent="memahami dunia."
              description="Program kami memberi anak kesempatan untuk bergerak, berbahasa, berkarya, memecahkan masalah, dan belajar hidup bersama."
            />

            <div className="school-program-grid">
              <Reveal variant="left">
                <article className="school-program-card purple">
                  <figure>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={IMG.programTematik} alt="Pembelajaran tematik TK Orchid" loading="lazy" />
                  </figure>
                  <div className="school-program-card-body">
                    <h3>Pembelajaran Tematik</h3>
                    <p>Literasi, numerasi, sains, dan karakter dipelajari melalui tema yang anak jumpai setiap hari.</p>
                    <ul className="school-program-points">
                      {['Kelompok Bermain · 3–4 th', 'TK A · 4–5 th', 'TK B · 5–6 th', 'Proyek sederhana'].map((point) => <li key={point}><CheckCircle2 /> {point}</li>)}
                    </ul>
                  </div>
                </article>
              </Reveal>
              <Reveal variant="right" delay={100}>
                <article className="school-program-card gold">
                  <figure>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={IMG.programSeni} alt="Program seni musik dan gerak" loading="lazy" />
                  </figure>
                  <div className="school-program-card-body">
                    <h3>Seni, Musik &amp; Gerak</h3>
                    <p>Ruang aman bagi anak untuk mengolah rasa, melatih motorik, dan berani menampilkan ekspresi.</p>
                    <ul className="school-program-points">
                      {['Musik & ritme', 'Seni rupa', 'Tari & gerak', 'Pentas semester'].map((point) => <li key={point}><CheckCircle2 /> {point}</li>)}
                    </ul>
                  </div>
                </article>
              </Reveal>
            </div>
            <Link href="/program" className="school-text-link">Lihat seluruh program <ArrowRight /></Link>
          </div>
        </section>

        <section className="school-section">
          <div className="public-container">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading
                eyebrow="Fasilitas sekolah"
                title="Ruang yang ikut"
                accent="membantu anak belajar."
                description="Setiap sudut dibuat aman, mudah dijelajahi, dan punya tujuan perkembangan yang jelas."
              />
              <Link href="/fasilitas" className="school-text-link shrink-0">Jelajahi fasilitas <ArrowRight /></Link>
            </div>
            <div className="school-gallery-grid">
              {facilities.slice(0, 5).map((facility, index) => (
                <Reveal key={facility.id} delay={(index % 3) * 80} variant="scale" className={`min-h-0 ${index === 0 ? 'school-gallery-featured' : ''}`}>
                  <figure className="school-gallery-card h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={facility.image} alt={facility.title} loading="lazy" />
                    <figcaption><div><h3>{facility.title}</h3><p>{facility.description}</p></div><span><ArrowUpRight className="size-4" /></span></figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <TestimonialsSection />

        <section className="school-section">
          <div className="public-container">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading
                eyebrow="Kegiatan terbaru"
                title="Hari-hari yang penuh"
                accent="cerita baik."
                description="Potret pengalaman anak saat mencoba, bekerja sama, dan menemukan hal baru."
              />
              <Link href="/kegiatan" className="school-text-link shrink-0">Semua kegiatan <ArrowRight /></Link>
            </div>

            {activities.length ? (
              <div className="school-activity-grid">
                {activities.map((activity, index) => (
                  <Reveal key={activity.id} delay={index * 90}>
                    <article className="school-activity-card">
                      <figure>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={activity.coverImage || activityImages[index % activityImages.length]} alt={activity.title} loading="lazy" />
                        <time>{formatTanggalSingkat(activity.startDatetime)}</time>
                      </figure>
                      <div className="school-activity-card-body">
                        <h3>{activity.title}</h3>
                        <p className="line-clamp-3">{activity.description}</p>
                        {activity.location && <span className="school-activity-meta"><MapPin /> {activity.location}</span>}
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            ) : <p className="mt-10 rounded-2xl border border-dashed border-[var(--border)] p-8 text-[var(--muted-foreground)]">Belum ada dokumentasi kegiatan.</p>}
          </div>
        </section>

        <section className="school-section soft">
          <div className="public-container grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <SectionHeading
              eyebrow="Kabar sekolah"
              title="Informasi penting,"
              accent="tanpa perlu mencari jauh."
              description="Agenda, pengingat, dan kabar terbaru untuk keluarga TK Orchid."
            />
            <div>
              {announcements.length ? (
                <div className="school-news-list">
                  {announcements.map((announcement, index) => (
                    <Reveal key={announcement.id} delay={index * 70}>
                      <Link href="/pengumuman" className="school-news-item">
                        <time>{formatTanggalSingkat(announcement.publishAt ?? announcement.createdAt)}</time>
                        <div><h3>{announcement.title}</h3><p className="line-clamp-2">{announcement.content}</p></div>
                        <ArrowUpRight />
                      </Link>
                    </Reveal>
                  ))}
                </div>
              ) : <p className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-[var(--muted-foreground)]">Belum ada pengumuman terbaru.</p>}
              <Link href="/pengumuman" className="school-text-link">Buka papan pengumuman <ArrowRight /></Link>
            </div>
          </div>
        </section>

        <FaqSection soft={false} />
        <LocationSection />

        <AdmissionCta
          title={registrationOpen ? 'Pendaftaran sedang dibuka. Mari kenali Orchid lebih dekat.' : 'Siapkan langkah pertama si kecil bersama TK Orchid.'}
          description={registrationOpen ? `${admissionPeriod!.name} tersedia sekarang. Formulir dapat diisi online dan tim sekolah akan menghubungi keluarga Anda.` : 'Pelajari alur, persyaratan, dan informasi penerimaan murid baru.'}
        />
      </main>
      <SiteFooter />
    </PublicPage>
  )
}
