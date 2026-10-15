'use client';

/**
 * Maskot Hypomonē: kucing hitam voxel (pixel 3D) bermata kuning.
 *
 * Model disusun dari kubus satu satuan (InstancedMesh, satu draw call per
 * warna). Animasi: lompat masuk, napas, kedip acak, ekor mengibas, kepala
 * menoleh mengikuti kursor. Loop berhenti saat kanvas tidak terlihat.
 */
import * as React from 'react';
import type * as THREE_NS from 'three';

type V = [number, number, number];

/** Kubus di dalam elipsoid (pusat c, jari-jari r). */
function elipsoid(c: V, r: V, out: Set<string>) {
  for (let x = Math.floor(c[0] - r[0]); x <= Math.ceil(c[0] + r[0]); x++)
    for (let y = Math.floor(c[1] - r[1]); y <= Math.ceil(c[1] + r[1]); y++)
      for (let z = Math.floor(c[2] - r[2]); z <= Math.ceil(c[2] + r[2]); z++) {
        const d = ((x - c[0]) / r[0]) ** 2 + ((y - c[1]) / r[1]) ** 2 + ((z - c[2]) / r[2]) ** 2;
        if (d <= 1) out.add(`${x},${y},${z}`);
      }
}

const kunci = (s: string) => s.split(',').map(Number) as V;

function model() {
  const badan = new Set<string>();
  elipsoid([0, 3.4, -0.4], [3.9, 3.6, 3.2], badan);
  /* kaki depan */
  for (const x of [-2, -1, 1, 2]) for (let y = 0; y <= 1; y++) for (const z of [2, 3]) badan.add(`${x},${y},${z}`);

  const kepala = new Set<string>();
  elipsoid([0, 2.4, 0.6], [4.3, 3.1, 3.1], kepala); // relatif ke leher (y = 7.6)
  const telinga: V[] = [];
  for (const s of [-1, 1])
    for (const [x, y] of [[4, 4], [3, 4], [2, 4], [4, 5], [3, 5], [4, 6], [3, 6], [4, 7]] as [number, number][])
      for (const z of [0, 1]) telinga.push([s * x, y, z]);

  /* Muka: permukaan paling depan tiap (x, y) di kepala. */
  const depan = (x: number, y: number) => {
    let zMax = -99;
    kepala.forEach(k => {
      const [kx, ky, kz] = kunci(k);
      if (kx === x && ky === y) zMax = Math.max(zMax, kz);
    });
    return zMax;
  };
  const mata: V[] = [];
  for (const sx of [-1, 1]) for (const x of [1, 2]) for (const y of [2, 3]) mata.push([sx * x, y, depan(sx * x, y) + 0.05]);
  const hidung: V = [0, 1, depan(0, 1) + 0.05];
  const telingaDalam: V[] = [[-3, 4.5, 1.55], [3, 4.5, 1.55]];

  /* Ekor: rantai kubus melengkung dari pangkal belakang ke kanan atas. */
  const ekor: V[] = [];
  for (let i = 0; i < 11; i++) {
    const t = i / 10;
    ekor.push([Math.round(1 + t * 4 + Math.sin(t * 3) * 0.5), Math.round(t * 7 - Math.max(0, t - 0.7) * 6), Math.round(-3 + t * 1.5)]);
  }

  return {
    badan: [...badan].map(kunci),
    kepala: [...kepala].map(kunci).concat(telinga),
    mata,
    hidung,
    telingaDalam,
    ekor,
  };
}

export default function Kucing({ ukuran = 160, className = '', label = 'Maskot kucing hitam Hypomonē' }: { ukuran?: number; className?: string; label?: string }) {
  const ref = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let batal = false;
    let bersihkan = () => {};
    const kurangGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    (async () => {
      const THREE: typeof THREE_NS = await import('three');
      if (batal) return;
      let renderer: THREE_NS.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      } catch {
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(ukuran, ukuran, false);
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
      camera.position.set(0, 9, 33);
      camera.lookAt(0, 6.6, 0);

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

      const m = model();
      const kubus = new THREE.BoxGeometry(0.96, 0.96, 0.96);
      const bahanBulu = new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0 });
      const disposables: { dispose(): void }[] = [kubus, bahanBulu];

      const isi = (posisi: V[], warna: (i: number) => THREE_NS.Color) => {
        const im = new THREE.InstancedMesh(kubus, bahanBulu, posisi.length);
        const o = new THREE.Object3D();
        posisi.forEach((p, i) => {
          o.position.set(p[0], p[1], p[2]);
          o.updateMatrix();
          im.setMatrixAt(i, o.matrix);
          im.setColorAt(i, warna(i));
        });
        return im;
      };
      /* Variasi gelap-terang kecil per kubus: tekstur "pixel". */
      const hitam = (i: number) => new THREE.Color().setHSL(0.66, 0.15, 0.03 + ((i * 7919) % 5) * 0.006);

      const kucing = new THREE.Group();
      kucing.add(isi(m.badan, hitam));

      const leher = new THREE.Group();
      leher.position.set(0, 7.6, 0);
      leher.add(isi(m.kepala, hitam));

      const bahanMata = new THREE.MeshBasicMaterial({ color: 0xffd23f, toneMapped: false });
      const mata = new THREE.Group();
      const kubusMata = new THREE.BoxGeometry(0.98, 0.98, 0.2);
      m.mata.forEach(p => {
        const k = new THREE.Mesh(kubusMata, bahanMata);
        k.position.set(p[0], p[1], p[2] + 0.4);
        mata.add(k);
      });
      /* Pupil celah vertikal. */
      const bahanPupil = new THREE.MeshBasicMaterial({ color: 0x0b0b10 });
      const pupilGeo = new THREE.BoxGeometry(0.34, 1.7, 0.1);
      for (const sx of [-1, 1]) {
        const p = new THREE.Mesh(pupilGeo, bahanPupil);
        const z = Math.max(...m.mata.filter(e => Math.sign(e[0]) === sx).map(e => e[2]));
        p.position.set(sx * 1.5, 2.5, z + 0.56);
        mata.add(p);
      }
      leher.add(mata);
      const bahanPink = new THREE.MeshStandardMaterial({ color: 0xe8628a, roughness: 0.5 });
      const hidung = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.7, 0.3), bahanPink);
      hidung.position.set(m.hidung[0], m.hidung[1] + 0.1, m.hidung[2] + 0.4);
      leher.add(hidung);
      m.telingaDalam.forEach(p => {
        const t = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.2), bahanPink);
        t.position.set(p[0], p[1], p[2]);
        leher.add(t);
      });
      kucing.add(leher);

      const ekor = new THREE.Group();
      ekor.position.set(1, 1, -3);
      ekor.add(isi(m.ekor.map(([x, y, z]) => [x - 1, y - 1, z + 3] as V), hitam));
      kucing.add(ekor);

      disposables.push(bahanMata, kubusMata, bahanPupil, pupilGeo, bahanPink);
      kucing.rotation.y = -0.35;
      scene.add(kucing);

      /* Interaksi: kepala menoleh ke kursor. */
      const arah = { x: 0, y: 0 };
      const gerak = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        arah.x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / 400));
        arah.y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / 400));
      };
      window.addEventListener('pointermove', gerak, { passive: true });

      let raf = 0;
      let terlihat = true;
      const t0 = performance.now();
      let kedipBerikut = 1.5 + Math.random() * 2;
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (!terlihat) return;
        const t = (now - t0) / 1000;
        /* lompat masuk */
        const masuk = Math.min(1, t / 0.7);
        const pantul = 1 - Math.pow(1 - masuk, 3) + Math.sin(masuk * Math.PI) * 0.12;
        kucing.scale.setScalar(kurangGerak ? 1 : Math.max(0.01, pantul));
        kucing.position.y = kurangGerak ? 0 : Math.sin(t * 2) * 0.15 + (1 - masuk) * 3;
        ekor.rotation.z = kurangGerak ? 0 : Math.sin(t * 2.4) * 0.32;
        ekor.rotation.y = kurangGerak ? 0 : Math.sin(t * 1.3) * 0.2;
        leher.rotation.y += (arah.x * 0.6 - leher.rotation.y) * 0.08;
        leher.rotation.x += (arah.y * 0.3 - leher.rotation.x) * 0.08;
        leher.rotation.z = kurangGerak ? 0 : Math.sin(t * 0.9) * 0.05;
        /* kedip */
        if (t > kedipBerikut) {
          const k = (t - kedipBerikut) / 0.16;
          mata.scale.y = k < 1 ? Math.abs(1 - 2 * k) * 0.9 + 0.1 : 1;
          if (k >= 1) kedipBerikut = t + 2 + Math.random() * 3.5;
        }
        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(frame);
      const io = new IntersectionObserver(([e]) => (terlihat = e.isIntersecting));
      io.observe(canvas);

      bersihkan = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        window.removeEventListener('pointermove', gerak);
        disposables.forEach(d => d.dispose());
        renderer.dispose();
        renderer.getContext().getExtension('WEBGL_lose_context')?.loseContext();
      };
    })();

    return () => {
      batal = true;
      bersihkan();
    };
  }, [ukuran]);

  return <canvas ref={ref} role="img" aria-label={label} width={ukuran} height={ukuran} className={className} style={{ width: ukuran, height: ukuran }} />;
}
