'use client';

/**
 * Maskot Hypomonē: kucing hitam voxel (pixel 3D) bermata kuning.
 *
 * Dua perilaku:
 * - 'duduk'  : duduk menyambut (sapaan, login). Kedip, ekor mengibas, kepala ikut kursor.
 * - 'navbar' : hidup di jalur kecil navbar. Jalan bolak-balik, sesekali duduk. Saat mode
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
      const disposables: { dispose(): void }[] = [kubus, bulu, kuning, hitamPekat, pink, logam, logoNyala, keyboard, layar];
      const geo = (g: T.BufferGeometry) => (disposables.push(g), g);

      /* Variasi gelap-terang kecil per kubus: tekstur "pixel". */
      const hitam = (i: number) => new THREE.Color().setHSL(0.66, 0.15, 0.03 + ((i * 7919) % 5) * 0.006);
      const voxel = (posisi: V[]) => {
        const im = new THREE.InstancedMesh(kubus, bulu, posisi.length);
        const o = new THREE.Object3D();
        posisi.forEach((p, i) => {
          o.position.set(p[0], p[1], p[2]);
          o.updateMatrix();
          im.setMatrixAt(i, o.matrix);
          im.setColorAt(i, hitam(i));
        });
        return im;
      };
      const kotak = (w: number, h: number, d: number, bahan: T.Material, x = 0, y = 0, z = 0) => {
        const m = new THREE.Mesh(geo(new THREE.BoxGeometry(w, h, d)), bahan);
        m.position.set(x, y, z);
        return m;
      };

      /* ---------------- kepala (dipakai kedua pose) ---------------- */
      const kepala = new THREE.Group();
      const isiKepala = elipsoid([0, 2.4, 0.6], [4.3, 3.1, 3.1]);
      for (const s of [-1, 1])
        for (const [x, y] of [[4, 4], [3, 4], [2, 4], [4, 5], [3, 5], [4, 6], [3, 6], [4, 7]] as [number, number][])
          for (const z of [0, 1]) isiKepala.push([s * x, y, z]);
      kepala.add(voxel(isiKepala));
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
      kepala.add(kotak(0.9, 0.9, 0.2, pink, -3, 4.5, 1.55), kotak(0.9, 0.9, 0.2, pink, 3, 4.5, 1.55));

      /* ---------------- pose duduk ---------------- */
      const duduk = new THREE.Group();
      duduk.add(voxel(elipsoid([0, 3.4, -0.4], [3.9, 3.6, 3.2])));
      const leherDuduk = new THREE.Group();
      leherDuduk.position.set(0, 7.6, 0);
      duduk.add(leherDuduk);
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

      /* ---------------- pose jalan (empat kaki) ---------------- */
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

      const kucing = new THREE.Group();
      kucing.add(duduk, jalan, laptop, ...partikel);
      scene.add(kucing);

      let poseJalan = false;
      const pasangPose = (j: boolean) => {
        poseJalan = j;
        duduk.visible = !j;
        jalan.visible = j;
        (j ? leherJalan : leherDuduk).add(kepala);
        kepala.scale.setScalar(j ? 0.9 : 1);
      };
      pasangPose(false);

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
            const kecepatan = fase === 'menuju' ? 11 : 6;
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

        const sedangJalan = fase === 'jalan' || fase === 'menuju';
        if (sedangJalan !== poseJalan) pasangPose(sedangJalan);
        const sibuk = fase === 'buka' || fase === 'fokus' || fase === 'tutup';
        const fokus = fase === 'fokus';

        /* --- masuk (lompat kecil) --- */
        const masuk = Math.min(1, t / 0.7);
        const pantul = kurangGerak ? 1 : Math.max(0.01, 1 - Math.pow(1 - masuk, 3) + Math.sin(masuk * Math.PI) * 0.12);
        kucing.scale.setScalar(pantul);

        /* --- posisi & arah hadap --- */
        kucing.position.x = x;
        const hadap = sedangJalan ? arah * 1.05 : sibuk ? 0 : -0.3;
        kucing.rotation.y = halus(kucing.rotation.y, hadap, 0.12);
        const langkah = t * 13;
        kucing.position.y = kurangGerak
          ? 0
          : sedangJalan
            ? Math.abs(Math.sin(langkah)) * 0.35
            : Math.sin(t * 2) * 0.12 + (1 - masuk) * 3;

        /* --- animasi bagian tubuh --- */
        if (sedangJalan) {
          kaki.forEach((k, i) => (k.rotation.x = Math.sin(langkah + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.65));
          ekorJalan.rotation.x = -0.2 + Math.sin(t * 6) * 0.15;
          ekorJalan.rotation.z = Math.sin(t * 4) * 0.25;
          kepala.rotation.set(Math.sin(langkah * 2) * 0.04, 0, 0);
        } else {
          ekorDuduk.rotation.z = kurangGerak ? 0 : Math.sin(t * (fokus ? 5 : 2.4)) * (fokus ? 0.18 : 0.32);
          ekorDuduk.rotation.y = kurangGerak ? 0 : Math.sin(t * 1.3) * 0.2;
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
