import { NextResponse } from 'next/server';
import { buildDigest, RECIPIENT, sendDigest } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Kirim manual dari tombol di beranda. Sudah dilindungi middleware sesi. */
export async function POST() {
  const digest = buildDigest();
  const result = await sendDigest({ to: RECIPIENT, digest });
  return NextResponse.json(result, { status: result.ok || result.skipped ? 200 : 502 });
}
