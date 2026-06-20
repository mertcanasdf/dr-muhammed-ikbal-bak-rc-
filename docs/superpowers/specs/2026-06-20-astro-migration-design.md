# Astro Migration Design — Dr. Muhammed İkbal Bakırcı

**Date:** 2026-06-20
**Status:** Approved

## Goal

Migrate the existing plain HTML/CSS/JS static site to Astro to eliminate repeated header/footer code, enable Markdown blog content, and produce a static `dist/` output deployable via FTP to cPanel shared hosting.

## Approach

Full migration (Approach 1): all `.html` files become `.astro` pages sharing a single `BaseLayout.astro`. Blog HTML files are converted to Markdown with Astro Content Collections. CSS and JS are reused as-is.

## Project Structure

```
src/
  layouts/
    BaseLayout.astro       ← <head>, Header, Footer
  components/
    Header.astro
    AnnouncementBar.astro
    Nav.astro
    Footer.astro
  pages/
    index.astro
    hakkinda.astro
    iletisim.astro
    longevity.astro
    medikal-estetik.astro
    podcast.astro
    soylesiler.astro
    kurslar.astro
    rehberler.astro
    quizler.astro
    basari-hikayeleri.astro
    dunyada-saglik.astro
    sitelerimiz.astro
    gizlilik-politikasi.astro
    kullanim-kosullari.astro
    blog/
      index.astro            ← blog listing page
      [slug].astro           ← dynamic route per article
  content/
    blog/
      aralikli-oruc-longevity.md
      bolge-2-kardiyo.md
      d3-vitamini-eksikligi.md
      kortizol-yaslanma.md
      mavi-bolge-diyeti.md
      nmn-nad-yaslanma.md
      otofaji-nedir.md
      senolitik-tedaviler-cilt-genclesmesi-zombi-hucreler.md
      sirt6-proteini-epigenetik-genclesme.md
      telomerleri-korumak.md
public/
  assets/                    ← images copied from assets/
astro.config.mjs
package.json
```

## Key Decisions

- **Output:** `static` — no server required, dist/ uploaded via FTP
- **CSS/JS:** `style.css` and `script.js` moved to `public/` and referenced from `BaseLayout.astro` unchanged
- **Content Collections:** Blog uses Astro v2+ Content Collections with Zod schema validation on frontmatter fields (title, date, description)
- **UI Framework:** None for now — vanilla `.astro` components only; framework can be added later via `astro add react`
- **URL structure:** Preserved exactly — `/pages/hakkinda.html` becomes `/hakkinda` (Astro drops the .html extension by default)

## Blog Frontmatter Schema

```ts
const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
  }),
});
```

## Build & Deploy

```bash
npm run build   # outputs dist/
```

Upload `dist/` contents to cPanel public_html via FTP. No server-side processing needed.

## Out of Scope

- No React/Vue/Svelte integration (can be added later)
- No CMS integration
- No i18n setup
- No test suite
