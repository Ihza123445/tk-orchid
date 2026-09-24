import Link from 'next/link'
import { ArrowRight, CheckCircle2, Eye, ShieldCheck, Sparkles, Sun, Waves } from 'lucide-react'
import { SiteHeader } from '@/components/public/site-header'
import { Reveal } from '@/components/public/reveal'
import { AdmissionCta, PublicPage, PublicPageHero, SectionHeading, SiteFooter } from '@/components/public/public-chrome'
import { IMG } from '@/lib/assets/public-images'
import { SUPPORT_FACILITIES } from '@/lib/content/public-content'
import { getFacilities } from '@/lib/cms/content'
import { LocationSection } from '@/components/public/school-sections'

export const metadata = { title: 'Fasilitas' }

const SAFETY = [
  { icon: ShieldCheck, title: 'Ramah anak', body: 'Penataan ruang mempertimbangkan jangkauan, gerak, dan kemandirian anak.' },
  { icon: Eye, title: 'Mudah diawasi', body: 'Area aktivitas ditata agar pendamping dapat melihat dan merespons dengan cepat.' },
  { icon: Sun, title: 'Terang & berudara', body: 'Pencahayaan dan sirkulasi mendukung kegiatan belajar yang nyaman.' },
  { icon: Waves, title: 'Bersih & terawat', body: 'Rutinitas kebersihan menjadi bagian dari standar penggunaan ruang.' },
]

export default async function FasilitasPage() {
  const facilities = await getFacilities()
  return (
    <PublicPage>
      <SiteHeader />
      <PublicPageHero
        index="03"
        eyebrow="Fasilitas sekolah"
        title="Ruang yang aman untuk"
        accent="berani mencoba."
        description="Fasilitas TK Orchid dirancang sebagai bagian dari pengalaman belajar: mudah dijelajahi, bersih, hangat, dan sesuai dengan skala anak."
        image={IMG.galeri1}
        imageAlt="Anak-anak bermain di area luar"
      />

      <main id="main-content">
        <section className="school-section">
          <div className="public-container">
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <SectionHeading
                eyebrow="Jelajahi ruang kami"
                title="Setiap sudut punya"
                accent="tujuan perkembangan."
                description="Bukan sekadar ruangan yang cantik, melainkan lingkungan yang membantu anak memilih, bergerak, fokus, dan bekerja bersama."
              />
              <Link href="/kontak" className="school-text-link shrink-0">Jadwalkan kunjungan <ArrowRight /></Link>
            </div>

            <div className="mt-12 grid auto-rows-[250px] gap-4 md:grid-cols-2 lg:grid-cols-3">
              {facilities.map((facility, index) => (
                <Reveal key={facility.id} delay={(index % 3) * 80} variant="scale" className={index === 0 ? 'md:row-span-2 lg:col-span-2' : ''}>
                  <figure className="school-gallery-card h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={facility.image} alt={facility.title} loading={index < 2 ? 'eager' : 'lazy'} />
                    <figcaption>
                      <div><h2>{facility.title}</h2><p>{facility.description}</p></div>
                      <span><Sparkles className="size-4" /></span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="school-section soft">
          <div className="public-container">
            <SectionHeading
              eyebrow="Fasilitas pendukung"
              title="Detail kecil yang"
              accent="membuat tenang."
              description="Selain ruang belajar utama, sekolah dilengkapi fasilitas penunjang untuk kesehatan, kebersihan, dan kenyamanan keluarga."
              align="center"
            />
            <div className="school-support-grid">
              {SUPPORT_FACILITIES.map((item, index) => (
                <Reveal key={item.title} delay={(index % 4) * 70} variant="scale">
                  <article className="school-support-card">
                    <span><item.icon /></span>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="school-section">
          <div className="public-container">
            <SectionHeading
              eyebrow="Prinsip keamanan"
              title="Nyaman dilihat keluarga,"
              accent="nyaman dipakai anak."
              description="Keamanan hadir dalam detail penataan, kebersihan, alur pengawasan, dan kebiasaan sehari-hari."
              align="center"
            />
            <div className="school-values-grid">
              {SAFETY.map((item, index) => (
                <Reveal key={item.title} delay={index * 80} variant="scale">
                  <article className="school-value-card">
                    <span><item.icon /></span>
                    <h2>{item.title}</h2>
                    <p>{item.body}</p>
                    <i aria-hidden="true" />
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="school-section soft">
          <div className="public-container grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-20">
            <Reveal variant="left">
              <figure className="relative overflow-hidden rounded-[2rem] bg-[var(--secondary)] p-3 sm:p-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG.hero3} alt="Kelas yang terang dan tertata" loading="lazy" className="aspect-[4/3] w-full rounded-[1.5rem] object-cover" />
              </figure>
            </Reveal>
            <Reveal variant="right">
              <SectionHeading
                eyebrow="Fasilitas sebagai guru ketiga"
                title="Ruang yang baik mengundang anak"
                accent="untuk mandiri."
                description="Material disimpan pada tempat yang mudah dikenali, pilihan aktivitas terlihat jelas, dan setiap area punya batas fungsi yang membantu anak mengatur dirinya."
              />
              <ul className="school-feature-list">
                {['Perabot dan material pada skala anak', 'Area aktif dan tenang dipisahkan dengan jelas', 'Alat belajar dapat dijangkau dan dirapikan kembali', 'Visual ruang hangat tanpa stimulasi berlebihan'].map((item) => <li key={item}><CheckCircle2 /> {item}</li>)}
              </ul>
            </Reveal>
          </div>
        </section>

        <LocationSection />

        <AdmissionCta title="Foto membantu, berkunjung memberi gambaran utuh." description="Datang dan lihat bagaimana kelas, area bermain, serta rutinitas sekolah mendukung hari-hari si kecil." />
      </main>
      <SiteFooter />
    </PublicPage>
  )
}
