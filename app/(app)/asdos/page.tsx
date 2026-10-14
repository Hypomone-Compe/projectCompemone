import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import AsdosBoard from '@/components/asdos/AsdosBoard';
import SectionNav, { type NavSection } from '@/components/SectionNav';
import { Mask } from '@/components/ui';
import { KELAS } from '@/lib/asdos';

export const metadata: Metadata = { title: 'Asisten Dosen' };

const SECTIONS: NavSection[] = [
  { id: 'kelas', num: '01', short: 'Info kelas' },
  { id: 'sesi', num: '02', short: 'Catatan sesi' },
  { id: 'silabus', num: '03', short: 'Materi' },
  { id: 'tugas', num: '04', short: 'Tugas' },
  { id: 'tanya', num: '05', short: 'Sering ditanya' },
];

export default function AsdosPage() {
  const vars = { '--c': KELAS.accent, '--c-on': KELAS.accentOn } as CSSProperties;

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
            {KELAS.peran}
          </span>

          <h1 className="display mt-6" style={{ fontSize: 'clamp(2.4rem, 8vw, 6.4rem)', lineHeight: 0.86 }}>
            <Mask>{KELAS.nama}</Mask>
            <Mask delay={90}>
              <span className="serif" style={{ color: KELAS.accent }}>
                kelas internasional
              </span>
            </Mask>
          </h1>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="chip chip--c">Peran: asisten dosen</span>
            <span className="chip">Bukan mata kuliah yang kamu ambil</span>
          </div>

          <blockquote className="kutipan mt-9 max-w-3xl">
            Mengajar adalah cara tercepat menemukan lubang di pemahaman sendiri. Apa pun yang kamu
            jelaskan di depan kelas akan menempel jauh lebih lama daripada yang kamu baca.
          </blockquote>
        </div>
      </section>

      <SectionNav sections={SECTIONS} />

      <AsdosBoard />
    </div>
  );
}
