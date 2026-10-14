'use client';

import { compAverage } from './store';
import { letterFor, parseBestOf, parseFreqCount } from './text';
import type { Grading } from './types';

/** Bagian penilaian yang dibutuhkan untuk menghitung proyeksi. Ringan, aman dikirim ke klien. */
export type GradingRingkas = {
  components: Pick<Grading['components'][number], 'weight' | 'freq'>[];
  scale: Grading['scale'];
};

export interface Proyeksi {
  /** Nilai akhir kalau performa sekarang bertahan (bobot kosong dinormalisasi). */
  norm: number | null;
  huruf: string | null;
  /** Persentase bobot yang sudah punya nilai. */
  terisi: number;
  /** Rata-rata yang masih dibutuhkan dari sisa bobot untuk A. */
  butuhA: number | null;
  sisa: number;
}

/** Sama persis dengan hitungan di GradeCalculator; dipakai beranda & panel kartu. */
export function hitungProyeksi(cid: string, grading: GradingRingkas): Proyeksi {
  let wSum = 0;
  let sSum = 0;
  let total = 0;
  grading.components.forEach((comp, i) => {
    total += comp.weight;
    const avg = compAverage(cid, i, parseFreqCount(comp.freq), parseBestOf(comp.freq));
    if (avg != null) {
      wSum += comp.weight;
      sSum += (avg * comp.weight) / 100;
    }
  });
  const norm = wSum > 0 ? (sSum / wSum) * 100 : null;
  const sisa = Math.max(0, total - wSum);
  const minA = grading.scale.find(s => s.g === 'A')?.min ?? 85;
  const butuhA = sisa > 0 ? ((minA / 100) * total - sSum) / (sisa / 100) : null;
  return {
    norm,
    huruf: norm == null ? null : letterFor(grading.scale, norm),
    terisi: total ? (wSum / total) * 100 : 0,
    butuhA,
    sisa,
  };
}
