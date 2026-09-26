import { ClipboardCheck } from 'lucide-react'
import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { formatTanggal } from '@/lib/formatting/format'
import { ATTENDANCE_STATUS, Avatar, EmptyState, PageHeader, Progress, StatusPill } from '@/components/dashboard/primitives'

export const metadata = { title: 'Presensi Anak' }

const SUMMARY = [
  { status: 'PRESENT', label: 'Hadir', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  { status: 'SICK', label: 'Sakit', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  { status: 'PERMISSION', label: 'Izin', className: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  { status: 'ABSENT', label: 'Alpa', className: 'bg-[var(--destructive)]/10 text-[var(--destructive)]' },
]

export default async function PortalPresensiPage() {
  const user = await requireRole('PARENT')
  const students = await db.student.findMany({
    where: { studentGuardians: { some: { guardian: { userId: user.id } } }, status: 'ACTIVE' },
    select: { id: true },
  })
  if (students.length === 0) {
    return <EmptyState icon={ClipboardCheck} title="Belum ada data anak" description="Hubungi pihak sekolah untuk menghubungkan data anak ke akun Anda." />
  }

  const records = await db.attendance.findMany({
    where: { studentId: { in: students.map((s) => s.id) } },
    include: { student: { select: { fullName: true } } },
    orderBy: { attendanceDate: 'desc' },
    take: 60,
  })

  const byStudent = new Map<number, typeof records>()
  for (const r of records) {
    const arr = byStudent.get(r.studentId)
    if (arr) arr.push(r)
    else byStudent.set(r.studentId, [r])
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={ClipboardCheck} title="Presensi Anak" description="Riwayat kehadiran terbaru (maksimal 60 catatan untuk semua anak)." />

      {byStudent.size === 0 ? (
        <EmptyState icon={ClipboardCheck} title="Belum ada data presensi" description="Kehadiran yang dicatat guru akan tampil di sini." />
      ) : (
        [...byStudent.entries()].map(([studentId, rows]) => {
          const present = rows.filter((r) => r.status === 'PRESENT').length
          const ratio = Math.round((present / rows.length) * 100)
          return (
            <section key={studentId} className="app-card overflow-hidden">
              <div className="flex flex-wrap items-center gap-4 border-b border-[var(--border)] p-5">
                <Avatar name={rows[0].student.fullName} size="lg" />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-heading text-lg font-bold">{rows[0].student.fullName}</h2>
                  <div className="mt-2 flex max-w-sm items-center gap-3">
                    <Progress value={ratio} tone={ratio < 80 ? 'warning' : 'success'} label="Persentase kehadiran" />
                    <span className="shrink-0 text-xs font-semibold tabular-nums">{ratio}% hadir</span>
                  </div>
                </div>
                <div className="grid w-full grid-cols-4 gap-2 sm:w-auto">
                  {SUMMARY.map((item) => (
                    <div key={item.status} className={`rounded-xl px-3 py-2 text-center ${item.className}`}>
                      <p className="font-heading text-lg font-bold leading-none tabular-nums">{rows.filter((r) => r.status === item.status).length}</p>
                      <p className="mt-1 text-[11px] font-medium">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <ul className="grid grid-cols-1 divide-y divide-[var(--border)] sm:grid-cols-2 sm:divide-y-0">
                {rows.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm sm:border-b sm:border-[var(--border)] sm:odd:border-r">
                    <div className="min-w-0">
                      <p className="font-medium">{formatTanggal(r.attendanceDate)}</p>
                      {r.note && <p className="truncate text-xs text-[var(--muted-foreground)]">{r.note}</p>}
                    </div>
                    <StatusPill map={ATTENDANCE_STATUS} status={r.status} />
                  </li>
                ))}
              </ul>
            </section>
          )
        })
      )}
    </div>
  )
}
