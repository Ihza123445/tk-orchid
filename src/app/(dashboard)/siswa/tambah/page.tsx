import type { Metadata } from 'next'
import { requireAdminStaff } from '@/lib/auth/guard'
import { UserPlus } from 'lucide-react'
import { TambahSiswaForm } from '@/components/students/student-form'
import { PageHeader } from '@/components/dashboard/primitives'

export const metadata: Metadata = { title: 'Tambah Siswa' }

export default async function TambahSiswaPage() {
  await requireAdminStaff()
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader icon={UserPlus} back={{ href: '/siswa', label: 'Data Siswa' }} title="Tambah Siswa" description="Lengkapi data siswa baru. Kolom bertanda * wajib diisi." />
      <TambahSiswaForm />
    </div>
  )
}
