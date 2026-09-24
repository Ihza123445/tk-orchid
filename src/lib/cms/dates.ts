// Konversi tanggal untuk input form admin. Semua waktu memakai zona Asia/Jakarta (WIB)
// agar sama dengan format tampilan di src/lib/formatting/format.ts.

const OFFSET = '+07:00'

const parts = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** Date → nilai <input type="datetime-local"> atau <input type="date"> (WIB). */
export function toInputValue(date: Date | null | undefined, type: 'date' | 'datetime'): string {
  if (!date) return ''
  const p = Object.fromEntries(parts.formatToParts(date).map((part) => [part.type, part.value]))
  const day = `${p.year}-${p.month}-${p.day}`
  return type === 'date' ? day : `${day}T${p.hour}:${p.minute}`
}

/** Nilai input (WIB) → Date. Mengembalikan null bila kosong, undefined bila tidak valid. */
export function fromInputValue(value: string, type: 'date' | 'datetime', endOfDay = false): Date | null | undefined {
  if (!value) return null
  const iso = type === 'date' ? `${value}T${endOfDay ? '23:59:59.999' : '00:00:00'}${OFFSET}` : `${value}:00${OFFSET}`
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? undefined : date
}
