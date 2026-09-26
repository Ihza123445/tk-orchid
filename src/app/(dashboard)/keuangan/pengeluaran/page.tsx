import { getSessionUser, requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { voidExpenseAction } from '@/actions/expenses'
import { ExpenseForm } from '@/components/finance/expense-form'
import { formatRupiah, formatTanggalSingkat } from '@/lib/formatting/format'
import { HandCoins } from 'lucide-react'
import { LEDGER_STATUS, PageHeader, Pill, SectionHeader, StatusPill } from '@/components/dashboard/primitives'

export const metadata = { title: 'Pengeluaran' }

export default async function PengeluaranPage() {
  await requireAdminStaff()
  const user = await getSessionUser()

  const expenses = await db.expense.findMany({
    include: { creator: { select: { name: true } } },
    orderBy: { id: 'desc' },
    take: 100,
  })

  const posted = expenses.filter((e) => e.status === 'POSTED')
  const totalBulanIni = posted
    .filter((e) => e.expenseDate.getMonth() === new Date().getMonth() && e.expenseDate.getFullYear() === new Date().getFullYear())
    .reduce((s, e) => s + e.amount, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        icon={HandCoins}
        eyebrow="Keuangan"
        title="Pengeluaran"
        description="Catat biaya operasional sekolah beserta vendor dan kategorinya."
        actions={
          <div className="app-card px-4 py-2 text-right">
            <p className="text-[11px] font-medium text-[var(--muted-foreground)]">Total bulan ini</p>
            <p className="font-heading text-lg font-bold tabular-nums">{formatRupiah(totalBulanIni)}</p>
          </div>
        }
      />

      <ExpenseForm />

      <section className="space-y-3">
        <SectionHeader title="Riwayat pengeluaran" description="100 catatan terbaru" />
        <div className="table-card">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-3">No.</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3 text-right">Nominal</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className={e.status === 'VOID' ? 'opacity-55' : ''}>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--muted-foreground)]">{e.expenseNo}</td>
                  <td className="px-4 py-3">{formatTanggalSingkat(e.expenseDate)}</td>
                  <td className="px-4 py-3"><Pill tone="brand">{e.category}</Pill></td>
                  <td className="min-w-56 whitespace-normal px-4 py-3">{e.description}</td>
                  <td className="px-4 py-3">{e.vendor ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatRupiah(e.amount)}</td>
                  <td className="px-4 py-3">
                    <StatusPill map={LEDGER_STATUS} status={e.status} />
                    {user?.role === 'ADMIN' && e.status === 'POSTED' && (
                      <form action={voidExpenseAction} className="mt-1 flex items-center gap-1">
                        <input type="hidden" name="id" value={e.id} />
                        <input name="reason" required minLength={5} placeholder="Alasan" aria-label={`Alasan void ${e.expenseNo}`}
                          className="field-mini w-28" />
                        <button type="submit" className="link-danger">Batalkan</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-[var(--muted-foreground)]">Belum ada pengeluaran.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
