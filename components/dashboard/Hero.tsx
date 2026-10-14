'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { Mask, Reveal } from '@/components/ui';

export interface HeroStat {
  b: string;
  s: string;
}

export default function Hero({
  kicker,
  stats,
  children,
}: {
  kicker: string;
  stats: HeroStat[];
  children?: ReactNode;
}) {
  const heroRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  /* Cahaya yang mengikuti kursor. Dimatikan lewat media query saat pengguna
     meminta pengurangan gerak. */
  useEffect(() => {
    const hero = heroRef.current;
    const glow = glowRef.current;
    if (!hero || !glow) return;
    const gerak = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      glow.style.left = `${e.clientX - r.left}px`;
      glow.style.top = `${e.clientY - r.top}px`;
    };
    hero.addEventListener('pointermove', gerak);
    return () => hero.removeEventListener('pointermove', gerak);
  }, []);

  return (
    <section
      ref={heroRef}
      className="on-dark relative overflow-hidden pb-[clamp(2.5rem,5vw,4rem)] pt-[clamp(2.5rem,7vw,5rem)]"
    >
      <div className="hairline-grid" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} />
        ))}
      </div>

      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute z-0 hidden -translate-x-1/2 -translate-y-1/2 rounded-full blur-[28px] motion-safe:block"
        style={{
          width: '46vmax',
          height: '46vmax',
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--lime) 20%, transparent), transparent 62%)',
        }}
      />

      <div className="shell relative z-10">
        <span className="eyebrow">{kicker}</span>

        <h1
          className="display my-[clamp(1.5rem,3.5vw,2.5rem)]"
          style={{ fontSize: 'clamp(2.7rem, 9.6vw, 8.5rem)', lineHeight: 0.84 }}
        >
          <Mask>LIMA MATA KULIAH</Mask>
          <Mask delay={90}>TUJUH BELAS MINGGU</Mask>
          <Mask delay={180}>
            <span className="serif">satu</span> RENCANA.
          </Mask>
        </h1>

        {children}

        <div className="mt-[clamp(2rem,5vw,3.5rem)] grid grid-cols-2 gap-5 border-t border-[var(--rule)] pt-6 sm:grid-cols-4">
          {stats.map((x, i) => (
            <Reveal key={x.s} delay={i * 80}>
              <b
                className="display block"
                style={{ fontSize: 'clamp(1.7rem,3vw,2.5rem)', fontVariantNumeric: 'tabular-nums' }}
              >
                {x.b}
              </b>
              <span className="mt-1.5 block text-[0.6875rem] uppercase leading-[1.4] tracking-[0.11em] muted">
                {x.s}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
