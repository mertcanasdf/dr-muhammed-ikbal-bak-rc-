// Site geneli davranışlar: başlık gölgesi ve masaüstü megamenü konumu.
// Mobil menü (hamburger, alt menü aç/kapa) public/mobile-menu.js içindedir.
// Not: Eski sürümdeki sağ tık/kopyalama engeli, promo modal, slider ve örnek "başarı hikâyeleri" kaldırıldı (kullanılmıyordu).
document.addEventListener('astro:page-load', () => {
  const header = document.getElementById('headerWrapper');
  if (header) {
    window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 20), { passive: true });
  }

  // Masaüstünde geniş megamenüyü tetikleyicinin altına hizala, menü kutusundan taşırma.
  const mainMenu = document.getElementById('mainMenu');
  if (!mainMenu) return;
  document.querySelectorAll('.has-megamenu').forEach((item) => {
    const panel = item.querySelector('.megamenu');
    if (!panel || item.classList.contains('has-megamenu--compact')) return;
    item.addEventListener('mouseenter', () => {
      if (window.innerWidth <= 900) return;
      const menuBox = mainMenu.getBoundingClientRect();
      const width = panel.offsetWidth || 720;
      let left = item.getBoundingClientRect().left - menuBox.left;
      if (left + width > menuBox.width) left = menuBox.width - width;
      if (left < 0) left = 0;
      panel.style.left = `${left}px`;
      panel.style.right = 'auto';
      panel.style.transform = 'none';
    });
  });
});
