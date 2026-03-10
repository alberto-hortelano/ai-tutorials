// Bilingual text for Monte Carlo Estimation lesson

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
    lessonTitle: 'Estimacion Monte Carlo',
    lessonSubtitle: 'De muestras aleatorias al ELBO',
    scene1: {
      id: 'Estimar esperanzas con muestras',
      narration: 'La idea clave de Monte Carlo: no necesitas calcular integrales. Imagina lanzar dardos aleatorios sobre un lago para estimar su area. Tomas muestras de p, evaluas f en cada una, y promedias. Con pocas muestras el estimado oscila, pero al crecer N converge al valor real.',
      subtitleCues: [
        { time: 0.0, text: 'Monte Carlo: estimar integrales con muestras' },
        { time: 0.12, text: 'Como lanzar dardos al azar sobre un lago' },
        { time: 0.25, text: 'Fraccion dentro del lago = area estimada' },
        { time: 0.38, text: 'E[f(x)] ≈ (1/N) Σ f(xᵢ), xᵢ ~ p' },
        { time: 0.52, text: 'N=10: estimado ruidoso, oscila mucho' },
        { time: 0.65, text: 'N=100: se acerca al valor real' },
        { time: 0.78, text: 'N=1000: converge por ley de grandes numeros' },
        { time: 0.92, text: 'Mas muestras = mejor estimacion, siempre' },
      ],
      topic: 'Estimacion Monte Carlo de esperanzas. E_p[f(x)] se aproxima con (1/N) sum f(xi) donde xi~p. Converge por la ley de grandes numeros.',
      title: 'Estimar esperanzas con muestras',
      pLabel: 'p(x)',
      fLabel: 'f(x)',
      runningAvg: 'Promedio acumulado',
      trueValue: 'Valor real E[f(x)]',
      nLabel: 'N = $1',
    },
    scene2: {
      id: 'La varianza: el enemigo',
      narration: 'La varianza controla la calidad del estimado. Una funcion suave converge rapido. Una funcion con picos salvajes necesita muchas mas muestras. Lo maravilloso: la tasa de convergencia es O de 1 sobre N, y no depende de la dimensionalidad. Funciona igual en 2D que en un millon de dimensiones.',
      subtitleCues: [
        { time: 0.0, text: 'Varianza = calidad del estimado' },
        { time: 0.12, text: 'Funcion suave: convergencia rapida' },
        { time: 0.25, text: 'Funcion salvaje: convergencia lenta' },
        { time: 0.38, text: 'Var se reduce como 1/N — ley fundamental' },
        { time: 0.52, text: 'Ejemplo: E[x²], N=10→0.68, N=100→0.95' },
        { time: 0.65, text: 'N=1000→1.01, N=10000→0.998 (valor real: 1.0)' },
        { time: 0.78, text: 'Tasa O(1/N) NO depende de la dimensionalidad' },
        { time: 0.92, text: 'Ventaja clave sobre integracion numerica' },
      ],
      topic: 'Varianza del estimador Monte Carlo. Var[(1/N)sum f(xi)] = Var[f(x)]/N. Funciones con alta varianza requieren mas muestras.',
      title: 'La varianza: el enemigo',
      gentle: 'Funcion suave',
      wild: 'Funcion con picos',
      errorBand: 'Banda de error',
      varFormula: 'Var proporcional a 1/N',
    },
    scene3: {
      id: 'Muestreo por importancia',
      narration: 'Cuando no puedes muestrear de p, usas una propuesta q y ponderas cada muestra por p sobre q. Si q cubre bien donde p tiene masa, los pesos son estables. Si q es muy distinta, algunos pesos explotan y el estimado es inutil. Es como buscar una aguja en un pajar: si buscas en el lugar equivocado, nunca la encuentras.',
      subtitleCues: [
        { time: 0.0, text: 'No puedes muestrear de p? Usa propuesta q' },
        { time: 0.12, text: 'E_p[f(x)] = E_q[f(x)·p(x)/q(x)]' },
        { time: 0.25, text: 'Peso de importancia: w = p(x)/q(x)' },
        { time: 0.38, text: 'Buena q (parecida a p): pesos estables' },
        { time: 0.52, text: 'Mala q (muy diferente): pesos extremos' },
        { time: 0.65, text: 'Como buscar una aguja en un pajar' },
        { time: 0.78, text: 'Si buscas en el lugar equivocado: todo falla' },
        { time: 0.92, text: 'La q optima es proporcional a |f(x)|·p(x)' },
      ],
      topic: 'Importance sampling. E_p[f(x)] = E_q[f(x) p(x)/q(x)]. La propuesta q debe cubrir el soporte de p. Pesos de importancia w_i = p(xi)/q(xi).',
      title: 'Muestreo por importancia',
      targetLabel: 'p(x) objetivo',
      proposalLabel: 'q(x) propuesta',
      weightLabel: 'w = p/q',
    },
    scene4: {
      id: 'El desafio de la verosimilitud marginal',
      narration: 'En modelos con variables latentes, p de x requiere integrar sobre todos los z posibles. El espacio latente es enorme y solo una franja delgada contribuye. Las muestras aleatorias caen en un desierto de z inutiles, como lanzar dardos al oceano esperando acertar a una isla diminuta.',
      subtitleCues: [
        { time: 0.0, text: 'p(x) = ∫ p(x,z) dz — integral intratable' },
        { time: 0.12, text: 'El espacio latente z es enorme' },
        { time: 0.25, text: 'Solo una franja delgada de z contribuye' },
        { time: 0.4, text: 'Muestras aleatorias caen en el desierto' },
        { time: 0.55, text: 'Como lanzar dardos al oceano buscando una isla' },
        { time: 0.68, text: 'Monte Carlo directo: estimado muy ruidoso' },
        { time: 0.8, text: 'Necesitamos una propuesta q inteligente' },
        { time: 0.92, text: 'Idea: q(z|x) que apunte a la franja util' },
      ],
      topic: 'Verosimilitud marginal en VAEs. p(x) = integral p(x|z)p(z)dz. La mayoria de z no contribuyen. Muestreo directo es ineficiente.',
      title: 'La verosimilitud marginal',
      jointLabel: 'p(x, z)',
      sliceLabel: 'Solo esta franja importa',
      desertLabel: 'Desierto de z inutiles',
      xFixed: 'x fijo',
    },
    scene5: {
      id: 'Desigualdad de Jensen',
      narration: 'Para funciones concavas como el logaritmo, Jensen nos dice que el log del promedio siempre es mayor o igual que el promedio de los logs. Es como decir que el promedio del examen nunca es peor que el peor caso. Esta brecha no negativa es la clave para derivar el ELBO.',
      subtitleCues: [
        { time: 0.0, text: 'Jensen: para f concava' },
        { time: 0.12, text: 'f(E[X]) ≥ E[f(X)]' },
        { time: 0.25, text: 'Con f = log: log(E[X]) ≥ E[log(X)]' },
        { time: 0.4, text: 'La brecha es siempre ≥ 0' },
        { time: 0.55, text: 'Igualdad solo cuando X es constante' },
        { time: 0.68, text: 'Visualiza: la curva log siempre esta por debajo de la recta' },
        { time: 0.8, text: 'Esta desigualdad nos da una cota inferior' },
        { time: 0.92, text: 'Clave para derivar el ELBO en VAEs' },
      ],
      topic: 'Desigualdad de Jensen. Para f concava: f(E[X]) >= E[f(X)]. Con f=log: log(E[X]) >= E[log(X)]. Fundamental para la derivacion del ELBO.',
      title: 'Desigualdad de Jensen',
      logCurve: 'log(x)',
      avgOfLogs: 'E[log(X)]',
      logOfAvg: 'log(E[X])',
      gapLabel: 'Brecha >= 0',
    },
    scene6: {
      id: 'De Jensen al ELBO',
      narration: 'Partimos de log p de x. Insertamos q para crear una esperanza bajo q. Aplicamos Jensen y obtenemos la cota inferior: el ELBO. Cada paso es una identidad o desigualdad simple. En la practica, el VAE usa k igual a 1 muestra de q y aun asi funciona gracias al gradiente estocastico.',
      subtitleCues: [
        { time: 0.0, text: 'log p(x) = log ∫ p(x,z) dz' },
        { time: 0.12, text: 'Multiplicar y dividir por q(z): log ∫ [p(x,z)/q(z)]·q(z) dz' },
        { time: 0.25, text: '= log E_q[p(x,z)/q(z)]' },
        { time: 0.4, text: 'Jensen: ≥ E_q[log p(x,z)/q(z)]' },
        { time: 0.55, text: 'ELBO = E_q[log p(x,z) - log q(z)]' },
        { time: 0.68, text: 'En practica: k=1 muestra de q ya funciona' },
        { time: 0.8, text: 'Gradiente estocastico hace el resto' },
        { time: 0.92, text: 'ELBO: lo que optimizamos en VAEs' },
      ],
      topic: 'Derivacion del ELBO desde Jensen. log p(x) >= E_q[log p(x,z) - log q(z)]. El ELBO es una cota inferior tratable de la log-verosimilitud marginal.',
      title: 'De Jensen al ELBO',
      step1Label: 'Definicion',
      step2Label: 'Insertar q',
      step3Label: 'Jensen',
      step4Label: 'ELBO',
    },
    scene7: {
      id: 'Puente a inferencia variacional',
      narration: 'Log p de x es el techo. El ELBO esta abajo. La brecha entre ambos es exactamente la KL de q contra la posterior real. Cuanto mejor sea q, mas se cierra la brecha. Si q fuera la posterior exacta, la brecha seria cero. Proximo tema: variables latentes y el VAE.',
      subtitleCues: [
        { time: 0.0, text: 'log p(x) es el techo (fijo para x dado)' },
        { time: 0.12, text: 'ELBO es la cota inferior que optimizamos' },
        { time: 0.25, text: 'Brecha = KL(q(z|x) || p(z|x))' },
        { time: 0.4, text: 'KL ≥ 0 siempre — por eso ELBO ≤ log p(x)' },
        { time: 0.55, text: 'Mejor q → brecha mas pequena' },
        { time: 0.68, text: 'Si q = p(z|x) exacta → brecha = 0' },
        { time: 0.8, text: 'En practica: q es una red neuronal parametrizada' },
        { time: 0.92, text: 'Proximo: variables latentes y el VAE' },
      ],
      topic: 'Relacion entre ELBO y log p(x). log p(x) = ELBO + KL(q(z|x) || p(z|x)). Optimizar q minimiza la KL y aprieta el ELBO hacia log p(x).',
      title: 'Puente a inferencia variacional',
      ceilingLabel: 'log p(x)',
      elboLabel: 'ELBO',
      gapLabel: 'KL(q || p(z|x))',
      betterQ: 'Mejor q cierra la brecha',
      nextTopic: 'Proximo: Variables Latentes',
    },
  },
  en: {
    lessonTitle: 'Monte Carlo Estimation',
    lessonSubtitle: 'From random samples to the ELBO',
    scene1: {
      id: 'Estimating expectations by sampling',
      narration: 'The key Monte Carlo idea: you do not need to compute integrals. Imagine throwing random darts at a lake to estimate its area. Draw samples from p, evaluate f on each, and average. With few samples the estimate wobbles, but as N grows it converges to the true value.',
      subtitleCues: [
        { time: 0.0, text: 'Monte Carlo: estimate integrals with samples' },
        { time: 0.12, text: 'Like throwing random darts at a lake' },
        { time: 0.25, text: 'Fraction inside the lake = estimated area' },
        { time: 0.38, text: 'E[f(x)] ≈ (1/N) Σ f(xᵢ), xᵢ ~ p' },
        { time: 0.52, text: 'N=10: noisy estimate, oscillates a lot' },
        { time: 0.65, text: 'N=100: approaches the true value' },
        { time: 0.78, text: 'N=1000: converges by law of large numbers' },
        { time: 0.92, text: 'More samples = better estimate, always' },
      ],
      topic: 'Monte Carlo estimation of expectations. E_p[f(x)] is approximated by (1/N) sum f(xi) where xi~p. Convergence by the law of large numbers.',
      title: 'Estimating expectations by sampling',
      pLabel: 'p(x)',
      fLabel: 'f(x)',
      runningAvg: 'Running average',
      trueValue: 'True E[f(x)]',
      nLabel: 'N = $1',
    },
    scene2: {
      id: 'Variance: the enemy',
      narration: 'Variance controls estimate quality. A smooth function converges fast. A wildly spiking function needs many more samples. The wonderful thing: the convergence rate is O of 1 over N, and it does not depend on dimensionality. It works the same in 2D as in a million dimensions.',
      subtitleCues: [
        { time: 0.0, text: 'Variance = estimate quality' },
        { time: 0.12, text: 'Smooth function: fast convergence' },
        { time: 0.25, text: 'Wild function: slow convergence' },
        { time: 0.38, text: 'Var decreases as 1/N — fundamental law' },
        { time: 0.52, text: 'Example: E[x²], N=10→0.68, N=100→0.95' },
        { time: 0.65, text: 'N=1000→1.01, N=10000→0.998 (true value: 1.0)' },
        { time: 0.78, text: 'Rate O(1/N) does NOT depend on dimensionality' },
        { time: 0.92, text: 'Key advantage over numerical integration' },
      ],
      topic: 'Variance of Monte Carlo estimator. Var[(1/N)sum f(xi)] = Var[f(x)]/N. High-variance functions require more samples.',
      title: 'Variance: the enemy',
      gentle: 'Smooth function',
      wild: 'Spiky function',
      errorBand: 'Error band',
      varFormula: 'Var proportional to 1/N',
    },
    scene3: {
      id: 'Importance sampling',
      narration: 'When you cannot sample from p, use a proposal q and weight each sample by p over q. If q covers well where p has mass, weights are stable. If q is very different, some weights explode and the estimate is useless. It is like searching for a needle in a haystack: if you search in the wrong place, you never find it.',
      subtitleCues: [
        { time: 0.0, text: 'Cannot sample from p? Use proposal q' },
        { time: 0.12, text: 'E_p[f(x)] = E_q[f(x)·p(x)/q(x)]' },
        { time: 0.25, text: 'Importance weight: w = p(x)/q(x)' },
        { time: 0.38, text: 'Good q (similar to p): stable weights' },
        { time: 0.52, text: 'Bad q (very different): extreme weights' },
        { time: 0.65, text: 'Like searching for a needle in a haystack' },
        { time: 0.78, text: 'Search in the wrong place: everything fails' },
        { time: 0.92, text: 'Optimal q is proportional to |f(x)|·p(x)' },
      ],
      topic: 'Importance sampling. E_p[f(x)] = E_q[f(x) p(x)/q(x)]. The proposal q must cover the support of p. Importance weights w_i = p(xi)/q(xi).',
      title: 'Importance sampling',
      targetLabel: 'p(x) target',
      proposalLabel: 'q(x) proposal',
      weightLabel: 'w = p/q',
    },
    scene4: {
      id: 'The marginal likelihood challenge',
      narration: 'In latent variable models, p of x requires integrating over all possible z. The latent space is vast and only a thin strip contributes. Random samples land in a desert of useless z, like throwing darts into the ocean hoping to hit a tiny island.',
      subtitleCues: [
        { time: 0.0, text: 'p(x) = ∫ p(x,z) dz — intractable integral' },
        { time: 0.12, text: 'The latent space z is enormous' },
        { time: 0.25, text: 'Only a thin strip of z contributes' },
        { time: 0.4, text: 'Random samples land in the desert' },
        { time: 0.55, text: 'Like throwing darts into the ocean seeking an island' },
        { time: 0.68, text: 'Direct Monte Carlo: very noisy estimate' },
        { time: 0.8, text: 'We need a smart proposal q' },
        { time: 0.92, text: 'Idea: q(z|x) that targets the useful strip' },
      ],
      topic: 'Marginal likelihood in VAEs. p(x) = integral p(x|z)p(z)dz. Most z do not contribute. Direct sampling is inefficient.',
      title: 'The marginal likelihood',
      jointLabel: 'p(x, z)',
      sliceLabel: 'Only this strip matters',
      desertLabel: 'Desert of useless z',
      xFixed: 'x fixed',
    },
    scene5: {
      id: 'Jensen inequality',
      narration: 'For concave functions like log, Jensen tells us the log of the average is always greater or equal to the average of the logs. It is like saying the class average never scores worse than the worst case. This non-negative gap is the key to deriving the ELBO.',
      subtitleCues: [
        { time: 0.0, text: 'Jensen: for concave f' },
        { time: 0.12, text: 'f(E[X]) ≥ E[f(X)]' },
        { time: 0.25, text: 'With f = log: log(E[X]) ≥ E[log(X)]' },
        { time: 0.4, text: 'The gap is always ≥ 0' },
        { time: 0.55, text: 'Equality only when X is constant' },
        { time: 0.68, text: 'Visualize: the log curve always sits below the line' },
        { time: 0.8, text: 'This inequality gives us a lower bound' },
        { time: 0.92, text: 'Key to deriving the ELBO in VAEs' },
      ],
      topic: 'Jensen inequality. For concave f: f(E[X]) >= E[f(X)]. With f=log: log(E[X]) >= E[log(X)]. Fundamental for the ELBO derivation.',
      title: 'Jensen inequality',
      logCurve: 'log(x)',
      avgOfLogs: 'E[log(X)]',
      logOfAvg: 'log(E[X])',
      gapLabel: 'Gap >= 0',
    },
    scene6: {
      id: 'From Jensen to ELBO',
      narration: 'Start from log p of x. Insert q to create an expectation under q. Apply Jensen to get the lower bound: the ELBO. Each step is a simple identity or inequality. In practice, the VAE uses k equals 1 sample from q and still works thanks to stochastic gradients.',
      subtitleCues: [
        { time: 0.0, text: 'log p(x) = log ∫ p(x,z) dz' },
        { time: 0.12, text: 'Multiply and divide by q(z): log ∫ [p(x,z)/q(z)]·q(z) dz' },
        { time: 0.25, text: '= log E_q[p(x,z)/q(z)]' },
        { time: 0.4, text: 'Jensen: ≥ E_q[log p(x,z)/q(z)]' },
        { time: 0.55, text: 'ELBO = E_q[log p(x,z) - log q(z)]' },
        { time: 0.68, text: 'In practice: k=1 sample from q already works' },
        { time: 0.8, text: 'Stochastic gradient does the rest' },
        { time: 0.92, text: 'ELBO: what we optimize in VAEs' },
      ],
      topic: 'ELBO derivation from Jensen. log p(x) >= E_q[log p(x,z) - log q(z)]. The ELBO is a tractable lower bound on marginal log-likelihood.',
      title: 'From Jensen to ELBO',
      step1Label: 'Definition',
      step2Label: 'Insert q',
      step3Label: 'Jensen',
      step4Label: 'ELBO',
    },
    scene7: {
      id: 'Bridge to variational inference',
      narration: 'Log p of x is the ceiling. The ELBO sits below. The gap is exactly the KL from q to the true posterior. The better q is, the more the gap closes. If q were the exact posterior, the gap would be zero. Next topic: latent variables and the VAE.',
      subtitleCues: [
        { time: 0.0, text: 'log p(x) is the ceiling (fixed for given x)' },
        { time: 0.12, text: 'ELBO is the lower bound we optimize' },
        { time: 0.25, text: 'Gap = KL(q(z|x) || p(z|x))' },
        { time: 0.4, text: 'KL ≥ 0 always — that is why ELBO ≤ log p(x)' },
        { time: 0.55, text: 'Better q → smaller gap' },
        { time: 0.68, text: 'If q = p(z|x) exactly → gap = 0' },
        { time: 0.8, text: 'In practice: q is a parameterized neural network' },
        { time: 0.92, text: 'Next: latent variables and the VAE' },
      ],
      topic: 'Relationship between ELBO and log p(x). log p(x) = ELBO + KL(q(z|x) || p(z|x)). Optimizing q minimizes KL and tightens ELBO toward log p(x).',
      title: 'Bridge to variational inference',
      ceilingLabel: 'log p(x)',
      elboLabel: 'ELBO',
      gapLabel: 'KL(q || p(z|x))',
      betterQ: 'Better q closes the gap',
      nextTopic: 'Next: Latent Variables',
    },
  },
};

// ── Questions (bilingual) ──

export const questions: Record<Lang, {
  afterImportance: import('../../engine/types').QuestionData;
  afterBridge: import('../../engine/types').QuestionData;
}> = {
  es: {
    afterImportance: {
      question: '¿Por que la tasa de convergencia de Monte Carlo O(1/N) es tan especial?',
      choices: [
        'Porque es la mas rapida posible',
        'Porque no depende de la dimensionalidad del problema',
        'Porque solo funciona en 1D',
        'Porque no requiere muestras aleatorias',
      ],
      correctIndex: 1,
      hint: 'Piensa en que pasa cuando el espacio tiene 10, 100, o un millon de dimensiones.',
      explanation: 'La tasa O(1/N) de Monte Carlo no depende de la dimension d. La integracion numerica clasica tiene tasas como O(N^{-2/d}) que se degradan exponencialmente con la dimension. Por eso Monte Carlo es el metodo preferido en espacios de alta dimension como los de modelos generativos.',
    },
    afterBridge: {
      question: 'En la relacion log p(x) = ELBO + KL(q||p(z|x)), ¿que pasa cuando q(z|x) = p(z|x)?',
      choices: [
        'El ELBO se vuelve negativo',
        'La KL se vuelve infinita',
        'La KL es cero y ELBO = log p(x) exactamente',
        'No se puede calcular',
      ],
      correctIndex: 2,
      explanation: 'Cuando q es igual a la posterior verdadera p(z|x), la KL divergence entre ellas es exactamente cero. Entonces log p(x) = ELBO + 0, es decir, el ELBO iguala exactamente la log-verosimilitud. En practica, q nunca es perfecta, asi que siempre hay una brecha.',
    },
  },
  en: {
    afterImportance: {
      question: 'Why is the Monte Carlo convergence rate O(1/N) so special?',
      choices: [
        'Because it is the fastest possible rate',
        'Because it does not depend on the dimensionality of the problem',
        'Because it only works in 1D',
        'Because it does not require random samples',
      ],
      correctIndex: 1,
      hint: 'Think about what happens when the space has 10, 100, or a million dimensions.',
      explanation: 'The O(1/N) rate of Monte Carlo does not depend on dimension d. Classical numerical integration has rates like O(N^{-2/d}) that degrade exponentially with dimension. That is why Monte Carlo is the method of choice in high-dimensional spaces like those of generative models.',
    },
    afterBridge: {
      question: 'In the relation log p(x) = ELBO + KL(q||p(z|x)), what happens when q(z|x) = p(z|x)?',
      choices: [
        'The ELBO becomes negative',
        'The KL becomes infinite',
        'The KL is zero and ELBO = log p(x) exactly',
        'It cannot be computed',
      ],
      correctIndex: 2,
      explanation: 'When q equals the true posterior p(z|x), the KL divergence between them is exactly zero. Then log p(x) = ELBO + 0, meaning the ELBO exactly equals the log-likelihood. In practice, q is never perfect, so there is always a gap.',
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
