/* ==========================================================================
   Basis Data, Kelas B, Gasal 2026/2027
   Sumber: BRP Basis Data Kelas Reguler, Gasal 2026/2027 (CSGE602070)
   ========================================================================== */
import type { CourseContent } from '../types';

const basdat: CourseContent = {
  meta: [
    { k: 'Kelas', v: 'Basis Data B (Reguler) · Semester 3 · 4 SKS' },
    { k: 'Dosen', v: 'Ilma Alpha Mannix, M.Kom.' },
    { k: 'Jadwal kuliah', v: 'Rabu 16.00–17.40 di A2.08 · Jumat 10.00–11.40 di A2.08 (Ged Baru)' },
    { k: 'Sesi lab', v: 'Selasa 13.00–13.50 di Lab A1.03 (Ged Baru). Tiap pekan diisi Mini Quiz atau Tutorial Lab, wajib hadir fisik.' },
    { k: 'Prasyarat', v: 'Struktur Data dan Algoritma' },
    { k: 'Prasyarat untuk', v: 'Rekayasa Perangkat Lunak' },
    { k: 'Capaian', v: 'CPMK1 konsep & tahapan basisdata · CPMK2 merancang basisdata sesuai kebutuhan · CPMK3 mengimplementasikan & memanipulasi basisdata' },
  ],

  books: [
    { t: 'Database Systems, 6th Edition', by: 'Elmasri et al. · Addison-Wesley, 2011 (buku utama)' },
    { t: 'Database Systems, 5th Edition', by: 'Connolly et al. · Pearson Education, 2010' },
  ],

  grading: {
    total: '100%',
    components: [
      { name: 'UTS', weight: 25, freq: '1×', note: 'Naik dari 20% tahun lalu. Materi paruh pertama: Pengenalan & Arsitektur, ER, EER, Relational Mapping, Relational Data Model, DDL/DML, Basic Query.' },
      { name: 'UAS', weight: 25, freq: '1×', note: 'Materi paruh kedua: Advanced Query, Indexing, Trigger & Stored Procedure, Functional Dependency & Normalisasi, Relational Algebra, Query Processing & Optimization.' },
      { name: 'Tutorial Lab', weight: 20, freq: '6× (diambil best-5)', note: '⭐ Komponen non-ujian terbesar, naik jauh dari 6% tahun lalu. Enam lab: DDL & DML, Basic Query, Advanced Query, Indexing, Trigger dan SP, Query Optimization. Panduan diumumkan Selasa satu pekan sebelumnya; soalnya baru dirilis saat sesi berlangsung.' },
      { name: 'Tugas Individu (TI)', weight: 15, freq: '5×', note: 'TI-1 Design EER (5%), TI-2 Relational Mapping (2%), TI-3 Implementasi DDL (2%), TI-4 Trigger & Stored Procedure (3%), TI-5 Relational Algebra (3%). Bobotnya tidak rata: TI-1 sendirian bernilai sepertiga komponen ini.' },
      { name: 'Mini Quiz SCeLE (MQ)', weight: 8, freq: '5× (diambil best-4)', note: 'MQ 1 (Konsep & Arsitektur), MQ 4 (Relational Mapping), MQ 5 (Relational Data Model), MQ 6 (FD & Normalization), MQ 7 (RA). Dikerjakan di sesi lab hari Selasa lewat SCeLE; <b>4 nilai terbaik dari 5</b> yang dipakai.' },
      { name: 'Mini Quiz Paper Based (MQP)', weight: 7, freq: '2×', note: 'MQ 2 (ERD) dan MQ 3 (EERD), masing-masing <b>3,5%</b>. Dikerjakan di atas kertas dan <b>tidak punya jatah gugur</b>, jadi keduanya wajib hadir.' },
    ],
    scale: [
      { g: 'A', min: 85 }, { g: 'A-', min: 80 }, { g: 'B+', min: 75 }, { g: 'B', min: 70 },
      { g: 'B-', min: 65 }, { g: 'C+', min: 60 }, { g: 'C', min: 55 }, { g: 'D', min: 45 }, { g: 'E', min: 0 },
    ],
    notes: [
      '🚨 <b>Struktur nilai berubah total dari tahun lalu.</b> Tugas Kelompok dihapus seluruhnya, Latihan Lab naik dari 6% menjadi <b>Tutorial Lab 20%</b>, Mini Quiz jadi 7 kali bernilai 15%, dan komponen Partisipasi Kelas sudah tidak ada. Jangan memakai strategi angkatan sebelumnya.',
      '💡 <b>Selasa siang adalah hari penentu.</b> Sesi lab 13.00–13.50 diisi Mini Quiz <i>atau</i> Tutorial Lab tiap pekan, dan keduanya berjumlah 35% nilai akhir. BRP menyebut <b>tidak ada susulan dengan alasan apapun</b> dan mahasiswa <b>wajib hadir secara fisik</b> di ruang lab sesuai jadwal SLCM.',
      '⭐ Dari 6 Tutorial Lab <b>diambil 5 terbaik</b>, jadi ada satu jatah gugur. Dari MQ 1, 4, 5, 6, 7 diambil <b>4 terbaik</b> (total 8%). Tapi <b>MQ 2 dan MQ 3 yang paper based tidak punya jatah gugur</b>, masing-masing 3,5% dan langsung hilang kalau kamu tidak hadir.',
      '🚨 <b>Penalti keterlambatan Tugas Individu:</b> −10 poin kalau dikumpulkan 5–30 menit setelah deadline; <b>−50% dari nilai tugas</b> kalau lebih dari 30 menit sampai 24 jam; lebih dari 24 jam <b>tidak diterima</b>.',
      '⚠️ <b>Tidak mengisi dan tidak menandatangani <i>code of conduct</i> membuat Tugas Individu tidak dinilai</b> (BRP menyebutnya Strict Rules). Nama, NPM, kelas, nama file, dan tipe file wajib sesuai format yang ditentukan; setiap ketidaksesuaian dikenakan penalti <b>−5 poin</b>.',
      'Kalau tugas diminta dalam bentuk softcopy DAN hardcopy, telat pada salah satunya dihitung telat untuk keduanya.',
      'Semua perangkat komunikasi harus disetel silent atau dimatikan selama sesi kelas.',
      'Kode etik mengacu pada Peraturan Rektor UI Nomor 4 Tahun 2014. Ketidakjujuran akademik (plagiarisme, pembocoran atau pemalsuan dokumen ujian, mencontek, pemalsuan data) dapat berujung nilai <b>E</b> untuk mata kuliah, hingga skorsing atau pemutusan status mahasiswa.',
      'Konversi huruf mengikuti standar Universitas Indonesia (acuan umum, konfirmasi ke dosen kelasmu).',
    ],
  },

  weeks: [
    { n: 1, title: 'Pengenalan & Arsitektur Sistem Basis Data', points: [
        'Selasa 25 Agu libur Maulid Nabi Muhammad, tidak ada sesi lab',
        'Rabu 26 Agu: penjelasan BRP dan pengenalan basis data',
        'Jumat 28 Agu: konsep & arsitektur sistem basis data' ], tasks: [] },
    { n: 2, title: 'Pemodelan Data Menggunakan model ER', points: [
        'Entity, attribute, relationship, kardinalitas, partisipasi',
        'Dua sesi penuh (Rabu 2 Sep dan Jumat 4 Sep) khusus ER' ],
      tasks: ['📝 Mini Quiz 1 (SCeLE): Konsep & Arsitektur Sistem Basis Data'] },
    { n: 3, title: 'Pemodelan Data Menggunakan model EER', points: [
        'Specialization & generalization, subclass/superclass',
        'Constraint disjoint/overlapping, total/partial; union type (category)' ],
      tasks: ['📝 Mini Quiz 2 (paper based): ERD', '🔥 Tugas Individu 1 · Design EER: diumumkan 11 Sep, deadline 24 Sep'] },
    { n: 4, title: 'The Relational DB Design by ER/EER to Relational Mapping', points: [
        'Algoritma pemetaan ER ke skema relasional',
        'Pemetaan relasi 1:1, 1:N, M:N, multivalued, weak entity, dan konstruksi EER' ],
      tasks: ['📝 Mini Quiz 3 (paper based): EERD'] },
    { n: 5, title: 'Relational Data Model & Relational DB Constraint', points: [
        'Relasi, tuple, domain, skema vs instance',
        'Super key, candidate key, primary key, foreign key',
        'Entity & referential integrity; aksi ON DELETE/UPDATE' ],
      tasks: ['📝 Mini Quiz 4 (SCeLE): Relational Mapping', '🔥 Tugas Individu 2 · Relational Mapping: diumumkan 25 Sep, deadline 1 Okt'] },
    { n: 6, title: 'SQL — DDL + insert/update/delete row', points: [
        'CREATE/ALTER/DROP TABLE, tipe data, constraint di level tabel',
        'INSERT, UPDATE, DELETE' ],
      tasks: ['📝 Mini Quiz 5 (SCeLE): Relational Data Model', '🔥 Tugas Individu 3 · Implementasi DDL: diumumkan 2 Okt, deadline 8 Okt'] },
    { n: 7, title: 'SQL — Basic Query', points: [
        'SELECT-FROM-WHERE, operator, ORDER BY, DISTINCT',
        'JOIN dasar, aggregate function, GROUP BY, HAVING' ],
      tasks: ['🧪 Tutorial Lab 1: DDL & DML'] },
    { n: 8, title: 'UTS', points: [
        'Ujian Tengah Semester, 12 sampai 21 Oktober 2026',
        'Materi: Pengenalan & Arsitektur sampai Basic Query' ], tasks: [], flag: 'exam' },
    { n: 9, title: 'UTS, lalu SQL — Advanced Query dimulai', points: [
        'Lanjutan periode ujian sampai 21 Oktober',
        'Jumat 23 Okt: SQL Advanced Query dimulai' ], tasks: [], flag: 'exam' },
    { n: 10, title: 'SQL — Advanced Query', points: [
        'Subquery, correlated subquery, EXISTS, set operation',
        'View dan CTE' ],
      tasks: ['🧪 Tutorial Lab 2: Basic Query'] },
    { n: 11, title: 'SQL — Indexing, lalu Trigger & Stored Procedure', points: [
        'Rabu 4 Nov: SQL Indexing',
        'Jumat 6 Nov: Trigger and Stored Procedure dimulai' ],
      tasks: ['🧪 Tutorial Lab 3: Advanced Query'] },
    { n: 12, title: 'Trigger and Stored Procedure (SP)', points: [
        'Trigger: BEFORE/AFTER, ROW vs STATEMENT level',
        'Stored procedure, function, dan penggunaannya' ],
      tasks: ['🧪 Tutorial Lab 4: Indexing', '🔥 Tugas Individu 4 · Trigger & Stored Procedure: diumumkan 13 Nov, deadline 19 Nov'] },
    { n: 13, title: 'Functional Dependency (FD) and Normalization', points: [
        'Functional dependency, closure, minimal cover',
        'Bentuk normal 1NF, 2NF, 3NF, BCNF; dekomposisi' ],
      tasks: ['🧪 Tutorial Lab 5: Trigger & SP'] },
    { n: 14, title: 'Relational Algebra (RA)', points: [
        'Operator dasar: σ, π, ∪, −, ×, ρ',
        'Operator turunan: ⋈ (join), ∩, ÷ (division)' ],
      tasks: ['📝 Mini Quiz 6 (SCeLE): FD & Normalization', '🔥 Tugas Individu 5 · Relational Algebra: diumumkan 27 Nov, deadline 3 Des'] },
    { n: 15, title: 'Query Processing and Optimization', points: [
        'Tahap pemrosesan query, query tree & query plan',
        'Heuristic optimization vs cost-based optimization',
        'Estimasi biaya operasi join & selection' ],
      tasks: ['📝 Mini Quiz 7 (SCeLE): Relational Algebra'] },
    { n: 16, title: 'Review, lalu UAS dimulai', points: [
        'Selasa 8 Des: Tutorial Lab terakhir',
        'Rabu 9 Des: Review keseluruhan materi',
        'UAS dimulai 10 Desember 2026' ],
      tasks: ['🧪 Tutorial Lab 6: Query Optimization'], flag: 'exam' },
    { n: 17, title: 'UAS (pekan kedua)', points: [
        'Lanjutan periode ujian sampai 19 Desember 2026' ], tasks: [], flag: 'exam' },
  ],

  topics: [
    { id: 'bd-01', t: 'Pengenalan Basis Data', w: 1, d: 1,
      sum: 'Kenapa basis data ada: masalah pendekatan file-processing, keunggulan DBMS, dan siapa saja aktor di sekitar basis data.',
      keys: ['Kelemahan sistem file tradisional (redundansi, inkonsistensi, isolasi data)', 'Keunggulan DBMS: kontrol redundansi, sharing, backup & recovery, enforcement constraint', 'Aktor: DBA, database designer, end user, application programmer', 'Kapan TIDAK perlu DBMS'],
      probes: ['Sebutkan 4 masalah konkret pendekatan file-processing dan bagaimana DBMS menyelesaikan masing-masing.', 'Apa beda peran database designer, DBA, dan application programmer?', 'Beri satu skenario nyata di mana memakai DBMS justru berlebihan.'] },

    { id: 'bd-02', t: 'Konsep & Arsitektur Sistem Basis Data', w: 1, d: 2,
      sum: 'Arsitektur tiga skema (external–conceptual–internal), data independence, model data, bahasa DBMS, dan arsitektur client-server.',
      keys: ['Three-schema architecture & tujuan tiap level', 'Logical data independence vs physical data independence', 'Skema vs instance (dan mana yang jarang berubah)', 'DDL, DML, DCL, TCL', 'Arsitektur two-tier vs three-tier'],
      probes: ['Jelaskan arsitektur tiga skema. Perubahan apa di level internal yang TIDAK boleh mempengaruhi program aplikasi, dan itu disebut apa?', 'Apa beda logical dan physical data independence? Mana yang lebih sulit dicapai dan kenapa?', 'Klasifikasikan CREATE, SELECT, GRANT, COMMIT ke DDL/DML/DCL/TCL.'] },

    { id: 'bd-03', t: 'Pemodelan Data dengan model ER', w: 2, d: 2,
      sum: 'Menerjemahkan kebutuhan dunia nyata jadi diagram: entity, attribute (simple, composite, multivalued, derived), relationship, kardinalitas, dan partisipasi.',
      why: 'Bukan sulit secara teknis, tapi <b>ambigu</b>. Dua orang bisa membuat ERD berbeda dari studi kasus yang sama, dan yang dinilai adalah ketepatan menangkap aturan bisnis, bukan kerapian gambar.',
      keys: ['Jenis atribut: simple, composite, multivalued, derived, key', 'Kardinalitas 1:1, 1:N, M:N', 'Partisipasi total (garis ganda) vs partial', 'Weak entity, identifying relationship, partial key', 'Relationship dengan atribut, dan relationship ternary'],
      probes: ['Dari studi kasus "perpustakaan", gambar ERD lengkap dengan kardinalitas dan partisipasi. Justifikasi tiap keputusan.', 'Kapan sesuatu menjadi weak entity, bukan entity biasa dengan foreign key? Beri contoh.', 'Kenapa relationship ternary tidak selalu bisa dipecah jadi tiga relationship biner? Beri contoh tandingannya.'] },

    { id: 'bd-04', t: 'Pemodelan Data dengan model EER', w: 3, d: 3,
      sum: 'Perluasan ER: specialization/generalization, inheritance atribut, constraint disjoint/overlapping & total/partial, serta union type (category).',
      why: '🚨 Notasi constraint-nya banyak dan mudah tertukar: d vs o, garis tunggal vs ganda. Ditambah union type (category) yang jarang dilatih tapi rutin muncul di soal.',
      keys: ['Specialization (top-down) vs generalization (bottom-up)', 'Inheritance: subclass mewarisi semua atribut & relationship superclass', 'Disjoint (d) vs overlapping (o)', 'Total (garis ganda) vs partial (garis tunggal) specialization', 'Union type / category, beda dari specialization biasa', 'Attribute-defined vs user-defined specialization'],
      probes: ['Gambar EER untuk "Pegawai → Dosen, Staf, Asisten" dengan constraint yang tepat. Jelaskan kenapa kamu pilih d/o dan total/partial.', 'Apa beda category (union type) dan specialization? Beri contoh yang HANYA bisa dimodelkan dengan category.', 'Kombinasi constraint apa yang berarti "setiap superclass harus jadi tepat satu subclass"?'] },

    { id: 'bd-05', t: 'ER/EER → Relational Mapping', w: 4, d: 3,
      sum: 'Algoritma sistematis mengubah diagram jadi skema relasional: 7 langkah untuk ER + langkah tambahan untuk konstruksi EER.',
      why: '🚨 Prosedural dan penuh aturan khusus: relasi 1:1 boleh digabung atau tidak, M:N wajib jadi tabel baru, multivalued jadi tabel terpisah, weak entity mewarisi PK owner, dan specialization punya 4 opsi pemetaan berbeda. Sekali kelewat satu langkah, seluruh skema jadi salah.',
      keys: ['Langkah 1–7 pemetaan ER (entity kuat → weak → 1:1 → 1:N → M:N → multivalued → n-ary)', 'Relasi 1:N: FK ditaruh di sisi N', 'Relasi M:N: WAJIB tabel baru dengan PK gabungan', 'Multivalued attribute → tabel sendiri', '4 opsi pemetaan specialization (multiple relations superclass+subclass, hanya subclass, single relation dengan type field, single relation dengan multiple boolean)', 'Kapan tiap opsi specialization dipilih'],
      probes: ['Petakan sebuah ERD lengkap ke skema relasional. Tuliskan semua tabel beserta PK dan FK-nya.', 'Untuk relasi 1:1 dengan partisipasi total di satu sisi, di sisi mana FK sebaiknya ditaruh dan kenapa?', 'Sebutkan 4 opsi pemetaan specialization. Untuk specialization total & disjoint, opsi mana yang paling efisien dan kenapa?'] },

    { id: 'bd-06', t: 'Relational Data Model & Constraints', w: 5, d: 2,
      sum: 'Definisi formal model relasional dan aturan integritas yang menjaga data tetap valid.',
      keys: ['Relasi, tuple, atribut, domain, degree, cardinality', 'Super key ⊇ candidate key ⊇ primary key', 'Entity integrity: PK tidak boleh NULL', 'Referential integrity: FK harus merujuk tuple yang ada atau NULL', 'Aksi CASCADE, SET NULL, RESTRICT saat delete/update', 'Sifat relasi: tidak ada tuple duplikat, urutan tidak bermakna'],
      probes: ['Apa beda super key, candidate key, dan primary key? Beri contoh tabel yang punya 3 candidate key.', 'Jelaskan entity integrity dan referential integrity, masing-masing dengan contoh pelanggarannya.', 'Kalau baris parent dihapus, apa beda hasil CASCADE, SET NULL, dan RESTRICT? Kapan masing-masing dipakai?'] },

    { id: 'bd-07', t: 'SQL, DDL + INSERT/UPDATE/DELETE', w: 6, d: 1,
      sum: 'Membuat dan memodifikasi struktur basis data, serta memanipulasi baris data.',
      keys: ['CREATE TABLE dengan tipe data & constraint', 'PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECK, DEFAULT', 'ALTER TABLE ADD/DROP/MODIFY', 'DROP vs TRUNCATE vs DELETE', 'INSERT (single, multiple, INSERT…SELECT), UPDATE dengan WHERE, DELETE'],
      probes: ['Tulis CREATE TABLE untuk 2 tabel berelasi lengkap dengan FK dan ON DELETE CASCADE.', 'Apa beda DELETE, TRUNCATE, dan DROP, dari sisi hasil, kecepatan, dan apakah bisa di-rollback?', 'Kenapa urutan CREATE TABLE penting saat ada foreign key? Bagaimana mengatasinya kalau ada referensi melingkar?'] },

    { id: 'bd-08', t: 'SQL, Basic Query', w: 7, d: 2,
      sum: 'SELECT-FROM-WHERE, JOIN, fungsi agregat, GROUP BY, dan HAVING.',
      why: 'Yang paling sering salah: urutan eksekusi logis SQL (FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY) yang berbeda dari urutan penulisannya. Ini penyebab error "column not found" dan salah paham WHERE vs HAVING.',
      keys: ['Urutan eksekusi logis: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT', 'INNER, LEFT, RIGHT, FULL OUTER JOIN, dan self join', 'COUNT, SUM, AVG, MIN, MAX, dan perlakuan terhadap NULL', 'WHERE (per baris, sebelum agregasi) vs HAVING (per grup, setelah agregasi)', 'Logika tiga nilai NULL: TRUE/FALSE/UNKNOWN'],
      probes: ['Tuliskan urutan eksekusi logis SQL. Kenapa alias di SELECT tidak bisa dipakai di WHERE tapi bisa di ORDER BY?', 'Kapan hasil COUNT(*) berbeda dari COUNT(kolom)? Jelaskan lewat NULL.', 'Tulis query LEFT JOIN untuk menemukan baris yang TIDAK punya pasangan di tabel kanan.'] },

    { id: 'bd-09', t: 'SQL, Advanced Query', w: 9, d: 3,
      sum: 'Subquery (scalar, IN, EXISTS, correlated), set operation, view, CTE, dan window function.',
      why: '🚨 Correlated subquery membalik model mental: subquery dijalankan ulang untuk setiap baris outer query. Ini juga sumber utama query lambat. Ditambah kasus "cari yang untuk SEMUA…" yang butuh NOT EXISTS ganda, pola paling sulit di SQL.',
      keys: ['Subquery non-correlated (dievaluasi sekali) vs correlated (dievaluasi per baris)', 'IN vs EXISTS vs JOIN, kapan hasilnya berbeda (hati-hati NULL pada NOT IN)', 'Pola "untuk semua" = NOT EXISTS ( … NOT EXISTS ( … ) )', 'UNION vs UNION ALL, INTERSECT, EXCEPT', 'View: kapan updatable', 'CTE (WITH) dan recursive CTE', 'Window function: ROW_NUMBER, RANK, PARTITION BY'],
      probes: ['Tulis query "cari mahasiswa yang mengambil SEMUA mata kuliah wajib" dengan double NOT EXISTS. Jelaskan cara kerjanya.', 'Kenapa NOT IN memberi hasil kosong yang mengejutkan kalau subquery-nya mengandung NULL? Tunjukkan.', 'Ubah satu correlated subquery menjadi JOIN + GROUP BY. Kenapa versi JOIN biasanya lebih cepat?'] },

    { id: 'bd-10', t: 'Indexing', w: 11, d: 3,
      sum: 'Struktur pendukung akses data: single-level index (primary, clustering, secondary), multi-level index, B+ tree index, hash index, dan dampaknya pada performa.',
      why: '🚨 Menyambung langsung ke B+ Tree di SDA. Yang sulit: menghitung jumlah block access untuk berbagai jenis index dan menentukan kapan index justru memperlambat (write-heavy, low cardinality).',
      keys: ['Dense vs sparse index', 'Primary index (file terurut pada key) vs clustering index (non-key) vs secondary index', 'Multi-level index → B+ tree', 'Kenapa B+ tree, bukan B tree, untuk index basis data', 'Hash index: bagus untuk equality, tidak berguna untuk range', 'Composite index & aturan leftmost prefix', 'Biaya index: memperlambat INSERT/UPDATE/DELETE'],
      probes: ['Hitung jumlah block access untuk pencarian dengan dan tanpa index pada file berisi N record dengan blocking factor tertentu.', 'Kenapa index pada kolom "jenis_kelamin" biasanya tidak berguna? Jelaskan lewat selektivitas.', 'Untuk composite index (a,b,c), query mana yang bisa memanfaatkannya dan mana yang tidak? Kenapa?'] },

    { id: 'bd-11', t: 'Trigger & Stored Procedure', w: 12, d: 2,
      sum: 'Logika yang dijalankan di dalam basis data: trigger yang otomatis merespons event, dan stored procedure/function yang dipanggil eksplisit.',
      keys: ['BEFORE vs AFTER trigger', 'ROW-level vs STATEMENT-level trigger', 'Variabel NEW dan OLD', 'Stored procedure vs function (procedure boleh tanpa return, function wajib return)', 'Bahaya: trigger berantai & rekursif', 'Keuntungan: enforcement aturan bisnis terpusat, mengurangi round-trip jaringan'],
      probes: ['Tulis trigger yang mencatat setiap perubahan gaji ke tabel audit. Kenapa kamu pilih AFTER, bukan BEFORE?', 'Kapan NEW tersedia dan kapan OLD tersedia pada INSERT, UPDATE, dan DELETE?', 'Sebutkan dua alasan trigger sering dihindari di sistem produksi meski powerful.'] },

    { id: 'bd-12', t: 'Functional Dependency & Normalization', w: 13, d: 3,
      sum: 'Teori ketergantungan antar atribut dan proses normalisasi, memecah tabel untuk menghilangkan anomali: 1NF, 2NF, 3NF, BCNF.',
      why: '🚨 <b>Topik paling matematis di Basdat.</b> Harus mahir menghitung closure atribut, menemukan SEMUA candidate key (bukan cuma satu), lalu menentukan bentuk normal. Ditambah dekomposisi yang harus lossless join DAN dependency preserving, dua sifat yang kadang tidak bisa dipenuhi bersamaan di BCNF.',
      keys: ['Definisi FD X→Y dan aksioma Armstrong (reflexivity, augmentation, transitivity)', 'Attribute closure X⁺ dan cara menghitungnya', 'Menemukan semua candidate key dari himpunan FD', 'Partial dependency (langgar 2NF) vs transitive dependency (langgar 3NF)', 'BCNF: setiap determinan harus super key', 'Lossless join decomposition & cara mengujinya', 'Dependency preservation, dan kenapa BCNF kadang mengorbankannya', 'Minimal/canonical cover'],
      probes: ['Diberi R(A,B,C,D,E) dan himpunan FD, hitung semua candidate key dan tentukan bentuk normal tertingginya. Tunjukkan langkahnya.', 'Beri contoh relasi yang 3NF tapi bukan BCNF. Kenapa kasus itu bisa terjadi?', 'Dekomposisi tabel ke BCNF lalu uji lossless join-nya. Apakah dependency-nya terjaga? Kalau tidak, apa artinya secara praktis?'] },

    { id: 'bd-13', t: 'Relational Algebra', w: 14, d: 3,
      sum: 'Bahasa kueri formal yang jadi dasar teoretis SQL: σ, π, ∪, −, ×, ρ, dan operator turunan ⋈, ∩, ÷.',
      why: '🚨 Notasi matematis yang tidak familiar + operator <b>division (÷)</b> yang tidak punya padanan langsung di SQL. Soal "cari X yang berhubungan dengan SEMUA Y" hampir pasti keluar dan hanya bisa dijawab rapi dengan division.',
      keys: ['6 operator dasar: σ (select), π (project), ∪, −, × (cartesian product), ρ (rename)', 'Operator turunan: ∩, ⋈ (theta/equi/natural join), ÷ (division)', 'Outer join: ⟕ ⟖ ⟗', 'Division: menjawab "untuk semua"', 'π menghilangkan duplikat (beda dari SELECT di SQL!)', 'Menerjemahkan RA ↔ SQL dua arah'],
      probes: ['Terjemahkan 3 query SQL ke relational algebra dan sebaliknya.', 'Jelaskan operator division dengan contoh konkret. Tulis juga padanan SQL-nya (double NOT EXISTS).', 'Kenapa π secara formal menghilangkan duplikat sementara SELECT di SQL tidak? Apa implikasinya?'] },

    { id: 'bd-14', t: 'Query Processing & Optimization', w: 15, d: 3,
      sum: 'Perjalanan sebuah query: parsing → translasi ke RA → optimasi (heuristic & cost-based) → eksekusi. Termasuk algoritma join dan estimasi biaya.',
      why: '🚨 Menuntut penguasaan relational algebra DAN indexing sekaligus. Estimasi biaya berupa perhitungan block access untuk beberapa algoritma join, mekanis tapi panjang dan mudah salah.',
      keys: ['Tahapan: parsing & translasi → optimasi → code generation → eksekusi', 'Query tree & query graph', 'Aturan heuristik: dorong σ (selection) sedekat mungkin ke daun, lalu π', 'Algoritma join: nested-loop, block nested-loop, index nested-loop, sort-merge, hash join', 'Selectivity & selection cardinality', 'Cost-based optimization dengan statistik katalog', 'Materialized vs pipelined evaluation'],
      probes: ['Gambar query tree awal untuk sebuah SQL, lalu optimasi dengan aturan heuristik. Jelaskan kenapa mendorong σ ke bawah selalu membantu.', 'Bandingkan biaya nested-loop join dan hash join untuk dua tabel dengan ukuran tertentu. Kapan sort-merge menang?', 'Informasi statistik apa yang dibutuhkan optimizer? Apa yang terjadi kalau statistiknya usang?'] },

  ],

  traps: [
    '🚨 <b>Telat lebih dari 24 jam = tugas tidak diterima.</b> Antara 5–30 menit sudah −10 poin, lewat 30 menit langsung <b>−50% nilai tugas</b>. Selalu submit versi apa pun jauh sebelum deadline, lalu perbaiki kalau masih sempat.',
    '🚨 <b>Lupa mengisi dan menandatangani code of conduct.</b> BRP menandainya Strict Rules: tugasmu <b>tidak dinilai sama sekali</b>, bukan dikurangi. Ini kehilangan paling murah dan paling menyakitkan di matkul ini.',
    'Salah menamai file atau salah format. Nama, NPM, kelas, nama file, dan tipe file wajib sesuai ketentuan, dan <b>setiap</b> ketidaksesuaian dipotong 5 poin. Baca instruksi penamaan dua kali sebelum submit.',
    'Melewatkan sesi lab Selasa. Di situ letak Mini Quiz dan Tutorial Lab, total <b>35% nilai akhir</b>, dan BRP menegaskan <b>tidak ada susulan dengan alasan apapun</b> serta wajib hadir fisik.',
    'Menyangka semua Mini Quiz punya jatah gugur. Yang diambil best-4 hanya MQ 1, 4, 5, 6, 7. <b>MQ 2 dan MQ 3 paper based tidak bisa dibuang</b>, masing-masing 3,5%.',
    'Menganggap Tugas Individu bobotnya rata. <b>TI-1 Design EER bernilai 5%</b>, sementara TI-2 dan TI-3 masing-masing hanya 2%. Tugas pertama justru yang terberat, dan datang paling awal.',
    'Belajar SQL hanya dengan membaca. SQL adalah keterampilan motorik, harus diketik. Pasang PostgreSQL atau MySQL lokal di Minggu 1.',
    'Menghafal langkah normalisasi tanpa bisa menghitung closure. Setiap soal normalisasi selalu dimulai dari mencari candidate key, dan itu butuh closure.',
  ],

  strategy: [
    { t: '1. Perlakukan Selasa siang seperti ujian mingguan', d: 'Sesi lab 13.00–13.50 selalu berisi Mini Quiz <i>atau</i> Tutorial Lab, dan dua komponen itu berjumlah <b>35%</b> nilai akhir. Buat rutin tetap Senin malam: cek jadwal pekan itu MQ atau lab, baca ulang slide dua sesi terakhir, dan siapkan environment DBMS-mu. Karena tidak ada susulan, satu Selasa yang terlewat langsung hilang permanen.' },
    { t: '2. Kejar Tutorial Lab, ini komponen non-ujian terbesar', d: '20% dari 6 lab, diambil <b>5 terbaik</b>. Panduannya diumumkan Selasa <b>satu pekan sebelum</b> sesinya, tapi soalnya baru dirilis saat lab berlangsung. Artinya seminggu itu jendela persiapanmu: kerjakan latihan sesuai panduan sampai lancar, supaya saat soal muncul kamu tinggal mengeksekusi, bukan belajar.' },
    { t: '3. Habiskan energi ekstra di TI-1 Design EER', d: 'TI-1 sendirian bernilai <b>5%</b>, sama dengan TI-2 dan TI-3 digabung. Diumumkan 11 Sep dengan deadline 24 Sep, jadi kamu punya dua pekan penuh. Gunakan semuanya: gambar EER, minta orang lain membacanya tanpa penjelasanmu, lalu perbaiki bagian yang mereka salah tafsir.' },
    { t: '4. Pasang DBMS sungguhan di Minggu 1', d: 'Install PostgreSQL (rekomendasi) atau MySQL + DBeaver. Setiap kali belajar konsep, langsung praktikkan: buat tabel, isi data, jalankan query. Konsep seperti referential integrity dan NULL propagation baru benar-benar masuk saat kamu melihat sendiri error-nya. Ini juga syarat agar 6 Tutorial Lab tidak dimulai dari nol.' },
    { t: '5. Untuk ERD dan EERD, latih dari studi kasus, bukan dari teori', d: 'ER/EER dinilai dari ketepatan menangkap aturan bisnis. Ambil deskripsi sistem nyata (e-commerce, rumah sakit, perpustakaan), gambar ERD-nya, lalu <b>petakan ke relasional dan implementasikan CREATE TABLE-nya</b>. Rangkaian ERD→mapping→DDL ini persis alur Minggu 2–6, alur UTS, dan alur TI-1 sampai TI-3.' },
    { t: '6. Latih ERD dan EERD di atas kertas, bukan di aplikasi', d: '<b>MQ 2 dan MQ 3 bersifat paper based</b> dan tidak punya jatah gugur. Kalau kamu selama ini menggambar diagram lewat dbdiagram.io atau Figma, kamu belum melatih hal yang diujikan. Sediakan buku gambar dan latih notasi ER/EER dengan tangan sampai lancar sebelum 8 September.' },
    { t: '7. Normalisasi: kuasai closure sebelum apa pun', d: 'Semua soal normalisasi bermuara pada satu keterampilan: menghitung X⁺ dan menemukan semua candidate key. Latih 15 soal khusus closure + candidate key sampai bisa dalam 3 menit. Setelah itu menentukan 2NF/3NF/BCNF jadi mekanis.' },
    { t: '8. Kerjakan SQL exercise online mingguan', d: 'SQLZoo dan PGExercises memberi umpan balik instan. Target: selesaikan modul JOIN & aggregate sebelum UTS, modul subquery & window function sebelum Tutorial Lab 3 di Minggu 11. Ini melatih kecepatan yang kamu butuhkan di lab yang soalnya baru dibuka saat sesi berjalan.' },
    { t: '9. Untuk Relational Algebra, latih penerjemahan dua arah', d: 'Ambil 10 query SQL, terjemahkan ke RA. Lalu ambil 10 ekspresi RA, terjemahkan ke SQL. Khusus untuk division (÷), hafalkan polanya karena hanya ada satu bentuk soal: "cari X yang berhubungan dengan SEMUA Y". RA muncul dua kali: TI-5 dan MQ 7.' },
  ],

  resources: [
    { type: 'yt', t: 'Neso Academy, DBMS', url: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRggZZgYpPMUxdY1CYkZtARR', note: '⭐ Terbaik untuk normalisasi, functional dependency, dan relational algebra. Penjelasannya bertahap dan penuh contoh soal.' },
    { type: 'yt', t: 'Gate Smashers, DBMS', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y', note: '⭐ Cepat dan padat, sangat bagus untuk latihan soal candidate key, normalisasi, dan indexing.' },
    { type: 'tool', t: 'SQLZoo, latihan SQL interaktif', url: 'https://sqlzoo.net/', note: '⭐ Latihan bertahap dari SELECT dasar sampai nested query. Umpan balik instan, tanpa perlu install apa pun.' },
    { type: 'tool', t: 'PostgreSQL Exercises', url: 'https://pgexercises.com/', note: 'Latihan yang lebih menantang: join, aggregate, window function, recursive CTE. Cocok setelah SQLZoo.' },
    { type: 'web', t: 'Use The Index, Luke!', url: 'https://use-the-index-luke.com/', note: '⭐ Referensi terbaik untuk indexing dan performa query. Baca bab "Anatomy of an Index" dan "The Where Clause".' },
    { type: 'tool', t: 'dbdiagram.io, gambar ERD cepat', url: 'https://dbdiagram.io/', note: 'Menulis skema dalam teks lalu jadi diagram otomatis, sekaligus bisa export ke SQL. Sangat cepat untuk latihan mapping.' },
    { type: 'tool', t: 'DB Fiddle, coba SQL online', url: 'https://www.db-fiddle.com/', note: 'Jalankan SQL PostgreSQL/MySQL tanpa install. Bagus untuk mengecek jawaban tugas dengan cepat.' },
    { type: 'yt', t: 'freeCodeCamp, Relational Database & SQL', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', note: 'Kursus SQL 4 jam dari nol. Bagus untuk pemanasan sebelum Minggu 6–7.' },
    { type: 'web', t: 'PostgreSQL, dokumentasi resmi', url: 'https://www.postgresql.org/docs/current/', note: 'Untuk trigger, stored procedure (PL/pgSQL), dan EXPLAIN ANALYZE saat belajar query optimization.' },
    { type: 'book', t: 'Elmasri & Navathe, Fundamentals of Database Systems', by: '', url: '', note: 'Buku acuan resmi. Bab normalisasi dan relational algebra-nya paling sering jadi sumber soal.' },
  ],
};

export default basdat;
