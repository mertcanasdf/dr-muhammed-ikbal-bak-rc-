# Local SEO findings - Dr. Muhammed Ikbal Bakirci (2026-10-05)

Score: 27/100. Business type: hospital-affiliated practitioner (no own premises found; patients book via Medical Park). Vertical: healthcare / medical aesthetics.

| Dimension | Weight | Score |
|---|---|---|
| GBP signals | 25 | 4 |
| Reviews | 20 | 2 |
| Local on-page | 20 | 6 |
| NAP + citations | 15 | 7 |
| Local schema | 10 | 3 |
| Local links/authority | 10 | 5 |

## Sources checked
- Medical Park profile https://www.medicalpark.com.tr/en/doctors/muhammed-ikbal-bakirci : Medical Esthetics + Emergency; Chief Physician since 2022; booking via MP online system or 444 44 84.
- Doctor site https://www.drmuhammedikbalbakirci.com/ (Doktortakvimi infrastructure): VM Medical Park Bursa Hastanesi, Fevzi Cakmak Cad. Kircaali Mah. No:76 Osmangazi 16220 Bursa; tel +90 850 333 0344 (appointment) and +90 850 202 3434 (contact); map coords 40.1933556, 29.0604248; booking via doktortakvimi.com. No rating shown.
- Live canonical https://www.muhammedikbalbakirci.com/ : WhatsApp +90 544 224 48 13, /iletisim form, no address.
- New build /iletisim, src/pages/iletisim.astro, src/lib/contact.ts, src/lib/seo.ts.
NOT verifiable here: Google Business Profile, Google reviews, Instagram bio, Doktortakvimi review count (no search/Maps access).

## Findings

### 1. CRITICAL - /iletisim has no NAP and the form cannot send
Evidence: iletisim.astro has only a form; no phone, address, hospital, hours, tel: link, map. contact.ts submitContact() always returns {ok:false, reason:'not-configured'}, so every user sees the "gonderilemedi" error. The "Randevu" channel dead-ends.
Fix: add a "Randevu nasil alinir" block: VM Medical Park Bursa Hastanesi, Fevzi Cakmak Cad. Kircaali Mah. No:76 Osmangazi/Bursa (doctor confirms), a tel: link to the confirmed appointment number, links to the Medical Park profile and Doktortakvimi booking, WhatsApp only if confirmed. Wire submitContact to a real endpoint or hide the form until configured.
Check: iletisim HTML contains a tel: link and address text; test submission returns success; click-to-call works on mobile.

### 2. CRITICAL - Contact data conflict across public sources (doctor must confirm)
Evidence: four numbers: 444 44 84 (Medical Park), +90 850 333 0344 and +90 850 202 3434 (Doktortakvimi doctor site), +90 544 224 48 13 (WhatsApp on live canonical site). None on the new build.
Fix: doctor declares one primary appointment number and one WhatsApp number. Use identical +90 formatting everywhere; keep in one constants file feeding footer, iletisim and JSON-LD.
Check: the same string appears in MP profile, Doktortakvimi, GBP, site footer, schema.

### 3. CRITICAL - Booking model and compliance unclear
Evidence: all public booking paths run through Medical Park / Doktortakvimi, i.e. hospital-based practice. A personal site promoting botox/filler with "randevu" must say where treatment happens. Turkish health-advertising rules restrict physician promotion and the employer may control branding (verify with counsel/hospital).
Fix: doctor confirms (a) treatments are delivered at VM Medical Park Bursa, (b) employer permits site and any GBP, (c) no prices or before/after claims. State "Randevular VM Medical Park Bursa Hastanesi uzerinden alinir" on /iletisim and /medikal-estetik.
Check: written confirmation; text live on both pages.

### 4. HIGH - No local/medical schema
Evidence: seo.ts emits only Person (jobTitle, url, image), WebSite, WebPage, BreadcrumbList. No address, telephone, hospitalAffiliation, sameAs, geo.
Fix: use Physician (type ["Person","Physician"]) with hospitalAffiliation, not MedicalClinic. Pattern:
{"@type":["Person","Physician"],"@id":".../#person","name":"Dr. Muhammed Ikbal Bakirci","hospitalAffiliation":{"@type":"Hospital","name":"VM Medical Park Bursa Hastanesi","address":{"@type":"PostalAddress","streetAddress":"Fevzi Cakmak Caddesi, Kircaali Mah. No:76","addressLocality":"Osmangazi","addressRegion":"Bursa","postalCode":"16220","addressCountry":"TR"},"geo":{"@type":"GeoCoordinates","latitude":40.19336,"longitude":29.06042}},"worksFor":{same hospital},"areaServed":"Bursa","sameAs":[MP profile, Doktortakvimi, Instagram @dr.muhammedikbalbakirci, YouTube @drmuhammedikbalbakirci, LinkedIn, X @mikbalbakirci]}
Add medicalSpecialty only if the doctor confirms a valid schema.org specialty. Do not emit MedicalClinic/LocalBusiness with the hospital address as his own premises unless he has a separate registered clinic. Add telephone only after item 2.
Check: Schema validator passes; Person node carries hospitalAffiliation + sameAs; no MedicalClinic node.

### 5. HIGH - GBP: existence unknown; strategy needs doctor decision
Evidence: no Maps embed, GBP link or place ID on the site; GBP not verifiable. Practitioners inside a hospital usually surface via the hospital listing; an individual practitioner GBP is only appropriate for a distinct location and a shared-address listing risks suspension.
Fix: search Google Maps for "Muhammed Ikbal Bakirci" and "VM Medical Park Bursa"; doctor reports whether a practitioner GBP exists and who manages it. If none, do not create one without hospital consent; ask hospital marketing to feature him on the hospital listing. If one exists: verify primary category, hours, services, photos; point website link to /medikal-estetik (not the homepage).
Check: GBP URL recorded; category verified; website link and phone match item 2.

### 6. HIGH - No Bursa-focused landing intent
Evidence: /iletisim title/description contain no "Bursa"; site is positioned as longevity/education.
Fix: on /medikal-estetik and individual pages for botoks, dolgu, altin igne, PRP, mezoterapi put the service plus "Bursa" in title, H1 and intro, with unique medical content (not city-swappable) and a FAQ. Contact title example: "Randevu ve Iletisim | Dr. Muhammed Ikbal Bakirci - Medical Park Bursa". Keep claims compliant.
Check: each service page indexed; title/H1 contain service + Bursa; no templated duplicates.

### 7. MEDIUM - Reviews: none on site, third-party counts unknown
Evidence: no aggregateRating or review widget; DT page showed no rating.
Fix: do not add aggregateRating unless from genuine reviews visibly shown on the page. Collect Google/Doktortakvimi ratings from the doctor and link out. Respond to reviews without confirming patient status; no review gating.
Check: counts recorded; owner responses present; no unsupported aggregateRating.

### 8. MEDIUM - Citations
Evidence: confirmed: Medical Park profile, Doktortakvimi-hosted doctor site. Unchecked: Google Maps, Bing Places, Apple Maps, Instagram bio, other Turkish doctor directories.
Fix: ensure consistent name + hospital + number on all; add the new site URL to MP profile, Doktortakvimi, Instagram, LinkedIn, YouTube, X.
Check: each profile links to https://www.muhammedikbalbakirci.com with identical NAP.

### 9. MEDIUM - Two near-identical domains
Evidence: drmuhammedikbalbakirci.com (Doktortakvimi) and muhammedikbalbakirci.com.
Fix: make the canonical site primary, cross-link both, list both in sameAs; keep the DT site for booking only.
Check: no conflicting NAP; sameAs lists both.

### 10. LOW - Hours, map, geo
Fix: state "Randevu saatleri hastane santraline baglidir"; lazy-load hospital map; coordinates 40.19336, 29.06042 (from DT page, verify).
Check: map renders, no CLS regression.

## Doctor must confirm
1. Primary appointment phone and WhatsApp number. 2. Private clinic or only VM Medical Park. 3. Whether a GBP exists and who owns it. 4. Hospital consent for using hospital name/address online. 5. Facebook URL and which Instagram account is professional. 6. Google/Doktortakvimi rating counts.

## Limitations
No GBP/Maps, geo-grid, review velocity, backlink or Instagram data available; DataForSEO not used. Proximity (about 55% of ranking variance) is outside our control. Phones and coordinates are as reported by third-party pages and unverified.
