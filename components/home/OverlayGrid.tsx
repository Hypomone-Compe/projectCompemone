'use client';

import * as React from 'react';

/**
 * Grid silinder WebGL di belakang panel (port BackgroundGrid design system):
 * garis navy 16%, radius 30, bergeser pelan mengikuti gulir panel lalu di-wrap.
 */
export default function OverlayGrid({ scroller, opacity = 0.07 }: { scroller: React.RefObject<HTMLElement | null>; opacity?: number }) {
  const ref = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import('three');
      if (cancelled) return;
      const RADIUS = 30;
      const w = () => window.innerWidth;
      const h = () => window.innerHeight;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      } catch {
        return;
      }
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(w(), h(), false);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(52, w() / Math.max(h(), 1), 0.1, 300);
      camera.position.set(0, 0, 10);
      const material = new THREE.LineBasicMaterial({ color: 0xb8c2ff, transparent: true, opacity, depthWrite: false });

      let lines: InstanceType<typeof THREE.LineSegments> | null = null;
      let period = 2;
      let pos = 0;
      let target = 0;
      const half = () => Math.max(period * 0.5, 1e-4);
      const wrap = (v: number) => {
        const t = Math.max(period, 2e-4);
        let r = ((v % t) + t) % t;
        if (r >= half()) r -= t;
        return r;
      };
      const shortest = (from: number, to: number) => {
        const t = Math.max(period, 2e-4);
        let d = to - from;
        while (d > half()) d -= t;
        while (d < -half()) d += t;
        return d;
      };

      const build = () => {
        if (lines) {
          scene.remove(lines);
          lines.geometry.dispose();
        }
        const ratio = h() / Math.max(w(), 1);
        const tall = ratio > 1;
        const yExtent = tall ? Math.max(30, 22 * Math.min(ratio, 2.2)) : 22;
        const SEG = 200, VERTICALS = 80, RINGS = tall ? 22 : 16;
        const v: number[] = [];
        for (let i = 0; i < VERTICALS; i++) {
          const a = (i / VERTICALS) * Math.PI * 2;
          v.push(Math.cos(a) * RADIUS, -yExtent, Math.sin(a) * RADIUS, Math.cos(a) * RADIUS, yExtent, Math.sin(a) * RADIUS);
        }
        for (let r = 0; r <= RINGS; r++) {
          const y = -yExtent + (r / RINGS) * yExtent * 2;
          for (let s = 0; s < SEG; s++) {
            const a = (s / SEG) * Math.PI * 2;
            const b = ((s + 1) / SEG) * Math.PI * 2;
            v.push(Math.cos(a) * RADIUS, y, Math.sin(a) * RADIUS, Math.cos(b) * RADIUS, y, Math.sin(b) * RADIUS);
          }
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
        period = (yExtent * 2) / RINGS;
        lines = new THREE.LineSegments(geo, material);
        lines.position.y = pos;
        scene.add(lines);
      };
      build();

      const el = scroller.current;
      let last = el?.scrollTop ?? 0;
      const onScroll = () => {
        const now = el?.scrollTop ?? 0;
        target = wrap(target - (now - last) * 0.003);
        last = now;
      };
      el?.addEventListener('scroll', onScroll, { passive: true });

      let raf = 0;
      const frame = () => {
        raf = requestAnimationFrame(frame);
        const d = shortest(pos, target);
        pos = Math.abs(d) > 1e-4 ? wrap(pos + d * 0.08) : target;
        if (lines) lines.position.y = pos;
        renderer.render(scene, camera);
      };
      frame();
      const onResize = () => {
        camera.aspect = w() / Math.max(h(), 1);
        camera.updateProjectionMatrix();
        renderer.setSize(w(), h(), false);
        build();
      };
      window.addEventListener('resize', onResize);
      requestAnimationFrame(() => (canvas.style.opacity = '1'));

      cleanup = () => {
        cancelAnimationFrame(raf);
        el?.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
        lines?.geometry.dispose();
        material.dispose();
        renderer.dispose();
        /* Lepas konteks WebGL; kalau tidak, buka-tutup panel berulang membuat
           peramban membuang konteks tertua, yaitu milik orbit hero. */
        renderer.getContext().getExtension('WEBGL_lose_context')?.loseContext();
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [scroller, opacity]);

  return <canvas ref={ref} className="kd-grid-canvas" aria-hidden="true" />;
}
