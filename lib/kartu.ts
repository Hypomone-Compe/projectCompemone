'use client';
/* ==========================================================================
   Sampul kartu orbit (rasio 1.4:1.9), tema luar angkasa.

   Setiap kartu = satu "planet": latar langit gelap berbintang, nebula dan
   planet bercincin berwarna item, lalu blok judul di bawah. Matkul, halaman
   (Keuangan, Harian, …), dan tautan luar (SCeLE, Cosmic, …) memakai bentuk
   yang sama supaya orbitnya terasa satu sistem.

   Untuk mengganti kartu dengan gambar sendiri: isi `cover` (gambar 1.4:1.9
   di /public) pada item matkul di lib/courses/meta.ts atau tautan di
   lib/orbit.ts. Kartu dengan cover tidak digambar di sini.
   ========================================================================== */

export interface ItemOrbit {
  id: string;
  jenis: 'matkul' | 'halaman' | 'luar';
  judul: string;
  sub: string;
  warna: string;
  /** Baris kecil di kaki kartu, mis. "Minggu 8 · 2 agenda". */
  info: string;
  /** Pita kiri atas, mis. "Kelas D · 4 SKS". */
  pita: string;
  fokus?: boolean;
  href?: string;
  cover?: string;
  /** Untuk matkul: indeks di daftar matkul (panel detail). */
  matkul?: number;
}

const W = 840;
const H = 1140; // 1.4 : 1.9
const FONT = '"Plus Jakarta Sans Variable", "Plus Jakarta Sans", system-ui, sans-serif';

function rrect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function rgba(hex: string, a: number) {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** PRNG ber-seed dari id, supaya bintang tiap kartu stabil antar kunjungan. */
function acak(seedStr: string) {
  let seed = [...seedStr].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) | 0, 7);
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pill(g: CanvasRenderingContext2D, text: string, x: number, y: number, bg: string, fg: string, kanan = false) {
  g.font = `700 29px ${FONT}`;
  const w = g.measureText(text).width + 44;
  const px = kanan ? x - w : x;
  rrect(g, px, y, w, 56, 28);
  g.fillStyle = bg;
  g.fill();
  g.fillStyle = fg;
  g.textBaseline = 'middle';
  g.fillText(text, px + 22, y + 29);
}

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

function gambar(it: ItemOrbit): string {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d')!;
  const rnd = acak(it.id);

  /* Langit. */
  const langit = g.createLinearGradient(0, 0, 0, H);
  langit.addColorStop(0, '#0d1130');
  langit.addColorStop(1, '#05060d');
  g.fillStyle = langit;
  g.fillRect(0, 0, W, H);

  /* Nebula berwarna item. */
  const neb = (x: number, y: number, r: number, warna: string, a: number) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, rgba(warna, a));
    gr.addColorStop(1, rgba(warna, 0));
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
  };
  neb(W * (0.2 + rnd() * 0.2), H * 0.18, W * 0.75, it.warna, 0.32);
  neb(W * 0.9, H * 0.45, W * 0.5, '#e8628a', 0.12);

  /* Bintang. */
  for (let i = 0; i < 140; i++) {
    const x = rnd() * W;
    const y = rnd() * H * 0.62;
    const r = rnd() < 0.08 ? 2.6 : 0.6 + rnd() * 1.3;
    g.fillStyle = `rgba(255,255,255,${0.25 + rnd() * 0.7})`;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }

  /* Planet bercincin. */
  const cx = W / 2;
  const cy = H * 0.33;
  const R = W * 0.2;
  const miring = -0.32;
  const cincin = (depan: boolean) => {
    g.save();
    g.translate(cx, cy);
    g.rotate(miring);
    g.beginPath();
    g.ellipse(0, 0, R * 1.85, R * 0.42, 0, depan ? 0 : Math.PI, depan ? Math.PI : Math.PI * 2);
    g.lineWidth = 16;
    g.strokeStyle = rgba(it.warna, 0.55);
    g.stroke();
    g.lineWidth = 5;
    g.strokeStyle = 'rgba(255,255,255,0.35)';
    g.stroke();
    g.restore();
  };
  cincin(false);
  const planet = g.createRadialGradient(cx - R * 0.4, cy - R * 0.45, R * 0.1, cx, cy, R);
  planet.addColorStop(0, '#ffffff');
  planet.addColorStop(0.18, it.warna);
  planet.addColorStop(1, '#0b0e24');
  g.save();
  g.shadowColor = rgba(it.warna, 0.75);
  g.shadowBlur = 80;
  g.fillStyle = planet;
  g.beginPath();
  g.arc(cx, cy, R, 0, Math.PI * 2);
  g.fill();
  g.restore();
  cincin(true);

  /* Pita atas. */
  pill(g, it.pita, 44, 44, 'rgba(255,255,255,0.12)', '#eef0fb');
  if (it.fokus) pill(g, 'Prioritas', W - 44, 44, '#e8628a', '#ffffff', true);

  /* Blok judul kaca. */
  const by = H * 0.6;
  rrect(g, 30, by, W - 60, H - by - 30, 44);
  g.fillStyle = 'rgba(16, 20, 46, 0.86)';
  g.fill();
  g.lineWidth = 2;
  g.strokeStyle = 'rgba(238,240,251,0.12)';
  g.stroke();
  rrect(g, 30, by, 14, H - by - 30, 7);
  g.fillStyle = it.warna;
  g.fill();

  g.textBaseline = 'alphabetic';
  g.fillStyle = it.warna;
  g.font = `800 26px ${FONT}`;
  g.fillText(it.jenis === 'matkul' ? 'MATA KULIAH' : it.jenis === 'halaman' ? 'HALAMAN' : 'TAUTAN', 76, by + 66);

  g.fillStyle = '#ffffff';
  let fs = 128;
  g.font = `800 ${fs}px ${FONT}`;
  const judul = it.judul;
  while (g.measureText(judul).width > W - 150 && fs > 64) {
    fs -= 6;
    g.font = `800 ${fs}px ${FONT}`;
  }
  g.fillText(judul, 72, by + 66 + fs * 0.98);

  g.fillStyle = 'rgba(238,240,251,0.82)';
  g.font = `600 34px ${FONT}`;
  baris(g, it.sub, W - 150)
    .slice(0, 2)
    .forEach((b, i) => g.fillText(b, 74, by + 110 + fs + i * 44));

  g.fillStyle = 'rgba(238,240,251,0.55)';
  g.font = `600 27px ${FONT}`;
  g.fillText(it.info, 74, H - 74);
  g.fillStyle = it.warna;
  g.font = `700 40px ${FONT}`;
  g.fillText('↗', W - 108, H - 72);

  return canvas.toDataURL('image/jpeg', 0.9);
}

/** URL sampul tiap item: cover sendiri kalau ada, selain itu digambar di canvas. */
export async function sampulOrbit(items: ItemOrbit[]): Promise<string[]> {
  try {
    await Promise.all([
      document.fonts.load(`800 120px ${FONT}`),
      document.fonts.load(`700 40px ${FONT}`),
      document.fonts.load(`600 28px ${FONT}`),
    ]);
  } catch {
    /* huruf cadangan tetap terbaca */
  }
  return items.map(it => (it.cover ? it.cover : gambar(it)));
}
