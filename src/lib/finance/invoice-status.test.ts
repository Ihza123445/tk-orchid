import { describe, expect, it } from 'vitest'
import { invoiceStatus } from './invoice-status'

describe('invoiceStatus', () => {
  it('ISSUED bila belum ada pembayaran', () => {
    expect(invoiceStatus(400000, 0)).toBe('ISSUED')
  })
  it('PARTIAL bila baru dibayar sebagian', () => {
    expect(invoiceStatus(400000, 150000)).toBe('PARTIAL')
  })
  it('PAID bila alokasi sama dengan atau melebihi total', () => {
    expect(invoiceStatus(400000, 400000)).toBe('PAID')
    expect(invoiceStatus(400000, 450000)).toBe('PAID')
  })
})
