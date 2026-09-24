import { BriefcaseBusiness, CalendarDays, GraduationCap, Mail, Phone, School, UserRound } from 'lucide-react'
import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { formatTanggal } from '@/lib/formatting/format'
import { Avatar, EmptyState, IconTile, Panel, Row, RowList } from '@/components/dashboard/primitives'

export const metadata = { title: 'Profil — Guru' }

export default async function GuruProfilPage() {
  const user = await requireRole('TEACHER')
  const teacher = await db.teacher.findUnique({ where: { userId: user.id }, include: { user: true } })
  if (!teacher) return <EmptyState icon={UserRound} title="Profil guru tidak ditemukan" description="Hubungi administrator untuk menghubungkan akun Anda." />

  const classes = await db.class.findMany({
    where: { teacherId: teacher.id },
    include: { academicYear: { select: { name: true } }, _count: { select: { enrollments: true } } },
    orderBy: { id: 'desc' },
  })

  const details = [
    { icon: Mail, label: 'Email', value: teacher.user.email },
    { icon: BriefcaseBusiness, label: 'Kode pegawai', value: teacher.employeeCode ?? '-' },
    { icon: Phone, label: 'Telepon', value: teacher.phone ?? '-' },
    { icon: GraduationCap, label: 'Pendidikan', value: teacher.education ?? '-' },
    { icon: CalendarDays, label: 'Bergabung', value: teacher.joinDate ? formatTanggal(teacher.joinDate) : '-' },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="app-card overflow-hidden">
        <div className="h-24" style={{ background: 'var(--brand-gradient)' }} />
        <div className="flex flex-wrap items-start gap-4 px-6 pb-6">
          <span className="-mt-10 shrink-0 rounded-full bg-[var(--card)] p-1 shadow-md"><Avatar name={teacher.fullName} size="xl" /></span>
          <div className="min-w-0 pt-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--primary)]">Guru TK Orchid</p>
            <h1 className="truncate font-heading text-2xl font-bold tracking-tight">{teacher.fullName}</h1>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        <Panel className="md:col-span-3" title="Informasi pribadi" icon={UserRound}>
          <ul className="space-y-4">
            {details.map((item) => (
              <li key={item.label} className="flex items-center gap-3">
                <IconTile icon={item.icon} size="sm" tone="neutral" />
                <div className="min-w-0">
                  <p className="text-xs text-[var(--muted-foreground)]">{item.label}</p>
                  <p className="truncate text-sm font-medium">{item.value}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="md:col-span-2" title="Kelas yang diampu" icon={School} flush>
          {classes.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-[var(--muted-foreground)]">Belum ada kelas.</p>
          ) : (
            <RowList>
              {classes.map((c) => (
                <Row key={c.id} leading={<IconTile icon={School} size="sm" />} primary={c.name} secondary={`${c.academicYear.name} · ${c._count.enrollments} siswa`} />
              ))}
            </RowList>
          )}
        </Panel>
      </div>
    </div>
  )
}
