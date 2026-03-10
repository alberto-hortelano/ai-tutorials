// Shared utilities for drawing neural network diagrams

import { colors } from '../../engine/shared/design-tokens';
import { easeOut } from '../../engine/animation/tween';

export interface LayerSpec {
  n: number;        // number of units
  label?: string;
  color?: string;
}

/** Draw a feed-forward network diagram (vertical layers of circles with connections) */
export function drawNetwork(
  ctx: CanvasRenderingContext2D,
  layers: LayerSpec[],
  x: number, y: number, w: number, h: number,
  progress: number,
  opts: { nodeRadius?: number; maxNodes?: number; showBias?: boolean } = {},
): void {
  if (progress <= 0 || layers.length === 0) return;
  const { nodeRadius = 10, maxNodes = 6 } = opts;
  const p = easeOut(Math.min(progress, 1));

  ctx.save();
  ctx.globalAlpha = p;

  const layerSpacing = w / (layers.length - 1 || 1);

  // Compute node positions
  const positions: { cx: number; cy: number }[][] = [];
  for (let l = 0; l < layers.length; l++) {
    const n = Math.min(layers[l].n, maxNodes);
    const cx = x + l * layerSpacing;
    const nodeSpacing = h / (n + 1);
    const layerPos: { cx: number; cy: number }[] = [];
    for (let i = 0; i < n; i++) {
      layerPos.push({ cx, cy: y + nodeSpacing * (i + 1) });
    }
    positions.push(layerPos);
  }

  // Draw connections
  for (let l = 0; l < positions.length - 1; l++) {
    const from = positions[l];
    const to = positions[l + 1];
    ctx.strokeStyle = colors.textDimmed + '60';
    ctx.lineWidth = 0.8;
    for (const f of from) {
      for (const t of to) {
        ctx.beginPath();
        ctx.moveTo(f.cx + nodeRadius, f.cy);
        ctx.lineTo(t.cx - nodeRadius, t.cy);
        ctx.stroke();
      }
    }
  }

  // Draw nodes
  for (let l = 0; l < positions.length; l++) {
    const layerColor = layers[l].color || colors.accent;
    for (const pos of positions[l]) {
      ctx.beginPath();
      ctx.arc(pos.cx, pos.cy, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = layerColor + '30';
      ctx.fill();
      ctx.strokeStyle = layerColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Ellipsis if truncated
    if (layers[l].n > maxNodes) {
      const lastPos = positions[l][positions[l].length - 1];
      ctx.fillStyle = colors.textMuted;
      ctx.font = '14px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('...', lastPos.cx, lastPos.cy + nodeRadius + 14);
    }

    // Layer label
    if (layers[l].label) {
      ctx.fillStyle = colors.textSecondary;
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(layers[l].label!, positions[l][0].cx, y - 8);
    }
  }

  ctx.restore();
}

/** Draw a labeled block (used for encoder/decoder/generator/discriminator boxes) */
export function drawBlock(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  label: string,
  progress: number,
  color: string = colors.accent,
): void {
  if (progress <= 0) return;
  const p = easeOut(Math.min(progress, 1));

  ctx.save();
  ctx.globalAlpha = p;

  // Rounded rect
  const r = 8;
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

  ctx.fillStyle = color + '20';
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Label
  ctx.fillStyle = color;
  ctx.font = 'bold 12px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + h / 2);

  ctx.restore();
}

/** Draw a simple arrow between two points */
export function drawSimpleArrow(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  progress: number,
  color: string = colors.textMuted,
  headSize = 8,
): void {
  if (progress <= 0) return;
  const p = easeOut(Math.min(progress, 1));
  const ex = x1 + (x2 - x1) * p;
  const ey = y1 + (y2 - y1) * p;

  ctx.save();
  ctx.globalAlpha = p;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  if (p > 0.8) {
    const angle = Math.atan2(ey - y1, ex - x1);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - headSize * Math.cos(angle - 0.35), ey - headSize * Math.sin(angle - 0.35));
    ctx.lineTo(ex - headSize * Math.cos(angle + 0.35), ey - headSize * Math.sin(angle + 0.35));
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}
