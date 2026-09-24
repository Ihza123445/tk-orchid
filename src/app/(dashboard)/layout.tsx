import { requireAdminStaff } from '@/lib/auth/guard'
import { Sidebar } from '@/components/layout/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminStaff()

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <div className="contents lg:block lg:w-64 lg:shrink-0">
        <Sidebar role={user.role} name={user.name} />
      </div>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px]">{children}</div>
      </main>
    </div>
  )
}
