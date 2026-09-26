/**
 * Generator dokumentasi basis data dari prisma/schema.prisma.
 *
 * Menghasilkan (semua memakai nama tabel/kolom bahasa Indonesia dari @@map/@map):
 *   docs/kamus-data.md                 — kamus data per tabel
 *   docs/diagram/src/erd-*.puml        — ERD notasi crow's foot (lengkap + per modul)
 *   docs/diagram/src/erd-konseptual.puml — ERD notasi Chen (entitas inti)
 *   docs/diagram/src/lrs.puml          — Logical Record Structure (kunci saja)
 *   docs/diagram/src/class-*.puml      — class diagram UML per modul
 *
 * Jalankan: npx tsx scripts/generate-docs.ts
 * Render gambar: lihat docs/README.md (PlantUML + Graphviz).
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.join(__dirname, '..')
const SRC = path.join(ROOT, 'docs', 'diagram', 'src')

// ---------------------------------------------------------------- parser

interface Field {
  name: string
  column: string
  type: string
  optional: boolean
  list: boolean
  isId: boolean
  isUnique: boolean
  isUpdatedAt: boolean
  defaultValue?: string
  comment?: string
  relation?: { fields: string[]; references: string[]; onDelete?: string }
}
interface Model {
  name: string
  table: string
  fields: Field[]
  compositeId?: string[]
  uniques: string[][]
  indexes: string[][]
}

const SCALARS = new Set(['Int', 'String', 'Boolean', 'DateTime', 'Float', 'Decimal', 'BigInt', 'Json', 'Bytes'])

function parseSchema(text: string): Model[] {
  const models: Model[] = []
  const blocks = text.matchAll(/^model (\w+) \{([\s\S]*?)^\}/gm)
  for (const [, name, body] of blocks) {
    const model: Model = { name, table: name, fields: [], uniques: [], indexes: [] }
    for (const raw of body.split('\n')) {
      const line = raw.trim()
      if (!line || line.startsWith('//')) continue
      if (line.startsWith('@@')) {
        const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)
        const map = line.match(/^@@map\("([^"]+)"\)/)
        if (map) model.table = map[1]
        const id = line.match(/^@@id\(\[([^\]]+)\]\)/)
        if (id) model.compositeId = list(id[1])
        const uq = line.match(/^@@unique\(\[([^\]]+)\]\)/)
        if (uq) model.uniques.push(list(uq[1]))
        const ix = line.match(/^@@index\(\[([^\]]+)\]\)/)
        if (ix) model.indexes.push(list(ix[1]))
        continue
      }
      const m = line.match(/^(\w+)\s+(\w+)(\?|\[\])?\s*(.*)$/)
      if (!m) continue
      const [, fname, type, mod, rest0] = m
      const [rest, comment] = rest0.split(/\s\/\/\s?/)
      const field: Field = {
        name: fname,
        column: rest.match(/@map\("([^"]+)"\)/)?.[1] ?? fname,
        type,
        optional: mod === '?',
        list: mod === '[]',
        isId: /@id\b/.test(rest),
        isUnique: /@unique\b/.test(rest),
        isUpdatedAt: /@updatedAt\b/.test(rest),
        defaultValue: rest.match(/@default\(((?:[^()]|\([^()]*\))*)\)/)?.[1],
        comment: comment?.trim(),
      }
      const rel = rest.match(/@relation\(([^)]*)\)/)
      if (rel && /fields:/.test(rel[1])) {
        const arr = (key: string) => rel[1].match(new RegExp(`${key}:\\s*\\[([^\\]]+)\\]`))?.[1].split(',').map((x) => x.trim()) ?? []
        field.relation = { fields: arr('fields'), references: arr('references'), onDelete: rel[1].match(/onDelete:\s*(\w+)/)?.[1] }
      }
      model.fields.push(field)
    }
    models.push(model)
  }
  return models
}

const models = parseSchema(fs.readFileSync(path.join(ROOT, 'prisma', 'schema.prisma'), 'utf8'))
const byName = new Map(models.map((m) => [m.name, m]))
const scalarFields = (m: Model) => m.fields.filter((f) => SCALARS.has(f.type) && !f.list)
const col = (m: Model, field: string) => m.fields.find((f) => f.name === field)?.column ?? field

interface Rel { child: Model; parent: Model; fkColumns: string[]; optional: boolean; oneToOne: boolean; onDelete: string }
const relations: Rel[] = []
for (const child of models) {
  for (const f of child.fields) {
    if (!f.relation) continue
    const parent = byName.get(f.type)!
    const fkFields = f.relation.fields
    const oneToOne =
      (fkFields.length === 1 && child.fields.find((x) => x.name === fkFields[0])?.isUnique) ||
      child.uniques.some((u) => u.length === fkFields.length && u.every((x) => fkFields.includes(x)))
    relations.push({
      child,
      parent,
      fkColumns: fkFields.map((x) => col(child, x)),
      optional: f.optional,
      oneToOne: Boolean(oneToOne),
      onDelete: f.relation.onDelete ?? 'Restrict',
    })
  }
}
const fkColumnsOf = (m: Model) => new Set(relations.filter((r) => r.child === m).flatMap((r) => r.fkColumns))
const pkColumnsOf = (m: Model) => (m.compositeId ? m.compositeId.map((x) => col(m, x)) : scalarFields(m).filter((f) => f.isId).map((f) => f.column))
const refOf = (m: Model, column: string) => relations.find((r) => r.child === m && r.fkColumns.includes(column))

// ---------------------------------------------------------------- kosakata

const SQL_TYPE: Record<string, string> = { Int: 'INTEGER', String: 'TEXT', Boolean: 'BOOLEAN', DateTime: 'DATETIME', Float: 'REAL' }

const TABLE_DESC: Record<string, string> = {
  pengguna: 'Akun login semua peran (admin, staf TU, guru, orang tua).',
  wali: 'Data orang tua/wali siswa; dapat terhubung ke akun pengguna untuk portal orang tua.',
  guru: 'Data guru; setiap guru memiliki satu akun pengguna.',
  tahun_ajaran: 'Periode tahun ajaran; hanya satu yang berstatus aktif.',
  siswa: 'Data induk siswa.',
  siswa_wali: 'Tabel penghubung siswa dan wali (relasi banyak-ke-banyak).',
  kelas: 'Rombongan belajar per tahun ajaran beserta wali kelas.',
  penempatan_kelas: 'Penempatan siswa ke kelas pada satu tahun ajaran.',
  periode_ppdb: 'Gelombang/periode penerimaan peserta didik baru.',
  pendaftaran_ppdb: 'Formulir pendaftaran PPDB online dari calon siswa.',
  dokumen_pendaftaran: 'Berkas lampiran pendaftaran PPDB.',
  domain_penilaian: 'Aspek perkembangan STPPA (agama & moral, fisik motorik, kognitif, dst.).',
  skala_penilaian: 'Skala capaian (BB, MB, BSH, BSB).',
  penilaian: 'Nilai capaian siswa per domain per periode.',
  laporan_perkembangan: 'Rapor naratif siswa per periode (draf → review → terbit).',
  detail_laporan: 'Rincian capaian per domain dalam satu laporan perkembangan.',
  presensi: 'Kehadiran harian siswa.',
  jadwal: 'Jadwal kegiatan mingguan per kelas.',
  kegiatan: 'Kegiatan/dokumentasi sekolah untuk website & portal.',
  media_kegiatan: 'Foto/berkas tambahan suatu kegiatan.',
  pengumuman: 'Pengumuman untuk publik, orang tua, guru, atau kelas tertentu.',
  pengumuman_dibaca: 'Catatan pengumuman yang sudah dibaca pengguna.',
  jenis_biaya: 'Master komponen biaya (SPP, uang pangkal, seragam, dll.).',
  tagihan: 'Tagihan (invoice) per siswa.',
  detail_tagihan: 'Baris rincian biaya dalam tagihan.',
  pembayaran: 'Kwitansi pembayaran dari orang tua.',
  alokasi_pembayaran: 'Pembagian nominal pembayaran ke satu atau beberapa tagihan.',
  pengeluaran: 'Pengeluaran operasional sekolah.',
  dokumen_siswa: 'Berkas milik siswa (akta, KK, foto, dll.).',
  log_audit: 'Jejak aktivitas penting pengguna (login, perubahan data).',
  token_reset_sandi: 'Token sekali pakai untuk mengatur ulang kata sandi.',
  pengaturan_situs: 'Pengaturan website berbentuk pasangan kunci–nilai.',
  slide_beranda: 'Slide besar di bagian atas beranda website.',
  galeri: 'Foto galeri website.',
  fasilitas: 'Daftar fasilitas sekolah di website.',
  testimoni: 'Testimoni orang tua di website.',
  tanya_jawab: 'Pertanyaan yang sering diajukan (FAQ) di website.',
}

const COL_DESC: Record<string, string> = {
  nama: 'Nama', email: 'Alamat email', nama_pengguna: 'Nama pengguna (username) untuk login', kata_sandi_hash: 'Kata sandi terenkripsi (bcrypt)',
  peran: 'Peran pengguna', aktif: 'Penanda data aktif/ditampilkan', terakhir_masuk: 'Waktu login terakhir', nama_lengkap: 'Nama lengkap',
  hubungan: 'Hubungan dengan siswa', nik: 'Nomor Induk Kependudukan', pekerjaan: 'Pekerjaan', nama_perusahaan: 'Nama tempat bekerja',
  pendidikan: 'Pendidikan terakhir', telepon: 'Nomor telepon/WhatsApp', alamat: 'Alamat', catatan: 'Catatan tambahan',
  kode_pegawai: 'Kode/nomor pegawai', spesialisasi: 'Bidang keahlian', tanggal_bergabung: 'Tanggal mulai bertugas',
  tanggal_mulai: 'Tanggal mulai', tanggal_selesai: 'Tanggal selesai', status: 'Status data', kode_siswa: 'Kode unik siswa internal sekolah',
  nis: 'Nomor Induk Siswa', nisn: 'Nomor Induk Siswa Nasional', nama_panggilan: 'Nama panggilan', jenis_kelamin: 'Jenis kelamin (L/P)',
  tempat_lahir: 'Tempat lahir', tanggal_lahir: 'Tanggal lahir', agama: 'Agama', rt: 'RT', rw: 'RW', kelurahan: 'Kelurahan/desa',
  kecamatan: 'Kecamatan', kota: 'Kota/kabupaten', provinsi: 'Provinsi', kode_pos: 'Kode pos', anak_ke: 'Anak ke-',
  jumlah_saudara: 'Jumlah saudara kandung', status_tempat_tinggal: 'Status tempat tinggal', tanggal_masuk: 'Tanggal diterima sebagai siswa',
  tanggal_keluar: 'Tanggal keluar/lulus', alasan_keluar: 'Alasan keluar', lokasi_foto: 'Lokasi berkas foto', wali_utama: 'Penanda wali utama',
  boleh_menjemput: 'Penanda wali boleh menjemput', kode: 'Kode singkat', jenjang: 'Jenjang (Kelompok Bermain/TK A/TK B)', ruang: 'Nama ruang',
  kapasitas: 'Kapasitas maksimal siswa', tanggal_penempatan: 'Tanggal siswa ditempatkan di kelas', persyaratan: 'Teks persyaratan pendaftaran',
  no_pendaftaran: 'Nomor pendaftaran PPDB', nama_calon_siswa: 'Nama calon siswa', jenis_kelamin_calon: 'Jenis kelamin calon siswa (L/P)',
  tempat_lahir_calon: 'Tempat lahir calon siswa', tanggal_lahir_calon: 'Tanggal lahir calon siswa', nama_wali: 'Nama orang tua/wali',
  hubungan_wali: 'Hubungan wali dengan calon siswa', telepon_wali: 'Telepon/WhatsApp wali', email_wali: 'Email wali', alamat_wali: 'Alamat wali',
  jenjang_pilihan: 'Jenjang yang dipilih', sekolah_asal: 'Sekolah asal', alasan_penolakan: 'Alasan pendaftaran ditolak',
  ditinjau_pada: 'Waktu pendaftaran ditinjau', dikirim_pada: 'Waktu formulir dikirim', jenis_dokumen: 'Jenis dokumen',
  nama_file_asli: 'Nama berkas asli saat diunggah', lokasi_file: 'Lokasi penyimpanan berkas', tipe_mime: 'Tipe berkas (MIME)',
  ukuran_byte: 'Ukuran berkas (byte)', deskripsi: 'Deskripsi', urutan: 'Urutan tampil', label: 'Label tampilan', periode: 'Periode (Semester 1/2)',
  narasi: 'Catatan naratif capaian', catatan_guru: 'Catatan guru', no_laporan: 'Nomor laporan', ringkasan: 'Ringkasan perkembangan',
  rekomendasi_rumah: 'Rekomendasi stimulasi di rumah', ringkasan_kehadiran: 'Ringkasan kehadiran pada periode', diterbitkan_pada: 'Waktu rapor diterbitkan',
  tanggal: 'Tanggal', hari: 'Hari (1 = Senin … 7 = Minggu)', jam_mulai: 'Jam mulai (HH:MM)', jam_selesai: 'Jam selesai (HH:MM)', kegiatan: 'Nama kegiatan',
  judul: 'Judul', slug: 'Slug URL unik', waktu_mulai: 'Waktu mulai', waktu_selesai: 'Waktu selesai', lokasi: 'Lokasi', gambar_sampul: 'Gambar sampul',
  visibilitas: 'Siapa yang boleh melihat', isi: 'Isi pengumuman', sasaran: 'Sasaran pembaca', terbit_pada: 'Waktu mulai tayang',
  kedaluwarsa_pada: 'Waktu berakhir/kedaluwarsa', lokasi_lampiran: 'Lokasi berkas lampiran', dibaca_pada: 'Waktu dibaca',
  nominal_default: 'Nominal bawaan (rupiah)', berulang: 'Penanda biaya berulang (bulanan)', no_tagihan: 'Nomor tagihan/invoice',
  tanggal_terbit: 'Tanggal tagihan diterbitkan', jatuh_tempo: 'Tanggal jatuh tempo', keterangan: 'Keterangan baris', jumlah: 'Jumlah (qty)',
  harga_satuan: 'Harga satuan (rupiah)', subtotal: 'Jumlah × harga satuan (rupiah)', no_kwitansi: 'Nomor kwitansi', tanggal_bayar: 'Tanggal pembayaran',
  nominal: 'Nominal (rupiah)', metode: 'Metode pembayaran', no_referensi: 'Nomor referensi transfer', lokasi_bukti: 'Lokasi berkas bukti',
  alasan_batal: 'Alasan pembatalan (void)', no_pengeluaran: 'Nomor pengeluaran', kategori: 'Kategori', pemasok: 'Nama pemasok/vendor',
  metode_bayar: 'Metode pembayaran', aksi: 'Jenis aksi', jenis_entitas: 'Nama entitas yang terdampak', id_entitas: 'ID data yang terdampak',
  data_sebelum: 'Data sebelum perubahan (JSON)', data_sesudah: 'Data sesudah perubahan (JSON)', alamat_ip: 'Alamat IP', agen_pengguna: 'User agent peramban',
  hash_token: 'Hash token reset', dipakai_pada: 'Waktu token dipakai', kunci: 'Nama pengaturan', nilai: 'Nilai pengaturan', label_atas: 'Teks kecil di atas judul',
  aksen: 'Kata yang ditonjolkan pada judul', gambar: 'Lokasi/URL gambar', teks_alt_gambar: 'Teks alternatif gambar', kutipan: 'Isi testimoni',
  pertanyaan: 'Pertanyaan', jawaban: 'Jawaban', dibuat_pada: 'Waktu data dibuat', diperbarui_pada: 'Waktu data terakhir diubah',
}

const ACTOR_COL: Record<string, string> = {
  dibuat_oleh: 'Pengguna yang membuat data', dicatat_oleh: 'Pengguna yang mencatat', ditinjau_oleh: 'Admin/staf yang meninjau',
  diterbitkan_oleh: 'Admin/staf yang menerbitkan', diunggah_oleh: 'Pengguna yang mengunggah',
}

const VALUE_LABEL: Record<string, string> = {
  ADMIN: 'Administrator', STAFF: 'Staf TU', TEACHER: 'Guru', PARENT: 'Orang tua', AYAH: 'Ayah', IBU: 'Ibu', WALI: 'Wali', LAINNYA: 'Lainnya',
  PLANNED: 'Perencanaan', ACTIVE: 'Aktif', CLOSED: 'Selesai', CANDIDATE: 'Calon', INACTIVE: 'Nonaktif', GRADUATED: 'Lulus', TRANSFERRED: 'Pindah',
  WITHDRAWN: 'Keluar', COMPLETED: 'Selesai', DRAFT: 'Draf', SUBMITTED: 'Diajukan', REVISION_REQUIRED: 'Perlu revisi', REVIEW: 'Ditinjau',
  ACCEPTED: 'Diterima', REJECTED: 'Ditolak', ENROLLED: 'Menjadi siswa', PUBLISHED: 'Terbit', ARCHIVED: 'Diarsipkan', PRESENT: 'Hadir', SICK: 'Sakit',
  PERMISSION: 'Izin', ABSENT: 'Alpa', PUBLIC: 'Publik', PARENT_ONLY: 'Khusus orang tua', INTERNAL: 'Internal', ALL_PARENTS: 'Semua orang tua',
  TEACHERS: 'Guru', CLASS_SPECIFIC: 'Kelas tertentu', ISSUED: 'Belum dibayar', PARTIAL: 'Dibayar sebagian', PAID: 'Lunas', VOID: 'Dibatalkan',
  OVERDUE: 'Lewat jatuh tempo', CASH: 'Tunai', TRANSFER: 'Transfer', QRIS: 'QRIS', OTHER: 'Lainnya', POSTED: 'Tercatat', STAFF_ONLY: 'Khusus staf',
  PARENT_VISIBLE: 'Orang tua', L: 'Laki-laki', P: 'Perempuan',
}

function describe(m: Model, f: Field): string {
  const ref = refOf(m, f.column)
  const pk = pkColumnsOf(m).includes(f.column)
  let text: string
  if (ref) {
    text = `${ACTOR_COL[f.column] ?? `Rujukan ke ${ref.parent.table.replace(/_/g, ' ')}`} (FK → ${ref.parent.table}.${pkColumnsOf(ref.parent)[0]})`
  } else if (pk && f.column.startsWith('id_')) {
    text = `ID unik ${m.table.replace(/_/g, ' ')}`
  } else {
    text = COL_DESC[f.column] ?? f.column.replace(/_/g, ' ')
  }
  if (f.comment) {
    const values = f.comment.split('|').map((v) => v.trim()).filter((v) => /^[A-Z_]+$/.test(v))
    if (values.length > 1) text += `: ${values.map((v) => `\`${v}\` = ${VALUE_LABEL[v] ?? v}`).join(', ')}`
    else if (!values.length) text += ` (${f.comment})`
  }
  return text
}

function fmtDefault(f: Field) {
  if (!f.defaultValue) return f.isUpdatedAt ? 'otomatis saat diubah' : '-'
  if (f.defaultValue === 'autoincrement()') return 'AUTO_INCREMENT'
  if (f.defaultValue === 'now()') return 'CURRENT_TIMESTAMP'
  return f.defaultValue.replace(/"/g, '')
}

// ---------------------------------------------------------------- modul

const MODULES: { key: string; title: string; tables: string[] }[] = [
  { key: 'pengguna', title: 'Pengguna & Hak Akses', tables: ['pengguna', 'guru', 'wali', 'token_reset_sandi', 'log_audit', 'pengumuman_dibaca'] },
  { key: 'akademik', title: 'Kesiswaan & Akademik', tables: ['siswa', 'wali', 'siswa_wali', 'tahun_ajaran', 'kelas', 'penempatan_kelas', 'guru', 'jadwal', 'presensi', 'dokumen_siswa'] },
  { key: 'ppdb', title: 'Penerimaan Peserta Didik Baru (PPDB)', tables: ['periode_ppdb', 'pendaftaran_ppdb', 'dokumen_pendaftaran', 'siswa'] },
  { key: 'penilaian', title: 'Penilaian & Laporan Perkembangan', tables: ['domain_penilaian', 'skala_penilaian', 'penilaian', 'laporan_perkembangan', 'detail_laporan'] },
  { key: 'keuangan', title: 'Keuangan', tables: ['jenis_biaya', 'tagihan', 'detail_tagihan', 'pembayaran', 'alokasi_pembayaran', 'pengeluaran'] },
  { key: 'informasi', title: 'Informasi & Konten Website', tables: ['kegiatan', 'media_kegiatan', 'pengumuman', 'pengumuman_dibaca', 'pengaturan_situs', 'slide_beranda', 'galeri', 'fasilitas', 'testimoni', 'tanya_jawab'] },
]
const byTable = new Map(models.map((m) => [m.table, m]))

// ---------------------------------------------------------------- plantuml helpers

const STYLE = `skinparam backgroundColor #FFFFFF
skinparam shadowing false
skinparam defaultFontName "DejaVu Sans"
skinparam roundCorner 8
skinparam linetype ortho
skinparam ArrowColor #7a3f86
skinparam class {
  BackgroundColor #FDF8FD
  BorderColor #A64CA6
  HeaderBackgroundColor #F3E3F3
  FontColor #1f1a2e
}
hide circle`

const puml = (name: string, title: string, body: string) =>
  `' Dibuat otomatis oleh scripts/generate-docs.ts — jangan diedit manual.\n@startuml ${name}\n${STYLE}\ntitle ${title}\n\n${body}\n@enduml\n`

function entityBlock(m: Model, mode: 'full' | 'keys' | 'stub') {
  const pks = pkColumnsOf(m)
  const fks = fkColumnsOf(m)
  const lines: string[] = []
  const fields = scalarFields(m)
  const pkFields = fields.filter((f) => pks.includes(f.column))
  const others = fields.filter((f) => !pks.includes(f.column))
  const fmt = (f: Field) => {
    const tags = [pks.includes(f.column) ? 'PK' : '', fks.has(f.column) ? 'FK' : '', f.isUnique && !pks.includes(f.column) ? 'UK' : ''].filter(Boolean)
    const req = !f.optional ? '* ' : '  '
    return `  ${req}${f.column} : ${SQL_TYPE[f.type] ?? f.type}${tags.length ? ` <<${tags.join(',')}>>` : ''}`
  }
  lines.push(...pkFields.map(fmt))
  if (mode === 'stub') {
    // Entitas di luar modul: tampil ringkas (kunci saja)
  } else {
    lines.push('  --')
    const shown = mode === 'keys' ? others.filter((f) => fks.has(f.column)) : others
    lines.push(...shown.map(fmt))
  }
  const color = mode === 'stub' ? ' #EEEEEE' : ''
  return `entity "${m.table}" as ${m.table}${color} {\n${lines.join('\n')}\n}`
}

function relationLine(r: Rel, label = true) {
  const left = r.optional ? '|o' : '||'
  const right = r.oneToOne ? 'o|' : 'o{'
  return `${r.parent.table} ${left}--${right} ${r.child.table}${label ? ` : ${r.fkColumns.join(', ')}` : ''}`
}

// ---------------------------------------------------------------- tulis berkas

fs.mkdirSync(SRC, { recursive: true })
const written: string[] = []
const write = (file: string, content: string) => {
  fs.writeFileSync(path.join(SRC, file), content)
  written.push(file)
}

// ERD lengkap
write(
  'erd-lengkap.puml',
  puml(
    'erd-lengkap',
    "ERD Sistem Informasi TK Orchid (lengkap, notasi crow's foot)",
    `left to right direction\n${models.map((m) => entityBlock(m, 'full')).join('\n\n')}\n\n${relations.map((r) => relationLine(r, false)).join('\n')}`,
  ),
)

// ERD per modul
for (const mod of MODULES) {
  const inside = new Set(mod.tables)
  const rels = relations.filter((r) => inside.has(r.child.table) || inside.has(r.parent.table))
  const involved = new Set(rels.flatMap((r) => [r.child.table, r.parent.table]).concat(mod.tables))
  const blocks = [...involved].map((t) => entityBlock(byTable.get(t)!, inside.has(t) ? 'full' : 'stub'))
  write(
    `erd-${mod.key}.puml`,
    puml(`erd-${mod.key}`, `ERD Modul ${mod.title}`, `${blocks.join('\n\n')}\n\n${rels.map((r) => relationLine(r)).join('\n')}\n\nlegend right\n  Abu-abu = entitas modul lain (hanya kunci)\n  PK = primary key, FK = foreign key, UK = unique\n  * = wajib diisi (NOT NULL)\nendlegend`),
  )
}

// LRS
write(
  'lrs.puml',
  puml(
    'lrs',
    'Logical Record Structure (LRS) TK Orchid',
    `left to right direction\n${models.map((m) => entityBlock(m, 'keys')).join('\n\n')}\n\n${relations.map((r) => relationLine(r, false)).join('\n')}`,
  ),
)

// ERD konseptual (Chen) — entitas inti, atribut kunci & penting, nama relasi berupa kata kerja
const CHEN_ENTITIES: Record<string, string[]> = {
  pengguna: ['id_pengguna', 'nama', 'email', 'peran'],
  guru: ['id_guru', 'nama_lengkap', 'kode_pegawai'],
  wali: ['id_wali', 'nama_lengkap', 'hubungan', 'telepon'],
  siswa: ['id_siswa', 'kode_siswa', 'nama_lengkap', 'tanggal_lahir'],
  tahun_ajaran: ['id_tahun_ajaran', 'nama', 'status'],
  kelas: ['id_kelas', 'nama', 'jenjang', 'kapasitas'],
  periode_ppdb: ['id_periode_ppdb', 'nama'],
  pendaftaran_ppdb: ['id_pendaftaran', 'no_pendaftaran', 'status'],
  presensi: ['id_presensi', 'tanggal', 'status'],
  penilaian: ['id_penilaian', 'periode', 'narasi'],
  domain_penilaian: ['id_domain', 'nama'],
  skala_penilaian: ['id_skala', 'kode'],
  laporan_perkembangan: ['id_laporan', 'no_laporan', 'status'],
  jenis_biaya: ['id_jenis_biaya', 'nama', 'nominal_default'],
  tagihan: ['id_tagihan', 'no_tagihan', 'jatuh_tempo', 'status'],
  pembayaran: ['id_pembayaran', 'no_kwitansi', 'nominal'],
  pengumuman: ['id_pengumuman', 'judul', 'sasaran'],
  kegiatan: ['id_kegiatan', 'judul'],
}
const CHEN_RELS: [string, string, string, string, string][] = [
  // [entitas A, kardinalitas A, nama relasi, kardinalitas B, entitas B]
  ['pengguna', '1', 'MEMILIKI_AKUN_GURU', '1', 'guru'],
  ['pengguna', '1', 'MEMILIKI_AKUN_WALI', '1', 'wali'],
  ['siswa', 'N', 'DIASUH', 'N', 'wali'],
  ['tahun_ajaran', '1', 'MEMUAT', 'N', 'kelas'],
  ['guru', '1', 'MENJADI_WALI_KELAS', 'N', 'kelas'],
  ['siswa', 'N', 'DITEMPATKAN', 'N', 'kelas'],
  ['periode_ppdb', '1', 'MENERIMA', 'N', 'pendaftaran_ppdb'],
  ['pendaftaran_ppdb', '1', 'MENJADI', '1', 'siswa'],
  ['siswa', '1', 'DICATAT_HADIR', 'N', 'presensi'],
  ['siswa', '1', 'DINILAI', 'N', 'penilaian'],
  ['domain_penilaian', '1', 'DINILAI_PADA', 'N', 'penilaian'],
  ['skala_penilaian', '1', 'MENGUKUR', 'N', 'penilaian'],
  ['siswa', '1', 'MENERIMA_RAPOR', 'N', 'laporan_perkembangan'],
  ['siswa', '1', 'DITAGIH', 'N', 'tagihan'],
  ['tagihan', 'N', 'BERISI', 'N', 'jenis_biaya'],
  ['pembayaran', 'N', 'MELUNASI', 'N', 'tagihan'],
  ['pengguna', '1', 'MENERBITKAN', 'N', 'pengumuman'],
  ['pengguna', '1', 'MEMPUBLIKASIKAN', 'N', 'kegiatan'],
]
{
  const ents = Object.entries(CHEN_ENTITIES).map(([t, attrs]) => {
    const pks = pkColumnsOf(byTable.get(t)!)
    return `entity ${t.toUpperCase()} {\n${attrs.map((a) => `  ${a}${pks.includes(a) ? ' <<key>>' : ''}`).join('\n')}\n}`
  })
  const rels = CHEN_RELS.map(([a, ca, name, cb, b]) => `relationship ${name} {\n}\n${a.toUpperCase()} -${ca}- ${name}\n${name} -${cb}- ${b.toUpperCase()}`)
  write('erd-konseptual.puml', `' Dibuat otomatis oleh scripts/generate-docs.ts — jangan diedit manual.\n@startchen erd-konseptual\nleft to right direction\n\n${ents.join('\n\n')}\n\n${rels.join('\n\n')}\n@endchen\n`)
}

// Class diagram per modul — atribut dari skema + operasi sesuai fitur aplikasi
const OPS: Record<string, string[]> = {
  pengguna: ['masuk(email, kataSandi)', 'keluar()', 'lupaKataSandi(email)', 'aturUlangKataSandi(token, kataSandiBaru)'],
  guru: ['lihatJadwal()', 'isiPresensi()', 'inputPenilaian()', 'susunLaporan()'],
  wali: ['tambah()', 'ubah()', 'hubungkanAkunPortal()', 'lihatAnak()'],
  siswa: ['tambah()', 'ubah()', 'lihatDetail()', 'cari(kataKunci)', 'hitungSisaTagihan()'],
  siswa_wali: ['tetapkanWaliUtama()'],
  tahun_ajaran: ['tambah()', 'aktifkan()'],
  kelas: ['tambah()', 'daftarkanSiswa(siswa)', 'cekKapasitas()'],
  penempatan_kelas: ['tempatkan()'],
  jadwal: ['lihatPerHari(hari)'],
  presensi: ['simpanMassal(kelas, tanggal, daftar)', 'rekapBulanan(siswa)'],
  dokumen_siswa: ['unggah()', 'hapus()'],
  periode_ppdb: ['buka()', 'tutup()', 'sedangBerlangsung()'],
  pendaftaran_ppdb: ['kirimFormulir()', 'tinjau(status, alasan)', 'jadikanSiswa()'],
  dokumen_pendaftaran: ['unggah()'],
  domain_penilaian: ['daftarAktif()'],
  skala_penilaian: ['daftarAktif()'],
  penilaian: ['simpan()', 'rekapPeriode()'],
  laporan_perkembangan: ['simpanDraf()', 'kirimUntukReview()', 'terbitkan()'],
  detail_laporan: ['isiCapaian()'],
  jenis_biaya: ['tambah()', 'aktifkan()', 'nonaktifkan()'],
  tagihan: ['buat(siswa, rincian)', 'hitungTotal()', 'hitungSisa()', 'perbaruiStatus()', 'batalkan(alasan)'],
  detail_tagihan: ['hitungSubtotal()'],
  pembayaran: ['catat(siswa, alokasi)', 'batalkan(alasan)'],
  alokasi_pembayaran: ['alokasikan(tagihan, nominal)'],
  pengeluaran: ['catat()', 'batalkan(alasan)', 'totalBulanIni()'],
  kegiatan: ['simpan()', 'terbitkan()', 'arsipkan()'],
  media_kegiatan: ['unggah()'],
  pengumuman: ['simpan()', 'terbitkan()', 'tandaiDibaca(pengguna)'],
  pengumuman_dibaca: [],
  pengaturan_situs: ['simpan(kunci, nilai)'],
  slide_beranda: ['simpan()', 'ubahUrutan(arah)', 'tampilkan()', 'sembunyikan()'],
  galeri: ['simpan()', 'ubahUrutan(arah)', 'tampilkan()', 'sembunyikan()'],
  fasilitas: ['simpan()', 'ubahUrutan(arah)', 'tampilkan()', 'sembunyikan()'],
  testimoni: ['simpan()', 'ubahUrutan(arah)', 'tampilkan()', 'sembunyikan()'],
  tanya_jawab: ['simpan()', 'ubahUrutan(arah)', 'tampilkan()', 'sembunyikan()'],
  token_reset_sandi: ['buat(pengguna)', 'validasi(token)', 'tandaiDipakai()'],
  log_audit: ['catat(aksi, entitas)'],
}
const pascal = (t: string) => t.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join('')
const UML_TYPE: Record<string, string> = { Int: 'int', String: 'string', Boolean: 'boolean', DateTime: 'datetime', Float: 'float' }
function classBlock(m: Model, stub: boolean) {
  if (stub) return `class ${pascal(m.table)} #EEEEEE`
  const attrs = scalarFields(m).map((f) => `  - ${f.column} : ${UML_TYPE[f.type] ?? f.type}${f.optional ? ' [0..1]' : ''}`)
  const ops = (OPS[m.table] ?? []).map((o) => `  + ${o}`)
  return `class ${pascal(m.table)} {\n${attrs.join('\n')}\n  --\n${ops.join('\n')}\n}`
}
function classRel(r: Rel) {
  const many = r.oneToOne ? '"0..1"' : '"0..*"'
  const one = r.optional ? '"0..1"' : '"1"'
  // Cascade = komposisi (bagian ikut terhapus), selain itu asosiasi biasa
  const arrow = r.onDelete === 'Cascade' ? '*--' : '--'
  return `${pascal(r.parent.table)} ${one} ${arrow} ${many} ${pascal(r.child.table)}`
}
for (const mod of MODULES) {
  const inside = new Set(mod.tables)
  const rels = relations.filter((r) => inside.has(r.child.table) && inside.has(r.parent.table) || (inside.has(r.child.table) !== inside.has(r.parent.table)))
  const involved = new Set(rels.flatMap((r) => [r.child.table, r.parent.table]).concat(mod.tables))
  write(
    `class-${mod.key}.puml`,
    puml(
      `class-${mod.key}`,
      `Class Diagram — ${mod.title}`,
      `${[...involved].map((t) => classBlock(byTable.get(t)!, !inside.has(t))).join('\n\n')}\n\n${rels.map(classRel).join('\n')}\n\nlegend right\n  Belah ketupat hitam = komposisi (data anak ikut terhapus)\n  Garis biasa = asosiasi\n  Abu-abu = kelas dari modul lain\nendlegend`,
    ),
  )
}

// Kamus data
{
  const out: string[] = []
  out.push('# Kamus Data — Sistem Informasi TK Orchid', '')
  out.push('> Dibuat otomatis dari `prisma/schema.prisma` oleh `scripts/generate-docs.ts`. Jangan diedit manual; jalankan ulang skrip bila skema berubah.', '')
  out.push(`Basis data: **SQLite** · Jumlah tabel: **${models.length}** · Jumlah relasi (foreign key): **${relations.length}**`, '')
  out.push('Konvensi: nama tabel & kolom memakai *snake_case* bahasa Indonesia, kunci primer `id_<tabel>`, kunci tamu `id_<tabel rujukan>`. Nominal uang disimpan sebagai bilangan bulat rupiah. Kolom bertanda **Ya** pada *Wajib* bernilai NOT NULL.', '')
  out.push('## Daftar tabel', '')
  out.push('| No | Tabel | Modul | Keterangan |', '| --: | --- | --- | --- |')
  models.forEach((m, i) => {
    const mod = MODULES.find((x) => x.tables.includes(m.table))?.title ?? '-'
    out.push(`| ${i + 1} | [\`${m.table}\`](#${m.table}) | ${mod} | ${TABLE_DESC[m.table] ?? ''} |`)
  })
  out.push('')
  for (const m of models) {
    const pks = pkColumnsOf(m)
    const fks = fkColumnsOf(m)
    out.push(`## ${m.table}`, '', TABLE_DESC[m.table] ?? '', '')
    out.push(`Kunci primer: \`${pks.join(', ')}\`${m.compositeId ? ' (kunci komposit)' : ''}`, '')
    out.push('| No | Kolom | Tipe | Wajib | Kunci | Default | Keterangan |', '| --: | --- | --- | :-: | :-: | --- | --- |')
    scalarFields(m).forEach((f, i) => {
      const key = [pks.includes(f.column) ? 'PK' : '', fks.has(f.column) ? 'FK' : '', f.isUnique && !pks.includes(f.column) ? 'UK' : ''].filter(Boolean).join(', ') || '-'
      out.push(`| ${i + 1} | \`${f.column}\` | ${SQL_TYPE[f.type] ?? f.type} | ${f.optional ? 'Tidak' : 'Ya'} | ${key} | ${fmtDefault(f)} | ${describe(m, f)} |`)
    })
    const extra = [
      ...m.uniques.map((u) => `Unik gabungan: \`(${u.map((x) => col(m, x)).join(', ')})\``),
      ...m.indexes.map((u) => `Indeks: \`(${u.map((x) => col(m, x)).join(', ')})\``),
      ...relations.filter((r) => r.child === m).map((r) => `Relasi: \`${r.fkColumns.join(', ')}\` → \`${r.parent.table}\` (${r.oneToOne ? 'satu-ke-satu' : 'banyak-ke-satu'}, hapus induk: ${r.onDelete === 'Cascade' ? 'ikut terhapus' : r.onDelete === 'SetNull' ? 'diisi NULL' : 'ditolak'})`),
    ]
    if (extra.length) out.push('', ...extra.map((e) => `- ${e}`))
    out.push('')
  }
  fs.writeFileSync(path.join(ROOT, 'docs', 'kamus-data.md'), out.join('\n'))
  written.push('../../kamus-data.md')
}

console.log(`Tabel: ${models.length}, relasi: ${relations.length}`)
console.log('Ditulis:', written.join(', '))
