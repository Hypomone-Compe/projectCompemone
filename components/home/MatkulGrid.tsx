'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { hitungProyeksi } from '@/lib/nilai';
import type { KartuMatkul } from '@/lib/ringkasan-matkul';
import { courseProgress, useStore } from '@/lib/store';

/** Lima kartu matkul, gaya kartu divisi design system. Jalan biasa (tanpa orbit) ke tiap halaman. */
export default function MatkulGrid({ matkul }: { matkul: KartuMatkul[] }) {
  useStore();
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {matkul.map(c => {
        const pro = courseProgress(c.id, c.topicIds.map(id => ({ id })));
        const n = hitungProyeksi(c.id, c.grading);
        return (
          <li key={c.id}>
            <Link
              href={`/matkul/${c.id}`}
              className="group flex h-full min-h-56 flex-col justify-between gap-6 rounded-2xl border border-border bg-white p-5 shadow-sm transition-all duration-base ease-out-expo hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-light active:scale-[.98]"
            >
              <span className="flex items-start justify-between">
                <span
                  className="flex h-11 min-w-11 items-center justify-center rounded-lg px-2 text-[13px] font-extrabold text-white"
                  style={{ background: c.accent }}
                >
                  {c.short.slice(0, 4).toUpperCase()}
                </span>
                <span className="flex items-center gap-2">
                  {c.fokus && <span className="rounded-full bg-pink-pale px-2 py-0.5 text-[11px] font-bold text-accent-hover">Prioritas</span>}
                  <ArrowUpRight
                    aria-hidden
                    className="size-5 opacity-40 transition-all duration-base group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent group-hover:opacity-100"
                  />
                </span>
              </span>
              <span>
                <span className="text-xs font-bold text-muted">
                  Kelas {c.kelas} · {c.sks} SKS
                </span>
                <span className="mt-0.5 block text-lg font-extrabold leading-tight tracking-tight">{c.name}</span>
                <span className="mt-3 block h-[7px] overflow-hidden rounded-full bg-navy-5" aria-hidden>
                  <span className="block h-full rounded-full transition-[width] duration-slow" style={{ width: `${pro.pct}%`, background: c.accent }} />
                </span>
                <span className="mt-2 flex justify-between text-[12.5px] font-semibold text-secondary">
                  <span>{pro.pct}% paham</span>
                  <span>{n.norm == null ? 'nilai –' : `${n.norm.toFixed(0)} · ${n.huruf}`}</span>
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
