// Yükselen arama keşfi: Google otomatik tamamlama (Türkiye, Türkçe) + Google Trends günlük akışı.
//   node scripts/seo/trend-kesif.mjs   -> data/seo/trend-adaylari.json (+ data/seo/trend-gecmis.json birikir)
// Her aday puanlanır (Google ilgi puanı, kaç tohumda/günde göründüğü, yeni belirmiş olması, bilgi niyeti)
// ve sitedeki yazılarla eşleştirilir: karşılığı yoksa yeni yazı adayı, varsa mevcut yazıya eklenecek soru.
// Sağlık tanıtım mevzuatı gereği ticari/hizmet/konum aramaları elenir.
import fs from 'node:fs';
import path from 'node:path';
import { DATA, loadArticles, readJson, writeJson, trDay, daysBetween } from './ortak.mjs';

// Sitenin konu alanları (kategoriler ve mevcut yazıların ana kavramları). Yeni alan eklemek için buraya yazılır.
const SEEDS = [
  // Longevity bilimi
  'longevity', 'uzun yaşam', 'sağlıklı yaşlanma', 'biyolojik yaş', 'yaşlanma', 'otofaji', 'mitokondri', 'telomer', 'nad+', 'nmn', 'epigenetik', 'senolitik', 'healthspan', 'mavi bölge',
  // Beslenme
  'omega 3', 'd vitamini', 'd3 k2', 'magnezyum', 'protein ihtiyacı', 'kreatin', 'lif', 'polifenol', 'aralıklı oruç', 'akdeniz diyeti', 'ultra işlenmiş gıda', 'tam tahıl', 'insülin direnci', 'kan şekeri', 'bağırsak sağlığı', 'probiyotik',
  // Hareket
  'zone 2', 'vo2max', 'kas kaybı', 'sarkopeni', 'kavrama gücü', 'denge egzersizleri', 'direnç antrenmanı', 'yürüyüş', 'egzersiz sonrası', 'kas ağrısı',
  // Uyku
  'uyku kalitesi', 'uyku apnesi', 'uykusuzluk', 'sirkadiyen ritim', 'melatonin', 'kafein uyku', 'vardiyalı çalışma uyku', 'uyku hijyeni',
  // Zihin ve sosyal
  'kortizol', 'stres', 'anksiyete', 'tükenmişlik', 'dijital detoks', 'yalnızlık', 'meditasyon', 'şükran',
  // Skin longevity ve medikal estetik (bilgilendirme)
  'kolajen', 'retinol', 'retinoid', 'güneş kremi', 'cilt bariyeri', 'nemlendirici', 'botoks', 'dolgu', 'mezoterapi', 'prp', 'cilt yaşlanması', 'leke', 'ben kontrolü',
  // Genişletme (26 Ekim): ilk tohumların çoğunun yazısı var; yeni yazı konusu bu alanlardan doğar.
  // Metabolik ve kalp-damar sağlığı
  'kolesterol', 'ldl kolesterol', 'trigliserid', 'tansiyon', 'kalp sağlığı', 'karaciğer yağlanması', 'metabolizma', 'bazal metabolizma', 'bel çevresi', 'vücut yağ oranı', 'inflamasyon', 'glisemik indeks', 'hba1c', 'prediyabet',
  // Vitamin ve mineraller
  'b12 vitamini', 'demir eksikliği', 'ferritin', 'çinko', 'c vitamini', 'folik asit', 'kalsiyum', 'potasyum', 'selenyum', 'iyot',
  // Beslenme alışkanlıkları
  'ketojenik diyet', 'kahvaltı', 'su tüketimi', 'yeşil çay', 'zerdeçal', 'resveratrol', 'koenzim q10', 'ashwagandha', 'şeker tüketimi', 'tuz tüketimi', 'fermente gıdalar', 'kefir', 'zeytinyağı', 'kuruyemiş', 'baklagiller', 'kırmızı et', 'yumurta',
  // Hormon ve yaşam dönemleri
  'menopoz', 'andropoz', 'testosteron', 'tiroid', 'büyüme hormonu', 'osteoporoz', 'kemik yoğunluğu', 'eklem sağlığı',
  // Hareket ve toparlanma
  'hiit', 'pilates', 'yoga', 'esneme', 'postür', 'bel ağrısı', 'adım sayısı', 'nefes egzersizi', 'soğuk duş', 'sauna', 'nabız', 'dinlenik nabız', 'kalp hızı değişkenliği',
  // Beyin ve zihin
  'demans', 'alzheimer', 'hafıza', 'beyin sisi', 'odaklanma', 'nöroplastisite', 'ruh hali', 'öfke kontrolü', 'mindfulness', 'sosyal ilişkiler',
  // Uyku
  'uyku süresi', 'öğle uykusu', 'horlama', 'gece uyanma', 'uyku pozisyonu', 'mavi ışık',
  // Duyular ve genel
  'işitme kaybı', 'göz sağlığı', 'diş eti sağlığı', 'bağışıklık sistemi',
  // Cilt
  'hiyalüronik asit', 'niasinamid', 'kırışıklık', 'göz altı morluğu', 'akne', 'rozasea', 'saç dökülmesi', 'güneş lekesi', 'cilt tipi', 'selülit', 'gıdı',
];
const MODIFIERS = ['nedir', 'ne işe yarar', 'faydaları', 'belirtileri', 'nasıl', 'ne zaman', 'zararları', 'eksikliği'];
const MODIFIER_SEEDS_PER_DAY = 20; // kotayı yormamak için soru kalıpları her gün farklı 20 tohumda

// Mevzuat ve niyet filtresi: ticari, hizmet, konum, marka, eğlence ve sağlık dışı aramalar.
const EXCLUDE = /fiyat|ücret|eczane|satın|indirim|marka|markalar|en iyi|en ucuz|doktor|doktoru|klinik|hastane|randevu|yorum|şikayet|önce[- ]?sonra|bursa|istanbul|ankara|izmir|antalya|ekşi|film|izle|dizi|şarkı|masal|dua|tulum|jelibon|oyun|hap fiyat|ocean|solgar|orzax|voonka|nutraxin|venatura|zade|garnier|nivea|la roche|cerave|bioderma|loreal|neutrogena|vichy|avene|eucerin|sinoz|uykucu|uykuluk|kaç tl|sınıf|ders|ödev|konu anlatımı|test soruları|pdf|slayt|sunum|ingilizce|nedir kısaca 5|yazılır|yazilir|senfoni|müziği|muzigi|sözleri|sozleri|şiir|siir|çıkarıcı|cikarici|yazıldı|yazildi|çıktı|cikti|kitap|kitabı|roman|yazarı|albüm|album|mimarlık|mimarlik|tasarım|tasarim|bilir misin|anlamı|anlami|yüzyıllık|nobel|ödülü|odulu|şarkıcı|sarkici|hangi bölüm|hangi bolum|hangi doktor/i;
// Ürün arayan sorgu (yazıyla değil mağazayla karşılanır): "retinol krem", "magnezyum tablet".
const PRODUCT = /\b(krem|kremi|kremler|kremleri|serum|serumu|tablet|şurup|surup|sprey|jel)$/i;
const INFO = /nedir|ne demek|ne işe yarar|faydaları|faydası|belirti|nasıl|ne zaman|neden|zararları|yan etki|eksikliği|fazlalığı|hangi|kaç|nelerde|içeren|nelerdir|ne kadar|düzeyi|normal|testi|egzersiz|beslenme|diyet|önlem|tedavi|etkisi/i;
const HEALTH = /sağlık|vitamin|uyku|stres|cilt|diyet|egzersiz|kalp|şeker|kolesterol|yaşlan|beslenme|mineral|omega|protein|kas|kemik|bağışıklık|grip|virüs|hastalı|ağrı|tansiyon|obez|kilo/i;

const fold = (s) => s.toLocaleLowerCase('tr').replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c').normalize('NFD').replace(/[̀-ͯ]/g, '');
const STOP = new Set(['ve', 'ile', 'icin', 'mi', 'mu', 'ne', 'nedir', 'nasil', 'bir', 'en', 'da', 'de', 'ki', 'gibi', 'olan', 'hangi', 'zaman', 'ise', 'yarar', 'kac', 'neden', 'nelerdir', 'demek', 'var', 'olur', 'yapilir', 'icerir']);
// Türkçe ekleri kabaca yok saymak için kelimenin ilk 5 harfi (kısa kelimede tamamı) kök sayılır.
const stem = (t) => t.slice(0, 5);
// Kümelemede bağ kurmayan genel kökler (her konuda geçen soru kalıpları).
const GENERIC = new Set(['belir', 'fayda', 'zarar', 'etkil', 'etkis', 'tedav', 'neler', 'yapar', 'gecer', 'gelir', 'iyi', 'kotu', 'yan', 'nasil', 'neden', 'olur', 'kadar', 'turle', 'cesit']);
const tokens = (s) => fold(s).split(/[^a-z0-9+]+/).filter((t) => t.length > 1 && !STOP.has(t));

async function suggest(q) {
  const url = `https://suggestqueries.google.com/complete/search?client=chrome&hl=tr&gl=tr&ie=utf-8&oe=utf-8&q=${encodeURIComponent(q)}`;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(15000) });
    const j = await r.json();
    const rel = j[4]?.['google:suggestrelevance'] ?? [];
    return (j[1] ?? []).map((s, i) => ({ q: s.trim(), rel: rel[i] ?? 0, rank: i }));
  } catch { return []; }
}
async function trendsRss() {
  try {
    const xml = await (await fetch('https://trends.google.com/trending/rss?geo=TR', { signal: AbortSignal.timeout(15000) })).text();
    return [...xml.matchAll(/<item>[\s\S]*?<title>([^<]+)<\/title>[\s\S]*?<ht:approx_traffic>([^<]+)</g)].map((m) => ({ q: m[1].trim(), traffic: m[2] }));
  } catch { return []; }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function discover() {
  const today = trDay();
  const dayIndex = Math.floor(Date.parse(today) / 86400000);
  const modSeeds = SEEDS.filter((_, i) => (i + dayIndex) % Math.ceil(SEEDS.length / MODIFIER_SEEDS_PER_DAY) === 0);
  const queries = [...SEEDS.map((s) => [s, s]), ...modSeeds.flatMap((s) => MODIFIERS.map((m) => [s, `${s} ${m}`]))];

  const found = new Map(); // öneri -> { seeds:Set, rel max, best rank }
  for (const [seed, q] of queries) {
    for (const s of await suggest(q)) {
      if (fold(s.q) === fold(seed)) continue;
      const o = found.get(s.q) ?? { query: s.q, seeds: new Set(), asked: new Set(), rel: 0, rank: 99 };
      o.seeds.add(seed); o.asked.add(q); o.rel = Math.max(o.rel, s.rel); o.rank = Math.min(o.rank, s.rank);
      found.set(s.q, o);
    }
    await sleep(250);
  }
  const trending = (await trendsRss()).filter((t) => HEALTH.test(t.q) && !EXCLUDE.test(t.q));
  for (const t of trending) {
    const o = found.get(t.q) ?? { query: t.q, seeds: new Set(['google-trends']), rel: 0, rank: 0 };
    o.trend = t.traffic; found.set(t.q, o);
  }

  // Geçmiş: her önerinin ilk görüldüğü gün ve kaç gün görüldüğü (yükselen tespiti).
  const histFile = path.join(DATA, 'trend-gecmis.json');
  const hist = readJson(histFile, { started: today, queries: {} });
  hist.asked ??= {}; // sorulan arama -> ilk sorulduğu gün
  for (const [, q] of queries) hist.asked[q] ??= today;
  for (const [q, o] of found) {
    const h = hist.queries[q] ?? { first: today, days: 0, last: null };
    if (h.last !== today) { h.days += 1; h.last = today; }
    // Getiren aramalardan biri bu öneriden önce de soruluyduysa öneri sonradan belirmiştir (gerçek yükselen).
    if (h.days === 1) h.emerged = [...(o.asked ?? [])].some((a) => hist.asked[a] && hist.asked[a] < today);
    hist.queries[q] = h;
  }
  writeJson(histFile, hist);
  const trackingDays = daysBetween(hist.started, today);

  // Site kapsaması: aday sorgunun anlamlı kelimeleri bir yazının başlık/açıklamasında ne kadar var?
  // Başlık, açıklama ve alt başlıklar (## / ###): yazının gerçekten yanıtladığı sorular.
  const articles = loadArticles().map((a) => {
    const heads = (fs.readFileSync(a.file, 'utf8').match(/^#{2,3} .+$/gm) ?? []).join(' ');
    return { slug: a.slug, title: a.title, toks: new Set(tokens(`${a.title} ${a.seoTitle ?? ''} ${a.description} ${heads}`).map(stem)) };
  });
  const kw = readJson(path.join(DATA, 'anahtar-kelimeler.json'), { keywords: [] });
  const ranking = new Map(kw.keywords.map((k) => [fold(k.query), k]));

  const candidates = [];
  for (const o of found.values()) {
    if (EXCLUDE.test(o.query) || PRODUCT.test(o.query)) continue;
    const qt = tokens(o.query);
    if (qt.length < 2) continue;
    let best = null;
    for (const a of articles) {
      // Tohum (ana konu) kökü yazıda yoksa eşleşme yarım sayılır: "kortizol eksikliği" D vitamini yazısına yakın değildir.
      const seedHit = tokens(o.seeds.values().next().value ?? '').map(stem).every((t) => a.toks.has(t));
      const hit = (qt.filter((t) => a.toks.has(stem(t))).length / qt.length) * (seedHit ? 1 : 0.5);
      if (!best || hit > best.hit) best = { slug: a.slug, title: a.title, hit };
    }
    const h = hist.queries[o.query];
    const isNew = !!h.emerged && daysBetween(h.first, today) <= 2; // önceden sorulan aramada sonradan beliren
    const info = INFO.test(o.query);
    const gsc = ranking.get(fold(o.query));
    const score = Math.round(
      Math.min(o.rel, 1300) / 13            // Google ilgi puanı (0–100)
      + (o.seeds.size - 1) * 10             // birden fazla tohumda çıkıyor
      + Math.min(h.days, 7) * 2             // istikrarlı talep
      + (isNew ? 25 : 0) + (o.trend ? 30 : 0) // yükselen
      + (info ? 15 : -10)                   // bilgi niyeti (sitenin içerik türü)
      - o.rank * 2,
    );
    const coverage = best?.hit ?? 0;
    candidates.push({
      query: o.query, score, seeds: [...o.seeds], relevance: o.rel, rising: isNew || !!o.trend, trend: o.trend ?? null,
      firstSeen: h.first, daysSeen: h.days, info,
      coveredBy: coverage >= 0.6 ? best.slug : null, closest: best ? { slug: best.slug, coverage: +coverage.toFixed(2) } : null,
      gsc: gsc ? { position: gsc.position28, impressions: gsc.impressions28 } : null,
      action: coverage >= 0.6 ? 'mevcut-yaziyi-guclendir' : 'yeni-yazi',
    });
  }
  candidates.sort((a, b) => b.score - a.score);

  // Tohumun kendi yazısı varsa (başlık ya da adres tohumu içeriyor) o tohumdaki karşılıksız sorgular yeni sayfa açmaz:
  // ikinci sayfa aynı aramalarda ilk yazıyla yarışır. Bu sorgular o yazının güçlendirilmesine gider.
  const ownerOf = (seed) => {
    const f = fold(seed);
    return articles.find((a) => fold(a.title).includes(f) || a.slug.includes(f.replace(/ /g, '-')))?.slug ?? null;
  };
  // Konu kümeleri: aynı tohumda, tohum dışındaki anlamlı kökleri ortak olan karşılıksız sorgular tek yazı konusudur.
  const topics = [];
  // Yeni yazı konusu yalnız bilgi niyetli sorgudan doğar (nedir, belirtileri, nasıl…); "dijital detoks kitap" gibi sorgular konu açmaz.
  for (const c of candidates.filter((x) => x.action === 'yeni-yazi' && x.info)) {
    const seed = c.seeds[0];
    const core = new Set(tokens(c.query).map(stem).filter((t) => !tokens(seed).map(stem).includes(t) && !GENERIC.has(t)));
    // Genel kelime dışında ortak kök yoksa (yalnız "X belirtileri" gibi) tohumun genel kümesine girer.
    const t = topics.find((x) => x.seed === seed && (core.size ? [...core].some((k) => x.core.has(k)) : x.core.size === 0));
    if (t) { t.queries.push(c.query); t.score += Math.round(c.score / 4); t.rising ||= c.rising; core.forEach((k) => t.core.add(k)); }
    else topics.push({ topic: c.query, seed, score: c.score, rising: c.rising, closest: c.closest, owner: ownerOf(seed), queries: [c.query], core });
  }
  topics.forEach((t) => delete t.core);
  topics.sort((a, b) => b.score - a.score);
  const strengthen = topics.filter((t) => t.owner);
  topics.splice(0, topics.length, ...topics.filter((t) => !t.owner));
  const out = { day: today, trackingDays, queriesAsked: queries.length, suggestions: found.size, trendingHealth: trending, topics: topics.slice(0, 60), guclendir: strengthen.slice(0, 30), candidates };
  writeJson(path.join(DATA, 'trend-adaylari.json'), out);
  return out;
}

if (process.argv[1]?.replaceAll('\\', '/').endsWith('scripts/seo/trend-kesif.mjs')) {
  const o = await discover();
  const nw = o.candidates.filter((c) => c.action === 'yeni-yazi');
  console.log(`Trend keşfi: ${o.queriesAsked} sorgu soruldu, ${o.suggestions} öneri, ${o.candidates.length} aday; ${nw.length} karşılıksız sorgu ${o.topics.length} konuda toplandı; yükselen ${o.candidates.filter((c) => c.rising).length}; Trends sağlık ${o.trendingHealth.length}.`);
  for (const t of o.topics.slice(0, 12)) console.log(`  ${String(t.score).padStart(3)}  ${t.topic}${t.rising ? '  ↑' : ''}  [${t.queries.length} sorgu] (en yakın yazı: ${t.closest?.slug} %${Math.round((t.closest?.coverage ?? 0) * 100)})`);
}
