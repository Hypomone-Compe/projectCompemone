/* ==========================================================================
   Monitoring kehidupan sehari-hari: kebiasaan, jurnal, fokus, tidur, target.

   Semua isi berkas ini murni hitungan, tanpa React dan tanpa localStorage.
   Bentuk datanya tinggal di lib/store.ts; di sini hanya ada cara membacanya:
   runtun, konsistensi, rekap pekan/bulan, korelasi, dan penyusunan insight.

   Alasan dipisah: papan harian menampilkan angka yang sama di beberapa
   tempat (ringkasan atas, grafik, tinjauan pekanan). Kalau rumusnya ikut
   menempel di komponen, tiga tempat itu cepat berbeda hasilnya.
   ========================================================================== */
import { addDays, DAY_SHORT, diffDays, mondayOf, parseYmd, todayYmd, ymd } from './kalender';

/* ------------------------------------------------------------- bentuk data */

/** Skala 1–5 dipakai untuk mood dan energi. */
export type Skala = 1 | 2 | 3 | 4 | 5;

export type Periode = 'hari' | 'pekan' | 'bulan';

export interface Kebiasaan {
  id: string;
  nama: string;
  /** Definisi operasional: kapan sebuah hari boleh dicentang. */
  ket: string;
  warna: string;
  /** Berapa hari per pekan kebiasaan ini dianggap tuntas. 1–7. */
  targetPekan: number;
  aktif: boolean;
}

export interface CatatanHari {
  mood?: Skala;
  energi?: Skala;
  /** Jam tidur semalam, boleh pecahan (7,5). */
  tidur?: number;
  syukur?: string;
  refleksi?: string;
  pelajaran?: string;
  u?: number;
}

export interface SesiFokus {
  id: string;
  tanggal: string;
  menit: number;
  /** Matkul yang dikerjakan, null untuk hal di luar kuliah. */
  cid: string | null;
  label: string;
}

export interface Target {
  id: string;
  teks: string;
  periode: Periode;
  /** Tanggal itu ('2026-10-16'), Senin pekan itu ('2026-08-24'), atau bulan ('2026-08'). */
  kunci: string;
  /** Jumlah langkah yang harus dilalui supaya target dianggap tuntas. */
  langkah: number;
  selesai: number;
  /** Batas tanggal 'YYYY-MM-DD'. Kosong = akhir periodenya (target lama tidak punya ini). */
  tenggat?: string;
  /** Batas jam 'HH:MM' pada tanggal tenggat, opsional. */
  jam?: string;
}

export interface HarianState {
  kebiasaan: Kebiasaan[];
  /** ceklis[tanggal][idKebiasaan] = true. Hanya yang true yang disimpan. */
  ceklis: Record<string, Record<string, boolean>>;
  jurnal: Record<string, CatatanHari>;
  fokus: SesiFokus[];
  target: Target[];
}

/* ------------------------------------------------------------- konstanta */

/** Palet kebiasaan. Sengaja beda dari warna matkul supaya dua dunia ini
    tidak pernah tertukar saat dibaca sekilas di grafik yang sama. */
export const WARNA_KEBIASAAN = [
  '#0f766e', '#b3106c', '#2b46f0', '#c0431f', '#7d5f00', '#12683f', '#5b21b6', '#0e7490',
];

/** Set bawaan, hanya dipasang kalau pemakai menekan tombolnya sendiri. */
export const KEBIASAAN_BAWAAN: Omit<Kebiasaan, 'id'>[] = [
  { nama: 'Bangun sebelum 06.00', ket: 'Kaki menyentuh lantai sebelum 06.00, bukan sekadar terbangun.', warna: WARNA_KEBIASAAN[0], targetPekan: 6, aktif: true },
  { nama: 'Gerak 20 menit', ket: 'Jalan cepat, lari, atau angkat beban. Minimal 20 menit menerus.', warna: WARNA_KEBIASAAN[1], targetPekan: 4, aktif: true },
  { nama: 'Baca materi kuliah', ket: 'Membaca slide atau buku acuan sebelum kelasnya, bukan sesudah.', warna: WARNA_KEBIASAAN[2], targetPekan: 5, aktif: true },
  { nama: 'Ngoding di luar tugas', ket: 'Minimal 30 menit menulis kode yang bukan tugas kuliah.', warna: WARNA_KEBIASAAN[3], targetPekan: 4, aktif: true },
  { nama: 'Tidur sebelum 23.30', ket: 'Layar mati dan berbaring sebelum 23.30.', warna: WARNA_KEBIASAAN[4], targetPekan: 6, aktif: true },
  { nama: 'Jurnal malam', ket: 'Mengisi refleksi hari ini di halaman ini sebelum tidur.', warna: WARNA_KEBIASAAN[5], targetPekan: 7, aktif: true },
];

export const LABEL_MOOD: Record<Skala, string> = {
  1: 'Berat', 2: 'Kurang', 3: 'Biasa', 4: 'Baik', 5: 'Sangat baik',
};

export const LABEL_ENERGI: Record<Skala, string> = {
  1: 'Habis', 2: 'Lemah', 3: 'Cukup', 4: 'Segar', 5: 'Penuh',
};

export const HARI_PENDEK = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const BULAN_PANJANG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

/* ------------------------------------------------------------- kunci waktu */

export const kunciPekan = (tanggal: string): string => mondayOf(tanggal);

export const kunciBulan = (tanggal: string): string => tanggal.slice(0, 7);

export function namaBulanHarian(kunci: string): string {
  const [y, m] = kunci.split('-').map(Number);
  return `${BULAN_PANJANG[(m || 1) - 1]} ${y}`;
}

/** Tujuh tanggal Senin–Minggu untuk pekan yang memuat `tanggal`. */
export function hariPekan(tanggal: string): string[] {
  const senin = parseYmd(mondayOf(tanggal));
  return Array.from({ length: 7 }, (_, i) => ymd(addDays(senin, i)));
}

/** Semua tanggal dalam satu bulan 'YYYY-MM'. */
export function hariBulan(kunci: string): string[] {
  const [y, m] = kunci.split('-').map(Number);
  const jumlah = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Array.from({ length: jumlah }, (_, i) => `${kunci}-${String(i + 1).padStart(2, '0')}`);
}

/** N tanggal terakhir termasuk hari ini, urut dari yang paling lama. */
export function hariTerakhir(sampai: string, n: number): string[] {
  const akhir = parseYmd(sampai);
  return Array.from({ length: n }, (_, i) => ymd(addDays(akhir, i - n + 1)));
}

/** Indeks hari dalam pekan, 0 = Senin. */
export const indeksHari = (tanggal: string): number => (parseYmd(tanggal).getUTCDay() + 6) % 7;

export function geserBulan(kunci: string, delta: number): string {
  const [y, m] = kunci.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/* ------------------------------------------------------------- kebiasaan */

export const kebiasaanAktif = (s: HarianState): Kebiasaan[] => s.kebiasaan.filter(k => k.aktif);

export function dicentang(s: HarianState, tanggal: string, id: string): boolean {
  return !!s.ceklis[tanggal]?.[id];
}

export interface RingkasHari {
  tanggal: string;
  tuntas: number;
  total: number;
  /** 0–100. Nol kalau tidak ada kebiasaan aktif, bukan NaN. */
  persen: number;
}

export function ringkasHari(s: HarianState, tanggal: string): RingkasHari {
  const aktif = kebiasaanAktif(s);
  const tuntas = aktif.filter(k => dicentang(s, tanggal, k.id)).length;
  return {
    tanggal,
    tuntas,
    total: aktif.length,
    persen: aktif.length ? Math.round((tuntas / aktif.length) * 100) : 0,
  };
}

export interface BarisPekan {
  kebiasaan: Kebiasaan;
  /** Tujuh nilai Senin–Minggu. */
  hari: boolean[];
  tuntas: number;
  target: number;
  /** Terhadap target pekanan, bisa lebih dari 100. */
  persen: number;
  capai: boolean;
}

export function rekapPekan(s: HarianState, tanggal: string): BarisPekan[] {
  const hari = hariPekan(tanggal);
  return kebiasaanAktif(s).map(k => {
    const centang = hari.map(h => dicentang(s, h, k.id));
    const tuntas = centang.filter(Boolean).length;
    const target = Math.max(1, Math.min(7, k.targetPekan));
    return {
      kebiasaan: k,
      hari: centang,
      tuntas,
      target,
      persen: Math.round((tuntas / target) * 100),
      capai: tuntas >= target,
    };
  });
}

/** Runtun hari berturut-turut sampai `sampai`. Hari ini yang belum dicentang
    tidak memutus runtun: hari masih berjalan, jadi hitungan dimulai dari
    kemarin kalau hari ini masih kosong. */
export function runtun(s: HarianState, id: string, sampai: string = todayYmd()): number {
  let n = 0;
  let kursor = parseYmd(sampai);
  if (!dicentang(s, ymd(kursor), id)) kursor = addDays(kursor, -1);
  while (dicentang(s, ymd(kursor), id)) {
    n++;
    kursor = addDays(kursor, -1);
    if (n > 400) break;
  }
  return n;
}

/** Runtun terpanjang yang pernah tercatat untuk satu kebiasaan. */
export function runtunTerpanjang(s: HarianState, id: string): number {
  const tanggal = Object.keys(s.ceklis).filter(t => s.ceklis[t]?.[id]).sort();
  let terbaik = 0;
  let jalan = 0;
  let sebelum: string | null = null;
  tanggal.forEach(t => {
    jalan = sebelum && diffDays(t, sebelum) === 1 ? jalan + 1 : 1;
    sebelum = t;
    if (jalan > terbaik) terbaik = jalan;
  });
  return terbaik;
}

/** Persentase hari yang tercentang dalam rentang N hari terakhir. */
export function konsistensi(s: HarianState, id: string, sampai: string, n = 30): number {
  const hari = hariTerakhir(sampai, n);
  const ada = hari.filter(h => dicentang(s, h, id)).length;
  return Math.round((ada / n) * 100);
}

/** Runtun terpanjang di antara semua kebiasaan aktif, untuk ubin ringkasan. */
export function runtunTerbaik(s: HarianState, sampai: string): { nama: string; hari: number } {
  let out = { nama: '', hari: 0 };
  kebiasaanAktif(s).forEach(k => {
    const r = runtun(s, k.id, sampai);
    if (r > out.hari) out = { nama: k.nama, hari: r };
  });
  return out;
}

/* ------------------------------------------------------------- jurnal */

export const catatan = (s: HarianState, tanggal: string): CatatanHari => s.jurnal[tanggal] || {};

export function jurnalTerisi(c: CatatanHari): boolean {
  return !!(c.mood || c.energi || c.tidur || (c.syukur || '').trim() || (c.refleksi || '').trim() || (c.pelajaran || '').trim());
}

export interface TitikHari {
  tanggal: string;
  label: string;
  mood: number | null;
  energi: number | null;
  tidur: number | null;
  persen: number;
  menit: number;
}

/** Deret harian gabungan untuk semua grafik garis di halaman ini. */
export function deretHarian(s: HarianState, sampai: string, n = 30): TitikHari[] {
  const menitPerHari = fokusPerHari(s);
  return hariTerakhir(sampai, n).map(t => {
    const c = catatan(s, t);
    const d = parseYmd(t);
    return {
      tanggal: t,
      label: `${d.getUTCDate()} ${DAY_SHORT[d.getUTCDay()]}`,
      mood: c.mood ?? null,
      energi: c.energi ?? null,
      tidur: typeof c.tidur === 'number' ? c.tidur : null,
      persen: ringkasHari(s, t).persen,
      menit: menitPerHari[t] || 0,
    };
  });
}

/* ------------------------------------------------------------- fokus */

export function fokusPerHari(s: HarianState): Record<string, number> {
  const out: Record<string, number> = {};
  s.fokus.forEach(f => {
    out[f.tanggal] = (out[f.tanggal] || 0) + f.menit;
  });
  return out;
}

export function fokusPerMatkul(s: HarianState, dari: string, sampai: string): Record<string, number> {
  const out: Record<string, number> = {};
  s.fokus.forEach(f => {
    if (f.tanggal < dari || f.tanggal > sampai) return;
    const kunci = f.cid || '_lain';
    out[kunci] = (out[kunci] || 0) + f.menit;
  });
  return out;
}

export function totalFokus(s: HarianState, dari: string, sampai: string): number {
  return s.fokus.reduce((a, f) => (f.tanggal >= dari && f.tanggal <= sampai ? a + f.menit : a), 0);
}

/** 150 → "2j 30m" · 45 → "45m" · 0 → "0m" */
export function jam(menit: number): string {
  const m = Math.max(0, Math.round(menit));
  const j = Math.floor(m / 60);
  const sisa = m % 60;
  if (!j) return `${sisa}m`;
  return sisa ? `${j}j ${sisa}m` : `${j}j`;
}

/** Bentuk desimal untuk sumbu grafik: 150 → 2.5 */
export const keJam = (menit: number): number => Math.round((menit / 60) * 100) / 100;

/* ------------------------------------------------------------- target */

export function targetPeriode(s: HarianState, periode: Periode, kunci: string): Target[] {
  return s.target.filter(t => t.periode === periode && t.kunci === kunci);
}

/** Rentang tanggal sebuah periode: [awal, akhir]. */
export function rentangPeriode(periode: Periode, kunci: string): [string, string] {
  if (periode === 'hari') return [kunci, kunci];
  if (periode === 'pekan') return [kunci, ymd(addDays(parseYmd(kunci), 6))];
  const hari = hariBulan(kunci);
  return [hari[0], hari[hari.length - 1]];
}

/** Tenggat efektif: yang diisi, atau hari terakhir periodenya. */
export const tenggatTarget = (t: Target): string => t.tenggat || rentangPeriode(t.periode, t.kunci)[1];

export const tuntasTarget = (t: Target): boolean => t.selesai >= Math.max(1, t.langkah);

export type NadaTenggat = 'tuntas' | 'lewat' | 'dekat' | 'aman';

/**
 * Sisa waktu sebuah target terhadap hari ini. `menitKini` = menit sejak 00.00 WIB,
 * dipakai bila target punya jam tenggat hari ini.
 */
export function statusTenggat(t: Target, hariIni: string, menitKini: number): { label: string; nada: NadaTenggat; sisa: number } {
  const tgl = tenggatTarget(t);
  const sisa = diffDays(tgl, hariIni);
  const pukul = t.jam ? ` ${t.jam.replace(':', '.')}` : '';
  const tanggal = (() => {
    const d = parseYmd(tgl);
    return `${DAY_SHORT[d.getUTCDay()]} ${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
  })();
  if (tuntasTarget(t)) return { label: `Tenggat ${tanggal}${pukul}`, nada: 'tuntas', sisa };
  if (sisa < 0) return { label: `Lewat ${-sisa} hari · ${tanggal}${pukul}`, nada: 'lewat', sisa };
  if (sisa === 0) {
    if (t.jam) {
      const [h, m] = t.jam.split(':').map(Number);
      const kurang = h * 60 + m - menitKini;
      if (kurang < 0) return { label: `Lewat jam${pukul}`, nada: 'lewat', sisa };
      const sisaJam = kurang >= 60 ? `${Math.floor(kurang / 60)} jam lagi` : `${kurang} menit lagi`;
      return { label: `Hari ini${pukul} · ${sisaJam}`, nada: 'dekat', sisa };
    }
    return { label: 'Hari ini', nada: 'dekat', sisa };
  }
  if (sisa === 1) return { label: `Besok${pukul}`, nada: 'dekat', sisa };
  return { label: `${sisa} hari lagi · ${tanggal}${pukul}`, nada: sisa <= 2 ? 'dekat' : 'aman', sisa };
}

/** Yang belum tuntas dulu, urut tenggat terdekat; yang sudah tuntas di bawah. */
export function urutTarget(daftar: Target[]): Target[] {
  const kunciUrut = (t: Target) => `${tuntasTarget(t) ? 1 : 0}|${tenggatTarget(t)}|${t.jam || '99:99'}`;
  return [...daftar].sort((a, b) => kunciUrut(a).localeCompare(kunciUrut(b)));
}

/** Target harian tujuh hari terakhir yang belum tuntas, untuk dibawa ke hari ini. */
export function targetHarianTertinggal(s: HarianState, hariIni: string): Target[] {
  const batas = ymd(addDays(parseYmd(hariIni), -7));
  return s.target.filter(t => t.periode === 'hari' && t.kunci < hariIni && t.kunci >= batas && !tuntasTarget(t));
}

export function progresTarget(t: Target): number {
  const l = Math.max(1, t.langkah);
  return Math.min(100, Math.round((Math.min(t.selesai, l) / l) * 100));
}

export function ringkasTarget(daftar: Target[]): { total: number; tuntas: number; persen: number } {
  const total = daftar.length;
  const tuntas = daftar.filter(t => t.selesai >= Math.max(1, t.langkah)).length;
  const persen = total
    ? Math.round(daftar.reduce((a, t) => a + progresTarget(t), 0) / total)
    : 0;
  return { total, tuntas, persen };
}

/* ------------------------------------------------------------- statistik */

/**
 * Korelasi Pearson. Dipakai untuk pertanyaan seperti "kalau tidurku cukup,
 * apakah jam fokusku benar-benar naik?".
 *
 * Mengembalikan null kalau pasangan datanya di bawah `minimal`: korelasi dari
 * tiga titik bukan temuan, itu kebetulan. Angka yang tidak layak dipercaya
 * lebih baik tidak ditampilkan sama sekali daripada ditampilkan dengan
 * peringatan kecil yang tidak akan dibaca.
 */
export function korelasi(pasangan: [number, number][], minimal = 6): number | null {
  const d = pasangan.filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b));
  if (d.length < minimal) return null;
  const n = d.length;
  const rerataA = d.reduce((s, [a]) => s + a, 0) / n;
  const rerataB = d.reduce((s, [, b]) => s + b, 0) / n;
  let atas = 0;
  let kiri = 0;
  let kanan = 0;
  d.forEach(([a, b]) => {
    const da = a - rerataA;
    const db = b - rerataB;
    atas += da * db;
    kiri += da * da;
    kanan += db * db;
  });
  const bawah = Math.sqrt(kiri * kanan);
  if (!bawah) return null;
  return Math.round((atas / bawah) * 100) / 100;
}

export function bacaKorelasi(r: number): string {
  const a = Math.abs(r);
  const kuat = a >= 0.6 ? 'kuat' : a >= 0.35 ? 'sedang' : 'lemah';
  return `${r > 0 ? 'searah' : 'berlawanan'}, ${kuat}`;
}

/** Tanggal centang paling awal yang pernah tercatat, atau null kalau kosong.
    Dipakai sebagai batas bawah statistik: hari sebelum seseorang mulai memantau
    bukan hari yang gagal, itu hari yang tidak diikutsertakan. */
export function mulaiMemantau(s: HarianState): string | null {
  const tanggal = Object.keys(s.ceklis).sort();
  return tanggal[0] || null;
}

/** Rata-rata persen tuntas per nama hari, dari N pekan terakhir. */
export function polaHari(s: HarianState, sampai: string, pekan = 8): { hari: string; persen: number; ada: number }[] {
  const awalJendela = ymd(addDays(parseYmd(mondayOf(sampai)), -7 * (pekan - 1)));
  const awalCatat = mulaiMemantau(s);
  const mulai = awalCatat && awalCatat > awalJendela ? awalCatat : awalJendela;

  const kumpul = HARI_PENDEK.map(h => ({ hari: h, jumlah: 0, ada: 0 }));
  let kursor = parseYmd(mulai);
  const batas = parseYmd(sampai);
  while (kursor <= batas) {
    const t = ymd(kursor);
    const r = ringkasHari(s, t);
    if (r.total) {
      const i = indeksHari(t);
      kumpul[i].jumlah += r.persen;
      kumpul[i].ada += 1;
    }
    kursor = addDays(kursor, 1);
  }
  return kumpul.map(k => ({
    hari: k.hari,
    persen: k.ada ? Math.round(k.jumlah / k.ada) : 0,
    ada: k.ada,
  }));
}

/* ------------------------------------------------------------- insight */

export type NadaInsight = 'baik' | 'awas' | 'netral';

export interface Insight {
  judul: string;
  isi: string;
  nada: NadaInsight;
}

/**
 * Tinjauan pekanan yang disusun sendiri dari data, bukan template tetap.
 * Hanya butir yang datanya cukup yang muncul; kalau semuanya masih kosong,
 * pemanggil yang menampilkan keadaan kosong.
 */
export function tinjauan(s: HarianState, sampai: string = todayYmd()): Insight[] {
  const out: Insight[] = [];
  const aktif = kebiasaanAktif(s);
  const seninIni = mondayOf(sampai);
  const seninLalu = ymd(addDays(parseYmd(seninIni), -7));

  /* 1. Konsistensi pekan ini dibanding pekan lalu. */
  if (aktif.length) {
    const rata = (senin: string) => {
      const hari = hariPekan(senin).filter(h => h <= sampai);
      if (!hari.length) return null;
      return Math.round(hari.reduce((a, h) => a + ringkasHari(s, h).persen, 0) / hari.length);
    };
    const ini = rata(seninIni);
    const lalu = rata(seninLalu);
    if (ini != null && lalu != null && lalu > 0) {
      const selisih = ini - lalu;
      out.push({
        judul: `Konsistensi pekan ini ${ini}%`,
        isi:
          selisih > 4
            ? `Naik ${selisih} poin dari pekan lalu (${lalu}%). Apa pun yang kamu ubah pekan ini, pertahankan.`
            : selisih < -4
              ? `Turun ${Math.abs(selisih)} poin dari pekan lalu (${lalu}%). Lihat kebiasaan mana yang paling banyak bolong di bawah.`
              : `Praktis sama dengan pekan lalu (${lalu}%). Stabil, tapi belum bergerak naik.`,
        nada: selisih > 4 ? 'baik' : selisih < -4 ? 'awas' : 'netral',
      });
    } else if (ini != null) {
      out.push({
        judul: `Konsistensi pekan ini ${ini}%`,
        isi: 'Belum ada pekan pembanding. Setelah dua pekan penuh, bagian ini mulai menunjukkan arah.',
        nada: 'netral',
      });
    }
  }

  /* 2. Kebiasaan terkuat dan paling rapuh dalam 30 hari. */
  if (aktif.length >= 2) {
    const skor = aktif
      .map(k => ({ k, v: konsistensi(s, k.id, sampai, 30) }))
      .sort((a, b) => b.v - a.v);
    const kuat = skor[0];
    const rapuh = skor[skor.length - 1];
    if (kuat.v > 0) {
      out.push({
        judul: `Terkuat: ${kuat.k.nama}`,
        isi: `${kuat.v}% hari dalam 30 hari terakhir. Runtun terpanjangmu di kebiasaan ini ${runtunTerpanjang(s, kuat.k.id)} hari.`,
        nada: 'baik',
      });
    }
    if (rapuh.v < 50 && kuat.v > 0) {
      out.push({
        judul: `Paling rapuh: ${rapuh.k.nama}`,
        isi: `Baru ${rapuh.v}% dalam 30 hari. Kalau satu kebiasaan saja yang mau kamu perbaiki bulan depan, ambil yang ini, jangan semuanya sekaligus.`,
        nada: 'awas',
      });
    }
  }

  /* 3. Hari terlemah dalam sepekan. */
  const pola = polaHari(s, sampai, 8).filter(p => p.ada >= 3);
  if (pola.length === 7) {
    const urut = [...pola].sort((a, b) => a.persen - b.persen);
    const lemah = urut[0];
    const kuat = urut[urut.length - 1];
    if (kuat.persen - lemah.persen >= 15) {
      out.push({
        judul: `Hari ${lemah.hari} jadi titik bocormu`,
        isi: `Rata-rata ${lemah.persen}% di hari ${lemah.hari}, jauh di bawah hari ${kuat.hari} yang ${kuat.persen}%. Cek apa yang berbeda di jadwalmu hari itu.`,
        nada: 'awas',
      });
    }
  }

  /* 4. Tidur terhadap fokus dan mood. */
  const deret = deretHarian(s, sampai, 45);
  const tidurFokus = korelasi(
    deret.filter(d => d.tidur != null && d.menit > 0).map(d => [d.tidur as number, d.menit] as [number, number]),
  );
  if (tidurFokus != null && Math.abs(tidurFokus) >= 0.35) {
    out.push({
      judul: `Tidur dan jam fokus bergerak ${bacaKorelasi(tidurFokus)}`,
      isi:
        tidurFokus > 0
          ? `r = ${tidurFokus.toFixed(2)}. Datamu sendiri menunjukkan malam yang cukup berbuah hari yang produktif. Ini bukan teori dari internet, ini catatanmu.`
          : `r = ${tidurFokus.toFixed(2)}. Jam fokus justru naik saat tidurmu pendek, pola khas begadang mengejar deadline. Enak sekarang, mahal nanti.`,
      nada: tidurFokus > 0 ? 'baik' : 'awas',
    });
  }

  const tidurMood = korelasi(
    deret.filter(d => d.tidur != null && d.mood != null).map(d => [d.tidur as number, d.mood as number] as [number, number]),
  );
  if (tidurMood != null && Math.abs(tidurMood) >= 0.35) {
    out.push({
      judul: `Tidur dan mood bergerak ${bacaKorelasi(tidurMood)}`,
      isi: `r = ${tidurMood.toFixed(2)} dari ${deret.filter(d => d.tidur != null && d.mood != null).length} hari tercatat.`,
      nada: tidurMood > 0 ? 'netral' : 'awas',
    });
  }

  /* 5. Jam fokus pekan ini dibanding pekan lalu. */
  const akhirPekanLalu = ymd(addDays(parseYmd(seninIni), -1));
  const fokusIni = totalFokus(s, seninIni, sampai);
  const fokusLalu = totalFokus(s, seninLalu, akhirPekanLalu);
  if (fokusIni > 0 || fokusLalu > 0) {
    const selisih = fokusIni - fokusLalu;
    out.push({
      judul: `Fokus pekan ini ${jam(fokusIni)}`,
      isi:
        fokusLalu > 0
          ? `Pekan lalu ${jam(fokusLalu)}. ${selisih >= 0 ? `Naik ${jam(Math.abs(selisih))}.` : `Turun ${jam(Math.abs(selisih))}.`}`
          : 'Belum ada pekan pembanding untuk jam fokus.',
      nada: fokusLalu > 0 && selisih < 0 ? 'awas' : 'baik',
    });
  }

  /* 6. Kelengkapan jurnal. */
  const terisi = hariTerakhir(sampai, 14).filter(t => jurnalTerisi(catatan(s, t))).length;
  if (terisi > 0) {
    out.push({
      judul: `Jurnal terisi ${terisi} dari 14 hari terakhir`,
      isi:
        terisi >= 11
          ? 'Cukup rapat untuk dipakai sebagai bahan tinjauan. Semua korelasi di atas berdiri di atas catatan ini.'
          : 'Semakin jarang diisi, semakin lemah semua angka di halaman ini. Mengisi mood dan jam tidur saja sudah cukup untuk membuat grafiknya berarti.',
      nada: terisi >= 11 ? 'baik' : 'netral',
    });
  }

  return out;
}
