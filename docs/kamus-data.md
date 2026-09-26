# Kamus Data — Sistem Informasi TK Orchid

> Dibuat otomatis dari `prisma/schema.prisma` oleh `scripts/generate-docs.ts`. Jangan diedit manual; jalankan ulang skrip bila skema berubah.

Basis data: **SQLite** · Jumlah tabel: **37** · Jumlah relasi (foreign key): **53**

Konvensi: nama tabel & kolom memakai *snake_case* bahasa Indonesia, kunci primer `id_<tabel>`, kunci tamu `id_<tabel rujukan>`. Nominal uang disimpan sebagai bilangan bulat rupiah. Kolom bertanda **Ya** pada *Wajib* bernilai NOT NULL.

## Daftar tabel

| No | Tabel | Modul | Keterangan |
| --: | --- | --- | --- |
| 1 | [`pengguna`](#pengguna) | Pengguna & Hak Akses | Akun login semua peran (admin, staf TU, guru, orang tua). |
| 2 | [`wali`](#wali) | Pengguna & Hak Akses | Data orang tua/wali siswa; dapat terhubung ke akun pengguna untuk portal orang tua. |
| 3 | [`guru`](#guru) | Pengguna & Hak Akses | Data guru; setiap guru memiliki satu akun pengguna. |
| 4 | [`tahun_ajaran`](#tahun_ajaran) | Kesiswaan & Akademik | Periode tahun ajaran; hanya satu yang berstatus aktif. |
| 5 | [`siswa`](#siswa) | Kesiswaan & Akademik | Data induk siswa. |
| 6 | [`siswa_wali`](#siswa_wali) | Kesiswaan & Akademik | Tabel penghubung siswa dan wali (relasi banyak-ke-banyak). |
| 7 | [`kelas`](#kelas) | Kesiswaan & Akademik | Rombongan belajar per tahun ajaran beserta wali kelas. |
| 8 | [`penempatan_kelas`](#penempatan_kelas) | Kesiswaan & Akademik | Penempatan siswa ke kelas pada satu tahun ajaran. |
| 9 | [`periode_ppdb`](#periode_ppdb) | Penerimaan Peserta Didik Baru (PPDB) | Gelombang/periode penerimaan peserta didik baru. |
| 10 | [`pendaftaran_ppdb`](#pendaftaran_ppdb) | Penerimaan Peserta Didik Baru (PPDB) | Formulir pendaftaran PPDB online dari calon siswa. |
| 11 | [`dokumen_pendaftaran`](#dokumen_pendaftaran) | Penerimaan Peserta Didik Baru (PPDB) | Berkas lampiran pendaftaran PPDB. |
| 12 | [`domain_penilaian`](#domain_penilaian) | Penilaian & Laporan Perkembangan | Aspek perkembangan STPPA (agama & moral, fisik motorik, kognitif, dst.). |
| 13 | [`skala_penilaian`](#skala_penilaian) | Penilaian & Laporan Perkembangan | Skala capaian (BB, MB, BSH, BSB). |
| 14 | [`penilaian`](#penilaian) | Penilaian & Laporan Perkembangan | Nilai capaian siswa per domain per periode. |
| 15 | [`laporan_perkembangan`](#laporan_perkembangan) | Penilaian & Laporan Perkembangan | Rapor naratif siswa per periode (draf → review → terbit). |
| 16 | [`detail_laporan`](#detail_laporan) | Penilaian & Laporan Perkembangan | Rincian capaian per domain dalam satu laporan perkembangan. |
| 17 | [`presensi`](#presensi) | Kesiswaan & Akademik | Kehadiran harian siswa. |
| 18 | [`jadwal`](#jadwal) | Kesiswaan & Akademik | Jadwal kegiatan mingguan per kelas. |
| 19 | [`kegiatan`](#kegiatan) | Informasi & Konten Website | Kegiatan/dokumentasi sekolah untuk website & portal. |
| 20 | [`media_kegiatan`](#media_kegiatan) | Informasi & Konten Website | Foto/berkas tambahan suatu kegiatan. |
| 21 | [`pengumuman`](#pengumuman) | Informasi & Konten Website | Pengumuman untuk publik, orang tua, guru, atau kelas tertentu. |
| 22 | [`pengumuman_dibaca`](#pengumuman_dibaca) | Pengguna & Hak Akses | Catatan pengumuman yang sudah dibaca pengguna. |
| 23 | [`jenis_biaya`](#jenis_biaya) | Keuangan | Master komponen biaya (SPP, uang pangkal, seragam, dll.). |
| 24 | [`tagihan`](#tagihan) | Keuangan | Tagihan (invoice) per siswa. |
| 25 | [`detail_tagihan`](#detail_tagihan) | Keuangan | Baris rincian biaya dalam tagihan. |
| 26 | [`pembayaran`](#pembayaran) | Keuangan | Kwitansi pembayaran dari orang tua. |
| 27 | [`alokasi_pembayaran`](#alokasi_pembayaran) | Keuangan | Pembagian nominal pembayaran ke satu atau beberapa tagihan. |
| 28 | [`pengeluaran`](#pengeluaran) | Keuangan | Pengeluaran operasional sekolah. |
| 29 | [`dokumen_siswa`](#dokumen_siswa) | Kesiswaan & Akademik | Berkas milik siswa (akta, KK, foto, dll.). |
| 30 | [`log_audit`](#log_audit) | Pengguna & Hak Akses | Jejak aktivitas penting pengguna (login, perubahan data). |
| 31 | [`token_reset_sandi`](#token_reset_sandi) | Pengguna & Hak Akses | Token sekali pakai untuk mengatur ulang kata sandi. |
| 32 | [`pengaturan_situs`](#pengaturan_situs) | Informasi & Konten Website | Pengaturan website berbentuk pasangan kunci–nilai. |
| 33 | [`slide_beranda`](#slide_beranda) | Informasi & Konten Website | Slide besar di bagian atas beranda website. |
| 34 | [`galeri`](#galeri) | Informasi & Konten Website | Foto galeri website. |
| 35 | [`fasilitas`](#fasilitas) | Informasi & Konten Website | Daftar fasilitas sekolah di website. |
| 36 | [`testimoni`](#testimoni) | Informasi & Konten Website | Testimoni orang tua di website. |
| 37 | [`tanya_jawab`](#tanya_jawab) | Informasi & Konten Website | Pertanyaan yang sering diajukan (FAQ) di website. |

## pengguna

Akun login semua peran (admin, staf TU, guru, orang tua).

Kunci primer: `id_pengguna`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_pengguna` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik pengguna |
| 2 | `nama` | TEXT | Ya | - | - | Nama |
| 3 | `email` | TEXT | Ya | UK | - | Alamat email |
| 4 | `nama_pengguna` | TEXT | Tidak | UK | - | Nama pengguna (username) untuk login |
| 5 | `kata_sandi_hash` | TEXT | Ya | - | - | Kata sandi terenkripsi (bcrypt) |
| 6 | `peran` | TEXT | Ya | - | - | Peran pengguna: `ADMIN` = Administrator, `STAFF` = Staf TU, `TEACHER` = Guru, `PARENT` = Orang tua |
| 7 | `aktif` | BOOLEAN | Ya | - | true | Penanda data aktif/ditampilkan |
| 8 | `terakhir_masuk` | DATETIME | Tidak | - | - | Waktu login terakhir |
| 9 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 10 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

## wali

Data orang tua/wali siswa; dapat terhubung ke akun pengguna untuk portal orang tua.

Kunci primer: `id_wali`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_wali` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik wali |
| 2 | `id_pengguna` | INTEGER | Tidak | FK, UK | - | Rujukan ke pengguna (FK → pengguna.id_pengguna) |
| 3 | `nama_lengkap` | TEXT | Ya | - | - | Nama lengkap |
| 4 | `hubungan` | TEXT | Ya | - | - | Hubungan dengan siswa: `AYAH` = Ayah, `IBU` = Ibu, `WALI` = Wali, `LAINNYA` = Lainnya |
| 5 | `nik` | TEXT | Tidak | - | - | Nomor Induk Kependudukan |
| 6 | `pekerjaan` | TEXT | Tidak | - | - | Pekerjaan |
| 7 | `nama_perusahaan` | TEXT | Tidak | - | - | Nama tempat bekerja |
| 8 | `pendidikan` | TEXT | Tidak | - | - | Pendidikan terakhir |
| 9 | `telepon` | TEXT | Ya | - | - | Nomor telepon/WhatsApp |
| 10 | `email` | TEXT | Tidak | - | - | Alamat email |
| 11 | `alamat` | TEXT | Tidak | - | - | Alamat |
| 12 | `catatan` | TEXT | Tidak | - | - | Catatan tambahan |
| 13 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 14 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

- Relasi: `id_pengguna` → `pengguna` (satu-ke-satu, hapus induk: diisi NULL)

## guru

Data guru; setiap guru memiliki satu akun pengguna.

Kunci primer: `id_guru`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_guru` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik guru |
| 2 | `id_pengguna` | INTEGER | Ya | FK, UK | - | Rujukan ke pengguna (FK → pengguna.id_pengguna) |
| 3 | `kode_pegawai` | TEXT | Tidak | UK | - | Kode/nomor pegawai |
| 4 | `nama_lengkap` | TEXT | Ya | - | - | Nama lengkap |
| 5 | `telepon` | TEXT | Tidak | - | - | Nomor telepon/WhatsApp |
| 6 | `email` | TEXT | Tidak | - | - | Alamat email |
| 7 | `pendidikan` | TEXT | Tidak | - | - | Pendidikan terakhir |
| 8 | `spesialisasi` | TEXT | Tidak | - | - | Bidang keahlian |
| 9 | `tanggal_bergabung` | DATETIME | Tidak | - | - | Tanggal mulai bertugas |
| 10 | `aktif` | BOOLEAN | Ya | - | true | Penanda data aktif/ditampilkan |
| 11 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 12 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

- Relasi: `id_pengguna` → `pengguna` (satu-ke-satu, hapus induk: ikut terhapus)

## tahun_ajaran

Periode tahun ajaran; hanya satu yang berstatus aktif.

Kunci primer: `id_tahun_ajaran`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_tahun_ajaran` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik tahun ajaran |
| 2 | `nama` | TEXT | Ya | UK | - | Nama |
| 3 | `tanggal_mulai` | DATETIME | Ya | - | - | Tanggal mulai |
| 4 | `tanggal_selesai` | DATETIME | Ya | - | - | Tanggal selesai |
| 5 | `status` | TEXT | Ya | - | - | Status data |
| 6 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 7 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

## siswa

Data induk siswa.

Kunci primer: `id_siswa`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_siswa` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik siswa |
| 2 | `kode_siswa` | TEXT | Ya | UK | - | Kode unik siswa internal sekolah |
| 3 | `nis` | TEXT | Tidak | UK | - | Nomor Induk Siswa |
| 4 | `nisn` | TEXT | Tidak | UK | - | Nomor Induk Siswa Nasional |
| 5 | `nik` | TEXT | Tidak | - | - | Nomor Induk Kependudukan |
| 6 | `nama_lengkap` | TEXT | Ya | - | - | Nama lengkap |
| 7 | `nama_panggilan` | TEXT | Tidak | - | - | Nama panggilan |
| 8 | `jenis_kelamin` | TEXT | Ya | - | - | Jenis kelamin (L/P): `L` = Laki-laki, `P` = Perempuan |
| 9 | `tempat_lahir` | TEXT | Tidak | - | - | Tempat lahir |
| 10 | `tanggal_lahir` | DATETIME | Ya | - | - | Tanggal lahir |
| 11 | `agama` | TEXT | Tidak | - | - | Agama |
| 12 | `alamat` | TEXT | Tidak | - | - | Alamat |
| 13 | `rt` | TEXT | Tidak | - | - | RT |
| 14 | `rw` | TEXT | Tidak | - | - | RW |
| 15 | `kelurahan` | TEXT | Tidak | - | - | Kelurahan/desa |
| 16 | `kecamatan` | TEXT | Tidak | - | - | Kecamatan |
| 17 | `kota` | TEXT | Tidak | - | - | Kota/kabupaten |
| 18 | `provinsi` | TEXT | Tidak | - | - | Provinsi |
| 19 | `kode_pos` | TEXT | Tidak | - | - | Kode pos |
| 20 | `anak_ke` | INTEGER | Tidak | - | - | Anak ke- |
| 21 | `jumlah_saudara` | INTEGER | Tidak | - | - | Jumlah saudara kandung |
| 22 | `status_tempat_tinggal` | TEXT | Tidak | - | - | Status tempat tinggal |
| 23 | `tanggal_masuk` | DATETIME | Tidak | - | - | Tanggal diterima sebagai siswa |
| 24 | `tanggal_keluar` | DATETIME | Tidak | - | - | Tanggal keluar/lulus |
| 25 | `alasan_keluar` | TEXT | Tidak | - | - | Alasan keluar |
| 26 | `status` | TEXT | Ya | - | ACTIVE | Status data: `CANDIDATE` = Calon, `ACTIVE` = Aktif, `INACTIVE` = Nonaktif, `GRADUATED` = Lulus, `TRANSFERRED` = Pindah, `WITHDRAWN` = Keluar |
| 27 | `lokasi_foto` | TEXT | Tidak | - | - | Lokasi berkas foto |
| 28 | `catatan` | TEXT | Tidak | - | - | Catatan tambahan |
| 29 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 30 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

## siswa_wali

Tabel penghubung siswa dan wali (relasi banyak-ke-banyak).

Kunci primer: `id_siswa, id_wali` (kunci komposit)

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_siswa` | INTEGER | Ya | PK, FK | - | Rujukan ke siswa (FK → siswa.id_siswa) |
| 2 | `id_wali` | INTEGER | Ya | PK, FK | - | Rujukan ke wali (FK → wali.id_wali) |
| 3 | `wali_utama` | BOOLEAN | Ya | - | false | Penanda wali utama |
| 4 | `boleh_menjemput` | BOOLEAN | Ya | - | false | Penanda wali boleh menjemput |
| 5 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |

- Relasi: `id_siswa` → `siswa` (banyak-ke-satu, hapus induk: ikut terhapus)
- Relasi: `id_wali` → `wali` (banyak-ke-satu, hapus induk: ikut terhapus)

## kelas

Rombongan belajar per tahun ajaran beserta wali kelas.

Kunci primer: `id_kelas`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_kelas` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik kelas |
| 2 | `id_tahun_ajaran` | INTEGER | Ya | FK | - | Rujukan ke tahun ajaran (FK → tahun_ajaran.id_tahun_ajaran) |
| 3 | `kode` | TEXT | Ya | - | - | Kode singkat |
| 4 | `nama` | TEXT | Ya | - | - | Nama |
| 5 | `jenjang` | TEXT | Ya | - | - | Jenjang (Kelompok Bermain/TK A/TK B) |
| 6 | `ruang` | TEXT | Tidak | - | - | Nama ruang |
| 7 | `id_guru` | INTEGER | Tidak | FK | - | Rujukan ke guru (FK → guru.id_guru) |
| 8 | `kapasitas` | INTEGER | Ya | - | 20 | Kapasitas maksimal siswa |
| 9 | `status` | TEXT | Ya | - | ACTIVE | Status data: `ACTIVE` = Aktif, `INACTIVE` = Nonaktif |
| 10 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 11 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

- Unik gabungan: `(id_tahun_ajaran, kode)`
- Relasi: `id_tahun_ajaran` → `tahun_ajaran` (banyak-ke-satu, hapus induk: ditolak)
- Relasi: `id_guru` → `guru` (banyak-ke-satu, hapus induk: diisi NULL)

## penempatan_kelas

Penempatan siswa ke kelas pada satu tahun ajaran.

Kunci primer: `id_penempatan`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_penempatan` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik penempatan kelas |
| 2 | `id_siswa` | INTEGER | Ya | FK | - | Rujukan ke siswa (FK → siswa.id_siswa) |
| 3 | `id_tahun_ajaran` | INTEGER | Ya | FK | - | Rujukan ke tahun ajaran (FK → tahun_ajaran.id_tahun_ajaran) |
| 4 | `id_kelas` | INTEGER | Ya | FK | - | Rujukan ke kelas (FK → kelas.id_kelas) |
| 5 | `tanggal_penempatan` | DATETIME | Ya | - | - | Tanggal siswa ditempatkan di kelas |
| 6 | `status` | TEXT | Ya | - | ACTIVE | Status data: `ACTIVE` = Aktif, `INACTIVE` = Nonaktif, `COMPLETED` = Selesai |
| 7 | `catatan` | TEXT | Tidak | - | - | Catatan tambahan |
| 8 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 9 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

- Unik gabungan: `(id_siswa, id_tahun_ajaran)`
- Relasi: `id_siswa` → `siswa` (banyak-ke-satu, hapus induk: ikut terhapus)
- Relasi: `id_tahun_ajaran` → `tahun_ajaran` (banyak-ke-satu, hapus induk: ditolak)
- Relasi: `id_kelas` → `kelas` (banyak-ke-satu, hapus induk: ditolak)

## periode_ppdb

Gelombang/periode penerimaan peserta didik baru.

Kunci primer: `id_periode_ppdb`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_periode_ppdb` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik periode ppdb |
| 2 | `nama` | TEXT | Ya | - | - | Nama |
| 3 | `tanggal_mulai` | DATETIME | Ya | - | - | Tanggal mulai |
| 4 | `tanggal_selesai` | DATETIME | Ya | - | - | Tanggal selesai |
| 5 | `aktif` | BOOLEAN | Ya | - | false | Penanda data aktif/ditampilkan |
| 6 | `persyaratan` | TEXT | Tidak | - | - | Teks persyaratan pendaftaran |
| 7 | `catatan` | TEXT | Tidak | - | - | Catatan tambahan |
| 8 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 9 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

## pendaftaran_ppdb

Formulir pendaftaran PPDB online dari calon siswa.

Kunci primer: `id_pendaftaran`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_pendaftaran` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik pendaftaran ppdb |
| 2 | `no_pendaftaran` | TEXT | Ya | UK | - | Nomor pendaftaran PPDB |
| 3 | `id_periode_ppdb` | INTEGER | Ya | FK | - | Rujukan ke periode ppdb (FK → periode_ppdb.id_periode_ppdb) |
| 4 | `id_siswa` | INTEGER | Tidak | FK, UK | - | Rujukan ke siswa (FK → siswa.id_siswa) |
| 5 | `nama_calon_siswa` | TEXT | Ya | - | - | Nama calon siswa |
| 6 | `jenis_kelamin_calon` | TEXT | Ya | - | - | Jenis kelamin calon siswa (L/P): `L` = Laki-laki, `P` = Perempuan |
| 7 | `tempat_lahir_calon` | TEXT | Tidak | - | - | Tempat lahir calon siswa |
| 8 | `tanggal_lahir_calon` | DATETIME | Ya | - | - | Tanggal lahir calon siswa |
| 9 | `nama_wali` | TEXT | Ya | - | - | Nama orang tua/wali |
| 10 | `hubungan_wali` | TEXT | Ya | - | - | Hubungan wali dengan calon siswa |
| 11 | `telepon_wali` | TEXT | Ya | - | - | Telepon/WhatsApp wali |
| 12 | `email_wali` | TEXT | Tidak | - | - | Email wali |
| 13 | `alamat_wali` | TEXT | Tidak | - | - | Alamat wali |
| 14 | `jenjang_pilihan` | TEXT | Tidak | - | - | Jenjang yang dipilih |
| 15 | `sekolah_asal` | TEXT | Tidak | - | - | Sekolah asal |
| 16 | `catatan` | TEXT | Tidak | - | - | Catatan tambahan |
| 17 | `status` | TEXT | Ya | - | SUBMITTED | Status data: `DRAFT` = Draf, `SUBMITTED` = Diajukan, `REVISION_REQUIRED` = Perlu revisi, `REVIEW` = Ditinjau, `ACCEPTED` = Diterima, `REJECTED` = Ditolak, `ENROLLED` = Menjadi siswa |
| 18 | `alasan_penolakan` | TEXT | Tidak | - | - | Alasan pendaftaran ditolak |
| 19 | `ditinjau_oleh` | INTEGER | Tidak | FK | - | Admin/staf yang meninjau (FK → pengguna.id_pengguna) |
| 20 | `ditinjau_pada` | DATETIME | Tidak | - | - | Waktu pendaftaran ditinjau |
| 21 | `dikirim_pada` | DATETIME | Tidak | - | - | Waktu formulir dikirim |
| 22 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 23 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

- Relasi: `id_periode_ppdb` → `periode_ppdb` (banyak-ke-satu, hapus induk: ditolak)
- Relasi: `id_siswa` → `siswa` (satu-ke-satu, hapus induk: diisi NULL)
- Relasi: `ditinjau_oleh` → `pengguna` (banyak-ke-satu, hapus induk: diisi NULL)

## dokumen_pendaftaran

Berkas lampiran pendaftaran PPDB.

Kunci primer: `id_dokumen_pendaftaran`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_dokumen_pendaftaran` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik dokumen pendaftaran |
| 2 | `id_pendaftaran` | INTEGER | Ya | FK | - | Rujukan ke pendaftaran ppdb (FK → pendaftaran_ppdb.id_pendaftaran) |
| 3 | `jenis_dokumen` | TEXT | Ya | - | - | Jenis dokumen |
| 4 | `nama_file_asli` | TEXT | Ya | - | - | Nama berkas asli saat diunggah |
| 5 | `lokasi_file` | TEXT | Ya | - | - | Lokasi penyimpanan berkas |
| 6 | `tipe_mime` | TEXT | Ya | - | - | Tipe berkas (MIME) |
| 7 | `ukuran_byte` | INTEGER | Ya | - | - | Ukuran berkas (byte) |
| 8 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |

- Relasi: `id_pendaftaran` → `pendaftaran_ppdb` (banyak-ke-satu, hapus induk: ikut terhapus)

## domain_penilaian

Aspek perkembangan STPPA (agama & moral, fisik motorik, kognitif, dst.).

Kunci primer: `id_domain`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_domain` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik domain penilaian |
| 2 | `nama` | TEXT | Ya | UK | - | Nama |
| 3 | `deskripsi` | TEXT | Tidak | - | - | Deskripsi |
| 4 | `urutan` | INTEGER | Ya | - | 0 | Urutan tampil |
| 5 | `aktif` | BOOLEAN | Ya | - | true | Penanda data aktif/ditampilkan |
| 6 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 7 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

## skala_penilaian

Skala capaian (BB, MB, BSH, BSB).

Kunci primer: `id_skala`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_skala` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik skala penilaian |
| 2 | `kode` | TEXT | Ya | UK | - | Kode singkat |
| 3 | `label` | TEXT | Ya | - | - | Label tampilan |
| 4 | `deskripsi` | TEXT | Tidak | - | - | Deskripsi |
| 5 | `urutan` | INTEGER | Ya | - | 0 | Urutan tampil |
| 6 | `aktif` | BOOLEAN | Ya | - | true | Penanda data aktif/ditampilkan |
| 7 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |

## penilaian

Nilai capaian siswa per domain per periode.

Kunci primer: `id_penilaian`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_penilaian` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik penilaian |
| 2 | `id_siswa` | INTEGER | Ya | FK | - | Rujukan ke siswa (FK → siswa.id_siswa) |
| 3 | `id_tahun_ajaran` | INTEGER | Ya | FK | - | Rujukan ke tahun ajaran (FK → tahun_ajaran.id_tahun_ajaran) |
| 4 | `id_kelas` | INTEGER | Ya | FK | - | Rujukan ke kelas (FK → kelas.id_kelas) |
| 5 | `id_domain` | INTEGER | Ya | FK | - | Rujukan ke domain penilaian (FK → domain_penilaian.id_domain) |
| 6 | `id_skala` | INTEGER | Ya | FK | - | Rujukan ke skala penilaian (FK → skala_penilaian.id_skala) |
| 7 | `periode` | TEXT | Ya | - | - | Periode (Semester 1/2) |
| 8 | `narasi` | TEXT | Tidak | - | - | Catatan naratif capaian |
| 9 | `catatan_guru` | TEXT | Tidak | - | - | Catatan guru |
| 10 | `dibuat_oleh` | INTEGER | Ya | FK | - | Pengguna yang membuat data (FK → pengguna.id_pengguna) |
| 11 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 12 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

- Unik gabungan: `(id_siswa, id_tahun_ajaran, periode, id_domain)`
- Relasi: `id_siswa` → `siswa` (banyak-ke-satu, hapus induk: ikut terhapus)
- Relasi: `id_tahun_ajaran` → `tahun_ajaran` (banyak-ke-satu, hapus induk: ditolak)
- Relasi: `id_kelas` → `kelas` (banyak-ke-satu, hapus induk: ditolak)
- Relasi: `id_domain` → `domain_penilaian` (banyak-ke-satu, hapus induk: ditolak)
- Relasi: `id_skala` → `skala_penilaian` (banyak-ke-satu, hapus induk: ditolak)
- Relasi: `dibuat_oleh` → `pengguna` (banyak-ke-satu, hapus induk: ditolak)

## laporan_perkembangan

Rapor naratif siswa per periode (draf → review → terbit).

Kunci primer: `id_laporan`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_laporan` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik laporan perkembangan |
| 2 | `no_laporan` | TEXT | Ya | UK | - | Nomor laporan |
| 3 | `id_siswa` | INTEGER | Ya | FK | - | Rujukan ke siswa (FK → siswa.id_siswa) |
| 4 | `id_tahun_ajaran` | INTEGER | Ya | FK | - | Rujukan ke tahun ajaran (FK → tahun_ajaran.id_tahun_ajaran) |
| 5 | `id_kelas` | INTEGER | Ya | FK | - | Rujukan ke kelas (FK → kelas.id_kelas) |
| 6 | `periode` | TEXT | Ya | - | - | Periode (Semester 1/2) |
| 7 | `ringkasan` | TEXT | Tidak | - | - | Ringkasan perkembangan |
| 8 | `rekomendasi_rumah` | TEXT | Tidak | - | - | Rekomendasi stimulasi di rumah |
| 9 | `ringkasan_kehadiran` | TEXT | Tidak | - | - | Ringkasan kehadiran pada periode |
| 10 | `status` | TEXT | Ya | - | DRAFT | Status data: `DRAFT` = Draf, `REVIEW` = Ditinjau, `PUBLISHED` = Terbit |
| 11 | `dibuat_oleh` | INTEGER | Ya | FK | - | Pengguna yang membuat data (FK → pengguna.id_pengguna) |
| 12 | `id_guru` | INTEGER | Tidak | FK | - | Rujukan ke guru (FK → guru.id_guru) |
| 13 | `diterbitkan_oleh` | INTEGER | Tidak | FK | - | Admin/staf yang menerbitkan (FK → pengguna.id_pengguna) |
| 14 | `diterbitkan_pada` | DATETIME | Tidak | - | - | Waktu rapor diterbitkan |
| 15 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 16 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

- Unik gabungan: `(id_siswa, id_tahun_ajaran, periode)`
- Relasi: `id_siswa` → `siswa` (banyak-ke-satu, hapus induk: ikut terhapus)
- Relasi: `id_tahun_ajaran` → `tahun_ajaran` (banyak-ke-satu, hapus induk: ditolak)
- Relasi: `id_kelas` → `kelas` (banyak-ke-satu, hapus induk: ditolak)
- Relasi: `dibuat_oleh` → `pengguna` (banyak-ke-satu, hapus induk: ditolak)
- Relasi: `diterbitkan_oleh` → `pengguna` (banyak-ke-satu, hapus induk: diisi NULL)
- Relasi: `id_guru` → `guru` (banyak-ke-satu, hapus induk: diisi NULL)

## detail_laporan

Rincian capaian per domain dalam satu laporan perkembangan.

Kunci primer: `id_detail_laporan`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_detail_laporan` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik detail laporan |
| 2 | `id_laporan` | INTEGER | Ya | FK | - | Rujukan ke laporan perkembangan (FK → laporan_perkembangan.id_laporan) |
| 3 | `id_domain` | INTEGER | Ya | FK | - | Rujukan ke domain penilaian (FK → domain_penilaian.id_domain) |
| 4 | `id_skala` | INTEGER | Ya | FK | - | Rujukan ke skala penilaian (FK → skala_penilaian.id_skala) |
| 5 | `narasi` | TEXT | Tidak | - | - | Catatan naratif capaian |
| 6 | `urutan` | INTEGER | Ya | - | 0 | Urutan tampil |

- Unik gabungan: `(id_laporan, id_domain)`
- Relasi: `id_laporan` → `laporan_perkembangan` (banyak-ke-satu, hapus induk: ikut terhapus)
- Relasi: `id_domain` → `domain_penilaian` (banyak-ke-satu, hapus induk: ditolak)
- Relasi: `id_skala` → `skala_penilaian` (banyak-ke-satu, hapus induk: ditolak)

## presensi

Kehadiran harian siswa.

Kunci primer: `id_presensi`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_presensi` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik presensi |
| 2 | `id_siswa` | INTEGER | Ya | FK | - | Rujukan ke siswa (FK → siswa.id_siswa) |
| 3 | `id_kelas` | INTEGER | Ya | FK | - | Rujukan ke kelas (FK → kelas.id_kelas) |
| 4 | `tanggal` | DATETIME | Ya | - | - | Tanggal |
| 5 | `status` | TEXT | Ya | - | - | Status data |
| 6 | `catatan` | TEXT | Tidak | - | - | Catatan tambahan |
| 7 | `dicatat_oleh` | INTEGER | Ya | FK | - | Pengguna yang mencatat (FK → pengguna.id_pengguna) |
| 8 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 9 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

- Unik gabungan: `(id_siswa, tanggal)`
- Indeks: `(tanggal)`
- Indeks: `(id_siswa, tanggal)`
- Relasi: `id_siswa` → `siswa` (banyak-ke-satu, hapus induk: ikut terhapus)
- Relasi: `id_kelas` → `kelas` (banyak-ke-satu, hapus induk: ditolak)
- Relasi: `dicatat_oleh` → `pengguna` (banyak-ke-satu, hapus induk: ditolak)

## jadwal

Jadwal kegiatan mingguan per kelas.

Kunci primer: `id_jadwal`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_jadwal` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik jadwal |
| 2 | `id_kelas` | INTEGER | Ya | FK | - | Rujukan ke kelas (FK → kelas.id_kelas) |
| 3 | `id_guru` | INTEGER | Tidak | FK | - | Rujukan ke guru (FK → guru.id_guru) |
| 4 | `hari` | INTEGER | Ya | - | - | Hari (1 = Senin … 7 = Minggu) (1=Senin ... 7=Minggu) |
| 5 | `jam_mulai` | TEXT | Ya | - | - | Jam mulai (HH:MM) |
| 6 | `jam_selesai` | TEXT | Ya | - | - | Jam selesai (HH:MM) |
| 7 | `kegiatan` | TEXT | Ya | - | - | Nama kegiatan |
| 8 | `ruang` | TEXT | Tidak | - | - | Nama ruang |
| 9 | `catatan` | TEXT | Tidak | - | - | Catatan tambahan |
| 10 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 11 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

- Relasi: `id_kelas` → `kelas` (banyak-ke-satu, hapus induk: ikut terhapus)
- Relasi: `id_guru` → `guru` (banyak-ke-satu, hapus induk: diisi NULL)

## kegiatan

Kegiatan/dokumentasi sekolah untuk website & portal.

Kunci primer: `id_kegiatan`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_kegiatan` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik kegiatan |
| 2 | `judul` | TEXT | Ya | - | - | Judul |
| 3 | `slug` | TEXT | Ya | UK | - | Slug URL unik |
| 4 | `deskripsi` | TEXT | Ya | - | - | Deskripsi |
| 5 | `waktu_mulai` | DATETIME | Tidak | - | - | Waktu mulai |
| 6 | `waktu_selesai` | DATETIME | Tidak | - | - | Waktu selesai |
| 7 | `lokasi` | TEXT | Tidak | - | - | Lokasi |
| 8 | `gambar_sampul` | TEXT | Tidak | - | - | Gambar sampul |
| 9 | `visibilitas` | TEXT | Ya | - | PUBLIC | Siapa yang boleh melihat: `PUBLIC` = Publik, `PARENT_ONLY` = Khusus orang tua, `INTERNAL` = Internal |
| 10 | `status` | TEXT | Ya | - | DRAFT | Status data: `DRAFT` = Draf, `PUBLISHED` = Terbit, `ARCHIVED` = Diarsipkan |
| 11 | `dibuat_oleh` | INTEGER | Ya | FK | - | Pengguna yang membuat data (FK → pengguna.id_pengguna) |
| 12 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 13 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

- Relasi: `dibuat_oleh` → `pengguna` (banyak-ke-satu, hapus induk: ditolak)

## media_kegiatan

Foto/berkas tambahan suatu kegiatan.

Kunci primer: `id_media`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_media` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik media kegiatan |
| 2 | `id_kegiatan` | INTEGER | Ya | FK | - | Rujukan ke kegiatan (FK → kegiatan.id_kegiatan) |
| 3 | `lokasi_file` | TEXT | Ya | - | - | Lokasi penyimpanan berkas |
| 4 | `nama_file_asli` | TEXT | Ya | - | - | Nama berkas asli saat diunggah |
| 5 | `urutan` | INTEGER | Ya | - | 0 | Urutan tampil |
| 6 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |

- Relasi: `id_kegiatan` → `kegiatan` (banyak-ke-satu, hapus induk: ikut terhapus)

## pengumuman

Pengumuman untuk publik, orang tua, guru, atau kelas tertentu.

Kunci primer: `id_pengumuman`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_pengumuman` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik pengumuman |
| 2 | `judul` | TEXT | Ya | - | - | Judul |
| 3 | `slug` | TEXT | Ya | UK | - | Slug URL unik |
| 4 | `isi` | TEXT | Ya | - | - | Isi pengumuman |
| 5 | `sasaran` | TEXT | Ya | - | - | Sasaran pembaca: `PUBLIC` = Publik, `ALL_PARENTS` = Semua orang tua, `TEACHERS` = Guru, `STAFF` = Staf TU, `CLASS_SPECIFIC` = Kelas tertentu |
| 6 | `id_kelas` | INTEGER | Tidak | FK | - | Rujukan ke kelas (FK → kelas.id_kelas) |
| 7 | `terbit_pada` | DATETIME | Tidak | - | - | Waktu mulai tayang |
| 8 | `kedaluwarsa_pada` | DATETIME | Tidak | - | - | Waktu berakhir/kedaluwarsa |
| 9 | `status` | TEXT | Ya | - | DRAFT | Status data: `DRAFT` = Draf, `PUBLISHED` = Terbit, `ARCHIVED` = Diarsipkan |
| 10 | `lokasi_lampiran` | TEXT | Tidak | - | - | Lokasi berkas lampiran |
| 11 | `dibuat_oleh` | INTEGER | Ya | FK | - | Pengguna yang membuat data (FK → pengguna.id_pengguna) |
| 12 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 13 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

- Relasi: `id_kelas` → `kelas` (banyak-ke-satu, hapus induk: diisi NULL)
- Relasi: `dibuat_oleh` → `pengguna` (banyak-ke-satu, hapus induk: ditolak)

## pengumuman_dibaca

Catatan pengumuman yang sudah dibaca pengguna.

Kunci primer: `id_pengumuman, id_pengguna` (kunci komposit)

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_pengumuman` | INTEGER | Ya | PK, FK | - | Rujukan ke pengumuman (FK → pengumuman.id_pengumuman) |
| 2 | `id_pengguna` | INTEGER | Ya | PK, FK | - | Rujukan ke pengguna (FK → pengguna.id_pengguna) |
| 3 | `dibaca_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu dibaca |

- Relasi: `id_pengumuman` → `pengumuman` (banyak-ke-satu, hapus induk: ikut terhapus)
- Relasi: `id_pengguna` → `pengguna` (banyak-ke-satu, hapus induk: ikut terhapus)

## jenis_biaya

Master komponen biaya (SPP, uang pangkal, seragam, dll.).

Kunci primer: `id_jenis_biaya`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_jenis_biaya` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik jenis biaya |
| 2 | `kode` | TEXT | Ya | UK | - | Kode singkat |
| 3 | `nama` | TEXT | Ya | - | - | Nama |
| 4 | `deskripsi` | TEXT | Tidak | - | - | Deskripsi |
| 5 | `nominal_default` | INTEGER | Ya | - | 0 | Nominal bawaan (rupiah) |
| 6 | `berulang` | BOOLEAN | Ya | - | false | Penanda biaya berulang (bulanan) |
| 7 | `aktif` | BOOLEAN | Ya | - | true | Penanda data aktif/ditampilkan |
| 8 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 9 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

## tagihan

Tagihan (invoice) per siswa.

Kunci primer: `id_tagihan`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_tagihan` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik tagihan |
| 2 | `no_tagihan` | TEXT | Ya | UK | - | Nomor tagihan/invoice |
| 3 | `id_siswa` | INTEGER | Ya | FK | - | Rujukan ke siswa (FK → siswa.id_siswa) |
| 4 | `id_tahun_ajaran` | INTEGER | Tidak | FK | - | Rujukan ke tahun ajaran (FK → tahun_ajaran.id_tahun_ajaran) |
| 5 | `tanggal_terbit` | DATETIME | Ya | - | - | Tanggal tagihan diterbitkan |
| 6 | `jatuh_tempo` | DATETIME | Ya | - | - | Tanggal jatuh tempo |
| 7 | `status` | TEXT | Ya | - | ISSUED | Status data: `DRAFT` = Draf, `ISSUED` = Belum dibayar, `PARTIAL` = Dibayar sebagian, `PAID` = Lunas, `VOID` = Dibatalkan, `OVERDUE` = Lewat jatuh tempo |
| 8 | `catatan` | TEXT | Tidak | - | - | Catatan tambahan |
| 9 | `dibuat_oleh` | INTEGER | Ya | FK | - | Pengguna yang membuat data (FK → pengguna.id_pengguna) |
| 10 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 11 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

- Indeks: `(id_siswa, status)`
- Indeks: `(jatuh_tempo)`
- Relasi: `id_siswa` → `siswa` (banyak-ke-satu, hapus induk: ditolak)
- Relasi: `id_tahun_ajaran` → `tahun_ajaran` (banyak-ke-satu, hapus induk: diisi NULL)
- Relasi: `dibuat_oleh` → `pengguna` (banyak-ke-satu, hapus induk: ditolak)

## detail_tagihan

Baris rincian biaya dalam tagihan.

Kunci primer: `id_detail_tagihan`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_detail_tagihan` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik detail tagihan |
| 2 | `id_tagihan` | INTEGER | Ya | FK | - | Rujukan ke tagihan (FK → tagihan.id_tagihan) |
| 3 | `id_jenis_biaya` | INTEGER | Ya | FK | - | Rujukan ke jenis biaya (FK → jenis_biaya.id_jenis_biaya) |
| 4 | `keterangan` | TEXT | Ya | - | - | Keterangan baris |
| 5 | `jumlah` | INTEGER | Ya | - | 1 | Jumlah (qty) |
| 6 | `harga_satuan` | INTEGER | Ya | - | - | Harga satuan (rupiah) |
| 7 | `subtotal` | INTEGER | Ya | - | - | Jumlah × harga satuan (rupiah) |

- Relasi: `id_tagihan` → `tagihan` (banyak-ke-satu, hapus induk: ikut terhapus)
- Relasi: `id_jenis_biaya` → `jenis_biaya` (banyak-ke-satu, hapus induk: ditolak)

## pembayaran

Kwitansi pembayaran dari orang tua.

Kunci primer: `id_pembayaran`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_pembayaran` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik pembayaran |
| 2 | `no_kwitansi` | TEXT | Ya | UK | - | Nomor kwitansi |
| 3 | `id_siswa` | INTEGER | Ya | FK | - | Rujukan ke siswa (FK → siswa.id_siswa) |
| 4 | `tanggal_bayar` | DATETIME | Ya | - | - | Tanggal pembayaran |
| 5 | `nominal` | INTEGER | Ya | - | - | Nominal (rupiah) |
| 6 | `metode` | TEXT | Ya | - | - | Metode pembayaran: `CASH` = Tunai, `TRANSFER` = Transfer, `QRIS` = QRIS, `OTHER` = Lainnya |
| 7 | `no_referensi` | TEXT | Tidak | - | - | Nomor referensi transfer |
| 8 | `catatan` | TEXT | Tidak | - | - | Catatan tambahan |
| 9 | `lokasi_bukti` | TEXT | Tidak | - | - | Lokasi berkas bukti |
| 10 | `status` | TEXT | Ya | - | POSTED | Status data: `POSTED` = Tercatat, `VOID` = Dibatalkan |
| 11 | `alasan_batal` | TEXT | Tidak | - | - | Alasan pembatalan (void) |
| 12 | `dicatat_oleh` | INTEGER | Ya | FK | - | Pengguna yang mencatat (FK → pengguna.id_pengguna) |
| 13 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 14 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

- Relasi: `id_siswa` → `siswa` (banyak-ke-satu, hapus induk: ditolak)
- Relasi: `dicatat_oleh` → `pengguna` (banyak-ke-satu, hapus induk: ditolak)

## alokasi_pembayaran

Pembagian nominal pembayaran ke satu atau beberapa tagihan.

Kunci primer: `id_alokasi`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_alokasi` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik alokasi pembayaran |
| 2 | `id_pembayaran` | INTEGER | Ya | FK | - | Rujukan ke pembayaran (FK → pembayaran.id_pembayaran) |
| 3 | `id_tagihan` | INTEGER | Ya | FK | - | Rujukan ke tagihan (FK → tagihan.id_tagihan) |
| 4 | `nominal` | INTEGER | Ya | - | - | Nominal (rupiah) |
| 5 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |

- Unik gabungan: `(id_pembayaran, id_tagihan)`
- Relasi: `id_pembayaran` → `pembayaran` (banyak-ke-satu, hapus induk: ikut terhapus)
- Relasi: `id_tagihan` → `tagihan` (banyak-ke-satu, hapus induk: ditolak)

## pengeluaran

Pengeluaran operasional sekolah.

Kunci primer: `id_pengeluaran`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_pengeluaran` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik pengeluaran |
| 2 | `no_pengeluaran` | TEXT | Ya | UK | - | Nomor pengeluaran |
| 3 | `tanggal` | DATETIME | Ya | - | - | Tanggal |
| 4 | `kategori` | TEXT | Ya | - | - | Kategori |
| 5 | `deskripsi` | TEXT | Ya | - | - | Deskripsi |
| 6 | `nominal` | INTEGER | Ya | - | - | Nominal (rupiah) |
| 7 | `pemasok` | TEXT | Tidak | - | - | Nama pemasok/vendor |
| 8 | `metode_bayar` | TEXT | Ya | - | - | Metode pembayaran: `CASH` = Tunai, `TRANSFER` = Transfer, `OTHER` = Lainnya |
| 9 | `lokasi_bukti` | TEXT | Tidak | - | - | Lokasi berkas bukti |
| 10 | `status` | TEXT | Ya | - | POSTED | Status data: `DRAFT` = Draf, `POSTED` = Tercatat, `VOID` = Dibatalkan |
| 11 | `alasan_batal` | TEXT | Tidak | - | - | Alasan pembatalan (void) |
| 12 | `dibuat_oleh` | INTEGER | Ya | FK | - | Pengguna yang membuat data (FK → pengguna.id_pengguna) |
| 13 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 14 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

- Relasi: `dibuat_oleh` → `pengguna` (banyak-ke-satu, hapus induk: ditolak)

## dokumen_siswa

Berkas milik siswa (akta, KK, foto, dll.).

Kunci primer: `id_dokumen_siswa`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_dokumen_siswa` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik dokumen siswa |
| 2 | `id_siswa` | INTEGER | Ya | FK | - | Rujukan ke siswa (FK → siswa.id_siswa) |
| 3 | `jenis_dokumen` | TEXT | Ya | - | - | Jenis dokumen |
| 4 | `nama_file_asli` | TEXT | Ya | - | - | Nama berkas asli saat diunggah |
| 5 | `lokasi_file` | TEXT | Ya | - | - | Lokasi penyimpanan berkas |
| 6 | `tipe_mime` | TEXT | Ya | - | - | Tipe berkas (MIME) |
| 7 | `ukuran_byte` | INTEGER | Ya | - | - | Ukuran berkas (byte) |
| 8 | `visibilitas` | TEXT | Ya | - | STAFF_ONLY | Siapa yang boleh melihat: `STAFF_ONLY` = Khusus staf, `TEACHER` = Guru, `PARENT` = Orang tua |
| 9 | `diunggah_oleh` | INTEGER | Ya | FK | - | Pengguna yang mengunggah (FK → pengguna.id_pengguna) |
| 10 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |

- Relasi: `id_siswa` → `siswa` (banyak-ke-satu, hapus induk: ikut terhapus)
- Relasi: `diunggah_oleh` → `pengguna` (banyak-ke-satu, hapus induk: ditolak)

## log_audit

Jejak aktivitas penting pengguna (login, perubahan data).

Kunci primer: `id_log`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_log` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik log audit |
| 2 | `id_pengguna` | INTEGER | Tidak | FK | - | Rujukan ke pengguna (FK → pengguna.id_pengguna) |
| 3 | `aksi` | TEXT | Ya | - | - | Jenis aksi |
| 4 | `jenis_entitas` | TEXT | Ya | - | - | Nama entitas yang terdampak |
| 5 | `id_entitas` | INTEGER | Tidak | - | - | ID data yang terdampak |
| 6 | `data_sebelum` | TEXT | Tidak | - | - | Data sebelum perubahan (JSON) |
| 7 | `data_sesudah` | TEXT | Tidak | - | - | Data sesudah perubahan (JSON) |
| 8 | `alamat_ip` | TEXT | Tidak | - | - | Alamat IP |
| 9 | `agen_pengguna` | TEXT | Tidak | - | - | User agent peramban |
| 10 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |

- Indeks: `(jenis_entitas, id_entitas)`
- Indeks: `(dibuat_pada)`
- Relasi: `id_pengguna` → `pengguna` (banyak-ke-satu, hapus induk: diisi NULL)

## token_reset_sandi

Token sekali pakai untuk mengatur ulang kata sandi.

Kunci primer: `id_token`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_token` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik token reset sandi |
| 2 | `id_pengguna` | INTEGER | Ya | FK | - | Rujukan ke pengguna (FK → pengguna.id_pengguna) |
| 3 | `hash_token` | TEXT | Ya | UK | - | Hash token reset |
| 4 | `kedaluwarsa_pada` | DATETIME | Ya | - | - | Waktu berakhir/kedaluwarsa |
| 5 | `dipakai_pada` | DATETIME | Tidak | - | - | Waktu token dipakai |
| 6 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |

- Relasi: `id_pengguna` → `pengguna` (banyak-ke-satu, hapus induk: ikut terhapus)

## pengaturan_situs

Pengaturan website berbentuk pasangan kunci–nilai.

Kunci primer: `kunci`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `kunci` | TEXT | Ya | PK | - | Nama pengaturan |
| 2 | `nilai` | TEXT | Ya | - | - | Nilai pengaturan |
| 3 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

## slide_beranda

Slide besar di bagian atas beranda website.

Kunci primer: `id_slide`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_slide` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik slide beranda |
| 2 | `label_atas` | TEXT | Ya | - | - | Teks kecil di atas judul |
| 3 | `judul` | TEXT | Ya | - | - | Judul |
| 4 | `aksen` | TEXT | Tidak | - | - | Kata yang ditonjolkan pada judul |
| 5 | `deskripsi` | TEXT | Ya | - | - | Deskripsi |
| 6 | `gambar` | TEXT | Ya | - | - | Lokasi/URL gambar |
| 7 | `teks_alt_gambar` | TEXT | Tidak | - | - | Teks alternatif gambar |
| 8 | `urutan` | INTEGER | Ya | - | 0 | Urutan tampil |
| 9 | `aktif` | BOOLEAN | Ya | - | true | Penanda data aktif/ditampilkan |
| 10 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 11 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

## galeri

Foto galeri website.

Kunci primer: `id_galeri`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_galeri` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik galeri |
| 2 | `judul` | TEXT | Ya | - | - | Judul |
| 3 | `kategori` | TEXT | Ya | - | - | Kategori |
| 4 | `gambar` | TEXT | Ya | - | - | Lokasi/URL gambar |
| 5 | `urutan` | INTEGER | Ya | - | 0 | Urutan tampil |
| 6 | `aktif` | BOOLEAN | Ya | - | true | Penanda data aktif/ditampilkan |
| 7 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 8 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

## fasilitas

Daftar fasilitas sekolah di website.

Kunci primer: `id_fasilitas`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_fasilitas` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik fasilitas |
| 2 | `judul` | TEXT | Ya | - | - | Judul |
| 3 | `deskripsi` | TEXT | Ya | - | - | Deskripsi |
| 4 | `gambar` | TEXT | Ya | - | - | Lokasi/URL gambar |
| 5 | `urutan` | INTEGER | Ya | - | 0 | Urutan tampil |
| 6 | `aktif` | BOOLEAN | Ya | - | true | Penanda data aktif/ditampilkan |
| 7 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 8 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

## testimoni

Testimoni orang tua di website.

Kunci primer: `id_testimoni`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_testimoni` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik testimoni |
| 2 | `nama` | TEXT | Ya | - | - | Nama |
| 3 | `hubungan` | TEXT | Ya | - | - | Hubungan dengan siswa |
| 4 | `kutipan` | TEXT | Ya | - | - | Isi testimoni |
| 5 | `urutan` | INTEGER | Ya | - | 0 | Urutan tampil |
| 6 | `aktif` | BOOLEAN | Ya | - | true | Penanda data aktif/ditampilkan |
| 7 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 8 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |

## tanya_jawab

Pertanyaan yang sering diajukan (FAQ) di website.

Kunci primer: `id_tanya_jawab`

| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |
| --: | --- | --- | :-: | :-: | --- | --- |
| 1 | `id_tanya_jawab` | INTEGER | Ya | PK | AUTO_INCREMENT | ID unik tanya jawab |
| 2 | `pertanyaan` | TEXT | Ya | - | - | Pertanyaan |
| 3 | `jawaban` | TEXT | Ya | - | - | Jawaban |
| 4 | `kategori` | TEXT | Ya | - | - | Kategori |
| 5 | `urutan` | INTEGER | Ya | - | 0 | Urutan tampil |
| 6 | `aktif` | BOOLEAN | Ya | - | true | Penanda data aktif/ditampilkan |
| 7 | `dibuat_pada` | DATETIME | Ya | - | CURRENT_TIMESTAMP | Waktu data dibuat |
| 8 | `diperbarui_pada` | DATETIME | Ya | - | otomatis saat diubah | Waktu data terakhir diubah |
