/* ==========================================================================
   Perkakas voxel bersama untuk ruang fokus 3D.

   Semua kubus berbagi satu geometri dan satu bahan; warnanya per instans
   (InstancedMesh), jadi satu tokoh = beberapa draw call saja. Bahan yang
   "menyala" memakai warna HDR (> 1) supaya ditangkap efek bloom.
   ========================================================================== */
import * as THREE from 'three';

export type V = [number, number, number];

/** Kulit luar sebuah elipsoid voxel (bagian dalam tidak pernah terlihat). */
export function cangkang(c: V, r: V): V[] {
  const di = (x: number, y: number, z: number) =>
    ((x - c[0]) / r[0]) ** 2 + ((y - c[1]) / r[1]) ** 2 + ((z - c[2]) / r[2]) ** 2 <= 1;
  const out: V[] = [];
  for (let x = Math.floor(c[0] - r[0]); x <= Math.ceil(c[0] + r[0]); x++)
    for (let y = Math.floor(c[1] - r[1]); y <= Math.ceil(c[1] + r[1]); y++)
      for (let z = Math.floor(c[2] - r[2]); z <= Math.ceil(c[2] + r[2]); z++)
        if (di(x, y, z) && !(di(x + 1, y, z) && di(x - 1, y, z) && di(x, y + 1, z) && di(x, y - 1, z) && di(x, y, z + 1) && di(x, y, z - 1)))
          out.push([x, y, z]);
  return out;
}

/** Bilangan acak berbenih: tata letak ruangan sama setiap kali dibuka. */
export function acakBenih(benih: number) {
  let a = benih >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Pabrik = ReturnType<typeof buatPabrik>;

export function buatPabrik() {
  const kubus = new THREE.BoxGeometry(0.94, 0.94, 0.94);
  const bahan = new THREE.MeshStandardMaterial({ roughness: 0.82, metalness: 0 });
  const sampah: { dispose(): void }[] = [kubus, bahan];
  const cacheNyala = new Map<string, THREE.MeshBasicMaterial>();
  const cachePolos = new Map<string, THREE.MeshStandardMaterial>();
  const c = new THREE.Color();

  return {
    sampah,
    /** Kumpulan kubus; warna bisa satu nilai atau fungsi per kubus. */
    voxel(pos: V[], warna: number | ((p: V, i: number) => number), acak = 0.04) {
      const im = new THREE.InstancedMesh(kubus, bahan, Math.max(1, pos.length));
      const o = new THREE.Object3D();
      pos.forEach((p, i) => {
        o.position.set(p[0], p[1], p[2]);
        o.updateMatrix();
        im.setMatrixAt(i, o.matrix);
        c.setHex(typeof warna === 'number' ? warna : warna(p, i));
        if (acak) c.offsetHSL(0, 0, ((((i * 7919) % 5) - 2) * acak) / 2);
        im.setColorAt(i, c);
      });
      if (!pos.length) im.count = 0;
      return im;
    },
    kotak(w: number, h: number, d: number, m: THREE.Material | THREE.Material[], x = 0, y = 0, z = 0) {
      const g = new THREE.BoxGeometry(w, h, d);
      sampah.push(g);
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(x, y, z);
      return mesh;
    },
    /** Bahan bercahaya sendiri; kuat > 1 = HDR, ikut berpendar oleh bloom. */
    nyala(hex: number, kuat = 1, opsi: Partial<THREE.MeshBasicMaterialParameters> = {}) {
      const k = `${hex}:${kuat}:${JSON.stringify(opsi)}`;
      let m = cacheNyala.get(k);
      if (!m) {
        m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(kuat), ...opsi });
        cacheNyala.set(k, m);
        sampah.push(m);
      }
      return m;
    },
    polos(hex: number, kasar = 0.75, logam = 0) {
      const k = `${hex}:${kasar}:${logam}`;
      let m = cachePolos.get(k);
      if (!m) {
        m = new THREE.MeshStandardMaterial({ color: hex, roughness: kasar, metalness: logam });
        cachePolos.set(k, m);
        sampah.push(m);
      }
      return m;
    },
  };
}

export const halus = (a: number, b: number, k: number) => a + (b - a) * k;
