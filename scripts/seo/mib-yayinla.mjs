// dist/ çıktısını yayın reposuna (mertcanasdf/mib-site, main) normal bir commit olarak gönderir.
//   node scripts/seo/mib-yayinla.mjs "Kısa açıklama"            gönderir
//   node scripts/seo/mib-yayinla.mjs "Kısa açıklama" --kuru     yalnız farkı gösterir
// Kurallar: yayın klonu temiz ve origin/main ile aynı olmalı (değilse durur); force push yok;
// fark yoksa commit atılmaz. Önce `npm run verify` ile güncel build alınmalıdır.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT } from './ortak.mjs';

const REPO = process.env.MIB_PUBLISH_REPO || 'C:/Users/mertc/Documents/Codex/2026-10-06/c-users-mertc-onedrive-desktop-muhammed/work/publish-repo';
const message = process.argv[2];
const dry = process.argv.includes('--kuru');
if (!message || message.startsWith('--')) { console.error('Kullanım: node scripts/seo/mib-yayinla.mjs "açıklama" [--kuru]'); process.exit(1); }

const git = (args, cwd = REPO) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
const dist = path.join(ROOT, 'dist');
if (!fs.existsSync(path.join(dist, 'index.html'))) throw new Error('dist/index.html yok: önce npm run verify');

git(['fetch', '-q', 'origin', 'main']);
if (git(['status', '--porcelain'])) throw new Error('Yayın klonu kirli; elle incele: ' + REPO);
if (git(['rev-parse', 'HEAD']) !== git(['rev-parse', 'origin/main'])) throw new Error('Yayın klonu origin/main ile aynı değil (başkası göndermiş olabilir); önce incele');

// fs.cpSync bu Node sürümünde Windows'ta süreci sessizce çökertiyor; elle özyinelemeli kopya.
function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}
const count = (dir) => fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? count(path.join(dir, e.name)) : 1), 0);

// Klonu dist ile eşitle: önce dosya sayısını doğrula, sonra .git dışını sil ve kopyala.
const distFiles = count(dist);
if (distFiles < 50) throw new Error(`dist beklenenden küçük (${distFiles} dosya); yayın durduruldu`);
for (const entry of fs.readdirSync(REPO)) if (entry !== '.git') fs.rmSync(path.join(REPO, entry), { recursive: true, force: true });
try {
  copyDir(dist, REPO);
} catch (e) {
  git(['checkout', '-q', '--', '.']);
  throw new Error(`Kopyalama başarısız, klon geri alındı: ${e.message}`);
}
git(['add', '-A']);
const changed = git(['status', '--porcelain']).split('\n').filter(Boolean);
if (!changed.length) { console.log('Fark yok; yayın gerekmiyor.'); process.exit(0); }
console.log(`${changed.length} dosya değişti:\n` + changed.slice(0, 30).join('\n'));
if (dry) { git(['reset', '-q', '--hard', 'HEAD']); console.log('(kuru çalışma: geri alındı)'); process.exit(0); }

const src = git(['rev-parse', '--short', 'HEAD'], ROOT);
git(['commit', '-q', '-m', `${message}\n\nSource: dr-muhammed-ikbal-bak-rc- sprint-1 ${src}`]);
git(['push', '-q', 'origin', 'HEAD:main']);
console.log(`Gönderildi: mib-site ${git(['rev-parse', '--short', 'HEAD'])}. Sunucu en geç 15 dk içinde çeker.`);
