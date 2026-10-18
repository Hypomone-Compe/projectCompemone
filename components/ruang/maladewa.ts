/* ==========================================================================
   Pantai Maladewa pada malam hari: "lautan bintang" (bioluminesensi).

   Kita duduk di meja kayu di atas pasir, beberapa meter dari bibir pantai,
   di bawah untaian lampu yang digantung di antara pohon kelapa. Di depan:
   ombak tenang yang menyala biru neon saat pecah, pasir basah berkilau tiap
   kali air menyapu, plankton berkelip di air dangkal. Langit malam dengan
   Bima Sakti dan bulan sabit; bungalo di atas air dengan jendela hangat.

   Satuan = meter. Kamera menghadap -z (ke laut).
   ========================================================================== */
import * as THREE from 'three';
import type { Adegan, Kualitas } from './adegan';
import { buatAvatar, type Avatar, type OpsiAvatar } from './avatar';
import { acakBenih, buatPabrik } from './voxel';

const MEJA_Z = -0.85;
const ARAH_BULAN = new THREE.Vector3(-0.42, 0.3, -1).normalize();

/** Garis pantai: z bibir air pada posisi x. */
const BIBIR = 'float bibir(float x){ return -7.0 + sin(x * 0.05) * 1.5 + sin(x * 0.013 + 1.7) * 2.0; }';
const bibirJs = (x: number) => -7 + Math.sin(x * 0.05) * 1.5 + Math.sin(x * 0.013 + 1.7) * 2;

/* Gelombang bersama air & pasir basah (harus sama persis supaya sapuan air pas dengan ombak). */
const GELOMBANG = `
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  /* Fase ombak menuju pantai; satu ombak tiap ~7 detik. */
  float faseOmbak(float d, float t){ return d * 0.045 + t * 0.14; }
`;

export function bangunMaladewa(kualitas: Kualitas): Adegan {
  const rendah = kualitas === 'rendah';
  const pb = buatPabrik();
  const acak = acakBenih(1601);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x03060f);
  scene.fog = new THREE.FogExp2(0x060b1c, 0.0028);
  const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const waktu = { value: 0 };

  /* ---------------- cahaya malam ---------------- */
  scene.add(new THREE.HemisphereLight(0x2a3f78, 0x0d0a14, 0.75));
  const bulan = new THREE.DirectionalLight(0xa9c0ff, 0.65);
  bulan.position.copy(ARAH_BULAN).multiplyScalar(100);
  scene.add(bulan);
  const lilin: THREE.PointLight[] = [];
  for (const [x, z] of [[-0.55, MEJA_Z - 0.15], [0.6, MEJA_Z - 0.2]]) {
    const l = new THREE.PointLight(0xffb468, 0.9, 3.2, 1.6);
    l.position.set(x, 0.95, z);
    scene.add(l);
    lilin.push(l);
  }
  /* Pantulan biru plankton di pasir & di tubuh teman-teman, berdenyut mengikuti ombak. */
  const sinarBiru: THREE.PointLight[] = [];
  for (const x of [-6, 0, 6]) {
    const l = new THREE.PointLight(0x2ad4ff, 0, 9, 1.6);
    l.position.set(x, 0.4, bibirJs(x) + 0.5);
    scene.add(l);
    sinarBiru.push(l);
  }

  /* ---------------- langit, Bima Sakti, bintang, bulan ---------------- */
  {
    const geo = new THREE.SphereGeometry(800, 48, 24);
    const bahan = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `varying vec3 vP;
        float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
        float noise(vec3 p){
          vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
          float a = mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y);
          float b = mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y);
          return mix(a, b, f.z);
        }
        void main(){
          float h = clamp(vP.y, -0.1, 1.0);
          vec3 c = mix(vec3(0.03, 0.05, 0.12), vec3(0.006, 0.01, 0.03), pow(max(h, 0.0), 0.5));
          /* Bima Sakti: pita melintang miring dengan tekstur awan debu. */
          vec3 nPita = normalize(vec3(0.55, 0.35, 0.76));
          float jarak = abs(dot(vP, nPita));
          float pita = exp(-jarak * jarak / 0.018);
          float awan = noise(vP * 9.0) * 0.6 + noise(vP * 23.0) * 0.4;
          float debu = smoothstep(0.35, 0.75, noise(vP * 14.0 + 3.0));
          c += pita * (vec3(0.16, 0.13, 0.26) * awan + vec3(0.1, 0.12, 0.2) * awan * awan) * (1.0 - debu * 0.7) * smoothstep(-0.05, 0.25, vP.y);
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`,
    });
    pb.sampah.push(geo, bahan);
    scene.add(new THREE.Mesh(geo, bahan));

    const n = rendah ? 1800 : 4200;
    const pos = new Float32Array(n * 3);
    const warna = new Float32Array(n * 3);
    const c = new THREE.Color();
    const r = acakBenih(99);
    for (let i = 0; i < n; i++) {
      /* Lebih rapat di sekitar Bima Sakti. */
      let d = new THREE.Vector3(r() * 2 - 1, r() * 0.95 + 0.04, r() * 2 - 1).normalize();
      if (i % 3 === 0) {
        const nP = new THREE.Vector3(0.55, 0.35, 0.76).normalize();
        d = d.sub(nP.clone().multiplyScalar(d.dot(nP) * (0.85 + r() * 0.15))).normalize();
        if (d.y < 0.03) d.y = Math.abs(d.y) + 0.03;
      }
      pos.set([d.x * 700, d.y * 700, d.z * 700], i * 3);
      c.setHSL(0.58 + r() * 0.1, 0.4, 0.75 + r() * 0.25).multiplyScalar(0.6 + r() * 1.2);
      warna.set([c.r, c.g, c.b], i * 3);
    }
    const geoB = new THREE.BufferGeometry();
    geoB.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geoB.setAttribute('color', new THREE.BufferAttribute(warna, 3));
    const bahanB = new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, fog: false, transparent: true, depthWrite: false });
    pb.sampah.push(geoB, bahanB);
    scene.add(new THREE.Points(geoB, bahanB));

    /* Bulan sabit: piringan terang yang sebagian ditutup piringan gelap. */
    const p = ARAH_BULAN.clone().multiplyScalar(650);
    const bulanG = new THREE.Group();
    bulanG.position.copy(p);
    bulanG.lookAt(0, 0, 0);
    const piring = new THREE.CircleGeometry(14, 40);
    pb.sampah.push(piring);
    const terang = new THREE.Mesh(piring, pb.nyala(0xf3f0e2, 2.2, { fog: false }));
    const gelap = new THREE.Mesh(piring, new THREE.MeshBasicMaterial({ color: 0x050914, fog: false }));
    pb.sampah.push(gelap.material as THREE.Material);
    gelap.position.set(-5, 2.5, 0.5);
    bulanG.add(terang, gelap);
    scene.add(bulanG);
  }

  /* ---------------- laut bercahaya ---------------- */
  const laut = new THREE.ShaderMaterial({
    uniforms: { uT: waktu, uBulan: { value: ARAH_BULAN } },
    vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform float uT; uniform vec3 uBulan; varying vec3 vW;
      ${BIBIR}
      ${GELOMBANG}
      void main(){
        float d = bibir(vW.x) - vW.z; /* jarak ke pantai (m), > 0 di laut */
        vec3 v = normalize(vW - cameraPosition);
        float ph = faseOmbak(d, uT);
        vec2 q = vW.xz;
        vec3 n = normalize(vec3(
          sin(q.x * 0.21 + uT * 0.7) * 0.03 + sin(q.x * 0.9 + q.y * 0.6 + uT * 1.3) * 0.012,
          1.0,
          sin(ph * 6.2831) * 0.05 * smoothstep(60.0, 5.0, d) + cos(q.y * 0.35 - uT * 0.8) * 0.025));
        vec3 r = reflect(v, n);
        float s = max(dot(r, uBulan), 0.0);
        vec3 langit = mix(vec3(0.035, 0.05, 0.11), vec3(0.008, 0.012, 0.03), clamp(r.y * 2.0, 0.0, 1.0));
        float fres = pow(1.0 - max(dot(-v, n), 0.0), 3.0);
        vec3 c = vec3(0.002, 0.006, 0.016) + langit * (0.35 + fres * 0.9);
        c += vec3(0.75, 0.82, 1.0) * (pow(s, 600.0) * 2.5 + pow(s, 60.0) * 0.12);

        /* Bioluminesensi: puncak ombak menyala saat pecah mendekati pantai. */
        float puncak = pow(0.5 + 0.5 * sin(ph * 6.2831), 14.0);
        float pecah = smoothstep(26.0, 3.0, d) * smoothstep(-0.2, 1.2, d);
        float acak = 0.45 + 0.75 * noise(vec2(vW.x * 0.25 + uT * 0.15, d * 0.4 - uT * 0.2));
        vec3 biru = vec3(0.03, 0.42, 1.0);
        c += biru * puncak * pecah * acak * 0.95;
        /* Kilau plankton di air dangkal. */
        vec2 sel = floor(vW.xz * 2.2);
        float h = hash(sel);
        float kelip = step(0.965, h) * pow(0.5 + 0.5 * sin(uT * (1.5 + h * 4.0) + h * 40.0), 6.0);
        c += biru * kelip * smoothstep(30.0, 1.0, d) * 1.1;
        /* Lapisan cahaya tipis di bibir air. */
        c += biru * smoothstep(1.2, 0.0, d) * (0.05 + 0.35 * pow(0.5 + 0.5 * sin(ph * 6.2831 + 0.8), 6.0));
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  pb.sampah.push(laut);
  {
    const geo = new THREE.PlaneGeometry(1600, 900);
    pb.sampah.push(geo);
    const m = new THREE.Mesh(geo, laut);
    m.rotation.x = -Math.PI / 2;
    m.position.set(0, -0.03, -455);
    scene.add(m);
  }

  /* ---------------- pasir ---------------- */
  {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const g = c.getContext('2d')!;
    g.fillStyle = '#d8ccae';
    g.fillRect(0, 0, 256, 256);
    const r = acakBenih(3);
    for (let i = 0; i < 9000; i++) {
      const l = 62 + r() * 24;
      g.fillStyle = `hsl(42, 22%, ${l}%)`;
      g.fillRect(r() * 256, r() * 256, 1 + r() * 1.5, 1 + r() * 1.5);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(60, 30);
    pb.sampah.push(tex);
    const geo = new THREE.PlaneGeometry(240, 80, 160, 60);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i) + 30;
      pos.setZ(i, z);
      const zs = bibirJs(x);
      /* Landai turun ke air, gumuk halus di belakang. */
      const y = z < zs ? (z - zs) * 0.08 : Math.min(0.25, (z - zs) * 0.035) + Math.sin(x * 0.15) * Math.sin(z * 0.2) * 0.12 * Math.min(1, Math.max(0, (z - zs - 6) / 10));
      pos.setY(i, y);
    }
    geo.computeVertexNormals();
    const bahan = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 });
    pb.sampah.push(geo, bahan);
    scene.add(new THREE.Mesh(geo, bahan));

    /* Pasir basah: sapuan air yang naik-turun, berkilau biru. */
    const basah = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uT: waktu },
      vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `uniform float uT; varying vec3 vW;
        ${BIBIR}
        ${GELOMBANG}
        void main(){
          float naik = vW.z - bibir(vW.x); /* meter di atas bibir air */
          if (naik < 0.0) discard;
          /* Jangkauan sapuan mengikuti kedatangan ombak di d = 0. */
          float ph = fract(faseOmbak(0.0, uT));
          float jangkau = 2.6 * pow(max(sin(ph * 6.2831 + 1.2), 0.0), 1.5) * (0.8 + 0.4 * noise(vec2(vW.x * 0.2, floor(uT * 0.143))));
          float tepi = smoothstep(jangkau + 0.08, jangkau - 0.25, naik);
          float garis = smoothstep(0.35, 0.0, abs(naik - jangkau));
          vec2 sel = floor(vW.xz * 6.0);
          float h = hash(sel);
          float kelip = step(0.93, h) * (0.5 + 0.5 * sin(uT * (2.0 + h * 5.0) + h * 30.0));
          float sisa = smoothstep(3.2, 0.0, naik) * step(0.985, h) * 0.6;
          vec3 c = vec3(0.03, 0.42, 1.0) * (garis * 0.45 + tepi * 0.04 + kelip * tepi * 0.9 + sisa * 0.6);
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`,
    });
    pb.sampah.push(basah);
    const geoB = new THREE.PlaneGeometry(240, 5, 1, 1);
    pb.sampah.push(geoB);
    const mB = new THREE.Mesh(geoB, basah);
    mB.rotation.x = -Math.PI / 2;
    mB.position.set(0, 0.012, -6.5);
    /* Ikuti kemiringan pasir agar tidak tenggelam: dorong sedikit ke atas. */
    mB.position.y = 0.03;
    scene.add(mB);
  }

  /* ---------------- pohon kelapa ---------------- */
  const BATANG = pb.polos(0x3a2c20, 0.9);
  const DAUN = pb.polos(0x1d3a26, 0.85);
  const kelapa = (x: number, z: number, tinggi: number, condong: number, arah: number) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = arah;
    const seg = 10;
    let px = 0;
    let py = 0;
    const segGeo = new THREE.CylinderGeometry(0.13, 0.17, tinggi / seg + 0.05, 7);
    pb.sampah.push(segGeo);
    for (let i = 0; i < seg; i++) {
      const t = i / seg;
      const nx = condong * t * t * tinggi * 0.35;
      const ny = (i + 0.5) * (tinggi / seg);
      const m = new THREE.Mesh(segGeo, BATANG);
      m.position.set((px + nx) / 2, ny, 0);
      m.rotation.z = -Math.atan2(nx - px, tinggi / seg) * 0.9;
      m.scale.setScalar(1 - t * 0.35);
      g.add(m);
      px = nx;
      py = ny;
    }
    const puncak = new THREE.Group();
    puncak.position.set(px, py + 0.2, 0);
    for (let k = 0; k < 9; k++) {
      const daun = new THREE.Group();
      daun.rotation.y = (k / 9) * Math.PI * 2 + acak() * 0.3;
      let dx = 0;
      let dy = 0;
      for (let j = 0; j < 7; j++) {
        const a = 0.25 - j * 0.18;
        const panjang = 0.42;
        const m = pb.kotak(panjang, 0.03, 0.42 - j * 0.045, DAUN, dx + panjang / 2, dy, 0);
        m.rotation.z = a;
        daun.add(m);
        dx += Math.cos(a) * panjang;
        dy += Math.sin(a) * panjang;
      }
      puncak.add(daun);
    }
    for (let k = 0; k < 4; k++) puncak.add(pb.kotak(0.18, 0.18, 0.18, pb.polos(0x2a2a18, 0.8), Math.cos(k * 1.6) * 0.15, -0.15, Math.sin(k * 1.6) * 0.15));
    g.add(puncak);
    scene.add(g);
    g.updateMatrixWorld(true);
    return puncak.getWorldPosition(new THREE.Vector3());
  };
  /* Dua kelapa membingkai pandangan ke laut, condong ke arah air. */
  const pucukKiri = kelapa(-3.3, -4.3, 6.4, 1.0, Math.PI * 0.82);
  const pucukKanan = kelapa(3.5, -4.1, 7, 0.9, Math.PI * 0.12);
  for (const [x, z, t, c, a] of [[-9, 4, 8, 0.9, 2.6], [-14, -1, 7, 1.2, 0.4], [10, 3.5, 7.5, 1.1, -0.6], [16, -2, 8.5, 0.9, 0.2], [-22, 2, 9, 0.7, 1], [24, 5, 7, 1, -1.2], [-30, 8, 8, 0.8, 2]] as [number, number, number, number, number][])
    kelapa(x, z, t, c, a);

  /* Untaian lampu di antara dua kelapa, melengkung di atas meja. */
  const bohlam: THREE.Mesh[] = [];
  {
    const a = v3(pucukKiri.x, Math.min(pucukKiri.y - 0.6, 4.6), pucukKiri.z);
    const b = v3(pucukKanan.x, Math.min(pucukKanan.y - 0.6, 4.8), pucukKanan.z);
    const bolaGeo = new THREE.SphereGeometry(0.06, 10, 8);
    pb.sampah.push(bolaGeo);
    const titik: THREE.Vector3[] = [];
    const n = 16;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const p = a.clone().lerp(b, t);
      p.y -= Math.sin(t * Math.PI) * 1.4;
      titik.push(p);
      if (i > 0 && i < n) {
        const m = new THREE.Mesh(bolaGeo, pb.nyala(i % 3 === 0 ? 0xffd9a0 : 0xffc27a, 2.8));
        m.position.copy(p).add(v3(0, -0.08, 0));
        scene.add(m);
        bohlam.push(m);
      }
    }
    const tali = new THREE.BufferGeometry().setFromPoints(titik);
    const bahanTali = new THREE.LineBasicMaterial({ color: 0x111111 });
    pb.sampah.push(tali, bahanTali);
    scene.add(new THREE.Line(tali, bahanTali));
  }

  /* ---------------- bungalo di atas air ---------------- */
  {
    const KAYU = pb.polos(0x5e4430, 0.85);
    const ATAP = pb.polos(0x7d6240, 0.95);
    const atapGeo = new THREE.ConeGeometry(4.6, 2.6, 4);
    pb.sampah.push(atapGeo);
    const tiang: { p: THREE.Vector3; s: THREE.Vector3 }[] = [];
    /* Jembatan papan dari pantai ke deretan vila. */
    const jx = 30;
    scene.add(pb.kotak(2, 0.12, 64, KAYU, jx, 1.3, bibirJs(jx) - 31));
    for (let z = bibirJs(jx) - 2; z > bibirJs(jx) - 62; z -= 4) tiang.push({ p: v3(jx, 0.6, z), s: v3(0.18, 1.6, 0.18) });
    const zv = bibirJs(jx) - 64;
    scene.add(pb.kotak(70, 0.12, 2, KAYU, jx + 34, 1.3, zv));
    const pantulan = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uT: waktu },
      vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `uniform float uT; varying vec2 vU;
        void main(){
          float riak = 0.6 + 0.4 * sin(vU.y * 60.0 + uT * 2.0) * sin(vU.y * 23.0 - uT * 1.3);
          float a = pow(vU.y, 1.6) * smoothstep(0.0, 0.35, vU.x) * smoothstep(1.0, 0.65, vU.x) * riak;
          gl_FragColor = vec4(vec3(1.0, 0.62, 0.3) * a * 0.55, 1.0);
          #include <colorspace_fragment>
        }`,
    });
    const pantulGeo = new THREE.PlaneGeometry(1.6, 14);
    pb.sampah.push(pantulan, pantulGeo);
    for (let i = 0; i < 7; i++) {
      const x = jx + 6 + i * 10;
      const z = zv - 6 - (i % 2) * 2;
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.add(pb.kotak(7, 0.15, 7, KAYU, 0, 1.3, 0));
      g.add(pb.kotak(5.4, 2.6, 4.6, pb.polos(0x8a6a4c, 0.8), 0, 2.7, 0));
      const atap = new THREE.Mesh(atapGeo, ATAP);
      atap.rotation.y = Math.PI / 4;
      atap.position.y = 5.2;
      g.add(atap);
      g.add(pb.kotak(1.3, 1.1, 0.06, pb.nyala(0xffb870, 1.8), -1.2, 2.8, 2.33), pb.kotak(1.3, 1.1, 0.06, pb.nyala(0xffb870, 1.5), 1.2, 2.8, 2.33));
      for (const a of [-3, 3]) for (const b of [-3, 3]) tiang.push({ p: v3(x + a, 0.6, z + b), s: v3(0.22, 1.6, 0.22) });
      for (const dx of [-1.2, 1.2]) {
        const p = new THREE.Mesh(pantulGeo, pantulan);
        p.rotation.x = -Math.PI / 2;
        p.position.set(x + dx, 0.02, z + 2.4 + 7);
        scene.add(p);
      }
      scene.add(g);
    }
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), KAYU, tiang.length);
    pb.sampah.push(im.geometry);
    const o = new THREE.Object3D();
    tiang.forEach((t, i) => {
      o.position.copy(t.p);
      o.scale.copy(t.s);
      o.updateMatrix();
      im.setMatrixAt(i, o.matrix);
    });
    scene.add(im);
  }

  /* ---------------- meja kita, kursi, lilin ---------------- */
  const KAYU_MEJA = pb.polos(0x8b6a4a, 0.75);
  const KAYU_KURSI = pb.polos(0x5a3a22, 0.8);
  scene.add(pb.kotak(2.8, 0.06, 1.1, KAYU_MEJA, 0, 0.72, MEJA_Z));
  for (const s of [-1, 1]) scene.add(pb.kotak(0.08, 0.7, 0.9, KAYU_MEJA, s * 1.2, 0.35, MEJA_Z));
  const kursi = (x: number, z: number, sisi: 1 | -1) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.add(pb.kotak(0.42, 0.05, 0.42, KAYU_KURSI, 0, 0.43, 0));
    g.add(pb.kotak(0.42, 0.48, 0.04, KAYU_KURSI, 0, 0.7, sisi * 0.2));
    for (const a of [-0.18, 0.18]) for (const b of [-0.18, 0.18]) g.add(pb.kotak(0.035, 0.43, 0.035, KAYU_KURSI, a, 0.215, b));
    scene.add(g);
  };

  const avatar: Avatar[] = [];
  const duduk = (opsi: OpsiAvatar, x: number, sisi: 1 | -1) => {
    const z = MEJA_Z + sisi * 0.88;
    kursi(x, z, sisi);
    const a = buatAvatar(pb, opsi);
    a.grup.position.set(x, 0.45 + (opsi.bantal ?? 0), z);
    a.grup.rotation.y = sisi === -1 ? 0 : Math.PI;
    if (opsi.bantal) scene.add(pb.kotak(0.4, opsi.bantal, 0.4, pb.polos(0xe8628a, 0.85), x, 0.455 + opsi.bantal / 2, z));
    scene.add(a.grup);
    avatar.push(a);
  };
  duduk({ jenis: 'kucing', kegiatan: 'laptop', seed: 1, skala: 0.05, bantal: 0.08 }, 0, -1);
  duduk({ jenis: 'manusia', kegiatan: 'baca', baju: 0x2fa8a0, rambut: 0x2b1d14, kulit: 0xc98c62, seed: 71, mug: 0xf2c46b }, -1.15, 1);
  duduk({ jenis: 'kelinci', kegiatan: 'tulis', baju: 0xe8628a, seed: 72 }, 1.15, 1);

  /* Barang di meja: lilin dalam toples kaca, buku catatan, kelapa muda bersedotan. */
  const api: THREE.Mesh[] = [];
  {
    const y = 0.75;
    for (const [x, z] of [[-0.55, MEJA_Z - 0.15], [0.6, MEJA_Z - 0.2]]) {
      const toples = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.13, 14),
        new THREE.MeshStandardMaterial({ color: 0x6f8aa8, transparent: true, opacity: 0.1, roughness: 0.2, depthWrite: false }),
      );
      pb.sampah.push(toples.geometry, toples.material as THREE.Material);
      toples.position.set(x, y + 0.065, z);
      const nyala = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), pb.nyala(0xffc070, 3));
      pb.sampah.push(nyala.geometry);
      nyala.position.set(x, y + 0.06, z);
      scene.add(toples, nyala, pb.kotak(0.05, 0.04, 0.05, pb.polos(0xf2ece0, 0.6), x, y + 0.02, z));
      api.push(nyala);
    }
    const catatan = pb.kotak(0.22, 0.012, 0.3, pb.polos(0xeee6d2, 0.9), 0.02, y + 0.006, -0.6);
    catatan.rotation.y = 0.08;
    scene.add(catatan);
    const kelapaMuda = new THREE.Group();
    kelapaMuda.position.set(0.38, y, -0.95);
    const bola = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), pb.polos(0x5f8a38, 0.7));
    pb.sampah.push(bola.geometry);
    bola.position.y = 0.07;
    bola.scale.y = 1.1;
    const sedotan = pb.kotak(0.007, 0.13, 0.007, pb.polos(0xe8628a, 0.5), 0.015, 0.16, 0);
    sedotan.rotation.z = -0.25;
    kelapaMuda.add(bola, sedotan);
    scene.add(kelapaMuda);
  }

  /* Dua teman berdiri di bibir pantai menatap ombak bercahaya. */
  for (const [x, ry, opsi] of [
    [-2.4, Math.PI + 0.25, { jenis: 'penguin', kegiatan: 'jalan', seed: 81 }],
    [4.6, Math.PI - 0.3, { jenis: 'manusia', kegiatan: 'jalan', baju: 0xf2efe8, rambut: 0x1b1410, kulit: 0xe8b993, celana: 0x3a4a6b, seed: 82 }],
  ] as [number, number, OpsiAvatar][]) {
    const z = bibirJs(x) + 1.6;
    const a = buatAvatar(pb, opsi);
    a.grup.position.set(x, 0.45 + Math.min(0.25, 1.6 * 0.035), z);
    a.grup.rotation.y = ry;
    scene.add(a.grup);
    avatar.push(a);
  }

  const mata = new THREE.Vector3(0, 1.17, 0.1);

  return {
    scene,
    mata,
    teman: avatar.length,
    paparan: 1.05,
    pitchAwal: -0.06,
    update(t, dt, fokus) {
      waktu.value = t;
      avatar.forEach(a => a.update(t, dt, fokus));
      /* Denyut biru mengikuti ombak yang pecah (fase sama dengan shader di d ≈ 3 m). */
      const puncak = Math.pow(0.5 + 0.5 * Math.sin((3 * 0.045 + t * 0.14) * Math.PI * 2), 8);
      sinarBiru.forEach((l, i) => (l.intensity = 0.15 + puncak * (0.7 + Math.sin(t * 0.7 + i) * 0.2)));
      lilin.forEach((l, i) => (l.intensity = 0.85 + Math.sin(t * 9 + i * 2) * 0.06 + Math.sin(t * 17 + i) * 0.05));
      api.forEach((a, i) => a.scale.setScalar(1 + Math.sin(t * 11 + i * 3) * 0.12));
      bohlam.forEach((b, i) => b.scale.setScalar(0.92 + Math.sin(t * 0.8 + i * 0.7) * 0.08));
    },
    dispose() {
      pb.sampah.forEach(s => s.dispose());
      scene.traverse(o => {
        if (o instanceof THREE.InstancedMesh) o.dispose();
      });
    },
  };
}
