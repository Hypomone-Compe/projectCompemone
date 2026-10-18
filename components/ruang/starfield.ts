/* ==========================================================================
   Starfield Library, COEX Seoul, versi voxel Hypomonē.

   Aula panjang diapit rak buku setinggi 13 m (puluhan ribu buku, satu
   InstancedMesh per dinding), garis lampu hangat di rak, bola-bola lampu
   menggantung, cincin lampu besar, atap kaca dengan langit malam berbintang,
   dan layar LED raksasa di ujung aula.

   Kita duduk di meja panjang tengah. Satuan = meter. Kamera menghadap -z.
   ========================================================================== */
import * as THREE from 'three';
import { buatAvatar, type Avatar, type OpsiAvatar } from './avatar';
import { acakBenih, buatPabrik } from './voxel';

export type Kualitas = 'tinggi' | 'rendah';

export interface Adegan {
  scene: THREE.Scene;
  /** Posisi mata kita (duduk). */
  mata: THREE.Vector3;
  update(t: number, dt: number, fokus: boolean): void;
  dispose(): void;
}

const BUKU = [0x7a2e2e, 0x2f4a6d, 0x3d5c3a, 0xc9b48a, 0x8a5a2b, 0xd6c7a6, 0x5b3a5e, 0xb5832f, 0x1f2c3f, 0x9e4a3a, 0xe8e0cf, 0x4d6b73, 0x6e2a3f, 0xa3a07a];
const MEJA_KITA_Z = -0.85;

export function bangunStarfield(kualitas: Kualitas): Adegan {
  const rendah = kualitas === 'rendah';
  const pb = buatPabrik();
  const acak = acakBenih(20261018);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0a0c);
  scene.fog = new THREE.FogExp2(0x1d1510, 0.0105);

  const kotakSatuan = new THREE.BoxGeometry(1, 1, 1);
  pb.sampah.push(kotakSatuan);
  /** Banyak kotak berbeda ukuran dalam satu draw call. */
  const kumpulan = (bahan: THREE.Material, isi: { p: THREE.Vector3; s: THREE.Vector3; rz?: number; warna?: number }[]) => {
    const im = new THREE.InstancedMesh(kotakSatuan, bahan, isi.length);
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    isi.forEach((k, i) => {
      o.position.copy(k.p);
      o.scale.copy(k.s);
      o.rotation.set(0, 0, k.rz || 0);
      o.updateMatrix();
      im.setMatrixAt(i, o.matrix);
      if (k.warna != null) im.setColorAt(i, c.setHex(k.warna));
    });
    return im;
  };
  const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  /* ---------------- cahaya ---------------- */
  scene.add(new THREE.HemisphereLight(0xffe2bc, 0x24180f, 0.55));
  const atas = new THREE.DirectionalLight(0xffe2b8, 0.35);
  atas.position.set(-4, 20, 6);
  scene.add(atas);
  for (const z of [4, -10, -24, -38]) {
    const l = new THREE.PointLight(0xffcf96, 26, 30, 1.4);
    l.position.set(0, 9.5, z);
    scene.add(l);
  }
  for (const x of [-1.125, 1.125]) {
    const l = new THREE.PointLight(0xffc98a, 1.6, 4, 1.6);
    l.position.set(x, 1.2, MEJA_KITA_Z);
    scene.add(l);
  }
  const sinarLaptop = new THREE.PointLight(0x9fb3ff, 0.5, 1.4, 1.5);
  sinarLaptop.position.set(0, 1, -1.32);
  scene.add(sinarLaptop);

  /* ---------------- lantai kayu ---------------- */
  {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const g = c.getContext('2d')!;
    const r = acakBenih(5);
    for (let row = 0; row < 8; row++) {
      let x = -r() * 200;
      while (x < 512) {
        const w = 160 + r() * 220;
        const l = 30 + r() * 10;
        g.fillStyle = `hsl(${26 + r() * 6}, ${38 + r() * 10}%, ${l}%)`;
        g.fillRect(x, row * 64, w, 64);
        g.strokeStyle = 'rgba(40,22,10,0.55)';
        g.lineWidth = 2;
        g.strokeRect(x + 1, row * 64 + 1, w - 2, 62);
        g.strokeStyle = 'rgba(60,35,18,0.18)';
        g.lineWidth = 1;
        for (let k = 0; k < 4; k++) {
          const y = row * 64 + 8 + r() * 48;
          g.beginPath();
          g.moveTo(x, y);
          g.bezierCurveTo(x + w * 0.3, y + r() * 6 - 3, x + w * 0.7, y + r() * 6 - 3, x + w, y);
          g.stroke();
        }
        x += w;
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(12, 36);
    tex.anisotropy = 8;
    pb.sampah.push(tex);
    const bahan = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0.05 });
    pb.sampah.push(bahan);
    const lantai = new THREE.Mesh(new THREE.PlaneGeometry(20, 62), bahan);
    pb.sampah.push(lantai.geometry);
    lantai.rotation.x = -Math.PI / 2;
    lantai.position.set(0, 0, -19);
    scene.add(lantai);
  }

  /* ---------------- rak buku raksasa ---------------- */
  const KAYU_RAK = pb.polos(0xd8b483, 0.7);
  const PUNGGUNG_RAK = pb.polos(0x2a1c12, 0.9);
  const bahanBuku = new THREE.MeshStandardMaterial({ roughness: 0.78 });
  pb.sampah.push(bahanBuku);
  const garisLampu = pb.nyala(0xffd29a, 2);

  /** Rak di koordinat lokal: muka di z = 0 menghadap +z, membentang x 0..L, tinggi H. */
  const rak = (L: number, H: number) => {
    const g = new THREE.Group();
    const D = 0.55;
    const tinggiBaris = 0.62;
    const lebarSel = 1.3;
    const baris = Math.floor(H / tinggiBaris);
    g.add(pb.kotak(L, H, 0.05, PUNGGUNG_RAK, L / 2, H / 2, -D));

    const papan: { p: THREE.Vector3; s: THREE.Vector3 }[] = [];
    for (let r = 0; r <= baris; r++) papan.push({ p: v3(L / 2, r * tinggiBaris, -D / 2), s: v3(L, 0.045, D) });
    const nSel = Math.round(L / lebarSel);
    for (let k = 0; k <= nSel; k++) papan.push({ p: v3((k * L) / nSel, H / 2, -D / 2), s: v3(0.06, H, D) });
    g.add(kumpulan(KAYU_RAK, papan));

    /* Garis lampu tiap empat baris, plus lampu di puncak rak. */
    for (let r = 4; r <= baris; r += 4) g.add(pb.kotak(L, 0.035, 0.03, garisLampu, L / 2, r * tinggiBaris - 0.04, -0.02));
    g.add(pb.kotak(L, 0.06, 0.06, pb.nyala(0xffd9a8, 3.2), L / 2, baris * tinggiBaris + 0.05, -0.1));

    const buku: { p: THREE.Vector3; s: THREE.Vector3; rz?: number; warna: number }[] = [];
    const [wMin, wMax] = rendah ? [0.09, 0.17] : [0.05, 0.11];
    for (let r = 0; r < baris; r++) {
      const y0 = r * tinggiBaris + 0.023;
      for (let k = 0; k < nSel; k++) {
        const xa = (k * L) / nSel + 0.04;
        const xb = ((k + 1) * L) / nSel - 0.04;
        if (acak() < 0.07) {
          /* Sel pajangan: tumpukan buku rebah. */
          let y = y0;
          const n = 3 + Math.floor(acak() * 4);
          const cx = xa + (xb - xa) * (0.3 + acak() * 0.4);
          for (let i = 0; i < n; i++) {
            const t = 0.035 + acak() * 0.03;
            buku.push({ p: v3(cx + (acak() - 0.5) * 0.05, y + t / 2, -D / 2), s: v3(0.32 + acak() * 0.12, t, D * 0.7), warna: BUKU[Math.floor(acak() * BUKU.length)] });
            y += t;
          }
          continue;
        }
        let x = xa;
        while (x < xb) {
          if (acak() < 0.06) {
            x += 0.05 + acak() * 0.12;
            continue;
          }
          const w = wMin + acak() * (wMax - wMin);
          if (x + w > xb) break;
          const h = tinggiBaris * (0.6 + acak() * 0.3);
          const d = D * (0.62 + acak() * 0.28);
          const miring = acak() < 0.03 ? (acak() < 0.5 ? -1 : 1) * 0.22 : 0;
          const warna = new THREE.Color(BUKU[Math.floor(acak() * BUKU.length)]).offsetHSL(0, 0, (acak() - 0.5) * 0.08).getHex();
          buku.push({ p: v3(x + w / 2, y0 + h / 2, -D + d / 2 + 0.03), s: v3(w * 0.94, h, d), rz: miring, warna });
          x += w;
        }
      }
    }
    g.add(kumpulan(bahanBuku, buku));
    return g;
  };

  const H = 13;
  const PANJANG = 60;
  const kiri = rak(PANJANG, H);
  kiri.rotation.y = Math.PI / 2;
  kiri.position.set(-10, 0, 11);
  const kanan = rak(PANJANG, H);
  kanan.rotation.y = -Math.PI / 2;
  kanan.position.set(10, 0, 11 - PANJANG);
  const belakang = rak(20, H);
  belakang.rotation.y = Math.PI;
  belakang.position.set(10, 0, 11);
  const ujung = rak(20, H);
  ujung.position.set(-10, 0, 11 - PANJANG);
  scene.add(kiri, kanan, belakang, ujung);

  /* Dinding di atas rak sampai atap. */
  const dindingAtas = pb.polos(0x1f1610, 0.95);
  scene.add(
    pb.kotak(0.2, 4.5, PANJANG, dindingAtas, -10.3, H + 2.25, 11 - PANJANG / 2),
    pb.kotak(0.2, 4.5, PANJANG, dindingAtas, 10.3, H + 2.25, 11 - PANJANG / 2),
    pb.kotak(20.6, 4.5, 0.2, dindingAtas, 0, H + 2.25, 11.3),
    pb.kotak(20.6, 4.5, 0.2, dindingAtas, 0, H + 2.25, 11 - PANJANG - 0.3),
  );

  /* ---------------- atap kaca & langit malam ---------------- */
  const ATAP = 17.5;
  {
    const balok: { p: THREE.Vector3; s: THREE.Vector3 }[] = [];
    for (let x = -10; x <= 10; x += 2.5) balok.push({ p: v3(x, ATAP, 11 - PANJANG / 2), s: v3(0.12, 0.22, PANJANG) });
    for (let z = 11; z >= 11 - PANJANG; z -= 3) balok.push({ p: v3(0, ATAP, z), s: v3(20, 0.22, 0.12) });
    scene.add(kumpulan(pb.polos(0x2d2f38, 0.5, 0.6), balok));
    const kaca = new THREE.Mesh(
      new THREE.PlaneGeometry(20, PANJANG),
      new THREE.MeshBasicMaterial({ color: 0x8fb3ff, transparent: true, opacity: 0.05, depthWrite: false, side: THREE.DoubleSide }),
    );
    pb.sampah.push(kaca.geometry, kaca.material as THREE.Material);
    kaca.rotation.x = Math.PI / 2;
    kaca.position.set(0, ATAP + 0.05, 11 - PANJANG / 2);
    scene.add(kaca);

    const langitGeo = new THREE.SphereGeometry(160, 32, 16);
    const langitBahan = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `varying vec3 vP;
        void main(){
          float h = clamp(vP.y, 0.0, 1.0);
          vec3 c = mix(vec3(0.10,0.07,0.16), vec3(0.012,0.018,0.06), pow(h, 0.6));
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`,
    });
    pb.sampah.push(langitGeo, langitBahan);
    scene.add(new THREE.Mesh(langitGeo, langitBahan));

    const n = rendah ? 900 : 2200;
    const pos = new Float32Array(n * 3);
    const r = acakBenih(77);
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2;
      const e = 0.18 + r() * 1.35;
      pos.set([Math.cos(a) * Math.cos(e) * 140, Math.sin(e) * 140, Math.sin(a) * Math.cos(e) * 140 - 19], i * 3);
    }
    const bintangGeo = new THREE.BufferGeometry();
    bintangGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const bintangBahan = new THREE.PointsMaterial({ color: new THREE.Color(0xdfe6ff).multiplyScalar(1.6), size: 1.3, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.9 });
    pb.sampah.push(bintangGeo, bintangBahan);
    scene.add(new THREE.Points(bintangGeo, bintangBahan));
  }

  /* ---------------- lampu gantung & cincin ---------------- */
  const bolaGeo = new THREE.SphereGeometry(1, 18, 12);
  pb.sampah.push(bolaGeo);
  {
    const n = rendah ? 30 : 48;
    const bola = new THREE.InstancedMesh(bolaGeo, pb.nyala(0xffffff, 1.7), n);
    const kabel: { p: THREE.Vector3; s: THREE.Vector3 }[] = [];
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const x = (acak() - 0.5) * 15;
      const z = 9 - acak() * 56;
      const y = 6.5 + acak() * 6;
      const s = 0.22 + acak() * 0.3;
      o.position.set(x, y, z);
      o.scale.setScalar(s);
      o.updateMatrix();
      bola.setMatrixAt(i, o.matrix);
      bola.setColorAt(i, c.setHSL(0.09 + acak() * 0.03, 0.85, 0.72 + acak() * 0.12));
      kabel.push({ p: v3(x, (y + s + ATAP) / 2, z), s: v3(0.012, ATAP - y - s, 0.012) });
    }
    scene.add(bola, kumpulan(pb.polos(0x1a1a1f), kabel));

    const torusGeo = new THREE.TorusGeometry(1, 0.025, 8, 96);
    pb.sampah.push(torusGeo);
    for (const [z, y, r] of [[-5, 10, 2.6], [-21, 11, 3.2], [-37, 10.5, 2.8]]) {
      for (const k of [1, 0.72]) {
        const t = new THREE.Mesh(torusGeo, pb.nyala(0xfff0d0, 2.8));
        t.scale.set(r * k, r * k, r * k * 2);
        t.rotation.x = Math.PI / 2;
        t.position.set(0, y + (1 - k) * 1.2, z);
        scene.add(t);
      }
      scene.add(pb.kotak(0.015, ATAP - y, 0.015, pb.polos(0x1a1a1f), 0, (ATAP + y) / 2, z));
    }
  }

  /* ---------------- layar LED raksasa di ujung aula ---------------- */
  const ledBahan = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform float uT; varying vec2 vUv;
      void main(){
        vec2 p = vUv * vec2(1.9, 1.0);
        float t = uT * 0.06;
        float n = sin(p.x * 3.0 + t * 2.0 + sin(p.y * 4.0 - t)) * 0.5 + 0.5;
        float m = sin(p.y * 5.0 - t * 3.0 + sin(p.x * 2.0 + t)) * 0.5 + 0.5;
        vec3 col = mix(vec3(0.05, 0.06, 0.2), vec3(0.45, 0.52, 0.95), n * 0.75);
        col = mix(col, vec3(0.91, 0.38, 0.54), smoothstep(0.55, 1.0, m) * 0.55);
        vec2 g = floor(vUv * vec2(170.0, 90.0));
        float h = fract(sin(dot(g, vec2(12.9898, 78.233))) * 43758.5453);
        col += step(0.993, h) * (0.6 + 0.4 * sin(uT * 2.0 + h * 50.0));
        float pinggir = smoothstep(0.0, 0.015, vUv.x) * smoothstep(0.0, 0.015, 1.0 - vUv.x) * smoothstep(0.0, 0.03, vUv.y) * smoothstep(0.0, 0.03, 1.0 - vUv.y);
        gl_FragColor = vec4(col * 0.8 * pinggir, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  pb.sampah.push(ledBahan);
  {
    const led = new THREE.Mesh(new THREE.PlaneGeometry(15, 8), ledBahan);
    pb.sampah.push(led.geometry);
    led.position.set(0, 7, 11 - PANJANG + 0.7);
    scene.add(led, pb.kotak(15.6, 8.6, 0.3, pb.polos(0x15151a, 0.6), 0, 7, 11 - PANJANG + 0.5));
  }

  /* ---------------- meja, lampu baca, kursi ---------------- */
  const KAYU_MEJA = pb.polos(0xa8743f, 0.55);
  const KAYU_KURSI = pb.polos(0x5a3a22, 0.7);
  const KUNINGAN = pb.polos(0xc9a25a, 0.35, 0.7);
  const meja = (z: number, panjang = 9) => {
    scene.add(pb.kotak(panjang, 0.06, 1.1, KAYU_MEJA, 0, 0.72, z));
    for (const s of [-1, 1]) scene.add(pb.kotak(0.08, 0.7, 0.9, KAYU_MEJA, s * (panjang / 2 - 0.45), 0.35, z));
    for (const x of [-3.375, -1.125, 1.125, 3.375]) {
      if (Math.abs(x) > panjang / 2) continue;
      scene.add(pb.kotak(0.14, 0.025, 0.14, KUNINGAN, x, 0.765, z));
      scene.add(pb.kotak(0.02, 0.34, 0.02, KUNINGAN, x, 0.94, z));
      const kap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.13, 0.12, 14, 1, true), KUNINGAN);
      pb.sampah.push(kap.geometry);
      kap.position.set(x, 1.12, z);
      const bohlam = new THREE.Mesh(bolaGeo, pb.nyala(0xffd9a0, 4));
      bohlam.scale.setScalar(0.045);
      bohlam.position.set(x, 1.08, z);
      scene.add(kap, bohlam);
    }
  };
  const kursi = (x: number, zDuduk: number, sisi: 1 | -1) => {
    const g = new THREE.Group();
    g.position.set(x, 0, zDuduk);
    g.add(pb.kotak(0.42, 0.05, 0.42, KAYU_KURSI, 0, 0.43, 0));
    g.add(pb.kotak(0.42, 0.48, 0.04, KAYU_KURSI, 0, 0.7, sisi * 0.2));
    for (const a of [-0.18, 0.18]) for (const b of [-0.18, 0.18]) g.add(pb.kotak(0.035, 0.43, 0.035, KAYU_KURSI, a, 0.215, b));
    scene.add(g);
  };

  const avatar: Avatar[] = [];
  /** sisi -1 = seberang meja (menghadap +z), +1 = sisi dekat (menghadap -z). */
  const duduk = (opsi: OpsiAvatar, x: number, zMeja: number, sisi: 1 | -1) => {
    const zDuduk = zMeja + sisi * 0.88;
    kursi(x, zDuduk, sisi === -1 ? -1 : 1);
    const a = buatAvatar(pb, opsi);
    a.grup.position.set(x, 0.45 + (opsi.bantal ?? 0), zDuduk);
    if (opsi.bantal) scene.add(pb.kotak(0.4, opsi.bantal, 0.4, pb.polos(0xe8628a, 0.85), x, 0.455 + opsi.bantal / 2, zDuduk));
    a.grup.rotation.y = sisi === -1 ? 0 : Math.PI;
    scene.add(a.grup);
    avatar.push(a);
  };

  /* Meja kita: si kucing tepat di seberang. */
  meja(MEJA_KITA_Z);
  duduk({ jenis: 'kucing', kegiatan: 'laptop', seed: 1, skala: 0.05, bantal: 0.08 }, 0, MEJA_KITA_Z, -1);
  duduk({ jenis: 'manusia', kegiatan: 'baca', baju: 0xc9b48a, rambut: 0x1b1410, aksesori: 'kacamata', mug: 0xe8628a, seed: 2 }, -1.6, MEJA_KITA_Z, -1);
  duduk({ jenis: 'kelinci', kegiatan: 'laptop', baju: 0x8297f0, seed: 3 }, 1.6, MEJA_KITA_Z, -1);
  duduk({ jenis: 'penguin', kegiatan: 'baca', seed: 4, mug: 0xf2efe8 }, 3.2, MEJA_KITA_Z, -1);
  duduk({ jenis: 'beruang', kegiatan: 'tulis', baju: 0x3d5c3a, seed: 5 }, -3.2, MEJA_KITA_Z, -1);
  duduk({ jenis: 'rubah', kegiatan: 'tulis', baju: 0x2f3550, seed: 6 }, -1.6, MEJA_KITA_Z, 1);
  duduk({ jenis: 'manusia', kegiatan: 'laptop', baju: 0x6e2a3f, rambut: 0x3a2618, kulit: 0xd9a77e, aksesori: 'headphone', warnaAksesori: 0xeef0fb, seed: 7 }, 1.6, MEJA_KITA_Z, 1);
  kursi(0, MEJA_KITA_Z + 0.88, 1);

  /* Meja-meja lain. */
  meja(-7.5);
  duduk({ jenis: 'robot', kegiatan: 'laptop', seed: 11 }, -2.4, -7.5, -1);
  duduk({ jenis: 'manusia', kegiatan: 'baca', baju: 0x2f4a6d, rambut: 0x6b4226, aksesori: 'kupluk', warnaAksesori: 0xb5832f, seed: 12 }, 0.8, -7.5, -1);
  duduk({ jenis: 'beruang', kegiatan: 'tidur', baju: 0x7a2e2e, seed: 13 }, 3.2, -7.5, -1);
  duduk({ jenis: 'manusia', kegiatan: 'tulis', baju: 0xe8e0cf, rambut: 0x111111, kulit: 0xe8b993, seed: 14 }, -0.8, -7.5, 1);
  duduk({ jenis: 'kelinci', kegiatan: 'baca', baju: 0x5b3a5e, seed: 15, mug: 0x8297f0 }, 2.4, -7.5, 1);

  meja(-14);
  duduk({ jenis: 'manusia', kegiatan: 'laptop', baju: 0x3d5c3a, rambut: 0x2b1d14, aksesori: 'kacamata', warnaAksesori: 0xc9a25a, seed: 21 }, -1.6, -14, -1);
  duduk({ jenis: 'penguin', kegiatan: 'tulis', seed: 22 }, 1.6, -14, -1);
  duduk({ jenis: 'rubah', kegiatan: 'baca', baju: 0xc9b48a, seed: 23 }, 0, -14, 1);

  meja(6);
  duduk({ jenis: 'manusia', kegiatan: 'baca', baju: 0x8a5a2b, rambut: 0x1b1410, seed: 31 }, -1.6, 6, -1);
  duduk({ jenis: 'robot', kegiatan: 'tulis', seed: 32 }, 1.6, 6, 1);
  duduk({ jenis: 'manusia', kegiatan: 'laptop', baju: 0x1f2c3f, rambut: 0x9e4a3a, aksesori: 'headphone', warnaAksesori: 0xe8628a, seed: 33 }, 0, 6, -1);

  /* Barang di meja kita: buku catatan, pena, mug berasap, tumpukan buku. */
  {
    const catatan = pb.kotak(0.24, 0.012, 0.32, pb.polos(0xeee6d2, 0.9), 0.02, 0.756, -0.62);
    catatan.rotation.y = 0.08;
    const pena = pb.kotak(0.012, 0.012, 0.15, pb.polos(0x1f2c3f, 0.4), 0.17, 0.77, -0.6);
    pena.rotation.y = -0.4;
    scene.add(catatan, pena);
    const mug = new THREE.Group();
    mug.position.set(0.56, 0.75, -0.78);
    mug.add(pb.kotak(0.085, 0.1, 0.085, pb.polos(0xe8628a, 0.5), 0, 0.05, 0), pb.kotak(0.025, 0.05, 0.02, pb.polos(0xe8628a, 0.5), 0.055, 0.055, 0));
    mug.add(pb.kotak(0.07, 0.005, 0.07, pb.polos(0x3b2414, 0.3), 0, 0.093, 0));
    scene.add(mug);
    let y = 0.75;
    for (const [w, h, d, warna, r] of [[0.2, 0.035, 0.28, 0x2f4a6d, 0.1], [0.19, 0.03, 0.26, 0x7a2e2e, -0.06], [0.17, 0.028, 0.24, 0xc9b48a, 0.2]] as const) {
      const b = pb.kotak(w, h, d, pb.polos(warna, 0.7), -0.62, y + h / 2, -0.8);
      b.rotation.y = r;
      scene.add(b);
      y += h;
    }
  }
  const asap: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    const m = pb.kotak(0.008, 0.008, 0.008, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, depthWrite: false }));
    pb.sampah.push(m.material as THREE.Material);
    scene.add(m);
    asap.push(m);
  }

  /* Tanaman pot di pojok-pojok meja. */
  for (const [x, z] of [[-6, -0.8], [6, -7.4], [-6, -13.8], [6, 6]]) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.add(pb.kotak(0.5, 0.55, 0.5, pb.polos(0x3a2f2a, 0.8), 0, 0.275, 0));
    const daun: [number, number, number][] = [];
    for (let i = 0; i < 26; i++) daun.push([(acak() - 0.5) * 6, 6 + acak() * 9, (acak() - 0.5) * 6]);
    const v = pb.voxel(daun, (_, i) => (i % 3 ? 0x3f6b3a : 0x4f8a45), 0.06);
    v.scale.setScalar(0.1);
    g.add(v);
    scene.add(g);
  }

  /* Satu teman yang berjalan menyusuri rak, sesekali berhenti melihat buku. */
  const pejalan = buatAvatar(pb, { jenis: 'manusia', kegiatan: 'jalan', baju: 0xe8628a, rambut: 0x2b1d14, celana: 0x2c3247, seed: 41 });
  pejalan.grup.position.set(7.4, 0.45, -4);
  scene.add(pejalan.grup);
  avatar.push(pejalan);
  let jalanTujuan = -18;
  let jalanBerhenti = 0;

  const mata = new THREE.Vector3(0, 1.17, 0.1);

  return {
    scene,
    mata,
    update(t, dt, fokus) {
      ledBahan.uniforms.uT.value = t;
      sinarLaptop.intensity = fokus ? 0.75 + Math.sin(t * 17) * 0.08 : 0.5;
      avatar.forEach(a => a.update(t, dt, fokus));

      /* Pejalan: maju ke tujuan, berhenti menghadap rak, lalu tujuan baru. */
      const g = pejalan.grup;
      if (t < jalanBerhenti) {
        pejalan.melangkah = false;
        g.rotation.y = halusSudut(g.rotation.y, Math.PI / 2, 0.06);
      } else {
        const sisa = jalanTujuan - g.position.z;
        if (Math.abs(sisa) < 0.05) {
          jalanBerhenti = t + 3 + Math.random() * 4;
          jalanTujuan = -24 + Math.random() * 30;
        } else {
          pejalan.melangkah = true;
          g.position.z += Math.sign(sisa) * Math.min(Math.abs(sisa), 0.9 * dt);
          g.rotation.y = halusSudut(g.rotation.y, sisa > 0 ? 0 : Math.PI, 0.1);
        }
      }

      asap.forEach((m, i) => {
        const u = (t * 0.25 + i / asap.length) % 1;
        m.position.set(0.56 + Math.sin(u * 7 + i) * 0.015, 0.86 + u * 0.18, -0.78 + Math.cos(u * 5 + i) * 0.01);
        (m.material as THREE.MeshBasicMaterial).opacity = 0.32 * (1 - u);
        m.scale.setScalar(1 + u * 2.5);
      });
    },
    dispose() {
      pb.sampah.forEach(s => s.dispose());
      scene.traverse(o => {
        if (o instanceof THREE.InstancedMesh) o.dispose();
      });
    },
  };
}

function halusSudut(a: number, b: number, k: number) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * k;
}
