# SEO otomasyonu

Sistem üç katmanlıdır. Hepsi bu belgeyi kural kitabı olarak kullanır.

| Katman | Kim, ne zaman | İş |
|---|---|---|
| 1. Veri ve görev | Codex, her gün 10.00 ("Günlük SEO makalesi ve analiz") | Search Console, anahtar kelime takibi, fırsat analizi; günün **tek** görevini yapar ve yayınlar |
| 2. Kalite kapısı ve rapor | Claude, her gün 11.30 (zamanlanmış görev `bakirci-seo-gunluk-kontrol`) | Codex'in işini claude-blog ölçütleriyle puanlar ve doğrular, sorun varsa düzeltip yayınlar, günlük raporu verir |
| 3. Derin denetim | Claude, her Pazar 13.00 (`bakirci-seo-haftalik-denetim`) | claude-seo denetimi; bulguları `data/seo/kuyruk.json`'a iş olarak ekler |

Görevi `node scripts/seo/gunluk-gorev.mjs` seçer; Codex kendi seçim yapmaz.

## Günlük akış

1. `node scripts/seo/gunluk-gorev.mjs` çalıştırılır. Sırasıyla şunları yapar:
   - canlı siteyi denetler;
   - Search Console verisini çeker (anahtar varsa, her gün; son 28 gün, son 7 gün ve önceki 28 gün);
   - anahtar kelime takibini günceller (`scripts/seo/anahtar-kelime.mjs`: sorgu başına sıra, haftalık değişim, içerik boşluğu);
   - kaynak bağlantılarını kontrol eder (Pazar ya da 7 günde bir);
   - günün görevini `data/seo/bugun.json` dosyasına yazar.
2. Çıktıdaki görev bu belgedeki ilgili bölüme göre yapılır.
3. Kapılardan geçilir. `node scripts/sync-related.mjs` çalıştırılır, ardından `scripts/publish-content.mjs --article <slug> … --dry-run` ve `npm test`. Kapılar geçerse aynı komut `--publish` ile çalıştırılır.
4. Önceki yayınların canlı durumu `--retry-live` ile kontrol edilir. Canlı doğrulanan adresler IndexNow'a bildirilir.
5. Kullanıcıya kısa bir sonuç verilir: görev, neden seçildiği, ne değişti, kontroller, GitHub commit'i ve canlı durum.

Aynı gün betik tekrar çalışırsa aynı görevi döndürür. Gün içinde ikinci bir içerik yayını yapılmaz; yayın betiği bunu ayrıca engeller.

## Haftalık takvim

| Gün | Görev | Search Console verisi yoksa |
|---|---|---|
| Pazartesi | `ctr-iyilestirme`, yoksa `sorgu-optimizasyonu` | `yazi-genisletme` |
| Salı | `yeni-yazi` | |
| Çarşamba | `yazi-genisletme` | |
| Perşembe | `yeni-yazi` | |
| Cuma | `sorgu-optimizasyonu`, yoksa `ctr-iyilestirme` | `yazi-genisletme` |
| Cumartesi | `yeni-yazi` | |
| Pazar | `kaynak-onarim`, yoksa az kaynaklı yazıyı genişletme | |

Takvimin önüne geçenler, sırasıyla:
1. Canlı sitede kritik teknik sorun (`teknik-duzeltme`).
2. Haftalık denetim kuyruğundaki `priority: "yuksek"` iş (`data/seo/kuyruk.json`).
3. Pazar: kırık kaynak.

Takvim içi ek kurallar:
- **Çarşamba:** Önce gösterimi önceki 28 güne göre %40'tan fazla düşen sayfa ya da bir haftada 3+ sıra kaybeden sorgunun sayfası tazelenir (`icerik-tazeleme`). Yoksa kısa yazı genişletilir.
- **Yeni yazı günleri:** Search Console'da karşılığı zayıf bir sorgu (içerik boşluğu) varsa onu hedefler. Sorguyu zaten bir yazı alıyorsa yeni sayfa açılmaz; o yazı sorguya göre güçlendirilir (`sorgu-optimizasyonu`).
- **Kısa sayfa:** Fırsat sayfası 600 kelimenin altındaysa görev, yazının sorguya göre tam genişletilmesini de içerir.
- Bir yazıya 30 gün içinde ikinci iyileştirme görevi verilmez.

## Görev türleri

### yeni-yazi
`docs/daily-content-workflow.md` adımları uygulanır: plandaki ilk tamamlanmamış aday işlenir, gerçek arama niyeti araştırılır, kopya sayfa açılmaz ve yazının kendi kapağı üretilir.

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
Görevde listelenen sorgular sayfada 4–20. sırada çıkıyor. Bu sorguların her biri sayfada **doğrudan ve açık** yanıtlanır:
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

## Claude kalite kapısı (her gün 11.30)

Codex'in o günkü değişikliği yayından önce değil, **yayından sonra** denetlenir. Sunucu yeni sürümü 15 dakika içinde çeker; sorun bulunursa düzeltme aynı gün yayınlanır.

1. **Puanlama:** Değişen yazı claude-blog `blog-analyze` ile puanlanır (100 üzerinden). 80'in altındaysa en büyük eksik giderilir.
2. **Gerçeklik:** `blog-factcheck` ile yük taşıyan iddialar kaynaklarıyla eşleştirilir. Kaynaksız ya da kaynakla uyuşmayan sağlık iddiası düzeltilir ya da çıkarılır.
3. **Yapay zekâ alıntılanabilirliği:** `blog-geo` ölçütleri kontrol edilir: ilk paragrafta doğrudan cevap, alıntılanabilir tanımlar, net varlık adları.
4. **Mevzuat:** Aşağıdaki "Değişmez kurallar" bölümü.
5. Düzeltme yapıldıysa `npm run verify` ve `npm test` çalıştırılır; build `mib-site`'a, kaynak `sprint-1`'e gönderilir.
6. Günlük rapor (`node scripts/seo/gunluk-rapor.mjs`) kullanıcıya özetlenir.
