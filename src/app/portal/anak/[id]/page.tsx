import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { assertStudentAccess } from '../../page'
import { formatRupiah, formatTanggalSingkat } from '@/lib/formatting/format'
import { CalendarCheck2, ChartNoAxesCombined, ReceiptText } from 'lucide-react'
import { ATTENDANCE_STATUS, Avatar, Empty, HeaderButton, INVOICE_STATUS, Panel, Progress, StatusPill } from '@/components/dashboard/primitives'
import { ReportCard, ScaleLegend } from '@/components/reports/report-card'

export const metadata = { title: 'Detail Anak' }

const MONTH_TILES = [
  { status: 'PRESENT', label: 'Hadir', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  { status: 'SICK', label: 'Sakit', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  { status: 'PERMISSION', label: 'Izin', className: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  { status: 'ABSENT', label: 'Alpa', className: 'bg-[var(--destructive)]/10 text-[var(--destructive)]' },
]

export default async function AnakDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole('PARENT')
  const { id } = await params
  const studentId = Number(id)
  if (!Number.isInteger(studentId)) notFound()

  if (!(await assertStudentAccess(user.id, studentId))) notFound()

  const student = await db.student.findUnique({
    where: { id: studentId },
    include: {
      enrollments: { include: { klass: true }, orderBy: { id: 'desc' }, take: 1 },
    },
  })
  if (!student) notFound()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [recentAttendance, monthlyStats, invoices, publishedReports] = await Promise.all([
    db.attendance.findMany({ where: { studentId }, orderBy: { attendanceDate: 'desc' }, take: 10 }),
    db.attendance.groupBy({
      by: ['status'],
      where: { studentId, attendanceDate: { gte: monthStart } },
      _count: true,
    }),
    db.invoice.findMany({
      where: { studentId },
      include: { items: true, allocations: { include: { payment: { select: { status: true } } } } },
      orderBy: { dueDate: 'asc' },
    }),
    db.developmentReport.findMany({
      where: { studentId, status: 'PUBLISHED' },
      include: { items: { include: { domain: true, scale: true }, orderBy: { sortOrder: 'asc' } } },
      orderBy: { period: 'desc' },
    }),
  ])

  const monthCount = (status: string) => monthlyStats.find((m) => m.status === status)?._count ?? 0
  const monthTotal = monthlyStats.reduce((sum, m) => sum + m._count, 0)
  const monthRatio = monthTotal ? Math.round((monthCount('PRESENT') / monthTotal) * 100) : null
  const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(now)
  const invoiceRows = invoices.map((inv) => {
    const total = inv.items.reduce((s, i) => s + i.subtotal, 0)
    const paid = inv.allocations.filter((al) => al.payment.status === 'POSTED').reduce((s, al) => s + al.amount, 0)
    return { inv, total, remaining: Math.max(0, total - paid) }
  })
  const owed = invoiceRows.filter((row) => row.inv.status !== 'VOID').reduce((sum, row) => sum + row.remaining, 0)

  return (
    <div className="space-y-6">
      <section className="app-card overflow-hidden">
        <div className="h-20 sm:h-24" style={{ background: 'var(--brand-gradient)' }} />
        <div className="flex flex-wrap items-start justify-between gap-4 px-5 pb-5 sm:px-6">
          <div className="flex min-w-0 items-start gap-4">
            <span className="-mt-10 shrink-0 rounded-full bg-[var(--card)] p-1 shadow-md"><Avatar name={student.fullName} size="xl" /></span>
            <div className="min-w-0 pt-3">
              <h1 className="truncate font-heading text-2xl font-bold tracking-tight">{student.fullName}</h1>
              <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">Kelas {student.enrollments[0]?.klass.name ?? '-'} · NIS {student.studentCode} · Lahir {formatTanggalSingkat(student.birthDate)}</p>
            </div>
          </div>
          <div className="pt-3"><HeaderButton href="/portal">Kembali ke beranda</HeaderButton></div>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <Panel title="Presensi" icon={CalendarCheck2} description={`Bulan ${monthName}`} action={{ href: '/portal/presensi', label: 'Riwayat' }}>
          <div className="grid grid-cols-4 gap-2">
            {MONTH_TILES.map((tile) => (
              <div key={tile.status} className={`rounded-xl px-2 py-3 text-center ${tile.className}`}>
                <p className="font-heading text-xl font-bold leading-none tabular-nums">{monthCount(tile.status)}</p>
                <p className="mt-1 text-[11px] font-medium">{tile.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Progress value={monthRatio ?? 0} tone={monthRatio !== null && monthRatio < 80 ? 'warning' : 'success'} label="Persentase kehadiran bulan ini" />
            <span className="shrink-0 text-xs font-semibold tabular-nums">{monthRatio === null ? 'Belum ada data bulan ini' : `${monthRatio}% hadir`}</span>
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Catatan terakhir</p>
          {recentAttendance.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">Belum ada catatan presensi.</p>
          ) : (
            <ul className="mt-1 divide-y divide-[var(--border)]">
              {recentAttendance.slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span>{formatTanggalSingkat(a.attendanceDate)}</span>
                  <StatusPill map={ATTENDANCE_STATUS} status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Tagihan" icon={ReceiptText} description={owed > 0 ? `Sisa ${formatRupiah(owed)}` : 'Semua lunas'} action={{ href: '/portal/tagihan', label: 'Rincian' }} flush>
          {invoiceRows.length === 0 ? (
            <Empty icon={ReceiptText}>Tidak ada tagihan.</Empty>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {invoiceRows.slice(0, 6).map(({ inv, total, remaining }) => (
                <li key={inv.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-[var(--muted-foreground)]">{inv.invoiceNo}</p>
                    <p className="text-sm font-semibold tabular-nums">{formatRupiah(total)}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Jatuh tempo {formatTanggalSingkat(inv.dueDate)}{remaining > 0 && inv.status !== 'VOID' ? ` · sisa ${formatRupiah(remaining)}` : ''}</p>
                  </div>
                  <StatusPill map={INVOICE_STATUS} status={inv.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title"><ChartNoAxesCombined className="size-4 text-[var(--primary)]" /> Rapor perkembangan</h2>
          {publishedReports.length > 0 && <ScaleLegend />}
        </div>
        {publishedReports.length === 0 ? (
          <div className="empty-state">Belum ada rapor yang diterbitkan.</div>
        ) : (
          <div className="space-y-4">
            {publishedReports.map((r) => <ReportCard key={r.id} report={r} />)}
          </div>
        )}
      </section>
    </div>
  )
}
