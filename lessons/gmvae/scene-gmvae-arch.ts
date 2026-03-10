// Scene 6: GMVAE Architecture — encoder-decoder with mixture prior and MC KL

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { formulaAppear } from '../../engine/animation/formula';
import { gaussian } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// Helper: draw a rounded box with label
function drawBlock(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  label: string, borderColor: string, alpha: number,
): void {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;

  // Box
  ctx.fillStyle = colors.panelBg;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const rad = 8;
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Label
  ctx.fillStyle = borderColor;
  ctx.font = 'bold 11px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + h / 2);

  ctx.restore();
}

export const scene6 = new Scene({
  id: () => tx('scene6', 'id'),
  duration: 25,
  narration: () => tx('scene6', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene6 as SceneText)?.subtitleCues ?? (text.es.scene6 as SceneText).subtitleCues,
  topic: () => tx('scene6', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene6', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Layout constants
    const midY = H * 0.42;
    const blockW = W * 0.18;
    const blockH = 44;

    // Positions for: x -> Encoder -> z -> Decoder -> x_hat
    //                                 |
    //                              Prior (mixture)
    const xPos = W * 0.06;
    const encX = W * 0.22;
    const zX = W * 0.46;
    const decX = W * 0.62;
    const xHatPos = W * 0.86;

    // ── Input x ──
    const inputP = easedSub(progress, 0.06, 0.18);
    if (inputP > 0) {
      ctx.save();
      ctx.globalAlpha = inputP;
      ctx.fillStyle = colors.textPrimary;
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('x', xPos, midY);
      ctx.restore();
    }

    // ── Encoder ──
    const encP = easedSub(progress, 0.12, 0.25);
    drawBlock(ctx, encX, midY - blockH / 2, blockW, blockH, tx('scene6', 'encoderLabel'), series[0], encP);

    // Arrow x -> encoder
    const arr1P = easedSub(progress, 0.1, 0.22);
    animateArrow(ctx, xPos + 12, midY, encX - 4, midY, arr1P, {
      color: colors.textDimmed, lineWidth: 1.5, headSize: 6,
    });

    // ── z (latent) ──
    const zP = easedSub(progress, 0.2, 0.32);
    if (zP > 0) {
      ctx.save();
      ctx.globalAlpha = zP;
      // Draw z as a circle
      ctx.beginPath();
      ctx.arc(zX, midY, 18, 0, Math.PI * 2);
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colors.accent;
      ctx.font = 'bold 14px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('z', zX, midY);
      ctx.restore();
    }

    // Arrow encoder -> z
    const arr2P = easedSub(progress, 0.18, 0.3);
    animateArrow(ctx, encX + blockW + 4, midY, zX - 22, midY, arr2P, {
      color: colors.textDimmed, lineWidth: 1.5, headSize: 6,
    });

    // Label: mu, sigma under encoder
    const paramP = easedSub(progress, 0.25, 0.35);
    fadeInText(ctx, '\u03bc, \u03c3', encX + blockW / 2, midY + blockH / 2 + 14, paramP, {
      color: series[0], font: '11px "Courier New", monospace',
    });

    // ── Decoder ──
    const decP = easedSub(progress, 0.28, 0.4);
    drawBlock(ctx, decX, midY - blockH / 2, blockW, blockH, tx('scene6', 'decoderLabel'), series[1], decP);

    // Arrow z -> decoder
    const arr3P = easedSub(progress, 0.26, 0.38);
    animateArrow(ctx, zX + 22, midY, decX - 4, midY, arr3P, {
      color: colors.textDimmed, lineWidth: 1.5, headSize: 6,
    });

    // ── Output x_hat ──
    const outputP = easedSub(progress, 0.35, 0.45);
    if (outputP > 0) {
      ctx.save();
      ctx.globalAlpha = outputP;
      ctx.fillStyle = colors.textPrimary;
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u0078\u0302', xHatPos, midY);
      ctx.restore();
    }

    // Arrow decoder -> x_hat
    const arr4P = easedSub(progress, 0.33, 0.43);
    animateArrow(ctx, decX + blockW + 4, midY, xHatPos - 14, midY, arr4P, {
      color: colors.textDimmed, lineWidth: 1.5, headSize: 6,
    });

    // ── Prior block (below z) — the key difference ──
    const priorY = midY + 65;
    const priorW = W * 0.22;
    const priorH = 55;
    const priorX = zX - priorW / 2;
    const priorP = easedSub(progress, 0.4, 0.58);

    if (priorP > 0) {
      ctx.save();
      ctx.globalAlpha = priorP;

      // Draw box
      r.box(priorX, priorY, priorW, priorH, {
        fill: colors.panelBg, stroke: colors.warning, radius: 8, lineWidth: 2,
      });

      // Label
      ctx.fillStyle = colors.warning;
      ctx.font = 'bold 11px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(tx('scene6', 'priorLabel'), priorX + priorW / 2, priorY + 6);

      // Mini mixture curves inside prior box
      const miniCx = priorX + priorW / 2;
      const miniBot = priorY + priorH - 8;
      const miniW = priorW * 0.8;
      const miniH = priorH * 0.4;
      const K = 5;
      const means = [-2, -1, 0, 1, 2];
      for (let k = 0; k < K; k++) {
        ctx.strokeStyle = series[k];
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let t = -3; t <= 3; t += 0.15) {
          const v = gaussian(t, means[k], 0.6);
          const px = miniCx + (t / 3) * (miniW / 2);
          const py = miniBot - v * miniH * 2;
          if (t === -3) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      ctx.restore();
    }

    // Arrow from prior to z (upward)
    const arr5P = easedSub(progress, 0.5, 0.62);
    if (arr5P > 0) {
      animateArrow(ctx, zX, priorY - 2, zX, midY + 20, arr5P, {
        color: colors.warning, lineWidth: 1.5, headSize: 6, dash: [4, 3],
      });
    }

    // ── MC KL label between encoder and prior ──
    const mcLabelP = easedSub(progress, 0.58, 0.72);
    if (mcLabelP > 0) {
      const mcX = encX + blockW / 2;
      const mcY = (midY + priorY) / 2 + 10;
      ctx.save();
      ctx.globalAlpha = mcLabelP;

      r.box(mcX - 50, mcY - 12, 100, 24, {
        fill: colors.panelBg, stroke: colors.error, radius: 6, lineWidth: 1,
      });

      ctx.fillStyle = colors.error;
      ctx.font = 'bold 10px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene6', 'mcLabel'), mcX, mcY);

      ctx.restore();

      // Dashed line from MC box to z area
      ctx.save();
      ctx.globalAlpha = mcLabelP * 0.5;
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(mcX + 50, mcY);
      ctx.lineTo(zX - 20, midY + 10);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // ── Loss formula ──
    formulaAppear(state.formulaManager, 'gmvae-loss',
      '\\mathcal{L} = \\mathbb{E}_{q}[\\log p(x|z)] - D_{KL}^{\\text{MC}}(q \\| p)',
      50, 90, easedSub(progress, 0.72, 0.88));

    // Loss label
    const lossP = easedSub(progress, 0.85, 0.98);
    fadeInText(ctx, tx('scene6', 'lossLabel'), W / 2, H - 20, lossP, {
      color: colors.accent, font: 'bold 12px "Courier New", monospace',
    });
  },
});
