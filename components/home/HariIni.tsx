import Link from 'next/link';
import { Camera, ExternalLink, HeartPulse, NotebookPen, Timer, Wallet } from 'lucide-react';
import type { Deadline, DaySession } from '@/lib/plan';
import { cn } from '@/lib/utils';

export interface SesiHariIni extends Pick<DaySession, 'from' | 'to' | 'room' | 'kind' | 'cid' | 'short' | 'kelas' | 'accent'> {
  status: 'selesai' | 'berlangsung' | 'nanti';
}

const AKSI = [
  { href: '/keuangan?scan=1', label: 'Scan struk', ket: 'Foto → transaksi', Icon: Camera },
  { href: '/keuangan#catat', label: 'Catat uang', ket: 'Masuk / keluar', Icon: Wallet },
  { href: '/harian#jurnal', label: 'Isi jurnal', ket: 'Mood, tidur, refleksi', Icon: NotebookPen },
  { href: '/harian#fokus', label: 'Mulai fokus', ket: 'Pomodoro per matkul', Icon: Timer },
  { href: '/harian#kebiasaan', label: 'Centang kebiasaan', ket: 'Hari ini', Icon: HeartPulse },
];

/**
 * Seksi pertama setelah hero. Menjawab "hari ini aku harus ke mana dan
 * mengerjakan apa" tanpa harus membuka halaman lain.
 */
export default function HariIni({
  hari,
  sesi,
  agenda,
  rentang,
  ujian,
  scele,
}: {
  hari: string;
  sesi: SesiHariIni[];
  agenda: Deadline[];
  rentang: string | null;
  ujian: string | null;
  scele: string;
}) {
  return (
    <section id="hari-ini" aria-labelledby="hari-ini-judul" className="scroll-mt-24 bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-wrap px-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Hari ini · {hari}</p>
        <h2 id="hari-ini-judul" className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
          {sesi.length ? (
            <>
              {sesi.filter(s => s.status !== 'selesai').length || 'Tidak ada'} kelas{' '}
              <span className="text-accent">{sesi.some(s => s.status !== 'selesai') ? 'menunggu.' : 'lagi hari ini.'}</span>
            </>
          ) : (
            <>
              Tidak ada kelas. <span className="text-accent">Waktunya mengejar.</span>
            </>
          )}
        </h2>

        {/* Aksi cepat: yang paling sering dilakukan dari HP */}
        <ul className="mt-8 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {AKSI.map(a => (
            <li key={a.href} className="shrink-0">
              <Link
                href={a.href}
                className="flex items-center gap-3 rounded-2xl border border-border bg-white py-3 pl-3 pr-5 shadow-xs transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:shadow-md active:scale-[.98]"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-pink-pale text-accent-hover">
                  <a.Icon aria-hidden className="size-5" />
                </span>
                <span>
                  <span className="block text-[14.5px] font-bold">{a.label}</span>
                  <span className="block text-[12.5px] text-muted">{a.ket}</span>
                </span>
              </Link>
            </li>
          ))}
          <li className="shrink-0">
            <a
              href={scele}
              target="_blank"
              rel="noreferrer"
              className="flex h-full items-center gap-2 rounded-2xl border-[1.5px] border-dashed border-border px-5 text-[14.5px] font-bold text-secondary transition-colors hover:border-navy hover:text-navy"
            >
              SCeLE <ExternalLink aria-hidden className="size-4" />
            </a>
          </li>
        </ul>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          {/* Jadwal hari ini */}
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[13px] font-bold text-muted">Jadwal kuliah</p>
            {sesi.length === 0 ? (
              <p className="mt-4 rounded-xl bg-off-white px-4 py-6 text-center text-sm text-muted">
                Hari bebas kelas. Satu sesi fokus 50 menit untuk SDA atau PBP sudah cukup berarti.
              </p>
            ) : (
              <ol className="mt-4 space-y-2.5">
                {sesi.map((s, i) => (
                  <li key={i}>
                    <Link
                      href={`/matkul/${s.cid}`}
                      className={cn(
                        'flex items-center gap-4 rounded-xl border p-3.5 transition-all hover:shadow-md',
                        s.status === 'berlangsung' ? 'border-transparent bg-navy text-white shadow-lg' : 'border-border bg-white',
                        s.status === 'selesai' && 'opacity-55',
                      )}
                    >
                      <span className="w-[4.5rem] shrink-0">
                        <span className="num block text-[15px] font-extrabold">{s.from}</span>
                        <span className={cn('num block text-[12px]', s.status === 'berlangsung' ? 'text-white/60' : 'text-muted')}>s.d. {s.to}</span>
                      </span>
                      <span className="h-10 w-1 shrink-0 rounded-full" style={{ background: s.accent }} aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-extrabold tracking-tight">
                          {s.short} {s.kelas}
                          {s.kind !== 'Kelas' && (
                            <span className={cn('ml-2 rounded-full px-2 py-0.5 text-[11px] font-bold', s.status === 'berlangsung' ? 'bg-white/15' : 'bg-navy-5 text-secondary')}>
                              {s.kind}
                            </span>
                          )}
                        </span>
                        <span className={cn('block truncate text-[13px]', s.status === 'berlangsung' ? 'text-white/70' : 'text-muted')}>{s.room}</span>
                      </span>
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-bold',
                          s.status === 'berlangsung' ? 'bg-pink-light text-maroon' : s.status === 'selesai' ? 'bg-navy-5 text-muted' : 'bg-blue-pale text-blue',
                        )}
                      >
                        {s.status === 'berlangsung' ? 'Sekarang' : s.status === 'selesai' ? 'Selesai' : 'Nanti'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Agenda dinilai minggu ini */}
          <div className="rounded-2xl bg-navy p-5 text-white shadow-lg sm:p-6">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[13px] font-bold text-pink-light">Agenda dinilai minggu ini</p>
              {rentang && <p className="num text-[12.5px] text-white/55">{rentang}</p>}
            </div>
            {ujian && <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-sm font-bold">Pekan {ujian}. Siapkan diri untuk hari H.</p>}
            {agenda.length === 0 ? (
              <p className="mt-4 text-sm text-white/70">Tidak ada kuis, lab, atau deadline dari BRP minggu ini.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {agenda.slice(0, 7).map((d, i) => (
                  <li key={i}>
                    <Link href={`/matkul/${d.cid}?tab=rencana`} className="group flex gap-3 text-[13.5px] leading-snug">
                      <span className="mt-0.5 w-14 shrink-0 rounded-full bg-white px-2 py-0.5 text-center text-[11px] font-extrabold" style={{ color: d.accent }}>
                        {d.short}
                      </span>
                      <span className="text-white/85 group-hover:text-white group-hover:underline">{d.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {agenda.length > 7 && <p className="mt-3 text-[12.5px] text-white/55">+{agenda.length - 7} lainnya di kalender di bawah.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
