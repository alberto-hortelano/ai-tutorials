// Shared utilities for drawing vector fields (score functions, gradients)

import { colors } from '../../engine/shared/design-tokens';
import { easeOut } from '../../engine/animation/tween';

export type VectorFn = (x: number, y: number) => { vx: number; vy: number };

/** Draw a 2D vector field as a grid of arrows */
export function drawVectorField(
  ctx: CanvasRenderingContext2D,
  vectorFn: VectorFn,
  toScreenX: (x: number) => number,
  toScreenY: (y: number) => number,
  xMin: number, xMax: number, yMin: number, yMax: number,
  gridN: number,
  progress: number,
  opts: { color?: string; maxLength?: number; headSize?: number } = {},
): void {
  if (progress <= 0) return;
  const { color = colors.accent, maxLength = 25, headSize = 4 } = opts;
  const p = easeOut(Math.min(progress, 1));

  ctx.save();
  ctx.globalAlpha = p * 0.7;

  const dx = (xMax - xMin) / gridN;
  const dy = (yMax - yMin) / gridN;

  for (let i = 0; i <= gridN; i++) {
    for (let j = 0; j <= gridN; j++) {
      const x = xMin + i * dx;
      const y = yMin + j * dy;
      const { vx, vy } = vectorFn(x, y);

      const mag = Math.sqrt(vx * vx + vy * vy);
      if (mag < 1e-6) continue;

      const scale = Math.min(maxLength, mag * maxLength) / mag;
      const sx = toScreenX(x);
      const sy = toScreenY(y);
      const ex = sx + vx * scale * p;
      const ey = sy - vy * scale * p; // flip y

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // Arrowhead
      if (p > 0.5) {
        const angle = Math.atan2(ey - sy, ex - sx);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - headSize * Math.cos(angle - 0.5), ey - headSize * Math.sin(angle - 0.5));
        ctx.lineTo(ex - headSize * Math.cos(angle + 0.5), ey - headSize * Math.sin(angle + 0.5));
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  ctx.restore();
}

/** Draw contour lines for a 2D scalar field (used for probability density) */
export function drawContours(
  ctx: CanvasRenderingContext2D,
  scalarFn: (x: number, y: number) => number,
  toScreenX: (x: number) => number,
  toScreenY: (y: number) => number,
  xMin: number, xMax: number, yMin: number, yMax: number,
  levels: number[],
  progress: number,
  color = colors.accent,
): void {
  if (progress <= 0) return;
  const p = easeOut(Math.min(progress, 1));
  const resolution = 80;
  const dx = (xMax - xMin) / resolution;
  const dy = (yMax - yMin) / resolution;

  ctx.save();
  ctx.globalAlpha = p * 0.4;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  // Simple marching squares for each level
  for (const level of levels) {
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const x0 = xMin + i * dx, y0 = yMin + j * dy;
        const x1 = x0 + dx, y1 = y0 + dy;
        const v00 = scalarFn(x0, y0) - level;
        const v10 = scalarFn(x1, y0) - level;
        const v01 = scalarFn(x0, y1) - level;
        const v11 = scalarFn(x1, y1) - level;

        // Check for sign changes on edges
        const edges: [number, number, number, number][] = [];
        if (v00 * v10 < 0) {
          const t = v00 / (v00 - v10);
          edges.push([x0 + t * dx, y0, 0, 0]);
        }
        if (v10 * v11 < 0) {
          const t = v10 / (v10 - v11);
          edges.push([x1, y0 + t * dy, 0, 0]);
        }
        if (v01 * v11 < 0) {
          const t = v01 / (v01 - v11);
          edges.push([x0 + t * dx, y1, 0, 0]);
        }
        if (v00 * v01 < 0) {
          const t = v00 / (v00 - v01);
          edges.push([x0, y0 + t * dy, 0, 0]);
        }

        if (edges.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(toScreenX(edges[0][0]), toScreenY(edges[0][1]));
          ctx.lineTo(toScreenX(edges[1][0]), toScreenY(edges[1][1]));
          ctx.stroke();
        }
      }
    }
  }

  ctx.restore();
}

/** Draw particles with trailing paths on an energy landscape */
export function drawParticles(
  ctx: CanvasRenderingContext2D,
  positions: { x: number; y: number }[],
  toScreenX: (x: number) => number,
  toScreenY: (y: number) => number,
  progress: number,
  color = colors.warning,
  radius = 4,
): void {
  if (progress <= 0) return;
  const p = easeOut(Math.min(progress, 1));

  ctx.save();
  ctx.globalAlpha = p;

  for (const pos of positions) {
    const sx = toScreenX(pos.x);
    const sy = toScreenY(pos.y);
    ctx.beginPath();
    ctx.arc(sx, sy, radius * p, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  ctx.restore();
}
