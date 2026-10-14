'use client';

/* =========================================================================
   Grafik halaman harian.

   Sama seperti grafik keuangan: SVG tangan, tanpa pustaka chart, memakai
   perkakas bersama di components/svg.ts supaya sumbu, batang, dan kisinya
   identik di kedua halaman.

   Satu aturan yang dipegang di seluruh berkas ini: hari yang tidak dicatat
   TIDAK digambar sebagai nol. Nol berarti "tidur nol jam" atau "mood
   terburuk", padahal yang terjadi cuma lupa mengisi. Hari kosong meninggalkan
   lubang pada garis dan petak abu pada kalender, dan itu memang jujur.
   ========================================================================= */

import { useId, useState } from 'react';
import { batang, jalurGaris, tickBulat, useLebar } from '@/components/svg';
import {
  HARI_PENDEK, jam, keJam, LABEL_ENERGI, LABEL_MOOD,
  type BarisPekan, type RingkasHari, type Skala, type TitikHari,
} from '@/lib/harian';

const PERMUKAAN = '#ffffff';
const RULE = '#d5d0c2';
const INK = '#12120f';

/* Dua deret di grafik mood dipisahkan lebih dari sekadar warna: mood pakai
   garis penuh, energi pakai garis putus. Pada layar hitam putih atau bagi
   pembaca dengan buta warna, bentuk garisnya yang membedakan. */
export const WARNA_MOOD = '#b3106c';
export const WARNA_ENERGI = '#0e7490';
export const WARNA_TIDUR = '#2b46f0';

/* ------------------------------------------------------------- kerangka */
function Kepala({ judul, ket, kanan }: { judul: string; ket?: string; kanan?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
      <div className="min-w-0">
        <h4 className="card__title">{judul}</h4>
        {ket && <p className="mt-1 text-[0.72rem] leading-relaxed muted">{ket}</p>}
      </div>
      {kanan}
    </div>
  );
}

function Legenda({ butir }: { butir: { nama: string; warna: string; bentuk: 'kotak' | 'garis' | 'putus' }[] }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
      {butir.map(b => (
        <span key={b.nama} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={b.bentuk === 'kotak' ? 'h-2.5 w-2.5 rounded-[2px]' : 'h-[2px] w-4 rounded-full'}
            style={
              b.bentuk === 'putus'
                ? { backgroundImage: `repeating-linear-gradient(90deg, ${b.warna} 0 4px, transparent 4px 7px)` }
                : { background: b.warna }
            }
          />
          <span className="text-[0.72rem] uppercase tracking-[0.1em] muted">{b.nama}</span>
        </span>
      ))}
    </div>
  );
}

/* ================= A. KONSISTENSI TUJUH HARI ================= */
/* Satu batang per hari Senin–Minggu, tingginya persen kebiasaan yang tuntas.
   Ini pertanyaan "pekan ini aku konsisten atau tidak" dalam satu pandangan. */
export function GrafikPekan({
  data,
  sampai,
  judul = 'Konsistensi tujuh hari',
}: {
  data: RingkasHari[];
  /** Tanggal hari ini. Hari sesudahnya digambar, tapi tidak ikut dirata-rata. */
  sampai: string;
  judul?: string;
}) {
  const [ref, lebar] = useLebar<HTMLDivElement>();
  const judulId = useId();

  const KIRI = 38;
  const BAWAH = 30;
  const TINGGI = 210;
  const w = Math.max(lebar, 280);
  const plotW = w - KIRI - 8;
  const plotH = TINGGI - BAWAH - 10;

  const ticks = [0, 25, 50, 75, 100];
  const y = (v: number) => 10 + plotH - (v / 100) * plotH;
  const lebarSlot = plotW / 7;
  const lebarBatang = Math.min(24, lebarSlot * 0.52);

  /* Hari yang belum datang tidak ikut dirata-rata. Kalau ikut, angka pekan
     berjalan selalu terlihat jatuh hanya karena hari Kamis belum tiba, dan
     ubin ringkasan di atas halaman akan menyebut angka yang berbeda. */
  const berjalan = data.filter(d => d.tanggal <= sampai);
  const rataPersen = berjalan.length
    ? Math.round(berjalan.reduce((a, d) => a + d.persen, 0) / berjalan.length)
    : 0;

  return (
    <div className="card">
      <Kepala
        judul={judul}
        ket={
          berjalan.length < data.length
            ? `Rata-rata ${berjalan.length} hari yang sudah berjalan. Hari yang belum datang digambar samar.`
            : 'Persentase kebiasaan aktif yang tuntas tiap hari.'
        }
        kanan={
          <span className="display c-text" style={{ fontSize: '1.5rem', fontVariantNumeric: 'tabular-nums' }}>
            {rataPersen}%
          </span>
        }
      />

      <div ref={ref} className="relative">
        <svg width="100%" height={TINGGI} viewBox={`0 0 ${w} ${TINGGI}`} role="img" aria-labelledby={judulId}>
          <title id={judulId}>{`${judul}, rata-rata ${rataPersen} persen`}</title>

          {ticks.map(t => (
            <g key={t}>
              <line x1={KIRI} x2={w - 8} y1={y(t)} y2={y(t)} stroke={RULE} strokeWidth={1} />
              <text x={KIRI - 8} y={y(t) + 4} textAnchor="end" fontSize={10} fill="#66665c">
                {t}
              </text>
            </g>
          ))}

          {data.map((d, i) => {
            const x = KIRI + i * lebarSlot + (lebarSlot - lebarBatang) / 2;
            const tinggi = (d.persen / 100) * plotH;
            const penuh = d.persen === 100;
            const depan = d.tanggal > sampai;
            return (
              <g key={d.tanggal} opacity={depan ? 0.35 : 1}>
                {/* Bayangan slot supaya hari nol tetap punya wujud. */}
                <path
                  d={batang(x, y(100), lebarBatang, plotH)}
                  fill="var(--c)"
                  opacity={0.07}
                />
                {tinggi > 0 && (
                  <path d={batang(x, y(d.persen), lebarBatang, tinggi)} fill="var(--c)" opacity={penuh ? 1 : 0.78} />
                )}
                <text
                  x={x + lebarBatang / 2}
                  y={TINGGI - 10}
                  textAnchor="middle"
                  fontSize={10}
                  fill={penuh ? INK : '#66665c'}
                  fontWeight={penuh ? 700 : 400}
                >
                  {HARI_PENDEK[i]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.7rem] muted">
        <span>
          Hari penuh:{' '}
          <b className="num text-[var(--ink)]">{berjalan.filter(d => d.total > 0 && d.persen === 100).length}</b> dari{' '}
          {berjalan.length}
        </span>
        <span>
          Total centang:{' '}
          <b className="num text-[var(--ink)]">{data.reduce((a, d) => a + d.tuntas, 0)}</b>
        </span>
      </div>
    </div>
  );
}

/* ================= B. BARIS PER KEBIASAAN ================= */
/* Grid tujuh petak per kebiasaan. Bentuk ini menjawab pertanyaan yang berbeda
   dari grafik di atas: bukan "hari mana yang bocor" tapi "kebiasaan mana". */
export function KisiPekan({
  baris,
  hari,
  onToggle,
  hariIni,
}: {
  baris: BarisPekan[];
  hari: string[];
  onToggle: (tanggal: string, id: string) => void;
  hariIni: string;
}) {
  return (
    <div className="card card--flush overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-[var(--white)] px-4 py-3 text-left text-[0.65rem] uppercase tracking-[0.12em] muted">
              Kebiasaan
            </th>
            {HARI_PENDEK.map((h, i) => (
              <th
                key={h}
                className="px-1 py-3 text-center text-[0.65rem] uppercase tracking-[0.1em]"
                style={{ color: hari[i] === hariIni ? 'var(--c)' : 'var(--ink-mute)' }}
              >
                {h}
              </th>
            ))}
            <th className="px-3 py-3 text-right text-[0.65rem] uppercase tracking-[0.12em] muted">Pekan</th>
          </tr>
        </thead>
        <tbody>
          {baris.map(b => (
            <tr key={b.kebiasaan.id} className="border-t border-[var(--rule)]">
              <td className="sticky left-0 z-10 bg-[var(--white)] px-4 py-3">
                <span className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="h-5 w-[3px] shrink-0 rounded-full"
                    style={{ background: b.kebiasaan.warna }}
                  />
                  <span className="min-w-0">
                    <span className="block text-[0.82rem] font-semibold" style={{ letterSpacing: '-0.01em' }}>
                      {b.kebiasaan.nama}
                    </span>
                    <span className="block text-[0.66rem] muted">{b.target}× per pekan</span>
                  </span>
                </span>
              </td>

              {hari.map((t, i) => {
                const on = b.hari[i];
                const depan = t > hariIni;
                return (
                  <td key={t} className="px-1 py-3 text-center">
                    <button
                      type="button"
                      disabled={depan}
                      onClick={() => onToggle(t, b.kebiasaan.id)}
                      aria-pressed={on}
                      aria-label={`${b.kebiasaan.nama}, ${HARI_PENDEK[i]}`}
                      className="grid h-8 w-8 place-items-center rounded-[6px] border transition-all disabled:cursor-not-allowed disabled:opacity-25"
                      style={{
                        background: on ? b.kebiasaan.warna : 'transparent',
                        borderColor: on ? b.kebiasaan.warna : t === hariIni ? 'var(--ink)' : 'var(--rule-strong)',
                        color: on ? '#ffffff' : 'var(--ink-mute)',
                      }}
                    >
                      <span aria-hidden="true" style={{ fontSize: '0.8rem', lineHeight: 1 }}>
                        {on ? '✓' : ''}
                      </span>
                    </button>
                  </td>
                );
              })}

              <td className="px-3 py-3 text-right">
                <span
                  className="num text-[0.85rem] font-semibold"
                  style={{ color: b.capai ? b.kebiasaan.warna : 'var(--ink-mute)' }}
                >
                  {b.tuntas}/{b.target}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ================= C. PETA BULAN ================= */
/* Heatmap kalender. Skalanya sengaja diskret lima langkah, bukan gradien
   halus: mata tidak bisa membaca beda 62% dan 68% dari kepekatan warna, tapi
   sangat bisa membaca "kosong, sedikit, separuh, banyak, penuh". */
export function PetaBulan({
  hari,
  judul,
  kanan,
}: {
  hari: { tanggal: string; persen: number; total: number; adaJurnal: boolean }[];
  judul: string;
  kanan?: React.ReactNode;
}) {
  const [pilih, setPilih] = useState<string | null>(null);

  /* Kolom kosong di depan supaya tanggal 1 jatuh di kolom hari yang benar. */
  const awal = hari[0] ? (new Date(`${hari[0].tanggal}T00:00:00Z`).getUTCDay() + 6) % 7 : 0;
  const petak = [...Array.from({ length: awal }, () => null), ...hari];

  const tingkat = (p: number, total: number) => {
    if (!total) return 0;
    if (p === 0) return 0;
    if (p < 34) return 1;
    if (p < 67) return 2;
    if (p < 100) return 3;
    return 4;
  };
  const opasitas = [0.06, 0.28, 0.5, 0.74, 1];

  const aktifHari = hari.filter(h => h.total > 0 && h.persen > 0).length;
  const penuh = hari.filter(h => h.total > 0 && h.persen === 100).length;
  const terpilih = pilih ? hari.find(h => h.tanggal === pilih) : null;

  return (
    <div className="card">
      <Kepala judul={judul} ket="Makin pekat, makin banyak kebiasaan yang tuntas hari itu." kanan={kanan} />

      <div className="grid grid-cols-7 gap-1.5">
        {HARI_PENDEK.map(h => (
          <span key={h} className="pb-1 text-center text-[0.6rem] uppercase tracking-[0.08em] muted">
            {h}
          </span>
        ))}

        {petak.map((p, i) =>
          p == null ? (
            <span key={`kosong-${i}`} aria-hidden="true" />
          ) : (
            <button
              key={p.tanggal}
              type="button"
              onClick={() => setPilih(v => (v === p.tanggal ? null : p.tanggal))}
              aria-label={`${p.tanggal}, ${p.persen} persen`}
              className="relative grid aspect-square place-items-center rounded-[5px] border transition-transform hover:scale-[1.08]"
              style={{
                background: `color-mix(in srgb, var(--c) ${opasitas[tingkat(p.persen, p.total)] * 100}%, var(--white))`,
                borderColor: pilih === p.tanggal ? 'var(--ink)' : 'var(--rule)',
              }}
            >
              <span
                className="num text-[0.6rem]"
                style={{ color: tingkat(p.persen, p.total) >= 3 ? '#ffffff' : 'var(--ink-mute)' }}
              >
                {Number(p.tanggal.slice(8))}
              </span>
              {p.adaJurnal && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-[3px] right-[3px] h-[4px] w-[4px] rounded-full"
                  style={{ background: tingkat(p.persen, p.total) >= 3 ? '#ffffff' : 'var(--ink)' }}
                />
              )}
            </button>
          ),
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[0.66rem] uppercase tracking-[0.1em] muted">Sepi</span>
          {opasitas.map((o, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="h-3 w-3 rounded-[3px] border border-[var(--rule)]"
              style={{ background: `color-mix(in srgb, var(--c) ${o * 100}%, var(--white))` }}
            />
          ))}
          <span className="text-[0.66rem] uppercase tracking-[0.1em] muted">Penuh</span>
        </div>
        <span className="text-[0.7rem] muted">
          <b className="num text-[var(--ink)]">{penuh}</b> hari penuh ·{' '}
          <b className="num text-[var(--ink)]">{aktifHari}</b> hari ada centang · titik = ada jurnal
        </span>
      </div>

      {terpilih && (
        <p className="mt-3 border-t border-[var(--rule)] pt-3 text-[0.78rem]">
          <b className="num">{terpilih.tanggal}</b> · {terpilih.persen}% tuntas
          {terpilih.adaJurnal ? ' · jurnal terisi' : ' · jurnal kosong'}
        </p>
      )}
    </div>
  );
}

/* ================= D. MOOD & ENERGI ================= */
export function GrafikMood({ data }: { data: TitikHari[] }) {
  const [ref, lebar] = useLebar<HTMLDivElement>();
  const [petunjuk, setPetunjuk] = useState<TitikHari | null>(null);
  const judulId = useId();

  const KIRI = 30;
  const BAWAH = 26;
  const TINGGI = 200;
  const w = Math.max(lebar, 300);
  const plotW = w - KIRI - 10;
  const plotH = TINGGI - BAWAH - 12;

  const x = (i: number) => KIRI + (data.length > 1 ? (i / (data.length - 1)) * plotW : plotW / 2);
  const y = (v: number) => 12 + plotH - ((v - 1) / 4) * plotH;

  const titik = (ambil: (d: TitikHari) => number | null) =>
    data.map((d, i) => {
      const v = ambil(d);
      return v == null ? null : { x: x(i), y: y(v) };
    });

  const adaData = data.some(d => d.mood != null || d.energi != null);
  const rata = (ambil: (d: TitikHari) => number | null) => {
    const v = data.map(ambil).filter((n): n is number => n != null);
    return v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10 : null;
  };
  const rataMood = rata(d => d.mood);

  return (
    <div className="card">
      <Kepala
        judul="Mood & energi"
        ket={`${data.length} hari terakhir. Garis putus di hari yang tidak dicatat.`}
        kanan={
          rataMood != null ? (
            <span className="display c-text" style={{ fontSize: '1.5rem', fontVariantNumeric: 'tabular-nums' }}>
              {rataMood.toFixed(1)}
            </span>
          ) : undefined
        }
      />

      {adaData ? (
        <>
          <div ref={ref} className="relative">
            <svg
              width="100%"
              height={TINGGI}
              viewBox={`0 0 ${w} ${TINGGI}`}
              role="img"
              aria-labelledby={judulId}
              onMouseLeave={() => setPetunjuk(null)}
            >
              <title id={judulId}>Mood dan energi harian pada skala 1 sampai 5</title>

              {[1, 2, 3, 4, 5].map(t => (
                <g key={t}>
                  <line x1={KIRI} x2={w - 10} y1={y(t)} y2={y(t)} stroke={RULE} strokeWidth={1} />
                  <text x={KIRI - 7} y={y(t) + 4} textAnchor="end" fontSize={10} fill="#66665c">
                    {t}
                  </text>
                </g>
              ))}

              <path d={jalurGaris(titik(d => d.energi))} fill="none" stroke={WARNA_ENERGI} strokeWidth={2} strokeDasharray="5 3" strokeLinecap="round" />
              <path d={jalurGaris(titik(d => d.mood))} fill="none" stroke={WARNA_MOOD} strokeWidth={2} strokeLinecap="round" />

              {data.map((d, i) =>
                d.mood != null ? <circle key={d.tanggal} cx={x(i)} cy={y(d.mood)} r={2.6} fill={WARNA_MOOD} /> : null,
              )}

              {/* Pita transparan untuk menangkap hover per hari. */}
              {data.map((d, i) => (
                <rect
                  key={`hit-${d.tanggal}`}
                  x={x(i) - plotW / data.length / 2}
                  y={0}
                  width={plotW / data.length}
                  height={TINGGI - BAWAH + 10}
                  fill="transparent"
                  onMouseEnter={() => setPetunjuk(d)}
                />
              ))}

              {data.map((d, i) =>
                i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2) ? (
                  <text key={`lb-${d.tanggal}`} x={x(i)} y={TINGGI - 8} textAnchor="middle" fontSize={10} fill="#66665c">
                    {d.label}
                  </text>
                ) : null,
              )}
            </svg>
          </div>

          <Legenda
            butir={[
              { nama: 'Mood', warna: WARNA_MOOD, bentuk: 'garis' },
              { nama: 'Energi', warna: WARNA_ENERGI, bentuk: 'putus' },
            ]}
          />

          <p className="mt-3 min-h-[1.4rem] border-t border-[var(--rule)] pt-3 text-[0.75rem] muted">
            {petunjuk ? (
              <>
                <b className="num text-[var(--ink)]">{petunjuk.label}</b> ·{' '}
                {petunjuk.mood ? `Mood ${LABEL_MOOD[petunjuk.mood as Skala]}` : 'Mood belum dicatat'}
                {petunjuk.energi ? ` · Energi ${LABEL_ENERGI[petunjuk.energi as Skala]}` : ''}
                {petunjuk.tidur != null ? ` · Tidur ${petunjuk.tidur} jam` : ''}
              </>
            ) : (
              'Arahkan kursor ke grafik untuk melihat satu hari.'
            )}
          </p>
        </>
      ) : (
        <p className="py-8 text-center text-[0.8rem] muted">
          Belum ada mood atau energi yang tercatat. Isi jurnal hari ini dan grafik ini mulai terbentuk.
        </p>
      )}
    </div>
  );
}

/* ================= E. JAM FOKUS ================= */
export function GrafikFokus({ data, targetJam = 3 }: { data: TitikHari[]; targetJam?: number }) {
  const [ref, lebar] = useLebar<HTMLDivElement>();
  const [petunjuk, setPetunjuk] = useState<TitikHari | null>(null);
  const judulId = useId();

  const KIRI = 34;
  const BAWAH = 26;
  const TINGGI = 200;
  const w = Math.max(lebar, 300);
  const plotW = w - KIRI - 10;
  const plotH = TINGGI - BAWAH - 12;

  const maks = Math.max(targetJam, ...data.map(d => keJam(d.menit)));
  const ticks = tickBulat(maks, 3);
  const atas = ticks[ticks.length - 1] || 1;
  const y = (v: number) => 12 + plotH - (v / atas) * plotH;

  const lebarSlot = plotW / Math.max(1, data.length);
  const lebarBatang = Math.min(24, lebarSlot * 0.62);

  const totalMenit = data.reduce((a, d) => a + d.menit, 0);
  const hariAda = data.filter(d => d.menit > 0).length;

  return (
    <div className="card">
      <Kepala
        judul="Jam fokus harian"
        ket={`${data.length} hari terakhir. Garis putus adalah target ${targetJam} jam per hari.`}
        kanan={
          <span className="display c-text" style={{ fontSize: '1.5rem', fontVariantNumeric: 'tabular-nums' }}>
            {jam(totalMenit)}
          </span>
        }
      />

      <div ref={ref} className="relative">
        <svg
          width="100%"
          height={TINGGI}
          viewBox={`0 0 ${w} ${TINGGI}`}
          role="img"
          aria-labelledby={judulId}
          onMouseLeave={() => setPetunjuk(null)}
        >
          <title id={judulId}>{`Jam fokus per hari, total ${jam(totalMenit)}`}</title>

          {ticks.map(t => (
            <g key={t}>
              <line x1={KIRI} x2={w - 10} y1={y(t)} y2={y(t)} stroke={RULE} strokeWidth={1} />
              <text x={KIRI - 7} y={y(t) + 4} textAnchor="end" fontSize={10} fill="#66665c">
                {t}j
              </text>
            </g>
          ))}

          {targetJam > 0 && targetJam <= atas && (
            <line
              x1={KIRI}
              x2={w - 10}
              y1={y(targetJam)}
              y2={y(targetJam)}
              stroke={INK}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              opacity={0.55}
            />
          )}

          {data.map((d, i) => {
            const v = keJam(d.menit);
            const tinggi = (v / atas) * plotH;
            const x = KIRI + i * lebarSlot + (lebarSlot - lebarBatang) / 2;
            return (
              <g key={d.tanggal} onMouseEnter={() => setPetunjuk(d)}>
                <rect x={KIRI + i * lebarSlot} y={0} width={lebarSlot} height={TINGGI - BAWAH + 10} fill="transparent" />
                {tinggi > 0 && (
                  <path
                    d={batang(x, y(v), lebarBatang, tinggi)}
                    fill="var(--c)"
                    opacity={v >= targetJam ? 1 : 0.6}
                  />
                )}
              </g>
            );
          })}

          {data.map((d, i) =>
            i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2) ? (
              <text
                key={`lb-${d.tanggal}`}
                x={KIRI + i * lebarSlot + lebarSlot / 2}
                y={TINGGI - 8}
                textAnchor="middle"
                fontSize={10}
                fill="#66665c"
              >
                {d.label}
              </text>
            ) : null,
          )}
        </svg>
      </div>

      <p className="mt-3 min-h-[1.4rem] border-t border-[var(--rule)] pt-3 text-[0.75rem] muted">
        {petunjuk ? (
          <>
            <b className="num text-[var(--ink)]">{petunjuk.label}</b> ·{' '}
            <b className="num text-[var(--ink)]">{jam(petunjuk.menit)}</b> fokus
          </>
        ) : (
          <>
            Terisi <b className="num text-[var(--ink)]">{hariAda}</b> dari {data.length} hari · rata-rata{' '}
            <b className="num text-[var(--ink)]">{jam(hariAda ? totalMenit / hariAda : 0)}</b> pada hari yang ada
            sesinya
          </>
        )}
      </p>
    </div>
  );
}

/* ================= F. TIDUR ================= */
/* Pita 7–9 jam digambar sebagai latar, bukan sebagai garis: rentang sehat itu
   memang rentang, dan menggambarnya sebagai satu garis akan menyarankan ada
   satu angka benar yang harus dikejar. */
export function GrafikTidur({ data }: { data: TitikHari[] }) {
  const [ref, lebar] = useLebar<HTMLDivElement>();
  const judulId = useId();

  const KIRI = 30;
  const BAWAH = 26;
  const TINGGI = 190;
  const w = Math.max(lebar, 300);
  const plotW = w - KIRI - 10;
  const plotH = TINGGI - BAWAH - 12;

  const nilai = data.map(d => d.tidur).filter((n): n is number => n != null);
  const atas = Math.max(10, Math.ceil(Math.max(0, ...nilai)));
  const x = (i: number) => KIRI + (data.length > 1 ? (i / (data.length - 1)) * plotW : plotW / 2);
  const y = (v: number) => 12 + plotH - (v / atas) * plotH;

  const rata = nilai.length ? Math.round((nilai.reduce((a, b) => a + b, 0) / nilai.length) * 10) / 10 : null;
  const cukup = nilai.filter(v => v >= 7).length;

  return (
    <div className="card">
      <Kepala
        judul="Jam tidur"
        ket={`${data.length} hari terakhir. Pita terang menandai rentang 7–9 jam.`}
        kanan={
          rata != null ? (
            <span className="display c-text" style={{ fontSize: '1.5rem', fontVariantNumeric: 'tabular-nums' }}>
              {rata.toFixed(1)}j
            </span>
          ) : undefined
        }
      />

      {nilai.length ? (
        <>
          <div ref={ref}>
            <svg width="100%" height={TINGGI} viewBox={`0 0 ${w} ${TINGGI}`} role="img" aria-labelledby={judulId}>
              <title id={judulId}>{`Jam tidur harian, rata-rata ${rata} jam`}</title>

              <rect
                x={KIRI}
                y={y(9)}
                width={w - KIRI - 10}
                height={Math.max(0, y(7) - y(9))}
                fill={WARNA_TIDUR}
                opacity={0.09}
              />

              {[0, 4, 8, atas].filter((v, i, a) => a.indexOf(v) === i && v <= atas).map(t => (
                <g key={t}>
                  <line x1={KIRI} x2={w - 10} y1={y(t)} y2={y(t)} stroke={RULE} strokeWidth={1} />
                  <text x={KIRI - 7} y={y(t) + 4} textAnchor="end" fontSize={10} fill="#66665c">
                    {t}
                  </text>
                </g>
              ))}

              <path
                d={jalurGaris(data.map((d, i) => (d.tidur == null ? null : { x: x(i), y: y(d.tidur) })))}
                fill="none"
                stroke={WARNA_TIDUR}
                strokeWidth={2}
                strokeLinecap="round"
              />

              {data.map((d, i) =>
                d.tidur == null ? null : (
                  <circle
                    key={d.tanggal}
                    cx={x(i)}
                    cy={y(d.tidur)}
                    r={2.6}
                    fill={d.tidur >= 7 ? WARNA_TIDUR : '#d62b1c'}
                  />
                ),
              )}

              {data.map((d, i) =>
                i === 0 || i === data.length - 1 ? (
                  <text key={`lb-${d.tanggal}`} x={x(i)} y={TINGGI - 8} textAnchor="middle" fontSize={10} fill="#66665c">
                    {d.label}
                  </text>
                ) : null,
              )}
            </svg>
          </div>

          <p className="mt-3 border-t border-[var(--rule)] pt-3 text-[0.75rem] muted">
            <b className="num text-[var(--ink)]">{cukup}</b> dari {nilai.length} malam tercatat mencapai 7 jam atau
            lebih.
            {cukup < nilai.length && ' Titik merah adalah malam di bawah 7 jam.'}
          </p>
        </>
      ) : (
        <p className="py-8 text-center text-[0.8rem] muted">
          Belum ada jam tidur yang tercatat. Isi di bagian jurnal, satu angka saja sudah cukup.
        </p>
      )}
    </div>
  );
}

/* ================= G. POLA HARI DALAM PEKAN ================= */
export function PolaPekan({ data }: { data: { hari: string; persen: number; ada: number }[] }) {
  const maks = Math.max(100, ...data.map(d => d.persen));
  const terkuat = data.reduce((a, b) => (b.persen > a.persen ? b : a), data[0]);
  const terlemah = data.filter(d => d.ada > 0).reduce((a, b) => (b.persen < a.persen ? b : a), data[0]);

  return (
    <div className="card">
      <Kepala judul="Pola hari dalam sepekan" ket="Rata-rata konsistensi per nama hari, dari 8 pekan terakhir." />

      <div className="space-y-2.5">
        {data.map(d => (
          <div key={d.hari} className="flex items-center gap-3">
            <span className="w-9 shrink-0 text-[0.7rem] uppercase tracking-[0.08em] muted">{d.hari}</span>
            <div className="bar__track flex-1">
              <div
                className="bar__fill"
                style={{
                  width: `${(d.persen / maks) * 100}%`,
                  background: d.ada === 0 ? 'var(--rule-strong)' : undefined,
                }}
              />
            </div>
            <span className="num w-11 shrink-0 text-right text-[0.75rem] font-semibold">
              {d.ada ? `${d.persen}%` : '—'}
            </span>
          </div>
        ))}
      </div>

      {terkuat && terlemah && terkuat.persen > 0 && (
        <p className="mt-4 border-t border-[var(--rule)] pt-3 text-[0.75rem] muted">
          Terkuat di hari <b className="text-[var(--ink)]">{terkuat.hari}</b> ({terkuat.persen}%), terlemah di hari{' '}
          <b className="text-[var(--ink)]">{terlemah.hari}</b> ({terlemah.persen}%).
        </p>
      )}
    </div>
  );
}
