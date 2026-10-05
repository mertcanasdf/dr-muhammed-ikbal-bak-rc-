# Sitemap audit - muhammedikbalbakirci.com (2026-10-05)
Score: 78/100

Scope: new build (surge, byte-identical to dist/sitemap.xml), production sitemap, src/pages/sitemap.xml.ts, public/robots.txt, nginx 410 conf.

## Validation summary
| Check | Result |
|---|---|
| Valid XML, urlset namespace, UTF-8 | PASS |
| URL count (68) vs 50k / 50MB limits | PASS |
| Generated from code (src/pages/sitemap.xml.ts, getCollection + 13 static routes), dedup + sorted | PASS |
| Sitemap == dist pages (68 index.html in dist == 68 sitemap URLs, 0 diff) | PASS |
| All canonicals in dist equal sitemap loc (no trailing slash, https, www) | PASS (68/68) |
| noindex / meta refresh in dist | PASS (none) |
| 410 URLs (basari-hikayeleri, podcast, kurslar, soylesiler) absent from new sitemap | PASS (still listed in PRODUCTION sitemap until deploy) |
| priority/changefreq absent | PASS |
| robots.txt (public/robots.txt) has Sitemap: absolute URL | PASS |
| lastmod valid W3C date | PASS format, WEAK accuracy (F2, F3) |

New vs prod: +30 blog posts, -4 removed pages (/basari-hikayeleri, /kurslar, /podcast, /soylesiler).
Quality gates: no location pages; not applicable.

## Findings

### F1 - HIGH - Production host 301s every non-root sitemap URL to a trailing-slash form, while canonical is slashless
Evidence: curl -I https://www.muhammedikbalbakirci.com/blog/botoks -> 301 to /blog/botoks/ (nginx/Apache directory redirect, text/html iso-8859-1); the /blog/botoks/ page returns 200 with canonical https://www.muhammedikbalbakirci.com/blog/botoks. Same on surge. Every sitemap URL (67 of 68) is therefore a redirect and canonical/redirect disagree (conflicting signals). Directory-style output (dist/blog/botoks/index.html) causes this.
Fix: either (a) server: serve directory index without redirect, e.g. in Plesk additional nginx directives `location / { try_files $uri $uri.html $uri/index.html =404; }` (and ensure no `absolute_redirect`/dir-slash 301: add `location ~ ^(.+)/$ {}` unnecessary if try_files used), or (b) switch astro.config.mjs to `build: { format: 'file' }` so dist/blog/botoks.html is emitted, and serve with `try_files $uri $uri.html =404`. Keep trailingSlash:'never'.
Success check: `curl -sI https://www.muhammedikbalbakirci.com/blog/botoks` returns 200 with no Location header; same for / hakkinda, /blog.

### F2 - MEDIUM - 30 of 55 post lastmod values are identical (2026-09-15) and lastmod = publish `date`, not modification date
Evidence: dist/sitemap.xml: 30x 2026-09-15 (batch publish/refresh), 8x 2026-06-21. JSON-LD dateModified in [slug].astro:26 also = date. Suspiciously uniform lastmod will be ignored by Google.
Fix: add optional `updated: z.coerce.date().optional()` to the blog collection schema (src/content.config.ts), set it in frontmatter only when content truly changed, then in src/pages/sitemap.xml.ts use `(post.data.updated ?? post.data.date).toISOString().slice(0,10)`, and in [slug].astro:26 `dateModified: (updated ?? date).toISOString()`.
Success check: sitemap lastmod values vary with real edit dates; JSON-LD dateModified matches.

### F3 - LOW - 13 static pages have no lastmod
Evidence: `<url><loc>https://www.muhammedikbalbakirci.com/</loc></url>` etc. Omitting is valid but loses freshness signal for hub pages (/blog, /medikal-estetik, /longevity).
Fix: in sitemap.xml.ts give /blog the max post date, and hubs the max date of their linked posts; leave legal pages (gizlilik, kullanim-kosullari) without lastmod or use a manual constant.
Success check: /blog lastmod equals newest post date.

### F4 - MEDIUM - Production sitemap still lists 4 pages that the conf makes 410, and the 410 conf is not yet live
Evidence: prod sitemap contains /basari-hikayeleri, /kurslar, /podcast, /soylesiler; `curl -I .../basari-hikayeleri/` returns 200 today. New build correctly omits them.
Fix: deploy the new build and the ana-domain-nginx-yonlendirmeler.conf together, then resubmit sitemap in Search Console. Note the conf's regex `^/(...)/?$` matches both slash forms, good.
Success check: the 4 URLs return 410, absent from sitemap.xml.

### F5 - LOW - /icerik/biyografi and /icerik/gece-yolculugu-dua-si stub claim in conf is not true for dist
Evidence: conf comment says these "zaten mevcut" in the new build, but dist/ has no icerik directory (production currently 301-slashes /icerik/biyografi, i.e. old content exists). After deploy they will 404 unless redirected.
Fix: add to nginx conf `location ~ ^/icerik/(biyografi|gece-yolculugu-dua-si)/?$ { return 301 /hakkinda; }` or create the stub pages. Keep them out of the sitemap (they are not there).
Success check: both URLs return 301 -> /hakkinda (200).

### F6 - INFO - Image sitemap opportunity
Evidence: no image: namespace; 55 article covers (/assets/images/generated/articles/*.webp from frontmatter `image`) plus page images.
Fix (optional, modest value): in sitemap.xml.ts add `xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"` and per post `<image:image><image:loc>${getCanonicalUrl(post.data.image)}</image:loc></image:image>` (only image:loc is supported now; no caption/title). Ensure og:image is already present (it is).
Success check: sitemap validates; Search Console shows images discovered.

### F7 - INFO - Surge staging robots.txt is "Disallow: /"
Evidence: https://dr-bakirci-revizyon.surge.sh/robots.txt serves `User-agent: *\r\nDisallow: /` (differs from dist/robots.txt, which allows all; surge injects this for staging). Fine for staging, but the sitemap declares www canonical URLs, so staging cannot be crawled for verification. Confirm production robots.txt after deploy remains `Allow: /` with Sitemap line (currently correct on prod).

### F8 - INFO - Sitemap not lastmod-indexed / no index file
68 URLs; a single urlset is appropriate. Add Content-Type check on static hosting (served as application/xml by Astro build file; verify .xml MIME on Plesk).

## Missing pages (crawl vs sitemap)
None: all 68 built indexable pages are in the sitemap. 404 page: dist has no 404.html (not a sitemap issue, but add src/pages/404.astro with noindex so unknown URLs return a proper 404).

## Extra pages (sitemap but non-200/redirected)
New sitemap: 67 URLs 301 on the host's slash redirect (F1). Production sitemap: 4 soon-410 URLs (F4).
