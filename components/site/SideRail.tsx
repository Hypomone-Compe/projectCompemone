'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface RailItem {
  id: string;
  label: string;
}

/**
 * Penanda seksi di tepi kiri layar (desktop). Saat diam hanya garis kecil
 * (garis pink panjang = seksi aktif) supaya tidak menutupi isi halaman.
 * Label muncul saat disorot/difokus, dan langsung menutup lagi setelah diklik.
 */
export default function SideRail({ items, active, onPick, label }: { items: RailItem[]; active: string; onPick: (id: string) => void; label: string }) {
  const [buka, setBuka] = useState(false);

  return (
    <nav
      aria-label={label}
      onMouseEnter={() => setBuka(true)}
      onMouseLeave={() => setBuka(false)}
      onFocus={() => setBuka(true)}
      onBlur={e => !e.currentTarget.contains(e.relatedTarget as Node) && setBuka(false)}
      className="no-print fixed left-0 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-1.5 py-3 pl-3 pr-4 lg:flex"
    >
      {items.map(it => {
        const on = it.id === active;
        return (
          <button
            key={it.id}
            type="button"
            onClick={e => {
              onPick(it.id);
              setBuka(false);
              e.currentTarget.blur();
            }}
            aria-current={on ? 'true' : undefined}
            aria-label={it.label}
            title={it.label}
            className="flex items-center gap-2.5 py-1 text-left"
          >
            <span className={cn('h-[3px] rounded-full transition-all duration-base ease-out-expo', on ? 'w-7 bg-accent' : 'w-3.5 bg-navy-30')} />
            <span
              aria-hidden
              className={cn(
                'whitespace-nowrap rounded-full border border-glass-border bg-glass-strong px-2.5 py-1 text-[12.5px] font-bold shadow-glass-soft backdrop-blur-glass transition-all duration-base ease-out-expo',
                on ? 'text-ink' : 'text-secondary hover:text-ink',
                buka ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-1 opacity-0',
              )}
            >
              {it.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
