// Scene 1: Disjoint Support Problem — JSD=log2 constant, no gradient

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { gaussian } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene1 = new Scene({
  id: () => tx('scene1', 'id'),
  duration: 22,
  narration: () => tx('scene1', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene1 as SceneText)?.subtitleCues ?? (text.es.scene1 as SceneText).subtitleCues,
  topic: () => tx('scene1', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene1', 'title'), W / 2, 25, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Distribution panel
    const plotTop = 50;
    const plotH = (H - plotTop - 80) * 0.55;
    const xMin = -6, xMax = 8;
    const yMax = 0.55;
    const steps = 300;
    const dx = (xMax - xMin) / steps;

    const toX = (x: number): number => 25 + ((x - xMin) / (xMax - xMin)) * (W - 50);
    const toY = (y: number): number => plotTop + plotH - (y / yMax) * plotH;

    // P_real (fixed at left)
    const muP = -2;
    const pDist = (x: number): number => gaussian(x, muP, 0.8);

    // P_gen (slides from right toward P_real over the scene)
    const slideP = easedSub(progress, 0.3, 0.9);
    const muQ = 4 - slideP * 4; // from 4 to 0
    const qDist = (x: number): number => gaussian(x, muQ, 0.8);

    // Draw P
    const pDrawP = easedSub(progress, 0.05, 0.25);
    if (pDrawP > 0) {
      ctx.save();
      ctx.globalAlpha = pDrawP;

      ctx.fillStyle = series[0] + '25';
      ctx.beginPath();
      ctx.moveTo(toX(xMin), toY(0));
      for (let i = 0; i <= steps; i++) {
        const x = xMin + i * dx;
        ctx.lineTo(toX(x), toY(pDist(x)));
      }
      ctx.lineTo(toX(xMax), toY(0));
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = series[0];
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const x = xMin + i * dx;
        if (i === 0) ctx.moveTo(toX(x), toY(pDist(x)));
        else ctx.lineTo(toX(x), toY(pDist(x)));
      }
      ctx.stroke();

      fadeInText(ctx, tx('scene1', 'pLabel'), toX(muP), toY(pDist(muP)) - 12, 1, {
        color: series[0], font: 'bold 11px "Segoe UI", system-ui, sans-serif',
      });

      ctx.restore();
    }

    // Draw Q (animated position)
    const qDrawP = easedSub(progress, 0.15, 0.35);
    if (qDrawP > 0) {
      ctx.save();
      ctx.globalAlpha = qDrawP;

      ctx.fillStyle = series[2] + '25';
      ctx.beginPath();
      ctx.moveTo(toX(xMin), toY(0));
      for (let i = 0; i <= steps; i++) {
        const x = xMin + i * dx;
        ctx.lineTo(toX(x), toY(qDist(x)));
      }
      ctx.lineTo(toX(xMax), toY(0));
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = series[2];
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const x = xMin + i * dx;
        if (i === 0) ctx.moveTo(toX(x), toY(qDist(x)));
        else ctx.lineTo(toX(x), toY(qDist(x)));
      }
      ctx.stroke();
      ctx.setLineDash([]);

      fadeInText(ctx, tx('scene1', 'qLabel'), toX(muQ), toY(qDist(muQ)) - 12, 1, {
        color: series[2], font: 'bold 11px "Segoe UI", system-ui, sans-serif',
      });

      ctx.restore();
    }

    // Sliding label
    if (slideP > 0.1 && slideP < 0.9) {
      fadeInText(ctx, tx('scene1', 'slidingLabel'), W / 2, plotTop + plotH + 15, Math.min(slideP * 3, 1), {
        color: colors.textMuted, font: '10px "Segoe UI", system-ui, sans-serif',
      });
    }

    // JSD plot below
    const jsdTop = plotTop + plotH + 30;
    const jsdH = H - jsdTop - 30;
    const jsdLeft = 60;
    const jsdW = W - jsdLeft - 25;

    const jsdAxP = easedSub(progress, 0.2, 0.35);
    if (jsdAxP > 0) {
      ctx.save();
      ctx.globalAlpha = jsdAxP;

      // Axes
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(jsdLeft, jsdTop);
      ctx.lineTo(jsdLeft, jsdTop + jsdH);
      ctx.lineTo(jsdLeft + jsdW, jsdTop + jsdH);
      ctx.stroke();

      fadeInText(ctx, tx('scene1', 'jsdLabel'), jsdLeft - 5, jsdTop + 5, 1, {
        color: colors.textMuted, font: '9px "Segoe UI", system-ui, sans-serif', align: 'right',
      });

      ctx.restore();
    }

    // JSD curve: flat at log2 while disjoint, drops when overlap
    const jsdCurveP = easedSub(progress, 0.3, 0.9);
    if (jsdCurveP > 0) {
      const log2 = Math.log(2);
      const nPts = 200;

      ctx.save();
      ctx.strokeStyle = series[2];
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i <= Math.floor(nPts * jsdCurveP); i++) {
        const t = i / nPts; // 0 to 1
        const dist = 6 - t * 4; // distance between means (6 to 2)
        // JSD approximation: log2 when far, drops when close
        let jsd = log2;
        if (dist < 3) {
          jsd = log2 * (dist / 3);
        }
        const px = jsdLeft + (i / nPts) * jsdW;
        const py = jsdTop + jsdH - (jsd / log2) * (jsdH - 10);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Flat region annotation
      if (jsdCurveP > 0.2) {
        // Dashed line at log2 level
        ctx.strokeStyle = colors.error + '60';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        const flatY = jsdTop + 10;
        ctx.moveTo(jsdLeft, flatY);
        ctx.lineTo(jsdLeft + jsdW * 0.5, flatY);
        ctx.stroke();
        ctx.setLineDash([]);

        fadeInText(ctx, 'log 2', jsdLeft - 5, flatY, (jsdCurveP - 0.2) / 0.3, {
          color: colors.error, font: 'bold 9px "Segoe UI", system-ui, sans-serif', align: 'right',
        });
      }

      ctx.restore();
    }

    // No gradient annotation
    const noGradP = easedSub(progress, 0.45, 0.65);
    if (noGradP > 0) {
      fadeInText(ctx, tx('scene1', 'noGradient'), jsdLeft + jsdW * 0.25, jsdTop - 8, noGradP, {
        color: colors.error, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
      });
    }
  },
});
