// Mathematical functions shared across interactives

/**
 * Gaussian (normal) probability density function.
 * @param {number} x
 * @param {number} mu - mean
 * @param {number} sigma - standard deviation
 * @returns {number}
 */
export function gaussian(x, mu, sigma) {
  const c = 1.0 / (sigma * Math.sqrt(2 * Math.PI));
  return c * Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
}

/**
 * Sigmoid function.
 * @param {number} x
 * @returns {number}
 */
export function sigmoid(x) {
  if (x >= 0) {
    return 1 / (1 + Math.exp(-x));
  }
  const ex = Math.exp(x);
  return ex / (1 + ex);
}

/**
 * Numerical KL divergence KL(p || q) via quadrature.
 * p and q are functions x => density.
 * @param {Function} p
 * @param {Function} q
 * @param {number} xMin
 * @param {number} xMax
 * @param {number} steps
 * @returns {number}
 */
export function klDivergence(p, q, xMin = -10, xMax = 10, steps = 2000) {
  const dx = (xMax - xMin) / steps;
  let kl = 0;
  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * dx;
    const pv = p(x);
    const qv = q(x);
    if (pv > 1e-300 && qv > 1e-300) {
      kl += pv * Math.log(pv / qv) * dx;
    }
  }
  return Math.max(0, kl);
}

/**
 * Numerical Jensen-Shannon divergence via quadrature.
 * @param {Function} p - x => density
 * @param {Function} q - x => density
 * @param {number} xMin
 * @param {number} xMax
 * @param {number} steps
 * @returns {number}
 */
export function jsDivergence(p, q, xMin = -10, xMax = 10, steps = 2000) {
  const dx = (xMax - xMin) / steps;
  let jsd = 0;
  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * dx;
    const pv = p(x);
    const qv = q(x);
    const m = 0.5 * pv + 0.5 * qv;
    if (m > 1e-300) {
      if (pv > 1e-300) jsd += 0.5 * pv * Math.log(pv / m) * dx;
      if (qv > 1e-300) jsd += 0.5 * qv * Math.log(qv / m) * dx;
    }
  }
  return Math.max(0, jsd);
}

/**
 * Analytical KL divergence between two 1D Gaussians with same variance.
 * KL(N(mu1, sigma^2) || N(mu2, sigma^2)) = (mu1 - mu2)^2 / (2 * sigma^2)
 */
export function klGaussianSameVar(mu1, mu2, sigma) {
  return (mu1 - mu2) ** 2 / (2 * sigma * sigma);
}

/**
 * Wasserstein-1 distance between two 1D point distributions.
 * W1 = |mu1 - mu2|
 */
export function wasserstein1(mu1, mu2) {
  return Math.abs(mu1 - mu2);
}

/**
 * Numerical gradient of a function via central differences.
 * @param {Function} fn - scalar function of one variable
 * @param {number} x - point to evaluate
 * @param {number} h - step size
 * @returns {number}
 */
export function numericalGradient(fn, x, h = 0.01) {
  return (fn(x + h) - fn(x - h)) / (2 * h);
}

/**
 * Simple seeded pseudo-random number generator (LCG).
 * Returns a function that produces [0, 1) values.
 * @param {number} seed
 * @returns {Function}
 */
export function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

/**
 * Linear interpolation.
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Clamp a value to [min, max].
 */
export function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

/**
 * Sample from standard normal N(0,1) using Box-Muller transform.
 * @returns {number}
 */
export function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * 2D isotropic Gaussian PDF.
 * @param {number} x
 * @param {number} y
 * @param {number} mx - mean x
 * @param {number} my - mean y
 * @param {number} sigma - standard deviation (same for both dims)
 * @returns {number}
 */
export function gaussian2D(x, y, mx, my, sigma) {
  const d2 = (x - mx) ** 2 + (y - my) ** 2;
  return (1 / (2 * Math.PI * sigma * sigma)) * Math.exp(-d2 / (2 * sigma * sigma));
}
