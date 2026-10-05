export const SITE_URL = 'https://www.muhammedikbalbakirci.com';
export const SITE_NAME = 'Dr. Muhammed İkbal Bakırcı';
export const SITE_LOCALE = 'tr-TR';
export const DEFAULT_IMAGE = `${SITE_URL}/assets/images/dr-muhammed-ikbal-bakirci.jpg`;
export const DEFAULT_DESCRIPTION =
  'Dr. Muhammed İkbal Bakırcı ile longevity, sağlık eğitimi ve medikal estetik hakkında kanıta dayalı bilgiler.';

export const ROUTE_DESCRIPTIONS: Record<string, string> = {
  '/': 'Dr. Muhammed İkbal Bakırcı: longevity, sağlık eğitimi, medikal estetik ve sağlıklı yaşlanma üzerine bilimsel içerikler.',
  '/hakkinda': 'Dr. Muhammed İkbal Bakırcı hakkında: hekimlik deneyimi, uzmanlık alanları, sağlık eğitimi ve profesyonel yaklaşımı.',
  '/iletisim': 'Dr. Muhammed İkbal Bakırcı ile iletişime geçin. Randevu, sağlık eğitimi ve medikal estetik başvuruları için iletişim bilgileri.',
  '/longevity': 'Longevity bilimi, biyolojik yaşlanma ve sağlık ömrünü uzatmaya yardımcı yaşam tarzı yaklaşımı hakkında kapsamlı rehber.',
  '/medikal-estetik': 'Medikal estetik ve cilt sağlığı: botoks, dermal dolgu, PRP, eksozom, altın iğne ve mezoterapi hakkında bilgilendirici rehber.',
  '/blog': 'Longevity, metabolik sağlık, uyku, stres, beslenme ve medikal estetik konularında Dr. Muhammed İkbal Bakırcı makaleleri.',
  '/rehberler': 'Longevity, uyku, beslenme, stres yönetimi ve cilt sağlığı için pratik ve bilimsel sağlık rehberleri.',
  '/quizler': 'Longevity, stres, uyku, metabolik sağlık ve cilt sağlığı alanlarında kişisel farkındalık için sağlık quizleri.',
  '/dunyada-saglik': 'Dünyada sağlık ve longevity alanındaki güncel yaklaşımlar, araştırmalar ve sağlık sistemleri üzerine içerikler.',
  '/gecmis-yillar': 'Dr. Muhammed İkbal Bakırcı’nın geçmiş yıllardaki etkinlikleri, konuşmaları ve sağlık eğitimi çalışmaları.',
  '/sitelerimiz': 'Dr. Muhammed İkbal Bakırcı’nın sağlık, longevity ve günlük yaşam için geliştirdiği dijital projeler.',
  '/gizlilik-politikasi': 'Dr. Muhammed İkbal Bakırcı web sitesi gizlilik politikası ve kişisel verilerin korunmasına ilişkin bilgiler.',
  '/kullanim-kosullari': 'Dr. Muhammed İkbal Bakırcı web sitesi kullanım koşulları, içerik sorumluluğu ve kullanıcı yükümlülükleri.',
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
  sitelerimiz: 'Sitelerimiz',
  'gecmis-yillar': 'Geçmiş Yıllar',
};

export function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return normalized.replace(/\/+$/, '');
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
  'https://www.medicalpark.com.tr/en/doctors/muhammed-ikbal-bakirci',
];

export type PageType = 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage';

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

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: SITE_NAME,
        honorificPrefix: 'Dr.',
        url: `${SITE_URL}/hakkinda`,
        mainEntityOfPage: `${SITE_URL}/hakkinda`,
        image: DEFAULT_IMAGE,
        jobTitle: 'Başhekim',
        description:
          "Hekim; 2022'den bu yana VM Medical Park Bursa Hastanesi Başhekimi. Longevity, sağlıklı yaşlanma ve medikal estetik üzerine kanıta dayalı içerikler üretiyor.",
        worksFor: {
          '@type': 'Hospital',
          name: 'VM Medical Park Bursa Hastanesi',
          address: { '@type': 'PostalAddress', addressLocality: 'Bursa', addressCountry: 'TR' },
        },
        alumniOf: { '@type': 'CollegeOrUniversity', name: 'Atatürk Üniversitesi Tıp Fakültesi' },
        hasOccupation: { '@type': 'Occupation', name: 'Hekim' },
        knowsAbout: ['Longevity', 'Sağlıklı yaşlanma', 'Medikal estetik', 'Acil tıp', 'Sağlık yönetimi'],
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
        '@type': pageType,
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: pageName,
        description,
        primaryImageOfPage: { '@type': 'ImageObject', url: getAbsoluteUrl(image) },
        isPartOf: { '@id': `${SITE_URL}/#website` },
        ...(pageType === 'AboutPage' ? { mainEntity: { '@id': `${SITE_URL}/#person` } } : {}),
        breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` },
        inLanguage: SITE_LOCALE,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: buildBreadcrumbs(pathname, pageName),
      },
    ],
  };
}
