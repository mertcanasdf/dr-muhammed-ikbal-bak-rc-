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

// Gönderim yöntemi (karar D1): sunucu gerektirmeyen WhatsApp; mesajı kullanıcı kendisi gönderir,
// form verisi bu sitede saklanmaz. 2026-10-06: kullanıcı kararıyla revizyon planı madde 14 geri alındı,
// hekimin numarası ve e-postası yeniden yayında. Boş bırakılırsa form gizlenir.
export const WHATSAPP_NUMBER = '905442244813';
export const WHATSAPP_DISPLAY = '0544 224 48 13';
export const PHONE_TEL = '+905442244813';
export const EMAIL = 'Muhammedikbalb@gmail.com';

// İş birliği, akademik ve medya talepleri için doğrulanmış profesyonel profil.
export const LINKEDIN_URL = 'https://www.linkedin.com/in/muhammed-ikbal-bakirci-221ab3243';

// Görev yeri ve hastane randevu bilgisi (Medical Park doktor profili ve Sağlık Bakanlığı healthturkiye kaydı).
export const WORKPLACE = {
  name: 'VM Medical Park Bursa Hastanesi',
  street: 'Kırcaali Mah. Fevzi Çakmak Cd. No:76',
  postalCode: '16220',
  locality: 'Osmangazi',
  region: 'Bursa',
  appointmentPhone: '444 44 84',
  appointmentTel: '+904444484',
  profileUrl: 'https://www.medicalpark.com.tr/hekimler/muhammed-ikbal-bakirci',
} as const;

/** WhatsApp'ta açılacak, alanları doldurulmuş mesaj bağlantısını üretir. */
export function buildWhatsAppUrl(input: ContactInput, number: string = WHATSAPP_NUMBER): string {
  const channel = CONTACT_CHANNELS.find((c) => c.id === input.channel)?.label ?? input.channel;
  const text = [
    `Konu: ${channel}`,
    `Ad Soyad: ${input.name.trim()}`,
    `E-posta: ${input.email.trim()}`,
    '',
    input.message.trim(),
  ].join('\n');
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
