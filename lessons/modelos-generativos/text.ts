// Bilingual text for Generative Models: the Big Idea

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
    lessonTitle: 'Modelos Generativos: la Gran Idea',
    lessonSubtitle: '¿Qué pasaría si una computadora pudiera imaginar datos nuevos?',
    scene1: {
      id: '¿Qué es un modelo generativo?',
      narration: '¿Y si una computadora pudiera imaginar datos nuevos? Un modelo generativo aprende la distribución p de x y puede crear muestras realistas. Es como un artista que estudia miles de cuadros hasta poder pintar uno propio, sin copiar ninguno.',
      subtitleCues: [
        { time: 0.0, text: '¿Y si una computadora pudiera imaginar datos nuevos?' },
        { time: 0.15, text: 'Aprende la distribución p(x) de los datos' },
        { time: 0.3, text: 'Como un artista que estudia miles de cuadros' },
        { time: 0.45, text: 'Hasta poder pintar uno propio sin copiar' },
        { time: 0.6, text: 'Crea muestras nuevas y realistas' },
        { time: 0.75, text: 'Objetivo: min_θ d(p_data, p_θ)' },
        { time: 0.9, text: 'Encontrar parámetros que acerquen el modelo a la realidad' },
      ],
      topic: 'Definición de modelo generativo. Aprender p(x) para generar nuevos datos. Objetivo de optimización.',
      title: '¿Qué es un modelo generativo?',
      dataLabel: 'Datos reales',
      modelLabel: 'Modelo p_θ',
      newSamples: 'Nuevas muestras',
    },
    scene2: {
      id: 'Tres tareas fundamentales',
      narration: 'Hay tres tareas fundamentales. Densidad: ¿qué tan probable es una muestra? Muestreo: ¿podemos generar datos nuevos? Y representaciones: ¿podemos descubrir estructura escondida? Piensa en densidad como reconocer, muestreo como crear, y representaciones como entender.',
      subtitleCues: [
        { time: 0.0, text: 'Tres tareas fundamentales' },
        { time: 0.13, text: '1. Densidad: ¿qué tan probable es x?' },
        { time: 0.26, text: 'Densidad = reconocer (¿es esto una cara real?)' },
        { time: 0.39, text: '2. Muestreo: generar datos nuevos' },
        { time: 0.52, text: 'Muestreo = crear (pinta una cara nueva)' },
        { time: 0.65, text: '3. Representaciones: encontrar estructura' },
        { time: 0.78, text: 'Representaciones = entender (¿qué hace a una cara, cara?)' },
        { time: 0.9, text: 'Todo modelo generativo aborda al menos una' },
      ],
      topic: 'Tres tareas de modelos generativos: estimación de densidad, muestreo, y aprendizaje de representaciones.',
      title: 'Tres tareas fundamentales',
      densityTitle: 'Densidad',
      densityDesc: 'p(x) = ?',
      samplingTitle: 'Muestreo',
      samplingDesc: 'x ~ p_θ',
      reprTitle: 'Representaciones',
      reprDesc: 'Estructura latente',
    },
    scene3: {
      id: 'La escala del problema',
      narration: 'Una imagen de 700 por 1400 píxeles tiene casi 3 millones de valores. El espacio total es 256 elevado a 2 millones 940 mil, un número con 7 millones de dígitos. Pero las imágenes reales son una fracción diminuta de ese océano. Los datos viven en una variedad de baja dimensión.',
      subtitleCues: [
        { time: 0.0, text: 'El espacio de imágenes posibles es inmenso' },
        { time: 0.12, text: 'Imagen 700×1400 RGB: 2,940,000 valores' },
        { time: 0.25, text: '256^{2,940,000} ≈ 10^{7,000,000} imágenes posibles' },
        { time: 0.4, text: '¡Un número con 7 millones de dígitos!' },
        { time: 0.55, text: 'Pero las imágenes reales son una fracción diminuta' },
        { time: 0.7, text: 'Como un hilo delgado en un océano infinito' },
        { time: 0.82, text: 'Hipótesis de la variedad: datos en baja dimensión' },
        { time: 0.92, text: 'Capturar esa variedad es el reto central' },
      ],
      topic: 'Dimensionalidad del espacio de datos. Contraste entre espacio total y datos reales. Hipótesis de la variedad.',
      title: 'La escala del problema',
      possibleLabel: 'Imágenes posibles:',
      trainingLabel: 'Imágenes de entrenamiento:',
      manifoldLabel: 'Variedad de datos reales',
    },
    scene4: {
      id: 'Discriminativo vs generativo',
      narration: 'Un modelo discriminativo aprende p de y dado x: dado un dato, ¿cuál es la etiqueta? Solo necesita la frontera de decisión, como un guardia que decide quién entra. Un modelo generativo aprende p de x completa: entiende todo el paisaje, como un arquitecto que conoce cada rincón del edificio.',
      subtitleCues: [
        { time: 0.0, text: 'Discriminativo: p(y|x) — clasificar' },
        { time: 0.12, text: 'Solo necesita la frontera de decisión' },
        { time: 0.25, text: 'Como un guardia: decide quién entra' },
        { time: 0.4, text: 'Generativo: p(x) — entender la distribución' },
        { time: 0.55, text: 'Modela el paisaje completo de los datos' },
        { time: 0.7, text: 'Como un arquitecto que conoce cada rincón' },
        { time: 0.82, text: 'El generativo puede también discriminar (Bayes)' },
        { time: 0.92, text: 'Pero el discriminativo no puede generar' },
      ],
      topic: 'Comparación discriminativo vs generativo. p(y|x) vs p(x). Frontera de decisión vs distribución completa.',
      title: 'Discriminativo vs generativo',
      discTitle: 'Discriminativo',
      discFormula: 'p(y|x)',
      discDesc: 'Frontera de decisión',
      genTitle: 'Generativo',
      genFormula: 'p(x)',
      genDesc: 'Distribución completa',
    },
    scene5: {
      id: '¿Por qué importan?',
      narration: 'Las aplicaciones son enormes: síntesis de imágenes, descubrimiento de fármacos, generación de texto, aumento de datos, detección de anomalías, compresión. Cada aplicación aprovecha una tarea distinta: densidad para anomalías, muestreo para creación, representaciones para compresión.',
      subtitleCues: [
        { time: 0.0, text: 'Aplicaciones de modelos generativos' },
        { time: 0.12, text: 'Imágenes: DALL-E, Stable Diffusion' },
        { time: 0.25, text: 'Texto: GPT, Claude — modelos de lenguaje' },
        { time: 0.4, text: 'Moléculas: diseño de fármacos y proteínas' },
        { time: 0.55, text: 'Anomalías: densidad baja = sospechoso' },
        { time: 0.7, text: 'Compresión: representaciones compactas' },
        { time: 0.82, text: 'Aumento de datos: más muestras sintéticas' },
        { time: 0.92, text: 'Detrás de la revolución de la IA generativa' },
      ],
      topic: 'Aplicaciones prácticas: síntesis de imágenes, descubrimiento de fármacos, texto, anomalías, compresión.',
      title: '¿Por qué importan?',
      app1: 'Síntesis de imágenes',
      app2: 'Descubrimiento de fármacos',
      app3: 'Generación de texto',
      app4: 'Detección de anomalías',
      app5: 'Aumento de datos',
      app6: 'Compresión',
    },
    scene6: {
      id: 'El marco de aprendizaje',
      narration: 'El planteamiento formal: dado un dataset D de n muestras de una distribución desconocida p data, encontrar theta que minimice la distancia entre p data y p theta. Tres preguntas definen cada modelo: ¿qué familia? ¿Qué distancia? ¿Cómo optimizar?',
      subtitleCues: [
        { time: 0.0, text: 'Dataset D = {x¹, ..., xⁿ} de p_data desconocida' },
        { time: 0.12, text: 'Encontrar θ que minimice d(p_data, p_θ)' },
        { time: 0.25, text: '¿Qué familia M de modelos? (AR, VAE, Flow, GAN...)' },
        { time: 0.4, text: '¿Qué distancia d? (KL, Wasserstein, adversarial...)' },
        { time: 0.55, text: '¿Cómo optimizar? (SGD, adversarial, EM...)' },
        { time: 0.7, text: 'Cada combinación define un modelo generativo distinto' },
        { time: 0.82, text: 'El triángulo imposible: densidad exacta + muestreo rápido + representaciones ricas' },
        { time: 0.92, text: 'Ningún modelo logra las tres a la vez' },
      ],
      topic: 'Marco formal del aprendizaje generativo. Familia de modelos M, distancia d, optimización sobre θ.',
      title: 'El marco de aprendizaje',
      dataLabel: 'p_data (desconocida)',
      modelLabel: 'Familia M: {p_θ}',
      objectiveLabel: 'min_θ d(p_data, p_θ)',
      q1: '¿Familia M?',
      q2: '¿Distancia d?',
      q3: '¿Optimización?',
    },
    scene7: {
      id: 'Mapa del curso',
      narration: 'La historia de los modelos generativos va de verosimilitud tratable con modelos autoregresivos, VAEs y flows, a calidad visual con GANs, hasta la era de difusión que logra un buen balance. Los modelos de difusión combinan lo mejor de ambos mundos. Cada familia hace distintos compromisos.',
      subtitleCues: [
        { time: 0.0, text: 'Mapa de familias de modelos generativos' },
        { time: 0.12, text: 'Autoregresivos: densidad exacta, muestreo lento' },
        { time: 0.25, text: 'VAEs: representaciones ricas, densidad aproximada' },
        { time: 0.38, text: 'Flows: densidad exacta + muestreo rápido (Jacobiano)' },
        { time: 0.5, text: 'GANs: calidad visual increíble, sin densidad' },
        { time: 0.63, text: 'VAE = mode-covering, GAN = mode-seeking' },
        { time: 0.78, text: 'Difusión: buen balance densidad-calidad-diversidad' },
        { time: 0.92, text: 'Tendencia histórica: de tractable a calidad a difusión' },
      ],
      topic: 'Taxonomía del curso: Autoregresivos, VAEs, Flows, GANs, EBMs, Score, Difusión. Compromisos de cada familia.',
      title: 'Mapa del curso',
      rootLabel: 'Modelos Generativos',
      branch1: 'Autoregresivos',
      branch2: 'VAEs',
      branch3: 'Flows',
      branch4: 'GANs',
      branch5: 'Energy/Score',
      branch6: 'Difusión',
      density: 'Densidad exacta',
      sampling: 'Muestreo rápido',
      repr: 'Representaciones',
    },
  },
  en: {
    lessonTitle: 'Generative Models: the Big Idea',
    lessonSubtitle: 'What if a computer could imagine new data?',
    scene1: {
      id: 'What is a generative model?',
      narration: 'What if a computer could imagine new data? A generative model learns the underlying distribution p of x and can create realistic samples. Think of an artist who studies thousands of paintings until they can paint their own, without copying any.',
      subtitleCues: [
        { time: 0.0, text: 'What if a computer could imagine new data?' },
        { time: 0.15, text: 'Learn the data distribution p(x)' },
        { time: 0.3, text: 'Like an artist studying thousands of paintings' },
        { time: 0.45, text: 'Until they can paint their own without copying' },
        { time: 0.6, text: 'Create new, realistic samples' },
        { time: 0.75, text: 'Goal: min_θ d(p_data, p_θ)' },
        { time: 0.9, text: 'Find parameters that bring the model close to reality' },
      ],
      topic: 'Definition of generative model. Learning p(x) to generate new data. Optimization objective.',
      title: 'What is a generative model?',
      dataLabel: 'Real data',
      modelLabel: 'Model p_θ',
      newSamples: 'New samples',
    },
    scene2: {
      id: 'Three fundamental tasks',
      narration: 'There are three fundamental tasks. Density: how likely is a sample? Sampling: can we generate new data? And representations: can we discover hidden structure? Think of density as recognizing, sampling as creating, and representations as understanding.',
      subtitleCues: [
        { time: 0.0, text: 'Three fundamental tasks' },
        { time: 0.13, text: '1. Density: how likely is x?' },
        { time: 0.26, text: 'Density = recognizing (is this a real face?)' },
        { time: 0.39, text: '2. Sampling: generate new data' },
        { time: 0.52, text: 'Sampling = creating (paint a new face)' },
        { time: 0.65, text: '3. Representations: find structure' },
        { time: 0.78, text: 'Representations = understanding (what makes a face a face?)' },
        { time: 0.9, text: 'Every generative model addresses at least one' },
      ],
      topic: 'Three tasks of generative models: density estimation, sampling, and representation learning.',
      title: 'Three fundamental tasks',
      densityTitle: 'Density',
      densityDesc: 'p(x) = ?',
      samplingTitle: 'Sampling',
      samplingDesc: 'x ~ p_θ',
      reprTitle: 'Representations',
      reprDesc: 'Latent structure',
    },
    scene3: {
      id: 'The scale of the problem',
      narration: 'A 700 by 1400 pixel image has nearly 3 million values. The total space is 256 to the power of 2 million 940 thousand, a number with 7 million digits. But real images are a tiny fraction of that ocean. Data lives on a low-dimensional manifold.',
      subtitleCues: [
        { time: 0.0, text: 'The space of possible images is immense' },
        { time: 0.12, text: '700×1400 RGB image: 2,940,000 values' },
        { time: 0.25, text: '256^{2,940,000} ≈ 10^{7,000,000} possible images' },
        { time: 0.4, text: 'A number with 7 million digits!' },
        { time: 0.55, text: 'But real images are a tiny fraction' },
        { time: 0.7, text: 'Like a thin thread in an infinite ocean' },
        { time: 0.82, text: 'Manifold hypothesis: data in low dimension' },
        { time: 0.92, text: 'Capturing that manifold is the central challenge' },
      ],
      topic: 'Data space dimensionality. Contrast between total space and real data. Manifold hypothesis.',
      title: 'The scale of the problem',
      possibleLabel: 'Possible images:',
      trainingLabel: 'Training images:',
      manifoldLabel: 'Real data manifold',
    },
    scene4: {
      id: 'Discriminative vs generative',
      narration: 'A discriminative model learns p of y given x: given data, what is the label? It only needs the decision boundary, like a guard deciding who enters. A generative model learns the full p of x: it understands the entire landscape, like an architect who knows every corner of the building.',
      subtitleCues: [
        { time: 0.0, text: 'Discriminative: p(y|x) — classify' },
        { time: 0.12, text: 'Only needs the decision boundary' },
        { time: 0.25, text: 'Like a guard: decides who enters' },
        { time: 0.4, text: 'Generative: p(x) — understand the distribution' },
        { time: 0.55, text: 'Models the entire data landscape' },
        { time: 0.7, text: 'Like an architect who knows every corner' },
        { time: 0.82, text: 'The generative can also discriminate (Bayes)' },
        { time: 0.92, text: 'But the discriminative cannot generate' },
      ],
      topic: 'Discriminative vs generative comparison. p(y|x) vs p(x). Decision boundary vs full distribution.',
      title: 'Discriminative vs generative',
      discTitle: 'Discriminative',
      discFormula: 'p(y|x)',
      discDesc: 'Decision boundary',
      genTitle: 'Generative',
      genFormula: 'p(x)',
      genDesc: 'Full distribution',
    },
    scene5: {
      id: 'Why do they matter?',
      narration: 'The applications are enormous: image synthesis, drug discovery, text generation, data augmentation, anomaly detection, compression. Each application leverages a different task: density for anomalies, sampling for creation, representations for compression.',
      subtitleCues: [
        { time: 0.0, text: 'Applications of generative models' },
        { time: 0.12, text: 'Images: DALL-E, Stable Diffusion' },
        { time: 0.25, text: 'Text: GPT, Claude — language models' },
        { time: 0.4, text: 'Molecules: drug and protein design' },
        { time: 0.55, text: 'Anomalies: low density = suspicious' },
        { time: 0.7, text: 'Compression: compact representations' },
        { time: 0.82, text: 'Data augmentation: more synthetic samples' },
        { time: 0.92, text: 'Behind the generative AI revolution' },
      ],
      topic: 'Practical applications: image synthesis, drug discovery, text, anomalies, compression.',
      title: 'Why do they matter?',
      app1: 'Image synthesis',
      app2: 'Drug discovery',
      app3: 'Text generation',
      app4: 'Anomaly detection',
      app5: 'Data augmentation',
      app6: 'Compression',
    },
    scene6: {
      id: 'The learning framework',
      narration: 'The formal setup: given a dataset D of n samples from an unknown distribution p data, find parameters theta that minimize the distance between p data and p theta. Three questions define every model: what family? What distance? How to optimize?',
      subtitleCues: [
        { time: 0.0, text: 'Dataset D = {x¹, ..., xⁿ} from unknown p_data' },
        { time: 0.12, text: 'Find θ that minimizes d(p_data, p_θ)' },
        { time: 0.25, text: 'What model family M? (AR, VAE, Flow, GAN...)' },
        { time: 0.4, text: 'What distance d? (KL, Wasserstein, adversarial...)' },
        { time: 0.55, text: 'How to optimize? (SGD, adversarial, EM...)' },
        { time: 0.7, text: 'Each combination defines a different generative model' },
        { time: 0.82, text: 'The impossibility triangle: exact density + fast sampling + rich representations' },
        { time: 0.92, text: 'No model achieves all three at once' },
      ],
      topic: 'Formal framework for generative learning. Model family M, distance d, optimization over θ.',
      title: 'The learning framework',
      dataLabel: 'p_data (unknown)',
      modelLabel: 'Family M: {p_θ}',
      objectiveLabel: 'min_θ d(p_data, p_θ)',
      q1: 'Family M?',
      q2: 'Distance d?',
      q3: 'Optimization?',
    },
    scene7: {
      id: 'Course roadmap',
      narration: 'The history of generative models goes from tractable likelihood with autoregressive models, VAEs, and flows, to visual quality with GANs, to the diffusion era achieving a good balance. Diffusion models combine the best of both worlds. Each family makes different trade-offs.',
      subtitleCues: [
        { time: 0.0, text: 'Map of generative model families' },
        { time: 0.12, text: 'Autoregressive: exact density, slow sampling' },
        { time: 0.25, text: 'VAEs: rich representations, approximate density' },
        { time: 0.38, text: 'Flows: exact density + fast sampling (Jacobian)' },
        { time: 0.5, text: 'GANs: incredible visual quality, no density' },
        { time: 0.63, text: 'VAE = mode-covering, GAN = mode-seeking' },
        { time: 0.78, text: 'Diffusion: good density-quality-diversity balance' },
        { time: 0.92, text: 'Historical trend: from tractable to quality to diffusion' },
      ],
      topic: 'Course taxonomy: Autoregressive, VAEs, Flows, GANs, EBMs, Score, Diffusion. Trade-offs of each family.',
      title: 'Course roadmap',
      rootLabel: 'Generative Models',
      branch1: 'Autoregressive',
      branch2: 'VAEs',
      branch3: 'Flows',
      branch4: 'GANs',
      branch5: 'Energy/Score',
      branch6: 'Diffusion',
      density: 'Exact density',
      sampling: 'Fast sampling',
      repr: 'Representations',
    },
  },
};

// ── Questions (bilingual) ──

export const questions: Record<Lang, {
  afterScale: import('../../engine/types').QuestionData;
  afterRoadmap: import('../../engine/types').QuestionData;
}> = {
  es: {
    afterScale: {
      question: 'Para una imagen RGB de 100x100 píxeles, ¿cuántos valores posibles puede tomar cada píxel?',
      choices: ['2 (blanco o negro)', '256 por canal, 256³ = 16,777,216 por píxel', '100 por canal', '3 (uno por canal RGB)'],
      correctIndex: 1,
      hint: 'Cada canal (R, G, B) tiene valores de 0 a 255.',
      explanation: 'Cada canal tiene 256 valores posibles (0-255), y hay 3 canales, así que cada píxel puede tomar 256³ = 16,777,216 colores distintos. Esto es lo que hace el espacio de imágenes tan astronómicamente grande.',
    },
    afterRoadmap: {
      question: '¿Cuál es el "triángulo imposible" de los modelos generativos?',
      choices: [
        'Velocidad, precisión y memoria',
        'Densidad exacta, muestreo rápido y representaciones ricas',
        'Datos, parámetros y gradientes',
        'Entrenamiento, validación y test',
      ],
      correctIndex: 1,
      explanation: 'Ningún modelo logra las tres simultáneamente. Los autoregresivos tienen densidad exacta pero muestreo lento. Los GANs tienen muestreo rápido pero no densidad. Los VAEs tienen representaciones pero densidad aproximada.',
    },
  },
  en: {
    afterScale: {
      question: 'For a 100x100 RGB image, how many possible values can each pixel take?',
      choices: ['2 (black or white)', '256 per channel, 256³ = 16,777,216 per pixel', '100 per channel', '3 (one per RGB channel)'],
      correctIndex: 1,
      hint: 'Each channel (R, G, B) has values from 0 to 255.',
      explanation: 'Each channel has 256 possible values (0-255), and there are 3 channels, so each pixel can take 256³ = 16,777,216 distinct colors. This is what makes the image space astronomically large.',
    },
    afterRoadmap: {
      question: 'What is the "impossibility triangle" of generative models?',
      choices: [
        'Speed, accuracy, and memory',
        'Exact density, fast sampling, and rich representations',
        'Data, parameters, and gradients',
        'Training, validation, and test',
      ],
      correctIndex: 1,
      explanation: 'No model achieves all three simultaneously. Autoregressive models have exact density but slow sampling. GANs have fast sampling but no density. VAEs have representations but approximate density.',
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
