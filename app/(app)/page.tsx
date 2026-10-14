import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import CourseIndex, { type BarisMatkul } from '@/components/dashboard/CourseIndex';
import Hero from '@/components/dashboard/Hero';
import NotifyCard from '@/components/dashboard/NotifyCard';
import Timetable from '@/components/dashboard/Timetable';
import WeekGrid from '@/components/dashboard/WeekGrid';
import SectionNav, { type NavSection } from '@/components/SectionNav';
import { Marquee, Reveal, SectionHead } from '@/components/ui';
import { KELAS } from '@/lib/asdos';
import { COURSES } from '@/lib/courses';
import { TOTAL_SKS } from '@/lib/courses/meta';
import { TAUTAN_LUAR } from '@/lib/tautan';
import { emailConfigured, RECIPIENT } from '@/lib/email';
import {
  buildWeeks, currentWeek, fmtDateLong, fmtRange, nextWeek,
  parseYmd, semesterStatus, todayYmd, TOTAL_WEEKS,
} from '@/lib/plan';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Beranda' };

const SECTIONS: NavSection[] = [
  { id: 'fokus', num: '01', short: 'Fokus' },
  { id: 'matkul', num: '02', short: 'Mata kuliah' },
  { id: 'minggu', num: '03', short: 'Kalender' },
  { id: 'jadwal', num: '04', short: 'Jadwal' },
  { id: 'harian', num: '05', short: 'Harian' },
  { id: 'keuangan', num: '06', short: 'Keuangan' },
  { id: 'asdos', num: '07', short: 'Asisten dosen' },
  { id: 'notifikasi', num: '08', short: 'Notifikasi' },
];

export default function DashboardPage() {
  const today = todayYmd();
  const weeks = buildWeeks(today);
  const status = semesterStatus(today);
  const cur = currentWeek(today);
  const next = nextWeek(today);
  const todayDow = parseYmd(today).getUTCDay();

  const totalDeadlines = weeks.reduce((a, w) => a + w.deadlines.length, 0);

  /* Hanya bagian yang benar-benar dipakai indeks yang dikirim ke klien. */
  const barisMatkul: BarisMatkul[] = COURSES.map(c => ({
    id: c.id,
    name: c.name,
    kelas: c.kelas,
    sks: c.sks,
    tagline: c.tagline,
    accent: c.accent,
    accentOn: c.accentOn,
    topicIds: c.topics.map(t => t.id),
  }));

  const ticker = weeks
    .filter(w => !w.isPast)
    .flatMap(w => w.deadlines.map(d => `M${String(w.n).padStart(2, '0')} · ${d.short}, ${d.text}`))
    .slice(0, 14);

  const kicker =
    status.phase === 'pre'
      ? `${fmtDateLong(today)} · mulai ${status.daysToStart} hari lagi`
      : status.phase === 'run'
        ? `${fmtDateLong(today)} · minggu ${status.week} dari ${TOTAL_WEEKS}`
        : `${fmtDateLong(today)} · semester selesai`;

  return (
    <>
      {/* ============================ HERO ============================ */}
      <Hero
        kicker={kicker}
        stats={[
          { b: String(COURSES.length), s: 'mata kuliah semester ini' },
          { b: String(TOTAL_SKS), s: 'SKS yang harus dijaga' },
          { b: String(TOTAL_WEEKS), s: 'minggu sampai UAS' },
          { b: String(totalDeadlines), s: 'deadline sudah terjadwal' },
        ]}
      >
        <p className="lede">
          Semester lalu berhenti di 3,39 karena tidak ada satu tempat pun yang menunjukkan apa yang
          jatuh tempo minggu ini. Sekarang ada. Semua rubrik, deadline, dan materi kelima matkul
          duduk di satu halaman, dan mengirimi kamu kabar setiap Senin, Rabu, dan Jumat.
        </p>
      </Hero>

      {ticker.length > 0 && <Marquee items={ticker} />}

      <SectionNav sections={SECTIONS} />

      {/* ---------------------- pintasan ke luar situs ---------------------- */}
      <section className="section--tight" id="fokus">
        <div className="shell flex flex-wrap items-center gap-2.5">
          <span className="eyebrow eyebrow--plain mr-2">Buka cepat</span>
          {TAUTAN_LUAR.map(t => (
            <a key={t.label} href={t.url} target="_blank" rel="noreferrer" className="btn btn--ghost">
              {t.label}
              <span className="text-[0.68rem] normal-case tracking-normal opacity-60">{t.ket}</span>
              <span aria-hidden="true">↗</span>
            </a>
          ))}
          <Link href="/harian" className="btn btn--ghost">
            Harian
            <span className="text-[0.68rem] normal-case tracking-normal opacity-60">Kebiasaan & jurnal</span>
          </Link>
          <Link href="/asdos" className="btn btn--ghost">
            Asisten dosen
            <span className="text-[0.68rem] normal-case tracking-normal opacity-60">Aljabar Linear KI</span>
          </Link>
        </div>
      </section>

      {/* ===================== FOKUS MINGGU BERJALAN ===================== */}
      {cur && (
        <section className="section--tight">
          <div className="shell grid gap-2.5 lg:grid-cols-2">
            <Reveal
              className="rounded-[var(--radius-lg)] border-2 border-[var(--ink)] p-[clamp(1.3rem,3vw,2.2rem)]"
              style={{ '--c': 'var(--red)' } as CSSProperties}
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="eyebrow eyebrow--c">Minggu ini</span>
                <span className="num text-xs muted">{fmtRange(cur.start, cur.end)}</span>
              </div>
              <p className="display mt-4" style={{ fontSize: 'var(--t-lg)' }}>
                {cur.exam
                  ? `Pekan ${cur.exam}.`
                  : cur.deadlines.length
                    ? `${cur.deadlines.length} hal harus dikumpulkan.`
                    : 'Tidak ada deadline.'}
              </p>
              <ul className="mt-5 space-y-2.5">
                {cur.deadlines.slice(0, 5).map((d, i) => (
                  <li key={i} className="flex gap-3 text-[0.86rem] leading-snug">
                    <span
                      className="shrink-0 text-[0.62rem] font-semibold uppercase tracking-[0.1em]"
                      style={{ color: d.accent }}
                    >
                      {d.short}
                    </span>
                    <span className="muted">{d.text}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal
              delay={90}
              className="rounded-[var(--radius-lg)] bg-[var(--paper-2)] p-[clamp(1.3rem,3vw,2.2rem)]"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="eyebrow eyebrow--plain">Minggu depan</span>
                {next && <span className="num text-xs muted">{fmtRange(next.start, next.end)}</span>}
              </div>
              {next ? (
                <>
                  <p className="display mt-4 muted" style={{ fontSize: 'var(--t-lg)' }}>
                    {next.deadlines.length
                      ? `${next.deadlines.length} deadline menyusul.`
                      : 'Belum ada deadline.'}
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {next.deadlines.slice(0, 5).map((d, i) => (
                      <li key={i} className="flex gap-3 text-[0.86rem] leading-snug">
                        <span
                          className="shrink-0 text-[0.62rem] font-semibold uppercase tracking-[0.1em]"
                          style={{ color: d.accent }}
                        >
                          {d.short}
                        </span>
                        <span className="muted">{d.text}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mt-4 text-sm muted">Sudah di ujung semester.</p>
              )}
            </Reveal>
          </div>
        </section>
      )}

      {status.phase === 'pre' && (
        <section className="section--tight">
          <div className="shell">
            <Reveal className="alert alert--lime">
              <p className="text-[0.95rem] leading-relaxed">
                <b className="block text-lg" style={{ letterSpacing: '-0.03em' }}>
                  Kuliah dimulai {status.daysToStart} hari lagi.
                </b>
                Waktu terbaik untuk membaca rubrik tiap matkul dan menyiapkan lingkungan kerja, 
                bukan saat minggu pertama sudah berjalan.
              </p>
            </Reveal>
          </div>
        </section>
      )}

      {/* ========================= MATA KULIAH ========================= */}
      <section className="section" id="matkul">
        <div className="shell">
          <SectionHead
            eyebrow="02 · Mata kuliah"
            judul={
              <>
                Lima kelas, lima <span className="serif">halaman</span> yang tahu isi kepalamu.
              </>
            }
            lede="Tiap halaman berisi rubrik penilaian, kalkulator nilai per instansi, rencana mingguan, materi dengan kotak Feynman, materi sulit, strategi, dan sumber belajar."
          />
        </div>
        <div className="shell">
          <CourseIndex courses={barisMatkul} />
        </div>
      </section>

      {/* ======================= MINGGU SEMESTER ======================= */}
      <section className="section" id="minggu">
        <div className="shell">
          <SectionHead
            eyebrow="03 · Kalender"
            judul={
              <>
                Tujuh belas kotak. Satu kotak, <span className="serif">satu minggu.</span>
              </>
            }
            lede="Isinya tugas dan deadline dari kelima BRP, ditambah checklist pribadimu yang tersimpan di perangkat ini. Klik kotak mana pun untuk membukanya."
          />
          <WeekGrid weeks={weeks} />
        </div>
      </section>

      {/* ========================= JADWAL TETAP ========================= */}
      <section className="section" id="jadwal">
        <div className="shell">
          <SectionHead
            eyebrow="04 · Jadwal"
            judul={
              <>
                Senin sampai Jumat, <span className="serif">berulang</span> sampai Desember.
              </>
            }
            lede="Diambil dari file jadwal kuliahmu. Hari ini disorot."
          />
          <Timetable todayDow={todayDow} />
        </div>
      </section>

      {/* ============================ HARIAN ============================ */}
      <section className="section" id="harian">
        <div className="shell">
          <SectionHead
            eyebrow="05 · Harian"
            judul={
              <>
                Yang menentukan semester bukan minggu ujian, tapi{' '}
                <span className="serif">hari-hari biasa.</span>
              </>
            }
            lede="Kebiasaan dengan grafik pekanan dan kalender bulanan, jurnal refleksi, sesi fokus per mata kuliah, catatan tidur, target, dan tinjauan pekanan yang disusun sendiri dari datamu."
          />
          <Link
            href="/harian"
            style={{ '--c': '#4c1d95', '--c-on': '#ffffff' } as CSSProperties}
            className="index__row !grid-cols-[4.5rem_minmax(0,1fr)_auto] border-y border-[var(--rule)]"
          >
            <span className="index__num">7d</span>
            <span className="min-w-0">
              <span className="index__title block">
                Kebiasaan, jurnal, <span className="serif">dan jam fokus</span>
              </span>
              <span className="mt-2 block text-[0.82rem] leading-relaxed opacity-72">
                Konsistensi tidak terasa saat dijalani, hanya terlihat saat digambar.
              </span>
            </span>
            <span className="index__meta hidden sm:block">Buka halaman ↗</span>
          </Link>
        </div>
      </section>

      {/* =========================== KEUANGAN =========================== */}
      <section className="section" id="keuangan">
        <div className="shell">
          <SectionHead
            eyebrow="06 · Keuangan"
            judul={
              <>
                Nilai bukan satu-satunya yang <span className="serif">perlu dijaga.</span>
              </>
            }
            lede="Pemasukan, pengeluaran, dan investasi dalam satu halaman. Dicatat manual, tersimpan di perangkat ini, tidak terhubung ke rekening mana pun."
          />
          <Link
            href="/keuangan"
            style={{ '--c': '#0f766e', '--c-on': '#ffffff' } as CSSProperties}
            className="index__row !grid-cols-[4.5rem_minmax(0,1fr)_auto] border-y border-[var(--rule)]"
          >
            <span className="index__num">Rp</span>
            <span className="min-w-0">
              <span className="index__title block">
                Arus kas <span className="serif">dan investasi</span>
              </span>
              <span className="mt-2 block text-[0.82rem] leading-relaxed opacity-72">
                Uang yang tidak dicatat selalu terasa lebih banyak daripada yang sebenarnya.
              </span>
            </span>
            <span className="index__meta hidden sm:block">Buka halaman ↗</span>
          </Link>
        </div>
      </section>

      {/* ========================== ASISTEN DOSEN ========================== */}
      <section className="section" id="asdos">
        <div className="shell">
          <SectionHead
            eyebrow="07 · Asisten dosen"
            judul={
              <>
                Semester ini kamu juga <span className="serif">berdiri di depan kelas.</span>
              </>
            }
            lede="Aljabar Linear Kelas Internasional. Halaman terpisah untuk catatan sesi, cakupan materi, dan tugas yang mudah terlupa."
          />
          <Link
            href="/asdos"
            style={{ '--c': KELAS.accent, '--c-on': KELAS.accentOn } as CSSProperties}
            className="index__row !grid-cols-[4.5rem_minmax(0,1fr)_auto] border-y border-[var(--rule)]"
          >
            <span className="index__num">AL</span>
            <span className="min-w-0">
              <span className="index__title block">
                {KELAS.nama} <span className="serif">kelas internasional</span>
              </span>
              <span className="mt-2 block text-[0.82rem] leading-relaxed opacity-72">
                Mengajar adalah cara tercepat menemukan lubang di pemahaman sendiri.
              </span>
            </span>
            <span className="index__meta hidden sm:block">Buka halaman ↗</span>
          </Link>
        </div>
      </section>

      {/* ========================== NOTIFIKASI ========================== */}
      <section className="section" id="notifikasi">
        <div className="shell">
          <NotifyCard to={RECIPIENT} configured={emailConfigured()} />
        </div>
      </section>
    </>
  );
}
