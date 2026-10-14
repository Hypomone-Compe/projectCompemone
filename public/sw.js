/* ==========================================================================
   Service worker Sandbox.

   Ditulis tangan, bukan lewat next-pwa atau Workbox, dengan alasan yang sama
   seperti grafik di situs ini digambar sendiri: yang dibutuhkan cuma tiga
   aturan, dan tiga aturan lebih mudah dibaca ulang setahun lagi daripada
   berkas hasil bangkitan yang tidak pernah dibuka siapa pun.

   Tiga aturannya:

   1. Berkas statis ber-hash (/_next/static, /fonts, /icons) diambil dari
      singgahan lebih dulu. Namanya sudah memuat hash isi, jadi tidak mungkin
      basi: kalau isinya berubah, namanya ikut berubah.

   2. Navigasi halaman diambil dari jaringan lebih dulu, singgahan hanya
      dipakai kalau jaringan gagal. Situs ini menampilkan "minggu ke berapa
      sekarang", jadi halaman basi yang disajikan diam-diam justru berbahaya.

   3. Apa pun di /api tidak pernah disinggahi. Di situ ada rute kirim email
      dan rute sesi; jawaban yang disimpan hanya akan menyesatkan.

   Data tulisanmu sendiri tidak lewat sini sama sekali. Semuanya ada di
   localStorage dan tetap bisa dibaca-tulis walau luring.
   ========================================================================== */

/* Naikkan versinya setiap kali berkas ini diubah: nama singgahan ikut berubah,
   dan singgahan versi lama dihapus saat activate. */
const VERSI = 'sandbox-v1';
const SINGGAHAN_STATIS = `${VERSI}-statis`;
const SINGGAHAN_HALAMAN = `${VERSI}-halaman`;

const LURING = '/offline';

/* Hanya halaman luring yang di-precache. Sisanya menyinggah sendiri sambil
   dipakai; mendaftar aset di sini berarti daftarnya harus diperbarui manual
   tiap kali nama berkas build berubah, dan daftar seperti itu selalu basi. */
self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(SINGGAHAN_HALAMAN)
      .then(c => c.add(new Request(LURING, { cache: 'reload' })))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(nama => Promise.all(nama.filter(n => !n.startsWith(VERSI)).map(n => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

/* Halaman bisa meminta service worker yang menunggu untuk langsung mengambil
   alih, dipakai tombol "Muat versi baru" di situs. */
self.addEventListener('message', event => {
  if (event.data === 'ambil-alih') self.skipWaiting();
});

const statis = (url) =>
  url.pathname.startsWith('/_next/static/') ||
  url.pathname.startsWith('/fonts/') ||
  url.pathname.startsWith('/icons/');

async function dariSinggahanDulu(request) {
  const singgahan = await caches.open(SINGGAHAN_STATIS);
  const ada = await singgahan.match(request);
  if (ada) return ada;
  const jawaban = await fetch(request);
  if (jawaban.ok) singgahan.put(request, jawaban.clone());
  return jawaban;
}

async function dariJaringanDulu(request) {
  const singgahan = await caches.open(SINGGAHAN_HALAMAN);
  try {
    const jawaban = await fetch(request);
    /* Pengalihan ke /login tidak disimpan. Kalau ikut disinggah, membuka
       aplikasi tanpa jaringan akan selalu memunculkan halaman masuk padahal
       sesinya masih hidup. */
    if (jawaban.ok && jawaban.type === 'basic') singgahan.put(request, jawaban.clone());
    return jawaban;
  } catch (e) {
    const ada = await singgahan.match(request);
    if (ada) return ada;
    const luring = await singgahan.match(LURING);
    if (luring) return luring;
    throw e;
  }
}

self.addEventListener('fetch', event => {
  const { request } = event;

  /* Hanya GET yang boleh disinggah. POST login dan kirim email harus selalu
     benar-benar berangkat ke server. */
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (statis(url)) {
    event.respondWith(dariSinggahanDulu(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(dariJaringanDulu(request));
  }
});
