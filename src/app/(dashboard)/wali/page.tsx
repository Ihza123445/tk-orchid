import Link from 'next/link'
import { Search, UserPlus, UsersRound } from 'lucide-react'
import { requireAdminStaff } from '@/lib/auth/guard'
import { listGuardians } from '@/actions/guardians'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, EmptyState, HeaderButton, PageHeader, Pagination, Pill, Toolbar } from '@/components/dashboard/primitives'

export const metadata = { title: 'Data Wali' }

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
  const hrefFor = (target: number) => `/wali?page=${target}${search ? `&q=${encodeURIComponent(search)}` : ''}`

  return (
    <div className="space-y-6">
      <PageHeader
        icon={UsersRound}
        eyebrow="Siswa & Wali"
        title="Data Wali"
        description={`Total ${total} wali terdaftar.`}
        actions={<HeaderButton href="/wali/tambah" primary><UserPlus /> Tambah wali</HeaderButton>}
      />

      <Toolbar action="/wali">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden="true" />
          <Input name="q" placeholder="Cari nama / telepon…" defaultValue={search ?? ''} className="pl-9" aria-label="Cari wali" />
        </div>
        <Button type="submit" variant="outline">Cari</Button>
        {search && <Link href="/wali" className="link-action">Reset</Link>}
      </Toolbar>

      {rows.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="Belum ada data wali"
          description={search ? 'Tidak ada wali yang cocok dengan pencarian ini.' : 'Tambahkan data orang tua/wali siswa.'}
          action={<HeaderButton href="/wali/tambah" primary><UserPlus /> Tambah wali</HeaderButton>}
        />
      ) : (
        <div className="table-card">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Hubungan</th>
                <th className="px-4 py-3">Telepon</th>
                <th className="px-4 py-3">Anak terhubung</th>
                <th className="px-4 py-3">Akun portal</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((g) => (
                <tr key={g.id}>
                  <td className="px-4 py-3">
                    <Link href={`/wali/${g.id}`} className="flex items-center gap-3">
                      <Avatar name={g.fullName} />
                      <span className="min-w-0">
                        <span className="block truncate font-medium hover:text-[var(--primary)]">{g.fullName}</span>
                        {g.occupation && <span className="block text-xs font-normal text-[var(--muted-foreground)]">{g.occupation}</span>}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">{REL[g.relationship] ?? g.relationship}</td>
                  <td className="px-4 py-3 tabular-nums">{g.phone}</td>
                  <td className="px-4 py-3">{g.studentGuardians.length} anak</td>
                  <td className="px-4 py-3">
                    {g.user ? <Pill tone="success" dot>{g.user.email}</Pill> : <Pill>Belum ada</Pill>}
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
