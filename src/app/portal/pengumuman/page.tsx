import { Megaphone } from 'lucide-react'
import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { formatTanggal } from '@/lib/formatting/format'
import { EmptyState, PageHeader, Pill } from '@/components/dashboard/primitives'

export const metadata = { title: 'Pengumuman' }

export default async function PortalPengumumanPage() {
  const user = await requireRole('PARENT')
  const now = new Date()

  // Pengumuman untuk semua orang tua + yang ditujukan ke kelas anaknya
  const myStudents = await db.student.findMany({
    where: { studentGuardians: { some: { guardian: { userId: user.id } } }, status: 'ACTIVE' },
    select: { enrollments: { select: { classId: true }, orderBy: { id: 'desc' }, take: 1 } },
  })
  const myClassIds = myStudents.flatMap((s) => s.enrollments.map((e) => e.classId))

  const announcements = await db.announcement.findMany({
    where: {
      status: 'PUBLISHED',
      AND: [
        { OR: [{ publishAt: null }, { publishAt: { lte: now } }] },
        { OR: [{ expireAt: null }, { expireAt: { gt: now } }] },
      ],
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
      <PageHeader icon={Megaphone} title="Pengumuman" description="Kabar dan informasi terbaru dari TK Orchid." />

      {announcements.length === 0 ? (
        <EmptyState icon={Megaphone} title="Belum ada pengumuman" description="Pengumuman dari sekolah akan tampil di sini." />
      ) : (
        <ol className="relative space-y-4 before:absolute before:bottom-4 before:left-[19px] before:top-4 before:hidden before:w-px before:bg-[var(--border)] sm:before:block">
          {announcements.map((a, index) => (
            <li key={a.id} className="relative sm:pl-14">
              <span className={`absolute left-0 top-5 hidden size-10 items-center justify-center rounded-full ring-4 ring-[var(--background)] sm:flex ${index === 0 ? 'text-white' : 'bg-[var(--card)] text-[var(--primary)] shadow-[var(--shadow-card)]'}`} style={index === 0 ? { background: 'var(--brand-gradient)' } : undefined}>
                <Megaphone className="size-4" />
              </span>
              <article className="app-card p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <time className="text-xs font-medium text-[var(--muted-foreground)]">{formatTanggal(a.publishAt ?? a.createdAt)}</time>
                  {index === 0 && <Pill tone="brand" dot>Terbaru</Pill>}
                  {a.audience === 'CLASS_SPECIFIC' && a.klass && <Pill tone="info">Kelas {a.klass.name}</Pill>}
                </div>
                <h2 className="mt-1.5 font-heading text-lg font-bold leading-snug">{a.title}</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--foreground)]/85">{a.content}</p>
              </article>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
