// Canvas utilities extracted from existing visualizations

import type { CoordMapper, MathFn } from '../types';

/** Setup canvas for HiDPI. Returns { ctx, w, h } in CSS pixels. */
export function setupCanvas(canvas: HTMLCanvasElement): { ctx: CanvasRenderingContext2D; w: number; h: number } {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);
  return { ctx, w: rect.width, h: rect.height };
}

/** Draw a curve from a function, evaluating fn(x) for x in [xMin, xMax]. */
export function drawCurve(ctx: CanvasRenderingContext2D, toX: CoordMapper, toY: CoordMapper, xMin: number, xMax: number, fn: MathFn, color: string, lineWidth: number = 2): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  const steps = 400;
  const step = (xMax - xMin) / steps;
  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * step;
    const px = toX(x), py = toY(fn(x));
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();
}

/** Fill area under a curve down to y=0. */
export function fillCurve(ctx: CanvasRenderingContext2D, toX: CoordMapper, toY: CoordMapper, xMin: number, xMax: number, fn: MathFn, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  const steps = 400;
  const step = (xMax - xMin) / steps;
  ctx.moveTo(toX(xMin), toY(0));
  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * step;
    ctx.lineTo(toX(x), toY(fn(x)));
  }
  ctx.lineTo(toX(xMax), toY(0));
  ctx.closePath();
  ctx.fill();
}

/** Fill region between two curves. */
export function fillBetween(ctx: CanvasRenderingContext2D, toX: CoordMapper, toY: CoordMapper, xMin: number, xMax: number, fnTop: MathFn, fnBottom: MathFn, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  const steps = 400;
  const step = (xMax - xMin) / steps;
  ctx.moveTo(toX(xMin), toY(fnTop(xMin)));
  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * step;
    ctx.lineTo(toX(x), toY(fnTop(x)));
  }
  for (let i = steps; i >= 0; i--) {
    const x = xMin + i * step;
    ctx.lineTo(toX(x), toY(fnBottom(x)));
  }
  ctx.closePath();
  ctx.fill();
}

/** Draw a partial curve (from xMin to xEnd), useful for progressive reveal. */
export function drawCurvePartial(ctx: CanvasRenderingContext2D, toX: CoordMapper, toY: CoordMapper, xMin: number, xEnd: number, fn: MathFn, color: string, lineWidth: number = 2): void {
  if (xEnd <= xMin) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  const steps = Math.max(10, Math.round(400 * (xEnd - xMin) / 10));
  const step = (xEnd - xMin) / steps;
  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * step;
    const px = toX(x), py = toY(fn(x));
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();
}

/** Fill partial area under a curve. */
export function fillCurvePartial(ctx: CanvasRenderingContext2D, toX: CoordMapper, toY: CoordMapper, xMin: number, xEnd: number, fn: MathFn, color: string): void {
  if (xEnd <= xMin) return;
  ctx.fillStyle = color;
  ctx.beginPath();
  const steps = Math.max(10, Math.round(400 * (xEnd - xMin) / 10));
  const step = (xEnd - xMin) / steps;
  ctx.moveTo(toX(xMin), toY(0));
  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * step;
    ctx.lineTo(toX(x), toY(fn(x)));
  }
  ctx.lineTo(toX(xEnd), toY(0));
  ctx.closePath();
  ctx.fill();
}

/** Rounded rectangle helper. */
export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
