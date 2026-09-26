import { notFound } from 'next/navigation'
import { requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { GraduationCap, KeyRound, Phone, UserRound } from 'lucide-react'
import { Avatar, Empty, HeaderButton, InfoGrid, Panel, Pill, Row, RowList, STUDENT_STATUS, StatusPill } from '@/components/dashboard/primitives'
import { formatTanggalSingkat } from '@/lib/formatting/format'
import { linkStudentGuardianAction } from '@/actions/guardians'
import { Button } from '@/components/ui/button'

const REL: Record<string, string> = { AYAH: 'Ayah', IBU: 'Ibu', WALI: 'Wali', LAINNYA: 'Lainnya' }

export const metadata = { title: 'Detail Wali' }

export default async function DetailWaliPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminStaff()
  const { id } = await params
  const guardianId = Number(id)
  if (!Number.isInteger(guardianId)) notFound()

  const guardian = await db.guardian.findUnique({
    where: { id: guardianId },
    include: {
      user: { select: { email: true, isActive: true, lastLoginAt: true } },
      studentGuardians: { include: { student: { select: { id: true, fullName: true, studentCode: true, status: true } } } },
    },
  })
  if (!guardian) notFound()

  const linkedIds = guardian.studentGuardians.map((sg) => sg.student.id)
  const linkable = await db.student.findMany({
    where: { status: { in: ['ACTIVE', 'CANDIDATE'] }, id: { notIn: linkedIds } },
    select: { id: true, fullName: true, studentCode: true },
    orderBy: { fullName: 'asc' },
  })

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="app-card flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar name={guardian.fullName} size="xl" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--primary)]">{REL[guardian.relationship] ?? guardian.relationship}</p>
            <h1 className="truncate font-heading text-2xl font-bold tracking-tight">{guardian.fullName}</h1>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]"><Phone className="size-3.5" /> {guardian.phone}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <HeaderButton href="/wali">Kembali</HeaderButton>
          <HeaderButton href={`https://wa.me/${guardian.phone.replace(/\D/g, '').replace(/^0/, '62')}`} external primary><Phone /> Hubungi via WhatsApp</HeaderButton>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Informasi" icon={UserRound}>
          <InfoGrid
            columns={1}
            items={[
              { label: 'Email', value: guardian.email },
              { label: 'Pekerjaan', value: guardian.occupation },
              { label: 'Alamat', value: guardian.address },
            ]}
          />
        </Panel>

        <Panel title="Akun portal orang tua" icon={KeyRound}>
          {guardian.user ? (
            <InfoGrid
              columns={1}
              items={[
                { label: 'Email akun', value: guardian.user.email },
                { label: 'Status', value: guardian.user.isActive ? <Pill tone="success" dot>Aktif</Pill> : <Pill dot>Nonaktif</Pill> },
                { label: 'Login terakhir', value: formatTanggalSingkat(guardian.user.lastLoginAt) },
              ]}
            />
          ) : (
            <Empty icon={KeyRound}>Belum memiliki akun portal.</Empty>
          )}
        </Panel>
      </div>

      <Panel title={`Anak terhubung (${guardian.studentGuardians.length})`} icon={GraduationCap} flush>
        {guardian.studentGuardians.length === 0 ? (
          <Empty icon={GraduationCap}>Belum ada siswa terhubung.</Empty>
        ) : (
          <RowList>
            {guardian.studentGuardians.map((sg) => (
              <Row
                key={sg.student.id}
                href={`/siswa/${sg.student.id}`}
                leading={<Avatar name={sg.student.fullName} />}
                primary={sg.student.fullName}
                secondary={sg.student.studentCode}
                trailing={
                  <span className="flex items-center gap-2">
                    {sg.isPrimary && <Pill tone="brand">Wali utama</Pill>}
                    <StatusPill map={STUDENT_STATUS} status={sg.student.status} />
                  </span>
                }
              />
            ))}
          </RowList>
        )}
        {linkable.length > 0 && (
          <form action={linkStudentGuardianAction} className="flex flex-wrap items-end gap-3 border-t border-[var(--border)] p-4">
            <input type="hidden" name="guardianId" value={guardian.id} />
            <label className="min-w-56 flex-1 space-y-1.5 text-sm font-medium">
              <span>Hubungkan anak</span>
              <select name="studentId" required defaultValue="" className="field-select w-full">
                <option value="" disabled>Pilih siswa…</option>
                {linkable.map((s) => (
                  <option key={s.id} value={s.id}>{s.fullName} ({s.studentCode})</option>
                ))}
              </select>
            </label>
            <label className="flex h-9 items-center gap-2 text-sm">
              <input type="checkbox" name="isPrimary" className="h-4 w-4" /> Jadikan wali utama
            </label>
            <Button type="submit">Hubungkan</Button>
          </form>
        )}
      </Panel>
    </div>
  )
}
