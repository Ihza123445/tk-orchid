import { requireAdminStaff, getSessionUser } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { voidPaymentAction } from '@/actions/payments'
import { PaymentForm } from '@/components/finance/payment-form'
import { formatRupiah, formatTanggalSingkat } from '@/lib/formatting/format'
import { CreditCard, Info } from 'lucide-react'
import { Avatar, LEDGER_STATUS, PageHeader, Pill, SectionHeader, StatusPill } from '@/components/dashboard/primitives'

export const metadata = { title: 'Pembayaran' }

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
      <PageHeader icon={CreditCard} eyebrow="Keuangan" title="Pembayaran" description="Catat kwitansi pembayaran dan alokasikan ke tagihan siswa." />

      <PaymentForm
        students={students.map((s) => ({ id: s.id, label: `${s.fullName} (${s.studentCode})` }))}
        openInvoicesByStudent={openInvoicesByStudent}
      />

      <section className="space-y-3">
        <SectionHeader title="Riwayat pembayaran" description="100 kwitansi terbaru" />
        <div className="table-card">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-3">No. Kwitansi</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Siswa</th>
                <th className="px-4 py-3">Metode</th>
                <th className="px-4 py-3">Alokasi</th>
                <th className="px-4 py-3 text-right">Jumlah</th>
                <th className="px-4 py-3">Status</th>
                {user?.role === 'ADMIN' && <th className="px-4 py-3">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className={p.status === 'VOID' ? 'opacity-55 [&_td]:line-through' : ''}>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--muted-foreground)]">{p.receiptNo}</td>
                  <td className="px-4 py-3">{formatTanggalSingkat(p.paymentDate)}</td>
                  <td className="px-4 py-3"><span className="flex items-center gap-2.5 font-medium"><Avatar name={p.student.fullName} size="sm" /> {p.student.fullName}</span></td>
                  <td className="px-4 py-3"><Pill>{METHOD_LABEL[p.method] ?? p.method}</Pill></td>
                  <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">{p.allocations.map((al) => <span key={al.invoice.invoiceNo} className="block"><span className="font-mono">{al.invoice.invoiceNo}</span> · {formatRupiah(al.amount)}</span>)}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatRupiah(p.amount)}</td>
                  <td className="px-4 py-3">
                    <StatusPill map={LEDGER_STATUS} status={p.status} />
                  </td>
                  {user?.role === 'ADMIN' && <td className="px-4 py-3">
                    {p.status === 'POSTED' && (
                      <form action={voidPaymentAction} className="mt-1 flex items-center gap-1">
                        <input type="hidden" name="id" value={p.id} />
                        <input name="reason" required minLength={5} placeholder="Alasan" aria-label={`Alasan void kwitansi ${p.receiptNo}`}
                          className="field-mini w-28" />
                        <button type="submit" className="link-danger">Batalkan</button>
                      </form>
                    )}
                  </td>}
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={user?.role === 'ADMIN' ? 8 : 7} className="px-4 py-12 text-center text-sm text-[var(--muted-foreground)]">Belum ada pembayaran.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]"><Info className="size-3.5" /> Pembatalan (void) kwitansi hanya oleh Admin — status tagihan terkait dihitung ulang otomatis.</p>
      </section>
    </div>
  )
}
