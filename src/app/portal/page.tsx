import Link from 'next/link'
import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { ChartNoAxesCombined, ChevronRight, ClipboardCheck, MapPin, Megaphone, ReceiptText, Sparkles, UsersRound } from 'lucide-react'
import { formatRupiah, formatTanggalSingkat } from '@/lib/formatting/format'
import { Avatar, Empty, EmptyState, IconTile, Panel, Progress, QuickLinks, Row, RowList, firstName } from '@/components/dashboard/primitives'
import { HeroButton, ParentHero } from '@/components/dashboard/hero'

/**
 * Scoping inti portal ortu: user GUARDIAN hanya boleh lihat anak yang
 * terhubung lewat Guardian.userId (server-side, PRD §7.3).
 */
export async function getMyStudents(userId: number) {
  return db.student.findMany({
    where: { studentGuardians: { some: { guardian: { userId } } }, status: 'ACTIVE' },
    select: {
      id: true,
      fullName: true,
      studentCode: true,
      enrollments: { select: { classId: true, academicYearId: true, klass: { select: { name: true } } }, take: 1, orderBy: { id: 'desc' } },
    },
    orderBy: { fullName: 'asc' },
  })
}

/** Verifikasi akses 1 anak. */
export async function assertStudentAccess(userId: number, studentId: number): Promise<boolean> {
  const link = await db.guardian.findFirst({
    where: { userId, studentGuardians: { some: { studentId, student: { status: 'ACTIVE' } } } },
  })
  return Boolean(link)
}

export default async function PortalOrtuPage() {
  const user = await requireRole('PARENT')
  const students = await getMyStudents(user.id)
  const now = new Date()

  if (students.length === 0) {
    return <EmptyState icon={UsersRound} title="Belum ada data anak" description="Belum ada data anak yang terhubung ke akun Anda. Silakan hubungi pihak sekolah." />
  }

  const studentIds = students.map((s) => s.id)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [invoices, monthAttendance, announcements, activities] = await Promise.all([
    // Ringkasan keuangan semua anak
    db.invoice.findMany({
      where: { studentId: { in: studentIds } },
      include: { items: true, allocations: { include: { payment: { select: { status: true } } } } },
    }),
    db.attendance.groupBy({
      by: ['studentId', 'status'],
      where: { studentId: { in: studentIds }, attendanceDate: { gte: monthStart } },
      _count: { status: true },
    }),
    // Pengumuman untuk orang tua
    db.announcement.findMany({
      where: {
        status: 'PUBLISHED',
        audience: { in: ['ALL_PARENTS', 'PUBLIC'] },
        AND: [
          { OR: [{ publishAt: null }, { publishAt: { lte: now } }] },
          { OR: [{ expireAt: null }, { expireAt: { gt: now } }] },
        ],
      },
      orderBy: { publishAt: 'desc' },
      take: 5,
    }),
    // Kegiatan yang boleh dilihat orang tua
    db.activity.findMany({
      where: { status: 'PUBLISHED', visibility: { in: ['PUBLIC', 'PARENT_ONLY'] } },
      orderBy: { startDatetime: 'desc' },
      take: 3,
    }),
  ])

  let totalOutstanding = 0
  const outstandingByStudent = new Map<number, number>()
  for (const inv of invoices) {
    if (inv.status === 'VOID' || inv.status === 'PAID') continue
    const total = inv.items.reduce((s, i) => s + i.subtotal, 0)
    const paid = inv.allocations.filter((al) => al.payment.status === 'POSTED').reduce((s, al) => s + al.amount, 0)
    const remaining = Math.max(0, total - paid)
    totalOutstanding += remaining
    outstandingByStudent.set(inv.studentId, (outstandingByStudent.get(inv.studentId) ?? 0) + remaining)
  }
  const unpaidCount = invoices.filter((inv) => !['VOID', 'PAID'].includes(inv.status)).length

  const attendanceOf = (studentId: number) => {
    const rows = monthAttendance.filter((row) => row.studentId === studentId)
    const total = rows.reduce((sum, row) => sum + row._count.status, 0)
    const present = rows.find((row) => row.status === 'PRESENT')?._count.status ?? 0
    return { total, present }
  }
  const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long', timeZone: 'Asia/Jakarta' }).format(now)
  const greetName = students.length === 1 ? `Ayah & Bunda ${firstName(students[0].fullName)}` : 'Ayah & Bunda'

  return (
    <div className="space-y-6">
      <ParentHero
        now={now}
        greeting={`Halo, ${greetName}!`}
        kids={students.map((student) => ({ id: student.id, name: student.fullName, className: student.enrollments[0]?.klass?.name }))}
        notes={[
          ...students.slice(0, 2).map((student) => {
            const att = attendanceOf(student.id)
            return att.total
              ? `${firstName(student.fullName)} hadir ${att.present} dari ${att.total} hari di bulan ${monthName}.`
              : `Presensi ${firstName(student.fullName)} bulan ${monthName} belum tercatat.`
          }),
          totalOutstanding > 0 ? `Ada tagihan ${formatRupiah(totalOutstanding)} yang belum lunas.` : 'Semua tagihan sudah lunas — terima kasih!',
          ...(announcements[0] ? [`Info terbaru: ${announcements[0].title}`] : []),
        ]}
        sticker={totalOutstanding > 0 ? { text: 'Cek tagihan', tone: 'warning' } : { text: 'Lunas!', tone: 'success' }}
        actions={
          <>
            <HeroButton href={`/portal/anak/${students[0].id}`}><Sparkles /> Lihat perkembangan</HeroButton>
            <HeroButton href="/portal/pengumuman" variant="ghost"><Megaphone /> Pengumuman</HeroButton>
          </>
        }
      />

      {totalOutstanding > 0 ? (
        <Link href="/portal/tagihan" className="group flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] px-5 py-4 transition-colors hover:bg-amber-500/[0.12]">
          <div className="flex items-center gap-3">
            <IconTile icon={ReceiptText} tone="warning" />
            <div>
              <p className="text-sm font-semibold">Ada tagihan yang belum lunas</p>
              <p className="text-xs text-[var(--muted-foreground)]">Total <span className="font-semibold text-[var(--foreground)]">{formatRupiah(totalOutstanding)}</span> dari {unpaidCount} tagihan</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 dark:text-amber-300">Lihat rincian <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
        </Link>
      ) : null}

      <section className="space-y-3">
        <h2 className="section-title">Anak saya</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {students.map((student) => {
            const att = attendanceOf(student.id)
            const ratio = att.total ? Math.round((att.present / att.total) * 100) : null
            const owed = outstandingByStudent.get(student.id) ?? 0
            return (
              <Link key={student.id} href={`/portal/anak/${student.id}`} className="app-card group block p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--primary)]/30 hover:shadow-[var(--shadow-raised)]">
                <div className="flex items-center gap-4">
                  <Avatar name={student.fullName} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-heading text-base font-bold">{student.fullName}</p>
                    <p className="truncate text-xs text-[var(--muted-foreground)]">Kelas {student.enrollments[0]?.klass?.name ?? '-'} · NIS {student.studentCode}</p>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-[var(--muted-foreground)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--primary)]" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[var(--muted)]/70 p-3">
                    <p className="text-[11px] font-medium capitalize text-[var(--muted-foreground)]">Hadir bulan {monthName}</p>
                    <p className="mt-1 font-heading text-lg font-bold tabular-nums">{ratio === null ? '—' : `${ratio}%`}</p>
                    <div className="mt-1.5"><Progress value={ratio ?? 0} tone={ratio !== null && ratio < 80 ? 'warning' : 'success'} label="Persentase kehadiran" /></div>
                  </div>
                  <div className="rounded-xl bg-[var(--muted)]/70 p-3">
                    <p className="text-[11px] font-medium text-[var(--muted-foreground)]">Sisa tagihan</p>
                    <p className={`mt-1 truncate font-heading text-lg font-bold tabular-nums ${owed > 0 ? 'text-amber-600 dark:text-amber-300' : 'text-emerald-600 dark:text-emerald-300'}`}>{owed > 0 ? formatRupiah(owed) : 'Lunas'}</p>
                    <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)]">{att.total ? `${att.present} dari ${att.total} hari tercatat` : 'Presensi belum tercatat'}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <QuickLinks
        items={[
          { href: '/portal/tagihan', label: 'Tagihan', description: 'Rincian & kwitansi', icon: ReceiptText, tone: 'warning' },
          { href: '/portal/presensi', label: 'Presensi', description: 'Riwayat kehadiran', icon: ClipboardCheck, tone: 'success' },
          { href: '/portal/perkembangan', label: 'Rapor', description: 'Laporan perkembangan', icon: ChartNoAxesCombined, tone: 'info' },
          { href: '/portal/pengumuman', label: 'Pengumuman', description: 'Kabar dari sekolah', icon: Megaphone, tone: 'brand' },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Pengumuman terbaru" icon={Megaphone} action={{ href: '/portal/pengumuman', label: 'Semua' }} flush>
          {announcements.length === 0 ? <Empty icon={Megaphone}>Belum ada pengumuman.</Empty> : (
            <RowList>
              {announcements.map((item) => (
                <Row key={item.id} href="/portal/pengumuman" primary={item.title} secondary={formatTanggalSingkat(item.publishAt ?? item.createdAt)} />
              ))}
            </RowList>
          )}
        </Panel>
        <Panel title="Kegiatan sekolah" icon={Sparkles} flush>
          {activities.length === 0 ? <Empty icon={Sparkles}>Belum ada kegiatan.</Empty> : (
            <RowList>
              {activities.map((item) => (
                <Row
                  key={item.id}
                  leading={
                    item.startDatetime ? (
                      <span className="flex w-11 shrink-0 flex-col items-center rounded-xl bg-[var(--primary)]/10 py-1 text-[var(--primary)]">
                        <span className="font-heading text-base font-bold leading-none">{new Intl.DateTimeFormat('id-ID', { day: 'numeric', timeZone: 'Asia/Jakarta' }).format(item.startDatetime)}</span>
                        <span className="text-[10px] font-semibold uppercase">{new Intl.DateTimeFormat('id-ID', { month: 'short', timeZone: 'Asia/Jakarta' }).format(item.startDatetime)}</span>
                      </span>
                    ) : <IconTile icon={Sparkles} size="sm" />
                  }
                  primary={item.title}
                  secondary={item.location ? <span className="inline-flex items-center gap-1"><MapPin className="size-3" /> {item.location}</span> : 'Kegiatan sekolah'}
                />
              ))}
            </RowList>
          )}
        </Panel>
      </div>
    </div>
  )
}
