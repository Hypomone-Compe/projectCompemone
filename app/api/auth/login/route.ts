import { NextResponse } from 'next/server';
import { isAllowedEmail, supabaseConfigured } from '@/lib/supabase/config';
import { getServerSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';

/* Masuk dengan email + kata sandi. Email selain pemilik ditolak SEBELUM
   Supabase dihubungi, dengan pesan yang sama seperti sandi salah supaya
   halaman ini tidak bisa dipakai menebak alamat mana yang terdaftar. */
export async function POST(request: Request) {
  if (!supabaseConfigured) {
    return NextResponse.json(
      { error: 'Supabase belum dikonfigurasi: isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY.' },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as { email?: string; password?: string };
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (!isAllowedEmail(email) || !password) {
    return NextResponse.json({ error: 'Email atau kata sandi salah.' }, { status: 401 });
  }

  const supabase = (await getServerSupabase())!;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const pesan = /rate|too many/i.test(error.message)
      ? 'Terlalu banyak percobaan. Tunggu beberapa menit.'
      : 'Email atau kata sandi salah.';
    return NextResponse.json({ error: pesan }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
