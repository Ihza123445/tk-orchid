import Link from 'next/link'
import { requireRole } from '@/lib/auth/guard'
import { logoutAction } from '@/lib/auth/actions'
import { SidebarNav, type SidebarNavSection } from '@/components/layout/sidebar-nav'
import { ThemeToggle } from '@/components/layout/theme-toggle'

const MENU: SidebarNavSection[] = [
  { title: 'Overview', items: [{ href: '/guru/dashboard', label: 'Dashboard' }] },
  {
    title: 'Kelas',
    items: [
      { href: '/guru/dashboard', label: 'Kelas Saya' },
      { href: '/guru/presensi', label: 'Presensi' },
      { href: '/guru/penilaian', label: 'Penilaian' },
      { href: '/guru/perkembangan', label: 'Perkembangan' },
      { href: '/guru/jadwal', label: 'Jadwal' },
      { href: '/guru/kegiatan', label: 'Kegiatan' },
    ],
  },
  { title: 'Akun', items: [{ href: '/guru/profil', label: 'Profil' }] },
]

export default async function GuruLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('TEACHER')

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-[var(--card)] lg:flex">
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-lg font-semibold text-[var(--primary)]">TK Orchid · Guru</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <SidebarNav sections={MENU} />
        </div>

        <div className="border-t px-6 py-4">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <div className="mt-2 flex items-center gap-3">
            <form action={logoutAction}>
              <button type="submit" className="text-sm underline underline-offset-4 opacity-80 transition-opacity duration-200 hover:opacity-100">Keluar</button>
            </form>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Mobile bar */}
      <div className="fixed inset-x-0 top-0 z-40 lg:hidden">
        <div className="flex items-center justify-between border-b bg-[var(--card)] px-4 py-3">
          <span className="font-semibold text-[var(--primary)]">TK Orchid · Guru</span>
          <nav className="flex items-center gap-2 text-sm" aria-label="Menu cepat">
            <Link href="/guru/dashboard" className="rounded border px-2 py-1 transition-colors duration-200 hover:bg-[var(--muted)]">Home</Link>
            <Link href="/guru/presensi" className="rounded border px-2 py-1 transition-colors duration-200 hover:bg-[var(--muted)]">Presensi</Link>
            <form action={logoutAction}><button type="submit" className="rounded border px-2 py-1 transition-colors duration-200 hover:bg-[var(--muted)]">Keluar</button></form>
            <ThemeToggle />
          </nav>
        </div>
      </div>

      <main className="min-w-0 flex-1 px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pt-6">
        <div className="mx-auto max-w-[1440px]">{children}</div>
      </main>
    </div>
  )
}
