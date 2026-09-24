import { notFound } from 'next/navigation'
import { requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { enrollStudentAction } from '@/actions/classes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatTanggalSingkat } from '@/lib/formatting/format'

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
  const enrolledIds = new Set(klass.enrollments.map((e) => e.student.id))
  const unenrolled = await db.student.findMany({
    where: { status: 'ACTIVE', id: { notIn: Array.from(enrolledIds) } },
    select: { id: true, fullName: true, studentCode: true },
    orderBy: { fullName: 'asc' },
    take: 200,
  })

  const full = klass.enrollments.length >= klass.capacity
  const DAY_NAMES = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{klass.name}</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {klass.code} · {klass.academicYear.name} · Wali: {klass.teacher?.fullName ?? '-'} · {klass.room ?? 'tanpa ruang'}
          </p>
        </div>
        <form action={enrollStudentAction} className="flex items-end gap-2">
          <input type="hidden" name="classId" value={klass.id} />
          <select
            name="studentId"
            required
            disabled={full}
            aria-label="Pilih siswa untuk didaftarkan"
            className="h-9 rounded-md border border-[var(--input)] bg-[var(--card)] px-3 text-sm"
            defaultValue=""
          >
            <option value="" disabled>{full ? 'Kelas penuh' : 'Pilih siswa…'}</option>
            {unenrolled.map((s) => (
              <option key={s.id} value={s.id}>{s.fullName} ({s.studentCode})</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={full}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
          >
            Daftarkan
          </button>
        </form>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar Siswa ({klass.enrollments.length}/{klass.capacity})</CardTitle>
        </CardHeader>
        <CardContent>
          {klass.enrollments.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">Belum ada siswa di kelas ini.</p>
          ) : (
            <ul className="divide-y text-sm">
              {klass.enrollments.map((e) => (
                <li key={e.id} className="flex items-center justify-between py-2">
                  <a href={`/siswa/${e.student.id}`} className="underline-offset-4 hover:underline">{e.student.fullName}</a>
                  <span className="flex gap-3 text-xs text-[var(--muted-foreground)]">
                    <span>{e.student.gender === 'L' ? 'L' : 'P'}</span>
                    <span>masuk {formatTanggalSingkat(e.enrollmentDate)}</span>
                    <span className="rounded-full bg-[var(--secondary)] px-2 py-0.5 text-[var(--primary)]">{e.status}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Jadwal Mingguan</CardTitle></CardHeader>
        <CardContent>
          {klass.schedules.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">Belum ada jadwal.</p>
          ) : (
            <ul className="divide-y text-sm">
              {klass.schedules.map((s) => (
                <li key={s.id} className="flex justify-between py-2">
                  <span className="w-20 font-medium">{DAY_NAMES[s.dayOfWeek]}</span>
                  <span className="tabular-nums text-[var(--muted-foreground)]">{s.startTime}–{s.endTime}</span>
                  <span className="flex-1 pl-4">{s.activity}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
