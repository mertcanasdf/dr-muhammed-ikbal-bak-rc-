# drberg.com Homepage Clone — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** drberg.com ana sayfasının birebir görsel klonunu saf HTML, CSS ve JavaScript ile oluşturmak.

**Architecture:** Tek `index.html` dosyası tüm bölümleri içerir; `style.css` CSS custom properties ile tasarım tokenlerini yönetir; `script.js` sticky header, hamburger menü ve carousel davranışlarını sağlar. Görseller Picsum CDN ile, içerikler placeholder metinlerle doldurulur.

**Tech Stack:** HTML5, CSS3 (Custom Properties, Grid, Flexbox), Vanilla JavaScript (ES6), Google Fonts (Inter), Picsum Photos CDN

---

## Dosya Haritası

| Dosya | Sorumluluk |
|-------|-----------|
| `index.html` | Tüm section HTML yapısı |
| `style.css` | Design tokens, reset, tüm section stilleri |
| `script.js` | Sticky header, hamburger menu, carousel |

---

### Task 1: Proje Kurulumu — Dosyalar + Design Tokens

**Files:**
- Create: `index.html`
- Create: `style.css`
- Create: `script.js`

- [ ] **Step 1: `index.html` iskeletini oluştur**

```html
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dr. Berg — Health & Wellness</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>

  <!-- İçerik buraya gelecek -->

  <script src="script.js"></script>
</body>
</html>
```

- [ ] **Step 2: `style.css` — CSS reset ve design tokens**

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --color-primary: #2D7D46;
  --color-primary-dark: #235f35;
  --color-bg: #ffffff;
  --color-bg-soft: #F9FAFB;
  --color-text: #1A1A1A;
  --color-muted: #6B7280;
  --color-border: #E5E7EB;
  --font-base: 'Inter', system-ui, sans-serif;
  --radius: 8px;
  --radius-lg: 16px;
  --shadow: 0 2px 8px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.12);
  --container: 1200px;
  --gap: 24px;
}

body {
  font-family: var(--font-base);
  color: var(--color-text);
  background: var(--color-bg);
  line-height: 1.6;
}

img {
  display: block;
  max-width: 100%;
}

a {
  color: inherit;
  text-decoration: none;
}

ul {
  list-style: none;
}

.container {
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 24px;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  border: none;
  transition: background 0.2s, transform 0.1s;
}

.btn:active { transform: scale(0.98); }

.btn-primary {
  background: var(--color-primary);
  color: #fff;
}

.btn-primary:hover { background: var(--color-primary-dark); }

.btn-outline {
  background: transparent;
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
}

.btn-outline:hover {
  background: var(--color-primary);
  color: #fff;
}

.section-title {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 8px;
}

.section-link {
  font-size: 14px;
  color: var(--color-primary);
  font-weight: 600;
}

.section-link:hover { text-decoration: underline; }
```

- [ ] **Step 3: `script.js` — boş dosya oluştur**

```js
// drberg.com clone — interactions
document.addEventListener('DOMContentLoaded', () => {
  // sticky header, hamburger, carousel burada gelecek
});
```

- [ ] **Step 4: Tarayıcıda aç ve kontrol et**

`index.html` dosyasını tarayıcıda aç. Beyaz boş sayfa görünmeli; konsolda hata olmamalı.

- [ ] **Step 5: Commit**

```bash
git init
git add index.html style.css script.js
git commit -m "feat: proje iskelet ve design tokens"
```

---

### Task 2: Sticky Navbar

**Files:**
- Modify: `index.html` — `<header>` ekle
- Modify: `style.css` — navbar stilleri
- Modify: `script.js` — sticky gölge + hamburger

- [ ] **Step 1: `index.html` içine `<header>` ekle**

`<!-- İçerik buraya gelecek -->` satırının yerine:

```html
<!-- NAVBAR -->
<header class="navbar" id="navbar">
  <div class="container navbar__inner">
    <a href="#" class="navbar__logo">Dr. Berg</a>

    <nav class="navbar__nav" id="navMenu">
      <ul class="navbar__links">
        <li><a href="#">Content Library</a></li>
        <li><a href="#">Recipes</a></li>
        <li><a href="#">Keto</a></li>
        <li><a href="#">Guides</a></li>
        <li><a href="#">Quizzes</a></li>
        <li><a href="#">Shop</a></li>
      </ul>
    </nav>

    <div class="navbar__actions">
      <button class="btn btn-outline" style="padding:8px 18px;font-size:14px;">Sign In</button>
      <button class="navbar__search" aria-label="Search">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </button>
      <button class="navbar__burger" id="burger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>

<!-- MAIN CONTENT -->
<main>
</main>

<!-- FOOTER placeholder -->
<footer></footer>
```

- [ ] **Step 2: `style.css` — navbar stilleri ekle**

```css
/* ── NAVBAR ── */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid var(--color-border);
  transition: box-shadow 0.3s;
}

.navbar.scrolled { box-shadow: var(--shadow-md); }

.navbar__inner {
  display: flex;
  align-items: center;
  gap: 32px;
  height: 68px;
}

.navbar__logo {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-primary);
  white-space: nowrap;
  flex-shrink: 0;
}

.navbar__nav { flex: 1; }

.navbar__links {
  display: flex;
  gap: 28px;
  align-items: center;
}

.navbar__links a {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  transition: color 0.2s;
}

.navbar__links a:hover { color: var(--color-primary); }

.navbar__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.navbar__search {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--color-muted);
  display: flex;
  align-items: center;
}

.navbar__search:hover { color: var(--color-text); }

.navbar__burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.navbar__burger span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--color-text);
  border-radius: 2px;
  transition: transform 0.3s, opacity 0.3s;
}

/* Hamburger OPEN state */
.navbar__burger.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
.navbar__burger.open span:nth-child(2) { opacity: 0; }
.navbar__burger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

@media (max-width: 768px) {
  .navbar__burger { display: flex; }
  .navbar__nav {
    position: absolute;
    top: 68px;
    left: 0;
    right: 0;
    background: #fff;
    border-bottom: 1px solid var(--color-border);
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }
  .navbar__nav.open { max-height: 320px; }
  .navbar__links {
    flex-direction: column;
    padding: 16px 24px;
    gap: 16px;
    align-items: flex-start;
  }
}
```

- [ ] **Step 3: `script.js` — sticky gölge + hamburger**

```js
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  const burger = document.getElementById('burger');
  const navMenu = document.getElementById('navMenu');

  // Sticky gölge
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  });

  // Hamburger menü
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navMenu.classList.toggle('open');
  });
});
```

- [ ] **Step 4: Tarayıcıda doğrula**

- Desktop: logo + 6 link + Sign In butonu + arama ikonu görünmeli
- Pencereyi 768px altına daralt: hamburger ikonu görünmeli, tıklayınca menü açılmalı
- Sayfayı scroll edince header'da gölge belirmeli

- [ ] **Step 5: Commit**

```bash
git add index.html style.css script.js
git commit -m "feat: sticky navbar ve hamburger menu"
```

---

### Task 3: Hero Banner

**Files:**
- Modify: `index.html` — `<main>` içine hero section
- Modify: `style.css` — hero stilleri

- [ ] **Step 1: `<main>` içine hero HTML ekle**

```html
<!-- HERO -->
<section class="hero">
  <div class="container hero__inner">
    <div class="hero__text">
      <span class="hero__badge">FREE DOWNLOAD</span>
      <h1 class="hero__title">Dr. Berg's Daily Reboot Protocol Checklist</h1>
      <p class="hero__sub">Discover the exact morning and evening habits that support energy, focus, and metabolic health — distilled into one simple checklist.</p>
      <a href="#" class="btn btn-primary hero__cta">Get Your FREE Copy Now!</a>
    </div>
    <div class="hero__image">
      <img src="https://picsum.photos/seed/drberg-hero/560/420" alt="Dr. Berg checklist" />
    </div>
  </div>
</section>
```

- [ ] **Step 2: `style.css` — hero stilleri ekle**

```css
/* ── HERO ── */
.hero {
  background: linear-gradient(135deg, #f0faf4 0%, #e8f5ed 100%);
  padding: 64px 0;
}

.hero__inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
}

.hero__badge {
  display: inline-block;
  background: var(--color-primary);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 4px 12px;
  border-radius: 999px;
  margin-bottom: 16px;
}

.hero__title {
  font-size: 40px;
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 16px;
  color: var(--color-text);
}

.hero__sub {
  font-size: 17px;
  color: var(--color-muted);
  margin-bottom: 32px;
  line-height: 1.7;
}

.hero__cta { font-size: 16px; padding: 14px 32px; }

.hero__image img {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  width: 100%;
  height: auto;
  object-fit: cover;
}

@media (max-width: 768px) {
  .hero__inner { grid-template-columns: 1fr; }
  .hero__title { font-size: 28px; }
  .hero__image { order: -1; }
}
```

- [ ] **Step 3: Tarayıcıda doğrula**

- Yeşil gradient arka plan, iki kolonlu layout görünmeli
- Görselin sağda, metnin solda olduğu kontrol edilmeli
- Mobilde tek kolon olmalı (pencereyi daralt)

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "feat: hero banner section"
```

---

### Task 4: Makale Grid (Helpful Reads)

**Files:**
- Modify: `index.html` — hero section'ın altına
- Modify: `style.css` — article card stilleri

- [ ] **Step 1: `index.html` — articles section ekle**

Hero `</section>` etiketinin hemen altına:

```html
<!-- ARTICLES -->
<section class="articles section-pad">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">Helpful Reads</h2>
      <a href="#" class="section-link">View all articles (739) →</a>
    </div>
    <div class="articles__grid">

      <article class="article-card">
        <img src="https://picsum.photos/seed/art1/400/240" alt="article" class="article-card__img" />
        <div class="article-card__body">
          <span class="article-card__tag">Fasting</span>
          <h3 class="article-card__title">The Benefits of Intermittent Fasting for Metabolic Health</h3>
          <p class="article-card__date">May 12, 2026</p>
        </div>
      </article>

      <article class="article-card">
        <img src="https://picsum.photos/seed/art2/400/240" alt="article" class="article-card__img" />
        <div class="article-card__body">
          <span class="article-card__tag">Nutrition</span>
          <h3 class="article-card__title">Top 10 Nutrient-Dense Foods You Should Eat Every Week</h3>
          <p class="article-card__date">May 10, 2026</p>
        </div>
      </article>

      <article class="article-card">
        <img src="https://picsum.photos/seed/art3/400/240" alt="article" class="article-card__img" />
        <div class="article-card__body">
          <span class="article-card__tag">Keto</span>
          <h3 class="article-card__title">How to Start Keto Without Feeling Overwhelmed</h3>
          <p class="article-card__date">May 8, 2026</p>
        </div>
      </article>

      <article class="article-card">
        <img src="https://picsum.photos/seed/art4/400/240" alt="article" class="article-card__img" />
        <div class="article-card__body">
          <span class="article-card__tag">Digestion</span>
          <h3 class="article-card__title">Why Your Gut Health Affects Everything From Mood to Immunity</h3>
          <p class="article-card__date">May 6, 2026</p>
        </div>
      </article>

      <article class="article-card">
        <img src="https://picsum.photos/seed/art5/400/240" alt="article" class="article-card__img" />
        <div class="article-card__body">
          <span class="article-card__tag">Sleep</span>
          <h3 class="article-card__title">The Science Behind Deep Sleep and Hormone Recovery</h3>
          <p class="article-card__date">May 4, 2026</p>
        </div>
      </article>

      <article class="article-card">
        <img src="https://picsum.photos/seed/art6/400/240" alt="article" class="article-card__img" />
        <div class="article-card__body">
          <span class="article-card__tag">Vitamins</span>
          <h3 class="article-card__title">Vitamin D Deficiency: Hidden Signs You Might Be Missing</h3>
          <p class="article-card__date">May 2, 2026</p>
        </div>
      </article>

      <article class="article-card">
        <img src="https://picsum.photos/seed/art7/400/240" alt="article" class="article-card__img" />
        <div class="article-card__body">
          <span class="article-card__tag">Exercise</span>
          <h3 class="article-card__title">High-Intensity Interval Training vs. Steady Cardio: Which Wins?</h3>
          <p class="article-card__date">Apr 30, 2026</p>
        </div>
      </article>

      <article class="article-card">
        <img src="https://picsum.photos/seed/art8/400/240" alt="article" class="article-card__img" />
        <div class="article-card__body">
          <span class="article-card__tag">Stress</span>
          <h3 class="article-card__title">How Chronic Stress Depletes Your Key Nutrients</h3>
          <p class="article-card__date">Apr 28, 2026</p>
        </div>
      </article>

    </div>
    <div style="text-align:center; margin-top:32px;">
      <a href="#" class="btn btn-outline">View all articles</a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: `style.css` — article section stilleri ekle**

```css
/* ── SHARED ── */
.section-pad { padding: 64px 0; }

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

/* ── ARTICLES ── */
.articles { background: var(--color-bg); }

.articles__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gap);
}

.article-card {
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
  background: #fff;
}

.article-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.article-card__img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.article-card__body { padding: 16px; }

.article-card__tag {
  display: inline-block;
  background: #e8f5ed;
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.article-card__title {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 10px;
  color: var(--color-text);
}

.article-card__date {
  font-size: 12px;
  color: var(--color-muted);
}

@media (max-width: 1024px) {
  .articles__grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .articles__grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: Tarayıcıda doğrula**

- 8 kart 4 sütunlu grid içinde görünmeli
- Her kart: görsel (üstte), etiket (yeşil badge), başlık, tarih
- Hover'da kart hafifçe yükselmeli ve gölge belirmeli

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "feat: makaleler grid section"
```

---

### Task 5: Topics Explorer (Etiket Bulutu)

**Files:**
- Modify: `index.html` — articles section'ın altına
- Modify: `style.css`

- [ ] **Step 1: `index.html` — topics section ekle**

Articles `</section>` altına:

```html
<!-- TOPICS -->
<section class="topics section-pad" style="background: var(--color-bg-soft);">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">Explore Topics</h2>
      <a href="#" class="section-link">View all topics →</a>
    </div>
    <div class="topics__cloud">
      <a href="#" class="topic-tag">Aging</a>
      <a href="#" class="topic-tag">Autoimmunity</a>
      <a href="#" class="topic-tag">Blood Sugar</a>
      <a href="#" class="topic-tag">Brain Health</a>
      <a href="#" class="topic-tag">Cholesterol</a>
      <a href="#" class="topic-tag">Diabetes</a>
      <a href="#" class="topic-tag">Digestion</a>
      <a href="#" class="topic-tag">Energy</a>
      <a href="#" class="topic-tag">Eye Health</a>
      <a href="#" class="topic-tag">Fasting</a>
      <a href="#" class="topic-tag">Fatigue</a>
      <a href="#" class="topic-tag">Heart Health</a>
      <a href="#" class="topic-tag">Hormones</a>
      <a href="#" class="topic-tag">Immune System</a>
      <a href="#" class="topic-tag">Inflammation</a>
      <a href="#" class="topic-tag">Insulin</a>
      <a href="#" class="topic-tag">Joints</a>
      <a href="#" class="topic-tag">Keto</a>
      <a href="#" class="topic-tag">Liver</a>
      <a href="#" class="topic-tag">Magnesium</a>
      <a href="#" class="topic-tag">Menopause</a>
      <a href="#" class="topic-tag">Metabolism</a>
      <a href="#" class="topic-tag">Minerals</a>
      <a href="#" class="topic-tag">Nutrition</a>
      <a href="#" class="topic-tag">Obesity</a>
      <a href="#" class="topic-tag">Recipes</a>
      <a href="#" class="topic-tag">Sleep</a>
      <a href="#" class="topic-tag">Skin</a>
      <a href="#" class="topic-tag">Stress</a>
      <a href="#" class="topic-tag">Thyroid</a>
      <a href="#" class="topic-tag">Vitamins</a>
      <a href="#" class="topic-tag">Weight Loss</a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: `style.css` — topic tag stilleri ekle**

```css
/* ── TOPICS ── */
.topics__cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.topic-tag {
  display: inline-block;
  padding: 8px 18px;
  border-radius: 999px;
  border: 1.5px solid var(--color-border);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  background: #fff;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.topic-tag:hover {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
```

- [ ] **Step 3: Tarayıcıda doğrula**

- 32 etiket flex wrap ile dizili görünmeli
- Hover'da etiket yeşil arka plan, beyaz metin almalı

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "feat: topics explorer tag cloud"
```

---

### Task 6: 4'lü Feature Blokları

**Files:**
- Modify: `index.html` — topics section'ın altına
- Modify: `style.css`

- [ ] **Step 1: `index.html` — features section ekle**

Topics `</section>` altına:

```html
<!-- FEATURES -->
<section class="features section-pad">
  <div class="container">
    <div class="features__grid">

      <div class="feature-card">
        <img src="https://picsum.photos/seed/feat1/480/280" alt="Courses" class="feature-card__img" />
        <div class="feature-card__body">
          <h3 class="feature-card__title">Online Courses</h3>
          <p class="feature-card__desc">Deep-dive programs covering keto, fasting, digestion, and more — at your own pace.</p>
          <a href="#" class="btn btn-outline" style="margin-top:16px;font-size:14px;padding:10px 20px;">Explore Courses</a>
        </div>
      </div>

      <div class="feature-card">
        <img src="https://picsum.photos/seed/feat2/480/280" alt="YouTube" class="feature-card__img" />
        <div class="feature-card__body">
          <h3 class="feature-card__title">YouTube Videos</h3>
          <p class="feature-card__desc">Over 5,000 free videos covering every aspect of health, nutrition, and wellness.</p>
          <a href="#" class="btn btn-outline" style="margin-top:16px;font-size:14px;padding:10px 20px;">Watch Now</a>
        </div>
      </div>

      <div class="feature-card">
        <img src="https://picsum.photos/seed/feat3/480/280" alt="Supplements" class="feature-card__img" />
        <div class="feature-card__body">
          <h3 class="feature-card__title">Supplements Shop</h3>
          <p class="feature-card__desc">Science-backed supplements formulated to support your keto and health journey.</p>
          <a href="#" class="btn btn-outline" style="margin-top:16px;font-size:14px;padding:10px 20px;">Shop Now</a>
        </div>
      </div>

      <div class="feature-card">
        <img src="https://picsum.photos/seed/feat4/480/280" alt="App" class="feature-card__img" />
        <div class="feature-card__body">
          <h3 class="feature-card__title">Junk Food Meter App</h3>
          <p class="feature-card__desc">Scan barcodes, get instant junk food scores, and make smarter choices on the go.</p>
          <a href="#" class="btn btn-outline" style="margin-top:16px;font-size:14px;padding:10px 20px;">Get the App</a>
        </div>
      </div>

    </div>
  </div>
</section>
```

- [ ] **Step 2: `style.css` — feature card stilleri ekle**

```css
/* ── FEATURES ── */
.features__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gap);
}

.feature-card {
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: #fff;
  transition: box-shadow 0.2s, transform 0.2s;
}

.feature-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
}

.feature-card__img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.feature-card__body { padding: 20px; }

.feature-card__title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.feature-card__desc {
  font-size: 14px;
  color: var(--color-muted);
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .features__grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .features__grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: Tarayıcıda doğrula**

- 4 kart yan yana, eşit genişlikte görünmeli
- Hover'da kart yükselmeli ve gölge belirmeli
- 1024px altında 2×2 grid'e geçmeli

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "feat: 4 feature blocks section"
```

---

### Task 7: Başarı Hikayeleri

**Files:**
- Modify: `index.html`
- Modify: `style.css`

- [ ] **Step 1: `index.html` — success section ekle**

Features `</section>` altına:

```html
<!-- SUCCESS STORIES -->
<section class="success section-pad" style="background: var(--color-bg-soft);">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">Success stories that inspire</h2>
      <a href="#" class="section-link">View all stories (161) →</a>
    </div>
    <div class="success__grid">

      <div class="success-card">
        <div class="success-card__avatar">
          <img src="https://picsum.photos/seed/person1/80/80" alt="Sarah M." />
        </div>
        <div class="success-card__stat">–34 lbs</div>
        <p class="success-card__quote">"Following Dr. Berg's keto approach completely changed how I feel. I have more energy than I did in my 30s."</p>
        <p class="success-card__name">Sarah M., 48</p>
      </div>

      <div class="success-card">
        <div class="success-card__avatar">
          <img src="https://picsum.photos/seed/person2/80/80" alt="James R." />
        </div>
        <div class="success-card__stat">Blood Sugar Normalized</div>
        <p class="success-card__quote">"My doctor was amazed. Three months of intermittent fasting and my A1C dropped significantly."</p>
        <p class="success-card__name">James R., 55</p>
      </div>

      <div class="success-card">
        <div class="success-card__avatar">
          <img src="https://picsum.photos/seed/person3/80/80" alt="Maria L." />
        </div>
        <div class="success-card__stat">–22 lbs in 8 weeks</div>
        <p class="success-card__quote">"I finally understand what to eat and why. The content is science-backed and so easy to follow."</p>
        <p class="success-card__name">Maria L., 41</p>
      </div>

    </div>
  </div>
</section>
```

- [ ] **Step 2: `style.css` — success card stilleri ekle**

```css
/* ── SUCCESS STORIES ── */
.success__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--gap);
}

.success-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 28px;
  border: 1px solid var(--color-border);
  text-align: center;
  transition: box-shadow 0.2s;
}

.success-card:hover { box-shadow: var(--shadow-md); }

.success-card__avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 16px;
  border: 3px solid var(--color-primary);
}

.success-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.success-card__stat {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-primary);
  margin-bottom: 12px;
}

.success-card__quote {
  font-size: 14px;
  color: var(--color-muted);
  line-height: 1.7;
  font-style: italic;
  margin-bottom: 16px;
}

.success-card__name {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
}

@media (max-width: 768px) {
  .success__grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: Tarayıcıda doğrula**

- 3 kart yan yana, yuvarlak avatar, yeşil istatistik görünmeli

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "feat: success stories section"
```

---

### Task 8: İnteraktif Araçlar

**Files:**
- Modify: `index.html`
- Modify: `style.css`

- [ ] **Step 1: `index.html` — tools section ekle**

Success `</section>` altına:

```html
<!-- INTERACTIVE TOOLS -->
<section class="tools section-pad">
  <div class="container">
    <h2 class="section-title" style="text-align:center; margin-bottom:32px;">Helpful Tools</h2>
    <div class="tools__grid">

      <div class="tool-card tool-card--green">
        <div class="tool-card__text">
          <span class="tool-card__label">CALCULATOR</span>
          <h3 class="tool-card__title">Smash your keto goals with our #1 macro calculator</h3>
          <p class="tool-card__desc">Enter your details and get a personalized daily keto macro breakdown in seconds.</p>
          <a href="#" class="btn btn-primary" style="margin-top:20px;">Start Calculator</a>
        </div>
        <div class="tool-card__image">
          <img src="https://picsum.photos/seed/calc/320/280" alt="Keto Calculator" />
        </div>
      </div>

      <div class="tool-card tool-card--dark">
        <div class="tool-card__text">
          <span class="tool-card__label">QUIZ</span>
          <h3 class="tool-card__title">Discover your body type in just 2 minutes</h3>
          <p class="tool-card__desc">Take our free quiz and get a custom health plan tailored to your unique body type.</p>
          <a href="#" class="btn" style="margin-top:20px;background:#fff;color:var(--color-text);">Take the Quiz</a>
        </div>
        <div class="tool-card__image">
          <img src="https://picsum.photos/seed/quiz/320/280" alt="Body Type Quiz" />
        </div>
      </div>

    </div>
  </div>
</section>
```

- [ ] **Step 2: `style.css` — tools stilleri ekle**

```css
/* ── TOOLS ── */
.tools__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--gap);
}

.tool-card {
  border-radius: var(--radius-lg);
  padding: 40px;
  display: flex;
  align-items: center;
  gap: 32px;
  overflow: hidden;
  position: relative;
}

.tool-card--green {
  background: linear-gradient(135deg, #e8f5ed, #c8ebd5);
}

.tool-card--dark {
  background: linear-gradient(135deg, #1a2e22, #2d4d38);
  color: #fff;
}

.tool-card__text { flex: 1; }

.tool-card__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: var(--color-primary);
  display: block;
  margin-bottom: 12px;
}

.tool-card--dark .tool-card__label { color: #7dd4a0; }

.tool-card__title {
  font-size: 22px;
  font-weight: 800;
  line-height: 1.25;
  margin-bottom: 12px;
}

.tool-card__desc {
  font-size: 14px;
  opacity: 0.75;
  line-height: 1.6;
}

.tool-card__image { flex-shrink: 0; width: 200px; }

.tool-card__image img {
  border-radius: var(--radius);
  width: 100%;
  height: auto;
  object-fit: cover;
}

@media (max-width: 768px) {
  .tools__grid { grid-template-columns: 1fr; }
  .tool-card { flex-direction: column; }
  .tool-card__image { width: 100%; }
}
```

- [ ] **Step 3: Tarayıcıda doğrula**

- 2 yan yana renkli kart görünmeli: biri yeşil açık, biri koyu
- Mobilde üst üste gelmeli

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "feat: interactive tools section"
```

---

### Task 9: Ürün Carousel

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Modify: `script.js` — carousel logic

- [ ] **Step 1: `index.html` — products section ekle**

Tools `</section>` altına:

```html
<!-- PRODUCTS -->
<section class="products section-pad" style="background: var(--color-bg-soft);">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">Shop Bestsellers</h2>
      <div class="carousel-controls">
        <button class="carousel-btn" id="prevBtn" aria-label="Previous">&#8592;</button>
        <button class="carousel-btn" id="nextBtn" aria-label="Next">&#8594;</button>
      </div>
    </div>
    <div class="carousel-wrapper">
      <div class="products__track" id="productsTrack">

        <div class="product-card">
          <div class="product-card__img-wrap" style="background:#f0faf4;">
            <img src="https://picsum.photos/seed/prod1/240/240" alt="D3 & K2 Vitamin" />
          </div>
          <div class="product-card__body">
            <div class="product-card__stars">★★★★★ <span>(2,847)</span></div>
            <h4 class="product-card__name">D3 & K2 Vitamin</h4>
            <p class="product-card__price">$29.99</p>
            <button class="btn btn-primary" style="width:100%;padding:10px;font-size:13px;">Add to Cart</button>
          </div>
        </div>

        <div class="product-card">
          <div class="product-card__img-wrap" style="background:#fef9e7;">
            <img src="https://picsum.photos/seed/prod2/240/240" alt="Electrolyte Powder" />
          </div>
          <div class="product-card__body">
            <div class="product-card__stars">★★★★★ <span>(4,102)</span></div>
            <h4 class="product-card__name">Electrolyte Powder</h4>
            <p class="product-card__price">$39.99</p>
            <button class="btn btn-primary" style="width:100%;padding:10px;font-size:13px;">Add to Cart</button>
          </div>
        </div>

        <div class="product-card">
          <div class="product-card__img-wrap" style="background:#f0f4ff;">
            <img src="https://picsum.photos/seed/prod3/240/240" alt="Magnesium Glycinate" />
          </div>
          <div class="product-card__body">
            <div class="product-card__stars">★★★★★ <span>(1,654)</span></div>
            <h4 class="product-card__name">Magnesium Glycinate</h4>
            <p class="product-card__price">$24.99</p>
            <button class="btn btn-primary" style="width:100%;padding:10px;font-size:13px;">Add to Cart</button>
          </div>
        </div>

        <div class="product-card">
          <div class="product-card__img-wrap" style="background:#fdf0f0;">
            <img src="https://picsum.photos/seed/prod4/240/240" alt="Keto Essentials" />
          </div>
          <div class="product-card__body">
            <div class="product-card__stars">★★★★☆ <span>(987)</span></div>
            <h4 class="product-card__name">Keto Essentials Bundle</h4>
            <p class="product-card__price">$64.99</p>
            <button class="btn btn-primary" style="width:100%;padding:10px;font-size:13px;">Add to Cart</button>
          </div>
        </div>

        <div class="product-card">
          <div class="product-card__img-wrap" style="background:#f5f0fe;">
            <img src="https://picsum.photos/seed/prod5/240/240" alt="Zinc & Selenium" />
          </div>
          <div class="product-card__body">
            <div class="product-card__stars">★★★★★ <span>(1,230)</span></div>
            <h4 class="product-card__name">Zinc & Selenium</h4>
            <p class="product-card__price">$19.99</p>
            <button class="btn btn-primary" style="width:100%;padding:10px;font-size:13px;">Add to Cart</button>
          </div>
        </div>

        <div class="product-card">
          <div class="product-card__img-wrap" style="background:#f0fafa;">
            <img src="https://picsum.photos/seed/prod6/240/240" alt="Omega-3 Fish Oil" />
          </div>
          <div class="product-card__body">
            <div class="product-card__stars">★★★★★ <span>(3,421)</span></div>
            <h4 class="product-card__name">Omega-3 Fish Oil</h4>
            <p class="product-card__price">$34.99</p>
            <button class="btn btn-primary" style="width:100%;padding:10px;font-size:13px;">Add to Cart</button>
          </div>
        </div>

      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: `style.css` — products + carousel stilleri ekle**

```css
/* ── PRODUCTS CAROUSEL ── */
.carousel-wrapper {
  overflow: hidden;
}

.products__track {
  display: flex;
  gap: var(--gap);
  transition: transform 0.4s ease;
}

.product-card {
  flex: 0 0 calc(25% - 18px);
  border-radius: var(--radius-lg);
  background: #fff;
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
}

.product-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.product-card__img-wrap {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.product-card__img-wrap img {
  max-height: 160px;
  width: auto;
  object-fit: contain;
}

.product-card__body { padding: 16px; }

.product-card__stars {
  font-size: 13px;
  color: #f59e0b;
  margin-bottom: 6px;
}

.product-card__stars span {
  color: var(--color-muted);
  font-size: 11px;
}

.product-card__name {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1.3;
}

.product-card__price {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-primary);
  margin-bottom: 12px;
}

.carousel-controls { display: flex; gap: 8px; }

.carousel-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  background: #fff;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, border-color 0.2s;
}

.carousel-btn:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

@media (max-width: 1024px) {
  .product-card { flex: 0 0 calc(50% - 12px); }
}

@media (max-width: 600px) {
  .product-card { flex: 0 0 calc(100%); }
}
```

- [ ] **Step 3: `script.js` — carousel logic ekle**

Mevcut dosyayı şununla değiştir:

```js
document.addEventListener('DOMContentLoaded', () => {
  // ── Sticky header ──
  const navbar = document.getElementById('navbar');
  const burger = document.getElementById('burger');
  const navMenu = document.getElementById('navMenu');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  });

  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navMenu.classList.toggle('open');
  });

  // ── Product Carousel ──
  const track = document.getElementById('productsTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (track && prevBtn && nextBtn) {
    let currentIndex = 0;

    function getVisibleCount() {
      if (window.innerWidth <= 600) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 4;
    }

    function totalCards() {
      return track.querySelectorAll('.product-card').length;
    }

    function updateCarousel() {
      const cardWidth = track.querySelector('.product-card').offsetWidth + 24; // 24 = gap
      const maxIndex = totalCards() - getVisibleCount();
      currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));
      track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex >= maxIndex;
    }

    nextBtn.addEventListener('click', () => { currentIndex++; updateCarousel(); });
    prevBtn.addEventListener('click', () => { currentIndex--; updateCarousel(); });
    window.addEventListener('resize', () => { currentIndex = 0; updateCarousel(); });

    updateCarousel();
  }
});
```

- [ ] **Step 4: Tarayıcıda doğrula**

- 4 ürün kartı yan yana görünmeli
- Sağ ok tıklandığında 5. ve 6. kart kaymaya başlamalı
- Sol ok başa döndürmeli
- İlk karta gelindiğinde sol ok disabled olmalı

- [ ] **Step 5: Commit**

```bash
git add index.html style.css script.js
git commit -m "feat: product carousel section"
```

---

### Task 10: Footer

**Files:**
- Modify: `index.html` — `<footer>` etiketini doldur
- Modify: `style.css`

- [ ] **Step 1: `index.html` — footer içeriğini ekle**

`<footer></footer>` satırını şununla değiştir:

```html
<footer class="footer">
  <div class="container">
    <div class="footer__top">

      <div class="footer__col footer__col--brand">
        <a href="#" class="footer__logo">Dr. Berg</a>
        <p class="footer__tagline">Science-backed health education for a better life.</p>
        <form class="footer__newsletter">
          <input type="email" placeholder="Your email address" class="footer__input" />
          <button type="submit" class="btn btn-primary" style="padding:11px 20px;font-size:14px;">Subscribe</button>
        </form>
      </div>

      <div class="footer__col">
        <h4 class="footer__heading">Explore</h4>
        <ul class="footer__links">
          <li><a href="#">Nutrition</a></li>
          <li><a href="#">Lifestyle</a></li>
          <li><a href="#">Diets</a></li>
          <li><a href="#">Keto</a></li>
          <li><a href="#">Recipes</a></li>
          <li><a href="#">Fasting</a></li>
        </ul>
      </div>

      <div class="footer__col">
        <h4 class="footer__heading">About</h4>
        <ul class="footer__links">
          <li><a href="#">Shop</a></li>
          <li><a href="#">Courses</a></li>
          <li><a href="#">About Dr. Berg</a></li>
          <li><a href="#">Contact</a></li>
          <li><a href="#">Careers</a></li>
          <li><a href="#">Press</a></li>
        </ul>
      </div>

      <div class="footer__col">
        <h4 class="footer__heading">Tools</h4>
        <ul class="footer__links">
          <li><a href="#">Junk Food Meter</a></li>
          <li><a href="#">Keto Calculator</a></li>
          <li><a href="#">Body Type Quiz</a></li>
          <li><a href="#">Health Quizzes</a></li>
        </ul>
      </div>

      <div class="footer__col">
        <h4 class="footer__heading">Follow</h4>
        <div class="footer__social">
          <a href="#" class="social-icon" aria-label="Facebook">f</a>
          <a href="#" class="social-icon" aria-label="Instagram">in</a>
          <a href="#" class="social-icon" aria-label="YouTube">▶</a>
          <a href="#" class="social-icon" aria-label="X">𝕏</a>
          <a href="#" class="social-icon" aria-label="Pinterest">P</a>
          <a href="#" class="social-icon" aria-label="TikTok">♪</a>
        </div>
      </div>

    </div>

    <div class="footer__bottom">
      <p class="footer__copy">© 2026 Dr. Berg Clone — Öğrenme Amaçlı</p>
      <div class="footer__legal">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Use</a>
        <a href="#">Contact</a>
      </div>
    </div>
  </div>
</footer>
```

- [ ] **Step 2: `style.css` — footer stilleri ekle**

```css
/* ── FOOTER ── */
.footer {
  background: #111827;
  color: #d1d5db;
  padding: 64px 0 0;
}

.footer__top {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 40px;
  padding-bottom: 48px;
}

.footer__logo {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  display: block;
  margin-bottom: 12px;
}

.footer__tagline {
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 20px;
  line-height: 1.6;
}

.footer__newsletter {
  display: flex;
  gap: 8px;
}

.footer__input {
  flex: 1;
  padding: 11px 14px;
  border-radius: var(--radius);
  border: 1px solid #374151;
  background: #1f2937;
  color: #fff;
  font-size: 14px;
  font-family: var(--font-base);
}

.footer__input::placeholder { color: #6b7280; }
.footer__input:focus { outline: 2px solid var(--color-primary); }

.footer__heading {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #fff;
  margin-bottom: 16px;
}

.footer__links li { margin-bottom: 10px; }
.footer__links a {
  font-size: 14px;
  color: #9ca3af;
  transition: color 0.2s;
}
.footer__links a:hover { color: #fff; }

.footer__social {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.social-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #374151;
  background: #1f2937;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #9ca3af;
  transition: background 0.2s, color 0.2s;
}

.social-icon:hover {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.footer__bottom {
  border-top: 1px solid #1f2937;
  padding: 20px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer__copy { font-size: 13px; color: #6b7280; }

.footer__legal {
  display: flex;
  gap: 20px;
}

.footer__legal a {
  font-size: 13px;
  color: #6b7280;
  transition: color 0.2s;
}

.footer__legal a:hover { color: #fff; }

@media (max-width: 1024px) {
  .footer__top { grid-template-columns: 1fr 1fr 1fr; }
  .footer__col--brand { grid-column: 1 / -1; }
}

@media (max-width: 600px) {
  .footer__top { grid-template-columns: 1fr 1fr; }
  .footer__bottom { flex-direction: column; gap: 12px; text-align: center; }
  .footer__newsletter { flex-direction: column; }
}
```

- [ ] **Step 3: Tarayıcıda doğrula**

- Koyu arka planlı 5 kolonlu footer görünmeli
- Newsletter input + subscribe butonu çalışmalı (form submit yönlendirme gerekmez)
- Sosyal ikonlar hover'da yeşile dönmeli
- Footer bottom'da copyright + legal linkler görünmeli
- Tüm sayfayı baştan sonra scroll et — tüm 9 bölüm ve footer düzgün dizilmiş olmalı

- [ ] **Step 4: Son kontrol listesi**

- [ ] Navbar sticky çalışıyor
- [ ] Hamburger mobilde açılıp kapanıyor
- [ ] Hero iki kolonlu, responsive
- [ ] Makale kartları hover efekti var
- [ ] Topic etiketleri hover'da yeşile dönüyor
- [ ] Feature kartları hover'da yükseliyor
- [ ] Başarı hikayeleri kartları düzgün
- [ ] Tool kartları renkli arka planlarla görünüyor
- [ ] Carousel ileri/geri çalışıyor
- [ ] Footer koyu, 5 kolonlu, responsive

- [ ] **Step 5: Final commit**

```bash
git add index.html style.css script.js
git commit -m "feat: footer — homepage clone tamamlandı"
```

---

## Tamamlanan Çıktı

Çalıştırma sonunda elde edilecekler:

```
index.html   (~350 satır)
style.css    (~650 satır)
script.js    (~45 satır)
```

Tarayıcıda `index.html` açıldığında drberg.com ana sayfasının tüm bölümlerini birebir yansıtan, tam responsive, interaktif bir HTML/CSS/JS sayfası görünür.
