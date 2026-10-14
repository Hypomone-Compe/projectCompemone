import type { Metadata, Viewport } from 'next';
import PWA from '@/components/PWA';
import './fonts.css';
import './globals.css';

export const metadata: Metadata = {
  /* Tiap halaman cukup mengisi judulnya sendiri: "Beranda", "PBP B", dst.
     Templat ini yang menjadikannya "Sandbox - Beranda". */
  title: {
    default: 'Sandbox',
    template: 'Sandbox - %s',
  },
  description:
    'Sandbox, monitoring akademik semester Gasal 2026/2027: PBP B, SDA D, Basis Data B, Sistem Operasi B, StatProb C.',
  applicationName: 'Sandbox',
  robots: { index: false, follow: false },
  /* Dipakai iOS saat situs ditambahkan ke Layar Utama. Tanpa ini, Safari
     membuka pintasannya di dalam Safari biasa lengkap dengan bilah alamat. */
  appleWebApp: {
    capable: true,
    title: 'Sandbox',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#12120f',
  width: 'device-width',
  initialScale: 1,
  /* Halaman boleh melebar sampai ke bawah poni dan sudut layar; jarak
     amannya diurus `env(safe-area-inset-*)` di globals.css. Tanpa cover,
     mode standalone menyisakan dua pita hitam di atas dan bawah. */
  viewportFit: 'cover',
};

/* Tiga berkas latin yang dipakai di layar pertama. Tanpa preload, peramban
   baru menemukannya setelah CSS selesai diurai, dan judul besar sempat
   tampil dengan huruf sistem. */
const PRELOAD = [
  '/fonts/bricolage-latin-normal.woff2',
  '/fonts/poppins-latin-400-normal.woff2',
  '/fonts/instrument-latin-400-italic.woff2',
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        {PRELOAD.map(href => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
      </head>
      <body>
        {children}
        <PWA />
      </body>
    </html>
  );
}
