import type { Lang, QuizQuestion } from '../../engine/types';

export const mod5: Record<Lang, QuizQuestion[]> = {
  es: [
    { q: '\u00bfPor qu\u00e9 en un Energy-Based Model la funci\u00f3n de partici\u00f3n $Z(\\theta) = \\int \\exp(-E_\\theta(x))\\,dx$ es intractable? \u00bfPor qu\u00e9 esto es un problema para MLE?', topic: 'Energy-Based Models' },
    { q: '\u00bfQu\u00e9 ventaja tiene trabajar con la funci\u00f3n score $\\nabla_x \\log p(x)$ en lugar de directamente con $p(x)$? \u00bfQu\u00e9 desaparece al tomar el gradiente?', topic: 'Score Matching' },
    { q: '\u00bfPor qu\u00e9 la funci\u00f3n score $\\nabla_x \\log p(x)$ no depende de la funci\u00f3n de partici\u00f3n $Z$?', topic: 'Score Matching' },
    { q: 'En denoising score matching, \u00bfqu\u00e9 aprende el modelo a predecir?', topic: 'Score Matching' },
  ],
  en: [
    { q: 'Why is the partition function $Z(\\theta) = \\int \\exp(-E_\\theta(x))\\,dx$ intractable in an Energy-Based Model? Why is this a problem for MLE?', topic: 'Energy-Based Models' },
    { q: 'What advantage does working with the score function $\\nabla_x \\log p(x)$ have over working directly with $p(x)$? What disappears when you take the gradient?', topic: 'Score Matching' },
    { q: 'Why does the score function $\\nabla_x \\log p(x)$ not depend on the partition function $Z$?', topic: 'Score Matching' },
    { q: 'In denoising score matching, what does the model learn to predict?', topic: 'Score Matching' },
  ],
};
