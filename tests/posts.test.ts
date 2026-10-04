import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sortPostsNewestFirst } from '../src/lib/posts.ts';

const post = (title: string, date: string) => ({ data: { title, date: new Date(date) } });
const titles = (posts: { data: { title: string } }[]) => posts.map((p) => p.data.title);

test('yeni tarihli yazı önce gelir', () => {
  const sorted = sortPostsNewestFirst([post('Eski', '2026-01-01'), post('Yeni', '2026-09-15')]);
  assert.deepEqual(titles(sorted), ['Yeni', 'Eski']);
});

test('aynı tarihli yazılar başlığa göre Türkçe alfabeyle sıralanır', () => {
  const sorted = sortPostsNewestFirst([
    post('Uyku', '2026-09-15'),
    post('Çay', '2026-09-15'),
    post('Cilt', '2026-09-15'),
  ]);
  assert.deepEqual(titles(sorted), ['Cilt', 'Çay', 'Uyku']);
});

test('girdi dizisini değiştirmez', () => {
  const input = [post('B', '2026-01-01'), post('A', '2026-09-15')];
  sortPostsNewestFirst(input);
  assert.deepEqual(titles(input), ['B', 'A']);
});
