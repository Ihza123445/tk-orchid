'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { updateStudentAction, type StudentFormState } from '@/actions/students'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initial: StudentFormState = {}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-sm text-[var(--danger)]">{message}</p>
}

export interface EditStudentData {
  id: number
  fullName: string
  nickname: string | null
  gender: string
  birthPlace: string | null
  birthDate: string // yyyy-mm-dd
  address: string | null
  city: string | null
  province: string | null
  religion: string | null
  nis: string | null
  notes: string | null
}

export function EditSiswaForm({ data }: { data: EditStudentData }) {
  const [state, formAction, pending] = useActionState(updateStudentAction, initial)
  const router = useRouter()

  useEffect(() => {
    if (state.success && state.studentId) {
      router.push(`/siswa/${state.studentId}`)
    }
  }, [state.success, state.studentId, router])

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="id" value={data.id} />

      <section className="rounded-lg border bg-[var(--card)] p-6">
        <h2 className="mb-4 text-base font-semibold">Identitas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="fullName">Nama Lengkap *</Label>
            <Input id="fullName" name="fullName" required maxLength={120} defaultValue={data.fullName} />
            <FieldError message={state.fields?.fullName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname">Nama Panggilan</Label>
            <Input id="nickname" name="nickname" maxLength={50} defaultValue={data.nickname ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Jenis Kelamin *</Label>
            <select id="gender" name="gender" required defaultValue={data.gender}
              className="h-9 w-full rounded-md border border-[var(--input)] bg-transparent px-3 text-sm">
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthPlace">Tempat Lahir</Label>
            <Input id="birthPlace" name="birthPlace" maxLength={100} defaultValue={data.birthPlace ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthDate">Tanggal Lahir *</Label>
            <Input id="birthDate" name="birthDate" type="date" required defaultValue={data.birthDate} />
            <FieldError message={state.fields?.birthDate} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="religion">Agama</Label>
            <Input id="religion" name="religion" maxLength={50} defaultValue={data.religion ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nis">NIS</Label>
            <Input id="nis" name="nis" maxLength={20} defaultValue={data.nis ?? ''} />
            <FieldError message={state.fields?.nis} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-[var(--card)] p-6">
        <h2 className="mb-4 text-base font-semibold">Alamat</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Alamat</Label>
            <Input id="address" name="address" maxLength={255} defaultValue={data.address ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Kota/Kabupaten</Label>
            <Input id="city" name="city" maxLength={100} defaultValue={data.city ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="province">Provinsi</Label>
            <Input id="province" name="province" maxLength={100} defaultValue={data.province ?? ''} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-[var(--card)] p-6">
        <h2 className="mb-4 text-base font-semibold">Catatan</h2>
        <textarea id="notes" name="notes" rows={3} maxLength={500} defaultValue={data.notes ?? ''}
          className="w-full rounded-md border border-[var(--input)] bg-transparent px-3 py-2 text-sm" />
      </section>

      {state.error && (
        <p className="rounded-md border border-[var(--danger)] bg-[var(--destructive)]/10 p-3 text-sm text-[var(--danger)]">{state.error}</p>
      )}

      <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-[var(--background)] py-3">
        <Link href={`/siswa/${data.id}`}><Button type="button" variant="outline">Batal</Button></Link>
        <Button type="submit" disabled={pending}>{pending ? 'Menyimpan…' : 'Simpan Perubahan'}</Button>
      </div>
    </form>
  )
}
