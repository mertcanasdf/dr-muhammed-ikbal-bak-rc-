# Cluster / Content Architecture Findings (seo-cluster)

Site: Dr. Muhammed İkbal Bakırcı (longevity + medikal estetik), 55 posts, TR.
Date: 2026-10-05. Score: **44 / 100** (Content Architecture).

Method note: SERP data came from about 10 WebSearch queries (Turkish). Pairwise top-10 URL counting for every pair was not feasible. Overlap bands below are estimates from SERP intent and result types, not exact counts. They are marked "est.". Verify the key pairs in GSC (queries sharing the same landing URLs) before executing merges.

## 0. Score breakdown

| Dimension | Score | Why |
|---|---|---|
| Cluster structure vs. categories | 12/20 | 6 clear areas on /longevity, plus /medikal-estetik. No pillar *articles*. Hubs show only 3 of 8-14 posts per area. |
| Internal linking | 5/25 | 0 in-body internal links in all 55 posts. Links exist only in the sidebar `relatedArticles` (max 3, full title as anchor), hub cards and the blog index. |
| Cannibalization control | 10/15 | 2 real overlaps (PRP, uyku-bozuklukları vs. uyku cluster). Other pairs are separable. |
| Depth / thin content vs. spec (spoke 1200-1800 words) | 3/20 | Median post is about 400 words (`wc` counts frontmatter, so real body is lower). Range 348-801. |
| Topic coverage vs. Turkish SERP demand | 8/10 | Good breadth of topics. Missing high-intent aftercare/duration/price-adjacent and test (ApoB, HbA1c) topics. |
| Orphan/inbound health | 6/10 | 5 posts have zero inbound links from posts or hubs (see F-5). |

## 1. Cluster map (existing posts)

No post currently functions as a pillar. Interim pillars are hub pages/anchors: `/longevity#<area>` and `/medikal-estetik`. Plan: promote one existing post per cluster to "pillar-guide" status, or write a new pillar (2500-4000 words) and keep the hub page as the index.

Note: 7 clusters exceed the skill's 2-5 limit and several have more than 4 spokes. This follows the site's own 6-area IA, so I kept it. Sub-clusters are marked.

**C1 Skin Longevity & Medikal Estetik** — pillar: `/medikal-estetik` (+ new pillar "Skin Longevity Rehberi")
- 1a Koruma ve bakım: gunes-kremi-nasil-secilir, retinoid-nedir, cilt-bariyeri-nasil-guclendirilir, ciltte-kollajen-kaybi
- 1b Enjeksiyon: botoks, botoks-sonrasi-dikkat-edilmesi-gerekenler, dermal-dolgu, dermal-dolgu-guvenligi
- 1c Rejeneratif/enerji: prp-eksozom (absorbs prp-mi-eksozom-mu), mezoterapi, altin-igne, cilt-genclesmesi-kombinasyon-tedavileri, senolitik-tedaviler-cilt-genclesmesi-zombi-hucreler

**C2 Hücresel Longevity Bilimi** — pillar: biyolojik-yas-nasil-olculur (broadest; promote and expand) / `/longevity#otofaji`
- otofaji-nedir, mitokondri-sagligi-nasil-desteklenir, telomerleri-korumak, nmn-nad-yaslanma, sirt6-proteini-epigenetik-genclesme

**C3 Beslenme** — pillar: `/longevity#beslenme` (new pillar: "Longevity Beslenmesi")
- 3a Düzen: mavi-bolge-diyeti, aralikli-oruc-longevity, lifli-beslenme-ve-mikrobiyota, protein-ihtiyaci-yaslanma, insulin-direnci-belirtileri
- 3b Mikrobesin/takviye: d3-vitamini-eksikligi, d3-k2-birlikte-kullanilir-mi, magnezyum-eksikligi, omega-3-ne-ise-yarar, polifenoller-ve-saglik

**C4 Hareket** — pillar: `/longevity#hareket` (new pillar: "Longevity için Egzersiz Reçetesi")
- 4a Kardiyo: vo2max-ve-longevity, bolge-2-kardiyo, gunluk-yuruyus-sagligi, hareketsizlik-ve-metabolik-saglik
- 4b Güç/kas: direnc-antrenmani-yaslanma, kas-kutlesi-ve-yaslanma, kavrama-gucu-ve-saglik, kreatin-ve-yaslanma, denge-egzersizleri-yaslanma, egzersiz-sonrasi-toparlanma

**C5 Uyku** — pillar: uyku-kalitesi-nasil-artirilir (promote) / `/longevity#uyku`
- sirkadiyen-ritim-ve-uyku, ekran-kullanimi-ve-uyku, uyku-bozukluklari-ve-glymphatic-temizlik

**C6 Zihin ve Sosyal Yaşam** — pillar: kortizol-yaslanma / `/longevity#zihin`
- 6a Stres/tükenmişlik: tukenmislik-sendromu, dijital-tukenmislik, anksiyete-ve-obsesyonun-fizyolojisi, muzik-ve-stres-kortizol, doga-ve-zihin-sagligi
- 6b Bilişsel/sosyal: kitap-okuma-ve-beyin, sanat-ve-beyin-sagligi, sosyal-baglanti-ve-uzun-omur, yasam-amaci-ve-longevity, sukran-pratigi-ve-dopamin

All 55 posts assigned (14 + 5 + 10 + 10 + 4 + 11 = 54, plus the PRP duplicate = 55).

## 2. Findings (priority order)

### F-1 [HIGH] Zero in-body internal links; relatedArticles is the only post-to-post link layer
- Evidence: `grep '](/blog/'` over all 55 files returns 0. `[slug].astro` lines 241-249 render `relatedArticles` only as a sidebar card list (max 3, anchor = full article title, with image).
- Change: add 2-4 contextual in-body links per post using the matrix in section 4, with descriptive Turkish anchors. Keep relatedArticles but fix mismatches (F-4).
- Success check: `grep -c '](/blog/'` is at least 3 per file. Every post has at least 3 inbound body links. Crawl shows 0 orphans.

### F-2 [HIGH] Thin content versus spoke target (1200-1800 words)
- Evidence: word counts including frontmatter: 40 of 55 posts are under 500 words (e.g. cilt-bariyeri 373, ciltte-kollajen-kaybi 361, dermal-dolgu-guvenligi 363, botoks-sonrasi 378, retinoid-nedir 346, sirkadiyen-ritim 349). Largest is 801 (mavi-bolge-diyeti). Each has about 3 H2s. Competing Turkish SERPs for these queries are hospital/clinic pages (Memorial, Acıbadem, Medicana, Medipol) that cover the topic more fully.
- Change: expand priority posts to 900-1500 words. Order: botoks-sonrasi, dermal-dolgu-guvenligi, cilt-bariyeri, retinoid-nedir, ciltte-kollajen-kaybi, sirkadiyen, uyku-kalitesi, kreatin, kas-kutlesi. Add a clinician-authored section ("Klinik pratikte...") for E-E-A-T. Add FAQ blocks (PAA questions) and a medical reviewer line.
- Success check: median body at least 900 words. Top-9 posts at least 1200 words. Each has an FAQ with 4+ Q&As.

### F-3 [HIGH] Cannibalization pair 1: prp-eksozom vs prp-mi-eksozom-mu — MERGE
- Evidence: both have the same entity pair and the same intent (PRP vs eksozom, kanıt/güvenlik). prp-eksozom already has an H2 "PRP ve Eksozom Arasındaki Fark" and prp-mi-eksozom-mu is a 375-word subset ("PRP nedir? / Eksozom nedir? / Hangi sorular sorulmalı?"). SERP for "PRP mi eksozom mu fark" is entirely comparison/explainer pages (Milli Gazete, Vogue TR, drcanergin, altineksozom, dermaclinic...), so est. overlap with "PRP eksozom" is 7+ (same-post band). Only 1 in-site link points to the thin one.
- Change: canonical = `/blog/prp-eksozom` (hub-linked, longer). Retitle to "PRP mi Eksozom mu? Farkları, Kanıtlar ve Güvenlik". Move the "Hangi sorular sorulmalı?" section into it. Delete prp-mi-eksozom-mu and add a redirect (Astro `redirects` generates a meta-refresh page on surge; use 301 on the real host). Update the 1 inbound link. Add a short comparison table (kaynak, etki derinliği, kanıt düzeyi, yan etki, ürün güvenliği/ruhsat).
- Success check: one URL ranks for both queries in GSC. The old URL returns 301/redirect. Table present.

### F-4 [HIGH] relatedArticles quality: topical mismatches and a "senolitik" default
- Evidence (examples): altin-igne, botoks, dermal-dolgu, mezoterapi, prp-eksozom all point their 1st related item to senolitik-tedaviler (generic fallback). prp-mi-eksozom-mu and botoks-sonrasi point to dermal-dolgu-guvenligi. sanat-ve-beyin-sagligi and sukran-pratigi point to otofaji-nedir (unrelated). kitap-okuma points to nmn-nad. doga-ve-zihin points to d3. uyku-bozukluklari points to otofaji. 8 posts have only 1 related item (anksiyete is at 2, doga, kitap, muzik, sanat, sukran, tukenmislik, yasam-amaci at 1).
- Change: replace per the matrix (section 4), set 3 related items per post, same cluster first.
- Success check: at least 2 of 3 related items per post are from the same cluster. No post has fewer than 3.

### F-5 [HIGH] Orphan / weakly linked posts
- Evidence: no inbound relatedArticles link and no hub card (longevity.astro, medikal-estetik.astro) for: kitap-okuma-ve-beyin, kreatin-ve-yaslanma, muzik-ve-stres-kortizol, sanat-ve-beyin-sagligi, uyku-bozukluklari-ve-glymphatic-temizlik (reachable only via /blog index). 1 inbound only: altin-igne, bolge-2-kardiyo, egzersiz-sonrasi-toparlanma, magnezyum-eksikligi, prp-mi-eksozom-mu, sosyal-baglanti, tukenmislik-sendromu.
- Change: add all five to hub area lists and to the matrix links below. Increase `posts:` in longevity.astro from 3 to 4-6 per area (see F-6).
- Success check: every post has at least 3 inbound internal links.

### F-6 [MEDIUM] Hub pages expose only 22 of 55 posts; no pillar content
- Evidence: longevity.astro `posts:` arrays hold 3 per area, plus 4 in the `cellular` array. Beslenme has 10 posts but shows 3; Hareket has 10 but shows 3; Zihin has 11 but shows 3 (anksiyete, kortizol-yaslanma on estetik page only). medikal-estetik.astro mixes longevity-science cards (d3, nmn, telomer, sirt6, anksiyete) into a "medical aesthetics" page, diluting its topical focus. Also botoks-sonrasi, dermal-dolgu-guvenligi, prp-mi-eksozom-mu are on neither hub.
- Change: (a) make each area list 5-6 links grouped by sub-cluster (3a/3b etc.); (b) add a "Tüm yazılar" link to `/blog?kategori=...` if supported; (c) on /medikal-estetik keep only skin posts (C1 plus senolitik) in the main card grid and move the "Longevity" cards to a small related strip; (d) add the 3 missing C1 posts to /medikal-estetik.
- Success check: hub pages link to at least 80 percent of cluster posts (at most 2 clicks from `/`).

### F-7 [MEDIUM] Cannibalization pair 2: dermal-dolgu vs dermal-dolgu-guvenligi — DIFFERENTIATE (keep both)
- Evidence: SERP for "dermal dolgu güvenliği işlem öncesi" returns general dermal dolgu pages plus a few "dikkat edilmesi gerekenler" pages (Acıbadem, Dermatoz komplikasyonlar, Handearda, Onedio): est. overlap 4-6 (same-cluster band, not same-post). Both posts carry an "Olası Riskler / Riskler neler olabilir?" H2 and a "dolgu nedir" intro, which creates a duplication risk.
- Change: dermal-dolgu = pillar-style overview (HA, bölgeler, kontür analizi, süre, fiyat faktörleri); remove its "Olası Riskler" H2 and replace with a 2-sentence summary linking to güvenlik. dermal-dolgu-guvenligi = checklist only (kontrendikasyon, ilaç/takviye 5-7 gün morarma, ürün/ruhsat doğrulama, uygulayıcı, vasküler komplikasyon acil belirtiler). Remove the "Dermal dolgu nedir?" H2 (link to dermal-dolgu). Retitle güvenlik to "Dermal Dolgu Öncesi Kontrol Listesi ve Güvenlik Soruları".
- Success check: no shared H2 between the two. Each has a distinct H1/primary keyword. GSC shows no query where both URLs alternate.

### F-8 [MEDIUM] Cannibalization pair 3: botoks vs botoks-sonrasi — KEEP SEPARATE, tighten
- Evidence: "botoks sonrası dikkat edilmesi gerekenler" SERP is all aftercare pages (Medipol, Esteworld, Medicana, drenesyigit, Nera, hospitalturk...) with distinct intent from the mechanism/indications page. Est. overlap 2-3 (interlink band). botoks has an "Olası Yan Etkiler" H2 that borders on aftercare/risks.
- Change: botoks-sonrasi: add a timeline (ilk 4-6 saat, 24 saat, 3 gün, 2 hafta kontrol), concrete do/don't list (yüz üstü yatma, sauna, egzersiz 24 saat, alkol), and "acil durumlar" (ptozis, görme/yutma, nefes). Keep the primary keyword exactly "botoks sonrası dikkat edilmesi gerekenler". botoks: keep mechanism + masseter, and link out to aftercare and to the new etki-süresi post (section 5). Do not repeat the aftercare list in botoks.
- Success check: botoks-sonrasi is at least 1000 words with the timeline. botoks has no aftercare list.

### F-9 [MEDIUM] Cannibalization pair 4: uyku cluster (4 posts)
- uyku-kalitesi (hijyen, genel) vs sirkadiyen (ışık, vardiya, jet lag) vs ekran (mavi ışık): distinct sub-intents, est. overlap 2-4. KEEP, interlink. uyku-kalitesi is the pillar for this cluster.
- uyku-bozukluklari-ve-glymphatic-temizlik: the title promises "Kronik Uyku Bozuklukları" (an insomnia/apne intent that Turkish hospital pages own) but the content is glymphatic system, melatonin and a "Sirkadiyen Uyum Kılavuzu" H2 that duplicates sirkadiyen + uyku-kalitesi. The slug/title/intent mismatch weakens relevance and cannibalizes. DIFFERENTIATE: retitle to "Uyku ve Glimfatik Sistem: Beyin Geceleri Nasıl Temizlenir?", change slug to `uyku-ve-glimfatik-sistem` (301 from the old one), cut the sirkadiyen H2 into a link, and reserve "uyku bozuklukları" for a new post (F-12, uyku apnesi/insomni uyarı belirtileri).
- Success check: no H2 duplicated across the 4 posts; glymphatic post's primary keyword is glimfatik sistem.

### F-10 [LOW-MEDIUM] Other overlap pairs reviewed (no merge)
| Pair | Decision | Reason / action |
|---|---|---|
| cilt-genclesmesi-kombinasyon-tedavileri vs altin-igne vs prp-eksozom | Keep, differentiate | Title is "Altın İğne ve Eksozom Kombinasyonu" (not general). Rename slug/H1 consistent with that (or broaden to "kombinasyon tedavileri"). Link to both parents. It cites nothing the parents do not. |
| mezoterapi vs prp-eksozom | Keep | Different product class (nem aşısı, somon DNA). Add a "mezoterapi mi PRP mi" paragraph with links. |
| tukenmislik-sendromu vs dijital-tukenmislik | Keep | Different intent (clinical vs. digital habit). Cross-link. |
| kortizol-yaslanma vs muzik-ve-stres-kortizol vs anksiyete | Keep | muzik = intervention, anksiyete = condition. Both link to kortizol pillar. Retitle muzik post to drop "kortizol" as primary keyword if GSC shows kortizol-yaslanma losing impressions. |
| d3-vitamini-eksikligi vs d3-k2 | Keep | Deficiency vs. combination question. |
| aralikli-oruc vs otofaji vs sirt6 | Keep | Intent differs. Make sure sirt6 (a 2026 mouse study, news-like) is treated as a spoke of C2, not a pillar. |
| kas-kutlesi vs direnc-antrenmani vs kreatin vs protein-ihtiyaci vs kavrama-gucu | Keep | Same theme, distinct queries. A cross-cluster protein/kas link is essential (C3 to C4). |

### F-11 [MEDIUM] Longevity hub metrics (HbA1c < %5.2, ApoB < 80 mg/dL, DEXA, dinlenme kalp hızı) have no supporting posts
- Evidence: longevity.astro `metrics` cite HbA1c, ApoB, resting HR, DEXA. No post explains them. SERP for "apoB nedir kolesterol longevity" returns only a handful of Turkish pages (drmuhammedkeskin.com, talatpasatip.com, hekimoglugoruntuleme, mecev.org) and the rest are English or PubMed: low Turkish competition.
- Change: see F-12 topic list 1.

### F-12 [MEDIUM] Missing Turkish topics, prioritized (details in section 5)

## 3. Template / intent per post type (for briefs)
- Hub/pillar guides: ultimate-guide (informational broad).
- Mechanism posts (otofaji, telomer, mitokondri, nmn): explainer.
- Aftercare, checklist, tests (botoks-sonrasi, dolgu-guvenligi, ApoB): how-to / checklist.
- PRP mi eksozom mu, altın iğne vs ...: comparison.
- No transactional landing pages exist for treatments. If appointment conversion matters, add service pages (botoks, dolgu, PRP) separate from educational posts to avoid intent mixing. Out of scope for this finding but noted for the architecture.

## 4. Internal link matrix (from -> to, Turkish anchor)

Mandatory: every spoke -> its pillar and pillar -> every spoke. Recommended: spoke <-> spoke in cluster. Optional: cross-cluster. Each post gets 3 outgoing body links (P = pillar link). Use natural anchors in a sentence; variants allowed.

### C1 Skin (pillar `/medikal-estetik`; anchor "Skin Longevity ve medikal estetik")
- gunes-kremi-nasil-secilir: P; -> retinoid-nedir ("retinoid kullanırken güneş koruması"); -> cilt-bariyeri-nasil-guclendirilir ("cilt bariyerini koruyan rutin")
- retinoid-nedir: P; -> gunes-kremi-nasil-secilir ("geniş spektrumlu güneş kremi"); -> cilt-bariyeri-nasil-guclendirilir ("retinoid sonrası bariyer desteği")
- cilt-bariyeri-nasil-guclendirilir: P; -> retinoid-nedir ("retinol ve türevleri"); -> gunes-kremi-nasil-secilir ("SPF seçimi")
- ciltte-kollajen-kaybi: P; -> gunes-kremi-nasil-secilir ("fotoyaşlanma ve güneş koruması"); -> altin-igne ("kollajen indüksiyon tedavisi"); -> uyku-kalitesi-nasil-artirilir (optional, "uyku ve cilt onarımı")
- botoks: P; -> botoks-sonrasi-dikkat-edilmesi-gerekenler ("botoks sonrası dikkat edilmesi gerekenler"); -> dermal-dolgu ("dermal dolgu uygulamaları"); -> botoks-ne-kadar-surer (new, "botoks etkisi ne kadar sürer")
- botoks-sonrasi-dikkat-edilmesi-gerekenler: P; -> botoks ("botulinum toksin uygulaması"); -> gunes-kremi-nasil-secilir ("mineral güneş kremi"); -> egzersiz-sonrasi-toparlanma (optional, "işlem sonrası spor zamanlaması")
- dermal-dolgu: P; -> dermal-dolgu-guvenligi ("dermal dolgu öncesi kontrol listesi"); -> botoks ("botoks ve dolgu farkı"); -> cilt-genclesmesi-kombinasyon-tedavileri (optional)
- dermal-dolgu-guvenligi: P; -> dermal-dolgu ("hyaluronik asit dolgu nedir"); -> botoks-sonrasi-dikkat-edilmesi-gerekenler ("işlem sonrası bakım"); -> d3-k2... no (omit)
- prp-eksozom: P; -> mezoterapi ("cilt mezoterapisi"); -> altin-igne ("altın iğne ve eksozom"); -> cilt-genclesmesi-kombinasyon-tedavileri ("kombinasyon tedavileri")
- mezoterapi: P; -> prp-eksozom ("PRP mi eksozom mu"); -> senolitik-tedaviler... ("hücre yaşlanması ve cilt"); -> ciltte-kollajen-kaybi ("kollajen kaybı")
- altin-igne: P; -> cilt-genclesmesi-kombinasyon-tedavileri ("altın iğne ve eksozom kombinasyonu"); -> prp-eksozom ("eksozom uygulamaları"); -> ciltte-kollajen-kaybi ("kollajen kaybının nedenleri")
- cilt-genclesmesi-kombinasyon-tedavileri: P; -> altin-igne ("fraksiyonel radyofrekans"); -> prp-eksozom ("PRP ve eksozom farkı")
- senolitik-tedaviler-cilt-genclesmesi-zombi-hucreler: P; -> otofaji-nedir ("otofaji"), -> nmn-nad-yaslanma ("NAD+ ve hücresel yaşlanma"); -> ciltte-kollajen-kaybi
- Pillar `/medikal-estetik` -> all 14 C1 posts (currently 8 of 14 plus 5 non-skin cards).

### C2 Hücresel (pillar biyolojik-yas-nasil-olculur; anchor "biyolojik yaş nasıl ölçülür")
- otofaji-nedir: P; -> aralikli-oruc-longevity ("aralıklı oruç"); -> mitokondri-sagligi-nasil-desteklenir ("mitokondri sağlığı")
- mitokondri-sagligi: P; -> bolge-2-kardiyo ("bölge 2 kardiyo ve mitokondri"); -> nmn-nad-yaslanma ("NAD+")
- telomerleri-korumak: P; -> kortizol-yaslanma ("kronik stres ve telomer"); -> uyku-kalitesi-nasil-artirilir ("uyku ve telomer")
- nmn-nad-yaslanma: P; -> mitokondri-sagligi ("hücre enerji üretimi"); -> otofaji-nedir ("otofaji")
- sirt6-proteini-epigenetik-genclesme: P; -> nmn-nad-yaslanma ("sirtuinler ve NAD+"); -> aralikli-oruc-longevity ("kalori kısıtlaması ve oruç")
- biyolojik-yas-nasil-olculur: -> every C2 spoke; -> vo2max-ve-longevity ("VO2max"); -> new apob-nedir ("ApoB ve HbA1c")

### C3 Beslenme (pillar `/longevity#beslenme` -> later new pillar)
- mavi-bolge-diyeti: P; -> lifli-beslenme-ve-mikrobiyota ("lifli beslenme"); -> yasam-amaci-ve-longevity (cross, "ikigai ve yaşam amacı")
- aralikli-oruc-longevity: P; -> otofaji-nedir ("otofaji nedir"); -> insulin-direnci-belirtileri ("insülin direnci")
- protein-ihtiyaci-yaslanma: P; -> kas-kutlesi-ve-yaslanma ("kas kütlesini korumak"); -> kreatin-ve-yaslanma ("kreatin")
- lifli-beslenme: P; -> polifenoller-ve-saglik ("polifenol içeren besinler"); -> insulin-direnci-belirtileri
- insulin-direnci-belirtileri: P; -> hareketsizlik-ve-metabolik-saglik ("oturma süresi ve metabolik sağlık"); -> lifli-beslenme
- omega-3-ne-ise-yarar: P; -> polifenoller-ve-saglik ("polifenoller"); -> mavi-bolge-diyeti
- polifenoller: P; -> omega-3-ne-ise-yarar ("omega-3"); -> mavi-bolge-diyeti
- d3-vitamini-eksikligi: P; -> d3-k2-birlikte-kullanilir-mi ("D3 ve K2 birlikte"); -> magnezyum-eksikligi ("magnezyum eksikliği")
- d3-k2: P; -> d3-vitamini-eksikligi ("D3 eksikliği belirtileri"); -> magnezyum-eksikligi ("magnezyum ve D3 emilimi")
- magnezyum-eksikligi: P; -> d3-k2 ; -> uyku-kalitesi-nasil-artirilir (cross, "uyku düzeni")

### C4 Hareket (pillar `/longevity#hareket`)
- vo2max-ve-longevity: P; -> bolge-2-kardiyo ("bölge 2 kardiyo"); -> gunluk-yuruyus-sagligi ("günlük yürüyüş")
- bolge-2-kardiyo: P; -> vo2max-ve-longevity ("VO2max"); -> mitokondri-sagligi (cross)
- gunluk-yuruyus-sagligi: P; -> hareketsizlik-ve-metabolik-saglik ("uzun süre oturmak"); -> vo2max-ve-longevity
- hareketsizlik: P; -> gunluk-yuruyus ; -> insulin-direnci-belirtileri (cross)
- direnc-antrenmani-yaslanma: P; -> kas-kutlesi-ve-yaslanma ("kas kütlesi ve yaşlanma"); -> kreatin-ve-yaslanma ("kreatin")
- kas-kutlesi: P; -> protein-ihtiyaci-yaslanma ("yaşlanmada protein ihtiyacı"); -> kavrama-gucu-ve-saglik ("kavrama gücü")
- kavrama-gucu: P; -> kas-kutlesi ; -> direnc-antrenmani-yaslanma
- kreatin: P; -> direnc-antrenmani-yaslanma ; -> protein-ihtiyaci-yaslanma
- denge-egzersizleri: P; -> direnc-antrenmani-yaslanma ; -> kas-kutlesi
- egzersiz-sonrasi-toparlanma: P; -> uyku-kalitesi-nasil-artirilir ("toparlanmada uyku"); -> protein-ihtiyaci-yaslanma

### C5 Uyku (pillar uyku-kalitesi-nasil-artirilir; anchor "uyku kalitesi nasıl artırılır")
- sirkadiyen-ritim: P; -> ekran-kullanimi-ve-uyku ("ekran kullanımı ve uyku"); -> uyku-ve-glimfatik-sistem ("glimfatik sistem")
- ekran-kullanimi: P; -> sirkadiyen-ritim ("sirkadiyen ritim"); -> dijital-tukenmislik (cross, "dijital tükenmişlik")
- glymphatic: P; -> sirkadiyen-ritim ; -> otofaji-nedir (cross, "hücresel temizlik")
- pillar uyku-kalitesi: -> all 3 spokes; -> magnezyum-eksikligi (cross); -> kortizol-yaslanma (cross)

### C6 Zihin ve Sosyal (pillar kortizol-yaslanma; anchor "kortizol ve yaşlanma")
- tukenmislik-sendromu: P; -> dijital-tukenmislik ; -> anksiyete-ve-obsesyonun-fizyolojisi ("kronik anksiyete")
- dijital-tukenmislik: P; -> tukenmislik-sendromu ; -> ekran-kullanimi-ve-uyku
- anksiyete: P; -> tukenmislik-sendromu ; -> muzik-ve-stres-kortizol
- muzik: P; -> doga-ve-zihin-sagligi ("doğada vakit geçirmek"); -> sanat-ve-beyin-sagligi
- doga: P; -> gunluk-yuruyus-sagligi (cross); -> muzik-ve-stres-kortizol
- kitap-okuma: -> sanat-ve-beyin-sagligi ; -> sosyal-baglanti-ve-uzun-omur ; -> pillar `/longevity#zihin`
- sanat: -> kitap-okuma ; -> muzik ; -> pillar
- sosyal-baglanti: -> yasam-amaci-ve-longevity ("yaşam amacı"); -> sukran-pratigi ; -> mavi-bolge-diyeti (cross)
- yasam-amaci: -> sosyal-baglanti ; -> sukran-pratigi ; -> mavi-bolge-diyeti
- sukran-pratigi: -> yasam-amaci ; -> sosyal-baglanti ; -> kortizol-yaslanma

Cluster 6b needs its own hub pillar (`/longevity#sosyal-iliskiler`, currently a separate area). Keep as separate area if preferred; matrix above treats it as the Sosyal sub-area.

Inbound check: each post gets at least 3 inbound links (pillar, 2 siblings, plus hub). Posts at risk after execution (verify): kitap-okuma, sanat, kreatin, muzik (add one more sibling each).

## 5. Missing Turkish topics (prioritized, SERP-based)

| # | Topic (proposed primary keyword) | Priority | SERP evidence | Fits / links |
|---|---|---|---|---|
| 1 | **Botoks etkisi ne kadar sürer, kaç ayda bir yapılır?** | High | SERP: many individual doctor pages (safakgoktas, drmustafakaratas, tarikcavusoglu, hospitalturk...), 4-6 ay and 3-4 ay aralığı. Doctor-authored pages rank, so a physician site is competitive. | C1b; link botoks, botoks-sonrasi |
| 2 | **Dermal dolgu ne kadar sürer / kalıcı mı (HA 6-18 ay, CaHA, PLLA)** | High | SERP: Acıbadem, Anadolu Sağlık plus many clinic pages; 6 ay-2 yıl varies by product. | C1b; link dermal-dolgu, güvenlik |
| 3 | **ApoB nedir? Kolesterolden farkı** (+ HbA1c) | High (low Turkish competition) | Only a few Turkish pages (drmuhammedkeskin.com, talatpasatip, mecev.org); rest EN/PubMed. The hub already cites ApoB < 80 without any supporting content. | C2/C3; link biyolojik-yas, longevity hub |
| 4 | **Kolajen takviyesi işe yarar mı?** | High (competitive but on-brand) | SERP: Memorial, Acıbadem, Anadolu Sağlık, Büyük Anadolu, plus clinic blogs. The common answer is "some evidence for skin hydration/elasticity, more studies needed", so the evidence-graded angle is feasible. | C1a/C3b; link ciltte-kollajen-kaybi, altin-igne |
| 5 | **Hyaluronik asit dudak/yanak dolgusu nedir ve ne kadar kalır** (bölge bazlı) | Medium | SERP shows many clinic pages for "yanak dolgusu", "dudak dolgusu ne kadar kalır". | C1b; pattern is high commercial demand |
| 6 | **C vitamini serumu nasıl kullanılır / leke** | Medium | SERP: brand blogs (Loccitane, Alalore, c-lopia), Medicana; physician-led evidence page absent. Combine with retinoid/güneş routine. | C1a |
| 7 | **Uyku apnesi/horlama ne zaman doktora gidilir** | Medium | SERP: only hospitals (Acıbadem, Lokman Hekim, Medicana...). Very competitive. Position as short "uyarı belirtileri" bridge post rather than a full guide. Supports the hub warning "horlama, nefes durması". | C5; fills the "uyku bozuklukları" intent after F-9 |
| 8 | **Longevity check-up: hangi tahliller (HbA1c, ApoB, hs-CRP, ferritin, D vitamini)** | Medium | New-ish query class. Strongly matches the doctor's brand and the hub's metrics. Unverified demand, test with GSC. | pillar for C2/C3 |
| 9 | **Kas kaybı (sarkopeni) belirtileri ve önlemi** | Medium | Natural bridge between protein, direnç, kreatin, kavrama posts. | C4b |
| 10 | **Soğuk su/sauna ve longevity** | Low | Broad trend, but YMYL caveats. Evidence needs a careful write-up. | C2 |
| 11 | **Menopoz ve cilt/kas değişimleri** | Low-Medium | Not yet researched via SERP. Verify. | C1/C4 |

Not validated by SERP in this run: #5, #8-#11 demand. Check Search Console and Keyword Planner first.

## 6. Pre-delivery checklist status
- No two posts share a primary keyword: FAIL until F-3 and F-9 are applied.
- Every spoke has at least 3 incoming links: FAIL (7 posts with 0, 5 with 1 inbound from posts/hubs).
- Spoke -> pillar and pillar -> spoke: FAIL (no in-body links, no pillar posts).
- Orphan pages: FAIL (5, see F-5).
- Word counts: FAIL (spoke target 1200-1800 vs. median about 400).
- Cluster sizes (2-5 clusters, 2-4 posts each): exceeds limits by design (6 areas + C2, 10-11 posts in C3/C4/C6). Use sub-clusters (a/b) as in section 1.
- SERP overlap supports groupings: PARTIAL (est. only).

## 7. Rollout order
1. F-3 merge PRP, F-9 retitle glymphatic, F-4 fix relatedArticles (quick wins, config-only).
2. F-1/F-5 body links per matrix and hub expansion (F-6).
3. F-7/F-8 differentiate the dolgu and botoks pairs while expanding (F-2).
4. New posts: topics 1-4, then 7-9.
5. Re-crawl and verify checklist.
