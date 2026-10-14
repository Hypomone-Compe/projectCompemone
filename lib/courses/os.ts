/* ==========================================================================
   Sistem Operasi (OS), Kelas B, Gasal 2026/2027
   Sumber: Rencana Pengajaran OS Gasal 2026/2027.xlsx (CSCM602055)
   ========================================================================== */
import type { CourseContent } from '../types';

const os: CourseContent = {
  meta: [
    { k: 'Kelas', v: 'Sistem Operasi B · Semester 3 · 4 SKS' },
    { k: 'Dosen', v: 'Muhammad Mishbah, S.Kom., M.Kom. (pengampu Kelas B sepanjang semester)' },
    { k: 'Jadwal kuliah', v: 'Senin 10.00–11.40 di A1.09 · Rabu 10.00–11.40 di A1.09 (Ged Baru)' },
    { k: 'Koordinator asdos', v: 'Zita Nayra Ardini · Erik Wilbert, Jaysen Lestari, Rehema Zurafa Saputra, Felesia Junelus, Keisha Vania Laurent' },
    { k: 'Hardware', v: 'Laptop dengan Linux atau Windows. ⚠️ Laptop Apple TIDAK disarankan, alternatifnya pakai VM di cloud.' },
    { k: 'Software', v: 'Linux di VirtualBox/VMware. Reference VM image disediakan asdos.' },
  ],

  books: [
    { t: 'Operating System Concepts, 10th Edition (2018)', by: 'Silberschatz, Galvin, Gagne · buku utama, semua nomor bab di rencana mingguan merujuk ke sini' },
    { t: 'Operating Systems: Three Easy Pieces (OSTEP), 2023', by: 'Arpaci-Dusseau · GRATIS online, jauh lebih enak dibaca untuk virtual memory & konkurensi' },
  ],

  grading: {
    total: '100% (+ bonus keaktifan 2%)',
    components: [
      { name: 'Tugas', weight: 36, freq: '4× (9% masing-masing)', note: '⭐ Komponen terbesar. Semuanya <b>coding full + demo</b>. Tugas 1 dikerjakan <b>berkelompok 4 orang</b> dengan peer review, video presentasi, dan sesi demo tanya jawab bersama asisten dosen. Topik: (1) Scripting and OS System Calls using C, (2) Processes and Scheduling, (3) Filesystem and Memory, (4) I/O Programming.' },
      { name: 'UTS', weight: 25, freq: '1×', note: 'Online lewat SCeLE. Menguji teori, analitik, konsep, dan hitungan. Materi: Introduction sampai CPU Scheduling (Minggu 1–7).' },
      { name: 'UAS', weight: 25, freq: '1×', note: 'Online lewat SCeLE. Menguji teori, analitik, konsep, dan hitungan. Materi: Main Memory sampai Network & Distributed System (Minggu 8–12).' },
      { name: 'Kuis', weight: 10, freq: '4×', note: 'Diselenggarakan per kelas, sekitar sebulan sekali. Menurut rencana pengajaran jatuh di Minggu 4, 7, 10, dan 12, berbarengan dengan rilis tiap Tugas.' },
      { name: 'Kehadiran', weight: 4, freq: 'Sepanjang semester', note: '⚠️ Berlaku ambang: hadir minimal <b>75%</b> untuk mendapat nilainya. Di bawah itu komponen ini bernilai <b>0</b>, bukan proporsional.' },
      { name: 'Keaktifan (bonus)', weight: 2, freq: 'Sepanjang semester', note: 'Bonus di luar total 100%. Praktis ini satu-satunya cara menambal nilai di matkul ini, dan hanya perlu bicara di kelas.' },
    ],
    scale: [
      { g: 'A', min: 85 }, { g: 'A-', min: 80 }, { g: 'B+', min: 75 }, { g: 'B', min: 70 },
      { g: 'B-', min: 65 }, { g: 'C+', min: 60 }, { g: 'C', min: 55 }, { g: 'D', min: 45 }, { g: 'E', min: 0 },
    ],
    notes: [
      '⭐ <b>Tugas adalah komponen terbesar (36%), lebih besar dari UTS maupun UAS.</b> Empat kali, masing-masing 9%, semuanya coding penuh plus demo. Ini bukan lagi matkul yang bisa dimenangkan lewat ujian saja.',
      '👥 <b>Tugas 1 dikerjakan berkelompok 4 orang</b>, lengkap dengan peer review, video presentasi, dan demo tanya jawab ke asisten dosen. Cari kelompok sejak pekan pertama, jangan tunggu tugasnya rilis.',
      '⚠️ <b>Kehadiran bersifat ambang, bukan proporsional.</b> Hadir 75% ke atas → 4% penuh. Di bawah 75% → <b>0</b>. Tidak ada nilai tengah, jadi hadir 70% sama saja dengan tidak pernah datang untuk komponen ini.',
      '💡 <b>Bonus keaktifan 2% berada di luar total 100%.</b> Nilai akhir bisa melewati 100, dan 2 poin ini setara selisih satu tingkat huruf di perbatasan. Ini nilai paling murah yang bisa kamu ambil.',
      'UTS dan UAS dikerjakan <b>online lewat SCeLE</b> dan menguji teori, analitik, konsep, serta hitungan — bukan hanya menulis kode. Soal hitungan (page fault, Gantt chart, disk head movement, translasi alamat) tetap perlu dilatih terpisah.',
      'Empat kuis dan empat tugas rilis di pekan yang sama (Minggu 4, 7, 10, 12). Pekan-pekan itu adalah beban puncak semester ini; tandai sekarang di kalendermu.',
      'Konversi huruf mengikuti standar Universitas Indonesia (acuan umum, konfirmasi ke dosen bila ada penyesuaian kelas).',
    ],
  },

  weeks: [
    { n: 1, label: 'Minggu 1', title: 'Introduction & Operating System Structure', points: [
        'Peran, struktur, dan layanan sistem operasi',
        'System call, mode kernel vs user, struktur kernel',
        'Silberschatz (10th) Bab 1 dan 2' ],
      tasks: ['📌 Setup VM Linux pekan ini juga, jangan ditunda'] },
    { n: 2, label: 'Minggu 2', title: 'Virtualization, Shell Script & C Language', points: [
        'Virtualisasi: hypervisor tipe 1 vs 2, VM vs container',
        'Shell scripting dan pengantar bahasa C',
        'Silberschatz (10th) Bab 18 + sumber Internet' ], tasks: [] },
    { n: 3, label: 'Minggu 3', title: 'C Language & Processes', points: [
        'Pointer, malloc/free, struct, dan error handling di C',
        'Proses: PCB, context switch, fork/exec, IPC',
        'Silberschatz (10th) Bab 3 + sumber Internet' ], tasks: [] },
    { n: 4, label: 'Minggu 4', title: 'Thread & Synchronization', points: [
        'Thread dan concurrency, multithreading model',
        'Pengantar sinkronisasi dan critical section',
        'Silberschatz (10th) Bab 4' ],
      tasks: ['📝 Kuis 1', '🔥 Tugas 1 · Scripting and OS System Calls using C (kelompok 4 orang)'] },
    { n: 5, label: 'Minggu 5', title: 'Synchronization & Deadlock', points: [
        'Mutex, semaphore, monitor, dan problem klasik sinkronisasi',
        'Deadlock: kondisi, pencegahan, penghindaran, deteksi',
        'Silberschatz (10th) Bab 6 dan 7' ], tasks: [] },
    { n: 6, label: 'Minggu 6', title: 'CPU Scheduling', points: [
        'FCFS, SJF, Priority, Round Robin, Multilevel Queue',
        'Kriteria penjadwalan dan perhitungan waiting/turnaround time',
        'Silberschatz (10th) Bab 5' ], tasks: [] },
    { n: 7, label: 'Minggu 7', title: 'Guest Lecture (opsional) + Review pra-UTS', points: [
        'Senin 5 Okt: guest lecture, sifatnya opsional',
        'Rabu 7 Okt: review seluruh materi paruh pertama' ],
      tasks: ['📝 Kuis 2', '🔥 Tugas 2 · Processes and Scheduling'] },
    { n: 8, label: 'UTS', title: 'UTS', points: [
        'Ujian Tengah Semester, 12 sampai 21 Oktober 2026',
        'Online lewat SCeLE: teori, analitik, konsep, hitungan' ], tasks: [], flag: 'exam' },
    { n: 9, label: 'UTS', title: 'UTS (pekan kedua)', points: [
        'Lanjutan periode ujian sampai 21 Oktober 2026' ], tasks: [], flag: 'exam' },
    { n: 10, label: 'Minggu 8', title: 'Main Memory', points: [
        'Address binding, swapping, alokasi memori berdampingan',
        'Paging, segmentation, dan struktur page table',
        'Silberschatz (10th) Bab 9' ], tasks: [] },
    { n: 11, label: 'Minggu 9', title: 'Virtual Memory', points: [
        'Demand paging, page fault, page replacement',
        'Thrashing dan working set model',
        'Silberschatz (10th) Bab 10' ], tasks: [] },
    { n: 12, label: 'Minggu 10', title: 'Mass Storage Systems & Input/Output (I/O)', points: [
        'Struktur mass storage, disk scheduling, RAID',
        'I/O system: polling, interrupt, DMA, device driver',
        'Silberschatz (10th) Bab 11 dan 12' ],
      tasks: ['📝 Kuis 3', '🔥 Tugas 3 · Filesystem and Memory'] },
    { n: 13, label: 'Minggu 11', title: 'File System', points: [
        'File-system interface, implementasi, dan internals',
        'Silberschatz (10th) Bab 13, 14, dan 15' ], tasks: [] },
    { n: 14, label: 'Minggu 12', title: 'Security & Protection + Network & Distributed System', points: [
        'Senin 23 Nov: keamanan dan proteksi sistem (Bab 16 dan 17)',
        'Rabu 25 Nov: network dan distributed system (Bab 19)' ],
      tasks: ['📝 Kuis 4', '🔥 Tugas 4 · I/O Programming'] },
    { n: 15, label: 'Minggu 13', title: 'Review', points: [
        'Dua sesi penuh review seluruh materi paruh kedua' ], tasks: [] },
    { n: 16, label: 'Minggu 14', title: 'Pekan terakhir, lalu UAS dimulai', points: [
        'Sesi 7 dan 9 Desember menutup perkuliahan',
        'UAS dimulai 10 Desember 2026, online lewat SCeLE' ], tasks: [], flag: 'exam' },
    { n: 17, label: 'UAS', title: 'UAS (pekan kedua)', points: [
        'Lanjutan periode ujian sampai 19 Desember 2026' ], tasks: [], flag: 'exam' },
  ],

  topics: [
    { id: 'os-01', t: 'Overview OS: struktur, system call, dual mode', w: 1, wl: 'Minggu 1', d: 1,
      sum: 'Apa yang sebenarnya dikerjakan OS: manajemen resource, abstraksi hardware, system call sebagai gerbang user→kernel.',
      keys: ['Kernel mode vs user mode dan kenapa dipisah', 'System call vs library call vs fungsi biasa', 'Interrupt, trap, dan exception', 'Struktur OS: monolithic, layered, microkernel, modular'],
      probes: ['Apa yang terjadi persis (langkah demi langkah) saat program memanggil read()? Di titik mana CPU pindah ke kernel mode?', 'Kenapa printf() bukan system call tapi write() iya? Apa hubungan keduanya?', 'Apa untung-rugi microkernel dibanding monolithic kernel?'] },

    { id: 'os-02', t: 'Virtualization & Shell Scripting', w: 2, wl: 'Minggu 2', d: 2,
      sum: 'Virtual machine, hypervisor tipe 1 vs 2, container, plus keterampilan shell scripting (bash) yang dipakai di seluruh mata kuliah ini.',
      why: 'Shell scripting jarang diajarkan formal tapi dipakai di semua PT. Kalau pipe, redirection, dan exit code belum otomatis buatmu, setiap PT akan terasa dua kali lebih lama.',
      keys: ['Hypervisor tipe 1 (bare metal) vs tipe 2 (hosted)', 'VM vs container, apa yang di-share', 'Bash: variabel, kondisi, loop, function', 'Pipe, redirection (>, >>, 2>&1), exit code $?', 'grep, sed, awk, find, xargs'],
      probes: ['Jelaskan beda VM dan container dari sisi apa yang mereka virtualisasi. Kenapa container jauh lebih ringan?', 'Tulis script bash yang mencari semua file .log > 1MB dan mengarsipkannya. Jelaskan tiap bagiannya.', 'Apa arti `cmd 2>&1 | tee out.txt` dan kenapa urutan `2>&1` penting?'] },

    { id: 'os-14', t: 'Network & Distributed System', w: 14, wl: 'Minggu 12', d: 2,
      sum: 'Sistem operasi yang tersebar di banyak mesin: struktur jaringan, protokol komunikasi, dan masalah khas terdistribusi seperti penamaan, konsistensi, serta kegagalan parsial.',
      why: 'Materi paling akhir sebelum review, jadi paling rawan dipelajari terburu-buru. Padahal soal konseptualnya (kegagalan parsial, transparansi, konsistensi) sangat cocok jadi soal analitik UAS.',
      keys: ['Silberschatz Bab 19', 'Struktur jaringan: LAN vs WAN, topologi', 'Stack protokol dan bagaimana OS mengeksposnya lewat socket', 'Distributed file system dan masalah penamaan', 'Kegagalan parsial: kenapa jaringan membuat error handling jauh lebih sulit', 'Transparansi (akses, lokasi, replikasi) sebagai tujuan desain'],
      probes: ['Kenapa memanggil fungsi di mesin lain (RPC) tidak bisa diperlakukan sama dengan memanggil fungsi lokal? Sebutkan tiga mode kegagalan yang hanya muncul di jaringan.', 'Apa yang OS sediakan lewat socket, dan di titik mana abstraksi itu bocor?', 'Sebutkan bentuk-bentuk transparansi pada sistem terdistribusi, lalu beri contoh satu yang sulit dicapai bersamaan dengan performa.'] },

    { id: 'os-03', t: 'Security, Protection & Privacy', w: 14, wl: 'Minggu 12', d: 2,
      sum: 'Model proteksi (domain, access matrix), prinsip least privilege, autentikasi, dan ancaman keamanan tingkat sistem.',
      keys: ['Protection ≠ security (proteksi = mekanisme internal, security = ancaman eksternal)', 'Access matrix, ACL vs capability list', 'Principle of least privilege', 'Permission Unix (rwx, setuid, umask)', 'Buffer overflow & mengapa terjadi'],
      probes: ['Jelaskan arti permission `-rwsr-xr-x` dan kenapa bit setuid berbahaya.', 'Apa beda ACL dan capability list? Mana yang dipakai Unix dan kenapa?', 'Bagaimana buffer overflow bisa mengambil alih eksekusi program? Kaitkan dengan stack layout.'] },

    { id: 'os-04', t: 'Bahasa C untuk pemrograman sistem', w: 3, wl: 'Minggu 3', d: 3,
      sum: 'C sebagai bahasa antarmuka ke kernel: pointer, manajemen memori manual, struct, string, dan pemanggilan system call.',
      why: '🚨 Ini penghalang teknis terbesar buat mahasiswa yang datang dari Java/Python. Tidak ada garbage collector, tidak ada bounds checking, satu pointer salah dan program segfault tanpa pesan yang membantu. Semua PT ditulis dalam C.',
      keys: ['Pointer, pointer aritmetika, pointer ke pointer', 'malloc/free, memory leak, dangling pointer, double free', 'Array vs pointer (dan kapan mereka BUKAN hal yang sama)', 'String di C = char array + null terminator', 'errno, perror, dan pengecekan return value system call', 'Kompilasi: gcc, header, linking, Makefile'],
      probes: ['Apa beda `char *s = "hi"` dan `char s[] = "hi"`? Mana yang boleh dimodifikasi dan kenapa?', 'Tulis fungsi yang mengalokasikan array dinamis lalu membebaskannya. Di mana potensi memory leak-nya?', 'Kenapa setiap panggilan system call di C harus dicek return value-nya? Tunjukkan pola idiomatiknya dengan errno.'] },

    { id: 'os-05', t: 'File System: interface & implementasi', w: 13, wl: 'Minggu 11', d: 2,
      sum: 'Konsep file, direktori, mounting, alokasi blok (contiguous/linked/indexed), inode, free space management, dan journaling.',
      keys: ['inode: apa yang disimpan di dalamnya (dan apa yang TIDAK, nama file!)', 'Hard link vs symbolic link', 'Alokasi: contiguous vs linked vs indexed', 'Direct, single/double/triple indirect block', 'Journaling & konsistensi setelah crash'],
      probes: ['Kalau kamu `rm` sebuah file yang punya 2 hard link, apa yang terjadi pada inode-nya? Jelaskan lewat link count.', 'Kenapa nama file disimpan di direktori, bukan di inode? Apa konsekuensinya?', 'Hitung ukuran file maksimum jika inode punya 12 direct + 1 single + 1 double indirect, block 4KB, pointer 4 byte.'] },

    { id: 'os-07', t: 'Addressing, Shared Library & Pointer', w: 10, wl: 'Minggu 8', d: 3,
      sum: 'Bagaimana alamat program diterjemahkan ke alamat fisik: address binding, MMU, base & limit register, paging, segmentation, serta static vs dynamic linking.',
      why: '🚨 Konsep alamat logis vs fisik vs virtual sering tercampur. Ditambah translasi paging (nomor halaman + offset) yang butuh perhitungan bit, sering muncul di ujian dalam bentuk soal hitungan.',
      keys: ['Compile time vs load time vs execution time binding', 'Logical/virtual address vs physical address; peran MMU', 'Paging: membagi alamat jadi (page number, offset), berapa bit masing-masing', 'Page table, TLB, dan kenapa TLB hit ratio penting', 'Internal fragmentation (paging) vs external fragmentation (segmentation)', 'Static vs dynamic linking, PIC, dan .so'],
      probes: ['Untuk alamat virtual 32-bit dengan page size 4KB, berapa bit untuk offset dan berapa untuk page number? Turunkan.', 'Hitung effective access time jika TLB hit ratio 90%, akses TLB 10ns, akses memori 100ns.', 'Apa keuntungan shared library dibanding static linking, dan apa harga yang dibayar?'] },

    { id: 'os-08', t: 'Virtual Memory: demand paging & page replacement', w: 11, wl: 'Minggu 9', d: 3,
      sum: 'Menjalankan program lebih besar dari RAM: page fault, demand paging, algoritma penggantian halaman (FIFO, Optimal, LRU, Clock), thrashing, dan working set.',
      why: '🚨 Materi ujian favorit karena bisa dibuat soal hitungan: hitung page fault untuk sebuah reference string. Belady\'s anomaly juga sering jadi jebakan konseptual.',
      keys: ['Alur penanganan page fault (langkah demi langkah)', 'FIFO, Optimal, LRU, Second-chance/Clock', "Belady's anomaly, algoritma mana yang mengalaminya dan kenapa", 'Thrashing: penyebab dan gejalanya', 'Working set model & page-fault frequency', 'Copy-on-write dan kenapa fork() jadi murah'],
      probes: ['Untuk reference string 7,0,1,2,0,3,0,4,2,3 dengan 3 frame, hitung page fault untuk FIFO, LRU, dan Optimal.', "Tunjukkan contoh Belady's anomaly. Kenapa LRU kebal terhadapnya? (Petunjuk: stack algorithm.)", 'Sebuah sistem tiba-tiba sangat lambat dan disk berbunyi terus padahal CPU idle. Diagnosis dan solusinya?'] },

    { id: 'os-09', t: 'Processes & Threads', w: 3, wl: 'Minggu 3-4', d: 2,
      sum: 'Proses, PCB, state transition, context switch, fork/exec/wait, IPC (pipe, shared memory, message passing), dan thread beserta model multithreading.',
      keys: ['5 state proses & transisinya', 'PCB berisi apa saja; biaya context switch', 'fork() mengembalikan 2 nilai berbeda di 2 proses', 'Zombie process vs orphan process', 'Thread vs proses: apa yang di-share dan apa yang tidak', 'Model many-to-one, one-to-one, many-to-many'],
      probes: ['Kode dengan 3 `fork()` berurutan menghasilkan berapa proses? Gambar pohonnya.', 'Apa itu zombie process, kenapa terjadi, dan bagaimana mencegahnya?', 'Thread dalam satu proses berbagi apa saja dan punya apa saja sendiri? Kenapa pembagian itu masuk akal?'] },

    { id: 'os-10', t: 'Synchronization & Deadlock', w: 5, wl: 'Minggu 5', d: 3,
      sum: 'Race condition, critical section problem, solusi (Peterson, mutex, semaphore, monitor), masalah klasik (producer-consumer, readers-writers, dining philosophers), dan deadlock.',
      why: '🚨 Topik tersulit di paruh kedua. Bug konkurensi tidak deterministik, program bisa benar 99 kali lalu salah di kali ke-100. Ditambah algoritma Banker untuk deadlock avoidance yang berupa prosedur panjang dan mudah salah hitung.',
      keys: ['3 syarat solusi critical section: mutual exclusion, progress, bounded waiting', 'Semaphore: wait()/signal() harus atomic; counting vs binary', 'Producer-consumer, readers-writers, dining philosophers', '4 syarat deadlock (mutual exclusion, hold & wait, no preemption, circular wait)', 'Deadlock: prevention vs avoidance (Banker) vs detection vs ignore', 'Resource allocation graph & cara membaca cycle-nya'],
      probes: ['Tulis solusi producer-consumer dengan 3 semaphore. Jelaskan peran masing-masing dan apa yang rusak kalau urutan wait() dibalik.', 'Jalankan algoritma Banker pada satu contoh dan tentukan apakah state-nya safe. Tunjukkan safe sequence-nya.', 'Kenapa cycle pada resource allocation graph belum tentu deadlock kalau tiap resource punya banyak instance?'] },

    { id: 'os-11', t: 'CPU Scheduling', w: 6, wl: 'Minggu 6', d: 2,
      sum: 'Kriteria penjadwalan, algoritma FCFS, SJF, SRTF, Priority, Round Robin, Multilevel Feedback Queue, dan perhitungan waiting/turnaround time.',
      why: 'Konsepnya mudah, tapi soalnya berupa hitungan Gantt chart yang harus presisi. Salah satu angka di awal merusak seluruh jawaban.',
      keys: ['Preemptive vs non-preemptive', 'Menggambar Gantt chart dan menghitung waiting/turnaround/response time', 'SJF optimal untuk average waiting time, tapi kenapa tidak dipakai di dunia nyata?', 'Round Robin: pengaruh besar-kecilnya time quantum', 'Starvation & aging', 'Multilevel Feedback Queue'],
      probes: ['Untuk 4 proses dengan arrival & burst time tertentu, gambar Gantt chart FCFS, SJF, SRTF, dan RR(q=2). Hitung average waiting time masing-masing.', 'Kenapa SJF tidak bisa diimplementasikan secara murni di sistem nyata? Apa pendekatan praktisnya?', 'Apa yang terjadi kalau time quantum RR sangat besar? Sangat kecil? Di mana titik seimbangnya?'] },

    { id: 'os-12', t: 'Storage, Firmware, Bootloader & systemd', w: 12, wl: 'Minggu 10', d: 2,
      sum: 'Struktur disk (HDD vs SSD), disk scheduling, RAID, proses boot dari firmware → bootloader → kernel → init, dan systemd sebagai init modern.',
      keys: ['Seek time, rotational latency, transfer time', 'Disk scheduling: FCFS, SSTF, SCAN, C-SCAN, LOOK', 'HDD vs SSD: wear leveling, TRIM, kenapa scheduling berbeda', 'Level RAID 0/1/5/6/10 dan trade-off-nya', 'Urutan boot: BIOS/UEFI → bootloader (GRUB) → kernel → initramfs → systemd', 'systemd: unit, service, target, systemctl & journalctl'],
      probes: ['Untuk antrian request silinder tertentu, hitung total head movement untuk SSTF, SCAN, dan C-SCAN.', 'Jelaskan urutan boot Linux dari tombol power sampai login prompt. Apa peran initramfs?', 'Kenapa RAID 5 buruk untuk beban write-heavy? Jelaskan lewat read-modify-write parity.'] },

    { id: 'os-13', t: 'I/O Systems & I/O Programming', w: 12, wl: 'Minggu 10', d: 3,
      sum: 'Hardware I/O, polling vs interrupt vs DMA, device driver, blocking vs non-blocking I/O, buffering & caching, serta pemrograman I/O di Linux.',
      why: 'Menjadi topik PT 4 sekaligus materi UAS, dan menuntut kamu menggabungkan pemahaman C, system call, dan konsep kernel sekaligus.',
      keys: ['Polling vs interrupt-driven I/O vs DMA, kapan masing-masing dipakai', 'Blocking, non-blocking, dan asynchronous I/O', 'select/poll/epoll', 'Buffering, caching, spooling', 'Device driver & antarmuka kernel–device', 'File descriptor, open/read/write/close, ioctl'],
      probes: ['Bandingkan polling, interrupt, dan DMA dari sisi penggunaan CPU. Untuk transfer 1MB dari disk, mana yang paling efisien dan kenapa?', 'Apa beda non-blocking I/O dan asynchronous I/O? Banyak orang menyamakan keduanya, di mana bedanya?', 'Tulis program C yang membaca dari 2 file descriptor sekaligus tanpa blocking. Fungsi apa yang kamu pakai?'] },
  ],

  traps: [
    '🚨 <b>Menganggap matkul ini dimenangkan lewat ujian.</b> Tugas bernilai <b>36%</b>, lebih besar dari UTS (25%) maupun UAS (25%). Empat tugas coding penuh plus demo adalah komponen terbesar semester ini.',
    '🚨 Menunda setup VM Linux. Tugas 1 sudah menuntut shell scripting dan system call di C. <b>Setup di Minggu 1.</b>',
    '👥 Mencari kelompok setelah Tugas 1 rilis. Tugas 1 dikerjakan <b>berempat</b> lengkap dengan peer review dan video presentasi. Bentuk kelompok sebelum Minggu 4, bukan sesudahnya.',
    '⚠️ Menyangka kehadiran dihitung proporsional. Ambangnya <b>75%</b>: di atas itu dapat 4% penuh, di bawah itu <b>0</b>. Hadir 70% memberi nilai yang sama dengan tidak pernah datang.',
    'Melewatkan bonus keaktifan 2%. Bonus ini ada <b>di luar</b> total 100%, jadi ini satu-satunya cara menambal nilai di matkul ini, dan cukup dengan bicara di kelas.',
    'Menyiapkan diri untuk ujian coding, padahal UTS/UAS online lewat SCeLE menguji <b>teori, analitik, konsep, dan hitungan</b>. Soal Gantt chart, page fault, dan disk head movement harus dilatih terpisah dari kemampuan ngoding.',
    'Meremehkan Minggu 4, 7, 10, dan 12. Di keempat pekan itu <b>kuis dan tugas rilis bersamaan</b>. Itu beban puncak semester ini.',
    'Belajar C "sambil jalan". Luangkan satu akhir pekan penuh di Minggu 1–2 untuk pointer dan malloc. Investasi ini menghemat puluhan jam debugging.',
    'Membaca Silberschatz saja untuk virtual memory & konkurensi. OSTEP menjelaskan dua topik ini jauh lebih intuitif, pakai keduanya.',
  ],

  strategy: [
    { t: '1. Perlakukan Tugas sebagai komponen utama, bukan pelengkap', d: 'Empat tugas × 9% = <b>36%</b>, lebih besar dari ujian mana pun. Semuanya coding penuh plus demo, jadi tidak bisa diselesaikan semalam. Begitu tugas rilis di Minggu 4, 7, 10, atau 12, mulai di hari yang sama, karena pekan itu juga ada kuis.' },
    { t: '2. Bentuk kelompok Tugas 1 di Minggu 1', d: 'Tugas 1 (Scripting and OS System Calls using C) dikerjakan <b>berempat</b>, dengan peer review, video presentasi, dan demo tanya jawab ke asisten. Peer review artinya kontribusimu dinilai teman sekelompok. Sepakati pembagian kerja dan ritme commit sejak awal, bukan setelah tugasnya keluar.' },
    { t: '3. Kuasai C dan shell sebelum Minggu 4', d: 'Tugas 1 rilis di Minggu 4 dan sudah menuntut C + system call + scripting. Targetkan di akhir Minggu 2 kamu sudah nyaman dengan pointer & aritmetika pointer, malloc/free, struct, string handling, dan pengecekan errno. Sumber tercepat: Beej\'s Guide to C dan MIT Missing Semester.' },
    { t: '4. Hidup di terminal, bukan di GUI', d: 'Semua materi ini menjadi konkret begitu kamu praktikkan: <code>ps aux</code>, <code>top</code>, <code>strace ./program</code>, <code>free -h</code>, <code>lsblk</code>, <code>systemctl status</code>, <code>/proc/[pid]/maps</code>. <b>Setiap konsep yang kamu pelajari, cari perwujudannya di sistemmu sendiri.</b> Virtual memory berhenti jadi abstrak begitu kamu membaca /proc/self/maps.' },
    { t: '5. Latih soal hitungan terpisah dari latihan ngoding', d: 'UTS dan UAS online menguji teori, analitik, konsep, dan <b>hitungan</b>. Empat jenis soal hampir pasti muncul: (a) page fault untuk reference string, (b) Gantt chart + waiting time, (c) disk head movement, (d) translasi alamat paging. Keempatnya mekanis, latih 5–10 soal masing-masing sampai tidak perlu berpikir.' },
    { t: '6. Pakai OSTEP untuk topik sulit, Silberschatz untuk cakupan', d: 'Rencana pengajaran menyebut bab Silberschatz secara eksplisit tiap pekan, jadi itu peta cakupanmu. Tapi OSTEP (gratis) menjelaskan virtual memory, konkurensi, dan file system dengan gaya percakapan yang jauh lebih mudah masuk. Baca OSTEP untuk paham, cek Silberschatz supaya tidak ada bagian silabus yang terlewat.' },
    { t: '7. Bangun catatan "peta system call"', d: 'Buat satu halaman berisi system call penting per topik: proses (fork, exec, wait, exit), file (open, read, write, lseek, stat), memori (mmap, brk), IPC (pipe, shmget, msgget), I/O (select, poll, ioctl). Tulis signature + 1 baris fungsinya. Peta ini akan kamu pakai di keempat tugas.' },
    { t: '8. Debug dengan tool yang tepat sejak awal', d: '<code>gdb</code> untuk segfault, <code>valgrind</code> untuk memory leak, <code>strace</code> untuk melihat system call yang benar-benar dipanggil. Mahasiswa yang menghabiskan waktu menebak-nebak dengan printf akan selalu kalah cepat dari yang memakai tiga tool ini. Demo tugas juga jauh lebih meyakinkan kalau kamu bisa menunjukkan hasil strace.' },
    { t: '9. Ambil bonus keaktifan 2%', d: 'Bonus ini berada <b>di luar</b> total 100%, jadi nilai akhirmu bisa melewati 100. Dua poin adalah selisih 84 dan 86, yaitu selisih A- dan A. Duduk di depan, jawab pertanyaan dosen, dan tanya saat tidak paham. Ini nilai paling murah di seluruh semestermu.' },
  ],

  resources: [
    { type: 'book', t: 'OSTEP, Operating Systems: Three Easy Pieces (GRATIS)', url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/', note: '⭐ Buku acuan kedua kuliah ini dan gratis penuh. Bab virtual memory & konkurensinya adalah penjelasan terbaik yang ada. Mulai dari sini kalau bingung.' },
    { type: 'web', t: "Beej's Guide to C Programming", url: 'https://beej.us/guide/bgc/', note: '⭐ Cara tercepat menguasai C dari nol untuk keperluan sistem. Baca bab pointer & memory management dulu.' },
    { type: 'web', t: 'MIT, The Missing Semester of Your CS Education', url: 'https://missing.csail.mit.edu/', note: '⭐ Shell scripting, terminal, debugging, dan tooling. Persis skill yang diasumsikan sudah kamu punya di kuliah ini.' },
    { type: 'yt', t: 'Neso Academy, Operating System', url: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O', note: 'Penjelasan papan tulis untuk scheduling, sinkronisasi, deadlock, dan virtual memory. Sangat cocok untuk soal hitungan.' },
    { type: 'yt', t: 'MIT 6.1810 / 6.S081 Operating System Engineering', url: 'https://pdos.csail.mit.edu/6.828/', note: 'Kalau ingin serius: kuliah + lab xv6. Jauh lebih dalam dari yang diminta, tapi membuat semua konsep jadi nyata.' },
    { type: 'yt', t: 'CodeVault, C / Linux system programming', url: 'https://www.youtube.com/@CodeVault', note: '⭐ Tutorial praktis fork, pipe, thread, semaphore, shared memory dalam C. Langsung relevan ke PT.' },
    { type: 'web', t: 'Linux man pages online', url: 'https://man7.org/linux/man-pages/', note: 'Rujukan resmi untuk semua system call. Biasakan `man 2 fork`, bagian 2 = system call, bagian 3 = library function.' },
    { type: 'web', t: 'systemd, dokumentasi resmi', url: 'https://systemd.io/', note: 'Pelengkap materi storage dan boot process di Minggu 10. Fokus ke konsep unit, service, dan target.' },
    { type: 'tool', t: 'Valgrind, deteksi memory leak', url: 'https://valgrind.org/docs/manual/quick-start.html', note: '`valgrind --leak-check=full ./program`. Wajib dijalankan sebelum submit PT apa pun yang pakai malloc.' },
  ],
};

export default os;
