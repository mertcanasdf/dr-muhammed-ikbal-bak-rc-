# Performance findings (dr-bakirci-revizyon.surge.sh)

Method: Lighthouse 12.8.2 (npx, local headless Chrome, mobile emulation, simulated slow 4G), one run per page, 2026-10-05. The PSI API returned 429 (quota). No CrUX field data (staging domain). LAB means measured; INFERRED means read from source. Single runs, so LCP has about +/-0.3s noise.

## Lab results (mobile)
| Page | Score | LCP | FCP | TBT | CLS | Weight | DOM |
|---|---|---|---|---|---|---|---|
| / | 97 | 2.0s | 1.2s | 50ms | 0 | 380 KiB | 284 |
| /blog | 94 | 2.8s | 1.9s | 0 | 0 | 5,409 KiB | 855 |
| /blog/botoks | 91 | 2.8s | 1.6s | 0 | 0.021 | 422 KiB | 315 |
| /medikal-estetik | 87 | 3.9s | 1.8s | 0 | 0 | 1,711 KiB | 394 |
| /longevity | 99 | 1.9s | 1.2s | 0 | 0 | 607 KiB | 601 |

Overall score about 94 (mean of the five pages). CWV (lab proxy): CLS passes everywhere. INP is not measurable in lab; TBT is 0-50ms and total JS is about 12 KB, so INFERRED pass. LCP FAILS on /medikal-estetik (3.9s), is borderline on /blog and /blog/botoks (2.8s), and passes on home and longevity.

## Findings

### 1. HIGH - /medikal-estetik LCP 3.9s: card image LCP with no priority, plus about 1.2 MB oversized images
Evidence (LAB): LCP element is img.estetik-card__img (cilt-bariyeri-nasil-guclendirilir.webp). lcp-discovery fails (no fetchpriority). uses-responsive-images 1,196 KiB, image-delivery 1,007 KiB savings. 21 imgs; sources are 1200x800 webp (up to 235 KB) shown at about 360px wide.
Fix: in src/pages/medikal-estetik.astro, line ~314 (first card) add `fetchpriority="high" width="1200" height="800"`. On the other imgs (lines ~325-390 and beyond) add `loading="lazy" decoding="async" width="1200" height="800"`. Generate 480w and 800w variants (extend compress-images.mjs) and use `srcset="x-480.webp 480w, x-800.webp 800w, x.webp 1200w" sizes="(max-width:700px) 92vw, 360px"`.
Check: Lighthouse LCP <= 2.5s; lcp-discovery and uses-responsive-images pass; weight under 600 KiB.

### 2. HIGH - /blog ships 5.4 MB: every card image loads eagerly at 1200x800
Evidence (LAB): total-byte-weight 5,409 KiB; uses-responsive-images 3,888 KiB; DOM 855; LCP 2.8s with fetchpriority missing. Source: src/pages/blog/index.astro line 33 `<img src={post.data.image} alt={post.data.title} class="blog-card__img" />` has no loading, width or height.
Fix: use the map index: `posts.map((post, i) => ...)` and set `width="1200" height="800" decoding="async" loading={i < 2 ? 'eager' : 'lazy'} fetchpriority={i === 0 ? 'high' : undefined}`, plus srcset variants as in #1. Apply the same to the card grid at src/pages/longevity.astro line 1367 and to home cards. Optional: paginate or "load more" to cut DOM from 855.
Check: initial /blog transfer under about 800 KiB; LCP <= 2.5s; CLS stays 0.

### 3. MEDIUM - Article featured image (LCP) lacks fetchpriority and is oversized
Evidence (LAB): /blog/botoks LCP is img.article-body__featured-img with loading="eager" but no fetchpriority; lcp-discovery fails; uses-responsive-images 277 KiB; CLS 0.021 (no width/height).
Fix: src/pages/blog/[slug].astro line 69: add `width="1200" height="800" fetchpriority="high" decoding="async"` and a srcset/sizes (`sizes="(max-width:800px) 100vw, 800px"`).
Check: LCP <= 2.5s, CLS 0.

### 4. MEDIUM - Render-blocking style.css (49.5 KB raw, about 10 KB transferred) and mobile-menu.css
Evidence (LAB): render-blocking insight est. 320 ms on home (style.css 150 ms); 30-40 ms on other pages. BaseLayout.astro lines 70-71 load both as blocking links.
Fix: merge mobile-menu.css into style.css (one fewer request). Better: inline above-the-fold critical CSS in BaseLayout and load the rest non-blocking (`media="print" onload="this.media='all'"` plus `<noscript>`). Page-scoped CSS already goes to /_astro/*.css, so audit style.css for page-specific rules and split.
Check: render-blocking savings under 100 ms; home FCP down 0.2-0.3s.

### 5. MEDIUM - Home hero image is a 83 KB JPG, larger than display size
Evidence (LAB): modern-image-formats 48 KiB, responsive 155 KiB, image-delivery 205 KiB (including below-fold cards vo2max-ve-longevity.webp 108 KB, uyku-kalitesi-nasil-artirilir.webp 64 KB). The LCP image itself is correctly set (fetchpriority=high, eager, width/height).
Fix: convert public/assets/images/dr-muhammed-ikbal-bakirci.jpg to AVIF/WebP at 1x/2x display width via `<picture>` in the home hero (src/pages/index.astro); lazy-load and downsize home cards.
Check: home transfer under 250 KiB; LCP about 1.5s.

### 6. LOW - /blog to /blog/ redirect costs 1.0-1.7s (LAB, all non-home pages)
Evidence: request to /blog returned a redirect to /blog/. astro.config.mjs has trailingSlash:'never' and internal links are slashless, but surge serves directories with a trailing-slash redirect. This is probably a staging-host behavior.
Fix: verify production (`curl -sI https://www.muhammedikbalbakirci.com/blog`). If it redirects, either set `trailingSlash:'always'` and slash-terminate canonicals, links and sitemap, or fix nginx (`try_files $uri $uri.html $uri/index.html`). Do not treat the staging redirect timing as production.
Check: canonical URLs return 200 directly; redirects audit passes.

### 7. LOW - Caching and compression (INFERRED for production)
TTFB is 160-210 ms (fine). Fix in production nginx: brotli/gzip for html/css/js/svg; `Cache-Control: public, max-age=31536000, immutable` for /_astro/* and /assets/*. /style.css, /script.js and /mobile-menu.js are unhashed, so add a version query or a short cache with revalidation to avoid stale deploys.
Check: response headers.

### 8. LOW - Fonts: four Roboto woff2 weights (400/500/700/900, 22 KB each), only 400 and 700 preloaded
Evidence (LAB): all four are fetched on home. font-display:swap is set (no FOIT). Fix: drop 500/900 if not needed or map them to 400/700; subset to latin + latin-ext (Turkish needs latin-ext); preload only weights used above the fold. Check: fewer font requests, CLS stays 0.

### 9. LOW - Unsized image on /longevity; forced reflow from router script
Evidence (LAB): unsized-images flags quiz_longevity_score.webp (src/pages/longevity.astro line 1401, class premium-cta__img). Forced reflow of 48 ms comes from the _astro ClientRouter script (view transitions). /longevity LCP is a text node (lg-hero__sub), 1.9s, which is good.
Fix: add width/height and loading="lazy" to that img. If view transitions are not needed, remove ClientRouter to save about 5 KB JS and the reflow.
Check: unsized-images passes; TBT stays under 50 ms.

## Positives
CLS about 0; TBT 0-50 ms; JS tiny (script.js 4 KB, mobile-menu.js 1 KB, router 5 KB) and deferred; no third-party requests; font-display:swap with preloads; home LCP image well configured.

## Priority order
1) #1 and #2 (lazy loading, dimensions, srcset on card grids); 2) #3; 3) #5; 4) #4; 5) verify #6/#7 on production.

## Structured findings (JSON)
```json
{"category":"Performance","score":94,"lab_only":true,"cwv":{"LCP":{"/":"pass 2.0s","/blog":"borderline 2.8s","/blog/botoks":"borderline 2.8s","/medikal-estetik":"fail 3.9s","/longevity":"pass 1.9s"},"INP":"not measurable in lab; TBT<=50ms, inferred pass","CLS":"pass (max 0.021)"},"findings":[{"id":"P1","severity":"high","page":"/medikal-estetik"},{"id":"P2","severity":"high","page":"/blog"},{"id":"P3","severity":"medium","page":"/blog/*"},{"id":"P4","severity":"medium","page":"site"},{"id":"P5","severity":"medium","page":"/"},{"id":"P6","severity":"low","page":"site"},{"id":"P7","severity":"low","page":"site"},{"id":"P8","severity":"low","page":"site"},{"id":"P9","severity":"low","page":"/longevity"}]}
```
