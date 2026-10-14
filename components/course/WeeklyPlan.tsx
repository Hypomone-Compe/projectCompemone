import { addDays, fmtRange, parseYmd, TOTAL_WEEKS, weekStartYmd, ymd } from '@/lib/kalender';
import { DEADLINE_FLAGS, parseFlag, stripEmoji } from '@/lib/text';
import type { CourseContent } from '@/lib/types';
import SorotMingguIni from './SorotMingguIni';

/** Kelima matkul kini memakai w.n sebagai minggu kalender semester; penomoran
    khas matkul (mis. "Minggu 8" OS di pekan kalender ke-10) ada di w.label. */
const OFFSET: Record<string, number> = {};

/* Status minggu (berjalan / sudah lewat) dipasang di klien lewat
   data-week-state, supaya halaman ini tetap bisa di-prerender. */
export default function WeeklyPlan({ cid, weeks }: { cid: string; weeks: CourseContent['weeks'] }) {
  const off = OFFSET[cid] ?? 1;

  return (
    <>
      <SorotMingguIni />
      <ol className="mt-8 border-t border-[var(--ink)]">
        {weeks.map(w => {
          const gi = w.n - off;
          const inRange = gi >= 0 && gi < TOTAL_WEEKS;
          const start = inRange ? weekStartYmd(gi) : null;
          const end = start ? ymd(addDays(parseYmd(start), 6)) : null;
          const tasks = (w.tasks || []).map(parseFlag).filter(t => t.text);
          const isExam = w.flag === 'exam';

          return (
            <li
              key={`${w.n}-${w.title}`}
              data-week-start={start ?? undefined}
              className="minggu grid gap-x-8 gap-y-3 border-b border-[var(--rule)] py-6 md:grid-cols-[9rem_minmax(0,1fr)]"
            >
              <div>
                <div className="minggu__label num font-semibold">{w.label || `Minggu ${w.n}`}</div>
                {start && end && (
                  <div className="num mt-1 text-[0.68rem] muted">{fmtRange(start, end)}</div>
                )}
                <div className="minggu__kini eyebrow eyebrow--c mt-2">Minggu ini</div>
              </div>

              <div>
                <h4
                  className={isExam ? 'display' : 'card__title'}
                  style={isExam ? { fontSize: '1.4rem' } : undefined}
                >
                  {stripEmoji(w.title)}
                </h4>

                {w.points && w.points.length > 0 && (
                  <ul className="mt-2.5 space-y-1.5">
                    {w.points.map((p, i) => (
                      <li key={i} className="flex gap-2.5 text-[0.84rem] leading-relaxed opacity-78">
                        <span
                          aria-hidden="true"
                          className="mt-[0.5rem] h-[4px] w-[4px] shrink-0 rounded-full bg-[var(--rule-strong)]"
                        />
                        <span>{stripEmoji(p)}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {tasks.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tasks.map((t, i) => (
                      <span
                        key={i}
                        className={`chip ${DEADLINE_FLAGS.has(t.flag) ? 'chip--c' : ''}`}
                        style={{ textTransform: 'none', letterSpacing: '0.01em' }}
                      >
                        {t.text}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
