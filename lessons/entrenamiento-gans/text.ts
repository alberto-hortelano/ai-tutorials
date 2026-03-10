// Bilingual text for Training GANs lesson

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
    lessonTitle: 'Entrenamiento de GANs',
    lessonSubtitle: 'Gradientes, colapso de modos y trucos practicos',
    scene1: {
      id: 'Entrenamiento alternado',
      narration: 'Las GANs se entrenan como un partido de tenis: un jugador golpea, luego el otro. Primero actualizamos al discriminador k veces sobre datos reales y falsos, luego al generador una vez. El balance entre turnos es critico: demasiados pasos de D y G se queda sin senal.',
      subtitleCues: [
        { time: 0.0, text: 'Entrenamiento alternado: D y G toman turnos' },
        { time: 0.12, text: 'Como un partido de tenis: golpea uno, luego el otro' },
        { time: 0.25, text: 'D se actualiza k pasos sobre reales y falsos' },
        { time: 0.4, text: 'Luego G se actualiza un solo paso' },
        { time: 0.55, text: 'k tipicamente entre 1 y 5' },
        { time: 0.7, text: 'Balance critico: demasiado D aplasta a G' },
        { time: 0.85, text: 'Ciclo: D -> D -> ... -> G -> repetir' },
      ],
      topic: 'Entrenamiento alternado de GANs. D se actualiza k pasos, G un paso. Balance critico entre ambas redes.',
      title: 'Entrenamiento alternado',
      dBox: 'Discriminador D',
      gBox: 'Generador G',
      kSteps: 'k pasos',
      oneStep: '1 paso',
      cycleLabel: 'Ciclo de entrenamiento',
      repeatLabel: 'Repetir',
    },
    scene2: {
      id: 'Gradientes que se desvanecen',
      narration: 'El generador recibe senal precisamente cuando mas la necesita, pero no la obtiene. Si D es demasiado bueno, log de uno menos D de G de z se aplana cerca de cero. Es como un estudiante que necesita retroalimentacion pero el profesor solo dice perfecto o reprobado, sin explicar por que.',
      subtitleCues: [
        { time: 0.0, text: 'D demasiado bueno -> gradientes nulos para G' },
        { time: 0.12, text: 'G necesita senal justo cuando mas la necesita' },
        { time: 0.25, text: 'log(1 - D(G(z))) se aplana cerca de cero' },
        { time: 0.4, text: 'Como un profesor que solo dice "reprobado" sin explicar' },
        { time: 0.55, text: 'G no recibe senal de aprendizaje' },
        { time: 0.7, text: 'Paradoja: D perfecto paraliza a G' },
        { time: 0.85, text: 'La senal desaparece justo cuando G la necesita' },
      ],
      topic: 'Vanishing gradients en GANs. D demasiado fuerte aplana la loss de G. Sin senal, G no mejora.',
      title: 'Gradientes que se desvanecen',
      lossLabel: 'Loss de G',
      flatZone: 'Zona plana: sin gradiente',
      dTooGood: 'D demasiado bueno',
      desertLabel: 'Desierto sin pendiente',
      xLabel: 'D(G(z))',
      yLabel: 'log(1 - D(G(z)))',
    },
    scene3: {
      id: 'Loss no-saturante',
      narration: 'La solucion es ingeniosa: en vez de minimizar log de uno menos D, maximizamos log D de G de z. El mismo punto optimo, pero la curva tiene pendiente fuerte donde G la necesita. Es como cambiar de un termometro roto que no marca bajo cero a uno que funciona en todo el rango.',
      subtitleCues: [
        { time: 0.0, text: 'En vez de min log(1-D), max log D(G(z))' },
        { time: 0.12, text: 'Truco ingenioso: misma meta, mejor camino' },
        { time: 0.25, text: 'Mismo punto optimo' },
        { time: 0.4, text: 'Gradientes fuertes donde G es malo' },
        { time: 0.55, text: 'Termometro roto vs termometro funcional' },
        { time: 0.7, text: 'Comparacion lado a lado: plana vs empinada' },
        { time: 0.85, text: 'La loss no-saturante rescata el entrenamiento' },
      ],
      topic: 'Non-saturating loss: max log(D(G(z))) en vez de min log(1-D(G(z))). Mismo optimo, mejores gradientes.',
      title: 'Loss no-saturante',
      originalLabel: 'Original: log(1-D)',
      newLabel: 'No-saturante: -log(D)',
      strongGrad: 'Gradientes fuertes',
      weakGrad: 'Gradientes debiles',
      sameOptimum: 'Mismo punto optimo',
    },
    scene4: {
      id: 'Colapso de modos',
      narration: 'El colapso de modos es el problema mas notorio. Imagina un falsificador que descubre que un tipo de billete engana al detective, y decide fabricar solo ese. La distribucion real tiene cinco modos, pero G colapsa a uno: genera la misma cara una y otra vez, perdiendo toda diversidad.',
      subtitleCues: [
        { time: 0.0, text: 'Mode collapse: el problema mas notorio' },
        { time: 0.12, text: 'Falsificador descubre un billete que siempre funciona' },
        { time: 0.25, text: 'Solo fabrica ese tipo: pierde diversidad' },
        { time: 0.4, text: 'La distribucion real tiene multiples modos' },
        { time: 0.55, text: '5 modos -> 3 -> 1: colapso dramatico' },
        { time: 0.7, text: 'G genera la misma cara una y otra vez' },
        { time: 0.85, text: 'Diversidad perdida: solo una salida repetitiva' },
      ],
      topic: 'Mode collapse: G produce una unica salida repetidamente. Pierde diversidad de la distribucion objetivo.',
      title: 'Colapso de modos',
      targetLabel: 'Objetivo: 5 modos',
      collapseLabel: 'Colapso: 1 modo',
      mode5: '5 modos',
      mode3: '3 modos',
      mode1: '1 modo',
      failLabel: 'Diversidad perdida',
    },
    scene5: {
      id: 'Inestabilidad del entrenamiento',
      narration: 'En entrenamiento supervisado, la loss baja como una pelota rodando cuesta abajo. En GANs, las losses de G y D son como dos ninos en un columpio: cuando uno sube el otro baja, pero nunca se detienen. Las curvas oscilan sin converger, sin correlacionar con la calidad real.',
      subtitleCues: [
        { time: 0.0, text: 'Loss de G y D oscilan sin converger' },
        { time: 0.12, text: 'Como ninos en un columpio: sube uno, baja el otro' },
        { time: 0.25, text: 'Nunca se detienen en un equilibrio' },
        { time: 0.4, text: 'Supervisado: pelota rodando cuesta abajo' },
        { time: 0.55, text: 'GAN: oscilaciones caoticas' },
        { time: 0.7, text: 'La loss no correlaciona con calidad de muestras' },
        { time: 0.85, text: 'El entrenamiento adversarial es inherentemente inestable' },
      ],
      topic: 'Inestabilidad: losses de G y D oscilan. No hay convergencia monotona como en entrenamiento supervisado.',
      title: 'Inestabilidad del entrenamiento',
      ganLossD: 'Loss D (GAN)',
      ganLossG: 'Loss G (GAN)',
      supLoss: 'Loss supervisada',
      stableLabel: 'Estable: baja monotonamente',
      unstableLabel: 'Inestable: oscilaciones',
      iterLabel: 'Iteraciones',
    },
    scene6: {
      id: 'Trucos practicos',
      narration: 'Los investigadores descubrieron trucos que domestican a las GANs. Spectral normalization pone una correa a los pesos de D. Progressive growing construye la imagen de baja a alta resolucion, como pintar primero el boceto y luego los detalles. Two-timescale learning rates da ritmos diferentes a D y G.',
      subtitleCues: [
        { time: 0.0, text: 'Trucos que domestican el entrenamiento' },
        { time: 0.12, text: 'Spectral norm: correa para los pesos de D' },
        { time: 0.3, text: 'Restringe la norma espectral de cada capa' },
        { time: 0.45, text: 'Progressive growing: boceto antes que detalles' },
        { time: 0.6, text: 'De 4x4 a 8x8 a ... a 1024x1024' },
        { time: 0.75, text: 'Two-timescale LR: ritmos diferentes para D y G' },
        { time: 0.88, text: 'lr_D > lr_G: D aprende mas rapido' },
      ],
      topic: 'Trucos practicos: spectral normalization, progressive growing, two-timescale learning rates.',
      title: 'Trucos practicos',
      trick1: 'Spectral Normalization',
      trick1Desc: 'Restringir norma espectral de D',
      trick2: 'Progressive Growing',
      trick2Desc: 'Entrenar de baja a alta resolucion',
      trick3: 'Two-Timescale LR',
      trick3Desc: 'lr_D != lr_G (tipicamente lr_D > lr_G)',
    },
    scene7: {
      id: 'Evaluando GANs',
      narration: 'Sin likelihood, como medimos la calidad? El FID, o Frechet Inception Distance, compara dos nubes de puntos en el espacio de features de Inception. Si las nubes se superponen, FID es bajo y las imagenes son buenas. Es como comparar la firma quimica de vinos: si huelen igual, el falsificador triunfo.',
      subtitleCues: [
        { time: 0.0, text: 'Sin likelihood, como evaluar la calidad?' },
        { time: 0.12, text: 'FID: Frechet Inception Distance' },
        { time: 0.25, text: 'Extrae features con red Inception' },
        { time: 0.4, text: 'Compara nubes de features reales vs generadas' },
        { time: 0.55, text: 'Como comparar firmas quimicas de vinos' },
        { time: 0.7, text: 'Nubes superpuestas = bajo FID = buena calidad' },
        { time: 0.85, text: 'Menor FID = mejor generador' },
      ],
      topic: 'Evaluacion de GANs: FID (Frechet Inception Distance). Distancia entre distribuciones de features. Sin likelihood explicita.',
      title: 'Evaluando GANs',
      noLikelihood: 'Sin likelihood!',
      fidLabel: 'FID (Frechet Inception Distance)',
      realCloud: 'Features reales',
      fakeCloud: 'Features generadas',
      lowerBetter: 'Menor FID = Mejor calidad',
      featureSpace: 'Feature space',
    },
  },
  en: {
    lessonTitle: 'Training GANs',
    lessonSubtitle: 'Gradients, mode collapse and practical tricks',
    scene1: {
      id: 'Alternating training',
      narration: 'GANs train like a tennis match: one player hits, then the other. First we update the discriminator k times on real and fake data, then the generator once. The balance between turns is critical: too many D steps and G starves for signal.',
      subtitleCues: [
        { time: 0.0, text: 'Alternating training: D and G take turns' },
        { time: 0.12, text: 'Like a tennis match: one hits, then the other' },
        { time: 0.25, text: 'D updates k steps on real and fake data' },
        { time: 0.4, text: 'Then G updates for one step' },
        { time: 0.55, text: 'k typically between 1 and 5' },
        { time: 0.7, text: 'Critical balance: too much D crushes G' },
        { time: 0.85, text: 'Cycle: D -> D -> ... -> G -> repeat' },
      ],
      topic: 'Alternating GAN training. D updates k steps, G one step. Critical balance between both networks.',
      title: 'Alternating training',
      dBox: 'Discriminator D',
      gBox: 'Generator G',
      kSteps: 'k steps',
      oneStep: '1 step',
      cycleLabel: 'Training cycle',
      repeatLabel: 'Repeat',
    },
    scene2: {
      id: 'Vanishing gradients',
      narration: 'The generator needs signal precisely when it needs it most, but cannot get it. If D is too good, log of one minus D of G of z flattens near zero. It is like a student who needs feedback, but the teacher only says pass or fail without explaining why.',
      subtitleCues: [
        { time: 0.0, text: 'D too good -> near-zero gradients for G' },
        { time: 0.12, text: 'G needs signal exactly when it needs it most' },
        { time: 0.25, text: 'log(1 - D(G(z))) flattens near zero' },
        { time: 0.4, text: 'Like a teacher who only says "fail" without explanation' },
        { time: 0.55, text: 'G receives no learning signal' },
        { time: 0.7, text: 'Paradox: perfect D paralyzes G' },
        { time: 0.85, text: 'Signal vanishes right when G needs it' },
      ],
      topic: 'Vanishing gradients in GANs. D too strong flattens G loss. Without signal, G cannot improve.',
      title: 'Vanishing gradients',
      lossLabel: 'G Loss',
      flatZone: 'Flat zone: no gradient',
      dTooGood: 'D too good',
      desertLabel: 'Desert with no slope',
      xLabel: 'D(G(z))',
      yLabel: 'log(1 - D(G(z)))',
    },
    scene3: {
      id: 'Non-saturating loss',
      narration: 'The fix is clever: instead of minimizing log of one minus D, maximize log D of G of z. Same optimum, but the curve has a steep slope exactly where G needs it. It is like swapping a broken thermometer that does not read below zero for one that works across the full range.',
      subtitleCues: [
        { time: 0.0, text: 'Instead of min log(1-D), max log D(G(z))' },
        { time: 0.12, text: 'Clever trick: same goal, better path' },
        { time: 0.25, text: 'Same optimum point' },
        { time: 0.4, text: 'Strong gradients where G is bad' },
        { time: 0.55, text: 'Broken thermometer vs functional thermometer' },
        { time: 0.7, text: 'Side-by-side: flat vs steep' },
        { time: 0.85, text: 'Non-saturating loss rescues training' },
      ],
      topic: 'Non-saturating loss: max log(D(G(z))) instead of min log(1-D(G(z))). Same optimum, better gradients.',
      title: 'Non-saturating loss',
      originalLabel: 'Original: log(1-D)',
      newLabel: 'Non-saturating: -log(D)',
      strongGrad: 'Strong gradients',
      weakGrad: 'Weak gradients',
      sameOptimum: 'Same optimum point',
    },
    scene4: {
      id: 'Mode collapse',
      narration: 'Mode collapse is the most notorious problem. Imagine a counterfeiter who discovers one type of bill that always fools the detective, and decides to make only that. The real distribution has five modes, but G collapses to one: it generates the same face over and over, losing all diversity.',
      subtitleCues: [
        { time: 0.0, text: 'Mode collapse: the most notorious problem' },
        { time: 0.12, text: 'Counterfeiter discovers one bill that always works' },
        { time: 0.25, text: 'Makes only that type: loses diversity' },
        { time: 0.4, text: 'Real distribution has multiple modes' },
        { time: 0.55, text: '5 modes -> 3 -> 1: dramatic collapse' },
        { time: 0.7, text: 'G generates the same face over and over' },
        { time: 0.85, text: 'Diversity lost: only repetitive output' },
      ],
      topic: 'Mode collapse: G produces a single output repeatedly. Loses diversity of the target distribution.',
      title: 'Mode collapse',
      targetLabel: 'Target: 5 modes',
      collapseLabel: 'Collapse: 1 mode',
      mode5: '5 modes',
      mode3: '3 modes',
      mode1: '1 mode',
      failLabel: 'Diversity lost',
    },
    scene5: {
      id: 'Training instability',
      narration: 'In supervised training, loss rolls downhill like a ball. In GANs, the losses of G and D are like two kids on a seesaw: when one goes up the other goes down, but they never stop. The curves oscillate without converging, without correlating with actual sample quality.',
      subtitleCues: [
        { time: 0.0, text: 'G and D losses oscillate without converging' },
        { time: 0.12, text: 'Like kids on a seesaw: one up, one down' },
        { time: 0.25, text: 'They never settle into equilibrium' },
        { time: 0.4, text: 'Supervised: ball rolling downhill' },
        { time: 0.55, text: 'GAN: chaotic oscillations' },
        { time: 0.7, text: 'Loss does not correlate with sample quality' },
        { time: 0.85, text: 'Adversarial training is inherently unstable' },
      ],
      topic: 'Instability: G and D losses oscillate. No monotonic convergence like supervised training.',
      title: 'Training instability',
      ganLossD: 'Loss D (GAN)',
      ganLossG: 'Loss G (GAN)',
      supLoss: 'Supervised loss',
      stableLabel: 'Stable: decreases monotonically',
      unstableLabel: 'Unstable: oscillations',
      iterLabel: 'Iterations',
    },
    scene6: {
      id: 'Practical tricks',
      narration: 'Researchers discovered tricks that tame GANs. Spectral normalization puts a leash on D weights. Progressive growing builds the image from low to high resolution, like sketching the outline before adding details. Two-timescale learning rates gives D and G different rhythms.',
      subtitleCues: [
        { time: 0.0, text: 'Tricks that tame the training' },
        { time: 0.12, text: 'Spectral norm: a leash for D weights' },
        { time: 0.3, text: 'Constrains spectral norm of each layer' },
        { time: 0.45, text: 'Progressive growing: sketch before details' },
        { time: 0.6, text: 'From 4x4 to 8x8 to ... to 1024x1024' },
        { time: 0.75, text: 'Two-timescale LR: different rhythms for D and G' },
        { time: 0.88, text: 'lr_D > lr_G: D learns faster' },
      ],
      topic: 'Practical tricks: spectral normalization, progressive growing, two-timescale learning rates.',
      title: 'Practical tricks',
      trick1: 'Spectral Normalization',
      trick1Desc: 'Constrain spectral norm of D',
      trick2: 'Progressive Growing',
      trick2Desc: 'Train from low to high resolution',
      trick3: 'Two-Timescale LR',
      trick3Desc: 'lr_D != lr_G (typically lr_D > lr_G)',
    },
    scene7: {
      id: 'Evaluating GANs',
      narration: 'Without likelihood, how do we measure quality? The FID, or Frechet Inception Distance, compares two point clouds in Inception feature space. If the clouds overlap, FID is low and the images are good. It is like comparing the chemical signature of wines: if they smell the same, the counterfeiter won.',
      subtitleCues: [
        { time: 0.0, text: 'Without likelihood, how to evaluate quality?' },
        { time: 0.12, text: 'FID: Frechet Inception Distance' },
        { time: 0.25, text: 'Extracts features with Inception network' },
        { time: 0.4, text: 'Compares real vs generated feature clouds' },
        { time: 0.55, text: 'Like comparing chemical signatures of wines' },
        { time: 0.7, text: 'Overlapping clouds = low FID = good quality' },
        { time: 0.85, text: 'Lower FID = better generator' },
      ],
      topic: 'GAN evaluation: FID (Frechet Inception Distance). Distance between feature distributions. No explicit likelihood.',
      title: 'Evaluating GANs',
      noLikelihood: 'No likelihood!',
      fidLabel: 'FID (Frechet Inception Distance)',
      realCloud: 'Real features',
      fakeCloud: 'Generated features',
      lowerBetter: 'Lower FID = Better quality',
      featureSpace: 'Feature space',
    },
  },
};

// ── Questions (bilingual) ──

export const questions: Record<Lang, {
  afterScene3: import('../../engine/types').QuestionData;
  afterScene5: import('../../engine/types').QuestionData;
}> = {
  es: {
    afterScene3: {
      question: 'La loss no-saturante reemplaza min log(1-D(G(z))) por max log(D(G(z))). Que ventaja tiene?',
      choices: [
        'Cambia el punto optimo para que G converja mas rapido',
        'Proporciona gradientes mas fuertes cuando G genera muestras malas',
        'Elimina por completo el problema del mode collapse',
        'Permite entrenar sin discriminador',
      ],
      correctIndex: 1,
      hint: 'Piensa en la pendiente de -log(D) vs log(1-D) cuando D(G(z)) es cercano a cero.',
      explanation: 'La loss no-saturante tiene la misma solucion optima pero una pendiente mucho mas pronunciada cuando D(G(z)) es cercano a cero, dando a G gradientes utiles precisamente cuando sus muestras son malas.',
    },
    afterScene5: {
      question: 'Cual de estos es un sintoma del mode collapse en GANs?',
      choices: [
        'El discriminador tiene loss creciente',
        'El generador produce muestras muy diversas pero de baja calidad',
        'El generador produce muestras repetitivas, cubriendo solo uno de los modos de la distribucion real',
        'Ambas losses convergen a cero rapidamente',
      ],
      correctIndex: 2,
      hint: 'Piensa en el falsificador que solo fabrica un tipo de billete.',
      explanation: 'El mode collapse ocurre cuando G descubre una unica salida que engana a D y la repite. Pierde diversidad: de cinco modos reales, colapsa a uno solo.',
    },
  },
  en: {
    afterScene3: {
      question: 'The non-saturating loss replaces min log(1-D(G(z))) with max log(D(G(z))). What is the advantage?',
      choices: [
        'It changes the optimum so G converges faster',
        'It provides stronger gradients when G generates bad samples',
        'It completely eliminates the mode collapse problem',
        'It allows training without a discriminator',
      ],
      correctIndex: 1,
      hint: 'Think about the slope of -log(D) vs log(1-D) when D(G(z)) is close to zero.',
      explanation: 'The non-saturating loss has the same optimal solution but a much steeper slope when D(G(z)) is near zero, giving G useful gradients precisely when its samples are poor.',
    },
    afterScene5: {
      question: 'Which of these is a symptom of mode collapse in GANs?',
      choices: [
        'The discriminator has increasing loss',
        'The generator produces very diverse but low quality samples',
        'The generator produces repetitive samples, covering only one mode of the real distribution',
        'Both losses converge to zero quickly',
      ],
      correctIndex: 2,
      hint: 'Think about the counterfeiter who only makes one type of bill.',
      explanation: 'Mode collapse happens when G discovers one single output that fools D and repeats it. It loses diversity: from five real modes, it collapses to just one.',
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
