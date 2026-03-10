// Bilingual text for Conditional Independence

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
    lessonTitle: 'Independencia Condicional',
    lessonSubtitle: 'De tablas exponenciales a grafos eficientes',
    scene1: {
      id: 'La maldición de las distribuciones conjuntas',
      narration: 'Para n variables binarias, la distribución conjunta necesita 2 elevado a n menos uno parámetros. Con 10 variables son 1,023. Con 100, son 10 elevado a 30. Y para MNIST con 784 píxeles, serían 10 elevado a 236. Es como intentar escribir un libro con más páginas que átomos en el universo.',
      subtitleCues: [
        { time: 0.0, text: 'n variables binarias: 2^n - 1 parámetros' },
        { time: 0.12, text: 'n=2: 3 params, n=3: 7 params' },
        { time: 0.25, text: 'n=10: 1,023 — ya es una tabla grande' },
        { time: 0.38, text: 'n=100: 10^30 — más que granos de arena en la Tierra' },
        { time: 0.52, text: 'n=784 (MNIST): 10^236 — ¡absurdo!' },
        { time: 0.65, text: 'Más parámetros que átomos en el universo observable' },
        { time: 0.8, text: 'Crecimiento exponencial imposible de almacenar' },
        { time: 0.92, text: 'Necesitamos una idea mejor' },
      ],
      topic: 'Crecimiento exponencial de parámetros en distribuciones conjuntas. Para n variables binarias se necesitan 2^n-1 parámetros.',
      title: 'La maldición de las distribuciones conjuntas',
      nLabel: 'Variables (n)',
      paramsLabel: 'Parámetros',
      impossibleLabel: '¡Imposible de almacenar!',
    },
    scene2: {
      id: 'La regla de la cadena',
      narration: 'La regla de la cadena factoriza cualquier conjunta como producto de condicionales. Es exacta, no es una aproximación. Pero el último factor condiciona sobre todas las variables anteriores. El total de parámetros sigue siendo exponencial: no hemos ganado nada aún.',
      subtitleCues: [
        { time: 0.0, text: 'p(x₁,...,xₙ) = p(x₁)·p(x₂|x₁)·...' },
        { time: 0.12, text: 'Factorización exacta en condicionales' },
        { time: 0.25, text: '¡NO es una aproximación! Es un hecho matemático' },
        { time: 0.4, text: 'p(x₁): 1 param, p(x₂|x₁): 2 params' },
        { time: 0.55, text: 'p(xₙ|x₁,...,xₙ₋₁) necesita 2^(n-1) params' },
        { time: 0.7, text: 'Total: 1 + 2 + 4 + ... + 2^(n-1) = 2ⁿ - 1' },
        { time: 0.82, text: 'Total sigue siendo O(2ⁿ)' },
        { time: 0.92, text: 'Necesitamos supuestos de independencia' },
      ],
      topic: 'Regla de la cadena de probabilidad. Factorización exacta pero sin ahorro de parámetros.',
      title: 'La regla de la cadena',
      exactLabel: 'Exacta',
      butLabel: 'Pero...',
      totalLabel: 'Total: O(2ⁿ) parámetros',
      factor1: 'p(x₁)',
      factor2: 'p(x₂|x₁)',
      factor3: 'p(x₃|x₁,x₂)',
      factorN: 'p(xₙ|x₁,...,xₙ₋₁)',
    },
    scene3: {
      id: 'Redes bayesianas',
      narration: 'Una red bayesiana es un grafo dirigido acíclico donde cada nodo es una variable y las aristas indican dependencias directas. Si no hay arista, hay independencia condicional dados los padres. Es como un organigrama: cada empleado solo responde a su jefe directo, no a toda la empresa.',
      subtitleCues: [
        { time: 0.0, text: 'Red bayesiana: DAG con variables como nodos' },
        { time: 0.12, text: 'Aristas indican dependencias directas' },
        { time: 0.25, text: 'Sin arista = independencia condicional' },
        { time: 0.4, text: 'Como un organigrama: solo respondes a tu jefe' },
        { time: 0.55, text: 'No a toda la empresa' },
        { time: 0.7, text: 'Cada nodo: tabla pequeña (solo sus padres)' },
        { time: 0.82, text: 'Reducción dramática de parámetros' },
        { time: 0.92, text: 'La estructura codifica nuestro conocimiento' },
      ],
      topic: 'Redes bayesianas como DAGs. Nodos son variables, aristas son dependencias. Independencia condicional.',
      title: 'Redes bayesianas',
      nodeA: 'A',
      nodeB: 'B',
      nodeC: 'C',
      nodeD: 'D',
      dagLabel: 'Grafo Dirigido Acíclico (DAG)',
      indepLabel: 'A ⊥ D | B,C',
    },
    scene4: {
      id: 'Factorización desde el grafo',
      narration: 'El grafo nos da la factorización: p de x es el producto de p de cada variable dados solo sus padres directos. No necesita toda la historia, solo los padres. Es como Naive Bayes: si la clase es Y, los atributos X1 a Xn son independientes dado Y. De 15 parámetros a solo 7.',
      subtitleCues: [
        { time: 0.0, text: 'p(x) = ∏ p(xᵢ | Parents(xᵢ))' },
        { time: 0.12, text: 'Cada variable solo depende de sus padres' },
        { time: 0.25, text: 'No de toda la historia — solo de los padres' },
        { time: 0.4, text: 'Ejemplo: Naive Bayes' },
        { time: 0.52, text: 'Clase Y genera atributos X₁,...,Xₙ independientes' },
        { time: 0.65, text: 'De exponencial a lineal en n' },
        { time: 0.78, text: 'Ejemplo: 15 params → solo 7 params' },
        { time: 0.92, text: 'Estructura → modelo probabilístico eficiente' },
      ],
      topic: 'Factorización desde el DAG. p(x) = producto de condicionales locales. Cada nodo depende solo de sus padres.',
      title: 'Factorización desde el grafo',
      formulaLabel: 'p(x) = ∏ p(xᵢ | Pa(xᵢ))',
      localA: 'p(A)',
      localB: 'p(B|A)',
      localC: 'p(C|A)',
      localD: 'p(D|B,C)',
      onlyParents: 'Solo depende de padres',
    },
    scene5: {
      id: 'Ahorro de parámetros',
      narration: 'La tabla completa para 10 variables binarias necesita 1,023 parámetros. Pero una cadena con independencias necesita solo 19. Para 30 variables: mil millones contra 59. La independencia condicional es la varita mágica que convierte lo exponencial en lineal.',
      subtitleCues: [
        { time: 0.0, text: 'Tabla completa: 2ⁿ - 1 parámetros' },
        { time: 0.12, text: 'Cadena factorizada: 2n - 1 (¡lineal!)' },
        { time: 0.25, text: 'n=10: 1,023 vs 19 (54× ahorro)' },
        { time: 0.4, text: 'n=30: mil millones vs 59' },
        { time: 0.55, text: 'n=100: 10³⁰ vs 199 — ¡astronómico ahorro!' },
        { time: 0.68, text: 'De exponencial a lineal: la clave' },
        { time: 0.8, text: 'Independencia condicional = superpoder' },
        { time: 0.92, text: 'Base de todos los modelos generativos eficientes' },
      ],
      topic: 'Ahorro exponencial de parámetros. Tabla completa 2^n-1 vs cadena 2n-1. Independencia condicional como clave.',
      title: 'Ahorro de parámetros',
      fullLabel: 'Tabla completa',
      factoredLabel: 'Cadena factorizada',
      vsLabel: 'vs',
      linearLabel: '¡LINEAL!',
      savingsLabel: 'Ahorro exponencial',
    },
    scene6: {
      id: 'Estructuras comunes de grafos',
      narration: 'Tres patrones clave. Cadena: x causa y causa z; si sabes y, x y z son independientes. Causa común: y causa x y z; lo mismo. V-estructura o collider: x y z causan y. Aquí saber y los conecta, el famoso explaining away. Si sabes que llovió, saber del aspersor no cambia tu creencia sobre el pasto mojado.',
      subtitleCues: [
        { time: 0.0, text: 'Cadena: X → Y → Z' },
        { time: 0.12, text: 'Si sabes Y, X y Z son independientes: X ⊥ Z | Y' },
        { time: 0.25, text: 'Causa común: X ← Y → Z' },
        { time: 0.38, text: 'Misma independencia: X ⊥ Z | Y' },
        { time: 0.52, text: 'V-estructura (collider): X → Y ← Z' },
        { time: 0.65, text: 'X ⊥ Z marginalmente, ¡pero NO dado Y!' },
        { time: 0.78, text: 'Explaining away: observar Y conecta X y Z' },
        { time: 0.92, text: 'Lluvia y aspersor: saber uno explica el otro' },
      ],
      topic: 'Tres estructuras: cadena, causa común, V-estructura. Explaining away en V-estructuras.',
      title: 'Estructuras comunes de grafos',
      chainLabel: 'Cadena',
      chainIndep: 'X ⊥ Z | Y',
      commonLabel: 'Causa común',
      commonIndep: 'X ⊥ Z | Y',
      vstLabel: 'V-estructura',
      vstIndep: 'X ⊥ Z (marginalmente)',
      vstExplain: 'Explaining away',
    },
    scene7: {
      id: 'Por qué importa esto',
      narration: 'Los modelos autoregresivos son cadenas completamente conectadas: cada variable depende de todas las anteriores. Los VAEs tienen una variable latente z que genera x. Las distintas estructuras de grafo producen distintas familias de modelos generativos. Elegir la estructura correcta es elegir el modelo.',
      subtitleCues: [
        { time: 0.0, text: 'Modelos autoregresivos = cadena completa' },
        { time: 0.12, text: 'x₁ → x₂ → ... → xₙ (cada uno depende de todos los previos)' },
        { time: 0.25, text: 'VAEs = variable latente z → x' },
        { time: 0.4, text: 'z comprime la información esencial' },
        { time: 0.55, text: 'Naive Bayes: independencia total dado la clase' },
        { time: 0.68, text: 'Distintos grafos → distintos modelos' },
        { time: 0.8, text: 'La estructura determina el modelo' },
        { time: 0.92, text: 'Próximo: modelos autoregresivos en detalle' },
      ],
      topic: 'Conexión con modelos generativos. AR como cadenas, VAEs como latente→observado. Grafos definen familias.',
      title: '¿Por qué importa esto?',
      arLabel: 'Autoregresivo',
      arDesc: 'x₁ → x₂ → ... → xₙ',
      vaeLabel: 'VAE',
      vaeDesc: 'z → x',
      nextLabel: 'Próximas lecciones',
      structureLabel: 'Estructura → Modelo',
    },
  },
  en: {
    lessonTitle: 'Conditional Independence',
    lessonSubtitle: 'From exponential tables to efficient graphs',
    scene1: {
      id: 'The curse of joint distributions',
      narration: 'For n binary variables, the joint distribution needs 2 to the n minus one parameters. With 10 variables that is 1,023. With 100, it is 10 to the 30. And for MNIST with 784 pixels, it would be 10 to the 236. It is like trying to write a book with more pages than atoms in the universe.',
      subtitleCues: [
        { time: 0.0, text: 'n binary variables: 2^n - 1 parameters' },
        { time: 0.12, text: 'n=2: 3 params, n=3: 7 params' },
        { time: 0.25, text: 'n=10: 1,023 — already a large table' },
        { time: 0.38, text: 'n=100: 10^30 — more than grains of sand on Earth' },
        { time: 0.52, text: 'n=784 (MNIST): 10^236 — absurd!' },
        { time: 0.65, text: 'More parameters than atoms in the observable universe' },
        { time: 0.8, text: 'Exponential growth: impossible to store' },
        { time: 0.92, text: 'We need a better idea' },
      ],
      topic: 'Exponential parameter growth in joint distributions. For n binary variables we need 2^n-1 parameters.',
      title: 'The curse of joint distributions',
      nLabel: 'Variables (n)',
      paramsLabel: 'Parameters',
      impossibleLabel: 'Impossible to store!',
    },
    scene2: {
      id: 'The chain rule',
      narration: 'The chain rule factorizes any joint as a product of conditionals. It is exact, not an approximation. But the last factor conditions on all previous variables. The total parameters remain exponential: we have gained nothing yet.',
      subtitleCues: [
        { time: 0.0, text: 'p(x₁,...,xₙ) = p(x₁)·p(x₂|x₁)·...' },
        { time: 0.12, text: 'Exact factorization into conditionals' },
        { time: 0.25, text: 'NOT an approximation! A mathematical fact' },
        { time: 0.4, text: 'p(x₁): 1 param, p(x₂|x₁): 2 params' },
        { time: 0.55, text: 'p(xₙ|x₁,...,xₙ₋₁) needs 2^(n-1) params' },
        { time: 0.7, text: 'Total: 1 + 2 + 4 + ... + 2^(n-1) = 2ⁿ - 1' },
        { time: 0.82, text: 'Total is still O(2ⁿ)' },
        { time: 0.92, text: 'We need independence assumptions' },
      ],
      topic: 'Probability chain rule. Exact factorization but no parameter savings.',
      title: 'The chain rule',
      exactLabel: 'Exact',
      butLabel: 'But...',
      totalLabel: 'Total: O(2ⁿ) parameters',
      factor1: 'p(x₁)',
      factor2: 'p(x₂|x₁)',
      factor3: 'p(x₃|x₁,x₂)',
      factorN: 'p(xₙ|x₁,...,xₙ₋₁)',
    },
    scene3: {
      id: 'Bayesian networks',
      narration: 'A Bayesian network is a directed acyclic graph where each node is a variable and edges indicate direct dependencies. No edge means conditional independence given parents. Think of an org chart: each employee reports only to their direct boss, not the whole company.',
      subtitleCues: [
        { time: 0.0, text: 'Bayesian network: DAG with variables as nodes' },
        { time: 0.12, text: 'Edges indicate direct dependencies' },
        { time: 0.25, text: 'No edge = conditional independence' },
        { time: 0.4, text: 'Like an org chart: you report only to your boss' },
        { time: 0.55, text: 'Not to the whole company' },
        { time: 0.7, text: 'Each node: small table (only its parents)' },
        { time: 0.82, text: 'Dramatic parameter reduction' },
        { time: 0.92, text: 'The structure encodes our knowledge' },
      ],
      topic: 'Bayesian networks as DAGs. Nodes are variables, edges are dependencies. Conditional independence.',
      title: 'Bayesian networks',
      nodeA: 'A',
      nodeB: 'B',
      nodeC: 'C',
      nodeD: 'D',
      dagLabel: 'Directed Acyclic Graph (DAG)',
      indepLabel: 'A \u22A5 D | B,C',
    },
    scene4: {
      id: 'Factorization from the graph',
      narration: 'The graph gives us the factorization: p of x is the product of p of each variable given only its direct parents. No need for the full history, just the parents. Like Naive Bayes: if the class is Y, attributes X1 to Xn are independent given Y. From 15 parameters to just 7.',
      subtitleCues: [
        { time: 0.0, text: 'p(x) = \u220F p(x\u1D62 | Parents(x\u1D62))' },
        { time: 0.12, text: 'Each variable depends only on its parents' },
        { time: 0.25, text: 'No full history needed — just parents' },
        { time: 0.4, text: 'Example: Naive Bayes' },
        { time: 0.52, text: 'Class Y generates independent attributes X₁,...,Xₙ' },
        { time: 0.65, text: 'From exponential to linear in n' },
        { time: 0.78, text: 'Example: 15 params → just 7 params' },
        { time: 0.92, text: 'Structure \u2192 efficient probabilistic model' },
      ],
      topic: 'Factorization from the DAG. p(x) = product of local conditionals. Each node depends only on its parents.',
      title: 'Factorization from the graph',
      formulaLabel: 'p(x) = \u220F p(x\u1D62 | Pa(x\u1D62))',
      localA: 'p(A)',
      localB: 'p(B|A)',
      localC: 'p(C|A)',
      localD: 'p(D|B,C)',
      onlyParents: 'Depends only on parents',
    },
    scene5: {
      id: 'Parameter savings',
      narration: 'The full table for 10 binary variables needs 1,023 parameters. But a chain with independencies needs only 19. For 30 variables: a billion versus 59. Conditional independence is the magic wand that turns exponential into linear.',
      subtitleCues: [
        { time: 0.0, text: 'Full table: 2\u207F - 1 parameters' },
        { time: 0.12, text: 'Factored chain: 2n - 1 (linear!)' },
        { time: 0.25, text: 'n=10: 1,023 vs 19 (54× savings)' },
        { time: 0.4, text: 'n=30: a billion vs 59' },
        { time: 0.55, text: 'n=100: 10³⁰ vs 199 — astronomical savings!' },
        { time: 0.68, text: 'From exponential to linear: the key' },
        { time: 0.8, text: 'Conditional independence = superpower' },
        { time: 0.92, text: 'Foundation of all efficient generative models' },
      ],
      topic: 'Exponential parameter savings. Full table 2^n-1 vs chain 2n-1. Conditional independence as the key.',
      title: 'Parameter savings',
      fullLabel: 'Full table',
      factoredLabel: 'Factored chain',
      vsLabel: 'vs',
      linearLabel: 'LINEAR!',
      savingsLabel: 'Exponential savings',
    },
    scene6: {
      id: 'Common graph structures',
      narration: 'Three key patterns. Chain: x causes y causes z; if you know y, x and z are independent. Common cause: y causes x and z; same thing. V-structure or collider: x and z cause y. Here knowing y connects them, the famous explaining away. If you know it rained, knowing about the sprinkler does not change your belief about wet grass.',
      subtitleCues: [
        { time: 0.0, text: 'Chain: X \u2192 Y \u2192 Z' },
        { time: 0.12, text: 'If you know Y, X and Z are independent: X \u22A5 Z | Y' },
        { time: 0.25, text: 'Common cause: X \u2190 Y \u2192 Z' },
        { time: 0.38, text: 'Same independence: X \u22A5 Z | Y' },
        { time: 0.52, text: 'V-structure (collider): X \u2192 Y \u2190 Z' },
        { time: 0.65, text: 'X \u22A5 Z marginally, but NOT given Y!' },
        { time: 0.78, text: 'Explaining away: observing Y connects X and Z' },
        { time: 0.92, text: 'Rain and sprinkler: knowing one explains the other' },
      ],
      topic: 'Three structures: chain, common cause, V-structure. Explaining away in V-structures.',
      title: 'Common graph structures',
      chainLabel: 'Chain',
      chainIndep: 'X \u22A5 Z | Y',
      commonLabel: 'Common cause',
      commonIndep: 'X \u22A5 Z | Y',
      vstLabel: 'V-structure',
      vstIndep: 'X \u22A5 Z (marginally)',
      vstExplain: 'Explaining away',
    },
    scene7: {
      id: 'Why this matters',
      narration: 'Autoregressive models are fully connected chains: each variable depends on all previous ones. VAEs have a latent variable z that generates x. Different graph structures yield different families of generative models. Choosing the right structure is choosing the model.',
      subtitleCues: [
        { time: 0.0, text: 'Autoregressive models = full chain' },
        { time: 0.12, text: 'x\u2081 \u2192 x\u2082 \u2192 ... \u2192 x\u2099 (each depends on all previous)' },
        { time: 0.25, text: 'VAEs = latent variable z \u2192 x' },
        { time: 0.4, text: 'z compresses the essential information' },
        { time: 0.55, text: 'Naive Bayes: total independence given the class' },
        { time: 0.68, text: 'Different graphs \u2192 different models' },
        { time: 0.8, text: 'Structure determines the model' },
        { time: 0.92, text: 'Next: autoregressive models in detail' },
      ],
      topic: 'Connection to generative models. AR as chains, VAEs as latent\u2192observed. Graphs define families.',
      title: 'Why this matters',
      arLabel: 'Autoregressive',
      arDesc: 'x\u2081 \u2192 x\u2082 \u2192 ... \u2192 x\u2099',
      vaeLabel: 'VAE',
      vaeDesc: 'z \u2192 x',
      nextLabel: 'Coming up next',
      structureLabel: 'Structure \u2192 Model',
    },
  },
};

// ── Questions (bilingual) ──

export const questions: Record<Lang, {
  afterSavings: import('../../engine/types').QuestionData;
  afterStructures: import('../../engine/types').QuestionData;
}> = {
  es: {
    afterSavings: {
      question: 'En una red bayesiana, si un nodo X tiene 3 padres binarios, ¿cuántos parámetros necesita su tabla condicional p(X|Pa₁,Pa₂,Pa₃)?',
      choices: ['3 parámetros', '7 parámetros', '8 parámetros', '2³ = 8 filas, pero 8 parámetros libres'],
      correctIndex: 2,
      hint: 'Para cada combinación de valores de los padres, necesitas un parámetro (la probabilidad de X=1).',
      explanation: 'Con 3 padres binarios hay 2³ = 8 combinaciones posibles. Para cada una necesitas p(X=1|...), así que son 8 parámetros. Compara con la tabla completa que necesitaría 2ⁿ-1 para todas las variables juntas.',
    },
    afterStructures: {
      question: 'En la V-estructura X → Y ← Z (collider), ¿qué pasa con la independencia de X y Z cuando observas Y?',
      choices: [
        'X y Z se vuelven independientes',
        'X y Z se vuelven dependientes (explaining away)',
        'No cambia nada',
        'Y se vuelve independiente de ambos',
      ],
      correctIndex: 1,
      explanation: 'En una V-estructura, X y Z son marginalmente independientes. Pero al observar Y (el efecto común), se activa explaining away: saber que Y ocurrió y que X no lo causó hace más probable que Z sí lo haya causado. Se vuelven dependientes.',
    },
  },
  en: {
    afterSavings: {
      question: 'In a Bayesian network, if node X has 3 binary parents, how many parameters does its conditional table p(X|Pa₁,Pa₂,Pa₃) need?',
      choices: ['3 parameters', '7 parameters', '8 parameters', '2³ = 8 rows, but 8 free parameters'],
      correctIndex: 2,
      hint: 'For each combination of parent values, you need one parameter (the probability of X=1).',
      explanation: 'With 3 binary parents there are 2³ = 8 possible combinations. For each you need p(X=1|...), giving 8 parameters. Compare with the full table that would need 2ⁿ-1 for all variables together.',
    },
    afterStructures: {
      question: 'In the V-structure X → Y ← Z (collider), what happens to the independence of X and Z when you observe Y?',
      choices: [
        'X and Z become independent',
        'X and Z become dependent (explaining away)',
        'Nothing changes',
        'Y becomes independent of both',
      ],
      correctIndex: 1,
      explanation: 'In a V-structure, X and Z are marginally independent. But when you observe Y (the common effect), explaining away kicks in: knowing Y happened and X did not cause it makes it more likely that Z did. They become dependent.',
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
