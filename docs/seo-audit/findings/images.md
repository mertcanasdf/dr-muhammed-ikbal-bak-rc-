# Image SEO Findings — Dr. Muhammed İkbal Bakırcı

- Scope: all `<img>` in 68 built pages (`dist/**/*.html`, build of 2026-10-05 22:59), all 84 files in `public/assets/images/`, and OG/Twitter images. Source in `src/`.
- Checked: 2026-10-05. Method: BeautifulSoup over `dist/`, Pillow for pixel sizes, file sizes on disk, CSS rules in `public/style.css` and `dist/_astro/*.css`, and Lighthouse 13.5.0 CLS lab runs (local Chrome 154) on `/`, `/blog/` and `/blog/otofaji-nedir/`.
- The working tree changed during the audit. The new `[slug].astro` already gives the article hero `width/height`, `fetchpriority="high"` and `decoding="async"`. Those items are counted as fixed.

## Score: 52 / 100

| Metric | Status | Count |
|---|---|---|
| Total `<img>` (68 pages) | — | 410 (84 unique files, 8.07 MB total) |
| Missing `alt` attribute | pass | 0 |
| Generic or non-descriptive alt | fail | 136 ("İlgili yazı görseli"), plus about 20 weak short alts |
| Empty `alt=""` (decorative) | ok | 4 (homepage cards next to their heading text) |
| No `width`/`height` attributes | fail | 350 / 410 |
| Not lazy-loaded (`loading` absent or eager) | fail | 351 / 410 (only 56 should be eager: the LCP heroes) |
| LCP image eager + `fetchpriority="high"` | pass | `/` and all 55 articles (new build) |
| `srcset` / responsive variants | fail | 0 / 410 |
| Format | good | 83 WebP, 1 JPG (homepage hero / default OG) |
| Files > 200 KB | warn | 6 (largest 303 KB) |
| Files > 100 KB | warn | 27 |
| Non-hyphenated / English filenames | warn | 21 (`quiz_*`, `success_*`, `guide_*`) |
| CLS (Lighthouse lab) | pass | 0 on `/`, `/blog/`, `/blog/otofaji-nedir/`, because CSS `aspect-ratio` and fixed boxes reserve the space |

---

## Findings

### IMG-01 — HIGH — `/blog` loads 55 full-size covers (5.2 MB) up front
- **Evidence:** `dist/blog.html` has 55 `<img class="blog-card__img">` with no `loading` and no dimensions (`src/pages/blog/index.astro:33`). All 55 are 1200×800 WebP: 5,260 KB, fetched immediately. `/dunyada-saglik` uses the same files but already has `loading="lazy"`. Other non-lazy weight: `/medikal-estetik` 21 images (1,575 KB), `/rehberler` 11 (961 KB), `/quizler` 12 (835 KB) and `/longevity` 4 (470 KB).
- **Fix:**
  - `src/pages/blog/index.astro:33` → `<img src={post.data.image} alt={post.data.title} class="blog-card__img" width="1200" height="800" loading={i < 3 ? 'eager' : 'lazy'} decoding="async" />` (use the map index `i`).
  - Add `width="1200" height="800" loading="lazy" decoding="async"` to every card image in `src/pages/longevity.astro:1367,1401`, `src/pages/medikal-estetik.astro:314-528,564` (the 21 `estetik-card__img` / `blog-card__img`), `src/pages/quizler.astro:78-…` (12 `quiz-card__img`) and `src/pages/rehberler.astro`.
- **Success check:** on `dist/blog.html`, `grep -o '<img[^>]*>' dist/blog.html | grep -vc 'loading="lazy"'` returns ≤ 3. In a Lighthouse "Defer offscreen images" run on `/blog`, the initial image transfer falls under 400 KB.

### IMG-02 — HIGH — 64 px avatar and 68×52 thumbnails are served as 1040×1560 and 1200×800 files on every article
- **Evidence:** in `src/pages/blog/[slug].astro`:
  - The author box `<img src="/assets/images/generated/doctor-portrait.webp" class="author-bio__avatar">` renders at 64×64 (CSS `.author-bio__avatar{width:64px;height:64px}`) but downloads 1040×1560 / 58 KB, with no lazy-loading and no dimensions.
  - The sidebar "İlgili Makaleler" `<img src={r.image} alt="İlgili yazı görseli" class="sidebar-related-card__img">` (line ~255) renders at 68×52 but downloads three 1200×800 covers (up to 229 KB each), not lazy.
  - Result: about 300–400 KB of avoidable bytes on each of the 55 articles (`/blog/otofaji-nedir` loads 378 KB of images up front; only the 77 KB hero is needed).
- **Fix:**
  1. Extend `compress-images.mjs` (sharp is already a dependency) to emit `-400.webp` and `-160.webp` variants for every file in `public/assets/images/generated/articles/`, plus `doctor-portrait-128.webp` (128×128 crop, for 2× DPR). Alternatively, move the images to `src/assets/` and use `astro:assets` `<Image widths={[160,400,800,1200]} />`.
  2. Avatar: `<img src="/assets/images/generated/doctor-portrait-128.webp" width="64" height="64" alt="Dr. Muhammed İkbal Bakırcı" loading="lazy" decoding="async" class="author-bio__avatar">`.
  3. Sidebar: `<img src={r.image.replace('.webp','-160.webp')} width="68" height="52" alt="" loading="lazy" decoding="async" class="sidebar-related-card__img">`. The alt is empty because the card title next to it is already the link text (see IMG-03).
- **Success check:** the article page's image bytes before scroll are ≤ hero size + 20 KB. Lighthouse "Properly size images" shows no avatar or sidebar entries.

### IMG-03 — MEDIUM — 136 images use the generic alt "İlgili yazı görseli"; card alts duplicate their headings
- **Evidence:** "İlgili yazı görseli" appears 136× (3 per article, `src/pages/blog/[slug].astro:~255`). It carries no information, and screen readers announce "İlgili yazı görseli, link" before the title. Elsewhere, card images use the article title as alt (for example `/blog` has 55 cards with alt = the `<h2>` text next to them), so assistive tech reads the title twice. Weak short alts on `/medikal-estetik`: "Stres ve cilt", "D3 ve cilt", "NAD ve cilt", "Telomer ve cilt" and "Cilt gençleşmesi". Quiz alts repeat the card title ("Vücut Tipi Quizi", "Longevity Skoru").
- **Fix:**
  - Sidebar related cards and blog/hub listing cards, where the image sits inside the same link as the title: use `alt=""`, since the image is decorative there and the link text already names the target.
  - Article hero (`[slug].astro`) and `/medikal-estetik` cards: describe what is shown, in Turkish, in 60–125 characters. For example, add `imageAlt:` to the blog frontmatter schema (`src/content/config.ts`) and write "Yüz bölgesine altın iğne (mikro iğneli radyofrekans) uygulaması yapılan kadın" in `altin-igne.md`. Fall back to the title only when `imageAlt` is missing.
- **Success check:** `grep -c "İlgili yazı görseli" -r dist` returns `0`, and each article hero alt differs from its H1.

### IMG-04 — MEDIUM — 350/410 images have no `width`/`height`
- **Evidence:** only the homepage (`src/pages/index.astro`, 5 images) and the new article hero carry dimensions. Lab CLS is 0 today because CSS reserves the boxes (`.article-body__featured-img{aspect-ratio:16/9}`, `.sidebar-related-card__img{width:68px;height:52px}`, `.author-bio__avatar{64px}`). That protection depends on the CSS and is lost when a stylesheet loads late or a class changes.
- **Fix:** add intrinsic `width`/`height` to every `<img>` listed in IMG-01 and IMG-02. All covers are 1200×800 and the quiz/guide images are 1200×800. On `src/pages/hakkinda.astro:54` use `width="1040" height="1560"`. On `/` (`src/pages/index.astro`), the `doctor-portrait.webp` tag declares `width="1200" height="800"` but the file is 1040×1560; correct it to `width="1040" height="1560"`.
- **Success check:** `grep -o '<img[^>]*>' -r dist --include=*.html | grep -v 'width=' | wc -l` returns `0`, and Lighthouse CLS stays at 0.

### IMG-05 — MEDIUM — No responsive images (`srcset`) anywhere
- **Evidence:** 0 of 410 `<img>` have `srcset`. Mobile users get 1200 px covers for cards that are about 350 px wide.
- **Fix:** after generating the `-400`/`-800` variants (IMG-02), add `srcset="{base}-400.webp 400w, {base}-800.webp 800w, {base}.webp 1200w" sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 380px"` to the card images. Use `sizes="(max-width: 900px) 100vw, 760px"` for the article hero.
- **Success check:** Lighthouse "Properly size images" on mobile `/blog` and an article reports < 50 KB of potential savings.

### IMG-06 — LOW — Six files over 200 KB, 27 over 100 KB
- **Evidence:** `generated/exercise.webp` 303 KB, `quiz_longevity_score.webp` 264 KB, `articles/doga-ve-zihin-sagligi.webp` 229 KB, `success_energy_fit.webp` 216 KB, `articles/lifli-beslenme-ve-mikrobiyota.webp` 213 KB and `articles/gunluk-yuruyus-sagligi.webp` 212 KB. The `success_*` files are referenced only from dead code in `public/script.js` (see onpage OP-13).
- **Fix:** re-encode with `sharp(...).webp({ quality: 72, effort: 6 })` in `compress-images.mjs` so content images land under 100 KB and heroes under 200 KB. Delete the 6 `success_*.webp` files together with the dead story code.
- **Success check:** `find public/assets/images -size +200k | wc -l` returns `0`.

### IMG-07 — LOW — Filenames: 21 English names with underscores
- **Evidence:** `quiz_body_type.webp`, `quiz_gut_health.webp`, `guide_intermittent_fasting.webp`, `guide_keto_diet.webp`, `success_*` and others in `public/assets/images/generated/`. The article covers already use good Turkish hyphenated slugs (`articles/otofaji-nedir.webp`).
- **Fix:** rename to Turkish hyphenated names that match the page topic, for example `quiz_gut_health.webp` → `bagirsak-sagligi-testi.webp`, `guide_intermittent_fasting.webp` → `aralikli-oruc-rehberi.webp` and `quiz_pss_stress.webp` → `algilanan-stres-olcegi-pss-10.webp`. Then update the references in `src/pages/quizler.astro`, `rehberler.astro` and `longevity.astro`. Since these were never indexed under the new domain structure, no redirects are needed.
- **Success check:** `find public/assets/images -name "*_*" | wc -l` returns `0`.

### IMG-08 — MEDIUM — OG image suitability
- **Evidence:** the default `og:image` / `twitter:image` on 13 pages is `/assets/images/dr-muhammed-ikbal-bakirci.jpg`, a **682×1024 portrait**. `summary_large_image` and Facebook/LinkedIn render 1.91:1 (1200×630), so the face is cropped to a thin band. Article OG images are 1200×800 WebP: the ratio is acceptable and the size is fine (≤ 230 KB), but some scrapers handle WebP inconsistently. No `og:image:width`, `og:image:height` or `og:image:type` is set anywhere.
- **Fix:** produce `public/assets/images/og/dr-muhammed-ikbal-bakirci-og.jpg` at 1200×630 JPG (portrait placed right, name and title on the left, ≤ 150 KB) and point `DEFAULT_IMAGE` in `src/lib/seo.ts` to it. Optionally add a build step that writes `public/assets/images/og/{slug}.jpg` (1200×630 JPG crop of each cover) and use it in `[slug].astro`. Add width, height and type meta tags in `BaseLayout.astro` (see onpage OP-09).
- **Success check:** the Facebook Sharing Debugger and the X card validator show the full face and no crop warning, and `og:image:width` = 1200 / `og:image:height` = 630 on non-article pages.

### IMG-09 — INFO — AI-generated imagery: provenance metadata
- **Evidence:** the commit history states that 55 covers were generated with Codex image generation. The files carry no IPTC/XMP `DigitalSourceType`. This is not a ranking factor and is not required for a non-Merchant site, but it is a transparency signal on a medical site.
- **Fix (optional):** `exiftool -overwrite_original -XMP-iptcExt:DigitalSourceType="http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia" public/assets/images/generated/articles/*.webp`, and add `-XMP:Rights="© Dr. Muhammed İkbal Bakırcı"`.
- **Success check:** `exiftool -DigitalSourceType public/assets/images/generated/articles/otofaji-nedir.webp` prints the IRI.

### Passed / fixed
- Every `<img>` has an `alt` attribute (0 missing).
- The homepage LCP hero (`dr-muhammed-ikbal-bakirci.jpg`, 682×1024, 82 KB) is `loading="eager" fetchpriority="high"` with dimensions. Converting it to WebP/AVIF would save about 30–40 KB (low priority).
- Article hero in the new build: `width="1200" height="800" loading="eager" fetchpriority="high" decoding="async"`, which is correct for LCP. Note that `decoding="async"` on the LCP image is harmless but can be dropped.
- Homepage below-fold images are `loading="lazy" decoding="async"` with dimensions, which is the pattern to copy elsewhere.
- 83/84 files are already WebP. Lab CLS is 0.

## Prioritized optimization list (by bytes saved)

| Image(s) | Where | Current | Issue | Est. savings |
|---|---|---|---|---|
| 55 × article covers | `/blog` cards | 5,260 KB eager | not lazy, 1200 px for about 380 px slot | ≈ 5.0 MB initial; about 2.6 MB total with 400w variants |
| 3 × covers per article | article sidebar (×55 pages) | 150–400 KB | 1200×800 rendered at 68×52 | ≈ 95% (to about 15 KB) |
| `doctor-portrait.webp` | author box (×55) | 58 KB | 1040×1560 rendered at 64×64 | ≈ 54 KB per page |
| 21 card images | `/medikal-estetik` | 1,575 KB eager | not lazy, oversized | ≈ 1.3 MB initial |
| 11 / 12 card images | `/rehberler`, `/quizler` | 961 / 835 KB | not lazy, oversized | ≈ 0.8 / 0.7 MB initial |
| 6 files > 200 KB | various | 1.4 MB | over-quality | ≈ 0.6 MB |
