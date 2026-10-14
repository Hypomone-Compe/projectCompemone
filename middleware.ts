import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_NAME, readSession } from './lib/auth';

/* Semua halaman tertutup kecuali /login dan endpoint auth/cron. */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await readSession(request.cookies.get(COOKIE_NAME)?.value);

  if (pathname === '/login') {
    if (session) return NextResponse.redirect(new URL('/', request.url));
    return NextResponse.next();
  }

  if (!session) {
    const url = new URL('/login', request.url);
    if (pathname !== '/') url.searchParams.set('next', pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  /* Lewati aset statis, endpoint auth, dan cron (dilindungi CRON_SECRET).

     Berkas PWA ikut dilewatkan dan itu wajib, bukan pilihan: /sw.js dan
     /manifest.webmanifest diambil peramban tanpa membawa harapan akan
     dialihkan. Kalau keduanya kena middleware, yang sampai ke peramban adalah
     halaman /login, service worker gagal didaftarkan, dan tombol pasang tidak
     pernah muncul, semuanya tanpa pesan galat yang menunjuk ke sini.

     /offline juga dilewatkan karena disinggah saat service worker dipasang,
     yaitu saat sesi belum tentu ada. Isinya memang tidak memuat data apa pun. */
  matcher: [
    '/((?!_next/static|_next/image|favicon|icon|apple-icon|manifest|sw\\.js|icons|offline|robots|api/auth|api/cron).*)',
  ],
};
