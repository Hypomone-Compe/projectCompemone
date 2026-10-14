'use client';

import { useEffect, useState } from 'react';
import { scrollKe } from '@/lib/scroll';
import { cn } from '@/lib/utils';

export interface NavSection {
  id: string;
  num: string;
  short: string;
  title?: string;
}

/** Sub-navigasi seksi yang menempel di bawah navbar. Pill tab design system. */
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
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 },
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  function lompat(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    setActive(id);
    scrollKe(el, 150);
  }

  return (
    <nav aria-label="Bagian halaman" className="no-print sticky top-[76px] z-40 py-2 sm:top-[84px]">
      <div className="shell">
        <div className="flex gap-1 overflow-x-auto rounded-full border border-glass-border bg-glass-strong p-[5px] shadow-glass-soft backdrop-blur-glass [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:inline-flex">
          {sections.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => lompat(s.id)}
              aria-current={active === s.id ? 'true' : undefined}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-all duration-base ease-out-expo',
                active === s.id ? 'bg-navy text-white shadow-sm' : 'text-secondary hover:text-navy',
              )}
            >
              {s.short}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
