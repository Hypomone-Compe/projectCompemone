'use client';

import * as React from 'react';
import { BookOpenCheck, Calculator, CalendarDays, Library, Target, LayoutDashboard, type LucideIcon } from 'lucide-react';
import SideRail from '@/components/site/SideRail';
import { cn } from '@/lib/utils';

export interface Tab {
  id: string;
  label: string;
  Icon: LucideIcon;
}

export const TABS: Tab[] = [
  { id: 'ringkasan', label: 'Ringkasan', Icon: LayoutDashboard },
  { id: 'nilai', label: 'Nilai', Icon: Calculator },
  { id: 'rencana', label: 'Rencana', Icon: CalendarDays },
  { id: 'materi', label: 'Materi', Icon: BookOpenCheck },
  { id: 'strategi', label: 'Strategi', Icon: Target },
  { id: 'sumber', label: 'Sumber', Icon: Library },
];

/**
 * Tab halaman matkul. Semua panel sudah dirender server; tab hanya menentukan
 * mana yang terlihat. Pilihan tab ditulis ke URL (?tab=nilai) supaya bisa
 * dibagikan, ditandai, dan dibuka langsung dari panel kartu di beranda.
 * Dipakai juga halaman Harian dengan daftar tab sendiri; tautan lama berbentuk
 * #jurnal tetap membuka tab yang sesuai.
 */
export default function CourseTabs({
  initial,
  panels,
  tabs = TABS,
  label = 'Bagian mata kuliah',
}: {
  initial: string;
  panels: Record<string, React.ReactNode>;
  tabs?: Tab[];
  label?: string;
}) {
  const valid = tabs.filter(t => panels[t.id]);
  const awal = valid[0]?.id ?? 'ringkasan';
  const [tab, setTab] = React.useState(valid.some(t => t.id === initial) ? initial : awal);
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const topRef = React.useRef<HTMLDivElement>(null);

  /* Tautan ?tab=… di halaman yang sama (mis. kotak status) merender ulang dengan `initial` baru. */
  React.useEffect(() => {
    if (valid.some(t => t.id === initial)) setTab(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  React.useEffect(() => {
    const baca = () => {
      const q = new URLSearchParams(window.location.search).get('tab');
      const h = window.location.hash.slice(1);
      const t = [q, h].find(x => x && valid.some(v => v.id === x)) || awal;
      setTab(t);
    };
    baca();
    window.addEventListener('popstate', baca);
    window.addEventListener('hashchange', baca);
    return () => {
      window.removeEventListener('popstate', baca);
      window.removeEventListener('hashchange', baca);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pilih = (id: string) => {
    setTab(id);
    const url = new URL(window.location.href);
    url.hash = '';
    if (id === awal) url.searchParams.delete('tab');
    else url.searchParams.set('tab', id);
    window.history.pushState(null, '', url);
    /* Kalau tab-bar sudah menempel, kembalikan ke awal panel, bukan ke tengah panel lama. */
    const top = topRef.current;
    if (top && top.getBoundingClientRect().top < 0) {
      window.scrollTo({ top: top.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
    }
  };

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + valid.length) % valid.length;
    refs.current[next]?.focus();
    pilih(valid[next].id);
  };

  return (
    <>
      <div ref={topRef} />
      <SideRail label={label} items={valid} active={tab} onPick={pilih} />
      <div className="no-print py-2">
        <div className="shell">
          <div
            role="tablist"
            aria-label={label}
            className="flex gap-1 overflow-x-auto rounded-full border border-glass-border bg-glass-strong p-[5px] shadow-glass-soft backdrop-blur-glass [scrollbar-width:none] sm:inline-flex [&::-webkit-scrollbar]:hidden"
          >
            {valid.map((t, i) => {
              const on = t.id === tab;
              return (
                <button
                  key={t.id}
                  ref={el => {
                    refs.current[i] = el;
                  }}
                  role="tab"
                  id={`tab-${t.id}`}
                  type="button"
                  aria-selected={on}
                  aria-controls={`panel-${t.id}`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => pilih(t.id)}
                  onKeyDown={e => onKeyDown(e, i)}
                  className={cn(
                    'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-base ease-out-expo focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-light',
                    on ? 'bg-navy text-white shadow-sm' : 'text-secondary hover:text-ink',
                  )}
                >
                  <t.Icon aria-hidden className={cn('size-4', on ? 'text-pink-light' : 'text-faint')} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {valid.map(t => (
        <div
          key={t.id}
          id={`panel-${t.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${t.id}`}
          hidden={t.id !== tab}
          className="shell pb-16 pt-6"
        >
          {panels[t.id]}
        </div>
      ))}
    </>
  );
}
