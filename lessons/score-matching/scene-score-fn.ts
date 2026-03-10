// Scene 1: The Score Function — s(x) = ∇_x log p(x), vector field with arrows

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { gaussian } from '../../engine/shared/math-utils';
import { sceneBase, drawTitle, drawFormulaPhased, drawAxesPhased, drawCurvePhased } from '../../engine/animation/scene-helpers';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

/** Mixture of two Gaussians */
function pdfMix(x: number): number {
  return 0.5 * gaussian(x, 3, 0.8) + 0.5 * gaussian(x, 7, 1.0);
}

/** Score = ∇log p (numerical) */
function scoreFn1D(x: number): number {
  const dx = 0.01;
  const lp1 = Math.log(Math.max(pdfMix(x + dx), 1e-12));
  const lp0 = Math.log(Math.max(pdfMix(x - dx), 1e-12));
  return (lp1 - lp0) / (2 * dx);
}

export const scene1 = new Scene({
  id: () => tx('scene1', 'id'),
  duration: 22,
  narration: () => tx('scene1', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene1 as SceneText)?.subtitleCues ?? (text.es.scene1 as SceneText).subtitleCues,
  topic: () => tx('scene1', 'topic'),
  render(progress, ctx, canvas, r, state) {
    const { W, H } = sceneBase(r);

    // Title
    drawTitle(ctx, tx('scene1', 'title'), W, progress);

    // Formula
    drawFormulaPhased(state, 'sm-score-def', 's(x) = \\nabla_x \\log p(x)',
      50, 14, progress, 0.05, 0.2, { color: colors.accent, fontSize: '1.2em' });

    // Density curve
    r.setViewport(0, 10, 0, 0.35);
    drawAxesPhased(ctx, r, progress, 0.08, 0.2, { xLabel: 'x', yLabel: 'p(x)', xTicks: 5, yTicks: 4 });
    drawCurvePhased(r, pdfMix, colors.insight, progress, 0.15, 0.38);

    // Score vector field as horizontal arrows along a line below the density
    const fieldP = easedSub(progress, 0.35, 0.65);
    if (fieldP > 0) {
      const arrowY = H * 0.78;
      const nArrows = 20;

      ctx.save();
      ctx.globalAlpha = fieldP * 0.8;

      fadeInText(ctx, tx('scene1', 'fieldLabel'), W * 0.9, arrowY - 20, fieldP, {
        color: colors.accent, font: '10px "Segoe UI", system-ui, sans-serif', align: 'right',
      });

      for (let i = 1; i < nArrows; i++) {
        const x = (i / nArrows) * 10;
        const score = scoreFn1D(x);
        const px = r.toX(x);
        const arrowLen = Math.min(Math.abs(score) * 8, 22) * Math.sign(score);

        // Arrow shaft
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(px, arrowY);
        ctx.lineTo(px + arrowLen * easeOut(fieldP), arrowY);
        ctx.stroke();

        // Arrowhead
        if (Math.abs(arrowLen) > 3 && fieldP > 0.5) {
          const dir = Math.sign(arrowLen);
          ctx.fillStyle = colors.accent;
          ctx.beginPath();
          ctx.moveTo(px + arrowLen * easeOut(fieldP), arrowY);
          ctx.lineTo(px + arrowLen * easeOut(fieldP) - dir * 4, arrowY - 3);
          ctx.lineTo(px + arrowLen * easeOut(fieldP) - dir * 4, arrowY + 3);
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // Mark the modes where score = 0
    const modesP = easedSub(progress, 0.6, 0.8);
    if (modesP > 0) {
      const modes = [3, 7];
      for (const mode of modes) {
        const px = r.toX(mode);
        const py = r.toY(pdfMix(mode));
        r.dot(mode, pdfMix(mode), 5 * easeOut(modesP), colors.warning);
        // Zero score marker
        ctx.save();
        ctx.globalAlpha = modesP;
        ctx.beginPath();
        ctx.arc(px, H * 0.78, 6, 0, Math.PI * 2);
        ctx.strokeStyle = colors.warning;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
      fadeInText(ctx, tx('scene1', 'atMode'), W / 2, H * 0.78 + 20, modesP, {
        color: colors.warning, font: '11px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Bottom insight
    const insightP = easedSub(progress, 0.85, 1);
    fadeInText(ctx, tx('scene1', 'awayFromMode'), W / 2, H - 22, insightP, {
      color: colors.accent, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
    });
  },
});
