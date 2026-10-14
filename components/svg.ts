'use client';
/* ==========================================================================
   Perkakas bersama untuk grafik yang digambar tangan dengan SVG.

   Dipakai dua halaman: keuangan dan harian. Sebelumnya isinya menumpang di
   components/keuangan/Grafik.tsx; begitu halaman kedua butuh hal yang sama,
   menyalinnya berarti dua sumbu Y yang lambat laun berhenti mirip.

   Aturan mark yang dipatuhi kedua halaman: batang ≤24px dengan ujung data
   membulat 4px, garis 2px, isian area 10%, kisi hairline solid.
   ========================================================================== */
import { useCallback, useEffect, useRef, useState } from 'react';

/* ---------------------------------------------------------- lebar wadah */
/* Memakai ref callback, bukan useRef + useEffect: wadah grafik baru muncul
   setelah data ada, sedangkan efek berdependensi kosong sudah telanjur
   berjalan saat wadahnya belum ada. Akibatnya lebar terkunci di nol dan
   grafik menyusut ke lebar minimum. */
export function useLebar<T extends HTMLElement>() {
  const [lebar, setLebar] = useState(0);
  const pengamat = useRef<ResizeObserver | null>(null);

  const ref = useCallback((el: T | null) => {
    pengamat.current?.disconnect();
    pengamat.current = null;
    if (!el) return;
    setLebar(el.clientWidth);
    if (typeof ResizeObserver === 'undefined') return;
    pengamat.current = new ResizeObserver(() => setLebar(el.clientWidth));
    pengamat.current.observe(el);
  }, []);

  useEffect(() => () => pengamat.current?.disconnect(), []);

  return [ref, lebar] as const;
}

/* Skala sumbu Y yang berhenti di angka bulat, bukan di angka data mentah.

   Tangga 1/2/2,5/5/10 dikalikan pangkat sepuluh terdekat adalah cara paling
   sederhana mendapat angka yang enak dibaca: nilai maksimum 1.847.000 jadi
   berhenti di 2 jt, bukan di 1.847.000. Pembaca butuh patokan yang bulat,
   bukan angka data yang kebetulan tertinggi. */
export function tickBulat(maks: number, jumlah = 4): number[] {
  if (maks <= 0) return [0];
  const kasar = maks / jumlah;
  const pangkat = Math.pow(10, Math.floor(Math.log10(kasar)));
  const langkah = [1, 2, 2.5, 5, 10].map(m => m * pangkat).find(s => s >= kasar) ?? pangkat * 10;
  const out: number[] = [];
  for (let v = 0; v <= maks + langkah * 0.001; v += langkah) out.push(v);
  return out;
}

/** Batang dengan ujung data membulat 4px dan pangkal siku di garis dasar. */
export function batang(x: number, y: number, w: number, h: number, r = 4): string {
  if (h <= 0) return '';
  const rr = Math.min(r, w / 2, h);
  return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`;
}

/** Polyline dari titik yang sudah berada di ruang piksel. Titik null memutus
    garis, dipakai untuk hari yang tidak dicatat: garis yang menyambung mulus
    di atas lubang data akan berbohong tentang hari yang tidak pernah diisi. */
export function jalurGaris(titik: ({ x: number; y: number } | null)[]): string {
  let d = '';
  let putus = true;
  titik.forEach(t => {
    if (!t) {
      putus = true;
      return;
    }
    d += `${putus ? 'M' : 'L'}${t.x},${t.y} `;
    putus = false;
  });
  return d.trim();
}
