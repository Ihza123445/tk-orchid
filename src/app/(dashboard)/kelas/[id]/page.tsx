import { notFound } from 'next/navigation'
import { requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { enrollStudentAction } from '@/actions/classes'
import { CalendarDays, DoorOpen, School, UserRound, UsersRound } from 'lucide-react'
import { Avatar, Empty, IconTile, PageHeader, Panel, Progress, Row, RowList, STUDENT_STATUS, StatusPill } from '@/components/dashboard/primitives'
import { formatTanggalSingkat } from '@/lib/formatting/format'

export const metadata = { title: 'Detail Kelas' }

export default async function DetailKelasPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminStaff()
  const { id } = await params
  const classId = Number(id)
  if (!Number.isInteger(classId)) notFound()

  const klass = await db.class.findUnique({
    where: { id: classId },
    include: {
      academicYear: true,
      teacher: { select: { fullName: true } },
      enrollments: {
        include: { student: { select: { id: true, fullName: true, studentCode: true, gender: true, status: true } } },
        orderBy: { enrollmentDate: 'asc' },
      },
      schedules: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] },
    },
  })
  if (!klass) notFound()

  // siswa aktif yang belum terdaftar di TA ini (untuk dropdown enroll)
  const unenrolled = await db.student.findMany({
    where: {
      status: 'ACTIVE',
      enrollments: { none: { academicYearId: klass.academicYearId } },
    },
    select: { id: true, fullName: true, studentCode: true },
    orderBy: { fullName: 'asc' },
    take: 200,
  })

  const full = klass.enrollments.length >= klass.capacity
  const DAY_NAMES = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

  const filled = Math.round((klass.enrollments.length / Math.max(klass.capacity, 1)) * 100)
  const scheduleDays = [...new Set(klass.schedules.map((s) => s.dayOfWeek))]

  return (
    <div className="space-y-6">
      <PageHeader
        icon={School}
        back={{ href: '/kelas', label: 'Daftar kelas' }}
        eyebrow={`${klass.code} · ${klass.academicYear.name}`}
        title={klass.name}
        description={`Jenjang ${klass.level}`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="app-card flex items-center gap-3 p-4"><IconTile icon={UserRound} /><div className="min-w-0"><p className="text-xs text-[var(--muted-foreground)]">Wali kelas</p><p className="truncate text-sm font-semibold">{klass.teacher?.fullName ?? 'Belum ditentukan'}</p></div></div>
        <div className="app-card flex items-center gap-3 p-4"><IconTile icon={DoorOpen} tone="info" /><div className="min-w-0"><p className="text-xs text-[var(--muted-foreground)]">Ruang</p><p className="truncate text-sm font-semibold">{klass.room ?? 'Tanpa ruang'}</p></div></div>
        <div className="app-card p-4">
          <div className="flex items-center justify-between text-xs"><span className="text-[var(--muted-foreground)]">Kapasitas terisi</span><span className="font-semibold tabular-nums">{klass.enrollments.length}/{klass.capacity}</span></div>
          <p className="mt-1 font-heading text-xl font-bold tabular-nums">{filled}%</p>
          <div className="mt-2"><Progress value={filled} tone={full ? 'warning' : 'brand'} label="Kapasitas kelas" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
        <Panel className="lg:col-span-3" icon={UsersRound} title="Daftar siswa" description={`${klass.enrollments.length} dari ${klass.capacity} kursi terisi`} flush>
          <form action={enrollStudentAction} className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] bg-[var(--muted)]/40 px-5 py-3">
            <input type="hidden" name="classId" value={klass.id} />
            <select
              name="studentId"
              required
              disabled={full}
              aria-label="Pilih siswa untuk didaftarkan"
              className="field-select min-w-0 flex-1"
              defaultValue=""
            >
              <option value="" disabled>{full ? 'Kelas penuh' : unenrolled.length ? 'Pilih siswa untuk didaftarkan…' : 'Semua siswa aktif sudah punya kelas'}</option>
              {unenrolled.map((s) => (
                <option key={s.id} value={s.id}>{s.fullName} ({s.studentCode})</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={full}
              className="inline-flex h-9 items-center rounded-[10px] bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Daftarkan
            </button>
          </form>
          {klass.enrollments.length === 0 ? (
            <Empty icon={UsersRound}>Belum ada siswa di kelas ini.</Empty>
          ) : (
            <RowList>
              {klass.enrollments.map((e) => (
                <Row
                  key={e.id}
                  href={`/siswa/${e.student.id}`}
                  leading={<Avatar name={e.student.fullName} />}
                  primary={e.student.fullName}
                  secondary={`${e.student.studentCode} · ${e.student.gender === 'L' ? 'Laki-laki' : 'Perempuan'} · masuk ${formatTanggalSingkat(e.enrollmentDate)}`}
                  trailing={<StatusPill map={STUDENT_STATUS} status={e.status} />}
                />
              ))}
            </RowList>
          )}
        </Panel>

        <Panel className="lg:col-span-2" icon={CalendarDays} title="Jadwal mingguan" flush>
          {klass.schedules.length === 0 ? (
            <Empty icon={CalendarDays}>Belum ada jadwal.</Empty>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {scheduleDays.map((day) => (
                <div key={day} className="px-5 py-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">{DAY_NAMES[day]}</p>
                  <ul className="space-y-1.5">
                    {klass.schedules.filter((s) => s.dayOfWeek === day).map((s) => (
                      <li key={s.id} className="flex gap-3 text-sm">
                        <span className="w-24 shrink-0 tabular-nums text-[var(--muted-foreground)]">{s.startTime}–{s.endTime}</span>
                        <span className="min-w-0 truncate font-medium">{s.activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
