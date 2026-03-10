// Scene 5: Optimal Discriminator — D*(x) = p_data / (p_data + p_g)

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateCurve, morphFn } from '../../engine/animation/graph';
import { formulaAppear } from '../../engine/animation/formula';
import { gaussian, lerp } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';
import type { TimelineState } from '../../engine/types';

// p_data: mixture of two Gaussians
function pData(x: number): number {
  return 0.5 * gaussian(x, -1.5, 0.7) + 0.5 * gaussian(x, 2.0, 0.6);
}

// p_g initial: single broad Gaussian (poor generator)
function pGInitial(x: number): number {
  return gaussian(x, 0.5, 1.5);
}

// p_g final: matches p_data
function pGFinal(x: number): number {
  return pData(x);
}

// D* given p_data and p_g
function dStar(pd: number, pg: number): number {
  const denom = pd + pg;
  return denom > 1e-8 ? pd / denom : 0.5;
}

export const scene5 = new Scene({
  id: () => tx('scene5', 'id'),
  duration: 25,
  narration: () => tx('scene5', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene5 as SceneText)?.subtitleCues ?? (text.es.scene5 as SceneText).subtitleCues,
  topic: () => tx('scene5', 'topic'),
  render(progress, ctx, canvas, r, state: TimelineState) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene5', 'title'), W / 2, 25, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif'
    });

    // Formula
    const fmP = easedSub(progress, 0.06, 0.2);
    if (fmP > 0) {
      formulaAppear(state.formulaManager, 'dstar-formula',
        'D^*(x) = \\frac{p_{\\text{data}}(x)}{p_{\\text{data}}(x) + p_g(x)}',
        50, 17, fmP, { color: colors.textPrimary, fontSize: '1em' });
    }

    // Set up viewport for distribution plots
    r.setViewport(-4, 5, 0, 0.55);

    // Axes
    const axesP = easedSub(progress, 0.12, 0.25);
    if (axesP > 0) {
      ctx.globalAlpha = axesP;
      r.drawAxes({ xLabel: 'x', yLabel: 'density / D*', xTicks: 4, yTicks: 4 });
      ctx.globalAlpha = 1;
    }

    // Morph parameter for p_g
    const morphT = easedSub(progress, 0.55, 0.9);

    // Current p_g (interpolating from initial to final)
    const pGCurrent = morphFn(pGInitial, pGFinal, morphT);

    // Draw p_data (always blue)
    const pdP = easedSub(progress, 0.2, 0.4);
    if (pdP > 0) {
      animateCurve(r, pData, series[0], pdP, 2.5);
      if (pdP > 0.5) {
        r.label(tx('scene5', 'pDataLabel'), -1.5, pData(-1.5) + 0.03, {
          color: series[0], font: 'bold 11px "Segoe UI", system-ui, sans-serif', align: 'center'
        });
      }
    }

    // Draw p_g (red, morphing)
    const pgP = easedSub(progress, 0.3, 0.5);
    if (pgP > 0) {
      const drawEnd = r.xMin + (r.xMax - r.xMin) * Math.min(pgP, 1);
      r.drawCurvePartial(drawEnd, pGCurrent, series[2], 2.5);
      if (pgP > 0.5) {
        r.label(tx('scene5', 'pGLabel'), 0.5, pGCurrent(0.5) + 0.03, {
          color: series[2], font: 'bold 11px "Segoe UI", system-ui, sans-serif', align: 'center'
        });
      }
    }

    // Draw D* curve (green, dashed)
    const dsP = easedSub(progress, 0.4, 0.6);
    if (dsP > 0) {
      const dStarFn = (x: number): number => dStar(pData(x), pGCurrent(x));
      ctx.save();
      ctx.setLineDash([6, 4]);
      animateCurve(r, dStarFn, colors.insight, dsP, 2);
      ctx.setLineDash([]);
      ctx.restore();

      if (dsP > 0.5) {
        r.label(tx('scene5', 'dStarLabel'), 3.5, dStarFn(3.5) + 0.03, {
          color: colors.insight, font: 'bold 11px "Segoe UI", system-ui, sans-serif', align: 'left'
        });
      }
    }

    // 0.5 reference line (when morphing toward convergence)
    if (morphT > 0.3) {
      ctx.save();
      ctx.globalAlpha = (morphT - 0.3) * 1.4;
      ctx.strokeStyle = colors.textDimmed;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      const halfY = r.toY(0.5);
      ctx.beginPath();
      ctx.moveTo(r.toX(r.xMin), halfY);
      ctx.lineTo(r.toX(r.xMax), halfY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      if (morphT > 0.7) {
        fadeInText(ctx, tx('scene5', 'halfLine'), W * 0.75, r.toY(0.5) - 12, (morphT - 0.7) * 3.3, {
          color: colors.textDimmed, font: '10px "Segoe UI", system-ui, sans-serif'
        });
      }
    }
  }
});
