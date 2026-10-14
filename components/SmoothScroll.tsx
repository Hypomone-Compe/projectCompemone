'use client';

import { useEffect } from 'react';
import { pasangGulirHalus } from '@/lib/gulir';

export default function SmoothScroll() {
  useEffect(() => pasangGulirHalus(), []);
  return null;
}
