import type { Metadata } from 'next';

/* Disajikan service worker ketika jaringan mati dan halaman yang diminta
   belum pernah dibuka. Sengaja di luar (app) supaya tidak memakai kerangka
   yang menarik data semester: halaman ini harus tetap berarti walau tidak
   ada apa pun yang bisa diambil. Juga dilewatkan middleware, karena kalau
   ikut dialihkan ke /login ia tidak akan pernah bisa disinggah. */
export const metadata: Metadata = { title: 'Luring' };

export default function OfflinePage() {
  return (
    <main className="on-dark grid min-h-dvh place-items-center px-[var(--gutter)]">
      <div className="w-full max-w-xl">
        <span className="eyebrow" style={{ color: 'var(--lime)' }}>
          Tidak ada jaringan
        </span>

        <h1 className="display mt-6" style={{ fontSize: 'clamp(2.2rem, 7vw, 4rem)', lineHeight: 0.9 }}>
          Kamu sedang <span className="serif">luring.</span>
        </h1>

        <p className="lede mt-6">
          Halaman ini belum pernah dibuka sejak Hypomonē dipasang, jadi tidak ada salinannya di
          perangkat ini. Halaman yang sudah pernah kamu buka tetap bisa dibaca tanpa jaringan.
        </p>

        <p className="mt-6 text-sm leading-relaxed muted">
          Catatan yang kamu tulis tidak lewat jaringan sama sekali. Semuanya tersimpan di peramban
          ini, jadi tidak ada yang hilang selama menunggu.
        </p>

        <div className="mt-9 flex flex-wrap gap-2">
          <a href="/harian" className="btn btn--light btn--sm">
            Coba buka Harian
          </a>
          <a href="/" className="btn btn--ghost btn--sm">
            Coba buka Beranda
          </a>
        </div>
      </div>
    </main>
  );
}
