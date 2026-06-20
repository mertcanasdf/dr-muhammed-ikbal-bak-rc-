# Astro Migration — Dr. Muhammed İkbal Bakırcı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mevcut saf HTML/CSS/JS statik siteyi Astro'ya taşımak: shared layout, component'lar, Content Collections blog sistemi ve cPanel FTP deployable `dist/` çıktısı.

**Architecture:** Tüm sayfalar `src/pages/*.astro`, blog makaleleri `src/content/blog/*.md` olarak yaşar. `BaseLayout.astro` header/footer'ı tek yerden yönetir. `npm run build` → `dist/` → FTP ile cPanel'e yüklenir.

**Tech Stack:** Astro (latest stable, static output), vanilla `.astro` components, Astro Content Collections (Zod schema), mevcut `style.css` + `script.js` korunur.

## Global Constraints

- `output: 'static'` — sunucu gerektirmez, dist/ doğrudan FTP ile yüklenir
- Tüm iç linkler mutlak path kullanır: `href="/hakkinda"` (eski: `href="pages/hakkinda.html"`)
- `style.css` ve `script.js` içeriği değiştirilmez (script.js'deki path prefix mantığı Task 6'da güncellenir)
- Türkçe karakter içeren dosya/klasör adları olduğu gibi korunur
- `assets/images/` path'leri `/assets/images/` (mutlak) olarak güncellenir

---

### Task 1: Astro Projesi Başlatma

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`

**Interfaces:**
- Produces: çalışan `npm run dev` ve `npm run build` komutları

- [ ] **Step 1: Astro'yu kur**

Proje kök dizininde çalıştır:
```bash
npm create astro@latest . -- --template minimal --no-install --no-git
```
Sorular sorulursa: template → minimal, TypeScript → strict, git → No.

- [ ] **Step 2: Bağımlılıkları yükle**

```bash
npm install
```

- [ ] **Step 3: `astro.config.mjs` içeriğini düzenle**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://drmuhammedicbalbakırci.com',
  trailingSlash: 'never',
});
```

- [ ] **Step 4: `tsconfig.json` kontrol et**

`create astro` tarafından üretilmiş olmalı. Şu içeriği doğrula:
```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 5: Dev server'ın başladığını doğrula**

```bash
npm run dev
```
Beklenen çıktı: `astro  v5.x.x  ready in ...ms` + `Local: http://localhost:4321/`

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json
git commit -m "feat: astro project scaffold"
```

---

### Task 2: Statik Dosyaları public/ Klasörüne Taşı

**Files:**
- Move: `style.css` → `public/style.css`
- Move: `script.js` → `public/script.js`
- Move: `assets/` → `public/assets/`

**Interfaces:**
- Produces: `public/style.css`, `public/script.js`, `public/assets/images/` (BaseLayout'un referans edeceği)

- [ ] **Step 1: `public/` klasörünü oluştur ve dosyaları taşı**

```bash
mkdir -p public/assets
cp style.css public/style.css
cp script.js public/script.js
cp -r assets/images public/assets/images
```

*(Windows'ta PowerShell ile:)*
```powershell
New-Item -ItemType Directory -Force public/assets
Copy-Item style.css public/style.css
Copy-Item script.js public/script.js
Copy-Item -Recurse assets/images public/assets/images
```

- [ ] **Step 2: Dosyaların kopyalandığını doğrula**

```bash
ls public/
# Beklenen: style.css  script.js  assets/
ls public/assets/images/generated/
# Beklenen: topics/  doctor-portrait.png  health-app.png vb.
```

- [ ] **Step 3: Commit**

```bash
git add public/
git commit -m "feat: move static assets to public/"
```

---

### Task 3: BaseLayout.astro ve Component'lar

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/AnnouncementBar.astro`
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Create: `src/components/PromoModal.astro`

**Interfaces:**
- Consumes: `public/style.css`, `public/script.js`
- Produces: `BaseLayout.astro` — `title: string` prop'u alır, `<slot />` ile sayfa içeriğini render eder

- [ ] **Step 1: `src/layouts/` ve `src/components/` klasörlerini oluştur**

```bash
mkdir -p src/layouts src/components src/pages
```

- [ ] **Step 2: `AnnouncementBar.astro` oluştur**

```astro
---
// src/components/AnnouncementBar.astro
---
<div class="announcement-bar" id="announcementBar">
  <div class="container announcement-bar__inner">
    <p>#1 sağlık engelinizi 2 dakikada keşfedin &rarr; <a href="/quizler">Hemen Başla</a></p>
    <button class="announcement-bar__close" id="closeAnnouncement" aria-label="Kapat">&#10005;</button>
  </div>
</div>
```

- [ ] **Step 3: `Header.astro` oluştur**

Header'ı `index.html` satır 24–121 arasından al, tüm iç link'leri mutlak path'e çevir:

```astro
---
// src/components/Header.astro
---
<div class="header-wrapper" id="headerWrapper">

  <div class="utility-nav">
    <div class="container utility-nav__inner">
      <nav aria-label="Yardımcı navigasyon">
        <a href="/sitelerimiz">Sitelerimiz</a>
        <a href="/hakkinda">Hakkında</a>
        <a href="/iletisim">İletişim</a>
      </nav>
    </div>
  </div>

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
          <span class="site-logo__role">Tıp Doktoru</span>
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
        <a href="/quizler" class="btn-header-cta">Quizi Çöz</a>
        <button class="hamburger" id="hamburger" aria-label="Menüyü aç" aria-expanded="false" aria-controls="mainMenu">
          <span></span><span></span><span></span>
        </button>
      </div>

    </div>
  </header>

  <nav class="main-menu" id="mainMenu" aria-label="Ana navigasyon">
    <div class="container">
      <ul class="main-menu__list">
        <li class="has-megamenu">
          <a href="/blog" class="menu-trigger">İçerik Kütüphanesi
            <svg class="dropdown-icon" width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
          <div class="megamenu">
            <div class="megamenu__container">
              <div class="megamenu__column">
                <h4 class="megamenu__title">Popüler Konular</h4>
                <ul class="megamenu__links">
                  <li><a href="/#kutuphane">Sağlık Sorunları</a></li>
                  <li><a href="/#kutuphane">Beslenme</a></li>
                  <li><a href="/#kutuphane">Sağlıklı Yaşam</a></li>
                  <li><a href="/#kutuphane">Diyetler</a></li>
                  <li><a href="/blog">Keto</a></li>
                  <li><a href="/dunyada-saglik">Dünyada Sağlık</a></li>
                  <li><a href="/basari-hikayeleri">Başarı Hikayeleri</a></li>
                  <li><a href="/blog" class="megamenu__special-link">Tüm makaleleri gör &rarr;</a></li>
                </ul>
              </div>
              <div class="megamenu__column">
                <h4 class="megamenu__title">Referanslar</h4>
                <ul class="megamenu__links">
                  <li><a href="/quizler">Sağlık Testleri ve Hesaplayıcılar</a></li>
                  <li><a href="/rehberler">Rehberler ve Kaynaklar</a></li>
                  <li><a href="/kurslar">Mini Kurslar</a></li>
                  <li><a href="/kurslar">Kurslar</a></li>
                </ul>
              </div>
              <div class="megamenu__column">
                <h4 class="megamenu__title">Özel Projeler</h4>
                <ul class="megamenu__links">
                  <li><a href="/#barkod">Ultra-İşlenmiş Gıda Girişimi</a></li>
                  <li><a href="/longevity">Sağlıklı Yaşam ve Hücresel Sağlık</a></li>
                </ul>
              </div>
            </div>
          </div>
        </li>
        <li><a href="/dunyada-saglik">Dünyada Sağlık</a></li>
        <li><a href="/longevity">Longevity</a></li>
        <li><a href="/medikal-estetik">Medikal Estetik &amp; Güzellik</a></li>
        <li><a href="/rehberler">Rehberler</a></li>
        <li><a href="/quizler">Quizler <span class="new-badge">Yeni</span></a></li>
        <li><a href="/basari-hikayeleri">Başarı Hikayeleri</a></li>
      </ul>
    </div>
  </nav>

</div>
```

- [ ] **Step 4: `Footer.astro` oluştur**

Footer'ı `index.html` satır 814–899 arasından al, tüm linkler mutlak path'e çevrilmiş olarak:

```astro
---
// src/components/Footer.astro
---
<footer class="footer">
  <div class="container">
    <div class="footer__top">
      <div class="footer__brand">
        <a href="/" class="footer__logo"><span class="footer__logo-text">Dr. Muhammed İkbal</span></a>
      </div>
      <div class="footer__col">
        <h4 class="footer__heading">Keşfet</h4>
        <ul class="footer__links">
          <li><a href="/longevity">Longevity</a></li>
          <li><a href="/#kutuphane">Keto</a></li>
          <li><a href="/dunyada-saglik">Dünyada Sağlık</a></li>
          <li><a href="/blog/aralikli-oruc-longevity">Aralıklı Oruç</a></li>
          <li><a href="/blog">Blog</a></li>
        </ul>
      </div>
      <div class="footer__col">
        <h4 class="footer__heading">Hakkında</h4>
        <ul class="footer__links">
          <li><a href="/hakkinda">Dr. Muhammed İkbal Hakkında</a></li>
          <li><a href="/kurslar">Kurslar</a></li>
          <li><a href="/iletisim">İletişim</a></li>
          <li><a href="/iletisim">Kariyer</a></li>
          <li><a href="/iletisim">Basın</a></li>
        </ul>
      </div>
      <div class="footer__col">
        <h4 class="footer__heading">Araçlar</h4>
        <ul class="footer__links">
          <li><a href="/sitelerimiz">Gıda Tarayıcı</a></li>
          <li><a href="/sitelerimiz">Keto Kalkulatörü</a></li>
          <li><a href="/quizler">Vücut Tipi Quizi</a></li>
          <li><a href="/quizler">Sağlık Quizleri</a></li>
        </ul>
      </div>
      <div class="footer__col">
        <h4 class="footer__heading">Takip Edin</h4>
        <div class="footer__social">
          <a href="#" class="social-icon" aria-label="YouTube">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5V8.5l6.25 3.5-6.25 3.5z"/></svg>
          </a>
          <a href="#" class="social-icon" aria-label="Facebook">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z"/></svg>
          </a>
          <a href="#" class="social-icon" aria-label="Instagram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12c0-3.2.01-3.58.07-4.85C2.38 3.85 3.9 2.31 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.7.07 7.05.01 8.33 0 8.74 0 12c0 3.26.01 3.67.07 4.95.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24c3.26 0 3.67-.01 4.95-.07 4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95 0-3.26-.01-3.67-.07-4.95-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32A6.16 6.16 0 0 0 12 5.84zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
          </a>
          <a href="#" class="social-icon" aria-label="X (Twitter)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.24 0h3.55l-7.77 8.88L23.1 24h-7.16l-5.6-7.33L4.1 24H.53l8.32-9.51L0 0h7.33l5.07 6.7L18.24 0zm-1.25 21.57h1.97L7.08 2.04H4.97l12.02 19.53z"/></svg>
          </a>
          <a href="#" class="social-icon" aria-label="LinkedIn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 0 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 .79.77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.44c.98 0 1.79-.77 1.79-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>
          </a>
          <a href="#" class="social-icon" aria-label="TikTok">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.77a8.15 8.15 0 0 0 4.77 1.52V6.84a4.85 4.85 0 0 1-1-.15z"/></svg>
          </a>
        </div>
      </div>
    </div>

    <div class="footer__disclaimer">
      <p>* Bu ifadeler Gıda ve İlaç İdaresi tarafından değerlendirilmemiştir. Bu ürün herhangi bir hastalığı teşhis etmek, tedavi etmek, iyileştirmek veya önlemek amacıyla tasarlanmamıştır.</p>
    </div>

    <div class="footer__apps">
      <a href="/sitelerimiz" class="footer-app-link">
        <img src="/assets/images/generated/health-app.png" alt="App Store'dan İndir" class="footer-app-img" />
      </a>
      <a href="/sitelerimiz" class="footer-app-link">
        <img src="/assets/images/generated/health-app.png" alt="Google Play'den İndir" class="footer-app-img" />
      </a>
    </div>

    <div class="footer__address">
      <p>Fevzi Çakmak Caddesi Kırcaali Mahallesi No:76 Osmangazi, 16220 Bursa &bull; +90 850 333 0344</p>
    </div>

    <div class="footer__bottom">
      <nav class="footer__legal" aria-label="Yasal bağlantılar">
        <a href="/gizlilik-politikasi">Gizlilik Politikası</a>
        <a href="/kullanim-kosullari">Kullanım Koşulları</a>
        <a href="/iletisim">İletişim</a>
        <a href="/gizlilik-politikasi">Erişilebilirlik</a>
      </nav>
      <p class="footer__copy">&copy; 2026 Dr. Muhammed İkbal Bakırcı. Tüm hakları saklıdır.</p>
    </div>
  </div>
</footer>
```

- [ ] **Step 5: `PromoModal.astro` oluştur**

`index.html` satır 901–937 arasındaki promo modal HTML'ini kopyala (`<div class="promo-modal"...>` bloğu):

```astro
---
// src/components/PromoModal.astro
---
<!-- index.html satır 901–937 arasındaki promo-modal div'ini buraya yapıştır, link değişikliği gerekmez -->
```

- [ ] **Step 6: `BaseLayout.astro` oluştur**

```astro
---
// src/layouts/BaseLayout.astro
import AnnouncementBar from '../components/AnnouncementBar.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import PromoModal from '../components/PromoModal.astro';

interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Dr. Muhammed İkbal Bakırcı — Longevity & Sağlık Eğitimi' } = Astro.props;
---
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content={description} />
  <title>{title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1/dist/css/splide.min.css" />
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <AnnouncementBar />
  <Header />
  <main>
    <slot />
  </main>
  <Footer />
  <PromoModal />
  <script src="/script.js" defer></script>
</body>
</html>
```

**Not:** `/script.js` mutlak path kullandığı için Astro bunu harici URL olarak tanır ve bundle etmeden `<script>` tag'ını olduğu gibi çıktıya yazar. `defer` eklendi — `script.js` zaten `DOMContentLoaded` listener kullandığından bu güvenlidir.

- [ ] **Step 7: Build alarak component'ların çalıştığını doğrula**

Önce boş bir `src/pages/index.astro` oluştur:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Test">
  <p>Test</p>
</BaseLayout>
```

Sonra:
```bash
npm run build
```
Beklenen: `dist/index.html` oluşur, hata yok.

- [ ] **Step 8: Commit**

```bash
git add src/
git commit -m "feat: BaseLayout and shared components"
```

---

### Task 4: Ana Sayfa (index.astro) Göçü

**Files:**
- Create: `src/pages/index.astro`

**Interfaces:**
- Consumes: `BaseLayout.astro`
- Produces: `dist/index.html`

- [ ] **Step 1: `index.html`'deki `<main>` içeriğini al**

`index.html` içinde `<main>` ile `</main>` arasındaki tüm içeriği kopyala (satır 123–813 arası).

- [ ] **Step 2: `src/pages/index.astro` oluştur**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Dr. Muhammed İkbal Bakırcı — Longevity &amp; Sağlık Eğitimi">
  <!-- index.html satır 123–813 arası buraya gelir -->
  <!-- Link güncellemeleri aşağıdaki kurallara göre yapılır: -->
</BaseLayout>
```

- [ ] **Step 3: index.astro içindeki linkleri güncelle**

Şu find-and-replace işlemlerini yap (tüm `.astro` dosyaları için ortak kurallar):

| Eski | Yeni |
|------|------|
| `href="pages/hakkinda.html"` | `href="/hakkinda"` |
| `href="pages/iletisim.html"` | `href="/iletisim"` |
| `href="pages/longevity.html"` | `href="/longevity"` |
| `href="pages/medikal-estetik.html"` | `href="/medikal-estetik"` |
| `href="pages/quizler.html"` | `href="/quizler"` |
| `href="pages/rehberler.html"` | `href="/rehberler"` |
| `href="pages/kurslar.html"` | `href="/kurslar"` |
| `href="pages/basari-hikayeleri.html"` | `href="/basari-hikayeleri"` |
| `href="pages/dunyada-saglik.html"` | `href="/dunyada-saglik"` |
| `href="pages/sitelerimiz.html"` | `href="/sitelerimiz"` |
| `href="pages/gizlilik-politikasi.html"` | `href="/gizlilik-politikasi"` |
| `href="pages/kullanim-kosullari.html"` | `href="/kullanim-kosullari"` |
| `href="pages/podcast.html"` | `href="/podcast"` |
| `href="pages/soylesiler.html"` | `href="/soylesiler"` |
| `href="blog/index.html"` | `href="/blog"` |
| `href="blog/aralikli-oruc-longevity.html"` | `href="/blog/aralikli-oruc-longevity"` |
| `href="blog/otofaji-nedir.html"` | `href="/blog/otofaji-nedir"` |
| `href="blog/mavi-bolge-diyeti.html"` | `href="/blog/mavi-bolge-diyeti"` |
| `href="blog/d3-vitamini-eksikligi.html"` | `href="/blog/d3-vitamini-eksikligi"` |
| `href="blog/nmn-nad-yaslanma.html"` | `href="/blog/nmn-nad-yaslanma"` |
| `href="blog/kortizol-yaslanma.html"` | `href="/blog/kortizol-yaslanma"` |
| `href="blog/telomerleri-korumak.html"` | `href="/blog/telomerleri-korumak"` |
| `href="blog/bolge-2-kardiyo.html"` | `href="/blog/bolge-2-kardiyo"` |
| `href="blog/senolitik-tedaviler-cilt-genclesmesi-zombi-hucreler.html"` | `href="/blog/senolitik-tedaviler-cilt-genclesmesi-zombi-hucreler"` |
| `href="blog/sirt6-proteini-epigenetik-genclesme.html"` | `href="/blog/sirt6-proteini-epigenetik-genclesme"` |
| `href="index.html"` | `href="/"` |
| `src="assets/images/` | `src="/assets/images/` |

- [ ] **Step 4: Değişikliği doğrula**

```bash
npm run dev
```
`http://localhost:4321/` adresini tarayıcıda aç. Sayfa görünmeli, header + footer + hero çalışıyor olmalı.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: migrate homepage to Astro"
```

---

### Task 5: Statik Sayfaları Göç Et

**Files:**
- Create: `src/pages/hakkinda.astro`
- Create: `src/pages/iletisim.astro`
- Create: `src/pages/longevity.astro`
- Create: `src/pages/medikal-estetik.astro`
- Create: `src/pages/podcast.astro`
- Create: `src/pages/soylesiler.astro`
- Create: `src/pages/kurslar.astro`
- Create: `src/pages/rehberler.astro`
- Create: `src/pages/quizler.astro`
- Create: `src/pages/basari-hikayeleri.astro`
- Create: `src/pages/dunyada-saglik.astro`
- Create: `src/pages/sitelerimiz.astro`
- Create: `src/pages/gizlilik-politikasi.astro`
- Create: `src/pages/kullanim-kosullari.astro`

**Interfaces:**
- Consumes: `BaseLayout.astro`
- Produces: `dist/<page-name>/index.html` her sayfa için

**Pattern (her sayfa için tekrarla):**

Her HTML dosyası için şu adımlar:
1. `pages/<ad>.html` dosyasını aç
2. `<title>` içeriğini not al
3. `<main>` ve `</main>` arasındaki tüm içeriği kopyala
4. `src/pages/<ad>.astro` dosyası oluştur
5. Task 4 Step 3'teki link kurallarını uygula — ek olarak `../` prefix'li linkler için:
   - `href="../pages/hakkinda.html"` → `href="/hakkinda"` (önce `../pages/` kaldır)
   - `href="../blog/aralikli-oruc.html"` → `href="/blog/aralikli-oruc"` (önce `../blog/` kaldır)
   - `href="../index.html"` → `href="/"`
   - `src="../assets/images/` → `src="/assets/images/`

- [ ] **Step 1: hakkinda.astro oluştur**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Hakkında — Dr. Muhammed İkbal Bakırcı">
  <!-- pages/hakkinda.html <main>...</main> içeriği -->
</BaseLayout>
```

- [ ] **Step 2: iletisim.astro oluştur** *(aynı pattern)*

- [ ] **Step 3: longevity.astro oluştur** *(aynı pattern)*

- [ ] **Step 4: medikal-estetik.astro oluştur** *(aynı pattern)*

- [ ] **Step 5: podcast.astro oluştur** *(aynı pattern)*

- [ ] **Step 6: soylesiler.astro oluştur** *(aynı pattern)*

- [ ] **Step 7: kurslar.astro oluştur** *(aynı pattern)*

- [ ] **Step 8: rehberler.astro oluştur** *(aynı pattern)*

- [ ] **Step 9: quizler.astro oluştur** *(aynı pattern)*

- [ ] **Step 10: basari-hikayeleri.astro oluştur** *(aynı pattern)*

- [ ] **Step 11: dunyada-saglik.astro oluştur** *(aynı pattern)*

- [ ] **Step 12: sitelerimiz.astro oluştur** *(aynı pattern)*

- [ ] **Step 13: gizlilik-politikasi.astro oluştur** *(aynı pattern)*

- [ ] **Step 14: kullanim-kosullari.astro oluştur** *(aynı pattern)*

- [ ] **Step 15: Build ile tüm sayfaları doğrula**

```bash
npm run build
```
Beklenen: `dist/` altında `hakkinda/index.html`, `iletisim/index.html` vb. oluşur. Hata yoktur.

```bash
npm run dev
```
Birkaç sayfayı tarayıcıda aç ve görsel doğrula.

- [ ] **Step 16: Commit**

```bash
git add src/pages/
git commit -m "feat: migrate 14 static pages to Astro"
```

---

### Task 6: script.js Path Prefix'ini Güncelle

**Files:**
- Modify: `public/script.js:1-50`

**Interfaces:**
- Consumes: yeni URL yapısı — `/dunyada-saglik`, `/blog/otofaji-nedir` (`.html` yok, `pages/` yok)
- Produces: çalışan nav dropdown'ları tüm Astro sayfalarında

- [ ] **Step 1: `public/script.js` satır 5'i güncelle**

Eski:
```js
const p = (location.pathname.includes('/blog/') || location.pathname.includes('/pages/')) ? '../' : '';
```

Yeni (satırı tamamen kaldır — `p` değişkeni artık kullanılmayacak):
```js
// p değişkeni kaldırıldı — tüm href'ler mutlak path kullanıyor
```

- [ ] **Step 2: Tüm `p +` kullanımlarını mutlak path ile değiştir**

`public/script.js` içinde `p +` içeren tüm satırları şu şekilde güncelle:

```js
// ESKI → YENİ
p + 'pages/dunyada-saglik.html'    → '/dunyada-saglik'
p + 'pages/longevity.html'         → '/longevity'
p + 'pages/rehberler.html'         → '/rehberler'
p + 'pages/quizler.html'           → '/quizler'
p + 'blog/otofaji-nedir.html'      → '/blog/otofaji-nedir'
p + 'blog/aralikli-oruc-longevity.html' → '/blog/aralikli-oruc-longevity'
p + 'blog/bolge-2-kardiyo.html'    → '/blog/bolge-2-kardiyo'
p + 'blog/kortizol-yaslanma.html'  → '/blog/kortizol-yaslanma'
p + 'blog/telomerleri-korumak.html' → '/blog/telomerleri-korumak'
```

- [ ] **Step 3: Dev server'da dropdown'ları test et**

```bash
npm run dev
```
Ana sayfada nav'daki "Longevity", "Rehberler", "Quizler" linklerine tıkla. Dropdown'lar açılıyor ve linkler çalışıyor olmalı.

- [ ] **Step 4: Commit**

```bash
git add public/script.js
git commit -m "fix: update nav dropdown hrefs to absolute paths"
```

---

### Task 7: Content Collections Şeması

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/blog/` (klasör)

**Interfaces:**
- Produces: `blog` collection — `title`, `date`, `description`, `category`, `image`, `readTime`, `takeaways?`, `relatedArticles?` alanları

- [ ] **Step 1: `src/content/config.ts` oluştur**

```ts
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    category: z.string(),
    image: z.string(),
    readTime: z.string(),
    takeaways: z.array(z.string()).optional(),
    relatedArticles: z.array(z.object({
      slug: z.string(),
      category: z.string(),
      title: z.string(),
      image: z.string(),
    })).optional(),
  }),
});

export const collections = { blog };
```

- [ ] **Step 2: `src/content/blog/` klasörünü oluştur**

```bash
mkdir -p src/content/blog
```

- [ ] **Step 3: Build ile şemayı doğrula (henüz içerik yokken)**

```bash
npm run build
```
Beklenen: Hata yok (boş koleksiyon kabul edilir).

- [ ] **Step 4: Commit**

```bash
git add src/content/config.ts src/content/blog/
git commit -m "feat: Content Collections schema for blog"
```

---

### Task 8: Blog Makalelerini Markdown'a Dönüştür

**Files:**
- Create: `src/content/blog/aralikli-oruc-longevity.md`
- Create: `src/content/blog/otofaji-nedir.md`
- Create: `src/content/blog/mavi-bolge-diyeti.md`
- Create: `src/content/blog/nmn-nad-yaslanma.md`
- Create: `src/content/blog/d3-vitamini-eksikligi.md`
- Create: `src/content/blog/kortizol-yaslanma.md`
- Create: `src/content/blog/bolge-2-kardiyo.md`
- Create: `src/content/blog/telomerleri-korumak.md`
- Create: `src/content/blog/senolitik-tedaviler-cilt-genclesmesi-zombi-hucreler.md`
- Create: `src/content/blog/sirt6-proteini-epigenetik-genclesme.md`

**Pattern:** Her blog HTML dosyası için:
1. `<h1>` → `title:` frontmatter
2. Tarih ve okuma süresi → `date:` ve `readTime:` frontmatter
3. `.article-hero__cat` span → `category:` frontmatter
4. `article-body__featured-img` src → `image:` frontmatter
5. Artikel içeriği (`<article class="article-body">` içindeki HTML, featured-img ve takeaways/author-bio hariç) → Markdown body
6. `.takeaways ul li` içerikleri → `takeaways:` frontmatter array
7. `.sidebar-related-card` linkleri → `relatedArticles:` frontmatter array

**HTML → Markdown dönüşüm kuralları:**
- `<h2 id="...">Başlık</h2>` → `## Başlık {#...}` (anchor id korunur)
- `<h3>Başlık</h3>` → `### Başlık`
- `<p>...</p>` → paragraf (tag'lar kaldırılır)
- `<strong>...</strong>` → `**...**`
- `<em>...</em>` → `*...*`
- `<ul><li>...</li></ul>` → `- ...`

- [ ] **Step 1: `aralikli-oruc-longevity.md` oluştur**

```markdown
---
title: "Aralıklı Orucun Longevity Üzerindeki Etkisi"
date: 2026-05-08
description: "Aralıklı oruç neden sadece kilo verme değil, hücresel sağlık ve uzun yaşam için güçlü bir protokoldür."
category: "Beslenme"
image: "/assets/images/generated/topics/aralikli-oruc.png"
readTime: "9 dk"
takeaways:
  - "Aralıklı oruç, insülin duyarlılığını artırır, iltihabı azaltır ve büyüme hormonu sekresyonunu yükseltir."
  - "mTOR baskılanması ve AMPK aktivasyonu, longevity bağlantısının temel mekanizmalarıdır."
  - "Sirtuinler aracılığıyla DNA onarımı, mitokondriyal sağlık ve stres direnci güçlenir."
  - "16:8 protokolü başlangıç için ideal; metabolik hedefe göre 18:6 veya OMAD değerlendirilebilir."
  - "Oruç penceresindeki gıda kalitesi, protokol seçimi kadar önemlidir."
relatedArticles:
  - slug: "otofaji-nedir"
    category: "Otofaji"
    title: "Otofaji Nedir ve Nasıl Aktive Edilir?"
    image: "/assets/images/generated/topics/otofaji.png"
  - slug: "mavi-bolge-diyeti"
    category: "Longevity"
    title: "Mavi Bölge Diyeti: Dünyanın En Uzun Yaşayanlarının Sırrı"
    image: "/assets/images/generated/topics/mavi-bolge.png"
---

Modern beslenme dünyasında hiçbir yaklaşım, aralıklı oruç kadar hem geniş kitlelere ulaşmayı hem de bilimsel zemine oturmuş olmayı başaramamıştır.

## Metabolik Etkileri {#metabolik-etki}

Yemek yemediğiniz süre uzadıkça vücudunuzda kritik bir geçiş yaşanır. İlk 4-8 saatte insülin seviyeleri düşer ve karaciğer glikojen depoları azalmaya başlar. 12-14. saate gelindiğinde vücut, yağ asitlerini enerjiye dönüştürmeye başlar; bu süreçte **keton cisimcikleri** üretilir.

- **İnsülin duyarlılığı artar:** Pankreas beta hücreleri "dinlenir" ve insülin sinyali güçlenir.
- **İltihap belirteçleri düşer:** CRP, IL-6 ve TNF-α seviyeleri belirgin şekilde azalır.
- **Büyüme hormonu yükselir:** 16-24 saatlik oruç, büyüme hormonu sekresyonunu %300-500 artırabilir.
- **Noradrenalin artar:** Metabolik hız geçici olarak yükselir, yağ mobilizasyonu güçlenir.

## Longevity Bağlantısı {#longevity-baglantisi}

### mTOR Baskılanması

mTOR (mechanistic target of rapamycin), hücre büyümesini ve protein sentezini yöneten kritik bir sinyal proteinidir. Oruç dönemlerinde mTOR baskılanır; bu durum hücreleri bakım, tamir ve temizlik moduna alır.

### AMPK Aktivasyonu

Açlık sırasında hücresel enerji sensörü AMPK aktive olur. AMPK, mitokondriyal biyogenezi uyarır, yağ oksidasyonunu artırır ve DNA onarım mekanizmalarını güçlendirir.

### Sirtuinlerin Aktivasyonu

Aralıklı oruç, "longevity genleri" olarak bilinen sirtuin ailesini (SIRT1-7) uyarır. Sirtuinler, DNA onarımı, inflamasyon kontrolü ve mitokondriyal sağlığı yönetir.

## Hangi Protokol Size Uygun? {#protokoller}

- **16:8 Protokolü:** 16 saat oruç, 8 saatlik yemek penceresi. Başlangıç için en erişilebilir yaklaşım.
- **18:6 Protokolü:** Daha uzun oruç süresi ile güçlendirilmiş otofaji ve daha belirgin metabolik faydalar.
- **OMAD (Günde Tek Öğün):** 23 saat oruç. Yüksek insülin direnci veya metabolik hastalığı olan kişiler için güçlü bir araç.
- **5:2 Protokolü:** Haftada 5 gün normal beslenme, 2 gün 500-600 kalori.

## Dikkat Edilmesi Gerekenler {#dikkat-edilecekler}

Aralıklı oruç, doğru uygulandığında güçlü bir araçtır; ancak hamilelik, emzirme, aktif yeme bozukluğu geçmişi, tip 1 diyabet ve bazı ilaç kullanımları doktor gözetimi gerektiren durumlar arasındadır.
```

- [ ] **Step 2: Kalan 9 makaleyi aynı pattern ile oluştur**

Her HTML dosyası için (`blog/otofaji-nedir.html`, `blog/mavi-bolge-diyeti.html`, vb.):
- HTML'i aç → frontmatter bilgilerini çıkar → Markdown body dönüştür
- Dosyayı `src/content/blog/<slug>.md` olarak kaydet
- Frontmatter `image` değerindeki `../assets/` → `/assets/` değiştir

- [ ] **Step 3: Build ile Zod validation'ı doğrula**

```bash
npm run build
```
Beklenen: 10 blog makalesi parse edilir, hata yoktur. Eksik/yanlış frontmatter alanı varsa Astro build hatası verir — frontmatter'ı düzelt.

- [ ] **Step 4: Commit**

```bash
git add src/content/blog/
git commit -m "feat: convert 10 blog articles to Markdown"
```

---

### Task 9: Blog Sayfaları (index + [slug])

**Files:**
- Create: `src/pages/blog/index.astro`
- Create: `src/pages/blog/[slug].astro`

**Interfaces:**
- Consumes: `getCollection('blog')` → `post.data` (title, date, category, image, readTime, description) + `post.id`
- Produces: `dist/blog/index.html`, `dist/blog/<slug>/index.html`

- [ ] **Step 1: `src/pages/blog/` klasörünü oluştur**

```bash
mkdir -p src/pages/blog
```

- [ ] **Step 2: `src/pages/blog/index.astro` oluştur**

`blog/index.html` <main> içeriğini al, statik `<article class="blog-card">` bloklarını Content Collections ile üret:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

const posts = (await getCollection('blog')).sort(
  (a, b) => b.data.date.getTime() - a.data.date.getTime()
);

function formatDate(date: Date): string {
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

const slug = (id: string) => id.replace(/\.mdx?$/, '');
---
<BaseLayout title="Blog — Dr. Muhammed İkbal Bakırcı">
  <section class="blog-hero">
    <div class="container">
      <h1 class="blog-hero__title">İçerik Kütüphanesi</h1>
      <p class="blog-hero__sub">Longevity, beslenme, hücre sağlığı ve daha fazlası — bilimsel temelli, Türkçe içerikler.</p>
      <div class="blog-filters" id="blogFilters">
        <button class="filter-btn active" data-filter="all">Tümü</button>
        <button class="filter-btn" data-filter="Otofaji">Otofaji</button>
        <button class="filter-btn" data-filter="Beslenme">Beslenme</button>
        <button class="filter-btn" data-filter="Hücre Sağlığı">Hücre Sağlığı</button>
        <button class="filter-btn" data-filter="Longevity">Longevity</button>
        <button class="filter-btn" data-filter="Vitaminler">Vitaminler</button>
        <button class="filter-btn" data-filter="Stres">Stres</button>
        <button class="filter-btn" data-filter="Egzersiz">Egzersiz</button>
      </div>
    </div>
  </section>

  <section class="section" style="padding-top: 0;">
    <div class="container">
      <div class="blog-grid" id="blogGrid">
        {posts.map(post => (
          <article class="blog-card" data-cat={post.data.category}>
            <a href={`/blog/${slug(post.id)}`}>
              <img src={post.data.image} alt={post.data.title} class="blog-card__img" />
            </a>
            <div class="blog-card__body">
              <span class="blog-card__cat">{post.data.category}</span>
              <h2 class="blog-card__title">
                <a href={`/blog/${slug(post.id)}`}>{post.data.title}</a>
              </h2>
              <p class="blog-card__excerpt">{post.data.description}</p>
              <div class="blog-card__meta">
                <span>{formatDate(post.data.date)}</span>
                <span>{post.data.readTime} okuma</span>
              </div>
              <a href={`/blog/${slug(post.id)}`} class="blog-card__read-more">Devamını oku &rarr;</a>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 3: `src/pages/blog/[slug].astro` oluştur**

```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.id.replace(/\.mdx?$/, '') },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content, headings } = await render(post);
const { title, date, category, image, readTime, takeaways, relatedArticles } = post.data;

function formatDate(d: Date): string {
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}
---
<BaseLayout title={`${title} — Dr. Muhammed İkbal Bakırcı`}>
  <section class="article-hero">
    <div class="container">
      <div class="article-hero__inner">
        <span class="article-hero__cat">{category}</span>
        <h1 class="article-hero__title">{title}</h1>
        <div class="article-hero__meta">
          <span>Dr. Muhammed İkbal Bakırcı</span>
          <span>{formatDate(date)}</span>
          <span>{readTime} okuma</span>
        </div>
      </div>
    </div>
  </section>

  <div class="container">
    <div class="article-layout">

      <article class="article-body">
        <img src={image} alt={title} class="article-body__featured-img" />

        <Content />

        {takeaways && takeaways.length > 0 && (
          <div class="takeaways">
            <p class="takeaways__title">&#10003; Kilit Çıkarımlar</p>
            <ul>
              {takeaways.map(t => <li>{t}</li>)}
            </ul>
          </div>
        )}

        <div class="author-bio">
          <img
            src="/assets/images/generated/doctor-portrait.png"
            alt="Dr. Muhammed İkbal Bakırcı"
            class="author-bio__avatar"
          />
          <div>
            <p class="author-bio__name">Dr. Muhammed İkbal Bakırcı</p>
            <p class="author-bio__title">Tıp Doktoru</p>
            <p class="author-bio__desc">
              Hücresel sağlık, aralıklı oruç ve longevity alanlarında 15 yılı aşkın klinik deneyime
              sahip olan Dr. Muhammed İkbal, Bursa'da çokça hastanın metabolik dönüşümüne eşlik etmiştir.
            </p>
          </div>
        </div>
      </article>

      <aside class="article-sidebar">
        {headings.filter(h => h.depth <= 2).length > 0 && (
          <div class="sidebar-card sidebar-toc">
            <p class="sidebar-card__title">İçindekiler</p>
            {headings.filter(h => h.depth <= 2).map(h => (
              <a href={`#${h.slug}`}>{h.text}</a>
            ))}
          </div>
        )}

        {relatedArticles && relatedArticles.length > 0 && (
          <div class="sidebar-card">
            <p class="sidebar-card__title">İlgili Makaleler</p>
            {relatedArticles.map(r => (
              <a href={`/blog/${r.slug}`} class="sidebar-related-card">
                <img src={r.image} alt="İlgili yazı görseli" class="sidebar-related-card__img" />
                <div>
                  <p class="sidebar-related-card__cat">{r.category}</p>
                  <span class="sidebar-related-card__title">{r.title}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </aside>

    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 4: Blog route'larını doğrula**

```bash
npm run build
```
Beklenen: `dist/blog/index.html` ve `dist/blog/aralikli-oruc-longevity/index.html` vb. oluşur.

```bash
npm run dev
```
`http://localhost:4321/blog` → listing sayfası görünür.
`http://localhost:4321/blog/aralikli-oruc-longevity` → makale sayfası görünür, TOC ve takeaways çalışır.

- [ ] **Step 5: Commit**

```bash
git add src/pages/blog/
git commit -m "feat: blog listing and dynamic article route"
```

---

### Task 10: Son Build Doğrulaması ve Temizlik

**Files:**
- Delete: `index.html` (kök)
- Delete: `style.css` (kök, artık `public/style.css` var)
- Delete: `script.js` (kök, artık `public/script.js` var)
- Delete: `pages/` klasörü (tüm HTML'ler)
- Delete: `blog/` klasörü (tüm HTML'ler)
- Delete: `assets/` klasörü (artık `public/assets/` var)

**Interfaces:**
- Produces: temiz `dist/` çıktısı — FTP ile cPanel'e yüklenecek

- [ ] **Step 1: Final build al**

```bash
npm run build
```
Beklenen: sıfır hata, `dist/` klasörü oluşur.

`dist/` içeriğini kontrol et:
```
dist/
  index.html
  blog/
    index.html
    aralikli-oruc-longevity/index.html
    ... (10 makale)
  hakkinda/index.html
  iletisim/index.html
  longevity/index.html
  ... (14 sayfa)
  style.css
  script.js
  assets/images/...
```

- [ ] **Step 2: Preview server ile tüm sayfaları test et**

```bash
npm run preview
```
`http://localhost:4321` adresinde şunları doğrula:
- Ana sayfa yükleniyor, hero görünüyor
- Nav dropdown'ları açılıyor
- `/hakkinda`, `/iletisim`, `/blog` sayfaları yükleniyor
- `/blog/aralikli-oruc-longevity` — makale, TOC, takeaways görünüyor
- Footer linkleri çalışıyor
- Announcement bar kapatılabiliyor

- [ ] **Step 3: Eski HTML dosyalarını sil**

```powershell
Remove-Item index.html
Remove-Item style.css
Remove-Item script.js
Remove-Item -Recurse pages/
Remove-Item -Recurse blog/
Remove-Item -Recurse assets/
```

- [ ] **Step 4: Son build'i tekrar doğrula**

```bash
npm run build && npm run preview
```
Beklenen: hata yok, site tamamen çalışıyor.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: remove legacy HTML files after Astro migration"
```

---

## Deploy (cPanel FTP)

`npm run build` tamamlandıktan sonra `dist/` klasörünün **tüm içeriğini** (klasörün kendisini değil, içindeki dosyaları) FTP ile cPanel `public_html/` dizinine yükle.

Her yeni deploy için: `npm run build` → `dist/` içeriğini FTP ile üzerine yaz.
