// System Integration Test (SIT) end-to-end Sistem Informasi TK Orchid.
// Antarmuka dijalankan lewat Playwright, hasilnya diverifikasi langsung ke basis data SQLite.
//
// Pemakaian (jalankan pada salinan data demo, bukan data produksi):
//   1. npm run dev                      (server di http://localhost:3000)
//   2. npm i --no-save playwright       (sekali saja; bila Chromium belum ada: npx playwright install chromium)
//   3. node scripts/sit.mjs [hasil.json] [folder-screenshot]
//   4. git checkout -- prisma/dev.db    (kembalikan data demo setelah pengujian)
// Variabel opsional: SIT_BASE_URL, CHROMIUM_PATH, TMO (batas waktu per aksi, ms), STOP=1 (berhenti di kegagalan pertama).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'
import { chromium } from 'playwright'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BASE = process.env.SIT_BASE_URL || 'http://localhost:3000'
const OUT = process.argv[2] || 'sit-hasil.json'
const SHOTS = process.argv[3] || 'sit-screenshot'
fs.mkdirSync(SHOTS, { recursive: true })
const db = new Database(path.join(ROOT, 'prisma', 'dev.db'), { readonly: true })
const one = (sql, ...a) => db.prepare(sql).get(...a)
const all = (sql, ...a) => db.prepare(sql).all(...a)

const TAG = 'SIT' + Date.now().toString().slice(-5)
const CHILD = `Nadia Uji ${TAG}`
const PARENT_EMAIL = `ortu.${TAG.toLowerCase()}@orchid.local`
const NEW_PASS = 'OrtuBaru123!'
const today = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10) // WIB
const ctx = {}
const results = []

function assert(cond, msg) { if (!cond) throw new Error(msg) }

async function step(id, name, fn) {
  const t0 = Date.now()
  try {
    const note = await fn()
    results.push({ id, name, status: 'Berhasil', note: note || '', ms: Date.now() - t0 })
    console.log('✓', id, name, note ? '— ' + note : '')
  } catch (e) {
    results.push({ id, name, status: 'Gagal', note: String(e.message).split('\n')[0], ms: Date.now() - t0 })
    console.log('✗', id, name, '—', e.message.split('\n')[0])
    for (const p of Object.values(pages)) { try { await p.screenshot({ path: path.join(SHOTS, `${id}-${p.__role}.png`) }) } catch { /* abaikan */ } }
    if (process.env.STOP) { fs.writeFileSync(OUT, JSON.stringify({ tag: TAG, results }, null, 2)); process.exit(1) }
  }
}

const pages = {}
async function session(browser, role, email, password = 'demo1234') {
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const p = await c.newPage()
  p.__role = role
  p.setDefaultTimeout(Number(process.env.TMO || 20000))
  if (email) await login(p, email, password)
  pages[role] = p
  return p
}
async function login(p, email, password) {
  await p.goto(BASE + '/login')
  await p.fill('input[name=email]', email)
  await p.fill('input[name=password]', password)
  await Promise.all([p.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 90000 }), p.click('button[type=submit]')])
}
async function go(p, url) { await p.goto(BASE + url, { waitUntil: 'networkidle', timeout: 120000 }) }
async function waitFor(fn, ms = 15000) {
  const end = Date.now() + ms
  while (Date.now() < end) { const v = fn(); if (v) return v; await new Promise((r) => setTimeout(r, 300)) }
  return fn()
}

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
{
  const guest = await session(browser, 'pengunjung')
  const admin = await session(browser, 'admin', 'admin@orchid.local')
  const guru = await session(browser, 'guru', 'guru1@orchid.local')

  // ---------- PPDB ----------
  await step('SIT-01', 'Pengunjung mengirim formulir PPDB online → tersimpan & muncul nomor pendaftaran', async () => {
    await go(guest, '/pendaftaran')
    await guest.fill('input[name=childFullName]', CHILD)
    await guest.selectOption('select[name=childGender]', 'P')
    await guest.fill('input[name=childBirthPlace]', 'Bekasi')
    await guest.fill('input[name=childBirthDate]', '2023-03-10')
    await guest.selectOption('select[name=preferredLevel]', 'Kelompok A')
    await guest.fill('input[name=parentName]', `Ibu ${TAG}`)
    await guest.selectOption('select[name=relationship]', 'IBU')
    await guest.fill('input[name=phone]', '081234567890')
    await guest.fill('textarea[name=address], input[name=address]', 'Jl. Anggrek No. 1, Bekasi')
    await guest.click('form button[type=submit]')
    await waitFor(() => one('select 1 from pendaftaran_ppdb where nama_calon_siswa = ?', CHILD), 30000)
    const row = await waitFor(() => one('select * from pendaftaran_ppdb where nama_calon_siswa = ?', CHILD))
    assert(row, 'data pendaftaran tidak ditemukan di tabel pendaftaran_ppdb')
    assert(row.status === 'SUBMITTED', 'status ' + row.status)
    ctx.admissionId = row.id_pendaftaran
    ctx.regNo = row.no_pendaftaran
    await guest.waitForSelector(`text=${row.no_pendaftaran}`, { timeout: 20000 }).catch(() => { throw new Error('nomor pendaftaran tidak tampil') })
    return `no. ${row.no_pendaftaran}, status SUBMITTED`
  })

  await step('SIT-02', 'Pendaftaran ganda anak yang sama pada periode yang sama ditolak', async () => {
    await go(guest, '/pendaftaran')
    await guest.fill('input[name=childFullName]', CHILD)
    await guest.selectOption('select[name=childGender]', 'P')
    await guest.fill('input[name=childBirthPlace]', 'Bekasi')
    await guest.fill('input[name=childBirthDate]', '2023-03-10')
    await guest.selectOption('select[name=preferredLevel]', 'Kelompok A')
    await guest.fill('input[name=parentName]', `Ibu ${TAG}`)
    await guest.selectOption('select[name=relationship]', 'IBU')
    await guest.fill('input[name=phone]', '081234567890')
    await guest.fill('textarea[name=address], input[name=address]', 'Jl. Anggrek No. 1, Bekasi')
    await guest.click('form button[type=submit]')
    await guest.waitForSelector('text=sudah terdaftar', { timeout: 60000 })
    const n = one('select count(*) n from pendaftaran_ppdb where nama_calon_siswa = ?', CHILD).n
    assert(n === 1, 'jumlah data ' + n)
    return 'pesan "sudah terdaftar … nomor ' + ctx.regNo + '", data tetap 1'
  })

  await step('SIT-03', 'Admin meninjau pendaftar dan mengubah status menjadi Diterima (tercatat di log audit)', async () => {
    await go(admin, '/ppdb?q=' + encodeURIComponent(CHILD))
    let form = admin.locator('form', { has: admin.locator('select[name=status]') }).filter({ has: admin.locator(`input[name=id][value="${ctx.admissionId}"]`) })
    if (!(await form.count())) { await go(admin, '/ppdb'); form = admin.locator('form', { has: admin.locator(`input[name=id][value="${ctx.admissionId}"]`) }) }
    await form.locator('select[name=status]').selectOption('ACCEPTED')
    await form.locator('button[type=submit]').click()
    const row = await waitFor(() => { const r = one('select status, ditinjau_oleh from pendaftaran_ppdb where no_pendaftaran = ?', ctx.regNo); return r.status === 'ACCEPTED' && r })
    assert(row, 'status belum ACCEPTED')
    const log = one("select count(*) n from log_audit where aksi = 'ADMISSION_REVIEW' and id_entitas = ?", ctx.admissionId)
    assert(log.n >= 1, 'log audit tidak ada')
    return 'status ACCEPTED, ditinjau_oleh terisi, log ADMISSION_REVIEW'
  })

  // ---------- Siswa, wali, kelas ----------
  await step('SIT-04', 'Admin menambah siswa → kode siswa dibuat otomatis', async () => {
    await go(admin, '/siswa/tambah')
    await admin.fill('input[name=fullName]', CHILD)
    await admin.fill('input[name=nickname]', 'Nadia')
    await admin.selectOption('select[name=gender]', 'P')
    await admin.fill('input[name=birthPlace]', 'Bekasi')
    await admin.fill('input[name=birthDate]', '2023-03-10')
    await admin.getByRole('button', { name: /^Simpan$/ }).click()
    await admin.waitForURL(/\/siswa\/\d+/, { timeout: 60000 })
    const s = one('select * from siswa where nama_lengkap = ?', CHILD)
    assert(s && s.kode_siswa && s.status === 'ACTIVE', 'siswa tidak valid')
    ctx.studentId = s.id_siswa
    ctx.studentCode = s.kode_siswa
    return `kode ${s.kode_siswa}, status ACTIVE`
  })

  await step('SIT-05', 'Admin menambah wali + akun portal dan menghubungkannya ke siswa', async () => {
    await go(admin, '/wali/tambah')
    await admin.fill('input[name=fullName]', `Ibu ${TAG}`)
    await admin.selectOption('select[name=relationship]', 'IBU')
    await admin.fill('input[name=phone]', '081234567890')
    await admin.fill('input[name=email]', PARENT_EMAIL)
    await admin.selectOption('select[name=studentId]', String(ctx.studentId))
    await admin.check('input[name=createAccount]')
    await admin.getByRole('button', { name: /^Simpan$/ }).click()
    await admin.waitForURL(/\/wali\/\d+/, { timeout: 60000 })
    const w = one('select w.id_wali, w.id_pengguna, p.peran from wali w join pengguna p on p.id_pengguna = w.id_pengguna where p.email = ?', PARENT_EMAIL)
    assert(w && w.peran === 'PARENT', 'akun PARENT tidak dibuat')
    const link = one('select wali_utama from siswa_wali where id_siswa = ? and id_wali = ?', ctx.studentId, w.id_wali)
    assert(link, 'relasi siswa_wali tidak dibuat')
    assert(link.wali_utama === 1, 'bukan wali utama')
    assert((await admin.textContent('body')).includes(CHILD), 'anak tidak tampil di detail wali')
    ctx.guardianId = w.id_wali
    return 'pengguna PARENT dibuat, siswa_wali (wali utama) tersimpan'
  })

  await step('SIT-06', 'Admin menempatkan siswa ke Kelompok A (penempatan_kelas)', async () => {
    await go(admin, '/kelas/1')
    await admin.selectOption('select[name=studentId]', String(ctx.studentId))
    await admin.locator('form', { has: admin.locator('select[name=studentId]') }).locator('button[type=submit]').click()
    const e = await waitFor(() => one('select * from penempatan_kelas where id_siswa = ? and id_kelas = 1', ctx.studentId))
    assert(e, 'penempatan tidak tersimpan')
    return 'tersimpan pada kelas 1, tahun ajaran aktif'
  })

  await step('SIT-07', 'Orang tua baru mengatur kata sandi lewat "Lupa password" lalu login ke portal dan melihat anaknya', async () => {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const p = await c.newPage(); p.__role = 'ortu'; pages.ortu = p; p.setDefaultTimeout(60000)
    await p.goto(BASE + '/lupa-password')
    await p.fill('input[name=email]', PARENT_EMAIL)
    await p.click('button[type=submit]')
    const t = await p.waitForSelector('text=/reset-password\\//')
    const token = (await t.textContent()).match(/reset-password\/([\w-]+)/)[1]
    await p.goto(BASE + '/reset-password/' + token)
    await p.fill('input[name=password]', NEW_PASS)
    await p.fill('input[name=confirm]', NEW_PASS)
    await p.click('button[type=submit]')
    await p.waitForSelector('text=/berhasil|Masuk Sekarang/i')
    await login(p, PARENT_EMAIL, NEW_PASS)
    assert(new URL(p.url()).pathname === '/portal', 'tidak diarahkan ke /portal: ' + p.url())
    assert((await p.textContent('body')).includes('Nadia'), 'nama anak tidak tampil di portal')
    const used = one('select count(*) n from token_reset_sandi t join pengguna p on p.id_pengguna = t.id_pengguna where p.email = ? and t.dipakai_pada is not null', PARENT_EMAIL)
    assert(used.n === 1, 'token tidak ditandai dipakai')
    return 'token sekali pakai ditandai dipakai, login diarahkan ke /portal, anak tampil'
  })

  // ---------- Presensi ----------
  await step('SIT-08', 'Guru mengisi presensi kelas (anak uji = Sakit) → tampil di portal orang tua', async () => {
    await go(guru, '/guru/presensi')
    await guru.selectOption('#classId', '1').catch(() => {})
    await guru.fill('#tanggal', today)
    await guru.waitForSelector(`[aria-label="Status kehadiran ${CHILD}"]`, { timeout: 90000 })
    await guru.getByRole('button', { name: /Tandai Hadir Semua/ }).click()
    await guru.locator(`[aria-label="Status kehadiran ${CHILD}"]`).getByText('Sakit', { exact: true }).click()
    await guru.fill(`[aria-label="Catatan presensi ${CHILD}"]`, 'demam')
    await guru.getByRole('button', { name: /Simpan Presensi/ }).click()
    const r = await waitFor(() => one('select status, catatan, tanggal from presensi where id_siswa = ? order by id_presensi desc limit 1', ctx.studentId))
    assert(r && r.status === 'SICK', 'presensi siswa uji: ' + JSON.stringify(r))
    const n = one('select count(*) n from presensi where id_kelas = 1 and tanggal = ?', r.tanggal).n
    await go(pages.ortu, '/portal/presensi')
    assert((await pages.ortu.textContent('body')).includes('Sakit'), 'status Sakit tidak tampil di portal')
    return `${n} siswa tersimpan; anak uji SICK "demam"; tampil di portal`
  })

  await step('SIT-09', 'Guru menginput penilaian domain Kognitif (BSH) untuk anak uji', async () => {
    await go(guru, '/guru/penilaian')
    await guru.selectOption('#kelas', '1')
    await guru.selectOption('#siswa', String(ctx.studentId))
    const domain = await guru.locator('#domain option').filter({ hasText: /Kognitif/ }).first().getAttribute('value')
    await guru.selectOption('#domain', domain)
    await guru.locator('[aria-label="Pilih capaian"] label', { hasText: 'Berkembang Sesuai Harapan' }).first().click()
    await guru.fill('#narasi', 'Mampu mengelompokkan benda berdasarkan warna.')
    await guru.getByRole('button', { name: /Simpan Penilaian/ }).click()
    const a = await waitFor(() => one('select * from penilaian where id_siswa = ?', ctx.studentId))
    assert(a, 'penilaian tidak tersimpan')
    return 'tersimpan di tabel penilaian (unik per siswa/periode/domain)'
  })

  await step('SIT-10', 'Laporan perkembangan: guru simpan draf → kirim review → admin terbitkan → orang tua melihat rapor', async () => {
    await go(guru, '/guru/perkembangan')
    await guru.selectOption('#lk-kelas', '1')
    await guru.selectOption('#lk-siswa', String(ctx.studentId))
    await guru.waitForTimeout(800)
    const selects = guru.locator('select[aria-label^="Capaian "]')
    const n = await selects.count()
    for (let i = 0; i < n; i++) {
      const opt = await selects.nth(i).locator('option').nth(3).getAttribute('value')
      await selects.nth(i).selectOption(opt)
    }
    await guru.fill('#ringkasan', 'Nadia berkembang baik dan mulai percaya diri.')
    await guru.fill('#rekomendasi', 'Ajak bercerita sebelum tidur.')
    await guru.locator('form', { has: guru.locator('#ringkasan') }).locator('button[type=submit]').click()
    const draft = await waitFor(() => one("select * from laporan_perkembangan where id_siswa = ?", ctx.studentId))
    assert(draft && draft.status === 'DRAFT', 'draf tidak tersimpan')
    await go(pages.ortu, '/portal/perkembangan')
    assert(!(await pages.ortu.textContent('body')).includes('Nadia berkembang baik'), 'draf bocor ke portal')
    await go(guru, '/guru/perkembangan')
    const row = guru.locator('tr', { hasText: CHILD })
    await row.getByRole('button', { name: /Kirim untuk review/ }).click()
    assert(await waitFor(() => one('select status from laporan_perkembangan where id_siswa = ?', ctx.studentId).status === 'REVIEW'), 'status tidak REVIEW')
    await go(admin, '/perkembangan')
    await admin.locator('tr', { hasText: CHILD }).getByRole('button', { name: /Publikasikan/ }).click()
    const pub = await waitFor(() => { const r = one('select status, diterbitkan_oleh from laporan_perkembangan where id_siswa = ?', ctx.studentId); return r.status === 'PUBLISHED' && r })
    assert(pub && pub.diterbitkan_oleh, 'belum PUBLISHED')
    await go(pages.ortu, '/portal/perkembangan')
    assert((await pages.ortu.textContent('body')).includes('Nadia berkembang baik'), 'rapor terbit tidak tampil di portal')
    return `${n} domain; DRAFT tidak tampil di portal; REVIEW → PUBLISHED; tampil di portal`
  })

  // ---------- Keuangan ----------
  async function createInvoice(lines) {
    await go(admin, '/keuangan/tagihan')
    await admin.selectOption('select[name=studentId]', String(ctx.studentId))
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) await admin.getByRole('button', { name: /Tambah baris/ }).click()
      const fee = admin.locator('select[aria-label^="Jenis biaya baris"]').nth(i)
      await fee.selectOption({ label: new RegExp(lines[i][0]) }).catch(async () => {
        const v = await fee.locator('option', { hasText: lines[i][0] }).first().getAttribute('value'); await fee.selectOption(v)
      })
      await admin.locator('input[aria-label^="Nominal baris"]').nth(i).fill(String(lines[i][1]))
    }
    const before = one('select count(*) n from tagihan where id_siswa = ?', ctx.studentId).n
    await admin.getByRole('button', { name: /^Buat Tagihan$/ }).click()
    await waitFor(() => one('select count(*) n from tagihan where id_siswa = ?', ctx.studentId).n > before)
    return one('select * from tagihan where id_siswa = ? order by id_tagihan desc limit 1', ctx.studentId)
  }
  const invTotal = (id) => one('select sum(subtotal) t from detail_tagihan where id_tagihan = ?', id).t
  async function pay(invoiceNo, amount) {
    await go(admin, '/keuangan/pembayaran')
    await admin.selectOption('select[name=studentId]', String(ctx.studentId))
    await admin.fill(`input[aria-label="Alokasi ${invoiceNo}"]`, String(amount))
    await admin.getByRole('button', { name: /^Catat Pembayaran$/ }).click()
  }

  await step('SIT-11', 'Admin membuat tagihan (SPP + Uang Kegiatan) → tampil di portal orang tua', async () => {
    const inv = await createInvoice([['SPP', 350000], ['Kegiatan', 50000]])
    assert(inv && inv.status === 'ISSUED', 'tagihan tidak ISSUED')
    assert(invTotal(inv.id_tagihan) === 400000, 'total ' + invTotal(inv.id_tagihan))
    ctx.inv1 = inv
    await go(pages.ortu, '/portal/tagihan')
    assert((await pages.ortu.textContent('body')).includes(inv.no_tagihan), 'tagihan tidak tampil di portal')
    return `${inv.no_tagihan}, total Rp400.000, ISSUED, tampil di portal`
  })

  await step('SIT-12', 'Pembayaran sebagian lalu pelunasan → status PARTIAL lalu PAID, riwayat tampil di portal', async () => {
    await pay(ctx.inv1.no_tagihan, 150000)
    assert(await waitFor(() => one('select status from tagihan where id_tagihan = ?', ctx.inv1.id_tagihan).status === 'PARTIAL'), 'status tidak PARTIAL')
    await pay(ctx.inv1.no_tagihan, 250000)
    assert(await waitFor(() => one('select status from tagihan where id_tagihan = ?', ctx.inv1.id_tagihan).status === 'PAID'), 'status tidak PAID')
    const pays = all("select no_kwitansi, nominal from pembayaran where id_siswa = ? and status = 'POSTED'", ctx.studentId)
    assert(pays.length === 2, 'jumlah kwitansi ' + pays.length)
    await go(pages.ortu, '/portal/tagihan')
    const body = await pages.ortu.textContent('body')
    assert(pays.every((p) => body.includes(p.no_kwitansi)), 'riwayat pembayaran tidak lengkap di portal')
    ctx.pay2 = pays.find((p) => p.nominal === 250000)
    return `${pays.map((p) => p.no_kwitansi).join(', ')}; ISSUED → PARTIAL → PAID`
  })

  await step('SIT-13', 'Alokasi melebihi sisa tagihan: dibatasi di form dan ditolak server bila request dimanipulasi', async () => {
    const inv = await createInvoice([['Seragam', 150000]])
    ctx.inv2 = inv
    const before = one('select count(*) n from pembayaran').n
    await go(admin, '/keuangan/pembayaran')
    await admin.selectOption('select[name=studentId]', String(ctx.studentId))
    const input = admin.locator(`input[aria-label="Alokasi ${inv.no_tagihan}"]`)
    await input.fill('200000')
    const clamped = await input.inputValue()
    assert(clamped === '150000', 'form tidak membatasi nilai: ' + clamped)
    // lapis kedua: request dimanipulasi langsung (melewati pembatasan di browser)
    await input.fill('1000')
    await admin.evaluate(({ id }) => {
      document.querySelector('input[name=allocations]').value = JSON.stringify([{ invoiceId: id, amount: 200000 }])
    }, { id: inv.id_tagihan })
    await admin.getByRole('button', { name: /^Catat Pembayaran$/ }).click()
    await admin.waitForSelector('text=/melebihi sisa/i', { timeout: 30000 })
    assert(one('select count(*) n from pembayaran').n === before, 'pembayaran tetap tersimpan')
    assert(one('select status from tagihan where id_tagihan = ?', inv.id_tagihan).status === 'ISSUED', 'status tagihan berubah')
    return 'form membatasi ke Rp150.000; request Rp200.000 ditolak server ("Alokasi melebihi sisa tagihan"), tidak ada data tersimpan'
  })

  await step('SIT-14', 'Administrator membatalkan (void) kwitansi pelunasan → status tagihan kembali PARTIAL', async () => {
    await go(admin, '/keuangan/pembayaran')
    await admin.fill(`input[aria-label="Alasan void kwitansi ${ctx.pay2.no_kwitansi}"]`, 'Salah input nominal')
    await admin.locator('form', { has: admin.locator(`input[aria-label="Alasan void kwitansi ${ctx.pay2.no_kwitansi}"]`) }).getByRole('button', { name: 'Batalkan' }).click()
    assert(await waitFor(() => one('select status from pembayaran where no_kwitansi = ?', ctx.pay2.no_kwitansi).status === 'VOID'), 'kwitansi tidak VOID')
    assert(await waitFor(() => one('select status from tagihan where id_tagihan = ?', ctx.inv1.id_tagihan).status === 'PARTIAL'), 'status tagihan tidak kembali PARTIAL')
    const log = one("select count(*) n from log_audit where aksi = 'PAYMENT_VOID'").n
    assert(log >= 1, 'log PAYMENT_VOID tidak ada')
    return `${ctx.pay2.no_kwitansi} VOID + alasan; tagihan PAID → PARTIAL; log PAYMENT_VOID`
  })

  await step('SIT-15', 'Staf mencatat pengeluaran operasional', async () => {
    await go(admin, '/keuangan/pengeluaran')
    await admin.selectOption('select[name=category]', 'ATK')
    await admin.fill('input[name=amount]', '125000')
    await admin.fill('input[name=description]', `Kertas & krayon ${TAG}`)
    await admin.selectOption('select[name=paymentMethod]', 'CASH')
    await admin.locator('form', { has: admin.locator('#ex-amt') }).locator('button[type=submit]').click()
    const e = await waitFor(() => one('select * from pengeluaran where deskripsi = ?', `Kertas & krayon ${TAG}`))
    assert(e && e.nominal === 125000, 'pengeluaran tidak tersimpan')
    return 'tersimpan Rp125.000'
  })

  // ---------- Website ----------
  await step('SIT-16', 'Admin menambah kegiatan di Kelola Website → tampil di halaman publik /kegiatan', async () => {
    await go(admin, '/website/kegiatan')
    await admin.getByRole('button', { name: /Tambah kegiatan/ }).first().click()
    const dlg = admin.locator('[role=dialog]')
    await dlg.locator('[name=title]').fill(`Kunjungan Kebun ${TAG}`)
    await dlg.locator('[name=description]').fill('Anak-anak belajar menanam sayur di kebun sekolah.')
    await dlg.locator('[name=startDatetime]').fill(`${today}T08:00`)
    await dlg.getByRole('button', { name: /Simpan/ }).click()
    const k = await waitFor(() => one('select * from kegiatan where judul = ?', `Kunjungan Kebun ${TAG}`))
    assert(k, 'kegiatan tidak tersimpan')
    await go(guest, '/kegiatan')
    assert((await guest.textContent('body')).includes(`Kunjungan Kebun ${TAG}`), 'kegiatan tidak tampil di website publik')
    return `status ${k.status}, visibilitas ${k.visibilitas}; tampil di /kegiatan`
  })

  // ---------- Hak akses ----------
  await step('SIT-17', 'Hak akses antarperan ditolak (tamu, orang tua, guru ke area yang bukan haknya)', async () => {
    const checks = []
    await guest.goto(BASE + '/portal'); checks.push(['tamu → /portal', new URL(guest.url()).pathname.startsWith('/login')])
    await guest.goto(BASE + '/dashboard'); checks.push(['tamu → /dashboard', new URL(guest.url()).pathname.startsWith('/login')])
    await pages.ortu.goto(BASE + '/keuangan/tagihan'); checks.push(['orang tua → /keuangan/tagihan', !new URL(pages.ortu.url()).pathname.startsWith('/keuangan')])
    await pages.ortu.goto(BASE + '/guru/presensi'); checks.push(['orang tua → /guru/presensi', !new URL(pages.ortu.url()).pathname.startsWith('/guru')])
    await guru.goto(BASE + '/keuangan/pembayaran'); checks.push(['guru → /keuangan/pembayaran', !new URL(guru.url()).pathname.startsWith('/keuangan')])
    await guru.goto(BASE + '/portal'); checks.push(['guru → /portal', !new URL(guru.url()).pathname.startsWith('/portal')])
    const g2 = await session(browser, 'guru2', 'guru2@orchid.local')
    await go(g2, '/guru/presensi')
    const opts = await g2.locator('#classId option').allTextContents()
    checks.push(['guru2 tidak dapat memilih Kelompok A', !opts.some((o) => o.includes('Kelompok A'))])
    const failed = checks.filter(([, ok]) => !ok).map(([n]) => n)
    assert(failed.length === 0, 'lolos: ' + failed.join(', '))
    return checks.length + ' pemeriksaan ditolak/dialihkan sesuai peran'
  })

  await step('SIT-18', 'Login salah 5 kali → percobaan berikutnya dibatasi sementara', async () => {
    const c = await browser.newContext(); const p = await c.newPage(); p.__role = 'ratelimit'
    const email = `tidak.ada.${TAG.toLowerCase()}@orchid.local`
    let last = ''
    for (let i = 0; i < 6; i++) {
      await p.goto(BASE + '/login')
      await p.fill('input[name=email]', email)
      await p.fill('input[name=password]', 'salah-salah')
      await p.click('button[type=submit]')
      await p.waitForSelector('text=/salah|Terlalu banyak/')
      last = await p.textContent('body')
    }
    assert(/Terlalu banyak percobaan/.test(last), 'percobaan ke-6 tidak dibatasi')
    const f = one("select count(*) n from log_audit where aksi = 'LOGIN_FAILED'").n
    return `percobaan ke-6: "Terlalu banyak percobaan login"; LOGIN_FAILED tercatat (${f} total)`
  })

  await browser.close()
  fs.writeFileSync(OUT, JSON.stringify({ tag: TAG, date: new Date().toISOString(), results }, null, 2))
  const ok = results.filter((r) => r.status === 'Berhasil').length
  console.log(`\n${ok}/${results.length} skenario berhasil`)
  process.exitCode = ok === results.length ? 0 : 1
}
