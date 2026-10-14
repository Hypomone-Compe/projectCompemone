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
    <div className="on-dark rounded-[var(--radius-lg)] px-[clamp(1.4rem,3vw,2.6rem)] py-[clamp(1.6rem,3vw,2.6rem)]">
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <span className="eyebrow" style={{ color: 'var(--lime)' }}>
            {configured ? 'Aktif' : 'Belum aktif'}
          </span>

          <h3 className="display mt-4" style={{ fontSize: 'var(--t-lg)' }}>
            Ringkasan mingguan mendarat di <span className="serif">kotak masukmu.</span>
          </h3>

          <p className="lede mt-4 text-[0.95rem]">
            Dikirim ke <b className="num" style={{ color: 'var(--paper)' }}>{to}</b> setiap{' '}
            <b style={{ color: 'var(--lime)' }}>Senin</b>,{' '}
            <b style={{ color: 'var(--lime)' }}>Rabu</b>, dan{' '}
            <b style={{ color: 'var(--lime)' }}>Jumat pukul 06.00 WIB</b>. Isinya rundown hari itu,
            pengingat kuis &amp; tutorial lab dua pekan ke depan, tugas &amp; deadline minggu
            berjalan, bocoran minggu depan, dan jadwal kuliah tetap.
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
