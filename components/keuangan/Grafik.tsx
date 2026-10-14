'use client';

/* =========================================================================
   Grafik keuangan.

   Perkakas dasarnya (lebar wadah, tick bulat, bentuk batang) ada di
   components/svg.ts, dipakai bersama halaman harian.

   Digambar tangan dengan SVG, tanpa pustaka chart, karena tiga alasan:
   ukurannya nol tambahan di bundel, warnanya ikut token desain situs ini,
   dan bentuk marknya bisa dipatuhi persis (batang ≤24px dengan ujung
   membulat 4px, garis 2px, isian area 10%, kisi hairline solid).

   Warna deret DIPILIH LEWAT VALIDASI, bukan selera. Konvensi hijau/merah
   untuk uang masuk/keluar gagal uji buta warna: pada protanopia jaraknya
   cuma ΔE 4,1 alias praktis kembar. Biru/merah lolos di ΔE 32,3 sekaligus
   tetap terbaca sebagai hangat lawan dingin.
   ========================================================================= */

import { useId, useState } from 'react';
import { batang, tickBulat, useLebar } from '@/components/svg';
import { rupiah, rupiahRingkas, type TitikBulan } from '@/lib/keuangan';

export const WARNA_MASUK = '#2b46f0';
export const WARNA_KELUAR = '#d62b1c';
const PERMUKAAN = '#ffffff';

/* ------------------------------------------------------------- tooltip */
interface Petunjuk {
  x: number;
  y: number;
  isi: TitikBulan;
}

/* Di dalam tooltip, NILAI yang tebal dan nama deret yang samar, kebalikan dari
   legenda. Alasannya pembaca sudah tahu deretnya (dia baru saja mengarahkan ke
   sana) dan yang dicari justru angkanya. Identitas deret dibawa goresan pendek
   berwarna di kiri, bukan dengan mewarnai teksnya. */
function Tooltip({ p, lebar }: { p: Petunjuk; lebar: number }) {
  /* Jaga supaya kotaknya tidak keluar dari tepi wadah. */
  const kiri = Math.max(8, Math.min(p.x, lebar - 172));
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-10 w-[164px] rounded-[var(--radius)] border border-[var(--rule-strong)] bg-[var(--white)] px-3 py-2.5 shadow-[0_8px_24px_rgba(18,18,15,0.16)]"
      style={{ left: kiri, top: Math.max(4, p.y - 76) }}
    >
      <div className="text-[0.68rem] uppercase tracking-[0.12em] muted">{p.isi.label}</div>
      {(
        [
          ['Masuk', p.isi.masuk, WARNA_MASUK],
          ['Keluar', p.isi.keluar, WARNA_KELUAR],
        ] as const
      ).map(([nama, nilai, warna]) => (
        <div key={nama} className="mt-1.5 flex items-center gap-2">
          <span aria-hidden="true" className="h-[2px] w-3 shrink-0 rounded-full" style={{ background: warna }} />
          <span className="num flex-1 text-[0.82rem] font-semibold text-[var(--ink)]">{rupiah(nilai)}</span>
          <span className="text-[0.66rem] muted">{nama}</span>
        </div>
      ))}
      <div className="mt-2 border-t border-[var(--rule)] pt-1.5 text-[0.7rem] muted">
        Sisa <span className="num font-semibold text-[var(--ink)]">{rupiah(p.isi.selisih)}</span>
      </div>
    </div>
  );
}

/* Legenda selalu ada begitu deretnya dua atau lebih, supaya identitas tidak
   pernah bergantung pada warna semata. Grafik saldo berderet tunggal sengaja
   tidak punya legenda: judulnya sudah menyebut apa yang digambar, dan kotak
   satu petak cuma mengulang judul sambil memakan ruang. */
function Legenda({ butir }: { butir: { nama: string; warna: string; bentuk: 'kotak' | 'garis' }[] }) {
  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2">
      {butir.map(b => (
        <span key={b.nama} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={b.bentuk === 'kotak' ? 'h-2.5 w-2.5 rounded-[2px]' : 'h-[2px] w-4 rounded-full'}
            style={{ background: b.warna }}
          />
          <span className="text-[0.72rem] uppercase tracking-[0.1em] muted">{b.nama}</span>
        </span>
      ))}
    </div>
  );
}

/* ====================== A. ARUS KAS PER BULAN ====================== */
export function GrafikArusKas({ data }: { data: TitikBulan[] }) {
  const [ref, lebar] = useLebar<HTMLDivElement>();
  const [petunjuk, setPetunjuk] = useState<Petunjuk | null>(null);
  const [tabel, setTabel] = useState(false);
  const judulId = useId();

  /* Sisi kiri 58px menampung label rupiah teringkas ("1,5 jt"); sisi bawah
     30px menampung nama bulan. Tinggi wadah sudah termasuk pita sumbu itu,
     supaya kartunya tidak berakhir punya gulir vertikal sendiri. */
  const tinggi = 250;
  const pad = { atas: 16, kanan: 12, bawah: 30, kiri: 58 };
  /* 320 hanyalah lantai sebelum ResizeObserver melapor; sesudahnya lebar
     mengikuti kartu. */
  const w = Math.max(lebar, 320);
  const plotW = w - pad.kiri - pad.kanan;
  const plotH = tinggi - pad.atas - pad.bawah;

  const maks = Math.max(...data.map(d => Math.max(d.masuk, d.keluar)), 1);
  const ticks = tickBulat(maks);
  const skalaMaks = ticks[ticks.length - 1] || 1;
  const y = (v: number) => pad.atas + plotH - (v / skalaMaks) * plotH;

  const band = plotW / data.length;
  const CELAH = 2; // celah permukaan antar batang bersebelahan
  /* Dibatasi 24px dan hanya mengisi 62% band: sisa band sengaja dibiarkan
     jadi udara. Batang yang memenuhi slotnya membuat grafik terasa berat,
     dan di layar sempit rumus ini yang membuatnya menyusut, bukan berdempet. */
  const lebarBatang = Math.min(24, (band * 0.62 - CELAH) / 2);

  const kosong = data.every(d => d.masuk === 0 && d.keluar === 0);

  return (
    <figure className="card !p-0">
      <figcaption className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
        <div>
          <h4 id={judulId} className="card__title">
            Masuk dan keluar, enam bulan terakhir
          </h4>
          <Legenda
            butir={[
              { nama: 'Masuk', warna: WARNA_MASUK, bentuk: 'kotak' },
              { nama: 'Keluar', warna: WARNA_KELUAR, bentuk: 'kotak' },
            ]}
          />
        </div>
        <button onClick={() => setTabel(v => !v)} className="opt shrink-0">
          {tabel ? 'Lihat grafik' : 'Lihat tabel'}
        </button>
      </figcaption>

      {tabel ? (
        <TabelBulan data={data} />
      ) : kosong ? (
        <p className="px-5 py-10 text-center text-sm muted">
          Belum ada transaksi untuk digambar. Catat beberapa dulu di bawah.
        </p>
      ) : (
        <div ref={ref} className="relative px-5 pb-4 pt-3">
          <svg
            width="100%"
            height={tinggi}
            viewBox={`0 0 ${w} ${tinggi}`}
            role="img"
            aria-labelledby={judulId}
            onPointerLeave={() => setPetunjuk(null)}
          >
            {/* kisi + sumbu nilai */}
            {ticks.map(t => (
              <g key={t}>
                <line
                  x1={pad.kiri}
                  x2={w - pad.kanan}
                  y1={y(t)}
                  y2={y(t)}
                  stroke="var(--rule)"
                  strokeWidth="1"
                />
                <text
                  x={pad.kiri - 10}
                  y={y(t) + 4}
                  textAnchor="end"
                  className="num"
                  fontSize="10.5"
                  fill="var(--ink-mute)"
                >
                  {t === 0 ? '0' : rupiahRingkas(t)}
                </text>
              </g>
            ))}

            {data.map((d, i) => {
              const tengah = pad.kiri + band * i + band / 2;
              const xMasuk = tengah - lebarBatang - CELAH / 2;
              const xKeluar = tengah + CELAH / 2;
              const aktif = petunjuk?.isi.bulan === d.bulan;

              return (
                <g key={d.bulan}>
                  {/* Sasaran arahkan selebar satu band penuh, bukan sebesar
                      batangnya. Batang setebal 12px di layar ponsel mustahil
                      dibidik; dengan band, pembaca cukup berada di wilayah
                      bulan itu. tabIndex membuat isi yang sama terbaca lewat
                      papan ketik, bukan hanya lewat tetikus. */}
                  <rect
                    x={pad.kiri + band * i}
                    y={pad.atas}
                    width={band}
                    height={plotH}
                    fill={aktif ? 'color-mix(in srgb, var(--ink) 4%, transparent)' : 'transparent'}
                    tabIndex={0}
                    role="button"
                    aria-label={`${d.label}: masuk ${rupiah(d.masuk)}, keluar ${rupiah(d.keluar)}`}
                    onPointerEnter={() => setPetunjuk({ x: tengah - 82, y: pad.atas + 40, isi: d })}
                    onFocus={() => setPetunjuk({ x: tengah - 82, y: pad.atas + 40, isi: d })}
                    onBlur={() => setPetunjuk(null)}
                    style={{ outline: 'none' }}
                  />
                  <path d={batang(xMasuk, y(d.masuk), lebarBatang, plotH - (y(d.masuk) - pad.atas))} fill={WARNA_MASUK} />
                  <path d={batang(xKeluar, y(d.keluar), lebarBatang, plotH - (y(d.keluar) - pad.atas))} fill={WARNA_KELUAR} />
                  <text
                    x={tengah}
                    y={tinggi - 10}
                    textAnchor="middle"
                    className="num"
                    fontSize="10.5"
                    fill={i === data.length - 1 ? 'var(--ink)' : 'var(--ink-mute)'}
                    fontWeight={i === data.length - 1 ? 600 : 400}
                  >
                    {d.label}
                  </text>
                </g>
              );
            })}

            {/* garis dasar */}
            <line
              x1={pad.kiri}
              x2={w - pad.kanan}
              y1={y(0)}
              y2={y(0)}
              stroke="var(--rule-strong)"
              strokeWidth="1"
            />
          </svg>

          {petunjuk && <Tooltip p={petunjuk} lebar={w} />}
        </div>
      )}
    </figure>
  );
}

/* ====================== B. SALDO KUMULATIF ====================== */
export function GrafikSaldo({ data }: { data: TitikBulan[] }) {
  const [ref, lebar] = useLebar<HTMLDivElement>();
  const [idx, setIdx] = useState<number | null>(null);
  const [tabel, setTabel] = useState(false);
  const judulId = useId();

  const tinggi = 230;
  const pad = { atas: 22, kanan: 74, bawah: 30, kiri: 58 };
  const w = Math.max(lebar, 320);
  const plotW = w - pad.kiri - pad.kanan;
  const plotH = tinggi - pad.atas - pad.bawah;

  /* Sisi kanan 74px dikosongkan untuk label nilai di ujung garis; tanpa itu
     angkanya terpotong tepi SVG. */
  const nilai = data.map(d => d.saldo);
  const maks = Math.max(...nilai, 0);
  /* Batas bawah ikut nilai terkecil, bukan dipaksa nol, supaya saldo yang
     pernah minus tetap tergambar. Nol tetap dilibatkan lewat Math.min agar
     garis dasarnya tidak melayang saat semua nilai positif. */
  const min = Math.min(...nilai, 0);
  const ticks = tickBulat(maks || 1);
  const atasSkala = Math.max(ticks[ticks.length - 1] || 1, maks);
  const rentang = atasSkala - min || 1;

  const x = (i: number) => pad.kiri + (data.length === 1 ? plotW / 2 : (plotW * i) / (data.length - 1));
  const y = (v: number) => pad.atas + plotH - ((v - min) / rentang) * plotH;

  const garis = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d.saldo)}`).join(' ');
  /* Area ditutup ke dasar skala, bukan ke nol: kalau ditutup ke nol sementara
     dasar skalanya minus, isiannya menggantung dan salah membaca luas. */
  const area = `${garis} L${x(data.length - 1)},${y(min)} L${x(0)},${y(min)} Z`;
  const akhir = data[data.length - 1];
  const kosong = data.every(d => d.saldo === 0);

  /* Pembaca membidik bulan, bukan garis setebal 2px. Posisi pointer dibulatkan
     ke titik data terdekat, jadi di mana pun kursornya di dalam bidang, selalu
     ada satu bulan yang terpilih. */
  function lacak(e: React.PointerEvent<SVGSVGElement>) {
    const kotak = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - kotak.left) / kotak.width) * w;
    const dekat = Math.round(((px - pad.kiri) / plotW) * (data.length - 1));
    setIdx(Math.max(0, Math.min(data.length - 1, dekat)));
  }

  return (
    <figure className="card !p-0">
      <figcaption className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
        <div>
          <h4 id={judulId} className="card__title">
            Saldo kas kumulatif
          </h4>
          <p className="mt-1 text-[0.72rem] muted">
            Sisa uang setelah semua pemasukan dikurangi pengeluaran, bulan demi bulan.
          </p>
        </div>
        <button onClick={() => setTabel(v => !v)} className="opt shrink-0">
          {tabel ? 'Lihat grafik' : 'Lihat tabel'}
        </button>
      </figcaption>

      {tabel ? (
        <TabelBulan data={data} saldoSaja />
      ) : kosong ? (
        <p className="px-5 py-10 text-center text-sm muted">Belum ada saldo untuk digambar.</p>
      ) : (
        <div ref={ref} className="relative px-5 pb-4 pt-3">
          <svg
            width="100%"
            height={tinggi}
            viewBox={`0 0 ${w} ${tinggi}`}
            role="img"
            aria-labelledby={judulId}
            onPointerMove={lacak}
            onPointerLeave={() => setIdx(null)}
          >
            {ticks.map(t => (
              <g key={t}>
                <line x1={pad.kiri} x2={w - pad.kanan} y1={y(t)} y2={y(t)} stroke="var(--rule)" strokeWidth="1" />
                <text
                  x={pad.kiri - 10}
                  y={y(t) + 4}
                  textAnchor="end"
                  className="num"
                  fontSize="10.5"
                  fill="var(--ink-mute)"
                >
                  {t === 0 ? '0' : rupiahRingkas(t)}
                </text>
              </g>
            ))}

            <path d={area} fill={WARNA_MASUK} opacity="0.1" />
            <path d={garis} fill="none" stroke={WARNA_MASUK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* garis bidik mengikuti bulan terdekat */}
            {idx != null && (
              <>
                <line
                  x1={x(idx)}
                  x2={x(idx)}
                  y1={pad.atas}
                  y2={pad.atas + plotH}
                  stroke="var(--rule-strong)"
                  strokeWidth="1"
                />
                <circle cx={x(idx)} cy={y(data[idx].saldo)} r="5" fill={WARNA_MASUK} stroke={PERMUKAAN} strokeWidth="2" />
              </>
            )}

            {/* titik ujung + label langsung, satu-satunya nilai yang ditulis */}
            <circle cx={x(data.length - 1)} cy={y(akhir.saldo)} r="4.5" fill={WARNA_MASUK} stroke={PERMUKAAN} strokeWidth="2" />
            <text
              x={x(data.length - 1) + 12}
              y={y(akhir.saldo) + 4}
              className="num"
              fontSize="12"
              fontWeight="600"
              fill="var(--ink)"
            >
              {rupiahRingkas(akhir.saldo)}
            </text>

            {data.map((d, i) => (
              <text
                key={d.bulan}
                x={x(i)}
                y={tinggi - 10}
                textAnchor="middle"
                className="num"
                fontSize="10.5"
                fill={idx === i ? 'var(--ink)' : 'var(--ink-mute)'}
              >
                {d.label}
              </text>
            ))}
          </svg>

          {idx != null && (
            <div
              role="tooltip"
              className="pointer-events-none absolute z-10 rounded-[var(--radius)] border border-[var(--rule-strong)] bg-[var(--white)] px-3 py-2 shadow-[0_8px_24px_rgba(18,18,15,0.16)]"
              style={{ left: Math.max(8, Math.min(x(idx) - 60, w - 140)), top: 8 }}
            >
              <div className="text-[0.68rem] uppercase tracking-[0.12em] muted">{data[idx].label}</div>
              <div className="num mt-1 text-[0.9rem] font-semibold">{rupiah(data[idx].saldo)}</div>
            </div>
          )}
        </div>
      )}
    </figure>
  );
}

/* ------------------------------------------------------- tabel pengganti */
function TabelBulan({ data, saldoSaja = false }: { data: TitikBulan[]; saldoSaja?: boolean }) {
  return (
    <div className="overflow-x-auto px-5 pb-5 pt-4">
      <table className="w-full text-[0.82rem]">
        <thead>
          <tr className="border-b border-[var(--rule-strong)] text-left">
            <th className="py-2 pr-4 text-[0.65rem] uppercase tracking-[0.12em] muted">Bulan</th>
            {!saldoSaja && (
              <>
                <th className="py-2 pr-4 text-right text-[0.65rem] uppercase tracking-[0.12em] muted">Masuk</th>
                <th className="py-2 pr-4 text-right text-[0.65rem] uppercase tracking-[0.12em] muted">Keluar</th>
              </>
            )}
            <th className="py-2 text-right text-[0.65rem] uppercase tracking-[0.12em] muted">
              {saldoSaja ? 'Saldo' : 'Sisa'}
            </th>
          </tr>
        </thead>
        <tbody className="num">
          {data.map(d => (
            <tr key={d.bulan} className="border-b border-[var(--rule)]">
              <td className="py-2 pr-4">{d.label}</td>
              {!saldoSaja && (
                <>
                  <td className="py-2 pr-4 text-right">{rupiah(d.masuk)}</td>
                  <td className="py-2 pr-4 text-right">{rupiah(d.keluar)}</td>
                </>
              )}
              <td className="py-2 text-right font-semibold">{rupiah(saldoSaja ? d.saldo : d.selisih)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ====================== C. RASIO BELANJA (METER) ====================== */

/* Status punya warna sendiri yang sengaja beda dari deret grafik, dan SELALU
   ditemani ikon serta label teks. Itu yang membuatnya tetap terbaca oleh
   pembaca buta warna, bukan warnanya. */
const STATUS = {
  aman: { isi: '#12683f', jalur: '#d7e8de', ikon: '✓' },
  ketat: { isi: '#a86a00', jalur: '#f0e2c8', ikon: '!' },
  defisit: { isi: WARNA_KELUAR, jalur: '#f4d6d2', ikon: '×' },
} as const;

export function MeterRasio({
  masuk,
  keluar,
  persen,
  status,
  label,
}: {
  masuk: number;
  keluar: number;
  persen: number | null;
  status: keyof typeof STATUS;
  label: string;
}) {
  const s = STATUS[status];
  const isi = persen == null ? 0 : Math.min(persen, 100);

  return (
    <div className="card">
      <h4 className="card__title">Porsi pemasukan yang terpakai</h4>
      <p className="mt-1 text-[0.72rem] muted">
        Berapa bagian dari uang masuk bulan ini yang sudah habis dibelanjakan.
      </p>

      <div className="mt-5 flex items-baseline gap-3">
        <span className="display" style={{ fontSize: '2.6rem' }}>
          {persen == null ? '—' : `${Math.round(persen)}%`}
        </span>
        {persen != null && persen > 100 && (
          <span className="num text-[0.85rem] font-semibold" style={{ color: WARNA_KELUAR }}>
            {Math.round(persen - 100)}% di atas pemasukan
          </span>
        )}
      </div>

      {/* jalur = langkah terang dari ramp yang sama dengan isiannya */}
      <div className="mt-4 h-3 w-full overflow-hidden rounded-full" style={{ background: s.jalur }}>
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${isi}%`, background: s.isi }}
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="grid h-4 w-4 shrink-0 place-items-center rounded-full text-[0.6rem] font-bold text-white"
          style={{ background: s.isi }}
        >
          {s.ikon}
        </span>
        <span className="text-[0.8rem] font-medium">{label}</span>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-[var(--rule)] pt-4">
        <div>
          <dt className="text-[0.65rem] uppercase tracking-[0.12em] muted">Masuk</dt>
          <dd className="num mt-1 text-[0.95rem] font-semibold">{rupiah(masuk)}</dd>
        </div>
        <div>
          <dt className="text-[0.65rem] uppercase tracking-[0.12em] muted">Keluar</dt>
          <dd className="num mt-1 text-[0.95rem] font-semibold">{rupiah(keluar)}</dd>
        </div>
      </dl>
    </div>
  );
}

/* ====================== D. DAYA TAHAN SALDO ====================== */
export function KartuRunway({
  saldo,
  rataKeluar,
  bulan,
}: {
  saldo: number;
  rataKeluar: number;
  bulan: number | null;
}) {
  const teks =
    bulan == null
      ? 'Belum ada pola pengeluaran untuk dihitung.'
      : bulan >= 12
        ? 'Lebih dari setahun. Posisi yang sangat lapang.'
        : bulan >= 3
          ? 'Cukup lapang untuk menghadapi bulan yang tidak terduga.'
          : bulan >= 1
            ? 'Tipis. Satu pengeluaran besar bisa menghabiskannya.'
            : 'Saldo sudah di bawah satu bulan pengeluaran.';

  return (
    <div className="card">
      <h4 className="card__title">Saldo ini bertahan berapa lama</h4>
      <p className="mt-1 text-[0.72rem] muted">
        Saldo kas dibagi rata-rata pengeluaran bulanan, ini yang membandingkan isi
        tabunganmu dengan kecepatan belanjamu.
      </p>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="display" style={{ fontSize: '2.6rem' }}>
          {bulan == null ? '—' : bulan.toFixed(1).replace('.', ',')}
        </span>
        <span className="text-[0.9rem] font-medium muted">bulan</span>
      </div>

      <p className="mt-3 text-[0.8rem] leading-relaxed">{teks}</p>

      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-[var(--rule)] pt-4">
        <div>
          <dt className="text-[0.65rem] uppercase tracking-[0.12em] muted">Saldo kas</dt>
          <dd className="num mt-1 text-[0.95rem] font-semibold">{rupiah(saldo)}</dd>
        </div>
        <div>
          <dt className="text-[0.65rem] uppercase tracking-[0.12em] muted">Rata-rata keluar</dt>
          <dd className="num mt-1 text-[0.95rem] font-semibold">{rupiah(rataKeluar)}</dd>
        </div>
      </dl>
    </div>
  );
}
