/* ==========================================================================
   Identitas mata kuliah: nama, kelas, dosen, jadwal, warna.

   Dipisah dari isi BRP karena inilah satu-satunya bagian yang dibutuhkan
   komponen klien (header, indeks, kotak minggu). Isi BRP yang berat tinggal
   di berkas masing-masing dan hanya dibaca di server.
   ========================================================================== */
import type { CourseMeta } from '../types';

const pbp: CourseMeta = {
  id: 'pbp',
  short: 'PBP',
  kelas: 'B',
  name: 'Pemrograman Berbasis Platform',
  code: 'CSGE602022',
  sks: 4,
  accent: '#c0431f',
  accentOn: '#ffffff',
  icon: '📱',
  dosen: 'Iis Afriyanti, S.Kom., M.Sc. · Jessica Naraiswari Arwidarasti, S.Kom., M.Kom.',
  sessions: [
    { day: 1, from: '13:00', to: '14:40', room: 'A6.02 (Ged Baru)', kind: 'Kelas' },
    { day: 3, from: '14:00', to: '15:40', room: 'Lab A1.01+Lab A1.02 - Gabungan (Gd Baru)', kind: 'Lab' },
  ],
  tagline: 'Satu-satunya matkul dengan rubrik penilaian yang dipublikasikan detail per poin. Artinya: kamu bisa mengejar nilai sempurna secara sistematis, tinggal ikuti checklist.',
  desc: 'Melatih pengembangan aplikasi berbasis platform dari sisi server maupun client, memperkenalkan platform Web (Django) dan Mobile (Flutter). Menuntut kemampuan Python, Dart, Java, HTML, CSS, dan JavaScript.',
};

const sda: CourseMeta = {
  id: 'sda',
  short: 'SDA',
  kelas: 'D',
  name: 'Struktur Data & Algoritma',
  code: 'CSGE602040',
  sks: 4,
  accent: '#2b46f0',
  accentOn: '#ffffff',
  icon: '🌳',
  dosen: 'Lintang Matahari Hasani, S.Kom., M.Kom., Ph.D.',
  sessions: [
    { day: 2, from: '15:00', to: '16:40', room: 'A6.07 (Ged Baru)', kind: 'Kelas' },
    { day: 4, from: '10:00', to: '11:40', room: 'A6.07 (Ged Baru)', kind: 'Kelas' },
    { day: 5, from: '14:00', to: '16:00', room: 'Lab.1107/1109, PC 34', kind: 'Lab' },
  ],
  tagline: 'Sesi lab Jumat memegang 32% nilaimu, dan empat di antaranya Lab Kuis yang 70% nilainya dari demo ke asisten. Menang di lab = menang setengah semester.',
  desc: 'Teknik dasar abstraksi struktur data, algoritma akses dan manipulasi struktur tersebut, serta pengantar analisis kompleksitas eksekusi algoritma.',
};

const basdat: CourseMeta = {
  id: 'basdat',
  short: 'Basdat',
  kelas: 'B',
  name: 'Basis Data',
  code: 'CSGE602070 / CSF2600700',
  sks: 4,
  accent: '#12683f',
  accentOn: '#ffffff',
  icon: '🗄️',
  dosen: 'Ilma Alpha Mannix, M.Kom.',
  sessions: [
    { day: 2, from: '13:00', to: '13:50', room: 'Lab A1.03 (Ged Baru)', kind: 'Lab' },
    { day: 3, from: '16:00', to: '17:40', room: 'A2.08 (Ged Baru)', kind: 'Kelas' },
    { day: 5, from: '10:00', to: '11:40', room: 'A2.08 (Ged Baru)', kind: 'Kelas' },
  ],
  tagline: 'Sesi lab Selasa 50 menit menentukan 35% nilaimu: 7 mini quiz dan 6 tutorial lab, tanpa susulan dengan alasan apapun. Datang setiap pekan dalam keadaan siap.',
  desc: 'Konsep dasar manajemen basis data mencakup pemodelan, desain, bahasa, dan implementasi: arsitektur & konsep DBMS, struktur dan organisasi file, indexing, pemodelan data dengan (E)ER, bahasa kueri formal, basis data berorientasi objek, SQL dan QBE, functional dependency, normalisasi, serta algoritma dan proses desain basis data relasional.',
};

const os: CourseMeta = {
  id: 'os',
  short: 'OS',
  kelas: 'B',
  name: 'Sistem Operasi',
  code: 'CSCM602055',
  sks: 4,
  accent: '#b3106c',
  accentOn: '#ffffff',
  icon: '🖥️',
  dosen: 'Muhammad Mishbah, S.Kom., M.Kom.',
  sessions: [
    { day: 1, from: '10:00', to: '11:40', room: 'A1.09 (Ged Baru)', kind: 'Kelas' },
    { day: 3, from: '10:00', to: '11:40', room: 'A1.09 (Ged Baru)', kind: 'Kelas' },
  ],
  tagline: 'Komponen terbesarnya bukan ujian, tapi 4 tugas coding penuh bernilai 36%. Tugas pertamanya dikerjakan berkelompok, jadi cari timmu sebelum Minggu 4.',
  desc: 'Konsep sistem operasi: struktur OS, virtualisasi & shell scripting, bahasa C, proses & thread, sinkronisasi & deadlock, CPU scheduling, main memory, virtual memory, mass storage & I/O, file system, keamanan & proteksi, hingga network & distributed system, dengan praktik langsung di Linux.',
};

const statprob: CourseMeta = {
  id: 'statprob',
  short: 'StatProb',
  kelas: 'C',
  name: 'Statistika & Probabilitas',
  code: 'CSCM602013',
  sks: 3,
  accent: '#7d5f00',
  accentOn: '#ffffff',
  icon: '📊',
  dosen: 'Rahmad Mahendra, Ph.D.',
  sessions: [
    { day: 1, from: '08:00', to: '09:40', room: 'A1.51 (Ged Baru)', kind: 'Kelas' },
    { day: 3, from: '09:00', to: '09:50', room: 'A1.51 (Ged Baru)', kind: 'Kelas' },
    { day: 4, from: '16:00', to: '17:40', room: 'A6.08 (Ged Baru)', kind: 'Asistensi' },
  ],
  tagline: '30% nilaimu dari 6 kuis yang tersebar sepanjang semester, ini matkul yang paling menghukum kebiasaan SKS (Sistem Kebut Semalam).',
  desc: 'Menerapkan konsep probabilitas dan statistik untuk menginterpretasikan data: statistik deskriptif, teknik sampling, probabilitas dasar & bersyarat (Bayes), variabel acak, distribusi statistik sampel (CLT), estimasi parameter, uji hipotesis, dan aplikasi statistika dalam komputasi.',
};

export const META: CourseMeta[] = [pbp, sda, basdat, os, statprob];

export const metaById: Record<string, CourseMeta> = Object.fromEntries(META.map(c => [c.id, c]));

/** Nama lengkap termasuk kelas, mis. "Pemrograman Berbasis Platform C" */
export function fullName(c: CourseMeta): string {
  return c.kelas ? `${c.name} ${c.kelas}` : c.name;
}

/** Label pendek termasuk kelas, mis. "PBP B" */
export function shortName(c: CourseMeta): string {
  return c.kelas ? `${c.short} ${c.kelas}` : c.short;
}

export const TOTAL_SKS = META.reduce((a, c) => a + c.sks, 0);
