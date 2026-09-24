import Link from 'next/link'
import { requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { listClasses } from '@/actions/classes'
import { KelasForm } from '@/components/classes/class-form'

export default async function KelasPage() {
  await requireAdminStaff()

  const [classes, years, teachers] = await Promise.all([
    listClasses({}),
    db.academicYear.findMany({ select: { id: true, name: true, status: true }, orderBy: { name: 'desc' } }),
    db.teacher.findMany({ where: { isActive: true }, select: { id: true, fullName: true }, orderBy: { fullName: 'asc' } }),
  ])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Kelas</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Kelola kelas per tahun ajaran.</p>
      </header>

      <KelasForm
        years={years.map((y) => ({ id: y.id, label: `${y.name}${y.status === 'ACTIVE' ? ' (aktif)' : ''}` }))}
        teachers={teachers.map((t) => ({ id: t.id, label: t.fullName }))}
      />

      {classes.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">Belum ada kelas. Tambahkan kelas pertama.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-[var(--card)]">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b bg-[var(--muted)] text-left">
                <th className="px-4 py-3 font-medium">Kelas</th>
                <th className="px-4 py-3 font-medium">Tahun Ajaran</th>
                <th className="px-4 py-3 font-medium">Wali Kelas</th>
                <th className="px-4 py-3 font-medium">Ruang</th>
                <th className="px-4 py-3 font-medium">Siswa</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-[var(--muted)]/50 transition-colors duration-150">
                  <td className="px-4 py-3">
                    <span className="font-medium">{c.name}</span>
                    <span className="block text-xs text-[var(--muted-foreground)]">{c.code} · {c.level}</span>
                  </td>
                  <td className="px-4 py-3">{c.academicYear.name}</td>
                  <td className="px-4 py-3">{c.teacher?.fullName ?? '-'}</td>
                  <td className="px-4 py-3">{c.room ?? '-'}</td>
                  <td className="px-4 py-3 tabular-nums">{c._count.enrollments}/{c.capacity}</td>
                  <td className="px-4 py-3">
                    <Link href={`/kelas/${c.id}`} className="underline underline-offset-4">Detail</Link>
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
