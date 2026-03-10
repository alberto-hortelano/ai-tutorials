// Bilingual text for Inpainting with Diffusion lesson

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
    lessonTitle: 'Inpainting con Difusion',
    lessonSubtitle: 'Generacion condicional restringiendo el proceso reverso',
    scene1: {
      id: 'What is inpainting',
      narration: 'Inpainting es como restaurar un fresco danado: tenemos piezas intactas alrededor de un hueco, y el modelo debe rellenar el vacio respetando el contexto visual. No es solo copiar texturas, es generar contenido coherente que se funda con lo existente.',
      subtitleCues: [
        { time: 0.0, text: 'Inpainting: restaurar un fresco danado' },
        { time: 0.14, text: 'Pixeles conocidos rodean un hueco' },
        { time: 0.28, text: 'Generar contenido coherente' },
        { time: 0.42, text: 'No solo copiar texturas' },
        { time: 0.57, text: 'Respetar el contexto visual completo' },
        { time: 0.71, text: 'p(x_desconocido | x_conocido)' },
        { time: 0.85, text: 'Generacion condicional con difusion' },
      ],
      topic: 'Image inpainting: fill missing regions conditioned on known pixels. p(x_unknown | x_known). Contextual generation.',
      title: 'Que es inpainting?',
      knownLabel: 'Pixeles conocidos',
      unknownLabel: 'Region a generar',
      questionMark: '?',
    },
    scene2: {
      id: 'Binary mask',
      narration: 'La mascara binaria m es el mapa del restaurador: donde vale uno, los pixeles son conocidos y estan protegidos. Donde vale cero, es territorio desconocido que la red debe generar. Toda la magia esta en como restringimos el proceso reverso usando esta mascara.',
      subtitleCues: [
        { time: 0.0, text: 'La mascara m: mapa del restaurador' },
        { time: 0.14, text: 'm = 1: territorio protegido (conocido)' },
        { time: 0.28, text: 'm = 0: territorio a generar (desconocido)' },
        { time: 0.42, text: 'Mascara define la geometria del problema' },
        { time: 0.57, text: 'Objetivo: p(x_{m=0} | x_{m=1})' },
        { time: 0.71, text: 'Restringir el reverse process con m' },
        { time: 0.85, text: 'Cualquier forma de mascara funciona' },
      ],
      topic: 'Binary mask m in {0,1}^n. Known pixels (m=1) vs unknown (m=0). Conditional generation: p(x_{m=0}|x_{m=1}).',
      title: 'La mascara binaria',
      known: 'Conocido (m=1)',
      unknown: 'Desconocido (m=0)',
      formula: 'p(x_{m=0} | x_{m=1})',
    },
    scene3: {
      id: 'Constrained reverse',
      narration: 'La idea central es elegante: en cada paso del reverse process, mezclamos dos capas. La capa conocida son los pixeles originales con ruido al nivel t. La capa generada es el denoising del modelo. La mascara combina ambas: protege lo conocido y genera lo desconocido.',
      subtitleCues: [
        { time: 0.0, text: 'Restringir el reverse process' },
        { time: 0.14, text: 'Dos capas en cada paso t' },
        { time: 0.28, text: 'Capa conocida: originales + ruido nivel t' },
        { time: 0.42, text: 'Capa generada: denoising del modelo' },
        { time: 0.57, text: 'Mascara combina ambas capas' },
        { time: 0.71, text: 'x_t = m * known_noised + (1-m) * generated' },
        { time: 0.85, text: 'Proteger lo conocido, generar lo desconocido' },
      ],
      topic: 'Constrained reverse: x_t = m * forward_noise(x_known, t) + (1-m) * model_denoise(x_t). Two-layer merge at each step.',
      title: 'Reverse process restringido',
      knownLayer: 'Capa conocida (ruidosa a nivel t)',
      genLayer: 'Capa generada',
      mergeLabel: 'Mezcla: m * known + (1-m) * gen',
    },
    scene4: {
      id: 'Noise level matching',
      narration: 'Atencion al detalle critico: si pegamos pixeles limpios en una imagen ruidosa, la costura es visible como parches en un jean. Los pixeles conocidos deben estar al mismo nivel de ruido t que la imagen en proceso. Solo asi los bordes se funden sin costuras.',
      subtitleCues: [
        { time: 0.0, text: 'Detalle critico: matching de ruido' },
        { time: 0.14, text: 'Error: pegar pixeles limpios (parche visible)' },
        { time: 0.28, text: 'Como parches en un jean: se nota' },
        { time: 0.42, text: 'Correcto: ruido al mismo nivel t' },
        { time: 0.57, text: 'Los bordes se funden naturalmente' },
        { time: 0.71, text: 'forward_noise(x_known, t) para igualar' },
        { time: 0.85, text: 'Matching de ruido: esencial para calidad' },
      ],
      topic: 'Noise level matching: known pixels must be noised to level t before blending. Clean paste creates visible seams.',
      title: 'Matching de nivel de ruido',
      wrongLabel: 'Incorrecto: pegar limpio',
      rightLabel: 'Correcto: ruido al nivel t',
      seamLabel: 'Costura visible',
      seamlessLabel: 'Sin costura',
    },
    scene5: {
      id: 'Complete algorithm',
      narration: 'El algoritmo completo es un bucle simple de t=T a t=0 con tres operaciones por paso. Primero: denoising con el modelo. Segundo: agregar ruido a los pixeles conocidos al nivel t-1. Tercero: mezclar con la mascara. Tres operaciones, mil veces, imagen restaurada.',
      subtitleCues: [
        { time: 0.0, text: 'Algoritmo: bucle simple de T a 0' },
        { time: 0.14, text: 'Para t = T hasta t = 0:' },
        { time: 0.28, text: '1. Denoise: x_{t-1} = denoise(x_t)' },
        { time: 0.42, text: '2. Noise known: forward(x_known, t-1)' },
        { time: 0.57, text: '3. Merge: m * known + (1-m) * gen' },
        { time: 0.71, text: 'Tres operaciones por paso' },
        { time: 0.85, text: 'Mil iteraciones = imagen restaurada' },
      ],
      topic: 'Complete inpainting algorithm. For t=T..0: denoise x_t, forward-noise known to t-1, merge with mask. Three ops per step.',
      title: 'Algoritmo completo',
      step1: '1. Denoise: x_{t-1} = denoise(x_t)',
      step2: '2. Noise known: x_known^{t-1}',
      step3: '3. Merge: m * known + (1-m) * gen',
      tLabel: 't = $1',
    },
    scene6: {
      id: 'RePaint',
      narration: 'RePaint mejora la coherencia en los bordes con una tecnica de ida y vuelta. En vez de ir monotonicamente de T a cero, hace saltos: re-agrega ruido y re-denoise varias veces por paso. Cada ida y vuelta permite que la informacion de los bordes se propague mejor, como lijar y pulir iterativamente.',
      subtitleCues: [
        { time: 0.0, text: 'RePaint: mejorar bordes con ida y vuelta' },
        { time: 0.14, text: 'Como lijar y pulir iterativamente' },
        { time: 0.28, text: 'Forward jump: re-agregar ruido' },
        { time: 0.42, text: 'Backward jump: re-denoise' },
        { time: 0.57, text: 'Informacion de bordes se propaga mejor' },
        { time: 0.71, text: 'n saltos por paso (tipicamente 10)' },
        { time: 0.85, text: 'Mucho mejor coherencia en la frontera' },
      ],
      topic: 'RePaint: forward-backward jumps on diffusion timeline. Re-noise then re-denoise to improve boundary coherence.',
      title: 'RePaint: saltos forward-backward',
      forwardJump: 'Re-noise (forward)',
      backwardJump: 'Re-denoise (reverse)',
      improved: 'Mejor coherencia',
      nJumps: '$1 saltos por paso',
    },
    scene7: {
      id: 'Beyond inpainting',
      narration: 'La difusion es un VAE jerarquico: cada nivel de ruido es una capa latente. La misma tecnica de mascara se extiende a outpainting para extender bordes, super-resolucion para aumentar detalle, y colorizacion para anadir color. Todo es inpainting con mascaras diferentes.',
      subtitleCues: [
        { time: 0.0, text: 'Difusion como VAE jerarquico' },
        { time: 0.14, text: 'Cada nivel de ruido = capa latente' },
        { time: 0.28, text: 'Outpainting: extender mas alla de bordes' },
        { time: 0.42, text: 'Super-resolucion: interpolar pixeles' },
        { time: 0.57, text: 'Colorizacion: generar color desde gris' },
        { time: 0.71, text: 'Misma tecnica, diferentes mascaras' },
        { time: 0.85, text: 'Difusion: framework unificado de generacion' },
      ],
      topic: 'Beyond inpainting: outpainting, super-resolution, colorization as different mask patterns on the same framework.',
      title: 'Mas alla del inpainting',
      inpaintLabel: 'Inpainting',
      outpaintLabel: 'Outpainting',
      superresLabel: 'Super-resolucion',
      colorizeLabel: 'Colorizacion',
      insight: 'Misma tecnica, diferentes mascaras',
    },
  },
  en: {
    lessonTitle: 'Inpainting with Diffusion',
    lessonSubtitle: 'Conditional generation by constraining the reverse process',
    scene1: {
      id: 'What is inpainting',
      narration: 'Inpainting is like restoring a damaged fresco: we have intact pieces surrounding a hole, and the model must fill the void while respecting the visual context. It is not just copying textures, it is generating coherent content that blends with the existing image.',
      subtitleCues: [
        { time: 0.0, text: 'Inpainting: restoring a damaged fresco' },
        { time: 0.14, text: 'Known pixels surround a hole' },
        { time: 0.28, text: 'Generate coherent content' },
        { time: 0.42, text: 'Not just copying textures' },
        { time: 0.57, text: 'Respect the full visual context' },
        { time: 0.71, text: 'p(x_unknown | x_known)' },
        { time: 0.85, text: 'Conditional generation with diffusion' },
      ],
      topic: 'Image inpainting: fill missing regions conditioned on known pixels. p(x_unknown | x_known). Contextual generation.',
      title: 'What is inpainting?',
      knownLabel: 'Known pixels',
      unknownLabel: 'Region to generate',
      questionMark: '?',
    },
    scene2: {
      id: 'Binary mask',
      narration: 'The binary mask m is the restorer\'s map: where it equals one, pixels are known and protected. Where it equals zero, that is unknown territory the network must generate. All the magic lies in how we constrain the reverse process using this mask.',
      subtitleCues: [
        { time: 0.0, text: 'The mask m: the restorer\'s map' },
        { time: 0.14, text: 'm = 1: protected territory (known)' },
        { time: 0.28, text: 'm = 0: territory to generate (unknown)' },
        { time: 0.42, text: 'Mask defines the problem geometry' },
        { time: 0.57, text: 'Goal: p(x_{m=0} | x_{m=1})' },
        { time: 0.71, text: 'Constrain the reverse process with m' },
        { time: 0.85, text: 'Any mask shape works' },
      ],
      topic: 'Binary mask m in {0,1}^n. Known pixels (m=1) vs unknown (m=0). Conditional generation: p(x_{m=0}|x_{m=1}).',
      title: 'The binary mask',
      known: 'Known (m=1)',
      unknown: 'Unknown (m=0)',
      formula: 'p(x_{m=0} | x_{m=1})',
    },
    scene3: {
      id: 'Constrained reverse',
      narration: 'The central idea is elegant: at each reverse process step, we blend two layers. The known layer holds original pixels noised to level t. The generated layer is the model\'s denoising output. The mask combines both: protecting the known and generating the unknown.',
      subtitleCues: [
        { time: 0.0, text: 'Constrain the reverse process' },
        { time: 0.14, text: 'Two layers at each step t' },
        { time: 0.28, text: 'Known layer: originals + noise level t' },
        { time: 0.42, text: 'Generated layer: model denoising' },
        { time: 0.57, text: 'Mask combines both layers' },
        { time: 0.71, text: 'x_t = m * known_noised + (1-m) * generated' },
        { time: 0.85, text: 'Protect known, generate unknown' },
      ],
      topic: 'Constrained reverse: x_t = m * forward_noise(x_known, t) + (1-m) * model_denoise(x_t). Two-layer merge at each step.',
      title: 'Constrained reverse process',
      knownLayer: 'Known layer (noised to level t)',
      genLayer: 'Generated layer',
      mergeLabel: 'Blend: m * known + (1-m) * gen',
    },
    scene4: {
      id: 'Noise level matching',
      narration: 'A critical detail: if we paste clean pixels into a noisy image, the seam is visible like patches on jeans. Known pixels must be at the same noise level t as the image in process. Only then do the edges blend seamlessly.',
      subtitleCues: [
        { time: 0.0, text: 'Critical detail: noise matching' },
        { time: 0.14, text: 'Wrong: paste clean pixels (visible patch)' },
        { time: 0.28, text: 'Like patches on jeans: you can tell' },
        { time: 0.42, text: 'Right: noise to the same level t' },
        { time: 0.57, text: 'Edges blend naturally' },
        { time: 0.71, text: 'forward_noise(x_known, t) to match' },
        { time: 0.85, text: 'Noise matching: essential for quality' },
      ],
      topic: 'Noise level matching: known pixels must be noised to level t before blending. Clean paste creates visible seams.',
      title: 'Noise level matching',
      wrongLabel: 'Wrong: paste clean',
      rightLabel: 'Right: noise to level t',
      seamLabel: 'Visible seam',
      seamlessLabel: 'Seamless',
    },
    scene5: {
      id: 'Complete algorithm',
      narration: 'The full algorithm is a simple loop from t=T to t=0 with three operations per step. First: denoise with the model. Second: add noise to known pixels to level t-1. Third: merge with the mask. Three operations, a thousand times, restored image.',
      subtitleCues: [
        { time: 0.0, text: 'Algorithm: simple loop from T to 0' },
        { time: 0.14, text: 'For t = T down to t = 0:' },
        { time: 0.28, text: '1. Denoise: x_{t-1} = denoise(x_t)' },
        { time: 0.42, text: '2. Noise known: forward(x_known, t-1)' },
        { time: 0.57, text: '3. Merge: m * known + (1-m) * gen' },
        { time: 0.71, text: 'Three operations per step' },
        { time: 0.85, text: 'A thousand iterations = restored image' },
      ],
      topic: 'Complete inpainting algorithm. For t=T..0: denoise x_t, forward-noise known to t-1, merge with mask. Three ops per step.',
      title: 'Complete algorithm',
      step1: '1. Denoise: x_{t-1} = denoise(x_t)',
      step2: '2. Noise known: x_known^{t-1}',
      step3: '3. Merge: m * known + (1-m) * gen',
      tLabel: 't = $1',
    },
    scene6: {
      id: 'RePaint',
      narration: 'RePaint improves boundary coherence with a back-and-forth technique. Instead of going monotonically from T to zero, it makes jumps: re-adds noise and re-denoises several times per step. Each round-trip lets boundary information propagate better, like iteratively sanding and polishing.',
      subtitleCues: [
        { time: 0.0, text: 'RePaint: improve borders via back-and-forth' },
        { time: 0.14, text: 'Like iteratively sanding and polishing' },
        { time: 0.28, text: 'Forward jump: re-add noise' },
        { time: 0.42, text: 'Backward jump: re-denoise' },
        { time: 0.57, text: 'Boundary info propagates better' },
        { time: 0.71, text: 'n jumps per step (typically 10)' },
        { time: 0.85, text: 'Much better boundary coherence' },
      ],
      topic: 'RePaint: forward-backward jumps on diffusion timeline. Re-noise then re-denoise to improve boundary coherence.',
      title: 'RePaint: forward-backward jumps',
      forwardJump: 'Re-noise (forward)',
      backwardJump: 'Re-denoise (reverse)',
      improved: 'Better coherence',
      nJumps: '$1 jumps per step',
    },
    scene7: {
      id: 'Beyond inpainting',
      narration: 'Diffusion is a hierarchical VAE: each noise level is a latent layer. The same masking technique extends to outpainting for expanding borders, super-resolution for adding detail, and colorization for generating color. Everything is inpainting with different masks.',
      subtitleCues: [
        { time: 0.0, text: 'Diffusion as a hierarchical VAE' },
        { time: 0.14, text: 'Each noise level = latent layer' },
        { time: 0.28, text: 'Outpainting: extend beyond borders' },
        { time: 0.42, text: 'Super-resolution: interpolate pixels' },
        { time: 0.57, text: 'Colorization: generate color from gray' },
        { time: 0.71, text: 'Same technique, different masks' },
        { time: 0.85, text: 'Diffusion: unified generation framework' },
      ],
      topic: 'Beyond inpainting: outpainting, super-resolution, colorization as different mask patterns on the same framework.',
      title: 'Beyond inpainting',
      inpaintLabel: 'Inpainting',
      outpaintLabel: 'Outpainting',
      superresLabel: 'Super-resolution',
      colorizeLabel: 'Colorization',
      insight: 'Same technique, different masks',
    },
  },
};

// -- Questions (bilingual) --

export const questions: Record<Lang, {
  afterMatching: import('../../engine/types').QuestionData;
  afterBeyond: import('../../engine/types').QuestionData;
}> = {
  es: {
    afterMatching: {
      question: 'En inpainting con difusion, los pixeles conocidos deben ser ruidosos al nivel t porque...',
      choices: [
        'Pegar pixeles limpios en una imagen ruidosa crea costuras visibles',
        'El ruido mejora la calidad visual',
        'La red neuronal solo acepta entradas ruidosas',
        'Los pixeles conocidos no se usan durante el reverse process',
      ],
      correctIndex: 0,
      hint: 'Piensa en que pasa si pegas una foto limpia sobre una imagen llena de estatica.',
      explanation: 'Si los pixeles conocidos estan limpios pero el resto esta ruidoso al nivel t, la diferencia de calidad crea una costura visible. El matching de ruido es esencial.',
    },
    afterBeyond: {
      question: 'RePaint mejora la coherencia en los bordes de la mascara mediante...',
      choices: [
        'Usar una red neuronal mas grande',
        'Saltos forward-backward que re-agregan y re-quitan ruido iterativamente',
        'Entrenar una red especifica para bordes',
        'Aumentar el numero total de pasos T',
      ],
      correctIndex: 1,
      hint: 'Como lijar y pulir: ida y vuelta para suavizar la transicion.',
      explanation: 'RePaint hace saltos de ida y vuelta en el timeline de difusion, re-agregando y quitando ruido para que la informacion de los bordes se propague mejor.',
    },
  },
  en: {
    afterMatching: {
      question: 'In diffusion inpainting, known pixels must be noised to level t because...',
      choices: [
        'Pasting clean pixels into a noisy image creates visible seams',
        'Noise improves visual quality',
        'The neural network only accepts noisy inputs',
        'Known pixels are not used during the reverse process',
      ],
      correctIndex: 0,
      hint: 'Think about what happens if you paste a clean photo onto a static-filled image.',
      explanation: 'If known pixels are clean but the rest is noisy at level t, the quality difference creates a visible seam. Noise matching is essential.',
    },
    afterBeyond: {
      question: 'RePaint improves mask boundary coherence by...',
      choices: [
        'Using a larger neural network',
        'Forward-backward jumps that iteratively re-add and re-remove noise',
        'Training a specific network for boundaries',
        'Increasing the total number of steps T',
      ],
      correctIndex: 1,
      hint: 'Like sanding and polishing: back and forth to smooth the transition.',
      explanation: 'RePaint makes back-and-forth jumps on the diffusion timeline, re-adding and removing noise so that boundary information propagates better.',
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
