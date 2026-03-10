import type { Lang, QuizQuestion } from '../../engine/types';

export const mod4: Record<Lang, QuizQuestion[]> = {
  es: [
    { q: 'Explica intuitivamente el juego min-max entre generador y discriminador en un GAN. \u00bfQu\u00e9 intenta hacer cada uno?', topic: 'GANs' },
    { q: '\u00bfPor qu\u00e9 la loss minimax original $\\log(1-D(G(z)))$ puede causar gradientes que se desvanecen al inicio del entrenamiento?', topic: 'Entrenamiento de GANs' },
    { q: '\u00bfQu\u00e9 problemas tiene usar KL divergence o JSD cuando las distribuciones $p_{\\text{data}}$ y $p_G$ tienen soportes disjuntos? \u00bfC\u00f3mo lo resuelve la distancia Wasserstein?', topic: 'Wasserstein GAN' },
    { q: 'En el juego minimax del GAN, \u00bfcu\u00e1nto vale $D^*(x)$ cuando $p_g = p_{\\text{data}}$?', topic: 'GANs' },
    { q: '\u00bfPor qu\u00e9 la loss no-saturante $-\\log(D(G(z)))$ ayuda con los gradientes que se desvanecen?', topic: 'Entrenamiento de GANs' },
    { q: '\u00bfQu\u00e9 problema fundamental resuelve la distancia Wasserstein que JSD no puede?', topic: 'Wasserstein GAN' },
  ],
  en: [
    { q: 'Intuitively explain the min-max game between generator and discriminator in a GAN. What is each one trying to do?', topic: 'GANs' },
    { q: 'Why can the original minimax loss $\\log(1-D(G(z)))$ cause vanishing gradients at the start of training?', topic: 'GAN Training' },
    { q: 'What problems arise when using KL divergence or JSD when $p_{\\text{data}}$ and $p_G$ have disjoint supports? How does Wasserstein distance solve this?', topic: 'Wasserstein GAN' },
    { q: 'In the GAN minimax game, what is $D^*(x)$ when $p_g = p_{\\text{data}}$?', topic: 'GANs' },
    { q: 'Why does the non-saturating loss $-\\log(D(G(z)))$ help with vanishing gradients?', topic: 'GAN Training' },
    { q: 'What fundamental problem does the Wasserstein distance solve that JSD cannot?', topic: 'Wasserstein GAN' },
  ],
};
