'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpenCheck,
  CalendarRange,
  ChevronDown,
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

const ICONS: Record<SidebarIcon, LucideIcon> = {
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

/**
 * Nav sidebar admin & guru.
 * - Pada menu panjang, grup bisa dilipat dan hanya grup yang memuat halaman aktif terbuka otomatis.
 * - Item aktif: latar lembut + teks primary. Tanpa efek geser agar tetap tenang.
 */
export function SidebarNav({ sections, onNavigate }: { sections: SidebarNavSection[]; onNavigate?: () => void }) {
  const pathname = usePathname()
  // Item paling spesifik yang cocok dengan URL (mis. /website/galeri tidak ikut mengaktifkan /website)
  const activeHref = sections
    .flatMap((section) => section.items.map((item) => item.href))
    .filter((href) => pathname === href || pathname.startsWith(href + '/'))
    .sort((a, b) => b.length - a.length)[0]
  // Pilihan buka/tutup dari pengguna; bila belum pernah diubah, ikuti apakah grup memuat halaman aktif
  const [toggled, setToggled] = useState<Record<string, boolean>>({})
  // Menu pendek (guru) selalu terbuka; menu panjang (admin) hanya membuka grup yang aktif
  const long = sections.reduce((sum, section) => sum + section.items.length, 0) > 12

  return (
    <nav className="space-y-1 px-3 py-4" aria-label="Menu utama">
      {sections.map((section) => {
        const hasActive = section.items.some((item) => item.href === activeHref)
        const collapsible = long && section.items.length > 1
        const open = !collapsible || (toggled[section.title] ?? hasActive)
        const listId = `nav-${section.title.toLowerCase().replace(/\W+/g, '-')}`
        return (
          <div key={section.title} className={section.items.length > 1 ? 'pt-2' : ''}>
            {!collapsible && section.items.length > 1 && (
              <p className="px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)]">{section.title}</p>
            )}
            {collapsible && (
              <button
                type="button"
                aria-expanded={open}
                aria-controls={listId}
                onClick={() => setToggled((current) => ({ ...current, [section.title]: !open }))}
                className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
              >
                <span className="flex items-center gap-2">
                  {section.title}
                  {!open && hasActive && <span className="size-1.5 rounded-full bg-[var(--primary)]" aria-label="berisi halaman aktif" />}
                </span>
                <ChevronDown className={`size-3.5 transition-transform duration-200 ${open ? '' : '-rotate-90'}`} aria-hidden="true" />
              </button>
            )}
            <div className={`grid transition-[grid-template-rows] duration-200 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <ul id={listId} className="space-y-0.5 overflow-hidden" inert={!open}>
                {section.items.map((item) => {
                  const active = item.href === activeHref
                  const Icon = item.icon ? ICONS[item.icon] : FileChartColumnIncreasing
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center gap-2.5 rounded-md px-3 py-[7px] text-sm transition-colors duration-150 ${
                          active
                            ? 'bg-[var(--secondary)] font-medium text-[var(--primary)]'
                            : 'text-[var(--foreground)]/70 hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                        }`}
                      >
                        <Icon className={`size-4 shrink-0 ${active ? '' : 'opacity-70'}`} aria-hidden="true" />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        )
      })}
    </nav>
  )
}
