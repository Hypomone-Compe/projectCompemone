'use client';

import { useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export default function LoginForm() {
  const params = useSearchParams();
  const next = params.get('next') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || 'Gagal masuk.');
        setBusy(false);
        return;
      }
      /* Navigasi penuh, bukan router.replace: cookie sesi baru saja dipasang
         dan cache RSC klien masih memegang versi "belum login". */
      window.location.assign(next.startsWith('/') ? next : '/');
    } catch {
      setError('Tidak bisa menghubungi server. Coba lagi.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5" style={{ '--c': 'var(--ink)' } as React.CSSProperties}>
      <div>
        <label htmlFor="email" className="field__label">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="nama@gmail.com"
          className="input"
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="password" className="field__label">
            Kata sandi
          </label>
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            className="field__label transition-colors hover:text-[var(--ink)]"
          >
            {show ? 'Sembunyikan' : 'Tampilkan'}
          </button>
        </div>
        <input
          id="password"
          type={show ? 'text' : 'password'}
          required
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          className="input"
        />
      </div>

      {error && (
        <p role="alert" className="alert alert--red text-sm">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn btn--block !py-4">
        {busy ? 'Memeriksa…' : 'Masuk'}
        <span className="btn__arrow">→</span>
      </button>

      <p className="border-t border-[var(--rule)] pt-4 text-xs leading-relaxed muted">
        Sesi bertahan 30 hari di perangkat ini. Kredensial disimpan sebagai environment variable di
        Vercel, tidak ada satu pun yang tertulis di dalam kode.
      </p>
    </form>
  );
}
