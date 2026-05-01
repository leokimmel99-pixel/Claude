import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HeroScene } from './heroScene';

gsap.registerPlugin(ScrollTrigger);

export function initHeroNarrative() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const heroScene = new HeroScene(canvas);

  // Setup GSAP Timeline for the pinned section
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#hero-narrative',
      start: 'top top',
      end: '+=3000', // Scroll for 3000px to go through phases
      pin: true,
      scrub: 1,
      onUpdate: (self) => {
        heroScene.updateScrollState(self.progress);
      }
    }
  });

  // Typography choreography
  // Initially, hide Phase 2 and 3
  gsap.set('#phase-2, #phase-3', { opacity: 0, y: 50, pointerEvents: 'none' });

  // Phase 1 Entrance
  gsap.set('#phase-1', { opacity: 1 }); // Make phase 1 container visible
  gsap.fromTo('#phase-1 .stagger-text',
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.1, duration: 1, ease: 'power3.out' }
  );

  // Transition from Phase 1 to Phase 2
  tl.to('#phase-1', { opacity: 0, y: -50, duration: 1 })
    .to('#phase-2', { opacity: 1, y: 0, duration: 1, pointerEvents: 'auto' })
    // Hold Phase 2
    .to({}, { duration: 1 })
    // Transition from Phase 2 to Phase 3
    .to('#phase-2', { opacity: 0, y: -50, duration: 1 })
    .to('#phase-3', { opacity: 1, y: 0, duration: 1, pointerEvents: 'auto' });

  return heroScene;
}
