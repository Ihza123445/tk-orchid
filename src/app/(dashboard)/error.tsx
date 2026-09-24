'use client'

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="rounded-lg border bg-[var(--card)] p-6">
      <h2 className="text-lg font-semibold">Terjadi kesalahan</h2>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Data tidak dapat dimuat. Coba lagi, atau hubungi administrator jika masalah berlanjut.
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
      >
        Coba Lagi
      </button>
    </div>
  )
}
