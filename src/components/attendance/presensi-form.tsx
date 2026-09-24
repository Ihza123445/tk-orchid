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

// Warna tombol status saat terpilih
const STATUS_ACTIVE: Record<string, string> = {
  PRESENT: 'bg-emerald-600 text-white ring-emerald-600',
  SICK: 'bg-amber-500 text-white ring-amber-500',
  PERMISSION: 'bg-blue-600 text-white ring-blue-600',
  ABSENT: 'bg-[var(--destructive)] text-white ring-[var(--destructive)]',
}

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
    return <p className="empty-state">Belum ada kelas yang ditugaskan.</p>
  }

  return (
    <div className="space-y-4">
      <div className="app-card flex flex-wrap items-end gap-3 p-4">
        <div className="space-y-2">
          <Label htmlFor="classId">Kelas</Label>
          <select id="classId" value={classId} onChange={(e) => { startReload(); setClassId(e.target.value) }}
            className="field-select w-auto">
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
        <p className="alert-error">
          Kelas ini bukan assignment Anda.
        </p>
      )}

      {loadError && (
        <p className="alert-error">
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
          <div className="table-card">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-3">Siswa</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.studentId}>
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
                            className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition-all duration-150 ${
                              r.status === val
                                ? `${STATUS_ACTIVE[val]} shadow-sm`
                                : 'bg-[var(--card)] ring-[var(--border)] hover:ring-[var(--primary)]/40'
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
            <p className="mt-3 alert-error">{state.error}</p>
          )}
          {state.success && (
            <p className="mt-3 alert-success">
              Data presensi berhasil disimpan ({state.saved} siswa).
            </p>
          )}

          <div className="sticky bottom-3 z-10 mt-4 flex items-center justify-end gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 px-4 py-3 shadow-[var(--shadow-raised)] backdrop-blur">
            <div className="mr-auto text-xs text-[var(--muted-foreground)]">
              {rows.filter((r) => r.status).length}/{rows.length} siswa sudah diberi status
            </div>
            <Button type="submit" disabled={pending || rows.some((r) => !r.status)}>
              {pending ? 'Menyimpan…' : 'Simpan Presensi'}
            </Button>
          </div>
        </form>
      ) : !denied ? (
        <div className="empty-state">
          <p className="text-sm text-[var(--muted-foreground)]">Belum ada siswa terdaftar di kelas ini.</p>
        </div>
      ) : null}
    </div>
  )
}
