import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export let lenis;

export function initSmoothScroll() {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo easing
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  // Sync GSAP ScrollTrigger with Lenis
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  initScrollProgress();
}

function initScrollProgress() {
  const fill = document.getElementById('scroll-progress-fill');

  // Create a scroll trigger that spans the whole document
  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      // Update height
      gsap.set(fill, { height: `${self.progress * 100}%` });

      // Interpolate color from Amber (Heating) to Cyan (Cooling)
      // We'll use a simple color interpolation in JS for performance
      const p = self.progress;
      // Amber: #ff6b35 (255, 107, 53)
      // Cyan: #00f0ff (0, 240, 255)
      const r = Math.round(255 + (0 - 255) * p);
      const g = Math.round(107 + (240 - 107) * p);
      const b = Math.round(53 + (255 - 53) * p);

      gsap.set(fill, { backgroundColor: `rgb(${r}, ${g}, ${b})` });
    }
  });
}
