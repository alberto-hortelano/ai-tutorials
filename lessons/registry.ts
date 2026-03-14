// Lesson registry — titles, descriptions, module metadata, navigation
// Quiz data lives in ./quizzes/

import { getLang } from '../engine/i18n';
import type { Lang, LessonEntry, LessonTag, QuizQuestion } from '../engine/types';
import { getQuizData as _getQuizData } from './quizzes';

// ── Titles by language ──

const LESSON_TITLES: Record<Lang, Record<string, string>> = {
  es: {
    'tensores': 'Tensores: La Estructura de Datos de Deep Learning',
    'modelos-generativos': 'Modelos Generativos: la Gran Idea',
    'kl-divergence-mle': 'KL Divergence y MLE',
    'independencia-condicional': 'Independencia Condicional',
    'modelos-autoregresivos': 'Modelos Autoregresivos',
    'estimacion-monte-carlo': 'Estimaci\u00f3n Monte Carlo',
    'variables-latentes': 'Variables Latentes',
    'elbo': 'El ELBO',
    'vae-encoder-decoder': 'VAE: Encoder y Decoder',
    'gmvae': 'Gaussian Mixture VAE',
    'iwae': 'IWAE: Cotas m\u00e1s Ajustadas',
    'ssvae': 'Semi-Supervised VAE',
    'cambio-de-variables': 'Cambio de Variables',
    'arquitecturas-flujos': 'Arquitecturas de Flujos',
    'maf-vs-iaf': 'MAF vs IAF',
    'gans-min-max': 'GANs: el Juego Min-Max',
    'entrenamiento-gans': 'Entrenamiento de GANs',
    'f-divergencias': 'f-Divergencias y Teor\u00eda',
    'conditional-gan': 'Conditional GAN',
    'wasserstein-gan': 'Wasserstein GAN',
    'energy-based-models': 'Energy-Based Models',
    'score-matching': 'Score Matching',
    'proceso-difusion': 'Proceso de Difusi\u00f3n',
    'ddpm-vs-ddim': 'DDPM vs DDIM',
    'inpainting-difusion': 'Inpainting con Difusi\u00f3n',
    'tutorial-maf': 'Tutorial MAF: C\u00f3mo se lee',
  },
  en: {
    'tensores': 'Tensors: The Data Structure of Deep Learning',
    'modelos-generativos': 'Generative Models: the Big Idea',
    'kl-divergence-mle': 'KL Divergence and MLE',
    'independencia-condicional': 'Conditional Independence',
    'modelos-autoregresivos': 'Autoregressive Models',
    'estimacion-monte-carlo': 'Monte Carlo Estimation',
    'variables-latentes': 'Latent Variables',
    'elbo': 'The ELBO',
    'vae-encoder-decoder': 'VAE: Encoder and Decoder',
    'gmvae': 'Gaussian Mixture VAE',
    'iwae': 'IWAE: Tighter Bounds',
    'ssvae': 'Semi-Supervised VAE',
    'cambio-de-variables': 'Change of Variables',
    'arquitecturas-flujos': 'Flow Architectures',
    'maf-vs-iaf': 'MAF vs IAF',
    'gans-min-max': 'GANs: the Min-Max Game',
    'entrenamiento-gans': 'Training GANs',
    'f-divergencias': 'f-Divergences and Theory',
    'conditional-gan': 'Conditional GAN',
    'wasserstein-gan': 'Wasserstein GAN',
    'energy-based-models': 'Energy-Based Models',
    'score-matching': 'Score Matching',
    'proceso-difusion': 'Diffusion Process',
    'ddpm-vs-ddim': 'DDPM vs DDIM',
    'inpainting-difusion': 'Inpainting with Diffusion',
    'tutorial-maf': 'MAF Tutorial: How to Read',
  },
};

const LESSON_DESCS: Record<Lang, Record<string, string>> = {
  es: {
    'tensores': 'Escalares, vectores, matrices y tensores n-dimensionales. Shapes, broadcasting, reshape, y c\u00f3mo los datos fluyen por una red neuronal.',
    'modelos-generativos': 'Qu\u00e9 es un modelo generativo, por qu\u00e9 aprender p(x), y las tres tareas fundamentales: densidad, muestreo, y representaciones.',
    'kl-divergence-mle': 'De la sorpresa de un evento a la estimaci\u00f3n de m\u00e1xima verosimilitud. Entrop\u00eda, entrop\u00eda cruzada, KL divergence, asimetr\u00eda forward/reverse.',
    'independencia-condicional': 'Redes bayesianas, factorizaci\u00f3n de distribuciones conjuntas, conteo de par\u00e1metros, y supuestos de Markov.',
    'modelos-autoregresivos': 'Regla de la cadena, FVSBN, NADE, PixelCNN. Factorizaci\u00f3n autoregresiva: densidad exacta pero muestreo secuencial.',
    'estimacion-monte-carlo': 'Estimadores insesgados, varianza, el problema de estimar log p(x) con muestras. De Monte Carlo a variables latentes.',
    'variables-latentes': 'Distribuciones conjuntas p(x,z), marginal intractable, y por qu\u00e9 necesitamos inferencia variacional.',
    'elbo': 'Evidence Lower Bound: derivaci\u00f3n con Jensen, las dos fuerzas (reconstrucci\u00f3n vs regularizaci\u00f3n), y por qu\u00e9 es una cota inferior.',
    'vae-encoder-decoder': 'Reparametrizaci\u00f3n, inferencia amortizada, redes encoder/decoder, Beta-VAE, y posterior collapse.',
    'gmvae': 'Prior como mezcla de gaussianas, estimaci\u00f3n Monte Carlo del KL, log-sum-exp estable.',
    'iwae': 'Importance Weighted Autoencoder: m\u00faltiples muestras para apretar la cota.',
    'ssvae': 'Aprender con pocas etiquetas: modelo generativo con y, marginalizaci\u00f3n sobre clases, y clasificaci\u00f3n emergente.',
    'cambio-de-variables': 'F\u00f3rmula de cambio de variables, Jacobiano, determinante. De distribuciones simples a complejas con transformaciones invertibles.',
    'arquitecturas-flujos': 'Planar flow, NICE, RealNVP, coupling layers. Dise\u00f1ar transformaciones con Jacobianos tratables.',
    'maf-vs-iaf': 'Masked Autoregressive Flow e Inverse Autoregressive Flow. El trade-off densidad-r\u00e1pida vs muestreo-r\u00e1pido.',
    'gans-min-max': 'Generador vs discriminador, objetivo minimax, discriminador \u00f3ptimo, y la conexi\u00f3n con Jensen-Shannon divergence.',
    'entrenamiento-gans': 'Loss no-saturante, gradientes que se desvanecen, mode collapse. Por qu\u00e9 entrenar GANs es dif\u00edcil.',
    'f-divergencias': 'f-GAN, conjugado de Fenchel, KL forward vs reverse en GANs vs VAEs.',
    'conditional-gan': 'Generaci\u00f3n condicionada a clases, discriminador de proyecci\u00f3n, y one-hot label encoding.',
    'wasserstein-gan': 'Distancia Earth Mover, soportes disjuntos, restricci\u00f3n de Lipschitz, gradient penalty.',
    'energy-based-models': 'Funci\u00f3n de energ\u00eda, densidad no normalizada, partici\u00f3n intractable. Contrastive divergence y Langevin dynamics.',
    'score-matching': 'La funci\u00f3n score, matching exacto, sliced, y denoising. Evitando la partici\u00f3n intractable.',
    'proceso-difusion': 'Forward process (a\u00f1adir ruido) y reverse process (denoising). Noise schedule y la conexi\u00f3n con score models.',
    'ddpm-vs-ddim': 'DDPM markoviano (1000 pasos, alta calidad) vs DDIM determin\u00edstico (50 pasos, muestreo r\u00e1pido).',
    'inpainting-difusion': 'Generaci\u00f3n condicional restringiendo el reverse process. M\u00e1scara binaria, blending de regiones conocidas y generadas.',
    'tutorial-maf': 'Gu\u00eda paso a paso de Masked Autoregressive Flow. Cada ecuaci\u00f3n explicada s\u00edmbolo por s\u00edmbolo, con "c\u00f3mo se lee" y tablas de notaci\u00f3n.',
  },
  en: {
    'tensores': 'Scalars, vectors, matrices and n-dimensional tensors. Shapes, broadcasting, reshape, and how data flows through a neural network.',
    'modelos-generativos': 'What a generative model is, why learn p(x), and the three fundamental tasks: density, sampling, and representations.',
    'kl-divergence-mle': 'From event surprise to maximum likelihood estimation. Entropy, cross-entropy, KL divergence, forward/reverse asymmetry.',
    'independencia-condicional': 'Bayesian networks, joint distribution factorization, parameter counting, and Markov assumptions.',
    'modelos-autoregresivos': 'Chain rule, FVSBN, NADE, PixelCNN. Autoregressive factorization: exact density but sequential sampling.',
    'estimacion-monte-carlo': 'Unbiased estimators, variance, the problem of estimating log p(x) with samples. From Monte Carlo to latent variables.',
    'variables-latentes': 'Joint distributions p(x,z), intractable marginal, and why we need variational inference.',
    'elbo': 'Evidence Lower Bound: Jensen derivation, the two forces (reconstruction vs regularization), and why it\'s a lower bound.',
    'vae-encoder-decoder': 'Reparameterization, amortized inference, encoder/decoder networks, Beta-VAE, and posterior collapse.',
    'gmvae': 'Gaussian mixture prior, Monte Carlo KL estimation, stable log-sum-exp.',
    'iwae': 'Importance Weighted Autoencoder: multiple samples to tighten the bound.',
    'ssvae': 'Learning with few labels: generative model with y, marginalization over classes, and emergent classification.',
    'cambio-de-variables': 'Change of variables formula, Jacobian, determinant. From simple to complex distributions with invertible transforms.',
    'arquitecturas-flujos': 'Planar flow, NICE, RealNVP, coupling layers. Designing transforms with tractable Jacobians.',
    'maf-vs-iaf': 'Masked Autoregressive Flow and Inverse Autoregressive Flow. The density-fast vs sampling-fast trade-off.',
    'gans-min-max': 'Generator vs discriminator, minimax objective, optimal discriminator, and the connection to Jensen-Shannon divergence.',
    'entrenamiento-gans': 'Non-saturating loss, vanishing gradients, mode collapse. Why training GANs is hard.',
    'f-divergencias': 'f-GAN, Fenchel conjugate, forward vs reverse KL in GANs vs VAEs.',
    'conditional-gan': 'Class-conditioned generation, projection discriminator, and one-hot label encoding.',
    'wasserstein-gan': 'Earth Mover distance, disjoint supports, Lipschitz constraint, gradient penalty.',
    'energy-based-models': 'Energy function, unnormalized density, intractable partition. Contrastive divergence and Langevin dynamics.',
    'score-matching': 'The score function, exact matching, sliced, and denoising. Avoiding the intractable partition.',
    'proceso-difusion': 'Forward process (adding noise) and reverse process (denoising). Noise schedule and the connection with score models.',
    'ddpm-vs-ddim': 'Markovian DDPM (1000 steps, high quality) vs deterministic DDIM (50 steps, fast sampling).',
    'inpainting-difusion': 'Conditional generation by constraining the reverse process. Binary mask, blending of known and generated regions.',
    'tutorial-maf': 'Step-by-step guide to Masked Autoregressive Flow. Each equation explained symbol by symbol, with "how to read" and notation tables.',
  },
};

// ── Module names ──

const _MODULE_NAMES: Record<Lang, Record<string, string>> = {
  es: {
    mod1: 'Fundamentos y Modelos Autoregresivos',
    mod2: 'Variational Autoencoders',
    mod3: 'Normalizing Flows',
    mod4: 'Generative Adversarial Networks',
    mod5: 'Energy-Based y Score-Based Models',
    mod6: 'Diffusion Models',
    guias: 'Guías de estudio',
  },
  en: {
    mod1: 'Fundamentals and Autoregressive Models',
    mod2: 'Variational Autoencoders',
    mod3: 'Normalizing Flows',
    mod4: 'Generative Adversarial Networks',
    mod5: 'Energy-Based and Score-Based Models',
    mod6: 'Diffusion Models',
    guias: 'Study Guides',
  },
};

// ── Module meta (weeks/PS) ──

const _MODULE_META: Record<Lang, Record<string, string>> = {
  es: {
    mod1: 'Semanas 1-2',
    mod2: 'Semanas 3-4',
    mod3: 'Semanas 3-4',
    mod4: 'Semanas 3-4',
    mod5: 'Semanas 5-8',
    mod6: 'Semanas 9-10',
    guias: 'Material complementario',
  },
  en: {
    mod1: 'Weeks 1-2',
    mod2: 'Weeks 3-4',
    mod3: 'Weeks 3-4',
    mod4: 'Weeks 3-4',
    mod5: 'Weeks 5-8',
    mod6: 'Weeks 9-10',
    guias: 'Supplementary material',
  },
};

// ── Lesson card metadata (scenes count, duration) ──

const LESSON_META: Record<Lang, Record<string, string>> = {
  es: {
    'tensores': '12 escenas \u00b7 ~3 min',
    'modelos-generativos': '10 escenas \u00b7 ~4 min',
    'kl-divergence-mle': '12 escenas \u00b7 ~4 min',
    'independencia-condicional': '10 escenas \u00b7 ~4 min',
    'modelos-autoregresivos': '9 escenas \u00b7 ~3.5 min',
    'estimacion-monte-carlo': '9 escenas \u00b7 ~3.5 min',
    'variables-latentes': '10 escenas \u00b7 ~4 min',
    'elbo': '10 escenas \u00b7 ~4 min',
    'vae-encoder-decoder': '10 escenas \u00b7 ~4 min',
    'gmvae': '9 escenas \u00b7 ~3.5 min',
    'iwae': '9 escenas \u00b7 ~3.5 min',
    'ssvae': '10 escenas \u00b7 ~4 min',
    'cambio-de-variables': '10 escenas \u00b7 ~4 min',
    'arquitecturas-flujos': '10 escenas \u00b7 ~4 min',
    'maf-vs-iaf': '9 escenas \u00b7 ~3.5 min',
    'gans-min-max': '10 escenas \u00b7 ~4 min',
    'entrenamiento-gans': '9 escenas \u00b7 ~3.5 min',
    'f-divergencias': '9 escenas \u00b7 ~3.5 min',
    'conditional-gan': '9 escenas \u00b7 ~3.5 min',
    'wasserstein-gan': '10 escenas \u00b7 ~4 min',
    'energy-based-models': '9 escenas \u00b7 ~3.5 min',
    'score-matching': '10 escenas \u00b7 ~4 min',
    'proceso-difusion': '10 escenas \u00b7 ~4 min',
    'ddpm-vs-ddim': '10 escenas \u00b7 ~4 min',
    'inpainting-difusion': '9 escenas \u00b7 ~3.5 min',
    'tutorial-maf': '12 escenas \u00b7 ~5 min',
  },
  en: {
    'tensores': '12 scenes \u00b7 ~3 min',
    'modelos-generativos': '10 scenes \u00b7 ~4 min',
    'kl-divergence-mle': '12 scenes \u00b7 ~4 min',
    'independencia-condicional': '10 scenes \u00b7 ~4 min',
    'modelos-autoregresivos': '9 scenes \u00b7 ~3.5 min',
    'estimacion-monte-carlo': '9 scenes \u00b7 ~3.5 min',
    'variables-latentes': '10 scenes \u00b7 ~4 min',
    'elbo': '10 scenes \u00b7 ~4 min',
    'vae-encoder-decoder': '10 scenes \u00b7 ~4 min',
    'gmvae': '9 scenes \u00b7 ~3.5 min',
    'iwae': '9 scenes \u00b7 ~3.5 min',
    'ssvae': '10 scenes \u00b7 ~4 min',
    'cambio-de-variables': '10 scenes \u00b7 ~4 min',
    'arquitecturas-flujos': '10 scenes \u00b7 ~4 min',
    'maf-vs-iaf': '9 scenes \u00b7 ~3.5 min',
    'gans-min-max': '10 scenes \u00b7 ~4 min',
    'entrenamiento-gans': '9 scenes \u00b7 ~3.5 min',
    'f-divergencias': '9 scenes \u00b7 ~3.5 min',
    'conditional-gan': '9 scenes \u00b7 ~3.5 min',
    'wasserstein-gan': '10 scenes \u00b7 ~4 min',
    'energy-based-models': '9 scenes \u00b7 ~3.5 min',
    'score-matching': '10 scenes \u00b7 ~4 min',
    'proceso-difusion': '10 scenes \u00b7 ~4 min',
    'ddpm-vs-ddim': '10 scenes \u00b7 ~4 min',
    'inpainting-difusion': '9 scenes \u00b7 ~3.5 min',
    'tutorial-maf': '12 scenes \u00b7 ~5 min',
  },
};

// ── Public getters ──

export function getLessonTitle(id: string): string {
  const lang = getLang();
  return LESSON_TITLES[lang]?.[id] ?? LESSON_TITLES.es[id] ?? id;
}

export function getLessonDesc(id: string): string {
  const lang = getLang();
  return LESSON_DESCS[lang]?.[id] ?? LESSON_DESCS.es[id] ?? '';
}

export function getLessonMeta(id: string): string {
  const lang = getLang();
  return LESSON_META[lang]?.[id] ?? LESSON_META.es?.[id] ?? '';
}

export function getModuleName(key: string): string {
  const lang = getLang();
  return _MODULE_NAMES[lang]?.[key] ?? _MODULE_NAMES.es[key] ?? key;
}

export function getModuleMeta(key: string): string {
  const lang = getLang();
  return _MODULE_META[lang]?.[key] ?? _MODULE_META.es[key] ?? '';
}

// Re-export from quizzes/
export const getQuizData = _getQuizData;

// ── Modules ──

const _MODULES = [
  { key: 'mod1' },
  { key: 'mod2' },
  { key: 'mod3' },
  { key: 'mod4' },
  { key: 'mod5' },
  { key: 'mod6' },
  { key: 'guias' },
] as const;

export const MODULES: readonly { key: string }[] = _MODULES;

// ── Lesson list ──

interface LessonBase {
  id: string;
  module: string;
  num: number;
  ready: boolean;
  formula: string;
  tags: LessonTag[];
}

const _LESSONS_BASE: LessonBase[] = [
  { id: 'tensores', module: 'mod1', num: 0, ready: true,
    formula: '\\mathcal{T} \\in \\mathbb{R}^{B \\times C \\times H \\times W}',
    tags: [{ label: 'Prerequisito', type: 'topic' }] },
  { id: 'modelos-generativos', module: 'mod1', num: 1, ready: true,
    formula: '\\min_{\\theta \\in \\mathcal{M}} \\; d(p_{\\text{data}},\\; p_\\theta)',
    tags: [{ label: 'Introducción', type: 'topic' }] },
  { id: 'kl-divergence-mle', module: 'mod1', num: 2, ready: true,
    formula: 'D_{\\text{KL}}(P \\| Q) = \\sum_x P(x) \\log \\frac{P(x)}{Q(x)}',
    tags: [{ label: 'Fundamentos', type: 'topic' }] },
  { id: 'independencia-condicional', module: 'mod1', num: 3, ready: true,
    formula: 'p(x_1, \\dots, x_n) = \\prod_{i=1}^n p(x_i \\mid \\text{Pa}(x_i))',
    tags: [{ label: 'Fundamentos', type: 'topic' }] },
  { id: 'modelos-autoregresivos', module: 'mod1', num: 4, ready: true,
    formula: 'p(\\mathbf{x}) = \\prod_{i=1}^n p(x_i \\mid x_1, \\dots, x_{i-1})',
    tags: [{ label: 'Autoregresivos', type: 'topic' }] },
  { id: 'estimacion-monte-carlo', module: 'mod1', num: 5, ready: true,
    formula: 'p(x) = \\int p(x \\mid z)\\, p(z)\\, dz \\approx \\frac{1}{K}\\sum_{k=1}^K p(x \\mid z^{(k)})',
    tags: [{ label: 'Fundamentos', type: 'topic' }] },

  { id: 'variables-latentes', module: 'mod2', num: 6, ready: true,
    formula: 'p_\\theta(x) = \\int p_\\theta(x \\mid z)\\, p(z)\\, dz',
    tags: [{ label: 'VAE', type: 'topic' }] },
  { id: 'elbo', module: 'mod2', num: 7, ready: true,
    formula: '\\log p(x) \\geq \\underbrace{\\mathbb{E}_{q}[\\log p(x|z)]}_{\\text{recon.}} - \\underbrace{D_{\\text{KL}}(q(z|x) \\| p(z))}_{\\text{reg.}}',
    tags: [{ label: 'VAE', type: 'topic' }] },
  { id: 'vae-encoder-decoder', module: 'mod2', num: 8, ready: true,
    formula: 'z = \\mu_\\phi(x) + \\sigma_\\phi(x) \\odot \\epsilon, \\quad \\epsilon \\sim \\mathcal{N}(0, I)',
    tags: [{ label: 'VAE', type: 'topic' }] },
  { id: 'gmvae', module: 'mod2', num: 9, ready: true,
    formula: 'p_\\theta(z) = \\frac{1}{K}\\sum_{k=1}^{K} \\mathcal{N}(z \\mid \\mu_k, \\sigma_k^2 I)',
    tags: [{ label: 'VAE', type: 'topic' }] },
  { id: 'iwae', module: 'mod2', num: 10, ready: true,
    formula: '\\log p(x) \\geq \\mathcal{L}_m \\geq \\mathcal{L}_1 = \\text{ELBO}',
    tags: [{ label: 'VAE', type: 'topic' }] },
  { id: 'ssvae', module: 'mod2', num: 11, ready: true,
    formula: 'p(x,y,z) = p(z)\\, p(y)\\, p_\\theta(x \\mid y, z)',
    tags: [{ label: 'VAE', type: 'topic' }] },

  { id: 'cambio-de-variables', module: 'mod3', num: 12, ready: true,
    formula: 'p_X(x) = p_Z\\!\\bigl(f^{-1}(x)\\bigr) \\left|\\det \\frac{\\partial f^{-1}}{\\partial x}\\right|',
    tags: [{ label: 'Flows', type: 'topic' }] },
  { id: 'arquitecturas-flujos', module: 'mod3', num: 13, ready: true,
    formula: '\\begin{aligned} y_1 &= x_1 \\\\ y_2 &= x_2 \\odot \\exp\\!\\bigl(s(x_1)\\bigr) + t(x_1) \\end{aligned}',
    tags: [{ label: 'Flows', type: 'topic' }] },
  { id: 'maf-vs-iaf', module: 'mod3', num: 14, ready: true,
    formula: 'x_i = \\mu_i(x_{<i}) + z_i \\cdot \\exp\\!\\bigl(\\alpha_i(x_{<i})\\bigr)',
    tags: [{ label: 'Flows', type: 'topic' }] },

  { id: 'gans-min-max', module: 'mod4', num: 15, ready: true,
    formula: '\\min_G \\max_D \\; \\mathbb{E}_{x}[\\log D(x)] + \\mathbb{E}_{z}[\\log(1 - D(G(z)))]',
    tags: [{ label: 'GANs', type: 'topic' }] },
  { id: 'entrenamiento-gans', module: 'mod4', num: 16, ready: true,
    formula: '\\mathcal{L}_G^{\\text{NS}} = -\\mathbb{E}_{z}\\bigl[\\log D(G(z))\\bigr]',
    tags: [{ label: 'GANs', type: 'topic' }] },
  { id: 'f-divergencias', module: 'mod4', num: 17, ready: true,
    formula: 'D_f(P \\| Q) = \\int q(x)\\, f\\!\\left(\\frac{p(x)}{q(x)}\\right) dx',
    tags: [{ label: 'GANs', type: 'topic' }] },
  { id: 'conditional-gan', module: 'mod4', num: 18, ready: true,
    formula: 'D_\\phi(x, y), \\quad G_\\theta(z, y)',
    tags: [{ label: 'GANs', type: 'topic' }] },
  { id: 'wasserstein-gan', module: 'mod4', num: 19, ready: true,
    formula: 'W(p, q) = \\inf_{\\gamma \\in \\Pi(p,q)} \\mathbb{E}_{(x,y) \\sim \\gamma}\\bigl[\\|x - y\\|\\bigr]',
    tags: [{ label: 'GANs', type: 'topic' }] },

  { id: 'energy-based-models', module: 'mod5', num: 20, ready: true,
    formula: 'p_\\theta(x) = \\frac{\\exp\\!\\bigl(-E_\\theta(x)\\bigr)}{Z(\\theta)}',
    tags: [{ label: 'Energía', type: 'topic' }] },
  { id: 'score-matching', module: 'mod5', num: 21, ready: true,
    formula: 's_\\theta(x) = \\nabla_x \\log p_\\theta(x)',
    tags: [{ label: 'Score', type: 'topic' }] },

  { id: 'proceso-difusion', module: 'mod6', num: 22, ready: true,
    formula: 'q(x_t \\mid x_{t-1}) = \\mathcal{N}\\!\\bigl(x_t;\\, \\sqrt{\\alpha_t}\\, x_{t-1},\\; (1-\\alpha_t)\\, I\\bigr)',
    tags: [{ label: 'Difusión', type: 'topic' }] },
  { id: 'ddpm-vs-ddim', module: 'mod6', num: 23, ready: true,
    formula: 'x_{t-1} = \\sqrt{\\bar\\alpha_{t-1}}\\,\\hat{x}_0 + \\sqrt{1 - \\bar\\alpha_{t-1}}\\;\\epsilon_\\theta(x_t, t)',
    tags: [{ label: 'Difusión', type: 'topic' }] },
  { id: 'inpainting-difusion', module: 'mod6', num: 24, ready: true,
    formula: 'x_t = (1 - m) \\odot x_t^{\\text{orig}} + m \\odot x_t^{\\text{gen}}',
    tags: [{ label: 'Difusión', type: 'topic' }] },

  { id: 'tutorial-maf', module: 'guias', num: 25, ready: true,
    formula: 'x_i = \\mu_i(x_{<i}) + z_i \\cdot \\exp\\!\\bigl(\\alpha_i(x_{<i})\\bigr)',
    tags: [{ label: 'Flows', type: 'topic' }] },
];

// Wrap each lesson so .title/.description resolve dynamically
export const LESSONS: LessonEntry[] = _LESSONS_BASE.map(l => ({
  ...l,
  get title(): string { return getLessonTitle(this.id); },
  get description(): string { return getLessonDesc(this.id); },
}));

// Keep backward-compatible named exports that resolve dynamically
export const QUIZ_DATA = new Proxy({} as Record<string, QuizQuestion[]>, {
  get(_: Record<string, QuizQuestion[]>, key: string): QuizQuestion[] { return getQuizData(key); },
});

export const MODULE_NAMES = new Proxy({} as Record<string, string>, {
  get(_: Record<string, string>, key: string): string { return getModuleName(key); },
});

export function getNextLesson(currentId: string, { onlyReady = true }: { onlyReady?: boolean } = {}): LessonEntry | null {
  const idx = LESSONS.findIndex(l => l.id === currentId);
  if (idx === -1) return null;
  for (let i = idx + 1; i < LESSONS.length; i++) {
    if (!onlyReady || LESSONS[i].ready) return LESSONS[i];
  }
  return null;
}

export function getLessonModule(lessonId: string): string | null {
  const l = LESSONS.find(l => l.id === lessonId);
  return l ? l.module : null;
}

export function getLesson(lessonId: string): LessonEntry | null {
  return LESSONS.find(l => l.id === lessonId) || null;
}
