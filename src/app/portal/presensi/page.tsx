import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { formatTanggalSingkat } from '@/lib/formatting/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const ATT_LABEL: Record<string, string> = { PRESENT: 'Hadir', SICK: 'Sakit', PERMISSION: 'Izin', ABSENT: 'Alpa' }
const ATT_STYLE: Record<string, string> = {
  PRESENT: 'bg-[var(--secondary)] text-[var(--primary)]',
  SICK: 'bg-[var(--accent)]/15 text-[var(--accent)]',
  PERMISSION: 'bg-[var(--secondary)] text-[var(--secondary-foreground)]',
  ABSENT: 'bg-[var(--destructive)]/15 text-[var(--destructive)]',
}

export default async function PortalPresensiPage() {
  const user = await requireRole('PARENT')
  const students = await db.student.findMany({
    where: { studentGuardians: { some: { guardian: { userId: user.id } } }, status: 'ACTIVE' },
    select: { id: true },
  })
  if (students.length === 0) {
    return <p className="text-sm text-[var(--muted-foreground)]">Belum ada data anak.</p>
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
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Presensi Anak</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Maksimal 60 catatan terbaru untuk semua anak.</p>
      </header>

      {[...byStudent.entries()].length === 0 ? (
        <p className="rounded-lg border border-dashed p-10 text-center text-sm text-[var(--muted-foreground)]">Belum ada data presensi.</p>
      ) : (
        [...byStudent.entries()].map(([studentId, rows]) => (
          <Card key={studentId}>
            <CardHeader><CardTitle className="text-base">{rows[0].student.fullName}</CardTitle></CardHeader>
            <CardContent>
              <ul className="divide-y text-sm">
                {rows.map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-2">
                    <span>{formatTanggalSingkat(r.attendanceDate)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${ATT_STYLE[r.status] ?? 'bg-[var(--muted)]'}`}>{ATT_LABEL[r.status] ?? r.status}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
