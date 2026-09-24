import { requireRole } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { PenilaianForm, RekapTable } from '@/components/assessments/penilaian-form'

export const metadata = { title: 'Penilaian — Guru' }

export default async function GuruPenilaianPage() {
  const user = await requireRole('TEACHER')
  const teacher = await db.teacher.findUnique({ where: { userId: user.id } })

  const ay = await db.academicYear.findFirst({ where: { status: 'ACTIVE' } })
  if (!teacher || !ay) {
    return <p className="text-sm text-[var(--muted-foreground)]">Tidak ada data penilaian.</p>
  }

  // Hanya kelas homeroom guru (server-side scoping, PRD §7.3)
  const classes = await db.class.findMany({ where: { teacherId: teacher.id, academicYearId: ay.id }, select: { id: true, name: true, code: true } })
  const classIds = classes.map((c) => c.id)
  const [enrollments, domains, scales, assessments] = await Promise.all([
    db.enrollment.findMany({
      where: { academicYearId: ay.id, classId: { in: classIds.length ? classIds : [-1] } },
      select: { classId: true, student: { select: { id: true, fullName: true, studentCode: true } } },
    }),
    db.assessmentDomain.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    db.assessmentScale.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    db.assessment.findMany({
      where: { academicYearId: ay.id, classId: { in: classIds.length ? classIds : [-1] } },
      include: { student: { select: { fullName: true } }, scale: { select: { label: true } }, domain: { select: { id: true, name: true } } },
    }),
  ])

  const studentsByClass: Record<number, { id: number; label: string }[]> = {}
  for (const e of enrollments) {
    ;(studentsByClass[e.classId] ??= []).push({
      id: e.student.id,
      label: `${e.student.fullName} (${e.student.studentCode})`,
    })
  }

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
        <h1 className="text-2xl font-semibold tracking-tight">Penilaian Kelas</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Input capaian per domain untuk kelas Anda.</p>
      </header>

      <PenilaianForm
        classes={classes.map((c) => ({ id: c.id, label: `${c.name} (${c.code})` }))}
        studentsByClass={studentsByClass}
        domains={domains.map((d) => ({ id: d.id, label: d.name }))}
        scales={scales.map((s) => ({ id: s.id, label: s.label, description: s.description }))}
        periods={periods}
      />

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Rekap Kelas</h2>
        <RekapTable rows={rows} domainLabels={Object.fromEntries(domains.map((d) => [d.id, d.name]))} />
      </section>
    </div>
  )
}
