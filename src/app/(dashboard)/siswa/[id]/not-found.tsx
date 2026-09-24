import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <h2 className="text-xl font-semibold">Data tidak ditemukan</h2>
      <p className="text-sm text-[var(--muted-foreground)]">
        Data yang Anda cari tidak ada atau sudah dihapus.
      </p>
      <Link href="/dashboard" className="text-sm underline underline-offset-4">Kembali ke Dashboard</Link>
    </div>
  )
}
