// Shared utilities for diffusion model visualizations

import { colors, series } from '../../engine/shared/design-tokens';
import { easeOut, easeInOut } from '../../engine/animation/tween';
import { drawSimpleArrow } from './network-utils';

/** Draw a forward/reverse diffusion chain diagram */
export function drawDiffusionChain(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number,
  nSteps: number,
  progress: number,
  opts: { showReverse?: boolean; forwardLabel?: string; reverseLabel?: string; stepLabels?: string[] } = {},
): void {
  if (progress <= 0) return;
  const { showReverse = false, forwardLabel, reverseLabel, stepLabels } = opts;
  const p = easeOut(Math.min(progress, 1));

  ctx.save();
  ctx.globalAlpha = p;

  const spacing = w / (nSteps - 1);
  const nodeR = 14;

  // Draw nodes
  for (let i = 0; i < nSteps; i++) {
    const cx = x + i * spacing;
    const alpha = i / (nSteps - 1);
    const nodeColor = i === 0 ? colors.insight : i === nSteps - 1 ? colors.textDimmed : colors.accent;

    ctx.beginPath();
    ctx.arc(cx, y, nodeR, 0, Math.PI * 2);
    ctx.fillStyle = nodeColor + '30';
    ctx.fill();
    ctx.strokeStyle = nodeColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Node label
    if (stepLabels && stepLabels[i]) {
      ctx.fillStyle = colors.textSecondary;
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stepLabels[i], cx, y + nodeR + 14);
    }

    // Noise indicator (dots inside node increasing with t)
    const noiseDots = Math.floor(alpha * 5);
    for (let d = 0; d < noiseDots; d++) {
      const angle = (d / noiseDots) * Math.PI * 2;
      const dr = nodeR * 0.5;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * dr, y + Math.sin(angle) * dr, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = colors.textDimmed;
      ctx.fill();
    }
  }

  // Forward arrows (top)
  for (let i = 0; i < nSteps - 1; i++) {
    const sx = x + i * spacing + nodeR + 4;
    const ex = x + (i + 1) * spacing - nodeR - 4;
    drawSimpleArrow(ctx, sx, y - 6, ex, y - 6, 1, colors.error + '80', 6);
  }

  // Forward label
  if (forwardLabel) {
    ctx.fillStyle = colors.error;
    ctx.font = '10px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(forwardLabel, x + w / 2, y - nodeR - 12);
  }

  // Reverse arrows (bottom)
  if (showReverse) {
    for (let i = nSteps - 1; i > 0; i--) {
      const sx = x + i * spacing - nodeR - 4;
      const ex = x + (i - 1) * spacing + nodeR + 4;
      drawSimpleArrow(ctx, sx, y + 6, ex, y + 6, 1, colors.insight + '80', 6);
    }
    if (reverseLabel) {
      ctx.fillStyle = colors.insight;
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(reverseLabel, x + w / 2, y + nodeR + 28);
    }
  }

  ctx.restore();
}

/** Draw a noise schedule curve (beta or alpha_bar vs timestep) */
export function drawScheduleCurve(
  ctx: CanvasRenderingContext2D,
  values: number[],
  x: number, y: number, w: number, h: number,
  progress: number,
  color: string = colors.accent,
  label = '',
): void {
  if (progress <= 0) return;
  const p = easeOut(Math.min(progress, 1));
  const T = values.length;
  const maxVal = Math.max(...values) * 1.1;

  ctx.save();
  ctx.globalAlpha = p;

  // Axes
  ctx.strokeStyle = colors.axis;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.stroke();

  // Curve
  const nDraw = Math.floor(T * p);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < nDraw; i++) {
    const px = x + (i / (T - 1)) * w;
    const py = y + h - (values[i] / maxVal) * h;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Label
  if (label) {
    ctx.fillStyle = color;
    ctx.font = '11px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y - 6);
  }

  ctx.restore();
}
