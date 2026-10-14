/* ==========================================================================
   Agenda semester: menggabungkan kalender dengan isi BRP kelima mata kuliah.

   Modul ini menarik seluruh data matkul, jadi hanya boleh dipakai di server
   (halaman, route handler, penyusun email). Komponen klien memakai
   lib/kalender.ts yang tidak punya ketergantungan itu.
   ========================================================================== */
import { COURSES } from './courses';
import { DEADLINE_FLAGS, parseFlag, stripEmoji, type Flagged } from './text';
import type { Day } from './types';
import {
  addDays, mondayOf, parseYmd, todayYmd, weekStartYmd,
  DAY_NAMES, diffDays, EXAM_RANGES, fmtRange, SEMESTER_START, TOTAL_WEEKS, weekIndexOf, ymd,
} from './kalender';

export * from './kalender';

/* Offset penomoran minggu per matkul. Sejak semua BRP dipetakan ke minggu
   kalender (w.n = minggu ke-n semester), tidak ada lagi matkul yang menyimpang;
   penomoran khas matkul cukup ditaruh di w.label. Peta ini dibiarkan ada agar
   kasus serupa nanti bisa ditangani tanpa mengubah pemanggilnya. */
const WEEK_OFFSET: Record<string, number> = {};

/* ------------------------------------------- agenda tetap dari 5 BRP */
export interface WeekEvent {
  cid: string;
  short: string;
  kelas: string;
  accent: string;
  accentOn: string;
  label: string;
  title: string;
  isExam: boolean;
  tasks: Flagged[];
}

export interface Deadline extends Flagged {
  cid: string;
  short: string;
  accent: string;
}

export interface SemesterWeek {
  i: number;
  n: number;
  key: string;
  start: string;
  end: string;
  isCurrent: boolean;
  isPast: boolean;
  exam: string | null;
  events: WeekEvent[];
  deadlines: Deadline[];
  taskCount: number;
}

function buildEvents(): Record<number, WeekEvent[]> {
  const map: Record<number, WeekEvent[]> = {};
  COURSES.forEach(c => {
    const off = WEEK_OFFSET[c.id] ?? 1;
    c.weeks.forEach(w => {
      const gi = w.n - off;
      if (gi < 0 || gi >= TOTAL_WEEKS) return;
      const tasks = (w.tasks || []).map(parseFlag).filter(t => t.text);
      (map[gi] = map[gi] || []).push({
        cid: c.id,
        short: c.short,
        kelas: c.kelas,
        accent: c.accent,
        accentOn: c.accentOn,
        label: w.label || `Minggu ${w.n}`,
        title: stripEmoji(w.title),
        isExam: w.flag === 'exam',
        tasks,
      });
    });
  });
  return map;
}

const EVENTS = buildEvents();

export const EVENT_STATS = (() => {
  let sessions = 0;
  let deadlines = 0;
  Object.values(EVENTS).forEach(list => {
    sessions += list.length;
    list.forEach(ev => {
      deadlines += ev.tasks.filter(t => DEADLINE_FLAGS.has(t.flag)).length;
    });
  });
  return { sessions, deadlines };
})();

/* --------------------------------------------------- bangun kalender */
export function buildWeeks(today: string = todayYmd()): SemesterWeek[] {
  const todayMonday = mondayOf(today);
  const out: SemesterWeek[] = [];
  for (let i = 0; i < TOTAL_WEEKS; i++) {
    const start = weekStartYmd(i);
    const end = ymd(addDays(parseYmd(start), 6));
    const exam = EXAM_RANGES.find(r => start <= r.to && end >= r.from);
    const events = EVENTS[i] || [];
    const deadlines: Deadline[] = events.flatMap(ev =>
      ev.tasks
        .filter(t => DEADLINE_FLAGS.has(t.flag))
        .map(t => ({ ...t, cid: ev.cid, short: ev.short, accent: ev.accent })),
    );
    out.push({
      i,
      n: i + 1,
      key: start,
      start,
      end,
      isCurrent: start === todayMonday,
      isPast: start < todayMonday,
      exam: exam ? exam.label : null,
      events,
      deadlines,
      taskCount: events.reduce((a, ev) => a + ev.tasks.length, 0),
    });
  }
  return out;
}

export function currentWeek(today: string = todayYmd()): SemesterWeek | null {
  return buildWeeks(today).find(w => w.isCurrent) || null;
}

export function nextWeek(today: string = todayYmd()): SemesterWeek | null {
  const weeks = buildWeeks(today);
  return weeks[weekIndexOf(today) + 1] || null;
}

/* ------------------------------------------------ jadwal kuliah harian */
export interface DaySession {
  day: Day;
  from: string;
  to: string;
  room: string;
  kind: string;
  cid: string;
  short: string;
  kelas: string;
  accent: string;
  accentOn: string;
  name: string;
}

export function sessionsOnDay(day: Day): DaySession[] {
  const out: DaySession[] = [];
  COURSES.forEach(c => {
    c.sessions.forEach(s => {
      if (s.day === day) {
        out.push({
          ...s,
          cid: c.id,
          short: c.short,
          kelas: c.kelas,
          accent: c.accent,
          accentOn: c.accentOn,
          name: c.name,
        });
      }
    });
  });
  return out.sort((a, b) => a.from.localeCompare(b.from));
}

export function weeklyTimetable() {
  return ([1, 2, 3, 4, 5] as Day[]).map(day => ({
    day,
    name: DAY_NAMES[day],
    sessions: sessionsOnDay(day),
  }));
}
