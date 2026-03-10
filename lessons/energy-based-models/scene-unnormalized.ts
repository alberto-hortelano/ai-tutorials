// Scene 3: Unnormalized Models — comparing probabilities without Z

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { animateCurve } from '../../engine/animation/graph';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

/** Energy landscape */
function energyFn(x: number): number {
  return 1.5 + 1.2 * Math.sin(x * 1.1) + 0.5 * Math.cos(x * 2.3);
}

export const scene3 = new Scene({
  id: () => tx('scene3', 'id'),
  duration: 22,
  narration: () => tx('scene3', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene3 as SceneText)?.subtitleCues ?? (text.es.scene3 as SceneText).subtitleCues,
  topic: () => tx('scene3', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene3', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Energy landscape
    r.setViewport(0, 10, 0, 4);
    const axesP = easedSub(progress, 0.05, 0.18);
    if (axesP > 0) {
      ctx.globalAlpha = axesP;
      r.drawAxes({ xLabel: 'x', yLabel: 'E(x)', xTicks: 5, yTicks: 4 });
      ctx.globalAlpha = 1;
    }

    const curveP = easedSub(progress, 0.1, 0.3);
    if (curveP > 0) {
      animateCurve(r, energyFn, colors.textMuted, curveP, 2);
    }

    // Point a (low energy) and point b (high energy)
    const pointA_x = 2.7;
    const pointA_e = energyFn(pointA_x);
    const pointB_x = 5.5;
    const pointB_e = energyFn(pointB_x);

    const pointsP = easedSub(progress, 0.25, 0.45);
    if (pointsP > 0) {
      // Point a
      r.dot(pointA_x, pointA_e, 7 * easeOut(pointsP), colors.insight);
      fadeInText(ctx, tx('scene3', 'pointA'), r.toX(pointA_x) - 10, r.toY(pointA_e) - 18, pointsP, {
        color: colors.insight, font: 'bold 11px "Segoe UI", system-ui, sans-serif', align: 'center',
      });

      // Point b
      r.dot(pointB_x, pointB_e, 7 * easeOut(pointsP), colors.error);
      fadeInText(ctx, tx('scene3', 'pointB'), r.toX(pointB_x) + 10, r.toY(pointB_e) - 18, pointsP, {
        color: colors.error, font: 'bold 11px "Segoe UI", system-ui, sans-serif', align: 'center',
      });
    }

    // Arrow E(a) < E(b)
    const compP = easedSub(progress, 0.4, 0.6);
    if (compP > 0) {
      // Dashed horizontal lines from points to y-axis
      ctx.save();
      ctx.globalAlpha = compP * 0.5;
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(r.toX(pointA_x), r.toY(pointA_e));
      ctx.lineTo(r.toX(0), r.toY(pointA_e));
      ctx.stroke();
      ctx.strokeStyle = colors.error;
      ctx.beginPath();
      ctx.moveTo(r.toX(pointB_x), r.toY(pointB_e));
      ctx.lineTo(r.toX(0), r.toY(pointB_e));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Arrow from E(b) to E(a) on y-axis showing E(a) < E(b)
      animateArrow(ctx, r.toX(0) - 20, r.toY(pointB_e), r.toX(0) - 20, r.toY(pointA_e), compP, {
        color: colors.warning, headSize: 7,
      });
      fadeInText(ctx, 'E(a) < E(b)', r.toX(0) - 45, (r.toY(pointA_e) + r.toY(pointB_e)) / 2, compP, {
        color: colors.warning, font: 'bold 10px "Segoe UI", system-ui, sans-serif', align: 'center',
      });
    }

    // Ratio formula
    const ratioP = easedSub(progress, 0.55, 0.75);
    if (ratioP > 0) {
      formulaAppear(state.formulaManager, 'ebm-ratio',
        '\\frac{p(a)}{p(b)} = \\frac{e^{-E(a)}}{e^{-E(b)}} = e^{E(b)-E(a)}',
        50, 78, ratioP, { color: colors.accent, fontSize: '1.2em' });
    }

    // Z cancels!
    const cancelP = easedSub(progress, 0.72, 0.88);
    if (cancelP > 0) {
      fadeInText(ctx, tx('scene3', 'zCancels'), W * 0.75, H * 0.82, cancelP, {
        color: colors.insight, font: 'bold 16px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Bottom label
    const bottomP = easedSub(progress, 0.88, 1);
    fadeInText(ctx, tx('scene3', 'compareLabel'), W / 2, H - 25, bottomP, {
      color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
    });
  },
});
