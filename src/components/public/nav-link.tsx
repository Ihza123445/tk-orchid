'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface PublicNavLinkItem {
  href: string
  label: string
}

/**
 * Link navbar dengan animated underline.
 * - Active: warna primary + underline penuh
 * - Hover: underline tumbuh dari kiri (scale-x origin-left)
 */
export function NavLink({
  href,
  label,
  onNavigate,
}: {
  href: string
  label: string
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const active = href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`group relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
        active
          ? 'text-[var(--primary)]'
          : 'text-[var(--foreground)]/80 hover:text-[var(--primary)]'
      }`}
    >
      {label}
      <span
        aria-hidden="true"
        className={`absolute inset-x-3 bottom-0 h-0.5 origin-left rounded-full bg-[var(--primary)] transition-transform duration-300 ease-out ${
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`}
      />
    </Link>
  )
}
