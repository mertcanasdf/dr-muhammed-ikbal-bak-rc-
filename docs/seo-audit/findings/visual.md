# Visual / Mobile Audit (2026-10-05)

Target: https://dr-bakirci-revizyon.surge.sh. Python Playwright + Chromium, 7 pages at desktop 1440x900 and mobile 390x844 (2x, touch). Screenshots: `docs/seo-audit/screenshots/`.

## Score: 82 / 100

## Passes
- No horizontal overflow at either width. The `.me-tab` buttons on `/medikal-estetik` mobile sit in their own horizontal scroller.
- CLS ≤ 0.0005 on every page.
- Home above the fold is clear on both widths: the H1 "Sağlıklı Yaş Almanın Bilimi", the name, the sub-line and two CTAs are visible, and the portrait loads.
- The viewport meta tag is set and the base font is 16px.
- The promo modal never appeared: no overlay after 6 s on any of 14 page loads.

## Findings
1. **LOW — dead promo-modal code** in `public/script.js` (`#promoModal` is not in the markup). Fix: delete it. **Done 2026-10-05:** script.js rewritten.
2. **MEDIUM — right-click/copy/shortcut blocking** in `public/script.js`. It blocks copying phone numbers and quotes, and breaks assistive tech. Fix: remove. **Done 2026-10-05.**
3. **MEDIUM — mobile tap targets under 44px:**
   - hamburger 32x24
   - logo link 102x24
   - footer links 17px tall
   - "Bu konuda yazın →" on `/iletisim`
   - "Makaleyi Oku →" on `/medikal-estetik`
   - "Tümü →" on home
   - `/blog` filter chips 31px
   - share buttons 36–38px
   - consent checkbox 18x18

   Fix: `min-height:44px` plus padding on mobile; enlarge the checkbox's hit area with its label.
4. **MEDIUM — images without width/height:** all 55 on `/blog` and 21 on `/medikal-estetik`. **Done 2026-10-05:** CardImage component.
5. **LOW — text under 12px:** 10px card labels, dates and tags on `/blog`, `/medikal-estetik` and `/longevity`. Fix: at least 12px for meta text.
6. **LOW — no visible contact/appointment CTA in the header**, and on mobile `/iletisim` is reachable only through the hamburger.
7. **LOW — desktop header controls under 44px:** nav links 36px, search input 33px.

Not checked: 1920/1366/768 viewports, the expanded hamburger menu, keyboard focus styles.
