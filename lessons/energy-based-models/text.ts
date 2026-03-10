// Bilingual text for Energy-Based Models lesson

import { getLang } from '../../engine/i18n';
import type { Lang, SubtitleCue } from '../../engine/types';

export interface SceneText {
  id: string;
  narration: string;
  subtitleCues: SubtitleCue[];
  topic: string;
  title: string;
  [field: string]: string | SubtitleCue[];
}

export interface LessonText {
  lessonTitle: string;
  lessonSubtitle: string;
  [key: string]: string | SceneText;
}

export const text: Record<Lang, LessonText> = {
  es: {
    lessonTitle: 'Energy-Based Models',
    lessonSubtitle: 'De funciones de energia a dinamica de Langevin',
    scene1: {
      id: 'La funcion de energia',
      narration: 'Imagina una pelota en una montana: rueda naturalmente hacia los valles. En un EBM, los valles son regiones de baja energia y alta probabilidad, mientras las cumbres son zonas de alta energia donde la densidad es casi nula. La red neuronal esculpe este paisaje energ\u00e9tico.',
      subtitleCues: [
        { time: 0.0, text: 'EBM: una pelota en una montana' },
        { time: 0.14, text: 'Valles = baja energia = alta probabilidad' },
        { time: 0.28, text: 'Cumbres = alta energia = baja probabilidad' },
        { time: 0.42, text: 'p_\u03b8(x) = exp(\u2212E_\u03b8(x)) / Z(\u03b8)' },
        { time: 0.57, text: 'La red neuronal define E_\u03b8(x)' },
        { time: 0.71, text: 'Sin restricciones arquitectonicas' },
        { time: 0.85, text: 'Maxima flexibilidad para modelar densidades' },
      ],
      topic: 'Funcion de energia E_\u03b8(x). Probabilidad como exp(-E)/Z. Paisaje energetico: valles = alta probabilidad.',
      title: 'La funcion de energia',
      lowEnergy: 'Baja energia = alta probabilidad',
      highEnergy: 'Alta energia = baja probabilidad',
      formula: 'p_\u03b8(x) = exp(\u2212E_\u03b8(x)) / Z(\u03b8)',
    },
    scene2: {
      id: 'La funcion de particion',
      narration: 'Z es como intentar medir el volumen de un oceano con un vaso: imposible en dimensiones altas. Esta integral recorre todo el espacio para normalizar la densidad. Sin Z no tenemos probabilidades reales, solo valores relativos.',
      subtitleCues: [
        { time: 0.0, text: 'Z(\u03b8) = \u222bexp(\u2212E_\u03b8(x)) dx' },
        { time: 0.14, text: 'Normalizacion: garantiza que \u222bp dx = 1' },
        { time: 0.28, text: 'Como medir el volumen de un oceano' },
        { time: 0.42, text: 'En 1000 dimensiones: imposible' },
        { time: 0.57, text: 'Ni analitica ni numericamente' },
        { time: 0.71, text: 'Sin Z: no hay probabilidades absolutas' },
        { time: 0.85, text: 'Z = ? \u2014 El gran problema de los EBMs' },
      ],
      topic: 'Funcion de particion Z(\u03b8) = \u222bexp(-E(x))dx. Intratable en altas dimensiones. Problema central de EBMs.',
      title: 'La funcion de particion',
      unnormalized: 'Densidad sin normalizar',
      zQuestion: 'Z = ?',
      intractable: 'Intratable en altas dimensiones',
    },
    scene3: {
      id: 'Modelos no normalizados',
      narration: 'Aunque no sepamos el precio exacto de cada casa, sabemos cual cuesta mas: la que tiene menor energia. Z se cancela en la razon de probabilidades, como un factor de conversion que desaparece al dividir. Esto permite comparar sin normalizar.',
      subtitleCues: [
        { time: 0.0, text: 'Sin Z, no hay probabilidades absolutas' },
        { time: 0.14, text: 'Pero podemos comparar: cual es mas probable?' },
        { time: 0.28, text: 'E(a) < E(b) \u2192 p(a) > p(b)' },
        { time: 0.42, text: 'p(a)/p(b) = exp(\u2212E(a)) / exp(\u2212E(b))' },
        { time: 0.57, text: '\u00a1Z se cancela en la razon!' },
        { time: 0.71, text: 'Como comparar precios sin tipo de cambio' },
        { time: 0.85, text: 'Score tambien cancela Z' },
      ],
      topic: 'Modelos no normalizados. Comparacion de probabilidades sin Z. Razon p(a)/p(b) = exp(E(b)-E(a)) cancela Z.',
      title: 'Modelos no normalizados',
      compareLabel: 'Podemos comparar sin Z',
      ratioLabel: 'p(a)/p(b) = exp(E(b) \u2212 E(a))',
      pointA: 'a: energia baja',
      pointB: 'b: energia alta',
      zCancels: '\u00a1Z se cancela!',
    },
    scene4: {
      id: 'Contrastive Divergence',
      narration: 'El gradiente del MLE tiene dos fuerzas opuestas, como gravedad y flotacion. Una fuerza empuja la energia hacia abajo en los datos reales, atrayendolos. La otra empuja hacia arriba en las muestras del modelo, repeliendolas. Contrastive divergence aproxima las muestras con pocas iteraciones de MCMC.',
      subtitleCues: [
        { time: 0.0, text: '\u2207 log p(x) = \u2212\u2207E(x) + E_p[\u2207E(x\u2032)]' },
        { time: 0.14, text: 'Dos fuerzas opuestas como gravedad y flotacion' },
        { time: 0.28, text: 'Fuerza 1: bajar energia en datos reales' },
        { time: 0.42, text: 'Fuerza 2: subir energia en muestras' },
        { time: 0.57, text: 'Equilibrio: datos en valles, resto en cumbres' },
        { time: 0.71, text: 'Problema: necesitamos muestras del modelo' },
        { time: 0.85, text: 'CD: pocas iteraciones de MCMC bastan' },
      ],
      topic: 'Contrastive Divergence. Gradiente = push down en datos + push up en muestras. MCMC corto para aproximar.',
      title: 'Contrastive Divergence',
      pushDown: 'Bajar energia en datos',
      pushUp: 'Subir energia en muestras',
      dataLabel: 'Datos reales',
      sampleLabel: 'Muestras del modelo',
    },
    scene5: {
      id: 'Dinamica de Langevin',
      narration: 'Imagina particulas soltadas en la montana: la gravedad las empuja cuesta abajo, pero el viento aleatorio las dispersa. Langevin dynamics combina gradiente y ruido gaussiano. Las particulas convergen a los valles, muestreando la distribucion del modelo.',
      subtitleCues: [
        { time: 0.0, text: 'Particulas soltadas en la montana' },
        { time: 0.14, text: 'x_{t+1} = x_t \u2212 (\u03b5/2)\u2207E(x_t) + \u221a\u03b5\u00b7\u03b7' },
        { time: 0.28, text: 'Gravedad: gradiente negativo de E' },
        { time: 0.42, text: 'Viento: ruido gaussiano para explorar' },
        { time: 0.57, text: 'Las particulas descienden hacia los valles' },
        { time: 0.71, text: 'El ruido evita quedarse atrapado' },
        { time: 0.85, text: 'Convergen a p_\u03b8(x) en el limite' },
      ],
      topic: 'Langevin dynamics: x_{t+1} = x_t - (\u03b5/2)\u2207E + \u221a\u03b5\u03b7. Gradiente + ruido. Muestreo de EBMs.',
      title: 'Dinamica de Langevin',
      gradient: 'Gradiente negativo',
      noise: 'Ruido gaussiano',
      converge: 'Converge a p_\u03b8(x)',
    },
    scene6: {
      id: 'Short-Run MCMC',
      narration: 'Correr la cadena completa es como esperar que el rio llegue al mar: lleva demasiado tiempo. En la practica usamos solo diez a cien pasos. Es como tomar una foto a mitad del viaje: sesgada pero util. Las trayectorias truncadas capturan la estructura local.',
      subtitleCues: [
        { time: 0.0, text: 'Convergencia completa: miles de pasos' },
        { time: 0.14, text: 'Como esperar que el rio llegue al mar' },
        { time: 0.28, text: 'Short-run: solo K=10\u2013100 pasos' },
        { time: 0.42, text: 'Foto a mitad del viaje' },
        { time: 0.57, text: 'Sesgado pero practico y eficiente' },
        { time: 0.71, text: 'Buffer de replay: reusar muestras previas' },
        { time: 0.85, text: 'Trayectorias truncadas: estructura local' },
      ],
      topic: 'Short-run MCMC: K=10-100 pasos de Langevin en vez de convergencia. Sesgo aceptable, eficiente.',
      title: 'Short-Run MCMC',
      fullChain: 'Cadena completa (miles de pasos)',
      shortRun: 'Short-run (K pasos)',
      biased: 'Sesgado pero eficiente',
    },
    scene7: {
      id: 'Puente a Score Models',
      narration: 'La llave maestra: el gradiente de log p respecto a x es simplemente el negativo del gradiente de la energia. Esta es la funcion score, y Z desaparece por completo. Los EBMs son el puente directo hacia score matching y los modelos de difusion.',
      subtitleCues: [
        { time: 0.0, text: '\u2207_x log p(x) = \u2212\u2207_x E(x)' },
        { time: 0.14, text: 'Score = negativo del gradiente de energia' },
        { time: 0.28, text: '\u00a1Z desaparece al derivar!' },
        { time: 0.42, text: 'No necesitamos normalizar' },
        { time: 0.57, text: 'Score: la brujula hacia alta densidad' },
        { time: 0.71, text: 'EBMs son el puente a score models' },
        { time: 0.85, text: 'Proximo paso: score matching y difusion' },
      ],
      topic: 'Score function = -\u2207E(x). Independiente de Z. Conecta EBMs con score-based models y difusion.',
      title: 'Puente a Score Models',
      scoreLabel: 'Score: s(x) = \u2207_x log p(x)',
      energyGrad: '= \u2212\u2207_x E(x)',
      noZ: '\u00a1No depende de Z!',
      bridge: 'Esto lleva a score matching y difusion...',
    },
  },
  en: {
    lessonTitle: 'Energy-Based Models',
    lessonSubtitle: 'From energy functions to Langevin dynamics',
    scene1: {
      id: 'The energy function',
      narration: 'Picture a ball on a mountain: it naturally rolls into valleys. In an EBM, valleys are low-energy regions with high probability, while peaks are high-energy zones where density is nearly zero. The neural network sculpts this energy landscape.',
      subtitleCues: [
        { time: 0.0, text: 'EBM: a ball on a mountain' },
        { time: 0.14, text: 'Valleys = low energy = high probability' },
        { time: 0.28, text: 'Peaks = high energy = low probability' },
        { time: 0.42, text: 'p_\u03b8(x) = exp(\u2212E_\u03b8(x)) / Z(\u03b8)' },
        { time: 0.57, text: 'The neural network defines E_\u03b8(x)' },
        { time: 0.71, text: 'No architectural constraints' },
        { time: 0.85, text: 'Maximum flexibility for modeling densities' },
      ],
      topic: 'Energy function E_\u03b8(x). Probability as exp(-E)/Z. Energy landscape: valleys = high probability.',
      title: 'The energy function',
      lowEnergy: 'Low energy = high probability',
      highEnergy: 'High energy = low probability',
      formula: 'p_\u03b8(x) = exp(\u2212E_\u03b8(x)) / Z(\u03b8)',
    },
    scene2: {
      id: 'The partition function',
      narration: 'Z is like trying to measure the volume of an ocean with a cup: impossible in high dimensions. This integral sweeps over all space to normalize the density. Without Z we have no real probabilities, only relative values.',
      subtitleCues: [
        { time: 0.0, text: 'Z(\u03b8) = \u222bexp(\u2212E_\u03b8(x)) dx' },
        { time: 0.14, text: 'Normalization: ensures \u222bp dx = 1' },
        { time: 0.28, text: 'Like measuring the volume of an ocean' },
        { time: 0.42, text: 'In 1000 dimensions: impossible' },
        { time: 0.57, text: 'Neither analytically nor numerically' },
        { time: 0.71, text: 'Without Z: no absolute probabilities' },
        { time: 0.85, text: 'Z = ? \u2014 The big problem of EBMs' },
      ],
      topic: 'Partition function Z(\u03b8) = \u222bexp(-E(x))dx. Intractable in high dimensions. Core EBM problem.',
      title: 'The partition function',
      unnormalized: 'Unnormalized density',
      zQuestion: 'Z = ?',
      intractable: 'Intractable in high dimensions',
    },
    scene3: {
      id: 'Unnormalized models',
      narration: 'Even without knowing the exact price of each house, we know which costs more: the one with lower energy. Z cancels in probability ratios, like a conversion factor that vanishes when dividing. This lets us compare without normalizing.',
      subtitleCues: [
        { time: 0.0, text: 'Without Z, no absolute probabilities' },
        { time: 0.14, text: 'But we can compare: which is more likely?' },
        { time: 0.28, text: 'E(a) < E(b) \u2192 p(a) > p(b)' },
        { time: 0.42, text: 'p(a)/p(b) = exp(\u2212E(a)) / exp(\u2212E(b))' },
        { time: 0.57, text: 'Z cancels in the ratio!' },
        { time: 0.71, text: 'Like comparing prices without exchange rates' },
        { time: 0.85, text: 'The score also cancels Z' },
      ],
      topic: 'Unnormalized models. Comparing probabilities without Z. Ratio p(a)/p(b) = exp(E(b)-E(a)) cancels Z.',
      title: 'Unnormalized models',
      compareLabel: 'We can compare without Z',
      ratioLabel: 'p(a)/p(b) = exp(E(b) \u2212 E(a))',
      pointA: 'a: low energy',
      pointB: 'b: high energy',
      zCancels: 'Z cancels!',
    },
    scene4: {
      id: 'Contrastive Divergence',
      narration: 'The MLE gradient has two opposing forces, like gravity and buoyancy. One force pushes energy down on real data, attracting them. The other pushes energy up on model samples, repelling them. Contrastive divergence approximates the samples with few MCMC iterations.',
      subtitleCues: [
        { time: 0.0, text: '\u2207 log p(x) = \u2212\u2207E(x) + E_p[\u2207E(x\u2032)]' },
        { time: 0.14, text: 'Two opposing forces like gravity and buoyancy' },
        { time: 0.28, text: 'Force 1: push energy down on real data' },
        { time: 0.42, text: 'Force 2: push energy up on samples' },
        { time: 0.57, text: 'Equilibrium: data in valleys, rest on peaks' },
        { time: 0.71, text: 'Problem: we need model samples' },
        { time: 0.85, text: 'CD: a few MCMC iterations suffice' },
      ],
      topic: 'Contrastive Divergence. Gradient = push down on data + push up on samples. Short MCMC to approximate.',
      title: 'Contrastive Divergence',
      pushDown: 'Push energy down on data',
      pushUp: 'Push energy up on samples',
      dataLabel: 'Real data',
      sampleLabel: 'Model samples',
    },
    scene5: {
      id: 'Langevin Dynamics',
      narration: 'Picture particles dropped onto a mountain: gravity pulls them downhill, but random wind scatters them around. Langevin dynamics combines gradient and Gaussian noise. Particles converge to valleys, sampling the model distribution.',
      subtitleCues: [
        { time: 0.0, text: 'Particles dropped onto a mountain' },
        { time: 0.14, text: 'x_{t+1} = x_t \u2212 (\u03b5/2)\u2207E(x_t) + \u221a\u03b5\u00b7\u03b7' },
        { time: 0.28, text: 'Gravity: negative gradient of E' },
        { time: 0.42, text: 'Wind: Gaussian noise to explore' },
        { time: 0.57, text: 'Particles descend toward the valleys' },
        { time: 0.71, text: 'Noise prevents getting stuck' },
        { time: 0.85, text: 'Converges to p_\u03b8(x) in the limit' },
      ],
      topic: 'Langevin dynamics: x_{t+1} = x_t - (\u03b5/2)\u2207E + \u221a\u03b5\u03b7. Gradient + noise. Sampling from EBMs.',
      title: 'Langevin Dynamics',
      gradient: 'Negative gradient',
      noise: 'Gaussian noise',
      converge: 'Converges to p_\u03b8(x)',
    },
    scene6: {
      id: 'Short-Run MCMC',
      narration: 'Running the full chain is like waiting for a river to reach the sea: it takes too long. In practice we use only ten to a hundred steps. Like taking a snapshot mid-journey: biased but useful. Truncated trajectories capture local structure.',
      subtitleCues: [
        { time: 0.0, text: 'Full convergence: thousands of steps' },
        { time: 0.14, text: 'Like waiting for a river to reach the sea' },
        { time: 0.28, text: 'Short-run: only K=10\u2013100 steps' },
        { time: 0.42, text: 'A snapshot mid-journey' },
        { time: 0.57, text: 'Biased but practical and efficient' },
        { time: 0.71, text: 'Replay buffer: reuse previous samples' },
        { time: 0.85, text: 'Truncated trajectories: local structure' },
      ],
      topic: 'Short-run MCMC: K=10-100 Langevin steps instead of convergence. Acceptable bias, efficient.',
      title: 'Short-Run MCMC',
      fullChain: 'Full chain (thousands of steps)',
      shortRun: 'Short-run (K steps)',
      biased: 'Biased but efficient',
    },
    scene7: {
      id: 'Bridge to Score Models',
      narration: 'The master key: the gradient of log p with respect to x is simply the negative energy gradient. This is the score function, and Z disappears completely. EBMs are the direct bridge to score matching and diffusion models.',
      subtitleCues: [
        { time: 0.0, text: '\u2207_x log p(x) = \u2212\u2207_x E(x)' },
        { time: 0.14, text: 'Score = negative of energy gradient' },
        { time: 0.28, text: 'Z vanishes when we differentiate!' },
        { time: 0.42, text: 'No normalization needed' },
        { time: 0.57, text: 'Score: the compass toward high density' },
        { time: 0.71, text: 'EBMs are the bridge to score models' },
        { time: 0.85, text: 'Next step: score matching and diffusion' },
      ],
      topic: 'Score function = -\u2207E(x). Independent of Z. Connects EBMs with score-based models and diffusion.',
      title: 'Bridge to Score Models',
      scoreLabel: 'Score: s(x) = \u2207_x log p(x)',
      energyGrad: '= \u2212\u2207_x E(x)',
      noZ: 'Does not depend on Z!',
      bridge: 'This leads to score matching and diffusion...',
    },
  },
};

// -- Questions (bilingual) --

export const questions: Record<Lang, {
  afterPartition: import('../../engine/types').QuestionData;
  afterBridge: import('../../engine/types').QuestionData;
}> = {
  es: {
    afterPartition: {
      question: 'En un EBM, p(a)/p(b) = exp(E(b) - E(a)). Si E(a) = 2 y E(b) = 5, que punto es mas probable y por cuanto?',
      choices: [
        'a es exp(3) ~ 20 veces mas probable',
        'b es exp(3) ~ 20 veces mas probable',
        'Son iguales porque Z se cancela',
        'No se puede saber sin Z',
      ],
      correctIndex: 0,
      hint: 'p(a)/p(b) = exp(E(b) - E(a)) = exp(5 - 2) = exp(3)',
      explanation: 'E(a) < E(b) implica que a tiene mayor probabilidad. La razon es exp(3) \u2248 20.1, y Z se cancela.',
    },
    afterBridge: {
      question: 'El score function s(x) = \u2207_x log p(x) no depende de Z porque...',
      choices: [
        'Z es constante respecto a \u03b8',
        'Z no depende de x, asi que \u2207_x log Z = 0',
        'Z = 1 en modelos normalizados',
        'El score solo se usa para muestreo, no para evaluacion',
      ],
      correctIndex: 1,
      hint: 'Piensa: \u00bfde que variable estamos tomando el gradiente?',
      explanation: 'Al derivar log p(x) respecto a x, el termino log Z desaparece porque Z(\u03b8) es una constante respecto a x.',
    },
  },
  en: {
    afterPartition: {
      question: 'In an EBM, p(a)/p(b) = exp(E(b) - E(a)). If E(a) = 2 and E(b) = 5, which point is more likely and by how much?',
      choices: [
        'a is exp(3) ~ 20 times more likely',
        'b is exp(3) ~ 20 times more likely',
        'They are equal because Z cancels',
        'Cannot be determined without Z',
      ],
      correctIndex: 0,
      hint: 'p(a)/p(b) = exp(E(b) - E(a)) = exp(5 - 2) = exp(3)',
      explanation: 'E(a) < E(b) means a has higher probability. The ratio is exp(3) \u2248 20.1, and Z cancels out.',
    },
    afterBridge: {
      question: 'The score function s(x) = \u2207_x log p(x) does not depend on Z because...',
      choices: [
        'Z is constant with respect to \u03b8',
        'Z does not depend on x, so \u2207_x log Z = 0',
        'Z = 1 in normalized models',
        'The score is only used for sampling, not evaluation',
      ],
      correctIndex: 1,
      hint: 'Think: with respect to which variable are we taking the gradient?',
      explanation: 'When differentiating log p(x) with respect to x, the log Z term vanishes because Z(\u03b8) is a constant with respect to x.',
    },
  },
};

export function tx(scene: string, field: string, ...args: (string | number)[]): string {
  const lang = getLang();
  const sceneObj = text[lang]?.[scene];
  const fallbackObj = text.es[scene];
  const raw = (typeof sceneObj === 'object' && sceneObj !== null ? (sceneObj as Record<string, unknown>)[field] : undefined)
           ?? (typeof fallbackObj === 'object' && fallbackObj !== null ? (fallbackObj as Record<string, unknown>)[field] : undefined)
           ?? '';
  let str = String(raw);
  args.forEach((arg, i) => {
    str = str.replace(`$${i + 1}`, String(arg));
  });
  return str;
}
