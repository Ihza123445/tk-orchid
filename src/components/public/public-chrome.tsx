import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUp, ArrowUpRight, ChevronRight, Clock3, Flower2, Mail, MapPin, MessageCircle, Sparkles } from 'lucide-react'
import { Reveal } from '@/components/public/reveal'
import { SiteEnhancements } from '@/components/public/site-enhancements'
import { whatsappLink } from '@/lib/content/public-content'
import { getSiteSettings } from '@/lib/cms/content'

export async function PublicPage({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings()
  return (
    <div className="public-site min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <a className="public-skip-link" href="#main-content">Lewati ke konten utama</a>
      {children}
      <SiteEnhancements whatsapp={settings.whatsapp} />
    </div>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  align = 'left',
  className = '',
}: {
  eyebrow: string
  title: string
  accent?: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}) {
  return (
    <Reveal className="school-heading-reveal">
      <header className={`school-section-heading ${align === 'center' ? 'centered' : ''} ${className}`}>
        <span className="school-eyebrow"><Sparkles className="size-4" /> {eyebrow}</span>
        <h2 aria-label={accent ? `${title} ${accent}` : undefined}>{title}{accent ? <> <span>{accent}</span></> : null}</h2>
        {description && <p>{description}</p>}
      </header>
    </Reveal>
  )
}

// Kompatibilitas untuk section lama sambil seluruh halaman memakai sistem baru.
export function EditorialHeading({
  label,
  title,
  accent,
  description,
  className = '',
}: {
  index: string
  label: string
  title: string
  accent?: string
  description?: string
  className?: string
}) {
  return <SectionHeading eyebrow={label} title={title} accent={accent} description={description} className={className} />
}

export function PublicPageHero({
  eyebrow,
  title,
  accent,
  description,
  image,
  imageAlt,
}: {
  index: string
  eyebrow: string
  title: string
  accent?: string
  description: string
  image: string
  imageAlt: string
}) {
  return (
    <section className="school-banner" aria-labelledby="page-title">
      <div className="school-banner-media" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" fetchPriority="high" />
      </div>
      <span className="sr-only">{imageAlt}</span>
      <div className="school-banner-shade" aria-hidden="true" />

      <div className="public-container school-banner-inner">
        <nav className="school-banner-crumb" aria-label="Breadcrumb">
          <Link href="/">Beranda</Link>
          <ChevronRight aria-hidden="true" />
          <span aria-current="page">{eyebrow}</span>
        </nav>
        <h1 id="page-title" aria-label={accent ? `${title} ${accent}` : undefined}>
          {title}{accent ? <> <span>{accent}</span></> : null}
        </h1>
        <p>{description}</p>
      </div>

      <svg className="school-banner-wave" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 60V32c160 22 360 30 560 14S980 2 1180 8c110 3 190 12 260 22v30z" />
      </svg>
    </section>
  )
}

const RIBBON_FRONT = ['Bermain dengan makna', 'Tumbuh dengan bahagia', 'Belajar dengan berani', 'Berkarya setiap hari', 'Berteman dengan hangat']
const RIBBON_BACK = ['PPDB dibuka', 'Kelompok Bermain', 'TK A', 'TK B', 'Daftar online sekarang']

function RibbonTrack({ items, icon: Icon }: { items: string[]; icon: typeof Flower2 }) {
  // Satu grup diulang agar selalu lebih lebar dari layar; dua grup identik = loop mulus di -50%
  const group = [...items, ...items, ...items]
  return (
    <div className="school-ribbon-track">
      {[0, 1].map((copy) => (
        <ul key={copy} className="school-ribbon-group">
          {group.map((item, index) => (
            <li key={`${copy}-${index}`}>{item}<Icon aria-hidden="true" /></li>
          ))}
        </ul>
      ))}
    </div>
  )
}

export function SchoolMarquee() {
  return (
    <div className="school-ribbons" aria-hidden="true">
      <div className="school-ribbon back"><RibbonTrack items={RIBBON_BACK} icon={Sparkles} /></div>
      <div className="school-ribbon front"><RibbonTrack items={RIBBON_FRONT} icon={Flower2} /></div>
    </div>
  )
}

export async function AdmissionCta({
  title = 'Siap melihat si kecil tumbuh bersama Orchid?',
  description = 'Kenali lingkungan sekolah kami dan temukan program yang sesuai untuk langkah pertamanya.',
}: {
  title?: string
  description?: string
}) {
  const settings = await getSiteSettings()
  return (
    <section className="public-container pb-20 sm:pb-28">
      <div className="school-cta">
        <div className="school-cta-doodle" aria-hidden="true"><Flower2 /><Flower2 /><Flower2 /></div>
        <div>
          <span className="school-eyebrow light"><Sparkles className="size-4" /> Penerimaan murid baru</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="school-cta-actions">
          <Link href="/pendaftaran#formulir">Daftar PPDB <ArrowRight /></Link>
          <a href={whatsappLink(settings.whatsapp, 'Halo TK Orchid, saya ingin menjadwalkan kunjungan sekolah.')} target="_blank" rel="noreferrer" className="secondary">Jadwalkan kunjungan</a>
        </div>
      </div>
    </section>
  )
}

export async function SiteFooter() {
  const s = await getSiteSettings()
  const socials = [
    { href: s.instagram, label: 'Instagram' },
    { href: s.facebook, label: 'Facebook' },
    { href: s.youtube, label: 'YouTube' },
  ].filter((item) => item.href)
  return (
    <footer className="school-footer">
      <div className="public-container school-footer-top">
        <div className="school-footer-intro">
          <div className="school-footer-brand">
            <span><Flower2 className="size-5" /></span>
            <div><strong>{s.schoolName}</strong><small>{s.tagline}</small></div>
          </div>
          <p>{s.footerText}</p>
          <div className="school-footer-hours"><Clock3 /> {s.hours}</div>
        </div>

        <nav aria-label="Navigasi footer">
          <p className="school-footer-label">Jelajahi</p>
          <div className="school-footer-links">
            <Link href="/profil">Tentang sekolah</Link>
            <Link href="/pendidik">Guru &amp; staf</Link>
            <Link href="/program">Program belajar</Link>
            <Link href="/fasilitas">Fasilitas</Link>
            <Link href="/kegiatan">Kegiatan</Link>
            <Link href="/galeri">Galeri</Link>
            <Link href="/pengumuman">Pengumuman</Link>
            <Link href="/faq">Tanya jawab</Link>
          </div>
        </nav>

        <div>
          <p className="school-footer-label">Hubungi kami</p>
          <ul className="school-footer-contact">
            <li><MapPin /> {s.address}</li>
            <li><Mail /> <a href={`mailto:${s.email}`}>{s.email}</a></li>
            <li><MessageCircle /> <a href={whatsappLink(s.whatsapp)} target="_blank" rel="noreferrer">Chat WhatsApp</a></li>
          </ul>
          <Link className="school-footer-contact-link" href="/kontak">Lihat informasi kontak <ArrowUpRight /></Link>
        </div>

        <div className="school-footer-portal">
          <p className="school-footer-label">Area keluarga</p>
          <p>Informasi akademik, presensi, perkembangan, dan tagihan dalam satu portal.</p>
          <Link href="/login">Masuk portal <ArrowRight /></Link>
        </div>
      </div>

      <div className="public-container school-footer-bottom">
        <span>© {new Date().getFullYear()} {s.schoolName}</span>
        {socials.length ? (
          <span className="flex flex-wrap gap-4">{socials.map((item) => <a key={item.label} href={item.href} target="_blank" rel="noreferrer">{item.label} <ArrowUpRight /></a>)}</span>
        ) : <span>Dibuat untuk keluarga Orchid</span>}
        <a href="#top">Kembali ke atas <ArrowUp /></a>
      </div>
    </footer>
  )
}
