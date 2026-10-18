/* ==========================================================================
   Suara ruang fokus, semuanya disintesis (tanpa berkas audio).

   Musik: jazz generatif yang tenang. Progresi akor berulang 8 birama, tiap
   birama diisi ulang secara acak sehingga tidak pernah persis sama.
   - 'perpus' (Starfield): trio lo-fi, electric piano (Rhodes FM + tremolo),
     bas betot walking, ride & brush, vibrafon sesekali, desis piringan hitam.
   - 'gunung' (Ranu Kumbolo): gitar akustik petik (Karplus-Strong), bas
     setengah-nada, brush & shaker lembut, seruling sesekali. Lebih lambat.

   Suara sekitar: dengung ruang + halaman dibalik (perpus); angin, riak air,
   dan kicau burung (gunung).

   Penjadwal memakai jam AudioContext dengan lookahead panjang supaya tetap
   mulus ketika tab di latar belakang (setInterval melambat ke 1 detik).
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
  /** Nada bas (MIDI). */
  b: number;
  /** Voicing tangan kanan (MIDI). */
  v: number[];
}

const PROGRESI: Record<GayaMusik, Akor[]> = {
  /* F mayor: Gm9 C13 Fmaj9 Dm9 | Bbmaj7 Am7 Gm9 C13sus */
  perpus: [
    { b: 43, v: [58, 62, 65, 69] },
    { b: 36, v: [58, 62, 64, 69] },
    { b: 41, v: [57, 60, 64, 67] },
    { b: 38, v: [53, 57, 60, 64] },
    { b: 46, v: [57, 62, 65, 69] },
    { b: 45, v: [55, 60, 64, 67] },
    { b: 43, v: [58, 62, 65, 69] },
    { b: 36, v: [58, 62, 65, 69] },
  ],
  /* D mayor, terbuka: Dmaj9 Bm11 Gmaj9 A13sus | Em9 F#m7 Gmaj7#11 A7sus4 */
  gunung: [
    { b: 38, v: [54, 57, 61, 64] },
    { b: 35, v: [57, 62, 64, 66] },
    { b: 43, v: [54, 57, 59, 62] },
    { b: 45, v: [55, 59, 62, 66] },
    { b: 40, v: [55, 59, 62, 66] },
    { b: 42, v: [52, 57, 61, 64] },
    { b: 43, v: [54, 59, 61, 66] },
    { b: 45, v: [55, 59, 62, 64] },
  ],
};
const TEMPO: Record<GayaMusik, number> = { perpus: 70, gunung: 62 };
const AYUN = 0.64; // swing: ketukan "and" jatuh di 64% ketukan

const hz = (m: number) => 440 * 2 ** ((m - 69) / 12);
const pilih = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export function buatAudio(): Audio {
  let ctx: AudioContext | null = null;
  let master: GainNode;
  let busMusik: GainNode;
  let busSekitar: GainNode;
  let gemaKirim: GainNode;
  let tremolo: GainNode;
  let rhodesLp: BiquadFilterNode;
  let derauPutih: AudioBuffer;
  let derauCokelat: AudioBuffer;

  let musikNyala = false;
  let sekitarNyala = false;
  const volume: Record<Lapis, number> = { musik: 0.55, sekitar: 0.45 };
  let gaya: GayaMusik = 'perpus';

  let detak = 0; // indeks ketukan
  let waktuBerikut = 0;
  let timer: number | null = null;
  let lapisSekitar: { berhenti(): void } | null = null;
  let kejadianSekitar = 0;
  let desis: AudioBufferSourceNode | null = null;

  /* ---------------- persiapan ---------------- */
  const siapkan = () => {
    if (ctx) return ctx;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const c = new AC();
    ctx = c;

    const kompres = c.createDynamicsCompressor();
    kompres.threshold.value = -18;
    kompres.ratio.value = 3;
    master = c.createGain();
    master.gain.value = 0.9;
    master.connect(kompres).connect(c.destination);

    busMusik = c.createGain();
    busMusik.gain.value = 0;
    busMusik.connect(master);
    busSekitar = c.createGain();
    busSekitar.gain.value = 0;
    busSekitar.connect(master);

    /* Gema: respons impuls dari derau yang meluruh. */
    const panjang = Math.floor(c.sampleRate * 2.8);
    const ir = c.createBuffer(2, panjang, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < panjang; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / panjang, 2.6);
    }
    const gema = c.createConvolver();
    gema.buffer = ir;
    gemaKirim = c.createGain();
    gemaKirim.gain.value = 0.28;
    gemaKirim.connect(gema).connect(busMusik);

    /* Jalur Rhodes & vibrafon: tremolo bersama → lowpass. */
    tremolo = c.createGain();
    const lfo = c.createOscillator();
    lfo.frequency.value = 4.3;
    const lfoG = c.createGain();
    lfoG.gain.value = 0.13;
    lfo.connect(lfoG).connect(tremolo.gain);
    lfo.start();
    rhodesLp = c.createBiquadFilter();
    rhodesLp.type = 'lowpass';
    rhodesLp.frequency.value = 2600;
    tremolo.connect(rhodesLp);
    rhodesLp.connect(busMusik);
    rhodesLp.connect(gemaKirim);

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

  const derau = (t: number, dur: number, tujuan: AudioNode, filter: BiquadFilterType, f: number, q: number, puncak: number, serang = 0.003) => {
    const c = ctx!;
    const s = c.createBufferSource();
    s.buffer = derauPutih;
    const fl = c.createBiquadFilter();
    fl.type = filter;
    fl.frequency.value = f;
    fl.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(puncak, t + serang);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl).connect(g).connect(tujuan);
    s.start(t, Math.random() * 0.5);
    s.stop(t + dur + 0.05);
  };

  /* ---------------- instrumen ---------------- */
  const rhodes = (t: number, m: number, vel: number, dur: number) => {
    const c = ctx!;
    const o = c.createOscillator();
    o.frequency.value = hz(m);
    const mod = c.createOscillator();
    mod.frequency.value = hz(m);
    const modG = c.createGain();
    modG.gain.setValueAtTime(hz(m) * 1.5 * vel, t);
    modG.gain.exponentialRampToValueAtTime(hz(m) * 0.04, t + 0.35);
    mod.connect(modG).connect(o.frequency);
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.085 * vel, t + 0.006);
    g.gain.setTargetAtTime(0.045 * vel, t + 0.02, 0.5);
    g.gain.setTargetAtTime(0, t + dur, 0.35);
    o.connect(g).connect(tremolo);
    o.start(t);
    mod.start(t);
    o.stop(t + dur + 2);
    mod.stop(t + dur + 2);
  };

  const vibrafon = (t: number, m: number, vel: number) => {
    const c = ctx!;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.07 * vel, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    g.connect(tremolo);
    for (const [k, a, d] of [[1, 1, 2.6], [4, 0.25, 0.25], [10, 0.06, 0.08]] as const) {
      const o = c.createOscillator();
      o.frequency.value = hz(m) * k;
      const og = c.createGain();
      og.gain.setValueAtTime(a, t);
      og.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(og).connect(g);
      o.start(t);
      o.stop(t + 2.7);
    }
  };

  const seruling = (t: number, m: number, vel: number, dur: number) => {
    const c = ctx!;
    const o = c.createOscillator();
    o.frequency.value = hz(m);
    const vib = c.createOscillator();
    vib.frequency.value = 5;
    const vibG = c.createGain();
    vibG.gain.setValueAtTime(0, t);
    vibG.gain.linearRampToValueAtTime(hz(m) * 0.006, t + 0.35);
    vib.connect(vibG).connect(o.frequency);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2200;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.05 * vel, t + 0.09);
    g.gain.setTargetAtTime(0, t + dur, 0.18);
    o.connect(lp).connect(g);
    g.connect(busMusik);
    g.connect(gemaKirim);
    o.start(t);
    vib.start(t);
    o.stop(t + dur + 1);
    vib.stop(t + dur + 1);
    derau(t, 0.12, g, 'bandpass', hz(m) * 2, 1, 0.08, 0.03);
  };

  /** Gitar petik: Karplus-Strong (letupan derau ke lingkar tunda berumpan balik). */
  const gitar = (t: number, m: number, vel: number) => {
    const c = ctx!;
    const f = hz(m);
    const s = c.createBufferSource();
    s.buffer = derauPutih;
    const letup = c.createGain();
    letup.gain.setValueAtTime(0.5 * vel, t);
    letup.gain.exponentialRampToValueAtTime(0.0001, t + Math.min(0.03, 2 / f + 0.004));
    const tunda = c.createDelay(0.05);
    tunda.delayTime.value = 1 / f;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2400 + vel * 1600;
    const umpan = c.createGain();
    umpan.gain.value = 0.986;
    const keluar = c.createGain();
    keluar.gain.setValueAtTime(0.55, t);
    keluar.gain.setTargetAtTime(0, t + 2.2, 0.4);
    s.connect(letup).connect(tunda);
    tunda.connect(lp).connect(umpan).connect(tunda);
    lp.connect(keluar);
    keluar.connect(busMusik);
    keluar.connect(gemaKirim);
    s.start(t, Math.random() * 0.5);
    s.stop(t + 0.05);
    const lepas = (t - c.currentTime + 4) * 1000;
    window.setTimeout(() => {
      tunda.disconnect();
      umpan.disconnect();
      lp.disconnect();
      keluar.disconnect();
    }, Math.max(0, lepas));
  };

  const bas = (t: number, m: number, vel: number, dur: number) => {
    const c = ctx!;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.32 * vel, t + 0.012);
    g.gain.setTargetAtTime(0.16 * vel, t + 0.03, 0.18);
    g.gain.setTargetAtTime(0, t + dur * 0.92, 0.07);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(900, t);
    lp.frequency.exponentialRampToValueAtTime(380, t + 0.25);
    for (const [tipe, k, a] of [['triangle', 1, 1], ['sine', 0.5, 0.6]] as const) {
      const o = c.createOscillator();
      o.type = tipe;
      o.frequency.value = hz(m) * k;
      const og = c.createGain();
      og.gain.value = a;
      o.connect(og).connect(lp);
      o.start(t);
      o.stop(t + dur + 0.6);
    }
    lp.connect(g).connect(busMusik);
  };

  const ride = (t: number, vel: number) => {
    derau(t, 0.42, busMusik, 'highpass', 7200, 0.5, 0.022 * vel);
    const c = ctx!;
    const o = c.createOscillator();
    o.type = 'square';
    o.frequency.value = 5200 + Math.random() * 80;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0035 * vel, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    const hp = c.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 4000;
    o.connect(hp).connect(g).connect(busMusik);
    o.start(t);
    o.stop(t + 0.32);
  };
  const brush = (t: number, vel: number) => derau(t, 0.32, busMusik, 'bandpass', 2600, 0.6, 0.05 * vel, 0.05);
  const shaker = (t: number, vel: number) => derau(t, 0.07, busMusik, 'highpass', 6500, 0.7, 0.012 * vel, 0.01);
  const kick = (t: number, vel: number) => {
    const c = ctx!;
    const o = c.createOscillator();
    o.frequency.setValueAtTime(95, t);
    o.frequency.exponentialRampToValueAtTime(44, t + 0.12);
    const g = c.createGain();
    g.gain.setValueAtTime(0.22 * vel, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    o.connect(g).connect(busMusik);
    o.start(t);
    o.stop(t + 0.36);
  };

  /* ---------------- penyusun birama ---------------- */
  const nadaAkor = (a: Akor) => {
    /* Nada akor yang ditaruh di rentang bas, di atas akarnya. */
    return [...new Set(a.v.map(n => a.b + ((((n - a.b) % 12) + 12) % 12)))].filter(n => n !== a.b).sort((x, y) => x - y);
  };
  const manusiawi = () => (Math.random() - 0.5) * 0.018;

  const jadwalBirama = (t0: number, bar: number) => {
    const prog = PROGRESI[gaya];
    const a = prog[bar % prog.length];
    const lanjut = prog[(bar + 1) % prog.length];
    const ketuk = 60 / TEMPO[gaya];
    const pada = (beat: number, and = false) => t0 + (beat + (and ? AYUN : 0)) * ketuk + manusiawi();
    const tones = nadaAkor(a);

    if (gaya === 'perpus') {
      /* Rhodes: pukulan akor dengan sedikit "strum", kadang antisipasi akor berikut. */
      const akor = (t: number, v: number[], vel: number, dur: number) => v.forEach((n, i) => rhodes(t + i * 0.011, n, vel * (0.85 + Math.random() * 0.2), dur));
      if (Math.random() < 0.88) akor(pada(0), a.v, 0.9, ketuk * (Math.random() < 0.5 ? 1.6 : 2.6));
      if (Math.random() < 0.35) akor(pada(1, true), a.v.slice(1), 0.6, ketuk * 0.6);
      if (Math.random() < 0.3) akor(pada(2), a.v, 0.65, ketuk * 1.2);
      if (Math.random() < 0.28) akor(pada(3, true), lanjut.v, 0.7, ketuk * 1.4);

      /* Bas walking: akar, nada akor, nada akor, pendekatan kromatis. */
      const garis = [a.b, pilih(tones) ?? a.b + 7, pilih([a.b + 7, ...tones]), lanjut.b + (Math.random() < 0.5 ? -1 : 1)];
      garis.forEach((n, i) => {
        let m = n;
        while (m > 50) m -= 12;
        while (m < 31) m += 12;
        bas(pada(i), m, i === 0 ? 1 : 0.8, ketuk);
      });

      /* Ride: ding, ding-ga, ding, ding-ga. Brush di 2 & 4, kick halus. */
      for (let i = 0; i < 4; i++) {
        ride(pada(i), i % 2 ? 0.7 : 1);
        if (i % 2 === 1) {
          ride(pada(i, true), 0.5);
          brush(pada(i), 0.9);
        }
      }
      if (Math.random() < 0.6) kick(pada(0), 0.8);
      if (Math.random() < 0.25) kick(pada(2), 0.6);

      /* Vibrafon: frase pendek sesekali, dari nada akor + nona. */
      if (bar % 8 !== 7 && Math.random() < 0.42) frase(t0, ketuk, a, 'vibrafon');
    } else {
      /* Gitar: arpeggio terbuka, satu nada tiap ketukan + sesekali di "and". */
      const v = [a.b + 12, ...a.v];
      const pola = [0, 2, 1, 3, 2, 4, 3, 1];
      for (let i = 0; i < 4; i++) {
        gitar(pada(i), v[pola[i * 2] % v.length], i === 0 ? 0.95 : 0.7);
        if (Math.random() < 0.65) gitar(pada(i, true), v[pola[i * 2 + 1] % v.length], 0.5);
      }
      /* Bas setengah-nada: akar lalu kelima. */
      let akar = a.b;
      while (akar > 45) akar -= 12;
      bas(pada(0), akar, 0.9, ketuk * 1.9);
      bas(pada(2), akar + 7 > 50 ? akar - 5 : akar + 7, 0.7, ketuk * 1.9);
      brush(pada(1), 0.55);
      brush(pada(3), 0.55);
      for (let i = 0; i < 4; i++) if (Math.random() < 0.7) shaker(pada(i, true), 0.6);
      if (bar % 8 !== 7 && Math.random() < 0.32) frase(t0, ketuk, a, 'seruling');
    }
  };

  /** Frase melodi: 2–5 nada pada kisi seperdelapan berayun, di register atas. */
  const frase = (t0: number, ketuk: number, a: Akor, alat: 'vibrafon' | 'seruling') => {
    const kelas = [...new Set([...a.v, a.v[0] + 2].map(n => n % 12))];
    const kandidat: number[] = [];
    for (let m = 67; m <= 81; m++) if (kelas.includes(m % 12)) kandidat.push(m);
    let n = pilih(kandidat);
    const jumlah = 2 + Math.floor(Math.random() * 4);
    let slot = Math.floor(Math.random() * 3);
    for (let i = 0; i < jumlah && slot < 8; i++) {
      const t = t0 + (Math.floor(slot / 2) + (slot % 2 ? AYUN : 0)) * ketuk + manusiawi();
      const lama = ketuk * (i === jumlah - 1 ? 1.6 : 0.55);
      if (alat === 'vibrafon') vibrafon(t, n, 0.8 + Math.random() * 0.2);
      else seruling(t, n, 0.8, lama);
      const idx = kandidat.indexOf(n) + (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 2));
      n = kandidat[Math.max(0, Math.min(kandidat.length - 1, idx))];
      slot += 1 + Math.floor(Math.random() * 2);
    }
  };

  /* ---------------- suara sekitar ---------------- */
  const mulaiSekitar = () => {
    const c = ctx!;
    lapisSekitar?.berhenti();
    const simpul: AudioScheduledSourceNode[] = [];
    const sambung: AudioNode[] = [];
    const lapis = c.createGain();
    lapis.gain.value = 0;
    lapis.gain.setTargetAtTime(1, c.currentTime, 1.2);
    lapis.connect(busSekitar);
    sambung.push(lapis);
    const putar = (buf: AudioBuffer, f: BiquadFilterType, freq: number, g: number) => {
      const s = c.createBufferSource();
      s.buffer = buf;
      s.loop = true;
      const fl = c.createBiquadFilter();
      fl.type = f;
      fl.frequency.value = freq;
      const gn = c.createGain();
      gn.gain.value = g;
      s.connect(fl).connect(gn).connect(lapis);
      s.start(c.currentTime, Math.random() * 3);
      simpul.push(s);
      sambung.push(fl, gn);
      return { fl, gn };
    };
    const lfo = (target: AudioParam, frek: number, dalam: number) => {
      const o = c.createOscillator();
      o.frequency.value = frek;
      const g = c.createGain();
      g.gain.value = dalam;
      o.connect(g).connect(target);
      o.start();
      simpul.push(o);
      sambung.push(g);
    };

    if (gaya === 'perpus') {
      putar(derauCokelat, 'lowpass', 650, 0.22);
    } else {
      /* Angin berembus pelan. */
      const angin = putar(derauCokelat, 'bandpass', 520, 0.5);
      angin.fl.Q.value = 0.6;
      lfo(angin.fl.frequency, 0.07, 220);
      lfo(angin.gn.gain, 0.05, 0.22);
      /* Riak air di tiang dermaga. */
      const riak = putar(derauCokelat, 'lowpass', 300, 0.35);
      lfo(riak.gn.gain, 0.31, 0.18);
      lfo(riak.gn.gain, 0.47, 0.12);
    }
    kejadianSekitar = c.currentTime + 2;
    lapisSekitar = {
      berhenti() {
        const t = c.currentTime;
        lapis.gain.setTargetAtTime(0, t, 0.5);
        window.setTimeout(() => {
          simpul.forEach(s => {
            try {
              s.stop();
            } catch {
              /* sudah berhenti */
            }
          });
          sambung.forEach(n => n.disconnect());
        }, 3000);
      },
    };
  };

  const kicau = (t: number) => {
    const c = ctx!;
    const pan = c.createStereoPanner();
    pan.pan.value = Math.random() * 1.6 - 0.8;
    pan.connect(busSekitar);
    const dasar = 2600 + Math.random() * 1800;
    const n = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < n; i++) {
      const s = t + i * (0.11 + Math.random() * 0.08);
      const o = c.createOscillator();
      o.frequency.setValueAtTime(dasar, s);
      o.frequency.exponentialRampToValueAtTime(dasar * (1.25 + Math.random() * 0.3), s + 0.04);
      o.frequency.exponentialRampToValueAtTime(dasar * 0.85, s + 0.09);
      const g = c.createGain();
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(0.03, s + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, s + 0.1);
      o.connect(g).connect(pan);
      o.start(s);
      o.stop(s + 0.12);
    }
    window.setTimeout(() => pan.disconnect(), (t - c.currentTime + 2) * 1000);
  };

  /* ---------------- penjadwal ---------------- */
  const LOOKAHEAD = 1.6;
  const jalan = () => {
    const c = ctx;
    if (!c) return;
    if (musikNyala) {
      const ketuk = 60 / TEMPO[gaya];
      if (waktuBerikut < c.currentTime) waktuBerikut = c.currentTime + 0.1;
      while (waktuBerikut < c.currentTime + LOOKAHEAD) {
        if (detak % 4 === 0) jadwalBirama(waktuBerikut, detak / 4);
        waktuBerikut += ketuk;
        detak++;
      }
    }
    if (sekitarNyala && c.currentTime + LOOKAHEAD > kejadianSekitar) {
      const t = Math.max(kejadianSekitar, c.currentTime + 0.05);
      if (gaya === 'gunung') {
        kicau(t);
        kejadianSekitar = t + 2.5 + Math.random() * 6;
      } else {
        derau(t, 0.45, busSekitar, 'bandpass', 1800 + Math.random() * 1200, 0.8, 0.025, 0.12); // halaman dibalik
        kejadianSekitar = t + 7 + Math.random() * 14;
      }
    }
  };
  const pastikanJalan = () => {
    if (timer == null) timer = window.setInterval(jalan, 120);
    jalan();
  };

  const desisPiringan = (nyala: boolean) => {
    const c = ctx!;
    if (nyala && !desis && gaya === 'perpus') {
      const buf = c.createBuffer(1, c.sampleRate * 3, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() < 0.0009 ? (Math.random() * 2 - 1) * 0.9 : (Math.random() * 2 - 1) * 0.015;
      desis = c.createBufferSource();
      desis.buffer = buf;
      desis.loop = true;
      const hp = c.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 1200;
      const g = c.createGain();
      g.gain.value = 0.35;
      desis.connect(hp).connect(g).connect(busMusik);
      desis.start();
    } else if ((!nyala || gaya !== 'perpus') && desis) {
      desis.stop();
      desis = null;
    }
  };

  return {
    aturMusik(nyala) {
      const c = siapkan();
      void c.resume();
      musikNyala = nyala;
      busMusik.gain.setTargetAtTime(nyala ? volume.musik : 0, c.currentTime, nyala ? 0.8 : 0.25);
      if (nyala) {
        waktuBerikut = c.currentTime + 0.15;
        detak = 0;
      }
      desisPiringan(nyala);
      pastikanJalan();
    },
    aturSekitar(nyala) {
      const c = siapkan();
      void c.resume();
      sekitarNyala = nyala;
      busSekitar.gain.setTargetAtTime(nyala ? volume.sekitar : 0, c.currentTime, 0.6);
      if (nyala && !lapisSekitar) mulaiSekitar();
      pastikanJalan();
    },
    aturVolume(lapis, v) {
      volume[lapis] = v;
      if (!ctx) return;
      const bus = lapis === 'musik' ? busMusik : busSekitar;
      const on = lapis === 'musik' ? musikNyala : sekitarNyala;
      bus.gain.setTargetAtTime(on ? v : 0, ctx.currentTime, 0.15);
    },
    aturGaya(g) {
      if (g === gaya) return;
      gaya = g;
      if (!ctx) return;
      detak = 0;
      waktuBerikut = Math.max(waktuBerikut, ctx.currentTime + 0.2);
      desisPiringan(musikNyala);
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
        g.gain.linearRampToValueAtTime(0.12, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
        o.connect(g).connect(master);
        o.start(t);
        o.stop(t + 2.3);
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
