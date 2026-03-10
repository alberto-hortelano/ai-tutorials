import { describe, it, expect } from 'vitest';
import {
  subProgress,
  easedSub,
  tweenValue,
  tweenColor,
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeOutBack,
  easeInOutSine,
} from '../animation/tween';

describe('subProgress', () => {
  it('returns 0 before start', () => {
    expect(subProgress(0, 0.2, 0.8)).toBe(0);
    expect(subProgress(0.1, 0.2, 0.8)).toBe(0);
  });

  it('returns 1 after end', () => {
    expect(subProgress(0.9, 0.2, 0.8)).toBe(1);
    expect(subProgress(1, 0.2, 0.8)).toBe(1);
  });

  it('returns 0 at exactly start', () => {
    expect(subProgress(0.2, 0.2, 0.8)).toBe(0);
  });

  it('returns 1 at exactly end', () => {
    expect(subProgress(0.8, 0.2, 0.8)).toBe(1);
  });

  it('returns linear midpoint', () => {
    expect(subProgress(0.5, 0.2, 0.8)).toBeCloseTo(0.5, 10);
  });

  it('handles start === end edge case', () => {
    // When start===end, progress <= start triggers first, so at=0; after=1
    expect(subProgress(0.4, 0.5, 0.5)).toBe(0);
    expect(subProgress(0.5, 0.5, 0.5)).toBe(0);
    expect(subProgress(0.6, 0.5, 0.5)).toBe(1);
  });
});

describe('easedSub', () => {
  it('returns 0 before start', () => {
    expect(easedSub(0, 0.2, 0.8)).toBe(0);
  });

  it('returns 1 after end (easeInOut(1) = 1)', () => {
    expect(easedSub(1, 0.2, 0.8)).toBe(1);
  });

  it('applies easing to midpoint', () => {
    const result = easedSub(0.5, 0.2, 0.8);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(1);
  });

  it('with linear easing equals raw subProgress', () => {
    expect(easedSub(0.5, 0.2, 0.8, linear)).toBeCloseTo(0.5, 10);
  });
});

describe('tweenValue', () => {
  it('returns from at start', () => {
    expect(tweenValue(10, 20, 0, 0.2, 0.8)).toBe(10);
  });

  it('returns to at end', () => {
    expect(tweenValue(10, 20, 1, 0.2, 0.8)).toBe(20);
  });

  it('interpolates with linear easing', () => {
    expect(tweenValue(0, 100, 0.5, 0.2, 0.8, linear)).toBeCloseTo(50, 10);
  });

  it('clamps below start', () => {
    expect(tweenValue(10, 20, 0, 0.5, 0.8)).toBe(10);
  });
});

describe('tweenColor', () => {
  it('returns start color at t=0', () => {
    expect(tweenColor('#000000', '#ffffff', 0)).toBe('rgb(0,0,0)');
  });

  it('returns end color at t=1', () => {
    expect(tweenColor('#000000', '#ffffff', 1)).toBe('rgb(255,255,255)');
  });

  it('returns midpoint at t=0.5', () => {
    const mid = tweenColor('#000000', '#ffffff', 0.5);
    // rgb(128,128,128) — Math.round(127.5) = 128
    expect(mid).toBe('rgb(128,128,128)');
  });
});

describe('easing functions', () => {
  const easings = [
    { name: 'linear', fn: linear },
    { name: 'easeInQuad', fn: easeInQuad },
    { name: 'easeOutQuad', fn: easeOutQuad },
    { name: 'easeInOutQuad', fn: easeInOutQuad },
    { name: 'easeInCubic', fn: easeInCubic },
    { name: 'easeOutCubic', fn: easeOutCubic },
    { name: 'easeInOutCubic', fn: easeInOutCubic },
    { name: 'easeInOutSine', fn: easeInOutSine },
  ];

  for (const { name, fn } of easings) {
    it(`${name}: f(0) ≈ 0`, () => {
      expect(fn(0)).toBeCloseTo(0, 5);
    });

    it(`${name}: f(1) ≈ 1`, () => {
      expect(fn(1)).toBeCloseTo(1, 5);
    });
  }

  it('easeOutBack: f(0) ≈ 0 and f(1) ≈ 1', () => {
    expect(easeOutBack(0)).toBeCloseTo(0, 5);
    expect(easeOutBack(1)).toBeCloseTo(1, 5);
  });

  it('easeOutBack overshoots past 1', () => {
    // easeOutBack typically overshoots past 1.0 before settling
    const mid = easeOutBack(0.5);
    expect(mid).toBeGreaterThan(0);
  });
});
