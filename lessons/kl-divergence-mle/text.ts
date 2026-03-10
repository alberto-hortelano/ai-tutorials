// Bilingual text for KL Divergence & MLE lesson

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
    lessonTitle: 'KL Divergence y MLE',
    lessonSubtitle: 'De la sorpresa a la estimaci\u00f3n de m\u00e1xima verosimilitud',
    scene1: {
      id: 'Sorpresa de un evento',
      narration: 'Empecemos con una pregunta: \u00bfcu\u00e1nta informaci\u00f3n te da un evento? Una moneda justa da 1 bit exacto. Un dado justo da 2.58 bits por cara. Un evento casi seguro no sorprende: I tiende a cero. La clave es que el logaritmo es la \u00fanica funci\u00f3n que convierte multiplicaci\u00f3n en suma, por eso eventos independientes suman su informaci\u00f3n.',
      subtitleCues: [
        { time: 0.0, text: '\u00bfCu\u00e1nta informaci\u00f3n te da un evento?' },
        { time: 0.12, text: 'Evento seguro (p=1) \u2192 sorpresa cero' },
        { time: 0.25, text: 'Moneda justa (p=0.5) \u2192 I = 1 bit exacto' },
        { time: 0.4, text: 'Dado justo (p=1/6) \u2192 I \u2248 2.58 bits' },
        { time: 0.55, text: 'I(x) = \u2212log\u2082 p(x)' },
        { time: 0.7, text: '\u00bfPor qu\u00e9 logaritmo? Es la \u00fanica funci\u00f3n con f(ab) = f(a) + f(b)' },
        { time: 0.85, text: 'Eventos independientes: sus bits se suman' },
      ],
      topic: 'Self-information, I(x) = -log p(x). Intuici\u00f3n sobre la "sorpresa" de un evento. Conexi\u00f3n con compresi\u00f3n: bits necesarios.',
      title: 'Sorpresa de un evento',
      fairCoin: 'Moneda justa: I = 1 bit',
      rareEvent: 'Evento raro (p=0.05): I \u2248 $1 bits',
      almostCertain: 'Casi seguro: I \u2248 0',
      bitsTitle: 'Bits necesarios para codificar',
      bitsInsight: 'Informaci\u00f3n = longitud \u00f3ptima del c\u00f3digo',
    },
    scene2: {
      id: 'Entrop\u00eda',
      narration: 'La entrop\u00eda responde: en promedio, \u00bfcu\u00e1nta sorpresa esperas? Una moneda justa tiene H = 1 bit: m\u00e1xima incertidumbre binaria. Una moneda sesgada al 90% tiene solo H = 0.47 bits, mucho m\u00e1s predecible. Un dado justo tiene H = 2.58 bits. Shannon demostr\u00f3 que H es el m\u00ednimo de bits necesarios para comunicar muestras de P.',
      subtitleCues: [
        { time: 0.0, text: 'Entrop\u00eda: la sorpresa promedio' },
        { time: 0.12, text: 'H(P) = E_P[\u2212log p(x)]' },
        { time: 0.25, text: 'Moneda justa: H = 1 bit (m\u00e1xima incertidumbre binaria)' },
        { time: 0.4, text: 'Moneda sesgada (q=0.9): H = 0.47 bits' },
        { time: 0.55, text: 'Dado justo: H = log\u2082(6) \u2248 2.58 bits' },
        { time: 0.7, text: 'Resultado determinista: H = 0 bits' },
        { time: 0.82, text: 'Shannon: H = m\u00ednimo de bits para codificar muestras de P' },
      ],
      topic: 'Entrop\u00eda H(P) = E_P[-log p(x)]. Sorpresa promedio. Dados justos vs cargados. La entrop\u00eda mide incertidumbre.',
      title: 'Entrop\u00eda: sorpresa promedio',
      fairDie: 'Dado justo',
      loadedDie: 'Dado cargado',
      insight: 'Mayor incertidumbre = Mayor entrop\u00eda',
    },
    scene3: {
      id: 'Entrop\u00eda cruzada',
      narration: 'Imagina una moneda justa, pero tu modelo cree que es sesgada al 90%. La entrop\u00eda real es 1 bit, pero la entrop\u00eda cruzada sube a 1.74 bits. Esos 0.74 bits extra son el precio de usar el modelo equivocado. Tu modelo Q se sorprende much\u00edsimo cada vez que sale cruz, porque le asign\u00f3 solo 10% de probabilidad.',
      subtitleCues: [
        { time: 0.0, text: '\u00bfQu\u00e9 pasa si usas el modelo equivocado?' },
        { time: 0.12, text: 'H(P, Q) = E_P[\u2212log q(x)]' },
        { time: 0.25, text: 'Moneda justa (P) + modelo sesgado (Q): H(P,Q) = 1.74 bits' },
        { time: 0.4, text: 'Q se sorprende mucho con cruz (q=0.1 pero ocurre 50%)' },
        { time: 0.55, text: 'Cada t\u00e9rmino: p(x)\u00B7(-log q) \u2265 p(x)\u00B7(-log p)' },
        { time: 0.7, text: 'El \u00e1rea roja = bits extra por el mismatch' },
        { time: 0.85, text: 'Siempre: H(P, Q) \u2265 H(P) — igualdad solo si Q = P' },
      ],
      topic: 'Entrop\u00eda cruzada H(P,Q) = E_P[-log q(x)]. Prueba visual: mismatch siempre cuesta m\u00e1s. H(P,Q) >= H(P).',
      title: 'Entrop\u00eda cruzada',
      pLabel: 'P (real)',
      qLabel: 'Q (modelo)',
      proofTitle: 'Sorpresa por resultado: P vs Q',
      extraCost: 'costo extra (D_KL)',
      insight: 'H(P, Q) \u2265 H(P) \u2014 usar el modelo equivocado siempre cuesta m\u00e1s',
    },
    scene4: {
      id: 'KL Divergence',
      narration: 'La KL Divergence es exactamente esos bits extra: entrop\u00eda cruzada menos entrop\u00eda. En nuestro ejemplo de la moneda: 1.74 menos 1 da 0.74 bits de KL. Es como dise\u00f1ar un c\u00f3digo de compresi\u00f3n para una distribuci\u00f3n Q y usarlo para datos de P: los 0.74 bits por s\u00edmbolo que desperdicias son la KL. Siempre es no negativa, y es cero solo cuando P y Q son id\u00e9nticas.',
      subtitleCues: [
        { time: 0.0, text: 'D_KL(P || Q) = H(P,Q) \u2212 H(P)' },
        { time: 0.12, text: 'Ejemplo moneda: 1.74 \u2212 1.0 = 0.74 bits' },
        { time: 0.25, text: 'Son los bits que desperdicias por usar el c\u00f3digo equivocado' },
        { time: 0.4, text: 'Como c\u00f3digo Morse dise\u00f1ado para otro idioma' },
        { time: 0.55, text: 'D_KL \u2265 0 siempre (desigualdad de Gibbs)' },
        { time: 0.7, text: 'D_KL = 0 sii P = Q' },
        { time: 0.85, text: '\u00a1Cuidado! D_KL(P || Q) \u2260 D_KL(Q || P)' },
      ],
      topic: 'KL Divergence D_KL(P||Q) = H(P,Q) - H(P) = sum p(x) log(p(x)/q(x)). Analog\u00eda del dado cargado. No-negatividad.',
      title: 'KL Divergence: la brecha',
      gapLabel: 'brecha = D_KL',
      prop1: 'D_KL(P || Q) \u2265 0 siempre',
      prop2: 'D_KL = 0 sii P = Q',
      prop3: 'D_KL(P || Q) \u2260 D_KL(Q || P) \u2014 \u00a1asim\u00e9trica!',
    },
    scene5: {
      id: 'Asimetr\u00eda de KL',
      narration: 'La KL no es sim\u00e9trica, y esto tiene enormes consecuencias pr\u00e1cticas. La forward KL castiga donde P tiene masa pero Q no: obliga a Q a cubrir todos los modos aunque se estire demasiado. La reverse KL castiga donde Q tiene masa pero P no: Q puede colapsar a un solo modo pero ah\u00ed es precisa. Por eso MLE produce modelos que cubren todo, y GANs producen im\u00e1genes n\u00edtidas de un solo modo.',
      subtitleCues: [
        { time: 0.0, text: 'D_KL(P || Q) \u2260 D_KL(Q || P)' },
        { time: 0.1, text: 'P bimodal: dos picos separados' },
        { time: 0.22, text: 'Forward KL: castiga donde P > 0 pero Q \u2248 0' },
        { time: 0.35, text: 'Q se estira para cubrir ambos modos (mode-covering)' },
        { time: 0.5, text: 'Reverse KL: castiga donde Q > 0 pero P \u2248 0' },
        { time: 0.63, text: 'Q colapsa a un modo pero es precisa (mode-seeking)' },
        { time: 0.78, text: 'MLE \u2192 forward KL \u2192 cubre todo, im\u00e1genes borrosas' },
        { time: 0.9, text: 'GANs \u2192 reverse KL \u2192 un modo, im\u00e1genes n\u00edtidas' },
      ],
      topic: 'Asimetr\u00eda de KL con P bimodal. Forward KL = mode-covering (MLE). Reverse KL = mode-seeking (GANs). Animaci\u00f3n de Q morph.',
      title: 'Asimetr\u00eda de KL',
      fwdTitle: 'Forward KL: D_KL(P || Q)',
      fwdBehavior: 'mode-covering',
      revTitle: 'Reverse KL: D_KL(Q || P)',
      revBehavior: 'mode-seeking',
      missedMode: '\u00a1modo ignorado!',
      insight: 'MLE \u2192 forward KL \u2192 mode-covering | GANs \u2192 reverse KL \u2192 mode-seeking',
    },
    scene6: {
      id: 'MLE = minimizar KL',
      narration: 'Aqu\u00ed est\u00e1 la conexi\u00f3n clave. La KL se descompone en dos t\u00e9rminos: menos la entrop\u00eda de los datos, que es fija, y menos la log-verosimilitud esperada. Como la entrop\u00eda de los datos no depende de theta, minimizar KL es exactamente lo mismo que maximizar la log-verosimilitud. MLE no es solo un truco pr\u00e1ctico: es la proyecci\u00f3n \u00f3ptima de la realidad sobre tu familia de modelos.',
      subtitleCues: [
        { time: 0.0, text: 'D_KL(p_data || p_\u03b8) = H(p_data, p_\u03b8) \u2212 H(p_data)' },
        { time: 0.12, text: '= \u2212H(p_data) \u2212 E_{p_data}[log p_\u03b8(x)]' },
        { time: 0.25, text: '\u2212H(p_data) es fija: no depende de \u03b8' },
        { time: 0.4, text: 'min_\u03b8 D_KL = max_\u03b8 E_{p_data}[log p_\u03b8(x)]' },
        { time: 0.55, text: '\u00a1Eso es exactamente MLE!' },
        { time: 0.7, text: 'MLE = encontrar la distribuci\u00f3n m\u00e1s cercana a la realidad' },
        { time: 0.85, text: 'Base te\u00f3rica de todos los modelos generativos likelihood-based' },
      ],
      topic: 'Derivaci\u00f3n: D_KL(p_data||p_\u03b8) = -H(p_data) - E[log p_\u03b8]. Constante se elimina. min KL = max likelihood.',
      title: 'MLE = minimizar KL',
      derivStep1: 'Paso 1: Expandir D_KL',
      derivStep2: 'Paso 2: Separar t\u00e9rminos',
      derivStep3: 'Paso 3: Minimizar KL = Maximizar log-likelihood',
      constLabel: '(constante)',
      mleMaximizes: 'MLE maximiza:',
      equivTo: '\u2195 equivalente a',
      minimize: 'Minimizar:',
      whyLabel: '\u00bfPor qu\u00e9? Porque H(p_data) es constante',
      insight: 'Base te\u00f3rica de todos los modelos generativos basados en likelihood',
    },
    scene7: {
      id: 'Visi\u00f3n geom\u00e9trica',
      narration: 'Piensa en el espacio de todas las distribuciones como un mapa. p_data es un punto fijo en ese mapa. Tu familia de modelos es una curva o superficie. MLE busca el punto de esa curva m\u00e1s cercano a p_data, medido por KL. Si tu familia es demasiado restrictiva, como ajustar una l\u00ednea recta a datos curvos, el m\u00ednimo sigue siendo lejano. Si es demasiado expresiva, corres riesgo de sobreajustar.',
      subtitleCues: [
        { time: 0.0, text: 'Espacio de todas las distribuciones' },
        { time: 0.12, text: 'p_data es un punto fijo en este mapa' },
        { time: 0.25, text: 'La familia {p_\u03b8} es una curva/superficie' },
        { time: 0.4, text: 'Paisaje de D_KL: contornos de distancia' },
        { time: 0.55, text: 'El optimizador desciende hacia \u03b8*' },
        { time: 0.68, text: 'Familia restrictiva \u2192 m\u00ednimo lejano (alto sesgo)' },
        { time: 0.8, text: 'Familia muy expresiva \u2192 riesgo de sobreajuste' },
        { time: 0.92, text: 'MLE = proyecci\u00f3n \u00f3ptima de la realidad sobre tu modelo' },
      ],
      topic: 'Visi\u00f3n geom\u00e9trica del MLE. Espacio de distribuciones. Paisaje de distancia con contornos. Optimizador descendiendo.',
      title: 'Visi\u00f3n geom\u00e9trica',
      spaceLabel: 'Espacio de distribuciones',
      familyLabel: '{p_\u03b8 : \u03b8 \u2208 \u0398}',
      mleLabel: 'p_\u03b8* (MLE)',
      landscapeTitle: 'Paisaje de D_KL(\u03b8)',
      insight: 'MLE = la "proyecci\u00f3n" m\u00e1s cercana de p_data sobre la familia del modelo',
    },
  },
  en: {
    lessonTitle: 'KL Divergence and MLE',
    lessonSubtitle: 'From surprise to maximum likelihood estimation',
    scene1: {
      id: 'Event surprise',
      narration: 'Let\'s start with a question: how much information does an event give you? A fair coin gives exactly 1 bit. A fair die gives 2.58 bits per face. An almost certain event gives near-zero surprise. The key insight: the logarithm is the only function that converts multiplication into addition, which is why independent events sum their information.',
      subtitleCues: [
        { time: 0.0, text: 'How much information does an event give you?' },
        { time: 0.12, text: 'Certain event (p=1) \u2192 zero surprise' },
        { time: 0.25, text: 'Fair coin (p=0.5) \u2192 I = exactly 1 bit' },
        { time: 0.4, text: 'Fair die (p=1/6) \u2192 I \u2248 2.58 bits' },
        { time: 0.55, text: 'I(x) = \u2212log\u2082 p(x)' },
        { time: 0.7, text: 'Why logarithm? It\'s the only function where f(ab) = f(a) + f(b)' },
        { time: 0.85, text: 'Independent events: their bits add up' },
      ],
      topic: 'Self-information, I(x) = -log p(x). Intuition about the "surprise" of an event. Connection to compression: bits needed.',
      title: 'Event surprise',
      fairCoin: 'Fair coin: I = 1 bit',
      rareEvent: 'Rare event (p=0.05): I \u2248 $1 bits',
      almostCertain: 'Almost certain: I \u2248 0',
      bitsTitle: 'Bits needed to encode',
      bitsInsight: 'Information = optimal code length',
    },
    scene2: {
      id: 'Entropy',
      narration: 'Entropy answers: on average, how much surprise do you expect? A fair coin has H = 1 bit: maximum binary uncertainty. A 90%-biased coin has only H = 0.47 bits, much more predictable. A fair die has H = 2.58 bits. Shannon proved that H is the minimum number of bits needed to communicate samples from P.',
      subtitleCues: [
        { time: 0.0, text: 'Entropy: the average surprise' },
        { time: 0.12, text: 'H(P) = E_P[\u2212log p(x)]' },
        { time: 0.25, text: 'Fair coin: H = 1 bit (maximum binary uncertainty)' },
        { time: 0.4, text: 'Biased coin (q=0.9): H = 0.47 bits' },
        { time: 0.55, text: 'Fair die: H = log\u2082(6) \u2248 2.58 bits' },
        { time: 0.7, text: 'Deterministic outcome: H = 0 bits' },
        { time: 0.82, text: 'Shannon: H = minimum bits to encode samples from P' },
      ],
      topic: 'Entropy H(P) = E_P[-log p(x)]. Average surprise. Fair vs loaded dice. Entropy measures uncertainty.',
      title: 'Entropy: average surprise',
      fairDie: 'Fair die',
      loadedDie: 'Loaded die',
      insight: 'More uncertainty = Higher entropy',
    },
    scene3: {
      id: 'Cross-entropy',
      narration: 'Imagine a fair coin, but your model thinks it\'s 90%-biased. The true entropy is 1 bit, but cross-entropy jumps to 1.74 bits. Those 0.74 extra bits are the price of using the wrong model. Your model Q is shocked every time tails appears, because it only assigned 10% probability to it.',
      subtitleCues: [
        { time: 0.0, text: 'What if you use the wrong model?' },
        { time: 0.12, text: 'H(P, Q) = E_P[\u2212log q(x)]' },
        { time: 0.25, text: 'Fair coin (P) + biased model (Q): H(P,Q) = 1.74 bits' },
        { time: 0.4, text: 'Q is shocked by tails (q=0.1 but happens 50%)' },
        { time: 0.55, text: 'Each term: p(x)\u00B7(-log q) \u2265 p(x)\u00B7(-log p)' },
        { time: 0.7, text: 'Red area = extra bits from the mismatch' },
        { time: 0.85, text: 'Always: H(P, Q) \u2265 H(P) \u2014 equality only when Q = P' },
      ],
      topic: 'Cross-entropy H(P,Q) = E_P[-log q(x)]. Visual proof: mismatch always costs more. H(P,Q) >= H(P).',
      title: 'Cross-entropy',
      pLabel: 'P (true)',
      qLabel: 'Q (model)',
      proofTitle: 'Surprise per outcome: P vs Q',
      extraCost: 'extra cost (D_KL)',
      insight: 'H(P, Q) \u2265 H(P) \u2014 using the wrong model always costs more',
    },
    scene4: {
      id: 'KL Divergence',
      narration: 'KL Divergence is exactly those extra bits: cross-entropy minus entropy. In our coin example: 1.74 minus 1 gives 0.74 bits of KL. Think of it as designing a compression code for distribution Q but using it on data from P: the 0.74 bits per symbol you waste are the KL. It\'s always non-negative, and zero only when P and Q are identical.',
      subtitleCues: [
        { time: 0.0, text: 'D_KL(P || Q) = H(P,Q) \u2212 H(P)' },
        { time: 0.12, text: 'Coin example: 1.74 \u2212 1.0 = 0.74 bits' },
        { time: 0.25, text: 'The bits you waste using the wrong code' },
        { time: 0.4, text: 'Like Morse code designed for another language' },
        { time: 0.55, text: 'D_KL \u2265 0 always (Gibbs\' inequality)' },
        { time: 0.7, text: 'D_KL = 0 iff P = Q' },
        { time: 0.85, text: 'Warning! D_KL(P || Q) \u2260 D_KL(Q || P)' },
      ],
      topic: 'KL Divergence D_KL(P||Q) = H(P,Q) - H(P) = sum p(x) log(p(x)/q(x)). Biased die analogy. Non-negativity.',
      title: 'KL Divergence: the gap',
      gapLabel: 'gap = D_KL',
      prop1: 'D_KL(P || Q) \u2265 0 always',
      prop2: 'D_KL = 0 iff P = Q',
      prop3: 'D_KL(P || Q) \u2260 D_KL(Q || P) \u2014 asymmetric!',
    },
    scene5: {
      id: 'KL Asymmetry',
      narration: 'KL is not symmetric, and this has huge practical consequences. Forward KL penalizes where P has mass but Q doesn\'t: it forces Q to cover all modes even if it stretches too thin. Reverse KL penalizes where Q has mass but P doesn\'t: Q can collapse to one mode but be precise there. That\'s why MLE produces models that cover everything, and GANs produce sharp images from a single mode.',
      subtitleCues: [
        { time: 0.0, text: 'D_KL(P || Q) \u2260 D_KL(Q || P)' },
        { time: 0.1, text: 'Bimodal P: two separated peaks' },
        { time: 0.22, text: 'Forward KL: penalizes where P > 0 but Q \u2248 0' },
        { time: 0.35, text: 'Q stretches to cover both modes (mode-covering)' },
        { time: 0.5, text: 'Reverse KL: penalizes where Q > 0 but P \u2248 0' },
        { time: 0.63, text: 'Q collapses to one mode but is precise (mode-seeking)' },
        { time: 0.78, text: 'MLE \u2192 forward KL \u2192 covers everything, blurry images' },
        { time: 0.9, text: 'GANs \u2192 reverse KL \u2192 one mode, sharp images' },
      ],
      topic: 'KL Asymmetry with bimodal P. Forward KL = mode-covering (MLE). Reverse KL = mode-seeking (GANs). Q morphing animation.',
      title: 'KL Asymmetry',
      fwdTitle: 'Forward KL: D_KL(P || Q)',
      fwdBehavior: 'mode-covering',
      revTitle: 'Reverse KL: D_KL(Q || P)',
      revBehavior: 'mode-seeking',
      missedMode: 'missed mode!',
      insight: 'MLE \u2192 forward KL \u2192 mode-covering | GANs \u2192 reverse KL \u2192 mode-seeking',
    },
    scene6: {
      id: 'MLE = minimize KL',
      narration: 'Here\'s the key connection. KL decomposes into two terms: minus the data entropy, which is fixed, and minus the expected log-likelihood. Since the data entropy doesn\'t depend on theta, minimizing KL is exactly the same as maximizing the log-likelihood. MLE isn\'t just a practical trick: it\'s the optimal projection of reality onto your model family.',
      subtitleCues: [
        { time: 0.0, text: 'D_KL(p_data || p_\u03b8) = H(p_data, p_\u03b8) \u2212 H(p_data)' },
        { time: 0.12, text: '= \u2212H(p_data) \u2212 E_{p_data}[log p_\u03b8(x)]' },
        { time: 0.25, text: '\u2212H(p_data) is fixed: doesn\'t depend on \u03b8' },
        { time: 0.4, text: 'min_\u03b8 D_KL = max_\u03b8 E_{p_data}[log p_\u03b8(x)]' },
        { time: 0.55, text: 'That\'s exactly MLE!' },
        { time: 0.7, text: 'MLE = finding the closest distribution to reality' },
        { time: 0.85, text: 'Theoretical foundation of all likelihood-based generative models' },
      ],
      topic: 'Derivation: D_KL(p_data||p_\u03b8) = -H(p_data) - E[log p_\u03b8]. Constant drops out. min KL = max likelihood.',
      title: 'MLE = minimize KL',
      derivStep1: 'Step 1: Expand D_KL',
      derivStep2: 'Step 2: Separate terms',
      derivStep3: 'Step 3: Minimize KL = Maximize log-likelihood',
      constLabel: '(constant)',
      mleMaximizes: 'MLE maximizes:',
      equivTo: '\u2195 equivalent to',
      minimize: 'Minimize:',
      whyLabel: 'Why? Because H(p_data) is constant',
      insight: 'Theoretical foundation of all likelihood-based generative models',
    },
    scene7: {
      id: 'Geometric view',
      narration: 'Think of the space of all distributions as a map. p_data is a fixed point on that map. Your model family is a curve or surface. MLE seeks the point on that curve closest to p_data, measured by KL. If your family is too restrictive, like fitting a straight line to curved data, the minimum is still far. If too expressive, you risk overfitting.',
      subtitleCues: [
        { time: 0.0, text: 'Space of all distributions' },
        { time: 0.12, text: 'p_data is a fixed point on this map' },
        { time: 0.25, text: 'The family {p_\u03b8} is a curve/surface' },
        { time: 0.4, text: 'D_KL landscape: distance contours' },
        { time: 0.55, text: 'Optimizer descends toward \u03b8*' },
        { time: 0.68, text: 'Restrictive family \u2192 far minimum (high bias)' },
        { time: 0.8, text: 'Too expressive \u2192 overfitting risk' },
        { time: 0.92, text: 'MLE = optimal projection of reality onto your model' },
      ],
      topic: 'Geometric view of MLE. Distribution space. Distance landscape with contours. Optimizer descending.',
      title: 'Geometric view',
      spaceLabel: 'Space of distributions',
      familyLabel: '{p_\u03b8 : \u03b8 \u2208 \u0398}',
      mleLabel: 'p_\u03b8* (MLE)',
      landscapeTitle: 'D_KL(\u03b8) landscape',
      insight: 'MLE = the closest "projection" of p_data onto the model family',
    },
  },
};

// ── Questions (bilingual) ──

export const questions: Record<Lang, {
  afterCrossEntropy: import('../../engine/types').QuestionData;
  afterAsymmetry: import('../../engine/types').QuestionData;
  afterGeometric: import('../../engine/types').QuestionData;
}> = {
  es: {
    afterCrossEntropy: {
      question: 'Si lanzas un dado justo de 6 caras, \u00bfcu\u00e1l es la sorpresa (en bits) de sacar un 6?',
      choices: ['1 bit', '2.58 bits', '6 bits', '0.17 bits'],
      correctIndex: 1,
      hint: 'I(x) = \u2212log\u2082(p(x)), y p(6) = 1/6',
      explanation: 'I(6) = \u2212log\u2082(1/6) = log\u2082(6) \u2248 2.58 bits. Cada cara de un dado justo da la misma sorpresa.',
    },
    afterAsymmetry: {
      question: 'Si P es bimodal y Q es una gaussiana, la forward KL D_KL(P||Q) obliga a Q a...',
      choices: ['Cubrir ambos modos (mode-covering)', 'Colapsar a un solo modo (mode-seeking)'],
      correctIndex: 0,
      explanation: 'La forward KL penaliza donde P > 0 pero Q \u2248 0, forzando a Q a extenderse para cubrir ambos modos.',
    },
    afterGeometric: {
      question: 'Minimizar D_KL(p_data || p_\u03b8) es equivalente a maximizar...',
      choices: ['La entrop\u00eda H(p_data)', 'La log-verosimilitud E[log p_\u03b8(x)]', 'La entrop\u00eda cruzada H(p_data, p_\u03b8)', 'D_KL(p_\u03b8 || p_data)'],
      correctIndex: 1,
      explanation: 'Como H(p_data) es constante, min D_KL = max E_{p_data}[log p_\u03b8(x)], que es MLE.',
    },
  },
  en: {
    afterCrossEntropy: {
      question: 'If you roll a fair 6-sided die, what is the surprise (in bits) of rolling a 6?',
      choices: ['1 bit', '2.58 bits', '6 bits', '0.17 bits'],
      correctIndex: 1,
      hint: 'I(x) = \u2212log\u2082(p(x)), and p(6) = 1/6',
      explanation: 'I(6) = \u2212log\u2082(1/6) = log\u2082(6) \u2248 2.58 bits. Each face of a fair die gives the same surprise.',
    },
    afterAsymmetry: {
      question: 'If P is bimodal and Q is a Gaussian, forward KL D_KL(P||Q) forces Q to...',
      choices: ['Cover both modes (mode-covering)', 'Collapse to one mode (mode-seeking)'],
      correctIndex: 0,
      explanation: 'Forward KL penalizes where P > 0 but Q \u2248 0, forcing Q to spread out and cover both modes.',
    },
    afterGeometric: {
      question: 'Minimizing D_KL(p_data || p_\u03b8) is equivalent to maximizing...',
      choices: ['The entropy H(p_data)', 'The log-likelihood E[log p_\u03b8(x)]', 'The cross-entropy H(p_data, p_\u03b8)', 'D_KL(p_\u03b8 || p_data)'],
      correctIndex: 1,
      explanation: 'Since H(p_data) is constant, min D_KL = max E_{p_data}[log p_\u03b8(x)], which is MLE.',
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
