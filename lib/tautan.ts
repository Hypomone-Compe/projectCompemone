/* Tautan luar yang paling sering dibuka bersama situs ini.

   Ditaruh di modul biasa, bukan di dalam komponen 'use client': nilai yang
   diekspor dari modul klien berubah jadi rujukan saat diimpor server
   component, sehingga .map() di sana gagal saat render. */
export interface TautanLuar {
  label: string;
  url: string;
  ket: string;
}

export const TAUTAN_LUAR: TautanLuar[] = [
  { label: 'SCeLE', url: 'https://scele.cs.ui.ac.id/', ket: 'Kelas & tugas' },
  { label: 'SLCM', url: 'https://slcm.ui.ac.id/', ket: 'Nilai & KRS' },
  {
    label: 'Cosmic',
    url: 'https://drive.google.com/drive/folders/1eIYDnF_ovpexBre9AkoOlJQoaiZWhfp7',
    ket: 'Arsip materi',
  },
  { label: 'NotebookLM', url: 'https://notebooklm.google.com/', ket: 'Tanya jawab materi' },
];
