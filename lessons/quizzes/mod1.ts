import type { Lang, QuizQuestion } from '../../engine/types';

export const mod1: Record<Lang, QuizQuestion[]> = {
  es: [
    { q: '\u00bfPor qu\u00e9 minimizar $D_{\\text{KL}}(p_{\\text{data}} \\| p_\\theta)$ es equivalente a maximizar la log-verosimilitud?', topic: 'KL Divergence y MLE' },
    { q: 'Explica intuitivamente qu\u00e9 mide la entrop\u00eda $H(P)$ de una distribuci\u00f3n.', topic: 'Entrop\u00eda' },
    { q: '\u00bfQu\u00e9 diferencia pr\u00e1ctica hay entre la KL forward $D_{\\text{KL}}(P\\|Q)$ y la KL reverse $D_{\\text{KL}}(Q\\|P)$ cuando $P$ es bimodal?', topic: 'Asimetr\u00eda de KL' },
    { q: 'En un modelo autoregresivo, \u00bfpor qu\u00e9 la evaluaci\u00f3n de densidad $p(x)$ es r\u00e1pida (paralela) pero el muestreo es lento (secuencial)?', topic: 'Modelos Autoregresivos' },
    { q: 'Un modelo que minimiza $D_{\\text{KL}}(p_{\\text{data}} \\| p_\\theta)$ tiende a ser mode-covering o mode-seeking? Explica por qu\u00e9.', topic: 'Asimetr\u00eda de KL' },
    { q: 'En NADE, \u00bfcu\u00e1l es el truco clave que reduce los par\u00e1metros de $O(n^2 d)$ a $O(nd)$?', topic: 'Modelos Autoregresivos' },
    { q: '\u00bfPor qu\u00e9 el muestreo en modelos autoregresivos es inherentemente secuencial, incluso cuando podemos evaluar la densidad en paralelo?', topic: 'Modelos Autoregresivos' },
  ],
  en: [
    { q: 'Why is minimizing $D_{\\text{KL}}(p_{\\text{data}} \\| p_\\theta)$ equivalent to maximizing the log-likelihood?', topic: 'KL Divergence and MLE' },
    { q: 'Intuitively explain what the entropy $H(P)$ of a distribution measures.', topic: 'Entropy' },
    { q: 'What practical difference is there between forward KL $D_{\\text{KL}}(P\\|Q)$ and reverse KL $D_{\\text{KL}}(Q\\|P)$ when $P$ is bimodal?', topic: 'KL Asymmetry' },
    { q: 'In an autoregressive model, why is density evaluation $p(x)$ fast (parallel) but sampling slow (sequential)?', topic: 'Autoregressive Models' },
    { q: 'A model that minimizes $D_{\\text{KL}}(p_{\\text{data}} \\| p_\\theta)$ tends to be mode-covering or mode-seeking? Explain why.', topic: 'KL Asymmetry' },
    { q: 'In NADE, what is the key trick that reduces parameters from $O(n^2 d)$ to $O(nd)$?', topic: 'Autoregressive Models' },
    { q: 'Why is sampling from autoregressive models inherently sequential, even when we can evaluate density in parallel?', topic: 'Autoregressive Models' },
  ],
};
