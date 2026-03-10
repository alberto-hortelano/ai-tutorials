// Graph animation primitives — curves, morphing, fills
import { subProgress, easeInOut } from './tween';
import { lerp } from '../shared/math-utils';
import type { Renderer } from '../renderer';
import type { MathFn, EasingFn } from '../types';

/**
 * Animate a curve drawing left-to-right.
 */
export function animateCurve(r: Renderer, fn: MathFn, color: string, progress: number, lineWidth: number = 2.5): void {
  if (progress <= 0) return;
  const xEnd = r.xMin + (r.xMax - r.xMin) * Math.min(progress, 1);
  r.drawCurvePartial(xEnd, fn, color, lineWidth);
}

/**
 * Animate fill under a curve.
 */
export function animateFill(r: Renderer, fn: MathFn, color: string, progress: number): void {
  if (progress <= 0) return;
  const xEnd = r.xMin + (r.xMax - r.xMin) * Math.min(progress, 1);
  r.fillCurvePartial(xEnd, fn, color);
}

/**
 * Morph between two functions over progress 0-1.
 * Returns a function f(x) that interpolates between fnFrom and fnTo.
 */
export function morphFn(fnFrom: MathFn, fnTo: MathFn, t: number): MathFn {
  const s = easeInOut(Math.max(0, Math.min(1, t)));
  return (x: number) => lerp(fnFrom(x), fnTo(x), s);
}

/**
 * Animate morphing between two curves.
 */
export function animateMorph(r: Renderer, fnFrom: MathFn, fnTo: MathFn, color: string, progress: number, lineWidth: number = 2.5): void {
  const fn = morphFn(fnFrom, fnTo, progress);
  r.drawCurve(fn, color, lineWidth);
}

/**
 * Animate fill between two curves appearing.
 */
export function animateFillBetween(r: Renderer, fnTop: MathFn, fnBottom: MathFn, color: string, progress: number): void {
  if (progress <= 0) return;
  const { ctx } = r;
  ctx.globalAlpha = Math.min(progress * 2, 1);
  r.fillBetween(fnTop, fnBottom, color);
  ctx.globalAlpha = 1;
}

export interface VerticalLineAnimOptions {
  lineWidth?: number;
  dash?: number[];
}

/**
 * Animate a vertical line appearing (grows from bottom).
 */
export function animateVerticalLine(r: Renderer, x: number, color: string, progress: number, opts: VerticalLineAnimOptions = {}): void {
  if (progress <= 0) return;
  const { ctx } = r;
  const px = r.toX(x);
  const bottomY = r.toY(r.yMin);
  const topY = r.toY(r.yMax);
  const currentY = bottomY + (topY - bottomY) * easeInOut(Math.min(progress, 1));

  ctx.strokeStyle = color;
  ctx.lineWidth = opts.lineWidth || 1.5;
  ctx.setLineDash(opts.dash || [6, 4]);
  ctx.beginPath();
  ctx.moveTo(px, bottomY);
  ctx.lineTo(px, currentY);
  ctx.stroke();
  ctx.setLineDash([]);
}

export interface BarData {
  label: string;
  value: number;
  color: string;
}

export interface BarChartArea {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Draw bar chart bars with animated width.
 */
export function animateBars(ctx: CanvasRenderingContext2D, bars: BarData[], progress: number, area: BarChartArea): void {
  const barH = Math.min(28, (area.h - 10 * (bars.length - 1)) / bars.length);
  const gap = 10;
  const maxVal = Math.max(...bars.map(b => Math.abs(b.value)), 0.01);
  const scale = (area.w * 0.7) / maxVal;

  bars.forEach((bar, i) => {
    const by = area.y + i * (barH + gap);
    const bw = bar.value * scale * easeInOut(Math.min(progress, 1));

    // Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(bar.label, area.x + area.w * 0.25 - 8, by + barH / 2);

    // Bar
    const barStart = area.x + area.w * 0.25;
    ctx.fillStyle = bar.color;
    if (bw >= 0) {
      ctx.fillRect(barStart, by, bw, barH);
    } else {
      ctx.fillRect(barStart + bw, by, -bw, barH);
    }

    // Value
    ctx.fillStyle = bar.color;
    ctx.textAlign = 'left';
    ctx.fillText(bar.value.toFixed(3), barStart + bw + 5, by + barH / 2);
  });
}
