// Scene 1: The Energy Function — p_θ(x) = exp(-E_θ(x))/Z(θ)

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { animateCurve } from '../../engine/animation/graph';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

/** Energy landscape: two valleys (low energy) and a hill between */
function energyFn(x: number): number {
  return 1.5 + 1.2 * Math.sin(x * 1.1) + 0.5 * Math.cos(x * 2.3) + 0.3 * x * 0.1;
}

/** Probability (unnormalized) = exp(-E(x)) */
function probFn(x: number): number {
  return Math.exp(-energyFn(x));
}

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
    fadeInText(ctx, tx('scene1', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Energy landscape (upper half)
    const landscapeH = H * 0.38;
    const landscapeY = 55;
    const axesP = easedSub(progress, 0.05, 0.2);
    if (axesP > 0) {
      r.setViewport(0, 10, 0, 4);
      ctx.globalAlpha = axesP;
      r.drawAxes({ xLabel: 'x', yLabel: 'E(x)', xTicks: 5, yTicks: 4 });
      ctx.globalAlpha = 1;
    }

    // Draw energy curve
    const curveP = easedSub(progress, 0.15, 0.4);
    if (curveP > 0) {
      r.setViewport(0, 10, 0, 4);
      animateCurve(r, energyFn, colors.error, curveP, 2.5);
    }

    // Annotate valleys and hills
    const annoP = easedSub(progress, 0.35, 0.55);
    if (annoP > 0) {
      r.setViewport(0, 10, 0, 4);
      // Find a valley near x~2.5
      const valleyX = 2.7;
      const valleyE = energyFn(valleyX);
      r.dot(valleyX, valleyE, 6 * easeOut(annoP), colors.insight);
      fadeInText(ctx, tx('scene1', 'lowEnergy'), r.toX(valleyX) + 10, r.toY(valleyE) - 12, annoP, {
        color: colors.insight, font: '10px "Segoe UI", system-ui, sans-serif', align: 'left',
      });

      // Hill near x~5.5
      const hillX = 5.5;
      const hillE = energyFn(hillX);
      r.dot(hillX, hillE, 6 * easeOut(annoP), colors.textDimmed);
      fadeInText(ctx, tx('scene1', 'highEnergy'), r.toX(hillX) + 10, r.toY(hillE) + 15, annoP, {
        color: colors.textDimmed, font: '10px "Segoe UI", system-ui, sans-serif', align: 'left',
      });
    }

    // Marble rolling animation
    const marbleP = easedSub(progress, 0.4, 0.65);
    if (marbleP > 0) {
      r.setViewport(0, 10, 0, 4);
      // Marble starts at hill and rolls to valley
      const startX = 5.5;
      const endX = 2.7;
      const mx = startX + (endX - startX) * easeOut(marbleP);
      const my = energyFn(mx);
      ctx.save();
      ctx.shadowColor = colors.warning;
      ctx.shadowBlur = 8 * marbleP;
      r.dot(mx, my, 7, colors.warning);
      ctx.restore();
    }

    // Formula overlay
    const formulaP = easedSub(progress, 0.6, 0.82);
    if (formulaP > 0) {
      formulaAppear(state.formulaManager, 'ebm-energy',
        'p_{\\theta}(x) = \\frac{\\exp(-E_{\\theta}(x))}{Z(\\theta)}',
        50, 78, formulaP, { color: colors.accent, fontSize: '1.3em' });
    }

    // Bottom insight
    const insightP = easedSub(progress, 0.85, 1);
    fadeInText(ctx, tx('scene1', 'formula'), W / 2, H - 25, insightP, {
      color: colors.accent, font: 'bold 13px "Courier New", monospace',
    });
  },
});
