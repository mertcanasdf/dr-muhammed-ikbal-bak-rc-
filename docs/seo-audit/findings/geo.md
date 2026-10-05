# GEO / AI Search Readiness Audit (2026-10-05)
Target: dr-bakirci-revizyon.surge.sh (canonical https://www.muhammedikbalbakirci.com). Static Astro 5 build, tr-TR.

## Score: 66/100
| Dimension | Weight | Score | Note |
|---|---|---|---|
| Citability | 25 | 72 | Answer-first headings in newer posts, 55/55 have Kaynaklar, but few stats; older posts open narratively |
| Structural readability | 20 | 78 | H2/H3 hierarchy, lists, takeaways front matter; 105 question headings across 55 posts |
| Multi-modal | 15 | 45 | Cover images only; no video/YouTube, no tables/charts |
| Authority & brand | 20 | 55 | Byline + bio, but Person schema thin (no sameAs), dateModified == datePublished, unverified claims |
| Technical access | 20 | 85 | Static HTML (no JS dependency), sitemap with lastmod, robots allow; staging blocks all |

## AI crawler access (source public/robots.txt = `User-agent: * / Allow: /` + Sitemap; live www matches)
| Bot | Governs | Status |
|---|---|---|
| OAI-SearchBot | ChatGPT Search citability | Allowed (default) |
| Claude-SearchBot | Claude search citability | Allowed (default) |
| PerplexityBot | Perplexity search | Allowed (default) |
| Googlebot | Google Search / AI Overviews / AI Mode | Allowed |
| Bingbot | Bing / Copilot | Allowed |
| GPTBot | OpenAI training only | Allowed (default) |
| ClaudeBot | Anthropic training only | Allowed (default) |
| Google-Extended | Gemini/Vertex training+grounding (not Search/AIO) | Allowed (default) |
| Applebot-Extended | Apple Intelligence training only | Allowed (default) |
| CCBot / cohere-ai | training | Allowed (default) |
Training bots allowed by default is a licensing choice, not a visibility issue.

## llms.txt: missing on www (404) and surge (host HTML 404 page). RSL 1.0: absent.
Evidence view: Google states llms.txt is not needed and neither helps nor hurts; no major provider confirmed using it. Weight 0 in score.

## Findings

### G1 HIGH - Surge staging serves `Disallow: /`
Evidence: curl https://dr-bakirci-revizyon.surge.sh/robots.txt returns `User-agent: *` + `Disallow: /`, while source public/robots.txt is `Allow: /`. Staging file differs from source.
Fix: Fine for staging, but make sure production ships public/robots.txt unchanged; never promote the staging artifact as is.
Check: after cutover `curl -s https://www.muhammedikbalbakirci.com/robots.txt` shows Allow: / and the Sitemap line; Search Console URL Inspection is not "blocked by robots.txt".

### G2 HIGH - Person schema: no sameAs, per-page image, unverified jobTitle (src/lib/seo.ts, buildSiteStructuredData)
Evidence: Person node has name, url, image, jobTitle "Hekim, sağlık yöneticisi ve akademisyen". Image is the per-page cover (e.g. otofaji-nedir.webp), so the Person image changes on every page. No sameAs, worksFor, alumniOf. The CV doc flags "akademisyen"/doktora completion as unconfirmed.
Fix: make Person static: `@type: ["Person","Physician"]`, `image: DEFAULT_IMAGE` (portrait), `jobTitle: "Başhekim"`, `worksFor: {"@type":"Hospital","name":"VM Medical Park Bursa Hastanesi","url": <Medical Park profile>}`, `alumniOf` Atatürk Üniversitesi Tıp Fakültesi, `sameAs: [LinkedIn https://www.linkedin.com/in/muhammed-ikbal-bakirci-221ab3243/, medicalpark.com.tr doctor profile, Doktortakvimi profile (drmuhammedikbalbakirci.com), YouTube, Instagram, Wikidata when created]`. Drop "akademisyen" until confirmed.
Check: schema validator shows Person with sameAs and identical @id/image on all pages.

### G3 HIGH - Article authorship/freshness signals weak
Evidence: src/pages/blog/[slug].astro ~line 26 `dateModified: date.toISOString()` (always equals publish date). No visible "Son güncelleme", no medical reviewer. Author bio says "2008 yılından bu yana" hekimlik, while the CV doc has hekim from 2009 (2008 = graduation); the UN UNF representative claim is marked past/unsourced in the CV doc.
Fix: optional `updated` front matter; schema dateModified = updated ?? date; show "Son güncelleme" under H1; add `reviewedBy` (same Person @id) on health posts; correct bio to confirmed CV lines (verify with Dr. Bakırcı) and link the bio name to /hakkinda.
Check: Article JSON-LD dateModified differs from datePublished after a refresh; bio text matches verified CV.

### G4 MEDIUM - Off-site brand/entity footprint thin (not fully verified)
Evidence: site code has no links to YouTube/LinkedIn/Instagram profiles (only share buttons). CV doc lists LinkedIn, Medical Park profile and Doktortakvimi page as existing. Live web check was inconclusive: Bing fetch returned irrelevant store-locator results, DuckDuckGo connection reset; I could not confirm how the brand appears in ChatGPT/Perplexity/AIO or whether a Knowledge Panel exists. DataForSEO unavailable. Treat as not measured.
Fix (in order): 1) Footer + /hakkinda "Profiller" block linking LinkedIn, Medical Park, Doktortakvimi, YouTube; use the exact name "Dr. Muhammed İkbal Bakırcı" everywhere. 2) YouTube channel with short Turkish explainers of top posts, embedded in matching posts (YouTube mentions are the strongest correlate, ~0.737, third-party Ahrefs data). 3) Wikidata item (physician, employer VM Medical Park Bursa, education, official website) backed by 2+ independent references; a Wikipedia article likely fails notability now, do not force it. 4) Claim the Knowledge Panel only after consistent profiles/Wikidata exist. 5) No mention-farming.
Check: monthly queries "Dr. Muhammed İkbal Bakırcı kimdir" in Google, ChatGPT, Perplexity; record whether the canonical site and Medical Park profile are cited with correct title (Başhekim, VM Medical Park Bursa).

### G5 MEDIUM - Citability strengths and gaps
Evidence (55 posts, ~26.5k words, ~480 words/post): 55/55 have a Kaynaklar section with PubMed/NIH/CDC links; 105 question-form H2s; newer posts (insulin-direnci-belirtileri) open with "X nedir?" plus a 1-2 sentence definition; older posts (otofaji-nedir, botoks) put two narrative paragraphs before the definition H2. Statistics sparse; hedged wording is correct for YMYL but yields few extractable figures. insulin-direnci-belirtileri links NIDDK with `?page_slug=alpha-lipolic-acid`, an unrelated query string.
Fix: in each post put a 40-60 word direct answer (definition + one sourced number) right after H1; start each H2 with a 1-2 sentence answer; add 3-5 visible "Sık sorulan sorular"; add comparison tables (PRP vs eksozom, 16:8 vs 5:2); cite trial results with year (TREAT JAMA IM 2020 pattern is good). Remove the odd page_slug param. Prioritize: insulin-direnci-belirtileri, d3-vitamini-eksikligi, botoks, prp-mi-eksozom-mu, aralikli-oruc-longevity.
Check: each target post has a standalone 40-60 word answer within the first 150 words; Search Console impressions for question queries rise over 8-12 weeks.

### G6 MEDIUM - Multi-modal gap
Evidence: no video embeds, no data tables/charts; images are covers (generated/stock) with little informational value.
Fix: one original diagram or table per pillar post; YouTube embeds (G4); descriptive alt text.
Check: at least 10 pillar posts contain a table/diagram/video.

### G7 LOW - llms.txt (optional)
Fix: public/llms.txt with `# Dr. Muhammed İkbal Bakırcı`, a one-line description (Başhekim VM Medical Park Bursa; longevity and medikal estetik, kanıta dayalı Türkçe içerik) and links to /hakkinda, /longevity, /medikal-estetik, /blog, /rehberler. No expected Google gain.
Check: /llms.txt returns 200 text/plain.

### G8 LOW - Explicit AI-crawler policy
Fix: keep search bots allowed; add explicit `Allow: /` groups for OAI-SearchBot, Claude-SearchBot, PerplexityBot for documentation. Block training bots (GPTBot, ClaudeBot, CCBot, Google-Extended, Applebot-Extended) only if there is a licensing preference; it does not affect Google Search/AIO or ChatGPT Search.
Check: robots.txt tester shows intended status per bot.

## Positives
Static pre-rendered HTML, sitemap with lastmod, canonical + BreadcrumbList + Article schema, consistent SITE_NAME, visible takeaways + Kaynaklar, safety caveats (good YMYL practice), inLanguage tr-TR.

## Top 5 changes
1. Rebuild Person/Physician schema with sameAs, static portrait, worksFor, sourced jobTitle (G2) - 1-2 h
2. Real dateModified + visible update date + reviewer; fix bio facts (G3) - 2-3 h plus CV confirmation
3. Answer-first 40-60 word block in top 15 posts + FAQ (G5) - 1-2 days
4. YouTube channel + profile links in footer/hakkinda, Wikidata item (G4) - 1-2 weeks
5. Verify production robots.txt, add explicit AI-bot groups (G1, G8) - 15 min

## Platform readiness (qualitative, not measured with a tool)
Google AIO/AI Mode: good technical base, depends on classic ranking and entity strength. ChatGPT: access fine, entity/Wikipedia/Reddit/YouTube presence weak. Perplexity: access fine, community presence absent. Bing Copilot: add Bing Webmaster verification and IndexNow.

## JSON findings (AI Search Readiness)
[{"id":"G1","severity":"high"},{"id":"G2","severity":"high"},{"id":"G3","severity":"high"},{"id":"G4","severity":"medium"},{"id":"G5","severity":"medium"},{"id":"G6","severity":"medium"},{"id":"G7","severity":"low"},{"id":"G8","severity":"low"}]
