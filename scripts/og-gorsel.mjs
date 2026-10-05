// Varsayılan paylaşım görseli (1200x630): koyu zemin, solda isim ve unvan, sağda portre.
// Kullanım: node scripts/og-gorsel.mjs
import fs from 'node:fs';
import sharp from 'sharp';

const OUT = 'public/assets/images/og/dr-muhammed-ikbal-bakirci-og.jpg';
const portrait = await sharp('public/assets/images/dr-muhammed-ikbal-bakirci.jpg')
  .resize(420, 630, { fit: 'cover', position: 'top' })
  .toBuffer();

const text = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0c0f0d"/>
  <rect x="72" y="200" width="56" height="4" fill="#3BAD49"/>
  <text x="72" y="270" font-family="Roboto, Arial, sans-serif" font-size="30" fill="#9fb3a4">Dr.</text>
  <text x="72" y="330" font-family="Roboto, Arial, sans-serif" font-size="54" font-weight="700" fill="#ffffff">Muhammed İkbal</text>
  <text x="72" y="395" font-family="Roboto, Arial, sans-serif" font-size="54" font-weight="700" fill="#ffffff">Bakırcı</text>
  <text x="72" y="455" font-family="Roboto, Arial, sans-serif" font-size="26" fill="#cfd8d1">Longevity · Sağlıklı Yaşlanma · Medikal Estetik</text>
</svg>`);

fs.mkdirSync('public/assets/images/og', { recursive: true });
await sharp(text)
  .composite([{ input: portrait, left: 780, top: 0 }])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(OUT);
console.log('yazıldı:', OUT, fs.statSync(OUT).size, 'bayt');
