'use client';

import { useSyncStatus, type SyncStatus } from '@/lib/sync';
import { cn } from '@/lib/utils';

const INFO: Record<SyncStatus, { label: string; warna: string; ket: string }> = {
  lokal: { label: 'Mode lokal', warna: 'bg-warning', ket: 'Supabase belum diisi; data hanya di peramban ini.' },
  memuat: { label: 'Memuat', warna: 'bg-blue-soft animate-pulse', ket: 'Mengambil data terbaru dari Supabase.' },
  tersimpan: { label: 'Tersinkron', warna: 'bg-success', ket: 'Semua perubahan sudah tersimpan di Supabase.' },
  menyimpan: { label: 'Menyimpan', warna: 'bg-blue animate-pulse', ket: 'Perubahan sedang dikirim.' },
  luring: { label: 'Luring', warna: 'bg-warning', ket: 'Tidak ada jaringan. Perubahan disimpan dan dikirim begitu daring.' },
  gagal: { label: 'Gagal sinkron', warna: 'bg-red', ket: 'Ada perubahan yang belum terkirim. Dicoba lagi otomatis.' },
};

/** Titik status sinkronisasi di navbar. Supaya tidak pernah ragu "sudah tersimpan belum?". */
export default function SyncBadge() {
  const { status } = useSyncStatus();
  const i = INFO[status];
  return (
    <span
      role="status"
      title={i.ket}
      className="flex items-center gap-2 rounded-full px-2.5 py-2 text-[12.5px] font-bold text-secondary"
    >
      <span aria-hidden className={cn('size-2 rounded-full', i.warna)} />
      <span className="hidden xl:inline">{i.label}</span>
      <span className="sr-only xl:hidden">{i.label}</span>
    </span>
  );
}
