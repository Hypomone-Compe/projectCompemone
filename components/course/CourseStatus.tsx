'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { BookOpenCheck, Calculator, CalendarClock, Check, Flag, Plus, X, type LucideIcon } from 'lucide-react';
import { Progress } from '@/components/ui';
import { hitungProyeksi } from '@/lib/nilai';
import type { KartuMatkul } from '@/lib/ringkasan-matkul';
import { addPlanItem, courseProgress, getPlan, removePlanItem, togglePlanItem, useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

/** Empat angka yang paling sering dicari saat membuka halaman matkul. */
export function CourseStatus({ c }: { c: KartuMatkul }) {
  useStore();
  const pro = courseProgress(c.id, c.topicIds.map(id => ({ id })));
  const n = hitungProyeksi(c.id, c.grading);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Kotak
        Icon={CalendarClock}
        label="Kelas berikutnya"
        nilai={c.sesiBerikut ? `${c.sesiBerikut.kapan}, ${c.sesiBerikut.jam.split('–')[0]}` : '–'}
        ket={c.sesiBerikut ? `${c.sesiBerikut.kind} · ${c.sesiBerikut.ruang}` : 'Tidak ada sesi terjadwal'}
      />
      <Kotak
        Icon={Flag}
        label="Agenda dinilai terdekat"
        nilai={c.deadlineBerikut ? `Minggu ${c.deadlineBerikut.n}` : '–'}
        ket={c.deadlineBerikut ? `${c.deadlineBerikut.label}: ${c.deadlineBerikut.text}` : 'Tidak ada lagi'}
        href={`/matkul/${c.id}?tab=rencana`}
      />
      <Kotak
        Icon={Calculator}
        label="Proyeksi nilai"
        nilai={n.norm == null ? 'Belum ada' : `${n.norm.toFixed(1)} · ${n.huruf}`}
        ket={
          n.norm == null
            ? 'Buka tab Nilai untuk mengisi'
            : n.butuhA == null
              ? 'Semua komponen terisi'
              : n.butuhA <= 0
                ? 'A sudah aman'
                : n.butuhA > 100
                  ? 'A tidak terjangkau lagi'
                  : `Butuh rata-rata ${n.butuhA.toFixed(0)} untuk A`
        }
        href={`/matkul/${c.id}?tab=nilai`}
      />
      <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <p className="flex items-center gap-2 text-[12.5px] font-bold text-muted">
          <BookOpenCheck aria-hidden className="size-4 text-c" /> Pemahaman materi
        </p>
        <p className="num mt-2 text-lg font-extrabold">{pro.pct}%</p>
        <Progress value={pro.pct} className="mt-1.5" barClassName="bg-c" aria-label="Pemahaman materi" />
        <p className="mt-1.5 text-[12.5px] text-secondary">
          {pro.paham}/{pro.total} paham · {pro.proses} dipelajari
        </p>
      </div>
    </div>
  );
}

function Kotak({ Icon, label, nilai, ket, href }: { Icon: LucideIcon; label: string; nilai: string; ket: string; href?: string }) {
  const isi = (
    <>
      <p className="flex items-center gap-2 text-[12.5px] font-bold text-muted">
        <Icon aria-hidden className="size-4 text-c" /> {label}
      </p>
      <p className="mt-2 text-lg font-extrabold leading-tight tracking-tight">{nilai}</p>
      <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-secondary">{ket}</p>
    </>
  );
  const cls = 'block rounded-2xl border border-border bg-white p-4 shadow-sm';
  return href ? (
    <Link href={href} scroll={false} className={cn(cls, 'transition-all hover:-translate-y-0.5 hover:shadow-md')}>
      {isi}
    </Link>
  ) : (
    <div className={cls}>{isi}</div>
  );
}

/**
 * Checklist pribadi minggu ini, khusus matkul ini. Datanya sama dengan
 * checklist di kotak kalender beranda (plans[senin], item ber-cid), jadi
 * mencentang di sini juga tercentang di sana.
 */
export function ChecklistMatkul({ cid, mingguKey, saran }: { cid: string; mingguKey: string | null; saran: string[] }) {
  useStore();
  const [teks, setTeks] = useState('');
  if (!mingguKey) return null;
  const items = (getPlan(mingguKey).items || []).filter(x => x.cid === cid);
  const sudah = new Set(items.map(x => x.text));
  const sisaSaran = saran.filter(s => !sudah.has(s)).slice(0, 4);

  function tambah(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    addPlanItem(mingguKey!, teks, cid);
    setTeks('');
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">Checklist minggu ini</p>
        {items.length > 0 && (
          <p className="num text-[12.5px] font-bold text-secondary">
            {items.filter(x => x.done).length}/{items.length} selesai
          </p>
        )}
      </div>

      {items.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {items.map(it => (
            <li key={it.id} className="group flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-off-white">
              <button
                type="button"
                onClick={() => togglePlanItem(mingguKey, it.id)}
                aria-pressed={it.done}
                aria-label={it.done ? `Batalkan: ${it.text}` : `Selesai: ${it.text}`}
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-md border-[1.5px] transition-colors',
                  it.done ? 'border-transparent bg-c text-white' : 'border-border bg-white',
                )}
              >
                {it.done && <Check aria-hidden className="size-4" />}
              </button>
              <span className={cn('min-w-0 flex-1 text-[14px]', it.done && 'text-muted line-through')}>{it.text}</span>
              <button
                type="button"
                onClick={() => removePlanItem(mingguKey, it.id)}
                aria-label={`Hapus ${it.text}`}
                className="flex size-7 items-center justify-center rounded-full text-faint hover:bg-red-pale hover:text-red sm:opacity-0 sm:group-hover:opacity-100"
              >
                <X aria-hidden className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={tambah} className="mt-3 flex gap-2">
        <input
          value={teks}
          onChange={e => setTeks(e.target.value)}
          placeholder="Tambah hal yang mau diselesaikan minggu ini…"
          aria-label="Tambah item checklist"
          className="input !py-2.5"
        />
        <button type="submit" disabled={!teks.trim()} className="btn btn--sm shrink-0" aria-label="Tambah">
          <Plus aria-hidden className="size-4" />
        </button>
      </form>

      {sisaSaran.length > 0 && (
        <div className="mt-3">
          <p className="text-[12.5px] font-semibold text-muted">Ambil dari BRP:</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {sisaSaran.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => addPlanItem(mingguKey, s, cid)}
                className="max-w-full truncate rounded-full border-[1.5px] border-dashed border-border px-3 py-1.5 text-left text-[12.5px] font-semibold text-secondary hover:border-navy hover:text-navy"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
