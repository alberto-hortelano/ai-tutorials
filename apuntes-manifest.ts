// Manifest of all apuntes (markdown notes) available in the viewer

export interface Apunte {
  id: string;
  title: string;
  path: string;
  topic: string;
  prereqs?: string[];  // IDs of prerequisite apuntes
}

export const APUNTES: Apunte[] = [
  // ── Conceptos fundamentales ──
  { id: 'info-evento', title: 'I(x) — Informacion de un evento', path: '/apuntes/I(x)-Informacion-de-un-evento.md', topic: 'Fundamentos' },
  { id: 'entropia', title: 'Entropia H(P)', path: '/apuntes/Entropía H(P).md', topic: 'Fundamentos', prereqs: ['info-evento'] },
  { id: 'entropia-cruzada', title: 'Entropia Cruzada H(P, Q)', path: '/apuntes/Entropía Cruzada H(P, Q).md', topic: 'Fundamentos', prereqs: ['entropia'] },
  { id: 'kl-divergence', title: 'KL Divergence', path: '/apuntes/KL-Divergence.md', topic: 'Fundamentos', prereqs: ['entropia', 'entropia-cruzada'] },
  { id: 'mle', title: 'MLE — Maximum Likelihood Estimation', path: '/apuntes/MLE-Maximum-Likelihood-Estimation.md', topic: 'Fundamentos', prereqs: ['kl-divergence'] },
  { id: 'independencia-condicional', title: 'Independencia Condicional', path: '/apuntes/independencia_condicional.md', topic: 'Fundamentos' },
  { id: 'metodos-monte-carlo', title: 'Metodos de Monte Carlo', path: '/apuntes/metodos_monte_carlo.md', topic: 'Fundamentos' },

  // ── Divergencias y metricas ──
  { id: 'jsd', title: 'Divergencia de Jensen-Shannon', path: '/apuntes/Divergencia-de-Jensen-Shannon.md', topic: 'Divergencias', prereqs: ['kl-divergence'] },
  { id: 'wasserstein', title: 'Distancia de Wasserstein', path: '/apuntes/Distancia-de-Wasserstein.md', topic: 'Divergencias', prereqs: ['kl-divergence'] },
  { id: 'f-divergencias', title: 'f-Divergencias', path: '/apuntes/f-Divergencias.md', topic: 'Divergencias', prereqs: ['kl-divergence'] },

  // ── Modelos ──
  { id: 'panorama', title: 'Panorama de Modelos Generativos', path: '/apuntes/panorama_modelos_generativos.md', topic: 'Modelos' },
  { id: 'autoregresivos', title: 'Modelos Autoregresivos', path: '/apuntes/modelos_autoregresivos.md', topic: 'Modelos', prereqs: ['mle', 'independencia-condicional'] },
  { id: 'vae', title: 'Variational Autoencoders', path: '/apuntes/vae.md', topic: 'Modelos', prereqs: ['kl-divergence', 'mle'] },
  { id: 'flujos', title: 'Flujos Normalizantes', path: '/apuntes/flujos_normalizantes.md', topic: 'Modelos', prereqs: ['mle'] },
  { id: 'gans', title: 'GANs', path: '/apuntes/gans.md', topic: 'Modelos', prereqs: ['kl-divergence', 'jsd'] },
  { id: 'ebm', title: 'Modelos Basados en Energia', path: '/apuntes/Modelos-Basados-en-Energia.md', topic: 'Modelos', prereqs: ['mle'] },
  { id: 'score-fn', title: 'Funcion Score', path: '/apuntes/Funcion-Score.md', topic: 'Modelos', prereqs: ['ebm'] },
  { id: 'score-matching', title: 'Score Matching', path: '/apuntes/score_matching.md', topic: 'Modelos', prereqs: ['score-fn'] },
  { id: 'difusion', title: 'Modelos de Difusion', path: '/apuntes/modelos_difusion.md', topic: 'Modelos', prereqs: ['score-matching', 'vae'] },

  // ── Cheat sheet ──
  { id: 'cheat-sheet', title: 'Cheat Sheet', path: '/apuntes/cheat-sheet.md', topic: 'Referencia' },

  // ── PS1 ──
  { id: 'ps1-ex1', title: 'PS1 Ex1 — MLE y KL', path: '/apuntes/PS-1/ex1.md', topic: 'PS1', prereqs: ['mle', 'kl-divergence'] },
  { id: 'ps1-ex2', title: 'PS1 Ex2 — Naive Bayes', path: '/apuntes/PS-1/ex2.md', topic: 'PS1', prereqs: ['mle', 'independencia-condicional'] },
  { id: 'ps1-ex3', title: 'PS1 Ex3 — Indep. Condicional', path: '/apuntes/PS-1/ex3.md', topic: 'PS1', prereqs: ['independencia-condicional'] },
  { id: 'ps1-ex4', title: 'PS1 Ex4 — Autoregresivos', path: '/apuntes/PS-1/ex4.md', topic: 'PS1', prereqs: ['autoregresivos'] },
  { id: 'ps1-ex5', title: 'PS1 Ex5 — Monte Carlo', path: '/apuntes/PS-1/ex5.md', topic: 'PS1', prereqs: ['metodos-monte-carlo'] },
  { id: 'ps1-ex6', title: 'PS1 Ex6 — Codigo', path: '/apuntes/PS-1/ex6.md', topic: 'PS1', prereqs: ['autoregresivos'] },

  // ── PS2 ──
  { id: 'ps2-ex1', title: 'PS2 Ex1 — VAE', path: '/apuntes/PS-2/ex1.md', topic: 'PS2', prereqs: ['vae'] },
  { id: 'ps2-ex2', title: 'PS2 Ex2 — GMVAE', path: '/apuntes/PS-2/ex2.md', topic: 'PS2', prereqs: ['vae'] },
  { id: 'ps2-ex3', title: 'PS2 Ex3 — IWAE', path: '/apuntes/PS-2/ex3.md', topic: 'PS2', prereqs: ['vae', 'metodos-monte-carlo'] },
  { id: 'ps2-ex4', title: 'PS2 Ex4 — Semi-Supervised VAE', path: '/apuntes/PS-2/ex4.md', topic: 'PS2', prereqs: ['vae'] },

  // ── PS3 ──
  { id: 'ps3-ex1', title: 'PS3 Ex1 — Normalizing Flows', path: '/apuntes/PS-3/ex1.md', topic: 'PS3', prereqs: ['flujos'] },
  { id: 'ps3-ex2', title: 'PS3 Ex2 — GANs', path: '/apuntes/PS-3/ex2.md', topic: 'PS3', prereqs: ['gans'] },
  { id: 'ps3-ex3', title: 'PS3 Ex3 — Divergence Minimization', path: '/apuntes/PS-3/ex3.md', topic: 'PS3', prereqs: ['gans', 'f-divergencias'] },
  { id: 'ps3-ex4', title: 'PS3 Ex4 — Conditional GAN', path: '/apuntes/PS-3/ex4.md', topic: 'PS3', prereqs: ['gans'] },
  { id: 'ps3-ex5', title: 'PS3 Ex5 — Wasserstein GAN', path: '/apuntes/PS-3/ex5.md', topic: 'PS3', prereqs: ['gans', 'wasserstein'] },

  // ── PS4 ──
  { id: 'ps4-ex1', title: 'PS4 Ex1 — Score Matching', path: '/apuntes/PS-4/ex1.md', topic: 'PS4', prereqs: ['score-matching'] },
  { id: 'ps4-ex2', title: 'PS4 Ex2 — Concrete Score Matching', path: '/apuntes/PS-4/ex2.md', topic: 'PS4', prereqs: ['score-matching'] },
  { id: 'ps4-ex3', title: 'PS4 Ex3 — Score-Based Diffusion', path: '/apuntes/PS-4/ex3.md', topic: 'PS4', prereqs: ['score-matching'] },
  { id: 'ps4-ex4', title: 'PS4 Ex4 — DDPM y DDIM', path: '/apuntes/PS-4/ex4.md', topic: 'PS4', prereqs: ['difusion'] },
  { id: 'ps4-ex5', title: 'PS4 Ex5 — Inpainting', path: '/apuntes/PS-4/ex5.md', topic: 'PS4', prereqs: ['difusion'] },
];
