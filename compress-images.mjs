import sharp from 'sharp';
import { readdirSync, statSync, renameSync, unlinkSync } from 'fs';
import { join, extname, basename } from 'path';

const dirs = [
  'public/assets/images/generated',
  'public/assets/images/generated/topics',
];

let totalBefore = 0;
let totalAfter = 0;
let count = 0;

for (const dir of dirs) {
  let files;
  try { files = readdirSync(dir); } catch { continue; }

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue;

    const src = join(dir, file);
    const stat = statSync(src);
    if (!stat.isFile()) continue;

    const outName = basename(file, ext) + '.webp';
    const out = join(dir, outName);

    try {
      await sharp(src)
        .webp({ quality: 82 })
        .toFile(out);

      const outStat = statSync(out);
      totalBefore += stat.size;
      totalAfter += outStat.size;
      count++;

      // Replace original with webp
      unlinkSync(src);

      const kb = (n) => (n / 1024).toFixed(0) + 'KB';
      console.log(`✓ ${file} → ${outName}  (${kb(stat.size)} → ${kb(outStat.size)})`);
    } catch (e) {
      console.error(`✗ ${file}: ${e.message}`);
    }
  }
}

const mb = (n) => (n / 1024 / 1024).toFixed(1) + ' MB';
console.log(`\nDone: ${count} images | ${mb(totalBefore)} → ${mb(totalAfter)} (saved ${mb(totalBefore - totalAfter)})`);
