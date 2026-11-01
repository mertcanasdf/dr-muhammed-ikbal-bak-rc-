// Codex görsel üretemediğinde (kullanım limiti) yazıya geçici Unsplash kapağı koyar.
//   node scripts/stok-kapak.mjs --slug <yazı> --url <images.unsplash.com/photo-...> --sayfa <unsplash.com/photos/ID> --fotografci "Ad"
// Fotoğraf aranması tarayıcı panelinde yapılır (unsplash.com/napi/search/photos?query=...; curl 401 alır),
// görsel dosyası ise images.unsplash.com CDN'inden indirilir. Yalnız ücretsiz Unsplash lisanslı fotoğraf (Unsplash+ değil).
// Çıktı: public/assets/images/generated/articles/<slug>.webp (1200×800) + -600 küçüğü + docs/gorsel-kaynaklari.md kaydı.
// Codex açılınca kapak yine scripts/gorsel-uret.mjs ile üretilip bu dosyanın üzerine yazılabilir.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const slug = opt('--slug'), url = opt('--url'), page = opt('--sayfa'), author = opt('--fotografci');
if (!slug || !url || !page || !author) {
  console.error('Kullanım: --slug <yazı> --url <images.unsplash.com/...> --sayfa <unsplash.com/photos/ID> --fotografci "Ad"');
  process.exit(1);
}
if (!/^https:\/\/images\.unsplash\.com\/photo-/.test(url)) throw new Error('--url images.unsplash.com/photo-... olmalı (plus.unsplash.com ücretli Unsplash+ görselidir)');
if (!fs.existsSync(path.join(ROOT, 'src/content/blog', `${slug}.md`))) throw new Error(`Yazı yok: src/content/blog/${slug}.md`);
// Sitede aynı görsel iki kez kullanılmaz: bu Unsplash fotoğrafı başka bir yerde kayıtlıysa reddet.
const photoId = page.split('/').filter(Boolean).pop();
const usedBy = fs.readFileSync(path.join(ROOT, 'docs/gorsel-kaynaklari.md'), 'utf8').split('\n')
  .find((l) => l.includes(`/photos/${photoId}`) && !l.startsWith(`| \`generated/articles/${slug}.webp\``));
if (usedBy) throw new Error(`Bu fotoğraf sitede zaten kullanılıyor, başka bir fotoğraf seç: ${usedBy}`);

const src = new URL(url);
src.searchParams.set('w', '1800');
src.searchParams.set('q', '85');
src.searchParams.set('fm', 'jpg');
const res = await fetch(src);
if (!res.ok) throw new Error(`İndirme başarısız: HTTP ${res.status}`);
const out = path.join(ROOT, 'public/assets/images/generated/articles', `${slug}.webp`);
await sharp(Buffer.from(await res.arrayBuffer())).resize(1200, 800, { fit: 'cover', position: 'attention' }).webp({ quality: 80 }).toFile(out);
console.log(`Kapak yazıldı: ${path.relative(ROOT, out)}`);

const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/kucuk-gorseller.mjs')], { cwd: ROOT, encoding: 'utf8' });
if (r.status !== 0) throw new Error(`kucuk-gorseller başarısız: ${(r.stderr || r.stdout).trim()}`);

// Kaynakça: geçici stok kapaklar ayrı tabloda tutulur.
const doc = path.join(ROOT, 'docs/gorsel-kaynaklari.md');
let md = fs.readFileSync(doc, 'utf8');
const HEAD = '## Stok makale kapakları (geçici, Unsplash Lisansı)';
if (!md.includes(HEAD)) md = md.trimEnd() + `\n\n${HEAD}\n\nCodex görsel üretemediği günlerde kullanıldı (\`scripts/stok-kapak.mjs\`). Codex açılınca üretilen kapak bunların yerine geçebilir.\n\n| Dosya | Fotoğrafçı | Kaynak |\n|---|---|---|\n`;
const row = `| \`generated/articles/${slug}.webp\` | ${author} | ${page} |`;
md = md.split('\n').filter((l) => !l.startsWith(`| \`generated/articles/${slug}.webp\``)).join('\n').trimEnd() + `\n${row}\n`;
fs.writeFileSync(doc, md);
console.log('Kaynakça güncellendi: docs/gorsel-kaynaklari.md');
