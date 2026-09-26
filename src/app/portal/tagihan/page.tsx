import { CheckCircle2, History, ReceiptText, Wallet } from 'lucide-react'
import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { getMyStudents } from '../page'
import { formatRupiah, formatTanggalSingkat } from '@/lib/formatting/format'
import { Avatar, EmptyState, INVOICE_STATUS, LEDGER_STATUS, PageHeader, Pill, Progress, SectionHeader, Stat, StatGroup, StatusPill } from '@/components/dashboard/primitives'

const METHOD_LABEL: Record<string, string> = { CASH: 'Tunai', TRANSFER: 'Transfer', QRIS: 'QRIS', OTHER: 'Lainnya' }

export const metadata = { title: 'Tagihan' }

export default async function PortalTagihanPage() {
  const user = await requireRole('PARENT')
  const students = await getMyStudents(user.id)
  if (students.length === 0) {
    return <EmptyState icon={ReceiptText} title="Belum ada data anak" description="Hubungi pihak sekolah untuk menghubungkan data anak ke akun Anda." />
  }

  const studentIds = students.map((s) => s.id)
  const [invoices, payments] = await Promise.all([
    db.invoice.findMany({
      where: { studentId: { in: studentIds } },
      include: {
        student: { select: { fullName: true } },
        items: { include: { feeType: { select: { name: true } } } },
        allocations: { include: { payment: { select: { status: true, receiptNo: true, paymentDate: true } } } },
      },
      orderBy: [{ studentId: 'asc' }, { dueDate: 'asc' }],
    }),
    // Riwayat pembayaran (kwitansi) semua anak, terbaru di atas
    db.payment.findMany({
      where: { studentId: { in: studentIds } },
      include: {
        student: { select: { fullName: true } },
        allocations: { include: { invoice: { select: { invoiceNo: true } } } },
      },
      orderBy: [{ paymentDate: 'desc' }, { id: 'desc' }],
      take: 100,
    }),
  ])

  const rows = invoices.map((inv) => {
    const total = inv.items.reduce((s, i) => s + i.subtotal, 0)
    const postedAllocs = inv.allocations.filter((al) => al.payment.status === 'POSTED')
    const paid = postedAllocs.reduce((s, al) => s + al.amount, 0)
    return { inv, total, paid, remaining: Math.max(0, total - paid), postedAllocs }
  })
  const active = rows.filter((row) => row.inv.status !== 'VOID')
  const totalBilled = active.reduce((sum, row) => sum + row.total, 0)
  const totalPaid = active.reduce((sum, row) => sum + row.paid, 0)
  const totalRemaining = active.reduce((sum, row) => sum + row.remaining, 0)

  return (
    <div className="space-y-6">
      <PageHeader icon={ReceiptText} title="Tagihan & Pembayaran" description="Rincian tagihan dan riwayat pembayaran untuk setiap anak." />

      <StatGroup columns={3}>
        <Stat icon={ReceiptText} label="Total tagihan" value={formatRupiah(totalBilled)} hint={`${active.length} tagihan`} />
        <Stat icon={CheckCircle2} label="Sudah dibayar" value={formatRupiah(totalPaid)} hint="Pembayaran tercatat" tone="success" />
        <Stat icon={Wallet} label="Sisa tagihan" value={formatRupiah(totalRemaining)} hint={totalRemaining ? 'Mohon segera dilunasi' : 'Semua lunas'} tone={totalRemaining ? 'warning' : 'success'} />
      </StatGroup>

      <SectionHeader title={<><ReceiptText className="size-4 text-[var(--primary)]" /> Daftar tagihan</>} description={rows.length ? `${rows.length} tagihan` : undefined} />
      {rows.length === 0 ? (
        <EmptyState icon={ReceiptText} title="Belum ada tagihan" description="Tagihan dari sekolah akan tampil di sini." />
      ) : (
        // Satu tagihan tampil selebar halaman agar tidak menyisakan kolom kosong
        <div className={`grid grid-cols-1 gap-4 ${rows.length > 1 ? 'lg:grid-cols-2' : ''}`}>
          {rows.map(({ inv, total, paid, remaining, postedAllocs }) => (
            <article key={inv.id} className={`app-card flex flex-col overflow-hidden ${inv.status === 'VOID' ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-[var(--muted-foreground)]">{inv.invoiceNo}</p>
                  <p className="mt-0.5 truncate font-heading font-bold">{inv.student.fullName}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">Terbit {formatTanggalSingkat(inv.issueDate)} · Jatuh tempo {formatTanggalSingkat(inv.dueDate)}</p>
                </div>
                <StatusPill map={INVOICE_STATUS} status={inv.status} />
              </div>
              <ul className="flex-1 divide-y divide-[var(--border)] px-5 text-sm">
                {inv.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3 py-2.5">
                    <span className="min-w-0">{item.description || item.feeType.name} <span className="text-[var(--muted-foreground)]">×{item.quantity}</span></span>
                    <span className="shrink-0 tabular-nums">{formatRupiah(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-3 border-t border-[var(--border)] bg-[var(--muted)]/40 px-5 py-4">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><p className="text-[var(--muted-foreground)]">Total</p><p className="mt-0.5 text-sm font-semibold tabular-nums">{formatRupiah(total)}</p></div>
                  <div><p className="text-[var(--muted-foreground)]">Dibayar</p><p className="mt-0.5 text-sm font-semibold tabular-nums">{formatRupiah(paid)}</p></div>
                  <div><p className="text-[var(--muted-foreground)]">Sisa</p><p className={`mt-0.5 text-sm font-bold tabular-nums ${remaining > 0 ? 'text-amber-600 dark:text-amber-300' : 'text-emerald-600 dark:text-emerald-300'}`}>{formatRupiah(remaining)}</p></div>
                </div>
                <Progress value={total ? (paid / total) * 100 : 0} tone={remaining > 0 ? 'warning' : 'success'} label="Persentase terbayar" />
                {postedAllocs.length > 0 && (
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Kwitansi: {postedAllocs.map((al) => `${al.payment.receiptNo} (${formatTanggalSingkat(al.payment.paymentDate)})`).join(', ')}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="space-y-3">
        <SectionHeader
          title={<><History className="size-4 text-[var(--primary)]" /> Riwayat pembayaran</>}
          description={payments.length ? `${payments.length} kwitansi · total tercatat ${formatRupiah(payments.filter((p) => p.status === 'POSTED').reduce((sum, p) => sum + p.amount, 0))}` : 'Kwitansi pembayaran akan tampil di sini'}
        />
        {payments.length === 0 ? (
          <EmptyState icon={History} title="Belum ada pembayaran" description="Setiap pembayaran yang dicatat sekolah akan muncul di sini beserta nomor kwitansinya." />
        ) : (
          <div className="table-card">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">No. kwitansi</th>
                  <th className="px-4 py-3">Anak</th>
                  <th className="px-4 py-3">Metode</th>
                  <th className="px-4 py-3">Untuk tagihan</th>
                  <th className="px-4 py-3 text-right">Jumlah</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className={p.status === 'VOID' ? 'opacity-60' : ''}>
                    <td className="px-4 py-3 font-medium">{formatTanggalSingkat(p.paymentDate)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--muted-foreground)]">{p.receiptNo}</td>
                    <td className="px-4 py-3"><span className="flex items-center gap-2.5"><Avatar name={p.student.fullName} size="sm" /> {p.student.fullName}</span></td>
                    <td className="px-4 py-3"><Pill>{METHOD_LABEL[p.method] ?? p.method}</Pill></td>
                    <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">
                      {p.allocations.length === 0 ? '—' : p.allocations.map((al) => (
                        <span key={al.id} className="block"><span className="font-mono">{al.invoice.invoiceNo}</span> · {formatRupiah(al.amount)}</span>
                      ))}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold tabular-nums ${p.status === 'VOID' ? 'line-through' : 'text-emerald-600 dark:text-emerald-300'}`}>{formatRupiah(p.amount)}</td>
                    <td className="px-4 py-3"><StatusPill map={LEDGER_STATUS} status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
