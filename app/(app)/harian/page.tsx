import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import HarianBoard from '@/components/harian/HarianBoard';
import SectionNav, { type NavSection } from '@/components/SectionNav';
import { Mask } from '@/components/ui';

/* Judul cukup satu kata; templat di app/layout.tsx yang menjadikannya
   "Sandbox - Harian". */
export const metadata: Metadata = { title: 'Harian' };

const SECTIONS: NavSection[] = [
  { id: 'ringkasan', num: '01', short: 'Ringkasan' },
  { id: 'kebiasaan', num: '02', short: 'Kebiasaan' },
  { id: 'jurnal', num: '03', short: 'Jurnal' },
  { id: 'fokus', num: '04', short: 'Fokus' },
  { id: 'tidur', num: '05', short: 'Tidur' },
  { id: 'target', num: '06', short: 'Target' },
  { id: 'tinjauan', num: '07', short: 'Tinjauan' },
];

/* Ungu tua khusus halaman ini: cukup jauh dari lima warna matkul dan dari
   teal halaman keuangan, jadi satu tangkapan layar mana pun langsung
   ketahuan berasal dari halaman yang mana. Kontrasnya di atas kertas krem
   7,4:1, aman untuk teks kecil. */
const ACCENT = '#4c1d95';

/* Halaman ini statis. Seluruh isinya bergantung pada tanggal hari ini dan
   data di localStorage, dan keduanya hanya ada di sisi klien. */
export default function HarianPage() {
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
            Harian
          </span>

          <h1 className="display mt-6" style={{ fontSize: 'clamp(2.4rem, 8vw, 6.4rem)', lineHeight: 0.86 }}>
            <Mask>HARI YANG BIASA</Mask>
            <Mask delay={90}>
              <span className="serif" style={{ color: '#a78bfa' }}>
                menentukan semuanya.
              </span>
            </Mask>
          </h1>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="chip chip--c">Kebiasaan & runtun</span>
            <span className="chip">Jurnal refleksi</span>
            <span className="chip">Jam fokus</span>
            <span className="chip">Tidur & energi</span>
            <span className="chip">Tersimpan di perangkat ini</span>
          </div>

          <blockquote className="kutipan mt-9 max-w-3xl">
            IPK dihitung sekali di akhir semester, tapi disusun oleh empat ratus hari biasa yang tak
            satu pun terasa penting saat dijalani.
          </blockquote>
        </div>
      </section>

      <SectionNav sections={SECTIONS} />

      <HarianBoard />
    </div>
  );
}
