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
    lessonTitle: 'El ELBO',
    lessonSubtitle: 'Evidence Lower Bound: el corazon matematico de los VAEs',
    scene1: {
      id: 'El objetivo',
      narration: 'Queremos maximizar log p de x, la evidencia. Pero no podemos calcularlo directamente porque la integral sobre z es intractable. Necesitamos un objetivo computable que, al empujarlo hacia arriba, tambien suba log p de x. Ese objetivo es el ELBO.',
      subtitleCues: [
        { time: 0, text: 'Maximizar log p(x) es intractable' },
        { time: 0.15, text: 'La integral sobre z bloquea el calculo' },
        { time: 0.3, text: 'Necesitamos un sustituto computable' },
        { time: 0.45, text: 'Que al subirlo, suba log p(x)' },
        { time: 0.6, text: 'Una cota inferior que podemos optimizar' },
        { time: 0.75, text: 'Empujar el piso eleva el techo' },
        { time: 0.85, text: 'Ese objetivo es el ELBO' },
      ],
      topic: 'Motivacion del ELBO como objetivo tratable.',
      title: 'El objetivo',
      ceilingLabel: 'log p(x)',
      questionLabel: 'Nuestro objetivo = ?',
      intractable: 'Intractable: integral p(x,z) dz',
      needComputable: 'Necesitamos una cota inferior computable',
      reveal: 'ELBO',
    },
    scene2: {
      id: 'Introducir q(z|x)',
      narration: 'El truco: multiplicar y dividir por q dentro de la integral. Esto no cambia nada, es como multiplicar por uno. Log p de x se convierte en log de la esperanza bajo q del cociente p sobre q. Todavia es exacto, sin aproximacion.',
      subtitleCues: [
        { time: 0, text: 'Truco algebraico: insertar q(z|x)' },
        { time: 0.15, text: 'Multiplicar y dividir por q = multiplicar por 1' },
        { time: 0.3, text: 'log p(x) = log integral [p(x,z)/q] * q dz' },
        { time: 0.45, text: 'Reescribir como esperanza bajo q' },
        { time: 0.6, text: '= log E_q[p(x,z)/q(z|x)]' },
        { time: 0.75, text: 'q enfoca el muestreo en z relevantes' },
        { time: 0.85, text: 'Todavia exacto: sin aproximacion' },
      ],
      topic: 'Insertar q(z|x) en la integral. Reescribir como esperanza bajo q.',
      title: 'Introducir q(z|x)',
      exactLabel: 'Exacto: =',
      stepLabel: 'Insertar q/q',
      step1Label: 'Paso 1: Marginal',
      step2Label: 'Paso 2: Insertar q(z|x)',
      step3Label: 'Paso 3: Esperanza bajo q',
      exactBadge: 'Exacto',
    },
    scene3: {
      id: 'Aplicar Jensen',
      narration: 'Ahora aplicamos la desigualdad de Jensen: log de esperanza es mayor o igual que esperanza de log. Este unico paso introduce la aproximacion. El resultado es el ELBO: Evidence Lower BOund. Una sola desigualdad cambia todo.',
      subtitleCues: [
        { time: 0, text: 'Jensen: log E[*] >= E[log(*)]' },
        { time: 0.15, text: 'Para funciones concavas como log' },
        { time: 0.3, text: 'log p(x) >= E_q[log p(x,z) - log q(z|x)]' },
        { time: 0.45, text: 'Este >= es donde entra la aproximacion' },
        { time: 0.6, text: 'Resultado: ELBO = Evidence Lower BOund' },
        { time: 0.75, text: 'Una sola desigualdad cambia todo' },
        { time: 0.85, text: 'ELBO <= log p(x) siempre' },
      ],
      topic: 'Desigualdad de Jensen aplicada. Definicion del ELBO.',
      title: 'Aplicar Jensen',
      jensenLabel: '>= (Jensen)',
      elboLabel: 'ELBO',
      jensenRule: 'Desigualdad de Jensen',
      jensenDesc: 'Para f concava: f(E[X]) >= E[f(X)]',
      approxHere: 'La aproximacion entra aqui',
    },
    scene4: {
      id: 'Reconstruccion vs KL',
      narration: 'El ELBO se descompone en dos terminos: reconstruccion, que mide que tan bien el decoder reproduce x desde z, y menos KL, que regulariza q para que no se aleje del prior. Uno quiere fidelidad, el otro quiere normalidad.',
      subtitleCues: [
        { time: 0, text: 'ELBO = E_q[log p(x|z)] - D_KL(q||p(z))' },
        { time: 0.15, text: 'Termino 1: Reconstruccion' },
        { time: 0.3, text: 'Mide la calidad del decoder' },
        { time: 0.45, text: 'Termino 2: -KL (regularizacion)' },
        { time: 0.6, text: 'Penaliza q si se aleja del prior' },
        { time: 0.75, text: 'Fidelidad vs normalidad' },
        { time: 0.85, text: 'Reproducir x vs no alejarse del prior' },
      ],
      topic: 'Descomposicion del ELBO: reconstruccion + regularizacion KL.',
      title: 'Reconstruccion vs KL',
      reconLabel: 'Reconstruccion',
      reconDesc: 'E_q[log p(x|z)]',
      klLabel: 'Regularizacion',
      klDesc: '-D_KL(q(z|x) || p(z))',
      reconIcon: 'Reproducir x fielmente',
      klIcon: 'No alejarse del prior',
    },
    scene5: {
      id: 'Las dos fuerzas',
      narration: 'Si solo optimizaras reconstruccion, q memorizaria cada dato con distribuciones raras. Si solo optimizaras KL, q seria el prior pero no reconstruiria nada. El ELBO balancea estas dos fuerzas competidoras. El equilibrio perfecto es un buen VAE.',
      subtitleCues: [
        { time: 0, text: 'Dos fuerzas compiten dentro del ELBO' },
        { time: 0.15, text: 'Solo reconstruccion: q memoriza (overfitting)' },
        { time: 0.3, text: 'q se vuelve rara y especifica' },
        { time: 0.45, text: 'Solo KL: q = prior, pero no reconstruye nada' },
        { time: 0.6, text: 'El ELBO balancea ambas fuerzas' },
        { time: 0.75, text: 'Tension creativa: fidelidad vs simplicidad' },
        { time: 0.85, text: 'El balance perfecto = buen VAE' },
      ],
      topic: 'Tension reconstruccion vs regularizacion. Si solo recon, q memoriza. Si solo KL, q=prior pero no reconstruye. ELBO balancea ambos.',
      title: 'Las dos fuerzas',
      reconForce: 'Reconstruccion',
      klForce: 'KL',
      balanceLabel: 'ELBO',
      pullLeft: 'q especifica',
      pullRight: 'q amplia',
      balanceDesc: 'Balance perfecto = buen VAE',
    },
    scene6: {
      id: 'La brecha',
      narration: 'Log p de x es igual al ELBO mas la KL entre q y la verdadera posterior. Como KL es siempre no negativa, el ELBO nunca supera log p de x. Cuando q iguala la posterior, la brecha es cero y el ELBO toca el techo.',
      subtitleCues: [
        { time: 0, text: 'log p(x) = ELBO + D_KL(q || p(z|x))' },
        { time: 0.15, text: 'La brecha = KL(q || posterior verdadera)' },
        { time: 0.3, text: 'KL >= 0 siempre' },
        { time: 0.45, text: 'Por lo tanto: ELBO <= log p(x) siempre' },
        { time: 0.6, text: 'Mejor q reduce la brecha' },
        { time: 0.75, text: 'Si q = p(z|x), brecha = 0' },
        { time: 0.85, text: 'ELBO toca el techo: cota perfecta' },
      ],
      topic: 'log p(x) = ELBO + gap. Gap = KL(q||p(z|x)). ELBO es cota inferior.',
      title: 'La brecha',
      elboBar: 'ELBO',
      gapBar: 'Brecha KL',
      totalLabel: 'log p(x)',
      gapFormula: 'D_KL(q(z|x) || p(z|x))',
      gapExplain: 'KL >= 0 -> ELBO <= log p(x)',
      improveQ: 'Mejor q -> brecha menor',
    },
    scene7: {
      id: 'Resumen: la ecuacion ELBO',
      narration: 'El cuadro completo: los datos x entran al encoder, se muestrea z, el decoder reconstruye x hat. La perdida es el negativo del ELBO. Reconstruccion apunta al decoder, KL apunta al encoder. Siguiente: construir el VAE con redes neuronales.',
      subtitleCues: [
        { time: 0, text: 'Pipeline completo del VAE' },
        { time: 0.15, text: 'x -> encoder q_phi -> (mu, sigma)' },
        { time: 0.3, text: 'z ~ q_phi(z|x) via reparametrizacion' },
        { time: 0.45, text: 'z -> decoder p_theta -> x_hat' },
        { time: 0.6, text: 'Perdida = -ELBO = -Recon + KL' },
        { time: 0.75, text: 'Recon entrena al decoder, KL al encoder' },
        { time: 0.85, text: 'Siguiente: construir el VAE con redes neuronales' },
      ],
      topic: 'Resumen del ELBO. Pipeline encoder-decoder. Preview de la arquitectura VAE.',
      title: 'La ecuacion ELBO',
      encoderLabel: 'Encoder q_\u03c6',
      decoderLabel: 'Decoder p_\u03b8',
      sampleLabel: 'z ~ q_\u03c6(z|x)',
      lossLabel: '-ELBO',
      nextLabel: 'Siguiente: VAE Encoder y Decoder',
      inputLabel: 'x',
      outputLabel: 'x\u0302',
      reconArrow: 'Reconstruccion -> Decoder',
      klArrow: 'KL -> Encoder',
    },
  },
  en: {
    lessonTitle: 'The ELBO',
    lessonSubtitle: 'Evidence Lower Bound: the mathematical heart of VAEs',
    scene1: {
      id: 'The goal',
      narration: 'We want to maximize log p of x, the evidence. But we cannot compute it directly because the integral over z is intractable. We need a computable objective that, when pushed upward, also raises log p of x. That objective is the ELBO.',
      subtitleCues: [
        { time: 0, text: 'Maximizing log p(x) is intractable' },
        { time: 0.15, text: 'The integral over z blocks computation' },
        { time: 0.3, text: 'We need a computable substitute' },
        { time: 0.45, text: 'That when raised, raises log p(x)' },
        { time: 0.6, text: 'A lower bound we can optimize' },
        { time: 0.75, text: 'Pushing the floor raises the ceiling' },
        { time: 0.85, text: 'That objective is the ELBO' },
      ],
      topic: 'Motivation for the ELBO as a tractable objective.',
      title: 'The goal',
      ceilingLabel: 'log p(x)',
      questionLabel: 'Our objective = ?',
      intractable: 'Intractable: integral p(x,z) dz',
      needComputable: 'We need a computable lower bound',
      reveal: 'ELBO',
    },
    scene2: {
      id: 'Introducing q(z|x)',
      narration: 'The trick: multiply and divide by q inside the integral. This changes nothing, like multiplying by one. Log p of x becomes the log of the expectation under q of the ratio p over q. Still exact, no approximation.',
      subtitleCues: [
        { time: 0, text: 'Algebraic trick: insert q(z|x)' },
        { time: 0.15, text: 'Multiply and divide by q = multiply by 1' },
        { time: 0.3, text: 'log p(x) = log integral [p(x,z)/q] * q dz' },
        { time: 0.45, text: 'Rewrite as expectation under q' },
        { time: 0.6, text: '= log E_q[p(x,z)/q(z|x)]' },
        { time: 0.75, text: 'q focuses sampling on relevant z' },
        { time: 0.85, text: 'Still exact: no approximation' },
      ],
      topic: 'Insert q(z|x) into the integral. Rewrite as expectation under q.',
      title: 'Introducing q(z|x)',
      exactLabel: 'Exact: =',
      stepLabel: 'Insert q/q',
      step1Label: 'Step 1: Marginal',
      step2Label: 'Step 2: Insert q(z|x)',
      step3Label: 'Step 3: Expectation under q',
      exactBadge: 'Exact',
    },
    scene3: {
      id: 'Applying Jensen',
      narration: 'Now we apply Jensen inequality: log of expectation is at least expectation of log. This single step introduces the approximation. The result is the ELBO: Evidence Lower BOund. One inequality changes everything.',
      subtitleCues: [
        { time: 0, text: 'Jensen: log E[*] >= E[log(*)]' },
        { time: 0.15, text: 'For concave functions like log' },
        { time: 0.3, text: 'log p(x) >= E_q[log p(x,z) - log q(z|x)]' },
        { time: 0.45, text: 'This >= is where approximation enters' },
        { time: 0.6, text: 'Result: ELBO = Evidence Lower BOund' },
        { time: 0.75, text: 'One inequality changes everything' },
        { time: 0.85, text: 'ELBO <= log p(x) always' },
      ],
      topic: 'Jensen inequality applied. Definition of the ELBO.',
      title: 'Applying Jensen',
      jensenLabel: '>= (Jensen)',
      elboLabel: 'ELBO',
      jensenRule: "Jensen's Inequality",
      jensenDesc: 'For concave f: f(E[X]) >= E[f(X)]',
      approxHere: 'Approximation enters here',
    },
    scene4: {
      id: 'Reconstruction vs KL',
      narration: 'The ELBO decomposes into two terms: reconstruction, measuring how well the decoder reproduces x from z, and minus KL, regularizing q to stay close to the prior. One demands fidelity, the other demands normality.',
      subtitleCues: [
        { time: 0, text: 'ELBO = E_q[log p(x|z)] - D_KL(q||p(z))' },
        { time: 0.15, text: 'Term 1: Reconstruction' },
        { time: 0.3, text: 'Measures decoder quality' },
        { time: 0.45, text: 'Term 2: -KL (regularization)' },
        { time: 0.6, text: 'Penalizes q if it strays from prior' },
        { time: 0.75, text: 'Fidelity vs normality' },
        { time: 0.85, text: 'Reproduce x vs stay near prior' },
      ],
      topic: 'ELBO decomposition: reconstruction + KL regularization.',
      title: 'Reconstruction vs KL',
      reconLabel: 'Reconstruction',
      reconDesc: 'E_q[log p(x|z)]',
      klLabel: 'Regularization',
      klDesc: '-D_KL(q(z|x) || p(z))',
      reconIcon: 'Faithfully reproduce x',
      klIcon: 'Stay close to prior',
    },
    scene5: {
      id: 'The two forces',
      narration: 'If you only optimized reconstruction, q would memorize each data point with weird distributions. If you only optimized KL, q would equal the prior but reconstruct nothing. The ELBO balances these competing forces. Perfect balance is a good VAE.',
      subtitleCues: [
        { time: 0, text: 'Two forces compete within the ELBO' },
        { time: 0.15, text: 'Reconstruction only: q memorizes (overfitting)' },
        { time: 0.3, text: 'q becomes specific and weird' },
        { time: 0.45, text: 'KL only: q = prior, but no reconstruction' },
        { time: 0.6, text: 'The ELBO balances both forces' },
        { time: 0.75, text: 'Creative tension: fidelity vs simplicity' },
        { time: 0.85, text: 'Perfect balance = good VAE' },
      ],
      topic: 'Reconstruction vs regularization tension. Only recon: q memorizes. Only KL: q=prior but no recon. ELBO balances both.',
      title: 'The two forces',
      reconForce: 'Reconstruction',
      klForce: 'KL',
      balanceLabel: 'ELBO',
      pullLeft: 'Specific q',
      pullRight: 'Broad q',
      balanceDesc: 'Perfect balance = good VAE',
    },
    scene6: {
      id: 'The gap',
      narration: 'Log p of x equals the ELBO plus the KL between q and the true posterior. Since KL is always non-negative, the ELBO never exceeds log p of x. When q matches the posterior, the gap is zero and the ELBO touches the ceiling.',
      subtitleCues: [
        { time: 0, text: 'log p(x) = ELBO + D_KL(q || p(z|x))' },
        { time: 0.15, text: 'The gap = KL(q || true posterior)' },
        { time: 0.3, text: 'KL >= 0 always' },
        { time: 0.45, text: 'Therefore: ELBO <= log p(x) always' },
        { time: 0.6, text: 'Better q shrinks the gap' },
        { time: 0.75, text: 'If q = p(z|x), gap = 0' },
        { time: 0.85, text: 'ELBO touches the ceiling: perfect bound' },
      ],
      topic: 'log p(x) = ELBO + gap. Gap = KL(q||p(z|x)). ELBO is a lower bound.',
      title: 'The gap',
      elboBar: 'ELBO',
      gapBar: 'KL gap',
      totalLabel: 'log p(x)',
      gapFormula: 'D_KL(q(z|x) || p(z|x))',
      gapExplain: 'KL >= 0 -> ELBO <= log p(x)',
      improveQ: 'Better q -> smaller gap',
    },
    scene7: {
      id: 'Summary: the ELBO equation',
      narration: 'The complete picture: data x enters the encoder, z is sampled, the decoder reconstructs x hat. The loss is the negative ELBO. Reconstruction trains the decoder, KL trains the encoder. Next: build the VAE with neural networks.',
      subtitleCues: [
        { time: 0, text: 'Complete VAE pipeline' },
        { time: 0.15, text: 'x -> encoder q_phi -> (mu, sigma)' },
        { time: 0.3, text: 'z ~ q_phi(z|x) via reparameterization' },
        { time: 0.45, text: 'z -> decoder p_theta -> x_hat' },
        { time: 0.6, text: 'Loss = -ELBO = -Recon + KL' },
        { time: 0.75, text: 'Recon trains decoder, KL trains encoder' },
        { time: 0.85, text: 'Next: build the VAE with neural networks' },
      ],
      topic: 'ELBO summary. Encoder-decoder pipeline. Preview of VAE architecture.',
      title: 'The ELBO equation',
      encoderLabel: 'Encoder q_\u03c6',
      decoderLabel: 'Decoder p_\u03b8',
      sampleLabel: 'z ~ q_\u03c6(z|x)',
      lossLabel: '-ELBO',
      nextLabel: 'Next: VAE Encoder and Decoder',
      inputLabel: 'x',
      outputLabel: 'x\u0302',
      reconArrow: 'Reconstruction -> Decoder',
      klArrow: 'KL -> Encoder',
    },
  },
};

export const questions: Record<Lang, {
  afterScene3: import('../../engine/types').QuestionData;
  afterScene5: import('../../engine/types').QuestionData;
}> = {
  es: {
    afterScene3: {
      question: 'La desigualdad de Jensen aplicada al ELBO introduce una cota porque...',
      choices: [
        'log es una funcion convexa',
        'log es una funcion concava, y log E[X] >= E[log X]',
        'La esperanza bajo q es siempre negativa',
        'p(x,z) es siempre mayor que q(z|x)',
      ],
      correctIndex: 1,
      hint: 'Piensa en la forma de la funcion logaritmo. Es concava o convexa?',
      explanation: 'log es concava, por lo que Jensen da log E[X] >= E[log X]. Al mover el log dentro de la esperanza, pasamos de igualdad a desigualdad, creando una cota inferior.',
    },
    afterScene5: {
      question: 'Si un VAE tiene KL = 0 y reconstruccion perfecta, que podemos concluir?',
      choices: [
        'El modelo es perfecto',
        'q memoriza y la regularizacion fallo',
        'El ELBO es negativo',
        'La posterior es intractable',
      ],
      correctIndex: 1,
      hint: 'KL = 0 significa que q = prior. Si tambien hay reconstruccion perfecta, algo raro pasa...',
      explanation: 'Si solo optimizamos reconstruccion, q puede memorizar cada dato con distribuciones raras. KL = 0 con reconstruccion perfecta sugiere que q colapso al prior y el decoder aprendio a ignorar z, lo cual es el colapso posterior.',
    },
  },
  en: {
    afterScene3: {
      question: "Jensen's inequality applied to the ELBO introduces a bound because...",
      choices: [
        'log is a convex function',
        'log is a concave function, and log E[X] >= E[log X]',
        'The expectation under q is always negative',
        'p(x,z) is always greater than q(z|x)',
      ],
      correctIndex: 1,
      hint: 'Think about the shape of the log function. Is it concave or convex?',
      explanation: 'log is concave, so Jensen gives log E[X] >= E[log X]. Moving the log inside the expectation turns equality into inequality, creating a lower bound.',
    },
    afterScene5: {
      question: 'If a VAE has KL = 0 and perfect reconstruction, what can we conclude?',
      choices: [
        'The model is perfect',
        'q memorizes and regularization failed',
        'The ELBO is negative',
        'The posterior is intractable',
      ],
      correctIndex: 1,
      hint: 'KL = 0 means q = prior. If there is also perfect reconstruction, something strange is happening...',
      explanation: 'If we only optimize reconstruction, q can memorize each data point with weird distributions. KL = 0 with perfect reconstruction suggests q collapsed to the prior and the decoder learned to ignore z, which is posterior collapse.',
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
