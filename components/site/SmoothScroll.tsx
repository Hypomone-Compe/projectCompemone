'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { setLenis } from '@/lib/scroll';

/** Smooth scroll Lenis, sama dengan beranda design system. Dialog punya gulirnya sendiri. */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    /* Di layar sentuh gulir bawaan sudah halus; Lenis hanya untuk roda tetikus. */
    if (window.matchMedia('(hover: none)').matches) return;
    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 0.95,
      anchors: true,
      prevent: node => !!node.closest?.('[role="dialog"], [data-lenis-prevent]'),
    });
    setLenis(lenis);
    const html = document.documentElement;
    const sync = () => (html.style.overflow === 'hidden' || document.body.style.overflow === 'hidden' ? lenis.stop() : lenis.start());
    const mo = new MutationObserver(sync);
    mo.observe(html, { attributes: true, attributeFilter: ['style'] });
    mo.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      mo.disconnect();
      cancelAnimationFrame(raf);
      setLenis(null);
      lenis.destroy();
    };
  }, []);
  return null;
}
