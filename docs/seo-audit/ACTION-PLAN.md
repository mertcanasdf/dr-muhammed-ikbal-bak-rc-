# SEO Eylem Planı: muhammedikbalbakirci.com

Denetim: 2026-10-05/06, [claude-seo](https://github.com/AgriciDaniel/claude-seo) `seo-audit` akışıyla. 11 uzman denetim yapıldı; bulgular `docs/seo-audit/findings/` altında.

## Denetim öncesi puanlar (yeni sürüm, staging)

| Alan | Puan | Alan | Puan |
|---|---|---|---|
| Teknik SEO | 74 | Schema | 58 |
| İçerik (E-E-A-T) | 52 | Sitemap | 78 |
| Sayfa içi | 58 | Performans | ~94 |
| Görseller | 52 | AI arama (GEO) | 66 |
| Ajan uyumluluğu | 64 | Arama niyeti (SXO) | 57 |
| Konu kümesi | 44 | Mobil/görsel | 82 |
| Yerel SEO | 27 | | |

Puanlar claude-seo'nun sezgisel modelinden gelir; Google verisi değildir. Düzeltmelerden sonra denetim tekrarlanmadı, bu yüzden "sonrası" puanı verilmiyor.

## ✅ Kodda tamamlananlar (sprint-1 dalı, surge önizlemede yayında)

**Teknik**
- Her sayfa tek dosya olarak üretiliyor (`build.format: 'file'`). `/sayfa` adresi doğrudan 200 dönüyor ve canonical ile aynı. `/sayfa/` adresi 301 ile `/sayfa`'ya gidiyor (surge'de doğrulandı).
- Özel 404 sayfası eklendi (noindex).
- nginx kuralları: güvenlik başlıkları, `_astro` önbelleği, `.html` → uzantısız 301 ve birleştirilen yazının 301'i.
- Sitemap: gerçek güncelleme tarihi (`updated`), makale kapakları için `image:image`, noindex sayfalar hariç.
- `llms.txt` her build'de yazılardan üretiliyor.
- IndexNow anahtar dosyası eklendi.
- Denetim betiği 26 maddeyi kontrol ediyor: canonical, sitemap ile tutarlılık, description uzunluğu ve tekilliği, görsel yolları, iç bağlantılar.

**Schema**
- Tek bir `@graph` var. Article düğümünde @context sorunu giderildi.
- Article artık `citation` (Kaynaklar listesi) ve gerçek `dateModified` içeriyor.
- Person düğümüne doğrulanmış bilgiler eklendi: `sameAs` (Instagram, YouTube, LinkedIn, X, Medical Park), `worksFor` VM Medical Park Bursa, `alumniOf` Atatürk Üniversitesi.
- Sayfa tipleri ayrıldı: AboutPage, ContactPage, CollectionPage.

**Sayfa içi**
- `seoTitle` alanı ve kısa marka soneki eklendi; tüm başlıklar 65 karakterin altında.
- Anahtar kelimeli başlıklar: Longevity Nedir, Zone 2, NMN Nedir, Botoks Nedir, Dermal Dolgu Nedir…
- Tüm meta description'lar 120–160 karakter.
- Başlık hiyerarşisi düzeltildi; menü ve footer'daki h4'ler kaldırıldı.
- Varsayılan paylaşım görseli 1200×630; og:image boyutları eklendi.

**İçerik ve E-E-A-T**
- Doğrulanmamış "BM UNF" ifadesi yazar kutusundan, "akademisyen" ifadesi şemadan çıkarıldı.
- Yazar kutusu doğrulanmış özgeçmişle yeniden yazıldı ve /hakkinda'ya bağlantı veriyor.
- 25 düzeltilmiş yazıda görünür "Güncellendi" tarihi var.
- PRP yazıları birleştirildi. Glimfatik yazısının başlığı içeriğiyle eşleşti.
- 6 yazı kaynaklarla genişletildi: biyolojik yaş, Zone 2, güneş kremi, retinoid, denge (+ PRP birleştirmesi).

**İç bağlantı**
- 54 yazıya küme matrisine göre bağlamsal bağlantı paragrafı eklendi; her yazıya en az 3 sayfadan bağlantı var.
- "İlgili makaleler" kartları aynı matrisle uyumlu hale getirildi.
- /longevity sayfası tüm yazılara, /medikal-estetik sayfası tüm cilt yazılarına bağlantı veriyor.

**Performans ve görseller**
- 600px kopyalar + `srcset`, geç yükleme, boyut bilgileri.
- LCP görsellerine `fetchpriority` eklendi.
- 64px avatar için küçük dosya kullanılıyor.

**Erişilebilirlik ve ajanlar**
- Quiz seçenekleri klavyeyle kullanılabilir düğmeler oldu.
- Megamenü klavyeyle açılıyor.
- Başlıktaki arama kutusu çalışıyor.
- Sağ tık/kopyalama engeli ve `user-select:none` kaldırıldı.
- Mobilde dokunma hedefleri 44px, en küçük yazı 12px.

**Temizlik**
- `script.js` içindeki uydurma "başarı hikâyeleri" (hasta yorumları) kaldırıldı.
- /dunyada-saglik noindex (blog ile yinelenen içerik).
- /sitelerimiz noindex (listelenen alan adları canlı değil).

## ⏳ Canlıya alma (sizin yapmanız gerekenler)

1. `sprint-1` dalını master'a birleştirin; `npm run build` ile çıkan `dist/` klasörünü Plesk `httpdocs` dizinine yükleyin (KURULUM-REHBERI.md, Adım 6).
2. `ana-domain-nginx-yonlendirmeler.conf` içeriğini Plesk > Apache ve nginx Ayarları > "Ek nginx yönergeleri" kutusuna yapıştırın.
3. Plesk > Hosting ayarları > Tercih edilen alan adı = `www.muhammedikbalbakirci.com` (www'suz adres 301 ile www'ya gitsin).
4. Doğrulama:
   - `curl -sI https://www.muhammedikbalbakirci.com/hakkinda` → 200, Location başlığı yok
   - `curl -sI https://www.muhammedikbalbakirci.com/hakkinda/` → 301 /hakkinda
   - `curl -sI https://muhammedikbalbakirci.com/` → 301 www
5. Google Search Console ve Bing Webmaster Tools'a siteyi ekleyin, `sitemap.xml` gönderin. Ardından `node scripts/indexnow.mjs` çalıştırın.

## 👨‍⚕️ Hocanın kararı / bilgisi gereken işler (sıralamaya en büyük etki)

| Öncelik | İş | Neden |
|---|---|---|
| Kritik | Birincil randevu telefonu + WhatsApp (web'de 4 farklı numara var) ve iletişim formunun nereye gideceği | /iletisim sayfasında telefon/adres yok, form çalışmıyor |
| Kritik | "botoks bursa" vb. için işlem başına hizmet sayfası: hastane adresi, randevu yolu, SSS | Bu aramalarda Google yalnızca hizmet sayfası gösteriyor; blog yazısı sıralanmaz. Sağlık reklam mevzuatı ve hastane onayı gerekli |
| Yüksek | Google İşletme Profili: var mı, kimde? Hastane listesi üzerinden mi ilerlenecek? | Yerel SEO puanı 27/100 |
| Yüksek | drmuhammedikbalbakirci.com (Doktortakvimi) ile ana site arasında karşılıklı bağlantı | İki alan adı birbirinden habersiz |
| Yüksek | UNF temsilciliği ve doktora durumu için belge | Doğrulanırsa /hakkinda ve şemaya eklenir |
| Orta | Wikidata kaydı, YouTube içerikleri, basın/kongre bağlantıları (backlink) | Genel aramalarda otorite. 6–12 ay sürer |
| Orta | /sitelerimiz'deki projeler gerçek mi? | Değilse sayfa kaldırılmalı |

## 📝 Sonraki içerik turu

- Kalan ince yazıların 900–1.500 kelimeye çıkarılması: ortalama ~270 kelime, 40+ yazı.
- Yeni yazılar: Botoks ne kadar sürer, Dermal dolgu ne kadar sürer, ApoB nedir, Kolajen takviyesi işe yarar mı, Longevity check-up tahlilleri.
- /dunyada-saglik sayfasına özgün içerik; ardından noindex kaldırılabilir.

## Beklenti

- İsim aramalarında ("Muhammed İkbal Bakırcı") site zaten çıkıyor. Yeni sürüm canlıya alınınca başlık ve kişi işaretlemesiyle daha güçlü görünecek.
- "nmn nedir", "zone 2 kardiyo", "biyolojik yaş nasıl ölçülür" gibi uzun aramalar 3–6 ayda kazanılabilir görünüyor.
- "botoks bursa" gibi yerel hizmet aramaları hizmet sayfası, İşletme Profili ve yorumlar olmadan kazanılmaz.
- "longevity nedir" gibi genel aramalar için otorite ve backlink gerekir (6–12+ ay).
- Hiçbir sıralama garanti edilemez.
