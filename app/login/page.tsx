import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';
import { Lock } from 'lucide-react';
import { Alert } from '@/components/ui';
import { MeshGradient } from '@/components/webgl';
import { META, shortName, TOTAL_SKS } from '@/lib/courses/meta';
import { TOTAL_WEEKS } from '@/lib/kalender';
import { supabaseConfigured } from '@/lib/supabase/config';
import LoginForm from './LoginForm';

export const metadata: Metadata = { title: 'Masuk' };

const PESAN: Record<string, string> = {
  akses: 'Akun itu tidak punya akses. Hypomonē hanya untuk satu pemilik.',
  tautan: 'Tautan masuk sudah kedaluwarsa atau tidak sah. Minta tautan baru.',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;

  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-white">
      <MeshGradient className="-z-10 h-full" />

      {/* Bilah atas: pill kaca seperti navbar, tanpa menu (belum masuk). */}
      <header className="px-3 pt-4 sm:px-5">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between rounded-full border border-glass-border bg-glass-strong py-2 pl-3 pr-4 shadow-glass-soft backdrop-blur-glass sm:pl-5">
          <span className="flex items-center gap-2.5 text-[17px] font-extrabold tracking-tight text-navy">
            <Image src="/images/logo-bem-ui.png" alt="" width={876} height={876} priority className="size-9" />
            Hypomonē <span className="text-accent">@GRIT</span>
          </span>
          <span className="flex items-center gap-1.5 text-[13px] font-bold text-secondary">
            <Lock aria-hidden className="size-3.5" /> Akses pribadi
          </span>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-wrap flex-1 items-center gap-12 px-5 py-12 lg:grid-cols-[1.15fr_minmax(0,420px)] lg:gap-16">
        <div className="text-center lg:text-left">
          <span className="inline-flex rounded-full bg-pink-pale px-[13px] py-[5px] text-[12.5px] font-bold text-accent-hover">
            Gasal 2026/2027 · {META.length} mata kuliah · {TOTAL_SKS} SKS
          </span>
          <h1 className="mt-6 text-[clamp(2.6rem,7vw,5.2rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-navy">
            Hypomonē
            <br />
            <span className="mt-2 inline-block rounded-2xl border border-glass-border bg-glass-strong px-4 py-1 text-maroon shadow-glass backdrop-blur-glass">
              @GRIT
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-secondary lg:mx-0">
            <i>Hypomonē</i>, ketekunan yang bertahan saat berat. Satu tempat untuk rubrik, deadline, materi,
            nilai, kebiasaan harian, dan keuangan, tersinkron antara laptop dan HP.
          </p>

          <ul className="mt-8 flex flex-wrap justify-center gap-2 lg:justify-start" aria-label="Mata kuliah">
            {META.map(c => (
              <li
                key={c.id}
                className="rounded-full border border-glass-border bg-glass-strong px-3.5 py-1.5 text-[13px] font-bold shadow-glass-soft backdrop-blur-glass"
                style={{ color: c.accent }}
              >
                {shortName(c)}
              </li>
            ))}
            <li className="rounded-full bg-navy px-3.5 py-1.5 text-[13px] font-bold text-white">{TOTAL_WEEKS} minggu</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-xl sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Masuk</p>
          <h2 className="mt-2 text-[26px] font-extrabold tracking-tight">Selamat datang kembali.</h2>
          <p className="mt-1.5 text-[14.5px] text-secondary">Tidak ada pendaftaran. Situs ini hanya bisa dibuka oleh pemiliknya.</p>

          {!supabaseConfigured && (
            <Alert variant="warning" title="Supabase belum dikonfigurasi" className="mt-5">
              Isi <code>NEXT_PUBLIC_SUPABASE_URL</code> dan <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> di Vercel, lalu redeploy.
            </Alert>
          )}
          {e && PESAN[e] && (
            <Alert variant="error" className="mt-5">
              {PESAN[e]}
            </Alert>
          )}

          <Suspense fallback={<div className="mt-6 h-72" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
