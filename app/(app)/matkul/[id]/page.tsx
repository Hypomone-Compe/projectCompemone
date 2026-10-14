import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import SectionNav, { type NavSection } from '@/components/SectionNav';
import GradeCalculator from '@/components/course/GradeCalculator';
import HardTopics from '@/components/course/HardTopics';
import Rubrics from '@/components/course/Rubrics';
import Topics from '@/components/course/Topics';
import WeeklyPlan from '@/components/course/WeeklyPlan';
import { Mask, Reveal, Rich, SectionHead } from '@/components/ui';
import { byId, COURSES, shortName } from '@/lib/courses';
import { DAY_SHORT } from '@/lib/kalender';
import { parseFlag, stripEmoji } from '@/lib/text';

export function generateStaticParams() {
  return COURSES.map(c => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = byId[id];
  if (!c) return { title: 'Tidak ditemukan' };
  return { title: shortName(c) };
}

const SECTIONS: NavSection[] = [
  { id: 'info', num: '01', short: 'Info', title: 'Informasi umum' },
  { id: 'rubrik', num: '02', short: 'Rubrik', title: 'Rubrik & kalkulator' },
  { id: 'rencana', num: '03', short: 'Rencana', title: 'Rencana mingguan' },
  { id: 'materi', num: '04', short: 'Materi', title: 'Materi & Feynman' },
  { id: 'sulit', num: '05', short: 'Sulit', title: 'Perhatian ekstra' },
  { id: 'strategi', num: '06', short: 'Strategi', title: 'Strategi' },
  { id: 'sumber', num: '07', short: 'Sumber', title: 'Sumber belajar' },
];

const RES_LABEL: Record<string, string> = {
  yt: 'Video',
  web: 'Web',
  tool: 'Alat',
  book: 'Buku',
  pdf: 'PDF',
};

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = byId[id];
  if (!c) notFound();

  const idx = COURSES.findIndex(x => x.id === c.id);
  const nextCourse = COURSES[(idx + 1) % COURSES.length];

  const hardCount = c.topics.filter(t => t.d === 3).length;
  const sections = SECTIONS.filter(s => !(s.id === 'sulit' && !hardCount && !c.traps?.length));

  const vars = { '--c': c.accent, '--c-on': c.accentOn } as CSSProperties;

  return (
    <div style={vars}>
      {/* ============================ HERO ============================ */}
      <section className="on-dark relative overflow-hidden pb-[clamp(2rem,4vw,3rem)] pt-[clamp(2rem,5vw,3.5rem)]">
        <div className="hairline-grid" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} />
          ))}
        </div>

        <div className="shell relative z-10">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <span className="eyebrow eyebrow--c">
              <Link href="/" className="hover:underline">
                Beranda
              </Link>
              <span className="opacity-50">/</span>
              {String(idx + 1).padStart(2, '0')} · {shortName(c)}
            </span>
            <span className="num text-[0.7rem] muted">{c.code}</span>
          </div>

          <h1
            className="display mt-6"
            style={{ fontSize: 'clamp(2.4rem, 8vw, 6.4rem)', lineHeight: 0.86 }}
          >
            <Mask>{c.name}</Mask>
            <Mask delay={90}>
              <span className="serif" style={{ color: c.accent }}>
                kelas {c.kelas}
              </span>
            </Mask>
          </h1>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="chip chip--c">{c.sks} SKS</span>
            <span className="chip">{c.topics.length} topik</span>
            {hardCount > 0 && <span className="chip">{hardCount} topik berat</span>}
            <span className="chip">{c.grading.components.length} komponen nilai</span>
          </div>

          <blockquote className="kutipan mt-9 max-w-3xl">{stripEmoji(c.tagline)}</blockquote>
        </div>
      </section>

      <SectionNav sections={sections} />

      <div className="shell">
        {/* ========================= 01 · INFO ========================= */}
        <section className="section">
          <SectionHead
            id="info"
            eyebrow="01 · Informasi umum"
            judul={
              <>
                Siapa mengajar, kapan, dan <span className="serif">di ruang mana.</span>
              </>
            }
            lede={stripEmoji(c.desc)}
          />

          <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr]">
            <dl className="border-t border-[var(--rule)]">
              {c.meta.map((m, i) => (
                <div
                  key={i}
                  className="grid gap-1 border-b border-[var(--rule)] py-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6"
                >
                  <dt className="stat__label pt-1">{m.k}</dt>
                  <dd className="text-[0.9rem] leading-relaxed">{stripEmoji(m.v)}</dd>
                </div>
              ))}
            </dl>

            <div className="space-y-2.5">
              <div className="on-dark rounded-[var(--radius-lg)] p-6">
                <span className="eyebrow" style={{ color: c.accent }}>
                  Jadwal mingguan
                </span>
                <ul className="mt-5 space-y-4">
                  {c.sessions.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-baseline gap-4 border-b border-[var(--rule)] pb-4 last:border-b-0 last:pb-0"
                    >
                      <span
                        className="display w-12 shrink-0"
                        style={{ fontSize: '1.1rem', color: c.accent }}
                      >
                        {DAY_SHORT[s.day]}
                      </span>
                      <span className="num shrink-0 text-[0.85rem] font-semibold">
                        {s.from}–{s.to}
                      </span>
                      <span className="flex-1 text-right text-[0.75rem] leading-snug muted">
                        {s.room}
                        {s.kind !== 'Kelas' && (
                          <span className="ml-1.5 uppercase tracking-[0.1em]" style={{ color: c.accent }}>
                            {s.kind}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {c.books.length > 0 && (
                <div className="card">
                  <span className="eyebrow eyebrow--plain">Buku acuan</span>
                  <ul className="mt-4 space-y-4">
                    {c.books.map((b, i) => (
                      <li key={i}>
                        <div className="serif-up text-[1.15rem] leading-snug">{b.t}</div>
                        <div className="mt-1 text-[0.75rem] leading-snug muted">{b.by}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ======================= 02 · RUBRIK ======================= */}
        <section className="section">
          <SectionHead
            id="rubrik"
            eyebrow="02 · Rubrik & kalkulator"
            judul={
              <>
                Nilai bukan misteri. <span className="serif">Hitung saja.</span>
              </>
            }
            lede="Setiap komponen dipecah per instansi, Lab 1, Lab 2, dan seterusnya. Tekan + untuk menambah slot kalau jumlah sebenarnya berbeda dari BRP. Semua tersimpan otomatis di browser ini."
          />
          <GradeCalculator cid={c.id} grading={c.grading} />
          {c.rubrics && c.rubrics.length > 0 && <Rubrics rubrics={c.rubrics} />}
        </section>

        {/* ======================= 03 · RENCANA ======================= */}
        <section className="section">
          <SectionHead
            id="rencana"
            eyebrow="03 · Rencana mingguan"
            judul={
              <>
                Tujuh belas minggu, <span className="serif">sudah terpetakan.</span>
              </>
            }
            lede="Isi tiap minggu menurut BRP, dipetakan ke tanggal semester ini. Minggu berjalan disorot."
          />
          <WeeklyPlan cid={c.id} weeks={c.weeks} />
        </section>

        {/* ======================== 04 · MATERI ======================== */}
        <section className="section">
          <SectionHead
            id="materi"
            eyebrow="04 · Materi & Feynman"
            judul={
              <>
                Kalau belum bisa dijelaskan sederhana, <span className="serif">belum paham.</span>
              </>
            }
            lede="Untuk tiap topik: ringkasan, poin yang harus dikuasai, dan kotak untuk menjelaskan ulang dengan bahasamu sendiri."
          />
          <Topics cid={c.id} topics={c.topics} />
        </section>

        {/* ======================== 05 · SULIT ======================== */}
        {sections.some(s => s.id === 'sulit') && (
          <section className="section">
            <SectionHead
              id="sulit"
              eyebrow="05 · Perhatian ekstra"
              judul={
                <>
                  Di sinilah nilai <span className="serif">biasanya bocor.</span>
                </>
              }
              lede="Topik dengan bobot kesulitan tertinggi, plus kesalahan yang paling sering merugikan nilai di mata kuliah ini."
            />
            <HardTopics cid={c.id} topics={c.topics} traps={c.traps} />
          </section>
        )}

        {/* ======================= 06 · STRATEGI ======================= */}
        <section className="section">
          <SectionHead
            id="strategi"
            eyebrow="06 · Strategi"
            judul={
              <>
                Bukan tips umum. <span className="serif">Diturunkan dari rubriknya.</span>
              </>
            }
          />
          <ol className="border-t border-[var(--ink)]">
            {c.strategy.map((s, i) => {
              const t = parseFlag(s.t);
              const d = parseFlag(s.d);
              return (
                <li key={i} className="border-b border-[var(--rule)] py-7">
                  <Reveal className="grid gap-4 md:grid-cols-[4.5rem_minmax(0,1fr)] md:gap-8">
                    <span
                      className="display"
                      style={{ fontSize: '2.2rem', color: c.accent, fontVariantNumeric: 'tabular-nums' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <Rich
                        as="h4"
                        html={t.text.replace(/^\d+\.\s*/, '')}
                        className="card__title"
                      />
                      <Rich as="p" html={d.text} className="lede mt-3 text-[0.92rem]" />
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ======================== 07 · SUMBER ======================== */}
        <section className="section">
          <SectionHead
            id="sumber"
            eyebrow="07 · Sumber belajar"
            judul={
              <>
                Dipilih karena cocok dengan silabus, <span className="serif">bukan karena populer.</span>
              </>
            }
          />
          <div className="grid gap-x-8 gap-y-9 md:grid-cols-2 xl:grid-cols-3">
            {c.resources.map((r, i) => {
              const note = parseFlag(r.note);
              /* Sebagian sumber adalah buku cetak tanpa tautan - jangan dibuat
                 seolah bisa diklik. */
              const Tag = r.url ? 'a' : 'div';
              return (
                <Reveal key={i} delay={(i % 3) * 70}>
                  <Tag
                    {...(r.url ? { href: r.url, target: '_blank', rel: 'noreferrer' } : {})}
                    className="group grid gap-2.5 border-t-2 pt-4"
                    style={{ borderTopColor: c.accent }}
                  >
                    <div className="flex items-baseline justify-between gap-3 text-[0.62rem] uppercase tracking-[0.14em]">
                      <span style={{ color: c.accent }}>{RES_LABEL[r.type] || 'Sumber'}</span>
                      {note.flag === 'star' && <span className="muted">Prioritas</span>}
                    </div>

                    <h4
                      className={`serif-up text-[1.35rem] leading-tight ${
                        r.url ? 'group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4' : ''
                      }`}
                    >
                      {r.t}
                    </h4>

                    {note.text && <p className="stat__note">{note.text}</p>}

                    <span className="num mt-1 truncate text-[0.68rem] muted">
                      {r.url ? r.url.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'Buku cetak, cari di perpustakaan'}
                    </span>
                  </Tag>
                </Reveal>
              );
            })}
          </div>
        </section>
      </div>

      {/* ====================== MATKUL BERIKUTNYA ====================== */}
      <Link
        href={`/matkul/${nextCourse.id}`}
        style={{ '--c': nextCourse.accent, '--c-on': nextCourse.accentOn } as CSSProperties}
        className="index__row !grid-cols-1 border-y border-[var(--ink)] !px-[var(--gutter)] !py-[clamp(2.5rem,6vw,5rem)]"
      >
        <span className="mx-auto block w-full max-w-[var(--maxw)]">
          <span className="index__num block">Berikutnya</span>
          <span className="index__title mt-3 block">
            {nextCourse.name} <span className="serif">{nextCourse.kelas}</span>
          </span>
        </span>
      </Link>
    </div>
  );
}
