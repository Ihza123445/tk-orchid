import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { BookOpenCheck, CalendarClock, CalendarDays, ChartNoAxesCombined, ClipboardCheck, Clock, FileText, Megaphone, School, UsersRound } from 'lucide-react'
import { formatTanggal, formatTanggalSingkat } from '@/lib/formatting/format'
import Link from 'next/link'
import { Avatar, BannerButton, Empty, EmptyState, IconTile, Panel, Progress, QuickLinks, REPORT_STATUS, Row, RowList, Stat, StatGroup, StatusPill, WelcomeBanner, firstName } from '@/components/dashboard/primitives'

export default async function GuruDashboardPage() {
  const user = await requireRole('TEACHER')
  const teacher = await db.teacher.findUnique({ where: { userId: user.id } })
  if (!teacher) {
    return <EmptyState icon={UsersRound} title="Profil guru tidak ditemukan" description="Hubungi administrator untuk menghubungkan akun Anda." />
  }

  const now = new Date()
  const todayDow = now.getDay() === 0 ? 7 : now.getDay()
  const classIds = await db.class.findMany({ where: { teacherId: teacher.id }, select: { id: true } }).then((rows) => rows.map((row) => row.id))

  const [classes, todaySchedule, recentReports, announcements] = await Promise.all([
    db.class.findMany({
      where: { teacherId: teacher.id, status: 'ACTIVE' },
      include: { academicYear: true, _count: { select: { enrollments: true } } },
    }),
    db.schedule.findMany({
      where: { classId: { in: classIds.length > 0 ? classIds : [-1] }, dayOfWeek: todayDow },
      include: { klass: { select: { name: true } } },
      orderBy: { startTime: 'asc' },
    }),
    db.developmentReport.findMany({
      where: { createdBy: user.id },
      include: { student: { select: { fullName: true } } },
      orderBy: { id: 'desc' },
      take: 5,
    }),
    db.announcement.findMany({
      where: {
        audience: { in: ['TEACHERS'] },
        status: 'PUBLISHED',
        AND: [
          { OR: [{ publishAt: null }, { publishAt: { lte: now } }] },
          { OR: [{ expireAt: null }, { expireAt: { gt: now } }] },
        ],
      },
      orderBy: { publishAt: 'desc' },
      take: 5,
    }),
  ])

  const totalStudents = classes.reduce((sum, item) => sum + item._count.enrollments, 0)
  const drafts = recentReports.filter((report) => report.status === 'DRAFT').length
  const nowTime = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Asia/Jakarta' }).format(now)
  const current = todaySchedule.find((item) => item.startTime <= nowTime && item.endTime > nowTime)
  const next = todaySchedule.find((item) => item.startTime > nowTime)

  return (
    <div className="space-y-6">
      <WelcomeBanner
        eyebrow={<><CalendarDays className="size-3.5" /> {formatTanggal(now)}</>}
        title={`Selamat bertugas, ${firstName(user.name)}`}
        description={todaySchedule.length ? `Hari ini ada ${todaySchedule.length} kegiatan terjadwal di kelas Anda.` : 'Tidak ada jadwal mengajar hari ini. Waktu yang pas untuk melengkapi laporan perkembangan.'}
        actions={
          <>
            <BannerButton href="/guru/presensi" solid><ClipboardCheck /> Isi presensi</BannerButton>
            <BannerButton href="/guru/perkembangan"><FileText /> Tulis laporan</BannerButton>
          </>
        }
        aside={
          <div className="w-full shrink-0 rounded-2xl bg-white/12 p-4 ring-1 ring-white/20 backdrop-blur sm:w-[320px]">
            <p className="flex items-center gap-1.5 text-xs text-white/75"><Clock className="size-3.5" /> {current ? 'Sedang berlangsung' : next ? 'Kegiatan berikutnya' : 'Jadwal hari ini'}</p>
            {current || next ? (
              <>
                <p className="mt-1.5 truncate font-heading text-lg font-bold">{(current ?? next)!.activity}</p>
                <p className="mt-0.5 text-xs text-white/75">{(current ?? next)!.startTime}–{(current ?? next)!.endTime} · {(current ?? next)!.klass.name}</p>
              </>
            ) : (
              <p className="mt-1.5 font-heading text-lg font-bold">{todaySchedule.length ? 'Semua kegiatan selesai' : 'Tidak ada jadwal'}</p>
            )}
          </div>
        }
      />

      <StatGroup columns={3}>
        <Stat icon={School} label="Kelas diampu" value={classes.length} hint={classes.map((item) => item.name).join(', ') || 'Belum ada kelas'} />
        <Stat icon={UsersRound} label="Jumlah siswa" value={totalStudents} hint="Di semua kelas Anda" />
        <Stat icon={CalendarClock} label="Jadwal hari ini" value={todaySchedule.length} hint={todaySchedule[0] ? `Mulai ${todaySchedule[0].startTime}` : 'Tidak ada jadwal'} href="/guru/jadwal" />
      </StatGroup>

      <QuickLinks
        items={[
          { href: '/guru/presensi', label: 'Presensi', description: 'Catat kehadiran', icon: ClipboardCheck, tone: 'success' },
          { href: '/guru/penilaian', label: 'Penilaian', description: 'Capaian per domain', icon: BookOpenCheck, tone: 'info' },
          { href: '/guru/perkembangan', label: 'Perkembangan', description: drafts ? `${drafts} laporan draf` : 'Rapor naratif', icon: ChartNoAxesCombined, tone: 'warning' },
          { href: '/guru/jadwal', label: 'Jadwal', description: 'Agenda mingguan', icon: CalendarDays, tone: 'brand' },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Panel className="lg:col-span-3" icon={CalendarClock} title="Jadwal hari ini" action={{ href: '/guru/jadwal', label: 'Jadwal lengkap' }}>
          {todaySchedule.length === 0 ? <Empty icon={CalendarDays}>Tidak ada jadwal hari ini.</Empty> : (
            <ol className="relative space-y-1 before:absolute before:bottom-3 before:left-[52px] before:top-3 before:w-px before:bg-[var(--border)]">
              {todaySchedule.map((item) => {
                const isNow = item.id === current?.id
                const done = item.endTime <= nowTime
                return (
                  <li key={item.id} className="relative flex items-start gap-4 py-2">
                    <span className={`w-10 shrink-0 pt-0.5 text-right text-xs font-semibold tabular-nums ${isNow ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`}>{item.startTime}</span>
                    <span className={`relative z-10 mt-1 size-3 shrink-0 rounded-full border-2 ${isNow ? 'border-[var(--primary)] bg-[var(--primary)] ring-4 ring-[var(--primary)]/15' : done ? 'border-[var(--muted-foreground)]/40 bg-[var(--muted)]' : 'border-[var(--primary)] bg-[var(--card)]'}`} aria-hidden="true" />
                    <div className={`min-w-0 flex-1 rounded-xl px-3 py-2 ${isNow ? 'bg-[var(--primary)]/[0.07] ring-1 ring-[var(--primary)]/20' : ''}`}>
                      <p className={`truncate text-sm font-semibold ${done && !isNow ? 'text-[var(--muted-foreground)]' : ''}`}>{item.activity}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{item.startTime}–{item.endTime} · {item.klass.name}{isNow && <span className="ml-1.5 font-semibold text-[var(--primary)]">· Sedang berlangsung</span>}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </Panel>

        <Panel className="lg:col-span-2" icon={School} title="Kelas saya">
          {classes.length === 0 ? <Empty>Belum ada kelas yang ditugaskan.</Empty> : (
            <ul className="space-y-3">
              {classes.map((item) => (
                <li key={item.id}>
                  <Link href="/guru/presensi" className="group block rounded-xl border border-[var(--border)] p-4 transition-all hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/[0.03]">
                    <div className="flex items-center gap-3">
                      <IconTile icon={School} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{item.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">Tahun ajaran {item.academicYear.name}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                      <span>{item._count.enrollments} dari {item.capacity} kursi terisi</span>
                      <span className="font-semibold tabular-nums text-[var(--foreground)]">{Math.round((item._count.enrollments / Math.max(item.capacity, 1)) * 100)}%</span>
                    </div>
                    <div className="mt-1.5"><Progress value={(item._count.enrollments / Math.max(item.capacity, 1)) * 100} label={`Kapasitas ${item.name}`} /></div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Laporan perkembangan terbaru" icon={FileText} description={drafts ? `${drafts} masih draf` : undefined} action={{ href: '/guru/perkembangan', label: 'Kelola laporan' }} flush>
          {recentReports.length === 0 ? <Empty>Belum ada laporan dibuat.</Empty> : (
            <RowList>
              {recentReports.map((report) => (
                <Row key={report.id} href="/guru/perkembangan" leading={<Avatar name={report.student.fullName} />} primary={report.student.fullName} secondary={report.period} trailing={<StatusPill map={REPORT_STATUS} status={report.status} />} />
              ))}
            </RowList>
          )}
        </Panel>

        <Panel title="Pengumuman untuk guru" icon={Megaphone} flush>
          {announcements.length === 0 ? <Empty icon={Megaphone}>Belum ada pengumuman.</Empty> : (
            <RowList>
              {announcements.map((item) => (
                <Row key={item.id} leading={<IconTile icon={Megaphone} size="sm" tone="info" />} primary={item.title} secondary={formatTanggalSingkat(item.publishAt ?? item.createdAt)} />
              ))}
            </RowList>
          )}
        </Panel>
      </div>
    </div>
  )
}
