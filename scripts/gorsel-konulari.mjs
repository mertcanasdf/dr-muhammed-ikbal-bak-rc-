// scripts/gorsel-listesi.json'u üretir: 55 makale kapağı + sayfalarda kullanılan 33 görsel.
// Kullanım: node scripts/gorsel-konulari.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Makale kapakları -> assets/images/generated/articles/<slug>.webp
const ARTICLES = {
  // Longevity Bilimi
  'biyolojik-yas-nasil-olculur': 'An antique brass hourglass beside a modern lab sample tube rack on a pale stone bench, morning light; the idea of chronological versus biological time.',
  'mitokondri-sagligi-nasil-desteklenir': 'Macro view of a glass flask with softly glowing amber liquid and tiny bubbles on a lab bench, warm daylight, evoking cellular energy.',
  'otofaji-nedir': 'A calm still life of an empty ceramic plate, a glass of water and a small clock on a linen tablecloth by a window, suggesting a fasting window and renewal.',
  'nmn-nad-yaslanma': 'A clean laboratory still life: a few unlabeled amber glass vials and a pipette resting on a white stone surface, soft cool-warm daylight, scientific and calm.',
  'sirt6-proteini-epigenetik-genclesme': 'Neatly coiled natural linen thread wound around wooden spools on a desk next to an open lab notebook (no writing visible), metaphor for DNA packaging, soft light.',
  // Beslenme
  'aralikli-oruc-longevity': 'A breakfast table at mid-morning: a bowl of yogurt with berries, nuts and a cup of herbal tea in warm sunlight, an analog wall clock softly out of focus.',
  'insulin-direnci-belirtileri': 'A balanced plate with grilled fish, a large portion of green vegetables and legumes on a wooden table, with a short walk path visible through the window.',
  'lifli-beslenme-ve-mikrobiyota': 'Overhead rustic arrangement of fiber-rich foods: oats, lentils, chickpeas, artichoke, apples and fermented vegetables in glass jars on natural wood.',
  'omega-3-ne-ise-yarar': 'Fresh sardines and a salmon fillet on parchment with lemon, walnuts and flaxseed in small bowls on a stone countertop, natural light.',
  'polifenoller-ve-saglik': 'Deep-colored berries, pomegranate seeds, dark grapes, green tea leaves and a small piece of dark chocolate arranged on a slate board.',
  'protein-ihtiyaci-yaslanma': 'A wholesome lunch bowl with eggs, chickpeas, lentils, cottage cheese and greens on a linen napkin, warm daylight, everyday and realistic.',
  'd3-k2-birlikte-kullanilir-mi': 'Sunlit kitchen counter with egg yolks, natto-style fermented soybeans, hard cheese and leafy greens, soft morning sun streaks.',
  'd3-vitamini-eksikligi': 'A person seen from behind sitting on a park bench in gentle late-morning sunlight with arms uncovered, trees and open sky; face not visible.',
  'magnezyum-eksikligi': 'Magnesium-rich foods: pumpkin seeds, almonds, spinach, black beans and a small square of dark chocolate in ceramic bowls on light wood.',
  // Hareket
  'bolge-2-kardiyo': 'A cyclist seen from behind riding at an easy steady pace on a quiet country road at golden hour, relaxed posture, no face visible.',
  'denge-egzersizleri-yaslanma': 'An older person seen from the side, from the shoulders down, standing on one leg on a yoga mat in a bright room, holding the back of a chair for support.',
  'direnc-antrenmani-yaslanma': 'A pair of hands gripping a kettlebell handle on a wooden gym floor, natural window light, calm and strong, no face.',
  'egzersiz-sonrasi-toparlanma': 'After-workout still life: rolled towel, foam roller, water bottle and a bowl of fruit on a bench beside running shoes, soft daylight.',
  'gunluk-yuruyus-sagligi': 'A tree-lined walking path in a park in early morning light, two people walking side by side seen from behind, far in the distance.',
  'hareketsizlik-ve-metabolik-saglik': 'A home office with an empty chair pushed back from a desk and a pair of sneakers on the floor next to it, sunlight through the window inviting movement.',
  'vo2max-ve-longevity': 'A runner seen from behind climbing a gentle hill trail at sunrise, mist in the valley, sense of endurance and breath.',
  'kas-kutlesi-ve-yaslanma': 'Close-up of a forearm and hands of a middle-aged person lifting a pair of light dumbbells, natural light, focus on steady effort; no face.',
  'kavrama-gucu-ve-saglik': 'Close-up of the hand of a mature adult firmly squeezing a metal hand-grip strengthener, forearm muscles and tendons visible, home gym corner in soft morning light, the hand and grip tool fill most of the frame, no face, no landscape.',
  'kreatin-ve-yaslanma': 'A plain unlabeled glass jar of white powder with a wooden scoop next to a glass of water on a gym bench, minimal and neutral.',
  // Uyku
  'ekran-kullanimi-ve-uyku': 'A dim bedroom at night: a smartphone face-down in a small wooden tray on a dresser across the room, a book and reading lamp beside the bed.',
  'sirkadiyen-ritim-ve-uyku': 'A bedroom window at dawn with sheer curtains glowing in first light, a made bed in soft shadow, a gradient from night blue to warm morning.',
  'uyku-bozukluklari-ve-glymphatic-temizlik': 'Abstract calm night scene: moonlight falling across rumpled white bedsheets and a pillow, deep blue tones, peaceful and slightly misty.',
  // Zihin & Sosyal Yaşam
  'dijital-tukenmislik': 'A laptop closed on a desk with a cup of tea and a small plant, a person\'s hands resting on the lid, evening light; sense of switching off.',
  'tukenmislik-sendromu': 'A person seen from behind sitting on a wooden pier by a still lake at dusk, shoulders relaxed, taking a pause; face not visible.',
  'kitap-okuma-ve-beyin': 'An open book on a linen armchair with reading glasses and a cup of coffee, warm afternoon window light, quiet library mood (no legible text).',
  'muzik-ve-stres-kortizol': 'A vinyl record player with a record spinning, headphones resting beside it on a wooden sideboard, soft evening lamp light.',
  'sukran-pratigi-ve-dopamin': 'A small notebook closed with a pen on a breakfast table next to fresh flowers and morning tea, gentle sunlight, calm ritual (no writing visible).',
  'sanat-ve-beyin-sagligi': 'Hands mixing watercolor paints on a palette beside a half-finished abstract landscape painting, natural studio light, no face.',
  'yasam-amaci-ve-longevity': 'An older gardener\'s hands planting a young seedling in rich soil, morning light in a vegetable garden, sense of purpose; no face.',
  'anksiyete-ve-obsesyonun-fizyolojisi': 'A calm misty forest path in early morning with soft diffused light, a single bench along the path, quiet and grounding.',
  'sosyal-baglanti-ve-uzun-omur': 'A long outdoor dinner table under string lights with several people seen from behind and the side sharing food, faces not visible, warm evening.',
  'doga-ve-zihin-sagligi': 'Sunlight filtering through tall trees in a green forest, a wooden boardwalk leading into the woods, fresh and restorative.',
  // Skin Longevity
  'altin-igne': 'A clean aesthetic-clinic tray with a sleek medical device handpiece (no needles visible on skin), folded gauze and a small dish, soft professional light.',
  'botoks-sonrasi-dikkat-edilmesi-gerekenler': 'A calm aftercare still life: a cold compress, a glass of water, a soft headband and a gentle cleanser bottle (unlabeled) on a bathroom shelf in daylight.',
  'cilt-bariyeri-nasil-guclendirilir': 'Macro photograph of a rich white moisturizing cream swirl on a ceramic dish with a few drops of water, soft natural light, skincare texture.',
  'cilt-genclesmesi-kombinasyon-tedavileri': 'Two minimalist unlabeled skincare vials and a treatment handpiece on a marble counter of a bright aesthetic clinic, soft shadows.',
  'ciltte-kollajen-kaybi': 'Close-up of the back of a relaxed hand resting on linen in soft side light, showing natural skin texture, calm and respectful; no face.',
  'dermal-dolgu-guvenligi': 'A tidy clinical consultation desk with a sealed medical product box (unlabeled), gloves still in packaging and a closed folder, bright and safe atmosphere.',
  'gunes-kremi-nasil-secilir': 'A wide-brimmed straw hat, sunglasses and an unlabeled sunscreen bottle on a shaded terrace table, bright summer light and leaf shadows.',
  'mezoterapi': 'A row of small clear glass ampoules with pale liquid on a white tray in an aesthetic clinic, soft backlight, clean and minimal.',
  'prp-eksozom': 'A compact benchtop laboratory centrifuge with a transparent lid showing the metal rotor and tube slots, clearly a medical lab instrument, on a clean white clinic counter beside a rack of empty sterile tubes, soft professional light, no blood visible.',
  'prp-mi-eksozom-mu': 'Two glass beakers side by side on a pale stone bench, one with clear pale-gold liquid and one with clear water-like liquid, symbolic comparison, soft light.',
  'retinoid-nedir': 'A nighttime skincare still life: a small dropper bottle (unlabeled), a folded towel and a dim warm lamp on a bathroom vanity in the evening.',
  'senolitik-tedaviler-cilt-genclesmesi-zombi-hucreler': 'Fresh strawberries and sliced apples on a ceramic plate beside a microscope slide on a bright lab bench, linking food compounds and cell science.',
  // Deneme turunda üretilenler (listede kalır; --hepsi taslağı olanı atlar)
  'botoks': 'A serene, minimalist aesthetic-medicine consultation room corner: the edge of a pale treatment chair softly out of focus, a white orchid in a stone vase, folded linen towel on a side table, gentle window light. Calm and professional, no people.',
  'dermal-dolgu': 'Sculptural still life of smooth, softly curved ceramic forms on a warm stone plinth, their gentle volumes and contours evoking facial structure and proportion, soft directional daylight casting delicate shadows.',
  'telomerleri-korumak': 'Calm scientific still life: a glass microscope slide with faintly stained cell samples resting beside a brass-and-black microscope stage and clean lab glassware on a pale stone bench, warm soft daylight.',
  'uyku-kalitesi-nasil-artirilir': 'A tranquil bedroom at dusk: a neatly made bed with rumpled natural linen sheets, a dim warm bedside lamp, a closed book on the nightstand, a smartphone placed face-down on a shelf away from the bed, deep blue evening light at the window.',
  'mavi-bolge-diyeti': 'A rustic Mediterranean village table in natural daylight: bowls of beans and lentils, a small jug of olive oil, fresh leafy greens, sourdough bread, herbs and a few tomatoes on worn wood, simple and wholesome.',
  'kortizol-yaslanma': 'A person seen from behind, sitting by a large window with a cup of tea, looking out at a misty green garden in early morning; quiet, unhurried atmosphere. Face not visible.',
};

// Sayfalarda doğrudan kullanılan görseller -> aynı dosya adıyla yerinde yenilenir.
const PAGES = {
  'cellular-science': 'A modern bright research lab bench with a microscope, pipettes and glass sample plates, soft daylight, calm scientific atmosphere.',
  'exercise': 'An outdoor exercise scene: a person seen from behind doing a stretching exercise on a grassy hill at sunrise, wide open landscape.',
  'guide_cortisol_stress': 'A calm daily routine still life: a cup of herbal tea, a notebook (no writing), a small plant and soft morning light on a wooden desk.',
  'guide_intermittent_fasting': 'Fresh vegetables, a glass of water and a simple analog clock on a kitchen table in morning light, evoking meal timing.',
  'guide_keto_diet': 'Avocados, eggs, olive oil, leafy greens and nuts arranged on a light stone countertop, fresh and natural.',
  'health-app': 'A peaceful morning ritual: a glass of water with lemon, a small bowl of fruit and a folded towel on a sunny bathroom windowsill.',
  'nutrition-longevity': 'A colorful seasonal market basket with vegetables, herbs, legumes and fruit on a wooden table outdoors, warm daylight.',
  'online-course': 'An aesthetic clinic treatment tray with small clear glass ampoules and folded gauze on a white surface, soft professional light.',
  'quiz_anxiety': 'A person seen from behind sitting quietly on a window seat with a blanket, looking at a soft rainy garden, calm and gentle mood.',
  'quiz_body_type': 'A neutral still life of a measuring tape loosely coiled beside an apple and a glass of water on a linen cloth, soft daylight.',
  'quiz_gut_health': 'Fermented foods in glass jars (sauerkraut, kefir, pickles) beside whole grains and vegetables on a rustic kitchen counter.',
  'quiz_inflammation': 'Anti-inflammatory foods: turmeric root, ginger, berries, leafy greens and olive oil on a slate board in natural light.',
  'quiz_longevity_score': 'A calm checklist-style still life: a pair of walking shoes, a water bottle, a bowl of vegetables and a sleep mask arranged neatly on a wooden floor.',
  'quiz_mitochondria': 'A sunlit morning run path along the sea, a runner far in the distance seen from behind, fresh and energetic but calm.',
  'quiz_obsession': 'A tidy, orderly desk with neatly aligned pencils and a closed notebook, soft neutral light, quiet and reflective mood.',
  'quiz_pss_stress': 'A person seen from behind standing on a balcony at sunset taking a slow breath, city softly blurred in the distance.',
  'quiz_skin_aesthetic': 'A bright aesthetic-clinic consultation corner with a mirror reflecting only soft light and plants, a treatment chair edge, calm and professional.',
  'quiz_skin_health': 'Skincare still life: a smooth cream texture, water droplets on a glass surface and a green leaf, soft natural light.',
  'quiz_sleep': 'A cozy bedroom at night with a softly glowing bedside lamp, layered linen bedding and a book, deep calm blue tones.',
  'quiz_stress_cortisol': 'A cup of tea steaming on a windowsill with rain outside, a soft blanket draped nearby, grounding and calm.',
  'stress-sleep': 'An evening wind-down routine: dimmed lamp, a cup of chamomile tea, a book and a phone placed face-down far from the bed.',
  'success-story': 'A minimalist aesthetic clinic room with soft daylight, a treatment chair edge, white flowers and natural stone textures, calm and trustworthy.',
  'topics/aralikli-oruc': 'A simple bowl of fresh fruit and a glass of water on a sunny table with a wall clock softly out of focus.',
  'topics/cilt-genclesmesi': 'Macro photograph of a dewy green leaf and a smooth cream swirl side by side, symbolizing skin renewal, soft light.',
  'topics/d3-vitamini': 'Warm sunlight streaming through leaves onto a wooden table with eggs and a glass of milk, gentle morning glow.',
  'topics/epigenetik': 'Coiled natural yarn and threads on wooden spools on a sunlit desk, metaphor for DNA organization, soft and calm.',
  'topics/kortizol-stres': 'A quiet reading nook with a blanket, a cup of tea and a window view of a garden, a sense of slowing down.',
  'topics/mavi-bolge': 'A Mediterranean courtyard table with olive oil, beans, herbs and bread under the shade of an olive tree.',
  'topics/medikal-estetik': 'A clean aesthetic-medicine treatment room with a sleek device on a cart and folded linens, soft professional daylight.',
  'topics/nmn-nad': 'Clean lab glassware with clear liquids catching soft light on a stone bench, minimal and scientific.',
  'topics/otofaji': 'A serene empty dining table set with a single glass of water and a clean plate in morning light, sense of pause and renewal.',
  'topics/telomer': 'A microscope with a glass slide under warm light on a lab bench, beside neatly coiled thread, scientific and calm.',
  'topics/urun-nmn': 'Unlabeled amber supplement bottles and a glass of water on a neutral countertop next to a stethoscope, calm and medical.',
};

const list = [
  ...Object.entries(ARTICLES).map(([id, konu]) => ({ id, hedef: `assets/images/generated/articles/${id}.webp`, kategori: 'makale', konu })),
  ...Object.entries(PAGES).map(([id, konu]) => ({ id: `sayfa-${id.replace('/', '-')}`, hedef: `assets/images/generated/${id}.webp`, kategori: 'sayfa', konu })),
];

// Her makalenin bir kapağı olmalı.
const slugs = fs.readdirSync(path.join(ROOT, 'src/content/blog')).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));
const missing = slugs.filter((s) => !ARTICLES[s]);
const extra = Object.keys(ARTICLES).filter((s) => !slugs.includes(s));
if (missing.length || extra.length) {
  console.error(`Eksik kapak: ${missing.join(', ') || '-'} | Fazla: ${extra.join(', ') || '-'}`);
  process.exit(1);
}
fs.writeFileSync(path.join(ROOT, 'scripts/gorsel-listesi.json'), JSON.stringify(list, null, 2) + '\n');
console.log(`${list.length} görsel: ${Object.keys(ARTICLES).length} makale kapağı + ${Object.keys(PAGES).length} sayfa görseli`);
