import { buildDigest, renderDigestHtml } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Pratinjau isi email persis seperti yang akan dikirim. */
export async function GET() {
  const html = renderDigestHtml(buildDigest());
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
