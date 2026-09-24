import Link from 'next/link'
import { Flower2, LogOut } from 'lucide-react'
import { requireRole } from '@/lib/auth/guard'
import { logoutAction } from '@/lib/auth/actions'
import { PortalNav, PortalTabBar, type PortalNavItem } from '@/components/layout/portal-nav'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { initials } from '@/components/dashboard/primitives'

const MENU: PortalNavItem[] = [
  { href: '/portal', label: 'Beranda', icon: 'home' },
  { href: '/portal/tagihan', label: 'Tagihan', icon: 'invoices' },
  { href: '/portal/presensi', label: 'Presensi', icon: 'attendance' },
  { href: '/portal/perkembangan', label: 'Rapor', icon: 'development' },
  { href: '/portal/pengumuman', label: 'Info', icon: 'news' },
]

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('PARENT')

  return (
    <div className="app-shell relative min-h-screen">
      {/* Aksen lembut di bagian atas halaman */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_srgb,var(--primary)_12%,transparent),transparent)]" />

      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/portal" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl text-white shadow-md shadow-[var(--primary)]/30" style={{ background: 'var(--brand-gradient)' }}>
              <Flower2 className="size-5" />
            </span>
            <span className="leading-tight">
              <span className="block font-heading text-[15px] font-bold tracking-tight">TK Orchid</span>
              <span className="block text-[11px] font-medium text-[var(--muted-foreground)]">Portal Orang Tua</span>
            </span>
          </Link>

          <div className="hidden md:block">
            <PortalNav items={MENU} />
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden items-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--card)] py-1 pl-1 pr-3 lg:flex">
              <span className="flex size-7 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>{initials(user.name)}</span>
              <span className="max-w-[140px] truncate text-sm font-medium">{user.name}</span>
            </div>
            <form action={logoutAction}>
              <button type="submit" title="Keluar" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-medium transition-colors hover:border-[var(--destructive)]/40 hover:text-[var(--destructive)]">
                <LogOut className="size-4" /> <span className="hidden sm:inline">Keluar</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1200px] px-4 pb-28 pt-6 sm:px-6 md:pb-12 lg:pt-8">
        <div className="app-page">{children}</div>
      </main>

      <PortalTabBar items={MENU} />
    </div>
  )
}
