'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createGuardianAction, type GuardianFormState } from '@/actions/guardians'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initial: GuardianFormState = {}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-sm text-[var(--danger)]">{message}</p>
}

export function TambahWaliForm() {
  const [state, formAction, pending] = useActionState(createGuardianAction, initial)
  const router = useRouter()

  useEffect(() => {
    if (state.success && state.guardianId) router.push(`/wali/${state.guardianId}`)
  }, [state.success, state.guardianId, router])

  return (
    <form action={formAction} className="space-y-8">
      <section className="rounded-lg border bg-[var(--card)] p-6">
        <h2 className="mb-4 text-base font-semibold">Data Wali</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="fullName">Nama Lengkap *</Label>
            <Input id="fullName" name="fullName" required maxLength={120} />
            <FieldError message={state.fields?.fullName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="relationship">Hubungan *</Label>
            <select id="relationship" name="relationship" required defaultValue=""
              className="h-9 w-full rounded-md border border-[var(--input)] bg-transparent px-3 text-sm">
              <option value="" disabled>Pilih…</option>
              <option value="AYAH">Ayah</option>
              <option value="IBU">Ibu</option>
              <option value="WALI">Wali</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
            <FieldError message={state.fields?.relationship} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon *</Label>
            <Input id="phone" name="phone" required maxLength={20} placeholder="08…" />
            <FieldError message={state.fields?.phone} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
            <FieldError message={state.fields?.email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="occupation">Pekerjaan</Label>
            <Input id="occupation" name="occupation" maxLength={100} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Alamat</Label>
            <Input id="address" name="address" maxLength={255} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-[var(--card)] p-6">
        <h2 className="mb-2 text-base font-semibold">Akun Portal Orang Tua</h2>
        <p className="mb-3 text-xs text-[var(--muted-foreground)]">
          Buat akun agar wali dapat mengakses portal orang tua. Email wajib diisi. Password awal diatur melalui fitur lupa password.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="createAccount" className="h-4 w-4" />
          Buatkan akun portal
        </label>
        <FieldError message={state.fields?.createAccount} />
      </section>

      {state.error && (
        <p className="rounded-md border border-[var(--danger)] bg-[var(--destructive)]/10 p-3 text-sm text-[var(--danger)]">{state.error}</p>
      )}

      <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-[var(--background)] py-3">
        <Button type="button" variant="outline" onClick={() => router.push('/wali')}>Batal</Button>
        <Button type="submit" disabled={pending}>{pending ? 'Menyimpan…' : 'Simpan'}</Button>
      </div>
    </form>
  )
}
