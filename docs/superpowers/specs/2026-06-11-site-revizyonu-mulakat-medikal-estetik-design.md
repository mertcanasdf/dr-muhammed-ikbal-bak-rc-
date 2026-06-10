# Site Revizyonu — Mülakatlı Kurs Modeli, Medikal Estetik ve İçerik Mimarisi

**Tarih:** 2026-06-11
**Durum:** Onaylandı (kullanıcı brainstorm sonunda onayladı)

## Amaç

Dr. Muhammed İkbal Bakırcı sitesini dört eksende revize etmek:
kurs satışından mülakatla kabule geçiş, medikal estetik/cilt sağlığı içerik
alanlarının eklenmesi, marka tonunun sadeleştirilmesi ve WhatsApp odaklı
iletişim akışı.

## Kapsam Dışı / Sonraya Bırakılanlar

- **Gerçek ödeme duvarı:** Ücretli makale kilidi bu fazda sadece arayüz
  olarak yapılır. Ödeme entegrasyonu (iyzico vb. — Stripe Türkiye'de yok)
  ayrı bir projedir.
- **Hero manşet metinleri:** Kullanıcı 5 uzun manşet örneği iletecek;
  şimdilik yer tutucu.
- **WhatsApp numarası:** Yer tutucu (`905XXXXXXXXX`); kullanıcı iletince
  tek seferde değiştirilecek.
- **Logo unvan metni:** Yer tutucu "Tıp Doktoru"; kesin unvan kullanıcıdan
  gelecek.
- **Podcast bölüm metinleri ve söyleşi videoları:** Yapı kurulur, içerik
  kullanıcıdan gelince doldurulur.

## 1. Marka ve Ton (site geneli)

- Metinlerdeki tüm "Dr. Bakırcı" ifadeleri "Dr. Muhammed İkbal" olur
  (ör. "Dr. Bakırcı'nın" → "Dr. Muhammed İkbal'in"). Logo ve `<title>`
  etiketlerindeki tam ad "Dr. Muhammed İkbal Bakırcı" kalabilir.
- **Logo:** iki satırlı yapı — üstte isim, altta küçük puntoyla unvan
  (yer tutucu "Tıp Doktoru"). Header ve footer logoları güncellenir.
- **Abartı temizliği:** Doğrulanamayan sayılar ve üstünlük iddiaları
  kaldırılır veya sadeleştirilir:
  - "40 milyondan fazla üyeye katılın" (footer, tüm sayfalar)
  - Kurs kartlarındaki öğrenci sayıları, indirimli fiyat oyunları
  - "Tüm makaleleri gör (412)" gibi şişirilmiş sayaçlar
  - "1.240'tan fazla kişi ... hayatını dönüştürdü"
  - "Türkiye'nin öncü ismi" tarzı sıfatlar
  - Başarı hikayelerindeki kesin tıbbi iddialar ("teşhisim ortadan
    kalktı", "ilaç yükümden kurtuldum") yumuşatılır — sağlık mevzuatı
    riski açısından da gerekli.

## 2. Ana Sayfa

- **Hero — 5 dönen manşet:** Hero, 5 manşetlik otomatik slidera dönüşür.
  Her manşet: uzun başlık + alt metin + CTA. Nokta navigasyonu, otomatik
  geçiş (~6 sn), yumuşak geçiş animasyonu. JS yoksa ilk manşet statik
  görünür (progressive enhancement). Metinler yer tutucu.
- **"Longevity Protokolü" tanıtım bloğu kaldırılır** (feature-item:
  "Otofaji, metabolik sağlık, uyku ve egzersiz — kanıta dayalı 6 temel
  direkle..."). Yanındaki "Longevity Rehberi" kartı **"Sağlık Rehberi"**
  olarak yeniden adlandırılır.
- **Faydalı okumalar:** "Yolculuğunuzu destekleyecek faydalı okumalar"
  bölümü 4 kategori sekmesi alır: *Sağlıklı Yaşam · Kültür, Sanat ·
  Kariyer · Sorumluluk ve Mutluluk*. Kartlarda "Ücretsiz" / "Ücretli"
  rozeti gösterilir.
- **Konular ızgarası** yeni başlıklar kazanır: medikal estetik, cilt
  sağlığı & gençleşme, stres, anksiyete, obsesyon, uyku problemleri.

## 3. Navigasyon (tüm sayfalarda ortak header)

- Megamenü "Özel Projeler" sütunu → **"Programlar"**.
- Megamenüden **"Mini Kurslar" linki silinir** (Kurslar kalır).
- Ana menüye **"Medikal Estetik & Güzellik"** sekmesi eklenir →
  `pages/medikal-estetik.html`.
- Megamenüye **"Podcast"** ve **"Birebir Söyleşiler"** linkleri eklenir
  (tek "Medya" yaklaşımı: İçerik Kütüphanesi ana giriş kalır, türler
  filtreyle ayrışır).
- `blog/index.html` içerik listesine tür filtresi eklenir:
  Makale / Podcast / Söyleşi.

## 4. Kurslar — Mülakatla Kabul Modeli

- Kurs kartlarından **fiyat, eski fiyat, indirim ve öğrenci sayısı
  kaldırılır**; "Kursa Kaydol / Paket Satın Al" butonları yerine
  **"Öngörüşme Talep Et"** butonu gelir.
- Buton, kurs adını içeren hazır mesajla WhatsApp'a gider:
  `https://wa.me/905XXXXXXXXX?text=Merhaba, [Kurs Adı] kursu için
  öngörüşme talep ediyorum.`
- Sayfaya **süreç bölümü** eklenir: Başvuru → Öngörüşme → Mülakat →
  Kabul. Kontenjanın sınırlı olduğu, kaydın mülakat sonucuna göre
  kesinleştiği sade bir dille anlatılır.
- Kayıt bölümünde telefon/e-posta gibi iletişim bilgisi gösterilmez;
  tek kanal WhatsApp butonudur. (İletişim sayfası genel iletişim için
  kalır.)

## 5. Yeni Sayfalar

- **`pages/medikal-estetik.html`** — Medikal Estetik & Güzellik sekme
  sayfası: cilt sağlığı, gençleşme, medikal estetik uygulamaları,
  güzellik konu kartları + ilgili blog yazılarına linkler
  (senolitik/cilt gençleşmesi yazısı mevcut).
- **`pages/podcast.html`** — bölüm listesi şablonu; her bölüm kartı
  başlık + açıklama + metin (transkript) alanı. İçerik yer tutucu.
- **`pages/soylesiler.html`** — video söyleşi kartları; YouTube embed
  yer tutucu alanları, konuk adı + konu açıklaması.
- Yeni sayfalar mevcut sayfa şablonunu (header/footer/pg-hero) izler.

## 6. Rehberler

- "Longevity rehberi" → **"Sağlık Rehberi"** olarak yeniden adlandırılır.
- Rehber listesine yeni kartlar: **cilt, cilt sağlığı, güzellik,
  medikal estetik**.

## 7. Randevu → WhatsApp

- İletişim sayfasındaki randevu formu/akışı WhatsApp CTA'sına döner.
- Sitedeki tüm "randevu" CTA'ları aynı `wa.me` yer tutucu linkini
  kullanır (numara tek seferde değiştirilebilir olmalı — link formatı
  tüm dosyalarda birebir aynı tutulur).

## 8. İçerik Koruması (standart seviye)

`script.js`'e eklenir, tüm sayfalarda etkin:

- `user-select: none` (CSS, `input`/`textarea` hariç)
- `contextmenu`, `copy`, `cut` event'leri engellenir
- Görsellerde `draggable=false` / `dragstart` engeli

Bilinen sınır: ekran görüntüsü tarayıcıdan engellenemez; bu önlemler
caydırıcıdır, mutlak koruma değildir. Kullanıcı bu sınırı kabul etti.
SEO ve erişilebilirlik bozulmaz (içerik DOM'da açık kalır).

## 9. Ücretli Makale Kilidi — Faz 1 (yalnız arayüz)

- Makale kartlarında "Ücretsiz" / "Ücretli" rozetleri.
- Ücretli makale şablonu: giriş bölümü açık; devamı CSS degrade ile
  bulanıklaşır; üzerinde kilit kutusu — başlık, kısa açıklama ve
  "Erişim Satın Al" butonu (yer tutucu link).
- Not: içerik DOM'da durduğu için bu gerçek bir koruma değildir;
  gerçek kilit, ödeme entegrasyonu fazında sunucu taraflı çözülecek.

## Test / Doğrulama

- Tüm sayfalarda nav/footer tutarlılığı ve kırık link taraması
  (yeni sayfalar dahil).
- Hero slider: otomatik geçiş, nokta navigasyonu, JS kapalıyken ilk
  manşetin görünmesi.
- Koruma script'i: metin seçilemiyor, sağ tık/kopya engelli, form
  alanları çalışıyor.
- "Dr. Bakırcı" araması sıfır sonuç vermeli (logo/title'daki tam ad
  hariç); "Mini Kurs", "Özel Projeler", "40 milyon" aramaları sıfır
  sonuç vermeli.
