# Sprint 1 — Marka ve Güvenilirlik Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Siteyi "longevity ürün sitesi"nden hekim · sağlık yöneticisi · akademisyen kimliğine taşımak; güveni zedeleyen sayfaları, metinleri ve kişisel iletişim bilgilerini kaldırmak.

**Architecture:** Astro 5 statik site. Ortak kabuk (`BaseLayout` → `Header`, `Footer`) tek yerden değişir; anasayfa ve iletişim sayfası yeniden yazılır; kaldırılan sayfalar silinir ve nginx'te `410` döner. Saf mantık (`src/lib/posts.ts`, `src/lib/contact.ts`) `node --test` ile birim testine alınır; build çıktısı `scripts/verify-dist.mjs` ile kabul kriterlerine göre denetlenir.

**Tech Stack:** Astro 5, TypeScript, Node 22.18 (yerleşik `node:test` + type stripping), düz CSS (`public/style.css` global, sayfa içi `<style>` scoped).

**Spec:** `docs/superpowers/specs/2026-10-04-sprint-1-marka-guvenilirlik-design.md`

## Global Constraints

- Bütün kullanıcıya görünen metin Türkçe.
- Yeni olgu/iddia eklenmez; kimlik ve biyografi metinleri `src/pages/hakkinda.astro` içindeki mevcut metinden türetilir.
- Yeni npm bağımlılığı eklenmez.
- Renk ve tipografi `public/style.css` içindeki `:root` değişkenlerini kullanır (`--main #0E0E0E`, `--blue #5778C5`, `--tertiary #F5F5F0`, `--border #E2E2D9`, `--font Roboto`).
- Mobil menü `public/mobile-menu.js` dokunulmadan çalışmalı: üst menü öğeleri `.main-menu__list > li`, açılır menüler `li.has-megamenu > a.menu-trigger + div.megamenu` yapısını korur.
- `astro.config.mjs` → `trailingSlash: 'never'`: iç linkler sonda `/` olmadan yazılır (`/hakkinda`, `/blog/x`).
- Kişisel iletişim bilgisi (`0544 224 48 13`, `Muhammedikbalb@gmail.com`, `wa.me/905442244813`) hiçbir çıktıda yer almaz.
- Footer bilgilendirme metni birebir: `Bu sitedeki içerikler genel bilgilendirme amaçlıdır; tanı ve tedavi yerine geçmez. Sağlığınızla ilgili kararlar için hekiminize danışın.`
- Menü sırası birebir: `Ana Sayfa · Dr. Bakırcı · Longevity · Skin Longevity · Keşfet · Medya · İletişim`
- Logo altı unvan birebir: `Hekim · Sağlık Yöneticisi · Akademisyen`
- Anasayfa H1 birebir: `Sağlıklı Yaş Almanın Bilimi`
- Her görev sonunda: `npm test` ve `npm run verify` çalıştırılır; görevin hedeflediği denetimler PASS olmalı, önceki görevlerde PASS olanlar PASS kalmalı.

---

## Dosya haritası

| Dosya | İşlem | Sorumluluk |
|---|---|---|
| `scripts/verify-dist.mjs` | Oluştur | `dist/` kabul denetimleri (yasak içerik, kırık link, menü, footer, iletişim) |
| `tests/posts.test.ts` | Oluştur | Sıralama birim testleri |
| `tests/contact.test.ts` | Oluştur | Form doğrulama birim testleri |
| `package.json` | Değiştir | `test`, `verify` script'leri |
| `src/lib/posts.ts` | Oluştur | Deterministik makale sıralaması |
| `src/lib/contact.ts` | Oluştur | İletişim kanalları, doğrulama, gönderim (D1 bekliyor) |
| `src/components/Header.astro` | Yeniden yaz | Yeni menü, unvan |
| `src/components/Footer.astro` | Yeniden yaz | Yeni sütunlar, bilgilendirme metni |
| `src/pages/index.astro` | Yeniden yaz | Hero, 4 kimlik kartı, 6 alan, 3 yazı, biyografi |
| `src/pages/iletisim.astro` | Yeniden yaz | 4 kanal + form |
| `src/layouts/BaseLayout.astro` | Değiştir | `AnnouncementBar` kaldır |
| `src/lib/seo.ts` | Değiştir | Kişisel bilgiler, kaldırılan rotalar, unvan |
| `src/pages/sitemap.xml.ts` | Değiştir | Kaldırılan rotalar |
| `src/pages/{blog/index,dunyada-saglik,longevity,medikal-estetik,rehberler}.astro` | Değiştir | Sıralama yardımcı fonksiyonu |
| `src/pages/medikal-estetik.astro` | Değiştir | Başlık + randevu çağrısı |
| `src/pages/hakkinda.astro` | Değiştir | Kişisel bilgi bloğu |
| `src/content/blog/{altin-igne,botoks,dermal-dolgu,mezoterapi,prp-eksozom}.md` | Değiştir | Randevu linki |
| `src/pages/{basari-hikayeleri,podcast,kurslar,soylesiler}.astro` | Sil | — |
| `src/components/{AnnouncementBar,PromoModal}.astro` | Sil | — |
| `ana-domain-nginx-yonlendirmeler.conf` | Değiştir | `410` kuralları |

---

### Task 1: Doğrulama altyapısı

**Files:**
- Create: `scripts/verify-dist.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm run verify` (build + denetim, başarısızlıkta çıkış kodu 1), `npm test` (`node --test "tests/**/*.test.ts"`)

- [ ] **Step 1: Denetim script'ini yaz**

`scripts/verify-dist.mjs`:

```js
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

const REMOVED = ['basari-hikayeleri', 'podcast', 'kurslar', 'soylesiler'];
const MENU = ['Ana Sayfa', 'Dr. Bakırcı', 'Longevity', 'Skin Longevity', 'Keşfet', 'Medya', 'İletişim'];
const DISCLAIMER = 'Bu sitedeki içerikler genel bilgilendirme amaçlıdır; tanı ve tedavi yerine geçmez. Sağlığınızla ilgili kararlar için hekiminize danışın.';

const checks = [];
// Her denetim, sorunlu öğelerin listesini döndürür; boş liste = PASS.
const check = (name, fn) => checks.push({ name, fn });

const FORBIDDEN = [
  ['kişisel GSM', /905442244813|90-544-224|0\s?544\s?224\s?48\s?13|224\s?4813/],
  ['kişisel Gmail', /gmail\.com/i],
  ['FDA metni', /Gıda ve İlaç İdaresi/],
  ['eski unvan "Dr. Longevity"', /Dr\. Longevity/],
  ['kaldırılan sayfalara link', new RegExp(`href="/(${REMOVED.join('|')})(?=["/#?])`)],
];
for (const [label, re] of FORBIDDEN) {
  check(`yasak içerik yok: ${label}`, () => textFiles.filter((f) => re.test(read(f))));
}

check('kaldırılan sayfalar build edilmedi', () => REMOVED.filter((d) => fs.existsSync(path.join(DIST, d))));

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
  const html = read('iletisim/index.html');
  return ['randevu', 'is-birligi', 'akademik', 'medya'].filter((id) => !html.includes(`id="${id}"`));
});

check('iletişim: KVKK onay kutusu', () =>
  read('iletisim/index.html').includes('name="consent"') ? [] : ['iletisim/index.html']);

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
```

- [ ] **Step 2: npm script'lerini ekle**

`package.json` içindeki `"scripts"` bloğunu şöyle yap:

```json
  "scripts": {
    "predev": "astro sync",
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "node --test \"tests/**/*.test.ts\"",
    "verify": "astro build && node scripts/verify-dist.mjs"
  },
```

- [ ] **Step 3: Denetimin mevcut sitede başarısız olduğunu gör**

Run: `npm run verify`
Expected: Çıkış kodu 1. FAIL: kişisel GSM, kişisel Gmail, FDA metni, eski unvan, kaldırılan sayfalara link, kaldırılan sayfalar build edilmedi, sitemap, anasayfa H1, 4 kimlik kartı, ana menü sırası, logo unvanı, footer bilgilendirme metni, iletişim kanalları, KVKK. "kırık iç link yok" PASS ya da FAIL olabilir; FAIL ise listelenen linkleri not et — Task 9'da sıfır olmalı.

- [ ] **Step 4: Commit**

```bash
git add scripts/verify-dist.mjs package.json
git commit -m "test: Sprint 1 kabul denetimleri (verify-dist) ve npm script'leri"
```

---

### Task 2: Deterministik makale sıralaması

**Files:**
- Create: `src/lib/posts.ts`, `tests/posts.test.ts`
- Modify: `src/pages/blog/index.astro:5-7`, `src/pages/dunyada-saglik.astro:6`, `src/pages/longevity.astro:8`, `src/pages/medikal-estetik.astro:9`, `src/pages/rehberler.astro:8`

**Interfaces:**
- Produces: `sortPostsNewestFirst<T extends { data: { date: Date; title: string } }>(posts: readonly T[]): T[]` — `src/lib/posts.ts`

- [ ] **Step 1: Başarısız testi yaz**

`tests/posts.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sortPostsNewestFirst } from '../src/lib/posts.ts';

const post = (title: string, date: string) => ({ data: { title, date: new Date(date) } });
const titles = (posts: { data: { title: string } }[]) => posts.map((p) => p.data.title);

test('yeni tarihli yazı önce gelir', () => {
  const sorted = sortPostsNewestFirst([post('Eski', '2026-01-01'), post('Yeni', '2026-09-15')]);
  assert.deepEqual(titles(sorted), ['Yeni', 'Eski']);
});

test('aynı tarihli yazılar başlığa göre Türkçe alfabeyle sıralanır', () => {
  const sorted = sortPostsNewestFirst([
    post('Uyku', '2026-09-15'),
    post('Çay', '2026-09-15'),
    post('Cilt', '2026-09-15'),
  ]);
  assert.deepEqual(titles(sorted), ['Cilt', 'Çay', 'Uyku']);
});

test('girdi dizisini değiştirmez', () => {
  const input = [post('B', '2026-01-01'), post('A', '2026-09-15')];
  sortPostsNewestFirst(input);
  assert.deepEqual(titles(input), ['B', 'A']);
});
```

- [ ] **Step 2: Testin başarısız olduğunu gör**

Run: `npm test`
Expected: FAIL — `Cannot find module '…/src/lib/posts.ts'`

- [ ] **Step 3: Uygula**

`src/lib/posts.ts`:

```ts
interface DatedPost {
  data: { date: Date; title: string };
}

/**
 * En yeni yazı önce gelir. Aynı tarihli yazılar başlığa göre (Türkçe alfabe) sıralanır;
 * böylece her build aynı sırayı ve aynı "son 3 yazı" seçimini üretir.
 */
export function sortPostsNewestFirst<T extends DatedPost>(posts: readonly T[]): T[] {
  return [...posts].sort(
    (a, b) =>
      b.data.date.getTime() - a.data.date.getTime() ||
      a.data.title.localeCompare(b.data.title, 'tr'),
  );
}
```

- [ ] **Step 4: Testin geçtiğini gör**

Run: `npm test`
Expected: 3 test PASS.

- [ ] **Step 5: Sayfalarda kullan**

Her dosyada `import { getCollection } from 'astro:content';` satırının altına ekle:

```ts
import { sortPostsNewestFirst } from '../lib/posts';
```

(`src/pages/blog/index.astro` için yol `'../../lib/posts'`.)

Değişiklikler:

`src/pages/blog/index.astro`:
```ts
// önce
const posts = (await getCollection('blog')).sort(
  (a, b) => b.data.date.getTime() - a.data.date.getTime()
);
// sonra
const posts = sortPostsNewestFirst(await getCollection('blog'));
```

`src/pages/dunyada-saglik.astro`:
```ts
// önce
const posts = allPosts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
// sonra
const posts = sortPostsNewestFirst(allPosts);
```

`src/pages/longevity.astro`, `src/pages/medikal-estetik.astro`, `src/pages/rehberler.astro` — zincirdeki `.sort(...)` satırını kaldır ve filtrelenmiş diziyi sarmala. Örnek (`longevity.astro`):
```ts
// önce
const longevityPosts = allPosts
  .filter(post => ['Longevity', 'Otofaji', 'Hücre Sağlığı', 'Egzersiz'].includes(post.data.category))
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
  .slice(0, 3);
// sonra
const longevityPosts = sortPostsNewestFirst(
  allPosts.filter(post => ['Longevity', 'Otofaji', 'Hücre Sağlığı', 'Egzersiz'].includes(post.data.category)),
).slice(0, 3);
```
`medikal-estetik.astro` (`estetikPosts`, kategoriler `['Medikal Estetik', 'Sağlık Trendleri']`) ve `rehberler.astro` (`relatedPosts`, kategoriler `['Beslenme', 'Stres', 'Egzersiz']`) aynı biçimde.

- [ ] **Step 6: İki build'in aynı çıktıyı verdiğini doğrula**

Run:
```bash
npx astro build && cp -r dist /tmp/build-a && npx astro build && diff -rq dist /tmp/build-a -x _astro && echo AYNI
```
Expected: `AYNI`

- [ ] **Step 7: Commit**

```bash
git add src/lib/posts.ts tests/posts.test.ts src/pages/blog/index.astro src/pages/dunyada-saglik.astro src/pages/longevity.astro src/pages/medikal-estetik.astro src/pages/rehberler.astro
git commit -m "fix: makale listeleri deterministik sıralanıyor (tarih + başlık)"
```

---

### Task 3: Header — yeni menü ve unvan

**Files:**
- Rewrite: `src/components/Header.astro`
- Modify: `src/pages/medikal-estetik.astro:23` (BaseLayout title), `:281` (H1)

**Interfaces:**
- Produces: üst menü bağlantıları `a.main-menu__link` (açılır menüsüz) veya `a.menu-trigger` (açılır menülü); `verify-dist` "ana menü sırası" bunlara bakar.

- [ ] **Step 1: Header'ı yeniden yaz**

`src/components/Header.astro` dosyasının tamamı:

```astro
---
// src/components/Header.astro
const chevron = 'M1 1L5 5L9 1';
---
<div class="header-wrapper" id="headerWrapper">

  <header class="site-header">
    <div class="container site-header__inner">

      <a href="/" class="site-logo" aria-label="Dr. Muhammed İkbal Bakırcı Ana Sayfa">
        <div class="site-logo__mark">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="var(--blue)" fill-opacity="0.08" stroke="var(--blue)" stroke-width="2"/>
            <path d="M8 12H11L12.5 8L14 16L15 12H16" stroke="var(--blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="site-logo__text">
          <span class="site-logo__fullname">
            <span class="site-logo__dr">Dr.</span>
            <span class="site-logo__name">Muhammed İkbal</span>
            <span class="site-logo__surname">Bakırcı</span>
          </span>
          <span class="site-logo__role">Hekim · Sağlık Yöneticisi · Akademisyen</span>
        </span>
      </a>

      <div class="header-search-wrap">
        <input type="search" class="header-search-input" placeholder="Ara" aria-label="Ara" />
        <button class="header-search-btn" aria-label="Ara">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
      </div>

      <div class="header-actions">
        <button class="hamburger" id="hamburger" aria-label="Menüyü aç" aria-expanded="false" aria-controls="mainMenu">
          <span></span><span></span><span></span>
        </button>
      </div>

    </div>
  </header>

  <nav class="main-menu" id="mainMenu" aria-label="Ana navigasyon">
    <div class="container">
      <ul class="main-menu__list">
        <li><a href="/" class="main-menu__link">Ana Sayfa</a></li>
        <li><a href="/hakkinda" class="main-menu__link">Dr. Bakırcı</a></li>

        <li class="has-megamenu">
          <a href="/longevity" class="menu-trigger">Longevity
            <svg class="dropdown-icon" width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d={chevron} stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
          <div class="megamenu">
            <div class="megamenu__container">
              <div class="megamenu__column">
                <h4 class="megamenu__title">Longevity Temelleri</h4>
                <ul class="megamenu__links">
                  <li><a href="/longevity#longevity-bilimi">Uzun Ömür Biyolojisi</a></li>
                  <li><a href="/longevity#hucresel-temizlik">Hücresel Temizlik (Otofaji)</a></li>
                  <li><a href="/blog/sirt6-proteini-epigenetik-genclesme">Epigenetik Gençleşme</a></li>
                  <li><a href="/blog/telomerleri-korumak">Telomerleri Korumak</a></li>
                </ul>
              </div>
              <div class="megamenu__column">
                <h4 class="megamenu__title">Yaşam Tarzı Sütunları</h4>
                <ul class="megamenu__links">
                  <li><a href="/longevity#metabolik-saglik">Metabolik Sağlık (Kan Şekeri)</a></li>
                  <li><a href="/longevity#kardiyorespiratuar-kapasite">Kardiyorespiratuar (VO2 Maks)</a></li>
                  <li><a href="/longevity#kas-kitlesi-gucu">Kas Kitlesi ve Gücü</a></li>
                  <li><a href="/longevity#beyin-sagligi">Beyin Sağlığı &amp; Bilişsel Rezerv</a></li>
                </ul>
              </div>
              <div class="megamenu__column">
                <h4 class="megamenu__title">Günlük Alışkanlıklar</h4>
                <ul class="megamenu__links">
                  <li><a href="/blog/aralikli-oruc-longevity">Aralıklı Oruç</a></li>
                  <li><a href="/blog/mavi-bolge-diyeti">Mavi Bölge Diyeti</a></li>
                  <li><a href="/blog/uyku-kalitesi-nasil-artirilir">Uyku Kalitesi</a></li>
                  <li><a href="/blog/sosyal-baglanti-ve-uzun-omur">Sosyal Bağlantı ve Uzun Ömür</a></li>
                  <li><a href="/longevity" class="megamenu__special-link">Tüm Longevity içeriği &rarr;</a></li>
                </ul>
              </div>
            </div>
          </div>
        </li>

        <li class="has-megamenu">
          <a href="/medikal-estetik" class="menu-trigger">Skin Longevity
            <svg class="dropdown-icon" width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d={chevron} stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
          <div class="megamenu megamenu--center">
            <div class="megamenu__container">
              <div class="megamenu__column">
                <h4 class="megamenu__title">Cilt Biyolojisi</h4>
                <ul class="megamenu__links">
                  <li><a href="/blog/ciltte-kollajen-kaybi">Ciltte Kollajen Kaybı</a></li>
                  <li><a href="/blog/cilt-bariyeri-nasil-guclendirilir">Cilt Bariyeri</a></li>
                  <li><a href="/blog/gunes-kremi-nasil-secilir">Güneş Kremi Seçimi</a></li>
                  <li><a href="/blog/retinoid-nedir">Retinoidler</a></li>
                  <li><a href="/blog/senolitik-tedaviler-cilt-genclesmesi-zombi-hucreler">Senolitik Tedaviler</a></li>
                </ul>
              </div>
              <div class="megamenu__column">
                <h4 class="megamenu__title">Medikal Estetik</h4>
                <ul class="megamenu__links">
                  <li><a href="/blog/botoks">Botulinum Toksin (Botoks)</a></li>
                  <li><a href="/blog/dermal-dolgu">Dermal Dolgu</a></li>
                  <li><a href="/blog/altin-igne">Altın İğne (Fraksiyonel RF)</a></li>
                  <li><a href="/blog/mezoterapi">Mezoterapi</a></li>
                  <li><a href="/blog/prp-eksozom">PRP &amp; Eksozom</a></li>
                  <li><a href="/medikal-estetik" class="megamenu__special-link">Tüm Skin Longevity içeriği &rarr;</a></li>
                </ul>
              </div>
            </div>
          </div>
        </li>

        <li class="has-megamenu">
          <a href="/blog" class="menu-trigger">Keşfet
            <svg class="dropdown-icon" width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d={chevron} stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
          <div class="megamenu megamenu--right">
            <div class="megamenu__container">
              <div class="megamenu__column">
                <h4 class="megamenu__title">Keşfet</h4>
                <ul class="megamenu__links">
                  <li><a href="/blog">İçerik Kütüphanesi</a></li>
                  <li><a href="/rehberler">Rehberler</a></li>
                  <li><a href="/quizler">Kendini Değerlendir</a></li>
                  <li><a href="/dunyada-saglik">Dünyada Sağlık</a></li>
                </ul>
              </div>
            </div>
          </div>
        </li>

        <li><a href="/gecmis-yillar" class="main-menu__link">Medya</a></li>
        <li><a href="/iletisim" class="main-menu__link">İletişim</a></li>
      </ul>
    </div>
  </nav>

</div>
```

- [ ] **Step 2: Medikal estetik başlığını menüyle eşle**

`src/pages/medikal-estetik.astro`:
- Satır 23, `BaseLayout title="Medikal Estetik & Güzellik — Dr. Muhammed İkbal Bakırcı"` → `title="Skin Longevity & Medikal Estetik — Dr. Muhammed İkbal Bakırcı"`
- Satır 281, `<h1 class="pg-hero__title">Medikal Estetik &amp; Güzellik</h1>` → `<h1 class="pg-hero__title">Skin Longevity &amp; Medikal Estetik</h1>`
- `src/lib/seo.ts` → `routeLabel` içinde `'medikal-estetik': 'Medikal Estetik',` → `'medikal-estetik': 'Skin Longevity & Medikal Estetik',` (breadcrumb sayfa başlığıyla aynı olsun)

- [ ] **Step 3: Denetimi çalıştır**

Run: `npm run verify`
Expected: "ana menü sırası", "logo unvanı", "eski unvan" PASS. (Diğerleri sonraki görevlerde.)

- [ ] **Step 4: Tarayıcıda kontrol**

`npm run dev` → `http://localhost:4321`
- Masaüstü (≥1100px): 7 menü öğesi tek satırda; Longevity / Skin Longevity / Keşfet üzerine gelince açılır menü görünür.
- Mobil (375px): hamburger menüyü açar; "Longevity" dokununca alt menü açılır, "Tüm Longevity içeriği →" linki çalışır; "Medya" `/gecmis-yillar`a gider.
- Eski üst yardımcı çubuk (Hakkında / İletişim) görünmez.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro src/pages/medikal-estetik.astro src/lib/seo.ts
git commit -m "feat: yeni ana menü ve unvan (madde 9)"
```

---

### Task 4: Footer — sütunlar ve bilgilendirme metni

**Files:**
- Rewrite: `src/components/Footer.astro`

- [ ] **Step 1: Footer'ı yeniden yaz**

`src/components/Footer.astro` dosyasının tamamı:

```astro
---
// src/components/Footer.astro
const columns = [
  {
    heading: 'Dr. Bakırcı',
    links: [
      { href: '/hakkinda', label: 'Hakkında' },
      { href: '/gecmis-yillar', label: 'Kongreler ve Konuşmalar' },
      { href: '/iletisim', label: 'İletişim' },
    ],
  },
  {
    heading: 'Alanlar',
    links: [
      { href: '/longevity', label: 'Longevity' },
      { href: '/medikal-estetik', label: 'Skin Longevity' },
    ],
  },
  {
    heading: 'Keşfet',
    links: [
      { href: '/blog', label: 'İçerik Kütüphanesi' },
      { href: '/rehberler', label: 'Rehberler' },
      { href: '/quizler', label: 'Kendini Değerlendir' },
      { href: '/dunyada-saglik', label: 'Dünyada Sağlık' },
    ],
  },
];
---
<footer class="footer">
  <div class="container">
    <div class="footer__top">
      <div class="footer__brand">
        <a href="/" class="footer__logo"><span class="footer__logo-text">Dr. Muhammed İkbal Bakırcı</span></a>
        <p class="footer__tagline">Hekim · Sağlık Yöneticisi · Akademisyen</p>
      </div>
      {columns.map((col) => (
        <div class="footer__col">
          <h4 class="footer__heading">{col.heading}</h4>
          <ul class="footer__links">
            {col.links.map((link) => <li><a href={link.href}>{link.label}</a></li>)}
          </ul>
        </div>
      ))}
    </div>

    <div class="footer__disclaimer">
      <p>Bu sitedeki içerikler genel bilgilendirme amaçlıdır; tanı ve tedavi yerine geçmez. Sağlığınızla ilgili kararlar için hekiminize danışın.</p>
    </div>

    <div class="footer__bottom">
      <nav class="footer__legal" aria-label="Yasal bağlantılar">
        <a href="/gizlilik-politikasi">Gizlilik Politikası</a>
        <a href="/kullanim-kosullari">Kullanım Koşulları</a>
        <a href="/iletisim">İletişim</a>
      </nav>
      <p class="footer__copy">&copy; {new Date().getFullYear()} Dr. Muhammed İkbal Bakırcı. Tüm hakları saklıdır.</p>
    </div>
  </div>
</footer>

<style>
  /* Global stil 5 sütun bekliyor (marka + 4); artık marka + 3 sütun var. */
  @media (min-width: 1025px) {
    .footer__top { grid-template-columns: 2fr 1fr 1fr 1fr; }
  }
</style>
```

- [ ] **Step 2: Denetimi çalıştır**

Run: `npm run verify`
Expected: "footer bilgilendirme metni", "FDA metni" PASS.

- [ ] **Step 3: Tarayıcıda kontrol**

Masaüstünde footer'da 4 sütun boşluksuz; 1024px altında marka satırı tam genişlik, 3 link sütunu altında; 600px altında 2 sütun.

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: footer sadeleştirildi, Türkiye'ye uygun bilgilendirme metni (madde 15)"
```

---

### Task 5: Anasayfa — hero, kimlik kartları, 6 alan

**Files:**
- Rewrite: `src/pages/index.astro`

**Interfaces:**
- Consumes: `BaseLayout` props `title`, `description`, `image`
- Produces: `.hp-id` sınıflı 4 kart (verify-dist sayar)

- [ ] **Step 1: Anasayfayı yeniden yaz**

`src/pages/index.astro` dosyasının tamamı:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';

const portrait = '/assets/images/dr-muhammed-ikbal-bakirci.jpg';

// İkon yolları 24×24 çizgi ikonlardır (stroke = currentColor).
const identities = [
  {
    title: 'Hekim',
    text: '2008’den bu yana hekimlik; medikal estetik ve uzun vadeli cilt sağlığı.',
    icon: ['M11 2v2', 'M5 2v2', 'M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1', 'M8 15a6 6 0 0 0 12 0v-3', 'M18 10a2 2 0 1 0 4 0a2 2 0 1 0-4 0'],
  },
  {
    title: 'Sağlık Yöneticisi',
    text: '2022’den bu yana VM Medical Park Bursa Hastanesi Başhekimi.',
    icon: ['M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z', 'M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2', 'M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2', 'M10 6h4', 'M10 10h4', 'M10 14h4', 'M10 18h4'],
  },
  {
    title: 'Akademisyen',
    text: 'Sağlık yönetimi, pazarlama, kozmetik ve longevity alanlarında akademik çalışmalar.',
    icon: ['M22 10 12 5 2 10l10 5 10-5Z', 'M22 10v6', 'M6 12v5c3 3 9 3 12 0v-5'],
  },
  {
    title: 'Longevity',
    text: 'Sağlıklı yaş alma ve insan optimizasyonu üzerine bütüncül yaklaşım.',
    icon: ['M22 12h-4l-3 9L9 3l-3 9H2'],
  },
];

const pillars = [
  { title: 'Beslenme', text: 'Sürdürülebilir beslenme alışkanlıkları ve metabolik sağlık.', href: '/blog/lifli-beslenme-ve-mikrobiyota' },
  { title: 'Hareket', text: 'Günlük hareket, kas gücü ve fiziksel kapasite.', href: '/blog/direnc-antrenmani-yaslanma' },
  { title: 'Uyku', text: 'Düzenli uyku ritmi ve dinlenmeye alan açmak.', href: '/blog/uyku-kalitesi-nasil-artirilir' },
  { title: 'Zihin', text: 'Psikolojik denge ve stresle baş etme.', href: '/blog/kortizol-yaslanma' },
  { title: 'Sosyal İlişkiler', text: 'Bağ kurmak, paylaşmak ve yaşamda anlam bulmak.', href: '/blog/sosyal-baglanti-ve-uzun-omur' },
  { title: 'Skin Longevity', text: 'Cildin uzun vadeli sağlığı ve bakımı.', href: '/medikal-estetik' },
];

const featuredSlugs = ['vo2max-ve-longevity', 'uyku-kalitesi-nasil-artirilir', 'ciltte-kollajen-kaybi'];
const slugOf = (id: string) => id.replace(/\.mdx?$/, '');
const posts = await getCollection('blog');
const featured = featuredSlugs.map((slug) => {
  const post = posts.find((p) => slugOf(p.id) === slug);
  if (!post) throw new Error(`Anasayfada öne çıkan yazı bulunamadı: ${slug}`);
  return post;
});
---
<BaseLayout
  title="Dr. Muhammed İkbal Bakırcı — Sağlıklı Yaş Almanın Bilimi"
  description="Hekim, sağlık yöneticisi ve akademisyen Dr. Muhammed İkbal Bakırcı: longevity, insan optimizasyonu, skin longevity ve medikal estetik üzerine bilimsel bakış."
  image={portrait}
>
  <section class="hp-hero" aria-labelledby="hp-title">
    <div class="container hp-hero__grid">
      <div class="hp-hero__copy">
        <p class="hp-hero__name">Dr. Muhammed İkbal Bakırcı</p>
        <h1 id="hp-title">Sağlıklı Yaş Almanın Bilimi</h1>
        <p class="hp-hero__fields">Longevity · İnsan Optimizasyonu<br />Skin Longevity · Medikal Estetik</p>
        <p class="hp-hero__message">Sağlıklı yaşam yalnızca daha uzun yaşamak değildir. Bedeni, zihni ve sosyal yaşamı birlikte koruyarak daha iyi yaş almaktır.</p>
        <div class="hp-actions">
          <a class="btn btn-light" href="/hakkinda">Dr. Bakırcı’yı tanıyın</a>
          <a class="hp-btn-outline" href="/longevity">Longevity’yi keşfedin</a>
        </div>
      </div>
      <figure class="hp-hero__portrait">
        <img src={portrait} width="682" height="1024" alt="Dr. Muhammed İkbal Bakırcı" fetchpriority="high" loading="eager" />
      </figure>
    </div>
  </section>

  <section class="hp-ids" aria-label="Kimlik">
    <div class="container hp-ids__grid">
      {identities.map((item) => (
        <div class="hp-id">
          <svg class="hp-id__icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            {item.icon.map((d) => <path d={d} />)}
          </svg>
          <h2>{item.title}</h2>
          <p>{item.text}</p>
        </div>
      ))}
    </div>
  </section>

  <section class="hp-section" aria-labelledby="hp-pillars-title">
    <div class="container">
      <div class="hp-head">
        <h2 id="hp-pillars-title">Sağlıklı yaş almanın altı alanı</h2>
        <p>Longevity tek bir takviye, diyet ya da uygulamadan ibaret değildir; günlük yaşamın birbirine bağlı alanlarında sürdürülebilir alışkanlıklar gerektirir.</p>
      </div>
      <div class="hp-pillars">
        {pillars.map((p) => (
          <a class="hp-pillar" href={p.href}>
            <h3>{p.title}</h3>
            <p>{p.text}</p>
          </a>
        ))}
      </div>
    </div>
  </section>

  <section class="hp-section hp-section--soft" aria-labelledby="hp-reading-title">
    <div class="container">
      <div class="hp-head hp-head--row">
        <h2 id="hp-reading-title">İçerik kütüphanesinden</h2>
        <a class="hp-link" href="/blog">Tüm içerikler &rarr;</a>
      </div>
      <div class="hp-reading">
        {featured.map((post) => (
          <article class="hp-card">
            <img src={post.data.image} alt="" width="1200" height="800" loading="lazy" decoding="async" />
            <p class="hp-card__cat">{post.data.category}</p>
            <h3><a href={`/blog/${slugOf(post.id)}`}>{post.data.title}</a></h3>
            <p class="hp-card__desc">{post.data.description}</p>
          </article>
        ))}
      </div>
    </div>
  </section>

  <section class="hp-section" aria-labelledby="hp-bio-title">
    <div class="container hp-bio">
      <img src="/assets/images/generated/doctor-portrait.webp" alt="" width="1200" height="800" loading="lazy" decoding="async" />
      <div>
        <h2 id="hp-bio-title">Dr. Muhammed İkbal Bakırcı</h2>
        <p>2008 yılında Atatürk Üniversitesi Tıp Fakültesi’nden mezun oldu. Doğu Anadolu’da ve hava ambulans hekimi olarak klinik deneyim kazandıktan sonra Bursa’da kamu ve özel hastanelerde çalıştı; Bursa Şehir Hastanesi’nin kuruluş sürecinde başhekim yardımcısı olarak görev aldı.</p>
        <p>2022’den bu yana VM Medical Park Bursa Hastanesi Başhekimi olarak görev yapıyor ve medikal estetik uygulamalarını sürdürüyor. Pazarlama, kozmetik ve longevity alanlarındaki akademik çalışmalarına devam ediyor.</p>
        <div class="hp-actions">
          <a class="btn btn-dark" href="/hakkinda">Hakkımda</a>
          <a class="hp-btn-border" href="/iletisim">İletişime geçin</a>
        </div>
      </div>
    </div>
  </section>
</BaseLayout>

<style>
  .hp-hero { background: var(--main); color: #fff; overflow: hidden; }
  .hp-hero__grid { display: grid; grid-template-columns: 1.15fr 1fr; gap: 48px; align-items: end; }
  .hp-hero__copy { padding: 72px 0; align-self: center; }
  .hp-hero__name { font-size: 18px; font-weight: 700; color: #d6dbe0; }
  .hp-hero h1 { font-size: clamp(40px, 5.4vw, 68px); line-height: 1.06; letter-spacing: -1.5px; font-weight: 900; margin: 20px 0 22px; }
  .hp-hero__fields { font-size: 16px; line-height: 1.7; color: #c3cbd2; }
  .hp-hero__message { max-width: 520px; margin-top: 18px; font-size: 18px; line-height: 1.7; color: #e8ecef; }
  .hp-hero__portrait { height: 600px; }
  .hp-hero__portrait img { width: 100%; height: 100%; object-fit: cover; object-position: center 22%; }

  .hp-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
  .hp-btn-outline, .hp-btn-border { display: inline-block; padding: 12px 24px; border-radius: var(--r-btn); border: 2px solid; font-weight: 700; font-size: 15px; line-height: 1.4; }
  .hp-btn-outline { border-color: rgba(255, 255, 255, .45); color: #fff; }
  .hp-btn-outline:hover { border-color: #fff; }
  .hp-btn-border { border-color: var(--border); color: var(--main); }
  .hp-btn-border:hover { border-color: var(--main); }

  .hp-ids { background: var(--base); border-bottom: 1px solid var(--border); }
  .hp-ids__grid { display: grid; grid-template-columns: repeat(4, 1fr); }
  .hp-id { padding: 32px 28px; border-right: 1px solid var(--border); }
  .hp-id:first-child { padding-left: 0; }
  .hp-id:last-child { border-right: 0; padding-right: 0; }
  .hp-id__icon { color: var(--blue); margin-bottom: 14px; }
  .hp-id h2 { font-size: 19px; font-weight: 800; margin-bottom: 8px; }
  .hp-id p { font-size: 14px; line-height: 1.6; color: var(--gray-500); }

  .hp-section { padding: 80px 0; }
  .hp-section--soft { background: var(--base); }
  .hp-head { max-width: 720px; margin-bottom: 36px; }
  .hp-head h2 { font-size: clamp(26px, 3vw, 38px); font-weight: 800; letter-spacing: -.5px; line-height: 1.2; }
  .hp-head p { margin-top: 12px; font-size: 17px; line-height: 1.7; color: var(--gray-500); }
  .hp-head--row { max-width: none; display: flex; justify-content: space-between; align-items: end; gap: 24px; }
  .hp-link { color: var(--blue); font-weight: 700; text-decoration: underline; text-underline-offset: 4px; }

  .hp-pillars { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .hp-pillar { display: block; padding: 24px; background: var(--base); border: 1px solid var(--border); border-radius: var(--r-lg); transition: border-color .2s, transform .2s; }
  .hp-pillar:hover { border-color: var(--main); transform: translateY(-2px); }
  .hp-pillar h3 { font-size: 19px; font-weight: 800; margin-bottom: 6px; }
  .hp-pillar p { font-size: 15px; line-height: 1.6; color: var(--gray-500); }

  .hp-reading { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
  .hp-card img { width: 100%; height: auto; aspect-ratio: 3 / 2; object-fit: cover; border-radius: var(--r); }
  .hp-card__cat { margin: 16px 0 6px; font-size: 13px; font-weight: 700; color: var(--blue); text-transform: uppercase; letter-spacing: .6px; }
  .hp-card h3 { font-size: 19px; font-weight: 800; line-height: 1.35; }
  .hp-card h3 a:hover { text-decoration: underline; }
  .hp-card__desc { margin-top: 10px; font-size: 15px; line-height: 1.6; color: var(--gray-500); }

  .hp-bio { display: grid; grid-template-columns: 280px 1fr; gap: 56px; align-items: center; max-width: 1040px; }
  .hp-bio img { width: 280px; height: 340px; object-fit: cover; border-radius: var(--r-lg); }
  .hp-bio h2 { font-size: clamp(26px, 3vw, 36px); font-weight: 800; margin-bottom: 18px; }
  .hp-bio p { font-size: 16px; line-height: 1.8; color: var(--gray-700); margin-bottom: 14px; }

  @media (max-width: 900px) {
    .hp-hero__grid { grid-template-columns: 1fr; gap: 0; }
    .hp-hero__copy { padding: 48px 0 32px; }
    .hp-hero__portrait { height: 380px; max-width: 440px; width: 100%; justify-self: center; }
    .hp-ids__grid { grid-template-columns: 1fr 1fr; }
    .hp-id, .hp-id:first-child, .hp-id:last-child { padding: 24px 0; border-right: 0; }
    .hp-ids__grid .hp-id:nth-child(odd) { padding-right: 20px; }
    .hp-pillars, .hp-reading { grid-template-columns: 1fr 1fr; }
    .hp-bio { grid-template-columns: 1fr; gap: 28px; }
  }
  @media (max-width: 600px) {
    .hp-section { padding: 56px 0; }
    .hp-ids__grid, .hp-pillars, .hp-reading { grid-template-columns: 1fr; }
    .hp-ids__grid .hp-id:nth-child(odd) { padding-right: 0; }
    .hp-head--row { flex-direction: column; align-items: start; }
    .hp-bio img { width: 200px; height: 250px; }
  }
</style>
```

- [ ] **Step 2: Denetimi çalıştır**

Run: `npm run verify`
Expected: "anasayfa H1", "anasayfada 4 kimlik kartı" PASS. Anasayfadaki eski WhatsApp ve kaldırılan sayfa linkleri artık yok.

- [ ] **Step 3: Tarayıcıda kontrol**

`/` — masaüstü: hero solda metin, sağda portre; altında 4 kart tek satır. 900px: kartlar 2×2, portre metnin altında. 375px: her şey tek sütun, yatay kaydırma yok (`document.documentElement.scrollWidth === innerWidth`).

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: anasayfa yeniden yazıldı — hero ve 4 kimlik kartı (madde 1, 2)"
```

---

### Task 6: Kaldırılan sayfalar, duyuru bandı, popup

**Files:**
- Delete: `src/pages/basari-hikayeleri.astro`, `src/pages/podcast.astro`, `src/pages/kurslar.astro`, `src/pages/soylesiler.astro`, `src/components/AnnouncementBar.astro`, `src/components/PromoModal.astro`
- Modify: `src/layouts/BaseLayout.astro:4,83`, `src/pages/sitemap.xml.ts` (`staticRoutes`), `src/lib/seo.ts` (`ROUTE_DESCRIPTIONS`, `routeLabel`), `ana-domain-nginx-yonlendirmeler.conf`

- [ ] **Step 1: Dosyaları sil**

```bash
git rm src/pages/basari-hikayeleri.astro src/pages/podcast.astro src/pages/kurslar.astro src/pages/soylesiler.astro src/components/AnnouncementBar.astro src/components/PromoModal.astro
```

- [ ] **Step 2: Layout'tan duyuru bandını çıkar**

`src/layouts/BaseLayout.astro` içinde şu iki satırı sil:

```astro
import AnnouncementBar from '../components/AnnouncementBar.astro';
```
```astro
  <AnnouncementBar />
```

- [ ] **Step 3: Sitemap**

`src/pages/sitemap.xml.ts` → `staticRoutes` dizisinden `'/basari-hikayeleri'`, `'/kurslar'`, `'/podcast'`, `'/soylesiler'` satırlarını sil.

- [ ] **Step 4: SEO tabloları**

`src/lib/seo.ts`:
- `ROUTE_DESCRIPTIONS` içinden `'/kurslar'`, `'/podcast'`, `'/soylesiler'`, `'/basari-hikayeleri'` satırlarını sil.
- `routeLabel` içinden şu dört satırı sil: `'basari-hikayeleri': 'Başarı Hikâyeleri',`, `kurslar: 'Kurslar',`, `podcast: 'Podcast',`, `soylesiler: 'Söyleşiler',`

Kontrol: `grep -nE "basari|podcast|kurslar|soylesiler" src/lib/seo.ts src/pages/sitemap.xml.ts` → çıktı yok.

- [ ] **Step 5: nginx 410 kuralları**

`ana-domain-nginx-yonlendirmeler.conf` dosyasının sonuna ekle:

```nginx

# --- Sprint 1 (2026-10): bilerek kaldirilan sayfalar ---
# 410 Gone: icerik kalici olarak kaldirildi; Google dizinden hizla cikarir.
location ~ ^/(basari-hikayeleri|podcast|kurslar|soylesiler)/?$ {
    return 410;
}
```

- [ ] **Step 6: Denetimi çalıştır**

Run: `npm run verify`
Expected: "kaldırılan sayfalar build edilmedi", "sitemap kaldırılan adresleri içermiyor", "kaldırılan sayfalara link" PASS. Grep ile kalan referans olmadığını doğrula: `grep -rnE "basari-hikayeleri|/podcast|/kurslar|/soylesiler|AnnouncementBar|PromoModal" src` → çıktı yok.

- [ ] **Step 7: Commit**

```bash
git add -A src ana-domain-nginx-yonlendirmeler.conf
git commit -m "feat: başarı hikayeleri, podcast, kurslar, söyleşiler ve duyuru bandı kaldırıldı (madde 3, 4)"
```

---

### Task 7: Kişisel iletişim bilgilerinin kaldırılması

**Files:**
- Modify: `src/lib/seo.ts:113-115`, `src/pages/hakkinda.astro:16-18,48-58`, `src/pages/medikal-estetik.astro:550-556`, `src/content/blog/{altin-igne,botoks,dermal-dolgu,mezoterapi,prp-eksozom}.md`

- [ ] **Step 1: JSON-LD**

`src/lib/seo.ts` Person nesnesi:

```ts
// önce
        jobTitle: 'Hekim ve sağlık eğitmeni',
        email: 'mailto:Muhammedikbalb@gmail.com',
        telephone: '+90-544-224-48-13',
// sonra
        jobTitle: 'Hekim, sağlık yöneticisi ve akademisyen',
```

- [ ] **Step 2: Hakkında sayfası**

`src/pages/hakkinda.astro`:
- Satır 16–18 arasındaki üç CSS kuralını sil (`.about-img-meta`, `.about-meta-item`, `.about-meta-item svg`).
- Portre görselinin altındaki `<div class="about-img-meta"> … </div>` bloğunun tamamını sil (e-posta ve telefon iki `about-meta-item` ile birlikte). Görsel `<img … class="about-img" />` kalır.

- [ ] **Step 3: Medikal estetik randevu çağrısı**

`src/pages/medikal-estetik.astro` CTA bloğu:

```astro
<!-- önce -->
          <p>Medikal estetik ve cilt sağlığı görüşmeleri WhatsApp üzerinden planlanmaktadır.</p>
        </div>
        <a href="https://wa.me/905442244813?text=…" target="_blank" rel="noopener" class="btn-glow-dark">WhatsApp'tan Randevu Al</a>
<!-- sonra -->
          <p>Medikal estetik ve skin longevity değerlendirmesi için iletişim formundan randevu talebinizi iletebilirsiniz.</p>
        </div>
        <a href="/iletisim#randevu" class="btn-glow-dark">Randevu Talebi Gönder</a>
```

- [ ] **Step 4: Beş estetik yazısı**

Her dosyadaki `[Birebir Değerlendirme ve Randevu İçin WhatsApp'tan Bize Ulaşın →](https://wa.me/905442244813?text=…)` satırını şu satırla değiştir:

```markdown
[Birebir değerlendirme ve randevu talebi için iletişim formunu kullanın →](/iletisim#randevu)
```

```bash
for f in altin-igne botoks dermal-dolgu mezoterapi prp-eksozom; do
  sed -i -E "s#^\[Birebir Değerlendirme ve Randevu İçin WhatsApp'tan Bize Ulaşın →\]\(https://wa\.me/905442244813[^)]*\)#[Birebir değerlendirme ve randevu talebi için iletişim formunu kullanın →](/iletisim\#randevu)#" "src/content/blog/$f.md"
done
grep -c "iletisim#randevu" src/content/blog/{altin-igne,botoks,dermal-dolgu,mezoterapi,prp-eksozom}.md
```
Expected: her dosya için `1`.

- [ ] **Step 5: Denetimi çalıştır**

Run: `npm run verify`
Expected: "kişisel GSM" ve "kişisel Gmail" denetimlerinde yalnızca `iletisim/index.html` kalır (Task 8'de çözülür).

- [ ] **Step 6: Commit**

```bash
git add src/lib/seo.ts src/pages/hakkinda.astro src/pages/medikal-estetik.astro src/content/blog/altin-igne.md src/content/blog/botoks.md src/content/blog/dermal-dolgu.md src/content/blog/mezoterapi.md src/content/blog/prp-eksozom.md
git commit -m "fix: kişisel GSM ve Gmail kaldırıldı, randevu çağrıları iletişim formuna yönlendirildi (madde 14)"
```

---

### Task 8: İletişim sayfası — 4 kanal ve form

**Files:**
- Create: `src/lib/contact.ts`, `tests/contact.test.ts`
- Rewrite: `src/pages/iletisim.astro`

**Interfaces:**
- Produces (`src/lib/contact.ts`):
  - `CONTACT_CHANNELS: readonly { id: ContactChannelId; label: string; description: string }[]`
  - `type ContactChannelId = 'randevu' | 'is-birligi' | 'akademik' | 'medya'`
  - `interface ContactInput { name: string; email: string; channel: string; message: string; consent: boolean }`
  - `type ContactErrors = Partial<Record<keyof ContactInput, string>>`
  - `validateContact(input: ContactInput): ContactErrors`
  - `type SubmitResult = { ok: true } | { ok: false; reason: 'not-configured' | 'failed' }`
  - `submitContact(input: ContactInput): Promise<SubmitResult>`

- [ ] **Step 1: Başarısız testi yaz**

`tests/contact.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONTACT_CHANNELS, validateContact, submitContact, type ContactInput } from '../src/lib/contact.ts';

const valid: ContactInput = {
  name: 'Ayşe Yılmaz',
  email: 'ayse@example.com',
  channel: 'medya',
  message: 'Röportaj talebimiz hakkında bilgi almak istiyoruz.',
  consent: true,
};

test('dört kanal tanımlı ve sırası sabit', () => {
  assert.deepEqual(CONTACT_CHANNELS.map((c) => c.id), ['randevu', 'is-birligi', 'akademik', 'medya']);
});

test('geçerli girdi hata üretmez', () => {
  assert.deepEqual(validateContact(valid), {});
});

test('boş form her alan için hata üretir', () => {
  const errors = validateContact({ name: '', email: '', channel: '', message: '', consent: false });
  assert.deepEqual(Object.keys(errors).sort(), ['channel', 'consent', 'email', 'message', 'name']);
});

test('yalnızca boşluktan oluşan ad geçersizdir', () => {
  assert.ok(validateContact({ ...valid, name: '   ' }).name);
});

test('geçersiz e-posta reddedilir', () => {
  assert.ok(validateContact({ ...valid, email: 'ayse@' }).email);
  assert.ok(validateContact({ ...valid, email: 'ayse example.com' }).email);
});

test('tanımsız kanal reddedilir', () => {
  assert.ok(validateContact({ ...valid, channel: 'kurs' }).channel);
});

test('10 karakterden kısa mesaj reddedilir', () => {
  assert.ok(validateContact({ ...valid, message: 'Merhaba' }).message);
});

test('onay verilmeden gönderilemez', () => {
  assert.ok(validateContact({ ...valid, consent: false }).consent);
});

test('gönderim yöntemi seçilene kadar submitContact not-configured döner', async () => {
  assert.deepEqual(await submitContact(valid), { ok: false, reason: 'not-configured' });
});
```

- [ ] **Step 2: Testin başarısız olduğunu gör**

Run: `npm test`
Expected: FAIL — `Cannot find module '…/src/lib/contact.ts'`

- [ ] **Step 3: Uygula**

`src/lib/contact.ts`:

```ts
export type ContactChannelId = 'randevu' | 'is-birligi' | 'akademik' | 'medya';

export const CONTACT_CHANNELS: readonly { id: ContactChannelId; label: string; description: string }[] = [
  { id: 'randevu', label: 'Randevu', description: 'Medikal estetik ve skin longevity değerlendirmesi için randevu talebi.' },
  { id: 'is-birligi', label: 'İş Birliği', description: 'Kurumlar, markalar ve projeler için iş birliği önerileri.' },
  { id: 'akademik', label: 'Akademik', description: 'Kongre, konuşma, eğitim ve akademik çalışma davetleri.' },
  { id: 'medya', label: 'Medya', description: 'Röportaj, basın ve yayın talepleri.' },
];

export interface ContactInput {
  name: string;
  email: string;
  channel: string;
  message: string;
  consent: boolean;
}

export type ContactErrors = Partial<Record<keyof ContactInput, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};
  if (input.name.trim().length < 2) errors.name = 'Lütfen adınızı ve soyadınızı yazın.';
  if (!EMAIL_PATTERN.test(input.email.trim())) errors.email = 'Geçerli bir e-posta adresi yazın.';
  if (!CONTACT_CHANNELS.some((c) => c.id === input.channel)) errors.channel = 'Lütfen bir konu seçin.';
  if (input.message.trim().length < 10) errors.message = 'Mesajınız en az 10 karakter olmalı.';
  if (!input.consent) errors.consent = 'Devam etmek için aydınlatma metnini onaylayın.';
  return errors;
}

export type SubmitResult = { ok: true } | { ok: false; reason: 'not-configured' | 'failed' };

/**
 * Formu iletir. Gönderim yöntemi henüz seçilmedi (spec, karar D1).
 * Yöntem seçildiğinde yalnızca bu fonksiyon değişir; form ve doğrulama aynı kalır.
 */
export async function submitContact(_input: ContactInput): Promise<SubmitResult> {
  return { ok: false, reason: 'not-configured' };
}
```

- [ ] **Step 4: Testin geçtiğini gör**

Run: `npm test`
Expected: 12 test PASS (posts 3 + contact 9).

- [ ] **Step 5: İletişim sayfasını yeniden yaz**

`src/pages/iletisim.astro` dosyasının tamamı:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { CONTACT_CHANNELS } from '../lib/contact';
---
<BaseLayout title="İletişim — Dr. Muhammed İkbal Bakırcı" description="Randevu, iş birliği, akademik davetler ve medya talepleri için Dr. Muhammed İkbal Bakırcı ile iletişime geçin.">
  <section class="ct-hero">
    <div class="container">
      <h1>İletişim</h1>
      <p>Talebinizin konusunu seçin; mesajınız ilgili kanala iletilir.</p>
    </div>
  </section>

  <section class="container ct-channels" aria-label="İletişim kanalları">
    {CONTACT_CHANNELS.map((c) => (
      <article class="ct-channel" id={c.id}>
        <h2>{c.label}</h2>
        <p>{c.description}</p>
        <a href="#iletisim-formu" data-pick-channel={c.id}>Bu konuda yazın &rarr;</a>
      </article>
    ))}
  </section>

  <section class="container ct-form-wrap" id="iletisim-formu" aria-labelledby="ct-form-title">
    <form class="ct-form" id="contactForm" novalidate>
      <h2 id="ct-form-title">Mesaj gönderin</h2>

      <div class="ct-field">
        <label for="ct-name">Ad Soyad</label>
        <input id="ct-name" name="name" type="text" autocomplete="name" required aria-describedby="ct-name-error" />
        <p class="ct-error" id="ct-name-error" data-error-for="name" hidden></p>
      </div>

      <div class="ct-field">
        <label for="ct-email">E-posta</label>
        <input id="ct-email" name="email" type="email" autocomplete="email" required aria-describedby="ct-email-error" />
        <p class="ct-error" id="ct-email-error" data-error-for="email" hidden></p>
      </div>

      <div class="ct-field">
        <label for="ct-channel">Konu</label>
        <select id="ct-channel" name="channel" required aria-describedby="ct-channel-error">
          <option value="">Konu seçin</option>
          {CONTACT_CHANNELS.map((c) => <option value={c.id}>{c.label}</option>)}
        </select>
        <p class="ct-error" id="ct-channel-error" data-error-for="channel" hidden></p>
      </div>

      <div class="ct-field">
        <label for="ct-message">Mesajınız</label>
        <textarea id="ct-message" name="message" rows="6" required aria-describedby="ct-message-error"></textarea>
        <p class="ct-error" id="ct-message-error" data-error-for="message" hidden></p>
      </div>

      <div class="ct-field ct-field--check">
        <input id="ct-consent" name="consent" type="checkbox" required aria-describedby="ct-consent-error" />
        <label for="ct-consent">Kişisel verilerimin, talebimin yanıtlanması amacıyla <a href="/gizlilik-politikasi">Gizlilik Politikası</a> kapsamında işlenmesini kabul ediyorum.</label>
        <p class="ct-error" id="ct-consent-error" data-error-for="consent" hidden></p>
      </div>

      <button type="submit" class="btn btn-dark ct-submit">Gönder</button>
      <p class="ct-status" data-form-status role="status" hidden></p>
    </form>
  </section>
</BaseLayout>

<script>
  import { CONTACT_CHANNELS, validateContact, submitContact, type ContactInput } from '../lib/contact';

  function initContactForm() {
    const form = document.querySelector<HTMLFormElement>('#contactForm');
    if (!form || form.dataset.ready === 'true') return;
    form.dataset.ready = 'true';

    const channelSelect = form.elements.namedItem('channel') as HTMLSelectElement;
    const status = form.querySelector<HTMLElement>('[data-form-status]')!;
    const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;

    // /iletisim#randevu gibi bağlantılarla gelindiğinde konuyu önceden seç.
    const hashChannel = location.hash.slice(1);
    if (CONTACT_CHANNELS.some((c) => c.id === hashChannel)) channelSelect.value = hashChannel;

    document.querySelectorAll<HTMLAnchorElement>('[data-pick-channel]').forEach((link) => {
      link.addEventListener('click', () => {
        channelSelect.value = link.dataset.pickChannel ?? '';
      });
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const input: ContactInput = {
        name: String(data.get('name') ?? ''),
        email: String(data.get('email') ?? ''),
        channel: String(data.get('channel') ?? ''),
        message: String(data.get('message') ?? ''),
        consent: data.get('consent') === 'on',
      };

      const errors = validateContact(input);
      form.querySelectorAll<HTMLElement>('[data-error-for]').forEach((el) => {
        const message = errors[el.dataset.errorFor as keyof ContactInput];
        el.textContent = message ?? '';
        el.hidden = !message;
      });
      const firstInvalid = Object.keys(errors)[0];
      if (firstInvalid) {
        (form.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
        return;
      }

      submitButton.disabled = true;
      const result = await submitContact(input);
      submitButton.disabled = false;
      status.hidden = false;
      if (result.ok) {
        status.dataset.state = 'success';
        status.textContent = 'Mesajınız iletildi. En kısa sürede dönüş yapılacaktır.';
        form.reset();
      } else {
        status.dataset.state = 'error';
        status.textContent = 'Mesajınız şu anda gönderilemedi. Lütfen daha sonra tekrar deneyin.';
      }
    });
  }

  document.addEventListener('astro:page-load', initContactForm);
</script>

<style>
  .ct-hero { background: var(--main); color: #fff; padding: 72px 0; }
  .ct-hero h1 { font-size: clamp(32px, 5vw, 52px); font-weight: 900; margin-bottom: 10px; }
  .ct-hero p { font-size: 18px; color: #c3cbd2; }

  .ct-channels { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding-top: 48px; }
  .ct-channel { background: var(--base); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 24px; scroll-margin-top: 140px; }
  .ct-channel:target { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(87, 120, 197, .15); }
  .ct-channel h2 { font-size: 19px; font-weight: 800; margin-bottom: 8px; }
  .ct-channel p { font-size: 14px; line-height: 1.6; color: var(--gray-500); margin-bottom: 14px; }
  .ct-channel a { font-size: 14px; font-weight: 700; color: var(--blue); }

  .ct-form-wrap { padding: 40px 24px 88px; scroll-margin-top: 120px; }
  .ct-form { max-width: 640px; margin: 0 auto; background: var(--base); border-radius: var(--r-lg); padding: 40px; box-shadow: var(--shadow-md); }
  .ct-form h2 { font-size: 24px; font-weight: 800; margin-bottom: 24px; }
  .ct-field { margin-bottom: 20px; }
  .ct-field label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 6px; color: var(--gray-700); }
  .ct-field input:not([type='checkbox']), .ct-field select, .ct-field textarea {
    width: 100%; padding: 12px 16px; border: 1.5px solid var(--border); border-radius: var(--r);
    font: 15px var(--font); color: var(--main); background: var(--base);
  }
  .ct-field input:focus, .ct-field select:focus, .ct-field textarea:focus { outline: none; border-color: var(--main); }
  .ct-field textarea { resize: vertical; }
  .ct-field--check { display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: start; }
  .ct-field--check input { margin-top: 4px; width: 18px; height: 18px; }
  .ct-field--check label { font-weight: 400; font-size: 14px; line-height: 1.5; margin: 0; }
  .ct-field--check label a { text-decoration: underline; }
  .ct-field--check .ct-error { grid-column: 1 / -1; }
  .ct-error { margin-top: 6px; font-size: 13px; color: var(--red); }
  .ct-submit { width: 100%; }
  .ct-submit:disabled { opacity: .6; cursor: wait; }
  .ct-status { margin-top: 16px; padding: 12px 16px; border-radius: var(--r); font-size: 14px; }
  .ct-status[data-state='success'] { background: #ecf7ee; color: #1d6b2a; }
  .ct-status[data-state='error'] { background: #fdeeee; color: #9b1c1c; }

  @media (max-width: 900px) { .ct-channels { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 600px) {
    .ct-channels { grid-template-columns: 1fr; }
    .ct-form { padding: 28px 20px; }
  }
</style>
```

- [ ] **Step 6: Denetimi çalıştır**

Run: `npm run verify`
Expected: "kişisel GSM", "kişisel Gmail", "iletişim: 4 kanal çapası", "iletişim: KVKK onay kutusu" PASS.

- [ ] **Step 7: Tarayıcıda kontrol**

- `/iletisim` boş gönder → 5 alanın altında hata metni, odak "Ad Soyad"da.
- Geçerli doldur → durum kutusu: "Mesajınız şu anda gönderilemedi…" (D1 bekliyor, beklenen davranış).
- `/medikal-estetik` → "Randevu Talebi Gönder" → `/iletisim#randevu`: Randevu kartı vurgulu, Konu = Randevu.
- "Medya" kartında "Bu konuda yazın" → forma kayar, Konu = Medya.

- [ ] **Step 8: Commit**

```bash
git add src/lib/contact.ts tests/contact.test.ts src/pages/iletisim.astro
git commit -m "feat: iletişim sayfası 4 kanal ve doğrulamalı form ile yeniden yazıldı (madde 13)"
```

---

### Task 9: Son doğrulama ve GitHub'a gönderim

**Files:** —

- [ ] **Step 1: Tüm testler ve denetimler**

Run: `npm test && npm run verify`
Expected: 12 test PASS; `15/15 denetim geçti.` Çıkış kodu 0.

- [ ] **Step 2: Tarayıcı turu**

Masaüstü ve 375px: `/`, `/hakkinda`, `/longevity`, `/medikal-estetik`, `/blog`, `/blog/omega-3-ne-ise-yarar`, `/iletisim`, `/gecmis-yillar`. Her sayfada: yeni menü, yeni footer, konsol hatası yok, yatay kaydırma yok.

- [ ] **Step 3: Kaldırılan adresler**

`npm run preview` → `http://localhost:4321/podcast` 404 döner (nginx'teki 410 yalnızca sunucuda geçerli).

- [ ] **Step 4: GitHub'a gönder**

```bash
git push origin master
```
Expected: `8f218b4..<son commit>  master -> master`. Kullanıcıya push edildiği bildirilir.

**Yayına alma bu planın dışındadır:** D1 (form gönderim yöntemi) karara bağlanınca `submitContact` uygulanır, ardından build `site-dist-<tarih>.zip` olarak hazırlanır ve nginx dosyasındaki 410 bloğu Plesk'e eklenir.
