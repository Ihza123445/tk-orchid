import { getSessionUser, requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { voidExpenseAction } from '@/actions/expenses'
import { ExpenseForm } from '@/components/finance/expense-form'
import { formatRupiah, formatTanggalSingkat } from '@/lib/formatting/format'

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
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pengeluaran</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Operasional sekolah.</p>
        </div>
        <p className="text-sm">
          Bulan ini: <span className="font-semibold tabular-nums">{formatRupiah(totalBulanIni)}</span>
        </p>
      </header>

      <ExpenseForm />

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Riwayat</h2>
        <div className="overflow-x-auto rounded-lg border bg-[var(--card)]">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b bg-[var(--muted)] text-left">
                <th className="px-4 py-3 font-medium">No.</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Keterangan</th>
                <th className="px-4 py-3 font-medium">Vendor</th>
                <th className="px-4 py-3 font-medium text-right">Nominal</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className={`border-b last:border-0 ${e.status === 'VOID' ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs">{e.expenseNo}</td>
                  <td className="px-4 py-3">{formatTanggalSingkat(e.expenseDate)}</td>
                  <td className="px-4 py-3">{e.category}</td>
                  <td className="px-4 py-3">{e.description}</td>
                  <td className="px-4 py-3">{e.vendor ?? '—'}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(e.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${e.status === 'POSTED' ? 'bg-[var(--secondary)] text-[var(--primary)]' : 'bg-[var(--destructive)]/15 text-[var(--destructive)]'}`}>
                      {e.status === 'POSTED' ? 'Tercatat' : 'Void'}
                    </span>
                    {user?.role === 'ADMIN' && e.status === 'POSTED' && (
                      <form action={voidExpenseAction} className="mt-1 flex items-center gap-1">
                        <input type="hidden" name="id" value={e.id} />
                        <input name="reason" required minLength={5} placeholder="Alasan" aria-label={`Alasan void ${e.expenseNo}`}
                          className="h-7 w-24 rounded border border-[var(--input)] px-1.5 text-xs" />
                        <button type="submit" className="text-xs underline underline-offset-4 opacity-70 hover:opacity-100">Void</button>
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
