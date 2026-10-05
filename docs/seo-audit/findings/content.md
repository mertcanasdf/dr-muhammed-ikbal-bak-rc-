# Content Quality - Dr. Muhammed İkbal Bakırcı (staging: dr-bakirci-revizyon.surge.sh)

Tarih: 2026-10-05. Skorlar sezgiseldir (claude-seo iç modeli), Google verisi değildir. Ölçümler kaynak kodundan (src/content/blog/*.md, [slug].astro, seo.ts, hakkinda.astro) ve canlı staging HTML'inden alındı.

## Skor: 52/100
| Faktör | Skor |
|---|---|
| Experience | 6/20 |
| Expertise | 14/25 |
| Authoritativeness | 11/25 |
| Trustworthiness | 21/30 |
| AI citation readiness | 58/100 |

## Ölçümler
- 55 makale; ana metin (Kaynaklar ve takeaways hariç) medyan ~268, min 200 (retinoid-nedir), max 578 (mavi-bolge-diyeti) kelime. 55/55 blog minimumu olan 1.500'ün altında, 42/55 400'ün altında.
- Ortalama cümle ~14 kelime, makale başına ortalama ~4 H2; okunabilirlik iyi, sorun derinlik.
- Gövdede içerik içi dahili link: 0 (yalnızca yan çubuktaki "İlgili Makaleler").
- Tarih: 30 makale 2026-09, 15 makale 2026-06. dateModified her yerde datePublished ile aynı.
- Title + " — Dr. Muhammed İkbal Bakırcı" soneki: 55/55 title 60 karakteri aşıyor, 51/55 70'i aşıyor (maks 121).
- Meta description: 104-247 karakter; çoğu 120-170 (uygun), sirt6 yazısı 247.
- 55/55 makalede Kaynaklar bölümü var (172 dış bağlantı, çoğu PubMed).

## Bulgular

### C1 - YÜKSEK: Yazar kutusunda doğrulanmamış iddia (BM UNF Türkiye Temsilciliği)
- Kanıt: src/pages/blog/[slug].astro (author-bio, 55 makalede tekrarlanıyor): "Birleşmiş Milletler UNF Türkiye Temsilciliği yapmıştır". docs/arastirma/2026-10-05-mesleki-ozgecmis.md bunu "Hiçbir kaynakta bulunamadı" olarak işaretliyor. Aynı dosya "akademisyen" ifadesinin de teyit edilmeden kullanılmamasını söylüyor (doktora tamamlanma durumu belirsiz); oysa seo.ts Person.jobTitle = "Hekim, sağlık yöneticisi ve akademisyen" ve ana sayfa meta description'ı "akademisyen" diyor.
- Etki: YMYL'de kanıtsız kimlik iddiası güven sinyalini düşürür.
- Düzeltme: Dr. Bakırcı'dan belge gelene kadar UNF cümlesini author-bio'dan, "akademisyen" kelimesini seo.ts jobTitle ve ana sayfa description'ından kaldır. "Hekim ve Başhekim" kullan.
- Kontrol: grep -rn "UNF\|akademisyen" src boş döner.

### C2 - YÜKSEK: Makaleler blog minimumunun çok altında, çoğu yüzeysel (thin)
- Kanıt: ana metin medyan ~268 kelime, 42/55 yazı <400. En ince: retinoid-nedir (200), denge-egzersizleri-yaslanma (206), gunes-kremi-nasil-secilir (207). Her yazı ~4 H2 ve kısa paragraflar; "Kaynaklar" eklense de gövde derinliği aynı.
- Not: kelime sayısı sıralama faktörü değil; sorun, YMYL sorgularında (ör. "retinoid nasıl kullanılır", "güneş kremi SPF kaç olmalı") rakiplerin derin rehberlerine karşı kapsama eksikliği.
- Düzeltme: Önce 10-12 yazıyı (retinoid-nedir, gunes-kremi-nasil-secilir, d3-vitamini-eksikligi, insulin-direnci-belirtileri, magnezyum-eksikligi, botoks, dermal-dolgu, uyku-kalitesi-nasil-artirilir, kreatin-ve-yaslanma, protein-ihtiyaci-yaslanma) 900-1.500 kelimeye çıkar: "ne zaman doktora gidilir", doz/süre aralıkları (kaynaklı), sık sorulan sorular, yanlış inanışlar, hekimin kendi klinik gözlemi. Dolgu amaçlı şişirme yapma; çok dar konuları birleştirmeyi değerlendir (bkz. C5).
- Kontrol: hedef yazılarda ana metin >=900 kelime; Search Console'da bu URL'lerde gösterim/tıklama 8-12 hafta içinde izlenir.

### C3 - YÜKSEK: Tıbbi gözden geçirme ve yazar tutarlılığı sinyalleri zayıf
- Kanıt: byline düz metin "Dr. Muhammed İkbal Bakırcı" (yazar sayfasına link yok); "tıbbi olarak gözden geçirildi" ifadesi yok; Article şemasında dateModified = datePublished, author yalnızca @id referansı; MedicalWebPage/reviewedBy yok (canlı HTML'de reviewedBy bulunmadı). Uzmanlık dalı hakkinda ve yazar kutusunda açık değil; "2008'den bu yana acil tıp" ifadesi var, ama uzmanlık belgesi/sicil bilgisi yok.
- Düzeltme: (a) byline'ı /hakkinda bağlantısıyla yap; (b) yazıya görünür "Son güncelleme" ve "Kaynaklar gözden geçirildi" satırı ekle; (c) frontmatter'a gerçek `updated` alanı ekleyip dateModified'ı ondan üret (sahte güncelleme yapma); (d) hekimin uzmanlık dalı ve Sağlık Bakanlığı sertifika bilgisini hakkinda'da doğrulanmış şekilde belirt; (e) Person şemasına sameAs (özgeçmiş dosyasındaki doğrulanmış Instagram/YouTube/LinkedIn), worksFor (VM Medical Park Bursa) ve alumniOf ekle. Başka bir hekim gözden geçiriyorsa onu reviewedBy yap; yoksa "gözden geçirildi" iddiası kurma.
- Kontrol: makale HTML'inde görünür güncelleme tarihi ve yazar linki; schema validator'da Person.sameAs dolu.

### C4 - YÜKSEK: Tıbbi uyarı yalnızca footer'da; makale içi uyarı tutarsız
- Kanıt: Footer.astro tek satır genel uyarı. Gövdede "hekim/doktor" yönlendirmesi 55 yazının yalnızca ~11-18'inde geçiyor (grep). Mutlak ifade: muzik-ve-stres-kortizol.md "yan etkisi olmayan bir araç" (kaynakların temkinli dilini bozuyor).
- Düzeltme: [slug].astro şablonuna kategoriye göre kısa kutu ekle ("Genel bilgilendirmedir; ilaç/takviye kullanıyorsanız, gebe iseniz veya kronik hastalığınız varsa hekiminize danışın"); takviye ve medikal estetik yazılarında risk/kontrendikasyon paragrafı zorunlu olsun. Müzik yazısındaki cümleyi "genellikle düşük riskli" olarak yumuşat.
- Kontrol: 55/55 makale HTML'inde uyarı kutusu; grep "yan etkisi olmayan" boş.

### C5 - ORTA: Kannibalizasyon / örtüşen konu çiftleri
- prp-eksozom (568 kelime) vs prp-mi-eksozom-mu (375 kelime): aynı konu, aynı kategori, neredeyse aynı description ("PRP ve eksozom uygulamaları ...") ve aynı H2 mantığı (PRP nedir / Eksozom nedir). Aynı sorguyu hedefliyorlar. Ayrıca prp-mi-eksozom-mu readTime "8 dk", gerçek içerik ~375 kelime (tutarsız).
- dermal-dolgu (572) vs dermal-dolgu-guvenligi (363): ikincisi "Dermal dolgu nedir?" H2'siyle tanımı tekrar ediyor.
- botoks (505) vs botoks-sonrasi-dikkat-edilmesi-gerekenler (378): niyet farklı (bilgi vs bakım), kabul edilebilir; karşılıklı link gerekli.
- Diğer riskli kümeler: tukenmislik-sendromu / dijital-tukenmislik; aralikli-oruc-longevity / otofaji-nedir; altin-igne / mezoterapi / cilt-genclesmesi-kombinasyon-tedavileri; uyku için 4 yazı (sirkadiyen-ritim, ekran-kullanimi, uyku-kalitesi, uyku-bozukluklari-ve-glymphatic) ve bir hub yok. d3-vitamini-eksikligi / d3-k2 niyet farkı nedeniyle tamam.
- Düzeltme: prp-mi-eksozom-mu içeriğini (soru listesi) prp-eksozom'a birleştir ve eski URL'yi 301'le yönlendir; birleştirmeyeceksen prp-mi-eksozom-mu'yu "karar soruları" niyetine keskinleştir, başlık/description'ı farklılaştır ve readTime'ı düzelt. dermal-dolgu-guvenligi'nden tanım bölümünü çıkarıp dermal-dolgu'ya link ver. Uyku ve estetik için hub (rehberler) sayfaları kur.
- Kontrol: aynı sorguda tek URL; yinelenen H2 kalmaz; Search Console'da çiftlerin aynı sorguda birlikte görünmesi azalır.

### C6 - ORTA: Gövde içi dahili link yok
- Kanıt: gövdede "](/blog" eşleşmesi 0; yalnızca yan çubukta 2 öğelik "İlgili Makaleler". Makaleden hizmet/randevu sayfasına bağlam linki ya da CTA yok.
- Düzeltme: Her yazıya 2-4 bağlamsal dahili link (ör. botoks -> botoks-sonrasi, dermal-dolgu -> dermal-dolgu-guvenligi, prp -> altin-igne) ve /medikal-estetik veya /hakkinda linki ekle; anchor betimleyici olsun.
- Kontrol: her yazıda >=2 gövde içi link; yetim sayfa yok.

### C7 - ORTA: Title/description kalitesi ve şablon
- Kanıt: [slug].astro `title` = başlık + " — Dr. Muhammed İkbal Bakırcı"; frontmatter başlıkları zaten uzun. 55/55 title >60 karakter, 51/55 >70, en uzun 121 (uyku-bozukluklari-ve-glymphatic-temizlik, 93+30). SERP'te kesilir. Olumlu: description başlığı tekrar etmiyor ve ortak CTA cümlesi yok (metadata_template.py çalıştırılmadı, elle kontrol).
- Kısa description: muzik-ve-stres-kortizol (104), aralikli-oruc-longevity (117), nmn-nad-yaslanma (123). Uzun: sirt6-proteini-epigenetik-genclesme (247).
- Düzeltme: frontmatter'a `seoTitle` alanı ekle (ör. "Botoks Nedir? Etki, Masseter ve Yan Etkiler"); makalede marka sonekini kaldır veya yalnızca başlık <=30 karakterse ekle. Hedef: title 50-60, description 130-155; sirt6 description'ını kısalt.
- Kontrol: curl ile alınan tüm <title> <=60 karakter.

### C8 - ORTA: Experience sinyali yok
- Kanıt: tüm yazılar literatür özeti tarzında; "klinikte gördüğüm" gibi birinci tekil deneyim, anonim vaka yok; görseller AI üretimi/stok (git geçmişi: Codex ve Unsplash), gerçek klinik fotoğrafı yok. Başhekim ve estetik uygulayıcısı için bu en büyük fark yaratma fırsatı.
- Düzeltme: Özellikle estetik ve longevity yazılarına 1-2 paragraf "Klinik pratikte sık sorulanlar" (hekimden alınmış gerçek gözlem; hasta izni olmadan vaka/öncesi-sonrası kullanma, Sağlık Bakanlığı reklam kısıtlarına uy). Görsellere "Temsili görsel" notu ekle.
- Kontrol: hedef yazılarda hekim imzalı deneyim bölümü.

### C9 - ORTA: Tekrarlayan yapı / düşük kaliteli AI şablonu riski
- Kanıt: kısa yazılar (retinoid-nedir, gunes-kremi-nasil-secilir, dermal-dolgu-guvenligi, botoks-sonrasi, prp-mi-eksozom-mu) aynı iskeleti izliyor ("X nedir? / hangi sorular sorulmalı? / riskler / Kaynaklar" + 3-4 takeaway). Kaynak kullanımı ve temkinli dil iyi (muzik yazısında Cochrane/meta-analiz, kortizol bulgusunda çelişkiyi dürüstçe belirtme), ama yapı homojen.
- Düzeltme: Yazı tipine göre yapıyı çeşitlendir (karar rehberi, mit-gerçek, "kimler kullanmamalı" tablosu), somut sayı/aralık ve hekim yorumu ekle.
- Kontrol: yazılar arası H2 setleri çeşitlenir; manuel okuma.

### C10 - DÜŞÜK: AI atıf hazırlığı
- İyi: "Kilit Çıkarımlar", soru formlu H2'ler, PubMed/Cochrane kaynakları, tarihli makale, Article + Person + BreadcrumbList şeması.
- Eksik: başta 40-60 kelimelik doğrudan cevap yok; sayısal olgu az; tablo nadir; takeaways sayfa sonunda. FAQPage şeması gerekmez (Google FAQ rich result vermiyor).
- Düzeltme: takeaways kutusunu girişe taşı ("Kısaca"), her H2 altında ilk cümle cevap olsun, uygun yerlere karşılaştırma tablosu ekle.
- Kontrol: markalı sorgularda AI Overview/Perplexity atıfı manuel izlenir.

### C11 - DÜŞÜK: Tazelik
- 30 yazı Eylül 2026, 15 yazı Haziran 2026 tarihli; hepsi 12 ay içinde. dateModified görünür değil ve datePublished ile aynı; tek ayda 30 yazı toplu üretim izlenimi verebilir.
- Düzeltme: gerçek güncellemelerde `updated` göster; gerçek yayın tarihlerini koru.

### C12 - BİLGİ (diğer ajanlara): Staging'de /blog/botoks 301 ile /blog/botoks/ adresine yönleniyor, canonical ise eğik çizgisiz (https://www.muhammedikbalbakirci.com/blog/botoks). Teknik ajanı doğrulamalı; üretimde aynı olursa canonical yönlenen URL'ye işaret eder.

## İyi çalışanlar
- Her yazıda Kaynaklar bölümü (172 dış bağlantı, PubMed/Cochrane ağırlıklı); ifadeler temkinli ("kanıt sınırlı", "ilişki, neden-sonuç değildir"); eksozom için FDA uyarısı, dolgu için güvenlik soruları var.
- Hekim adı, tarih, okuma süresi, kategori görünür; yazar kutusunda Başhekim unvanı; /hakkinda'da ayrıntılı eğitim ve kariyer (Atatürk Üniv. Tıp 2008, VM Medical Park Başhekimi 2022-).
- "Garantili sonuç" tarzı pazarlama dili yok.
- Okunabilirlik: ortalama cümle ~14 kelime, net başlıklar.
- Description'lar başlığı tekrar etmiyor, ortak CTA kalıbı yok; Türkçe arama niyetine ("nedir", "belirtileri", "nasıl") uygun.

## Öncelik sırası
1. C1 (hemen). 2. C3 + C4 şablon işi. 3. C7 seoTitle. 4. C5 birleştirme. 5. C2/C8 içerik derinleştirme (hekim katkısıyla). 6. C6, C10, C11.
