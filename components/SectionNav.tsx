'use client';

import { useEffect, useState } from 'react';
import { gulirKe } from '@/lib/gulir';

export interface NavSection {
  id: string;
  num: string;
  short: string;
  title?: string;
}

export default function SectionNav({ sections }: { sections: NavSection[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const els = sections.map(s => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!els.length || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-14% 0px -70% 0px', threshold: 0 },
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  /* Tombol, bukan tautan jangkar: alamat di bilah URL tidak boleh kemasukan
     "#seksi". Gulirnya tetap ikut peredam, bukan lompat mentah. */
  function lompat(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    setActive(id);
    gulirKe(el, 118);
  }

  return (
    <nav className="no-print sticky top-[var(--nav-h)] z-40 border-b border-[var(--rule)] bg-[color-mix(in_srgb,var(--paper)_90%,transparent)] backdrop-blur-md">
      <div className="shell">
        <div className="subnav">
          {sections.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => lompat(s.id)}
              aria-current={active === s.id ? 'true' : undefined}
              className={`opt ${active === s.id ? 'is-on' : ''}`}
            >
              <span className="num opacity-60">{s.num}</span>
              {s.short}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
