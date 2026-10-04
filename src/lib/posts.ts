interface DatedPost {
  data: { date: Date; title: string };
}

/**
 * En yeni yazı önce gelir. Aynı tarihli yazılar başlığa göre (Türkçe alfabe) sıralanır;
 * böylece her build aynı sırayı ve aynı "son 3 yazı" seçimini üretir.
 */
export function sortPostsNewestFirst<T extends DatedPost>(posts: readonly T[]): T[] {
  return [...posts].sort(
    (a, b) =>
      b.data.date.getTime() - a.data.date.getTime() ||
      a.data.title.localeCompare(b.data.title, 'tr'),
  );
}
