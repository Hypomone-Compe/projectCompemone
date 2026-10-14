/* ==========================================================================
   Ringkasan tiap matkul untuk kartu orbit & panel detail di beranda.

   Dihitung di server dari BRP + kalender, lalu dikirim ke klien dalam bentuk
   kecil. Isi BRP lengkap tetap tidak pernah masuk bundel peramban.
   ========================================================================== */
import 'server-only';
import { COURSES } from './courses';
import type { GradingRingkas } from './nilai';
import {
  buildWeeks, DAY_NAMES, DAY_SHORT, fmtRange, parseYmd, semesterStatus, todayYmd, TZ,
} from './plan';
import { DEADLINE_FLAGS, FLAG_LABEL, stripEmoji, type Flag } from './text';

export interface TugasRingkas {
  text: string;
  flag: Flag;
  label: string | null;
  penting: boolean;
}

export interface MingguRingkas {
  n: number;
  label: string;
  range: string;
  title: string;
  exam: string | null;
  tasks: TugasRingkas[];
}

export interface SesiRingkas {
  hari: string;
  hariPendek: string;
  jam: string;
  ruang: string;
  kind: string;
  /** "Hari ini", "Besok", atau nama hari. */
  kapan: string;
}

export interface KartuMatkul {
  id: string;
  short: string;
  kelas: string;
  name: string;
  code: string;
  sks: number;
  accent: string;
  pale: string;
  fokus: boolean;
  cover: string;
  dosen: string;
  tagline: string;
  topicIds: string[];
  topikBerat: number;
  grading: GradingRingkas;
  jadwal: { hariPendek: string; jam: string; ruang: string; kind: string }[];
  sesiBerikut: SesiRingkas | null;
  mingguIni: MingguRingkas | null;
  mingguDepan: MingguRingkas | null;
  /** Deadline terdekat yang belum lewat (minggu ini atau sesudahnya). */
  deadlineBerikut: { n: number; range: string; text: string; label: string } | null;
  /** Untuk teks kecil di kartu, mis. "Minggu 8 · 2 deadline". */
  mingguKe: number | null;
  deadlineMingguIni: number;
}

function jamJakarta(now: Date) {
  const f = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false });
  return f.format(now);
}

export function ringkasMatkul(now: Date = new Date()): KartuMatkul[] {
  const today = todayYmd(now);
  const jam = jamJakarta(now);
  const dow = parseYmd(today).getUTCDay();
  const weeks = buildWeeks(today);
  const status = semesterStatus(today);
  const iNow = weeks.findIndex(w => w.isCurrent);

  const minggu = (cid: string, i: number): MingguRingkas | null => {
    const w = weeks[i];
    if (!w) return null;
    const ev = w.events.find(e => e.cid === cid);
    if (!ev && !w.exam) return null;
    return {
      n: w.n,
      label: ev?.label || `Minggu ${w.n}`,
      range: fmtRange(w.start, w.end),
      title: ev?.title || `Pekan ${w.exam}`,
      exam: w.exam,
      tasks: (ev?.tasks || []).map(t => ({
        text: t.text,
        flag: t.flag,
        label: t.flag ? FLAG_LABEL[t.flag] || null : null,
        penting: DEADLINE_FLAGS.has(t.flag),
      })),
    };
  };

  return COURSES.map(c => {
    /* Sesi berikutnya: sisa hari ini (yang belum selesai), lalu 7 hari ke depan. */
    let sesiBerikut: SesiRingkas | null = null;
    for (let d = 0; d < 7 && !sesiBerikut; d++) {
      const hari = (dow + d) % 7;
      const s = c.sessions
        .filter(x => x.day === hari && (d > 0 || x.to > jam))
        .sort((a, b) => a.from.localeCompare(b.from))[0];
      if (s) {
        sesiBerikut = {
          hari: DAY_NAMES[hari],
          hariPendek: DAY_SHORT[hari],
          jam: `${s.from}–${s.to}`,
          ruang: s.room,
          kind: s.kind,
          kapan: d === 0 ? 'Hari ini' : d === 1 ? 'Besok' : DAY_NAMES[hari],
        };
      }
    }

    let deadlineBerikut: KartuMatkul['deadlineBerikut'] = null;
    for (let i = Math.max(0, iNow); i < weeks.length && !deadlineBerikut; i++) {
      const d = weeks[i].deadlines.find(x => x.cid === c.id);
      if (d) {
        deadlineBerikut = {
          n: weeks[i].n,
          range: fmtRange(weeks[i].start, weeks[i].end),
          text: d.text,
          label: (d.flag && FLAG_LABEL[d.flag]) || 'Deadline',
        };
      }
    }

    const ini = iNow >= 0 ? minggu(c.id, iNow) : null;

    return {
      id: c.id,
      short: c.short,
      kelas: c.kelas,
      name: c.name,
      code: c.code,
      sks: c.sks,
      accent: c.accent,
      pale: c.pale,
      fokus: !!c.fokus,
      cover: c.cover || '',
      dosen: stripEmoji(c.dosen),
      tagline: stripEmoji(c.tagline),
      topicIds: c.topics.map(t => t.id),
      topikBerat: c.topics.filter(t => t.d === 3).length,
      grading: {
        components: c.grading.components.map(x => ({ weight: x.weight, freq: x.freq })),
        scale: c.grading.scale,
      },
      jadwal: c.sessions.map(s => ({ hariPendek: DAY_SHORT[s.day], jam: `${s.from}–${s.to}`, ruang: s.room, kind: s.kind })),
      sesiBerikut,
      mingguIni: ini,
      mingguDepan: iNow >= 0 ? minggu(c.id, iNow + 1) : minggu(c.id, 0),
      deadlineBerikut,
      mingguKe: status.phase === 'run' ? status.week : null,
      deadlineMingguIni: ini ? ini.tasks.filter(t => t.penting).length : 0,
    };
  });
}
