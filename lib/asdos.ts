/* ==========================================================================
   Bahan halaman asisten dosen, Aljabar Linear Kelas Internasional.

   Isi di bawah ini adalah TEMPLATE silabus aljabar linear pada umumnya,
   bukan salinan silabus kelas yang kamu asisteni. Sengaja begitu supaya
   tidak ada informasi yang dikarang. Sesuaikan begitu silabus resminya
   keluar; semua centang dan catatan tersimpan di browser.
   ========================================================================== */

export const KELAS = {
  nama: 'Aljabar Linear',
  kelas: 'Kelas Internasional',
  peran: 'Asisten Dosen',
  accent: '#8297f0',
  accentOn: '#ffffff',
};

/** Kolom isian bebas. Nilainya diketik sendiri dan disimpan lokal. */
export const ISIAN: { key: string; label: string; hint: string }[] = [
  { key: 'dosen', label: 'Dosen pengampu', hint: 'Nama dosen yang kamu dampingi' },
  { key: 'jadwal', label: 'Jadwal asistensi', hint: 'Hari dan jam sesi asistensi' },
  { key: 'ruang', label: 'Ruang / tautan', hint: 'Ruang kelas atau tautan daring' },
  { key: 'jumlah', label: 'Jumlah mahasiswa', hint: 'Perkiraan peserta kelas' },
  { key: 'koordinator', label: 'Koordinator asdos', hint: 'Kontak yang dihubungi kalau ada kendala' },
  { key: 'kanal', label: 'Kanal komunikasi', hint: 'Grup WhatsApp, Discord, atau forum SCeLE' },
];

export interface TopikKelompok {
  judul: string;
  topik: string[];
}

/** Kerangka materi aljabar linear yang lazim dipakai satu semester. */
export const SILABUS: TopikKelompok[] = [
  {
    judul: 'Fondasi',
    topik: [
      'Sistem persamaan linear dan bentuk matriks augmented',
      'Eliminasi Gauss dan Gauss-Jordan, bentuk eselon baris',
      'Operasi matriks: penjumlahan, perkalian, transpose',
      'Matriks invers dan syarat keterbalikan',
      'Matriks elementer dan faktorisasi LU',
    ],
  },
  {
    judul: 'Determinan',
    topik: [
      'Definisi determinan dan ekspansi kofaktor',
      'Sifat determinan terhadap operasi baris',
      'Adjoin, invers lewat determinan, aturan Cramer',
    ],
  },
  {
    judul: 'Ruang vektor',
    topik: [
      'Ruang vektor dan subruang',
      'Kombinasi linear, rentang (span), kebebasan linear',
      'Basis dan dimensi',
      'Ruang baris, ruang kolom, ruang null',
      'Rank, nulitas, dan teorema rank-nulitas',
      'Koordinat dan perubahan basis',
    ],
  },
  {
    judul: 'Ortogonalitas',
    topik: [
      'Hasil kali dalam, norma, sudut antar vektor',
      'Himpunan ortogonal dan ortonormal',
      'Proyeksi ortogonal dan komplemen ortogonal',
      'Proses Gram-Schmidt dan dekomposisi QR',
      'Kuadrat terkecil (least squares)',
    ],
  },
  {
    judul: 'Transformasi & eigen',
    topik: [
      'Transformasi linear dan matriks representasinya',
      'Kernel, jangkauan, isomorfisme',
      'Nilai eigen, vektor eigen, polinomial karakteristik',
      'Diagonalisasi dan syaratnya',
      'Diagonalisasi ortogonal untuk matriks simetrik',
      'Pengantar SVD dan penerapannya',
    ],
  },
];

/** Tugas rutin yang melekat pada peran asdos, dipakai sebagai saran awal. */
export const TUGAS_RUTIN = [
  'Siapkan bahan dan contoh soal sebelum sesi asistensi',
  'Koreksi tugas lalu unggah nilainya',
  'Rekap kehadiran peserta',
  'Balas pertanyaan di kanal kelas',
  'Konsultasi ke dosen pengampu untuk materi yang ambigu',
  'Siapkan soal latihan tambahan menjelang ujian',
  'Kumpulkan pertanyaan yang paling sering muncul',
];

/** Hal yang biasanya paling sering ditanyakan mahasiswa di kelas ini. */
export const SERING_DITANYA = [
  {
    t: 'Kenapa hasil eliminasi saya beda dengan teman?',
    d: 'Bentuk eselon baris tidak tunggal, tetapi bentuk eselon baris tereduksi tunggal. Tunjukkan keduanya sah selama himpunan solusinya sama.',
  },
  {
    t: 'Bedanya rentang (span) dan basis apa?',
    d: 'Rentang boleh berlebihan, basis harus minimal. Contoh cepat: tiga vektor di R2 bisa merentang, tapi tidak mungkin jadi basis.',
  },
  {
    t: 'Kapan sebuah matriks bisa didiagonalisasi?',
    d: 'Saat multiplisitas geometrik tiap nilai eigen sama dengan multiplisitas aljabarnya. Siapkan satu contoh yang gagal supaya kontras.',
  },
  {
    t: 'Determinan nol artinya apa?',
    d: 'Matriks singular: tidak punya invers, kolomnya bergantung linear, dan transformasinya meruntuhkan dimensi.',
  },
  {
    t: 'Gram-Schmidt untuk apa sih?',
    d: 'Mengubah basis apa pun jadi ortonormal supaya proyeksi dan kuadrat terkecil jadi mudah dihitung.',
  },
];
