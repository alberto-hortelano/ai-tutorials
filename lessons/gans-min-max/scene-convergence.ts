// Scene 7: Convergence — p_g -> p_data, D* -> 0.5, V -> -log4

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateCurve, morphFn } from '../../engine/animation/graph';
import { gaussian, lerp } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// p_data: mixture of two Gaussians
function pData(x: number): number {
  return 0.5 * gaussian(x, -1.5, 0.7) + 0.5 * gaussian(x, 2.0, 0.6);
}

// p_g: starts far off
function pGStart(x: number): number {
  return gaussian(x, 0.5, 1.8);
}

// D* from two distributions
function dStar(pd: number, pg: number): number {
  const denom = pd + pg;
  return denom > 1e-8 ? pd / denom : 0.5;
}

export const scene7 = new Scene({
  id: () => tx('scene7', 'id'),
  duration: 24,
  narration: () => tx('scene7', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene7 as SceneText)?.subtitleCues ?? (text.es.scene7 as SceneText).subtitleCues,
  topic: () => tx('scene7', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene7', 'title'), W / 2, 25, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif'
    });

    // Optimum labels
    const labelP = easedSub(progress, 0.06, 0.2);
    if (labelP > 0) {
      fadeInText(ctx, tx('scene7', 'optimum'), W / 2, 48, labelP, {
        color: colors.accent, font: '13px "Segoe UI", system-ui, sans-serif'
      });
    }

    // Set viewport for curves
    r.setViewport(-4, 5, 0, 0.55);

    // Axes
    const axesP = easedSub(progress, 0.1, 0.22);
    if (axesP > 0) {
      ctx.globalAlpha = axesP;
      r.drawAxes({ xLabel: 'x', yLabel: 'density / D*', xTicks: 4, yTicks: 4 });
      ctx.globalAlpha = 1;
    }

    // The morph progress: p_g gradually becomes p_data
    const morphT = easedSub(progress, 0.2, 0.85);

    // Current p_g
    const pGCurrent = morphFn(pGStart, pData, morphT);

    // Current D*
    const dStarCurrent = (x: number): number => dStar(pData(x), pGCurrent(x));

    // Draw p_data (blue, always visible)
    const pdP = easedSub(progress, 0.15, 0.3);
    if (pdP > 0) {
      animateCurve(r, pData, series[0], pdP, 2.5);
      if (pdP > 0.5) {
        r.label('p_data', -1.5, pData(-1.5) + 0.04, {
          color: series[0], font: 'bold 11px "Segoe UI", system-ui, sans-serif', align: 'center'
        });
      }
    }

    // Draw p_g (red, morphing toward p_data)
    const pgP = easedSub(progress, 0.2, 0.35);
    if (pgP > 0) {
      r.drawCurve(pGCurrent, series[2], 2.5);
      r.label('p_g', 0.5 * (1 - morphT) + (-1.5) * morphT, pGCurrent(0.5 * (1 - morphT) + (-1.5) * morphT) + 0.04, {
        color: series[2], font: 'bold 11px "Segoe UI", system-ui, sans-serif', align: 'center'
      });
    }

    // Draw D* (green, dashed, flattening toward 0.5)
    const dsP = easedSub(progress, 0.25, 0.4);
    if (dsP > 0) {
      ctx.save();
      ctx.setLineDash([6, 4]);
      r.drawCurve(dStarCurrent, colors.insight, 2);
      ctx.setLineDash([]);
      ctx.restore();
      r.label('D*', 3.5, dStarCurrent(3.5) + 0.02, {
        color: colors.insight, font: 'bold 11px "Segoe UI", system-ui, sans-serif', align: 'left'
      });
    }

    // 0.5 reference line
    const halfP = easedSub(progress, 0.3, 0.45);
    if (halfP > 0) {
      ctx.save();
      ctx.globalAlpha = halfP * 0.5;
      ctx.strokeStyle = colors.textDimmed;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      const halfY = r.toY(0.5);
      ctx.beginPath();
      ctx.moveTo(r.toX(r.xMin), halfY);
      ctx.lineTo(r.toX(r.xMax), halfY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Status text — right side, updates as morphing progresses
    const statusP = easedSub(progress, 0.35, 0.5);
    if (statusP > 0) {
      const statusX = W * 0.82;
      const statusY = H * 0.25;

      fadeInText(ctx, tx('scene7', 'pgEqualsP'), statusX, statusY, statusP, {
        color: series[2], font: '11px "Segoe UI", system-ui, sans-serif'
      });
      fadeInText(ctx, tx('scene7', 'dHalf'), statusX, statusY + 20, statusP, {
        color: colors.insight, font: '11px "Segoe UI", system-ui, sans-serif'
      });
      fadeInText(ctx, tx('scene7', 'vValue'), statusX, statusY + 40, statusP, {
        color: colors.warning, font: '11px "Courier New", monospace'
      });
    }

    // V value bar — shrinking to -log4 as morphT increases
    const vBarP = easedSub(progress, 0.45, 0.6);
    if (vBarP > 0) {
      const barX = W * 0.08;
      const barY = H * 0.88;
      const maxBarW = W * 0.6;
      // V goes from some large value to -log4 ~= -1.386
      const vNorm = 1 - morphT * 0.6; // shrinks as morphT increases
      const barW = maxBarW * vNorm * vBarP;

      ctx.fillStyle = colors.warning + '88';
      ctx.fillRect(barX, barY, barW, 14);

      const vVal = lerp(-0.5, -Math.log(4), morphT);
      fadeInText(ctx, `V = ${vVal.toFixed(3)}`, barX + barW + 10, barY + 7, vBarP, {
        color: colors.warning, font: '11px "Courier New", monospace', align: 'left'
      });
    }

    // Cliffhanger text
    const cliffP = easedSub(progress, 0.88, 1.0);
    if (cliffP > 0) {
      fadeInText(ctx, tx('scene7', 'cliffhanger'), W / 2, H - 20, cliffP, {
        color: colors.error, font: 'bold 14px "Segoe UI", system-ui, sans-serif'
      });
    }
  }
});
