'use client';

import { useEffect } from 'react';
import { mondayOf, todayYmd } from '@/lib/kalender';

/* Menyorot baris minggu berjalan setelah halaman termuat.

   Kalau tanggal hari ini dipakai saat render server, halaman mata kuliah
   tidak bisa di-prerender dan harus dibangun ulang tiap kunjungan. Dengan
   penyorotan di sisi klien, halamannya jadi statis dan dilayani langsung
   dari CDN. */
export default function SorotMingguIni() {
  useEffect(() => {
    const senin = mondayOf(todayYmd());
    document
      .querySelectorAll<HTMLElement>('[data-week-start]')
      .forEach(el => {
        const mulai = el.dataset.weekStart;
        if (!mulai) return;
        if (mulai === senin) el.dataset.weekState = 'now';
        else if (mulai < senin) el.dataset.weekState = 'past';
      });
  }, []);

  return null;
}
