// Shared utilities for GAN visualizations

import { colors, series } from '../../engine/shared/design-tokens';
import { easeOut } from '../../engine/animation/tween';
import { drawBlock, drawSimpleArrow } from './network-utils';

/** Draw Generator → Discriminator architecture diagram */
export function drawGanArchitecture(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  progress: number,
  opts: { gLabel?: string; dLabel?: string; showConditional?: boolean; condLabel?: string } = {},
): void {
  if (progress <= 0) return;
  const { gLabel = 'G', dLabel = 'D', showConditional = false, condLabel = 'y' } = opts;
  const p = easeOut(Math.min(progress, 1));

  const blockW = w * 0.18;
  const blockH = h * 0.4;
  const midY = y + h / 2 - blockH / 2;

  // Noise z
  ctx.save();
  ctx.globalAlpha = p;
  ctx.fillStyle = colors.textMuted;
  ctx.font = '11px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('z ~ N(0,I)', x + blockW * 0.3, midY + blockH / 2);

  // Generator block
  const gx = x + w * 0.2;
  drawBlock(ctx, gx, midY, blockW, blockH, gLabel, p, colors.accent);

  // Arrow z → G
  drawSimpleArrow(ctx, x + blockW * 0.6, midY + blockH / 2, gx - 4, midY + blockH / 2, p, colors.textMuted);

  // Fake samples
  const fakeX = gx + blockW + w * 0.06;
  ctx.fillStyle = colors.error + '60';
  ctx.font = '10px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('x_fake', fakeX + blockW * 0.3, midY - 5);

  // Arrow G → fake
  drawSimpleArrow(ctx, gx + blockW + 4, midY + blockH / 2, fakeX, midY + blockH / 2, p, colors.textMuted);

  // Discriminator block
  const dx = x + w * 0.65;
  drawBlock(ctx, dx, midY, blockW, blockH, dLabel, p, series[2]);

  // Arrow fake → D
  drawSimpleArrow(ctx, fakeX + blockW * 0.6, midY + blockH / 2, dx - 4, midY + blockH / 2, p, colors.error);

  // Real data arrow → D (from top)
  drawSimpleArrow(ctx, dx + blockW / 2, midY - 25, dx + blockW / 2, midY - 4, p, colors.insight);
  ctx.fillStyle = colors.insight;
  ctx.font = '10px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('x_real', dx + blockW / 2, midY - 30);

  // D output
  const outX = dx + blockW + w * 0.05;
  drawSimpleArrow(ctx, dx + blockW + 4, midY + blockH / 2, outX + 30, midY + blockH / 2, p, colors.textMuted);
  ctx.fillStyle = colors.warning;
  ctx.font = '11px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('D(x) ∈ [0,1]', outX + 55, midY + blockH / 2 + 4);

  // Conditional label input
  if (showConditional) {
    ctx.fillStyle = colors.warning;
    ctx.font = '10px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(condLabel, gx + blockW / 2, midY + blockH + 15);
    ctx.fillText(condLabel, dx + blockW / 2, midY + blockH + 15);
    // Arrows from label into G and D
    drawSimpleArrow(ctx, gx + blockW / 2, midY + blockH + 8, gx + blockW / 2, midY + blockH + 2, p, colors.warning, 5);
    drawSimpleArrow(ctx, dx + blockW / 2, midY + blockH + 8, dx + blockW / 2, midY + blockH + 2, p, colors.warning, 5);
  }

  ctx.restore();
}

/** Draw real vs fake sample clouds */
export function drawSampleClouds(
  ctx: CanvasRenderingContext2D,
  realPoints: { x: number; y: number }[],
  fakePoints: { x: number; y: number }[],
  toX: (x: number) => number,
  toY: (y: number) => number,
  progress: number,
  opts: { realColor?: string; fakeColor?: string; radius?: number } = {},
): void {
  if (progress <= 0) return;
  const { realColor = colors.insight, fakeColor = colors.error, radius = 3 } = opts;
  const p = easeOut(Math.min(progress, 1));

  ctx.save();
  ctx.globalAlpha = p * 0.7;

  // Real samples
  for (const pt of realPoints) {
    ctx.beginPath();
    ctx.arc(toX(pt.x), toY(pt.y), radius, 0, Math.PI * 2);
    ctx.fillStyle = realColor;
    ctx.fill();
  }

  // Fake samples
  for (const pt of fakePoints) {
    ctx.beginPath();
    ctx.arc(toX(pt.x), toY(pt.y), radius, 0, Math.PI * 2);
    ctx.fillStyle = fakeColor;
    ctx.fill();
  }

  ctx.restore();
}

/** Draw a decision boundary line */
export function drawDecisionBoundary(
  ctx: CanvasRenderingContext2D,
  boundaryFn: (x: number) => number,
  toX: (x: number) => number,
  toY: (y: number) => number,
  xMin: number, xMax: number,
  progress: number,
  color = colors.warning,
): void {
  if (progress <= 0) return;
  const p = easeOut(Math.min(progress, 1));
  const steps = 200;
  const dx = (xMax - xMin) / steps;
  const nDraw = Math.floor(steps * p);

  ctx.save();
  ctx.globalAlpha = p;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);

  ctx.beginPath();
  for (let i = 0; i <= nDraw; i++) {
    const x = xMin + i * dx;
    const y = boundaryFn(x);
    const sx = toX(x), sy = toY(y);
    if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}
