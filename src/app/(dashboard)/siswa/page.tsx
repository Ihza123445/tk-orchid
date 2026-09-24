import Link from 'next/link'
import { requireAdminStaff } from '@/lib/auth/guard'
import { listStudents } from '@/actions/students'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatTanggalSingkat } from '@/lib/formatting/format'

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Aktif',
  INACTIVE: 'Nonaktif',
  CANDIDATE: 'Kandidat',
  GRADUATED: 'Lulus',
  TRANSFERRED: 'Pindah',
  WITHDRAWN: 'Keluar',
}

interface PageProps {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>
}

export default async function SiswaPage({ searchParams }: PageProps) {
  await requireAdminStaff()
  const sp = await searchParams
  const page = Number(sp.page ?? '1') || 1
  const search = sp.q?.trim() || undefined
  const status = sp.status || undefined

  const { total, pageSize, rows } = await listStudents({ page, search, status })
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Data Siswa</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Total {total} siswa terdaftar.</p>
        </div>
        <Link href="/siswa/tambah">
          <Button>Tambah Siswa</Button>
        </Link>
      </header>

      {/* Filter bar */}
      <form className="flex flex-wrap items-center gap-2" action="/siswa">
        <Input name="q" placeholder="Cari nama / NIS / kode…" defaultValue={search ?? ''} className="max-w-xs" />
        <select
          name="status"
          defaultValue={status ?? ''}
          className="h-9 rounded-md border border-[var(--input)] bg-[var(--card)] px-3 text-sm"
          aria-label="Filter status"
        >
          <option value="">Semua Status</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <Button type="submit" variant="outline">Filter</Button>
      </form>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">Belum ada data siswa untuk filter ini.</p>
          <Link href="/siswa/tambah" className="mt-3 inline-block"><Button variant="outline">Tambah Siswa</Button></Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-[var(--card)]">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b bg-[var(--muted)] text-left">
                <th className="px-4 py-3 font-medium">Siswa</th>
                <th className="px-4 py-3 font-medium">NIS</th>
                <th className="px-4 py-3 font-medium">JK</th>
                <th className="px-4 py-3 font-medium">Kelas</th>
                <th className="px-4 py-3 font-medium">Wali</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-[var(--muted)]/50 transition-colors duration-150">
                  <td className="px-4 py-3">
                    <Link href={`/siswa/${s.id}`} className="font-medium underline-offset-4 hover:underline">
                      {s.fullName}
                    </Link>
                    <span className="block text-xs text-[var(--muted-foreground)]">{s.studentCode}</span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{s.nis ?? '-'}</td>
                  <td className="px-4 py-3">{s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                  <td className="px-4 py-3">{s.enrollments[0]?.klass.name ?? '-'}</td>
                  <td className="px-4 py-3">{s.studentGuardians[0]?.guardian.fullName ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        s.status === 'ACTIVE'
                          ? 'bg-[var(--secondary)] text-[var(--primary)]'
                          : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                      }`}
                    >
                      {STATUS_LABEL[s.status] ?? s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/siswa/${s.id}`} className="underline-offset-4 hover:underline">Detail</Link>
                      <Link href={`/siswa/${s.id}/edit`} className="underline-offset-4 hover:underline">Edit</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-between" aria-label="Navigasi halaman">
          <p className="text-sm text-[var(--muted-foreground)]">
            Halaman {page} dari {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/siswa?page=${page - 1}${search ? `&q=${encodeURIComponent(search)}` : ''}`}>
                <Button variant="outline" size="sm">Sebelumnya</Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/siswa?page=${page + 1}${search ? `&q=${encodeURIComponent(search)}` : ''}`}>
                <Button variant="outline" size="sm">Berikutnya</Button>
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  )
}
