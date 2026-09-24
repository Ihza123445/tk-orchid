'use client'

import { useActionState } from 'react'
import { createFeeTypeAction, type FeeTypeState } from '@/actions/fees'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initial: FeeTypeState = {}

export function FeeTypeForm() {
  const [state, formAction, pending] = useActionState(createFeeTypeAction, initial)

  return (
    <form action={formAction} className="form-card space-y-4">
      <h2>Tambah Jenis Biaya</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="ft-code">Kode *</Label>
          <Input id="ft-code" name="code" required maxLength={30} placeholder="SPP" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ft-name">Nama *</Label>
          <Input id="ft-name" name="name" required maxLength={100} placeholder="SPP Bulanan" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ft-amt">Nominal Default (Rp) *</Label>
          <Input id="ft-amt" name="defaultAmount" type="number" min={0} required defaultValue={0} />
        </div>
        <div className="flex items-end gap-2 pb-1">
          <input id="ft-rec" name="recurring" type="checkbox" className="h-4 w-4 accent-[var(--primary)]" />
          <Label htmlFor="ft-rec" className="cursor-pointer">Berulang (bulanan)</Label>
        </div>
        <div className="space-y-2 sm:col-span-2 lg:col-span-4">
          <Label htmlFor="ft-desc">Keterangan</Label>
          <Input id="ft-desc" name="description" maxLength={500} />
        </div>
      </div>
      {state.error && <p className="alert-error">{state.error}</p>}
      {state.success && <p className="alert-success">Jenis biaya tersimpan.</p>}
      <Button type="submit" disabled={pending}>{pending ? 'Menyimpan…' : 'Simpan'}</Button>
    </form>
  )
}
