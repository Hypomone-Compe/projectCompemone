import { NextResponse, type NextRequest } from 'next/server';
import { buildDigest, RECIPIENT, sendDigest } from '@/lib/email';
import { ambilDataPribadi } from '@/lib/email-pribadi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Dipanggil Vercel Cron SETIAP HARI pukul 06.00 WIB (lihat vercel.json).
   Middleware sengaja melewati rute ini, jadi CRON_SECRET adalah satu-satunya
   penjaga; Vercel mengirimnya sebagai Bearer token. */
function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  if ((request.headers.get('authorization') || '') === `Bearer ${secret}`) return true;
  return request.nextUrl.searchParams.get('key') === secret;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Tidak diizinkan.' }, { status: 401 });
  }

  const digest = buildDigest();
  const paksa = request.nextUrl.searchParams.get('paksa') === '1';

  /* Di luar masa kuliah tidak ada yang perlu dikabarkan (kecuali dipaksa saat menguji). */
  if (!paksa && digest.status.phase !== 'run') {
    return NextResponse.json({ ok: true, skipped: true, reason: `Fase semester: ${digest.status.phase}` });
  }

  digest.pribadi = await ambilDataPribadi(digest.today);
  const result = await sendDigest({ to: RECIPIENT, digest });
  return NextResponse.json(result, { status: result.ok || result.skipped ? 200 : 502 });
}
