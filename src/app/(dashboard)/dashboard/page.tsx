import {
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  Globe,
  GraduationCap,
  ListTodo,
  ReceiptText,
  TrendingUp,
  UserPlus,
  Wallet,
} from 'lucide-react'
import Link from 'next/link'
import { requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { formatRupiah, formatTanggal, formatTanggalSingkat } from '@/lib/formatting/format'
import { ADMISSION_STATUS, Avatar, BannerButton, Empty, Panel, QuickLinks, Row, RowList, Stat, StatGroup, StatusPill, WelcomeBanner, firstName } from '@/components/dashboard/primitives'

const METHOD: Record<string, string> = { CASH: 'Tunai', TRANSFER: 'Transfer', QRIS: 'QRIS', OTHER: 'Lainnya' }

function greeting(date: Date) {
  const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Jakarta' }).format(date))
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

export default async function DashboardPage() {
  const user = await requireAdminStaff()

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(todayStart.getTime() + 86400000)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // Semua aggregate jalan paralel — sesuai PRD §36
  const [
    activeStudents,
    activeClasses,
    activeTeachers,
    pendingAdmissions,
    todayAttendance,
    outstandingInvoices,
    monthPaymentsAgg,
    monthExpensesAgg,
    draftAnnouncements,
    latestAdmissions,
    latestPayments,
    attendanceTrendRaw,
  ] = await Promise.all([
    db.student.count({ where: { status: 'ACTIVE' } }),
    db.class.findMany({ where: { status: 'ACTIVE' }, select: { id: true } }),
    db.teacher.count({ where: { isActive: true } }),
    db.admission.count({ where: { status: { in: ['SUBMITTED', 'REVIEW', 'REVISION_REQUIRED'] } } }),
    db.attendance.findMany({ where: { attendanceDate: { gte: todayStart, lt: tomorrow } }, select: { status: true, classId: true } }),
    db.invoice.findMany({
      where: { status: { in: ['ISSUED', 'PARTIAL', 'OVERDUE'] } },
      select: { dueDate: true, items: { select: { subtotal: true } }, allocations: { select: { amount: true, payment: { select: { status: true } } } } },
    }),
    db.payment.aggregate({ _sum: { amount: true }, where: { status: 'POSTED', paymentDate: { gte: monthStart } } }),
    db.expense.aggregate({ _sum: { amount: true }, where: { status: 'POSTED', expenseDate: { gte: monthStart } } }),
    db.announcement.count({ where: { status: 'DRAFT' } }),
    db.admission.findMany({ orderBy: { id: 'desc' }, take: 5, select: { id: true, studentFullName: true, preferredLevel: true, status: true, createdAt: true } }),
    db.payment.findMany({ orderBy: { id: 'desc' }, take: 5, select: { id: true, amount: true, paymentDate: true, method: true, student: { select: { fullName: true } } } }),
    db.attendance.groupBy({
      by: ['attendanceDate', 'status'],
      where: { attendanceDate: { gte: new Date(now.getTime() - 14 * 86400000) } },
      _count: { status: true },
      orderBy: { attendanceDate: 'asc' },
    }),
  ])

  let outstanding = 0
  let overdueCount = 0
  for (const invoice of outstandingInvoices) {
    const total = invoice.items.reduce((sum, item) => sum + item.subtotal, 0)
    const paid = invoice.allocations.filter((al) => al.payment.status === 'POSTED').reduce((sum, al) => sum + al.amount, 0)
    const remaining = Math.max(0, total - paid)
    outstanding += remaining
    if (remaining > 0 && invoice.dueDate < todayStart) overdueCount += 1
  }

  const presentToday = todayAttendance.filter((a) => a.status === 'PRESENT').length
  const attendanceRatio = todayAttendance.length > 0 ? Math.round((presentToday / todayAttendance.length) * 100) : null
  const classesRecorded = new Set(todayAttendance.map((a) => a.classId)).size
  const classesMissing = Math.max(0, activeClasses.length - classesRecorded)
  const isWeekday = ![0, 6].includes(now.getDay())

  const trendMap = new Map<string, { date: Date; total: number; present: number }>()
  for (const row of attendanceTrendRaw) {
    const key = row.attendanceDate.toISOString().slice(0, 10)
    const item = trendMap.get(key) ?? { date: row.attendanceDate, total: 0, present: 0 }
    item.total += row._count.status
    if (row.status === 'PRESENT') item.present += row._count.status
    trendMap.set(key, item)
  }
  const trend = [...trendMap.values()].map((item) => ({ ...item, ratio: item.total ? Math.round((item.present / item.total) * 100) : 0 }))
  const trendAverage = trend.length ? Math.round(trend.reduce((sum, item) => sum + item.ratio, 0) / trend.length) : null

  const income = monthPaymentsAgg._sum.amount ?? 0
  const spending = monthExpensesAgg._sum.amount ?? 0
  const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long', timeZone: 'Asia/Jakarta' }).format(now)

  const tasks = [
    pendingAdmissions > 0 && { href: '/ppdb?status=pending', label: `${pendingAdmissions} pendaftar PPDB menunggu ditinjau`, tone: 'warning' as const },
    isWeekday && classesMissing > 0 && { href: '/presensi', label: `${classesMissing} kelas belum mengisi presensi hari ini`, tone: 'warning' as const },
    overdueCount > 0 && { href: '/keuangan/tagihan', label: `${overdueCount} tagihan melewati jatuh tempo`, tone: 'danger' as const },
    draftAnnouncements > 0 && { href: '/website/pengumuman', label: `${draftAnnouncements} pengumuman masih draf`, tone: 'neutral' as const },
  ].filter(Boolean) as { href: string; label: string; tone: 'warning' | 'danger' | 'neutral' }[]

  const net = income - spending
  const flowMax = Math.max(income, spending, 1)

  return (
    <div className="space-y-6">
      <WelcomeBanner
        eyebrow={<><CalendarCheck2 className="size-3.5" /> {formatTanggal(now)}</>}
        title={`${greeting(now)}, ${firstName(user.name)}`}
        description={tasks.length ? `Ada ${tasks.length} hal yang perlu ditindaklanjuti hari ini. Semangat mengelola TK Orchid!` : 'Semua beres untuk hari ini. Berikut ringkasan operasional sekolah.'}
        actions={
          <>
            <BannerButton href="/siswa/tambah" solid><UserPlus /> Tambah siswa</BannerButton>
            <BannerButton href="/keuangan/pembayaran"><CreditCard /> Catat pembayaran</BannerButton>
          </>
        }
        aside={
          <div className="grid shrink-0 grid-cols-2 gap-3 sm:w-[340px]">
            <div className="rounded-2xl bg-white/12 p-4 ring-1 ring-white/20 backdrop-blur">
              <p className="text-xs text-white/75">Perlu tindakan</p>
              <p className="mt-1 font-heading text-2xl font-bold tabular-nums">{tasks.length}</p>
              <p className="mt-0.5 text-[11px] text-white/70">{tasks.length ? 'hal menunggu Anda' : 'Semua beres'}</p>
            </div>
            <div className="rounded-2xl bg-white/12 p-4 ring-1 ring-white/20 backdrop-blur">
              <p className="text-xs text-white/75">Kas bulan ini</p>
              <p className="mt-1 truncate font-heading text-2xl font-bold tabular-nums">{formatRupiah(net)}</p>
              <p className="mt-0.5 text-[11px] capitalize text-white/70">Selisih {monthName}</p>
            </div>
          </div>
        }
      />

      <StatGroup>
        <Stat icon={GraduationCap} label="Siswa aktif" value={activeStudents} hint={`${activeClasses.length} kelas · ${activeTeachers} guru`} href="/siswa" />
        <Stat
          icon={ClipboardCheck}
          label="Kehadiran hari ini"
          value={attendanceRatio === null ? '—' : `${attendanceRatio}%`}
          hint={attendanceRatio === null ? 'Belum ada presensi tercatat' : `${presentToday} dari ${todayAttendance.length} siswa hadir`}
          tone={attendanceRatio !== null && attendanceRatio < 80 ? 'warning' : 'default'}
          href="/presensi"
        />
        <Stat icon={ClipboardList} label="Pendaftar menunggu" value={pendingAdmissions} hint={pendingAdmissions ? 'Perlu ditinjau' : 'Tidak ada antrean'} tone={pendingAdmissions ? 'warning' : 'default'} href="/ppdb?status=pending" />
        <Stat icon={ReceiptText} label="Tagihan belum dibayar" value={formatRupiah(outstanding)} hint={overdueCount ? `${overdueCount} lewat jatuh tempo` : `${outstandingInvoices.length} tagihan terbuka`} tone={overdueCount ? 'danger' : 'default'} href="/keuangan/tagihan" />
      </StatGroup>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          icon={TrendingUp}
          title="Kehadiran 14 hari terakhir"
          description={trendAverage === null ? 'Persentase siswa hadir per hari' : `Rata-rata ${trendAverage}% siswa hadir`}
          action={{ href: '/presensi', label: 'Presensi' }}
        >
          {trend.length === 0 ? (
            <Empty icon={ClipboardCheck}>Belum ada data presensi dalam 14 hari terakhir.</Empty>
          ) : (
            <div className="relative">
              <div className="pointer-events-none absolute inset-x-0 top-6 bottom-6 flex flex-col justify-between" aria-hidden="true">
                {[100, 75, 50, 25, 0].map((mark) => (
                  <div key={mark} className="flex items-center gap-2">
                    <span className="w-7 text-right text-[10px] tabular-nums text-[var(--muted-foreground)]">{mark}%</span>
                    <span className="h-px flex-1 border-t border-dashed border-[var(--border)]" />
                  </div>
                ))}
              </div>
              <div className="relative ml-9 flex h-56 items-end gap-1.5 overflow-x-auto" role="img" aria-label={`Grafik kehadiran, rata-rata ${trendAverage}%`}>
                {trend.map((item) => (
                  <div key={item.date.toISOString()} className="group flex h-full min-w-8 flex-1 flex-col items-center justify-end gap-2" title={`${formatTanggalSingkat(item.date)}: ${item.ratio}% (${item.present}/${item.total})`}>
                    <span className="h-4 text-[10px] font-semibold tabular-nums text-[var(--primary)] opacity-0 transition-opacity group-hover:opacity-100">{item.ratio}%</span>
                    <div className="relative w-full max-w-8 flex-1">
                      <div
                        className="absolute inset-x-0 bottom-0 rounded-t-lg bg-gradient-to-t from-[var(--primary)] to-[color-mix(in_srgb,var(--primary)_55%,#f0abfc)] shadow-sm transition-all group-hover:brightness-110"
                        style={{ height: `${Math.max(item.ratio, 3)}%` }}
                      />
                    </div>
                    <span className="h-4 text-[10px] tabular-nums text-[var(--muted-foreground)]">{new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(item.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel title="Perlu tindakan" icon={ListTodo} description={tasks.length ? `${tasks.length} item` : undefined} flush>
            {tasks.length === 0 ? (
              <div className="flex items-center gap-3 px-5 py-6 text-sm text-[var(--muted-foreground)]">
                <span className="flex size-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600"><CheckCircle2 className="size-[18px]" /></span>
                Semua beres untuk hari ini.
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {tasks.map((task) => (
                  <li key={task.href}>
                    <Link href={task.href} className="group flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-[var(--primary)]/[0.04]">
                      <span className={`flex size-2 shrink-0 rounded-full ring-4 ${task.tone === 'danger' ? 'bg-[var(--destructive)] ring-[var(--destructive)]/15' : task.tone === 'warning' ? 'bg-amber-500 ring-amber-500/15' : 'bg-[var(--muted-foreground)] ring-[var(--muted)]'}`} aria-hidden="true" />
                      <span className="flex-1">{task.label}</span>
                      <ChevronRight className="size-4 text-[var(--muted-foreground)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--primary)]" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={`Kas bulan ${monthName}`} icon={Wallet} action={{ href: '/keuangan/pengeluaran', label: 'Keuangan' }}>
            <dl className="space-y-4 text-sm">
              <div>
                <div className="flex justify-between gap-3"><dt className="text-[var(--muted-foreground)]">Penerimaan</dt><dd className="font-semibold tabular-nums">{formatRupiah(income)}</dd></div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--muted)]"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${(income / flowMax) * 100}%` }} /></div>
              </div>
              <div>
                <div className="flex justify-between gap-3"><dt className="text-[var(--muted-foreground)]">Pengeluaran</dt><dd className="font-semibold tabular-nums">{formatRupiah(spending)}</dd></div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--muted)]"><div className="h-full rounded-full bg-amber-500" style={{ width: `${(spending / flowMax) * 100}%` }} /></div>
              </div>
              <div className="flex justify-between gap-3 border-t border-[var(--border)] pt-3">
                <dt className="font-medium">Selisih</dt>
                <dd className={`font-heading text-base font-bold tabular-nums ${net < 0 ? 'text-[var(--destructive)]' : 'text-emerald-600 dark:text-emerald-300'}`}>{formatRupiah(net)}</dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="section-title">Akses cepat</h2>
        <QuickLinks
          items={[
            { href: '/presensi', label: 'Isi presensi', description: 'Catat kehadiran kelas', icon: ClipboardCheck, tone: 'success' },
            { href: '/keuangan/tagihan', label: 'Buat tagihan', description: 'SPP & biaya lainnya', icon: ReceiptText, tone: 'info' },
            { href: '/ppdb', label: 'Tinjau PPDB', description: 'Calon siswa baru', icon: ClipboardList, tone: 'warning' },
            { href: '/website', label: 'Kelola website', description: 'Berita, galeri, slider', icon: Globe, tone: 'brand' },
          ]}
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Pendaftaran terbaru" icon={ClipboardList} action={{ href: '/ppdb', label: 'Semua pendaftar' }} flush>
          {latestAdmissions.length === 0 ? <Empty>Belum ada pendaftaran.</Empty> : (
            <RowList>
              {latestAdmissions.map((item) => (
                <Row
                  key={item.id}
                  href="/ppdb"
                  leading={<Avatar name={item.studentFullName} />}
                  primary={item.studentFullName}
                  secondary={`${item.preferredLevel ?? 'Jenjang belum dipilih'} · ${formatTanggalSingkat(item.createdAt)}`}
                  trailing={<StatusPill map={ADMISSION_STATUS} status={item.status} />}
                />
              ))}
            </RowList>
          )}
        </Panel>

        <Panel title="Pembayaran terbaru" icon={CreditCard} action={{ href: '/keuangan/pembayaran', label: 'Semua pembayaran' }} flush>
          {latestPayments.length === 0 ? <Empty>Belum ada pembayaran.</Empty> : (
            <RowList>
              {latestPayments.map((item) => (
                <Row
                  key={item.id}
                  leading={<Avatar name={item.student.fullName} />}
                  primary={item.student.fullName}
                  secondary={`${formatTanggalSingkat(item.paymentDate)} · ${METHOD[item.method] ?? item.method}`}
                  trailing={<span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-300">+{formatRupiah(item.amount)}</span>}
                />
              ))}
            </RowList>
          )}
        </Panel>
      </div>
    </div>
  )
}
