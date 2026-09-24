import Link from 'next/link'
import { requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { voidInvoiceAction } from '@/actions/invoices'
import { InvoiceForm } from '@/components/finance/invoice-form'
import { formatRupiah, formatTanggalSingkat } from '@/lib/formatting/format'

const STATUS_STYLE: Record<string, string> = {
  ISSUED: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
  PARTIAL: 'bg-[var(--accent)]/15 text-[var(--accent)]',
  PAID: 'bg-[var(--secondary)] text-[var(--primary)]',
  VOID: 'bg-[var(--destructive)]/15 text-[var(--destructive)]',
  OVERDUE: 'bg-[var(--destructive)]/15 text-[var(--destructive)]',
}

export default async function TagihanPage() {
  await requireAdminStaff()

  const ay = await db.academicYear.findFirst({ where: { status: 'ACTIVE' } })
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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Tagihan</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Invoice per siswa beserta status pelunasan.</p>
      </header>

      <InvoiceForm
        students={students.map((s) => ({ id: s.id, label: `${s.fullName} (${s.studentCode})` }))}
        feeTypes={feeTypes.map((f) => ({ id: f.id, label: f.name, defaultAmount: f.defaultAmount }))}
      />

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Daftar Tagihan</h2>
        {invoices.length === 0 ? (
          <p className="rounded-lg border border-dashed p-10 text-center text-sm text-[var(--muted-foreground)]">Belum ada tagihan.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-[var(--card)]">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b bg-[var(--muted)] text-left">
                  <th className="px-4 py-3 font-medium">No. Invoice</th>
                  <th className="px-4 py-3 font-medium">Siswa</th>
                  <th className="px-4 py-3 font-medium">Terbit</th>
                  <th className="px-4 py-3 font-medium">Jatuh Tempo</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium text-right">Dibayar</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const total = inv.items.reduce((s, i) => s + i.subtotal, 0)
                  const paid = inv.allocations.filter((al) => al.payment.status === 'POSTED').reduce((s, al) => s + al.amount, 0)
                  return (
                    <tr key={inv.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-mono text-xs">{inv.invoiceNo}</td>
                      <td className="px-4 py-3">
                        <Link href={`/siswa/${inv.studentId}`} className="underline-offset-4 hover:underline">{inv.student.fullName}</Link>
                      </td>
                      <td className="px-4 py-3">{formatTanggalSingkat(inv.issueDate)}</td>
                      <td className="px-4 py-3">{formatTanggalSingkat(inv.dueDate)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(total)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{paid > 0 ? formatRupiah(paid) : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLE[inv.status] ?? 'bg-[var(--muted)]'}`}>{inv.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        {(inv.status === 'ISSUED' || inv.status === 'PARTIAL') && inv.allocations.length === 0 && (
                          <form action={voidInvoiceAction} className="flex items-center gap-1">
                            <input type="hidden" name="id" value={inv.id} />
                            <input name="reason" required minLength={5} placeholder="Alasan void" aria-label={`Alasan void ${inv.invoiceNo}`}
                              className="h-7 w-24 rounded border border-[var(--input)] px-1.5 text-xs" />
                            <button type="submit" className="text-xs underline underline-offset-4 opacity-70 hover:opacity-100">Void</button>
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
