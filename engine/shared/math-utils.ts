// Math utilities extracted from existing visualizations

const TWO_PI: number = 2 * Math.PI;
const LOG_TWO_PI: number = Math.log(TWO_PI);

/** PDF of univariate Gaussian */
export function gaussian(x: number, mu: number, sigma: number): number {
  return (1 / (sigma * Math.sqrt(TWO_PI))) *
         Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
}

/** Log-PDF of univariate Gaussian */
export function logGaussian(x: number, mu: number, sigma: number): number {
  return -0.5 * LOG_TWO_PI - Math.log(sigma) - 0.5 * ((x - mu) / sigma) ** 2;
}

/** KL(N(mu1,s1^2) || N(mu2,s2^2)) */
export function klGaussian(mu1: number, sigma1: number, mu2: number, sigma2: number): number {
  return Math.log(sigma2 / sigma1) +
         (sigma1 * sigma1 + (mu1 - mu2) ** 2) / (2 * sigma2 * sigma2) - 0.5;
}

/** Entropy of a discrete distribution (array of probabilities) */
export function entropy(probs: number[]): number {
  let h = 0;
  for (const p of probs) {
    if (p > 0) h -= p * Math.log2(p);
  }
  return h;
}

/** Cross-entropy H(P, Q) for discrete distributions */
export function crossEntropy(p: number[], q: number[]): number {
  let h = 0;
  for (let i = 0; i < p.length; i++) {
    if (p[i] > 0 && q[i] > 0) {
      h -= p[i] * Math.log2(q[i]);
    } else if (p[i] > 0 && q[i] <= 0) {
      return Infinity;
    }
  }
  return h;
}

/** KL(P || Q) for discrete distributions */
export function klDiscrete(p: number[], q: number[]): number {
  let kl = 0;
  for (let i = 0; i < p.length; i++) {
    if (p[i] > 0 && q[i] > 0) {
      kl += p[i] * Math.log2(p[i] / q[i]);
    } else if (p[i] > 0 && q[i] <= 0) {
      return Infinity;
    }
  }
  return kl;
}

/** Self-information: I(x) = -log2(p(x)) */
export function selfInformation(p: number): number {
  if (p <= 0) return Infinity;
  return -Math.log2(p);
}

/** Lerp */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Clamp */
export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Gaussian mixture PDF: p(x) = Σ weights[k] * N(x; means[k], stds[k]) */
export function gaussianMixturePdf(x: number, weights: number[], means: number[], stds: number[]): number {
  let sum = 0;
  for (let k = 0; k < weights.length; k++) {
    sum += weights[k] * gaussian(x, means[k], stds[k]);
  }
  return sum;
}

/** Log-sum-exp trick: log(Σ exp(a_i)) = m + log(Σ exp(a_i - m)) */
export function logSumExp(values: number[]): number {
  if (values.length === 0) return -Infinity;
  const m = Math.max(...values);
  if (m === -Infinity) return -Infinity;
  let sum = 0;
  for (const v of values) sum += Math.exp(v - m);
  return m + Math.log(sum);
}

/** Linear beta schedule for diffusion: linearly interpolate from betaStart to betaEnd over T steps */
export function betaScheduleLinear(T: number, betaStart = 0.0001, betaEnd = 0.02): number[] {
  const betas: number[] = [];
  for (let t = 0; t < T; t++) {
    betas.push(betaStart + (betaEnd - betaStart) * t / (T - 1));
  }
  return betas;
}

/** Cosine beta schedule for diffusion */
export function betaScheduleCosine(T: number, sOffset = 0.008): number[] {
  const betas: number[] = [];
  const f = (t: number) => Math.cos(((t / T + sOffset) / (1 + sOffset)) * Math.PI / 2) ** 2;
  for (let t = 0; t < T; t++) {
    betas.push(clamp(1 - f(t + 1) / f(t), 0, 0.999));
  }
  return betas;
}

/** Cumulative product of (1 - betas): ᾱ_t = Π_{s=1}^{t} (1-β_s) */
export function alphaBarSchedule(betas: number[]): number[] {
  const alphaBars: number[] = [];
  let prod = 1;
  for (const b of betas) {
    prod *= (1 - b);
    alphaBars.push(prod);
  }
  return alphaBars;
}

/** Sigmoid function */
export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}
