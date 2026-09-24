import { describe, expect, it } from 'vitest'
import { ageAt, ageReferenceDate, findLevel, levelForAge, parseBirthDate } from './levels'

const d = (iso: string) => new Date(`${iso}T00:00:00.000Z`)

describe('ageReferenceDate', () => {
  it('memakai 1 Juli tahun berikutnya untuk periode yang berakhir setelah Juli', () => {
    expect(ageReferenceDate(new Date('2026-12-31T16:59:59.999Z')).toISOString().slice(0, 10)).toBe('2027-07-01')
  })
  it('memakai 1 Juli tahun yang sama untuk periode yang berakhir sebelum Juli', () => {
    expect(ageReferenceDate(d('2026-06-30')).toISOString().slice(0, 10)).toBe('2026-07-01')
  })
})

describe('ageAt', () => {
  it('menghitung tahun & bulan penuh', () => {
    expect(ageAt(d('2023-07-01'), d('2027-07-01'))).toEqual({ years: 4, months: 0 })
    expect(ageAt(d('2023-07-02'), d('2027-07-01'))).toEqual({ years: 3, months: 11 })
    expect(ageAt(d('2022-01-15'), d('2027-07-01'))).toEqual({ years: 5, months: 5 })
  })
})

describe('levelForAge', () => {
  it('memetakan usia ke jenjang yang benar', () => {
    expect(levelForAge(2)).toBeUndefined()
    expect(levelForAge(3)?.value).toBe('Kelompok Bermain')
    expect(levelForAge(4)?.value).toBe('Kelompok A')
    expect(levelForAge(5)?.value).toBe('Kelompok B')
    expect(levelForAge(6)?.value).toBe('Kelompok B')
    expect(levelForAge(7)).toBeUndefined()
  })
})

describe('findLevel & parseBirthDate', () => {
  it('mengenali value maupun slug', () => {
    expect(findLevel('kb')?.value).toBe('Kelompok Bermain')
    expect(findLevel('Kelompok A')?.slug).toBe('tk-a')
    expect(findLevel('x')).toBeUndefined()
  })
  it('menolak tanggal tidak valid', () => {
    expect(parseBirthDate('2023-02-30')).toBeNull()
    expect(parseBirthDate('abc')).toBeNull()
    expect(parseBirthDate('2023-02-28')?.toISOString()).toBe('2023-02-28T00:00:00.000Z')
  })
})
