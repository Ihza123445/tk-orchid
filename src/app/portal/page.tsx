import Link from 'next/link'
import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { CheckCircle2, ChevronRight, ReceiptText } from 'lucide-react'
import { formatRupiah, formatTanggal, formatTanggalSingkat } from '@/lib/formatting/format'
import { Empty, PageHeader, Panel, Row, RowList } from '@/components/dashboard/primitives'

/**
 * Scoping inti portal ortu: user GUARDIAN hanya boleh lihat anak yang
 * terhubung lewat Guardian.userId (server-side, PRD §7.3).
 */
export async function getMyStudents(userId: number) {
  return db.student.findMany({
    where: { studentGuardians: { some: { guardian: { userId } } }, status: 'ACTIVE' },
    select: {
      id: true,
      fullName: true,
      studentCode: true,
      enrollments: { select: { classId: true, academicYearId: true, klass: { select: { name: true } } }, take: 1, orderBy: { id: 'desc' } },
    },
    orderBy: { fullName: 'asc' },
  })
}

/** Verifikasi akses 1 anak. */
export async function assertStudentAccess(userId: number, studentId: number): Promise<boolean> {
  const link = await db.guardian.findFirst({
    where: { userId, studentGuardians: { some: { studentId, student: { status: 'ACTIVE' } } } },
  })
  return Boolean(link)
}

export default async function PortalOrtuPage() {
  const user = await requireRole('PARENT')
  const students = await getMyStudents(user.id)
  const now = new Date()

  if (students.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <p className="text-sm text-[var(--muted-foreground)]">Belum ada data anak yang terhubung ke akun Anda. Hubungi pihak sekolah.</p>
      </div>
    )
  }

  // Ringkasan keuangan semua anak
  const invoices = await db.invoice.findMany({
    where: { studentId: { in: students.map((s) => s.id) } },
    include: { items: true, allocations: { include: { payment: { select: { status: true } } } } },
  })
  let totalOutstanding = 0
  for (const inv of invoices) {
    if (inv.status === 'VOID' || inv.status === 'PAID') continue
    const total = inv.items.reduce((s, i) => s + i.subtotal, 0)
    const paid = inv.allocations.filter((al) => al.payment.status === 'POSTED').reduce((s, al) => s + al.amount, 0)
    totalOutstanding += Math.max(0, total - paid)
  }

  // Pengumuman untuk orang tua
  const announcements = await db.announcement.findMany({
    where: {
      status: 'PUBLISHED',
      audience: { in: ['ALL_PARENTS', 'PUBLIC'] },
      AND: [
        { OR: [{ publishAt: null }, { publishAt: { lte: now } }] },
        { OR: [{ expireAt: null }, { expireAt: { gt: now } }] },
      ],
    },
    orderBy: { publishAt: 'desc' },
    take: 5,
  })

  // Kegiatan visible
  const activities = await db.activity.findMany({
    where: { status: 'PUBLISHED', visibility: { in: ['PUBLIC', 'PARENT_ONLY'] } },
    orderBy: { startDatetime: 'desc' },
    take: 3,
  })

  const unpaidCount = invoices.filter((inv) => !['VOID', 'PAID'].includes(inv.status)).length

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={formatTanggal(now)} title={`Halo, ${user.name.split(' ')[0]}`} description="Kabar terbaru tentang si kecil di TK Orchid." />

      {totalOutstanding > 0 ? (
        <Link href="/portal/tagihan" className="group flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 transition-colors hover:bg-amber-500/15">
          <div className="flex items-center gap-3">
            <ReceiptText className="size-5 text-amber-700 dark:text-amber-300" />
            <div>
              <p className="text-sm font-semibold">Ada tagihan yang belum lunas</p>
              <p className="text-xs text-[var(--muted-foreground)]">Total {formatRupiah(totalOutstanding)} dari {unpaidCount} tagihan</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-medium">Lihat rincian <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
        </Link>
      ) : (
        <p className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]"><CheckCircle2 className="size-4 text-emerald-600" /> Semua tagihan sudah lunas. Terima kasih!</p>
      )}

      <Panel title="Anak saya" flush>
        <RowList>
          {students.map((student) => (
            <Row
              key={student.id}
              href={`/portal/anak/${student.id}`}
              primary={student.fullName}
              secondary={`Kelas ${student.enrollments[0]?.klass?.name ?? '-'} · NIS ${student.studentCode}`}
              trailing={<span className="text-xs text-[var(--muted-foreground)]">Lihat detail</span>}
            />
          ))}
        </RowList>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Pengumuman terbaru" action={{ href: '/portal/pengumuman', label: 'Semua' }} flush>
          {announcements.length === 0 ? <Empty>Belum ada pengumuman.</Empty> : (
            <RowList>
              {announcements.map((item) => (
                <Row key={item.id} href="/portal/pengumuman" primary={item.title} secondary={formatTanggalSingkat(item.publishAt ?? item.createdAt)} />
              ))}
            </RowList>
          )}
        </Panel>
        <Panel title="Kegiatan sekolah" flush>
          {activities.length === 0 ? <Empty>Belum ada kegiatan.</Empty> : (
            <RowList>
              {activities.map((item) => (
                <Row key={item.id} primary={item.title} secondary={[item.startDatetime && formatTanggalSingkat(item.startDatetime), item.location].filter(Boolean).join(' · ')} />
              ))}
            </RowList>
          )}
        </Panel>
      </div>
    </div>
  )
}
