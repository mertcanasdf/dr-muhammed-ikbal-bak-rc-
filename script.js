document.addEventListener('DOMContentLoaded', () => {
  // ── Sticky header ──
  const navbar = document.getElementById('navbar');
  const burger = document.getElementById('burger');
  const navMenu = document.getElementById('navMenu');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  });

  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navMenu.classList.toggle('open');
    burger.setAttribute('aria-expanded', burger.classList.contains('open'));
  });

  // ── Product Carousel ──
  const track = document.getElementById('productsTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (track && prevBtn && nextBtn) {
    let currentIndex = 0;

    function getVisibleCount() {
      if (window.innerWidth <= 600) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 4;
    }

    function totalCards() {
      return track.querySelectorAll('.product-card').length;
    }

    function updateCarousel() {
      const cardWidth = track.querySelector('.product-card').offsetWidth + 24;
      const maxIndex = totalCards() - getVisibleCount();
      currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));
      track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex >= maxIndex;
    }

    nextBtn.addEventListener('click', () => { currentIndex++; updateCarousel(); });
    prevBtn.addEventListener('click', () => { currentIndex--; updateCarousel(); });
    window.addEventListener('resize', () => { currentIndex = 0; updateCarousel(); });

    updateCarousel();
  }
});
