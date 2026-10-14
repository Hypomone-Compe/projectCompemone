# Sandbox, Gasal 2026/2027

> Gw menambah bagian agar bisa commit and push

Situs monitoring akademik pribadi untuk lima mata kuliah semester ini:
**PBP B · SDA D · Basis Data B · Sistem Operasi B · StatProb C**, ditambah
halaman terpisah untuk peran asisten dosen Aljabar Linear Kelas Internasional.

Judul tab konsisten mengikuti pola `Sandbox - <halaman>`: Sandbox - Beranda,
Sandbox - PBP B, Sandbox - Asisten Dosen.

Lanjutan dari `KULIAH/term3/Monitoring`, ditulis ulang sebagai aplikasi Next.js
supaya bisa di-deploy ke Vercel. Seluruh isi BRP (rubrik, rencana mingguan,
topik, jebakan, strategi, sumber belajar) dibawa apa adanya dari versi lama.

**Stack:** React 19 + TypeScript + Tailwind v4 di atas Next.js App Router.

---

## Bahasa visual

Mewarisi sistem desain `hackathon/opsi/mbgmeter`, editorial-brutalist:

| Unsur | Isi |
|---|---|
| Kertas | Krem hangat `#f3f0e7`, tinta hitam hangat `#12120f` |
| Seksi gelap | `.on-dark` membalik hero, kalkulator, kotak Feynman, footer |
| Blok warna datar | Poster ala Studio Feixen, dipakai untuk pekan ujian & topik berat |
| Huruf display | Bricolage Grotesque 800, tracking −0.045em, leading 0.86 |
| Huruf teks | Poppins |
| Aksen editorial | Instrument Serif *italic* di tengah judul raksasa |
| Sorotan | Lime `#c9f24d` di atas blok gelap |
| Gerak | `Reveal` saat digulir, `Mask` untuk baris judul, sapuan warna di tombol |

Warna per matkul: PBP rust `#c0431f` · SDA biru `#2b46f0` · Basdat hijau
`#12683f` · OS magenta `#b3106c` · StatProb emas tua `#7d5f00`. Tiap warna
sudah dicek kontrasnya di atas kertas krem maupun sebagai latar teks putih.

Token dan kelas komponen ada di [`app/globals.css`](app/globals.css); Tailwind
dipakai untuk layout dan spasi, bukan untuk warna atau tipografi.

**Huruf di-host sendiri** di `public/fonts` (lihat `app/fonts.css`). `next/font`
sempat diam-diam jatuh ke fallback sistem dan seluruh karakter desainnya hilang,
jadi file woff2-nya sekarang ikut di repo, tampilannya identik di laptop dan di
Vercel, dan build tidak bergantung pada jaringan.

---

## Isi

**Beranda**
- Ringkasan semester: minggu ke berapa, total deadline, fokus minggu ini & minggu depan
- Pita berjalan berisi deadline terdekat
- Indeks lima mata kuliah dengan persentase pemahaman
- **Kotak minggu**, 17 kotak, satu per minggu. Klik untuk membuka panel berisi
  agenda kelima matkul minggu itu plus checklist pribadi
- Jadwal kuliah tetap Senin–Jumat (dari file `.ics` jadwalmu)
- Panel notifikasi email

**Halaman harian** (`/harian`, 7 bagian) — lihat bagian tersendiri di bawah

**Bisa dipasang** sebagai aplikasi di layar utama, dan halaman yang pernah dibuka
tetap terbaca tanpa jaringan — lihat bagian PWA di bawah

**Halaman tiap mata kuliah** (7 bagian, sesuai urutan di sub-navigasi)
1. **Informasi Umum**, dosen, jadwal & ruang, prasyarat, buku acuan
2. **Rubrik & Kalkulator Nilai**, tiap komponen dipecah per instansi
   (Lab 1…Lab 8, CP 1…CP 12, TI 1…TI 4), tombol `+`/`−` untuk menyesuaikan
   jumlah, proyeksi nilai akhir + huruf, dan berapa rata-rata yang masih
   dibutuhkan untuk A. Rubrik detail per kriteria untuk PBP.
3. **Rencana Mingguan**, isi tiap minggu menurut BRP, dipetakan ke tanggal asli
4. **Materi & Kotak Feynman**, tiap topik punya kotak untuk menjelaskan ulang
   dengan bahasa sendiri; panduannya berubah sesuai panjang penjelasan
5. **Materi yang Perlu Perhatian Ekstra**, topik berbobot berat + jebakan umum
6. **Strategi**, diturunkan dari struktur penilaian matkul itu
7. **Sumber Belajar**

---

## Navigasi & sapaan

- **Header** ada di setiap halaman: logo Sandbox (klik untuk pulang ke beranda),
  Beranda, daftar Mata kuliah, Asisten dosen, lalu tombol luar **SCeLE** dan
  **SLCM**, tombol sapaan (✦), dan Keluar.
- **Beranda punya navigator seksi** yang menempel di bawah header: Fokus,
  Mata kuliah, Kalender, Jadwal, Asisten dosen, Notifikasi. Halaman mata kuliah
  dan halaman asdos memakai navigator yang sama.
- **Sapaan pembuka** muncul sekali tiap kali situs dibuka (sekali per sesi
  peramban) berisi kutipan hari itu plus ringkasan minggu berjalan. Kutipannya
  tetap sama sepanjang satu hari dan berganti keesokan harinya. Tombol ✦ di
  header memanggilnya lagi kapan saja. Teksnya ada di `lib/quotes.ts`, ditulis
  sendiri, bukan kutipan tokoh, supaya tidak ada atribusi yang dikarang.
- **Gulir diredam** oleh `lib/gulir.ts`: putaran roda tidak langsung melompat
  satu notch, melainkan dikejar bertahap tiap frame. Peredam mundur sendiri di
  perangkat sentuh, saat `prefers-reduced-motion` aktif, dan di dalam panel yang
  punya gulirnya sendiri. Atur rasanya lewat `FAKTOR` dan `REDAM` di berkas itu.
- **Tanpa em dash.** Seluruh teks memakai `·` untuk memisahkan label dan koma
  untuk jeda dalam kalimat. Tanda `–` masih dipakai khusus untuk rentang angka
  dan jam (`19–25 Okt`, `13:00–14:40`); bilang saja kalau itu pun mau diganti.

---

## Halaman asisten dosen

`/asdos` untuk Aljabar Linear Kelas Internasional. Lima bagian: info kelas,
catatan sesi, cakupan materi, tugas asdos, dan daftar pertanyaan yang sering
muncul.

Kolom info sengaja dibiarkan kosong dan silabusnya adalah **template aljabar
linear pada umumnya**, bukan salinan silabus kelas yang kamu asisteni. Situs ini
tidak menebak isi kelas itu. Sunting `lib/asdos.ts` begitu silabus resminya
keluar; semua centang, catatan, dan isian tersimpan di browser.

---

## Menjalankan lokal

```bash
npm install
```

Salin `.env.example` menjadi `.env.local`, lalu:

```bash
npm run dev
```

Buka http://localhost:3000 dan masuk dengan akun di `.env.local`.

---

## Deploy ke Vercel

1. Push folder ini ke sebuah repo GitHub.
2. Vercel → **Add New → Project** → pilih repo itu. Framework terdeteksi
   otomatis sebagai Next.js; tidak ada setting build yang perlu diubah.
3. Isi **Environment Variables** (Production + Preview + Development):

   | Nama | Isi | Wajib |
   |---|---|---|
   | `AUTH_EMAIL` | alamat email akunmu | ya |
   | `AUTH_PASSWORD` | kata sandimu | ya |
   | `AUTH_SECRET` | string acak panjang | ya |
   | `CRON_SECRET` | string acak lain | untuk cron |
   | `RESEND_API_KEY` | API key dari resend.com | untuk email |
   | `NOTIFY_FROM` | `"Sandbox <onboarding@resend.dev>"` | untuk email |
   | `NOTIFY_TO` | penerima ringkasan (default: `AUTH_EMAIL`) | opsional |
   | `NEXT_PUBLIC_SITE_URL` | URL Vercel-mu | opsional |

   Membuat string acak:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```

4. Deploy. `vercel.json` sudah mendaftarkan dua cron; Vercel membacanya sendiri.

> **Tidak ada kredensial cadangan di dalam kode.** Kalau `AUTH_EMAIL`,
> `AUTH_PASSWORD`, atau `AUTH_SECRET` belum di-set (atau `AUTH_SECRET` kurang
> dari 16 karakter), login selalu ditolak dan situs tetap terkunci. Ini
> disengaja: repositori ini boleh publik tanpa membocorkan cara masuk.
>
> Artinya deploy pertama akan menolak login sampai ketiga variabel itu diisi di
> Vercel. Setelah menambahkannya, jalankan **Redeploy** supaya terbaca.

---

## Notifikasi email

Ringkasan dikirim ke `NOTIFY_TO` **tiga kali sepekan**: Senin, Rabu, dan Jumat
pukul **06.00 WIB**.

`vercel.json` hanya memuat **satu** cron, `0 23 * * *` (tiap hari 23.00 UTC =
06.00 WIB). Hari kirimnya disaring di `app/api/cron/notify/route.ts` lewat
`HARI_KIRIM`. Bentuk ini dipilih karena paket **Vercel Hobby membatasi jumlah
cron job**; satu jadwal harian plus saringan memberi hari kirim sebanyak apa pun
tanpa menyentuh batas itu, dan menambah hari cukup mengubah satu baris.

| Hari | Perannya |
|---|---|
| Senin | Membuka pekan |
| Rabu | Cek tengah pekan |
| Jumat | Hari lab SDA (14.00–16.00) & kelas Basdat |

Untuk menguji di hari mana pun: `/api/cron/notify?key=<CRON_SECRET>&paksa=1`.

Isi email, urut dari atas:

1. **Hari ini** — rundown sesi kuliah pada hari email itu dikirim. Karena
   jadwalnya Senin, Rabu, dan Jumat pagi, blok ini praktis jadi jadwal harian.
2. **Kuis & lab** — semua kuis, tutorial lab, dan sesi demo yang jatuh pekan ini
   dan pekan depan, ditambah daftar slot lab tetap tiap pekan. Diambil dari
   penanda di rencana mingguan tiap BRP (`📝` kuis, `🧪`/`⚡` lab, `🎤` demo).
3. **Minggu ini** dan **minggu depan** — tugas & deadline per mata kuliah.
4. **Jadwal kuliah tetap** dan **daftar deadline berikutnya**.

Semuanya dihitung dari data BRP di `lib/courses/`, jadi cron tidak butuh
database. Baris subjek ikut menyebut jumlah kuis/lab pekan itu, mis.
`[Sandbox] Minggu 05 · 6 deadline · 2 kuis/lab`.

- Pratinjau isinya kapan saja: `/api/notify/preview`
- Kirim manual: tombol **Kirim sekarang** di beranda (`POST /api/notify/send`)
- Cron sengaja diam kalau semester belum mulai atau sudah selesai; tombol manual
  tetap mengirim.

**Catatan Resend.** Tanpa domain terverifikasi, `onboarding@resend.dev` hanya
bisa mengirim ke alamat email yang terdaftar di akun Resend-mu. Karena tujuannya
memang alamatmu sendiri, daftarkan Resend dengan alamat itu dan semuanya
langsung jalan. Kalau nanti mau kirim ke alamat lain, verifikasi domain
sendiri lalu ubah `NOTIFY_FROM`.

**Vercel Hobby** membatasi jumlah cron job dan hanya memicunya sekali sehari.
Satu cron harian di `vercel.json` sudah sesuai batas itu, dan masih menyisakan
slot kalau nanti butuh jadwal lain.

---

## Penyimpanan data

Nilai, penjelasan Feynman, status pemahaman, checklist mingguan, catatan
keuangan, dan seluruh isi halaman harian (kebiasaan, jurnal, sesi fokus, target)
disimpan di **localStorage browser** dengan kunci `monitor.v1`. Artinya:

- tidak ada database yang perlu diurus, dan datanya tidak pernah keluar dari
  perangkatmu;
- **datanya tidak ikut berpindah antar perangkat.** Laptop dan ponsel adalah dua
  peramban berbeda, jadi penyimpanannya juga terpisah. Jembatannya dua tombol di
  footer:
  - **Unduh cadangan** menulis seluruh isi ke `sandbox-YYYY-MM-DD.json`.
  - **Impor data** membaca berkas itu, lalu menampilkan isinya berdampingan
    dengan isi perangkat ini sebelum apa pun ditimpa. Baris yang jumlahnya
    lebih kecil daripada yang sudah ada ditandai merah, karena di situlah
    kehilangan terjadi. Impor **menimpa**, tidak menggabung.
  - Berkas yang bukan cadangan Sandbox ditolak (`cadanganSah()` di
    [`lib/store.ts`](lib/store.ts)). Tanpa penjaga itu, JSON apa pun akan
    diterima dan seluruh isi terhapus diam-diam, karena tiap bidang yang hilang
    jatuh ke nilai kosong.
- kalau nanti mau sinkron otomatis, tinggal tambahkan Vercel KV / Postgres;
  `lib/store.ts` sudah dipisah rapi supaya penggantinya tinggal ditempel.

---

## Sumber data dan tanggal

Kalender semester sudah memakai tanggal resmi, bukan perkiraan:

1. **Awal semester = Senin, 24 Agustus 2026**, 17 minggu. Ubah `SEMESTER_START`
   di [`lib/kalender.ts`](lib/kalender.ts) kalau kalender akademik bergeser;
   seluruh kotak minggu dan pemetaan BRP ikut menyesuaikan sendiri.
2. **UTS 12–23 Okt 2026 · UAS 10–19 Des 2026**, cocok di kelima BRP. Ubah
   `EXAM_RANGES` di berkas yang sama kalau tanggalnya direvisi.

Isi kelima berkas di `lib/courses/` diturunkan dari BRP Gasal 2026/2027 masing-masing
matkul:

| Matkul | Sumber |
|---|---|
| PBP | BRP MK PBP 2026–2027 Gasal + Schedule PBP Gasal 26/27 (Detailed Schedule) |
| SDA | Buku Rancangan Pengajaran SDA Gasal 2026/2027 Reguler (xlsx, v.4/8/26) |
| Basis Data | BRP Basis Data Kelas Reguler Gasal 2026/2027 |
| Sistem Operasi | Rencana Pengajaran OS 26/27 (xlsx) |
| StatProb | BRP StatProb-1 Gasal 26/27 |

`weeks[].n` di tiap berkas selalu berarti **minggu kalender semester** (1–17).
Kalau matkul punya penomorannya sendiri — mis. OS menyebut pekan kalender ke-10
sebagai "Minggu 8" karena UTS memakan dua pekan — penomoran itu ditaruh di
`weeks[].label`, bukan dengan menggeser `n`.

---

## PWA

Sandbox bisa ditambahkan ke layar utama dan dibuka tanpa bilah alamat. Alasannya
bukan kosmetik: halaman harian paling sering diisi sambil berdiri, di sela kelas,
dari ponsel, dan membuka peramban lalu mencari tab yang benar sudah cukup untuk
membuat kebiasaan mencatat itu putus.

| Berkas | Isinya |
|---|---|
| [`app/manifest.ts`](app/manifest.ts) | Nama, warna, ikon, dan dua pintasan (Harian, Keuangan) yang muncul saat ikonnya ditekan lama |
| [`public/sw.js`](public/sw.js) | Service worker, ditulis tangan |
| [`components/PWA.tsx`](components/PWA.tsx) | Pendaftaran service worker, bilah "versi baru", dan tombol pasang di footer |
| [`app/offline/page.tsx`](app/offline/page.tsx) | Halaman cadangan saat jaringan mati |
| `public/icons/` | PNG 192, 512, dan 512 maskable |

**Service worker-nya punya tiga aturan saja**, ditulis tangan alih-alih memakai
`next-pwa` dengan alasan yang sama seperti grafik di situs ini digambar sendiri:
tiga aturan lebih mudah dibaca ulang setahun lagi daripada berkas hasil
bangkitan yang tidak pernah dibuka siapa pun.

1. Berkas ber-hash (`/_next/static`, `/fonts`, `/icons`) diambil dari singgahan
   lebih dulu. Namanya memuat hash isi, jadi tidak mungkin basi.
2. Navigasi halaman **jaringan lebih dulu**, singgahan hanya kalau jaringan
   gagal. Situs ini menampilkan "minggu ke berapa sekarang"; halaman basi yang
   disajikan diam-diam justru berbahaya.
3. Apa pun di `/api` tidak pernah disinggah, dan hanya GET yang disinggah.
   Pengalihan ke `/login` juga tidak disimpan, supaya membuka aplikasi tanpa
   jaringan tidak selalu berakhir di halaman masuk padahal sesinya masih hidup.

Data tulisanmu tidak lewat service worker sama sekali. Semuanya di localStorage
dan tetap bisa dibaca-tulis walau luring.

**Kalau `sw.js` diubah, naikkan `VERSI`** di berkas itu. Nama singgahan ikut
berubah dan singgahan versi lama dihapus saat `activate`.

**`middleware.ts` wajib terus melewatkan** `sw.js`, `manifest.webmanifest`,
`icons`, dan `offline`. Kalau tidak, yang sampai ke peramban adalah halaman
`/login`, service worker gagal didaftarkan, dan tombol pasang tidak pernah
muncul — semuanya tanpa pesan galat yang menunjuk ke penyebabnya.

**Menguji secara lokal** butuh build produksi, karena service worker sengaja
tidak didaftarkan di mode pengembangan (menyinggah `/_next/static` akan melawan
hot reload):

```bash
npm run build && npm start
```

Konfigurasi `monitoring-produksi` di `.claude/launch.json` menjalankan perintah
kedua itu.

---

## Halaman harian

`/harian`, tujuh bagian untuk memantau kehidupan sehari-hari, bukan hanya
kuliah. Warna halamannya ungu tua `#4c1d95`, cukup jauh dari lima warna matkul
dan dari teal halaman keuangan.

| Bagian | Isi |
|---|---|
| 01 Ringkasan | Hari ini, konsistensi pekan berjalan, runtun terpanjang, jam fokus pekan ini |
| 02 Kebiasaan | Kisi centang 7 hari, grafik konsistensi harian, peta kalender bulanan, kelola kebiasaan |
| 03 Jurnal | Mood, energi, jam tidur, syukur, refleksi, pelajaran; plus grafik mood & energi |
| 04 Fokus | Timer Pomodoro, catatan sesi per mata kuliah, grafik jam fokus, distribusi per matkul |
| 05 Tidur | Grafik jam tidur dengan pita 7–9 jam, plus tiga kartu korelasi |
| 06 Target | Target pekanan dan bulanan dengan progres berlangkah |
| 07 Tinjauan | Insight yang disusun sendiri dari data + pola hari dalam sepekan |

Beberapa keputusan yang sengaja diambil:

- **Set kebiasaan bawaan tidak pernah dipasang otomatis.** Ada tombolnya, tapi
  harus ditekan sendiri. Daftar kebiasaan orang lain yang muncul begitu saja di
  halamanmu adalah cara tercepat membuat halaman ini diabaikan.
- **Hari yang tidak dicatat tidak digambar sebagai nol.** Nol berarti "tidur nol
  jam" atau "mood terburuk", padahal yang terjadi cuma lupa mengisi. Hari kosong
  meninggalkan lubang pada garis dan petak paling terang pada kalender.
- **Hari yang belum datang tidak ikut dirata-rata.** Kalau ikut, konsistensi
  pekan berjalan selalu terlihat jatuh hanya karena hari Kamis belum tiba.
- **Korelasi baru ditampilkan setelah ada minimal 6 pasang data.** Angka dari
  tiga hari catatan bukan temuan, itu kebetulan. Sebelum cukup, kartunya
  menampilkan tanda hubung, bukan angka dengan peringatan kecil.
- **Sesi fokus terhubung ke mata kuliah**, jadi bagian "ke mana jam fokusmu
  pergi" bisa menunjukkan matkul mana yang kamu hindari pekan ini.
- **Tinjauan pekanan disusun ulang tiap halaman dibuka** dari data yang ada.
  Butir yang datanya belum cukup tidak muncul sama sekali.

Skala heatmap kalender sengaja diskret lima langkah, bukan gradien halus: mata
tidak bisa membaca beda 62% dan 68% dari kepekatan warna, tapi sangat bisa
membaca "kosong, sedikit, separuh, banyak, penuh".

---

## Halaman keuangan

`/keuangan`, empat bagian: ringkasan, catat transaksi, kategori, investasi.

- **Arus kas** dicatat manual per transaksi (tanggal, kategori, jumlah,
  catatan). Bisa disaring per bulan; bulan yang muncul hanya yang punya data,
  ditambah bulan berjalan.
- **Kategori** memecah pemasukan dan pengeluaran bulan itu, urut dari yang
  terbesar, lengkap dengan persentasenya.
- **Investasi** mencatat modal disetor dan nilai sekarang per instrumen, lalu
  menghitung untung/rugi dan imbal hasil. Nilainya diperbarui sendiri; Sandbox
  tidak terhubung ke aplikasi investasi atau rekening mana pun.
- **Kekayaan bersih** = saldo kas seluruh transaksi + total nilai investasi.

### Grafik

Bagian **Pergerakan** menjawab empat pertanyaan yang berbeda dengan bentuk yang
berbeda pula:

| Pertanyaan | Bentuk |
|---|---|
| Belanja sebanding dengan pemasukan? | batang berkelompok, 6 bulan, dua deret |
| Saldo bergerak ke mana? | garis + area, satu deret, label hanya di ujung |
| Berapa porsi pemasukan yang habis? | meter dengan status dan ikon |
| Saldo sanggup bertahan berapa lama? | angka tunggal (saldo ÷ rata-rata belanja) |

Semua digambar tangan dengan SVG, tanpa pustaka chart: tambahannya hanya
sekitar 4 KB, warnanya ikut token situs, dan spesifikasi marknya bisa dipatuhi
persis (batang ≤24px berujung membulat 4px, celah permukaan 2px antar batang,
garis 2px, isian area 10%, kisi hairline solid, cincin permukaan 2px di titik).

**Warna deret dipilih lewat validasi, bukan selera.** Konvensi hijau untuk uang
masuk dan merah untuk keluar ternyata **gagal uji buta warna**: pada protanopia
jaraknya cuma ΔE 4,1, praktis dua warna kembar. Palet yang dipakai sekarang
biru `#2b46f0` untuk masuk dan merah `#d62b1c` untuk keluar, lolos di ΔE 32,3
(protan) dan 40,8 (penglihatan normal), sekaligus tetap terbaca sebagai dingin
lawan hangat. Kalau suatu saat warnanya diganti, jalankan ulang validatornya
dulu, jangan dikira-kira.

Tiap grafik punya kembaran tabel (tombol **Lihat tabel**), tooltip saat
diarahkan maupun saat difokuskan lewat papan ketik, dan sasaran arahkan selebar
satu bulan penuh, jauh lebih besar daripada batangnya sendiri. Jadi tidak ada
satu pun angka yang cuma bisa dibaca dengan menyorot.

Angka uang disimpan sebagai bilangan bulat rupiah, tidak pernah pecahan, supaya
tidak muncul selisih satu rupiah gara-gara pembulatan floating point. Kategori
bawaan ada di `lib/keuangan.ts`, ubah sesukamu.

Sama seperti data lain, semuanya tinggal di localStorage perangkat ini dan tidak
ikut sinkron antar perangkat. Footer punya tombol **Unduh cadangan** dan
**Pulihkan** untuk memindahkannya sebagai satu berkas JSON.

---

## Catatan performa

Beberapa keputusan di repo ini semata-mata soal kecepatan; jangan dibalik
tanpa alasan.

- **Isi BRP tidak boleh masuk bundel klien.** `lib/courses/index.ts` menarik
  kelima berkas BRP dan hanya untuk server. Komponen `'use client'` mengimpor
  `lib/courses/meta.ts` (identitas matkul saja) dan `lib/kalender.ts` (hitungan
  tanggal saja). Sekali saja sebuah komponen klien mengimpor `lib/courses` atau
  `lib/plan`, sekitar 200 KB teks BRP ikut diunduh peramban.
- **Halaman mata kuliah statis.** Tidak ada `force-dynamic`, jadi kelimanya
  di-prerender saat build dan dilayani dari CDN. Penyorotan minggu berjalan
  dikerjakan di klien (`SorotMingguIni`) lewat `data-week-state`; kalau tanggal
  dipakai saat render server, halamannya kembali jadi dinamis.
- **Isi rubrik dirender saat dibuka**, bukan disembunyikan dengan `<details>`.
  Rubrik PBP sendirian menyumbang sekitar 50 KB HTML.
- **Bricolage Grotesque itu font variabel**: berkas bobot 600/700/800 identik
  byte per byte. Cukup satu berkas per subset dengan `font-weight: 600 800`.
  Tiga berkas berarti tiga kali unduh untuk huruf yang sama.
- Tiga berkas font pertama di-`preload` dari `app/layout.tsx`.

Cek cepat kalau curiga ada yang bocor ke klien:

```bash
grep -rl "percolate\|Kebenaran Kode" .next/static/chunks
```

Hasilnya harus kosong.

---

## Struktur

```
app/
  layout.tsx              metadata + muat fonts.css & globals.css
  fonts.css               @font-face huruf yang di-host sendiri
  globals.css             token + kelas komponen (sistem desain)
  login/                  halaman masuk
  (app)/                  semua halaman yang butuh sesi
    page.tsx              beranda
    matkul/[id]/page.tsx  halaman mata kuliah
    harian/page.tsx       halaman kehidupan sehari-hari
    keuangan/page.tsx     halaman keuangan
    asdos/page.tsx        halaman asisten dosen
  manifest.ts             manifest PWA (/manifest.webmanifest)
  offline/page.tsx        halaman cadangan saat luring
  apple-icon.png          ikon layar utama iOS
  api/
    auth/                 login & logout
    cron/notify/          dipanggil Vercel Cron
    notify/               kirim manual + pratinjau
components/
  ui.tsx                  kit desain (Reveal, Mask, SectionHead, Drawer, Marquee, …)
  svg.ts                  perkakas grafik bersama (lebar wadah, tick, batang, jalur)
  PWA.tsx                 daftar service worker, bilah pembaruan, tombol pasang
  Cadangan.tsx            unduh cadangan & impor data dengan pratinjau isi
  dashboard/              Hero, CourseIndex, WeekGrid, Timetable, NotifyCard
  course/                 GradeCalculator, Topics, HardTopics, WeeklyPlan, CourseNav
  harian/                 HarianBoard + Grafik (kebiasaan, mood, fokus, tidur)
  keuangan/               KeuanganBoard + Grafik (arus kas, saldo, rasio)
lib/
  types.ts                bentuk data satu mata kuliah
  courses/meta.ts         identitas matkul (ringan, boleh ke klien)
  courses/                isi BRP tiap matkul (berat, server saja)
  asdos.ts                bahan halaman asisten dosen
  harian.ts               kebiasaan, jurnal, fokus, target (runtun, korelasi, insight)
  keuangan.ts             arus kas & investasi (format rupiah, hitungan)
  quotes.ts               kutipan sapaan
  gulir.ts                peredam gulir
  kalender.ts             hitungan tanggal murni (aman untuk klien)
  plan.ts                 agenda semester = kalender + isi BRP (server saja)
  store.ts                localStorage
  email.ts                penyusun & pengirim ringkasan
  auth.ts                 sesi JWT
middleware.ts             penjaga seluruh halaman
public/sw.js              service worker
public/icons/             ikon PWA 192 / 512 / 512 maskable
public/fonts/             woff2 Bricolage, Poppins, Instrument Serif
```
