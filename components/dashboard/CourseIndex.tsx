'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { courseProgress, useStore } from '@/lib/store';
import { stripEmoji } from '@/lib/text';

/* Daftar topik dikirim sebagai prop dari server, bukan diimpor dari
   lib/courses: mengimpornya di sini akan menarik seluruh isi BRP kelima
   matkul ke bundel JavaScript yang diunduh peramban. */
export interface BarisMatkul {
  id: string;
  name: string;
  kelas: string;
  sks: number;
  tagline: string;
  accent: string;
  accentOn: string;
  topicIds: string[];
}

export default function CourseIndex({ courses }: { courses: BarisMatkul[] }) {
  useStore(); // ikut ter-render ulang saat progres berubah

  return (
    <div className="index">
      {courses.map((c, i) => {
        const p = courseProgress(
          c.id,
          c.topicIds.map(id => ({ id })),
        );
        return (
          <Link
            key={c.id}
            href={`/matkul/${c.id}`}
            style={{ '--c': c.accent, '--c-on': c.accentOn } as CSSProperties}
            className="index__row"
          >
            <span className="index__num">{String(i + 1).padStart(2, '0')}</span>

            <span className="min-w-0">
              <span className="index__title block">
                {c.name} <span className="serif">{c.kelas}</span>
              </span>
              <span className="mt-2 block max-w-2xl text-[0.82rem] leading-relaxed opacity-72">
                {stripEmoji(c.tagline)}
              </span>
            </span>

            <span className="index__meta hidden sm:block">
              <span className="block text-[1.05rem] font-semibold" style={{ letterSpacing: '-0.03em' }}>
                {p.pct}%
              </span>
              <span className="block">paham · {c.sks} SKS</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
