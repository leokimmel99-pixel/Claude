import gsap from 'gsap';

export function initPreloader() {
  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to('#preloader', {
          opacity: 0,
          duration: 1,
          ease: 'power2.inOut',
          onComplete: () => {
            document.getElementById('preloader').style.display = 'none';
            resolve();
          }
        });
      }
    });

    tl.to('.preloader-progress', {
      height: '100%',
      duration: 1.5,
      ease: 'expo.inOut'
    });
  });
}
