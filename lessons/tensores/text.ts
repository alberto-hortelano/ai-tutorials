// Bilingual text for Tensores lesson

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
    lessonTitle: 'Tensores: La Estructura de Datos de Deep Learning',
    lessonSubtitle: 'Escalares, vectores, matrices y m\u00e1s: c\u00f3mo fluyen los datos por una red neuronal',
    scene1: {
      id: '\u00bfQu\u00e9 es un tensor?',
      narration: '\u00bfQu\u00e9 es un tensor? En el fondo, es simplemente un contenedor de n\u00fameros. Un escalar es un tensor de rango cero: un solo n\u00famero, como el valor de tu loss. Un vector es rango uno: una fila de n\u00fameros, como los logits de salida para cuatro clases. Una matriz es rango dos: filas y columnas, como los pesos de una capa lineal. Y un tensor tridimensional a\u00f1ade profundidad, como una imagen RGB con tres canales. Todo en deep learning es un tensor.',
      subtitleCues: [
        { time: 0.0, text: '\u00bfQu\u00e9 es un tensor?' },
        { time: 0.10, text: 'Escalar (rango 0): un solo n\u00famero' },
        { time: 0.27, text: 'Vector (rango 1): una fila de n\u00fameros' },
        { time: 0.47, text: 'Matriz (rango 2): filas y columnas' },
        { time: 0.72, text: 'Tensor 3D (rango 3): profundidad' },
        { time: 0.93, text: 'Todo en deep learning es un tensor' },
      ],
      topic: 'Jerarqu\u00eda de tensores: escalar, vector, matriz, tensor n-dimensional. Cada rango a\u00f1ade una dimensi\u00f3n.',
      title: '\u00bfQu\u00e9 es un tensor?',
      scalar: 'Un valor de loss',
      vector: 'Logits para 4 clases',
      matrix: 'Pesos de nn.Linear(4, 3)',
      tensor3d: 'Imagen RGB (3, H, W)',
      insight: 'Todo en deep learning es un tensor',
    },
    scene2: {
      id: 'Shape: el ADN del tensor',
      narration: 'La shape es lo m\u00e1s importante de un tensor. Describe cu\u00e1ntos elementos tiene en cada dimensi\u00f3n. Una matriz de tres filas y cuatro columnas tiene shape tres coma cuatro, dos dimensiones, y doce elementos en total. El n\u00famero de elementos es el producto de las dimensiones. Esto importa porque determina cu\u00e1ntos par\u00e1metros tiene tu modelo: una capa lineal de 784 a 256 tiene m\u00e1s de doscientos mil pesos. Los errores de shape son el bug n\u00famero uno en deep learning.',
      subtitleCues: [
        { time: 0.0, text: 'La shape describe el tama\u00f1o de cada dimensi\u00f3n' },
        { time: 0.10, text: 'shape: (3, 4) \u2014 3 filas, 4 columnas' },
        { time: 0.32, text: 'numel = producto de las dimensiones' },
        { time: 0.52, text: 'nn.Linear(784, 256): 200,704 par\u00e1metros' },
        { time: 0.77, text: 'Indexaci\u00f3n: x[fila, columna]' },
        { time: 0.96, text: 'Los errores de shape son el bug #1 en DL' },
      ],
      topic: 'Shape, ndim, numel. La shape determina par\u00e1metros. Indexaci\u00f3n de tensores.',
      title: 'Shape: el ADN del tensor',
      insight: 'Los errores de shape son el bug #1 en DL',
    },
    scene3: {
      id: 'Operaciones elemento a elemento',
      narration: 'Las operaciones m\u00e1s b\u00e1sicas en tensores act\u00faan elemento a elemento. Sumar dos matrices suma cada par de celdas correspondientes. Multiplicar por un escalar escala cada celda individualmente. Y ReLU, la activaci\u00f3n m\u00e1s com\u00fan en deep learning, simplemente pone a cero todos los valores negativos. Lo importante es que la shape de entrada siempre es igual a la de salida.',
      subtitleCues: [
        { time: 0.0, text: 'Operaciones elemento a elemento' },
        { time: 0.10, text: 'Suma: A + B, celda por celda' },
        { time: 0.37, text: 'Producto escalar: k \u00d7 A' },
        { time: 0.62, text: 'ReLU: max(0, x) \u2014 negativos a cero' },
        { time: 0.87, text: 'Misma shape de entrada = misma shape de salida' },
      ],
      topic: 'Suma, producto escalar, ReLU. Operaciones que preservan shape.',
      title: 'Operaciones elemento a elemento',
      insight: 'Misma shape de entrada = misma shape de salida',
    },
    scene4: {
      id: 'Reshape',
      narration: 'Reshape reorganiza los datos sin cambiarlos. Doce n\u00fameros pueden ser una matriz de dos por seis, de tres por cuatro, o un vector plano de doce. Las celdas se mueven de posici\u00f3n pero mantienen su orden. En la pr\u00e1ctica, reshape es esencial: cuando pasas una imagen de veintiocho por veintiocho a una capa lineal, necesitas aplanarla a un vector de setecientos ochenta y cuatro elementos. El n\u00famero total de elementos nunca cambia.',
      subtitleCues: [
        { time: 0.0, text: 'Reshape: mismos datos, nueva forma' },
        { time: 0.10, text: '12 elementos: (2,6) \u2192 (3,4) \u2192 (12,)' },
        { time: 0.32, text: 'Las celdas mantienen su orden' },
        { time: 0.52, text: 'x.view(3, 4) \u2014 nueva interpretaci\u00f3n' },
        { time: 0.72, text: 'Imagen (1,28,28) \u2192 vector (784,)' },
        { time: 0.92, text: 'numel no cambia, solo la interpretaci\u00f3n' },
      ],
      topic: 'Reshape y view. Reorganizar datos sin copiarlos. Aplanar im\u00e1genes para capas lineales.',
      title: 'Reshape: mismos datos, nueva forma',
      insight: 'numel no cambia. Solo la interpretaci\u00f3n.',
    },
    scene5: {
      id: 'Broadcasting',
      narration: 'Cuando las shapes no coinciden, PyTorch usa broadcasting: expande autom\u00e1ticamente las dimensiones menores. Si sumas una matriz de tres por cuatro con un vector de cuatro, PyTorch replica el vector en cada fila. Esto es exactamente lo que pasa cuando a\u00f1ades un bias: la capa calcula W por x para cada muestra del batch, y el bias se suma a todas autom\u00e1ticamente. Broadcasting son bucles impl\u00edcitos sin usar memoria extra.',
      subtitleCues: [
        { time: 0.0, text: 'Broadcasting: expansi\u00f3n autom\u00e1tica' },
        { time: 0.10, text: 'A (3,4) + b (4,) \u2014 \u00bfshapes incompatibles?' },
        { time: 0.32, text: 'PyTorch replica b en cada fila' },
        { time: 0.57, text: 'A + b_expandido = C (3,4)' },
        { time: 0.77, text: 'Caso real: y = Wx + b (bias broadcasting)' },
        { time: 0.93, text: 'Broadcasting = bucles impl\u00edcitos, 0 memoria extra' },
      ],
      topic: 'Broadcasting autom\u00e1tico. Reglas de expansi\u00f3n. Bias en capas lineales como ejemplo.',
      title: 'Broadcasting',
      insight: 'Broadcasting = bucles impl\u00edcitos, 0 memoria extra',
    },
    scene6: {
      id: 'Tensores como im\u00e1genes',
      narration: 'Una imagen en escala de grises no es m\u00e1s que una matriz de p\u00edxeles. Cada celda tiene un valor entre cero y uno que indica la intensidad. Una imagen MNIST tiene shape uno, veintiocho, veintiocho: un canal, veintiocho filas, veintiocho columnas. Una imagen RGB a\u00f1ade dos canales m\u00e1s: rojo, verde y azul. Cada p\u00edxel son tres n\u00fameros. Para pasar una imagen a una capa lineal, la aplanamos de veintiocho por veintiocho a setecientos ochenta y cuatro. Una imagen es solo un tensor de valores de p\u00edxel.',
      subtitleCues: [
        { time: 0.0, text: 'Tensores como im\u00e1genes' },
        { time: 0.10, text: 'P\u00edxeles = valores entre 0 y 1' },
        { time: 0.32, text: 'MNIST: shape (1, 28, 28)' },
        { time: 0.57, text: 'RGB: 3 canales \u2192 shape (3, H, W)' },
        { time: 0.80, text: 'Flatten: (1,28,28) \u2192 (784,)' },
        { time: 0.96, text: 'Una imagen es solo un tensor de p\u00edxeles' },
      ],
      topic: 'Im\u00e1genes como tensores. Escala de grises, RGB, flatten para capas lineales.',
      title: 'Tensores como im\u00e1genes',
      insight: 'Una imagen es solo un tensor de p\u00edxeles',
    },
    scene7: {
      id: 'Batches: la dimensi\u00f3n 0',
      narration: 'En la pr\u00e1ctica nunca procesamos una sola imagen. Las GPUs son masivamente paralelas: pueden procesar sesenta y cuatro im\u00e1genes casi en el mismo tiempo que una. Por eso agrupamos las muestras en batches. El batch siempre es la dimensi\u00f3n cero. Un batch de sesenta y cuatro im\u00e1genes MNIST tiene shape sesenta y cuatro, uno, veintiocho, veintiocho: batch, canales, alto, ancho. Son m\u00e1s de cincuenta mil n\u00fameros, pero la GPU los procesa todos en paralelo.',
      subtitleCues: [
        { time: 0.0, text: 'Batches: la dimensi\u00f3n 0' },
        { time: 0.10, text: 'Una sola imagen: (1, 28, 28)' },
        { time: 0.32, text: 'Apilar varias: (4, 1, 28, 28)' },
        { time: 0.57, text: 'GPU: 64 im\u00e1genes tan r\u00e1pido como 1' },
        { time: 0.80, text: '(Batch, Channels, Height, Width)' },
        { time: 0.93, text: 'dim 0 siempre es el batch en PyTorch' },
      ],
      topic: 'Batches para paralelismo en GPU. Convenci\u00f3n (B, C, H, W).',
      title: 'Batches: la dimensi\u00f3n 0',
      insight: 'dim 0 siempre es el batch en PyTorch',
    },
    scene8: {
      id: 'Tensores fluyendo por la red',
      narration: 'Ahora juntemos todo. Un batch de sesenta y cuatro im\u00e1genes MNIST entra con shape sesenta y cuatro, uno, veintiocho, veintiocho. Primero, flatten lo convierte en sesenta y cuatro por setecientos ochenta y cuatro. El encoder, una capa lineal, lo transforma en sesenta y cuatro por doscientos cincuenta y seis. Otra capa lo comprime al espacio latente: sesenta y cuatro por veinte. El decoder invierte el proceso: de veinte dimensiones a setecientos ochenta y cuatro, y un reshape final recupera la forma de imagen. Cada paso es una transformaci\u00f3n de tensores.',
      subtitleCues: [
        { time: 0.0, text: 'Tensores fluyendo por la red' },
        { time: 0.10, text: 'Input: (64, 1, 28, 28)' },
        { time: 0.27, text: 'Flatten: (64, 784)' },
        { time: 0.42, text: 'Encoder: nn.Linear(784, 256) \u2192 (64, 256)' },
        { time: 0.57, text: 'Latente: (64, 20) \u2014 espacio z' },
        { time: 0.72, text: 'Decoder: (64, 784) \u2192 reshape (64, 1, 28, 28)' },
        { time: 0.87, text: 'Cada paso es una transformaci\u00f3n de tensores' },
      ],
      topic: 'Pipeline VAE completo. C\u00f3mo cambian las shapes en cada capa. Flatten, linear, reshape.',
      title: 'Tensores fluyendo por la red',
      insight: 'Cada paso es una transformaci\u00f3n de tensores',
    },
  },
  en: {
    lessonTitle: 'Tensors: The Data Structure of Deep Learning',
    lessonSubtitle: 'Scalars, vectors, matrices and beyond: how data flows through a neural network',
    scene1: {
      id: 'What is a tensor?',
      narration: 'What is a tensor? At its core, it\'s simply a container of numbers. A scalar is a rank-zero tensor: a single number, like your loss value. A vector is rank one: a row of numbers, like the output logits for four classes. A matrix is rank two: rows and columns, like the weights of a linear layer. And a 3D tensor adds depth, like an RGB image with three channels. Everything in deep learning is a tensor.',
      subtitleCues: [
        { time: 0.0, text: 'What is a tensor?' },
        { time: 0.10, text: 'Scalar (rank 0): a single number' },
        { time: 0.27, text: 'Vector (rank 1): a row of numbers' },
        { time: 0.47, text: 'Matrix (rank 2): rows and columns' },
        { time: 0.72, text: '3D Tensor (rank 3): depth' },
        { time: 0.93, text: 'Everything in deep learning is a tensor' },
      ],
      topic: 'Tensor hierarchy: scalar, vector, matrix, n-dimensional tensor. Each rank adds a dimension.',
      title: 'What is a tensor?',
      scalar: 'A loss value',
      vector: 'Logits for 4 classes',
      matrix: 'Weights of nn.Linear(4, 3)',
      tensor3d: 'RGB image (3, H, W)',
      insight: 'Everything in deep learning is a tensor',
    },
    scene2: {
      id: 'Shape: A Tensor\'s DNA',
      narration: 'Shape is the most important property of a tensor. It describes how many elements it has in each dimension. A matrix with three rows and four columns has shape three comma four, two dimensions, and twelve elements total. The number of elements is the product of the dimensions. This matters because it determines how many parameters your model has: a linear layer from 784 to 256 has over two hundred thousand weights. Shape errors are the number one bug in deep learning.',
      subtitleCues: [
        { time: 0.0, text: 'Shape describes the size of each dimension' },
        { time: 0.10, text: 'shape: (3, 4) \u2014 3 rows, 4 columns' },
        { time: 0.32, text: 'numel = product of dimensions' },
        { time: 0.52, text: 'nn.Linear(784, 256): 200,704 parameters' },
        { time: 0.77, text: 'Indexing: x[row, col]' },
        { time: 0.96, text: 'Shape errors are the #1 bug in DL' },
      ],
      topic: 'Shape, ndim, numel. Shape determines parameters. Tensor indexing.',
      title: 'Shape: A Tensor\'s DNA',
      insight: 'Shape errors are the #1 bug in DL',
    },
    scene3: {
      id: 'Element-wise Operations',
      narration: 'The most basic tensor operations act element by element. Adding two matrices adds each pair of corresponding cells. Multiplying by a scalar scales each cell individually. And ReLU, the most common activation in deep learning, simply zeroes out all negative values. The key point: input shape always equals output shape.',
      subtitleCues: [
        { time: 0.0, text: 'Element-wise operations' },
        { time: 0.10, text: 'Addition: A + B, cell by cell' },
        { time: 0.37, text: 'Scalar product: k \u00d7 A' },
        { time: 0.62, text: 'ReLU: max(0, x) \u2014 negatives to zero' },
        { time: 0.87, text: 'Same input shape = same output shape' },
      ],
      topic: 'Addition, scalar product, ReLU. Shape-preserving operations.',
      title: 'Element-wise Operations',
      insight: 'Same input shape = same output shape',
    },
    scene4: {
      id: 'Reshape',
      narration: 'Reshape reorganizes data without changing it. Twelve numbers can be a two-by-six matrix, a three-by-four, or a flat vector of twelve. Cells move positions but keep their order. In practice, reshape is essential: when passing a 28x28 image to a linear layer, you flatten it to a 784-element vector. The total number of elements never changes.',
      subtitleCues: [
        { time: 0.0, text: 'Reshape: same data, new form' },
        { time: 0.10, text: '12 elements: (2,6) \u2192 (3,4) \u2192 (12,)' },
        { time: 0.32, text: 'Cells keep their order' },
        { time: 0.52, text: 'x.view(3, 4) \u2014 new interpretation' },
        { time: 0.72, text: 'Image (1,28,28) \u2192 vector (784,)' },
        { time: 0.92, text: 'numel stays the same, only interpretation changes' },
      ],
      topic: 'Reshape and view. Reorganize data without copying. Flatten images for linear layers.',
      title: 'Reshape: Same Data, New Form',
      insight: 'numel stays the same. Only the interpretation changes.',
    },
    scene5: {
      id: 'Broadcasting',
      narration: 'When shapes don\'t match, PyTorch uses broadcasting: it automatically expands smaller dimensions. If you add a 3x4 matrix with a 4-element vector, PyTorch replicates the vector across each row. This is exactly what happens when you add a bias: the layer computes W times x for each batch sample, and the bias is added to all of them automatically. Broadcasting means implicit loops with zero extra memory.',
      subtitleCues: [
        { time: 0.0, text: 'Broadcasting: automatic expansion' },
        { time: 0.10, text: 'A (3,4) + b (4,) \u2014 incompatible shapes?' },
        { time: 0.32, text: 'PyTorch replicates b across each row' },
        { time: 0.57, text: 'A + expanded_b = C (3,4)' },
        { time: 0.77, text: 'Real case: y = Wx + b (bias broadcasting)' },
        { time: 0.93, text: 'Broadcasting = implicit loops, 0 extra memory' },
      ],
      topic: 'Automatic broadcasting. Expansion rules. Bias in linear layers as example.',
      title: 'Broadcasting',
      insight: 'Broadcasting = implicit loops, 0 extra memory',
    },
    scene6: {
      id: 'Tensors as Images',
      narration: 'A grayscale image is just a matrix of pixels. Each cell holds a value between zero and one indicating intensity. An MNIST image has shape one, twenty-eight, twenty-eight: one channel, twenty-eight rows, twenty-eight columns. An RGB image adds two more channels: red, green, and blue. Each pixel is three numbers. To pass an image to a linear layer, we flatten it from 28x28 to 784. An image is just a tensor of pixel values.',
      subtitleCues: [
        { time: 0.0, text: 'Tensors as images' },
        { time: 0.10, text: 'Pixels = values between 0 and 1' },
        { time: 0.32, text: 'MNIST: shape (1, 28, 28)' },
        { time: 0.57, text: 'RGB: 3 channels \u2192 shape (3, H, W)' },
        { time: 0.80, text: 'Flatten: (1,28,28) \u2192 (784,)' },
        { time: 0.96, text: 'An image is just a tensor of pixel values' },
      ],
      topic: 'Images as tensors. Grayscale, RGB, flatten for linear layers.',
      title: 'Tensors as Images',
      insight: 'An image is just a tensor of pixel values',
    },
    scene7: {
      id: 'Batches: Dimension 0',
      narration: 'In practice we never process a single image. GPUs are massively parallel: they can process sixty-four images in nearly the same time as one. That\'s why we group samples into batches. The batch is always dimension zero. A batch of sixty-four MNIST images has shape sixty-four, one, twenty-eight, twenty-eight: batch, channels, height, width. That\'s over fifty thousand numbers, but the GPU processes them all in parallel.',
      subtitleCues: [
        { time: 0.0, text: 'Batches: Dimension 0' },
        { time: 0.10, text: 'One image: (1, 28, 28)' },
        { time: 0.32, text: 'Stack several: (4, 1, 28, 28)' },
        { time: 0.57, text: 'GPU: 64 images as fast as 1' },
        { time: 0.80, text: '(Batch, Channels, Height, Width)' },
        { time: 0.93, text: 'dim 0 is always the batch in PyTorch' },
      ],
      topic: 'Batches for GPU parallelism. (B, C, H, W) convention.',
      title: 'Batches: Dimension 0',
      insight: 'dim 0 is always the batch in PyTorch',
    },
    scene8: {
      id: 'Tensors Flowing Through the Network',
      narration: 'Now let\'s put it all together. A batch of sixty-four MNIST images enters with shape sixty-four, one, twenty-eight, twenty-eight. First, flatten converts it to sixty-four by seven-eighty-four. The encoder, a linear layer, transforms it to sixty-four by two-fifty-six. Another layer compresses it to latent space: sixty-four by twenty. The decoder reverses the process: from twenty dimensions to seven-eighty-four, and a final reshape recovers the image shape. Every step is a tensor transformation.',
      subtitleCues: [
        { time: 0.0, text: 'Tensors flowing through the network' },
        { time: 0.10, text: 'Input: (64, 1, 28, 28)' },
        { time: 0.27, text: 'Flatten: (64, 784)' },
        { time: 0.42, text: 'Encoder: nn.Linear(784, 256) \u2192 (64, 256)' },
        { time: 0.57, text: 'Latent: (64, 20) \u2014 z space' },
        { time: 0.72, text: 'Decoder: (64, 784) \u2192 reshape (64, 1, 28, 28)' },
        { time: 0.87, text: 'Every step is a tensor transformation' },
      ],
      topic: 'Complete VAE pipeline. How shapes change at each layer. Flatten, linear, reshape.',
      title: 'Tensors Flowing Through the Network',
      insight: 'Every step is a tensor transformation',
    },
  },
};

// ── i18n helper ──

export function tx(scene: string, field: string): string {
  const lang = getLang();
  const s = text[lang]?.[scene];
  if (typeof s === 'object' && s !== null && field in s) {
    const v = (s as Record<string, unknown>)[field];
    return typeof v === 'string' ? v : '';
  }
  // fallback to es
  const fs = text.es?.[scene];
  if (typeof fs === 'object' && fs !== null && field in fs) {
    const v = (fs as Record<string, unknown>)[field];
    return typeof v === 'string' ? v : '';
  }
  return '';
}

// ── Questions ──

export interface QuestionItem {
  question: string;
  choices: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
}

export const questions: Record<Lang, Record<string, QuestionItem>> = {
  es: {
    afterShapes: {
      question: 'Un tensor con shape (64, 3, 32, 32) tiene... \u00bfcu\u00e1ntos elementos?',
      choices: ['6,144', '196,608', '32,768', '64'],
      correctIndex: 1,
      hint: 'numel = producto de todas las dimensiones.',
      explanation: '64 \u00d7 3 \u00d7 32 \u00d7 32 = 196,608. Esto es un batch de 64 im\u00e1genes RGB de 32\u00d732.',
    },
    afterBroadcast: {
      question: 'Si A tiene shape (32, 1, 5) y B tiene shape (1, 4, 5), \u00bfqu\u00e9 shape tiene A + B?',
      choices: ['(32, 4, 5)', '(1, 1, 5)', 'Error: shapes incompatibles', '(32, 1, 1)'],
      correctIndex: 0,
      hint: 'Broadcasting expande dimensiones de tama\u00f1o 1.',
      explanation: 'dim 0: 32 vs 1 \u2192 32. dim 1: 1 vs 4 \u2192 4. dim 2: 5 vs 5 \u2192 5. Resultado: (32, 4, 5).',
    },
    afterNetwork: {
      question: 'Si el encoder mapea (B, 784) a (B, 20), \u00bfqu\u00e9 shape tiene la matriz de pesos?',
      choices: ['(784, 20)', '(20, 784)', '(B, 20)', '(20, 20)'],
      correctIndex: 1,
      hint: 'En PyTorch, nn.Linear(in, out) tiene pesos de shape (out, in).',
      explanation: 'nn.Linear almacena W con shape (out_features, in_features) = (20, 784). La operaci\u00f3n es y = xW\u1d40 + b.',
    },
  },
  en: {
    afterShapes: {
      question: 'A tensor with shape (64, 3, 32, 32) has... how many elements?',
      choices: ['6,144', '196,608', '32,768', '64'],
      correctIndex: 1,
      hint: 'numel = product of all dimensions.',
      explanation: '64 \u00d7 3 \u00d7 32 \u00d7 32 = 196,608. This is a batch of 64 RGB images of 32\u00d732.',
    },
    afterBroadcast: {
      question: 'If A has shape (32, 1, 5) and B has shape (1, 4, 5), what is the shape of A + B?',
      choices: ['(32, 4, 5)', '(1, 1, 5)', 'Error: incompatible shapes', '(32, 1, 1)'],
      correctIndex: 0,
      hint: 'Broadcasting expands dimensions of size 1.',
      explanation: 'dim 0: 32 vs 1 \u2192 32. dim 1: 1 vs 4 \u2192 4. dim 2: 5 vs 5 \u2192 5. Result: (32, 4, 5).',
    },
    afterNetwork: {
      question: 'If the encoder maps (B, 784) to (B, 20), what shape is the weight matrix?',
      choices: ['(784, 20)', '(20, 784)', '(B, 20)', '(20, 20)'],
      correctIndex: 1,
      hint: 'In PyTorch, nn.Linear(in, out) has weights of shape (out, in).',
      explanation: 'nn.Linear stores W with shape (out_features, in_features) = (20, 784). The operation is y = xW\u1d40 + b.',
    },
  },
};
