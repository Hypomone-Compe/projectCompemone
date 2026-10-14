'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Bar, Kosong, Reveal } from '@/components/ui';
import { META, shortName } from '@/lib/courses/meta';
import {
  bacaKorelasi, catatan, deretHarian, geserBulan, hariBulan, hariPekan, hariTerakhir, jam,
  jurnalTerisi, kebiasaanAktif, konsistensi, korelasi, kunciBulan, kunciPekan, LABEL_ENERGI,
  LABEL_MOOD, namaBulanHarian, polaHari, progresTarget, rekapPekan, ringkasHari, ringkasTarget,
  runtun, runtunTerbaik, targetPeriode, tinjauan, totalFokus,
  type Periode, type Skala,
} from '@/lib/harian';
import { addDays, fmtDateLong, fmtRange, parseYmd, todayYmd, ymd } from '@/lib/kalender';
import {
  addFokus, addKebiasaan, addTarget, geserTarget, getHarian, pakaiKebiasaanBawaan, patchKebiasaan,
  removeFokus, removeKebiasaan, removeTarget, setCatatan, toggleCeklis, useStore,
} from '@/lib/store';
import {
  GrafikFokus, GrafikMood, GrafikPekan, GrafikTidur, KisiPekan, PetaBulan, PolaPekan,
} from './Grafik';

/* Setiap seksi punya kepala yang seragam dengan halaman lain di situs ini. */
function Kepala({
  id,
  num,
  judul,
  lede,
  aksi,
}: {
  id: string;
  num: string;
  judul: React.ReactNode;
  lede?: React.ReactNode;
  aksi?: React.ReactNode;
}) {
  return (
    <div id={id} className="mb-[clamp(1.6rem,3.5vw,2.6rem)] flex flex-wrap items-end justify-between gap-x-8 gap-y-5 scroll-mt-28">
      <div className="max-w-3xl">
        <Reveal>
          <span className="eyebrow eyebrow--c">
            {num} · {typeof judul === 'string' ? judul : ''}
          </span>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="display mt-3" style={{ fontSize: 'var(--t-xl)' }}>
            {judul}
          </h2>
        </Reveal>
        {lede && (
          <Reveal delay={110}>
            <p className="lede mt-4 text-[0.94rem]">{lede}</p>
          </Reveal>
        )}
      </div>
      {aksi && <Reveal delay={130}>{aksi}</Reveal>}
    </div>
  );
}

/* ============================== 01 RINGKASAN ============================== */
function Ringkasan({ hariIni }: { hariIni: string }) {
  const s = getHarian();
  const senin = kunciPekan(hariIni);
  const hari = hariPekan(hariIni).filter(h => h <= hariIni);
  const rataPekan = hari.length
    ? Math.round(hari.reduce((a, h) => a + ringkasHari(s, h).persen, 0) / hari.length)
    : 0;
  const kini = ringkasHari(s, hariIni);
  const terbaik = runtunTerbaik(s, hariIni);
  const menit = totalFokus(s, senin, hariIni);
  const jurnal14 = hariTerakhir(hariIni, 14).filter(t => jurnalTerisi(catatan(s, t))).length;

  const ubin = [
    {
      label: 'Hari ini',
      nilai: kini.total ? `${kini.tuntas}/${kini.total}` : '—',
      catatan: kini.total
        ? kini.tuntas === kini.total
          ? 'Semua kebiasaan hari ini tuntas. Hari yang bersih.'
          : `Tersisa ${kini.total - kini.tuntas} kebiasaan yang belum dicentang hari ini.`
        : 'Belum ada kebiasaan yang dipantau. Tambahkan di bagian bawah.',
      nada: kini.total && kini.tuntas === kini.total ? 'stat--lime' : 'stat--c',
    },
    {
      label: 'Konsistensi pekan ini',
      nilai: `${rataPekan}%`,
      catatan: `Rata-rata dari ${hari.length} hari yang sudah berjalan pekan ini.`,
      nada: rataPekan >= 70 ? 'stat--lime' : rataPekan >= 40 ? 'stat--c' : 'stat--red',
    },
    {
      label: 'Runtun terpanjang',
      nilai: terbaik.hari ? `${terbaik.hari}` : '0',
      catatan: terbaik.hari
        ? `Hari berturut-turut untuk "${terbaik.nama}". Jangan putus hari ini.`
        : 'Belum ada runtun berjalan. Satu centang hari ini sudah memulainya.',
      nada: 'stat--amber',
    },
    {
      label: 'Fokus pekan ini',
      nilai: jam(menit),
      catatan: jurnal14
        ? `Jurnal terisi ${jurnal14} dari 14 hari terakhir.`
        : 'Catat sesi belajarmu di bagian Fokus supaya angka ini hidup.',
      nada: 'stat--blue',
    },
  ];

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {ubin.map((u, i) => (
        <Reveal key={u.label} delay={i * 70} className={`stat ${u.nada}`}>
          <span className="stat__label">{u.label}</span>
          <span className="stat__value">{u.nilai}</span>
          <span className="stat__note">{u.catatan}</span>
        </Reveal>
      ))}
    </div>
  );
}

/* ============================== 02 KEBIASAAN ============================== */
function FormKebiasaan() {
  const [nama, setNama] = useState('');
  const [ket, setKet] = useState('');
  const [target, setTarget] = useState(7);

  function kirim(e: FormEvent) {
    e.preventDefault();
    if (!nama.trim()) return;
    addKebiasaan(nama, ket, target);
    setNama('');
    setKet('');
    setTarget(7);
  }

  return (
    <form onSubmit={kirim} className="card">
      <h4 className="card__title">Tambah kebiasaan</h4>
      <p className="mt-1 text-[0.72rem] leading-relaxed muted">
        Tulis definisi yang bisa dijawab ya atau tidak dalam dua detik. &ldquo;Olahraga&rdquo; terlalu kabur,
        &ldquo;jalan cepat 20 menit&rdquo; tidak.
      </p>

      <div className="mt-4 grid gap-3">
        <label className="block">
          <span className="field__label">Nama kebiasaan</span>
          <input
            className="input"
            value={nama}
            onChange={e => setNama(e.target.value)}
            placeholder="Baca materi sebelum kelas"
            maxLength={60}
          />
        </label>

        <label className="block">
          <span className="field__label">Definisi tuntas (opsional)</span>
          <input
            className="input"
            value={ket}
            onChange={e => setKet(e.target.value)}
            placeholder="Minimal satu bab, sebelum kelasnya dimulai"
            maxLength={120}
          />
        </label>

        <label className="block">
          <span className="field__label">Target per pekan: {target} hari</span>
          <input
            type="range"
            min={1}
            max={7}
            value={target}
            onChange={e => setTarget(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--c)]"
          />
        </label>
      </div>

      <button type="submit" disabled={!nama.trim()} className="btn btn--c btn--sm mt-4">
        Tambahkan
      </button>
    </form>
  );
}

function DaftarKebiasaan({ hariIni }: { hariIni: string }) {
  const s = getHarian();
  if (!s.kebiasaan.length) return null;

  return (
    <div className="card card--flush">
      <div className="border-b border-[var(--rule)] px-5 py-4">
        <h4 className="card__title">Kelola kebiasaan</h4>
        <p className="mt-1 text-[0.72rem] muted">
          Menonaktifkan menyimpan riwayat tapi mengeluarkannya dari hitungan. Menghapus membuang
          seluruh riwayat centangnya.
        </p>
      </div>

      {s.kebiasaan.map(k => {
        const r = runtun(s, k.id, hariIni);
        const kon = konsistensi(s, k.id, hariIni, 30);
        return (
          <div key={k.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-[var(--rule)] px-5 py-4 last:border-b-0">
            <span aria-hidden="true" className="h-8 w-[3px] shrink-0 rounded-full" style={{ background: k.warna }} />

            <div className="min-w-[10rem] flex-1">
              <div className="text-[0.86rem] font-semibold" style={{ letterSpacing: '-0.01em' }}>
                {k.nama}
              </div>
              {k.ket && <div className="mt-0.5 text-[0.7rem] muted">{k.ket}</div>}
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[0.68rem] muted">
                <span>
                  Runtun <b className="num text-[var(--ink)]">{r}</b> hari
                </span>
                <span>
                  30 hari <b className="num text-[var(--ink)]">{kon}%</b>
                </span>
                <span>
                  Target <b className="num text-[var(--ink)]">{k.targetPekan}×</b>/pekan
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => patchKebiasaan(k.id, { aktif: !k.aktif })}
                className={`btn btn--sm ${k.aktif ? 'btn--ghost' : 'btn--c'}`}
              >
                {k.aktif ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Hapus "${k.nama}" beserta seluruh riwayat centangnya?`)) removeKebiasaan(k.id);
                }}
                className="stepper"
                aria-label={`Hapus ${k.nama}`}
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SeksiKebiasaan({ hariIni }: { hariIni: string }) {
  const s = getHarian();
  const [pekanGeser, setPekanGeser] = useState(0);
  const [bulan, setBulan] = useState(() => kunciBulan(hariIni));

  const acuan = ymd(addDays(parseYmd(hariIni), pekanGeser * 7));
  const hari = hariPekan(acuan);
  const baris = rekapPekan(s, acuan);
  const ringkas = hari.map(h => ringkasHari(s, h));

  const petak = hariBulan(bulan).map(t => {
    const r = ringkasHari(s, t);
    return { tanggal: t, persen: r.persen, total: r.total, adaJurnal: jurnalTerisi(catatan(s, t)) };
  });

  const aktif = kebiasaanAktif(s);

  return (
    <>
      <Kepala
        id="kebiasaan"
        num="02"
        judul="Kebiasaan"
        lede="Konsistensi tidak terasa saat dijalani, hanya terlihat saat digambar. Centang tiap hari, lalu biarkan tujuh petak dan satu kalender yang memberitahu apakah kamu benar-benar rutin atau cuma merasa rutin."
        aksi={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPekanGeser(v => v - 1)}
              className="stepper"
              aria-label="Pekan sebelumnya"
            >
              ‹
            </button>
            <span className="num min-w-[9.5rem] text-center text-[0.72rem] muted">
              {fmtRange(hari[0], hari[6])}
            </span>
            <button
              type="button"
              onClick={() => setPekanGeser(v => Math.min(0, v + 1))}
              disabled={pekanGeser >= 0}
              className="stepper"
              aria-label="Pekan berikutnya"
            >
              ›
            </button>
          </div>
        }
      />

      {aktif.length === 0 ? (
        <div className="card">
          <Kosong
            judul="Belum ada kebiasaan yang dipantau"
            catatan="Mulai dari set bawaan lalu ubah sesukamu, atau langsung susun sendiri dari nol."
          />
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={pakaiKebiasaanBawaan} className="btn btn--c btn--sm">
              Pakai 6 kebiasaan bawaan
            </button>
          </div>
        </div>
      ) : (
        <>
          <KisiPekan baris={baris} hari={hari} hariIni={hariIni} onToggle={toggleCeklis} />

          <div className="mt-2.5 grid gap-2.5 xl:grid-cols-2">
            <GrafikPekan
              data={ringkas}
              sampai={hariIni}
              judul={pekanGeser === 0 ? 'Konsistensi pekan ini' : 'Konsistensi pekan itu'}
            />
            <PetaBulan
              hari={petak}
              judul={namaBulanHarian(bulan)}
              kanan={
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setBulan(b => geserBulan(b, -1))} className="stepper" aria-label="Bulan sebelumnya">
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulan(b => geserBulan(b, 1))}
                    disabled={bulan >= kunciBulan(hariIni)}
                    className="stepper"
                    aria-label="Bulan berikutnya"
                  >
                    ›
                  </button>
                </div>
              }
            />
          </div>
        </>
      )}

      <div className="mt-2.5 grid gap-2.5 lg:grid-cols-[1fr_1.2fr]">
        <FormKebiasaan />
        <DaftarKebiasaan hariIni={hariIni} />
      </div>
    </>
  );
}

/* ============================== 03 JURNAL ============================== */
function PilihSkala({
  nilai,
  label,
  onPilih,
  daftar,
}: {
  nilai?: Skala;
  label: string;
  onPilih: (v: Skala) => void;
  daftar: Record<Skala, string>;
}) {
  return (
    <div>
      <span className="field__label">{label}</span>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {([1, 2, 3, 4, 5] as Skala[]).map(v => (
          <button
            key={v}
            type="button"
            onClick={() => onPilih(v)}
            aria-pressed={nilai === v}
            className={`opt ${nilai === v ? 'is-on' : ''}`}
            style={{ minWidth: '4.6rem' }}
          >
            <span className="num opacity-60">{v}</span>
            {daftar[v]}
          </button>
        ))}
      </div>
    </div>
  );
}

/* Draf lokal untuk isian teks jurnal.

   Sebelumnya tiap ketikan langsung menulis ke store. Karena seluruh papan
   berlangganan store yang sama, satu huruf memicu render ulang tujuh seksi,
   sepuluh grafik SVG, hitungan korelasi 45 hari, dan satu tulis localStorage.
   Pada catatan yang panjang itu terasa seperti halaman menolak menyimpan.

   Sekarang yang berubah tiap ketikan hanya draf di dalam satu kolom. Store
   baru ditulis setelah mengetik berhenti sejenak, saat kolomnya ditinggalkan,
   saat tombol Simpan ditekan, atau saat halaman ditutup. */
function useDraf(kunci: string, awal: string, simpan: (v: string) => void, jeda = 600) {
  const [draf, setDraf] = useState(awal);
  const [mengetik, setMengetik] = useState(false);

  const drafRef = useRef(awal);
  const kotorRef = useRef(false);
  const simpanRef = useRef(simpan);
  simpanRef.current = simpan;

  /* Pola resmi React untuk state turunan prop: reset saat kuncinya berganti.
     Tidak lewat useEffect, karena efek berjalan setelah render dan sempat
     menimpa ketikan yang baru masuk. `awal` yang berubah TANPA pergantian
     kunci sengaja diabaikan: itu gema dari simpanan kita sendiri, dan
     mengikutinya akan memundurkan kursor ke belakang. */
  const kunciRef = useRef(kunci);
  if (kunciRef.current !== kunci) {
    kunciRef.current = kunci;
    drafRef.current = awal;
    kotorRef.current = false;
    setDraf(awal);
    setMengetik(false);
  }

  const kirim = useCallback(() => {
    if (!kotorRef.current) return;
    kotorRef.current = false;
    simpanRef.current(drafRef.current);
    setMengetik(false);
  }, []);

  const ubah = useCallback((v: string) => {
    drafRef.current = v;
    kotorRef.current = true;
    setDraf(v);
    setMengetik(true);
  }, []);

  useEffect(() => {
    if (!mengetik) return;
    const id = window.setTimeout(kirim, jeda);
    return () => window.clearTimeout(id);
  }, [draf, mengetik, jeda, kirim]);

  /* Ketikan terakhir tidak boleh hilang kalau tab ditutup, atau kalau pindah
     halaman lewat tautan (beforeunload tidak menyala untuk navigasi klien). */
  useEffect(() => {
    const sekarang = () => kirim();
    window.addEventListener('beforeunload', sekarang);
    window.addEventListener('pagehide', sekarang);
    return () => {
      window.removeEventListener('beforeunload', sekarang);
      window.removeEventListener('pagehide', sekarang);
      kirim();
    };
  }, [kirim]);

  return { draf, ubah, kirim, mengetik };
}

/** Textarea yang tingginya mengikuti isinya, supaya catatan panjang terbaca
    utuh tanpa kotak gulir sempit di dalam kotak gulir halaman.

    Pengukurannya diserahkan ke CSS (lihat `.tumbuh` di app/globals.css): teks
    yang sama disalin ke ::after pada sel grid yang sama, dan salinan itulah
    yang menentukan tinggi baris grid. Versi JavaScript-nya harus menyetel
    height ke 'auto' lalu membaca scrollHeight, dan itu memaksa reflow seluruh
    halaman tiap huruf. */
function AreaTumbuh({
  nilai,
  onUbah,
  onSelesai,
  placeholder,
  minTinggi = 176,
}: {
  nilai: string;
  onUbah: (v: string) => void;
  onSelesai: () => void;
  placeholder?: string;
  minTinggi?: number;
}) {
  return (
    <div className="tumbuh" data-isi={nilai}>
      <textarea
        className="textarea"
        value={nilai}
        onChange={e => onUbah(e.target.value)}
        onBlur={onSelesai}
        placeholder={placeholder}
        style={{ minHeight: minTinggi }}
      />
    </div>
  );
}

const hitungKata = (t: string): number => (t.trim() ? t.trim().split(/\s+/).length : 0);

/* Satu kolom teks memiliki drafnya sendiri, jadi mengetik hanya merender ulang
   komponen sekecil ini, bukan seluruh seksi jurnal beserta grafiknya. */
function KolomTeks({
  id,
  kunci,
  awal,
  simpan,
  label,
  placeholder,
  maxLength,
  area = false,
  inputMode,
  daftar,
  onStatus,
}: {
  id: string;
  kunci: string;
  awal: string;
  simpan: (v: string) => void;
  label: string;
  placeholder?: string;
  maxLength?: number;
  area?: boolean;
  inputMode?: 'text' | 'decimal';
  /** Menitipkan fungsi simpan ke induk untuk tombol "Simpan sekarang". */
  daftar: (id: string, kirim: () => void) => () => void;
  onStatus: (id: string, mengetik: boolean) => void;
}) {
  const d = useDraf(kunci, awal, simpan);

  useEffect(() => daftar(id, d.kirim), [id, daftar, d.kirim]);
  useEffect(() => onStatus(id, d.mengetik), [id, onStatus, d.mengetik]);

  const kata = area ? hitungKata(d.draf) : 0;

  return (
    <label className="block">
      <span className="flex flex-wrap items-baseline justify-between gap-x-4">
        <span className="field__label">{label}</span>
        {area && (
          <span className="pb-1.5 text-[0.66rem] muted">
            {kata ? `${kata} kata` : 'Sepanjang yang kamu mau'}
          </span>
        )}
      </span>

      {area ? (
        <AreaTumbuh nilai={d.draf} onUbah={d.ubah} onSelesai={d.kirim} placeholder={placeholder} />
      ) : (
        <input
          className="input"
          type="text"
          inputMode={inputMode}
          value={d.draf}
          onChange={e => d.ubah(e.target.value)}
          onBlur={d.kirim}
          placeholder={placeholder}
          maxLength={maxLength}
        />
      )}
    </label>
  );
}

function SeksiJurnal({ hariIni }: { hariIni: string }) {
  const s = getHarian();
  const [tanggal, setTanggal] = useState(hariIni);
  const c = catatan(s, tanggal);
  const deret = deretHarian(s, hariIni, 30);
  const terisi = hariTerakhir(hariIni, 30).filter(t => jurnalTerisi(catatan(s, t))).length;

  /* Tiap kolom menitipkan fungsi simpannya di sini. Memakai ref, bukan state,
     supaya pendaftaran tidak ikut memicu render. */
  const penyimpan = useRef(new Map<string, () => void>());
  const daftar = useCallback((id: string, kirim: () => void) => {
    penyimpan.current.set(id, kirim);
    return () => {
      penyimpan.current.delete(id);
    };
  }, []);
  const simpanSemua = useCallback(() => {
    penyimpan.current.forEach(f => f());
  }, []);

  /* Status hanya berubah saat mengetik dimulai dan saat selesai, bukan tiap
     huruf, jadi kepala kartu tidak ikut merender ulang per ketikan. */
  const [kotor, setKotor] = useState<Record<string, boolean>>({});
  const onStatus = useCallback((id: string, mengetik: boolean) => {
    setKotor(k => (k[id] === mengetik ? k : { ...k, [id]: mengetik }));
  }, []);
  const belumTersimpan = Object.values(kotor).some(Boolean);

  function pindahTanggal(t: string) {
    simpanSemua();
    setTanggal(t || hariIni);
  }

  /* Tidur disimpan sebagai teks selama diketik. Kalau langsung diangkakan tiap
     ketikan, "7," atau "7." lenyap sebelum angka di belakang koma sempat
     masuk, dan 7,5 jam mustahil diketik. Koma diterima karena itu pemisah
     desimal yang dipakai papan ketik Indonesia. */
  function simpanTidur(v: string) {
    const bersih = v.replace(',', '.').trim();
    if (!bersih) return setCatatan(tanggal, { tidur: undefined });
    const n = Number(bersih);
    if (!Number.isFinite(n)) return;
    setCatatan(tanggal, { tidur: Math.max(0, Math.min(16, Math.round(n * 10) / 10)) });
  }

  return (
    <>
      <Kepala
        id="jurnal"
        num="03"
        judul="Jurnal & refleksi"
        lede="Tiga pertanyaan pendek tiap malam. Bukan untuk dibaca orang lain, tapi supaya kamu punya catatan tentang hari-hari yang biasanya lewat begitu saja, dan supaya semua angka di halaman ini punya konteks."
        aksi={
          <label className="block">
            <span className="field__label">Tanggal</span>
            <input
              type="date"
              className="input mt-1"
              value={tanggal}
              max={hariIni}
              onChange={e => pindahTanggal(e.target.value)}
              style={{ minWidth: '11rem' }}
            />
          </label>
        }
      />

      <div className="grid gap-2.5 xl:grid-cols-[1.6fr_1fr]">
        <div className="card">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h4 className="card__title">{fmtDateLong(tanggal)}</h4>
            <span
              className="text-[0.68rem] uppercase tracking-[0.1em]"
              style={{ color: belumTersimpan ? 'var(--c)' : 'var(--ink-mute)' }}
            >
              {belumTersimpan ? 'Menyimpan…' : jurnalTerisi(c) ? 'Tersimpan' : 'Belum diisi'}
            </span>
          </div>

          <div className="mt-5 space-y-5">
            <PilihSkala
              label="Bagaimana perasaanmu hari ini?"
              nilai={c.mood}
              daftar={LABEL_MOOD}
              onPilih={v => setCatatan(tanggal, { mood: v })}
            />

            <PilihSkala
              label="Seberapa besar energimu?"
              nilai={c.energi}
              daftar={LABEL_ENERGI}
              onPilih={v => setCatatan(tanggal, { energi: v })}
            />

            <div className="grid gap-5 sm:grid-cols-[9rem_minmax(0,1fr)]">
              <KolomTeks
                id="tidur"
                kunci={tanggal}
                awal={c.tidur != null ? String(c.tidur) : ''}
                simpan={simpanTidur}
                label="Tidur semalam (jam)"
                placeholder="7,5"
                inputMode="decimal"
                daftar={daftar}
                onStatus={onStatus}
              />

              <KolomTeks
                id="syukur"
                kunci={tanggal}
                awal={c.syukur ?? ''}
                simpan={v => setCatatan(tanggal, { syukur: v })}
                label="Satu hal yang kamu syukuri"
                placeholder="Ketemu bug-nya setelah dua jam"
                maxLength={140}
                daftar={daftar}
                onStatus={onStatus}
              />
            </div>

            <KolomTeks
              id="refleksi"
              kunci={tanggal}
              awal={c.refleksi ?? ''}
              simpan={v => setCatatan(tanggal, { refleksi: v })}
              label="Refleksi: apa yang terjadi hari ini?"
              placeholder="Tulis apa adanya. Tidak perlu rapi. Kotaknya ikut memanjang mengikuti tulisanmu."
              area
              daftar={daftar}
              onStatus={onStatus}
            />

            <KolomTeks
              id="pelajaran"
              kunci={tanggal}
              awal={c.pelajaran ?? ''}
              simpan={v => setCatatan(tanggal, { pelajaran: v })}
              label="Pelajaran yang dibawa ke besok"
              placeholder="Mulai tugas di hari rilisnya, bukan H-1"
              maxLength={140}
              daftar={daftar}
              onStatus={onStatus}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[var(--rule)] pt-4">
            <button type="button" onClick={simpanSemua} disabled={!belumTersimpan} className="btn btn--c btn--sm">
              {belumTersimpan ? 'Simpan sekarang' : 'Tersimpan'}
            </button>
            <span className="text-[0.7rem] leading-relaxed muted">
              Tersimpan sendiri sesaat setelah kamu berhenti mengetik, saat pindah kolom, dan saat
              menutup halaman. Tombol ini untuk memastikan.
            </span>
          </div>
        </div>

        <div className="grid content-start gap-2.5">
          <GrafikMood data={deret} />

          <div className="card">
            <h4 className="card__title">Catatan terakhir</h4>
            <p className="mt-1 text-[0.72rem] muted">
              Terisi {terisi} dari 30 hari terakhir. Klik untuk membuka hari itu; yang sedang dibuka
              ditampilkan utuh.
            </p>

            <div className="mt-4 max-h-[24rem] space-y-2 overflow-y-auto pr-1">
              {hariTerakhir(hariIni, 30)
                .slice()
                .reverse()
                .filter(t => jurnalTerisi(catatan(s, t)))
                .slice(0, 12)
                .map(t => {
                  const j = catatan(s, t);
                  const isi = (j.refleksi || j.pelajaran || j.syukur || '').trim();
                  const dipilih = t === tanggal;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => pindahTanggal(t)}
                      aria-current={dipilih ? 'true' : undefined}
                      className="block w-full rounded-[var(--radius)] border px-3 py-2.5 text-left transition-colors"
                      style={{
                        borderColor: dipilih ? 'var(--c)' : 'var(--rule)',
                        background: dipilih ? 'color-mix(in srgb, var(--c) 6%, transparent)' : 'transparent',
                      }}
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="num text-[0.7rem] font-semibold">{t}</span>
                        {j.mood && (
                          <span className="text-[0.64rem] uppercase tracking-[0.08em] muted">
                            {LABEL_MOOD[j.mood]}
                          </span>
                        )}
                      </span>
                      {isi && (
                        /* Tiga baris, bukan satu baris terpotong: sepotong kalimat
                           yang putus di tengah tidak memberi tahu apa pun tentang
                           hari itu, dan justru memaksa membuka satu per satu. */
                        <span
                          className="mt-1 block text-[0.76rem] leading-relaxed muted"
                          style={
                            dipilih
                              ? { overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }
                              : {
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  overflowWrap: 'anywhere',
                                }
                          }
                        >
                          {isi}
                        </span>
                      )}
                    </button>
                  );
                })}

              {terisi === 0 && (
                <p className="py-6 text-center text-[0.78rem] muted">
                  Belum ada catatan. Mulai dari hari ini, satu kalimat pun cukup.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================== 04 FOKUS ============================== */
const PRESET = [25, 50, 90];

function Timer({ onSelesai }: { onSelesai: (menit: number) => void }) {
  const [durasi, setDurasi] = useState(25);
  const [sisa, setSisa] = useState(25 * 60);
  const [jalan, setJalan] = useState(false);
  const batas = useRef<number | null>(null);

  useEffect(() => {
    if (!jalan) return;
    const id = window.setInterval(() => {
      if (batas.current == null) return;
      const detik = Math.max(0, Math.round((batas.current - Date.now()) / 1000));
      setSisa(detik);
      if (detik === 0) {
        setJalan(false);
        batas.current = null;
        onSelesai(durasi);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [jalan, durasi, onSelesai]);

  function mulai() {
    batas.current = Date.now() + sisa * 1000;
    setJalan(true);
  }

  function jeda() {
    setJalan(false);
    batas.current = null;
  }

  function setel(m: number) {
    setJalan(false);
    batas.current = null;
    setDurasi(m);
    setSisa(m * 60);
  }

  const menit = Math.floor(sisa / 60);
  const detik = sisa % 60;
  const persen = durasi > 0 ? ((durasi * 60 - sisa) / (durasi * 60)) * 100 : 0;

  return (
    <div className="on-dark rounded-[var(--radius-lg)] p-[clamp(1.3rem,3vw,2rem)]">
      <span className="eyebrow" style={{ color: 'var(--lime)' }}>
        Sesi fokus
      </span>

      <div className="mt-4 flex items-baseline gap-3">
        <span
          className="display"
          style={{ fontSize: 'clamp(2.8rem,7vw,4rem)', fontVariantNumeric: 'tabular-nums' }}
        >
          {String(menit).padStart(2, '0')}:{String(detik).padStart(2, '0')}
        </span>
        <span className="text-[0.72rem] uppercase tracking-[0.12em]" style={{ color: 'var(--lime)' }}>
          {jalan ? 'berjalan' : sisa === durasi * 60 ? 'siap' : 'jeda'}
        </span>
      </div>

      <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-[rgba(243,240,231,0.18)]">
        <div className="h-full rounded-full transition-[width]" style={{ width: `${persen}%`, background: 'var(--lime)' }} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {PRESET.map(m => (
          <button
            key={m}
            type="button"
            onClick={() => setel(m)}
            className={`btn btn--sm ${durasi === m ? 'btn--light' : 'btn--ghost'}`}
          >
            {m} menit
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={jalan ? jeda : mulai} disabled={sisa === 0} className="btn btn--light btn--sm">
          {jalan ? 'Jeda' : 'Mulai'}
        </button>
        <button type="button" onClick={() => setel(durasi)} className="btn btn--ghost btn--sm">
          Ulang
        </button>
        {!jalan && sisa < durasi * 60 && (
          <button
            type="button"
            onClick={() => {
              const lewat = Math.round((durasi * 60 - sisa) / 60);
              if (lewat > 0) onSelesai(lewat);
              setel(durasi);
            }}
            className="btn btn--ghost btn--sm"
          >
            Catat {Math.round((durasi * 60 - sisa) / 60)} menit
          </button>
        )}
      </div>

      <p className="mt-4 text-[0.72rem] leading-relaxed" style={{ color: 'rgba(243,240,231,0.62)' }}>
        Sesi yang selesai langsung tercatat memakai mata kuliah dan label yang dipilih di sebelah.
        Timer berhenti kalau tab ditutup, jadi catat manual kalau itu terjadi.
      </p>
    </div>
  );
}

function SeksiFokus({ hariIni }: { hariIni: string }) {
  const s = getHarian();
  const [cid, setCid] = useState<string>('');
  const [label, setLabel] = useState('');
  const [menit, setMenit] = useState('');
  const [tanggal, setTanggal] = useState(hariIni);

  const senin = kunciPekan(hariIni);
  const deret = deretHarian(s, hariIni, 14);

  /* Distribusi per matkul dihitung untuk pekan berjalan: ini pertanyaan
     "mana yang kuanaktirikan minggu ini", bukan sepanjang semester. */
  const perMatkul = useMemo(() => {
    const acc: Record<string, number> = {};
    s.fokus.forEach(f => {
      if (f.tanggal < senin || f.tanggal > hariIni) return;
      const k = f.cid || '_lain';
      acc[k] = (acc[k] || 0) + f.menit;
    });
    const total = Object.values(acc).reduce((a, b) => a + b, 0);
    const baris = [
      ...META.map(m => ({ id: m.id, nama: shortName(m), warna: m.accent, menit: acc[m.id] || 0 })),
      { id: '_lain', nama: 'Di luar kuliah', warna: '#66665c', menit: acc._lain || 0 },
    ];
    return { baris, total };
  }, [s.fokus, senin, hariIni]);

  function catat(m: number, tgl = tanggal) {
    if (m <= 0) return;
    addFokus({ tanggal: tgl, menit: m, cid: cid || null, label: label.trim() || 'Sesi fokus' });
  }

  function kirim(e: FormEvent) {
    e.preventDefault();
    const m = Math.round(Number(menit));
    if (!Number.isFinite(m) || m <= 0) return;
    catat(m);
    setMenit('');
  }

  const sesiTerakhir = s.fokus.slice(0, 8);

  return (
    <>
      <Kepala
        id="fokus"
        num="04"
        judul="Fokus"
        lede="Jam belajar yang tidak dicatat selalu terasa lebih banyak daripada yang sebenarnya. Jalankan timer, atau catat manual, lalu lihat sendiri berapa jam yang benar-benar masuk dan ke mata kuliah mana."
      />

      <div className="grid gap-2.5 lg:grid-cols-[1fr_1.15fr]">
        <Timer onSelesai={m => catat(m, todayYmd())} />

        <form onSubmit={kirim} className="card">
          <h4 className="card__title">Catat sesi</h4>
          <p className="mt-1 text-[0.72rem] muted">
            Pilihan di sini juga dipakai timer saat sesinya selesai.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="field__label">Mata kuliah</span>
              <select className="input" value={cid} onChange={e => setCid(e.target.value)}>
                <option value="">Di luar kuliah</option>
                {META.map(m => (
                  <option key={m.id} value={m.id}>
                    {shortName(m)} · {m.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block sm:col-span-2">
              <span className="field__label">Yang dikerjakan</span>
              <input
                className="input"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="Tutorial 07, Django REST Framework"
                maxLength={80}
              />
            </label>

            <label className="block">
              <span className="field__label">Tanggal</span>
              <input type="date" className="input" value={tanggal} max={hariIni} onChange={e => setTanggal(e.target.value || hariIni)} />
            </label>

            <label className="block">
              <span className="field__label">Menit</span>
              <input
                type="number"
                className="input"
                min={1}
                max={720}
                value={menit}
                onChange={e => setMenit(e.target.value)}
                placeholder="50"
              />
            </label>
          </div>

          <button type="submit" disabled={!menit} className="btn btn--c btn--sm mt-4">
            Catat sesi
          </button>

          {sesiTerakhir.length > 0 && (
            <div className="mt-5 border-t border-[var(--rule)] pt-4">
              <span className="field__label">Sesi terakhir</span>
              <div className="mt-2 space-y-1.5">
                {sesiTerakhir.map(f => {
                  const m = f.cid ? META.find(x => x.id === f.cid) : null;
                  return (
                    <div key={f.id} className="flex items-center gap-2.5 text-[0.76rem]">
                      <span
                        aria-hidden="true"
                        className="h-4 w-[3px] shrink-0 rounded-full"
                        style={{ background: m?.accent || 'var(--rule-strong)' }}
                      />
                      <span className="num shrink-0 text-[0.7rem] muted">{f.tanggal.slice(5)}</span>
                      <span className="min-w-0 flex-1 truncate">{f.label}</span>
                      <span className="num shrink-0 font-semibold">{jam(f.menit)}</span>
                      <button type="button" onClick={() => removeFokus(f.id)} className="stepper" aria-label="Hapus sesi">
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </form>
      </div>

      <div className="mt-2.5 grid gap-2.5 xl:grid-cols-[1.3fr_1fr]">
        <GrafikFokus data={deret} />

        <div className="card">
          <h4 className="card__title">Ke mana jam fokusmu pergi</h4>
          <p className="mt-1 text-[0.72rem] muted">
            Pekan ini, {fmtRange(senin, hariIni)}. Total {jam(perMatkul.total)}.
          </p>

          {perMatkul.total > 0 ? (
            <div className="mt-5 space-y-3">
              {perMatkul.baris
                .slice()
                .sort((a, b) => b.menit - a.menit)
                .map(b => (
                  <div key={b.id}>
                    <div className="flex items-baseline justify-between gap-3 text-[0.76rem]">
                      <span className="flex items-center gap-2">
                        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-[2px]" style={{ background: b.warna }} />
                        {b.nama}
                      </span>
                      <span className="num font-semibold">{b.menit ? jam(b.menit) : '—'}</span>
                    </div>
                    <div className="bar__track mt-1.5">
                      <div
                        className="bar__fill"
                        style={{
                          width: `${perMatkul.total ? (b.menit / perMatkul.total) * 100 : 0}%`,
                          background: b.warna,
                        }}
                      />
                    </div>
                  </div>
                ))}

              <p className="border-t border-[var(--rule)] pt-3 text-[0.72rem] muted">
                Mata kuliah dengan batang terpendek biasanya bukan yang paling mudah, tapi yang paling
                kamu hindari. Cek yang nol.
              </p>
            </div>
          ) : (
            <p className="py-8 text-center text-[0.8rem] muted">
              Belum ada sesi pekan ini. Jalankan timer sekali dan batang pertamanya muncul.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

/* ============================== 05 TIDUR ============================== */
function SeksiTidur({ hariIni }: { hariIni: string }) {
  const s = getHarian();
  const deret = deretHarian(s, hariIni, 30);
  const panjang = deretHarian(s, hariIni, 45);

  const rTidurFokus = korelasi(
    panjang.filter(d => d.tidur != null && d.menit > 0).map(d => [d.tidur as number, d.menit] as [number, number]),
  );
  const rTidurMood = korelasi(
    panjang.filter(d => d.tidur != null && d.mood != null).map(d => [d.tidur as number, d.mood as number] as [number, number]),
  );
  const rTidurKebiasaan = korelasi(
    panjang.filter(d => d.tidur != null).map(d => [d.tidur as number, d.persen] as [number, number]),
  );

  const kartu = [
    { nama: 'Tidur → jam fokus', r: rTidurFokus, ket: 'Apakah malam yang cukup benar-benar berbuah hari yang produktif.' },
    { nama: 'Tidur → mood', r: rTidurMood, ket: 'Seberapa besar suasana harimu ditentukan malam sebelumnya.' },
    { nama: 'Tidur → kebiasaan', r: rTidurKebiasaan, ket: 'Apakah kurang tidur ikut menjatuhkan rutinitas harianmu.' },
  ];

  return (
    <>
      <Kepala
        id="tidur"
        num="05"
        judul="Tidur & energi"
        lede="Satu-satunya variabel yang menyentuh semua yang lain. Angkanya diisi di bagian Jurnal; di sini yang ditampilkan adalah akibatnya, dihitung dari catatanmu sendiri, bukan dari klaim umum di internet."
      />

      <div className="grid gap-2.5 xl:grid-cols-[1.3fr_1fr]">
        <GrafikTidur data={deret} />

        <div className="grid content-start gap-2.5">
          {kartu.map(k => (
            <div key={k.nama} className="card">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h4 className="card__title" style={{ fontSize: '0.95rem' }}>
                  {k.nama}
                </h4>
                <span className="display c-text" style={{ fontSize: '1.3rem', fontVariantNumeric: 'tabular-nums' }}>
                  {k.r == null ? '—' : k.r.toFixed(2)}
                </span>
              </div>
              <p className="mt-1.5 text-[0.74rem] leading-relaxed muted">
                {k.r == null
                  ? 'Data belum cukup. Butuh minimal 6 hari dengan kedua angka terisi sebelum korelasi layak ditampilkan.'
                  : `Bergerak ${bacaKorelasi(k.r)}. ${k.ket}`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================== 06 TARGET ============================== */
function PapanTarget({ periode, kunci, judul, ket }: { periode: Periode; kunci: string; judul: string; ket: string }) {
  const s = getHarian();
  const daftar = targetPeriode(s, periode, kunci);
  const r = ringkasTarget(daftar);
  const [teks, setTeks] = useState('');
  const [langkah, setLangkah] = useState(1);

  function kirim(e: FormEvent) {
    e.preventDefault();
    if (!teks.trim()) return;
    addTarget(teks, periode, kunci, langkah);
    setTeks('');
    setLangkah(1);
  }

  return (
    <div className="card">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h4 className="card__title">{judul}</h4>
        <span className="display c-text" style={{ fontSize: '1.4rem', fontVariantNumeric: 'tabular-nums' }}>
          {r.persen}%
        </span>
      </div>
      <p className="mt-1 text-[0.72rem] muted">{ket}</p>

      {daftar.length > 0 && (
        <div className="mt-5 space-y-4">
          {daftar.map(t => {
            const p = progresTarget(t);
            const tuntas = t.selesai >= t.langkah;
            return (
              <div key={t.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span
                    className="min-w-0 flex-1 text-[0.84rem] font-semibold"
                    style={{ letterSpacing: '-0.01em', textDecoration: tuntas ? 'line-through' : 'none', opacity: tuntas ? 0.55 : 1 }}
                  >
                    {t.teks}
                  </span>
                  <span className="num shrink-0 text-[0.74rem] muted">
                    {t.selesai}/{t.langkah}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <Bar value={p} className="flex-1" />
                  <button type="button" onClick={() => geserTarget(t.id, -1)} disabled={t.selesai <= 0} className="stepper" aria-label="Kurangi progres">
                    −
                  </button>
                  <button type="button" onClick={() => geserTarget(t.id, 1)} disabled={tuntas} className="stepper" aria-label="Tambah progres">
                    +
                  </button>
                  <button type="button" onClick={() => removeTarget(t.id)} className="stepper" aria-label="Hapus target">
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={kirim} className="mt-5 border-t border-[var(--rule)] pt-4">
        <div className="flex flex-wrap items-end gap-2">
          <label className="min-w-[10rem] flex-1">
            <span className="field__label">Target baru</span>
            <input
              className="input"
              value={teks}
              onChange={e => setTeks(e.target.value)}
              placeholder={periode === 'pekan' ? 'Selesaikan Tutorial 07' : 'Kuasai normalisasi sampai BCNF'}
              maxLength={90}
            />
          </label>
          <label className="w-[6.5rem]">
            <span className="field__label">Langkah</span>
            <input
              type="number"
              className="input"
              min={1}
              max={30}
              value={langkah}
              onChange={e => setLangkah(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
            />
          </label>
          <button type="submit" disabled={!teks.trim()} className="btn btn--c btn--sm">
            Tambah
          </button>
        </div>
      </form>

      {daftar.length === 0 && (
        <p className="mt-3 text-[0.74rem] muted">
          Belum ada target. Tiga saja sudah cukup, lebih dari itu bukan target lagi tapi daftar keinginan.
        </p>
      )}
    </div>
  );
}

function SeksiTarget({ hariIni }: { hariIni: string }) {
  const senin = kunciPekan(hariIni);
  const bulan = kunciBulan(hariIni);
  const hari = hariPekan(hariIni);

  return (
    <>
      <Kepala
        id="target"
        num="06"
        judul="Target"
        lede="Kebiasaan menjaga lantai, target mengangkat langit-langit. Yang satu soal tidak mundur, yang satu lagi soal maju ke sesuatu yang punya batas waktu dan bisa dinyatakan selesai."
      />

      <div className="grid gap-2.5 lg:grid-cols-2">
        <PapanTarget
          periode="pekan"
          kunci={senin}
          judul="Pekan ini"
          ket={`${fmtRange(hari[0], hari[6])}. Target yang bisa tuntas dalam tujuh hari.`}
        />
        <PapanTarget
          periode="bulan"
          kunci={bulan}
          judul={namaBulanHarian(bulan)}
          ket="Target yang butuh beberapa pekan, dipecah jadi langkah-langkah."
        />
      </div>
    </>
  );
}

/* ============================== 07 TINJAUAN ============================== */
function SeksiTinjauan({ hariIni }: { hariIni: string }) {
  const s = getHarian();
  const butir = tinjauan(s, hariIni);
  const pola = polaHari(s, hariIni, 8);

  const nadaKelas: Record<string, string> = {
    baik: 'stat--lime',
    awas: 'stat--red',
    netral: 'stat--c',
  };

  return (
    <>
      <Kepala
        id="tinjauan"
        num="07"
        judul="Tinjauan"
        lede="Disusun ulang tiap kali halaman ini dibuka, dari data yang kamu isi sendiri. Butir yang datanya belum cukup sengaja tidak muncul, karena kesimpulan dari tiga hari catatan bukan temuan, itu kebetulan."
      />

      {butir.length === 0 ? (
        <div className="card">
          <Kosong
            judul="Belum cukup data untuk ditinjau"
            catatan="Isi kebiasaan dan jurnal selama sekitar dua pekan, lalu bagian ini mulai punya sesuatu untuk dikatakan."
          />
        </div>
      ) : (
        <div className="grid gap-2.5 xl:grid-cols-[1.25fr_1fr]">
          <div className="grid content-start gap-2.5">
            {butir.map((b, i) => (
              <Reveal key={b.judul} delay={i * 60} className={`stat ${nadaKelas[b.nada]}`}>
                <span className="stat__label">
                  {b.nada === 'baik' ? 'Berjalan baik' : b.nada === 'awas' ? 'Perlu perhatian' : 'Catatan'}
                </span>
                <span className="mt-2 block text-[1.05rem] font-semibold" style={{ letterSpacing: '-0.02em' }}>
                  {b.judul}
                </span>
                <span className="stat__note mt-2">{b.isi}</span>
              </Reveal>
            ))}
          </div>

          <PolaPekan data={pola} />
        </div>
      )}
    </>
  );
}

/* ============================== PAPAN ============================== */
export default function HarianBoard() {
  useStore();

  /* Tanggal dibaca setelah mount supaya HTML yang di-prerender tidak pernah
     berbeda dari yang dirender ulang di browser pemakai. */
  const [hariIni, setHariIni] = useState<string | null>(null);
  useEffect(() => setHariIni(todayYmd()), []);

  if (!hariIni) {
    return (
      <div className="shell section">
        <p className="text-[0.85rem] muted">Menyiapkan catatan harianmu…</p>
      </div>
    );
  }

  return (
    <>
      <section className="shell section">
        <Kepala
          id="ringkasan"
          num="01"
          judul="Ringkasan"
          lede={`${fmtDateLong(hariIni)}. Empat angka yang paling cepat memberitahu apakah pekan ini sedang kamu pegang atau sedang lepas.`}
        />
        <Ringkasan hariIni={hariIni} />
      </section>

      <hr className="rule" />
      <section className="shell section">
        <SeksiKebiasaan hariIni={hariIni} />
      </section>

      <hr className="rule" />
      <section className="shell section">
        <SeksiJurnal hariIni={hariIni} />
      </section>

      <hr className="rule" />
      <section className="shell section">
        <SeksiFokus hariIni={hariIni} />
      </section>

      <hr className="rule" />
      <section className="shell section">
        <SeksiTidur hariIni={hariIni} />
      </section>

      <hr className="rule" />
      <section className="shell section">
        <SeksiTarget hariIni={hariIni} />
      </section>

      <hr className="rule" />
      <section className="shell section">
        <SeksiTinjauan hariIni={hariIni} />
      </section>
    </>
  );
}
