/* ==========================================================================
   Ranu Kumbolo, 2.400 mdpl, jalur pendakian Semeru. Pagi hari.

   Kita duduk di meja piknik di ujung dermaga kayu yang menjorok ke danau.
   Di depan: matahari terbit tepat di celah dua bukit, kabut tipis di atas
   air, danau memantulkan langit (Reflector di kualitas tinggi). Di belakang:
   padang rumput dengan tenda warna-warni, pondok kayu, dan papan nama kayu.

   Satuan = meter. Kamera menghadap -z (ke matahari).
   ========================================================================== */
import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import type { Adegan, Kualitas } from './adegan';
import { buatAvatar, type Avatar, type OpsiAvatar } from './avatar';
import { acakBenih, buatPabrik } from './voxel';

const LANTAI = 0.55; // tinggi papan dermaga di atas air
const MEJA_Z = -0.85;
const ARAH_MATAHARI = new THREE.Vector3(0, 0.13, -1).normalize();
const LANGIT_ATAS = new THREE.Color(0x3d6aa6);
const LANGIT_UFUK = new THREE.Color(0xf6c49a);

/* ---------------- medan ---------------- */
function nilaiAcak(x: number, z: number) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function derau(x: number, z: number) {
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const xf = x - xi;
  const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = zf * zf * (3 - 2 * zf);
  const a = nilaiAcak(xi, zi);
  const b = nilaiAcak(xi + 1, zi);
  const c = nilaiAcak(xi, zi + 1);
  const d = nilaiAcak(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const fbm = (x: number, z: number) => derau(x, z) * 0.55 + derau(x * 2.1, z * 2.1) * 0.28 + derau(x * 4.3, z * 4.3) * 0.17;
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Tinggi tanah. Danau = elips berpusat (0, -75); tepi dekat kita di z ≈ 10. */
export function tinggiTanah(x: number, z: number) {
  const r = Math.hypot(x / 95, (z + 75) / 85);
  const t = r - 1;
  let h: number;
  if (t < 0) h = -3.5 * smooth(0, 0.25, -t) + 0.2;
  else h = 0.35 + t * 7 + smooth(0.22, 0.95, t) * 58 + fbm(x * 0.03, z * 0.03) * 14 * smooth(0.05, 0.5, t);
  /* Celah di punggung bukit seberang, tempat matahari muncul. */
  if (z < -120) h *= 1 - 0.72 * Math.exp(-((x / 55) ** 2)) * smooth(-120, -170, z);
  /* Dua bukit yang mengapit matahari terbit. */
  h += 70 * Math.exp(-((x + 78) ** 2 / (2 * 28 ** 2) + (z + 215) ** 2 / (2 * 40 ** 2)));
  h += 78 * Math.exp(-((x - 82) ** 2 / (2 * 30 ** 2) + (z + 210) ** 2 / (2 * 40 ** 2)));
  return h;
}

export function bangunRanuKumbolo(kualitas: Kualitas): Adegan {
  const rendah = kualitas === 'rendah';
  const pb = buatPabrik();
  const acak = acakBenih(2400);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe9c3a6);
  scene.fog = new THREE.FogExp2(0xe8cdb6, 0.0016);
  const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const kotakSatuan = new THREE.BoxGeometry(1, 1, 1);
  pb.sampah.push(kotakSatuan);
  const kumpulan = (bahan: THREE.Material, isi: { p: THREE.Vector3; s: THREE.Vector3; ry?: number; warna?: number }[], geo: THREE.BufferGeometry = kotakSatuan) => {
    const im = new THREE.InstancedMesh(geo, bahan, isi.length);
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    isi.forEach((k, i) => {
      o.position.copy(k.p);
      o.scale.copy(k.s);
      o.rotation.set(0, k.ry || 0, 0);
      o.updateMatrix();
      im.setMatrixAt(i, o.matrix);
      if (k.warna != null) im.setColorAt(i, c.setHex(k.warna));
    });
    return im;
  };

  /* ---------------- cahaya pagi ---------------- */
  scene.add(new THREE.HemisphereLight(0xd2e0f6, 0x6a6040, 1.7));
  const matahari = new THREE.DirectionalLight(0xffc896, 2.4);
  matahari.position.copy(ARAH_MATAHARI).multiplyScalar(200);
  scene.add(matahari);
  const lentera = new THREE.PointLight(0xffb060, 0.8, 2.5, 1.6);
  lentera.position.set(0.62, LANTAI + 1.05, MEJA_Z - 0.3);
  scene.add(lentera);

  /* ---------------- langit & matahari ---------------- */
  {
    const geo = new THREE.SphereGeometry(800, 48, 24);
    const bahan = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: { uSun: { value: ARAH_MATAHARI }, uAtas: { value: LANGIT_ATAS }, uUfuk: { value: LANGIT_UFUK } },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `uniform vec3 uSun; uniform vec3 uAtas; uniform vec3 uUfuk; varying vec3 vP;
        void main(){
          float h = clamp(vP.y, -0.2, 1.0);
          vec3 c = mix(uUfuk, uAtas, pow(max(h, 0.0), 0.45));
          float s = max(dot(normalize(vP), uSun), 0.0);
          c += vec3(1.0, 0.62, 0.32) * pow(s, 6.0) * 0.45 + vec3(1.0, 0.85, 0.6) * pow(s, 90.0) * 0.5;
          c += vec3(1.0, 0.93, 0.8) * smoothstep(0.9994, 0.9997, s) * 2.2;
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`,
    });
    pb.sampah.push(geo, bahan);
    scene.add(new THREE.Mesh(geo, bahan));

    /* Awan tipis berlapis di dekat ufuk. */
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 128;
    const g = c.getContext('2d')!;
    const gr = g.createRadialGradient(128, 64, 4, 128, 64, 120);
    gr.addColorStop(0, 'rgba(255,255,255,0.95)');
    gr.addColorStop(0.5, 'rgba(255,255,255,0.4)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 128);
    const tex = new THREE.CanvasTexture(c);
    pb.sampah.push(tex);
    for (let i = 0; i < 9; i++) {
      const m = new THREE.SpriteMaterial({ map: tex, color: i % 2 ? 0xffe0c8 : 0xffd2b0, transparent: true, opacity: 0.55, depthWrite: false, fog: false });
      pb.sampah.push(m);
      const s = new THREE.Sprite(m);
      const a = -0.9 + acak() * 1.8;
      s.position.set(Math.sin(a) * 600, 60 + acak() * 110, -Math.cos(a) * 600);
      s.scale.set(240 + acak() * 200, 30 + acak() * 25, 1);
      scene.add(s);
    }
  }

  /* ---------------- medan berbukit ---------------- */
  {
    const seg = rendah ? 130 : 220;
    const geo = new THREE.PlaneGeometry(900, 900, seg, seg).toNonIndexed();
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const warna = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i) - 75;
      pos.setZ(i, z);
      pos.setY(i, tinggiTanah(x, z));
    }
    /* Warna per segitiga (flat, gaya low-poly): rumput sabana → lereng → hutan. */
    for (let i = 0; i < pos.count; i += 3) {
      const y = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3;
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const n = fbm(x * 0.05, z * 0.05);
      if (y < 0.6) c.setHex(0x6f6a4a);
      else if (y < 6) c.setHex(0xa3a052).lerp(new THREE.Color(0x7d8f45), n);
      else if (y < 30) c.setHex(0x6f8a3e).lerp(new THREE.Color(0x3f5f30), smooth(6, 30, y) * 0.7 + n * 0.3);
      else c.setHex(0x34502c).lerp(new THREE.Color(0x24391f), n);
      c.offsetHSL(0, 0, (acak() - 0.5) * 0.03);
      for (let k = 0; k < 3; k++) warna.set([c.r, c.g, c.b], (i + k) * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(warna, 3));
    geo.computeVertexNormals();
    const bahan = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true });
    pb.sampah.push(geo, bahan);
    scene.add(new THREE.Mesh(geo, bahan));
  }

  /* ---------------- danau ---------------- */
  let airUniform: { value: number } | null = null;
  {
    const geo = new THREE.PlaneGeometry(240, 210);
    pb.sampah.push(geo);
    if (!rendah) {
      const air = new Reflector(geo, {
        textureWidth: 1024,
        textureHeight: 1024,
        clipBias: 0.003,
        color: 0x7895a8,
        shader: {
          name: 'AirDanau',
          uniforms: {
            color: { value: null },
            tDiffuse: { value: null },
            textureMatrix: { value: null },
            uT: { value: 0 },
          },
          vertexShader: `uniform mat4 textureMatrix; varying vec4 vUv; varying vec2 vXZ;
            #include <common>
            #include <logdepthbuf_pars_vertex>
            void main(){
              vUv = textureMatrix * vec4(position, 1.0);
              vXZ = position.xy;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              #include <logdepthbuf_vertex>
            }`,
          fragmentShader: `uniform vec3 color; uniform sampler2D tDiffuse; uniform float uT; varying vec4 vUv; varying vec2 vXZ;
            #include <logdepthbuf_pars_fragment>
            void main(){
              #include <logdepthbuf_fragment>
              vec2 w = vec2(sin(vXZ.x * 0.35 + uT * 0.6) + sin(vXZ.y * 0.52 + uT * 0.45),
                            cos(vXZ.y * 0.3 - uT * 0.5) + sin((vXZ.x + vXZ.y) * 0.21 + uT * 0.7));
              vec4 uv = vUv;
              uv.xy += w * 0.0028 * uv.w;
              vec3 pantul = texture2DProj(tDiffuse, uv).rgb;
              gl_FragColor = vec4(mix(pantul * 0.92, color, 0.22), 1.0);
              #include <tonemapping_fragment>
              #include <colorspace_fragment>
            }`,
        },
      });
      air.rotation.x = -Math.PI / 2;
      air.position.set(0, 0, -78);
      airUniform = (air.material as THREE.ShaderMaterial).uniforms.uT;
      scene.add(air);
      pb.sampah.push({ dispose: () => air.dispose() });
    } else {
      const bahan = new THREE.ShaderMaterial({
        uniforms: { uT: { value: 0 }, uSun: { value: ARAH_MATAHARI }, uAtas: { value: LANGIT_ATAS }, uUfuk: { value: LANGIT_UFUK } },
        vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
        fragmentShader: `uniform float uT; uniform vec3 uSun; uniform vec3 uAtas; uniform vec3 uUfuk; varying vec3 vW;
          void main(){
            vec3 v = normalize(vW - cameraPosition);
            vec3 n = normalize(vec3(sin(vW.x * 0.3 + uT * 0.6) * 0.025, 1.0, cos(vW.z * 0.25 - uT * 0.5) * 0.025));
            vec3 r = reflect(v, n);
            vec3 langit = mix(uUfuk, uAtas, pow(clamp(r.y, 0.0, 1.0), 0.45));
            float s = max(dot(r, uSun), 0.0);
            vec3 c = mix(vec3(0.08, 0.16, 0.18), langit, 0.78) + vec3(1.0, 0.8, 0.55) * (pow(s, 400.0) * 3.0 + pow(s, 24.0) * 0.35);
            gl_FragColor = vec4(c, 1.0);
            #include <colorspace_fragment>
          }`,
      });
      airUniform = bahan.uniforms.uT;
      pb.sampah.push(bahan);
      const air = new THREE.Mesh(geo, bahan);
      air.rotation.x = -Math.PI / 2;
      air.position.set(0, 0, -78);
      scene.add(air);
    }
  }

  /* Kabut tipis melayang di atas air. */
  const kabut: THREE.Sprite[] = [];
  {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 64;
    const g = c.getContext('2d')!;
    const gr = g.createRadialGradient(128, 32, 2, 128, 32, 128);
    gr.addColorStop(0, 'rgba(255,255,255,0.8)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 64);
    const tex = new THREE.CanvasTexture(c);
    pb.sampah.push(tex);
    const n = rendah ? 10 : 18;
    for (let i = 0; i < n; i++) {
      const m = new THREE.SpriteMaterial({ map: tex, color: 0xfff1e6, transparent: true, opacity: 0.22 + acak() * 0.18, depthWrite: false });
      pb.sampah.push(m);
      const s = new THREE.Sprite(m);
      s.position.set((acak() - 0.5) * 160, 1.2 + acak() * 3, -12 - acak() * 140);
      s.scale.set(40 + acak() * 50, 5 + acak() * 5, 1);
      scene.add(s);
      kabut.push(s);
    }
  }

  /* ---------------- dermaga kayu ---------------- */
  const KAYU = pb.polos(0x8b6a4a, 0.85);
  const KAYU_TUA = pb.polos(0x5e4430, 0.9);
  {
    const papan: { p: THREE.Vector3; s: THREE.Vector3; warna: number }[] = [];
    for (let z = 15; z >= -3.6; z -= 0.2) {
      const w = new THREE.Color(0x8b6a4a).offsetHSL(0, (acak() - 0.5) * 0.05, (acak() - 0.5) * 0.08).getHex();
      papan.push({ p: v3((acak() - 0.5) * 0.04, LANTAI - 0.025, z), s: v3(3.4, 0.05, 0.18), warna: w });
    }
    scene.add(kumpulan(new THREE.MeshStandardMaterial({ roughness: 0.9 }), papan));
    const rangka: { p: THREE.Vector3; s: THREE.Vector3 }[] = [];
    for (const x of [-1.5, 1.5]) rangka.push({ p: v3(x, LANTAI - 0.12, 5.7), s: v3(0.12, 0.14, 18.8) });
    for (let z = 14; z >= -3.6; z -= 2.2)
      for (const x of [-1.6, 1.6]) {
        rangka.push({ p: v3(x, LANTAI - 1.6, z), s: v3(0.16, 3.2, 0.16) });
        if (z > -3) rangka.push({ p: v3(x, LANTAI + 0.5, z), s: v3(0.09, 1, 0.09) });
      }
    for (const x of [-1.6, 1.6]) rangka.push({ p: v3(x, LANTAI + 1.0, 5.4), s: v3(0.08, 0.08, 17.4) });
    scene.add(kumpulan(KAYU_TUA, rangka));
  }

  /* Meja piknik + bangku panjang di ujung dermaga. */
  {
    for (let i = -2; i <= 2; i++) scene.add(pb.kotak(2.8, 0.05, 0.21, KAYU, 0, LANTAI + 0.725, MEJA_Z + i * 0.22));
    for (const x of [-1.2, 1.2]) scene.add(pb.kotak(0.08, 0.7, 0.9, KAYU_TUA, x, LANTAI + 0.35, MEJA_Z));
    for (const s of [-1, 1]) {
      const z = MEJA_Z + s * 0.88;
      scene.add(pb.kotak(2.8, 0.05, 0.3, KAYU, 0, LANTAI + 0.43, z));
      for (const x of [-1.1, 1.1]) scene.add(pb.kotak(0.07, 0.42, 0.26, KAYU_TUA, x, LANTAI + 0.21, z));
    }
  }

  const avatar: Avatar[] = [];
  const duduk = (opsi: OpsiAvatar, x: number, sisi: 1 | -1) => {
    const z = MEJA_Z + sisi * 0.88;
    const a = buatAvatar(pb, opsi);
    a.grup.position.set(x, LANTAI + 0.45 + (opsi.bantal ?? 0), z);
    a.grup.rotation.y = sisi === -1 ? 0 : Math.PI;
    if (opsi.bantal) scene.add(pb.kotak(0.4, opsi.bantal, 0.4, pb.polos(0xe8628a, 0.85), x, LANTAI + 0.455 + opsi.bantal / 2, z));
    scene.add(a.grup);
    avatar.push(a);
  };
  duduk({ jenis: 'kucing', kegiatan: 'laptop', seed: 1, skala: 0.05, bantal: 0.08 }, 0, -1);
  /* Hanya si kucing di seberang: pemandangan danau tetap lapang. Teman lain duduk di samping kita. */
  duduk({ jenis: 'manusia', kegiatan: 'baca', baju: 0xd9622b, rambut: 0x1b1410, aksesori: 'kupluk', warnaAksesori: 0x2f6fb3, kulit: 0xd9a77e, seed: 51 }, -1.15, 1);
  duduk({ jenis: 'kelinci', kegiatan: 'tulis', baju: 0x3d6b4a, seed: 52, mug: 0xf2efe8 }, 1.15, 1);

  /* Barang di meja: jurnal, mug enamel berasap, lentera, kompor kecil + ceret. */
  const uap: { m: THREE.Mesh; x: number; y: number; z: number }[] = [];
  {
    const y = LANTAI + 0.75;
    const jurnal = pb.kotak(0.2, 0.014, 0.27, pb.polos(0x6e4b2f, 0.8), 0.02, y + 0.007, -0.6);
    jurnal.rotation.y = 0.1;
    const halaman = pb.kotak(0.19, 0.004, 0.26, pb.polos(0xeee6d2, 0.9), 0.02, y + 0.016, -0.6);
    halaman.rotation.y = 0.1;
    scene.add(jurnal, halaman);
    const mug = new THREE.Group();
    mug.position.set(0.5, y, -0.72);
    mug.add(pb.kotak(0.08, 0.085, 0.08, pb.polos(0xf2f2ee, 0.35), 0, 0.0425, 0));
    mug.add(pb.kotak(0.084, 0.01, 0.084, pb.polos(0x2f5fa8, 0.4), 0, 0.083, 0));
    mug.add(pb.kotak(0.02, 0.045, 0.018, pb.polos(0xf2f2ee, 0.35), 0.05, 0.045, 0));
    scene.add(mug);
    const lenteraG = new THREE.Group();
    lenteraG.position.set(0.62, y, MEJA_Z - 0.3);
    lenteraG.add(pb.kotak(0.1, 0.02, 0.1, pb.polos(0x2a2a2a, 0.5, 0.5), 0, 0.01, 0));
    lenteraG.add(pb.kotak(0.07, 0.12, 0.07, pb.nyala(0xffc070, 1.6), 0, 0.08, 0));
    lenteraG.add(pb.kotak(0.1, 0.02, 0.1, pb.polos(0x2a2a2a, 0.5, 0.5), 0, 0.15, 0));
    scene.add(lenteraG);
    const kompor = new THREE.Group();
    kompor.position.set(-0.6, y, MEJA_Z - 0.12);
    kompor.add(pb.kotak(0.07, 0.08, 0.07, pb.polos(0x2b5bb5, 0.5), 0, 0.04, 0));
    kompor.add(pb.kotak(0.11, 0.08, 0.11, pb.polos(0xc4c9cf, 0.3, 0.6), 0, 0.12, 0));
    kompor.add(pb.kotak(0.02, 0.02, 0.06, pb.polos(0xc4c9cf, 0.3, 0.6), -0.07, 0.15, 0));
    scene.add(kompor);
    for (let i = 0; i < 12; i++) {
      const m = pb.kotak(0.008, 0.008, 0.008, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, depthWrite: false }));
      pb.sampah.push(m.material as THREE.Material);
      scene.add(m);
      uap.push(i < 6 ? { m, x: 0.5, y: y + 0.1, z: -0.72 } : { m, x: -0.67, y: y + 0.17, z: MEJA_Z - 0.12 });
    }
  }

  /* ---------------- tepi danau: tenda, pondok, papan nama, pepohonan ---------------- */
  {
    const domGeo = new THREE.SphereGeometry(1, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2);
    pb.sampah.push(domGeo);
    const tenda: [number, number, number][] = [
      [-9, 20, 0xe8742a], [-4.5, 24, 0x2f6fb3], [6, 21, 0xe8c13a], [11, 26, 0x3d8a4a], [-15, 29, 0xc23b3b], [2, 31, 0xe8742a], [17, 19, 0x2f6fb3], [-22, 23, 0xe8c13a],
    ];
    for (const [x, z, w] of tenda) {
      const y = tinggiTanah(x, z);
      const g = new THREE.Group();
      g.position.set(x, y - 0.05, z);
      g.rotation.y = acak() * Math.PI;
      const dom = new THREE.Mesh(domGeo, pb.polos(w, 0.8));
      dom.scale.set(1.3, 1.05, 1.6);
      g.add(dom);
      g.add(pb.kotak(0.7, 0.75, 0.05, pb.polos(0x2a2a30, 0.9), 0, 0.38, 1.33));
      scene.add(g);
    }

    /* Pondok kayu di tepi kiri. */
    const px = -13;
    const pz = 15;
    const py = tinggiTanah(px, pz);
    const pondok = new THREE.Group();
    pondok.position.set(px, py, pz);
    pondok.rotation.y = 0.35;
    pondok.add(pb.kotak(5, 2.6, 4, pb.polos(0x7a5638, 0.9), 0, 1.3, 0));
    for (const s of [-1, 1]) {
      const atap = pb.kotak(5.6, 0.12, 2.6, pb.polos(0x55684f, 0.7, 0.2), 0, 3.1, s * 1.05);
      atap.rotation.x = s * 0.55;
      pondok.add(atap);
    }
    pondok.add(pb.kotak(0.9, 1.8, 0.06, pb.polos(0x3b2a1c), 0.8, 0.9, 2.02));
    pondok.add(pb.kotak(0.9, 0.7, 0.06, pb.nyala(0xffc890, 1.1), -1.3, 1.5, 2.02));
    scene.add(pondok);

    /* Papan nama kayu di pangkal dermaga, menghadap danau. */
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 192;
    const g = c.getContext('2d')!;
    g.fillStyle = '#6b4a30';
    g.fillRect(0, 0, 512, 192);
    for (let i = 0; i < 4; i++) {
      g.fillStyle = `rgba(40,24,12,${0.15 + i * 0.03})`;
      g.fillRect(0, i * 48, 512, 2);
    }
    g.fillStyle = '#f3e6c8';
    g.textAlign = 'center';
    g.font = 'bold 74px "Plus Jakarta Sans", system-ui, sans-serif';
    g.fillText('RANU KUMBOLO', 256, 100);
    g.font = '600 38px "Plus Jakarta Sans", system-ui, sans-serif';
    g.fillText('2.400 mdpl', 256, 158);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    pb.sampah.push(tex);
    const muka = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });
    pb.sampah.push(muka);
    const papanNama = new THREE.Group();
    const sz = 12.5;
    papanNama.position.set(2.6, tinggiTanah(2.6, sz), sz);
    papanNama.rotation.y = -0.25;
    papanNama.add(pb.kotak(2.2, 0.82, 0.08, [KAYU_TUA, KAYU_TUA, KAYU_TUA, KAYU_TUA, KAYU_TUA, muka], 0, 1.75, 0));
    for (const x of [-0.95, 0.95]) papanNama.add(pb.kotak(0.12, 2.2, 0.12, KAYU_TUA, x, 1.1, 0.05));
    scene.add(papanNama);

    /* Cemara gunung di lereng, rumput di padang. */
    const daunGeo = new THREE.ConeGeometry(1, 1, 6);
    const batangGeo = new THREE.CylinderGeometry(0.12, 0.16, 1, 5);
    pb.sampah.push(daunGeo, batangGeo);
    const pohon: { p: THREE.Vector3; s: THREE.Vector3; ry: number; warna: number }[] = [];
    const batang: { p: THREE.Vector3; s: THREE.Vector3 }[] = [];
    const nPohon = rendah ? 260 : 520;
    let coba = 0;
    while (pohon.length < nPohon && coba < 6000) {
      coba++;
      const a = acak() * Math.PI * 2;
      const r = 1.06 + acak() * 0.85;
      const x = Math.sin(a) * 95 * r;
      const z = -75 - Math.cos(a) * 85 * r;
      if (Math.abs(x) < 26 && z < -150 && z > -240) continue; // jangan tutupi celah matahari
      if (z > 8 && Math.abs(x) < 30 && z < 45) continue; // padang tenda
      const y = tinggiTanah(x, z);
      if (y < 3) continue;
      const t = 4 + acak() * 7;
      pohon.push({ p: v3(x, y + t * 0.55, z), s: v3(t * 0.28, t, t * 0.28), ry: acak() * 3, warna: new THREE.Color(0x2c4a28).offsetHSL(0, 0, (acak() - 0.5) * 0.08).getHex() });
      batang.push({ p: v3(x, y + t * 0.1, z), s: v3(1, t * 0.25, 1) });
    }
    scene.add(kumpulan(new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true }), pohon, daunGeo));
    scene.add(kumpulan(pb.polos(0x4a3626, 0.9), batang, batangGeo));

    const rumputGeo = new THREE.ConeGeometry(0.06, 0.5, 3);
    pb.sampah.push(rumputGeo);
    const rumput: { p: THREE.Vector3; s: THREE.Vector3; ry: number; warna: number }[] = [];
    for (let i = 0; i < (rendah ? 350 : 900); i++) {
      const x = (acak() - 0.5) * 60;
      const z = 9 + acak() * 30;
      if (Math.abs(x) < 1.9 && z < 16) continue;
      const s = 0.6 + acak() * 1.2;
      rumput.push({ p: v3(x, tinggiTanah(x, z) + 0.2 * s, z), s: v3(s, s, s), ry: acak() * 3, warna: acak() < 0.5 ? 0xc2b25e : 0x9aa24f });
    }
    scene.add(kumpulan(new THREE.MeshStandardMaterial({ roughness: 1 }), rumput, rumputGeo));
  }

  /* Beruang berdiri di ujung dermaga menatap matahari terbit; dua pendaki di dekat tenda. */
  {
    const a = buatAvatar(pb, { jenis: 'beruang', kegiatan: 'jalan', baju: 0x2f4a6d, aksesori: 'kupluk', warnaAksesori: 0xc23b3b, seed: 53 });
    a.grup.position.set(1.05, LANTAI + 0.45, -3.2);
    a.grup.rotation.y = Math.PI + 0.15;
    scene.add(a.grup);
    avatar.push(a);
  }
  for (const [x, z, ry, opsi] of [
    [-6.5, 17.5, Math.PI + 0.3, { jenis: 'manusia', kegiatan: 'jalan', baju: 0x2f6fb3, rambut: 0x2b1d14, aksesori: 'kupluk', warnaAksesori: 0xe8c13a, seed: 61 }],
    [5, 18.2, Math.PI - 0.4, { jenis: 'rubah', kegiatan: 'jalan', baju: 0x6e2a3f, seed: 62 }],
  ] as [number, number, number, OpsiAvatar][]) {
    const a = buatAvatar(pb, opsi);
    a.grup.position.set(x, tinggiTanah(x, z) + 0.45, z);
    a.grup.rotation.y = ry;
    scene.add(a.grup);
    avatar.push(a);
  }

  /* Sekawanan burung melintas jauh di depan. */
  const burung: { g: THREE.Group; sayap: THREE.Group[]; fase: number; y: number; z: number; v: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const g = new THREE.Group();
    const sayap: THREE.Group[] = [];
    for (const s of [-1, 1]) {
      const pangkal = new THREE.Group();
      pangkal.add(pb.kotak(0.9, 0.06, 0.25, pb.polos(0x2a2a30, 0.9), s * 0.45, 0, 0));
      g.add(pangkal);
      sayap.push(pangkal);
    }
    scene.add(g);
    burung.push({ g, sayap, fase: acak() * 6, y: 32 + (i % 3) * 2.2 + acak() * 2, z: -110 - Math.abs(i - 3) * 2.5, v: 3.2 + acak() * 0.4 });
  }

  const mata = new THREE.Vector3(0, LANTAI + 1.17, 0.1);

  return {
    scene,
    mata,
    teman: avatar.length,
    paparan: 1.0,
    pitchAwal: 0.02,
    update(t, dt, fokus) {
      if (airUniform) airUniform.value = t;
      avatar.forEach(a => a.update(t, dt, fokus));
      lentera.intensity = 0.8 + Math.sin(t * 7) * 0.04 + Math.sin(t * 13) * 0.03;
      kabut.forEach((k, i) => {
        k.position.x += (0.35 + (i % 3) * 0.15) * dt;
        if (k.position.x > 90) k.position.x = -90;
      });
      uap.forEach(({ m, x, y, z }, i) => {
        const u = (t * 0.3 + (i % 6) / 6) % 1;
        m.position.set(x + Math.sin(u * 7 + i) * 0.015, y + u * 0.22, z + Math.cos(u * 5 + i) * 0.012);
        (m.material as THREE.MeshBasicMaterial).opacity = 0.22 * (1 - u);
        m.scale.setScalar(1 + u * 1.8);
      });
      burung.forEach((b, i) => {
        const x = ((t * b.v + i * 3 + 120) % 260) - 130;
        b.g.position.set(x - Math.abs(i - 3) * 2.5, b.y + Math.sin(t * 0.6 + i) * 0.6, b.z);
        b.g.rotation.y = -Math.PI / 2;
        const kepak = Math.sin(t * 7 + b.fase) * 0.5;
        b.sayap[0].rotation.z = kepak;
        b.sayap[1].rotation.z = -kepak;
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
