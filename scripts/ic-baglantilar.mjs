// Yazı içi bağlantı katmanı (docs/seo-audit/findings/cluster.md, bölüm 4'teki matrise göre).
// Her yazıya "## Konuyu derinleştirmek için" paragrafı (Kaynaklar'dan önce) ve aynı hedeflerle relatedArticles yazar.
// Kullanım: node scripts/ic-baglantilar.mjs [--check]   (ardından: node scripts/sync-related.mjs)
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('src/content/blog');
const HEADING = '## Konuyu derinleştirmek için';
const check = process.argv.includes('--check');

const HUB = {
  skin: ['/medikal-estetik', 'Skin Longevity ve medikal estetik rehberimizde'],
  hucre: ['/longevity#hucresel-temeller', 'longevity sayfamızın hücresel temeller bölümünde'],
  beslenme: ['/longevity/beslenme', 'beslenme ve sağlıklı yaşlanma rehberimizde'],
  hareket: ['/longevity/hareket', 'hareket ve sağlıklı yaşlanma rehberimizde'],
  uyku: ['/longevity/uyku', 'uyku ve sağlıklı yaşlanma rehberimizde'],
  zihin: ['/longevity/zihin', 'zihin ve sağlıklı yaşlanma rehberimizde'],
  sosyal: ['/longevity/sosyal-iliskiler', 'sosyal ilişkiler ve sağlıklı yaşlanma rehberimizde'],
};

// slug: [hub, [[hedef, bağlantı metni], ...]]  — ilk üç hedef ilgili makale kartları olur.
export const MATRIX = {
  'gunes-kremi-nasil-secilir': ['skin', [['retinoid-nedir', 'retinoid kullanırken güneş korumasının önemi'], ['cilt-bariyeri-nasil-guclendirilir', 'cilt bariyerini koruyan bir bakım rutini'], ['ciltte-kollajen-kaybi', 'güneşin kollajen kaybına etkisi']]],
  'retinoid-nedir': ['skin', [['gunes-kremi-nasil-secilir', 'geniş spektrumlu güneş kremi seçimi'], ['cilt-bariyeri-nasil-guclendirilir', 'retinoid döneminde cilt bariyerini desteklemek'], ['ciltte-kollajen-kaybi', 'kollajen kaybının nedenleri']]],
  'cilt-bariyeri-nasil-guclendirilir': ['skin', [['retinoid-nedir', 'retinol ve türevlerinin doğru kullanımı'], ['gunes-kremi-nasil-secilir', 'SPF ve güneş kremi seçimi'], ['ciltte-kollajen-kaybi', 'ciltte kollajen kaybı']]],
  'ciltte-kollajen-kaybi': ['skin', [['gunes-kremi-nasil-secilir', 'fotoyaşlanma ve güneş koruması'], ['altin-igne', 'kollajen yapımını uyarmayı hedefleyen altın iğne'], ['retinoid-nedir', 'retinoidlerin cilt yaşlanmasındaki yeri']]],
  'botoks': ['skin', [['botoks-sonrasi-dikkat-edilmesi-gerekenler', 'botoks sonrası dikkat edilmesi gerekenler'], ['dermal-dolgu', 'dermal dolgu uygulamaları'], ['dermal-dolgu-guvenligi', 'enjeksiyon öncesi güvenlik kontrol listesi']]],
  'botoks-sonrasi-dikkat-edilmesi-gerekenler': ['skin', [['botoks', 'botulinum toksinin nasıl etki ettiği'], ['gunes-kremi-nasil-secilir', 'işlem sonrası güneş koruması'], ['egzersiz-sonrasi-toparlanma', 'egzersize dönüş ve toparlanma']]],
  'dermal-dolgu': ['skin', [['dermal-dolgu-guvenligi', 'dermal dolgu öncesi kontrol listesi'], ['botoks', 'botoks ile dolgu arasındaki fark'], ['cilt-genclesmesi-kombinasyon-tedavileri', 'kombine cilt uygulamaları']]],
  'dermal-dolgu-guvenligi': ['skin', [['dermal-dolgu', 'hyaluronik asit dolgunun nasıl çalıştığı'], ['botoks-sonrasi-dikkat-edilmesi-gerekenler', 'enjeksiyon sonrası bakım'], ['prp-eksozom', 'PRP ve eksozom ürünlerinde güvenlik soruları']]],
  'prp-eksozom': ['skin', [['mezoterapi', 'cilt mezoterapisi ve gençlik aşıları'], ['cilt-genclesmesi-kombinasyon-tedavileri', 'altın iğne ve eksozom kombinasyonu'], ['altin-igne', 'fraksiyonel radyofrekans (altın iğne)']]],
  'mezoterapi': ['skin', [['prp-eksozom', 'PRP mi eksozom mu sorusu'], ['ciltte-kollajen-kaybi', 'kollajen kaybının nedenleri'], ['senolitik-tedaviler-cilt-genclesmesi-zombi-hucreler', 'hücre yaşlanması ve cilt']]],
  'altin-igne': ['skin', [['cilt-genclesmesi-kombinasyon-tedavileri', 'altın iğne ve eksozom kombinasyonu'], ['ciltte-kollajen-kaybi', 'kollajen kaybının nedenleri'], ['prp-eksozom', 'PRP ve eksozom uygulamaları']]],
  'cilt-genclesmesi-kombinasyon-tedavileri': ['skin', [['altin-igne', 'altın iğne (fraksiyonel radyofrekans)'], ['prp-eksozom', 'PRP ve eksozom arasındaki fark'], ['mezoterapi', 'mezoterapi ve gençlik aşıları']]],
  'senolitik-tedaviler-cilt-genclesmesi-zombi-hucreler': ['skin', [['otofaji-nedir', 'otofaji ve hücresel geri dönüşüm'], ['nmn-nad-yaslanma', 'NAD+ ve hücresel yaşlanma'], ['ciltte-kollajen-kaybi', 'ciltte kollajen kaybı']]],

  'biyolojik-yas-nasil-olculur': ['hucre', [['telomerleri-korumak', 'telomer sağlığını destekleyen alışkanlıklar'], ['vo2max-ve-longevity', 'VO₂max ve aerobik kapasite'], ['mitokondri-sagligi-nasil-desteklenir', 'mitokondri sağlığı'], ['sirt6-proteini-epigenetik-genclesme', 'epigenetik yaşlanma üzerine güncel bir çalışma']]],
  'otofaji-nedir': ['hucre', [['aralikli-oruc-longevity', 'aralıklı oruç ve kanıtlar'], ['mitokondri-sagligi-nasil-desteklenir', 'mitokondri sağlığı'], ['biyolojik-yas-nasil-olculur', 'biyolojik yaşın nasıl ölçüldüğü']]],
  'mitokondri-sagligi-nasil-desteklenir': ['hucre', [['bolge-2-kardiyo', 'Zone 2 (bölge 2) kardiyo'], ['nmn-nad-yaslanma', 'NAD+ ve NMN hakkında bilinenler'], ['biyolojik-yas-nasil-olculur', 'biyolojik yaş ölçümleri']]],
  'telomerleri-korumak': ['hucre', [['kortizol-yaslanma', 'kronik stres ve yaşlanma'], ['uyku-kalitesi-nasil-artirilir', 'uyku kalitesini artırmanın yolları'], ['biyolojik-yas-nasil-olculur', 'biyolojik yaş nasıl ölçülür']]],
  'nmn-nad-yaslanma': ['hucre', [['mitokondri-sagligi-nasil-desteklenir', 'hücrenin enerji üretimi ve mitokondri'], ['otofaji-nedir', 'otofaji'], ['sirt6-proteini-epigenetik-genclesme', 'sirtuinler ve SIRT6']]],
  'sirt6-proteini-epigenetik-genclesme': ['hucre', [['nmn-nad-yaslanma', 'sirtuinler ve NAD+'], ['aralikli-oruc-longevity', 'kalori kısıtlaması ve aralıklı oruç'], ['biyolojik-yas-nasil-olculur', 'epigenetik saatler ve biyolojik yaş']]],

  'mavi-bolge-diyeti': ['beslenme', [['lifli-beslenme-ve-mikrobiyota', 'lifli beslenme ve bağırsak mikrobiyotası'], ['polifenoller-ve-saglik', 'polifenol içeren besinler'], ['yasam-amaci-ve-longevity', 'yaşam amacı (ikigai) ve uzun ömür']]],
  'aralikli-oruc-longevity': ['beslenme', [['otofaji-nedir', 'otofajinin ne olduğu'], ['insulin-direnci-belirtileri', 'insülin direnci belirtileri'], ['protein-ihtiyaci-yaslanma', 'yaşlanmada protein ihtiyacı']]],
  'protein-ihtiyaci-yaslanma': ['beslenme', [['kas-kutlesi-ve-yaslanma', 'kas kütlesini korumak'], ['kreatin-ve-yaslanma', 'kreatin ve kas gücü'], ['direnc-antrenmani-yaslanma', 'direnç antrenmanı']]],
  'lifli-beslenme-ve-mikrobiyota': ['beslenme', [['polifenoller-ve-saglik', 'polifenoller'], ['insulin-direnci-belirtileri', 'insülin direnci'], ['mavi-bolge-diyeti', 'Mavi Bölge beslenmesi']]],
  'insulin-direnci-belirtileri': ['beslenme', [['hareketsizlik-ve-metabolik-saglik', 'oturma süresi ve metabolik sağlık'], ['lifli-beslenme-ve-mikrobiyota', 'lifli beslenme'], ['aralikli-oruc-longevity', 'aralıklı oruç hakkında kanıtlar']]],
  'omega-3-ne-ise-yarar': ['beslenme', [['polifenoller-ve-saglik', 'polifenoller'], ['mavi-bolge-diyeti', 'Mavi Bölge beslenmesi'], ['d3-vitamini-eksikligi', 'D3 vitamini eksikliği']]],
  'polifenoller-ve-saglik': ['beslenme', [['omega-3-ne-ise-yarar', 'omega-3 yağ asitleri'], ['mavi-bolge-diyeti', 'Mavi Bölge beslenmesi'], ['lifli-beslenme-ve-mikrobiyota', 'lif ve mikrobiyota']]],
  'd3-vitamini-eksikligi': ['beslenme', [['d3-k2-birlikte-kullanilir-mi', 'D3 ve K2 birlikte kullanılır mı'], ['magnezyum-eksikligi', 'magnezyum eksikliği'], ['omega-3-ne-ise-yarar', 'omega-3 takviyeleri']]],
  'd3-k2-birlikte-kullanilir-mi': ['beslenme', [['d3-vitamini-eksikligi', 'D3 eksikliği belirtileri ve kan düzeyleri'], ['magnezyum-eksikligi', 'magnezyum ve D vitamini ilişkisi'], ['omega-3-ne-ise-yarar', 'omega-3 takviyelerinde güvenlik']]],
  'magnezyum-eksikligi': ['beslenme', [['d3-k2-birlikte-kullanilir-mi', 'D3 ve K2 takviyeleri'], ['uyku-kalitesi-nasil-artirilir', 'uyku düzenini iyileştirmek'], ['d3-vitamini-eksikligi', 'D3 vitamini eksikliği']]],

  'vo2max-ve-longevity': ['hareket', [['bolge-2-kardiyo', 'Zone 2 (bölge 2) kardiyo'], ['gunluk-yuruyus-sagligi', 'günlük yürüyüşün faydaları'], ['direnc-antrenmani-yaslanma', 'direnç antrenmanı']]],
  'bolge-2-kardiyo': ['hareket', [['vo2max-ve-longevity', 'VO₂max ve uzun ömür'], ['mitokondri-sagligi-nasil-desteklenir', 'mitokondri sağlığı'], ['gunluk-yuruyus-sagligi', 'günlük yürüyüş']]],
  'gunluk-yuruyus-sagligi': ['hareket', [['hareketsizlik-ve-metabolik-saglik', 'uzun süre oturmanın etkileri'], ['vo2max-ve-longevity', 'aerobik kapasite (VO₂max)'], ['doga-ve-zihin-sagligi', 'doğada vakit geçirmenin zihinsel etkileri']]],
  'hareketsizlik-ve-metabolik-saglik': ['hareket', [['gunluk-yuruyus-sagligi', 'günlük yürüyüş'], ['insulin-direnci-belirtileri', 'insülin direnci belirtileri'], ['direnc-antrenmani-yaslanma', 'direnç antrenmanı']]],
  'direnc-antrenmani-yaslanma': ['hareket', [['kas-kutlesi-ve-yaslanma', 'kas kütlesi ve yaşlanma'], ['kreatin-ve-yaslanma', 'kreatin'], ['protein-ihtiyaci-yaslanma', 'protein ihtiyacı']]],
  'kas-kutlesi-ve-yaslanma': ['hareket', [['protein-ihtiyaci-yaslanma', 'yaşlanmada protein ihtiyacı'], ['kavrama-gucu-ve-saglik', 'kavrama gücünün sağlık hakkında söyledikleri'], ['direnc-antrenmani-yaslanma', 'direnç antrenmanı']]],
  'kavrama-gucu-ve-saglik': ['hareket', [['kas-kutlesi-ve-yaslanma', 'kas kütlesini korumak'], ['direnc-antrenmani-yaslanma', 'direnç antrenmanı'], ['denge-egzersizleri-yaslanma', 'denge egzersizleri']]],
  'kreatin-ve-yaslanma': ['hareket', [['direnc-antrenmani-yaslanma', 'direnç antrenmanı'], ['protein-ihtiyaci-yaslanma', 'protein ihtiyacı'], ['kas-kutlesi-ve-yaslanma', 'kas kütlesi ve yaşlanma']]],
  'denge-egzersizleri-yaslanma': ['hareket', [['direnc-antrenmani-yaslanma', 'direnç antrenmanı'], ['kas-kutlesi-ve-yaslanma', 'kas kütlesi'], ['kavrama-gucu-ve-saglik', 'kavrama gücü']]],
  'egzersiz-sonrasi-toparlanma': ['hareket', [['uyku-kalitesi-nasil-artirilir', 'toparlanmada uykunun rolü'], ['protein-ihtiyaci-yaslanma', 'protein ihtiyacı'], ['direnc-antrenmani-yaslanma', 'direnç antrenmanı']]],

  'uyku-kalitesi-nasil-artirilir': ['uyku', [['sirkadiyen-ritim-ve-uyku', 'sirkadiyen ritmi desteklemek'], ['ekran-kullanimi-ve-uyku', 'ekran kullanımı ve uyku'], ['uyku-bozukluklari-ve-glymphatic-temizlik', 'uyku sırasında beynin glimfatik temizliği'], ['magnezyum-eksikligi', 'magnezyum eksikliği']]],
  'sirkadiyen-ritim-ve-uyku': ['uyku', [['uyku-kalitesi-nasil-artirilir', 'uyku kalitesi nasıl artırılır'], ['ekran-kullanimi-ve-uyku', 'akşam ekran kullanımı'], ['uyku-bozukluklari-ve-glymphatic-temizlik', 'glimfatik sistem']]],
  'ekran-kullanimi-ve-uyku': ['uyku', [['sirkadiyen-ritim-ve-uyku', 'sirkadiyen ritim'], ['uyku-kalitesi-nasil-artirilir', 'uyku hijyeni'], ['dijital-tukenmislik', 'dijital tükenmişlik']]],
  'uyku-bozukluklari-ve-glymphatic-temizlik': ['uyku', [['uyku-kalitesi-nasil-artirilir', 'uyku kalitesini artırmanın yolları'], ['sirkadiyen-ritim-ve-uyku', 'sirkadiyen ritim'], ['otofaji-nedir', 'hücresel temizlik (otofaji)']]],

  'kortizol-yaslanma': ['zihin', [['anksiyete-ve-obsesyonun-fizyolojisi', 'kronik kaygının bedene etkileri'], ['tukenmislik-sendromu', 'tükenmişlik sendromu'], ['uyku-kalitesi-nasil-artirilir', 'uyku kalitesi']]],
  'tukenmislik-sendromu': ['zihin', [['dijital-tukenmislik', 'dijital tükenmişlik'], ['anksiyete-ve-obsesyonun-fizyolojisi', 'kronik kaygı'], ['kortizol-yaslanma', 'kortizol ve yaşlanma']]],
  'dijital-tukenmislik': ['zihin', [['tukenmislik-sendromu', 'tükenmişlik sendromu'], ['ekran-kullanimi-ve-uyku', 'ekran kullanımı ve uyku'], ['doga-ve-zihin-sagligi', 'doğada geçirilen zaman']]],
  'anksiyete-ve-obsesyonun-fizyolojisi': ['zihin', [['tukenmislik-sendromu', 'tükenmişlik sendromu'], ['muzik-ve-stres-kortizol', 'müziğin stres üzerindeki etkisi'], ['kortizol-yaslanma', 'kortizol ve yaşlanma']]],
  'muzik-ve-stres-kortizol': ['zihin', [['doga-ve-zihin-sagligi', 'doğada vakit geçirmek'], ['sanat-ve-beyin-sagligi', 'sanat üretmenin beyin sağlığına etkisi'], ['kortizol-yaslanma', 'kronik stres ve kortizol']]],
  'doga-ve-zihin-sagligi': ['zihin', [['gunluk-yuruyus-sagligi', 'günlük yürüyüş'], ['muzik-ve-stres-kortizol', 'müzik ve stres'], ['kitap-okuma-ve-beyin', 'kitap okumanın beyne etkisi']]],
  'kitap-okuma-ve-beyin': ['zihin', [['sanat-ve-beyin-sagligi', 'sanat ve beyin sağlığı'], ['sosyal-baglanti-ve-uzun-omur', 'sosyal bağlantı ve uzun ömür'], ['muzik-ve-stres-kortizol', 'müzik dinlemenin etkileri']]],
  'sanat-ve-beyin-sagligi': ['zihin', [['kitap-okuma-ve-beyin', 'kitap okuma ve bilişsel yaşlanma'], ['muzik-ve-stres-kortizol', 'müzik ve stres'], ['doga-ve-zihin-sagligi', 'doğa ve zihinsel toparlanma']]],

  'sosyal-baglanti-ve-uzun-omur': ['sosyal', [['yasam-amaci-ve-longevity', 'yaşam amacı ve uzun ömür'], ['sukran-pratigi-ve-dopamin', 'şükran pratiği'], ['mavi-bolge-diyeti', 'Mavi Bölge toplulukları']]],
  'yasam-amaci-ve-longevity': ['sosyal', [['sosyal-baglanti-ve-uzun-omur', 'sosyal bağlantının sağlığa etkisi'], ['sukran-pratigi-ve-dopamin', 'şükran pratiği'], ['mavi-bolge-diyeti', 'Mavi Bölge beslenmesi']]],
  'sukran-pratigi-ve-dopamin': ['sosyal', [['yasam-amaci-ve-longevity', 'yaşam amacı'], ['sosyal-baglanti-ve-uzun-omur', 'sosyal bağlantı'], ['kortizol-yaslanma', 'stres ve kortizol']]],
};

const link = ([slug, anchor]) => `[${anchor}](/blog/${slug})`;
function paragraph(hubKey, targets) {
  const [hubHref, hubText] = HUB[hubKey];
  const [a, b, ...rest] = targets;
  const lines = [`Bu yazıyla bağlantılı olarak ${link(a)} ve ${link(b)} konularını da okuyabilirsiniz.`];
  if (rest.length) lines.push(`Ayrıca ${rest.map(link).join(' ve ')} hakkında ayrı bir yazımız bulunuyor.`);
  lines.push(`Konunun genel çerçevesini [${hubText}](${hubHref}) bulabilirsiniz.`);
  return lines.join(' ');
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.md'));
const slugs = new Set(files.map((f) => f.replace(/\.md$/, '')));
const problems = [];
// Yeni günlük yazılar açık frontmatter/gövde bağlantılarıyla doğrulanır; eski matris değişmez.
// --check ve normal çalışma yeni yazının içeriğini otomatik olarak değiştirmez.
for (const slug of slugs) {
  if (MATRIX[slug]) continue;
  const source = fs.readFileSync(path.join(DIR, `${slug}.md`), 'utf8');
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\s*\r?\n|$)/);
  if (!match) { problems.push(`${slug}: yeni yazıda frontmatter yok`); continue; }
  const frontmatter = match[1];
  const body = source.slice(match[0].length);
  const relatedSection = frontmatter.match(/^relatedArticles:\r?\n([\s\S]*?)(?=^[a-zA-Z]|(?![\s\S]))/m)?.[1] ?? '';
  const related = [...relatedSection.matchAll(/^\s+- slug: "([^"]+)"/gm)].map((m) => m[1]);
  if (new Set(related).size < 2 || new Set(related).size !== related.length)
    problems.push(`${slug}: yeni yazı en az iki farklı açık relatedArticles hedefi taşımalı`);
  for (const target of related) if (target === slug || !slugs.has(target)) problems.push(`${slug}: geçersiz ilgili makale ${target}`);
  const bodyTargets = [...body.matchAll(/\]\(\/blog\/([a-z0-9-]+)(?:#[^)\s]+)?\)/g)].map((m) => m[1]);
  if (new Set(bodyTargets).size < 2) problems.push(`${slug}: gövdede en az iki mevcut makaleye bağlantı gerekli`);
  for (const target of bodyTargets) if (target === slug || !slugs.has(target)) problems.push(`${slug}: geçersiz gövde hedefi ${target}`);
  for (const target of related) if (!bodyTargets.includes(target)) problems.push(`${slug}: ilgili makale gövdede de bağlanmalı ${target}`);
  const hubs = Object.values(HUB).map(([href]) => href);
  if (!hubs.some((href) => body.includes(`](${href})`))) problems.push(`${slug}: mevcut konu hub'ına gövde bağlantısı gerekli`);
  if (!/^## Kaynaklar\s*$/m.test(body)) problems.push(`${slug}: yeni yazıda Kaynaklar bölümü yok`);
}
for (const [s, [hub, targets]] of Object.entries(MATRIX)) {
  if (!slugs.has(s)) problems.push(`yazı yok: ${s}`);
  if (!HUB[hub]) problems.push(`${s}: bilinmeyen hub ${hub}`);
  for (const [t] of targets) if (!slugs.has(t) || t === s) problems.push(`${s}: geçersiz hedef ${t}`);
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }

let changed = 0;
for (const [slug, [hub, targets]] of Object.entries(MATRIX)) {
  const file = path.join(DIR, `${slug}.md`);
  const src = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  let next = src;
  // 1) Gövde paragrafı: önceki sürüm varsa değiştir, yoksa Kaynaklar'dan önce ekle.
  const block = `${HEADING}\n\n${paragraph(hub, targets)}\n\n`;
  const existing = new RegExp(`${HEADING}\\n\\n[^\\n]*\\n\\n`);
  if (existing.test(next)) next = next.replace(existing, () => block);
  else {
    const at = next.search(/^## Kaynaklar\s*$/m);
    if (at < 0) { problems.push(`${slug}: Kaynaklar yok`); continue; }
    next = next.slice(0, at) + block + next.slice(at);
  }
  // 2) relatedArticles: ilk üç hedef (başlık/kategori/görsel sync-related ile dolar).
  const wanted = targets.slice(0, 3).map(([t]) => t);
  const current = [...(next.match(/^relatedArticles:\n([\s\S]*?)(?=^[a-zA-Z]|^---)/m)?.[1] ?? '').matchAll(/- slug: "([^"]+)"/g)].map((m) => m[1]);
  const related = wanted.map((t) => `  - slug: "${t}"\n    category: "Longevity Bilimi"\n    title: ""\n    image: ""`).join('\n');
  if (current.join() !== wanted.join()) next = next.replace(/^relatedArticles:\n(?:  - slug:[\s\S]*?)(?=^[a-zA-Z]|^---)/m, () => `relatedArticles:\n${related}\n`);
  if (!/^relatedArticles:/m.test(next)) next = next.replace(/\n---\n/, () => `\nrelatedArticles:\n${related}\n---\n`);
  if (next !== src) {
    changed++;
    if (!check) fs.writeFileSync(file, next);
  }
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
if (check && changed) { console.error(`${changed} yazıda iç bağlantı güncel değil`); process.exit(1); }
console.log(check ? 'İç bağlantılar güncel.' : `${changed} yazı güncellendi.`);
