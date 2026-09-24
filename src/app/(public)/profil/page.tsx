import Link from 'next/link'
import { ArrowRight, BookOpen, CheckCircle2, Heart, Leaf, Target, UsersRound } from 'lucide-react'
import { SiteHeader } from '@/components/public/site-header'
import { Reveal } from '@/components/public/reveal'
import { AdmissionCta, PublicPage, PublicPageHero, SectionHeading, SiteFooter } from '@/components/public/public-chrome'
import { IMG } from '@/lib/assets/public-images'
import { PrincipalMessage, TestimonialsSection } from '@/components/public/school-sections'

export const metadata = { title: 'Profil' }

const PRINCIPLES = [
  { icon: Heart, title: 'Disambut dengan hangat', body: 'Anak merasa aman lebih dulu sebelum diajak mengeksplorasi hal baru.' },
  { icon: Leaf, title: 'Tumbuh sesuai tahapnya', body: 'Kami menghargai ritme perkembangan setiap anak tanpa membandingkan.' },
  { icon: UsersRound, title: 'Belajar hidup bersama', body: 'Empati, kemandirian, dan kebiasaan baik tumbuh dari rutinitas harian.' },
]

export default function ProfilPage() {
  return (
    <PublicPage>
      <SiteHeader />
      <PublicPageHero
        index="01"
        eyebrow="Tentang TK Orchid"
        title="Mengenal anak,"
        accent="menjaga prosesnya."
        description="TK Orchid adalah ruang belajar anak usia dini yang memadukan bermain, pembiasaan karakter, dan pengalaman belajar yang dekat dengan kehidupan."
        image={IMG.hero3}
        imageAlt="Lingkungan belajar TK Orchid"
      />

      <main id="main-content">
        <section className="school-section">
          <div className="public-container grid gap-12 lg:grid-cols-[.92fr_1.08fr] lg:items-center lg:gap-20">
            <Reveal variant="left">
              <figure className="relative overflow-hidden rounded-[2rem] bg-[var(--secondary)] p-3 sm:p-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG.programTematik} alt="Guru belajar bersama anak" className="aspect-[4/5] w-full rounded-[1.5rem] object-cover" />
                <figcaption className="absolute bottom-8 left-8 right-8 rounded-2xl bg-white/90 p-4 text-[#2a1828] shadow-xl backdrop-blur-md">
                  <strong className="block text-sm">Setiap anak berhak merasa dikenal.</strong>
                  <span className="mt-1 block text-xs text-[#6f6470]">Itulah titik awal semua proses belajar kami.</span>
                </figcaption>
              </figure>
            </Reveal>

            <Reveal variant="right">
              <SectionHeading
                eyebrow="Cerita kami"
                title="Bertumbuh bukan perlombaan,"
                accent="melainkan perjalanan."
                description="Kami percaya kesiapan akademik lahir lebih kuat ketika anak punya rasa aman, rasa ingin tahu, dan keberanian untuk mencoba. Karena itu, proses belajar selalu dimulai dari hubungan yang baik."
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[var(--secondary)] p-5"><Target className="size-6 text-[var(--primary)]" /><h2 className="mt-4 font-bold">Visi</h2><p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">Menumbuhkan anak yang cerdas, mandiri, berani, dan berakhlak mulia.</p></div>
                <div className="rounded-2xl bg-[color-mix(in_srgb,var(--accent)_13%,var(--card))] p-5"><BookOpen className="size-6 text-[var(--warning)]" /><h2 className="mt-4 font-bold">Kurikulum</h2><p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">Kurikulum Merdeka PAUD berbasis bermain dan tahap perkembangan anak.</p></div>
              </div>
              <Link href="/program" className="school-text-link">Pelajari program belajar <ArrowRight /></Link>
            </Reveal>
          </div>
        </section>

        <PrincipalMessage />

        <section className="school-section soft">
          <div className="public-container">
            <SectionHeading
              eyebrow="Cara kami mendampingi"
              title="Hangat dalam hubungan,"
              accent="jelas dalam tujuan."
              description="Pendekatan kami sederhana: anak nyaman, keluarga memahami prosesnya, dan setiap kegiatan punya alasan perkembangan yang jelas."
              align="center"
            />
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {PRINCIPLES.map((principle, index) => (
                <Reveal key={principle.title} delay={index * 100} variant="scale">
                  <article className="h-full rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] p-7 text-center shadow-sm">
                    <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--secondary)] text-[var(--primary)]"><principle.icon className="size-6" /></span>
                    <h2 className="mt-6 text-xl font-bold tracking-[-.03em]">{principle.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">{principle.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="school-section">
          <div className="public-container grid gap-12 lg:grid-cols-[1fr_.9fr] lg:items-center lg:gap-20">
            <Reveal variant="left">
              <SectionHeading
                eyebrow="Kemitraan dengan keluarga"
                title="Sekolah dan rumah"
                accent="berjalan searah."
                description="Orang tua tidak hanya menerima hasil akhir. Kami membuka ruang komunikasi agar perkembangan anak dapat dipahami dan didukung bersama."
              />
              <ul className="school-feature-list">
                {['Informasi kegiatan dan pengumuman tersusun jelas', 'Pemantauan presensi dan perkembangan melalui portal', 'Komunikasi langsung dengan wali kelas', 'Laporan perkembangan yang mudah dipahami'].map((item) => <li key={item}><CheckCircle2 /> {item}</li>)}
              </ul>
            </Reveal>
            <Reveal variant="right">
              <figure className="relative overflow-hidden rounded-[2rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG.galeri2} alt="Orang tua dan anak membaca bersama" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <figcaption className="absolute bottom-0 p-7 text-lg font-bold text-white">Tumbuh bersama membutuhkan percakapan yang baik.</figcaption>
              </figure>
            </Reveal>
          </div>
        </section>

        <TestimonialsSection />

        <AdmissionCta title="Datang, lihat kelas, dan rasakan suasana Orchid." description="Kunjungan sekolah membantu keluarga mengenal lingkungan, guru, dan rutinitas belajar sebelum mendaftar." />
      </main>
      <SiteFooter />
    </PublicPage>
  )
}
