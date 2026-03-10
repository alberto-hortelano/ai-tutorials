// Bilingual text for IWAE lesson

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
    lessonTitle: 'IWAE: Cotas mas Ajustadas',
    lessonSubtitle: 'Multiples muestras para cerrar la brecha',
    scene1: {
      id: 'La brecha del ELBO',
      narration: 'Recordemos: log p de x es igual al ELBO mas la brecha KL entre q y la posterior. La brecha es siempre no negativa. Podemos reducirla sin hacer q mas compleja? La clave esta en usar mas muestras.',
      subtitleCues: [
        { time: 0.0, text: 'log p(x) = ELBO + KL(q || p(z|x))' },
        { time: 0.15, text: 'La brecha KL >= 0 siempre' },
        { time: 0.3, text: 'ELBO <= log p(x): cota floja' },
        { time: 0.45, text: 'Podemos reducir la brecha?' },
        { time: 0.6, text: 'Sin cambiar q ni hacerla mas compleja' },
        { time: 0.75, text: 'La clave: usar mas muestras de q' },
        { time: 0.85, text: 'Multiples muestras aprietan la cota' },
      ],
      topic: 'La brecha entre el ELBO y log p(x). Motivacion para IWAE: cerrar la brecha con mas muestras.',
      title: 'La brecha del ELBO',
      logpLabel: 'log p(x)',
      elboLabel: 'ELBO',
      gapLabel: 'Brecha KL',
      questionLabel: 'Reducir sin cambiar q?',
    },
    scene2: {
      id: 'Multiples muestras',
      narration: 'En el ELBO estandar usamos una sola muestra de q. Es como buscar un tesoro con un solo explorador. Pero si enviamos K exploradores, cubren mejor el terreno. Con K muestras de q, cubrimos mejor la posterior verdadera.',
      subtitleCues: [
        { time: 0.0, text: 'ELBO estandar: 1 muestra de q' },
        { time: 0.15, text: 'Un solo explorador buscando el tesoro' },
        { time: 0.3, text: 'IWAE: K muestras de q' },
        { time: 0.45, text: 'K exploradores cubren mas terreno' },
        { time: 0.6, text: 'Mejor cobertura de la posterior' },
        { time: 0.75, text: '5 puntos exploran mas que 1' },
        { time: 0.85, text: 'Mas puntos = mejor estimacion' },
      ],
      topic: 'Tomar K muestras de q en lugar de 1. Mas exploradores cubren mejor el terreno.',
      title: 'Multiples muestras',
      singleLabel: '1 muestra',
      multiLabel: 'K=5 muestras',
      qLabel: 'q(z|x)',
      posteriorLabel: 'p(z|x)',
    },
    scene3: {
      id: 'La cota IWAE',
      narration: 'La cota IWAE es L sub K: la esperanza del logaritmo de un promedio de K cocientes p sobre q. Con K igual a uno recuperamos el ELBO exactamente. Con K mayor, la cota sube y se acerca a log p de x.',
      subtitleCues: [
        { time: 0.0, text: 'L_K = E[log (1/K) suma w_k]' },
        { time: 0.15, text: 'w_k = p(x,z_k) / q(z_k|x)' },
        { time: 0.3, text: 'K=1: recuperamos ELBO estandar' },
        { time: 0.45, text: 'K>1: cota mas ajustada' },
        { time: 0.6, text: 'L_1 <= L_K <= log p(x)' },
        { time: 0.75, text: 'Cadena de desigualdades monotona' },
        { time: 0.85, text: 'Mas K = mas cerca de log p(x)' },
      ],
      topic: 'Definicion formal de la cota IWAE. K=1 es ELBO, K>1 es mas ajustada.',
      title: 'La cota IWAE',
      elboCase: 'K=1: ELBO',
      tighterCase: 'K>1: mas ajustada',
      inequalityLabel: 'Desigualdad fundamental',
    },
    scene4: {
      id: 'Ajustando con K',
      narration: 'A medida que K crece de uno a cincuenta, la cota sube acercandose a log p de x. La brecha se reduce con rendimientos decrecientes: los primeros K extra ayudan mas. En el limite K infinito, la cota iguala log p de x.',
      subtitleCues: [
        { time: 0.0, text: 'K=1: cota floja (ELBO)' },
        { time: 0.15, text: 'K=5: cota sube notablemente' },
        { time: 0.3, text: 'K=10: mejora mas moderada' },
        { time: 0.45, text: 'K=50: casi tocando el techo' },
        { time: 0.6, text: 'Rendimientos decrecientes' },
        { time: 0.75, text: 'Los primeros K extra ayudan mas' },
        { time: 0.85, text: 'K -> infinito: L_K -> log p(x)' },
      ],
      topic: 'La cota IWAE se ajusta conforme K crece, con rendimientos decrecientes.',
      title: 'Ajustando con K',
      ceilingLabel: 'log p(x)',
      boundLabel: 'L_K',
      gapLabel: 'Brecha',
    },
    scene5: {
      id: 'Pesos de importancia',
      narration: 'Cada muestra z sub k recibe un peso proporcional a p de x y z sobre q de z dado x. Las muestras en zonas de alta densidad posterior pesan mas. El ESS, el tamano efectivo de muestra, mide cuantas muestras realmente contribuyen.',
      subtitleCues: [
        { time: 0.0, text: 'w_k = p(x,z_k) / q(z_k|x)' },
        { time: 0.15, text: 'Peso alto: z_k en zona probable' },
        { time: 0.3, text: 'Peso bajo: z_k en zona improbable' },
        { time: 0.45, text: 'Los pesos normalizados suman 1' },
        { time: 0.6, text: 'ESS: tamano efectivo de muestra' },
        { time: 0.75, text: 'ESS bajo: pocas muestras dominan' },
        { time: 0.85, text: 'ESS alto: todas contribuyen' },
      ],
      topic: 'Pesos de importancia w_k. ESS mide cuantas muestras realmente contribuyen.',
      title: 'Pesos de importancia',
      weightLabel: 'Peso w',
      essLabel: 'ESS',
      highLabel: 'Alto',
      lowLabel: 'Bajo',
    },
    scene6: {
      id: 'El problema del SNR',
      narration: 'Sorprendentemente, mas K da mejor cota pero peor gradiente para el encoder. La relacion senal-ruido del gradiente del encoder decrece con K. Hay un trade-off fundamental: la cota mejora pero el entrenamiento del encoder se estanca.',
      subtitleCues: [
        { time: 0.0, text: 'Mas K = cota mas ajustada' },
        { time: 0.15, text: 'Pero: SNR del gradiente encoder baja' },
        { time: 0.3, text: 'La senal del gradiente se pierde en el ruido' },
        { time: 0.45, text: 'El encoder deja de aprender' },
        { time: 0.6, text: 'Trade-off: cota vs entrenamiento' },
        { time: 0.75, text: 'K grande: buena evaluacion, mal encoder' },
        { time: 0.85, text: 'Necesitamos un balance practico' },
      ],
      topic: 'El trade-off SNR: mas K mejora la cota pero degrada el gradiente del encoder.',
      title: 'El problema del SNR',
      boundCurveLabel: 'Ajuste de cota',
      snrCurveLabel: 'SNR gradiente encoder',
      tradeoffLabel: 'Trade-off',
    },
    scene7: {
      id: 'Cuando usar IWAE',
      narration: 'En la practica, K entre cinco y cincuenta ofrece el mejor balance. Mas alla, el costo computacional sube con poco beneficio. IWAE es ideal para evaluar modelos: un termometro mas preciso. Para entrenar, el VAE estandar con K igual a uno sigue siendo competitivo.',
      subtitleCues: [
        { time: 0.0, text: 'K optimo: 5-50 en la practica' },
        { time: 0.15, text: 'Mas K = mas costo computacional' },
        { time: 0.3, text: 'Costo lineal en K por cada batch' },
        { time: 0.45, text: 'IWAE para evaluar: termometro preciso' },
        { time: 0.6, text: 'VAE (K=1) para entrenar: sigue competitivo' },
        { time: 0.75, text: 'En la practica k=1 funciona sorprendentemente bien' },
        { time: 0.85, text: 'IWAE: mejor evaluacion de modelos' },
      ],
      topic: 'Guia practica: K=5-50 para evaluacion. VAE estandar para entrenamiento. En la practica k=1 funciona sorprendentemente bien.',
      title: 'Cuando usar IWAE',
      vaeLabel: 'VAE (K=1)',
      iwaeLabel: 'IWAE (K=5-50)',
      sweetSpotLabel: 'Zona optima',
      costLabel: 'Costo',
      tightnessLabel: 'Ajuste',
    },
  },
  en: {
    lessonTitle: 'IWAE: Tighter Bounds',
    lessonSubtitle: 'Multiple samples to close the gap',
    scene1: {
      id: 'The ELBO Gap',
      narration: 'Recall: log p of x equals the ELBO plus the KL gap between q and the posterior. The gap is always non-negative. Can we shrink it without making q more complex? The key is to use more samples.',
      subtitleCues: [
        { time: 0.0, text: 'log p(x) = ELBO + KL(q || p(z|x))' },
        { time: 0.15, text: 'The KL gap >= 0 always' },
        { time: 0.3, text: 'ELBO <= log p(x): loose bound' },
        { time: 0.45, text: 'Can we shrink the gap?' },
        { time: 0.6, text: 'Without changing q or making it more complex' },
        { time: 0.75, text: 'The key: use more samples from q' },
        { time: 0.85, text: 'Multiple samples tighten the bound' },
      ],
      topic: 'The gap between the ELBO and log p(x). Motivation for IWAE: close the gap with more samples.',
      title: 'The ELBO Gap',
      logpLabel: 'log p(x)',
      elboLabel: 'ELBO',
      gapLabel: 'KL Gap',
      questionLabel: 'Shrink without changing q?',
    },
    scene2: {
      id: 'Multiple samples',
      narration: 'In the standard ELBO we use a single sample from q. It is like searching for treasure with one explorer. But if we send K explorers, they cover more ground. With K samples from q, we cover the true posterior better.',
      subtitleCues: [
        { time: 0.0, text: 'Standard ELBO: 1 sample from q' },
        { time: 0.15, text: 'One explorer searching for treasure' },
        { time: 0.3, text: 'IWAE: K samples from q' },
        { time: 0.45, text: 'K explorers cover more ground' },
        { time: 0.6, text: 'Better coverage of the posterior' },
        { time: 0.75, text: '5 points explore more than 1' },
        { time: 0.85, text: 'More points = better estimate' },
      ],
      topic: 'Draw K samples from q instead of 1. More explorers cover more ground.',
      title: 'Multiple samples',
      singleLabel: '1 sample',
      multiLabel: 'K=5 samples',
      qLabel: 'q(z|x)',
      posteriorLabel: 'p(z|x)',
    },
    scene3: {
      id: 'The IWAE bound',
      narration: 'The IWAE bound is L sub K: the expectation of the log of an average of K ratios p over q. With K equals one we recover the ELBO exactly. With K greater, the bound rises toward log p of x.',
      subtitleCues: [
        { time: 0.0, text: 'L_K = E[log (1/K) sum w_k]' },
        { time: 0.15, text: 'w_k = p(x,z_k) / q(z_k|x)' },
        { time: 0.3, text: 'K=1: recover standard ELBO' },
        { time: 0.45, text: 'K>1: tighter bound' },
        { time: 0.6, text: 'L_1 <= L_K <= log p(x)' },
        { time: 0.75, text: 'Monotonic chain of inequalities' },
        { time: 0.85, text: 'More K = closer to log p(x)' },
      ],
      topic: 'Formal definition of the IWAE bound. K=1 is ELBO, K>1 is tighter.',
      title: 'The IWAE bound',
      elboCase: 'K=1: ELBO',
      tighterCase: 'K>1: tighter',
      inequalityLabel: 'Fundamental inequality',
    },
    scene4: {
      id: 'Tightening with K',
      narration: 'As K grows from one to fifty, the bound rises approaching log p of x. The gap shrinks with diminishing returns: the first extra K values help the most. In the limit K goes to infinity, the bound equals log p of x.',
      subtitleCues: [
        { time: 0.0, text: 'K=1: loose bound (ELBO)' },
        { time: 0.15, text: 'K=5: bound rises noticeably' },
        { time: 0.3, text: 'K=10: more moderate improvement' },
        { time: 0.45, text: 'K=50: nearly touching the ceiling' },
        { time: 0.6, text: 'Diminishing returns' },
        { time: 0.75, text: 'First extra K values help the most' },
        { time: 0.85, text: 'K -> infinity: L_K -> log p(x)' },
      ],
      topic: 'IWAE bound tightens as K grows, with diminishing returns.',
      title: 'Tightening with K',
      ceilingLabel: 'log p(x)',
      boundLabel: 'L_K',
      gapLabel: 'Gap',
    },
    scene5: {
      id: 'Importance weights',
      narration: 'Each sample z sub k gets a weight proportional to p of x and z over q of z given x. Samples in high posterior density regions weigh more. The ESS, effective sample size, measures how many samples truly contribute.',
      subtitleCues: [
        { time: 0.0, text: 'w_k = p(x,z_k) / q(z_k|x)' },
        { time: 0.15, text: 'High weight: z_k in probable zone' },
        { time: 0.3, text: 'Low weight: z_k in improbable zone' },
        { time: 0.45, text: 'Normalized weights sum to 1' },
        { time: 0.6, text: 'ESS: effective sample size' },
        { time: 0.75, text: 'Low ESS: few samples dominate' },
        { time: 0.85, text: 'High ESS: all contribute' },
      ],
      topic: 'Importance weights w_k. ESS measures how many samples truly contribute.',
      title: 'Importance weights',
      weightLabel: 'Weight w',
      essLabel: 'ESS',
      highLabel: 'High',
      lowLabel: 'Low',
    },
    scene6: {
      id: 'The SNR problem',
      narration: 'Surprisingly, more K gives a better bound but worse encoder gradients. The signal-to-noise ratio of the encoder gradient decreases with K. There is a fundamental trade-off: the bound improves but encoder training stalls.',
      subtitleCues: [
        { time: 0.0, text: 'More K = tighter bound' },
        { time: 0.15, text: 'But: encoder gradient SNR drops' },
        { time: 0.3, text: 'Gradient signal lost in noise' },
        { time: 0.45, text: 'The encoder stops learning' },
        { time: 0.6, text: 'Trade-off: bound vs training' },
        { time: 0.75, text: 'Large K: good evaluation, bad encoder' },
        { time: 0.85, text: 'We need a practical balance' },
      ],
      topic: 'The SNR trade-off: more K improves the bound but degrades encoder gradient.',
      title: 'The SNR problem',
      boundCurveLabel: 'Bound tightness',
      snrCurveLabel: 'Encoder gradient SNR',
      tradeoffLabel: 'Trade-off',
    },
    scene7: {
      id: 'When to use IWAE',
      narration: 'In practice, K between five and fifty gives the best balance. Beyond that, computational cost rises with little benefit. IWAE is ideal for model evaluation: a more precise thermometer. For training, the standard VAE with K equals one remains competitive.',
      subtitleCues: [
        { time: 0.0, text: 'Optimal K: 5-50 in practice' },
        { time: 0.15, text: 'More K = more compute cost' },
        { time: 0.3, text: 'Linear cost in K per batch' },
        { time: 0.45, text: 'IWAE for evaluation: precise thermometer' },
        { time: 0.6, text: 'VAE (K=1) for training: still competitive' },
        { time: 0.75, text: 'In practice k=1 works surprisingly well' },
        { time: 0.85, text: 'IWAE: better model evaluation' },
      ],
      topic: 'Practical guide: K=5-50 for evaluation. Standard VAE for training. In practice k=1 works surprisingly well.',
      title: 'When to use IWAE',
      vaeLabel: 'VAE (K=1)',
      iwaeLabel: 'IWAE (K=5-50)',
      sweetSpotLabel: 'Sweet spot',
      costLabel: 'Cost',
      tightnessLabel: 'Tightness',
    },
  },
};

export const questions: Record<Lang, {
  afterScene3: import('../../engine/types').QuestionData;
  afterScene6: import('../../engine/types').QuestionData;
}> = {
  es: {
    afterScene3: {
      question: 'Con K=1, la cota IWAE es identica al ELBO estandar. Que sucede cuando K crece?',
      choices: [
        'La cota baja y se aleja de log p(x)',
        'La cota sube montonamente acercandose a log p(x)',
        'La cota oscila alrededor de log p(x)',
        'La cota permanece igual al ELBO',
      ],
      correctIndex: 1,
      hint: 'La cadena de desigualdades es L_1 <= L_K <= log p(x). Que pasa cuando K crece?',
      explanation: 'La cota IWAE sube montonamente con K: L_1 <= L_2 <= ... <= L_K <= log p(x). Cada muestra adicional aprieta la cota, con rendimientos decrecientes.',
    },
    afterScene6: {
      question: 'El trade-off SNR en IWAE significa que K muy grande...',
      choices: [
        'Mejora tanto la cota como el gradiente del encoder',
        'Empeora tanto la cota como el gradiente del encoder',
        'Mejora la cota pero degrada el gradiente del encoder',
        'No tiene efecto en el entrenamiento',
      ],
      correctIndex: 2,
      hint: 'La cota mejora con K, pero la relacion senal-ruido del gradiente del encoder...',
      explanation: 'Con K grande, la cota IWAE se acerca mas a log p(x) (mejor evaluacion), pero la relacion senal-ruido del gradiente del encoder disminuye, causando que el encoder deje de mejorar durante el entrenamiento.',
    },
  },
  en: {
    afterScene3: {
      question: 'With K=1, the IWAE bound equals the standard ELBO. What happens as K grows?',
      choices: [
        'The bound decreases away from log p(x)',
        'The bound rises monotonically toward log p(x)',
        'The bound oscillates around log p(x)',
        'The bound stays equal to the ELBO',
      ],
      correctIndex: 1,
      hint: 'The chain of inequalities is L_1 <= L_K <= log p(x). What happens as K grows?',
      explanation: 'The IWAE bound rises monotonically with K: L_1 <= L_2 <= ... <= L_K <= log p(x). Each additional sample tightens the bound, with diminishing returns.',
    },
    afterScene6: {
      question: 'The SNR trade-off in IWAE means that very large K...',
      choices: [
        'Improves both the bound and encoder gradient',
        'Worsens both the bound and encoder gradient',
        'Improves the bound but degrades the encoder gradient',
        'Has no effect on training',
      ],
      correctIndex: 2,
      hint: 'The bound improves with K, but the signal-to-noise ratio of the encoder gradient...',
      explanation: 'With large K, the IWAE bound gets closer to log p(x) (better evaluation), but the signal-to-noise ratio of the encoder gradient decreases, causing the encoder to stop improving during training.',
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
