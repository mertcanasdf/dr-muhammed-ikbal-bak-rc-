# Homepage drberg.com Hizalama — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** index.html ana sayfasını 4 alanda drberg.com ile hizalamak: hero iki sütun, makaleler grid, konular 4 sütun+yeşil hover, yıldız/kart ince ayarlar.

**Architecture:** Tüm değişiklikler `index.html` (yapı) ve `style.css` (görünüm) üzerinde. `script.js`'ten yalnızca `articlesSplide` başlatma satırları kaldırılır; diğer carousel'ler dokunulmaz. Yeni CSS kuralları ilgili bölümlerin hemen altına eklenir, mevcut token sistemi (`--green`, `--yellow`, `--shadow-md` vb.) kullanılır.

**Tech Stack:** Vanilla HTML5, CSS3 (CSS Grid, custom properties), Splide.js (podcast + ürün carousel'leri için korunur)

---

## Dosya Haritası

| Dosya | Yapılacak |
|-------|-----------|
| `index.html` | Hero HTML yeniden yapılandır; articles splide → grid; topics 4. sütun ekle |
| `style.css` | Hero iki sütun CSS; articles-grid CSS; topics 4 sütun + yeşil hover; yıldız sarı + kart hover |
| `script.js` | `articlesSplide` Splide başlatma bloğunu kaldır |

---

## Task 1: Hero — İki Sütunlu Layout (HTML)

**Files:**
- Modify: `index.html` satır 102–112 (HERO section)

- [ ] **Step 1: `index.html`'de HERO section'ı değiştir**

Mevcut kod (satır 102–112):
```html
<section class="hero">
  <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=3200&h=1295&fit=crop&q=85" alt="" class="hero__bg" />
  <div class="container hero__container">
    <div class="hero__box">
      <p class="hero__name">Dr. Bakırcı'nın</p>
      <h1 class="hero__title">Longevity Başlangıç<br>Protokolü</h1>
      <p class="hero__quote">"Doğru bilgiyle 20 yıl daha sağlıklı ve enerjik yaşayabilirsiniz."</p>
      <a href="pages/rehberler.html" class="btn btn-dark hero__cta">ÜCRETSİZ Rehberini Al!</a>
    </div>
  </div>
</section>
```

Yeni kod:
```html
<section class="hero">
  <div class="hero__left">
    <p class="hero__name">Dr. Bakırcı'nın</p>
    <h1 class="hero__title">Longevity Başlangıç<br>Protokolü</h1>
    <p class="hero__quote">"Doğru bilgiyle 20 yıl daha sağlıklı ve enerjik yaşayabilirsiniz."</p>
    <a href="pages/rehberler.html" class="btn btn-light hero__cta">ÜCRETSİZ Rehberini Al!</a>
  </div>
  <div class="hero__right" aria-hidden="true"></div>
</section>
```

- [ ] **Step 2: Tarayıcıda aç, hero'nun bozulmadığını (eski CSS kaldırılmadan önce) gör**

Dosyayı `index.html` çift tıklayarak ya da live server ile aç. Hero section görünür olmalı (CSS henüz güncellenmedi, geçici görünüm normal).

---

## Task 2: Hero — İki Sütunlu Layout (CSS)

**Files:**
- Modify: `style.css` satır 382–427 (HERO bloğu)

- [ ] **Step 1: style.css'deki eski hero CSS'i yeni iki sütun CSS ile değiştir**

Mevcut hero bloğunu (satır 382–427) şununla değiştir:
```css
/* ─── HERO ─── */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 560px;
}
.hero__left {
  background: #0C0809;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 72px 56px;
}
.hero__right {
  background-image: url('https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=900&h=1120&fit=crop&q=85');
  background-size: cover;
  background-position: center top;
  min-height: 560px;
}
.hero__name  { font-size: 18px; font-weight: 400; color: rgba(255,255,255,0.7); margin-bottom: 12px; }
.hero__title { font-size: clamp(28px, 3.2vw, 48px); font-weight: 900; line-height: 1.1; margin-bottom: 20px; color: #fff; }
.hero__quote { font-size: 16px; font-style: italic; color: rgba(255,255,255,0.75); margin-bottom: 36px; line-height: 1.6; max-width: 440px; }
.hero__cta   { font-size: 15px; padding: 14px 28px; align-self: flex-start; }

@media (max-width: 900px) {
  .hero { grid-template-columns: 1fr; min-height: auto; }
  .hero__right { display: none; }
  .hero__left { padding: 48px 28px; }
}
@media (max-width: 480px) {
  .hero__left { padding: 36px 20px; }
}
```

- [ ] **Step 2: Tarayıcıda doğrula**

Masaüstünde: sol koyu panel + sağ fotoğraf görünmeli.  
900px altında: yalnızca koyu panel, fotoğraf gizli.

- [ ] **Step 3: Commit**

```bash
git add index.html style.css
git commit -m "feat: hero — iki sütun koyu panel + fotoğraf layout"
```

---

## Task 3: Makaleler — Carousel → Grid (HTML)

**Files:**
- Modify: `index.html` satır 114–216 (ARTICLES section)

- [ ] **Step 1: Articles section'ı splide yapısından grid yapısına çevir**

Mevcut `<div class="splide" id="articlesSplide">` bloğunu (satır 121–214) şununla değiştir — ilk 4 makale korunur, geri kalan 4 silinir:

```html
<div class="articles-grid">
  <article class="article-card">
    <a href="blog/otofaji-nedir.html" class="article-card__img-link"><img src="https://picsum.photos/seed/art1lon/400/300" alt="" class="article-card__img" /></a>
    <div class="article-card__body">
      <span class="article-card__cat">Otofaji</span>
      <h3 class="article-card__title"><a href="blog/otofaji-nedir.html">Otofaji Nedir ve Nasıl Aktive Edilir?</a></h3>
      <p class="article-card__excerpt">Bir bakışta: Otofaji, hücrelerin hasarlı bileşenlerini temizleyip yenilediği doğal bir süreçtir. Aralıklı oruç ve egzersizle bu süreç güçlü biçimde tetiklenebilir&hellip;</p>
      <p class="article-card__date">15.05.2026</p>
    </div>
  </article>
  <article class="article-card">
    <a href="blog/aralikli-oruc-longevity.html" class="article-card__img-link"><img src="https://picsum.photos/seed/art2lon/400/300" alt="" class="article-card__img" /></a>
    <div class="article-card__body">
      <span class="article-card__cat">Beslenme</span>
      <h3 class="article-card__title"><a href="blog/aralikli-oruc-longevity.html">Aralıklı Orucun Longevity Üzerindeki Etkisi</a></h3>
      <p class="article-card__excerpt">Bir bakışta: Aralıklı oruç yalnızca kilo kaybetmekle kalmaz; insülin duyarlılığını artırır, iltihabı azaltır ve hücresel onarım süreçlerini güçlendirir&hellip;</p>
      <p class="article-card__date">08.05.2026</p>
    </div>
  </article>
  <article class="article-card">
    <a href="blog/telomerleri-korumak.html" class="article-card__img-link"><img src="https://picsum.photos/seed/art3lon/400/300" alt="" class="article-card__img" /></a>
    <div class="article-card__body">
      <span class="article-card__cat">Hücre Sağlığı</span>
      <h3 class="article-card__title"><a href="blog/telomerleri-korumak.html">Telomerleri Korumak için 7 Kanıtlanmış Yöntem</a></h3>
      <p class="article-card__excerpt">Bir bakışta: Telomer uzunluğu biyolojik yaşın en güvenilir göstergelerinden biridir. Beslenme, uyku ve stres yönetimi bu yapıları doğrudan etkiler&hellip;</p>
      <p class="article-card__date">24.04.2026</p>
    </div>
  </article>
  <article class="article-card">
    <a href="blog/nmn-nad-yaslanma.html" class="article-card__img-link"><img src="https://picsum.photos/seed/art4lon/400/300" alt="" class="article-card__img" /></a>
    <div class="article-card__body">
      <span class="article-card__cat">Beyin Sağlığı</span>
      <h3 class="article-card__title"><a href="blog/nmn-nad-yaslanma.html">NMN ve NAD+: Hücresel Yaşlanmayı Tersine Çevirmek</a></h3>
      <p class="article-card__excerpt">Bir bakışta: NAD+ seviyeleri yaşla birlikte düşer ve bu düşüş enerji üretimini, DNA onarımını ve bilişsel fonksiyonları olumsuz etkiler. NMN bu durumu dengeleyebilir&hellip;</p>
      <p class="article-card__date">10.04.2026</p>
    </div>
  </article>
</div>
```

---

## Task 4: Makaleler — Grid CSS + script.js temizliği

**Files:**
- Modify: `style.css` — articles-grid kuralı ekle
- Modify: `script.js` — articlesSplide bloğunu kaldır

- [ ] **Step 1: style.css'e articles-grid CSS ekle**

`/* ─── ARTICLES ───*/` bloğunun hemen sonuna (`.articles-section` kuralının altına, `.article-card` kuralından önce) şunu ekle:

```css
.articles-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gap);
}
@media (max-width: 900px) { .articles-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .articles-grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 2: script.js'ten articlesSplide bloğunu kaldır**

`script.js`'te şuna benzeyen satırları (yaklaşık 10–15 satır) sil:

```js
new Splide('#articlesSplide', {
  ...
}).mount();
```

Podcast (`podcastSplide`) ve ürün (`productsSplide`) bloklarına dokunma.

- [ ] **Step 3: Tarayıcıda doğrula**

4 makale kart yan yana grid görünmeli; carousel okları olmamalı; 900px altında 2×2 grid.

- [ ] **Step 4: Commit**

```bash
git add index.html style.css script.js
git commit -m "feat: makaleler — carousel kaldırıldı, 4 kart sabit grid"
```

---

## Task 5: Konular — 4 Sütun + Yeşil Hover + 10 Yeni Konu

**Files:**
- Modify: `index.html` satır 219–264 (TOPICS section)
- Modify: `style.css` — topics-grid ve topic-link:hover

- [ ] **Step 1: style.css'te topics-grid 4 sütuna çevir ve hover yeşil yap**

`style.css`'te şu iki satırı değiştir:

```css
/* ESKİ */
.topics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0 48px; }
.topic-link:hover { color: var(--blue); }

/* YENİ */
.topics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0 40px; }
.topic-link:hover { color: var(--green); }
```

Ayrıca mobil breakpoint güncelle (satır ~507):

```css
/* ESKİ */
@media (max-width: 768px) { .topics-grid { grid-template-columns: repeat(2, 1fr); gap: 0 24px; } }

/* YENİ */
@media (max-width: 900px) { .topics-grid { grid-template-columns: repeat(2, 1fr); gap: 0 24px; } }
@media (max-width: 480px) { .topics-grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 2: index.html'e 4. sütun ekle**

`index.html`'de `<!-- EXPLORE TOPICS -->` bölümündeki `topics-grid` div'inin içine 3. `topics-col`'dan sonra şu 4. sütunu ekle:

```html
<div class="topics-col">
  <a href="blog/index.html" class="topic-link">Uyku &amp; Sirkadiyen Ritim</a>
  <a href="blog/kortizol-yaslanma.html" class="topic-link">Stres Yönetimi</a>
  <a href="blog/index.html" class="topic-link">Kadın Sağlığı</a>
  <a href="blog/index.html" class="topic-link">Menopoz</a>
  <a href="blog/index.html" class="topic-link">Testosteron</a>
  <a href="blog/index.html" class="topic-link">Tiroid</a>
  <a href="blog/index.html" class="topic-link">Cilt &amp; Yaşlanma</a>
  <a href="blog/index.html" class="topic-link">Bağırsak Sağlığı</a>
  <a href="blog/index.html" class="topic-link">Osteoporoz</a>
  <a href="blog/index.html" class="topic-link">Detoks &amp; Karaciğer</a>
</div>
```

- [ ] **Step 3: Tarayıcıda doğrula**

4 sütun görünmeli; link hover'ında renk yeşil (`#3BAD49`) olmalı; 900px altında 2 sütun.

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "feat: konular — 4 sütun, yeşil hover, 10 yeni konu"
```

---

## Task 6: Yıldız Sarı Renk + Ürün Kartı Hover

**Files:**
- Modify: `style.css` — product-card ve story-card yıldız rengi, kart hover

- [ ] **Step 1: style.css'te yıldız rengini ve kart hover'ını ekle**

`style.css`'te `.product-card__stars` kuralını bul ve renk ekle. Yoksa `.product-card` kuralının yanına şunları ekle/güncelle:

```css
.product-card__stars { color: var(--yellow); font-size: 13px; margin-bottom: 6px; }
.product-card__stars span { color: var(--gray-500); font-size: 12px; }

.product-card {
  /* mevcut değerlere ek olarak: */
  box-shadow: var(--shadow-md);
  transition: transform 0.2s, box-shadow 0.2s;
}
.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
```

Hikaye kartları için de aynı sarı renk — `.story-card` bölümünde yıldız varsa:
```css
.story-card__stars { color: var(--yellow); }
```

- [ ] **Step 2: Tarayıcıda doğrula**

Ürün kartlarında yıldızlar sarı görünmeli; kart üzerine gelindiğinde hafifçe yukarı kalkmalı (`translateY(-3px)`).

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: ürün kartları — sarı yıldızlar, hover lift efekti"
```

---

## Kontrol Listesi (Tüm Görevler Bittikten Sonra)

- [ ] Masaüstü (>1100px): hero iki sütun, 4 makale grid, 4 konu sütunu, sarı yıldızlar
- [ ] Tablet (768px): hero tek sütun koyu panel, makaleler 2×2, konular 2 sütun
- [ ] Mobil (375px): hero tam genişlik, makaleler 1 sütun, konular 1 sütun
- [ ] Podcast ve ürün carousel'leri hâlâ çalışıyor (Splide okları var)
- [ ] Tüm iç linkler kırık değil
