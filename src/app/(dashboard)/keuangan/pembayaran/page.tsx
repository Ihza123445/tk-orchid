import { requireAdminStaff, getSessionUser } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { voidPaymentAction } from '@/actions/payments'
import { PaymentForm } from '@/components/finance/payment-form'
import { formatRupiah, formatTanggalSingkat } from '@/lib/formatting/format'

const METHOD_LABEL: Record<string, string> = { CASH: 'Tunai', TRANSFER: 'Transfer', QRIS: 'QRIS', OTHER: 'Lainnya' }

export default async function PembayaranPage() {
  await requireAdminStaff()
  const user = await getSessionUser()

  const [students, invoices, payments] = await Promise.all([
    db.student.findMany({ where: { status: 'ACTIVE' }, select: { id: true, fullName: true, studentCode: true }, orderBy: { fullName: 'asc' } }),
    db.invoice.findMany({
      where: { status: { in: ['ISSUED', 'PARTIAL', 'OVERDUE'] } },
      include: { items: true, allocations: { include: { payment: { select: { status: true } } } } },
    }),
    db.payment.findMany({
      include: {
        student: { select: { fullName: true } },
        recorder: { select: { name: true } },
        allocations: { include: { invoice: { select: { invoiceNo: true } } } },
      },
      orderBy: { id: 'desc' },
      take: 100,
    }),
  ])

  // Sisa tagihan per invoice (hanya alokasi dari payment POSTED)
  const openInvoicesByStudent: Record<number, { id: number; invoiceNo: string; remaining: number; dueDate: string }[]> = {}
  for (const inv of invoices) {
    const total = inv.items.reduce((s, i) => s + i.subtotal, 0)
    const allocated = inv.allocations.filter((al) => al.payment.status === 'POSTED').reduce((s, al) => s + al.amount, 0)
    const remaining = total - allocated
    if (remaining <= 0) continue
    ;(openInvoicesByStudent[inv.studentId] ??= []).push({
      id: inv.id,
      invoiceNo: inv.invoiceNo,
      remaining,
      dueDate: inv.dueDate.toISOString().slice(0, 10),
    })
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Pembayaran</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Kwitansi pembayaran dan alokasinya ke tagihan.</p>
      </header>

      <PaymentForm
        students={students.map((s) => ({ id: s.id, label: `${s.fullName} (${s.studentCode})` }))}
        openInvoicesByStudent={openInvoicesByStudent}
      />

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Riwayat Pembayaran</h2>
        <div className="overflow-x-auto rounded-lg border bg-[var(--card)]">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b bg-[var(--muted)] text-left">
                <th className="px-4 py-3 font-medium">No. Kwitansi</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Siswa</th>
                <th className="px-4 py-3 font-medium">Metode</th>
                <th className="px-4 py-3 font-medium">Alokasi</th>
                <th className="px-4 py-3 font-medium text-right">Jumlah</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {user?.role === 'ADMIN' && <th className="px-4 py-3 font-medium">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className={`border-b last:border-0 ${p.status === 'VOID' ? 'opacity-50 line-through' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs">{p.receiptNo}</td>
                  <td className="px-4 py-3">{formatTanggalSingkat(p.paymentDate)}</td>
                  <td className="px-4 py-3">{p.student.fullName}</td>
                  <td className="px-4 py-3">{METHOD_LABEL[p.method] ?? p.method}</td>
                  <td className="px-4 py-3 text-xs">{p.allocations.map((al) => `${al.invoice.invoiceNo}: ${al.amount.toLocaleString('id-ID')}`).join(', ')}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(p.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${p.status === 'POSTED' ? 'bg-[var(--secondary)] text-[var(--primary)]' : 'bg-[var(--destructive)]/15 text-[var(--destructive)]'}`}>
                      {p.status === 'POSTED' ? 'Tercatat' : 'Void'}
                    </span>
                    {user?.role === 'ADMIN' && p.status === 'POSTED' && (
                      <form action={voidPaymentAction} className="mt-1 flex items-center gap-1">
                        <input type="hidden" name="id" value={p.id} />
                        <input name="reason" required minLength={5} placeholder="Alasan" aria-label={`Alasan void kwitansi ${p.receiptNo}`}
                          className="h-7 w-24 rounded border border-[var(--input)] px-1.5 text-xs" />
                        <button type="submit" className="text-xs underline underline-offset-4 opacity-70 hover:opacity-100">Void</button>
                      </form>
                    )}
                  </td>
                  {user?.role === 'ADMIN' && <td />}
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-[var(--muted-foreground)]">Belum ada pembayaran.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">Void pembayaran hanya oleh Admin — status tagihan terkait dihitung ulang otomatis.</p>
      </section>
    </div>
  )
}
