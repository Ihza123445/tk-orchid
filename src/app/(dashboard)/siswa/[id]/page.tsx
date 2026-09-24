import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatTanggal, formatRupiah } from '@/lib/formatting/format'

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--secondary)] text-xl font-semibold text-[var(--primary)]">
            {student.fullName.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{student.fullName}</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              {student.studentCode} · {student.nis ?? 'tanpa NIS'} ·{' '}
              <span className="rounded-full bg-[var(--secondary)] px-2 py-0.5 text-xs text-[var(--primary)]">
                {student.status}
              </span>
            </p>
          </div>
        </div>
        <Link
          href={`/siswa/${student.id}/edit`}
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          Edit Data
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Biodata</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              <div><span className="text-[var(--muted-foreground)]">Nama Panggilan</span><p>{student.nickname ?? '-'}</p></div>
              <div><span className="text-[var(--muted-foreground)]">Jenis Kelamin</span><p>{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p></div>
              <div><span className="text-[var(--muted-foreground)]">Tempat/Tanggal Lahir</span><p>{student.birthPlace ?? '-'}, {formatTanggal(student.birthDate)}</p></div>
              <div><span className="text-[var(--muted-foreground)]">Agama</span><p>{student.religion ?? '-'}</p></div>
              <div className="sm:col-span-2"><span className="text-[var(--muted-foreground)]">Alamat</span><p>{[student.address, student.city, student.province].filter(Boolean).join(', ') || '-'}</p></div>
              <div><span className="text-[var(--muted-foreground)]">Tanggal Masuk</span><p>{formatTanggal(student.admissionDate)}</p></div>
              <div><span className="text-[var(--muted-foreground)]">Catatan</span><p>{student.notes ?? '-'}</p></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Presensi Terakhir</CardTitle></CardHeader>
            <CardContent>
              {student.attendances.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">Belum ada data presensi.</p>
              ) : (
                <ul className="divide-y text-sm">
                  {student.attendances.map((a) => (
                    <li key={a.id} className="flex justify-between py-2">
                      <span>{formatTanggal(a.attendanceDate)}</span>
                      <span className="rounded-full bg-[var(--secondary)] px-2 py-0.5 text-xs">{a.status}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">{totalHadir} hadir dari {student.attendances.length} catatan terakhir.</p>
            </CardContent>
          </Card>
        </div>

        {/* Side summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Wali</CardTitle></CardHeader>
            <CardContent>
              {student.studentGuardians.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">Belum ada wali terhubung.</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {student.studentGuardians.map((sg) => (
                    <li key={sg.guardian.id}>
                      <p className="font-medium">{sg.guardian.fullName}{sg.isPrimary && <span className="ml-1 text-xs text-[var(--primary)]">(utama)</span>}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{sg.guardian.relationship} · {sg.guardian.phone}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Kelas</CardTitle></CardHeader>
            <CardContent>
              {student.enrollments.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">Belum ditempatkan di kelas.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {student.enrollments.map((e) => (
                    <li key={e.id}>
                      {e.klass.name} <span className="text-xs text-[var(--muted-foreground)]">({e.academicYear.name})</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Tagihan</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{formatRupiah(outstanding)}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Total belum dibayar</p>
              <Link href={`/keuangan/tagihan?studentId=${student.id}`} className="mt-3 inline-block text-sm underline underline-offset-4">
                Lihat tagihan
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
