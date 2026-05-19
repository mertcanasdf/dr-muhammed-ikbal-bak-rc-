document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  const burger = document.getElementById('burger');
  const navMenu = document.getElementById('navMenu');

  // Sticky gölge
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  });

  // Hamburger menü
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navMenu.classList.toggle('open');
    burger.setAttribute('aria-expanded', burger.classList.contains('open'));
  });
});
