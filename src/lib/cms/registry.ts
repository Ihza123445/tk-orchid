// Definisi setiap jenis konten website yang dapat dikelola dari admin › Website.
// File ini murni data (tanpa import server) sehingga dipakai bersama oleh halaman admin,
// komponen form (client), dan server action untuk validasi.

export type FieldType = 'text' | 'textarea' | 'image' | 'select' | 'datetime' | 'date' | 'checkbox'

export interface FieldDef {
  name: string
  label: string
  type: FieldType
  required?: boolean
  max?: number
  placeholder?: string
  help?: string
  /** Pilihan statis untuk select */
  options?: { value: string; label: string }[]
  /** Pilihan dari database, diisi halaman admin (mis. daftar kelas) */
  optionsFrom?: 'classes'
  /** Nilai disimpan sebagai angka (id relasi) */
  int?: boolean
  /** Tampilkan & simpan hanya jika field lain bernilai tertentu */
  showIf?: { field: string; equals: string }
  /** Lebar penuh di grid form */
  wide?: boolean
  /** Untuk field date: simpan sebagai 23.59 agar hari terakhir masih terhitung */
  endOfDay?: boolean
  /** Nilai awal untuk item baru */
  defaultValue?: string | boolean
}

export interface SectionDef {
  key: string
  model: 'heroSlide' | 'facility' | 'galleryItem' | 'testimonial' | 'faq' | 'activity' | 'announcement' | 'admissionPeriod'
  title: string
  singular: string
  description: string
  /** Halaman publik tempat konten ini tampil */
  publicHref: string
  /** Urutan manual (naik/turun) + tombol tampil/sembunyi via isActive */
  sortable: boolean
  fields: FieldDef[]
  list: {
    title: string
    subtitle?: string
    image?: string
    badge?: string
    date?: string
  }
  /** Status tayang: field + nilai yang dianggap "tampil" */
  status?: { field: string; liveValue: string | boolean; labels?: Record<string, string> }
  emptyText: string
}

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draf (belum tampil)' },
  { value: 'PUBLISHED', label: 'Terbit (tampil)' },
  { value: 'ARCHIVED', label: 'Arsip (disembunyikan)' },
]
const STATUS_LABELS = { DRAFT: 'Draf', PUBLISHED: 'Terbit', ARCHIVED: 'Arsip' }

export const CONTENT_SECTIONS: Record<string, SectionDef> = {
  slider: {
    key: 'slider',
    model: 'heroSlide',
    title: 'Slider Beranda',
    singular: 'slide',
    description: 'Foto dan teks besar yang bergantian di bagian paling atas beranda.',
    publicHref: '/',
    sortable: true,
    list: { title: 'title', subtitle: 'description', image: 'image', badge: 'eyebrow' },
    status: { field: 'isActive', liveValue: true },
    emptyText: 'Belum ada slide. Beranda membutuhkan minimal satu slide.',
    fields: [
      { name: 'eyebrow', label: 'Teks kecil di atas judul', type: 'text', required: true, max: 80, placeholder: 'Sekolah pertama yang terasa seperti rumah' },
      { name: 'title', label: 'Judul', type: 'text', required: true, max: 60, placeholder: 'Tempat si kecil' },
      { name: 'accent', label: 'Judul warna (tulisan tangan)', type: 'text', max: 40, placeholder: 'tumbuh bahagia.', help: 'Opsional. Tampil di baris kedua judul dengan warna ungu.' },
      { name: 'description', label: 'Deskripsi', type: 'textarea', required: true, max: 240, wide: true },
      { name: 'image', label: 'Foto', type: 'image', required: true, wide: true, help: 'Disarankan foto landscape, minimal lebar 1600 px.' },
      { name: 'imageAlt', label: 'Keterangan foto (untuk aksesibilitas)', type: 'text', max: 150, wide: true },
      { name: 'isActive', label: 'Tampilkan di website', type: 'checkbox', defaultValue: true },
    ],
  },
  kegiatan: {
    key: 'kegiatan',
    model: 'activity',
    title: 'Kegiatan',
    singular: 'kegiatan',
    description: 'Cerita dan dokumentasi kegiatan sekolah. Foto sampul kegiatan publik juga tampil di Galeri.',
    publicHref: '/kegiatan',
    sortable: false,
    list: { title: 'title', subtitle: 'description', image: 'coverImage', badge: 'visibility', date: 'startDatetime' },
    status: { field: 'status', liveValue: 'PUBLISHED', labels: STATUS_LABELS },
    emptyText: 'Belum ada kegiatan.',
    fields: [
      { name: 'title', label: 'Judul kegiatan', type: 'text', required: true, max: 150, wide: true },
      { name: 'description', label: 'Cerita / deskripsi', type: 'textarea', required: true, max: 5000, wide: true },
      { name: 'startDatetime', label: 'Waktu mulai', type: 'datetime', required: true },
      { name: 'endDatetime', label: 'Waktu selesai', type: 'datetime' },
      { name: 'location', label: 'Lokasi', type: 'text', max: 150 },
      {
        name: 'visibility', label: 'Siapa yang bisa melihat', type: 'select', required: true, defaultValue: 'PUBLIC',
        options: [
          { value: 'PUBLIC', label: 'Publik (website)' },
          { value: 'PARENT_ONLY', label: 'Hanya orang tua (portal)' },
          { value: 'INTERNAL', label: 'Internal (guru & staf)' },
        ],
      },
      { name: 'coverImage', label: 'Foto sampul', type: 'image', wide: true },
      { name: 'status', label: 'Status', type: 'select', required: true, defaultValue: 'PUBLISHED', options: STATUS_OPTIONS },
    ],
  },
  pengumuman: {
    key: 'pengumuman',
    model: 'announcement',
    title: 'Pengumuman',
    singular: 'pengumuman',
    description: 'Kabar dan agenda untuk website, portal orang tua, atau guru.',
    publicHref: '/pengumuman',
    sortable: false,
    list: { title: 'title', subtitle: 'content', badge: 'audience', date: 'publishAt' },
    status: { field: 'status', liveValue: 'PUBLISHED', labels: STATUS_LABELS },
    emptyText: 'Belum ada pengumuman.',
    fields: [
      { name: 'title', label: 'Judul', type: 'text', required: true, max: 150, wide: true },
      { name: 'content', label: 'Isi pengumuman', type: 'textarea', required: true, max: 5000, wide: true },
      {
        name: 'audience', label: 'Ditujukan untuk', type: 'select', required: true, defaultValue: 'PUBLIC',
        options: [
          { value: 'PUBLIC', label: 'Publik (website & portal)' },
          { value: 'ALL_PARENTS', label: 'Semua orang tua (portal)' },
          { value: 'CLASS_SPECIFIC', label: 'Orang tua kelas tertentu' },
          { value: 'TEACHERS', label: 'Guru' },
          { value: 'STAFF', label: 'Staf' },
        ],
      },
      { name: 'classId', label: 'Kelas', type: 'select', optionsFrom: 'classes', int: true, required: true, showIf: { field: 'audience', equals: 'CLASS_SPECIFIC' } },
      { name: 'publishAt', label: 'Tayang mulai', type: 'datetime', help: 'Kosongkan untuk tayang sekarang.' },
      { name: 'expireAt', label: 'Tayang sampai', type: 'datetime', help: 'Kosongkan bila tidak ada batas.' },
      { name: 'status', label: 'Status', type: 'select', required: true, defaultValue: 'PUBLISHED', options: STATUS_OPTIONS },
    ],
  },
  galeri: {
    key: 'galeri',
    model: 'galleryItem',
    title: 'Galeri Foto',
    singular: 'foto',
    description: 'Foto di halaman Galeri. Kategori baru otomatis menjadi tombol filter.',
    publicHref: '/galeri',
    sortable: true,
    list: { title: 'title', image: 'image', badge: 'category' },
    status: { field: 'isActive', liveValue: true },
    emptyText: 'Belum ada foto di galeri.',
    fields: [
      { name: 'image', label: 'Foto', type: 'image', required: true, wide: true },
      { name: 'title', label: 'Judul foto', type: 'text', required: true, max: 120 },
      { name: 'category', label: 'Kategori', type: 'text', required: true, max: 30, placeholder: 'Kelas, Bermain, Seni, Acara…', help: 'Ketik kategori yang sama untuk mengelompokkan foto.' },
      { name: 'isActive', label: 'Tampilkan di website', type: 'checkbox', defaultValue: true },
    ],
  },
  fasilitas: {
    key: 'fasilitas',
    model: 'facility',
    title: 'Fasilitas',
    singular: 'fasilitas',
    description: 'Ruang dan fasilitas utama. Lima teratas juga tampil di beranda.',
    publicHref: '/fasilitas',
    sortable: true,
    list: { title: 'title', subtitle: 'description', image: 'image' },
    status: { field: 'isActive', liveValue: true },
    emptyText: 'Belum ada fasilitas.',
    fields: [
      { name: 'title', label: 'Nama fasilitas', type: 'text', required: true, max: 80 },
      { name: 'description', label: 'Deskripsi singkat', type: 'textarea', required: true, max: 240, wide: true },
      { name: 'image', label: 'Foto', type: 'image', required: true, wide: true },
      { name: 'isActive', label: 'Tampilkan di website', type: 'checkbox', defaultValue: true },
    ],
  },
  testimoni: {
    key: 'testimoni',
    model: 'testimonial',
    title: 'Testimoni',
    singular: 'testimoni',
    description: 'Cerita orang tua yang tampil bergantian di beranda dan profil.',
    publicHref: '/',
    sortable: true,
    list: { title: 'name', subtitle: 'quote', badge: 'relation' },
    status: { field: 'isActive', liveValue: true },
    emptyText: 'Belum ada testimoni. Bagian testimoni disembunyikan dari website.',
    fields: [
      { name: 'name', label: 'Nama', type: 'text', required: true, max: 60, placeholder: 'Bunda Alya' },
      { name: 'relation', label: 'Keterangan', type: 'text', required: true, max: 80, placeholder: 'Orang tua murid TK B' },
      { name: 'quote', label: 'Testimoni', type: 'textarea', required: true, max: 400, wide: true },
      { name: 'isActive', label: 'Tampilkan di website', type: 'checkbox', defaultValue: true },
    ],
  },
  faq: {
    key: 'faq',
    model: 'faq',
    title: 'Tanya Jawab (FAQ)',
    singular: 'pertanyaan',
    description: 'Pertanyaan yang sering diajukan. Urutan teratas tampil di beranda dan halaman lain.',
    publicHref: '/faq',
    sortable: true,
    list: { title: 'question', subtitle: 'answer', badge: 'category' },
    status: { field: 'isActive', liveValue: true },
    emptyText: 'Belum ada pertanyaan.',
    fields: [
      { name: 'question', label: 'Pertanyaan', type: 'text', required: true, max: 200, wide: true },
      { name: 'answer', label: 'Jawaban', type: 'textarea', required: true, max: 1500, wide: true },
      { name: 'category', label: 'Kategori', type: 'text', required: true, max: 30, placeholder: 'Pendaftaran, Pembelajaran, Keluarga…' },
      { name: 'isActive', label: 'Tampilkan di website', type: 'checkbox', defaultValue: true },
    ],
  },
  ppdb: {
    key: 'ppdb',
    model: 'admissionPeriod',
    title: 'Periode PPDB',
    singular: 'periode',
    description: 'Buka atau tutup pendaftaran online. Formulir di website hanya tampil saat ada periode aktif dan tanggal hari ini berada di dalam periode.',
    publicHref: '/pendaftaran',
    sortable: false,
    list: { title: 'name', subtitle: 'requirementsText', date: 'startDate' },
    status: { field: 'isActive', liveValue: true },
    emptyText: 'Belum ada periode pendaftaran. Formulir PPDB tidak akan tampil di website.',
    fields: [
      { name: 'name', label: 'Nama periode', type: 'text', required: true, max: 100, placeholder: 'PPDB 2027/2028', wide: true },
      { name: 'startDate', label: 'Tanggal dibuka', type: 'date', required: true },
      { name: 'endDate', label: 'Tanggal ditutup', type: 'date', required: true, endOfDay: true },
      { name: 'requirementsText', label: 'Persyaratan', type: 'textarea', max: 2000, wide: true, help: 'Tampil di atas formulir pendaftaran. Satu syarat per baris.' },
      { name: 'notes', label: 'Catatan internal', type: 'textarea', max: 1000, wide: true },
      { name: 'isActive', label: 'Aktifkan periode ini (periode lain otomatis nonaktif)', type: 'checkbox', defaultValue: true },
    ],
  },
}

export const BADGE_LABELS: Record<string, string> = {
  PUBLIC: 'Publik',
  PARENT_ONLY: 'Orang tua',
  INTERNAL: 'Internal',
  ALL_PARENTS: 'Semua orang tua',
  CLASS_SPECIFIC: 'Per kelas',
  TEACHERS: 'Guru',
  STAFF: 'Staf',
}

// ===== Pengaturan situs (satu formulir, bukan daftar) =====

export interface SettingGroup {
  title: string
  description: string
  fields: FieldDef[]
}

export const SETTING_GROUPS: SettingGroup[] = [
  {
    title: 'Identitas sekolah',
    description: 'Tampil di header, footer, dan judul halaman.',
    fields: [
      { name: 'schoolName', label: 'Nama sekolah', type: 'text', required: true, max: 60 },
      { name: 'tagline', label: 'Slogan', type: 'text', required: true, max: 60 },
      { name: 'topbarText', label: 'Teks pengumuman di bar atas', type: 'text', required: true, max: 120, wide: true },
      { name: 'footerText', label: 'Deskripsi di footer', type: 'textarea', required: true, max: 300, wide: true },
    ],
  },
  {
    title: 'Kontak & lokasi',
    description: 'Dipakai di header, footer, halaman Kontak, peta, dan tombol WhatsApp.',
    fields: [
      { name: 'whatsapp', label: 'Nomor WhatsApp', type: 'text', required: true, max: 20, placeholder: '6281234567890', help: 'Format internasional tanpa + atau spasi, contoh 6281234567890.' },
      { name: 'email', label: 'Email', type: 'text', required: true, max: 100 },
      { name: 'address', label: 'Alamat', type: 'text', required: true, max: 200, wide: true },
      { name: 'hours', label: 'Jam layanan', type: 'text', required: true, max: 80 },
      { name: 'mapQuery', label: 'Lokasi di peta', type: 'text', required: true, max: 200, help: 'Alamat lengkap atau nama tempat seperti di Google Maps.' },
      { name: 'instagram', label: 'Link Instagram', type: 'text', max: 200, placeholder: 'https://instagram.com/…' },
      { name: 'facebook', label: 'Link Facebook', type: 'text', max: 200, placeholder: 'https://facebook.com/…' },
      { name: 'youtube', label: 'Link YouTube', type: 'text', max: 200, placeholder: 'https://youtube.com/…' },
    ],
  },
  {
    title: 'Sambutan kepala sekolah',
    description: 'Tampil di beranda, Profil, dan Guru & Staf. Kosongkan isi sambutan untuk menyembunyikan.',
    fields: [
      { name: 'principalName', label: 'Nama kepala sekolah', type: 'text', required: true, max: 80 },
      { name: 'principalRole', label: 'Jabatan', type: 'text', required: true, max: 80 },
      { name: 'principalQuote', label: 'Isi sambutan', type: 'textarea', max: 600, wide: true },
      { name: 'principalImage', label: 'Foto kepala sekolah', type: 'image', required: true, wide: true, help: 'Disarankan foto potret (tegak).' },
    ],
  },
]
