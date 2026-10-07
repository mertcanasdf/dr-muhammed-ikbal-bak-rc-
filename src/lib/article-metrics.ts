/** Reading estimates and Article.wordCount share the same visible Markdown prose. */
export function getArticleMetrics(markdown: string, wordsPerMinute = 200) {
  if (!Number.isFinite(wordsPerMinute) || wordsPerMinute <= 0) {
    throw new RangeError('Okuma hızı pozitif ve sonlu olmalıdır.');
  }

  // Sources and the repeated further-reading panel are outside the main explanation.
  const body = markdown.split(/^##\s+(?:Kaynaklar|Konuyu derinleştirmek için)\s*$/m)[0];
  const text = body
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s*\[[^\]]+\]:.*$/gm, ' ')
    .replace(/<https?:\/\/[^>]+>/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/^\s{0,3}(?:#{1,6}\s+|>\s*|[-*+]\s+|\d+[.)]\s+)/gm, '')
    .replace(/(?:\*\*|__|[*_`~|])/g, ' ')
    .replace(/&(?:amp|lt|gt|quot|apos|nbsp);/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  // Keep Turkish words, Unicode numerals and apostrophe suffixes together.
  const wordCount = (text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).length;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  return { text, wordCount, readingMinutes, readTime: `${readingMinutes} dk` };
}
