// Bilingual text for Wasserstein GAN lesson

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
    lessonTitle: 'Wasserstein GAN',
    lessonSubtitle: 'Earth Mover distance y gradient penalty',
    scene1: {
      id: 'Problema de soportes disjuntos',
      narration: 'Imagina dos pilas de arena separadas por un abismo. La JSD ve la misma distancia sin importar que tan lejos esten: log 2 constante. El discriminador clasifica perfectamente, pero el generador no recibe gradiente para acercarse. Es como gritar al otro lado de un canon sin que la voz llegue.',
      subtitleCues: [
        { time: 0.0, text: 'Dos distribuciones sin solapamiento' },
        { time: 0.12, text: 'Pilas de arena separadas por un abismo' },
        { time: 0.25, text: 'JSD = log 2 constante, sin importar la distancia' },
        { time: 0.4, text: 'D clasifica perfectamente: gradiente nulo' },
        { time: 0.55, text: 'Como gritar al otro lado de un canon' },
        { time: 0.7, text: 'G no sabe hacia donde moverse' },
        { time: 0.85, text: 'Motivacion: necesitamos una metrica mejor' },
      ],
      topic: 'Soportes disjuntos: JSD=log2, gradiente cero. El discriminador gana trivialmente. Motivacion para Wasserstein.',
      title: 'Problema de soportes disjuntos',
      pLabel: 'P_real',
      qLabel: 'P_gen',
      jsdLabel: 'JSD = log 2',
      noGradient: 'Sin gradiente!',
      slidingLabel: 'Las distribuciones se acercan...',
    },
    scene2: {
      id: 'Distancia Earth Mover',
      narration: 'La distancia Earth Mover pregunta: cual es el trabajo minimo para mover una pila de arena hasta tomar la forma de otra? Mueves la menor cantidad de tierra la menor distancia. Si las pilas estan lejos, W es grande; si estan cerca, W es pequena. Siempre da un gradiente proporcional a la distancia real.',
      subtitleCues: [
        { time: 0.0, text: 'W(P,Q) = minimo trabajo para remodelar P en Q' },
        { time: 0.12, text: 'Pilas de arena: mover la menor tierra posible' },
        { time: 0.25, text: 'Cada grano viaja la minima distancia' },
        { time: 0.4, text: 'Lejos = W grande, cerca = W pequena' },
        { time: 0.55, text: 'Para masas puntuales: W = |theta| (suave)' },
        { time: 0.7, text: 'Mientras tanto: KL = infinito, JSD = ln 2 (constante)' },
        { time: 0.85, text: 'Wasserstein: gradiente proporcional a la distancia real' },
      ],
      topic: 'Earth Mover / Wasserstein distance W(P,Q). Transporte optimo. Gradiente informativo sin solapamiento.',
      title: 'Distancia Earth Mover',
      pile1Label: 'P (tierra)',
      pile2Label: 'Q (objetivo)',
      costLabel: 'Costo = distancia x cantidad',
      insight: 'Siempre da gradiente util',
    },
    scene3: {
      id: 'Objetivo WGAN',
      narration: 'El objetivo de WGAN usa la dualidad de Kantorovich-Rubinstein. En vez de un discriminador con sigmoid, tenemos un critico con salida libre. El critico maximiza la diferencia de esperanzas entre datos reales y generados, sujeto a una restriccion de Lipschitz. Es como un tasador que da puntajes, no etiquetas.',
      subtitleCues: [
        { time: 0.0, text: 'W(P,Q) = max_{||f||_L<=1} E_real[f(x)] - E_fake[f(x)]' },
        { time: 0.12, text: 'Dualidad de Kantorovich-Rubinstein' },
        { time: 0.25, text: 'Critico f, no discriminador: salida sin acotar' },
        { time: 0.4, text: 'No sigmoid: puntajes continuos, no etiquetas' },
        { time: 0.55, text: 'Maximizar la brecha entre reales y falsos' },
        { time: 0.7, text: 'Restriccion: ||f||_L <= 1 (Lipschitz)' },
        { time: 0.85, text: 'Tasador que da puntajes, no etiquetas binarias' },
      ],
      topic: 'WGAN objective via Kantorovich-Rubinstein duality. Critic vs discriminator. Lipschitz constraint.',
      title: 'Objetivo WGAN',
      criticLabel: 'Critico f',
      realLabel: 'E[f(x_real)]',
      fakeLabel: 'E[f(x_fake)]',
      gapLabel: 'Maximizar esta brecha',
      lipLabel: 'sujeto a ||f||_L <= 1',
    },
    scene4: {
      id: 'Restriccion de Lipschitz',
      narration: 'La restriccion de Lipschitz dice que la funcion no puede cambiar mas rapido que pendiente uno. Imagina un excursionista caminando por una montana: no puede subir mas rapido que un metro por metro horizontal. Graficamente, la funcion debe caber dentro de conos con inclinacion de 45 grados.',
      subtitleCues: [
        { time: 0.0, text: '|f(x1) - f(x2)| <= |x1 - x2|' },
        { time: 0.12, text: 'La funcion no puede cambiar mas rapido que pendiente 1' },
        { time: 0.25, text: 'Excursionista: no sube mas de 1m por metro horizontal' },
        { time: 0.4, text: 'Conos de restriccion a 45 grados' },
        { time: 0.55, text: 'Funcion valida: cabe dentro de los conos' },
        { time: 0.7, text: 'Funcion invalida: pendiente demasiado empinada' },
        { time: 0.85, text: 'Lipschitz K=1: la suavidad que necesita WGAN' },
      ],
      topic: 'Lipschitz constraint: |f(x1)-f(x2)|<=K|x1-x2|. K=1 for WGAN. Constraint cones. Valid vs invalid functions.',
      title: 'Restriccion de Lipschitz',
      slopeLabel: 'Pendiente <= 1',
      coneLabel: 'Cono de restriccion',
      validLabel: 'Valida (Lipschitz)',
      invalidLabel: 'Invalida (pendiente > 1)',
    },
    scene5: {
      id: 'Weight clipping',
      narration: 'La primera solucion fue burda: recortar los pesos del critico al rango menos c a c despues de cada paso. Es como podar un arbusto con motosierra. Los pesos se acumulan en los extremos, y c es dificil de elegir: muy pequeno colapsa la capacidad, muy grande pierde la restriccion.',
      subtitleCues: [
        { time: 0.0, text: 'Clip pesos a [-c, c] despues de cada paso' },
        { time: 0.12, text: 'Podar un arbusto con motosierra: burdo' },
        { time: 0.25, text: 'Facil de implementar pero problematico' },
        { time: 0.4, text: 'Los pesos se acumulan en -c y +c: bimodales' },
        { time: 0.55, text: 'c muy pequeno => capacidad colapsada' },
        { time: 0.7, text: 'c muy grande => restriccion perdida' },
        { time: 0.85, text: 'Problema Goldilocks: que valor de c?' },
      ],
      topic: 'Weight clipping [-c,c]. Crude Lipschitz enforcement. Bimodal weights. Goldilocks problem with c.',
      title: 'Weight clipping',
      beforeLabel: 'Pesos antes del clip',
      afterLabel: 'Pesos despues del clip',
      cSmallLabel: 'c muy pequeno',
      cLargeLabel: 'c muy grande',
      goldilocksLabel: 'Problema Goldilocks: que valor de c?',
    },
    scene6: {
      id: 'Gradient penalty (WGAN-GP)',
      narration: 'La solucion elegante es el gradient penalty. Interpolamos entre datos reales y generados, creando puntos fantasma en el camino entre ambas distribuciones. En esos puntos, penalizamos cuando la norma del gradiente del critico se aleja de uno. Lambda igual a diez funciona en la practica.',
      subtitleCues: [
        { time: 0.0, text: 'x_hat = t*x_real + (1-t)*x_fake: puntos fantasma' },
        { time: 0.12, text: 'Interpolar entre distribuciones: el camino entre ambas' },
        { time: 0.25, text: 'Penalizar: lambda * E[(||nabla f(x_hat)||-1)^2]' },
        { time: 0.4, text: 'Gradiente empujado suavemente hacia norma 1' },
        { time: 0.55, text: 'Sin clipping: entrenamiento mas estable' },
        { time: 0.7, text: 'lambda = 10 funciona universalmente' },
        { time: 0.85, text: 'WGAN-GP: la version elegante de la restriccion' },
      ],
      topic: 'WGAN-GP: gradient penalty en puntos interpolados. lambda*E[(||grad f(x_hat)||-1)^2]. Lipschitz suave.',
      title: 'Gradient Penalty (WGAN-GP)',
      interpLabel: 'Punto interpolado x_hat',
      gradLabel: '||nabla f(x_hat)|| -> 1',
      penaltyLabel: 'lambda * (||grad||-1)^2',
      lambdaLabel: 'lambda = 10 (tipico)',
    },
    scene7: {
      id: 'WGAN vs GAN estandar',
      narration: 'La comparacion es contundente. La GAN estandar tiene un loss oscilante que no dice nada sobre la calidad. WGAN-GP tiene un loss suave que baja de forma monotona: cuando el loss baja, la calidad sube. Ademas, WGAN-GP evita el mode collapse y produce generacion estable y diversa.',
      subtitleCues: [
        { time: 0.0, text: 'GAN estandar: loss oscilante y no informativo' },
        { time: 0.12, text: 'No correlaciona con calidad de muestras' },
        { time: 0.25, text: 'WGAN-GP: loss suave, monotonamente decreciente' },
        { time: 0.4, text: 'Cuando loss baja, calidad sube: correlacion directa' },
        { time: 0.55, text: 'Sin mode collapse: diversidad preservada' },
        { time: 0.7, text: 'Entrenamiento estable y reproducible' },
        { time: 0.85, text: 'Wasserstein: la metrica que GANs necesitaban' },
      ],
      topic: 'WGAN vs standard GAN. Meaningful loss, no mode collapse, stable training. Side-by-side comparison.',
      title: 'WGAN vs GAN estandar',
      stdTitle: 'GAN estandar',
      wganTitle: 'WGAN-GP',
      lossLabel: 'Loss del generador',
      iterLabel: 'Iteraciones',
      modeCollapseLabel: 'Mode collapse',
      stableLabel: 'Entrenamiento estable',
    },
  },
  en: {
    lessonTitle: 'Wasserstein GAN',
    lessonSubtitle: 'Earth Mover distance and gradient penalty',
    scene1: {
      id: 'Disjoint support problem',
      narration: 'Imagine two sand piles separated by a chasm. JSD sees the same distance no matter how far apart they are: constant log 2. The discriminator classifies perfectly, but the generator gets no gradient to move closer. It is like shouting across a canyon where the voice never reaches.',
      subtitleCues: [
        { time: 0.0, text: 'Two non-overlapping distributions' },
        { time: 0.12, text: 'Sand piles separated by a chasm' },
        { time: 0.25, text: 'JSD = log 2 constant, regardless of distance' },
        { time: 0.4, text: 'D classifies perfectly: zero gradient' },
        { time: 0.55, text: 'Like shouting across a canyon' },
        { time: 0.7, text: 'G does not know which way to move' },
        { time: 0.85, text: 'Motivation: we need a better metric' },
      ],
      topic: 'Disjoint supports: JSD=log2, zero gradient. Discriminator wins trivially. Motivation for Wasserstein.',
      title: 'Disjoint support problem',
      pLabel: 'P_real',
      qLabel: 'P_gen',
      jsdLabel: 'JSD = log 2',
      noGradient: 'No gradient!',
      slidingLabel: 'Distributions getting closer...',
    },
    scene2: {
      id: 'Earth Mover distance',
      narration: 'The Earth Mover distance asks: what is the minimum work to reshape one sand pile into another? You move the least dirt the shortest distance. If the piles are far, W is large; if close, W is small. It always gives a gradient proportional to the actual distance.',
      subtitleCues: [
        { time: 0.0, text: 'W(P,Q) = minimum work to reshape P into Q' },
        { time: 0.12, text: 'Sand piles: move the least dirt possible' },
        { time: 0.25, text: 'Each grain travels the minimum distance' },
        { time: 0.4, text: 'Far = W large, close = W small' },
        { time: 0.55, text: 'For point masses: W = |theta| (smooth)' },
        { time: 0.7, text: 'Meanwhile: KL = infinity, JSD = ln 2 (constant)' },
        { time: 0.85, text: 'Wasserstein: gradient proportional to actual distance' },
      ],
      topic: 'Earth Mover / Wasserstein distance W(P,Q). Optimal transport. Informative gradient without overlap.',
      title: 'Earth Mover distance',
      pile1Label: 'P (dirt)',
      pile2Label: 'Q (target)',
      costLabel: 'Cost = distance x amount',
      insight: 'Always gives useful gradient',
    },
    scene3: {
      id: 'WGAN objective',
      narration: 'The WGAN objective uses the Kantorovich-Rubinstein duality. Instead of a discriminator with sigmoid, we have a critic with free output. The critic maximizes the difference of expectations between real and generated data, subject to a Lipschitz constraint. It is like an appraiser who gives scores, not labels.',
      subtitleCues: [
        { time: 0.0, text: 'W(P,Q) = max_{||f||_L<=1} E_real[f(x)] - E_fake[f(x)]' },
        { time: 0.12, text: 'Kantorovich-Rubinstein duality' },
        { time: 0.25, text: 'Critic f, not discriminator: unbounded output' },
        { time: 0.4, text: 'No sigmoid: continuous scores, not labels' },
        { time: 0.55, text: 'Maximize the gap between real and fake' },
        { time: 0.7, text: 'Constraint: ||f||_L <= 1 (Lipschitz)' },
        { time: 0.85, text: 'Appraiser who gives scores, not binary labels' },
      ],
      topic: 'WGAN objective via Kantorovich-Rubinstein duality. Critic vs discriminator. Lipschitz constraint.',
      title: 'WGAN objective',
      criticLabel: 'Critic f',
      realLabel: 'E[f(x_real)]',
      fakeLabel: 'E[f(x_fake)]',
      gapLabel: 'Maximize this gap',
      lipLabel: 'subject to ||f||_L <= 1',
    },
    scene4: {
      id: 'Lipschitz constraint',
      narration: 'The Lipschitz constraint says the function cannot change faster than slope one. Imagine a hiker walking up a mountain: they cannot climb faster than one meter per horizontal meter. Graphically, the function must fit inside cones tilted at 45 degrees.',
      subtitleCues: [
        { time: 0.0, text: '|f(x1) - f(x2)| <= |x1 - x2|' },
        { time: 0.12, text: 'Function cannot change faster than slope 1' },
        { time: 0.25, text: 'Hiker: cannot climb more than 1m per horizontal meter' },
        { time: 0.4, text: 'Constraint cones at 45 degrees' },
        { time: 0.55, text: 'Valid function: fits inside the cones' },
        { time: 0.7, text: 'Invalid function: slope too steep' },
        { time: 0.85, text: 'Lipschitz K=1: the smoothness WGAN needs' },
      ],
      topic: 'Lipschitz constraint: |f(x1)-f(x2)|<=K|x1-x2|. K=1 for WGAN. Constraint cones. Valid vs invalid functions.',
      title: 'Lipschitz constraint',
      slopeLabel: 'Slope <= 1',
      coneLabel: 'Constraint cone',
      validLabel: 'Valid (Lipschitz)',
      invalidLabel: 'Invalid (slope > 1)',
    },
    scene5: {
      id: 'Weight clipping',
      narration: 'The first solution was crude: clip critic weights to the range minus c to c after each step. It is like pruning a bush with a chainsaw. Weights pile up at the extremes, and c is hard to choose: too small collapses capacity, too large loses the constraint.',
      subtitleCues: [
        { time: 0.0, text: 'Clip weights to [-c, c] after each step' },
        { time: 0.12, text: 'Pruning a bush with a chainsaw: crude' },
        { time: 0.25, text: 'Easy to implement but problematic' },
        { time: 0.4, text: 'Weights pile up at -c and +c: bimodal' },
        { time: 0.55, text: 'c too small => capacity collapsed' },
        { time: 0.7, text: 'c too large => constraint lost' },
        { time: 0.85, text: 'Goldilocks problem: what value of c?' },
      ],
      topic: 'Weight clipping [-c,c]. Crude Lipschitz enforcement. Bimodal weights. Goldilocks problem with c.',
      title: 'Weight clipping',
      beforeLabel: 'Weights before clip',
      afterLabel: 'Weights after clip',
      cSmallLabel: 'c too small',
      cLargeLabel: 'c too large',
      goldilocksLabel: 'Goldilocks problem: what value of c?',
    },
    scene6: {
      id: 'Gradient penalty (WGAN-GP)',
      narration: 'The elegant solution is gradient penalty. We interpolate between real and generated data, creating ghost points along the path between both distributions. At those points, we penalize when the gradient norm of the critic deviates from one. Lambda equal to ten works in practice.',
      subtitleCues: [
        { time: 0.0, text: 'x_hat = t*x_real + (1-t)*x_fake: ghost points' },
        { time: 0.12, text: 'Interpolate between distributions: the path between both' },
        { time: 0.25, text: 'Penalize: lambda * E[(||nabla f(x_hat)||-1)^2]' },
        { time: 0.4, text: 'Gradient softly pushed toward norm 1' },
        { time: 0.55, text: 'No clipping: more stable training' },
        { time: 0.7, text: 'lambda = 10 works universally' },
        { time: 0.85, text: 'WGAN-GP: the elegant version of the constraint' },
      ],
      topic: 'WGAN-GP: gradient penalty at interpolated points. lambda*E[(||grad f(x_hat)||-1)^2]. Soft Lipschitz.',
      title: 'Gradient Penalty (WGAN-GP)',
      interpLabel: 'Interpolated point x_hat',
      gradLabel: '||nabla f(x_hat)|| -> 1',
      penaltyLabel: 'lambda * (||grad||-1)^2',
      lambdaLabel: 'lambda = 10 (typical)',
    },
    scene7: {
      id: 'WGAN vs standard GAN',
      narration: 'The comparison is decisive. Standard GAN has oscillating loss that says nothing about quality. WGAN-GP has smooth monotonically decreasing loss: when loss goes down, quality goes up. Additionally, WGAN-GP avoids mode collapse and produces stable, diverse generation.',
      subtitleCues: [
        { time: 0.0, text: 'Standard GAN: oscillating, uninformative loss' },
        { time: 0.12, text: 'Does not correlate with sample quality' },
        { time: 0.25, text: 'WGAN-GP: smooth, monotonically decreasing loss' },
        { time: 0.4, text: 'When loss drops, quality rises: direct correlation' },
        { time: 0.55, text: 'No mode collapse: diversity preserved' },
        { time: 0.7, text: 'Stable, reproducible training' },
        { time: 0.85, text: 'Wasserstein: the metric GANs needed' },
      ],
      topic: 'WGAN vs standard GAN. Meaningful loss, no mode collapse, stable training. Side-by-side comparison.',
      title: 'WGAN vs standard GAN',
      stdTitle: 'Standard GAN',
      wganTitle: 'WGAN-GP',
      lossLabel: 'Generator loss',
      iterLabel: 'Iterations',
      modeCollapseLabel: 'Mode collapse',
      stableLabel: 'Stable training',
    },
  },
};

// ── Questions (bilingual) ──

export const questions: Record<Lang, {
  afterScene4: import('../../engine/types').QuestionData;
  afterScene6: import('../../engine/types').QuestionData;
}> = {
  es: {
    afterScene4: {
      question: 'Dos masas puntuales en posiciones 0 y theta no se solapan. Cual es la distancia Wasserstein W entre ellas, comparada con KL y JSD?',
      choices: [
        'W = |theta|, KL = |theta|, JSD = |theta|',
        'W = |theta|, KL = infinito, JSD = ln 2 (constante)',
        'W = ln 2, KL = infinito, JSD = |theta|',
        'W = 0, KL = 0, JSD = 0 (ambas son puntuales)',
      ],
      correctIndex: 1,
      hint: 'Piensa en que pasa con KL y JSD cuando los soportes son completamente disjuntos.',
      explanation: 'Para masas puntuales sin solapamiento: W = |theta| (crece suavemente con la distancia), KL diverge a infinito, y JSD es constante en ln 2. Por eso Wasserstein da gradiente proporcional a la distancia real.',
    },
    afterScene6: {
      question: 'En WGAN-GP, por que se penaliza la norma del gradiente en puntos interpolados x_hat = t*x_real + (1-t)*x_fake?',
      choices: [
        'Para que el critico sea mas preciso en datos reales',
        'Para forzar que la norma del gradiente sea cercana a 1, imponiendo suavemente la restriccion de Lipschitz',
        'Para acelerar la convergencia del generador',
        'Para prevenir el mode collapse directamente',
      ],
      correctIndex: 1,
      hint: 'La restriccion de Lipschitz dice que la pendiente maxima es 1. El gradient penalty empuja ||grad|| hacia 1.',
      explanation: 'La penalizacion lambda*E[(||grad f(x_hat)||-1)^2] fuerza suavemente que la norma del gradiente del critico sea 1 en puntos interpolados, lo que impone la condicion de Lipschitz sin necesidad de weight clipping. Lambda = 10 es el valor tipico.',
    },
  },
  en: {
    afterScene4: {
      question: 'Two point masses at positions 0 and theta do not overlap. What is the Wasserstein distance W between them, compared to KL and JSD?',
      choices: [
        'W = |theta|, KL = |theta|, JSD = |theta|',
        'W = |theta|, KL = infinity, JSD = ln 2 (constant)',
        'W = ln 2, KL = infinity, JSD = |theta|',
        'W = 0, KL = 0, JSD = 0 (both are point masses)',
      ],
      correctIndex: 1,
      hint: 'Think about what happens to KL and JSD when supports are completely disjoint.',
      explanation: 'For non-overlapping point masses: W = |theta| (grows smoothly with distance), KL diverges to infinity, and JSD is constant at ln 2. This is why Wasserstein gives gradient proportional to actual distance.',
    },
    afterScene6: {
      question: 'In WGAN-GP, why is the gradient norm penalized at interpolated points x_hat = t*x_real + (1-t)*x_fake?',
      choices: [
        'To make the critic more accurate on real data',
        'To force the gradient norm close to 1, softly enforcing the Lipschitz constraint',
        'To accelerate generator convergence',
        'To prevent mode collapse directly',
      ],
      correctIndex: 1,
      hint: 'The Lipschitz constraint says maximum slope is 1. The gradient penalty pushes ||grad|| toward 1.',
      explanation: 'The penalty lambda*E[(||grad f(x_hat)||-1)^2] softly forces the critic gradient norm to be 1 at interpolated points, enforcing the Lipschitz condition without weight clipping. Lambda = 10 is the typical value.',
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
