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
      <div className="app-card grid grid-cols-2 items-end gap-3 p-4 sm:flex sm:flex-wrap">
        <div className="col-span-2 space-y-2 sm:col-span-1">
          <Label htmlFor="classId">Kelas</Label>
          <select id="classId" value={classId} onChange={(e) => { if (e.target.value !== classId) { startReload(); setClassId(e.target.value) } }}
            className="field-select sm:w-auto">
            {classes.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div className="col-span-2 space-y-2 sm:col-span-1">
          <Label htmlFor="tanggal">Tanggal</Label>
          <Input id="tanggal" type="date" value={date} onChange={(e) => { if (e.target.value !== date) { startReload(); setDate(e.target.value) } }} className="sm:w-44" />
        </div>
        <Button type="button" variant="outline" onClick={markAllPresent} disabled={loading || rows.length === 0} className="col-span-2 sm:col-span-1">
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
          {/* Daftar kartu per siswa: nyaman diisi dari HP, tetap satu baris di desktop */}
          <ul className="app-card divide-y divide-[var(--border)] overflow-hidden">
            {rows.map((r) => (
              <li
                key={r.studentId}
                className={`grid gap-3 px-4 py-3.5 transition-colors md:grid-cols-[minmax(0,1fr)_auto_220px] md:items-center ${r.status ? '' : 'bg-amber-500/[0.04]'}`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`size-2 shrink-0 rounded-full ${r.status ? 'bg-emerald-500' : 'bg-amber-400'}`} aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.fullName}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{r.studentCode} · {r.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                  </div>
                </div>
                <div role="radiogroup" aria-label={`Status kehadiran ${r.fullName}`} className="grid grid-cols-4 gap-1.5 md:flex">
                  {STATUSES.map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      role="radio"
                      aria-checked={(r.status ?? null) === val}
                      onClick={() => setStatus(r.studentId, val)}
                      className={`h-9 rounded-xl px-3 text-xs font-semibold ring-1 transition-all duration-150 md:h-8 md:rounded-full ${
                        r.status === val
                          ? `${STATUS_ACTIVE[val]} shadow-sm`
                          : 'bg-[var(--card)] ring-[var(--border)] hover:ring-[var(--primary)]/40'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <Input
                  value={r.note ?? ''}
                  onChange={(e) => setNote(r.studentId, e.target.value)}
                  maxLength={200}
                  placeholder="Catatan (opsional)"
                  aria-label={`Catatan presensi ${r.fullName}`}
                />
              </li>
            ))}
          </ul>

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
