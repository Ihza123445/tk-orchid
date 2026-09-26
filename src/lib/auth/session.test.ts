import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
const { createSessionToken, verifySessionToken, SESSION_TTL_S } = await import('./session')

afterEach(() => vi.useRealTimers())

describe('token sesi', () => {
  it('token yang dibuat sistem dapat diverifikasi dan membawa id & peran', () => {
    const payload = verifySessionToken(createSessionToken(7, 'PARENT'))
    expect(payload?.userId).toBe(7)
    expect(payload?.role).toBe('PARENT')
  })
  it('menolak token yang isinya diubah (mis. peran dinaikkan menjadi ADMIN)', () => {
    const [, sig] = createSessionToken(7, 'PARENT').split('.')
    const forged = Buffer.from(JSON.stringify({ userId: 7, role: 'ADMIN', exp: 9999999999 })).toString('base64url')
    expect(verifySessionToken(`${forged}.${sig}`)).toBeNull()
  })
  it('menolak token kosong atau tanpa tanda tangan', () => {
    expect(verifySessionToken(undefined)).toBeNull()
    expect(verifySessionToken('')).toBeNull()
    expect(verifySessionToken('abc')).toBeNull()
  })
  it('menolak token yang sudah kedaluwarsa (lebih dari 8 jam)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-01T00:00:00Z'))
    const token = createSessionToken(1, 'ADMIN')
    vi.setSystemTime(new Date(Date.parse('2026-09-01T00:00:00Z') + (SESSION_TTL_S + 1) * 1000))
    expect(verifySessionToken(token)).toBeNull()
  })
})
