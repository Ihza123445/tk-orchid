import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { formatTanggalSingkat } from '@/lib/formatting/format'

export default async function PortalPengumumanPage() {
  const user = await requireRole('PARENT')

  // Pengumuman untuk semua orang tua + yang ditujukan ke kelas anaknya
  const myStudents = await db.student.findMany({
    where: { studentGuardians: { some: { guardian: { userId: user.id } } }, status: 'ACTIVE' },
    select: { enrollments: { select: { classId: true }, orderBy: { id: 'desc' }, take: 1 } },
  })
  const myClassIds = myStudents.flatMap((s) => s.enrollments.map((e) => e.classId))

  const announcements = await db.announcement.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [
        { audience: { in: ['ALL_PARENTS', 'PUBLIC'] } },
        ...(myClassIds.length > 0 ? [{ audience: 'CLASS_SPECIFIC', classId: { in: myClassIds } }] : []),
      ],
    },
    include: { klass: { select: { name: true } } },
    orderBy: [{ publishAt: 'desc' }],
    take: 50,
  })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Pengumuman</h1>
      </header>

      {announcements.length === 0 ? (
        <p className="rounded-lg border border-dashed p-10 text-center text-sm text-[var(--muted-foreground)]">Belum ada pengumuman.</p>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <article key={a.id} className="rounded-lg border bg-[var(--card)] p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-semibold">{a.title}</h2>
                <time className="text-xs text-[var(--muted-foreground)]">
                  {formatTanggalSingkat(a.publishAt ?? a.createdAt)}
                  {a.audience === 'CLASS_SPECIFIC' && a.klass ? ` · ${a.klass.name}` : ''}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm">{a.content}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
