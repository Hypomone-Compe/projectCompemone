'use client';
/* ==========================================================================
   Store aplikasi. Satu sumber kebenaran di memori, disalin ke localStorage
   untuk buka-cepat & luring, lalu disinkronkan ke Supabase (lib/sync.ts).

   · progress, status pemahaman + penjelasan Feynman per topik
   · scores, nilai per komponen, dipecah per instansi (Lab 1, Lab 2, …)
   · plans, rencana & checklist per minggu (kunci = tanggal Senin)
   · harian, asdos, anggaran → tabel app_state (jsonb per bagian)
   · transaksi & investasi   → tabel sendiri, per baris

   API publik (getEntry, setEntry, addTransaksi, ...) sengaja tidak berubah
   dari Sandbox, jadi komponen tidak perlu tahu datanya tinggal di mana.
   ========================================================================== */
import { useSyncExternalStore } from 'react';
import { supabaseConfigured } from './supabase/config';
import { KEBIASAAN_BAWAAN, KEBIASAAN_JADWAL, VERSI_KEBIASAAN_JADWAL, WARNA_KEBIASAAN, type CatatanHari, type HarianState, type Kebiasaan, type Periode, type SesiFokus, type Target } from './harian';
import { ANGGARAN_KOSONG, type Anggaran, type Investasi, type Transaksi } from './keuangan';
import {
  investasiKeDb, isPending, pendingOps, queueDelete, queueSlice, queueUpsert, startSync,
  transaksiKeDb, type RemoteData,
} from './sync';
import type { Topic } from './types';

const KEY = 'hypomone.cache.v1';
/** Kunci localStorage Sandbox lama, dibaca sekali untuk migrasi. */
const KEY_LAMA = 'monitor.v1';

export type Status = 'belum' | 'proses' | 'paham';

export interface Entry {
  s: Status;
  /** Penjelasan Feynman dengan bahasa sendiri. */
  t: string;
  u: number;
}

export interface CompScore {
  n: number;
  v: Record<string, number>;
}

export interface PlanItem {
  id: string;
  text: string;
  cid: string | null;
  done: boolean;
}

export interface WeekPlanState {
  focus?: string;
  note?: string;
  items?: PlanItem[];
  u?: number;
}

/* ---- sisi asisten dosen (Aljabar Linear KI) ---- */
export interface AsdosSession {
  id: string;
  date: string;
  topic: string;
  note: string;
  done: boolean;
}

export interface AsdosState {
  /** Isian bebas: dosen pengampu, jadwal, ruang, jumlah mahasiswa, tautan kelas. */
  info: Record<string, string>;
  sessions: AsdosSession[];
  todos: PlanItem[];
  /** Centang topik dari template silabus. */
  topics: Record<string, boolean>;
}

/* ---- keuangan pribadi ---- */
export interface KeuanganState {
  transaksi: Transaksi[];
  investasi: Investasi[];
}

export interface StoreState {
  progress: Record<string, Record<string, Entry>>;
  scores: Record<string, Record<string, CompScore>>;
  plans: Record<string, WeekPlanState>;
  asdos: AsdosState;
  keuangan: KeuanganState;
  harian: HarianState;
  anggaran: Anggaran;
}

const EMPTY_ASDOS: AsdosState = { info: {}, sessions: [], todos: [], topics: {} };

const EMPTY_KEUANGAN: KeuanganState = { transaksi: [], investasi: [] };

const EMPTY_HARIAN: HarianState = { kebiasaan: [], ceklis: {}, jurnal: {}, fokus: [], target: [] };

const EMPTY: StoreState = {
  progress: {}, scores: {}, plans: {}, asdos: EMPTY_ASDOS, keuangan: EMPTY_KEUANGAN,
  harian: EMPTY_HARIAN, anggaran: ANGGARAN_KOSONG,
};

function normal(d: Partial<StoreState>): StoreState {
  return {
    ...EMPTY,
    ...d,
    progress: { ...(d.progress || {}) },
    scores: { ...(d.scores || {}) },
    plans: { ...(d.plans || {}) },
    asdos: { ...EMPTY_ASDOS, ...(d.asdos || {}) },
    keuangan: { ...EMPTY_KEUANGAN, ...(d.keuangan || {}) },
    harian: { ...EMPTY_HARIAN, ...(d.harian || {}) },
    anggaran: { ...ANGGARAN_KOSONG, ...(d.anggaran || {}) },
  };
}

function readAll(): StoreState {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normal(JSON.parse(raw) as Partial<StoreState>);
  } catch {
    /* JSON rusak → mulai bersih */
  }
  return EMPTY;
}

let state: StoreState = EMPTY;
let hydrated = false;

const subs = new Set<() => void>();
const emit = () => subs.forEach(fn => fn());
const subscribe = (fn: () => void) => {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
};
const getSnapshot = () => state;
const getServerSnapshot = () => EMPTY;

function simpanCache(next: StoreState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* kuota penuh */
  }
}

/* ------------------------------------------------------------ bagian */
/** Isi satu bagian app_state: progress:<cid>, scores:<cid>, plans, asdos, harian, anggaran. */
function sliceData(st: StoreState, slice: string): unknown {
  const [jenis, cid] = slice.split(':');
  if (jenis === 'progress') return st.progress[cid] || {};
  if (jenis === 'scores') return st.scores[cid] || {};
  return st[jenis as 'plans' | 'asdos' | 'harian' | 'anggaran'];
}

function semuaSlice(st: StoreState): string[] {
  const cids = new Set([...Object.keys(st.progress), ...Object.keys(st.scores)]);
  return [...[...cids].flatMap(c => [`progress:${c}`, `scores:${c}`]), 'plans', 'asdos', 'harian', 'anggaran'];
}

/** Menulis state baru, lalu mengantre bagian yang berubah untuk dikirim ke Supabase. */
function persist(next: StoreState, changed: string[] = []) {
  state = next;
  simpanCache(next);
  changed.forEach(sl => queueSlice(sl, sliceData(next, sl)));
  emit();
}

/* ------------------------------------------------- terima dari server */
function terapkanRemote(r: RemoteData, pertama: boolean) {
  const kosong = !Object.keys(r.slices).length && !r.transaksi.length && !r.investasi.length;

  /* Migrasi sekali: server masih kosong tapi peramban ini punya data
     (cache yang belum terkirim, atau data Sandbox lama di domain yang sama). */
  if (pertama && kosong) {
    let lama: unknown = null;
    try {
      const raw = localStorage.getItem(KEY_LAMA);
      if (raw) lama = JSON.parse(raw);
    } catch {
      lama = null;
    }
    const sumber = lama && cadanganSah(lama) ? normal(lama as Partial<StoreState>) : state;
    if (isiCadangan(sumber).total > 0) {
      dorongSemua(sumber, [], []);
      return;
    }
  }

  const next = normal(state);
  Object.entries(r.slices).forEach(([slice, data]) => {
    if (isPending(`slice:${slice}`)) return;
    const [jenis, cid] = slice.split(':');
    if (jenis === 'progress') next.progress[cid] = (data || {}) as Record<string, Entry>;
    else if (jenis === 'scores') next.scores[cid] = (data || {}) as Record<string, CompScore>;
    else if (jenis === 'plans') next.plans = (data || {}) as StoreState['plans'];
    else if (jenis === 'asdos') next.asdos = { ...EMPTY_ASDOS, ...((data || {}) as AsdosState) };
    else if (jenis === 'harian') next.harian = { ...EMPTY_HARIAN, ...((data || {}) as HarianState) };
    else if (jenis === 'anggaran') next.anggaran = { ...ANGGARAN_KOSONG, ...((data || {}) as Anggaran) };
  });

  /* Baris: data server + perubahan yang masih tertunda di antrean. */
  const transaksi = new Map(r.transaksi.map(t => [t.id, t]));
  const investasi = new Map(r.investasi.map(x => [x.id, x]));
  const lokalT = new Map(state.keuangan.transaksi.map(t => [t.id, t]));
  const lokalI = new Map(state.keuangan.investasi.map(x => [x.id, x]));
  pendingOps().forEach(op => {
    if (op.type === 'upsert') {
      const id = String(op.row.id);
      if (op.table === 'transaksi' && lokalT.has(id)) transaksi.set(id, lokalT.get(id)!);
      if (op.table === 'investasi' && lokalI.has(id)) investasi.set(id, lokalI.get(id)!);
    } else if (op.type === 'delete') {
      (op.table === 'transaksi' ? transaksi : investasi).delete(op.id);
    }
  });
  next.keuangan = { transaksi: urutTransaksi([...transaksi.values()]), investasi: [...investasi.values()] };

  state = next;
  simpanCache(next);
  emit();
  if (pertama) pasangKebiasaanJadwal();
}

/** Menimpa server dengan isi `st`: semua bagian + semua baris. Baris di `hapusT`/`hapusI` dihapus. */
function dorongSemua(st: StoreState, hapusT: string[], hapusI: string[]) {
  state = st;
  simpanCache(st);
  semuaSlice(st).forEach(sl => queueSlice(sl, sliceData(st, sl)));
  st.keuangan.transaksi.forEach(t => queueUpsert('transaksi', transaksiKeDb(t)));
  st.keuangan.investasi.forEach(x => queueUpsert('investasi', investasiKeDb(x)));
  hapusT.forEach(id => queueDelete('transaksi', id));
  hapusI.forEach(id => queueDelete('investasi', id));
  emit();
}

/** Dipanggil sekali dari komponen root setelah mount. */
export function hydrate() {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  state = readAll();
  emit();
  startSync(terapkanRemote);
  /* Tanpa Supabase tidak ada tarikan pertama dari server: pasang langsung. */
  if (!supabaseConfigured) pasangKebiasaanJadwal();
}

export function useStore(): StoreState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* =========================== PROGRES TOPIK =========================== */
export const STATUSES: { id: Status; label: string }[] = [
  { id: 'belum', label: 'Belum' },
  { id: 'proses', label: 'Sedang dipelajari' },
  { id: 'paham', label: 'Paham' },
];

const EMPTY_ENTRY: Entry = { s: 'belum', t: '', u: 0 };

export function getEntry(cid: string, tid: string): Entry {
  return state.progress[cid]?.[tid] || EMPTY_ENTRY;
}

export function setEntry(cid: string, tid: string, patch: Partial<Entry>) {
  const progress = { ...state.progress, [cid]: { ...(state.progress[cid] || {}) } };
  progress[cid][tid] = { ...getEntry(cid, tid), ...patch, u: Date.now() };
  persist({ ...state, progress }, [`progress:${cid}`]);
}

export interface CourseProgress {
  pct: number;
  paham: number;
  proses: number;
  feynman: number;
  total: number;
}

export function courseProgress(cid: string, topics: Pick<Topic, 'id'>[]): CourseProgress {
  const total = topics.length;
  let pts = 0;
  let paham = 0;
  let proses = 0;
  let feynman = 0;
  topics.forEach(t => {
    const e = getEntry(cid, t.id);
    if (e.s === 'paham') {
      pts += 1;
      paham++;
    } else if (e.s === 'proses') {
      pts += 0.5;
      proses++;
    }
    if ((e.t || '').trim().length >= 40) feynman++;
  });
  return { pct: total ? Math.round((pts / total) * 100) : 0, paham, proses, feynman, total };
}

/* ============================ NILAI / SKOR ============================ */

export function getComp(cid: string, idx: number, defaultN = 1): CompScore {
  const c = state.scores[cid]?.[idx];
  if (!c) return { n: defaultN, v: {} };
  return { n: c.n || defaultN, v: c.v || {} };
}

function writeComp(cid: string, idx: number, next: CompScore, defaultN: number) {
  const scores = { ...state.scores, [cid]: { ...(state.scores[cid] || {}) } };
  const empty = !Object.keys(next.v).length;
  if (empty && next.n === defaultN) delete scores[cid][idx];
  else scores[cid][idx] = next;
  if (!Object.keys(scores[cid]).length) delete scores[cid];
  persist({ ...state, scores }, [`scores:${cid}`]);
}

export function setSlot(cid: string, idx: number, slot: number, val: string, defaultN = 1) {
  const cur = getComp(cid, idx, defaultN);
  const v = { ...cur.v };
  const num = Number(val);
  if (val === '' || val == null || Number.isNaN(num)) delete v[slot];
  else v[slot] = Math.max(0, Math.min(100, num));
  writeComp(cid, idx, { n: cur.n, v }, defaultN);
}

export function setSlotCount(cid: string, idx: number, n: number, defaultN = 1) {
  const cur = getComp(cid, idx, defaultN);
  const count = Math.max(1, Math.min(40, n));
  const v: Record<string, number> = {};
  Object.entries(cur.v).forEach(([k, val]) => {
    if (Number(k) < count) v[k] = val;
  });
  writeComp(cid, idx, { n: count, v }, defaultN);
}

export function clearScores(cid: string) {
  const scores = { ...state.scores };
  delete scores[cid];
  persist({ ...state, scores }, [`scores:${cid}`]);
}

/**
 * Nilai satu komponen = rata-rata slot yang terisi.
 * `bestOf` memakai N nilai terbaik (mis. Tutorial Lab Basdat: best-5 dari 6).
 */
export function compAverage(cid: string, idx: number, defaultN = 1, bestOf: number | null = null): number | null {
  const { v } = getComp(cid, idx, defaultN);
  let vals = Object.values(v).filter(x => typeof x === 'number' && !Number.isNaN(x));
  if (!vals.length) return null;
  if (bestOf && vals.length > bestOf) vals = vals.slice().sort((a, b) => b - a).slice(0, bestOf);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/* ========================= RENCANA MINGGUAN ========================= */
const EMPTY_PLAN: WeekPlanState = { focus: '', items: [], note: '' };

export function getPlan(key: string): WeekPlanState {
  return state.plans[key] || EMPTY_PLAN;
}

function writePlan(key: string, next: WeekPlanState) {
  const plans = { ...state.plans };
  if (!next.focus && !next.note && !(next.items || []).length) delete plans[key];
  else plans[key] = { ...next, u: Date.now() };
  persist({ ...state, plans }, ['plans']);
}

export function setPlanField(key: string, field: 'focus' | 'note', value: string) {
  writePlan(key, { ...getPlan(key), [field]: value });
}

export function addPlanItem(key: string, text: string, cid: string | null = null) {
  const t = String(text || '').trim();
  if (!t) return;
  const p = getPlan(key);
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  writePlan(key, { ...p, items: [...(p.items || []), { id, text: t, cid, done: false }] });
}

export function togglePlanItem(key: string, id: string) {
  const p = getPlan(key);
  writePlan(key, { ...p, items: (p.items || []).map(x => (x.id === id ? { ...x, done: !x.done } : x)) });
}

export function removePlanItem(key: string, id: string) {
  const p = getPlan(key);
  writePlan(key, { ...p, items: (p.items || []).filter(x => x.id !== id) });
}

export function planSummary(key: string) {
  const p = state.plans[key];
  if (!p) return { filled: false, total: 0, done: 0, ratio: 0 };
  const items = p.items || [];
  const done = items.filter(x => x.done).length;
  return {
    filled: !!(p.focus || items.length || p.note),
    total: items.length,
    done,
    ratio: items.length ? done / items.length : 0,
  };
}

/* ========================= ASISTEN DOSEN ========================= */
export function getAsdos(): AsdosState {
  return state.asdos || EMPTY_ASDOS;
}

function writeAsdos(next: AsdosState) {
  persist({ ...state, asdos: next }, ['asdos']);
}

export function setAsdosInfo(key: string, value: string) {
  const a = getAsdos();
  writeAsdos({ ...a, info: { ...a.info, [key]: value } });
}

export function toggleAsdosTopic(key: string) {
  const a = getAsdos();
  writeAsdos({ ...a, topics: { ...a.topics, [key]: !a.topics[key] } });
}

export function addAsdosSession(date: string, topic: string) {
  const t = topic.trim();
  if (!t) return;
  const a = getAsdos();
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  writeAsdos({
    ...a,
    sessions: [...a.sessions, { id, date, topic: t, note: '', done: false }].sort((x, y) =>
      x.date.localeCompare(y.date),
    ),
  });
}

export function patchAsdosSession(id: string, patch: Partial<AsdosSession>) {
  const a = getAsdos();
  writeAsdos({ ...a, sessions: a.sessions.map(s => (s.id === id ? { ...s, ...patch } : s)) });
}

export function removeAsdosSession(id: string) {
  const a = getAsdos();
  writeAsdos({ ...a, sessions: a.sessions.filter(s => s.id !== id) });
}

export function addAsdosTodo(text: string) {
  const t = text.trim();
  if (!t) return;
  const a = getAsdos();
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  writeAsdos({ ...a, todos: [...a.todos, { id, text: t, cid: null, done: false }] });
}

export function toggleAsdosTodo(id: string) {
  const a = getAsdos();
  writeAsdos({ ...a, todos: a.todos.map(x => (x.id === id ? { ...x, done: !x.done } : x)) });
}

export function removeAsdosTodo(id: string) {
  const a = getAsdos();
  writeAsdos({ ...a, todos: a.todos.filter(x => x.id !== id) });
}

/* ============================== KEUANGAN ============================== */
export function getKeuangan(): KeuanganState {
  return state.keuangan || EMPTY_KEUANGAN;
}

function writeKeuangan(next: KeuanganState) {
  state = { ...state, keuangan: next };
  simpanCache(state);
  emit();
}

const idBaru = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

/* Transaksi selalu tersimpan urut dari yang terbaru supaya daftarnya tidak
   perlu diurutkan ulang setiap render. */
function urutTransaksi(d: Transaksi[]) {
  return d.sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.id.localeCompare(a.id));
}

/** Mengembalikan id transaksi baru, atau null kalau isinya tidak sah. */
export function addTransaksi(t: Omit<Transaksi, 'id'> & { id?: string }): string | null {
  if (!t.jumlah || t.jumlah <= 0 || !t.tanggal) return null;
  const k = getKeuangan();
  const baru: Transaksi = { ...t, id: t.id || idBaru(), jumlah: Math.round(t.jumlah) };
  writeKeuangan({ ...k, transaksi: urutTransaksi([...k.transaksi, baru]) });
  queueUpsert('transaksi', transaksiKeDb(baru));
  return baru.id;
}

export function patchTransaksi(id: string, patch: Partial<Omit<Transaksi, 'id'>>) {
  const k = getKeuangan();
  const lama = k.transaksi.find(t => t.id === id);
  if (!lama) return;
  const baru = { ...lama, ...patch };
  if (!baru.jumlah || baru.jumlah <= 0) return;
  writeKeuangan({ ...k, transaksi: urutTransaksi(k.transaksi.map(t => (t.id === id ? baru : t))) });
  queueUpsert('transaksi', transaksiKeDb(baru));
}

export function removeTransaksi(id: string) {
  const k = getKeuangan();
  writeKeuangan({ ...k, transaksi: k.transaksi.filter(t => t.id !== id) });
  queueDelete('transaksi', id);
}

export function addInvestasi(x: Omit<Investasi, 'id'>) {
  if (!x.nama.trim()) return;
  const k = getKeuangan();
  const baru = { ...x, id: idBaru() };
  writeKeuangan({ ...k, investasi: [...k.investasi, baru] });
  queueUpsert('investasi', investasiKeDb(baru));
}

export function patchInvestasi(id: string, patch: Partial<Investasi>) {
  const k = getKeuangan();
  const daftar = k.investasi.map(x => (x.id === id ? { ...x, ...patch } : x));
  writeKeuangan({ ...k, investasi: daftar });
  const baru = daftar.find(x => x.id === id);
  if (baru) queueUpsert('investasi', investasiKeDb(baru));
}

export function removeInvestasi(id: string) {
  const k = getKeuangan();
  writeKeuangan({ ...k, investasi: k.investasi.filter(x => x.id !== id) });
  queueDelete('investasi', id);
}

/* ------------------------------------------------------------ anggaran */
export function getAnggaran(): Anggaran {
  return state.anggaran || ANGGARAN_KOSONG;
}

export function setAnggaran(patch: Partial<Anggaran>) {
  persist({ ...state, anggaran: { ...getAnggaran(), ...patch } }, ['anggaran']);
}

export function setAnggaranKategori(kategori: string, jumlah: number) {
  const k = { ...getAnggaran().kategori };
  if (jumlah > 0) k[kategori] = Math.round(jumlah);
  else delete k[kategori];
  setAnggaran({ kategori: k });
}

/* ========================== KEHIDUPAN HARIAN ==========================
   Kebiasaan, jurnal, sesi fokus, dan target. Bentuk penyimpanannya sengaja
   jarang: hanya centang bernilai true yang ditulis, dan hari tanpa catatan
   tidak punya kunci sama sekali. Setahun pemakaian tetap muat di localStorage.
   ====================================================================== */
export function getHarian(): HarianState {
  return state.harian || EMPTY_HARIAN;
}

function writeHarian(next: HarianState) {
  persist({ ...state, harian: next }, ['harian']);
}

/* ---- kebiasaan ---- */
export function addKebiasaan(nama: string, ket = '', targetPekan = 7) {
  const n = nama.trim();
  if (!n) return;
  const h = getHarian();
  const warna = WARNA_KEBIASAAN[h.kebiasaan.length % WARNA_KEBIASAAN.length];
  const baru: Kebiasaan = {
    id: idBaru(),
    nama: n,
    ket: ket.trim(),
    warna,
    targetPekan: Math.max(1, Math.min(7, targetPekan)),
    aktif: true,
  };
  writeHarian({ ...h, kebiasaan: [...h.kebiasaan, baru] });
}

/** Memasang set bawaan sekaligus. Hanya dipanggil dari tombol, tidak pernah
    otomatis: daftar kebiasaan orang lain yang muncul sendiri di halamanmu
    adalah cara tercepat membuat halaman ini diabaikan. */
export function pakaiKebiasaanBawaan() {
  const h = getHarian();
  if (h.kebiasaan.length) return;
  writeHarian({ ...h, kebiasaan: KEBIASAAN_BAWAAN.map(k => ({ ...k, id: idBaru() })) });
}

/** Memasang kebiasaan dari jadwal semester, sekali per versi. Yang mirip dengan
    kebiasaan yang sudah ada dilewati; yang pernah dihapus tidak dipasang ulang. */
export function pasangKebiasaanJadwal() {
  const h = getHarian();
  if ((h.jadwalTerpasang ?? 0) >= VERSI_KEBIASAAN_JADWAL) return;
  const baru: Kebiasaan[] = KEBIASAAN_JADWAL.filter(k => !h.kebiasaan.some(x => k.mirip.test(x.nama))).map((k, i) => ({
    id: idBaru(),
    nama: k.nama,
    ket: k.ket,
    targetPekan: k.targetPekan,
    aktif: k.aktif,
    warna: WARNA_KEBIASAAN[(h.kebiasaan.length + i) % WARNA_KEBIASAAN.length],
  }));
  writeHarian({ ...h, kebiasaan: [...h.kebiasaan, ...baru], jadwalTerpasang: VERSI_KEBIASAAN_JADWAL });
}

/** Menandai (tanggal) atau melepas (null) satu topik ICAIC. */
export function tandaiIcaic(no: number, tanggal: string | null) {
  const h = getHarian();
  const icaic = { ...(h.icaic || {}) };
  if (tanggal) icaic[String(no)] = tanggal;
  else delete icaic[String(no)];
  writeHarian({ ...h, icaic });
}

export function patchKebiasaan(id: string, patch: Partial<Kebiasaan>) {
  const h = getHarian();
  writeHarian({ ...h, kebiasaan: h.kebiasaan.map(k => (k.id === id ? { ...k, ...patch } : k)) });
}

/** Menghapus kebiasaan sekaligus seluruh riwayat centangnya. Riwayat yang
    ditinggalkan akan membuat persentase konsistensi ikut salah hitung. */
export function removeKebiasaan(id: string) {
  const h = getHarian();
  const ceklis: HarianState['ceklis'] = {};
  Object.entries(h.ceklis).forEach(([tgl, isi]) => {
    const sisa = { ...isi };
    delete sisa[id];
    if (Object.keys(sisa).length) ceklis[tgl] = sisa;
  });
  writeHarian({ ...h, kebiasaan: h.kebiasaan.filter(k => k.id !== id), ceklis });
}

export function toggleCeklis(tanggal: string, id: string) {
  const h = getHarian();
  const hari = { ...(h.ceklis[tanggal] || {}) };
  if (hari[id]) delete hari[id];
  else hari[id] = true;
  const ceklis = { ...h.ceklis };
  if (Object.keys(hari).length) ceklis[tanggal] = hari;
  else delete ceklis[tanggal];
  writeHarian({ ...h, ceklis });
}

/* ---- jurnal ---- */
export function setCatatan(tanggal: string, patch: Partial<CatatanHari>) {
  const h = getHarian();
  const kini = { ...(h.jurnal[tanggal] || {}), ...patch, u: Date.now() };
  const kosong =
    !kini.mood && !kini.energi && !kini.tidur &&
    !(kini.syukur || '').trim() && !(kini.refleksi || '').trim() && !(kini.pelajaran || '').trim();
  const jurnal = { ...h.jurnal };
  if (kosong) delete jurnal[tanggal];
  else jurnal[tanggal] = kini;
  writeHarian({ ...h, jurnal });
}

/* ---- sesi fokus ---- */
export function addFokus(f: Omit<SesiFokus, 'id'>) {
  if (!f.menit || f.menit <= 0 || !f.tanggal) return;
  const h = getHarian();
  const daftar = [...h.fokus, { ...f, menit: Math.round(f.menit), id: idBaru() }].sort(
    (a, b) => b.tanggal.localeCompare(a.tanggal) || b.id.localeCompare(a.id),
  );
  writeHarian({ ...h, fokus: daftar });
}

export function removeFokus(id: string) {
  const h = getHarian();
  writeHarian({ ...h, fokus: h.fokus.filter(f => f.id !== id) });
}

/* ---- target ---- */
export function addTarget(teks: string, periode: Periode, kunci: string, langkah = 1, tenggat?: string, jam?: string) {
  const t = teks.trim();
  if (!t) return;
  const h = getHarian();
  const baru: Target = {
    id: idBaru(),
    teks: t,
    periode,
    kunci,
    langkah: Math.max(1, Math.min(99, langkah)),
    selesai: 0,
    ...(tenggat ? { tenggat } : {}),
    ...(jam ? { jam } : {}),
  };
  writeHarian({ ...h, target: [...h.target, baru] });
}

/** Menggeser progres satu langkah, dijaga tetap di rentang 0..langkah. */
export function geserTarget(id: string, delta: number) {
  const h = getHarian();
  writeHarian({
    ...h,
    target: h.target.map(t =>
      t.id === id ? { ...t, selesai: Math.max(0, Math.min(t.langkah, t.selesai + delta)) } : t,
    ),
  });
}

/** Mengubah tenggat; string kosong = kembali ke akhir periode / tanpa jam. */
export function aturTenggat(id: string, tenggat: string, jam: string) {
  const h = getHarian();
  writeHarian({
    ...h,
    target: h.target.map(t => {
      if (t.id !== id) return t;
      const baru: Target = { ...t, tenggat, jam };
      if (!tenggat) delete baru.tenggat;
      if (!jam) delete baru.jam;
      return baru;
    }),
  });
}

/** Memindahkan target harian yang tertinggal ke hari lain (tenggatnya ikut hari itu). */
export function pindahTargetHarian(id: string, tanggal: string) {
  const h = getHarian();
  writeHarian({
    ...h,
    target: h.target.map(t => {
      if (t.id !== id) return t;
      const baru: Target = { ...t, kunci: tanggal };
      delete baru.tenggat;
      return baru;
    }),
  });
}

export function removeTarget(id: string) {
  const h = getHarian();
  writeHarian({ ...h, target: h.target.filter(t => t.id !== id) });
}

/* ============================ EKSPOR / IMPOR ============================ */
export interface Cadangan extends Partial<StoreState> {
  version?: number;
  exportedAt?: string;
}

export function exportData(): Cadangan {
  return { ...state, version: 1, exportedAt: new Date().toISOString() };
}

const KUNCI_SAH = ['progress', 'scores', 'plans', 'asdos', 'keuangan', 'harian', 'anggaran'] as const;

/**
 * Memastikan berkas yang dipilih memang cadangan Sandbox.
 *
 * Tanpa ini, JSON apa pun akan diterima dan seluruh isi perangkat terhapus
 * diam-diam, karena setiap bidang yang hilang jatuh ke nilai kosong. Salah
 * memilih berkas di penjelajah ponsel terlalu mudah untuk dibiarkan berakhir
 * seperti itu.
 */
export function cadanganSah(d: unknown): d is Cadangan {
  if (!d || typeof d !== 'object' || Array.isArray(d)) return false;
  const o = d as Record<string, unknown>;
  return KUNCI_SAH.some(k => o[k] != null && typeof o[k] === 'object');
}

export interface IsiCadangan {
  dibuat: string | null;
  baris: { label: string; jumlah: number }[];
  total: number;
}

const hitung = (o: unknown): number => (o && typeof o === 'object' ? Object.keys(o).length : 0);

/**
 * Apa saja yang ada di dalam berkas, untuk ditunjukkan SEBELUM menimpa.
 * Persetujuan tanpa melihat isinya bukan persetujuan; yang sering terjadi
 * justru memulihkan cadangan lama di atas data yang lebih baru.
 */
export function isiCadangan(d: Cadangan): IsiCadangan {
  const h = d.harian;
  const k = d.keuangan;
  const a = d.asdos;

  const jumlahTopik = Object.values(d.progress || {}).reduce((n, m) => n + hitung(m), 0);

  const baris = [
    { label: 'Mata kuliah dengan nilai', jumlah: hitung(d.scores) },
    { label: 'Topik dengan catatan', jumlah: jumlahTopik },
    { label: 'Rencana mingguan', jumlah: hitung(d.plans) },
    { label: 'Kebiasaan', jumlah: (h?.kebiasaan || []).length },
    { label: 'Hari berjurnal', jumlah: hitung(h?.jurnal) },
    { label: 'Sesi fokus', jumlah: (h?.fokus || []).length },
    { label: 'Target', jumlah: (h?.target || []).length },
    { label: 'Transaksi', jumlah: (k?.transaksi || []).length },
    { label: 'Investasi', jumlah: (k?.investasi || []).length },
    { label: 'Sesi asisten dosen', jumlah: (a?.sessions || []).length },
  ];

  return {
    dibuat: typeof d.exportedAt === 'string' ? d.exportedAt : null,
    baris: baris.filter(b => b.jumlah > 0),
    total: baris.reduce((n, b) => n + b.jumlah, 0),
  };
}

/** Isi perangkat saat ini, dalam bentuk yang sama, untuk dibandingkan. */
export function isiSekarang(): IsiCadangan {
  return isiCadangan(state);
}

export function importData(d: unknown): boolean {
  if (!cadanganSah(d)) return false;
  const c = normal(d as Cadangan);
  const masukT = new Set(c.keuangan.transaksi.map(t => t.id));
  const masukI = new Set(c.keuangan.investasi.map(x => x.id));
  /* Matkul yang ada di perangkat ini tapi tidak ada di berkas ikut dikosongkan. */
  Object.keys(state.progress).forEach(cid => (c.progress[cid] ||= {}));
  Object.keys(state.scores).forEach(cid => (c.scores[cid] ||= {}));
  dorongSemua(
    c,
    state.keuangan.transaksi.filter(t => !masukT.has(t.id)).map(t => t.id),
    state.keuangan.investasi.filter(x => !masukI.has(x.id)).map(x => x.id),
  );
  return true;
}

export function resetAll() {
  const kosong = normal({});
  Object.keys(state.progress).forEach(cid => (kosong.progress[cid] = {}));
  Object.keys(state.scores).forEach(cid => (kosong.scores[cid] = {}));
  dorongSemua(kosong, state.keuangan.transaksi.map(t => t.id), state.keuangan.investasi.map(x => x.id));
}
