/* ==========================================================================
   Keuangan pribadi: arus kas dan investasi.

   Semua angka disimpan sebagai bilangan bulat rupiah, bukan pecahan. Nilai
   uang tidak pernah dipakai dalam aritmetika desimal supaya tidak muncul
   selisih satu rupiah gara-gara pembulatan floating point.
   ========================================================================== */

export type ArusKas = 'masuk' | 'keluar';

export interface Transaksi {
  id: string;
  /** YYYY-MM-DD */
  tanggal: string;
  jenis: ArusKas;
  kategori: string;
  /** Rupiah, selalu positif. Arahnya ditentukan `jenis`. */
  jumlah: number;
  catatan: string;
  /** Nama toko / pengirim, terutama dari hasil scan struk. */
  merchant?: string | null;
  /** Path foto struk di bucket Supabase "struk". */
  struk?: string | null;
  sumber?: 'manual' | 'struk' | 'impor';
}

/** Batas belanja per bulan. 0 = tidak dibatasi. */
export interface Anggaran {
  bulanan: number;
  kategori: Record<string, number>;
}

export const ANGGARAN_KOSONG: Anggaran = { bulanan: 0, kategori: {} };

export interface Investasi {
  id: string;
  nama: string;
  jenis: string;
  /** Total uang yang sudah disetor. */
  modal: number;
  /** Nilai terakhir yang kamu lihat di aplikasi investasimu. */
  nilai: number;
  /** YYYY-MM-DD, kapan `nilai` terakhir diperbarui. */
  diperbarui: string;
  catatan: string;
}

/* Kategori disesuaikan dengan pola pengeluaran mahasiswa, bukan pekerja
   kantoran. Boleh ditambah sendiri lewat kolom isian. */
export const KATEGORI_MASUK = [
  'Uang saku',
  'Beasiswa',
  'Honor asisten dosen',
  'Freelance',
  'Hadiah',
  'Penjualan barang',
  'Lainnya',
];

export const KATEGORI_KELUAR = [
  'Makan',
  'Transportasi',
  'Kos & listrik',
  'Kuota & internet',
  'Kuliah & buku',
  'Kesehatan',
  'Hiburan',
  'Belanja',
  'Investasi',
  'Lainnya',
];

export const JENIS_INVESTASI = [
  'Reksa dana pasar uang',
  'Reksa dana saham',
  'Saham',
  'Emas',
  'Deposito',
  'Obligasi / SBN',
  'Lainnya',
];

/* --------------------------------------------------------------- format */

/** 125000 -> "Rp125.000" */
export function rupiah(n: number): string {
  const bulat = Math.round(n || 0);
  const tanda = bulat < 0 ? '-' : '';
  return `${tanda}Rp${Math.abs(bulat).toLocaleString('id-ID')}`;
}

/** 1250000 -> "1,3 jt" untuk ubin statistik yang sempit. */
export function rupiahRingkas(n: number): string {
  const b = Math.round(n || 0);
  const a = Math.abs(b);
  const tanda = b < 0 ? '-' : '';
  if (a >= 1_000_000_000) return `${tanda}${(a / 1_000_000_000).toFixed(1).replace('.', ',')} M`;
  if (a >= 1_000_000) return `${tanda}${(a / 1_000_000).toFixed(1).replace('.', ',')} jt`;
  if (a >= 1_000) return `${tanda}${Math.round(a / 1_000)} rb`;
  return `${tanda}${a}`;
}

/**
 * "1.250.000" atau "1250000" -> 1250000. Semua yang bukan digit dibuang, jadi
 * titik, koma, spasi, bahkan "Rp" yang ikut tersalin tidak merusak hasilnya.
 * Dibatasi seribu miliar supaya salah ketik nol beruntun tidak merusak skala
 * grafik.
 */
export function bacaRupiah(teks: string): number {
  const bersih = String(teks || '').replace(/[^\d]/g, '');
  if (!bersih) return 0;
  return Math.min(parseInt(bersih, 10), 1_000_000_000_000);
}

/** YYYY-MM-DD -> YYYY-MM */
export const bulanDari = (tanggal: string): string => String(tanggal || '').slice(0, 7);

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

/** "2026-09" -> "September 2026" */
export function namaBulan(bulan: string): string {
  const [th, bl] = String(bulan || '').split('-').map(Number);
  if (!th || !bl) return bulan;
  return `${NAMA_BULAN[bl - 1]} ${th}`;
}

/* ------------------------------------------------------------ hitungan */

export interface RingkasanBulan {
  masuk: number;
  keluar: number;
  selisih: number;
  jumlahTransaksi: number;
}

export function ringkasBulan(transaksi: Transaksi[], bulan: string): RingkasanBulan {
  let masuk = 0;
  let keluar = 0;
  let jumlahTransaksi = 0;
  for (const t of transaksi) {
    if (bulanDari(t.tanggal) !== bulan) continue;
    jumlahTransaksi++;
    if (t.jenis === 'masuk') masuk += t.jumlah;
    else keluar += t.jumlah;
  }
  return { masuk, keluar, selisih: masuk - keluar, jumlahTransaksi };
}

/** Saldo kas dari seluruh transaksi, tanpa batas bulan. */
export function saldoKas(transaksi: Transaksi[]): number {
  return transaksi.reduce((a, t) => a + (t.jenis === 'masuk' ? t.jumlah : -t.jumlah), 0);
}

export interface BarisKategori {
  kategori: string;
  jumlah: number;
  rasio: number;
}

/** Pengeluaran per kategori dalam satu bulan, urut dari yang terbesar. */
export function perKategori(transaksi: Transaksi[], bulan: string, jenis: ArusKas): BarisKategori[] {
  const peta = new Map<string, number>();
  let total = 0;
  for (const t of transaksi) {
    if (t.jenis !== jenis || bulanDari(t.tanggal) !== bulan) continue;
    peta.set(t.kategori, (peta.get(t.kategori) || 0) + t.jumlah);
    total += t.jumlah;
  }
  return [...peta.entries()]
    .map(([kategori, jumlah]) => ({ kategori, jumlah, rasio: total ? jumlah / total : 0 }))
    .sort((a, b) => b.jumlah - a.jumlah);
}

/** Daftar bulan yang punya transaksi, terbaru dulu. */
export function bulanTersedia(transaksi: Transaksi[]): string[] {
  return [...new Set(transaksi.map(t => bulanDari(t.tanggal)).filter(Boolean))].sort().reverse();
}

export interface RingkasanInvestasi {
  modal: number;
  nilai: number;
  selisih: number;
  /** Imbal hasil dalam persen. null kalau belum ada modal sama sekali. */
  imbalHasil: number | null;
}

export function ringkasInvestasi(investasi: Investasi[]): RingkasanInvestasi {
  const modal = investasi.reduce((a, x) => a + x.modal, 0);
  const nilai = investasi.reduce((a, x) => a + x.nilai, 0);
  return {
    modal,
    nilai,
    selisih: nilai - modal,
    imbalHasil: modal > 0 ? ((nilai - modal) / modal) * 100 : null,
  };
}

/* ------------------------------------------------------- riwayat bulanan */

/** "2026-09" digeser n bulan (boleh negatif). */
export function geserBulan(bulan: string, n: number): string {
  const [th, bl] = bulan.split('-').map(Number);
  const total = th * 12 + (bl - 1) + n;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
}

export interface TitikBulan {
  bulan: string;
  /** Label sumbu, mis. "Sep". */
  label: string;
  masuk: number;
  keluar: number;
  selisih: number;
  /** Saldo kumulatif sampai akhir bulan ini, termasuk transaksi sebelum rentang. */
  saldo: number;
}

const LABEL_BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/**
 * Deret bulan berurutan yang berakhir di `sampai`, termasuk bulan tanpa
 * transaksi supaya sumbu waktunya tidak bolong.
 */
export function riwayatBulanan(transaksi: Transaksi[], sampai: string, jumlahBulan = 6): TitikBulan[] {
  const mulai = geserBulan(sampai, -(jumlahBulan - 1));

  /* Saldo awal: seluruh transaksi sebelum bulan pertama pada rentang. */
  let saldo = transaksi
    .filter(t => bulanDari(t.tanggal) < mulai)
    .reduce((a, t) => a + (t.jenis === 'masuk' ? t.jumlah : -t.jumlah), 0);

  const out: TitikBulan[] = [];
  for (let i = 0; i < jumlahBulan; i++) {
    const bulan = geserBulan(mulai, i);
    const r = ringkasBulan(transaksi, bulan);
    saldo += r.selisih;
    out.push({
      bulan,
      label: LABEL_BULAN[Number(bulan.split('-')[1]) - 1],
      masuk: r.masuk,
      keluar: r.keluar,
      selisih: r.selisih,
      saldo,
    });
  }
  return out;
}

/**
 * Rata-rata pengeluaran, hanya dari bulan yang benar-benar ada belanjanya.
 * Bulan kosong sengaja tidak ikut dibagi: kalau ikut, rata-ratanya jatuh dan
 * daya tahan saldo terlihat jauh lebih lama daripada kenyataannya.
 */
export function rataPengeluaran(riwayat: TitikBulan[]): number {
  const aktif = riwayat.filter(t => t.keluar > 0);
  if (!aktif.length) return 0;
  return aktif.reduce((a, t) => a + t.keluar, 0) / aktif.length;
}

/**
 * Berapa bulan saldo sekarang sanggup menutup pengeluaran rata-rata.
 * null kalau belum ada pola pengeluaran untuk dibagi.
 */
export function runwayBulan(saldo: number, rataKeluar: number): number | null {
  if (rataKeluar <= 0) return null;
  return saldo / rataKeluar;
}

export type StatusRasio = 'aman' | 'ketat' | 'defisit';

export interface Rasio {
  /** Pengeluaran dibagi pemasukan, dalam persen. null kalau belum ada pemasukan. */
  persen: number | null;
  status: StatusRasio;
  label: string;
}

/** Seberapa besar porsi pemasukan yang habis terpakai bulan itu. */
/* Ambang 80% bukan aturan baku, cuma titik yang masuk akal untuk mahasiswa:
   di atas itu sisa untuk ditabung tinggal seperlima pemasukan. Ubah sesukamu. */
export function rasioBelanja(masuk: number, keluar: number): Rasio {
  if (masuk <= 0) {
    return { persen: null, status: 'aman', label: 'Belum ada pemasukan bulan ini' };
  }
  const persen = (keluar / masuk) * 100;
  if (persen > 100) return { persen, status: 'defisit', label: 'Lewat batas, belanja melebihi pemasukan' };
  if (persen > 80) return { persen, status: 'ketat', label: 'Ketat, sisa untuk ditabung tipis' };
  return { persen, status: 'aman', label: 'Aman, masih ada yang bisa disisihkan' };
}
