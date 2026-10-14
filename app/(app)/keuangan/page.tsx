import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import KeuanganBoard from '@/components/keuangan/KeuanganBoard';
import SectionNav, { type NavSection } from '@/components/SectionNav';
import { Mask } from '@/components/ui';

/* Judul cukup satu kata; templat di app/layout.tsx yang menjadikannya
   "Sandbox - Keuangan". */
export const metadata: Metadata = { title: 'Keuangan' };

const SECTIONS: NavSection[] = [
  { id: 'ringkasan', num: '01', short: 'Ringkasan' },
  { id: 'pergerakan', num: '02', short: 'Pergerakan' },
  { id: 'catat', num: '03', short: 'Catat' },
  { id: 'kategori', num: '04', short: 'Kategori' },
  { id: 'investasi', num: '05', short: 'Investasi' },
];

/* Teal khusus halaman ini, dipakai untuk eyebrow, judul kecil, dan garis
   aksen. Warna deret grafik TIDAK diambil dari sini: warna data ditentukan
   lewat uji buta warna di components/keuangan/Grafik.tsx, terpisah dari
   warna merek halaman. */
const ACCENT = '#0f766e';

/* Halaman ini statis: tidak ada isinya yang bergantung pada tanggal saat
   render, jadi Next.js boleh membangunnya sekali saat build. Tanggal hari ini
   dibaca di sisi klien oleh papan keuangannya. */
export default function KeuanganPage() {
  /* Aksen dipasang sekali di pembungkus, lalu diwarisi seluruh anak lewat
     var(--c). Itu sebabnya komponen di dalamnya tidak perlu tahu warna apa
     pun, cukup memakai kelas c-text, c-bg, atau c-border. */
  const vars = { '--c': ACCENT, '--c-on': '#ffffff' } as CSSProperties;

  return (
    <div style={vars}>
      <section className="on-dark relative overflow-hidden pb-[clamp(2rem,4vw,3rem)] pt-[clamp(2rem,5vw,3.5rem)]">
        <div className="hairline-grid" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} />
          ))}
        </div>

        <div className="shell relative z-10">
          <span className="eyebrow eyebrow--c">
            <Link href="/" className="hover:underline">
              Beranda
            </Link>
            <span className="opacity-50">/</span>
            Keuangan
          </span>

          <h1 className="display mt-6" style={{ fontSize: 'clamp(2.4rem, 8vw, 6.4rem)', lineHeight: 0.86 }}>
            <Mask>PEMASUKAN, PENGELUARAN</Mask>
            <Mask delay={90}>
              <span className="serif" style={{ color: ACCENT }}>
                dan yang ditanam.
              </span>
            </Mask>
          </h1>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="chip chip--c">Arus kas bulanan</span>
            <span className="chip">Portofolio investasi</span>
            <span className="chip">Tersimpan di perangkat ini</span>
          </div>

          <blockquote className="kutipan mt-9 max-w-3xl">
            Uang yang tidak dicatat selalu terasa lebih banyak daripada yang sebenarnya, sampai
            tanggal tua datang dan angkanya bicara sendiri.
          </blockquote>
        </div>
      </section>

      <SectionNav sections={SECTIONS} />

      <KeuanganBoard />
    </div>
  );
}
