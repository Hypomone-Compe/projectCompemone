/* ==========================================================================
   ICAIC: 95 topik inti + rencana belajar akhir pekan.

   TOPIK_ICAIC & PELATIHAN_ICAIC dibangkitkan dari
   rencana-tutorials-gemastik-icaic.xlsx (lembar "core topics" & "jadwal
   pelatihan icaic"). SESI_ICAIC adalah rencana akhir pekan: 20 sesi dari
   24 Okt sampai 22 Nov 2026 yang menutup ke-95 topik sebelum H-2 pekan UAS
   (26 Nov). Urutannya mengikuti pelatihan Jumat: topik yang baru dibahas
   di kelas dikunci di akhir pekan sesudahnya.
   ========================================================================== */

export interface TopikIcaic {
  no: number;
  nama: string;
  /** Kompetensi yang diharapkan. */
  isi: string;
  kategori: string;
  /** Ditandai "Studi & Review Mandiri" di berkas: tidak dibahas di pelatihan. */
  mandiri: boolean;
}

export const TOPIK_ICAIC: TopikIcaic[] = [
  { no: 1, nama: "Linear algebra", kategori: "Math", mandiri: false, isi: "Vectors, matrices, tensors, dot products, matrix multiplication, norms, rank, projections, eigenvalues/eigenvectors, and singular value decomposition." },
  { no: 2, nama: "Calculus and automatic differentiation", kategori: "Math", mandiri: true, isi: "Derivatives, partial derivatives, gradients, chain rule, Jacobian/Hessian intuition, computational graphs, and backpropagation." },
  { no: 3, nama: "Probability", kategori: "Math", mandiri: false, isi: "Random variables, common distributions, expectation, variance, covariance, conditional probability, Bayes’ rule, independence, and sampling." },
  { no: 4, nama: "Statistics and estimation", kategori: "Math", mandiri: true, isi: "Likelihood, maximum likelihood, bias-variance trade-off, confidence intervals, bootstrap, and basic hypothesis testing." },
  { no: 5, nama: "Information theory", kategori: "Math", mandiri: false, isi: "Entropy, cross-entropy, KL divergence, mutual information, and their use in learning objectives." },
  { no: 6, nama: "Optimization", kategori: "Math", mandiri: false, isi: "Gradient descent, stochastic and mini-batch optimization, momentum, Adam/AdamW, learning-rate schedules, constrained optimization intuition, and convergence diagnostics." },
  { no: 7, nama: "Numerical computation", kategori: "Math", mandiri: true, isi: "Floating-point behavior, numerical stability, vectorization, memory use, computational complexity, and stable implementations of common operations." },
  { no: 8, nama: "Discrete mathematics and graphs", kategori: "Math", mandiri: true, isi: "Sets, relations, combinatorics, recursion, dynamic programming, graph terminology, paths, connectivity, and adjacency representations." },
  { no: 9, nama: "Python programming", kategori: "Programming", mandiri: true, isi: "Control flow, functions, modules, classes, comprehensions, iterators, exceptions, file handling, and standard data structures." },
  { no: 10, nama: "NumPy and tensor manipulation", kategori: "Programming", mandiri: true, isi: "Indexing, broadcasting, reshaping, masking, vectorized computation, reductions, and multi-dimensional array operations." },
  { no: 11, nama: "Pandas and structured data", kategori: "Programming", mandiri: true, isi: "DataFrames, joins, grouping, aggregation, missing values, categorical variables, time indices, and efficient input/output." },
  { no: 12, nama: "Visualization", kategori: "Programming", mandiri: true, isi: "Use Matplotlib and Seaborn to inspect distributions, learning curves, errors, embeddings, predictions, and model behavior." },
  { no: 13, nama: "Scikit-learn and boosting libraries", kategori: "Programming", mandiri: true, isi: "Build pipelines and use scikit-learn, XGBoost, LightGBM, or CatBoost appropriately for classical ML tasks." },
  { no: 14, nama: "PyTorch fundamentals", kategori: "Programming", mandiri: true, isi: "Tensors, datasets and data loaders, modules, losses, optimizers, device placement, training loops, evaluation mode, and checkpointing." },
  { no: 15, nama: "CPU/GPU execution", kategori: "Programming", mandiri: true, isi: "Move data and models correctly, manage device memory, choose batch sizes, use mixed precision when appropriate, and diagnose bottlenecks." },
  { no: 16, nama: "Data processing", kategori: "Programming", mandiri: true, isi: "Normalization, standardization, imputation, padding, masking, tokenization, patching, resampling, augmentation, and variable-length data handling." },
  { no: 17, nama: "Feature engineering", kategori: "Programming", mandiri: true, isi: "Create compact, informative features from tabular, categorical, image, text, audio, graph, and time-series data." },
  { no: 18, nama: "Validation and experimental design", kategori: "Programming", mandiri: true, isi: "Train/validation/test splitting, cross-validation, grouped and temporal splits, ablation studies, and prevention of data leakage." },
  { no: 19, nama: "Metrics and error analysis", kategori: "Programming", mandiri: true, isi: "Select, implement, and interpret task-appropriate metrics; inspect confusion matrices, ROC/PR curves, calibration, and subgroup performance." },
  { no: 20, nama: "Hyperparameter optimization", kategori: "Programming", mandiri: true, isi: "Manual search, grid/random search, efficient search strategies, early stopping, and fair model comparison." },
  { no: 21, nama: "Reproducibility and code quality", kategori: "Programming", mandiri: true, isi: "Random seeds, deterministic behavior, configuration management, logging, assertions, tests, clean notebooks, and reusable functions." },
  { no: 22, nama: "Intelligent agents", kategori: "AI Foundations", mandiri: true, isi: "Agents, environments, observations, actions, goals, utility, rationality, and the perception-action loop." },
  { no: 23, nama: "Uninformed search", kategori: "AI Foundations", mandiri: true, isi: "Breadth-first, depth-first, uniform-cost, iterative deepening, completeness, optimality, and complexity." },
  { no: 24, nama: "Informed and heuristic search", kategori: "AI Foundations", mandiri: true, isi: "Greedy best-first search, A*, admissibility, consistency, heuristic design, and beam search." },
  { no: 25, nama: "Adversarial search", kategori: "AI Foundations", mandiri: false, isi: "Minimax, alpha-beta pruning, evaluation functions, stochastic games, and search-depth trade-offs." },
  { no: 26, nama: "Constraint satisfaction", kategori: "AI Foundations", mandiri: true, isi: "Variables, domains, constraints, backtracking, propagation, ordering heuristics, and local search." },
  { no: 27, nama: "Problem formulation", kategori: "Statistical Learning", mandiri: true, isi: "Regression, classification, ranking, clustering, density estimation, anomaly detection, and structured prediction." },
  { no: 28, nama: "Linear regression", kategori: "Statistical Learning", mandiri: true, isi: "Least squares, feature transformations, residual analysis, regularization, and interpretation." },
  { no: 29, nama: "Logistic regression", kategori: "Statistical Learning", mandiri: true, isi: "Log-odds, cross-entropy, decision thresholds, multiclass extensions, and calibration." },
  { no: 30, nama: "Regularization", kategori: "Statistical Learning", mandiri: true, isi: "L1 and L2 penalties, sparsity, weight decay, model capacity, and the bias-variance trade-off." },
  { no: 31, nama: "K-nearest neighbors", kategori: "Statistical Learning", mandiri: true, isi: "Distance metrics, scaling, neighborhood size, classification/regression, and computational trade-offs." },
  { no: 32, nama: "Decision trees", kategori: "Statistical Learning", mandiri: true, isi: "Splitting criteria, pruning, depth control, missing values, and interpretability." },
  { no: 33, nama: "Ensembles", kategori: "Statistical Learning", mandiri: false, isi: "Bagging, random forests, gradient boosting, stacking, and when ensembles improve robustness." },
  { no: 34, nama: "Support vector machines and kernels", kategori: "Statistical Learning", mandiri: true, isi: "Margins, soft-margin SVMs, kernel functions, and scaling considerations." },
  { no: 35, nama: "Model evaluation", kategori: "Statistical Learning", mandiri: true, isi: "Accuracy, precision, recall, F1, log loss, ROC-AUC, PR-AUC, ranking metrics, regression errors, and task-specific metrics." },
  { no: 36, nama: "Class imbalance and cost-sensitive learning", kategori: "Statistical Learning", mandiri: false, isi: "Resampling, class weights, threshold selection, focal-style objectives, and asymmetric error costs." },
  { no: 37, nama: "Clustering", kategori: "Statistical Learning", mandiri: true, isi: "K-means, hierarchical clustering, DBSCAN, spectral clustering, assumptions, and cluster validation." },
  { no: 38, nama: "Dimensionality reduction", kategori: "Statistical Learning", mandiri: false, isi: "PCA, t-SNE, UMAP, feature selection, visualization, and limits of low-dimensional projections." },
  { no: 39, nama: "Perceptrons and multilayer networks", kategori: "Deep Learning", mandiri: false, isi: "Perceptron basics, multilayer perceptrons, universal approximation intuition, and network capacity." },
  { no: 40, nama: "Activations and losses", kategori: "Deep Learning", mandiri: false, isi: "ReLU, sigmoid, tanh, softmax, MSE, MAE, cross-entropy, margin losses, and task-appropriate objectives." },
  { no: 41, nama: "Backpropagation", kategori: "Deep Learning", mandiri: true, isi: "Forward and backward passes, computational graphs, gradient flow, and common implementation errors." },
  { no: 42, nama: "Optimization for deep learning", kategori: "Deep Learning", mandiri: false, isi: "Apply the optimization methods in Section 3 to neural networks; learning-rate warmup and gradient clipping." },
  { no: 43, nama: "Initialization and normalization", kategori: "Deep Learning", mandiri: true, isi: "Weight initialization, batch normalization, layer normalization, and their effects on training." },
  { no: 44, nama: "Regularization", kategori: "Deep Learning", mandiri: false, isi: "Dropout, early stopping, weight decay, augmentation, label smoothing, and model selection." },
  { no: 45, nama: "Embeddings and pooling", kategori: "Deep Learning", mandiri: false, isi: "Learned representations for text, images, audio, categories, and graphs; max, average, and attention pooling." },
  { no: 46, nama: "Convolutional networks", kategori: "Deep Learning", mandiri: false, isi: "Convolution, stride, padding, receptive fields, pooling, residual connections, and image/time-series use." },
  { no: 47, nama: "Recurrent sequence models", kategori: "Deep Learning", mandiri: false, isi: "RNNs, LSTMs, GRUs, hidden state, sequence batching, teacher forcing, and vanishing/exploding gradients." },
  { no: 48, nama: "Attention and transformers", kategori: "Deep Learning", mandiri: false, isi: "Attention mechanisms, self-attention, encoder/decoder blocks, masking, and positional information." },
  { no: 49, nama: "Autoencoders", kategori: "Deep Learning", mandiri: false, isi: "Undercomplete, denoising, and variational autoencoders for representation learning and generation." },
  { no: 50, nama: "Transfer learning and fine-tuning", kategori: "Deep Learning", mandiri: false, isi: "Pretrained encoders, feature extraction, full fine-tuning, parameter-efficient fine-tuning, and catastrophic forgetting." },
  { no: 51, nama: "Training diagnosis", kategori: "Deep Learning", mandiri: false, isi: "Learning curves, gradient checks, dead activations, unstable loss, overfitting, underfitting, and systematic ablations." },
  { no: 52, nama: "Multi-armed bandits", kategori: "RL", mandiri: false, isi: "Exploration-exploitation trade-off, epsilon-greedy methods, upper-confidence ideas, and regret intuition." },
  { no: 53, nama: "Markov decision processes", kategori: "RL", mandiri: false, isi: "States, actions, transitions, rewards, policies, returns, discounting, and episodic/continuing tasks." },
  { no: 54, nama: "Value functions and Bellman equations", kategori: "RL", mandiri: false, isi: "State/action values, Bellman expectation and optimality equations, and fixed-point intuition." },
  { no: 55, nama: "Dynamic programming", kategori: "RL", mandiri: false, isi: "Policy evaluation, policy iteration, and value iteration when a model is known." },
  { no: 56, nama: "Monte Carlo and temporal-difference learning", kategori: "RL", mandiri: false, isi: "Prediction from experience, bootstrapping, TD error, n-step returns, and eligibility-trace intuition." },
  { no: 57, nama: "Control methods", kategori: "RL", mandiri: false, isi: "SARSA, Q-learning, on-policy vs off-policy learning, and exploration strategies." },
  { no: 58, nama: "RL evaluation and reproducibility", kategori: "RL", mandiri: false, isi: "Apply evaluation and reproducibility methods from Section 4; multiple seeds, return distributions, sample efficiency, and stability." },
  { no: 59, nama: "Image fundamentals", kategori: "Comp. Vis.", mandiri: false, isi: "Pixels, channels, color spaces, resizing, interpolation, normalization, and common image formats." },
  { no: 60, nama: "Convolutional layers", kategori: "Comp. Vis.", mandiri: false, isi: "Apply the convolutional networks in Section 7 to images; kernels and feature maps." },
  { no: 61, nama: "Image classification", kategori: "Comp. Vis.", mandiri: false, isi: "Training classifiers, transfer learning, pretrained encoders such as ResNet, and error analysis." },
  { no: 62, nama: "Object detection", kategori: "Comp. Vis.", mandiri: false, isi: "Bounding boxes, IoU, non-maximum suppression, and practical use of YOLO, SSD, and DETR-style models." },
  { no: 63, nama: "Image segmentation", kategori: "Comp. Vis.", mandiri: false, isi: "Semantic/instance segmentation, pixel-wise losses, U-Net-style models, and overlap metrics." },
  { no: 64, nama: "Image augmentation", kategori: "Comp. Vis.", mandiri: false, isi: "Cropping, flipping, geometric and photometric transforms, mix-based augmentations, and label consistency." },
  { no: 65, nama: "Vision-language encoders", kategori: "Comp. Vis.", mandiri: false, isi: "Joint image-text embeddings, CLIP-style similarity, zero-shot classification, and retrieval." },
  { no: 66, nama: "Generative vision", kategori: "Comp. Vis.", mandiri: false, isi: "GANs, variational methods, diffusion models, conditioning, sampling, and evaluation limitations." },
  { no: 67, nama: "Text preprocessing and tokenization", kategori: "NLP", mandiri: false, isi: "Apply data processing from Section 4 to text; sentence/word/subword tokenization, vocabularies, and sequence length." },
  { no: 68, nama: "Text representations", kategori: "NLP", mandiri: false, isi: "Bag-of-words, TF-IDF, static embeddings, contextual embeddings, and similarity measures." },
  { no: 69, nama: "Text classification and sequence labeling", kategori: "NLP", mandiri: false, isi: "Document classification, token classification, class imbalance, and evaluation." },
  { no: 70, nama: "Pretrained text encoders", kategori: "NLP", mandiri: false, isi: "BERT-style models, masked-language-model representations, pooling, and fine-tuning." },
  { no: 71, nama: "Language modeling", kategori: "NLP", mandiri: false, isi: "Autoregressive and masked objectives, likelihood, perplexity, generation, and decoding." },
  { no: 72, nama: "Encoder-decoder models", kategori: "NLP", mandiri: false, isi: "Sequence-to-sequence learning, attention, machine translation, summarization, and multimodal generation." },
  { no: 73, nama: "Audio and signal representations", kategori: "Audio", mandiri: false, isi: "Waveforms, sampling rate, resampling, framing, spectrograms, Fourier transforms, and normalization." },
  { no: 74, nama: "Speech and audio models", kategori: "Audio", mandiri: false, isi: "Practical use of models such as Whisper, Qwen-Audio, and Voxtral when provided in the contest environment." },
  { no: 75, nama: "Transformer mechanics", kategori: "LLM", mandiri: false, isi: "Scaled dot-product attention, multi-head attention, masking, positional encoding, residual connections, and normalization." },
  { no: 76, nama: "Architecture families", kategori: "LLM", mandiri: false, isi: "Encoder-only, decoder-only, encoder-decoder, mixture-of-experts intuition, and modality-specific transformers." },
  { no: 77, nama: "Tokenization and context", kategori: "LLM", mandiri: false, isi: "Apply the tokenization methods in Section 10 to foundation models; context windows, truncation, attention masks, and prompt construction." },
  { no: 78, nama: "Pretraining objectives", kategori: "LLM", mandiri: false, isi: "Next-token prediction, masked modeling, denoising, instruction tuning, and their behavioral consequences." },
  { no: 79, nama: "Prompt engineering", kategori: "LLM", mandiri: false, isi: "Zero-shot/few-shot prompting, role and instruction design, examples, decomposition, context selection, and prompt evaluation." },
  { no: 80, nama: "Structured generation and decoding", kategori: "LLM", mandiri: false, isi: "Greedy, beam, sampling, temperature/top-p, constrained outputs, validation, repair, and stopping criteria." },
  { no: 81, nama: "Fine-tuning and PEFT", kategori: "LLM", mandiri: false, isi: "Supervised fine-tuning, LoRA/QLoRA, adapters, prompt tuning, dataset construction, and hyperparameter sensitivity." },
  { no: 82, nama: "LLM evaluation", kategori: "LLM", mandiri: false, isi: "Task accuracy, exact match, validity, calibration, hallucination, robustness, preference evaluation, and contamination risks." },
  { no: 83, nama: "LLM safety and security", kategori: "LLM", mandiri: false, isi: "Prompt injection, jailbreaks, data leakage, unsafe outputs, tool misuse, and defensive validation." },
  { no: 84, nama: "Use of APIs and provided models", kategori: "LLM", mandiri: false, isi: "Use models and APIs provided for the task." },
  { no: 85, nama: "Sampling and segmentation", kategori: "Time Series", mandiri: false, isi: "Sampling frequency, windows, overlap, resampling, synchronization, variable-length sequences, and event segmentation." },
  { no: 86, nama: "Preprocessing", kategori: "Time Series", mandiri: false, isi: "Apply data processing from Section 4 to time series; filtering, detrending, outliers, and leakage-safe transformations." },
  { no: 87, nama: "Statistical and frequency-domain features", kategori: "Time Series", mandiri: false, isi: "Moments, extrema, autocorrelation, spectral energy, dominant frequencies, and Fourier-based features." },
  { no: 88, nama: "Neural sequence models", kategori: "Time Series", mandiri: false, isi: "RNN/LSTM/GRU, temporal CNNs, transformers, sequence-to-one, sequence-to-sequence, and multivariate inputs." },
  { no: 89, nama: "Multi-step forecasting", kategori: "Time Series", mandiri: false, isi: "Direct and autoregressive prediction, teacher forcing, rollout, exposure bias, error accumulation, and horizon selection." },
  { no: 90, nama: "Temporal validation and metrics", kategori: "Time Series", mandiri: false, isi: "Chronological splits, rolling evaluation, event-based splits, RMSE/MAE, scale-normalized metrics, and leakage control." },
  { no: 91, nama: "Graph representations", kategori: "Graph ML", mandiri: false, isi: "Nodes, edges, attributes, directed/undirected graphs, adjacency matrices, edge lists, sparse tensors, and batching." },
  { no: 92, nama: "Message passing", kategori: "Graph ML", mandiri: false, isi: "Neighborhood aggregation, update functions, receptive fields, permutation invariance, and oversmoothing intuition." },
  { no: 93, nama: "GNN architectures", kategori: "Graph ML", mandiri: false, isi: "GCN, GraphSAGE, GAT, edge-aware message passing, residual connections, and normalization." },
  { no: 94, nama: "Graph learning tasks", kategori: "Graph ML", mandiri: false, isi: "Node classification/regression, link prediction, edge prediction, graph classification/regression, and graph embeddings." },
  { no: 95, nama: "Graph construction", kategori: "Graph ML", mandiri: false, isi: "Building edges from physical relations, similarity, proximity, domain knowledge, and learned connectivity." },
];

export interface PelatihanIcaic {
  hari: string;
  waktu: string;
  ruang: string;
  pengajar: string;
  topik: string;
  soal: string;
}

/** Pelatihan Jumat di kampus (referensi; tidak masuk jadwal akhir pekan). */
export const PELATIHAN_ICAIC: PelatihanIcaic[] = [
  {"hari": "Jumat, 2 Oktober 2026", "waktu": "13:30 - 14:30", "ruang": "A1.54", "pengajar": "Pak Febrian Rachmadi", "topik": "CompVis: Augmentation (Cropping, flipping, geometric and photometric transforms, mix-based augmentations, and label consistency.), Apply the convolutional networks in Section 7 to images; kernels and feature maps, Training classifiers, transfer learning, pretrained encoders such as ResNet, and error analysis", "soal": "Soal Simulasi ICAIC 1"},
  {"hari": "Jumat, 2 Oktober 2026", "waktu": "14:30 - 16:00", "ruang": "A1.54", "pengajar": "Pak Febrian Rachmadi", "topik": "CompVis: Bounding boxes, IoU, non-maximum suppression, and practical use of YOLO, SSD, and DETR-style models, Semantic/instance segmentation, pixel-wise losses, U-Net-style models, and overlap metrics.", "soal": ""},
  {"hari": "Jumat, 9 Oktober 2026", "waktu": "10:00 - 11:30", "ruang": "A1.54", "pengajar": "Pak Ikhsanul Habibie", "topik": "CompVis: VLM, Joint image-text embeddings, CLIP-style similarity, zero-shot classification, and retrieval", "soal": "Soal Simulasi ICAIC 2"},
  {"hari": "Jumat, 9 Oktober 2026", "waktu": "13:30 - 14:50", "ruang": "A1.54", "pengajar": "Pak Ikhsanul Habibie", "topik": "CompVis: GANs, variational methods, diffusion models, conditioning, sampling, and evaluation limitations.", "soal": ""},
  {"hari": "Sabtu, 17 Oktober 2026", "waktu": "09:00 - 10:00", "ruang": "A6.02", "pengajar": "Mas Abel (Alumni IK 22)", "topik": "TimeSeries: Sampling frequency, windows, overlap, resampling, synchronization, variable-length sequences, and event segmentation, Apply data processing from Section 4 to time series; filtering, detrending, outliers, and leakage-safe transformations", "soal": "Soal Simulasi ICAIC 3"},
  {"hari": "Sabtu, 17 Oktober 2026", "waktu": "10:00 - 12:00", "ruang": "A6.02", "pengajar": "Mas Abel (Alumni IK 22)", "topik": "TimeSeries: RNN/LSTM/GRU, temporal CNNs, transformers, sequence-to-one, sequence-to-sequence, and multivariate inputs, direct and autoregressive prediction, teacher forcing, rollout, exposure bias, error accumulation, and horizon selection.", "soal": ""},
  {"hari": "Jumat, 23 Oktober 2026", "waktu": "10:00 - 11:15", "ruang": "A1.54", "pengajar": "Pak Vektor", "topik": "RL: States, actions, transitions, rewards, policies, returns, discounting, and episodic/continuing tasks, State/action values, Bellman expectation and optimality equations, and fixed-point intuition.", "soal": "Soal Simulasi ICAIC 4"},
  {"hari": "Jumat, 23 Oktober 2026", "waktu": "13:30 - 15:00", "ruang": "A1.54", "pengajar": "Pak Vektor", "topik": "RL: States, actions, transitions, rewards, policies, returns, discounting, and episodic/continuing tasks, State/action values, Bellman expectation and optimality equations, and fixed-point intuition.", "soal": ""},
  {"hari": "Jumat, 30 Oktober 2026", "waktu": "10:00 - 11:15", "ruang": "A1.54", "pengajar": "Bu Laksmita", "topik": "Matrices, rank, eigenvalues/eigenvectors, and singular value decomposition, PCA, t-SNE, UMAP, feature selection, and limits of low-dimensional projections.", "soal": "Soal Simulasi ICAIC 5"},
  {"hari": "Jumat, 30 Oktober 2026", "waktu": "13:30 - 15:00", "ruang": "A1.54", "pengajar": "Bu Laksmita", "topik": "Matrices, rank, eigenvalues/eigenvectors, and singular value decomposition, PCA, t-SNE, UMAP, feature selection, and limits of low-dimensional projections.", "soal": ""},
  {"hari": "Jumat, 6 November 2026", "waktu": "10:00 - 11:15", "ruang": "A1.54", "pengajar": "Pak Ikhsanul Habibie", "topik": "GraphML: Node classification/regression, link prediction, edge prediction, graph classification/regression, and graph embeddings", "soal": "Soal Simulasi ICAIC 6"},
  {"hari": "Jumat, 6 November 2026", "waktu": "13:30 - 14:50", "ruang": "A1.54", "pengajar": "Pak Ikhsanul Habibie", "topik": "GraphML: GCN, GraphSAGE, GAT, edge-aware message passing, residual connections, and normalization. Building edges from physical relations, similarity, proximity, domain knowledge, and learned connectivity.", "soal": ""},
  {"hari": "Jumat, 13 November 2026", "waktu": "10:00 - 11:30", "ruang": "A1.54", "pengajar": "Pak Rahmad Mahendra", "topik": "NLP: contextual embeddings, and similarity measures, BERT-style models, masked-language-model representations, pooling, and fine-tuning, Autoregressive and masked objectives, likelihood, perplexity, generation, and decoding, sequence-to-sequence learning, attention, machine translation, summarization, and multimodal generation.", "soal": "Soal Simulasi ICAIC 7"},
  {"hari": "Jumat, 13 November 2026", "waktu": "13:30 - 15:30", "ruang": "A1.54", "pengajar": "Pak Rahmad Mahendra", "topik": "LLM: Use models and APIs provided for the task., Supervised fine-tuning, LoRA/QLoRA, adapters, prompt tuning, dataset construction, and hyperparameter sensitivity", "soal": ""},
  {"hari": "Jumat, 20 November 2026", "waktu": "10:00 - 11:30", "ruang": "A1.54", "pengajar": "Pak Alfan", "topik": "Audio: Waveforms, sampling rate, resampling, framing, spectrograms, Fourier transforms, and normalization, practical use of models such as Whisper, Qwen-Audio, and Voxtral when provided in the contest environment.", "soal": "Soal Simulasi ICAIC 8"},
  {"hari": "Jumat, 20 November 2026", "waktu": "13:30 - 15:30", "ruang": "A1.54", "pengajar": "Pak Alfan", "topik": "Audio: Waveforms, sampling rate, resampling, framing, spectrograms, Fourier transforms, and normalization, practical use of models such as Whisper, Qwen-Audio, and Voxtral when provided in the contest environment.", "soal": ""},
  {"hari": "Jumat, 27 November 2026", "waktu": "10:00 - 11:30", "ruang": "A1.54", "pengajar": "Pak Adila", "topik": "Minimax, alpha-beta pruning, evaluation functions, stochastic games, and search-depth trade-offs.", "soal": "Soal Simulasi ICAIC 9"},
  {"hari": "Jumat, 27 November 2026", "waktu": "13:30 - 15:30", "ruang": "A1.54", "pengajar": "Pak Adila", "topik": "Gradient descent, stochastic and mini-batch optimization, momentum, Adam/AdamW, learning-rate schedules, constrained optimization intuition, and convergence diagnostics: Learning curves, gradient checks, dead activations, unstable loss, overfitting, underfitting, and systematic ablations.", "soal": ""},
];

export interface SesiIcaic {
  tanggal: string;
  sesi: 'pagi' | 'siang';
  judul: string;
  /** Nomor topik; kosong = simulasi & review topik lemah. */
  topik: number[];
}

const r = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

export const SESI_ICAIC: SesiIcaic[] = [
  { tanggal: '2026-10-24', sesi: 'pagi', judul: "Reinforcement Learning (sambung pelatihan 23 Okt)", topik: r(52, 58) },
  { tanggal: '2026-10-24', sesi: 'siang', judul: "Matematika I: aljabar linear, kalkulus, probabilitas, statistik", topik: r(1, 4) },
  { tanggal: '2026-10-25', sesi: 'pagi', judul: "Matematika II + AI Foundations: agen & pencarian tanpa informasi", topik: [...r(5, 8), ...r(22, 23)] },
  { tanggal: '2026-10-25', sesi: 'siang', judul: "Pencarian berinformasi, adversarial, CSP + awal Statistical Learning", topik: [...r(24, 26), ...r(27, 28)] },
  { tanggal: '2026-10-31', sesi: 'pagi', judul: "Statistical Learning I: logistic regression sampai SVM", topik: r(29, 34) },
  { tanggal: '2026-10-31', sesi: 'siang', judul: "Statistical Learning II: evaluasi, imbalance, clustering, reduksi dimensi (sambung pelatihan 30 Okt)", topik: r(35, 38) },
  { tanggal: '2026-11-01', sesi: 'pagi', judul: "Pemrograman I: Python, NumPy, Pandas, visualisasi, scikit-learn", topik: r(9, 13) },
  { tanggal: '2026-11-01', sesi: 'siang', judul: "Pemrograman II: PyTorch, CPU/GPU, data processing, feature engineering", topik: r(14, 17) },
  { tanggal: '2026-11-07', sesi: 'pagi', judul: "Graph ML (sambung pelatihan 6 Nov)", topik: r(91, 95) },
  { tanggal: '2026-11-07', sesi: 'siang', judul: "Pemrograman III: validasi, metrik, tuning, reproduktibilitas", topik: r(18, 21) },
  { tanggal: '2026-11-08', sesi: 'pagi', judul: "Deep Learning I: perceptron sampai regularisasi", topik: r(39, 44) },
  { tanggal: '2026-11-08', sesi: 'siang', judul: "Deep Learning II: embedding, CNN, RNN, transformer, autoencoder, transfer, diagnosis", topik: r(45, 51) },
  { tanggal: '2026-11-14', sesi: 'pagi', judul: "NLP (sambung pelatihan 13 Nov)", topik: r(67, 72) },
  { tanggal: '2026-11-14', sesi: 'siang', judul: "LLM I: transformer, arsitektur, tokenisasi, pretraining, prompting", topik: r(75, 79) },
  { tanggal: '2026-11-15', sesi: 'pagi', judul: "LLM II: decoding, PEFT, evaluasi, keamanan, API", topik: r(80, 84) },
  { tanggal: '2026-11-15', sesi: 'siang', judul: "Computer Vision I: citra, konvolusi, klasifikasi, deteksi", topik: r(59, 62) },
  { tanggal: '2026-11-21', sesi: 'pagi', judul: "Audio (sambung pelatihan 20 Nov) + Computer Vision II", topik: [...r(73, 74), ...r(63, 66)] },
  { tanggal: '2026-11-21', sesi: 'siang', judul: "Time Series", topik: r(85, 90) },
  { tanggal: '2026-11-22', sesi: 'pagi', judul: "Simulasi penuh: Soal Simulasi ICAIC 1–8, waktu seperti lomba", topik: [] },
  { tanggal: '2026-11-22', sesi: 'siang', judul: "Review topik yang belum ditandai paham + catatan satu halaman per kategori", topik: [] },
];

export const sesiIcaicPada = (tanggal: string) => SESI_ICAIC.filter(s => s.tanggal === tanggal);
