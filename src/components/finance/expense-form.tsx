'use client'

import { useActionState } from 'react'
import { createExpenseAction, type ExpenseState } from '@/actions/expenses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initial: ExpenseState = {}

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const KATEGORI = ['Operasional', 'Gaji & Honor', 'ATK', 'Konsumsi', 'Perawatan', 'Kegiatan', 'Lainnya']

export function ExpenseForm() {
  const [state, formAction, pending] = useActionState(createExpenseAction, initial)

  return (
    <form action={formAction} className="space-y-4 rounded-lg border bg-[var(--card)] p-6">
      <h2 className="text-base font-semibold">Catat Pengeluaran</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="ex-date">Tanggal *</Label>
          <Input id="ex-date" name="expenseDate" type="date" required defaultValue={todayISO()} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ex-cat">Kategori *</Label>
          <select id="ex-cat" name="category" required defaultValue=""
            className="h-9 w-full rounded-md border border-[var(--input)] bg-transparent px-3 text-sm">
            <option value="" disabled>Pilih…</option>
            {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ex-amt">Nominal (Rp) *</Label>
          <Input id="ex-amt" name="amount" type="number" min={1000} step={1000} required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="ex-desc">Keterangan *</Label>
          <Input id="ex-desc" name="description" required maxLength={500} placeholder="Contoh: Beli kertas A4 5 rim" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ex-vendor">Vendor</Label>
          <Input id="ex-vendor" name="vendor" maxLength={200} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ex-method">Metode Bayar *</Label>
          <select id="ex-method" name="paymentMethod" required defaultValue="CASH"
            className="h-9 w-full rounded-md border border-[var(--input)] bg-transparent px-3 text-sm">
            <option value="CASH">Tunai</option>
            <option value="TRANSFER">Transfer</option>
            <option value="OTHER">Lainnya</option>
          </select>
        </div>
      </div>
      {state.error && <p className="rounded-md border border-[var(--danger)] bg-[var(--destructive)]/10 p-3 text-sm text-[var(--danger)]">{state.error}</p>}
      {state.success && <p className="rounded-md bg-[var(--secondary)] p-3 text-sm text-[var(--primary)]">Pengeluaran tercatat.</p>}
      <Button type="submit" disabled={pending}>{pending ? 'Menyimpan…' : 'Simpan Pengeluaran'}</Button>
    </form>
  )
}
