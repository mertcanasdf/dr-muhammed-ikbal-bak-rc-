// Sağlıklı yaş almanın 6 alanı: /longevity ve /longevity/[alan] sayfalarının ortak verisi.
// Revizyon planı madde 16: "Tutarlı ve Uzun Yaşam".

// Yazıların alanlara dağılımı: kategoriye göre; "Zihin & Sosyal Yaşam" kategorisi iki alana ayrılır.
export const SOSYAL = ['sosyal-baglanti-ve-uzun-omur', 'yasam-amaci-ve-longevity', 'sukran-pratigi-ve-dopamin'];
const AREA_BY_CATEGORY: Record<string, string> = {
  Beslenme: 'beslenme',
  Hareket: 'hareket',
  Uyku: 'uyku',
  'Zihin & Sosyal Yaşam': 'zihin',
  'Skin Longevity': 'skin-longevity',
};
export const areaOf = (slug: string, category: string) =>
  SOSYAL.includes(slug) ? 'sosyal-iliskiler' : AREA_BY_CATEGORY[category];

export const NOTE = 'Bu göstergeler genel bilgilendirme içindir ve herkes için geçerli bir "hedef" değildir. Kişisel hedefler yaş, sağlık durumu ve kullanılan ilaçlara göre hekiminizle birlikte belirlenir.';

export interface AreaMetric { lbl: string; val: string; tip: string }
export interface Area {
  id: string;
  title: string;
  icon: string[];
  desc: string;
  points: string[];
  metricsTitle?: string;
  metrics: AreaMetric[];
  posts: string[];
  more?: { href: string; label: string };
}

export const AREAS: Area[] = [
  {
    id: 'beslenme', title: 'Beslenme',
    icon: ['M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z', 'M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'],
    desc: 'Sağlıklı yaşlanmada beslenme, tek bir "süper gıdadan" çok yıllar boyunca sürdürülebilen bir düzendir. Sebze, meyve, baklagil, tam tahıl ve yeterli protein içeren, işlenmiş gıdası az bir beslenme metabolik sağlığın temelidir.',
    points: [
      'Akdeniz tipi beslenme düzenleri, kalp-damar hastalığı riskinin daha düşük olmasıyla ilişkilendirilmektedir.',
      'Yaş ilerledikçe kas kütlesini korumak için yeterli protein alımı önem kazanır; ihtiyaç kişiye göre değişir.',
      'Lifli besinler bağırsak mikrobiyotasını ve kan şekeri dengesini destekler.',
    ],
    metrics: [
      { lbl: 'HbA1c (Üç Aylık Şeker Ortalaması)', val: 'Normal: %5,7 altı', tip: 'Amerikan Diyabet Derneği sınıflamasında %5,7–6,4 prediyabet, %6,5 ve üzeri diyabet aralığıdır. Diyabeti olan kişilerde hedef hekimle belirlenir.' },
      { lbl: 'ApoB (Aterojenik Lipoprotein)', val: 'Hedef kişisel riske göre', tip: 'Kalp-damar riskini değerlendirmede LDL kolesterole ek bilgi verebilen bir belirteçtir. Uygun değer yaş, diyabet, aile öyküsü ve diğer risk faktörlerine göre hekimle belirlenir.' },
    ],
    posts: ['mavi-bolge-diyeti', 'protein-ihtiyaci-yaslanma', 'lifli-beslenme-ve-mikrobiyota'],
  },
  {
    id: 'hareket', title: 'Hareket',
    icon: ['M22 12h-4l-3 9L9 3l-3 9H2'],
    desc: 'Düzenli fiziksel aktivite, sağlıklı yaşlanmayla en tutarlı biçimde ilişkilendirilen alışkanlıklardan biridir. Aerobik kapasite, kas gücü ve denge birlikte ele alınmalıdır.',
    points: [
      'Dünya Sağlık Örgütü yetişkinler için haftada en az 150 dakika orta yoğunlukta aerobik aktivite ve haftada 2 gün kas güçlendirici egzersiz önerir.',
      'Yüksek kardiyorespiratuvar kondisyon, tüm nedenlere bağlı ölüm riskinin daha düşük olmasıyla ilişkilidir.',
      'Denge çalışmaları ileri yaşta düşme riskini azaltmaya yardımcı olabilir.',
    ],
    metrics: [
      { lbl: 'VO₂max (Aerobik Kapasite)', val: 'Yaşa ve cinsiyete göre değerlendirilir', tip: 'Daha yüksek aerobik kapasite daha düşük ölüm riskiyle ilişkilendirilmiştir; düzenli egzersizle her yaşta artırılabilir ve küçük artışlar bile anlamlıdır.' },
      { lbl: 'Dinlenme Kalp Hızı', val: 'Genellikle 60–100 atım/dk', tip: 'Düzenli aerobik egzersizle düşebilir; sporcularda 60’ın altı normal olabilir. Çarpıntı ya da baş dönmesiyle birlikte çok düşük veya yüksek nabız hekim değerlendirmesi gerektirir.' },
      { lbl: 'Kas Kütlesi', val: 'Yaşla korunması', tip: 'Kas kütlesi ve gücü yaşla azalma eğilimindedir; direnç antrenmanı ve yeterli protein bu kaybı yavaşlatmaya yardımcı olur. Gerektiğinde DEXA gibi yöntemlerle ölçülebilir.' },
      { lbl: 'El Kavrama Gücü', val: 'Zaman içindeki değişim', tip: 'Genel fiziksel kapasiteyle ilişkili, basit ve yaygın kullanılan bir ölçümdür; düşük değerler daha yüksek sağlık riskleriyle ilişkilendirilmiştir.' },
    ],
    posts: ['direnc-antrenmani-yaslanma', 'vo2max-ve-longevity', 'denge-egzersizleri-yaslanma'],
  },
  {
    id: 'uyku', title: 'Uyku',
    icon: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'],
    desc: 'Uyku; hafıza, metabolizma, bağışıklık ve duygu düzenlemesi için temel bir biyolojik ihtiyaçtır. Süresi kadar düzenliliği de önemlidir.',
    points: [
      'Yetişkinlerin çoğu için gecede 7 saat ve üzeri uyku önerilmektedir.',
      'Her gün benzer saatlerde yatıp kalkmak sirkadiyen ritmi destekler.',
      'Uzun süren uykusuzluk ya da uykuda horlama ve nefes durması gibi belirtiler hekim değerlendirmesi gerektirir.',
    ],
    metrics: [
      { lbl: 'Uyku Süresi', val: '7 saat ve üzeri', tip: 'Önerilen süre yaşa göre değişir; ihtiyacınızı uyku düzeniniz ve gün içindeki enerjiniz gösterir.' },
      { lbl: 'Uyku Düzeni', val: 'Benzer saatlerde yatıp kalkmak', tip: 'Akıllı saatlerin derin uyku tahminleri yaklaşık değerlerdir; tek gecelik ölçüm yerine düzenli uyku süresi ve gün içindeki dinçlik daha anlamlı bilgi verir.' },
    ],
    posts: ['uyku-kalitesi-nasil-artirilir', 'sirkadiyen-ritim-ve-uyku', 'ekran-kullanimi-ve-uyku'],
  },
  {
    id: 'zihin', title: 'Zihin',
    icon: ['M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z', 'M9 21h6'],
    desc: 'Kronik stres; uyku, beslenme ve kalp-damar sağlığı üzerinden yaşlanma sürecini etkileyebilir. Zihinsel iyi oluş, sağlıklı yaşlanmanın ayrılmaz bir parçasıdır.',
    points: [
      'Kronik yüksek kortizol, uyku bozukluğu ve metabolik sorunlarla ilişkilendirilmektedir.',
      'Doğada vakit geçirmek, düzenli hareket ve nefes çalışmaları stres yönetimini destekleyebilir.',
      'Uzun süren kaygı ya da çökkünlük belirtilerinde bir ruh sağlığı uzmanından destek almak önemlidir.',
    ],
    metrics: [],
    posts: ['kortizol-yaslanma', 'tukenmislik-sendromu', 'doga-ve-zihin-sagligi'],
  },
  {
    id: 'sosyal-iliskiler', title: 'Sosyal İlişkiler',
    icon: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M5 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
    desc: 'Güçlü sosyal bağlar ve yaşamda bir amaç duygusu, uzun yaşamla ilişkilendirilen en tutarlı faktörlerden biridir.',
    points: [
      'Sosyal izolasyon ve yalnızlık, daha yüksek ölüm riskiyle ilişkilendirilmektedir.',
      'Yaşamda bir amaç duygusu, daha sağlıklı yaşlanmayla ilişkili bulunmuştur.',
      'Ortak etkinlikler, gönüllülük ve düzenli görüşmeler sosyal bağları güçlendirir.',
    ],
    metrics: [],
    posts: ['sosyal-baglanti-ve-uzun-omur', 'yasam-amaci-ve-longevity', 'sukran-pratigi-ve-dopamin'],
  },
  {
    id: 'skin-longevity', title: 'Skin Longevity',
    icon: ['M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z'],
    desc: 'Cilt, yaşlanmanın en görünür yüzüdür. Skin longevity; güneşten korunma, cilt bariyerinin desteklenmesi ve uygun hastalarda medikal estetik uygulamalarla cildin uzun vadeli sağlığını hedefler.',
    points: [
      'Güneşten korunma, ciltte fotoyaşlanmayı azaltmada en güçlü kanıta sahip yaklaşımdır.',
      'Retinoidler, cilt yaşlanması bulgularında en çok çalışılmış topikal ajanlardandır.',
      'Medikal estetik uygulamalar kişisel değerlendirmeyle ve gerçekçi beklentilerle planlanmalıdır.',
    ],
    metricsTitle: 'Uygulamalar ve Hedeflenen Etkiler',
    metrics: [
      { lbl: 'PRP & Eksozom', val: 'Rejeneratif uygulamalar', tip: 'Hücreler arası iletişimi destekleyerek doku onarımına ve kolajen–elastin yapımına katkı sağlamayı hedefler.' },
      { lbl: 'Altın İğne (RF)', val: 'Fraksiyonel radyofrekans', tip: 'Mikro iğnelerle oluşturulan kontrollü ısı etkisiyle yeni kolajen oluşumunu uyarmayı ve cilt sıkılığını artırmayı hedefler.' },
    ],
    posts: ['gunes-kremi-nasil-secilir', 'retinoid-nedir', 'ciltte-kollajen-kaybi'],
    more: { href: '/medikal-estetik', label: 'Skin Longevity & Medikal Estetik sayfası' },
  },
];

// Kendi sayfası olan alanlar (Skin Longevity için /medikal-estetik kullanılır).
export const AREA_PAGE: Record<string, string> = Object.fromEntries(
  AREAS.map((area) => [area.id, area.id === 'skin-longevity' ? '/medikal-estetik' : `/longevity/${area.id}`]),
);
