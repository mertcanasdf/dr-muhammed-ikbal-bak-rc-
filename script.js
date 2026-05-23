document.addEventListener('DOMContentLoaded', () => {

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
