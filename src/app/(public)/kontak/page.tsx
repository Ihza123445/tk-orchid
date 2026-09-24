import Link from 'next/link'
import { ArrowRight, Clock3, Mail, MapPin, MessageCircle, Phone, School, Sparkles } from 'lucide-react'
import { SiteHeader } from '@/components/public/site-header'
import { Reveal } from '@/components/public/reveal'
import { IMG } from '@/lib/assets/public-images'
import { PublicPage, PublicPageHero, SectionHeading, SiteFooter } from '@/components/public/public-chrome'
import { FaqSection, LocationSection } from '@/components/public/school-sections'
import { whatsappLink } from '@/lib/content/public-content'
import { getSiteSettings } from '@/lib/cms/content'

export const metadata = { title: 'Kontak' }

export default async function KontakPage() {
  const s = await getSiteSettings()
  const CONTACTS = [
    { icon: MapPin, title: 'Lokasi sekolah', body: s.address, detail: 'Klik "Buka Google Maps" di bawah untuk petunjuk arah.' },
    { icon: Phone, title: 'Telepon / WhatsApp', body: `+${s.whatsapp.replace(/\D/g, '')}`, detail: 'Klik tombol WhatsApp di pojok kanan bawah untuk chat langsung.' },
    { icon: Mail, title: 'Email', body: s.email, detail: 'Untuk pertanyaan umum dan administrasi.' },
    { icon: Clock3, title: 'Jam layanan', body: s.hours, detail: 'Pesan di luar jam layanan dibalas pada hari kerja.' },
  ]
  return (
    <PublicPage>
      <SiteHeader />
      <PublicPageHero
        index="06"
        eyebrow="Hubungi TK Orchid"
        title="Mari mulai dengan"
        accent="percakapan hangat."
        description="Tanyakan program belajar, proses pendaftaran, atau jadwalkan kunjungan. Tim sekolah akan membantu keluarga menemukan informasi yang dibutuhkan."
        image={IMG.hero1}
        imageAlt="Anak tersenyum saat bermain"
      />

      <main id="main-content">
        <section className="school-section">
          <div className="public-container">
            <SectionHeading
              eyebrow="Informasi kontak"
              title="Pilih cara yang"
              accent="paling nyaman."
              description="Untuk kunjungan sekolah, hubungi kami lebih dulu agar tim dapat menyiapkan waktu pendampingan yang tepat."
              align="center"
            />

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CONTACTS.map((contact, index) => (
                <Reveal key={contact.title} delay={index * 80} variant="scale">
                  <article className="group h-full rounded-[1.65rem] border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:-translate-y-1.5 hover:shadow-[0_18px_45px_color-mix(in_srgb,var(--foreground)_8%,transparent)]">
                    <span className="grid size-12 place-items-center rounded-2xl bg-[var(--secondary)] text-[var(--primary)] transition-colors group-hover:bg-[var(--primary)] group-hover:text-[var(--primary-foreground)]"><contact.icon className="size-5" /></span>
                    <h2 className="mt-6 text-lg font-extrabold tracking-[-.025em]">{contact.title}</h2>
                    <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">{contact.body}</p>
                    <p className="mt-2 text-xs leading-6 text-[var(--muted-foreground)]">{contact.detail}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="school-section soft">
          <div className="public-container grid overflow-hidden rounded-[2.25rem] bg-[var(--card)] shadow-[0_24px_65px_color-mix(in_srgb,var(--foreground)_8%,transparent)] lg:grid-cols-[1.05fr_.95fr]">
            <Reveal variant="left" className="min-h-[420px]">
              <figure className="relative h-full min-h-[420px] overflow-hidden lg:rounded-r-[8rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG.galeri2} alt="Orang tua dan anak membaca bersama" loading="lazy" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#32122f]/65 via-transparent to-transparent" />
                <figcaption className="absolute bottom-7 left-7 right-7 flex items-center gap-3 text-white">
                  <span className="grid size-11 place-items-center rounded-2xl bg-white/15 backdrop-blur-md"><School className="size-5" /></span>
                  <div><strong className="block text-sm">Kunjungan sekolah</strong><small className="text-white/70">Kenali ruang, program, dan tim pengajar.</small></div>
                </figcaption>
              </figure>
            </Reveal>

            <Reveal variant="right" className="flex items-center p-7 sm:p-10 lg:p-14">
              <div>
                <span className="school-eyebrow"><Sparkles className="size-4" /> Datang dan kenal lebih dekat</span>
                <h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-[-.05em] sm:text-5xl">Lihat suasana belajar sebelum menentukan pilihan.</h2>
                <p className="mt-5 leading-8 text-[var(--muted-foreground)]">Saat berkunjung, keluarga dapat melihat ruang kelas, mengenal ritme kegiatan, dan berdiskusi tentang kebutuhan tumbuh kembang anak.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/pendaftaran" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--primary)] px-6 text-sm font-bold text-[var(--primary-foreground)] transition-transform hover:-translate-y-0.5">Informasi PPDB <ArrowRight className="size-4" /></Link>
                  <a href={whatsappLink(s.whatsapp, 'Halo TK Orchid, saya ingin menjadwalkan kunjungan sekolah.')} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[var(--border)] px-5 text-sm font-bold transition-colors hover:border-[var(--primary)]"><MessageCircle className="size-4 text-[var(--primary)]" /> Chat WhatsApp</a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
        <LocationSection />
        <FaqSection limit={4} />
      </main>
      <SiteFooter />
    </PublicPage>
  )
}
