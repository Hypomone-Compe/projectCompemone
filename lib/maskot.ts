'use client';
/* Keadaan maskot kucing yang dibagi antar-komponen.
   'bebas' = jalan-jalan & duduk santai; 'fokus' = buka laptop & mengetik serius.
   Timer fokus di halaman Harian menyalakan 'fokus'; kucing di navbar membacanya. */

export type ModeKucing = 'bebas' | 'fokus';

let mode: ModeKucing = 'bebas';
const subs = new Set<(m: ModeKucing) => void>();

export function setModeKucing(m: ModeKucing) {
  if (m === mode) return;
  mode = m;
  subs.forEach(fn => fn(m));
}

export const ambilModeKucing = () => mode;

export function langgananKucing(fn: (m: ModeKucing) => void) {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}
