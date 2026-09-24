'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface SidebarNavItem {
  href: string
  label: string
}

export interface SidebarNavSection {
  title: string
  items: SidebarNavItem[]
}

/**
 * Nav list sidebar dengan:
 * - Active indicator: pill background + left accent bar + bold
 * - Hover: geser kanan halus (translate-x) + background muted
 * Dipakai admin (dashboard) dan guru.
 */
export function SidebarNav({ sections }: { sections: SidebarNavSection[] }) {
  const pathname = usePathname()

  return (
    <nav className="space-y-6 px-3 py-4" aria-label="Menu utama">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            {section.title}
          </p>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`group relative flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                      active
                        ? 'bg-[var(--secondary)] font-semibold text-[var(--primary)] shadow-sm'
                        : 'text-[var(--foreground)]/75 hover:translate-x-1 hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    {/* Left accent bar untuk item aktif */}
                    <span
                      aria-hidden="true"
                      className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-[var(--primary)] transition-opacity duration-200 ${
                        active ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
