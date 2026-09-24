import type { Metadata } from 'next'
import { requireAdminStaff } from '@/lib/auth/guard'
import { TambahSiswaForm } from '@/components/students/student-form'

export const metadata: Metadata = { title: 'Tambah Siswa' }

export default async function TambahSiswaPage() {
  await requireAdminStaff()
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Tambah Siswa</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Lengkapi data siswa baru. Kolom bertanda * wajib diisi.
        </p>
      </header>
      <TambahSiswaForm />
    </div>
  )
}
