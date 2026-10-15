import Sapaan, { type RingkasanSapaan } from '@/components/Sapaan';
import { Cursor } from '@/components/site/Cursor';
import SiteFooter from '@/components/site/SiteFooter';
import SiteNav from '@/components/site/SiteNav';
import SmoothScroll from '@/components/site/SmoothScroll';
import StoreBoot from '@/components/StoreBoot';
import { currentWeek, fmtRange, semesterStatus, todayYmd, TOTAL_WEEKS } from '@/lib/plan';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const today = todayYmd();
  const status = semesterStatus(today);
  const cur = currentWeek(today);

  const ringkasan: RingkasanSapaan = {
    today,
    fase: status.phase,
    angka: status.phase === 'run' ? status.week : status.phase === 'pre' ? status.daysToStart : 0,
    totalMinggu: TOTAL_WEEKS,
    rentang: cur ? fmtRange(cur.start, cur.end) : null,
    ujian: cur?.exam ?? null,
    deadline: cur?.deadlines.length ?? 0,
  };

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <a
        href="#konten"
        className="sr-only z-[80] rounded-full bg-accent px-4 py-2 font-bold text-white focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4"
      >
        Lewati ke konten
      </a>
      <StoreBoot />
      <SmoothScroll />
      <Sapaan ringkasan={ringkasan} />
      <SiteNav />
      <main id="konten" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <Cursor />
    </div>
  );
}
