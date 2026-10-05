# Technical SEO Findings - dr-bakirci-revizyon.surge.sh (staging) vs production

Method: curl on staging and production, grep over dist/ (68 HTML files) and src/. No Playwright/PSI/CrUX data, so Core Web Vitals are NOT measured (source-inspection flags only).

## Technical score: 74/100

| Category | Status | Score |
|---|---|---|
| Crawlability | warn | 70 |
| Indexability | warn | 72 |
| Security | warn | 55 (headers absent on prod; low ranking weight) |
| URL Structure | fail | 55 |
| Mobile | pass | 88 |
| Core Web Vitals | not measured (source flags only) | n/a |
| Structured Data | pass | 80 |
| JS Rendering | pass | 98 |
| IndexNow | fail | 0 (not implemented, Bing/Yandex only) |

## Critical

### C1. Staging robots.txt is `Disallow: /` (must never reach production)
- Evidence: `curl https://dr-bakirci-revizyon.surge.sh/robots.txt` returns `User-agent: *` / `Disallow: /`. The repo files `public/robots.txt` and `dist/robots.txt` say `Allow: /` + Sitemap. So the surge deploy was altered (intentional blocking of the preview).
- Fix: keep as-is on surge, but ensure the production upload uses `dist/robots.txt` (Allow: /). Do not rsync a surge-adjusted dist. Also verify the live file after deploy.
- Verify: `curl https://www.muhammedikbalbakirci.com/robots.txt` contains `Allow: /` and the sitemap line. (Currently production is correct.)
- Note: surge pages themselves carry `index, follow` and canonical to production, which is fine as long as the robots block holds.

## High

### H1. Canonical/redirect conflict: server forces trailing slash, site canonicalizes and links WITHOUT slash
- Evidence: `astro.config.mjs:7` `trailingSlash: 'never'`; canonicals, sitemap and internal links are slashless (`/hakkinda`). Production: `curl -sI https://www.muhammedikbalbakirci.com/hakkinda` gives `301 Location: /hakkinda/`; `/blog/botoks` gives `301 -> /blog/botoks/`; `/hakkinda/` returns 200 with canonical `/hakkinda`. Same on surge (`/blog` -> 301 `/blog/`). So every canonical URL and every sitemap URL (68) redirects, and the 200 URL is the non-canonical one. Google will usually follow the canonical but this wastes crawl, adds a hop to every internal link, and sends mixed signals.
- Fix (nginx on Plesk, add to `ana-domain-nginx-yonlendirmeler.conf` / extra directives): serve directories without redirect and 301 slash to slashless:
  ```
  location ~ ^/(.+)/$ { return 301 /$1; }
  location / { try_files $uri $uri.html $uri/index.html =404; }
  ```
  (Plesk may need these in "Additional nginx directives"; test that `/` itself still works and that `/assets/...` files are unaffected.) Alternative: flip Astro to `trailingSlash: 'always'` and rebuild so canonicals, sitemap and links match the server; this touches `src/lib/seo.ts` and `src/pages/sitemap.xml.ts` output.
- Verify: `curl -sI https://www.muhammedikbalbakirci.com/hakkinda` is `200` and `/hakkinda/` is `301 -> /hakkinda`; sitemap URLs all 200 with zero hops (loop through the 68 sitemap URLs).

### H2. Non-www HTTPS serves 200 (duplicate host)
- Evidence: `curl -s https://muhammedikbalbakirci.com/` returns 200 with canonical to www; http://www redirects to https://www (good), but https://non-www does not 301 to www.
- Fix: in Plesk, set the preferred domain to www ("301 redirect from non-www to www" under Hosting Settings), or add a server block `return 301 https://www.muhammedikbalbakirci.com$request_uri;` for the bare host.
- Verify: `curl -sI https://muhammedikbalbakirci.com/hakkinda` returns single 301 to `https://www.muhammedikbalbakirci.com/hakkinda`.

### H3. No IndexNow and no custom 404 page
- Evidence: no key file in `public/`; `src/pages` has no `404.astro`, `dist/` has no 404.html (production 404 is the nginx default, confirmed 404 status code for `/yok-boyle`, which is correct, but unbranded with no navigation). Because Sprint 1 removes pages (410 rules in `ana-domain-nginx-yonlendirmeler.conf`), a helpful 404/410 page matters.
- Fix: add `src/pages/404.astro` using BaseLayout with `noindex`, links to /blog, /longevity, /medikal-estetik; add `error_page 404 /404.html;` and `error_page 410 /404.html;` (keep the status codes). For IndexNow: add `public/<key>.txt` and ping `https://api.indexnow.org/indexnow` after each deploy (Bing/Yandex/Naver only; Google ignores it). Medium value for a Turkish site that gets Yandex/Bing traffic.
- Verify: `curl -sI /yok-boyle` is 404 with branded body; IndexNow endpoint returns 200/202.

## Medium

### M1. Security headers absent on production
- Evidence: `curl -sI https://www.muhammedikbalbakirci.com/hakkinda` shows only Server, Content-Type, Cache-Control: no-cache, must-revalidate, X-Powered-By: PleskLin. No HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, CSP.
- Fix (extra nginx directives): `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always; add_header X-Content-Type-Options nosniff always; add_header X-Frame-Options SAMEORIGIN always; add_header Referrer-Policy strict-origin-when-cross-origin always;` Start CSP in Report-Only. Remove `X-Powered-By` if possible. Only HTTPS itself is a (light) ranking signal, so this is hygiene.
- Verify: securityheaders.com grade A/B.

### M2. Caching: `Cache-Control: no-cache, must-revalidate` on HTML (ok) but check on assets
- Evidence: HTML header seen on prod. Not measured for /assets and /_astro (hashed files should be `max-age=31536000, immutable`). `/style.css`, `/mobile-menu.css`, `/script.js` in `public/` are unhashed, so they cannot be immutable.
- Fix: in nginx set long cache for `/_astro/` and `/assets/`; move CSS/JS to Astro-processed imports for hashing, or add a `?v=` build token.
- Verify: `curl -sI https://www.muhammedikbalbakirci.com/_astro/<file>` shows long max-age. Check gzip/brotli is on (`curl -sI -H 'Accept-Encoding: br'`); not measured here.

### M3. Image weight and missing dimensions
- Evidence: 11 webp files over 150 KB in `public/assets/images/generated/` (e.g. `exercise.webp`; `public/assets` totals 8.1 MB); homepage hero `dr-muhammed-ikbal-bakirci.jpg` is 84 KB JPG 682x1024 (LCP candidate, has `fetchpriority="high"`, width/height set: good). Article featured image `<img class="article-body__featured-img" loading="eager">` in `dist/blog/*/index.html` has no width/height (CLS risk, source of: `src/pages/blog/[slug].astro`). Related-card images alt is generic "İlgili yazı görseli"; homepage article cards use `alt=""`.
- Fix: add `width`/`height` (1200x800 as elsewhere) and `fetchpriority="high"` to the featured img in `[slug].astro`; recompress the largest webp files (target < 120 KB); give card images descriptive alt = post title.
- Verify: PageSpeed Insights mobile CLS <= 0.1, LCP <= 2.5 s on a blog URL after deploy (needs real measurement).

### M4. Long titles (SERP truncation)
- Evidence: many blog titles exceed about 60 characters, e.g. `/blog/botoks` is "Botulinum Toksin (Botoks): Mimik Kırışıklıklar, Masseter Uygulaması ve Bilinmesi Gerekenler — Dr. Muhammed İkbal Bakırcı" (about 125 chars; 20 posts are over 110 incl. brand suffix). Google truncates, and the key terms are early so impact is moderate.
- Fix: in the layout/title builder, drop the brand suffix on posts when the title exceeds 60 chars (`src/layouts/BaseLayout.astro` / `src/lib/seo.ts`), or shorten `title` front matter in `src/content/blog/*.md`.
- Verify: crawl titles; target <= 65 chars incl. brand.

### M5. Person schema is thin; no sameAs / worksFor / MedicalWebPage
- Evidence: `dist/index.html` JSON-LD graph has Person (name, url, image, jobTitle), WebSite, WebPage, BreadcrumbList only. No `sameAs`, `worksFor` (VM Medical Park Bursa), `knowsAbout`, `alumniOf`. Blog posts: Article with `author`/`publisher` both referencing the Person @id (valid, but Article `publisher` should ideally be Organization/Person with name+logo; `dateModified` equals `datePublished`). Blog index has breadcrumb.
- Fix: extend the Person node in `src/layouts/BaseLayout.astro` with `worksFor`, `sameAs` (real profiles only), `medicalSpecialty`/`knowsAbout`; add real `dateModified` from a front-matter `updated` field. YMYL medical content benefits from clear author entity. Defer detailed schema work to seo-schema.
- Verify: Rich Results Test / schema validator shows no errors; Search Console enhancements clean.

## Low

- L1. `llms.txt` absent (404 on staging); optional, no ranking effect. Not a failure.
- L2. `prefetchAll: true` with hover strategy and Astro ClientRouter (view transitions, 13 KB JS in `_astro/ClientRouter...js`): fine, but ClientRouter swaps pages client-side; confirm analytics/ad scripts (none present now) re-run. No `pushState` back-button hijacking found in src or public JS (grep returned nothing in project code; ClientRouter uses history API for normal navigation only).
- L3. Only one hreflang (`tr`, self) on pages: harmless; remove or keep, no multi-language needed.
- L4. `www` vs `muhammedikbalbakirci.com` sitemap references use www consistently: ok.
- L5. 68 pages count: sitemap has 68 URLs (matches 68 HTML files in dist). Sitemap lacks lastmod for static pages (Google mostly ignores lastmod unless accurate); fine.
- L6. Staging 404 for `/sitemap-index.xml` is expected; site uses `/sitemap.xml` custom endpoint (`src/pages/sitemap.xml.ts`).

## What works
- Static Astro SSG: 100% of content in raw HTML, no CSR/SPA risk; canonical, robots meta (`index, follow`, BaseLayout.astro:49), title, description, OG/Twitter, JSON-LD all server-rendered.
- Every one of 68 pages has a unique self-referencing canonical to the production domain, one meta description, exactly one h1; no duplicate canonicals.
- Valid sitemap at `/sitemap.xml` (68 URLs, listed in robots.txt on production), production robots.txt allows crawling.
- `lang="tr"`, `og:locale tr_TR`, viewport `width=device-width, initial-scale=1.0` (the old staging page of surge itself has user-scalable=no but that is Surge's 404 page; the project has no `user-scalable`/`maximum-scale`).
- Self-hosted Roboto woff2 with `font-display:swap` and preloads for 400/700; hero image has `fetchpriority="high"` and dimensions; below-fold images use `loading="lazy"` + dimensions; CSS about 50 KB, page JS tiny (2 KB + 13 KB router).
- HTTP to HTTPS redirect works on www; old content mapped by 301 to the eski subdomain and removed pages return 410 (`ana-domain-nginx-yonlendirmeler.conf`); unknown URLs return real 404.
- Homepage HTML only 22 KB (far under Googlebot 2 MB limit).

## Not measured
Core Web Vitals (no PSI/CrUX), compression, asset cache headers, real mobile rendering, touch-target sizes (hamburger/mobile menu CSS not rendered).
