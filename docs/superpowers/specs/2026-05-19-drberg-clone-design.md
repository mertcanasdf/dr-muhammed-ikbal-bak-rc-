# drberg.com Homepage Clone — Design Spec
**Date:** 2026-05-19  
**Purpose:** Öğrenme / Pratik (frontend geliştirme becerisi)  
**Stack:** Saf HTML + CSS + JavaScript (framework yok)

---

## Dosya Yapısı

```
index.html       — Sayfa iskelet ve tüm section HTML'i
style.css        — Tüm stiller (CSS custom properties kullanılacak)
script.js        — Hamburger menü, carousel, sticky header
assets/          — Yerel görsel varsa (zorunlu değil; Unsplash CDN kullanılabilir)
```

---

## Tasarım Tokenleri

| Token | Değer |
|-------|-------|
| `--color-primary` | `#2D7D46` (yeşil) |
| `--color-bg` | `#FFFFFF` |
| `--color-text` | `#1A1A1A` |
| `--color-muted` | `#6B7280` |
| `--color-border` | `#E5E7EB` |
| `--font-base` | `'Inter', system-ui, sans-serif` |
| `--radius` | `8px` |
| `--shadow` | `0 2px 8px rgba(0,0,0,0.08)` |

---

## Bölümler

### 1. Sticky Navbar
- Sol: Logo (metin tabanlı "Dr. Berg" veya SVG placeholder)
- Orta/Sağ: Nav linkleri — Content Library, Recipes, Keto, Guides, Quizzes, Shop
- Sağ: "Sign In" butonu + arama ikonu
- Davranış: `position: sticky; top: 0` — scroll'da hafif gölge eklenir (JS)
- Mobil: hamburger menü, tıklanınca nav linkleri dikey açılır

### 2. Hero Banner
- Tam genişlik, iki kolonlu layout (metin sol, görsel sağ)
- Başlık: "Dr. Berg's Daily Reboot Protocol Checklist"
- Alt metin: kısa açıklama (placeholder)
- CTA butonu: "Get Your FREE Copy Now!" — primary yeşil, hover efektli
- Görsel: Unsplash placeholder (640×480)

### 3. Makale Grid
- Başlık: "Helpful Reads"
- 4 kolonlu responsive grid (tablet: 2 kolon, mobil: 1 kolon)
- 8 kart: thumbnail (16:9), kategori etiketi (renkli badge), başlık, tarih
- Altında "View all articles →" linki

### 4. Konu Etiketleri (Topics Explorer)
- Başlık: "Explore Topics"
- Flex wrap ile 30 etiket: `border-radius: 999px`, hover renk değişimi
- Altında "View all topics →" linki

### 5. 4'lü Feature Blokları
- 4 eşit genişlikte kart (CSS Grid `repeat(4, 1fr)`)
- Her kart: görsel, başlık, kısa açıklama, link butonu
- İçerikler: Courses / YouTube Videos / Supplements Shop / Junk Food Meter App
- Tablet: 2×2 grid, mobil: 1 kolon

### 6. Başarı Hikayeleri
- Başlık: "Success stories that inspire"
- 3 kolonlu kart grid
- Her kart: avatar placeholder, isim, istatistik (örn. "-27 lbs"), alıntı metni
- Altında "View all stories →" linki

### 7. İnteraktif Araçlar
- 2 yan yana büyük kart (`display: grid; grid-template-columns: 1fr 1fr`)
- Kart 1: Keto Calculator — başlık, açıklama, "Start Calculator" butonu
- Kart 2: Body Type Quiz — başlık, açıklama, "Take the Quiz" butonu
- Her kartın arka planı hafif gri (`#F9FAFB`)

### 8. Ürün Carousel
- Başlık: "Shop Bestsellers"
- 4 ürün kartı yan yana; kaydırma okları (JS ile)
- Her kart: ürün görseli, isim, yıldız puanı (⭐), fiyat
- Overflow hidden + `transform: translateX` ile JS carousel

### 9. Footer
- 5 kolonlu grid: Logo+Newsletter | Explore | About | Tools | Social
- Newsletter: email input + "Subscribe" butonu
- Sosyal ikonlar: Facebook, Instagram, YouTube, X, Pinterest, TikTok (Unicode/SVG)
- Alt bar: copyright + legal linkler (Privacy, Terms, Contact)

---

## Responsive Breakpoints

| Breakpoint | Davranış |
|-----------|----------|
| `> 1024px` | Tam desktop layout |
| `768px – 1024px` | Tablet: 2 kolonlu grid'ler |
| `< 768px` | Mobil: tek kolon, hamburger menü |

---

## JavaScript Davranışları

1. **Sticky header gölgesi** — `window.scroll` event, `scrollY > 10` ise header'a `shadow` class ekle
2. **Hamburger menü** — `click` event, nav'a `open` class toggle
3. **Ürün carousel** — İleri/geri buton click'lerinde `translateX` miktarını güncelle

---

## İçerik Notları

- Tüm metinler örnek/placeholder içerikler olacak (orijinal site metinleri kopyalanmayacak)
- Görseller: `https://picsum.photos/` veya `https://source.unsplash.com/` CDN URL'leri
- Ürün görselleri: renkli placeholder kutular (CSS `background-color`)

---

## Kapsam Dışı

- Backend / form submit işlemleri
- Gerçek ürün verisi veya e-ticaret fonksiyonu
- Alt sayfalar (blog, shop, courses)
- Animasyonlar (scroll-triggered, GSAP vb.)
