import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { getMyStudents } from '../page'
import { formatRupiah, formatTanggalSingkat } from '@/lib/formatting/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function PortalTagihanPage() {
  const user = await requireRole('PARENT')
  const students = await getMyStudents(user.id)
  if (students.length === 0) {
    return <p className="text-sm text-[var(--muted-foreground)]">Belum ada data anak.</p>
  }

  const invoices = await db.invoice.findMany({
    where: { studentId: { in: students.map((s) => s.id) } },
    include: {
      student: { select: { fullName: true } },
      items: true,
      allocations: { include: { payment: { select: { status: true, receiptNo: true, paymentDate: true } } } },
    },
    orderBy: [{ studentId: 'asc' }, { dueDate: 'asc' }],
  })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Tagihan & Pembayaran</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Rincian tagihan dan riwayat pembayaran per anak.</p>
      </header>

      {invoices.length === 0 ? (
        <p className="rounded-lg border border-dashed p-10 text-center text-sm text-[var(--muted-foreground)]">Belum ada tagihan.</p>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => {
            const total = inv.items.reduce((s, i) => s + i.subtotal, 0)
            const postedAllocs = inv.allocations.filter((al) => al.payment.status === 'POSTED')
            const paid = postedAllocs.reduce((s, al) => s + al.amount, 0)
            const remaining = total - paid
            return (
              <Card key={inv.id}>
                <CardHeader className="flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="font-mono text-sm">{inv.invoiceNo}</CardTitle>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {inv.student.fullName} · Terbit {formatTanggalSingkat(inv.issueDate)} · Jatuh tempo {formatTanggalSingkat(inv.dueDate)}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${inv.status === 'PAID' ? 'bg-[var(--secondary)] text-[var(--primary)]' : inv.status === 'PARTIAL' ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : inv.status === 'VOID' ? 'bg-[var(--destructive)]/15 text-[var(--destructive)]' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}>
                    {inv.status}
                  </span>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ul className="divide-y text-sm">
                    {inv.items.map((item) => (
                      <li key={item.id} className="flex justify-between py-1.5">
                        <span>{item.description || item.feeTypeId} ×{item.quantity}</span>
                        <span className="tabular-nums">{formatRupiah(item.subtotal)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="grid grid-cols-3 gap-2 border-t pt-2 text-sm">
                    <div>Total<p className="font-semibold tabular-nums">{formatRupiah(total)}</p></div>
                    <div>Dibayar<p className="font-semibold tabular-nums">{formatRupiah(paid)}</p></div>
                    <div>Sisa<p className={`font-semibold tabular-nums ${remaining > 0 ? 'text-amber-600' : 'text-[var(--primary)]'}`}>{formatRupiah(remaining)}</p></div>
                  </div>
                  {postedAllocs.length > 0 && (
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Kwitansi: {postedAllocs.map((al) => `${al.payment.receiptNo} (${formatTanggalSingkat(al.payment.paymentDate)})`).join(', ')}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
