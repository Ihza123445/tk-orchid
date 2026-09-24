import { requireRole } from '@/lib/auth/guard'
import { AppShell } from '@/components/layout/app-shell'
import { GURU_SECTIONS } from '@/components/layout/nav-config'

export default async function GuruLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('TEACHER')

  return (
    <AppShell role={user.role} name={user.name} sections={GURU_SECTIONS} brand="Portal Guru" homeHref="/guru/dashboard">
      {children}
    </AppShell>
  )
}
