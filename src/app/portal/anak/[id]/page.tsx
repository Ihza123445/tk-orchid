import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { assertStudentAccess } from '../../page'
import { formatRupiah, formatTanggalSingkat } from '@/lib/formatting/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const ATT_LABEL: Record<string, string> = { PRESENT: 'Hadir', SICK: 'Sakit', PERMISSION: 'Izin', ABSENT: 'Alpa' }

export default async function AnakDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole('PARENT')
  const { id } = await params
  const studentId = Number(id)
  if (!Number.isInteger(studentId)) notFound()

  if (!(await assertStudentAccess(user.id, studentId))) notFound()

  const student = await db.student.findUnique({
    where: { id: studentId },
    include: {
      enrollments: { include: { klass: true }, orderBy: { id: 'desc' }, take: 1 },
    },
  })
  if (!student) notFound()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [recentAttendance, monthlyStats, invoices, publishedReports] = await Promise.all([
    db.attendance.findMany({ where: { studentId }, orderBy: { attendanceDate: 'desc' }, take: 10 }),
    db.attendance.groupBy({
      by: ['status'],
      where: { studentId, attendanceDate: { gte: monthStart } },
      _count: true,
    }),
    db.invoice.findMany({
      where: { studentId },
      include: { items: true, allocations: { include: { payment: { select: { status: true } } } } },
      orderBy: { dueDate: 'asc' },
    }),
    db.developmentReport.findMany({
      where: { studentId, status: 'PUBLISHED' },
      include: { items: { include: { domain: true, scale: true } } },
      orderBy: { period: 'desc' },
    }),
  ])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{student.fullName}</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          NIS {student.studentCode} · Kelas {student.enrollments[0]?.klass.name ?? '-'} · Lahir {formatTanggalSingkat(student.birthDate)}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Presensi Bulan Ini</CardTitle></CardHeader>
          <CardContent>
            {monthlyStats.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">Belum ada data.</p>
            ) : (
              <ul className="flex flex-wrap gap-2 text-sm">
                {monthlyStats.map((m) => (
                  <li key={m.status} className="rounded-full bg-[var(--muted)] px-3 py-1">
                    {ATT_LABEL[m.status] ?? m.status}: <span className="font-semibold tabular-nums">{m._count}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 space-y-1 text-xs text-[var(--muted-foreground)]">
              {recentAttendance.slice(0, 5).map((a) => (
                <p key={a.id}>{formatTanggalSingkat(a.attendanceDate)} — {ATT_LABEL[a.status] ?? a.status}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Tagihan</CardTitle></CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">Tidak ada tagihan.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {invoices.slice(0, 6).map((inv) => {
                  const total = inv.items.reduce((s, i) => s + i.subtotal, 0)
                  const paid = inv.allocations.filter((al) => al.payment.status === 'POSTED').reduce((s, al) => s + al.amount, 0)
                  return (
                    <li key={inv.id} className="flex justify-between gap-2">
                      <span className="truncate font-mono text-xs">{inv.invoiceNo}</span>
                      <span className="tabular-nums">{formatRupiah(total - paid)}</span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${inv.status === 'PAID' ? 'bg-[var(--secondary)] text-[var(--primary)]' : 'bg-[var(--accent)]/15 text-[var(--accent)]'}`}>
                        {inv.status}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="mb-3 text-base font-semibold">Rapor Perkembangan (Terbit)</h2>
        {publishedReports.length === 0 ? (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-[var(--muted-foreground)]">Belum ada rapor yang diterbitkan.</p>
        ) : (
          <div className="space-y-4">
            {publishedReports.map((r) => (
              <Card key={r.id}>
                <CardHeader>
                  <CardTitle className="text-base">{r.period}</CardTitle>
                  <p className="text-xs text-[var(--muted-foreground)]">Terbit {r.publishedAt ? formatTanggalSingkat(r.publishedAt) : '-'}</p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {r.items.map((item) => (
                      <li key={item.id} className="flex justify-between gap-2 rounded border px-3 py-1.5">
                        <span>{item.domain.name}</span>
                        <span className="font-medium">{item.scale.code}</span>
                      </li>
                    ))}
                  </ul>
                  {r.summary && <p><span className="font-medium">Ringkasan:</span> {r.summary}</p>}
                  {r.homeRecommendation && <p><span className="font-medium">Rekomendasi di rumah:</span> {r.homeRecommendation}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
