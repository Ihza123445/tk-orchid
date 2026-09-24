'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Flower2, LogOut, Menu, X } from 'lucide-react'
import { logoutAction } from '@/lib/auth/actions'
import { SidebarNav, type SidebarNavSection } from '@/components/layout/sidebar-nav'
import { ThemeToggle } from '@/components/layout/theme-toggle'

const ADMIN_SECTIONS: SidebarNavSection[] = [
  { title: 'Overview', items: [{ href: '/dashboard', label: 'Dashboard', icon: 'dashboard' }] },
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
      { href: '/website', label: 'Ringkasan', icon: 'website' },
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

export function Sidebar({
  role,
  name,
  sections = ADMIN_SECTIONS,
  brand = 'Administrasi',
  homeHref = '/dashboard',
}: {
  role: string
  name: string
  sections?: SidebarNavSection[]
  brand?: string
  homeHref?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile topbar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-[var(--card)] px-4 lg:hidden">
        <Link href={homeHref} className="flex items-center gap-2 font-semibold text-[var(--primary)]">
          <Flower2 className="size-4" /> TK Orchid
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            className="inline-flex size-9 items-center justify-center rounded-md border transition-colors duration-200 hover:bg-[var(--muted)]"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      <aside
        className={`${
          open ? 'block' : 'hidden'
        } fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto border-r bg-[var(--card)] lg:block lg:sticky lg:top-0 lg:h-screen`}
      >
        <div className="flex h-16 items-center justify-between border-b px-5">
          <Link href={homeHref} onClick={() => setOpen(false)} className="flex items-center gap-3 transition-opacity duration-200 hover:opacity-80">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--primary)]/12 text-[var(--primary)]">
              <Flower2 className="size-5" />
            </span>
            <span>
              <span className="block font-heading text-sm font-bold text-[var(--foreground)]">TK Orchid</span>
              <span className="block text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">{brand}</span>
            </span>
          </Link>
          <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1.5 hover:bg-[var(--muted)] lg:hidden" aria-label="Tutup menu">
            <X className="size-4" />
          </button>
        </div>

        <SidebarNav sections={sections} onNavigate={() => setOpen(false)} />

        <div className="border-t px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--secondary)] text-sm font-bold text-[var(--primary)]">{name.charAt(0).toUpperCase()}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">{role}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <form action={logoutAction}>
              <button type="submit" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--destructive)]">
                <LogOut className="size-3.5" /> Keluar
              </button>
            </form>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {open && (
        <button
          aria-label="Tutup menu"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
