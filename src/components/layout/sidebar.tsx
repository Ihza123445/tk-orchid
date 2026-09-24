'use client'

import { useState } from 'react'
import Link from 'next/link'
import { logoutAction } from '@/lib/auth/actions'
import { SidebarNav, type SidebarNavSection } from '@/components/layout/sidebar-nav'
import { ThemeToggle } from '@/components/layout/theme-toggle'

const ADMIN_SECTIONS: SidebarNavSection[] = [
  { title: 'Overview', items: [{ href: '/dashboard', label: 'Dashboard' }] },
  {
    title: 'Siswa & Wali',
    items: [
      { href: '/siswa', label: 'Data Siswa' },
      { href: '/wali', label: 'Data Wali' },
    ],
  },
  {
    title: 'Akademik',
    items: [
      { href: '/tahun-ajaran', label: 'Tahun Ajaran' },
      { href: '/kelas', label: 'Kelas' },
      { href: '/presensi', label: 'Presensi' },
      { href: '/penilaian', label: 'Penilaian' },
      { href: '/perkembangan', label: 'Perkembangan' },
    ],
  },
  {
    title: 'Keuangan',
    items: [
      { href: '/keuangan/jenis-biaya', label: 'Jenis Biaya' },
      { href: '/keuangan/tagihan', label: 'Tagihan' },
      { href: '/keuangan/pembayaran', label: 'Pembayaran' },
      { href: '/keuangan/pengeluaran', label: 'Pengeluaran' },
    ],
  },
]

export function Sidebar({ role, name }: { role: string; name: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile topbar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-[var(--card)] px-4 lg:hidden">
        <span className="font-semibold text-[var(--primary)]">TK Orchid</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            className="rounded-md border px-3 py-1.5 text-sm transition-colors duration-200 hover:bg-[var(--muted)]"
            onClick={() => setOpen((v) => !v)}
          >
            Menu
          </button>
        </div>
      </div>

      <aside
        className={`${
          open ? 'block' : 'hidden'
        } fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto border-r bg-[var(--card)] lg:block lg:sticky lg:top-0 lg:h-screen`}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="text-lg font-semibold text-[var(--primary)] transition-opacity duration-200 hover:opacity-80">
            TK Orchid
          </Link>
        </div>

        <SidebarNav sections={ADMIN_SECTIONS} />

        <div className="border-t px-6 py-4">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="text-xs text-[var(--muted-foreground)]">{role}</p>
          <div className="mt-2 flex items-center gap-3">
            <form action={logoutAction}>
              <button type="submit" className="text-sm underline underline-offset-4 opacity-80 transition-opacity duration-200 hover:opacity-100">
                Keluar
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
