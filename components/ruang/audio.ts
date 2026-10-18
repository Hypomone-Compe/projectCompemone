/* ==========================================================================
   Suara ruang fokus, semuanya disintesis (tanpa berkas audio).

   Musik: jazz generatif yang tenang. Progresi 8 birama, tiap birama diisi
   ulang secara acak sehingga tidak pernah persis sama.
   - 'perpus' (Starfield): electric piano lembut, bas, brush, vibrafon sesekali.
   - 'gunung' (Ranu Kumbolo): gitar petik, bas, shaker halus, seruling sesekali.

   Semua instrumen dibangun dari gelombang sinus (aditif) dengan amplop halus.
   Sengaja TANPA lingkar umpan balik (DelayNode dalam siklus dijepit minimal
   128 sampel oleh Web Audio, nada tinggi jadi sumbang) dan tanpa gelombang
   kotak. Keluaran musik melewati lowpass hangat sebelum kompresor.

   Suara sekitar: dengung ruang + halaman dibalik (perpus); angin, riak air,
   dan kicau burung (gunung).

   `buatMesinMusik` bisa dijalankan di OfflineAudioContext untuk diuji
   (puncak, kenyaringan, kekasaran) tanpa harus mendengarkan.
   ========================================================================== */

export type GayaMusik = 'perpus' | 'gunung';
type Lapis = 'musik' | 'sekitar';

export interface Audio {
  aturMusik(nyala: boolean): void;
  aturSekitar(nyala: boolean): void;
  aturVolume(lapis: Lapis, v: number): void;
  aturGaya(g: GayaMusik): void;
  denting(): void;
  tutup(): void;
}

interface Akor {
  /** Nada akar bas (MIDI). */
  b: number;
  /** Voicing tangan kanan (MIDI). */
  v: number[];
}

const PROGRESI: Record<GayaMusik, Akor[]> = {
  /* F mayor: Gm9 C13 Fmaj9 Dm9 | Bbmaj7 Am7 Gm9 C9sus */
  perpus: [
    { b: 43, v: [58, 62, 65, 69] },
    { b: 36, v: [58, 62, 64, 69] },
    { b: 41, v: [57, 60, 64, 67] },
    { b: 38, v: [53, 57, 60, 64] },
    { b: 46, v: [57, 62, 65, 69] },
    { b: 45, v: [55, 60, 64, 67] },
    { b: 43, v: [58, 62, 65, 69] },
    { b: 36, v: [58, 62, 65, 67] },
  ],
  /* D mayor, terbuka: Dmaj9 Bm7 Gmaj9 Asus | Em9 F#m7 Gmaj7 A7sus */
  gunung: [
    { b: 38, v: [54, 57, 61, 64] },
    { b: 35, v: [54, 57, 62, 66] },
    { b: 43, v: [54, 57, 59, 62] },
    { b: 45, v: [52, 57, 62, 64] },
    { b: 40, v: [55, 59, 62, 66] },
    { b: 42, v: [52, 57, 61, 64] },
    { b: 43, v: [54, 59, 62, 66] },
    { b: 45, v: [55, 57, 62, 64] },
  ],
};
export const TEMPO: Record<GayaMusik, number> = { perpus: 72, gunung: 66 };
const AYUN = 0.62;

const hz = (m: number) => 440 * 2 ** ((m - 69) / 12);
const pilih = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

/** Nada `m` digeser per oktaf supaya berada di rentang [lo, hi]. */
const keRentang = (m: number, lo: number, hi: number) => {
  let n = m;
  while (n > hi) n -= 12;
  while (n < lo) n += 12;
  return n;
};

/* ======================================================================
   Mesin musik: instrumen + penyusun birama. Bekerja di AudioContext apa
   pun (juga OfflineAudioContext), keluar ke `tujuan`.
   ====================================================================== */
export function buatMesinMusik(ctx: BaseAudioContext, tujuan: AudioNode) {
  /* Gema lembut. */
  const panjang = Math.floor(ctx.sampleRate * 2.4);
  const ir = ctx.createBuffer(2, panjang, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < panjang; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / panjang, 3);
  }
  const gema = ctx.createConvolver();
  gema.buffer = ir;
  const basah = ctx.createGain();
  basah.gain.value = 0.18;
  gema.connect(basah).connect(tujuan);
  const kering = ctx.createGain();
  kering.gain.value = 1;
  kering.connect(tujuan);
  kering.connect(gema);

  /* Jalur piano & vibrafon: tremolo tipis + lowpass. */
  const tremolo = ctx.createGain();
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 4.4;
  const lfoG = ctx.createGain();
  lfoG.gain.value = 0.05;
  lfo.connect(lfoG).connect(tremolo.gain);
  lfo.start();
  const pianoLp = ctx.createBiquadFilter();
  pianoLp.type = 'lowpass';
  pianoLp.frequency.value = 2200;
  pianoLp.Q.value = 0.5;
  tremolo.connect(pianoLp).connect(kering);

  const derau = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const dd = derau.getChannelData(0);
  for (let i = 0; i < dd.length; i++) dd[i] = Math.random() * 2 - 1;

  /** Satu suara aditif: daftar [kelipatan frekuensi, amplitudo, lama luruh (s)]. */
  const aditif = (t: number, f: number, puncak: number, parsial: [number, number, number][], lepas: number, keluar: AudioNode, serang = 0.005) => {
    const akhir = t + Math.max(...parsial.map(p => p[2])) + 0.1;
    for (const [k, a, luruh] of parsial) {
      if (f * k > 12000) continue;
      const o = ctx.createOscillator();
      o.frequency.value = f * k;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(puncak * a, t + serang);
      g.gain.setTargetAtTime(0, t + serang, luruh / 4);
      if (lepas < akhir) g.gain.setTargetAtTime(0, lepas, 0.12);
      o.connect(g).connect(keluar);
      o.start(t);
      o.stop(Math.min(akhir, lepas + 0.8));
    }
  };

  const piano = (t: number, m: number, vel: number, dur: number) =>
    aditif(t, hz(m), 0.045 * vel, [[1, 1, 3.2], [2, 0.25, 1.4], [3, 0.06, 0.6], [7, 0.035, 0.08]], t + dur, tremolo, 0.006);

  const vibrafon = (t: number, m: number, vel: number) =>
    aditif(t, hz(m), 0.04 * vel, [[1, 1, 2.8], [4, 0.12, 0.35]], t + 3, tremolo, 0.004);

  const gitar = (t: number, m: number, vel: number) => {
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(3200, t);
    lp.frequency.exponentialRampToValueAtTime(1100, t + 0.35);
    lp.connect(kering);
    aditif(t, hz(m), 0.042 * vel, [[1, 1, 2.4], [2, 0.42, 1.3], [3, 0.2, 0.7], [4, 0.09, 0.4], [5, 0.04, 0.25]], t + 2.6, lp, 0.003);
  };

  const bas = (t: number, m: number, vel: number, dur: number) => {
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 520;
    lp.connect(kering);
    aditif(t, hz(m), 0.16 * vel, [[1, 1, 2.2], [2, 0.3, 0.8]], t + dur, lp, 0.012);
  };

  const seruling = (t: number, m: number, vel: number, dur: number) => {
    const f = hz(m);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.03 * vel, t + 0.14);
    g.gain.setTargetAtTime(0, t + dur, 0.2);
    g.connect(kering);
    const vib = ctx.createOscillator();
    vib.frequency.value = 4.8;
    const vibG = ctx.createGain();
    vibG.gain.setValueAtTime(0, t);
    vibG.gain.linearRampToValueAtTime(f * 0.004, t + 0.4);
    vib.connect(vibG);
    for (const [k, a] of [[1, 1], [2, 0.12]] as const) {
      const o = ctx.createOscillator();
      o.frequency.value = f * k;
      vibG.connect(o.frequency);
      const og = ctx.createGain();
      og.gain.value = a;
      o.connect(og).connect(g);
      o.start(t);
      o.stop(t + dur + 1.2);
    }
    vib.start(t);
    vib.stop(t + dur + 1.2);
  };

  const desah = (t: number, dur: number, f: number, q: number, puncak: number, serang: number, tipe: BiquadFilterType = 'bandpass') => {
    const s = ctx.createBufferSource();
    s.buffer = derau;
    const fl = ctx.createBiquadFilter();
    fl.type = tipe;
    fl.frequency.value = f;
    fl.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(puncak, t + serang);
    g.gain.setTargetAtTime(0, t + serang, (dur - serang) / 3);
    s.connect(fl).connect(g).connect(kering);
    s.start(t, Math.random() * 0.5);
    s.stop(t + dur + 0.1);
  };
  const brush = (t: number, vel: number) => desah(t, 0.32, 2200, 0.5, 0.018 * vel, 0.06);
  const tik = (t: number, vel: number) => desah(t, 0.08, 7500, 0.6, 0.006 * vel, 0.002, 'highpass');

  const manusiawi = () => (Math.random() - 0.5) * 0.014;

  /** Frase melodi: 2–4 nada dari nada akor + nona, register atas, bergerak bertahap. */
  const frase = (t0: number, ketuk: number, a: Akor, alat: 'vibrafon' | 'seruling') => {
    const kelas = new Set([...a.v, a.v[0] + 2].map(n => ((n % 12) + 12) % 12));
    const kandidat: number[] = [];
    for (let m = 69; m <= 81; m++) if (kelas.has(m % 12)) kandidat.push(m);
    let i = Math.floor(Math.random() * kandidat.length);
    const jumlah = 2 + Math.floor(Math.random() * 3);
    let slot = 1 + Math.floor(Math.random() * 2);
    for (let k = 0; k < jumlah && slot < 8; k++) {
      const t = t0 + (Math.floor(slot / 2) + (slot % 2 ? AYUN : 0)) * ketuk + manusiawi();
      const terakhir = k === jumlah - 1;
      if (alat === 'vibrafon') vibrafon(t, kandidat[i], 0.75 + Math.random() * 0.2);
      else seruling(t, kandidat[i], 0.8, ketuk * (terakhir ? 1.8 : 0.9));
      i = Math.max(0, Math.min(kandidat.length - 1, i + (Math.random() < 0.5 ? -1 : 1)));
      slot += 2;
    }
  };

  /** Menjadwalkan satu birama berawal di t0. */
  const birama = (t0: number, bar: number, gaya: GayaMusik) => {
    const prog = PROGRESI[gaya];
    const a = prog[bar % prog.length];
    const lanjut = prog[(bar + 1) % prog.length];
    const ketuk = 60 / TEMPO[gaya];
    const pada = (beat: number, and = false) => t0 + (beat + (and ? AYUN : 0)) * ketuk + manusiawi();

    /* Bas: akar di ketuk 1, kelima di ketuk 3, kadang nada pendekatan ke akor berikut. */
    const akar = keRentang(a.b, 33, 45);
    const akarLanjut = keRentang(lanjut.b, 33, 45);
    bas(pada(0), akar, 1, ketuk * 1.9);
    const kelima = akar + 7 <= 50 ? akar + 7 : akar - 5;
    if (gaya === 'perpus' && Math.random() < 0.5) {
      bas(pada(2), kelima, 0.8, ketuk * 0.95);
      bas(pada(3), akarLanjut - 1, 0.7, ketuk * 0.9);
    } else bas(pada(2), kelima, 0.8, ketuk * 1.9);

    if (gaya === 'perpus') {
      /* Piano: satu akor lembut per birama (digulung tipis), kadang diulang pelan. */
      const panjangAkor = Math.random() < 0.6 ? ketuk * 3.6 : ketuk * 1.8;
      a.v.forEach((n, i) => piano(pada(0) + i * 0.014, n, 0.8 + Math.random() * 0.15, panjangAkor));
      if (panjangAkor < ketuk * 2 && Math.random() < 0.6) a.v.slice(1).forEach((n, i) => piano(pada(2) + i * 0.012, n, 0.55, ketuk * 1.7));
      /* Brush di 2 & 4, tik ride halus. */
      brush(pada(1), 1);
      brush(pada(3), 1);
      for (let i = 0; i < 4; i++) {
        tik(pada(i), i % 2 ? 0.7 : 1);
        if (i % 2 === 1) tik(pada(i, true), 0.5);
      }
      if (bar % 8 !== 7 && Math.random() < 0.3) frase(t0, ketuk, a, 'vibrafon');
    } else {
      /* Gitar: arpeggio naik-turun, enam petikan per birama. */
      const v = [keRentang(a.b, 45, 52) + 12, ...a.v].sort((x, y) => x - y);
      const urut = [0, 1, 2, 3, 2, 1];
      const ketukan: [number, boolean][] = [[0, false], [0, true], [1, false], [2, false], [2, true], [3, false]];
      ketukan.forEach(([b, and], i) => gitar(pada(b, and), v[urut[i] % v.length], i === 0 ? 0.95 : 0.65 + Math.random() * 0.15));
      brush(pada(1), 0.6);
      brush(pada(3), 0.6);
      for (let i = 0; i < 4; i++) if (Math.random() < 0.6) tik(pada(i, true), 0.6);
      if (bar % 8 !== 7 && Math.random() < 0.25) frase(t0, ketuk, a, 'seruling');
    }
  };

  return { birama, ketuk: (g: GayaMusik) => 60 / TEMPO[g] };
}

/* ======================================================================
   Audio langsung: mesin musik + suara sekitar + penjadwal.
   ====================================================================== */
export function buatAudio(): Audio {
  let ctx: AudioContext | null = null;
  let master: GainNode;
  let busMusik: GainNode;
  let busSekitar: GainNode;
  let mesin: ReturnType<typeof buatMesinMusik>;
  let derauCokelat: AudioBuffer;
  let derauPutih: AudioBuffer;

  let musikNyala = false;
  let sekitarNyala = false;
  const volume: Record<Lapis, number> = { musik: 0.55, sekitar: 0.45 };
  let gaya: GayaMusik = 'perpus';

  let bar = 0;
  let waktuBerikut = 0;
  let timer: number | null = null;
  let lapisSekitar: { berhenti(): void } | null = null;
  let kejadianSekitar = 0;

  const siapkan = () => {
    if (ctx) return ctx;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const c = new AC();
    ctx = c;
    const kompres = c.createDynamicsCompressor();
    kompres.threshold.value = -14;
    kompres.ratio.value = 2.5;
    master = c.createGain();
    master.gain.value = 0.85;
    master.connect(kompres).connect(c.destination);

    busMusik = c.createGain();
    busMusik.gain.value = 0;
    const hangat = c.createBiquadFilter();
    hangat.type = 'lowpass';
    hangat.frequency.value = 4800;
    /* Instrumen sengaja pelan di sumbernya (ruang aman dari clipping), dinaikkan di sini. */
    const angkat = c.createGain();
    angkat.gain.value = 2.2;
    busMusik.connect(hangat).connect(angkat).connect(master);
    busSekitar = c.createGain();
    busSekitar.gain.value = 0;
    busSekitar.connect(master);
    mesin = buatMesinMusik(c, busMusik);

    derauPutih = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const dp = derauPutih.getChannelData(0);
    for (let i = 0; i < dp.length; i++) dp[i] = Math.random() * 2 - 1;
    derauCokelat = c.createBuffer(2, c.sampleRate * 4, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = derauCokelat.getChannelData(ch);
      let akhir = 0;
      for (let i = 0; i < d.length; i++) {
        akhir = (akhir + 0.02 * (Math.random() * 2 - 1)) / 1.02;
        d[i] = akhir * 3.2;
      }
    }
    return c;
  };

  /* ---------------- suara sekitar ---------------- */
  const mulaiSekitar = () => {
    const c = ctx!;
    lapisSekitar?.berhenti();
    const sumber: AudioScheduledSourceNode[] = [];
    const simpul: AudioNode[] = [];
    const lapis = c.createGain();
    lapis.gain.value = 0;
    lapis.gain.setTargetAtTime(1, c.currentTime, 1.2);
    lapis.connect(busSekitar);
    simpul.push(lapis);
    const putar = (f: BiquadFilterType, freq: number, g: number, q = 0.7) => {
      const s = c.createBufferSource();
      s.buffer = derauCokelat;
      s.loop = true;
      const fl = c.createBiquadFilter();
      fl.type = f;
      fl.frequency.value = freq;
      fl.Q.value = q;
      const gn = c.createGain();
      gn.gain.value = g;
      s.connect(fl).connect(gn).connect(lapis);
      s.start(c.currentTime, Math.random() * 3);
      sumber.push(s);
      simpul.push(fl, gn);
      return { fl, gn };
    };
    const lfo = (target: AudioParam, frek: number, dalam: number) => {
      const o = c.createOscillator();
      o.frequency.value = frek;
      const g = c.createGain();
      g.gain.value = dalam;
      o.connect(g).connect(target);
      o.start();
      sumber.push(o);
      simpul.push(g);
    };
    if (gaya === 'perpus') {
      putar('lowpass', 500, 0.2);
    } else {
      const angin = putar('bandpass', 480, 0.4, 0.5);
      lfo(angin.fl.frequency, 0.07, 160);
      lfo(angin.gn.gain, 0.05, 0.16);
      const riak = putar('lowpass', 280, 0.3);
      lfo(riak.gn.gain, 0.29, 0.12);
      lfo(riak.gn.gain, 0.43, 0.08);
    }
    kejadianSekitar = c.currentTime + 2;
    lapisSekitar = {
      berhenti() {
        lapis.gain.setTargetAtTime(0, c.currentTime, 0.5);
        window.setTimeout(() => {
          sumber.forEach(s => {
            try {
              s.stop();
            } catch {
              /* sudah berhenti */
            }
          });
          simpul.forEach(n => n.disconnect());
        }, 3000);
      },
    };
  };

  const halaman = (t: number) => {
    const c = ctx!;
    const s = c.createBufferSource();
    s.buffer = derauPutih;
    const fl = c.createBiquadFilter();
    fl.type = 'bandpass';
    fl.frequency.value = 1500 + Math.random() * 800;
    fl.Q.value = 0.8;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.02, t + 0.12);
    g.gain.setTargetAtTime(0, t + 0.15, 0.08);
    s.connect(fl).connect(g).connect(busSekitar);
    s.start(t);
    s.stop(t + 0.6);
  };

  const kicau = (t: number) => {
    const c = ctx!;
    const pan = c.createStereoPanner();
    pan.pan.value = Math.random() * 1.4 - 0.7;
    pan.connect(busSekitar);
    const dasar = 2400 + Math.random() * 1200;
    const n = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const s = t + i * (0.12 + Math.random() * 0.08);
      const o = c.createOscillator();
      o.frequency.setValueAtTime(dasar, s);
      o.frequency.linearRampToValueAtTime(dasar * 1.25, s + 0.04);
      o.frequency.linearRampToValueAtTime(dasar * 0.9, s + 0.09);
      const g = c.createGain();
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(0.012, s + 0.015);
      g.gain.setTargetAtTime(0, s + 0.05, 0.02);
      o.connect(g).connect(pan);
      o.start(s);
      o.stop(s + 0.2);
    }
    window.setTimeout(() => pan.disconnect(), (t - c.currentTime + 2) * 1000);
  };

  /* ---------------- penjadwal ---------------- */
  const LOOKAHEAD = 1.6;
  const jalan = () => {
    const c = ctx;
    if (!c) return;
    if (musikNyala) {
      if (waktuBerikut < c.currentTime) waktuBerikut = c.currentTime + 0.1;
      while (waktuBerikut < c.currentTime + LOOKAHEAD) {
        mesin.birama(waktuBerikut, bar, gaya);
        waktuBerikut += mesin.ketuk(gaya) * 4;
        bar++;
      }
    }
    if (sekitarNyala && c.currentTime + LOOKAHEAD > kejadianSekitar) {
      const t = Math.max(kejadianSekitar, c.currentTime + 0.05);
      if (gaya === 'gunung') {
        kicau(t);
        kejadianSekitar = t + 3 + Math.random() * 6;
      } else {
        halaman(t);
        kejadianSekitar = t + 8 + Math.random() * 14;
      }
    }
  };
  const pastikanJalan = () => {
    if (timer == null) timer = window.setInterval(jalan, 120);
    jalan();
  };

  return {
    aturMusik(nyala) {
      const c = siapkan();
      void c.resume();
      if (nyala && !musikNyala) {
        waktuBerikut = c.currentTime + 0.15;
        bar = 0;
      }
      musikNyala = nyala;
      busMusik.gain.cancelScheduledValues(c.currentTime);
      busMusik.gain.setTargetAtTime(nyala ? volume.musik : 0, c.currentTime, nyala ? 0.8 : 0.25);
      pastikanJalan();
    },
    aturSekitar(nyala) {
      const c = siapkan();
      void c.resume();
      sekitarNyala = nyala;
      busSekitar.gain.cancelScheduledValues(c.currentTime);
      busSekitar.gain.setTargetAtTime(nyala ? volume.sekitar : 0, c.currentTime, 0.6);
      if (nyala && !lapisSekitar) mulaiSekitar();
      pastikanJalan();
    },
    aturVolume(lapis, v) {
      volume[lapis] = v;
      if (!ctx) return;
      const bus = lapis === 'musik' ? busMusik : busSekitar;
      const on = lapis === 'musik' ? musikNyala : sekitarNyala;
      bus.gain.cancelScheduledValues(ctx.currentTime);
      bus.gain.setTargetAtTime(on ? v : 0, ctx.currentTime, 0.15);
    },
    aturGaya(g) {
      if (g === gaya) return;
      gaya = g;
      if (!ctx) return;
      bar = 0;
      if (lapisSekitar) {
        lapisSekitar.berhenti();
        lapisSekitar = null;
        if (sekitarNyala) mulaiSekitar();
      }
    },
    denting() {
      const c = siapkan();
      void c.resume();
      [880, 1318.5, 1760].forEach((f, i) => {
        const o = c.createOscillator();
        const g = c.createGain();
        o.frequency.value = f;
        const t = c.currentTime + i * 0.18;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.08, t + 0.02);
        g.gain.setTargetAtTime(0, t + 0.03, 0.5);
        o.connect(g).connect(master);
        o.start(t);
        o.stop(t + 2.5);
      });
    },
    tutup() {
      if (timer != null) window.clearInterval(timer);
      timer = null;
      void ctx?.close();
      ctx = null;
    },
  };
}
