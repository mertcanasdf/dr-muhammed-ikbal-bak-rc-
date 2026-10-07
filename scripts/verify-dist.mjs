// dist/ çıktısını Sprint 1 kabul kriterlerine göre denetler.
// Kullanım: node scripts/verify-dist.mjs  (önce `astro build` çalışmış olmalı)
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
if (!fs.existsSync(DIST)) {
  console.error('dist/ bulunamadı. Önce `npx astro build` çalıştırın.');
  process.exit(1);
}

const files = fs.readdirSync(DIST, { recursive: true }).map((f) => String(f).replaceAll('\\', '/'));
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const textFiles = files.filter((f) => /\.(html|xml)$/.test(f));
const read = (f) => fs.readFileSync(path.join(DIST, f), 'utf8');
const isFile = (rel) => {
  const full = path.join(DIST, rel);
  return fs.existsSync(full) && fs.statSync(full).isFile();
};

// Astro build.format 'file' → hakkinda.html; eski düzen hakkinda/index.html. İkisini de kabul et.
const pageFile = (route) => [`${route}.html`, `${route}/index.html`].find(isFile) ?? `${route}.html`;

const REMOVED = ['basari-hikayeleri', 'podcast', 'kurslar', 'soylesiler'];
const MENU = ['Ana Sayfa', 'Dr. Bakırcı', 'Longevity', 'Skin Longevity', 'Keşfet', 'Medya', 'İletişim'];
const DISCLAIMER = 'Bu sitedeki içerikler genel bilgilendirme amaçlıdır; tanı ve tedavi yerine geçmez. Sağlığınızla ilgili kararlar için hekiminize danışın.';

const checks = [];
// Her denetim, sorunlu öğelerin listesini döndürür; boş liste = PASS.
const check = (name, fn) => checks.push({ name, fn });

const FORBIDDEN = [
  ['FDA metni', /Gıda ve İlaç İdaresi/],
  ['eski unvan "Dr. Longevity"', /Dr\. Longevity/],
  ['kaldırılan sayfalara link', new RegExp(`href="/(${REMOVED.join('|')})(?=["/#?])`)],
  // Kurumun resmî adı "VM Medical Park Bursa Hastanesi" (medicalpark.com.tr); farklı yazımlar kullanılmaz.
  ['hastane adının resmî olmayan yazımı', /Medikal ?park|Medicalpark (?!\.com)|Bursa VM Medical/i],
];
for (const [label, re] of FORBIDDEN) {
  check(`yasak içerik yok: ${label}`, () => textFiles.filter((f) => re.test(read(f))));
}

// Revizyon kontrol raporu (2026-10-05): kesin vaat ve klinik hedef dili.
const scriptFiles = files.filter((f) => f.endsWith('.js'));
const CLAIMS = /izleri giderir|katlayarak artır|hızlıca yenilen|gıcırdatmayı engelleyen|geri sararak|saç dökülmesini önleme|Her test bilimsel kaynaklara dayanır|Kritik Biomarker ve Klinik Hedefler|Biyolojik Yaşınız Kronolojik|Yaşlanmayı Tersine Çevirmek|7 Kanıtlanmış|Yaşayanlarının Sırrı|etkinliği kanıtlanmıştır|kalıcı olarak artırır|maksimum anti-aging/i;
check('yasak içerik yok: kesin vaat / tanı dili', () =>
  [...textFiles, ...scriptFiles].filter((f) => CLAIMS.test(read(f))));

check('tam isim standardı (soyadsız "Dr. Muhammed İkbal" yok)', () =>
  htmlFiles.filter((f) => /Dr\. Muhammed İkbal(?! Bakırcı)/.test(read(f))));

check('quiz sayfası tanı koymadığını belirtiyor', () =>
  read(pageFile('quizler')).includes('tanı koymaz') ? [] : [pageFile('quizler')]);

check('longevity göstergeleri kişiye göre bağlamlandırılmış', () =>
  read(pageFile('longevity')).includes('Kişisel hedefler') ? [] : [pageFile('longevity')]);

// Revizyon planı madde 8: içerik kütüphanesi 6 ana kategori.
const CATEGORIES = ['Longevity Bilimi', 'Beslenme', 'Hareket', 'Uyku', 'Zihin & Sosyal Yaşam', 'Skin Longevity'];
const decode = (s) => s.replaceAll('&amp;', '&').replaceAll('&#38;', '&');
check('blog: 6 kategori filtresi ve her kategoride yazı var', () => {
  const html = read(pageFile('blog'));
  const filters = [...html.matchAll(/data-filter="([^"]+)"/g)].map((m) => decode(m[1])).filter((f) => f !== 'all');
  const used = new Set([...html.matchAll(/data-cat="([^"]+)"/g)].map((m) => decode(m[1])));
  const problems = [];
  if (JSON.stringify(filters) !== JSON.stringify(CATEGORIES)) problems.push(`filtreler: ${filters.join(' · ')}`);
  for (const c of CATEGORIES) if (!used.has(c)) problems.push(`boş kategori: ${c}`);
  for (const c of used) if (!CATEGORIES.includes(c)) problems.push(`tanımsız kategori: ${c}`);
  return problems;
});
check('dünyada sağlık: filtreler 6 kategoriyle aynı', () => {
  const html = read(pageFile('dunyada-saglik'));
  const filters = [...html.matchAll(/data-filter="([^"]+)"/g)].map((m) => decode(m[1])).filter((f) => f !== 'Tümü');
  return JSON.stringify(filters) === JSON.stringify(CATEGORIES) ? [] : [`filtreler: ${filters.join(' · ')}`];
});

check('kaldırılan sayfalar build edilmedi', () => REMOVED.filter((d) => fs.existsSync(path.join(DIST, d)) || isFile(`${d}.html`)));

check('sitemap kaldırılan adresleri içermiyor', () => {
  const xml = read('sitemap.xml');
  return REMOVED.filter((d) => xml.includes(`/${d}</loc>`));
});

check('kırık iç link yok', () => {
  const broken = new Set();
  for (const f of htmlFiles) {
    for (const m of read(f).matchAll(/(?:href|src)="(\/(?!\/)[^"#?]*)/g)) {
      const p = decodeURI(m[1]);
      const ok = [p, `${p}.html`, path.posix.join(p, 'index.html')].some(isFile);
      if (!ok) broken.add(`${f} → ${m[1]}`);
    }
  }
  return [...broken];
});

// src dışındaki görsel yolları da (og:image content=, CSS url(), JSON-LD) var olan dosyalara gitmeli.
check('görsel yolları (og:image, CSS dahil) var olan dosyalara gidiyor', () => {
  const missing = new Set();
  for (const f of htmlFiles) {
    for (const m of read(f).matchAll(/\/assets\/images\/[^"'\s)>,]+/g)) {
      if (!isFile(decodeURI(m[0]))) missing.add(`${f} → ${m[0]}`);
    }
  }
  return [...missing];
});

// Her yazının kendi kapağı olmalı: başka yazının görselini kullanan kart, listede aynı resmin
// yan yana tekrarlanmasına yol açar. Yeni kapak: scripts/gorsel-konulari.mjs + gorsel-uret.mjs.
check('her yazı kendi kapağını kullanıyor (articles/<slug>.webp)', () =>
  htmlFiles.filter((f) => /^blog\/[^/]+\.html$/.test(f)).flatMap((f) => {
    const slug = f.slice('blog/'.length, -'.html'.length);
    const og = read(f).match(/property="og:image" content="([^"]+)"/)?.[1] ?? '';
    return og.endsWith(`/assets/images/generated/articles/${slug}.webp`) ? [] : [`${slug} → ${og.replace(/^https?:\/\/[^/]+/, '')}`];
  }));

// Her sayfanın canonical'ı uzantısız ve sitemap'teki adresle birebir aynı olmalı (404 sayfası hariç).
check('canonical = sitemap adresi (uzantısız, her sayfa sitemap\'te)', () => {
  const locs = new Set([...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  const problems = [];
  for (const f of htmlFiles.filter((f) => f !== '404.html')) {
    const html = read(f);
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
    const noindex = /<meta name="robots" content="noindex/.test(html);
    if (noindex) {
      if (canonical && locs.has(canonical)) problems.push(`${f}: noindex sayfa sitemap'te`);
      continue;
    }
    if (!canonical) problems.push(`${f}: canonical yok`);
    else if (/\.html$/.test(canonical)) problems.push(`${f}: ${canonical}`);
    else if (!locs.has(canonical)) problems.push(`${f}: sitemap'te yok → ${canonical}`);
  }
  return problems;
});

// Arama sonucunda kesilmesin, boş kalmasın: dizine açık sayfalarda 120–160 karakter.
check('meta description 120–160 karakter', () => {
  const decodeHtml = (s) => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  return htmlFiles.flatMap((f) => {
    const html = read(f);
    if (/<meta name="robots" content="noindex/.test(html)) return [];
    const d = decodeHtml(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '');
    return d.length < 120 || d.length > 160 ? [`${f}: ${d.length}`] : [];
  });
});

check('meta description sayfaya özgü (tekrar yok)', () => {
  const seen = new Map();
  for (const f of htmlFiles) {
    const d = read(f).match(/<meta name="description" content="([^"]*)"/)?.[1];
    if (d) seen.set(d, [...(seen.get(d) || []), f]);
  }
  return [...seen.values()].filter((fs) => fs.length > 1).map((fs) => fs.join(', '));
});

check('sayfa içi bağlantılar (#) var olan bölümlere gidiyor', () => {
  const broken = new Set();
  for (const f of htmlFiles) {
    for (const m of read(f).matchAll(/href="(\/(?!\/)[^"#?]*)#([^"]+)"/g)) {
      const [, page, id] = m;
      const target = [`${page}.html`, path.posix.join(page, 'index.html')].find(isFile);
      if (target && !read(target).includes(`id="${id}"`)) broken.add(`${f} → ${page}#${id}`);
    }
  }
  return [...broken];
});

check('anasayfa H1 "Sağlıklı Yaş Almanın Bilimi"', () =>
  /<h1[^>]*>\s*Sağlıklı Yaş Almanın Bilimi\s*<\/h1>/.test(read('index.html')) ? [] : ['index.html']);

check('anasayfada 4 kimlik kartı', () => {
  const n = (read('index.html').match(/class="hp-id"/g) || []).length;
  return n === 4 ? [] : [`bulunan kart: ${n}`];
});

check('ana menü sırası', () => {
  const html = read('index.html');
  const labels = [...html.matchAll(/<a [^>]*class="(?:main-menu__link|menu-trigger)"[^>]*>\s*([^<]+?)\s*</g)].map((m) => m[1]);
  return JSON.stringify(labels) === JSON.stringify(MENU) ? [] : [`bulunan: ${labels.join(' · ')}`];
});

check('logo unvanı', () =>
  read('index.html').includes('Hekim · Sağlık Yöneticisi · Akademisyen') ? [] : ['index.html']);

check('footer bilgilendirme metni', () =>
  htmlFiles.filter((f) => !read(f).includes(DISCLAIMER)));

check('iletişim: 4 kanal çapası', () => {
  const html = read(pageFile('iletisim'));
  return ['randevu', 'is-birligi', 'akademik', 'medya'].filter((id) => !html.includes(`id="${id}"`));
});

// Form yalnızca iş WhatsApp hattı tanımlıyken yayında; form varsa KVKK onay kutusu da olmalı.
check('iletişim: form varsa KVKK onay kutusu var', () => {
  const html = read(pageFile('iletisim'));
  return !html.includes('id="contactForm"') || html.includes('name="consent"') ? [] : [pageFile('iletisim')];
});

let failed = 0;
for (const { name, fn } of checks) {
  const problems = fn();
  if (problems.length === 0) {
    console.log(`PASS  ${name}`);
  } else {
    failed++;
    console.log(`FAIL  ${name}`);
    for (const p of problems.slice(0, 10)) console.log(`        - ${p}`);
    if (problems.length > 10) console.log(`        … +${problems.length - 10}`);
  }
}
console.log(`\n${checks.length - failed}/${checks.length} denetim geçti.`);
process.exit(failed ? 1 : 0);
