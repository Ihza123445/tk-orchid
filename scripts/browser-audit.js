// Playwright-style audit: buka tiap halaman, capture console error + pageerror + screenshot
const puppeteer = require('/home/ihza/.hermes/node/lib/node_modules/puppeteer');
const fs = require('fs');

const OUT = '/home/ihza/tk-orchid/screenshots';
fs.mkdirSync(OUT, { recursive: true });

function readTok(p) {
  return fs.readFileSync(p, 'utf8').trim();
}

(async () => {
  // Chrome Windows diakses dari WSL: pakai browserURL via remote debugging yang sudah jalan
  // Lebih aman: launch chrome headless via WSL interop dengan pipe ke Windows chrome.exe tidak reliable.
  // Gunakan puppeteer.connect ke CDP endpoint Windows (127.0.0.1 mirrored).
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9222',
    defaultViewport: null,
  }).catch(e => { console.error('CONNECT_FAIL:' + e.message.slice(0, 100)); process.exit(3); });

  const results = [];
  const jobs = [
    ['public', '/'],
    ['public', '/profil'],
    ['public', '/kegiatan'],
    ['public', '/pengumuman'],
    ['public', '/kontak'],
    ['public', '/pendaftaran'],
    ['public', '/login'],
    ['admin', '/dashboard'],
    ['admin', '/siswa'],
    ['admin', '/kelas'],
    ['admin', '/presensi'],
    ['admin', '/penilaian'],
    ['admin', '/perkembangan'],
    ['admin', '/keuangan/jenis-biaya'],
    ['admin', '/keuangan/tagihan'],
    ['admin', '/keuangan/pembayaran'],
    ['admin', '/keuangan/pengeluaran'],
    ['guru', '/guru/dashboard'],
    ['guru', '/guru/presensi'],
    ['guru', '/guru/penilaian'],
    ['guru', '/guru/perkembangan'],
    ['guru', '/guru/jadwal'],
    ['guru', '/guru/kegiatan'],
    ['guru', '/guru/profil'],
    ['ortu', '/portal'],
    ['ortu', '/portal/tagihan'],
    ['ortu', '/portal/presensi'],
    ['ortu', '/portal/perkembangan'],
    ['ortu', '/portal/pengumuman'],
    ['ortu', '/portal/anak/1'],
    ['anon', '/portal'],          // RBAC: harus redirect login
  ];

  const tokByRole = {
    public: null,
    admin: readTok('/tmp/token.txt'),
    guru: readTok('/tmp/tok_guru.txt'),
    ortu: readTok('/tmp/tok_parent.txt'),
    anon: 'invalid-token-xyz',
  };

  for (const [role, path] of jobs) {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    const errors = [];
    page.on('console', m => {
      if (m.type() === 'error') errors.push('[console] ' + m.text().slice(0, 200));
    });
    page.on('pageerror', e => errors.push('[pageerror] ' + String(e).slice(0, 200)));
    try {
      if (tokByRole[role]) {
        await page.setCookie({ name: 'orchid_session', value: tokByRole[role], domain: 'localhost', path: '/' });
      } else {
        await page.deleteCookie({ name: 'orchid_session', domain: 'localhost', path: '/' });
      }
      const resp = await page.goto('http://localhost:3002' + path, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 700));
      const status = resp ? resp.status() : 0;
      const title = await page.title();
      const name = role + path.replaceAll('/', '_');
      await page.screenshot({ path: `${OUT}/${name}.png` });
      results.push({ role, path, status, title, errors });
      console.log(`${role} ${path} -> ${status} | "${title}" | err:${errors.length}`);
      for (const e of errors) console.log('   ', e);
    } catch (e) {
      results.push({ role, path, status: 'NAV_FAIL', errors: [String(e).slice(0, 150)] });
      console.log(`${role} ${path} -> NAV_FAIL ${String(e).slice(0, 120)}`);
    }
    await context.close();
  }

  fs.writeFileSync('/tmp/audit-results.json', JSON.stringify(results, null, 2));
  const totalErr = results.reduce((a, r) => a + (r.errors ? r.errors.length : 0), 0);
  console.log(`\nDONE pages=${results.length} totalConsoleErrors=${totalErr}`);
  browser.disconnect();
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
