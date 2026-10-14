import { NextResponse, type NextRequest } from 'next/server';
import { buildDigest, RECIPIENT, sendDigest } from '@/lib/email';
import { DAY_NAMES, parseYmd } from '@/lib/plan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Dipanggil Vercel Cron (lihat vercel.json). Middleware sengaja melewati
   rute ini, jadi CRON_SECRET adalah satu-satunya penjaga, set di Vercel. */
function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  if ((request.headers.get('authorization') || '') === `Bearer ${secret}`) return true;
  return request.nextUrl.searchParams.get('key') === secret;
}

/* Senin, Rabu, Jumat. Angka mengikuti getUTCDay(): 1 = Senin.

   Hanya ada SATU cron di vercel.json, berjalan tiap hari, dan hari kirimnya
   disaring di sini. Bukan tiga entri cron terpisah karena paket Vercel Hobby
   membatasi jumlah cron job; satu jadwal harian plus saringan ini memberi
   jumlah hari kirim berapa pun tanpa menyentuh batas itu, dan menambah atau
   mengurangi hari nanti cukup mengubah satu baris. */
const HARI_KIRIM = new Set([1, 3, 5]);

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Tidak diizinkan.' }, { status: 401 });
  }

  const digest = buildDigest();

  /* Di luar masa kuliah tidak ada yang perlu dikabarkan. */
  if (digest.status.phase !== 'run') {
    return NextResponse.json({ ok: true, skipped: true, reason: `Fase semester: ${digest.status.phase}` });
  }

  const hari = parseYmd(digest.today).getUTCDay();
  /* `paksa` dipakai saat menguji dari peramban di hari mana pun. */
  const paksa = request.nextUrl.searchParams.get('paksa') === '1';
  if (!paksa && !HARI_KIRIM.has(hari)) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: `${DAY_NAMES[hari]} bukan hari kirim. Ringkasan dikirim Senin, Rabu, dan Jumat.`,
    });
  }

  const result = await sendDigest({ to: RECIPIENT, digest });
  return NextResponse.json(result, { status: result.ok || result.skipped ? 200 : 502 });
}
