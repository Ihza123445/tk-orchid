import { describe, expect, it } from 'vitest'
import { formatRupiah, formatTanggal, formatTanggalSingkat } from './format'

describe('format tampilan', () => {
  it('formatRupiah memakai pemisah ribuan titik', () => {
    expect(formatRupiah(1500000)).toBe('Rp1.500.000')
    expect(formatRupiah(0)).toBe('Rp0')
    expect(formatRupiah(null)).toBe('-')
  })
  it('tanggal ditampilkan dalam zona WIB', () => {
    // 17.30 UTC = 00.30 WIB hari berikutnya
    expect(formatTanggal(new Date('2026-09-25T17:30:00Z'))).toBe('26 September 2026')
    expect(formatTanggalSingkat('2026-07-22T03:00:00Z')).toBe('22 Jul 2026')
    expect(formatTanggal(null)).toBe('-')
  })
})
