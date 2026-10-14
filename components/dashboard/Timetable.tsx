import Link from 'next/link';
import type { CSSProperties } from 'react';
import { metaById, shortName } from '@/lib/courses/meta';
import { weeklyTimetable } from '@/lib/plan';

/** Jadwal tetap mingguan, diambil dari file .ics jadwal kuliah. */
export default function Timetable({ todayDow }: { todayDow: number }) {
  const days = weeklyTimetable();

  return (
    <div className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
      {days.map(d => {
        const kini = d.day === todayDow;
        return (
          <div
            key={d.day}
            className={`rounded-[var(--radius-lg)] border p-4 ${
              kini ? 'on-dark border-transparent' : 'border-[var(--rule)] bg-[var(--white)]'
            }`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="eyebrow eyebrow--plain" style={kini ? { color: 'var(--lime)' } : undefined}>
                {d.name}
              </span>
              {kini && <span className="dot dot--pulse" style={{ background: 'var(--lime)' }} aria-hidden="true" />}
            </div>

            <ul className="mt-4 space-y-3.5">
              {d.sessions.length === 0 && <li className="text-sm muted">Kosong</li>}
              {d.sessions.map((s, i) => {
                const c = metaById[s.cid];
                return (
                  <li key={i} style={{ '--c': c.accent, '--c-on': c.accentOn } as CSSProperties}>
                    <Link href={`/matkul/${c.id}`} className="group block border-l-2 c-border pl-3">
                      <div className="num text-[0.68rem] opacity-70">
                        {s.from}–{s.to}
                      </div>
                      <div
                        className="mt-0.5 text-[0.86rem] font-semibold leading-snug group-hover:underline"
                        style={{ letterSpacing: '-0.02em' }}
                      >
                        {shortName(c)}
                        {s.kind !== 'Kelas' && (
                          <span className="ml-1.5 text-[0.6rem] font-medium uppercase tracking-[0.1em] c-text">
                            {s.kind}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-[0.7rem] leading-snug opacity-65">{s.room}</div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
