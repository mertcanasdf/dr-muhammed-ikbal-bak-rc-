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
  'mitokondri-sagligi-nasil-desteklenir': 'Photorealistic 3D medical illustration of a single mitochondrion inside a cell, cutaway view revealing the folded inner membranes (cristae), warm amber-orange organelle against soft translucent blue cytoplasm with a few smaller organelles out of focus; scientific, calm, shallow depth of field.',
  'otofaji-nedir': 'Photorealistic 3D medical illustration of autophagy inside a cell: a round double-membraned autophagosome enclosing small damaged organelles and protein clumps, about to fuse with a lysosome; warm amber and soft translucent blue palette, shallow depth of field, calm and scientific.',
  'nmn-nad-yaslanma': 'A clean laboratory still life: a few unlabeled amber glass vials and a pipette resting on a white stone surface, soft cool-warm daylight, scientific and calm.',
  'sirt6-proteini-epigenetik-genclesme': 'Photorealistic 3D scientific illustration of chromatin: a DNA double helix wrapped around round histone protein spools (nucleosomes) like beads on a string, one section slightly unwound, soft blue and warm sand tones on a dark neutral background, shallow depth of field.',
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
  'ekran-kullanimi-ve-uyku': 'A fictional woman lying in bed in a dark bedroom at night, her face lit by the cold blue glow of the smartphone she holds above her, wide awake; a small analog bedside clock with a plain face and a glass of water on the nightstand in dim warm light.',
  'sirkadiyen-ritim-ve-uyku': 'A bedroom window at dawn with sheer curtains glowing in first light, a made bed in soft shadow, a gradient from night blue to warm morning.',
  'uyku-bozukluklari-ve-glymphatic-temizlik': 'Abstract calm night scene: moonlight falling across rumpled white bedsheets and a pillow, deep blue tones, peaceful and slightly misty.',
  // Zihin & Sosyal Yaşam
  'dijital-tukenmislik': 'A laptop closed on a desk with a cup of tea and a small plant, a person\'s hands resting on the lid, evening light; sense of switching off.',
  'tukenmislik-sendromu': 'A fictional exhausted office worker in their 30s resting their head on folded arms on a desk, eyes closed, beside an open laptop, stacked papers and two empty coffee cups, late evening office light through the window; feeling of depletion, realistic and empathetic.',
  'kitap-okuma-ve-beyin': 'An open book on a linen armchair with reading glasses and a cup of coffee, warm afternoon window light, quiet library mood (no legible text).',
  'muzik-ve-stres-kortizol': 'A vinyl record player with a record spinning, headphones resting beside it on a wooden sideboard, soft evening lamp light.',
  'sukran-pratigi-ve-dopamin': 'A small notebook closed with a pen on a breakfast table next to fresh flowers and morning tea, gentle sunlight, calm ritual (no writing visible).',
  'sanat-ve-beyin-sagligi': 'Hands mixing watercolor paints on a palette beside a half-finished abstract landscape painting, natural studio light, no face.',
  'yasam-amaci-ve-longevity': 'An older gardener\'s hands planting a young seedling in rich soil, morning light in a vegetable garden, sense of purpose; no face.',
  'anksiyete-ve-obsesyonun-fizyolojisi': 'A fictional young adult sitting on a grey sofa with knees pulled up, one hand pressed against the chest, tense worried expression, gaze turned away from the camera, soft daylight in a quiet living room; realistic and empathetic, not dramatic.',
  'sosyal-baglanti-ve-uzun-omur': 'A long outdoor dinner table under string lights with several people seen from behind and the side sharing food, faces not visible, warm evening.',
  'doga-ve-zihin-sagligi': 'Sunlight filtering through tall trees in a green forest, a wooden boardwalk leading into the woods, fresh and restorative.',
  // Skin Longevity
  'altin-igne': 'A clean aesthetic-clinic tray with a sleek medical device handpiece (no needles visible on skin), folded gauze and a small dish, soft professional light.',
  'botoks-sonrasi-dikkat-edilmesi-gerekenler': 'A fictional woman in her 30s sitting upright on the edge of a white treatment chair in a bright clinic after a cosmetic appointment, relaxed and smiling slightly, holding a glass of water and a small blank folded aftercare card with nothing printed on it; natural unretouched skin with no marks; soft daylight.',
  'cilt-bariyeri-nasil-guclendirilir': 'Macro photograph of a rich white moisturizing cream swirl on a ceramic dish with a few drops of water, soft natural light, skincare texture.',
  'cilt-genclesmesi-kombinasyon-tedavileri': 'Two minimalist unlabeled skincare vials and a treatment handpiece on a marble counter of a bright aesthetic clinic, soft shadows.',
  'ciltte-kollajen-kaybi': 'Close-up portrait of a fictional woman in her late 40s gently touching her cheek with her fingertips, natural unretouched skin with fine lines around the eyes visible, soft side daylight, calm and confident; no glamour retouching.',
  'dermal-dolgu-guvenligi': 'Consultation in a bright clinic: a doctor in a white coat, cropped at the shoulders so the face is out of frame, points with a pen to a life-size facial anatomy model that shows the facial blood vessels in red and blue, while a patient seen from behind listens across the desk. Calm, informative, safety-focused.',
  'gunes-kremi-nasil-secilir': 'A wide-brimmed straw hat, sunglasses and an unlabeled sunscreen bottle on a shaded terrace table, bright summer light and leaf shadows.',
  'mezoterapi': 'A fictional woman reclining on a clean treatment chair, seen in calm three-quarter profile with eyes closed, while a clinician in gloves prepares a thin syringe beside her; in the sharp foreground a small white tray holds several clear unlabeled glass ampoules. The needle does not touch the skin. Bright aesthetic clinic, soft daylight.',
  'prp-eksozom': 'A compact benchtop laboratory centrifuge with a transparent lid showing the metal rotor and tube slots, clearly a medical lab instrument, on a clean white clinic counter beside a rack of empty sterile tubes, soft professional light, no blood visible.',
  'retinoid-nedir': 'A fictional woman in her 30s in a softly lit bathroom in the evening, seen in calm profile, placing a single small drop of serum from an unlabeled amber dropper bottle onto her fingertips before applying it; warm evening lamp light, natural unretouched skin.',
  'senolitik-tedaviler-cilt-genclesmesi-zombi-hucreler': 'Photorealistic 3D illustration of skin tissue at cellular scale: a cluster of healthy plump cells with one enlarged, flattened, aged senescent cell in the centre releasing tiny particles into its surroundings; soft blue and warm sand palette, shallow depth of field, calm and scientific.',
  // Deneme turunda üretilenler (listede kalır; --hepsi taslağı olanı atlar)
  'botoks': 'Close-up of a fictional woman in her late 30s reclining on a clean white treatment chair, eyes closed, calm relaxed expression, natural unretouched skin; a clinician\'s gloved hand holds a small insulin-type syringe near her forehead without touching the skin. Bright, clean aesthetic-medicine clinic, soft daylight. Focus on the face and the gloved hand.',
  'dermal-dolgu': 'Three-quarter close-up of a fictional woman\'s face (cheek, lips and chin), relaxed, natural unretouched skin; a doctor\'s gloved hand holds a thin syringe near the cheekbone, the needle not touching the skin, the other gloved fingertip resting lightly on the cheek. Clean white clinic background, soft daylight.',
  'telomerleri-korumak': 'Photorealistic 3D scientific illustration of a single X-shaped chromosome made of tightly coiled DNA, with the four chromosome tips highlighted in a warm amber tone to mark the telomere caps; soft blue and sand palette on a dark neutral background, shallow depth of field.',
  'uyku-kalitesi-nasil-artirilir': 'A tranquil bedroom at dusk: a neatly made bed with rumpled natural linen sheets, a dim warm bedside lamp, a closed book on the nightstand, a smartphone placed face-down on a shelf away from the bed, deep blue evening light at the window.',
  'mavi-bolge-diyeti': 'A rustic Mediterranean village table in natural daylight: bowls of beans and lentils, a small jug of olive oil, fresh leafy greens, sourdough bread, herbs and a few tomatoes on worn wood, simple and wholesome.',
  'kortizol-yaslanma': 'A person seen from behind, sitting by a large window with a cup of tea, looking out at a misty green garden in early morning; quiet, unhurried atmosphere. Face not visible.',
  // Günlük akışla eklenen yazılar (2026-10-07)
  'akilli-saat-uyku-takibi-guvenilir-mi': 'A fictional adult sitting on the edge of a bed in soft morning light, looking thoughtfully at a smartwatch on their wrist; the watch screen shows only abstract soft-coloured bars with no numbers or letters; rumpled linen sheets, calm and curious mood.',
  'kafein-uyku-kahve-ne-zaman-birakilmali': 'A fictional woman at a kitchen table in warm late-afternoon light, pausing with a half-finished cup of coffee pushed slightly away while she pours herself a glass of water; a window shows the sun getting low; calm, everyday decision moment.',
  'uyku-apnesi-belirtileri-ne-zaman-basvurulmali': 'A fictional middle-aged man asleep on his back in a dim bedroom at night, mouth slightly open as if snoring, while his partner lies awake beside him looking toward him with quiet concern; soft blue night light, realistic and empathetic.',
  'hafta-sonu-uykusu-sosyal-jetlag': 'A fictional young adult still asleep under a duvet in bright late-morning weekend sunlight streaming through half-open curtains, a small analog clock with a plain face on the nightstand; relaxed but slightly overslept mood.',
  'uyku-gunlugu-nasil-tutulur': 'A fictional adult sitting up in bed in the evening by a warm lamp, writing by hand in a small notebook resting on their knees; the page shows only blank grid lines and a few abstract pen marks, no readable text or numbers; calm routine.',
  'vardiyali-calisanlarda-uyku-duzeni': 'A fictional nurse in scrubs arriving home at sunrise, closing heavy blackout curtains in a bedroom while pale morning light glows at the edges of the window; tired but calm, realistic.',
  'egzersiz-gunlugu-nasil-tutulur': 'A fictional adult in workout clothes sitting on a gym bench after training, writing by hand in a small notebook; the page shows only blank lines and abstract marks, no readable text or numbers; a water bottle and towel beside them, soft daylight.',
  'egzersiz-sonrasi-kas-agrisi-ne-zaman-basvurulmali': 'A fictional adult in sportswear sitting on a park bench after a run, gently massaging the front of their thigh with a slightly pained but calm expression; morning light, trees in soft focus.',
  'egzersizde-konusma-testi': 'Two fictional friends in their 40s walking briskly side by side on a tree-lined path, talking and smiling while slightly out of breath; morning light, natural and energetic.',
  'ileri-yasta-egzersize-baslama': 'A fictional woman in her late 60s doing a gentle sit-to-stand exercise from a sturdy chair in a bright living room, a smiling physiotherapist in a polo shirt standing beside her with an encouraging hand gesture; soft daylight, warm and safe.',
  'kas-gucu-kas-kutlesi-farki': 'A fictional middle-aged man in a clinic room squeezing a handheld grip-strength dynamometer while a clinician in a white coat observes; the device display shows no numbers; a body composition scale stands in the background; bright, clinical and calm.',
  'masa-basinda-hareket-molasi': 'A fictional office worker standing up beside their desk and stretching their arms overhead, laptop open on the desk, a plant and a glass of water nearby; bright modern office with daylight, energetic and relieved mood.',
  'yaslilarda-dusme-onleme-ev-guvenligi': 'A fictional older man in his 70s walking down a well-lit home hallway while holding a wall-mounted grab rail, with a non-slip rug, a clear floor and a soft night light near the floor; warm daylight, safe and calm.',
  'baklagiller-protein-planlama': 'Overhead view of a wooden kitchen counter with bowls of dry lentils, chickpeas and beans next to cooked portions of the same legumes, a kitchen scale with a plain blank face, a wooden spoon and fresh herbs; natural daylight.',
  'besin-etiketi-nasil-okunur': 'A fictional woman in a grocery store aisle holding a packaged food product and reading the back of the package with focus; the label area is softly out of focus with no readable text; shelves blurred in the background, bright store light.',
  'lif-tuketimi-gaz-siskinlik': 'A fictional adult at a dining table with a bowl of vegetables, oats and legumes, one hand resting gently on the stomach with a mildly uncomfortable expression, a glass of water beside the bowl; soft daylight, realistic and empathetic.',
  'tam-tahil-nasil-anlasilir': 'Close-up of a fictional person\'s hands breaking a dense loaf of whole-grain bread with visible seeds and grains on a wooden board, a small bowl of whole oats and wheat kernels beside it; warm natural light.',
  'ultra-islenmis-gida-nedir': 'A split still life on a kitchen counter: on one side brightly coloured packaged snacks, sugary drinks and instant noodles in plain unbranded packaging with no text, on the other side fresh vegetables, eggs, legumes and fruit; even daylight, clear contrast between the two groups.',
  'yaslilarda-sivi-tuketimi-susama': 'A fictional woman in her 70s sitting in an armchair by a sunny window, smiling as she drinks from a glass of water, a carafe and a second glass on the side table; warm, calm daylight.',
  'mutlak-risk-goreceli-risk-farki': 'A clean desk still life: two transparent glass jars filled with small wooden beads, one with just a few amber beads among many plain ones and the other with slightly more amber beads, a magnifying glass beside them; soft daylight; an abstract metaphor for comparing risks, no text or numbers.',
  'saglik-arastirmalari-nasil-okunur': 'A fictional adult at a desk reading a printed scientific journal article with a highlighter in hand and reading glasses on, a laptop and a cup of tea nearby; the page shows only blurred text blocks and an abstract chart with no readable words or numbers; focused, calm study mood.',
  'saglikli-yasam-suresi-healthspan-nedir': 'A fictional active couple in their 70s hiking together on a sunny coastal trail, smiling and walking with light backpacks; golden morning light, vital and hopeful.',
  'nemlendirici-icerikleri-seramid-humektan': 'Close-up of a fictional woman\'s hands applying a dollop of rich white moisturizer from an unlabeled jar to the back of her hand, with an unlabeled serum dropper bottle beside it on a stone bathroom shelf; soft daylight, natural skin texture.',
  'kozmetik-etiketi-inci-nasil-okunur': "A fictional adult's hands inspecting the blank back label of an unbranded white cosmetic tube with a magnifying glass, an unlabeled amber skincare bottle on a pale stone bathroom shelf, soft natural daylight, warm neutral editorial health photography, no visible face, no writing or numbers.",
  'ben-takibi-abcde-nedir': "A fictional adult gently checking a few small natural moles on their own forearm in a softly lit home setting, forearm and relaxed hand in clear focus, a small plain hand mirror nearby, quiet skin self-observation rather than cosmetic products, editorial health photography, natural skin texture, off-white and sand palette with subtle blue detail, no visible face, no text, no logo, no needles, no wounds, no alarming cancer imagery.",
};

// Sayfalarda doğrudan kullanılan ve Codex ile üretilen görseller (aynı dosya adıyla yerinde yenilenir).
// Diğer sayfa görselleri Unsplash stok fotoğraflarıdır; kaynakları docs/gorsel-kaynaklari.md içinde.
const PAGES = {
  'online-course': 'A calm medical-aesthetics consultation desk: an illuminated magnifying skin-analysis lamp, a closed notebook and pen, a small plant, bright clinic room softly blurred behind, no people, soft professional light.',
  'quiz_skin_aesthetic': 'A bright aesthetic-clinic consultation corner with a mirror reflecting only soft light and plants, a treatment chair edge, calm and professional.',
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
