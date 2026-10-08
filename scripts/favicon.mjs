// Logodaki nabız işaretinden site simgeleri üretir: favicon.svg, favicon.ico (48+32+16 PNG gömülü),
// apple-touch-icon.png (180) ve icon-512.png. Kullanım: node scripts/favicon.mjs
import fs from 'node:fs';
import sharp from 'sharp';

const BLUE = '#5778C5';
// Küçük boyutta okunsun diye: dolu mavi daire, beyaz ve kalın nabız çizgisi.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="12" fill="${BLUE}"/>
  <path d="M5.5 12H9.5L11.5 7L14 17L15.5 12H18.5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;
fs.writeFileSync('public/favicon.svg', svg);

const png = (size) => sharp(Buffer.from(svg), { density: 72 * (size / 24) * 2 }).resize(size, size).png().toBuffer();

// ICO kabı: PNG içeren girdiler (Windows Vista+ ve tüm tarayıcılar destekler).
const sizes = [48, 32, 16];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + 16 * i;
  header.writeUInt8(s, e);
  header.writeUInt8(s, e + 1);
  header.writeUInt8(0, e + 2);
  header.writeUInt8(0, e + 3);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(images[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += images[i].length;
});
fs.writeFileSync('public/favicon.ico', Buffer.concat([header, ...images]));

// Ana ekran simgesi: iOS köşeleri kendisi yuvarlar; tam kare zemin kullanılır.
const square = svg.replace('<circle cx="12" cy="12" r="12"', '<rect width="24" height="24"');
await sharp(Buffer.from(square), { density: 72 * (180 / 24) * 2 }).resize(180, 180).png().toFile('public/apple-touch-icon.png');
await sharp(Buffer.from(svg), { density: 72 * (512 / 24) * 2 }).resize(512, 512).png().toFile('public/icon-512.png');
console.log('favicon.svg, favicon.ico, apple-touch-icon.png, icon-512.png yazıldı');
