'use client';

import { cn } from '@/lib/utils';

export interface RailItem {
  id: string;
  label: string;
}

/**
 * Penanda seksi yang menempel di tepi kiri layar (desktop). Pengganti bilah
 * kedua di bawah navbar: hanya garis-garis kecil, label seksi aktif terlihat,
 * label lain muncul saat rel disorot. Klik untuk lompat.
 */
export default function SideRail({ items, active, onPick, label }: { items: RailItem[]; active: string; onPick: (id: string) => void; label: string }) {
  return (
    <nav aria-label={label} className="group/rail no-print fixed left-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-1.5 lg:flex">
      {items.map(it => {
        const on = it.id === active;
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onPick(it.id)}
            aria-current={on ? 'true' : undefined}
            className="flex items-center gap-2.5 py-1 text-left"
          >
            <span className={cn('h-[3px] rounded-full transition-all duration-base ease-out-expo', on ? 'w-7 bg-accent' : 'w-3.5 bg-navy-30 group-hover/rail:bg-navy-50')} />
            <span
              className={cn(
                'whitespace-nowrap rounded-full px-2.5 py-1 text-[12.5px] font-bold transition-all duration-base ease-out-expo',
                on
                  ? 'border border-glass-border bg-glass-strong text-navy shadow-glass-soft backdrop-blur-glass'
                  : 'pointer-events-none -translate-x-1 text-secondary opacity-0 group-hover/rail:pointer-events-auto group-hover/rail:translate-x-0 group-hover/rail:opacity-100 hover:text-navy',
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
