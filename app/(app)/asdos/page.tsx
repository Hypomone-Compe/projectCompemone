import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import AsdosBoard from '@/components/asdos/AsdosBoard';
import SectionNav, { type NavSection } from '@/components/SectionNav';
import PageHeader from '@/components/site/PageHeader';
import { Badge } from '@/components/ui';
import { KELAS } from '@/lib/asdos';

export const metadata: Metadata = { title: 'Asisten Dosen' };

const SECTIONS: NavSection[] = [
  { id: 'kelas', num: '01', short: 'Info kelas' },
  { id: 'sesi', num: '02', short: 'Catatan sesi' },
  { id: 'silabus', num: '03', short: 'Materi' },
  { id: 'tugas', num: '04', short: 'Tugas' },
  { id: 'tanya', num: '05', short: 'Sering ditanya' },
];

export default function AsdosPage() {
  const vars = { '--c': KELAS.accent, '--c-on': KELAS.accentOn, '--c-pale': '#eef1f9', '--c-emph': KELAS.accent } as CSSProperties;

  return (
    <div style={vars}>
      <PageHeader
        crumbs={[{ label: 'Beranda', href: '/' }, { label: KELAS.peran }]}
        badge={
          <div className="flex flex-wrap gap-2">
            <Badge variant="blue">Peran: asisten dosen</Badge>
            <Badge variant="outline">Bukan matkul yang diambil</Badge>
          </div>
        }
        title={KELAS.nama}
        emph="Kelas Internasional"
        accent={KELAS.accent}
        description="Mengajar adalah cara tercepat menemukan lubang di pemahaman sendiri. Catat sesi, cakupan materi, dan tugas asdos di sini."
      />
      <SectionNav sections={SECTIONS} />
      <AsdosBoard />
    </div>
  );
}
