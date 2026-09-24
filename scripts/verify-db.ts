import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

async function main() {
  const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' }) })
  const r = await db.student.findFirst({ include: { studentGuardians: { include: { guardian: true } }, enrollments: { include: { klass: true } } } })
  console.log('SAMPLE:', r?.fullName, '| wali:', r?.studentGuardians[0]?.guardian.fullName, '| kelas:', r?.enrollments[0]?.klass.name)
  const inv = await db.invoice.findMany({ include: { items: true, allocations: true }, orderBy: { id: 'asc' } })
  for (const i of inv) console.log(i.invoiceNo, i.status, '| total:', i.items.reduce((a, b) => a + b.subtotal, 0), '| dibayar:', i.allocations.reduce((a, b) => a + b.amount, 0))
  // test unique constraint
  try {
    await db.attendance.create({ data: { studentId: r!.id, classId: 1, attendanceDate: new Date(), status: 'PRESENT', recordedBy: 1 } })
    console.log('UNIQUE-TEST: no error (BAD if duplicate)')
  } catch (e: any) {
    console.log('UNIQUE-TEST: blocked duplicate ->', e.code)
  }
  // guardian auth check: orangtua hanya lihat anaknya
  const ortu = await db.guardian.findFirst({ where: { user: { email: 'orangtua@orchid.local' } }, include: { studentGuardians: true } })
  console.log('PARENT-ACCESS: anak terhubung =', ortu?.studentGuardians.length)
  await db.$disconnect()
}
main()
