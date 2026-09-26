import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/db/db', () => ({ db: {} }))
const { clearFailures, isRateLimited, recordFailure } = await import('./rate-limit')

afterEach(() => vi.useRealTimers())

describe('pembatasan percobaan login', () => {
  it('belum dibatasi sebelum 5 kali gagal, dibatasi pada kegagalan ke-5', () => {
    const key = 'ip:uji1@orchid.local'
    for (let i = 0; i < 4; i++) recordFailure(key)
    expect(isRateLimited(key)).toBe(false)
    recordFailure(key)
    expect(isRateLimited(key)).toBe(true)
  })
  it('login berhasil menghapus hitungan gagal', () => {
    const key = 'ip:uji2@orchid.local'
    for (let i = 0; i < 5; i++) recordFailure(key)
    clearFailures(key)
    expect(isRateLimited(key)).toBe(false)
  })
  it('batasan berakhir setelah jendela 10 menit', () => {
    vi.useFakeTimers()
    const key = 'ip:uji3@orchid.local'
    for (let i = 0; i < 5; i++) recordFailure(key)
    expect(isRateLimited(key)).toBe(true)
    vi.advanceTimersByTime(10 * 60 * 1000 + 1)
    expect(isRateLimited(key)).toBe(false)
  })
})
