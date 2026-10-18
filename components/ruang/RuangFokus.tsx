'use client';

/**
 * Ruang fokus: sudut pandang orang pertama di perpustakaan 3D satu layar penuh.
 * Kita duduk di meja panjang, si kucing hitam di seberang, teman-teman belajar
 * lain di sekitar. Seret (mouse/jari) atau tombol panah untuk menoleh, roda
 * mouse / cubit untuk memperbesar. Timer sesi fokus mengambang di bawah dan
 * mencatat sesi ke halaman Harian.
 */
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Maximize2, MapPin, Minimize2, Move, SlidersHorizontal, Volume2, VolumeX } from 'lucide-react';
import { META, shortName } from '@/lib/courses/meta';
import { todayYmd } from '@/lib/kalender';
import { TEMPAT, tempatDari } from '@/lib/ruang';
import { addFokus } from '@/lib/store';
import { cn } from '@/lib/utils';
import { buatSuara, type Suara } from './suara';
import { useTimerFokus } from './useTimerFokus';

const PRESET = [25, 50, 90];
const KACA = 'border border-[rgba(238,240,251,0.14)] bg-[rgba(12,10,18,0.55)] shadow-glass-soft backdrop-blur-glass';
const TOMBOL_IKON = cn(KACA, 'grid h-11 w-11 place-items-center rounded-full text-ink transition-colors hover:bg-[rgba(238,240,251,0.14)]');
const AKSEN = '#f2c46b';

const jepit = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export default function RuangFokus() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fokusRef = useRef(false);
  const suara = useRef<Suara | null>(null);
  const [siap, setSiap] = useState(false);
  const [gagal, setGagal] = useState(false);
  const [petunjuk, setPetunjuk] = useState(true);
  const [suaraNyala, setSuaraNyala] = useState(false);
  const [penuh, setPenuh] = useState(false);
  const [bisaPenuh, setBisaPenuh] = useState(false);
  const [diam, setDiam] = useState(false);
  const [atur, setAtur] = useState(false);
  const [pilihTempat, setPilihTempat] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
  const tempat = tempatDari('starfield');

  const selesai = useCallback(
    (menit: number, cid: string, label: string) => {
      addFokus({ tanggal: todayYmd(), menit, cid: cid || null, label: label.trim() || `Ruang fokus · ${tempat.nama}` });
      suara.current?.denting();
      setPesan(`Sesi ${menit} menit tercatat di Harian`);
    },
    [tempat.nama],
  );
  const timer = useTimerFokus(selesai);
  fokusRef.current = timer.jalan;

  const menit = Math.floor(timer.sisa / 60);
  const detik = timer.sisa % 60;
  const jamTeks = `${String(menit).padStart(2, '0')}:${String(detik).padStart(2, '0')}`;
  const persen = ((timer.durasi * 60 - timer.sisa) / (timer.durasi * 60)) * 100;
  const sudahJalan = timer.sisa < timer.durasi * 60;

  /* ---------------- adegan 3D ---------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let batal = false;
    let bersihkan = () => {};

    (async () => {
      const THREE = await import('three');
      const [{ bangunStarfield }, { EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] = await Promise.all([
        import('./starfield'),
        import('three/examples/jsm/postprocessing/EffectComposer.js'),
        import('three/examples/jsm/postprocessing/RenderPass.js'),
        import('three/examples/jsm/postprocessing/UnrealBloomPass.js'),
        import('three/examples/jsm/postprocessing/OutputPass.js'),
      ]);
      if (batal) return;

      let renderer: import('three').WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
      } catch {
        setGagal(true);
        return;
      }
      const kasar = window.matchMedia('(pointer: coarse)').matches;
      const kualitas = kasar || (navigator.hardwareConcurrency || 8) <= 4 ? 'rendah' : 'tinggi';
      let dpr = Math.min(window.devicePixelRatio || 1, kualitas === 'tinggi' ? 1.75 : 1.3);
      renderer.setPixelRatio(dpr);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.92;
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const adegan = bangunStarfield(kualitas);
      const kamera = new THREE.PerspectiveCamera(62, 1, 0.05, 400);
      kamera.rotation.order = 'YXZ';
      kamera.position.copy(adegan.mata);

      let composer: InstanceType<typeof EffectComposer> | null = null;
      if (kualitas === 'tinggi') {
        composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(adegan.scene, kamera));
        composer.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), 0.42, 0.55, 0.9));
        composer.addPass(new OutputPass());
      }

      /* --- arah pandang --- */
      let yaw = 0;
      let pitch = -0.13;
      let tYaw = yaw;
      let tPitch = pitch;
      let zoom = 0;
      let vYaw = 0;
      let vPitch = 0;

      const ukur = () => {
        const w = canvas.clientWidth || window.innerWidth;
        const h = canvas.clientHeight || window.innerHeight;
        renderer.setSize(w, h, false);
        composer?.setSize(w, h);
        composer?.setPixelRatio(dpr);
        kamera.aspect = w / h;
        kamera.fov = jepit((w / h < 1 ? 74 : 54) + zoom, 28, 90);
        kamera.updateProjectionMatrix();
      };
      ukur();
      const ro = new ResizeObserver(ukur);
      ro.observe(canvas);

      /* --- seret untuk menoleh (mouse & sentuh), cubit / roda untuk zoom --- */
      const titik = new Map<number, { x: number; y: number }>();
      let jarakCubit = 0;
      const kepekaan = () => ((kamera.fov * Math.PI) / 180) / (canvas.clientHeight || 600);
      const turun = (e: PointerEvent) => {
        canvas.setPointerCapture(e.pointerId);
        titik.set(e.pointerId, { x: e.clientX, y: e.clientY });
        vYaw = vPitch = 0;
        setPetunjuk(false);
      };
      const gerak = (e: PointerEvent) => {
        const p = titik.get(e.pointerId);
        if (!p) return;
        if (titik.size === 2) {
          const [a, b] = [...titik.values()];
          const d0 = Math.hypot(a.x - b.x, a.y - b.y);
          titik.set(e.pointerId, { x: e.clientX, y: e.clientY });
          const [c, d] = [...titik.values()];
          const d1 = Math.hypot(c.x - d.x, c.y - d.y);
          if (jarakCubit) zoom = jepit(zoom - (d1 - d0) * 0.08, -32, 18);
          jarakCubit = d1;
          ukur();
          return;
        }
        const k = kepekaan();
        const dx = (e.clientX - p.x) * k;
        const dy = (e.clientY - p.y) * k;
        tYaw += dx;
        tPitch = jepit(tPitch + dy, -1.15, 1.3);
        vYaw = dx;
        vPitch = dy;
        titik.set(e.pointerId, { x: e.clientX, y: e.clientY });
      };
      const naik = (e: PointerEvent) => {
        titik.delete(e.pointerId);
        if (titik.size < 2) jarakCubit = 0;
      };
      const roda = (e: WheelEvent) => {
        e.preventDefault();
        zoom = jepit(zoom + e.deltaY * 0.02, -32, 18);
        ukur();
      };
      const tombol = (e: KeyboardEvent) => {
        const el = e.target as HTMLElement;
        if (el.closest('input, select, textarea')) return;
        if (e.key === 'ArrowLeft') tYaw += 0.12;
        else if (e.key === 'ArrowRight') tYaw -= 0.12;
        else if (e.key === 'ArrowUp') tPitch = jepit(tPitch + 0.1, -1.15, 1.3);
        else if (e.key === 'ArrowDown') tPitch = jepit(tPitch - 0.1, -1.15, 1.3);
        else return;
        setPetunjuk(false);
      };
      canvas.addEventListener('pointerdown', turun);
      canvas.addEventListener('pointermove', gerak);
      canvas.addEventListener('pointerup', naik);
      canvas.addEventListener('pointercancel', naik);
      canvas.addEventListener('wheel', roda, { passive: false });
      window.addEventListener('keydown', tombol);

      /* --- putaran gambar --- */
      let raf = 0;
      const t0 = performance.now();
      let akhir = t0;
      let pertama = true;
      const sampel: number[] = [];
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (document.hidden) {
          akhir = now;
          return;
        }
        const t = (now - t0) / 1000;
        const dt = Math.min(0.05, (now - akhir) / 1000);

        /* Turunkan kualitas sendiri kalau perangkat kewalahan. */
        if (t > 1.5 && t < 6) {
          sampel.push(now - akhir);
          if (sampel.length === 90) {
            const rata = sampel.reduce((a, b) => a + b, 0) / sampel.length;
            if (rata > 30 && (composer || dpr > 1)) {
              composer = null;
              dpr = Math.max(1, dpr * 0.75);
              renderer.setPixelRatio(dpr);
              ukur();
            }
          }
        }
        akhir = now;

        if (!titik.size) {
          tYaw += vYaw;
          tPitch = jepit(tPitch + vPitch, -1.15, 1.3);
          vYaw *= 0.9;
          vPitch *= 0.9;
        }
        yaw += (tYaw - yaw) * 0.2;
        pitch += (tPitch - pitch) * 0.2;
        kamera.rotation.set(pitch, yaw, 0);
        kamera.position.y = adegan.mata.y + Math.sin(t * 0.9) * 0.004;

        adegan.update(t, dt, fokusRef.current);
        if (composer) composer.render(dt);
        else renderer.render(adegan.scene, kamera);
        if (pertama) {
          pertama = false;
          setSiap(true);
        }
      };
      raf = requestAnimationFrame(frame);

      bersihkan = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        canvas.removeEventListener('pointerdown', turun);
        canvas.removeEventListener('pointermove', gerak);
        canvas.removeEventListener('pointerup', naik);
        canvas.removeEventListener('pointercancel', naik);
        canvas.removeEventListener('wheel', roda);
        window.removeEventListener('keydown', tombol);
        adegan.dispose();
        composer?.dispose();
        renderer.dispose();
        renderer.getContext().getExtension('WEBGL_lose_context')?.loseContext();
      };
    })();

    return () => {
      batal = true;
      bersihkan();
    };
  }, []);

  /* ---------------- HUD ---------------- */
  useEffect(() => {
    suara.current = buatSuara();
    setBisaPenuh(!!document.documentElement.requestFullscreen);
    const ubahPenuh = () => setPenuh(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', ubahPenuh);
    const t = window.setTimeout(() => setPetunjuk(false), 7000);
    return () => {
      document.removeEventListener('fullscreenchange', ubahPenuh);
      window.clearTimeout(t);
      suara.current?.tutup();
    };
  }, []);

  /* Saat sesi berjalan, HUD meredup setelah 4 detik tanpa gerakan. */
  useEffect(() => {
    if (!timer.jalan) {
      setDiam(false);
      return;
    }
    let id = window.setTimeout(() => setDiam(true), 4000);
    const bangun = () => {
      setDiam(false);
      window.clearTimeout(id);
      id = window.setTimeout(() => setDiam(true), 4000);
    };
    window.addEventListener('pointermove', bangun);
    window.addEventListener('pointerdown', bangun);
    window.addEventListener('keydown', bangun);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('pointermove', bangun);
      window.removeEventListener('pointerdown', bangun);
      window.removeEventListener('keydown', bangun);
    };
  }, [timer.jalan]);

  /* Judul tab ikut menghitung mundur; layar tidak meredup selama sesi. */
  useEffect(() => {
    const awal = document.title;
    if (timer.jalan) document.title = `${jamTeks} · Ruang fokus`;
    return () => {
      document.title = awal;
    };
  }, [timer.jalan, jamTeks]);
  useEffect(() => {
    if (!timer.jalan || !('wakeLock' in navigator)) return;
    let kunci: WakeLockSentinel | null = null;
    navigator.wakeLock
      .request('screen')
      .then(k => (kunci = k))
      .catch(() => {});
    return () => {
      void kunci?.release();
    };
  }, [timer.jalan]);

  useEffect(() => {
    if (!pesan) return;
    const id = window.setTimeout(() => setPesan(null), 4500);
    return () => window.clearTimeout(id);
  }, [pesan]);

  const gantiSuara = () => {
    if (suaraNyala) suara.current?.matikan();
    else suara.current?.nyalakan();
    setSuaraNyala(!suaraNyala);
  };
  const gantiPenuh = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const redup = diam && !atur && !pilihTempat;

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0d0a0c] text-ink" style={{ '--c': AKSEN, '--c-on': '#1a1306' } as React.CSSProperties}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
        role="img"
        aria-label={`Pemandangan 3D ${tempat.nama}: kamu duduk di meja panjang, si kucing hitam belajar dengan laptop di seberang, teman-teman lain membaca dan menulis di sekitar.`}
      />

      {/* Layar muat */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 grid place-items-center bg-[#0d0a0c] transition-opacity duration-700',
          siap || gagal ? 'opacity-0' : 'opacity-100',
        )}
        aria-hidden={siap}
      >
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[rgba(242,196,107,0.25)] border-t-[#f2c46b]" />
          <p className="mt-4 text-[13px] font-semibold text-secondary">Menata rak buku {tempat.nama}…</p>
        </div>
      </div>
      {gagal && (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(ellipse_at_center,#3a2a1c,#0d0a0c)] p-6 text-center">
          <p className="max-w-sm text-sm text-secondary">Perangkat ini tidak bisa menampilkan ruang 3D (WebGL tidak tersedia). Timer di bawah tetap bisa dipakai.</p>
        </div>
      )}

      {/* Bilah atas */}
      <div
        className={cn('pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 transition-opacity duration-700 sm:p-5', redup && 'opacity-20')}
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <div className="pointer-events-auto flex min-w-0 items-center gap-2">
          <Link href="/harian?tab=fokus" className={TOMBOL_IKON} aria-label="Keluar dari ruang fokus">
            <ArrowLeft size={18} />
          </Link>
          <div className={cn(KACA, 'min-w-0 rounded-full px-4 py-2')}>
            <p className="truncate text-[13px] font-bold leading-tight">{tempat.nama}</p>
            <p className="truncate text-[11px] leading-tight text-secondary">{tempat.lokasi} · belajar bareng 19 teman</p>
          </div>
        </div>
        <div className="pointer-events-auto relative flex shrink-0 gap-2">
          <button type="button" className={TOMBOL_IKON} onClick={() => setPilihTempat(v => !v)} aria-expanded={pilihTempat} aria-label="Pilih tempat">
            <MapPin size={18} />
          </button>
          <button type="button" className={TOMBOL_IKON} onClick={gantiSuara} aria-pressed={suaraNyala} aria-label={suaraNyala ? 'Matikan suara ruangan' : 'Nyalakan suara ruangan'}>
            {suaraNyala ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          {bisaPenuh && (
            <button type="button" className={TOMBOL_IKON} onClick={gantiPenuh} aria-label={penuh ? 'Keluar dari layar penuh' : 'Layar penuh'}>
              {penuh ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          )}

          {pilihTempat && (
            <div className={cn(KACA, 'absolute right-0 top-[3.25rem] w-[min(18rem,calc(100vw-2rem))] rounded-2xl p-2')} role="menu">
              {TEMPAT.map(t => (
                <button
                  key={t.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={t.id === tempat.id}
                  disabled={!t.siap}
                  onClick={() => setPilihTempat(false)}
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors enabled:hover:bg-[rgba(238,240,251,0.08)] disabled:opacity-45"
                >
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center">{t.id === tempat.id && <Check size={15} className="text-[#f2c46b]" />}</span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-bold">{t.nama}</span>
                    <span className="block text-[11px] text-secondary">{t.siap ? t.ket : `${t.lokasi} · ${t.ket}`}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pesan sesi tercatat */}
      <div aria-live="polite" className="pointer-events-none absolute inset-x-0 top-20 flex justify-center px-4">
        {pesan && <p className={cn(KACA, 'rounded-full px-4 py-2 text-[13px] font-semibold')}>{pesan}</p>}
      </div>

      {/* Petunjuk menoleh */}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center transition-opacity duration-700',
          petunjuk && siap ? 'opacity-100' : 'opacity-0',
        )}
        aria-hidden
      >
        <p className={cn(KACA, 'flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold')}>
          <Move size={16} /> Seret untuk menoleh ke sekeliling
        </p>
      </div>

      {/* Timer */}
      <div
        className={cn('pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-4 transition-opacity duration-700 sm:p-5', redup && 'opacity-25')}
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <section aria-label="Timer sesi fokus" className={cn(KACA, 'pointer-events-auto w-full max-w-[440px] rounded-[22px] p-4 sm:p-5')}>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#f2c46b]">
                Sesi fokus · {timer.jalan ? 'berjalan' : sudahJalan ? 'jeda' : 'siap'}
              </p>
              <p className="display mt-1 leading-none" style={{ fontSize: 'clamp(2.5rem,9vw,3.3rem)', fontVariantNumeric: 'tabular-nums' }}>
                {jamTeks}
              </p>
            </div>
            <div className="flex gap-1.5 pb-1">
              {PRESET.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => timer.setel(m)}
                  aria-pressed={timer.durasi === m}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[12px] font-bold transition-colors',
                    timer.durasi === m ? 'bg-[rgba(242,196,107,0.2)] text-[#f7d58e]' : 'text-secondary hover:text-ink',
                  )}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-[rgba(238,240,251,0.14)]">
            <div className="h-full rounded-full bg-[#f2c46b] transition-[width] duration-300" style={{ width: `${persen}%` }} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button type="button" onClick={timer.jalan ? timer.jeda : timer.mulai} className="btn btn--c btn--sm min-w-[6.5rem]">
              {timer.jalan ? 'Jeda' : sudahJalan ? 'Lanjut' : 'Mulai'}
            </button>
            {sudahJalan && (
              <button type="button" onClick={() => timer.setel(timer.durasi)} className="btn btn--light btn--sm">
                Ulang
              </button>
            )}
            {!timer.jalan && sudahJalan && Math.round((timer.durasi * 60 - timer.sisa) / 60) > 0 && (
              <button type="button" onClick={timer.catatSebagian} className="btn btn--light btn--sm">
                Catat {Math.round((timer.durasi * 60 - timer.sisa) / 60)} menit
              </button>
            )}
            <button
              type="button"
              onClick={() => setAtur(v => !v)}
              aria-expanded={atur}
              className="ml-auto flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] font-bold text-secondary hover:text-ink"
            >
              <SlidersHorizontal size={14} />
              {timer.cid ? shortName(META.find(m => m.id === timer.cid)!) : 'Atur'}
            </button>
          </div>

          {atur && (
            <div className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-2 border-t border-[rgba(238,240,251,0.12)] pt-3">
              <label>
                <span className="field__label">Mata kuliah</span>
                <select className="input" value={timer.cid} onChange={e => timer.setCid(e.target.value)}>
                  <option value="">Di luar kuliah</option>
                  {META.map(m => (
                    <option key={m.id} value={m.id}>
                      {shortName(m)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="field__label">Sedang mengerjakan</span>
                <input className="input" value={timer.label} onChange={e => timer.setLabel(e.target.value)} placeholder="Latihan soal AVL" maxLength={60} />
              </label>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
