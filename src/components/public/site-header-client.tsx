'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, ChevronDown, Clock3, Flower2, Mail, MapPin, Menu, X } from 'lucide-react'
import { NavLink } from '@/components/public/nav-link'
import { ThemeToggle } from '@/components/layout/theme-toggle'

type NavItem = { href: string; label: string; children?: { href: string; label: string; description: string }[] }

const NAV: NavItem[] = [
  { href: '/', label: 'Beranda' },
  {
    href: '/profil',
    label: 'Tentang',
    children: [
      { href: '/profil', label: 'Profil sekolah', description: 'Cerita, visi, dan cara kami mendampingi' },
      { href: '/pendidik', label: 'Guru & staf', description: 'Tim pendidik yang menemani si kecil' },
      { href: '/fasilitas', label: 'Fasilitas', description: 'Ruang belajar dan area bermain' },
    ],
  },
  { href: '/program', label: 'Program' },
  {
    href: '/kegiatan',
    label: 'Kegiatan',
    children: [
      { href: '/kegiatan', label: 'Cerita kegiatan', description: 'Dokumentasi hari-hari di sekolah' },
      { href: '/galeri', label: 'Galeri foto', description: 'Potret keseruan belajar dan bermain' },
      { href: '/pengumuman', label: 'Pengumuman', description: 'Agenda dan kabar terbaru' },
    ],
  },
  {
    href: '/pendaftaran',
    label: 'PPDB',
    children: [
      { href: '/pendaftaran#formulir', label: 'Formulir pendaftaran', description: 'Isi data calon murid secara online' },
      { href: '/faq', label: 'Tanya jawab (FAQ)', description: 'Pertanyaan yang sering diajukan' },
    ],
  },
  { href: '/kontak', label: 'Kontak' },
]

function isActive(pathname: string, item: NavItem) {
  if (item.href === '/') return pathname === '/'
  const hrefs = item.children ? item.children.map((child) => child.href) : [item.href]
  return hrefs.some((href) => pathname.startsWith(href.split('#')[0]))
}

export interface HeaderInfo {
  schoolName: string
  tagline: string
  topbarText: string
  hours: string
  email: string
  address: string
}

export function SiteHeaderClient({ info }: { info: HeaderInfo }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const close = () => { setOpen(false); setExpanded(null) }

  return (
    <header id="top" className={`school-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="school-topbar">
        <div className="public-container flex h-9 items-center justify-between text-[11px] font-semibold">
          <p className="flex items-center gap-2"><span className="school-topbar-dot" /> {info.topbarText}</p>
          <div className="flex items-center gap-6 opacity-90">
            <span className="flex items-center gap-1.5"><Clock3 className="size-3.5" /> {info.hours}</span>
            <span className="flex items-center gap-1.5"><Mail className="size-3.5" /> {info.email}</span>
            <span className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {info.address}</span>
          </div>
        </div>
      </div>

      <div className="public-container school-header-bar">
        <Link href="/" onClick={close} className="school-logo" aria-label={`${info.schoolName}, kembali ke beranda`}>
          <span aria-hidden="true"><Flower2 className="size-5" /></span>
          <span className="leading-tight">
            <strong>{info.schoolName}</strong>
            <small>{info.tagline}</small>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Navigasi utama">
          {NAV.map((item) =>
            item.children ? (
              <div key={item.label} className="school-dropdown">
                <button type="button" className={`school-dropdown-trigger ${isActive(pathname, item) ? 'active' : ''}`} aria-haspopup="true">
                  {item.label} <ChevronDown aria-hidden="true" />
                </button>
                <div className="school-dropdown-menu">
                  <div>
                    {item.children.map((child) => (
                      <Link key={child.href} href={child.href} aria-current={pathname.startsWith(child.href.split('#')[0]) ? 'page' : undefined}>
                        <strong>{child.label}</strong>
                        <small>{child.description}</small>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle className="size-11 rounded-full" />
          <Link href="/pendaftaran#formulir" onClick={close} className="school-header-cta">
            Daftar PPDB <ArrowRight className="size-4" />
          </Link>
          <button
            type="button"
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={open}
            aria-controls="public-mobile-nav"
            onClick={() => setOpen((value) => !value)}
            className="school-burger xl:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div id="public-mobile-nav" className={`grid transition-[grid-template-rows] duration-300 xl:hidden ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <nav className={`public-container school-mobile-nav ${open ? 'open' : ''}`} aria-label="Navigasi utama mobile">
            {NAV.map((item, index) =>
              item.children ? (
                <div key={item.label} className={`school-mobile-group ${expanded === item.label ? 'open' : ''}`} style={{ animationDelay: `${index * 40}ms` }}>
                  <button type="button" aria-expanded={expanded === item.label} onClick={() => setExpanded(expanded === item.label ? null : item.label)}>
                    {item.label} <ChevronDown aria-hidden="true" />
                  </button>
                  <div className="school-mobile-sub">
                    <div>
                      {item.children.map((child) => (
                        <Link key={child.href} href={child.href} onClick={close} aria-current={pathname.startsWith(child.href.split('#')[0]) ? 'page' : undefined}>{child.label}</Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div key={item.href} className="school-mobile-group" style={{ animationDelay: `${index * 40}ms` }}>
                  <NavLink href={item.href} label={item.label} onNavigate={close} />
                </div>
              ),
            )}
            <Link href="/pendaftaran#formulir" onClick={close} className="school-header-cta mt-2 justify-between">
              Daftar PPDB <ArrowRight className="size-4" />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
