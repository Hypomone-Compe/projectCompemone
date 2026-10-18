import type { Metadata } from 'next';
import RuangFokus from '@/components/ruang/RuangFokus';
import StoreBoot from '@/components/StoreBoot';

export const metadata: Metadata = { title: 'Ruang fokus' };

/* Satu layar penuh, sengaja di luar kerangka (app): tanpa navbar, footer, dan maskot mengambang. */
export default function RuangFokusPage() {
  return (
    <>
      <StoreBoot />
      <RuangFokus />
    </>
  );
}
