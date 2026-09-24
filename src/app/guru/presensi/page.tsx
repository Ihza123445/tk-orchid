import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { PresensiForm } from '@/components/attendance/presensi-form'

export const metadata = { title: 'Presensi — Guru' }

export default async function GuruPresensiPage() {
  const user = await requireRole('TEACHER')
  const teacher = await db.teacher.findUnique({ where: { userId: user.id } })

  // Guru hanya melihat kelas homeroom-nya (validasi server juga di action)
  const ay = await db.academicYear.findFirst({ where: { status: 'ACTIVE' } })
  const classes = teacher
    ? await db.class.findMany({
        where: { teacherId: teacher.id, status: 'ACTIVE', ...(ay ? { academicYearId: ay.id } : {}) },
        select: { id: true, name: true, code: true },
        orderBy: { code: 'asc' },
      })
    : []

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Presensi Kelas</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Isi presensi untuk kelas yang Anda ampu.</p>
      </header>
      <PresensiForm classes={classes.map((c) => ({ id: c.id, label: `${c.name} (${c.code})` }))} />
    </div>
  )
}
