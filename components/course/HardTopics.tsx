'use client';

import { Rich } from '@/components/ui';
import { getEntry, useStore } from '@/lib/store';
import { parseFlag, stripEmoji } from '@/lib/text';
import type { Topic } from '@/lib/types';

export default function HardTopics({ cid, topics, traps }: { cid: string; topics: Topic[]; traps?: string[] }) {
  useStore();
  const hard = topics.filter(t => t.d === 3);

  function jump(id: string) {
    window.dispatchEvent(new CustomEvent('open-topic', { detail: id }));
  }

  return (
    <div className="mt-8 space-y-14">
      {hard.length > 0 && (
        <div>
          <span className="eyebrow eyebrow--c">
            {hard.length} topik berbobot berat, dahulukan waktu belajarmu di sini
          </span>

          <div className="mt-5 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
            {hard.map(t => {
              const e = getEntry(cid, t.id);
              const why = t.why ? parseFlag(t.why) : null;
              const done = e.s === 'paham';
              return (
                <button
                  key={t.id}
                  onClick={() => jump(t.id)}
                  className="poster c-bg min-h-[15rem] text-left"
                >
                  <div className="flex items-baseline justify-between gap-3 text-[0.62rem] uppercase tracking-[0.14em] opacity-85">
                    <span>{t.wl || `Minggu ${t.w}`}</span>
                    <span>{done ? 'Sudah paham' : e.s === 'proses' ? 'Sedang' : 'Belum'}</span>
                  </div>

                  <h4 className="poster__title">{stripEmoji(t.t)}</h4>

                  {why ? (
                    <Rich
                      as="p"
                      html={why.text}
                      className="line-clamp-4 text-[0.82rem] leading-relaxed opacity-90"
                    />
                  ) : (
                    <p className="line-clamp-4 text-[0.82rem] leading-relaxed opacity-90">
                      {stripEmoji(t.sum)}
                    </p>
                  )}

                  <div className="poster__foot">
                    <span>Buka topik</span>
                    <span aria-hidden="true">↑</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {traps && traps.length > 0 && (
        <div>
          <span className="eyebrow eyebrow--plain">Jebakan yang paling sering memakan korban</span>
          <ol className="mt-5 border-t border-[var(--rule)]">
            {traps.map((raw, i) => {
              const f = parseFlag(raw);
              return (
                <li
                  key={i}
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-b border-[var(--rule)] py-5"
                >
                  <span
                    className="display muted"
                    style={{ fontSize: '1.4rem', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <Rich html={f.text} className="text-[0.9rem] leading-relaxed" />
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
