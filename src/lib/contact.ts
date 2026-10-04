export type ContactChannelId = 'randevu' | 'is-birligi' | 'akademik' | 'medya';

export const CONTACT_CHANNELS: readonly { id: ContactChannelId; label: string; description: string }[] = [
  { id: 'randevu', label: 'Randevu', description: 'Medikal estetik ve skin longevity değerlendirmesi için randevu talebi.' },
  { id: 'is-birligi', label: 'İş Birliği', description: 'Kurumlar, markalar ve projeler için iş birliği önerileri.' },
  { id: 'akademik', label: 'Akademik', description: 'Kongre, konuşma, eğitim ve akademik çalışma davetleri.' },
  { id: 'medya', label: 'Medya', description: 'Röportaj, basın ve yayın talepleri.' },
];

export interface ContactInput {
  name: string;
  email: string;
  channel: string;
  message: string;
  consent: boolean;
}

export type ContactErrors = Partial<Record<keyof ContactInput, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};
  if (input.name.trim().length < 2) errors.name = 'Lütfen adınızı ve soyadınızı yazın.';
  if (!EMAIL_PATTERN.test(input.email.trim())) errors.email = 'Geçerli bir e-posta adresi yazın.';
  if (!CONTACT_CHANNELS.some((c) => c.id === input.channel)) errors.channel = 'Lütfen bir konu seçin.';
  if (input.message.trim().length < 10) errors.message = 'Mesajınız en az 10 karakter olmalı.';
  if (!input.consent) errors.consent = 'Devam etmek için aydınlatma metnini onaylayın.';
  return errors;
}

export type SubmitResult = { ok: true } | { ok: false; reason: 'not-configured' | 'failed' };

/**
 * Formu iletir. Gönderim yöntemi henüz seçilmedi (spec, karar D1).
 * Yöntem seçildiğinde yalnızca bu fonksiyon değişir; form ve doğrulama aynı kalır.
 */
export async function submitContact(_input: ContactInput): Promise<SubmitResult> {
  return { ok: false, reason: 'not-configured' };
}
