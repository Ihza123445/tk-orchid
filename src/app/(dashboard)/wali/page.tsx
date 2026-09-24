import Link from 'next/link'
import { requireAdminStaff } from '@/lib/auth/guard'
import { listGuardians } from '@/actions/guardians'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface PageProps {
  searchParams: Promise<{ page?: string; q?: string }>
}

const REL: Record<string, string> = { AYAH: 'Ayah', IBU: 'Ibu', WALI: 'Wali', LAINNYA: 'Lainnya' }

export default async function WaliPage({ searchParams }: PageProps) {
  await requireAdminStaff()
  const sp = await searchParams
  const page = Number(sp.page ?? '1') || 1
  const search = sp.q?.trim() || undefined

  const { total, rows, pageSize } = await listGuardians({ page, search })
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Data Wali</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Total {total} wali terdaftar.</p>
        </div>
        <Link href="/wali/tambah"><Button>Tambah Wali</Button></Link>
      </header>

      <form className="flex flex-wrap items-center gap-2" action="/wali">
        <Input name="q" placeholder="Cari nama / telepon…" defaultValue={search ?? ''} className="max-w-xs" />
        <Button type="submit" variant="outline">Cari</Button>
      </form>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">Belum ada data wali untuk pencarian ini.</p>
          <Link href="/wali/tambah" className="mt-3 inline-block"><Button variant="outline">Tambah Wali</Button></Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-[var(--card)]">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b bg-[var(--muted)] text-left">
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Hubungan</th>
                <th className="px-4 py-3 font-medium">Telepon</th>
                <th className="px-4 py-3 font-medium">Anak Terhubung</th>
                <th className="px-4 py-3 font-medium">Akun Portal</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((g) => (
                <tr key={g.id} className="border-b last:border-0 hover:bg-[var(--muted)]/50 transition-colors duration-150">
                  <td className="px-4 py-3">
                    <Link href={`/wali/${g.id}`} className="font-medium underline-offset-4 hover:underline">{g.fullName}</Link>
                    {g.occupation && <span className="block text-xs text-[var(--muted-foreground)]">{g.occupation}</span>}
                  </td>
                  <td className="px-4 py-3">{REL[g.relationship] ?? g.relationship}</td>
                  <td className="px-4 py-3 tabular-nums">{g.phone}</td>
                  <td className="px-4 py-3">{g.studentGuardians.length} anak</td>
                  <td className="px-4 py-3">
                    {g.user ? (
                      <span className="rounded-full bg-[var(--secondary)] px-2 py-0.5 text-xs text-[var(--primary)]">{g.user.email}</span>
                    ) : (
                      <span className="text-xs text-[var(--muted-foreground)]">belum ada</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-between" aria-label="Navigasi halaman">
          <p className="text-sm text-[var(--muted-foreground)]">Halaman {page} dari {totalPages}</p>
          <div className="flex gap-2">
            {page > 1 && <Link href={`/wali?page=${page - 1}`}><Button variant="outline" size="sm">Sebelumnya</Button></Link>}
            {page < totalPages && <Link href={`/wali?page=${page + 1}`}><Button variant="outline" size="sm">Berikutnya</Button></Link>}
          </div>
        </nav>
      )}
    </div>
  )
}
