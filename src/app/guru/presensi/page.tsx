import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { ClipboardCheck } from 'lucide-react'
import { PresensiForm } from '@/components/attendance/presensi-form'
import { PageHeader } from '@/components/dashboard/primitives'

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
      <PageHeader icon={ClipboardCheck} eyebrow="Kelas saya" title="Presensi Kelas" description="Tandai kehadiran siswa di kelas yang Anda ampu, lalu simpan." />
      <PresensiForm classes={classes.map((c) => ({ id: c.id, label: `${c.name} (${c.code})` }))} />
    </div>
  )
}
