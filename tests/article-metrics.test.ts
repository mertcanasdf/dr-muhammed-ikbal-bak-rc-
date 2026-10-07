import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getArticleMetrics } from '../src/lib/article-metrics.ts';

test('Türkçe ana metni sayar; bağlantı adresleri, kaynaklar ve öneriler süreyi şişirmez', () => {
  const metrics = getArticleMetrics(`## Uyku nedir?
Yetişkinlerde [uyku kalitesi](https://example.com/a-very-long-url) önemlidir.
![Bilgilendirici görsel](image.webp)
<!-- görünmeyen sözcükler -->
## Konuyu derinleştirmek için
Başka yazılara bağlantılar.
## Kaynaklar
- [Kaynak adı](https://example.com)`);
  assert.equal(metrics.text, 'Uyku nedir? Yetişkinlerde uyku kalitesi önemlidir.');
  assert.equal(metrics.wordCount, 6);
  assert.equal(metrics.readTime, '1 dk');
});

test('aynı ana gövdeden süre sınırını ve wordCount değerini üretir', () => {
  const exactly = getArticleMetrics(Array(200).fill('sağlık').join(' '));
  const over = getArticleMetrics(Array(201).fill('sağlık').join(' '));
  assert.equal(exactly.wordCount, 200);
  assert.equal(exactly.readingMinutes, 1);
  assert.equal(over.wordCount, 201);
  assert.equal(over.readingMinutes, 2);
});

test('kaynak listesi ilk dış bölümse yine ana metni esas alır', () => {
  const result = getArticleMetrics("NAD+ ve Türkiye'de sağlık.\n## Kaynaklar\nKaynak başlığı.");
  assert.equal(result.wordCount, 4);
  assert.equal(result.text, "NAD+ ve Türkiye'de sağlık.");
  assert.equal(getArticleMetrics('').readTime, '1 dk');
  assert.throws(() => getArticleMetrics('metin', 0), RangeError);
});
