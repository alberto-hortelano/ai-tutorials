// Bilingual text for DDPM vs DDIM lesson

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
    lessonTitle: 'DDPM vs DDIM',
    lessonSubtitle: 'Muestreo estocastico vs deterministico en modelos de difusion',
    scene1: {
      id: 'DDPM recap',
      narration: 'DDPM genera muestras con ruido estocastico en cada paso, como un caminante que sigue un sendero pero zigzaguea con cada brisa. Desde el mismo punto de partida, cada trayectoria diverge. Diversidad alta, pero mil pasos secuenciales.',
      subtitleCues: [
        { time: 0.0, text: 'DDPM: caminante zigzagueando con la brisa' },
        { time: 0.14, text: 'Ruido aleatorio inyectado en cada paso' },
        { time: 0.28, text: 'Mismo punto de inicio: resultados distintos' },
        { time: 0.42, text: 'Trayectorias divergentes: alta diversidad' },
        { time: 0.57, text: 'p_theta(x_{t-1}|x_t) = N(mu_theta, sigma^2 I)' },
        { time: 0.71, text: 'T = 1000 pasos secuenciales' },
        { time: 0.85, text: 'Calidad excelente pero muy lento' },
      ],
      topic: 'DDPM sampling: p_theta(x_{t-1}|x_t) = N(mu_theta, sigma^2 I). Stochastic. 1000 steps. High diversity.',
      title: 'DDPM: muestreo estocastico',
      sameStart: 'Mismo ruido inicial',
      branch1: 'Trayectoria 1',
      branch2: 'Trayectoria 2',
      branch3: 'Trayectoria 3',
      stochastic: 'Estocastico',
    },
    scene2: {
      id: 'Speed problem',
      narration: 'El problema de velocidad: DDPM necesita mil pasos secuenciales. A 50 milisegundos por paso, una imagen tarda 50 segundos. Mientras tanto, un GAN genera en milisegundos. Es como ir de Madrid a Barcelona caminando cuando existe el AVE.',
      subtitleCues: [
        { time: 0.0, text: 'El problema: velocidad' },
        { time: 0.14, text: '1000 pasos x 50ms = 50 segundos' },
        { time: 0.28, text: 'Como caminar Madrid-Barcelona' },
        { time: 0.42, text: 'GAN: 1 paso forward, milisegundos' },
        { time: 0.57, text: 'GAN es el AVE: rapido pero con equipaje' },
        { time: 0.71, text: '1000x mas lento que un GAN' },
        { time: 0.85, text: 'Necesitamos acelerar la difusion' },
      ],
      topic: 'Speed bottleneck: DDPM requires T=1000 sequential denoising steps. Comparison with single-pass models like GANs.',
      title: 'El problema de velocidad',
      ddpmTime: 'DDPM: 1000 pasos',
      ddpmSeconds: '~50 segundos',
      ganTime: 'GAN: 1 paso',
      ganSeconds: '~0.05 segundos',
      ratio: '1000x mas lento',
    },
    scene3: {
      id: 'DDIM deterministic',
      narration: 'DDIM comparte exactamente la misma red neuronal que DDPM. La diferencia es solo el algoritmo de muestreo: elimina el termino estocastico. El resultado es una trayectoria unica y deterministica. Misma entrada, misma salida, siempre. Una curva limpia en vez de un arbol de ramas.',
      subtitleCues: [
        { time: 0.0, text: 'DDIM: misma red, distinto muestreo' },
        { time: 0.14, text: 'Eliminar el termino estocastico (sigma_t = 0)' },
        { time: 0.28, text: 'Trayectoria deterministica unica' },
        { time: 0.42, text: 'Misma entrada = misma salida, siempre' },
        { time: 0.57, text: 'Curva limpia vs arbol de ramas' },
        { time: 0.71, text: 'Proceso no-markoviano' },
        { time: 0.85, text: 'Misma red entrenada, diferente sampler' },
      ],
      topic: 'DDIM: non-Markovian reverse process. Setting sigma_t=0 gives deterministic sampling. Same noise -> same output.',
      title: 'DDIM: muestreo deterministico',
      singlePath: 'Trayectoria unica',
      deterministic: 'Deterministico',
      ddpmLabel: 'DDPM: multiples caminos',
      ddimLabel: 'DDIM: un solo camino',
    },
    scene4: {
      id: 'Skipping steps',
      narration: 'Dado que DDIM traza una curva suave y deterministica, podemos saltar pasos como tomar un vuelo directo en vez de parar en cada ciudad. En vez de mil pasos, tomamos 50 puntos equidistantes. El camino suave permite saltos grandes sin perder la esencia.',
      subtitleCues: [
        { time: 0.0, text: 'DDIM permite saltar pasos' },
        { time: 0.14, text: 'Vuelo directo vs parar en cada ciudad' },
        { time: 0.28, text: 'Trayectoria suave: no necesitamos todos' },
        { time: 0.42, text: '50 pasos en vez de 1000' },
        { time: 0.57, text: 'Subsequencia tau: puntos equidistantes' },
        { time: 0.71, text: 'Saltos grandes en una curva suave' },
        { time: 0.85, text: '20x mas rapido con calidad similar' },
      ],
      topic: 'DDIM step skipping: use a subsequence tau of [1..T]. Smooth trajectory allows large jumps. 50 steps typical.',
      title: 'Saltando pasos',
      fullPath: '1000 pasos (todos)',
      skippedPath: '50 pasos (cada 20)',
      checkpoint: 'Checkpoint',
      speedup: '20x mas rapido',
    },
    scene5: {
      id: 'Quality vs speed',
      narration: 'La grafica de calidad versus pasos revela el sweet spot. DDPM colapsa con pocos pasos, pero DDIM mantiene buena calidad hasta 50 o incluso 10 pasos. Tres perspectivas equivalentes del UNet: predecir ruido, predecir score, o predecir x cero directamente.',
      subtitleCues: [
        { time: 0.0, text: 'Calidad vs velocidad: el sweet spot' },
        { time: 0.14, text: 'DDPM: colapsa con pocos pasos' },
        { time: 0.28, text: 'DDIM: buena calidad con ~50 pasos' },
        { time: 0.42, text: 'FID vs pasos: DDIM gana claramente' },
        { time: 0.57, text: 'Tres perspectivas del UNet:' },
        { time: 0.71, text: 'Predecir epsilon, score, o x_0' },
        { time: 0.85, text: 'Matematicamente equivalentes' },
      ],
      topic: 'FID vs number of steps. DDPM degrades quickly with fewer steps. DDIM maintains quality. Sweet spot at ~50 steps.',
      title: 'Calidad vs velocidad',
      xAxis: 'Pasos (log scale)',
      yAxis: 'FID (menor = mejor)',
      ddpmLabel: 'DDPM',
      ddimLabel: 'DDIM',
      sweetSpot: 'Sweet spot',
    },
    scene6: {
      id: 'Latent interpolation',
      narration: 'Ventaja exclusiva de DDIM: como el mapeo es deterministico, interpolar en el espacio de ruido produce transiciones suaves entre imagenes. Mezcla dos vectores de ruido con slerp, decodifica con DDIM, y los rostros se transforman suavemente. Pasos tempranos definen estructura global, tardios refinan detalles.',
      subtitleCues: [
        { time: 0.0, text: 'Interpolacion: exclusiva de DDIM' },
        { time: 0.14, text: 'Mapeo deterministico = interpolacion suave' },
        { time: 0.28, text: 'slerp(z_1, z_2, alpha) en espacio de ruido' },
        { time: 0.42, text: 'Transiciones semanticas suaves' },
        { time: 0.57, text: 'Pasos tempranos: estructura global' },
        { time: 0.71, text: 'Pasos tardios: refinan detalles finos' },
        { time: 0.85, text: 'UNet: escultor jerarquico' },
      ],
      topic: 'Latent interpolation: z_alpha = slerp(z_1, z_2, alpha). DDIM maps deterministically. Smooth semantic transitions.',
      title: 'Interpolacion latente',
      noise1: 'z_1',
      noise2: 'z_2',
      interpLabel: 'slerp(z_1, z_2, alpha)',
      resultLabel: 'Transicion suave',
    },
    scene7: {
      id: 'Comparison summary',
      narration: 'Resumen final: DDPM y DDIM comparten exactamente el mismo modelo entrenado. La unica diferencia es el sampler. DDPM da maxima calidad con diversidad estocastica. DDIM da velocidad con determinismo e interpolacion. Elige segun tu necesidad.',
      subtitleCues: [
        { time: 0.0, text: 'DDPM vs DDIM: mismo modelo, diferente sampler' },
        { time: 0.14, text: 'DDPM: estocastico, diverso, 1000 pasos' },
        { time: 0.28, text: 'DDIM: deterministico, 50 pasos' },
        { time: 0.42, text: 'DDIM permite interpolacion latente' },
        { time: 0.57, text: 'DDPM: maxima calidad cuando hay tiempo' },
        { time: 0.71, text: 'DDIM: velocidad y control' },
        { time: 0.85, text: 'Elige segun tu necesidad' },
      ],
      topic: 'Summary comparison: DDPM vs DDIM on speed, quality, determinism, interpolation. Same trained model, different samplers.',
      title: 'Comparacion: DDPM vs DDIM',
      headerProperty: 'Propiedad',
      headerDDPM: 'DDPM',
      headerDDIM: 'DDIM',
      rowSpeed: 'Velocidad',
      rowQuality: 'Calidad',
      rowDeterminism: 'Determinismo',
      rowInterpolation: 'Interpolacion',
      ddpmSpeed: 'Lento (1000 pasos)',
      ddpmQuality: 'Excelente',
      ddpmDeterminism: 'No',
      ddpmInterpolation: 'No',
      ddimSpeed: 'Rapido (50 pasos)',
      ddimQuality: 'Muy buena',
      ddimDeterminism: 'Si',
      ddimInterpolation: 'Si',
      insight: 'Mismo modelo entrenado, diferente sampler',
    },
  },
  en: {
    lessonTitle: 'DDPM vs DDIM',
    lessonSubtitle: 'Stochastic vs deterministic sampling in diffusion models',
    scene1: {
      id: 'DDPM recap',
      narration: 'DDPM generates samples with stochastic noise at each step, like a hiker following a trail but zigzagging with every breeze. From the same starting point, each trajectory diverges. High diversity, but a thousand sequential steps.',
      subtitleCues: [
        { time: 0.0, text: 'DDPM: hiker zigzagging with the breeze' },
        { time: 0.14, text: 'Random noise injected at each step' },
        { time: 0.28, text: 'Same start: different results each time' },
        { time: 0.42, text: 'Divergent trajectories: high diversity' },
        { time: 0.57, text: 'p_theta(x_{t-1}|x_t) = N(mu_theta, sigma^2 I)' },
        { time: 0.71, text: 'T = 1000 sequential steps' },
        { time: 0.85, text: 'Excellent quality but very slow' },
      ],
      topic: 'DDPM sampling: p_theta(x_{t-1}|x_t) = N(mu_theta, sigma^2 I). Stochastic. 1000 steps. High diversity.',
      title: 'DDPM: stochastic sampling',
      sameStart: 'Same initial noise',
      branch1: 'Trajectory 1',
      branch2: 'Trajectory 2',
      branch3: 'Trajectory 3',
      stochastic: 'Stochastic',
    },
    scene2: {
      id: 'Speed problem',
      narration: 'The speed problem: DDPM needs a thousand sequential steps. At 50 milliseconds per step, one image takes 50 seconds. Meanwhile, a GAN generates in milliseconds. It is like walking from New York to Boston when a bullet train exists.',
      subtitleCues: [
        { time: 0.0, text: 'The problem: speed' },
        { time: 0.14, text: '1000 steps x 50ms = 50 seconds' },
        { time: 0.28, text: 'Like walking NYC to Boston' },
        { time: 0.42, text: 'GAN: 1 forward pass, milliseconds' },
        { time: 0.57, text: 'GAN is the bullet train: fast but rigid' },
        { time: 0.71, text: '1000x slower than a GAN' },
        { time: 0.85, text: 'We need to accelerate diffusion' },
      ],
      topic: 'Speed bottleneck: DDPM requires T=1000 sequential denoising steps. Comparison with single-pass models like GANs.',
      title: 'The speed problem',
      ddpmTime: 'DDPM: 1000 steps',
      ddpmSeconds: '~50 seconds',
      ganTime: 'GAN: 1 step',
      ganSeconds: '~0.05 seconds',
      ratio: '1000x slower',
    },
    scene3: {
      id: 'DDIM deterministic',
      narration: 'DDIM shares the exact same neural network as DDPM. The only difference is the sampling algorithm: it removes the stochastic term. The result is a unique deterministic trajectory. Same input, same output, always. A clean curve instead of a branching tree.',
      subtitleCues: [
        { time: 0.0, text: 'DDIM: same network, different sampling' },
        { time: 0.14, text: 'Remove the stochastic term (sigma_t = 0)' },
        { time: 0.28, text: 'Unique deterministic trajectory' },
        { time: 0.42, text: 'Same input = same output, always' },
        { time: 0.57, text: 'Clean curve vs branching tree' },
        { time: 0.71, text: 'Non-Markovian process' },
        { time: 0.85, text: 'Same trained network, different sampler' },
      ],
      topic: 'DDIM: non-Markovian reverse process. Setting sigma_t=0 gives deterministic sampling. Same noise -> same output.',
      title: 'DDIM: deterministic sampling',
      singlePath: 'Single trajectory',
      deterministic: 'Deterministic',
      ddpmLabel: 'DDPM: multiple paths',
      ddimLabel: 'DDIM: single path',
    },
    scene4: {
      id: 'Skipping steps',
      narration: 'Since DDIM traces a smooth deterministic curve, we can skip steps like taking a direct flight instead of stopping at every city. Instead of a thousand steps, we take 50 evenly spaced points. The smooth path allows big jumps without losing the essence.',
      subtitleCues: [
        { time: 0.0, text: 'DDIM allows step skipping' },
        { time: 0.14, text: 'Direct flight vs stopping at every city' },
        { time: 0.28, text: 'Smooth trajectory: don\'t need all steps' },
        { time: 0.42, text: '50 steps instead of 1000' },
        { time: 0.57, text: 'Subsequence tau: evenly spaced points' },
        { time: 0.71, text: 'Big jumps on a smooth curve' },
        { time: 0.85, text: '20x faster with similar quality' },
      ],
      topic: 'DDIM step skipping: use a subsequence tau of [1..T]. Smooth trajectory allows large jumps. 50 steps typical.',
      title: 'Skipping steps',
      fullPath: '1000 steps (all)',
      skippedPath: '50 steps (every 20)',
      checkpoint: 'Checkpoint',
      speedup: '20x faster',
    },
    scene5: {
      id: 'Quality vs speed',
      narration: 'The quality vs steps chart reveals the sweet spot. DDPM collapses with few steps, but DDIM maintains good quality down to 50 or even 10 steps. Three equivalent UNet perspectives: predict noise, predict score, or predict x zero directly.',
      subtitleCues: [
        { time: 0.0, text: 'Quality vs speed: the sweet spot' },
        { time: 0.14, text: 'DDPM: collapses with few steps' },
        { time: 0.28, text: 'DDIM: good quality at ~50 steps' },
        { time: 0.42, text: 'FID vs steps: DDIM wins clearly' },
        { time: 0.57, text: 'Three UNet perspectives:' },
        { time: 0.71, text: 'Predict epsilon, score, or x_0' },
        { time: 0.85, text: 'Mathematically equivalent' },
      ],
      topic: 'FID vs number of steps. DDPM degrades quickly with fewer steps. DDIM maintains quality. Sweet spot at ~50 steps.',
      title: 'Quality vs speed',
      xAxis: 'Steps (log scale)',
      yAxis: 'FID (lower = better)',
      ddpmLabel: 'DDPM',
      ddimLabel: 'DDIM',
      sweetSpot: 'Sweet spot',
    },
    scene6: {
      id: 'Latent interpolation',
      narration: 'A DDIM exclusive: since the mapping is deterministic, interpolating in noise space yields smooth image transitions. Blend two noise vectors with slerp, decode with DDIM, and faces morph smoothly. Early steps define global structure, late steps refine fine details.',
      subtitleCues: [
        { time: 0.0, text: 'Interpolation: DDIM exclusive' },
        { time: 0.14, text: 'Deterministic mapping = smooth interpolation' },
        { time: 0.28, text: 'slerp(z_1, z_2, alpha) in noise space' },
        { time: 0.42, text: 'Smooth semantic transitions' },
        { time: 0.57, text: 'Early steps: global structure' },
        { time: 0.71, text: 'Late steps: refine fine details' },
        { time: 0.85, text: 'UNet: hierarchical sculptor' },
      ],
      topic: 'Latent interpolation: z_alpha = slerp(z_1, z_2, alpha). DDIM maps deterministically. Smooth semantic transitions.',
      title: 'Latent interpolation',
      noise1: 'z_1',
      noise2: 'z_2',
      interpLabel: 'slerp(z_1, z_2, alpha)',
      resultLabel: 'Smooth transition',
    },
    scene7: {
      id: 'Comparison summary',
      narration: 'Final summary: DDPM and DDIM share the exact same trained model. The only difference is the sampler. DDPM gives maximum quality with stochastic diversity. DDIM gives speed with determinism and interpolation. Choose based on your needs.',
      subtitleCues: [
        { time: 0.0, text: 'DDPM vs DDIM: same model, different sampler' },
        { time: 0.14, text: 'DDPM: stochastic, diverse, 1000 steps' },
        { time: 0.28, text: 'DDIM: deterministic, 50 steps' },
        { time: 0.42, text: 'DDIM enables latent interpolation' },
        { time: 0.57, text: 'DDPM: max quality when time allows' },
        { time: 0.71, text: 'DDIM: speed and control' },
        { time: 0.85, text: 'Choose based on your needs' },
      ],
      topic: 'Summary comparison: DDPM vs DDIM on speed, quality, determinism, interpolation. Same trained model, different samplers.',
      title: 'Comparison: DDPM vs DDIM',
      headerProperty: 'Property',
      headerDDPM: 'DDPM',
      headerDDIM: 'DDIM',
      rowSpeed: 'Speed',
      rowQuality: 'Quality',
      rowDeterminism: 'Determinism',
      rowInterpolation: 'Interpolation',
      ddpmSpeed: 'Slow (1000 steps)',
      ddpmQuality: 'Excellent',
      ddpmDeterminism: 'No',
      ddpmInterpolation: 'No',
      ddimSpeed: 'Fast (50 steps)',
      ddimQuality: 'Very good',
      ddimDeterminism: 'Yes',
      ddimInterpolation: 'Yes',
      insight: 'Same trained model, different sampler',
    },
  },
};

// -- Questions (bilingual) --

export const questions: Record<Lang, {
  afterDDIM: import('../../engine/types').QuestionData;
  afterComparison: import('../../engine/types').QuestionData;
}> = {
  es: {
    afterDDIM: {
      question: 'DDIM es mas rapido que DDPM porque...',
      choices: [
        'Usa una red neuronal mas pequena',
        'Su trayectoria suave y deterministica permite saltar pasos',
        'Entrena con menos datos',
        'No necesita predecir ruido',
      ],
      correctIndex: 1,
      hint: 'La trayectoria de DDIM es una curva suave, no un arbol ramificado.',
      explanation: 'DDIM elimina la estocasticidad, creando una trayectoria deterministica suave. Esto permite usar una subsecuencia de solo 50 pasos en vez de 1000.',
    },
    afterComparison: {
      question: 'DDIM permite interpolacion latente porque...',
      choices: [
        'Entrena una red especial para interpolacion',
        'Su mapeo deterministico garantiza: misma entrada = misma salida',
        'Usa un espacio latente diferente al de DDPM',
        'DDPM tambien permite interpolacion pero es mas lenta',
      ],
      correctIndex: 1,
      hint: 'El determinismo es clave: misma entrada produce siempre la misma imagen.',
      explanation: 'Como DDIM mapea deterministicamente del ruido a la imagen, mezclar ruidos con slerp produce transiciones semanticas suaves y reproducibles.',
    },
  },
  en: {
    afterDDIM: {
      question: 'DDIM is faster than DDPM because...',
      choices: [
        'It uses a smaller neural network',
        'Its smooth deterministic trajectory allows step skipping',
        'It trains on less data',
        'It does not need to predict noise',
      ],
      correctIndex: 1,
      hint: 'DDIM\'s trajectory is a smooth curve, not a branching tree.',
      explanation: 'DDIM removes stochasticity, creating a smooth deterministic trajectory. This allows using a subsequence of only 50 steps instead of 1000.',
    },
    afterComparison: {
      question: 'DDIM allows latent interpolation because...',
      choices: [
        'It trains a special network for interpolation',
        'Its deterministic mapping guarantees: same input = same output',
        'It uses a different latent space than DDPM',
        'DDPM also allows interpolation but it is slower',
      ],
      correctIndex: 1,
      hint: 'Determinism is key: same input always produces the same image.',
      explanation: 'Since DDIM maps deterministically from noise to image, blending noises with slerp produces smooth and reproducible semantic transitions.',
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
