import Link from 'next/link'
import { GraduationCap, Search, UserPlus } from 'lucide-react'
import { requireAdminStaff } from '@/lib/auth/guard'
import { listStudents } from '@/actions/students'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, EmptyState, HeaderButton, PageHeader, Pagination, STUDENT_STATUS, StatusPill, Toolbar } from '@/components/dashboard/primitives'

export const metadata = { title: 'Data Siswa' }

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
  const hrefFor = (target: number) => {
    const params = new URLSearchParams({ page: String(target) })
    if (search) params.set('q', search)
    if (status) params.set('status', status)
    return `/siswa?${params}`
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={GraduationCap}
        eyebrow="Siswa & Wali"
        title="Data Siswa"
        description={`Total ${total} siswa terdaftar${status ? ` dengan status ${STUDENT_STATUS[status]?.label.toLowerCase() ?? status}` : ''}.`}
        actions={<HeaderButton href="/siswa/tambah" primary><UserPlus /> Tambah siswa</HeaderButton>}
      />

      <Toolbar action="/siswa">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden="true" />
          <Input name="q" placeholder="Cari nama / NIS / kode…" defaultValue={search ?? ''} className="pl-9" aria-label="Cari siswa" />
        </div>
        <select name="status" defaultValue={status ?? ''} className="field-select w-auto" aria-label="Filter status">
          <option value="">Semua status</option>
          {Object.entries(STUDENT_STATUS).filter(([k]) => k !== 'COMPLETED').map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <Button type="submit" variant="outline">Terapkan</Button>
        {(search || status) && <Link href="/siswa" className="link-action">Reset</Link>}
      </Toolbar>

      {rows.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Belum ada data siswa"
          description={search || status ? 'Tidak ada siswa yang cocok dengan filter ini.' : 'Mulai dengan menambahkan siswa pertama.'}
          action={<HeaderButton href="/siswa/tambah" primary><UserPlus /> Tambah siswa</HeaderButton>}
        />
      ) : (
        <div className="table-card">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-3">Siswa</th>
                <th className="px-4 py-3">NIS</th>
                <th className="px-4 py-3">Jenis kelamin</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Wali</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">
                    <Link href={`/siswa/${s.id}`} className="flex items-center gap-3">
                      <Avatar name={s.fullName} />
                      <span className="min-w-0">
                        <span className="block truncate font-medium hover:text-[var(--primary)]">{s.fullName}</span>
                        <span className="block text-xs font-normal text-[var(--muted-foreground)]">{s.studentCode}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{s.nis ?? '-'}</td>
                  <td className="px-4 py-3">{s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                  <td className="px-4 py-3">{s.enrollments[0]?.klass.name ?? <span className="text-[var(--muted-foreground)]">Belum ada</span>}</td>
                  <td className="px-4 py-3">{s.studentGuardians[0]?.guardian.fullName ?? '-'}</td>
                  <td className="px-4 py-3"><StatusPill map={STUDENT_STATUS} status={s.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link href={`/siswa/${s.id}`} className="link-action">Detail</Link>
                      <Link href={`/siswa/${s.id}/edit`} className="link-action">Ubah</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} total={total} hrefFor={hrefFor} />
    </div>
  )
}
