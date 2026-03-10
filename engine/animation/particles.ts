// Particles — sample visualization, scatter points
import { easeOut } from './tween';
import type { Renderer } from '../renderer';

export interface Point {
  x: number;
  y: number;
}

export interface DotsOptions {
  color?: string;
  radius?: number;
  stroke?: string | null;
  sequential?: boolean;
}

/**
 * Animate dots appearing in sequence.
 */
export function animateDots(ctx: CanvasRenderingContext2D, points: Point[], progress: number, opts: DotsOptions = {}): void {
  if (progress <= 0 || points.length === 0) return;
  const { color = '#fbbf24', radius = 4, stroke = null, sequential = true } = opts;

  const n = points.length;
  const visibleCount = sequential
    ? Math.floor(n * Math.min(progress, 1))
    : n;

  for (let i = 0; i < visibleCount; i++) {
    const p = points[i];
    const dotProgress = sequential
      ? Math.min(1, (progress * n - i))
      : Math.min(progress, 1);

    const r = radius * easeOut(Math.min(dotProgress, 1));
    if (r <= 0) continue;

    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = sequential ? Math.min(dotProgress, 0.85) : Math.min(progress * 2, 0.85);
    ctx.fill();

    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

/**
 * Animate scatter points in data coordinates using the renderer.
 */
export function animateScatter(r: Renderer, dataPoints: Point[], progress: number, opts: DotsOptions = {}): void {
  const pixelPoints = dataPoints.map(p => ({
    x: r.toX(p.x),
    y: r.toY(p.y),
  }));
  animateDots(r.ctx, pixelPoints, progress, opts);
}
