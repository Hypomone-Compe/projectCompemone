'use client';

/* ==========================================================================
   Papan keuangan.

   Urutan seksi mengikuti seberapa sering dipakai, bukan urutan laporan:
   1. Aksi cepat (scan struk / catat) selalu di atas, juga di HP.
   2. Ringkasan bulan + sisa anggaran: "masih aman belanja?".
   3. Transaksi: cari, saring, ubah, hapus. Hapus terlihat di HP (dulu hanya
      muncul saat hover, jadi mustahil diketuk dari ponsel).
   4. Anggaran per kategori, 5. Grafik pergerakan, 6. Investasi.
   ========================================================================== */
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowDownLeft, ArrowUpRight, Camera, Pencil, Plus, Receipt, Search, Trash2, X,
} from 'lucide-react';
import { Alert, Badge, Button, EmptyState, Progress } from '@/components/ui';
import { todayYmd } from '@/lib/kalender';
import {
  bacaRupiah, bulanDari, bulanTersedia, JENIS_INVESTASI, KATEGORI_KELUAR, KATEGORI_MASUK,
  namaBulan, perKategori, rasioBelanja, rataPengeluaran, ringkasBulan, ringkasInvestasi,
  riwayatBulanan, rupiah, rupiahRingkas, runwayBulan, saldoKas, type ArusKas, type Transaksi,
} from '@/lib/keuangan';
import {
  addInvestasi, addTransaksi, getAnggaran, getKeuangan, patchInvestasi, patchTransaksi, removeInvestasi,
  removeTransaksi, setAnggaran, setAnggaranKategori, useStore,
} from '@/lib/store';
import { hapusStruk, urlStruk } from '@/lib/struk-foto';
import { cn } from '@/lib/utils';
import { GrafikArusKas, GrafikSaldo, KartuRunway, MeterRasio, WARNA_KELUAR, WARNA_MASUK } from './Grafik';
import ScanStruk from './ScanStruk';

const PINTAS = [10_000, 20_000, 50_000, 100_000];

function Kepala({ id, eyebrow, judul, ket, aksi }: { id: string; eyebrow: string; judul: string; ket?: string; aksi?: React.ReactNode }) {
  return (
    <div id={id} className="mb-6 flex scroll-mt-40 flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-c">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{judul}</h2>
        {ket && <p className="mt-2 text-[15px] leading-relaxed text-secondary">{ket}</p>}
      </div>
      {aksi}
    </div>
  );
}

/* ================================ RINGKASAN ================================ */
function Ringkasan({ bulan }: { bulan: string }) {
  const { transaksi, investasi } = getKeuangan();
  const ang = getAnggaran();
  const r = ringkasBulan(transaksi, bulan);
  const kas = saldoKas(transaksi);
  const inv = ringkasInvestasi(investasi);
  const kini = bulan === bulanDari(todayYmd());

  /* Sisa anggaran per hari: yang paling berguna dibaca di tengah bulan. */
  const [th, bl] = bulan.split('-').map(Number);
  const hariBulan = new Date(th, bl, 0).getDate();
  const hariIni = Number(todayYmd().slice(8, 10));
  const sisaHari = kini ? hariBulan - hariIni + 1 : 0;
  const sisaAnggaran = ang.bulanan > 0 ? ang.bulanan - r.keluar : null;

  const ubin = [
    { label: 'Saldo kas', nilai: rupiahRingkas(kas), ket: `Kekayaan bersih ${rupiahRingkas(kas + inv.nilai)} termasuk investasi.`, warna: 'border-t-ink' },
    { label: `Masuk ${namaBulan(bulan)}`, nilai: rupiahRingkas(r.masuk), ket: r.masuk ? 'Uang saku, honor, beasiswa, dll.' : 'Belum ada pemasukan.', warna: 'border-t-blue' },
    { label: `Keluar ${namaBulan(bulan)}`, nilai: rupiahRingkas(r.keluar), ket: `${r.jumlahTransaksi} transaksi tercatat.`, warna: 'border-t-accent' },
    {
      label: 'Sisa bulan ini',
      nilai: rupiahRingkas(r.selisih),
      ket: r.selisih < 0 ? 'Pengeluaran melebihi pemasukan.' : r.selisih > 0 ? 'Bisa disisihkan ke tabungan.' : 'Belum ada selisih.',
      warna: r.selisih < 0 ? 'border-t-red' : 'border-t-success',
    },
  ];

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ubin.map(u => (
          <div key={u.label} className={cn('rounded-2xl border border-t-4 border-border bg-surface p-5 shadow-sm', u.warna)}>
            <p className="text-[12.5px] font-bold text-muted">{u.label}</p>
            <p className="num mt-1.5 text-3xl font-extrabold tracking-tight">{u.nilai}</p>
            <p className="mt-1.5 text-[13px] leading-snug text-secondary">{u.ket}</p>
          </div>
        ))}
      </div>

      <AnggaranBulanan bulan={bulan} keluar={r.keluar} sisa={sisaAnggaran} sisaHari={sisaHari} />
    </>
  );
}

function AnggaranBulanan({ bulan, keluar, sisa, sisaHari }: { bulan: string; keluar: number; sisa: number | null; sisaHari: number }) {
  const ang = getAnggaran();
  const [ubah, setUbah] = useState(false);
  const [isi, setIsi] = useState(ang.bulanan ? String(ang.bulanan) : '');
  const persen = ang.bulanan > 0 ? (keluar / ang.bulanan) * 100 : 0;

  function simpan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAnggaran({ bulanan: bacaRupiah(isi) });
    setUbah(false);
  }

  return (
    <div className="mt-3 rounded-2xl bg-navy p-5 text-white shadow-lg sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12.5px] font-bold text-pink-light">Anggaran belanja {namaBulan(bulan)}</p>
          {ang.bulanan > 0 ? (
            <p className="mt-1.5 text-2xl font-extrabold tracking-tight">
              {sisa! >= 0 ? `Sisa ${rupiah(sisa!)}` : `Lewat ${rupiah(-sisa!)}`}
              <span className="ml-2 text-[14px] font-semibold text-white/60">dari {rupiah(ang.bulanan)}</span>
            </p>
          ) : (
            <p className="mt-1.5 text-[15px] text-white/75">Belum ada batas. Pasang satu angka supaya tahu kapan harus mengerem.</p>
          )}
          {ang.bulanan > 0 && sisaHari > 0 && sisa! > 0 && (
            <p className="mt-1 text-[13px] text-white/70">
              ≈ {rupiah(Math.floor(sisa! / sisaHari))} per hari untuk {sisaHari} hari tersisa.
            </p>
          )}
        </div>
        {ubah ? (
          <form onSubmit={simpan} className="flex gap-2">
            <input
              inputMode="numeric"
              value={isi}
              onChange={e => setIsi(e.target.value)}
              placeholder="1500000"
              aria-label="Anggaran bulanan"
              className="input num w-40 !border-white/20 !bg-white/10 !text-white"
              autoFocus
            />
            <button type="submit" className="btn btn--light btn--sm">Simpan</button>
          </form>
        ) : (
          <button type="button" onClick={() => setUbah(true)} className="btn btn--light btn--sm">
            <Pencil aria-hidden className="size-4" /> {ang.bulanan ? 'Ubah' : 'Pasang anggaran'}
          </button>
        )}
      </div>
      {ang.bulanan > 0 && (
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuenow={Math.round(persen)} aria-valuemin={0} aria-valuemax={100} aria-label="Anggaran terpakai">
          <div
            className={cn('h-full rounded-full transition-[width] duration-slow', persen > 100 ? 'bg-red' : persen > 80 ? 'bg-warning' : 'bg-pink-light')}
            style={{ width: `${Math.min(100, persen)}%` }}
          />
        </div>
      )}
    </div>
  );
}

/* ============================ FORMULIR TRANSAKSI ============================ */
function FormTransaksi({ awal, onSelesai }: { awal?: Transaksi | null; onSelesai?: () => void }) {
  const [jenis, setJenis] = useState<ArusKas>(awal?.jenis ?? 'keluar');
  const [tanggal, setTanggal] = useState(awal?.tanggal ?? todayYmd());
  const [kategori, setKategori] = useState(awal?.kategori ?? KATEGORI_KELUAR[0]);
  const [jumlah, setJumlah] = useState(awal ? String(awal.jumlah) : '');
  const [merchant, setMerchant] = useState(awal?.merchant ?? '');
  const [catatan, setCatatan] = useState(awal?.catatan ?? '');
  const [kabar, setKabar] = useState('');

  const daftar = jenis === 'masuk' ? KATEGORI_MASUK : KATEGORI_KELUAR;
  const nilai = bacaRupiah(jumlah);

  function gantiJenis(j: ArusKas) {
    setJenis(j);
    const d = j === 'masuk' ? KATEGORI_MASUK : KATEGORI_KELUAR;
    if (!d.includes(kategori)) setKategori(d[0]);
  }

  function simpan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (nilai <= 0) return;
    const isi = { tanggal, jenis, kategori, jumlah: nilai, catatan: catatan.trim(), merchant: merchant.trim() || null };
    if (awal) patchTransaksi(awal.id, isi);
    else addTransaksi({ ...isi, sumber: 'manual' });
    setKabar(`${awal ? 'Diperbarui' : 'Tercatat'}: ${jenis === 'masuk' ? '+' : '−'}${rupiah(nilai)} · ${kategori}`);
    if (!awal) {
      setJumlah('');
      setCatatan('');
      setMerchant('');
    }
    onSelesai?.();
  }

  return (
    <form onSubmit={simpan} className="space-y-4">
      <div role="group" aria-label="Jenis transaksi" className="grid grid-cols-2 gap-1 rounded-full bg-navy-5 p-[5px] sm:inline-grid sm:w-80">
        {(['keluar', 'masuk'] as ArusKas[]).map(j => (
          <button
            key={j}
            type="button"
            aria-pressed={jenis === j}
            onClick={() => gantiJenis(j)}
            className={cn('flex items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-bold transition-all', jenis === j ? 'bg-navy text-white shadow-sm' : 'text-secondary')}
          >
            {j === 'keluar' ? <ArrowUpRight aria-hidden className="size-4" /> : <ArrowDownLeft aria-hidden className="size-4" />}
            {j === 'keluar' ? 'Pengeluaran' : 'Pemasukan'}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <label className="block">
          <span className="field__label">Jumlah</span>
          <input inputMode="numeric" value={jumlah} onChange={e => setJumlah(e.target.value)} placeholder="25000" className="input num !text-xl !font-extrabold" required />
          <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {PINTAS.map(p => (
              <button key={p} type="button" onClick={() => setJumlah(String(p))} className="rounded-full bg-navy-5 px-2.5 py-1 text-[12px] font-bold text-secondary hover:bg-navy hover:text-white">
                {rupiahRingkas(p)}
              </button>
            ))}
            <span className="ml-1 text-[12.5px] text-muted">{nilai > 0 ? rupiah(nilai) : 'Ketik angkanya saja.'}</span>
          </span>
        </label>
        <label className="block">
          <span className="field__label">Tanggal</span>
          <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} className="input" required />
        </label>
      </div>

      <div>
        <span className="field__label">Kategori</span>
        <div className="flex flex-wrap gap-1.5">
          {daftar.map(k => (
            <button key={k} type="button" onClick={() => setKategori(k)} aria-pressed={kategori === k} className={cn('opt !px-3 !py-1.5 !text-[13px]', kategori === k && 'is-on')}>
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="field__label">Toko / sumber</span>
          <input value={merchant ?? ''} onChange={e => setMerchant(e.target.value)} placeholder="Opsional, mis. Kantin Fasilkom" className="input" />
        </label>
        <label className="block">
          <span className="field__label">Catatan</span>
          <input value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Opsional" className="input" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={nilai <= 0}>
          {awal ? 'Simpan perubahan' : `Catat ${jenis === 'masuk' ? 'pemasukan' : 'pengeluaran'}`}
        </Button>
        {kabar && !awal && (
          <span role="status" className="text-[13.5px] font-bold text-success">
            ✓ {kabar}
          </span>
        )}
      </div>
    </form>
  );
}

/* ============================== DAFTAR TRANSAKSI ============================== */
function DaftarTransaksi({ bulan }: { bulan: string }) {
  const { transaksi } = getKeuangan();
  const [cari, setCari] = useState('');
  const [saring, setSaring] = useState<'semua' | ArusKas>('semua');
  const [edit, setEdit] = useState<Transaksi | null>(null);
  const [lihat, setLihat] = useState<string | null>(null);

  const daftar = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return transaksi.filter(
      t =>
        bulanDari(t.tanggal) === bulan &&
        (saring === 'semua' || t.jenis === saring) &&
        (!q || `${t.kategori} ${t.catatan} ${t.merchant || ''}`.toLowerCase().includes(q)),
    );
  }, [transaksi, bulan, cari, saring]);

  /* Dikelompokkan per tanggal, dengan total keluar harian. */
  const grup = useMemo(() => {
    const m = new Map<string, Transaksi[]>();
    daftar.forEach(t => m.set(t.tanggal, [...(m.get(t.tanggal) || []), t]));
    return [...m.entries()];
  }, [daftar]);

  async function bukaStruk(path: string) {
    setLihat('memuat');
    setLihat((await urlStruk(path)) || null);
  }

  function hapus(t: Transaksi) {
    if (!window.confirm(`Hapus ${t.jenis === 'masuk' ? 'pemasukan' : 'pengeluaran'} ${rupiah(t.jumlah)} (${t.kategori})?`)) return;
    removeTransaksi(t.id);
    if (t.struk) void hapusStruk(t.struk);
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-72">
          <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <input value={cari} onChange={e => setCari(e.target.value)} placeholder="Cari kategori, toko, catatan…" aria-label="Cari transaksi" className="input !pl-10" />
        </div>
        <div role="group" aria-label="Saring jenis" className="inline-flex gap-1 rounded-full bg-navy-5 p-[5px]">
          {(['semua', 'keluar', 'masuk'] as const).map(s => (
            <button key={s} type="button" aria-pressed={saring === s} onClick={() => setSaring(s)} className={cn('rounded-full px-4 py-2 text-sm font-bold capitalize', saring === s ? 'bg-navy text-white shadow-sm' : 'text-secondary')}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {grup.length === 0 ? (
        <EmptyState
          icon={<Receipt />}
          title={cari || saring !== 'semua' ? 'Tidak ada yang cocok' : `Belum ada transaksi di ${namaBulan(bulan)}`}
          description="Scan struk atau catat manual, lima detik selesai."
        />
      ) : (
        <div className="mt-5 space-y-5">
          {grup.map(([tgl, isi]) => {
            const keluar = isi.filter(t => t.jenis === 'keluar').reduce((a, t) => a + t.jumlah, 0);
            return (
              <section key={tgl}>
                <div className="mb-1.5 flex items-baseline justify-between px-1 text-[12.5px] font-bold text-muted">
                  <span>{new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${tgl}T00:00:00`))}</span>
                  {keluar > 0 && <span className="num">−{rupiah(keluar)}</span>}
                </div>
                <ul className="divide-y divide-divider overflow-hidden rounded-xl border border-border">
                  {isi.map(t => {
                    const masuk = t.jenis === 'masuk';
                    return (
                      <li key={t.id} className="flex items-center gap-3 bg-surface px-3 py-3 sm:px-4">
                        <span
                          aria-hidden
                          className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: masuk ? 'rgba(111, 134, 255, 0.15)' : 'rgba(255, 107, 94, 0.14)', color: masuk ? WARNA_MASUK : WARNA_KELUAR }}
                        >
                          {masuk ? <ArrowDownLeft className="size-5" /> : <ArrowUpRight className="size-5" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-1.5 text-[14.5px] font-bold">
                            {t.kategori}
                            {t.sumber === 'struk' && <Badge variant="pink" className="!px-2 !py-0 !text-[10.5px]">struk</Badge>}
                          </span>
                          <span className="block truncate text-[12.5px] text-muted">
                            {[t.merchant, t.catatan].filter(Boolean).join(' · ') || '—'}
                          </span>
                        </span>
                        <span className={cn('num shrink-0 text-[15px] font-extrabold', masuk ? 'text-blue' : 'text-ink')}>
                          {masuk ? '+' : '−'}
                          {rupiah(t.jumlah)}
                        </span>
                        <span className="flex shrink-0 items-center">
                          {t.struk && (
                            <button type="button" onClick={() => void bukaStruk(t.struk!)} aria-label="Lihat foto struk" className="flex size-9 items-center justify-center rounded-full text-muted hover:bg-navy-5 hover:text-ink">
                              <Receipt aria-hidden className="size-4" />
                            </button>
                          )}
                          <button type="button" onClick={() => setEdit(t)} aria-label={`Ubah ${t.kategori}`} className="flex size-9 items-center justify-center rounded-full text-muted hover:bg-navy-5 hover:text-ink">
                            <Pencil aria-hidden className="size-4" />
                          </button>
                          <button type="button" onClick={() => hapus(t)} aria-label={`Hapus ${t.kategori}`} className="flex size-9 items-center justify-center rounded-full text-muted hover:bg-red-pale hover:text-red">
                            <Trash2 aria-hidden className="size-4" />
                          </button>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {edit && (
        <Lembar judul="Ubah transaksi" onClose={() => setEdit(null)}>
          <FormTransaksi key={edit.id} awal={edit} onSelesai={() => setEdit(null)} />
        </Lembar>
      )}
      {lihat && (
        <Lembar judul="Foto struk" onClose={() => setLihat(null)}>
          {lihat === 'memuat' ? (
            <p className="py-10 text-center text-sm text-muted">Memuat…</p>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={lihat} alt="Foto struk" className="mx-auto max-h-[70dvh] rounded-xl object-contain" />
          )}
        </Lembar>
      )}
    </div>
  );
}

function Lembar({ judul, onClose, children }: { judul: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-3 sm:items-center" role="dialog" aria-modal="true" aria-label={judul}>
      <button type="button" aria-label="Tutup" onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div data-lenis-prevent className="relative max-h-[90dvh] w-full max-w-[620px] overflow-y-auto rounded-2xl bg-surface p-5 shadow-xl sm:p-6" style={{ animation: 'rise .3s var(--ease-out) both' }}>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-lg font-extrabold">{judul}</p>
          <button type="button" onClick={onClose} aria-label="Tutup" className="flex size-9 items-center justify-center rounded-full hover:bg-navy-5">
            <X aria-hidden className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ============================ KATEGORI & ANGGARAN ============================ */
function Kategori({ bulan }: { bulan: string }) {
  const { transaksi } = getKeuangan();
  const ang = getAnggaran();
  const keluar = perKategori(transaksi, bulan, 'keluar');
  const masuk = perKategori(transaksi, bulan, 'masuk');
  const terpakai = new Map(keluar.map(b => [b.kategori, b.jumlah]));

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <p className="text-[13px] font-bold text-muted">Pengeluaran per kategori vs batas</p>
        <ul className="mt-4 space-y-4">
          {KATEGORI_KELUAR.map(k => {
            const pakai = terpakai.get(k) || 0;
            const batas = ang.kategori[k] || 0;
            if (!pakai && !batas) return null;
            const persen = batas ? (pakai / batas) * 100 : 0;
            return (
              <li key={k}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[14.5px] font-bold">{k}</span>
                  <span className="num text-[13px] text-secondary">
                    {rupiah(pakai)}
                    {batas > 0 && <span className="text-muted"> / {rupiah(batas)}</span>}
                  </span>
                </div>
                <Progress
                  value={batas ? persen : 100}
                  className="mt-1.5"
                  barClassName={!batas ? 'bg-navy-30' : persen > 100 ? 'bg-red' : persen > 80 ? 'bg-warning' : 'bg-success'}
                  aria-label={`${k} terpakai`}
                />
                <BatasKategori kategori={k} batas={batas} />
              </li>
            );
          })}
        </ul>
        {!keluar.length && !Object.keys(ang.kategori).length && (
          <p className="mt-4 text-sm text-muted">Belum ada pengeluaran bulan ini.</p>
        )}
        <TambahBatas ada={new Set([...terpakai.keys(), ...Object.keys(ang.kategori)])} />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <p className="text-[13px] font-bold text-muted">Dari mana uangnya datang</p>
        {masuk.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Belum ada pemasukan bulan ini.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {masuk.map(b => (
              <li key={b.kategori}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[14.5px] font-bold">{b.kategori}</span>
                  <span className="num text-[13px] text-secondary">
                    {rupiah(b.jumlah)} <span className="text-muted">{Math.round(b.rasio * 100)}%</span>
                  </span>
                </div>
                <Progress value={b.rasio * 100} className="mt-1.5" barClassName="bg-blue" aria-label={b.kategori} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function BatasKategori({ kategori, batas }: { kategori: string; batas: number }) {
  const [buka, setBuka] = useState(false);
  const [isi, setIsi] = useState(batas ? String(batas) : '');
  if (!buka)
    return (
      <button type="button" onClick={() => setBuka(true)} className="mt-1 text-[12px] font-bold text-muted hover:text-ink">
        {batas ? 'Ubah batas' : '+ Pasang batas'}
      </button>
    );
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        setAnggaranKategori(kategori, bacaRupiah(isi));
        setBuka(false);
      }}
      className="mt-2 flex gap-2"
    >
      <input inputMode="numeric" value={isi} onChange={e => setIsi(e.target.value)} placeholder="0 = tanpa batas" aria-label={`Batas ${kategori}`} className="input num !py-2" autoFocus />
      <button type="submit" className="btn btn--sm">Simpan</button>
    </form>
  );
}

function TambahBatas({ ada }: { ada: Set<string> }) {
  const sisa = KATEGORI_KELUAR.filter(k => !ada.has(k));
  const [k, setK] = useState('');
  const [isi, setIsi] = useState('');
  if (!sisa.length) return null;
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (!k) return;
        setAnggaranKategori(k, bacaRupiah(isi));
        setK('');
        setIsi('');
      }}
      className="mt-5 flex flex-wrap gap-2 border-t border-divider pt-4"
    >
      <select value={k} onChange={e => setK(e.target.value)} aria-label="Kategori" className="input !w-auto !py-2">
        <option value="">Batas kategori lain…</option>
        {sisa.map(x => (
          <option key={x}>{x}</option>
        ))}
      </select>
      <input inputMode="numeric" value={isi} onChange={e => setIsi(e.target.value)} placeholder="300000" aria-label="Jumlah batas" className="input num !w-36 !py-2" />
      <button type="submit" disabled={!k || bacaRupiah(isi) <= 0} className="btn btn--sm">
        <Plus aria-hidden className="size-4" /> Tambah
      </button>
    </form>
  );
}

/* ================================ PERGERAKAN ================================ */
function Pergerakan({ bulan }: { bulan: string }) {
  const { transaksi } = getKeuangan();
  const riwayat = useMemo(() => riwayatBulanan(transaksi, bulan, 6), [transaksi, bulan]);
  const r = ringkasBulan(transaksi, bulan);
  const rasio = rasioBelanja(r.masuk, r.keluar);
  const kas = saldoKas(transaksi);
  const rata = rataPengeluaran(riwayat);
  return (
    <>
      <div className="grid gap-3 xl:grid-cols-2">
        <GrafikArusKas data={riwayat} />
        <GrafikSaldo data={riwayat} />
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <MeterRasio masuk={r.masuk} keluar={r.keluar} persen={rasio.persen} status={rasio.status} label={rasio.label} />
        <KartuRunway saldo={kas} rataKeluar={rata} bulan={runwayBulan(kas, rata)} />
      </div>
    </>
  );
}

/* ================================ INVESTASI ================================ */
function Portofolio() {
  const { investasi } = getKeuangan();
  const r = ringkasInvestasi(investasi);
  const [nama, setNama] = useState('');
  const [jenis, setJenis] = useState(JENIS_INVESTASI[0]);
  const [modal, setModal] = useState('');
  const [nilai, setNilai] = useState('');

  function simpan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const m = bacaRupiah(modal);
    if (!nama.trim() || m <= 0) return;
    addInvestasi({ nama: nama.trim(), jenis, modal: m, nilai: bacaRupiah(nilai) || m, diperbarui: todayYmd(), catatan: '' });
    setNama('');
    setModal('');
    setNilai('');
  }

  return (
    <>
      {investasi.length > 0 && (
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          {[
            { l: 'Modal disetor', v: rupiahRingkas(r.modal) },
            { l: 'Nilai sekarang', v: rupiahRingkas(r.nilai) },
            {
              l: 'Untung / rugi',
              v: `${r.selisih >= 0 ? '+' : ''}${rupiahRingkas(r.selisih)}${r.imbalHasil != null ? ` (${r.imbalHasil >= 0 ? '+' : ''}${r.imbalHasil.toFixed(1).replace('.', ',')}%)` : ''}`,
            },
          ].map(x => (
            <div key={x.l} className="relative overflow-hidden rounded-2xl bg-navy p-5 text-white">
              <p className="text-[12.5px] text-white/65">{x.l}</p>
              <p className="num mt-1 text-2xl font-extrabold tracking-tight">{x.v}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={simpan} className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="field__label">Nama</span>
            <input value={nama} onChange={e => setNama(e.target.value)} placeholder="Misal: Bibit RDPU" className="input" />
          </label>
          <label className="block">
            <span className="field__label">Jenis</span>
            <select value={jenis} onChange={e => setJenis(e.target.value)} className="input">
              {JENIS_INVESTASI.map(j => (
                <option key={j}>{j}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field__label">Modal disetor</span>
            <input inputMode="numeric" value={modal} onChange={e => setModal(e.target.value)} placeholder="500000" className="input num" />
          </label>
          <label className="block">
            <span className="field__label">Nilai sekarang</span>
            <input inputMode="numeric" value={nilai} onChange={e => setNilai(e.target.value)} placeholder="Kosong = sama dengan modal" className="input num" />
          </label>
        </div>
        <Button type="submit" className="mt-4">
          Tambah instrumen
        </Button>
      </form>

      {investasi.length > 0 && (
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {investasi.map(x => {
            const selisih = x.nilai - x.modal;
            const persen = x.modal > 0 ? (selisih / x.modal) * 100 : 0;
            return (
              <li key={x.id} className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-bold text-muted">{x.jenis}</p>
                    <p className="text-[17px] font-extrabold tracking-tight">{x.nama}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.confirm(`Hapus ${x.nama}?`) && removeInvestasi(x.id)}
                    aria-label={`Hapus ${x.nama}`}
                    className="flex size-9 items-center justify-center rounded-full text-muted hover:bg-red-pale hover:text-red"
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
                  <span className="num text-2xl font-extrabold">{rupiah(x.nilai)}</span>
                  <span className={cn('num text-[13.5px] font-bold', selisih >= 0 ? 'text-success' : 'text-red')}>
                    {selisih >= 0 ? '+' : ''}
                    {rupiah(selisih)} ({persen.toFixed(1).replace('.', ',')}%)
                  </span>
                </div>
                <label className="mt-3 block">
                  <span className="field__label">Perbarui nilai sekarang</span>
                  <input
                    inputMode="numeric"
                    defaultValue={x.nilai}
                    onBlur={e => {
                      const v = bacaRupiah(e.target.value);
                      if (v > 0 && v !== x.nilai) patchInvestasi(x.id, { nilai: v, diperbarui: todayYmd() });
                    }}
                    className="input num"
                  />
                </label>
                <p className="mt-2 text-[12.5px] text-muted">
                  Modal {rupiah(x.modal)} · diperbarui {x.diperbarui || 'belum pernah'}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

/* ================================== PAPAN ================================== */
export default function KeuanganBoard() {
  useStore();
  const params = useSearchParams();
  const { transaksi } = getKeuangan();
  const [scan, setScan] = useState(false);
  const [catat, setCatat] = useState(false);

  /* /keuangan?scan=1 (tab bawah HP, pintasan PWA) langsung membuka kamera. */
  useEffect(() => {
    if (params.get('scan') === '1') setScan(true);
  }, [params]);

  const tersedia = useMemo(() => {
    const daftar = bulanTersedia(transaksi);
    const kini = bulanDari(todayYmd());
    return daftar.includes(kini) ? daftar : [kini, ...daftar];
  }, [transaksi]);
  const [bulan, setBulan] = useState(() => bulanDari(todayYmd()));
  const bulanAktif = tersedia.includes(bulan) ? bulan : tersedia[0];

  function tutupScan() {
    setScan(false);
    if (params.get('scan')) window.history.replaceState(null, '', '/keuangan');
  }

  return (
    <div className="shell space-y-14 pb-16 pt-4 sm:space-y-20">
      {/* Aksi cepat */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button size="lg" onClick={() => setScan(true)}>
            <Camera aria-hidden /> Scan struk
          </Button>
          <Button size="lg" variant="navy" onClick={() => setCatat(true)}>
            <Plus aria-hidden /> Catat manual
          </Button>
        </div>
        {tersedia.length > 1 ? (
          <label className="flex items-center gap-2 text-[13.5px] font-bold text-secondary">
            Bulan
            <select value={bulanAktif} onChange={e => setBulan(e.target.value)} className="input !w-auto !py-2">
              {tersedia.map(b => (
                <option key={b} value={b}>
                  {namaBulan(b)}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="px-1 text-[13.5px] font-bold text-secondary">{namaBulan(bulanAktif)}</p>
        )}
      </div>

      {!transaksi.length && (
        <Alert variant="info" title="Mulai dari satu struk">
          Belum ada transaksi tersimpan. Pindahkan data lama lewat Impor data di footer, atau scan struk pertamamu sekarang.
        </Alert>
      )}

      <section>
        <Kepala id="ringkasan" eyebrow="Ringkasan" judul="Posisi uangmu bulan ini" />
        <Ringkasan bulan={bulanAktif} />
      </section>

      <section>
        <Kepala id="catat" eyebrow="Transaksi" judul={`Catatan ${namaBulan(bulanAktif)}`} ket="Diurutkan per hari. Ketuk pensil untuk mengubah, tong sampah untuk menghapus, ikon struk untuk melihat fotonya." />
        <DaftarTransaksi bulan={bulanAktif} />
      </section>

      <section>
        <Kepala id="kategori" eyebrow="Anggaran" judul="Ke mana perginya, dan batasnya" ket="Pasang batas per kategori. Bilah berubah kuning di 80% dan merah saat lewat." />
        <Kategori bulan={bulanAktif} />
      </section>

      <section>
        <Kepala id="pergerakan" eyebrow="Pergerakan" judul="Enam bulan terakhir" ket="Belanja vs pemasukan, arah saldo, porsi pemasukan yang habis, dan berapa lama saldo sanggup bertahan." />
        <Pergerakan bulan={bulanAktif} />
      </section>

      <section>
        <Kepala id="investasi" eyebrow="Investasi" judul="Yang disisihkan, bekerja diam-diam" ket="Dicatat manual. Perbarui nilainya sebulan sekali sudah cukup." />
        <Portofolio />
      </section>

      {catat && (
        <Lembar judul="Catat transaksi" onClose={() => setCatat(false)}>
          <FormTransaksi />
        </Lembar>
      )}
      <ScanStruk open={scan} onClose={tutupScan} />
    </div>
  );
}
