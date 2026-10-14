/* ==========================================================================
   Bentuk data satu mata kuliah. Semua isinya diturunkan dari BRP.
   ========================================================================== */

/** 1 = Senin … 6 = Sabtu */
export type Day = 1 | 2 | 3 | 4 | 5 | 6;

export interface Session {
  day: Day;
  from: string;
  to: string;
  room: string;
  kind: 'Kelas' | 'Lab' | 'Asistensi';
}

export interface MetaItem {
  k: string;
  v: string;
}

export interface Book {
  t: string;
  by: string;
}

export interface GradeComponent {
  name: string;
  weight: number;
  freq?: string;
  /** Skor minimum yang disyaratkan BRP (mis. "0,3") */
  min?: string;
  note?: string;
}

export interface GradeScale {
  g: string;
  min: number;
}

export interface Grading {
  total: string;
  components: GradeComponent[];
  scale: GradeScale[];
  notes?: string[];
}

export interface WeekPlan {
  n: number;
  /** Penomoran khas matkul, mis. "Minggu 8" OS yang jatuh di pekan kalender ke-10 */
  label?: string;
  dot?: string;
  title: string;
  points?: string[];
  tasks?: string[];
  flag?: 'exam';
}

export interface RubricLevel {
  p: string;
  d: string;
}

export interface RubricCriterion {
  name: string;
  levels: RubricLevel[];
}

export interface Rubric {
  title: string;
  note?: string;
  extra?: string;
  criteria: RubricCriterion[];
}

/** d = bobot kesulitan: 1 ringan · 2 sedang · 3 berat */
export interface Topic {
  id: string;
  t: string;
  w: number;
  wl?: string;
  d: 1 | 2 | 3;
  sum: string;
  why?: string;
  keys?: string[];
  probes?: string[];
}

export interface StrategyItem {
  t: string;
  d: string;
}

export type ResourceKind = 'web' | 'yt' | 'tool' | 'book' | 'pdf';

export interface Resource {
  type: ResourceKind;
  t: string;
  /** Kosong untuk buku cetak yang tidak punya tautan. */
  url: string;
  by?: string;
  note?: string;
}

/** Identitas matkul. Ringan, aman dibawa ke komponen klien. */
export interface CourseMeta {
  id: string;
  short: string;
  kelas: string;
  name: string;
  code: string;
  sks: number;
  /** Warna blok matkul. Aman dibaca sebagai teks di atas kertas krem. */
  accent: string;
  /** Warna teks ketika `accent` dipakai sebagai latar. */
  accentOn: string;
  /** Latar pucat untuk chip & sorotan. */
  pale: string;
  /** Matkul yang nilainya sedang dikejar; ditaruh paling depan & diberi tanda. */
  fokus?: boolean;
  /** Gambar kartu orbit (rasio 1.4:1.9) di /public. Kosong = kartu digambar otomatis dengan logo BEM. */
  cover?: string;
  icon: string;
  dosen: string;
  sessions: Session[];
  tagline: string;
  desc: string;
}

/** Isi BRP. Berat, hanya dibaca di server. */
export interface CourseContent {
  meta: MetaItem[];
  books: Book[];
  grading: Grading;
  weeks: WeekPlan[];
  rubrics?: Rubric[];
  topics: Topic[];
  traps?: string[];
  strategy: StrategyItem[];
  resources: Resource[];
}

export interface Course extends CourseMeta, CourseContent {}
