import Link from 'next/link'
import { ArrowRight, ArrowUpRight, BookOpen, CheckCircle2, Clock3, ClipboardList, Images, Mail, MapPin, MessageCircle, Quote } from 'lucide-react'
import { Reveal } from '@/components/public/reveal'
import { SectionHeading } from '@/components/public/public-chrome'
import { TestimonialCarousel } from '@/components/public/testimonial-carousel'
import { FaqAccordion } from '@/components/public/faq-accordion'
import { LEVELS, whatsappLink } from '@/lib/content/public-content'
import { getFaqs, getSiteSettings, getTestimonials } from '@/lib/cms/content'

export async function PrincipalMessage() {
  const s = await getSiteSettings()
  if (!s.principalQuote.trim()) return null
  return (
    <section className="school-section">
      <div className="public-container">
        <div className="school-principal">
          <Reveal variant="left" className="school-principal-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.principalImage} alt={s.principalName} loading="lazy" />
            <span className="school-principal-ring" aria-hidden="true" />
          </Reveal>
          <Reveal variant="right" className="school-principal-copy">
            <span className="school-eyebrow"><Quote className="size-4" /> Sambutan kepala sekolah</span>
            <blockquote>“{s.principalQuote}”</blockquote>
            <p><strong>{s.principalName}</strong><span>{s.principalRole}</span></p>
            <Link href="/profil" className="school-text-link">Baca profil sekolah <ArrowRight /></Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export function LevelsSection({ soft = false }: { soft?: boolean }) {
  return (
    <section className={`school-section ${soft ? 'soft' : ''}`}>
      <div className="public-container">
        <SectionHeading
          eyebrow="Jenjang pendidikan"
          title="Satu langkah di setiap"
          accent="usia emasnya."
          description="Setiap jenjang punya tujuan perkembangan yang jelas, dengan kelas kecil agar guru mengenal anak secara personal."
          align="center"
        />
        <div className="school-level-grid">
          {LEVELS.map((level, index) => (
            <Reveal key={level.name} delay={index * 110} variant="up">
              <article className={`school-level-card ${level.tone}`}>
                <span className="school-level-age">{level.age}</span>
                <h3>{level.name}</h3>
                <p>{level.body}</p>
                <ul>{level.points.map((point) => <li key={point}><CheckCircle2 /> {point}</li>)}</ul>
                <Link href={`/pendaftaran?jenjang=${level.slug}#formulir`}>Daftar {level.name} <ArrowUpRight /></Link>
                <i aria-hidden="true" />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export async function QuickHub() {
  const s = await getSiteSettings()
  const items = [
    { href: '/program', icon: BookOpen, title: 'Jelajahi program', body: 'Kurikulum, ritme harian, dan ekstrakurikuler.' },
    { href: whatsappLink(s.whatsapp), icon: MessageCircle, title: 'Bicara dengan admisi', body: 'Tanya langsung via WhatsApp.', external: true },
    { href: '/galeri', icon: Images, title: 'Intip ruang kelas', body: 'Galeri foto suasana belajar.' },
    { href: '/pendaftaran#formulir', icon: ClipboardList, title: 'Isi formulir', body: 'Daftar online dalam 5 menit.' },
  ]
  return (
    <section className="public-container school-hub-wrap">
      <div className="school-hub">
        {items.map((item, index) => (
          <Reveal key={item.title} delay={index * 80} variant="scale">
            <Link href={item.href} className="school-hub-item" {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}>
              <span><item.icon /></span>
              <div><strong>{item.title}</strong><small>{item.body}</small></div>
              <ArrowUpRight className="school-hub-arrow" />
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export async function TestimonialsSection() {
  const testimonials = await getTestimonials()
  if (!testimonials.length) return null
  return (
    <section className="school-section school-testimonial-section">
      <div className="school-testimonial-bg" aria-hidden="true" />
      <div className="public-container school-testimonial-grid">
        <SectionHeading
          eyebrow="Kata orang tua"
          title="Cerita keluarga yang"
          accent="tumbuh bersama kami."
          description="Kepercayaan keluarga adalah alasan kami terus menjaga kualitas pendampingan setiap hari."
        />
        <Reveal variant="right">
          <TestimonialCarousel items={testimonials.map(({ id, name, relation, quote }) => ({ id, name, relation, quote }))} />
        </Reveal>
      </div>
    </section>
  )
}

export function toFaqItem(faq: { id: number; question: string; answer: string; category: string }) {
  return { id: faq.id, q: faq.question, a: faq.answer, cat: faq.category }
}

export async function FaqSection({ limit = 5, soft = true }: { limit?: number; soft?: boolean }) {
  const [faqs, s] = await Promise.all([getFaqs(), getSiteSettings()])
  if (!faqs.length) return null
  return (
    <section className={`school-section ${soft ? 'soft' : ''}`}>
      <div className="public-container school-faq-grid">
        <div>
          <SectionHeading
            eyebrow="Tanya jawab"
            title="Pertanyaan yang"
            accent="sering muncul."
            description="Belum menemukan jawaban? Tim kami siap membantu melalui WhatsApp pada jam layanan."
          />
          <Reveal className="mt-8 flex flex-wrap gap-3">
            <Link href="/faq" className="school-pill-button">Semua pertanyaan <ArrowRight /></Link>
            <a href={whatsappLink(s.whatsapp)} target="_blank" rel="noreferrer" className="school-pill-button ghost"><MessageCircle /> Tanya langsung</a>
          </Reveal>
        </div>
        <Reveal variant="right">
          <FaqAccordion items={faqs.slice(0, limit).map(toFaqItem)} />
        </Reveal>
      </div>
    </section>
  )
}

export async function LocationSection() {
  const s = await getSiteSettings()
  return (
    <section className="school-section">
      <div className="public-container">
        <div className="school-location">
          <Reveal variant="left" className="school-location-info">
            <span className="school-eyebrow"><MapPin className="size-4" /> Lokasi sekolah</span>
            <h2>Mampir dan rasakan <span>suasananya.</span></h2>
            <ul>
              <li><MapPin /><div><strong>Alamat</strong><small>{s.address}</small></div></li>
              <li><Clock3 /><div><strong>Jam layanan</strong><small>{s.hours}</small></div></li>
              <li><Mail /><div><strong>Email</strong><small>{s.email}</small></div></li>
            </ul>
            <div className="flex flex-wrap gap-3">
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.mapQuery)}`} target="_blank" rel="noreferrer" className="school-pill-button">Buka Google Maps <ArrowUpRight /></a>
              <a href={whatsappLink(s.whatsapp, 'Halo TK Orchid, saya ingin menjadwalkan kunjungan sekolah.')} target="_blank" rel="noreferrer" className="school-pill-button ghost"><MessageCircle /> Jadwalkan kunjungan</a>
            </div>
          </Reveal>
          <Reveal variant="right" className="school-location-map">
            <iframe
              title={`Peta lokasi ${s.schoolName}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(s.mapQuery)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
