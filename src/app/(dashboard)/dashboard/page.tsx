import { requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatRupiah, formatTanggalSingkat } from '@/lib/formatting/format'
import Link from 'next/link'

function startOfMonth(): Date {
  const n = new Date()
  return new Date(n.getFullYear(), n.getMonth(), 1)
}

export default async function DashboardPage() {
  await requireAdminStaff()

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const monthStart = startOfMonth()

  // Semua aggregate jalan paralel — sesuai PRD §36
  const [
    activeStudents,
    activeClasses,
    activeTeachers,
    pendingAdmissions,
    todayAttendance,
    outstandingAgg,
    monthPaymentsAgg,
    monthExpensesAgg,
    latestAdmissions,
    latestPayments,
    latestAnnouncements,
    attendanceTrendRaw,
  ] = await Promise.all([
    db.student.count({ where: { status: 'ACTIVE' } }),
    db.class.count({ where: { status: 'ACTIVE' } }),
    db.teacher.count({ where: { isActive: true } }),
    db.admission.count({ where: { status: { in: ['SUBMITTED', 'REVIEW', 'REVISION_REQUIRED'] } } }),
    db.attendance.findMany({
      where: { attendanceDate: { gte: todayStart, lt: new Date(todayStart.getTime() + 86400000) } },
      select: { status: true },
    }),
    db.invoice.findMany({
      where: { status: { in: ['ISSUED', 'PARTIAL', 'OVERDUE'] } },
      include: { items: true, allocations: { include: { payment: { select: { status: true } } } } },
    }),
    db.payment.aggregate({ _sum: { amount: true }, where: { status: 'POSTED', paymentDate: { gte: monthStart } } }),
    db.expense.aggregate({ _sum: { amount: true }, where: { status: 'POSTED', expenseDate: { gte: monthStart } } }),
    db.admission.findMany({ orderBy: { id: 'desc' }, take: 5, select: { id: true, applicationNo: true, studentFullName: true, status: true, createdAt: true } }),
    db.payment.findMany({ orderBy: { id: 'desc' }, take: 5, include: { student: { select: { fullName: true } } } }),
    db.announcement.findMany({ orderBy: { id: 'desc' }, take: 5, select: { id: true, title: true, status: true, createdAt: true } }),
    db.attendance.groupBy({
      by: ['attendanceDate'],
      where: { attendanceDate: { gte: new Date(now.getTime() - 14 * 86400000) } },
      _count: { status: true },
      orderBy: { attendanceDate: 'asc' },
    }),
  ])

  let outstanding = 0
  for (const inv of outstandingAgg) {
    const total = inv.items.reduce((a, b) => a + b.subtotal, 0)
    const paid = inv.allocations.filter((al) => al.payment.status === 'POSTED').reduce((a, b) => a + b.amount, 0)
    outstanding += Math.max(0, total - paid)
  }

  const presentToday = todayAttendance.filter((a) => a.status === 'PRESENT').length
  const attendanceRatio = todayAttendance.length > 0 ? Math.round((presentToday / todayAttendance.length) * 100) : null

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Ringkasan operasional sekolah.</p>
      </header>

      {/* KPI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Siswa Aktif</CardDescription><CardTitle className="text-3xl">{activeStudents}</CardTitle></CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Kelas Aktif</CardDescription><CardTitle className="text-3xl">{activeClasses}</CardTitle></CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Guru Aktif</CardDescription><CardTitle className="text-3xl">{activeTeachers}</CardTitle></CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Pendaftaran Menunggu</CardDescription><CardTitle className="text-3xl">{pendingAdmissions}</CardTitle></CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Kehadiran Hari Ini</CardDescription>
            <CardTitle className="text-3xl">{attendanceRatio === null ? '—' : `${attendanceRatio}%`}</CardTitle>
            <p className="text-xs text-[var(--muted-foreground)]">{presentToday} hadir dari {todayAttendance.length} record</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Tagihan Belum Dibayar</CardDescription><CardTitle className="text-2xl">{formatRupiah(outstanding)}</CardTitle></CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Penerimaan Bulan Ini</CardDescription><CardTitle className="text-2xl">{formatRupiah(monthPaymentsAgg._sum.amount ?? 0)}</CardTitle></CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Pengeluaran Bulan Ini</CardDescription><CardTitle className="text-2xl">{formatRupiah(monthExpensesAgg._sum.amount ?? 0)}</CardTitle></CardHeader>
        </Card>
      </div>

      {/* Aktivitas terbaru */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Pendaftaran Terbaru</CardTitle></CardHeader>
          <CardContent>
            {latestAdmissions.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">Belum ada pendaftaran.</p>
            ) : (
              <ul className="space-y-3">
                {latestAdmissions.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">{a.studentFullName}</span>
                    <span className="shrink-0 rounded-full bg-[var(--secondary)] px-2 py-0.5 text-xs">{a.status}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/pendaftaran" className="mt-3 inline-block text-sm underline underline-offset-4">Lihat semua</Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Pembayaran Terbaru</CardTitle></CardHeader>
          <CardContent>
            {latestPayments.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">Belum ada pembayaran.</p>
            ) : (
              <ul className="space-y-3">
                {latestPayments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">{p.student.fullName}</span>
                    <span className="shrink-0 tabular-nums">{formatRupiah(p.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/keuangan/pembayaran" className="mt-3 inline-block text-sm underline underline-offset-4">Lihat semua</Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Pengumuman Terbaru</CardTitle></CardHeader>
          <CardContent>
            {latestAnnouncements.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">Belum ada pengumuman.</p>
            ) : (
              <ul className="space-y-3">
                {latestAnnouncements.map((an) => (
                  <li key={an.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">{an.title}</span>
                    <span className="shrink-0 text-xs text-[var(--muted-foreground)]">{formatTanggalSingkat(an.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/pengumuman" className="mt-3 inline-block text-sm underline underline-offset-4">Lihat semua</Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
