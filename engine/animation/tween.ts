// Tween utilities — interpolation, easings, subProgress

import type { EasingFn } from '../types';

/**
 * Extract local progress for a sub-range of a scene.
 * E.g. subProgress(0.5, 0.2, 0.8) = 0.5 (halfway through the sub-range).
 * Returns 0 before start, 1 after end, linear in between.
 */
export function subProgress(progress: number, start: number, end: number): number {
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return (progress - start) / (end - start);
}

// --- Easing functions ---

export function linear(t: number): number { return t; }

export function easeInQuad(t: number): number { return t * t; }
export function easeOutQuad(t: number): number { return t * (2 - t); }
export function easeInOutQuad(t: number): number { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

export function easeInCubic(t: number): number { return t * t * t; }
export function easeOutCubic(t: number): number { return (--t) * t * t + 1; }
export function easeInOutCubic(t: number): number { return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; }

export function easeOutBack(t: number): number {
  const c = 1.70158;
  return 1 + (--t) * t * (c * t + c + t);
}

export function easeInOutSine(t: number): number { return -(Math.cos(Math.PI * t) - 1) / 2; }

// Convenience aliases
export const easeIn: EasingFn = easeInCubic;
export const easeOut: EasingFn = easeOutCubic;
export const easeInOut: EasingFn = easeInOutCubic;

/**
 * Apply an easing to a subProgress range.
 * Usage: easedSub(progress, 0.2, 0.6, easeInOut)
 */
export function easedSub(progress: number, start: number, end: number, easingFn: EasingFn = easeInOut): number {
  return easingFn(subProgress(progress, start, end));
}

/** Lerp with easing. */
export function tweenValue(from: number, to: number, progress: number, start: number, end: number, easingFn: EasingFn = easeInOut): number {
  const t = easingFn(subProgress(progress, start, end));
  return from + (to - from) * t;
}

/** Lerp between two colors (hex strings). */
export function tweenColor(colorFrom: string, colorTo: string, t: number): string {
  const f = hexToRgb(colorFrom);
  const to = hexToRgb(colorTo);
  const r = Math.round(f.r + (to.r - f.r) * t);
  const g = Math.round(f.g + (to.g - f.g) * t);
  const b = Math.round(f.b + (to.b - f.b) * t);
  return `rgb(${r},${g},${b})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
