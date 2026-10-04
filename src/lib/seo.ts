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

export function buildSiteStructuredData({
  pathname,
  title,
  description,
  image,
}: {
  pathname: string;
  title: string;
  description: string;
  image: string;
}) {
  const canonicalUrl = getCanonicalUrl(pathname);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: SITE_NAME,
        url: `${SITE_URL}/hakkinda`,
        image: getAbsoluteUrl(image),
        jobTitle: 'Hekim, sağlık yöneticisi ve akademisyen',
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
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: title,
        description,
        image: getAbsoluteUrl(image),
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#person` },
        inLanguage: SITE_LOCALE,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: buildBreadcrumbs(pathname, title),
      },
    ],
  };
}
