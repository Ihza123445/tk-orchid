import Link from 'next/link'
import { requireRole } from '@/lib/auth/guard'
import { logoutAction } from '@/lib/auth/actions'
import { PortalNav } from '@/components/layout/portal-nav'
import { ThemeToggle } from '@/components/layout/theme-toggle'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('PARENT')

  const MENU = [
    { href: '/portal', label: 'Beranda' },
    { href: '/portal/tagihan', label: 'Tagihan' },
    { href: '/portal/presensi', label: 'Presensi' },
    { href: '/portal/perkembangan', label: 'Perkembangan' },
    { href: '/portal/pengumuman', label: 'Pengumuman' },
  ]

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-10 border-b bg-[var(--card)]">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4">
          <Link href="/portal" className="font-semibold text-[var(--primary)] transition-opacity duration-200 hover:opacity-80">TK Orchid · Orang Tua</Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline opacity-70">{user.name}</span>
            <ThemeToggle />
            <form action={logoutAction}>
              <button type="submit" className="rounded-md border px-3 py-1.5 transition-colors duration-200 hover:bg-[var(--muted)]">Keluar</button>
            </form>
          </div>
        </div>
        <nav className="border-t" aria-label="Menu orang tua">
          <PortalNav items={MENU} />
        </nav>
      </header>
      <main className="mx-auto max-w-[1200px] px-4 py-6">{children}</main>
    </div>
  )
}
