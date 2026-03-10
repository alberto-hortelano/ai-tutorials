// Text animation primitives — fade-in, typewriter
import { easeOut, easeInOut, subProgress } from './tween';

export interface FadeInTextOptions {
  color?: string;
  font?: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  slideY?: number;
}

export interface TypewriterOptions {
  color?: string;
  font?: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
}

export interface LabelOptions {
  color?: string;
  font?: string;
  lineColor?: string;
  align?: CanvasTextAlign;
}

/**
 * Draw text with fade-in effect.
 */
export function fadeInText(ctx: CanvasRenderingContext2D, text: string, px: number, py: number, progress: number, opts: FadeInTextOptions = {}): void {
  if (progress <= 0) return;
  const { color = '#f8fafc', font = '14px "Segoe UI", system-ui, sans-serif',
          align = 'center', baseline = 'middle', slideY = 8 } = opts;

  const t = easeOut(Math.min(progress, 1));
  ctx.save();
  ctx.globalAlpha = t;
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(text, px, py + slideY * (1 - t));
  ctx.restore();
}

/**
 * Typewriter effect — reveals text character by character.
 */
export function typewriterText(ctx: CanvasRenderingContext2D, text: string, px: number, py: number, progress: number, opts: TypewriterOptions = {}): void {
  if (progress <= 0) return;
  const { color = '#f8fafc', font = '14px "Segoe UI", system-ui, sans-serif',
          align = 'left', baseline = 'middle' } = opts;

  const numChars = Math.floor(text.length * Math.min(progress, 1));
  const visible = text.substring(0, numChars);

  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(visible, px, py);
}

/**
 * Draw a label with a connecting line from data point to offset position.
 * Good for annotating curves.
 */
export function animateLabel(ctx: CanvasRenderingContext2D, text: string, fromPx: number, fromPy: number, toPx: number, toPy: number, progress: number, opts: LabelOptions = {}): void {
  if (progress <= 0) return;
  const { color = '#94a3b8', font = '11px "Segoe UI", system-ui, sans-serif',
          lineColor, align = 'left' } = opts;

  const t = easeInOut(Math.min(progress, 1));

  // Connecting line
  ctx.save();
  ctx.globalAlpha = t;
  ctx.strokeStyle = lineColor || color;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(fromPx, fromPy);
  ctx.lineTo(fromPx + (toPx - fromPx) * t, fromPy + (toPy - fromPy) * t);
  ctx.stroke();
  ctx.setLineDash([]);

  // Text
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, toPx, toPy);
  ctx.restore();
}
