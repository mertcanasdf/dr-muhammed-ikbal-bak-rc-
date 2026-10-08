// SEO otomasyon betiklerinin ortak yardımcıları: yazı listesi, kelime sayısı, tarih, JSON kayıt.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getArticleMetrics } from '../../src/lib/article-metrics.ts';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const SITE = 'https://www.muhammedikbalbakirci.com';
export const GSC_PROPERTY = 'sc-domain:muhammedikbalbakirci.com';
export const DATA = path.join(ROOT, 'data/seo');
fs.mkdirSync(DATA, { recursive: true });

/** Türkiye saatine göre YYYY-MM-DD (Codex 10.00'da çalışır; UTC gün kaymasın). */
export const trDay = (d = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
/** 1 = Pazartesi … 7 = Pazar, Türkiye saatine göre. */
export const trWeekday = (d = new Date()) =>
  ({ Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 })[
    new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Istanbul', weekday: 'short' }).format(d)
  ];
export const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

export const readJson = (file, fallback = null) => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
};
export const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
};

const field = (front, key) => front.match(new RegExp(`^${key}:\\s*"?([^"\\r\\n]*)"?\\s*$`, 'm'))?.[1]?.trim();

/** Tüm yazılar: slug, url, başlık, kategori, tarih, güncelleme, gövde kelime sayısı, kaynak sayısı, dış bağlantılar. */
export function loadArticles() {
  const dir = path.join(ROOT, 'src/content/blog');
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    const front = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    const body = raw.slice(raw.indexOf('---', 3) + 3);
    const slug = f.replace(/\.md$/, '');
    const refs = body.split(/^## Kaynaklar\s*$/m)[1] ?? '';
    return {
      slug,
      url: `${SITE}/blog/${slug}`,
      title: field(front, 'title') ?? slug,
      seoTitle: field(front, 'seoTitle'),
      description: field(front, 'description') ?? '',
      category: field(front, 'category') ?? '',
      date: field(front, 'date'),
      updated: field(front, 'updated'),
      words: getArticleMetrics(body).wordCount,
      sources: (refs.match(/^\s*(?:[-*]|\d+\.)\s+/gm) ?? []).length,
      links: [...body.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]),
      file: path.join(dir, f),
    };
  });
}
