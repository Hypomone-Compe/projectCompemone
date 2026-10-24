'use client';

/**
 * Kartu "Sekarang" di beranda: posisi kita di jadwal semester saat ini,
 * sisa menit blok berjalan, dan tiga blok berikutnya.
 */
import Link from 'next/link';
import { ArrowRight, Moon } from 'lucide-react';
import { besok, jadwalHari, jamTeks, LABEL_FASE, LABEL_KATEGORI, posisiSekarang, WARNA_KATEGORI } from '@/lib/jadwal';
import { useWaktuWib } from '@/components/jadwal/useWaktuWib';

export default function Sekarang() {
  const w = useWaktuWib();
  if (!w) return <section aria-label="Sekarang" className="bg-surface pt-14 sm:pt-20" style={{ minHeight: '18rem' }} />;
  const p = posisiSekarang(w.tanggal, w.menit);
  const b = p.sekarang;
  const sisa = b ? b.selesai - w.menit : 0;
  const pagiBesok = p.tidur && w.menit >= 12 * 60 ? jadwalHari(besok(w.tanggal)).slice(0, 3) : p.berikut;
  const tautan = b?.cid && (b.kategori === 'belajar' || b.kategori === 'uas') ? `/matkul/${b.cid}?tab=materi` : b?.kategori === 'icaic' ? '/harian?tab=kebiasaan#icaic' : '/harian?tab=kebiasaan#jadwal';

  return (
    <section id="sekarang" aria-labelledby="sekarang-judul" className="scroll-mt-24 bg-surface pt-14 sm:pt-20">
      <div className="mx-auto max-w-wrap px-5">
        <div className="relative overflow-hidden rounded-[28px] border border-border bg-[rgba(13,16,34,0.8)] p-6 shadow-glass sm:p-8">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-30 blur-3xl"
            style={{ background: b ? WARNA_KATEGORI[b.kategori] : '#3b4270' }}
            aria-hidden
          />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Sekarang · {LABEL_FASE[p.fase]}
          </p>

          {b ? (
            <>
              <h2 id="sekarang-judul" className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                {b.judul}
              </h2>
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-secondary">
                <span className="num font-bold text-ink">{jamTeks(b)}</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: WARNA_KATEGORI[b.kategori] }} aria-hidden />
                  {LABEL_KATEGORI[b.kategori]}
                </span>
                <span>sisa {sisa} menit</span>
                {b.lokasi && <span>· {b.lokasi}</span>}
              </p>
              {b.detail && !b.lokasi && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-secondary">{b.detail}</p>}
              <div className="mt-4 h-1.5 max-w-xl overflow-hidden rounded-full bg-[rgba(238,240,251,0.12)]">
                <div className="h-full rounded-full" style={{ width: `${p.persen}%`, background: WARNA_KATEGORI[b.kategori] }} />
              </div>
            </>
          ) : (
            <h2 id="sekarang-judul" className="mt-3 flex items-center gap-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              <Moon className="text-accent" aria-hidden /> Waktunya tidur.
            </h2>
          )}

          {pagiBesok.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">{b ? 'Berikutnya' : 'Besok pagi'}</p>
              <ul className="mt-2 grid gap-2 sm:grid-cols-3">
                {pagiBesok.map((x, i) => (
                  <li key={i} className="rounded-2xl border border-border bg-[rgba(238,240,251,0.03)] p-3">
                    <p className="num text-xs font-bold" style={{ color: WARNA_KATEGORI[x.kategori] }}>
                      {jamTeks(x)}
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-snug">{x.judul}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={tautan} className="btn btn--c btn--sm inline-flex items-center gap-1.5" style={{ ['--c' as string]: '#8297f0', ['--c-on' as string]: '#0d1022' }}>
              {b?.kategori === 'icaic' ? 'Buka topik ICAIC' : b?.cid ? 'Buka materi' : 'Jadwal lengkap'} <ArrowRight size={14} aria-hidden />
            </Link>
            <Link href="/harian?tab=kebiasaan#jadwal" className="btn btn--light btn--sm">
              Jadwal hari ini
            </Link>
            <Link href="/fokus" className="btn btn--light btn--sm">
              Ruang fokus 3D
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
