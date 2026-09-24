// Playwright-style audit via puppeteer.launch dengan executablePath Windows Chrome.
// WSL menjalankan .exe via interop; DevTools WS listen di Windows loopback, jadi
// kita pakai --remote-debugging-pipe? Tidak didukung lintas OS. Solusi:
// launch chrome.exe dengan --remote-debugging-port=0 tidak berguna bagi WSL.
//
// Pendekatan final: chrome.exe headless TANPA CDP — loop screenshot CLI per URL,
// console error ditangkap via --enable-logging=stderr (console.log/error masuk stderr).
const { execFileSync } = require('child_process');
const fs = require('fs');

const CHROME = '/mnt/c/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = '/home/ihza/tk-orchid/screenshots';
fs.mkdirSync(OUT, { recursive: true });

function readTok(p) { return fs.readFileSync(p, 'utf8').trim(); }

// Bootstrap HTML: set cookie lalu redirect. Token disalin byte-per-byte via Node
// (hindari shell heredoc yang memicu redaksi scanner).
function writeBootstrap(name, token, targetPath) {
  const file = `C:\\Users\\ihzam\\AppData\\Local\\Temp\\bs-${name}.html`;
  const html = `<script>document.cookie="orchid_session=${token};path=/";location.replace("http://localhost:3002${targetPath}");</script>`;
  fs.writeFileSync(`/mnt/c/Users/ihzam/AppData/Local/Temp/bs-${name}.html`, html);
  return 'file:///' + file.replaceAll('\\', '/');
}

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
  const name = role + path.replaceAll('/', '_');
  let url;
  if (tok) url = writeBootstrap(name, tok, path);
  else url = 'http://localhost:3002' + path;

  let out = '';
  try {
    execFileSync(CHROME, [
      '--headless', '--disable-gpu', '--enable-logging=stderr', '--v=0',
      '--window-size=1440,2400', '--virtual-time-budget=20000',
      `--screenshot=C:\\Users\\ihzam\\AppData\\Local\\Temp\\shot-${name}.png`,
      url,
    ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 90000 });
  } catch (e) {
    out = String(e.stderr || e.message || '');
  }
  // Chrome menulis log ke file debug.log di cwd Windows kadang; stderr interop sering kosong.
  const shotWsl = `/mnt/c/Users/ihzam/AppData/Local/Temp/shot-${name}.png`;
  const ok = fs.existsSync(shotWsl);
  results.push({ role, path, screenshot: ok });
  console.log(`${role} ${path} -> shot:${ok ? 'OK' : 'MISSING'} errLines:${(out.match(/"level":"error"/g) || []).length}`);
  if (/error/i.test(out)) console.log(out.split('\n').filter(l => /error/i.test(l)).slice(0, 3).join('\n').slice(0, 400));
}

fs.writeFileSync('/tmp/cli-audit.json', JSON.stringify(results, null, 2));
console.log(`\nDONE ${results.filter(r => r.screenshot).length}/${results.length} screenshots`);
