import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import HarianBoard from '@/components/harian/HarianBoard';
import SectionNav, { type NavSection } from '@/components/SectionNav';
import PageHeader from '@/components/site/PageHeader';
import { Badge } from '@/components/ui';

export const metadata: Metadata = { title: 'Harian' };

const SECTIONS: NavSection[] = [
  { id: 'ringkasan', num: '01', short: 'Ringkasan' },
  { id: 'kebiasaan', num: '02', short: 'Kebiasaan' },
  { id: 'jurnal', num: '03', short: 'Jurnal' },
  { id: 'fokus', num: '04', short: 'Fokus' },
  { id: 'tidur', num: '05', short: 'Tidur' },
  { id: 'target', num: '06', short: 'Target' },
  { id: 'tinjauan', num: '07', short: 'Tinjauan' },
];

/* Biru design system untuk halaman harian: jauh dari hijau keuangan dan
   dari warna lima matkul, jadi tangkapan layar mana pun langsung ketahuan asalnya. */
const ACCENT = '#8297f0';

export default function HarianPage() {
  const vars = { '--c': ACCENT, '--c-on': '#ffffff', '--c-pale': 'rgba(130, 151, 240, 0.15)', '--c-emph': ACCENT } as CSSProperties;

  return (
    <div style={vars}>
      <PageHeader
        crumbs={[{ label: 'Beranda', href: '/' }, { label: 'Harian' }]}
        badge={
          <div className="flex flex-wrap gap-2">
            <Badge variant="blue">Kebiasaan & runtun</Badge>
            <Badge variant="outline">Jurnal</Badge>
            <Badge variant="outline">Jam fokus</Badge>
            <Badge variant="outline">Tidur</Badge>
          </div>
        }
        title="Hari yang biasa"
        emph="menentukan semuanya."
        accent={ACCENT}
        description="IPK dihitung sekali di akhir semester, tapi disusun oleh ratusan hari biasa. Centang, catat, dan lihat polanya."
      />
      <SectionNav sections={SECTIONS} />
      <HarianBoard />
    </div>
  );
}
