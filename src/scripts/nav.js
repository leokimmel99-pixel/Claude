import gsap from 'gsap';

export function initNav() {
  const menuToggle = document.querySelector('.menu-toggle');
  const fullscreenMenu = document.querySelector('.fullscreen-menu');
  const menuLinks = document.querySelectorAll('.menu-links a');
  let isMenuOpen = false;

  const tl = gsap.timeline({ paused: true });

  // The "Blast of Air" condensation wipe
  tl.to(fullscreenMenu, {
    clipPath: 'circle(150% at 100% 0%)',
    duration: 1.2,
    ease: 'power4.inOut',
    onStart: () => {
      gsap.set(fullscreenMenu, { opacity: 1 });
      fullscreenMenu.classList.add('is-active');
    }
  })
  .to(menuLinks, {
    y: '0%',
    duration: 0.8,
    stagger: 0.1,
    ease: 'expo.out'
  }, "-=0.6");

  const toggleMenu = () => {
    isMenuOpen = !isMenuOpen;

    if (isMenuOpen) {
      tl.play();
    } else {
      tl.reverse().then(() => {
        fullscreenMenu.classList.remove('is-active');
        gsap.set(fullscreenMenu, { opacity: 0 });
      });
    }
  };

  menuToggle.addEventListener('click', toggleMenu);

  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (isMenuOpen) {
        toggleMenu();
      }
    });
  });
}
