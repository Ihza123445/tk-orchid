// Aturan jenjang & usia PPDB — satu sumber untuk website, formulir, validasi server, dan admin.
// Nilai `value` disimpan di Admission.preferredLevel dan sama dengan Class.level.

export interface Level {
  value: string
  /** Nama yang dipakai di website publik */
  label: string
  /** Kode untuk URL (?jenjang=) */
  slug: string
  /** Usia (tahun penuh) pada tanggal acuan: minAge <= usia < maxAge */
  minAge: number
  maxAge: number
}

export const LEVELS: Level[] = [
  { value: 'Kelompok Bermain', label: 'Kelompok Bermain', slug: 'kb', minAge: 3, maxAge: 4 },
  { value: 'Kelompok A', label: 'TK A (Kelompok A)', slug: 'tk-a', minAge: 4, maxAge: 5 },
  { value: 'Kelompok B', label: 'TK B (Kelompok B)', slug: 'tk-b', minAge: 5, maxAge: 7 },
]

export const MIN_AGE = LEVELS[0].minAge
export const MAX_AGE = LEVELS[LEVELS.length - 1].maxAge

export function findLevel(value: string | null | undefined): Level | undefined {
  return LEVELS.find((level) => level.value === value || level.slug === value)
}

/**
 * Tanggal acuan usia: 1 Juli (awal tahun ajaran) pertama pada/sesudah periode PPDB ditutup.
 * Contoh: periode Agu–Des 2026 untuk TA 2027/2028 → 1 Juli 2027.
 */
export function ageReferenceDate(periodEnd: Date): Date {
  const year = periodEnd.getUTCFullYear()
  const julyFirst = new Date(Date.UTC(year, 6, 1))
  return periodEnd <= julyFirst ? julyFirst : new Date(Date.UTC(year + 1, 6, 1))
}

/** Usia dalam tahun & bulan penuh pada tanggal acuan (berbasis tanggal kalender UTC). */
export function ageAt(birthDate: Date, reference: Date): { years: number; months: number } {
  let months =
    (reference.getUTCFullYear() - birthDate.getUTCFullYear()) * 12 + (reference.getUTCMonth() - birthDate.getUTCMonth())
  if (reference.getUTCDate() < birthDate.getUTCDate()) months -= 1
  return { years: Math.floor(months / 12), months: months % 12 }
}

/** Jenjang yang sesuai usia, atau undefined jika di luar rentang yang diterima. */
export function levelForAge(years: number): Level | undefined {
  return LEVELS.find((level) => years >= level.minAge && years < level.maxAge)
}

export function formatAge({ years, months }: { years: number; months: number }): string {
  return months ? `${years} tahun ${months} bulan` : `${years} tahun`
}

export function formatReferenceDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
}

/** Parse "YYYY-MM-DD" dari input date sebagai tanggal kalender (UTC tengah malam). */
export function parseBirthDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date
}
