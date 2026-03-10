import { describe, it, expect } from 'vitest';
import {
  gaussian,
  klGaussian,
  entropy,
  crossEntropy,
  klDiscrete,
  lerp,
  clamp,
  sigmoid,
  betaScheduleLinear,
  logSumExp,
} from '../shared/math-utils';

describe('gaussian', () => {
  it('standard normal at x=0 ≈ 1/√(2π)', () => {
    expect(gaussian(0, 0, 1)).toBeCloseTo(1 / Math.sqrt(2 * Math.PI), 4);
  });

  it('is symmetric about the mean', () => {
    expect(gaussian(2, 3, 1)).toBeCloseTo(gaussian(4, 3, 1), 10);
  });
});

describe('klGaussian', () => {
  it('KL of identical Gaussians is 0', () => {
    expect(klGaussian(0, 1, 0, 1)).toBeCloseTo(0, 10);
    expect(klGaussian(5, 2, 5, 2)).toBeCloseTo(0, 10);
  });

  it('KL is non-negative', () => {
    expect(klGaussian(0, 1, 1, 2)).toBeGreaterThanOrEqual(0);
    expect(klGaussian(3, 0.5, 1, 3)).toBeGreaterThanOrEqual(0);
  });
});

describe('entropy', () => {
  it('fair coin: 1 bit', () => {
    expect(entropy([0.5, 0.5])).toBeCloseTo(1, 10);
  });

  it('deterministic: 0 bits', () => {
    expect(entropy([1, 0])).toBeCloseTo(0, 10);
  });

  it('fair die: log2(6) bits', () => {
    const fairDie = [1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6];
    expect(entropy(fairDie)).toBeCloseTo(Math.log2(6), 10);
  });
});

describe('crossEntropy', () => {
  it('H(p, p) === H(p)', () => {
    const p = [0.3, 0.7];
    expect(crossEntropy(p, p)).toBeCloseTo(entropy(p), 10);
  });

  it('returns Infinity when q has zero where p is positive', () => {
    expect(crossEntropy([1, 0], [0, 1])).toBe(Infinity);
  });
});

describe('klDiscrete', () => {
  it('KL(p, p) is 0', () => {
    expect(klDiscrete([0.5, 0.5], [0.5, 0.5])).toBeCloseTo(0, 10);
    expect(klDiscrete([0.3, 0.7], [0.3, 0.7])).toBeCloseTo(0, 10);
  });

  it('KL is non-negative', () => {
    expect(klDiscrete([0.3, 0.7], [0.5, 0.5])).toBeGreaterThanOrEqual(0);
  });

  it('KL([1,0], [0,1]) is Infinity', () => {
    expect(klDiscrete([1, 0], [0, 1])).toBe(Infinity);
  });
});

describe('lerp', () => {
  it('lerp(0, 10, 0.5) = 5', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });

  it('lerp at boundaries', () => {
    expect(lerp(3, 7, 0)).toBe(3);
    expect(lerp(3, 7, 1)).toBe(7);
  });
});

describe('clamp', () => {
  it('clamps above max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('clamps below min', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('passes through in range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
});

describe('sigmoid', () => {
  it('sigmoid(0) = 0.5', () => {
    expect(sigmoid(0)).toBe(0.5);
  });

  it('sigmoid approaches 1 for large positive', () => {
    expect(sigmoid(10)).toBeCloseTo(1, 4);
  });

  it('sigmoid approaches 0 for large negative', () => {
    expect(sigmoid(-10)).toBeCloseTo(0, 4);
  });
});

describe('betaScheduleLinear', () => {
  it('returns array of correct length', () => {
    expect(betaScheduleLinear(10)).toHaveLength(10);
  });

  it('values are increasing', () => {
    const betas = betaScheduleLinear(10);
    for (let i = 1; i < betas.length; i++) {
      expect(betas[i]).toBeGreaterThanOrEqual(betas[i - 1]);
    }
  });

  it('first and last match defaults', () => {
    const betas = betaScheduleLinear(10);
    expect(betas[0]).toBeCloseTo(0.0001, 6);
    expect(betas[9]).toBeCloseTo(0.02, 6);
  });
});

describe('logSumExp', () => {
  it('empty array returns -Infinity', () => {
    expect(logSumExp([])).toBe(-Infinity);
  });

  it('single element [0] ≈ 0', () => {
    expect(logSumExp([0])).toBeCloseTo(0, 10);
  });

  it('logSumExp([a, a]) ≈ a + ln(2)', () => {
    const a = 5;
    expect(logSumExp([a, a])).toBeCloseTo(a + Math.log(2), 10);
  });
});
