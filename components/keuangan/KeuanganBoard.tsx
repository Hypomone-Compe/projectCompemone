'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Bar, Reveal } from '@/components/ui';
import { todayYmd } from '@/lib/kalender';
import {
  bacaRupiah, bulanDari, bulanTersedia, JENIS_INVESTASI, KATEGORI_KELUAR, KATEGORI_MASUK,
  namaBulan, perKategori, rasioBelanja, rataPengeluaran, ringkasBulan, ringkasInvestasi,
  riwayatBulanan, rupiah, rupiahRingkas, runwayBulan, saldoKas, type ArusKas,
} from '@/lib/keuangan';
import { GrafikArusKas, GrafikSaldo, KartuRunway, MeterRasio, WARNA_KELUAR, WARNA_MASUK } from './Grafik';
import {
  addInvestasi, addTransaksi, getKeuangan, patchInvestasi, removeInvestasi,
  removeTransaksi, useStore,
} from '@/lib/store';

/* Empat ubin pembuka. Sengaja angka tunggal, bukan grafik: untuk satu nilai
   berjalan, ubin statistik lebih terbaca daripada diagram satu batang. */
function Ringkasan({ bulan }: { bulan: string }) {
  const { transaksi, investasi } = getKeuangan();
  const r = ringkasBulan(transaksi, bulan);
  const kas = saldoKas(transaksi);
  const inv = ringkasInvestasi(investasi);

  const ubin = [
    {
      label: 'Kekayaan bersih',
      nilai: rupiahRingkas(kas + inv.nilai),
      catatan: `Saldo kas ${rupiah(kas)} ditambah nilai investasi ${rupiah(inv.nilai)}.`,
      nada: 'stat--c',
    },
    {
      label: `Masuk ${namaBulan(bulan)}`,
      nilai: rupiahRingkas(r.masuk),
      catatan: r.masuk ? 'Uang saku, honor, dan pemasukan lain bulan ini.' : 'Belum ada pemasukan tercatat.',
      nada: 'stat--lime',
    },
    {
      label: `Keluar ${namaBulan(bulan)}`,
      nilai: rupiahRingkas(r.keluar),
      catatan: r.keluar ? `Dari ${r.jumlahTransaksi} transaksi tercatat.` : 'Belum ada pengeluaran tercatat.',
      nada: 'stat--red',
    },
    {
      label: 'Sisa bulan ini',
      nilai: rupiahRingkas(r.selisih),
      catatan:
        r.selisih > 0
          ? 'Lebih besar dari pengeluaran. Sisanya layak dipindahkan ke investasi.'
          : r.selisih < 0
            ? 'Pengeluaran melebihi pemasukan. Lihat kategori terbesar di bawah.'
            : 'Belum ada selisih untuk dihitung.',
      nada: r.selisih < 0 ? 'stat--red' : 'stat--blue',
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

/* ============================== PERGERAKAN ============================== */
function Pergerakan({ bulan }: { bulan: string }) {
  const { transaksi } = getKeuangan();

  const riwayat = useMemo(() => riwayatBulanan(transaksi, bulan, 6), [transaksi, bulan]);
  const r = ringkasBulan(transaksi, bulan);
  const rasio = rasioBelanja(r.masuk, r.keluar);
  const kas = saldoKas(transaksi);
  const rata = rataPengeluaran(riwayat);

  return (
    <>
      <div className="grid gap-2.5 xl:grid-cols-2">
        <GrafikArusKas data={riwayat} />
        <GrafikSaldo data={riwayat} />
      </div>

      <div className="mt-2.5 grid gap-2.5 md:grid-cols-2">
        <MeterRasio
          masuk={r.masuk}
          keluar={r.keluar}
          persen={rasio.persen}
          status={rasio.status}
          label={rasio.label}
        />
        <KartuRunway saldo={kas} rataKeluar={rata} bulan={runwayBulan(kas, rata)} />
      </div>
    </>
  );
}

/* Satu formulir untuk kedua arah arus kas, dibedakan tombol di atasnya.
   Memisahkannya jadi dua formulir akan menggandakan tampilan tanpa menambah
   kejelasan, dan yang paling sering dicatat cuma satu: pengeluaran. Karena itu
   'keluar' yang jadi pilihan awal. */
function FormTransaksi() {
  const [jenis, setJenis] = useState<ArusKas>('keluar');
  const [tanggal, setTanggal] = useState(todayYmd());
  const [kategori, setKategori] = useState(KATEGORI_KELUAR[0]);
  const [jumlah, setJumlah] = useState('');
  const [catatan, setCatatan] = useState('');

  const daftarKategori = jenis === 'masuk' ? KATEGORI_MASUK : KATEGORI_KELUAR;
  const nilai = bacaRupiah(jumlah);

  /* Kategori ikut direset saat arah berganti; kalau tidak, "Makan" bisa
     tersimpan sebagai kategori pemasukan. */
  function gantiJenis(j: ArusKas) {
    setJenis(j);
    setKategori(j === 'masuk' ? KATEGORI_MASUK[0] : KATEGORI_KELUAR[0]);
  }

  function simpan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (nilai <= 0) return;
    addTransaksi({ tanggal, jenis, kategori, jumlah: nilai, catatan: catatan.trim() });
    setJumlah('');
    setCatatan('');
  }

  return (
    <form onSubmit={simpan} className="card">
      <div className="flex flex-wrap gap-2">
        {(['keluar', 'masuk'] as ArusKas[]).map(j => (
          <button key={j} type="button" onClick={() => gantiJenis(j)} className={`opt ${jenis === j ? 'is-on' : ''}`}>
            {j === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="field__label">Tanggal</span>
          <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} className="input" />
        </label>

        <label className="block">
          <span className="field__label">Kategori</span>
          <select value={kategori} onChange={e => setKategori(e.target.value)} className="input">
            {daftarKategori.map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="field__label">Jumlah</span>
          <input
            inputMode="numeric"
            value={jumlah}
            onChange={e => setJumlah(e.target.value)}
            placeholder="25000"
            className="input num"
          />
          <span className="mt-1.5 block text-[0.7rem] muted">
            {nilai > 0 ? rupiah(nilai) : 'Ketik angkanya saja, titik tidak perlu.'}
          </span>
        </label>

        <label className="block">
          <span className="field__label">Catatan</span>
          <input value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Opsional" className="input" />
        </label>
      </div>

      <button type="submit" disabled={nilai <= 0} className="btn mt-5">
        Catat {jenis === 'masuk' ? 'pemasukan' : 'pengeluaran'}
        <span className="btn__arrow">→</span>
      </button>
    </form>
  );
}

/* =========================== DAFTAR TRANSAKSI =========================== */
function DaftarTransaksi({ bulan }: { bulan: string }) {
  const { transaksi } = getKeuangan();
  const daftar = useMemo(() => transaksi.filter(t => bulanDari(t.tanggal) === bulan), [transaksi, bulan]);

  if (!daftar.length) {
    return (
      <p className="empty mt-6 text-sm muted">
        Belum ada transaksi di {namaBulan(bulan)}. Catat satu hal kecil hari ini, kebiasaannya yang
        penting, bukan angkanya.
      </p>
    );
  }

  return (
    <ul className="mt-6 border-t border-[var(--rule)]">
      {daftar.map(t => {
        const masuk = t.jenis === 'masuk';
        return (
          <li
            key={t.id}
            className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 border-b border-[var(--rule)] py-3.5"
          >
            <span
              aria-hidden="true"
              className="h-8 w-[3px] rounded-full"
              style={{ background: masuk ? WARNA_MASUK : WARNA_KELUAR }}
            />

            <span className="min-w-0">
              <span className="block text-[0.9rem] font-semibold" style={{ letterSpacing: '-0.02em' }}>
                {t.kategori}
              </span>
              <span className="num block text-[0.7rem] muted">
                {t.tanggal}
                {t.catatan ? ` · ${t.catatan}` : ''}
              </span>
            </span>

            <span className="flex items-center gap-3">
              <span
                className="num text-[0.95rem] font-semibold"
                style={{ color: masuk ? WARNA_MASUK : 'var(--ink)' }}
              >
                {masuk ? '+' : '-'}
                {rupiah(t.jumlah)}
              </span>
              <button
                onClick={() => removeTransaksi(t.id)}
                aria-label="Hapus transaksi"
                className="text-xs muted opacity-0 transition-opacity hover:text-[var(--red)] group-hover:opacity-100"
              >
                ✕
              </button>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* =============================== KATEGORI =============================== */
function Kategori({ bulan }: { bulan: string }) {
  const { transaksi } = getKeuangan();

  const kolom = [
    { judul: 'Ke mana uangnya pergi', baris: perKategori(transaksi, bulan, 'keluar'), warna: WARNA_KELUAR },
    { judul: 'Dari mana uangnya datang', baris: perKategori(transaksi, bulan, 'masuk'), warna: WARNA_MASUK },
  ];

  return (
    <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
      {kolom.map(k => (
        <div key={k.judul}>
          <h4 className="display" style={{ fontSize: '1.25rem' }}>
            {k.judul}
          </h4>
          {k.baris.length === 0 ? (
            <p className="mt-4 text-sm muted">Belum ada data bulan ini.</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {k.baris.map(b => (
                <li key={b.kategori}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[0.88rem] font-medium">{b.kategori}</span>
                    <span className="num text-[0.82rem]">
                      {rupiah(b.jumlah)}
                      <span className="ml-2 muted">{Math.round(b.rasio * 100)}%</span>
                    </span>
                  </div>
                  <div className="bar__track mt-2">
                    <div
                      className="bar__fill"
                      style={{ width: `${Math.max(b.rasio * 100, 2)}%`, background: k.warna }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

/* Portofolio dicatat manual. Tidak ada sambungan ke aplikasi investasi mana
   pun, dan itu memang disengaja: nilai yang diperbarui sebulan sekali sudah
   cukup untuk melihat arah, sementara integrasi menuntut kredensial yang tidak
   layak dititipkan ke situs sekecil ini. */
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
    addInvestasi({
      nama: nama.trim(),
      jenis,
      modal: m,
      nilai: bacaRupiah(nilai) || m,
      diperbarui: todayYmd(),
      catatan: '',
    });
    setNama('');
    setModal('');
    setNilai('');
  }

  return (
    <>
      {investasi.length > 0 && (
        <div className="on-dark mb-8 rounded-[var(--radius-lg)] p-[clamp(1.3rem,3vw,2.2rem)]">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <span className="stat__label">Modal disetor</span>
              <div className="display mt-2" style={{ fontSize: '1.9rem' }}>
                {rupiahRingkas(r.modal)}
              </div>
            </div>
            <div>
              <span className="stat__label">Nilai sekarang</span>
              <div className="display mt-2" style={{ fontSize: '1.9rem' }}>
                {rupiahRingkas(r.nilai)}
              </div>
            </div>
            <div>
              <span className="stat__label">Untung / rugi</span>
              <div
                className="display mt-2"
                style={{ fontSize: '1.9rem', color: r.selisih >= 0 ? 'var(--lime)' : 'var(--red)' }}
              >
                {r.selisih >= 0 ? '+' : ''}
                {rupiahRingkas(r.selisih)}
                {r.imbalHasil != null && (
                  <span className="ml-2 text-base opacity-80">
                    {r.imbalHasil >= 0 ? '+' : ''}
                    {r.imbalHasil.toFixed(1).replace('.', ',')}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="mt-6 border-t border-[var(--rule)] pt-4 text-xs leading-relaxed muted">
            Angka ini hanya seakurat yang kamu masukkan. Sandbox tidak terhubung ke aplikasi
            investasi mana pun, jadi perbarui kolom nilai sendiri sesekali.
          </p>
        </div>
      )}

      <form onSubmit={simpan} className="card">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="field__label">Nama</span>
            <input
              value={nama}
              onChange={e => setNama(e.target.value)}
              placeholder="Misal: Bibit RDPU"
              className="input"
            />
          </label>
          <label className="block">
            <span className="field__label">Jenis</span>
            <select value={jenis} onChange={e => setJenis(e.target.value)} className="input">
              {JENIS_INVESTASI.map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field__label">Modal disetor</span>
            <input
              inputMode="numeric"
              value={modal}
              onChange={e => setModal(e.target.value)}
              placeholder="500000"
              className="input num"
            />
          </label>
          <label className="block">
            <span className="field__label">Nilai sekarang</span>
            <input
              inputMode="numeric"
              value={nilai}
              onChange={e => setNilai(e.target.value)}
              placeholder="Kosong = sama dengan modal"
              className="input num"
            />
          </label>
        </div>
        <button type="submit" className="btn mt-5">
          Tambah instrumen
          <span className="btn__arrow">→</span>
        </button>
      </form>

      {investasi.length === 0 ? (
        <p className="empty mt-6 text-sm muted">
          Belum ada instrumen tercatat. Tidak perlu besar untuk mulai, yang penting angkanya nyata
          dan bisa kamu lihat tumbuh.
        </p>
      ) : (
        <ul className="mt-6 grid gap-2.5 md:grid-cols-2">
          {investasi.map(x => {
            const selisih = x.nilai - x.modal;
            const persen = x.modal > 0 ? (selisih / x.modal) * 100 : 0;
            const untung = selisih >= 0;
            return (
              <li key={x.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="eyebrow eyebrow--plain">{x.jenis}</span>
                    <h4 className="card__title mt-1.5">{x.nama}</h4>
                  </div>
                  <button
                    onClick={() => removeInvestasi(x.id)}
                    aria-label="Hapus instrumen"
                    className="shrink-0 text-xs muted hover:text-[var(--red)]"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="num text-[1.4rem] font-semibold">{rupiah(x.nilai)}</span>
                  <span
                    className="num text-[0.85rem] font-semibold"
                    style={{ color: untung ? 'var(--green)' : 'var(--red)' }}
                  >
                    {untung ? '+' : ''}
                    {rupiah(selisih)} ({untung ? '+' : ''}
                    {persen.toFixed(1).replace('.', ',')}%)
                  </span>
                </div>

                <label className="mt-4 block">
                  <span className="field__label">Perbarui nilai sekarang</span>
                  {/* Tidak terkendali (defaultValue + onBlur), bukan controlled:
                      menyimpan tiap ketikan akan menulis ulang localStorage dan
                      merender ulang seluruh daftar tiap huruf. Cukup simpan
                      sekali saat kolomnya ditinggalkan. */}
                  <input
                    inputMode="numeric"
                    defaultValue={x.nilai}
                    onBlur={e => {
                      const v = bacaRupiah(e.target.value);
                      if (v > 0) patchInvestasi(x.id, { nilai: v, diperbarui: todayYmd() });
                    }}
                    className="input num"
                  />
                </label>

                <p className="mt-2 text-[0.7rem] muted">
                  Modal {rupiah(x.modal)} · terakhir diperbarui {x.diperbarui || 'belum pernah'}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

/* ================================ PAPAN ================================ */
export default function KeuanganBoard() {
  useStore();
  const { transaksi } = getKeuangan();

  /* Bulan berjalan selalu ikut terdaftar walau belum ada transaksinya, supaya
     halaman ini tetap punya bulan untuk ditampilkan di hari pertama pemakaian. */
  const tersedia = useMemo(() => {
    const daftar = bulanTersedia(transaksi);
    const kini = bulanDari(todayYmd());
    return daftar.includes(kini) ? daftar : [kini, ...daftar];
  }, [transaksi]);

  const [bulan, setBulan] = useState(() => bulanDari(todayYmd()));
  /* Jatuh ke bulan terbaru kalau bulan pilihan menghilang, misalnya setelah
     transaksi terakhirnya dihapus. */
  const bulanAktif = tersedia.includes(bulan) ? bulan : tersedia[0];

  return (
    <>
      <section className="section" id="ringkasan">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="eyebrow eyebrow--c">01 · Ringkasan</span>
              <h2 className="display mt-4" style={{ fontSize: 'var(--t-xl)' }}>
                Uangmu, dalam <span className="serif">empat angka.</span>
              </h2>
            </div>

            {tersedia.length > 1 && (
              <div className="subnav" role="group" aria-label="Pilih bulan">
                {tersedia.slice(0, 8).map(b => (
                  <button key={b} onClick={() => setBulan(b)} className={`opt ${bulanAktif === b ? 'is-on' : ''}`}>
                    {namaBulan(b)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8">
            <Ringkasan bulan={bulanAktif} />
          </div>
        </div>
      </section>

      <section className="section" id="pergerakan">
        <div className="shell">
          <span className="eyebrow eyebrow--c">02 · Pergerakan</span>
          <h2 className="display mt-4" style={{ fontSize: 'var(--t-xl)' }}>
            Naik atau turun, <span className="serif">grafiknya tidak bisa berbohong.</span>
          </h2>
          <p className="lede mt-4">
            Empat sudut pandang yang sama: apakah belanja sebanding dengan pemasukan, ke mana arah
            saldo bergerak, seberapa besar porsi uang masuk yang habis, dan berapa lama sisanya
            sanggup bertahan.
          </p>
          <div className="mt-8">
            <Pergerakan bulan={bulanAktif} />
          </div>
        </div>
      </section>

      <section className="section" id="catat">
        <div className="shell">
          <span className="eyebrow eyebrow--c">03 · Catat transaksi</span>
          <h2 className="display mt-4" style={{ fontSize: 'var(--t-xl)' }}>
            Dicatat saat terjadi, <span className="serif">bukan diingat-ingat.</span>
          </h2>
          <p className="lede mt-4">
            Yang membuat pencatatan gagal bukan kemalasan, tapi jeda. Catat begitu uangnya berpindah,
            lima detik, selesai.
          </p>
          <div className="mt-8">
            <FormTransaksi />
            <DaftarTransaksi bulan={bulanAktif} />
          </div>
        </div>
      </section>

      <section className="section" id="kategori">
        <div className="shell">
          <span className="eyebrow eyebrow--c">04 · Ke mana perginya</span>
          <h2 className="display mt-4" style={{ fontSize: 'var(--t-xl)' }}>
            Kategori terbesar <span className="serif">jarang yang kamu duga.</span>
          </h2>
          <div className="mt-8">
            <Kategori bulan={bulanAktif} />
          </div>
        </div>
      </section>

      <section className="section" id="investasi">
        <div className="shell">
          <span className="eyebrow eyebrow--c">05 · Investasi</span>
          <h2 className="display mt-4" style={{ fontSize: 'var(--t-xl)' }}>
            Yang disisihkan hari ini, <span className="serif">bekerja diam-diam.</span>
          </h2>
          <p className="lede mt-4">
            Dicatat manual dan diperbarui sebulan sekali sudah cukup. Yang penting angkanya nyata,
            bukan real-time.
          </p>
          <div className="mt-8">
            <Portofolio />
          </div>
        </div>
      </section>
    </>
  );
}
