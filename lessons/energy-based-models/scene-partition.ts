// Scene 2: The Partition Function — Z(θ) = ∫exp(-E_θ(x))dx

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { animateCurve, animateFill } from '../../engine/animation/graph';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

/** Unnormalized density: exp(-E(x)) */
function unnormalized(x: number): number {
  const e = 1.5 + 1.2 * Math.sin(x * 1.1) + 0.5 * Math.cos(x * 2.3);
  return Math.exp(-e);
}

export const scene2 = new Scene({
  id: () => tx('scene2', 'id'),
  duration: 20,
  narration: () => tx('scene2', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene2 as SceneText)?.subtitleCues ?? (text.es.scene2 as SceneText).subtitleCues,
  topic: () => tx('scene2', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene2', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Axes
    r.setViewport(0, 10, 0, 1);
    const axesP = easedSub(progress, 0.05, 0.18);
    if (axesP > 0) {
      ctx.globalAlpha = axesP;
      r.drawAxes({ xLabel: 'x', yLabel: 'exp(\u2212E(x))', xTicks: 5, yTicks: 4 });
      ctx.globalAlpha = 1;
    }

    // Unnormalized mountain
    const curveP = easedSub(progress, 0.12, 0.4);
    if (curveP > 0) {
      animateCurve(r, unnormalized, series[0], curveP, 2.5);
    }

    // Fill under curve = Z (area)
    const fillP = easedSub(progress, 0.35, 0.6);
    if (fillP > 0) {
      animateFill(r, unnormalized, series[0] + '33', fillP);
      fadeInText(ctx, tx('scene2', 'unnormalized'), W / 2, r.toY(0.55), fillP, {
        color: series[0], font: '12px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Z = ? with red question mark
    const zP = easedSub(progress, 0.55, 0.75);
    if (zP > 0) {
      const zX = W * 0.75;
      const zY = H * 0.35;
      fadeInText(ctx, tx('scene2', 'zQuestion'), zX, zY, zP, {
        color: colors.error, font: 'bold 28px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Formula
    const formulaP = easedSub(progress, 0.6, 0.8);
    if (formulaP > 0) {
      formulaAppear(state.formulaManager, 'ebm-partition',
        'Z(\\theta) = \\int \\exp(-E_{\\theta}(x))\\, dx',
        50, 80, formulaP, { color: colors.accent, fontSize: '1.3em' });
    }

    // Intractable label
    const intractP = easedSub(progress, 0.8, 0.95);
    fadeInText(ctx, tx('scene2', 'intractable'), W / 2, H - 25, intractP, {
      color: colors.error, font: 'bold 13px "Segoe UI", system-ui, sans-serif',
    });
  },
});
