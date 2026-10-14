/* ==========================================================================
   Ringkasan mingguan → email.

   Isi email dibangun dari data BRP yang statis (lib/courses), jadi cron di
   Vercel tidak perlu database: apa saja tugas minggu ini sudah bisa dihitung
   dari nomor minggu. Checklist pribadi tetap tinggal di browser.

   Pengiriman lewat REST API Resend memakai fetch biasa, tanpa SDK tambahan.
   ========================================================================== */
import { byId, shortName } from './courses';
import {
  buildWeeks, currentWeek, DAY_NAMES, fmtDateLong, fmtRange, nextWeek, parseYmd,
  semesterStatus, sessionsOnDay, todayYmd, type SemesterStatus, type SemesterWeek,
} from './plan';
import { ACARA_FLAGS, DEADLINE_FLAGS, FLAG_LABEL, type Flag, type Flagged } from './text';
import type { Day } from './types';

export const RECIPIENT = (process.env.NOTIFY_TO || process.env.AUTH_EMAIL || '').trim();
const FROM = process.env.NOTIFY_FROM || 'Sandbox <onboarding@resend.dev>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || '';

/* --------------------------------------------------------------- konten */
interface CourseBlock {
  cid: string;
  name: string;
  accent: string;
  label: string;
  title: string;
  tasks: Flagged[];
}

interface WeekBlock {
  n: number;
  range: string;
  exam: string | null;
  deadlineCount: number;
  courses: CourseBlock[];
}

function weekBlock(w: SemesterWeek | null): WeekBlock | null {
  if (!w) return null;
  return {
    n: w.n,
    range: fmtRange(w.start, w.end),
    exam: w.exam,
    deadlineCount: w.deadlines.length,
    courses: w.events
      .filter(e => e.tasks.length || e.isExam)
      .map(e => ({
        cid: e.cid,
        name: shortName(byId[e.cid]),
        accent: byId[e.cid].accent,
        label: e.label,
        title: e.title,
        tasks: e.tasks,
      })),
  };
}

/** Satu kuis, sesi lab, atau demo yang jatuh pekan ini atau pekan depan. */
export interface Acara {
  cid: string;
  name: string;
  accent: string;
  /** "Kuis", "Lab", atau "Demo", dari FLAG_LABEL. */
  jenis: string;
  text: string;
  pekan: 'ini' | 'depan';
}

export interface Sesi {
  name: string;
  accent: string;
  time: string;
  room: string;
  kind: string;
}

export interface Digest {
  today: string;
  /** Nama hari saat email disusun, mis. "Jumat". */
  hari: string;
  status: SemesterStatus;
  headline: string;
  subjek: string;
  current: WeekBlock | null;
  next: WeekBlock | null;
  /** Kuis, lab, dan demo dari BRP; pekan ini lebih dulu, lalu pekan depan. */
  acara: Acara[];
  /** Sesi kuliah pada hari email ini dikirim. */
  sesiHariIni: Sesi[];
  /** Slot lab tetap sepanjang semester, dari jadwal SIAK. */
  labTetap: { hari: string; name: string; accent: string; time: string; room: string }[];
  remaining: { n: number; range: string; count: number }[];
  timetable: { day: string; sessions: Sesi[] }[];
}

/* Mengumpulkan acara terjadwal (kuis / lab / demo) dari satu pekan. Deadline
   pengumpulan sengaja tidak ikut: yang dikumpulkan masih bisa dikerjakan
   setelah jam sibuk, sedangkan yang terjadwal hilang begitu jamnya lewat. */
function acaraPekan(w: SemesterWeek | null, pekan: 'ini' | 'depan'): Acara[] {
  if (!w) return [];
  return w.events.flatMap(e =>
    e.tasks
      .filter(t => ACARA_FLAGS.has(t.flag))
      .map(t => ({
        cid: e.cid,
        name: shortName(byId[e.cid]),
        accent: byId[e.cid].accent,
        jenis: FLAG_LABEL[t.flag as Exclude<Flag, null>] || 'Acara',
        text: t.text,
        pekan,
      })),
  );
}

export function buildDigest(today: string = todayYmd()): Digest {
  const status = semesterStatus(today);
  const mingguIni = currentWeek(today);
  const mingguDepan = nextWeek(today);
  const cur = weekBlock(mingguIni);
  const next = weekBlock(mingguDepan);

  const remaining = buildWeeks(today)
    .filter(w => !w.isPast && w.deadlines.length)
    .slice(0, 6)
    .map(w => ({ n: w.n, range: fmtRange(w.start, w.end), count: w.deadlines.length }));

  const sesi = (d: Day): Sesi[] =>
    sessionsOnDay(d).map(s => ({
      name: shortName(byId[s.cid]),
      accent: s.accent,
      time: `${s.from}–${s.to}`,
      room: s.room,
      kind: s.kind,
    }));

  const timetable = ([1, 2, 3, 4, 5] as Day[]).map(d => ({ day: DAY_NAMES[d], sessions: sesi(d) }));

  /* getUTCDay() memberi 0 untuk Minggu, dan tidak ada kelas di hari itu. */
  const dow = parseYmd(today).getUTCDay();
  const sesiHariIni = dow >= 1 && dow <= 5 ? sesi(dow as Day) : [];

  /* Slot lab tetap dikumpulkan dari jadwal SIAK, bukan dari rencana mingguan:
     ini yang berulang tiap pekan dan paling sering tertukar harinya. */
  const labTetap = ([1, 2, 3, 4, 5] as Day[]).flatMap(d =>
    sesi(d)
      .filter(x => x.kind === 'Lab')
      .map(x => ({ hari: DAY_NAMES[d], name: x.name, accent: x.accent, time: x.time, room: x.room })),
  );

  const acara = [...acaraPekan(mingguIni, 'ini'), ...acaraPekan(mingguDepan, 'depan')];

  const headline = cur
    ? `Minggu ${String(cur.n).padStart(2, '0')} · ${cur.deadlineCount} deadline`
    : status.phase === 'pre'
      ? `Semester mulai ${status.daysToStart} hari lagi`
      : 'Semester sudah selesai';

  const acaraIni = acara.filter(a => a.pekan === 'ini').length;
  const subjek = acaraIni ? `${headline} · ${acaraIni} kuis/lab` : headline;

  return {
    today,
    hari: DAY_NAMES[dow],
    status,
    headline,
    subjek,
    current: cur,
    next,
    acara,
    sesiHariIni,
    labTetap,
    remaining,
    timetable,
  };
}

/* --------------------------------------------------------------- render */
const esc = (s: unknown): string =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/* Palet sama dengan situs. Email tidak bisa memuat webfont, jadi Poppins
   diganti stack sans sistem dan Instrument Serif diganti Georgia. */
const PAPER = '#f3f0e7';
const INK = '#12120f';
const MUTE = '#66665c';
const RULE = '#d5d0c2';
const WHITE = '#ffffff';
const LIME = '#c9f24d';
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const SERIF = "Georgia, 'Iowan Old Style', serif";

function eyebrow(text: string, color = MUTE) {
  return `<div style="font:500 11px/1 ${SANS};letter-spacing:.18em;text-transform:uppercase;color:${color};">${esc(text)}</div>`;
}

function taskRows(courses: CourseBlock[]) {
  if (!courses.length) {
    return `<p style="margin:0;font:400 14px/1.6 ${SANS};color:${MUTE};">Tidak ada tugas terjadwal. Pakai untuk mengejar materi yang tertinggal.</p>`;
  }
  return courses
    .map(
      c => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 10px;background:${WHITE};border:1px solid ${RULE};border-left:4px solid ${c.accent};border-radius:4px;">
      <tr><td style="padding:14px 16px;">
        <div style="font:600 11px/1 ${SANS};letter-spacing:.14em;text-transform:uppercase;color:${c.accent};">${esc(c.name)}<span style="color:${MUTE};font-weight:500;"> &nbsp;·&nbsp; ${esc(c.label)}</span></div>
        <div style="margin-top:7px;font:700 16px/1.25 ${SANS};letter-spacing:-.02em;color:${INK};">${esc(c.title)}</div>
        ${
          c.tasks.length
            ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:9px;">${c.tasks
                .map(
                  t => `<tr>
              <td width="14" style="vertical-align:top;padding:3px 0 0;"><div style="width:5px;height:5px;border-radius:50%;background:${DEADLINE_FLAGS.has(t.flag) ? c.accent : RULE};margin-top:6px;"></div></td>
              <td style="font:400 13px/1.6 ${SANS};color:#3d3d35;padding-bottom:3px;">${esc(t.text)}${
                DEADLINE_FLAGS.has(t.flag)
                  ? ` <span style="font:600 9px/1 ${SANS};letter-spacing:.12em;text-transform:uppercase;color:${c.accent};">${penandaFlag(t.flag)}</span>`
                  : ''
              }</td></tr>`,
                )
                .join('')}</table>`
            : ''
        }
      </td></tr>
    </table>`,
    )
    .join('');
}

function timetableBlock(timetable: Digest['timetable']) {
  return timetable
    .map(d => {
      if (!d.sessions.length) return '';
      return `<tr>
      <td style="padding:10px 0;border-bottom:1px solid ${RULE};vertical-align:top;width:74px;">
        <span style="font:600 11px/1.4 ${SANS};letter-spacing:.12em;text-transform:uppercase;color:${MUTE};">${esc(d.day)}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid ${RULE};">
        ${d.sessions
          .map(
            s => `<div style="font:400 13px/1.7 ${SANS};color:#3d3d35;">
          <span style="font-weight:600;color:${INK};">${esc(s.time)}</span>
          &nbsp;<span style="color:${s.accent};font-weight:700;">${esc(s.name)}</span>
          ${s.kind !== 'Kelas' ? `<span style="font:600 9px ${SANS};letter-spacing:.1em;text-transform:uppercase;color:${MUTE};"> ${esc(s.kind)}</span>` : ''}
          &nbsp;<span style="color:${MUTE};">${esc(s.room)}</span>
        </div>`,
          )
          .join('')}
      </td>
    </tr>`;
    })
    .join('');
}

/** Label pendek di ujung baris tugas. Empat jenis, bukan lagi dua: kuis dan
    lab menuntut kehadiran pada jam tertentu, sedangkan deadline hanya
    menuntut berkas terkirim sebelum batas waktu. */
function penandaFlag(flag: Flagged['flag']): string {
  if (flag === 'quiz') return 'KUIS';
  if (flag === 'lab') return 'LAB';
  if (flag === 'demo') return 'DEMO';
  return 'DEADLINE';
}

/* Blok pengingat kuis & lab. Ditaruh paling atas, sebelum daftar tugas:
   inilah yang hangus kalau terlewat, sementara tugas masih bisa dikejar. */
function acaraBlock(acara: Acara[], labTetap: Digest['labTetap']) {
  if (!acara.length && !labTetap.length) return '';

  const ini = acara.filter(a => a.pekan === 'ini');
  const depan = acara.filter(a => a.pekan === 'depan');

  const baris = (a: Acara) => `<tr>
      <td width="52" style="vertical-align:top;padding:7px 0;">
        <span style="display:inline-block;font:700 9px/1 ${SANS};letter-spacing:.1em;text-transform:uppercase;color:${WHITE};background:${a.accent};padding:4px 6px;border-radius:3px;">${esc(a.jenis)}</span>
      </td>
      <td style="padding:7px 0 7px 10px;font:400 13px/1.55 ${SANS};color:#3d3d35;">
        <span style="font-weight:700;color:${a.accent};">${esc(a.name)}</span> &nbsp;${esc(a.text)}
      </td>
    </tr>`;

  const bagian = (judul: string, daftar: Acara[]) =>
    daftar.length
      ? `<div style="margin-top:10px;">${eyebrow(judul)}</div>
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${daftar.map(baris).join('')}</table>`
      : '';

  const lab = labTetap.length
    ? `<div style="margin-top:14px;padding-top:12px;border-top:1px dashed ${RULE};">
        ${eyebrow('Slot lab tetap tiap pekan')}
        ${labTetap
          .map(
            l => `<div style="margin-top:6px;font:400 13px/1.6 ${SANS};color:#3d3d35;">
          <span style="font-weight:600;color:${INK};">${esc(l.hari)} ${esc(l.time)}</span>
          &nbsp;<span style="color:${l.accent};font-weight:700;">${esc(l.name)}</span>
          &nbsp;<span style="color:${MUTE};">${esc(l.room)}</span>
        </div>`,
          )
          .join('')}
      </div>`
    : '';

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${WHITE};border:1px solid ${RULE};border-left:4px solid ${INK};border-radius:4px;">
    <tr><td style="padding:16px 18px;">
      <div style="font:700 12px/1 ${SANS};letter-spacing:.14em;text-transform:uppercase;color:${INK};">Kuis &amp; lab</div>
      ${
        ini.length || depan.length
          ? `${bagian(`Pekan ini · ${ini.length} acara`, ini)}${bagian(`Pekan depan · ${depan.length} acara`, depan)}`
          : `<p style="margin:8px 0 0;font:400 13px/1.6 ${SANS};color:${MUTE};">Tidak ada kuis atau tutorial lab terjadwal dua pekan ini.</p>`
      }
      ${lab}
    </td></tr>
  </table>`;
}

/* Sesi kuliah pada hari email dikirim. Karena email jatuh Senin, Rabu, dan
   Jumat pagi, blok ini praktis jadi rundown hari itu. */
function hariIniBlock(hari: string, sesi: Sesi[]) {
  if (!sesi.length) return '';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${LIME};border-radius:4px;">
    <tr><td style="padding:15px 18px;">
      <div style="font:700 11px/1 ${SANS};letter-spacing:.16em;text-transform:uppercase;color:${INK};">Hari ini, ${esc(hari)}</div>
      ${sesi
        .map(
          x => `<div style="margin-top:8px;font:400 13px/1.6 ${SANS};color:${INK};">
        <span style="font-weight:700;">${esc(x.time)}</span>
        &nbsp;${esc(x.name)}
        ${x.kind !== 'Kelas' ? `<span style="font:700 9px ${SANS};letter-spacing:.1em;text-transform:uppercase;"> ${esc(x.kind)}</span>` : ''}
        &nbsp;<span style="opacity:.66;">${esc(x.room)}</span>
      </div>`,
        )
        .join('')}
    </td></tr>
  </table>`;
}

export function renderDigestHtml(d: Digest): string {
  const cur = d.current;
  const cta = SITE_URL
    ? `<a href="${esc(SITE_URL)}" style="display:inline-block;background:${INK};color:${PAPER};text-decoration:none;font:600 12px/1 ${SANS};letter-spacing:.12em;text-transform:uppercase;padding:15px 26px;border-radius:999px;">Buka monitoring →</a>`
    : `<span style="font:400 12px ${SANS};color:${MUTE};">Set NEXT_PUBLIC_SITE_URL agar tombol ke situs muncul di sini.</span>`;

  return `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.subjek)}</title></head>
<body style="margin:0;padding:0;background:${PAPER};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(d.subjek)}, agenda kuliah minggu ini.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};">
<tr><td align="center" style="padding:0 14px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;">

  <!-- kepala gelap -->
  <tr><td style="background:${INK};padding:26px 26px 30px;border-radius:0 0 4px 4px;">
    <table role="presentation" width="100%"><tr>
      <td style="font:800 17px/1 ${SANS};letter-spacing:-.04em;color:${PAPER};">SANDBOX</td>
      <td align="right">${eyebrow('Gasal 26 / 27', '#93938a')}</td>
    </tr></table>

    <div style="margin-top:26px;">${eyebrow(fmtDateLong(d.today), '#93938a')}</div>

    <h1 style="margin:12px 0 0;font:800 46px/0.88 ${SANS};letter-spacing:-.05em;color:${PAPER};">
      ${
        cur
          ? `Minggu<br><span style="color:${LIME};">${String(cur.n).padStart(2, '0')}</span>`
          : `<span style="font-family:${SERIF};font-style:italic;font-weight:400;letter-spacing:-.02em;">${esc(d.headline)}</span>`
      }
    </h1>

    ${
      cur
        ? `<div style="margin-top:14px;font:500 13px ${SANS};letter-spacing:.06em;color:#93938a;">${esc(cur.range)}${cur.exam ? ` &nbsp;·&nbsp; <span style="color:${LIME};">PEKAN ${esc(cur.exam)}</span>` : ''}</div>`
        : ''
    }
  </td></tr>

  ${d.sesiHariIni.length ? `<tr><td style="padding:22px 4px 0;">${hariIniBlock(d.hari, d.sesiHariIni)}</td></tr>` : ''}

  ${
    d.status.phase === 'run'
      ? `<tr><td style="padding:14px 4px 0;">${acaraBlock(d.acara, d.labTetap)}</td></tr>`
      : ''
  }

  ${
    cur
      ? `<tr><td style="padding:26px 4px 0;">
    <div style="border-top:2px solid ${INK};padding-top:14px;margin-bottom:14px;">
      ${eyebrow(`Minggu ini · ${cur.deadlineCount} deadline`, INK)}
    </div>
    ${taskRows(cur.courses)}
  </td></tr>`
      : ''
  }

  ${
    d.next
      ? `<tr><td style="padding:26px 4px 0;">
    <div style="border-top:1px solid ${RULE};padding-top:14px;margin-bottom:14px;">
      ${eyebrow(`Minggu depan · M${String(d.next.n).padStart(2, '0')} · ${d.next.range}`)}
    </div>
    ${taskRows(d.next.courses)}
  </td></tr>`
      : ''
  }

  <tr><td style="padding:26px 4px 0;">
    <div style="border-top:1px solid ${RULE};padding-top:14px;margin-bottom:6px;">
      ${eyebrow('Jadwal kuliah tetap')}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${timetableBlock(d.timetable)}</table>
  </td></tr>

  ${
    d.remaining.length
      ? `<tr><td style="padding:26px 4px 0;">
    <div style="border-top:1px solid ${RULE};padding-top:14px;margin-bottom:10px;">
      ${eyebrow('Deadline berikutnya')}
    </div>
    ${d.remaining
      .map(
        r => `<div style="font:400 13px/1.9 ${SANS};color:#3d3d35;">
      <span style="font-weight:700;color:${INK};">M${String(r.n).padStart(2, '0')}</span>
      &nbsp;${esc(r.range)} &nbsp;<span style="color:${MUTE};">, ${r.count} item</span>
    </div>`,
      )
      .join('')}
  </td></tr>`
      : ''
  }

  <tr><td style="padding:32px 4px 0;">${cta}</td></tr>

  <tr><td style="padding:26px 4px 0;">
    <p style="margin:0;padding-top:16px;border-top:1px solid ${RULE};font:400 11px/1.7 ${SANS};color:${MUTE};">
      Dikirim otomatis dari Sandbox, situs monitoring pribadimu. Agenda disusun dari BRP tiap mata kuliah, 
      selalu verifikasi ke SCeLE dan pengumuman dosen sebelum bergantung padanya.
    </p>
  </td></tr>

</table></td></tr></table></body></html>`;
}

export function renderDigestText(d: Digest): string {
  const L: string[] = ['SANDBOX, Gasal 2026/2027', fmtDateLong(d.today), '', d.headline.toUpperCase()];

  if (d.sesiHariIni.length) {
    L.push('', `HARI INI, ${d.hari.toUpperCase()}`);
    d.sesiHariIni.forEach(x => L.push(`  ${x.time} ${x.name}${x.kind !== 'Kelas' ? ` [${x.kind}]` : ''} (${x.room})`));
  }

  if (d.status.phase === 'run') {
    L.push('', 'KUIS & LAB');
    if (d.acara.length) {
      d.acara.forEach(a =>
        L.push(`  [${a.jenis.toUpperCase()}] ${a.name}, ${a.text}  (pekan ${a.pekan})`),
      );
    } else {
      L.push('  Tidak ada kuis atau tutorial lab terjadwal dua pekan ini.');
    }
    if (d.labTetap.length) {
      L.push('  Slot lab tetap:');
      d.labTetap.forEach(l => L.push(`    ${l.hari} ${l.time} ${l.name} (${l.room})`));
    }
  }

  if (d.current) {
    L.push(`Minggu ${d.current.n} · ${d.current.range}${d.current.exam ? ` · PEKAN ${d.current.exam}` : ''}`, '');
    d.current.courses.forEach(c => {
      L.push(`[${c.name}] ${c.title}`);
      c.tasks.forEach(t => L.push(`  - ${t.text}${DEADLINE_FLAGS.has(t.flag) ? `  (${penandaFlag(t.flag)})` : ''}`));
    });
    if (!d.current.courses.length) L.push('Tidak ada tugas terjadwal minggu ini.');
  }

  if (d.next) {
    L.push('', `MINGGU DEPAN, Minggu ${d.next.n} · ${d.next.range}`);
    d.next.courses.forEach(c => {
      L.push(`[${c.name}] ${c.title}`);
      c.tasks.forEach(t => L.push(`  - ${t.text}`));
    });
  }

  L.push('', 'JADWAL KULIAH TETAP');
  d.timetable.forEach(day => {
    if (!day.sessions.length) return;
    L.push(`${day.day}: ${day.sessions.map(s => `${s.time} ${s.name} (${s.room})`).join(' | ')}`);
  });

  if (SITE_URL) L.push('', SITE_URL);
  return L.join('\n');
}

/* ------------------------------------------------------------- kirim */
export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export interface SendResult {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  status?: number;
  error?: string;
  id?: string;
  to?: string;
  subject: string;
}

export async function sendDigest({
  to = RECIPIENT,
  digest,
}: { to?: string; digest?: Digest } = {}): Promise<SendResult> {
  const d = digest || buildDigest();
  const subject = `[Sandbox] ${d.subjek}`;

  if (!emailConfigured()) {
    return { ok: false, skipped: true, reason: 'RESEND_API_KEY belum di-set.', subject };
  }

  if (!to) {
    return { ok: false, skipped: true, reason: 'Alamat penerima kosong: set NOTIFY_TO atau AUTH_EMAIL.', subject };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject,
      html: renderDigestHtml(d),
      text: renderDigestText(d),
    }),
  });

  const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!res.ok) {
    return { ok: false, status: res.status, error: body?.message || 'Gagal mengirim email.', subject };
  }
  return { ok: true, id: body?.id, to, subject };
}
