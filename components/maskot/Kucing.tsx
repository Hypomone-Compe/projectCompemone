'use client';

/**
 * Maskot Hypomonē: kucing hitam voxel (pixel 3D) bermata kuning.
 *
 * Bawaannya kucing biasa. Saat santai (tidak fokus) sesekali ia berganti baju lewat
 * kepulan asap ala ninja: jubah Akatsuki (awan merah bergaris putih, kerah tinggi berlapis
 * merah) dan ikat kepala Konoha. Berbaju, ia berjalan tegak dua kaki seperti manusia;
 * tanpa baju ia berjalan empat kaki seperti kucing. Mode fokus selalu kucing biasa.
 *
 * Dua perilaku:
 * - 'duduk'  : duduk menyambut (sapaan, login). Kedip, ekor mengibas, kepala ikut kursor.
 * - 'navbar' : hidup di pojok halaman. Jalan bolak-balik, sesekali duduk, sesekali
 *              berganti baju. Saat mode
 *              'fokus' (timer fokus berjalan) ia ke tengah, membuka laptop, lalu mengetik
 *              serius: mata menyipit, kaki depan mengetik, layar menyinari wajah, piksel kode
 *              beterbangan. Saat timer berhenti laptop ditutup dan ia jalan-jalan lagi.
 *
 * Kamera ortografis (rasa pixel art, tanpa distorsi perspektif). Satu konteks WebGL per
 * kanvas, loop berhenti saat kanvas tidak terlihat atau tab disembunyikan.
 */
import * as React from 'react';
import type * as T from 'three';
import { ambilModeKucing, langgananKucing } from '@/lib/maskot';

type V = [number, number, number];
type Fase = 'diam' | 'jalan' | 'menuju' | 'buka' | 'fokus' | 'tutup';

/** Kubus di dalam elipsoid (pusat c, jari-jari r). */
function elipsoid(c: V, r: V): V[] {
  const out: V[] = [];
  for (let x = Math.floor(c[0] - r[0]); x <= Math.ceil(c[0] + r[0]); x++)
    for (let y = Math.floor(c[1] - r[1]); y <= Math.ceil(c[1] + r[1]); y++)
      for (let z = Math.floor(c[2] - r[2]); z <= Math.ceil(c[2] + r[2]); z++) {
        const d = ((x - c[0]) / r[0]) ** 2 + ((y - c[1]) / r[1]) ** 2 + ((z - c[2]) / r[2]) ** 2;
        if (d <= 1) out.push([x, y, z]);
      }
  return out;
}

const halus = (a: number, b: number, k: number) => a + (b - a) * k;
const jepit = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* Awan Akatsuki dalam setengah-voxel: R = merah, W = garis putih. */
const AWAN = ['....WWW.....', '.WWWRRRWWW..', 'WRRRRRRRRRW.', 'WRRRRRRRRRRW', '.WRRRRRRRRRW', '..WWWWWWWWW.'];
const AWAN_K = AWAN[0].length >> 1;
const AWAN_B = AWAN.length >> 1;
/** Huruf pola awan di koordinat permukaan (u melingkar, v tinggi), atau '.' bila polos. */
function polaAwan(u: number, v: number, awan: [number, number][]) {
  for (const [u0, v0] of awan) {
    const k = Math.round(u - u0) + AWAN_K;
    const b = Math.round(v0 - v) + AWAN_B;
    if (b >= 0 && b < AWAN.length && k >= 0 && k < AWAN[0].length && AWAN[b][k] !== '.') return AWAN[b][k];
  }
  return '.';
}

/** Lambang daun Konoha di pelat ikat kepala (kanvas, digambar sekali). */
function gambarPelat() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 78;
  const g = c.getContext('2d')!;
  const gr = g.createLinearGradient(0, 0, 0, c.height);
  gr.addColorStop(0, '#f2f4f8');
  gr.addColorStop(0.55, '#c3cad6');
  gr.addColorStop(1, '#8c95a6');
  g.fillStyle = gr;
  g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = '#5c6474';
  g.lineWidth = 5;
  g.strokeRect(2.5, 2.5, c.width - 5, c.height - 5);
  g.fillStyle = '#5c6474';
  for (const [x, y] of [[14, 14], [242, 14], [14, 64], [242, 64]]) g.fillRect(x - 3, y - 3, 6, 6);

  const S = 30;
  const cx = 124;
  const cy = 41;
  g.strokeStyle = '#232835';
  g.lineWidth = 6;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.beginPath();
  /* Spiral berlawanan jarum jam, berakhir di puncaknya… */
  for (let a = 0; a <= Math.PI * 2.5; a += 0.08) {
    const r = (S * 0.36 * a) / (Math.PI * 2.5);
    const x = cx + r * Math.cos(a);
    const y = cy - r * Math.sin(a);
    if (a === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  /* …lalu menyapu jadi daun runcing ke kanan atas, melingkari spiral, dan bertangkai. */
  g.quadraticCurveTo(cx + S * 0.25, cy - S * 0.62, cx + S * 0.78, cy - S * 0.78);
  g.quadraticCurveTo(cx + S * 0.75, cy + S * 0.35, cx + S * 0.1, cy + S * 0.62);
  g.quadraticCurveTo(cx - S * 0.35, cy + S * 0.72, cx - S * 0.58, cy + S * 0.4);
  g.moveTo(cx - S * 0.5, cy + S * 0.52);
  g.lineTo(cx - S * 0.9, cy + S * 0.82);
  g.stroke();
  return c;
}

export default function Kucing({
  ukuran,
  className = '',
  label = 'Maskot kucing hitam Hypomonē',
  perilaku = 'duduk',
}: {
  /** Ukuran kanvas persegi (px). Kosong = ikut ukuran dari className. */
  ukuran?: number;
  className?: string;
  label?: string;
  perilaku?: 'duduk' | 'navbar';
}) {
  const ref = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let batal = false;
    let bersihkan = () => {};
    const kurangGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const navbar = perilaku === 'navbar';

    (async () => {
      const THREE: typeof T = await import('three');
      if (batal) return;
      let renderer: T.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      } catch {
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      /* ---------------- kamera ortografis ---------------- */
      const VIEW_H = navbar ? 19.5 : 17;
      const PUSAT_Y = navbar ? 7.2 : 7;
      const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 200);
      camera.position.set(0, PUSAT_Y + 11, 40);
      camera.lookAt(0, PUSAT_Y, 0);
      let setengahLebar = 10;
      const ukurKanvas = () => {
        const w = canvas.clientWidth || ukuran || 100;
        const h = canvas.clientHeight || ukuran || 100;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); // bisa berubah (zoom, pindah layar)
        renderer.setSize(w, h, false);
        setengahLebar = (VIEW_H * (w / h)) / 2;
        camera.left = -setengahLebar;
        camera.right = setengahLebar;
        camera.top = VIEW_H / 2;
        camera.bottom = -VIEW_H / 2;
        camera.updateProjectionMatrix();
      };
      ukurKanvas();
      const ro = new ResizeObserver(ukurKanvas);
      ro.observe(canvas);

      /* ---------------- cahaya ---------------- */
      const scene = new THREE.Scene();
      scene.add(new THREE.AmbientLight(0xffffff, 0.22));
      const key = new THREE.DirectionalLight(0xffffff, 1.1);
      key.position.set(-8, 14, 16);
      scene.add(key);
      /* Cahaya tepi pink & biru supaya kucing hitam tetap berbentuk di latar gelap. */
      const rimA = new THREE.DirectionalLight(0xe8628a, 2.2);
      rimA.position.set(-14, 6, -10);
      scene.add(rimA);
      const rimB = new THREE.DirectionalLight(0x8297f0, 2.2);
      rimB.position.set(14, 8, -8);
      scene.add(rimB);
      const sinarLayar = new THREE.PointLight(0x9fb3ff, 0, 20, 1.2);
      sinarLayar.position.set(0, 4, 6.4);
      scene.add(sinarLayar);

      /* ---------------- bahan ---------------- */
      const kubus = new THREE.BoxGeometry(0.96, 0.96, 0.96);
      const bulu = new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0 });
      const kuning = new THREE.MeshBasicMaterial({ color: 0xffd23f, toneMapped: false });
      const hitamPekat = new THREE.MeshBasicMaterial({ color: 0x0b0b10 });
      const pink = new THREE.MeshStandardMaterial({ color: 0xe8628a, roughness: 0.5 });
      const logam = new THREE.MeshStandardMaterial({ color: 0x6b74a8, roughness: 0.35, metalness: 0.35 });
      const logoNyala = new THREE.MeshBasicMaterial({ color: 0xff7aa2, toneMapped: false });
      const keyboard = new THREE.MeshStandardMaterial({ color: 0x3a4166, roughness: 0.6 });
      const layar = new THREE.MeshBasicMaterial({ color: 0x8297f0, toneMapped: false });
      const perak = new THREE.MeshStandardMaterial({ color: 0xb9c1cf, roughness: 0.35, metalness: 0.55 });
      const teksturPelat = new THREE.CanvasTexture(gambarPelat());
      teksturPelat.colorSpace = THREE.SRGBColorSpace;
      teksturPelat.anisotropy = 4;
      const mukaPelat = new THREE.MeshStandardMaterial({ map: teksturPelat, roughness: 0.4, metalness: 0.45 });
      const disposables: { dispose(): void }[] = [kubus, bulu, kuning, hitamPekat, pink, logam, logoNyala, keyboard, layar, perak, teksturPelat, mukaPelat];
      const geo = (g: T.BufferGeometry) => (disposables.push(g), g);

      /* Variasi gelap-terang kecil per kubus: tekstur "pixel". */
      const hitam = (_p: V, i: number) => new THREE.Color().setHSL(0.66, 0.15, 0.03 + ((i * 7919) % 5) * 0.006);
      const MERAH = new THREE.Color(0xc8102e);
      const PUTIH = new THREE.Color(0xf3efe6);
      const kain = (i: number) => new THREE.Color().setHSL(0.69, 0.18, 0.062 + ((i * 7919) % 4) * 0.006);
      const biruIkat = (_p: V, i: number) => new THREE.Color().setHSL(0.63, 0.45, 0.16 + ((i * 31) % 3) * 0.018);
      /** skala 0.5 = setengah-voxel (posisi dalam satuan setengah), untuk kain yang lebih detail. */
      const voxel = (posisi: V[], warna: (p: V, i: number) => T.Color = hitam, skala = 1) => {
        const im = new THREE.InstancedMesh(kubus, bulu, posisi.length);
        const o = new THREE.Object3D();
        posisi.forEach((p, i) => {
          o.position.set(p[0], p[1], p[2]);
          o.updateMatrix();
          im.setMatrixAt(i, o.matrix);
          im.setColorAt(i, warna(p, i));
        });
        im.scale.setScalar(skala);
        return im;
      };
      const kotak = (w: number, h: number, d: number, bahan: T.Material | T.Material[], x = 0, y = 0, z = 0) => {
        const m = new THREE.Mesh(geo(new THREE.BoxGeometry(w, h, d)), bahan);
        m.position.set(x, y, z);
        return m;
      };

      /**
       * Kain berbentuk bebas dalam setengah-voxel. `isi(x, y, z)` dalam satuan biasa;
       * hanya kulit luarnya yang dibuat. Awan dipetakan melingkar di sekitar sumbu (0, pz).
       */
      const jubah = (isi: (x: number, y: number, z: number) => boolean, [a, b]: [V, V], pz: number, R: number, awan: [number, number][]) => {
        const di = (x: number, y: number, z: number) => isi(x / 2, y / 2, z / 2);
        const pos: V[] = [];
        for (let x = a[0]; x <= b[0]; x++)
          for (let y = a[1]; y <= b[1]; y++)
            for (let z = a[2]; z <= b[2]; z++)
              if (di(x, y, z) && !(di(x + 1, y, z) && di(x - 1, y, z) && di(x, y + 1, z) && di(x, y - 1, z) && di(x, y, z + 1) && di(x, y, z - 1)))
                pos.push([x, y, z]);
        return voxel(
          pos,
          (p, i) => {
            const c = polaAwan(Math.atan2(p[0], p[2] - pz * 2) * R, p[1], awan);
            return c === 'R' ? MERAH : c === 'W' ? PUTIH : kain(i);
          },
          0.5,
        );
      };

      /** Kerah tinggi Akatsuki di sekitar leher: luar hitam, dalam merah. s = skala kepala. */
      const kerah = (s: number) => {
        const y0 = -1.4 * s;
        const y1 = 0.5 * s;
        const cz = 0.6 * s;
        const ell = (x: number, y: number, z: number, kurang: number) => {
          const mekar = 1 + 0.07 * ((y - y0) / (y1 - y0));
          return (x / (3.85 * s * mekar - kurang)) ** 2 + ((z - cz) / (3.35 * s * mekar - kurang)) ** 2 <= 1;
        };
        const pos: V[] = [];
        for (let x = -9; x <= 9; x++)
          for (let y = Math.floor(y0 * 2); y <= Math.ceil(y1 * 2); y++)
            for (let z = -8; z <= 10; z++)
              if (ell(x / 2, y / 2, z / 2, 0) && !ell(x / 2, y / 2, z / 2, 1)) pos.push([x, y, z]);
        return voxel(pos, (p, i) => (ell(p[0] / 2, p[1] / 2, p[2] / 2, 0.5) ? MERAH : kain(i)), 0.5);
      };

      /* ---------------- kepala (dipakai kedua pose) ---------------- */
      const kepala = new THREE.Group();
      const isiKepala = elipsoid([0, 2.4, 0.6], [4.3, 3.1, 3.1]);
      /* Pangkal telinga di baris y = 4 dipisah: baris itu dipakai ikat kepala saat berbaju. */
      for (const s of [-1, 1])
        for (const [x, y] of [[4, 5], [3, 5], [4, 6], [3, 6], [4, 7]] as [number, number][])
          for (const z of [0, 1]) isiKepala.push([s * x, y, z]);
      kepala.add(voxel(isiKepala));
      const pangkalTelinga: V[] = [];
      for (const s of [-1, 1]) for (const x of [2, 3, 4]) for (const z of [0, 1]) pangkalTelinga.push([s * x, 4, z]);
      const telingaBawah = voxel(pangkalTelinga);
      kepala.add(telingaBawah);
      const depan = (x: number, y: number) => Math.max(...isiKepala.filter(k => k[0] === x && k[1] === y).map(k => k[2]));
      const mata = new THREE.Group();
      for (const sx of [-1, 1]) {
        for (const x of [1, 2]) for (const y of [2, 3]) mata.add(kotak(0.98, 0.98, 0.2, kuning, sx * x, y, depan(sx * x, y) + 0.45));
        const zp = Math.max(depan(sx, 2), depan(sx * 2, 2), depan(sx, 3), depan(sx * 2, 3));
        mata.add(kotak(0.34, 1.7, 0.1, hitamPekat, sx * 1.5, 2.5, zp + 0.61));
      }
      mata.position.y = 2.5;
      mata.children.forEach(c => (c.position.y -= 2.5)); // pusat kedip di tengah mata
      kepala.add(mata);
      kepala.add(kotak(0.98, 0.7, 0.3, pink, 0, 1.1, depan(0, 1) + 0.45));
      const pinkTelinga = [kotak(0.9, 0.9, 0.2, pink, -3, 4.5, 1.55), kotak(0.9, 0.9, 0.2, pink, 3, 4.5, 1.55)];
      kepala.add(...pinkTelinga);

      /* Ikat kepala Konoha: kain biru melingkari baris y = 4, pelat besi di dahi. */
      const lapis = new Set(isiKepala.filter(k => k[1] === 4).map(k => `${k[0]},${k[2]}`));
      const ikat: V[] = [];
      for (let x = -6; x <= 6; x++)
        for (let z = -5; z <= 6; z++)
          if (!lapis.has(`${x},${z}`) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => lapis.has(`${x + dx},${z + dz}`)))
            ikat.push([x, 4, z]);
      const ikatKepala = new THREE.Group();
      kepala.add(ikatKepala);
      ikatKepala.add(voxel(ikat, biruIkat));
      const dahi = Math.max(...ikat.filter(k => Math.abs(k[0]) <= 1).map(k => k[2]));
      ikatKepala.add(kotak(3.9, 1.2, 0.26, [perak, perak, perak, perak, mukaPelat, perak], 0, 4, dahi + 0.6));
      /* Simpul & dua ujung kain di belakang kepala, berkibar saat berjalan. */
      const tengkuk = Math.min(...ikat.filter(k => k[0] === 0).map(k => k[2]));
      const simpul = new THREE.Group();
      simpul.position.set(0, 4, tengkuk - 0.6);
      simpul.add(voxel([[0, 0, 0]], biruIkat));
      const ujungKain: T.Group[] = [];
      for (const s of [-1, 1]) {
        const g = new THREE.Group();
        g.position.set(s * 0.45, -0.2, -0.3);
        g.add(voxel([[0, -0.6, -0.1], [s * 0.15, -1.5, -0.35], [s * 0.3, -2.4, -0.55]], biruIkat, 0.7));
        simpul.add(g);
        ujungKain.push(g);
      }
      ikatKepala.add(simpul);

      /* ---------------- pose duduk ---------------- */
      const duduk = new THREE.Group();
      const badanBiasa = voxel(elipsoid([0, 3.4, -0.4], [3.9, 3.6, 3.2]));
      const bajuDuduk = new THREE.Group();
      duduk.add(badanBiasa, bajuDuduk);
      bajuDuduk.add(
        jubah(
          (x, y, z) => (x / 3.9) ** 2 + ((y - 3.4) / 3.6) ** 2 + ((z + 0.4) / 3.2) ** 2 <= 1 && y >= -0.25,
          [[-8, -1, -8], [8, 15, 6]],
          -0.4,
          7,
          [[-6, 6], [7, 10], [-15, 9], [16, 4]],
        ),
      );
      const leherDuduk = new THREE.Group();
      leherDuduk.position.set(0, 7.6, 0);
      duduk.add(leherDuduk);
      const kerahDuduk = kerah(1);
      kerahDuduk.position.copy(leherDuduk.position);
      bajuDuduk.add(kerahDuduk);
      const cakar: T.Group[] = [];
      for (const s of [-1, 1]) {
        const g = new THREE.Group();
        const pos: V[] = [];
        for (const x of [1, 2]) for (let y = 0; y <= 1; y++) for (const z of [2, 3]) pos.push([s * x, y, z]);
        g.add(voxel(pos));
        duduk.add(g);
        cakar.push(g);
      }
      const ekorDuduk = new THREE.Group();
      ekorDuduk.position.set(1, 1, -3);
      const posEkor: V[] = [];
      for (let i = 0; i < 11; i++) {
        const t = i / 10;
        posEkor.push([Math.round(t * 4 + Math.sin(t * 3) * 0.5), Math.round(t * 7 - Math.max(0, t - 0.7) * 6), Math.round(t * 1.5)]);
      }
      ekorDuduk.add(voxel(posEkor));
      duduk.add(ekorDuduk);

      /* ---------------- pose jalan kucing biasa (empat kaki) ---------------- */
      const jalan = new THREE.Group();
      jalan.add(voxel(elipsoid([0, 4.4, 0], [2.5, 2.3, 4.4])));
      const leherJalan = new THREE.Group();
      leherJalan.position.set(0, 4.9, 3.3);
      jalan.add(leherJalan);
      const kaki: T.Group[] = [];
      for (const [x, z] of [[-1.4, 2.6], [1.4, 2.6], [-1.4, -2.6], [1.4, -2.6]]) {
        const g = new THREE.Group();
        g.position.set(x, 3, z);
        g.add(voxel([[0, -1, 0], [0, -2, 0], [0, -3, 0]]));
        jalan.add(g);
        kaki.push(g);
      }
      const ekorJalan = new THREE.Group();
      ekorJalan.position.set(0, 5.4, -4.2);
      ekorJalan.add(voxel([[0, 0, 0], [0, 1, -1], [0, 2, -1], [0, 3, -1], [0, 4, 0], [0, 5, 0], [0, 6, 1]]));
      jalan.add(ekorJalan);

      /* ---------------- pose jalan berbaju: tegak dua kaki seperti manusia ---------------- */
      const berdiri = new THREE.Group();
      const PINGGUL = 2.9;
      const kakiB: T.Group[] = [];
      for (const s of [-1, 1]) {
        const g = new THREE.Group();
        g.position.set(s * 1, PINGGUL, 0);
        g.add(voxel([[0, -0.8, 0], [0, -1.8, 0], [0, -2.42, 0.75]]));
        berdiri.add(g);
        kakiB.push(g);
      }
      /* Jubah mengembang ke bawah seperti lonceng, ujungnya di atas mata kaki. */
      const lebarJubah = (y: number) => {
        const t = (y - 2) / 5.6;
        return [3.1 - 0.8 * t, 2.5 - 0.55 * t];
      };
      berdiri.add(
        jubah(
          (x, y, z) => {
            if (y < 2 || y > 7.6) return false;
            const [rx, rz] = lebarJubah(y);
            return (x / rx) ** 2 + (z / rz) ** 2 <= 1;
          },
          [[-7, 4, -6], [7, 16, 6]],
          0,
          4.9,
          [[-5, 7], [5, 11], [-11, 11], [11, 6]],
        ),
      );
      const leherBerdiri = new THREE.Group();
      leherBerdiri.position.set(0, 8, 0.1);
      berdiri.add(leherBerdiri);
      const kerahBerdiri = kerah(0.9);
      kerahBerdiri.position.copy(leherBerdiri.position);
      berdiri.add(kerahBerdiri);
      /* Lengan: lengan jubah hitam, lapisan merah di ujungnya, telapak bulu hitam. */
      const lengan: T.Group[] = [];
      for (const s of [-1, 1]) {
        const g = new THREE.Group();
        g.position.set(s * 3.1, 6.9, 0);
        g.rotation.z = s * 0.15;
        const pos: V[] = [];
        for (let x = -1; x <= 1; x++) for (let y = -6; y <= -1; y++) for (let z = -1; z <= 1; z++) pos.push([x, y, z]);
        g.add(voxel(pos, (p, i) => (p[1] === -6 ? MERAH : kain(i)), 0.5));
        g.add(voxel([[0, -3.65, 0.1]]));
        berdiri.add(g);
        lengan.push(g);
      }
      const ekorBerdiri = new THREE.Group();
      ekorBerdiri.position.set(0.6, 2.6, -2.4);
      ekorBerdiri.add(voxel([[0, 0, 0], [0, 0.3, -1], [0, 1.2, -1.6], [0, 2.2, -1.8], [0, 3.1, -1.5], [0, 3.8, -0.9]]));
      berdiri.add(ekorBerdiri);

      /* ---------------- laptop ---------------- */
      const laptop = new THREE.Group();
      laptop.position.set(0, 0, 5.6);
      laptop.add(kotak(7, 0.5, 4.4, logam, 0, 0.25, 0));
      laptop.add(kotak(6.2, 0.08, 2.4, keyboard, 0, 0.54, -0.6)); // keyboard di sisi kucing
      /* Laptop menghadap kucing: engsel di sisi kamera, jadi kita melihat punggung layar
         dan kepala kucing menyembul di atasnya. */
      const tutup = new THREE.Group();
      tutup.position.set(0, 0.5, 2.2);
      tutup.add(
        kotak(7, 3.8, 0.32, logam, 0, 1.9, 0),
        kotak(6.4, 3.2, 0.06, layar, 0, 1.95, -0.2), // layar menghadap kucing
        kotak(0.9, 0.9, 0.06, logoNyala, 0, 2.0, 0.2), // logo di punggung layar, menghadap kamera
      );
      laptop.add(tutup);
      laptop.visible = false;

      /* Piksel kode yang beterbangan saat fokus. */
      const partikel: T.Mesh[] = [];
      const warnaPartikel = [0x8297f0, 0xe8628a, 0xffd23f, 0x9fe8c4];
      for (let i = 0; i < 8; i++) {
        const b = new THREE.MeshBasicMaterial({ color: warnaPartikel[i % 4], transparent: true, toneMapped: false });
        disposables.push(b);
        const m = kotak(0.5, 0.5, 0.5, b);
        m.visible = false;
        partikel.push(m);
      }

      /* Kepulan asap saat berganti baju (henge ala ninja). */
      const asap: { m: T.Mesh; arah: T.Vector3 }[] = [];
      for (let i = 0; i < 14; i++) {
        const b = new THREE.MeshBasicMaterial({ color: i % 3 ? 0xdfe3f2 : 0xb8c2ff, transparent: true, toneMapped: false, depthWrite: false });
        disposables.push(b);
        const m = kotak(1, 1, 1, b);
        m.visible = false;
        const a = (i / 14) * Math.PI * 2;
        asap.push({ m, arah: new THREE.Vector3(Math.cos(a) * 1.3, Math.sin(a * 3) * 0.35 + (i % 2 ? 0.6 : -0.3), Math.sin(a) * 0.8) });
      }

      const kucing = new THREE.Group();
      kucing.add(duduk, jalan, berdiri, laptop, ...partikel);
      scene.add(kucing);
      for (const a of asap) scene.add(a.m);

      let berbaju = false;
      const pakaiBaju = (b: boolean) => {
        berbaju = b;
        telingaBawah.visible = !b;
        ikatKepala.visible = b;
        pinkTelinga.forEach(p => (p.position.y = b ? 5.3 : 4.5));
        badanBiasa.visible = !b;
        bajuDuduk.visible = b;
      };
      pakaiBaju(false);

      type Pose = 'duduk' | 'jalan' | 'berdiri';
      let pose: Pose | null = null;
      const leherPose = { duduk: leherDuduk, jalan: leherJalan, berdiri: leherBerdiri };
      const pasangPose = (p: Pose) => {
        pose = p;
        duduk.visible = p === 'duduk';
        jalan.visible = p === 'jalan';
        berdiri.visible = p === 'berdiri';
        leherPose[p].add(kepala);
        kepala.scale.setScalar(p === 'duduk' ? 1 : 0.9);
      };
      pasangPose('duduk');

      /* ---------------- interaksi & mode ---------------- */
      const arahKursor = { x: 0, y: 0 };
      const gerakKursor = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        arahKursor.x = jepit((e.clientX - (r.left + r.width / 2)) / 400, -1, 1);
        arahKursor.y = jepit((e.clientY - (r.top + r.height / 2)) / 400, -1, 1);
      };
      window.addEventListener('pointermove', gerakKursor, { passive: true });

      let modeTarget = navbar ? ambilModeKucing() : 'bebas';
      const lepasMode = navbar ? langgananKucing(m => (modeTarget = m)) : () => {};

      /* ---------------- mesin keadaan ---------------- */
      let fase: Fase = 'diam';
      let faseMulai = 0;
      let lamaDiam = 1.5 + Math.random() * 2;
      let x = 0;
      let tujuan = 0;
      let arah = 1;
      let bukaLaptop = 0; // 0 tertutup … 1 terbuka
      let skalaLaptop = 0;
      let kedipBerikut = 1.5 + Math.random() * 2;
      /* Bawaan kucing biasa; baju dipakai sesekali, sebentar, lalu dilepas lagi. */
      let gantiBerikut = 9 + Math.random() * 8;
      let asapMulai = -1;
      let sudahTukar = true;
      const keFase = (f: Fase, t: number) => {
        fase = f;
        faseMulai = t;
      };

      let raf = 0;
      let terlihat = true;
      const t0 = performance.now();
      let akhir = t0;
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (!terlihat || document.hidden) return;
        const t = (now - t0) / 1000;
        const dt = Math.min(0.05, (now - akhir) / 1000);
        akhir = now;
        const batas = Math.max(0, setengahLebar - 6.5);
        const lama = t - faseMulai;

        /* --- transisi --- */
        if (navbar && !kurangGerak) {
          if (fase === 'diam') {
            if (modeTarget === 'fokus') {
              tujuan = 0;
              keFase(Math.abs(x) > 0.4 ? 'menuju' : 'buka', t);
            } else if (lama > lamaDiam && batas > 1) {
              do tujuan = (Math.random() * 2 - 1) * batas;
              while (Math.abs(tujuan - x) < Math.min(4, batas));
              keFase('jalan', t);
            }
          } else if (fase === 'jalan' || fase === 'menuju') {
            if (fase === 'jalan' && modeTarget === 'fokus') {
              tujuan = 0;
              keFase('menuju', t);
            }
            const kecepatan = berbaju ? (fase === 'menuju' ? 8 : 4.6) : fase === 'menuju' ? 11 : 6;
            const sisa = tujuan - x;
            arah = Math.sign(sisa) || arah;
            x += Math.sign(sisa) * Math.min(Math.abs(sisa), kecepatan * dt);
            if (Math.abs(tujuan - x) < 0.05) {
              x = tujuan;
              if (fase === 'menuju') keFase('buka', t);
              else {
                lamaDiam = 2 + Math.random() * 3.5;
                keFase('diam', t);
              }
            }
          } else if (fase === 'buka') {
            skalaLaptop = halus(skalaLaptop, 1, 0.18);
            if (lama > 0.35) bukaLaptop = Math.min(1, bukaLaptop + dt / 0.8);
            if (modeTarget === 'bebas') keFase('tutup', t);
            else if (bukaLaptop >= 1) keFase('fokus', t);
          } else if (fase === 'fokus') {
            if (modeTarget === 'bebas') keFase('tutup', t);
          } else if (fase === 'tutup') {
            bukaLaptop = Math.max(0, bukaLaptop - dt / 0.5);
            if (bukaLaptop <= 0) skalaLaptop = halus(skalaLaptop, 0, 0.25);
            if (bukaLaptop <= 0 && skalaLaptop < 0.02) {
              skalaLaptop = 0;
              lamaDiam = 1.2;
              keFase('diam', t);
            }
          }
        }

        /* --- ganti baju: hanya saat santai; mode fokus selalu kucing biasa --- */
        if (navbar && !kurangGerak && asapMulai < 0) {
          const lepasUntukFokus = berbaju && modeTarget === 'fokus';
          const waktunya = modeTarget === 'bebas' && fase === 'diam' && t > gantiBerikut;
          if (lepasUntukFokus || waktunya) {
            asapMulai = t;
            sudahTukar = false;
          }
        }
        if (asapMulai >= 0) {
          const k = (t - asapMulai) / 0.65;
          if (!sudahTukar && k > 0.22) {
            pakaiBaju(!berbaju);
            sudahTukar = true;
            gantiBerikut = t + (berbaju ? 22 + Math.random() * 22 : 28 + Math.random() * 32);
          }
          const tampak = k < 1;
          asap.forEach(({ m, arah: a }, i) => {
            m.visible = tampak;
            if (!tampak) return;
            const e = 1 - Math.pow(1 - k, 3);
            m.position.set(x + a.x * (1.5 + e * 5.5), 6.5 + a.y * (1.5 + e * 5) + e * 1.5, 2 + a.z * (1.5 + e * 4));
            m.scale.setScalar((1.6 + (i % 3) * 0.5) * (k < 0.25 ? k / 0.25 : 1 - (k - 0.25) * 0.9));
            (m.material as T.MeshBasicMaterial).opacity = k < 0.25 ? 1 : 1 - (k - 0.25) / 0.75;
          });
          if (!tampak) asapMulai = -1;
        }

        const sedangJalan = fase === 'jalan' || fase === 'menuju';
        const poseKini: Pose = sedangJalan ? (berbaju ? 'berdiri' : 'jalan') : 'duduk';
        if (poseKini !== pose) pasangPose(poseKini);
        const sibuk = fase === 'buka' || fase === 'fokus' || fase === 'tutup';
        const fokus = fase === 'fokus';

        /* --- masuk (lompat kecil) --- */
        const masuk = Math.min(1, t / 0.7);
        const pantul = kurangGerak ? 1 : Math.max(0.01, 1 - Math.pow(1 - masuk, 3) + Math.sin(masuk * Math.PI) * 0.12);
        kucing.scale.setScalar(pantul);

        /* --- posisi & arah hadap --- */
        kucing.position.x = x;
        const hadap = sedangJalan ? arah * (berbaju ? 1.15 : 1.05) : sibuk ? 0 : -0.3;
        kucing.rotation.y = halus(kucing.rotation.y, hadap, 0.12);
        /* Langkah manusia: satu putaran = dua langkah. Tubuh paling tinggi saat kaki
           lurus di bawah (sin = 0), paling rendah saat kedua kaki terbuka. */
        const langkah = berbaju ? t * (fase === 'menuju' ? 12 : 8.5) : t * 13;
        const ayun = Math.sin(langkah);
        kucing.position.y = kurangGerak
          ? 0
          : sedangJalan
            ? berbaju
              ? (1 - Math.abs(ayun)) * 0.3
              : Math.abs(ayun) * 0.35
            : Math.sin(t * 2) * 0.12 + (1 - masuk) * 3;

        /* --- animasi bagian tubuh --- */
        if (sedangJalan && !berbaju) {
          kaki.forEach((k, i) => (k.rotation.x = Math.sin(langkah + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.65));
          ekorJalan.rotation.x = -0.2 + Math.sin(t * 6) * 0.15;
          ekorJalan.rotation.z = Math.sin(t * 4) * 0.25;
          kepala.rotation.set(Math.sin(langkah * 2) * 0.04, 0, 0);
        } else if (sedangJalan) {
          kakiB.forEach((k, i) => (k.rotation.x = (i ? -1 : 1) * ayun * 0.7));
          lengan.forEach((l, i) => (l.rotation.x = (i ? 1 : -1) * ayun * 0.65));
          berdiri.rotation.set(0.05, 0, ayun * 0.035);
          ekorBerdiri.rotation.x = -0.25 + Math.sin(t * 6) * 0.12;
          ekorBerdiri.rotation.z = Math.sin(t * 4) * 0.28;
          kepala.rotation.set(Math.cos(langkah * 2) * 0.035, 0, -ayun * 0.03);
          /* Ujung ikat kepala terbawa angin ke belakang. */
          ujungKain.forEach((u, i) => (u.rotation.x = -0.75 + Math.sin(t * 11 + i * 1.7) * 0.18));
        } else {
          ekorDuduk.rotation.z = kurangGerak ? 0 : Math.sin(t * (fokus ? 5 : 2.4)) * (fokus ? 0.18 : 0.32);
          ekorDuduk.rotation.y = kurangGerak ? 0 : Math.sin(t * 1.3) * 0.2;
          ujungKain.forEach((u, i) => (u.rotation.x = kurangGerak ? -0.15 : -0.15 + Math.sin(t * 1.6 + i) * 0.06));
          const tx = sibuk ? (fokus ? 0.22 : 0.1) : arahKursor.y * 0.3;
          const ty = sibuk ? 0 : arahKursor.x * 0.6;
          kepala.rotation.x = halus(kepala.rotation.x, tx, 0.08);
          kepala.rotation.y = halus(kepala.rotation.y, ty, 0.08);
          kepala.rotation.z = kurangGerak || fokus ? 0 : Math.sin(t * 0.9) * 0.05;
          /* Kaki depan: diam, atau di atas keyboard (mengetik cepat saat fokus). */
          cakar.forEach((c, i) => {
            const diAtasKeyboard = sibuk && bukaLaptop > 0.6;
            const ketik = fokus && !kurangGerak ? Math.max(0, Math.sin(t * 18 + i * Math.PI)) * 0.45 : 0;
            c.position.y = halus(c.position.y, diAtasKeyboard ? 0.55 + ketik : 0, 0.3);
            c.position.z = halus(c.position.z, diAtasKeyboard ? 1.6 : 0, 0.2);
          });
        }

        /* --- laptop --- */
        laptop.visible = skalaLaptop > 0.01;
        laptop.scale.setScalar(Math.max(0.001, skalaLaptop));
        const buka = 1 - Math.pow(1 - bukaLaptop, 3);
        tutup.rotation.x = halus(-Math.PI / 2, 0.22, buka);
        sinarLayar.intensity = laptop.visible ? buka * (fokus ? 45 + Math.sin(t * 23) * 6 : 28) : 0;
        layar.color.setHSL(0.63, 0.75, fokus ? 0.72 + Math.sin(t * 17) * 0.04 : 0.68);

        /* --- mata: kedip, menyipit saat fokus --- */
        let skalaMata = fokus ? 0.42 : 1;
        if (t > kedipBerikut) {
          const k = (t - kedipBerikut) / 0.16;
          if (k < 1) skalaMata = Math.min(skalaMata, Math.abs(1 - 2 * k) * 0.9 + 0.1);
          else kedipBerikut = t + 2 + Math.random() * 3.5;
        }
        mata.scale.y = halus(mata.scale.y, skalaMata, 0.35);

        /* --- piksel kode beterbangan --- */
        partikel.forEach((p, i) => {
          p.visible = fokus && !kurangGerak;
          if (!p.visible) return;
          const u = (t * 0.7 + i * 0.137) % 1;
          p.position.set((i - 3.5) * 1.1 + Math.sin(t * 2 + i) * 0.4, 5.2 + u * 6.5, 4.2);
          p.scale.setScalar(1 - u * 0.6);
          (p.material as T.MeshBasicMaterial).opacity = 1 - u;
        });

        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(frame);
      const io = new IntersectionObserver(([e]) => (terlihat = e.isIntersecting));
      io.observe(canvas);

      bersihkan = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        lepasMode();
        window.removeEventListener('pointermove', gerakKursor);
        disposables.forEach(d => d.dispose());
        renderer.dispose();
        renderer.getContext().getExtension('WEBGL_lose_context')?.loseContext();
      };
    })();

    return () => {
      batal = true;
      bersihkan();
    };
  }, [ukuran, perilaku]);

  return (
    <canvas
      ref={ref}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      className={className}
      style={ukuran ? { width: ukuran, height: ukuran } : undefined}
    />
  );
}
