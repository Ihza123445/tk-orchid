import { requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { PresensiForm } from '@/components/attendance/presensi-form'

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
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Presensi</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Pilih kelas dan tanggal, tandai kehadiran, lalu simpan. Data yang sudah ada akan diperbarui.
        </p>
      </header>
      <PresensiForm
        classes={classes.map((c) => ({ id: c.id, label: `${c.name} (${c.code})` }))}
      />
    </div>
  )
}
