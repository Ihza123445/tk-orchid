export type ComputedInvoiceStatus = 'PAID' | 'PARTIAL' | 'ISSUED'

/** Status tagihan dari total rincian dan jumlah alokasi pembayaran yang masih berlaku (POSTED). */
export function invoiceStatus(total: number, allocated: number): ComputedInvoiceStatus {
  if (allocated >= total) return 'PAID'
  return allocated > 0 ? 'PARTIAL' : 'ISSUED'
}
