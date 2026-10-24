'use client';

/**
 * Jadwal penuh satu hari (time-boxing): dari bangun sampai tidur, blok yang
 * sedang berjalan disorot dengan sisa menitnya. Bisa digeser ke hari lain.
 */
import { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import { faseHari, jadwalHari, jamTeks, LABEL_FASE, LABEL_KATEGORI, periodeSkill, WARNA_KATEGORI, type KategoriBlok } from '@/lib/jadwal';
import { addDays, fmtDateLong, parseYmd, ymd } from '@/lib/kalender';
import { cn } from '@/lib/utils';
import { useWaktuWib } from './useWaktuWib';

export default function JadwalHari({ hariIni }: { hariIni: string }) {
  const waktu = useWaktuWib();
  const [geser, setGeser] = useState(0);
  const [buka, setBuka] = useState<number | null>(null);
  const tanggal = ymd(addDays(parseYmd(hariIni), geser));
  const jadwal = useMemo(() => jadwalHari(tanggal), [tanggal]);
  const fase = faseHari(tanggal);
  const skill = periodeSkill(tanggal);
  const hariIniJuga = waktu?.tanggal === tanggal;
  const menit = hariIniJuga ? waktu!.menit : -1;

  /* Ringkasan jam per kategori (tanpa istirahat & rutinitas). */
  const ringkas = useMemo(() => {
    const m = new Map<KategoriBlok, number>();
    jadwal.forEach(b => {
      if (b.kategori === 'istirahat' || b.kategori === 'rutinitas' || b.kategori === 'tidur') return;
      m.set(b.kategori, (m.get(b.kategori) || 0) + b.selesai - b.mulai);
    });
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [jadwal]);

  return (
    <div id="jadwal" className="card scroll-mt-28">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="card__title">Jadwal · {fmtDateLong(tanggal)}</h4>
          <p className="mt-1 text-[0.72rem] muted">
            {LABEL_FASE[fase]}
            {skill && fase === 'normal' ? ` · Hal baru: ${skill.judul}` : ''} · {jadwal.length} blok, {jamTeks({ mulai: jadwal[0].mulai, selesai: jadwal[jadwal.length - 1].selesai })}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => setGeser(v => v - 1)} className="stepper" aria-label="Hari sebelumnya">
            ‹
          </button>
          <button type="button" onClick={() => setGeser(0)} disabled={geser === 0} className="btn btn--light btn--sm">
            Hari ini
          </button>
          <button type="button" onClick={() => setGeser(v => v + 1)} className="stepper" aria-label="Hari berikutnya">
            ›
          </button>
        </div>
      </div>

      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Jam per kategori">
        {ringkas.map(([k, m]) => (
          <li key={k} className="chip !px-2.5 !py-[3px] !text-[11px]">
            <span className="h-2 w-2 rounded-full" style={{ background: WARNA_KATEGORI[k] }} aria-hidden />
            {LABEL_KATEGORI[k]} {m >= 60 ? `${Math.floor(m / 60)}j${m % 60 ? ` ${m % 60}m` : ''}` : `${m}m`}
          </li>
        ))}
      </ul>

      <ol className="mt-4 space-y-1">
        {jadwal.map((b, i) => {
          const kini = menit >= b.mulai && menit < b.selesai;
          const lewat = menit >= b.selesai;
          const persen = kini ? ((menit - b.mulai) / (b.selesai - b.mulai)) * 100 : 0;
          const ringan = b.kategori === 'istirahat';
          return (
            <li key={`${b.mulai}-${i}`}>
              <button
                type="button"
                onClick={() => setBuka(v => (v === i ? null : i))}
                aria-expanded={b.detail ? buka === i : undefined}
                aria-current={kini ? 'time' : undefined}
                className={cn(
                  'grid w-full grid-cols-[4.9rem_4px_minmax(0,1fr)] items-start gap-x-3 rounded-xl px-2 py-1.5 text-left transition-colors',
                  kini ? 'bg-[rgba(130,151,240,0.14)] ring-1 ring-[rgba(130,151,240,0.45)]' : 'hover:bg-[rgba(238,240,251,0.05)]',
                  lewat && 'opacity-45',
                )}
              >
                <span className={cn('num pt-0.5 text-[0.74rem]', kini ? 'font-bold text-ink' : 'muted')}>{jamTeks(b)}</span>
                <span className="mt-1 h-[calc(100%-0.25rem)] min-h-[1.1rem] rounded-full" style={{ background: WARNA_KATEGORI[b.kategori], opacity: ringan ? 0.45 : 1 }} aria-hidden />
                <span className="min-w-0">
                  <span className={cn('block text-[0.84rem] leading-snug', ringan ? 'muted' : 'font-semibold')}>
                    {b.judul}
                    {kini && <span className="ml-2 rounded-full bg-[#8297f0] px-2 py-[1px] text-[10px] font-bold uppercase tracking-wider text-[#0d1022]">sekarang</span>}
                  </span>
                  {b.lokasi && (
                    <span className="mt-0.5 flex items-center gap-1 text-[0.7rem] muted">
                      <MapPin size={11} aria-hidden /> {b.lokasi}
                    </span>
                  )}
                  {b.detail && !b.lokasi && (
                    <span className={cn('mt-0.5 block text-[0.72rem] leading-relaxed muted', buka === i || kini ? '' : 'line-clamp-1')}>{b.detail}</span>
                  )}
                  {kini && (
                    <span className="mt-1.5 block h-[3px] overflow-hidden rounded-full bg-[rgba(238,240,251,0.14)]">
                      <span className="block h-full rounded-full bg-[#8297f0]" style={{ width: `${persen}%` }} />
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
