import Image from 'next/image';
import Link from 'next/link';
import Cadangan from '@/components/Cadangan';
import { TombolPasang } from '@/components/PWA';
import { META, shortName, TOTAL_SKS } from '@/lib/courses/meta';
import { addDays, fmtRange, parseYmd, SEMESTER_START, TOTAL_WEEKS, weekStartYmd, ymd } from '@/lib/kalender';
import { RECIPIENT } from '@/lib/email-config';

/** Footer navy design system, menempel di dasar halaman. */
export default function SiteFooter() {
  const end = ymd(addDays(parseYmd(weekStartYmd(TOTAL_WEEKS - 1)), 6));

  return (
    <footer className="on-dark no-print relative w-full overflow-hidden px-5 pb-28 pt-12 text-white/65 md:px-10 lg:pb-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(55% 90% at 15% 0%, rgba(214,76,111,.22), transparent 70%)' }}
      />
      <div className="relative mx-auto max-w-wrap">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Image src="/images/galaksi-ikon.png" alt="" width={256} height={256} className="size-20 md:size-24" />
            <div>
              <p className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                Hypomonē <span className="text-pink-light">@LV</span>
              </p>
              <p className="mt-1 text-sm">ὑπομονή · ketekunan yang bertahan. Gasal 2026/2027.</p>
            </div>
          </div>
          <TombolPasang />
        </div>

        <div className="mt-10 grid gap-8 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-pink-light">Mata kuliah</p>
            <ul className="space-y-2 text-sm">
              {META.map(c => (
                <li key={c.id}>
                  <Link href={`/matkul/${c.id}`} className="inline-flex items-center gap-2 transition-colors hover:text-white">
                    <span className="size-2 rounded-full" style={{ background: c.accent === '#5e121c' ? '#d97a86' : c.accent }} aria-hidden />
                    {shortName(c)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-pink-light">Halaman</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/harian" className="hover:text-white">Harian</Link></li>
              <li><Link href="/keuangan" className="hover:text-white">Keuangan</Link></li>
              <li><Link href="/keuangan?scan=1" className="hover:text-white">Scan struk</Link></li>
              <li><Link href="/asdos" className="hover:text-white">Asisten dosen</Link></li>
            </ul>
            <p className="mb-2 mt-6 text-xs font-bold uppercase tracking-[0.2em] text-pink-light">Semester</p>
            <p className="text-sm leading-relaxed">
              {TOTAL_WEEKS} minggu · {META.length} matkul · {TOTAL_SKS} SKS
              <br />
              <span className="num">{fmtRange(SEMESTER_START, end)}</span>
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-pink-light">Email harian</p>
            <p className="text-sm leading-relaxed">
              Ringkasan dikirim <b className="text-white">setiap hari pukul 06.00 WIB</b> ke
              <br />
              <span className="num text-white">{RECIPIENT || 'belum di-set'}</span>
            </p>
            <p className="mt-4 text-sm leading-relaxed">
              Agenda disusun dari BRP tiap mata kuliah. Selalu cocokkan dengan SCeLE dan pengumuman dosen.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-pink-light">Cadangan data</p>
            <p className="mb-3 text-xs leading-relaxed">
              Data sudah tersimpan di Supabase dan sinkron antar perangkat. Unduh cadangan sesekali, atau impor
              berkas cadangan dari Sandbox lama untuk memindahkan isinya ke sini.
            </p>
            <Cadangan />
          </div>
        </div>

        <p className="mt-10 text-[13px]">© {new Date().getFullYear()} Hypomonē @LV · dibuat untuk satu orang.</p>
      </div>
    </footer>
  );
}
