import Link from 'next/link';
import Cadangan from './Cadangan';
import { TombolPasang } from './PWA';
import { AUTH_EMAIL } from '@/lib/auth';
import { META, shortName, TOTAL_SKS } from '@/lib/courses/meta';
import { addDays, fmtRange, parseYmd, SEMESTER_START, TOTAL_WEEKS, weekStartYmd, ymd } from '@/lib/kalender';

export default function SiteFooter() {
  const end = ymd(addDays(parseYmd(weekStartYmd(TOTAL_WEEKS - 1)), 6));

  return (
    <footer className="on-dark no-print mt-[var(--stack)]">
      <div className="shell py-[clamp(3rem,6vw,5.5rem)]">
        <span className="eyebrow">Gasal 2026 / 2027</span>

        <p
          className="display my-[clamp(1.5rem,4vw,3rem)]"
          style={{ fontSize: 'var(--t-mega)', lineHeight: 0.8 }}
        >
          Sand<span className="serif">box</span>
        </p>

        <div className="grid gap-8 border-t border-[var(--rule)] pt-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h4 className="eyebrow eyebrow--plain mb-3">Mata kuliah</h4>
            <ul className="space-y-1.5 text-sm">
              {META.map(c => (
                <li key={c.id}>
                  <Link href={`/matkul/${c.id}`} className="inline-flex items-center gap-2 hover:underline">
                    <span className="dot" style={{ background: c.accent }} aria-hidden="true" />
                    {shortName(c)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="eyebrow eyebrow--plain mb-3">Semester</h4>
            <p className="text-sm leading-relaxed muted">
              {TOTAL_WEEKS} minggu · {META.length} matkul · {TOTAL_SKS} SKS
              <br />
              <span className="num">{fmtRange(SEMESTER_START, end)}</span>
            </p>
          </div>

          <div>
            <h4 className="eyebrow eyebrow--plain mb-3">Notifikasi</h4>
            <p className="text-sm leading-relaxed muted">
              Ringkasan mingguan otomatis ke
              <br />
              <span className="num">{AUTH_EMAIL || 'belum di-set (AUTH_EMAIL)'}</span>
            </p>
          </div>

          <div>
            <h4 className="eyebrow eyebrow--plain mb-3">Halaman lain</h4>
            <ul className="mb-6 space-y-1.5 text-sm">
              <li><Link href="/harian" className="hover:underline">Harian</Link></li>
              <li><Link href="/keuangan" className="hover:underline">Keuangan</Link></li>
              <li><Link href="/asdos" className="hover:underline">Asisten dosen</Link></li>
            </ul>

            <h4 className="eyebrow eyebrow--plain mb-3">Pasang aplikasi</h4>
            <p className="mb-3 text-xs leading-relaxed muted">
              Tambahkan ke layar utama supaya terbuka tanpa bilah alamat, dan halaman yang pernah
              dibuka tetap terbaca tanpa jaringan.
            </p>
            <TombolPasang />

            <h4 className="eyebrow eyebrow--plain mb-3 mt-6">Cadangan data</h4>
            <p className="mb-3 text-xs leading-relaxed muted">
              Semua tulisanmu tersimpan di peramban ini saja, dan tiap perangkat punya salinannya
              sendiri. Unduh sesekali, lalu impor di perangkat lain untuk memindahkannya.
            </p>
            <Cadangan />

            <h4 className="eyebrow eyebrow--plain mb-3 mt-6">Catatan</h4>
            <p className="text-sm leading-relaxed muted">
              Agenda disusun dari BRP tiap mata kuliah. Selalu verifikasi ke SCeLE dan pengumuman
              dosen sebelum bergantung padanya.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
