import { requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { toggleFeeTypeAction } from '@/actions/fees'
import { FeeTypeForm } from '@/components/finance/fee-type-form'
import { formatRupiah } from '@/lib/formatting/format'
import { WalletCards } from 'lucide-react'
import { EmptyState, PageHeader, Pill, SectionHeader } from '@/components/dashboard/primitives'

export const metadata = { title: 'Jenis Biaya' }

export default async function JenisBiayaPage() {
  await requireAdminStaff()
  const feeTypes = await db.feeType.findMany({
    orderBy: { code: 'asc' },
    include: { _count: { select: { items: true } } },
  })

  return (
    <div className="space-y-6">
      <PageHeader icon={WalletCards} eyebrow="Keuangan" title="Jenis Biaya" description="Master komponen biaya: SPP, uang pangkal, seragam, dan lainnya." />

      <FeeTypeForm />

      <SectionHeader title="Daftar jenis biaya" description={`${feeTypes.length} komponen · ${feeTypes.filter((ft) => ft.isActive).length} aktif`} />
      {feeTypes.length === 0 ? <EmptyState icon={WalletCards} title="Belum ada jenis biaya" description="Tambahkan komponen biaya pertama melalui formulir di atas." /> : (
      <div className="table-card">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="text-left">
              <th className="px-4 py-3">Kode</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Default</th>
              <th className="px-4 py-3">Tipe</th>
              <th className="px-4 py-3">Dipakai</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {feeTypes.map((ft) => (
              <tr key={ft.id}>
                <td className="px-4 py-3"><span className="rounded-md bg-[var(--muted)] px-1.5 py-0.5 font-mono text-xs">{ft.code}</span></td>
                <td className="px-4 py-3 font-medium">{ft.name}</td>
                <td className="px-4 py-3 tabular-nums">{formatRupiah(ft.defaultAmount)}</td>
                <td className="px-4 py-3">{ft.recurring ? <Pill tone="info">Berulang</Pill> : <Pill>Sekali bayar</Pill>}</td>
                <td className="px-4 py-3 tabular-nums">{ft._count.items}×</td>
                <td className="px-4 py-3">
                  {ft.isActive ? <Pill tone="success" dot>Aktif</Pill> : <Pill dot>Nonaktif</Pill>}
                  {(!ft.isActive || ft._count.items === 0) && (
                    <form action={toggleFeeTypeAction} className="mt-1">
                      <input type="hidden" name="id" value={ft.id} />
                      <button type="submit" className={ft.isActive ? 'link-danger' : 'link-action'}>
                        {ft.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </form>
                  )}
                  {ft.isActive && ft._count.items > 0 && (
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">Terpakai — tidak bisa dinonaktifkan</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}
