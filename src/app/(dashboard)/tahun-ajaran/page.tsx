import { requireAdminStaff } from '@/lib/auth/guard'
import { listAcademicYears, activateAcademicYearAction } from '@/actions/academic-years'
import { TahunAjaranForm } from '@/components/academic-years/year-form'
import { formatTanggalSingkat } from '@/lib/formatting/format'

const STATUS_LABEL: Record<string, string> = { PLANNED: 'Perencanaan', ACTIVE: 'Aktif', CLOSED: 'Selesai' }

export default async function TahunAjaranPage() {
  await requireAdminStaff()
  const years = await listAcademicYears()

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Tahun Ajaran</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Hanya satu tahun ajaran yang dapat aktif pada satu waktu.</p>
      </header>

      <TahunAjaranForm />

      <div className="overflow-x-auto rounded-lg border bg-[var(--card)]">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b bg-[var(--muted)] text-left">
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Periode</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Kelas / Siswa</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {years.map((y) => (
              <tr key={y.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{y.name}</td>
                <td className="px-4 py-3">{formatTanggalSingkat(y.startDate)} – {formatTanggalSingkat(y.endDate)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${y.status === 'ACTIVE' ? 'bg-[var(--secondary)] text-[var(--primary)]' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}>
                    {STATUS_LABEL[y.status] ?? y.status}
                  </span>
                </td>
                <td className="px-4 py-3">{y._count.classes} kelas · {y._count.enrollments} siswa</td>
                <td className="px-4 py-3">
                  {y.status === 'PLANNED' && (
                    <form action={activateAcademicYearAction}>
                      <input type="hidden" name="id" value={y.id} />
                      <button type="submit" className="text-sm underline underline-offset-4 hover:opacity-80">Aktifkan</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
