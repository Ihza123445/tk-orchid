import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { CalendarDays, Clock, DoorOpen } from 'lucide-react'
import { EmptyState, PageHeader } from '@/components/dashboard/primitives'

export const metadata = { title: 'Jadwal — Guru' }

const DAY_NAMES = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
const DAYS = [1, 2, 3, 4, 5]

export default async function GuruJadwalPage() {
  const user = await requireRole('TEACHER')
  const teacher = await db.teacher.findUnique({ where: { userId: user.id } })
  if (!teacher) return <EmptyState icon={CalendarDays} title="Profil guru tidak ditemukan" description="Hubungi administrator untuk menghubungkan akun Anda." />

  const classes = await db.class.findMany({ where: { teacherId: teacher.id }, select: { id: true, name: true } })
  const classIds = classes.map((c) => c.id)
  const schedules = await db.schedule.findMany({
    where: { classId: { in: classIds.length ? classIds : [-1] } },
    include: { klass: { select: { name: true } } },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  })

  const todayDow = new Date().getDay() === 0 ? 7 : new Date().getDay()

  return (
    <div className="space-y-6">
      <PageHeader icon={CalendarDays} eyebrow="Kelas saya" title="Jadwal Mengajar" description={`Jadwal mingguan untuk ${classes.map((c) => c.name).join(', ') || 'kelas Anda'}.`} />

      {classIds.length === 0 || schedules.length === 0 ? (
        <EmptyState icon={CalendarDays} title={classIds.length === 0 ? 'Belum ada kelas' : 'Belum ada jadwal'} description="Jadwal akan tampil di sini setelah diatur oleh admin." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {DAYS.map((day) => {
            const daySchedules = schedules.filter((s) => s.dayOfWeek === day)
            const isToday = day === todayDow
            return (
              <section key={day} className={`app-card flex flex-col overflow-hidden ${isToday ? 'ring-2 ring-[var(--primary)]/40' : ''}`}>
                <div className={`flex items-center justify-between px-4 py-3 ${isToday ? 'text-white' : 'border-b border-[var(--border)]'}`} style={isToday ? { background: 'var(--brand-gradient)' } : undefined}>
                  <h2 className="font-heading text-sm font-bold">{DAY_NAMES[day]}</h2>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${isToday ? 'bg-white/20' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}>{isToday ? 'Hari ini' : `${daySchedules.length} kegiatan`}</span>
                </div>
                {daySchedules.length === 0 ? (
                  <p className="flex-1 px-4 py-8 text-center text-xs text-[var(--muted-foreground)]">Tidak ada jadwal</p>
                ) : (
                  <ul className="flex-1 space-y-2 p-3">
                    {daySchedules.map((s) => (
                      <li key={s.id} className="rounded-xl border border-[var(--border)] border-l-[3px] border-l-[var(--primary)] bg-[var(--muted)]/40 px-3 py-2.5">
                        <p className="text-sm font-semibold leading-snug">{s.activity}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs tabular-nums text-[var(--muted-foreground)]"><Clock className="size-3" /> {s.startTime}–{s.endTime}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--muted-foreground)]"><DoorOpen className="size-3" /> {s.klass.name}{s.room ? ` · ${s.room}` : ''}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
