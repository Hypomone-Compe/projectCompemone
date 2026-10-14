/* ==========================================================================
   Bagian pribadi email harian: dibaca dari Supabase dengan service role,
   karena cron berjalan tanpa sesi pengguna.

   Kalau SUPABASE_SERVICE_ROLE_KEY belum di-set, email tetap terkirim tanpa
   bagian ini (agenda BRP tidak butuh database).
   ========================================================================== */
import 'server-only';
import { COURSES, shortName } from './courses';
import { addDays, mondayOf, parseYmd, ymd } from './kalender';
import type { Anggaran } from './keuangan';
import { getAdminSupabase } from './supabase/admin';
import { ALLOWED_EMAIL } from './supabase/config';

export interface DataPribadi {
  checklist: { teks: string; matkul: string | null; accent: string | null }[];
  checklistSelesai: number;
  kemarin: { keluar: number; jumlah: number; tanggal: string };
  bulanIni: { keluar: number; masuk: number; anggaran: number };
  prioritas: { nama: string; accent: string; paham: number; total: number }[];
}

export async function ambilDataPribadi(today: string): Promise<DataPribadi | null> {
  const sb = getAdminSupabase();
  if (!sb) return null;
  try {
    const { data: users } = await sb.auth.admin.listUsers({ page: 1, perPage: 50 });
    const user = users?.users.find(u => (u.email || '').toLowerCase() === ALLOWED_EMAIL);
    if (!user) return null;

    const kemarin = ymd(addDays(parseYmd(today), -1));
    const awalBulan = `${today.slice(0, 7)}-01`;
    const [state, trx] = await Promise.all([
      sb.from('app_state').select('slice,data').eq('user_id', user.id),
      sb.from('transaksi').select('tanggal,jenis,jumlah').eq('user_id', user.id).gte('tanggal', kemarin < awalBulan ? kemarin : awalBulan),
    ]);
    const slices = Object.fromEntries((state.data || []).map(r => [r.slice as string, r.data as unknown]));

    /* Checklist minggu berjalan. */
    const plans = (slices.plans || {}) as Record<string, { items?: { text: string; cid: string | null; done: boolean }[] }>;
    const items = plans[mondayOf(today)]?.items || [];
    const byId = Object.fromEntries(COURSES.map(c => [c.id, c]));
    const checklist = items
      .filter(i => !i.done)
      .map(i => ({ teks: i.text, matkul: i.cid && byId[i.cid] ? shortName(byId[i.cid]) : null, accent: i.cid ? byId[i.cid]?.accent ?? null : null }));

    /* Keuangan. */
    const rows = (trx.data || []) as { tanggal: string; jenis: string; jumlah: number }[];
    const kemarinRows = rows.filter(r => r.tanggal === kemarin && r.jenis === 'keluar');
    const bulanRows = rows.filter(r => r.tanggal >= awalBulan);
    const anggaran = ((slices.anggaran || {}) as Partial<Anggaran>).bulanan || 0;

    /* Pemahaman matkul prioritas. */
    const prioritas = COURSES.filter(c => c.fokus).map(c => {
      const prog = (slices[`progress:${c.id}`] || {}) as Record<string, { s?: string }>;
      return {
        nama: shortName(c),
        accent: c.accent,
        paham: c.topics.filter(t => prog[t.id]?.s === 'paham').length,
        total: c.topics.length,
      };
    });

    return {
      checklist,
      checklistSelesai: items.filter(i => i.done).length,
      kemarin: { keluar: kemarinRows.reduce((a, r) => a + Number(r.jumlah), 0), jumlah: kemarinRows.length, tanggal: kemarin },
      bulanIni: {
        keluar: bulanRows.filter(r => r.jenis === 'keluar').reduce((a, r) => a + Number(r.jumlah), 0),
        masuk: bulanRows.filter(r => r.jenis === 'masuk').reduce((a, r) => a + Number(r.jumlah), 0),
        anggaran,
      },
      prioritas,
    };
  } catch (e) {
    console.warn('[email] data pribadi gagal dibaca', e);
    return null;
  }
}
