// Bilingual text for Latent Variables lesson

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
    lessonTitle: 'Variables Latentes',
    lessonSubtitle: 'Las causas ocultas detras de los datos',
    scene1: {
      id: 'Causas ocultas',
      narration: 'Imagina una fabrica de galletas. Tu ves las galletas, los datos x, pero no ves la receta ni los ajustes de la maquina. Esas configuraciones ocultas z son las variables latentes. Todo lo que observamos depende de causas que nunca vemos directamente.',
      subtitleCues: [
        { time: 0.0, text: 'Fabrica de galletas: ves galletas, no la receta' },
        { time: 0.15, text: 'x = datos observados (las galletas)' },
        { time: 0.3, text: 'z = variables latentes (ajustes ocultos)' },
        { time: 0.45, text: 'El VAE intenta descubrir z a partir de x' },
        { time: 0.6, text: 'Encoder: galleta -> receta estimada' },
        { time: 0.75, text: 'Decoder: receta -> galleta nueva' },
        { time: 0.85, text: 'Los datos dependen de causas ocultas' },
      ],
      topic: 'Variables latentes como causas ocultas. Analogia de la fabrica de galletas: ves cookies (x) pero no la receta (z).',
      title: 'Causas ocultas',
      cookieLabel: 'Galletas (x)',
      settingsLabel: 'Configuracion (z)',
      machineLabel: 'Maquina generadora',
    },
    scene2: {
      id: 'La distribucion conjunta',
      narration: 'La distribucion conjunta p de x y z se factoriza como p de x dado z por p de z. El prior dice que configuraciones son comunes. La verosimilitud dice que datos produce cada configuracion. Juntos definen el proceso generativo completo.',
      subtitleCues: [
        { time: 0.0, text: 'p(x,z) = p(x|z) * p(z)' },
        { time: 0.15, text: 'p(z) = prior: que ajustes son probables?' },
        { time: 0.3, text: 'p(x|z) = likelihood: que galleta sale de cada z?' },
        { time: 0.45, text: 'Paso 1: elegir z (la receta)' },
        { time: 0.6, text: 'Paso 2: generar x a partir de z (hornear)' },
        { time: 0.75, text: 'Es un modelo dirigido: z causa x' },
        { time: 0.85, text: 'Juntos definen el proceso generativo' },
      ],
      topic: 'Distribucion conjunta p(x,z) = p(x|z)p(z). Prior y likelihood.',
      title: 'La distribucion conjunta',
      priorLabel: 'Prior p(z)',
      likelihoodLabel: 'Likelihood p(x|z)',
      jointLabel: 'Conjunta p(x,z)',
    },
    scene3: {
      id: 'Marginalizar z',
      narration: 'Para obtener p de x, integramos sobre todas las z posibles. Es como si para saber la probabilidad de una galleta concreta, tuvieras que probar todas las configuraciones de la maquina y sumar. La marginal p de x es la sombra de la conjunta.',
      subtitleCues: [
        { time: 0.0, text: 'p(x) = integral p(x,z) dz' },
        { time: 0.15, text: 'Sumar sobre TODAS las z posibles' },
        { time: 0.3, text: 'Probar todas las recetas y acumular' },
        { time: 0.45, text: 'Colapsar el mapa 2D a curva 1D' },
        { time: 0.6, text: 'p(x) es la "sombra" de la conjunta' },
        { time: 0.75, text: 'Cada x acumula contribuciones de muchas z' },
        { time: 0.85, text: 'Concepto clave: marginalizar = sumar y olvidar z' },
      ],
      topic: 'Marginalizacion: p(x) = integral p(x,z)dz. Colapsar la conjunta. Analogia: probar TODAS las recetas.',
      title: 'Marginalizar z',
      integralLabel: 'integral p(x,z) dz',
      shadowLabel: 'Sombra = p(x)',
    },
    scene4: {
      id: 'Por que es intractable?',
      narration: 'Imagina que z tiene 100 dimensiones. Tendrias que sumar sobre todas las combinaciones posibles. Es como buscar una aguja en un pajar: muestreas millones de recetas al azar pero casi ninguna produce la galleta que quieres. La fuerza bruta es imposible.',
      subtitleCues: [
        { time: 0.0, text: 'z con muchas dimensiones: explosion combinatoria' },
        { time: 0.15, text: '1D: facil. 2D: plano. 3D: volumen.' },
        { time: 0.3, text: '100D: mas puntos que atomos en el universo' },
        { time: 0.45, text: 'Monte Carlo naive: aguja en un pajar' },
        { time: 0.6, text: 'Muestreas millones de z, casi ninguna sirve' },
        { time: 0.75, text: 'La varianza del estimador es altisima' },
        { time: 0.85, text: 'La fuerza bruta es imposible' },
      ],
      topic: 'Intractabilidad de la marginal en alta dimension. Monte Carlo naive falla: aguja en un pajar.',
      title: 'Por que es intractable?',
      dim1: '1D: facil',
      dim2: '2D: plano',
      dim3: '3D: volumen',
      dimHigh: '256D: imposible',
    },
    scene5: {
      id: 'La posterior p(z|x)',
      narration: 'Dado un dato x, que z lo genero? Bayes dice: p de z dado x es el numerador p de x dado z por p de z, dividido entre p de x. El numerador es calculable, pero el denominador es la marginal intractable. La posterior esta atrapada.',
      subtitleCues: [
        { time: 0.0, text: 'p(z|x) = p(x|z)p(z) / p(x)' },
        { time: 0.15, text: 'Dada esta galleta, que receta la hizo?' },
        { time: 0.3, text: 'Numerador: p(x|z)*p(z) = calculable' },
        { time: 0.45, text: 'Denominador: p(x) = intractable' },
        { time: 0.6, text: 'La posterior queda atrapada' },
        { time: 0.75, text: 'No podemos hacer inferencia exacta' },
        { time: 0.85, text: 'Necesitamos una aproximacion' },
      ],
      topic: 'Posterior p(z|x) via Bayes. Numerador tratable, denominador intractable.',
      title: 'La posterior p(z|x)',
      numeratorLabel: 'Numerador: p(x|z)*p(z)',
      denominatorLabel: 'Denominador: p(x)',
      computableLabel: 'Calculable',
      intractableLabel: 'Intractable',
    },
    scene6: {
      id: 'La idea variacional',
      narration: 'Como no podemos calcular la posterior real, la aproximamos. Elegimos una familia flexible q sub phi de z dado x. Optimizamos phi para que q se parezca lo mas posible a la verdadera posterior. Cuanto mejor es q, mas se cierra la brecha.',
      subtitleCues: [
        { time: 0.0, text: 'No podemos calcular p(z|x)...' },
        { time: 0.15, text: 'Idea: aproximar con q_phi(z|x)' },
        { time: 0.3, text: 'q es una familia flexible (red neuronal)' },
        { time: 0.45, text: 'Optimizar phi para minimizar KL(q || p(z|x))' },
        { time: 0.6, text: 'Cuanto mejor q, menor la brecha' },
        { time: 0.75, text: 'Si q = p(z|x), la brecha es cero' },
        { time: 0.85, text: 'Inferencia variacional: la clave del VAE' },
      ],
      topic: 'Inferencia variacional: aproximar p(z|x) con q_phi(z|x). Minimizar KL divergence.',
      title: 'La idea variacional',
      trueLabel: 'p(z|x) verdadera',
      approxLabel: 'q_phi(z|x) aproximacion',
      gapLabel: 'Brecha KL',
    },
    scene7: {
      id: 'Camino al ELBO',
      narration: 'Ya tenemos los ingredientes: una marginal intractable, una aproximacion q, y la desigualdad de Jensen. Juntos nos dan el ELBO, una cota inferior computable. En la siguiente leccion: derivar y descomponer el ELBO.',
      subtitleCues: [
        { time: 0.0, text: 'Tres ingredientes esenciales' },
        { time: 0.15, text: '1. Marginal intractable p(x)' },
        { time: 0.3, text: '2. Aproximacion q(z|x)' },
        { time: 0.45, text: '3. Desigualdad de Jensen' },
        { time: 0.6, text: 'Jensen: log E[*] >= E[log(*)]' },
        { time: 0.75, text: 'Resultado: ELBO <= log p(x)' },
        { time: 0.85, text: 'Siguiente: El ELBO en detalle' },
      ],
      topic: 'Resumen: ingredientes para el ELBO. Transicion a la siguiente leccion.',
      title: 'Camino al ELBO',
      ing1: 'p(x) intractable',
      ing2: 'q(z|x) aproximacion',
      ing3: 'Jensen -> ELBO',
      nextLabel: 'Siguiente: El ELBO',
    },
  },
  en: {
    lessonTitle: 'Latent Variables',
    lessonSubtitle: 'The hidden causes behind the data',
    scene1: {
      id: 'Hidden causes',
      narration: 'Imagine a cookie factory. You see the cookies, the data x, but not the recipe or the machine settings. Those hidden settings z are the latent variables. Everything we observe depends on causes we never see directly.',
      subtitleCues: [
        { time: 0.0, text: 'Cookie factory: you see cookies, not the recipe' },
        { time: 0.15, text: 'x = observed data (the cookies)' },
        { time: 0.3, text: 'z = latent variables (hidden settings)' },
        { time: 0.45, text: 'The VAE tries to discover z from x' },
        { time: 0.6, text: 'Encoder: cookie -> estimated recipe' },
        { time: 0.75, text: 'Decoder: recipe -> new cookie' },
        { time: 0.85, text: 'Data depends on hidden causes' },
      ],
      topic: 'Latent variables as hidden causes. Cookie factory analogy: you see cookies (x) but not the recipe (z).',
      title: 'Hidden causes',
      cookieLabel: 'Cookies (x)',
      settingsLabel: 'Settings (z)',
      machineLabel: 'Generating machine',
    },
    scene2: {
      id: 'The joint distribution',
      narration: 'The joint distribution p of x and z factors as p of x given z times p of z. The prior tells which settings are common. The likelihood tells what data each setting produces. Together they define the complete generative process.',
      subtitleCues: [
        { time: 0.0, text: 'p(x,z) = p(x|z) * p(z)' },
        { time: 0.15, text: 'p(z) = prior: which settings are likely?' },
        { time: 0.3, text: 'p(x|z) = likelihood: what cookie comes from each z?' },
        { time: 0.45, text: 'Step 1: choose z (the recipe)' },
        { time: 0.6, text: 'Step 2: generate x from z (bake)' },
        { time: 0.75, text: 'It is a directed model: z causes x' },
        { time: 0.85, text: 'Together they define the generative process' },
      ],
      topic: 'Joint distribution p(x,z) = p(x|z)p(z). Prior and likelihood.',
      title: 'The joint distribution',
      priorLabel: 'Prior p(z)',
      likelihoodLabel: 'Likelihood p(x|z)',
      jointLabel: 'Joint p(x,z)',
    },
    scene3: {
      id: 'Marginalizing out z',
      narration: 'To get p of x, we integrate over all possible z values. It is like trying every possible machine configuration and summing up. The marginal p of x is the shadow of the joint distribution.',
      subtitleCues: [
        { time: 0.0, text: 'p(x) = integral p(x,z) dz' },
        { time: 0.15, text: 'Sum over ALL possible z values' },
        { time: 0.3, text: 'Try every recipe and accumulate' },
        { time: 0.45, text: 'Collapse the 2D map to a 1D curve' },
        { time: 0.6, text: 'p(x) is the "shadow" of the joint' },
        { time: 0.75, text: 'Each x accumulates contributions from many z' },
        { time: 0.85, text: 'Key concept: marginalize = sum and forget z' },
      ],
      topic: 'Marginalization: p(x) = integral p(x,z)dz. Collapsing the joint. Analogy: try ALL recipes.',
      title: 'Marginalizing out z',
      integralLabel: 'integral p(x,z) dz',
      shadowLabel: 'Shadow = p(x)',
    },
    scene4: {
      id: 'Why is it intractable?',
      narration: 'Imagine z has 100 dimensions. You would have to sum over all possible combinations. It is like searching for a needle in a haystack: you sample millions of recipes at random but almost none produces the cookie you want. Brute force is impossible.',
      subtitleCues: [
        { time: 0.0, text: 'z with many dimensions: combinatorial explosion' },
        { time: 0.15, text: '1D: easy. 2D: plane. 3D: volume.' },
        { time: 0.3, text: '100D: more points than atoms in the universe' },
        { time: 0.45, text: 'Naive Monte Carlo: needle in a haystack' },
        { time: 0.6, text: 'Sample millions of z, almost none works' },
        { time: 0.75, text: 'The estimator variance is enormous' },
        { time: 0.85, text: 'Brute force is impossible' },
      ],
      topic: 'Intractability of the marginal in high dimensions. Naive Monte Carlo fails: needle in a haystack.',
      title: 'Why is it intractable?',
      dim1: '1D: easy',
      dim2: '2D: plane',
      dim3: '3D: volume',
      dimHigh: '256D: impossible',
    },
    scene5: {
      id: 'The posterior p(z|x)',
      narration: 'Given data x, which z generated it? Bayes rule says: the numerator p of x given z times p of z is computable, but the denominator is the intractable marginal. The posterior is trapped.',
      subtitleCues: [
        { time: 0.0, text: 'p(z|x) = p(x|z)p(z) / p(x)' },
        { time: 0.15, text: 'Given this cookie, what recipe made it?' },
        { time: 0.3, text: 'Numerator: p(x|z)*p(z) = computable' },
        { time: 0.45, text: 'Denominator: p(x) = intractable' },
        { time: 0.6, text: 'The posterior is trapped' },
        { time: 0.75, text: 'We cannot do exact inference' },
        { time: 0.85, text: 'We need an approximation' },
      ],
      topic: 'Posterior p(z|x) via Bayes. Tractable numerator, intractable denominator.',
      title: 'The posterior p(z|x)',
      numeratorLabel: 'Numerator: p(x|z)*p(z)',
      denominatorLabel: 'Denominator: p(x)',
      computableLabel: 'Computable',
      intractableLabel: 'Intractable',
    },
    scene6: {
      id: 'The variational idea',
      narration: 'Since we cannot compute the true posterior, we approximate it. We choose a flexible family q phi of z given x. We optimize phi so q resembles the true posterior as closely as possible. The better q is, the smaller the gap.',
      subtitleCues: [
        { time: 0.0, text: 'Cannot compute p(z|x)...' },
        { time: 0.15, text: 'Idea: approximate with q_phi(z|x)' },
        { time: 0.3, text: 'q is a flexible family (neural network)' },
        { time: 0.45, text: 'Optimize phi to minimize KL(q || p(z|x))' },
        { time: 0.6, text: 'Better q means smaller gap' },
        { time: 0.75, text: 'If q = p(z|x), the gap is zero' },
        { time: 0.85, text: 'Variational inference: the key to VAEs' },
      ],
      topic: 'Variational inference: approximate p(z|x) with q_phi(z|x). Minimize KL divergence.',
      title: 'The variational idea',
      trueLabel: 'True p(z|x)',
      approxLabel: 'q_phi(z|x) approximation',
      gapLabel: 'KL gap',
    },
    scene7: {
      id: 'Road to ELBO',
      narration: 'We now have all ingredients: an intractable marginal, an approximation q, and Jensen inequality. Together they give us the ELBO, a computable lower bound. Next lesson: derive and decompose the ELBO.',
      subtitleCues: [
        { time: 0.0, text: 'Three essential ingredients' },
        { time: 0.15, text: '1. Intractable marginal p(x)' },
        { time: 0.3, text: '2. Approximation q(z|x)' },
        { time: 0.45, text: '3. Jensen inequality' },
        { time: 0.6, text: 'Jensen: log E[*] >= E[log(*)]' },
        { time: 0.75, text: 'Result: ELBO <= log p(x)' },
        { time: 0.85, text: 'Next: The ELBO in detail' },
      ],
      topic: 'Summary: ingredients for the ELBO. Transition to next lesson.',
      title: 'Road to ELBO',
      ing1: 'Intractable p(x)',
      ing2: 'q(z|x) approximation',
      ing3: 'Jensen -> ELBO',
      nextLabel: 'Next: The ELBO',
    },
  },
};

export const questions: Record<Lang, {
  afterScene3: import('../../engine/types').QuestionData;
  afterScene6: import('../../engine/types').QuestionData;
}> = {
  es: {
    afterScene3: {
      question: 'Para calcular p(x), necesitamos integrar sobre todas las z. Si z tiene 100 dimensiones, por que la fuerza bruta es imposible?',
      choices: [
        'Porque no conocemos p(z)',
        'Porque el espacio crece exponencialmente con la dimension',
        'Porque p(x|z) no es diferenciable',
        'Porque necesitamos datos etiquetados',
      ],
      correctIndex: 1,
      hint: 'Piensa en cuantos puntos de cuadricula necesitas en 100 dimensiones',
      explanation: 'Con 100 dimensiones, el numero de puntos de cuadricula crece exponencialmente. Es como probar todas las recetas posibles en una fabrica con 100 perillas: cada una multiplica las combinaciones.',
    },
    afterScene6: {
      question: 'En inferencia variacional, que sucede con la brecha entre ELBO y log p(x) cuando q_phi(z|x) iguala exactamente a p(z|x)?',
      choices: [
        'La brecha se hace infinita',
        'La brecha se hace cero',
        'La brecha permanece constante',
        'No se puede determinar',
      ],
      correctIndex: 1,
      hint: 'La brecha es KL(q || p(z|x)). Que pasa cuando q = p(z|x)?',
      explanation: 'La brecha es exactamente KL(q || p(z|x)). Si q = p(z|x), la KL es cero y el ELBO iguala exactamente a log p(x).',
    },
  },
  en: {
    afterScene3: {
      question: 'To compute p(x), we need to integrate over all z. If z has 100 dimensions, why is brute force impossible?',
      choices: [
        'Because we do not know p(z)',
        'Because the space grows exponentially with dimension',
        'Because p(x|z) is not differentiable',
        'Because we need labeled data',
      ],
      correctIndex: 1,
      hint: 'Think about how many grid points you need in 100 dimensions',
      explanation: 'With 100 dimensions, the number of grid points grows exponentially. It is like trying every recipe in a factory with 100 dials: each one multiplies the combinations.',
    },
    afterScene6: {
      question: 'In variational inference, what happens to the gap between ELBO and log p(x) when q_phi(z|x) exactly equals p(z|x)?',
      choices: [
        'The gap becomes infinite',
        'The gap becomes zero',
        'The gap stays constant',
        'It cannot be determined',
      ],
      correctIndex: 1,
      hint: 'The gap is KL(q || p(z|x)). What happens when q = p(z|x)?',
      explanation: 'The gap is exactly KL(q || p(z|x)). If q = p(z|x), the KL is zero and the ELBO equals log p(x) exactly.',
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
