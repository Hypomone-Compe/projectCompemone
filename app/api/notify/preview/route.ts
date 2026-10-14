import { buildDigest, renderDigestHtml } from '@/lib/email';
import { ambilDataPribadi } from '@/lib/email-pribadi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Pratinjau isi email persis seperti yang akan dikirim pagi ini. */
export async function GET() {
  const digest = buildDigest();
  digest.pribadi = await ambilDataPribadi(digest.today);
  return new Response(renderDigestHtml(digest), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
