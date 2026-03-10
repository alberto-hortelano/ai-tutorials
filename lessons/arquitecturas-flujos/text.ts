// Bilingual text for Flow Architectures lesson

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
    lessonTitle: 'Arquitecturas de Flujos',
    lessonSubtitle: 'Diseñando transformaciones con Jacobianos tratables',
    scene1: {
      id: 'El cuello de botella',
      narration: 'Imagina calcular el determinante de una matriz general de 784 por 784: quinientos millones de operaciones por muestra. Es como multiplicar cada pixel de MNIST con cada otro pixel. El truco salvador: si el Jacobiano es triangular, el determinante es simplemente el producto de la diagonal. De O cúbico a O lineal, una diferencia brutal.',
      subtitleCues: [
        { time: 0.0, text: 'Determinante general: O(D³) via LU' },
        { time: 0.12, text: 'D=784 (MNIST): ~500M operaciones por muestra' },
        { time: 0.25, text: 'Como multiplicar cada pixel con cada otro pixel' },
        { time: 0.38, text: 'Truco salvador: Jacobiano triangular' },
        { time: 0.5, text: 'Triangular → det = producto de la diagonal' },
        { time: 0.62, text: 'Costo: solo O(D) = 784 operaciones' },
        { time: 0.75, text: 'De 500 millones a 784: factor ~640,000×' },
        { time: 0.88, text: 'Todo el diseño de flujos busca esta estructura' },
      ],
      topic: 'Cuello de botella computacional del determinante del Jacobiano. O(D³) para matrices densas via LU. D=784 → ~500M ops. Solución: Jacobianos triangulares → O(D).',
      title: 'El cuello de botella O(D³)',
      fullMatrix: 'Matriz completa: O(D³)',
      triangular: 'Triangular: O(D)',
      diagonal: 'det = ∏ diag',
      costLabel: 'Costo computacional',
      luDecomp: 'LU decomposition',
      mnistCost: 'D=784 → ~500M ops/muestra',
    },
    scene2: {
      id: 'Flujo planar',
      narration: 'El flujo planar dobla el espacio a lo largo de un hiperplano, como doblar una hoja de papel por la mitad. Un solo doblez solo crea un pliegue. Pero si apilas ocho, diez, veinte dobleces en distintas direcciones, puedes crear origami cada vez más complejo. Cada capa es simple, pero juntas son poderosas.',
      subtitleCues: [
        { time: 0.0, text: 'Flujo planar: f(z) = z + u·h(wᵀz + b)' },
        { time: 0.12, text: 'Dobla el espacio a lo largo de un hiperplano' },
        { time: 0.25, text: 'Como doblar una hoja de papel' },
        { time: 0.38, text: 'Un solo doblez: limitado (K=1)' },
        { time: 0.5, text: 'Dos dobleces: algo más de forma (K=2)' },
        { time: 0.62, text: 'Ocho dobleces: origami complejo (K=8)' },
        { time: 0.75, text: 'Cada capa simple, pero juntas = poderosas' },
        { time: 0.88, text: 'Más capas → más expresividad' },
      ],
      topic: 'Planar flow: f(z) = z + u·h(wᵀz + b). Transforma a lo largo de un hiperplano. Simple pero expresividad limitada. Requiere muchas capas.',
      title: 'Flujo planar',
      layer1: 'K = 1',
      layer2: 'K = 2',
      layerK: 'K = 8',
    },
    scene3: {
      id: 'La idea coupling',
      narration: 'El truco de las coupling layers es dividir y conquistar. La primera mitad del vector pasa intacta, como un testigo que observa sin cambiar. La segunda mitad se transforma usando a la primera como guía. El Jacobiano resultante es triangular por bloques, así que el determinante se reduce al producto de la diagonal.',
      subtitleCues: [
        { time: 0.0, text: 'Dividir y conquistar: el vector en dos mitades' },
        { time: 0.12, text: 'Primera mitad: pasa intacta (identidad)' },
        { time: 0.25, text: 'Como un testigo que observa sin cambiar' },
        { time: 0.38, text: 'Segunda mitad: se transforma condicionada a la primera' },
        { time: 0.5, text: 'Jacobiano resultante: triangular por bloques' },
        { time: 0.62, text: 'I arriba-izquierda, 0 arriba-derecha' },
        { time: 0.75, text: 'det = producto de la diagonal inferior-derecha' },
        { time: 0.88, text: 'Costo: O(D) en vez de O(D³)' },
      ],
      topic: 'Coupling layers. Jacobiano triangular por bloques: I arriba-izquierda, 0 arriba-derecha, ∂x₂/∂z₁ abajo-izquierda, diag(∂x₂/∂z₂) abajo-derecha. det = prod(diag). O(D).',
      title: 'Coupling layers',
      copy: 'Copiar',
      transform: 'Transformar',
      conditioned: 'condicionado a z₁',
      jacobianLabel: 'Jacobiano resultante',
      identityBlock: 'I',
      zeroBlock: '0',
      arbitraryBlock: '∂x₂/∂z₁',
      diagBlock: 'diag',
      detExplain: 'det = prod(diagonal) → O(D)',
    },
    scene4: {
      id: 'NICE',
      narration: 'NICE solo suma, nunca escala: es como deslizar una mitad del espacio sin estirar ni comprimir. Como resultado, el determinante siempre es uno: conserva el volumen exactamente. En 2D, la Gaussiana se desplaza en formas no lineales pero su volumen total no cambia. Es elegante pero limitado en expresividad.',
      subtitleCues: [
        { time: 0.0, text: 'NICE: additive coupling (solo suma)' },
        { time: 0.12, text: 'Deslizar sin estirar ni comprimir' },
        { time: 0.25, text: 'x₁ = z₁ (copia), x₂ = z₂ + m(z₁)' },
        { time: 0.38, text: 'Ejemplo 2D: m(z₁) = sin(z₁)' },
        { time: 0.5, text: 'Gaussiana se ondula pero no se estira' },
        { time: 0.62, text: 'det J = 1 siempre (volume-preserving)' },
        { time: 0.75, text: 'Volumen conservado = no ajusta la densidad' },
        { time: 0.88, text: 'Elegante pero expresividad limitada' },
      ],
      topic: 'NICE (Non-linear Independent Components Estimation). Additive coupling: x₂ = z₂ + m(z₁). det J = 1 (volume-preserving). Simple pero limitado en expresividad.',
      title: 'NICE: additive coupling',
      additive: 'x₂ = z₂ + m(z₁)',
      detOne: 'det J = 1',
      volumePreserving: 'Volume-preserving',
      exampleLabel: 'Ejemplo: m(z₁) = sin(z₁)',
      beforeLabel: 'z ~ N(0,I)',
      afterLabel: 'x = coupling(z)',
    },
    scene5: {
      id: 'RealNVP',
      narration: 'RealNVP agrega la pieza que NICE no tiene: escalamiento. Ahora la transformación puede estirar y comprimir, no solo deslizar. Piensa en NICE como un río con corriente uniforme, y RealNVP como un río con rápidos y remansos. La densidad se ajusta automáticamente, y fue el primer flujo que generó imágenes realistas.',
      subtitleCues: [
        { time: 0.0, text: 'RealNVP: affine coupling (escala + suma)' },
        { time: 0.12, text: 'x₂ = exp(s(z₁))·z₂ + t(z₁)' },
        { time: 0.25, text: 'NICE = río uniforme; RealNVP = río con rápidos' },
        { time: 0.38, text: 'La Gaussiana se estira Y se desplaza según z₁' },
        { time: 0.5, text: 'Densidad se ajusta: log|det J| = Σ s(z₁)' },
        { time: 0.62, text: 'Mucho más expresivo que NICE' },
        { time: 0.75, text: 'Primer flujo con imágenes realistas' },
        { time: 0.88, text: 'Conexión: Flow = VAE con encoder perfecto (KL gap = 0)' },
      ],
      topic: 'RealNVP: affine coupling layer. x₂ = z₂ ⊙ exp(s(z₁)) + t(z₁). Más expresivo que NICE. Primer flow con imágenes realistas.',
      title: 'RealNVP: affine coupling',
      affine: 'x₂ = z₂ ⊙ exp(s) + t',
      logDet: 'log|det J| = Σ s(z₁)',
      niceLabel: 'NICE (solo suma)',
      realNvpLabel: 'RealNVP (escala + suma)',
      moreExpressive: 'Más expresivo',
      firstImages: 'Primer flujo con imágenes realistas',
      beforeLabel: 'z ~ N(0,I)',
      afterLabel: 'x = affine(z)',
    },
    scene6: {
      id: 'Máscaras alternantes',
      narration: 'Un solo coupling layer solo transforma la mitad del vector, como pintar solo la mitad izquierda de un cuadro. La solución: en la siguiente capa, pintar la otra mitad. Es como tejer: hilera par, hilera impar. Para imágenes, el patrón es un tablero de ajedrez: casillas blancas en una capa, casillas negras en la siguiente.',
      subtitleCues: [
        { time: 0.0, text: 'Problema: una capa solo transforma la mitad' },
        { time: 0.12, text: 'Como pintar solo la mitad izquierda de un cuadro' },
        { time: 0.25, text: 'Solución: alternar qué mitad se transforma' },
        { time: 0.38, text: 'Capa 1: transforma la derecha' },
        { time: 0.5, text: 'Capa 2: transforma la izquierda' },
        { time: 0.62, text: 'Como tejer: hilera par, hilera impar' },
        { time: 0.75, text: 'Imágenes: patrón checkerboard (tablero)' },
        { time: 0.88, text: 'Resultado: todas las dimensiones se transforman' },
      ],
      topic: 'Alternating masks en coupling layers. Cada capa transforma la mitad complementaria. Para imágenes: checkerboard masking. Garantiza que todas las dimensiones sean transformadas.',
      title: 'Máscaras alternantes',
      layer1: 'Capa 1: transforma derecha',
      layer2: 'Capa 2: transforma izquierda',
      checkerboard: 'Checkerboard para imágenes',
      allDims: 'Todas las dimensiones se transforman',
    },
    scene7: {
      id: 'Galería de transformaciones',
      narration: 'Piensa en capas de un pastel de hojaldre. Con una sola capa, tienes una masa plana. Con cuatro capas, empiezan a formarse bolsas de aire. Con ocho, tienes un hojaldre crujiente y complejo. Cada capa de flujo agrega un doblez más al espacio de probabilidad, acercando la distribución al target.',
      subtitleCues: [
        { time: 0.0, text: 'Pastel de hojaldre: cada capa agrega complejidad' },
        { time: 0.12, text: 'K=1: masa plana, deformación leve' },
        { time: 0.25, text: 'K=2: primer doblez, algo de forma' },
        { time: 0.38, text: 'K=4: bolsas de aire, aparece estructura' },
        { time: 0.5, text: 'K=8: hojaldre complejo, buen ajuste al target' },
        { time: 0.62, text: 'log-likelihood mejora con cada capa' },
        { time: 0.75, text: 'Aproximador universal con suficientes capas' },
        { time: 0.88, text: 'Más capas → más expresividad → mejor modelo' },
      ],
      topic: 'Progresión de expresividad al agregar capas. 1 capa → deformación simple. K capas → distribuciones arbitrariamente complejas. Aproximador universal con suficientes capas.',
      title: 'Galería: poder de la composición',
      k1: 'K = 1',
      k4: 'K = 4',
      k8: 'K = 8',
      target: 'Target',
      logLik: 'log p(x) mejorando →',
    },
  },
  en: {
    lessonTitle: 'Flow Architectures',
    lessonSubtitle: 'Designing transforms with tractable Jacobians',
    scene1: {
      id: 'The bottleneck',
      narration: 'Imagine computing the determinant of a general 784 by 784 matrix: five hundred million operations per sample. It is like multiplying every MNIST pixel with every other pixel. The saving trick: if the Jacobian is triangular, the determinant is simply the diagonal product. From cubic to linear, a brutal difference.',
      subtitleCues: [
        { time: 0.0, text: 'General determinant: O(D³) via LU' },
        { time: 0.12, text: 'D=784 (MNIST): ~500M operations per sample' },
        { time: 0.25, text: 'Like multiplying every pixel with every other pixel' },
        { time: 0.38, text: 'Saving trick: triangular Jacobian' },
        { time: 0.5, text: 'Triangular → det = diagonal product' },
        { time: 0.62, text: 'Cost: just O(D) = 784 operations' },
        { time: 0.75, text: 'From 500 million to 784: factor ~640,000x' },
        { time: 0.88, text: 'All flow design seeks this structure' },
      ],
      topic: 'Computational bottleneck of the Jacobian determinant. O(D³) for dense matrices via LU. D=784 → ~500M ops. Solution: triangular Jacobians → O(D).',
      title: 'The O(D³) bottleneck',
      fullMatrix: 'Full matrix: O(D³)',
      triangular: 'Triangular: O(D)',
      diagonal: 'det = ∏ diag',
      costLabel: 'Computation cost',
      luDecomp: 'LU decomposition',
      mnistCost: 'D=784 → ~500M ops/sample',
    },
    scene2: {
      id: 'Planar flow',
      narration: 'A planar flow bends space along a hyperplane, like folding a sheet of paper in half. One fold creates just one crease. But stacking eight, ten, twenty folds in different directions creates increasingly complex origami. Each layer is simple, but together they are powerful.',
      subtitleCues: [
        { time: 0.0, text: 'Planar flow: f(z) = z + u·h(wᵀz + b)' },
        { time: 0.12, text: 'Bends space along a hyperplane' },
        { time: 0.25, text: 'Like folding a sheet of paper' },
        { time: 0.38, text: 'One fold: limited (K=1)' },
        { time: 0.5, text: 'Two folds: a bit more shape (K=2)' },
        { time: 0.62, text: 'Eight folds: complex origami (K=8)' },
        { time: 0.75, text: 'Each layer simple, but together = powerful' },
        { time: 0.88, text: 'More layers → more expressiveness' },
      ],
      topic: 'Planar flow: f(z) = z + u·h(wᵀz + b). Transforms along a hyperplane. Simple but limited expressiveness. Requires many layers.',
      title: 'Planar flow',
      layer1: 'K = 1',
      layer2: 'K = 2',
      layerK: 'K = 8',
    },
    scene3: {
      id: 'Coupling idea',
      narration: 'The coupling layer trick is divide and conquer. The first half of the vector passes through unchanged, like a witness that observes without changing. The second half transforms using the first as a guide. The resulting Jacobian is block-triangular, so the determinant reduces to the diagonal product.',
      subtitleCues: [
        { time: 0.0, text: 'Divide and conquer: split the vector in two' },
        { time: 0.12, text: 'First half: passes through unchanged (identity)' },
        { time: 0.25, text: 'Like a witness that observes without changing' },
        { time: 0.38, text: 'Second half: transforms conditioned on the first' },
        { time: 0.5, text: 'Resulting Jacobian: block-triangular' },
        { time: 0.62, text: 'I top-left, 0 top-right' },
        { time: 0.75, text: 'det = product of lower-right diagonal' },
        { time: 0.88, text: 'Cost: O(D) instead of O(D³)' },
      ],
      topic: 'Coupling layers. Block-triangular Jacobian: I top-left, 0 top-right, ∂x₂/∂z₁ bottom-left, diag(∂x₂/∂z₂) bottom-right. det = prod(diag). O(D).',
      title: 'Coupling layers',
      copy: 'Copy',
      transform: 'Transform',
      conditioned: 'conditioned on z₁',
      jacobianLabel: 'Resulting Jacobian',
      identityBlock: 'I',
      zeroBlock: '0',
      arbitraryBlock: '∂x₂/∂z₁',
      diagBlock: 'diag',
      detExplain: 'det = prod(diagonal) → O(D)',
    },
    scene4: {
      id: 'NICE',
      narration: 'NICE only adds, never scales: it is like sliding one half of space without stretching or compressing. As a result, the determinant is always one: it preserves volume exactly. In 2D, the Gaussian shifts in nonlinear ways but its total volume never changes. Elegant but limited in expressiveness.',
      subtitleCues: [
        { time: 0.0, text: 'NICE: additive coupling (addition only)' },
        { time: 0.12, text: 'Sliding without stretching or compressing' },
        { time: 0.25, text: 'x₁ = z₁ (copy), x₂ = z₂ + m(z₁)' },
        { time: 0.38, text: '2D example: m(z₁) = sin(z₁)' },
        { time: 0.5, text: 'Gaussian ripples but does not stretch' },
        { time: 0.62, text: 'det J = 1 always (volume-preserving)' },
        { time: 0.75, text: 'Volume preserved = no density adjustment' },
        { time: 0.88, text: 'Elegant but limited expressiveness' },
      ],
      topic: 'NICE (Non-linear Independent Components Estimation). Additive coupling: x₂ = z₂ + m(z₁). det J = 1 (volume-preserving). Simple but limited expressiveness.',
      title: 'NICE: additive coupling',
      additive: 'x₂ = z₂ + m(z₁)',
      detOne: 'det J = 1',
      volumePreserving: 'Volume-preserving',
      exampleLabel: 'Example: m(z₁) = sin(z₁)',
      beforeLabel: 'z ~ N(0,I)',
      afterLabel: 'x = coupling(z)',
    },
    scene5: {
      id: 'RealNVP',
      narration: 'RealNVP adds the piece NICE was missing: scaling. Now the transform can stretch and compress, not just slide. Think of NICE as a river with uniform current, and RealNVP as a river with rapids and calm pools. Density adjusts automatically, and it was the first flow to generate realistic images.',
      subtitleCues: [
        { time: 0.0, text: 'RealNVP: affine coupling (scale + shift)' },
        { time: 0.12, text: 'x₂ = exp(s(z₁))·z₂ + t(z₁)' },
        { time: 0.25, text: 'NICE = uniform river; RealNVP = river with rapids' },
        { time: 0.38, text: 'Gaussian stretches AND shifts based on z₁' },
        { time: 0.5, text: 'Density adjusts: log|det J| = Σ s(z₁)' },
        { time: 0.62, text: 'Much more expressive than NICE' },
        { time: 0.75, text: 'First flow with realistic images' },
        { time: 0.88, text: 'Connection: Flow = VAE with perfect encoder (KL gap = 0)' },
      ],
      topic: 'RealNVP: affine coupling layer. x₂ = z₂ ⊙ exp(s(z₁)) + t(z₁). More expressive than NICE. First flow with realistic images.',
      title: 'RealNVP: affine coupling',
      affine: 'x₂ = z₂ ⊙ exp(s) + t',
      logDet: 'log|det J| = Σ s(z₁)',
      niceLabel: 'NICE (add only)',
      realNvpLabel: 'RealNVP (scale + shift)',
      moreExpressive: 'More expressive',
      firstImages: 'First flow with realistic images',
      beforeLabel: 'z ~ N(0,I)',
      afterLabel: 'x = affine(z)',
    },
    scene6: {
      id: 'Alternating masks',
      narration: 'A single coupling layer only transforms half the vector, like painting only the left side of a canvas. The solution: in the next layer, paint the other side. It is like knitting: even row, odd row. For images, the pattern is a checkerboard: white squares in one layer, black squares in the next.',
      subtitleCues: [
        { time: 0.0, text: 'Problem: one layer only transforms half' },
        { time: 0.12, text: 'Like painting only the left side of a canvas' },
        { time: 0.25, text: 'Solution: alternate which half gets transformed' },
        { time: 0.38, text: 'Layer 1: transform the right half' },
        { time: 0.5, text: 'Layer 2: transform the left half' },
        { time: 0.62, text: 'Like knitting: even row, odd row' },
        { time: 0.75, text: 'Images: checkerboard pattern' },
        { time: 0.88, text: 'Result: all dimensions get transformed' },
      ],
      topic: 'Alternating masks in coupling layers. Each layer transforms the complementary half. For images: checkerboard masking. Ensures all dimensions get transformed.',
      title: 'Alternating masks',
      layer1: 'Layer 1: transform right',
      layer2: 'Layer 2: transform left',
      checkerboard: 'Checkerboard for images',
      allDims: 'All dimensions get transformed',
    },
    scene7: {
      id: 'Transformation gallery',
      narration: 'Think of layers in puff pastry. With one layer you have flat dough. With four, air pockets start forming. With eight, you have a flaky complex pastry. Each flow layer adds another fold to the probability space, bringing the distribution closer to the target.',
      subtitleCues: [
        { time: 0.0, text: 'Puff pastry: each layer adds complexity' },
        { time: 0.12, text: 'K=1: flat dough, slight deformation' },
        { time: 0.25, text: 'K=2: first fold, some shape' },
        { time: 0.38, text: 'K=4: air pockets, structure appears' },
        { time: 0.5, text: 'K=8: flaky pastry, good fit to target' },
        { time: 0.62, text: 'Log-likelihood improves with each layer' },
        { time: 0.75, text: 'Universal approximator with enough layers' },
        { time: 0.88, text: 'More layers → more expressiveness → better model' },
      ],
      topic: 'Expressiveness progression with more layers. 1 layer → simple deformation. K layers → arbitrarily complex distributions. Universal approximator with enough layers.',
      title: 'Gallery: power of composition',
      k1: 'K = 1',
      k4: 'K = 4',
      k8: 'K = 8',
      target: 'Target',
      logLik: 'log p(x) improving →',
    },
  },
};

// ── Questions (bilingual) ──

export const questions: Record<Lang, {
  afterNice: import('../../engine/types').QuestionData;
  afterGallery: import('../../engine/types').QuestionData;
}> = {
  es: {
    afterNice: {
      question: '¿Por qué el determinante del Jacobiano de NICE es siempre 1?',
      choices: [
        'Porque la red neuronal interna tiene pesos unitarios',
        'Porque solo suma (no escala), así que la diagonal del Jacobiano son todos unos',
        'Porque usa matrices ortogonales',
        'Porque normaliza la salida',
      ],
      correctIndex: 1,
      hint: 'En una additive coupling layer, x₂ = z₂ + m(z₁). ¿Cuál es ∂x₂/∂z₂?',
      explanation: 'En NICE, x₂ = z₂ + m(z₁). La derivada ∂x₂/∂z₂ = 1 para cada componente. El Jacobiano es triangular con unos en la diagonal, así que det = 1. Es volume-preserving.',
    },
    afterGallery: {
      question: '¿Qué ventaja tiene un normalizing flow sobre un VAE en términos de la densidad?',
      choices: [
        'El flow da densidad exacta; el VAE solo una cota inferior (ELBO)',
        'El flow es más rápido de entrenar',
        'El flow no necesita una distribución base',
        'El flow siempre genera mejores imágenes',
      ],
      correctIndex: 0,
      explanation: 'Un flow usa el cambio de variables para calcular log p(x) exactamente. Un VAE solo puede aproximar con el ELBO porque la marginal p(x) = integral de p(x|z)p(z) es intratable.',
    },
  },
  en: {
    afterNice: {
      question: 'Why is the Jacobian determinant of NICE always 1?',
      choices: [
        'Because the internal neural network has unit weights',
        'Because it only adds (no scaling), so the Jacobian diagonal is all ones',
        'Because it uses orthogonal matrices',
        'Because it normalizes the output',
      ],
      correctIndex: 1,
      hint: 'In an additive coupling layer, x₂ = z₂ + m(z₁). What is ∂x₂/∂z₂?',
      explanation: 'In NICE, x₂ = z₂ + m(z₁). The derivative ∂x₂/∂z₂ = 1 for each component. The Jacobian is triangular with ones on the diagonal, so det = 1. It is volume-preserving.',
    },
    afterGallery: {
      question: 'What advantage does a normalizing flow have over a VAE in terms of density?',
      choices: [
        'The flow gives exact density; the VAE only a lower bound (ELBO)',
        'The flow trains faster',
        'The flow does not need a base distribution',
        'The flow always generates better images',
      ],
      correctIndex: 0,
      explanation: 'A flow uses the change of variables to compute log p(x) exactly. A VAE can only approximate with the ELBO because the marginal p(x) = integral of p(x|z)p(z) is intractable.',
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
