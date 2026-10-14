'use client';

import { useMemo } from 'react';
import { Rich } from '@/components/ui';
import { clearScores, compAverage, getComp, setSlot, setSlotCount, useStore } from '@/lib/store';
import { letterFor, parseBestOf, parseFlag, parseFreqCount, stripEmoji } from '@/lib/text';
import type { GradeComponent, Grading } from '@/lib/types';

/** "Tugas Pemrograman (TP)" → "TP" · "Mini Quiz (Q)" → "Q" · "Lab" → "Lab" */
function slotPrefix(name: string): string {
  const paren = name.match(/\(([A-Za-z]{1,4})\)/);
  if (paren) return paren[1].toUpperCase();
  /* Nama komponen sering berbentuk "Tugas Individu · Pemrograman Web";
     yang dipakai jadi awalan slot cuma bagian sebelum pemisah. */
  const clean = name.replace(/\([^)]*\)/g, '').replace(/\s*[·,].*$/, '').trim();
  if (clean.length <= 12) return clean;
  const caps = clean.split(/\s+/).filter(w => /^[A-Z]/.test(w)).map(w => w[0]).join('');
  return (caps || clean.slice(0, 4)).toUpperCase();
}

/* ------------------------------------------------------- satu komponen */
function ComponentRow({ cid, comp, idx }: { cid: string; comp: GradeComponent; idx: number }) {
  const defaultN = parseFreqCount(comp.freq);
  const bestOf = parseBestOf(comp.freq);
  const { n, v } = getComp(cid, idx, defaultN);
  const avg = compAverage(cid, idx, defaultN, bestOf);
  const note = parseFlag(comp.note);
  const filled = Object.keys(v).length;
  const prefix = slotPrefix(comp.name);

  return (
    <div className="border-b border-[var(--rule)] py-6 last:border-b-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h4 className="card__title flex-1">{stripEmoji(comp.name)}</h4>
        <div className="flex items-baseline gap-4">
          {comp.min && <span className="text-[0.65rem] uppercase tracking-[0.12em] muted">min {comp.min}</span>}
          <span
            className="display c-text"
            style={{ fontSize: '1.5rem', fontVariantNumeric: 'tabular-nums' }}
          >
            {comp.weight}%
          </span>
        </div>
      </div>

      {note.text && <Rich as="p" html={note.text} className="stat__note mt-2 max-w-4xl" />}

      {/* --------- slot nilai per instansi --------- */}
      <div className="mt-5 flex flex-wrap items-end gap-2">
        {Array.from({ length: n }, (_, i) => (
          <label key={i} className="block">
            <span className="mb-1.5 block text-center text-[0.62rem] uppercase tracking-[0.08em] muted">
              {n > 1 ? `${prefix} ${i + 1}` : prefix}
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              placeholder=", "
              value={v[i] ?? ''}
              onChange={e => setSlot(cid, idx, i, e.target.value, defaultN)}
              aria-label={`Nilai ${prefix} ${i + 1} untuk ${comp.name}`}
              className={`score ${v[i] != null ? 'score--filled' : ''}`}
            />
          </label>
        ))}

        <div className="ml-1 flex items-center gap-1 pb-[1px]">
          <button
            onClick={() => setSlotCount(cid, idx, n - 1, defaultN)}
            disabled={n <= 1}
            className="stepper"
            aria-label="Kurangi jumlah slot"
          >
            −
          </button>
          <button
            onClick={() => setSlotCount(cid, idx, n + 1, defaultN)}
            className="stepper"
            aria-label="Tambah slot"
          >
            +
          </button>
        </div>

        <div className="ml-auto pb-1 text-right">
          <div className="text-[0.62rem] uppercase tracking-[0.12em] muted">Rata-rata</div>
          <div className="display mt-0.5" style={{ fontSize: '1.6rem', fontVariantNumeric: 'tabular-nums' }}>
            {avg == null ? ', ' : avg.toFixed(1)}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.65rem] uppercase tracking-[0.1em]">
        <span className="muted">
          {filled}/{n} terisi · BRP: {stripEmoji(comp.freq) || ', '}
        </span>
        {bestOf && <span className="c-text font-semibold">Dihitung dari {bestOf} nilai terbaik</span>}
      </div>
    </div>
  );
}

/* ============================== KALKULATOR ============================== */
export default function GradeCalculator({ cid, grading }: { cid: string; grading: Grading }) {
  const snap = useStore();
  const comps = grading.components;

  const calc = useMemo(() => {
    let wSum = 0;
    let sSum = 0;
    let totalWeight = 0;
    comps.forEach((comp, i) => {
      totalWeight += comp.weight;
      const avg = compAverage(cid, i, parseFreqCount(comp.freq), parseBestOf(comp.freq));
      if (avg != null) {
        wSum += comp.weight;
        sSum += (avg * comp.weight) / 100;
      }
    });
    const norm = wSum > 0 ? (sSum / wSum) * 100 : null;
    const remaining = Math.max(0, totalWeight - wSum);
    const needA = grading.scale.find(s => s.g === 'A')?.min ?? 85;
    /* Berapa rata-rata yang dibutuhkan dari sisa bobot supaya total ≥ A */
    const need = remaining > 0 ? ((needA / 100) * totalWeight - sSum) / (remaining / 100) : null;
    return { wSum, sSum, norm, remaining, totalWeight, needA, need };
  }, [comps, cid, grading.scale, snap]);

  const grade = calc.norm == null ? ', ' : letterFor(grading.scale, calc.norm);

  return (
    <div className="mt-8">
      {/* ---------------- proyeksi (di atas, karena inilah alasan halaman ini dibuka) ---------------- */}
      <div className="grid gap-2.5 lg:grid-cols-[1.5fr_1fr]">
        <div className="on-dark rounded-[var(--radius-lg)] p-[clamp(1.4rem,3vw,2.4rem)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="eyebrow" style={{ color: 'var(--lime)' }}>
                Proyeksi nilai akhir
              </span>
              <div className="mt-4 flex items-baseline gap-4">
                <span
                  className="display"
                  style={{ fontSize: 'clamp(3rem,7vw,4.6rem)', fontVariantNumeric: 'tabular-nums' }}
                >
                  {calc.norm == null ? ', ' : calc.norm.toFixed(1)}
                </span>
                <span
                  className="display c-bg rounded-[var(--radius)] px-3 py-1.5"
                  style={{ fontSize: '1.8rem' }}
                >
                  {grade}
                </span>
              </div>
            </div>
            <button onClick={() => clearScores(cid)} className="btn btn--ghost btn--sm">
              Kosongkan
            </button>
          </div>

          <p className="lede mt-6 text-[0.92rem]">
            {calc.norm == null ? (
              <>
                Isi nilai di bawah. Komponen yang belum ada nilainya diabaikan dan bobot sisanya
                dinormalisasi, jadi angka ini selalu berarti{' '}
                <span className="serif">“kalau performa sekarang bertahan”.</span>
              </>
            ) : (
              <>
                Dari <b style={{ color: 'var(--paper)' }}>{calc.wSum.toFixed(1)}%</b> bobot yang sudah
                terisi kamu mengumpulkan{' '}
                <b style={{ color: 'var(--paper)' }}>{calc.sSum.toFixed(1)} poin</b>.{' '}
                {calc.need == null ? (
                  <>Semua komponen sudah terisi, ini nilai akhirmu.</>
                ) : calc.need <= 0 ? (
                  <b style={{ color: 'var(--lime)' }}>
                    Nilai A sudah aman bahkan kalau sisa komponen kosong.
                  </b>
                ) : calc.need > 100 ? (
                  <b style={{ color: 'var(--amber)' }}>
                    A sudah tidak terjangkau dari sisa {calc.remaining.toFixed(1)}% bobot. Kejar
                    setinggi mungkin, jangan ada yang nol.
                  </b>
                ) : (
                  <>
                    Untuk <b style={{ color: 'var(--paper)' }}>A (≥{calc.needA})</b> kamu butuh
                    rata-rata{' '}
                    <b style={{ color: 'var(--lime)' }}>{calc.need.toFixed(1)}</b> dari sisa{' '}
                    {calc.remaining.toFixed(1)}% bobot.
                    {calc.need >= 95 && (
                      <b style={{ color: 'var(--amber)' }}> Nyaris tanpa ruang kesalahan.</b>
                    )}
                  </>
                )}
              </>
            )}
          </p>

          <p className="mt-6 border-t border-[var(--rule)] pt-4 text-xs leading-relaxed muted">
            Tersimpan otomatis di browser ini. Total bobot BRP: {stripEmoji(grading.total)}.
          </p>
        </div>

        <div className="card">
          <span className="eyebrow eyebrow--plain">Konversi huruf</span>
          <div className="mt-4 grid grid-cols-3 gap-1.5">
            {grading.scale.map(s => {
              const hit = calc.norm != null && grade === s.g;
              return (
                <div
                  key={s.g}
                  className={`rounded-[var(--radius)] px-2 py-3 text-center ${
                    hit ? 'c-bg' : 'bg-[var(--paper-2)]'
                  }`}
                >
                  <div className="display text-base leading-none">{s.g}</div>
                  <div className="num mt-1 text-[0.62rem] opacity-70">≥{s.min}</div>
                </div>
              );
            })}
          </div>
          {grading.components.some(x => x.min) && (
            <p className="stat__note mt-4">
              Matkul ini punya syarat skor minimum per komponen. Total tinggi tidak menolong kalau
              ada satu komponen yang jatuh di bawah batasnya.
            </p>
          )}
        </div>
      </div>

      {/* ---------------- tabel komponen ---------------- */}
      <div className="card mt-2.5 !py-1">
        {comps.map((comp, i) => (
          <ComponentRow key={i} cid={cid} comp={comp} idx={i} />
        ))}
      </div>

      {/* ---------------- aturan penting ---------------- */}
      {grading.notes && grading.notes.length > 0 && (
        <div className="mt-2.5 rounded-[var(--radius-lg)] bg-[var(--paper-2)] p-[clamp(1.2rem,2.5vw,2rem)]">
          <span className="eyebrow eyebrow--c">Aturan yang menentukan nilai</span>
          <ul className="mt-5 space-y-4">
            {grading.notes.map((raw, i) => {
              const f = parseFlag(raw);
              const loud = f.flag === 'danger' || f.flag === 'warn' || f.flag === 'gem';
              return (
                <li key={i} className={loud ? 'border-l-[3px] c-border pl-4' : 'pl-4'}>
                  <Rich html={f.text} className="text-[0.88rem] leading-relaxed" />
                </li>
              );
            })}
          </ul>
        </div>
      )}

    </div>
  );
}
