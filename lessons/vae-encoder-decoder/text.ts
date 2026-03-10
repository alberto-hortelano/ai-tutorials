// Bilingual text for VAE Encoder-Decoder lesson

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
    lessonTitle: 'VAE: Encoder y Decoder',
    lessonSubtitle: 'El truco de reparametrizacion y el entrenamiento del VAE',
    scene1: {
      id: 'Arquitectura del VAE',
      narration: 'Un VAE tiene tres bloques. El encoder mapea x a mu y sigma. Luego muestreamos z usando el truco de reparametrizacion. El decoder reconstruye x hat a partir de z. Es como Alice comprimiendo una imagen para enviarsela a Bob.',
      subtitleCues: [
        { time: 0.0, text: 'Tres bloques: Encoder, Sampling, Decoder' },
        { time: 0.15, text: 'Encoder: x -> (mu, sigma)' },
        { time: 0.3, text: 'Sampling: z = mu + sigma * epsilon' },
        { time: 0.45, text: 'Decoder: z -> x_hat (reconstruccion)' },
        { time: 0.6, text: 'Alice (encoder) comprime la imagen' },
        { time: 0.75, text: 'Bob (decoder) la reconstruye' },
        { time: 0.85, text: 'Loss = -ELBO = recon + KL' },
      ],
      topic: 'Arquitectura VAE: encoder, sampling con reparametrizacion, decoder. Analogia Alice-Bob de compresion.',
      title: 'Arquitectura del VAE',
      encoderLabel: 'Encoder f_phi',
      samplingLabel: 'Sampling',
      decoderLabel: 'Decoder g_theta',
      inputLabel: 'x',
      outputLabel: 'x_hat',
      muLabel: 'mu',
      sigmaLabel: 'sigma',
      zLabel: 'z',
      lossLabel: 'Loss = Recon + KL',
    },
    scene2: {
      id: 'El problema del gradiente',
      narration: 'Queremos optimizar phi, pero z se muestrea aleatoriamente. Los gradientes no pueden fluir a traves del muestreo estocastico. Es como un muro que bloquea la retropropagacion. REINFORCE existe pero tiene varianza enorme y es impractico.',
      subtitleCues: [
        { time: 0.0, text: 'Necesitamos gradientes respecto a phi' },
        { time: 0.15, text: 'Pero z ~ q es estocastico: aleatorio' },
        { time: 0.3, text: 'Los gradientes no pueden cruzar el muestreo' },
        { time: 0.45, text: 'Es un muro entre encoder y decoder' },
        { time: 0.6, text: 'REINFORCE: varianza altisima' },
        { time: 0.75, text: 'Entrenamiento inestable y lento' },
        { time: 0.85, text: 'Necesitamos algo mejor' },
      ],
      topic: 'Problema: gradientes no fluyen a traves de muestreo estocastico. REINFORCE tiene varianza alta.',
      title: 'El problema del gradiente',
      needGrad: 'Necesitamos nabla_phi ELBO',
      stochastic: 'z ~ q_phi(z|x)',
      blocked: 'Gradientes bloqueados',
      wallLabel: 'Muestreo aleatorio',
      reinforceLabel: 'REINFORCE: varianza enorme',
    },
    scene3: {
      id: 'Truco de reparametrizacion',
      narration: 'La solucion: z igual mu mas sigma por epsilon, donde epsilon viene de una normal estandar. En vez de preguntar como cambia el resultado si cambio la distribucion, preguntamos como cambia si cambio la transformacion aplicada al ruido. Ahora los gradientes fluyen sin problema.',
      subtitleCues: [
        { time: 0.0, text: 'z = mu + sigma * epsilon' },
        { time: 0.15, text: 'epsilon ~ N(0,1): ruido fijo externo' },
        { time: 0.3, text: 'z es funcion determinista de phi' },
        { time: 0.45, text: 'En vez de cambiar la distribucion (dificil)...' },
        { time: 0.6, text: '...cambiamos la transformacion del ruido (facil)' },
        { time: 0.75, text: 'Gradientes fluyen por mu y sigma' },
        { time: 0.85, text: 'Backprop funciona normalmente' },
      ],
      topic: 'Truco de reparametrizacion: z = mu + sigma * epsilon. En vez de cambiar la distribucion, cambias la transformacion del ruido.',
      title: 'Truco de reparametrizacion',
      beforeLabel: 'Antes: bloqueado',
      afterLabel: 'Despues: fluye',
      epsLabel: 'epsilon ~ N(0,1)',
      detLabel: 'z = f(phi, epsilon)',
      gradFlowLabel: 'Gradientes OK',
    },
    scene4: {
      id: 'Inferencia amortizada',
      narration: 'Sin amortizacion, necesitamos optimizar parametros lambda separados para cada dato, con bucles internos costosos. Con un encoder compartido, un solo pase forward da la inferencia para cualquier x. Dramaticamente mas rapido.',
      subtitleCues: [
        { time: 0.0, text: 'Naive: lambda_i separado por dato' },
        { time: 0.15, text: 'Optimizacion interna costosa para cada x_i' },
        { time: 0.3, text: 'Impractico con miles de datos' },
        { time: 0.45, text: 'Amortizado: un encoder para todos' },
        { time: 0.6, text: 'f_phi: x -> lambda (mu, sigma)' },
        { time: 0.75, text: 'Un forward pass = inferencia instantanea' },
        { time: 0.85, text: 'Phi se comparte entre todos los datos' },
      ],
      topic: 'Inferencia amortizada: un encoder compartido vs parametros individuales por dato.',
      title: 'Inferencia amortizada',
      naiveTitle: 'Naive',
      amortizedTitle: 'Amortizado',
      naiveDesc: 'lambda_i por cada x_i',
      amortizedDesc: 'Un encoder para todo',
      innerLoop: 'Bucle interno costoso',
      onePass: 'Un forward pass',
      slowLabel: 'Lento',
      fastLabel: 'Rapido',
    },
    scene5: {
      id: 'El bucle de entrenamiento',
      narration: 'El entrenamiento es un ciclo: tomamos un batch, lo pasamos por el encoder, muestreamos z, reconstruimos con el decoder, calculamos la perdida y retropropagamos. Gracias a la reparametrizacion, todo es backprop estandar.',
      subtitleCues: [
        { time: 0.0, text: 'Batch -> Encoder -> Sampling -> Decoder' },
        { time: 0.15, text: 'Encoder produce mu y sigma' },
        { time: 0.3, text: 'z = mu + sigma * epsilon (reparam)' },
        { time: 0.45, text: 'Decoder produce x_hat' },
        { time: 0.6, text: 'Calcular loss = recon + KL' },
        { time: 0.75, text: 'Backprop actualiza phi y theta' },
        { time: 0.85, text: 'Recon baja, KL se estabiliza' },
      ],
      topic: 'Bucle de entrenamiento VAE: forward, loss, backprop. Curva de perdida con recon y KL.',
      title: 'Bucle de entrenamiento',
      stepBatch: 'Batch',
      stepEncoder: 'Encoder',
      stepSampling: 'Sampling',
      stepDecoder: 'Decoder',
      stepLoss: 'Loss',
      stepBackprop: 'Backprop',
      reconLabel: 'Reconstruccion',
      klLabel: 'KL',
      totalLabel: 'Total',
    },
    scene6: {
      id: 'Beta-VAE',
      narration: 'Beta-VAE modifica la perdida: reconstruccion mas beta por KL. Con beta cero, no hay estructura en z. Con beta uno, el VAE estandar. Con beta mayor, el espacio latente se organiza y se desenreda, pero las reconstrucciones se vuelven borrosas.',
      subtitleCues: [
        { time: 0.0, text: 'Loss = recon + beta * KL' },
        { time: 0.15, text: 'beta = 0: sin regularizacion' },
        { time: 0.3, text: 'Reconstruccion perfecta pero z caotico' },
        { time: 0.45, text: 'beta = 1: VAE estandar, balance' },
        { time: 0.6, text: 'beta > 1: z organizado, desenredado' },
        { time: 0.75, text: 'Pero reconstrucciones borrosas' },
        { time: 0.85, text: 'beta controla la tension recon-KL' },
      ],
      topic: 'Beta-VAE: controlar el balance entre reconstruccion y regularizacion del espacio latente.',
      title: 'Beta-VAE',
      sliderLabel: 'beta',
      panel0Title: 'beta = 0',
      panel1Title: 'beta = 1',
      panel2Title: 'beta > 1',
      panel0Desc: 'Caotico',
      panel1Desc: 'Balanceado',
      panel2Desc: 'Organizado',
      blurryLabel: 'Borroso',
      sharpLabel: 'Nitido',
    },
    scene7: {
      id: 'Colapso posterior',
      narration: 'A veces el encoder ignora x y produce la misma distribucion para todos los datos. El KL se vuelve cero, que parece bien. Pero la reconstruccion es terrible porque el decoder aprende a ignorar z completamente. Es el colapso posterior.',
      subtitleCues: [
        { time: 0.0, text: 'Encoder ignora x: q(z|x) = p(z) para todo x' },
        { time: 0.15, text: 'Todas las q son identicas al prior' },
        { time: 0.3, text: 'KL -> 0: parece bueno, pero...' },
        { time: 0.45, text: 'z no lleva informacion de x' },
        { time: 0.6, text: 'El decoder ignora z completamente' },
        { time: 0.75, text: 'Reconstruccion terrible: todo borroso' },
        { time: 0.85, text: 'Colapso posterior: el VAE se rompe' },
      ],
      topic: 'Posterior collapse: encoder ignora la entrada, KL=0 pero reconstruccion falla.',
      title: 'Colapso posterior',
      warningLabel: 'Peligro',
      klZero: 'KL = 0',
      reconBad: 'Recon mala',
      allSame: 'Todas las q iguales',
      decoderIgnores: 'Decoder ignora z',
    },
  },
  en: {
    lessonTitle: 'VAE: Encoder and Decoder',
    lessonSubtitle: 'The reparameterization trick and VAE training',
    scene1: {
      id: 'VAE Architecture',
      narration: 'A VAE has three blocks. The encoder maps x to mu and sigma. Then we sample z using the reparameterization trick. The decoder reconstructs x hat from z. Think of it as Alice compressing an image to send to Bob.',
      subtitleCues: [
        { time: 0.0, text: 'Three blocks: Encoder, Sampling, Decoder' },
        { time: 0.15, text: 'Encoder: x -> (mu, sigma)' },
        { time: 0.3, text: 'Sampling: z = mu + sigma * epsilon' },
        { time: 0.45, text: 'Decoder: z -> x_hat (reconstruction)' },
        { time: 0.6, text: 'Alice (encoder) compresses the image' },
        { time: 0.75, text: 'Bob (decoder) reconstructs it' },
        { time: 0.85, text: 'Loss = -ELBO = recon + KL' },
      ],
      topic: 'VAE architecture: encoder, sampling with reparameterization, decoder. Alice-Bob compression analogy.',
      title: 'VAE Architecture',
      encoderLabel: 'Encoder f_phi',
      samplingLabel: 'Sampling',
      decoderLabel: 'Decoder g_theta',
      inputLabel: 'x',
      outputLabel: 'x_hat',
      muLabel: 'mu',
      sigmaLabel: 'sigma',
      zLabel: 'z',
      lossLabel: 'Loss = Recon + KL',
    },
    scene2: {
      id: 'The Gradient Problem',
      narration: 'We want to optimize phi, but z is sampled randomly. Gradients cannot flow through stochastic sampling. It is like a wall blocking backpropagation. REINFORCE exists but has enormous variance and is impractical.',
      subtitleCues: [
        { time: 0.0, text: 'Need gradients with respect to phi' },
        { time: 0.15, text: 'But z ~ q is stochastic: random' },
        { time: 0.3, text: 'Gradients cannot cross the sampling step' },
        { time: 0.45, text: 'A wall between encoder and decoder' },
        { time: 0.6, text: 'REINFORCE: extremely high variance' },
        { time: 0.75, text: 'Training unstable and slow' },
        { time: 0.85, text: 'We need something better' },
      ],
      topic: 'Problem: gradients cannot flow through stochastic sampling. REINFORCE has high variance.',
      title: 'The Gradient Problem',
      needGrad: 'Need nabla_phi ELBO',
      stochastic: 'z ~ q_phi(z|x)',
      blocked: 'Gradients blocked',
      wallLabel: 'Random sampling',
      reinforceLabel: 'REINFORCE: huge variance',
    },
    scene3: {
      id: 'Reparameterization Trick',
      narration: 'The solution: z equals mu plus sigma times epsilon, where epsilon comes from a standard normal. Instead of asking how output changes when you change the distribution, ask how it changes when you change the transform applied to noise. Now gradients flow freely.',
      subtitleCues: [
        { time: 0.0, text: 'z = mu + sigma * epsilon' },
        { time: 0.15, text: 'epsilon ~ N(0,1): fixed external noise' },
        { time: 0.3, text: 'z is a deterministic function of phi' },
        { time: 0.45, text: 'Instead of changing the distribution (hard)...' },
        { time: 0.6, text: '...change the transform of noise (easy)' },
        { time: 0.75, text: 'Gradients flow through mu and sigma' },
        { time: 0.85, text: 'Backprop works normally' },
      ],
      topic: 'Reparameterization trick: z = mu + sigma * epsilon. Instead of changing the distribution, change the transform of noise.',
      title: 'Reparameterization Trick',
      beforeLabel: 'Before: blocked',
      afterLabel: 'After: flows',
      epsLabel: 'epsilon ~ N(0,1)',
      detLabel: 'z = f(phi, epsilon)',
      gradFlowLabel: 'Gradients OK',
    },
    scene4: {
      id: 'Amortized Inference',
      narration: 'Without amortization, we need to optimize separate lambda parameters for each data point, with expensive inner loops. With a shared encoder, a single forward pass gives inference for any x. Dramatically faster.',
      subtitleCues: [
        { time: 0.0, text: 'Naive: separate lambda_i per data point' },
        { time: 0.15, text: 'Expensive inner optimization for each x_i' },
        { time: 0.3, text: 'Impractical with thousands of data points' },
        { time: 0.45, text: 'Amortized: one encoder for all' },
        { time: 0.6, text: 'f_phi: x -> lambda (mu, sigma)' },
        { time: 0.75, text: 'One forward pass = instant inference' },
        { time: 0.85, text: 'Phi shared across all data' },
      ],
      topic: 'Amortized inference: one shared encoder vs individual parameters per data point.',
      title: 'Amortized Inference',
      naiveTitle: 'Naive',
      amortizedTitle: 'Amortized',
      naiveDesc: 'lambda_i per each x_i',
      amortizedDesc: 'One encoder for all',
      innerLoop: 'Expensive inner loop',
      onePass: 'One forward pass',
      slowLabel: 'Slow',
      fastLabel: 'Fast',
    },
    scene5: {
      id: 'The Training Loop',
      narration: 'Training is a cycle: take a batch, pass through encoder, sample z, reconstruct with decoder, compute loss, backpropagate. Thanks to reparameterization, it is all standard backprop.',
      subtitleCues: [
        { time: 0.0, text: 'Batch -> Encoder -> Sampling -> Decoder' },
        { time: 0.15, text: 'Encoder produces mu and sigma' },
        { time: 0.3, text: 'z = mu + sigma * epsilon (reparam)' },
        { time: 0.45, text: 'Decoder produces x_hat' },
        { time: 0.6, text: 'Compute loss = recon + KL' },
        { time: 0.75, text: 'Backprop updates phi and theta' },
        { time: 0.85, text: 'Recon decreases, KL stabilizes' },
      ],
      topic: 'VAE training loop: forward, loss, backprop. Loss curve with recon and KL components.',
      title: 'The Training Loop',
      stepBatch: 'Batch',
      stepEncoder: 'Encoder',
      stepSampling: 'Sampling',
      stepDecoder: 'Decoder',
      stepLoss: 'Loss',
      stepBackprop: 'Backprop',
      reconLabel: 'Reconstruction',
      klLabel: 'KL',
      totalLabel: 'Total',
    },
    scene6: {
      id: 'Beta-VAE',
      narration: 'Beta-VAE modifies the loss: reconstruction plus beta times KL. With beta zero, no structure in z. With beta one, standard VAE. With beta greater, the latent space organizes and disentangles, but reconstructions become blurry.',
      subtitleCues: [
        { time: 0.0, text: 'Loss = recon + beta * KL' },
        { time: 0.15, text: 'beta = 0: no regularization' },
        { time: 0.3, text: 'Perfect reconstruction but chaotic z' },
        { time: 0.45, text: 'beta = 1: standard VAE, balanced' },
        { time: 0.6, text: 'beta > 1: z organized, disentangled' },
        { time: 0.75, text: 'But reconstructions become blurry' },
        { time: 0.85, text: 'beta controls the recon-KL tension' },
      ],
      topic: 'Beta-VAE: controlling the balance between reconstruction and latent space regularization.',
      title: 'Beta-VAE',
      sliderLabel: 'beta',
      panel0Title: 'beta = 0',
      panel1Title: 'beta = 1',
      panel2Title: 'beta > 1',
      panel0Desc: 'Chaotic',
      panel1Desc: 'Balanced',
      panel2Desc: 'Organized',
      blurryLabel: 'Blurry',
      sharpLabel: 'Sharp',
    },
    scene7: {
      id: 'Posterior Collapse',
      narration: 'Sometimes the encoder ignores x and outputs the same distribution for all data. KL becomes zero, which seems good. But reconstruction is terrible because the decoder learns to ignore z completely. This is posterior collapse.',
      subtitleCues: [
        { time: 0.0, text: 'Encoder ignores x: q(z|x) = p(z) for all x' },
        { time: 0.15, text: 'All q distributions identical to prior' },
        { time: 0.3, text: 'KL -> 0: looks good, but...' },
        { time: 0.45, text: 'z carries no information about x' },
        { time: 0.6, text: 'Decoder ignores z completely' },
        { time: 0.75, text: 'Reconstruction terrible: all blurry' },
        { time: 0.85, text: 'Posterior collapse: the VAE breaks down' },
      ],
      topic: 'Posterior collapse: encoder ignores input, KL=0 but reconstruction fails.',
      title: 'Posterior Collapse',
      warningLabel: 'Danger',
      klZero: 'KL = 0',
      reconBad: 'Recon bad',
      allSame: 'All q identical',
      decoderIgnores: 'Decoder ignores z',
    },
  },
};

export const questions: Record<Lang, {
  afterScene3: import('../../engine/types').QuestionData;
  afterScene6: import('../../engine/types').QuestionData;
}> = {
  es: {
    afterScene3: {
      question: 'En el truco de reparametrizacion, por que z = mu + sigma * epsilon permite calcular gradientes respecto a phi?',
      choices: [
        'Porque epsilon depende de phi',
        'Porque z ya no es aleatorio',
        'Porque z es funcion determinista de phi (dada epsilon fija)',
        'Porque eliminamos el muestreo por completo',
      ],
      correctIndex: 2,
      hint: 'Piensa: epsilon se muestrea de N(0,1) que no depende de phi. Entonces z es una transformacion determinista...',
      explanation: 'Con epsilon fijo (muestreado de N(0,1) que no depende de phi), z = mu + sigma * epsilon es una funcion diferenciable de phi a traves de mu y sigma. Los gradientes fluyen como en backprop estandar.',
    },
    afterScene6: {
      question: 'En el colapso posterior, el encoder produce q(z|x) = p(z) para todo x. Que sucede con la informacion sobre x?',
      choices: [
        'Se almacena en z',
        'Se pierde: z no lleva informacion de x',
        'Se almacena en los pesos del decoder',
        'Se comprime en los gradientes',
      ],
      correctIndex: 1,
      hint: 'Si q(z|x) es la misma para todo x, que puede deducir el decoder de z sobre el x original?',
      explanation: 'Si q produce la misma distribucion sin importar x, las muestras de z no contienen informacion sobre la entrada. El decoder tiene que generar salidas sin pistas de x, resultando en reconstrucciones borrosas e identicas.',
    },
  },
  en: {
    afterScene3: {
      question: 'In the reparameterization trick, why does z = mu + sigma * epsilon allow computing gradients with respect to phi?',
      choices: [
        'Because epsilon depends on phi',
        'Because z is no longer random',
        'Because z is a deterministic function of phi (given fixed epsilon)',
        'Because we eliminate sampling entirely',
      ],
      correctIndex: 2,
      hint: 'Think: epsilon is sampled from N(0,1) which does not depend on phi. So z is a deterministic transform...',
      explanation: 'With fixed epsilon (sampled from N(0,1) which does not depend on phi), z = mu + sigma * epsilon is a differentiable function of phi through mu and sigma. Gradients flow as in standard backprop.',
    },
    afterScene6: {
      question: 'In posterior collapse, the encoder produces q(z|x) = p(z) for all x. What happens to information about x?',
      choices: [
        'It is stored in z',
        'It is lost: z carries no information about x',
        'It is stored in decoder weights',
        'It is compressed into gradients',
      ],
      correctIndex: 1,
      hint: 'If q(z|x) is the same for all x, what can the decoder deduce from z about the original x?',
      explanation: 'If q produces the same distribution regardless of x, samples of z contain no information about the input. The decoder must generate outputs with no clues about x, resulting in blurry identical reconstructions.',
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
