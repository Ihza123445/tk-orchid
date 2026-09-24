'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClassAction, type ClassFormState } from '@/actions/classes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initial: ClassFormState = {}

interface Option { id: number; label: string }

export function KelasForm({ years, teachers }: { years: Option[]; teachers: Option[] }) {
  const [state, formAction, pending] = useActionState(createClassAction, initial)
  const router = useRouter()

  useEffect(() => {
    if (state.success) router.refresh()
  }, [state.success, router])

  return (
    <form action={formAction} className="space-y-4 rounded-lg border bg-[var(--card)] p-6">
      <h2 className="text-base font-semibold">Tambah Kelas</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="academicYearId">Tahun Ajaran *</Label>
          <select id="academicYearId" name="academicYearId" required defaultValue=""
            className="h-9 w-full rounded-md border border-[var(--input)] bg-transparent px-3 text-sm">
            <option value="" disabled>Pilih…</option>
            {years.map((y) => <option key={y.id} value={y.id}>{y.label}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Kode *</Label>
          <Input id="code" name="code" required maxLength={20} placeholder="KA" />
          {state.fields?.code && <p className="text-sm text-[var(--danger)]">{state.fields.code}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nama *</Label>
          <Input id="name" name="name" required maxLength={100} placeholder="Kelompok A" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="level">Level/Kelompok *</Label>
          <Input id="level" name="level" required maxLength={50} placeholder="Kelompok A" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="room">Ruang</Label>
          <Input id="room" name="room" maxLength={50} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="teacherId">Wali Kelas</Label>
          <select id="teacherId" name="teacherId" defaultValue=""
            className="h-9 w-full rounded-md border border-[var(--input)] bg-transparent px-3 text-sm">
            <option value="">—</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity">Kapasitas *</Label>
          <Input id="capacity" name="capacity" type="number" min={1} max={60} required defaultValue={20} />
          {state.fields?.capacity && <p className="text-sm text-[var(--danger)]">{state.fields.capacity}</p>}
        </div>
      </div>
      {state.error && <p className="rounded-md border border-[var(--danger)] bg-[var(--destructive)]/10 p-3 text-sm text-[var(--danger)]">{state.error}</p>}
      <Button type="submit" disabled={pending}>{pending ? 'Menyimpan…' : 'Tambah Kelas'}</Button>
    </form>
  )
}
