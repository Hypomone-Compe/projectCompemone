'use client';

import { useEffect, useState } from 'react';
import { scrollKe } from '@/lib/scroll';
import SideRail from '@/components/site/SideRail';

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
    scrollKe(el, 100);
  }

  return <SideRail label="Bagian halaman" items={sections.map(x => ({ id: x.id, label: x.short }))} active={active} onPick={lompat} />;
}
