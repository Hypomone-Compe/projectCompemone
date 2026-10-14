/* =========================================================================
   Peredam gulir.

   Gulir bawaan peramban di Windows melompat satu "notch" penuh sekaligus,
   dan pada halaman bertipografi besar lompatan itu terasa kasar. Modul ini
   menahan lompatan tersebut lalu mengejarnya bertahap tiap frame, sehingga
   naik-turun halaman terasa tenang tanpa jadi lambat.

   Yang sengaja TIDAK diambil alih:
   · perangkat sentuh (momentum bawaannya sudah baik),
   · pengguna yang meminta pengurangan gerak,
   · wadah yang punya gulirnya sendiri (panel geser, tabel lebar),
   · zoom dengan Ctrl + roda,
   · papan ketik dan bilah gulir.
   ========================================================================= */

/** Seberapa jauh satu putaran roda menggeser halaman. <1 = kurang sensitif. */
const FAKTOR = 0.5;

/** Seberapa cepat posisi menyusul target tiap frame. Kecil = lebih lembut. */
const REDAM = 0.09;

/** Selisih di bawah nilai ini dianggap sudah sampai. */
const AMBANG_HENTI = 0.4;

const batas = (n: number, min: number, maks: number) => Math.min(Math.max(n, min), maks);

/** Ubah delta roda ke piksel, apa pun deltaMode yang dikirim peranti. */
function kePiksel(e: WheelEvent): number {
  if (e.deltaMode === 1) return e.deltaY * 16; // baris
  if (e.deltaMode === 2) return e.deltaY * window.innerHeight; // halaman
  return e.deltaY;
}

/** Ada wadah di jalur elemen yang masih sanggup menggulir sendiri ke arah itu? */
function adaWadahSendiri(mulai: EventTarget | null, deltaY: number): boolean {
  let el = mulai instanceof Element ? mulai : null;
  while (el && el !== document.body && el !== document.documentElement) {
    const gaya = getComputedStyle(el);
    const bisaTegak = /(auto|scroll|overlay)/.test(gaya.overflowY);
    if (bisaTegak && el.scrollHeight > el.clientHeight + 1) {
      const diAtas = el.scrollTop <= 0;
      const diBawah = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      const mentok = (deltaY < 0 && diAtas) || (deltaY > 0 && diBawah);
      if (!mentok) return true;
    }
    el = el.parentElement;
  }
  return false;
}

/* Dipakai lompatan jangkar supaya ikut halus meski scroll-behavior CSS
   dimatikan (kalau dibiarkan 'smooth', tiap scrollTo di dalam loop ikut
   dihaluskan lagi dan hasilnya justru tersendat). */
let setTarget: ((y: number) => void) | null = null;

export function pasangGulirHalus(): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};

  const kurangiGerak = window.matchMedia('(prefers-reduced-motion: reduce)');
  const penunjukKasar = window.matchMedia('(pointer: coarse)');
  if (kurangiGerak.matches || penunjukKasar.matches) return () => {};

  const akar = document.documentElement;
  const gayaLama = akar.style.scrollBehavior;
  akar.style.scrollBehavior = 'auto';

  let target = window.scrollY;
  let posisi = window.scrollY;
  let rafId = 0;
  let sedangAnimasi = false;

  const maksGulir = () => Math.max(0, akar.scrollHeight - window.innerHeight);

  const langkah = () => {
    const selisih = target - posisi;
    if (Math.abs(selisih) < AMBANG_HENTI) {
      posisi = target;
      window.scrollTo(0, posisi);
      sedangAnimasi = false;
      rafId = 0;
      return;
    }
    posisi += selisih * REDAM;
    window.scrollTo(0, posisi);
    rafId = requestAnimationFrame(langkah);
  };

  const mulai = () => {
    if (rafId) return;
    sedangAnimasi = true;
    rafId = requestAnimationFrame(langkah);
  };

  const padaRoda = (e: WheelEvent) => {
    if (e.ctrlKey || e.defaultPrevented) return; // zoom / sudah ditangani
    /* Saat tab tersembunyi, requestAnimationFrame dihentikan peramban. Kalau
       gulir bawaan tetap dicegah, halaman jadi sama sekali tidak bisa digulir. */
    if (document.hidden) return;
    const dy = kePiksel(e);
    if (!dy) return;
    if (adaWadahSendiri(e.target, dy)) return;

    const maks = maksGulir();
    if (maks <= 0) return;

    e.preventDefault();
    if (!sedangAnimasi) posisi = window.scrollY;
    target = batas(target + dy * FAKTOR, 0, maks);
    mulai();
  };

  /* Bilah gulir, papan ketik, dan scrollTo terprogram tidak lewat handler di
     atas, jadi posisinya disalin ulang supaya loop tidak menariknya balik. */
  const padaGulir = () => {
    if (sedangAnimasi) return;
    posisi = window.scrollY;
    target = posisi;
  };

  const padaUbahUkuran = () => {
    target = batas(target, 0, maksGulir());
  };

  const padaVisibilitas = () => {
    if (!document.hidden) return;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    sedangAnimasi = false;
    posisi = window.scrollY;
    target = posisi;
  };

  const padaPreferensi = () => {
    if (kurangiGerak.matches) lepas();
  };

  setTarget = (y: number) => {
    if (!sedangAnimasi) posisi = window.scrollY;
    target = batas(y, 0, maksGulir());
    mulai();
  };

  window.addEventListener('wheel', padaRoda, { passive: false });
  window.addEventListener('scroll', padaGulir, { passive: true });
  window.addEventListener('resize', padaUbahUkuran);
  document.addEventListener('visibilitychange', padaVisibilitas);
  kurangiGerak.addEventListener('change', padaPreferensi);

  function lepas() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    sedangAnimasi = false;
    setTarget = null;
    window.removeEventListener('wheel', padaRoda);
    window.removeEventListener('scroll', padaGulir);
    window.removeEventListener('resize', padaUbahUkuran);
    document.removeEventListener('visibilitychange', padaVisibilitas);
    kurangiGerak.removeEventListener('change', padaPreferensi);
    akar.style.scrollBehavior = gayaLama;
  }

  return lepas;
}

/** Gulir ke elemen. Ikut peredam bila aktif, kalau tidak pakai bawaan peramban. */
export function gulirKe(el: Element | null, offset = 90) {
  if (!el) return;
  const y = window.scrollY + el.getBoundingClientRect().top - offset;

  /* Saat tab tersembunyi, requestAnimationFrame tidak jalan sehingga animasi
     peredam tidak akan pernah sampai. Lompat langsung saja. */
  if (document.hidden) {
    window.scrollTo(0, y);
    return;
  }

  if (setTarget) setTarget(y);
  else window.scrollTo({ top: y, behavior: 'smooth' });
}
