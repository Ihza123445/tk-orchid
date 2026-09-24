import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const DAY_NAMES = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
const DAYS = [1, 2, 3, 4, 5]

export default async function GuruJadwalPage() {
  const user = await requireRole('TEACHER')
  const teacher = await db.teacher.findUnique({ where: { userId: user.id } })
  if (!teacher) return <p className="text-sm text-[var(--muted-foreground)]">Profil guru tidak ditemukan.</p>

  const classes = await db.class.findMany({ where: { teacherId: teacher.id }, select: { id: true, name: true } })
  const classIds = classes.map((c) => c.id)
  const schedules = await db.schedule.findMany({
    where: { classId: { in: classIds.length ? classIds : [-1] } },
    include: { klass: { select: { name: true } } },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Jadwal Mengajar</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Jadwal mingguan kelas yang Anda ampu.</p>
      </header>

      {classIds.length === 0 ? (
        <p className="rounded-lg border border-dashed p-10 text-center text-sm text-[var(--muted-foreground)]">Belum ada kelas.</p>
      ) : (
        DAYS.map((day) => {
          const daySchedules = schedules.filter((s) => s.dayOfWeek === day)
          if (daySchedules.length === 0) return null
          return (
            <Card key={day}>
              <CardHeader><CardTitle className="text-base">{DAY_NAMES[day]}</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {daySchedules.map((s) => (
                    <li key={s.id} className="flex gap-3">
                      <span className="w-28 shrink-0 tabular-nums text-[var(--muted-foreground)]">{s.startTime}–{s.endTime}</span>
                      <span className="font-medium">{s.activity}</span>
                      <span className="text-[var(--muted-foreground)]">· {s.klass.name}{s.room ? ` · ${s.room}` : ''}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
