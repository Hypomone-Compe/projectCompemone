'use client';

/**
 * Panel matkul yang muncul saat kartu orbit diklik.
 *
 * Motion-nya diambil dari HeroDetail design system: latar putih + grid silinder,
 * kartu "terbang" dari posisinya di orbit ke tengah (homografi matrix3d,
 * expo.inOut), lalu kembali ke orbit saat ditutup.
 *
 * Isinya sengaja berbeda dari referensi. Halaman detail proker k95 indah untuk
 * dibaca sekali; panel ini dibuka setiap hari untuk menjawab empat pertanyaan:
 * kapan kelas berikutnya, apa yang jatuh tempo, berapa nilaiku sekarang, dan
 * ke mana aku harus klik. Semua jawabannya ada di layar pertama, tanpa menggulir.
 */
import * as React from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BookOpenCheck, CalendarClock, CalendarDays, Calculator,
  Flag, Library, Lightbulb, Target, X, type LucideIcon,
} from 'lucide-react';
import { Badge, Progress } from '@/components/ui';
import { hitungProyeksi } from '@/lib/nilai';
import type { KartuMatkul, MingguRingkas } from '@/lib/ringkasan-matkul';
import { courseProgress, useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { Quad } from './orbit/scene';
import OverlayGrid from './OverlayGrid';

type Rect = { left: number; top: number; width: number; height: number };

const FLY = { duration: 1.2, ease: 'expo.inOut' } as const;

const quadOf = (r: Rect): Quad => [
  [r.left, r.top],
  [r.left + r.width, r.top],
  [r.left + r.width, r.top + r.height],
  [r.left, r.top + r.height],
];

/** matrix3d yang memetakan kotak W×H ke 4 sudut `q` (homografi, Heckbert). Dari HeroDetail design system. */
function quadMatrix(q: Quad, W: number, H: number): string {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  let g = 0, h = 0;
  const den = dx1 * dy2 - dx2 * dy1;
  if ((Math.abs(dx3) > 1e-6 || Math.abs(dy3) > 1e-6) && Math.abs(den) > 1e-9) {
    g = (dx3 * dy2 - dx2 * dy3) / den;
    h = (dx1 * dy3 - dx3 * dy1) / den;
  }
  const a = x1 - x0 + g * x1, b = x3 - x0 + h * x3;
  const d = y1 - y0 + g * y1, e = y3 - y0 + h * y3;
  return `matrix3d(${a / W},${d / W},0,${g / W},${b / H},${e / H},0,${h / H},0,0,1,0,${x0},${y0},0,1)`;
}
const lerpQuad = (a: Quad, b: Quad, t: number): Quad => a.map(([x, y], i) => [x + (b[i][0] - x) * t, y + (b[i][1] - y) * t]);
const rectOf = (el: Element): Rect => {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
};

/* Pintasan ke tiap tab halaman matkul. Ikon + kata kerja, bukan nomor seksi. */
const PINTASAN: { tab: string; label: string; ket: string; Icon: LucideIcon }[] = [
  { tab: 'nilai', label: 'Nilai & kalkulator', ket: 'Isi nilai, lihat proyeksi & target A', Icon: Calculator },
  { tab: 'rencana', label: 'Rencana mingguan', ket: 'Materi & tugas tiap minggu', Icon: CalendarDays },
  { tab: 'materi', label: 'Materi & Feynman', ket: 'Tandai paham, jelaskan ulang', Icon: BookOpenCheck },
  { tab: 'strategi', label: 'Strategi', ket: 'Cara menang di rubrik ini', Icon: Target },
  { tab: 'sumber', label: 'Sumber belajar', ket: 'Video, tool, bacaan pilihan', Icon: Library },
  { tab: 'ringkasan', label: 'Info kelas', ket: 'Dosen, jadwal, ruang, buku', Icon: Lightbulb },
];

interface Props {
  matkul: KartuMatkul[];
  covers: string[];
  initialIndex: number;
  origin: Quad | null;
  getReturnQuad: (index: number) => Quad | null;
  onClose: () => void;
}

export default function CourseDetail({ matkul, covers, initialIndex, origin, getReturnQuad, onClose }: Props) {
  useStore();
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const flyerRef = React.useRef<HTMLDivElement>(null);
  const flyerImg = React.useRef<HTMLImageElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const busy = React.useRef(true);

  const [index, setIndex] = React.useState(initialIndex);
  const [panelHidden, setPanelHidden] = React.useState(Boolean(origin));
  const c = matkul[index];
  const cover = covers[index];

  /* Kunci gulir halaman di belakang panel. */
  React.useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      html.style.overflow = prev;
    };
  }, []);

  const placeFlyer = React.useCallback((src: string, q: Quad, W: number, H: number) => {
    const flyer = flyerRef.current!;
    if (flyerImg.current!.getAttribute('src') !== src) flyerImg.current!.src = src;
    Object.assign(flyer.style, { left: '0px', top: '0px', width: `${W}px`, height: `${H}px`, opacity: '1', visibility: 'visible' });
    flyer.style.transform = quadMatrix(q, W, H);
  }, []);

  const flyTo = React.useCallback(
    (src: string, from: Quad, to: Quad, W: number, H: number, duration: number = FLY.duration) => {
      const flyer = flyerRef.current!;
      placeFlyer(src, from, W, H);
      const st = { p: 0 };
      return gsap.to(st, {
        p: 1,
        duration,
        ease: FLY.ease,
        onUpdate: () => {
          flyer.style.transform = quadMatrix(lerpQuad(from, to, st.p), W, H);
        },
      });
    },
    [placeFlyer],
  );

  /* Buka: panel memudar masuk, kartu terbang dari orbit ke slotnya. */
  React.useLayoutEffect(() => {
    const wrap = wrapRef.current!;
    gsap.fromTo(wrap, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
    gsap.fromTo(
      wrap.querySelectorAll('[data-rise]'),
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.035, delay: origin && window.innerWidth >= 768 ? 0.35 : 0.05 },
    );
    const panel = panelRef.current;
    /* Di HP / reduced motion kartu tidak diterbangkan: panel langsung tampil. */
    const tanpaTerbang = window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches;
    if (!origin || !panel || !cover || tanpaTerbang) {
      setPanelHidden(false);
      busy.current = false;
      return;
    }
    let tw: gsap.core.Tween | null = null;
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const r = rectOf(panel);
        tw = flyTo(cover, origin, quadOf(r), r.width, r.height);
        tw.then(() => {
          setPanelHidden(false);
          gsap.to(flyerRef.current, {
            opacity: 0,
            duration: 0.35,
            onComplete: () => {
              if (flyerRef.current) flyerRef.current.style.visibility = 'hidden';
              busy.current = false;
            },
          });
        });
      }),
    );
    return () => {
      cancelAnimationFrame(raf);
      tw?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = React.useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    const wrap = wrapRef.current!;
    const panel = panelRef.current;
    const back = getReturnQuad(index);
    const fade = gsap.to(wrap, { opacity: 0, duration: 0.45, delay: back ? 0.5 : 0.05, ease: 'power2.out' });
    if (panel && back && cover && window.innerWidth >= 768) {
      const r = rectOf(panel);
      setPanelHidden(true);
      gsap.to(wrap.querySelectorAll('[data-rise]'), { opacity: 0, duration: 0.25 });
      await Promise.all([flyTo(cover, quadOf(r), back, r.width, r.height, 1), fade]);
    } else {
      await fade;
    }
    onClose();
  }, [getReturnQuad, index, cover, flyTo, onClose]);

  const ganti = React.useCallback(
    (dir: 1 | -1) => {
      if (busy.current) return;
      const next = (index + dir + matkul.length) % matkul.length;
      const wrap = wrapRef.current!;
      busy.current = true;
      gsap.to(wrap.querySelectorAll('[data-rise], [data-card]'), {
        opacity: 0,
        y: 12,
        duration: 0.2,
        onComplete: () => {
          setIndex(next);
          wrap.scrollTop = 0;
          requestAnimationFrame(() => {
            gsap.fromTo(
              wrap.querySelectorAll('[data-rise], [data-card]'),
              { opacity: 0, y: 18 },
              { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.03, onComplete: () => void (busy.current = false) },
            );
          });
        },
      });
    },
    [index, matkul.length],
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') ganti(1);
      else if (e.key === 'ArrowLeft') ganti(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close, ganti]);

  const pro = courseProgress(c.id, c.topicIds.map(id => ({ id })));
  const nilai = hitungProyeksi(c.id, c.grading);
  const prev = matkul[(index - 1 + matkul.length) % matkul.length];
  const next = matkul[(index + 1) % matkul.length];

  return (
    <>
      <div
        ref={wrapRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Mata kuliah ${c.name}`}
        data-lenis-prevent
        className="fixed inset-0 z-40 overflow-y-auto overflow-x-hidden overscroll-contain bg-white"
        style={{ opacity: 0, ['--c' as string]: c.accent }}
      >
        <OverlayGrid scroller={wrapRef} />

        <div className="relative mx-auto max-w-wrap px-5 pb-32 pt-24 sm:pt-28 lg:pb-16">
          <div className="grid gap-8 md:grid-cols-[minmax(0,300px)_1fr] lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-12">
            {/* ---------------------------- kartu ---------------------------- */}
            <div className="md:sticky md:top-28 md:self-start">
              <div className="flex items-start gap-4 md:block">
                <div
                  ref={panelRef}
                  data-card
                  className="relative aspect-[1.4/1.9] w-32 shrink-0 overflow-hidden rounded-2xl bg-off-white shadow-xl sm:w-40 md:w-full"
                  style={{ visibility: panelHidden ? 'hidden' : 'visible' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {cover && <img src={cover} alt={`Kartu ${c.name}`} className="size-full object-cover" />}
                </div>
                <div className="min-w-0 md:hidden" data-rise>
                  <Judul c={c} />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2" data-rise>
                <button
                  type="button"
                  onClick={() => ganti(-1)}
                  className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2.5 text-left text-[13px] font-bold transition-colors hover:border-navy"
                >
                  <ArrowLeft aria-hidden className="size-4 shrink-0" />
                  <span className="truncate">{prev.short}</span>
                </button>
                <button
                  type="button"
                  onClick={() => ganti(1)}
                  className="flex items-center justify-end gap-2 rounded-xl border border-border bg-white px-3 py-2.5 text-right text-[13px] font-bold transition-colors hover:border-navy"
                >
                  <span className="truncate">{next.short}</span>
                  <ArrowRight aria-hidden className="size-4 shrink-0" />
                </button>
              </div>
              <p className="mt-2 hidden text-center text-xs text-muted lg:block">← → ganti matkul · Esc tutup</p>
            </div>

            {/* ---------------------------- isi ---------------------------- */}
            <div className="min-w-0">
              <div className="hidden md:block" data-rise>
                <Judul c={c} />
              </div>

              <div className="mt-5 flex flex-wrap gap-2" data-rise>
                <Link
                  href={`/matkul/${c.id}`}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[15px] font-bold text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-md"
                  style={{ background: c.accent }}
                >
                  Buka halaman {c.short} <ArrowUpRight aria-hidden className="size-4" />
                </Link>
                <Link
                  href={`/matkul/${c.id}?tab=nilai`}
                  className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-border bg-white px-5 py-3 text-[15px] font-bold text-navy transition-colors hover:border-navy"
                >
                  <Calculator aria-hidden className="size-4" /> Isi nilai
                </Link>
              </div>

              {/* Tiga jawaban cepat */}
              <div className="mt-6 grid gap-3 sm:grid-cols-3" data-rise>
                <Info
                  Icon={CalendarClock}
                  label="Kelas berikutnya"
                  nilai={c.sesiBerikut ? `${c.sesiBerikut.kapan}, ${c.sesiBerikut.jam.split('–')[0]}` : 'Tidak ada'}
                  ket={c.sesiBerikut ? `${c.sesiBerikut.kind} · ${c.sesiBerikut.ruang}` : 'Jadwal kosong pekan ini'}
                />
                <Info
                  Icon={Flag}
                  label="Agenda dinilai terdekat"
                  nilai={c.deadlineBerikut ? `Minggu ${c.deadlineBerikut.n}` : 'Tidak ada'}
                  ket={c.deadlineBerikut ? `${c.deadlineBerikut.label}: ${c.deadlineBerikut.text}` : 'Semua sudah lewat'}
                  clamp
                />
                <Info
                  Icon={Calculator}
                  label="Proyeksi nilai"
                  nilai={nilai.norm == null ? 'Belum ada' : `${nilai.norm.toFixed(1)} · ${nilai.huruf}`}
                  ket={
                    nilai.norm == null
                      ? 'Isi nilai yang sudah keluar'
                      : nilai.butuhA == null
                        ? 'Semua komponen terisi'
                        : nilai.butuhA <= 0
                          ? 'A sudah aman'
                          : nilai.butuhA > 100
                            ? 'A tidak terjangkau lagi'
                            : `Butuh rata-rata ${nilai.butuhA.toFixed(0)} untuk A`
                  }
                />
              </div>

              <div className="mt-3 rounded-2xl border border-border bg-white p-5 shadow-sm" data-rise>
                <Progress value={pro.pct} label={`Pemahaman materi · ${pro.paham}/${pro.total} topik paham`} barClassName="bg-c" />
                {pro.total - pro.paham > 0 && (
                  <p className="mt-2 text-[13px] text-muted">
                    {pro.proses} sedang dipelajari · {c.topikBerat} topik berbobot berat.{' '}
                    <Link href={`/matkul/${c.id}?tab=materi`} className="font-bold text-navy underline-offset-4 hover:underline">
                      Lanjutkan materi →
                    </Link>
                  </p>
                )}
              </div>

              <div className="mt-3 grid gap-3 lg:grid-cols-2" data-rise>
                <Minggu judul="Minggu ini" m={c.mingguIni} kuat />
                <Minggu judul="Minggu depan" m={c.mingguDepan} />
              </div>

              {/* Pintasan besar ke tiap bagian halaman matkul */}
              <h3 className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-muted" data-rise>
                Langsung ke
              </h3>
              <ul className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-3" data-rise>
                {PINTASAN.map(p => (
                  <li key={p.tab}>
                    <Link
                      href={`/matkul/${c.id}?tab=${p.tab}`}
                      className="group flex h-full flex-col gap-2 rounded-2xl border border-border bg-white p-4 shadow-xs transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:shadow-lg active:scale-[.98]"
                    >
                      <span className="flex items-start justify-between">
                        <span className="flex size-10 items-center justify-center rounded-lg transition-colors" style={{ background: c.pale, color: c.accent }}>
                          <p.Icon aria-hidden className="size-5" />
                        </span>
                        <ArrowUpRight aria-hidden className="size-4 opacity-40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                      </span>
                      <span className="text-[15px] font-extrabold leading-tight tracking-tight">{p.label}</span>
                      <span className="text-[12.5px] leading-snug text-muted">{p.ket}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-2xl border border-border bg-white p-5" data-rise>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">Jadwal tetap</p>
                <ul className="mt-3 divide-y divide-divider">
                  {c.jadwal.map((s, i) => (
                    <li key={i} className="flex items-baseline gap-3 py-2.5 text-sm">
                      <span className="w-10 font-extrabold" style={{ color: c.accent }}>{s.hariPendek}</span>
                      <span className="num w-28 shrink-0 font-bold">{s.jam}</span>
                      <span className="min-w-0 flex-1 truncate text-secondary">{s.ruang}</span>
                      {s.kind !== 'Kelas' && <Badge variant="outline" className="shrink-0">{s.kind}</Badge>}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[13px] text-muted">{c.dosen}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={flyerRef}
        aria-hidden
        className="pointer-events-none fixed z-[45] overflow-hidden rounded-2xl shadow-xl will-change-transform"
        style={{ visibility: 'hidden', transformOrigin: '0 0' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={flyerImg} alt="" className="block size-full object-cover" />
      </div>

      <button
        ref={closeRef}
        type="button"
        onClick={() => void close()}
        aria-label="Tutup dan kembali ke orbit"
        data-hover
        className="fixed bottom-24 right-5 z-[46] flex size-12 items-center justify-center rounded-full border border-glass-border bg-glass-strong text-navy shadow-glass-soft backdrop-blur-glass transition-transform duration-base ease-out-expo hover:scale-105 lg:bottom-auto lg:right-[58px] lg:top-24"
      >
        <X aria-hidden className="size-5" />
      </button>
    </>
  );
}

function Judul({ c }: { c: KartuMatkul }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Kelas {c.kelas}</Badge>
        <Badge variant="outline">{c.sks} SKS</Badge>
        {c.fokus && <Badge variant="pink" dot>Prioritas semester ini</Badge>}
      </div>
      <h2 className="mt-3 text-[clamp(1.6rem,4.2vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
        {c.name} <span style={{ color: c.accent }}>{c.kelas}</span>
      </h2>
      <p className="mt-3 hidden max-w-2xl text-[15.5px] leading-relaxed text-secondary sm:block">{c.tagline}</p>
    </>
  );
}

function Info({ Icon, label, nilai, ket, clamp }: { Icon: LucideIcon; label: string; nilai: string; ket: string; clamp?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <p className="flex items-center gap-2 text-[12.5px] font-bold text-muted">
        <Icon aria-hidden className="size-4 text-c" /> {label}
      </p>
      <p className="mt-2 text-lg font-extrabold leading-tight tracking-tight">{nilai}</p>
      <p className={cn('mt-1 text-[13px] leading-snug text-secondary', clamp && 'line-clamp-3')}>{ket}</p>
    </div>
  );
}

function Minggu({ judul, m, kuat }: { judul: string; m: MingguRingkas | null; kuat?: boolean }) {
  return (
    <div className={cn('rounded-2xl border p-5', kuat ? 'border-transparent bg-navy text-white shadow-lg' : 'border-border bg-white')}>
      <div className="flex items-baseline justify-between gap-3">
        <p className={cn('text-xs font-bold uppercase tracking-[0.2em]', kuat ? 'text-pink-light' : 'text-muted')}>{judul}</p>
        {m && <p className={cn('num text-[12.5px] font-semibold', kuat ? 'text-white/60' : 'text-muted')}>{m.range}</p>}
      </div>
      {m ? (
        <>
          <p className="mt-2 text-[15px] font-extrabold leading-snug">
            {m.label} · {m.title}
          </p>
          {m.tasks.length ? (
            <ul className="mt-3 space-y-2">
              {m.tasks.slice(0, 5).map((t, i) => (
                <li key={i} className="flex gap-2.5 text-[13.5px] leading-snug">
                  <span
                    className={cn(
                      'mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold',
                      t.penting ? 'bg-accent text-white' : kuat ? 'bg-white/10 text-white/80' : 'bg-navy-5 text-secondary',
                    )}
                  >
                    {t.label || 'Info'}
                  </span>
                  <span className={kuat ? 'text-white/85' : 'text-secondary'}>{t.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={cn('mt-2 text-[13.5px]', kuat ? 'text-white/70' : 'text-muted')}>Tidak ada tugas tercatat di BRP.</p>
          )}
        </>
      ) : (
        <p className={cn('mt-2 text-[13.5px]', kuat ? 'text-white/70' : 'text-muted')}>Tidak ada pertemuan.</p>
      )}
    </div>
  );
}
