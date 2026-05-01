import './styles/global.css';
import './styles/home.css';
import barba from '@barba/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { initPreloader } from './scripts/preloader';
import { initCursor } from './scripts/cursor';
import { initNav } from './scripts/nav';
import { initSmoothScroll, lenis } from './scripts/scroll';
import { initHeroNarrative } from './scripts/home';
import { CarryoverNarratives } from './scripts/carryovers';
import './styles/carryovers.css';
import { HeatHazeEffect } from './scripts/pages';
import './styles/pages.css';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Global UI Components
  initCursor();
  initNav();
  initSmoothScroll();

  // Run Preloader
  await initPreloader();

  // Keep track of active instances so we can destroy them on page leave
  let activeHeroScene = null;
  let activeCarryovers = null;
  let activeHeatHaze = null;

  // Initial setup based on current page
  const initCurrentPage = () => {
    const namespace = document.querySelector('[data-barba="container"]').dataset.barbaNamespace;

    // Page entry animations
    const staggerEls = document.querySelectorAll('.stagger-entry');
    if(staggerEls.length) {
      gsap.fromTo(staggerEls,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 1, ease: 'power3.out', delay: 0.5 }
      );
    }

    if (namespace === 'home') {
        activeHeroScene = initHeroNarrative(); // modify initHeroNarrative to return instance
        activeCarryovers = new CarryoverNarratives();
    } else if (namespace === 'heating') {
        activeHeatHaze = new HeatHazeEffect('haze-container-1');
    }
  };

  initCurrentPage();

  // Initialize Barba.js for page transitions
  barba.init({
    sync: true,
    transitions: [{
      name: 'opacity-transition',
      leave(data) {
        // Kill ScrollTriggers specific to the leaving container
        ScrollTrigger.getAll().forEach(t => t.kill());

        // Destroy active WebGL scenes
        if (activeHeroScene) {
            activeHeroScene.destroy();
            activeHeroScene = null;
        }
        if (activeCarryovers) {
            activeCarryovers.destroy();
            activeCarryovers = null;
        }
        if (activeHeatHaze) {
            activeHeatHaze.destroy();
            activeHeatHaze = null;
        }

        return gsap.to(data.current.container, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut'
        });
      },
      enter(data) {
        // Reset scroll position on enter
        if (lenis) {
          lenis.scrollTo(0, { immediate: true });
        }

        // Fire entry animations for any stagger elements on the new page
        const staggerEls = data.next.container.querySelectorAll('.stagger-entry');
        if(staggerEls.length) {
          gsap.fromTo(staggerEls,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.1, duration: 1, ease: 'power3.out', delay: 0.2 }
          );
        }

        return gsap.from(data.next.container, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut'
        });
      }
    }],
    views: [
      {
        namespace: 'home',
        afterEnter() {
          activeHeroScene = initHeroNarrative();
          activeCarryovers = new CarryoverNarratives();
          ScrollTrigger.refresh();
        }
      },
      {
        namespace: 'heating',
        afterEnter() {
          activeHeatHaze = new HeatHazeEffect('haze-container-1');
        }
      }
    ]
  });
});