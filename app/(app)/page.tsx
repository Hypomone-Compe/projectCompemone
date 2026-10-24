import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Camera, HeartPulse, Presentation, Wallet, type LucideIcon } from 'lucide-react';
import NotifyCard from '@/components/dashboard/NotifyCard';
import Timetable from '@/components/dashboard/Timetable';
import WeekGrid from '@/components/dashboard/WeekGrid';
import HariIni, { type SesiHariIni } from '@/components/home/HariIni';
import HeroOrbit from '@/components/home/HeroOrbit';
import MatkulGrid from '@/components/home/MatkulGrid';
import Prioritas from '@/components/home/Prioritas';
import Sekarang from '@/components/home/Sekarang';
import { SectionHeading } from '@/components/home/SectionHeading';
import { Marquee } from '@/components/kit';
import { KELAS } from '@/lib/asdos';
import { emailConfigured, RECIPIENT } from '@/lib/email-config';
import {
  buildWeeks, currentWeek, fmtDateLong, fmtRange, parseYmd, semesterStatus, sessionsOnDay, todayYmd, TOTAL_WEEKS, TZ,
} from '@/lib/plan';
import { itemOrbit } from '@/lib/orbit';
import { ringkasMatkul } from '@/lib/ringkasan-matkul';
import { TAUTAN_LUAR } from '@/lib/tautan';
import type { Day } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Beranda' };

const HALAMAN: { href: string; label: string; ket: string; Icon: LucideIcon; warna: string }[] = [
  { href: '/harian', label: 'Harian', ket: 'Kebiasaan, jurnal, jam fokus, tidur, dan target.', Icon: HeartPulse, warna: '#475ca3' },
  { href: '/keuangan', label: 'Keuangan', ket: 'Arus kas, anggaran, investasi, dan scan struk.', Icon: Wallet, warna: '#16784a' },
  { href: '/keuangan?scan=1', label: 'Scan struk', ket: 'Foto struk, langsung jadi pemasukan atau pengeluaran.', Icon: Camera, warna: '#d64c6f' },
  { href: '/asdos', label: 'Asisten dosen', ket: `${KELAS.nama}: sesi, materi, dan tugas asdos.`, Icon: Presentation, warna: '#5e121c' },
];

export default function BerandaPage() {
  const now = new Date();
  const today = todayYmd(now);
  const jam = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
  const weeks = buildWeeks(today);
  const status = semesterStatus(today);
  const cur = currentWeek(today);
  const dow = parseYmd(today).getUTCDay();
  const matkul = ringkasMatkul(now);

  const sesi: SesiHariIni[] = (dow >= 1 && dow <= 6 ? sessionsOnDay(dow as Day) : []).map(s => ({
    ...s,
    status: s.to <= jam ? 'selesai' : s.from <= jam ? 'berlangsung' : 'nanti',
  }));

  const ticker = weeks
    .filter(w => !w.isPast)
    .flatMap(w => w.deadlines.map(d => `M${String(w.n).padStart(2, '0')} · ${d.short}, ${d.text}`))
    .slice(0, 14);

  const mingguTeks =
    status.phase === 'run'
      ? `Minggu ${status.week} dari ${TOTAL_WEEKS}${cur ? ` · ${fmtRange(cur.start, cur.end)}` : ''}`
      : status.phase === 'pre'
        ? `Kuliah mulai ${status.daysToStart} hari lagi`
        : 'Semester selesai';

  return (
    <>
      <HeroOrbit matkul={matkul} items={itemOrbit(matkul)} info={{ tanggal: fmtDateLong(today), minggu: mingguTeks, ujian: cur?.exam ?? null }} />

      <Sekarang />

      <HariIni
        hari={fmtDateLong(today)}
        sesi={sesi}
        agenda={cur?.deadlines ?? []}
        rentang={cur ? fmtRange(cur.start, cur.end) : null}
        ujian={cur?.exam ?? null}
        scele={TAUTAN_LUAR[0].url}
      />

      {ticker.length > 0 && <Marquee items={ticker} />}

      <Prioritas matkul={matkul} />

      <section aria-labelledby="matkul-judul" className="bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-wrap px-5">
          <SectionHeading
            id="matkul-judul"
            eyebrow="Mata kuliah"
            title="Lima kelas semester ini"
            description="Tiap halaman berisi kalkulator nilai, rencana mingguan, materi dengan kotak Feynman, strategi, dan sumber belajar, dipisah per tab supaya langsung ketemu."
          />
          <div className="mt-10">
            <MatkulGrid matkul={matkul} />
          </div>
        </div>
      </section>

      <section id="kalender" aria-labelledby="kalender-judul" className="bg-off-white py-16 sm:py-24">
        <div className="mx-auto max-w-wrap px-5">
          <SectionHeading
            id="kalender-judul"
            eyebrow="Kalender semester"
            title={
              <>
                Tujuh belas minggu, <span className="text-accent">satu kotak per minggu.</span>
              </>
            }
            description="Isinya tugas dan deadline dari kelima BRP, ditambah checklist pribadimu. Klik kotak mana pun untuk membuka dan menambah checklist."
          />
          <div className="mt-10">
            <WeekGrid weeks={weeks} />
          </div>
        </div>
      </section>

      <section id="jadwal" aria-labelledby="jadwal-judul" className="bg-surface py-16 sm:py-24">
        <div className="mx-auto max-w-wrap px-5">
          <SectionHeading id="jadwal-judul" eyebrow="Jadwal tetap" title="Senin sampai Jumat" description="Hari ini disorot. Klik sesi untuk membuka matkulnya." />
          <div className="mt-10">
            <Timetable todayDow={dow} />
          </div>
        </div>
      </section>

      <section aria-labelledby="halaman-judul" className="bg-surface pb-16 sm:pb-24">
        <div className="mx-auto max-w-wrap px-5">
          <SectionHeading id="halaman-judul" eyebrow="Di luar kelas" title="Halaman lain" />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HALAMAN.map(h => (
              <li key={h.href}>
                <Link
                  href={h.href}
                  className="group flex h-full min-h-48 flex-col justify-between gap-6 rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-base ease-out-expo hover:-translate-y-1 hover:shadow-lg active:scale-[.98]"
                >
                  <span className="flex items-start justify-between">
                    <span className="flex size-11 items-center justify-center rounded-lg text-white" style={{ background: h.warna }}>
                      <h.Icon aria-hidden className="size-5" />
                    </span>
                    <ArrowUpRight aria-hidden className="size-5 opacity-40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent group-hover:opacity-100" />
                  </span>
                  <span>
                    <span className="block text-xl font-extrabold tracking-tight">{h.label}</span>
                    <span className="mt-1.5 block text-[13.5px] leading-snug text-secondary">{h.ket}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-12">
            <NotifyCard to={RECIPIENT} configured={emailConfigured()} />
          </div>
        </div>
      </section>
    </>
  );
}
