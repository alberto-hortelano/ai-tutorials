// Bilingual text for f-Divergences lesson

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
    lessonTitle: 'f-Divergencias y Teoria',
    lessonSubtitle: 'Del conjugado de Fenchel al framework f-GAN',
    scene1: {
      id: 'Familia de f-divergencias',
      narration: 'Las f-divergencias son como una familia de reglas para medir diferencias entre distribuciones. Todas comparten el mismo ingrediente: el cociente de densidades p sobre q, pero cada una aplica una funcion f diferente y promedia bajo Q. Es una caja de herramientas donde cada regla mide de forma distinta.',
      subtitleCues: [
        { time: 0.0, text: 'D_f(P||Q) = E_Q[f(p(x)/q(x))]' },
        { time: 0.12, text: 'Familia de reglas: todas usan el cociente p/q' },
        { time: 0.25, text: 'f convexa con f(1) = 0' },
        { time: 0.4, text: 'Cada funcion f genera una regla distinta' },
        { time: 0.55, text: 'KL: f(t) = t log t' },
        { time: 0.7, text: 'Chi-cuadrado: f(t) = (t-1)^2' },
        { time: 0.82, text: 'Caja de herramientas: misma base, distintas medidas' },
      ],
      topic: 'f-divergencia D_f(P||Q) = E_Q[f(p/q)]. Familia general parametrizada por f convexa. KL, chi-sq, reverse KL como casos especiales.',
      title: 'Familia de f-divergencias',
      klLabel: 'KL: f(t) = t log t',
      chiLabel: 'Chi-sq: f(t) = (t-1)^2',
      revLabel: 'Rev KL: f(t) = -log t',
      fixedPoint: 'Todas pasan por (1, 0)',
    },
    scene2: {
      id: 'Casos especiales',
      narration: 'Sustituir f en la formula general es como elegir una lente para tu telescopio. Con f igual a t log t recuperas la KL. Con menos log t ves la KL reversa. Cada lente resalta aspectos diferentes de la diferencia entre P y Q: unas son sensibles a las colas, otras al centro.',
      subtitleCues: [
        { time: 0.0, text: 'Sustituir f en la formula general' },
        { time: 0.12, text: 'Elegir f es como elegir una lente de telescopio' },
        { time: 0.25, text: 'f(t) = t log t => KL divergence' },
        { time: 0.4, text: 'f(t) = -log t => Reverse KL' },
        { time: 0.55, text: 'f(t) = (t-1)^2 => Chi-cuadrado' },
        { time: 0.7, text: 'Cada lente resalta aspectos diferentes' },
        { time: 0.85, text: 'Unas sensibles a colas, otras al centro' },
      ],
      topic: 'Casos especiales de f-divergencia. Sustitucion mecanica de f para derivar KL, reverse KL, JSD, chi-sq.',
      title: 'Divergencias conocidas como casos especiales',
      klDerivation: 'E_Q[t log t] donde t = p/q => sum p log(p/q)',
      revDerivation: 'E_Q[-log(p/q)] => sum q log(q/p)',
      chiDerivation: 'E_Q[(p/q - 1)^2] => sum (p-q)^2 / q',
      jsdLabel: 'JSD: f(t) = -(t+1)/2 log((t+1)/2) + t/2 log t',
    },
    scene3: {
      id: 'Conjugado de Fenchel',
      narration: 'El conjugado de Fenchel es como encontrar la linea que mejor abraza a la curva f por arriba. Para cada pendiente s, buscamos la tangente que maximiza s por t menos f de t. Geometricamente, la tangente se desliza a lo largo de f buscando el punto optimo para cada inclinacion.',
      subtitleCues: [
        { time: 0.0, text: 'f*(s) = sup_t {s*t - f(t)}' },
        { time: 0.12, text: 'Encontrar la linea que mejor abraza f por arriba' },
        { time: 0.25, text: 'Para cada pendiente s, encontrar la tangente optima' },
        { time: 0.4, text: 'Maximizar la brecha entre recta y curva' },
        { time: 0.55, text: 'La tangente se desliza a lo largo de f' },
        { time: 0.7, text: 'f** = f: volver dos veces te regresa al inicio' },
        { time: 0.85, text: 'Dualidad convexa: fundamento de la cota variacional' },
      ],
      topic: 'Conjugado de Fenchel f*(s) = sup_t{st-f(t)}. Interpretacion geometrica: tangente con pendiente s. Dualidad convexa.',
      title: 'Conjugado de Fenchel',
      tangentLabel: 'Tangente con pendiente s',
      gapLabel: 'st - f(t)',
      maxLabel: 'Maximo = f*(s)',
    },
    scene4: {
      id: 'Cota variacional',
      narration: 'Usando el conjugado, la f-divergencia tiene una cota variacional inferior. El supremo se toma sobre funciones T, y nos da una receta para estimar la divergencia con redes neuronales. Optimizar T es equivalente a entrenar el discriminador de una GAN: la red aprende a separar P de Q.',
      subtitleCues: [
        { time: 0.0, text: 'D_f(P||Q) >= sup_T E_P[T(x)] - E_Q[f*(T(x))]' },
        { time: 0.12, text: 'Cota inferior: podemos estimar D_f' },
        { time: 0.25, text: 'T: funcion parametrizada (red neuronal)' },
        { time: 0.4, text: 'Receta: maximizar la cota para estimar D_f' },
        { time: 0.55, text: 'Optimizar T = entrenar el discriminador' },
        { time: 0.7, text: 'La red aprende a separar P de Q' },
        { time: 0.85, text: 'Base teorica de todo el framework f-GAN' },
      ],
      topic: 'Cota variacional D_f >= sup_T E_P[T]-E_Q[f*(T)]. Red neuronal T maximiza. Base de f-GAN.',
      title: 'Cota variacional inferior',
      lhsLabel: 'D_f(P||Q)',
      geqLabel: '>=',
      rhsLabel: 'sup_T { E_P[T(x)] - E_Q[f*(T(x))] }',
      neuralLabel: 'T_w: red neuronal con pesos w',
      insight: 'Optimizar T es entrenar el discriminador',
    },
    scene5: {
      id: 'Framework f-GAN',
      narration: 'El framework f-GAN es como un menu donde cada plato es un GAN diferente. Cada eleccion de f da una divergencia, un conjugado y una activacion distintos. La GAN estandar corresponde a la fila de Jensen-Shannon. Cambia de fila y obtienes un GAN con comportamiento completamente diferente.',
      subtitleCues: [
        { time: 0.0, text: 'f-GAN: un menu de GANs' },
        { time: 0.12, text: 'Cada fila: f, f*, activacion, objetivo' },
        { time: 0.25, text: 'GAN estandar = fila JSD del menu' },
        { time: 0.4, text: 'KL-GAN: sensible donde P domina' },
        { time: 0.55, text: 'Reverse KL-GAN: sensible donde Q domina' },
        { time: 0.7, text: 'Chi-sq GAN: cuadratica, agresiva' },
        { time: 0.85, text: 'Cambia de fila, cambia el comportamiento' },
      ],
      topic: 'Framework f-GAN. Tabla de divergencias: f, f*, activacion, objetivo. GAN estandar = JSD. Diferentes f dan diferentes comportamientos.',
      title: 'Framework f-GAN',
      headerF: 'f(t)',
      headerConj: 'f*(s)',
      headerAct: 'Activacion',
      headerObj: 'Objetivo',
      stdGanLabel: 'GAN estandar',
      rowKL: 'KL',
      rowRevKL: 'Rev KL',
      rowJSD: 'JSD',
      rowChi: 'Chi-sq',
    },
    scene6: {
      id: 'Forward vs reverse KL revisitado',
      narration: 'Con la lente de las f-divergencias, la diferencia se vuelve nitida. La KL forward cubre todos los modos pero es borrosa, como un fotografo que sobreexpone para no perder nada. La KL reversa elige un modo y es nitida, como un fotografo que enfoca una sola flor. La JSD es el compromiso intermedio.',
      subtitleCues: [
        { time: 0.0, text: 'P bimodal: dos modos claros' },
        { time: 0.12, text: 'Forward KL: sobreexpone para cubrir todo' },
        { time: 0.25, text: 'Q difusa, borrosa, cubre todos los modos (VAEs)' },
        { time: 0.4, text: 'Reverse KL: enfoca una sola flor' },
        { time: 0.55, text: 'Q aguda, nitida, un solo modo (GANs)' },
        { time: 0.7, text: 'JSD: compromiso entre ambas' },
        { time: 0.85, text: 'La eleccion de f define el comportamiento generativo' },
      ],
      topic: 'Forward KL = mode-covering (VAEs, difuso). Reverse KL = mode-seeking (GANs, agudo). JSD = compromiso. Impacto en generacion.',
      title: 'Forward vs reverse KL revisitado',
      pLabel: 'P (real, bimodal)',
      qFwdLabel: 'Q* forward KL (difusa)',
      qRevLabel: 'Q* reverse KL (aguda)',
      qJsdLabel: 'Q* JSD (compromiso)',
      insight: 'La eleccion de divergencia determina el comportamiento del modelo generativo',
    },
    scene7: {
      id: 'Paisaje de divergencias',
      narration: 'Cada divergencia crea un paisaje de optimizacion diferente. La JSD tiene mesetas planas cuando los soportes no se solapan: el gradiente desaparece. La Wasserstein tiene una pendiente suave en todas partes, como una colina sin acantilados. Esto motiva la siguiente leccion sobre Wasserstein GANs.',
      subtitleCues: [
        { time: 0.0, text: 'Cada divergencia crea un paisaje diferente' },
        { time: 0.12, text: 'JSD: mesetas planas cuando no hay solapamiento' },
        { time: 0.25, text: 'El gradiente desaparece en las mesetas' },
        { time: 0.4, text: 'Wasserstein: colina suave, sin acantilados' },
        { time: 0.55, text: 'Gradiente informativo siempre disponible' },
        { time: 0.7, text: 'Un buen paisaje es clave para entrenar GANs' },
        { time: 0.85, text: 'Proximo: Wasserstein GAN' },
      ],
      topic: 'Paisaje de optimizacion de divergencias. JSD mesetas. Wasserstein suave. Motivacion para WGAN.',
      title: 'El paisaje de divergencias',
      jsdLabel: 'JSD: meseta',
      wassLabel: 'Wasserstein: suave',
      xAxisLabel: 'Distancia entre distribuciones',
      yAxisLabel: 'Valor de divergencia',
      insight: 'Un buen paisaje de optimizacion es clave para entrenar GANs',
    },
  },
  en: {
    lessonTitle: 'f-Divergences and Theory',
    lessonSubtitle: 'From the Fenchel conjugate to the f-GAN framework',
    scene1: {
      id: 'f-Divergence family',
      narration: 'f-divergences are like a family of rulers for measuring differences between distributions. They all share the same ingredient: the density ratio p over q, but each applies a different function f and averages under Q. It is a toolbox where every ruler measures differently.',
      subtitleCues: [
        { time: 0.0, text: 'D_f(P||Q) = E_Q[f(p(x)/q(x))]' },
        { time: 0.12, text: 'Family of rulers: all use the ratio p/q' },
        { time: 0.25, text: 'f convex with f(1) = 0' },
        { time: 0.4, text: 'Each function f generates a different ruler' },
        { time: 0.55, text: 'KL: f(t) = t log t' },
        { time: 0.7, text: 'Chi-squared: f(t) = (t-1)^2' },
        { time: 0.82, text: 'Toolbox: same base, different measures' },
      ],
      topic: 'f-divergence D_f(P||Q) = E_Q[f(p/q)]. General family parametrized by convex f. KL, chi-sq, reverse KL as special cases.',
      title: 'f-Divergence family',
      klLabel: 'KL: f(t) = t log t',
      chiLabel: 'Chi-sq: f(t) = (t-1)^2',
      revLabel: 'Rev KL: f(t) = -log t',
      fixedPoint: 'All pass through (1, 0)',
    },
    scene2: {
      id: 'Special cases',
      narration: 'Substituting f into the general formula is like choosing a lens for your telescope. With f equal to t log t you recover KL. With minus log t you see reverse KL. Each lens highlights different aspects of the difference between P and Q: some are sensitive to tails, others to the center.',
      subtitleCues: [
        { time: 0.0, text: 'Substitute f into the general formula' },
        { time: 0.12, text: 'Choosing f is like choosing a telescope lens' },
        { time: 0.25, text: 'f(t) = t log t => KL divergence' },
        { time: 0.4, text: 'f(t) = -log t => Reverse KL' },
        { time: 0.55, text: 'f(t) = (t-1)^2 => Chi-squared' },
        { time: 0.7, text: 'Each lens highlights different aspects' },
        { time: 0.85, text: 'Some sensitive to tails, others to the center' },
      ],
      topic: 'Special cases of f-divergence. Mechanical substitution of f to derive KL, reverse KL, JSD, chi-sq.',
      title: 'Known divergences as special cases',
      klDerivation: 'E_Q[t log t] where t = p/q => sum p log(p/q)',
      revDerivation: 'E_Q[-log(p/q)] => sum q log(q/p)',
      chiDerivation: 'E_Q[(p/q - 1)^2] => sum (p-q)^2 / q',
      jsdLabel: 'JSD: f(t) = -(t+1)/2 log((t+1)/2) + t/2 log t',
    },
    scene3: {
      id: 'Fenchel conjugate',
      narration: 'The Fenchel conjugate is like finding the line that best hugs the curve f from above. For each slope s, we seek the tangent that maximizes s times t minus f of t. Geometrically, the tangent glides along f searching for the optimal point at each inclination.',
      subtitleCues: [
        { time: 0.0, text: 'f*(s) = sup_t {s*t - f(t)}' },
        { time: 0.12, text: 'Finding the line that best hugs f from above' },
        { time: 0.25, text: 'For each slope s, find the optimal tangent' },
        { time: 0.4, text: 'Maximize the gap between line and curve' },
        { time: 0.55, text: 'The tangent glides along f' },
        { time: 0.7, text: 'f** = f: going twice brings you back' },
        { time: 0.85, text: 'Convex duality: foundation of the variational bound' },
      ],
      topic: 'Fenchel conjugate f*(s) = sup_t{st-f(t)}. Geometric interpretation: tangent with slope s. Convex duality.',
      title: 'Fenchel conjugate',
      tangentLabel: 'Tangent with slope s',
      gapLabel: 'st - f(t)',
      maxLabel: 'Maximum = f*(s)',
    },
    scene4: {
      id: 'Variational bound',
      narration: 'Using the conjugate, the f-divergence has a variational lower bound. The supremum is taken over functions T, giving us a recipe to estimate divergence with neural networks. Optimizing T is equivalent to training the GAN discriminator: the network learns to separate P from Q.',
      subtitleCues: [
        { time: 0.0, text: 'D_f(P||Q) >= sup_T E_P[T(x)] - E_Q[f*(T(x))]' },
        { time: 0.12, text: 'Lower bound: we can estimate D_f' },
        { time: 0.25, text: 'T: parameterized function (neural network)' },
        { time: 0.4, text: 'Recipe: maximize the bound to estimate D_f' },
        { time: 0.55, text: 'Optimizing T = training the discriminator' },
        { time: 0.7, text: 'The network learns to separate P from Q' },
        { time: 0.85, text: 'Theoretical basis of the entire f-GAN framework' },
      ],
      topic: 'Variational bound D_f >= sup_T E_P[T]-E_Q[f*(T)]. Neural net T maximizes. Basis of f-GAN.',
      title: 'Variational lower bound',
      lhsLabel: 'D_f(P||Q)',
      geqLabel: '>=',
      rhsLabel: 'sup_T { E_P[T(x)] - E_Q[f*(T(x))] }',
      neuralLabel: 'T_w: neural network with weights w',
      insight: 'Optimizing T is training the discriminator',
    },
    scene5: {
      id: 'f-GAN framework',
      narration: 'The f-GAN framework is like a menu where each dish is a different GAN. Each choice of f gives a different divergence, conjugate, and activation. The standard GAN is the Jensen-Shannon row. Switch rows and you get a GAN with completely different behavior.',
      subtitleCues: [
        { time: 0.0, text: 'f-GAN: a menu of GANs' },
        { time: 0.12, text: 'Each row: f, f*, activation, objective' },
        { time: 0.25, text: 'Standard GAN = JSD row on the menu' },
        { time: 0.4, text: 'KL-GAN: sensitive where P dominates' },
        { time: 0.55, text: 'Reverse KL-GAN: sensitive where Q dominates' },
        { time: 0.7, text: 'Chi-sq GAN: quadratic, aggressive' },
        { time: 0.85, text: 'Switch rows, switch behavior' },
      ],
      topic: 'f-GAN framework. Table of divergences: f, f*, activation, objective. Standard GAN = JSD. Different f give different behaviors.',
      title: 'f-GAN framework',
      headerF: 'f(t)',
      headerConj: 'f*(s)',
      headerAct: 'Activation',
      headerObj: 'Objective',
      stdGanLabel: 'Standard GAN',
      rowKL: 'KL',
      rowRevKL: 'Rev KL',
      rowJSD: 'JSD',
      rowChi: 'Chi-sq',
    },
    scene6: {
      id: 'Forward vs reverse KL revisited',
      narration: 'Through the f-divergence lens, the difference becomes sharp. Forward KL covers all modes but is blurry, like a photographer who overexposes to miss nothing. Reverse KL picks one mode and is crisp, like a photographer who focuses on a single flower. JSD is the intermediate compromise.',
      subtitleCues: [
        { time: 0.0, text: 'P bimodal: two clear modes' },
        { time: 0.12, text: 'Forward KL: overexposes to cover everything' },
        { time: 0.25, text: 'Q blurry, diffuse, covers all modes (VAEs)' },
        { time: 0.4, text: 'Reverse KL: focuses on a single flower' },
        { time: 0.55, text: 'Q sharp, crisp, one mode (GANs)' },
        { time: 0.7, text: 'JSD: compromise between both' },
        { time: 0.85, text: 'The choice of f defines generative behavior' },
      ],
      topic: 'Forward KL = mode-covering (VAEs, blurry). Reverse KL = mode-seeking (GANs, sharp). JSD = compromise. Impact on generation.',
      title: 'Forward vs reverse KL revisited',
      pLabel: 'P (true, bimodal)',
      qFwdLabel: 'Q* forward KL (blurry)',
      qRevLabel: 'Q* reverse KL (sharp)',
      qJsdLabel: 'Q* JSD (compromise)',
      insight: 'The choice of divergence determines the generative model behavior',
    },
    scene7: {
      id: 'Divergence landscape',
      narration: 'Each divergence creates a different optimization landscape. JSD has flat plateaus when supports do not overlap: the gradient vanishes. Wasserstein has a smooth slope everywhere, like a hill with no cliffs. This motivates the next lesson on Wasserstein GANs.',
      subtitleCues: [
        { time: 0.0, text: 'Each divergence creates a different landscape' },
        { time: 0.12, text: 'JSD: flat plateaus when no overlap' },
        { time: 0.25, text: 'Gradient vanishes on the plateaus' },
        { time: 0.4, text: 'Wasserstein: smooth hill, no cliffs' },
        { time: 0.55, text: 'Informative gradient always available' },
        { time: 0.7, text: 'A good landscape is key for training GANs' },
        { time: 0.85, text: 'Next: Wasserstein GAN' },
      ],
      topic: 'Divergence optimization landscape. JSD plateaus. Wasserstein smooth. Motivation for WGAN.',
      title: 'The divergence landscape',
      jsdLabel: 'JSD: plateau',
      wassLabel: 'Wasserstein: smooth',
      xAxisLabel: 'Distance between distributions',
      yAxisLabel: 'Divergence value',
      insight: 'A good optimization landscape is key for training GANs',
    },
  },
};

// ── Questions (bilingual) ──

export const questions: Record<Lang, {
  afterScene3: import('../../engine/types').QuestionData;
  afterScene6: import('../../engine/types').QuestionData;
}> = {
  es: {
    afterScene3: {
      question: 'El conjugado de Fenchel f*(s) = sup_t {s*t - f(t)} transforma una funcion convexa en otra. Geometricamente, que representa f*(s)?',
      choices: [
        'El area bajo la curva f hasta el punto s',
        'El valor maximo de la brecha entre la recta con pendiente s y la curva f',
        'La derivada de f evaluada en s',
        'La distancia entre f y la recta identidad',
      ],
      correctIndex: 1,
      hint: 'Piensa en deslizar una recta con pendiente s y buscar donde la brecha st - f(t) es maxima.',
      explanation: 'f*(s) es el maximo de st - f(t), que geometricamente es la mayor brecha vertical entre la recta con pendiente s y la curva f. La tangente optima toca f en el punto donde se alcanza ese maximo.',
    },
    afterScene6: {
      question: 'Si P es bimodal y usas reverse KL D_KL(Q||P) para ajustar Q, que forma toma Q?',
      choices: [
        'Una distribucion difusa que cubre ambos modos',
        'Una distribucion aguda concentrada en un solo modo',
        'Una distribucion uniforme',
        'Una copia exacta de P',
      ],
      correctIndex: 1,
      hint: 'La reverse KL penaliza donde Q > 0 pero P ~ 0. Q evita poner masa donde P no la tiene.',
      explanation: 'La reverse KL es mode-seeking: Q se concentra en un solo modo de P para evitar la penalizacion infinita de poner masa donde P es cero. Es aguda y precisa, pero pierde modos.',
    },
  },
  en: {
    afterScene3: {
      question: 'The Fenchel conjugate f*(s) = sup_t {s*t - f(t)} transforms a convex function into another. Geometrically, what does f*(s) represent?',
      choices: [
        'The area under the curve f up to point s',
        'The maximum gap between the line with slope s and the curve f',
        'The derivative of f evaluated at s',
        'The distance between f and the identity line',
      ],
      correctIndex: 1,
      hint: 'Think about sliding a line with slope s and finding where the gap st - f(t) is largest.',
      explanation: 'f*(s) is the maximum of st - f(t), which geometrically is the largest vertical gap between the line with slope s and the curve f. The optimal tangent touches f at the point where this maximum is achieved.',
    },
    afterScene6: {
      question: 'If P is bimodal and you use reverse KL D_KL(Q||P) to fit Q, what shape does Q take?',
      choices: [
        'A diffuse distribution that covers both modes',
        'A sharp distribution concentrated on a single mode',
        'A uniform distribution',
        'An exact copy of P',
      ],
      correctIndex: 1,
      hint: 'Reverse KL penalizes where Q > 0 but P ~ 0. Q avoids putting mass where P does not.',
      explanation: 'Reverse KL is mode-seeking: Q concentrates on one mode of P to avoid the infinite penalty of putting mass where P is zero. It is sharp and precise, but loses modes.',
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
