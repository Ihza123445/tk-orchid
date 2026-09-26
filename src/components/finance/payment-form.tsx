'use client'

import { useActionState, useMemo, useState } from 'react'
import { createPaymentAction, type PaymentState } from '@/actions/payments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface StudentOpt { id: number; label: string }
interface OpenInvoice {
  id: number
  invoiceNo: string
  remaining: number
  dueDate: string
}

const initial: PaymentState = {}

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function PaymentForm({ students, openInvoicesByStudent }: { students: StudentOpt[]; openInvoicesByStudent: Record<number, OpenInvoice[]> }) {
  const [state, formAction, pending] = useActionState(createPaymentAction, initial)
  const [studentId, setStudentId] = useState('')
  const [method, setMethod] = useState('CASH')
  const [allocs, setAllocs] = useState<Record<number, number>>({})

  const openInvoices = studentId ? openInvoicesByStudent[Number(studentId)] ?? [] : []
  const totalAlloc = useMemo(() => Object.values(allocs).reduce((s, v) => s + (v || 0), 0), [allocs])

  const allocationsPayload = JSON.stringify(
    Object.entries(allocs)
      .filter(([, amt]) => amt > 0)
      .map(([invId, amt]) => ({ invoiceId: Number(invId), amount: amt }))
  )

  return (
    <form action={formAction} className="form-card space-y-4">
      <h2>Catat Pembayaran</h2>
      <p className="text-xs text-[var(--muted-foreground)]">Jumlah pembayaran dihitung otomatis dari total alokasi ke tagihan.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="pay-student">Siswa *</Label>
          <select id="pay-student" name="studentId" required value={studentId}
            onChange={(e) => { setStudentId(e.target.value); setAllocs({}) }}
            className="field-select">
            <option value="" disabled>Pilih siswa…</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pay-date">Tanggal *</Label>
          <Input id="pay-date" name="paymentDate" type="date" required defaultValue={todayISO()} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pay-method">Metode *</Label>
          <select id="pay-method" name="method" required value={method} onChange={(e) => setMethod(e.target.value)}
            className="field-select">
            <option value="CASH">Tunai</option>
            <option value="TRANSFER">Transfer</option>
            <option value="QRIS">QRIS</option>
            <option value="OTHER">Lainnya</option>
          </select>
        </div>
      </div>

      {(method === 'TRANSFER' || method === 'QRIS') && (
        <div className="space-y-2 max-w-sm">
          <Label htmlFor="pay-ref">No. Referensi</Label>
          <Input id="pay-ref" name="referenceNo" maxLength={100} placeholder="Nomor transfer/QR" />
        </div>
      )}

      <input type="hidden" name="allocations" value={allocationsPayload} />

      {studentId && (
        openInvoices.length === 0 ? (
          <p className="rounded-xl bg-[var(--muted)] p-3 text-sm text-[var(--muted-foreground)]">Tidak ada tagihan belum lunas untuk siswa ini.</p>
        ) : (
          <div className="table-card">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="text-left">
                  <th className="px-3 py-2">Invoice</th>
                  <th className="px-3 py-2">Jatuh Tempo</th>
                  <th className="px-3 py-2 text-right">Sisa</th>
                  <th className="px-3 py-2 w-40">Alokasi</th>
                </tr>
              </thead>
              <tbody>
                {openInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-3 py-2 font-mono text-xs">{inv.invoiceNo}</td>
                    <td className="px-3 py-2">{inv.dueDate}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{inv.remaining.toLocaleString('id-ID')}</td>
                    <td className="px-3 py-2">
                      <Input
                        type="number" min={0} max={inv.remaining} step={1000}
                        aria-label={`Alokasi ${inv.invoiceNo}`}
                        value={allocs[inv.id] ?? ''}
                        onChange={(e) => {
                          const v = Math.min(Math.max(0, Number(e.target.value) || 0), inv.remaining)
                          setAllocs((prev) => ({ ...prev, [inv.id]: v }))
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="">
                  <td colSpan={3} className="px-3 py-2 text-right font-medium">Total Alokasi</td>
                  <td className="px-3 py-2 tabular-nums font-semibold">{totalAlloc.toLocaleString('id-ID')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )
      )}

      <div className="space-y-2 max-w-lg">
        <Label htmlFor="pay-note">Catatan</Label>
        <Input id="pay-note" name="note" maxLength={500} placeholder="Catatan pembayaran (opsional)" />
      </div>

      {state.error && <p className="alert-error">{state.error}</p>}
      {state.success && state.receiptNo && (
        <p className="alert-success">Pembayaran tercatat — kwitansi {state.receiptNo}.</p>
      )}

      <Button type="submit" disabled={pending || !studentId || totalAlloc <= 0}>
        {pending ? 'Menyimpan…' : 'Catat Pembayaran'}
      </Button>
    </form>
  )
}
