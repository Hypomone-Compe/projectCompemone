'use client';

/* ==========================================================================
   Scan struk → transaksi.

   Alurnya tiga langkah dan selalu berakhir di layar konfirmasi:
   1. Ambil foto (kamera belakang di HP, atau pilih/jatuhkan berkas di laptop).
   2. Baca: Claude vision kalau tersedia di server, selain itu Tesseract.js
      di peramban. Hasil Tesseract ditebak dengan aturan di lib/struk.ts.
   3. Koreksi lalu simpan. Angka dari mesin tidak pernah masuk tanpa dilihat.
   ========================================================================== */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Camera, Check, ImageUp, Loader2, RotateCcw, ScanLine, Sparkles, X } from 'lucide-react';
import { Alert, Badge, Button } from '@/components/ui';
import { todayYmd } from '@/lib/kalender';
import { bacaRupiah, KATEGORI_KELUAR, KATEGORI_MASUK, rupiah, type ArusKas } from '@/lib/keuangan';
import { addTransaksi } from '@/lib/store';
import { urai, type HasilStruk } from '@/lib/struk';
import { kompres, unggahStruk } from '@/lib/struk-foto';
import { supabaseConfigured } from '@/lib/supabase/config';
import { cn } from '@/lib/utils';

type Tahap = { k: 'pilih' } | { k: 'baca'; pesan: string; persen: number } | { k: 'cek' } | { k: 'selesai'; ringkas: string };

const idBaru = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

async function bacaDenganTesseract(blob: Blob, onProgres: (p: number, pesan: string) => void): Promise<HasilStruk> {
  const { createWorker } = await import('tesseract.js');
  onProgres(5, 'Menyiapkan pembaca teks (sekali unduh, ±10 MB)…');
  const worker = await createWorker(['ind', 'eng'], 1, {
    logger: m => {
      if (m.status === 'recognizing text') onProgres(30 + Math.round(m.progress * 65), 'Membaca teks struk…');
      else if (/load|initializ/i.test(m.status)) onProgres(5 + Math.round(m.progress * 25), 'Menyiapkan pembaca teks…');
    },
  });
  try {
    const { data } = await worker.recognize(blob);
    return urai(data.text || '');
  } finally {
    await worker.terminate();
  }
}

export default function ScanStruk({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const kameraRef = useRef<HTMLInputElement>(null);
  const berkasRef = useRef<HTMLInputElement>(null);
  const fotoRef = useRef<Blob | null>(null);

  const [tahap, setTahap] = useState<Tahap>({ k: 'pilih' });
  const [ai, setAi] = useState<boolean | null>(null);
  const [pratinjau, setPratinjau] = useState<string | null>(null);
  const [hasil, setHasil] = useState<HasilStruk | null>(null);
  const [galat, setGalat] = useState('');
  const [seret, setSeret] = useState(false);

  /* Isian konfirmasi */
  const [jenis, setJenis] = useState<ArusKas>('keluar');
  const [jumlah, setJumlah] = useState('');
  const [tanggal, setTanggal] = useState(todayYmd());
  const [kategori, setKategori] = useState(KATEGORI_KELUAR[0]);
  const [merchant, setMerchant] = useState('');
  const [catatan, setCatatan] = useState('');
  const [simpanFoto, setSimpanFoto] = useState(supabaseConfigured);
  const [menyimpan, setMenyimpan] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    if (!open || ai !== null) return;
    fetch('/api/struk/ocr')
      .then(r => (r.ok ? r.json() : { ai: false }))
      .then((d: { ai?: boolean }) => setAi(Boolean(d.ai)))
      .catch(() => setAi(false));
  }, [open, ai]);

  function ulang() {
    setTahap({ k: 'pilih' });
    setPratinjau(null);
    setHasil(null);
    setGalat('');
    fotoRef.current = null;
  }

  function tutup() {
    ulang();
    onClose();
  }

  function isiDari(h: HasilStruk) {
    setHasil(h);
    setJenis(h.jenis);
    setJumlah(h.total ? String(h.total) : '');
    setTanggal(h.tanggal || todayYmd());
    const daftar = h.jenis === 'masuk' ? KATEGORI_MASUK : KATEGORI_KELUAR;
    setKategori(daftar.includes(h.kategori) ? h.kategori : daftar[daftar.length - 1]);
    setMerchant(h.merchant || '');
    setCatatan(h.catatan || (h.items.length ? h.items.slice(0, 4).map(i => i.nama).join(', ') : ''));
  }

  async function proses(file: File) {
    setGalat('');
    if (!file.type.startsWith('image/')) {
      setGalat('Pilih berkas gambar (JPG, PNG, atau WebP).');
      return;
    }
    setTahap({ k: 'baca', pesan: 'Mengecilkan foto…', persen: 2 });
    try {
      const { blob, dataUrl } = await kompres(file);
      fotoRef.current = blob;
      setPratinjau(dataUrl);

      let h: HasilStruk | null = null;
      if (ai) {
        setTahap({ k: 'baca', pesan: 'Claude sedang membaca struk…', persen: 40 });
        const res = await fetch('/api/struk/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: dataUrl, media: 'image/jpeg' }),
        });
        const d = await res.json().catch(() => ({}));
        if (res.ok) h = d as HasilStruk;
        else if (res.status === 422) {
          setGalat((d as { error?: string }).error || 'Struk tidak terbaca.');
          setTahap({ k: 'cek' });
          isiDari({ merchant: null, tanggal: null, total: null, jenis: 'keluar', kategori: 'Lainnya', items: [], catatan: '', yakin: 'rendah', sumber: 'ai' });
          return;
        }
      }
      if (!h) {
        h = await bacaDenganTesseract(blob, (persen, pesan) => setTahap({ k: 'baca', pesan, persen }));
      }
      isiDari(h);
      setTahap({ k: 'cek' });
    } catch {
      setGalat('Gagal membaca foto. Isi manual di bawah, atau coba foto ulang.');
      isiDari({ merchant: null, tanggal: null, total: null, jenis: 'keluar', kategori: 'Lainnya', items: [], catatan: '', yakin: 'rendah', sumber: 'ocr' });
      setTahap({ k: 'cek' });
    }
  }

  function gantiJenis(j: ArusKas) {
    setJenis(j);
    const daftar = j === 'masuk' ? KATEGORI_MASUK : KATEGORI_KELUAR;
    if (!daftar.includes(kategori)) setKategori(daftar[0]);
  }

  async function simpan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nilai = bacaRupiah(jumlah);
    if (nilai <= 0) return;
    setMenyimpan(true);
    const id = idBaru();
    let path: string | null = null;
    if (simpanFoto && fotoRef.current) path = await unggahStruk(id, fotoRef.current);
    addTransaksi({
      id,
      tanggal,
      jenis,
      kategori,
      jumlah: nilai,
      catatan: catatan.trim(),
      merchant: merchant.trim() || null,
      struk: path,
      sumber: 'struk',
    });
    setMenyimpan(false);
    setTahap({
      k: 'selesai',
      ringkas: `${jenis === 'masuk' ? 'Pemasukan' : 'Pengeluaran'} ${rupiah(nilai)} · ${kategori}${merchant ? ` · ${merchant}` : ''}${
        simpanFoto && !path && supabaseConfigured ? ' (foto struk gagal diunggah, transaksi tetap tersimpan)' : ''
      }`,
    });
  }

  const daftarKategori = jenis === 'masuk' ? KATEGORI_MASUK : KATEGORI_KELUAR;
  const nilai = bacaRupiah(jumlah);

  return (
    <dialog
      ref={ref}
      onClose={tutup}
      aria-label="Scan struk"
      className="m-auto max-h-[92dvh] w-[calc(100%-24px)] max-w-[560px] overflow-y-auto rounded-2xl border-0 bg-white p-0 text-navy shadow-xl backdrop:bg-navy/40 backdrop:backdrop-blur-sm"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-divider bg-white/90 px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-pink-pale text-accent-hover">
            <ScanLine aria-hidden className="size-5" />
          </span>
          <div>
            <p className="text-[17px] font-extrabold tracking-tight">Scan struk</p>
            <p className="text-[12.5px] text-muted">
              {ai == null ? 'Memeriksa pembaca…' : ai ? 'Dibaca Claude (AI)' : 'Dibaca di peramban (Tesseract)'}
            </p>
          </div>
        </div>
        <button type="button" onClick={tutup} aria-label="Tutup" className="flex size-10 items-center justify-center rounded-full hover:bg-navy-5">
          <X aria-hidden className="size-5" />
        </button>
      </div>

      <div className="p-5">
        {galat && (
          <Alert variant="warning" className="mb-4">
            {galat}
          </Alert>
        )}

        {tahap.k === 'pilih' && (
          <>
            <div
              onDragOver={e => {
                e.preventDefault();
                setSeret(true);
              }}
              onDragLeave={() => setSeret(false)}
              onDrop={e => {
                e.preventDefault();
                setSeret(false);
                const f = e.dataTransfer.files?.[0];
                if (f) void proses(f);
              }}
              className={cn(
                'flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed px-5 py-10 text-center transition-colors',
                seret ? 'border-accent bg-pink-pale' : 'border-border bg-off-white',
              )}
            >
              <span className="flex size-16 items-center justify-center rounded-full bg-white text-accent shadow-sm">
                <Camera aria-hidden className="size-7" />
              </span>
              <div>
                <p className="text-[16px] font-extrabold">Foto struk, nota, atau bukti transfer</p>
                <p className="mt-1 text-[13.5px] text-secondary">Letakkan di permukaan rata, terang, seluruh struk masuk bingkai.</p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button size="lg" onClick={() => kameraRef.current?.click()}>
                  <Camera aria-hidden /> Buka kamera
                </Button>
                <Button size="lg" variant="outline" onClick={() => berkasRef.current?.click()}>
                  <ImageUp aria-hidden /> Pilih foto
                </Button>
              </div>
              <p className="hidden text-[12.5px] text-muted sm:block">atau seret gambar ke sini</p>
            </div>
            <input
              ref={kameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={e => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f) void proses(f);
              }}
            />
            <input
              ref={berkasRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={e => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f) void proses(f);
              }}
            />
          </>
        )}

        {tahap.k === 'baca' && (
          <div className="flex flex-col items-center gap-4 py-6 text-center" role="status" aria-live="polite">
            {pratinjau && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={pratinjau} alt="Foto struk" className="max-h-56 rounded-xl object-contain shadow-md" />
            )}
            <Loader2 aria-hidden className="size-6 animate-spin text-accent" />
            <p className="text-[14.5px] font-bold">{tahap.pesan}</p>
            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-navy-5">
              <div className="h-full rounded-full bg-accent transition-[width] duration-slow" style={{ width: `${tahap.persen}%` }} />
            </div>
          </div>
        )}

        {tahap.k === 'cek' && (
          <form onSubmit={simpan} className="space-y-4">
            <div className="flex gap-4">
              {pratinjau && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={pratinjau} alt="Foto struk" className="h-32 w-24 shrink-0 rounded-lg object-cover shadow-sm" />
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap gap-1.5">
                  {hasil && (
                    <Badge variant={hasil.sumber === 'ai' ? 'pink' : 'blue'}>
                      {hasil.sumber === 'ai' ? (
                        <>
                          <Sparkles aria-hidden className="size-3" /> Claude
                        </>
                      ) : (
                        'OCR peramban'
                      )}
                    </Badge>
                  )}
                  {hasil && (
                    <Badge variant={hasil.yakin === 'tinggi' ? 'navy' : 'outline'}>
                      Keyakinan {hasil.yakin}
                    </Badge>
                  )}
                </div>
                <p className="mt-2 text-[13.5px] leading-relaxed text-secondary">
                  Periksa angka di bawah, ubah yang salah, lalu simpan. Tidak ada yang tersimpan sebelum kamu menekan Simpan.
                </p>
                {hasil && hasil.items.length > 0 && (
                  <details className="mt-2 text-[13px]">
                    <summary className="font-bold text-navy">{hasil.items.length} item terbaca</summary>
                    <ul className="mt-1.5 space-y-0.5 text-secondary">
                      {hasil.items.map((it, i) => (
                        <li key={i} className="flex justify-between gap-3">
                          <span className="truncate">{it.nama}</span>
                          <span className="num shrink-0">{rupiah(it.jumlah)}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>

            <div role="group" aria-label="Jenis transaksi" className="grid grid-cols-2 gap-1 rounded-full bg-navy-5 p-[5px]">
              {(['keluar', 'masuk'] as ArusKas[]).map(j => (
                <button
                  key={j}
                  type="button"
                  aria-pressed={jenis === j}
                  onClick={() => gantiJenis(j)}
                  className={cn('rounded-full py-2.5 text-sm font-bold transition-all', jenis === j ? 'bg-navy text-white shadow-sm' : 'text-secondary')}
                >
                  {j === 'keluar' ? 'Pengeluaran' : 'Pemasukan'}
                </button>
              ))}
            </div>

            <label className="block">
              <span className="field__label">Jumlah</span>
              <input
                inputMode="numeric"
                value={jumlah}
                onChange={e => setJumlah(e.target.value)}
                placeholder="0"
                className="input num !text-2xl !font-extrabold"
                autoFocus
                required
              />
              <span className="mt-1 block text-[12.5px] text-muted">{nilai > 0 ? rupiah(nilai) : 'Total tidak terbaca, ketik manual.'}</span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="field__label">Tanggal</span>
                <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} className="input" required />
              </label>
              <label className="block">
                <span className="field__label">Toko / pengirim</span>
                <input value={merchant} onChange={e => setMerchant(e.target.value)} className="input" placeholder="Opsional" />
              </label>
            </div>

            <div>
              <span className="field__label">Kategori</span>
              <div className="flex flex-wrap gap-1.5">
                {daftarKategori.map(k => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKategori(k)}
                    aria-pressed={kategori === k}
                    className={cn('opt !px-3 !py-1.5 !text-[13px]', kategori === k && 'is-on')}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="field__label">Catatan</span>
              <input value={catatan} onChange={e => setCatatan(e.target.value)} className="input" placeholder="Opsional" />
            </label>

            {supabaseConfigured && (
              <label className="flex items-center gap-2.5 text-[14px] text-secondary">
                <input type="checkbox" checked={simpanFoto} onChange={e => setSimpanFoto(e.target.checked)} className="size-[18px] accent-[var(--accent)]" />
                Simpan foto struk (privat, hanya akunmu)
              </label>
            )}

            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" onClick={ulang} className="shrink-0">
                <RotateCcw aria-hidden /> Foto ulang
              </Button>
              <Button type="submit" disabled={nilai <= 0 || menyimpan} className="flex-1">
                {menyimpan ? 'Menyimpan…' : `Simpan ${jenis === 'masuk' ? 'pemasukan' : 'pengeluaran'}`}
              </Button>
            </div>
          </form>
        )}

        {tahap.k === 'selesai' && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-success-pale text-success">
              <Check aria-hidden className="size-8" />
            </span>
            <p className="text-lg font-extrabold">Tersimpan</p>
            <p className="text-[14px] text-secondary">{tahap.ringkas}</p>
            <div className="flex w-full gap-2">
              <Button variant="outline" className="flex-1" onClick={tutup}>
                Selesai
              </Button>
              <Button className="flex-1" onClick={ulang}>
                <Camera aria-hidden /> Scan lagi
              </Button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
