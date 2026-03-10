// Bilingual text for Gaussian Mixture VAE lesson

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
    lessonTitle: 'Gaussian Mixture VAE',
    lessonSubtitle: 'El prior gaussiano es demasiado simple -- los datos reales tienen clusters',
    scene1: {
      id: 'El problema del prior',
      narration: 'El VAE estandar usa un prior gaussiano simple, una sola campana centrada en cero. Pero los datos reales tienen clusters naturales: digitos, caras, categorias. Un prior unimodal fuerza a todas las clases a solaparse en un solo blob, perdiendo la estructura.',
      subtitleCues: [
        { time: 0.0, text: 'VAE estandar: p(z) = N(0, I)' },
        { time: 0.15, text: 'Una sola campana gaussiana' },
        { time: 0.3, text: 'Datos reales tienen clusters naturales' },
        { time: 0.45, text: 'Digitos, caras, categorias...' },
        { time: 0.6, text: 'Prior unimodal fuerza solapamiento' },
        { time: 0.75, text: 'Todas las clases en un solo blob' },
        { time: 0.85, text: 'Se pierde la estructura multimodal' },
      ],
      topic: 'Prior gaussiano estandar N(0,I) es unimodal. Datos reales tienen clusters. Un blob pierde estructura.',
      title: 'El problema del prior',
      stdLabel: 'p(z) = N(0, I)',
      blobLabel: 'Un solo blob',
      classLabels: 'Clases mezcladas',
      insight: 'Un prior unimodal no captura la estructura multimodal de los datos',
    },
    scene2: {
      id: 'Mezcla de gaussianas',
      narration: 'La solucion: una mezcla de gaussianas como prior. Un VAE generaliza una mezcla finita: z es continua y cada z produce una gaussiana diferente via redes neuronales. Es una mezcla de infinitas gaussianas. Pero con K componentes explicitas, cada cluster captura un grupo natural.',
      subtitleCues: [
        { time: 0.0, text: 'Solucion: mezcla de gaussianas' },
        { time: 0.15, text: 'p(z) = suma pi_k N(mu_k, Sigma_k)' },
        { time: 0.3, text: 'K componentes, K clusters' },
        { time: 0.45, text: 'GMM finito: z categorica con K valores' },
        { time: 0.6, text: 'VAE: z continua = mezcla infinita' },
        { time: 0.75, text: 'GMVAE: prior explicito con K gaussianas' },
        { time: 0.85, text: 'Cada componente captura un grupo natural' },
      ],
      topic: 'Prior como mezcla de gaussianas. GMM finito vs VAE (mezcla infinita) vs GMVAE (K componentes explicitas).',
      title: 'Mezcla de gaussianas como prior',
      singleLabel: 'Gaussiana unica',
      mixtureLabel: 'Mezcla de K=5',
      componentLabel: 'Componente $1',
      insight: 'K componentes = K clusters en el espacio latente',
    },
    scene3: {
      id: 'El problema del KL',
      narration: 'Pero hay un problema computacional. La KL entre una gaussiana y una mezcla de gaussianas no tiene forma cerrada. Entre dos gaussianas es analitica, pero el logaritmo de una suma de exponenciales impide simplificar cuando el prior es una mezcla.',
      subtitleCues: [
        { time: 0.0, text: 'KL(q || mezcla) no tiene forma cerrada' },
        { time: 0.15, text: 'KL(N || N) = analitico: formula conocida' },
        { time: 0.3, text: 'KL(N || mezcla) = intractable' },
        { time: 0.45, text: 'El culpable: log(suma exp(...))' },
        { time: 0.6, text: 'El log de una suma no se simplifica' },
        { time: 0.75, text: 'No hay formula cerrada posible' },
        { time: 0.85, text: 'Necesitamos estimacion numerica' },
      ],
      topic: 'KL(q(z|x) || mezcla) no tiene forma cerrada. El log-sum bloquea la simplificacion.',
      title: 'El problema del KL',
      analyticLabel: 'KL(N || N) = analitico',
      intractableLabel: 'KL(N || mezcla) = ???',
      culpritLabel: 'log(suma exp) impide simplificar',
      insight: 'No podemos calcular KL(q || mezcla) en forma cerrada',
    },
    scene4: {
      id: 'KL por Monte Carlo',
      narration: 'La solucion es estimar la KL por Monte Carlo. Muestreamos L puntos de q, evaluamos log q menos log p en cada uno, y promediamos. Con suficientes muestras el estimador converge. En la practica, L igual a uno funciona sorprendentemente bien.',
      subtitleCues: [
        { time: 0.0, text: 'Estimar KL por muestreo' },
        { time: 0.15, text: 'KL aprox (1/L) suma [log q(z_l) - log p(z_l)]' },
        { time: 0.3, text: 'Muestras de q: z enfocado en zonas relevantes' },
        { time: 0.45, text: 'Evaluar log q - log p en cada muestra' },
        { time: 0.6, text: 'Promediar: estimador insesgado' },
        { time: 0.75, text: 'En la practica k=1 funciona bien' },
        { time: 0.85, text: 'El estimador se estabiliza con mas muestras' },
      ],
      topic: 'Monte Carlo KL: muestrear de q, evaluar log q - log p, promediar. En la practica k=1 funciona sorprendentemente bien.',
      title: 'KL por Monte Carlo',
      formulaLabel: 'KL aprox (1/L) suma [log q(z) - log p(z)]',
      sampleLabel: 'Muestra $1',
      avgLabel: 'Promedio = $1',
      convergesLabel: 'Converge con mas muestras',
    },
    scene5: {
      id: 'Truco log-sum-exp',
      narration: 'Evaluar log p de z requiere calcular el logaritmo de una suma de exponenciales, lo cual causa overflow numerico. El truco: restar el maximo antes de exponenciar. Log de e quinientos mas e quinientos uno explota, pero restando el maximo funciona perfectamente.',
      subtitleCues: [
        { time: 0.0, text: 'log(suma exp(a_k)) causa overflow' },
        { time: 0.15, text: 'Ejemplo: log(e^500 + e^501) = infinito!' },
        { time: 0.3, text: 'Truco: restar max antes de exponenciar' },
        { time: 0.45, text: 'log(suma exp(a_k - m)) + m' },
        { time: 0.6, text: 'Ejemplo: log(e^0 + e^1) + 500 = estable' },
        { time: 0.75, text: 'Resultado identico, sin overflow' },
        { time: 0.85, text: 'Esencial para estabilidad numerica' },
      ],
      topic: 'Log-sum-exp trick: restar el maximo antes de exponenciar. Evita overflow numerico al evaluar log p(z) de la mezcla.',
      title: 'Truco log-sum-exp',
      naiveLabel: 'Naive: overflow!',
      trickLabel: 'Truco: restar max',
      exampleNaive: 'log(e^500 + e^501 + e^502)',
      exampleSafe: 'log(e^0 + e^-1 + e^-2) + 502',
      resultLabel: 'Resultado: $1',
      stableLabel: 'Numericamente estable',
    },
    scene6: {
      id: 'Arquitectura GMVAE',
      narration: 'La arquitectura del GMVAE mantiene el encoder y decoder del VAE estandar. La unica diferencia esta en el prior: K gaussianas coloreadas en vez de una sola. El termino KL se estima por Monte Carlo usando el truco log-sum-exp para estabilidad.',
      subtitleCues: [
        { time: 0.0, text: 'Mismo encoder q(z|x) y decoder p(x|z)' },
        { time: 0.15, text: 'Diferencia: prior = mezcla de K gaussianas' },
        { time: 0.3, text: 'Cada gaussiana tiene mu_k y Sigma_k' },
        { time: 0.45, text: 'KL ya no es analitico' },
        { time: 0.6, text: 'KL estimado por Monte Carlo' },
        { time: 0.75, text: 'Log-sum-exp para estabilidad numerica' },
        { time: 0.85, text: 'L = E_q[log p(x|z)] - KL_MC' },
      ],
      topic: 'Arquitectura GMVAE: encoder q(z|x), decoder p(x|z), prior mezcla de gaussianas. KL estimado por MC con log-sum-exp.',
      title: 'Arquitectura GMVAE',
      encoderLabel: 'Encoder q(z|x)',
      decoderLabel: 'Decoder p(x|z)',
      priorLabel: 'Prior: mezcla',
      lossLabel: 'L = E_q[log p(x|z)] - KL_MC',
      mcLabel: 'Monte Carlo KL',
    },
    scene7: {
      id: 'Resultados en el latente',
      narration: 'Veamos el resultado. El VAE estandar produce un solo blob donde todas las clases se mezclan. El GMVAE produce K clusters bien separados, cada uno correspondiendo a una clase natural de los datos. La estructura multimodal queda preservada.',
      subtitleCues: [
        { time: 0.0, text: 'VAE estandar: un blob mezclado' },
        { time: 0.15, text: 'Todas las clases solapadas' },
        { time: 0.3, text: 'GMVAE: K clusters separados' },
        { time: 0.45, text: 'Cada cluster = una clase natural' },
        { time: 0.6, text: 'Fronteras claras entre grupos' },
        { time: 0.75, text: 'Estructura multimodal preservada' },
        { time: 0.85, text: 'El prior adecuado importa mucho' },
      ],
      topic: 'Comparacion visual: VAE estandar (un blob) vs GMVAE (K clusters separados). Estructura multimodal preservada.',
      title: 'Espacio latente: VAE vs GMVAE',
      vaeTitle: 'VAE estandar',
      gmvaeTitle: 'GMVAE',
      blobLabel: 'Todo mezclado',
      clustersLabel: 'Clusters separados',
      insight: 'El prior multimodal preserva la estructura natural de los datos',
    },
  },
  en: {
    lessonTitle: 'Gaussian Mixture VAE',
    lessonSubtitle: 'The standard Gaussian prior is too simple -- real data has clusters',
    scene1: {
      id: 'The prior problem',
      narration: 'The standard VAE uses a simple Gaussian prior, a single bell curve centered at zero. But real data has natural clusters: digits, faces, categories. A unimodal prior forces all classes to overlap in a single blob, losing structure.',
      subtitleCues: [
        { time: 0.0, text: 'Standard VAE: p(z) = N(0, I)' },
        { time: 0.15, text: 'A single Gaussian bell curve' },
        { time: 0.3, text: 'Real data has natural clusters' },
        { time: 0.45, text: 'Digits, faces, categories...' },
        { time: 0.6, text: 'Unimodal prior forces overlap' },
        { time: 0.75, text: 'All classes in one blob' },
        { time: 0.85, text: 'Multimodal structure is lost' },
      ],
      topic: 'Standard Gaussian prior N(0,I) is unimodal. Real data has clusters. One blob loses structure.',
      title: 'The prior problem',
      stdLabel: 'p(z) = N(0, I)',
      blobLabel: 'Single blob',
      classLabels: 'Mixed classes',
      insight: 'A unimodal prior cannot capture multimodal data structure',
    },
    scene2: {
      id: 'Mixture of Gaussians',
      narration: 'The solution: a mixture of Gaussians as the prior. A VAE generalizes a finite mixture: z is continuous and each z produces a different Gaussian via neural nets. It is an infinite mixture. But with K explicit components, each cluster captures a natural group.',
      subtitleCues: [
        { time: 0.0, text: 'Solution: mixture of Gaussians' },
        { time: 0.15, text: 'p(z) = sum pi_k N(mu_k, Sigma_k)' },
        { time: 0.3, text: 'K components, K clusters' },
        { time: 0.45, text: 'Finite GMM: categorical z with K values' },
        { time: 0.6, text: 'VAE: continuous z = infinite mixture' },
        { time: 0.75, text: 'GMVAE: explicit prior with K Gaussians' },
        { time: 0.85, text: 'Each component captures a natural group' },
      ],
      topic: 'Prior as Gaussian mixture. Finite GMM vs VAE (infinite mixture) vs GMVAE (K explicit components).',
      title: 'Mixture of Gaussians as prior',
      singleLabel: 'Single Gaussian',
      mixtureLabel: 'Mixture K=5',
      componentLabel: 'Component $1',
      insight: 'K components = K clusters in latent space',
    },
    scene3: {
      id: 'The KL problem',
      narration: 'But there is a computational problem. The KL between a Gaussian and a mixture of Gaussians has no closed form. Between two Gaussians it is analytic, but the log of a sum of exponentials prevents simplification when the prior is a mixture.',
      subtitleCues: [
        { time: 0.0, text: 'KL(q || mixture) has no closed form' },
        { time: 0.15, text: 'KL(N || N) = analytic: known formula' },
        { time: 0.3, text: 'KL(N || mixture) = intractable' },
        { time: 0.45, text: 'The culprit: log(sum exp(...))' },
        { time: 0.6, text: 'Log of a sum cannot be simplified' },
        { time: 0.75, text: 'No closed-form formula possible' },
        { time: 0.85, text: 'We need numerical estimation' },
      ],
      topic: 'KL(q(z|x) || mixture) has no closed form. The log-sum blocks simplification.',
      title: 'The KL problem',
      analyticLabel: 'KL(N || N) = analytic',
      intractableLabel: 'KL(N || mixture) = ???',
      culpritLabel: 'log(sum exp) blocks simplification',
      insight: 'We cannot compute KL(q || mixture) in closed form',
    },
    scene4: {
      id: 'Monte Carlo KL',
      narration: 'The solution is to estimate KL via Monte Carlo. We sample L points from q, evaluate log q minus log p at each one, and average. With enough samples the estimator converges. In practice, k equals one works surprisingly well.',
      subtitleCues: [
        { time: 0.0, text: 'Estimate KL by sampling' },
        { time: 0.15, text: 'KL approx (1/L) sum [log q(z_l) - log p(z_l)]' },
        { time: 0.3, text: 'Samples from q: z focused on relevant zones' },
        { time: 0.45, text: 'Evaluate log q - log p at each sample' },
        { time: 0.6, text: 'Average: unbiased estimator' },
        { time: 0.75, text: 'In practice k=1 works surprisingly well' },
        { time: 0.85, text: 'Estimator stabilizes with more samples' },
      ],
      topic: 'Monte Carlo KL: sample from q, evaluate log q - log p, average. In practice k=1 works surprisingly well.',
      title: 'Monte Carlo KL',
      formulaLabel: 'KL approx (1/L) sum [log q(z) - log p(z)]',
      sampleLabel: 'Sample $1',
      avgLabel: 'Average = $1',
      convergesLabel: 'Converges with more samples',
    },
    scene5: {
      id: 'Log-sum-exp trick',
      narration: 'Evaluating log p of z requires computing the log of a sum of exponentials, which causes numerical overflow. The trick: subtract the maximum before exponentiating. Log of e to the five hundred plus e to the five hundred one overflows, but subtracting the max works perfectly.',
      subtitleCues: [
        { time: 0.0, text: 'log(sum exp(a_k)) causes overflow' },
        { time: 0.15, text: 'Example: log(e^500 + e^501) = infinity!' },
        { time: 0.3, text: 'Trick: subtract max before exponentiating' },
        { time: 0.45, text: 'log(sum exp(a_k - m)) + m' },
        { time: 0.6, text: 'Example: log(e^0 + e^1) + 500 = stable' },
        { time: 0.75, text: 'Identical result, no overflow' },
        { time: 0.85, text: 'Essential for numerical stability' },
      ],
      topic: 'Log-sum-exp trick: subtract the max before exponentiating. Avoids numerical overflow when evaluating mixture log p(z).',
      title: 'Log-sum-exp trick',
      naiveLabel: 'Naive: overflow!',
      trickLabel: 'Trick: subtract max',
      exampleNaive: 'log(e^500 + e^501 + e^502)',
      exampleSafe: 'log(e^0 + e^-1 + e^-2) + 502',
      resultLabel: 'Result: $1',
      stableLabel: 'Numerically stable',
    },
    scene6: {
      id: 'GMVAE Architecture',
      narration: 'The GMVAE architecture keeps the same encoder and decoder from the standard VAE. The only difference is in the prior: K colored Gaussians instead of just one. The KL term is estimated via Monte Carlo using the log-sum-exp trick for stability.',
      subtitleCues: [
        { time: 0.0, text: 'Same encoder q(z|x) and decoder p(x|z)' },
        { time: 0.15, text: 'Difference: prior = mixture of K Gaussians' },
        { time: 0.3, text: 'Each Gaussian has mu_k and Sigma_k' },
        { time: 0.45, text: 'KL is no longer analytic' },
        { time: 0.6, text: 'KL estimated via Monte Carlo' },
        { time: 0.75, text: 'Log-sum-exp for numerical stability' },
        { time: 0.85, text: 'L = E_q[log p(x|z)] - KL_MC' },
      ],
      topic: 'GMVAE architecture: encoder q(z|x), decoder p(x|z), Gaussian mixture prior. KL estimated via MC with log-sum-exp.',
      title: 'GMVAE Architecture',
      encoderLabel: 'Encoder q(z|x)',
      decoderLabel: 'Decoder p(x|z)',
      priorLabel: 'Prior: mixture',
      lossLabel: 'L = E_q[log p(x|z)] - KL_MC',
      mcLabel: 'Monte Carlo KL',
    },
    scene7: {
      id: 'Latent space results',
      narration: 'Let us see the result. The standard VAE produces a single blob where all classes mix. The GMVAE produces K well-separated clusters, each corresponding to a natural class in the data. The multimodal structure is preserved.',
      subtitleCues: [
        { time: 0.0, text: 'Standard VAE: one mixed blob' },
        { time: 0.15, text: 'All classes overlapping' },
        { time: 0.3, text: 'GMVAE: K separated clusters' },
        { time: 0.45, text: 'Each cluster = one natural class' },
        { time: 0.6, text: 'Clear boundaries between groups' },
        { time: 0.75, text: 'Multimodal structure preserved' },
        { time: 0.85, text: 'The right prior matters a lot' },
      ],
      topic: 'Visual comparison: standard VAE (one blob) vs GMVAE (K separated clusters). Multimodal structure preserved.',
      title: 'Latent space: VAE vs GMVAE',
      vaeTitle: 'Standard VAE',
      gmvaeTitle: 'GMVAE',
      blobLabel: 'All mixed',
      clustersLabel: 'Separated clusters',
      insight: 'A multimodal prior preserves the natural structure of the data',
    },
  },
};

export const questions: Record<Lang, {
  afterScene3: import('../../engine/types').QuestionData;
  afterScene5: import('../../engine/types').QuestionData;
}> = {
  es: {
    afterScene3: {
      question: 'Por que la KL entre q(z|x) gaussiana y un prior mezcla de gaussianas no tiene forma cerrada?',
      choices: [
        'Porque q es una red neuronal',
        'Porque el logaritmo de una suma de exponenciales no se simplifica',
        'Porque el prior tiene demasiados parametros',
        'Porque la KL no es diferenciable',
      ],
      correctIndex: 1,
      hint: 'Piensa en que pasa cuando evaluas log p(z) con p siendo una mezcla: log(suma de exponenciales)...',
      explanation: 'La KL requiere evaluar log p(z) donde p es una mezcla. Esto da log(suma pi_k * N(z; mu_k, Sigma_k)), que es un log de una suma de exponenciales y no se puede simplificar algebraicamente.',
    },
    afterScene5: {
      question: 'En el truco log-sum-exp, por que restamos el maximo antes de exponenciar?',
      choices: [
        'Para hacer los numeros mas pequenos y evitar overflow',
        'Para cambiar el resultado de la suma',
        'Para eliminar las componentes pequenas',
        'Para normalizar las probabilidades',
      ],
      correctIndex: 0,
      hint: 'Que pasa si intentas calcular e^500 en un computador? Y si calculas e^(500-500) = e^0?',
      explanation: 'Al restar el maximo m, todos los exponentes se vuelven <= 0, evitando overflow. El resultado es identico porque log(sum exp(a_k)) = m + log(sum exp(a_k - m)). Es algebra, no aproximacion.',
    },
  },
  en: {
    afterScene3: {
      question: 'Why does the KL between a Gaussian q(z|x) and a Gaussian mixture prior have no closed form?',
      choices: [
        'Because q is a neural network',
        'Because the log of a sum of exponentials cannot be simplified',
        'Because the prior has too many parameters',
        'Because KL is not differentiable',
      ],
      correctIndex: 1,
      hint: 'Think about what happens when you evaluate log p(z) with p being a mixture: log(sum of exponentials)...',
      explanation: 'The KL requires evaluating log p(z) where p is a mixture. This gives log(sum pi_k * N(z; mu_k, Sigma_k)), which is a log of a sum of exponentials that cannot be simplified algebraically.',
    },
    afterScene5: {
      question: 'In the log-sum-exp trick, why do we subtract the maximum before exponentiating?',
      choices: [
        'To make numbers smaller and avoid overflow',
        'To change the result of the sum',
        'To eliminate small components',
        'To normalize the probabilities',
      ],
      correctIndex: 0,
      hint: 'What happens if you try to compute e^500 on a computer? And if you compute e^(500-500) = e^0?',
      explanation: 'By subtracting the max m, all exponents become <= 0, avoiding overflow. The result is identical because log(sum exp(a_k)) = m + log(sum exp(a_k - m)). It is algebra, not approximation.',
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
