'use client';
/* ==========================================================================
   Sinkronisasi ke Supabase.

   Prinsipnya "lokal dulu, server menyusul":
   · Setiap perubahan langsung tampil (state di memori + salinan localStorage),
     lalu masuk ANTREAN. Antrean ikut disimpan di localStorage, jadi perubahan
     yang dibuat saat sinyal hilang di kelas tetap terkirim begitu daring lagi.
   · Antrean dikirim berkala (debounce). Satu kunci hanya menyimpan perubahan
     terakhirnya, jadi mengetik 200 huruf tetap menjadi satu penulisan.
   · Data server ditarik saat aplikasi dibuka, saat tab kembali difokus, saat
     daring lagi, dan saat Realtime memberi tahu ada perubahan dari perangkat
     lain. Bagian yang masih punya perubahan tertunda tidak ditimpa server.
   ========================================================================== */
import { useSyncExternalStore } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from './supabase/client';
import type { Investasi, Transaksi } from './keuangan';

export type SyncStatus = 'lokal' | 'memuat' | 'tersimpan' | 'menyimpan' | 'luring' | 'gagal';

export type RowTable = 'transaksi' | 'investasi';

type Op =
  | { k: string; type: 'slice'; slice: string; data: unknown; at: string }
  | { k: string; type: 'upsert'; table: RowTable; row: Record<string, unknown> }
  | { k: string; type: 'delete'; table: RowTable; id: string };

export interface RemoteData {
  slices: Record<string, unknown>;
  transaksi: Transaksi[];
  investasi: Investasi[];
}

const KEY_ANTREAN = 'hypomone.antrian.v1';

/* --------------------------------------------------------------- status */
let status: SyncStatus = getSupabase() ? 'memuat' : 'lokal';
let terakhir: number | null = null;
const subs = new Set<() => void>();
const setStatus = (s: SyncStatus) => {
  if (s === 'tersimpan') terakhir = Date.now();
  if (s === status) return;
  status = s;
  snap = { status, terakhir };
  subs.forEach(f => f());
};
let snap: { status: SyncStatus; terakhir: number | null } = { status, terakhir };

export function useSyncStatus() {
  return useSyncExternalStore(
    fn => {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    () => snap,
    () => snap,
  );
}

/* --------------------------------------------------------------- antrean */
const antrean = new Map<string, Op>();

function bacaAntrean() {
  try {
    const raw = localStorage.getItem(KEY_ANTREAN);
    if (raw) (JSON.parse(raw) as Op[]).forEach(op => antrean.set(op.k, op));
  } catch {
    /* rusak → abaikan */
  }
}

function simpanAntrean() {
  try {
    localStorage.setItem(KEY_ANTREAN, JSON.stringify([...antrean.values()]));
  } catch {
    /* kuota penuh */
  }
}

export const isPending = (k: string) => antrean.has(k);
export const pendingOps = () => [...antrean.values()];

let timer: ReturnType<typeof setTimeout> | null = null;
function jadwalkan(ms: number) {
  if (!getSupabase()) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => void kirim(), ms);
  if (status !== 'luring') setStatus('menyimpan');
}

export function queueSlice(slice: string, data: unknown) {
  antrean.set(`slice:${slice}`, { k: `slice:${slice}`, type: 'slice', slice, data, at: new Date().toISOString() });
  simpanAntrean();
  jadwalkan(900);
}

export function queueUpsert(table: RowTable, row: Record<string, unknown> & { id: string }) {
  const k = `${table}:${row.id}`;
  antrean.set(k, { k, type: 'upsert', table, row });
  simpanAntrean();
  jadwalkan(250);
}

export function queueDelete(table: RowTable, id: string) {
  const k = `${table}:${id}`;
  antrean.set(k, { k, type: 'delete', table, id });
  simpanAntrean();
  jadwalkan(250);
}

/* ------------------------------------------------------- pemetaan baris */
export function transaksiKeDb(t: Transaksi) {
  return {
    id: t.id,
    tanggal: t.tanggal,
    jenis: t.jenis,
    kategori: t.kategori,
    jumlah: Math.round(t.jumlah),
    catatan: t.catatan || '',
    merchant: t.merchant || null,
    struk_path: t.struk || null,
    sumber: t.sumber || 'manual',
    updated_at: new Date().toISOString(),
  };
}

function transaksiDariDb(r: Record<string, unknown>): Transaksi {
  return {
    id: String(r.id),
    tanggal: String(r.tanggal),
    jenis: r.jenis === 'masuk' ? 'masuk' : 'keluar',
    kategori: String(r.kategori),
    jumlah: Number(r.jumlah) || 0,
    catatan: String(r.catatan || ''),
    merchant: (r.merchant as string) || null,
    struk: (r.struk_path as string) || null,
    sumber: (r.sumber as Transaksi['sumber']) || 'manual',
  };
}

export function investasiKeDb(x: Investasi) {
  return {
    id: x.id,
    nama: x.nama,
    jenis: x.jenis,
    modal: Math.round(x.modal),
    nilai: Math.round(x.nilai),
    diperbarui: x.diperbarui || null,
    catatan: x.catatan || '',
    updated_at: new Date().toISOString(),
  };
}

function investasiDariDb(r: Record<string, unknown>): Investasi {
  return {
    id: String(r.id),
    nama: String(r.nama),
    jenis: String(r.jenis),
    modal: Number(r.modal) || 0,
    nilai: Number(r.nilai) || 0,
    diperbarui: String(r.diperbarui || ''),
    catatan: String(r.catatan || ''),
  };
}

/* ------------------------------------------------------------- kirim */
let userId: string | null = null;
let mengirim = false;

async function kirim() {
  const sb = getSupabase();
  if (!sb || mengirim) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return setStatus('luring');
  if (!userId) {
    const { data } = await sb.auth.getSession();
    userId = data.session?.user.id ?? null;
    if (!userId) return setStatus('gagal');
  }
  mengirim = true;
  let gagal = false;
  for (const op of [...antrean.values()]) {
    const { error } = await jalankan(sb, op);
    if (error) {
      gagal = true;
      console.warn('[sync] gagal', op.k, error.message);
      continue;
    }
    /* Hapus hanya kalau op belum diganti versi lebih baru selama menunggu. */
    if (antrean.get(op.k) === op) antrean.delete(op.k);
  }
  simpanAntrean();
  mengirim = false;
  if (antrean.size && !gagal) return void kirim();
  setStatus(gagal ? 'gagal' : 'tersimpan');
  if (gagal) jadwalkan(8000);
}

function jalankan(sb: SupabaseClient, op: Op) {
  if (op.type === 'slice') {
    return sb
      .from('app_state')
      .upsert({ user_id: userId, slice: op.slice, data: op.data, updated_at: op.at }, { onConflict: 'user_id,slice' });
  }
  if (op.type === 'upsert') return sb.from(op.table).upsert({ ...op.row, user_id: userId });
  return sb.from(op.table).delete().eq('id', op.id);
}

/* --------------------------------------------------------------- tarik */
export async function tarik(): Promise<RemoteData | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const [s, t, i] = await Promise.all([
    sb.from('app_state').select('slice,data'),
    sb.from('transaksi').select('*').order('tanggal', { ascending: false }).order('created_at', { ascending: false }),
    sb.from('investasi').select('*'),
  ]);
  if (s.error || t.error || i.error) {
    console.warn('[sync] tarik gagal', s.error || t.error || i.error);
    return null;
  }
  return {
    slices: Object.fromEntries((s.data || []).map(r => [r.slice as string, r.data])),
    transaksi: (t.data || []).map(transaksiDariDb),
    investasi: (i.data || []).map(investasiDariDb),
  };
}

/* ---------------------------------------------------------------- mulai */
let mulai = false;

/**
 * Dipanggil sekali dari StoreBoot. `terima` menerapkan data server ke store;
 * `pertama` bernilai true pada tarikan pertama (dipakai untuk migrasi data lama).
 */
export function startSync(terima: (r: RemoteData, pertama: boolean) => void) {
  if (mulai) return;
  mulai = true;
  bacaAntrean();
  const sb = getSupabase();
  if (!sb) return setStatus('lokal');

  let pertama = true;
  let tarikTimer: ReturnType<typeof setTimeout> | null = null;

  const segarkan = async () => {
    if (!navigator.onLine) return setStatus('luring');
    if (antrean.size) await kirim();
    const r = await tarik();
    if (!r) return setStatus('gagal');
    terima(r, pertama);
    pertama = false;
    if (!antrean.size) setStatus('tersimpan');
  };
  const nanti = (ms = 400) => {
    if (tarikTimer) clearTimeout(tarikTimer);
    tarikTimer = setTimeout(() => void segarkan(), ms);
  };

  void segarkan();

  sb.auth.getSession().then(({ data }) => {
    userId = data.session?.user.id ?? null;
    if (!userId) return;
    sb.channel('hypomone-sinkron')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_state', filter: `user_id=eq.${userId}` }, () => nanti())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transaksi', filter: `user_id=eq.${userId}` }, () => nanti())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'investasi', filter: `user_id=eq.${userId}` }, () => nanti())
      .subscribe();
  });

  window.addEventListener('online', () => nanti(50));
  window.addEventListener('offline', () => setStatus('luring'));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') nanti(50);
    /* Saat aplikasi ditinggal (pindah app di HP), kirim yang tertunda sekarang. */
    else if (antrean.size) void kirim();
  });
}
