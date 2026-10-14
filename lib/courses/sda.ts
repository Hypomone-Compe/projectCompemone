/* ==========================================================================
   Struktur Data & Algoritma (SDA), Kelas D, Gasal 2026/2027
   Sumber: Buku Rancangan Pengajaran (BRP) SDA Gasal Reg.xlsx
   ========================================================================== */
import type { CourseContent } from '../types';

const sda: CourseContent = {
  meta: [
    { k: 'Kelas', v: 'SDA D · Semester 3 · 4 SKS' },
    { k: 'Dosen', v: 'Lintang Matahari Hasani, S.Kom., M.Kom., Ph.D. (lintang.matahari01@cs.ui.ac.id)' },
    { k: 'Jadwal kuliah', v: 'Selasa 15.00–16.40 di A6.07 · Kamis 10.00–11.40 di A6.07 (Ged Baru)' },
    { k: 'Jadwal lab', v: 'Jumat siang 14.00–16.00 di Lab.1107/1109, PC 34' },
    { k: 'Koordinator asdos', v: 'Belva Ghani Abhinaya · co-koor Abid Dayyan Putra Rahardjo & M Naufal Zhafran Rabiul B' },
    { k: 'Prasyarat', v: 'DDP 1 (konsep algoritma), sangat disarankan sudah kuat Java dari DDP 2' },
    { k: 'Lanjutan', v: 'DAA, KASD, Analitika Media Sosial, Pemrograman Kompetitif, Teknik Kompilator, Game Dev, Geometri Komputasional, Pemrograman Fungsional, dll.' },
  ],

  books: [
    { t: 'Data Structures and Problem Solving using Java, 4th Ed.', by: 'Mark Allen Weiss · Pearson, 2010 (buku utama)' },
    { t: 'Introduction to Java Programming and Data Structures, 11th Ed.', by: 'Y. Daniel Liang · Pearson, 2018' },
  ],

  grading: {
    total: '100%',
    components: [
      { name: 'UTS', weight: 30, freq: '1×', min: '0,2', note: 'Ujian tertulis. Materi: Analisis Algoritma sampai Binary Search Tree (Minggu 1–7).' },
      { name: 'UAS', weight: 30, freq: '1×', min: '0,2', note: 'Ujian tertulis. Materi: AVL sampai Hash Table (Minggu 10–15), tapi tetap butuh fondasi analisis kompleksitas dari awal semester.' },
      { name: 'Lab Kuis Pemrograman (KL)', weight: 20, freq: '4×', min: '0,3', note: '⭐ Dikerjakan saat sesi Lab terjadwal, problemnya mencakup beberapa topik. Penilaian: <b>30% dari grader (judgels) + 70% dari demo ke asisten</b>. Jadwal: Lab3, Lab5, Lab8, Lab10.' },
      { name: 'Lab Latihan (WS)', weight: 12, freq: '6×', min: '0,3', note: 'Diberi template, fokus ke implementasi satu algoritma. Enam kali: Lab1 Analisis Algoritma, Lab2 Rekursi, Lab4 Sorting, Lab6 AVL, Lab7 Binary Heap, Lab9 Graph.' },
      { name: 'Checkpoint (CP)', weight: 6, freq: '12×', min: '0,3', note: 'Mini quiz teori di SCeLE untuk memeriksa pemahaman. Dirilis setiap hari Kamis, deadline malam hari sebelum kuliah berikutnya.' },
      { name: 'Partisipasi / Kehadiran', weight: 2, freq: 'Sepanjang semester', note: 'Kehadiran > 75% → 2% penuh. Di bawah 50% → 0 DAN kehilangan hak atas nilai batas (dosen tidak boleh menaikkan nilai perbatasanmu).' },
    ],
    scale: [
      { g: 'A', min: 85 }, { g: 'A-', min: 80 }, { g: 'B+', min: 75 }, { g: 'B', min: 70 },
      { g: 'B-', min: 65 }, { g: 'C+', min: 60 }, { g: 'C', min: 55 }, { g: 'D', min: 45 }, { g: 'E', min: 0 },
    ],
    notes: [
      '⚠️ Ada <b>syarat skor minimum per komponen</b>. Kalau salah satu komponen di bawah minimalnya (Lab Kuis / Lab Latihan / Checkpoint 0,3, UTS/UAS 0,2 dalam skala 0–1), kamu <b>tidak memenuhi syarat lulus</b> berapapun total nilaimu.',
      '⭐ <b>Sesi Lab hari Jumat memegang 32% nilaimu</b>: 20% Lab Kuis + 12% Lab Latihan. Dari 10 sesi lab, empat di antaranya (Lab3, Lab5, Lab8, Lab10) adalah Lab Kuis yang dinilai berat.',
      'Nilai Lab Kuis = <b>30% grader (judgels) + 70% demo ke asisten</b>. Program yang lolos semua test case tapi tidak bisa kamu jelaskan hanya mengamankan sepertiga nilainya.',
      'Dosen boleh menambah maksimum <b>0,5 poin</b> di perbatasan nilai (mis. 84,7 → A) hanya jika kehadiran > 50% dan ada catatan partisipasi/attitude baik. Di perbatasan C–D (lulus atau tidak) tambahan maksimum <b>3 poin</b>, atau <b>5 poin</b> bila ada rekomendasi remedial dari Fakultas.',
      'Kalau berhalangan: <b>Lab Kuis punya sesi susulan (make-up)</b> yang dijadwalkan, sedangkan <b>Lab Latihan bisa di-<i>waive</i> maksimal 2 kali</b> dengan izin valid. Izinnya harus masuk <b>sebelum</b> kegiatan lab dimulai.',
      'Tidak ada UTS/UAS susulan kecuali sakit (surat dokter dengan pemeriksaan fisik, Halodoc ditolak), kedukaan keluarga inti, atau dispensasi resmi Fakultas/UI. Kabari dosen lewat email sebelum ujian dimulai dan serahkan suratnya ke sekretariat akademik.',
      'Plagiarisme pada bentuk evaluasi apa pun (lab, tugas, ujian) bisa bernilai nol atau E, dan berlaku untuk pemberi maupun penerima materi. Diskusi boleh, pengerjaan harus sendiri.',
      'Konversi huruf mengikuti standar Universitas Indonesia; tim dosen bisa menyesuaikan bila distribusi nilai tidak sebagaimana diharapkan.',
    ],
  },

  weeks: [
    { n: 1, title: 'Pengantar + Analisis Algoritma & Big-Oh', points: [
        'Selasa 25 Agu libur Maulid Nabi Muhammad',
        'Kamis 27 Agu: pengantar kuliah, konsep analisis algoritma, notasi Big-Oh' ],
      tasks: ['🧪 Lab0 (Jumat 28 Agu): Autograding Environment, I/O cases'] },
    { n: 2, title: 'Analisis Algoritma lanjut + ADT', points: [
        'Analisis untuk kasus geometrics, max subsequence, divide and conquer',
        'ADT: konsep ADT umum dan yang disediakan Java API',
        'LK mandiri: Analisis Algoritma Max Subsequence, Analisis Kasus Kebutuhan ADT' ],
      tasks: ['🧪 Lab1 (Jumat 4 Sep): Analisis Algoritma', 'CP01: Analisis Algoritma (1–7 Sep)'] },
    { n: 3, title: 'Rekursi: memoisasi, DP, tail recursion', points: [
        'Rekursi: masalah & manfaat, optimasi kompleksitas (memoisasi, DP)',
        'Tail recursion dan problem solving menggunakan rekursif',
        'LK mandiri: Memoisasi dan DP' ],
      tasks: ['🧪 Lab2 (Jumat 11 Sep): Rekursi', 'CP02: ADT (8–16 Sep)'] },
    { n: 4, title: 'Rekursi lanjut + Sorting dasar', points: [
        'Problem solving menggunakan rekursif, mendesain solusi rekursi yang efisien',
        'Sorting: Bubble Sort, Selection Sort, Insertion Sort, Shellsort' ],
      tasks: ['⚡ Lab3 (Jumat 18 Sep) · LAB KUIS 1', 'CP03: Rekursif (15–21 Sep)'] },
    { n: 5, title: 'Sorting lanjut + Linked List', points: [
        'Quicksort (beberapa varian partisi) dan Merge Sort',
        'Linked list: definisi, analisis, implementasi, insert, delete' ],
      tasks: ['🧪 Lab4 (Jumat 25 Sep): Sorting', 'CP04: Sorting (22–28 Sep)', '🎤 Demo Lab Kuis 1 (21 Sep – 1 Okt)'] },
    { n: 6, title: 'Linked List lanjut, Stack & Queue', points: [
        'Delete, searching, doubly linked list dan varian-varian linked list',
        'Implementasi Stack dan Queue dengan linked list' ],
      tasks: ['⚡ Lab5 (Jumat 2 Okt) · LAB KUIS 2', 'CP05: Linked List (29 Sep – 5 Okt)'] },
    { n: 7, title: 'Tree & Binary Search Tree', points: [
        'Struktur data hirarkis: definisi & varian Binary Tree, sifat, representasi, traversal',
        'Binary Search Tree: insert dan delete' ],
      tasks: ['🎤 Demo Lab Kuis 2 (5–11 Okt)', 'CP06: Tree, BST (5–11 Okt)', 'Asistensi Pra-UTS (Kamis 8 Okt)'] },
    { n: 8, title: 'UTS', points: ['Ujian Tengah Semester, 12 sampai 21 Oktober 2026'], tasks: [], flag: 'exam' },
    { n: 9, title: 'UTS (pekan kedua)', points: ['Lanjutan periode ujian sampai 21 Oktober 2026'], tasks: [], flag: 'exam' },
    { n: 10, title: 'AVL Tree: rebalancing', points: [
        'AVL Tree: rebalancing (rotasi) pada insert dan delete',
        'AVL Tree: analisis, implementasi, dan contoh-contoh soal',
        'LK mandiri: Operasi Dasar pada AVL Tree' ],
      tasks: ['🧪 Lab6 (Jumat 30 Okt): AVL', 'CP07: AVL (27 Okt – 2 Nov)'] },
    { n: 11, title: 'Binary Heap & Priority Queue', points: [
        'Binary Heap: konsep dan operasi percolate up / percolate down',
        'Priority Queue, Heapify, dan Heapsort' ],
      tasks: ['🧪 Lab7 (Jumat 6 Nov): Binary Heap', 'CP08: Binary Heap (3–9 Nov)'] },
    { n: 12, title: 'B+ Tree + Graph dasar', points: [
        'B+ Tree: tree sebagai struktur data eksternal, insert dan delete',
        'Graph: definisi, representasi, DFS' ],
      tasks: ['⚡ Lab8 (Jumat 13 Nov) · LAB KUIS 3', 'CP09: B+Tree (10–16 Nov)'] },
    { n: 13, title: 'Graph: BFS, Dijkstra, MST', points: [
        'Graph: BFS, Shortest Path Dijkstra',
        'Topological Sort, MST Prim, MST Kruskal' ],
      tasks: ['🧪 Lab9 (Jumat 20 Nov): Graph', 'CP10: Graph part 1 (17–23 Nov)', '🎤 Demo Lab Kuis 3 (16–26 Nov)'] },
    { n: 14, title: 'Union Disjoint Set + analisis Graph', points: [
        'Union Disjoint Set',
        'Graph: analisis kompleksitas',
        'LK mandiri: Algoritma Topo Sort dan MST' ],
      tasks: ['⚡ Lab10 (Jumat 27 Nov) · LAB KUIS 4', 'CP11: Graph part 2 (24–30 Nov)'] },
    { n: 15, title: 'Hash Table', points: [
        'Hash table: definisi dan varian-varian (closed hashing)',
        'Hash table: open hashing',
        'LK mandiri: Collision Handling dengan Closed Hashing' ],
      tasks: ['🎤 Demo Lab Kuis 4 (30 Nov – 9 Des)', 'CP12: Hashtable (1–9 Des)'] },
    { n: 16, title: 'Review, lalu UAS dimulai', points: [
        'Selasa 8 Des: review keseluruhan materi',
        'Asistensi Pra-UAS bersama asisten',
        'UAS dimulai 10 Desember 2026' ], tasks: [], flag: 'exam' },
    { n: 17, title: 'UAS (pekan kedua)', points: [
        'Lanjutan periode ujian sampai 19 Desember 2026',
        'Batas unggah nilai: 8 Januari 2027' ], tasks: [], flag: 'exam' },
  ],

  topics: [
    { id: 'sda-01', t: 'Analisis Algoritma & Notasi Big-Oh', w: 1, d: 2,
      sum: 'Cara mengukur "seberapa cepat" algoritma tanpa menjalankannya: model komputasi, running time, dan notasi asimtotik O, Ω, Θ.',
      keys: ['Definisi formal O, Ω, Θ (ada ∃c, n₀)', 'Kenapa konstanta & suku kecil dibuang', 'Cara menghitung kompleksitas loop bersarang', 'Beda best/average/worst case'],
      probes: ['Kenapa 3n² + 100n + 7 itu O(n²), dan apa arti persis dari "O" di situ?', 'Apa bedanya O(n) dan Θ(n)? Beri contoh algoritma yang O(n²) tapi bukan Θ(n²).', 'Kenapa kita peduli worst case, bukan average case?'] },

    { id: 'sda-02', t: 'Analisis Kasus Lanjut (max subsequence, divide & conquer)', w: 2, d: 3,
      sum: 'Menganalisis algoritma yang tidak sekadar loop: deret geometrik, rekurensi, dan empat versi maximum subsequence sum (O(n³) → O(n)).',
      why: 'Di sini kamu harus menurunkan rekurensi lalu menyelesaikannya, bukan sekadar melihat jumlah loop. Banyak orang hafal jawabannya tanpa bisa menurunkannya, dan soal UTS justru minta penurunan.',
      keys: ['Penjumlahan deret aritmetika & geometrik', 'Membentuk rekurensi T(n) dari kode', 'Menyelesaikan rekurensi (substitusi / recursion tree / Master Theorem)', '4 versi max subsequence sum dan kenapa kompleksitasnya turun'],
      probes: ['Turunkan kompleksitas keempat versi max subsequence sum. Trik apa yang membuat versi O(n) bisa jalan?', 'Kalau T(n) = 2T(n/2) + n, berapa T(n)? Tunjukkan penurunannya, bukan cuma jawabannya.', 'Kenapa ∑ 1/i ≈ ln n dan di algoritma apa itu muncul?'] },

    { id: 'sda-03', t: 'ADT (List, Stack, Queue, Generics, Collections, Iterator)', w: 2, d: 1,
      sum: 'Abstract Data Type: memisahkan "apa yang bisa dilakukan" dari "bagaimana diimplementasikan". Termasuk Java Collections Framework.',
      keys: ['Definisi ADT vs struktur data vs implementasi', 'Interface List/Set/Map di Java', 'Generics & type erasure', 'Iterator dan ConcurrentModificationException'],
      probes: ['Jelaskan beda ADT, struktur data, dan implementasi dengan satu contoh konkret (mis. Stack).', 'Kenapa ArrayList.get(i) O(1) tapi LinkedList.get(i) O(n)? Kapan kamu tetap pilih LinkedList?', 'Apa yang terjadi kalau kamu remove() elemen saat sedang for-each? Kenapa?'] },

    { id: 'sda-04', t: 'Rekursif: memoisasi, DP, tail recursion', w: 3, d: 3,
      sum: 'Rekursif sebagai alat problem solving + cara mengubah rekursif eksponensial jadi polinomial.',
      why: 'Ini gerbang pertama yang menjatuhkan banyak orang. Menulis rekursif itu mudah; merancang base case yang benar, membuktikan terminasi, dan mengubahnya ke DP itu skill yang beda. TP1 langsung menguji ini.',
      keys: ['Base case & recursive case yang lengkap (tidak ada kasus bocor)', 'Call stack & kenapa bisa StackOverflow', 'Memoisasi (top-down) vs DP tabulasi (bottom-up)', 'Tail recursion & kenapa Java tidak mengoptimasinya'],
      probes: ['Tulis rekursif Fibonacci naif, hitung kompleksitasnya, lalu jelaskan persis di mana memoisasi memotong pekerjaan.', 'Apa 3 syarat rekursif yang benar? Beri contoh rekursif yang "kelihatan benar" tapi infinite.', 'Ubah satu solusi rekursif ke iteratif menggunakan Stack eksplisit. Apa yang kamu simpan di stack itu?'] },

    { id: 'sda-05', t: 'Sorting Dasar: Bubble, Selection, Insertion, Shellsort', w: 4, d: 1,
      sum: 'Empat algoritma sorting O(n²)-ish, plus Shellsort yang memakai gap sequence.',
      keys: ['Invariant tiap algoritma (bagian mana yang sudah terurut)', 'Jumlah perbandingan vs jumlah swap', 'Stabilitas & in-place', 'Kenapa Insertion Sort cepat untuk data hampir terurut', 'Shellsort: gap sequence memengaruhi kompleksitas'],
      probes: ['Untuk array [5,1,4,2,8], tuliskan isi array setelah tiap pass Bubble dan Insertion Sort.', 'Algoritma mana yang stabil dan apa artinya "stabil" itu penting?', 'Kenapa Shellsort bisa lebih cepat dari Insertion Sort padahal dia "cuma" Insertion Sort dengan gap?'] },

    { id: 'sda-06', t: 'Sorting Lanjut: Quicksort & Merge Sort', w: 5, d: 2,
      sum: 'Dua algoritma divide-and-conquer O(n log n), beberapa varian skema partisi Quicksort, dan batas bawah comparison sort.',
      why: 'Partisi Quicksort punya banyak varian (Lomuto, Hoare, median-of-three) dan detail indeksnya gampang salah saat ditulis dari nol di ujian.',
      keys: ['Skema partisi & pemilihan pivot', 'Worst case Quicksort O(n²) dan kapan terjadi', 'Merge Sort butuh O(n) memori tambahan', 'Batas bawah Ω(n log n) untuk comparison sort'],
      probes: ['Tulis fungsi partition dari nol, lalu jalankan manual pada [7,2,9,4,1] dengan pivot terakhir.', 'Kapan Quicksort jadi O(n²)? Bagaimana median-of-three menguranginya, dan kenapa tidak menghilangkannya?', 'Kenapa Merge Sort stabil tapi Quicksort (versi biasa) tidak?'] },

    { id: 'sda-07', t: 'Linked List (single, doubly, circular)', w: 5, d: 2,
      sum: 'Struktur berbasis pointer: insert, delete, search, varian doubly & circular, penggunaan header/sentinel node.',
      why: 'Konsepnya sederhana tapi implementasinya penuh jebakan pointer: update urutan, kasus head/tail, node tunggal, dan list kosong.',
      keys: ['Urutan update pointer saat insert/delete (jangan sampai kehilangan referensi)', 'Kegunaan sentinel/header node', 'Doubly linked list: prev & next konsisten', 'Kenapa search tetap O(n) walau insert O(1)'],
      probes: ['Tulis kode delete node di tengah singly linked list. Kasus khusus apa saja yang harus ditangani?', 'Apa untungnya sentinel node? Tulis ulang insert-di-depan dengan dan tanpa sentinel.', 'Bagaimana mendeteksi cycle di linked list dalam O(1) memori?'] },

    { id: 'sda-08', t: 'Stack & Queue dengan Linked List', w: 6, d: 1,
      sum: 'Mengimplementasikan dua ADT klasik di atas linked list (dan array), plus circular queue.',
      keys: ['LIFO vs FIFO', 'Semua operasi harus O(1)', 'Circular queue & kondisi penuh/kosong', 'Aplikasi: parsing, backtracking, BFS'],
      probes: ['Kenapa push/pop stack pakai linked list selalu O(1), di ujung mana kamu operasikan dan kenapa?', 'Di circular array queue, bagaimana membedakan "penuh" dan "kosong" kalau front == rear?', 'Sebutkan satu masalah nyata yang jadi jauh lebih mudah dengan stack.'] },

    { id: 'sda-09', t: 'Binary Tree: sifat, representasi, traversal', w: 7, d: 2,
      sum: 'Terminologi tree, jenis binary tree (full, complete, perfect), representasi array vs pointer, dan traversal pre/in/post/level-order.',
      keys: ['Height vs depth vs level', 'Complete vs full vs perfect binary tree', 'Representasi array: anak dari i ada di 2i+1 & 2i+2', 'Empat traversal + implementasi iteratifnya'],
      probes: ['Gambar satu tree, lalu tuliskan hasil keempat traversal-nya.', 'Kalau diberi preorder + inorder, bagaimana merekonstruksi tree-nya? Kenapa preorder + postorder tidak cukup?', 'Kenapa binary heap bisa disimpan di array tapi BST biasa tidak efisien begitu?'] },

    { id: 'sda-10', t: 'Binary Search Tree: insert & delete', w: 7, d: 2,
      sum: 'BST property, operasi search/insert/delete, dan kenapa BST bisa "degenerate" jadi linked list.',
      why: 'Kasus delete node dengan dua anak (cari successor/predecessor) adalah soal favorit UTS dan sering salah karena orang tidak melacak parent pointer-nya.',
      keys: ['BST property (kiri < node < kanan) berlaku rekursif untuk seluruh subtree', 'Delete: 0 anak, 1 anak, 2 anak (successor in-order)', 'Inorder traversal BST menghasilkan urutan terurut', 'Worst case O(n) kalau input terurut'],
      probes: ['Hapus node dengan dua anak dari sebuah BST, tunjukkan langkah demi langkah pemilihan penggantinya.', 'Insert 1,2,3,4,5 berurutan ke BST kosong. Apa yang terjadi, dan kenapa ini memotivasi AVL?', 'Bagaimana mengecek apakah sebuah tree benar-benar BST? (Hati-hati, cek anak langsung saja tidak cukup.)'] },

    { id: 'sda-11', t: 'AVL Tree: rotasi & rebalancing', w: 10, d: 3,
      sum: 'BST yang menjaga balance factor ∈ {-1,0,1} lewat rotasi tunggal & ganda saat insert/delete.',
      why: '🚨 Topik paling banyak dikeluhkan. Insert cuma butuh 1 rotasi, tapi <b>delete bisa memicu rotasi berantai sampai ke akar</b>. Menentukan kasus LL/LR/RL/RR juga sering tertukar kalau kamu tidak punya aturan baku sendiri.',
      keys: ['Balance factor = height(kiri) − height(kanan)', 'Empat kasus: LL & RR → rotasi tunggal; LR & RL → rotasi ganda', 'Update height setelah rotasi (bottom-up)', 'Insert: maksimal 1 rotasi. Delete: bisa O(log n) rotasi', 'Tinggi AVL dijamin O(log n)'],
      probes: ['Insert 10,20,30,40,50,25 ke AVL kosong. Gambar tree setelah tiap rotasi dan sebutkan tipe kasusnya.', 'Kenapa delete bisa butuh banyak rotasi sementara insert hanya satu? Jelaskan lewat tinggi subtree.', 'Tulis pseudocode rotateLeft dan jelaskan pointer mana saja yang berpindah dan urutannya.'] },

    { id: 'sda-12', t: 'Binary Heap, Priority Queue, Heapsort', w: 11, d: 2,
      sum: 'Complete binary tree berbasis array dengan heap property; percolate up/down, buildHeap O(n), dan Heapsort in-place.',
      why: 'Yang tricky: membuktikan buildHeap itu O(n), bukan O(n log n), banyak yang salah menjawab ini.',
      keys: ['Heap property vs BST property (beda!)', 'percolateUp saat insert, percolateDown saat deleteMin', 'buildHeap bottom-up = O(n), bukan O(n log n)', 'Heapsort in-place dengan max-heap'],
      probes: ['Bangun min-heap dari [9,4,7,1,8,2] dengan buildHeap. Tunjukkan setiap percolateDown.', 'Buktikan kenapa buildHeap O(n), di mana letak deret yang konvergen itu?', 'Kenapa heap bukan struktur yang bagus untuk mencari elemen sembarang?'] },

    { id: 'sda-13', t: 'B+ Tree', w: 12, d: 3,
      sum: 'Tree berorde m untuk penyimpanan eksternal (disk): semua data di leaf, leaf terhubung sebagai linked list, insert dengan split, delete dengan borrow/merge.',
      why: '🚨 Aturannya banyak dan spesifik: berapa minimum key di internal node vs leaf, key mana yang naik saat split, kapan borrow dari sibling vs merge. Sedikit saja salah aturan, seluruh jawaban ujian ikut salah.',
      keys: ['Semua record ada di leaf; internal node hanya penunjuk arah', 'Orde m: internal node punya ⌈m/2⌉..m anak', 'Split leaf: key tengah di-COPY ke atas. Split internal: key tengah PINDAH ke atas', 'Delete: coba borrow dari sibling dulu, kalau tidak bisa baru merge', 'Motivasi: meminimalkan disk I/O (tinggi tree sangat pendek)'],
      probes: ['Insert 1..10 ke B+ Tree orde 4 satu per satu. Gambar tree setiap kali terjadi split.', 'Apa beda persis split di leaf dan split di internal node? Kenapa berbeda?', 'Kenapa B+ Tree lebih baik dari AVL untuk data di disk padahal keduanya O(log n)?'] },

    { id: 'sda-14', t: 'Graph: definisi, representasi, DFS', w: 12, d: 2,
      sum: 'Terminologi graph, adjacency matrix vs adjacency list, dan Depth-First Search beserta aplikasinya.',
      keys: ['Directed/undirected, weighted, degree, path, cycle, connected component', 'Adjacency matrix O(V²) memori vs adjacency list O(V+E)', 'DFS rekursif & iteratif dengan stack', 'DFS tree, back edge, deteksi cycle'],
      probes: ['Kapan adjacency matrix lebih baik dari adjacency list? Beri kondisi konkret pada V dan E.', 'Jalankan DFS pada satu graph dan catat urutan kunjungan + discovery/finish time.', 'Bagaimana DFS mendeteksi cycle di graph berarah? Apa itu back edge?'] },

    { id: 'sda-15', t: 'Graph: BFS & Dijkstra', w: 13, d: 3,
      sum: 'Traversal level-by-level dengan queue, shortest path pada unweighted graph, dan Dijkstra untuk bobot non-negatif.',
      why: 'Dijkstra sering "dihafal" tanpa paham kenapa dia benar. Pertanyaan "kenapa Dijkstra gagal untuk bobot negatif" hampir selalu muncul dan jawabannya butuh argumen greedy, bukan hafalan.',
      keys: ['BFS memberi shortest path hanya jika semua bobot sama', 'Dijkstra = greedy + priority queue, finalisasi node terdekat', 'Relaxation: if d[u]+w < d[v] then update', 'Gagal untuk bobot negatif, karena node yang sudah difinalisasi tidak pernah ditinjau ulang', 'Kompleksitas O((V+E) log V) dengan binary heap'],
      probes: ['Jalankan Dijkstra pada satu graph dan tulis tabel jarak setelah setiap iterasi.', 'Beri contoh graph berbobot negatif di mana Dijkstra memberi jawaban salah. Tunjukkan langkahnya.', 'Kenapa Dijkstra pakai priority queue? Berapa kompleksitasnya kalau pakai array biasa?'] },

    { id: 'sda-16', t: 'Graph: Topological Sort, MST Prim & Kruskal', w: 13, d: 3,
      sum: 'Pengurutan DAG, dan dua algoritma greedy untuk Minimum Spanning Tree.',
      why: 'Prim dan Kruskal mudah tertukar, dan Kruskal butuh Union-Find (Disjoint Set) yang sendirinya adalah struktur data baru dengan path compression.',
      keys: ['Topological sort hanya ada pada DAG; algoritma Kahn (in-degree) vs DFS finish time', 'Prim: tumbuh dari satu node, mirip Dijkstra', 'Kruskal: urutkan semua edge, pakai Union-Find untuk hindari cycle', 'Union-Find: union by rank + path compression', 'Kapan pilih Prim (graph padat) vs Kruskal (graph jarang)'],
      probes: ['Jalankan Kruskal pada satu graph dan tunjukkan state Union-Find setelah tiap edge diterima/ditolak.', 'Apa beda mendasar cara Prim dan Kruskal "tumbuh"? Kenapa keduanya tetap menghasilkan MST yang sama bobotnya?', 'Tulis pseudocode find() dengan path compression dan jelaskan efeknya pada kompleksitas.'] },

    { id: 'sda-17', t: 'Analisis Kompleksitas Graph', w: 14, d: 3,
      sum: 'Menurunkan kompleksitas semua algoritma graph berdasarkan representasi dan struktur data pendukungnya.',
      why: 'Jawabannya berubah tergantung representasi (matrix/list) dan priority queue yang dipakai. Menghafal satu angka saja pasti kena jebakan di ujian.',
      keys: ['DFS/BFS: O(V+E) dengan adjacency list, O(V²) dengan matrix', 'Dijkstra: O(V²) array vs O((V+E) log V) binary heap', 'Prim: sama polanya dengan Dijkstra', 'Kruskal: O(E log E) didominasi sorting'],
      probes: ['Buat tabel kompleksitas semua algoritma graph × dua representasi. Turunkan, jangan hafal.', 'Untuk graph dengan V=1000 dan E=1.000.000, mana yang lebih cepat: Dijkstra array atau heap? Hitung.', 'Kenapa kompleksitas Kruskal ditulis O(E log E) dan bukan O(E log V)? (Petunjuk: keduanya sebenarnya setara, kenapa?)'] },

    { id: 'sda-19', t: 'Union Disjoint Set', w: 14, d: 2,
      sum: 'Struktur data untuk melacak partisi himpunan: operasi find dan union, dengan union by rank/size dan path compression.',
      why: 'Topik yang jarang muncul di slide utama tapi jadi tulang punggung MST Kruskal, dan analisis kompleksitasnya (inverse Ackermann) unik dibanding topik lain.',
      keys: ['Representasi forest: parent array, akar sebagai wakil himpunan', 'find dengan path compression', 'union by rank vs union by size', 'Kompleksitas amortized O(α(n)), praktis konstan', 'Perannya di dalam Kruskal untuk mendeteksi cycle'],
      probes: ['Implementasikan find dan union dengan path compression + union by rank, lalu jalankan pada 8 elemen dan gambar forest-nya di tiap langkah.', 'Kenapa Kruskal butuh disjoint set? Apa yang terjadi kalau kamu memakai BFS untuk cek cycle di tiap langkah?', 'Apa arti α(n) pada kompleksitas union-find, dan kenapa untuk semua n yang masuk akal nilainya ≤ 4?'] },

    { id: 'sda-18', t: 'Hash Table: closed hashing & open addressing', w: 15, d: 3,
      sum: 'Fungsi hash, penanganan collision dengan chaining (closed hashing) dan open addressing (linear/quadratic probing, double hashing), load factor, rehashing.',
      why: '🚨 Istilahnya membingungkan (closed hashing vs open addressing vs open hashing), dan <b>delete pada open addressing butuh lazy deletion / tombstone</b>, kalau langsung dihapus, pencarian jadi rusak. Ini jebakan klasik UAS.',
      keys: ['Sifat fungsi hash yang baik (uniform, deterministic, cepat)', 'Separate chaining vs open addressing', 'Linear probing → primary clustering; quadratic probing → secondary clustering', 'Double hashing & syarat ukuran tabel prima', 'Load factor λ dan kapan rehash', 'Lazy deletion / tombstone pada open addressing'],
      probes: ['Masukkan 5 key ke tabel ukuran 7 dengan linear probing lalu dengan quadratic probing. Bandingkan jumlah probe.', 'Kenapa menghapus elemen langsung (tanpa tombstone) di open addressing merusak pencarian? Beri contoh konkret.', 'Berapa load factor maksimum yang masuk akal untuk chaining vs open addressing, dan kenapa berbeda?'] },
  ],

  traps: [
    '🚨 <b>Empat komponen punya syarat skor minimum.</b> Lab Kuis, Lab Latihan, dan Checkpoint minimal 0,3; UTS dan UAS minimal 0,2 (skala 0–1). Satu komponen di bawah batas = tidak lulus, berapapun total nilaimu.',
    '🚨 Menyiapkan Lab Kuis seperti Lab Latihan biasa. <b>Empat Lab Kuis bernilai 20%</b> dan problemnya mencakup beberapa topik sekaligus, bukan satu algoritma seperti Lab Latihan.',
    'Mengejar lolos grader saja pada Lab Kuis. Grader cuma <b>30%</b>, sisanya <b>70% demo ke asisten</b>. Kalau kamu tidak bisa menjelaskan kodemu sendiri, dua pertiga nilainya hilang.',
    'Melewatkan periode demo Lab Kuis. Demonya punya jendela waktu sendiri (mis. 21 Sep – 1 Okt untuk Lab Kuis 1) yang terpisah dari hari labnya. Catat kedua tanggal itu.',
    'Skip Checkpoint karena "cuma 6%". Ada 12 kali, tanpa jatah gugur, dan CP punya syarat minimum 0,3 untuk lulus.',
    'Menganggap izin bisa diurus belakangan. <b>Izin harus masuk sebelum kegiatan lab dimulai.</b> Lab Latihan bisa di-waive maksimal 2 kali; Lab Kuis dapat sesi susulan, tapi tetap harus lewat izin yang valid.',
    'Belajar AVL & B+ Tree hanya dari slide. Kedua topik ini <b>harus</b> kamu latih dengan menggambar tangan puluhan kali sampai otomatis.',
    'Menghafal kompleksitas tanpa bisa menurunkan. Soal UTS/UAS SDA suka minta penurunan rekurensi, bukan angkanya.',
    'Membiarkan kehadiran turun di bawah 50%. Bukan cuma kehilangan 2%, tapi juga <b>hak atas nilai batas</b>, artinya dosen tidak boleh lagi menaikkan nilaimu di perbatasan C–D.',
  ],

  strategy: [
    { t: '1. Jadikan Checkpoint sebagai jadwal belajarmu', d: 'CP rilis tiap Kamis dan deadline malam sebelum kuliah berikutnya. Artinya kurikulum ini sudah memaksa kamu review mingguan, <b>ikuti ritmenya, jangan lawan</b>. Kerjakan CP tanpa membuka slide dulu; kalau macet baru buka. Bagian yang bikin macet itulah bahan belajarmu minggu itu.' },
    { t: '2. Pisahkan persiapan Lab Kuis dari Lab Latihan', d: 'Lab3, Lab5, Lab8, dan Lab10 adalah <b>Lab Kuis</b>: 20% nilai, multi-topik, tanpa template. Lab Latihan lain memberimu kerangka dan fokus satu algoritma. Seminggu sebelum tiap Lab Kuis, kerjakan ulang seluruh algoritma blok topik itu dari file kosong dengan timer, bukan sekadar membaca template lama.' },
    { t: '3. Latih demo, bukan cuma kode', d: 'Tujuh puluh persen nilai Lab Kuis datang dari <b>demo ke asisten</b>. Setelah solusimu jalan, tutup layar dan jelaskan keras-keras: kenapa struktur data ini, di mana kompleksitasnya, apa yang terjadi pada edge case. Kalau macet menjelaskan, kamu belum siap demo meski kodenya hijau.' },
    { t: '4. Aturan "gambar tangan" untuk semua struktur tree', d: 'Untuk BST, AVL, Binary Heap, dan B+ Tree: sediakan buku tulis khusus. Setiap struktur, kerjakan minimal 10 kasus insert dan 10 kasus delete <b>dengan tangan</b> sebelum menyentuh kode. Ujian SDA menuntut kamu menggambar hasil operasi, bukan menjelaskan konsepnya.' },
    { t: '5. Implementasikan ulang dari nol, bukan copy template', d: 'Lab Latihan memberimu template. Setelah lab selesai dan dinilai, <b>tulis ulang algoritma itu dari file kosong</b> tanpa melihat. Waktu 20 menit. Ini satu-satunya cara memastikan kamu benar-benar bisa, bukan cuma mengisi titik-titik, dan ini persis kondisi Lab Kuis.' },
    { t: '6. Kuasai penurunan kompleksitas, bukan tabelnya', d: 'Buat satu lembar berisi: deret aritmetika, deret geometrik, ∑1/i ≈ ln n, dan Master Theorem. Latih menurunkan T(n) dari kode mentah. Materi Minggu 1–2 ini muncul lagi di analisis Graph (Minggu 14), investasi di awal terbayar dua kali.' },
    { t: '7. Kerjakan Lembar Kerja mandiri, jangan dilewat', d: 'Hampir setiap sesi Kamis punya LK mandiri (Max Subsequence, Memoisasi & DP, varian Linked List, operasi AVL, Collision Handling, dsb). LK tidak dinilai langsung, tapi isinya persis pola soal Checkpoint dan ujian. Anggap sebagai bank soal gratis yang sudah dikurasi dosen.' },
    { t: '8. Pakai visualizer setiap kali bingung', d: 'VisuAlgo dan USFCA visualization membuat AVL rotation dan B+ Tree split terlihat jelas dalam 5 menit, sesuatu yang bisa memakan 2 jam kalau hanya membaca slide. Jalankan operasinya di visualizer, prediksi hasilnya <b>sebelum</b> klik, lalu cek.' },
    { t: '9. Ambil 2% partisipasi + potensi 0,5 bonus perbatasan', d: 'Kehadiran > 75% memberi 2% penuh. Lebih penting: dosen boleh menambah hingga 0,5 poin di perbatasan nilai untuk mahasiswa yang aktif, dan hingga 3 poin di perbatasan C–D. Selisih 84,6 dan 85,0 adalah selisih A- dan A. <b>Duduk di depan, tanya minimal sekali per dua minggu.</b>' },
    { t: '10. Latihan soal eksternal setelah tiap topik', d: 'Setelah topik selesai, kerjakan 3–5 soal LeetCode/Kattis pada topik itu. Linked List → reverse list, detect cycle. Tree → validate BST, LCA. Graph → number of islands, course schedule. Union-Find → redundant connection. Ini melatih kecepatan yang kamu butuhkan saat Lab Kuis.' },
  ],

  resources: [
    { type: 'tool', t: 'VisuAlgo, visualisasi struktur data & algoritma', url: 'https://visualgo.net/en', note: '⭐ Wajib. AVL, B+ Tree, Heap, Graph, semua bisa dijalankan langkah demi langkah. Ada mode kuis juga.' },
    { type: 'tool', t: 'USFCA Data Structure Visualizations', url: 'https://www.cs.usfca.edu/~galles/visualization/Algorithms.html', note: 'Lebih sederhana dari VisuAlgo tapi paling bagus untuk B+ Tree dan AVL rotation.' },
    { type: 'yt', t: 'Abdul Bari, Algorithms', url: 'https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O', note: '⭐ Penjelasan analisis kompleksitas, rekurensi, sorting, dan graph paling jernih di YouTube. Cocok untuk materi Minggu 1–2.' },
    { type: 'yt', t: 'William Fiset, Data Structures', url: 'https://www.youtube.com/playlist?list=PLDV1Zeh2NRsB6SWUrDFW2RmDotAfPbeHu', note: '⭐ Fokus implementasi (Java). Bagian AVL Tree dan Union-Find di sini sangat kuat.' },
    { type: 'yt', t: 'MIT 6.006 Introduction to Algorithms', url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/', note: 'Kalau ingin fondasi teori yang benar-benar rapi (analisis, hashing, graph). Pilih lecture sesuai topik, tidak perlu semua.' },
    { type: 'yt', t: 'NeetCode, pola pemecahan masalah', url: 'https://neetcode.io/roadmap', note: 'Roadmap terstruktur per struktur data. Bagus untuk latihan TP dan membangun kecepatan coding.' },
    { type: 'web', t: 'CP-Algorithms', url: 'https://cp-algorithms.com/', note: 'Referensi presisi untuk Dijkstra, MST, Union-Find, dan analisisnya. Bahasanya teknis tapi akurat.' },
    { type: 'web', t: 'GeeksforGeeks, B+ Tree Introduction', url: 'https://www.geeksforgeeks.org/introduction-of-b-tree/', note: 'Untuk aturan detail insert/delete B+ Tree yang sering tidak lengkap di slide.' },
    { type: 'web', t: 'Big-O Cheat Sheet', url: 'https://www.bigocheatsheet.com/', note: 'Untuk verifikasi cepat. Tapi ingat, kamu harus bisa menurunkannya, bukan menghafal tabel ini.' },
    { type: 'tool', t: 'LeetCode', url: 'https://leetcode.com/studyplan/top-interview-150/', note: 'Latihan implementasi. Filter by topic: Linked List, Tree, Heap, Graph, Hash Table.' },
    { type: 'book', t: 'Weiss, Data Structures and Problem Solving using Java', by: '', url: '', note: 'Buku acuan resmi kuliah. Baca bab yang sesuai SEBELUM kelas, bukan sesudah.' },
  ],
};

export default sda;
