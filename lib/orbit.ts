/* ==========================================================================
   Isi orbit beranda: lima matkul + halaman + tautan luar.

   Tiap item muncul SEKALI; hanya matkul prioritas (SDA, PBP,
   Basdat, sesuai urutan) yang boleh muncul dua kali untuk mengisi slot sisa. Dulu 20
   kartu diisi 5 matkul, jadi tiap matkul berulang empat kali.
   ========================================================================== */
import type { ItemOrbit } from './kartu';
import type { KartuMatkul } from './ringkasan-matkul';
import { TAUTAN_LUAR } from './tautan';

const WARNA_LUAR: Record<string, string> = {
  SCeLE: '#f08a4b',
  SLCM: '#4fc3c3',
  Cosmic: '#b48cff',
  NotebookLM: '#dfe3ff',
};

export function itemOrbit(matkul: KartuMatkul[]): ItemOrbit[] {
  const m: ItemOrbit[] = matkul.map((c, i) => ({
    id: `matkul-${c.id}`,
    jenis: 'matkul',
    judul: c.short.toUpperCase(),
    sub: c.name,
    warna: c.accent,
    info: c.mingguKe ? `Minggu ${c.mingguKe} · ${c.deadlineMingguIni ? `${c.deadlineMingguIni} agenda dinilai` : 'tanpa deadline'}` : c.code.split(' / ')[0],
    pita: `Kelas ${c.kelas} · ${c.sks} SKS`,
    fokus: c.fokus,
    cover: c.cover || undefined,
    matkul: i,
  }));

  const halaman: ItemOrbit[] = [
    { id: 'keuangan', jenis: 'halaman', judul: 'KEUANGAN', sub: 'Arus kas, anggaran, investasi', warna: '#2fae74', info: 'Catat & pantau uang', pita: 'Halaman', href: '/keuangan' },
    { id: 'scan', jenis: 'halaman', judul: 'SCAN', sub: 'Foto struk jadi transaksi', warna: '#e8628a', info: 'OCR struk', pita: 'Aksi cepat', href: '/keuangan?scan=1' },
    { id: 'fokus', jenis: 'halaman', judul: 'FOKUS', sub: 'Belajar bareng di Starfield Library', warna: '#f2c46b', info: 'Ruang fokus 3D', pita: 'Halaman', href: '/fokus' },
    { id: 'harian', jenis: 'halaman', judul: 'HARIAN', sub: 'Kebiasaan, jurnal, jam fokus', warna: '#8297f0', info: 'Isi tiap hari', pita: 'Halaman', href: '/harian' },
    { id: 'asdos', jenis: 'halaman', judul: 'ASDOS', sub: 'Aljabar Linear Kelas Internasional', warna: '#5fc4d9', info: 'Sesi, materi, tugas', pita: 'Halaman', href: '/asdos' },
  ];

  const luar: ItemOrbit[] = TAUTAN_LUAR.map(t => ({
    id: `luar-${t.label.toLowerCase()}`,
    jenis: 'luar',
    judul: t.label.length > 8 ? t.label : t.label.toUpperCase(),
    sub: t.ket,
    warna: WARNA_LUAR[t.label] || '#9cb3d3',
    info: t.url.replace(/^https?:\/\//, '').split('/')[0],
    pita: 'Tautan luar',
    href: t.url,
  }));

  return [...m, ...halaman, ...luar];
}

/** Item yang boleh tampil dua kali bila slot orbit lebih banyak dari item. */
export const ITEM_GANDA = ['matkul-sda', 'matkul-pbp', 'matkul-basdat'];
