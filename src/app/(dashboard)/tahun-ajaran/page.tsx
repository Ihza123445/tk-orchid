import { requireAdminStaff } from '@/lib/auth/guard'
import { listAcademicYears, activateAcademicYearAction } from '@/actions/academic-years'
import { TahunAjaranForm } from '@/components/academic-years/year-form'
import { formatTanggalSingkat } from '@/lib/formatting/format'
import { CalendarDays } from 'lucide-react'
import { EmptyState, PageHeader, SectionHeader, StatusPill, YEAR_STATUS } from '@/components/dashboard/primitives'

export const metadata = { title: 'Tahun Ajaran' }

export default async function TahunAjaranPage() {
  await requireAdminStaff()
  const years = await listAcademicYears()

  return (
    <div className="space-y-6">
      <PageHeader icon={CalendarDays} eyebrow="Akademik" title="Tahun Ajaran" description="Hanya satu tahun ajaran yang dapat aktif pada satu waktu." />

      <TahunAjaranForm />

      <SectionHeader title="Daftar tahun ajaran" description={`${years.length} tahun ajaran`} />
      {years.length === 0 ? <EmptyState icon={CalendarDays} title="Belum ada tahun ajaran" description="Tambahkan tahun ajaran pertama melalui formulir di atas." /> : (
      <div className="table-card">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="text-left">
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Periode</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Kelas / Siswa</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {years.map((y) => (
              <tr key={y.id}>
                <td className="px-4 py-3 font-semibold">{y.name}</td>
                <td className="px-4 py-3">{formatTanggalSingkat(y.startDate)} – {formatTanggalSingkat(y.endDate)}</td>
                <td className="px-4 py-3">
                  <StatusPill map={YEAR_STATUS} status={y.status} />
                </td>
                <td className="px-4 py-3">{y._count.classes} kelas · {y._count.enrollments} siswa</td>
                <td className="px-4 py-3">
                  {y.status === 'PLANNED' && (
                    <form action={activateAcademicYearAction}>
                      <input type="hidden" name="id" value={y.id} />
                      <button type="submit" className="link-action">Aktifkan</button>
                    </form>
                  )}
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
