import { ALLOWED_EMAIL } from './supabase/config';

/** Penerima ringkasan harian. Default: satu-satunya akun situs ini. */
export const RECIPIENT = (process.env.NOTIFY_TO || ALLOWED_EMAIL).trim();

export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}
