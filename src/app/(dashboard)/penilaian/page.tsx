import { requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { getAssessmentOptions } from '@/actions/assessments'
import { PenilaianForm, RekapTable } from '@/components/assessments/penilaian-form'

export const metadata = { title: 'Penilaian' }

export default async function PenilaianPage() {
  await requireAdminStaff()

  const ay = await db.academicYear.findFirst({ where: { status: 'ACTIVE' } })
  if (!ay) {
    return <p className="text-sm text-[var(--muted-foreground)]">Tidak ada tahun ajaran aktif.</p>
  }

  const [classes, enrollments, domains, scales, assessments] = await Promise.all([
    db.class.findMany({ where: { academicYearId: ay.id, status: 'ACTIVE' }, select: { id: true, name: true, code: true }, orderBy: { code: 'asc' } }),
    db.enrollment.findMany({
      where: { academicYearId: ay.id },
      select: { classId: true, student: { select: { id: true, fullName: true, studentCode: true } } },
    }),
    db.assessmentDomain.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    db.assessmentScale.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    db.assessment.findMany({
      where: { academicYearId: ay.id },
      include: { student: { select: { fullName: true } }, scale: { select: { label: true } }, domain: { select: { id: true, name: true } } },
      orderBy: { studentId: 'asc' },
    }),
  ])

  const studentsByClass: Record<number, { id: number; label: string }[]> = {}
  for (const e of enrollments) {
    ;(studentsByClass[e.classId] ??= []).push({
      id: e.student.id,
      label: `${e.student.fullName} (${e.student.studentCode})`,
    })
  }

  // Rekap matriks siswa×domain per periode
  const periods = ['Semester 1', 'Semester 2']
  const rows = periods.flatMap((period) => {
    const byStudent = new Map<number, { name: string; cells: Record<number, string | null>; narrativeCount: number }>()
    for (const a of assessments.filter((x) => x.period === period)) {
      const entry = byStudent.get(a.studentId) ?? { name: a.student.fullName, cells: {}, narrativeCount: 0 }
      entry.cells[a.domainId] = a.scale.label
      if (a.narrative) entry.narrativeCount++
      byStudent.set(a.studentId, entry)
    }
    return Array.from(byStudent.entries())
      .sort((a, b) => a[1].name.localeCompare(b[1].name))
      .map(([sid, v]) => ({ key: `${sid}-${period}`, studentName: v.name, period, cells: v.cells, narrativeCount: v.narrativeCount }))
  })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Penilaian</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Capaian perkembangan per domain (STPPA) untuk tahun ajaran {ay.name}.</p>
      </header>

      <PenilaianForm
        classes={classes.map((c) => ({ id: c.id, label: `${c.name} (${c.code})` }))}
        studentsByClass={studentsByClass}
        domains={domains.map((d) => ({ id: d.id, label: d.name }))}
        scales={scales.map((s) => ({ id: s.id, label: s.label, description: s.description }))}
        periods={periods}
      />

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Rekap Periode</h2>
        <RekapTable rows={rows} domainLabels={Object.fromEntries(domains.map((d) => [d.id, d.name]))} />
      </section>
    </div>
  )
}
