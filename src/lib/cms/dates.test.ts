import { describe, expect, it } from 'vitest'
import { fromInputValue, toInputValue } from './dates'

describe('konversi tanggal input form (WIB)', () => {
  it('nilai input tanggal dibaca sebagai awal atau akhir hari WIB', () => {
    expect(fromInputValue('2026-09-26', 'date')?.toISOString()).toBe('2026-09-25T17:00:00.000Z')
    expect(fromInputValue('2026-09-26', 'date', true)?.toISOString()).toBe('2026-09-26T16:59:59.999Z')
  })
  it('kosong menjadi null, tidak valid menjadi undefined', () => {
    expect(fromInputValue('', 'date')).toBeNull()
    expect(fromInputValue('bukan-tanggal', 'datetime')).toBeUndefined()
  })
  it('bolak-balik Date → input → Date tidak menggeser waktu', () => {
    const d = new Date('2026-09-26T02:15:00Z')
    expect(toInputValue(d, 'datetime')).toBe('2026-09-26T09:15')
    expect(fromInputValue(toInputValue(d, 'datetime'), 'datetime')?.toISOString()).toBe(d.toISOString())
  })
})
