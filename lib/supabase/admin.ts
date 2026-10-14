import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from './config';

const SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '').trim();

/**
 * Klien service role, melewati RLS. HANYA untuk cron email harian yang berjalan
 * tanpa sesi pengguna. Jangan pernah diimpor dari komponen klien.
 */
export function getAdminSupabase() {
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
