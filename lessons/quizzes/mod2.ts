import type { Lang, QuizQuestion } from '../../engine/types';

export const mod2: Record<Lang, QuizQuestion[]> = {
  es: [
    { q: '\u00bfPor qu\u00e9 no podemos calcular directamente $p_\\theta(x) = \\int p_\\theta(x|z)\\,p(z)\\,dz$ en un VAE?', topic: 'Variables Latentes' },
    { q: 'Explica las dos fuerzas que compiten en el ELBO: el t\u00e9rmino de reconstrucci\u00f3n y el t\u00e9rmino de regularizaci\u00f3n KL. \u00bfQu\u00e9 pasa si uno domina al otro?', topic: 'ELBO' },
    { q: '\u00bfQu\u00e9 es el reparameterization trick y por qu\u00e9 es necesario para entrenar un VAE con backpropagation?', topic: 'Reparametrizaci\u00f3n' },
    { q: '\u00bfQu\u00e9 es el posterior collapse y por qu\u00e9 ocurre? \u00bfC\u00f3mo se relaciona con el balance entre los dos t\u00e9rminos del ELBO?', topic: 'Posterior Collapse' },
    { q: 'El reparameterization trick escribe $z = \\mu + \\sigma \\cdot \\varepsilon$. \u00bfPor qu\u00e9 $\\varepsilon$ se muestrea de $N(0,I)$ y no de $q$?', topic: 'Reparametrizaci\u00f3n' },
    { q: 'En GMVAE, \u00bfpor qu\u00e9 no podemos usar la f\u00f3rmula cerrada de KL entre dos gaussianas?', topic: 'GMVAE' },
    { q: '\u00bfQu\u00e9 "emerge" en el Semi-Supervised VAE que no existe en el VAE est\u00e1ndar?', topic: 'Semi-Supervised VAE' },
  ],
  en: [
    { q: 'Why can\'t we directly compute $p_\\theta(x) = \\int p_\\theta(x|z)\\,p(z)\\,dz$ in a VAE?', topic: 'Latent Variables' },
    { q: 'Explain the two competing forces in the ELBO: the reconstruction term and the KL regularization term. What happens if one dominates?', topic: 'ELBO' },
    { q: 'What is the reparameterization trick and why is it necessary to train a VAE with backpropagation?', topic: 'Reparameterization' },
    { q: 'What is posterior collapse and why does it occur? How does it relate to the balance between the two ELBO terms?', topic: 'Posterior Collapse' },
    { q: 'The reparameterization trick writes $z = \\mu + \\sigma \\cdot \\varepsilon$. Why is $\\varepsilon$ sampled from $N(0,I)$ and not from $q$?', topic: 'Reparameterization' },
    { q: 'In GMVAE, why can\'t we use the closed-form KL formula between two Gaussians?', topic: 'GMVAE' },
    { q: 'What "emerges" in the Semi-Supervised VAE that doesn\'t exist in the standard VAE?', topic: 'Semi-Supervised VAE' },
  ],
};
