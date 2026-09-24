// Audit browser penuh: Chrome for Testing Linux + puppeteer global
// Capture: HTTP status, title, console errors, pageerror per halaman + screenshot
const puppeteer = require('/home/ihza/.hermes/node/lib/node_modules/puppeteer');
const fs = require('fs');

const OUT = '/home/ihza/tk-orchid/screenshots/audit';
fs.mkdirSync(OUT, { recursive: true });

function readTok(p) { return fs.readFileSync(p, 'utf8').trim(); }

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/tmp/cfl/chrome-linux64/chrome',
    headless: 'new',
    args: [
      '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
      `--LD_LIBRARY_PATH_PLACEHOLDER`, // tidak dipakai; env via process env
    ].slice(0, 3),
    env: {
      ...process.env,
      LD_LIBRARY_PATH: '/tmp/chr-root/usr/lib/x86_64-linux-gnu:/tmp/chr-root/lib/x86_64-linux-gnu',
    },
  });

  const jobs = [
    ['public', '/', null],
    ['public', '/profil', null],
    ['public', '/kegiatan', null],
    ['public', '/pengumuman', null],
    ['public', '/kontak', null],
    ['public', '/pendaftaran', null],
    ['public', '/login', null],
    ['admin', '/dashboard', readTok('/tmp/token.txt')],
    ['admin', '/siswa', readTok('/tmp/token.txt')],
    ['admin', '/kelas', readTok('/tmp/token.txt')],
    ['admin', '/presensi', readTok('/tmp/token.txt')],
    ['admin', '/penilaian', readTok('/tmp/token.txt')],
    ['admin', '/perkembangan', readTok('/tmp/token.txt')],
    ['admin', '/keuangan/jenis-biaya', readTok('/tmp/token.txt')],
    ['admin', '/keuangan/tagihan', readTok('/tmp/token.txt')],
    ['admin', '/keuangan/pembayaran', readTok('/tmp/token.txt')],
    ['admin', '/keuangan/pengeluaran', readTok('/tmp/token.txt')],
    ['guru', '/guru/dashboard', readTok('/tmp/tok_guru.txt')],
    ['guru', '/guru/presensi', readTok('/tmp/tok_guru.txt')],
    ['guru', '/guru/penilaian', readTok('/tmp/tok_guru.txt')],
    ['guru', '/guru/perkembangan', readTok('/tmp/tok_guru.txt')],
    ['guru', '/guru/jadwal', readTok('/tmp/tok_guru.txt')],
    ['guru', '/guru/kegiatan', readTok('/tmp/tok_guru.txt')],
    ['guru', '/guru/profil', readTok('/tmp/tok_guru.txt')],
    ['ortu', '/portal', readTok('/tmp/tok_parent.txt')],
    ['ortu', '/portal/tagihan', readTok('/tmp/tok_parent.txt')],
    ['ortu', '/portal/presensi', readTok('/tmp/tok_parent.txt')],
    ['ortu', '/portal/perkembangan', readTok('/tmp/tok_parent.txt')],
    ['ortu', '/portal/pengumuman', readTok('/tmp/tok_parent.txt')],
    ['ortu', '/portal/anak/1', readTok('/tmp/tok_parent.txt')],
  ];

  const results = [];
  for (const [role, path, tok] of jobs) {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push('[console] ' + m.text().slice(0, 250)); });
    page.on('pageerror', e => errors.push('[pageerror] ' + String(e).slice(0, 250)));
    try {
      if (tok) await page.setCookie({ name: 'orchid_session', value: tok, domain: 'localhost', path: '/' });
      const resp = await page.goto('http://localhost:3002' + path, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await new Promise(r => setTimeout(r, 1500));
      const status = resp ? resp.status() : 0;
      const title = (await page.title()).trim();
      const finalUrl = page.url();
      const name = role + path.replaceAll('/', '_');
      await page.screenshot({ path: `${OUT}/${name}.png` });
      results.push({ role, path, status, title, finalUrl, errors });
      const redirected = finalUrl.includes('/login') && path !== '/login';
      console.log(`${redirected ? 'REDIR' : String(status).padEnd(4)} ${role.padEnd(6)} ${path} | err:${errors.length}${errors.length ? ' ⚠️' : ''}`);
      for (const e of errors) console.log('       ', e);
    } catch (e) {
      results.push({ role, path, error: String(e).slice(0, 200) });
      console.log(`FAIL  ${role} ${path} :: ${String(e).slice(0, 150)}`);
    }
    await ctx.close();
  }

  fs.writeFileSync('/home/ihza/tk-orchid/screenshots/audit/results.json', JSON.stringify(results, null, 2));
  const pagesWithErr = results.filter(r => r.errors && r.errors.length);
  console.log(`\n=== RINGKASAN ===`);
  console.log(`Halaman diuji : ${results.length}`);
  console.log(`Dengan error  : ${pagesWithErr.length}`);
  for (const r of pagesWithErr) console.log(`  - ${r.path}: ${r.errors.length} error(s)`);
  await browser.close();
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
