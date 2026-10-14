'use client';

/* =========================================================================
   Ekspor dan impor seluruh isi Hypomonē (berkas cadangan Sandbox lama juga diterima).

   Semua yang kamu tulis di situs ini (nilai, catatan Feynman, checklist
   mingguan, kebiasaan, jurnal, keuangan, catatan asdos) tinggal di
   localStorage peramban. Itu cepat dan privat, tapi juga berarti hilang
   kalau data situs dibersihkan, dan tidak ikut berpindah ke perangkat lain.

   Sejak aplikasi ini bisa dipasang sebagai aplikasi, jalur ini jadi satu-satunya
   cara memindahkan isi dari laptop ke ponsel: keduanya peramban berbeda,
   jadi penyimpanannya juga terpisah.

   Impor MENIMPA, tidak menggabung. Menggabung dua salinan yang sama-sama
   pernah diedit hanya melahirkan tebak-tebakan mana yang menang. Karena itu
   isi berkasnya ditunjukkan lebih dulu, berdampingan dengan isi perangkat
   ini, supaya yang disetujui adalah pertukaran yang benar-benar terlihat.
   ========================================================================= */

import { useRef, useState } from 'react';
import { todayYmd } from '@/lib/kalender';
import { exportData, importData, isiCadangan, isiSekarang, type Cadangan as Berkas, type IsiCadangan } from '@/lib/store';

type Kabar = { nada: 'diam' | 'baik' | 'buruk'; teks: string };

interface Tinjauan {
  data: Berkas;
  nama: string;
  masuk: IsiCadangan;
  sekarang: IsiCadangan;
}

function tanggalCadangan(iso: string | null): string {
  if (!iso) return 'tanpa tanggal';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'tanpa tanggal';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(d);
}

export default function Cadangan() {
  const berkasRef = useRef<HTMLInputElement>(null);
  const [kabar, setKabar] = useState<Kabar>({ nada: 'diam', teks: '' });
  const [tinjau, setTinjau] = useState<Tinjauan | null>(null);

  function unduh() {
    try {
      const isi = JSON.stringify(exportData(), null, 2);
      const url = URL.createObjectURL(new Blob([isi], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `hypomone-${todayYmd()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setKabar({ nada: 'baik', teks: 'Berkas cadangan terunduh.' });
    } catch {
      setKabar({ nada: 'buruk', teks: 'Gagal membuat berkas cadangan.' });
    }
  }

  async function baca(berkas: File) {
    setKabar({ nada: 'diam', teks: '' });
    try {
      const data = JSON.parse(await berkas.text());
      const masuk = isiCadangan(data);
      if (!masuk.total && !data.harian && !data.progress) {
        throw new Error('bukan cadangan Hypomonē');
      }
      setTinjau({ data, nama: berkas.name, masuk, sekarang: isiSekarang() });
    } catch {
      setTinjau(null);
      setKabar({
        nada: 'buruk',
        teks: 'Berkas tidak terbaca. Pastikan itu berkas hypomone-YYYY-MM-DD.json (atau sandbox-….json lama) hasil Unduh cadangan.',
      });
    }
  }

  function timpa() {
    if (!tinjau) return;
    if (!importData(tinjau.data)) {
      setKabar({ nada: 'buruk', teks: 'Berkas ditolak: bentuknya tidak dikenali.' });
      setTinjau(null);
      return;
    }
    setTinjau(null);
    setKabar({ nada: 'baik', teks: 'Data masuk. Halaman yang sedang terbuka sudah memakai isi baru.' });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button onClick={unduh} className="btn btn--ghost btn--sm">
          Unduh cadangan
        </button>
        <button onClick={() => berkasRef.current?.click()} className="btn btn--ghost btn--sm">
          Impor data
        </button>
        <input
          ref={berkasRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) baca(f);
            /* Dikosongkan supaya memilih berkas yang sama dua kali tetap
               memicu onChange. */
            e.target.value = '';
          }}
        />
      </div>

      {tinjau && (
        <div className="mt-4 rounded-[var(--radius)] border border-[var(--rule)] p-4">
          <p className="text-xs leading-relaxed">
            <b className="num" style={{ color: 'var(--paper)' }}>{tinjau.nama}</b>
            <br />
            <span className="muted">Dibuat {tanggalCadangan(tinjau.masuk.dibuat)}</span>
          </p>

          {tinjau.masuk.baris.length > 0 ? (
            <table className="mt-3 w-full text-xs">
              <thead>
                <tr className="muted">
                  <th className="pb-1.5 text-left font-normal" />
                  <th className="pb-1.5 text-right font-normal">Berkas</th>
                  <th className="pb-1.5 text-right font-normal">Di sini</th>
                </tr>
              </thead>
              <tbody>
                {tinjau.masuk.baris.map(b => {
                  const kini = tinjau.sekarang.baris.find(x => x.label === b.label)?.jumlah ?? 0;
                  /* Baris yang isinya lebih sedikit daripada yang sudah ada di
                     perangkat ini ditandai: di situlah kehilangan terjadi. */
                  const berkurang = kini > b.jumlah;
                  return (
                    <tr key={b.label} className="border-t border-[var(--rule)]">
                      <td className="py-1.5 pr-2 muted">{b.label}</td>
                      <td
                        className="num py-1.5 text-right font-semibold"
                        style={{ color: 'var(--paper)', fontVariantNumeric: 'tabular-nums' }}
                      >
                        {b.jumlah}
                      </td>
                      <td
                        className="num py-1.5 text-right"
                        style={{
                          color: berkurang ? 'var(--red)' : 'var(--ink-mute)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {kini}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="mt-3 text-xs muted">Berkas ini kosong, tidak ada isi yang bisa dipulihkan.</p>
          )}

          <p className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--amber)' }}>
            Mengimpor <b>menimpa</b> seluruh isi akun (di semua perangkat), tidak menggabung. Kolom kanan yang
            lebih besar dari kolom kiri berarti ada yang akan hilang.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={timpa} disabled={!tinjau.masuk.total} className="btn btn--light btn--sm">
              Timpa data di sini
            </button>
            <button onClick={() => setTinjau(null)} className="btn btn--ghost btn--sm">
              Batal
            </button>
          </div>
        </div>
      )}

      {kabar.nada !== 'diam' && (
        <p
          role="status"
          className="mt-3 text-xs leading-relaxed"
          style={{ color: kabar.nada === 'baik' ? 'var(--lime)' : 'var(--red)' }}
        >
          {kabar.teks}
        </p>
      )}
    </div>
  );
}
