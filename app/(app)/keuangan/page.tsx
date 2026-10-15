import type { Metadata } from 'next';
import { Suspense, type CSSProperties } from 'react';
import KeuanganBoard from '@/components/keuangan/KeuanganBoard';
import SectionNav, { type NavSection } from '@/components/SectionNav';
import PageHeader from '@/components/site/PageHeader';
import { Badge } from '@/components/ui';

export const metadata: Metadata = { title: 'Keuangan' };

const SECTIONS: NavSection[] = [
  { id: 'ringkasan', num: '01', short: 'Ringkasan' },
  { id: 'catat', num: '02', short: 'Transaksi' },
  { id: 'kategori', num: '03', short: 'Anggaran' },
  { id: 'pergerakan', num: '04', short: 'Grafik' },
  { id: 'investasi', num: '05', short: 'Investasi' },
];

/* Hijau halaman ini; warna deret grafik tetap dari validasi buta warna di Grafik.tsx. */
const ACCENT = '#2fae74';

export default function KeuanganPage() {
  const vars = { '--c': ACCENT, '--c-on': '#ffffff', '--c-pale': 'rgba(47, 174, 116, 0.15)' } as CSSProperties;
  return (
    <div style={vars}>
      <PageHeader
        crumbs={[{ label: 'Beranda', href: '/' }, { label: 'Keuangan' }]}
        badge={
          <div className="flex flex-wrap gap-2">
            <Badge variant="pink">Scan struk</Badge>
            <Badge variant="outline">Anggaran bulanan</Badge>
            <Badge variant="outline">Tersinkron ke HP</Badge>
          </div>
        }
        title="Pemasukan, pengeluaran,"
        emph="dan yang ditanam."
        accent={ACCENT}
        description="Foto struk langsung jadi transaksi. Pasang batas belanja, lihat sisa per hari, dan simpan semuanya di satu akun."
      />
      <SectionNav sections={SECTIONS} />
      <Suspense fallback={<div className="shell h-96" />}>
        <KeuanganBoard />
      </Suspense>
    </div>
  );
}
