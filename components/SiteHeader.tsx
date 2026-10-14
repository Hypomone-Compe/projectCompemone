'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { LogoMark } from './Logo';
import { bukaSapaan } from './Sapaan';
import { META, shortName } from '@/lib/courses/meta';
import { TAUTAN_LUAR } from '@/lib/tautan';

export default function SiteHeader() {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  /* Dua menu jatuh: 'matkul' dan 'tautan'. Hanya satu boleh terbuka. */
  const [buka, setBuka] = useState<'matkul' | 'tautan' | null>(null);
  const [busy, setBusy] = useState(false);
  const jatuhRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenu(false);
    setBuka(null);
  }, [pathname]);

  /* Tutup menu jatuh saat klik di luar atau tekan Escape. */
  useEffect(() => {
    if (!buka) return;
    const klik = (e: MouseEvent) => {
      if (!jatuhRef.current?.contains(e.target as Node)) setBuka(null);
    };
    const kunci = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setBuka(null);
    };
    document.addEventListener('mousedown', klik);
    window.addEventListener('keydown', kunci);
    return () => {
      document.removeEventListener('mousedown', klik);
      window.removeEventListener('keydown', kunci);
    };
  }, [buka]);

  async function logout() {
    setBusy(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.assign('/login');
  }

  const diMatkul = pathname.startsWith('/matkul');
  const aktif = (p: string) => pathname === p;

  return (
    <header className="nav no-print">
      <div className="shell flex w-full items-center gap-2 py-3">
        <Link href="/" className="brand mr-2" aria-label="Sandbox, ke beranda">
          <LogoMark size={22} />
          Sandbox
        </Link>

        {/* ---------------- navigasi utama ---------------- */}
        <nav className="hidden items-center gap-1 lg:flex" ref={jatuhRef}>
          <Link href="/" className={`nav__link ${aktif('/') ? 'is-active' : ''}`}>
            Beranda
          </Link>

          <div className="relative">
            <button
              onClick={() => setBuka(v => (v === 'matkul' ? null : 'matkul'))}
              aria-expanded={buka === 'matkul'}
              className={`nav__link ${diMatkul ? 'is-active' : ''}`}
            >
              Mata kuliah
              <span
                aria-hidden="true"
                className="ml-1.5 inline-block text-[0.6rem] transition-transform"
                style={{ transform: buka === 'matkul' ? 'rotate(180deg)' : 'none' }}
              >
                ▾
              </span>
            </button>

            {buka === 'matkul' && (
              <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-[19rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--rule-strong)] bg-[var(--paper)] shadow-[0_18px_50px_rgba(18,18,15,0.22)]">
                {META.map((c, i) => (
                  <Link
                    key={c.id}
                    href={`/matkul/${c.id}`}
                    style={{ '--c': c.accent, '--c-on': c.accentOn } as CSSProperties}
                    className="group flex items-center gap-3 border-b border-[var(--rule)] px-4 py-3 last:border-b-0 hover:bg-[var(--paper-2)]"
                  >
                    <span className="num w-5 text-[0.68rem] muted">{String(i + 1).padStart(2, '0')}</span>
                    <span className="h-6 w-[3px] rounded-full" style={{ background: c.accent }} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.85rem] font-semibold" style={{ letterSpacing: '-0.02em' }}>
                        {shortName(c)}
                      </span>
                      <span className="block truncate text-[0.68rem] muted">{c.name}</span>
                    </span>
                    <span className="text-xs opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true">
                      ↗
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/harian" className={`nav__link ${aktif('/harian') ? 'is-active' : ''}`}>
            Harian
          </Link>

          <Link href="/keuangan" className={`nav__link ${aktif('/keuangan') ? 'is-active' : ''}`}>
            Keuangan
          </Link>

          <Link href="/asdos" className={`nav__link ${aktif('/asdos') ? 'is-active' : ''}`}>
            Asisten dosen
          </Link>

          {/* Empat tautan luar dilipat jadi satu menu. Berjajar sebagai tombol
              terpisah, header meluber di layar 1100px dan halaman ikut bergeser
              ke samping. Bentuk ini juga tahan kalau nanti tautannya bertambah. */}
          <div className="relative">
            <button
              onClick={() => setBuka(v => (v === 'tautan' ? null : 'tautan'))}
              aria-expanded={buka === 'tautan'}
              className="nav__link"
            >
              Tautan
              <span
                aria-hidden="true"
                className="ml-1.5 inline-block text-[0.6rem] transition-transform"
                style={{ transform: buka === 'tautan' ? 'rotate(180deg)' : 'none' }}
              >
                ▾
              </span>
            </button>

            {buka === 'tautan' && (
              <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-[17rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--rule-strong)] bg-[var(--paper)] shadow-[0_18px_50px_rgba(18,18,15,0.22)]">
                {TAUTAN_LUAR.map(t => (
                  <a
                    key={t.label}
                    href={t.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-3 border-b border-[var(--rule)] px-4 py-3 last:border-b-0 hover:bg-[var(--paper-2)]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.85rem] font-semibold" style={{ letterSpacing: '-0.02em' }}>
                        {t.label}
                      </span>
                      <span className="block truncate text-[0.68rem] muted">{t.ket}</span>
                    </span>
                    <span className="text-xs opacity-40 transition-opacity group-hover:opacity-100" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* ---------------- aksi ---------------- */}
        <div className="ml-auto flex items-center gap-2">

          <button
            onClick={bukaSapaan}
            title="Tampilkan sapaan hari ini"
            aria-label="Tampilkan sapaan hari ini"
            className="hidden h-[2.1rem] w-[2.1rem] place-items-center rounded-full border border-[var(--rule-strong)] transition-colors hover:border-[var(--ink)] sm:grid"
          >
            <span aria-hidden="true" style={{ fontSize: '0.9rem', lineHeight: 1 }}>
              ✦
            </span>
          </button>

          <button onClick={logout} disabled={busy} className="hidden btn btn--ghost btn--sm lg:inline-flex">
            {busy ? '…' : 'Keluar'}
          </button>

          <button
            onClick={() => setMenu(v => !v)}
            className="btn btn--ghost btn--sm lg:hidden"
            aria-expanded={menu}
          >
            {menu ? 'Tutup' : 'Menu'}
          </button>
        </div>
      </div>

      {/* ---------------- menu layar kecil ---------------- */}
      {menu && (
        <div className="absolute inset-x-0 top-full max-h-[calc(100dvh-var(--nav-h))] overflow-y-auto border-b border-[var(--rule-strong)] bg-[var(--paper)] shadow-lg lg:hidden">
          <Link href="/" className="block border-b border-[var(--rule)] px-[var(--gutter)] py-4 font-semibold">
            Beranda
          </Link>

          {META.map((c, i) => (
            <Link
              key={c.id}
              href={`/matkul/${c.id}`}
              className="flex items-center gap-3 border-b border-[var(--rule)] px-[var(--gutter)] py-3.5"
            >
              <span className="num w-5 text-[0.68rem] muted">{String(i + 1).padStart(2, '0')}</span>
              <span className="h-5 w-[3px] rounded-full" style={{ background: c.accent }} />
              <span className="text-[0.9rem] font-semibold" style={{ letterSpacing: '-0.02em' }}>
                {shortName(c)}
              </span>
            </Link>
          ))}

          <Link
            href="/harian"
            className="block border-b border-[var(--rule)] px-[var(--gutter)] py-4 font-semibold"
          >
            Harian
          </Link>

          <Link
            href="/keuangan"
            className="block border-b border-[var(--rule)] px-[var(--gutter)] py-4 font-semibold"
          >
            Keuangan
          </Link>

          <Link
            href="/asdos"
            className="block border-b border-[var(--rule)] px-[var(--gutter)] py-4 font-semibold"
          >
            Asisten dosen
          </Link>

          <div className="flex flex-wrap gap-2 border-b border-[var(--rule)] px-[var(--gutter)] py-4">
            {TAUTAN_LUAR.map(t => (
              <a key={t.label} href={t.url} target="_blank" rel="noreferrer" className="btn btn--ghost btn--sm">
                {t.label} <span aria-hidden="true">↗</span>
              </a>
            ))}
            <button onClick={bukaSapaan} className="btn btn--ghost btn--sm">
              Sapaan ✦
            </button>
          </div>

          <button onClick={logout} className="w-full px-[var(--gutter)] py-4 text-left text-sm muted">
            Keluar dari akun
          </button>
        </div>
      )}
    </header>
  );
}
