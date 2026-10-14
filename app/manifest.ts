import type { MetadataRoute } from 'next';

/* ==========================================================================
   Manifest PWA, disajikan Next.js di /manifest.webmanifest.

   Dipasang supaya Hypomonē bisa ditambahkan ke layar utama dan dibuka tanpa
   bilah alamat. Alasannya bukan kosmetik: isi halaman harian (kebiasaan,
   jurnal, sesi fokus) paling sering diisi sambil berdiri, di sela kelas, dari
   ponsel. Membuka peramban lalu mencari tab yang benar sudah cukup untuk
   membuat kebiasaan mencatat itu putus.

   `middleware.ts` harus terus melewatkan berkas ini beserta /sw.js dan
   /icons; kalau tidak, keduanya ikut dialihkan ke /login dan pemasangan
   gagal tanpa pesan yang jelas.
   ========================================================================== */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Hypomonē @GRIT',
    short_name: 'Hypomonē',
    description:
      'Monitoring akademik dan harian: rubrik nilai lima mata kuliah, kebiasaan, jurnal, jam fokus, dan keuangan.',
    lang: 'id',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    /* Putih, sama dengan badan halaman, supaya tidak ada kedipan saat dibuka. */
    background_color: '#ffffff',
    theme_color: '#ffffff',
    orientation: 'any',
    categories: ['education', 'productivity'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    /* Tekan lama ikonnya di layar utama untuk langsung ke dua halaman yang
       paling sering dibuka setiap hari. */
    shortcuts: [
      {
        name: 'Harian',
        short_name: 'Harian',
        description: 'Centang kebiasaan dan isi jurnal hari ini',
        url: '/harian',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Keuangan',
        short_name: 'Keuangan',
        description: 'Catat pemasukan dan pengeluaran',
        url: '/keuangan',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Scan struk',
        short_name: 'Scan struk',
        description: 'Foto struk, langsung jadi transaksi',
        url: '/keuangan?scan=1',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],
  };
}
