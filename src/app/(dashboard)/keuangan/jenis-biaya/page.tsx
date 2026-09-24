import { requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { toggleFeeTypeAction } from '@/actions/fees'
import { FeeTypeForm } from '@/components/finance/fee-type-form'
import { formatRupiah } from '@/lib/formatting/format'

export const metadata = { title: 'Jenis Biaya' }

export default async function JenisBiayaPage() {
  await requireAdminStaff()
  const feeTypes = await db.feeType.findMany({
    orderBy: { code: 'asc' },
    include: { _count: { select: { items: true } } },
  })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Jenis Biaya</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Master komponen biaya (SPP, uang pangkal, seragam, dll).</p>
      </header>

      <FeeTypeForm />

      <div className="overflow-x-auto rounded-lg border bg-[var(--card)]">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b bg-[var(--muted)] text-left">
              <th className="px-4 py-3 font-medium">Kode</th>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Default</th>
              <th className="px-4 py-3 font-medium">Tipe</th>
              <th className="px-4 py-3 font-medium">Dipakai</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {feeTypes.map((ft) => (
              <tr key={ft.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{ft.code}</td>
                <td className="px-4 py-3 font-medium">{ft.name}</td>
                <td className="px-4 py-3 tabular-nums">{formatRupiah(ft.defaultAmount)}</td>
                <td className="px-4 py-3">{ft.recurring ? 'Berulang' : 'Sekali'}</td>
                <td className="px-4 py-3 tabular-nums">{ft._count.items}×</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${ft.isActive ? 'bg-[var(--secondary)] text-[var(--primary)]' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}>
                    {ft.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                  {(!ft.isActive || ft._count.items === 0) && (
                    <form action={toggleFeeTypeAction} className="mt-1">
                      <input type="hidden" name="id" value={ft.id} />
                      <button type="submit" className="text-xs underline underline-offset-4 opacity-70 hover:opacity-100">
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
    </div>
  )
}
