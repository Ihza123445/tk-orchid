import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  Footprints,
  HeartHandshake,
  Music2,
  Palette,
} from 'lucide-react'
import { SiteHeader } from '@/components/public/site-header'
import { Reveal } from '@/components/public/reveal'
import { AdmissionCta, PublicPage, PublicPageHero, SectionHeading, SiteFooter } from '@/components/public/public-chrome'
import { IMG } from '@/lib/assets/public-images'
import { EXTRACURRICULAR, SIGNATURE_EVENTS } from '@/lib/content/public-content'
import { FaqSection } from '@/components/public/school-sections'

export const metadata = { title: 'Program Belajar' }

const LEARNING_AREAS = [
  { icon: BookOpen, title: 'Bahasa & literasi', body: 'Menyimak, bercerita, bermain bunyi, dan mengenal simbol lewat pengalaman sehari-hari.' },
  { icon: Brain, title: 'Nalar & eksplorasi', body: 'Mengamati, membandingkan, mengelompokkan, dan mencari jawaban melalui eksperimen sederhana.' },
  { icon: Palette, title: 'Seni & kreativitas', body: 'Mengolah warna, bentuk, musik, dan imajinasi tanpa terpaku pada satu hasil yang seragam.' },
  { icon: Footprints, title: 'Motorik & kemandirian', body: 'Menguatkan koordinasi tubuh, kebiasaan merawat diri, dan keberanian mencoba.' },
]

const DAY_FLOW = [
  { time: '07.30', title: 'Datang & transisi', body: 'Anak disambut, menyimpan barang, lalu memilih aktivitas pembuka.' },
  { time: '08.00', title: 'Lingkaran pagi', body: 'Bernyanyi, berbagi cerita, dan mengenal rencana bermain hari itu.' },
  { time: '08.30', title: 'Eksplorasi tematik', body: 'Bermain dalam kelompok kecil melalui proyek, eksperimen, seni, atau literasi.' },
  { time: '10.00', title: 'Gerak & bermain luar', body: 'Melatih motorik kasar, kerja sama, dan keberanian di ruang terbuka.' },
  { time: '11.00', title: 'Refleksi & pulang', body: 'Anak merapikan ruang, mengingat kembali pengalamannya, lalu bersiap pulang.' },
]

export default function ProgramPage() {
  return (
    <PublicPage>
      <SiteHeader />
      <PublicPageHero
        index="02"
        eyebrow="Program belajar"
        title="Belajar yang dekat dengan"
        accent="dunia anak."
        description="Kurikulum Merdeka PAUD kami diterjemahkan menjadi pengalaman bermain yang punya tujuan, tetapi tetap memberi ruang bagi rasa ingin tahu anak."
        image={IMG.programTematik}
        imageAlt="Guru mendampingi anak dalam pembelajaran tematik"
      />

      <main id="main-content">
        <section className="school-section">
          <div className="public-container">
            <SectionHeading
              eyebrow="Pilihan kelompok"
              title="Satu tujuan,"
              accent="ritme yang berbeda."
              description="Tantangan belajar disesuaikan dengan usia, kesiapan, dan kebutuhan masing-masing anak."
              align="center"
            />

            <div className="school-program-grid three">
              <Reveal variant="left">
                <article className="school-program-card pink">
                  <figure>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={IMG.galeri1} alt="Anak bermain gembira di area bermain" />
                  </figure>
                  <div className="school-program-card-body">
                    <p className="!mt-0 text-xs font-bold uppercase tracking-[.16em] opacity-70">Usia 3–4 tahun</p>
                    <h2 className="mt-2 text-3xl font-extrabold tracking-[-.04em]">Kelompok Bermain</h2>
                    <p>Pengalaman sekolah pertama yang lembut: merasa aman, bermain bersama, dan mulai mandiri.</p>
                    <ul className="school-program-points">
                      {['Adaptasi bertahap', 'Bermain sensori', 'Bernyanyi & bercerita', 'Kemandirian dasar'].map((item) => <li key={item}><CheckCircle2 /> {item}</li>)}
                    </ul>
                    <Link href="/pendaftaran?jenjang=kb#formulir" className="school-program-cta">Daftar Kelompok Bermain <ArrowRight /></Link>
                  </div>
                </article>
              </Reveal>

              <Reveal delay={100}>
                <article className="school-program-card purple">
                  <figure>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={IMG.hero2} alt="Anak bermain dengan balok edukatif" />
                  </figure>
                  <div className="school-program-card-body">
                    <p className="!mt-0 text-xs font-bold uppercase tracking-[.16em] opacity-70">Usia 4–5 tahun</p>
                    <h2 className="mt-2 text-3xl font-extrabold tracking-[-.04em]">TK A</h2>
                    <p>Mengembangkan komunikasi, motorik, dan rasa ingin tahu lewat proyek tematik yang menyenangkan.</p>
                    <ul className="school-program-points">
                      {['Proyek tematik sederhana', 'Mengenal rutinitas kelas', 'Bermain bahasa & angka', 'Melatih koordinasi tubuh'].map((item) => <li key={item}><CheckCircle2 /> {item}</li>)}
                    </ul>
                    <Link href="/pendaftaran?jenjang=tk-a#formulir" className="school-program-cta">Daftar TK A <ArrowRight /></Link>
                  </div>
                </article>
              </Reveal>

              <Reveal variant="right" delay={200}>
                <article className="school-program-card gold">
                  <figure>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={IMG.hero3} alt="Anak belajar bersama di kelas" />
                  </figure>
                  <div className="school-program-card-body">
                    <p className="!mt-0 text-xs font-bold uppercase tracking-[.16em] opacity-70">Usia 5–6 tahun</p>
                    <h2 className="mt-2 text-3xl font-extrabold tracking-[-.04em]">TK B</h2>
                    <p>Memperkuat kemandirian, nalar, kesiapan literasi-numerasi, dan keterampilan bekerja bersama.</p>
                    <ul className="school-program-points">
                      {['Proyek tematik bertahap', 'Kesiapan baca-tulis-hitung', 'Mengungkapkan pendapat', 'Tanggung jawab sederhana'].map((item) => <li key={item}><CheckCircle2 /> {item}</li>)}
                    </ul>
                    <Link href="/pendaftaran?jenjang=tk-b#formulir" className="school-program-cta">Daftar TK B <ArrowRight /></Link>
                  </div>
                </article>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="school-section soft">
          <div className="public-container">
            <SectionHeading
              eyebrow="Lingkup perkembangan"
              title="Yang dilatih tidak hanya"
              accent="kepala, tetapi seluruh diri."
              description="Setiap tema menghubungkan beberapa kemampuan sekaligus agar anak belajar secara utuh."
              align="center"
            />
            <div className="school-values-grid">
              {LEARNING_AREAS.map((area, index) => (
                <Reveal key={area.title} delay={index * 80} variant="scale">
                  <article className="school-value-card">
                    <span><area.icon /></span>
                    <h2>{area.title}</h2>
                    <p>{area.body}</p>
                    <i aria-hidden="true" />
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="school-section">
          <div className="public-container grid gap-12 lg:grid-cols-[.82fr_1.18fr] lg:items-start lg:gap-20">
            <Reveal variant="left">
              <SectionHeading
                eyebrow="Ritme harian"
                title="Terstruktur agar anak"
                accent="merasa aman."
                description="Urutan kegiatan yang konsisten membantu anak tahu apa yang akan terjadi, sambil tetap memberi ruang untuk spontanitas dan pilihan."
              />
              <div className="mt-8 rounded-[1.75rem] bg-[var(--secondary)] p-6">
                <HeartHandshake className="size-7 text-[var(--primary)]" />
                <h2 className="mt-4 text-lg font-bold">Catatan untuk keluarga</h2>
                <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">Alur ini adalah gambaran umum. Jadwal dapat menyesuaikan tema, kebutuhan kelas, dan agenda sekolah.</p>
              </div>
            </Reveal>

            <div className="relative">
              <div className="absolute bottom-8 left-[2.45rem] top-8 w-px bg-[var(--border)]" aria-hidden="true" />
              <ol className="relative grid gap-3">
                {DAY_FLOW.map((item, index) => (
                  <Reveal key={item.time} delay={index * 65} variant="right">
                    <li className="grid grid-cols-[5rem_1fr] gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition-transform hover:translate-x-1 sm:grid-cols-[6rem_1fr] sm:p-5">
                      <time className="relative z-10 flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)] text-xs font-extrabold text-[var(--primary-foreground)]"><Clock3 className="size-3.5" /> {item.time}</time>
                      <div><h2 className="font-bold">{item.title}</h2><p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{item.body}</p></div>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="school-section soft">
          <div className="public-container grid gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center lg:gap-20">
            <Reveal variant="left">
              <figure className="overflow-hidden rounded-[2rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG.programSeni} alt="Anak berekspresi lewat seni dan gerak" loading="lazy" className="aspect-[4/3] w-full object-cover" />
              </figure>
            </Reveal>
            <Reveal variant="right">
              <span className="school-eyebrow"><Music2 className="size-4" /> Pengayaan</span>
              <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-[-.05em] sm:text-5xl">Seni, musik, gerak, dan <span className="font-[var(--font-playful)] text-[var(--primary)]">ruang berekspresi.</span></h2>
              <p className="mt-5 leading-8 text-[var(--muted-foreground)]">Anak tidak dituntut menghasilkan karya yang sama. Mereka diajak mengenal bahan, ritme, gerak, dan rasa percaya diri untuk menunjukkan idenya.</p>
              <Link href="/kegiatan" className="school-text-link">Lihat cerita kegiatan <ArrowRight /></Link>
            </Reveal>
          </div>
        </section>

        <section className="school-section">
          <div className="public-container">
            <SectionHeading
              eyebrow="Ekstrakurikuler"
              title="Ruang untuk bakat"
              accent="yang mulai tumbuh."
              description="Kegiatan pilihan di luar jam inti untuk mengasah minat anak dengan suasana yang santai dan menyenangkan."
              align="center"
            />
            <div className="school-extra-grid">
              {EXTRACURRICULAR.map((item, index) => (
                <Reveal key={item.title} delay={(index % 3) * 90} variant="up">
                  <article className="school-extra-card">
                    <span><item.icon /></span>
                    <div><h3>{item.title}</h3><p>{item.body}</p></div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="school-section soft">
          <div className="public-container">
            <SectionHeading
              eyebrow="Kegiatan unggulan"
              title="Pengalaman yang"
              accent="selalu dinanti."
              description="Belajar tidak berhenti di dalam kelas. Setiap semester anak-anak mengikuti kegiatan istimewa berikut."
            />
            <ol className="school-event-rail">
              {SIGNATURE_EVENTS.map((event, index) => (
                <Reveal key={event.title} as="li" delay={index * 90} variant="up">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <h3>{event.title}</h3>
                  <p>{event.body}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <FaqSection soft={false} limit={4} />

        <AdmissionCta title="Program yang baik terasa saat dilihat langsung." description="Jadwalkan kunjungan untuk mengenal kelas, bertemu tim sekolah, dan mendiskusikan kebutuhan si kecil." />
      </main>
      <SiteFooter />
    </PublicPage>
  )
}
