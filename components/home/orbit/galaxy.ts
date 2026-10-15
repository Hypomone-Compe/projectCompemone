/**
 * Galaksi Andromeda 3D dari partikel, pengganti logo di tengah orbit.
 *
 * - Piringan spiral dua lengan (M31 tampak hampir dari samping, ~75°), plus tonjolan inti.
 * - Warna: inti kuning hangat → lengan biru pucat, sesekali gumpalan merah muda (wilayah HII)
 *   dan bintang terang. Jalur debu dibuat dengan menjarangkan partikel di sisi dalam lengan.
 * - Satu draw call (Points + ShaderMaterial, additive), ukuran titik mengikuti jarak.
 * - Bola tak terlihat dipakai untuk raycast (klik galaksi).
 */
import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Color,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  Points,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
} from "three";

const VERT = /* glsl */ `
attribute float aSize;
attribute vec3 aColor;
attribute float aTwinkle;
uniform float uTime;
uniform float uPixel;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float tw = 0.75 + 0.25 * sin(uTime * (1.2 + aTwinkle * 2.0) + aTwinkle * 40.0);
  vAlpha = tw;
  gl_PointSize = aSize * uPixel * (12.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`;

const FRAG = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec2 p = gl_PointCoord - 0.5;
  float d = length(p);
  if (d > 0.5) discard;
  float core = smoothstep(0.5, 0.0, d);
  float a = pow(core, 1.8) * vAlpha;
  gl_FragColor = vec4(vColor * a, a);
}`;

/** Bilangan acak berdistribusi kira-kira normal (Box–Muller sederhana). */
const gauss = (rnd: () => number) => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd());

/** PRNG kecil ber-seed supaya bentuk galaksi sama di setiap kunjungan. */
function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,236,200,0.9)");
  grad.addColorStop(0.12, "rgba(255,214,170,0.35)");
  grad.addColorStop(0.45, "rgba(180,170,255,0.05)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new CanvasTexture(c);
}

export interface Galaxy {
  group: Group;
  pick: Mesh;
  update(t: number, reduceMotion: boolean): void;
  dispose(): void;
}

export function createGalaxy({ radius = 1.9, count = 20000, pixelRatio = 1 }: { radius?: number; count?: number; pixelRatio?: number } = {}): Galaxy {
  const rnd = mulberry(31);
  const pos: number[] = [];
  const col: number[] = [];
  const size: number[] = [];
  const twinkle: number[] = [];

  const inti = new Color("#ffe2b0");
  const tengah = new Color("#fff2dd");
  const lengan = new Color("#a9c3ff");
  const luar = new Color("#7d8fe0");
  const hii = new Color("#ff8fb4");
  const c = new Color();

  const ARMS = 2;
  const SPIN = 3.6; // lilitan lengan (per satuan radius)
  for (let i = 0; i < count; i++) {
    const tonjolan = i < count * 0.12;
    if (tonjolan) {
      /* Inti: elipsoid padat, sedikit pipih. */
      const r = Math.abs(gauss(rnd)) * radius * 0.16;
      const th = rnd() * Math.PI * 2;
      const ph = Math.acos(2 * rnd() - 1);
      pos.push(r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 0.55, r * Math.sin(ph) * Math.sin(th));
      c.copy(inti).lerp(tengah, rnd() * 0.6);
      col.push(c.r, c.g, c.b);
      size.push(0.6 + rnd() * 1.2);
    } else {
      const t = Math.pow(rnd(), 0.75);
      const r = 0.12 * radius + t * radius;
      const arm = Math.floor(rnd() * ARMS);
      const base = (arm / ARMS) * Math.PI * 2 + (r / radius) * SPIN;
      /* Sebaran melebar ke luar; sisi dalam lengan dijarangkan (jalur debu). */
      const lebar = 0.07 + t * 0.14;
      let off = gauss(rnd) * lebar;
      if (off < -lebar * 0.6 && rnd() < 0.7) off = -off * 0.4;
      const th = base + off;
      const rr = r + gauss(rnd) * 0.05 * radius;
      const y = gauss(rnd) * 0.035 * radius * (1 - t * 0.5);
      pos.push(rr * Math.cos(th), y, rr * Math.sin(th));

      const terang = rnd() < 0.05;
      const oranye = rnd() < 0.3;
      const merah = !terang && rnd() < 0.035 * (1 - Math.abs(off) / (lebar * 2));
      if (merah) c.copy(hii);
      else c.copy(tengah).lerp(lengan, Math.min(1, t * 1.6)).lerp(luar, Math.max(0, t - 0.6));
      if (terang) {
        if (oranye) c.set("#ffb37f");
        else c.lerp(new Color("#ffffff"), 0.6);
      }
      col.push(c.r, c.g, c.b);
      size.push(terang ? 3.2 + rnd() * 2.2 : merah ? 1.4 + rnd() : 0.5 + rnd() * 0.8);
    }
    twinkle.push(rnd());
  }

  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(pos, 3));
  geo.setAttribute("aColor", new Float32BufferAttribute(col, 3));
  geo.setAttribute("aSize", new Float32BufferAttribute(size, 1));
  geo.setAttribute("aTwinkle", new Float32BufferAttribute(twinkle, 1));
  const uniforms = { uTime: { value: 0 }, uPixel: { value: pixelRatio } };
  const mat = new ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    toneMapped: false,
  });
  const points = new Points(geo, mat);

  /* Cahaya inti: sprite lembut, menghadap kamera. */
  const glowTex = glowTexture();
  const glowMat = new SpriteMaterial({ map: glowTex, blending: AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false });
  const glow = new Sprite(glowMat);
  glow.scale.setScalar(radius * 0.85);

  /* Piringan diputar pada sumbunya sendiri, lalu dimiringkan seperti M31. */
  const disk = new Group();
  disk.add(points);
  const tilt = new Group();
  tilt.rotation.x = 0.95; // miring ±35° dari tampak muka: spiral terbaca, tetap elips seperti M31
  tilt.rotation.z = -0.62; // sumbu panjang miring diagonal
  tilt.add(disk);

  const group = new Group();
  group.add(tilt, glow);

  const pickGeo = new SphereGeometry(radius * 0.62, 12, 8);
  const pickMat = new MeshBasicMaterial({ visible: false });
  const pick = new Mesh(pickGeo, pickMat);
  group.add(pick);

  return {
    group,
    pick,
    update(t, reduceMotion) {
      uniforms.uTime.value = t;
      disk.rotation.y = reduceMotion ? 0.4 : -t * 0.07;
      group.rotation.y = reduceMotion ? 0 : Math.sin(t * 0.15) * 0.12;
    },
    dispose() {
      geo.dispose();
      mat.dispose();
      glowTex.dispose();
      glowMat.dispose();
      pickGeo.dispose();
      pickMat.dispose();
    },
  };
}

/** Bintang latar: titik kecil di bola besar, untuk scene grid. */
export function createStarfield(count = 1600, radius = 40) {
  const rnd = mulberry(7);
  const pos: number[] = [];
  const col: number[] = [];
  const size: number[] = [];
  const twinkle: number[] = [];
  const c = new Color();
  for (let i = 0; i < count; i++) {
    const th = rnd() * Math.PI * 2;
    const ph = Math.acos(2 * rnd() - 1);
    pos.push(radius * Math.sin(ph) * Math.cos(th), radius * Math.cos(ph), radius * Math.sin(ph) * Math.sin(th));
    c.set(rnd() < 0.15 ? "#ffd9b0" : rnd() < 0.3 ? "#b8c8ff" : "#ffffff");
    const k = 0.35 + rnd() * 0.65;
    col.push(c.r * k, c.g * k, c.b * k);
    size.push(rnd() < 0.05 ? 3 : 0.9 + rnd() * 1.4);
    twinkle.push(rnd());
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(pos, 3));
  geo.setAttribute("aColor", new Float32BufferAttribute(col, 3));
  geo.setAttribute("aSize", new Float32BufferAttribute(size, 1));
  geo.setAttribute("aTwinkle", new Float32BufferAttribute(twinkle, 1));
  const uniforms = { uTime: { value: 0 }, uPixel: { value: 1 } };
  const mat = new ShaderMaterial({
    uniforms,
    vertexShader: VERT.replace("(12.0 / -mv.z)", "(26.0 / -mv.z)"),
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    toneMapped: false,
  });
  return { points: new Points(geo, mat), uniforms, dispose: () => (geo.dispose(), mat.dispose()) };
}
