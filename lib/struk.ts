/* ==========================================================================
   Struk → transaksi.

   Dua jalur membaca foto struk:
   1. Claude vision lewat /api/struk/ocr (kalau ANTHROPIC_API_KEY di-set):
      paling akurat, paham struk kusut, total vs subtotal, dan tanggal lokal.
   2. Tesseract.js di peramban (selalu tersedia, tanpa kunci apa pun):
      teks mentah lalu ditebak dengan aturan di berkas ini.

   Keduanya berakhir di bentuk yang sama, HasilStruk, yang selalu ditunjukkan
   dulu untuk dikoreksi sebelum disimpan. Tebakan mesin tidak pernah langsung
   masuk ke catatan keuangan tanpa dilihat.
   ========================================================================== */
import { KATEGORI_KELUAR, KATEGORI_MASUK, type ArusKas } from './keuangan';

export interface ItemStruk {
  nama: string;
  jumlah: number;
}

export interface HasilStruk {
  merchant: string | null;
  /** YYYY-MM-DD */
  tanggal: string | null;
  total: number | null;
  jenis: ArusKas;
  kategori: string;
  items: ItemStruk[];
  catatan: string;
  yakin: 'tinggi' | 'sedang' | 'rendah';
  sumber: 'ai' | 'ocr';
}

export const SEMUA_KATEGORI = [...new Set([...KATEGORI_KELUAR, ...KATEGORI_MASUK])];

/* ------------------------------------------------------------ angka */
/** "Rp 45.000" / "45,000" / "45.000,00" / "45000.00" → 45000 */
export function angkaRupiah(s: string): number | null {
  let t = s.replace(/[^\d.,]/g, '');
  if (!t) return null;
  /* Dua digit desimal di ujung (",00" / ".00") dibuang kalau bagian depannya jelas angka ribuan. */
  const dec = t.match(/^(.*\d)[.,](\d{2})$/);
  if (dec && (/[.,]\d{3}$/.test(dec[1]) || dec[1].replace(/[.,]/g, '').length >= 4)) t = dec[1];
  const n = parseInt(t.replace(/[.,]/g, ''), 10);
  return Number.isFinite(n) && n > 0 && n < 100_000_000 ? n : null;
}

const POLA_ANGKA = /(?:rp\.?\s*)?\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?|\d{4,9}(?:[.,]\d{2})?/gi;

function angkaDiBaris(baris: string): number[] {
  return (baris.match(POLA_ANGKA) || []).map(angkaRupiah).filter((n): n is number => n != null);
}

/* ---------------------------------------------------------- tanggal */
const BULAN: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, mei: 5, may: 5, jun: 6, jul: 7, agu: 8, agt: 8, aug: 8,
  sep: 9, okt: 10, oct: 10, nov: 11, des: 12, dec: 12,
};

function ymd(y: number, m: number, d: number): string | null {
  if (y < 100) y += 2000;
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 2020 || y > 2100) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function cariTanggal(teks: string): string | null {
  let m = teks.match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
  if (m) return ymd(+m[1], +m[2], +m[3]);
  m = teks.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})\b/);
  if (m) return ymd(+m[3], +m[2], +m[1]);
  m = teks.match(/\b(\d{1,2})\s*([a-z]{3})[a-z]*\.?\s*(\d{2,4})\b/i);
  if (m && BULAN[m[2].toLowerCase()]) return ymd(+m[3], BULAN[m[2].toLowerCase()], +m[1]);
  return null;
}

/* --------------------------------------------------------- kategori */
const KATA_KATEGORI: [RegExp, string][] = [
  [/indomaret|alfamart|alfamidi|superindo|hypermart|transmart|lawson|family ?mart|circle ?k|minimarket|supermarket|giant|hero\b/i, 'Belanja'],
  [/resto|restoran|warung|warteg|cafe|kafe|coffee|kopi|bakso|mie|ayam|nasi|sate|pizza|burger|mcd|kfc|starbucks|janji jiwa|kenangan|chatime|hokben|solaria|geprek|kantin|food|makan|minum|teh|boba|bakery|roti/i, 'Makan'],
  [/gojek|go-?jek|grab|maxim|krl|commuter|transjakarta|mrt|lrt|parkir|tol\b|spbu|pertamina|shell|bensin|pertalite|pertamax|ojek|taksi|kereta|tiket/i, 'Transportasi'],
  [/apotek|apotik|kimia farma|guardian|century|klinik|dokter|rumah sakit|obat|vitamin/i, 'Kesehatan'],
  [/pulsa|kuota|paket data|telkomsel|indosat|xl\b|axis|smartfren|wifi|indihome|internet/i, 'Kuota & internet'],
  [/fotokopi|fotocopy|print|gramedia|buku|atk|alat tulis|kampus|ukt|kuliah/i, 'Kuliah & buku'],
  [/pln|listrik|token|kos\b|kost|sewa|pdam/i, 'Kos & listrik'],
  [/bioskop|cgv|xxi|cinema|netflix|spotify|game|steam|karaoke/i, 'Hiburan'],
];

const KATA_MASUK = /transfer masuk|dana masuk|uang masuk|terima dana|diterima|kredit\b|cr\b|refund|pengembalian dana|cashback|gaji|honor|beasiswa/i;

export function tebakJenis(teks: string): ArusKas {
  return KATA_MASUK.test(teks) ? 'masuk' : 'keluar';
}

export function tebakKategori(teks: string, jenis: ArusKas): string {
  if (jenis === 'masuk') {
    if (/beasiswa/i.test(teks)) return 'Beasiswa';
    if (/honor|asdos|asisten/i.test(teks)) return 'Honor asisten dosen';
    return 'Lainnya';
  }
  for (const [pola, kat] of KATA_KATEGORI) if (pola.test(teks)) return kat;
  return 'Lainnya';
}

/* ---------------------------------------------- teks OCR → hasil */
const BARIS_TOTAL_KUAT = /grand\s*total|total\s*(bayar|belanja|pembayaran|tagihan|harga)|jumlah\s*(bayar|tagihan)|total\s*:|^\s*total\b/i;
const BARIS_BUKAN_TOTAL = /sub\s*-?\s*total|total\s*(item|qty|jumlah barang|disc|diskon|hemat)|kembali|change|tunai\s*$|ppn|pajak|dpp|poin|point/i;

/** Menebak isi struk dari teks Tesseract. Hasil kasar; layar konfirmasi yang memastikan. */
export function urai(teks: string): HasilStruk {
  const baris = teks
    .split(/\r?\n/)
    .map(b => b.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  let total: number | null = null;
  let yakin: HasilStruk['yakin'] = 'rendah';
  for (const b of baris) {
    if (BARIS_BUKAN_TOTAL.test(b) || !BARIS_TOTAL_KUAT.test(b)) continue;
    const n = angkaDiBaris(b);
    if (n.length) {
      const kandidat = Math.max(...n);
      if (total == null || /grand|bayar/i.test(b) || kandidat > total) {
        total = kandidat;
        yakin = /grand|bayar/i.test(b) ? 'tinggi' : 'sedang';
      }
    }
  }
  if (total == null) {
    const semua = baris.filter(b => !BARIS_BUKAN_TOTAL.test(b)).flatMap(angkaDiBaris);
    if (semua.length) total = Math.max(...semua);
  }

  const merchant =
    baris.find(b => /[a-z]{3,}/i.test(b) && b.length <= 40 && (b.match(/\d/g) || []).length <= 3) || null;

  const jenis = tebakJenis(teks);

  /* Item: baris "nama ... angka" di atas baris total. */
  const items: ItemStruk[] = [];
  for (const b of baris) {
    if (BARIS_TOTAL_KUAT.test(b) || BARIS_BUKAN_TOTAL.test(b)) break;
    const m = b.match(/^([a-z].*?)\s+(?:\d+\s*[x@]\s*[\d.,]+\s+)?((?:\d{1,3}[.,])*\d{3})\s*$/i);
    if (m) {
      const jumlah = angkaRupiah(m[2]);
      if (jumlah && jumlah < (total ?? Infinity)) items.push({ nama: m[1].trim(), jumlah });
    }
  }

  return {
    merchant,
    tanggal: cariTanggal(teks),
    total,
    jenis,
    kategori: tebakKategori(teks, jenis),
    items: items.slice(0, 12),
    catatan: '',
    yakin: total == null ? 'rendah' : yakin,
    sumber: 'ocr',
  };
}
