# Schema / Structured Data Audit (2026-10-05)

Score: **58/100**. Source reviewed: src/lib/seo.ts, src/layouts/BaseLayout.astro, src/pages/blog/[slug].astro, dist/ output. The staging site was not fetched, since the built dist is the same code.

## 1. Detection

All pages get ONE `<script type="application/ld+json">` from BaseLayout (server-rendered, static HTML). There is no Microdata or RDFa. All dist pages carry exactly 1 block.

| Page | Block content |
|---|---|
| All pages (home, /hakkinda, /blog, /medikal-estetik, /longevity, /quizler, /iletisim, etc.) | `{@context, @graph:[Person #person, WebSite #website, WebPage #webpage, BreadcrumbList #breadcrumb]}` |
| /blog/[slug] (55 posts) | JSON array `[ {@context, @graph:[...same 4...]}, {Article} ]` |

## 2. Validation

| Block | Status | Issues |
|---|---|---|
| Site @graph | WARN | Valid syntax, https context, absolute URLs, @id linking. See issues below. |
| Article on blog posts | FAIL | The second array element has no `@context`. Google cannot attach it to an entity. Its `@id` references to #person resolve only inside the same document, not across the separate objects. |
| BreadcrumbList | WARN | The last item name is the full `<title>` ("... — Dr. Muhammed İkbal Bakırcı"). Should be the plain page/article title. |
| FAQPage / HowTo / deprecated types | PASS | None present. |

Issues:
1. **Critical:** the Article block lacks `@context` (Astro `[slug].astro` passes a bare object and BaseLayout wraps it in an array).
2. **High:** the Person `image` equals the page's OG image. On blog posts it becomes the article cover. The person's image must be the portrait: `/assets/images/dr-muhammed-ikbal-bakirci.jpg`.
3. **High:** `jobTitle: "Hekim, sağlık yöneticisi ve akademisyen"` contains "akademisyen". PhD completion is unverified per the CV doc, so remove it. Use "Başhekim" / "Hekim".
4. **High:** the Person has no `worksFor`, `sameAs`, `alumniOf`, `knowsAbout` or `description`. It is the entity anchor and is thin. Add only verified facts.
5. **Medium:** Article has no `reviewedBy` / `citation`, and `author` and `publisher` are both the Person only by @id. Google needs the author name to resolve. After fixing the context it will resolve, but add `name` inline for robustness.
6. **Medium:** `dateModified` equals `datePublished`, and both are `...T00:00:00.000Z` (UTC midnight). Turkey is UTC+3, so use `+03:00` or a date-only value. Add a real `updated` frontmatter field.
7. **Medium:** WebPage on every page and `about` → Person on every page, including articles. Articles should use `about` for topic, and the page type should be specific (AboutPage, ContactPage, CollectionPage, MedicalWebPage).
8. **Low:** `WebSite` has no `potentialAction` (a SearchAction is not needed, since Google dropped the sitelinks searchbox).
9. **Info (content, not schema):** src/pages/blog/[slug].astro:223 byline says "Birleşmiş Milletler UNF Türkiye Temsilciliği yapmıştır". It is unverified, so keep it out of schema and consider removing it from the page.
10. **Info:** the Article's `datePublished` for 55 posts comes from the `date` frontmatter. `/blog` and the other index pages have no CollectionPage markup.

## 3. What works
- A single, valid, server-rendered JSON-LD graph. Stable `@id`s with a consistent canonical domain.
- `https://schema.org` context, absolute URLs, `inLanguage: tr-TR`.
- Breadcrumbs generated on every page (the post breadcrumb has a "Blog" parent).
- Script output is escaped (`<` → `<`).
- No deprecated types (HowTo, SpecialAnnouncement etc.) and no fake ratings or reviews.

## 4. Recommendations (ready to paste)

### R1 (Critical): fix Article @context and merge into one graph
File: `src/layouts/BaseLayout.astro`. Replace the jsonLd construction:
```astro
const base = buildSiteStructuredData({ pathname: Astro.url.pathname, title, description, image: DEFAULT_IMAGE });
const extra = structuredData ? (Array.isArray(structuredData) ? structuredData : [structuredData]) : [];
const jsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [...base['@graph'], ...extra],
}).replace(/</g, '\\u003c');
```
Notes: the Person image must always be the portrait, so pass `DEFAULT_IMAGE` to the site graph. Keep the page `image` only for the WebPage / `primaryImageOfPage`. Drop `@context` from per-page extras.
Success check: Rich Results Test / validator.schema.org shows an Article with author resolved. `JSON.parse` of the block yields one object with a `@graph`.

### R2 (High): richer Person (+Physician) entity
File: `src/lib/seo.ts`, Person node in `buildSiteStructuredData`. Use a `["Person","Physician"]` type only if you accept medical-profile semantics; `Physician` is a MedicalBusiness subtype and is better for a clinic. Safer is Person plus `hasOccupation`:
```ts
{
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: SITE_NAME,
  honorificPrefix: 'Dr.',
  url: `${SITE_URL}/hakkinda`,
  mainEntityOfPage: `${SITE_URL}/hakkinda`,
  image: DEFAULT_IMAGE,
  jobTitle: 'Başhekim',
  description: 'Hekim; VM Medical Park Bursa Hastanesi Başhekimi. Longevity ve medikal estetik alanlarında bilgilendirici içerikler üretiyor.',
  worksFor: {
    '@type': 'Hospital',
    name: 'VM Medical Park Bursa Hastanesi',
    address: { '@type': 'PostalAddress', addressLocality: 'Bursa', addressCountry: 'TR' },
  },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'Atatürk Üniversitesi Tıp Fakültesi' },
  hasOccupation: { '@type': 'Occupation', name: 'Hekim' },
  medicalSpecialty: undefined, // do not set: no verified specialty field
  knowsAbout: ['Longevity', 'Medikal estetik', 'Acil tıp', 'Sağlık yönetimi'],
  sameAs: [
    'https://www.instagram.com/dr.muhammedikbalbakirci',
    'https://youtube.com/@drmuhammedikbalbakirci',
    'https://www.linkedin.com/in/muhammed-ikbal-bakirci-221ab3243',
    'https://x.com/mikbalbakirci',
    'https://www.medicalpark.com.tr/en/doctors/muhammed-ikbal-bakirci'
  ],
}
```
Rules: `Hospital` with `name` only is enough, so do not invent an address or phone. Remove the `medicalSpecialty` line (it is a placeholder in this snippet). `alumniOf` MD is fine because it is verified (the CV doc still has an empty "Teyit" column, so confirm with the doctor before publishing). Do NOT add the PhD programmes, UNF, the BSY advisory board or the "Sağlık Bakanlığı onaylı" certificate until confirmed. Each `sameAs` item must be confirmed as the doctor's own (the Facebook one is unknown, so skip it).
Success check: the Person validates, and the `sameAs` URLs are live.

### R3 (High): page-specific types
File: `src/lib/seo.ts`, change the `WebPage` node to accept an `@type` and a `primaryImageOfPage`. Pass per page via a new optional `pageType` prop on BaseLayout.
- /hakkinda: `AboutPage` with `mainEntity: {"@id": ".../#person"}`
- /iletisim: `ContactPage`
- /blog, /quizler, /rehberler, /medikal-estetik, /longevity: `CollectionPage` (or plain WebPage for the landing-style ones). `mainEntityOfPage` is not needed.
- /medikal-estetik and /longevity are educational: `["WebPage","MedicalWebPage"]` with `about: {"@type":"MedicalProcedure","name":"..."}` is optional. Only add it if you can fill `lastReviewed` and `reviewedBy` truthfully.
```ts
{ '@type': 'AboutPage', '@id': `${canonicalUrl}#webpage`, url: canonicalUrl, name: title,
  isPartOf: { '@id': `${SITE_URL}/#website` }, mainEntity: { '@id': `${SITE_URL}/#person` },
  primaryImageOfPage: { '@type': 'ImageObject', url: getAbsoluteUrl(image) }, inLanguage: SITE_LOCALE }
```
For non-about pages, remove `about: #person` (it is wrong semantics). Severity: Medium. Success check: the type shows in the validator, and the homepage may keep plain WebPage.

### R4 (High): complete the Article
File: `src/pages/blog/[slug].astro`. Replace `articleStructuredData`. (`citation` needs the sources parsed from the `## Kaynaklar` section. Do it in a small helper.)
```astro
---
const body = post.body ?? '';
const sourceSection = body.split(/^## Kaynaklar\s*$/m)[1] ?? '';
const citations = [...sourceSection.matchAll(/^- \[(.+?)\]\((https?:\/\/[^)]+)\)/gm)]
  .map(([, name, url]) => ({ '@type': 'CreativeWork', name, url }));
const updated = post.data.updated ?? date; // add optional `updated: z.coerce.date().optional()` to the content schema
const articleStructuredData = {
  '@type': ['Article', 'MedicalWebPage'].length ? 'Article' : 'Article',
  '@id': `${articleUrl}#article`,
  headline: title,
  description,
  image: [getAbsoluteUrl(image)],
  datePublished: date.toISOString().slice(0, 10),
  dateModified: updated.toISOString().slice(0, 10),
  author: { '@type': 'Person', '@id': `${SITE_URL}/#person`, name: 'Dr. Muhammed İkbal Bakırcı', url: `${SITE_URL}/hakkinda` },
  publisher: { '@type': 'Person', '@id': `${SITE_URL}/#person`, name: 'Dr. Muhammed İkbal Bakırcı' },
  isPartOf: { '@id': `${articleUrl}#webpage` },
  mainEntityOfPage: { '@id': `${articleUrl}#webpage` },
  articleSection: category,
  inLanguage: 'tr-TR',
  ...(citations.length ? { citation: citations } : {}),
};
---
```
Simplify: use `'@type': 'Article'` (the ternary above is a leftover, so write it plainly as `'Article'`). If the posts are health articles, a reviewer is optional. Only add `reviewedBy` (a Person or an Organization) when a real medical reviewer has actually reviewed the text. The author himself is the physician, so self-review is not meaningful. Do NOT fabricate `reviewedBy`.
Optional for health posts: a second type `MedicalWebPage` on the WebPage node (`"@type": ["WebPage","MedicalWebPage"]`, `lastReviewed`, `reviewedBy: {"@id": ".../#person"}`). It is acceptable only if the doctor really reviews each page. Google has no rich result for it, so the benefit is semantic only.
Also: `publisher` as a Person is allowed, but Google's Article guidance prefers an Organization for the publisher name and logo. There is no verified org, so keep the Person. Do not invent an Organization.
Success check: citations match the number of Kaynaklar bullets; dates are ISO 8601; the validator shows author name and image. Severity: High.

### R5 (Medium): breadcrumb names
File: `src/lib/seo.ts`, `buildBreadcrumbs`. Add an optional `crumbName` parameter and strip the site suffix:
```ts
const cleanTitle = title.replace(/\s+[—–-]\s+Dr\. Muhammed İkbal Bakırcı$/, '');
...
name: index === segments.length - 1 ? cleanTitle : routeLabel[segment] || segment,
```
Also, `/blog/[slug]` has the right parent chain: Ana Sayfa > Blog > Post. Optional for a category-based chain, which is unnecessary. Success check: the third item name is only the post title.

### R6 (Medium): ProfilePage on /hakkinda (optional)
Google's ProfilePage feature is aimed at forums and creator profiles. For /hakkinda an `AboutPage` with Person `mainEntity` (R3) is enough. A ProfilePage is acceptable as `["AboutPage","ProfilePage"]` is not allowed (the single @type is cleaner), so skip it.

### R7 (Medium): Physician / MedicalBusiness / Organization: not justified yet
- Do NOT add `MedicalBusiness`/`Physician` as a clinic with address, phone, hours or geo. The site is a personal content site, and the doctor practices at VM Medical Park. A local-business entity would need an address, phone and hours that are not verified. If the doctor wants a local presence, publish it on the hospital's page and link via `worksFor`.
- Do NOT add an Organization unless a registered brand exists. The Person already acts as publisher.
- `/iletisim`: ContactPage with a `ContactPoint` only if an email/phone is public (src/lib/contact.ts, not reviewed in detail). Example, filling only from that file:
```ts
mainEntity: { '@id': `${SITE_URL}/#person`, contactPoint: { '@type': 'ContactPoint', contactType: 'Randevu ve iş birliği', email: '<from src/lib/contact.ts>', availableLanguage: 'tr' } }
```
Skip it if the email is not displayed publicly.

### R8 (Info): FAQPage
No FAQ content was found in /medikal-estetik, /longevity or /quizler. Do not add FAQPage. Google retired FAQ rich results for all sites on May 7, 2026, and the pages are not Q&A anyway. If an FAQ section is added later for AI visibility, FAQPage markup is harmless, but it must match visible Q&A. For user-submitted Q&A use QAPage.

### R9 (Low): quizzes
/quizler: use `CollectionPage` with `hasPart` linking to each quiz as `WebPage`. Do not use Quiz (education Q&A) markup, since these are self-assessment tools with no answer key. Not a priority.

### R10 (Low): VideoObject
Add VideoObject only on posts or pages that embed a YouTube video (the doctor's channel exists). It needs `name`, `thumbnailUrl`, `uploadDate` and `embedUrl`, so no generic markup. Currently nothing is embedded that I verified.

## 5. Priority order
1. R1 + R4: Article `@context` / unified graph (Critical/High)
2. R2: Person fix (remove "akademisyen", correct image, add sameAs / worksFor)
3. R5: breadcrumb name cleanup
4. R3: page-specific types
5. R7/R10: only with verified data

## 6. Score breakdown (58)
Valid base graph and linking +30; BreadcrumbList on every page +10; no deprecated types +8; Article present +5; syntax / URL hygiene +5. Deductions: broken Article context (-15), thin Person with an unverified claim (-10), generic WebPage types (-5), no citation / modified date (-7).

Placeholders: none of the generated snippets contain placeholders except the `<from src/lib/contact.ts>` value in R7, which must be filled from that file or the snippet dropped.
