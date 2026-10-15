'use client';

import { useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { Alert, Button, Field, Input } from '@/components/ui';

type Mode = 'sandi' | 'tautan';

export default function LoginForm() {
  const params = useSearchParams();
  const next = params.get('next') || '/';

  const [mode, setMode] = useState<Mode>('sandi');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setInfo('');
    setBusy(true);
    try {
      if (mode === 'tautan') {
        await fetch('/api/auth/magic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, next }),
        });
        setInfo('Kalau email itu pemilik situs ini, tautan masuk sudah dikirim. Buka dari perangkat ini.');
        setBusy(false);
        return;
      }
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
      /* Navigasi penuh: cookie sesi baru saja dipasang, cache RSC masih versi "belum masuk". */
      window.location.assign(next.startsWith('/') ? next : '/');
    } catch {
      setError('Tidak bisa menghubungi server. Coba lagi.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          type="email"
          required
          autoComplete="username"
          inputMode="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="nama@gmail.com"
        />
      </Field>

      {mode === 'sandi' && (
        <Field label="Kata sandi" htmlFor="password">
          <div className="relative">
            <Input
              id="password"
              type={show ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShow(v => !v)}
              aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-navy-5 hover:text-ink"
            >
              {show ? <EyeOff aria-hidden className="size-[18px]" /> : <Eye aria-hidden className="size-[18px]" />}
            </button>
          </div>
        </Field>
      )}

      {error && <Alert variant="error">{error}</Alert>}
      {info && <Alert variant="success">{info}</Alert>}

      <Button type="submit" size="lg" disabled={busy} className="w-full">
        {busy ? 'Memeriksa…' : mode === 'sandi' ? 'Masuk' : 'Kirim tautan masuk'}
      </Button>

      <div className="flex items-center gap-3 text-[12.5px] font-semibold text-faint">
        <span className="h-px flex-1 bg-divider" /> atau <span className="h-px flex-1 bg-divider" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => {
          setMode(m => (m === 'sandi' ? 'tautan' : 'sandi'));
          setError('');
          setInfo('');
        }}
      >
        {mode === 'sandi' ? (
          <>
            <Mail aria-hidden /> Masuk lewat tautan email
          </>
        ) : (
          'Masuk dengan kata sandi'
        )}
      </Button>

      <p className="pt-1 text-center text-[12.5px] leading-relaxed text-muted">
        Sesi tetap aktif di perangkat ini. Data disimpan di Supabase dan hanya bisa dibaca akun pemilik.
      </p>
    </form>
  );
}
