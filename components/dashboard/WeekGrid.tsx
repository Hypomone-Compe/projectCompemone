'use client';

import Link from 'next/link';
import { useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import { metaById, shortName } from '@/lib/courses/meta';
import { fmtDate, fmtRange } from '@/lib/kalender';
import type { SemesterWeek } from '@/lib/plan';
import { DEADLINE_FLAGS } from '@/lib/text';
import {
  addPlanItem, getPlan, planSummary, removePlanItem,
  setPlanField, togglePlanItem, useStore,
} from '@/lib/store';
import { Bar, Chip, Drawer } from '@/components/kit';

/* =============================== KOTAK =============================== */
function WeekBox({ w, onOpen }: { w: SemesterWeek; onOpen: (w: SemesterWeek) => void }) {
  const sum = planSummary(w.key);
  const courses = [...new Set(w.events.filter(e => e.tasks.length).map(e => e.cid))];

  const tone = w.exam ? 'week--exam' : w.isCurrent ? 'week--now' : w.isPast ? 'week--past' : '';

  return (
    <button type="button" onClick={() => onOpen(w)} className={`week ${tone}`.trim()}>
      <div className="flex items-start justify-between gap-2">
        <span className="week__num">{String(w.n).padStart(2, '0')}</span>
        {w.exam ? (
          <span className="chip chip--solid !px-2 !py-1 !text-[0.6rem]">{w.exam}</span>
        ) : w.isCurrent ? (
          <span className="chip !border-current !px-2 !py-1 !text-[0.6rem]">Kini</span>
        ) : null}
      </div>

      <div className="week__range num">
        {fmtDate(w.start)} – {fmtDate(w.end)}
      </div>

      <div className="mt-auto pt-4">
        {courses.length > 0 && (
          <div className="week__tags">
            {courses.map(cid => (
              <span
                key={cid}
                title={shortName(metaById[cid])}
                className="week__tag"
                style={{ background: w.exam || w.isCurrent ? 'currentColor' : metaById[cid].accent }}
              />
            ))}
          </div>
        )}

        <div className="week__foot">
          <span>
            {w.deadlines.length > 0
              ? `${w.deadlines.length} deadline`
              : w.taskCount > 0
                ? `${w.taskCount} agenda`
                : w.exam
                  ? 'Pekan ujian'
                  : '–'}
          </span>
          {sum.total > 0 && (
            <span className="num opacity-75">
              {sum.done}/{sum.total}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ============================== PANEL ISI ============================== */
function WeekPanel({ w }: { w: SemesterWeek }) {
  useStore();
  const plan = getPlan(w.key);
  const [draft, setDraft] = useState('');

  const withTasks = w.events.filter(e => e.tasks.length || e.isExam);
  const plainAgenda = w.events.filter(e => !e.tasks.length && !e.isExam);

  const already = useMemo(() => new Set((plan.items || []).map(x => x.text)), [plan.items]);

  function addAll() {
    w.deadlines.forEach(d => {
      if (!already.has(d.text)) addPlanItem(w.key, d.text, d.cid);
    });
  }

  function submitItem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    addPlanItem(w.key, draft);
    setDraft('');
  }

  return (
    <div className="space-y-10">
      {/* ---- agenda dari BRP ---- */}
      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className="eyebrow">Agenda dari BRP</span>
          {w.deadlines.length > 0 && (
            <button onClick={addAll} className="btn btn--ghost btn--sm">
              Salin {w.deadlines.length} deadline
            </button>
          )}
        </div>

        {withTasks.length === 0 && plainAgenda.length === 0 && (
          <p className="mt-4 text-sm muted">
            Tidak ada agenda terjadwal minggu ini. Waktu bagus untuk mengejar materi yang tertinggal.
          </p>
        )}

        <div className="mt-4 space-y-3">
          {withTasks.map(ev => {
            const c = metaById[ev.cid];
            return (
              <div
                key={ev.cid}
                style={{ '--c': c.accent, '--c-on': c.accentOn } as CSSProperties}
                className="card"
                >
                <div className="flex items-baseline justify-between gap-3">
                  <Link href={`/matkul/${c.id}`} className="eyebrow eyebrow--c c-text hover:underline">
                    {shortName(c)}
                  </Link>
                  <span className="text-[0.68rem] uppercase tracking-[0.12em] muted">{ev.label}</span>
                </div>

                <h4 className="card__title mt-2.5">{ev.title}</h4>

                {ev.tasks.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {ev.tasks.map((t, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[0.84rem] leading-snug">
                        <span
                          aria-hidden="true"
                          className="mt-[0.45rem] h-[5px] w-[5px] shrink-0 rounded-full"
                          style={{ background: DEADLINE_FLAGS.has(t.flag) ? c.accent : 'var(--rule-strong)' }}
                        />
                        <span className="flex-1 text-[color-mix(in_srgb,var(--ink)_78%,transparent)]">
                          {t.text}
                          {DEADLINE_FLAGS.has(t.flag) && (
                            <span className="ml-2 text-[0.6rem] font-semibold uppercase tracking-[0.12em] c-text">
                              {t.flag === 'quiz' ? 'Kuis' : 'Deadline'}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {plainAgenda.length > 0 && (
          <details className="mt-3">
            <summary className="eyebrow eyebrow--plain hover:text-[var(--ink)]">
              <span className="chev mr-1">+</span> {plainAgenda.length} materi kuliah tanpa tugas
            </summary>
            <ul className="mt-3 space-y-2">
              {plainAgenda.map(ev => (
                <li key={ev.cid} className="flex gap-3 text-[0.82rem] leading-snug">
                  <span
                    className="shrink-0 text-[0.68rem] font-semibold uppercase tracking-[0.1em]"
                    style={{ color: metaById[ev.cid].accent }}
                  >
                    {shortName(metaById[ev.cid])}
                  </span>
                  <span className="muted">{ev.title}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      {/* ---- rencana pribadi ---- */}
      <section className="border-t border-[var(--rule)] pt-8">
        <span className="eyebrow">Rencana kamu minggu ini</span>

        <input
          value={plan.focus || ''}
          onChange={e => setPlanField(w.key, 'focus', e.target.value)}
          placeholder="Satu fokus utama minggu ini…"
          className="input mt-4 font-semibold"
        />

        <form onSubmit={submitItem} className="mt-3 flex gap-2">
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Tambah tugas…"
            className="input flex-1"
          />
          <button type="submit" className="btn btn--sm shrink-0">
            Tambah
          </button>
        </form>

        {(plan.items || []).length > 0 && (
          <ul className="mt-5 divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
            {plan.items!.map(it => (
              <li key={it.id} className="group flex items-start gap-3 py-3">
                <button
                  onClick={() => togglePlanItem(w.key, it.id)}
                  aria-pressed={it.done}
                  className={`mt-[0.1rem] grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border text-[0.6rem] leading-none transition-colors ${
                    it.done
                      ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]'
                      : 'border-[var(--rule-strong)]'
                  }`}
                >
                  {it.done ? '✓' : ''}
                </button>
                <span className={`flex-1 text-[0.86rem] leading-snug ${it.done ? 'muted line-through' : ''}`}>
                  {it.text}
                </span>
                {it.cid && metaById[it.cid] && (
                  <span
                    className="shrink-0 text-[0.62rem] font-semibold uppercase tracking-[0.1em]"
                    style={{ color: metaById[it.cid].accent }}
                  >
                    {metaById[it.cid].short}
                  </span>
                )}
                <button
                  onClick={() => removePlanItem(w.key, it.id)}
                  className="shrink-0 text-xs muted opacity-0 transition-opacity hover:text-[var(--red)] group-hover:opacity-100"
                  aria-label="Hapus"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <textarea
          value={plan.note || ''}
          onChange={e => setPlanField(w.key, 'note', e.target.value)}
          placeholder="Catatan bebas: apa yang berat, apa yang harus ditanyakan ke asdos…"
          rows={3}
          className="textarea mt-4"
        />
      </section>
    </div>
  );
}

/* =============================== GRID =============================== */
export default function WeekGrid({ weeks }: { weeks: SemesterWeek[] }) {
  useStore();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const open = weeks.find(w => w.key === openKey) || null;
  const sum = open ? planSummary(open.key) : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
        {weeks.map(w => (
          <WeekBox key={w.key} w={w} onOpen={x => setOpenKey(x.key)} />
        ))}
      </div>

      <Drawer
        open={!!open}
        onClose={() => setOpenKey(null)}
        label={open ? `Minggu ${open.n}` : 'Detail minggu'}
        head={
          open && (
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="display text-3xl">Minggu {String(open.n).padStart(2, '0')}</span>
                {open.exam && <Chip nada="red">{open.exam}</Chip>}
                {open.isCurrent && <Chip nada="lime">Berjalan</Chip>}
              </div>
              <div className="num mt-1.5 text-xs opacity-70">{fmtRange(open.start, open.end)}</div>
            </div>
          )
        }
      >
        {open && (
          <>
            {open.exam && (
              <div className="alert alert--red mb-8">
                <p className="text-sm leading-relaxed">
                  Pekan <b>{open.exam}</b>. Tanggal pastinya masih perkiraan, konfirmasi ke kalender
                  akademik dan dosen masing-masing kelas.
                </p>
              </div>
            )}

            {sum && sum.total > 0 && (
              <div className="mb-8" style={{ '--c': 'var(--green)' } as CSSProperties}>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="eyebrow eyebrow--plain">Progres checklist</span>
                  <span className="num text-xs">
                    {sum.done}/{sum.total}
                  </span>
                </div>
                <Bar value={sum.ratio * 100} />
              </div>
            )}

            <WeekPanel w={open} />
          </>
        )}
      </Drawer>
    </>
  );
}
