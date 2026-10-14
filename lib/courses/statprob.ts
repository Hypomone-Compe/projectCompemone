/* ==========================================================================
   Statistika & Probabilitas, Kelas C, Gasal 2026/2027
   Sumber: BRP StatProb Gasal 2026/2027 (CSCM602013)
   ========================================================================== */
import type { CourseContent } from '../types';

const statprob: CourseContent = {
  meta: [
    { k: 'Kelas', v: 'StatProb C · Semester 3 · 3 SKS' },
    { k: 'Dosen', v: 'Rahmad Mahendra, Ph.D. (kelas C, 70 mahasiswa) · koordinator MK: Muhammad Febrian Rachmadi, Ph.D.' },
    { k: 'Jadwal kuliah', v: 'Senin 08.00–09.40 di A1.51 · Rabu 09.00–09.50 di A1.51 (Ged Baru)' },
    { k: 'Asistensi & Kuis', v: 'Kamis 16.00–17.40 di A6.08, di sinilah keenam kuis dilaksanakan' },
    { k: 'Prasyarat', v: 'Matematika Diskrit (lulus) · Kalkulus 1 (lulus)' },
    { k: 'Prasyarat untuk', v: 'Kecerdasan Artifisial & Sains Data Dasar (lulus)' },
    { k: 'Bahasa pengantar', v: 'Bahasa Inggris (ditetapkan BRP)' },
    { k: 'Beban belajar', v: '3 SKS = 135 jam/semester. Terjadwal 63 jam 20 menit, sisanya ≈ 5 jam 7 menit belajar mandiri per minggu.' },
  ],

  books: [
    { t: 'Probability & Statistics with Applications to Computing (2020)', by: 'Alex Tsun · GRATIS: alextsun.com/files/Prob_Stat_for_CS_Book.pdf' },
    { t: 'Probability for Computer Scientists, CS109 Course Reader, Stanford (2023)', by: 'Chris Piech · GRATIS online' },
  ],

  grading: {
    total: '100%',
    components: [
      { name: 'Checkpoint Quiz', weight: 30, freq: '6×', note: '⭐ Bobot terbesar bersama UTS dan UAS. Tiap kuis 60 menit di sesi asistensi hari Kamis, maksimal 2 soal, open notes 2 halaman A4 TULIS TANGAN. Cakupan: Q1 topik (1)-(2), Q2 (3)-(4), Q3 (5)-(6), Q4 (7)-(8), Q5 (9) & (11), Q6 (12) & (10).' },
      { name: 'UTS', weight: 30, freq: '1×', note: '12, 14, dan 15 Oktober 2026, lalu 19, 21, dan 22 Oktober. 150 menit, open notes 4 halaman A4 tulis tangan. Materi: topik (1) sampai (6).' },
      { name: 'UAS', weight: 30, freq: '1×', note: '10, 14, 16, dan 17 Desember 2026. Materi: topik (7) sampai (12).' },
      { name: 'Partisipasi pada kuliah dan asistensi', weight: 5, freq: 'Sepanjang semester', note: 'Bobot partisipasi tertinggi di antara kelima matkul semester ini. BRP menyebut partisipasi di kuliah maupun di sesi asistensi, bukan sekadar hadir.' },
      { name: 'Tugas Pemrograman', weight: 5, freq: '1×', note: 'Hanya SATU kali sepanjang semester. BRP menandainya di baris Minggu 10 dengan keterangan DEADLINE AKHIR PEKAN, yaitu pekan 26 Oktober sampai 1 November 2026.' },
    ],
    scale: [
      { g: 'A', min: 85 }, { g: 'A-', min: 80 }, { g: 'B+', min: 75 }, { g: 'B', min: 70 },
      { g: 'B-', min: 65 }, { g: 'C+', min: 60 }, { g: 'C', min: 55 }, { g: 'D', min: 45 }, { g: 'E', min: 0 },
    ],
    notes: [
      '💎 <b>90% nilaimu ditentukan kertas dan pulpen.</b> Kuis 30% + UTS 30% + UAS 30% semuanya <b>pen-and-paper</b> dan <b>open notes tulis tangan</b>. Catatan ketik tidak boleh dibawa, jadi menulis ulang materi dengan tangan bukan nostalgia, itu syarat masuk ruang ujian.',
      '🚨 <b>Kuis dibatasi 2 halaman A4 catatan tulis tangan, UTS 4 halaman.</b> Susun lembar rangkumanmu sejak minggu pertama dan perbaiki tiap pekan. Menyiapkannya semalam sebelum kuis adalah cara tercepat kehilangan 30%.',
      '⚠️ Enam kuis tersebar sepanjang semester dan <b>tidak ada yang dibuang</b>. Satu kuis bernilai 5% dari nilai akhir, setara dengan seluruh bobot Tugas Pemrograman.',
      'Tugas Pemrograman cuma sekali dan bernilai 5%. Kecil, tapi tidak ada kesempatan kedua untuk memperbaikinya.',
      'UTS/UAS susulan hanya untuk surat sakit, surat tugas negara atau UI, surat rawat inap, atau force majeure, dan harus lewat verifikasi sekretariat akademik.',
      'Konversi huruf mengikuti standar Universitas Indonesia (acuan umum, konfirmasi ke dosen kelasmu).',
    ],
  },

  weeks: [
    { n: 1, title: '(0) Pengantar + (1) Elements of Probability', points: [
        'Senin 24 Agu dan Rabu 26 Agu: penjelasan silabus serta aturan kelas',
        'Definisi, aksioma, equally likely outcomes, conditional probability',
        'Bayes Theorem, Law of Total Probability, chain rule, independence' ],
      tasks: ['Asistensi 27 Agu: revisit Set Theory dan Counting'] },
    { n: 2, title: '(1) lanjutan + (2) Deep Dive Into Bayes Theorem', points: [
        'Recap Bayes Theorem, Bayes dengan Law of Total Probability',
        'Probability Tree dan Probability Tree of Bayes Theorem' ],
      tasks: ['📝 Checkpoint Quiz #1: topik (1) dan (2)'] },
    { n: 3, title: '(2) lanjutan + (3) Random Variables', points: [
        'Konsep dan jenis random variable',
        'PMF, PDF, CDF',
        'Expectation, variance, dan covariance' ],
      tasks: ['Asistensi 100 menit: latihan soal'] },
    { n: 4, title: '(3) lanjutan + (4) Multiple Discrete Random Variables', points: [
        'Joint distribution',
        'Conditional distribution',
        'Covariance dan correlation' ],
      tasks: ['📝 Checkpoint Quiz #2: topik (3) dan (4)'] },
    { n: 5, title: '(5) Common Discrete Random Variables', points: [
        'Bernoulli, Binomial, Geometric',
        'Negative Binomial, Hypergeometric, Poisson' ],
      tasks: ['Asistensi 100 menit: latihan soal'] },
    { n: 6, title: '(5) lanjutan + (6) Common Continuous Random Variables', points: [
        'Definisi continuous RV',
        'Uniform, Exponential, dan Normal RV' ],
      tasks: ['📝 Checkpoint Quiz #3: topik (5) dan (6)'] },
    { n: 7, title: '(6) lanjutan dan persiapan UTS', points: [
        'Lanjutan distribusi kontinu, latihan soal menjelang ujian' ],
      tasks: ['Asistensi 100 menit: latihan soal'] },
    { n: 8, title: 'UTS', points: [
        'Ujian Tengah Semester: 12, 14, dan 15 Oktober 2026',
        '150 menit, open notes 4 halaman A4 tulis tangan',
        'Materi: topik (1) sampai (6)' ], tasks: [], flag: 'exam' },
    { n: 9, title: 'UTS (pekan kedua)', points: [
        'Lanjutan periode ujian: 19, 21, dan 22 Oktober 2026' ], tasks: [], flag: 'exam' },
    { n: 10, title: '(7) Istilah statistika dan teknik sampling', points: [
        'Populasi, sampel, parameter',
        'Skala pengukuran: nominal, ordinal, interval, ratio',
        'Sampling: simple, systematic, stratified, random, convenience, purposive, quota' ],
      tasks: ['🔥 Deadline Tugas Pemrograman, akhir pekan ini'] },
    { n: 11, title: '(8) Descriptive Statistics', points: [
        'Mean, median, modus, variance, standard deviation',
        'Percentile dan percentile rank',
        'Tabel frekuensi, grafik, dan histogram' ],
      tasks: ['📝 Checkpoint Quiz #4: topik (7) dan (8)'] },
    { n: 12, title: '(9) Sample Statistical Distribution', points: [
        'Sample mean dan variance, sampling distribution of the normal distribution',
        'Central Limit Theorem dan Chebyshev inequality',
        'Normal data set dan standard score (z-score)' ],
      tasks: ['Asistensi 100 menit: latihan soal'] },
    { n: 13, title: '(11) Confidence Interval', points: [
        'Konsep interval kepercayaan dan margin of error' ],
      tasks: ['📝 Checkpoint Quiz #5: topik (9) dan (11)'] },
    { n: 14, title: '(11) lanjutan + (12) Hypothesis Testing', points: [
        'Lanjutan confidence interval',
        'Pengantar uji hipotesis' ],
      tasks: ['Asistensi 100 menit: latihan soal'] },
    { n: 15, title: '(12) lanjutan + (10) Parameter Point Estimation', points: [
        'Lanjutan uji hipotesis',
        'Estimasi titik: MLE dan MAP' ],
      tasks: ['📝 Checkpoint Quiz #6: topik (12) dan (10)'] },
    { n: 16, title: '(10) lanjutan, lalu UAS dimulai', points: [
        'Kuliah terakhir 7 dan 9 Desember 2026',
        'UAS dimulai 10 Desember 2026',
        'Materi UAS: topik (7) sampai (12)' ], tasks: [], flag: 'exam' },
    { n: 17, title: 'UAS (pekan kedua)', points: [
        'Lanjutan periode ujian: 14, 16, dan 17 Desember 2026' ], tasks: [], flag: 'exam' },
  ],

  topics: [
    { id: 'sp-0b', t: '(0) Set Theory dan Counting, revisit di asistensi Minggu 1', w: 1, d: 2,
      sum: 'Fondasi menghitung ruang sampel: aturan perkalian & penjumlahan, permutasi, kombinasi, inclusion-exclusion, dan stars and bars.',
      why: 'Kelihatan seperti pengulangan Matdis, tapi di sini semua soal probabilitas bertumpu padanya. Kalau salah menghitung ruang sampel, seluruh jawaban probabilitas ikut salah, dan kesalahannya tidak terlihat.',
      keys: ['Product rule & sum rule', 'Permutasi P(n,k) vs kombinasi C(n,k), kapan urutan penting', 'Permutasi dengan elemen identik', 'Inclusion-exclusion principle', 'Stars and bars (distribusi objek identik)', 'Complementary counting'],
      probes: ['Berapa banyak cara menyusun huruf "STATISTIKA"? Jelaskan kenapa harus dibagi faktorial.', 'Kapan sebuah soal pakai C(n,k) dan kapan P(n,k)? Beri satu contoh yang mudah tertukar.', 'Selesaikan satu soal dengan complementary counting dan jelaskan kenapa cara itu lebih mudah.'] },

    { id: 'sp-01', t: '(1) Elements of Probability', w: 1, d: 2,
      sum: 'Ruang sampel, event, aksioma Kolmogorov, equally likely outcomes, probabilitas bersyarat, chain rule, dan independensi.',
      keys: ['3 aksioma probabilitas', 'P(A|B) = P(A∩B)/P(B), dan kenapa penyebutnya B', 'Chain rule: P(A∩B∩C) = P(A)P(B|A)P(C|A∩B)', 'Independen: P(A∩B) = P(A)P(B)', '⚠️ Independen ≠ mutually exclusive (justru saling bertentangan!)', 'Conditional independence: independen diberikan C tapi tidak independen secara umum'],
      probes: ['Jelaskan kenapa dua event yang mutually exclusive (dan berprobabilitas > 0) TIDAK MUNGKIN independen.', 'Beri contoh konkret A dan B yang conditionally independent given C tapi tidak independent.', 'Turunkan chain rule untuk 3 event dari definisi conditional probability.'] },

    { id: 'sp-02', t: '(2) Deep Dive Into Bayes Theorem, LTP dan Probability Tree', w: 2, d: 3,
      sum: 'Membalik arah kondisional: dari P(bukti|hipotesis) menjadi P(hipotesis|bukti), dengan Law of Total Probability sebagai penyebutnya.',
      why: '🚨 Bukan rumusnya yang sulit, <b>mengenali mana yang prior, likelihood, dan evidence</b> dari soal cerita itulah yang sulit. Ditambah base rate fallacy: hasil Bayes sering terasa berlawanan dengan intuisi (contoh klasik: tes penyakit akurat 99% tapi P(sakit|positif) cuma 9%).',
      keys: ['P(A|B) = P(B|A)·P(A) / P(B)', 'Law of Total Probability: P(B) = Σ P(B|Aᵢ)P(Aᵢ) untuk partisi {Aᵢ}', 'Prior, likelihood, evidence, posterior, mana yang mana di soal', 'Probability tree sebagai alat pemetaan', 'Base rate fallacy', 'Bayes berulang: posterior menjadi prior berikutnya'],
      probes: ['Kerjakan soal tes medis klasik: prevalensi 1%, sensitivitas 99%, spesifisitas 99%. Hitung P(sakit|positif) dan jelaskan kenapa hasilnya terasa "salah".', 'Gambar probability tree untuk soal 3 kotak, lalu tunjukkan bagaimana LTP muncul dari menjumlahkan cabang-cabangnya.', 'Dari sebuah soal cerita, identifikasi mana prior, likelihood, dan evidence sebelum menghitung apa pun.'] },

    { id: 'sp-03', t: '(3) Random Variables: PMF, PDF, CDF, Expectation, Variance', w: 3, d: 3,
      sum: 'Memetakan outcome ke bilangan: RV diskret (PMF) dan kontinu (PDF), CDF, ekspektasi, variansi, dan kovariansi.',
      why: '🚨 Transisi dari diskret (jumlah) ke kontinu (integral) adalah titik banyak orang tersesat. Ditambah kesalahpahaman fatal: <b>f(x) pada PDF bukan probabilitas</b> dan bisa bernilai > 1. Untuk RV kontinu, P(X = a) = 0 selalu.',
      keys: ['PMF: p(x) = P(X=x), Σp(x)=1. PDF: f(x) ≥ 0, ∫f(x)dx = 1', '⚠️ f(x) pada PDF BUKAN probabilitas, probabilitas adalah luas area', 'CDF F(x) = P(X ≤ x); monoton naik, kontinu kanan; F′(x) = f(x)', 'E[X] = Σx·p(x) atau ∫x·f(x)dx', 'Linearitas ekspektasi: E[aX+bY] = aE[X]+bE[Y], berlaku SELALU, tidak perlu independen', 'Var(X) = E[X²] − (E[X])²', 'Var(aX+b) = a²Var(X), b hilang', 'Law of the Unconscious Statistician: E[g(X)] = Σg(x)p(x)'],
      probes: ['Kenapa PDF boleh bernilai lebih dari 1 sementara PMF tidak? Beri contoh PDF dengan f(x) = 2.', 'Turunkan Var(X) = E[X²] − (E[X])² dari definisi Var(X) = E[(X−μ)²].', 'Buktikan E[X+Y] = E[X]+E[Y] tanpa asumsi independensi, lalu tunjukkan kenapa Var(X+Y) = Var(X)+Var(Y) BUTUH independensi.'] },

    { id: 'sp-04', t: '(4) Multiple Discrete Random Variables: Joint, Conditional, Covariance', w: 4, d: 3,
      sum: 'Dua atau lebih RV sekaligus: distribusi gabungan, marginal, kondisional, kovariansi, dan korelasi.',
      why: '🚨 Marginalisasi kasus kontinu butuh integral ganda dengan batas yang benar, dan menentukan batas integrasi dari daerah definisi itulah bagian tersulitnya. Juga: <b>kovariansi 0 tidak berarti independen</b> (kecuali normal bivariat).',
      keys: ['Joint PMF/PDF; marginal diperoleh dengan menjumlah/mengintegralkan variabel lain', 'Conditional distribution f(y|x) = f(x,y)/f_X(x)', 'Independen ⟺ f(x,y) = f_X(x)·f_Y(y) untuk SEMUA x,y', 'Cov(X,Y) = E[XY] − E[X]E[Y]', 'Korelasi ρ = Cov(X,Y)/(σ_X σ_Y), selalu ∈ [−1,1]', '⚠️ Independen ⟹ Cov=0, tetapi Cov=0 ⇏ independen', 'Var(X+Y) = Var(X)+Var(Y)+2Cov(X,Y)'],
      probes: ['Diberi joint PDF pada suatu daerah, hitung marginal kedua variabel. Bagaimana kamu menentukan batas integrasinya?', 'Beri contoh X dan Y dengan Cov(X,Y) = 0 tapi jelas TIDAK independen. (Petunjuk: coba Y = X².)', 'Turunkan Var(X+Y) dari definisi dan tunjukkan di mana suku 2Cov muncul.'] },

    { id: 'sp-05', t: '(5) Common Discrete RVs: Bernoulli, Binomial, Geometric, Hypergeometric, Poisson', w: 5, d: 2,
      sum: 'Lima distribusi diskret standar: kondisi penggunaannya, PMF, ekspektasi, dan variansi masing-masing.',
      why: 'Rumusnya mudah dihafal; yang sulit adalah <b>memilih distribusi yang tepat</b> dari soal cerita. Binomial vs Hypergeometric (dengan/tanpa pengembalian) dan Binomial vs Poisson paling sering tertukar.',
      keys: ['Bernoulli: 1 percobaan. E=p, Var=p(1−p)', 'Binomial: n percobaan independen, DENGAN pengembalian. E=np, Var=np(1−p)', 'Geometric: percobaan sampai sukses pertama. E=1/p, Var=(1−p)/p²', 'Hypergeometric: sampling TANPA pengembalian dari populasi terbatas', 'Poisson: kejadian jarang per satuan waktu/ruang. E=Var=λ', 'Aproksimasi Poisson ke Binomial saat n besar & p kecil (λ = np)', 'Sifat memoryless pada Geometric'],
      probes: ['Buat tabel 5 distribusi: kondisi pakai, PMF, E[X], Var(X). Lalu tutup dan tulis ulang dari ingatan.', 'Kapan pakai Binomial dan kapan Hypergeometric? Beri satu soal yang berubah jawabannya kalau salah pilih.', 'Jelaskan sifat memoryless Geometric dengan contoh konkret. Kenapa itu terasa berlawanan dengan intuisi?'] },

    { id: 'sp-06', t: '(6) Common Continuous RVs: Uniform, Exponential, Normal', w: 6, d: 3,
      sum: 'Tiga distribusi kontinu inti, standardisasi normal (z-score), dan penggunaan tabel Z.',
      why: '🚨 Menghitung probabilitas butuh integral atau tabel Z, dan kesalahan tanda/arah sangat umum: P(Z > a) vs P(Z < a), simetri, serta membaca tabel dari sisi yang benar. Exponential juga memoryless, sifat yang sering diuji.',
      keys: ['Uniform(a,b): f = 1/(b−a), E = (a+b)/2, Var = (b−a)²/12', 'Exponential(λ): f = λe^(−λx), E = 1/λ, Var = 1/λ², memoryless', 'Hubungan Poisson (jumlah kejadian) ↔ Exponential (waktu antar kejadian)', 'Normal(μ,σ²): kurva lonceng, aturan 68-95-99,7', 'Standardisasi Z = (X−μ)/σ dan penggunaan tabel Z', 'Kombinasi linear normal tetap normal'],
      probes: ['Hitung P(X > 5) untuk Exponential(λ=0,2) tanpa tabel. Lalu tunjukkan sifat memoryless-nya: P(X>8|X>3) = P(X>5).', 'Untuk X~N(70,25), hitung P(65 < X < 80) menggunakan tabel Z. Gambar kurvanya dan arsir areanya.', 'Jelaskan hubungan antara Poisson dan Exponential. Kalau panggilan masuk 3/jam (Poisson), berapa distribusi waktu tunggu panggilan berikutnya?'] },

    { id: 'sp-00', t: '(7) Terminologi Statistika dan Skala Pengukuran', w: 10, d: 1,
      sum: 'Populasi vs sampel, parameter vs statistik, dan empat skala pengukuran: nominal, ordinal, interval, ratio.',
      keys: ['Populasi vs sampel; parameter (μ, σ) vs statistik (x̄, s)', 'Nominal (kategori), ordinal (berurutan), interval (jarak bermakna, nol arbitrer), ratio (nol mutlak)', 'Operasi apa yang sah untuk tiap skala', 'Statistik deskriptif vs inferensial'],
      probes: ['Beri contoh data untuk masing-masing 4 skala pengukuran dan sebutkan operasi apa yang TIDAK sah untuk masing-masing.', 'Kenapa suhu Celsius itu interval, bukan ratio? Apa akibatnya kalau kita bilang "20°C dua kali lebih panas dari 10°C"?', 'Apa beda parameter dan statistik? Simbol mana untuk yang mana?'] },

    { id: 'sp-08', t: '(7) Teknik Sampling', w: 10, d: 1,
      sum: 'Cara mengambil sampel: simple random, systematic, stratified, cluster, convenience, purposive, quota, beserta bias yang mengikutinya.',
      keys: ['Probability sampling (simple, systematic, stratified, cluster) vs non-probability (convenience, purposive, quota)', 'Stratified: bagi jadi strata homogen lalu sampel dari tiap strata', 'Cluster: sampel seluruh cluster (beda dari stratified!)', 'Sampling bias, selection bias, non-response bias', 'Kenapa non-probability sampling tidak bisa digeneralisasi'],
      probes: ['Apa beda stratified dan cluster sampling? Kapan masing-masing lebih tepat?', 'Beri contoh nyata di mana convenience sampling memberi kesimpulan yang menyesatkan.', 'Kamu ingin menyurvei mahasiswa Fasilkom tentang beban tugas. Rancang skema samplingnya dan justifikasi pilihanmu.'] },

    { id: 'sp-07', t: '(8) Descriptive Statistics', w: 11, d: 1,
      sum: 'Meringkas data: ukuran pemusatan (mean, median, modus), penyebaran (variance, SD, range, IQR), persentil, tabel frekuensi, dan histogram.',
      keys: ['Mean vs median: sensitivitas terhadap outlier', 'Variansi populasi (÷N) vs variansi sampel (÷n−1), kenapa n−1', 'Persentil & percentile rank; kuartil & IQR', 'Skewness dari posisi relatif mean, median, modus', 'Membaca dan membangun histogram, boxplot'],
      probes: ['Kenapa variansi sampel dibagi (n−1), bukan n? Jelaskan konsep derajat kebebasan / unbiasedness.', 'Untuk distribusi menceng kanan, urutkan mean, median, dan modus. Kenapa urutannya begitu?', 'Kapan median lebih informatif dari mean? Beri contoh data nyata.'] },

    { id: 'sp-09', t: '(9) Sample Statistical Distribution dan Central Limit Theorem', w: 12, d: 3,
      sum: 'Distribusi dari statistik sampel: distribusi x̄, standard error, Central Limit Theorem, Chebyshev, dan z-score.',
      why: '🚨 <b>CLT adalah konsep paling sering disalahpahami di seluruh mata kuliah.</b> CLT berbicara tentang distribusi rata-rata sampel, BUKAN tentang distribusi datanya. Dan standard error σ/√n sering tertukar dengan σ itu sendiri.',
      keys: ['Distribusi sampling x̄: E[x̄] = μ, Var(x̄) = σ²/n', 'Standard error = σ/√n, mengecil seiring n membesar', '⚠️ CLT: distribusi x̄ mendekati normal untuk n besar, TERLEPAS dari distribusi populasi asalnya', 'Aturan praktis n ≥ 30', "Chebyshev's inequality: berlaku untuk distribusi APA PUN, tapi longgar", 'z-score untuk x̄: z = (x̄ − μ)/(σ/√n), perhatikan penyebutnya!'],
      probes: ['Nyatakan CLT dengan tepat. Apa persisnya yang menjadi normal, datanya atau rata-ratanya? Jelaskan bedanya.', 'Populasi sangat menceng dengan μ=50, σ=20. Untuk n=100, berapa P(x̄ > 53)? Kenapa kamu boleh pakai normal di sini?', 'Bandingkan batas dari Chebyshev dan dari normal untuk k=2. Kenapa Chebyshev jauh lebih longgar, dan kapan kita tetap butuh dia?'] },

    { id: 'sp-11', t: '(11) Confidence Interval', w: 13, d: 3,
      sum: 'Estimasi interval: CI untuk mean dengan variansi diketahui (Z) dan tidak diketahui (t), margin of error, dan interpretasi yang benar.',
      why: '🚨 Interpretasinya adalah jebakan konseptual paling terkenal di statistika. "CI 95%" TIDAK berarti "ada 95% peluang μ ada di interval ini", μ itu konstanta, bukan variabel acak. Yang 95% adalah <b>prosedurnya</b>, bukan interval tertentu.',
      keys: ['CI = estimasi titik ± (nilai kritis × standard error)', 'σ diketahui → pakai Z. σ tidak diketahui → pakai t dengan df = n−1', 'Kenapa distribusi t lebih lebar dari normal (ketidakpastian tambahan dari menaksir σ)', '⚠️ Interpretasi benar: jika prosedur ini diulang berkali-kali, 95% interval yang dihasilkan akan memuat μ', 'Trade-off: tingkat kepercayaan naik → interval melebar', 'Menghitung n minimum untuk margin of error tertentu'],
      probes: ['Tulis interpretasi CI 95% yang BENAR dan yang SALAH, lalu jelaskan kenapa versi salah itu salah.', 'Hitung CI 95% untuk data n=15 dengan σ tidak diketahui. Kenapa pakai t dan berapa derajat kebebasannya?', 'Berapa besar sampel yang dibutuhkan agar margin of error ≤ 2 pada tingkat kepercayaan 99%? Turunkan rumusnya.'] },

    { id: 'sp-12', t: '(12) Hypothesis Testing', w: 14, d: 3,
      sum: 'Menguji klaim tentang rerata: H₀ vs H₁, statistik uji, daerah kritis, p-value, error tipe I & II, serta uji satu dan dua sisi.',
      why: '🚨 Terminologinya presisi dan tidak intuitif: "gagal menolak H₀" ≠ "menerima H₀". p-value juga hampir selalu salah dimaknai sebagai "probabilitas H₀ benar", padahal artinya probabilitas mengamati data seekstrem ini JIKA H₀ benar.',
      keys: ['H₀ selalu memuat kesamaan (=, ≤, ≥); H₁ adalah yang ingin dibuktikan', 'Error tipe I (α): menolak H₀ padahal benar. Error tipe II (β): gagal menolak H₀ padahal salah', 'Power = 1 − β', '⚠️ p-value = P(data seekstrem ini | H₀ benar), BUKAN P(H₀ benar | data)', 'Aturan keputusan: tolak H₀ jika p-value < α', 'Uji satu sisi vs dua sisi, dan bagaimana daerah kritisnya dibagi', 'Z-test (σ diketahui) vs t-test (σ tidak diketahui)', 'Hubungan CI dan uji dua sisi'],
      probes: ['Kerjakan satu uji hipotesis lengkap: rumuskan H₀/H₁, hitung statistik uji, tentukan daerah kritis, hitung p-value, ambil kesimpulan dalam kalimat konteks.', 'Kenapa kita bilang "gagal menolak H₀" dan bukan "menerima H₀"? Apa bedanya secara logis?', 'Jelaskan trade-off antara α dan β. Kalau kamu menurunkan α dari 0,05 ke 0,01, apa yang terjadi pada power dan kenapa?'] },

    { id: 'sp-10', t: '(10) Parameter Point Estimation: MLE, MAP, Conjugate Prior', w: 15, d: 3,
      sum: 'Menaksir parameter dari data: Maximum Likelihood Estimation, Maximum A Posteriori, conjugate prior, dan distribusi Beta/Dirichlet.',
      why: '🚨 <b>Topik paling matematis di mata kuliah ini.</b> MLE menuntut membangun fungsi likelihood, mengambil log, menurunkan, dan menyelesaikan, kalkulus penuh. MAP menambahkan prior sehingga kamu harus paham Bayes juga. Conjugate prior + Beta/Dirichlet adalah materi tingkat lanjut yang jarang ada di kuliah statistik dasar.',
      keys: ['Likelihood L(θ) = ∏ f(xᵢ|θ), perkalian, bukan penjumlahan', 'Kenapa memakai log-likelihood (mengubah perkalian jadi penjumlahan, monoton)', 'Prosedur MLE: bentuk L → log → turunkan → samakan nol → cek maksimum', 'MAP: memaksimalkan posterior ∝ likelihood × prior', 'MLE = MAP saat prior uniform', 'Conjugate prior: prior yang membuat posterior sekeluarga dengannya', 'Beta adalah conjugate prior untuk Bernoulli/Binomial; Dirichlet untuk Multinomial', 'Bias & konsistensi estimator'],
      probes: ['Turunkan MLE untuk parameter p dari n percobaan Bernoulli. Tunjukkan setiap langkah kalkulusnya.', 'Kerjakan MAP untuk kasus yang sama dengan prior Beta(α,β). Bagaimana hasilnya berubah saat n → ∞, dan apa artinya?', 'Apa arti "conjugate" pada conjugate prior, dan kenapa sifat itu sangat berguna secara praktis?'] },
  ],

  traps: [
    '🚨 <b>Menyiapkan lembar catatan semalam sebelum kuis.</b> Kuis, UTS, dan UAS semuanya open notes <b>tulis tangan</b>, dan jatahnya cuma 2 halaman A4 untuk kuis serta 4 halaman untuk UTS. Menyalin materi satu semester dengan tangan dalam semalam mustahil. Lembar itu harus tumbuh tiap minggu.',
    '🚨 <b>Membawa catatan hasil ketik.</b> BRP menyebut handwritten secara eksplisit. Catatan ketik yang rapi tidak akan diterima di ruang ujian, dan tidak ada waktu untuk menyalinnya di tempat.',
    'Menganggap kuis pertama masih jauh. <b>Kuis #1 jatuh di Minggu 2</b>, menguji topik (1) dan (2) sekaligus. Semester ini tidak memberi masa pemanasan.',
    'Menganggap "kuis cuma 5%". Enam kuis = 30%, sama besar dengan UTS dan sama besar dengan UAS. Tidak ada satu pun yang dibuang.',
    'Melewatkan sesi Asistensi hari Kamis. Semua kuis ada di sana, dan sesi asistensi 50 menit sebelumnya membahas persis materi yang akan diujikan.',
    'Menghafal rumus distribusi tanpa bisa memilih distribusi. Soal cerita menuntut identifikasi, bukan substitusi. Kuis dibatasi maksimal 2 soal, jadi salah memilih distribusi di satu soal berarti kehilangan separuh nilai kuis.',
    'Belajar kalkulus integral "nanti saja". Materi RV kontinu, marginalisasi, dan MLE semuanya butuh integral dan turunan. Segarkan Kalkulus 1 sebelum Minggu 3.',
    'Melupakan Tugas Pemrograman yang cuma sekali. Deadline-nya di akhir Minggu 10 dan bobotnya 5%, sama dengan satu kuis penuh. Tidak ada kesempatan kedua.',
    'Salah menafsirkan p-value dan confidence interval di jawaban esai. Dua hal ini punya definisi presisi dan dosen statistik menilainya ketat.',
  ],

  strategy: [
    { t: '1. Bangun lembar catatan tulis tangan sejak Minggu 1', d: '<b>Ini strategi paling penting di matkul ini.</b> Kuis, UTS, dan UAS semuanya open notes tulis tangan: 2 halaman A4 untuk kuis, 4 halaman untuk UTS. Sediakan satu berkas fisik dan tambahkan materi tiap pekan. Menulis ulang dengan tangan sekaligus memaksamu meringkas, dan meringkas adalah cara belajar itu sendiri. Yang menyiapkannya semalam sebelum ujian sudah kalah sebelum masuk ruangan.' },
    { t: '2. Perlakukan Kamis sebagai hari paling penting dalam minggumu', d: 'Sesi Kamis 16.00 sampai 17.40 di A6.08 berisi <b>asistensi 50 menit lalu kuis 60 menit</b> pada pekan berkuis. Materi kuis dibahas persis sebelum kuisnya. Datang dalam keadaan sudah membaca, dan sesi asistensi berubah dari "belajar materi baru" jadi "mengonfirmasi yang sudah kamu tahu". Ini praktis 30% nilaimu.' },
    { t: '3. Kunci jadwal enam kuis di kalender sekarang juga', d: 'Kuis jatuh di Minggu <b>2, 4, 6, 11, 13, dan 15</b>, selalu hari Kamis. Cakupannya: #1 topik (1)-(2), #2 (3)-(4), #3 (5)-(6), #4 (7)-(8), #5 (9) & (11), #6 (12) & (10). Pola dua mingguan ini berarti kamu tidak pernah punya lebih dari dua pekan untuk menguasai satu blok materi.' },
    { t: '4. Buat satu lembar "peta distribusi"', d: 'Satu halaman berisi semua distribusi: nama, kondisi pemakaian, PMF/PDF, E[X], Var(X), dan satu contoh soal khas. Tulis tangan, karena halaman ini nanti langsung masuk ke jatah catatan ujianmu. <b>Sebagian besar soal StatProb dimulai dari "distribusi apa ini?"</b>, kalau langkah itu benar, sisanya substitusi.' },
    { t: '5. Kerjakan soal, jangan baca solusi', d: 'Statistika terasa mudah saat dibaca dan sulit saat dikerjakan, inilah yang menjebak. Aturan: setiap topik, kerjakan minimal 10 soal <b>sampai jawaban akhir</b> tanpa melihat solusi. Kuis hanya berisi maksimal 2 soal dalam 60 menit, jadi yang diuji bukan kecepatan, tapi apakah kamu benar-benar bisa menyelesaikannya.' },
    { t: '6. Segarkan Kalkulus 1 sebelum Minggu 3', d: 'Mulai Minggu 3 (Random Variables) kamu butuh integral tentu, integral ganda, turunan, dan aturan rantai secara rutin. Puncaknya di MLE pada Minggu 15 yang murni kalkulus. Luangkan satu akhir pekan di Minggu 1 sampai 2 untuk mengulang ini, jauh lebih murah daripada tersesat sepuluh minggu.' },
    { t: '7. Bangun intuisi lewat simulasi, bukan cuma rumus', d: 'Kamu mahasiswa Ilkom, pakai itu. Tulis 20 baris Python untuk mensimulasikan CLT (ambil rata-rata dari distribusi menceng 10.000 kali, lalu plot histogramnya). Kamu akan <b>melihat</b> CLT terjadi. Lakukan hal sama untuk Bayes, confidence interval, dan hypothesis testing. Ini sekaligus pemanasan untuk Tugas Pemrograman di Minggu 10.' },
    { t: '8. Latih menuliskan interpretasi, bukan hanya menghitung', d: 'Untuk confidence interval dan hypothesis testing, sebagian nilai ada di kalimat kesimpulan. Latih menulis: "Dengan tingkat kepercayaan 95%, kita gagal menolak H₀; tidak cukup bukti untuk menyimpulkan bahwa rerata berbeda dari 70." Presisi bahasa di sini bernilai poin.' },
    { t: '9. Pakai buku Alex Tsun sebagai buku utamamu', d: 'Buku ini ditulis khusus untuk mahasiswa CS, gratis, dan urutan babnya nyaris sama persis dengan silabus kuliah ini (Elements of Probability → RV → Multiple RV → Discrete → Continuous → CLT → MLE/MAP → CI → Hypothesis Testing). Baca babnya <b>sebelum</b> kuliah, bukan sesudah.' },
  ],

  resources: [
    { type: 'book', t: 'Alex Tsun, Probability & Statistics with Applications to Computing (GRATIS)', url: 'https://www.alextsun.com/files/Prob_Stat_for_CS_Book.pdf', note: '⭐ Buku rujukan resmi kuliah ini. Urutan babnya mengikuti silabus. Ini bacaan utamamu.' },
    { type: 'web', t: 'Stanford CS109, Probability for Computer Scientists', url: 'https://chrispiech.github.io/probabilityForComputerScientists/en/', note: '⭐ Rujukan resmi kedua. Punya bagian khusus MLE, MAP, dan Bayesian yang persis materi Minggu 12.' },
    { type: 'yt', t: 'StatQuest with Josh Starmer', url: 'https://www.youtube.com/@statquest', note: '⭐ Terbaik untuk hypothesis testing, p-value, confidence interval, dan distribusi. Penjelasannya membuat konsep yang membingungkan jadi jelas dalam 10 menit.' },
    { type: 'tool', t: 'Seeing Theory (Brown University)', url: 'https://seeing-theory.brown.edu/', note: '⭐ Visualisasi interaktif untuk probabilitas, CLT, confidence interval, dan Bayesian inference. Geser slider-nya dan lihat CLT bekerja.' },
    { type: 'yt', t: '3Blue1Brown, Bayes theorem & probabilitas', url: 'https://www.youtube.com/watch?v=HZGCoVF3YvM', note: 'Video Bayes-nya adalah cara tercepat membangun intuisi geometris. Lanjutkan ke video binomial dan CLT-nya.' },
    { type: 'yt', t: 'jbstatistics', url: 'https://www.youtube.com/@jbstatistics', note: 'Penjelasan bersih dan ringkas untuk distribusi sampling, CI, dan uji hipotesis. Cocok kalau butuh versi lebih formal dari StatQuest.' },
    { type: 'web', t: 'Khan Academy, Statistics & Probability', url: 'https://www.khanacademy.org/math/statistics-probability', note: 'Latihan soal bertingkat dengan umpan balik instan. Bagus untuk mengejar materi dasar yang terasa goyah.' },
    { type: 'yt', t: 'MIT 18.05 Introduction to Probability and Statistics', url: 'https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/', note: 'Materi kuliah + problem set + solusi. Bagian Bayesian inference dan MLE-nya sangat sejalan dengan silabus ini.' },
    { type: 'tool', t: 'Distribution Explorer / Probability Distributions', url: 'https://distribution-explorer.github.io/', note: 'Menjelajah parameter setiap distribusi secara visual. Membantu memahami efek λ, p, μ, σ terhadap bentuk kurva.' },
    { type: 'tool', t: 'Z-table & t-table online', url: 'https://www.z-table.com/', note: 'Untuk latihan sebelum ujian. Tapi pastikan kamu juga terbiasa dengan tabel cetak yang dipakai saat ujian.' },
  ],
};

export default statprob;
