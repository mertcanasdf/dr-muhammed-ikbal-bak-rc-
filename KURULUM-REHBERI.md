# Site Taşıma ve Yeni Site Kurulum Rehberi (GÜNCEL)

**Sunucu:** 193.36.63.74 (Plesk) · **Alan adı:** muhammedikbalbakirci.com
**Güncelleme:** 2026-09-13 · En güncel hâli budur.

---

## 🔴 Hangi dosyalar kullanılacak

| Dosya | Durum |
|---|---|
| `eski-site-parcalar\` (7 zip) | ✅ **YÜKLENECEK OLAN** |
| `eski-site-arsiv-TAM.zip` (177 MB) | Aynı içerik tek parça. Sadece yükleyebilirsen. |
| `KULLANMA-eksik-eski-site-arsiv.zip.bak` | ❌ Yükleme. |
| `site-dist-2026-09-13.zip` | ✅ Yeni site (ana domain) |
| `ana-domain-nginx-yonlendirmeler.conf` | ✅ Adım D |

## ⚠️ FTP çalışmıyor

Port taraması: **21, 22, 990 kapalı. Sadece 443 açık.**
FileZilla ile bağlanma — tek yol **Plesk Dosya Yöneticisi**.

---

## Arşiv doğrulaması (son durum)

7 parça fiilen tek klasöre açılarak test edildi:

```
dosya        : 842 / 842      0 baytlık: 0
gerçek sayfa : 100
görsel       : 384 referans → eksik 30, hepsi bilinen urunler/, BEKLENMEYEN 0
renk.css     : var
```

100 sayfa = sitemap'teki 92 + `anasayfa` + sonradan eklenen 7
(`hizmetler`, `projeler`, `ekip/taha-bilgin`, `foto-galeri/1`, `foto-galeri/2`,
`haberler/1`, `haberler/2` — bunlar sitemap'te yoktu, menüden link veriliyordu).

---

## Adım A — Statik arşivi `eski.` altına yükle

### ⚠️ Daha önce eski parçaları yüklediysen

**Belge kökünü tekrar boşaltma.** Yeni parçalarda hiçbir dosya silinmiyor; sadece
8 sayfa + `renk.css` ekleniyor ve 100 sayfanın HTML'i güncelleniyor.
Yeni parçaları **mevcut yüklemenin üzerine aç**, yeter.

### A.1 — İlk kez yüklüyorsan: belge kökünü boşalt

Plesk → `eski.muhammedikbalbakirci.com` → **Dosyalar**. Şunlar gitmeli:

- `_class/` · `language/` · `tema/` · `uploads/` · `yonetim/`
- `index.php` · `dildegis.php` · `sitemap.php` · `index.html`
- **`.htaccess`** ← 🔴 **en kritik.** Her isteği `index.php`'ye çevirir;
  kalırsa `index.php` olmadığı için **tüm adresler 404 verir.**
- `cgi-bin/` kalabilir (Plesk sistem klasörü)

### A.2 — 7 parçayı yükle

`eski-site-parcalar\` içindekileri **tek tek** yükle, her birini **Arşivden çıkar**:

| Parça | Boyut | Dosya |
|---|---|---|
| `eski-site-parca-01.zip` | 27.4 MB | 11 |
| `eski-site-parca-02.zip` | 25.5 MB | 17 |
| `eski-site-parca-03.zip` | 29.8 MB | 29 |
| `eski-site-parca-04.zip` | 28.9 MB | 44 |
| `eski-site-parca-05.zip` | 27.4 MB | 67 |
| `eski-site-parca-06.zip` | 27.1 MB | 205 |
| `eski-site-parca-07.zip` | 11.4 MB | 469 |

- Sıra önemsiz, hepsi **aynı belge köküne** açılacak
- Parçalar çakışmıyor — hiçbir dosya iki parçada değil
- Biri yarıda kalırsa **sadece onu** tekrar yükle
- Çıkarma bitince zip'leri sil

### A.3 — PHP'yi kapat

`eski.` → **PHP** → **Devre dışı bırak**.

### A.4 — Test

- [ ] `https://eski.muhammedikbalbakirci.com` açılıyor, lisans ekranı yok
- [ ] `/anasayfa` açılıyor (önceden 404 veriyordu)
- [ ] `/hizmetler` ve `/projeler` açılıyor
- [ ] Fotoğraflar görünüyor
- [ ] Renkler doğru (altın sarısı `#c69034` vurgular) — `renk.css` çalışıyor demek
- [ ] `/robots.txt` → `Disallow: /`

---

## Adım A0 — crawler tuzağını kes (ana domain hâlâ eski CMS ise)

Plesk → **ana domain** → **Apache ve nginx Ayarları** → *Ek nginx yönergeleri*:

```nginx
if ($args ~* "order=.*(%3F|\?)") { return 410; }

location = /robots.txt {
    default_type text/plain;
    return 200 "User-agent: *\nDisallow: /urun-kategori/\nDisallow: /urun/\nCrawl-delay: 10\n";
}
```

SemrushBot sonsuz iç içe `?order=` URL'lerine dalıp Apache'yi çökertiyordu (502/504).
Kural nginx'te olduğu için istek Apache'ye, PHP'ye ve veritabanına **hiç ulaşmaz**.
Adım B'den sonra gereksiz kalır ama zararı olmaz.

---

## Adım B — Yeni siteyi ana alan adına kur

> 502 arızasını **kalıcı bitiren** adım: ana domainde PHP ve veritabanı kalmaz.

1. `httpdocs` → içindeki **her şeyi sil** (`.htaccess` dahil)
2. `site-dist-2026-09-13.zip` (9.4 MB) → yükle → çıkar → zip'i sil
3. Ana domain → **PHP** → **Devre dışı bırak**

`httpdocs` içinde doğrudan `index.html`, `_astro/`, `assets/`, `blog/` … olmalı.

---

## Adım C — www'lu adresi ana adres yap

**Barındırma ve DNS** → **Barındırma Ayarları**
- *Tercih edilen alan adı*: **www.muhammedikbalbakirci.com**
- *SEO dostu HTTP 301 yönlendirmesi*: açık

SSL'in hem `muhammedikbalbakirci.com` hem `www.` kapsadığını doğrula.

---

## Adım D — 88 eski URL için 301

**Apache ve nginx Ayarları** → `ana-domain-nginx-yonlendirmeler.conf` içeriğini
A0'daki kuralların altına ekle.

---

## Adım E — Google Search Console

1. Yeni `index.html` → `<head>` içine:
   ```html
   <meta name="google-site-verification" content="77AqeY3dAjxcbc8sDqaDE7lhn0D2e9Babqrzn6I6Bsk" />
   ```
   Kalıcı çözüm: Astro layout dosyasına ekle.
2. `https://www.muhammedikbalbakirci.com` için property aç
3. Sitemap: `https://www.muhammedikbalbakirci.com/sitemap.xml`
4. `eski.` için property açma (noindex)

---

## Adım F — Analytics

Eski `UA-54503473-1` Universal Analytics'ti, Temmuz 2023'te kapandı.
**Yeni sitede hiç analytics yok** — GA4 kurulmadan geçilirse etkisi ölçülemez.

---

## Adım G — Son doğrulama

- [ ] `https://www.muhammedikbalbakirci.com` → yeni site
- [ ] `https://muhammedikbalbakirci.com` → www'luya 301
- [ ] `/blog`, `/iletisim` açılıyor
- [ ] `https://eski.muhammedikbalbakirci.com` → arşiv, fotoğraflarıyla
- [ ] `/haberler` → `eski.`ye 301
- [ ] Mobil görünüm

---

## Arşivde bilerek olmayanlar

- **30 ürün görseli** — veritabanı hiç var olmamış dosya adlarına referans veriyor
  (yedekte adlar ~44 karakterde kesilmiş). **Canlı sitede de kırıktılar.**
- **Tüm `.php` dosyaları** (37 adet) — statik arşivde sunucu kodu olmamalı.
- **`_class/site_islem.php`** — formların/aramanın ucu, ionCube şifreli.
  Sonuç: **iletişim formu, arama ve bülten aboneliği çalışmayacak.**
  Sayfalar sunucuda render edilmiş halde arşivlendi, **içerik kaybı yok.**
- Bazı CSS'ler `.html` uzantılı görsel çağırıyor — **orijinalinde de böyleydi.**
- `renk.php` (dinamik renk teması) → `renk.css` olarak statikleştirildi,
  veritabanındaki renkler gömüldü (`#c69034`, `#332f30`, `#f2f3fa`).

---

## 🔴 Güvenlik bulgusu

```
uploads/files/p_1789189304.php
```

Yükleme klasörünün içinde bir PHP dosyası — tipik **webshell** deseni.
Arşivden çıkardım, **sunucuda duruyor**. ImunifyAV "temiz" diyor ama bu tarayıcılar
böyle dosyaları sık kaçırır. İçeriğine bak, tanımadığın kod varsa hosting'e bildir.

---

## Lisans kazası — tekrarlamasın

`eski.` ile ana site aynı veritabanını kullanıyordu; `eski.`de lisans denemesi
`lisans` tablosunun üzerine yazdı ve **ana site kilitlendi**.

Doğru kod:
```sql
UPDATE `lisans` SET `kod` = '2b218a22816bce0f76b1e7425389583a';
```

---

## Geri dönüş planı

Plesk → **Yedekle ve Geri Yükle** → 13 Eylül 2026 yedeği (436 MB, `status_OK`).
