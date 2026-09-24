import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = { title: 'Profil — Guru' }

function formatTanggal(d: Date): string {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
}

export default async function GuruProfilPage() {
  const user = await requireRole('TEACHER')
  const teacher = await db.teacher.findUnique({ where: { userId: user.id }, include: { user: true } })
  if (!teacher) return <p className="text-sm text-[var(--muted-foreground)]">Profil guru tidak ditemukan.</p>

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Profil Guru</h1>
      </header>
      <Card className="max-w-xl">
        <CardHeader><CardTitle className="text-base">{teacher.fullName}</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[140px_1fr] gap-y-2 text-sm">
            <dt className="text-[var(--muted-foreground)]">Email</dt><dd>{teacher.user.email}</dd>
            <dt className="text-[var(--muted-foreground)]">Kode Pegawai</dt><dd>{teacher.employeeCode ?? '-'}</dd>
            <dt className="text-[var(--muted-foreground)]">Telepon</dt><dd>{teacher.phone ?? '-'}</dd>
            <dt className="text-[var(--muted-foreground)]">Pendidikan</dt><dd>{teacher.education ?? '-'}</dd>
            <dt className="text-[var(--muted-foreground)]">Bergabung</dt><dd>{teacher.joinDate ? formatTanggal(teacher.joinDate) : '-'}</dd>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
