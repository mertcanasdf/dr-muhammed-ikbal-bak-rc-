// 1200px genişliğindeki webp görsellerin 600px kopyalarını (<ad>-600.webp) üretir; kart görselleri srcset ile bunları kullanır.
// Kullanım: node scripts/kucuk-gorseller.mjs   (yalnızca eksik ya da kaynağından eski kopyaları üretir)
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve('public/assets/images/generated');
const files = fs.readdirSync(ROOT, { recursive: true })
  .map((f) => String(f).replaceAll('\\', '/'))
  .filter((f) => f.endsWith('.webp') && !f.endsWith('-600.webp'));

let made = 0;
for (const rel of files) {
  const src = path.join(ROOT, rel);
  const out = src.replace(/\.webp$/, '-600.webp');
  const { width } = await sharp(src).metadata();
  if (!width || width < 1000) continue;
  if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs) continue;
  await sharp(src).resize({ width: 600 }).webp({ quality: 78 }).toFile(out);
  made++;
}
console.log(`${made} küçük kopya üretildi (${files.length} görsel tarandı).`);
