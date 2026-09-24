import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatTanggalSingkat } from '@/lib/formatting/format'
import Link from 'next/link'

const DAY_NAMES = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

export default async function GuruDashboardPage() {
  const user = await requireRole('TEACHER')
  const teacher = await db.teacher.findUnique({ where: { userId: user.id } })
  if (!teacher) {
    return <p className="text-sm">Profil guru tidak ditemukan. Hubungi administrator.</p>
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayDow = now.getDay() === 0 ? 7 : now.getDay()

  const [classes, todaySchedule, recentReports, announcements] = await Promise.all([
    db.class.findMany({
      where: { teacherId: teacher.id, status: 'ACTIVE' },
      include: { academicYear: true, _count: { select: { enrollments: true } } },
    }),
    db.schedule.findMany({
      where: { classId: { in: await db.class.findMany({ where: { teacherId: teacher.id }, select: { id: true } }).then((cs) => cs.map((c) => c.id)) }, dayOfWeek: todayDow },
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
      where: { audience: { in: ['TEACHERS'] }, status: 'PUBLISHED' },
      orderBy: { publishAt: 'desc' },
      take: 5,
    }),
  ])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard Guru</h1>
        <p className="text-sm text-[var(--muted-foreground)]">{formatTanggalSingkat(now)} · Selamat bertugas, {user.name}.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Kelas Saya ({classes.length})</CardTitle></CardHeader>
          <CardContent>
            {classes.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">Belum ada kelas yang ditugaskan.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {classes.map((c) => (
                  <li key={c.id} className="flex justify-between">
                    <span>{c.name} <span className="text-xs text-[var(--muted-foreground)]">({c.academicYear.name})</span></span>
                    <span className="tabular-nums text-[var(--muted-foreground)]">{c._count.enrollments} siswa</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Jadwal Hari Ini</CardTitle></CardHeader>
          <CardContent>
            {todaySchedule.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">Tidak ada jadwal hari ini.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {todaySchedule.map((s) => (
                  <li key={s.id} className="flex gap-3">
                    <span className="tabular-nums text-[var(--muted-foreground)]">{s.startTime}</span>
                    <span>{s.activity} · {s.klass.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Laporan Perkembangan Terbaru</CardTitle></CardHeader>
          <CardContent>
            {recentReports.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">Belum ada laporan dibuat.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {recentReports.map((r) => (
                  <li key={r.id} className="flex justify-between">
                    <span>{r.student.fullName} · {r.period}</span>
                    <span className="rounded-full bg-[var(--secondary)] px-2 py-0.5 text-xs text-[var(--primary)]">{r.status}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/guru/perkembangan" className="mt-3 inline-block text-sm underline underline-offset-4">Kelola laporan</Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Pengumuman untuk Guru</CardTitle></CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">Belum ada pengumuman.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {announcements.map((a) => (
                  <li key={a.id} className="flex justify-between gap-2">
                    <span className="truncate">{a.title}</span>
                    <span className="shrink-0 text-xs text-[var(--muted-foreground)]">{formatTanggalSingkat(a.publishAt ?? a.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
