(() => {
  function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mainMenu = document.getElementById('mainMenu');
    const siteHeader = document.querySelector('.site-header');

    if (!hamburger || !mainMenu || !siteHeader) return;

    if (window.__mobileMenuCleanup) window.__mobileMenuCleanup();

    const updateMenuPosition = () => {
      if (window.innerWidth > 1100) {
        mainMenu.style.removeProperty('--mobile-menu-top');
        return;
      }

      const headerBottom = Math.max(0, Math.round(siteHeader.getBoundingClientRect().bottom));
      mainMenu.style.setProperty('--mobile-menu-top', `${headerBottom}px`);
    };

    const setMenuOpen = (isOpen) => {
      updateMenuPosition();
      mainMenu.classList.toggle('open', isOpen);
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      hamburger.setAttribute('aria-label', isOpen ? 'Menüyü kapat' : 'Menüyü aç');
      document.body.classList.toggle('menu-open', isOpen);

      if (!isOpen) {
        mainMenu.querySelectorAll('.has-megamenu.is-active').forEach((item) => {
          item.classList.remove('is-active');
        });
      }
    };

    const closeMenu = () => setMenuOpen(false);

    const onHamburgerClick = (event) => {
      if (window.innerWidth > 1100) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setMenuOpen(!mainMenu.classList.contains('open'));
    };

    hamburger.addEventListener('click', onHamburgerClick, true);

    mainMenu.querySelectorAll('.has-megamenu > .menu-trigger').forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        if (window.innerWidth > 900) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        const parent = trigger.parentElement;
        mainMenu.querySelectorAll('.has-megamenu.is-active').forEach((item) => {
          if (item !== parent) item.classList.remove('is-active');
        });
        mainMenu.scrollTop = 0;
        parent.classList.toggle('is-active');
      }, true);
    });

    document.querySelectorAll('#mainMenu a:not(.menu-trigger)').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    const onEscape = (event) => {
      if (event.key === 'Escape' && mainMenu.classList.contains('open')) closeMenu();
    };

    const onOutsideClick = (event) => {
      if (
        window.innerWidth <= 1100 &&
        mainMenu.classList.contains('open') &&
        !event.target.closest('#mainMenu') &&
        !event.target.closest('#hamburger')
      ) {
        closeMenu();
      }
    };

    const onResize = () => {
      updateMenuPosition();
      if (window.innerWidth > 1100) closeMenu();
    };

    updateMenuPosition();
    document.addEventListener('keydown', onEscape);
    document.addEventListener('click', onOutsideClick);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', updateMenuPosition, { passive: true });

    window.__mobileMenuCleanup = () => {
      document.removeEventListener('keydown', onEscape);
      document.removeEventListener('click', onOutsideClick);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', updateMenuPosition);
      mainMenu.style.removeProperty('--mobile-menu-top');
      document.body.classList.remove('menu-open');
    };
  }

  document.addEventListener('astro:page-load', initMobileMenu);
})();
