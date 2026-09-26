'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpenCheck,
  CalendarRange,
  ChevronDown,
  Search,
  X,
  GalleryHorizontalEnd,
  Globe,
  Megaphone,
  MessageSquareQuote,
  MessagesSquare,
  Settings2,
  Sparkles,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardCheck,
  CreditCard,
  FileChartColumnIncreasing,
  GraduationCap,
  HandCoins,
  House,
  Images,
  LayoutDashboard,
  ReceiptText,
  School,
  UserRound,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'

export type SidebarIcon =
  | 'dashboard' | 'students' | 'guardians' | 'years' | 'classes' | 'attendance'
  | 'assessment' | 'development' | 'fees' | 'invoices' | 'payments' | 'expenses'
  | 'schedule' | 'activities' | 'profile' | 'home' | 'admissions'
  | 'website' | 'settings' | 'slider' | 'news' | 'gallery' | 'facilities' | 'testimonials' | 'faq' | 'periods' | 'stories'

export const ICONS: Record<SidebarIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  students: GraduationCap,
  guardians: UsersRound,
  years: CalendarDays,
  classes: School,
  attendance: ClipboardCheck,
  assessment: BookOpenCheck,
  development: ChartNoAxesCombined,
  fees: WalletCards,
  invoices: ReceiptText,
  payments: CreditCard,
  expenses: HandCoins,
  schedule: CalendarDays,
  activities: Images,
  profile: UserRound,
  home: House,
  admissions: ClipboardCheck,
  website: Globe,
  settings: Settings2,
  slider: GalleryHorizontalEnd,
  news: Megaphone,
  gallery: Images,
  facilities: School,
  testimonials: MessageSquareQuote,
  faq: MessagesSquare,
  periods: CalendarRange,
  stories: Sparkles,
}

export interface SidebarNavItem {
  href: string
  label: string
  icon?: SidebarIcon
}

export interface SidebarNavSection {
  title: string
  items: SidebarNavItem[]
}

/** Cari item nav paling spesifik yang cocok dengan URL (mis. /website/galeri tidak ikut mengaktifkan /website). */
export function findActiveHref(sections: SidebarNavSection[], pathname: string) {
  return sections
    .flatMap((section) => section.items.map((item) => item.href))
    .filter((href) => pathname === href || pathname.startsWith(href + '/'))
    .sort((a, b) => b.length - a.length)[0]
}

function NavLink({ item, active, onNavigate }: { item: SidebarNavItem; active: boolean; onNavigate?: () => void }) {
  const Icon = item.icon ? ICONS[item.icon] : FileChartColumnIncreasing
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`group relative flex h-9 items-center gap-3 rounded-xl px-3 text-sm transition-all duration-150 ${
        active
          ? 'bg-[var(--primary)]/10 font-semibold text-[var(--primary)]'
          : 'text-[var(--foreground)]/70 hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[var(--primary)] transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}
      />
      <Icon className={`size-[18px] shrink-0 transition-transform duration-150 ${active ? '' : 'opacity-70 group-hover:scale-110 group-hover:opacity-100'}`} aria-hidden="true" />
      <span className="truncate">{item.label}</span>
    </Link>
  )
}

/**
 * Nav sidebar admin & guru.
 * - Kotak pencarian menyaring menu (berguna untuk menu admin yang panjang).
 * - Pada menu panjang, grup bisa dilipat dan hanya grup yang memuat halaman aktif terbuka otomatis.
 * - Item aktif: latar primary lembut + garis indikator di tepi kiri.
 */
export function SidebarNav({ sections, onNavigate }: { sections: SidebarNavSection[]; onNavigate?: () => void }) {
  const pathname = usePathname()
  const activeHref = findActiveHref(sections, pathname)
  // Pilihan buka/tutup dari pengguna; bila belum pernah diubah, ikuti apakah grup memuat halaman aktif
  const [toggled, setToggled] = useState<Record<string, boolean>>({})
  const [query, setQuery] = useState('')
  const total = sections.reduce((sum, section) => sum + section.items.length, 0)
  // Menu pendek (guru) selalu terbuka; menu panjang (admin) hanya membuka grup yang aktif
  const long = total > 12
  const q = query.trim().toLowerCase()
  const matches = q
    ? sections.flatMap((section) => section.items.filter((item) => `${item.label} ${section.title}`.toLowerCase().includes(q)).map((item) => ({ item, section: section.title })))
    : []

  return (
    <nav className="px-3 pb-4" aria-label="Menu utama">
      {long && (
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari menu…"
            aria-label="Cari menu"
            className="h-9 w-full rounded-xl border border-[var(--border)] bg-[var(--muted)]/60 pl-9 pr-8 text-sm placeholder:text-[var(--muted-foreground)] [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]" aria-label="Hapus pencarian">
              <X className="size-3.5" />
            </button>
          )}
        </div>
      )}

      {q ? (
        matches.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-[var(--muted-foreground)]">Menu “{query}” tidak ditemukan.</p>
        ) : (
          <ul className="space-y-0.5">
            {matches.map(({ item, section }) => (
              <li key={item.href}>
                <NavLink item={item} active={item.href === activeHref} onNavigate={() => { setQuery(''); onNavigate?.() }} />
                <span className="sr-only">di {section}</span>
              </li>
            ))}
          </ul>
        )
      ) : (
        <div className="space-y-1">
          {sections.map((section) => {
            const hasActive = section.items.some((item) => item.href === activeHref)
            const collapsible = long && section.items.length > 1
            const open = !collapsible || (toggled[section.title] ?? hasActive)
            const listId = `nav-${section.title.toLowerCase().replace(/\W+/g, '-')}`
            return (
              <div key={section.title} className={section.items.length > 1 ? 'pt-3' : ''}>
                {!collapsible && section.items.length > 1 && (
                  <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted-foreground)]/80">{section.title}</p>
                )}
                {collapsible && (
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={listId}
                    onClick={() => setToggled((current) => ({ ...current, [section.title]: !open }))}
                    className="mb-1 flex w-full items-center justify-between rounded-lg px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted-foreground)]/80 transition-colors hover:text-[var(--foreground)]"
                  >
                    <span className="flex items-center gap-2">
                      {section.title}
                      {!open && hasActive && <span className="size-1.5 rounded-full bg-[var(--primary)]" aria-label="berisi halaman aktif" />}
                    </span>
                    <ChevronDown className={`size-3.5 transition-transform duration-200 ${open ? '' : '-rotate-90'}`} aria-hidden="true" />
                  </button>
                )}
                <div className={`grid transition-[grid-template-rows] duration-200 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <ul id={listId} className="space-y-0.5 overflow-hidden pl-3 -ml-3" inert={!open}>
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <NavLink item={item} active={item.href === activeHref} onNavigate={onNavigate} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </nav>
  )
}
