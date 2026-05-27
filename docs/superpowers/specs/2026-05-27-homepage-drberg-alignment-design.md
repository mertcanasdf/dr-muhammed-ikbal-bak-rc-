# Homepage drberg.com Hizalama — Tasarım Dökümanı

**Tarih:** 2026-05-27  
**Kapsam:** `index.html`, `style.css`  
**Hedef:** 4 alandaki görsel farkı drberg.com ile kapatmak

---

## A — Hero Bölümü

**Mevcut:** Unsplash arka plan görseli, sol üst metin kutusu, sade beyaz/açık arka plan.

**Hedef:** İki sütunlu tam ekran hero. Sol %50 koyu panel (`#0C0809` arka plan, beyaz metin), sağ %50 doktorun fotoğrafı (`object-fit: cover`). Başlık büyütülür (`clamp(32px, 4vw, 52px)`).

**Detaylar:**
- HTML: `.hero` içine `.hero__left` ve `.hero__right` iki div eklenir.
- `.hero__left`: koyu arka plan, padding, metin ve CTA butonu.
- `.hero__right`: `background-image` ile placeholder fotoğraf (Unsplash portre). Gerçek fotoğraf geldiğinde CSS'deki URL değiştirilir.
- `min-height: 560px` (masaüstü), mobilde tek sütun (`.hero__left` tam genişlik, `.hero__right` gizlenir).
- Mevcut `.hero__bg` `<img>` etiketi kaldırılır.

---

## B — Makaleler Grid

**Mevcut:** Splide carousel, 8 kart kaydırmalı.

**Hedef:** Sabit 4 kart yatay grid. "Tüm makaleleri gör" linki section header'ın sağına taşınır (zaten var, yerinde).

**Detaylar:**
- Splide `<div>` ve `<ul class="splide__list">` yapısı kaldırılır; yerine `<div class="articles-grid">` eklenir.
- `articles-grid`: `display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px`.
- İlk 4 `<article class="article-card">` korunur, geri kalan 4'ü kaldırılır (blog arşivinden erişilebilir).
- Mobil: `@media (max-width: 900px)` → 2 sütun; `@media (max-width: 560px)` → 1 sütun.
- Splide JS başlatma kodu (`articlesSplide`) `script.js`'den kaldırılır.
- Splide CSS/JS bağımlılığı `index.html`'den kaldırılmaz (podcast ve ürün carousel'leri hâlâ kullanıyor).

---

## C — Konular (Topics) İyileştirme

**Mevcut:** 3 sütun grid, link hover rengi varsayılan (`--blue`), 30 konu.

**Hedef:** 4 sütun grid, hover rengi `--green (#3BAD49)`, 40 konu (10 yeni konu eklenir).

**Detaylar:**
- `topics-grid`: `grid-template-columns: repeat(4, 1fr)`.
- `.topic-link:hover`: `color: var(--green)`.
- 4. sütun için 10 yeni konu HTML'e eklenir (örn.: Uyku, Stres, Kadın sağlığı, Detoks, Cilt sağlığı, Bağırsak sağlığı, Osteoporoz, Tiroid, Testosteron, Menopoz).
- Mobil breakpoint güncellenir: `≤900px` → 2 sütun, `≤480px` → 1 sütun.

---

## D — Kart & Yıldız İnce Ayarlar

**Mevcut:** Yıldızlar varsayılan metin rengi, ürün kartı hafif gölge, hover efekti yok.

**Hedef:** Yıldızlar sarı, ürün kartı `shadow-md` + hover scale.

**Detaylar:**
- `.product-card__stars`: `color: var(--yellow)` (hem ürün hem hikaye kartlarında).
- `.product-card`: `box-shadow: var(--shadow-md)`.
- `.product-card:hover`: `transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15)`.
- `.product-card`: `transition: transform 0.2s, box-shadow 0.2s`.
- `.story-card__stars` varsa aynı sarı renk.

---

## Kapsam Dışı

- Podcast, başarı hikayeleri, araçlar, footer bölümleri — zaten iyi eşleşiyor.
- Yeni sayfalar, backend, form işlemleri.
- Gerçek doktor fotoğrafı temin etme (placeholder kullanılacak).
