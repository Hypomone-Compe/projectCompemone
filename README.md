# Hypomonē @LV

> *Hypomonē* (ὑπομονή): ketekunan yang bertahan saat berat.

Situs monitoring pribadi untuk Gasal 2026/2027: **SDA D · PBP B · Basis Data B · Sistem Operasi B · StatProb C**,
ditambah halaman harian, keuangan (dengan scan struk), dan asisten dosen.

Penerus **Sandbox** (`patty/Sandbox`). Seluruh isi BRP, kalkulator nilai, rencana mingguan, kotak Feynman,
halaman harian, dan asdos dibawa apa adanya. Yang berubah:

| | Sandbox | Hypomonē @LV |
|---|---|---|
| Tampilan | editorial-brutalist krem | struktur design system Kabinet TerusTerang (`bemuidev/designsystem/companyprofile`) dalam **tema gelap luar angkasa**: nila gelap, pink, Plus Jakarta Sans, navbar kaca |
| Beranda | hero teks | hero orbit 3D: **galaksi Andromeda** dari partikel di tengah, 13 kartu (5 matkul, Keuangan, Scan, Harian, Asdos, SCeLE, SLCM, Cosmic, NotebookLM) berputar di atas grid & bintang |
| Klik kartu | (tidak ada) | panel matkul fungsional: kelas berikutnya, agenda terdekat, proyeksi nilai, pemahaman, minggu ini/depan, 6 pintasan |
| Halaman matkul | 7 seksi digulir panjang | 6 tab (Ringkasan, Nilai, Rencana, Materi, Strategi, Sumber), bisa dibuka langsung `?tab=nilai` |
| Data | localStorage per perangkat | **Supabase**, sinkron laptop ⇄ HP (realtime), tetap jalan luring |
| Login | kata sandi di env | **Supabase Auth**, satu email saja, tanpa pendaftaran |
| Email | Senin, Rabu, Jumat | **setiap hari 06.00 WIB**, plus checklist, uang kemarin, progres SDA, PBP & Basdat |
| Keuangan | catat manual | **scan struk (OCR)**, anggaran bulanan & per kategori, edit/hapus, cari & saring |
| HP | menu | tab bawah: Beranda · Matkul · Scan · Harian · Uang |

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind 3 + cva (sama dengan design system) ·
three.js · GSAP · Lenis · ogl · Supabase · Resend · Tesseract.js · Claude API (opsional, OCR).

---

## Menyiapkan (sekali)

### 1. Supabase

1. Buat proyek di [supabase.com](https://supabase.com) (region Singapore).
2. **SQL Editor → New query**, tempel isi [`supabase/schema.sql`](supabase/schema.sql), **Run**.
   Ini membuat tabel, RLS yang hanya mengizinkan `lvnasandbox@gmail.com`, trigger yang menolak akun email lain,
   bucket privat `struk`, dan realtime.
3. **Authentication → Sign In / Providers → Email**: matikan **Allow new users to sign up**.
4. **Authentication → Users → Add user → Create new user**: `lvnasandbox@gmail.com`, kata sandimu,
   centang **Auto Confirm User**. Hanya akun ini yang bisa masuk.
5. **Authentication → URL Configuration**: isi **Site URL** dengan URL Vercel, dan tambahkan
   `https://<domainmu>/auth/callback` ke **Redirect URLs** (untuk masuk lewat tautan email).
6. **Project Settings → API**: salin URL, anon key, dan service_role key.

### 3. Pindahkan data dari Sandbox lama

Di Sandbox: footer → **Unduh cadangan** (`sandbox-YYYY-MM-DD.json`). Di Hypomonē: footer → **Impor data**,
pilih berkas itu. Isinya langsung terkirim ke Supabase dan muncul di semua perangkat.

---

## Menjalankan lokal

```bash
npm install
npm run dev
```

Tanpa `.env.local`, situs berjalan dalam **mode lokal** (tanpa login, data hanya di peramban) supaya tampilan
bisa dikembangkan tanpa Supabase. Mode ini mustahil aktif di build produksi: deploy tanpa Supabase tetap terkunci.

---

## Cara kerja penting

### Sinkronisasi ([`lib/sync.ts`](lib/sync.ts), [`lib/store.ts`](lib/store.ts))

API store lama (`setEntry`, `addTransaksi`, …) tidak berubah. Di baliknya:

- Perubahan langsung tampil, disalin ke localStorage, lalu masuk **antrean** yang ikut tersimpan di localStorage.
  Perubahan saat sinyal hilang tetap terkirim begitu daring.
- `app_state` menyimpan jsonb per bagian: `progress:<matkul>`, `scores:<matkul>`, `plans`, `asdos`, `harian`,
  `anggaran`. Progres dipecah per matkul supaya mengetik di kotak Feynman tidak menulis ulang semua matkul.
- `transaksi` dan `investasi` per baris (dipakai juga oleh email harian).
- Tarik ulang saat dibuka, saat tab kembali difokus, saat daring lagi, dan saat Realtime memberi tahu ada perubahan
  dari perangkat lain. Bagian yang masih punya perubahan tertunda tidak ditimpa.
- Titik status di navbar: hijau tersinkron, biru menyimpan, kuning luring/lokal, merah gagal (dicoba ulang otomatis).

### Satu akun saja

Empat lapis: middleware mengeluarkan sesi email lain · route login menolak email lain sebelum Supabase dihubungi ·
RLS `is_owner()` di setiap tabel & bucket · trigger `auth.users` menolak pembuatan akun email lain.

### Kartu orbit ([`lib/kartu.ts`](lib/kartu.ts), [`lib/orbit.ts`](lib/orbit.ts))

Tiap item jadi satu "planet" yang digambar di canvas (warna item, minggu berjalan). Setiap item tampil sekali; hanya SDA, PBP, dan Basdat yang muncul dua kali (`ITEM_GANDA`). **Untuk mengganti dengan gambar sendiri:**
taruh gambar rasio 1.4:1.9 di `public/images/matkul/sda.png`, lalu isi `cover: '/images/matkul/sda.png'`
di [`lib/courses/meta.ts`](lib/courses/meta.ts). Galaksi 3D di tengah dibuat dari partikel di [`components/home/orbit/galaxy.ts`](components/home/orbit/galaxy.ts).

### Scan struk ([`components/keuangan/ScanStruk.tsx`](components/keuangan/ScanStruk.tsx))

Foto → dikecilkan → dibaca → **layar konfirmasi** → simpan. Tidak ada angka yang masuk tanpa dilihat.
- Dengan `ANTHROPIC_API_KEY`: Claude Opus 5.5 vision lewat `/api/struk/ocr`, keluaran JSON terstruktur
  (total akhir, bukan subtotal/tunai; tanggal; toko; kategori; masuk/keluar; item).
- Tanpa kunci: Tesseract.js (`ind+eng`) di peramban + aturan di [`lib/struk.ts`](lib/struk.ts).
- Foto disimpan di bucket privat `struk/<user_id>/<id>.jpg`, dilihat lewat URL bertanda tangan 1 jam.

### Email harian ([`lib/email.ts`](lib/email.ts), [`lib/email-pribadi.ts`](lib/email-pribadi.ts))

Isi: kelas hari ini · checklist minggu ini yang belum dicentang · uang kemarin & sisa anggaran · progres SDA, PBP & Basdat ·
kuis & lab dua pekan · tugas minggu ini & depan · jadwal tetap. Pratinjau: `/api/notify/preview`.
Uji kirim kapan saja: `/api/cron/notify?key=<CRON_SECRET>&paksa=1`.

---

## Struktur

```
app/
  login/                   halaman awal saat belum masuk (tanpa daftar)
  auth/callback/           tujuan tautan masuk dari email
  (app)/page.tsx           beranda: hero orbit, hari ini, prioritas, matkul, kalender, jadwal
  (app)/matkul/[id]/       halaman matkul bertab
  (app)/keuangan|harian|asdos
  api/auth/                login, magic link, logout
  api/struk/ocr/           OCR struk dengan Claude
  api/cron/notify/         email harian (Vercel Cron)
components/
  ui/                      komponen design system (Button, Badge, Card, Tabs, Modal, …)
  site/                    navbar kaca + tab bawah HP, footer, PageHeader, Lenis, kursor
  home/                    HeroOrbit, orbit/scene.ts (three.js), CourseDetail, HariIni, Prioritas
  course/ keuangan/ harian/ asdos/ dashboard/
lib/
  supabase/                config, klien browser/server/admin
  sync.ts store.ts         sinkronisasi & store
  kartu.ts                 gambar kartu orbit
  struk.ts struk-foto.ts   OCR & foto struk
  courses/                 isi BRP (server saja)
supabase/schema.sql        skema + RLS + storage + realtime
```

### Maskot ([`components/maskot/Kucing.tsx`](components/maskot/Kucing.tsx))

Kucing hitam voxel bermata kuning (three.js), menyambut di sapaan pembuka dan halaman masuk: lompat masuk, kedip, ekor mengibas, kepala mengikuti kursor.

> Kalau isi situs berbeda dengan pengumuman dosen atau SCeLE, **selalu ikuti dosen.**
