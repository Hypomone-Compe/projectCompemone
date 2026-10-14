'use client';

/* =========================================================================
   Sapaan pembuka.

   Muncul sekali tiap kali situs dibuka (sekali per sesi peramban), berisi
   kutipan hari itu dan ringkasan singkat minggu berjalan. Tombol di header
   bisa memanggilnya lagi kapan saja.
   ========================================================================= */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { fmtDateLong } from '@/lib/kalender';
import { quoteForDate } from '@/lib/quotes';

/* Ringkasan minggu dihitung di server lalu dikirim ke sini. Kalau komponen
   ini memanggil lib/plan sendiri, seluruh isi BRP ikut terbundel ke klien. */
export interface RingkasanSapaan {
  today: string;
  fase: 'pre' | 'run' | 'done';
  /** Nomor minggu berjalan, atau sisa hari kalau semester belum mulai. */
  angka: number;
  totalMinggu: number;
  rentang: string | null;
  ujian: string | null;
  deadline: number;
}

const KUNCI_SESI = 'hypomone.sapaan';

/** Dipanggil dari header untuk memunculkan sapaan lagi. */
export function bukaSapaan() {
  window.dispatchEvent(new CustomEvent('buka-sapaan'));
}

export default function Sapaan({ ringkasan }: { ringkasan: RingkasanSapaan }) {
  const [tampil, setTampil] = useState(false);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    setSiap(true);
    try {
      if (!sessionStorage.getItem(KUNCI_SESI)) setTampil(true);
    } catch {
      /* mode privat: tampilkan saja */
      setTampil(true);
    }
    const h = () => setTampil(true);
    window.addEventListener('buka-sapaan', h);
    return () => window.removeEventListener('buka-sapaan', h);
  }, []);

  useEffect(() => {
    if (!tampil) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') tutup();
    };
    window.addEventListener('keydown', key);
    const gulirLama = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', key);
      document.body.style.overflow = gulirLama;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tampil]);

  function tutup() {
    setTampil(false);
    try {
      sessionStorage.setItem(KUNCI_SESI, '1');
    } catch {
      /* abaikan */
    }
  }

  if (!siap || !tampil) return null;

  const { today, fase, angka, totalMinggu, rentang, ujian, deadline } = ringkasan;
  const q = quoteForDate(today);

  return createPortal(
    <div
      className="fixed inset-0 z-[300] grid place-items-center overflow-y-auto p-[var(--gutter)]"
      style={{
        background: 'rgba(11, 16, 45, 0.4)',
        backdropFilter: 'blur(6px)',
        animation: 'pudar .35s var(--ease) both',
      }}
      onClick={tutup}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sapaan pembuka"
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[34rem] overflow-hidden rounded-2xl bg-white text-navy shadow-xl"
        style={{ animation: 'naik .5s var(--ease) both' }}
      >
        {/* kepala: mesh gradient design system */}
        <div className="mesh-fallback relative px-[clamp(1.3rem,3vw,2rem)] py-[clamp(1.3rem,3vw,1.9rem)]">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2.5 text-[17px] font-extrabold tracking-tight">
              <Image src="/images/logo-bem-ui.png" alt="" width={876} height={876} className="size-9" />
              Hypomonē <span className="text-accent">@GRIT</span>
            </span>
            <span className="rounded-full bg-white/80 px-3 py-1 text-[12.5px] font-bold text-navy shadow-xs">
              {fase === 'run'
                ? `Minggu ${angka} / ${totalMinggu}`
                : fase === 'pre'
                  ? `Mulai ${angka} hari lagi`
                  : 'Semester selesai'}
            </span>
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-accent-hover">{fmtDateLong(today)}</p>
          <p className="mt-3 text-[clamp(1.4rem,4vw,1.9rem)] font-extrabold leading-tight tracking-tight">{q.t}</p>
          <p className="mt-1 text-[clamp(1.2rem,3.4vw,1.6rem)] font-bold leading-tight text-accent">{q.s}</p>
        </div>

        {/* isi */}
        <div className="px-[clamp(1.3rem,3vw,2rem)] py-[clamp(1.2rem,3vw,1.7rem)]">
          {fase === 'run' ? (
            <>
              <span className="eyebrow eyebrow--plain">Minggu ini · {rentang}</span>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-secondary">
                {ujian
                  ? `Pekan ${ujian}. Fokusnya cuma satu: siap saat hari H.`
                  : deadline
                    ? `Ada ${deadline} hal yang harus dikumpulkan. Buka kotak minggu ini dan pindahkan ke checklist.`
                    : 'Tidak ada deadline minggu ini. Waktu paling murah untuk mengejar materi yang tertinggal.'}
              </p>
            </>
          ) : fase === 'pre' ? (
            <p className="text-[0.95rem] leading-relaxed">
              Kuliah belum mulai. Pakai jeda ini untuk membaca rubrik tiap matkul, bukan nanti saat
              minggu pertama sudah berjalan.
            </p>
          ) : (
            <p className="text-[0.95rem] leading-relaxed">Semester sudah lewat. Selamat.</p>
          )}

          <button onClick={tutup} className="btn btn--accent btn--block mt-6">
            Mulai hari ini
            <span className="btn__arrow">→</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pudar { from { opacity: 0 } }
        @keyframes naik { from { opacity: 0; transform: translateY(22px) scale(.98) } }
      `}</style>
    </div>,
    document.body,
  );
}
