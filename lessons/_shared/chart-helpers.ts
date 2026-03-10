// Shared chart drawing utilities for lessons

import { colors } from '../../engine/shared/design-tokens';
import { easeOut } from '../../engine/animation/tween';
import { clamp } from '../../engine/shared/math-utils';

export interface BarChartArea {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface BarChartOpts {
  highlightIdx?: number;
  highlightColor?: string;
  maxVal?: number;
}

export function drawBarChart(
  ctx: CanvasRenderingContext2D,
  probs: number[],
  labels: string[],
  barColor: string,
  area: BarChartArea,
  progress: number,
  opts: BarChartOpts = {},
): void {
  const { highlightIdx = -1, highlightColor = colors.warning } = opts;
  const n = probs.length;
  const barW = (area.w * 0.7) / n;
  const gap = barW * 0.3;
  const totalW = n * barW + (n - 1) * gap;
  const startX = area.x + (area.w - totalW) / 2;
  const maxVal = opts.maxVal || Math.max(...probs, 0.01);

  for (let i = 0; i < n; i++) {
    const x = startX + i * (barW + gap);
    const barH = (probs[i] / maxVal) * area.h * 0.8 * easeOut(clamp(progress * 1.5 - i * 0.08, 0, 1));
    const y = area.y + area.h - barH;

    ctx.fillStyle = (i === highlightIdx) ? highlightColor : barColor;
    ctx.fillRect(x, y, barW, barH);

    // Label
    ctx.fillStyle = colors.textDimmed;
    ctx.font = '11px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(labels[i], x + barW / 2, area.y + area.h + 4);

    // Value above bar
    if (progress > 0.3) {
      ctx.fillStyle = colors.textMuted;
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.textBaseline = 'bottom';
      ctx.fillText(probs[i].toFixed(3), x + barW / 2, y - 2);
    }
  }
}
