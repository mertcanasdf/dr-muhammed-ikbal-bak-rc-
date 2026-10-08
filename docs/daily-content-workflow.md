# Günlük makale ve analiz akışı

**Saat:** Her gün 10.00, Türkiye saati. **Hedef:** `mertcanasdf/mib-site` reposunun `main` dalı. **Canlıya alma:** Kullanıcı her gün Plesk'ten çeker.

## Günlük iş

0. **Önce** `node scripts/seo/gunluk-gorev.mjs` çalıştırılır ve çıktıdaki tek görev yapılır (kurallar: `docs/seo-otomasyon.md`). Aşağıdaki adımlar görev `yeni-yazi` olduğunda uygulanır; diğer görevlerde de 7–10. adımlar (kapılar, yayın, canlı kontrol, bildirim) aynıdır.
1. `data/content-plan.json` ve `data/content-automation-state.json` okunur. Aynı gün ikinci içerik gönderilmez.
2. Sıradaki aday soru canlı aramada araştırılır. Sorgu, görülen URL'ler, tarih, niyet ve mevcut siteyle çakışma kaydedilir. Hacim, CPC veya Google konumuna erişim yoksa boş bırakılır.
3. Aynı soru mevcut bir yazıda karşılanıyorsa o yazı esaslı biçimde geliştirilir. Ayrı kullanıcı işi varsa yeni URL açılır. Yeni Bursa/ilçe kopyaları üretilmez.
4. Sağlık bilgisinin dayanağı gerçekten açılıp okunan kurum rehberi, kılavuz veya araştırmadır. Araştırma türü ve insan/hayvan ayrımı korunur. Kişisel tedavi, reçete, doz planı, sahte klinik deneyim veya hekim inceleme onayı yazılmaz.
5. Başlık, açıklama, ilk yanıt, anlaşılır alt başlıklar, kısa özet, ilgili bağlantılar ve kaynakça hazırlanır. Mevcut makale değişmeden güncelleme tarihi ilerletilmez.
6. Bir konu rehberi ve en az iki ilgili yazı bağlanır. Yeni sosyal ilişki yazısının doğru merkezde listelenmesi için alan eşlemesi güncellenir. Her yeni yazının **kendi kapağı** üretilir; başka yazının görseli kullanılmaz (`verify-dist` "her yazı kendi kapağını kullanıyor" kontrolü bunu engeller). Adımlar: `scripts/gorsel-konulari.mjs` içindeki `ARTICLES` nesnesine konuyu ilk bakışta anlatan bir istem eklenir (sanat yönü: `docs/gorsel-sanat-yonu.md`), ardından `node scripts/gorsel-konulari.mjs`, `node scripts/gorsel-uret.mjs --ids <slug>`, taslak gözle kontrol edilir, `node scripts/gorsel-uret.mjs --uygula <slug>` ve `node scripts/kucuk-gorseller.mjs` çalıştırılır; yazının `image` alanı `/assets/images/generated/articles/<slug>.webp` olur.
7. `sync-related`, bağlantı kontrolü, Astro build ve kalıcı SEO kontrolleri geçer. Hata varsa GitHub'a gönderilmez.
8. Yayın scripti yalnız build çıktısını yayın reposuna yeni normal commit olarak gönderir. Kaynak projedeki diğer değişiklikler sıfırlanmaz. Uzak main değişmişse üzerine yazılmaz.
9. Kullanıcı Plesk'ten çeker. Canlı yeni içerik görünene kadar durum **GitHub hazır / Plesk çekme bekliyor** olarak kalır. Bu bekleme kullanıcı tarafından kabul edilen normal akıştır.
10. Sonraki çalışmada önceki içeriğin canlı durumu okunur. Canlı olduğu doğrulanan adresler IndexNow'a bildirilebilir. Search Console işlemlerinin yerini tutmaz.

## Kullanıcıya sonuç

Her anlamlı tamamlanmada konu, hedef sorgu, yeni/güncelleme kararı, kaynaklar, kontrol sonucu, GitHub commit ve canlı durum kısaca bildirilir. Plesk bekleme durumu değişmedikçe tekrarlayan uyarı verilmez. Kaynak veya doğrulama hatası yayınlamayı engellerse neden açıkça bildirilir.

Her yedinci içerikte son yayınların özeti ve sorgu/sayfa planı değerlendirilir. Search Console erişimi yoksa gösterim, tıklama ve gerçek sıra artışı uydurulmaz. Veri geldiğinde sorgu→sayfa, gösterim, tıklama ve CTR karşılaştırması kullanılır.

## Çalıştırma

Kaynak proje: `C:\Users\mertc\OneDrive\Desktop\muhammed hocam\dr.muhammed ikbal bakırcı`.

```powershell
node scripts/publish-content.mjs --article <slug> --publish-repo "C:\Users\mertc\Documents\Codex\2026-10-06\c-users-mertc-onedrive-desktop-muhammed\work\publish-repo" --dry-run
```

Kontrollerden sonra gerçek gönderim `--publish` ile yapılır. Varsayılan kontrol modudur. Yapılandırılmış otomasyon bu işlemi yapacaktır.

Codex yerel otomasyonu bilgisayar/Codex çalışma ortamına bağlıdır. Kapalı veya uyuyan cihazda kesintisiz sunucu görevi çalıştığı iddia edilmez. Takvim, üretilmiş 30 hazır makale değildir; her gün kaynak ve niyet kontrolünden geçen üretim planıdır.


## Hazır taslakların kullanımı

`data/content-plan.json` içindeki `draftPath` varsa o taslak başlangıç olarak kullanılır. Kaynaklar ve arama niyeti o gün yeniden kontrol edilir; aynı soruya ikinci yazı üretilmez. Yayınlanmamış taslakların tarihi ilk gerçek üretim gününe ayarlanır. Yayın kaydı olan yazının ilk tarihi korunur. Günlük görev en fazla bir içerik gönderir; önceki toplu üretim isteği günlük çalışmada batch sınırını aşmak için kullanılmaz.
