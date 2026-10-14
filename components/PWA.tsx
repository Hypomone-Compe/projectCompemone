'use client';

/* =========================================================================
   Pemasangan aplikasi dan pendaftaran service worker.

   Dua hal terpisah yang kebetulan sama-sama urusan PWA:

   · <PWA/> dipasang sekali di kerangka akar. Ia mendaftarkan /sw.js dan
     memunculkan satu bilah kecil ketika ada versi baru yang menunggu.
     Tanpa bilah itu, versi lama bisa bertahan berhari-hari karena service
     worker baru hanya aktif setelah semua tab lama ditutup, dan aplikasi
     yang dipasang di layar utama nyaris tidak pernah benar-benar ditutup.

   · <TombolPasang/> dipakai di footer. Chrome dan Edge menyediakan dialog
     pemasangan lewat beforeinstallprompt; Safari iOS tidak punya itu sama
     sekali, jadi di sana yang muncul petunjuk manualnya.
   ========================================================================= */

import { useEffect, useState } from 'react';

interface PromptPasang extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const terpasang = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true);

/* ------------------------------------------------- pendaftaran + pembaruan */
export default function PWA() {
  const [menunggu, setMenunggu] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    /* Di mode pengembangan service worker tidak didaftarkan: menyinggah
       /_next/static akan melawan hot reload, dan bug yang muncul dari situ
       terlihat seperti bug kode padahal cuma berkas basi. */
    if (process.env.NODE_ENV !== 'production') return;

    let batal = false;

    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => {
        if (batal) return;
        if (reg.waiting) setMenunggu(reg.waiting);

        reg.addEventListener('updatefound', () => {
          const baru = reg.installing;
          if (!baru) return;
          baru.addEventListener('statechange', () => {
            /* controller yang sudah ada berarti ini pembaruan, bukan
               pemasangan pertama; pemasangan pertama tidak perlu diumumkan. */
            if (baru.state === 'installed' && navigator.serviceWorker.controller) {
              setMenunggu(baru);
            }
          });
        });
      })
      .catch(() => undefined);

    /* Satu-satunya pemuatan ulang, dijaga penanda supaya tidak berulang. */
    let memuatUlang = false;
    const ganti = () => {
      if (memuatUlang) return;
      memuatUlang = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', ganti);

    return () => {
      batal = true;
      navigator.serviceWorker.removeEventListener('controllerchange', ganti);
    };
  }, []);

  if (!menunggu) return null;

  return (
    <div
      role="status"
      className="no-print fixed inset-x-0 bottom-0 z-[300] flex flex-wrap items-center justify-center gap-3 px-4 py-3"
      style={{
        background: 'var(--ink)',
        color: 'var(--paper)',
        paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
      }}
    >
      <span className="text-[0.82rem]">Versi baru Hypomonē sudah siap.</span>
      <button onClick={() => menunggu.postMessage('ambil-alih')} className="btn btn--light btn--sm">
        Muat versi baru
      </button>
      <button onClick={() => setMenunggu(null)} className="btn btn--ghost btn--sm">
        Nanti
      </button>
    </div>
  );
}

/* ------------------------------------------------------------- pemasangan */
export function TombolPasang() {
  const [prompt, setPrompt] = useState<PromptPasang | null>(null);
  const [sudah, setSudah] = useState(false);
  const [ios, setIos] = useState(false);
  const [buka, setBuka] = useState(false);

  useEffect(() => {
    setSudah(terpasang());
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const tangkap = (e: Event) => {
      e.preventDefault();
      setPrompt(e as PromptPasang);
    };
    const selesai = () => {
      setSudah(true);
      setPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', tangkap);
    window.addEventListener('appinstalled', selesai);
    return () => {
      window.removeEventListener('beforeinstallprompt', tangkap);
      window.removeEventListener('appinstalled', selesai);
    };
  }, []);

  if (sudah) {
    return <p className="text-xs leading-relaxed muted">Sudah terpasang di perangkat ini.</p>;
  }

  if (prompt) {
    return (
      <button
        onClick={async () => {
          await prompt.prompt();
          const { outcome } = await prompt.userChoice;
          if (outcome === 'accepted') setSudah(true);
          setPrompt(null);
        }}
        className="btn btn--ghost btn--sm"
      >
        Pasang aplikasi
      </button>
    );
  }

  /* Tanpa beforeinstallprompt tidak ada cara memicu dialognya dari kode, jadi
     yang tersisa memberi tahu jalurnya. Petunjuknya dibuka atas permintaan
     supaya footer tidak selalu memuat paragraf yang tidak dibutuhkan. */
  return (
    <div>
      <button onClick={() => setBuka(v => !v)} aria-expanded={buka} className="btn btn--ghost btn--sm">
        {buka ? 'Tutup petunjuk' : 'Pasang aplikasi'}
      </button>
      {buka && (
        <p className="mt-3 text-xs leading-relaxed muted">
          {ios ? (
            <>
              Di Safari: ketuk tombol <b style={{ color: 'var(--paper)' }}>Bagikan</b>, gulir, lalu
              pilih <b style={{ color: 'var(--paper)' }}>Tambahkan ke Layar Utama</b>. Safari tidak
              mengizinkan situs memunculkan dialognya sendiri.
            </>
          ) : (
            <>
              Buka menu peramban, lalu cari{' '}
              <b style={{ color: 'var(--paper)' }}>Pasang</b> atau{' '}
              <b style={{ color: 'var(--paper)' }}>Tambahkan ke layar utama</b>. Kalau tidak ada,
              peramban itu belum mendukung pemasangan, atau situsnya sudah terpasang.
            </>
          )}
        </p>
      )}
    </div>
  );
}
