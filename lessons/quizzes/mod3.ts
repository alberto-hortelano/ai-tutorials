import type { Lang, QuizQuestion } from '../../engine/types';

export const mod3: Record<Lang, QuizQuestion[]> = {
  es: [
    { q: '\u00bfPor qu\u00e9 los normalizing flows requieren transformaciones invertibles con Jacobiano de determinante tratable? \u00bfQu\u00e9 pasar\u00eda si no fuera invertible?', topic: 'Cambio de Variables' },
    { q: 'Explica c\u00f3mo una coupling layer (como en RealNVP) logra que el Jacobiano sea triangular y por tanto su determinante sea f\u00e1cil de calcular.', topic: 'Coupling Layers' },
    { q: '\u00bfCu\u00e1l es el trade-off fundamental entre MAF e IAF? \u00bfPara qu\u00e9 aplicaci\u00f3n usar\u00edas cada uno?', topic: 'MAF vs IAF' },
  ],
  en: [
    { q: 'Why do normalizing flows require invertible transformations with tractable Jacobian determinants? What would happen if it weren\'t invertible?', topic: 'Change of Variables' },
    { q: 'Explain how a coupling layer (as in RealNVP) makes the Jacobian triangular and thus its determinant easy to compute.', topic: 'Coupling Layers' },
    { q: 'What is the fundamental trade-off between MAF and IAF? Which application would you use each for?', topic: 'MAF vs IAF' },
  ],
};
