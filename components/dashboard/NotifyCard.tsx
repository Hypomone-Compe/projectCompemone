'use client';

import { useState } from 'react';

type State = { kind: 'idle' | 'busy' | 'ok' | 'warn' | 'err'; msg: string };

export default function NotifyCard({ to, configured }: { to: string; configured: boolean }) {
  const [state, setState] = useState<State>({ kind: 'idle', msg: '' });

  async function send() {
    setState({ kind: 'busy', msg: '' });
    try {
      const res = await fetch('/api/notify/send', { method: 'POST' });
      const d = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        skipped?: boolean;
        reason?: string;
        error?: string;
        to?: string;
      };
      if (d.ok) setState({ kind: 'ok', msg: `Terkirim ke ${d.to}.` });
      else if (d.skipped) setState({ kind: 'warn', msg: d.reason || 'Pengiriman dilewati.' });
      else setState({ kind: 'err', msg: d.error || 'Gagal mengirim.' });
    } catch {
      setState({ kind: 'err', msg: 'Tidak bisa menghubungi server.' });
    }
  }

  return (
    <div className="on-dark relative overflow-hidden rounded-2xl px-[clamp(1.4rem,3vw,2.6rem)] py-[clamp(1.6rem,3vw,2.6rem)] shadow-lg">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(214,76,111,.35), transparent 70%)' }}
      />
      <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <span className="eyebrow" style={{ color: 'var(--pink-light)' }}>
            Email harian · {configured ? 'aktif' : 'belum aktif'}
          </span>

          <h3 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Ringkasan harian, setiap pagi <span className="text-pink-light">pukul 06.00 WIB.</span>
          </h3>

          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/75">
            Dikirim ke <b className="num text-white">{to}</b> <b className="text-pink-light">setiap hari</b>, termasuk
            akhir pekan. Isinya jadwal kuliah hari itu, kuis &amp; lab dua pekan ke depan, deadline minggu berjalan,
            checklist yang belum dicentang, bocoran minggu depan, dan ringkasan pengeluaran kemarin.
          </p>

          {!configured && (
            <p className="mt-4 text-xs leading-relaxed muted">
              Set <code className="rich">RESEND_API_KEY</code> dan <code className="rich">CRON_SECRET</code> di
              Vercel untuk menyalakannya.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5">
          <a href="/api/notify/preview" target="_blank" rel="noreferrer" className="btn btn--ghost">
            Lihat isi email
          </a>
          <button onClick={send} disabled={state.kind === 'busy'} className="btn btn--light">
            {state.kind === 'busy' ? 'Mengirim…' : 'Kirim sekarang'}
            <span className="btn__arrow">→</span>
          </button>
        </div>
      </div>

      {state.msg && (
        <p
          role="status"
          className={`alert mt-6 text-sm ${state.kind === 'ok' ? 'alert--lime' : state.kind === 'err' ? 'alert--red' : 'alert--amber'}`}
        >
          {state.msg}
        </p>
      )}
    </div>
  );
}
