/* ==========================================================================
   Jadwal penuh semester (gaya time-boxing ala Elon Musk).

   Setiap menit dari bangun sampai tidur punya satu tugas. Blok dibuat
   tegas (satu fokus per blok), komunikasi dibatch dua kali sehari, dan
   istirahat dijadwalkan, bukan "nanti kalau sempat".

   - Hari kerja (Sen–Jum): 05.30 → 23.30, penuh untuk kuliah. Celah di
     antara kelas diisi deep work matkul; malam untuk tugas/lab terdekat
     dan maju materi supaya semua materi tuntas sebelum H-2 pekan UAS.
   - Akhir pekan (Sab–Min): 05.30 → 22.30. ICAIC, side hustle (belajar
     baru & penghasilan), olahraga, podcast, journalling, belajar hal baru
     (periode 3 pekan), Kaggle.
   - H-2 pekan UAS (26 Nov → 9 Des) dan UAS (10 → 19 Des): semua yang di
     luar kuliah dikosongkan; hanya UAS, olahraga singkat, dan jurnal.

   Semester ini fokusnya mengumpulkan ilmu, jadi side hustle penghasilan
   diisi membangun portofolio, bukan mengejar uang dulu.
   ========================================================================== */
import { COURSES } from './courses';
import { sesiIcaicPada, TOPIK_ICAIC } from './icaic';
import { addDays, parseYmd, SEMESTER_START, ymd } from './kalender';

export type KategoriBlok =
  | 'rutinitas'
  | 'olahraga'
  | 'kuliah'
  | 'belajar'
  | 'tugas'
  | 'istirahat'
  | 'batch'
  | 'jurnal'
  | 'icaic'
  | 'side-belajar'
  | 'side-hustle'
  | 'podcast'
  | 'skill'
  | 'kaggle'
  | 'uas'
  | 'tidur';

export interface Blok {
  /** Menit sejak 00.00 WIB. */
  mulai: number;
  selesai: number;
  judul: string;
  detail?: string;
  kategori: KategoriBlok;
  cid?: string;
  lokasi?: string;
}

export const WARNA_KATEGORI: Record<KategoriBlok, string> = {
  rutinitas: '#9aa3c7',
  olahraga: '#2fae74',
  kuliah: '#8297f0',
  belajar: '#e8628a',
  tugas: '#f06a6a',
  istirahat: '#5d6488',
  batch: '#b8a35c',
  jurnal: '#c79bf2',
  icaic: '#f2c46b',
  'side-belajar': '#4fc3c3',
  'side-hustle': '#7bd389',
  podcast: '#f08a4b',
  skill: '#d99a2b',
  kaggle: '#20beff',
  uas: '#f06a6a',
  tidur: '#3b4270',
};

export const LABEL_KATEGORI: Record<KategoriBlok, string> = {
  rutinitas: 'Rutinitas',
  olahraga: 'Olahraga',
  kuliah: 'Kuliah',
  belajar: 'Deep work matkul',
  tugas: 'Tugas & lab',
  istirahat: 'Istirahat',
  batch: 'Batch & rencana',
  jurnal: 'Journalling',
  icaic: 'ICAIC',
  'side-belajar': 'Side hustle · belajar',
  'side-hustle': 'Side hustle · penghasilan',
  podcast: 'Podcast',
  skill: 'Belajar hal baru',
  kaggle: 'Kaggle',
  uas: 'UAS',
  tidur: 'Tidur',
};

/* ---------------- tanggal penting ---------------- */
export const H2_UAS = '2026-11-26';
export const UAS_MULAI = '2026-12-10';
export const UAS_SELESAI = '2026-12-19';

export type Fase = 'normal' | 'h2' | 'uas' | 'libur';
export function faseHari(tanggal: string): Fase {
  if (tanggal < SEMESTER_START || tanggal > UAS_SELESAI) return 'libur';
  if (tanggal >= UAS_MULAI) return 'uas';
  if (tanggal >= H2_UAS) return 'h2';
  return 'normal';
}
export const LABEL_FASE: Record<Fase, string> = {
  normal: 'Mengumpulkan ilmu',
  h2: 'H-2 pekan UAS · fokus UAS',
  uas: 'Pekan UAS',
  libur: 'Libur semester',
};

/* ---------------- side hustle: belajar baru per tanggal ---------------- */
const SIDE_BELAJAR: Record<string, { judul: string; detail: string }> = {
  '2026-10-24': {
    judul: 'Google CodeMender',
    detail:
      'Agen AI dari Google DeepMind untuk menemukan dan menambal kerentanan kode. Baca pengumuman & dokumentasinya, petakan alurnya (deteksi → patch → validasi), catat 3 ide penerapan di proyekmu.',
  },
  '2026-10-25': {
    judul: 'Wiz AI',
    detail:
      'Platform keamanan cloud Wiz: security graph, CNAPP, dan fitur keamanan AI (AI-SPM). Pahami cara Wiz memetakan risiko lintas cloud; buat ringkasan satu halaman.',
  },
  '2026-10-31': {
    judul: 'Mandiant',
    detail:
      'Threat intelligence & incident response (Google Cloud). Baca laporan M-Trends terbaru, pelajari siklus IR dan MITRE ATT&CK; tulis 5 pelajaran utama.',
  },
  '2026-11-01': {
    judul: 'AI × Cybersecurity: peta ancaman LLM',
    detail: 'OWASP Top 10 for LLM Applications: prompt injection, data leakage, excessive agency. Satu contoh serangan + mitigasi per butir.',
  },
  '2026-11-07': {
    judul: 'LLMNetOps: konsep',
    detail: 'LLM untuk operasi jaringan: membaca log, konfigurasi, troubleshooting. Kumpulkan 3 paper/artikel, catat arsitektur yang dipakai.',
  },
  '2026-11-08': {
    judul: 'Finance: fondasi keuangan pribadi',
    detail: 'Anggaran 50/30/20, dana darurat, bunga majemuk, inflasi. Sambungkan ke halaman Keuangan Hypomonē.',
  },
  '2026-11-14': {
    judul: 'LLMNetOps: mini proyek',
    detail: 'Analisis log jaringan (contoh dataset publik) dengan LLM: deteksi anomali + ringkasan insiden otomatis.',
  },
  '2026-11-15': {
    judul: 'Finance: instrumen investasi',
    detail: 'Reksa dana, obligasi/SBN, saham: profil risiko, biaya, likuiditas. Simulasikan portofolio kecil di halaman Investasi.',
  },
  '2026-11-21': {
    judul: 'AI × Cybersecurity: deteksi serangan dengan ML',
    detail: 'Deteksi intrusi/anomali dengan model klasik & deep learning (nyambung ke topik ICAIC). Coba satu dataset IDS publik.',
  },
  '2026-11-22': {
    judul: 'Finance: membaca laporan keuangan',
    detail: 'Neraca, laba rugi, arus kas; rasio dasar (ROE, DER, margin). Bedah satu emiten.',
  },
};
function sideBelajar(tanggal: string) {
  const f = faseHari(tanggal);
  if (f === 'h2' || f === 'uas') return null;
  if (SIDE_BELAJAR[tanggal]) return SIDE_BELAJAR[tanggal];
  const bulan = tanggal.slice(5, 7);
  if (bulan === '10') return { judul: 'Topik Oktober: CodeMender · Wiz AI · Mandiant', detail: 'Lanjutkan topik yang belum tuntas dari tiga pilihan Oktober.' };
  if (bulan === '11') return { judul: 'Topik November: AI · Cybersecurity (LLMNetOps) · Finance', detail: 'Lanjutkan topik November yang paling tertinggal.' };
  return { judul: 'Topik bebas (libur)', detail: 'Tentukan fokus bulan berikutnya: AI, keamanan, atau finance.' };
}

/* ---------------- side hustle: penghasilan (fase belajar) ---------------- */
const SIDE_HUSTLE = [
  'Portofolio: rapikan & deploy satu proyek PBP (Django) sebagai contoh jasa web.',
  'Riset pasar: 5 lowongan freelance/riset harga jasa web & data; catat skill yang paling dicari.',
  'Personal branding: tulis 1 artikel/thread teknis dari materi minggu ini.',
  'Kaggle sebagai portofolio: publikasikan notebook terbaik dengan penjelasan rapi.',
  'Portofolio: halaman profil (GitHub README / situs) berisi 3 proyek terbaik.',
];

/* ---------------- belajar hal baru: periode 3 pekan ---------------- */
const PERIODE_SKILL = [
  { mulai: '2026-10-19', selesai: '2026-11-08', judul: 'Editing video', detail: 'DaVinci Resolve/CapCut: potong, transisi, color, audio. Target: satu video 60 detik tiap pekan.' },
  { mulai: '2026-11-09', selesai: '2026-11-25', judul: 'Public speaking', detail: 'Struktur PREP, rekam diri 3 menit, tonton ulang, perbaiki satu hal tiap sesi.' },
  { mulai: '2026-12-20', selesai: '2027-01-10', judul: 'Desain visual (Figma)', detail: 'Layout, tipografi, warna; tiru ulang satu desain bagus tiap sesi.' },
];
export function periodeSkill(tanggal: string) {
  return PERIODE_SKILL.find(p => tanggal >= p.mulai && tanggal <= p.selesai) ?? null;
}

/* ---------------- matkul ---------------- */
const PRIORITAS = ['sda', 'pbp', 'basdat'];
const byId = Object.fromEntries(COURSES.map(c => [c.id, c]));
const pekanKe = (tanggal: string) => Math.floor((parseYmd(tanggal).getTime() - parseYmd(SEMESTER_START).getTime()) / (7 * 86400000)) + 1;

/** Materi yang dikejar saat belajar mandiri: maju 1 pekan, lalu 2 pekan mulai pekan 12,
    sehingga materi sampai pekan 16 sudah tersentuh sebelum H-2 pekan UAS. */
function materiTarget(cid: string, tanggal: string) {
  const c = byId[cid];
  const n = pekanKe(tanggal);
  const maju = n >= 12 ? 2 : 1;
  const target = Math.min(16, n + maju);
  const w = c.weeks.find(x => x.n === target && x.flag !== 'exam') ?? c.weeks.filter(x => x.flag !== 'exam' && x.n <= target).slice(-1)[0];
  return w ? `pekan ${w.n}: ${w.title}` : 'review materi';
}

const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}.${String(m % 60).padStart(2, '0')}`;
export const jamTeks = (b: Pick<Blok, 'mulai' | 'selesai'>) => `${fmt(b.mulai)}–${fmt(b.selesai)}`;
const J = (s: string) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};

/* ======================================================================
   Penyusun
   ====================================================================== */
function penyusun() {
  const out: Blok[] = [];
  const tambah = (mulai: number, selesai: number, judul: string, kategori: KategoriBlok, detail?: string, extra: Partial<Blok> = {}) => {
    if (selesai - mulai < 5) return;
    out.push({ mulai, selesai, judul, kategori, detail, ...extra });
  };
  return { out, tambah };
}

/** Deep work di sebuah celah: blok ≤ 90 menit dengan jeda 10 menit. */
function isiCelah(tambah: ReturnType<typeof penyusun>['tambah'], a: number, b: number, subjek: () => { judul: string; detail?: string; kategori: KategoriBlok; cid?: string }) {
  let t = a;
  while (b - t >= 20) {
    const panjang = Math.min(90, b - t);
    const sisa = b - t - panjang;
    const akhir = sisa > 0 && sisa < 30 ? b : t + panjang;
    const s = subjek();
    tambah(t, akhir, s.judul, s.kategori, s.detail, { cid: s.cid });
    t = akhir;
    if (b - t >= 30) {
      tambah(t, t + 10, 'Jeda: berdiri, minum, jauhkan layar', 'istirahat');
      t += 10;
    }
  }
  if (b - t >= 5) tambah(t, b, 'Jeda', 'istirahat');
}

function hariKerja(tanggal: string, dow: number, fase: Fase): Blok[] {
  const { out, tambah } = penyusun();
  const kelas = COURSES.flatMap(c => c.sessions.filter(s => s.day === dow).map(s => ({ ...s, cid: c.id, short: c.short, mulai: J(s.from), selesai: J(s.to) }))).sort(
    (a, b) => a.mulai - b.mulai,
  );
  const uasHari = fase === 'uas';

  /* Rotasi subjek deep work: tiga matkul prioritas lebih sering. */
  const urut = [...PRIORITAS, ...PRIORITAS, 'statprob', 'os'];
  let k = dow * 2;
  const subjekSiang = () => {
    const cid = urut[k++ % urut.length];
    const c = byId[cid];
    if (fase === 'h2' || uasHari) return { judul: `Deep work · ${c.short}: latihan soal UAS`, detail: 'Soal tahun lalu / latihan BRP, waktu seperti ujian, catat kesalahan di error log.', kategori: 'uas' as const, cid };
    return { judul: `Deep work · ${c.short}: maju materi`, detail: `Pra-baca ${materiTarget(cid, tanggal)}. Tutup dengan 3 pertanyaan yang belum terjawab.`, kategori: 'belajar' as const, cid };
  };

  tambah(J('05:30'), J('05:45'), 'Bangun · air putih · rapikan kasur', 'rutinitas', 'Tanpa HP 15 menit pertama.');
  tambah(J('05:45'), J('06:10'), 'Gerak 25 menit', 'olahraga', 'Jalan cepat, push-up, plank, stretching. Cukup menyalakan badan.');
  tambah(J('06:10'), J('06:40'), 'Mandi & sarapan', 'rutinitas');
  tambah(J('06:40'), J('07:00'), 'Rencana hari: 3 prioritas', 'batch', 'Buka Hypomonē: cek deadline & jadwal, tulis 3 hal yang wajib selesai hari ini.');

  /* Siang: kelas + celah. */
  let t = J('07:00');
  let makanSiang = false;
  /** Celah [a, b) di antara `kelasTadi` (selesai di a) dan `kelasBerikut` (mulai di b). */
  const celah = (a: number, b: number, kelasBerikut?: (typeof kelas)[number], kelasTadi?: (typeof kelas)[number]) => {
    if (b - a < 30) {
      tambah(a, b, kelasBerikut ? `Pindah ke ${kelasBerikut.short} · minum` : 'Jeda', 'istirahat', kelasBerikut?.room);
      return;
    }
    let x = a;
    let y = b;
    if (kelasTadi && y - x >= 40) {
      tambah(x, x + 15, `Rapikan catatan ${kelasTadi.short}`, 'belajar', 'Lengkapi catatan kelas tadi selagi masih segar, tandai yang belum paham.', { cid: kelasTadi.cid });
      x += 15;
    }
    const akhirSiap = y;
    if (kelasBerikut && y - x >= 30) y -= 15;
    if (!makanSiang && x <= J('13:15') && y >= J('12:00') && y - Math.max(x, J('11:45')) >= 40) {
      const m = Math.max(x, J('11:45'));
      isiCelah(tambah, x, m, subjekSiang);
      tambah(m, m + 40, 'Makan siang', 'istirahat');
      makanSiang = true;
      let s = m + 40;
      if (y - s >= 15) {
        tambah(s, s + 15, 'Batch komunikasi: WA, email, SCeLE', 'batch', 'Balas semua sekaligus, lalu tutup lagi.');
        s += 15;
      }
      isiCelah(tambah, s, y, subjekSiang);
    } else isiCelah(tambah, x, y, subjekSiang);
    if (kelasBerikut && akhirSiap - y === 15) tambah(y, akhirSiap, `Menuju ${kelasBerikut.short} · siapkan bahan`, 'rutinitas', kelasBerikut.room, { cid: kelasBerikut.cid });
  };

  let sebelumnya: (typeof kelas)[number] | undefined;
  if (!uasHari)
    for (const s of kelas) {
      if (s.mulai > t) celah(t, s.mulai, s, sebelumnya);
      tambah(s.mulai, s.selesai, `${s.short} · ${s.kind}`, 'kuliah', s.room, { cid: s.cid, lokasi: s.room });
      t = Math.max(t, s.selesai);
      sebelumnya = s;
    }
  celah(t, J('18:00'), undefined, sebelumnya);
  if (!makanSiang) {
    /* Hari tanpa celah siang: makan siang dijadwalkan di tempat yang paling dekat. */
    const i = out.findIndex(b => b.kategori !== 'kuliah' && b.selesai >= J('12:00') && b.mulai <= J('13:30'));
    if (i >= 0) out[i] = { ...out[i], judul: `Makan siang + ${out[i].judul}`, kategori: out[i].kategori };
  }

  /* Malam. */
  tambah(J('18:00'), J('18:45'), 'Makan malam & istirahat', 'istirahat');
  tambah(J('18:45'), J('19:00'), 'Batch komunikasi: WA, email, SCeLE', 'batch');
  if (fase === 'h2' || uasHari) {
    const a = urut[(dow + 1) % urut.length];
    const b = urut[(dow + 3) % urut.length];
    tambah(J('19:00'), J('20:30'), `UAS · ${byId[a].short}: simulasi ujian`, 'uas', 'Kerjakan satu paket soal dengan waktu ujian. Nilai sendiri.', { cid: a });
    tambah(J('20:30'), J('20:40'), 'Jeda', 'istirahat');
    tambah(J('20:40'), J('22:10'), `UAS · ${byId[b].short}: rangkuman 1 halaman + error log`, 'uas', 'Tulis ulang konsep yang paling sering salah, tanpa melihat catatan.', { cid: b });
  } else {
    tambah(J('19:00'), J('20:30'), 'Deep work · tugas & lab terdekat', 'tugas', 'Kerjakan deadline paling dekat di Agenda/Target. Selesai lebih awal = maju ke deadline berikutnya.');
    tambah(J('20:30'), J('20:40'), 'Jeda', 'istirahat');
    const cid = PRIORITAS[dow % PRIORITAS.length];
    tambah(J('20:40'), J('22:10'), `Deep work · ${byId[cid].short}: kejar materi`, 'belajar', `Target tuntas sebelum H-2 UAS: ${materiTarget(cid, tanggal)}. Kerjakan contoh soalnya.`, { cid });
  }
  tambah(J('22:10'), J('22:20'), 'Jeda', 'istirahat');
  const rev = dow % 2 ? 'statprob' : 'os';
  tambah(J('22:20'), J('22:50'), `Review cepat · ${byId[rev].short}`, fase === 'normal' ? 'belajar' : 'uas', 'Flashcard + 2 soal pendek. Tidak membuka materi baru.', { cid: rev });
  tambah(J('22:50'), J('23:15'), 'Journalling & rencana besok', 'jurnal', 'Isi jurnal di Harian: mood, energi, satu pelajaran, tiga prioritas besok.');
  tambah(J('23:15'), J('23:30'), 'Layar mati · siap tidur', 'tidur', 'Tidur 23.30, bangun 05.30.');
  return out.sort((a, b) => a.mulai - b.mulai);
}

function akhirPekan(tanggal: string, dow: number, fase: Fase): Blok[] {
  const { out, tambah } = penyusun();
  tambah(J('05:30'), J('05:45'), 'Bangun · air putih · rapikan kasur', 'rutinitas', 'Tanpa HP 15 menit pertama.');

  if (fase === 'h2' || fase === 'uas') {
    tambah(J('05:45'), J('06:15'), 'Olahraga 30 menit', 'olahraga', 'Jaga stamina; jangan dilewati walau mepet ujian.');
    tambah(J('06:15'), J('06:45'), 'Mandi & sarapan', 'rutinitas');
    const urut = ['sda', 'pbp', 'basdat', 'statprob', 'os'];
    let k = dow === 6 ? 0 : 2;
    const blok = (a: string, b: string, jenis: string) => {
      const cid = urut[k++ % urut.length];
      tambah(J(a), J(b), `UAS · ${byId[cid].short}: ${jenis}`, 'uas', undefined, { cid });
    };
    blok('06:45', '08:15', 'review konsep');
    tambah(J('08:15'), J('08:30'), 'Jeda', 'istirahat');
    blok('08:30', '10:00', 'latihan soal');
    tambah(J('10:00'), J('10:15'), 'Jeda', 'istirahat');
    blok('10:15', '11:45', 'review konsep');
    tambah(J('11:45'), J('12:45'), 'Makan siang & istirahat', 'istirahat');
    blok('12:45', '14:15', 'latihan soal');
    tambah(J('14:15'), J('14:30'), 'Jeda', 'istirahat');
    blok('14:30', '16:00', 'review konsep');
    tambah(J('16:00'), J('16:15'), 'Jeda', 'istirahat');
    blok('16:15', '17:45', 'simulasi ujian berwaktu');
    tambah(J('17:45'), J('18:45'), 'Makan malam & istirahat', 'istirahat');
    tambah(J('18:45'), J('20:15'), 'UAS · bedah kesalahan (error log)', 'uas', 'Setiap soal salah hari ini: kenapa salah, konsep apa, tulis ulang jawabannya.');
    tambah(J('20:15'), J('20:30'), 'Jeda', 'istirahat');
    tambah(J('20:30'), J('21:30'), 'UAS · flashcard & rangkuman satu halaman', 'uas');
    tambah(J('21:30'), J('22:00'), 'Journalling', 'jurnal');
    tambah(J('22:00'), J('22:30'), 'Wind-down · siap tidur', 'tidur', 'Tidur 22.30.');
    return out;
  }

  const sabtu = dow === 6;
  const pekanIdx = Math.floor((parseYmd(tanggal).getTime() - parseYmd('2026-10-19').getTime()) / (7 * 86400000));
  tambah(J('05:45'), J('06:45'), sabtu ? 'Olahraga 60 menit · lari / jogging' : 'Olahraga 60 menit · kekuatan + stretching', 'olahraga', sabtu ? 'Zona 2, napas masih bisa bicara.' : 'Push, pull, squat, core. Tutup dengan 10 menit peregangan.');
  tambah(J('06:45'), J('07:15'), 'Mandi & sarapan', 'rutinitas');

  const icaic = sesiIcaicPada(tanggal);
  const sesiTeks = (i: number) => {
    const s = icaic[i];
    if (!s) return { judul: fase === 'libur' ? 'Kaggle / proyek pribadi' : 'ICAIC · latihan soal simulasi', detail: undefined as string | undefined };
    const daftar = s.topik.map(n => `#${n} ${TOPIK_ICAIC[n - 1].nama}`).join(' · ');
    return { judul: `ICAIC · ${s.judul}`, detail: daftar || s.judul };
  };
  const pagi = sesiTeks(0);
  tambah(J('07:15'), J('09:45'), pagi.judul, icaic.length || fase !== 'libur' ? 'icaic' : 'kaggle', pagi.detail ? `Topik: ${pagi.detail}` : 'Kerjakan soal simulasi, nilai sendiri, catat topik lemah.');
  tambah(J('09:45'), J('10:00'), 'Jeda', 'istirahat');
  const sb = sideBelajar(tanggal);
  if (sb) tambah(J('10:00'), J('12:00'), `Side hustle · belajar: ${sb.judul}`, 'side-belajar', sb.detail);
  tambah(J('12:00'), J('13:00'), 'Makan siang & istirahat', 'istirahat');
  const siang = sesiTeks(1);
  tambah(J('13:00'), J('15:00'), siang.judul, icaic.length > 1 || fase !== 'libur' ? 'icaic' : 'kaggle', siang.detail ? `Topik: ${siang.detail}` : 'Kerjakan soal simulasi, nilai sendiri, catat topik lemah.');
  tambah(J('15:00'), J('15:15'), 'Jeda', 'istirahat');
  tambah(J('15:15'), J('16:45'), 'Side hustle · penghasilan (fase belajar)', 'side-hustle', SIDE_HUSTLE[(pekanIdx * 2 + (sabtu ? 0 : 1) + SIDE_HUSTLE.length * 4) % SIDE_HUSTLE.length]);
  const p = periodeSkill(tanggal);
  if (p) tambah(J('16:45'), J('17:45'), `Belajar hal baru · ${p.judul}`, 'skill', p.detail);
  else tambah(J('16:45'), J('17:45'), 'Baca buku (non-teknis)', 'skill');
  tambah(J('17:45'), J('18:45'), 'Makan malam & istirahat', 'istirahat');
  if (sabtu) {
    tambah(J('18:45'), J('20:30'), 'Kaggle', 'kaggle', 'Playground Series / notebook publik. Terapkan topik ICAIC hari ini pada data sungguhan.');
  } else {
    tambah(J('18:45'), J('19:45'), 'Review mingguan & rencana pekan depan', 'batch', 'Apa yang selesai, apa yang meleset, kenapa. Pindahkan deadline pekan depan ke Target.');
    tambah(J('19:45'), J('20:30'), 'Pra-baca kuliah Senin', 'belajar', 'StatProb, OS, PBP: baca slide pekan depan, tulis 3 pertanyaan.');
  }
  tambah(J('20:30'), J('21:15'), 'Podcast + 1 catatan', 'podcast', 'Teknologi, keamanan, atau finance. Tulis satu ide yang bisa dipakai.');
  tambah(J('21:15'), J('21:45'), 'Journalling', 'jurnal', 'Refleksi pekan: syukur, pelajaran, energi.');
  tambah(J('21:45'), J('22:30'), 'Wind-down · baca buku fisik, tanpa layar', 'tidur', 'Tidur 22.30.');
  return out;
}

/** Jadwal lengkap satu tanggal ('YYYY-MM-DD'), urut waktu. */
export function jadwalHari(tanggal: string): Blok[] {
  const dow = parseYmd(tanggal).getUTCDay();
  const fase = faseHari(tanggal);
  if (dow === 0 || dow === 6) return akhirPekan(tanggal, dow, fase);
  if (fase === 'libur') return akhirPekan(tanggal, 6, fase);
  return hariKerja(tanggal, dow, fase);
}

/** Blok yang sedang berjalan, blok berikutnya, dan seberapa jauh blok sekarang. */
export function posisiSekarang(tanggal: string, menit: number) {
  const jadwal = jadwalHari(tanggal);
  const i = jadwal.findIndex(b => menit >= b.mulai && menit < b.selesai);
  const sekarang = i >= 0 ? jadwal[i] : null;
  const berikut = jadwal.filter(b => b.mulai > menit).slice(0, 3);
  const persen = sekarang ? ((menit - sekarang.mulai) / (sekarang.selesai - sekarang.mulai)) * 100 : 0;
  const tidur = !sekarang && (menit >= jadwal[jadwal.length - 1].selesai || menit < jadwal[0].mulai);
  return { jadwal, sekarang, berikut, persen, tidur, fase: faseHari(tanggal) };
}

/** Besok, untuk ditampilkan saat sedang tidur. */
export const besok = (tanggal: string) => ymd(addDays(parseYmd(tanggal), 1));
