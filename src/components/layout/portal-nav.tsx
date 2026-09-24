'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChartNoAxesCombined, ClipboardCheck, House, Megaphone, ReceiptText, type LucideIcon } from 'lucide-react'

export type PortalIcon = 'home' | 'invoices' | 'attendance' | 'development' | 'news'

const ICONS: Record<PortalIcon, LucideIcon> = {
  home: House,
  invoices: ReceiptText,
  attendance: ClipboardCheck,
  development: ChartNoAxesCombined,
  news: Megaphone,
}

export interface PortalNavItem {
  href: string
  label: string
  icon: PortalIcon
}

function isActive(pathname: string, href: string) {
  // Detail anak (/portal/anak/…) dianggap bagian dari Beranda
  if (href === '/portal') return pathname === '/portal' || pathname.startsWith('/portal/anak')
  return pathname === href || pathname.startsWith(href + '/')
}

/** Nav portal orang tua versi desktop: tab pil berikon di header. */
export function PortalNav({ items }: { items: PortalNavItem[] }) {
  const pathname = usePathname()
  return (
    <div className="flex items-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/60 p-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href)
        const Icon = ICONS[item.icon]
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-xl px-3 text-sm transition-all duration-200 ${
              active
                ? 'bg-[var(--card)] font-semibold text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            <Icon className="size-4" aria-hidden="true" />
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}

/** Tab bar bawah untuk ponsel — pola aplikasi sekolah untuk orang tua. */
export function PortalTabBar({ items }: { items: PortalNavItem[] }) {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Menu orang tua"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--card)]/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {items.map((item) => {
          const active = isActive(pathname, item.href)
          const Icon = ICONS[item.icon]
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 px-1 pb-2 pt-2.5 text-[10.5px] font-medium transition-colors ${
                  active ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
                }`}
              >
                <span className={`flex h-7 w-12 items-center justify-center rounded-full transition-all duration-200 ${active ? 'bg-[var(--primary)]/12' : ''}`}>
                  <Icon className={`size-[19px] ${active ? 'stroke-[2.3]' : ''}`} aria-hidden="true" />
                </span>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
