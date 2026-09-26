'use client'

import { RotateCcw, TriangleAlert } from 'lucide-react'

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[55vh] items-center justify-center">
      <div className="app-card w-full max-w-lg p-8 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[var(--destructive)]/10 text-[var(--destructive)]">
          <TriangleAlert className="size-5" />
        </span>
        <h2 className="mt-4 font-heading text-lg font-bold">Terjadi kesalahan</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Data tidak dapat dimuat. Coba lagi, atau hubungi administrator jika masalah berlanjut.
        </p>
        <button
          onClick={reset}
          className="mt-5 inline-flex h-9 items-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] shadow-sm transition-opacity hover:opacity-90"
        >
          <RotateCcw className="size-4" /> Coba lagi
        </button>
      </div>
    </div>
  )
}
