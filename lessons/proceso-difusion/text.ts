// Bilingual text for Diffusion Process lesson

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
    lessonTitle: 'Proceso de Difusion',
    lessonSubtitle: 'De datos estructurados a ruido puro, y de vuelta',
    scene1: {
      id: 'Forward process',
      narration: 'Imagina una senal de television perfecta que se llena de estatica gradualmente. En t=0, cien por ciento de senal. En t=T, cien por ciento de nieve. La clave es que cada paso agrega un poquito de ruido, haciendo que el proceso inverso sea aproximadamente gaussiano.',
      subtitleCues: [
        { time: 0.0, text: 'TV perfecta llenandose de estatica' },
        { time: 0.14, text: 't=0: 100% senal, 0% ruido' },
        { time: 0.28, text: 'Cada paso agrega un poquito de ruido' },
        { time: 0.42, text: 't=T/2: 50% senal, 50% ruido' },
        { time: 0.57, text: 't=T: 0% senal, 100% nieve pura' },
        { time: 0.71, text: 'Pasos pequenos: reverse es ~ gaussiano' },
        { time: 0.85, text: 'T=1000 pasos, beta_1=10^-4, beta_T=0.02' },
      ],
      topic: 'Forward diffusion process q(x_t|x_{t-1}). Agregar ruido gaussiano paso a paso. De datos estructurados a ruido puro isotropico.',
      title: 'Forward: agregando ruido',
      t0Label: 't = 0',
      t250Label: 't = 250',
      t500Label: 't = 500',
      t750Label: 't = 750',
      t1000Label: 't = 1000',
      dataLabel: 'Datos',
      noiseLabel: 'Ruido puro',
    },
    scene2: {
      id: 'Noise schedule',
      narration: 'El schedule de ruido controla la velocidad de destruccion. Lineal va de beta uno igual a diez a la menos cuatro hasta beta T igual a cero punto cero dos. El coseno preserva mas estructura al inicio, dando mejor calidad. La eleccion importa mucho para la generacion final.',
      subtitleCues: [
        { time: 0.0, text: 'El schedule beta_t controla la destruccion' },
        { time: 0.14, text: 'Lineal: beta_1=10^-4 a beta_T=0.02' },
        { time: 0.28, text: 'Ruido uniforme en el tiempo' },
        { time: 0.42, text: 'Coseno: preserva estructura al inicio' },
        { time: 0.57, text: 'Destruccion mas lenta, mejor calidad' },
        { time: 0.71, text: 'alpha_bar_t: senal restante acumulada' },
        { time: 0.85, text: 'La eleccion afecta calidad final' },
      ],
      topic: 'Noise schedule beta_t. Linear vs cosine. alpha_bar_t como medida de signal-to-noise ratio acumulada.',
      title: 'Noise schedule: beta_t',
      linearLabel: 'Lineal',
      cosineLabel: 'Coseno',
      betaLabel: 'beta_t',
      alphaBarLabel: 'alpha-bar_t',
      linearDesc: 'Ruido uniforme',
      cosineDesc: 'Preserva estructura',
    },
    scene3: {
      id: 'Closed-form forward',
      narration: 'No necesitamos simular mil pasos uno por uno. Como mezclar pintura: podemos ir directo al color final. Alpha-bar es el dial de mezcla entre senal original y ruido fresco, todo en una sola operacion.',
      subtitleCues: [
        { time: 0.0, text: 'Salto directo a cualquier tiempo t' },
        { time: 0.14, text: 'Como mezclar pintura: resultado directo' },
        { time: 0.28, text: 'x_t = sqrt(alpha-bar)*x_0 + sqrt(1-alpha-bar)*epsilon' },
        { time: 0.42, text: 'alpha-bar grande: mucha senal, poco ruido' },
        { time: 0.57, text: 'alpha-bar pequeno: poca senal, mucho ruido' },
        { time: 0.71, text: 'El dial de mezcla senal/ruido' },
        { time: 0.85, text: 'Una sola operacion en vez de T pasos' },
      ],
      topic: 'Closed-form forward: q(x_t|x_0) = N(sqrt(alpha_bar_t)*x_0, (1-alpha_bar_t)*I). Eficiencia en entrenamiento.',
      title: 'Formula cerrada',
      signalLabel: 'Senal',
      noiseLabel: 'Ruido',
      mixLabel: 'Mezcla',
      dialLabel: 'alpha-bar_t',
    },
    scene4: {
      id: 'Reverse process',
      narration: 'El reverse process es la magia: como un escultor que talla figuras a partir de un bloque de arena. Partimos del ruido puro y en cada paso la red neuronal quita un poco de ruido. La estructura emerge gradualmente, primero las formas globales, luego los detalles finos.',
      subtitleCues: [
        { time: 0.0, text: 'Escultor tallando arena: reverse process' },
        { time: 0.14, text: 'Ruido puro como bloque sin forma' },
        { time: 0.28, text: 'Red neuronal quita ruido paso a paso' },
        { time: 0.42, text: 'Primero formas globales emergen' },
        { time: 0.57, text: 'Luego detalles finos aparecen' },
        { time: 0.71, text: 'p_theta(x_{t-1}|x_t): denoising iterativo' },
        { time: 0.85, text: 'De ruido puro a datos coherentes' },
      ],
      topic: 'Reverse diffusion process p_theta(x_{t-1}|x_t). Red neuronal parametriza la media del kernel de denoising.',
      title: 'Reverse: denoising iterativo',
      startLabel: 'Ruido puro',
      endLabel: 'Datos',
      forwardLabel: 'Forward: q(x_t | x_{t-1})',
      reverseLabel: 'Reverse: p_theta(x_{t-1} | x_t)',
    },
    scene5: {
      id: 'Training: predict noise',
      narration: 'Entrenar es sorprendentemente simple. Toma un dato limpio, elige un tiempo t al azar, agrega ruido conocido, y entrena la red para predecir exactamente ese ruido. La loss es solo el MSE entre epsilon real y epsilon predicho. Asi de elegante.',
      subtitleCues: [
        { time: 0.0, text: 'Entrenamiento: asombrosamente simple' },
        { time: 0.14, text: 'Paso 1: toma dato limpio x_0' },
        { time: 0.28, text: 'Paso 2: elige t al azar, agrega epsilon' },
        { time: 0.42, text: 'Paso 3: red predice epsilon_theta(x_t, t)' },
        { time: 0.57, text: 'Loss = ||epsilon - epsilon_theta||^2' },
        { time: 0.71, text: 'Solo MSE entre ruido real y predicho' },
        { time: 0.85, text: 'Simple, elegante, efectivo' },
      ],
      topic: 'Training objective: E[||epsilon - epsilon_theta(x_t, t)||^2]. Simplificacion de Ho et al. Noise prediction vs mean prediction.',
      title: 'Entrenamiento: predecir epsilon',
      x0Label: 'x_0',
      epsLabel: 'epsilon',
      xtLabel: 'x_t',
      netLabel: 'epsilon_theta',
      predLabel: 'epsilon estimado',
      lossLabel: 'Loss = MSE',
    },
    scene6: {
      id: 'Score matching connection',
      narration: 'La conexion profunda: predecir el ruido es exactamente estimar el score con signo opuesto. Epsilon theta es proporcional al negativo del score. Las flechas del score apuntan hacia los datos, las del ruido en sentido opuesto. Dos caras de la misma moneda.',
      subtitleCues: [
        { time: 0.0, text: 'Conexion con score matching' },
        { time: 0.14, text: 'Predecir ruido = estimar el score' },
        { time: 0.28, text: 'epsilon_theta ~ -sigma_t * score' },
        { time: 0.42, text: 'Score apunta hacia los datos' },
        { time: 0.57, text: 'Ruido apunta en sentido opuesto' },
        { time: 0.71, text: 'Dos caras de la misma moneda' },
        { time: 0.85, text: 'Difusion = score matching multi-escala' },
      ],
      topic: 'epsilon_theta(x_t,t) ~ -sigma_t * nabla_x log p_t(x). Denoising score matching. Unificacion de diffusion y score-based models.',
      title: 'Conexion con score matching',
      scoreLabel: 'Score: nabla log p(x)',
      noiseLabel: 'Noise: epsilon',
      insightLabel: 'epsilon ~ -sigma * score',
    },
    scene7: {
      id: 'Full picture',
      narration: 'El panorama completo: arriba, el forward process destruye los datos como el viento erosionando una escultura de arena. Abajo, el reverse process los reconstruye como un escultor tallando paso a paso. Dos caminos opuestos conectados por la matematica de la difusion.',
      subtitleCues: [
        { time: 0.0, text: 'El panorama completo' },
        { time: 0.14, text: 'Forward: viento erosiona la escultura' },
        { time: 0.28, text: 'Datos -> ruido (destruir es trivial)' },
        { time: 0.42, text: 'Reverse: escultor talla paso a paso' },
        { time: 0.57, text: 'Ruido -> datos (crear es el reto)' },
        { time: 0.71, text: 'Entrenamiento simple: predecir epsilon' },
        { time: 0.85, text: 'Dos caminos opuestos, una sola teoria' },
      ],
      topic: 'Vision global: forward q y reverse p_theta forman un par. Entrenamiento simple, generacion poderosa.',
      title: 'El panorama completo',
      forwardRow: 'Forward: q(x_t | x_{t-1})',
      reverseRow: 'Reverse: p_theta(x_{t-1} | x_t)',
      dataNode: 'x_0',
      noiseNode: 'x_T ~ N(0, I)',
    },
  },
  en: {
    lessonTitle: 'Diffusion Process',
    lessonSubtitle: 'From structured data to pure noise, and back',
    scene1: {
      id: 'Forward process',
      narration: 'Picture a perfect TV signal gradually filling with static. At t=0, one hundred percent signal. At t=T, one hundred percent snow. The key is that each step adds just a tiny bit of noise, making the reverse process approximately Gaussian.',
      subtitleCues: [
        { time: 0.0, text: 'Perfect TV filling with static' },
        { time: 0.14, text: 't=0: 100% signal, 0% noise' },
        { time: 0.28, text: 'Each step adds a tiny bit of noise' },
        { time: 0.42, text: 't=T/2: 50% signal, 50% noise' },
        { time: 0.57, text: 't=T: 0% signal, 100% pure snow' },
        { time: 0.71, text: 'Small steps: reverse is ~ Gaussian' },
        { time: 0.85, text: 'T=1000 steps, beta_1=10^-4, beta_T=0.02' },
      ],
      topic: 'Forward diffusion process q(x_t|x_{t-1}). Adding Gaussian noise step by step. From structured data to isotropic noise.',
      title: 'Forward: adding noise',
      t0Label: 't = 0',
      t250Label: 't = 250',
      t500Label: 't = 500',
      t750Label: 't = 750',
      t1000Label: 't = 1000',
      dataLabel: 'Data',
      noiseLabel: 'Pure noise',
    },
    scene2: {
      id: 'Noise schedule',
      narration: 'The noise schedule controls the speed of destruction. Linear goes from beta one equals ten to the minus four to beta T equals zero point zero two. Cosine preserves more structure early on, giving better quality. The choice matters a lot for final generation.',
      subtitleCues: [
        { time: 0.0, text: 'The schedule beta_t controls destruction' },
        { time: 0.14, text: 'Linear: beta_1=10^-4 to beta_T=0.02' },
        { time: 0.28, text: 'Uniform noise over time' },
        { time: 0.42, text: 'Cosine: preserves structure early' },
        { time: 0.57, text: 'Slower destruction, better quality' },
        { time: 0.71, text: 'alpha_bar_t: cumulative remaining signal' },
        { time: 0.85, text: 'The choice affects final quality' },
      ],
      topic: 'Noise schedule beta_t. Linear vs cosine. alpha_bar_t as cumulative signal-to-noise ratio measure.',
      title: 'Noise schedule: beta_t',
      linearLabel: 'Linear',
      cosineLabel: 'Cosine',
      betaLabel: 'beta_t',
      alphaBarLabel: 'alpha-bar_t',
      linearDesc: 'Uniform noise',
      cosineDesc: 'Preserves structure',
    },
    scene3: {
      id: 'Closed-form forward',
      narration: 'We do not need to simulate a thousand steps one by one. Like mixing paint: we can go straight to the final color. Alpha-bar is the mixing dial between original signal and fresh noise, all in a single operation.',
      subtitleCues: [
        { time: 0.0, text: 'Direct jump to any time t' },
        { time: 0.14, text: 'Like mixing paint: direct result' },
        { time: 0.28, text: 'x_t = sqrt(alpha-bar)*x_0 + sqrt(1-alpha-bar)*epsilon' },
        { time: 0.42, text: 'Large alpha-bar: mostly signal, little noise' },
        { time: 0.57, text: 'Small alpha-bar: little signal, lots of noise' },
        { time: 0.71, text: 'The signal/noise mixing dial' },
        { time: 0.85, text: 'One operation instead of T steps' },
      ],
      topic: 'Closed-form forward: q(x_t|x_0) = N(sqrt(alpha_bar_t)*x_0, (1-alpha_bar_t)*I). Training efficiency.',
      title: 'Closed form',
      signalLabel: 'Signal',
      noiseLabel: 'Noise',
      mixLabel: 'Mix',
      dialLabel: 'alpha-bar_t',
    },
    scene4: {
      id: 'Reverse process',
      narration: 'The reverse process is the magic: like a sculptor carving figures from a block of sand. We start from pure noise and at each step the neural network removes a bit of noise. Structure emerges gradually, first global shapes, then fine details.',
      subtitleCues: [
        { time: 0.0, text: 'Sculptor carving sand: reverse process' },
        { time: 0.14, text: 'Pure noise as a shapeless block' },
        { time: 0.28, text: 'Neural net removes noise step by step' },
        { time: 0.42, text: 'Global shapes emerge first' },
        { time: 0.57, text: 'Then fine details appear' },
        { time: 0.71, text: 'p_theta(x_{t-1}|x_t): iterative denoising' },
        { time: 0.85, text: 'From pure noise to coherent data' },
      ],
      topic: 'Reverse diffusion process p_theta(x_{t-1}|x_t). Neural network parameterizes the denoising kernel mean.',
      title: 'Reverse: iterative denoising',
      startLabel: 'Pure noise',
      endLabel: 'Data',
      forwardLabel: 'Forward: q(x_t | x_{t-1})',
      reverseLabel: 'Reverse: p_theta(x_{t-1} | x_t)',
    },
    scene5: {
      id: 'Training: predict noise',
      narration: 'Training is surprisingly simple. Take clean data, pick a random time t, add known noise, and train the network to predict exactly that noise. The loss is just the MSE between the real epsilon and the predicted one. That elegant.',
      subtitleCues: [
        { time: 0.0, text: 'Training: surprisingly simple' },
        { time: 0.14, text: 'Step 1: take clean data x_0' },
        { time: 0.28, text: 'Step 2: pick random t, add epsilon' },
        { time: 0.42, text: 'Step 3: network predicts epsilon_theta(x_t, t)' },
        { time: 0.57, text: 'Loss = ||epsilon - epsilon_theta||^2' },
        { time: 0.71, text: 'Just MSE between real and predicted noise' },
        { time: 0.85, text: 'Simple, elegant, effective' },
      ],
      topic: 'Training objective: E[||epsilon - epsilon_theta(x_t, t)||^2]. Ho et al. simplification. Noise prediction vs mean prediction.',
      title: 'Training: predict epsilon',
      x0Label: 'x_0',
      epsLabel: 'epsilon',
      xtLabel: 'x_t',
      netLabel: 'epsilon_theta',
      predLabel: 'predicted epsilon',
      lossLabel: 'Loss = MSE',
    },
    scene6: {
      id: 'Score matching connection',
      narration: 'The deep connection: predicting noise is exactly estimating the score with opposite sign. Epsilon theta is proportional to the negative score. Score arrows point toward data, noise arrows point the opposite way. Two sides of the same coin.',
      subtitleCues: [
        { time: 0.0, text: 'Connection to score matching' },
        { time: 0.14, text: 'Predicting noise = estimating the score' },
        { time: 0.28, text: 'epsilon_theta ~ -sigma_t * score' },
        { time: 0.42, text: 'Score points toward data' },
        { time: 0.57, text: 'Noise points the opposite way' },
        { time: 0.71, text: 'Two sides of the same coin' },
        { time: 0.85, text: 'Diffusion = multi-scale score matching' },
      ],
      topic: 'epsilon_theta(x_t,t) ~ -sigma_t * nabla_x log p_t(x). Denoising score matching. Unification of diffusion and score-based models.',
      title: 'Connection to score matching',
      scoreLabel: 'Score: nabla log p(x)',
      noiseLabel: 'Noise: epsilon',
      insightLabel: 'epsilon ~ -sigma * score',
    },
    scene7: {
      id: 'Full picture',
      narration: 'The full picture: above, the forward process destroys data like wind eroding a sand sculpture. Below, the reverse process reconstructs them like a sculptor carving step by step. Two opposite paths connected by diffusion mathematics.',
      subtitleCues: [
        { time: 0.0, text: 'The full picture' },
        { time: 0.14, text: 'Forward: wind erodes the sculpture' },
        { time: 0.28, text: 'Data -> noise (destroying is trivial)' },
        { time: 0.42, text: 'Reverse: sculptor carves step by step' },
        { time: 0.57, text: 'Noise -> data (creating is the challenge)' },
        { time: 0.71, text: 'Simple training: predict epsilon' },
        { time: 0.85, text: 'Two opposite paths, one theory' },
      ],
      topic: 'Global view: forward q and reverse p_theta form a pair. Simple training, powerful generation.',
      title: 'The full picture',
      forwardRow: 'Forward: q(x_t | x_{t-1})',
      reverseRow: 'Reverse: p_theta(x_{t-1} | x_t)',
      dataNode: 'x_0',
      noiseNode: 'x_T ~ N(0, I)',
    },
  },
};

// -- Questions (bilingual) --

export const questions: Record<Lang, {
  afterClosedForm: import('../../engine/types').QuestionData;
  afterScore: import('../../engine/types').QuestionData;
}> = {
  es: {
    afterClosedForm: {
      question: 'La formula cerrada q(x_t|x_0) permite saltar a cualquier t en un solo paso. Si alpha_bar_t = 0.5, la mezcla es...',
      choices: [
        '50% senal original, 50% ruido',
        '100% senal, 0% ruido',
        '0% senal, 100% ruido',
        'Depende del numero de pasos T',
      ],
      correctIndex: 0,
      hint: 'x_t = sqrt(alpha_bar)*x_0 + sqrt(1-alpha_bar)*epsilon. Si alpha_bar = 0.5...',
      explanation: 'Con alpha_bar = 0.5, los coeficientes son sqrt(0.5) para la senal y sqrt(0.5) para el ruido, dando igual peso a ambos.',
    },
    afterScore: {
      question: 'La prediccion de ruido epsilon_theta esta relacionada con el score segun...',
      choices: [
        'epsilon_theta es proporcional al negativo del score: epsilon ~ -sigma * nabla log p',
        'epsilon_theta es igual al score',
        'epsilon_theta es la segunda derivada del score',
        'No hay relacion entre prediccion de ruido y score',
      ],
      correctIndex: 0,
      hint: 'El ruido apunta en la direccion opuesta al score.',
      explanation: 'epsilon_theta(x_t, t) ~ -sigma_t * nabla_x log p_t(x). Predecir ruido y estimar scores son dos caras de la misma moneda.',
    },
  },
  en: {
    afterClosedForm: {
      question: 'The closed-form q(x_t|x_0) lets us jump to any t in one step. If alpha_bar_t = 0.5, the mix is...',
      choices: [
        '50% original signal, 50% noise',
        '100% signal, 0% noise',
        '0% signal, 100% noise',
        'Depends on the number of steps T',
      ],
      correctIndex: 0,
      hint: 'x_t = sqrt(alpha_bar)*x_0 + sqrt(1-alpha_bar)*epsilon. If alpha_bar = 0.5...',
      explanation: 'With alpha_bar = 0.5, the coefficients are sqrt(0.5) for signal and sqrt(0.5) for noise, giving equal weight to both.',
    },
    afterScore: {
      question: 'Noise prediction epsilon_theta is related to the score by...',
      choices: [
        'epsilon_theta is proportional to negative score: epsilon ~ -sigma * nabla log p',
        'epsilon_theta equals the score',
        'epsilon_theta is the second derivative of the score',
        'There is no relation between noise prediction and score',
      ],
      correctIndex: 0,
      hint: 'Noise points in the opposite direction of the score.',
      explanation: 'epsilon_theta(x_t, t) ~ -sigma_t * nabla_x log p_t(x). Predicting noise and estimating scores are two sides of the same coin.',
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
