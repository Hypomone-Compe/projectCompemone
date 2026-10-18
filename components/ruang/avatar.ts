/* ==========================================================================
   Teman belajar voxel di ruang fokus.

   Satuan di sini = satu voxel; grup diperkecil SKALA_AVATAR supaya jadi meter.
   Titik asal = tengah dudukan kursi, wajah menghadap +z (ke meja).
   Tinggi meja dari dudukan = 4.6 voxel (0.75 m − 0.45 m).
   ========================================================================== */
import * as THREE from 'three';
import { acakBenih, cangkang, halus, type Pabrik, type V } from './voxel';

export const SKALA_AVATAR = 0.065;

export type JenisAvatar = 'kucing' | 'manusia' | 'beruang' | 'kelinci' | 'rubah' | 'penguin' | 'robot';
export type Kegiatan = 'laptop' | 'baca' | 'tulis' | 'tidur' | 'jalan';

export interface OpsiAvatar {
  jenis: JenisAvatar;
  kegiatan: Kegiatan;
  baju?: number;
  celana?: number;
  kulit?: number;
  rambut?: number;
  aksesori?: 'kacamata' | 'headphone' | 'kupluk';
  warnaAksesori?: number;
  /** Mug di meja. */
  mug?: number;
  seed?: number;
  /** Meter per voxel; bawaan SKALA_AVATAR. */
  skala?: number;
  /** Tinggi bantal di kursi (m), untuk tokoh yang lebih kecil. */
  bantal?: number;
}

export interface Avatar {
  grup: THREE.Group;
  /** Untuk kegiatan 'jalan': diisi adegan, true saat sedang melangkah. */
  melangkah: boolean;
  update(t: number, dt: number, fokus: boolean): void;
}

const BULU: Record<JenisAvatar, number> = {
  kucing: 0x111118,
  manusia: 0xf1c9a5,
  beruang: 0x8a5a3b,
  kelinci: 0xefece6,
  rubah: 0xe07b39,
  penguin: 0x1b1e28,
  robot: 0xaab3c4,
};

export function buatAvatar(pb: Pabrik, o: OpsiAvatar): Avatar {
  const acak = acakBenih(o.seed ?? 7);
  const fase = acak() * 100;
  const jenis = o.jenis;
  const kulit = o.kulit ?? BULU[jenis];
  const baju = o.baju ?? kulit;
  const celana = o.celana ?? (jenis === 'manusia' ? 0x2c3247 : kulit);
  const jalan = o.kegiatan === 'jalan';
  const kucing = jenis === 'kucing';

  const skala = o.skala ?? SKALA_AVATAR;
  /* Tinggi permukaan meja dari dudukan, dalam voxel: meja 0.75 m, kursi 0.45 m. */
  const MEJA = (0.3 - (o.bantal ?? 0)) / skala;
  const grup = new THREE.Group();
  grup.scale.setScalar(skala);
  const badan = new THREE.Group();
  grup.add(badan);

  /* ---------------- badan ---------------- */
  if (kucing) {
    badan.add(pb.voxel(cangkang([0, 3.6, -0.3], [3.6, 3.9, 2.8]), kulit));
  } else {
    badan.add(
      pb.voxel(cangkang([0, 4.2, 0], [3.4, 4.2, 2.5]), (p: V) => {
        if (jenis === 'penguin' && p[2] > 0.6 && Math.abs(p[0]) < 2.3) return 0xf2efe8;
        return baju;
      }),
    );
    if (jenis === 'robot') badan.add(pb.kotak(1.2, 1.2, 0.3, pb.nyala(0x5ef2ff, 2.2), 0, 5, 2.5));
  }

  /* ---------------- kepala ---------------- */
  const leher = new THREE.Group();
  leher.position.set(0, kucing ? 7 : 8, kucing ? 0.3 : 0.2);
  badan.add(leher);
  const kepala = new THREE.Group();
  leher.add(kepala);
  const mata = new THREE.Group();
  kepala.add(mata);
  let ujungAntena: THREE.Mesh | null = null;

  const depanDari = (isi: V[]) => (x: number, y: number) => {
    const z = isi.filter(k => k[0] === x && k[1] === y).map(k => k[2]);
    return z.length ? Math.max(...z) : 3;
  };
  const gelap = 0x1b1b24;
  /** Dua mata sederhana di wajah; tinggi y, jarak sx. */
  const mataBiasa = (depan: (x: number, y: number) => number, y: number, sx = 1.5, h = 1.1, warna = gelap) => {
    mata.position.y = y;
    for (const s of [-1, 1]) {
      const z = Math.max(depan(Math.round(s * sx), Math.round(y)), depan(Math.trunc(s * sx), Math.round(y)));
      mata.add(pb.kotak(0.8, h, 0.2, pb.polos(warna, 0.4), s * sx, 0, z + 0.5));
    }
  };

  if (kucing) {
    const isi = cangkang([0, 2.4, 0.6], [4.3, 3.1, 3.1]);
    for (const s of [-1, 1])
      for (const [x, y] of [[4, 4], [3, 4], [2, 4], [4, 5], [3, 5], [4, 6], [3, 6], [4, 7]] as [number, number][])
        for (const z of [0, 1]) isi.push([s * x, y, z]);
    kepala.add(pb.voxel(isi, kulit));
    const depan = depanDari(isi);
    mata.position.y = 2.5;
    for (const sx of [-1, 1]) {
      for (const x of [1, 2])
        for (const y of [2, 3]) mata.add(pb.kotak(0.98, 0.98, 0.2, pb.nyala(0xffd23f, 1.35), sx * x, y - 2.5, depan(sx * x, y) + 0.45));
      const zp = Math.max(depan(sx, 2), depan(sx * 2, 2), depan(sx, 3), depan(sx * 2, 3));
      mata.add(pb.kotak(0.34, 1.7, 0.1, pb.nyala(0x0b0b10, 1), sx * 1.5, 0, zp + 0.61));
    }
    kepala.add(pb.kotak(0.98, 0.7, 0.3, pb.polos(0xe8628a, 0.5), 0, 1.1, depan(0, 1) + 0.45));
    kepala.add(pb.kotak(0.9, 0.9, 0.2, pb.polos(0xe8628a, 0.5), -3, 4.5, 1.55), pb.kotak(0.9, 0.9, 0.2, pb.polos(0xe8628a, 0.5), 3, 4.5, 1.55));
  } else if (jenis === 'robot') {
    const isi: V[] = [];
    for (let x = -3; x <= 3; x++)
      for (let y = 0; y <= 6; y++)
        for (let z = -2; z <= 3; z++) if (Math.abs(x) === 3 || y === 0 || y === 6 || z === -2 || z === 3) isi.push([x, y, z]);
    kepala.add(pb.voxel(isi, kulit, 0.02));
    kepala.add(pb.kotak(5.6, 2.6, 0.3, pb.polos(0x0b1430, 0.3), 0, 3.4, 3.55));
    mata.position.y = 3.4;
    for (const s of [-1, 1]) mata.add(pb.kotak(1, 1, 0.2, pb.nyala(0x5ef2ff, 2.4), s * 1.4, 0, 3.75));
    kepala.add(pb.kotak(0.3, 2, 0.3, pb.polos(0x7a8296, 0.4, 0.5), 0, 7.4, 0.5));
    ujungAntena = pb.kotak(0.9, 0.9, 0.9, pb.nyala(0xff6b8b, 2.4), 0, 8.7, 0.5);
    kepala.add(ujungAntena);
    kepala.add(pb.kotak(0.6, 2, 2, pb.polos(0x7a8296, 0.4, 0.5), -3.6, 3, 0.5), pb.kotak(0.6, 2, 2, pb.polos(0x7a8296, 0.4, 0.5), 3.6, 3, 0.5));
  } else {
    const r: V = jenis === 'manusia' ? [3.7, 3.7, 3.4] : jenis === 'beruang' ? [3.9, 3.5, 3.3] : [3.7, 3.4, 3.3];
    const isi = cangkang([0, 3.5, 0.3], r);
    kepala.add(
      pb.voxel(isi, (p: V) => {
        if (jenis === 'rubah' && p[1] < 3 && p[2] > 1) return 0xf4efe6;
        if (jenis === 'penguin' && p[2] > 1.2 && p[1] < 4.8 && Math.abs(p[0]) <= 2.6) return 0xf2efe8;
        return kulit;
      }),
    );
    const depan = depanDari(isi);

    if (jenis === 'manusia') {
      const rambut = cangkang([0, 3.7, 0.25], [4.3, 4.3, 4]).filter(
        ([x, y, z]) => y >= 4.7 || z <= -0.6 || (Math.abs(x) >= 3.6 && y >= 2.4),
      );
      kepala.add(pb.voxel(rambut, o.rambut ?? 0x2b1d14));
      mataBiasa(depan, 3.2);
      kepala.add(pb.kotak(1.1, 0.35, 0.2, pb.polos(0xb4505a, 0.6), 0, 1.7, depan(0, 2) + 0.4));
      for (const s of [-1, 1]) kepala.add(pb.kotak(0.9, 0.5, 0.15, pb.polos(0xf29bb0, 0.7), s * 2.5, 2.3, depan(s * 2, 2) + 0.35));
    } else if (jenis === 'beruang') {
      for (const s of [-1, 1]) {
        kepala.add(pb.voxel(cangkang([s * 3, 6.3, 0], [1.3, 1.3, 0.9]), kulit));
        kepala.add(pb.kotak(1, 1, 0.2, pb.polos(0x5a3825), s * 3, 6.3, 0.95));
      }
      const zDepan = depan(0, 2);
      kepala.add(pb.voxel(cangkang([0, 2, zDepan - 0.4], [1.7, 1.2, 1.1]), 0xc89a6e));
      kepala.add(pb.kotak(1, 0.7, 0.3, pb.polos(0x1d1410, 0.4), 0, 2.6, zDepan + 0.75));
      mataBiasa(depan, 3.6, 1.7, 0.9);
    } else if (jenis === 'kelinci') {
      for (const s of [-1, 1]) {
        const tl = new THREE.Group();
        tl.position.set(s * 1.6, 6, 0.2);
        tl.rotation.z = s * -0.18;
        const pos: V[] = [];
        for (let y = 0; y <= 6; y++) for (const x of [-0.5, 0.5]) pos.push([x, y, 0]);
        tl.add(pb.voxel(pos, kulit));
        tl.add(pb.kotak(0.9, 5, 0.2, pb.polos(0xf2a6b8, 0.6), 0, 3, 0.5));
        kepala.add(tl);
      }
      mataBiasa(depan, 3.3);
      kepala.add(pb.kotak(0.8, 0.6, 0.2, pb.polos(0xf2a6b8, 0.5), 0, 2.2, depan(0, 2) + 0.45));
    } else if (jenis === 'rubah') {
      for (const s of [-1, 1]) {
        const pos: V[] = [[s * 2, 6, 0], [s * 3, 6, 0], [s * 2, 6, 1], [s * 3, 6, 1], [s * 2, 7, 0], [s * 3, 7, 0], [s * 3, 8, 0]];
        kepala.add(pb.voxel(pos, (p: V) => (p[1] === 8 ? 0x2a1a14 : kulit)));
      }
      mataBiasa(depan, 3.4, 1.6, 0.9);
      kepala.add(pb.kotak(0.8, 0.6, 0.3, pb.polos(0x1d1410, 0.4), 0, 2, depan(0, 2) + 0.5));
    } else if (jenis === 'penguin') {
      mataBiasa(depan, 3.6, 1.3, 0.9);
      kepala.add(pb.kotak(1.4, 0.8, 1.3, pb.polos(0xf2a03d, 0.5), 0, 2.4, depan(0, 2) + 0.7));
    }

    /* Aksesori. */
    const wa = o.warnaAksesori ?? 0x1a1a1a;
    if (o.aksesori === 'kacamata') {
      const z = depan(1, 3) + 0.6;
      const bk = pb.polos(wa, 0.4, 0.3);
      for (const s of [-1, 1]) {
        kepala.add(pb.kotak(1.9, 0.22, 0.2, bk, s * 1.5, 4, z), pb.kotak(1.9, 0.22, 0.2, bk, s * 1.5, 2.4, z));
        kepala.add(pb.kotak(0.22, 1.8, 0.2, bk, s * 0.55, 3.2, z), pb.kotak(0.22, 1.8, 0.2, bk, s * 2.45, 3.2, z));
      }
      kepala.add(pb.kotak(0.7, 0.2, 0.2, bk, 0, 3.6, z));
    } else if (o.aksesori === 'headphone') {
      const bk = pb.polos(wa, 0.45, 0.2);
      for (let i = 0; i <= 12; i++) {
        const a = (i / 12) * Math.PI;
        kepala.add(pb.kotak(0.8, 0.8, 1, bk, Math.cos(a) * 4.5, 3.6 + Math.sin(a) * 4.4, 0.3));
      }
      kepala.add(pb.kotak(1.2, 2.6, 2.4, bk, -4.2, 3.3, 0.3), pb.kotak(1.2, 2.6, 2.4, bk, 4.2, 3.3, 0.3));
    } else if (o.aksesori === 'kupluk') {
      const topi = cangkang([0, 4, 0.2], [4.4, 4.1, 4.1]).filter(p => p[1] >= 5);
      kepala.add(pb.voxel(topi, (p: V) => (p[1] <= 5.6 ? wa : new THREE.Color(wa).offsetHSL(0, 0, 0.06).getHex())));
      kepala.add(pb.voxel(cangkang([0, 8.6, 0.2], [1.2, 1.2, 1.2]), 0xf2efe8));
    }
  }

  /* ---------------- lengan ---------------- */
  const lengan: THREE.Group[] = [];
  const warnaTangan = jenis === 'manusia' ? kulit : jenis === 'robot' ? 0x7a8296 : kulit;
  for (const s of [-1, 1]) {
    const g = new THREE.Group();
    if (kucing) {
      g.position.set(s * 2, MEJA - 0.2, 1.6);
      g.add(pb.voxel([[0, 0, 1], [0, -0.3, 2], [0, -0.5, 3], [s * -0.2, -0.6, 4]], kulit));
    } else if (jalan) {
      g.position.set(s * 3.6, 7, 0);
      g.add(pb.voxel([[0, -1, 0], [0, -2, 0], [0, -3, 0]], baju));
      g.add(pb.voxel([[0, -4, 0]], warnaTangan));
    } else {
      g.position.set(s * 3.2, 6.9, 0.4);
      g.add(pb.voxel([[0, -0.4, 0.6], [0, -0.9, 1.6], [s * -0.2, -1.3, 2.6], [s * -0.5, -1.6, 3.6], [s * -0.8, -1.8, 4.6]], baju));
      g.add(pb.voxel([[s * -1.1, -1.85, 5.6]], warnaTangan));
    }
    badan.add(g);
    lengan.push(g);
  }

  /* ---------------- kaki ---------------- */
  const kaki: THREE.Group[] = [];
  if (!kucing) {
    for (const s of [-1, 1]) {
      const g = new THREE.Group();
      g.position.set(s * 1.5, 0.3, 0);
      if (jalan) {
        g.add(pb.voxel([[0, -1, 0], [0, -2, 0], [0, -3, 0], [0, -4, 0], [0, -5, 0], [0, -6, 0]], celana));
        g.add(pb.voxel([[0, -6.6, 0.4]], 0x23232b));
      } else {
        g.add(pb.voxel([[0, 0, 1], [0, 0, 2], [0, 0, 3], [0, 0, 4], [0, -1, 4.8], [0, -2, 4.8], [0, -3, 4.8], [0, -4, 4.8], [0, -5, 4.8], [0, -6, 4.8]], celana));
        g.add(pb.voxel([[0, -6.7, 5.6]], 0x23232b));
      }
      grup.add(g);
      kaki.push(g);
    }
  }

  /* Ekor kucing: menyembul di samping kursi. */
  let ekor: THREE.Group | null = null;
  if (kucing) {
    ekor = new THREE.Group();
    ekor.position.set(2.6, 1, -2.6);
    const pos: V[] = [];
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      pos.push([Math.round(t * 3.5), Math.round(t * 6 - Math.max(0, t - 0.7) * 5), Math.round(-t * 1.5)]);
    }
    ekor.add(pb.voxel(pos, kulit));
    badan.add(ekor);
  }

  /* ---------------- barang di meja ---------------- */
  let tutupLaptop: THREE.Group | null = null;
  let halaman: THREE.Group | null = null;
  let balikMulai = -10;
  let balikBerikut = 4 + acak() * 8;
  if (o.kegiatan === 'laptop') {
    const lap = new THREE.Group();
    lap.position.set(0, MEJA, 8);
    const logam = pb.polos(kucing ? 0x6b74a8 : [0x9aa3b5, 0x3a3f4d, 0xc9ced8][Math.floor(acak() * 3)], 0.35, 0.4);
    lap.add(pb.kotak(7, 0.4, 4.6, logam, 0, 0.2, 0));
    lap.add(pb.kotak(6.2, 0.06, 2.2, pb.polos(0x2a2f40), 0, 0.43, -0.6));
    tutupLaptop = new THREE.Group();
    tutupLaptop.position.set(0, 0.4, 2.3);
    tutupLaptop.rotation.x = 0.28;
    tutupLaptop.add(pb.kotak(7, 4.4, 0.28, logam, 0, 2.2, 0));
    tutupLaptop.add(pb.kotak(6.4, 3.8, 0.06, pb.nyala(kucing ? 0x8297f0 : 0x9fb6e8, 1.25), 0, 2.25, -0.18));
    tutupLaptop.add(pb.kotak(0.9, 0.9, 0.06, pb.nyala(kucing ? 0xff7aa2 : 0xeef0fb, kucing ? 2 : 1.2), 0, 2.3, 0.17));
    lap.add(tutupLaptop);
    grup.add(lap);
  } else if (o.kegiatan === 'baca' || o.kegiatan === 'tidur') {
    const buku = new THREE.Group();
    buku.position.set(0, MEJA, 8.2);
    const sampul = [0x7a2e2e, 0x2f4a6d, 0x3d5c3a, 0x5b3a5e][Math.floor(acak() * 4)];
    if (o.kegiatan === 'tidur') {
      buku.add(pb.kotak(4, 0.7, 5.2, pb.polos(sampul), 1.5, 0.35, 0.5));
    } else {
      buku.add(pb.kotak(6, 0.25, 4.2, pb.polos(sampul), 0, 0.13, 0));
      const kertas = pb.polos(0xeee6d2, 0.9);
      for (const s of [-1, 1]) {
        const h = pb.kotak(2.8, 0.35, 3.8, kertas, s * 1.45, 0.45, 0);
        h.rotation.z = s * -0.08;
        buku.add(h);
      }
      halaman = new THREE.Group();
      halaman.position.set(0, 0.62, 0);
      halaman.add(pb.kotak(2.8, 0.06, 3.7, kertas, 1.4, 0, 0));
      halaman.visible = false;
      buku.add(halaman);
    }
    grup.add(buku);
  } else if (o.kegiatan === 'tulis') {
    grup.add(pb.kotak(4.4, 0.25, 5.4, pb.polos(0xeee6d2, 0.9), -1.4, MEJA + 0.13, 8));
    const pena = pb.kotak(0.3, 0.3, 2.6, pb.polos(0x1f2c3f, 0.4), -1.1, -1.2, 6.4);
    pena.rotation.x = -0.7;
    lengan[0].add(pena);
  }
  if (o.mug != null) {
    const mug = new THREE.Group();
    mug.position.set(-4.6, MEJA, 6.4);
    mug.add(pb.kotak(1.5, 1.8, 1.5, pb.polos(o.mug, 0.5), 0, 0.9, 0), pb.kotak(0.4, 0.9, 0.3, pb.polos(o.mug, 0.5), -0.95, 1, 0));
    grup.add(mug);
  }

  /* Partikel "z" tokoh yang tertidur. */
  const zzz: THREE.Mesh[] = [];
  if (o.kegiatan === 'tidur') {
    const m = pb.nyala(0xeef0fb, 1.1, { transparent: true });
    for (let i = 0; i < 3; i++) {
      const z = pb.kotak(0.8, 0.8, 0.8, m.clone());
      pb.sampah.push(z.material as THREE.Material);
      grup.add(z);
      zzz.push(z);
    }
  }

  /* ---------------- animasi ---------------- */
  let kedip = 1 + acak() * 4;
  let lirikMulai = -10;
  let lirikArah = 0;
  let lirikBerikut = 6 + acak() * 10;
  const pitchDasar = { laptop: 0.12, baca: 0.34, tulis: 0.42, tidur: 0.95, jalan: 0 }[o.kegiatan];

  const av: Avatar = {
    grup,
    melangkah: false,
    update(t, dt, fokus) {
      const tt = t + fase;
      badan.scale.y = 1 + Math.sin(tt * (o.kegiatan === 'tidur' ? 1.1 : 1.7)) * 0.012;

      /* Kedip; mata kucing menyipit saat sesi fokus berjalan. */
      let skala = kucing && fokus ? 0.45 : 1;
      if (o.kegiatan === 'tidur') skala = 0.12;
      else if (t > kedip) {
        const k = (t - kedip) / 0.15;
        if (k < 1) skala = Math.min(skala, Math.abs(1 - 2 * k) * 0.9 + 0.1);
        else kedip = t + 2 + acak() * 4;
      }
      mata.scale.y = halus(mata.scale.y, skala, 0.4);

      /* Lirikan sesekali: menoleh, atau (kucing, saat jeda) menatap kita. */
      if (t > lirikBerikut && o.kegiatan !== 'tidur' && !jalan) {
        lirikMulai = t;
        lirikArah = kucing && !fokus ? 0 : (acak() < 0.5 ? -1 : 1) * (0.4 + acak() * 0.4);
        lirikBerikut = t + (kucing ? 5 : 8) + acak() * 12;
      }
      const lirik = t - lirikMulai < 1.8 && !(kucing && fokus);
      let pitch = pitchDasar + Math.sin(tt * 0.7) * 0.03;
      let yaw = Math.sin(tt * 0.31) * 0.08;
      if (lirik) {
        yaw = lirikArah;
        pitch = kucing && lirikArah === 0 ? -0.12 : pitchDasar * 0.4;
      }
      if (kucing && fokus) pitch = 0.2;
      kepala.rotation.x = halus(kepala.rotation.x, pitch, 0.08);
      kepala.rotation.y = halus(kepala.rotation.y, yaw, 0.06);

      if (o.kegiatan === 'tidur') {
        leher.position.y = halus(leher.position.y, 6.6, 0.1);
        leher.position.z = halus(leher.position.z, 2.4, 0.1);
        zzz.forEach((z, i) => {
          const u = (tt * 0.35 + i / 3) % 1;
          z.position.set(2 + u * 2, 13 + u * 5, 3 + Math.sin(u * 6) * 0.6);
          z.scale.setScalar(0.5 + u * 0.8);
          (z.material as THREE.MeshBasicMaterial).opacity = 1 - u;
        });
      }

      if (o.kegiatan === 'laptop') {
        const cepat = kucing && fokus ? 26 : 18;
        lengan.forEach((l, i) => (l.position.y = (kucing ? MEJA - 0.2 : 6.9) + Math.max(0, Math.sin(tt * cepat + i * Math.PI)) * 0.35));
      } else if (o.kegiatan === 'tulis') {
        lengan[0].rotation.y = Math.sin(tt * 6.5) * 0.06;
        lengan[0].rotation.x = Math.sin(tt * 13) * 0.025;
      }

      /* Membalik halaman. */
      if (halaman) {
        if (t > balikBerikut) {
          balikMulai = t;
          balikBerikut = t + 7 + acak() * 9;
        }
        const k = (t - balikMulai) / 0.9;
        halaman.visible = k >= 0 && k < 1;
        if (halaman.visible) {
          halaman.rotation.z = Math.PI * (1 - Math.pow(1 - k, 2));
          halaman.position.y = 0.62 + Math.sin(k * Math.PI) * 0.3;
        }
      }

      if (ekor) ekor.rotation.z = Math.sin(tt * (fokus ? 3.5 : 1.8)) * 0.25;
      if (ujungAntena) ujungAntena.visible = Math.sin(tt * 3) > -0.6;

      if (jalan) {
        const ayun = av.melangkah ? Math.sin(tt * 7) : 0;
        kaki.forEach((k, i) => (k.rotation.x = halus(k.rotation.x, (i ? -1 : 1) * ayun * 0.55, 0.3)));
        lengan.forEach((l, i) => (l.rotation.x = halus(l.rotation.x, (i ? 1 : -1) * ayun * 0.5, 0.3)));
        badan.position.y = av.melangkah ? Math.abs(Math.cos(tt * 7)) * 0.25 : 0;
        if (!av.melangkah) {
          kepala.rotation.x = halus(kepala.rotation.x, -0.15, 0.05);
          kepala.rotation.y = halus(kepala.rotation.y, Math.sin(tt * 0.5) * 0.35, 0.05);
        }
      }
      void dt;
    },
  };
  return av;
}
