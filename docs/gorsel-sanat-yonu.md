# Görsel sanat yönü

Sitedeki tüm yapay zekâ görselleri bu kurallarla üretilir (`scripts/gorsel-uret.mjs` her isteğe aşağıdaki **STYLE** bloğunu ekler).

**Gerçek fotoğraflara dokunulmaz:** `assets/images/dr-muhammed-ikbal-bakirci.jpg` ve `assets/images/generated/doctor-portrait.webp` Dr. Bakırcı'nın gerçek portreleridir; yapay zekâyla yeniden üretilmez, benzeri de üretilmez.

## Neden bu kurallar

- **Güven:** Hekim sitesi; görseller abartılı vaat ya da "mucize" havası taşımamalı.
- **Sağlık tanıtım mevzuatı:** Önce/sonra, gerçek hasta görüntüsü, sonuç gösterimi yok.
- **Konuyla doğrudan ilişki (2026-10-06):** Türk sağlık sitelerinin (Acıbadem, Memorial, Medipol, TOBB ETÜ, Ufuk Üniversitesi vb.) konu görselleri incelendi. Okur görseli konuyla ilk bakışta eşleştirmeli: botoks/dolgu için kurgusal model yüzü ve eldivenli el, ruh sağlığı için duyguyu taşıyan kişi, hücre konuları için 3D bilimsel illüstrasyon. Soyut metafor kapaklar (orkide, seramik form vb.) konuyla ilgisiz bulundu.
- **Tutarlılık:** 80+ görsel tek bir yayının parçası gibi görünmeli.
- **Erişilebilirlik ve okunurluk:** Görselde yazı yok; metin her zaman HTML'de.

## STYLE (istemlere eklenen blok)

```
Editorial health-magazine photograph (for cellular or molecular subjects: a photorealistic 3D medical
illustration in the same palette), calm and trustworthy, natural soft daylight,
shallow depth of field, warm neutral palette (off-white #F5F5F0, warm sand, soft stone grey,
deep charcoal #0E0E0E accents, a single muted blue #5778C5 accent at most), subtle film grain,
uncluttered composition with negative space, realistic materials and textures.
Landscape 3:2 framing.

Strict rules:
- No text, letters, numbers, labels, logos or watermarks anywhere in the image.
- People must be fictional adult models. Never a real, famous or recognisable person and never
  a likeness of Dr. Bakırcı. Natural, unretouched look; no glamour retouching.
- No before/after comparisons, no visible treatment results, no blood, no wounds, no needle
  piercing the skin. For injection topics a gloved hand may hold a syringe near the face.
- No pills spilling, no "miracle" glow effects, no neon sci-fi look, no stock-photo cliches.
- Anatomically correct hands; no extra fingers.
```

## Kategoriye göre öznel ton

| Kategori | Ton |
|---|---|
| Longevity Bilimi | Laboratuvar natürmortu, mikroskop slaytı, cam ve ışık; soğuk değil, sakin |
| Beslenme | Doğal ışıkta gerçek yiyecekler, ahşap/taş yüzey, mevsimsel |
| Hareket | Açık hava, yürüyüş yolu, ağırlık, ayakkabı; dinamik ama sakin |
| Uyku | Akşam ışığı, yatak örtüsü, karanlıkta loş lamba |
| Zihin & Sosyal Yaşam | Konunun duygusunu taşıyan kurgusal kişi (yorgunluk, kaygı), doğa, birlikte geçirilen zaman |
| Skin Longevity | Kurgusal model yüzü ve cilt dokusu yakın plan, eldivenli hekim eli, temiz klinik ortam; sonuç gösterimi yok |
