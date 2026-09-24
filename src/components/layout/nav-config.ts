import type { SidebarNavSection } from '@/components/layout/sidebar-nav'

export const ADMIN_SECTIONS: SidebarNavSection[] = [
  { title: 'Ringkasan', items: [{ href: '/dashboard', label: 'Dashboard', icon: 'dashboard' }] },
  {
    title: 'Penerimaan',
    items: [
      { href: '/ppdb', label: 'Pendaftaran PPDB', icon: 'admissions' },
      { href: '/website/ppdb', label: 'Periode PPDB', icon: 'periods' },
    ],
  },
  {
    title: 'Siswa & Wali',
    items: [
      { href: '/siswa', label: 'Data Siswa', icon: 'students' },
      { href: '/wali', label: 'Data Wali', icon: 'guardians' },
    ],
  },
  {
    title: 'Akademik',
    items: [
      { href: '/tahun-ajaran', label: 'Tahun Ajaran', icon: 'years' },
      { href: '/kelas', label: 'Kelas', icon: 'classes' },
      { href: '/presensi', label: 'Presensi', icon: 'attendance' },
      { href: '/penilaian', label: 'Penilaian', icon: 'assessment' },
      { href: '/perkembangan', label: 'Perkembangan', icon: 'development' },
    ],
  },
  {
    title: 'Keuangan',
    items: [
      { href: '/keuangan/jenis-biaya', label: 'Jenis Biaya', icon: 'fees' },
      { href: '/keuangan/tagihan', label: 'Tagihan', icon: 'invoices' },
      { href: '/keuangan/pembayaran', label: 'Pembayaran', icon: 'payments' },
      { href: '/keuangan/pengeluaran', label: 'Pengeluaran', icon: 'expenses' },
    ],
  },
  {
    title: 'Website',
    items: [
      { href: '/website', label: 'Ringkasan Website', icon: 'website' },
      { href: '/website/pengaturan', label: 'Pengaturan Situs', icon: 'settings' },
      { href: '/website/slider', label: 'Slider Beranda', icon: 'slider' },
      { href: '/website/kegiatan', label: 'Kegiatan', icon: 'stories' },
      { href: '/website/pengumuman', label: 'Pengumuman', icon: 'news' },
      { href: '/website/galeri', label: 'Galeri Foto', icon: 'gallery' },
      { href: '/website/fasilitas', label: 'Fasilitas', icon: 'facilities' },
      { href: '/website/testimoni', label: 'Testimoni', icon: 'testimonials' },
      { href: '/website/faq', label: 'Tanya Jawab', icon: 'faq' },
    ],
  },
]

export const GURU_SECTIONS: SidebarNavSection[] = [
  { title: 'Ringkasan', items: [{ href: '/guru/dashboard', label: 'Dashboard', icon: 'dashboard' }] },
  {
    title: 'Kelas Saya',
    items: [
      { href: '/guru/presensi', label: 'Presensi', icon: 'attendance' },
      { href: '/guru/penilaian', label: 'Penilaian', icon: 'assessment' },
      { href: '/guru/perkembangan', label: 'Perkembangan', icon: 'development' },
      { href: '/guru/jadwal', label: 'Jadwal', icon: 'schedule' },
      { href: '/guru/kegiatan', label: 'Kegiatan', icon: 'activities' },
    ],
  },
  { title: 'Akun', items: [{ href: '/guru/profil', label: 'Profil Saya', icon: 'profile' }] },
]

export const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrator',
  STAFF: 'Staf Tata Usaha',
  TEACHER: 'Guru',
  PARENT: 'Orang Tua',
}
