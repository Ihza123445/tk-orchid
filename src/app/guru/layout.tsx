import { requireRole } from '@/lib/auth/guard'
import { Sidebar } from '@/components/layout/sidebar'
import type { SidebarNavSection } from '@/components/layout/sidebar-nav'

const MENU: SidebarNavSection[] = [
  { title: 'Overview', items: [{ href: '/guru/dashboard', label: 'Dashboard', icon: 'dashboard' }] },
  {
    title: 'Kelas',
    items: [
      { href: '/guru/presensi', label: 'Presensi', icon: 'attendance' },
      { href: '/guru/penilaian', label: 'Penilaian', icon: 'assessment' },
      { href: '/guru/perkembangan', label: 'Perkembangan', icon: 'development' },
      { href: '/guru/jadwal', label: 'Jadwal', icon: 'schedule' },
      { href: '/guru/kegiatan', label: 'Kegiatan', icon: 'activities' },
    ],
  },
  { title: 'Akun', items: [{ href: '/guru/profil', label: 'Profil', icon: 'profile' }] },
]

export default async function GuruLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('TEACHER')

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] lg:flex-row">
      <div className="sticky top-0 z-40 w-full lg:static lg:z-auto lg:w-64 lg:shrink-0">
        <Sidebar role={user.role} name={user.name} sections={MENU} brand="Portal Guru" homeHref="/guru/dashboard" />
      </div>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px]">{children}</div>
      </main>
    </div>
  )
}
