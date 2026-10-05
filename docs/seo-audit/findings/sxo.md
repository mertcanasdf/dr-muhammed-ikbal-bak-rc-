# SXO Findings - muhammedikbalbakirci.com (new build: dr-bakirci-revizyon.surge.sh)

Date of SERP observations: 2026-10-05, Google Turkey results via WebSearch (no DataForSEO; positions/features approximate, no volumes, no PAA/AIO capture). Pages fetched with render_page.py --mode auto (static Astro, no SPA).

**SXO Gap Score: 57/100** (separate from SEO Health Score)

| Dimension | Score | Evidence |
|---|---|---|
| Page Type | 9/15 | Brand queries: ok. Generic info queries: blog articles are the right type. Local "bursa" service queries: no service/landing page exists (only 500-word articles at /blog/botoks etc.) |
| Content Depth | 10/15 | Articles 440-790 words, 5 H2, sources section. Competitors for "longevity nedir" are hospital guide pages; for "X bursa" are service pages with price/FAQ/sessions |
| UX Signals | 8/15 | No phone/WhatsApp/booking link on any page (grep for tel:/wa.me = none); "randevu" is text only; no CTA on article pages |
| Schema | 8/15 | Person, WebSite, WebPage, Breadcrumb on all pages; Article on posts. No Physician/MedicalBusiness, no telephone, no medicalSpecialty, no hospital affiliation entity |
| Media | 9/15 | Cover image per article; no video, no diagram, no before/after-free clinic imagery (appropriately cautious) |
| Authority | 8/15 | Strong real credentials (Chief Physician VM Medical Park, PhD) but not marked up or linked to corroborating profiles (sameAs) |
| Freshness | 5/10 | Articles dated 2026-06-18 (dateModified = datePublished everywhere); home/hub pages undated |

## Query-by-query SERP map (observed 2026-10-05)

| Query | Observed SERP | Dominant type | Our page | Fit | Winnable? |
|---|---|---|---|---|---|
| Muhammed İkbal Bakırcı | Instagram, X, Facebook, LinkedIn, YouTube, medicalparkinternational profile, muhammedikbalbakirci.com (home), drmuhammedikbalbakirci.com, doktortakvimi, TDED news | Brand/profile mix (entity SERP) | / and /hakkinda | Aligned | YES, already ranks. Note old title "Longevity & Sağlık Eğitimi" appears in SERP; new title is "Sağlıklı Yaş Almanın Bilimi" |
| Dr. Muhammed İkbal Bakırcı | Same set | Brand/profile | / | Aligned | YES |
| longevity nedir | Memorial, Boyner MAG, Acıbadem, NP Istanbul, Patrone, drmehmetportakal.com, aysegulcoruhlu.com, Kikwell, SDM | Informational guide, 8/9 (strong consensus ~90%); hospital brands + 2-3 personal doctor sites | /longevity (hub, 685 words, titled "Tutarlı ve Uzun Yaşam") | Partial mismatch: no "Longevity nedir?" definition heading/title; no definitional article | Medium. Personal doctor sites (Portakal, Çoruhlu) show it is attainable in 3-9 months with a dedicated definition article; page 1 vs Memorial/Acıbadem not realistic early |
| sağlıklı yaşlanma | medicalpark.com.tr, Medipol, Acıbadem, mph.com.tr, university PDFs, geriatric care | Hospital guide (WHO-style, elderly/geriatric intent) | None (no matching page; site's angle is longevity/optimization, not geriatrics) | Intent mismatch (geriatric/elderly care audience vs. biohacking-style audience) | NO near-term (needs hospital-brand authority). Skip as head target; use as supporting term |
| biyolojik yaş nasıl ölçülür | Memorial, bilimUP, İndigo, doktorclub, drbernauslucoskun, drmehmetportakal, calculator pages (hesapratik, calcvita) | Informational + calculator tools (mixed ~60/30) | /blog/biyolojik-yas-nasil-olculur (444 words, title "Biyolojik Yaş Nasıl Ölçülür? Takvim Yaşıyla Farkı") | Good title match; thin vs competitors that list methods (epigenetic clocks, telomer, blood biomarkers) and offer calculators | Medium-hard; winnable on page 2-3 in 3-6 months, page 1 needs depth + links |
| botoks bursa | drhakantufekci, drbekirmutlugungor, omerbuhsem, zdentbursa, doktorestetik, sukruisler, doktorsitesi, estaestetik | Local service pages from plastic surgeons/clinics + directories (~100% commercial/local) | /blog/botoks (educational, no "Bursa" in title/H1, 1 mention only) | CRITICAL mismatch (blog post vs local service page) | NO in 6-12 months as a new domain vs established surgeon sites; possible only via a real service page + GBP + doctor directory profiles |
| dermal dolgu bursa | dermaclinic, omerbuhsem, doktorsitesi (+Osmangazi), onderakdeniz, drhakantufekci, doktortakvimi | Local service/directory (lip filler price intent) | /blog/dermal-dolgu | CRITICAL mismatch | NO (same as above); price intent cannot be answered (regulatory: Turkish health advertising rules limit price/promo claims) |
| altın iğne bursa | Anka Güzellik, alitufansoydan, dryavuzselimcinar, maiguzellik, jimerestetik, doktorsitesi, doktortakvimi, bursadermatoloji; dugun.com bridal noise | Local service pages + directories | /blog/altin-igne | CRITICAL mismatch | Low-medium: fewer strong clinic pages; the most winnable of the "bursa" set if a service page is built |
| prp bursa | turanturan, kolayrandevu, drbekirmutlugungor, drmustafaerturk, doktortakvimi; PubMed "bursa" (bursitis) noise | Local service pages; ambiguous (orthopedic PRP vs aesthetic) | /blog/prp-eksozom (aesthetic, PRP+exosome) | CRITICAL mismatch + ambiguity | NO near-term |
| aralıklı oruç longevity | NEV Sağlık, Acıbadem, Cumhuriyet, dyt sites, Erdem Hastanesi, Nefis Yemek, alicandemiroglu, PMC/Wikipedia | Informational (dietitian/hospital) | /blog/aralikli-oruc-longevity (794 words) | Aligned type; head term "aralıklı oruç" is dominated by Acıbadem/dietitians | Longtail only ("aralıklı oruç ve otofaji / ömür") winnable in months |
| nmn nedir | makyajtrendi, customsupplements, vitafenix, drfirat.com, Wikipedia, halilcoskun blog, iHerb/Forbes translations | Informational + supplement-seller blogs (commercial-adjacent) | /blog/nmn-nad-yaslanma (title "NMN ve NAD+: ... Ne Biliyoruz?", 633 words, cited sources) | Partial: title lacks "NMN nedir"; sellers rank, so quality bar is low | YES-ish. Best generic opportunity: low-authority competitors + doctor-authored evidence stands out |
| zone 2 kardiyo | Peloton, Cleveland Clinic, Under Armour, EOS, Houston Methodist, Swanson (English results returned for this spelling) | Informational, English-dominated; Turkish demand uses "zone 2" and "bölge 2" | /blog/bolge-2-kardiyo (675 words; "zone 2" appears 0 times in the file) | Terminology mismatch: Turkish users type "zone 2" | YES for Turkish long tail ("zone 2 kardiyo nedir", "zone 2 nasıl yapılır") because Turkish-language competition looks thin |

## Findings

### F1 - CRITICAL - Local service queries have no matching page type
- Evidence: For botoks/dermal dolgu/altın iğne/prp + bursa (2026-10-05), 100% of organic results are clinic/surgeon service pages or directories (doktorsitesi, doktortakvimi). Site only has blog-format articles (/blog/botoks etc.). /medikal-estetik is a hub of article cards linking to /blog/*, without phone, address, hospital, appointment link, or service-level sections. No "Bursa" in titles/H1 of those articles.
- Fix: Build one service page per procedure (start with /botoks-bursa, /altin-igne-bursa; then dolgu, PRP) or one /medikal-estetik-bursa page with anchored sections. Contents: who performs it (Dr. Bakırcı, VM Medical Park Bursa Osmangazi, address Fevzi Çakmak Cad. Kırcaali Mah. No:76), indications, contraindications, session count/duration, FAQ (no prices; follow Turkish Ministry advertising regulation), visible randevu button (tel:+90 850 333 0344 or hospital booking URL), link to the educational article. Keep /blog/* as supporting content; link blog -> service page.
- Success check: Service URLs indexed; sitelink/appearance for "[procedure] bursa" in top 30 within 3 months, top 10 for "dr muhammed ikbal bakırcı botoks" style queries (long-tail) within 6 weeks; GSC queries containing "bursa" > 0.
- Handoff: /seo local.

### F2 - HIGH - No conversion path anywhere (UX/Action)
- Evidence: parsed all 6 key pages; no tel:, wa.me, or booking link; "randevu" appears only as text on /longevity, /medikal-estetik, /iletisim. Blog article pages contain no CTA.
- Fix: Add sticky mobile "Randevu Al" button and a CTA block at the end of every medikal-estetik article and on /hakkinda, linking to the hospital appointment number/URL (+90 850 333 0344 or the official Medical Park doctor page https://www.medicalparkinternational.com/dr-muhammed-ikbal-bakirci-44051). Confirm with the hospital which channel is permitted.
- Success check: tel/booking click events in GA4 > 0; CTA present on 100% of medikal-estetik articles.

### F3 - HIGH - Entity/brand SERP inconsistency and a competing own-domain
- Evidence: Brand SERP shows muhammedikbalbakirci.com with the OLD title "Dr. Muhammed İkbal Bakırcı — Longevity & Sağlık Eğitimi" and a second domain drmuhammedikbalbakirci.com ("Sertifikalı medikal estetik, Bursa", DocPlanner-hosted, has the Bursa hospital address and phones, no link to the main domain). New title: "Sağlıklı Yaş Almanın Bilimi".
- Fix: (a) Keep brand name + role in the home title, e.g. "Dr. Muhammed İkbal Bakırcı | Longevity ve Medikal Estetik, Bursa" (the current title omits Bursa and medikal estetik, the two terms users pair with the name). (b) Add Physician + MedicalBusiness/Person schema with sameAs for Instagram, X, LinkedIn, Facebook, YouTube, medicalparkinternational profile, doktortakvimi, and drmuhammedikbalbakirci.com; link to the DocPlanner site from /iletisim and ask it to link back. (c) Change the title only after consulting on re-crawl: SERP will show the old snippet until recrawl.
- Success check: brand SERP shows new title within 2-4 weeks; knowledge panel/sameAs recognized via Rich Results/Schema validator.
- Handoff: /seo schema.

### F3b - MEDIUM - YMYL/medical schema and E-E-A-T not machine-readable
- Evidence: Schema types on all pages: Person, WebSite, WebPage, BreadcrumbList; Article on posts. No medicalSpecialty, worksFor/hospitalAffiliation, telephone, address; articles have no reviewedBy / MedicalWebPage.
- Fix: Person -> add jobTitle "Başhekim", worksFor (VM Medical Park Bursa Hastanesi, with address), alumniOf, knowsAbout. Articles: add visible "Tıbbi içerik: Dr. Muhammed İkbal Bakırcı, son güncelleme: date" byline + MedicalWebPage/Article with author and dateModified updated truthfully.
- Success check: Rich Results Test passes; byline visible on each article.
- Handoff: /seo content (E-E-A-T).

### F4 - HIGH - "longevity nedir" has no definitional page
- Evidence: 2026-10-05 top 9 are all "Longevity Nedir?" guides (Memorial, Acıbadem, Boyner MAG, Patrone, two personal doctor sites). Site hub /longevity is titled "Tutarlı ve Uzun Yaşam" with H2 "Lifespan ve Healthspan Arasındaki Kritik Makas"; no article answers "longevity nedir".
- Fix: Retitle/redesign /longevity (or add /blog/longevity-nedir) as "Longevity Nedir? Sağlıklı Yaş Almanın Bilimi ve 6 Temel Alan" with a 40-60 word definition immediately under H1 (lifespan vs healthspan), a section of "Longevity ne değildir" (supplement/anti-aging hype caution), 6 pillars with links to existing articles, FAQ section. Target 1,200-1,800 words.
- Success check: top-30 within 3 months, top-10 in 6-9 months (realistic only with 10+ internal links and some external mentions). Page title contains "Longevity Nedir".

### F5 - MEDIUM - Title/H1 terminology misses actual query wording
- Evidence: "zone 2" appears 0 times in bolge-2-kardiyo.md while SERP for "zone 2 kardiyo" uses that spelling; "NMN nedir" SERP titles use "NMN Nedir" while ours is "NMN ve NAD+: Hücresel Yaşlanma Hakkında Ne Biliyoruz?"; "aralıklı oruç longevity" article title lacks "aralıklı oruç nedir/nasıl yapılır".
- Fix: Titles: "Zone 2 Kardiyo (Bölge 2) Nedir? Longevity İçin Nasıl Yapılır?"; "NMN Nedir? NAD+ ve Yaşlanma: İnsan Çalışmaları Ne Diyor?"; keep slugs unchanged (or 301 if changed). Add "zone 2" in H2 and first paragraph; add "konuşma testi" and heart-rate formula (SERP result type expects it).
- Success check: GSC impressions for "zone 2 kardiyo", "nmn nedir" appear within 4-8 weeks; CTR measured.

### F6 - MEDIUM - Depth below SERP norm for the info queries
- Evidence: biyolojik-yas article 444 words vs competitors that enumerate epigenetic clocks (Horvath, GrimAge, DunedinPACE), telomere, blood biomarkers (Memorial, drmehmetportakal) plus calculators.
- Fix: Expand to ~1,000-1,200 words; add comparison table (method / what it measures / accessibility in Türkiye / limitations), and honest "testlerin sınırları" section (differentiator vs sellers). Optionally add simple PhenoAge-style calculator (not essential).
- Success check: word count >= 1,000; page 1-3 for the exact query in 3-6 months.

### F7 - MEDIUM - Freshness signals flat
- Evidence: dateModified identical to datePublished (2026-06-18) on sampled article; hub pages undated; build output dated 2026-09-13.
- Fix: Add visible "Son güncelleme" and bump dateModified only when content is actually revised; refresh the 12 target articles after F5/F6 rewrites.
- Success check: dateModified differs from datePublished on revised articles.

### F8 - LOW - "sağlıklı yaşlanma" angle mismatch
- Evidence: SERP is geriatric/WHO-style hospital guides (Medical Park, Medipol, Acıbadem, universities).
- Fix: Do not target as primary; use as secondary phrase in /longevity H2 and in an article "Sağlıklı yaşlanma için 6 alan" linking to cluster. Do not spend effort on it before authority exists.

## Realistic winnability summary (new personal-physician site, ~3-12 months)

- Already won / defend: both brand-name queries (new title may change SERP snippet; keep brand + role + Bursa).
- Winnable in 3-6 months with the fixes above: "nmn nedir" (low authority competitors), "zone 2 kardiyo nedir" (Turkish long tail), "biyolojik yaş nasıl ölçülür" (page 2 -> page 1 with expansion), long tails of "aralıklı oruç".
- Needs authority and months of backlinks: "longevity nedir" (page 1 plausible at 6-12 months given personal doctor sites rank), "aralıklı oruç longevity" head term, "sağlıklı yaşlanma" (not realistic).
- Not winnable as blog posts; requires service page + local signals + directory profiles, still 6-12+ months: botoks/dermal dolgu/prp bursa. "altın iğne bursa" most attainable of the four.
- Regulatory caution: Turkish health advertising rules restrict price/promotion/before-after claims; service pages must stay informational and hospital-approved.

## Personas (derived from SERP signals; scores of current best-matching page, /25 per dimension: Rel/Clar/Trust/Action = total)

| Persona (signal) | Page | R | C | T | A | Total | Top fix |
|---|---|---|---|---|---|---|---|
| Local patient ready to book botoks/dolgu (all "bursa" SERPs are service pages + directories) | /blog/botoks | 12 | 14 | 17 | 4 | 47 | Service page + randevu button (F1, F2) |
| Price-comparing aesthetics shopper (SERP snippets cite "fiyatları", 1,750-12,000 TL) | /blog/dermal-dolgu | 6 | 8 | 15 | 3 | 32 | Cannot show prices; state "kişiye özel planlama, muayene sonrası" and give session/duration info |
| Longevity beginner (longevity nedir, hospital guides) | /longevity | 15 | 15 | 19 | 10 | 59 | Definitional page + CTA to library (F4) |
| Evidence-seeking biohacker (nmn, zone 2, biyolojik yaş; sellers dominate, Forbes/Healthline translations) | nmn-nad, bolge-2, biyolojik-yas | 19 | 18 | 21 | 10 | 68 | Query-matching titles, tables, newsletter/ follow CTA (F5, F6) |
| Brand/credential verifier (patient checking the doctor: Instagram, LinkedIn, Medical Park profile) | /, /hakkinda | 21 | 20 | 20 | 8 | 69 | sameAs, physician schema, visible hospital/booking link |
| Older adult/caregiver seeking healthy-aging info (sağlıklı yaşlanma SERP) | none | 5 | 6 | 15 | 2 | 28 | Low priority; accept loss |

Weakest-first priority: price shopper (accept), local booker (F1/F2), healthy-aging seeker (skip), longevity beginner (F4).

## Limitations
- WebSearch gives result lists only: no exact positions, volumes, PAA, AI Overview, ad copy, local pack or featured snippet data; consensus percentages are estimated from titles/domains. Competitor pages were not fetched individually (word counts inferred).
- Searches run from a US-based tool with Turkish queries; results may differ from Google Turkey in Bursa (local pack not observable).
- Target pages evaluated on the surge.sh preview; canonical points to the production domain, so indexing state, backlinks and GSC data of the live site were not assessed.
- "zone 2 kardiyo" returned English results via this tool; Turkish SERP may differ.
- Cross-skill: /seo local (F1), /seo schema (F3), /seo content (E-E-A-T, F6), /seo page (depth).

Offer: Generate a PDF report? Use `/seo google report`.
