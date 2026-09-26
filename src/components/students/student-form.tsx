'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { createStudentAction, type StudentFormState } from '@/actions/students'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initial: StudentFormState = {}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-sm text-[var(--danger)]">{message}</p>
}

export function TambahSiswaForm() {
  const [state, formAction, pending] = useActionState(createStudentAction, initial)
  const router = useRouter()

  useEffect(() => {
    if (state.success && state.studentId) {
      router.push(`/siswa/${state.studentId}`)
    }
  }, [state.success, state.studentId, router])

  return (
    <form action={formAction} className="space-y-8">
      {/* Section: Identitas */}
      <section className="form-card">
        <h2 className="mb-5">Identitas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="fullName">Nama Lengkap *</Label>
            <Input id="fullName" name="fullName" required maxLength={120} aria-invalid={!!state.fields?.fullName} />
            <FieldError message={state.fields?.fullName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname">Nama Panggilan</Label>
            <Input id="nickname" name="nickname" maxLength={50} />
            <FieldError message={state.fields?.nickname} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Jenis Kelamin *</Label>
            <select
              id="gender"
              name="gender"
              required
              className="field-select"
              defaultValue=""
            >
              <option value="" disabled>Pilih…</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
            <FieldError message={state.fields?.gender} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthPlace">Tempat Lahir</Label>
            <Input id="birthPlace" name="birthPlace" maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthDate">Tanggal Lahir *</Label>
            <Input id="birthDate" name="birthDate" type="date" required />
            <FieldError message={state.fields?.birthDate} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="religion">Agama</Label>
            <Input id="religion" name="religion" maxLength={50} placeholder="Opsional" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nis">NIS</Label>
            <Input id="nis" name="nis" maxLength={20} placeholder="Otomatis jika kosong" />
            <FieldError message={state.fields?.nis} />
          </div>
        </div>
      </section>

      {/* Section: Alamat */}
      <section className="form-card">
        <h2 className="mb-5">Alamat</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Alamat</Label>
            <Input id="address" name="address" maxLength={255} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Kota/Kabupaten</Label>
            <Input id="city" name="city" maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="province">Provinsi</Label>
            <Input id="province" name="province" maxLength={100} />
          </div>
        </div>
      </section>

      {/* Section: Catatan */}
      <section className="form-card">
        <h2 className="mb-5">Catatan</h2>
        <div className="space-y-2">
          <Label htmlFor="notes">Catatan Administrasi</Label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            maxLength={500}
            className="field-textarea"
          />
        </div>
      </section>

      {state.error && (
        <p className="alert-error">{state.error}</p>
      )}

      <div className="sticky bottom-3 z-10 flex justify-end gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 p-3 shadow-[var(--shadow-raised)] backdrop-blur">
        <Link href="/siswa"><Button type="button" variant="outline">Batal</Button></Link>
        <Button type="submit" disabled={pending}>{pending ? 'Menyimpan…' : 'Simpan'}</Button>
      </div>
    </form>
  )
}
