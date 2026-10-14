/* ==========================================================================
   Konfigurasi Supabase dan satu-satunya akun yang boleh masuk.

   Tidak ada kunci rahasia di berkas ini. URL dan anon key memang publik
   (keamanannya dijaga Row Level Security di database), sedangkan service
   role key hanya dibaca di lib/supabase/admin.ts, khusus server.
   ========================================================================== */

export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
export const SUPABASE_ANON_KEY = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  ''
).trim();

/** Situs ini untuk satu orang. Email lain ditolak di middleware, di route login, dan di RLS. */
export const ALLOWED_EMAIL = (process.env.NEXT_PUBLIC_ALLOWED_EMAIL || 'lvnasandbox@gmail.com').trim().toLowerCase();

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * Mode lokal: Supabase belum diisi DAN sedang `npm run dev`. Situs bisa dibuka
 * tanpa login dan data hanya tersimpan di peramban. Di build produksi mode ini
 * mustahil aktif, jadi deploy tanpa Supabase tetap terkunci.
 */
export const localMode = !supabaseConfigured && process.env.NODE_ENV !== 'production';

export const isAllowedEmail = (email: unknown) =>
  typeof email === 'string' && email.trim().toLowerCase() === ALLOWED_EMAIL;
