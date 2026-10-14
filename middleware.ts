import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isAllowedEmail, localMode, SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from './lib/supabase/config';

/* Halaman yang boleh dibuka tanpa sesi. Selain ini, semua dialihkan ke /login. */
const PUBLIK = ['/login', '/auth/callback'];

/* ==========================================================================
   Penjaga seluruh halaman.

   1. Menyegarkan sesi Supabase (token di cookie) setiap permintaan.
   2. Tanpa sesi → /login. Tidak ada halaman daftar; akun dibuat sekali
      di dasbor Supabase.
   3. Sesi milik email selain ALLOWED_EMAIL → dikeluarkan paksa. Lapis kedua
      ada di RLS database dan trigger auth.users (lihat supabase/schema.sql).
   ========================================================================== */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const publik = PUBLIK.some(p => pathname === p || pathname.startsWith(p + '/'));

  if (localMode) return NextResponse.next();

  if (!supabaseConfigured) {
    /* Produksi tanpa Supabase: situs terkunci, halaman masuk menjelaskan sebabnya. */
    if (publik || pathname.startsWith('/api/')) return NextResponse.next();
    return NextResponse.redirect(new URL('/login', request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: list => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && !isAllowedEmail(user.email)) {
    await supabase.auth.signOut();
    const url = new URL('/login', request.url);
    url.searchParams.set('e', 'akses');
    const keluar = NextResponse.redirect(url);
    response.cookies.getAll().forEach(c => keluar.cookies.set(c));
    return keluar;
  }

  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!user && !publik) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Belum masuk.' }, { status: 401 });
    }
    const url = new URL('/login', request.url);
    if (pathname !== '/') url.searchParams.set('next', pathname + search);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  /* Aset statis, berkas PWA, endpoint login, dan cron (dijaga CRON_SECRET)
     dilewatkan. Berkas PWA WAJIB lewat: kalau /sw.js atau manifest dialihkan ke
     /login, service worker gagal dipasang tanpa pesan galat yang jelas. */
  matcher: [
    '/((?!_next/static|_next/image|favicon|icon|apple-icon|manifest|sw\\.js|icons|images|fonts|offline|robots|api/auth|api/cron).*)',
  ],
};
