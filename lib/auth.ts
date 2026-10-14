/* ==========================================================================
   Autentikasi satu pengguna.

   Tidak ada satu pun kredensial yang ditulis di berkas ini. Semuanya dibaca
   dari environment variable, dan kalau salah satunya kosong situs memilih
   GAGAL TERKUNCI: login selalu ditolak, bukan jatuh ke kata sandi cadangan
   yang bisa dibaca siapa pun di repositori.

   Dipakai baik oleh route handler (Node) maupun middleware (Edge), jadi
   semuanya memakai Web Crypto lewadasdadsaat `jose`, tanpa API khusus Node.
   ========================================================================== */
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export const COOKIE_NAME = 'sandbox_session';
export const SESSION_DAYS = 30;

export const AUTH_EMAIL = (process.env.AUTH_EMAIL || '').trim().toLowerCase();
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || '';
const SECRET = process.env.AUTH_SECRET || '';

/** Ketiganya wajib ada sebelum situs bisa dimasuki. */
export const authConfigured = Boolean(AUTH_EMAIL && AUTH_PASSWORD && SECRET.length >= 16);

const key = SECRET ? new TextEncoder().encode(SECRET) : null;

/** Perbandingan waktu-konstan sederhana, supaya tidak bocor lewat timing. */
function safeEqual(a: string, b: string): boolean {
  const x = String(a);
  const y = String(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    diff |= x.charCodeAt(i % (x.length || 1)) ^ y.charCodeAt(i % (y.length || 1));
  }
  return diff === 0;
}

// wou udahlah
// agw cepaeoajdoja
// ads
// ad
// ad
// a

export function checkCredentials(email: unknown, password: unknown): boolean {
  if (!authConfigured) return false;
  const e = String(email || '').trim().toLowerCase();
  return safeEqual(e, AUTH_EMAIL) && safeEqual(String(password || ''), AUTH_PASSWORD);
}

export async function createSession(email: string): Promise<string> {
  if (!key) throw new Error('AUTH_SECRET belum di-set.');
  return new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setSubject(email)
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key);
}

export async function readSession(token: string | undefined): Promise<JWTPayload | null> {
  if (!token || !key) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
    return payload;
  } catch {
    return null;
  }
}

export const cookieOptions = {
  name: COOKIE_NAME,
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_DAYS * 24 * 60 * 60,
};
