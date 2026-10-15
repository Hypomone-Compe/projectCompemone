import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import CourseTabs from '@/components/course/CourseTabs';
import { ChecklistMatkul, CourseStatus } from '@/components/course/CourseStatus';
import GradeCalculator from '@/components/course/GradeCalculator';
import HardTopics from '@/components/course/HardTopics';
import Rubrics from '@/components/course/Rubrics';
import Topics from '@/components/course/Topics';
import WeeklyPlan from '@/components/course/WeeklyPlan';
import { Rich } from '@/components/kit';
import PageHeader from '@/components/site/PageHeader';
import { Badge } from '@/components/ui';
import { byId, COURSES, shortName } from '@/lib/courses';
import { currentWeek, DAY_SHORT, todayYmd } from '@/lib/plan';
import { ringkasMatkul, type MingguRingkas } from '@/lib/ringkasan-matkul';
import { parseFlag, stripEmoji } from '@/lib/text';

/* Dinamis: tab "Ringkasan" menampilkan minggu berjalan & kelas berikutnya,
   dan keduanya bergantung pada hari ini. Satu orang pemakai, jadi render per
   kunjungan jauh lebih berharga daripada cache CDN. */
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = byId[id];
  return { title: c ? shortName(c) : 'Tidak ditemukan' };
}

const RES_LABEL: Record<string, string> = { yt: 'Video', web: 'Web', tool: 'Alat', book: 'Buku', pdf: 'PDF' };

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ id }, { tab }] = await Promise.all([params, searchParams]);
  const c = byId[id];
  if (!c) notFound();

  const k = ringkasMatkul().find(x => x.id === c.id)!;
  const cur = currentWeek(todayYmd());
  const idx = COURSES.findIndex(x => x.id === c.id);
  const nextCourse = COURSES[(idx + 1) % COURSES.length];
  const hardCount = c.topics.filter(t => t.d === 3).length;
  const vars = { '--c': c.accent, '--c-on': c.accentOn, '--c-pale': c.pale, '--c-emph': c.accent } as CSSProperties;

  const ringkasan = (
    <div className="space-y-4">
      <CourseStatus c={k} />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <MingguKartu judul="Minggu ini" m={k.mingguIni} kuat />
          <ChecklistMatkul cid={c.id} mingguKey={cur?.key ?? null} saran={(k.mingguIni?.tasks || []).filter(t => t.penting).map(t => t.text)} />
        </div>
        <div className="space-y-4">
          <MingguKartu judul="Minggu depan" m={k.mingguDepan} />
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">Jadwal tetap</p>
            <ul className="mt-3 divide-y divide-divider">
              {c.sessions.map((s, i) => (
                <li key={i} className="flex items-baseline gap-3 py-2.5 text-sm">
                  <span className="w-10 font-extrabold text-c">{DAY_SHORT[s.day]}</span>
                  <span className="num w-28 shrink-0 font-bold">
                    {s.from}–{s.to}
                  </span>
                  <span className="min-w-0 flex-1 text-secondary">{s.room}</span>
                  {s.kind !== 'Kelas' && <Badge variant="outline">{s.kind}</Badge>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">Informasi umum</p>
          <p className="mt-3 text-[15px] leading-relaxed text-secondary">{stripEmoji(c.desc)}</p>
          <dl className="mt-4 divide-y divide-divider border-t border-divider">
            {c.meta.map((m, i) => (
              <div key={i} className="grid gap-1 py-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
                <dt className="text-[13px] font-bold text-muted">{m.k}</dt>
                <dd className="text-[14px] leading-relaxed">{stripEmoji(m.v)}</dd>
              </div>
            ))}
          </dl>
        </div>
        {c.books.length > 0 && (
          <div className="rounded-2xl bg-navy p-5 text-white shadow-lg sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-light">Buku acuan</p>
            <ul className="mt-4 space-y-4">
              {c.books.map((b, i) => (
                <li key={i}>
                  <p className="text-[15px] font-bold leading-snug">{b.t}</p>
                  <p className="mt-1 text-[12.5px] leading-snug text-white/60">{b.by}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const nilai = (
    <>
      <Judul eyebrow="Rubrik & kalkulator" judul="Nilai bukan misteri. Hitung saja." ket="Tiap komponen dipecah per instansi (Lab 1, Lab 2, …). Tekan + kalau jumlah sebenarnya berbeda dari BRP. Tersimpan otomatis dan tersinkron ke HP." />
      <GradeCalculator cid={c.id} grading={c.grading} />
      {c.rubrics && c.rubrics.length > 0 && <Rubrics rubrics={c.rubrics} />}
    </>
  );

  const rencana = (
    <>
      <Judul eyebrow="Rencana mingguan" judul="Tujuh belas minggu, sudah terpetakan." ket="Isi tiap minggu menurut BRP, dipetakan ke tanggal semester ini. Minggu berjalan disorot." />
      <WeeklyPlan cid={c.id} weeks={c.weeks} />
    </>
  );

  const materi = (
    <>
      <Judul eyebrow="Materi & Feynman" judul="Kalau belum bisa dijelaskan sederhana, belum paham." ket="Tandai status tiap topik dan jelaskan ulang dengan bahasamu sendiri. Persentase pemahaman di beranda dihitung dari sini." />
      <Topics cid={c.id} topics={c.topics} />
      {(hardCount > 0 || (c.traps && c.traps.length > 0)) && (
        <div className="mt-14">
          <Judul eyebrow="Perhatian ekstra" judul="Di sinilah nilai biasanya bocor." ket="Topik berbobot berat dan kesalahan yang paling sering merugikan nilai di matkul ini." />
          <HardTopics cid={c.id} topics={c.topics} traps={c.traps} />
        </div>
      )}
    </>
  );

  const strategi = (
    <>
      <Judul eyebrow="Strategi" judul="Bukan tips umum. Diturunkan dari rubriknya." />
      <ol className="grid gap-3 md:grid-cols-2">
        {c.strategy.map((s, i) => {
          const t = parseFlag(s.t);
          const d = parseFlag(s.d);
          return (
            <li key={i} className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <span className="num text-2xl font-extrabold text-c">{String(i + 1).padStart(2, '0')}</span>
              <Rich as="h3" html={t.text.replace(/^\d+\.\s*/, '')} className="mt-2 block text-[16px] font-extrabold leading-snug tracking-tight" />
              <Rich as="p" html={d.text} className="mt-2 block text-[14px] leading-relaxed text-secondary" />
            </li>
          );
        })}
      </ol>
    </>
  );

  const sumber = (
    <>
      <Judul eyebrow="Sumber belajar" judul="Dipilih karena cocok dengan silabus." ket="Yang bertanda Prioritas paling layak dibuka duluan." />
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {c.resources.map((r, i) => {
          const note = parseFlag(r.note);
          const isi = (
            <>
              <span className="flex items-center justify-between gap-3">
                <span className="rounded-full px-2.5 py-0.5 text-[11.5px] font-bold" style={{ background: c.pale, color: c.accent }}>
                  {RES_LABEL[r.type] || 'Sumber'}
                </span>
                {note.flag === 'star' && <Badge variant="pink">Prioritas</Badge>}
              </span>
              <span className="mt-3 block text-[16px] font-extrabold leading-snug tracking-tight">{r.t}</span>
              {note.text && <span className="mt-1.5 block text-[13.5px] leading-relaxed text-secondary">{note.text}</span>}
              <span className="mt-3 flex items-center gap-1.5 truncate text-[12px] font-semibold text-muted">
                {r.url ? (
                  <>
                    <ExternalLink aria-hidden className="size-3.5 shrink-0" />
                    {r.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </>
                ) : (
                  'Buku cetak, cari di perpustakaan'
                )}
              </span>
            </>
          );
          return (
            <li key={i}>
              {r.url ? (
                <a href={r.url} target="_blank" rel="noreferrer" className="block h-full rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
                  {isi}
                </a>
              ) : (
                <div className="h-full rounded-2xl border border-border bg-surface p-5">{isi}</div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );

  return (
    <div style={vars}>
      <PageHeader
        crumbs={[{ label: 'Beranda', href: '/' }, { label: 'Mata kuliah' }, { label: shortName(c) }]}
        badge={
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Kelas {c.kelas}</Badge>
            <Badge variant="outline">{c.sks} SKS</Badge>
            <Badge variant="outline">{c.code}</Badge>
            {c.fokus && (
              <Badge variant="pink" dot>
                Prioritas semester ini
              </Badge>
            )}
          </div>
        }
        title={c.name}
        emph={`Kelas ${c.kelas}`}
        accent={c.accent}
        description={stripEmoji(c.tagline)}
      />

      <CourseTabs initial={tab || 'ringkasan'} panels={{ ringkasan, nilai, rencana, materi, strategi, sumber }} />

      <div className="shell pb-16">
        <Link
          href={`/matkul/${nextCourse.id}`}
          className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted">Matkul berikutnya</span>
            <span className="mt-1 block text-2xl font-extrabold tracking-tight">
              {nextCourse.name} <span style={{ color: nextCourse.accent }}>{nextCourse.kelas}</span>
            </span>
          </span>
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full text-white transition-transform group-hover:translate-x-1" style={{ background: nextCourse.accent }}>
            <ArrowRight aria-hidden className="size-5" />
          </span>
        </Link>
      </div>
    </div>
  );
}

function Judul({ eyebrow, judul, ket }: { eyebrow: string; judul: string; ket?: string }) {
  return (
    <div className="mb-6 max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-c">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{judul}</h2>
      {ket && <p className="mt-3 text-[15.5px] leading-relaxed text-secondary">{ket}</p>}
    </div>
  );
}

function MingguKartu({ judul, m, kuat }: { judul: string; m: MingguRingkas | null; kuat?: boolean }) {
  return (
    <div className={kuat ? 'rounded-2xl bg-navy p-5 text-white shadow-lg sm:p-6' : 'rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6'}>
      <div className="flex items-baseline justify-between gap-3">
        <p className={`text-xs font-bold uppercase tracking-[0.2em] ${kuat ? 'text-pink-light' : 'text-muted'}`}>{judul}</p>
        {m && <p className={`num text-[12.5px] font-semibold ${kuat ? 'text-white/60' : 'text-muted'}`}>{m.range}</p>}
      </div>
      {m ? (
        <>
          <p className="mt-2 text-[16px] font-extrabold leading-snug">
            {m.label} · {m.title}
          </p>
          {m.tasks.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {m.tasks.map((t, i) => (
                <li key={i} className="flex gap-2.5 text-[14px] leading-snug">
                  <span
                    className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      t.penting ? 'bg-accent text-white' : kuat ? 'bg-white/10 text-white/80' : 'bg-navy-5 text-secondary'
                    }`}
                  >
                    {t.label || 'Info'}
                  </span>
                  <span className={kuat ? 'text-white/85' : 'text-secondary'}>{t.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`mt-2 text-[14px] ${kuat ? 'text-white/70' : 'text-muted'}`}>Tidak ada tugas tercatat di BRP.</p>
          )}
        </>
      ) : (
        <p className={`mt-2 text-[14px] ${kuat ? 'text-white/70' : 'text-muted'}`}>Tidak ada pertemuan.</p>
      )}
    </div>
  );
}
