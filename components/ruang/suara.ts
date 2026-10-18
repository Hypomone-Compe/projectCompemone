/* Suasana ruang baca: derau cokelat yang diredam (dengung ruangan besar) dan
   denting lembut saat sesi selesai. Semua disintesis, tanpa berkas audio. */

export interface Suara {
  nyalakan(): void;
  matikan(): void;
  denting(): void;
  tutup(): void;
}

export function buatSuara(): Suara {
  let ctx: AudioContext | null = null;
  let gain: GainNode | null = null;

  const siapkan = () => {
    if (ctx) return ctx;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    const panjang = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(2, panjang, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let akhir = 0;
      for (let i = 0; i < panjang; i++) {
        akhir = (akhir + 0.02 * (Math.random() * 2 - 1)) / 1.02;
        d[i] = akhir * 3.2;
      }
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 700;
    gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(lp).connect(gain).connect(ctx.destination);
    src.start();
    return ctx;
  };

  return {
    nyalakan() {
      const c = siapkan();
      void c.resume();
      gain!.gain.setTargetAtTime(0.22, c.currentTime, 0.8);
    },
    matikan() {
      if (!ctx || !gain) return;
      gain.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    },
    denting() {
      const c = siapkan();
      void c.resume();
      [880, 1318.5, 1760].forEach((f, i) => {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        const t = c.currentTime + i * 0.18;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.12, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
        o.connect(g).connect(c.destination);
        o.start(t);
        o.stop(t + 2.3);
      });
    },
    tutup() {
      void ctx?.close();
      ctx = null;
      gain = null;
    },
  };
}
