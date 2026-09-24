import { Armchair, Bath, BookOpenCheck, Cctv, ChefHat, Droplets, HeartPulse, Languages, Library, Music2, Palette, Trees, UtensilsCrossed, Volleyball } from 'lucide-react'

// Konten statis situs publik yang jarang berubah.
// Konten yang sering diganti (slider, galeri, fasilitas, testimoni, FAQ, kontak, sambutan)
// dikelola dari admin › Website dan dibaca lewat src/lib/cms/content.ts.

export const whatsappLink = (number: string, text = 'Halo TK Orchid, saya ingin bertanya tentang pendaftaran.') =>
  `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`

// `slug` = kode jenjang di src/lib/ppdb/levels.ts (dipakai untuk memilihkan jenjang di formulir PPDB)
export const LEVELS: { name: string; slug: string; age: string; tone: 'purple' | 'gold' | 'pink'; body: string; points: string[] }[] = [
  { name: 'Kelompok Bermain', slug: 'kb', age: '3–4 tahun', tone: 'purple', body: 'Mengenal sekolah dengan nyaman: rutinitas, bermain bersama, dan kemandirian dasar.', points: ['3 hari/minggu', 'Maks. 12 anak/kelas', '2 pendamping'] },
  { name: 'TK A', slug: 'tk-a', age: '4–5 tahun', tone: 'gold', body: 'Eksplorasi tematik, bahasa, motorik, dan sosial emosional lewat proyek sederhana.', points: ['5 hari/minggu', 'Maks. 15 anak/kelas', 'Proyek tematik'] },
  { name: 'TK B', slug: 'tk-b', age: '5–6 tahun', tone: 'pink', body: 'Kesiapan sekolah dasar yang menyenangkan: literasi, numerasi awal, dan rasa percaya diri.', points: ['5 hari/minggu', 'Maks. 15 anak/kelas', 'Transisi ke SD'] },
]

export const SUPPORT_FACILITIES = [
  { icon: HeartPulse, title: 'UKS', body: 'Pertolongan pertama & cek kesehatan berkala' },
  { icon: Library, title: 'Perpustakaan', body: 'Buku cerita bergambar pilihan' },
  { icon: Droplets, title: 'Wastafel anak', body: 'Tempat cuci tangan setinggi anak' },
  { icon: Bath, title: 'Toilet anak', body: 'Bersih, aman, dan ukuran anak' },
  { icon: Cctv, title: 'CCTV', body: 'Area sekolah terpantau' },
  { icon: Trees, title: 'Taman & kebun', body: 'Menanam dan mengamati alam' },
  { icon: UtensilsCrossed, title: 'Ruang makan', body: 'Makan bersama & cooking class' },
  { icon: Armchair, title: 'Ruang tunggu', body: 'Nyaman untuk orang tua' },
]

export const EXTRACURRICULAR = [
  { icon: Languages, title: 'English Fun', body: 'Lagu, cerita, dan permainan berbahasa Inggris.' },
  { icon: Music2, title: 'Menari & musik', body: 'Irama, koordinasi, dan ekspresi diri.' },
  { icon: Palette, title: 'Melukis', body: 'Eksplorasi warna dan media seni.' },
  { icon: BookOpenCheck, title: 'Iqra & doa harian', body: 'Pembiasaan nilai religius yang lembut.' },
  { icon: Volleyball, title: 'Mini sport', body: 'Futsal, lompat, dan permainan tim.' },
  { icon: ChefHat, title: 'Little chef', body: 'Mengenal bahan makanan dan kemandirian.' },
]

export const SIGNATURE_EVENTS = [
  { title: 'Field trip', body: 'Kunjungan edukatif ke kebun, museum, dan tempat kerja profesi.' },
  { title: 'Market day', body: 'Anak berjualan dan membeli untuk belajar berhitung dan berinteraksi.' },
  { title: 'Cooking class', body: 'Memasak sederhana untuk mengenal gizi dan melatih motorik halus.' },
  { title: 'Projek P5 PAUD', body: 'Proyek penguatan profil pelajar Pancasila sesuai tema.' },
  { title: 'Pentas semester', body: 'Panggung bagi anak menampilkan karya dan keberanian.' },
]
