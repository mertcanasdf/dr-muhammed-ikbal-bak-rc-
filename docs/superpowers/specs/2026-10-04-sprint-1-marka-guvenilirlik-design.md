# Sprint 1 — Marka ve Güvenilirlik

**Tarih:** 2026-10-04
**Kaynak:** "Dr. Muhammed İkbal Bakırcı Web Sitesi Revizyon İş Planı" (20 madde, 3 sprint)
**Kapsam:** Sprint 1 maddeleri — 1, 2, 3, 4, 9, 13, 14, 15 — ve aynı amaca hizmet eden güven düzeltmeleri.
**Temel:** `master` @ `315d5a2` (canlı sitenin kaynağı, Codex `seo-build-clean`, 15 Eylül)

## Amaç

Sitenin ilk izlenimini "longevity ürün sitesi"nden "hekim, sağlık yöneticisi ve akademisyen olan bir uzmanın kişisel sitesi"ne çevirmek. Güveni zedeleyen her şeyi (hasta hikâyeleri, boş içerik sayfaları, doğrulanmamış rakamlar, ABD tipi yasal metin, kişisel iletişim bilgileri) kaldırmak.

Görsel dil (renkler, tipografi, iç sayfa düzenleri) bu sprintte değişmez.

## 1. Kaldırılanlar

| Öğe | İşlem | Gerekçe |
|---|---|---|
| `/basari-hikayeleri` | Sayfa silinir, nginx `410 Gone` | Madde 3. Hasta deneyimleri; sağlık tanıtım yönetmeliği riski. |
| `/podcast` | Sayfa silinir, nginx `410 Gone` | Madde 4. Gerçek yayın yok; yalnızca "Yakında" kutuları. |
| `/soylesiler` | Sayfa silinir, nginx `410 Gone` | Podcast ile aynı durum: boş "Yakında" kutuları. |
| `/kurslar` | Sayfa silinir, nginx `410 Gone` | Doğrulanmamış rakamlar ("4.200 öğrenci", "42 video ders") ve indirimli fiyatlar. Sprint 2'de "Eğitimler & Akademi" olarak yeniden yazılacak (madde 6). |
| `AnnouncementBar` | Bileşen ve layout'taki kullanımı silinir | Pazarlama dili, podcast linki, kişisel WhatsApp. |
| `PromoModal` | Dosya silinir | Hiçbir yerde kullanılmıyor (ölü kod). |
| Footer FDA metni | Değiştirilir (bkz. §4) | Madde 15. |

Bu dört sayfaya giden tüm iç linkler (header, footer, anasayfa, sitemap) kaldırılır.

`410` seçimi: içerik bilerek kaldırıldı. Alakasız bir sayfaya 301 yönlendirmesi Google tarafından "soft 404" sayılır; 410 ise sayfanın dizinden daha hızlı çıkmasını sağlar.

## 2. Menü (madde 9)

```
Ana Sayfa · Dr. Bakırcı · Longevity · Skin Longevity · Keşfet · Medya · İletişim
```

| Menü | Hedef | Alt öğeler |
|---|---|---|
| Ana Sayfa | `/` | — |
| Dr. Bakırcı | `/hakkinda` | — (alt menü yok; "Mesleki Yolculuk" timeline'ı Sprint 2'de, madde 12) |
| Longevity | `/longevity` | Mevcut megamenü; konuyla eşleşmeyen linkler düzeltilir (bkz. aşağı) |
| Skin Longevity | `/medikal-estetik` | Mevcut "Klinik Uygulamalar" bağlantıları |
| Keşfet | `/blog` | İçerik Kütüphanesi (`/blog`), Rehberler (`/rehberler`), Kendini Değerlendir (`/quizler`), Dünyada Sağlık (`/dunyada-saglik`) |
| Medya | `/gecmis-yillar` | Kongreler & Konuşmalar (`/gecmis-yillar`). Media Kit Sprint 3'te eklenir. |
| İletişim | `/iletisim` | — |

- Üstteki yardımcı çubuk (`utility-nav`: Hakkında / İletişim) kaldırılır; iki link de artık ana menüde.
- Logo altı unvanı: `Dr. Longevity` → `Hekim · Sağlık Yöneticisi · Akademisyen`.
- Konuyla eşleşmeyen menü linkleri kaldırılır. Örnek: "Uyku Kalitesi ve Cilt Onarımı" → telomer yazısı, "Beyin Sağlığı" → NMN yazısı. Her menü linki, adıyla aynı konudaki sayfaya gitmelidir.
- `/medikal-estetik` sayfasının H1 ve `<title>` değeri "Skin Longevity & Medikal Estetik" olur ki menü etiketiyle uyuşsun. Sayfanın geri kalanı Sprint 2'ye (madde 7, 17) kalır.
- Mobil menü (`public/mobile-menu.js`) aynı yapıyı gösterir.

## 3. Anasayfa (madde 1, 2)

Anasayfa baştan yazılır. Mevcut carousel'ler (başarı hikayeleri, podcast), dönen başlıklar ve makale sekmeleri kaldırılır; Splide anasayfada da gerekmez.

Bölümler, yukarıdan aşağıya:

1. **Hero**
   - Ad: Dr. Muhammed İkbal Bakırcı
   - H1: **Sağlıklı Yaş Almanın Bilimi**
   - Alt satırlar: `Longevity · İnsan Optimizasyonu` / `Skin Longevity · Medikal Estetik`
   - Kısa mesaj: sağlıklı yaşamın yalnızca uzun yaşamak değil, bedeni, zihni ve sosyal yaşamı birlikte korumak olduğu
   - Portre: `/assets/images/dr-muhammed-ikbal-bakirci.jpg`
   - Butonlar: "Dr. Bakırcı'yı tanıyın" → `/hakkinda`, "Longevity'yi keşfedin" → `/longevity`
2. **4 kimlik kartı** (ikonlu, hero'nun hemen altında)
   - Hekim — medikal estetik ve uzun vadeli cilt sağlığı
   - Sağlık Yöneticisi — VM Medical Park Bursa Hastanesi Başhekimi (2022'den beri)
   - Akademisyen — sağlık yönetimi, pazarlama, kozmetik ve longevity çalışmaları
   - Longevity — sağlıklı yaş alma ve insan optimizasyonu
3. **6 yaşam alanı:** Beslenme · Hareket · Uyku · Zihin · Sosyal İlişkiler · Skin Longevity (madde 16'daki altı alanla aynı)
4. **İçerik kütüphanesinden 3 yazı** + "Tüm içerikler" → `/blog`
5. **Kısa biyografi** + "Hakkımda" ve "İletişime geçin" butonları

Kimlik kartlarındaki ve biyografideki her olgu `/hakkinda` sayfasındaki mevcut metinden alınır; yeni iddia eklenmez.

Anasayfa SEO: `<title>` = "Dr. Muhammed İkbal Bakırcı — Sağlıklı Yaş Almanın Bilimi".

## 4. Footer (madde 15)

- FDA metni şu metinle değiştirilir:
  > Bu sitedeki içerikler genel bilgilendirme amaçlıdır; tanı ve tedavi yerine geçmez. Sağlığınızla ilgili kararlar için hekiminize danışın.
- Kaldırılan linkler: Podcast, Söyleşiler, Kurslar, "Kariyer", "Basın", "Erişilebilirlik" (son üçü `/iletisim`e gidiyordu) ve 6 sosyal medya ikonu (hepsi `/iletisim`e gidiyordu, gerçek hesap yok). Gerçek hesap adresleri verilirse ikonlar geri eklenir.
- "Vücut Tipi Quizi" bağlantısı "Kendini Değerlendir" olarak tek linke indirilir.
- Footer sütunları yeni menüyle aynı bilgi mimarisini izler.

## 5. İletişim (madde 13, 14)

### 5.1 Kişisel bilgilerin kaldırılması (madde 14)

`0544 224 48 13` ve `Muhammedikbalb@gmail.com` (düz metin, `tel:`, `mailto:`, `wa.me` bağlantıları ve JSON-LD dahil) şu dosyalardan kaldırılır:

`src/lib/seo.ts`, `src/pages/hakkinda.astro`, `src/pages/iletisim.astro`, `src/pages/index.astro`, `src/pages/medikal-estetik.astro`, `src/content/blog/{altin-igne,botoks,dermal-dolgu,mezoterapi,prp-eksozom}.md`. (`AnnouncementBar`, `kurslar`, `podcast` §1'de zaten siliniyor.)

Randevu çağrıları (Medikal Estetik sayfası ve 5 estetik yazısı) `/iletisim#randevu` adresine yönlendirilir.

### 5.2 Profesyonel iletişim formu (madde 13)

`/iletisim` sayfası dört kanal üzerinden yeniden düzenlenir: **Randevu · İş Birliği · Akademik · Medya.** Her kanalın kısa bir açıklaması ve sayfa içi bir çapası (`#randevu`, `#is-birligi`, `#akademik`, `#medya`) vardır. Tek form, kanal seçimiyle birlikte gönderilir.

Alanlar: Ad Soyad, E-posta, Kanal (4 seçenek), Mesaj, KVKK açık rıza onay kutusu (`/gizlilik-politikasi` bağlantılı). Hepsi zorunludur.

**Gönderim yöntemi:** ⏸ **Karar bekleniyor (D1).** Form, gönderimi tek bir modül (`src/lib/contact.ts`) üzerinden yapacak şekilde yazılır; yöntem seçildiğinde yalnızca bu modül değişir. Değerlendirilen seçenekler:

- A — Ziyaretçinin WhatsApp'ını hazır mesajla açmak (iş numarası ile)
- B — Sunucudan otomatik bildirim (Plesk PHP + WhatsApp API)
- C — Form servisi + kurumsal e-posta

**D1 karara bağlanmadan Sprint 1 yayına alınmaz.** Çalışmayan bir form, ziyaretçinin yazdığı mesajın kaybolması demektir; bu, sprintin güven hedefine aykırıdır.

## 6. Kapsam dışı (sonraki sprintler)

Hakkında unvanı ve timeline (madde 10–12), Biyolojik Yaş → Tutarlılık Profili (5), Eğitimler & Akademi (6), Skin Longevity sayfası (17), blog kategorileri (8), Longevity yeniden yapılandırması (16), quizler (18), rehberler (19), Media Kit (20).

## 7. Doğrulama

1. `npx astro build` hatasız tamamlanır.
2. `dist/` içinde şu aramaların sonucu **sıfır** olur: `905442244813`, `0544`, `224 48 13`, `224 4813`, `gmail`, `Gıda ve İlaç İdaresi`, `href="/basari-hikayeleri"`, `href="/podcast"`, `href="/kurslar"`, `href="/soylesiler"`, `Dr. Longevity`.
3. `dist/` altında `basari-hikayeleri/`, `podcast/`, `kurslar/`, `soylesiler/` klasörleri yoktur; `sitemap.xml` bu adresleri içermez.
4. Kırık iç link kontrolü: `dist/` içindeki her `href="/…"` ve `src="/…"` var olan bir dosyaya çözülür (script ile).
5. Tarayıcıda kontrol: anasayfa, menü (masaüstü ve mobil 375px), footer, iletişim formu (doğrulama hataları dahil), medikal estetik sayfası.
6. Aynı tarihli makalelerin sırası her build'de değişmemesi için makale listeleri tarihe ek olarak başlığa göre de sıralanır (build'lerin birbiriyle karşılaştırılabilmesi için).

## 8. Yayına alma

Canlı site `mib-site` @ `fb028d9` (14 Eylül 19:07) durumunda; kaynak ise `4f2f3c6` ile eşdeğer. Sprint 1 yayını, canlıda olmayan şu dört değişikliği de yayına alır (kullanıcı onayı: 2026-10-04): paylaşım butonu renkleri, UNF ifadesinin geçmiş zamana alınması, 30 yeni makale ve kapak görselleri.

- `ana-domain-nginx-yonlendirmeler.conf` dört kaldırılan adres için `410` kurallarıyla güncellenir.
- Yeni build `site-dist-<tarih>.zip` olarak hazırlanır.
- Yükleme kullanıcı tarafından yapılır (Plesk). Canlı site `github.com/mertcanasdf/mib-site` ile de eşleniyorsa, o repoya da yeni build gönderilir — kullanıcının onayıyla.

## Açık kararlar

| # | Karar | Sahibi | Engellediği |
|---|---|---|---|
| D1 | İletişim formunun gönderim yöntemi ve iş numarası/e-postası | Kullanıcı | Sprint 1'in yayına alınması |
| D2 | Gerçek sosyal medya hesap adresleri (varsa) | Kullanıcı | Hiçbir şey; yoksa ikonlar kaldırılmış kalır |
