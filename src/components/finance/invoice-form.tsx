'use client'

import { useActionState, useMemo, useState } from 'react'
import Link from 'next/link'
import { createInvoiceAction, type InvoiceState } from '@/actions/invoices'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface StudentOpt { id: number; label: string }
interface FeeOpt { id: number; label: string; defaultAmount: number }

const initial: InvoiceState = {}

interface ItemRow {
  key: number
  feeTypeId: string
  description: string
  quantity: number
  unitAmount: number
}

function todayISO(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function InvoiceForm({ students, feeTypes }: { students: StudentOpt[]; feeTypes: FeeOpt[] }) {
  const [state, formAction, pending] = useActionState(createInvoiceAction, initial)
  const [items, setItems] = useState<ItemRow[]>([
    { key: 1, feeTypeId: '', description: '', quantity: 1, unitAmount: 0 },
  ])
  const nextKey = useMemo(() => Math.max(0, ...items.map((i) => i.key)) + 1, [items])

  const total = items.reduce((s, i) => s + i.quantity * i.unitAmount, 0)
  const itemsPayload = JSON.stringify(
    items
      .filter((i) => i.feeTypeId && i.unitAmount > 0)
      .map((i) => ({ feeTypeId: Number(i.feeTypeId), description: i.description || undefined, quantity: i.quantity, unitAmount: i.unitAmount }))
  )

  function updateItem(key: number, patch: Partial<ItemRow>) {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)))
  }

  return (
    <form action={formAction} className="form-card space-y-4">
      <h2>Buat Tagihan</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="inv-student">Siswa *</Label>
          <select id="inv-student" name="studentId" required defaultValue=""
            className="field-select">
            <option value="" disabled>Pilih siswa…</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="inv-issue">Terbit *</Label>
          <Input id="inv-issue" name="issueDate" type="date" required defaultValue={todayISO()} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inv-due">Jatuh Tempo *</Label>
          <Input id="inv-due" name="dueDate" type="date" required defaultValue={todayISO(30)} />
        </div>
      </div>
      <input type="hidden" name="items" value={itemsPayload} />

      <div className="table-card">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="text-left">
              <th className="px-3 py-2">Jenis Biaya</th>
              <th className="px-3 py-2">Keterangan</th>
              <th className="px-3 py-2 w-20">Qty</th>
              <th className="px-3 py-2 w-36">Nominal</th>
              <th className="w-10" aria-label="Hapus" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.key}>
                <td className="px-3 py-2">
                  <select
                    aria-label={`Jenis biaya baris ${item.key}`}
                    required
                    value={item.feeTypeId}
                    onChange={(e) => {
                      const ft = feeTypes.find((f) => f.id === Number(e.target.value))
                      updateItem(item.key, { feeTypeId: e.target.value, unitAmount: ft?.defaultAmount ?? item.unitAmount })
                    }}
                    className="field-select w-auto"
                  >
                    <option value="" disabled>Pilih…</option>
                    {feeTypes.filter((f) => f.defaultAmount >= 0).map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <Input aria-label={`Keterangan baris ${item.key}`} value={item.description} maxLength={200}
                    onChange={(e) => updateItem(item.key, { description: e.target.value })} />
                </td>
                <td className="px-3 py-2">
                  <Input aria-label={`Qty baris ${item.key}`} type="number" min={1} max={12} value={item.quantity}
                    onChange={(e) => updateItem(item.key, { quantity: Math.max(1, Number(e.target.value) || 1) })} />
                </td>
                <td className="px-3 py-2">
                  <Input aria-label={`Nominal baris ${item.key}`} type="number" min={0} step={1000} value={item.unitAmount}
                    onChange={(e) => updateItem(item.key, { unitAmount: Math.max(0, Number(e.target.value) || 0) })} />
                </td>
                <td className="px-2 py-2 text-center">
                  {items.length > 1 && (
                    <button type="button" aria-label={`Hapus baris ${item.key}`}
                      onClick={() => setItems((prev) => prev.filter((it) => it.key !== item.key))}
                      className="text-lg leading-none opacity-50 hover:opacity-100">×</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="">
              <td colSpan={3} className="px-3 py-2 text-right font-medium">Total</td>
              <td className="px-3 py-2 tabular-nums font-semibold">{total.toLocaleString('id-ID')}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <button type="button"
        onClick={() => setItems((prev) => [...prev, { key: nextKey, feeTypeId: '', description: '', quantity: 1, unitAmount: 0 }])}
        className="inline-flex h-8 items-center gap-1 rounded-[10px] border border-dashed border-[var(--primary)]/40 px-3 text-sm font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/[0.06]">
        + Tambah baris
      </button>

      <div className="space-y-2">
        <Label htmlFor="inv-notes">Catatan</Label>
        <Input id="inv-notes" name="notes" maxLength={500} placeholder="Catatan tagihan (opsional)" />
      </div>

      {state.error && <p className="alert-error">{state.error}</p>}
      {state.success && state.invoiceNo && (
        <p className="alert-success">
          Tagihan <Link href="/keuangan/tagihan" className="font-medium underline">{state.invoiceNo}</Link> berhasil dibuat.
        </p>
      )}

      <Button type="submit" disabled={pending}>{pending ? 'Menyimpan…' : 'Buat Tagihan'}</Button>
    </form>
  )
}
