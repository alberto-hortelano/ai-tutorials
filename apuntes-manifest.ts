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
];
