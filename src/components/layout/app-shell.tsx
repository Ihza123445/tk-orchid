'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, ExternalLink, Flower2, LogOut, Menu, X } from 'lucide-react'
import { logoutAction } from '@/lib/auth/actions'
import { SidebarNav, findActiveHref, type SidebarNavSection } from '@/components/layout/sidebar-nav'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { ADMIN_SECTIONS, ROLE_LABEL } from '@/components/layout/nav-config'

function initials(name: string) {
  const words = name.replace(/\(.*?\)/g, '').trim().split(/\s+/).filter(Boolean)
  return ((words[0]?.[0] ?? '') + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase() || '?'
}

const SEGMENT_LABEL: Record<string, string> = { tambah: 'Tambah', edit: 'Ubah' }

/** Breadcrumb dari URL: Grup menu › Item menu › (Detail/Tambah/Ubah). */
function useBreadcrumb(sections: SidebarNavSection[], homeHref: string) {
  const pathname = usePathname()
  const activeHref = findActiveHref(sections, pathname)
  const section = sections.find((s) => s.items.some((item) => item.href === activeHref))
  const item = section?.items.find((i) => i.href === activeHref)
  const crumbs: { label: string; href?: string }[] = []
  if (section && item && item.href !== homeHref) {
    if (section.items.length > 1) crumbs.push({ label: section.title })
    crumbs.push({ label: item.label, href: item.href })
    const rest = pathname.slice(item.href.length).split('/').filter(Boolean)
    for (const seg of rest) crumbs.push({ label: SEGMENT_LABEL[seg] ?? (/^\d+$/.test(seg) ? 'Detail' : seg.replace(/-/g, ' ')) })
  } else {
    crumbs.push({ label: 'Dashboard' })
  }
  return crumbs
}

/**
 * Kerangka area admin/staf & guru: sidebar tetap di desktop (laci di mobile) +
 * header atas dengan breadcrumb, tanggal, tautan website, tema, dan avatar.
 */
export function AppShell({
  role,
  name,
  sections = ADMIN_SECTIONS,
  brand = 'Administrasi',
  homeHref = '/dashboard',
  children,
}: {
  role: string
  name: string
  sections?: SidebarNavSection[]
  brand?: string
  homeHref?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const crumbs = useBreadcrumb(sections, homeHref)
  const roleLabel = ROLE_LABEL[role] ?? role
  const [today] = useState(() =>
    new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Jakarta' }).format(new Date()),
  )

  // Tutup laci saat pindah halaman & kunci scroll body saat laci terbuka
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="app-shell flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-[var(--border)] bg-[var(--sidebar)] transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${
          open ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        aria-label="Navigasi"
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          <Link href={homeHref} onClick={() => setOpen(false)} className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl text-white shadow-md shadow-[var(--primary)]/30" style={{ background: 'var(--brand-gradient)' }}>
              <Flower2 className="size-5" />
            </span>
            <span className="leading-tight">
              <span className="block font-heading text-[15px] font-bold tracking-tight text-[var(--foreground)]">TK Orchid</span>
              <span className="block text-[11px] font-medium text-[var(--muted-foreground)]">{brand}</span>
            </span>
          </Link>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] lg:hidden" aria-label="Tutup menu">
            <X className="size-4" />
          </button>
        </div>

        <div className="app-scroll min-h-0 flex-1 overflow-y-auto pt-2">
          <SidebarNav key={pathname} sections={sections} onNavigate={() => setOpen(false)} />
        </div>

        <div className="shrink-0 border-t border-[var(--border)] p-3">
          <div className="flex items-center gap-3 rounded-xl bg-[var(--muted)]/70 p-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>{initials(name)}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="truncate text-[11px] text-[var(--muted-foreground)]">{roleLabel}</p>
            </div>
            <form action={logoutAction}>
              <button type="submit" title="Keluar" aria-label="Keluar" className="flex size-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)]">
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {open && <button aria-label="Tutup menu" className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden" onClick={() => setOpen(false)} />}

      {/* Konten */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[var(--background)]/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button
            type="button"
            aria-label="Buka menu"
            aria-expanded={open}
            className="inline-flex size-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] transition-colors hover:bg-[var(--muted)] lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-4" />
          </button>

          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex min-w-0 items-center gap-1.5 text-sm">
              <li className="hidden sm:block">
                <Link href={homeHref} className="text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]">{brand}</Link>
              </li>
              {crumbs.map((crumb, index) => {
                const last = index === crumbs.length - 1
                return (
                  <li key={index} className={`flex min-w-0 items-center gap-1.5 ${last ? '' : 'hidden sm:flex'}`}>
                    <ChevronRight className="hidden size-3.5 shrink-0 text-[var(--muted-foreground)]/60 sm:block" aria-hidden="true" />
                    {last || !crumb.href ? (
                      <span className={`truncate capitalize ${last ? 'font-semibold text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}`} aria-current={last ? 'page' : undefined}>{crumb.label}</span>
                    ) : (
                      <Link href={crumb.href} className="truncate text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]">{crumb.label}</Link>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium capitalize text-[var(--muted-foreground)] md:inline-block">{today}</span>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              title="Buka website sekolah"
              className="hidden size-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] sm:inline-flex"
            >
              <ExternalLink className="size-4" />
              <span className="sr-only">Buka website sekolah</span>
            </a>
            <ThemeToggle />
            <span className="hidden size-9 items-center justify-center rounded-full text-xs font-bold text-white sm:flex" style={{ background: 'var(--brand-gradient)' }} title={`${name} · ${roleLabel}`}>
              {initials(name)}
            </span>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div key={pathname} className="app-page mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  )
}
