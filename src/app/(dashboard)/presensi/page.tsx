import { requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { ClipboardCheck } from 'lucide-react'
import { PresensiForm } from '@/components/attendance/presensi-form'
import { PageHeader } from '@/components/dashboard/primitives'

export const metadata = { title: 'Presensi' }

export default async function PresensiPage() {
  await requireAdminStaff()

  const ay = await db.academicYear.findFirst({ where: { status: 'ACTIVE' } })
  const classes = await db.class.findMany({
    where: ay ? { academicYearId: ay.id, status: 'ACTIVE' } : {},
    select: { id: true, name: true, code: true },
    orderBy: { code: 'asc' },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardCheck}
        eyebrow={ay ? `Akademik · ${ay.name}` : 'Akademik'}
        title="Presensi"
        description="Pilih kelas dan tanggal, tandai kehadiran, lalu simpan. Data yang sudah ada akan diperbarui."
      />
      <PresensiForm
        classes={classes.map((c) => ({ id: c.id, label: `${c.name} (${c.code})` }))}
      />
    </div>
  )
}
