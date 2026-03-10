// Scene 7: Multi-Scale Noise — multiple σ scales, bridge to diffusion

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { animateCurve } from '../../engine/animation/graph';
import { fadeInText } from '../../engine/animation/text';
import { gaussian } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

/** Original sharp distribution (mixture) */
function pdfOriginal(x: number): number {
  return 0.5 * gaussian(x, 3, 0.4) + 0.5 * gaussian(x, 7, 0.5);
}

/** Convolved with small sigma */
function pdfLowNoise(x: number): number {
  return 0.5 * gaussian(x, 3, 0.6) + 0.5 * gaussian(x, 7, 0.7);
}

/** Convolved with medium sigma */
function pdfMedNoise(x: number): number {
  return 0.5 * gaussian(x, 3, 1.2) + 0.5 * gaussian(x, 7, 1.3);
}

/** Convolved with large sigma */
function pdfHighNoise(x: number): number {
  return 0.5 * gaussian(x, 3, 2.5) + 0.5 * gaussian(x, 7, 2.6);
}

/** Score for a given density (numerical) */
function scoreOf(pdf: (x: number) => number, x: number): number {
  const dx = 0.01;
  const lp1 = Math.log(Math.max(pdf(x + dx), 1e-12));
  const lp0 = Math.log(Math.max(pdf(x - dx), 1e-12));
  return (lp1 - lp0) / (2 * dx);
}

const noiseScales = [
  { label: '\u03c3 = 0.2', color: colors.insight, pdf: pdfOriginal, sigma: 0.2 },
  { label: '\u03c3 = 0.8', color: colors.info, pdf: pdfLowNoise, sigma: 0.8 },
  { label: '\u03c3 = 1.5', color: colors.warning, pdf: pdfMedNoise, sigma: 1.5 },
  { label: '\u03c3 = 3.0', color: colors.error, pdf: pdfHighNoise, sigma: 3.0 },
];

export const scene7 = new Scene({
  id: () => tx('scene7', 'id'),
  duration: 25,
  narration: () => tx('scene7', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene7 as SceneText)?.subtitleCues ?? (text.es.scene7 as SceneText).subtitleCues,
  topic: () => tx('scene7', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene7', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Density curves at different noise levels
    r.setViewport(0, 10, 0, 0.55);
    const axesP = easedSub(progress, 0.05, 0.18);
    if (axesP > 0) {
      ctx.globalAlpha = axesP;
      r.drawAxes({ xLabel: 'x', yLabel: 'p_\u03c3(x)', xTicks: 5, yTicks: 4 });
      ctx.globalAlpha = 1;
    }

    // Draw each noise scale curve one by one
    for (let i = 0; i < noiseScales.length; i++) {
      const scaleP = easedSub(progress, 0.12 + i * 0.12, 0.28 + i * 0.12);
      if (scaleP > 0) {
        const ns = noiseScales[i];
        animateCurve(r, ns.pdf, ns.color, scaleP, 2);

        // Legend label
        fadeInText(ctx, ns.label, W - 20, H * 0.2 + i * 18, scaleP, {
          color: ns.color, font: '10px "Segoe UI", system-ui, sans-serif', align: 'right',
        });
      }
    }

    // Labels: low noise vs high noise
    const lowP = easedSub(progress, 0.35, 0.5);
    if (lowP > 0) {
      fadeInText(ctx, tx('scene7', 'lowNoise'), W * 0.2, H * 0.68, lowP, {
        color: colors.insight, font: 'bold 11px "Segoe UI", system-ui, sans-serif',
      });
    }

    const highP = easedSub(progress, 0.45, 0.6);
    if (highP > 0) {
      fadeInText(ctx, tx('scene7', 'highNoise'), W * 0.8, H * 0.68, highP, {
        color: colors.error, font: 'bold 11px "Segoe UI", system-ui, sans-serif', align: 'right',
      });
    }

    // Score arrows at different scales (stacked rows)
    const scoreP = easedSub(progress, 0.55, 0.8);
    if (scoreP > 0) {
      const nArrows = 14;
      const rowH = 18;
      const startY = H * 0.74;

      for (let si = 0; si < noiseScales.length; si++) {
        const ns = noiseScales[si];
        const rowY = startY + si * rowH;
        const rowP = easedSub(progress, 0.55 + si * 0.04, 0.72 + si * 0.04);
        if (rowP <= 0) continue;

        ctx.save();
        ctx.globalAlpha = rowP * 0.7;
        for (let j = 1; j < nArrows; j++) {
          const x = (j / nArrows) * 10;
          const score = scoreOf(ns.pdf, x);
          const px = r.toX(x);
          const arrowLen = Math.min(Math.abs(score) * 5, 15) * Math.sign(score);

          ctx.strokeStyle = ns.color;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(px, rowY);
          ctx.lineTo(px + arrowLen * easeOut(rowP), rowY);
          ctx.stroke();

          if (Math.abs(arrowLen) > 2) {
            const dir = Math.sign(arrowLen);
            ctx.fillStyle = ns.color;
            ctx.beginPath();
            ctx.moveTo(px + arrowLen * easeOut(rowP), rowY);
            ctx.lineTo(px + arrowLen * easeOut(rowP) - dir * 3, rowY - 2);
            ctx.lineTo(px + arrowLen * easeOut(rowP) - dir * 3, rowY + 2);
            ctx.closePath();
            ctx.fill();
          }
        }
        ctx.restore();
      }

      fadeInText(ctx, tx('scene7', 'multiScale'), W / 2, startY + noiseScales.length * rowH + 10, scoreP, {
        color: colors.textSecondary, font: '11px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Bridge text
    const bridgeP = easedSub(progress, 0.88, 1);
    fadeInText(ctx, tx('scene7', 'bridge'), W / 2, H - 20, bridgeP, {
      color: colors.accent, font: 'bold 13px "Segoe UI", system-ui, sans-serif',
    });
  },
});
