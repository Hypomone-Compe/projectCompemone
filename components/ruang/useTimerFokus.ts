'use client';
/* Timer sesi fokus untuk ruang 3D. Waktu akhir disimpan di localStorage,
   jadi halaman yang dimuat ulang tetap melanjutkan sesi yang sama; sesi yang
   habis saat halaman tertutup tetap dicatat begitu halaman dibuka lagi. */
import { useCallback, useEffect, useRef, useState } from 'react';

const KUNCI = 'hypomone.ruangfokus.v1';

interface Simpanan {
  durasi: number;
  sisa: number;
  akhir: number | null;
  cid: string;
  label: string;
}

const baca = (): Simpanan | null => {
  try {
    const s = JSON.parse(localStorage.getItem(KUNCI) || 'null');
    return s && typeof s.durasi === 'number' ? s : null;
  } catch {
    return null;
  }
};

export function useTimerFokus(onSelesai: (menit: number, cid: string, label: string) => void) {
  const [durasi, setDurasi] = useState(25);
  const [sisa, setSisa] = useState(25 * 60);
  const [akhir, setAkhir] = useState<number | null>(null);
  const [cid, setCid] = useState('');
  const [label, setLabel] = useState('');
  const [muat, setMuat] = useState(false);
  const selesaiRef = useRef(onSelesai);
  selesaiRef.current = onSelesai;

  /* Pulihkan sesi (sekali saja, walau efek dijalankan dua kali di mode dev). */
  const dipulihkan = useRef(false);
  useEffect(() => {
    if (dipulihkan.current) return;
    dipulihkan.current = true;
    const s = baca();
    if (s) {
      setDurasi(s.durasi);
      setCid(s.cid || '');
      setLabel(s.label || '');
      if (s.akhir && s.akhir > Date.now()) {
        setAkhir(s.akhir);
        setSisa(Math.round((s.akhir - Date.now()) / 1000));
      } else if (s.akhir) {
        selesaiRef.current(s.durasi, s.cid || '', s.label || '');
        setSisa(s.durasi * 60);
      } else setSisa(Math.min(s.sisa, s.durasi * 60));
    }
    setMuat(true);
  }, []);

  useEffect(() => {
    if (!muat) return;
    try {
      localStorage.setItem(KUNCI, JSON.stringify({ durasi, sisa, akhir, cid, label } satisfies Simpanan));
    } catch {
      /* penyimpanan penuh atau diblokir: timer tetap jalan di memori */
    }
  }, [muat, durasi, sisa, akhir, cid, label]);

  useEffect(() => {
    if (akhir == null) return;
    const id = window.setInterval(() => {
      const d = Math.max(0, Math.round((akhir - Date.now()) / 1000));
      setSisa(d);
      if (d === 0) {
        setAkhir(null);
        setSisa(durasi * 60);
        selesaiRef.current(durasi, cid, label);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [akhir, durasi, cid, label]);

  const mulai = useCallback(() => setAkhir(Date.now() + sisa * 1000), [sisa]);
  const jeda = useCallback(() => setAkhir(null), []);
  const setel = useCallback((m: number) => {
    setAkhir(null);
    setDurasi(m);
    setSisa(m * 60);
  }, []);
  /** Mencatat bagian sesi yang sudah lewat, lalu mengulang dari awal. */
  const catatSebagian = useCallback(() => {
    const lewat = Math.round((durasi * 60 - sisa) / 60);
    if (lewat > 0) selesaiRef.current(lewat, cid, label);
    setAkhir(null);
    setSisa(durasi * 60);
  }, [durasi, sisa, cid, label]);

  return { durasi, sisa, jalan: akhir != null, cid, setCid, label, setLabel, mulai, jeda, setel, catatSebagian };
}
