import { NextResponse } from 'next/server';
import { authConfigured, checkCredentials, cookieOptions, createSession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!authConfigured) {
    return NextResponse.json(
      { error: 'Situs belum dikonfigurasi: set AUTH_EMAIL, AUTH_PASSWORD, dan AUTH_SECRET.' },
      { status: 503 },
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const { email, password } = body || {};

  if (!checkCredentials(email, password)) {
    /* Jeda kecil supaya percobaan tebak-tebakan tidak murah. */
    await new Promise(r => setTimeout(r, 600));
    return NextResponse.json({ error: 'Email atau kata sandi salah.' }, { status: 401 });
  }

  const token = await createSession(String(email).trim().toLowerCase());
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ ...cookieOptions, value: token });
  return res;
}
