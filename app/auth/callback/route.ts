import { NextResponse, type NextRequest } from 'next/server';
import { isAllowedEmail } from '@/lib/supabase/config';
import { getServerSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';

/* Tujuan tautan masuk dari email: tukar kode jadi sesi, lalu ke halaman asal. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/';
  const supabase = await getServerSupabase();

  if (code && supabase) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && isAllowedEmail(data.user?.email)) {
      return NextResponse.redirect(new URL(next.startsWith('/') ? next : '/', url.origin));
    }
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL('/login?e=tautan', url.origin));
}
