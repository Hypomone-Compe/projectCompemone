'use client';

/* =========================================================================
   Lapisan hidup di halaman masuk.

   Dipisah dari page.tsx supaya halamannya tetap bisa di-prerender: hanya dua
   potongan kecil ini yang butuh berjalan di peramban, sisanya HTML statis.
   ========================================================================= */

import { useEffect, useRef, useState } from 'react';
import { semesterStatus, todayYmd, TOTAL_WEEKS } from '@/lib/kalender';

/* ------------------------------------------------------------- cahaya */
/** Bulatan cahaya lime yang mengikuti kursor di atas kanvas gelap. */
export function Cahaya() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const induk = el.parentElement;
    if (!induk) return;

    const gerak = (e: PointerEvent) => {
      const r = induk.getBoundingClientRect();
      el.style.left = `${e.clientX - r.left}px`;
      el.style.top = `${e.clientY - r.top}px`;
      el.style.opacity = '1';
    };
    const keluar = () => {
      el.style.opacity = '0';
    };

    induk.addEventListener('pointermove', gerak);
    induk.addEventListener('pointerleave', keluar);
    return () => {
      induk.removeEventListener('pointermove', gerak);
      induk.removeEventListener('pointerleave', keluar);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute z-0 hidden -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-[40px] transition-opacity duration-700 motion-safe:block"
      style={{
        width: '52vmax',
        height: '52vmax',
        background:
          'radial-gradient(circle, color-mix(in srgb, var(--lime) 20%, transparent), transparent 62%)',
      }}
    />
  );
}

/* --------------------------------------------------------------- jam */
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/**
 * Tanggal, jam berjalan, dan fase semester.
 *
 * Semuanya dirender kosong sampai komponen terpasang: jam server dan jam
 * peramban tidak pernah persis sama, dan menuliskannya saat render server
 * akan memicu ketidakcocokan hidrasi.
 */
export function Jam() {
  const [siap, setSiap] = useState(false);
  const [waktu, setWaktu] = useState('');

  useEffect(() => {
    setSiap(true);
    const tulis = () => {
      const n = new Date();
      const jam = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(n);
      setWaktu(jam);
    };
    tulis();
    const id = setInterval(tulis, 1000);
    return () => clearInterval(id);
  }, []);

  if (!siap) return <span className="num text-[0.7rem] opacity-0">00:00:00</span>;

  const hari = todayYmd();
  const [th, bl, tg] = hari.split('-').map(Number);
  const namaHari = HARI[new Date(Date.UTC(th, bl - 1, tg)).getUTCDay()];
  const s = semesterStatus(hari);

  const fase =
    s.phase === 'pre'
      ? `Mulai ${s.daysToStart} hari lagi`
      : s.phase === 'run'
        ? `Minggu ${String(s.week).padStart(2, '0')} dari ${TOTAL_WEEKS}`
        : 'Semester selesai';

  return (
    <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <span className="num text-[0.72rem] tracking-[0.08em]">
        {namaHari}, {tg}/{String(bl).padStart(2, '0')}/{th}
      </span>
      <span aria-hidden="true" className="opacity-40">
        ·
      </span>
      <span className="num text-[0.72rem] tracking-[0.12em]" style={{ color: 'var(--lime)' }}>
        {waktu} WIB
      </span>
      <span aria-hidden="true" className="opacity-40">
        ·
      </span>
      <span className="text-[0.68rem] uppercase tracking-[0.14em] muted">{fase}</span>
    </span>
  );
}

/* ------------------------------------------------------- hitungan hari */
/** Angka besar di baris statistik yang ikut berubah tiap hari. */
export function Hitungan() {
  const [teks, setTeks] = useState<{ angka: string; label: string } | null>(null);

  useEffect(() => {
    const s = semesterStatus(todayYmd());
    setTeks(
      s.phase === 'pre'
        ? { angka: String(s.daysToStart), label: 'hari menuju kuliah pertama' }
        : s.phase === 'run'
          ? { angka: String(s.week), label: `minggu berjalan dari ${TOTAL_WEEKS}` }
          : { angka: '0', label: 'minggu tersisa' },
    );
  }, []);

  return (
    <>
      <b className="display block" style={{ fontSize: 'clamp(1.7rem,3vw,2.5rem)' }}>
        {teks ? teks.angka : '—'}
      </b>
      <span className="mt-1.5 block text-[0.6875rem] uppercase leading-[1.4] tracking-[0.11em] muted">
        {teks ? teks.label : 'menghitung'}
      </span>
    </>
  );
}
