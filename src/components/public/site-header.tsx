'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NavLink } from '@/components/public/nav-link'
import { ThemeToggle } from '@/components/layout/theme-toggle'

const LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/profil', label: 'Profil' },
  { href: '/kegiatan', label: 'Kegiatan' },
  { href: '/pengumuman', label: 'Pengumuman' },
  { href: '/kontak', label: 'Kontak' },
]

/**
 * Navbar publik TK Orchid — sticky, backdrop blur, hover underline animasi,
 * active page highlight, toggle tema, CTA Daftar, menu mobile.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Tutup menu mobile tiap pindah halaman
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--primary)] transition-opacity duration-200 hover:opacity-80"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-[var(--primary-foreground)]"
          >
            TO
          </span>
          <span className="hidden sm:inline">TK Orchid</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {LINKS.map((l) => (
            <NavLink key={l.href} {...l} />
          ))}
        </nav>

        {/* Aksi kanan */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/pendaftaran"
            className="hidden rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-black shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:inline-flex"
          >
            Daftar Sekarang
          </Link>
          {/* Hamburger mobile */}
          <button
            type="button"
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] transition-colors duration-200 hover:bg-[var(--muted)] lg:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`overflow-hidden border-t border-[var(--border)] transition-all duration-300 ease-out lg:hidden ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col gap-1 px-4 py-3" aria-label="Navigasi utama (mobile)">
          {LINKS.map((l) => (
            <NavLink key={l.href} {...l} onNavigate={() => setOpen(false)} />
          ))}
          <Link
            href="/pendaftaran"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-black transition-transform duration-200 active:scale-95"
          >
            Daftar Sekarang
          </Link>
        </nav>
      </div>
    </header>
  )
}
