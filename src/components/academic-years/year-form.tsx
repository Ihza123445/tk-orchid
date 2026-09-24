'use client'

import { useActionState } from 'react'
import { createAcademicYearAction, type AcademicYearFormState } from '@/actions/academic-years'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initial: AcademicYearFormState = {}

export function TahunAjaranForm() {
  const [state, formAction, pending] = useActionState(createAcademicYearAction, initial)

  return (
    <form action={formAction} className="space-y-4 rounded-lg border bg-[var(--card)] p-6">
      <h2 className="text-base font-semibold">Tambah Tahun Ajaran</h2>
      <p className="text-xs text-[var(--muted-foreground)]">Tahun ajaran baru dibuat dengan status Perencanaan. Aktifkan dari tabel untuk menjadikannya tahun berjalan.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="name">Nama *</Label>
          <Input id="name" name="name" placeholder="2027/2028" required />
          {state.fields?.name && <p className="text-sm text-[var(--danger)]">{state.fields.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">Tanggal Mulai *</Label>
          <Input id="startDate" name="startDate" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Tanggal Selesai *</Label>
          <Input id="endDate" name="endDate" type="date" required />
          {state.fields?.endDate && <p className="text-sm text-[var(--danger)]">{state.fields.endDate}</p>}
        </div>
      </div>
      {state.error && <p className="rounded-md border border-[var(--danger)] bg-[var(--destructive)]/10 p-3 text-sm text-[var(--danger)]">{state.error}</p>}
      <Button type="submit" disabled={pending}>{pending ? 'Menyimpan…' : 'Tambah Tahun Ajaran'}</Button>
    </form>
  )
}
