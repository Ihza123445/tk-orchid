import Link from 'next/link'
import { requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { voidInvoiceAction } from '@/actions/invoices'
import { InvoiceForm } from '@/components/finance/invoice-form'
import { formatRupiah, formatTanggalSingkat } from '@/lib/formatting/format'
import { CircleAlert, ReceiptText, Wallet } from 'lucide-react'
import { EmptyState, INVOICE_STATUS, PageHeader, SectionHeader, Stat, StatGroup, StatusPill } from '@/components/dashboard/primitives'

export const metadata = { title: 'Tagihan' }

export default async function TagihanPage() {
  await requireAdminStaff()

  const [students, feeTypes, invoices] = await Promise.all([
    db.student.findMany({ where: { status: 'ACTIVE' }, select: { id: true, fullName: true, studentCode: true }, orderBy: { fullName: 'asc' } }),
    db.feeType.findMany({ where: { isActive: true }, select: { id: true, name: true, defaultAmount: true }, orderBy: { code: 'asc' } }),
    db.invoice.findMany({
      include: {
        student: { select: { fullName: true, studentCode: true } },
        items: true,
        allocations: { include: { payment: { select: { status: true } } } },
      },
      orderBy: { id: 'desc' },
      take: 100,
    }),
  ])

  const today = new Date()
  const summary = invoices.reduce(
    (acc, inv) => {
      if (inv.status === 'VOID') return acc
      const total = inv.items.reduce((s, i) => s + i.subtotal, 0)
      const paid = inv.allocations.filter((al) => al.payment.status === 'POSTED').reduce((s, al) => s + al.amount, 0)
      const remaining = Math.max(0, total - paid)
      acc.billed += total
      acc.outstanding += remaining
      if (remaining > 0 && inv.dueDate < today) acc.overdue += 1
      return acc
    },
    { billed: 0, outstanding: 0, overdue: 0 },
  )

  return (
    <div className="space-y-6">
      <PageHeader icon={ReceiptText} eyebrow="Keuangan" title="Tagihan" description="Buat invoice per siswa dan pantau status pelunasannya." />

      <StatGroup columns={3}>
        <Stat icon={ReceiptText} label="Total ditagihkan" value={formatRupiah(summary.billed)} hint={`${invoices.length} tagihan terakhir`} />
        <Stat icon={Wallet} label="Belum dibayar" value={formatRupiah(summary.outstanding)} hint="Sisa dari semua tagihan aktif" tone={summary.outstanding ? 'warning' : 'success'} />
        <Stat icon={CircleAlert} label="Lewat jatuh tempo" value={summary.overdue} hint={summary.overdue ? 'Perlu ditindaklanjuti' : 'Tidak ada'} tone={summary.overdue ? 'danger' : 'success'} />
      </StatGroup>

      <InvoiceForm
        students={students.map((s) => ({ id: s.id, label: `${s.fullName} (${s.studentCode})` }))}
        feeTypes={feeTypes.map((f) => ({ id: f.id, label: f.name, defaultAmount: f.defaultAmount }))}
      />

      <section className="space-y-3">
        <SectionHeader title="Daftar tagihan" description="100 tagihan terbaru" />
        {invoices.length === 0 ? (
          <EmptyState icon={ReceiptText} title="Belum ada tagihan" description="Buat tagihan pertama melalui formulir di atas." />
        ) : (
          <div className="table-card">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-3">No. Invoice</th>
                  <th className="px-4 py-3">Siswa</th>
                  <th className="px-4 py-3">Terbit</th>
                  <th className="px-4 py-3">Jatuh Tempo</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Dibayar</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const total = inv.items.reduce((s, i) => s + i.subtotal, 0)
                  const paid = inv.allocations.filter((al) => al.payment.status === 'POSTED').reduce((s, al) => s + al.amount, 0)
                  return (
                    <tr key={inv.id}>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--muted-foreground)]">{inv.invoiceNo}</td>
                      <td className="px-4 py-3">
                        <Link href={`/siswa/${inv.studentId}`} className="hover:text-[var(--primary)]">{inv.student.fullName}</Link>
                      </td>
                      <td className="px-4 py-3">{formatTanggalSingkat(inv.issueDate)}</td>
                      <td className={`px-4 py-3 ${inv.dueDate < today && !["PAID", "VOID"].includes(inv.status) ? "font-medium text-[var(--destructive)]" : ""}`}>{formatTanggalSingkat(inv.dueDate)}</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatRupiah(total)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{paid > 0 ? formatRupiah(paid) : '—'}</td>
                      <td className="px-4 py-3">
                        <StatusPill map={INVOICE_STATUS} status={inv.status} />
                      </td>
                      <td className="px-4 py-3">
                        {(inv.status === 'ISSUED' || inv.status === 'PARTIAL') && inv.allocations.length === 0 && (
                          <form action={voidInvoiceAction} className="flex items-center gap-1">
                            <input type="hidden" name="id" value={inv.id} />
                            <input name="reason" required minLength={5} placeholder="Alasan batal" aria-label={`Alasan void ${inv.invoiceNo}`}
                              className="field-mini w-28" />
                            <button type="submit" className="link-danger">Batalkan</button>
                          </form>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
