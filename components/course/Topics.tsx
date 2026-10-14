'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bar, Rich } from '@/components/kit';
import { courseProgress, getEntry, setEntry, STATUSES, useStore } from '@/lib/store';
import { parseFlag, stripEmoji } from '@/lib/text';
import type { Topic } from '@/lib/types';

const DIFF_LABEL: Record<number, string> = { 1: 'Ringan', 2: 'Sedang', 3: 'Berat' };

/** Cap waktu penyimpanan, mis. "hari ini 21.04" atau "20 Agu 09.13". */
function jamSingkat(ms: number): string {
  const d = new Date(ms);
  const jam = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
  const hariIni = new Date().toDateString() === d.toDateString();
  if (hariIni) return `hari ini ${jam}`;
  const tgl = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(d);
  return `${tgl} ${jam}`;
}

/* Panduan Feynman: kedalaman penjelasan diukur kasar dari panjangnya. */
function feynmanState(text: string) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return { words, level: 0, hint: 'Belum ditulis. Mulai dari satu kalimat saja.' };
  if (words < 30)
    return { words, level: 1, hint: 'Masih terlalu pendek untuk menguji pemahaman. Tambah contoh konkret.' };
  if (words < 80)
    return { words, level: 2, hint: 'Sudah jalan. Sekarang tambahkan: kapan konsep ini gagal atau tidak berlaku?' };
  return {
    words,
    level: 3,
    hint: 'Cukup lengkap. Baca ulang, bagian mana yang masih kamu tulis dengan istilah teknis tanpa menjelaskannya?',
  };
}

/* ------------------------------------------------------------ satu topik */
function TopicCard({
  cid,
  t,
  open,
  onToggle,
}: {
  cid: string;
  t: Topic;
  open: boolean;
  onToggle: () => void;
}) {
  const e = getEntry(cid, t.id);
  const fy = feynmanState(e.t);
  const why = t.why ? parseFlag(t.why) : null;

  return (
    <div id={`topik-${t.id}`} className="card !p-0 scroll-mt-32">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-[var(--paper-2)]"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[0.62rem] uppercase tracking-[0.12em] muted">
              {t.wl || `Minggu ${t.w}`}
            </span>
            {t.d === 3 && <span className="chip chip--c !py-[0.2rem] !text-[0.6rem]">Berat</span>}
            {e.s !== 'belum' && (
              <span
                className={`text-[0.62rem] uppercase tracking-[0.12em] ${e.s === 'paham' ? 'c-text font-semibold' : 'muted'}`}
              >
                {STATUSES.find(s => s.id === e.s)?.label}
              </span>
            )}
            {fy.words > 0 && (
              <span
                className="flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.12em] c-text"
                title="Catatan Feynman tersimpan dan tersinkron"
              >
                <span aria-hidden="true">✓</span>
                Catatan {fy.words} kata
              </span>
            )}
          </div>

          <h4 className="card__title mt-2.5">{stripEmoji(t.t)}</h4>

          {!open && <p className="stat__note mt-2 line-clamp-2">{stripEmoji(t.sum)}</p>}
        </div>

        <span
          className="shrink-0 pt-1 text-xl leading-none muted transition-transform duration-300"
          style={{ transform: open ? 'rotate(45deg)' : 'none' }}
          aria-hidden="true"
        >
          +
        </span>
      </button>

      {open && (
        <div className="space-y-8 border-t border-[var(--rule)] px-5 py-7">
          <p className="text-[0.92rem] leading-relaxed">{stripEmoji(t.sum)}</p>

          {why && (
            <div className="border-l-[3px] c-border pl-4">
              <span className="eyebrow eyebrow--c">Kenapa ini sering bikin tersandung</span>
              <Rich as="p" html={why.text} className="stat__note mt-2" />
            </div>
          )}

          {t.keys && t.keys.length > 0 && (
            <div>
              <span className="eyebrow eyebrow--plain">Yang harus dikuasai</span>
              <ul className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                {t.keys.map((k, i) => (
                  <li key={i} className="flex gap-2.5 text-[0.85rem] leading-relaxed opacity-80">
                    <span
                      aria-hidden="true"
                      className="mt-[0.5rem] h-[4px] w-[4px] shrink-0 rounded-full bg-[var(--rule-strong)]"
                    />
                    <span>{stripEmoji(k)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ----------------- KOTAK FEYNMAN ----------------- */}
          <div className="on-dark rounded-[var(--radius-lg)] p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <span className="eyebrow" style={{ color: 'var(--lime)' }}>
                Kotak Feynman
              </span>
              <span className="num text-[0.68rem] muted">{fy.words} kata</span>
            </div>

            <p className="mt-3 text-[0.85rem] leading-relaxed muted">
              Jelaskan topik ini dengan bahasamu sendiri, seolah ke teman yang belum pernah kuliah
              ini. Tanpa istilah teknis yang tidak kamu jelaskan. Kalau macet di satu bagian, {' '}
              <span className="serif" style={{ color: 'var(--paper)' }}>
                di situlah pemahamanmu bolong.
              </span>
            </p>

            <textarea
              value={e.t || ''}
              onChange={ev => setEntry(cid, t.id, { t: ev.target.value })}
              rows={5}
              placeholder="Jadi begini…"
              className="textarea mt-4"
            />

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="h-[4px] w-24 overflow-hidden rounded-full bg-[var(--rule)]">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${(fy.level / 3) * 100}%`, background: 'var(--lime)' }}
                />
              </div>
              <span className="text-[0.78rem] muted">{fy.hint}</span>
            </div>

            {/* Penyimpanan berjalan diam-diam tiap ketikan, dan diam itulah yang
                bikin ragu. Penanda ini yang membuktikannya sudah tersimpan. */}
            <div
              aria-live="polite"
              className="mt-3 flex items-center gap-2 border-t border-[var(--rule)] pt-3 text-[0.72rem]"
            >
              {e.u ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-[7px] w-[7px] shrink-0 rounded-full"
                    style={{ background: 'var(--lime)' }}
                  />
                  <span style={{ color: 'var(--paper)' }}>Tersimpan otomatis</span>
                  <span className="num muted">{jamSingkat(e.u)}</span>
                </>
              ) : (
                <>
                  <span
                    aria-hidden="true"
                    className="h-[7px] w-[7px] shrink-0 rounded-full border border-[var(--rule-strong)]"
                  />
                  <span className="muted">Tersimpan otomatis begitu kamu mengetik</span>
                </>
              )}
            </div>
          </div>

          {/* ----------------- pertanyaan pemicu ----------------- */}
          {t.probes && t.probes.length > 0 && (
            <div>
              <span className="eyebrow eyebrow--plain">Jawab tanpa membuka catatan</span>
              <ol className="mt-3 space-y-2.5">
                {t.probes.map((p, i) => (
                  <li key={i} className="flex gap-3 text-[0.85rem] leading-relaxed">
                    <span className="num shrink-0 font-semibold c-text">{i + 1}</span>
                    <span className="opacity-80">{stripEmoji(p)}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* ----------------- status ----------------- */}
          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--rule)] pt-5">
            <span className="mr-1 text-[0.62rem] uppercase tracking-[0.12em] muted">Status</span>
            {STATUSES.map(s => (
              <button
                key={s.id}
                onClick={() => setEntry(cid, t.id, { s: s.id })}
                className={`opt ${e.s === s.id ? 'is-on' : ''}`}
              >
                {s.label}
              </button>
            ))}
            <span className="ml-auto text-[0.62rem] uppercase tracking-[0.12em] muted">
              Bobot: {DIFF_LABEL[t.d] || '–'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* =============================== DAFTAR =============================== */
export default function Topics({ cid, topics }: { cid: string; topics: Topic[] }) {
  const snap = useStore();
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const p = courseProgress(cid, topics);

  /* Kartu "materi sulit" di bagian 05 memicu topik terkait terbuka di sini. */
  useEffect(() => {
    const h = (ev: Event) => {
      const id = (ev as CustomEvent<string>).detail;
      setFilter('all');
      setOpenId(id);
      requestAnimationFrame(() => {
        document.getElementById(`topik-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    };
    window.addEventListener('open-topic', h);
    return () => window.removeEventListener('open-topic', h);
  }, []);

  const list = useMemo(() => {
    if (filter === 'all') return topics;
    if (filter === 'hard') return topics.filter(t => t.d === 3);
    if (filter === 'feynman') return topics.filter(t => (getEntry(cid, t.id).t || '').trim().length < 40);
    return topics.filter(t => getEntry(cid, t.id).s === filter);
  }, [topics, cid, filter, snap]);

  const filters: [string, string][] = [
    ['all', `Semua ${topics.length}`],
    ['belum', 'Belum'],
    ['proses', 'Sedang'],
    ['paham', 'Paham'],
    ['hard', 'Berat'],
    ['feynman', 'Feynman kosong'],
  ];

  return (
    <div className="mt-8">
      {/* ringkasan progres */}
      <div className="grid gap-6 border-y border-[var(--rule)] py-7 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ['Pemahaman', `${p.pct}%`],
            ['Sudah paham', `${p.paham}/${p.total}`],
            ['Sedang dipelajari', String(p.proses)],
            ['Feynman terisi', `${p.feynman}/${p.total}`],
          ] as [string, string][]
        ).map(([k, v]) => (
          <div key={k}>
            <span className="stat__label">{k}</span>
            <div
              className="display mt-1.5"
              style={{ fontSize: '2rem', fontVariantNumeric: 'tabular-nums' }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>
      <Bar value={p.pct} className="!rounded-none" />

      {/* filter */}
      <div className="mt-7 flex flex-wrap gap-2">
        {filters.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`opt ${filter === id ? 'is-on' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* daftar */}
      <div className="mt-6 space-y-2.5">
        {list.length === 0 && <p className="empty text-sm muted">Tidak ada topik pada filter ini.</p>}
        {list.map(t => (
          <TopicCard
            key={t.id}
            cid={cid}
            t={t}
            open={openId === t.id}
            onToggle={() => setOpenId(openId === t.id ? null : t.id)}
          />
        ))}
      </div>
    </div>
  );
}
