'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { bukaSapaan } from '@/components/Sapaan';
import { sampulMatkul } from '@/lib/kartu';
import type { KartuMatkul } from '@/lib/ringkasan-matkul';
import { scrollKe } from '@/lib/scroll';
import { cn } from '@/lib/utils';
import type { OrbitController, Quad } from './orbit/scene';

const loadDetail = () => import('./CourseDetail');
const CourseDetail = dynamic(() => loadDetail().then(m => m.default), { ssr: false });

/* Pengaturan orbit, sama dengan HERO di design system: 4 baris × 5 kartu. */
const HERO = {
  rings: 4,
  cardsPerRing: 5,
  autoSpeed: 3,
  /** Putaran tambahan dari scroll selama hero ditahan. */
  maxRotations: 1,
  /** Jarak scroll (tinggi viewport) untuk satu putaran. Dibuat pendek: agenda harus cepat terlihat. */
  viewportsPerRotation: 0.7,
};
const TOTAL_SLOTS = HERO.rings * HERO.cardsPerRing;

export interface HeroInfo {
  tanggal: string;
  minggu: string;
  ujian: string | null;
}

/**
 * Hero beranda ala design system (k95.it): logo BEM 3D di tengah, dibungkus
 * kartu lima mata kuliah yang berputar di atas latar putih + grid silinder.
 * Klik kartu → panel matkul yang fungsional (CourseDetail). Klik logo → sapaan hari ini.
 *
 * Bedanya dengan referensi: ada bilah bawah yang SELALU terlihat berisi lima
 * tombol matkul dan tombol ke agenda. Kartu yang berputar itu cantik, tapi
 * bukan cara tercepat membuka SDA jam tujuh pagi.
 */
export default function HeroOrbit({ matkul, info }: { matkul: KartuMatkul[]; info: HeroInfo }) {
  const wrapRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<OrbitController | null>(null);
  const pointer = useRef({ down: false, x: 0, y: 0, moved: 0 });
  const lastFocus = useRef<HTMLElement | null>(null);

  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [covers, setCovers] = useState<string[]>([]);
  const [hover, setHover] = useState<number | 'logo' | null>(null);
  const [detail, setDetail] = useState<{ index: number; origin: Quad | null } | null>(null);

  const slots = useMemo(() => {
    const n = matkul.length;
    const step = [7, 3, 11, 13].find(s => gcd(s, n) === 1) ?? 1;
    return Array.from({ length: TOTAL_SLOTS }, (_, i) => (i * step) % n);
  }, [matkul.length]);

  /* Sampul digambar dulu (canvas), lalu scene WebGL dimuat di chunk terpisah. */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || matkul.length === 0) return;
    let disposed = false;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    sampulMatkul(matkul)
      .then(urls => {
        if (disposed) throw new Error('batal');
        setCovers(urls);
        return import('./orbit/scene').then(({ createOrbit }) =>
          createOrbit({
            canvas,
            images: urls,
            slots,
            perRing: HERO.cardsPerRing,
            logoSrc: '/images/logo-bem-ui.png',
            logoBumpSrc: '/images/logo-bem-ui-height.png',
            autoSpeed: HERO.autoSpeed,
            reduceMotion,
            onHover: setHover,
          }),
        );
      })
      .then(ctrl => {
        if (disposed) return ctrl.dispose();
        ctrlRef.current = ctrl;
        ctrl.setScroll(0, window.scrollY);
        setStatus('ready');
        const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500));
        idle(() => void loadDetail());
      })
      .catch(() => !disposed && setStatus('failed'));

    return () => {
      disposed = true;
      ctrlRef.current?.dispose();
      ctrlRef.current = null;
    };
  }, [matkul, slots]);

  useEffect(() => {
    const onScroll = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - window.innerHeight)));
      ctrlRef.current?.setScroll(progress * HERO.maxRotations, window.scrollY);
      if (rect.bottom < window.innerHeight) setHover(null);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [status]);

  /* Label kaca mengikuti kursor: nama matkul yang disorot. */
  useEffect(() => {
    if (hover === null) return;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, first = true;
    const move = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (first) {
        x = tx;
        y = ty;
        first = false;
      }
    };
    const loop = () => {
      x += (tx - x) * 0.1;
      y += (ty - y) * 0.1;
      if (labelRef.current) labelRef.current.style.transform = `translate(${x + 30}px, calc(${y}px - 50%))`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('mousemove', move);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(raf);
    };
  }, [hover]);

  const openItem = useCallback((index: number, origin: Quad | null) => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    ctrlRef.current?.setPaused(true);
    setHover(null);
    setDetail({ index, origin });
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    pointer.current = { down: true, x: e.clientX, y: e.clientY, moved: 0 };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const p = pointer.current;
    if (!p.down) return;
    const dx = e.clientX - p.x;
    p.moved += Math.abs(dx) + Math.abs(e.clientY - p.y);
    p.x = e.clientX;
    p.y = e.clientY;
    if (dx) ctrlRef.current?.drag(dx);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const p = pointer.current;
    if (!p.down) return;
    p.down = false;
    ctrlRef.current?.release();
    if (p.moved > 6) return;
    const ctrl = ctrlRef.current;
    const hit = ctrl?.pick(e.clientX, e.clientY);
    if (!ctrl || !hit) return;
    if (hit.kind === 'logo') bukaSapaan();
    else {
      ctrl.setHidden(hit.instance);
      openItem(slots[hit.instance], ctrl.quadOf(hit.instance));
    }
  };
  const onPointerCancel = () => {
    pointer.current.down = false;
    ctrlRef.current?.release();
  };

  const getReturnQuad = useCallback((index: number): Quad | null => {
    const ctrl = ctrlRef.current;
    const hit = ctrl ? ctrl.findVisible(index) : null;
    if (!hit) return null;
    ctrl!.setHidden(hit.instance);
    return hit.quad;
  }, []);

  const resume = useCallback(() => {
    ctrlRef.current?.setHidden(null);
    ctrlRef.current?.setPaused(false);
    lastFocus.current?.focus?.({ preventScroll: true });
  }, []);

  const hoverText = hover === 'logo' ? 'Sapaan' : hover !== null ? matkul[hover]?.short ?? 'Lihat' : null;

  return (
    <section
      ref={wrapRef}
      aria-label="Lima mata kuliah semester ini"
      className="relative bg-white text-navy"
      style={{ height: `${100 + HERO.maxRotations * HERO.viewportsPerRotation * 100}svh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <h1 className="sr-only">Hypomonē @GRIT, beranda</h1>

        <canvas
          ref={canvasRef}
          aria-label="Logo BEM UI 3D dibungkus kartu lima mata kuliah yang berputar. Gunakan tombol mata kuliah di bawah untuk membukanya."
          className={cn(
            'absolute inset-0 h-full w-full touch-pan-y transition-opacity duration-700',
            status === 'ready' ? 'opacity-100' : 'opacity-0',
            hover !== null && 'cursor-pointer',
          )}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onPointerLeave={onPointerCancel}
        />

        {/* Logo statis: tampil selama scene dimuat / bila WebGL tidak didukung */}
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700',
            status === 'ready' ? 'opacity-0' : 'opacity-100',
          )}
        >
          <Image
            src="/images/logo-bem-ui.png"
            alt=""
            width={876}
            height={876}
            priority
            className={cn('h-auto w-[min(48vw,280px)]', status === 'loading' && 'animate-pulse')}
          />
        </div>

        {/* Bilah bawah: kaca, selalu terlihat. Lima tombol matkul = jalan pintas yang bisa diketuk. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-10 px-3 sm:bottom-6 sm:px-6 lg:bottom-8">
          <div className="pointer-events-auto mx-auto flex max-w-[1080px] flex-col gap-3 rounded-2xl border border-glass-border bg-glass-strong p-3 shadow-glass-soft backdrop-blur-glass sm:p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-3 px-1 lg:block">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{info.tanggal}</p>
                <p className="mt-0.5 text-[15px] font-extrabold tracking-tight">
                  {info.minggu}
                  {info.ujian && (
                    <span className="ml-2 rounded-full bg-pink-pale px-2.5 py-0.5 text-[12px] font-bold text-accent-hover">Pekan {info.ujian}</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('hari-ini');
                  if (el) scrollKe(el, 96);
                }}
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy text-white lg:hidden"
                aria-label="Ke agenda hari ini"
              >
                <ArrowDown aria-hidden className="size-4" />
              </button>
            </div>

            <ul className="grid grid-cols-5 gap-1.5 sm:gap-2" aria-label="Buka mata kuliah">
              {matkul.map((c, i) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => openItem(i, null)}
                    className="group relative flex w-full flex-col items-center gap-0.5 rounded-xl border border-border bg-white px-1 py-2 text-center shadow-xs transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:shadow-md active:scale-[.97] sm:min-w-[96px] sm:px-3"
                    style={{ borderBottom: `3px solid ${c.accent}` }}
                  >
                    {c.fokus && <span aria-hidden className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-accent" />}
                    <span className="text-[13px] font-extrabold tracking-tight sm:text-sm" style={{ color: c.accent }}>
                      {c.short}
                    </span>
                    <span className="hidden text-[11px] font-semibold text-muted sm:block">
                      {c.deadlineMingguIni ? `${c.deadlineMingguIni} agenda` : 'Kelas ' + c.kelas}
                    </span>
                    <span className="sr-only">{c.fokus ? ', prioritas' : ''}</span>
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('hari-ini');
                if (el) scrollKe(el, 96);
              }}
              className="hidden items-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-md lg:flex"
            >
              Agenda hari ini <ArrowDown aria-hidden className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={labelRef}
        aria-hidden
        className={cn(
          'pointer-events-none fixed left-0 top-0 z-[60] whitespace-nowrap rounded-full border border-glass-border bg-glass-strong px-4 py-2.5 text-base font-bold uppercase text-navy shadow-glass-soft backdrop-blur-[10px] transition-[opacity,visibility] duration-300 [@media(hover:none)]:hidden',
          hoverText ? 'visible opacity-100' : 'invisible opacity-0',
        )}
      >
        {hoverText ?? 'Lihat'}
      </div>

      {detail && (
        <CourseDetail
          matkul={matkul}
          covers={covers}
          initialIndex={detail.index}
          origin={detail.origin}
          getReturnQuad={getReturnQuad}
          onClose={() => {
            setDetail(null);
            resume();
          }}
        />
      )}
    </section>
  );
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
