/* TK Orchid — Seed demo. Semua data ditandai DEMO di notes. */
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'

const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' }) })

function d(s: string) { return new Date(s) }
function addDays(base: Date, n: number) { const x = new Date(base); x.setDate(x.getDate() + n); return x }
function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }

const DEMO = 'DEMO'

async function main() {
  console.log('Seeding TK Orchid demo data...')

  // Reset urut aman (FK on)
  await db.paymentAllocation.deleteMany()
  await db.payment.deleteMany()
  await db.invoiceItem.deleteMany()
  await db.invoice.deleteMany()
  await db.expense.deleteMany()
  await db.feeType.deleteMany()
  await db.developmentItem.deleteMany()
  await db.developmentReport.deleteMany()
  await db.assessment.deleteMany()
  await db.assessmentDomain.deleteMany()
  await db.assessmentScale.deleteMany()
  await db.attendance.deleteMany()
  await db.schedule.deleteMany()
  await db.enrollment.deleteMany()
  await db.studentGuardian.deleteMany()
  await db.admissionDocument.deleteMany()
  await db.admission.deleteMany()
  await db.admissionPeriod.deleteMany()
  await db.announcementRead.deleteMany()
  await db.announcement.deleteMany()
  await db.activityMedia.deleteMany()
  await db.activity.deleteMany()
  await db.class.deleteMany()
  await db.academicYear.deleteMany()
  await db.student.deleteMany()
  await db.guardian.deleteMany()
  await db.teacher.deleteMany()
  await db.passwordResetToken.deleteMany()
  await db.auditLog.deleteMany()
  await db.user.deleteMany()

  // ---- Users ----
  const pass = await bcrypt.hash('demo1234', 12)
  const admin = await db.user.create({ data: { name: 'Admin Demo (DEMO)', email: 'admin@orchid.local', passwordHash: pass, role: 'ADMIN' } })
  const staff = await db.user.create({ data: { name: 'Staff Demo (DEMO)', email: 'staff@orchid.local', passwordHash: pass, role: 'STAFF' } })
  const guru1User = await db.user.create({ data: { name: 'Guru Satu (DEMO)', email: 'guru1@orchid.local', passwordHash: pass, role: 'TEACHER' } })
  const guru2User = await db.user.create({ data: { name: 'Guru Dua (DEMO)', email: 'guru2@orchid.local', passwordHash: pass, role: 'TEACHER' } })
  const ortu1User = await db.user.create({ data: { name: 'Orang Tua Demo (DEMO)', email: 'orangtua@orchid.local', passwordHash: pass, role: 'PARENT' } })

  // ---- Teachers ----
  const guru1 = await db.teacher.create({ data: { userId: guru1User.id, employeeCode: 'G-001', fullName: 'Guru Satu (DEMO)', phone: '081200000001', joinDate: d('2023-07-17') } })
  const guru2 = await db.teacher.create({ data: { userId: guru2User.id, employeeCode: 'G-002', fullName: 'Guru Dua (DEMO)', phone: '081200000002', joinDate: d('2024-07-15') } })

  // ---- Academic year & classes ----
  const ay = await db.academicYear.create({
    data: { name: '2026/2027', startDate: d('2026-07-13'), endDate: d('2027-06-30'), status: 'ACTIVE' },
  })
  const kelasA = await db.class.create({
    data: { academicYearId: ay.id, code: 'KA', name: 'Kelompok A (DEMO)', level: 'Kelompok A', room: 'Ruang A', teacherId: guru1.id, capacity: 20 },
  })
  const kelasB = await db.class.create({
    data: { academicYearId: ay.id, code: 'KB', name: 'Kelompok B (DEMO)', level: 'Kelompok B', room: 'Ruang B', teacherId: guru2.id, capacity: 20 },
  })

  // ---- Guardians + parent user link ----
  const waliOrtu = await db.guardian.create({
    data: { userId: ortu1User.id, fullName: 'Orang Tua Demo (DEMO)', relationship: 'AYAH', phone: '081200000010', email: 'orangtua@orchid.local', address: 'Alamat Demo Bekasi' },
  })
  const waliLain = Array.from({ length: 5 }, (_, i) => ({
    fullName: `Wali Demo ${i + 2} (DEMO)`, relationship: i % 2 === 0 ? 'IBU' : 'AYAH',
    phone: `08120000002${i}`, email: `wali${i + 2}@demo.local`, address: 'Alamat Demo Bekasi',
  }))
  const guardianRows = []
  for (const w of waliLain) guardianRows.push(await db.guardian.create({ data: w }))

  // ---- Students (10) ----
  const namaSiswa = [
    ['Adinda Putri (DEMO)', 'P'], ['Bagas Pratama (DEMO)', 'L'], ['Citra Lestari (DEMO)', 'P'],
    ['Dimas Saputra (DEMO)', 'L'], ['Elsa Maharani (DEMO)', 'P'], ['Fajar Nugroho (DEMO)', 'L'],
    ['Gita Anggraini (DEMO)', 'P'], ['Hafiz Rahman (DEMO)', 'L'], ['Intan Permata (DEMO)', 'P'], ['Joko Anwar (DEMO)', 'L'],
  ]
  const students = []
  for (let i = 0; i < namaSiswa.length; i++) {
    const [nama, g] = namaSiswa[i]
    const s = await db.student.create({
      data: {
        studentCode: `STD-2026-${String(i + 1).padStart(3, '0')}`,
        nis: `26${String(i + 1).padStart(4, '0')}`,
        fullName: nama,
        gender: g,
        birthPlace: 'Bekasi',
        birthDate: d(`202${1 + (i % 2)}-0${(i % 8) + 1}-1${i % 9}`),
        address: 'Alamat Demo Bekasi',
        city: 'Kota Bekasi', province: 'Jawa Barat',
        status: 'ACTIVE', admissionDate: d('2026-07-13'),
        notes: DEMO,
      },
    })
    students.push(s)
    // enrollment
    await db.enrollment.create({
      data: { studentId: s.id, academicYearId: ay.id, classId: i < 5 ? kelasA.id : kelasB.id, enrollmentDate: d('2026-07-13'), status: 'ACTIVE', notes: DEMO },
    })
    // guardians: siswa 0 linked ke waliOrtu; lainnya merata; beberapa share guardian
    if (i === 0) {
      await db.studentGuardian.create({ data: { studentId: s.id, guardianId: waliOrtu.id, isPrimary: true, canPickup: true } })
    } else {
      const g1 = guardianRows[(i - 1) % guardianRows.length]
      await db.studentGuardian.create({ data: { studentId: s.id, guardianId: g1.id, isPrimary: true, canPickup: true } })
      if (i % 3 === 0 && guardianRows.length > 1) {
        const g2 = guardianRows[(i) % guardianRows.length]
        await db.studentGuardian.create({ data: { studentId: s.id, guardianId: g2.id, isPrimary: false, canPickup: false } })
      }
    }
  }

  // ---- Attendance: 30 hari kerja terakhir (Senin-Jumat), semua siswa, mayoritas PRESENT ----
  let day = 0
  for (let off = 29; off >= 0; off--) {
    const date = addDays(new Date(), -off)
    const dow = date.getDay()
    if (dow === 0 || dow === 6) continue
    day++
    for (let i = 0; i < students.length; i++) {
      let status = 'PRESENT'
      const r = (day * 31 + i * 7) % 20
      if (r === 3) status = 'SICK'
      else if (r === 7) status = 'PERMISSION'
      else if (r === 11) status = 'ABSENT'
      await db.attendance.create({
        data: { studentId: students[i].id, classId: i < 5 ? kelasA.id : kelasB.id, attendanceDate: date, status, recordedBy: admin.id, note: DEMO },
      })
    }
  }

  // ---- Assessment domains & scales ----
  const domains = ['Nilai Agama dan Moral', 'Fisik Motorik', 'Kognitif', 'Bahasa', 'Sosial Emosional', 'Seni', 'Kemandirian']
  const domainIds = []
  for (let i = 0; i < domains.length; i++) {
    const dom = await db.assessmentDomain.create({ data: { name: domains[i], sortOrder: i, description: DEMO } })
    domainIds.push(dom.id)
  }
  const scales = [['BB', 'Belum Berkembang'], ['MB', 'Mulai Berkembang'], ['BSH', 'Berkembang Sesuai Harapan'], ['BSB', 'Berkembang Sangat Baik']]
  const scaleIds = []
  for (let i = 0; i < scales.length; i++) scaleIds.push((await db.assessmentScale.create({ data: { code: scales[i][0], label: scales[i][1], sortOrder: i } })).id)

  // ---- Assessments 2 periode untuk beberapa siswa kelas A ----
  const periodeList = ['Semester 1', 'Semester 2']
  for (const period of periodeList) {
    for (let i = 0; i < 5; i++) {
      for (let di = 0; di < domains.length; di++) {
        await db.assessment.create({
          data: {
            studentId: students[i].id, academicYearId: ay.id, classId: kelasA.id,
            domainId: domainIds[di], scaleId: scaleIds[(i + di) % 4],
            period, narrative: `Capaian demo ${domains[di]} ${period}. ${DEMO}`,
            teacherNote: DEMO, createdBy: guru1User.id,
          },
        })
      }
    }
  }

  // ---- Development reports: 3 (2 published, 1 draft) ----
  const repSpecs = [
    [0, 'Semester 1', 'PUBLISHED'], [1, 'Semester 1', 'REVIEW'], [2, 'Semester 1', 'DRAFT'],
  ] as const
  let repSeq = 0
  for (const [idx, period, status] of repSpecs) {
    repSeq++
    const report = await db.developmentReport.create({
      data: {
        reportNo: `RPT/ORCHID/2026/${String(repSeq).padStart(4, '0')}`,
        studentId: students[idx].id, academicYearId: ay.id, classId: idx < 5 ? kelasA.id : kelasB.id,
        period, summary: `Ringkasan perkembangan demo untuk ${students[idx].fullName}. ${DEMO}`,
        homeRecommendation: 'Rekomendasi stimulasi demo. ' + DEMO,
        attendanceSummary: 'Kehadiran demo baik. ' + DEMO,
        status, createdBy: guru1User.id, teacherId: guru1.id,
        publishedBy: status === 'PUBLISHED' ? admin.id : null,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
    })
    for (let di = 0; di < domains.length; di++) {
      await db.developmentItem.create({
        data: { reportId: report.id, domainId: domainIds[di], scaleId: scaleIds[di % 4], narrative: `Narasi demo ${domains[di]}. ${DEMO}`, sortOrder: di },
      })
    }
  }

  // ---- Schedules ----
  const jadwal = [
    ['07:30', '08:00', 'Penyambutan & Baris'], ['08:00', '09:00', 'Kegiatan Inti'],
    ['09:00', '09:30', 'Istirahat'], ['09:30', '10:30', 'Bermain Bebas Terbimbing'],
  ]
  for (let dow = 1; dow <= 5; dow++) {
    for (const cls of [kelasA, kelasB]) {
      for (const [st, en, act] of jadwal) {
        await db.schedule.create({
          data: { classId: cls.id, dayOfWeek: dow, startTime: st, endTime: en, activity: `${act} (${DEMO})`, teacherId: cls.id === kelasA.id ? guru1.id : guru2.id, room: cls.room },
        })
      }
    }
  }

  // ---- Activities (5) ----
  const acts = [
    ['Upacara Bendera', 'PUBLIC', 'PUBLISHED'], ['Manasik Haji Anak', 'PUBLIC', 'PUBLISHED'],
    ['Outing Class ke Kebun', 'PARENT_ONLY', 'PUBLISHED'], ['Pemeriksaan Kesehatan', 'INTERNAL', 'PUBLISHED'],
    ['Pentas Seni Akhir Tahun', 'PUBLIC', 'DRAFT'],
  ]
  for (let i = 0; i < acts.length; i++) {
    const [title, vis, stat] = acts[i]
    await db.activity.create({
      data: {
        title: `${title} (DEMO)`, slug: slugify(title) + '-' + (i + 1),
        description: `Deskripsi kegiatan demo: ${title}. ${DEMO}`,
        startDatetime: addDays(new Date(), 3 + i * 5), endDatetime: addDays(new Date(), 3 + i * 5),
        location: 'Lokasi Demo', visibility: vis, status: stat, createdBy: staff.id,
      },
    })
  }

  // ---- Announcements (5) ----
  const anns = [
    ['Libur Nasional', 'PUBLIC', 'PUBLISHED'], ['Rapat Orang Tua', 'ALL_PARENTS', 'PUBLISHED'],
    ['Info Gizi Bulanan', 'ALL_PARENTS', 'PUBLISHED'], ['Briefing Guru', 'TEACHERS', 'PUBLISHED'],
    ['Pengumuman PPDB', 'PUBLIC', 'PUBLISHED'],
  ]
  for (let i = 0; i < anns.length; i++) {
    const [title, aud, stat] = anns[i]
    await db.announcement.create({
      data: {
        title: `${title} (DEMO)`, slug: slugify(title) + '-' + (i + 1),
        content: `Isi pengumuman demo: ${title}. Konten profil sekolah dapat diubah dari menu Pengaturan. ${DEMO}`,
        audience: aud, status: stat, publishAt: addDays(new Date(), -i), createdBy: admin.id,
      },
    })
  }

  // ---- Fee types ----
  const fees = [
    ['SPP', 'SPP/Biaya Bulanan', 350000, true], ['KEG', 'Uang Kegiatan', 50000, false],
    ['SRG', 'Seragam', 150000, false], ['BPK', 'Buku/Perlengkapan', 120000, false],
    ['PDR', 'Pendaftaran', 200000, false],
  ] as const
  const feeIds: Record<string, number> = {}
  for (const [code, name, amt, rec] of fees) {
    feeIds[code] = (await db.feeType.create({ data: { code, name, defaultAmount: amt, recurring: rec, description: DEMO } })).id
  }

  // ---- Invoices: mix unpaid/partial/paid per siswa pertama 6 ----
  let invSeq = 0
  const now = new Date()
  for (let i = 0; i < 6; i++) {
    invSeq++
    const issue = d(`2026-07-${String(5 + i).padStart(2, '0')}`)
    const due = d(`2026-07-${String(25 + (i % 3)).padStart(2, '0')}`)
    const inv = await db.invoice.create({
      data: {
        invoiceNo: `INV/ORCHID/2026/07/${String(invSeq).padStart(4, '0')}`,
        studentId: students[i].id, academicYearId: ay.id,
        issueDate: issue, dueDate: due, status: 'ISSUED', createdBy: staff.id, notes: DEMO,
      },
    })
    await db.invoiceItem.create({
      data: { invoiceId: inv.id, feeTypeId: feeIds.SPP, description: `SPP Juli ${DEMO}`, quantity: 1, unitAmount: 350000, subtotal: 350000 },
    })
    await db.invoiceItem.create({
      data: { invoiceId: inv.id, feeTypeId: feeIds.KEG, description: `Uang Kegiatan Juli ${DEMO}`, quantity: 1, unitAmount: 50000, subtotal: 50000 },
    })
    // payment mix
    if (i % 3 === 0) {
      // PAID full
      const pay = await db.payment.create({
        data: {
          receiptNo: `RCT/ORCHID/2026/${String(invSeq).padStart(4, '0')}`,
          studentId: students[i].id, paymentDate: addDays(due, -3), amount: 400000, method: 'TRANSFER',
          referenceNo: `TRX-DEMO-${invSeq}`, recordedBy: staff.id, note: DEMO,
        },
      })
      await db.paymentAllocation.create({ data: { paymentId: pay.id, invoiceId: inv.id, amount: 400000 } })
      await db.invoice.update({ where: { id: inv.id }, data: { status: 'PAID' } })
    } else if (i % 3 === 1) {
      // PARTIAL 250rb dari 400rb
      const pay = await db.payment.create({
        data: {
          receiptNo: `RCT/ORCHID/2026/${String(invSeq).padStart(4, '0')}P`,
          studentId: students[i].id, paymentDate: addDays(due, -1), amount: 250000, method: 'CASH',
          recordedBy: staff.id, note: DEMO,
        },
      })
      await db.paymentAllocation.create({ data: { paymentId: pay.id, invoiceId: inv.id, amount: 250000 } })
      await db.invoice.update({ where: { id: inv.id }, data: { status: 'PARTIAL' } })
    } // else tetap ISSUED/unpaid
    void now
  }

  // ---- Expenses (5) ----
  const exps = [
    ['Operasional', 'Belanja ATK'], ['Konsumsi', 'Konsumsi rapat guru'], ['Utilitas', 'Listrik dan air'],
    ['Perawatan', 'Servis AC kelas'], ['Kegiatan', 'Alat peraga outbond'],
  ] as const
  for (let i = 0; i < exps.length; i++) {
    const [cat, desc] = exps[i]
    await db.expense.create({
      data: {
        expenseNo: `EXP/ORCHID/2026/${String(i + 1).padStart(4, '0')}`,
        expenseDate: addDays(now, -(i * 3 + 1)), category: cat, description: `${desc} ${DEMO}`,
        amount: 150000 + i * 75000, vendor: `Vendor Demo ${i + 1}`, paymentMethod: i % 2 ? 'TRANSFER' : 'CASH',
        status: 'POSTED', createdBy: staff.id,
      },
    })
  }

  // ---- Admission period + admissions ----
  const ap = await db.admissionPeriod.create({
    data: {
      name: 'PPDB 2026/2027 Gelombang 1 (DEMO)', startDate: d('2026-04-01'), endDate: d('2026-06-30'),
      isActive: false, requirementsText: 'Akta kelahiran, KK, foto 3x4. ' + DEMO,
    },
  })
  const ap2 = await db.admissionPeriod.create({
    data: {
      name: 'PPDB 2027/2028 Gelombang 1 (DEMO)', startDate: d('2027-01-05'), endDate: d('2027-03-31'),
      isActive: true, requirementsText: 'Akta kelahiran, KK, foto 3x4, KTP orang tua. ' + DEMO,
    },
  })
  const admSpecs = [
    ['Kandidat Satu (DEMO)', 'SUBMITTED'], ['Kandidat Dua (DEMO)', 'REVIEW'],
    ['Kandidat Tiga (DEMO)', 'ACCEPTED'], ['Kandidat Empat (DEMO)', 'REJECTED'],
    ['Kandidat Lima (DEMO)', 'ENROLLED'],
  ] as const
  for (let i = 0; i < admSpecs.length; i++) {
    const [nm, st] = admSpecs[i]
    await db.admission.create({
      data: {
        applicationNo: `APP/ORCHID/2026/${String(i + 1).padStart(4, '0')}`,
        admissionPeriodId: i < 3 ? ap.id : ap2.id,
        studentFullName: nm, studentGender: i % 2 ? 'P' : 'L',
        studentBirthPlace: 'Bekasi', studentBirthDate: d('2021-0' + ((i % 9) + 1) + '-15'),
        guardianName: `Wali ${nm}`, guardianRelationship: 'IBU', guardianPhone: '08130000000' + i,
        guardianEmail: `wali.kandidat${i + 1}@demo.local`, preferredLevel: 'Kelompok A',
        status: st, submittedAt: addDays(now, -(i + 2)),
        reviewedBy: st !== 'SUBMITTED' ? admin.id : null,
        reviewedAt: st !== 'SUBMITTED' ? addDays(now, -(i + 1)) : null,
        rejectionReason: st === 'REJECTED' ? 'Data tidak lengkap (demo)' : null,
        notes: DEMO,
      },
    })
  }

  // ---- Announcement reads contoh ----
  const firstAnn = await db.announcement.findFirst({ orderBy: { id: 'asc' } })
  if (firstAnn) await db.announcementRead.create({ data: { announcementId: firstAnn.id, userId: ortu1User.id } })

  // ---- Audit log contoh ----
  await db.auditLog.create({
    data: { userId: admin.id, action: 'SEED_DEMO_DATA', entityType: 'SYSTEM', afterJson: JSON.stringify({ seeded: true }), ipAddress: '127.0.0.1' },
  })

  const counts = {
    users: await db.user.count(), students: await db.student.count(),
    attendances: await db.attendance.count(), invoices: await db.invoice.count(),
    payments: await db.payment.count(), assessments: await db.assessment.count(),
  }
  console.log('Seed done:', counts)
  await db.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
