export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Memuat halaman">
      <div className="flex items-center gap-4">
        <div className="size-12 animate-pulse rounded-2xl bg-[var(--muted)]" />
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-[var(--muted)]" />
          <div className="h-6 w-56 animate-pulse rounded-lg bg-[var(--muted)]" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="app-card h-32 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="app-card h-72 animate-pulse lg:col-span-2" />
        <div className="app-card h-72 animate-pulse" />
      </div>
    </div>
  )
}
