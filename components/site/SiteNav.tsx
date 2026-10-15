'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import {
  BookOpen, Camera, ChevronDown, ExternalLink, HeartPulse, Home, LogOut, Menu, Sparkles, Wallet, X,
  type LucideIcon,
} from 'lucide-react';
import { bukaSapaan } from '@/components/Sapaan';
import { META, shortName } from '@/lib/courses/meta';
import { localMode } from '@/lib/supabase/config';
import { TAUTAN_LUAR } from '@/lib/tautan';
import { cn } from '@/lib/utils';
import SyncBadge from './SyncBadge';

const LINKS = [
  { label: 'Beranda', href: '/' },
  { label: 'Harian', href: '/harian' },
  { label: 'Keuangan', href: '/keuangan' },
  { label: 'Asdos', href: '/asdos' },
];

const aktifDi = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

async function keluar() {
  await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  window.location.assign('/login');
}

/* ==========================================================================
   Navbar pill glass dari design system (components/ui/navbar.tsx di
   companyprofile): melebar di paling atas, memendek saat digulir, garis bawah
   meluncur ke tautan yang disorot.

   Di HP ditambah bilah tab bawah. Alasannya fungsi, bukan gaya: empat tujuan
   yang paling sering dibuka harus terjangkau jempol tanpa membuka menu.
   ========================================================================== */
export default function SiteNav() {
  const pathname = usePathname();
  const [atTop, setAtTop] = React.useState(true);
  const [sheet, setSheet] = React.useState<null | 'menu' | 'matkul'>(null);

  React.useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => setSheet(null), [pathname]);

  React.useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSheet(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheet]);

  const diMatkul = pathname.startsWith('/matkul');

  return (
    <>
      {/* Di PWA status bar transparan: navbar turun sejauh poni/status bar. */}
      <div className="no-print fixed inset-x-0 top-0 z-50" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <header className="flex justify-center px-3 sm:px-5">
          <nav
            aria-label="Utama"
            data-compact={!atTop}
            style={{ maxWidth: atTop ? 'min(1080px, 100%)' : 'min(900px, calc(100% - 16px))' }}
            className={cn(
              'group/nav flex w-full items-center justify-between gap-3 rounded-full border border-glass-border bg-glass-strong py-1.5 pl-3 pr-2 shadow-glass-soft backdrop-blur-glass transition-[max-width,padding,box-shadow] duration-[700ms] ease-out-expo motion-reduce:transition-none sm:pl-4',
              atTop ? 'sm:py-2' : 'sm:py-1',
            )}
          >
            <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Hypomonē @LV, beranda">
              <Image
                src="/images/galaksi-ikon.png"
                alt=""
                width={256}
                height={256}
                priority
                className="size-9 shrink-0 transition-[width,height] duration-500 ease-out-expo group-data-[compact=true]/nav:size-8"
              />
              <span className="whitespace-nowrap text-[17px] font-extrabold tracking-tight text-ink">
                Hypomonē <span className="font-bold text-accent">@LV</span>
              </span>
            </Link>

            <DesktopLinks pathname={pathname} diMatkul={diMatkul} />

            <div className="flex items-center gap-1.5">
              <SyncBadge />
              <button
                type="button"
                onClick={bukaSapaan}
                aria-label="Sapaan hari ini"
                title="Sapaan hari ini"
                className="hidden size-[38px] items-center justify-center rounded-full text-secondary transition-colors hover:bg-navy-5 hover:text-ink sm:flex"
              >
                <Sparkles aria-hidden className="size-[18px]" />
              </button>
              {!localMode && (
                <button
                  type="button"
                  onClick={keluar}
                  aria-label="Keluar"
                  title="Keluar"
                  className="hidden size-[38px] items-center justify-center rounded-full text-secondary transition-colors hover:bg-red-pale hover:text-red lg:flex"
                >
                  <LogOut aria-hidden className="size-[18px]" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setSheet('menu')}
                aria-label="Buka menu"
                aria-expanded={sheet === 'menu'}
                className="flex size-[38px] items-center justify-center rounded-full bg-navy text-white lg:hidden"
              >
                <Menu aria-hidden className="size-[18px]" />
              </button>
            </div>
          </nav>
        </header>
      </div>

      <BottomTabs pathname={pathname} onMatkul={() => setSheet(s => (s === 'matkul' ? null : 'matkul'))} matkulOpen={sheet === 'matkul'} />

      {sheet && <Sheet jenis={sheet} pathname={pathname} onClose={() => setSheet(null)} />}
    </>
  );
}

/* ----------------------------------------------------------- desktop */
/* Tiga pintu saja: Mata kuliah, Keuangan, Lainnya. Logo = Beranda. */
function DesktopLinks({ pathname, diMatkul }: { pathname: string; diMatkul: boolean }) {
  const [buka, setBuka] = React.useState<null | 'matkul' | 'lain'>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setBuka(null), [pathname]);
  React.useEffect(() => {
    if (!buka) return;
    const klik = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setBuka(null);
    const kunci = (e: KeyboardEvent) => e.key === 'Escape' && setBuka(null);
    document.addEventListener('mousedown', klik);
    window.addEventListener('keydown', kunci);
    return () => {
      document.removeEventListener('mousedown', klik);
      window.removeEventListener('keydown', kunci);
    };
  }, [buka]);

  const garis = 'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-ink';
  const diLain = ['/', '/harian', '/asdos'].some(h => aktifDi(pathname, h));
  const item = 'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-bold text-secondary transition-colors hover:bg-navy-5 hover:text-ink';

  const pemicu = (id: 'matkul' | 'lain', label: string, aktif: boolean) => (
    <button
      type="button"
      onClick={() => setBuka(b => (b === id ? null : id))}
      aria-expanded={buka === id}
      className={cn('relative flex items-center gap-1 whitespace-nowrap py-1.5 transition-colors hover:text-ink', aktif && cn('font-bold text-ink', garis))}
    >
      {label} <ChevronDown aria-hidden className={cn('size-4 transition-transform', buka === id && 'rotate-180')} />
    </button>
  );

  return (
    <div ref={ref} className="relative hidden items-center gap-8 text-[15px] font-semibold text-secondary lg:flex">
      <div className="relative">
        {pemicu('matkul', 'Mata kuliah', diMatkul)}
        {buka === 'matkul' && (
          <div className="absolute left-1/2 top-[calc(100%+14px)] w-[300px] -translate-x-1/2 rounded-xl border border-border bg-surface p-2 shadow-lg">
            {META.map(c => (
              <Link key={c.id} href={`/matkul/${c.id}`} className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-navy-5">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: c.accent }} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-bold text-ink">
                    {shortName(c)}
                    {c.fokus && <span className="rounded-full bg-pink-pale px-2 py-0.5 text-[10.5px] font-bold text-accent-hover">Prioritas</span>}
                  </span>
                  <span className="block truncate text-[12.5px] font-medium text-muted">{c.name}</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link
        href="/keuangan"
        aria-current={aktifDi(pathname, '/keuangan') ? 'page' : undefined}
        className={cn('relative py-1.5 transition-colors hover:text-ink', aktifDi(pathname, '/keuangan') && cn('font-bold text-ink', garis))}
      >
        Keuangan
      </Link>

      <div className="relative">
        {pemicu('lain', 'Lainnya', diLain)}
        {buka === 'lain' && (
          <div className="absolute right-0 top-[calc(100%+14px)] w-[250px] rounded-xl border border-border bg-surface p-2 shadow-lg">
            <Link href="/" className={item}><Home aria-hidden className="size-4" /> Beranda</Link>
            <Link href="/harian" className={item}><HeartPulse aria-hidden className="size-4" /> Harian</Link>
            <Link href="/asdos" className={item}><BookOpen aria-hidden className="size-4" /> Asisten dosen</Link>
            <div role="separator" className="mx-1 my-1.5 h-px bg-divider" />
            {TAUTAN_LUAR.map(t => (
              <a key={t.label} href={t.url} target="_blank" rel="noreferrer" className={item}>
                <ExternalLink aria-hidden className="size-4" />
                <span className="flex-1">{t.label}</span>
                <span className="text-[11.5px] font-medium text-muted">{t.ket}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------- tab bawah (HP) */
function BottomTabs({ pathname, onMatkul, matkulOpen }: { pathname: string; onMatkul: () => void; matkulOpen: boolean }) {
  const tab = (href: string, label: string, Icon: LucideIcon) => {
    const on = aktifDi(pathname, href.split('?')[0]) && !(href.includes('?') && pathname === '/keuangan');
    return (
      <Link
        href={href}
        aria-current={on ? 'page' : undefined}
        className={cn(
          'flex flex-1 flex-col items-center gap-1 rounded-full py-2 text-[11px] font-bold transition-colors',
          on ? 'text-ink' : 'text-muted',
        )}
      >
        <Icon aria-hidden className={cn('size-5', on && 'text-accent')} strokeWidth={on ? 2.4 : 2} />
        {label}
      </Link>
    );
  };
  return (
    <nav
      aria-label="Navigasi cepat"
      className="no-print fixed inset-x-3 bottom-3 z-50 flex items-center rounded-full border border-glass-border bg-glass-strong px-2 shadow-glass-soft backdrop-blur-glass lg:hidden"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tab('/', 'Beranda', Home)}
      <button
        type="button"
        onClick={onMatkul}
        aria-expanded={matkulOpen}
        className={cn(
          'flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-bold transition-colors',
          pathname.startsWith('/matkul') || matkulOpen ? 'text-ink' : 'text-muted',
        )}
      >
        <BookOpen aria-hidden className={cn('size-5', pathname.startsWith('/matkul') && 'text-accent')} />
        Matkul
      </button>
      {tab('/keuangan?scan=1', 'Scan', Camera)}
      {tab('/harian', 'Harian', HeartPulse)}
      {tab('/keuangan', 'Uang', Wallet)}
    </nav>
  );
}

/* ------------------------------------------------- lembar menu (HP) */
function Sheet({ jenis, pathname, onClose }: { jenis: 'menu' | 'matkul'; pathname: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label={jenis === 'menu' ? 'Menu' : 'Mata kuliah'}>
      <button type="button" aria-label="Tutup" onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="absolute inset-x-3 bottom-3 max-h-[82dvh] overflow-y-auto rounded-2xl bg-surface p-4 shadow-xl"
        style={{ animation: 'rise .35s var(--ease-out) both', marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{jenis === 'menu' ? 'Menu' : 'Mata kuliah'}</p>
          <button type="button" onClick={onClose} aria-label="Tutup menu" className="flex size-9 items-center justify-center rounded-full bg-navy-5">
            <X aria-hidden className="size-4" />
          </button>
        </div>

        <ul className="grid gap-2">
          {META.map(c => (
            <li key={c.id}>
              <Link
                href={`/matkul/${c.id}`}
                aria-current={pathname === `/matkul/${c.id}` ? 'page' : undefined}
                className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 active:scale-[.99]"
                style={{ background: pathname === `/matkul/${c.id}` ? c.pale : undefined }}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg text-[13px] font-extrabold text-white" style={{ background: c.accent }}>
                  {c.short.slice(0, 3).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-[15px] font-bold text-ink">
                    {shortName(c)}
                    {c.fokus && <span className="rounded-full bg-pink-pale px-2 py-0.5 text-[10.5px] font-bold text-accent-hover">Prioritas</span>}
                  </span>
                  <span className="block truncate text-[12.5px] text-muted">{c.name}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {jenis === 'menu' && (
          <>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {LINKS.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'rounded-xl border border-border px-4 py-3 text-[15px] font-bold',
                    aktifDi(pathname, l.href) ? 'bg-navy text-white' : 'text-ink',
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-[0.2em] text-muted">Tautan</p>
            <div className="flex flex-wrap gap-2">
              {TAUTAN_LUAR.map(t => (
                <a key={t.label} href={t.url} target="_blank" rel="noreferrer" className="chip">
                  {t.label} <ExternalLink aria-hidden className="size-3.5" />
                </a>
              ))}
              <button type="button" onClick={() => { onClose(); bukaSapaan(); }} className="chip">
                Sapaan <Sparkles aria-hidden className="size-3.5" />
              </button>
            </div>
            {!localMode && (
              <button type="button" onClick={keluar} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-border py-3 text-sm font-bold text-red">
                <LogOut aria-hidden className="size-4" /> Keluar dari akun
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
