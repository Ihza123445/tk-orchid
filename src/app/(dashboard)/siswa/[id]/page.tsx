import { notFound } from 'next/navigation'
import { requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { CalendarCheck2, GraduationCap, PencilLine, ReceiptText, School, UserRound, UsersRound } from 'lucide-react'
import { ATTENDANCE_STATUS, Avatar, Empty, HeaderButton, InfoGrid, Panel, Pill, Progress, RowList, Row, STUDENT_STATUS, StatusPill } from '@/components/dashboard/primitives'
import { formatTanggal, formatTanggalSingkat, formatRupiah } from '@/lib/formatting/format'

export const metadata = { title: 'Detail Siswa' }

const REL: Record<string, string> = { AYAH: 'Ayah', IBU: 'Ibu', WALI: 'Wali', LAINNYA: 'Lainnya' }

export default async function DetailSiswaPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminStaff()
  const { id } = await params
  const studentId = Number(id)
  if (!Number.isInteger(studentId)) notFound()

  const student = await db.student.findUnique({
    where: { id: studentId },
    include: {
      studentGuardians: { include: { guardian: true }, orderBy: { isPrimary: 'desc' } },
      enrollments: { include: { klass: true, academicYear: true }, orderBy: { id: 'desc' } },
      attendances: { orderBy: { attendanceDate: 'desc' }, take: 10 },
      invoices: {
        include: { items: true, allocations: { include: { payment: { select: { status: true } } } } },
        orderBy: { id: 'desc' },
      },
      documents: { orderBy: { id: 'desc' } },
    },
  })
  if (!student) notFound()

  const totalHadir = student.attendances.filter((a) => a.status === 'PRESENT').length
  let outstanding = 0
  for (const inv of student.invoices) {
    if (inv.status === 'VOID') continue
    const total = inv.items.reduce((a, b) => a + b.subtotal, 0)
    const paid = inv.allocations.filter((al) => al.payment.status === 'POSTED').reduce((a, b) => a + b.amount, 0)
    outstanding += Math.max(0, total - paid)
  }

  const attendanceRatio = student.attendances.length ? Math.round((totalHadir / student.attendances.length) * 100) : null
  const currentClass = student.enrollments[0]

  return (
    <div className="space-y-6">
      <section className="app-card overflow-hidden">
        <div className="h-20 sm:h-24" style={{ background: 'var(--brand-gradient)' }} />
        <div className="flex flex-wrap items-start justify-between gap-4 px-5 pb-5 sm:px-6">
          <div className="flex min-w-0 items-start gap-4">
            <span className="-mt-10 shrink-0 rounded-full bg-[var(--card)] p-1 shadow-md"><Avatar name={student.fullName} size="xl" /></span>
            <div className="min-w-0 pt-3">
              <h1 className="truncate font-heading text-2xl font-bold tracking-tight">{student.fullName}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <span className="font-mono text-xs">{student.studentCode}</span>
                <span aria-hidden="true">·</span>
                <span>{student.nis ? `NIS ${student.nis}` : 'Tanpa NIS'}</span>
                <StatusPill map={STUDENT_STATUS} status={student.status} />
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-3">
            <HeaderButton href="/siswa">Kembali</HeaderButton>
            <HeaderButton href={`/siswa/${student.id}/edit`} primary><PencilLine /> Ubah data</HeaderButton>
          </div>
        </div>
        <div className="grid grid-cols-1 border-t border-[var(--border)] sm:grid-cols-3 sm:divide-x sm:divide-[var(--border)]">
          <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
            <School className="size-5 text-[var(--primary)]" aria-hidden="true" />
            <div><p className="text-xs text-[var(--muted-foreground)]">Kelas saat ini</p><p className="text-sm font-semibold">{currentClass ? `${currentClass.klass.name} · ${currentClass.academicYear.name}` : 'Belum ditempatkan'}</p></div>
          </div>
          <div className="flex items-center gap-3 border-t border-[var(--border)] px-5 py-4 sm:border-t-0 sm:px-6">
            <CalendarCheck2 className="size-5 text-emerald-600" aria-hidden="true" />
            <div><p className="text-xs text-[var(--muted-foreground)]">Kehadiran (10 catatan terakhir)</p><p className="text-sm font-semibold">{attendanceRatio === null ? 'Belum ada data' : `${attendanceRatio}% hadir`}</p></div>
          </div>
          <div className="flex items-center gap-3 border-t border-[var(--border)] px-5 py-4 sm:border-t-0 sm:px-6">
            <ReceiptText className={`size-5 ${outstanding > 0 ? 'text-amber-600' : 'text-emerald-600'}`} aria-hidden="true" />
            <div><p className="text-xs text-[var(--muted-foreground)]">Tagihan belum dibayar</p><p className="text-sm font-semibold tabular-nums">{outstanding > 0 ? formatRupiah(outstanding) : 'Lunas'}</p></div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Biodata" icon={UserRound}>
            <InfoGrid
              items={[
                { label: 'Nama panggilan', value: student.nickname },
                { label: 'Jenis kelamin', value: student.gender === 'L' ? 'Laki-laki' : 'Perempuan' },
                { label: 'Tempat, tanggal lahir', value: `${student.birthPlace ?? '-'}, ${formatTanggal(student.birthDate)}` },
                { label: 'Agama', value: student.religion },
                { label: 'Alamat', value: [student.address, student.city, student.province].filter(Boolean).join(', '), wide: true },
                { label: 'Tanggal masuk', value: formatTanggal(student.admissionDate) },
                { label: 'Catatan', value: student.notes },
              ]}
            />
          </Panel>

          <Panel title="Presensi terakhir" icon={CalendarCheck2} description={student.attendances.length ? `${totalHadir} hadir dari ${student.attendances.length} catatan terakhir` : undefined} flush>
            {student.attendances.length === 0 ? (
              <Empty icon={CalendarCheck2}>Belum ada data presensi.</Empty>
            ) : (
              <>
                {attendanceRatio !== null && <div className="px-5 pt-4"><Progress value={attendanceRatio} tone={attendanceRatio < 80 ? 'warning' : 'success'} label="Persentase kehadiran" /></div>}
                <ul className="grid grid-cols-1 gap-x-6 px-5 py-2 sm:grid-cols-2">
                  {student.attendances.map((a) => (
                    <li key={a.id} className="flex items-center justify-between border-b border-[var(--border)] py-2.5 text-sm last:border-0 sm:[&:nth-last-child(2)]:border-0">
                      <span>{formatTanggal(a.attendanceDate)}</span>
                      <StatusPill map={ATTENDANCE_STATUS} status={a.status} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Wali" icon={UsersRound} flush>
            {student.studentGuardians.length === 0 ? (
              <Empty icon={UsersRound}>Belum ada wali terhubung.</Empty>
            ) : (
              <RowList>
                {student.studentGuardians.map((sg) => (
                  <Row
                    key={sg.guardian.id}
                    href={`/wali/${sg.guardian.id}`}
                    leading={<Avatar name={sg.guardian.fullName} />}
                    primary={sg.guardian.fullName}
                    secondary={`${REL[sg.guardian.relationship] ?? sg.guardian.relationship} · ${sg.guardian.phone}`}
                    trailing={sg.isPrimary ? <Pill tone="brand">Utama</Pill> : undefined}
                  />
                ))}
              </RowList>
            )}
          </Panel>

          <Panel title="Riwayat kelas" icon={GraduationCap} flush>
            {student.enrollments.length === 0 ? (
              <Empty icon={School}>Belum ditempatkan di kelas.</Empty>
            ) : (
              <RowList>
                {student.enrollments.map((e) => (
                  <Row key={e.id} href={`/kelas/${e.klass.id}`} primary={e.klass.name} secondary={`Tahun ajaran ${e.academicYear.name} · masuk ${formatTanggalSingkat(e.enrollmentDate)}`} />
                ))}
              </RowList>
            )}
          </Panel>

          <Panel title="Tagihan" icon={ReceiptText} action={{ href: '/keuangan/tagihan', label: 'Lihat tagihan' }}>
            <p className={`font-heading text-3xl font-bold tabular-nums ${outstanding > 0 ? '' : 'text-emerald-600 dark:text-emerald-300'}`}>{formatRupiah(outstanding)}</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">Total belum dibayar dari {student.invoices.filter((inv) => inv.status !== 'VOID').length} tagihan</p>
          </Panel>
        </div>
      </div>
    </div>
  )
}
