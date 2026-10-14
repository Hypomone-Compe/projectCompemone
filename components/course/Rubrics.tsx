'use client';

import { useState } from 'react';
import type { Rubric } from '@/lib/types';

/* Isi rubrik hanya dirender saat dibuka.

   PBP punya 7 rubrik dengan ratusan level penilaian. Kalau semuanya ikut
   dirender di HTML (seperti pada <details> bawaan), halaman ini sendirian
   menyumbang lebih dari 100 KB yang hampir tidak pernah dibaca sekaligus. */
export default function Rubrics({ rubrics }: { rubrics: Rubric[] }) {
  const [buka, setBuka] = useState<number | null>(null);

  return (
    <div className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h3 className="display" style={{ fontSize: 'var(--t-lg)' }}>
          Rubrik per <span className="serif">kriteria</span>
        </h3>
        <span className="chip chip--c">Dikutip dari BRP</span>
      </div>
      <p className="lede mt-3 text-[0.92rem]">
        Pakai sebagai checklist sebelum submit. Kolom paling kanan adalah nilai penuh, itu yang
        dikejar, bukan “kurang lebih sudah”.
      </p>

      <div className="mt-6 space-y-2">
        {rubrics.map((r, ri) => {
          const aktif = buka === ri;
          return (
            <div key={ri} className="card !p-0">
              <button
                onClick={() => setBuka(aktif ? null : ri)}
                aria-expanded={aktif}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--paper-2)]"
              >
                <span className="font-semibold" style={{ letterSpacing: '-0.02em' }}>
                  {r.title}
                </span>
                <span
                  className="text-xl leading-none muted transition-transform duration-300"
                  style={{ transform: aktif ? 'rotate(45deg)' : 'none' }}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>

              {aktif && (
                <div className="border-t border-[var(--rule)] px-5 py-6">
                  {r.note && (
                    <p className="mb-6 rounded-[var(--radius)] bg-[color-mix(in_srgb,var(--c)_10%,transparent)] px-4 py-2.5 text-[0.8rem] font-semibold c-text">
                      {r.note}
                    </p>
                  )}

                  <div className="space-y-7">
                    {r.criteria.map((cr, ci) => (
                      <div key={ci}>
                        <div className="font-semibold" style={{ letterSpacing: '-0.02em' }}>
                          {cr.name}
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                          {cr.levels.map((lv, li) => {
                            const best =
                              li === cr.levels.length - 1 &&
                              !/Terlambat|Nilai 0|Tidak dinilai/i.test(lv.d);
                            return (
                              <div
                                key={li}
                                className={`rounded-[var(--radius)] border p-3.5 ${
                                  best
                                    ? 'c-border bg-[color-mix(in_srgb,var(--c)_8%,transparent)]'
                                    : 'border-[var(--rule)]'
                                }`}
                              >
                                <div className={`num text-[0.72rem] font-bold ${best ? 'c-text' : 'muted'}`}>
                                  {lv.p} poin
                                </div>
                                <div className="mt-1.5 text-[0.78rem] leading-relaxed opacity-80">
                                  {lv.d}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {r.extra && (
                    <p className="mt-6 border-l-2 border-[var(--rule-strong)] pl-4 text-[0.8rem] leading-relaxed muted">
                      {r.extra}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
