import type { Metadata } from 'next'
import { requireAdminStaff } from '@/lib/auth/guard'
import { TambahWaliForm } from '@/components/guardians/guardian-form'

export const metadata: Metadata = { title: 'Tambah Wali' }

export default async function TambahWaliPage() {
  await requireAdminStaff()
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Tambah Wali</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Kolom bertanda * wajib diisi.</p>
      </header>
      <TambahWaliForm />
    </div>
  )
}
