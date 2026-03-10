// Scene 3: Score Matching Objective — J = (1/2)E_p[||s_θ - ∇log p||²]

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { gaussian } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

/** True density: mixture of Gaussians */
function pdfTrue(x: number): number {
  return 0.5 * gaussian(x, 3, 0.8) + 0.5 * gaussian(x, 7, 1.0);
}

/** True score (numerical) */
function trueScore(x: number): number {
  const dx = 0.01;
  return (Math.log(Math.max(pdfTrue(x + dx), 1e-12)) - Math.log(Math.max(pdfTrue(x - dx), 1e-12))) / (2 * dx);
}

/** Learned score (imperfect, slightly offset) */
function learnedScore(x: number): number {
  // Imperfect: shifted modes + different scale
  const approx = 0.45 * gaussian(x, 3.3, 0.9) + 0.55 * gaussian(x, 6.7, 1.1);
  const dx = 0.01;
  return (Math.log(Math.max(approx + dx * 0.01, 1e-12)) - Math.log(Math.max(approx - dx * 0.01, 1e-12))) / (2 * dx * 0.01);
}

/** Simpler learned score for visualization */
function learnedScoreSimple(x: number): number {
  return trueScore(x) * 0.7 + 0.3 * Math.sin(x * 0.5);
}

export const scene3 = new Scene({
  id: () => tx('scene3', 'id'),
  duration: 24,
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

    // Formula
    const formulaP = easedSub(progress, 0.05, 0.22);
    if (formulaP > 0) {
      formulaAppear(state.formulaManager, 'sm-obj',
        'J = \\frac{1}{2} \\mathbb{E}_{p}\\left[\\| s_{\\theta}(x) - \\nabla_x \\log p_{\\text{data}} \\|^2 \\right]',
        50, 14, formulaP, { color: colors.accent, fontSize: '1em' });
    }

    // True score unknown — red question mark
    const unknownP = easedSub(progress, 0.2, 0.35);
    if (unknownP > 0) {
      fadeInText(ctx, tx('scene3', 'unknown'), W * 0.82, H * 0.2, unknownP, {
        color: colors.error, font: 'bold 32px "Segoe UI", system-ui, sans-serif',
      });
      fadeInText(ctx, tx('scene3', 'trueScore'), W * 0.82, H * 0.2 + 30, unknownP, {
        color: colors.error, font: '11px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Two vector fields side by side
    const fieldY = H * 0.55;
    const nArrows = 18;

    // True score field (green)
    const trueP = easedSub(progress, 0.3, 0.55);
    if (trueP > 0) {
      fadeInText(ctx, tx('scene3', 'trueScore'), W * 0.25, fieldY - 30, trueP, {
        color: colors.insight, font: 'bold 11px "Segoe UI", system-ui, sans-serif',
      });

      ctx.save();
      ctx.globalAlpha = trueP * 0.8;
      for (let i = 1; i < nArrows; i++) {
        const x = (i / nArrows) * 10;
        const score = trueScore(x);
        const px = W * 0.05 + (i / nArrows) * W * 0.42;
        const arrowLen = Math.min(Math.abs(score) * 8, 20) * Math.sign(score);

        ctx.strokeStyle = colors.insight;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(px, fieldY);
        ctx.lineTo(px + arrowLen * easeOut(trueP), fieldY);
        ctx.stroke();

        if (Math.abs(arrowLen) > 3 && trueP > 0.5) {
          const dir = Math.sign(arrowLen);
          ctx.fillStyle = colors.insight;
          ctx.beginPath();
          ctx.moveTo(px + arrowLen * easeOut(trueP), fieldY);
          ctx.lineTo(px + arrowLen * easeOut(trueP) - dir * 4, fieldY - 3);
          ctx.lineTo(px + arrowLen * easeOut(trueP) - dir * 4, fieldY + 3);
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // Learned score field (accent/violet)
    const learnedP = easedSub(progress, 0.45, 0.7);
    if (learnedP > 0) {
      fadeInText(ctx, tx('scene3', 'learnedScore'), W * 0.75, fieldY - 30, learnedP, {
        color: colors.accent, font: 'bold 11px "Segoe UI", system-ui, sans-serif',
      });

      ctx.save();
      ctx.globalAlpha = learnedP * 0.8;
      for (let i = 1; i < nArrows; i++) {
        const x = (i / nArrows) * 10;
        const score = learnedScoreSimple(x);
        const px = W * 0.53 + (i / nArrows) * W * 0.42;
        const arrowLen = Math.min(Math.abs(score) * 8, 20) * Math.sign(score);

        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(px, fieldY);
        ctx.lineTo(px + arrowLen * easeOut(learnedP), fieldY);
        ctx.stroke();

        if (Math.abs(arrowLen) > 3 && learnedP > 0.5) {
          const dir = Math.sign(arrowLen);
          ctx.fillStyle = colors.accent;
          ctx.beginPath();
          ctx.moveTo(px + arrowLen * easeOut(learnedP), fieldY);
          ctx.lineTo(px + arrowLen * easeOut(learnedP) - dir * 4, fieldY - 3);
          ctx.lineTo(px + arrowLen * easeOut(learnedP) - dir * 4, fieldY + 3);
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // Difference / mismatch highlight
    const diffP = easedSub(progress, 0.7, 0.88);
    if (diffP > 0) {
      fadeInText(ctx, tx('scene3', 'goalLabel'), W / 2, H * 0.75, diffP, {
        color: colors.warning, font: 'bold 13px "Segoe UI", system-ui, sans-serif',
      });

      // Draw mismatch bars
      ctx.save();
      ctx.globalAlpha = diffP * 0.4;
      for (let i = 1; i < nArrows; i++) {
        const x = (i / nArrows) * 10;
        const diff = Math.abs(trueScore(x) - learnedScoreSimple(x));
        const px = W * 0.05 + (i / nArrows) * W * 0.9;
        const barH = diff * 3;
        ctx.fillStyle = colors.error;
        ctx.fillRect(px - 2, H * 0.82, 4, barH);
      }
      ctx.restore();
    }

    // Bottom text
    const bottomP = easedSub(progress, 0.9, 1);
    fadeInText(ctx, tx('scene3', 'goalLabel'), W / 2, H - 22, bottomP, {
      color: colors.accent, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
    });
  },
});
