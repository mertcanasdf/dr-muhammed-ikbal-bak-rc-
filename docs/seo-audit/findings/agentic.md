# Agentic Browsing Readiness — Dr. Muhammed İkbal Bakırcı

- Target: https://dr-bakirci-revizyon.surge.sh (staging; canonical host https://www.muhammedikbalbakirci.com). Source: `public/`, `src/`; build: `dist/`.
- Checked: 2026-10-05. Tools (claude-seo, run directly because the `claude-seo` launcher reported "runtime not ready"):
  - `agentic_check.py https://dr-bakirci-revizyon.surge.sh/ --json` (no `--ua-matrix`; agent user-agent testing was not authorized)
  - `agent_ux_check.py` on `/` and `/blog/otofaji-nedir/`
  - `lighthouse_agentic.py`: PSI returned **HTTP 429 (daily quota exceeded)**, so Lighthouse **13.5.0 CLI** was run locally (`npx lighthouse@13.5.0 --only-categories=agentic-browsing`, HeadlessChrome 154; Node 22.18, one patch below the stated 22.19 engine requirement, which ran without errors) and parsed with `lighthouse_agentic.py --from-json`.
  - Manual review of `public/script.js`, `public/style.css`, `src/components/Header.astro`, `src/pages/quizler.astro`, `src/pages/iletisim.astro` and `src/lib/contact.ts`.
- Staging note: surge serves its own `robots.txt` (`User-agent: * / Disallow: /`) for `*.surge.sh`, not the project's file. Access policy below is assessed on `public/robots.txt`, which is what production serves.

## Summary

| Measure | Result |
|---|---|
| Lighthouse Agentic Browsing (13.5.0, 2026-10-05) | **2/2 mobile, 2/2 desktop** on `/`; 2/2 mobile on `/blog/` and `/blog/otofaji-nedir/`. Counted audits: `agent-accessibility-tree` pass, `cumulative-layout-shift` pass (CLS 0). WebMCP ×3, `llms-txt` and `ard-schema` are N/A. |
| Agent-UX heuristic (local, 0-100; separate from Lighthouse) | **100** (complete) on `/` and `/blog/otofaji-nedir/`: 0 div-onclick widgets, 0 unnamed interactive nodes, 9–13 landmarks |
| P0 failures | **1 measured by manual review** (quiz answer options are `<div onclick>`). Lighthouse did not see it because the options only render after a click. |
| Category score | **64 / 100** |

**What limits agents most today:** the two task flows on the site cannot be completed by an agent, or by a keyboard or screen-reader user. Quiz answers are clickable `<div>`s, and the contact form always returns an error (`submitContact` returns `not-configured`). There is no other contact channel (no `mailto:`, `tel:` or social link on any page). The copy-blocking script also blocks text selection, copying and printing for every human visitor.

## Lighthouse Agentic Browsing detail

| Audit | `/` mobile | `/` desktop | `/blog/` | article |
|---|---|---|---|---|
| agent-accessibility-tree | pass | pass | pass | pass |
| cumulative-layout-shift | pass (0) | pass (0) | pass (0) | pass (0) |
| webmcp-form-coverage / registered-tools / schema-validity | N/A | N/A | N/A | N/A |
| llms-txt | N/A (`/llms.txt` 404) | N/A | N/A | N/A |
| ard-schema | N/A (no catalog) | N/A | N/A | N/A |

Paths that would **add** a counted audit. These are options, not goals, and a higher N is not a better site.
- Publish a valid `/llms.txt`, which adds `llms-txt` (see AG-05).
- Publish `/.well-known/ai-catalog.json`, which adds `ard-schema`. This only makes sense if the site has agent resources; it currently has none, so it is not recommended.
- WebMCP tools or form annotations: only once the contact form actually submits (AG-03).

Pages with the failing flows (`/quizler`, `/iletisim`) were not run through Lighthouse. Because the quiz options are rendered after a click, `agent-accessibility-tree` would not catch them in a navigation run anyway.

---

## Findings by priority

### AG-01 — P0 — Quiz answer options are non-semantic `<div onclick>`
- **Evidence:** `src/pages/quizler.astro:544` → `html += \`<div class="q-option${sel}" onclick="selectOption(${i})">`. The options have no role and no `tabindex`, and do not respond to Enter or Space. The "İleri" button (`q-nav__next`) stays `disabled` until an option is selected, so all 12 quizzes are impossible to complete by keyboard, with a screen reader, or for DOM/accessibility-tree agents, which see these as `generic`. The modal itself is correct (`role="dialog" aria-modal="true"`, close button `aria-label="Kapat"`).
- **Fix (`src/pages/quizler.astro`):** render options as native radios inside a fieldset:
  ```js
  html += `<fieldset class="q-options"><legend class="q-question">${q.text}</legend>`;
  q.options.forEach((opt, i) => {
    html += `<label class="q-option${sel}"><input type="radio" name="q${currentQ}" value="${i}" ${answers[currentQ]===i?'checked':''} onchange="selectOption(${i})"> ${opt.text}</label>`;
  });
  html += `</fieldset>`;
  ```
  Alternatively use `<button type="button" class="q-option" aria-pressed="true|false">`. Keep the existing `.q-option` styling (hide the radio visually with `.q-option input{position:absolute;opacity:0}` and add a `:focus-visible` outline). After each step, move focus to the legend.
- **Unblocks:** keyboard and screen-reader users, and agents completing the quiz for a user.
- **Success check:** open a quiz and Tab through it; every option is reachable and selectable with Space. Run `npx lighthouse … --only-categories=accessibility` in timespan mode while answering, and the accessibility tree shows `radio` (or `button`) nodes with names. Then rerun `agent_ux_check.py https://…/quizler`.

### AG-02 — P1 — Copy protection script and `user-select:none` (site-wide)
- **Evidence:**
  - `public/script.js` (end of file; loaded on all 68 pages via `BaseLayout.astro`) registers document-level handlers that call `preventDefault()` on `contextmenu` (right-click), `copy`, `dragstart`, and `keydown` for Ctrl+C / Ctrl+A / Ctrl+S / Ctrl+U / Ctrl+P, F12 and PrintScreen. The only exceptions are `INPUT` and `TEXTAREA`.
  - `public/style.css` sets `user-select:none` on `body, p, h1–h6, li, td, th, blockquote, .article-content, .blog-card__title …`, so text cannot even be highlighted.
- **Impact on users:**
  - Visitors cannot quote or save a sentence, a dosage table, or the "Kaynaklar" (sources) list. Every article ends with a reference list, which readers and other doctors are invited to check, but they cannot copy a DOI or a URL.
  - Ctrl+P (print or save as PDF) is blocked. Older readers and patients often print health articles for their doctor. The browser menu still works, so the block is only a nuisance.
  - Visitors who rely on select-to-translate or copy-into-translator tools (for example non-Turkish-speaking patients) and select-to-look-up dictionary features cannot use them.
  - Right-click is blocked, which removes "open link in new tab", "copy link address" and spell-check menus everywhere outside inputs.
- **Impact on accessibility:**
  - `user-select:none` breaks assistive tools that work on selected text: Read&Write / ClaroRead / NaturalReader "read selection", the Windows and macOS "speak selected text" settings, and select-to-magnify workflows used by dyslexic and low-vision readers.
  - Blocking Ctrl+A also breaks a common keyboard-only way to grab page text.
  - No WCAG success criterion names this directly, but it works against the intent of 1.3.1 and 2.1.1 (content and functionality operable through user tools). Screen readers still read the DOM, so blind users who use virtual-cursor navigation are mostly unaffected.
- **Impact on agents and crawlers:**
  - **None** for HTML or DOM consumers: Googlebot, Bingbot, GPTBot, ClaudeBot, OAI-SearchBot and Perplexity read the server-rendered HTML (`server-rendered` pass, 474 words without JS). Lighthouse Agentic stays 2/2.
  - **Negative** for screenshot or computer-use agents that work like a person (select text, Ctrl+A/Ctrl+C, right-click "copy link") when a user asks them to quote or summarize a passage. These actions fail silently.
  - **No protection** against scraping: `view-source:`, Reader mode, disabling JS, `curl`, DevTools from the browser menu, and macOS Cmd+C all bypass it. The keydown check uses `e.ctrlKey` only, and the CSS `user-select` is the only thing that stops Cmd+C. PrintScreen cannot actually be blocked by a page.
  - Net effect: the script costs real readers and gives no protection against the automated copying it is presumably aimed at. Legal protection of the content already comes from "3. Fikri Mülkiyet" in `/kullanim-kosullari`.
- **Fix:**
  1. `public/script.js`: delete everything from `document.addEventListener("contextmenu",` to the end of the file (4 listeners: `contextmenu`, `keydown`, `copy`, `dragstart`).
  2. `public/style.css`: delete the rule `.article-content,.blog-card__excerpt,…,body,h1,h2,h3,h4,h5,h6,li,p,td,th{-webkit-user-select:none;…;user-select:none}`, and the paired `input,select,textarea{user-select:text}` override, which is no longer needed. Keep `user-select:none` only on UI controls such as `.pillar-trigger`.
  3. Optional, non-blocking alternative if attribution is the real goal: on `copy`, append a source line instead of cancelling, for example `e.clipboardData.setData('text/plain', sel + '\n\nKaynak: ' + location.href); e.preventDefault();`, and only when the selection is longer than about 200 characters.
- **Success check:** on any article you can select text, right-click, Ctrl+C, Ctrl+A and Ctrl+P. `grep -c 'contextmenu\|user-select:none' public/script.js public/style.css` returns only the intended UI rules. Lighthouse Agentic stays 2/2.

### AG-03 — P1 — Contact flow cannot complete; no fallback channel
- **Evidence:** `src/lib/contact.ts:38` → `submitContact()` always returns `{ ok: false, reason: 'not-configured' }`, so every valid submission on `/iletisim` shows "Mesajınız şu anda gönderilemedi". There are no `mailto:`, `tel:`, WhatsApp or social links on `/`, `/iletisim` or in the footer (`dist/index.html` has no outbound links at all). The form markup itself is agent-friendly: real `<form id="contactForm">`, labelled inputs, `autocomplete="name|email"`, `aria-describedby` error slots, and `role="status"` result region.
- **Fix:** implement `submitContact` (for example a POST to a Plesk PHP mail endpoint or a form service), and make the success message persist (it already uses `role="status"`; do not auto-hide it). Until then, add a visible fallback in `src/pages/iletisim.astro`: a `mailto:` address and/or the hospital appointment line, with a link. Once it submits, consider declarative WebMCP on this form (`toolname="iletisim_formu_gonder"`, `tooldescription`, a `toolparamdescription` on each field) as a **P2** enhancement; keep the human Submit click (a send action is consequential).
- **Success check:** a test submission on staging shows the success message and arrives in the inbox. `agentic_check.py https://…/iletisim` reports `forms: 1`. If WebMCP is added, Lighthouse `webmcp-form-coverage` passes and `webmcp-schema-validity` has no warnings.

### AG-04 — P1 — Hover-only desktop megamenu; non-functional header search
- **Evidence:**
  - `public/style.css`: `.has-megamenu:hover .megamenu{display:block}` with no `:focus-within` equivalent. On desktop the 3 megamenus (Longevity, Skin Longevity, Keşfet) open only on mouse hover, so their about 30 links are absent from the accessibility tree (Agent-UX: 66 anchors in HTML vs 35 link nodes in the tree) and unreachable by Tab. The trigger links still go to the hub pages, so content is reachable in one extra hop.
  - `src/components/Header.astro:27-34`: `<input type="search" aria-label="Ara">` + `<button aria-label="Ara">` with no `<form>`, no `action` and no JS handler. It looks like site search but does nothing for users or agents.
- **Fix:**
  - `public/style.css`: duplicate each hover rule for focus, for example `.has-megamenu:hover .megamenu, .has-megamenu:focus-within .megamenu{display:block;…}`. In `Header.astro`, give each `.menu-trigger` `aria-haspopup="true"` and an `aria-expanded` state toggled on focus or click.
  - Search: either remove the search box, or wrap it in `<form action="https://www.google.com/search" method="get" role="search">` with a hidden `q` prefix `site:muhammedikbalbakirci.com`, or ship a static client index (for example Pagefind) with a `/ara?q=` results page.
- **Success check:** Tab from "Longevity" opens the megamenu and reaches "Otofaji". Typing in "Ara" and pressing Enter shows results, or the field is gone.

### AG-05 — P1 (info) — No `/llms.txt`
- **Evidence:** `https://dr-bakirci-revizyon.surge.sh/llms.txt` → 404, and production `/llms.txt` → 404. Lighthouse marks `llms-txt` N/A. Google Search ignores llms.txt, and no consumer agent is confirmed to read it. It is a low-cost discovery file.
- **Fix:** add `public/llms.txt`:
  ```
  # Dr. Muhammed İkbal Bakırcı
  > Hekim, VM Medical Park Bursa Hastanesi Başhekimi. Longevity, sağlıklı yaşlanma ve medikal estetik üzerine kaynaklı, Türkçe sağlık içerikleri. Tıbbi tavsiye yerine geçmez.

  ## Ana sayfalar
  - [Hakkında](https://www.muhammedikbalbakirci.com/hakkinda): özgeçmiş ve uzmanlık alanları
  - [Longevity](https://www.muhammedikbalbakirci.com/longevity): sağlıklı yaş almanın 6 alanı
  - [Skin Longevity ve Medikal Estetik](https://www.muhammedikbalbakirci.com/medikal-estetik)
  - [Makaleler](https://www.muhammedikbalbakirci.com/blog): tüm yazılar
  - [İletişim](https://www.muhammedikbalbakirci.com/iletisim)

  ## Makaleler
  - [Otofaji Nedir ve Nasıl Aktive Edilir?](https://www.muhammedikbalbakirci.com/blog/otofaji-nedir)
  …(generate one line per post from the content collection, e.g. an Astro endpoint src/pages/llms.txt.ts)
  ```
- **Success check:** `agentic_check.py` `llms-txt` is `pass`, and Lighthouse moves to 3/3 with `llms-txt` passing.

### AG-06 — P2 (opportunity) — Markdown delivery
- **Evidence:** `Accept: text/markdown` returns HTML, there is no `rel="alternate" type="text/markdown"`, and `/index.md` is 404.
- **Fix (optional):** add `src/pages/blog/[slug].md.ts` returning `post.body` with `Content-Type: text/markdown; charset=utf-8`, plus `<link rel="alternate" type="text/markdown" href="/blog/{slug}.md">` in `[slug].astro`. The articles are already Markdown, so this is low effort. No consumer agent is confirmed to request it.
- **Success check:** `agentic_check.py` `markdown-delivery` finds the alternate and the `.md` sibling returns 200.

### Passed
- `server-rendered` pass: primary content is present without JS (474 words on `/`). This is a static Astro build.
- `robots-reachable` pass (production `robots.txt` 200). `http-404` pass: unknown URLs return a real 404, not a catch-all 200.
- Lighthouse `agent-accessibility-tree` pass on 3 templates: all 33 axe rules are clean. Real `<button>`s and `<a href>`s, a named hamburger (`aria-label`, `aria-expanded`, `aria-controls`), a labelled `<nav aria-label="Ana navigasyon">`, a share section `aria-labelledby`, and 0 unnamed interactive nodes.
- CLS 0 (lab) on all tested pages.
- No CAPTCHA or bot challenge on content (surge/static).

## Access policy (production `public/robots.txt`: `User-agent: * / Allow: /`, Sitemap declared)
- **Training** (GPTBot, ClaudeBot, Google-Extended, …): **allowed** (no named group; falls to `*`). Whether to allow training is the owner's business decision. Ask before adding `Disallow` or `ai-train=no`; this audit does not recommend either by default.
- **Search / answer engines** (OAI-SearchBot, Claude-SearchBot, PerplexityBot, Googlebot, Bingbot): **allowed**.
- **User-triggered agents** (ChatGPT-User, Claude-User, Perplexity-User, Google-Agent): **allowed**. There are no private paths, so the fact that some of these treat robots.txt as non-binding does not matter here.
- **Content-Signal:** none. Optional, once the owner chooses a policy: add `Content-Signal: search=yes, ai-input=yes, ai-train=<owner's choice>` inside the `User-agent: *` group in `public/robots.txt`. It is a stated preference with no confirmed effect, and Google does not act on it.
- **WAF test:** not run (no authorization for `--ua-matrix`). Static hosting with no WAF was observed.

## Standards status (from `skills/seo-agentic/references/vendor-matrix.md`, facts checked 2026-09-23, 12 days before this audit)
- **WebMCP:** W3C Community Group draft, Chrome origin trial (M149–M156). WebKit opposes it and Mozilla is neutral. Optional enhancement only.
- **Content-Signal:** Cloudflare Content Signals Policy (CC0, 2025-09-24). The IETF individual draft `draft-romm-aipref-contentsignals` expired 2026-04-04, and the AIPREF WG vocabulary has not reached consensus. It is a preference, not enforcement.
- **ai-catalog.json (ARD):** draft spec (agenticresourcediscovery.org). Not applicable to this site.
- **llms.txt:** community spec (llmstxt.org). Lighthouse checks it and Google Search ignores it.
- **Web Bot Auth:** `draft-ietf-webbotauth-httpsig-protocol-00` (2026-09-01). Nothing for this site to publish.

## Recommendations (in order)
1. **AG-01** (P0): convert quiz options to radios or buttons. Rerun `agent_ux_check.py` on `/quizler` and test with the keyboard.
2. **AG-02** (P1): remove the copy-protection listeners and the `user-select:none` rule. Verify selection and printing manually.
3. **AG-03** (P1): wire up `submitContact` and add a fallback contact channel. Verify with a test submission.
4. **AG-04** (P1): add `:focus-within` to the megamenu and fix or remove the search box. Verify with Tab navigation.
5. **AG-05** (P1-info): publish `llms.txt`. Rerun Lighthouse and expect 3/3.
6. **AG-06** (P2): offer optional Markdown alternates for articles. After AG-03, consider declarative WebMCP on the contact form.

None of these items is promised to change rankings, citations or traffic.
