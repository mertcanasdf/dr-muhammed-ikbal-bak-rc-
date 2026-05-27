document.addEventListener('DOMContentLoaded', () => {

  // ── Nav dropdowns ──
  (function initNavDropdowns() {
    const p = (location.pathname.includes('/blog/') || location.pathname.includes('/pages/')) ? '../' : '';

    const MENUS = {
      'İçerik Kütüphanesi': {
        wide: true,
        items: [
          { href: p + 'blog/otofaji-nedir.html',            label: 'Otofaji',              desc: 'Hücresel temizlik & geri dönüşüm' },
          { href: p + 'blog/aralikli-oruc-longevity.html',  label: 'Aralıklı Oruç',        desc: 'Metabolik sağlık protokolü' },
          { href: p + 'blog/telomerleri-korumak.html',      label: 'Telomerler',           desc: 'Biyolojik yaşı yavaşlatın' },
          { href: p + 'blog/nmn-nad-yaslanma.html',         label: 'NMN & NAD+',           desc: 'Hücresel enerji desteği' },
          { href: p + 'blog/mavi-bolge-diyeti.html',        label: 'Mavi Bölge Diyeti',    desc: 'Uzun ömürlülüğün sırları' },
          { href: p + 'blog/bolge-2-kardiyo.html',          label: 'Bölge 2 Kardiyo',      desc: 'Longevity egzersizi' },
          { href: p + 'blog/kortizol-yaslanma.html',        label: 'Kortizol & Stres',     desc: 'Kronik stresin bedeli' },
          { href: p + 'blog/d3-vitamini-eksikligi.html',    label: 'D3 Vitamini',          desc: 'Kritik eksiklik tespiti' },
        ],
        footer: { href: p + 'blog/index.html', label: 'Tüm makaleleri gör →' },
      },
      'Tarifler': {
        wide: false,
        items: [
          { href: p + 'pages/tarifler.html', label: 'Kahvaltı Tarifleri',   desc: 'Keto kahvaltı seçenekleri' },
          { href: p + 'pages/tarifler.html', label: 'Ana Yemekler',         desc: 'Düşük karbonhidratlı öğünler' },
          { href: p + 'pages/tarifler.html', label: 'Atıştırmalıklar',      desc: 'Sağlıklı ara öğünler' },
          { href: p + 'pages/tarifler.html', label: 'İçecek & Smoothie',    desc: 'Longevity içecekleri' },
        ],
        footer: { href: p + 'pages/tarifler.html', label: 'Tüm tarifleri gör →' },
      },
      'Longevity': {
        wide: false,
        items: [
          { href: p + 'blog/otofaji-nedir.html',           label: 'Hücresel Temizlik',       desc: 'Otofaji & mitofaji' },
          { href: p + 'blog/aralikli-oruc-longevity.html', label: 'Metabolik Sağlık',         desc: 'İnsülin & kan şekeri' },
          { href: p + 'blog/bolge-2-kardiyo.html',         label: 'Kardiyorespiratuar Kapasite', desc: 'VO₂ max & kalp sağlığı' },
          { href: p + 'blog/kortizol-yaslanma.html',       label: 'Beyin Sağlığı',            desc: 'Nöroplastisite & bilişsel rezerv' },
          { href: p + 'blog/telomerleri-korumak.html',     label: 'Uzun Ömür Biyolojisi',     desc: 'Telomer & epigenetik yaşlanma' },
        ],
        footer: { href: p + 'pages/longevity.html', label: 'Longevity sayfasına git →' },
      },
      'Rehberler': {
        wide: false,
        items: [
          { href: p + 'blog/aralikli-oruc-longevity.html', label: '16:8 Aralıklı Oruç',   desc: 'Adım adım başlangıç rehberi' },
          { href: p + 'blog/aralikli-oruc-longevity.html', label: 'Ketojenik Diyete Geçiş', desc: 'Yan etkileri minimize edin' },
          { href: p + 'blog/telomerleri-korumak.html',     label: 'Uyku Optimizasyonu',   desc: 'Derin uyku protokolü' },
          { href: p + 'blog/bolge-2-kardiyo.html',         label: 'Longevity Egzersizi',  desc: 'Haftalık program' },
          { href: p + 'blog/kortizol-yaslanma.html',       label: 'Kortizol Kontrolü',    desc: 'Stres yönetimi protokolü' },
        ],
        footer: { href: p + 'pages/rehberler.html', label: 'Tüm rehberleri gör →' },
      },
      'Quizler': {
        wide: false,
        items: [
          { href: p + 'pages/quizler.html', label: 'Vücut Tipi Quizi',        desc: '2 dk • 12 soru • Ücretsiz' },
          { href: p + 'pages/quizler.html', label: 'Longevity Skoru',          desc: '5 dk • 25 soru • Ücretsiz' },
          { href: p + 'pages/quizler.html', label: 'Bağırsak Sağlığı Testi',   desc: '3 dk • 15 soru • Ücretsiz' },
          { href: p + 'pages/quizler.html', label: 'Stres & Kortizol Profili', desc: '3 dk • 18 soru • Ücretsiz' },
        ],
        footer: null,
      },
      'Mağaza': {
        wide: false,
        items: [
          { href: p + 'pages/magaza.html', label: 'NMN 500mg',         desc: 'Hücresel enerji & NAD+ desteği' },
          { href: p + 'pages/magaza.html', label: 'Magnezyum Glisinat', desc: 'Uyku & kas iyileşmesi' },
          { href: p + 'pages/magaza.html', label: 'D3 + K2 Vitamini',  desc: 'Kemik & bağışıklık sağlığı' },
          { href: p + 'pages/magaza.html', label: 'Omega-3 Balık Yağı', desc: 'Kalp & beyin desteği' },
        ],
        footer: { href: p + 'pages/magaza.html', label: 'Tüm ürünleri gör →' },
      },
    };

    document.querySelectorAll('.main-menu__list > li').forEach(li => {
      const link = li.querySelector('a');
      if (!link) return;
      const text = link.textContent.trim().replace(/\s+/g, ' ');
      const key = Object.keys(MENUS).find(k => text.startsWith(k));
      if (!key) return;

      const cfg = MENUS[key];
      li.classList.add('has-dropdown');

      const drop = document.createElement('div');
      drop.className = 'nav-dropdown' + (cfg.wide ? ' nav-dropdown--wide' : '');

      const grid = document.createElement('div');
      grid.className = 'nav-dropdown__grid' + (cfg.wide ? '' : ' nav-dropdown__grid--1col');

      cfg.items.forEach(({ href, label, desc }) => {
        const a = document.createElement('a');
        a.href = href;
        a.className = 'nav-dropdown__item';
        a.innerHTML = `<span class="nav-dropdown__item-label">${label}</span><span class="nav-dropdown__item-desc">${desc}</span>`;
        grid.appendChild(a);
      });

      drop.appendChild(grid);

      if (cfg.footer) {
        const hr = document.createElement('hr');
        hr.className = 'nav-dropdown__divider';
        drop.appendChild(hr);
        const footer = document.createElement('div');
        footer.className = 'nav-dropdown__footer';
        footer.innerHTML = `<a href="${cfg.footer.href}" class="nav-dropdown__view-all">${cfg.footer.label}</a>`;
        drop.appendChild(footer);
      }

      li.appendChild(drop);
    });
  })();

  // ── Announcement bar dismiss ──
  const announcementBar = document.getElementById('announcementBar');
  const closeBtn = document.getElementById('closeAnnouncement');
  if (closeBtn && announcementBar) {
    closeBtn.addEventListener('click', () => {
      announcementBar.style.display = 'none';
    });
  }

  // ── Sticky header shadow ──
  const headerWrapper = document.getElementById('headerWrapper');
  window.addEventListener('scroll', () => {
    headerWrapper.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // ── Mobile hamburger ──
  const hamburger = document.getElementById('hamburger');
  const mainMenu  = document.getElementById('mainMenu');
  if (hamburger && mainMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mainMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });
    // Close menu when a link is clicked
    mainMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ── Accordion ──
  document.querySelectorAll('.accordion__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen  = btn.getAttribute('aria-expanded') === 'true';
      const item    = btn.closest('.accordion__item');
      const body    = item.querySelector('.accordion__body');
      const icon    = btn.querySelector('.accordion__icon');

      // Collapse all
      document.querySelectorAll('.accordion__btn').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        b.querySelector('.accordion__icon').textContent = '+';
        const sib = b.closest('.accordion__item').querySelector('.accordion__body');
        sib.classList.add('accordion__body--hidden');
      });

      // Expand clicked (unless it was already open)
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        icon.textContent = '−'; // minus sign
        body.classList.remove('accordion__body--hidden');
      }
    });
  });

  // ── Splide.js carousels ──
  if (typeof Splide !== 'undefined') {

    new Splide('#articlesSplide', {
      type:       'loop',
      perPage:    4,
      perMove:    1,
      gap:        '0.25rem',
      padding:    '0',
      pagination: true,
      arrows:     true,
      breakpoints: {
        1124: { perPage: 3 },
        991:  { perPage: 2 },
        640:  { perPage: 1, fixedWidth: '80%' },
      },
    }).mount();

    new Splide('#successSplide', {
      type:       'loop',
      perPage:    3,
      perMove:    1,
      gap:        '1.5rem',
      pagination: true,
      arrows:     true,
      breakpoints: {
        991: { perPage: 2 },
        640: { perPage: 1, fixedWidth: '80%' },
      },
    }).mount();

    new Splide('#podcastSplide', {
      type:       'loop',
      perPage:    4,
      perMove:    1,
      gap:        '1.5rem',
      pagination: true,
      arrows:     true,
      breakpoints: {
        1124: { perPage: 3 },
        768:  { perPage: 2 },
        480:  { perPage: 1, fixedWidth: '80%' },
      },
    }).mount();

    new Splide('#productsSplide', {
      type:       'loop',
      perPage:    4,
      perMove:    1,
      gap:        '0.25rem',
      padding:    '0',
      pagination: true,
      arrows:     true,
      breakpoints: {
        1024: { perPage: 3 },
        768:  { perPage: 2 },
        480:  { perPage: 2 },
      },
    }).mount();

  }

});
