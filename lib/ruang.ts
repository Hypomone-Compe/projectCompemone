/* ==========================================================================
   Tempat-tempat di ruang fokus 3D. Baru Starfield Library yang siap; sisanya
   didaftar supaya pemilih tempat sudah berbentuk dan tinggal diisi adegannya.
   ========================================================================== */

export interface Tempat {
  id: string;
  nama: string;
  lokasi: string;
  ket: string;
  siap: boolean;
}

export const TEMPAT: Tempat[] = [
  {
    id: 'starfield',
    nama: 'Starfield Library',
    lokasi: 'COEX, Seoul',
    ket: 'Rak buku 13 meter, lampu hangat, langit malam di balik atap kaca.',
    siap: true,
  },
  {
    id: 'gunung',
    nama: 'Puncak gunung',
    lokasi: 'Segera hadir',
    ket: 'Meja kayu di atas lautan awan, matahari terbit pelan-pelan.',
    siap: false,
  },
  {
    id: 'kampus',
    nama: 'Perpustakaan kampus',
    lokasi: 'Segera hadir',
    ket: 'Ruang baca yang sunyi, deretan meja dan jendela besar.',
    siap: false,
  },
];

export const tempatDari = (id: string | null | undefined) => TEMPAT.find(t => t.id === id && t.siap) ?? TEMPAT[0];
