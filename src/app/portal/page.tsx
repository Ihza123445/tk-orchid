import Link from 'next/link'
import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRupiah, formatTanggalSingkat } from '@/lib/formatting/format'

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
    where: { status: 'PUBLISHED', audience: { in: ['ALL_PARENTS', 'PUBLIC'] } },
    orderBy: { publishAt: 'desc' },
    take: 5,
  })

  // Kegiatan visible
  const activities = await db.activity.findMany({
    where: { status: 'PUBLISHED', visibility: { in: ['PUBLIC', 'PARENT_ONLY'] } },
    orderBy: { startDatetime: 'desc' },
    take: 3,
  })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Portal Orang Tua</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Selamat datang, {user.name}.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Anak Terdaftar</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-semibold tabular-nums">{students.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Tagihan Belum Lunas</CardTitle></CardHeader>
          <CardContent>
            <p className={`text-2xl font-semibold tabular-nums ${totalOutstanding > 0 ? 'text-amber-600' : 'text-[var(--primary)]'}`}>
              {formatRupiah(totalOutstanding)}
            </p>
            <Link href="/portal/tagihan" className="mt-1 inline-block text-xs underline underline-offset-4">Lihat rincian</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Menu Cepat</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <Link href="/portal/presensi" className="block underline-offset-4 hover:underline">Presensi anak</Link>
            <Link href="/portal/perkembangan" className="block underline-offset-4 hover:underline">Rapor perkembangan</Link>
            <Link href="/portal/pengumuman" className="block underline-offset-4 hover:underline">Pengumuman</Link>
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="mb-3 text-base font-semibold">Anak Saya</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((s) => (
            <Card key={s.id}>
              <CardHeader><CardTitle className="text-base">{s.fullName}</CardTitle></CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>NIS {s.studentCode}</p>
                <p>Kelas {s.enrollments[0]?.klass?.name ?? '-'}</p>
                <Link href={`/portal/anak/${s.id}`} className="inline-block underline underline-offset-4">Detail →</Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Pengumuman Terbaru</CardTitle></CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">Belum ada pengumuman.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {announcements.map((a) => (
                  <li key={a.id} className="flex justify-between gap-2">
                    <span className="truncate">{a.title}</span>
                    <span className="shrink-0 text-xs text-[var(--muted-foreground)]">{formatTanggalSingkat(a.publishAt ?? a.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Kegiatan</CardTitle></CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">Belum ada kegiatan.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {activities.map((a) => (
                  <li key={a.id} className="flex justify-between gap-2">
                    <span className="truncate">{a.title}</span>
                    <span className="shrink-0 text-xs text-[var(--muted-foreground)]">
                      {a.startDatetime ? formatTanggalSingkat(a.startDatetime) : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
