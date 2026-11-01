// Sitede aynı görselin iki kez kullanılmasını engeller.
//   node scripts/gorsel-tekrar.mjs          public/assets/images altındaki tüm görselleri karşılaştırır
// Birebir aynı dosya (sha256) ve görsel olarak neredeyse aynı (dHash, Hamming ≤ ESIK) çiftleri bulur;
// "-600" küçük kopyaları kendi büyüğüyle eşleştiği için atlanır. Bulursa çıkış kodu 1.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'public/assets/images');
const ESIK = 6; // 64 bitlik dHash'te 6'dan az fark: aynı fotoğrafın kırpılmış/sıkıştırılmış hali

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(webp|jpe?g|png)$/i.test(e.name) && !/-600\.\w+$/.test(e.name)) files.push(p);
  }
})(DIR);

// dHash: 9×8 gri tonlu küçültme, yan yana piksellerin parlaklık farkı -> 64 bit.
async function dhash(file) {
  const px = await sharp(file).flatten({ background: '#fff' }).grayscale().resize(9, 8, { fit: 'fill' }).raw().toBuffer();
  let bits = 0n;
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits = (bits << 1n) | (px[y * 9 + x] > px[y * 9 + x + 1] ? 1n : 0n);
  return bits;
}
const hamming = (a, b) => { let v = a ^ b, n = 0; while (v) { n += Number(v & 1n); v >>= 1n; } return n; };

const items = [];
for (const f of files) {
  try {
    items.push({ file: path.relative(ROOT, f).replaceAll('\\', '/'), sha: crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'), h: await dhash(f) });
  } catch { /* svg dışı bozuk/desteklenmeyen dosya: atla */ }
}

const dupes = [];
for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
  const a = items[i], b = items[j];
  if (a.sha === b.sha) dupes.push(`AYNI DOSYA  ${a.file}  =  ${b.file}`);
  else { const d = hamming(a.h, b.h); if (d <= ESIK) dupes.push(`BENZER (${d})  ${a.file}  ~  ${b.file}`); }
}
console.log(`${items.length} görsel tarandı; tekrar ${dupes.length}.`);
for (const d of dupes) console.log('  ' + d);
process.exit(dupes.length ? 1 : 0);
