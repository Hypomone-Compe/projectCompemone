'use client';

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/* ------------------------------------------------------ Muncul saat digulir */

/** Menambahkan kelas `is-in` sekali saat elemen masuk viewport. */
export function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-in');
      return;
    }
    const io = new IntersectionObserver(
      ([entri]) => {
        if (entri.isIntersecting) {
          el.classList.add('is-in');
          io.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -5% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

export function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
  style,
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useInView<HTMLDivElement>();
  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms`, ...style } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

/** Baris teks yang tersingkap dari balik topeng - untuk judul raksasa. */
export function Mask({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useInView<HTMLSpanElement>();
  return (
    <span
      ref={ref}
      className={`mask ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      <span>{children}</span>
    </span>
  );
}

/* ----------------------------------------------------------------- Teks kaya */

/** Data BRP memuat <b>/<i>/<code>; emoji sudah dibuang di lib/text.ts. */
export function Rich({
  html,
  as: Tag = 'span',
  className = '',
}: {
  html: string;
  as?: ElementType;
  className?: string;
}) {
  return <Tag className={`rich ${className}`.trim()} dangerouslySetInnerHTML={{ __html: html }} />;
}

/* --------------------------------------------------------------- Kepala seksi */

export function SectionHead({
  eyebrow,
  judul,
  lede,
  aksi,
  id,
}: {
  eyebrow: string;
  judul: ReactNode;
  lede?: ReactNode;
  aksi?: ReactNode;
  id?: string;
}) {
  return (
    <div
      id={id}
      className="mb-[clamp(1.8rem,4vw,3rem)] flex flex-wrap items-end justify-between gap-x-8 gap-y-6 scroll-mt-24"
    >
      <div className="max-w-3xl">
        <Reveal>
          <span className="eyebrow eyebrow--c">{eyebrow}</span>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="display mt-4" style={{ fontSize: 'var(--t-xxl)' }}>
            {judul}
          </h2>
        </Reveal>
        {lede && (
          <Reveal delay={120}>
            <p className="lede mt-5">{lede}</p>
          </Reveal>
        )}
      </div>
      {aksi && <Reveal delay={140}>{aksi}</Reveal>}
    </div>
  );
}

/* ---------------------------------------------------------- Ubin statistik */

export function Stat({
  nilai,
  satuan,
  label,
  catatan,
  nada = 'c',
  delay = 0,
}: {
  nilai: ReactNode;
  satuan?: string;
  label: string;
  catatan?: ReactNode;
  nada?: '' | 'c' | 'lime' | 'red' | 'amber' | 'blue';
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className={`stat ${nada ? `stat--${nada}` : ''}`}>
      <span className="stat__label">{label}</span>
      <span className="stat__value">
        {nilai}
        {satuan && <span className="stat__unit">{satuan}</span>}
      </span>
      {catatan && <span className="stat__note">{catatan}</span>}
    </Reveal>
  );
}

/* ----------------------------------------------------------------- Chip */

export function Chip({
  children,
  nada = '',
  className = '',
}: {
  children: ReactNode;
  nada?: '' | 'solid' | 'c' | 'lime' | 'red' | 'amber';
  className?: string;
}) {
  return <span className={`chip ${nada ? `chip--${nada}` : ''} ${className}`.trim()}>{children}</span>;
}

/* --------------------------------------------------------------- Marquee */

export function Marquee({ items, durasi = 46 }: { items: string[]; durasi?: number }) {
  if (!items.length) return null;
  const track = (
    <div className="marquee__track" style={{ '--marquee-dur': `${durasi}s` } as CSSProperties}>
      {items.map((t, i) => (
        <span className="marquee__item" key={i}>
          {t}
        </span>
      ))}
    </div>
  );
  /* Dua salinan bersebelahan supaya perulangannya mulus tanpa jeda. */
  return (
    <div className="marquee">
      {track}
      {track}
    </div>
  );
}

/* ------------------------------------------------------------ Bilah rasio */

export function Bar({ value, className = '' }: { value: number; className?: string }) {
  const v = Math.max(0, Math.min(100, value || 0));
  return (
    <div className={`bar__track ${className}`.trim()}>
      <div className="bar__fill" style={{ width: `${v}%` }} />
    </div>
  );
}

/* ------------------------------------------------------------ Panel geser */

export function Drawer({
  open,
  onClose,
  label = 'Detail',
  head,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label?: string;
  head?: ReactNode;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', h);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  /* Dipasang di <body> supaya position:fixed tidak terpengaruh transform
     dari pembungkus animasi di atasnya. */
  return createPortal(
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--ink)_62%,transparent)] backdrop-blur-[6px]"
        onClick={onClose}
        style={{ animation: 'pudar .3s var(--ease) both' }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative flex h-full w-full max-w-[36rem] flex-col bg-[var(--paper)] text-[var(--ink)] shadow-[0_24px_70px_rgba(18,18,15,0.34)]"
        style={{ animation: 'geser .45s var(--ease) both' }}
      >
        <div className="flex items-start justify-between gap-4 bg-[var(--ink)] px-6 py-5 text-[var(--paper)]">
          <div className="min-w-0">{head}</div>
          <button onClick={onClose} className="btn btn--light btn--sm shrink-0">
            Tutup
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6">{children}</div>
      </aside>
      <style>{`
        @keyframes pudar { from { opacity: 0 } }
        @keyframes geser { from { opacity: 0; transform: translateX(26px) } }
      `}</style>
    </div>,
    document.body,
  );
}

/* ------------------------------------------------------------ Kotak kosong */

export function Kosong({ judul, catatan }: { judul: string; catatan?: string }) {
  return (
    <div className="empty">
      <span style={{ fontSize: '1.7rem' }} aria-hidden="true">
        ⌀
      </span>
      <strong style={{ letterSpacing: '-0.02em' }}>{judul}</strong>
      {catatan && (
        <p className="muted" style={{ fontSize: 'var(--t-sm)', maxWidth: '38ch' }}>
          {catatan}
        </p>
      )}
    </div>
  );
}
