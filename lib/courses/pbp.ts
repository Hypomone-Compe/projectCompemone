/* ==========================================================================
   Pemrograman Berbasis Platform (PBP), Kelas B, Gasal 2026/2027
   Sumber: BRP MK PBP Gasal 2026/2027 + Schedule PBP Gasal 26/27 Detailed
   Schedule (CSGE602022)
   ========================================================================== */
import type { CourseContent } from '../types';

const pbp: CourseContent = {
  meta: [
    { k: 'Kelas', v: 'PBP B · Semester 3 · 4 SKS' },
    { k: 'Dosen', v: 'Iis Afriyanti, S.Kom., M.Sc. · Jessica Naraiswari Arwidarasti, S.Kom., M.Kom.' },
    { k: 'Jadwal kelas', v: 'Senin 13.00–14.40 · A6.02 (Ged Baru)' },
    { k: 'Jadwal lab', v: 'Rabu 14.00–15.40 · Lab A1.01+Lab A1.02 - Gabungan (Gd Baru)' },
    { k: 'Prasyarat', v: 'Dasar-Dasar Pemrograman 1' },
    { k: 'Prasyarat untuk', v: 'Pemrograman Lanjut · Pengajaran Berbantuan Komputer · Sistem Interaksi · Arsitektur Aplikasi Web' },
    { k: 'Bahasa & teknologi', v: 'Python (Django) · Dart (Flutter) · HTML · CSS · JavaScript · Java' },
  ],

  books: [
    { t: 'Internet & World Wide Web How to Program, 5th Ed.', by: 'Deitel · Prentice Hall, 2012' },
    { t: 'Test-Driven Development with Python, 1st Ed.', by: 'Percival · O\'Reilly, 2014' },
    { t: 'Head First Android Development: A Brain-Friendly Guide', by: 'Dawn & David Griffiths · O\'Reilly, 2017' },
    { t: 'Web Application Security, 1st Ed.', by: 'Andrew Hoffman · O\'Reilly, 2020' },
  ],

  grading: {
    total: '100%',
    components: [
      { name: 'UTS', weight: 30, freq: '1×', note: 'Komponen terbesar, naik dari 20% tahun lalu. Sifat CLOSE: diawasi ketat, akses ke sumber luar dibatasi. Materi: Sub-CPMK 3-9 dan 12, seluruh materi Web sampai Topik 07.' },
      { name: 'UAS', weight: 25, freq: '1×', note: 'Sifat CLOSE. Materi: Sub-CPMK 10-12, seluruh materi Mobile (Flutter).' },
      { name: 'Kuis Pemrograman', weight: 15, freq: '3×', note: '⭐ Komponen BARU tahun ini dan langsung bernilai 15%. Sifat CLOSE, memakai Rubrik Penilaian Kuis. Jadwal menurut Detailed Schedule: Kuis 1 di Minggu 5 (21–25 Sep), Kuis 2 di Minggu 7 (5–9 Okt), Kuis 3 di Minggu 15 (30 Nov–4 Des, saat Proyek Akhir berjalan).' },
      { name: 'Proyek Tengah Semester · Nilai Individu', weight: 7, freq: '1×', note: '70% dari penilaian PTS adalah Individual Assessment (Web Development). Demo tugas ke asisten dosen. Deadline akhir proyek 30 Oktober 2026.' },
      { name: 'Proyek Akhir Semester · Nilai Individu', weight: 7, freq: '1×', note: '70% dari penilaian PAS adalah Individual Assessment (Mobile Development). Demo tugas ke dosen. Deadline akhir proyek 9 Desember 2026.' },
      { name: 'Tugas Individu · Pemrograman Web', weight: 5, freq: '6×', note: 'Enam tugas, bukan lima seperti tahun lalu. Deadline selalu 1 minggu setelah rilis, pukul 12.00 WIB. Kode di repositori GitHub, ada demo ke asisten dosen.' },
      { name: 'Tugas Individu · Pemrograman Mobile', weight: 3, freq: '3×', note: 'Tugas Individu 7, 8, dan 9. Deadline 1 minggu setelah rilis, pukul 12.00 WIB.' },
      { name: 'Proyek Tengah Semester · Nilai Kelompok', weight: 3, freq: '1×', note: '30% dari penilaian PTS. Dinilai lewat Rubrik TK PTS Kelompok: design system, integrasi API publik, kolaborasi & Git flow, deployment.' },
      { name: 'Proyek Akhir Semester · Nilai Kelompok', weight: 3, freq: '1×', note: '30% dari penilaian PAS. Dinilai lewat Rubrik TK PAS Kelompok: arsitektur & DRF, kolaborasi, build aplikasi.' },
      { name: 'Partisipasi', weight: 2, freq: 'Sepanjang semester', note: 'Sub-CPMK 13-14. Diambil dari data Forum Diskusi SCELE dan catatan partisipasi mahasiswa di kelas oleh dosen.' },
      { name: 'Tutorial', weight: 0, freq: '9×', note: '⚠️ Bobotnya <b>0%</b> tahun ini, turun dari 4%. Tetap wajib dikerjakan karena jadi fondasi Tugas Individu dan Kuis Pemrograman, tapi jangan lagi diperlakukan sebagai sumber nilai.' },
    ],
    scale: [
      { g: 'A', min: 85 }, { g: 'A-', min: 80 }, { g: 'B+', min: 75 }, { g: 'B', min: 70 },
      { g: 'B-', min: 65 }, { g: 'C+', min: 60 }, { g: 'C', min: 55 }, { g: 'D', min: 45 }, { g: 'E', min: 0 },
    ],
    notes: [
      '🚨 <b>Struktur nilai tahun ini berubah total dari tahun lalu.</b> UTS naik 20% ke 30%, UAS 20% ke 25%, muncul Kuis Pemrograman 15% yang sebelumnya tidak ada, dan Tutorial turun dari 4% ke <b>0%</b>. Jangan memakai strategi angkatan sebelumnya.',
      '💎 <b>70% nilaimu diuji dalam kondisi CLOSE.</b> UTS 30% + UAS 25% + Kuis Pemrograman 15% semuanya diawasi ketat tanpa akses sumber luar, termasuk tanpa AI. Sisanya yang 30% bersifat OPEN dan boleh memakai AI secara bertanggung jawab.',
      '⚠️ <b>Tutorial bernilai 0%, tapi jangan dilewati.</b> Sembilan tutorial itu yang melatih materi yang diuji Kuis Pemrograman dan UTS. Nilainya nol, konsekuensinya tidak.',
      'Semua Tugas Individu berdeadline <b>1 minggu setelah rilis, pukul 12.00 WIB</b>. Bukan tengah malam, tapi tengah hari.',
      'Proyek Tengah Semester dinilai 30% kelompok dan 70% individu; Proyek Akhir Semester memakai pembagian yang sama. Nilai individumu tidak tertolong oleh kelompok yang bagus.',
      'Skala rubrik proyek memakai <b>0 sampai 4</b>, bukan 0 sampai 100: 0 tidak mengerjakan, 1 poor, 2 fair, 3 good, 3.5 expected (memenuhi semua kriteria tanpa bug), 4 exceeds expectation. Nilai 4 hanya diberi kalau ada inovasi nyata dan disetujui dosen kelas.',
      'Konversi huruf mengikuti standar Universitas Indonesia (acuan umum, konfirmasi ke dosen kelasmu).',
    ],
  },

  weeks: [
    /* w.n = minggu kalender semester. Detailed Schedule memakai penomorannya
       sendiri yang menyatukan dua pekan UTS jadi satu "Week 8", jadi sejak
       pekan kalender ke-10 nomornya bergeser satu; tanggal di bawah yang
       dipakai sebagai acuan, bukan nomor pekan versi jadwal. */
    { n: 1, title: 'Modul 01: Introduction to Platform-Based Programming + AI Literacy', points: [
        'Sub-CPMK 1 & 2: membedakan berbagai platform dan framework serta cara pemanfaatannya',
        'Topik 01a: Introduction to Platform-Based Programming, AI Literacy',
        'Topik 01b: Introduction to the Internet and Web Framework' ],
      tasks: ['Tutorial 0 (asinkron): setup repositori Git dan instalasi Django'] },
    { n: 2, title: 'Modul 02: Web Design Using HTML5 dan CSS3', points: [
        'Sub-CPMK 7: navigation, layouting, HTML template, CSS, dan assets',
        'Materi HTML5/CSS3 naik jauh lebih awal dibanding tahun lalu' ],
      tasks: ['Tutorial 01: Django initial project, HTML5 dan CSS3', '🔥 Tugas Individu 1: Static Web with HTML5 and CSS3, rilis 31 Agu, deadline 7 Sep 12.00 WIB'] },
    { n: 3, title: 'Modul 03: MTV Django Architecture', points: [
        'Sub-CPMK 3, 4, & 9: separation of concern Model-Template-View dengan Django',
        'models.py, views.py, template, migrations, Django Admin' ],
      tasks: ['Tutorial 02: implementasi MVT Django', '🔥 Tugas Individu 2: MVT Django, rilis 7 Sep, deadline 14 Sep 12.00 WIB', '📌 Panduan Proyek Tengah Semester rilis 11 Sep'] },
    { n: 4, title: 'Modul 04: Data Delivery', points: [
        'Sub-CPMK 5: view yang mengembalikan data dalam HTML, XML, dan JSON',
        'Serializer, HttpResponse, JsonResponse, Content-Type' ],
      tasks: ['Tutorial 03: form dan data delivery', '🔥 Tugas Individu 3: Form & Data Delivery, rilis 14 Sep, deadline 21 Sep 12.00 WIB', '📌 PTS Checkpoint 1 (16 Sep): project ideas dan project initiation'] },
    { n: 5, title: 'Modul 05: Form, Authentication, Session, and Cookie', points: [
        'Sub-CPMK 6 & 12: passing argument, autentikasi, otorisasi, aspek keamanan',
        'Session di server, cookie di browser, CSRF token' ],
      tasks: ['Tutorial 04 (asinkron, bukan syarat TI)', '📝 Kuis Pemrograman 1', '🔥 Tugas Individu 4: Authentication, Session, Cookies, rilis 21 Sep, deadline 28 Sep 12.00 WIB'] },
    { n: 6, title: 'Modul 06: Web Interactivity', points: [
        'Sub-CPMK 8: event handling sisi klien, manipulasi DOM, AJAX GET dan POST',
        'AJAX POST ke Django wajib menyertakan CSRF token',
        'Sesi lab dipakai untuk mengerjakan Proyek Tengah Semester bersama kelompok' ],
      tasks: ['Tutorial 05: web interactivity dengan JavaScript', '🔥 Tugas Individu 5: Web Interactivity with JavaScript, rilis 28 Sep, deadline 1 minggu setelahnya 12.00 WIB', '📌 PTS Checkpoint 2: design system dan deployment pertama, minimal landing page serta autentikasi'] },
    { n: 7, title: 'Modul 07: More on Web Development', points: [
        'Sub-CPMK 16: pengembangan web dengan teknologi terkini',
        'HTMX dan browser development tools',
        'Sesi lab dipakai untuk Proyek Tengah Semester' ],
      tasks: ['Tutorial 06 (asinkron, bukan syarat TI): HTMX dan browser dev tools', '📝 Kuis Pemrograman 2'] },
    { n: 8, title: 'UTS', points: [
        'Ujian Tengah Semester, 12 sampai 23 Oktober 2026',
        'Sifat CLOSE: diawasi ketat, tanpa akses sumber luar dan tanpa AI',
        'Materi: Sub-CPMK 3-9 dan 12, Topik 01 sampai 07' ], tasks: [], flag: 'exam' },
    { n: 9, title: 'UTS (pekan kedua)', points: [
        'Lanjutan periode ujian, 19 sampai 23 Oktober 2026',
        'Proyek Tengah Semester tetap berjalan' ], tasks: [], flag: 'exam' },
    { n: 10, title: 'Deadline Proyek Tengah Semester', points: [
        'Sub-CPMK 13, 14, & 15: berdiskusi, menyelesaikan proyek bersama tim, dan menilai pekerjaan sendiri',
        'Tidak ada modul baru, seluruh pekan (26–30 Okt) dipakai untuk merampungkan proyek' ],
      tasks: ['🔥 Deadline akhir Proyek Tengah Semester: 30 Oktober 2026', '📌 Panduan Proyek Akhir Semester rilis 30 Oktober'] },
    { n: 11, title: 'Modul 08: Django REST Framework', points: [
        'Sub-CPMK 17: membangun Application Programming Interface dengan Django REST Framework',
        'Serializer, viewset, dan endpoint yang nanti dikonsumsi aplikasi Flutter',
        'Materi baru tahun ini, jembatan dari Django ke Flutter' ],
      tasks: ['Tutorial 07: implementasi Django REST Framework', '🔥 Tugas Individu 6: Django REST Framework, rilis 2 Nov, deadline 9 Nov 12.00 WIB'] },
    { n: 12, title: 'Modul 09: Intro to Dart Programming and Flutter Framework', points: [
        'Sub-CPMK 10: aplikasi mobile sederhana dengan Flutter',
        'Dart: null safety dan async/await',
        'Widget tree, stateless vs stateful' ],
      tasks: ['Tutorial 08: basic Flutter', '🔥 Tugas Individu 7: Basic Flutter, rilis 9 Nov, deadline 16 Nov 12.00 WIB'] },
    { n: 13, title: 'Modul 10: Layouts and Forms (Flutter)', points: [
        'Sub-CPMK 10: widget layout, form, dan validasi input',
        'Row, Column, Stack, Container, ListView, GridView' ],
      tasks: ['Tutorial 09: Flutter navigation, layouts, forms, input elements', '🔥 Tugas Individu 8: Flutter Navigation, Layouts, Forms, rilis 16 Nov, deadline 23 Nov 12.00 WIB', '📌 PAS Checkpoint 1: mobile app scoping dan project API'] },
    { n: 14, title: 'Modul 11: Navigation, Networking, and Integration', points: [
        'Sub-CPMK 11 & 12: integrasi lintas platform lewat web service',
        'Navigator, HTTP request, JSON serialization, autentikasi lintas platform',
        'Modul terakhir semester ini' ],
      tasks: ['Tutorial 10: Flutter networking, authentication, integration', '🔥 Tugas Individu 9: Flutter Networking, Authentication, Integration, rilis 23 Nov, deadline 30 Nov 12.00 WIB'] },
    { n: 15, title: 'Proyek Akhir Semester + Kuis Pemrograman 3', points: [
        'Sub-CPMK 13, 14, & 15: penggarapan penuh proyek akhir bersama kelompok',
        'Tidak ada modul baru, seluruh pekan (30 Nov–4 Des) untuk proyek' ],
      tasks: ['📝 Kuis Pemrograman 3'] },
    { n: 16, title: 'Deadline Proyek Akhir, lalu UAS dimulai', points: [
        'Pekan terakhir penggarapan proyek akhir, 7 sampai 9 Desember',
        'Demo Proyek Akhir dilakukan ke dosen, bukan ke asisten',
        'UAS dimulai 10 Desember 2026, sifat CLOSE, materi Sub-CPMK 10-12 (Mobile)' ],
      tasks: ['🔥 Deadline akhir Proyek Akhir Semester: 9 Desember 2026'], flag: 'exam' },
    { n: 17, title: 'UAS (pekan kedua)', points: [
        'Lanjutan periode ujian sampai 19 Desember 2026' ], tasks: [], flag: 'exam' },
  ],

  rubrics: [
    { title: 'Skala penilaian rubrik (0 sampai 4)',
      note: 'Seluruh rubrik proyek memakai skala ini, bukan 0 sampai 100. Untuk kalkulator di atas, konversikan sendiri: 3.5 dari 4 setara 87,5%.',
      criteria: [
        { name: 'Score', levels: [
          { p: '0', d: 'Failed. Not doing anything.' },
          { p: '1', d: 'Poor. Fails to meet basic standards.' },
          { p: '2', d: 'Fair. Meets partial standards with significant flaws.' },
          { p: '3', d: 'Good. Meets functional standards but lacks optimization.' },
          { p: '3.5', d: 'Expected. Meets all criteria and instructions perfectly without bugs.' },
          { p: '4', d: 'Exceeds expectation. Menambahkan inovasi, optimasi lanjutan, atau fitur ekstra di luar kebutuhan dasar.' } ] },
      ],
      extra: 'Nilai 4 tidak otomatis. BRP menyebut contoh di kolom 4 hanyalah ilustrasi, bukan checklist, dan pemberiannya tetap lewat pertimbangan dosen kelas masing-masing.' },

    { title: 'Proyek Tengah Semester (Web) · pembagian bobot',
      note: '30% dinilai sebagai kelompok, 70% sebagai individu.',
      criteria: [
        { name: 'Group Assessment (30% dari nilai proyek)', levels: [
          { p: '25%', d: 'Design System (Figma, HTML, CSS): konsistensi UI antar modul, responsif di semua ukuran layar.' },
          { p: '15%', d: 'External Data / Public API Integration: data diambil, di-parse, dan dirender dengan benar.' },
          { p: '—', d: 'Collaboration & Git Flow serta Integration & Deployment melengkapi sisa bobot kelompok.' } ] },
        { name: 'Individual Assessment (70% dari nilai proyek)', levels: [
          { p: '35%', d: 'Implementation: seluruh operasi CRUD berjalan mulus tanpa bug.' },
          { p: '10%', d: 'JavaScript / AJAX: integrasi AJAX yang mulus, bukan sekadar DOM dasar.' },
          { p: '—', d: 'Sisa bobot menilai kualitas modul yang kamu kerjakan sendiri.' } ] },
      ],
      extra: 'Rincian tiap level ada di BRP bagian 5. Yang dimuat di sini hanya bobot komponen yang terbaca pasti; buka BRP aslinya sebelum submit.' },

    { title: 'Proyek Akhir Semester (Mobile) · pembagian bobot',
      note: '30% dinilai sebagai kelompok, 70% sebagai individu.',
      criteria: [
        { name: 'Group Assessment (30% dari nilai proyek)', levels: [
          { p: '20%', d: 'Architecture & DRF: API berjalan, arsitektur konsisten, routing rapi.' },
          { p: '35%', d: 'Collaboration & Integration: aplikasi ter-build (apk/aab), navigasi rapi, struktur folder terorganisasi.' } ] },
        { name: 'Individual Assessment (70% dari nilai proyek)', levels: [
          { p: '25%', d: 'Foundation: widget tree terstruktur, layout dan fungsi berjalan baik.' },
          { p: '20%', d: 'Transaction: seluruh operasi CRUD ke server berjalan tanpa cela.' } ] },
      ],
      extra: 'Sama seperti PTS, rincian level lengkapnya ada di BRP bagian 5.' },
  ],

  topics: [
    { id: 'pbp-01', t: 'Modul 01a, Introduction to Platform-Based Programming dan AI Literacy', w: 1, d: 1,
      sum: 'Sub-CPMK 1 & 2. Apa itu platform dan framework, jenis-jenisnya, dan kapan memilih yang mana.',
      keys: ['Platform vs framework vs library', 'Native vs hybrid vs cross-platform', 'Client-side vs server-side', 'Kriteria memilih framework untuk sebuah masalah'],
      probes: ['Jelaskan beda platform, framework, dan library dengan contoh dari kuliah ini (Django, Flutter, jQuery).', 'Kapan memilih pengembangan native dan kapan cross-platform? Apa trade-off-nya?', 'Apa yang membuat sebuah framework disebut "opinionated"? Django termasuk yang mana?'] },

    { id: 'pbp-02', t: 'Modul 01b, Introduction to the Internet and Web Framework', w: 1, d: 2,
      sum: 'Sub-CPMK 3 & 9. Cara kerja internet & HTTP, struktur proyek Django, routing (urls.py), dan deployment ke PaaS.',
      why: 'Deployment sering jadi hambatan pertama: environment variable, static files, ALLOWED_HOSTS, dan database production yang berbeda dari lokal. Padahal deployment bernilai 10% dari setiap Tugas Web.',
      keys: ['Siklus request–response HTTP; method GET/POST; status code', 'Struktur proyek Django: project vs app', 'urls.py, path(), include(), named URL', 'settings.py: DEBUG, ALLOWED_HOSTS, static & media', 'Deployment ke PaaS + environment variable', 'Virtual environment & requirements.txt'],
      probes: ['Gambar alur lengkap dari user mengetik URL sampai HTML muncul di browser, lewat Django.', 'Apa beda "project" dan "app" di Django? Kenapa Django memisahkan keduanya?', 'Kenapa aplikasi jalan di lokal tapi error 500 setelah di-deploy? Sebutkan 3 penyebab paling umum.'] },

    { id: 'pbp-06', t: 'Modul 02, Web Design Using HTML5 and CSS3', w: 2, d: 2,
      sum: 'Sub-CPMK 7. Navigation, layouting, template HTML, CSS, static files & assets, serta responsive framework.',
      why: 'Rubrik Design System bernilai 25% dari nilai kelompok PTS, porsi terbesar di sana. Yang dinilai: konsistensi UI antar modul dan responsif di semua ukuran layar. Materi ini juga naik ke Minggu 2, jadi kamu memakainya sepanjang sisa semester.',
      keys: ['HTML5 semantic element (header, nav, main, section, article, footer)', 'CSS box model, Flexbox, Grid', 'Responsive: media query, mobile-first', 'Django static files: STATIC_URL, {% load static %}, collectstatic', 'Template inheritance: base.html, {% block %}, {% extends %}', 'Bootstrap atau Tailwind, utility-first vs component-based'],
      probes: ['Buat layout responsif dengan Flexbox dan Grid. Kapan pakai yang mana?', 'Jelaskan pengelolaan static files di Django dari development sampai production. Apa fungsi collectstatic?', 'Rubrik PTS minta "CSS/JS dikompilasi secara terpisah menggunakan framework". Apa maksudnya secara teknis, dan bagaimana kamu memenuhinya?'] },

    { id: 'pbp-03', t: 'Modul 03, MTV Django Architecture', w: 3, d: 2,
      sum: 'Sub-CPMK 4. Model-Template-View sebagai separation of concern, ORM, migrations, dan Django Admin.',
      why: 'Yang membingungkan: "View" di Django sebenarnya adalah "Controller" di MVC, sedangkan "Template" adalah "View". Kalau model mentalnya salah dari awal, semua tutorial jadi terasa aneh.',
      keys: ['MTV vs MVC, pemetaan istilahnya', 'models.py, ORM, field type, relasi (ForeignKey, ManyToMany, OneToOne)', 'makemigrations vs migrate', 'QuerySet: filter, exclude, get, order_by; sifat lazy', 'Django Admin: register model, customize', 'Template language: {{ }}, {% %}, filter, template inheritance'],
      probes: ['Petakan MTV Django ke MVC klasik. Komponen mana yang namanya "tertukar" dan kenapa?', 'Apa beda makemigrations dan migrate? Apa yang terjadi kalau kamu ubah model tapi lupa keduanya?', 'Kenapa QuerySet disebut lazy? Kapan query SQL-nya benar-benar dijalankan?'] },

    { id: 'pbp-04', t: 'Modul 04, Data Delivery', w: 4, d: 2,
      sum: 'Sub-CPMK 5. Membuat View yang mengembalikan data dalam format HTML, XML, dan JSON.',
      keys: ['HttpResponse vs JsonResponse vs render', 'Serializer Django (serializers.serialize)', 'Content-Type dan kenapa penting', 'Struktur data JSON & mapping dari model', 'Endpoint untuk konsumsi frontend/mobile'],
      probes: ['Tulis 4 view yang mengembalikan objek yang sama dalam HTML, XML, JSON, dan JSON-by-ID.', 'Kenapa Content-Type harus benar? Apa yang terjadi kalau JSON dikirim dengan Content-Type text/html?', 'Bagaimana kamu memastikan endpoint JSON ini nanti bisa dikonsumsi Flutter di Topik 10?'] },

    { id: 'pbp-05', t: 'Modul 05, Form, Authentication, Session, and Cookie', w: 5, d: 3,
      sum: 'Sub-CPMK 6 & 12. Form Django, ModelForm, validasi, autentikasi & otorisasi, session vs cookie, dan CSRF.',
      why: '🚨 Banyak konsep sekaligus dan semuanya abstrak: session disimpan di server, cookie di client, CSRF token mencegah serangan yang tidak terlihat. Ditambah keamanan (Sub-CPMK 12) yang diuji di UTS.',
      keys: ['forms.py: Form vs ModelForm, validasi, cleaned_data', 'Autentikasi (siapa kamu) vs otorisasi (kamu boleh apa)', 'Session disimpan di server, cookie disimpan di browser, bagaimana keduanya terhubung', 'CSRF: apa serangannya dan bagaimana token mencegahnya', '@login_required decorator dan request.user', 'XSS & mengapa Django auto-escape template', 'SQL injection & mengapa ORM melindungimu'],
      probes: ['Jelaskan alur login Django lengkap: dari POST form sampai request berikutnya dikenali sebagai user yang sama. Di mana peran cookie sessionid?', 'Apa itu serangan CSRF? Jelaskan skenario konkretnya dan bagaimana token CSRF menggagalkannya.', 'Sebutkan 3 aspek keamanan yang otomatis ditangani Django dan 3 yang tetap jadi tanggung jawabmu.'] },

    { id: 'pbp-07', t: 'Modul 06, Web Interactivity (JavaScript, jQuery, AJAX)', w: 6, d: 3,
      sum: 'Sub-CPMK 8. Event handling di sisi client, manipulasi DOM, dan AJAX GET/POST tanpa reload halaman.',
      why: '🚨 Butuh berpikir asinkron (callback, promise, async/await) sekaligus memahami dua sisi sekaligus: JS di browser dan view di server. AJAX POST juga wajib menyertakan CSRF token, kalau lupa, error 403 yang membingungkan.',
      keys: ['DOM: querySelector, addEventListener, event bubbling', 'fetch() dan async/await; XMLHttpRequest; jQuery $.ajax', 'AJAX GET untuk memuat data, AJAX POST untuk mengirim data', '⚠️ CSRF token wajib disertakan pada AJAX POST di Django', 'Merender data JSON menjadi elemen DOM', 'Komponen JavaScript/AJAX bernilai 10% dari nilai individu PTS, integrasinya harus mulus, bukan DOM dasar'],
      probes: ['Tulis fungsi AJAX GET yang mengambil JSON dari view Django lalu merendernya sebagai kartu. Jelaskan tiap baris.', 'Kenapa AJAX POST ke Django memberi error 403? Bagaimana cara menyertakan CSRF token dengan benar?', 'Apa beda callback, Promise, dan async/await? Tulis kode yang sama dalam ketiga gaya itu.'] },

    { id: 'pbp-11', t: 'Modul 07, More on Web Development (HTMX dan Browser Dev Tools)', w: 7, d: 2,
      sum: 'Sub-CPMK 16. Pengembangan web dengan teknologi terkini: HTMX sebagai alternatif JavaScript manual, plus browser development tools untuk membedah request dan tampilan.',
      why: 'Modul baru tahun ini. Tutorial 06 bersifat asinkron dan BUKAN syarat Tugas Individu, jadi paling gampang dilewati. Padahal materinya masuk cakupan UTS yang bernilai 30%.',
      keys: ['HTMX: hx-get, hx-post, hx-target, hx-swap', 'HTMX sebagai pengganti AJAX manual untuk kasus sederhana', 'Kapan HTMX cukup dan kapan tetap butuh JavaScript penuh', 'DevTools tab Network: membaca status code, header, dan payload', 'DevTools tab Elements: mengubah CSS secara langsung untuk mendiagnosis layout', 'DevTools tab Console: membaca error JavaScript dan menelusuri sumbernya'],
      probes: ['Tulis ulang satu fitur AJAX-mu memakai HTMX. Bandingkan jumlah barisnya dan jelaskan apa yang HTMX kerjakan di belakang layar.', 'Aplikasimu memberi error 403 saat submit form. Telusuri lewat DevTools: tab mana yang kamu buka, apa yang kamu cari, dan bagaimana kamu memastikan penyebabnya?', 'Kapan HTMX menjadi pilihan yang salah? Beri satu contoh fitur yang tetap butuh JavaScript.'] },

    { id: 'pbp-12', t: 'Modul 08, Django REST Framework', w: 11, d: 3,
      sum: 'Sub-CPMK 17. Membangun REST API dengan Django REST Framework: serializer, viewset, dan routing endpoint.',
      why: '🚨 Modul baru tahun ini dan jadi jembatan wajib menuju Flutter. Nilai Arsitektur & DRF bernilai 20% dari nilai kelompok Proyek Akhir. Kalau endpoint-mu tidak rapi di sini, seluruh pekerjaan Flutter-mu di Minggu 12 sampai 14 ikut goyah.',
      keys: ['REST: resource, HTTP verb, status code yang benar', 'Serializer dan ModelSerializer: dari objek Django ke JSON dan sebaliknya', 'APIView, ViewSet, dan Router', 'Validasi di level serializer', 'Permission class dan autentikasi pada API', 'Menguji endpoint dengan Postman atau curl sebelum menyentuh Flutter'],
      probes: ['Apa beda JsonResponse manual (Modul 04) dengan ModelSerializer DRF? Kapan yang manual masih lebih tepat?', 'Rancang endpoint CRUD lengkap untuk satu model. Sebutkan URL, HTTP verb, dan status code untuk tiap operasi.', 'Bagaimana kamu memastikan hanya pemilik data yang boleh mengubahnya lewat API? Tunjukkan letak pengecekannya.'] },

    { id: 'pbp-08', t: 'Modul 09, Intro to Dart Programming and Flutter Framework', w: 12, d: 3,
      sum: 'Sub-CPMK 10. Bahasa Dart (null safety, async) dan konsep dasar Flutter: widget tree, stateless vs stateful.',
      why: '🚨 Pergantian paradigma total di tengah semester: dari Python + HTML ke Dart + widget tree. Konsep "semuanya adalah widget" dan setState() butuh waktu untuk masuk. Ditambah setup environment Flutter yang sering bermasalah.',
      keys: ['Dart: tipe data, null safety (?, !, late), Future & async/await', 'Widget tree & composition, "everything is a widget"', 'StatelessWidget vs StatefulWidget', 'setState() dan siklus rebuild', 'BuildContext', 'Hot reload vs hot restart', 'Struktur proyek Flutter & pubspec.yaml'],
      probes: ['Kapan pakai StatelessWidget dan kapan StatefulWidget? Beri contoh yang mudah salah pilih.', 'Apa yang sebenarnya terjadi saat setState() dipanggil? Kenapa mengubah variabel tanpa setState tidak memperbarui UI?', 'Jelaskan null safety Dart: apa arti String?, String!, dan late? Kenapa fitur ini ada?'] },

    { id: 'pbp-09', t: 'Modul 10, Layouts and Forms (Flutter)', w: 13, d: 2,
      sum: 'Sub-CPMK 10. Widget layout (Row, Column, Stack, Container), scrollable list, form, dan validasi input.',
      keys: ['Row & Column: mainAxisAlignment vs crossAxisAlignment', 'Expanded, Flexible, SizedBox, Padding', 'Stack & Positioned', 'ListView, ListView.builder, GridView', 'Form, TextFormField, GlobalKey<FormState>, validator', 'Navigator dasar untuk berpindah halaman'],
      probes: ['Bangun form dengan 4 field dan validasi. Jelaskan peran GlobalKey<FormState> dan kapan validate() dipanggil.', 'Apa beda Expanded dan Flexible? Kapan kamu butuh keduanya?', 'Kenapa ListView.builder lebih baik dari ListView biasa untuk data panjang?'] },

    { id: 'pbp-10', t: 'Modul 11, Navigation, Networking, and Integration', w: 14, d: 3,
      sum: 'Sub-CPMK 11 & 12. Navigasi antar halaman, HTTP request dari Flutter, JSON serialization, dan integrasi Flutter ↔ Django lewat web service.',
      why: '🚨 <b>Puncak kesulitan mata kuliah ini</b> dan materi UAS. Kamu harus menyatukan semuanya: model Django, endpoint JSON, HTTP client di Flutter, parsing JSON ke objek Dart, DAN mempertahankan sesi login lintas platform (cookie request). Banyak titik yang bisa gagal, dan error-nya sering tidak informatif.',
      keys: ['Navigator.push/pop, named route, passing argument antar halaman', 'Drawer & bottom navigation', 'package http & pbp_django_auth / CookieRequest', 'JSON → objek Dart: fromJson/toJson, quicktype', 'FutureBuilder untuk merender data asinkron', 'Autentikasi lintas platform: menjaga cookie session dari Django di Flutter', 'CORS dan kenapa muncul', 'Keamanan: jangan simpan secret di kode client'],
      probes: ['Gambar alur lengkap: user menekan tombol di Flutter → request ke Django → data tersimpan → UI Flutter diperbarui. Sebutkan setiap komponen yang terlibat.', 'Bagaimana sesi login dari Django dipertahankan di Flutter? Kenapa http biasa tidak cukup dan CookieRequest dibutuhkan?', 'Tulis fungsi fromJson untuk satu model dan jelaskan cara memakainya di dalam FutureBuilder.'] },
  ],

  traps: [
    '🚨 <b>Memakai strategi angkatan tahun lalu.</b> Struktur nilainya berubah total: UTS 20% jadi 30%, UAS 20% jadi 25%, muncul Kuis Pemrograman 15%, dan Tutorial turun jadi <b>0%</b>. Catatan senior soal pembagian nilai sudah kedaluwarsa.',
    '🚨 <b>Melewati tutorial karena bobotnya 0%.</b> Ini jebakan terbesar tahun ini. Sembilan tutorial itu satu-satunya latihan terstruktur untuk materi yang diuji Kuis Pemrograman (15%) dan UTS (30%). Nilainya nol, taruhannya 45%.',
    'Menganggap deadline tugas jatuh tengah malam. Semua Tugas Individu berdeadline <b>12.00 WIB</b>, tengah hari. Salah baca satu kali saja sudah cukup untuk kehilangan satu tugas penuh.',
    'Menyiapkan diri untuk Kuis Pemrograman seperti menyiapkan tugas. Kuis bersifat <b>CLOSE</b>: tanpa internet, tanpa AI, tanpa contekan. Kamu harus bisa menulis Django dari kepala, bukan dari tab yang terbuka.',
    'Mengandalkan AI di komponen yang salah. Hanya 30% penilaian yang bersifat OPEN dan mengizinkan AI. Sisanya yang <b>70%</b> justru menguji apa yang tertinggal di kepalamu setelah AI ditutup.',
    'Menunda Django REST Framework. Modul 08 baru tahun ini dan jadi fondasi seluruh proyek Flutter. Endpoint yang berantakan di Minggu 11 akan menghantui sampai Proyek Akhir.',
    'Menunda belajar Flutter sampai Minggu 12. Dart adalah bahasa baru dan setup environment-nya sering bermasalah. Mulai kenalan di jeda setelah UTS.',
    'Menganggap nilai kelompok akan menolong. PTS dan PAS sama-sama 30% kelompok dan <b>70% individu</b>. Tim yang bagus tidak menutupi modul yang kamu kerjakan setengah jadi.',
  ],

  strategy: [
    { t: '1. Perlakukan 70% CLOSE sebagai poros semester', d: 'UTS 30% + UAS 25% + Kuis Pemrograman 15% = <b>70% nilaimu diuji tanpa internet dan tanpa AI</b>. Setiap kali kamu menyelesaikan sesuatu dengan bantuan AI, tutup semuanya lalu tulis ulang dari nol. Yang menentukan nilaimu bukan apa yang bisa kamu selesaikan, tapi apa yang tersisa di kepala saat semua bantuan dicabut.' },
    { t: '2. Kerjakan sembilan tutorial itu justru karena bernilai 0%', d: 'Bobot nol membuat tutorial terasa opsional, dan di situlah jebakannya. Tutorial adalah satu-satunya latihan terstruktur untuk materi Kuis Pemrograman dan UTS. Kerjakan sampai tuntas, tanpa copy-paste, dan pastikan kamu bisa menjelaskan tiap barisnya. Anggap saja tutorial itu bernilai 45%, karena secara tidak langsung memang begitu.' },
    { t: '3. Pasang alarm 12.00 WIB, bukan 23.59', d: 'Sembilan Tugas Individu semuanya berdeadline <b>12.00 WIB</b>, satu minggu setelah rilis. Begitu tugas dirilis, langsung catat tanggal dan jamnya di kalender. Kebiasaan mengerjakan tugas semalam sebelumnya tidak berlaku di sini, karena "besok pagi" sudah lewat deadline.' },
    { t: '4. Siapkan tiga Kuis Pemrograman seperti menyiapkan ujian', d: 'Kuis 1 di Minggu 5 (form, auth, session, cookie), Kuis 2 di Minggu 7 (web interactivity), Kuis 3 di Minggu 15 (Flutter, saat Proyek Akhir sedang berjalan). Masing-masing bernilai 5% dan bersifat CLOSE. Seminggu sebelumnya, latih menulis kode dari nol dengan editor polos tanpa autocomplete dan tanpa internet.' },
    { t: '5. Bereskan Django REST Framework sebelum menyentuh Flutter', d: 'Modul 08 adalah jembatan antara separuh pertama dan separuh kedua semester. Uji setiap endpoint dengan Postman atau curl sampai benar-benar bersih <b>sebelum</b> ada satu baris Dart pun ditulis. Men-debug Flutter di atas API yang bermasalah berarti mencari satu bug di dua tempat sekaligus.' },
    { t: '6. Pakai jeda setelah UTS untuk memasang Flutter', d: 'Antara akhir UTS dan Modul 09 ada ruang bernapas. Pakai untuk menginstal Flutter, menjalankan aplikasi counter bawaan, dan menyelesaikan satu codelab resmi. Saat Minggu 12 tiba, kamu sudah lewat dari fase instalasi yang biasanya memakan waktu paling lama.' },
    { t: '7. Ambil modul proyek yang menyentuh semua kriteria rubrik', d: 'Nilai individu adalah 70% dari nilai proyek. Untuk PTS, Implementation bernilai 35% dan JavaScript/AJAX 10%; untuk PAS, Foundation 25% dan Transaction 20%. Pastikan modul yang kamu pegang <b>menyentuh semuanya</b>. Kalau kamu hanya mengerjakan tampilan, poin CRUD dan integrasi hilang meski proyek timnya sukses.' },
    { t: '8. Bidik 3.5, bukan 4', d: 'Skala rubrik berhenti di 4, tapi 4 hanya diberi untuk inovasi nyata di luar kebutuhan dasar dan tetap lewat pertimbangan dosen. Nilai <b>3.5 sudah berarti memenuhi seluruh kriteria tanpa bug</b>. Kejar 3.5 yang konsisten di semua komponen dulu; mengejar 4 sambil meninggalkan bug di tempat lain adalah pertukaran yang merugi.' },
    { t: '9. Cek situs resmi PBP tiap minggu', d: 'Panduan tutorial, tugas individu, dan proyek diterbitkan di <b>pbp-fasilkom-ui.github.io/ganjil-2026</b>. Kalau ada beda antara catatan di Sandbox ini dan situs resmi, situs resmi yang benar. Sandbox hanya membantumu ingat, bukan menggantikan sumbernya.' },
  ],

  resources: [
    { type: 'web', t: 'Django, Official Tutorial (Writing your first Django app)', url: 'https://docs.djangoproject.com/en/stable/intro/tutorial01/', note: '⭐ 8 bagian, mencakup model, view, template, form, admin, dan testing. Selesaikan seluruhnya sebelum Minggu 3.' },
    { type: 'yt', t: 'Corey Schafer, Python Django Tutorials', url: 'https://www.youtube.com/playlist?list=PL-osiE80TeTtoQCKZ03TU5fNfx2UY6U4p', note: '⭐ Seri Django terbaik di YouTube. Urutannya nyaris identik dengan silabus Minggu 2–7: models, forms, auth, static files, deployment.' },
    { type: 'web', t: 'Django Girls Tutorial (Bahasa Indonesia tersedia)', url: 'https://tutorial.djangogirls.org/id/', note: 'Sangat ramah pemula dan ada versi bahasa Indonesia. Bagus untuk membangun rasa percaya diri di dua minggu pertama.' },
    { type: 'web', t: 'MDN Web Docs, HTML, CSS, JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Learn', note: '⭐ Rujukan paling akurat untuk Topik 06 & 07. Bagian "Learn Web Development" terstruktur dari nol.' },
    { type: 'web', t: 'Tailwind CSS, Documentation', url: 'https://tailwindcss.com/docs', note: 'Rubrik PTS menyebut Bootstrap atau Tailwind eksplisit. Situs yang sedang kamu baca ini juga dibangun dengan Tailwind.' },
    { type: 'web', t: 'JavaScript.info, The Modern JavaScript Tutorial', url: 'https://javascript.info/', note: '⭐ Untuk Topik 07. Bagian "Promises, async/await" dan "Fetch" persis yang kamu butuhkan untuk AJAX.' },
    { type: 'web', t: 'Flutter, Official Docs & Codelabs', url: 'https://docs.flutter.dev/get-started/codelab', note: '⭐ Codelab "Your first Flutter app" adalah cara tercepat memahami widget tree dan state. Kerjakan sebelum Minggu 12.' },
    { type: 'yt', t: 'The Net Ninja, Flutter Tutorial for Beginners', url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9jLYyp2Aoh6hcWuxFDX6PBJ', note: 'Video pendek dan terstruktur untuk Dart & Flutter dasar. Cocok untuk Topik 08–09.' },
    { type: 'web', t: 'Dart, Language Tour', url: 'https://dart.dev/language', note: 'Untuk null safety, Future, dan async/await. Baca ini sebelum menyentuh Flutter.' },
    { type: 'tool', t: 'quicktype, JSON ke model Dart otomatis', url: 'https://app.quicktype.io/', note: 'Tempel JSON dari endpoint Django-mu, pilih Dart, dan dapatkan class dengan fromJson/toJson. Menghemat banyak waktu di Topik 10.' },
    { type: 'web', t: 'Situs resmi PBP Ganjil 2026/2027', url: 'https://pbp-fasilkom-ui.github.io/ganjil-2026/', note: '⭐ Sumber kebenaran untuk tutorial, tugas individu, dan panduan proyek. Kalau situs ini berbeda dengan catatan di Sandbox, ikuti situs resminya.' },
    { type: 'web', t: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/', note: 'Untuk Sub-CPMK 12 (aspek keamanan). Fokus ke Injection, Broken Authentication, dan XSS, tiga yang paling relevan dengan Django.' },
  ],
};

export default pbp;
