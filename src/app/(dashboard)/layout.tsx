import { requireAdminStaff } from '@/lib/auth/guard'
import { AppShell } from '@/components/layout/app-shell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminStaff()

  return (
    <AppShell role={user.role} name={user.name}>
      {children}
    </AppShell>
  )
}
