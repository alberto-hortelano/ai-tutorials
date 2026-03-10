// Bilingual text for Semi-Supervised VAE lesson

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
    lessonTitle: 'Semi-Supervised VAE',
    lessonSubtitle: 'Aprender con pocas etiquetas',
    scene1: {
      id: 'El escenario semi-supervisado',
      narration: 'Tenemos cien datos etiquetados y cincuenta mil sin etiquetar. Los etiquetados son escasos pero valiosos, como pepitas de oro. Los grises son la mayoria sin etiqueta. Como aprovechamos toda esa informacion gris para aprender mejor?',
      subtitleCues: [
        { time: 0.0, text: '100 etiquetados + 50K sin etiquetar' },
        { time: 0.15, text: 'Etiquetados: pepitas de oro (pocos, valiosos)' },
        { time: 0.3, text: 'Sin etiquetar: la inmensa mayoria' },
        { time: 0.45, text: 'Supervisado puro: solo 100 datos = malo' },
        { time: 0.6, text: 'Los 50K sin etiqueta tienen estructura!' },
        { time: 0.75, text: 'Como explotar esa estructura?' },
        { time: 0.85, text: 'SSVAE: combinar etiquetados y no etiquetados' },
      ],
      topic: 'Escenario semi-supervisado: pocos datos etiquetados, muchos sin etiquetar. Explotar la estructura de los no etiquetados.',
      title: 'El escenario semi-supervisado',
      labeledLabel: 'Etiquetados (100)',
      unlabeledLabel: 'Sin etiquetar (50K)',
      questionLabel: 'Como usar los grises?',
    },
    scene2: {
      id: 'Modelo generativo con etiquetas',
      narration: 'El modelo generativo incluye la etiqueta y como variable. La conjunta es p de y por p de z por p de x dado y y z. El nodo y a veces esta observado y a veces es latente. Cuando falta, hay que marginalizar sobre todas las clases posibles.',
      subtitleCues: [
        { time: 0.0, text: 'p(x,y,z) = p(y)p(z)p(x|y,z)' },
        { time: 0.15, text: 'y: etiqueta de clase (categorica)' },
        { time: 0.3, text: 'z: variable latente continua' },
        { time: 0.45, text: 'x: dato observado' },
        { time: 0.6, text: 'y observado = dato etiquetado' },
        { time: 0.75, text: 'y latente = dato sin etiquetar' },
        { time: 0.85, text: 'Cuando y falta: marginalizar sobre clases' },
      ],
      topic: 'Modelo generativo con y y z. Factorizacion p(x,y,z). y observado o latente segun el dato.',
      title: 'Modelo generativo con etiquetas',
      yLabel: 'y (clase)',
      zLabel: 'z (latente)',
      xLabel: 'x (dato)',
      labeledNode: 'Observado',
      unlabeledNode: 'Latente',
    },
    scene3: {
      id: 'ELBO para datos etiquetados',
      narration: 'Cuando conocemos y, el ELBO es directo. El encoder toma x e y y produce q de z dado x e y. El decoder toma z e y y reconstruye x. Es un ELBO estandar condicionado en y, como un VAE normal pero con y como entrada extra.',
      subtitleCues: [
        { time: 0.0, text: '-L(x,y): ELBO con y conocido' },
        { time: 0.15, text: 'Encoder: q(z|x,y) recibe x e y' },
        { time: 0.3, text: 'Decoder: p(x|y,z) usa y y z' },
        { time: 0.45, text: 'ELBO = E_q[log p(x|y,z)] - KL(q||p(z))' },
        { time: 0.6, text: 'Es un VAE condicionado en y' },
        { time: 0.75, text: 'y como entrada extra al encoder y decoder' },
        { time: 0.85, text: 'Straightforward: nada nuevo aqui' },
      ],
      topic: 'ELBO para datos etiquetados: encoder q(z|x,y), decoder p(x|y,z). VAE condicionado en y.',
      title: 'ELBO para datos etiquetados',
      encoderLabel: 'Encoder q(z|x,y)',
      decoderLabel: 'Decoder p(x|y,z)',
      elboLabel: '-L(x,y)',
      reconLabel: 'Reconstruccion',
      klLabel: 'KL',
    },
    scene4: {
      id: 'ELBO para datos sin etiquetar',
      narration: 'Sin etiqueta, marginalizamos sobre todas las clases posibles. Menos U de x es la suma sobre y de q de y dado x por el ELBO de ese y, mas la entropia del clasificador. Cada clase contribuye ponderada por lo que cree el clasificador.',
      subtitleCues: [
        { time: 0.0, text: '-U(x) = suma_y q(y|x)[-L(x,y)] + H(q(y|x))' },
        { time: 0.15, text: 'Sumar sobre todas las clases y' },
        { time: 0.3, text: 'Cada clase ponderada por q(y|x)' },
        { time: 0.45, text: 'q(y|x) = cuanto cree que es clase y' },
        { time: 0.6, text: '+ H(q(y|x)): entropia del clasificador' },
        { time: 0.75, text: 'Entropia alta = clasificador inseguro' },
        { time: 0.85, text: 'Marginalizacion sobre classes discretas' },
      ],
      topic: 'ELBO sin etiquetas: marginalizar y ponderando por q(y|x). Entropia del clasificador.',
      title: 'ELBO para datos sin etiquetar',
      sumLabel: 'Suma sobre clases',
      weightLabel: 'Peso q(y|x)',
      entropyLabel: 'Entropia H(q(y|x))',
    },
    scene5: {
      id: 'El clasificador emergente',
      narration: 'Lo sorprendente: q de y dado x aparece naturalmente como un clasificador. Al optimizar el ELBO sin etiquetas, las fronteras de decision emergen solas. Los puntos grises adquieren colores. Clasificacion como subproducto gratuito del modelado generativo.',
      subtitleCues: [
        { time: 0.0, text: 'q(y|x) es un clasificador!' },
        { time: 0.15, text: 'No lo entrenamos directamente (aun)' },
        { time: 0.3, text: 'Emerge de optimizar el ELBO sin etiquetas' },
        { time: 0.45, text: 'Las fronteras de decision aparecen solas' },
        { time: 0.6, text: 'Puntos grises adquieren colores' },
        { time: 0.75, text: 'Clasificacion como subproducto gratuito' },
        { time: 0.85, text: 'Modelado generativo => clasificacion' },
      ],
      topic: 'El clasificador q(y|x) emerge naturalmente del ELBO sin etiquetas. Clasificacion como subproducto del modelado generativo.',
      title: 'El clasificador emergente',
      beforeLabel: 'Antes',
      afterLabel: 'Despues',
      classifierLabel: 'q(y|x) = clasificador',
      ahaLabel: 'Clasificacion gratis!',
    },
    scene6: {
      id: 'El objetivo completo',
      narration: 'El objetivo total combina tres terminos: ELBO de datos etiquetados, ELBO de datos sin etiquetar, y alfa por la perdida de clasificacion supervisada. Alfa controla cuanta supervision directa aplicamos al clasificador q de y dado x.',
      subtitleCues: [
        { time: 0.0, text: 'J = ELBO_etiquetado + ELBO_sin_etiquetar' },
        { time: 0.15, text: '+ alfa * perdida_clasificacion' },
        { time: 0.3, text: 'Termino 1: reconstruir datos etiquetados' },
        { time: 0.45, text: 'Termino 2: explotar datos sin etiquetar' },
        { time: 0.6, text: 'Termino 3: supervision directa' },
        { time: 0.75, text: 'alfa controla la fuerza de supervision' },
        { time: 0.85, text: 'Tres fuerzas combinadas en un objetivo' },
      ],
      topic: 'Objetivo completo: ELBO etiquetado + ELBO sin etiquetar + alfa * clasificacion supervisada.',
      title: 'El objetivo completo',
      labeledTerm: 'ELBO etiquetado',
      unlabeledTerm: 'ELBO sin etiquetar',
      classTerm: 'alfa * clasificacion',
      alphaLabel: 'alfa = peso supervision',
    },
    scene7: {
      id: 'Resultados',
      narration: 'Los resultados son dramaticos. Con cien etiquetas supervisadas: setenta por ciento. Con cien etiquetas mas cuarenta y nueve mil novecientos sin etiquetar via SSVAE: noventa y cinco por ciento. Los datos sin etiquetar realmente sirven.',
      subtitleCues: [
        { time: 0.0, text: '100 etiquetas supervisado: ~70%' },
        { time: 0.15, text: 'Solo 100 datos: insuficiente' },
        { time: 0.3, text: '100 + 49.9K SSVAE: ~95%' },
        { time: 0.45, text: 'Salto enorme gracias a datos sin etiqueta' },
        { time: 0.6, text: '50K supervisado completo: ~98%' },
        { time: 0.75, text: 'SSVAE casi alcanza al supervisado completo' },
        { time: 0.85, text: 'Los datos sin etiquetar importan!' },
      ],
      topic: 'Comparacion: supervisado con pocas etiquetas vs SSVAE vs supervisado completo. Datos sin etiqueta elevan dramaticamente la precision.',
      title: 'Resultados',
      method1: 'Supervisado (100)',
      method2: 'SSVAE (100+49.9K)',
      method3: 'Supervisado (50K)',
      accuracy: 'Precision (%)',
    },
  },
  en: {
    lessonTitle: 'Semi-Supervised VAE',
    lessonSubtitle: 'Learning with few labels',
    scene1: {
      id: 'The semi-supervised setting',
      narration: 'We have one hundred labeled data points and fifty thousand unlabeled. The labeled ones are scarce but valuable, like gold nuggets. The gray ones are the unlabeled majority. How do we leverage all that gray information to learn better?',
      subtitleCues: [
        { time: 0.0, text: '100 labeled + 50K unlabeled' },
        { time: 0.15, text: 'Labeled: gold nuggets (few, valuable)' },
        { time: 0.3, text: 'Unlabeled: the vast majority' },
        { time: 0.45, text: 'Pure supervised: only 100 data = poor' },
        { time: 0.6, text: 'The 50K unlabeled have structure!' },
        { time: 0.75, text: 'How to exploit that structure?' },
        { time: 0.85, text: 'SSVAE: combine labeled and unlabeled' },
      ],
      topic: 'Semi-supervised setting: few labeled data, many unlabeled. Exploit the structure of unlabeled data.',
      title: 'The semi-supervised setting',
      labeledLabel: 'Labeled (100)',
      unlabeledLabel: 'Unlabeled (50K)',
      questionLabel: 'How to use the gray dots?',
    },
    scene2: {
      id: 'Generative model with labels',
      narration: 'The generative model includes the label y as a variable. The joint is p of y times p of z times p of x given y and z. The node y is sometimes observed and sometimes latent. When missing, we must marginalize over all possible classes.',
      subtitleCues: [
        { time: 0.0, text: 'p(x,y,z) = p(y)p(z)p(x|y,z)' },
        { time: 0.15, text: 'y: class label (categorical)' },
        { time: 0.3, text: 'z: continuous latent variable' },
        { time: 0.45, text: 'x: observed data' },
        { time: 0.6, text: 'y observed = labeled data point' },
        { time: 0.75, text: 'y latent = unlabeled data point' },
        { time: 0.85, text: 'When y is missing: marginalize over classes' },
      ],
      topic: 'Generative model with y and z. Factorization p(x,y,z). y observed or latent depending on the data.',
      title: 'Generative model with labels',
      yLabel: 'y (class)',
      zLabel: 'z (latent)',
      xLabel: 'x (data)',
      labeledNode: 'Observed',
      unlabeledNode: 'Latent',
    },
    scene3: {
      id: 'ELBO for labeled data',
      narration: 'When y is known, the ELBO is straightforward. The encoder takes x and y and produces q of z given x and y. The decoder takes z and y and reconstructs x. It is a standard ELBO conditioned on y, like a normal VAE but with y as extra input.',
      subtitleCues: [
        { time: 0.0, text: '-L(x,y): ELBO with known y' },
        { time: 0.15, text: 'Encoder: q(z|x,y) takes x and y' },
        { time: 0.3, text: 'Decoder: p(x|y,z) uses y and z' },
        { time: 0.45, text: 'ELBO = E_q[log p(x|y,z)] - KL(q||p(z))' },
        { time: 0.6, text: 'It is a VAE conditioned on y' },
        { time: 0.75, text: 'y as extra input to encoder and decoder' },
        { time: 0.85, text: 'Straightforward: nothing new here' },
      ],
      topic: 'ELBO for labeled data: encoder q(z|x,y), decoder p(x|y,z). VAE conditioned on y.',
      title: 'ELBO for labeled data',
      encoderLabel: 'Encoder q(z|x,y)',
      decoderLabel: 'Decoder p(x|y,z)',
      elboLabel: '-L(x,y)',
      reconLabel: 'Reconstruction',
      klLabel: 'KL',
    },
    scene4: {
      id: 'ELBO for unlabeled data',
      narration: 'Without a label, we marginalize over all possible classes. Minus U of x is the sum over y of q of y given x times the ELBO for that y, plus the classifier entropy. Each class contributes weighted by the classifier belief.',
      subtitleCues: [
        { time: 0.0, text: '-U(x) = sum_y q(y|x)[-L(x,y)] + H(q(y|x))' },
        { time: 0.15, text: 'Sum over all classes y' },
        { time: 0.3, text: 'Each class weighted by q(y|x)' },
        { time: 0.45, text: 'q(y|x) = how much it believes class y' },
        { time: 0.6, text: '+ H(q(y|x)): classifier entropy' },
        { time: 0.75, text: 'High entropy = uncertain classifier' },
        { time: 0.85, text: 'Marginalization over discrete classes' },
      ],
      topic: 'Unlabeled ELBO: marginalize y weighted by q(y|x). Classifier entropy.',
      title: 'ELBO for unlabeled data',
      sumLabel: 'Sum over classes',
      weightLabel: 'Weight q(y|x)',
      entropyLabel: 'Entropy H(q(y|x))',
    },
    scene5: {
      id: 'The emergent classifier',
      narration: 'The surprising part: q of y given x appears naturally as a classifier. By optimizing the unlabeled ELBO, decision boundaries emerge on their own. Gray dots acquire colors. Classification as a free byproduct of generative modeling.',
      subtitleCues: [
        { time: 0.0, text: 'q(y|x) is a classifier!' },
        { time: 0.15, text: 'We did not train it directly (yet)' },
        { time: 0.3, text: 'Emerges from optimizing unlabeled ELBO' },
        { time: 0.45, text: 'Decision boundaries appear on their own' },
        { time: 0.6, text: 'Gray dots acquire colors' },
        { time: 0.75, text: 'Classification as a free byproduct' },
        { time: 0.85, text: 'Generative modeling => classification' },
      ],
      topic: 'The classifier q(y|x) emerges naturally from the unlabeled ELBO. Classification as a byproduct of generative modeling.',
      title: 'The emergent classifier',
      beforeLabel: 'Before',
      afterLabel: 'After',
      classifierLabel: 'q(y|x) = classifier',
      ahaLabel: 'Free classification!',
    },
    scene6: {
      id: 'The full objective',
      narration: 'The total objective combines three terms: labeled ELBO, unlabeled ELBO, and alpha times the supervised classification loss. Alpha controls how much direct supervision we apply to the classifier q of y given x.',
      subtitleCues: [
        { time: 0.0, text: 'J = labeled_ELBO + unlabeled_ELBO' },
        { time: 0.15, text: '+ alpha * classification_loss' },
        { time: 0.3, text: 'Term 1: reconstruct labeled data' },
        { time: 0.45, text: 'Term 2: exploit unlabeled data' },
        { time: 0.6, text: 'Term 3: direct supervision' },
        { time: 0.75, text: 'alpha controls supervision strength' },
        { time: 0.85, text: 'Three forces combined in one objective' },
      ],
      topic: 'Full objective: labeled ELBO + unlabeled ELBO + alpha * supervised classification.',
      title: 'The full objective',
      labeledTerm: 'Labeled ELBO',
      unlabeledTerm: 'Unlabeled ELBO',
      classTerm: 'alpha * classification',
      alphaLabel: 'alpha = supervision weight',
    },
    scene7: {
      id: 'Results',
      narration: 'The results are dramatic. With one hundred supervised labels: seventy percent. With one hundred labels plus forty-nine thousand nine hundred unlabeled via SSVAE: ninety-five percent. Unlabeled data truly matters.',
      subtitleCues: [
        { time: 0.0, text: '100 labels supervised: ~70%' },
        { time: 0.15, text: 'Only 100 data points: insufficient' },
        { time: 0.3, text: '100 + 49.9K SSVAE: ~95%' },
        { time: 0.45, text: 'Huge jump thanks to unlabeled data' },
        { time: 0.6, text: '50K full supervised: ~98%' },
        { time: 0.75, text: 'SSVAE nearly reaches full supervised' },
        { time: 0.85, text: 'Unlabeled data matters!' },
      ],
      topic: 'Comparison: supervised with few labels vs SSVAE vs fully supervised. Unlabeled data dramatically boosts accuracy.',
      title: 'Results',
      method1: 'Supervised (100)',
      method2: 'SSVAE (100+49.9K)',
      method3: 'Supervised (50K)',
      accuracy: 'Accuracy (%)',
    },
  },
};

export const questions: Record<Lang, {
  afterScene4: import('../../engine/types').QuestionData;
  afterScene6: import('../../engine/types').QuestionData;
}> = {
  es: {
    afterScene4: {
      question: 'Para datos sin etiquetar en el SSVAE, que hace el modelo con la variable y desconocida?',
      choices: [
        'La ignora completamente',
        'La fija como la clase mas probable',
        'Marginaliza sumando sobre todas las clases posibles ponderadas por q(y|x)',
        'La muestrea del prior p(y) sin depender de x',
      ],
      correctIndex: 2,
      hint: 'Cuando y es desconocido, el ELBO -U(x) suma sobre todas las clases...',
      explanation: 'Para datos sin etiquetar, el SSVAE marginaliza sobre y: suma el ELBO de cada clase ponderado por q(y|x), que actua como un clasificador suave. Esto es lo que permite aprender de datos sin etiqueta.',
    },
    afterScene6: {
      question: 'En el objetivo completo del SSVAE, el termino alfa controla...',
      choices: [
        'El peso del termino KL',
        'La regularizacion del espacio latente',
        'La cantidad de supervision directa aplicada al clasificador',
        'La tasa de aprendizaje del optimizer',
      ],
      correctIndex: 2,
      hint: 'alfa multiplica la perdida de clasificacion supervisada, que solo afecta a...',
      explanation: 'alfa pondera la perdida de clasificacion supervisada (cross-entropy de q(y|x) con las etiquetas verdaderas). Con alfa mayor, el clasificador recibe mas supervision directa de los datos etiquetados.',
    },
  },
  en: {
    afterScene4: {
      question: 'For unlabeled data in the SSVAE, what does the model do with the unknown variable y?',
      choices: [
        'Ignores it completely',
        'Fixes it to the most likely class',
        'Marginalizes by summing over all possible classes weighted by q(y|x)',
        'Samples it from the prior p(y) without depending on x',
      ],
      correctIndex: 2,
      hint: 'When y is unknown, the ELBO -U(x) sums over all classes...',
      explanation: 'For unlabeled data, the SSVAE marginalizes over y: it sums the ELBO for each class weighted by q(y|x), which acts as a soft classifier. This is what allows learning from unlabeled data.',
    },
    afterScene6: {
      question: 'In the full SSVAE objective, the alpha term controls...',
      choices: [
        'The weight of the KL term',
        'Latent space regularization',
        'The amount of direct supervision applied to the classifier',
        'The optimizer learning rate',
      ],
      correctIndex: 2,
      hint: 'alpha multiplies the supervised classification loss, which only affects...',
      explanation: 'alpha weights the supervised classification loss (cross-entropy of q(y|x) with true labels). With larger alpha, the classifier receives more direct supervision from labeled data.',
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
