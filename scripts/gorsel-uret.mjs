// Codex (ChatGPT hesabı, gpt-6-luna) ile site görsellerini üretir.
//
//   node scripts/gorsel-uret.mjs --ids a,b,c      seçilenleri üret -> gorsel-taslak/<id>.webp
//   node scripts/gorsel-uret.mjs --hepsi          listedeki taslağı olmayan her görseli üret
//   node scripts/gorsel-uret.mjs --uygula a,b,c   onaylanan taslakları sitedeki hedef yollarına kopyala
//
// Liste: scripts/gorsel-listesi.json  ·  Sanat yönü: docs/gorsel-sanat-yonu.md (STYLE bloğu)
// Her çalıştırmanın kaydı: .gorsel-kayit/<id>/ (görev, Codex'in son mesajı, ham PNG, olaylar)
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIST = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/gorsel-listesi.json'), 'utf8'));
const STYLE = fs.readFileSync(path.join(ROOT, 'docs/gorsel-sanat-yonu.md'), 'utf8').match(/## STYLE[\s\S]*?```\n([\s\S]*?)```/)[1].trim();
const DRAFTS = path.join(ROOT, 'gorsel-taslak');
const LOGS = path.join(ROOT, '.gorsel-kayit');
const CODEX = path.join(execSync('npm root -g').toString().trim(), '@openai', 'codex', 'bin', 'codex.js');
const PARALLEL = 2;

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const byId = Object.fromEntries(LIST.map((g) => [g.id, g]));

// Codex ürettiği her görseli kendiliğinden ~/.codex/generated_images/<thread_id>/ altına PNG olarak kaydeder.
// Bu yüzden Codex'ten dosya yazmasını istemiyoruz (salt okunur çalışır); oturumun son görselini biz alırız.
const GENERATED = path.join(process.env.USERPROFILE ?? process.env.HOME, '.codex', 'generated_images');

function task(g) {
  return `Görevin: görsel üretim aracınla TEK bir görsel üretmek. Komut çalıştırma, dosya yazma, kod yazma.
Görsel kendiliğinden kaydedilir; kaydetmekle uğraşma.

SUBJECT:
${g.konu}

${STYLE}

Adımlar:
1. Görseli yatay 3:2 (1536x1024) olarak BİR KEZ üret.
2. Üretilen görsele bak. Yalnızca şunlardan biri varsa yeniden üret (en fazla 2 kez): görselde herhangi bir yazı/harf/rakam/logo,
   gerçek/ünlü birine benzeyen yüz, fazladan ya da bozuk parmak, cilde batan iğne, kan, önce/sonra kurgusu.
3. Son ürettiğin görsel kullanılacak. Son mesajında tek satırla görselde ne olduğunu yaz.`;
}

function runCodex(g) {
  const dir = path.join(LOGS, g.id);
  fs.mkdirSync(dir, { recursive: true });
  const prompt = task(g);
  fs.writeFileSync(path.join(dir, 'gorev.md'), prompt);
  const codexArgs = [
    CODEX, 'exec', '-m', 'gpt-6-luna',
    '-c', 'model_reasoning_effort="medium"',
    '-c', 'approval_policy="never"',
    '-s', 'read-only',
    '-C', ROOT, '--skip-git-repo-check', '--json',
    '-o', path.join(dir, 'son-mesaj.md'),
  ];
  return new Promise((resolve) => {
    const events = fs.createWriteStream(path.join(dir, 'olaylar.jsonl'));
    const child = spawn(process.execPath, codexArgs, { cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] });
    let threadId = null;
    let buffer = '';
    child.stdout.on('data', (chunk) => {
      events.write(chunk);
      buffer += chunk;
      const m = !threadId && buffer.match(/"thread_id":"([^"]+)"/);
      if (m) threadId = m[1];
    });
    let err = '';
    child.stderr.on('data', (d) => { err += d; });
    child.stdin.end(prompt);
    child.on('close', (code) => {
      events.end();
      // Oturumun en son üretilen görseli = Codex'in onayladığı görsel.
      const sessionDir = threadId && path.join(GENERATED, threadId);
      const pngs = sessionDir && fs.existsSync(sessionDir)
        ? fs.readdirSync(sessionDir).filter((f) => f.endsWith('.png')).map((f) => path.join(sessionDir, f))
          .sort((a, b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs)
        : [];
      resolve({ code, png: pngs.at(-1), count: pngs.length, err: err.slice(-500) });
    });
  });
}

async function produce(g) {
  const started = Date.now();
  const { code, png, count, err } = await runCodex(g);
  const secs = Math.round((Date.now() - started) / 1000);
  if (!png) return `✗ ${g.id} (${secs} sn): görsel üretilmedi, çıkış ${code}. ${err}`;
  fs.copyFileSync(png, path.join(LOGS, g.id, `${g.id}.png`));
  fs.mkdirSync(DRAFTS, { recursive: true });
  const out = path.join(DRAFTS, `${g.id}.webp`);
  await sharp(png).resize(1200, 800, { fit: 'cover', position: 'attention' }).webp({ quality: 82 }).toFile(out);
  return `✓ ${g.id} (${secs} sn, ${count} deneme) -> gorsel-taslak/${g.id}.webp`;
}

async function pool(items, worker) {
  const queue = [...items];
  const runners = Array.from({ length: Math.min(PARALLEL, queue.length) }, async () => {
    while (queue.length) console.log(await worker(queue.shift()));
  });
  await Promise.all(runners);
}

if (opt('--uygula')) {
  for (const id of opt('--uygula').split(',')) {
    const g = byId[id];
    const draft = path.join(DRAFTS, `${id}.webp`);
    if (!g || !fs.existsSync(draft)) { console.error(`✗ ${id}: liste kaydı ya da taslak yok`); process.exitCode = 1; continue; }
    const target = path.join(ROOT, 'public', g.hedef);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(draft, target);
    console.log(`✓ ${id} -> public/${g.hedef}`);
  }
} else {
  const kategori = opt('--kategori'); // ör. --kategori makale
  const ids = args.includes('--hepsi')
    ? LIST.filter((g) => (!kategori || g.kategori === kategori) && !fs.existsSync(path.join(DRAFTS, `${g.id}.webp`))).map((g) => g.id)
    : (opt('--ids') ?? '').split(',').filter(Boolean);
  const unknown = ids.filter((id) => !byId[id]);
  if (!ids.length || unknown.length) {
    console.error(unknown.length ? `Listede olmayan: ${unknown.join(', ')}` : 'Kullanım: --ids a,b | --hepsi | --uygula a,b');
    process.exit(1);
  }
  console.log(`${ids.length} görsel üretilecek (paralel ${PARALLEL}).`);
  await pool(ids.map((id) => byId[id]), produce);
}
