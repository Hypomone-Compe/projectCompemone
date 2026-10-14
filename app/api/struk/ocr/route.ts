import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { todayYmd } from '@/lib/kalender';
import { KATEGORI_KELUAR, KATEGORI_MASUK } from '@/lib/keuangan';
import type { HasilStruk } from '@/lib/struk';
import { SEMUA_KATEGORI } from '@/lib/struk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MODEL = 'claude-opus-5-5';
const MEDIA = ['image/jpeg', 'image/png', 'image/webp'] as const;
type Media = (typeof MEDIA)[number];

const aktif = () => Boolean(process.env.ANTHROPIC_API_KEY);

/* Skema keluaran. Structured output menjamin JSON-nya sah; isinya tetap
   ditunjukkan ke pengguna untuk dikoreksi sebelum disimpan. */
const SKEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['terbaca', 'merchant', 'tanggal', 'total', 'jenis', 'kategori', 'items', 'catatan', 'yakin'],
  properties: {
    terbaca: { type: 'boolean', description: 'false kalau gambar bukan struk/bukti transaksi atau tidak terbaca' },
    merchant: { type: ['string', 'null'], description: 'Nama toko, aplikasi, atau pengirim/penerima transfer' },
    tanggal: { type: ['string', 'null'], description: 'Tanggal transaksi format YYYY-MM-DD' },
    total: { type: ['integer', 'null'], description: 'Jumlah akhir yang benar-benar dibayar/diterima, rupiah bulat' },
    jenis: { type: 'string', enum: ['masuk', 'keluar'] },
    kategori: { type: 'string', enum: SEMUA_KATEGORI },
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['nama', 'jumlah'],
        properties: { nama: { type: 'string' }, jumlah: { type: 'integer' } },
      },
    },
    catatan: { type: 'string', description: 'Ringkasan satu baris untuk kolom catatan, bahasa Indonesia' },
    yakin: { type: 'string', enum: ['tinggi', 'sedang', 'rendah'] },
  },
} as const;

/** Klien bertanya: jalur AI tersedia atau pakai OCR di peramban? */
export async function GET() {
  return NextResponse.json({ ai: aktif() });
}

export async function POST(request: Request) {
  if (!aktif()) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY belum di-set; pakai OCR di peramban.' }, { status: 501 });
  }

  const body = (await request.json().catch(() => ({}))) as { data?: string; media?: string };
  const media = (MEDIA as readonly string[]).includes(body.media || '') ? (body.media as Media) : null;
  const data = typeof body.data === 'string' ? body.data.replace(/^data:[^,]+,/, '') : '';
  if (!media || !data || data.length > 7_000_000) {
    return NextResponse.json({ error: 'Gambar tidak sah atau terlalu besar.' }, { status: 400 });
  }

  const client = new Anthropic();
  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SKEMA } },
      system:
        'Kamu membaca foto struk belanja, bukti transfer, atau nota dari Indonesia untuk dicatat sebagai transaksi keuangan pribadi seorang mahasiswa. ' +
        `Hari ini ${todayYmd()} (zona Asia/Jakarta); pakai untuk melengkapi tahun yang tidak tertulis. ` +
        'Total adalah jumlah akhir yang dibayar setelah diskon dan pajak, bukan subtotal, bukan uang tunai yang diserahkan, bukan kembalian. ' +
        'Jenis "masuk" hanya untuk uang yang diterima (transfer masuk, refund, gaji/honor, beasiswa); struk belanja selalu "keluar". ' +
        `Kategori keluar: ${KATEGORI_KELUAR.join(', ')}. Kategori masuk: ${KATEGORI_MASUK.join(', ')}. ` +
        'Kalau ragu, isi null dan turunkan "yakin". Jangan mengarang angka yang tidak terlihat.',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: media, data } },
            { type: 'text', text: 'Baca transaksi di gambar ini.' },
          ],
        },
      ],
    });

    if (response.stop_reason === 'refusal') {
      return NextResponse.json({ error: 'Gambar tidak bisa diproses. Isi manual saja.' }, { status: 422 });
    }
    const teks = response.content.find(b => b.type === 'text');
    if (!teks || teks.type !== 'text') {
      return NextResponse.json({ error: 'Tidak ada hasil. Coba foto ulang.' }, { status: 502 });
    }
    const p = JSON.parse(teks.text) as Omit<HasilStruk, 'sumber'> & { terbaca: boolean };
    if (!p.terbaca) {
      return NextResponse.json({ error: 'Itu tidak terlihat seperti struk atau bukti transaksi. Foto ulang lebih dekat dan terang.' }, { status: 422 });
    }
    const hasil: HasilStruk = {
      merchant: p.merchant,
      tanggal: p.tanggal && /^\d{4}-\d{2}-\d{2}$/.test(p.tanggal) ? p.tanggal : null,
      total: p.total && p.total > 0 ? Math.round(p.total) : null,
      jenis: p.jenis,
      kategori: p.kategori,
      items: (p.items || []).slice(0, 20),
      catatan: p.catatan || '',
      yakin: p.yakin,
      sumber: 'ai',
    };
    return NextResponse.json(hasil);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: 'Terlalu banyak permintaan. Coba sebentar lagi.' }, { status: 429 });
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY tidak sah.' }, { status: 500 });
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json({ error: `Layanan AI gagal (${error.status}). Pakai OCR peramban.` }, { status: 502 });
    }
    return NextResponse.json({ error: 'Gagal membaca struk.' }, { status: 500 });
  }
}
