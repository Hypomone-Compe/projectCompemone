'use client';

/**
 * Pelacak 95 topik ICAIC: dicentang saat sudah dikuasai. Dikelompokkan per
 * sesi akhir pekan (rencana di lib/icaic.ts) supaya terlihat apakah semua
 * topik tuntas sebelum H-2 pekan UAS (26 Nov).
 */
import { useMemo, useState } from 'react';
import { PELATIHAN_ICAIC, SESI_ICAIC, TOPIK_ICAIC } from '@/lib/icaic';
import { H2_UAS } from '@/lib/jadwal';
import { diffDays, fmtDate, fmtDateLong } from '@/lib/kalender';
import { getHarian, tandaiIcaic, useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Bar } from '@/components/kit';

export default function IcaicTracker({ hariIni }: { hariIni: string }) {
  useStore();
  const tanda = getHarian().icaic || {};
  const selesai = TOPIK_ICAIC.filter(t => tanda[String(t.no)]).length;
  const persen = Math.round((selesai / TOPIK_ICAIC.length) * 100);
  const sisaHari = diffDays(H2_UAS, hariIni);
  const [semua, setSemua] = useState(false);

  const perKategori = useMemo(() => {
    const m = new Map<string, { total: number; done: number }>();
    TOPIK_ICAIC.forEach(t => {
      const x = m.get(t.kategori) || { total: 0, done: 0 };
      x.total++;
      if (tanda[String(t.no)]) x.done++;
      m.set(t.kategori, x);
    });
    return [...m.entries()];
  }, [tanda]);

  /* Default: sesi hari ini & yang akan datang; sesi lampau yang belum tuntas tetap tampil. */
  const tanggalSesi = [...new Set(SESI_ICAIC.map(s => s.tanggal))];
  const tampil = tanggalSesi.filter(
    tgl => semua || tgl >= hariIni || SESI_ICAIC.some(s => s.tanggal === tgl && s.topik.some(n => !tanda[String(n)])),
  );

  return (
    <div id="icaic" className="card scroll-mt-28">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h4 className="card__title">ICAIC · 95 topik inti</h4>
        <span className="display c-text" style={{ fontSize: '1.4rem', fontVariantNumeric: 'tabular-nums' }}>
          {selesai}/95
        </span>
      </div>
      <p className="mt-1 text-[0.72rem] muted">
        Dikerjakan tiap akhir pekan, dua sesi per hari. Target tuntas sebelum H-2 pekan UAS ({fmtDateLong(H2_UAS)}
        {sisaHari > 0 ? `, ${sisaHari} hari lagi` : ''}). Centang topik setelah bisa menjelaskan & mengerjakan soalnya.
      </p>
      <Bar value={persen} className="mt-3" />

      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {perKategori.map(([k, v]) => (
          <li key={k} className="text-[0.72rem]">
            <span className="flex justify-between gap-2">
              <span className="truncate font-semibold">{k}</span>
              <span className="num muted">
                {v.done}/{v.total}
              </span>
            </span>
            <Bar value={(v.done / v.total) * 100} className="mt-1" />
          </li>
        ))}
      </ul>

      <div className="mt-5 space-y-4 border-t border-[var(--rule)] pt-4">
        {tampil.map(tgl => {
          const sesi = SESI_ICAIC.filter(s => s.tanggal === tgl);
          const kini = tgl === hariIni;
          return (
            <section key={tgl} aria-label={`Sesi ICAIC ${fmtDate(tgl)}`} className={cn('rounded-xl p-3', kini ? 'bg-[rgba(242,196,107,0.1)] ring-1 ring-[rgba(242,196,107,0.4)]' : 'bg-[rgba(238,240,251,0.03)]')}>
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[#f2c46b]">
                {fmtDateLong(tgl)}
                {kini ? ' · hari ini' : ''}
              </p>
              {sesi.map(s => (
                <div key={s.sesi} className="mt-2">
                  <p className="text-[0.8rem] font-semibold">
                    {s.sesi === 'pagi' ? '07.15–09.45' : '13.00–15.00'} · {s.judul}
                  </p>
                  {s.topik.length > 0 && (
                    <ul className="mt-1.5 space-y-1">
                      {s.topik.map(n => {
                        const t = TOPIK_ICAIC[n - 1];
                        const on = Boolean(tanda[String(n)]);
                        return (
                          <li key={n}>
                            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-1.5 py-1 hover:bg-[rgba(238,240,251,0.05)]">
                              <input
                                type="checkbox"
                                checked={on}
                                onChange={() => tandaiIcaic(n, on ? null : hariIni)}
                                className="mt-0.5 h-4 w-4 shrink-0 accent-[#f2c46b]"
                              />
                              <span className="min-w-0">
                                <span className={cn('block text-[0.8rem]', on && 'line-through opacity-60')}>
                                  <span className="num muted">#{n}</span> {t.nama}
                                  {t.mandiri && <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-[#f2c46b]">mandiri</span>}
                                </span>
                                <span className="block text-[0.7rem] leading-relaxed muted">{t.isi}</span>
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          );
        })}
      </div>
      <button type="button" onClick={() => setSemua(v => !v)} className="btn btn--light btn--sm mt-3">
        {semua ? 'Sembunyikan sesi yang sudah tuntas' : 'Tampilkan semua sesi'}
      </button>

      <details className="mt-4 text-[0.74rem]">
        <summary className="cursor-pointer font-semibold">Pelatihan Jumat di kampus (referensi)</summary>
        <ul className="mt-2 space-y-1.5 muted">
          {PELATIHAN_ICAIC.map((p, i) => (
            <li key={i}>
              <b className="text-ink">{p.hari}</b>, {p.waktu} · {p.ruang} · {p.pengajar}: {p.topik}
              {p.soal ? ` (${p.soal})` : ''}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
