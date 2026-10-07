// Günlük içerik yayını. Varsayılan dry-run; --publish açıkça verilmedikçe commit/push yok.
// node scripts/publish-content.mjs --publish-repo ABSOLUTE_PATH --article slug [--publish | --dry-run | --retry-live] [--report PATH]
// Source Git geçmişini/dosya değişikliklerini commit/stash/reset/clean ile değiştirmez.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SOURCE = fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'));
const SITE = 'https://www.muhammedikbalbakirci.com';
const HOST = new URL(SITE).host;
const EXPECTED_REMOTE = /^(?:https:\/\/github\.com\/|git@github\.com:)mertcanasdf\/mib-site(?:\.git)?\/?$/i;
const dayInTurkey = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const now = () => new Date().toISOString();
const sha = (buffer, algo = 'sha256') => crypto.createHash(algo).update(buffer).digest('hex');
const gitEnv = { ...process.env };
for (const key of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_PREFIX', 'GIT_COMMON_DIR']) delete gitEnv[key];
let options;
let report;
let lockPath;
let lockOwned = false;
let state;
const steps = [];

function parseOptions() {
  const opts = { mode: 'dry-run', attempts: 2, delay: 4000 };
  const argv = process.argv.slice(2);
  let selectedMode;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (['--publish', '--dry-run', '--retry-live'].includes(arg)) {
      if (selectedMode && selectedMode !== arg) throw new Error('Yalnız bir mode seçin: --publish, --dry-run veya --retry-live');
      selectedMode = arg; opts.mode = arg.slice(2); continue;
    }
    if (!['--publish-repo', '--article', '--report', '--output', '--state', '--poll-attempts', '--poll-delay-ms', '--batch-file'].includes(arg)) throw new Error(`Bilinmeyen seçenek: ${arg}`);
    const value = argv[++i];
    if (!value || value.startsWith('--')) throw new Error(`${arg} için değer gerekli`);
    if (arg === '--publish-repo') opts.repo = value;
    if (arg === '--article') opts.slug = value;
    if (arg === '--batch-file') opts.batchFile = path.resolve(value);
    if (arg === '--report' || arg === '--output') opts.report = path.resolve(value);
    if (arg === '--state') opts.state = path.resolve(value);
    if (arg === '--poll-attempts') opts.attempts = Number(value);
    if (arg === '--poll-delay-ms') opts.delay = Number(value);
  }
  if (!opts.repo || !path.isAbsolute(opts.repo)) throw new Error('--publish-repo mutlak yerel clone kökü olmalı');
  if (!opts.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(opts.slug)) throw new Error('--article geçerli küçük harfli makale slug olmalı');
  if (!Number.isInteger(opts.attempts) || opts.attempts < 1 || opts.attempts > 5) throw new Error('--poll-attempts 1–5 olmalı');
  if (!Number.isInteger(opts.delay) || opts.delay < 0 || opts.delay > 10000) throw new Error('--poll-delay-ms 0–10000 olmalı');
  opts.repo = fs.realpathSync(opts.repo);
  if (opts.batchFile) {
    if (opts.mode === 'retry-live') throw new Error('Toplu retry yerine her makale için --retry-live kullanın');
    const batch = JSON.parse(fs.readFileSync(opts.batchFile, 'utf8'));
    if (!/^[a-z0-9-]{1,80}$/.test(batch.batchId ?? '') || !Array.isArray(batch.articles) || batch.articles.length < 2 || batch.articles.length > 20 ||
        batch.articles.some((slug) => typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) || new Set(batch.articles).size !== batch.articles.length || !batch.articles.includes(opts.slug))
      throw new Error('Toplu yayın listesi geçersiz: batchId ve 2–20 benzersiz geçerli makale gerekli');
    opts.batchId = batch.batchId; opts.slugs = batch.articles;
  } else opts.slugs = [opts.slug];
  opts.state ??= path.join(SOURCE, 'data/content-automation-state.json');
  opts.report ??= path.join(SOURCE, 'outputs/publication', `${dayInTurkey()}-${opts.slug}-${Date.now()}.json`);
  if (overlaps(opts.repo, SOURCE)) throw new Error('Yayın clone ile source birbirinin içinde veya aynı olamaz');
  if ((opts.batchFile && within(opts.repo, opts.batchFile)) || within(opts.repo, opts.state) || within(opts.repo, opts.report)) throw new Error('State/rapor yayın clone içine yazılamaz');
  return opts;
}
function within(root, target) {
  const rel = path.relative(root, target);
  return rel === '' || (!rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel));
}
function overlaps(a, b) { return within(a, b) || within(b, a); }
function safePath(root, rel) {
  if (!rel || path.isAbsolute(rel) || rel.includes('\0') || rel.split(/[\\/]/).some((s) => s === '..' || s.toLowerCase() === '.git')) throw new Error(`Güvensiz dosya yolu: ${rel}`);
  const full = path.resolve(root, rel);
  if (!within(root, full) || full === root) throw new Error(`Dosya root dışına çıkıyor: ${rel}`);
  let cursor = full;
  while (cursor !== root) {
    if (fs.existsSync(cursor) && fs.lstatSync(cursor).isSymbolicLink()) throw new Error(`Symlink/junction üzerinden yazma reddedildi: ${rel}`);
    cursor = path.dirname(cursor);
  }
  return full;
}
function git(args, { allowFailure = false } = {}) {
  try { return execFileSync('git', ['-C', options.repo, ...args], { encoding: 'utf8', env: gitEnv, maxBuffer: 32 * 1024 * 1024, timeout: 120000, windowsHide: true }).trimEnd(); }
  catch (error) {
    if (allowFailure) return null;
    throw new Error(`Git ${args[0]} başarısız: ${String(error.stderr ?? error.message).trim()}`);
  }
}
function step(name, action) { console.log(name); action(); steps.push({ name, completedAt: now() }); }
function cleanPublication() {
  if (git(['status', '--porcelain=v1', '--untracked-files=all']).trim()) throw new Error('Yayın clone temiz değil; kullanıcı değişiklikleri korunuyor, yayın durduruldu');
}
function trackedTree(ref) {
  const result = new Map();
  const raw = git(['ls-tree', '-r', '-z', ref]);
  for (const item of raw.split('\0').filter(Boolean)) {
    const m = item.match(/^(\d+) (\w+) ([a-f0-9]+)\t([\s\S]+)$/);
    if (!m || m[2] !== 'blob') throw new Error('Yayın tree beklenmeyen submodule/non-blob içeriyor');
    safePath(options.repo, m[4]);
    if (m[1] === '120000') throw new Error(`Yayın clone symlink içeriyor: ${m[4]}`);
    result.set(m[4], { object: m[3], mode: m[1] });
  }
  return result;
}
function collectFiles(root) {
  if (!fs.existsSync(root)) return [];
  const result = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Source/build symlink desteklenmiyor: ${full}`);
    if (entry.isDirectory()) result.push(...collectFiles(full));
    else if (entry.isFile()) result.push(full);
  }
  return result;
}
function sourceSnapshot() {
  const files = ['src', 'public', 'scripts', 'tests'].flatMap((dir) => collectFiles(path.join(SOURCE, dir)));
  for (const name of ['package.json', 'package-lock.json', 'astro.config.mjs', 'tsconfig.json']) if (fs.existsSync(path.join(SOURCE, name))) files.push(path.join(SOURCE, name));
  return Object.fromEntries(files.sort().map((file) => [path.relative(SOURCE, file), sha(fs.readFileSync(file))]));
}
function loadState() {
  if (!fs.existsSync(options.state)) return { version: 1, timezone: 'Europe/Istanbul', publications: [] };
  const value = JSON.parse(fs.readFileSync(options.state, 'utf8'));
  if (value.version !== 1 || !Array.isArray(value.publications)) throw new Error('State şeması geçersiz; mevcut dosya değiştirilmedi');
  return value;
}
function lockState() {
  lockPath = `${options.state}.lock`;
  fs.mkdirSync(path.dirname(lockPath), { recursive: true });
  let fd;
  try { fd = fs.openSync(lockPath, 'wx'); }
  catch { throw new Error(`İçerik yayın kilidi mevcut: ${lockPath}. Diğer süreç tamamlanmadan tekrar yayın yapılmaz.`); }
  fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, startedAt: now(), slug: options.slug }));
  fs.closeSync(fd); lockOwned = true;
}
function saveState() {
  const temp = `${options.state}.${process.pid}.tmp`;
  fs.mkdirSync(path.dirname(options.state), { recursive: true });
  fs.writeFileSync(temp, `${JSON.stringify(state, null, 2)}\n`, { flag: 'wx' });
  fs.renameSync(temp, options.state);
}
function runVerification() {
  const pkg = JSON.parse(fs.readFileSync(path.join(SOURCE, 'package.json'), 'utf8'));
  if (!pkg.scripts?.verify || !pkg.scripts?.build) throw new Error('package build/verify komutları gerekli');
  const runNpm = (name) => {
    const exe = process.platform === 'win32' ? (process.env.ComSpec || 'cmd.exe') : 'npm';
    const args = process.platform === 'win32' ? ['/d', '/s', '/c', `npm run ${name}`] : ['run', name];
    const result = spawnSync(exe, args, { cwd: SOURCE, env: gitEnv, stdio: 'inherit', timeout: 600000, windowsHide: true });
    if (result.error || result.status !== 0) throw new Error(`npm run ${name} başarısız; yayın yapılmadı (${result.error?.message ?? result.status})`);
  };
  if (!/\bastro\s+build\b|\bnpm\s+run\s+build\b/.test(pkg.scripts.verify)) runNpm('build');
  runNpm('verify');
  // Paket komutu ileride düzenlense bile SEO graph denetimi bu kapıda zorunludur.
  if (!pkg.scripts.verify.includes('scripts/verify-seo.mjs')) {
    const seo = spawnSync(process.execPath, [path.join(SOURCE, 'scripts/verify-seo.mjs')], { cwd: SOURCE, env: gitEnv, stdio: 'inherit', timeout: 120000, windowsHide: true });
    if (seo.error || seo.status !== 0) throw new Error('Bağımsız SEO build denetimi başarısız; yayın yapılmadı');
  }
}
const decode = (s) => String(s).replace(/&#(x[\da-f]+|\d+);/gi, (_, n) => String.fromCodePoint(n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n)))
  .replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&nbsp;', ' ');
function articleExpectation(html, slug = options.slug) {
  const graphs = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => JSON.parse(m[1]));
  const nodes = graphs.flatMap((g) => g['@graph'] ?? [g]);
  const article = nodes.find((n) => [n['@type']].flat().includes('Article'));
  const canonical = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1];
  if (!article || canonical !== `${SITE}/blog/${slug}`) throw new Error('Makale HTML/Article canonical beklentisi geçersiz');
  const body = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1];
  if (!body) throw new Error('Makale gövdesi yok');
  const bodyText = decode(body.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
  return { canonical, headline: article.headline, datePublished: article.datePublished, dateModified: article.dateModified,
    wordCount: article.wordCount, bodyTextSha256: sha(bodyText), htmlSha256: sha(html) };
}
async function readLive(url, fetchOptions = {}) {
  const res = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000), headers: { 'Cache-Control': 'no-cache', ...fetchOptions.headers }, ...fetchOptions });
  const length = Number(res.headers.get('content-length') ?? 0);
  if (length > 2 * 1024 * 1024) throw new Error('Canlı yanıt 2MB sınırını aşıyor');
  const body = await res.text();
  if (Buffer.byteLength(body) > 2 * 1024 * 1024) throw new Error('Canlı yanıt 2MB sınırını aşıyor');
  return { status: res.status, body, location: res.headers.get('location') };
}
async function verifyLive(expected) {
  const observations = [];
  for (let attempt = 1; attempt <= options.attempts; attempt++) {
    try {
      const live = await readLive(expected.canonical);
      const observed = { attempt, at: now(), status: live.status, location: live.location, matches: false };
      if (live.status === 200) {
        try {
          const actual = articleExpectation(live.body, new URL(expected.canonical).pathname.split('/').at(-1));
          observed.matches = ['canonical', 'headline', 'datePublished', 'dateModified', 'wordCount', 'bodyTextSha256'].every((key) => actual[key] === expected[key]);
          observed.htmlSha256 = actual.htmlSha256;
        } catch (error) { observed.detail = error.message; }
      }
      observations.push(observed);
      if (observed.matches) return { verified: true, observations };
    } catch (error) { observations.push({ attempt, at: now(), matches: false, error: error.message }); }
    if (attempt < options.attempts) await new Promise((resolve) => setTimeout(resolve, options.delay));
  }
  return { verified: false, observations };
}
async function submitIndexNow(articleUrl) {
  try {
    const keyFile = fs.readdirSync(path.join(SOURCE, 'public')).find((f) => /^[a-f0-9]{32}\.txt$/i.test(f));
    if (!keyFile) throw new Error('IndexNow anahtar dosyası yok');
    const key = keyFile.slice(0, -4);
    const keyUrl = `${SITE}/${keyFile}`;
    const liveKey = await readLive(keyUrl);
    if (liveKey.status !== 200 || liveKey.body.trim() !== key) throw new Error('Canlı IndexNow anahtarı doğrulanmadı');
    const response = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(15000), headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key, keyLocation: keyUrl, urlList: [articleUrl] }) });
    if (![200, 202].includes(response.status)) return { status: 'failed', httpStatus: response.status, urlCount: 1 };
    return { status: response.status === 202 ? 'accepted_key_validation_pending' : 'submitted', httpStatus: response.status, urlCount: 1,
      note: 'Kabul, indekslenme veya Google sıralaması garantisi değildir.' };
  } catch (error) { return { status: 'failed', error: error.message, urlCount: 1 }; }
}
async function finishLive(publication) {
  if (publication.expected?.canonical !== `${SITE}/blog/${publication.slug}`) throw new Error('State makale canonical URL bu site/slug ile uyuşmuyor');
  report.live = await verifyLive(publication.expected);
  if (!report.live.verified) {
    publication.status = 'pushed_waiting_manual_pull';
    report.status = 'pushed_waiting_manual_pull';
    report.action = 'Plesk Şimdi çek / Şimdi dağıt sonrası aynı slug ile --retry-live çalıştırın. Yeni makale push edilmez.';
    report.indexNow = { status: 'not_submitted_article_not_live' };
  } else {
    publication.status = 'live_verified'; publication.liveVerifiedAt = now();
    report.status = 'live_verified';
    report.indexNow = publication.indexNow?.httpStatus === 200 || publication.indexNow?.httpStatus === 202
      ? { ...publication.indexNow, repeated: false } : await submitIndexNow(publication.expected.canonical);
    publication.indexNow = report.indexNow;
  }
  saveState();
}

async function finishPublications(publications) {
  report.articleResults = [];
  for (const publication of publications) {
    await finishLive(publication);
    report.articleResults.push({ slug: publication.slug, status: publication.status, live: report.live, indexNow: report.indexNow });
  }
  report.status = publications.every((p) => p.status === 'live_verified') ? 'live_verified' : 'pushed_waiting_manual_pull';
}

async function main() {
  options = parseOptions();
  report = { startedAt: now(), day: dayInTurkey(), timezone: 'Europe/Istanbul', mode: options.mode,
    article: options.slug, source: SOURCE, publicationRepo: options.repo, status: 'running', pushed: false, steps };
  // source article is never created/edited by this command.
  const articleSource = safePath(SOURCE, `src/content/blog/${options.slug}.md`);
  if (!fs.existsSync(articleSource)) throw new Error(`Kaynak makale yok: ${options.slug}`);
  const sourceArticleSha256 = sha(fs.readFileSync(articleSource));
  const sourceArticles = options.slugs.map((slug) => {
    const file = safePath(SOURCE, `src/content/blog/${slug}.md`);
    const text = fs.readFileSync(file, 'utf8');
    const front = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    const date = front.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
    if (!date || date > report.day) throw new Error(`Makale tarihi yok/gelecekte: ${slug}`);
    return { slug, sourceArticleSha256: sha(fs.readFileSync(file)) };
  });
  const batchSha256 = options.batchId ? sha(JSON.stringify(sourceArticles)) : undefined;
  report.batchId = options.batchId; report.articles = options.slugs;
  const sourceFrontmatter = fs.readFileSync(articleSource, 'utf8').match(/^---\s*\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  const sourceDate = sourceFrontmatter.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
  if (!sourceDate || sourceDate > report.day) throw new Error('Makale yayın tarihi yok veya Türkiye gününe göre gelecekte; erken yayın yapılmadı');
  if (options.mode !== 'dry-run') lockState();
  state = loadState();
  const previous = state.publications.findLast((p) => p.slug === options.slug && p.pushedAt);
  if (options.mode === 'retry-live') {
    if (!previous?.expected) throw new Error('--retry-live için bu slug üzerinde kayıtlı başarılı push gerekli');
    report.commit = previous.commit; report.pushed = false; report.priorPush = true;
    await finishLive(previous); return;
  }
  const today = state.publications.filter((p) => p.day === report.day && p.pushedAt);
  // Aynı içeriği tekrar gönderme; başka gündeki esaslı güncellemeyi engelleme.
  if (!options.batchId && previous?.sourceArticleSha256 === sourceArticleSha256 && options.mode === 'publish') { report.commit = previous.commit; report.priorPush = true; await finishLive(previous); return; }
  if (options.batchId && options.mode === 'publish') {
    const priorBatch = options.slugs.map((slug) => state.publications.findLast((p) => p.slug === slug && p.batchId === options.batchId && p.batchSha256 === batchSha256 && p.pushedAt));
    if (priorBatch.every(Boolean)) { report.priorPush = true; report.commit = priorBatch[0].commit; await finishPublications(priorBatch); return; }
  }
  if (today.length && !options.batchId) throw new Error(`Türkiye günü ${report.day} için bir içerik zaten push edildi (${today[0].slug}); ikinci yayın/güncelleme durduruldu`);
  if (fs.realpathSync(git(['rev-parse', '--show-toplevel'])) !== options.repo) throw new Error('--publish-repo Git çalışma ağacının tam kökü olmalı');
  if (git(['branch', '--show-current']) !== 'main') throw new Error('Yayın clone main dalında olmalı');
  const remoteUrl = git(['remote', 'get-url', 'origin']);
  if (!EXPECTED_REMOTE.test(remoteUrl)) throw new Error('origin kullanıcı tarafından seçilen mertcanasdf/mib-site reposu değil');
  cleanPublication();
  step('Origin main güncel durumu alınıyor', () => git(['fetch', 'origin', 'main']));
  const remoteHead = git(['rev-parse', 'origin/main']);
  const localHead = git(['rev-parse', 'HEAD']);
  const knownPrepared = state.publications.findLast((p) => p.slug === options.slug && p.status === 'prepared_not_pushed' && p.commit === localHead && p.parent === remoteHead);
  if (localHead !== remoteHead && !knownPrepared && git(['merge-base', '--is-ancestor', 'HEAD', 'origin/main'], { allowFailure: true }) === null)
    throw new Error('Yayın clone origin/main ile ayrışmış veya tanınmayan yerel commit var; geçmişe müdahale edilmedi');
  if (knownPrepared && options.mode === 'publish') {
    if (knownPrepared.sourceArticleSha256 !== sourceArticleSha256 || (options.batchId && knownPrepared.batchSha256 !== batchSha256)) throw new Error('Hazırlanmış commit sonrasında makale değişmiş; eski içerik otomatik gönderilmedi');
    if (knownPrepared.day !== report.day) throw new Error('Önceki günden push edilmemiş commit var; otomatik yeni günlük yayın yapılmadı');
    step('Bilinen başarısız push commit yeniden gönderiliyor', () => git(['push', 'origin', 'HEAD:main']));
    report.commit = localHead; report.pushed = true;
    const prepared = options.batchId ? state.publications.filter((p) => p.commit === localHead && p.batchId === options.batchId) : [knownPrepared];
    for (const p of prepared) { p.pushedAt = now(); p.status = 'pushed_waiting_manual_pull'; } saveState();
    await finishPublications(prepared); return;
  }
  const before = sourceSnapshot();
  step('Source build ve tüm verify kapıları', runVerification);
  const after = sourceSnapshot();
  if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Build sırasında source/public/scripts/tests değişti; yayın durduruldu, mevcut değişiklikler korunuyor');
  report.sourcePreserved = true;
  const dist = path.join(SOURCE, 'dist');
  const objects = git(['rev-parse', '--show-object-format']) === 'sha256' ? 'sha256' : 'sha1';
  const manifest = collectFiles(dist).map((file) => {
    const relative = path.relative(dist, file).replaceAll('\\', '/'); safePath(dist, relative); safePath(options.repo, relative);
    const buffer = fs.readFileSync(file);
    const object = crypto.createHash(objects).update(`blob ${buffer.length}\0`).update(buffer).digest('hex');
    return { path: relative, bytes: buffer.length, sha256: sha(buffer), object };
  }).sort((a, b) => a.path.localeCompare(b.path));
  if (!manifest.length || !['.htaccess', 'robots.txt', 'sitemap.xml', `blog/${options.slug}.html`].every((f) => manifest.some((m) => m.path === f)))
    throw new Error('dist yayın için gerekli Apache/robots/sitemap/makale dosyalarını içermiyor');
  const expectedArticles = sourceArticles.map((entry) => ({ ...entry, expected: articleExpectation(fs.readFileSync(path.join(dist, 'blog', `${entry.slug}.html`), 'utf8'), entry.slug) }));
  const expected = expectedArticles.find((p) => p.slug === options.slug).expected;
  const tree = trackedTree('origin/main');
  const newArticles = manifest.filter((m) => /^blog\/[^/]+\.html$/.test(m.path) && !tree.has(m.path)).map((m) => m.path);
  if (newArticles.length > options.slugs.length || newArticles.some((file) => !options.slugs.some((slug) => file === `blog/${slug}.html`))) throw new Error('Listede bulunmayan yeni makale bulundu; yayın durduruldu');
  report.newArticles = newArticles;
  const paths = new Set(manifest.map((m) => m.path));
  const staleAssets = [...tree.keys()].filter((file) => /^(?:_astro|assets)\//.test(file) && !paths.has(file));
  const changed = manifest.filter((m) => tree.get(m.path)?.object !== m.object).map((m) => m.path);
  report.baseCommit = remoteHead;
  report.manifest = { files: manifest.map(({ object, ...item }) => item), fileCount: manifest.length, bytes: manifest.reduce((sum, m) => sum + m.bytes, 0), changed, staleTrackedAssets: staleAssets,
    preservedTrackedFiles: [...tree.keys()].filter((file) => !paths.has(file) && !staleAssets.includes(file)) };
  report.expected = expected; report.expectedArticles = expectedArticles;
  if (options.mode === 'dry-run') { report.status = 'dry_run_verified_no_push'; report.wouldFastForward = localHead !== remoteHead; return; }
  if (localHead !== remoteHead) {
    const oldTree = trackedTree('HEAD');
    for (const file of tree.keys()) {
      const target = safePath(options.repo, file);
      if (fs.existsSync(target) && !oldTree.has(file)) throw new Error(`Fast-forward bilinmeyen/ignored dosyanın üzerine yazabilir: ${file}`);
    }
    step('Yayın clone yalnız fast-forward güncelleniyor', () => git(['merge', '--ff-only', 'origin/main']));
  }
  cleanPublication();
  const currentTracked = trackedTree('HEAD');
  for (const m of manifest) {
    const target = safePath(options.repo, m.path);
    if (fs.existsSync(target) && !currentTracked.has(m.path)) throw new Error(`Bilinmeyen/ignored dosya üzerine yazma durduruldu: ${m.path}`);
  }
  step('Doğrulanmış dist dosyaları yayın köküne kopyalanıyor', () => {
    for (const m of manifest) {
      const target = safePath(options.repo, m.path);
      // Git autocrlf çalışma ağacı satır sonlarını değiştirmiş olabilir; byte manifestini koru.
      if (!fs.existsSync(target) || sha(fs.readFileSync(target)) !== m.sha256) {
        fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(safePath(dist, m.path), target);
      }
    }
    for (const file of staleAssets) {
      if (!currentTracked.has(file)) throw new Error(`Stale asset tracked değil: ${file}`);
      const target = safePath(options.repo, file);
      if (fs.existsSync(target)) fs.unlinkSync(target);
    }
    for (const m of manifest) if (sha(fs.readFileSync(safePath(options.repo, m.path))) !== m.sha256)
      throw new Error(`Kopya hash uyuşmazlığı: ${m.path}`);
  });
  const stagePaths = [...new Set([...changed, ...staleAssets])];
  if (!stagePaths.length) { report.status = 'no_changes_no_push'; report.action = 'Yayın dosyaları origin/main ile aynı; --retry-live yalnız kayıtlı push için kullanılabilir.'; return; }
  const allowed = new Set(stagePaths);
  // İlk copy öncesi temizdi; bundan sonra ilgisiz dosya değişirse kullanıcı dosyası commit edilmez.
  const unstaged = git(['diff', '--name-only', '-z']).split('\0').filter(Boolean);
  if (unstaged.some((file) => !allowed.has(file))) throw new Error('Kopya sırasında yayın clone üzerinde ilgisiz değişiklik oluştu; commit yapılmadı');
  for (let start = 0; start < stagePaths.length; start += 80) git(['add', '--all', '--', ...stagePaths.slice(start, start + 80)]);
  const staged = git(['diff', '--cached', '--name-only', '-z']).split('\0').filter(Boolean);
  if (staged.some((file) => !allowed.has(file))) throw new Error('Stage alanında görev dışı dosya var; commit durduruldu');
  step('Push öncesi origin değişiklik yarışı kontrolü', () => git(['fetch', 'origin', 'main']));
  if (git(['rev-parse', 'origin/main']) !== remoteHead || git(['rev-parse', 'HEAD']) !== remoteHead)
    throw new Error('Origin/yerel HEAD kopya sırasında değişti; üzerine yazılmadı, normal push yapılmadı');
  step('Yalnız build dosyaları commit ediliyor', () => git(['commit', '-m', options.batchId ? `Publish ${options.slugs.length} researched articles (${report.day})` : `Publish ${options.slug} (${report.day})`]));
  const commit = git(['rev-parse', 'HEAD']);
  report.commit = commit;
  const publications = expectedArticles.map((entry) => ({ day: report.day, ...entry, commit, parent: remoteHead, preparedAt: now(), status: 'prepared_not_pushed', ...(options.batchId ? { batchId: options.batchId, batchSha256 } : {}) }));
  state.publications.push(...publications); saveState();
  try { step('Main normal Git push', () => git(['push', 'origin', 'HEAD:main'])); }
  catch (error) {
    // Ağ yanıtı kaybolmuşsa push zaten başarılı olabilir; remote commit ile doğrula.
    git(['fetch', 'origin', 'main']);
    if (git(['rev-parse', 'origin/main']) !== commit) throw error;
    report.pushRecovery = 'Push yanıtı hatalıydı; origin/main commit ile başarı doğrulandı';
  }
  report.pushed = true;
  for (const publication of publications) { publication.pushedAt = now(); publication.status = 'pushed_waiting_manual_pull'; } saveState();
  await finishPublications(publications);
}

try { await main(); }
catch (error) {
  report ??= { startedAt: now(), status: 'error', pushed: false, steps };
  report.status = 'error'; report.error = error.message; process.exitCode = 1;
  console.error(`DURDURULDU: ${error.message}`);
} finally {
  if (lockOwned && lockPath && fs.existsSync(lockPath)) {
    try { if (JSON.parse(fs.readFileSync(lockPath, 'utf8')).pid === process.pid) fs.unlinkSync(lockPath); }
    catch { console.error('Yayın lock dosyası kaldırılmadı; elle incelenmeli.'); }
  }
  report ??= { status: 'error', pushed: false };
  report.completedAt = now();
  if (options?.report) {
    try { fs.mkdirSync(path.dirname(options.report), { recursive: true }); fs.writeFileSync(options.report, `${JSON.stringify(report, null, 2)}\n`); console.log(`Rapor: ${options.report}`); }
    catch (error) { console.error(`Rapor yazılamadı: ${error.message}`); process.exitCode = 1; }
  }
  console.log(`Durum: ${report.status}; bu çağrıda push: ${report.pushed ? 'evet' : 'hayır'}`);
}
