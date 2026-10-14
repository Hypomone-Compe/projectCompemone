/* Utilitas teks: emoji di dalam data dipakai sebagai penanda semantik,
   bukan untuk ditampilkan. Di sini emoji dibuang dan diubah jadi flag. */

const EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu;

export type Flag = 'hot' | 'quiz' | 'lab' | 'demo' | 'danger' | 'warn' | 'tip' | 'gem' | 'star' | 'note' | null;

export interface Flagged {
  flag: Flag;
  text: string;
}

export function stripEmoji(s: string | undefined | null): string {
  return String(s == null ? '' : s).replace(EMOJI_RE, '').replace(/\s{2,}/g, ' ').trim();
}

/** Penanda di awal string data → { flag, text } dengan emoji sudah dibuang. */
export function parseFlag(s: string | undefined | null): Flagged {
  const raw = String(s || '');
  let flag: Flag = null;
  if (/🔥|🏗️/.test(raw)) flag = 'hot';
  else if (/📝|📄/.test(raw)) flag = 'quiz';
  else if (/🧪|⚡/.test(raw)) flag = 'lab';
  else if (/🎤/.test(raw)) flag = 'demo';
  else if (/🚨/.test(raw)) flag = 'danger';
  else if (/⚠️|⚠/.test(raw)) flag = 'warn';
  else if (/💡/.test(raw)) flag = 'tip';
  else if (/💎/.test(raw)) flag = 'gem';
  else if (/⭐/.test(raw)) flag = 'star';
  else if (/📌/.test(raw)) flag = 'note';
  return { flag, text: stripEmoji(raw) };
}

export const FLAG_LABEL: Record<string, string> = {
  hot: 'Deadline',
  quiz: 'Kuis',
  lab: 'Lab',
  demo: 'Demo',
  danger: 'Kritis',
  warn: 'Awas',
  tip: 'Tips',
  gem: 'Kunci',
  star: 'Utama',
  note: 'Catatan',
};

/** Flag yang berarti "ada yang harus dikerjakan, dihadiri, atau dikumpulkan
    minggu ini". Sesi lab dan demo ikut masuk karena keduanya dinilai, tidak
    punya susulan di beberapa matkul, dan hilang begitu harinya lewat, persis
    seperti deadline. */
export const DEADLINE_FLAGS = new Set<Flag>(['hot', 'quiz', 'lab', 'demo']);

/** Bagian dari DEADLINE_FLAGS yang berupa acara terjadwal di kelas atau lab,
    bukan berkas yang diunggah. Dipakai email untuk memisahkan blok pengingat
    kuis & lab dari daftar deadline biasa. */
export const ACARA_FLAGS = new Set<Flag>(['quiz', 'lab', 'demo']);

export function letterFor(scale: { g: string; min: number }[], val: number): string {
  for (const s of scale) if (val >= s.min) return s.g;
  return 'E';
}

/** "8×" → 8 · "6 × 5 poin" → 6 · "12× (diambil best-10)" → 12 · "1×" → 1 */
export function parseFreqCount(freq: string | undefined): number {
  /* Tanpa \b setelah tanda kali: "8×" berakhir di karakter non-kata,
     jadi \b tidak pernah cocok dan semua komponen jatuh ke 1 slot. */
  const m = String(freq || '').match(/(\d+)\s*[×x]/i);
  const n = m ? parseInt(m[1], 10) : 1;
  return Math.min(Math.max(n, 1), 30);
}

/** "12× (diambil best-10)" → 10, selain itu null */
export function parseBestOf(freq: string | undefined): number | null {
  const m = String(freq || '').match(/best-?\s*(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}
