'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface PortalNavItem {
  href: string
  label: string
}

/**
 * Nav horizontal portal orang tua:
 * - Active: warna primary + bold + underline tebal
 * - Hover: background muted + transisi halus
 */
export function PortalNav({ items }: { items: PortalNavItem[] }) {
  const pathname = usePathname()

  return (
    <div className="mx-auto flex max-w-[1200px] gap-1 overflow-x-auto px-2 py-1.5 text-sm">
      {items.map((m) => {
        const active = m.href === '/portal' ? pathname === '/portal' : pathname.startsWith(m.href)
        return (
          <Link
            key={m.href}
            href={m.href}
            aria-current={active ? 'page' : undefined}
            className={`relative whitespace-nowrap rounded-md px-3 py-1.5 transition-all duration-200 ${
              active
                ? 'font-semibold text-[var(--primary)]'
                : 'text-[var(--foreground)]/75 hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {m.label}
            {/* Active underline */}
            <span
              aria-hidden="true"
              className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[var(--primary)] transition-opacity duration-200 ${
                active ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </Link>
        )
      })}
    </div>
  )
}
