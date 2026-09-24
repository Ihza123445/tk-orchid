import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatTanggalSingkat } from '@/lib/formatting/format'

const REL: Record<string, string> = { AYAH: 'Ayah', IBU: 'Ibu', WALI: 'Wali', LAINNYA: 'Lainnya' }

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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{guardian.fullName}</h1>
        <p className="text-sm text-[var(--muted-foreground)]">{REL[guardian.relationship] ?? guardian.relationship} · {guardian.phone}</p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Informasi</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><span className="text-[var(--muted-foreground)]">Email</span><p>{guardian.email ?? '-'}</p></div>
            <div><span className="text-[var(--muted-foreground)]">Pekerjaan</span><p>{guardian.occupation ?? '-'}</p></div>
            <div><span className="text-[var(--muted-foreground)]">Alamat</span><p>{guardian.address ?? '-'}</p></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Akun Portal</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {guardian.user ? (
              <>
                <div><span className="text-[var(--muted-foreground)]">Email Akun</span><p>{guardian.user.email}</p></div>
                <div><span className="text-[var(--muted-foreground)]">Status</span><p>{guardian.user.isActive ? 'Aktif' : 'Nonaktif'}</p></div>
                <div><span className="text-[var(--muted-foreground)]">Login Terakhir</span><p>{formatTanggalSingkat(guardian.user.lastLoginAt)}</p></div>
              </>
            ) : (
              <p className="text-[var(--muted-foreground)]">Belum memiliki akun portal.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Anak Terhubung ({guardian.studentGuardians.length})</CardTitle></CardHeader>
        <CardContent>
          {guardian.studentGuardians.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">Belum ada siswa terhubung.</p>
          ) : (
            <ul className="divide-y text-sm">
              {guardian.studentGuardians.map((sg) => (
                <li key={sg.student.id} className="flex items-center justify-between py-2">
                  <Link href={`/siswa/${sg.student.id}`} className="underline-offset-4 hover:underline">{sg.student.fullName}</Link>
                  <span className="flex items-center gap-2 text-xs">
                    {sg.isPrimary && <span className="rounded-full bg-[var(--secondary)] px-2 py-0.5 text-[var(--primary)]">utama</span>}
                    <span className="text-[var(--muted-foreground)]">{sg.student.studentCode}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
