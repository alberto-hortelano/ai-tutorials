/**
 * Converts LaTeX math notation to Spanish spoken text.
 * Designed for XCS236 (probability, information theory, deep generative models).
 */

const GREEK: [RegExp, string][] = [
  [/\\alpha/g, 'alfa'],
  [/\\beta/g, 'beta'],
  [/\\gamma/g, 'gamma'],
  [/\\delta/g, 'delta'],
  [/\\epsilon/g, 'épsilon'],
  [/\\varepsilon/g, 'épsilon'],
  [/\\zeta/g, 'zeta'],
  [/\\eta/g, 'eta'],
  [/\\theta/g, 'theta'],
  [/\\vartheta/g, 'theta'],
  [/\\iota/g, 'iota'],
  [/\\kappa/g, 'kappa'],
  [/\\lambda/g, 'lambda'],
  [/\\mu/g, 'mu'],
  [/\\nu/g, 'nu'],
  [/\\xi/g, 'xi'],
  [/\\pi/g, 'pi'],
  [/\\rho/g, 'ro'],
  [/\\sigma/g, 'sigma'],
  [/\\tau/g, 'tau'],
  [/\\upsilon/g, 'ípsilon'],
  [/\\phi/g, 'fi'],
  [/\\varphi/g, 'fi'],
  [/\\chi/g, 'ji'],
  [/\\psi/g, 'psi'],
  [/\\omega/g, 'omega'],
  [/\\Gamma/g, 'Gamma'],
  [/\\Delta/g, 'Delta'],
  [/\\Theta/g, 'Theta'],
  [/\\Lambda/g, 'Lambda'],
  [/\\Sigma/g, 'Sigma'],
  [/\\Phi/g, 'Fi'],
  [/\\Psi/g, 'Psi'],
  [/\\Omega/g, 'Omega'],
];

const OPERATORS: [RegExp, string][] = [
  [/\\sum/g, 'sumatorio'],
  [/\\prod/g, 'productorio'],
  [/\\int/g, 'integral'],
  [/\\nabla/g, 'nabla'],
  [/\\partial/g, 'parcial'],
  [/\\det/g, 'determinante'],
  [/\\log/g, 'logaritmo'],
  [/\\ln/g, 'logaritmo natural'],
  [/\\exp/g, 'exponencial'],
  [/\\max/g, 'máximo'],
  [/\\min/g, 'mínimo'],
  [/\\arg\\s*\\\\max/g, 'arg máximo'],
  [/\\arg\\s*\\\\min/g, 'arg mínimo'],
  [/\\argmax/g, 'arg máximo'],
  [/\\argmin/g, 'arg mínimo'],
  [/\\sup/g, 'supremo'],
  [/\\inf(?![a-z])/g, 'ínfimo'],
  [/\\lim/g, 'límite'],
  [/\\dim/g, 'dimensión'],
  [/\\Pr/g, 'probabilidad'],
];

const RELATIONS: [RegExp, string][] = [
  [/\\sim/g, ' distribuido como '],
  [/\\approx/g, ' aproximadamente '],
  [/\\neq/g, ' distinto de '],
  [/\\leq/g, ' menor o igual que '],
  [/\\geq/g, ' mayor o igual que '],
  [/\\ll/g, ' mucho menor que '],
  [/\\gg/g, ' mucho mayor que '],
  [/\\in/g, ' pertenece a '],
  [/\\notin/g, ' no pertenece a '],
  [/\\subset/g, ' subconjunto de '],
  [/\\subseteq/g, ' subconjunto de '],
  [/\\to/g, ' hacia '],
  [/\\rightarrow/g, ' hacia '],
  [/\\leftarrow/g, ' desde '],
  [/\\Rightarrow/g, ' implica '],
  [/\\Leftrightarrow/g, ' si y solo si '],
  [/\\forall/g, ' para todo '],
  [/\\exists/g, ' existe '],
  [/\\neg/g, ' no '],
  [/\\wedge/g, ' y '],
  [/\\vee/g, ' o '],
  [/\\cdot/g, ' por '],
  [/\\times/g, ' por '],
  [/\\propto/g, ' proporcional a '],
  [/\\infty/g, 'infinito'],
  [/\\pm/g, ' más menos '],
  [/\\mp/g, ' menos más '],
];

const BLACKBOARD: [RegExp, string][] = [
  [/\\mathbb\{E\}/g, 'esperanza'],
  [/\\mathbb\{R\}/g, 'reales'],
  [/\\mathbb\{Z\}/g, 'enteros'],
  [/\\mathbb\{N\}/g, 'naturales'],
  [/\\mathbb\{P\}/g, 'probabilidad'],
  [/\\mathbb\{Q\}/g, 'racionales'],
];

/** Braces-aware: match \cmd{...} handling nested braces up to depth 3. */
const B = '(?:[^{}]|\\{(?:[^{}]|\\{[^{}]*\\})*\\})*';

export function latexToSpeech(latex: string): string {
  let s = latex;

  // 1. Strip formatting commands
  s = s.replace(/\\displaystyle/g, '');
  s = s.replace(/\\textstyle/g, '');
  s = s.replace(/\\scriptstyle/g, '');
  s = s.replace(/\\left/g, '');
  s = s.replace(/\\right/g, '');
  s = s.replace(/\\big[gl]?/gi, '');
  s = s.replace(/\\Big[gl]?/gi, '');
  s = s.replace(/\\[,;:!>]/g, ' ');
  s = s.replace(/\\quad/g, ' ');
  s = s.replace(/\\qquad/g, ' ');
  s = s.replace(/\\hspace\{[^}]*\}/g, ' ');
  s = s.replace(/\\text\{([^}]*)\}/g, '$1');
  s = s.replace(/\\mathrm\{([^}]*)\}/g, '$1');
  s = s.replace(/\\operatorname\{([^}]*)\}/g, '$1');
  s = s.replace(/\\operatorname\*\{([^}]*)\}/g, '$1');

  // 2. Blackboard bold (before general \mathbb cleanup)
  for (const [re, repl] of BLACKBOARD) s = s.replace(re, repl);
  s = s.replace(/\\mathbb\{([^}]*)\}/g, '$1');

  // 3. Decorations
  s = s.replace(/\\mathbf\{([^}]*)\}/g, 'vector $1');
  s = s.replace(/\\boldsymbol\{([^}]*)\}/g, 'vector $1');
  s = s.replace(/\\bm\{([^}]*)\}/g, 'vector $1');
  s = s.replace(/\\hat\{([^}]*)\}/g, '$1 gorro');
  s = s.replace(/\\tilde\{([^}]*)\}/g, '$1 tilde');
  s = s.replace(/\\bar\{([^}]*)\}/g, '$1 barra');
  s = s.replace(/\\dot\{([^}]*)\}/g, '$1 punto');
  s = s.replace(/\\ddot\{([^}]*)\}/g, '$1 dos puntos');
  s = s.replace(/\\vec\{([^}]*)\}/g, 'vector $1');
  s = s.replace(/\\overline\{([^}]*)\}/g, '$1 barra');
  s = s.replace(/\\underline\{([^}]*)\}/g, '$1');
  s = s.replace(/\\mathcal\{([^}]*)\}/g, '$1');
  s = s.replace(/\\mathit\{([^}]*)\}/g, '$1');

  // 4. Fractions (loop for nesting)
  for (let i = 0; i < 4; i++) {
    s = s.replace(new RegExp(`\\\\frac\\{(${B})\\}\\{(${B})\\}`, 'g'), '($1 sobre $2)');
    s = s.replace(new RegExp(`\\\\dfrac\\{(${B})\\}\\{(${B})\\}`, 'g'), '($1 sobre $2)');
    s = s.replace(new RegExp(`\\\\tfrac\\{(${B})\\}\\{(${B})\\}`, 'g'), '($1 sobre $2)');
  }

  // 5. Roots
  s = s.replace(new RegExp(`\\\\sqrt\\[(${B})\\]\\{(${B})\\}`, 'g'), 'raíz $1-ésima de $2');
  s = s.replace(new RegExp(`\\\\sqrt\\{(${B})\\}`, 'g'), 'raíz de $1');

  // 6. Superscripts
  s = s.replace(/\^\\top/g, ' traspuesta');
  s = s.replace(/\^\{\\top\}/g, ' traspuesta');
  s = s.replace(/\^T(?![a-zA-Z])/g, ' traspuesta');
  s = s.replace(/\^\{-1\}/g, ' inversa');
  s = s.replace(/\^2(?![0-9])/g, ' al cuadrado');
  s = s.replace(/\^\{2\}/g, ' al cuadrado');
  s = s.replace(/\^3(?![0-9])/g, ' al cubo');
  s = s.replace(/\^\{3\}/g, ' al cubo');
  s = s.replace(/\^\{([^}]*)\}/g, ' elevado a $1');
  s = s.replace(/\^([a-zA-Z0-9])/g, ' elevado a $1');

  // 7. Subscripts
  s = s.replace(/_\{([^}]*)\}/g, ' sub $1');
  s = s.replace(/_([a-zA-Z0-9])/g, ' sub $1');

  // 8. Greek letters
  for (const [re, repl] of GREEK) s = s.replace(re, repl);

  // 9. Operators
  for (const [re, repl] of OPERATORS) s = s.replace(re, repl);

  // 10. Relations
  for (const [re, repl] of RELATIONS) s = s.replace(re, repl);

  // 11. KL divergence pattern
  s = s.replace(/D_\s*\{?\s*KL\s*\}?/gi, 'divergencia KL');
  s = s.replace(/KL\s*\(/g, 'divergencia KL de ');

  // 12. Common probability patterns
  s = s.replace(/\|/g, ' dado ');

  // 13. Parentheses / brackets
  s = s.replace(/\\langle/g, '(');
  s = s.replace(/\\rangle/g, ')');
  s = s.replace(/\\lfloor/g, '(');
  s = s.replace(/\\rfloor/g, ')');
  s = s.replace(/\\lceil/g, '(');
  s = s.replace(/\\rceil/g, ')');
  s = s.replace(/\\\{/g, '(');
  s = s.replace(/\\\}/g, ')');
  s = s.replace(/\\\[/g, '(');
  s = s.replace(/\\\]/g, ')');

  // 14. Cleanup
  s = s.replace(/[{}]/g, '');
  s = s.replace(/\\/g, '');
  s = s.replace(/[~`]/g, ' ');
  s = s.replace(/&/g, ' ');
  s = s.replace(/\s+/g, ' ');
  s = s.trim();

  return s;
}
