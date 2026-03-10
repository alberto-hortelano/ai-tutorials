// Scene 1: Self-information / Surprise

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { animateCurve } from '../../engine/animation/graph';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

/** Draw a single binary code block: label, then bit squares */
function drawBinaryCode(
  ctx: CanvasRenderingContext2D,
  label: string, labelColor: string,
  bits: string, // e.g. '0' or '10010'
  x: number, y: number,
  progress: number,
  opts: { bitSize?: number; gap?: number } = {},
): void {
  if (progress <= 0) return;
  const { bitSize = 14, gap = 3 } = opts;

  ctx.save();
  ctx.globalAlpha = progress;

  // Label
  ctx.fillStyle = labelColor;
  ctx.font = 'bold 11px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y + bitSize / 2);

  // Bit boxes
  const bitsStartX = x + ctx.measureText(label).width + 10;
  const visibleBits = Math.ceil(bits.length * Math.min(progress * 1.3, 1));
  for (let i = 0; i < visibleBits; i++) {
    const bx = bitsStartX + i * (bitSize + gap);
    ctx.fillStyle = bits[i] === '1' ? series[0] + 'cc' : colors.border;
    ctx.fillRect(bx, y, bitSize, bitSize);
    ctx.fillStyle = colors.textPrimary;
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(bits[i], bx + bitSize / 2, y + bitSize / 2);
  }

  ctx.restore();
}

export const scene1 = new Scene({
  id: () => tx('scene1', 'id'),
  duration: 20,
  narration: () => tx('scene1', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene1 as SceneText)?.subtitleCues ?? (text.es.scene1 as SceneText).subtitleCues,
  topic: () => tx('scene1', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.setViewport(0, 1.05, -0.5, 5);
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene1', 'title'), W / 2, 30, easedSub(progress, 0, 0.1), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif'
    });

    // Axes
    const axesP = easedSub(progress, 0.05, 0.2);
    if (axesP > 0) {
      ctx.globalAlpha = axesP;
      r.drawAxes({ xLabel: 'p(x)', yLabel: 'I(x) = \u2212log\u2082 p(x)', xTicks: 5, yTicks: 5 });
      ctx.globalAlpha = 1;
    }

    // Curve: I(x) = -log2(p)
    const infoFn = (p: number): number => p > 0.001 ? -Math.log2(p) : 5;
    const curveP = easedSub(progress, 0.15, 0.5);
    if (curveP > 0) {
      animateCurve(r, infoFn, series[0], curveP, 2.5);
    }

    // Annotations
    const annoP = easedSub(progress, 0.5, 0.65);
    if (annoP > 0) {
      // Fair coin: p=0.5 -> I=1
      const px1 = r.toX(0.5), py1 = r.toY(1);
      r.dot(0.5, 1, 5 * annoP, colors.insight);
      fadeInText(ctx, tx('scene1', 'fairCoin'), px1 + 10, py1 - 12, annoP, {
        color: colors.insight, font: '11px "Segoe UI", system-ui, sans-serif', align: 'left'
      });
    }

    const anno2P = easedSub(progress, 0.6, 0.75);
    if (anno2P > 0) {
      // Rare event: p=0.05 -> I~4.3
      const info = -Math.log2(0.05);
      r.dot(0.05, info, 5 * anno2P, colors.error);
      fadeInText(ctx, tx('scene1', 'rareEvent', info.toFixed(1)), r.toX(0.05) + 10, r.toY(info) + 15, anno2P, {
        color: colors.error, font: '11px "Segoe UI", system-ui, sans-serif', align: 'left'
      });
    }

    // Certain event
    const anno3P = easedSub(progress, 0.7, 0.82);
    if (anno3P > 0) {
      r.dot(0.95, -Math.log2(0.95), 5 * anno3P, colors.warning);
      fadeInText(ctx, tx('scene1', 'almostCertain'), r.toX(0.95) - 10, r.toY(-Math.log2(0.95)) - 15, anno3P, {
        color: colors.warning, font: '11px "Segoe UI", system-ui, sans-serif', align: 'right'
      });
    }

    // --- NEW PHASE: Bits needed to encode ---
    const bitsPhase = easedSub(progress, 0.78, 0.97);
    if (bitsPhase > 0) {
      // Background panel
      const panelX = W * 0.52;
      const panelY = H * 0.12;
      const panelW = W * 0.46;
      const panelH = H * 0.38;

      ctx.save();
      ctx.globalAlpha = bitsPhase * 0.85;
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Rounded rectangle
      const rad = 8;
      ctx.moveTo(panelX + rad, panelY);
      ctx.lineTo(panelX + panelW - rad, panelY);
      ctx.arcTo(panelX + panelW, panelY, panelX + panelW, panelY + rad, rad);
      ctx.lineTo(panelX + panelW, panelY + panelH - rad);
      ctx.arcTo(panelX + panelW, panelY + panelH, panelX + panelW - rad, panelY + panelH, rad);
      ctx.lineTo(panelX + rad, panelY + panelH);
      ctx.arcTo(panelX, panelY + panelH, panelX, panelY + panelH - rad, rad);
      ctx.lineTo(panelX, panelY + rad);
      ctx.arcTo(panelX, panelY, panelX + rad, panelY, rad);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Panel title
      fadeInText(ctx, tx('scene1', 'bitsTitle'), panelX + panelW / 2, panelY + 18, bitsPhase, {
        color: colors.accent, font: 'bold 12px "Segoe UI", system-ui, sans-serif'
      });

      // Common event: p=0.5 -> 1 bit -> code '0'
      const row1P = easedSub(progress, 0.80, 0.88);
      drawBinaryCode(ctx, 'p=0.5 \u2192 1 bit:  ', colors.insight, '0', panelX + 12, panelY + 38, row1P);

      // Medium event: p=0.125 -> 3 bits -> code '110'
      const row2P = easedSub(progress, 0.84, 0.92);
      drawBinaryCode(ctx, 'p=0.125 \u2192 3 bits:', colors.warning, '110', panelX + 12, panelY + 62, row2P);

      // Rare event: p=0.03 -> ~5 bits -> code '10010'
      const row3P = easedSub(progress, 0.88, 0.96);
      drawBinaryCode(ctx, 'p=0.03 \u2192 5 bits: ', colors.error, '10010', panelX + 12, panelY + 86, row3P);

      // Connecting insight
      const connP = easedSub(progress, 0.92, 0.97);
      fadeInText(ctx, tx('scene1', 'bitsInsight'), panelX + panelW / 2, panelY + panelH - 14, connP, {
        color: colors.textDimmed, font: '10px "Segoe UI", system-ui, sans-serif'
      });
    }
  }
});
