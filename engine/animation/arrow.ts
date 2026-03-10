// Arrow animation primitives
import { easeInOut } from './tween';

export interface ArrowAnimOptions {
  color?: string;
  lineWidth?: number;
  headSize?: number;
  dash?: number[];
}

export interface BracketOptions {
  color?: string;
  lineWidth?: number;
  label?: string;
  labelColor?: string;
}

/**
 * Animate an arrow growing from start to end.
 */
export function animateArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, progress: number, opts: ArrowAnimOptions = {}): void {
  if (progress <= 0) return;
  const { color = '#94a3b8', lineWidth = 2, headSize = 8, dash } = opts;

  const t = easeInOut(Math.min(progress, 1));
  const cx = x1 + (x2 - x1) * t;
  const cy = y1 + (y2 - y1) * t;
  const angle = Math.atan2(y2 - y1, x2 - x1);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  if (dash) ctx.setLineDash(dash);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(cx, cy);
  ctx.stroke();

  if (dash) ctx.setLineDash([]);

  // Arrowhead (only when sufficiently progressed)
  if (t > 0.1) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - headSize * Math.cos(angle - 0.4), cy - headSize * Math.sin(angle - 0.4));
    ctx.lineTo(cx - headSize * Math.cos(angle + 0.4), cy - headSize * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Animate a curly bracket between two y positions at given x.
 */
export function animateBracket(ctx: CanvasRenderingContext2D, x: number, y1: number, y2: number, progress: number, opts: BracketOptions = {}): void {
  if (progress <= 0) return;
  const { color = '#94a3b8', lineWidth = 1.5, label, labelColor } = opts;

  const t = easeInOut(Math.min(progress, 1));
  const midY = (y1 + y2) / 2;
  const extent = (y2 - y1) / 2 * t;

  ctx.save();
  ctx.globalAlpha = Math.min(t * 2, 1);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  ctx.beginPath();
  // Top part
  ctx.moveTo(x, midY - extent);
  ctx.quadraticCurveTo(x + 10, midY - extent * 0.5, x + 12, midY);
  // Bottom part
  ctx.quadraticCurveTo(x + 10, midY + extent * 0.5, x, midY + extent);
  ctx.stroke();

  // Label
  if (label && t > 0.5) {
    ctx.fillStyle = labelColor || color;
    ctx.font = '11px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + 18, midY);
  }

  ctx.restore();
}
