'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Bar, Reveal } from '@/components/ui';
import { ISIAN, SERING_DITANYA, SILABUS, TUGAS_RUTIN } from '@/lib/asdos';
import { fmtDateLong, todayYmd } from '@/lib/kalender';
import {
  addAsdosSession, addAsdosTodo, getAsdos, patchAsdosSession, removeAsdosSession,
  removeAsdosTodo, setAsdosInfo, toggleAsdosTodo, toggleAsdosTopic, useStore,
} from '@/lib/store';

/* ============================== INFO KELAS ============================== */
function InfoKelas() {
  const a = getAsdos();
  return (
    <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
      {ISIAN.map(f => (
        <label key={f.key} className="block">
          <span className="field__label">{f.label}</span>
          <input
            value={a.info[f.key] || ''}
            onChange={e => setAsdosInfo(f.key, e.target.value)}
            placeholder={f.hint}
            className="input"
          />
        </label>
      ))}
    </div>
  );
}

/* ============================== SESI ============================== */
function Sesi() {
  const a = getAsdos();
  const [tanggal, setTanggal] = useState(todayYmd());
  const [topik, setTopik] = useState('');

  function tambah(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    addAsdosSession(tanggal, topik);
    setTopik('');
  }

  const selesai = a.sessions.filter(s => s.done).length;

  return (
    <>
      <form onSubmit={tambah} className="flex flex-wrap gap-2">
        <input
          type="date"
          value={tanggal}
          onChange={e => setTanggal(e.target.value)}
          aria-label="Tanggal sesi"
          className="input w-auto"
        />
        <input
          value={topik}
          onChange={e => setTopik(e.target.value)}
          placeholder="Materi yang dibahas sesi ini..."
          aria-label="Materi sesi"
          className="input min-w-[14rem] flex-1"
        />
        <button type="submit" className="btn shrink-0">
          Tambah sesi
        </button>
      </form>

      {a.sessions.length === 0 ? (
        <p className="empty mt-6 text-sm muted">
          Belum ada sesi tercatat. Tambahkan satu setiap habis mengajar, lengkap dengan catatan apa
          yang paling banyak ditanyakan.
        </p>
      ) : (
        <>
          <div className="mt-6 flex items-baseline justify-between gap-4">
            <span className="eyebrow eyebrow--plain">
              {selesai} dari {a.sessions.length} sesi selesai
            </span>
          </div>
          <Bar value={a.sessions.length ? (selesai / a.sessions.length) * 100 : 0} className="mt-2" />

          <ol className="mt-6 space-y-2.5">
            {a.sessions.map((s, i) => (
              <li key={s.id} className={`card ${s.done ? 'opacity-70' : ''}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="num text-[0.68rem] muted">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[0.68rem] uppercase tracking-[0.12em] c-text">
                        {s.date ? fmtDateLong(s.date) : 'Tanpa tanggal'}
                      </span>
                    </div>
                    <h4 className={`card__title mt-2 ${s.done ? 'line-through' : ''}`}>{s.topic}</h4>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => patchAsdosSession(s.id, { done: !s.done })}
                      className={`opt ${s.done ? 'is-on' : ''}`}
                    >
                      {s.done ? 'Selesai' : 'Tandai selesai'}
                    </button>
                    <button
                      onClick={() => removeAsdosSession(s.id)}
                      aria-label="Hapus sesi"
                      className="opt"
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                <textarea
                  value={s.note}
                  onChange={e => patchAsdosSession(s.id, { note: e.target.value })}
                  rows={2}
                  placeholder="Catatan: apa yang paling banyak ditanyakan, siapa yang tertinggal, apa yang harus diulang..."
                  className="textarea mt-3 !min-h-[4.5rem]"
                />
              </li>
            ))}
          </ol>
        </>
      )}
    </>
  );
}

/* ============================== SILABUS ============================== */
function Silabus() {
  const a = getAsdos();
  const semua = useMemo(() => SILABUS.flatMap(g => g.topik), []);
  const dicentang = semua.filter(t => a.topics[t]).length;

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <span className="eyebrow eyebrow--plain">
          {dicentang} dari {semua.length} topik sudah dibahas
        </span>
        <span className="num text-sm font-semibold">
          {Math.round((dicentang / semua.length) * 100)}%
        </span>
      </div>
      <Bar value={(dicentang / semua.length) * 100} className="mt-2" />

      <div className="mt-8 grid gap-x-10 gap-y-9 md:grid-cols-2">
        {SILABUS.map(g => (
          <div key={g.judul}>
            <h4 className="display" style={{ fontSize: '1.25rem' }}>
              {g.judul}
            </h4>
            <ul className="mt-3 border-t border-[var(--rule)]">
              {g.topik.map(t => {
                const on = !!a.topics[t];
                return (
                  <li key={t} className="border-b border-[var(--rule)]">
                    <button
                      onClick={() => toggleAsdosTopic(t)}
                      aria-pressed={on}
                      className="flex w-full items-start gap-3 py-3 text-left"
                    >
                      <span
                        className={`mt-[0.1rem] grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border text-[0.6rem] leading-none transition-colors ${
                          on ? 'c-bg c-border' : 'border-[var(--rule-strong)]'
                        }`}
                      >
                        {on ? '✓' : ''}
                      </span>
                      <span className={`text-[0.85rem] leading-snug ${on ? 'muted line-through' : ''}`}>
                        {t}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}

/* ============================== TUGAS ============================== */
function Tugas() {
  const a = getAsdos();
  const [draft, setDraft] = useState('');
  const sudahAda = useMemo(() => new Set(a.todos.map(t => t.text)), [a.todos]);

  function tambah(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    addAsdosTodo(draft);
    setDraft('');
  }

  const saran = TUGAS_RUTIN.filter(t => !sudahAda.has(t));

  return (
    <>
      <form onSubmit={tambah} className="flex gap-2">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Tambah tugas asdos..."
          className="input flex-1"
        />
        <button type="submit" className="btn shrink-0">
          Tambah
        </button>
      </form>

      {a.todos.length > 0 && (
        <ul className="mt-6 divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
          {a.todos.map(t => (
            <li key={t.id} className="group flex items-start gap-3 py-3">
              <button
                onClick={() => toggleAsdosTodo(t.id)}
                aria-pressed={t.done}
                className={`mt-[0.1rem] grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border text-[0.6rem] leading-none transition-colors ${
                  t.done ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]' : 'border-[var(--rule-strong)]'
                }`}
              >
                {t.done ? '✓' : ''}
              </button>
              <span className={`flex-1 text-[0.88rem] leading-snug ${t.done ? 'muted line-through' : ''}`}>
                {t.text}
              </span>
              <button
                onClick={() => removeAsdosTodo(t.id)}
                aria-label="Hapus"
                className="shrink-0 text-xs muted opacity-0 transition-opacity hover:text-[var(--red)] group-hover:opacity-100"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {saran.length > 0 && (
        <div className="mt-8">
          <span className="eyebrow eyebrow--plain">Saran tugas rutin, klik untuk menambahkan</span>
          <div className="mt-3 flex flex-wrap gap-2">
            {saran.map(t => (
              <button key={t} onClick={() => addAsdosTodo(t)} className="chip hover:border-[var(--ink)]">
                + {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* ============================== PAPAN ============================== */
export default function AsdosBoard() {
  useStore();

  return (
    <>
      <section className="section" id="kelas">
        <div className="shell">
          <span className="eyebrow eyebrow--c">01 · Info kelas</span>
          <h2 className="display mt-4" style={{ fontSize: 'var(--t-xl)' }}>
            Isi sekali, <span className="serif">lupakan.</span>
          </h2>
          <p className="lede mt-4">
            Semua kolom ini kosong karena situs ini tidak menebak isinya. Ketik sendiri begitu
            silabus dan jadwal resminya keluar, lalu tersimpan di perangkat ini.
          </p>
          <div className="mt-8">
            <InfoKelas />
          </div>
        </div>
      </section>

      <section className="section" id="sesi">
        <div className="shell">
          <span className="eyebrow eyebrow--c">02 · Catatan sesi</span>
          <h2 className="display mt-4" style={{ fontSize: 'var(--t-xl)' }}>
            Satu baris tiap habis <span className="serif">mengajar.</span>
          </h2>
          <p className="lede mt-4">
            Yang paling berguna bukan materinya, tapi catatan apa yang paling banyak ditanyakan.
            Minggu depan kamu sudah tahu harus mulai dari mana.
          </p>
          <div className="mt-8">
            <Sesi />
          </div>
        </div>
      </section>

      <section className="section" id="silabus">
        <div className="shell">
          <span className="eyebrow eyebrow--c">03 · Cakupan materi</span>
          <h2 className="display mt-4" style={{ fontSize: 'var(--t-xl)' }}>
            Template silabus, <span className="serif">sesuaikan.</span>
          </h2>
          <p className="lede mt-4">
            Ini kerangka aljabar linear pada umumnya, bukan salinan silabus kelasmu. Centang yang
            sudah dibahas, buang yang tidak dipakai dari kepalamu sendiri.
          </p>
          <div className="mt-8">
            <Silabus />
          </div>
        </div>
      </section>

      <section className="section" id="tugas">
        <div className="shell">
          <span className="eyebrow eyebrow--c">04 · Tugas asdos</span>
          <h2 className="display mt-4" style={{ fontSize: 'var(--t-xl)' }}>
            Pekerjaan yang <span className="serif">mudah terlupa.</span>
          </h2>
          <div className="mt-8">
            <Tugas />
          </div>
        </div>
      </section>

      <section className="section" id="tanya">
        <div className="shell">
          <span className="eyebrow eyebrow--c">05 · Sering ditanya</span>
          <h2 className="display mt-4" style={{ fontSize: 'var(--t-xl)' }}>
            Siapkan jawabannya <span className="serif">sebelum ditanya.</span>
          </h2>
          <div className="mt-8 grid gap-x-10 gap-y-9 md:grid-cols-2 xl:grid-cols-3">
            {SERING_DITANYA.map((q, i) => (
              <Reveal key={q.t} delay={(i % 3) * 70}>
                <div className="border-t-2 c-border pt-4">
                  <h4 className="serif-up text-[1.3rem] leading-tight">{q.t}</h4>
                  <p className="stat__note mt-2.5">{q.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
