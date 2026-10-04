import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONTACT_CHANNELS, validateContact, submitContact, type ContactInput } from '../src/lib/contact.ts';

const valid: ContactInput = {
  name: 'Ayşe Yılmaz',
  email: 'ayse@example.com',
  channel: 'medya',
  message: 'Röportaj talebimiz hakkında bilgi almak istiyoruz.',
  consent: true,
};

test('dört kanal tanımlı ve sırası sabit', () => {
  assert.deepEqual(CONTACT_CHANNELS.map((c) => c.id), ['randevu', 'is-birligi', 'akademik', 'medya']);
});

test('geçerli girdi hata üretmez', () => {
  assert.deepEqual(validateContact(valid), {});
});

test('boş form her alan için hata üretir', () => {
  const errors = validateContact({ name: '', email: '', channel: '', message: '', consent: false });
  assert.deepEqual(Object.keys(errors).sort(), ['channel', 'consent', 'email', 'message', 'name']);
});

test('yalnızca boşluktan oluşan ad geçersizdir', () => {
  assert.ok(validateContact({ ...valid, name: '   ' }).name);
});

test('geçersiz e-posta reddedilir', () => {
  assert.ok(validateContact({ ...valid, email: 'ayse@' }).email);
  assert.ok(validateContact({ ...valid, email: 'ayse example.com' }).email);
});

test('tanımsız kanal reddedilir', () => {
  assert.ok(validateContact({ ...valid, channel: 'kurs' }).channel);
});

test('10 karakterden kısa mesaj reddedilir', () => {
  assert.ok(validateContact({ ...valid, message: 'Merhaba' }).message);
});

test('onay verilmeden gönderilemez', () => {
  assert.ok(validateContact({ ...valid, consent: false }).consent);
});

test('gönderim yöntemi seçilene kadar submitContact not-configured döner', async () => {
  assert.deepEqual(await submitContact(valid), { ok: false, reason: 'not-configured' });
});
