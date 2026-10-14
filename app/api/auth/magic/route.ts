import { NextResponse } from 'next/server';
import { isAllowedEmail, supabaseConfigured } from '@/lib/supabase/config';
import { getServerSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';

/* Tautan masuk lewat email, untuk ponsel yang belum menyimpan kata sandi.
   shouldCreateUser: false → tautan ini TIDAK PERNAH membuat akun baru.
   Jawabannya selalu sama, terdaftar atau tidak. */
export async function POST(request: Request) {
  if (!supabaseConfigured) {
    return NextResponse.json({ error: 'Supabase belum dikonfigurasi.' }, { status: 503 });
  }
  const body = (await request.json().catch(() => ({}))) as { email?: string; next?: string };
  const email = String(body.email || '').trim().toLowerCase();
  const next = typeof body.next === 'string' && body.next.startsWith('/') ? body.next : '/';

  if (isAllowedEmail(email)) {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const supabase = (await getServerSupabase())!;
    await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${origin.replace(/\/$/, '')}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }
  return NextResponse.json({ ok: true });
}
