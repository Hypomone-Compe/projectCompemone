/* ==========================================================================
   Sapaan pembuka.

   Ditulis sendiri untuk konteks satu orang ini, bukan kutipan tokoh, supaya
   tidak ada atribusi yang dikarang. Nadanya sengaja tenang dan berbasis
   tindakan, bukan yel-yel.
   ========================================================================== */

export interface Quote {
  t: string;
  /** Baris kedua, ditulis dengan serif miring di kartu sapaan. */
  s: string;
}

export const QUOTES: Quote[] = [
  { t: 'IP 4 itu bukan satu lompatan besar.', s: 'Itu 16 minggu yang tidak dilewatkan.' },
  { t: 'Yang membedakan A dan B bukan bakat.', s: 'Tapi siapa yang membuka rubriknya sebelum submit.' },
  { t: '3,39 sudah lewat.', s: 'Yang bisa kamu ubah cuma minggu ini.' },
  { t: 'Nilai terbesar hari ini ada di hal yang paling membosankan.', s: 'Tutorial, checkpoint, dan absen.' },
  { t: 'Kalau belum bisa menjelaskannya sederhana,', s: 'kamu belum memilikinya.' },
  { t: 'Satu jam hari ini lebih murah', s: 'daripada satu malam sebelum ujian.' },
  { t: 'Tidak ada yang menuntutmu sempurna.', s: 'Yang dituntut cuma tidak ada yang nol.' },
  { t: 'Deadline tidak pernah datang mendadak.', s: 'Yang mendadak cuma perhatian kita.' },
  { t: 'Kerjakan yang paling kamu hindari lebih dulu.', s: 'Sisanya akan terasa ringan.' },
  { t: 'Hadir itu setengah nilai partisipasi.', s: 'Bicara sekali itu setengahnya lagi.' },
  { t: 'Kamu tidak perlu paham semuanya hari ini.', s: 'Cukup satu topik, sampai benar-benar paham.' },
  { t: 'Yang dicatat akan dikerjakan.', s: 'Yang diingat-ingat saja akan terlewat.' },
  { t: 'Setiap tugas yang dikumpulkan tepat waktu', s: 'adalah poin yang tidak perlu direbut lagi.' },
  { t: 'Berhenti membandingkan diri dengan angkatan.', s: 'Bandingkan dengan dirimu minggu lalu.' },
  { t: 'Lelah itu wajar. Berhenti itu pilihan.', s: 'Istirahat, lalu lanjutkan besok pagi.' },
  { t: 'Semester ini tidak butuh keajaiban.', s: 'Cuma butuh kamu yang muncul setiap minggu.' },
];

/** Kutipan yang sama sepanjang satu hari, berganti keesokan harinya. */
export function quoteForDate(ymd: string): Quote {
  let h = 0;
  for (let i = 0; i < ymd.length; i++) h = (h * 31 + ymd.charCodeAt(i)) >>> 0;
  return QUOTES[h % QUOTES.length];
}
