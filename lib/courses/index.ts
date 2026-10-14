/* Menggabungkan identitas (meta.ts) dengan isi BRP tiap berkas.

   Modul ini menarik seluruh isi BRP, jadi hanya untuk server. Komponen klien
   mengimpor lib/courses/meta.ts. */
import type { Course } from '../types';
import { META } from './meta';
import pbp from './pbp';
import sda from './sda';
import basdat from './basdat';
import os from './os';
import statprob from './statprob';

const ISI = { pbp, sda, basdat, os, statprob } as const;

export const COURSES: Course[] = META.map(m => ({
  ...m,
  ...ISI[m.id as keyof typeof ISI],
}));

export const byId: Record<string, Course> = Object.fromEntries(COURSES.map(c => [c.id, c]));

export { META, metaById, fullName, shortName, TOTAL_SKS } from './meta';
