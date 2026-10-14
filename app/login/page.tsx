import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Cahaya, Hitungan, Jam } from './Kanvas';
import LoginForm from './LoginForm';
import { LogoMark } from '@/components/Logo';
import { Mask, Marquee } from '@/components/ui';
import { META, shortName, TOTAL_SKS } from '@/lib/courses/meta';
import { TOTAL_WEEKS } from '@/lib/kalender';

export const metadata: Metadata = { title: 'Masuk' };

export default function LoginPage() {
  /* Pita berjalan di kaki halaman: satu-satunya tempat kelima matkul disebut,
     menggantikan deretan kartu yang dulu memenuhi sisi kiri. */
  const pita = [
    ...META.map(c => shortName(c)),
    `${META.length} MATA KULIAH`,
    `${TOTAL_SKS} SKS`,
    `${TOTAL_WEEKS} MINGGU`,
    'GASAL 2026 / 2027',
  ];

  return (
    <main className="on-dark relative flex min-h-dvh flex-col overflow-hidden">
      {/* Kisi rambut 12 kolom, sama seperti hero di beranda. */}
      <div className="hairline-grid" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} />
        ))}
      </div>

      <Cahaya />

      {/* Nama merek raksasa yang sengaja terpotong tepi bawah, hanya kontur.
          Murni tekstur, tidak untuk dibaca. */}
      <span
        aria-hidden="true"
        className="display stroke-text pointer-events-none absolute select-none"
        style={{
          left: '-0.06em',
          bottom: '-0.28em',
          fontSize: 'clamp(9rem, 27vw, 24rem)',
          lineHeight: 0.8,
          opacity: 0.14,
        }}
      >
        SANDBOX
      </span>

      {/* ------------------------------- kepala ------------------------------- */}
      <header className="shell relative z-10 flex flex-wrap items-center justify-between gap-4 py-5">
        <span className="brand" style={{ fontSize: '1.15rem' }}>
          <LogoMark size={22} dot="var(--lime)" />
          Sandbox
        </span>
        <Jam />
      </header>

      {/* --------------------------------- isi --------------------------------- */}
      <div className="shell relative z-10 flex flex-1 items-center py-6">
        <div className="grid w-full items-center gap-x-16 gap-y-14 lg:grid-cols-[1.2fr_minmax(0,25rem)]">
          {/* ----------------------------- pernyataan ----------------------------- */}
          <div>
            <span className="eyebrow">Akses tertutup</span>

            <h1
              className="display mt-6"
              style={{ fontSize: 'clamp(2.4rem, 6.4vw, 5.5rem)', lineHeight: 0.86 }}
            >
              <Mask>SATU SEMESTER</Mask>
              <Mask delay={90}>
                <span className="stroke-text">SATU TEMPAT</span>
              </Mask>
              <Mask delay={180}>
                <span className="serif" style={{ color: 'var(--lime)' }}>
                  untuk semuanya.
                </span>
              </Mask>
            </h1>

            <p className="lede mt-7">
              Rubrik, deadline, materi, keuangan, dan kelas yang kamu asisteni. Semua duduk di satu
              halaman yang cuma bisa dibuka olehmu.
            </p>

            <div className="mt-9 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-[var(--rule)] pt-6 sm:grid-cols-4">
              {[
                { angka: String(META.length), label: 'mata kuliah dipantau' },
                { angka: String(TOTAL_SKS), label: 'SKS yang dijaga' },
                { angka: String(TOTAL_WEEKS), label: 'minggu sampai UAS' },
              ].map(x => (
                <div key={x.label}>
                  <b className="display block" style={{ fontSize: 'clamp(1.7rem,3vw,2.5rem)' }}>
                    {x.angka}
                  </b>
                  <span className="mt-1.5 block text-[0.6875rem] uppercase leading-[1.4] tracking-[0.11em] muted">
                    {x.label}
                  </span>
                </div>
              ))}
              <div>
                <Hitungan />
              </div>
            </div>
          </div>

          {/* -------------------------------- panel -------------------------------- */}
          {/* .on-light mengembalikan token terang, jadi kartu kertas ini tetap
              terbaca walau mengapung di dalam blok .on-dark. */}
          <div
            className="on-light relative rounded-[var(--radius-lg)] p-[clamp(1.5rem,3vw,2.4rem)] shadow-[0_28px_80px_rgba(0,0,0,0.45)]"
          >
            {/* Garis lime tipis di bibir atas kartu, satu-satunya hiasan. */}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[3px] rounded-t-[var(--radius-lg)]"
              style={{ background: 'var(--lime)' }}
            />

            <span className="eyebrow eyebrow--plain">Masuk ke akunmu</span>

            <h2 className="display mt-3" style={{ fontSize: 'clamp(1.8rem,3vw,2.3rem)' }}>
              Selamat <span className="serif">datang kembali.</span>
            </h2>

            <Suspense fallback={<div className="mt-8 h-64" />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>

      {/* -------------------------------- kaki -------------------------------- */}
      <div className="relative z-10">
        <Marquee items={pita} durasi={38} />
      </div>
    </main>
  );
}
