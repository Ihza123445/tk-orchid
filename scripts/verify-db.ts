import { Prisma, PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' }) })

async function main() {
  const student = await db.student.findFirst({
    include: {
      studentGuardians: { include: { guardian: true } },
      enrollments: { include: { klass: true } },
    },
  })
  if (!student) throw new Error('Database belum memiliki data siswa. Jalankan npm run db:seed.')

  console.log(
    'SAMPLE:',
    student.fullName,
    '| wali:',
    student.studentGuardians[0]?.guardian.fullName ?? '-',
    '| kelas:',
    student.enrollments[0]?.klass.name ?? '-',
  )

  const invoices = await db.invoice.findMany({
    include: { items: true, allocations: { include: { payment: true } } },
    orderBy: { id: 'asc' },
  })
  for (const invoice of invoices) {
    const total = invoice.items.reduce((sum, item) => sum + item.subtotal, 0)
    const paid = invoice.allocations
      .filter((item) => item.payment.status === 'POSTED')
      .reduce((sum, item) => sum + item.amount, 0)
    if (paid > total) throw new Error(`Alokasi ${invoice.invoiceNo} melebihi total tagihan.`)
    console.log(invoice.invoiceNo, invoice.status, '| total:', total, '| dibayar:', paid)
  }

  const existingAttendance = await db.attendance.findFirst()
  if (existingAttendance) {
    try {
      const unexpected = await db.attendance.create({
        data: {
          studentId: existingAttendance.studentId,
          classId: existingAttendance.classId,
          attendanceDate: existingAttendance.attendanceDate,
          status: 'PRESENT',
          recordedBy: existingAttendance.recordedBy,
        },
      })
      await db.attendance.delete({ where: { id: unexpected.id } })
      throw new Error('Constraint unik presensi tidak bekerja.')
    } catch (error: unknown) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error
      console.log('UNIQUE-TEST: duplikat presensi berhasil ditolak (P2002)')
    }
  }

  const parent = await db.guardian.findFirst({
    where: { user: { email: 'orangtua@orchid.local' } },
    include: { studentGuardians: true },
  })
  console.log('PARENT-ACCESS: anak terhubung =', parent?.studentGuardians.length ?? 0)
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
