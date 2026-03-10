// Bilingual text for GANs: the Min-Max Game lesson

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
    lessonTitle: 'GANs: el Juego Min-Max',
    lessonSubtitle: 'Generador vs Discriminador y la conexion con Jensen-Shannon',
    scene1: {
      id: 'Un nuevo paradigma',
      narration: 'Hasta ahora, todos los modelos generativos seguian el mismo camino: maximizar la verosimilitud. Las GANs rompen ese molde por completo. En vez de calcular probabilidades, plantean un duelo: dos redes compitiendo entre si, como un falsificador de billetes contra un detective.',
      subtitleCues: [
        { time: 0.0, text: 'Todos los modelos anteriores optimizan likelihood' },
        { time: 0.15, text: 'AR, VAE, Flows: el hilo de la verosimilitud' },
        { time: 0.3, text: 'GANs rompen el paradigma por completo' },
        { time: 0.45, text: 'Sin likelihood explicita' },
        { time: 0.6, text: 'En vez de probabilidades: un duelo adversarial' },
        { time: 0.75, text: 'Falsificador vs Detective: dos redes compiten' },
        { time: 0.85, text: 'Generador vs Discriminador: un juego de dos jugadores' },
      ],
      topic: 'Cambio de paradigma: de likelihood a competencia adversarial. GANs introducen generador vs discriminador.',
      title: 'Un nuevo paradigma',
      arLabel: 'AR Models',
      vaeLabel: 'VAEs',
      flowLabel: 'Flows',
      likelihoodThread: 'Hilo: maximizar likelihood',
      gansLabel: 'GANs',
      vsLabel: 'G vs D',
      breakLabel: 'Sin likelihood explicita',
    },
    scene2: {
      id: 'El Generador',
      narration: 'El generador es como un artista falsificador. Toma ruido aleatorio z, una bola de arcilla sin forma, y la moldea en algo que parece real. La red G theta define una distribucion implicita p_g que nunca calculamos, solo muestreamos de ella.',
      subtitleCues: [
        { time: 0.0, text: 'G toma ruido z ~ N(0, I)' },
        { time: 0.15, text: 'Como arcilla sin forma: materia prima aleatoria' },
        { time: 0.3, text: 'x_fake = G_theta(z): moldea el ruido en datos' },
        { time: 0.45, text: 'La red transforma el espacio latente al espacio de datos' },
        { time: 0.6, text: 'Define una distribucion implicita p_g' },
        { time: 0.75, text: 'Nunca calculamos p_g(x), solo generamos muestras' },
        { time: 0.88, text: 'Artista falsificador: crea sin saber la receta exacta' },
      ],
      topic: 'El generador G_theta transforma ruido z~N(0,I) en datos. Distribucion implicita p_g. No requiere densidad explicita.',
      title: 'El Generador',
      noiseLabel: 'z ~ N(0, I)',
      gBox: 'G_theta',
      outputLabel: 'x_fake',
      implicitLabel: 'Distribucion implicita p_g',
    },
    scene3: {
      id: 'El Discriminador',
      narration: 'El discriminador es el detective del juego. Examina cada muestra y emite un veredicto: real o falsa, con una probabilidad entre cero y uno. Con cada ronda de entrenamiento, su ojo se vuelve mas agudo, como un experto que distingue un Picasso autentico de una copia.',
      subtitleCues: [
        { time: 0.0, text: 'D(x) pertenece a [0, 1]: probabilidad de ser real' },
        { time: 0.15, text: 'Clasificador binario: real vs falso' },
        { time: 0.3, text: 'El detective examina cada muestra con lupa' },
        { time: 0.45, text: 'Datos reales -> D alto, falsos -> D bajo' },
        { time: 0.6, text: 'Como un experto que distingue Picasso autentico de copia' },
        { time: 0.75, text: 'La frontera de decision se afila con entrenamiento' },
        { time: 0.88, text: 'Cada ronda, el ojo del detective se agudiza' },
      ],
      topic: 'Discriminador D(x) en [0,1]. Clasificador binario real vs fake. Frontera de decision mejora iterativamente.',
      title: 'El Discriminador',
      realLabel: 'Reales',
      fakeLabel: 'Falsos',
      dBox: 'D(x)',
      highLabel: 'D -> 1',
      lowLabel: 'D -> 0',
      boundaryLabel: 'Frontera de decision',
    },
    scene4: {
      id: 'Objetivo Minimax',
      narration: 'El corazon de las GANs es un juego de suma cero. El discriminador maximiza V, empujando ambos terminos hacia arriba. El generador minimiza V, empujando el segundo hacia abajo. Es como un tira y afloja donde la cuerda es el valor de V.',
      subtitleCues: [
        { time: 0.0, text: 'min_G max_D V(G, D)' },
        { time: 0.15, text: 'D maximiza: E[log D(x)] + E[log(1 - D(G(z)))]' },
        { time: 0.3, text: 'Primer termino: premiar deteccion de reales' },
        { time: 0.45, text: 'Segundo termino: premiar deteccion de falsos' },
        { time: 0.6, text: 'G minimiza el segundo termino: enganar a D' },
        { time: 0.75, text: 'Tira y afloja: la cuerda es V' },
        { time: 0.88, text: 'Juego de suma cero entre dos adversarios' },
      ],
      topic: 'Objetivo minimax: min_G max_D V(G,D) = E[log D(x)] + E[log(1-D(G(z)))]. D sube ambos, G baja el segundo.',
      title: 'Objetivo Minimax',
      term1: 'E_{x~p_data}[log D(x)]',
      term2: 'E_{z~p_z}[log(1 - D(G(z)))]',
      dPushes: 'D maximiza ambos',
      gPushes: 'G minimiza este',
      zeroSum: 'Juego de suma cero',
    },
    scene5: {
      id: 'Discriminador Optimo',
      narration: 'Si fijamos al falsificador, el detective optimo tiene una formula exacta. D estrella de x es p data sobre p data mas p g, como una balanza que pesa evidencia real contra falsa. Cuando el falsificador es perfecto, la balanza queda en equilibrio: D estrella vale un medio en todas partes.',
      subtitleCues: [
        { time: 0.0, text: 'D*(x) = p_data(x) / (p_data(x) + p_g(x))' },
        { time: 0.15, text: 'Formula cerrada para G fijo' },
        { time: 0.3, text: 'Balanza: pesa evidencia real contra falsa' },
        { time: 0.45, text: 'Donde p_data domina, D* se acerca a 1' },
        { time: 0.6, text: 'Donde p_g domina, D* se acerca a 0' },
        { time: 0.75, text: 'Si p_g = p_data, la balanza esta en equilibrio' },
        { time: 0.88, text: 'D* = 0.5 en todas partes: no distingue real de falso' },
      ],
      topic: 'Discriminador optimo D*(x) = p_data/(p_data+p_g). Cuando p_g=p_data, D*=1/2. Forma cerrada.',
      title: 'El Discriminador Optimo',
      formula: 'D*(x) = p_data(x) / (p_data(x) + p_g(x))',
      pDataLabel: 'p_data',
      pGLabel: 'p_g',
      dStarLabel: 'D*',
      halfLine: 'D* = 0.5 (equilibrio)',
    },
    scene6: {
      id: 'Conexion con JSD',
      narration: 'Al sustituir D estrella en V, aparece algo bello: V optimo es dos veces la Jensen-Shannon menos log cuatro. La JSD mezcla ambas distribuciones a partes iguales y mide la diferencia simetricamente. Cuando p g iguala p data, la JSD es cero y V toca su piso de menos log cuatro.',
      subtitleCues: [
        { time: 0.0, text: 'Sustituir D* en V revela la JSD' },
        { time: 0.15, text: 'V(G, D*) = 2 * JSD(p_data, p_g) - log 4' },
        { time: 0.3, text: 'JSD: promedio simetrico de KLs' },
        { time: 0.45, text: 'M = (P + Q)/2: mezcla equitativa' },
        { time: 0.6, text: 'JSD mide diferencia simetrica via la mezcla' },
        { time: 0.75, text: 'JSD = 0 cuando p_g = p_data' },
        { time: 0.88, text: 'Minimo global: V = -log 4 ~ -1.386' },
      ],
      topic: 'V(G,D*) = 2*JSD(p_data,p_g) - log4. JSD es KL simetrica promediada. GANs minimizan JSD implicitamente.',
      title: 'Conexion con JSD',
      vFormula: 'V(G, D*) = 2 JSD(p_data || p_g) - log 4',
      jsdFormula: 'JSD = (KL(P||M) + KL(Q||M)) / 2',
      mLabel: 'M = (P + Q) / 2',
      minValue: 'Minimo global: V = -log 4',
      insight: 'Las GANs minimizan la divergencia Jensen-Shannon',
    },
    scene7: {
      id: 'Convergencia',
      narration: 'En el optimo global, el falsificador es indistinguible de la realidad: p g iguala p data. El detective se rinde con D estrella en un medio. V toca su piso de menos log cuatro. Pero esta convergencia es teorica. En la practica, el entrenamiento puede no converger.',
      subtitleCues: [
        { time: 0.0, text: 'Optimo: p_g = p_data' },
        { time: 0.15, text: 'D* = 1/2 en todas partes' },
        { time: 0.3, text: 'V = -log 4 ~ -1.386' },
        { time: 0.45, text: 'El falsificador perfecto: indistinguible de la realidad' },
        { time: 0.6, text: 'El detective se rinde: no puede distinguir' },
        { time: 0.75, text: 'Convergencia teorica elegante' },
        { time: 0.88, text: 'Pero... el entrenamiento converge en la practica?' },
      ],
      topic: 'Convergencia teorica: p_g=p_data, D*=1/2, V=-log4. Pero la convergencia practica no esta garantizada.',
      title: 'Convergencia',
      optimum: 'Optimo global',
      pgEqualsP: 'p_g = p_data',
      dHalf: 'D* = 1/2 en todo x',
      vValue: 'V = -log 4 ~= -1.386',
      cliffhanger: 'Pero... el entrenamiento converge?',
    },
  },
  en: {
    lessonTitle: 'GANs: the Min-Max Game',
    lessonSubtitle: 'Generator vs Discriminator and the Jensen-Shannon connection',
    scene1: {
      id: 'A new paradigm',
      narration: 'Until now, every generative model followed the same path: maximize likelihood. GANs shatter that mold entirely. Instead of computing probabilities, they stage a duel: two networks competing head to head, like a counterfeiter against a detective.',
      subtitleCues: [
        { time: 0.0, text: 'All previous models optimize likelihood' },
        { time: 0.15, text: 'AR, VAE, Flows: the likelihood thread' },
        { time: 0.3, text: 'GANs shatter the paradigm entirely' },
        { time: 0.45, text: 'No explicit likelihood needed' },
        { time: 0.6, text: 'Instead of probabilities: an adversarial duel' },
        { time: 0.75, text: 'Counterfeiter vs Detective: two networks compete' },
        { time: 0.85, text: 'Generator vs Discriminator: a two-player game' },
      ],
      topic: 'Paradigm shift: from likelihood to adversarial competition. GANs introduce generator vs discriminator.',
      title: 'A new paradigm',
      arLabel: 'AR Models',
      vaeLabel: 'VAEs',
      flowLabel: 'Flows',
      likelihoodThread: 'Thread: maximize likelihood',
      gansLabel: 'GANs',
      vsLabel: 'G vs D',
      breakLabel: 'No explicit likelihood',
    },
    scene2: {
      id: 'The Generator',
      narration: 'The generator is like a master counterfeiter. It takes random noise z, a shapeless lump of clay, and sculpts it into something that looks real. The network G theta defines an implicit distribution p_g that we never compute; we only draw samples from it.',
      subtitleCues: [
        { time: 0.0, text: 'G takes noise z ~ N(0, I)' },
        { time: 0.15, text: 'Like shapeless clay: random raw material' },
        { time: 0.3, text: 'x_fake = G_theta(z): sculpts noise into data' },
        { time: 0.45, text: 'The network maps latent space to data space' },
        { time: 0.6, text: 'Defines an implicit distribution p_g' },
        { time: 0.75, text: 'We never compute p_g(x), only generate samples' },
        { time: 0.88, text: 'Master counterfeiter: creates without knowing the exact recipe' },
      ],
      topic: 'Generator G_theta transforms noise z~N(0,I) into data. Implicit distribution p_g. No explicit density required.',
      title: 'The Generator',
      noiseLabel: 'z ~ N(0, I)',
      gBox: 'G_theta',
      outputLabel: 'x_fake',
      implicitLabel: 'Implicit distribution p_g',
    },
    scene3: {
      id: 'The Discriminator',
      narration: 'The discriminator is the detective in this game. It examines each sample and issues a verdict: real or fake, as a probability between zero and one. With each training round, its eye grows sharper, like an art expert who tells a genuine Picasso from a forgery.',
      subtitleCues: [
        { time: 0.0, text: 'D(x) in [0, 1]: probability of being real' },
        { time: 0.15, text: 'Binary classifier: real vs fake' },
        { time: 0.3, text: 'The detective examines each sample under a magnifying glass' },
        { time: 0.45, text: 'Real data -> D high, fake -> D low' },
        { time: 0.6, text: 'Like an expert who tells genuine Picasso from forgery' },
        { time: 0.75, text: 'Decision boundary sharpens with training' },
        { time: 0.88, text: 'Each round, the detective eye grows keener' },
      ],
      topic: 'Discriminator D(x) in [0,1]. Binary classifier real vs fake. Decision boundary improves iteratively.',
      title: 'The Discriminator',
      realLabel: 'Real',
      fakeLabel: 'Fake',
      dBox: 'D(x)',
      highLabel: 'D -> 1',
      lowLabel: 'D -> 0',
      boundaryLabel: 'Decision boundary',
    },
    scene4: {
      id: 'Minimax Objective',
      narration: 'The heart of GANs is a zero-sum game. The discriminator maximizes V, pushing both terms upward. The generator minimizes V, dragging the second term down. Think of it as a tug-of-war where the rope is the value of V.',
      subtitleCues: [
        { time: 0.0, text: 'min_G max_D V(G, D)' },
        { time: 0.15, text: 'D maximizes: E[log D(x)] + E[log(1 - D(G(z)))]' },
        { time: 0.3, text: 'First term: reward detecting reals' },
        { time: 0.45, text: 'Second term: reward detecting fakes' },
        { time: 0.6, text: 'G minimizes the second term: fool D' },
        { time: 0.75, text: 'Tug-of-war: the rope is V' },
        { time: 0.88, text: 'Zero-sum game between two adversaries' },
      ],
      topic: 'Minimax objective: min_G max_D V(G,D) = E[log D(x)] + E[log(1-D(G(z)))]. D pushes up, G pushes down.',
      title: 'Minimax Objective',
      term1: 'E_{x~p_data}[log D(x)]',
      term2: 'E_{z~p_z}[log(1 - D(G(z)))]',
      dPushes: 'D maximizes both',
      gPushes: 'G minimizes this',
      zeroSum: 'Zero-sum game',
    },
    scene5: {
      id: 'Optimal Discriminator',
      narration: 'If we freeze the counterfeiter, the optimal detective has an exact formula. D star of x is p data over p data plus p g, like a balance scale weighing real evidence against fake. When the counterfeiter is perfect, the scale sits in equilibrium: D star equals one half everywhere.',
      subtitleCues: [
        { time: 0.0, text: 'D*(x) = p_data(x) / (p_data(x) + p_g(x))' },
        { time: 0.15, text: 'Closed form for fixed G' },
        { time: 0.3, text: 'Balance scale: weighs real vs fake evidence' },
        { time: 0.45, text: 'Where p_data dominates, D* approaches 1' },
        { time: 0.6, text: 'Where p_g dominates, D* approaches 0' },
        { time: 0.75, text: 'If p_g = p_data, the scale balances' },
        { time: 0.88, text: 'D* = 0.5 everywhere: cannot tell real from fake' },
      ],
      topic: 'Optimal discriminator D*(x) = p_data/(p_data+p_g). When p_g=p_data, D*=1/2. Closed form solution.',
      title: 'The Optimal Discriminator',
      formula: 'D*(x) = p_data(x) / (p_data(x) + p_g(x))',
      pDataLabel: 'p_data',
      pGLabel: 'p_g',
      dStarLabel: 'D*',
      halfLine: 'D* = 0.5 (equilibrium)',
    },
    scene6: {
      id: 'Connection to JSD',
      narration: 'Substituting D star into V reveals something beautiful: the optimal V is two times the Jensen-Shannon divergence minus log four. JSD blends both distributions equally and measures their difference symmetrically. When p g equals p data, JSD is zero and V hits its floor of minus log four.',
      subtitleCues: [
        { time: 0.0, text: 'Substituting D* into V reveals the JSD' },
        { time: 0.15, text: 'V(G, D*) = 2 * JSD(p_data, p_g) - log 4' },
        { time: 0.3, text: 'JSD: symmetric average of KLs' },
        { time: 0.45, text: 'M = (P + Q)/2: equal-parts blend' },
        { time: 0.6, text: 'JSD measures symmetric difference via the blend' },
        { time: 0.75, text: 'JSD = 0 when p_g = p_data' },
        { time: 0.88, text: 'Global minimum: V = -log 4 ~ -1.386' },
      ],
      topic: 'V(G,D*) = 2*JSD(p_data,p_g) - log4. JSD is symmetrized averaged KL. GANs implicitly minimize JSD.',
      title: 'Connection to JSD',
      vFormula: 'V(G, D*) = 2 JSD(p_data || p_g) - log 4',
      jsdFormula: 'JSD = (KL(P||M) + KL(Q||M)) / 2',
      mLabel: 'M = (P + Q) / 2',
      minValue: 'Global minimum: V = -log 4',
      insight: 'GANs minimize the Jensen-Shannon divergence',
    },
    scene7: {
      id: 'Convergence',
      narration: 'At the global optimum, the counterfeiter is indistinguishable from reality: p g equals p data. The detective surrenders at D star of one half. V hits its floor of minus log four. But this convergence is theoretical. In practice, training may not converge at all.',
      subtitleCues: [
        { time: 0.0, text: 'Optimum: p_g = p_data' },
        { time: 0.15, text: 'D* = 1/2 everywhere' },
        { time: 0.3, text: 'V = -log 4 ~ -1.386' },
        { time: 0.45, text: 'Perfect counterfeiter: indistinguishable from reality' },
        { time: 0.6, text: 'Detective surrenders: cannot distinguish' },
        { time: 0.75, text: 'Elegant theoretical convergence' },
        { time: 0.88, text: 'But... does training converge in practice?' },
      ],
      topic: 'Theoretical convergence: p_g=p_data, D*=1/2, V=-log4. But practical convergence is not guaranteed.',
      title: 'Convergence',
      optimum: 'Global optimum',
      pgEqualsP: 'p_g = p_data',
      dHalf: 'D* = 1/2 for all x',
      vValue: 'V = -log 4 ~= -1.386',
      cliffhanger: 'But... does training converge?',
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
      question: 'En el juego minimax de GANs, que pasa si el discriminador clasifica perfectamente (D(x)=1 para reales, D(G(z))=0 para falsos)?',
      choices: [
        'V(G,D) alcanza su maximo y G recibe gradientes fuertes',
        'V(G,D) = 0 y ambas redes estan en equilibrio',
        'El termino log(1-D(G(z))) se aplana y G no recibe gradiente util',
        'G automaticamente mejora porque D le da retroalimentacion perfecta',
      ],
      correctIndex: 2,
      hint: 'Piensa en que valor tiene log(1 - D(G(z))) cuando D(G(z)) es cercano a cero.',
      explanation: 'Cuando D es perfecto, log(1 - D(G(z))) se acerca a log(1) = 0, una zona plana sin gradiente. G no recibe senal util para mejorar. Este es el problema de vanishing gradients en GANs.',
    },
    afterScene6: {
      question: 'Si p_g = p_data (generador perfecto), cual es el valor de V(G*, D*)?',
      choices: [
        '0',
        '-log 2',
        '-log 4 (aproximadamente -1.386)',
        '-1',
      ],
      correctIndex: 2,
      hint: 'Recuerda que V(G,D*) = 2*JSD - log 4, y la JSD es cero cuando ambas distribuciones son iguales.',
      explanation: 'Cuando p_g = p_data, la JSD es cero, asi que V = 2*0 - log 4 = -log 4. Este es el minimo global del juego.',
    },
  },
  en: {
    afterScene4: {
      question: 'In the GAN minimax game, what happens if the discriminator classifies perfectly (D(x)=1 for real, D(G(z))=0 for fake)?',
      choices: [
        'V(G,D) reaches its maximum and G receives strong gradients',
        'V(G,D) = 0 and both networks are in equilibrium',
        'The term log(1-D(G(z))) flattens and G receives no useful gradient',
        'G automatically improves because D provides perfect feedback',
      ],
      correctIndex: 2,
      hint: 'Think about what value log(1 - D(G(z))) has when D(G(z)) is close to zero.',
      explanation: 'When D is perfect, log(1 - D(G(z))) approaches log(1) = 0, a flat zone with no gradient. G receives no useful signal to improve. This is the vanishing gradient problem in GANs.',
    },
    afterScene6: {
      question: 'If p_g = p_data (perfect generator), what is the value of V(G*, D*)?',
      choices: [
        '0',
        '-log 2',
        '-log 4 (approximately -1.386)',
        '-1',
      ],
      correctIndex: 2,
      hint: 'Remember that V(G,D*) = 2*JSD - log 4, and JSD is zero when both distributions are equal.',
      explanation: 'When p_g = p_data, JSD is zero, so V = 2*0 - log 4 = -log 4. This is the global minimum of the game.',
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
