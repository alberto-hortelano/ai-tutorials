import type { Lang, QuizQuestion } from '../../engine/types';

export const mod6: Record<Lang, QuizQuestion[]> = {
  es: [
    { q: 'Describe intuitivamente qu\u00e9 hacen el forward process y el reverse process en un modelo de difusi\u00f3n. \u00bfCu\u00e1l se aprende y cu\u00e1l es fijo?', topic: 'Proceso de Difusi\u00f3n' },
    { q: '\u00bfCu\u00e1l es la diferencia clave entre DDPM y DDIM? \u00bfPor qu\u00e9 DDIM puede generar muestras con muchos menos pasos?', topic: 'DDPM vs DDIM' },
    { q: 'Explica c\u00f3mo funciona el inpainting con un modelo de difusi\u00f3n: \u00bfc\u00f3mo se usa la m\u00e1scara en cada paso del reverse process?', topic: 'Inpainting' },
    { q: 'En modelos de difusi\u00f3n, \u00bfpor qu\u00e9 podemos saltar a cualquier timestep $t$ sin simular todos los pasos intermedios?', topic: 'Proceso de Difusi\u00f3n' },
    { q: '\u00bfCu\u00e1l es la ventaja clave de DDIM sobre DDPM que permite saltar pasos?', topic: 'DDPM vs DDIM' },
    { q: 'En inpainting con difusi\u00f3n, \u00bfpor qu\u00e9 los p\u00edxeles conocidos deben tener ruido al nivel del timestep actual $t$?', topic: 'Inpainting' },
  ],
  en: [
    { q: 'Intuitively describe what the forward process and reverse process do in a diffusion model. Which one is learned and which is fixed?', topic: 'Diffusion Process' },
    { q: 'What is the key difference between DDPM and DDIM? Why can DDIM generate samples with far fewer steps?', topic: 'DDPM vs DDIM' },
    { q: 'Explain how inpainting works with a diffusion model: how is the mask used at each step of the reverse process?', topic: 'Inpainting' },
    { q: 'In diffusion models, why can we jump to any timestep $t$ without simulating all intermediate steps?', topic: 'Diffusion Process' },
    { q: 'What is the key advantage of DDIM over DDPM that enables step-skipping?', topic: 'DDPM vs DDIM' },
    { q: 'In diffusion inpainting, why must known pixels be noised to match the current timestep $t$?', topic: 'Inpainting' },
  ],
};
