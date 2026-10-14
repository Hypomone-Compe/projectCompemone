'use client';
/* ==========================================================================
   Sampul kartu matkul untuk orbit hero (rasio 1.4:1.9).

   Digambar di canvas, bukan disiapkan sebagai berkas gambar, karena isinya
   ikut hidup: minggu berjalan dan jumlah deadline berubah tiap pekan.

   Sementara memakai logo BEM UI. Untuk mengganti dengan gambar sendiri
   (setelah UTS), taruh berkas 1.4:1.9 di /public/images/matkul/ lalu isi
   `cover` matkul itu di lib/courses/meta.ts. Kartu dengan cover tidak lagi
   digambar di sini.
   ========================================================================== */
import type { KartuMatkul } from './ringkasan-matkul';

const W = 840;
const H = 1140; // 840 × 1140 = 1.4 : 1.9
const FONT = '"Plus Jakarta Sans Variable", "Plus Jakarta Sans", system-ui, sans-serif';
const NAVY = '#0b102d';

function muat(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function rrect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function pill(g: CanvasRenderingContext2D, text: string, x: number, y: number, bg: string, fg: string, kanan = false) {
  g.font = `700 30px ${FONT}`;
  const w = g.measureText(text).width + 44;
  const px = kanan ? x - w : x;
  rrect(g, px, y, w, 58, 29);
  g.fillStyle = bg;
  g.fill();
  g.fillStyle = fg;
  g.textBaseline = 'middle';
  g.fillText(text, px + 22, y + 30);
  return w;
}

function blob(g: CanvasRenderingContext2D, x: number, y: number, r: number, warna: string, alpha: number) {
  const grad = g.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, hexA(warna, alpha));
  grad.addColorStop(1, hexA(warna, 0));
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
}

function hexA(hex: string, a: number) {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** Memecah teks jadi baris yang muat di `maks` px. */
function baris(g: CanvasRenderingContext2D, teks: string, maks: number): string[] {
  const out: string[] = [];
  let kini = '';
  for (const kata of teks.split(/\s+/)) {
    const coba = kini ? `${kini} ${kata}` : kata;
    if (g.measureText(coba).width > maks && kini) {
      out.push(kini);
      kini = kata;
    } else kini = coba;
  }
  if (kini) out.push(kini);
  return out;
}

function gambar(c: KartuMatkul, logo: HTMLImageElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d')!;

  /* Latar putih + mesh lembut warna matkul (resep mesh-bg design system). */
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, W, H);
  blob(g, W * 0.12, H * 0.14, W * 0.75, c.accent, 0.26);
  blob(g, W * 0.92, H * 0.06, W * 0.7, '#ffced8', 0.75);
  blob(g, W * 0.55, H * 0.42, W * 0.6, '#9cb3d3', 0.28);

  /* Kisi tipis seperti dinding orbit. */
  g.strokeStyle = 'rgba(11, 16, 45, 0.06)';
  g.lineWidth = 2;
  for (let x = 70; x < W; x += 70) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, H * 0.62);
    g.stroke();
  }
  for (let y = 70; y < H * 0.62; y += 70) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(W, y);
    g.stroke();
  }

  /* Pita atas. */
  pill(g, `Kelas ${c.kelas} · ${c.sks} SKS`, 48, 48, 'rgba(255,255,255,0.88)', NAVY);
  if (c.fokus) pill(g, 'Prioritas', W - 48, 48, '#d64c6f', '#ffffff', true);

  /* Logo BEM sebagai tanda kartu (sementara, sampai cover sendiri dipasang). */
  const L = W * 0.56;
  g.save();
  g.shadowColor = 'rgba(94, 18, 28, 0.22)';
  g.shadowBlur = 50;
  g.shadowOffsetY = 18;
  g.drawImage(logo, (W - L) / 2, 150, L, L);
  g.restore();

  /* Blok nama matkul. */
  const by = H * 0.6;
  rrect(g, 32, by, W - 64, H - by - 32, 44);
  g.fillStyle = c.accent;
  g.fill();
  const shine = g.createLinearGradient(0, by, 0, H);
  shine.addColorStop(0, 'rgba(255,255,255,0.14)');
  shine.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = shine;
  g.fill();

  g.fillStyle = '#ffffff';
  g.textBaseline = 'alphabetic';
  g.font = `800 150px ${FONT}`;
  const short = c.short.toUpperCase();
  let fs = 150;
  while (g.measureText(short).width > W - 160 && fs > 80) {
    fs -= 6;
    g.font = `800 ${fs}px ${FONT}`;
  }
  g.fillText(short, 72, by + 150);

  g.font = `700 38px ${FONT}`;
  baris(g, c.name, W - 150)
    .slice(0, 2)
    .forEach((b, i) => g.fillText(b, 74, by + 215 + i * 48));

  g.fillStyle = 'rgba(255,255,255,0.72)';
  g.font = `600 28px ${FONT}`;
  const info = c.mingguKe
    ? `Minggu ${c.mingguKe} · ${c.deadlineMingguIni ? `${c.deadlineMingguIni} agenda dinilai` : 'tanpa deadline'}`
    : c.code.split(' / ')[0];
  g.fillText(info, 74, H - 78);

  g.fillStyle = 'rgba(255,255,255,0.9)';
  g.font = `700 40px ${FONT}`;
  g.fillText('↗', W - 110, H - 76);

  return canvas.toDataURL('image/jpeg', 0.9);
}

/** URL sampul tiap matkul: cover sendiri kalau ada, selain itu digambar di canvas. */
export async function sampulMatkul(daftar: KartuMatkul[], logoSrc = '/images/logo-bem-ui.png'): Promise<string[]> {
  try {
    await Promise.all([
      document.fonts.load(`800 120px ${FONT}`),
      document.fonts.load(`700 40px ${FONT}`),
      document.fonts.load(`600 28px ${FONT}`),
    ]);
  } catch {
    /* huruf cadangan tetap terbaca */
  }
  const logo = await muat(logoSrc);
  return daftar.map(c => (c.cover ? c.cover : gambar(c, logo)));
}
