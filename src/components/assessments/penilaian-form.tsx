'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveAssessmentAction, type AssessmentState } from '@/actions/assessments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Option { id: number; label: string }
interface StudentOpt { id: number; label: string }

const initial: AssessmentState = {}

export function PenilaianForm({
  classes,
  studentsByClass,
  domains,
  scales,
  periods,
}: {
  classes: Option[]
  studentsByClass: Record<number, StudentOpt[]>
  domains: Option[]
  scales: (Option & { description?: string | null })[]
  periods: string[]
}) {
  const [state, formAction, pending] = useActionState(saveAssessmentAction, initial)
  const router = useRouter()
  const [classId, setClassId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [period, setPeriod] = useState(periods[0] ?? 'Semester 1')

  const students = useMemo(() => {
    if (!classId) return []
    return studentsByClass[Number(classId)] ?? []
  }, [classId, studentsByClass])

  useEffect(() => {
    if (state.success) router.refresh()
  }, [state.success, router])

  return (
    <form action={formAction} className="space-y-4 rounded-lg border bg-[var(--card)] p-6">
      <h2 className="text-base font-semibold">Input Penilaian Per Domain</h2>
      <p className="text-xs text-[var(--muted-foreground)]">Nilai yang sudah ada untuk kombinasi siswa+periode+domain akan diperbarui.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="kelas">Kelas *</Label>
          <select id="kelas" required value={classId} onChange={(e) => { setClassId(e.target.value); setStudentId('') }}
            className="h-9 w-full rounded-md border border-[var(--input)] bg-transparent px-3 text-sm">
            <option value="" disabled>Pilih kelas…</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="siswa">Siswa *</Label>
          <select id="siswa" name="studentId" required value={studentId} onChange={(e) => setStudentId(e.target.value)} disabled={!classId}
            className="h-9 w-full rounded-md border border-[var(--input)] bg-transparent px-3 text-sm disabled:opacity-50">
            <option value="" disabled>{classId ? 'Pilih siswa…' : 'Pilih kelas dulu'}</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="periode">Periode *</Label>
          <select id="periode" value={period} onChange={(e) => setPeriod(e.target.value)}
            className="h-9 w-full rounded-md border border-[var(--input)] bg-transparent px-3 text-sm">
            {periods.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <input type="hidden" name="classId" value={classId} />
        <input type="hidden" name="period" value={period} />
        <div className="space-y-2">
          <Label htmlFor="domain">Domain *</Label>
          <select id="domain" name="domainId" required defaultValue=""
            className="h-9 w-full rounded-md border border-[var(--input)] bg-transparent px-3 text-sm">
            <option value="" disabled>Pilih domain…</option>
            {domains.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2 lg:col-span-2">
          <Label>Capaian</Label>
          <div role="radiogroup" aria-label="Pilih capaian" className="flex flex-wrap gap-2 pt-1">
            {scales.map((s) => (
              <label key={s.id} className="flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs has-checked:border-[var(--primary)] has-checked:bg-[var(--secondary)]">
                <input type="radio" name="scaleId" value={s.id} required className="sr-only" />
                <span className="font-medium">{s.label}</span>
                {s.description && <span className="text-[var(--muted-foreground)]">· {s.description}</span>}
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-2 sm:col-span-2 lg:col-span-4">
          <Label htmlFor="narasi">Narasi</Label>
          <textarea id="narasi" name="narrative" rows={3} maxLength={1000} placeholder="Catatan capaian anak…"
            className="w-full rounded-md border border-[var(--input)] bg-transparent px-3 py-2 text-sm" />
        </div>
      </div>

      {state.error && <p className="rounded-md border border-[var(--danger)] bg-[var(--destructive)]/10 p-3 text-sm text-[var(--danger)]">{state.error}</p>}
      {state.success && <p className="rounded-md bg-[var(--secondary)] p-3 text-sm text-[var(--primary)]">Penilaian tersimpan.</p>}

      <Button type="submit" disabled={pending || !studentId || !classId}>
        {pending ? 'Menyimpan…' : 'Simpan Penilaian'}
      </Button>
    </form>
  )
}

export function RekapTable({ rows, domainLabels }: { rows: { studentName: string; period: string; cells: Record<number, string | null>; narrativeCount: number }[]; domainLabels: Record<number, string> }) {
  if (rows.length === 0) {
    return <p className="rounded-lg border border-dashed p-8 text-center text-sm text-[var(--muted-foreground)]">Belum ada penilaian.</p>
  }
  const domainIds = Object.keys(rows[0]?.cells ?? {}).map(Number).sort((a, b) => a - b)
  return (
    <div className="overflow-x-auto rounded-lg border bg-[var(--card)]">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b bg-[var(--muted)] text-left">
            <th className="px-4 py-3 font-medium">Siswa</th>
            <th className="px-4 py-3 font-medium">Periode</th>
            {domainIds.map((d) => (
              <th key={d} className="px-4 py-3 font-medium">{domainLabels[d] ?? `D${d}`}</th>
            ))}
            <th className="px-4 py-3 font-medium">Narasi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.studentName}-${r.period}`} className="border-b last:border-0">
              <td className="px-4 py-3 font-medium">{r.studentName}</td>
              <td className="px-4 py-3">{r.period}</td>
              {domainIds.map((d) => (
                <td key={d} className="px-4 py-3 tabular-nums">{r.cells[d] ?? '-'}</td>
              ))}
              <td className="px-4 py-3 tabular-nums">{r.narrativeCount > 0 ? `${r.narrativeCount}` : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
