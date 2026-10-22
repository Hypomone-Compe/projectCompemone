/* ==========================================================================
   Ekspor deadline, lab, kuis, dan ujian ke berkas iCalendar (.ics) untuk
   diimpor ke Google Calendar (atau kalender lain).

   Sumbernya tugas mingguan di BRP (lib/courses), jadi tanggal dibaca dari teks:
   - "deadline 9 Nov 12.00 WIB"       → acara berjam yang berakhir tepat di deadline
   - "(Jumat 30 Okt)"                 → hari itu; lab memakai jam & ruang sesi lab matkul
   - "(3–9 Nov)", "(29 Sep – 5 Okt)"  → demo: rentang hari; lainnya: batas di hari terakhir
   - ": 9 Desember 2026"              → hari itu
   - "akhir pekan ini"                → Minggu pekan itu
   - tanpa tanggal                    → lab: sesi lab matkul pekan itu; selain itu
                                         bilah Senin–Jumat pekan itu ("pekan ini")
   UID stabil, jadi impor ulang memperbarui acara yang sama alih-alih menggandakan.
   ========================================================================== */
import { COURSES, shortName } from './courses';
import { addDays, EXAM_RANGES, parseYmd, ymd } from './kalender';
import { buildWeeks } from './plan';
import type { Flag } from './text';

interface Waktu {
  tanggal: string;
  /** 'HH:MM' WIB; kosong = sepanjang hari. */
  jam?: string;
}

export interface AcaraIcs {
  uid: string;
  judul: string;
  deskripsi: string;
  lokasi?: string;
  mulai: Waktu;
  /** Untuk acara sepanjang hari: hari terakhir (inklusif). */
  selesai: Waktu;
  /** Pengingat, menit sebelum mulai. */
  ingat: number[];
}

const BULAN: Record<string, number> = {
  jan: 1, januari: 1, feb: 2, februari: 2, mar: 3, maret: 3, apr: 4, april: 4, mei: 5, jun: 6, juni: 6,
  jul: 7, juli: 7, agu: 8, agustus: 8, sep: 9, september: 9, okt: 10, oktober: 10, nov: 11, november: 11, des: 12, desember: 12,
};
const NAMA_BULAN = Object.keys(BULAN).sort((a, b) => b.length - a.length).join('|');
const HARI = 'Senin|Selasa|Rabu|Kamis|Jumat|Sabtu|Minggu';

/** Semester Gasal 2026/2027: Agustus–Desember 2026, Januari 2027. */
const tgl = (d: string | number, b: string, th?: string) => {
  const m = BULAN[b.toLowerCase()];
  const y = th ? Number(th) : m >= 7 ? 2026 : 2027;
  return `${y}-${String(m).padStart(2, '0')}-${String(Number(d)).padStart(2, '0')}`;
};

const IKON: Record<string, string> = { lab: '🧪', quiz: '📝', demo: '🎤', hot: '⏰', batas: '⏰' };

/** Judul bersih: tanggal, "rilis …", "diumumkan …" dibuang (tetap ada di deskripsi). */
function judulBersih(teks: string) {
  return teks
    .replace(new RegExp(`\\s*\\([^)]*\\b(?:${NAMA_BULAN}|${HARI})\\b[^)]*\\)`, 'gi'), '')
    .replace(/,\s*rilis\b.*$/i, '')
    .replace(/:\s*diumumkan\b.*$/i, '')
    .replace(/,\s*akhir pekan ini\b.*$/i, '')
    .replace(new RegExp(`:\\s*\\d{1,2}\\s+(${NAMA_BULAN})\\s+\\d{4}$`, 'i'), '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Hash pendek & stabil untuk UID. */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}

const tambahMenit = (jam: string, menit: number) => {
  const [h, m] = jam.split(':').map(Number);
  const t = Math.max(0, h * 60 + m + menit);
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

export function kumpulkanAcara(dari: string): AcaraIcs[] {
  const byId = Object.fromEntries(COURSES.map(c => [c.id, c]));
  const out: AcaraIcs[] = [];

  for (const w of buildWeeks(dari)) {
    for (const ev of w.events) {
      const c = byId[ev.cid];
      const nama = c.short;
      for (const t of ev.tasks) {
        const flag: Flag = t.flag;
        const teks = t.text;
        const cp = /^CP\d+/i.test(teks);
        const adaDeadline = /deadline/i.test(teks);
        if (!(flag === 'lab' || flag === 'quiz' || flag === 'demo' || flag === 'hot' || cp || adaDeadline)) continue;

        const jenis = cp ? 'batas' : (flag as string) || 'batas';
        const dasar = { uid: `${hash(`${ev.cid}|${teks}`)}-${ev.cid}@hypomone`, deskripsi: `${c.name} (${c.code.split(' / ')[0]})\n${teks}\nPekan ${w.n}` };
        const judul = (awal: string) => `${IKON[jenis] ?? '📌'} ${nama} · ${awal}${judulBersih(teks)}`;
        const sesiLab = c.sessions.find(s => s.kind === 'Lab');
        let m: RegExpMatchArray | null;

        if ((m = teks.match(new RegExp(`deadline\\s+(\\d{1,2})\\s+(${NAMA_BULAN})(?:\\s+(\\d{4}))?(?:\\s+(\\d{1,2})[.:](\\d{2}))?`, 'i')))) {
          const tanggal = tgl(m[1], m[2], m[3]);
          if (m[4]) {
            const jam = `${m[4].padStart(2, '0')}:${m[5]}`;
            out.push({ ...dasar, judul: judul('Deadline '), mulai: { tanggal, jam: tambahMenit(jam, -60) }, selesai: { tanggal, jam }, ingat: [24 * 60, 180] });
          } else out.push({ ...dasar, judul: judul('Deadline '), mulai: { tanggal }, selesai: { tanggal }, ingat: [15 * 60 + 24 * 60, 15 * 60] });
        } else if ((m = teks.match(new RegExp(`:\\s*(\\d{1,2})\\s+(${NAMA_BULAN})\\s+(\\d{4})`, 'i')))) {
          const tanggal = tgl(m[1], m[2], m[3]);
          out.push({ ...dasar, judul: judul(''), mulai: { tanggal }, selesai: { tanggal }, ingat: [15 * 60 + 2 * 24 * 60, 15 * 60] });
        } else if ((m = teks.match(new RegExp(`\\((?:(?:${HARI})\\s+)?(\\d{1,2})(?:\\s+(${NAMA_BULAN}))?\\s*[–-]\\s*(\\d{1,2})\\s+(${NAMA_BULAN})\\)`, 'i')))) {
          const akhir = tgl(m[3], m[4]);
          const awal = tgl(m[1], m[2] || m[4]);
          if (flag === 'demo') out.push({ ...dasar, judul: judul(''), mulai: { tanggal: awal }, selesai: { tanggal: akhir }, ingat: [15 * 60] });
          else out.push({ ...dasar, judul: judul('Batas '), mulai: { tanggal: akhir }, selesai: { tanggal: akhir }, ingat: [15 * 60 + 24 * 60, 15 * 60] });
        } else if ((m = teks.match(new RegExp(`\\((?:${HARI})\\s+(\\d{1,2})\\s+(${NAMA_BULAN})\\)`, 'i')))) {
          const tanggal = tgl(m[1], m[2]);
          const dow = parseYmd(tanggal).getUTCDay();
          const sesi = c.sessions.find(s => s.day === dow && (flag !== 'lab' || s.kind === 'Lab')) ?? (flag === 'lab' ? undefined : c.sessions.find(s => s.day === dow));
          if (sesi) out.push({ ...dasar, judul: judul(''), lokasi: sesi.room, mulai: { tanggal, jam: sesi.from }, selesai: { tanggal, jam: sesi.to }, ingat: [24 * 60, 60] });
          else out.push({ ...dasar, judul: judul(''), mulai: { tanggal }, selesai: { tanggal }, ingat: [15 * 60] });
        } else if (/akhir pekan ini/i.test(teks)) {
          const tanggal = w.end;
          out.push({ ...dasar, judul: judul(''), mulai: { tanggal }, selesai: { tanggal }, ingat: [15 * 60 + 2 * 24 * 60, 15 * 60] });
        } else if (flag === 'lab' && sesiLab) {
          const tanggal = ymd(addDays(parseYmd(w.start), sesiLab.day - 1));
          out.push({ ...dasar, judul: judul(''), lokasi: sesiLab.room, mulai: { tanggal, jam: sesiLab.from }, selesai: { tanggal, jam: sesiLab.to }, ingat: [24 * 60, 60] });
        } else {
          /* Tanggal pasti tidak ada di BRP: tandai sepanjang pekan kuliahnya. */
          out.push({
            ...dasar,
            judul: judul('') + ' (pekan ini)',
            deskripsi: `${dasar.deskripsi}\nTanggal pasti tidak tercantum di BRP; cek pengumuman SCeLE.`,
            mulai: { tanggal: w.start },
            selesai: { tanggal: ymd(addDays(parseYmd(w.start), 4)) },
            ingat: [15 * 60 + 24 * 60],
          });
        }
      }
    }
  }

  /* Periode ujian. */
  for (const u of EXAM_RANGES) {
    const daftar = COURSES.map(c => `• ${c.short} (${shortName(c)})`).join('\n');
    const ket =
      u.label === 'UAS'
        ? 'Jadwal pasti per mata kuliah mengikuti pengumuman. Catatan BRP: PBP sifat CLOSE (Sub-CPMK 10–12, Mobile); OS online lewat SCeLE; StatProb lanjutan ujian 14, 16, 17 Des, materi topik (7)–(12).'
        : 'Jadwal pasti per mata kuliah mengikuti pengumuman.';
    out.push({
      uid: `${u.label.toLowerCase()}-2026@hypomone`,
      judul: `📚 Periode ${u.label}`,
      deskripsi: `${u.label} Gasal 2026/2027\n${ket}\n\n${daftar}`,
      mulai: { tanggal: u.from },
      selesai: { tanggal: u.to },
      ingat: [15 * 60 + 7 * 24 * 60, 15 * 60 + 24 * 60],
    });
  }

  return out.filter(a => a.selesai.tanggal >= dari).sort((a, b) => (a.mulai.tanggal + (a.mulai.jam ?? '')).localeCompare(b.mulai.tanggal + (b.mulai.jam ?? '')));
}

/* ---------------- penulisan iCalendar (RFC 5545) ---------------- */
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Lipat baris > 75 oktet (UTF-8) sesuai RFC 5545. */
function lipat(baris: string) {
  const enc = new TextEncoder();
  const out: string[] = [];
  let cur = '';
  let len = 0;
  for (const ch of baris) {
    const b = enc.encode(ch).length;
    if (len + b > (out.length ? 74 : 75)) {
      out.push(cur);
      cur = '';
      len = 0;
    }
    cur += ch;
    len += b;
  }
  out.push(cur);
  return out.join('\r\n ');
}

/** WIB (UTC+7) → stempel UTC "YYYYMMDDTHHMMSSZ". */
const keUtc = (w: Waktu) => {
  const [h, m] = (w.jam ?? '00:00').split(':').map(Number);
  const [y, mo, d0] = w.tanggal.split('-').map(Number);
  const d = new Date(Date.UTC(y, mo - 1, d0, h - 7, m));
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
};
const tanggalSaja = (t: string) => t.replace(/-/g, '');

export function buatIcs(dari: string, sekarang = new Date()): { ics: string; jumlah: number } {
  const acara = kumpulkanAcara(dari);
  const stamp = sekarang.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const L: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hypomone @LV//Deadline Gasal 2026-2027//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Hypomonē · Deadline & Ujian',
    'X-WR-TIMEZONE:Asia/Jakarta',
  ];
  for (const a of acara) {
    L.push('BEGIN:VEVENT', `UID:${a.uid}`, `DTSTAMP:${stamp}`);
    if (a.mulai.jam) {
      L.push(`DTSTART:${keUtc(a.mulai)}`, `DTEND:${keUtc(a.selesai)}`);
    } else {
      L.push(`DTSTART;VALUE=DATE:${tanggalSaja(a.mulai.tanggal)}`, `DTEND;VALUE=DATE:${tanggalSaja(ymd(addDays(parseYmd(a.selesai.tanggal), 1)))}`);
      L.push('TRANSP:TRANSPARENT');
    }
    L.push(`SUMMARY:${esc(a.judul)}`, `DESCRIPTION:${esc(a.deskripsi)}`);
    if (a.lokasi) L.push(`LOCATION:${esc(a.lokasi)}`);
    for (const menit of a.ingat) L.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(a.judul)}`, `TRIGGER:-PT${menit}M`, 'END:VALARM');
    L.push('END:VEVENT');
  }
  L.push('END:VCALENDAR');
  return { ics: L.map(lipat).join('\r\n') + '\r\n', jumlah: acara.length };
}
