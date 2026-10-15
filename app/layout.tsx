import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/plus-jakarta-sans';
import PWA from '@/components/PWA';
import './globals.css';

export const metadata: Metadata = {
  /* Tiap halaman cukup mengisi judulnya: "Beranda", "SDA D", dst.
     Templat ini menjadikannya "Beranda · Hypomonē @LV". */
  title: {
    default: 'Hypomonē @LV',
    template: '%s · Hypomonē @LV',
  },
  description:
    'Hypomonē @LV, monitoring akademik Gasal 2026/2027: SDA D, PBP B, Basis Data B, Sistem Operasi B, StatProb C, ditambah harian dan keuangan.',
  applicationName: 'Hypomonē',
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    title: 'Hypomonē',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#05060d',
  width: 'device-width',
  initialScale: 1,
  /* Aplikasi terpasang tidak boleh terkunci dalam keadaan ter-zoom. */
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="font-sans">
        {children}
        <PWA />
      </body>
    </html>
  );
}
