import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { ClipboardCheck } from 'lucide-react'
import { formatTanggal, formatTanggalSingkat } from '@/lib/formatting/format'
import { Empty, HeaderButton, PageHeader, Panel, Pill, Row, RowList, Stat, StatGroup } from '@/components/dashboard/primitives'

export default async function GuruDashboardPage() {
  const user = await requireRole('TEACHER')
  const teacher = await db.teacher.findUnique({ where: { userId: user.id } })
  if (!teacher) {
    return <p className="text-sm">Profil guru tidak ditemukan. Hubungi administrator.</p>
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
  const REPORT_STATUS: Record<string, { label: string; tone: 'neutral' | 'warning' | 'success' }> = {
    DRAFT: { label: 'Draf', tone: 'warning' },
    REVIEW: { label: 'Ditinjau', tone: 'neutral' },
    PUBLISHED: { label: 'Terbit', tone: 'success' },
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={formatTanggal(now)}
        title={`Selamat bertugas, ${user.name.split(' ')[0]}`}
        description="Ringkasan kelas dan kegiatan Anda hari ini."
        actions={<HeaderButton href="/guru/presensi" primary><ClipboardCheck /> Isi presensi</HeaderButton>}
      />

      <StatGroup columns={3}>
        <Stat label="Kelas diampu" value={classes.length} hint={classes.map((item) => item.name).join(', ') || 'Belum ada kelas'} />
        <Stat label="Jumlah siswa" value={totalStudents} hint="Di semua kelas Anda" />
        <Stat label="Jadwal hari ini" value={todaySchedule.length} hint={todaySchedule[0] ? `Mulai ${todaySchedule[0].startTime}` : 'Tidak ada jadwal'} href="/guru/jadwal" />
      </StatGroup>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Jadwal hari ini" action={{ href: '/guru/jadwal', label: 'Jadwal lengkap' }} flush>
          {todaySchedule.length === 0 ? <Empty>Tidak ada jadwal hari ini.</Empty> : (
            <RowList>
              {todaySchedule.map((item) => (
                <Row key={item.id} primary={item.activity} secondary={item.klass.name} trailing={<span className="tabular-nums text-[var(--muted-foreground)]">{item.startTime}</span>} />
              ))}
            </RowList>
          )}
        </Panel>

        <Panel title="Kelas saya" flush>
          {classes.length === 0 ? <Empty>Belum ada kelas yang ditugaskan.</Empty> : (
            <RowList>
              {classes.map((item) => (
                <Row key={item.id} href="/guru/presensi" primary={item.name} secondary={`Tahun ajaran ${item.academicYear.name}`} trailing={<span className="tabular-nums text-[var(--muted-foreground)]">{item._count.enrollments} siswa</span>} />
              ))}
            </RowList>
          )}
        </Panel>

        <Panel title="Laporan perkembangan terbaru" description={drafts ? `${drafts} masih draf` : undefined} action={{ href: '/guru/perkembangan', label: 'Kelola laporan' }} flush>
          {recentReports.length === 0 ? <Empty>Belum ada laporan dibuat.</Empty> : (
            <RowList>
              {recentReports.map((report) => {
                const status = REPORT_STATUS[report.status] ?? { label: report.status, tone: 'neutral' as const }
                return <Row key={report.id} href="/guru/perkembangan" primary={report.student.fullName} secondary={report.period} trailing={<Pill tone={status.tone}>{status.label}</Pill>} />
              })}
            </RowList>
          )}
        </Panel>

        <Panel title="Pengumuman untuk guru" flush>
          {announcements.length === 0 ? <Empty>Belum ada pengumuman.</Empty> : (
            <RowList>
              {announcements.map((item) => (
                <Row key={item.id} primary={item.title} secondary={formatTanggalSingkat(item.publishAt ?? item.createdAt)} />
              ))}
            </RowList>
          )}
        </Panel>
      </div>
    </div>
  )
}
