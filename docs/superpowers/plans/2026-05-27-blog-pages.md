# Blog Sayfaları Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dr. Bakırcı sitesine 8 makale detay sayfası + 1 blog listeleme arşiv sayfası ekle; index.html bağlantılarını güncelle.

**Architecture:** Her sayfa tamamen statik HTML/CSS/JS olup mevcut `style.css` ve `script.js` dosyalarını `../` prefix'i ile kullanır. Blog-özgü stiller `style.css`'e eklenir. Tüm sayfalar aynı header/footer yapısını taşır.

**Tech Stack:** Vanilla HTML5, CSS (design tokens), Vanilla JS, Splide.js (carousel — sadece index.html'de)

---

## File Map

| Dosya | Eylem | Açıklama |
|---|---|---|
| `style.css` | Modify | Blog özgü stiller ekle (hero, article-body, takeaways, author-bio, related) |
| `blog/index.html` | Create | Blog arşiv sayfası — kategori filtrelemeli kart ızgarası |
| `blog/otofaji-nedir.html` | Create | Makale 1 |
| `blog/aralikli-oruc-longevity.html` | Create | Makale 2 |
| `blog/telomerleri-korumak.html` | Create | Makale 3 |
| `blog/nmn-nad-yaslanma.html` | Create | Makale 4 |
| `blog/mavi-bolge-diyeti.html` | Create | Makale 5 |
| `blog/d3-vitamini-eksikligi.html` | Create | Makale 6 |
| `blog/kortizol-yaslanma.html` | Create | Makale 7 |
| `blog/bolge-2-kardiyo.html` | Create | Makale 8 |
| `index.html` | Modify | Article card href'lerini + nav "İçerik Kütüphanesi" linkini güncelle |

---

## Task 1: Blog CSS stillerini style.css'e ekle

**Files:**
- Modify: `style.css` (sona ekle)

- [ ] `style.css` dosyasının sonuna aşağıdaki stilleri ekle:

```css
/* ─── BLOG ARCHIVE PAGE ─── */
.blog-hero {
  background: var(--main);
  color: #fff;
  padding: 64px 0 48px;
}
.blog-hero__title { font-size: clamp(28px, 4vw, 48px); font-weight: 900; margin-bottom: 12px; }
.blog-hero__sub   { font-size: 18px; opacity: 0.75; }

.blog-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 32px 0 0;
}
.filter-btn {
  font-family: var(--font);
  font-size: 13px;
  font-weight: 600;
  padding: 7px 16px;
  border-radius: 99px;
  border: 1.5px solid var(--border);
  background: var(--base);
  color: var(--gray-700);
  cursor: pointer;
  transition: all 0.15s;
}
.filter-btn:hover,
.filter-btn.active { background: var(--main); color: #fff; border-color: var(--main); }

.blog-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  padding: 48px 0 80px;
}
@media (max-width: 991px) { .blog-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px)  { .blog-grid { grid-template-columns: 1fr; } }

.blog-card {
  background: var(--base);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s, transform 0.2s;
}
.blog-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
.blog-card__img  { width: 100%; aspect-ratio: 4/3; object-fit: cover; }
.blog-card__body { padding: 20px; display: flex; flex-direction: column; flex: 1; }
.blog-card__cat  {
  display: inline-block;
  font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;
  color: var(--primary); background: var(--tertiary);
  padding: 3px 10px; border-radius: 99px; margin-bottom: 10px;
}
.blog-card__title { font-size: 17px; font-weight: 700; line-height: 1.3; margin-bottom: 10px; }
.blog-card__title a:hover { color: var(--blue); }
.blog-card__excerpt { font-size: 14px; color: var(--gray-500); line-height: 1.6; flex: 1; margin-bottom: 14px; }
.blog-card__meta  { font-size: 12px; color: var(--gray-500); display: flex; gap: 12px; align-items: center; }
.blog-card__read-more {
  display: inline-block; margin-top: 12px;
  font-size: 13px; font-weight: 700; color: var(--blue);
}
.blog-card__read-more:hover { text-decoration: underline; }

/* ─── ARTICLE DETAIL PAGE ─── */
.article-hero {
  background: var(--main);
  color: #fff;
  padding: 64px 0 56px;
}
.article-hero__inner { max-width: 800px; }
.article-hero__cat {
  display: inline-block;
  font-size: 12px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase;
  color: var(--yellow); margin-bottom: 16px;
}
.article-hero__title { font-size: clamp(26px, 4vw, 44px); font-weight: 900; line-height: 1.15; margin-bottom: 20px; }
.article-hero__meta  { display: flex; gap: 20px; font-size: 14px; opacity: 0.7; flex-wrap: wrap; }

.article-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 48px;
  padding: 64px 0 80px;
  align-items: start;
}
@media (max-width: 900px) {
  .article-layout { grid-template-columns: 1fr; }
  .article-sidebar { order: 2; }
}

.article-body { min-width: 0; }
.article-body__featured-img {
  width: 100%; border-radius: var(--r-lg);
  margin-bottom: 40px; aspect-ratio: 16/9; object-fit: cover;
}
.article-body p   { font-size: 17px; line-height: 1.8; margin-bottom: 24px; color: #1a1a1a; }
.article-body h2  { font-size: 26px; font-weight: 800; margin: 40px 0 16px; color: var(--main); }
.article-body h3  { font-size: 20px; font-weight: 700; margin: 28px 0 12px; color: var(--main); }
.article-body ul, .article-body ol { padding-left: 24px; margin-bottom: 24px; }
.article-body li  { font-size: 17px; line-height: 1.8; margin-bottom: 8px; color: #1a1a1a; }
.article-body strong { color: var(--main); }

.takeaways {
  background: #F0F7F0;
  border-left: 4px solid var(--green);
  border-radius: 0 var(--r) var(--r) 0;
  padding: 24px 28px;
  margin: 40px 0;
}
.takeaways__title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; color: var(--green); margin-bottom: 14px; }
.takeaways ul { padding-left: 20px; margin: 0; }
.takeaways li { font-size: 16px; line-height: 1.7; margin-bottom: 8px; color: var(--main); }

.author-bio {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  background: var(--tertiary);
  border-radius: var(--r-lg);
  padding: 24px;
  margin-top: 48px;
}
.author-bio__avatar {
  width: 64px; height: 64px; border-radius: 50%;
  object-fit: cover; flex-shrink: 0;
}
.author-bio__name  { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
.author-bio__title { font-size: 13px; color: var(--gray-500); margin-bottom: 8px; }
.author-bio__desc  { font-size: 14px; line-height: 1.6; color: var(--gray-700); margin: 0; }

/* Sidebar */
.article-sidebar { position: sticky; top: 120px; }
.sidebar-card {
  background: var(--base);
  border-radius: var(--r-lg);
  padding: 24px;
  box-shadow: var(--shadow);
  margin-bottom: 24px;
}
.sidebar-card__title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: var(--gray-500); margin-bottom: 16px; }
.sidebar-toc a {
  display: block; font-size: 14px; padding: 8px 0;
  border-bottom: 1px solid var(--border); color: var(--gray-700);
  transition: color 0.15s;
}
.sidebar-toc a:last-child { border-bottom: none; }
.sidebar-toc a:hover { color: var(--blue); }
.sidebar-related-card { display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-start; }
.sidebar-related-card:last-child { margin-bottom: 0; }
.sidebar-related-card__img { width: 68px; height: 52px; object-fit: cover; border-radius: var(--r); flex-shrink: 0; }
.sidebar-related-card__title { font-size: 13px; font-weight: 600; line-height: 1.4; color: var(--main); }
.sidebar-related-card__title:hover { color: var(--blue); }
.sidebar-related-card__cat { font-size: 11px; color: var(--gray-500); margin-bottom: 4px; }
```

- [ ] Commit:

```
git add style.css
git commit -m "feat: blog CSS stilleri eklendi"
```

---

## Task 2: Blog arşiv sayfası — blog/index.html

**Files:**
- Create: `blog/index.html`

- [ ] `blog/` klasörünü oluştur, ardından `blog/index.html` dosyasını aşağıdaki içerikle yaz:

Sayfa yapısı:
- Header + footer: `index.html` ile aynı, ancak `href="../"` ana sayfaya, CSS path `../style.css`, JS path `../script.js`
- Blog hero: koyu arka planlı başlık + kategori filtre butonları
- Blog grid: 8 makale kartı, `data-cat` attribute ile filtrelenebilir
- Filtre JS: basit category toggle (class toggle)

- [ ] Commit:

```
git add blog/index.html
git commit -m "feat: blog arşiv sayfası"
```

---

## Task 3–10: Makale detay sayfaları (8 adet)

Her sayfa için yapı:
- Header + footer (yollar `../` prefix'li)
- `<article-hero>`: kategori badge, başlık, yazar + tarih + okuma süresi meta
- `<article-layout>`: 2 sütun (içerik + sidebar)
  - Sol: öne çıkan görsel, giriş paragrafı, 4-5 H2 bölümü, takeaways kutusu, yazar bio
  - Sağ sidebar: içindekiler (TOC) + ilgili makaleler

### Task 3: otofaji-nedir.html
**Files:** Create: `blog/otofaji-nedir.html`

### Task 4: aralikli-oruc-longevity.html
**Files:** Create: `blog/aralikli-oruc-longevity.html`

### Task 5: telomerleri-korumak.html
**Files:** Create: `blog/telomerleri-korumak.html`

### Task 6: nmn-nad-yaslanma.html
**Files:** Create: `blog/nmn-nad-yaslanma.html`

### Task 7: mavi-bolge-diyeti.html
**Files:** Create: `blog/mavi-bolge-diyeti.html`

### Task 8: d3-vitamini-eksikligi.html
**Files:** Create: `blog/d3-vitamini-eksikligi.html`

### Task 9: kortizol-yaslanma.html
**Files:** Create: `blog/kortizol-yaslanma.html`

### Task 10: bolge-2-kardiyo.html
**Files:** Create: `blog/bolge-2-kardiyo.html`

Her task'ın commit mesajı: `feat: makale sayfası — [başlık]`

---

## Task 11: index.html linklerini güncelle

**Files:**
- Modify: `index.html`

- [ ] Article carousel'daki 8 makalenin `href="#"` değerlerini ilgili `blog/*.html` yollarıyla değiştir
- [ ] Nav menüsündeki `İçerik Kütüphanesi` linkini `blog/index.html` ile güncelle
- [ ] Footer'daki `Blog` linkini `blog/index.html` ile güncelle

- [ ] Commit:

```
git add index.html
git commit -m "feat: blog sayfalarına link bağlantıları"
```
