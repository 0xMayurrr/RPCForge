import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ─── HERO ────────────────────────────────────────────────────────────

  gsap.from('.hero-badge', { scale: 0.9, opacity: 0, duration: 0.5, ease: 'power2.out' });

  gsap.from('.hero-word', { y: 40, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', delay: 0.2 });

  gsap.from('.hero-sub', { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out', delay: 0.6 });

  gsap.from('.hero-cta', { y: 20, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.8 });

  gsap.from('.hero-terminal', { y: 40, opacity: 0, duration: 0.8, ease: 'power2.out', delay: 0.5 });

  gsap.to('.glow-orb', { y: -20, duration: 4, yoyo: true, repeat: -1, ease: 'sine.inOut', stagger: 1 });

  // ─── NAVBAR ──────────────────────────────────────────────────────────

  ScrollTrigger.create({
    trigger: 'body',
    start: 'top -80px',
    onEnter: () => {
      gsap.to('nav', { backgroundColor: 'rgba(9,9,11,0.95)', duration: 0.3 });
    },
    onLeaveBack: () => {
      gsap.to('nav', { backgroundColor: 'rgba(9,9,11,0.8)', duration: 0.3 });
    },
  });
}
