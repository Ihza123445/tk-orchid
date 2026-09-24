'use client'

import { useActionState } from 'react'
import { submitAdmissionAction, type PpdbState } from '@/actions/ppdb-public'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initial: PpdbState = {}

function fe(state: PpdbState, field: string): string | undefined {
  return state.fieldErrors?.[field]?.[0]
}

export function PpdbForm({ periodName }: { periodName: string }) {
  const [state, formAction, pending] = useActionState(submitAdmissionAction, initial)

  if (state.success && state.regNo) {
    return (
      <div className="rounded-lg border bg-[var(--card)] p-8 text-center">
        <h2 className="text-lg font-semibold text-[var(--primary)]">Pendaftaran Terkirim ✓</h2>
        <p className="mt-2 text-sm">Nomor pendaftaran anak Anda:</p>
        <p className="mt-1 font-mono text-xl font-bold">{state.regNo}</p>
        <p className="mx-auto mt-4 max-w-md text-sm text-[var(--muted-foreground)]">
          Simpan nomor ini. Tim sekolah akan menghubungi Anda untuk proses verifikasi berikutnya.
        </p>
      </div>
    )
  }

  const input = 'h-9 w-full rounded-md border border-[var(--input)] bg-transparent px-3 text-sm'

  return (
    <form action={formAction} className="space-y-5 rounded-lg border bg-[var(--card)] p-6">
      <p className="text-sm text-[var(--muted-foreground)]">Periode: <span className="font-medium">{periodName}</span></p>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold">Data Anak</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pp-name">Nama Lengkap Anak *</Label>
            <Input id="pp-name" name="childFullName" required maxLength={150} />
            {fe(state, 'childFullName') && <p className="text-xs text-red-600">{fe(state, 'childFullName')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pp-gender">Jenis Kelamin *</Label>
            <select id="pp-gender" name="childGender" required defaultValue="" className={input}>
              <option value="" disabled>Pilih…</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
            {fe(state, 'childGender') && <p className="text-xs text-red-600">{fe(state, 'childGender')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pp-birthplace">Tempat Lahir *</Label>
            <Input id="pp-birthplace" name="childBirthPlace" required maxLength={100} />
            {fe(state, 'childBirthPlace') && <p className="text-xs text-red-600">{fe(state, 'childBirthPlace')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pp-birthdate">Tanggal Lahir *</Label>
            <Input id="pp-birthdate" name="childBirthDate" type="date" required />
            {fe(state, 'childBirthDate') && <p className="text-xs text-red-600">{fe(state, 'childBirthDate')}</p>}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t pt-4">
        <legend className="text-sm font-semibold">Orang Tua / Wali</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pp-parent">Nama Orang Tua/Wali *</Label>
            <Input id="pp-parent" name="parentName" required maxLength={150} />
            {fe(state, 'parentName') && <p className="text-xs text-red-600">{fe(state, 'parentName')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pp-rel">Hubungan *</Label>
            <select id="pp-rel" name="relationship" required defaultValue="" className={input}>
              <option value="" disabled>Pilih…</option>
              <option value="AYAH">Ayah</option>
              <option value="IBU">Ibu</option>
              <option value="WALI">Wali</option>
            </select>
            {fe(state, 'relationship') && <p className="text-xs text-red-600">{fe(state, 'relationship')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pp-phone">No. HP / WhatsApp *</Label>
            <Input id="pp-phone" name="phone" required placeholder="08xxxxxxxxxx" />
            {fe(state, 'phone') && <p className="text-xs text-red-600">{fe(state, 'phone')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pp-email">Email</Label>
            <Input id="pp-email" name="email" type="email" />
            {fe(state, 'email') && <p className="text-xs text-red-600">{fe(state, 'email')}</p>}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pp-address">Alamat *</Label>
            <textarea id="pp-address" name="address" required maxLength={500} rows={2} className="w-full rounded-md border border-[var(--input)] bg-transparent px-3 py-2 text-sm" />
            {fe(state, 'address') && <p className="text-xs text-red-600">{fe(state, 'address')}</p>}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pp-notes">Catatan</Label>
            <Input id="pp-notes" name="notes" maxLength={500} placeholder="Opsional" />
          </div>
        </div>
      </fieldset>

      {state.error && <p className="rounded-md border border border-[var(--destructive)]/40 bg-[var(--destructive)]/10 p-3 text-sm text-[var(--destructive)]">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? 'Mengirim…' : 'Kirim Pendaftaran'}
      </Button>
    </form>
  )
}
