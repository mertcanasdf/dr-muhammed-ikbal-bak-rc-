import { EMAIL, PHONE_TEL, WORKPLACE } from './contact';

export const SITE_URL = 'https://www.muhammedikbalbakirci.com';
export const SITE_NAME = 'Dr. Muhammed İkbal Bakırcı';
export const PERSON_NAME = 'Muhammed İkbal Bakırcı';
export const SITE_LOCALE = 'tr-TR';
// Varsayılan paylaşım görseli 1200x630; kişi şemasındaki görsel her zaman portredir.
export const DEFAULT_IMAGE = `${SITE_URL}/assets/images/og/dr-muhammed-ikbal-bakirci-og.jpg`;
export const PERSON_IMAGE = `${SITE_URL}/assets/images/dr-muhammed-ikbal-bakirci.jpg`;
export const DEFAULT_DESCRIPTION =
  'Dr. Muhammed İkbal Bakırcı ile longevity, sağlık eğitimi ve medikal estetik hakkında kanıta dayalı bilgiler.';

export const ROUTE_DESCRIPTIONS: Record<string, string> = {
  '/': 'Dr. Muhammed İkbal Bakırcı: longevity, sağlık eğitimi, medikal estetik ve sağlıklı yaşlanma üzerine bilimsel içerikler.',
  '/hakkinda': "Dr. Muhammed İkbal Bakırcı kimdir? Atatürk Üniversitesi Tıp Fakültesi mezunu, VM Medical Park Bursa Başhekimi; eğitimi, kariyeri ve görevleri.",
  '/iletisim': 'Dr. Muhammed İkbal Bakırcı ile iletişime geçin. Randevu, sağlık eğitimi ve medikal estetik başvuruları için iletişim bilgileri.',
  '/longevity': 'Longevity bilimi, biyolojik yaşlanma ve sağlık ömrünü uzatmaya yardımcı yaşam tarzı yaklaşımı hakkında kapsamlı rehber.',
  '/medikal-estetik': 'Medikal estetik ve cilt sağlığı: botoks, dermal dolgu, PRP, eksozom, altın iğne ve mezoterapi hakkında bilgilendirici rehber.',
  '/blog': 'Longevity, metabolik sağlık, uyku, stres, beslenme ve medikal estetik konularında Dr. Muhammed İkbal Bakırcı makaleleri.',
  '/rehberler': "Longevity, uyku, beslenme, stres yönetimi ve cilt sağlığı için pratik ve kanıta dayalı sağlık rehberleri; günlük hayata uygulanabilir adımlar.",
  '/quizler': "Ücretsiz sağlık testleri: uyku, stres, kaygı, metabolik sağlık ve cilt sağlığı için bilimsel ölçekler ve farkındalık anketleri. Tanı koymaz.",
  '/dunyada-saglik': 'Dünyada sağlık ve longevity alanındaki güncel yaklaşımlar, araştırmalar ve sağlık sistemleri üzerine içerikler.',
  '/gecmis-yillar': "Dr. Muhammed İkbal Bakırcı’nın kongre, konferans ve konuşmaları: sağlık hizmetleri yönetimi, longevity ve sağlık eğitimi alanındaki etkinlikler.",
  '/gizlilik-politikasi': "Dr. Muhammed İkbal Bakırcı web sitesinin gizlilik politikası: hangi kişisel verilerin, hangi amaçla işlendiği ve KVKK kapsamındaki haklarınız.",
  '/kullanim-kosullari': "Dr. Muhammed İkbal Bakırcı web sitesinin kullanım koşulları: içeriklerin bilgilendirme amacı, sorumluluk sınırları ve kullanıcı yükümlülükleri.",
};

const routeLabel: Record<string, string> = {
  blog: 'Blog',
  'dunyada-saglik': 'Dünyada Sağlık',
  'gizlilik-politikasi': 'Gizlilik Politikası',
  hakkinda: 'Hakkında',
  iletisim: 'İletişim',
  'kullanim-kosullari': 'Kullanım Koşulları',
  longevity: 'Longevity',
  'medikal-estetik': 'Skin Longevity & Medikal Estetik',
  quizler: 'Quizler',
  rehberler: 'Rehberler',
  'gecmis-yillar': 'Geçmiş Yıllar',
};

export function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  // build.format 'file' sırasında Astro.url.pathname "/hakkinda.html" olur; canonical uzantısız adrestir.
  const clean = normalized.replace(/(\/index)?\.html$/, '').replace(/\/+$/, '');
  return clean || '/';
}

export function getCanonicalUrl(pathname: string): string {
  return new URL(normalizePathname(pathname), `${SITE_URL}/`).toString();
}

export function getAbsoluteUrl(pathnameOrUrl: string): string {
  return new URL(pathnameOrUrl, `${SITE_URL}/`).toString();
}

export function getPageDescription(pathname: string, provided?: string): string {
  return provided?.trim() || ROUTE_DESCRIPTIONS[normalizePathname(pathname)] || DEFAULT_DESCRIPTION;
}

export function buildBreadcrumbs(pathname: string, title: string) {
  const normalizedPath = normalizePathname(pathname);
  const segments = normalizedPath.split('/').filter(Boolean);
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Ana Sayfa',
      item: `${SITE_URL}/`,
    },
  ];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    items.push({
      '@type': 'ListItem',
      position: index + 2,
      name: index === segments.length - 1 ? title : routeLabel[segment] || segment,
      item: getCanonicalUrl(currentPath),
    });
  });

  return items;
}

// Doğrulanmış profesyonel profiller (docs/arastirma/2026-10-05-mesleki-ozgecmis.md).
export const SAME_AS = [
  'https://www.instagram.com/dr.muhammedikbalbakirci',
  'https://www.youtube.com/@drmuhammedikbalbakirci',
  'https://www.linkedin.com/in/muhammed-ikbal-bakirci-221ab3243',
  'https://x.com/mikbalbakirci',
  'https://www.medicalpark.com.tr/hekimler/muhammed-ikbal-bakirci',
];

export type PageType = 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage' | 'MedicalWebPage';

// Breadcrumb ve WebPage adında marka soneki tekrar etmesin.
const stripBrand = (title: string) => title.replace(/\s+[—|-]\s+Dr\. Muhammed İkbal Bakırcı$/, '');

export function buildSiteStructuredData({
  pathname,
  title,
  description,
  image,
  pageType = 'WebPage',
}: {
  pathname: string;
  title: string;
  description: string;
  image: string;
  pageType?: PageType;
}) {
  const canonicalUrl = getCanonicalUrl(pathname);
  const pageName = stripBrand(title);
  const breadcrumbs = buildBreadcrumbs(pathname, pageName);
  const hasBreadcrumbs = breadcrumbs.length >= 2;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: PERSON_NAME,
        honorificPrefix: 'Dr.',
        url: `${SITE_URL}/hakkinda`,
        mainEntityOfPage: `${SITE_URL}/hakkinda`,
        image: PERSON_IMAGE,
        jobTitle: 'Başhekim',
        description:
          "Akademisyen, sağlık yöneticisi ve medikal estetik hekimi; 2022'den bu yana VM Medical Park Bursa Hastanesi Başhekimi. Longevity, sağlıklı yaşlanma ve medikal estetik üzerine kanıta dayalı içerikler üretiyor.",
        worksFor: {
          '@type': 'Hospital',
          name: WORKPLACE.name,
          // Sağlık Bakanlığı healthturkiye kaydı ve Medical Park doktor profiliyle doğrulandı.
          address: {
            '@type': 'PostalAddress',
            streetAddress: WORKPLACE.street,
            postalCode: WORKPLACE.postalCode,
            addressLocality: WORKPLACE.locality,
            addressRegion: WORKPLACE.region,
            addressCountry: 'TR',
          },
        },
        alumniOf: { '@type': 'CollegeOrUniversity', name: 'Atatürk Üniversitesi Tıp Fakültesi' },
        hasOccupation: { '@type': 'Occupation', name: 'Medikal Estetik Hekimi' },
        knowsAbout: ['Longevity', 'Sağlıklı yaşlanma', 'Medikal estetik', 'Acil tıp', 'Sağlık yönetimi'],
        ...(EMAIL ? { email: EMAIL } : {}),
        ...(PHONE_TEL ? { telephone: PHONE_TEL } : {}),
        sameAs: SAME_AS,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        inLanguage: SITE_LOCALE,
        publisher: { '@id': `${SITE_URL}/#person` },
      },
      {
        '@type': pageType === 'AboutPage' ? ['AboutPage', 'ProfilePage'] : pageType,
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: pageName,
        description,
        primaryImageOfPage: { '@type': 'ImageObject', url: getAbsoluteUrl(image) },
        isPartOf: { '@id': `${SITE_URL}/#website` },
        ...(['AboutPage', 'ContactPage'].includes(pageType) ? { mainEntity: { '@id': `${SITE_URL}/#person` } } : {}),
        ...(hasBreadcrumbs ? { breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` } } : {}),
        inLanguage: SITE_LOCALE,
      },
      ...(hasBreadcrumbs ? [{
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: breadcrumbs,
      }] : []),
    ],
  };
}
