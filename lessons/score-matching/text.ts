// Bilingual text for Score Matching lesson

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
    lessonTitle: 'Score Matching',
    lessonSubtitle: 'Aprendiendo gradientes sin la funcion de particion',
    scene1: {
      id: 'La funcion score',
      narration: 'Imagina que estas con los ojos vendados en una montana. No puedes ver tu altitud, pero sientes que direccion sube. Eso es el score: la brujula que apunta hacia mayor densidad. En los picos de la distribucion, el score es cero porque no hay direccion preferida.',
      subtitleCues: [
        { time: 0.0, text: 'Con los ojos vendados en una montana' },
        { time: 0.14, text: 's(x) = \u2207_x log p(x)' },
        { time: 0.28, text: 'No ves la altitud, pero sientes la pendiente' },
        { time: 0.42, text: 'Score: brujula hacia mayor probabilidad' },
        { time: 0.57, text: 'En los modos: score = 0 (ya en el pico)' },
        { time: 0.71, text: 'Lejos del modo: flechas fuertes apuntando a el' },
        { time: 0.85, text: 'Campo vectorial sobre todo el espacio' },
      ],
      topic: 'Score function s(x) = \u2207_x log p(x). Vector field pointing toward high density. Zero at modes.',
      title: 'La funcion score',
      atMode: 'En el modo: s(x) = 0',
      awayFromMode: 'Lejos del modo: s(x) apunta hacia el',
      fieldLabel: 'Campo de score',
    },
    scene2: {
      id: '\u00bfPor que scores? Sin particion',
      narration: 'La magia: al tomar el gradiente del logaritmo respecto a x, el termino log Z se evapora. Z es una constante respecto a x, asi que su derivada es cero. Es como encontrar un tesoro sin saber su ubicacion exacta: solo necesitas la brujula.',
      subtitleCues: [
        { time: 0.0, text: '\u2207_x log(exp(\u2212E)/Z) = ?' },
        { time: 0.14, text: '= \u2212\u2207_x E \u2212 \u2207_x log Z' },
        { time: 0.28, text: '\u2207_x log Z = 0 (Z no depende de x)' },
        { time: 0.42, text: '\u00a1log Z se evapora!' },
        { time: 0.57, text: 'Tesoro sin ubicacion: solo la brujula' },
        { time: 0.71, text: 's(x) = \u2212\u2207_x E(x) directamente' },
        { time: 0.85, text: 'Eliminamos el problema intratable' },
      ],
      topic: 'Score elimina Z. \u2207 log(exp(-E)/Z) = -\u2207E - \u2207logZ = -\u2207E. El termino de normalizacion desaparece.',
      title: '\u00bfPor que scores? Sin particion',
      step1: '\u2207_x log p(x) = \u2207_x log exp(\u2212E) \u2212 \u2207_x log Z',
      step2: '= \u2212\u2207_x E(x) \u2212 0',
      cancellation: '\u00a1log Z desaparece!',
      result: 's(x) = \u2212\u2207_x E(x)',
    },
    scene3: {
      id: 'Objetivo de score matching',
      narration: 'El objetivo ideal es alinear dos campos de viento. El campo verde es el score verdadero de los datos, desconocido. El violeta es nuestro modelo aprendido. Queremos que cada flecha aprendida coincida con la verdadera. La perdida mide la distancia cuadratica media entre ambos campos.',
      subtitleCues: [
        { time: 0.0, text: 'Alinear dos campos de viento' },
        { time: 0.14, text: 'J = (1/2) E_p[||s_\u03b8(x) \u2212 \u2207log p_{data}||^2]' },
        { time: 0.28, text: 'Campo verde: score verdadero (desconocido)' },
        { time: 0.42, text: 'Campo violeta: score aprendido s_\u03b8' },
        { time: 0.57, text: 'Cada flecha debe coincidir con la verdadera' },
        { time: 0.71, text: 'La norma del score indica fuerza del viento' },
        { time: 0.85, text: 'Problema: no conocemos el score verdadero' },
      ],
      topic: 'Score matching objective J = E[||s_\u03b8 - \u2207log p_data||^2]. True score unknown. Must align vector fields.',
      title: 'Objetivo de score matching',
      trueScore: 'Score verdadero (desconocido)',
      learnedScore: 'Score aprendido s_\u03b8',
      unknown: '?',
      goalLabel: 'Minimizar ||s_\u03b8 \u2212 \u2207log p||^2',
    },
    scene4: {
      id: 'El truco de Hyv\u00e4rinen',
      narration: 'Integracion por partes al rescate: Hyv\u00e4rinen demostro que podemos reescribir el objetivo sin necesitar el score verdadero. El Jacobiano del score mide como cambian las direcciones del viento. Su traza mas la norma al cuadrado nos dan el mismo optimo.',
      subtitleCues: [
        { time: 0.0, text: 'Integracion por partes al rescate' },
        { time: 0.14, text: 'J = E_p[tr(\u2207s_\u03b8) + (1/2)||s_\u03b8||^2]' },
        { time: 0.28, text: 'Jacobiano: como cambia la direccion del viento' },
        { time: 0.42, text: 'Traza del Jacobiano: divergencia del campo' },
        { time: 0.57, text: '\u00a1El score verdadero se elimina!' },
        { time: 0.71, text: 'Solo necesitamos s_\u03b8 y su Jacobiano' },
        { time: 0.85, text: 'Mismo optimo, formula computable' },
      ],
      topic: 'Hyv\u00e4rinen trick: integration by parts. J = E[tr(\u2207s_\u03b8) + ||s_\u03b8||^2/2]. True score eliminated.',
      title: 'El truco de Hyv\u00e4rinen',
      before: 'Antes: necesitamos \u2207log p_{data}',
      magic: 'Integracion por partes',
      after: 'Despues: solo s_\u03b8 y tr(\u2207s_\u03b8)',
      eliminated: '\u00a1Score verdadero eliminado!',
    },
    scene5: {
      id: 'Sliced Score Matching',
      narration: 'Calcular la traza del Jacobiano cuesta d backprops, una por dimension. En imagenes de 256 por 256, eso seria imposible. Sliced score matching proyecta en una direccion aleatoria como mirar por una rendija y estima la traza con una sola pasada.',
      subtitleCues: [
        { time: 0.0, text: 'tr(\u2207s_\u03b8) cuesta d evaluaciones' },
        { time: 0.14, text: 'Imagen 256x256: d = 196608 \u2192 imposible' },
        { time: 0.28, text: 'Proyectar en direccion aleatoria v' },
        { time: 0.42, text: 'Como mirar por una rendija' },
        { time: 0.57, text: 'v^T (\u2207s_\u03b8) v: una sola pasada' },
        { time: 0.71, text: 'E_v[v^T \u2207s v] = tr(\u2207s) (insesgado)' },
        { time: 0.85, text: 'De O(d) a O(1) backprops' },
      ],
      topic: 'Sliced score matching: project onto random v. v^T(\u2207s)v cheaper than tr(\u2207s). Unbiased estimator.',
      title: 'Sliced Score Matching',
      expensive: 'tr(\u2207s_\u03b8): O(d) backprops',
      cheap: 'v^T(\u2207s_\u03b8)v: O(1) backprop',
      randomDir: 'Direccion aleatoria v',
      projection: 'Proyeccion 1D',
    },
    scene6: {
      id: 'Denoising Score Matching',
      narration: 'Idea elegante: en vez de preguntar hacia donde crece la densidad, preguntamos de donde vino el ruido. Anadimos ruido gaussiano a los datos y entrenamos la red para apuntar desde la muestra ruidosa hacia la limpia. Es la formula de Tweedie: el score optimo es la direccion de denoising.',
      subtitleCues: [
        { time: 0.0, text: 'En vez de direccion de densidad...' },
        { time: 0.14, text: '...preguntamos: de donde vino el ruido?' },
        { time: 0.28, text: 'Anadir ruido gaussiano a los datos' },
        { time: 0.42, text: 'Score de p_noisy apunta hacia datos limpios' },
        { time: 0.57, text: 's(x_tilde) = (x \u2212 x_tilde) / \u03c3^2 (Tweedie)' },
        { time: 0.71, text: 'Entrenar: predecir direccion de denoising' },
        { time: 0.85, text: 'Equivalente a score matching exacto' },
      ],
      topic: 'Denoising score matching: add noise, learn to denoise. Score of noisy dist points from noisy x_tilde toward clean x.',
      title: 'Denoising Score Matching',
      cleanData: 'Datos limpios x',
      noisyData: 'Datos ruidosos x_tilde',
      arrowLabel: 's(x_tilde) apunta a x',
      equivalent: 'Equivalente a score matching',
    },
    scene7: {
      id: 'Ruido multi-escala',
      narration: 'Con poco ruido, el score es preciso pero solo funciona cerca de los datos. Con mucho ruido, el score es suave y cubre todo el espacio como un mapa a gran escala. Usar multiples escalas captura ambos regimenes. Esta idea es la semilla directa de los modelos de difusion.',
      subtitleCues: [
        { time: 0.0, text: 'Poco ruido: detalle fino cerca de datos' },
        { time: 0.14, text: 'Como un mapa de alta resolucion local' },
        { time: 0.28, text: 'Mucho ruido: estructura global suave' },
        { time: 0.42, text: 'Como un mapa a vista de pajaro' },
        { time: 0.57, text: 'Multiples \u03c3: lo mejor de ambos mundos' },
        { time: 0.71, text: 'Escalera de niveles de ruido' },
        { time: 0.85, text: 'Semilla directa de modelos de difusion' },
      ],
      topic: 'Multi-scale noise: low \u03c3 = fine detail, high \u03c3 = smooth global. Multiple scales bridge to diffusion models.',
      title: 'Ruido multi-escala',
      lowNoise: '\u03c3 pequeno: detalle fino',
      highNoise: '\u03c3 grande: global suave',
      multiScale: 'Multiples escalas de ruido',
      bridge: 'Esto lleva a modelos de difusion...',
    },
  },
  en: {
    lessonTitle: 'Score Matching',
    lessonSubtitle: 'Learning gradients without the partition function',
    scene1: {
      id: 'The score function',
      narration: 'Imagine you are blindfolded on a mountain. You cannot see your altitude, but you feel which direction goes uphill. That is the score: a compass pointing toward higher density. At the peaks of the distribution, the score is zero because there is no preferred direction.',
      subtitleCues: [
        { time: 0.0, text: 'Blindfolded on a mountain' },
        { time: 0.14, text: 's(x) = \u2207_x log p(x)' },
        { time: 0.28, text: 'Cannot see altitude, but feel the slope' },
        { time: 0.42, text: 'Score: compass toward higher probability' },
        { time: 0.57, text: 'At the modes: score = 0 (already at the peak)' },
        { time: 0.71, text: 'Far from mode: strong arrows pointing to it' },
        { time: 0.85, text: 'Vector field over all space' },
      ],
      topic: 'Score function s(x) = \u2207_x log p(x). Vector field pointing toward high density. Zero at modes.',
      title: 'The score function',
      atMode: 'At the mode: s(x) = 0',
      awayFromMode: 'Away from mode: s(x) points toward it',
      fieldLabel: 'Score field',
    },
    scene2: {
      id: 'Why scores? No partition',
      narration: 'The magic: when taking the gradient of the logarithm with respect to x, the log Z term evaporates. Z is a constant with respect to x, so its derivative is zero. It is like finding treasure without knowing its exact location: you only need the compass.',
      subtitleCues: [
        { time: 0.0, text: '\u2207_x log(exp(\u2212E)/Z) = ?' },
        { time: 0.14, text: '= \u2212\u2207_x E \u2212 \u2207_x log Z' },
        { time: 0.28, text: '\u2207_x log Z = 0 (Z does not depend on x)' },
        { time: 0.42, text: 'log Z evaporates!' },
        { time: 0.57, text: 'Treasure without location: just the compass' },
        { time: 0.71, text: 's(x) = \u2212\u2207_x E(x) directly' },
        { time: 0.85, text: 'The intractable problem is bypassed' },
      ],
      topic: 'Score eliminates Z. \u2207 log(exp(-E)/Z) = -\u2207E - \u2207logZ = -\u2207E. Normalization term vanishes.',
      title: 'Why scores? No partition',
      step1: '\u2207_x log p(x) = \u2207_x log exp(\u2212E) \u2212 \u2207_x log Z',
      step2: '= \u2212\u2207_x E(x) \u2212 0',
      cancellation: 'log Z vanishes!',
      result: 's(x) = \u2212\u2207_x E(x)',
    },
    scene3: {
      id: 'Score matching objective',
      narration: 'The ideal goal is to align two wind fields. The green field is the true data score, unknown. The violet one is our learned model. We want every learned arrow to match the true one. The loss measures the mean squared distance between both fields.',
      subtitleCues: [
        { time: 0.0, text: 'Align two wind fields' },
        { time: 0.14, text: 'J = (1/2) E_p[||s_\u03b8(x) \u2212 \u2207log p_{data}||^2]' },
        { time: 0.28, text: 'Green field: true score (unknown)' },
        { time: 0.42, text: 'Violet field: learned score s_\u03b8' },
        { time: 0.57, text: 'Every arrow must match the true one' },
        { time: 0.71, text: 'Score norm indicates wind strength' },
        { time: 0.85, text: 'Problem: we do not know the true score' },
      ],
      topic: 'Score matching objective J = E[||s_\u03b8 - \u2207log p_data||^2]. True score unknown. Must align vector fields.',
      title: 'Score matching objective',
      trueScore: 'True score (unknown)',
      learnedScore: 'Learned score s_\u03b8',
      unknown: '?',
      goalLabel: 'Minimize ||s_\u03b8 \u2212 \u2207log p||^2',
    },
    scene4: {
      id: 'Hyv\u00e4rinen\'s trick',
      narration: 'Integration by parts to the rescue: Hyv\u00e4rinen showed we can rewrite the objective without the true score. The Jacobian of the score measures how wind directions change. Its trace plus the squared norm give us the same optimum.',
      subtitleCues: [
        { time: 0.0, text: 'Integration by parts to the rescue' },
        { time: 0.14, text: 'J = E_p[tr(\u2207s_\u03b8) + (1/2)||s_\u03b8||^2]' },
        { time: 0.28, text: 'Jacobian: how wind direction changes' },
        { time: 0.42, text: 'Trace of Jacobian: field divergence' },
        { time: 0.57, text: 'True score is eliminated!' },
        { time: 0.71, text: 'Only need s_\u03b8 and its Jacobian' },
        { time: 0.85, text: 'Same optimum, computable formula' },
      ],
      topic: 'Hyv\u00e4rinen trick: integration by parts. J = E[tr(\u2207s_\u03b8) + ||s_\u03b8||^2/2]. True score eliminated.',
      title: 'Hyv\u00e4rinen\'s trick',
      before: 'Before: need \u2207log p_{data}',
      magic: 'Integration by parts',
      after: 'After: only s_\u03b8 and tr(\u2207s_\u03b8)',
      eliminated: 'True score eliminated!',
    },
    scene5: {
      id: 'Sliced Score Matching',
      narration: 'Computing the Jacobian trace costs d backprops, one per dimension. For a 256 by 256 image that would be impossible. Sliced score matching projects onto a random direction like peeping through a slit and estimates the trace in a single pass.',
      subtitleCues: [
        { time: 0.0, text: 'tr(\u2207s_\u03b8) costs d evaluations' },
        { time: 0.14, text: '256x256 image: d = 196608 \u2192 impossible' },
        { time: 0.28, text: 'Project onto random direction v' },
        { time: 0.42, text: 'Like peeping through a slit' },
        { time: 0.57, text: 'v^T (\u2207s_\u03b8) v: a single pass' },
        { time: 0.71, text: 'E_v[v^T \u2207s v] = tr(\u2207s) (unbiased)' },
        { time: 0.85, text: 'From O(d) to O(1) backprops' },
      ],
      topic: 'Sliced score matching: project onto random v. v^T(\u2207s)v cheaper than tr(\u2207s). Unbiased estimator.',
      title: 'Sliced Score Matching',
      expensive: 'tr(\u2207s_\u03b8): O(d) backprops',
      cheap: 'v^T(\u2207s_\u03b8)v: O(1) backprop',
      randomDir: 'Random direction v',
      projection: '1D projection',
    },
    scene6: {
      id: 'Denoising Score Matching',
      narration: 'An elegant idea: instead of asking which direction density grows, ask where the noise came from. Add Gaussian noise to the data and train the network to point from the noisy sample back to the clean one. This is Tweedie\'s formula: the optimal score is the denoising direction.',
      subtitleCues: [
        { time: 0.0, text: 'Instead of density direction...' },
        { time: 0.14, text: '...ask: where did the noise come from?' },
        { time: 0.28, text: 'Add Gaussian noise to the data' },
        { time: 0.42, text: 'Score of p_noisy points toward clean data' },
        { time: 0.57, text: 's(x_tilde) = (x \u2212 x_tilde) / \u03c3^2 (Tweedie)' },
        { time: 0.71, text: 'Train: predict the denoising direction' },
        { time: 0.85, text: 'Equivalent to exact score matching' },
      ],
      topic: 'Denoising score matching: add noise, learn to denoise. Score of noisy dist points from noisy x_tilde toward clean x.',
      title: 'Denoising Score Matching',
      cleanData: 'Clean data x',
      noisyData: 'Noisy data x_tilde',
      arrowLabel: 's(x_tilde) points to x',
      equivalent: 'Equivalent to score matching',
    },
    scene7: {
      id: 'Multi-scale noise',
      narration: 'With low noise the score is precise but only works near the data. With high noise the score is smooth and covers all space like a wide-angle map. Using multiple scales captures both regimes. This idea is the direct seed of diffusion models.',
      subtitleCues: [
        { time: 0.0, text: 'Low noise: fine detail near data' },
        { time: 0.14, text: 'Like a high-resolution local map' },
        { time: 0.28, text: 'High noise: smooth global structure' },
        { time: 0.42, text: 'Like a bird\'s-eye view map' },
        { time: 0.57, text: 'Multiple \u03c3: best of both worlds' },
        { time: 0.71, text: 'A staircase of noise levels' },
        { time: 0.85, text: 'Direct seed of diffusion models' },
      ],
      topic: 'Multi-scale noise: low \u03c3 = fine detail, high \u03c3 = smooth global. Multiple scales bridge to diffusion models.',
      title: 'Multi-scale noise',
      lowNoise: 'Small \u03c3: fine detail',
      highNoise: 'Large \u03c3: smooth global',
      multiScale: 'Multiple noise scales',
      bridge: 'This leads to diffusion models...',
    },
  },
};

// -- Questions (bilingual) --

export const questions: Record<Lang, {
  afterHyvarinen: import('../../engine/types').QuestionData;
  afterMultiScale: import('../../engine/types').QuestionData;
}> = {
  es: {
    afterHyvarinen: {
      question: 'En el truco de Hyv\u00e4rinen, la integracion por partes elimina el score verdadero. El nuevo objetivo contiene...',
      choices: [
        'La norma del score aprendido y la traza de su Jacobiano',
        'La KL divergence entre p_data y p_theta',
        'La funcion de particion Z y su gradiente',
        'Solo la norma del score verdadero',
      ],
      correctIndex: 0,
      hint: 'J = E_p[tr(\u2207s_\u03b8) + (1/2)||s_\u03b8||^2]',
      explanation: 'La integracion por partes transforma el objetivo a tr(\u2207s_\u03b8) + ||s_\u03b8||^2/2, eliminando la dependencia del score verdadero.',
    },
    afterMultiScale: {
      question: 'En denoising score matching, el score optimo de la distribucion ruidosa apunta...',
      choices: [
        'Desde la muestra ruidosa hacia la muestra limpia original',
        'Desde la muestra limpia hacia el ruido puro',
        'En direccion aleatoria, independiente de los datos',
        'Hacia el punto de maxima energia',
      ],
      correctIndex: 0,
      hint: 'Formula de Tweedie: s(x_tilde) = (x - x_tilde) / sigma^2',
      explanation: 'El score de la distribucion ruidosa apunta desde la muestra corrupta hacia el dato limpio original. Esto es la esencia de Tweedie.',
    },
  },
  en: {
    afterHyvarinen: {
      question: 'In Hyv\u00e4rinen\'s trick, integration by parts eliminates the true score. The new objective contains...',
      choices: [
        'The norm of the learned score and the trace of its Jacobian',
        'The KL divergence between p_data and p_theta',
        'The partition function Z and its gradient',
        'Only the norm of the true score',
      ],
      correctIndex: 0,
      hint: 'J = E_p[tr(\u2207s_\u03b8) + (1/2)||s_\u03b8||^2]',
      explanation: 'Integration by parts transforms the objective to tr(\u2207s_\u03b8) + ||s_\u03b8||^2/2, eliminating the dependence on the true score.',
    },
    afterMultiScale: {
      question: 'In denoising score matching, the optimal score of the noisy distribution points...',
      choices: [
        'From the noisy sample toward the original clean sample',
        'From the clean sample toward pure noise',
        'In a random direction, independent of the data',
        'Toward the maximum energy point',
      ],
      correctIndex: 0,
      hint: 'Tweedie\'s formula: s(x_tilde) = (x - x_tilde) / sigma^2',
      explanation: 'The score of the noisy distribution points from the corrupted sample toward the original clean data. This is the essence of Tweedie.',
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
