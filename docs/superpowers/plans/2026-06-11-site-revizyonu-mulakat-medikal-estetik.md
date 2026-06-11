# Site Revizyonu (Mülakatlı Kurs + Medikal Estetik) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Spec'teki revizyonu uygulamak: mülakatla kurs kaydı, Medikal Estetik sekmesi + 3 yeni sayfa, 5 manşetlik hero slider, marka/abartı temizliği, WhatsApp yönlendirme, içerik koruması ve ücretli makale kilit arayüzü.

**Architecture:** Statik HTML sitesi (~25 sayfa, ortak header/footer her dosyada kopya). Site geneli değişiklikler PowerShell batch replace ile (3 göreli-yol varyantı: kök `pages/...`, pages içi `...`, blog içi `../pages/...`); sayfa-özel değişiklikler Edit ile. Test framework yok — doğrulama grep sayımları + link kontrol script'i ile yapılır.

**Tech Stack:** Vanilla HTML/CSS/JS, PowerShell (batch düzenleme), git.

**Spec:** `docs/superpowers/specs/2026-06-11-site-revizyonu-mulakat-medikal-estetik-design.md`

**Sabitler:**
- WhatsApp yer tutucu numara: `905000000000` (kullanıcı gerçek numarayı iletince site genelinde `905000000000` araması ile tek seferde değiştirilecek)
- Logo unvan yer tutucu: `Tıp Doktoru`
- Hero manşetleri yer tutucu (kullanıcı 5 manşet iletecek)

**Genel kurallar:**
- Batch script'lerde `claude-skills`, `scratch`, `node_modules` klasörleri hariç tutulur.
- Tüm dosyalar UTF-8; PowerShell'de `Get-Content -Raw -Encoding UTF8` / `Set-Content -Encoding UTF8 -NoNewline` kullan.
- Her görev kendi commit'iyle biter. Çalışma ağacında bu plana ait OLMAYAN değişiklikler var olabilir — `git add` daima dosya adlarıyla yapılır, asla `git add -A` kullanılmaz.

---

### Task 1: Yeni sayfa — pages/medikal-estetik.html

**Files:**
- Create: `pages/medikal-estetik.html` (taban: `pages/kurslar.html` kopyası)

- [ ] **Step 1: kurslar.html'i kopyala**

```powershell
Copy-Item "pages\kurslar.html" "pages\medikal-estetik.html"
```

- [ ] **Step 2: `<title>` ve sayfa içi `<style>` bloğunu değiştir**

`pages/medikal-estetik.html` içinde `<title>Kurslar — Dr. Muhammed İkbal Bakırcı</title>` satırını şununla değiştir:

```html
<title>Medikal Estetik &amp; Güzellik — Dr. Muhammed İkbal Bakırcı</title>
```

`<style>` bloğunun içeriğini (mevcut `.pg-hero` kuralları dahil hepsini) şununla değiştir:

```css
    .pg-hero{background:var(--main);color:#fff;padding:80px 0;}
    .pg-hero__title{font-size:clamp(32px,5vw,52px);font-weight:900;margin-bottom:16px;}
    .pg-hero__sub{font-size:18px;opacity:.75;max-width:640px;}
    .estetik-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:28px;padding:64px 0 32px;}
    @media(max-width:700px){.estetik-grid{grid-template-columns:1fr;}}
    .estetik-card{background:var(--base);border-radius:var(--r-lg);overflow:hidden;box-shadow:var(--shadow);transition:box-shadow .2s,transform .2s;}
    .estetik-card:hover{box-shadow:var(--shadow-md);transform:translateY(-2px);}
    .estetik-card__img{width:100%;aspect-ratio:16/9;object-fit:cover;}
    .estetik-card__body{padding:24px;}
    .estetik-card__tag{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--primary);background:var(--tertiary);padding:3px 10px;border-radius:99px;display:inline-block;margin-bottom:12px;}
    .estetik-card__title{font-size:18px;font-weight:700;margin-bottom:8px;}
    .estetik-card__desc{font-size:14px;color:var(--gray-500);line-height:1.6;margin-bottom:16px;}
    .estetik-card__cta{font-size:13px;font-weight:700;color:var(--blue);}
    .estetik-card__cta:hover{text-decoration:underline;}
    .estetik-cta{background:var(--gray-50,#f7f7f7);border-radius:var(--r-lg);padding:40px;display:flex;align-items:center;justify-content:space-between;gap:24px;margin-bottom:64px;flex-wrap:wrap;}
    .estetik-cta h2{font-size:24px;font-weight:800;margin-bottom:8px;}
    .estetik-cta p{font-size:15px;color:var(--gray-500);}
```

- [ ] **Step 3: `<main>...</main>` içeriğini değiştir**

Mevcut `<main>` bloğunun tamamını (pg-hero + courses-grid section) şununla değiştir:

```html
  <main>
    <section class="pg-hero"><div class="container"><h1 class="pg-hero__title">Medikal Estetik &amp; Güzellik</h1><p class="pg-hero__sub">Cilt sağlığı, gençleşme ve estetik uygulamalar üzerine bilimsel temelli içerikler.</p></div></section>
    <section class="section"><div class="container">
      <div class="estetik-grid">
        <div class="estetik-card"><img src="../assets/images/generated/topics/quiz_inflammation.png" alt="Cilt sağlığı görseli" class="estetik-card__img" /><div class="estetik-card__body"><span class="estetik-card__tag">Cilt Sağlığı</span><h3 class="estetik-card__title">Cilt Sağlığının Temelleri</h3><p class="estetik-card__desc">Cilt bariyeri, nem dengesi ve günlük bakım rutini üzerine bilimsel temelli yaklaşımlar.</p><a href="../blog/senolitik-tedaviler-cilt-genclesmesi-zombi-hucreler.html" class="estetik-card__cta">İlgili makaleyi oku &rarr;</a></div></div>
        <div class="estetik-card"><img src="../assets/images/generated/topics/cellular-science.png" alt="Cilt gençleşmesi görseli" class="estetik-card__img" /><div class="estetik-card__body"><span class="estetik-card__tag">Gençleşme</span><h3 class="estetik-card__title">Cilt Gençleşmesi ve Hücresel Yenilenme</h3><p class="estetik-card__desc">Senolitik araştırmalardan kolajen üretimine — cilt yaşlanmasının bilimsel arka planı.</p><a href="../blog/senolitik-tedaviler-cilt-genclesmesi-zombi-hucreler.html" class="estetik-card__cta">Makaleyi oku &rarr;</a></div></div>
        <div class="estetik-card"><img src="../assets/images/generated/topics/kurslar.png" alt="Medikal estetik uygulamaları görseli" class="estetik-card__img" /><div class="estetik-card__body"><span class="estetik-card__tag">Medikal Estetik</span><h3 class="estetik-card__title">Medikal Estetik Uygulamaları</h3><p class="estetik-card__desc">Uygulamalar, beklentiler ve doğru bilgilendirme. İçerikler yakında eklenecek.</p><a href="../blog/index.html" class="estetik-card__cta">İçerik kütüphanesine git &rarr;</a></div></div>
        <div class="estetik-card"><img src="../assets/images/generated/topics/kortizol-stres.png" alt="Güzellik ve bakım görseli" class="estetik-card__img" /><div class="estetik-card__body"><span class="estetik-card__tag">Güzellik</span><h3 class="estetik-card__title">Güzellik &amp; Bakım</h3><p class="estetik-card__desc">İçten dışa güzellik: beslenme, uyku ve stresin cilt üzerindeki etkileri. İçerikler yakında eklenecek.</p><a href="../blog/index.html" class="estetik-card__cta">İçerik kütüphanesine git &rarr;</a></div></div>
      </div>
      <div class="estetik-cta">
        <div><h2>Değerlendirme için randevu</h2><p>Medikal estetik ve cilt sağlığı görüşmeleri WhatsApp üzerinden planlanmaktadır.</p></div>
        <a href="https://wa.me/905000000000?text=Merhaba%2C%20medikal%20estetik%20de%C4%9Ferlendirmesi%20i%C3%A7in%20randevu%20talep%20ediyorum." class="btn btn-dark">WhatsApp'tan Randevu Al</a>
      </div>
    </div></section>
  </main>
```

- [ ] **Step 4: Doğrula** — görsellerin varlığını kontrol et:

```powershell
Test-Path "assets\images\generated\topics\quiz_inflammation.png", "assets\images\generated\topics\cellular-science.png", "assets\images\generated\topics\kurslar.png", "assets\images\generated\topics\kortizol-stres.png"
```

Beklenen: dört satır `True`. `False` çıkan olursa o kartın `src`'sini `../assets/images/generated/topics/kurslar.png` ile değiştir.

- [ ] **Step 5: Commit**

```powershell
git add pages/medikal-estetik.html && git commit -m "feat: medikal estetik & guzellik sayfasi"
```

---

### Task 2: Yeni sayfa — pages/podcast.html

**Files:**
- Create: `pages/podcast.html` (taban: `pages/kurslar.html` kopyası)

- [ ] **Step 1: Kopyala**

```powershell
Copy-Item "pages\kurslar.html" "pages\podcast.html"
```

- [ ] **Step 2: `<title>` değiştir**

```html
<title>Podcast — Dr. Muhammed İkbal Bakırcı</title>
```

- [ ] **Step 3: `<style>` bloğu içeriğini değiştir**

```css
    .pg-hero{background:var(--main);color:#fff;padding:80px 0;}
    .pg-hero__title{font-size:clamp(32px,5vw,52px);font-weight:900;margin-bottom:16px;}
    .pg-hero__sub{font-size:18px;opacity:.75;max-width:640px;}
    .episode-list{display:flex;flex-direction:column;gap:24px;padding:64px 0;max-width:820px;margin:0 auto;}
    .episode{display:flex;gap:24px;background:var(--base);border-radius:var(--r-lg);box-shadow:var(--shadow);overflow:hidden;}
    @media(max-width:640px){.episode{flex-direction:column;}}
    .episode__img{width:200px;flex-shrink:0;object-fit:cover;}
    @media(max-width:640px){.episode__img{width:100%;aspect-ratio:16/9;}}
    .episode__body{padding:24px;}
    .episode__no{font-size:11px;font-weight:700;letter-spacing:.5px;color:var(--blue);text-transform:uppercase;margin-bottom:8px;display:block;}
    .episode__title{font-size:19px;font-weight:800;margin-bottom:8px;}
    .episode__desc{font-size:14px;color:var(--gray-500);line-height:1.6;margin-bottom:12px;}
    .episode__note{font-size:12px;color:var(--gray-500);font-style:italic;}
```

- [ ] **Step 4: `<main>` içeriğini değiştir**

```html
  <main>
    <section class="pg-hero"><div class="container"><h1 class="pg-hero__title">Podcast</h1><p class="pg-hero__sub">Sağlık, beslenme ve yaşam üzerine sohbetler. Bölüm metinleri yayınlandıkça burada paylaşılacak.</p></div></section>
    <section class="section"><div class="container">
      <div class="episode-list">
        <!-- YER TUTUCU: bölüm başlıkları ve metinler (transkriptler) kullanıcıdan gelince doldurulacak -->
        <article class="episode"><img src="../assets/images/generated/podcast.png" alt="Podcast bölüm kapağı" class="episode__img" /><div class="episode__body"><span class="episode__no">Bölüm 1</span><h2 class="episode__title">İlk bölüm yakında</h2><p class="episode__desc">Bölüm açıklaması ve metni (transkript) yayınlandığında bu alanda yer alacak.</p><p class="episode__note">Bölüm metni eklenecek.</p></div></article>
        <article class="episode"><img src="../assets/images/generated/podcast.png" alt="Podcast bölüm kapağı" class="episode__img" /><div class="episode__body"><span class="episode__no">Bölüm 2</span><h2 class="episode__title">Yakında</h2><p class="episode__desc">Bölüm açıklaması ve metni (transkript) yayınlandığında bu alanda yer alacak.</p><p class="episode__note">Bölüm metni eklenecek.</p></div></article>
        <article class="episode"><img src="../assets/images/generated/podcast.png" alt="Podcast bölüm kapağı" class="episode__img" /><div class="episode__body"><span class="episode__no">Bölüm 3</span><h2 class="episode__title">Yakında</h2><p class="episode__desc">Bölüm açıklaması ve metni (transkript) yayınlandığında bu alanda yer alacak.</p><p class="episode__note">Bölüm metni eklenecek.</p></div></article>
      </div>
    </div></section>
  </main>
```

- [ ] **Step 5: Commit**

```powershell
git add pages/podcast.html && git commit -m "feat: podcast sayfasi — bolum listesi iskeleti"
```

---

### Task 3: Yeni sayfa — pages/soylesiler.html

**Files:**
- Create: `pages/soylesiler.html` (taban: `pages/kurslar.html` kopyası)

- [ ] **Step 1: Kopyala**

```powershell
Copy-Item "pages\kurslar.html" "pages\soylesiler.html"
```

- [ ] **Step 2: `<title>` değiştir**

```html
<title>Birebir Söyleşiler — Dr. Muhammed İkbal Bakırcı</title>
```

- [ ] **Step 3: `<style>` bloğu içeriğini değiştir**

```css
    .pg-hero{background:var(--main);color:#fff;padding:80px 0;}
    .pg-hero__title{font-size:clamp(32px,5vw,52px);font-weight:900;margin-bottom:16px;}
    .pg-hero__sub{font-size:18px;opacity:.75;max-width:640px;}
    .talks-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:28px;padding:64px 0;}
    @media(max-width:760px){.talks-grid{grid-template-columns:1fr;}}
    .talk-card{background:var(--base);border-radius:var(--r-lg);overflow:hidden;box-shadow:var(--shadow);}
    .talk-card__video{aspect-ratio:16/9;background:#0C0809;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:rgba(255,255,255,.65);font-size:13px;}
    .talk-card__body{padding:24px;}
    .talk-card__guest{font-size:11px;font-weight:700;letter-spacing:.5px;color:var(--blue);text-transform:uppercase;margin-bottom:8px;display:block;}
    .talk-card__title{font-size:18px;font-weight:800;margin-bottom:8px;}
    .talk-card__desc{font-size:14px;color:var(--gray-500);line-height:1.6;}
```

- [ ] **Step 4: `<main>` içeriğini değiştir**

```html
  <main>
    <section class="pg-hero"><div class="container"><h1 class="pg-hero__title">Birebir Söyleşiler</h1><p class="pg-hero__sub">Dr. Muhammed İkbal'in konuklarıyla yaptığı video söyleşiler. Yeni bölümler yayınlandıkça burada paylaşılacak.</p></div></section>
    <section class="section"><div class="container">
      <div class="talks-grid">
        <!-- YER TUTUCU: video linkleri (YouTube embed) kullanıcıdan gelince .talk-card__video kutusu iframe ile değiştirilecek -->
        <article class="talk-card"><div class="talk-card__video"><svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg><span>Video yakında eklenecek</span></div><div class="talk-card__body"><span class="talk-card__guest">Konuk: Yakında</span><h2 class="talk-card__title">İlk söyleşi yakında</h2><p class="talk-card__desc">Söyleşi konusu ve konuk bilgisi yayınlandığında bu alanda yer alacak.</p></div></article>
        <article class="talk-card"><div class="talk-card__video"><svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg><span>Video yakında eklenecek</span></div><div class="talk-card__body"><span class="talk-card__guest">Konuk: Yakında</span><h2 class="talk-card__title">Yakında</h2><p class="talk-card__desc">Söyleşi konusu ve konuk bilgisi yayınlandığında bu alanda yer alacak.</p></div></article>
      </div>
    </div></section>
  </main>
```

- [ ] **Step 5: Commit**

```powershell
git add pages/soylesiler.html && git commit -m "feat: birebir soylesiler sayfasi — video iskeleti"
```

---

### Task 4: Site geneli isim değişikliği — "Dr. Bakırcı" → "Dr. Muhammed İkbal"

**Files:**
- Modify: tüm `*.html` (kök, `pages/`, `blog/`)

- [ ] **Step 1: Mevcut durumu say** (sonradan kıyas için)

```powershell
(Get-ChildItem -Recurse -Filter *.html | Where-Object { $_.FullName -notmatch 'claude-skills|scratch|node_modules' } | Select-String -Pattern 'Dr\. Bakırcı' -Encoding UTF8).Count
```

Beklenen: 0'dan büyük bir sayı (≈40+).

- [ ] **Step 2: Batch replace çalıştır**

Önce genitif ek ("Dr. Bakırcı'nın" → "Dr. Muhammed İkbal'in"; kesme işareti hem `'` hem `’` olabilir), sonra kalan düz geçişler:

```powershell
Get-ChildItem -Recurse -Filter *.html | Where-Object { $_.FullName -notmatch 'claude-skills|scratch|node_modules' } | ForEach-Object {
  $t = Get-Content $_.FullName -Raw -Encoding UTF8
  $t = $t -replace "Dr\. Bakırcı(['’])nın", 'Dr. Muhammed İkbal${1}in'
  $t = $t -replace "Dr\. Bakırcı", 'Dr. Muhammed İkbal'
  Set-Content $_.FullName $t -Encoding UTF8 -NoNewline
}
```

- [ ] **Step 3: Doğrula**

```powershell
Get-ChildItem -Recurse -Filter *.html | Where-Object { $_.FullName -notmatch 'claude-skills|scratch|node_modules' } | Select-String -Pattern "Dr\. Bakırcı|Bakırcı['’]n" -Encoding UTF8
```

Beklenen: çıktı boş. (Not: "Dr. Muhammed İkbal Bakırcı" tam adı ve logo span'ları etkilenmez — onlarda "Dr. Bakırcı" bitişik geçmiyor.)

- [ ] **Step 4: Gözle kontrol** — `git diff --stat` ile dosya listesine bak, bir dosyada `git diff pages/hakkinda.html` ile değişimin doğal okunduğunu kontrol et ("Dr. Muhammed İkbal'in" gibi).

- [ ] **Step 5: Commit**

```powershell
git add *.html pages/*.html blog/*.html && git commit -m "feat: marka — Dr. Bakirci yerine Dr. Muhammed Ikbal"
```

---

### Task 5: Abartı temizliği

**Files:**
- Modify: tüm `*.html` (footer tagline batch), `index.html`, `pages/hakkinda.html`, `pages/basari-hikayeleri.html`

- [ ] **Step 1: Footer tagline batch**

```powershell
Get-ChildItem -Recurse -Filter *.html | Where-Object { $_.FullName -notmatch 'claude-skills|scratch|node_modules' } | ForEach-Object {
  $t = Get-Content $_.FullName -Raw -Encoding UTF8
  $t = $t.Replace('40 milyondan fazla üyeye katılın.', 'Sağlık bültenimize abone olun.')
  Set-Content $_.FullName $t -Encoding UTF8 -NoNewline
}
```

- [ ] **Step 2: index.html sayaç ve iddia temizliği** — aşağıdaki birebir değişimleri Edit ile yap:

| Eski | Yeni |
|---|---|
| `Tüm makaleleri gör (412)` | `Tüm makaleleri gör` |
| `Tüm hikayeleri gör (163)` | `Tüm hikayeleri gör` |
| `Tüm bölümleri gör (743)` | `Tüm bölümleri gör` |
| `YouTube'da sağlık, beslenme ve longevity hakkında 3.000'den fazla ücretsiz video.` | `YouTube'da sağlık, beslenme ve longevity üzerine ücretsiz videolar.` |
| `Dr. Muhammed İkbal Bakırcı, MD Specialist in Longevity Science` | `Dr. Muhammed İkbal Bakırcı ile Sağlıklı Yaşam` |
| `#1 makro kalkulatörümüzle longevity hedeflerinize ulaşın` | `Makro kalkulatörümüzle beslenme hedeflerinizi planlayın` |
| `34 kg vererek pre-diyabetimi tersine çevirdim` | `Beslenme düzenimle birlikte değerlerim iyileşti` |
| `90 günde kan şekerim normale döndü` | `90 günde kan şekeri değerlerim belirgin iyileşti` |
| `Doktorum şoke oldu. Aralıklı oruç ve doğru beslenmeyle HbA1c değerim önemli ölçüde düştü.` | `Aralıklı oruç ve doğru beslenmeyle, doktor takibinde HbA1c değerim önemli ölçüde düştü.` |
| `8 haftada 22 kg verdim, enerji doluyum` | `8 haftada kendimi çok daha enerjik hissediyorum` |
| `6 ay sonra kronik yorgunluğum tamamen geçti` | `6 ayda yorgunluğumda büyük azalma hissettim` |
| `Tiroid sağlığım longevity diyetiyle düzeldi` | `Beslenme değişikliği tiroid sürecime iyi geldi` |

- [ ] **Step 3: pages/hakkinda.html** — şu değişimi yap:

| Eski | Yeni |
|---|---|
| `konularında Türkiye'nin öncü ismi olan` | `konularında çalışmalar yürüten` |

- [ ] **Step 4: pages/basari-hikayeleri.html** — şu birebir değişimleri yap:

| Eski | Yeni |
|---|---|
| `1.240'tan fazla kişi Dr. Muhammed İkbal'in protokolleriyle hayatını dönüştürdü. İşte onların gerçek hikayeleri.` | `Danışanlarımızın deneyimlerinden ilham veren hikayeler.` |
| `doktorumun takibiyle pre-diyabet teşhisim tamamen ortadan kalktı. HbA1c değerim ideal seviyelere ulaştı.` | `doktorumun takibinde değerlerim belirgin şekilde iyileşti.` |
| `Kan şekerim tamamen normal seviyelere çekildi ve ilaç yükümden kurtuldum.` | `Kan şekeri değerlerim doktorumun takibinde önemli ölçüde iyileşti.` |
| `Tiroid antikor değerlerimde inanılmaz bir düşüş gerçekleşti ve metabolizmam yeniden çalışmaya başladı. Bu diyet benim için adeta bir şifa reçetesi oldu.` | `Doktor takibinde tiroid değerlerimde iyileşme gözlendi ve kendimi çok daha iyi hissediyorum.` |
| `3 ayda direncim tamamen kırıldı. Artık ne uyku krizleri var ne de sürekli açlık hissi.` | `3 ayın sonunda ölçümlerimde belirgin iyileşme oldu; gün içi enerjim arttı.` |

Ayrıca bu sayfada kart başlıklarında index.html'dekiyle aynı hikaye başlıkları varsa (`34 kg vererek...`, `90 günde kan şekerim...` vb.) Step 2'deki tabloyla aynı şekilde değiştir (grep ile bul: `Select-String -Path pages\basari-hikayeleri.html -Pattern '34 kg|90 günde|22 kg|kronik yorgunluğum|longevity diyetiyle'`).

- [ ] **Step 5: Doğrula**

```powershell
Get-ChildItem -Recurse -Filter *.html | Where-Object { $_.FullName -notmatch 'claude-skills|scratch|node_modules' } | Select-String -Pattern "40 milyon|öncü ismi|1\.240|teşhisim tamamen|ilaç yükümden|şifa reçetesi|MD Specialist" -Encoding UTF8
```

Beklenen: çıktı boş.

- [ ] **Step 6: Commit**

```powershell
git add index.html pages/*.html blog/*.html && git commit -m "feat: abartili ifade ve dogrulanamayan sayilarin temizligi"
```

---

### Task 6: Logo — isim ve unvan alt alta

**Files:**
- Modify: tüm `*.html` (header logo), `style.css:206-229`

- [ ] **Step 1: 3-span'lı logoyu batch değiştir** (index + pages + bazı blog dosyaları bu formattadır)

Eski (tek satır, tüm dosyalarda birebir aynı):

```html
<span class="site-logo__text"><span class="site-logo__dr">Dr.</span> <span class="site-logo__name">Muhammed İkbal</span> <span class="site-logo__surname">Bakırcı</span></span>
```

Yeni:

```html
<span class="site-logo__text"><span class="site-logo__fullname"><span class="site-logo__dr">Dr.</span> <span class="site-logo__name">Muhammed İkbal</span> <span class="site-logo__surname">Bakırcı</span></span><span class="site-logo__role">Tıp Doktoru</span></span>
```

```powershell
$old = '<span class="site-logo__text"><span class="site-logo__dr">Dr.</span> <span class="site-logo__name">Muhammed İkbal</span> <span class="site-logo__surname">Bakırcı</span></span>'
$new = '<span class="site-logo__text"><span class="site-logo__fullname"><span class="site-logo__dr">Dr.</span> <span class="site-logo__name">Muhammed İkbal</span> <span class="site-logo__surname">Bakırcı</span></span><span class="site-logo__role">Tıp Doktoru</span></span>'
Get-ChildItem -Recurse -Filter *.html | Where-Object { $_.FullName -notmatch 'claude-skills|scratch|node_modules' } | ForEach-Object {
  $t = Get-Content $_.FullName -Raw -Encoding UTF8
  $t = $t.Replace($old, $new)
  Set-Content $_.FullName $t -Encoding UTF8 -NoNewline
}
```

- [ ] **Step 2: Basit metinli logoları bul ve aynı yapıya çevir** (blog sayfalarında `<span class="site-logo__text">Dr. Muhammed İkbal</span>` formatı var — Task 4 sonrası bu metin "Dr. Muhammed İkbal" oldu)

```powershell
$old2 = '<span class="site-logo__text">Dr. Muhammed İkbal</span>'
$new2 = '<span class="site-logo__text"><span class="site-logo__fullname"><span class="site-logo__dr">Dr.</span> <span class="site-logo__name">Muhammed İkbal</span> <span class="site-logo__surname">Bakırcı</span></span><span class="site-logo__role">Tıp Doktoru</span></span>'
Get-ChildItem -Recurse -Filter *.html | Where-Object { $_.FullName -notmatch 'claude-skills|scratch|node_modules' } | ForEach-Object {
  $t = Get-Content $_.FullName -Raw -Encoding UTF8
  $t = $t.Replace($old2, $new2)
  Set-Content $_.FullName $t -Encoding UTF8 -NoNewline
}
```

- [ ] **Step 3: CSS güncelle** — `style.css` içinde `.site-logo__text { ... }` kuralını şununla değiştir (mevcut `font-size: 19px;` ile başlayan blok):

```css
.site-logo__text {
  font-size: 19px;
  letter-spacing: -0.3px;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  line-height: 1.2;
}
.site-logo__fullname {
  display: flex;
  align-items: center;
  gap: 5px;
}
.site-logo__role {
  /* YER TUTUCU unvan — kesin metin kullanıcıdan gelecek */
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--gray-500);
}
```

Ve mobil medya kuralını güncelle — eski:

```css
@media (max-width: 640px) {
  .site-logo__text { font-size: 15px; }
  .site-logo__name { display: none; } /* Sophisticated responsive hiding of middle name on small devices */
}
```

yeni:

```css
@media (max-width: 640px) {
  .site-logo__text { font-size: 15px; }
  .site-logo__name { display: none; }
  .site-logo__role { display: none; }
}
```

- [ ] **Step 4: Doğrula**

```powershell
(Get-ChildItem -Recurse -Filter *.html | Where-Object { $_.FullName -notmatch 'claude-skills|scratch|node_modules' } | Select-String -Pattern 'site-logo__role' -Encoding UTF8).Count
```

Beklenen: header'ı olan tüm sayfaların sayısı kadar (≈25). Ayrıca `index.html`'i tarayıcıda aç, logoda isim üstte / "TIP DOKTORU" altta görünmeli.

- [ ] **Step 5: Commit**

```powershell
git add *.html pages/*.html blog/*.html style.css && git commit -m "feat: logo — isim ve unvan alt alta (unvan yer tutucu)"
```

---

### Task 7: Navigasyon — Programlar, Mini Kurs silme, Medikal Estetik sekmesi, Podcast/Söyleşi linkleri

**Files:**
- Modify: tüm `*.html` (megamenü + ana menü + footer), `script.js:7-50` (MENUS)

- [ ] **Step 1: Batch nav güncellemesi** — göreli yol önekine göre üç varyantı tek script'le uygula:

```powershell
Get-ChildItem -Recurse -Filter *.html | Where-Object { $_.FullName -notmatch 'claude-skills|scratch|node_modules' } | ForEach-Object {
  $pre = if ($_.FullName -match '\\pages\\') { '' } elseif ($_.FullName -match '\\blog\\') { '../pages/' } else { 'pages/' }
  $t = Get-Content $_.FullName -Raw -Encoding UTF8
  # 1) Mini Kurslar linkini sil
  $t = $t.Replace("<li><a href=`"${pre}kurslar.html`">Mini Kurslar</a></li>", '')
  # 2) Özel Projeler -> Programlar
  $t = $t.Replace('<h4 class="megamenu__title">Özel Projeler</h4>', '<h4 class="megamenu__title">Programlar</h4>')
  # 3) Referanslar sütununa Podcast + Birebir Söyleşiler ekle (Kurslar linkinin ardına)
  $t = $t.Replace("<li><a href=`"${pre}kurslar.html`">Kurslar</a></li>", "<li><a href=`"${pre}kurslar.html`">Kurslar</a></li><li><a href=`"${pre}podcast.html`">Podcast</a></li><li><a href=`"${pre}soylesiler.html`">Birebir Söyleşiler</a></li>")
  # 4) Ana menüye (ve footer Keşfet'e) Medikal Estetik ekle — Longevity linkinin ardına
  $t = $t.Replace("<li><a href=`"${pre}longevity.html`">Longevity</a></li>", "<li><a href=`"${pre}longevity.html`">Longevity</a></li><li><a href=`"${pre}medikal-estetik.html`">Medikal Estetik</a></li>")
  Set-Content $_.FullName $t -Encoding UTF8 -NoNewline
}
```

Not: 4. değişim footer "Keşfet" sütunundaki Longevity linkini de yakalar — Medikal Estetik footer'a da eklenir; bu istenen bir yan etkidir. 3. değişim footer "Hakkında" sütunundaki `Kurslar` linkini de yakalayabilir — bu da kabul edilebilir (footer'da Podcast/Söyleşi linki zarar vermez).

- [ ] **Step 2: Doğrula**

```powershell
Get-ChildItem -Recurse -Filter *.html | Where-Object { $_.FullName -notmatch 'claude-skills|scratch|node_modules' } | Select-String -Pattern 'Mini Kurslar|Özel Projeler' -Encoding UTF8
```

Beklenen: çıktı boş.

```powershell
(Get-ChildItem -Recurse -Filter *.html | Where-Object { $_.FullName -notmatch 'claude-skills|scratch|node_modules' } | Select-String -Pattern 'medikal-estetik\.html"\>Medikal Estetik' -Encoding UTF8).Count
```

Beklenen: 0'dan büyük (sayfa başına 1-2 eşleşme).

- [ ] **Step 3: script.js MENUS'a Medikal Estetik dropdown ekle** — `script.js` içinde `'Quizler': {` bloğundan ÖNCE şunu ekle:

```js
      'Medikal Estetik': {
        wide: false,
        items: [
          { href: p + 'blog/senolitik-tedaviler-cilt-genclesmesi-zombi-hucreler.html', label: 'Cilt Gençleşmesi' },
          { href: p + 'pages/medikal-estetik.html', label: 'Cilt Sağlığı' },
          { href: p + 'pages/medikal-estetik.html', label: 'Estetik Uygulamalar' },
          { href: p + 'pages/medikal-estetik.html', label: 'Güzellik & Bakım' },
        ],
        footer: { href: p + 'pages/medikal-estetik.html', label: 'Medikal Estetik sayfasına git →' },
      },
```

- [ ] **Step 4: Tarayıcıda kontrol** — `index.html` aç: ana menüde "Medikal Estetik" sekmesi Longevity'nin yanında, hover'da dropdown açılıyor; megamenüde "Programlar" başlığı ve Podcast/Birebir Söyleşiler linkleri var; "Mini Kurslar" hiçbir yerde yok.

- [ ] **Step 5: Commit**

```powershell
git add *.html pages/*.html blog/*.html script.js && git commit -m "feat: nav — Programlar, Medikal Estetik sekmesi, Podcast/Soylesi linkleri, Mini Kurs kaldirildi"
```

---

### Task 8: İçerik koruması (kopya/sağ tık engeli)

**Files:**
- Modify: `style.css` (dosya sonuna ekle), `script.js` (DOMContentLoaded bloğu içine ekle)

- [ ] **Step 1: CSS ekle** — `style.css` dosyasının sonuna:

```css
/* ─── İÇERİK KORUMASI ─── */
body {
  -webkit-user-select: none;
  user-select: none;
}
input, textarea {
  -webkit-user-select: text;
  user-select: text;
}
img {
  -webkit-user-drag: none;
}
```

- [ ] **Step 2: JS ekle** — `script.js` içinde, `DOMContentLoaded` callback'inin sonuna (kapanış `});`'dan önce):

```js
  // ── İçerik koruması ──
  (function initContentProtection() {
    ['contextmenu', 'copy', 'cut'].forEach(evt => {
      document.addEventListener(evt, (e) => {
        if (e.target.closest && e.target.closest('input, textarea')) return;
        e.preventDefault();
      });
    });
    document.addEventListener('dragstart', (e) => {
      if (e.target.tagName === 'IMG') e.preventDefault();
    });
  })();
```

- [ ] **Step 3: Tarayıcıda doğrula** — `index.html` aç: metin seçilemiyor, sağ tık menüsü açılmıyor, görsel sürüklenemiyor; iletişim sayfasındaki form alanlarına yazı yazılıp seçilebiliyor.

- [ ] **Step 4: Commit**

```powershell
git add style.css script.js && git commit -m "feat: icerik korumasi — secim/kopya/sag tik/suruklenme engeli"
```

---

### Task 9: Hero slider — 5 dönen manşet

**Files:**
- Modify: `index.html` (HERO section), `style.css:515-547`, `script.js`

- [ ] **Step 1: index.html HERO bölümünü değiştir** — mevcut blok:

```html
    <!-- HERO -->
    <section class="hero">
      <div class="hero__left">
        <p class="hero__name">Dr. Muhammed İkbal'in</p>
        <h1 class="hero__title">Longevity Başlangıç<br>Protokolü</h1>
        <p class="hero__quote">"Doğru bilgiyle uzun yıllar daha sağlıklı ve enerjik yaşayabilirsiniz."</p>
        <a href="pages/rehberler.html" class="btn btn-light hero__cta">ÜCRETSİZ Rehberini Al!</a>
      </div>
      <div class="hero__right" aria-hidden="true"></div>
    </section>
```

(Not: Task 4 sonrası `hero__name` metni "Dr. Muhammed İkbal'in" olmuştur; birebir eşleşme için önce dosyadaki güncel hâline bak.) Şununla değiştir:

```html
    <!-- HERO SLIDER -->
    <!-- MANŞET YER TUTUCU: 5 manşet metni kullanıcıdan gelince güncellenecek -->
    <section class="hero" id="heroSlider">
      <div class="hero-slide is-active">
        <div class="hero__left">
          <p class="hero__name">Dr. Muhammed İkbal</p>
          <h1 class="hero__title">Bilimsel veriler ışığında sağlığınızı uzun vadede korumayı öğrenin</h1>
          <p class="hero__quote">"Doğru bilgiyle uzun yıllar daha sağlıklı ve enerjik yaşayabilirsiniz."</p>
          <a href="pages/rehberler.html" class="btn btn-light hero__cta">Sağlık Rehberini İncele</a>
        </div>
        <div class="hero__right" aria-hidden="true"></div>
      </div>
      <div class="hero-slide">
        <div class="hero__left">
          <p class="hero__name">Dr. Muhammed İkbal</p>
          <h1 class="hero__title">Cilt sağlığı ve medikal estetikte doğru bilgiyle güvenli adımlar atın</h1>
          <p class="hero__quote">"Estetik kararlar, bilimsel bilgiyle alındığında güvenlidir."</p>
          <a href="pages/medikal-estetik.html" class="btn btn-light hero__cta">Medikal Estetik &amp; Güzellik</a>
        </div>
        <div class="hero__right" aria-hidden="true"></div>
      </div>
      <div class="hero-slide">
        <div class="hero__left">
          <p class="hero__name">Dr. Muhammed İkbal</p>
          <h1 class="hero__title">Stres, anksiyete ve uyku problemlerine bütüncül bir bakış</h1>
          <p class="hero__quote">"Zihinsel denge, fiziksel sağlığın ayrılmaz parçasıdır."</p>
          <a href="blog/kortizol-yaslanma.html" class="btn btn-light hero__cta">Makaleyi Oku</a>
        </div>
        <div class="hero__right" aria-hidden="true"></div>
      </div>
      <div class="hero-slide">
        <div class="hero__left">
          <p class="hero__name">Dr. Muhammed İkbal</p>
          <h1 class="hero__title">Beslenme ve yaşam tarzı değişiklikleriyle metabolik sağlığınızı destekleyin</h1>
          <p class="hero__quote">"Küçük ve sürdürülebilir adımlar, kalıcı sonuçlar getirir."</p>
          <a href="blog/index.html" class="btn btn-light hero__cta">İçerik Kütüphanesi</a>
        </div>
        <div class="hero__right" aria-hidden="true"></div>
      </div>
      <div class="hero-slide">
        <div class="hero__left">
          <p class="hero__name">Dr. Muhammed İkbal</p>
          <h1 class="hero__title">Kurslarla sağlığınız için bilimsel temelli bir yol haritası edinin</h1>
          <p class="hero__quote">"Kayıt, öngörüşme ve mülakat sonucuna göre kesinleşir."</p>
          <a href="pages/kurslar.html" class="btn btn-light hero__cta">Kursları İncele</a>
        </div>
        <div class="hero__right" aria-hidden="true"></div>
      </div>
      <div class="hero-dots" aria-label="Manşet seçimi">
        <button class="hero-dot is-active" aria-label="Manşet 1"></button>
        <button class="hero-dot" aria-label="Manşet 2"></button>
        <button class="hero-dot" aria-label="Manşet 3"></button>
        <button class="hero-dot" aria-label="Manşet 4"></button>
        <button class="hero-dot" aria-label="Manşet 5"></button>
      </div>
    </section>
```

- [ ] **Step 2: style.css HERO bölümünü güncelle** — mevcut:

```css
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 560px;
  overflow: hidden;
}
```

şununla değiştir:

```css
.hero {
  position: relative;
  overflow: hidden;
}
.hero-slide {
  display: none;
  grid-template-columns: 1fr 1fr;
  min-height: 560px;
}
.hero-slide.is-active {
  display: grid;
  animation: heroFade 0.5s ease;
}
@keyframes heroFade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.hero-dots {
  position: absolute;
  bottom: 24px;
  left: 56px;
  display: flex;
  gap: 8px;
  z-index: 2;
}
.hero-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  padding: 0;
  background: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  transition: background 0.2s;
}
.hero-dot.is-active {
  background: #fff;
}
```

Ve mevcut mobil kuralı —

```css
@media (max-width: 900px) {
  .hero { grid-template-columns: 1fr; min-height: auto; }
  .hero__right { display: none; }
  .hero__left { padding: 48px 28px; }
}
```

— şöyle güncelle:

```css
@media (max-width: 900px) {
  .hero-slide { grid-template-columns: 1fr; min-height: auto; }
  .hero__right { display: none; }
  .hero__left { padding: 48px 28px 64px; }
  .hero-dots { left: 28px; bottom: 20px; }
}
```

- [ ] **Step 3: script.js'e slider ekle** — `DOMContentLoaded` callback'i içine (içerik koruması bloğundan önce):

```js
  // ── Hero slider ──
  (function initHeroSlider() {
    const slider = document.getElementById('heroSlider');
    if (!slider) return;
    const slides = slider.querySelectorAll('.hero-slide');
    const dots = slider.querySelectorAll('.hero-dot');
    if (slides.length < 2) return;
    let current = 0;
    let timer;
    const show = (i) => {
      slides[current].classList.remove('is-active');
      dots[current].classList.remove('is-active');
      current = (i + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      dots[current].classList.add('is-active');
    };
    const start = () => { timer = setInterval(() => show(current + 1), 6000); };
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { clearInterval(timer); show(i); start(); });
    });
    start();
  })();
```

- [ ] **Step 4: Tarayıcıda doğrula** — `index.html` aç: ilk manşet görünüyor, 6 sn'de bir değişiyor, noktalara tıklayınca ilgili manşet geliyor, mobil genişlikte düzgün; JS'siz (devtools'ta JS disable) ilk manşet statik görünüyor.

- [ ] **Step 5: Commit**

```powershell
git add index.html style.css script.js && git commit -m "feat: hero — 5 manset donen slider (yer tutucu metinler)"
```

---

### Task 10: Ana sayfa içerik düzenlemeleri

**Files:**
- Modify: `index.html` (features, konular, faydalı okumalar, podcast linkleri), `style.css` (okuma sekmeleri + rozet stilleri), `script.js` (sekme filtresi)

- [ ] **Step 1: "Longevity Protokolü" feature bloğunu kaldır** — index.html'de şu bloğu tamamen sil:

```html
          <div class="feature-item">
            <div class="feature-item__img-wrap">
              <img src="assets/images/generated/guide_start_longevity.png" alt="Longevity Protokolü" class="feature-item__img" />
            </div>
            <div class="feature-item__body">
              <h3 class="feature-item__title"><a href="pages/longevity.html">Longevity Protokolü &rarr;</a></h3>
              <p class="feature-item__desc">Otofaji, metabolik sağlık, uyku ve egzersiz — kanıta dayalı 6 temel direkle biyolojik yaşınızı geri döndürün.</p>
            </div>
          </div>
```

- [ ] **Step 2: "Sağlık Rehberleri" feature açıklamasını sadeleştir** —

| Eski | Yeni |
|---|---|
| `Keto, aralıklı oruç ve longevity protokolleri için hazırladığımız uygulaması kolay, bilimsel rehberler.` | `Beslenme, uyku, stres ve cilt sağlığı için hazırladığımız uygulaması kolay, bilimsel rehberler.` |

- [ ] **Step 3: Konular ızgarasına 4 yeni kart ekle** — `<!-- CARD 10 -->` kartının kapanışından sonra (`</div>` of card 10, `</div><!-- category-grid kapanışı -->`'dan önce) şunu ekle:

```html
          <!-- CARD 11 -->
          <div class="category-card">
            <div class="category-card__header">
              <h3 class="category-card__name">Medikal Estetik &amp; Güzellik</h3>
            </div>
            <div class="category-card__list">
              <a href="pages/medikal-estetik.html" class="category-card__link">Medikal Estetik Uygulamaları</a>
              <a href="blog/senolitik-tedaviler-cilt-genclesmesi-zombi-hucreler.html" class="category-card__link">Cilt Gençleşmesi Araştırmaları</a>
              <a href="pages/medikal-estetik.html" class="category-card__link">Güzellik &amp; Bakım</a>
            </div>
          </div>

          <!-- CARD 12 -->
          <div class="category-card">
            <div class="category-card__header">
              <h3 class="category-card__name">Cilt Sağlığı &amp; Gençleşme</h3>
            </div>
            <div class="category-card__list">
              <a href="blog/senolitik-tedaviler-cilt-genclesmesi-zombi-hucreler.html" class="category-card__link">Senolitikler ve Cilt</a>
              <a href="blog/sirt6-proteini-epigenetik-genclesme.html" class="category-card__link">Epigenetik Gençleşme</a>
              <a href="pages/medikal-estetik.html" class="category-card__link">Cilt Bakım Temelleri</a>
            </div>
          </div>

          <!-- CARD 13 -->
          <div class="category-card">
            <div class="category-card__header">
              <h3 class="category-card__name">Uyku Problemleri</h3>
            </div>
            <div class="category-card__list">
              <a href="blog/telomerleri-korumak.html#yontem5" class="category-card__link">Uyku Optimizasyonu</a>
              <a href="blog/kortizol-yaslanma.html" class="category-card__link">Kortizol ve Uyku</a>
              <a href="pages/quizler.html" class="category-card__link">Uyku Kalitesi Değerlendirmesi</a>
            </div>
          </div>

          <!-- CARD 14 -->
          <div class="category-card">
            <div class="category-card__header">
              <h3 class="category-card__name">Anksiyete &amp; Obsesyon</h3>
            </div>
            <div class="category-card__list">
              <a href="blog/kortizol-yaslanma.html" class="category-card__link">Stres ve Anksiyete Yönetimi</a>
              <a href="pages/quizler.html" class="category-card__link">Stres Profili Testi</a>
              <a href="blog/index.html" class="category-card__link">Obsesif Düşüncelerle Başa Çıkma</a>
            </div>
          </div>
```

- [ ] **Step 4: Kütüphane tanıtım cümlesini güncelle** —

| Eski | Yeni |
|---|---|
| `Dr. Muhammed İkbal'in bilimsel temelli makaleleri, rehberleri ve pratik protokolleri arasından dilediğiniz konuyu keşfedin.` | `Dr. Muhammed İkbal'in bilimsel temelli makaleleri ve rehberleri arasından dilediğiniz konuyu keşfedin.` |

- [ ] **Step 5: Faydalı okumalar — kategori sekmeleri ve rozetler**

5a. `index.html`'de articles-section'daki `section-header` kapanışından hemen sonra (articles-grid açılışından önce) ekle:

```html
        <div class="reading-tabs" id="readingTabs">
          <button class="reading-tab is-active" data-cat="all">Tümü</button>
          <button class="reading-tab" data-cat="saglikli-yasam">Sağlıklı Yaşam</button>
          <button class="reading-tab" data-cat="kultur-sanat">Kültür, Sanat</button>
          <button class="reading-tab" data-cat="kariyer">Kariyer</button>
          <button class="reading-tab" data-cat="sorumluluk-mutluluk">Sorumluluk ve Mutluluk</button>
        </div>
```

5b. Mevcut 4 makale kartının her birinde `<article class="article-card">` → `<article class="article-card" data-readcat="saglikli-yasam">` yap ve her kartta `<span class="article-card__badge">MAKALE</span>` → `<span class="article-card__badge">MAKALE</span><span class="article-card__price-badge article-card__price-badge--free">Ücretsiz</span>` yap (4 kez).

5c. 4. kartın kapanışından sonra, `articles-grid` kapanışından önce 3 yer tutucu kart ekle:

```html
          <!-- YER TUTUCU KARTLAR: kültür/kariyer/mutluluk makaleleri yayınlandıkça gerçek içerikle değiştirilecek -->
          <article class="article-card" data-readcat="kultur-sanat" style="display:none;">
            <div class="article-card__img-wrapper">
              <a href="blog/index.html" class="article-card__img-link">
                <img src="assets/images/generated/topics/kurslar.png" alt="Kültür ve sanat yazısı görseli" class="article-card__img" />
              </a>
              <span class="article-card__cat-overlay">KÜLTÜR, SANAT</span>
            </div>
            <div class="article-card__body">
              <span class="article-card__badge">MAKALE</span><span class="article-card__price-badge article-card__price-badge--free">Ücretsiz</span>
              <h3 class="article-card__title"><a href="blog/index.html">Sanatla İyileşme: Kültürün Ruh Sağlığına Etkisi (Yakında)</a></h3>
            </div>
          </article>
          <article class="article-card" data-readcat="kariyer" style="display:none;">
            <div class="article-card__img-wrapper">
              <a href="blog/index.html" class="article-card__img-link">
                <img src="assets/images/generated/topics/kurslar.png" alt="Kariyer yazısı görseli" class="article-card__img" />
              </a>
              <span class="article-card__cat-overlay">KARİYER</span>
            </div>
            <div class="article-card__body">
              <span class="article-card__badge">MAKALE</span><span class="article-card__price-badge article-card__price-badge--paid">Ücretli</span>
              <h3 class="article-card__title"><a href="blog/index.html">Yoğun Çalışma Temposunda Sağlığı Korumak (Yakında)</a></h3>
            </div>
          </article>
          <article class="article-card" data-readcat="sorumluluk-mutluluk" style="display:none;">
            <div class="article-card__img-wrapper">
              <a href="blog/index.html" class="article-card__img-link">
                <img src="assets/images/generated/topics/kurslar.png" alt="Sorumluluk ve mutluluk yazısı görseli" class="article-card__img" />
              </a>
              <span class="article-card__cat-overlay">SORUMLULUK VE MUTLULUK</span>
            </div>
            <div class="article-card__body">
              <span class="article-card__badge">MAKALE</span><span class="article-card__price-badge article-card__price-badge--free">Ücretsiz</span>
              <h3 class="article-card__title"><a href="blog/index.html">Anlamlı Yaşam: Sorumluluk ve Mutluluk İlişkisi (Yakında)</a></h3>
            </div>
          </article>
```

5d. `style.css` sonuna (içerik koruması bloğundan önce veya sonra fark etmez) ekle:

```css
/* ─── FAYDALI OKUMALAR SEKMELERİ + ROZETLER ─── */
.reading-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.reading-tab {
  border: 1px solid #e2e2e2;
  background: #fff;
  border-radius: 99px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.reading-tab.is-active {
  background: var(--main);
  color: #fff;
  border-color: var(--main);
}
.article-card__price-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 99px;
  margin-left: 6px;
}
.article-card__price-badge--free {
  background: #e8f5e9;
  color: #2e7d32;
}
.article-card__price-badge--paid {
  background: #fff3e0;
  color: #b26a00;
}
```

5e. `script.js`'e (hero slider bloğundan sonra) ekle:

```js
  // ── Faydalı okumalar kategori sekmeleri ──
  (function initReadingTabs() {
    const tabs = document.querySelectorAll('.reading-tab');
    if (!tabs.length) return;
    const cards = document.querySelectorAll('.articles-grid .article-card');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        const cat = tab.dataset.cat;
        cards.forEach(card => {
          const match = cat === 'all'
            ? card.dataset.readcat === 'saglikli-yasam'
            : card.dataset.readcat === cat;
          card.style.display = match ? '' : 'none';
        });
      });
    });
  })();
```

(Not: "Tümü" sekmesi yalnızca gerçek içeriği olan sağlıklı yaşam kartlarını gösterir; yer tutucu kartlar yalnızca kendi sekmesinde görünür — `style="display:none"` başlangıç değeri JS ile yönetilir.)

- [ ] **Step 6: Podcast bölümü linklerini yeni sayfaya çevir** — index.html'de:

| Eski | Yeni |
|---|---|
| `<a href="blog/index.html" class="section-link">Tüm bölümleri gör</a>` (podcast-section içindeki) | `<a href="pages/podcast.html" class="section-link">Tüm bölümleri gör</a>` |

Podcast kartlarındaki `href="blog/index.html"` linklerini (`podcast-card__img-link` ve kart başlığı linkleri — BÖLÜM 421 ve 420 kartlarında) `href="pages/podcast.html"` yap. Blog makalesine giden podcast kart linkleri (BÖLÜM 419, 418, 417, 416) olduğu gibi kalır.

- [ ] **Step 7: Tarayıcıda doğrula** — sekmeler tıklanınca kartlar filtreleniyor, rozetler görünüyor, konular ızgarasında 14 kart var, "Longevity Protokolü" feature'ı yok.

- [ ] **Step 8: Commit**

```powershell
git add index.html style.css script.js && git commit -m "feat: ana sayfa — protokol blogu kaldirildi, yeni konular, okuma kategorileri + ucretsiz/ucretli rozetleri"
```

---

### Task 11: Kurslar — mülakatla kabul modeli

**Files:**
- Modify: `pages/kurslar.html`

- [ ] **Step 1: Hero alt metnini değiştir**

| Eski | Yeni |
|---|---|
| `Kapsamlı longevity eğitimleri. Kendi hızınızda ilerleyin, ömür boyu erişim kazanın.` | `Kayıt, öngörüşme ve mülakat sonucuna göre kesinleşir. Kontenjanlar sınırlıdır.` |

- [ ] **Step 2: Süreç bölümü ekle** — `<style>` bloğuna şu kuralları ekle:

```css
    .process-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;padding:56px 0 8px;}
    @media(max-width:860px){.process-steps{grid-template-columns:repeat(2,1fr);}}
    @media(max-width:480px){.process-steps{grid-template-columns:1fr;}}
    .process-step{background:var(--base);border-radius:var(--r-lg);box-shadow:var(--shadow);padding:24px;}
    .process-step__no{font-size:12px;font-weight:800;color:var(--blue);letter-spacing:.5px;display:block;margin-bottom:8px;}
    .process-step__title{font-size:16px;font-weight:800;margin-bottom:6px;}
    .process-step__desc{font-size:13px;color:var(--gray-500);line-height:1.6;}
```

`<main>` içinde pg-hero section'dan hemen sonra ekle:

```html
    <section class="section"><div class="container">
      <div class="process-steps">
        <div class="process-step"><span class="process-step__no">1. ADIM</span><h3 class="process-step__title">Başvuru</h3><p class="process-step__desc">İlgilendiğiniz kurs için WhatsApp üzerinden öngörüşme talebinizi iletin.</p></div>
        <div class="process-step"><span class="process-step__no">2. ADIM</span><h3 class="process-step__title">Öngörüşme</h3><p class="process-step__desc">Hedefleriniz ve beklentileriniz üzerine kısa bir ön değerlendirme yapılır.</p></div>
        <div class="process-step"><span class="process-step__no">3. ADIM</span><h3 class="process-step__title">Mülakat</h3><p class="process-step__desc">Kursun size uygunluğu birebir mülakatta birlikte değerlendirilir.</p></div>
        <div class="process-step"><span class="process-step__no">4. ADIM</span><h3 class="process-step__title">Kabul</h3><p class="process-step__desc">Mülakat sonucuna göre kaydınız kesinleşir ve program detayları paylaşılır.</p></div>
      </div>
    </div></section>
```

- [ ] **Step 3: Kurs kartlarını mülakat modeline çevir** — `courses-grid` içindeki 4 kartta:

3a. Her karttaki `<div class="course-card__meta">...</div>` bloğunu tamamen sil (video sayısı/saat/öğrenci).

3b. Her karttaki `<div class="course-card__price-row">...</div>` bloğunu aşağıdaki ile değiştir (kurs adına göre `text` parametresi farklı):

Kart 1 (Longevity 101 — Temel Protokol):
```html
<a href="https://wa.me/905000000000?text=Merhaba%2C%20Longevity%20101%20kursu%20i%C3%A7in%20%C3%B6ng%C3%B6r%C3%BC%C5%9Fme%20talep%20ediyorum." class="btn btn-dark" style="width:100%;text-align:center;">Öngörüşme Talep Et</a>
```

Kart 2 (Metabolik Optimizasyon Masterclass):
```html
<a href="https://wa.me/905000000000?text=Merhaba%2C%20Metabolik%20Optimizasyon%20kursu%20i%C3%A7in%20%C3%B6ng%C3%B6r%C3%BC%C5%9Fme%20talep%20ediyorum." class="btn btn-dark" style="width:100%;text-align:center;">Öngörüşme Talep Et</a>
```

Kart 3 (Longevity Beslenmesi & Tarifler):
```html
<a href="https://wa.me/905000000000?text=Merhaba%2C%20Beslenme%20kursu%20i%C3%A7in%20%C3%B6ng%C3%B6r%C3%BC%C5%9Fme%20talep%20ediyorum." class="btn btn-dark" style="width:100%;text-align:center;">Öngörüşme Talep Et</a>
```

3c. 4. kartı ("Tüm Kurslar — Yıllık Üyelik" paketi) tamamen sil — satın alma paketi mülakat modeliyle çelişiyor.

3d. Kart rozetlerinden "En Popüler" → "Temel Seviye" yap (doğrulanamayan iddia); "İleri Seviye" ve "Yeni" kalır.

- [ ] **Step 4: Doğrula**

```powershell
Select-String -Path pages\kurslar.html -Pattern '₺|iletisim\.html" class="btn|Kursa Kaydol|Satın Al|öğrenci' -Encoding UTF8
```

Beklenen: çıktı boş (utility nav/footer'daki normal iletisim.html linkleri `class="btn` içermediği için eşleşmez).

- [ ] **Step 5: Commit**

```powershell
git add pages/kurslar.html && git commit -m "feat: kurslar — fiyat kaldirildi, ongorusme/mulakat modeli + WhatsApp basvuru"
```

---

### Task 12: Rehberler — Sağlık Rehberleri + cilt/estetik/güzellik kartları

**Files:**
- Modify: `pages/rehberler.html`, `index.html` (hero CTA zaten Task 9'da değişti — kontrol)

- [ ] **Step 1: Hero başlık ve alt metin**

| Eski | Yeni |
|---|---|
| `Longevity Rehberleri` | `Sağlık Rehberleri` |
| `Bilimsel temelli, uygulaması kolay rehberler — aralıklı oruçtan keto geçişine, uyku optimizasyonundan egzersiz protokollerine.` | `Bilimsel temelli, uygulaması kolay rehberler — beslenmeden uyku düzenine, stres yönetiminden cilt sağlığına.` |

- [ ] **Step 2: İlk rehber kartını yeniden adlandır**

| Eski | Yeni |
|---|---|
| `Longevity'e Nasıl Başlarım?` | `Sağlıklı Yaşama Nasıl Başlarım?` |
| `Sıfırdan bir longevity protokolü oluşturmak için adım adım rehber. İlk 30 gün için somut eylem planı.` | `Sağlıklı yaşam alışkanlıkları için adım adım rehber. İlk 30 gün için somut eylem planı.` |

- [ ] **Step 3: 3 yeni rehber kartı ekle** — `guides-grid` kapanışından önce:

```html
        <div class="guide-card"><img src="../assets/images/generated/topics/quiz_inflammation.png" alt="Rehber kapak görseli - Cilt Sağlığı" class="guide-card__img" /><div class="guide-card__body"><span class="guide-card__tag">Cilt Sağlığı</span><h3 class="guide-card__title">Cilt Sağlığı Rehberi</h3><p class="guide-card__desc">Cilt bariyeri, nem dengesi ve hücresel yenilenme — sağlıklı cilt için bilimsel temeller.</p><a href="../blog/senolitik-tedaviler-cilt-genclesmesi-zombi-hucreler.html" class="guide-card__cta">Makaleyi oku &rarr;</a></div></div>
        <div class="guide-card"><img src="../assets/images/generated/topics/cellular-science.png" alt="Rehber kapak görseli - Medikal Estetik" class="guide-card__img" /><div class="guide-card__body"><span class="guide-card__tag">Medikal Estetik</span><h3 class="guide-card__title">Medikal Estetiğe Giriş</h3><p class="guide-card__desc">Uygulamalar, beklenti yönetimi ve doğru bilgilendirme üzerine temel rehber.</p><a href="medikal-estetik.html" class="guide-card__cta">Sayfaya git &rarr;</a></div></div>
        <div class="guide-card"><img src="../assets/images/generated/topics/kortizol-stres.png" alt="Rehber kapak görseli - Güzellik ve Bakım" class="guide-card__img" /><div class="guide-card__body"><span class="guide-card__tag">Güzellik</span><h3 class="guide-card__title">Güzellik &amp; Bakım Rutini</h3><p class="guide-card__desc">İçten dışa güzellik: beslenme, uyku ve stresin cilt üzerindeki etkileri.</p><a href="medikal-estetik.html" class="guide-card__cta">Sayfaya git &rarr;</a></div></div>
```

- [ ] **Step 4: index.html hero CTA kontrolü** — Task 9 hero'sunda CTA zaten "Sağlık Rehberini İncele"; `Select-String -Path index.html -Pattern 'ÜCRETSİZ Rehber'` boş dönmeli.

- [ ] **Step 5: Doğrula**

```powershell
Select-String -Path pages\rehberler.html -Pattern 'Longevity Rehber|Longevity''e Nasıl' -Encoding UTF8
```

Beklenen: çıktı boş.

- [ ] **Step 6: Commit**

```powershell
git add pages/rehberler.html index.html && git commit -m "feat: rehberler — Saglik Rehberleri + cilt/estetik/guzellik kartlari"
```

---

### Task 13: İçerik Kütüphanesi (blog) + İletişim/Randevu + utility nav

**Files:**
- Modify: `blog/index.html`, `pages/iletisim.html`, tüm `*.html` (utility nav)

- [ ] **Step 1: blog/index.html hero ve tür linkleri**

| Eski | Yeni |
|---|---|
| `Longevity, beslenme, hücre sağlığı ve daha fazlası — bilimsel temelli, Türkçe içerikler.` | `Makaleler, podcast bölümleri ve birebir söyleşiler — bilimsel temelli, Türkçe içerikler.` |

`blog-filters` div'inin sonuna (son `</button>`'dan sonra, `</div>`'den önce) iki tür linki ekle:

```html
          <a class="filter-btn" href="../pages/podcast.html">🎙 Podcast</a>
          <a class="filter-btn" href="../pages/soylesiler.html">🎥 Birebir Söyleşiler</a>
```

(Not: `filter-btn` stili button'a göre yazılmışsa `a` için `text-decoration:none` gerekebilir — tarayıcıda kontrol et, gerekirse blog/index.html'in `<style>`'ına `a.filter-btn{text-decoration:none;display:inline-block;}` ekle.)

- [ ] **Step 2: pages/iletisim.html — WhatsApp randevu kutusu** — `<head>`'e küçük bir `<style>` ekle:

```html
  <style>
    .appointment-cta{background:var(--main);color:#fff;border-radius:var(--r-lg,16px);padding:36px;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;margin:40px 0 8px;}
    .appointment-cta h2{font-size:22px;font-weight:800;margin-bottom:6px;}
    .appointment-cta p{font-size:14px;opacity:.8;}
  </style>
```

`<main>` içinde contact-hero section'dan sonra, `<div class="container">` açılışından hemen sonra ekle:

```html
      <div class="appointment-cta">
        <div><h2>Randevu</h2><p>Muayene ve görüşme randevuları WhatsApp üzerinden planlanmaktadır.</p></div>
        <a href="https://wa.me/905000000000?text=Merhaba%2C%20randevu%20talep%20ediyorum." class="btn btn-light">WhatsApp'tan Randevu Al</a>
      </div>
```

- [ ] **Step 3: Utility nav'a Randevu linki (tüm sayfalar)** — batch:

```powershell
Get-ChildItem -Recurse -Filter *.html | Where-Object { $_.FullName -notmatch 'claude-skills|scratch|node_modules' } | ForEach-Object {
  $pre = if ($_.FullName -match '\\pages\\') { '' } elseif ($_.FullName -match '\\blog\\') { '../pages/' } else { 'pages/' }
  $t = Get-Content $_.FullName -Raw -Encoding UTF8
  $t = $t.Replace("<a href=`"${pre}iletisim.html`">İletişim</a></nav>", "<a href=`"${pre}iletisim.html`">İletişim</a><a href=`"https://wa.me/905000000000?text=Merhaba%2C%20randevu%20talep%20ediyorum.`">Randevu</a></nav>")
  Set-Content $_.FullName $t -Encoding UTF8 -NoNewline
}
```

(Not: bu replace yalnızca utility nav'ı yakalar çünkü `</nav>` bitişikliği yalnızca orada var; footer legal nav'da da `İletişim</a>` son eleman + `</nav>` bitişik olabilir — o durumda footer'a da Randevu linki eklenir, kabul edilebilir.)

- [ ] **Step 4: Doğrula**

```powershell
(Get-ChildItem -Recurse -Filter *.html | Where-Object { $_.FullName -notmatch 'claude-skills|scratch|node_modules' } | Select-String -Pattern 'wa\.me/905000000000' -Encoding UTF8).Count
```

Beklenen: 0'dan büyük (sayfa başına 1+; kurslar/medikal-estetik/iletisim'de daha fazla).

- [ ] **Step 5: Commit**

```powershell
git add blog/index.html pages/iletisim.html *.html pages/*.html blog/*.html && git commit -m "feat: kutuphane tur linkleri + randevu WhatsApp yonlendirmesi"
```

---

### Task 14: Ücretli makale kilit arayüzü (Faz 1)

**Files:**
- Modify: `style.css` (kilit bileşeni)
- Create: `blog/ucretli-makale-sablonu.html` (taban: `blog/sirt6-proteini-epigenetik-genclesme.html` kopyası)

- [ ] **Step 1: style.css'e kilit bileşeni ekle** (dosya sonuna):

```css
/* ─── ÜCRETLİ MAKALE KİLİDİ (Faz 1 — yalnız arayüz; gerçek kilit ödeme entegrasyonunda) ─── */
.article-lock {
  position: relative;
}
.article-lock__content {
  max-height: 280px;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(#000 30%, transparent);
  mask-image: linear-gradient(#000 30%, transparent);
}
.article-lock__box {
  position: relative;
  margin: -40px auto 40px;
  max-width: 480px;
  background: #fff;
  border: 1px solid #e2e2e2;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  padding: 32px;
  text-align: center;
  z-index: 1;
}
.article-lock__icon {
  font-size: 28px;
  margin-bottom: 12px;
}
.article-lock__title {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 8px;
}
.article-lock__desc {
  font-size: 14px;
  color: var(--gray-500);
  line-height: 1.6;
  margin-bottom: 20px;
}
```

- [ ] **Step 2: Şablon sayfa oluştur**

```powershell
Copy-Item "blog\sirt6-proteini-epigenetik-genclesme.html" "blog\ucretli-makale-sablonu.html"
```

- [ ] **Step 3: Şablonu düzenle** — `blog/ucretli-makale-sablonu.html` içinde:

3a. `<title>` içeriğini `Ücretli Makale Şablonu — Dr. Muhammed İkbal Bakırcı` yap; `<h1>` makale başlığını `Ücretli Makale Şablonu (Örnek)` yap.

3b. Makale gövdesini bul (ilk `<h1>`'den sonraki paragraf akışı). İlk 2 paragraf olduğu gibi kalsın; 3. paragraftan itibaren kalan TÜM makale içeriğini şu yapının içine al:

```html
<div class="article-lock">
  <div class="article-lock__content">
    <!-- buraya 3. paragraftan itibaren mevcut içerik taşınır -->
  </div>
  <div class="article-lock__box">
    <div class="article-lock__icon">🔒</div>
    <h2 class="article-lock__title">Bu makalenin devamı ücretli içeriktir</h2>
    <p class="article-lock__desc">Yazının tamamına erişim için satın alma gereklidir. Ödeme altyapısı yakında aktif olacaktır.</p>
    <!-- YER TUTUCU: ödeme entegrasyonu bağlandığında bu buton gerçek satın alma akışına yönlenecek -->
    <a href="https://wa.me/905000000000?text=Merhaba%2C%20%C3%BCcretli%20makale%20eri%C5%9Fimi%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum." class="btn btn-dark">Erişim Satın Al</a>
  </div>
</div>
```

3c. Sayfanın `<head>`'ine `<meta name="robots" content="noindex" />` ekle (şablon sayfa arama motorlarına girmesin).

- [ ] **Step 4: Tarayıcıda doğrula** — `blog/ucretli-makale-sablonu.html` aç: giriş okunuyor, devamı aşağı doğru solarak kayboluyor, kilit kutusu ve buton ortada görünüyor.

- [ ] **Step 5: Commit**

```powershell
git add style.css blog/ucretli-makale-sablonu.html && git commit -m "feat: ucretli makale kilit arayuzu (faz 1) + sablon sayfa"
```

---

### Task 15: Final doğrulama

**Files:** (yalnız okuma/doğrulama; bulunan hatalar ilgili dosyada düzeltilir)

- [ ] **Step 1: Grep takımı** — hepsi boş dönmeli:

```powershell
$patterns = 'Dr\. Bakırcı', 'Mini Kurslar', 'Özel Projeler', '40 milyon', 'Kursa Kaydol', 'Paket Satın Al', 'Longevity Protokolü', 'MD Specialist', 'öncü ismi'
$files = Get-ChildItem -Recurse -Filter *.html | Where-Object { $_.FullName -notmatch 'claude-skills|scratch|node_modules' }
foreach ($p in $patterns) {
  $hits = $files | Select-String -Pattern $p -Encoding UTF8
  if ($hits) { Write-Host "KALDI: $p"; $hits | ForEach-Object { Write-Host "  $($_.Path):$($_.LineNumber)" } }
}
```

Beklenen: hiç "KALDI" satırı yok. (İstisna: `blog/aralikli-oruc-longevity.html` gibi makale gövdelerinde "longevity protokolü" küçük harfle anlatım içinde geçebilir — bunlar makale içeriğidir, dokunma; pattern büyük harfli başlık formunu arıyor.)

- [ ] **Step 2: Kırık link taraması**

```powershell
$errors = @()
Get-ChildItem -Recurse -Filter *.html | Where-Object { $_.FullName -notmatch 'claude-skills|scratch|node_modules' } | ForEach-Object {
  $dir = $_.DirectoryName
  $html = Get-Content $_.FullName -Raw -Encoding UTF8
  [regex]::Matches($html, 'href="([^"#]+?)(#[^"]*)?"') | ForEach-Object {
    $h = $_.Groups[1].Value
    if ($h -match '^(https?:|mailto:|tel:|wa\.me)') { return }
    $p = Join-Path $dir $h
    if (-not (Test-Path $p)) { $errors += "$($_.Groups[1].Value)  <-  $dir" }
  }
}
$errors | Sort-Object -Unique
```

Beklenen: boş liste. Çıkan her kırık link ilgili dosyada düzeltilir.

- [ ] **Step 3: Tarayıcı smoke testi** — şu sayfaları aç ve kontrol et:
  - `index.html`: hero slider dönüyor, sekme filtreleri çalışıyor, sağ tık/seçim engelli, nav'da Medikal Estetik var
  - `pages/kurslar.html`: fiyat yok, süreç adımları var, WhatsApp butonu doğru mesajla açılıyor
  - `pages/medikal-estetik.html`, `pages/podcast.html`, `pages/soylesiler.html`: header/footer düzgün, logo alt alta
  - `blog/index.html`: Podcast/Söyleşi linkleri çalışıyor
  - `pages/iletisim.html`: randevu kutusu WhatsApp'a gidiyor

- [ ] **Step 4: Düzeltme varsa commit**

```powershell
git add -u && git commit -m "fix: final dogrulama duzeltmeleri"
```

(Düzeltme yoksa bu adım atlanır. Not: `git add -u` yalnızca izlenen dosyaları ekler; plan dışı untracked dosyalar dahil olmaz — yine de `git status` ile kontrol et.)

---

## Bekleyen kullanıcı girdileri (uygulama sonrası tek seferlik değişimler)

| Girdi | Nerede | Nasıl değiştirilir |
|---|---|---|
| WhatsApp numarası | tüm `wa.me/905000000000` linkleri | site genelinde `905000000000` → gerçek numara (batch replace) |
| 5 hero manşeti | `index.html` hero-slide blokları | başlık/alt metin/CTA metinleri |
| Logo unvanı | `site-logo__role` span'ları (tüm sayfalar) | `Tıp Doktoru` → gerçek unvan (batch replace) |
| Podcast bölüm metinleri | `pages/podcast.html` | yer tutucu episode kartları |
| Söyleşi videoları | `pages/soylesiler.html` | `.talk-card__video` → YouTube iframe |
