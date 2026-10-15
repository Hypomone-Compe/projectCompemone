'use client';

import Link from 'next/link';
import { ArrowUpRight, BookOpenCheck, Calculator, CalendarClock, Flag, Target } from 'lucide-react';
import { Progress } from '@/components/ui';
import { hitungProyeksi } from '@/lib/nilai';
import type { KartuMatkul } from '@/lib/ringkasan-matkul';
import { courseProgress, useStore } from '@/lib/store';
import { SectionHeading } from './SectionHeading';

/**
 * Matkul prioritas (SDA, PBP, Basdat): yang nilainya sedang dikejar. Ditaruh tepat
 * setelah "Hari ini", karena dua matkul ini yang harus disentuh setiap hari,
 * bukan hanya saat ada deadline.
 */
export default function Prioritas({ matkul }: { matkul: KartuMatkul[] }) {
  useStore();
  const fokus = matkul.filter(c => c.fokus);
  if (!fokus.length) return null;

  return (
    <section aria-labelledby="prioritas-judul" className="bg-off-white py-16 sm:py-20">
      <div className="mx-auto max-w-wrap px-5">
        <SectionHeading
          id="prioritas-judul"
          eyebrow="Prioritas semester ini"
          title={
            <>
              {fokus.length > 1 ? `${fokus.slice(0, -1).map(c => c.short).join(', ')} & ${fokus[fokus.length - 1].short}` : fokus[0].short}{' '}
              <span className="text-accent">dikejar setiap hari.</span>
            </>
          }
          description={`${fokus.length} matkul yang nilainya belum maksimal. Lihat posisimu sekarang, apa yang kurang untuk A, dan satu langkah berikutnya.`}
        />

        <div className={`mt-10 grid gap-4 ${fokus.length >= 3 ? 'md:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-2'}`}>
          {fokus.map(c => {
            const pro = courseProgress(c.id, c.topicIds.map(id => ({ id })));
            const n = hitungProyeksi(c.id, c.grading);
            const belum = pro.total - pro.paham;
            const langkah =
              n.norm == null
                ? { href: `/matkul/${c.id}?tab=nilai`, teks: 'Isi nilai yang sudah keluar dulu, supaya proyeksinya nyata.', Icon: Calculator }
                : belum > 0
                  ? { href: `/matkul/${c.id}?tab=materi`, teks: `Pahami ${Math.min(belum, 2)} topik lagi hari ini. ${belum} topik belum ditandai paham.`, Icon: BookOpenCheck }
                  : { href: `/matkul/${c.id}?tab=strategi`, teks: 'Semua topik sudah paham. Baca ulang strategi rubrik sebelum tugas berikutnya.', Icon: Target };

            return (
              <article
                key={c.id}
                className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-lg sm:p-7"
                style={{ ['--c' as string]: c.accent }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full"
                  style={{ background: `radial-gradient(circle, ${c.pale}, transparent 70%)` }}
                />
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <span className="rounded-full px-3 py-1 text-[12.5px] font-bold" style={{ background: c.pale, color: c.accent }}>
                      {c.short} {c.kelas} · {c.sks} SKS
                    </span>
                    <h3 className="mt-3 text-2xl font-extrabold tracking-tight">{c.name}</h3>
                  </div>
                  <Link
                    href={`/matkul/${c.id}`}
                    aria-label={`Buka ${c.name}`}
                    className="flex size-11 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-transform hover:scale-105"
                    style={{ background: c.accent }}
                  >
                    <ArrowUpRight aria-hidden className="size-5" />
                  </Link>
                </div>

                <dl className="relative mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-off-white p-4">
                    <dt className="text-[12.5px] font-bold text-muted">Proyeksi nilai</dt>
                    <dd className="mt-1 flex items-baseline gap-2">
                      <span className="num text-3xl font-extrabold tracking-tight">{n.norm == null ? '–' : n.norm.toFixed(1)}</span>
                      {n.huruf && <span className="rounded-md px-2 py-0.5 text-sm font-extrabold text-white" style={{ background: c.accent }}>{n.huruf}</span>}
                    </dd>
                    <p className="mt-1 text-[12.5px] leading-snug text-secondary">
                      {n.norm == null
                        ? 'Belum ada nilai tercatat'
                        : n.butuhA == null
                          ? 'Semua komponen sudah terisi'
                          : n.butuhA <= 0
                            ? 'A sudah aman'
                            : n.butuhA > 100
                              ? 'A sudah tidak terjangkau, kejar setinggi mungkin'
                              : `Butuh rata-rata ${n.butuhA.toFixed(0)} dari sisa ${n.sisa.toFixed(0)}% bobot`}
                    </p>
                  </div>
                  <div className="rounded-xl bg-off-white p-4">
                    <dt className="text-[12.5px] font-bold text-muted">Pemahaman</dt>
                    <dd className="num mt-1 text-3xl font-extrabold tracking-tight">{pro.pct}%</dd>
                    <Progress value={pro.pct} className="mt-2" barClassName="bg-c" aria-label={`Pemahaman ${c.short}`} />
                    <p className="mt-1.5 text-[12.5px] text-secondary">
                      {pro.paham}/{pro.total} paham · {pro.feynman} catatan Feynman
                    </p>
                  </div>
                </dl>

                <ul className="relative mt-4 space-y-2 text-[13.5px]">
                  {c.deadlineBerikut && (
                    <li className="flex gap-2.5">
                      <Flag aria-hidden className="mt-0.5 size-4 shrink-0 text-c" />
                      <span className="text-secondary">
                        <b className="text-ink">Minggu {c.deadlineBerikut.n} · {c.deadlineBerikut.label}:</b> {c.deadlineBerikut.text}
                      </span>
                    </li>
                  )}
                  {c.sesiBerikut && (
                    <li className="flex gap-2.5">
                      <CalendarClock aria-hidden className="mt-0.5 size-4 shrink-0 text-c" />
                      <span className="text-secondary">
                        <b className="text-ink">{c.sesiBerikut.kapan}, {c.sesiBerikut.jam}</b> · {c.sesiBerikut.kind} · {c.sesiBerikut.ruang}
                      </span>
                    </li>
                  )}
                </ul>

                <Link
                  href={langkah.href}
                  className="relative mt-5 flex items-center gap-3 rounded-xl border-[1.5px] border-dashed p-4 transition-colors hover:bg-off-white"
                  style={{ borderColor: c.accent }}
                >
                  <langkah.Icon aria-hidden className="size-5 shrink-0 text-c" />
                  <span className="min-w-0 flex-1 text-[14px] font-bold leading-snug">{langkah.teks}</span>
                  <ArrowUpRight aria-hidden className="size-4 shrink-0" />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
