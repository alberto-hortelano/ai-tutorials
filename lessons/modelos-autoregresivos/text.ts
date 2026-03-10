// Bilingual text for Autoregressive Models lesson

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
    lessonTitle: 'Modelos Autoregresivos',
    lessonSubtitle: 'Densidad exacta con factorización secuencial',
    scene1: {
      id: 'La idea autoregresiva',
      narration: 'La idea autoregresiva es simple y poderosa: usamos la regla de la cadena directamente. Modelamos cada variable condicionada a las anteriores con una red neuronal. No es una aproximación, es un hecho matemático de probabilidad. Obtenemos verosimilitudes exactas.',
      subtitleCues: [
        { time: 0.0, text: 'Idea: regla de la cadena directamente' },
        { time: 0.12, text: 'p(x) = p(x₁)·p(x₂|x₁)·p(x₃|x₁,x₂)·...' },
        { time: 0.25, text: 'Cada p(xᵢ|x₁,...,xᵢ₋₁) con una red neuronal' },
        { time: 0.4, text: 'NO es una aproximación — es la regla de la cadena exacta' },
        { time: 0.55, text: 'Hecho matemático de probabilidad' },
        { time: 0.7, text: 'Verosimilitudes exactas, sin truco variacional' },
        { time: 0.82, text: 'Como un modelo de lenguaje: palabra por palabra' },
        { time: 0.92, text: 'p("El gato duerme") = p("El")·p("gato"|"El")·p("duerme"|"El gato")' },
      ],
      topic: 'Modelos autoregresivos: factorización por regla de la cadena. p(x) = ∏ p(xᵢ|x<i). Cada condicional modelado con red neuronal. Verosimilitudes exactas sin aproximación.',
      title: 'La idea autoregresiva',
      chainRule: 'Regla de la cadena',
      noApprox: 'Sin aproximaciones',
      exactLik: 'Verosimilitudes exactas',
    },
    scene2: {
      id: 'FVSBN',
      narration: 'El modelo más simple es FVSBN: cada condicional es una regresión logística sobre todas las variables anteriores. La probabilidad de x i igual a uno es la sigmoide de una combinación lineal. Funciona, pero necesita O de n cuadrado parámetros y cada condicional tiene su propio vector de pesos.',
      subtitleCues: [
        { time: 0.0, text: 'FVSBN: Fully Visible Sigmoid Belief Network' },
        { time: 0.12, text: 'Cada condicional = regresión logística' },
        { time: 0.25, text: 'p(xᵢ=1|x<i) = σ(αᵢ + Σ wᵢⱼ·xⱼ)' },
        { time: 0.4, text: 'Cada condicional tiene su propio vector de pesos' },
        { time: 0.55, text: 'Parámetros: O(n²) — crece rápido' },
        { time: 0.7, text: 'Simple pero limitado: solo lineal en las entradas' },
        { time: 0.82, text: 'No comparte información entre condicionales' },
        { time: 0.92, text: '¿Podemos hacer algo más inteligente?' },
      ],
      topic: 'FVSBN: Fully Visible Sigmoid Belief Network. Cada condicional es regresión logística. p(xᵢ=1|x<i) = σ(αᵢ + Σ wᵢⱼ·xⱼ). Parámetros O(n²).',
      title: 'FVSBN',
      fullName: 'Fully Visible Sigmoid Belief Network',
      logistic: 'Regresión logística',
      params: 'Parámetros: O(n²)',
      sigmoid: 'σ(z)',
    },
    scene3: {
      id: 'NADE',
      narration: 'NADE mejora esto con una idea clave: compartir la matriz de pesos W entre todas las condicionales. Cada oculta h i usa las mismas columnas de W. Pasamos de O de n cuadrado d a O de n d parámetros. Además hay un truco recursivo: cada activación reutiliza la anterior, como construir una escalera peldaño a peldaño.',
      subtitleCues: [
        { time: 0.0, text: 'NADE: compartir pesos W entre condicionales' },
        { time: 0.12, text: 'hᵢ = σ(W[:,<i]·x<i + c)' },
        { time: 0.25, text: 'Misma matriz W para todas las condicionales' },
        { time: 0.4, text: 'O(nd) en vez de O(n²d) — ahorro significativo' },
        { time: 0.55, text: 'Truco recursivo: a(i+1) = a(i) + W[:,i]·xᵢ' },
        { time: 0.7, text: 'Como construir una escalera peldaño a peldaño' },
        { time: 0.82, text: 'Cada paso reutiliza el cálculo anterior' },
        { time: 0.92, text: 'Eficiente y expresivo: lo mejor de ambos mundos' },
      ],
      topic: 'NADE: Neural Autoregressive Density Estimator. Pesos compartidos W. hᵢ = σ(W[:,<i]·x<i + c). O(nd) parámetros. Truco recursivo a(i+1) = a(i) + W[:,i]·xᵢ.',
      title: 'NADE: pesos compartidos',
      sharedW: 'Pesos compartidos W',
      separate: 'Pesos separados',
      shared: 'Pesos compartidos',
      paramsBefore: 'O(n²d)',
      paramsAfter: 'O(nd)',
      recursive: 'Truco recursivo',
    },
    scene4: {
      id: 'Densidad rápida',
      narration: 'Una gran ventaja: dado un dato x, podemos calcular todas las condicionales en paralelo con una sola pasada forward. Es como leer una oración completa de un vistazo. Sumamos los logaritmos y obtenemos log p de x exacto. La evaluación de densidad es rápida.',
      subtitleCues: [
        { time: 0.0, text: 'Dado x, todas las condicionales en paralelo' },
        { time: 0.12, text: 'Como leer una oración completa de un vistazo' },
        { time: 0.25, text: 'Una sola pasada forward por la red' },
        { time: 0.4, text: 'log p(x) = Σ log p(xᵢ|x<i)' },
        { time: 0.55, text: 'Suma de logs = producto de probabilidades' },
        { time: 0.7, text: 'Densidad exacta, no una cota inferior' },
        { time: 0.82, text: 'Densidad: RÁPIDA — O(1) pasadas de red' },
        { time: 0.92, text: 'Ideal para entrenamiento con MLE' },
      ],
      topic: 'Evaluación de densidad en modelos autoregresivos. Dado x, todas las condicionales se computan en paralelo. Una forward pass. log p(x) = Σ log p(xᵢ|x<i). O(1) pasadas de red.',
      title: 'Densidad: rápida',
      parallel: 'Todas en paralelo',
      onePass: 'Una pasada forward',
      fast: 'RÁPIDA',
      logP: 'log p(x)',
    },
    scene5: {
      id: 'Muestreo lento',
      narration: 'Pero muestrear es otra historia. Para generar una muestra, primero muestreamos x uno, luego x dos condicionado a x uno, y así sucesivamente. Es como escribir una oración palabra por palabra: no puedes escribir la última sin las anteriores. Son n pasos secuenciales: el muestreo es inherentemente lento.',
      subtitleCues: [
        { time: 0.0, text: 'Generar muestra: x₁ ~ p(x₁)' },
        { time: 0.12, text: 'x₂ ~ p(x₂|x₁) — necesita x₁ primero' },
        { time: 0.25, text: 'x₃ ~ p(x₃|x₁,x₂) — necesita x₁ y x₂' },
        { time: 0.4, text: 'Como escribir una oración palabra por palabra' },
        { time: 0.55, text: 'No puedes escribir la última sin las anteriores' },
        { time: 0.68, text: 'Cada paso necesita el resultado del anterior' },
        { time: 0.8, text: 'n pasos secuenciales: LENTO' },
        { time: 0.92, text: 'Densidad = leer (paralelo). Muestreo = escribir (secuencial)' },
      ],
      topic: 'Muestreo en modelos autoregresivos. Secuencial: x₁~p(x₁), x₂~p(x₂|x₁), ... Cada paso depende del anterior. O(n) pasos secuenciales. Muestreo lento.',
      title: 'Muestreo: lento',
      step: 'Paso',
      sequential: 'Secuencial',
      slow: 'LENTO',
      waiting: 'Esperando...',
      sampled: 'Muestreado',
    },
    scene6: {
      id: 'El trade-off fundamental',
      narration: 'Este es el trade-off fundamental. Densidad en una pasada paralela, muestreo en n pasadas secuenciales. Hay una asimetría crucial en entrenamiento: teacher forcing usa datos reales como contexto, pero al generar, el modelo usa sus propias predicciones. Este dilema motiva MAF e IAF.',
      subtitleCues: [
        { time: 0.0, text: 'Densidad: O(1) pasadas (paralelo)' },
        { time: 0.12, text: 'Muestreo: O(n) pasadas (secuencial)' },
        { time: 0.25, text: 'Trade-off fundamental de AR' },
        { time: 0.4, text: 'Teacher forcing: entrenamiento usa datos reales' },
        { time: 0.55, text: 'Generación: usa sus propias predicciones' },
        { time: 0.68, text: 'Asimetría entre entrenamiento y generación' },
        { time: 0.8, text: 'MAF: optimiza densidad rápida' },
        { time: 0.92, text: 'IAF: optimiza muestreo rápido' },
      ],
      topic: 'Trade-off autoregresivo: densidad O(1) paralelo vs muestreo O(n) secuencial. Motiva MAF (densidad rápida) e IAF (muestreo rápido).',
      title: 'El trade-off fundamental',
      densityLabel: 'Densidad',
      samplingLabel: 'Muestreo',
      densityTime: 'O(1) pasadas',
      samplingTime: 'O(n) pasadas',
      parallelTag: 'Paralelo',
      sequentialTag: 'Secuencial',
      foreshadow: 'Próximamente: MAF vs IAF',
    },
    scene7: {
      id: 'Más allá de lo básico',
      narration: 'La idea autoregresiva escala a modelos modernos impresionantes. PixelCNN usa convoluciones enmascaradas para imágenes. WaveNet usa convoluciones causales dilatadas para audio. Y GPT usa atención enmascarada para texto. Todos comparten el mismo principio: predecir el siguiente token dados los anteriores.',
      subtitleCues: [
        { time: 0.0, text: 'PixelCNN: convoluciones enmascaradas para imágenes' },
        { time: 0.12, text: 'Máscara garantiza el orden autoregresivo' },
        { time: 0.25, text: 'WaveNet: convoluciones causales dilatadas' },
        { time: 0.4, text: 'Campo receptivo exponencial para audio' },
        { time: 0.55, text: 'GPT: atención enmascarada para texto' },
        { time: 0.68, text: 'Transformers autoregresivos: la revolución del lenguaje' },
        { time: 0.8, text: 'Mismo principio: predecir el siguiente dado los anteriores' },
        { time: 0.92, text: 'De NADE a GPT-4: la misma idea, escalada' },
      ],
      topic: 'Modelos autoregresivos modernos. PixelCNN: masked convolutions para imágenes. WaveNet: dilated causal convolutions para audio. GPT: masked self-attention para texto.',
      title: 'Más allá de lo básico',
      pixelcnn: 'PixelCNN',
      pixelcnnDesc: 'Convoluciones enmascaradas',
      pixelcnnDomain: 'Imágenes',
      wavenet: 'WaveNet',
      wavenetDesc: 'Conv. causales dilatadas',
      wavenetDomain: 'Audio',
      gpt: 'GPT',
      gptDesc: 'Atención enmascarada',
      gptDomain: 'Texto',
      sameIdea: 'Mismo principio autoregresivo',
    },
  },
  en: {
    lessonTitle: 'Autoregressive Models',
    lessonSubtitle: 'Exact density with sequential factorization',
    scene1: {
      id: 'The autoregressive idea',
      narration: 'The autoregressive idea is simple and powerful: we use the chain rule directly. We model each variable conditioned on the previous ones with a neural network. This is not an approximation, it is a mathematical fact from probability. We get exact likelihoods.',
      subtitleCues: [
        { time: 0.0, text: 'Idea: chain rule directly' },
        { time: 0.12, text: 'p(x) = p(x₁)·p(x₂|x₁)·p(x₃|x₁,x₂)·...' },
        { time: 0.25, text: 'Each p(xᵢ|x₁,...,xᵢ₋₁) with a neural net' },
        { time: 0.4, text: 'NOT an approximation — it IS the exact chain rule' },
        { time: 0.55, text: 'A mathematical fact from probability' },
        { time: 0.7, text: 'Exact likelihoods, no variational tricks' },
        { time: 0.82, text: 'Like a language model: word by word' },
        { time: 0.92, text: 'p("The cat sleeps") = p("The")·p("cat"|"The")·p("sleeps"|"The cat")' },
      ],
      topic: 'Autoregressive models: chain rule factorization. p(x) = \u220f p(x\u1d62|x<i). Each conditional modeled with a neural net. Exact likelihoods with no approximation.',
      title: 'The autoregressive idea',
      chainRule: 'Chain rule',
      noApprox: 'No approximations',
      exactLik: 'Exact likelihoods',
    },
    scene2: {
      id: 'FVSBN',
      narration: 'The simplest model is FVSBN: each conditional is logistic regression on all previous variables. The probability of x i equals one is the sigmoid of a linear combination. It works, but needs O of n squared parameters and each conditional has its own weight vector.',
      subtitleCues: [
        { time: 0.0, text: 'FVSBN: Fully Visible Sigmoid Belief Network' },
        { time: 0.12, text: 'Each conditional = logistic regression' },
        { time: 0.25, text: 'p(x\u1d62=1|x<i) = \u03c3(\u03b1\u1d62 + \u03a3 w\u1d62\u2c7c\u00b7x\u2c7c)' },
        { time: 0.4, text: 'Each conditional has its own weight vector' },
        { time: 0.55, text: 'Parameters: O(n\u00b2) — grows fast' },
        { time: 0.7, text: 'Simple but limited: only linear in inputs' },
        { time: 0.82, text: 'No information sharing between conditionals' },
        { time: 0.92, text: 'Can we do something smarter?' },
      ],
      topic: 'FVSBN: Fully Visible Sigmoid Belief Network. Each conditional is logistic regression. p(x\u1d62=1|x<i) = \u03c3(\u03b1\u1d62 + \u03a3 w\u1d62\u2c7c\u00b7x\u2c7c). Parameters O(n\u00b2).',
      title: 'FVSBN',
      fullName: 'Fully Visible Sigmoid Belief Network',
      logistic: 'Logistic regression',
      params: 'Parameters: O(n\u00b2)',
      sigmoid: '\u03c3(z)',
    },
    scene3: {
      id: 'NADE',
      narration: 'NADE improves on this with a key insight: share the weight matrix W across all conditionals. Each hidden h i uses the same columns of W. This takes us from O of n squared d to O of n d parameters. Plus there is a recursive trick: each activation reuses the previous one, like building a staircase step by step.',
      subtitleCues: [
        { time: 0.0, text: 'NADE: share weights W across conditionals' },
        { time: 0.12, text: 'h\u1d62 = \u03c3(W[:,<i]\u00b7x<i + c)' },
        { time: 0.25, text: 'Same matrix W for all conditionals' },
        { time: 0.4, text: 'O(nd) instead of O(n\u00b2d) — significant savings' },
        { time: 0.55, text: 'Recursive trick: a(i+1) = a(i) + W[:,i]\u00b7x\u1d62' },
        { time: 0.7, text: 'Like building a staircase step by step' },
        { time: 0.82, text: 'Each step reuses the previous computation' },
        { time: 0.92, text: 'Efficient and expressive: best of both worlds' },
      ],
      topic: 'NADE: Neural Autoregressive Density Estimator. Shared weights W. h\u1d62 = \u03c3(W[:,<i]\u00b7x<i + c). O(nd) parameters. Recursive trick a(i+1) = a(i) + W[:,i]\u00b7x\u1d62.',
      title: 'NADE: shared weights',
      sharedW: 'Shared weights W',
      separate: 'Separate weights',
      shared: 'Shared weights',
      paramsBefore: 'O(n\u00b2d)',
      paramsAfter: 'O(nd)',
      recursive: 'Recursive trick',
    },
    scene4: {
      id: 'Fast density',
      narration: 'A big advantage: given a data point x, we can compute all conditionals in parallel with a single forward pass. It is like reading a full sentence at a glance. We sum the logs and get exact log p of x. Density evaluation is fast.',
      subtitleCues: [
        { time: 0.0, text: 'Given x, all conditionals in parallel' },
        { time: 0.12, text: 'Like reading a full sentence at a glance' },
        { time: 0.25, text: 'A single forward pass through the network' },
        { time: 0.4, text: 'log p(x) = \u03a3 log p(x\u1d62|x<i)' },
        { time: 0.55, text: 'Sum of logs = product of probabilities' },
        { time: 0.7, text: 'Exact density, not a lower bound' },
        { time: 0.82, text: 'Density: FAST — O(1) network passes' },
        { time: 0.92, text: 'Ideal for training with MLE' },
      ],
      topic: 'Density evaluation in autoregressive models. Given x, all conditionals computed in parallel. One forward pass. log p(x) = \u03a3 log p(x\u1d62|x<i). O(1) network passes.',
      title: 'Density: fast',
      parallel: 'All in parallel',
      onePass: 'One forward pass',
      fast: 'FAST',
      logP: 'log p(x)',
    },
    scene5: {
      id: 'Slow sampling',
      narration: 'But sampling is another story. To generate a sample, we first sample x one, then x two conditioned on x one, and so on. It is like writing a sentence word by word: you cannot write the last word without the previous ones. That is n sequential steps: sampling is inherently slow.',
      subtitleCues: [
        { time: 0.0, text: 'Generate sample: x\u2081 ~ p(x\u2081)' },
        { time: 0.12, text: 'x\u2082 ~ p(x\u2082|x\u2081) — needs x\u2081 first' },
        { time: 0.25, text: 'x\u2083 ~ p(x\u2083|x\u2081,x\u2082) — needs x\u2081 and x\u2082' },
        { time: 0.4, text: 'Like writing a sentence word by word' },
        { time: 0.55, text: 'Cannot write the last word without the previous ones' },
        { time: 0.68, text: 'Each step needs the previous result' },
        { time: 0.8, text: 'n sequential steps: SLOW' },
        { time: 0.92, text: 'Density = reading (parallel). Sampling = writing (sequential)' },
      ],
      topic: 'Sampling in autoregressive models. Sequential: x\u2081~p(x\u2081), x\u2082~p(x\u2082|x\u2081), ... Each step depends on the previous. O(n) sequential steps. Slow sampling.',
      title: 'Sampling: slow',
      step: 'Step',
      sequential: 'Sequential',
      slow: 'SLOW',
      waiting: 'Waiting...',
      sampled: 'Sampled',
    },
    scene6: {
      id: 'The fundamental trade-off',
      narration: 'This is the fundamental trade-off. Density in one parallel pass, sampling in n sequential passes. There is a crucial training asymmetry: teacher forcing uses real data as context, but during generation the model uses its own predictions. This dilemma motivates MAF and IAF.',
      subtitleCues: [
        { time: 0.0, text: 'Density: O(1) passes (parallel)' },
        { time: 0.12, text: 'Sampling: O(n) passes (sequential)' },
        { time: 0.25, text: 'Fundamental AR trade-off' },
        { time: 0.4, text: 'Teacher forcing: training uses real data' },
        { time: 0.55, text: 'Generation: uses its own predictions' },
        { time: 0.68, text: 'Asymmetry between training and generation' },
        { time: 0.8, text: 'MAF: optimizes for fast density' },
        { time: 0.92, text: 'IAF: optimizes for fast sampling' },
      ],
      topic: 'Autoregressive trade-off: density O(1) parallel vs sampling O(n) sequential. Motivates MAF (fast density) and IAF (fast sampling).',
      title: 'The fundamental trade-off',
      densityLabel: 'Density',
      samplingLabel: 'Sampling',
      densityTime: 'O(1) passes',
      samplingTime: 'O(n) passes',
      parallelTag: 'Parallel',
      sequentialTag: 'Sequential',
      foreshadow: 'Coming next: MAF vs IAF',
    },
    scene7: {
      id: 'Beyond the basics',
      narration: 'The autoregressive idea scales to impressive modern models. PixelCNN uses masked convolutions for images. WaveNet uses dilated causal convolutions for audio. And GPT uses masked self-attention for text. All share the same principle: predict the next token given the previous ones.',
      subtitleCues: [
        { time: 0.0, text: 'PixelCNN: masked convolutions for images' },
        { time: 0.12, text: 'Mask guarantees the autoregressive order' },
        { time: 0.25, text: 'WaveNet: dilated causal convolutions' },
        { time: 0.4, text: 'Exponential receptive field for audio' },
        { time: 0.55, text: 'GPT: masked self-attention for text' },
        { time: 0.68, text: 'Autoregressive transformers: the language revolution' },
        { time: 0.8, text: 'Same principle: predict the next given the previous' },
        { time: 0.92, text: 'From NADE to GPT-4: same idea, scaled up' },
      ],
      topic: 'Modern autoregressive models. PixelCNN: masked convolutions for images. WaveNet: dilated causal convolutions for audio. GPT: masked self-attention for text.',
      title: 'Beyond the basics',
      pixelcnn: 'PixelCNN',
      pixelcnnDesc: 'Masked convolutions',
      pixelcnnDomain: 'Images',
      wavenet: 'WaveNet',
      wavenetDesc: 'Dilated causal conv.',
      wavenetDomain: 'Audio',
      gpt: 'GPT',
      gptDesc: 'Masked self-attention',
      gptDomain: 'Text',
      sameIdea: 'Same autoregressive principle',
    },
  },
};

// ── Questions (bilingual) ──

export const questions: Record<Lang, {
  afterDensity: import('../../engine/types').QuestionData;
  afterModern: import('../../engine/types').QuestionData;
}> = {
  es: {
    afterDensity: {
      question: 'En un modelo autoregresivo, ¿por qué la evaluación de densidad es rápida pero el muestreo es lento?',
      choices: [
        'Porque la densidad usa GPU y el muestreo no',
        'Porque para densidad todas las condicionales se calculan en paralelo (dado x), pero para muestreo cada paso depende del anterior',
        'Porque la densidad es aproximada y el muestreo es exacto',
        'Porque el muestreo requiere más memoria',
      ],
      correctIndex: 1,
      hint: 'Piensa en la analogía: leer una oración vs escribirla palabra por palabra.',
      explanation: 'Para calcular p(x), ya conocemos todo x, así que todas las condicionales p(xᵢ|x<i) se computan en paralelo. Pero para generar, necesitamos muestrear x₁ antes de poder calcular p(x₂|x₁), y así sucesivamente: n pasos secuenciales.',
    },
    afterModern: {
      question: '¿Qué tienen en común PixelCNN, WaveNet y GPT?',
      choices: [
        'Todos usan la misma arquitectura de red neuronal',
        'Todos son modelos autoregresivos que predicen el siguiente elemento dado los anteriores',
        'Todos generan imágenes',
        'Todos usan atención enmascarada',
      ],
      correctIndex: 1,
      explanation: 'Aunque usan arquitecturas distintas (convoluciones enmascaradas, convoluciones dilatadas, atención enmascarada), todos comparten el principio autoregresivo: modelar p(xᵢ|x<i) y generar secuencialmente.',
    },
  },
  en: {
    afterDensity: {
      question: 'In an autoregressive model, why is density evaluation fast but sampling slow?',
      choices: [
        'Because density uses GPU and sampling does not',
        'Because for density all conditionals are computed in parallel (given x), but for sampling each step depends on the previous one',
        'Because density is approximate and sampling is exact',
        'Because sampling requires more memory',
      ],
      correctIndex: 1,
      hint: 'Think of the analogy: reading a sentence vs writing it word by word.',
      explanation: 'To compute p(x), we already know all of x, so all conditionals p(xᵢ|x<i) are computed in parallel. But to generate, we need to sample x₁ before we can compute p(x₂|x₁), and so on: n sequential steps.',
    },
    afterModern: {
      question: 'What do PixelCNN, WaveNet, and GPT have in common?',
      choices: [
        'They all use the same neural network architecture',
        'They are all autoregressive models that predict the next element given the previous ones',
        'They all generate images',
        'They all use masked self-attention',
      ],
      correctIndex: 1,
      explanation: 'Although they use different architectures (masked convolutions, dilated convolutions, masked self-attention), they all share the autoregressive principle: model p(xᵢ|x<i) and generate sequentially.',
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
