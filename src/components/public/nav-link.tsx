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
      className={`group relative flex min-h-11 items-center rounded-xl px-3 text-[13px] font-semibold transition-colors duration-200 ${
        active
          ? 'bg-[var(--secondary)] text-[var(--primary)]'
          : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
      }`}
    >
      {label}
      <span
        aria-hidden="true"
        className={`absolute inset-x-3 bottom-1.5 h-0.5 origin-left rounded-full bg-[var(--primary)] transition-transform duration-300 ease-out ${
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`}
      />
    </Link>
  )
}
