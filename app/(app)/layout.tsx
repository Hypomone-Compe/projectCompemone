import Sapaan, { type RingkasanSapaan } from '@/components/Sapaan';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import SmoothScroll from '@/components/SmoothScroll';
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
    <div className="flex min-h-dvh flex-col">
      <StoreBoot />
      <SmoothScroll />
      <Sapaan ringkasan={ringkasan} />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
