// Scene 4: Mode Collapse — G collapses from 5 modes to 3 to 1

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { gaussian, lerp } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// 5-mode target distribution
const MODE_CENTERS = [-3, -1.2, 0.5, 2.0, 3.5];
const MODE_WEIGHTS_5 = [0.2, 0.2, 0.2, 0.2, 0.2];
const MODE_WEIGHTS_3 = [0.0, 0.33, 0.34, 0.33, 0.0];
const MODE_WEIGHTS_1 = [0.0, 0.0, 1.0, 0.0, 0.0];

function mixtureGaussian(x: number, weights: number[]): number {
  let sum = 0;
  for (let i = 0; i < MODE_CENTERS.length; i++) {
    sum += weights[i] * gaussian(x, MODE_CENTERS[i], 0.4);
  }
  return sum;
}

function lerpWeights(w1: number[], w2: number[], t: number): number[] {
  return w1.map((v, i) => lerp(v, w2[i], t));
}

export const scene4 = new Scene({
  id: () => tx('scene4', 'id'),
  duration: 25,
  narration: () => tx('scene4', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene4 as SceneText)?.subtitleCues ?? (text.es.scene4 as SceneText).subtitleCues,
  topic: () => tx('scene4', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene4', 'title'), W / 2, 30, easedSub(progress, 0, 0.1), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif'
    });

    r.setViewport(-4.5, 5, 0, 0.55);

    // Axes
    const axesP = easedSub(progress, 0.06, 0.18);
    if (axesP > 0) {
      ctx.globalAlpha = axesP;
      r.drawAxes({ xLabel: 'x', yLabel: 'p(x)', xTicks: 4, yTicks: 3 });
      ctx.globalAlpha = 1;
    }

    // Target distribution (always shown, blue)
    const targetP = easedSub(progress, 0.1, 0.3);
    if (targetP > 0) {
      const targetFn = (x: number) => mixtureGaussian(x, MODE_WEIGHTS_5);
      const xEnd = r.xMin + (r.xMax - r.xMin) * Math.min(targetP, 1);
      r.drawCurvePartial(xEnd, targetFn, series[0], 2.5);

      if (targetP > 0.5) {
        r.label(tx('scene4', 'targetLabel'), -3, mixtureGaussian(-3, MODE_WEIGHTS_5) + 0.04, {
          color: series[0], font: '10px "Segoe UI", system-ui, sans-serif', align: 'center'
        });
      }
    }

    // Generator distribution — morphing through collapse stages
    const genP = easedSub(progress, 0.25, 0.45);
    if (genP > 0) {
      // Phase 1: 5 modes (progress 0.25-0.45)
      // Phase 2: 3 modes (progress 0.45-0.65)
      // Phase 3: 1 mode  (progress 0.65-0.85)
      const collapseT1 = easedSub(progress, 0.45, 0.65); // 5->3
      const collapseT2 = easedSub(progress, 0.65, 0.85); // 3->1

      let currentWeights: number[];
      if (collapseT2 > 0) {
        currentWeights = lerpWeights(MODE_WEIGHTS_3, MODE_WEIGHTS_1, collapseT2);
      } else if (collapseT1 > 0) {
        currentWeights = lerpWeights(MODE_WEIGHTS_5, MODE_WEIGHTS_3, collapseT1);
      } else {
        currentWeights = MODE_WEIGHTS_5;
      }

      const genFn = (x: number) => mixtureGaussian(x, currentWeights);
      r.drawCurve(genFn, series[2], 2.5);
    }

    // Stage labels at the bottom
    const stage1P = easedSub(progress, 0.28, 0.42);
    if (stage1P > 0) {
      fadeInText(ctx, tx('scene4', 'mode5'), W * 0.2, H - 45, stage1P, {
        color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif'
      });
    }

    const stage2P = easedSub(progress, 0.5, 0.62);
    if (stage2P > 0) {
      fadeInText(ctx, tx('scene4', 'mode3'), W * 0.5, H - 45, stage2P, {
        color: colors.warning, font: 'bold 12px "Segoe UI", system-ui, sans-serif'
      });
    }

    const stage3P = easedSub(progress, 0.72, 0.82);
    if (stage3P > 0) {
      fadeInText(ctx, tx('scene4', 'mode1'), W * 0.8, H - 45, stage3P, {
        color: colors.error, font: 'bold 12px "Segoe UI", system-ui, sans-serif'
      });
    }

    // Arrows between stages
    const arr1P = easedSub(progress, 0.45, 0.55);
    if (arr1P > 0) {
      ctx.save();
      ctx.globalAlpha = arr1P;
      ctx.fillStyle = colors.textDimmed;
      ctx.font = '16px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u2192', W * 0.35, H - 45);
      ctx.restore();
    }

    const arr2P = easedSub(progress, 0.67, 0.75);
    if (arr2P > 0) {
      ctx.save();
      ctx.globalAlpha = arr2P;
      ctx.fillStyle = colors.textDimmed;
      ctx.font = '16px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u2192', W * 0.65, H - 45);
      ctx.restore();
    }

    // Failure label
    const failP = easedSub(progress, 0.85, 0.97);
    if (failP > 0) {
      fadeInText(ctx, tx('scene4', 'failLabel'), W / 2, H - 20, failP, {
        color: colors.error, font: 'bold 13px "Segoe UI", system-ui, sans-serif'
      });
    }
  }
});
