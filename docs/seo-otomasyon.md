# SEO otomasyonu

Hedef: hedef sorgularda Google'da 1. sıra. Sistem üç katmanlıdır. Hepsi bu belgeyi kural kitabı olarak kullanır.

| Katman | Kim, ne zaman | İş |
|---|---|---|
| 1. Yeni içerik | Claude, günde 5 çalışma: 09, 11, 13, 15, 17 (zamanlanmış görev `bakirci-gunluk-yazi`) | Veri ve trend keşfini çalıştırır; her çalışmada yükselen bir aramadan **bir yeni yazı** yazar ve yayınlar (günde 5). Codex yalnızca kapak görselini üretir (`scripts/gorsel-uret.mjs` onu çağırır); Codex'in eski yazı otomasyonu 26 Ekim'den beri duraklatıldı. |
| 2. İyileştirme, kalite kapısı, rapor | Claude, her gün 19.30 (`bakirci-seo-gunluk-kontrol`) | Günün yazılarını claude-blog ölçütleriyle denetler; günün **iyileştirme** görevini yapar; yayınlar ve raporlar |
| 3. Derin denetim | Claude, her Pazar 13.00 (`bakirci-seo-haftalik-denetim`) | claude-seo denetimi; bulguları `data/seo/kuyruk.json`'a iş olarak ekler |

Görevleri `node scripts/seo/gunluk-gorev.mjs` seçer; kimse kendi seçim yapmaz. `data/seo/bugun.json` içinde `isler` listesi Codex'in işleri, `iyilestirme` alanı Claude'un görevidir.

Codex her çalışmada:
- `node scripts/seo/gunluk-gorev.mjs --is-al`: sıradaki işi `yaziliyor` yapar ve gösterir; yarım kalan iş varsa onu verir.
- `--is-bitti SLUG`: işi `tamam` olarak kapatır, geçmişe yazar ve sitemap'i Search Console API ile Google'a yeniden gönderir (`gsc.mjs --sitemap`).
- `--is-atla "neden"`: konu ilk sayfa incelemesinde uygun değilse işi atlar; ardından `--is-al` sıradakini (yedek konuları da) verir.
- 5 yeni yazı tamamlanınca `--is-al` "Bugünün işleri bitti" der; o çalışma içerik üretmez.

Günde beş yazı kaliteden ödün vermek değildir. Google'ın ölçekli içerik politikası, aramada değer katmayan seri sayfaları sitenin tamamı için cezalandırabilir. Her yazı tek başına ilk sayfadaki en iyi sonuçtan daha yararlı olmalı; kalıp giriş, aynı iskelet ve dolgu yasaktır. Claude akşam kapısında aynı günün yazılarını bu açıdan da karşılaştırır.

## Günlük akış

1. `node scripts/seo/gunluk-gorev.mjs` çalıştırılır. Sırasıyla şunları yapar:
   - canlı siteyi denetler;
   - Search Console verisini çeker (anahtar varsa, her gün; son 28 gün, son 7 gün ve önceki 28 gün);
   - anahtar kelime takibini günceller (`scripts/seo/anahtar-kelime.mjs`: sorgu başına sıra, haftalık değişim, içerik boşluğu);
   - yükselen aramaları keşfeder (`scripts/seo/trend-kesif.mjs`, günde bir);
   - kaynak bağlantılarını kontrol eder (Pazar ya da 7 günde bir);
   - iki görevi `data/seo/bugun.json` dosyasına yazar.
2. Codex kendi görevini yapar; kapılardan geçer: `node scripts/sync-related.mjs`, ardından `scripts/publish-content.mjs --article <slug> … --dry-run` ve `npm test`. Kapılar geçerse aynı komut `--publish` ile çalıştırılır. Önceki yayınların canlı durumu `--retry-live` ile kontrol edilir; canlı doğrulanan adresler IndexNow'a bildirilir.
3. Claude 19.30'da günün yazılarını denetler, `iyilestirme` görevini yapar, `npm run verify` ve `npm test` sonrası `scripts/seo/mib-yayinla.mjs` ile yayınlar ve kaynağı `sprint-1`'e commit'ler.

Aynı gün betik tekrar çalışırsa aynı görevleri döndürür (`--yeniden` yeniden seçer). Yayın betiği günde en fazla 6 içerik yayınına izin verir (5 yeni yazı + 1 teknik düzeltme).

## Trend keşfi (`scripts/seo/trend-kesif.mjs`)

Sitenin konularındaki ~70 tohum (longevity, beslenme, hareket, uyku, zihin, cilt) için Google otomatik tamamlama önerileri toplanır; her gün 12 tohum soru kalıplarıyla (nedir, belirtileri, faydaları, nasıl…) genişletilir. Google Trends Türkiye günlük listesindeki sağlık başlıkları da eklenir.
- Ticari (fiyat, marka, eczane, doktor, randevu), şehir ve okul sorguları elenir.
- Her sorgunun mevcut yazılarla örtüşmesi başlık, açıklama ve alt başlıklardan ölçülür. %60 ve üstü örtüşen sorgu mevcut yazıya, kalanı yeni yazı adayına gider.
- Puan: öneri sırası, birden çok tohumda görünme, kaç gündür görüldüğü, yeni çıkması (yükselen), Trends'te olması ve bilgi niyeti.
- Ürün (krem, tablet, serum…) ve kültür sorguları (kitap, şarkı, "ne zaman yazıldı") elenir; yeni yazı konusu yalnız bilgi niyetli sorgudan (nedir, belirtileri, nasıl…) doğar.
- Ortak kökü olan karşılıksız sorgular tek konu olarak kümelenir.
- Tohumun kendi yazısı zaten varsa (ör. "magnezyum" → `magnezyum-eksikligi`) o tohumdaki sorgular yeni sayfa açmaz; ikinci sayfa ilkiyle aynı aramalarda yarışır. Bunlar `guclendir` listesine gider ve Claude'un iyileştirme sırasına girer. Çıktı `data/seo/trend-adaylari.json`; geçmiş `trend-gecmis.json`.
- Daha önce işlenen konu (`gorev-gecmisi.json` `topic`) tekrar verilmez.

## Codex görevi

1. Canlı sitede kritik teknik sorun varsa `teknik-duzeltme`.
2. Ardından günde 5 `yeni-yazi`: önce haftalık denetim kuyruğundaki yeni yazı işleri, sonra trend keşfinin en yüksek puanlı karşılıksız konuları. Aynı gün her konu farklı tohumdan seçilir; atlananların yerine 3 yedek konu vardır. Trend konusu yoksa `data/content-plan.json` sıradaki aday.

## Claude iyileştirme görevi

Günde **2 iyileştirme** (`bugun.json` `iyilestirmeler`); ilk 20'deki sayfaları itmek yeni yazıdan daha hızlı tık getirir. Aynı gün aynı sayfa iki kez seçilmez. Her biri şu sırayla seçilir:

Önce haftalık denetim kuyruğundaki `priority: "yuksek"` iş. Yoksa günün ilk fırsat türü, sonra kuyruğun normal öncelikli işi, sonra trend keşfinin `guclendir` listesi (konusu zaten yazılmış yükselen aramalar), sonra günün kalan sırası:

| Gün | Sıra |
|---|---|
| Pazartesi | düşük CTR → 2–20. sıradaki sorgular → çürüme → içerik boşluğu → kısa yazı |
| Salı | 2–20. sıra → düşük CTR → içerik boşluğu → çürüme → kısa yazı |
| Çarşamba | çürüme / düşen sorgu → 2–20. sıra → düşük CTR → içerik boşluğu → kısa yazı |
| Perşembe | düşük CTR → 2–20. sıra → içerik boşluğu → çürüme → kısa yazı |
| Cuma | 2–20. sıra → düşük CTR → çürüme → içerik boşluğu → kısa yazı |
| Cumartesi | içerik boşluğu → 2–20. sıra → düşük CTR → çürüme → kısa yazı |
| Pazar | kırık kaynak → az kaynaklı yazı → 2–20. sıra → düşük CTR → kısa yazı |

- **Düşük CTR** → `ctr-iyilestirme`; **2–20. sıra** ve **içerik boşluğu** → `sorgu-optimizasyonu`; **çürüme** → `icerik-tazeleme`; **kısa / az kaynaklı yazı** → `yazi-genisletme`.
- **Kısa sayfa:** Fırsat sayfası 600 kelimenin altındaysa görev, yazının sorguya göre tam genişletilmesini de içerir (`alsoExpand`).
- Bir yazıya 30 gün içinde ikinci iyileştirme görevi verilmez (CTR için yalnız önceki CTR görevleri sayılır).

## Görev türleri

### yeni-yazi
`docs/daily-content-workflow.md` adımları uygulanır. Konu `bugun.json`'daki trend konusudur (yoksa plandaki ilk tamamlanmamış aday). Ana sorgu ve ilişkili sorgular için Google ilk sayfası incelenir; yazı oradaki her sonuçtan daha eksiksiz ve net olur: ilk paragraf ana soruya doğrudan yanıt, ilişkili sorgular H2/H3 ya da SSS, seoTitle'ın ilk 50 karakterinde ana sorgu. Konu mevcut bir yazıyla çakışıyorsa kopya sayfa açılmaz, o yazı güçlendirilir. Konu kapsam dışı, ticari ya da yönetmeliğe aykırıysa sonraki trend konusuna geçilir. Yazının kendi kapağı üretilir.

### icerik-tazeleme
Trafiği ya da sırası düşen yazı (claude-blog `blog-decay` modeli).
- Önce nedeni bulunur: o sorguda ilk sayfadaki sonuçlar şimdi neyi daha iyi veriyor, arama niyeti değişti mi, yazıdaki bilgi eskidi mi?
- Başlık, ilk paragraf, alt başlıklar ve kaynaklar buna göre güncellenir; eskiyen bilgi düzeltilir.
- `updated` bugünün tarihi olur.

### yazi-genisletme
Hedef, **arama niyetini tam karşılayan** bir yazı. Kelime sayısı amaç değil, sonuçtur. Kısa yazıların çoğu bugün 200–300 kelime; hedef 900–1.400 kelime.

1. Konunun Türkçe aramalarına bakılır. İlk sayfadaki sonuçların hangi alt soruları yanıtladığı not edilir: tanım, nasıl, ne zaman hekime başvurulur, riskler, sık sorulanlar.
2. Eksik alt sorular, gerçekten açılıp okunmuş kaynaklarla yazılır. En az 3 güncel kaynak kullanılır: WHO, NHS, CDC, NIH, AAD, Sağlık Bakanlığı, kılavuzlar, PubMed'deki derleme ve RKÇ'ler. Kaynaklar `## Kaynaklar` altına ve ilgili cümleye bağlanır.
3. İlk paragraf, başlıktaki soruya 2–3 cümlede doğrudan cevap verir. Google'ın öne çıkan snippet'i genelde buradan alınır.
4. Uygun yerde kontrol listesi, tablo ya da "Ne zaman hekime başvurmalı?" bölümü eklenir.
5. Varsa SSS: Search Console'daki ya da "Diğer kullanıcılar şunları da sordu" kutusundaki gerçek sorular.
6. `date` korunur, `updated` bugünün tarihi olur, `readTime` yeniden hesaplanır.

### sorgu-optimizasyonu
Görevde listelenen sorgular sayfada 2–20. sırada çıkıyor; hedef 1. sıra. Bu sorguların her biri sayfada **doğrudan ve açık** yanıtlanır:
- Eksik soru için H2 ya da H3 eklenir. Soru kalıbı, kullanıcının yazdığı biçime yakın olmalı.
- Gerekirse ilk paragraf, ana sorguya net bir cevapla yeniden yazılır.
- Sorgu sayfanın konusu değilse sayfa zorlanmaz. O sorguyu karşılayan sayfaya (varsa) bağlantı verilir ya da içerik planına aday eklenir.
- Esaslı değişiklik yapıldıysa `updated` ilerletilir.

### ctr-iyilestirme
Sayfa ilk 10'da ama tıklanma oranı beklenenin yarısından az. **Yalnızca başlık (`title` / `seoTitle`) ve `description` değişir**, içeriğe dokunulmaz, `updated` ilerletilmez.
- Görevdeki üst sorguların niyeti başlığın ilk 50 karakterinde karşılanır.
- Description, sayfanın gerçekten verdiği cevabı ve somut faydayı söyler (120–160 karakter).
- Merak tuzağı, abartı, "en iyi", "kesin", "mucize" ya da vaat kullanılmaz.
- Eski ve yeni başlık `data/content-automation-state.json` raporuna yazılır. Etki 2–4 hafta sonra Search Console'dan karşılaştırılır.

### kaynak-onarim
`data/seo/kirik-kaynaklar.json` dosyasındaki adres art arda iki kontrolde 404/410 ya da alan adı hatası vermiş demektir.
- Kaynak, aynı kurumun güncel sayfasıyla değiştirilir.
- Bulunamazsa eşdeğer güvenilir bir kaynak kullanılır.
- O da yoksa ilgili cümle kaynaklı biçimde yeniden yazılır ya da çıkarılır.

### teknik-duzeltme
`data/seo/canli-denetim.json` dosyasındaki kritik sorun **yerel build'de de** varsa kaynakta düzeltilir. Yalnızca canlıda varsa (sunucunun yayını çekmesi bekleniyorsa) görev oluşmaz.

## Değişmez kurallar

- **Sağlık tanıtım mevzuatı** (RG 29.07.2023):
  - hekime ya da randevuya yönlendiren çağrı yok;
  - "uzman" gibi sahip olunmayan unvan yok;
  - önce/sonra görseli, hasta yorumu ya da başarı hikâyesi yok;
  - kanıtsız yöntem öne çıkarılmaz;
  - "Bursa botoks" türü hizmet sayfası açılmaz.
- Kişisel tedavi, reçete, doz planı, "hekim tarafından incelendi" onayı ya da sıralama garantisi yazılmaz.
- Rakam uydurulmaz: Search Console verisi yoksa gösterim, tıklama ve sıra "bilinmiyor" kalır.
- Her yazının kendi kapağı olur (`verify-dist` kontrolü). Kapak kuralları `docs/gorsel-sanat-yonu.md` dosyasında.
- Kaynak repodaki kullanıcı değişikliklerine dokunulmaz: reset, stash ve clean yok. Force push yapılmaz.

## Search Console bağlantısı (bir kerelik kurulum)

Otomasyon performans verisini, kullanıcı oturumu olmadan Search Console API'den okur. Bunun için bir hizmet hesabı gerekir:

1. [Google Cloud Console](https://console.cloud.google.com/)'da bir proje oluşturun (ya da var olanı seçin).
2. **API'ler ve Hizmetler › Kitaplık** bölümünde **Google Search Console API**'yi etkinleştirin.
3. **IAM ve Yönetici › Hizmet hesapları › Hizmet hesabı oluştur** adımında bir ad verin. Rol gerekmez.
4. Hesabı açın, **Anahtarlar › Anahtar ekle › JSON** ile anahtar dosyasını indirin.
5. Dosyayı şuraya taşıyın: `C:\Users\mertc\.secrets\gsc-muhammedikbalbakirci.json`. **Repoya koymayın.**
6. Search Console › **Ayarlar › Kullanıcılar ve izinler › Kullanıcı ekle**: hizmet hesabının e-postasını (`…@….iam.gserviceaccount.com`) **Tam** izinle ekleyin.
7. Deneme: `node scripts/seo/gsc.mjs --denetle 5`

Anahtar yoksa betik "atlandı" der. Otomasyon çalışmaya devam eder, yalnızca Search Console'a dayalı görevler oluşmaz.

## Dosyalar

| Dosya | İçerik | Repoda |
|---|---|---|
| `scripts/seo/gunluk-gorev.mjs` | Görev seçici | ✔ |
| `scripts/seo/gsc.mjs` | Search Console performans ve URL Denetleme | ✔ |
| `scripts/seo/firsatlar.mjs` | Vuruş mesafesi, düşük CTR, yamyamlık, kısa yazı, az kaynak | ✔ |
| `scripts/seo/canli-denetim.mjs` | Canlı teknik denetim | ✔ |
| `scripts/seo/kaynak-kontrol.mjs` | Dış kaynak bağlantısı kontrolü | ✔ |
| `scripts/seo/anahtar-kelime.mjs` | Anahtar kelime takibi: sıra, haftalık değişim, içerik boşluğu | ✔ |
| `scripts/seo/gunluk-rapor.mjs` | Günlük SEO raporu (`data/seo/rapor/<gün>.md`) | ✔ |
| `data/seo/kuyruk.json` | Haftalık denetimin eklediği işler | ✘ |
| `data/seo/gorev-gecmisi.json` | Hangi gün hangi görev, hangi yazı | ✔ |
| `data/seo/*.json` (diğerleri) | Search Console verisi ve önbellekler | ✘ (repo herkese açık) |

## Claude kalite kapısı (her gün 19.30)

Codex'in o günkü değişikliği yayından önce değil, **yayından sonra** denetlenir. Sunucu yeni sürümü 15 dakika içinde çeker; sorun bulunursa düzeltme aynı gün yayınlanır.

1. **Puanlama:** Değişen yazı claude-blog `blog-analyze` ile puanlanır (100 üzerinden). 80'in altındaysa en büyük eksik giderilir.
2. **Gerçeklik:** `blog-factcheck` ile yük taşıyan iddialar kaynaklarıyla eşleştirilir. Kaynaksız ya da kaynakla uyuşmayan sağlık iddiası düzeltilir ya da çıkarılır.
3. **Yapay zekâ alıntılanabilirliği:** `blog-geo` ölçütleri kontrol edilir: ilk paragrafta doğrudan cevap, alıntılanabilir tanımlar, net varlık adları.
4. **Mevzuat:** Aşağıdaki "Değişmez kurallar" bölümü.
5. Düzeltme yapıldıysa `npm run verify` ve `npm test` çalıştırılır; build `mib-site`'a, kaynak `sprint-1`'e gönderilir.
6. Günlük rapor (`node scripts/seo/gunluk-rapor.mjs`) kullanıcıya özetlenir.
