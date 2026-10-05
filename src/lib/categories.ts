/**
 * İçerik kütüphanesinin 6 ana kategorisi (revizyon planı, madde 8).
 * İçerik şeması, filtre düğmeleri ve sayfa listeleri bu listeyi kullanır;
 * listede olmayan bir kategori build'i durdurur.
 */
export const BLOG_CATEGORIES = [
  'Longevity Bilimi',
  'Beslenme',
  'Hareket',
  'Uyku',
  'Zihin & Sosyal Yaşam',
  'Skin Longevity',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
