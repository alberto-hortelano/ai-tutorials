// Scene 4: Lipschitz Constraint — |f(x1)-f(x2)| <= |x1-x2|, constraint cones

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene4 = new Scene({
  id: () => tx('scene4', 'id'),
  duration: 22,
  narration: () => tx('scene4', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene4 as SceneText)?.subtitleCues ?? (text.es.scene4 as SceneText).subtitleCues,
  topic: () => tx('scene4', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.setViewport(-4, 4, -3, 3);
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene4', 'title'), W / 2, 25, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Formula
    const fmP = easedSub(progress, 0.05, 0.18);
    if (fmP > 0) {
      formulaAppear(state.formulaManager, 'lipschitz',
        '|f(x_1) - f(x_2)| \\leq |x_1 - x_2|',
        50, 13, fmP, { color: colors.accent, fontSize: '1em' });
    }

    // Axes
    const axesP = easedSub(progress, 0.1, 0.22);
    if (axesP > 0) {
      ctx.globalAlpha = axesP;
      r.drawAxes({ xLabel: 'x', yLabel: 'f(x)', xTicks: 8, yTicks: 6 });
      ctx.globalAlpha = 1;
    }

    // Constraint cones at several points
    const coneP = easedSub(progress, 0.2, 0.5);
    if (coneP > 0) {
      const conePoints = [-2, 0, 2];
      const validFn = (x: number): number => Math.sin(x * 0.7) * 0.8;

      for (const cx of conePoints) {
        const fx = validFn(cx);
        const px = r.toX(cx);
        const py = r.toY(fx);

        ctx.save();
        ctx.globalAlpha = coneP * 0.2;

        // Cone: y = fx + (x - cx) and y = fx - (x - cx) (slope +-1)
        const extent = 2.5;
        ctx.fillStyle = colors.insight;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(r.toX(cx + extent), r.toY(fx + extent));
        ctx.lineTo(r.toX(cx + extent), r.toY(fx - extent));
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(r.toX(cx - extent), r.toY(fx + extent));
        ctx.lineTo(r.toX(cx - extent), r.toY(fx - extent));
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        // Cone edges
        ctx.save();
        ctx.globalAlpha = coneP * 0.5;
        ctx.strokeStyle = colors.insight;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);

        // Upper bound lines (slope +1 and -1)
        ctx.beginPath();
        ctx.moveTo(r.toX(cx - extent), r.toY(fx + extent));
        ctx.lineTo(px, py);
        ctx.lineTo(r.toX(cx + extent), r.toY(fx + extent));
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(r.toX(cx - extent), r.toY(fx - extent));
        ctx.lineTo(px, py);
        ctx.lineTo(r.toX(cx + extent), r.toY(fx - extent));
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.restore();

        // Center dot
        r.dot(cx, fx, 4 * coneP, colors.insight);
      }

      if (coneP > 0.5) {
        fadeInText(ctx, tx('scene4', 'coneLabel'), r.toX(2) + 20, r.toY(validFn(2)) - 30, (coneP - 0.5) * 2, {
          color: colors.insight, font: '10px "Segoe UI", system-ui, sans-serif', align: 'left',
        });
      }
    }

    // Valid function (stays within cones)
    const validP = easedSub(progress, 0.4, 0.65);
    if (validP > 0) {
      const validFn = (x: number): number => Math.sin(x * 0.7) * 0.8;
      const steps = 200;
      const nDraw = Math.floor(steps * validP);

      ctx.save();
      ctx.globalAlpha = validP;
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i <= nDraw; i++) {
        const x = -4 + i * 8 / steps;
        if (i === 0) ctx.moveTo(r.toX(x), r.toY(validFn(x)));
        else ctx.lineTo(r.toX(x), r.toY(validFn(x)));
      }
      ctx.stroke();
      ctx.restore();

      if (validP > 0.5) {
        fadeInText(ctx, tx('scene4', 'validLabel'), r.toX(-3), r.toY(validFn(-3)) - 15, (validP - 0.5) * 2, {
          color: colors.insight, font: 'bold 11px "Segoe UI", system-ui, sans-serif',
        });
      }
    }

    // Invalid function (violates constraint — too steep)
    const invalidP = easedSub(progress, 0.6, 0.85);
    if (invalidP > 0) {
      const invalidFn = (x: number): number => 2 * Math.sin(x * 1.2); // slope up to 2.4 > 1

      const steps = 200;
      const nDraw = Math.floor(steps * invalidP);

      ctx.save();
      ctx.globalAlpha = invalidP * 0.7;
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      for (let i = 0; i <= nDraw; i++) {
        const x = -4 + i * 8 / steps;
        if (i === 0) ctx.moveTo(r.toX(x), r.toY(invalidFn(x)));
        else ctx.lineTo(r.toX(x), r.toY(invalidFn(x)));
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      if (invalidP > 0.5) {
        fadeInText(ctx, tx('scene4', 'invalidLabel'), r.toX(1.5), r.toY(invalidFn(1.5)) - 15, (invalidP - 0.5) * 2, {
          color: colors.error, font: 'bold 11px "Segoe UI", system-ui, sans-serif',
        });
      }
    }

    // Slope label
    const slopeP = easedSub(progress, 0.85, 1);
    if (slopeP > 0) {
      fadeInText(ctx, tx('scene4', 'slopeLabel'), W / 2, H - 20, slopeP, {
        color: colors.textMuted, font: 'bold 11px "Segoe UI", system-ui, sans-serif',
      });
    }

    if (progress > 0.95) {
      state.formulaManager.hide('lipschitz');
    }
  },
});
