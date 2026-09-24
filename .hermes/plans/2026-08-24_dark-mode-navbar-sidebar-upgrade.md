# TK Orchid — Dark Mode Default + Navbar/Sidebar Enhancement Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Dark (night) mode sebagai default tema seluruh aplikasi dengan toggle ke light mode (persist di localStorage, no-flash), navbar public site baru yang lebih hidup (hover effects, active state), dan sidebar semua area (admin/guru/portal) dengan hover effects + indikator posisi halaman aktif yang jelas.

**Architecture:** Tema via class `.dark` pada `<html>` + inline script anti-flash di `<head>` (pola sama seperti KopiKita: baca `localStorage('orchid-theme')`, default **dark**, apply sebelum React render). Toggle client component (`theme-toggle.tsx`) shared untuk navbar public + semua sidebar. Navbar public dibuat sebagai server component `site-header.tsx` + client `nav-links` untuk hover/active state. Sidebar admin & guru direfactor pakai komponen `sidebar-nav.tsx` client yang punya hover transition + active indicator (bg + border-left accent). Portal ortu topbar nav juga dapat hover + underline aktif.

**Tech Stack:** Next.js 16 App Router, Tailwind v4 (CSS vars sudah ada: `:root` light, `.dark` dark), localStorage, CSS transitions.

---

## Current Context

- `globals.css` sudah punya full token light (`:root`) + dark (`.dark`) — shadcn style. Dark palette masih generik oklch abu-abu; akan disesuaikan biar selaras brand hijau TK Orchid.
- Root layout `<html lang="id">` — belum ada class/suppressHydrationWarning/anti-flash script.
- Public pages TIDAK punya navbar sama sekali (hanya hero + footer di home; sub-pages cuma header berwarna).
- Admin sidebar (`src/components/layout/sidebar.tsx`): sudah ada active state sederhana (`bg-secondary`) tapi tanpa transition menonjol, tanpa ikon posisi, mobile toggle manual state.
- Guru sidebar (`src/app/guru/layout.tsx`): server component, TIDAK ADA active state sama sekali (semua item styling sama).
- Portal ortu (`src/app/portal/layout.tsx`): topbar nav horizontal, tidak ada active state.
- Belum ada komponen theme-toggle. Belum ada next-themes dependency (pakai vanilla saja, konsisten pola KopiKita user).

---

## Task List

### Task 1: Anti-flash script + default dark di root layout

**Objective:** Tema dark teraplikasi sebelum paint pertama, tanpa flash light.

**Files:**
- Modify: `src/app/layout.tsx`

**Step 1: Update html tag + tambah script**

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('orchid-theme');if(t!=='light'){document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body className={...}>{children}</body>
    </html>
  )
}
```

Logika: default = dark (kecuali explicitly 'light' tersimpan).

**Step 2: Verify**

Run: `curl -s http://localhost:3002/ | grep -o "orchid-theme"` → muncul di output.

### Task 2: Dark palette brand-aligned di globals.css

**Objective:** Dark mode selaras identitas hijau TK Orchid, bukan abu-abu generik.

**Files:**
- Modify: `src/app/globals.css` (blok `.dark { ... }`)

**Step 1: Ganti nilai token `.dark`:**

- `--background: #0B1512` (hitam kehijauan)
- `--foreground: #E8F0ED`
- `--card: #12201C`
- `--card-foreground: #E8F0ED`
- `--popover/--popover-foreground` mengikuti card
- `--primary: #4FA08D` (hijau mint lebih terang untuk kontras)
- `--primary-foreground: #0B1512`
- `--secondary: #1A2E28`
- `--secondary-foreground: #E8F0ED`
- `--muted: #16241F`
- `--muted-foreground: #8FA39B`
- `--accent: #E9A24B` (tetap oranye)
- `--border/--input: rgba(232,240,237,0.12)`
- `--ring: #4FA08D`
- Sidebar tokens mengikuti surface gelap.

**Step 2: Verify visual** — screenshot homepage setelah build, background harus gelap kehijauan bukan abu netral.

### Task 3: Komponen ThemeToggle (client)

**Objective:** Satu tombol sun/moon untuk ganti tema, dipakai semua layout.

**Files:**
- Create: `src/components/layout/theme-toggle.tsx`

**Step 1: Implementasi:**

```tsx
'use client'
import { useEffect, useState } from 'react'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', next)
    try { localStorage.setItem('orchid-theme', next ? 'dark' : 'light') } catch {}
    setIsDark(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      title={isDark ? 'Mode terang' : 'Mode gelap'}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] transition-all duration-200 hover:border-[var(--primary)] hover:bg-[var(--muted)] hover:scale-105 active:scale-95 ${className}`}
    >
      {/* Ikon inline SVG matahari/bulan */}
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
```

SVG sun/moon inline (stroke currentColor) — tanpa dependency lucide.

**Step 2: Verify** — klik toggle di browser: class .dark pindah, localStorage update, reload persist.

### Task 4: Navbar public baru (site-header)

**Objective:** Navbar sticky profesional dengan logo, link hover animated underline, active page highlight, CTA Daftar, ThemeToggle, responsive mobile menu.

**Files:**
- Create: `src/components/public/site-header.tsx` (server)
- Create: `src/components/public/nav-link.tsx` (client — usePathname untuk active + hover styles)

**Step 1: nav-link.tsx (client):**

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/profil', label: 'Profil' },
  { href: '/kegiatan', label: 'Kegiatan' },
  { href: '/pengumuman', label: 'Pengumuman' },
  { href: '/kontak', label: 'Kontak' },
]

export function NavLink({ href, label, onNavigate }: ...) {
  const pathname = usePathname()
  const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`group relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
        active ? 'text-[var(--primary)]' : 'text-[var(--foreground)]/80 hover:text-[var(--primary)]'
      }`}
    >
      {label}
      {/* Animated underline */}
      <span
        className={`absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded-full bg-[var(--primary)] transition-transform duration-300 ${
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`}
      />
    </Link>
  )
}
```

**Step 2: site-header.tsx (server):** sticky top-0 z-50, backdrop-blur + semi-transparent bg (`bg-[var(--card)]/80 backdrop-blur-md`), border-b, logo "TK Orchid" (klik → /), NavLink×5, spacer, ThemeToggle, CTA pill "Daftar" (`hover:shadow-lg hover:-translate-y-0.5 transition-all`), hamburger mobile (client state di wrapper kecil atau jadikan site-header client sepenuhnya — pilih: site-header client component langsung karena butuh open state).

**Step 3: Pasang di SEMUA 6 public pages** — hapus header lama per-page jika duplikat:
- `(public)/page.tsx` — sisipkan `<SiteHeader />` sebelum hero; hero tetap.
- `(public)/profil/page.tsx` — replace header berwarna dengan SiteHeader + section padding.
- `(public)/kegiatan/page.tsx` — idem.
- `(public)/pengumuman/page.tsx` — idem.
- `(public)/kontak/page.tsx` — idem.
- `(public)/pendaftaran/page.tsx` — idem (PPDB form tetap utuh).

**Step 4: Verify** — curl tiap page mengandung "Beranda", "Profil", dst + screenshot visual.

### Task 5: Sidebar admin upgrade (active indicator + hover premium)

**Objective:** Posisi halaman terlihat jelas di sidebar + hover effect halus di semua item.

**Files:**
- Modify: `src/components/layout/sidebar.tsx`

**Step 1: Upgrade item rendering:**

```tsx
const active = pathname === item.href || pathname.startsWith(item.href + '/')

<Link
  ...
  className={`group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200
    ${active
      ? 'bg-[var(--secondary)] font-semibold text-[var(--primary)] shadow-sm'
      : 'text-[var(--foreground)]/75 hover:bg-[var(--muted)] hover:text-[var(--foreground)] hover:translate-x-1'}`}
>
  {/* Active dot / left bar */}
  <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-[var(--primary)] transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`} />
  {item.label}
</Link>
```

Hover: translate-x-1 (geser kanan halus) + bg muted. Active: pill bg + bold + left accent bar + shadow.

**Step 2:** Tambahkan ThemeToggle di bagian bawah sidebar (dekat user info/Keluar).

**Verify:** Screenshot `/siswa` → item Data Siswa highlighted dengan bar hijau; hover item lain bergeser.

### Task 6: Sidebar guru refactor ke SidebarNav client

**Objective:** Guru sidebar dapat active state + hover yang sama dengan admin (DRY).

**Files:**
- Modify: `src/app/guru/layout.tsx`
- Create: `src/components/layout/sidebar-nav.tsx` (client, reusable: props `sections`, `pathname-aware`)

**Step 1:** Ekstrak logika nav list dari Task 5 ke `sidebar-nav.tsx`:

```tsx
'use client'
export function SidebarNav({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname()
  // render ul > li > Link dengan logic active/hover identik Task 5
}
```

Refactor `sidebar.tsx` (admin) untuk memakai `SidebarNav` juga (DRY).

**Step 2:** `guru/layout.tsx` (server) import `SidebarNav` + pass MENU. Hapus hardcoded Link list. Tambah ThemeToggle + mobile menu collapse (reuse pattern admin: button Menu + aside hidden/block + overlay).

**Verify:** `/guru/presensi` → Presensi item highlighted.

### Task 7: Portal ortu nav upgrade

**Objective:** Topbar portal dapat hover + active underline konsisten.

**Files:**
- Modify: `src/app/portal/layout.tsx`

**Step 1:** Buat `portal-nav.tsx` client (atau reuse pattern NavLink): link dengan `aria-current`, active = `text-primary font-semibold border-b-2 border-[var(--primary)]`, hover = `hover:bg-muted hover:text-foreground` transition.

**Step 2:** Ganti map MENU di layout dengan `<PortalNav items={MENU} />`. Tambah ThemeToggle di kanan topbar.

**Verify:** `/portal/tagihan` → Tagihan underlined + bold.

### Task 8: Audit menyeluruh — tidak ada halaman tertinggal

**Objective:** Pastikan SEMUA page mendapat tema + nav baru.

**Checklist file-by-file:**
1. `(public)` ×6 — SiteHeader ✓ (Task 4)
2. `(dashboard)` — pakai `layout.tsx` group → Sidebar ✓ (Task 5) — cek juga `loading.tsx`/`error.tsx` pakai token var() bukan hardcode warna
3. `/guru/*` ×7 — layout ✓ (Task 6)
4. `/portal/*` ×6 — layout ✓ (Task 7)
5. `(auth)/login`, `lupa-password`, `reset-password/[token]` — pastikan form card pakai var tokens (sudah), tambah ThemeToggle pojok? (opsional — skip, login page minimalis cukup)
6. `error.tsx` global & `not-found` — verifikasi token-based

**Grep audit commands:**

```bash
# Cari hardcode warna yang bakal rusak di dark mode
grep -rn "text-gray-\|bg-white\|text-black\|bg-slate-" src/ --include="*.tsx"
grep -rn "text-\[#\|bg-\[#" src/ --include="*.tsx"
```

Semua hasil dievaluasi: hardcode `text-black` pada CTA oranye boleh (kontras di kedua tema), `bg-white` harus diganti `bg-[var(--card)]`.

**Fix semua temuan** satu per satu.

### Task 9: Build + browser audit final

**Objective:** Production build hijau + 0 console error + screenshot semua role dalam dark & light.

**Steps:**
1. `npx tsc --noEmit` → 0 error
2. `npx next build` → EXIT 0
3. Restart `next start -p 3002`
4. Jalankan `scripts/browser-audit-full.js` (sudah ada) → 30/30 halaman 200, err:0
5. Screenshot ekstra: dashboard admin + homepage dalam dark DAN light (toggle via cookie/script) untuk perbandingan visual
6. Kirim screenshot ke user via Telegram

---

## Verification Checklist

- [ ] Fresh visit (localStorage kosong) → dark mode langsung, tanpa flash
- [ ] Toggle → light, reload → tetap light (persist)
- [ ] Toggle lagi → dark, reload → tetap dark
- [ ] Semua 6 public page punya navbar sticky dengan hover underline animasi
- [ ] Active page di navbar public ter-highlight (warna primary + underline penuh)
- [ ] Admin sidebar: item aktif punya pill bg + left accent bar; hover item lain translate-x halus
- [ ] Guru sidebar: active state bekerja (sebelumnya tidak ada)
- [ ] Portal nav: active underline + bold
- [ ] ThemeToggle muncul di: navbar public, admin sidebar, guru sidebar, portal topbar
- [ ] `tsc --noEmit` 0 error, `next build` EXIT 0
- [ ] Browser audit 30 halaman: 200 OK, 0 console error
- [ ] Tidak ada hardcode warna putih/hitam yang rusak di dark mode (hasil grep dibersihkan)

## Files Changed Summary

| File | Action |
|---|---|
| `src/app/layout.tsx` | Modify — suppressHydrationWarning + anti-flash script |
| `src/app/globals.css` | Modify — dark palette brand-aligned |
| `src/components/layout/theme-toggle.tsx` | Create |
| `src/components/public/site-header.tsx` | Create |
| `src/components/public/nav-link.tsx` | Create |
| `src/components/layout/sidebar-nav.tsx` | Create (shared admin+guru) |
| `src/components/layout/sidebar.tsx` | Modify — pakai SidebarNav + ThemeToggle |
| `src/app/guru/layout.tsx` | Modify — pakai SidebarNav + mobile menu |
| `src/app/portal/layout.tsx` | Modify — nav upgrade + ThemeToggle |
| `src/app/(public)/{page,profil,kegiatan,pengumuman,kontak,pendaftaran}` | Modify ×6 — pasang SiteHeader |
| Hardcode color fixes | Sesuai temuan grep |

## Risks / Tradeoffs

- **SSR hydration:** ThemeToggle initial render `isDark=true` (default) — cocok dengan script head yang default dark, aman.
- **Hero hijau di dark mode:** hero `bg-primary` akan jadi mint terang (#4FA08D) di dark — kontras teks dicek; kalau aneh, hero diberi class `dark:bg-[#12332B]` khusus.
- **RSC vs client nav:** SiteHeader dibuat full client agar mobile menu + pathname aktif dalam satu komponen; ukuran kecil, dampak bundle minim.
- **Audit script wait strategy:** `domcontentloaded` + delay sudah stabil dari sesi sebelumnya.

## Open Questions

Tidak ada — preferensi user jelas: dark default, toggle light, hover navbar, active indicator sidebar, terapkan ke semua halaman tanpa terkecuali.
