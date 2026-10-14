'use client';

import type Lenis from 'lenis';

let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => (lenis = l);

/** Gulir halus ke elemen, memperhitungkan tinggi navbar + sub-navigasi yang menempel. */
export function scrollKe(el: HTMLElement, offset = 140) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (lenis && !reduce) {
    lenis.scrollTo(el, { offset: -offset, duration: 1.1 });
    return;
  }
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
}
