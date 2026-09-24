'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveDevelopmentReportAction, type ReportState } from '@/actions/reports'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Option { id: number; label: string }
interface StudentOpt { id: number; label: string }
interface ScaleOpt extends Option { description?: string | null }

const initial: ReportState = {}

interface ItemRow {
  domainId: number
  scaleId: number | null
  narrative: string
}

export function LaporanForm({
  classes,
  studentsByClass,
  domains,
  scales,
  periods,
}: {
  classes: Option[]
  studentsByClass: Record<number, StudentOpt[]>
  domains: Option[]
  scales: ScaleOpt[]
  periods: string[]
}) {
  const [state, formAction, pending] = useActionState(saveDevelopmentReportAction, initial)
  const router = useRouter()
  const [classId, setClassId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [period, setPeriod] = useState(periods[0] ?? 'Semester 1')
  // default semua scale pertama
  const [items, setItems] = useState<ItemRow[]>(() => domains.map((d) => ({ domainId: d.id, scaleId: scales[0]?.id ?? null, narrative: '' })))

  const students = classId ? studentsByClass[Number(classId)] ?? [] : []

  useEffect(() => {
    if (state.success) router.refresh()
  }, [state.success, router])

  const itemsPayload = useMemo(
    () =>
      JSON.stringify(
        items
          .filter((i) => i.scaleId != null)
          .map((i) => ({ domainId: i.domainId, scaleId: i.scaleId, narrative: i.narrative || undefined }))
      ),
    [items]
  )

  return (
    <form action={formAction} className="space-y-4 rounded-lg border bg-[var(--card)] p-6">
      <h2 className="text-base font-semibold">Buat / Perbarui Laporan</h2>
      <p className="text-xs text-[var(--muted-foreground)]">Laporan tersimpan sebagai DRAFT. Submit untuk review, lalu admin mempublikasi ke orang tua.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="lk-kelas">Kelas *</Label>
          <select id="lk-kelas" required value={classId} onChange={(e) => { setClassId(e.target.value); setStudentId('') }}
            className="h-9 w-full rounded-md border border-[var(--input)] bg-transparent px-3 text-sm">
            <option value="" disabled>Pilih kelas…</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lk-siswa">Siswa *</Label>
          <select id="lk-siswa" required value={studentId} onChange={(e) => setStudentId(e.target.value)} disabled={!classId}
            className="h-9 w-full rounded-md border border-[var(--input)] bg-transparent px-3 text-sm disabled:opacity-50">
            <option value="" disabled>{classId ? 'Pilih siswa…' : 'Pilih kelas dulu'}</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lk-periode">Periode *</Label>
          <select id="lk-periode" value={period} onChange={(e) => setPeriod(e.target.value)}
            className="h-9 w-full rounded-md border border-[var(--input)] bg-transparent px-3 text-sm">
            {periods.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="studentId" value={studentId} />
      <input type="hidden" name="period" value={period} />
      <input type="hidden" name="items" value={itemsPayload} />

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b bg-[var(--muted)] text-left">
              <th className="px-4 py-2 font-medium">Domain</th>
              <th className="px-4 py-2 font-medium">Capaian</th>
              <th className="px-4 py-2 font-medium">Narasi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.domainId} className="border-b last:border-0">
                <td className="px-4 py-2 font-medium">{domains.find((d) => d.id === item.domainId)?.label}</td>
                <td className="px-4 py-2">
                  <select
                    aria-label={`Capaian ${domains.find((d) => d.id === item.domainId)?.label ?? ''}`}
                    value={item.scaleId ?? ''}
                    onChange={(e) => {
                      const v = e.target.value ? Number(e.target.value) : null
                      setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, scaleId: v } : it)))
                    }}
                    className="h-9 rounded-md border border-[var(--input)] bg-transparent px-2 text-sm"
                  >
                    {scales.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}{s.description ? ` · ${s.description}` : ''}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <Input
                    aria-label={`Narasi ${domains.find((d) => d.id === item.domainId)?.label ?? ''}`}
                    value={item.narrative}
                    maxLength={1000}
                    onChange={(e) => {
                      const v = e.target.value
                      setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, narrative: v } : it)))
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ringkasan">Ringkasan Guru</Label>
          <textarea id="ringkasan" name="summary" rows={3} maxLength={2000}
            className="w-full rounded-md border border-[var(--input)] bg-transparent px-3 py-2 text-sm"
            placeholder="Ringkasan perkembangan anak selama periode…" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rekomendasi">Rekomendasi di Rumah</Label>
          <textarea id="rekomendasi" name="homeRecommendation" rows={3} maxLength={2000}
            className="w-full rounded-md border border-[var(--input)] bg-transparent px-3 py-2 text-sm"
            placeholder="Kegiatan pendampingan di rumah…" />
        </div>
      </div>

      {state.error && <p className="rounded-md border border-[var(--danger)] bg-[var(--destructive)]/10 p-3 text-sm text-[var(--danger)]">{state.error}</p>}
      {state.success && <p className="rounded-md bg-[var(--secondary)] p-3 text-sm text-[var(--primary)]">Laporan tersimpan sebagai DRAFT.</p>}

      <Button type="submit" disabled={pending || !studentId || !classId}>
        {pending ? 'Menyimpan…' : 'Simpan Laporan'}
      </Button>
    </form>
  )
}
