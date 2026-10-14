/* ==========================================================================
   Hitungan tanggal semester. Sengaja TIDAK mengimpor data mata kuliah.

   Komponen klien (kotak minggu, sapaan, papan asdos) cuma butuh bagian ini.
   Kalau modul ini ikut menarik lib/courses, seluruh isi BRP kelima matkul
   ikut terbundel ke JavaScript yang diunduh peramban, padahal isinya hanya
   dipakai di server.
   ========================================================================== */

/* Senin pertama semester. Ditegaskan sendiri oleh pemilik situs: kuliah
   dimulai Senin 24 Agustus 2026, bukan tanggal perkiraan dari file .ics yang
   dipakai sebelumnya. Ubah satu baris ini kalau kalender akademik bergeser,
   seluruh kotak minggu dan pemetaan BRP ikut menyesuaikan sendiri. */
export const SEMESTER_START = '2026-08-24';
/* 17 minggu: kuliah 14 minggu + dua pekan UTS dan pekan UAS yang menurut
   jadwal resmi berakhir 19 Desember 2026. */
export const TOTAL_WEEKS = 17;
export const TZ = 'Asia/Jakarta';

/* Tanggal ujian dari jadwal resmi, bukan lagi perkiraan:
   · Schedule PBP Gasal 26/27 menaruh UTS di 12 sampai 23 Oktober dan
     UAS di 10 sampai 19 Desember;
   · BRP StatProb menyebut UTS 12/14/15 lalu 19/21/22 Oktober, dan
     UAS 10/14/16/17 Desember.
   Keduanya cocok, jadi masing-masing membentang dua pekan kalender. */
export const EXAM_RANGES = [
  { label: 'UTS', from: '2026-10-12', to: '2026-10-23' },
  { label: 'UAS', from: '2026-12-10', to: '2026-12-19' },
];

export const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const DAY_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

/* ----------------------------------------------------------- tanggal */
export const parseYmd = (s: string): Date => {
  const [y, m, d] = String(s).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

export const ymd = (d: Date): string =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;

export const addDays = (d: Date, n: number): Date => new Date(d.getTime() + n * 86400000);

/** Tanggal hari ini menurut jam Asia/Jakarta, sebagai 'YYYY-MM-DD'. */
export function todayYmd(now: Date = new Date()): string {
  /* en-CA sudah menghasilkan format YYYY-MM-DD. */
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** Senin dari minggu yang memuat tanggal tsb. */
export function mondayOf(dateYmd: string): string {
  const d = parseYmd(dateYmd);
  const dow = (d.getUTCDay() + 6) % 7; // 0 = Senin
  return ymd(addDays(d, -dow));
}

export function diffDays(aYmd: string, bYmd: string): number {
  return Math.round((parseYmd(aYmd).getTime() - parseYmd(bYmd).getTime()) / 86400000);
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTH_LONG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function fmtDate(s: string): string {
  const d = parseYmd(s);
  return `${d.getUTCDate()} ${MONTH_SHORT[d.getUTCMonth()]}`;
}

export function fmtDateLong(s: string): string {
  const d = parseYmd(s);
  return `${DAY_NAMES[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTH_LONG[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function fmtRange(a: string, b: string): string {
  const s = parseYmd(a);
  const e = parseYmd(b);
  const sm = MONTH_SHORT[s.getUTCMonth()];
  const em = MONTH_SHORT[e.getUTCMonth()];
  return sm === em
    ? `${s.getUTCDate()}–${e.getUTCDate()} ${em} ${e.getUTCFullYear()}`
    : `${s.getUTCDate()} ${sm} – ${e.getUTCDate()} ${em} ${e.getUTCFullYear()}`;
}

/* --------------------------------------------------- indeks minggu */
export function weekStartYmd(i: number): string {
  return ymd(addDays(parseYmd(SEMESTER_START), i * 7));
}

/** Indeks minggu (0-based); bisa negatif atau ≥ TOTAL_WEEKS. */
export function weekIndexOf(dateYmd: string): number {
  return Math.floor(diffDays(mondayOf(dateYmd), SEMESTER_START) / 7);
}

/* --------------------------------------------------- fase semester */
/* Ikut pindah ke sini karena isinya murni hitungan tanggal. Halaman login
   memakainya di sisi klien untuk hitungan mundur yang hidup, dan modul ini
   yang aman diimpor dari sana tanpa menyeret seluruh isi BRP. */
export type SemesterStatus =
  | { phase: 'pre'; daysToStart: number; week: null }
  | { phase: 'run'; week: number; of: number }
  | { phase: 'done'; week: null };

export function semesterStatus(today: string = todayYmd()): SemesterStatus {
  const idx = weekIndexOf(today);
  if (idx < 0) return { phase: 'pre', daysToStart: diffDays(SEMESTER_START, today), week: null };
  if (idx >= TOTAL_WEEKS) return { phase: 'done', week: null };
  return { phase: 'run', week: idx + 1, of: TOTAL_WEEKS };
}
