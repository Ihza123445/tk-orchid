# TK Orchid

Sistem informasi sekolah TK berbasis web untuk mengelola siswa, wali, kelas, presensi, penilaian, laporan perkembangan, PPDB, tagihan, pembayaran, dan pengeluaran. Aplikasi juga menyediakan portal khusus guru dan orang tua serta halaman publik sekolah.

## Teknologi

- Next.js 16 (App Router) dan React 19
- TypeScript dan Tailwind CSS 4
- Prisma 7 dengan SQLite
- Server Actions untuk mutasi data
- Autentikasi berbasis cookie bertanda tangan dan pembatasan akses per peran

## Persyaratan

- Node.js 20.19 atau lebih baru; Node.js 22 LTS direkomendasikan
- npm 10 atau lebih baru
- Windows, macOS, atau Linux

## Menjalankan secara lokal

1. Pasang dependency:

   ```bash
   npm install
   ```

   Proses `postinstall` otomatis menjalankan `prisma generate`.

2. Salin konfigurasi environment:

   **PowerShell (Windows)**

   ```powershell
   Copy-Item .env.example .env
   ```

   **macOS/Linux**

   ```bash
   cp .env.example .env
   ```

3. Ganti `AUTH_SECRET` di `.env` dengan nilai acak. Contoh generator:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
   ```

4. Siapkan database:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

   > `db:seed` menghapus lalu membuat ulang data demo di `prisma/dev.db`. Jangan jalankan perintah ini pada database yang berisi data penting.

5. Jalankan development server:

   ```bash
   npm run dev
   ```

6. Buka [http://localhost:3000](http://localhost:3000).

## Akun demo

Semua akun demo memakai password `demo1234`.

| Peran | Email | Halaman setelah login |
| --- | --- | --- |
| Admin | `admin@orchid.local` | `/dashboard` |
| Staf | `staff@orchid.local` | `/dashboard` |
| Guru | `guru1@orchid.local` | `/guru/dashboard` |
| Orang tua | `orangtua@orchid.local` | `/portal` |

## Perintah yang tersedia

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Menjalankan server development |
| `npm run build` | Membuat build production dan menjalankan pemeriksaan tipe Next.js |
| `npm run start` | Menjalankan hasil build production |
| `npm run lint` | Memeriksa kualitas kode dengan ESLint |
| `npm run typecheck` | Memeriksa TypeScript tanpa membuat output |
| `npm run db:generate` | Membuat Prisma Client |
| `npm run db:migrate` | Menjalankan/membuat migrasi database development |
| `npm run db:seed` | Mengisi ulang database dengan data demo |
| `npm run db:verify` | Memeriksa relasi, saldo tagihan, dan constraint penting |
| `npm run docs:generate` | Membuat ulang kamus data, ERD, LRS, dan class diagram dari skema |
| `npm run docs:render` | Merender semua diagram PlantUML ke PNG & SVG (butuh Java & Graphviz) |

## Struktur utama

```text
docs/                    # Kamus data, ERD, LRS, diagram UML, DFD, flowchart
src/
├── actions/             # Server Actions dan validasi mutasi
├── app/
│   ├── (auth)/          # Login dan reset password
│   ├── (dashboard)/     # Admin/staf
│   ├── (public)/        # Website publik
│   ├── guru/            # Portal guru
│   └── portal/          # Portal orang tua
├── components/          # Form, layout, dan komponen UI
├── lib/                 # Autentikasi, database, format, aset
└── proxy.ts             # Redirect awal dan pemeriksaan akses rute
prisma/
├── migrations/          # Riwayat migrasi
├── schema.prisma        # Skema database
├── seed.ts              # Data demo
└── dev.db               # Database SQLite lokal
```

## Dokumentasi & basis data

- Seluruh tabel dan kolom basis data memakai **bahasa Indonesia** (mis. `siswa`, `tagihan.jatuh_tempo`). Model Prisma di kode tetap berbahasa Inggris dan dipetakan lewat `@@map`/`@map`.
- Dokumentasi lengkap ada di [`docs/`](docs/README.md): kamus data, ERD (Chen & crow's foot), LRS, use case, activity, sequence, state machine, class, object, package, component, deployment, communication, interaction overview, timing, DFD level 0–1, dan flowchart.

## Rute penting

- Publik: `/`, `/profil`, `/program`, `/fasilitas`, `/kegiatan`, `/pengumuman`, `/kontak`, `/pendaftaran`
- Admin/staf: `/dashboard`, `/ppdb`, `/siswa`, `/wali`, `/kelas`, `/presensi`, `/penilaian`, `/perkembangan`, `/keuangan/*`
- Guru: `/guru/dashboard`, `/guru/presensi`, `/guru/penilaian`, `/guru/perkembangan`, `/guru/jadwal`
- Orang tua: `/portal`, `/portal/tagihan`, `/portal/presensi`, `/portal/perkembangan`, `/portal/pengumuman`

## Pemeriksaan sebelum commit/deploy

```bash
npm run lint
npm run typecheck
npm run db:verify
npm run build
```

## Menjalankan mode production

```bash
npm run build
npm run start
```

Untuk production:

- `AUTH_SECRET` wajib diisi dengan nilai acak yang kuat; aplikasi sengaja menolak autentikasi production jika variabel ini kosong.
- SQLite membutuhkan disk persisten dan cocok untuk satu instance aplikasi. Jangan deploy konfigurasi database saat ini ke platform serverless dengan filesystem sementara.
- Buat backup `prisma/dev.db` secara rutin atau migrasikan datasource ke database production seperti PostgreSQL sebelum penggunaan skala besar/multi-instance.
- Fitur lupa password saat ini belum terhubung ke email/SMTP. Pada development, tautan reset ditampilkan di layar untuk pengujian; pada production perlu integrasi pengiriman email.
- Rate limit login saat ini tersimpan di memori proses. Untuk beberapa instance, pindahkan penyimpanan rate limit ke Redis atau layanan sejenis.
- Website publik memakai light mode sebagai tampilan awal. Pilihan dark mode pengunjung disimpan di browser melalui `localStorage`.

## Pemecahan masalah

### `Cannot find module '.prisma/client/default'`

Jalankan:

```bash
npm run db:generate
```

### Database belum memiliki data

Jalankan migrasi dan seed:

```bash
npm run db:migrate
npm run db:seed
```

### Port 3000 sedang dipakai

Gunakan port lain:

```bash
npm run dev -- --port 3001
```

### Ingin mengembalikan data demo

Cadangkan database bila diperlukan, lalu jalankan `npm run db:seed`. Perintah tersebut bersifat destruktif terhadap isi database lokal saat ini.
