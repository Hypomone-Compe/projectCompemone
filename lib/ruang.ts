/* ==========================================================================
   Tempat-tempat di ruang fokus 3D. Tempat yang belum `siap` tetap didaftar
   supaya pemilih tempat sudah berbentuk dan tinggal diisi adegannya.
   ========================================================================== */

export interface Tempat {
  id: string;
  nama: string;
  lokasi: string;
  ket: string;
  siap: boolean;
  /** Gaya musik jazz yang diputar. */
  musik: 'perpus' | 'gunung';
  /** Teks layar muat. */
  muat: string;
  /** Warna latar sebelum adegan tampil. */
  latar: string;
}

export const TEMPAT: Tempat[] = [
  {
    id: 'starfield',
    nama: 'Starfield Library',
    lokasi: 'COEX, Seoul',
    ket: 'Rak buku 13 meter, lampu hangat, langit malam di balik atap kaca.',
    siap: true,
    musik: 'perpus',
    muat: 'Menata rak buku Starfield Library…',
    latar: '#0d0a0c',
  },
  {
    id: 'ranukumbolo',
    nama: 'Ranu Kumbolo',
    lokasi: 'Semeru, 2.400 mdpl',
    ket: 'Dermaga kayu di tepi danau, matahari terbit di celah dua bukit, kabut pagi.',
    siap: true,
    musik: 'gunung',
    muat: 'Mendirikan tenda di Ranu Kumbolo…',
    latar: '#2a2a33',
  },
  {
    id: 'kampus',
    nama: 'Perpustakaan kampus',
    lokasi: 'Segera hadir',
    ket: 'Ruang baca yang sunyi, deretan meja dan jendela besar.',
    siap: false,
    musik: 'perpus',
    muat: 'Membuka perpustakaan…',
    latar: '#0d0a0c',
  },
];

export const tempatDari = (id: string | null | undefined) => TEMPAT.find(t => t.id === id && t.siap) ?? TEMPAT[0];
