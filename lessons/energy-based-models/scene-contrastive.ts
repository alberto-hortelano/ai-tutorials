// Scene 4: Contrastive Divergence — push energy down on data, up on samples

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

/** Energy landscape that deforms during training */
function energyAtTime(x: number, t: number): number {
  const base = 1.5 + 1.2 * Math.sin(x * 1.1) + 0.5 * Math.cos(x * 2.3);
  // Training pushes energy down near data points (x~3, x~7) and up elsewhere
  const dataEffect = -0.6 * t * (Math.exp(-((x - 3) ** 2) / 0.8) + Math.exp(-((x - 7) ** 2) / 0.8));
  const sampleEffect = 0.3 * t * Math.exp(-((x - 5) ** 2) / 1.5);
  return base + dataEffect + sampleEffect;
}

// Data point positions
const dataPoints = [3.0, 7.0];
// Model sample positions
const samplePoints = [4.5, 5.5];

export const scene4 = new Scene({
  id: () => tx('scene4', 'id'),
  duration: 25,
  narration: () => tx('scene4', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene4 as SceneText)?.subtitleCues ?? (text.es.scene4 as SceneText).subtitleCues,
  topic: () => tx('scene4', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene4', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Formula at top
    const formulaP = easedSub(progress, 0.05, 0.2);
    if (formulaP > 0) {
      formulaAppear(state.formulaManager, 'ebm-cd-grad',
        '\\nabla_{\\theta} \\log p(x) = -\\nabla E(x) + \\mathbb{E}_{p}[\\nabla E(x\')] ',
        50, 15, formulaP, { color: colors.accent, fontSize: '1em' });
    }

    // Energy landscape (deforming over time)
    r.setViewport(0, 10, 0, 4);
    const axesP = easedSub(progress, 0.08, 0.2);
    if (axesP > 0) {
      ctx.globalAlpha = axesP;
      r.drawAxes({ xLabel: 'x', yLabel: 'E_\u03b8(x)', xTicks: 5, yTicks: 4 });
      ctx.globalAlpha = 1;
    }

    // The training progress controls how much the landscape has deformed
    const trainT = easedSub(progress, 0.2, 0.85);
    const eFn = (x: number) => energyAtTime(x, trainT);

    const curveP = easedSub(progress, 0.15, 0.3);
    if (curveP > 0) {
      r.drawCurve(eFn, colors.textSecondary, 2.5);
    }

    // Data points with downward arrows (push energy DOWN)
    const dataP = easedSub(progress, 0.25, 0.45);
    if (dataP > 0) {
      for (const dx of dataPoints) {
        const ey = eFn(dx);
        r.dot(dx, ey, 6 * easeOut(dataP), colors.insight);
        // Downward arrow
        animateArrow(ctx, r.toX(dx), r.toY(ey) - 20, r.toX(dx), r.toY(ey) - 5, dataP, {
          color: colors.insight, headSize: 6,
        });
      }
      fadeInText(ctx, tx('scene4', 'pushDown'), W * 0.2, H * 0.85, dataP, {
        color: colors.insight, font: 'bold 11px "Segoe UI", system-ui, sans-serif', align: 'center',
      });
      fadeInText(ctx, tx('scene4', 'dataLabel'), r.toX(dataPoints[0]), r.toY(eFn(dataPoints[0])) + 18, dataP, {
        color: colors.insight, font: '10px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Sample points with upward arrows (push energy UP)
    const sampleP = easedSub(progress, 0.4, 0.6);
    if (sampleP > 0) {
      for (const sx of samplePoints) {
        const ey = eFn(sx);
        r.dot(sx, ey, 6 * easeOut(sampleP), colors.error);
        // Upward arrow
        animateArrow(ctx, r.toX(sx), r.toY(ey) + 5, r.toX(sx), r.toY(ey) + 20, sampleP, {
          color: colors.error, headSize: 6,
        });
      }
      fadeInText(ctx, tx('scene4', 'pushUp'), W * 0.8, H * 0.85, sampleP, {
        color: colors.error, font: 'bold 11px "Segoe UI", system-ui, sans-serif', align: 'center',
      });
      fadeInText(ctx, tx('scene4', 'sampleLabel'), r.toX(samplePoints[0]), r.toY(eFn(samplePoints[0])) + 18, sampleP, {
        color: colors.error, font: '10px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Redraw curve on top (since it deforms)
    if (trainT > 0 && curveP >= 1) {
      r.drawCurve(eFn, colors.textSecondary, 2.5);
    }
  },
});
