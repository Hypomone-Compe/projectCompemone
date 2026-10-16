/* ==========================================================================
   Bagian pribadi email harian: dibaca dari Supabase dengan service role,
   karena cron berjalan tanpa sesi pengguna.

   Kalau SUPABASE_SERVICE_ROLE_KEY belum di-set, email tetap terkirim tanpa
   bagian ini (agenda BRP tidak butuh database).
   ========================================================================== */
import 'server-only';
import { COURSES, shortName } from './courses';
import { statusTenggat, tenggatTarget, tuntasTarget, urutTarget, type HarianState } from './harian';
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
  /** Target belum tuntas yang tenggatnya hari ini, besok, atau sudah lewat. */
  target: { teks: string; periode: string; label: string; lewat: boolean }[];
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

    /* Target dengan tenggat dekat. Email terkirim 06.00, jadi jam tenggat dihitung dari 06.00. */
    const harian = (slices.harian || {}) as Partial<HarianState>;
    const besok = ymd(addDays(parseYmd(today), 1));
    const NAMA_PERIODE: Record<string, string> = { hari: 'Hari ini', pekan: 'Pekanan', bulan: 'Bulanan' };
    const target = urutTarget(harian.target || [])
      .filter(t => !tuntasTarget(t) && tenggatTarget(t) <= besok && (t.periode !== 'hari' || t.kunci === today))
      .slice(0, 8)
      .map(t => {
        const st = statusTenggat(t, today, 6 * 60);
        return { teks: t.teks, periode: NAMA_PERIODE[t.periode] || t.periode, label: st.label, lewat: st.nada === 'lewat' };
      });

    return {
      target,
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
