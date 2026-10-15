'use client';

import { bukaSapaan } from '@/components/Sapaan';
import Kucing from './Kucing';

/**
 * Si kucing yang menemani di pojok kanan bawah setiap halaman.
 * Jalan-jalan & duduk santai; saat timer fokus berjalan ia membuka laptop
 * dan mengetik serius. Diklik = sapaan hari ini. Di HP ia duduk di atas tab bawah.
 */
export default function MaskotMengambang() {
  return (
    <button
      type="button"
      onClick={bukaSapaan}
      aria-label="Sapaan hari ini dari si kucing"
      title="Sapaan hari ini"
      className="no-print fixed bottom-[84px] right-1 z-30 rounded-2xl transition-transform duration-base ease-out-expo hover:-translate-y-0.5 lg:bottom-3 lg:right-3"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <Kucing perilaku="navbar" label="" className="pointer-events-none block h-[92px] w-[150px] sm:h-[128px] sm:w-[230px]" />
    </button>
  );
}
