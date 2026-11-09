// Bir konunun Google ilk sayfasındaki rakip gücünü sınıflar.
//   node scripts/seo/rakip-gucu.mjs --konu "vücut yağ oranı kaç olmalı" --alanlar "acibadem.com.tr,ornek.com,..."
// --alanlar: ilk sayfadaki organik sonuçların alan adları, sırayla (reklam, görsel, video hariç).
// İlk 8 sonuçta büyük hastane/portal sayısı: 6+ ZOR (konu atlanır), 3–5 ORTA, 0–2 KOLAY.
// Sonuç data/seo/rakip-gucu.json dosyasına eklenir. Çıkış kodu: ZOR ise 2, diğerleri 0.
import path from 'node:path';
import { DATA, readJson, writeJson, trDay } from './ortak.mjs';

const GUCLU = [
  'acibadem.com.tr', 'memorial.com.tr', 'medicalpark.com.tr', 'livhospital.com', 'medipol.com.tr', 'medipol.edu.tr',
  'florence.com.tr', 'anadolusaglik.org', 'amerikanhastanesi.org', 'medicana.com.tr', 'bahcesehir.edu.tr', 'koc.edu.tr',
  'saglik.gov.tr', 'hthayat.com', 'hurriyet.com.tr', 'milliyet.com.tr', 'sabah.com.tr', 'ntv.com.tr', 'wikipedia.org',
  'who.int', 'nih.gov', 'nhs.uk', 'mayoclinic.org', 'clevelandclinic.org', 'webmd.com', 'healthline.com',
];
const ESIK_ZOR = 6, ESIK_ORTA = 3, ILK = 8;

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const konu = opt('--konu'), alanlar = opt('--alanlar');
if (!konu || !alanlar) { console.error('Kullanım: --konu "<konu>" --alanlar "a.com,b.com,..."'); process.exit(1); }

const clean = (d) => d.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
const isStrong = (d) => GUCLU.some((g) => d === g || d.endsWith(`.${g}`)) || d.endsWith('.gov.tr');
const domains = alanlar.split(',').map(clean).filter((d) => d && !d.endsWith('muhammedikbalbakirci.com')).slice(0, ILK);
if (domains.length < 4) { console.error(`En az 4 sonuç gerekli, ${domains.length} verildi; sınıflandırılmadı.`); process.exit(1); }

const strong = domains.filter(isStrong);
const sinif = strong.length >= ESIK_ZOR ? 'ZOR' : strong.length >= ESIK_ORTA ? 'ORTA' : 'KOLAY';
const file = path.join(DATA, 'rakip-gucu.json');
const kayit = readJson(file, []);
kayit.push({ day: trDay(), konu, sinif, guclu: strong.length, toplam: domains.length, domains });
writeJson(file, kayit.slice(-500));
console.log(`${sinif}: ${strong.length}/${domains.length} büyük site (${strong.join(', ') || 'yok'})`);
process.exit(sinif === 'ZOR' ? 2 : 0);
