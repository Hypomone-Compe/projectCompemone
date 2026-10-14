'use client';

import { useEffect } from 'react';
import { hydrate } from '@/lib/store';

/** Membaca localStorage sekali setelah mount, supaya render server & klien cocok. */
export default function StoreBoot() {
  useEffect(() => {
    hydrate();
  }, []);
  return null;
}
