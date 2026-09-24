// Seed dummy lengkap untuk halaman public: kegiatan + pengumuman realistis
// Jalankan: node scripts/seed-public-dummy.js
const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')

const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' }) })

const U = (id, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

const activities = [
  {
    title: 'Manasik Haji Anak',
    slug: 'manasik-haji-anak-2026',
    description:
      'Kegiatan manasik haji anak merupakan wahana pembelajaran ibrah yang menyenangkan. Anak-anak mengenal tata cara wukuf, mabit, melempar jumrah mini, hingga menyembelih secara simbolik menggunakan alat peraga.\n\nSelain melatih motorik halus dan kerja sama, kegiatan ini menumbuhkan nilai toleransi dan kebanggaan terhadap ibadah sejak dini.',
    location: 'Halaman & Aula TK Orchid',
    daysAgo: 5,
    cover: 'photo-1544776193-352d25ca82cd',
  },
  {
    title: 'Upacara Bendera & Peringatan Kemerdekaan',
    slug: 'upacara-bendera-17an-2026',
    description:
      'Dalam ranga HUT ke-81 Kemerdekaan RI, seluruh siswa mengikuti upacara bendera dengan penuh semangat. Acara dilanjutkan dengan lomba antar kelas: balap karung, makan kerupuk, dan estafet air.\n\nNilai yang ditanamkan: cinta tanah air, sportivitas, dan keberanian tampil di depan umum.',
    location: 'Lapangan Sekolah',
    daysAgo: 12,
    cover: 'photo-1580582932707-520aed937b7b',
  },
  {
    title: 'Field Trip: Mengunjungi Kebun Binatang',
    slug: 'field-trip-kebun-binatang-2026',
    description:
      'Siswa Kelompok B belajar mengenal satwaa secara langsung di kebun binatang. Mereka mengamati warna, suara, dan gerak hewan sambil mengisi lembar observasi bergambar.\n\nField trip tahun ini diikuti 40 siswa didampingi 8 guru dan perawat. Transportasi bus wisata dilengkapi sabuk pengaman dan pendamping per 5 anak.',
    location: 'Kebun Binatang Ragunan, Jakarta',
    daysAgo: 20,
    cover: 'photo-1503676260728-1c00da094a0b',
  },
  {
    title: 'Festival Seni & Tari Tahunan',
    slug: 'festival-seni-tari-2026',
    description:
      'Puncak pembelajaran seni semester ini ditampilkan dalam festival tari daerah. Setiap kelas menampilkan satu tari tradisional: Saman mini, Kecer, dan Tari Topi dari Sulawesi.\n\nPanggung dibuka untuk orang tua — ratusan penonton memenuhi aula. Anak-anak belajar kepercayaan diri, disiplin latihan, dan menghargai budaya Nusantara.',
    location: 'Aula Serbaguna',
    daysAgo: 30,
    cover: 'photo-1607453998774-d533f65dac99',
  },
  {
    title: 'Kelas Masak Sehat: Salad Buah Warna-Warni',
    slug: 'kelas-masak-salad-buah-2026',
    description:
      'Belajar matematika lewat memotong buah? Bisa! Anak-anak menghitung, menimbang, dan membagi porsi salad buah buatan sendiri.\n\nKegiatan praktik langsung ini melatih motorik halus, pengenalan warna dan bentuk, serta pola makan sehat sejak dini.',
    location: 'Dapur Praktik TK',
    daysAgo: 42,
    cover: 'photo-1571210862729-78a52d3779a2',
  },
  {
    title: 'Program Gerakan Membaca "Pojok Buku Ceria"',
    slug: 'pojok-buku-ceria-2026',
    description:
      'Setiap Jumat, pojok buku sekolah dibuka untuk program 15 menit membaca bersama. Anak-anak memilih buku cerita bergambar favoritnya, dibimbing guru atau kakak kelas.\n\nOrang tua juga bisa berpartisipasi menjadi pembaca tamu — tertarik? Hubungi wali kelas!',
    location: 'Perpustakaan Mini',
    daysAgo: 55,
    cover: 'photo-1516627145497-ae6968895b74',
  },
]

const announcements = [
  {
    title: 'Pendaftaran PPDB Gelombang II Resmi Dibuka',
    content:
      'Assalamualaikum wr. wb.\n\nDengan bangga kami informasikan bahwa PPDB TK Orchid Gelombang II Tahun Ajaran 2026/2027 resmi dibuka mulai 1 September 2026.\n\nKuota tersedia:\n• Kelompok A (4–5 tahun): 12 kursi\n• Kelompok B (5–6 tahun): 8 kursi\n\nPendaftaran sepenuhnya online melalui menu PPDB di situs ini. Kuota terbatas, siapa cepat dia dapat!\n\nWassalamualaikum wr. wb.',
    audience: 'PUBLIC',
    daysAgo: 2,
  },
  {
    title: 'Libur Nasional: Cuti Bersama Idul Fitri',
    content:
      'Diberitahukan kepada seluruh orang tua/wali, bahwa kegiatan belajar diliburkan pada 20–21 Maret 2026 bertepatan dengan cuti bersama Idul Fitri 1447 H.\n\nKegiatan belajar kembali normal pada hari Selasa, 24 Maret 2026. Mohon perhatiannya.',
    audience: 'PUBLIC',
    daysAgo: 6,
  },
  {
    title: 'Pemotongan Rambut Gratis Siswa Laki-Laki',
    content:
      'Dalam rangka menjaga kerapian dan kesehatan kulit kepala siswa, sekolah bekerja sama dengan komunitas pangkas rambut menyelenggarakan potong rambut GRATIS untuk semua siswa laki-laki.\n\nWaktu: Sabtu, 30 Agustus 2026, pukul 08.00–11.00 WIB.\nTempat: Aula TK Orchid.\n\nMohon anak didampingi orang tua. Kuasa tidak dipungut biaya.',
    audience: 'PUBLIC',
    daysAgo: 9,
  },
  {
    title: 'Rapat Orang Tua: Program Semester Ganjil',
    content:
      'Mengundang seluruh orang tua/wali peserta didik hadir dalam rapat program semester ganjil:\n\n📅 Sabtu, 6 September 2026\n🕘 09.00 – 11.00 WIB\n📍 Aula TK Orchid\n\nAgenda: kalender pembelajaran, program unggulan, dan silaturahmi antar orang tua. Kehadiran sangat diharapkan.',
    audience: 'PUBLIC',
    daysAgo: 14,
  },
  {
    title: 'Pengumuman Hasil Seleksi PPDB Gelombang I',
    content:
      'Puji syukur, seleksi PPDB Gelombang I telah selesai. Seluruh calon peserta didik yang mendaftar pada gelombang ini dinyatakan DITERIMA.\n\nSurat pemberitahuan dapat diambil di kantor sekolah atau dikirim via WhatsApp. Daftar ulang dilakukan paling lambat 10 September 2026.\n\nSelamat bergabung dengan keluarga besar TK Orchid! 🌸',
    audience: 'PUBLIC',
    daysAgo: 21,
  },
]

async function main() {
  const adminId = 1
  let aCount = 0
  for (const a of activities) {
    const start = new Date(Date.now() - a.daysAgo * 24 * 60 * 60 * 1000)
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000)
    await db.activity.upsert({
      where: { slug: a.slug },
      update: {
        title: a.title,
        description: a.description,
        startDatetime: start,
        endDatetime: end,
        location: a.location,
        coverImage: U(a.cover),
        visibility: 'PUBLIC',
        status: 'PUBLISHED',
      },
      create: {
        title: a.title,
        slug: a.slug,
        description: a.description,
        startDatetime: start,
        endDatetime: end,
        location: a.location,
        coverImage: U(a.cover),
        visibility: 'PUBLIC',
        status: 'PUBLISHED',
        createdBy: adminId,
      },
    })
    aCount++
  }

  let nCount = 0
  for (const n of announcements) {
    const slug = `pengumuman-${n.daysAgo}-hari-lalu`
    const publishAt = new Date(Date.now() - n.daysAgo * 24 * 60 * 60 * 1000)
    await db.announcement.upsert({
      where: { slug },
      update: { title: n.title, content: n.content, publishAt, status: 'PUBLISHED', audience: n.audience },
      create: { title: n.title, slug, content: n.content, publishAt, status: 'PUBLISHED', audience: n.audience, createdBy: adminId },
    })
    nCount++
  }

  console.log(`seeded: ${aCount} kegiatan, ${nCount} pengumuman`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
