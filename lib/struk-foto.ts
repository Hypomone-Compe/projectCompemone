'use client';

import { getSupabase } from './supabase/client';

/** Mengecilkan foto (maks. 1600px sisi terpanjang, JPEG) sebelum dibaca & diunggah. */
export async function kompres(file: File, maks = 1600, mutu = 0.82): Promise<{ blob: Blob; dataUrl: string }> {
  const bitmap = await createImageBitmap(file).catch(async () => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    await img.decode();
    URL.revokeObjectURL(url);
    return img;
  });
  const w = 'width' in bitmap ? bitmap.width : 0;
  const h = 'height' in bitmap ? bitmap.height : 0;
  const skala = Math.min(1, maks / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * skala);
  canvas.height = Math.round(h * skala);
  const g = canvas.getContext('2d')!;
  g.fillStyle = '#fff';
  g.fillRect(0, 0, canvas.width, canvas.height);
  g.drawImage(bitmap as CanvasImageSource, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((res, rej) => canvas.toBlob(b => (b ? res(b) : rej(new Error('gagal'))), 'image/jpeg', mutu));
  return { blob, dataUrl: canvas.toDataURL('image/jpeg', mutu) };
}

/** Unggah foto struk ke bucket privat "struk". Mengembalikan path, atau null kalau gagal/mode lokal. */
export async function unggahStruk(id: string, blob: Blob): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  const uid = data.session?.user.id;
  if (!uid) return null;
  const path = `${uid}/${id}.jpg`;
  const { error } = await sb.storage.from('struk').upload(path, blob, { contentType: 'image/jpeg', upsert: true });
  return error ? null : path;
}

/** URL bertanda tangan (1 jam) untuk melihat foto struk. */
export async function urlStruk(path: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.storage.from('struk').createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export async function hapusStruk(path: string) {
  await getSupabase()?.storage.from('struk').remove([path]);
}
