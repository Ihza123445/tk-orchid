'use client'

import { useEffect, useState } from 'react'
import { useActionState } from 'react'
import { saveAttendanceAction, loadRosterAction, type BulkResult } from '@/actions/attendance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Option { id: number; label: string }

interface Row {
  studentId: number
  fullName: string
  studentCode: string
  gender: string
  status: 'PRESENT' | 'SICK' | 'PERMISSION' | 'ABSENT' | null
  note: string | null
}

const STATUSES = [
  ['PRESENT', 'Hadir'],
  ['SICK', 'Sakit'],
  ['PERMISSION', 'Izin'],
  ['ABSENT', 'Alpa'],
] as const

const initial: BulkResult = {}

function todayISO(): string {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}

export function PresensiForm({ classes }: { classes: Option[] }) {
  const [classId, setClassId] = useState<string>(classes[0]?.id ? String(classes[0].id) : '')
  const [date, setDate] = useState(todayISO())
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(classes.length > 0)
  const [denied, setDenied] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [state, formAction, pending] = useActionState(saveAttendanceAction, initial)

  useEffect(() => {
    if (!classId || !date) return
    let cancelled = false
    void loadRosterAction(Number(classId), date)
      .then((res) => {
        if (cancelled) return
        if (!res.allowed) {
          setDenied(true)
          setRows([])
        } else {
          setRows(res.rows)
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError('Gagal memuat daftar siswa. Silakan coba lagi.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [classId, date])

  function setStatus(studentId: number, status: Row['status']) {
    setRows((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, status } : r)))
  }

  function setNote(studentId: number, note: string) {
    setRows((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, note } : r)))
  }

  function startReload() {
    setLoading(true)
    setDenied(false)
    setLoadError(null)
  }

  function markAllPresent() {
    // Default PRESENT hanya via tombol eksplisit (PRD §12.2.4)
    setRows((prev) => prev.map((r) => ({ ...r, status: 'PRESENT' as const })))
  }

  if (classes.length === 0) {
    return <p className="rounded-lg border border-dashed p-8 text-center text-sm text-[var(--muted-foreground)]">Belum ada kelas yang ditugaskan.</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="classId">Kelas</Label>
          <select id="classId" value={classId} onChange={(e) => { startReload(); setClassId(e.target.value) }}
            className="h-9 rounded-md border border-[var(--input)] bg-[var(--card)] px-3 text-sm">
            {classes.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tanggal">Tanggal</Label>
          <Input id="tanggal" type="date" value={date} onChange={(e) => { startReload(); setDate(e.target.value) }} className="w-44" />
        </div>
        <Button type="button" variant="outline" onClick={markAllPresent} disabled={loading || rows.length === 0}>
          Tandai Hadir Semua
        </Button>
      </div>

      {denied && (
        <p className="rounded-md border border-[var(--danger)] bg-[var(--destructive)]/10 p-3 text-sm text-[var(--danger)]">
          Kelas ini bukan assignment Anda.
        </p>
      )}

      {loadError && (
        <p className="rounded-md border border-[var(--danger)] bg-[var(--destructive)]/10 p-3 text-sm text-[var(--danger)]">
          {loadError}
        </p>
      )}

      {loading ? (
        <div className="space-y-2" aria-busy="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-[var(--muted)]" />
          ))}
        </div>
      ) : !denied && rows.length > 0 ? (
        <form action={formAction}>
          {/* payload diisi saat submit */}
          <input type="hidden" name="payload" value={JSON.stringify({
            classId: Number(classId),
            date,
            entries: rows.map((r) => ({ studentId: r.studentId, status: r.status, note: r.note || undefined })),
          })} />
          <div className="overflow-x-auto rounded-lg border bg-[var(--card)]">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b bg-[var(--muted)] text-left">
                  <th className="px-4 py-3 font-medium">Siswa</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.studentId} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <span className="font-medium">{r.fullName}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">{r.studentCode} · {r.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div role="radiogroup" aria-label={`Status kehadiran ${r.fullName}`} className="flex flex-wrap gap-1">
                        {STATUSES.map(([val, label]) => (
                          <button
                            key={val}
                            type="button"
                            role="radio"
                            aria-checked={(r.status ?? null) === val}
                            onClick={() => setStatus(r.studentId, val)}
                            className={`rounded-full px-3 py-1 text-xs transition-colors duration-150 ${
                              r.status === val
                                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                                : 'border hover:bg-[var(--muted)]'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        value={r.note ?? ''}
                        onChange={(e) => setNote(r.studentId, e.target.value)}
                        maxLength={200}
                        placeholder="Opsional"
                        aria-label={`Catatan presensi ${r.fullName}`}
                        className="min-w-40"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {state.error && (
            <p className="mt-3 rounded-md border border-[var(--danger)] bg-[var(--destructive)]/10 p-3 text-sm text-[var(--danger)]">{state.error}</p>
          )}
          {state.success && (
            <p className="mt-3 rounded-md bg-[var(--secondary)] p-3 text-sm text-[var(--primary)]">
              Data presensi berhasil disimpan ({state.saved} siswa).
            </p>
          )}

          <div className="sticky bottom-0 mt-4 flex justify-end border-t bg-[var(--background)] py-3">
            <div className="mr-auto text-xs text-[var(--muted-foreground)]">
              {rows.filter((r) => r.status).length}/{rows.length} siswa sudah diberi status
            </div>
            <Button type="submit" disabled={pending || rows.some((r) => !r.status)}>
              {pending ? 'Menyimpan…' : 'Simpan Presensi'}
            </Button>
          </div>
        </form>
      ) : !denied ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">Belum ada siswa terdaftar di kelas ini.</p>
        </div>
      ) : null}
    </div>
  )
}
