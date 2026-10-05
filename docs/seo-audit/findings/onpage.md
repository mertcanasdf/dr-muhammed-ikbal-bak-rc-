# On-Page SEO Findings — Dr. Muhammed İkbal Bakırcı

- Scope: all 68 built pages (`dist/**/*.html`, excluding `404.html`), Astro source in `src/`, live staging https://dr-bakirci-revizyon.surge.sh
- Checked: 2026-10-05. Method: BeautifulSoup parse of every built page (titles, meta, headings, links, OG/Twitter, canonical, hreflang), link graph, plus `curl` against staging and production.
- **Important context:** while this audit ran, someone else changed the working tree and rebuilt `dist/` at 22:59 (uncommitted: `astro.config.mjs` now has `build: { format: 'file' }`, plus `seo.ts`, `BaseLayout.astro`, `[slug].astro`, `sitemap.xml.ts`). The findings below are for **that new build**. The surge deploy still serves the older directory-format build. Finding OP-01 is a regression that the new build introduced.

## Score: 58 / 100

| Area | Score | Notes |
|---|---|---|
| Titles | 50 | All unique and keyword-first, but 57/68 are over 60 characters (50 are over 70) |
| Meta descriptions | 45 | 9 pages currently share one fallback description (OP-01); 19 are short and 3 are long |
| H1 / headings | 75 | Exactly one H1 on all 68 pages. Navigation `<h4>`s come before the H1 site-wide, and 9 pages skip a level |
| Canonical / hreflang / lang | 30 | The new build points canonicals at `.html` URLs (OP-01). `lang="tr"` and `hreflang="tr"` are present |
| Internal linking | 55 | 50/55 articles have no in-body contextual links; `/sitelerimiz` is an orphan; generic anchors |
| OG / Twitter | 70 | Tags are complete, but `og:image` has no dimensions, the default image is a portrait, and `twitter:image:alt` is missing |

Positives: titles and H1s are unique, every page has exactly one H1, OG and Twitter tags are on every page, `robots` is `index, follow`, URLs are short Turkish slugs with hyphens and no parameters, and there are 0 broken internal links (4,115 checked).

---

## Findings

### OP-01 — CRITICAL — The new build (`build.format: 'file'`) emits `.html` canonicals and drops route descriptions
- **Evidence:**
  - `dist/blog/otofaji-nedir.html`: `<link rel="canonical" href="https://www.muhammedikbalbakirci.com/blog/otofaji-nedir.html">`. The same `.html` URL appears in `og:url`, `hreflang="tr"`, JSON-LD `WebPage @id`, and `BreadcrumbList` item 3. This affects 67/68 pages (all except `/`).
  - `dist/sitemap.xml` and all internal links still use `/blog/otofaji-nedir` with no `.html`. The canonical therefore disagrees with the sitemap and the links.
  - 9 pages fall back to the identical `DEFAULT_DESCRIPTION` ("Dr. Muhammed İkbal Bakırcı ile longevity, sağlık eğitimi ve medikal estetik hakkında kanıta dayalı bilgiler."). They are `/blog`, `/dunyada-saglik`, `/gecmis-yillar`, `/gizlilik-politikasi`, `/hakkinda`, `/kullanim-kosullari`, `/quizler`, `/rehberler` and `/sitelerimiz`. The cause is that `ROUTE_DESCRIPTIONS['/hakkinda.html']` does not exist.
  - Root cause: with `format: 'file'`, `Astro.url.pathname` at build time is `/hakkinda.html`, and `normalizePathname()` in `src/lib/seo.ts:39-43` only strips trailing slashes.
- **Fix:** in `src/lib/seo.ts`, change `normalizePathname` to:
  ```ts
  export function normalizePathname(pathname: string): string {
    if (!pathname || pathname === '/') return '/';
    const normalized = (pathname.startsWith('/') ? pathname : `/${pathname}`)
      .replace(/\.html$/, '')
      .replace(/\/index$/, '')
      .replace(/\/+$/, '');
    return normalized || '/';
  }
  ```
  This one change fixes the canonical, `og:url`, hreflang, breadcrumbs, `WebPage @id` and the route-description lookup. Also confirm that the production server serves `/hakkinda` → `hakkinda.html` without a redirect: nginx needs `try_files $uri $uri.html $uri/ =404;`, and Apache/Plesk needs an equivalent rewrite. Without that, every slashless URL returns 404 after the format change.
- **Success check:** `grep -o 'rel="canonical" href="[^"]*"' -r dist | grep -c '\.html"'` returns `0`. Rerunning the duplicate-description check gives 0 duplicates. `curl -sI https://www.muhammedikbalbakirci.com/hakkinda` returns `200` with no `Location`.

### OP-02 — HIGH (deployed build) — Canonical/sitemap URLs 301-redirect on the current hosting
- **Evidence:** production `curl -sI https://www.muhammedikbalbakirci.com/blog/otofaji-nedir` → `301 Location: .../blog/otofaji-nedir/`, and staging surge does the same. The old directory-format build emits slashless canonicals, so every canonical, sitemap `<loc>` and internal link (4,115 links) is a redirect hop.
- **Fix:** keep the in-progress `build: { format: 'file' }` in `astro.config.mjs`, apply the OP-01 fix, and add `try_files $uri $uri.html $uri/ =404;` (or the Plesk/Apache equivalent) on the production vhost. Do not switch to `trailingSlash: 'always'` as well; choose one model.
- **Success check:** `curl -s -o /dev/null -w "%{http_code}" https://www.muhammedikbalbakirci.com/blog/otofaji-nedir` → `200`. A Screaming Frog or `curl` sweep of the sitemap URLs returns 0 3xx responses.

### OP-03 — HIGH — 57/68 titles exceed 60 characters; the brand suffix uses 29 of them
- **Evidence:** every article title is `${title} — Dr. Muhammed İkbal Bakırcı` (`src/pages/blog/[slug].astro:44`). The median article title is about 85 characters, and the longest are `/blog/botoks` (120), `/blog/uyku-bozukluklari-ve-glymphatic-temizlik` (117) and `/blog/altin-igne` (116). Google truncates at about 580 px (≈ 55–60 Latin characters, fewer with wide Turkish capitals such as `İ`, `Ş` and `Ğ`), so the brand and often the tail of the keyword phrase are cut. Shortening the suffix to ` | Dr. Bakırcı` alone still leaves 46 titles over 60.
- **Fix:**
  1. `src/content/config.ts`: add `seoTitle: z.string().max(60).optional()` to the blog schema.
  2. `src/pages/blog/[slug].astro:44`: `title={post.data.seoTitle ?? (title.length <= 45 ? `${title} | Dr. Bakırcı` : title)}`.
  3. Write a `seoTitle` (≤ 60 characters, primary Turkish keyword first) for the 46 articles over the limit. Examples: `botoks.md` → "Botoks: Mimik Kırışıklıklar ve Masseter Uygulaması" (51); `altin-igne.md` → "Altın İğne Tedavisi: Kollajen ve Cilt Yenilenmesi" (49); `uyku-bozukluklari-ve-glymphatic-temizlik.md` → "Uyku Bozuklukları ve Glimfatik Temizlik" (39). Keep the long form as the H1.
  4. Static pages: `/longevity` "Tutarlı ve Uzun Yaşam — Longevity — Dr. …" (62) → "Longevity: Sağlıklı ve Uzun Yaşamın Bilimi | Dr. Bakırcı" (56). `/medikal-estetik` (61) → "Skin Longevity ve Medikal Estetik | Dr. Bakırcı" (47).
- **Success check:** rerun the title-length script, which should give 0 pages over 60. Titles stay unique.

### OP-04 — HIGH — `/dunyada-saglik` duplicates `/blog`
- **Evidence:** both pages list the same 55 posts with the same card headings (63/64 headings identical; only the H1 differs). The description promises "sağlık sistemleri… güncel yaklaşımlar", which the page does not deliver. Both pages are in the sitemap and linked from the footer, and both are typed `CollectionPage` in the new build.
- **Fix (pick one):** (a) give `src/pages/dunyada-saglik.astro` distinct content, such as a curated subset filtered by a `dunyada-saglik` tag plus original intro copy, or (b) until that exists, remove it from `staticRoutes` in `src/pages/sitemap.xml.ts`, add `<meta name="robots" content="noindex, follow">` (add a `noindex` prop to `BaseLayout.astro`), and remove the footer link in `src/components/Footer.astro:25`.
- **Success check:** the heading overlap between the two built pages drops below 30%, or `/dunyada-saglik` is `noindex` and missing from `sitemap.xml`.

### OP-05 — HIGH — 50 of 55 articles have no contextual internal links in the body
- **Evidence:** only 5 articles have any `href="/…"` inside `<article class="article-body">` (excluding share, author and takeaways), and none has more than 1. Articles get links only from `/blog`, `/dunyada-saglik`, the hubs and the 3 sidebar "İlgili Makaleler" cards. Inbound counts are low for `/blog/sanat-ve-beyin-sagligi`, `/blog/kitap-okuma-ve-beyin`, `/blog/kreatin-ve-yaslanma` and `/blog/muzik-ve-stres-kortizol` (2 pages each).
- **Fix:** in each `src/content/blog/*.md`, add 2–4 in-sentence links with descriptive Turkish anchors to related posts and to the matching hub (`/longevity` or `/medikal-estetik`). Examples: in `otofaji-nedir.md` link "aralıklı oruç" → `/blog/aralikli-oruc-longevity` and "mitokondri sağlığı" → `/blog/mitokondri-sagligi-nasil-desteklenir`; in `kreatin-ve-yaslanma.md` link "kas kütlesi" → `/blog/kas-kutlesi-ve-yaslanma` and "direnç antrenmanı" → `/blog/direnc-antrenmani-yaslanma`.
- **Success check:** rerun the in-body link counter, which should give at least 2 contextual internal links on every article and at least 4 inbound pages for every article.

### OP-06 — MEDIUM — `/sitelerimiz` is an orphan and its CTAs use the wrong target
- **Evidence:** 0 internal links point to `/sitelerimiz` (it is reachable only through the sitemap). Its 6 project cards each have a generic "Detaylı bilgi al" button to `/iletisim` instead of the project's own site, while the domain is printed as plain text (`<p class="site-card__url">gidatarayici.com</p>`, `src/pages/sitelerimiz.astro:23-28`).
- **Fix:** add `{ href: '/sitelerimiz', label: 'Sitelerimiz' }` to the "Keşfet" column in `src/components/Footer.astro` and to the Keşfet megamenu in `Header.astro`. Turn each `site-card__url` into `<a href="https://gidatarayici.com" rel="noopener">Gıda Tarayıcı sitesine git</a>`, or remove the cards whose sites are not live.
- **Success check:** `/sitelerimiz` gets at least 1 inbound link from every page, and no anchor text "Detaylı bilgi al" is repeated more than once per page.

### OP-07 — MEDIUM — Heading hierarchy: navigation `<h4>`s before the H1 on every page; 9 pages skip H1→H3
- **Evidence:** `src/components/Header.astro:60,71,81,103,113,136` uses `<h4 class="megamenu__title">` (6 per page, all before the H1), and the footer adds 3 more `<h4>`s. Pages that go from H1 straight to H3: `/rehberler` (guide cards are `h3`), `/sitelerimiz` (`h3` site cards), and 7 articles whose Markdown starts sections at `###`: `doga-ve-zihin-sagligi`, `kitap-okuma-ve-beyin`, `muzik-ve-stres-kortizol`, `sanat-ve-beyin-sagligi`, `sukran-pratigi-ve-dopamin`, `tukenmislik-sendromu` and `yasam-amaci-ve-longevity`. `/longevity` repeats the H3 "Bilim ne diyor?" 6 times, and its H3 "Metabolik Karalarılık" has a typo (`src/pages/longevity.astro:1314`, should be "Kararlılık").
- **Fix:**
  - In `Header.astro` and `Footer.astro`, change `<h4 class="megamenu__title">` / footer `h4` to `<p class="megamenu__title">` (the styling stays on the class).
  - In `src/pages/rehberler.astro` and `src/pages/sitelerimiz.astro`, add an `<h2>` section title above the card grids, or change the card titles to `h2`.
  - In the 7 Markdown files, replace leading `### ` with `## ` for top-level sections.
  - In `longevity.astro`, make each "Bilim ne diyor?" specific (for example "Bilim ne diyor: beslenme") and fix "Karalarılık" → "Kararlılık".
- **Success check:** the heading-skip script reports 0 skips, the first heading in document order is the H1, and `grep -c Karalarılık src/pages/longevity.astro` returns `0`.

### OP-08 — MEDIUM — Meta description length
- **Evidence:** after the OP-01 fix, 10 pages are under 120 characters (for example `/blog/muzik-ve-stres-kortizol` 100, `/blog/aralikli-oruc-longevity` 102, `/rehberler` 100, `/sitelerimiz` 100) and 3 are over 160 (`/blog/sirt6-proteini-epigenetik-genclesme` 222, `/blog/kortizol-yaslanma` 162, `/blog/tukenmislik-sendromu` 162). See the table below.
- **Fix:** rewrite the frontmatter `description:` in the listed `src/content/blog/*.md` files to 140–158 characters with the topic keyword in the first 60. For static pages, edit `ROUTE_DESCRIPTIONS` in `src/lib/seo.ts` to the same length. The `sirt6` text must be cut to ≤ 158.
- **Success check:** all 68 descriptions are 120–160 characters and unique.

### OP-09 — MEDIUM — Default OG image is a 682×1024 portrait, and no `og:image:width/height` is set
- **Evidence:** 13 non-article pages use `/assets/images/dr-muhammed-ikbal-bakirci.jpg` (682×1024, ratio 0.67). `summary_large_image` and Facebook/LinkedIn crop to 1.91:1, which cuts the portrait to a narrow strip. Articles use 1200×800 WebP (acceptable, center-cropped). No page declares `og:image:width`, `og:image:height` or `twitter:image:alt`.
- **Fix:** create `public/assets/images/og/dr-muhammed-ikbal-bakirci-og.jpg` at 1200×630 JPG (≤ 200 KB) with the portrait composed for 1.91:1 and set `DEFAULT_IMAGE` in `src/lib/seo.ts` to it. In `BaseLayout.astro`, add `<meta property="og:image:width" content="1200">`, `<meta property="og:image:height" content={imgH}>` (630 for the default, 800 for articles), `<meta property="og:image:type">`, and `<meta name="twitter:image:alt" content={title}>`. Optionally generate 1200×630 JPG versions of the article covers for platforms with weak WebP support.
- **Success check:** the Facebook Sharing Debugger and LinkedIn Post Inspector show an uncropped preview for `/` and `/hakkinda`, and every page has `og:image:width`.

### OP-10 — LOW — Title/H1 keyword mismatch on hub pages
- **Evidence:** `/blog` has title "Blog — …" but H1 "İçerik Kütüphanesi". `/quizler` has title "Quizler — …" but H1 "Vücudunuzu 5 Dakikada Tanıyın", and neither carries a searchable Turkish keyword such as "sağlık testi". On `/` the H1 "Sağlıklı Yaş Almanın Bilimi" is fine, and the title includes the name.
- **Fix:** `src/pages/blog/index.astro` title → "Sağlık ve Longevity Makaleleri | Dr. Bakırcı" with H1 "Sağlık ve Longevity Makaleleri". `src/pages/quizler.astro` title → "Ücretsiz Sağlık Testleri ve Quizler | Dr. Bakırcı" with an H1 that contains "sağlık testleri".
- **Success check:** the title and H1 share the primary keyword on both pages.

### OP-11 — LOW — Generic or repeated anchor text
- **Evidence:** "Bu konuda yazın →" appears 4× on `/iletisim` (all to `#iletisim-formu`), "Detaylı bilgi al" 6× on `/sitelerimiz`, and "Testlere Göz At" on `/quizler`. Sidebar related cards are fine because they carry the article title.
- **Fix:** make the anchors specific, for example "Randevu talebi yazın", "İş birliği için yazın", "Akademik davet için yazın" and "Medya talebi için yazın" in `src/pages/iletisim.astro`. See OP-06 for `/sitelerimiz`.
- **Success check:** no identical anchor text points to the same target more than once on a page.

### OP-12 — LOW — hreflang is self-only with no `x-default`
- **Evidence:** every page has only `<link rel="alternate" hreflang="tr" href="{canonical}">`. The site is Turkish-only, so this is harmless but adds nothing.
- **Fix:** either remove the line in `BaseLayout.astro`, or add `<link rel="alternate" hreflang="x-default" href={canonicalUrl} />`. Keep `<html lang="tr">` (correct on all 68 pages).
- **Success check:** after OP-01, hreflang URLs equal the canonical URLs.

### OP-13 — INFO — Dead navigation code in `public/script.js`
- **Evidence:** the first IIFE builds "Longevity" and "Rehberler" dropdowns with mismatched anchors, for example "Ketojenik Diyete Geçiş" → `/blog/aralikli-oruc-longevity`, "Uyku Optimizasyonu" → `/blog/telomerleri-korumak` and "Beyin Sağlığı" → `/blog/kortizol-yaslanma`. It never runs because Longevity is a megamenu and there is no "Rehberler" menu item. The file also ships unused patient testimonials (`ayse`, `mehmet`, …) with health-outcome claims.
- **Fix:** delete the dropdown IIFE and the `o={ayse:…}` / `openStory` / `closeStory` / `storyModal` block from `public/script.js`.
- **Success check:** `grep -c "Ketojenik Diyete Geçiş\|openStory" public/script.js` returns `0`.

---

## Per-page problem table (new build, 2026-10-05 22:59)

Every page also has two site-wide issues that are not repeated in each row: OP-01 (`.html` canonical, on all pages except `/`) and OP-07 (megamenu `<h4>`s before the H1). "desc 108 ch" means the page currently shows the duplicated fallback description from OP-01.

| URL | Title len | Desc len | Problems |
|---|---|---|---|
| `/blog` | 33 | 108 | desc 108 ch (short); OG = default portrait 682x1024; title/H1 mismatch ("İçerik Kütüphanesi") |
| `/blog/altin-igne` | 116 | 150 | title 116 ch |
| `/blog/anksiyete-ve-obsesyonun-fizyolojisi` | 113 | 141 | title 113 ch |
| `/blog/aralikli-oruc-longevity` | 72 | 102 | title 72 ch; desc 102 ch (short) |
| `/blog/biyolojik-yas-nasil-olculur` | 78 | 132 | title 78 ch |
| `/blog/bolge-2-kardiyo` | 85 | 155 | title 85 ch |
| `/blog/botoks-sonrasi-dikkat-edilmesi-gerekenler` | 70 | 144 | title 70 ch |
| `/blog/botoks` | 120 | 149 | title 120 ch |
| `/blog/cilt-bariyeri-nasil-guclendirilir` | 92 | 137 | title 92 ch |
| `/blog/cilt-genclesmesi-kombinasyon-tedavileri` | 94 | 137 | title 94 ch |
| `/blog/ciltte-kollajen-kaybi` | 91 | 133 | title 91 ch |
| `/blog/d3-k2-birlikte-kullanilir-mi` | 82 | 143 | title 82 ch |
| `/blog/d3-vitamini-eksikligi` | 101 | 142 | title 101 ch |
| `/blog/denge-egzersizleri-yaslanma` | 102 | 126 | title 102 ch |
| `/blog/dermal-dolgu-guvenligi` | 81 | 116 | title 81 ch; desc 116 ch (short) |
| `/blog/dermal-dolgu` | 98 | 123 | title 98 ch |
| `/blog/dijital-tukenmislik` | 84 | 131 | title 84 ch |
| `/blog/direnc-antrenmani-yaslanma` | 67 | 132 | title 67 ch |
| `/blog/doga-ve-zihin-sagligi` | 74 | 113 | title 74 ch; desc 113 ch (short); heading skip h1->h3 |
| `/blog/egzersiz-sonrasi-toparlanma` | 88 | 119 | title 88 ch; desc 119 ch (short) |
| `/blog/ekran-kullanimi-ve-uyku` | 82 | 143 | title 82 ch |
| `/blog/gunes-kremi-nasil-secilir` | 93 | 107 | title 93 ch; desc 107 ch (short) |
| `/blog/gunluk-yuruyus-sagligi` | 82 | 135 | title 82 ch |
| `/blog/hareketsizlik-ve-metabolik-saglik` | 101 | 131 | title 101 ch |
| `/blog/insulin-direnci-belirtileri` | 99 | 130 | title 99 ch |
| `/blog/kas-kutlesi-ve-yaslanma` | 94 | 134 | title 94 ch |
| `/blog/kavrama-gucu-ve-saglik` | 68 | 142 | title 68 ch |
| `/blog/kitap-okuma-ve-beyin` | 85 | 111 | title 85 ch; desc 111 ch (short); heading skip h1->h3 |
| `/blog/kortizol-yaslanma` | 78 | 162 | title 78 ch; desc 162 ch (long) |
| `/blog/kreatin-ve-yaslanma` | 83 | 138 | title 83 ch |
| `/blog/lifli-beslenme-ve-mikrobiyota` | 96 | 138 | title 96 ch |
| `/blog/magnezyum-eksikligi` | 84 | 138 | title 84 ch |
| `/blog/mavi-bolge-diyeti` | 98 | 135 | title 98 ch |
| `/blog/mezoterapi` | 101 | 145 | title 101 ch |
| `/blog/mitokondri-sagligi-nasil-desteklenir` | 66 | 126 | title 66 ch |
| `/blog/muzik-ve-stres-kortizol` | 86 | 100 | title 86 ch; desc 100 ch (short); heading skip h1->h3 |
| `/blog/nmn-nad-yaslanma` | 82 | 112 | title 82 ch; desc 112 ch (short) |
| `/blog/omega-3-ne-ise-yarar` | 83 | 137 | title 83 ch |
| `/blog/otofaji-nedir` | 66 | 139 | title 66 ch |
| `/blog/polifenoller-ve-saglik` | 78 | 135 | title 78 ch |
| `/blog/protein-ihtiyaci-yaslanma` | 83 | 128 | title 83 ch |
| `/blog/prp-eksozom` | 111 | 127 | title 111 ch |
| `/blog/prp-mi-eksozom-mu` | 85 | 132 | title 85 ch |
| `/blog/retinoid-nedir` | 84 | 120 | title 84 ch |
| `/blog/sanat-ve-beyin-sagligi` | 73 | 124 | title 73 ch; heading skip h1->h3 |
| `/blog/senolitik-tedaviler-cilt-genclesmesi-zombi-hucreler` | 97 | 144 | title 97 ch |
| `/blog/sirkadiyen-ritim-ve-uyku` | 79 | 129 | title 79 ch |
| `/blog/sirt6-proteini-epigenetik-genclesme` | 100 | 222 | title 100 ch; desc 222 ch (long) |
| `/blog/sosyal-baglanti-ve-uzun-omur` | 86 | 131 | title 86 ch |
| `/blog/sukran-pratigi-ve-dopamin` | 78 | 121 | title 78 ch; heading skip h1->h3 |
| `/blog/telomerleri-korumak` | 84 | 150 | title 84 ch |
| `/blog/tukenmislik-sendromu` | 103 | 162 | title 103 ch; desc 162 ch (long); heading skip h1->h3 |
| `/blog/uyku-bozukluklari-ve-glymphatic-temizlik` | 117 | 156 | title 117 ch |
| `/blog/uyku-kalitesi-nasil-artirilir` | 94 | 126 | title 94 ch |
| `/blog/vo2max-ve-longevity` | 81 | 138 | title 81 ch |
| `/blog/yasam-amaci-ve-longevity` | 74 | 115 | title 74 ch; desc 115 ch (short); heading skip h1->h3 |
| `/dunyada-saglik` | 43 | 108 | desc 108 ch (short); OG = default portrait 682x1024 |
| `/gecmis-yillar` | 42 | 108 | desc 108 ch (short); OG = default portrait 682x1024 |
| `/gizlilik-politikasi` | 48 | 108 | desc 108 ch (short); OG = default portrait 682x1024 |
| `/hakkinda` | 37 | 108 | desc 108 ch (short); OG = default portrait 682x1024 |
| `/iletisim` | 37 | 110 | desc 110 ch (short); OG = default portrait 682x1024 |
| `/` | 56 | 157 | OG = default portrait 682x1024 |
| `/kullanim-kosullari` | 47 | 108 | desc 108 ch (short); OG = default portrait 682x1024 |
| `/longevity` | 62 | 148 | title 62 ch; OG = default portrait 682x1024 |
| `/medikal-estetik` | 61 | 115 | title 61 ch; desc 115 ch (short); OG = default portrait 682x1024 |
| `/quizler` | 36 | 108 | desc 108 ch (short); OG = default portrait 682x1024; title/H1 mismatch ("Vücudunuzu 5 Dakikada Tanıyın") |
| `/rehberler` | 38 | 108 | desc 108 ch (short); heading skip h1->h3; OG = default portrait 682x1024 |
| `/sitelerimiz` | 40 | 108 | desc 108 ch (short); heading skip h1->h3; orphan (0 inbound); OG = default portrait 682x1024 |

68 of 68 pages have at least one problem; 57 have an over-long title.
