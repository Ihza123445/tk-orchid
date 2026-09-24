import { IMG } from '@/lib/assets/public-images'

// Konten awal website. Dipakai untuk:
// 1) nilai default pengaturan situs bila belum pernah disimpan dari admin,
// 2) data awal tabel konten (migrasi 20260924125732_cms_content).
// Setelah itu seluruh konten dikelola dari admin › Website.

export const DEFAULT_SETTINGS = {
  schoolName: 'TK Orchid',
  tagline: 'Tumbuh dengan bahagia',
  address: 'Kota Bekasi, Jawa Barat',
  email: 'info@tk-orchid.sch.id',
  whatsapp: '6281234567890',
  hours: 'Senin–Jumat · 07.30–15.00 WIB',
  mapQuery: 'Bekasi, Jawa Barat',
  topbarText: 'Penerimaan peserta didik baru TK Orchid telah dibuka',
  footerText: 'Rumah belajar yang membantu anak mengenal dirinya, menyayangi sesama, dan berani menjelajah dunia.',
  instagram: '',
  facebook: '',
  youtube: '',
  principalName: 'Ibu Kepala Sekolah',
  principalRole: 'Kepala TK Orchid',
  principalImage: IMG.galeri2,
  principalQuote:
    'Tugas terpenting kami bukan membuat anak cepat bisa, melainkan membuat anak senang belajar. Dari rasa senang itulah keberanian, kemandirian, dan rasa ingin tahu tumbuh dengan sendirinya.',
}

export type SiteSettings = typeof DEFAULT_SETTINGS
export type SiteSettingKey = keyof SiteSettings

export const DEFAULT_HERO_SLIDES = [
  { eyebrow: 'Sekolah pertama yang terasa seperti rumah', title: 'Tempat si kecil', accent: 'tumbuh bahagia.', description: 'Belajar melalui bermain, bergerak, berkarya, dan berteman dalam lingkungan yang hangat, aman, dan penuh perhatian.', image: IMG.hero1, imageAlt: 'Anak tersenyum saat mengikuti kegiatan kreatif' },
  { eyebrow: 'Kurikulum Merdeka untuk anak usia dini', title: 'Setiap rasa ingin tahu', accent: 'punya ruang.', description: 'Guru mendampingi anak menemukan jawaban lewat cerita, proyek sederhana, seni, musik, dan pengalaman sehari-hari.', image: IMG.programTematik, imageAlt: 'Guru mendampingi anak-anak belajar bersama' },
  { eyebrow: 'Penerimaan murid baru TK Orchid', title: 'Awal yang hangat untuk', accent: 'masa depan cerah.', description: 'Kenali program kami, jadwalkan kunjungan, lalu pilih langkah belajar terbaik untuk putra-putri Anda.', image: IMG.programSeni, imageAlt: 'Anak-anak tertawa dan berekspresi bersama' },
]

export const DEFAULT_FACILITIES = [
  { title: 'Ruang kelas tematik', description: 'Meja dan area bermain mudah diatur ulang untuk proyek individu maupun kelompok.', image: IMG.programTematik },
  { title: 'Area bermain aktif', description: 'Anak berlari, melompat, dan melatih koordinasi tubuh dengan leluasa.', image: IMG.galeri1 },
  { title: 'Pojok literasi', description: 'Ruang tenang untuk membaca gambar, mendengar cerita, dan bercakap.', image: IMG.galeri2 },
  { title: 'Studio seni', description: 'Area eksplorasi cat, tekstur, bentuk, dan bahan-bahan terbuka.', image: IMG.galeri3 },
  { title: 'Ruang musik & gerak', description: 'Tempat anak mengenal irama, suara, ekspresi, dan gerakan.', image: IMG.programSeni },
  { title: 'Sentra bermain konstruktif', description: 'Balok dan permainan manipulatif untuk melatih nalar serta imajinasi ruang.', image: IMG.hero2 },
]

export const DEFAULT_GALLERY = [
  { image: IMG.hero1, title: 'Hari ekspresi & face painting', category: 'Acara' },
  { image: IMG.programTematik, title: 'Belajar tematik bersama guru', category: 'Kelas' },
  { image: IMG.galeri1, title: 'Berlari di area bermain', category: 'Bermain' },
  { image: IMG.galeri3, title: 'Menghias batu warna-warni', category: 'Seni' },
  { image: IMG.hero2, title: 'Membangun menara balok', category: 'Bermain' },
  { image: IMG.berita, title: 'Melukis poster bersama', category: 'Seni' },
  { image: IMG.hero3, title: 'Suasana kelas pagi hari', category: 'Kelas' },
  { image: IMG.programSeni, title: 'Pentas akhir semester', category: 'Acara' },
  { image: IMG.galeri2, title: 'Pojok baca bersama keluarga', category: 'Kelas' },
]

export const DEFAULT_TESTIMONIALS = [
  { name: 'Bunda Alya', relation: 'Orang tua murid TK B', quote: 'Anak saya yang dulu pemalu sekarang berani bercerita di depan kelas. Gurunya sabar sekali dan selalu memberi kabar perkembangan.' },
  { name: 'Ayah Raka', relation: 'Orang tua murid TK A', quote: 'Laporan perkembangan lewat portal sangat membantu. Kami tahu apa yang dipelajari anak dan bisa melanjutkannya di rumah.' },
  { name: 'Mama Kinan', relation: 'Orang tua murid Kelompok Bermain', quote: 'Minggu pertama Kinan menangis, minggu kedua ia justru tidak mau pulang. Suasana sekolahnya hangat seperti rumah.' },
  { name: 'Bunda Zahra', relation: 'Orang tua alumni', quote: 'Zahra masuk SD dengan percaya diri, mandiri, dan senang membaca. Bekal dari TK Orchid terasa sekali.' },
  { name: 'Papa Gibran', relation: 'Orang tua murid TK B', quote: 'Kegiatan market day dan field trip-nya seru. Anak belajar berhitung dan berani berinteraksi tanpa merasa sedang belajar.' },
]

export const DEFAULT_FAQS = [
  { question: 'Berapa usia minimal untuk mendaftar?', answer: 'Kelompok Bermain menerima anak usia 3 tahun, TK A usia 4 tahun, dan TK B usia 5 tahun per 1 Juli tahun ajaran berjalan.', category: 'Pendaftaran' },
  { question: 'Apakah bisa berkunjung sebelum mendaftar?', answer: 'Sangat bisa. Hubungi kami melalui WhatsApp untuk menjadwalkan kunjungan sekolah dan trial class gratis bersama si kecil.', category: 'Pendaftaran' },
  { question: 'Dokumen apa saja yang perlu disiapkan?', answer: 'Fotokopi akta kelahiran, kartu keluarga, KTP orang tua, pas foto anak, dan catatan kesehatan/imunisasi bila ada.', category: 'Pendaftaran' },
  { question: 'Kurikulum apa yang digunakan?', answer: 'Kurikulum Merdeka PAUD yang diterjemahkan menjadi pembelajaran tematik berbasis bermain, proyek sederhana, dan pembiasaan karakter.', category: 'Pembelajaran' },
  { question: 'Berapa jumlah anak dalam satu kelas?', answer: 'Kami menjaga kelas tetap kecil: maksimal 12 anak untuk Kelompok Bermain dan 15 anak untuk TK A/B, dengan dua pendamping per kelas.', category: 'Pembelajaran' },
  { question: 'Apakah anak diajari membaca dan menulis?', answer: 'Literasi dan numerasi awal dikenalkan secara bertahap dan menyenangkan sesuai kesiapan anak, tanpa paksaan dan tanpa drilling.', category: 'Pembelajaran' },
  { question: 'Bagaimana orang tua memantau perkembangan anak?', answer: 'Melalui portal keluarga TK Orchid: presensi, laporan perkembangan, pengumuman, dan tagihan dapat diakses kapan saja.', category: 'Keluarga' },
  { question: 'Apakah tersedia antar-jemput atau katering?', answer: 'Informasi layanan tambahan dapat ditanyakan langsung ke kantor sekolah karena menyesuaikan kebutuhan tiap tahun ajaran.', category: 'Keluarga' },
  { question: 'Bagaimana sistem pembayaran biaya sekolah?', answer: 'Tagihan diterbitkan melalui sistem sekolah dan dapat dipantau di portal keluarga. Rincian biaya dijelaskan saat konsultasi pendaftaran.', category: 'Keluarga' },
]
