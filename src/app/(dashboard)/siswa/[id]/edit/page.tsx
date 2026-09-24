import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { requireAdminStaff } from '@/lib/auth/guard'
import { db } from '@/lib/db/db'
import { EditSiswaForm } from '@/components/students/student-form-edit'

export const metadata: Metadata = { title: 'Edit Siswa' }

export default async function EditSiswaPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminStaff()
  const { id } = await params
  const studentId = Number(id)
  if (!Number.isInteger(studentId)) notFound()

  const s = await db.student.findUnique({ where: { id: studentId } })
  if (!s) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Siswa</h1>
        <p className="text-sm text-[var(--muted-foreground)]">{s.fullName} · {s.studentCode}</p>
      </header>
      <EditSiswaForm
        data={{
          id: s.id,
          fullName: s.fullName,
          nickname: s.nickname,
          gender: s.gender,
          birthPlace: s.birthPlace,
          birthDate: s.birthDate.toISOString().slice(0, 10),
          address: s.address,
          city: s.city,
          province: s.province,
          religion: s.religion,
          nis: s.nis,
          notes: s.notes,
        }}
      />
    </div>
  )
}
