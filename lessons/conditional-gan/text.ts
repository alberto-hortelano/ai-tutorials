// Bilingual text for Conditional GAN lesson

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
    lessonTitle: 'Conditional GAN',
    lessonSubtitle: 'Generacion condicionada con redes adversarias',
    scene1: {
      id: 'Generacion condicional',
      narration: 'Una GAN estandar genera imagenes aleatorias, como un pintor que decide el tema solo. Una cGAN recibe instrucciones: genera un gato, no un perro. Le damos al generador ruido z mas una etiqueta y, y el generador obedece produciendo una imagen de esa clase especifica.',
      subtitleCues: [
        { time: 0.0, text: 'GAN estandar: genera "cualquier cosa"' },
        { time: 0.12, text: 'Como un pintor que decide el tema solo' },
        { time: 0.25, text: 'cGAN: genera lo que le pidas' },
        { time: 0.4, text: 'Entrada: ruido z + etiqueta y' },
        { time: 0.55, text: 'Ejemplo: y = "7" => imagen de un 7' },
        { time: 0.7, text: 'El generador obedece la instruccion' },
        { time: 0.85, text: 'Control preciso sobre la generacion' },
      ],
      topic: 'Generacion condicional: G(z,y) genera muestras de la clase y. Motivacion: control sobre la generacion.',
      title: 'Generacion condicional',
      noiseLabel: 'z ~ N(0,I)',
      labelTag: 'y = "7"',
      outputLabel: 'Imagen de clase 7',
      unconditional: 'GAN estandar: genera cualquiera',
      conditional: 'cGAN: genera clase especifica',
    },
    scene2: {
      id: 'Arquitectura cGAN',
      narration: 'En la cGAN, el generador recibe z concatenado con y: el ruido mas la instruccion. El discriminador recibe la imagen x junto con y, y debe juzgar dos cosas: la imagen es real y es consistente con la etiqueta. Es como un critico de arte que verifica autenticidad y que el tema coincida con el encargo.',
      subtitleCues: [
        { time: 0.0, text: 'G recibe (z, y) concatenados' },
        { time: 0.12, text: 'Ruido mas instruccion: materia prima + orden' },
        { time: 0.25, text: 'D recibe (x, y) y juzga calidad + consistencia' },
        { time: 0.4, text: 'Critico de arte: autenticidad + tema correcto' },
        { time: 0.55, text: 'Ambas redes condicionadas en y' },
        { time: 0.7, text: 'El juego minimax ahora incluye la condicion' },
        { time: 0.85, text: 'min_G max_D V(D, G, y)' },
      ],
      topic: 'Arquitectura cGAN. G(z,y), D(x,y). El discriminador verifica calidad y consistencia con la etiqueta.',
      title: 'Arquitectura cGAN',
      gBlock: 'G',
      dBlock: 'D',
      zInput: 'z',
      yInput: 'y',
      xFake: 'x_fake',
      xReal: 'x_real',
      dOutput: 'Real/Fake + consistente con y?',
    },
    scene3: {
      id: 'Embedding de etiquetas',
      narration: 'La etiqueta y no entra como numero crudo. Primero se transforma con una matriz de embedding, como traducir una palabra a un vector de significado. El vector one-hot pasa por una capa lineal que produce un vector denso e de y, listo para concatenarse con z o con las features intermedias.',
      subtitleCues: [
        { time: 0.0, text: 'One-hot y => embedding matrix => e(y)' },
        { time: 0.12, text: 'Como traducir una palabra a vector de significado' },
        { time: 0.25, text: 'Capa lineal: W_emb transforma one-hot a denso' },
        { time: 0.4, text: 'Vector denso de dimension d' },
        { time: 0.55, text: 'Concatenar con z o con features intermedias' },
        { time: 0.7, text: 'Cada clase tiene su propio vector aprendido' },
        { time: 0.85, text: 'El embedding captura relaciones entre clases' },
      ],
      topic: 'Label embedding: one-hot a vector denso via embedding matrix. Concatenacion con latent o features.',
      title: 'Embedding de etiquetas',
      oneHotLabel: 'One-hot',
      embMatLabel: 'W_emb',
      denseLabel: 'e(y)',
      concatLabel: 'concat(z, e(y))',
    },
    scene4: {
      id: 'Discriminador de proyeccion',
      narration: 'El discriminador de proyeccion es mas elegante que concatenar. Calcula el producto interno entre features de la imagen y el embedding de la clase. Es como preguntar cuanto se alinean la imagen y la etiqueta en un espacio compartido. Produce mejores gradientes y generacion mas nitida.',
      subtitleCues: [
        { time: 0.0, text: 'D(x,y) = sigma(phi(x)^T e(y) + psi(x))' },
        { time: 0.12, text: 'Producto interno en vez de concatenacion' },
        { time: 0.25, text: 'Cuanto se alinean imagen y etiqueta?' },
        { time: 0.4, text: 'phi(x): features de la imagen' },
        { time: 0.55, text: 'e(y): embedding de la clase' },
        { time: 0.7, text: 'Alineacion en espacio compartido' },
        { time: 0.85, text: 'Mejores gradientes, generacion mas nitida' },
      ],
      topic: 'Projection discriminator: D(x,y) = sigma(phi(x)^T e(y) + psi(x)). Inner product vs concatenation.',
      title: 'Discriminador de proyeccion',
      phiLabel: 'phi(x)',
      eyLabel: 'e(y)',
      dotLabel: 'phi(x)^T e(y)',
      psiLabel: '+ psi(x)',
      sigmaLabel: 'sigma(...)',
      concatAlt: 'Concatenacion (clasico)',
      projAlt: 'Proyeccion (mejor)',
    },
    scene5: {
      id: 'Generacion por clase',
      narration: 'El resultado es un generador que produce imagenes diversas dentro de cada clase. Fijando y y variando z, obtenemos variaciones del mismo concepto, como diferentes poses del mismo animal. Cada fila del grid muestra una clase, cada columna una variacion aleatoria.',
      subtitleCues: [
        { time: 0.0, text: 'Grid: filas = clases, columnas = variaciones' },
        { time: 0.12, text: 'y fijo, z varia: diferentes poses del mismo animal' },
        { time: 0.25, text: 'Diversidad dentro de cada clase' },
        { time: 0.4, text: 'Misma clase comparte caracteristicas globales' },
        { time: 0.55, text: 'z controla detalles: pose, iluminacion, textura' },
        { time: 0.7, text: 'Diferente clase: cambia completamente' },
        { time: 0.85, text: 'y controla "que", z controla "como"' },
      ],
      topic: 'Generacion clase-especifica. Grid de clases x variaciones. z controla variacion, y controla clase.',
      title: 'Generacion por clase',
      classLabel: 'Clase',
      varLabel: 'Variaciones (z)',
      rowLabels: '0,1,2,3',
    },
    scene6: {
      id: 'Interpolacion latente',
      narration: 'CycleGAN lleva la idea mas lejos: traduce entre dominios sin pares. Convierte un caballo en cebra y de vuelta. El ciclo debe recuperar el original, como traducir del espanol al ingles y de regreso. Si el caballo original se pierde, la traduccion fallo.',
      subtitleCues: [
        { time: 0.0, text: 'CycleGAN: traduccion entre dominios sin pares' },
        { time: 0.12, text: 'Caballo -> Cebra -> Caballo: ciclo completo' },
        { time: 0.15, text: 'Como traducir espanol -> ingles -> espanol' },
        { time: 0.4, text: 'Cycle consistency: el original debe sobrevivir' },
        { time: 0.55, text: 'Si el caballo se pierde, la traduccion fallo' },
        { time: 0.7, text: 'z = "como" (estilo y detalles)' },
        { time: 0.85, text: 'y = "que" (dominio: caballo vs cebra)' },
      ],
      topic: 'CycleGAN y cycle consistency. Traduccion entre dominios. z = como, y = que.',
      title: 'CycleGAN y traduccion de dominios',
      fixYLabel: 'Dominio fijo, z interpola',
      fixZLabel: 'z fijo, dominio cambia',
      smoothLabel: 'Suave',
      abruptLabel: 'Abrupto',
      whatLabel: 'y = que',
      howLabel: 'z = como',
    },
    scene7: {
      id: 'Aplicaciones',
      narration: 'Las cGANs abren un universo de aplicaciones. Pix2pix traduce bocetos en fotos realistas. Text-to-image genera imagenes a partir de descripciones como un pintor bajo demanda. Class-conditional produce imagenes de alta calidad de cualquier clase del dataset.',
      subtitleCues: [
        { time: 0.0, text: 'pix2pix: boceto => foto realista' },
        { time: 0.12, text: 'Traduccion imagen a imagen supervisada' },
        { time: 0.25, text: 'Text-to-image: descripcion => imagen' },
        { time: 0.4, text: 'Como un pintor bajo demanda' },
        { time: 0.55, text: 'Class-conditional: clase => imagen de alta calidad' },
        { time: 0.7, text: 'BigGAN, StyleGAN: resultados impresionantes' },
        { time: 0.85, text: 'Condicion = control preciso sobre la generacion' },
      ],
      topic: 'Aplicaciones de cGAN: pix2pix, text-to-image, class-conditional generation.',
      title: 'Aplicaciones',
      pix2pixTitle: 'pix2pix',
      pix2pixDesc: 'Imagen => Imagen',
      textImgTitle: 'Text-to-Image',
      textImgDesc: 'Texto => Imagen',
      classCondTitle: 'Class-Conditional',
      classCondDesc: 'Clase => Imagen',
    },
  },
  en: {
    lessonTitle: 'Conditional GAN',
    lessonSubtitle: 'Conditioned generation with adversarial networks',
    scene1: {
      id: 'Conditional generation',
      narration: 'A standard GAN generates random images, like a painter who picks the subject alone. A cGAN takes orders: generate a cat, not a dog. We give the generator noise z plus a label y, and the generator obeys, producing an image of that specific class.',
      subtitleCues: [
        { time: 0.0, text: 'Standard GAN: generates "anything"' },
        { time: 0.12, text: 'Like a painter who picks the subject alone' },
        { time: 0.25, text: 'cGAN: generates what you ask for' },
        { time: 0.4, text: 'Input: noise z + label y' },
        { time: 0.55, text: 'Example: y = "7" => image of a 7' },
        { time: 0.7, text: 'The generator obeys the instruction' },
        { time: 0.85, text: 'Precise control over generation' },
      ],
      topic: 'Conditional generation: G(z,y) generates samples from class y. Motivation: control over generation.',
      title: 'Conditional generation',
      noiseLabel: 'z ~ N(0,I)',
      labelTag: 'y = "7"',
      outputLabel: 'Image of class 7',
      unconditional: 'Standard GAN: generates anything',
      conditional: 'cGAN: generates specific class',
    },
    scene2: {
      id: 'cGAN architecture',
      narration: 'In cGAN, the generator receives z concatenated with y: the noise plus the instruction. The discriminator receives image x together with y, and must judge two things: is the image real and is it consistent with the label. It is like an art critic who verifies authenticity and that the subject matches the commission.',
      subtitleCues: [
        { time: 0.0, text: 'G receives (z, y) concatenated' },
        { time: 0.12, text: 'Noise plus instruction: raw material + order' },
        { time: 0.25, text: 'D receives (x, y) and judges quality + consistency' },
        { time: 0.4, text: 'Art critic: authenticity + correct subject' },
        { time: 0.55, text: 'Both networks conditioned on y' },
        { time: 0.7, text: 'The minimax game now includes the condition' },
        { time: 0.85, text: 'min_G max_D V(D, G, y)' },
      ],
      topic: 'cGAN architecture. G(z,y), D(x,y). Discriminator verifies quality and label consistency.',
      title: 'cGAN architecture',
      gBlock: 'G',
      dBlock: 'D',
      zInput: 'z',
      yInput: 'y',
      xFake: 'x_fake',
      xReal: 'x_real',
      dOutput: 'Real/Fake + consistent with y?',
    },
    scene3: {
      id: 'Label embedding',
      narration: 'The label y does not enter as a raw number. First it is transformed with an embedding matrix, like translating a word into a meaning vector. The one-hot vector passes through a linear layer that produces a dense vector e of y, ready to be concatenated with z or intermediate features.',
      subtitleCues: [
        { time: 0.0, text: 'One-hot y => embedding matrix => e(y)' },
        { time: 0.12, text: 'Like translating a word to a meaning vector' },
        { time: 0.25, text: 'Linear layer: W_emb transforms one-hot to dense' },
        { time: 0.4, text: 'Dense vector of dimension d' },
        { time: 0.55, text: 'Concatenate with z or intermediate features' },
        { time: 0.7, text: 'Each class has its own learned vector' },
        { time: 0.85, text: 'The embedding captures relationships between classes' },
      ],
      topic: 'Label embedding: one-hot to dense vector via embedding matrix. Concatenation with latent or features.',
      title: 'Label embedding',
      oneHotLabel: 'One-hot',
      embMatLabel: 'W_emb',
      denseLabel: 'e(y)',
      concatLabel: 'concat(z, e(y))',
    },
    scene4: {
      id: 'Projection discriminator',
      narration: 'The projection discriminator is more elegant than concatenation. It computes the inner product between image features and class embedding. It is like asking how well the image and label align in a shared space. It produces better gradients and crisper generation.',
      subtitleCues: [
        { time: 0.0, text: 'D(x,y) = sigma(phi(x)^T e(y) + psi(x))' },
        { time: 0.12, text: 'Inner product instead of concatenation' },
        { time: 0.25, text: 'How well do image and label align?' },
        { time: 0.4, text: 'phi(x): image features' },
        { time: 0.55, text: 'e(y): class embedding' },
        { time: 0.7, text: 'Alignment in shared space' },
        { time: 0.85, text: 'Better gradients, crisper generation' },
      ],
      topic: 'Projection discriminator: D(x,y) = sigma(phi(x)^T e(y) + psi(x)). Inner product vs concatenation.',
      title: 'Projection discriminator',
      phiLabel: 'phi(x)',
      eyLabel: 'e(y)',
      dotLabel: 'phi(x)^T e(y)',
      psiLabel: '+ psi(x)',
      sigmaLabel: 'sigma(...)',
      concatAlt: 'Concatenation (classic)',
      projAlt: 'Projection (better)',
    },
    scene5: {
      id: 'Class-specific generation',
      narration: 'The result is a generator that produces diverse images within each class. Fixing y and varying z, we get variations of the same concept, like different poses of the same animal. Each grid row shows a class, each column a random variation.',
      subtitleCues: [
        { time: 0.0, text: 'Grid: rows = classes, columns = variations' },
        { time: 0.12, text: 'y fixed, z varies: different poses of same animal' },
        { time: 0.25, text: 'Diversity within each class' },
        { time: 0.4, text: 'Same class shares global characteristics' },
        { time: 0.55, text: 'z controls details: pose, lighting, texture' },
        { time: 0.7, text: 'Different class: changes completely' },
        { time: 0.85, text: 'y controls "what", z controls "how"' },
      ],
      topic: 'Class-specific generation. Grid of classes x variations. z controls variation, y controls class.',
      title: 'Class-specific generation',
      classLabel: 'Class',
      varLabel: 'Variations (z)',
      rowLabels: '0,1,2,3',
    },
    scene6: {
      id: 'CycleGAN and domain translation',
      narration: 'CycleGAN takes the idea further: it translates between domains without paired examples. It converts a horse into a zebra and back. The cycle must recover the original, like translating from Spanish to English and back again. If the original horse is lost, the translation failed.',
      subtitleCues: [
        { time: 0.0, text: 'CycleGAN: unpaired domain translation' },
        { time: 0.12, text: 'Horse -> Zebra -> Horse: full cycle' },
        { time: 0.25, text: 'Like translating Spanish -> English -> Spanish' },
        { time: 0.4, text: 'Cycle consistency: the original must survive' },
        { time: 0.55, text: 'If the horse is lost, translation failed' },
        { time: 0.7, text: 'z = "how" (style and details)' },
        { time: 0.85, text: 'y = "what" (domain: horse vs zebra)' },
      ],
      topic: 'CycleGAN and cycle consistency. Domain translation. z = how, y = what.',
      title: 'CycleGAN and domain translation',
      fixYLabel: 'Domain fixed, z interpolates',
      fixZLabel: 'z fixed, domain changes',
      smoothLabel: 'Smooth',
      abruptLabel: 'Abrupt',
      whatLabel: 'y = what',
      howLabel: 'z = how',
    },
    scene7: {
      id: 'Applications',
      narration: 'cGANs open a universe of applications. Pix2pix translates sketches into realistic photos. Text-to-image generates images from descriptions like a painter on demand. Class-conditional produces high quality images of any class in the dataset.',
      subtitleCues: [
        { time: 0.0, text: 'pix2pix: sketch => realistic photo' },
        { time: 0.12, text: 'Supervised image-to-image translation' },
        { time: 0.25, text: 'Text-to-image: description => image' },
        { time: 0.4, text: 'Like a painter on demand' },
        { time: 0.55, text: 'Class-conditional: class => high quality image' },
        { time: 0.7, text: 'BigGAN, StyleGAN: impressive results' },
        { time: 0.85, text: 'Condition = precise control over generation' },
      ],
      topic: 'cGAN applications: pix2pix, text-to-image, class-conditional generation.',
      title: 'Applications',
      pix2pixTitle: 'pix2pix',
      pix2pixDesc: 'Image => Image',
      textImgTitle: 'Text-to-Image',
      textImgDesc: 'Text => Image',
      classCondTitle: 'Class-Conditional',
      classCondDesc: 'Class => Image',
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
      question: 'En una cGAN, el discriminador debe verificar dos cosas. Cuales son?',
      choices: [
        'Que la imagen sea de alta resolucion y que tenga colores realistas',
        'Que la imagen sea real (no generada) y que sea consistente con la etiqueta y',
        'Que el generador converja y que la loss disminuya',
        'Que z y y sean independientes y que la imagen sea unica',
      ],
      correctIndex: 1,
      hint: 'El discriminador recibe tanto la imagen x como la etiqueta y. Debe juzgar calidad y consistencia.',
      explanation: 'D(x,y) verifica dos aspectos: que la imagen sea autentica (real, no generada) y que sea consistente con la etiqueta y. Un siete perfecto pero etiquetado como tres debe ser rechazado.',
    },
    afterScene6: {
      question: 'En CycleGAN, que garantiza la cycle consistency loss?',
      choices: [
        'Que G y D converjan al mismo tiempo',
        'Que traducir de un dominio al otro y regresar recupere la imagen original',
        'Que las imagenes generadas tengan alta resolucion',
        'Que no haya mode collapse en ninguno de los dos generadores',
      ],
      correctIndex: 1,
      hint: 'Piensa en la analogia de la traduccion: espanol -> ingles -> espanol debe devolver el texto original.',
      explanation: 'La cycle consistency loss penaliza cuando la traduccion de ida y vuelta no recupera la imagen original. Caballo -> cebra -> caballo debe devolver el caballo original. Esto evita que los generadores inventen contenido arbitrario.',
    },
  },
  en: {
    afterScene4: {
      question: 'In a cGAN, the discriminator must verify two things. What are they?',
      choices: [
        'That the image is high resolution and has realistic colors',
        'That the image is real (not generated) and consistent with the label y',
        'That the generator converges and the loss decreases',
        'That z and y are independent and the image is unique',
      ],
      correctIndex: 1,
      hint: 'The discriminator receives both image x and label y. It must judge quality and consistency.',
      explanation: 'D(x,y) verifies two aspects: that the image is authentic (real, not generated) and consistent with label y. A perfect seven labeled as three should be rejected.',
    },
    afterScene6: {
      question: 'In CycleGAN, what does the cycle consistency loss guarantee?',
      choices: [
        'That G and D converge at the same time',
        'That translating from one domain to another and back recovers the original image',
        'That generated images have high resolution',
        'That there is no mode collapse in either generator',
      ],
      correctIndex: 1,
      hint: 'Think about the translation analogy: Spanish -> English -> Spanish should return the original text.',
      explanation: 'The cycle consistency loss penalizes when the round-trip translation does not recover the original image. Horse -> zebra -> horse must return the original horse. This prevents generators from inventing arbitrary content.',
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
