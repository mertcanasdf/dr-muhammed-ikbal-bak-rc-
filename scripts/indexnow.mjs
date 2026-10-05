// Canlı yayından SONRA çalıştırın: sitemap'teki tüm adresleri IndexNow'a (Bing, Yandex vb.) bildirir.
// Kullanım: node scripts/indexnow.mjs            (dist/sitemap.xml'i okur)
// Anahtar dosyası public/<anahtar>.txt olarak yayında olmalı: https://www.muhammedikbalbakirci.com/<anahtar>.txt
import fs from 'node:fs';

const HOST = 'www.muhammedikbalbakirci.com';
const keyFile = fs.readdirSync('public').find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('public/ içinde IndexNow anahtar dosyası yok');
const key = keyFile.replace('.txt', '');

const keyUrl = `https://${HOST}/${keyFile}`;
const live = await fetch(keyUrl).then((r) => (r.ok ? r.text() : '')).catch(() => '');
if (live.trim() !== key) throw new Error(`Anahtar dosyası canlıda bulunamadı: ${keyUrl} — önce siteyi yayınlayın.`);

const urlList = [...fs.readFileSync('dist/sitemap.xml', 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key, keyLocation: keyUrl, urlList }),
});
console.log(`IndexNow: ${res.status} ${res.statusText} — ${urlList.length} adres bildirildi.`);
