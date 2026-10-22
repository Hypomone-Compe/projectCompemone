import { buatIcs } from '@/lib/ics';
import { todayYmd } from '@/lib/kalender';

/* Berkas .ics berisi deadline, lab, kuis, dan periode ujian mulai hari ini.
   Dilindungi middleware (harus masuk). Impor ke Google Calendar lewat
   Setelan → Impor & ekspor; UID stabil, jadi impor ulang memperbarui acara. */
export const dynamic = 'force-dynamic';

export function GET() {
  const { ics } = buatIcs(todayYmd());
  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="hypomone-deadline-gasal-2026.ics"',
      'Cache-Control': 'no-store',
    },
  });
}
