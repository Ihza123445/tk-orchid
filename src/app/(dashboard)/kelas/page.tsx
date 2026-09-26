import Link from 'next/link'
import { requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { listClasses } from '@/actions/classes'
import { KelasForm } from '@/components/classes/class-form'
import { School } from 'lucide-react'
import { EmptyState, PageHeader, Progress, SectionHeader } from '@/components/dashboard/primitives'

export const metadata = { title: 'Kelas' }

export default async function KelasPage() {
  await requireAdminStaff()

  const [classes, years, teachers] = await Promise.all([
    listClasses({}),
    db.academicYear.findMany({ select: { id: true, name: true, status: true }, orderBy: { name: 'desc' } }),
    db.teacher.findMany({ where: { isActive: true }, select: { id: true, fullName: true }, orderBy: { fullName: 'asc' } }),
  ])

  return (
    <div className="space-y-6">
      <PageHeader icon={School} eyebrow="Akademik" title="Kelas" description="Kelola kelas, wali kelas, dan kapasitas per tahun ajaran." />

      <KelasForm
        years={years.map((y) => ({ id: y.id, label: `${y.name}${y.status === 'ACTIVE' ? ' (aktif)' : ''}` }))}
        teachers={teachers.map((t) => ({ id: t.id, label: t.fullName }))}
      />

      <SectionHeader title="Daftar kelas" description={`${classes.length} kelas`} />
      {classes.length === 0 ? (
        <EmptyState icon={School} title="Belum ada kelas" description="Tambahkan kelas pertama melalui formulir di atas." />
      ) : (
        <div className="table-card">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Tahun Ajaran</th>
                <th className="px-4 py-3">Wali Kelas</th>
                <th className="px-4 py-3">Ruang</th>
                <th className="px-4 py-3">Siswa</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <Link href={`/kelas/${c.id}`} className="font-medium hover:text-[var(--primary)]">{c.name}</Link>
                    <span className="block text-xs text-[var(--muted-foreground)]">{c.code} · {c.level}</span>
                  </td>
                  <td className="px-4 py-3">{c.academicYear.name}</td>
                  <td className="px-4 py-3">{c.teacher?.fullName ?? '-'}</td>
                  <td className="px-4 py-3">{c.room ?? '-'}</td>
                  <td className="px-4 py-3">
                    <div className="w-32">
                      <p className="mb-1 text-xs tabular-nums"><span className="font-semibold">{c._count.enrollments}</span><span className="text-[var(--muted-foreground)]"> / {c.capacity} siswa</span></p>
                      <Progress value={(c._count.enrollments / Math.max(c.capacity, 1)) * 100} tone={c._count.enrollments >= c.capacity ? 'warning' : 'brand'} label={`Kapasitas ${c.name}`} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/kelas/${c.id}`} className="link-action">Detail</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
