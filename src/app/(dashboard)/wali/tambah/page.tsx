import type { Metadata } from 'next'
import { requireAdminStaff } from '@/lib/auth/guard'
import { UserPlus } from 'lucide-react'
import { TambahWaliForm } from '@/components/guardians/guardian-form'
import { PageHeader } from '@/components/dashboard/primitives'

export const metadata: Metadata = { title: 'Tambah Wali' }

export default async function TambahWaliPage() {
  await requireAdminStaff()
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader icon={UserPlus} back={{ href: '/wali', label: 'Data Wali' }} title="Tambah Wali" description="Data orang tua/wali siswa. Kolom bertanda * wajib diisi." />
      <TambahWaliForm />
    </div>
  )
}
