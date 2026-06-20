document.addEventListener('astro:page-load', () => {

  // ── Nav dropdowns ──
  (function initNavDropdowns() {
    // p variable removed — all hrefs now use absolute paths
    const MENUS = {
      'Dünyada Sağlık': {
        wide: false,
        items: [
          { href: '/dunyada-saglik', label: 'Global Gelişmeler' },
          { href: '/dunyada-saglik', label: 'Bilimsel Araştırmalar' },
          { href: '/dunyada-saglik', label: 'Longevity Keşifleri' },
          { href: '/dunyada-saglik', label: 'Sağlık Trendleri' },
        ],
        footer: { href: '/dunyada-saglik', label: 'Tüm gelişmeleri gör →' },
      },
      'Longevity': {
        wide: false,
        items: [
          { href: '/blog/otofaji-nedir',           label: 'Hücresel Temizlik' },
          { href: '/blog/aralikli-oruc-longevity', label: 'Metabolik Sağlık' },
          { href: '/blog/bolge-2-kardiyo',         label: 'Kardiyorespiratuar Kapasite' },
          { href: '/blog/kortizol-yaslanma',       label: 'Beyin Sağlığı' },
          { href: '/blog/telomerleri-korumak',     label: 'Uzun Ömür Biyolojisi' },
        ],
        footer: { href: '/longevity', label: 'Longevity sayfasına git →' },
      },
      'Rehberler': {
        wide: false,
        items: [
          { href: '/blog/aralikli-oruc-longevity', label: '16:8 Aralıklı Oruç' },
          { href: '/blog/aralikli-oruc-longevity', label: 'Ketojenik Diyete Geçiş' },
          { href: '/blog/telomerleri-korumak',     label: 'Uyku Optimizasyonu' },
          { href: '/blog/bolge-2-kardiyo',         label: 'Longevity Egzersizi' },
          { href: '/blog/kortizol-yaslanma',       label: 'Kortizol Kontrolü' },
        ],
        footer: { href: '/rehberler', label: 'Tüm rehberleri gör →' },
      },
      'Quizler': {
        wide: false,
        items: [
          { href: '/quizler', label: 'Vücut Tipi Quizi' },
          { href: '/quizler', label: 'Longevity Skoru' },
          { href: '/quizler', label: 'Bağırsak Sağlığı Testi' },
          { href: '/quizler', label: 'Stres & Kortizol Profili' },
        ],
        footer: null,
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

      cfg.items.forEach(({ href, label }) => {
        const a = document.createElement('a');
        a.href = href;
        a.className = 'nav-dropdown__item';
        a.innerHTML = `<span class="nav-dropdown__item-label">${label}</span>`;
        grid.appendChild(a);
      });

      drop.appendChild(grid);

      if (cfg.footer) {
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

  // ── Mobile Megamenu Toggle ──
  const megamenuTrigger = document.querySelector('.has-megamenu > .menu-trigger');
  if (megamenuTrigger) {
    megamenuTrigger.addEventListener('click', (e) => {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        const parent = megamenuTrigger.parentElement;
        parent.classList.toggle('is-active');
      }
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

    if (document.querySelector('#successSplide')) {
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
    }

    if (document.querySelector('#podcastSplide')) {
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
    }

    if (document.querySelector('#productsSplide')) {
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

  }

  // ── Promo campaign modal ──
  (function initPromoModal() {
    const modal = document.getElementById('promoModal');
    if (!modal) return;

    // Check if the modal was already closed in this session to prevent spamming the user
    if (sessionStorage.getItem('promoModalClosed') === 'true') {
      return;
    }

    const closeBtn = document.getElementById('closePromoModal');
    const skipBtn = document.getElementById('skipPromoModal');
    const overlay = modal.querySelector('.promo-modal__overlay');

    const closeModal = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      sessionStorage.setItem('promoModalClosed', 'true');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (skipBtn) skipBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });

    // Show modal after 5 seconds delay
    setTimeout(() => {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    }, 5000);
  })();

});
