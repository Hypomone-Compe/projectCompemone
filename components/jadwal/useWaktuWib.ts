'use client';
import { useEffect, useState } from 'react';
import { TZ, todayYmd } from '@/lib/kalender';

/** Tanggal & menit sejak 00.00 WIB, diperbarui tiap 20 detik. Null sebelum mount (hindari beda SSR). */
export function useWaktuWib() {
  const baca = () => {
    const now = new Date();
    const [h, m] = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false })
      .format(now)
      .split(':')
      .map(Number);
    return { tanggal: todayYmd(now), menit: (h % 24) * 60 + m };
  };
  const [w, setW] = useState<{ tanggal: string; menit: number } | null>(null);
  useEffect(() => {
    setW(baca());
    const id = window.setInterval(() => setW(baca()), 20_000);
    return () => window.clearInterval(id);
  }, []);
  return w;
}
