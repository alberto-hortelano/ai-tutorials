// Scene 7: Bridge to Variational Inference
// log p(x) is ceiling, ELBO below. Gap = KL(q||p(z|x)). Arrow pushing ELBO up.

import { Scene } from '../../engine/scene';
import { colors, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut, easeInOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene7 = new Scene({
  id: () => tx('scene7', 'id'),
  duration: 22,
  narration: () => tx('scene7', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene7 as SceneText)?.subtitleCues ?? (text.es.scene7 as SceneText).subtitleCues,
  topic: () => tx('scene7', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene7', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Formula
    formulaAppear(state.formulaManager, 'bridge-formula',
      '\\log p(\\mathbf{x}) = \\text{ELBO} + D_{\\text{KL}}\\!\\left(q(\\mathbf{z}|\\mathbf{x})\\,\\|\\,p(\\mathbf{z}|\\mathbf{x})\\right)',
      50, 13, easedSub(progress, 0.05, 0.2), { color: colors.textPrimary, fontSize: '0.95em' });

    // --- Bar diagram: ceiling and ELBO ---
    const barLeft = W * 0.2;
    const barRight = W * 0.8;
    const barW = barRight - barLeft;
    const barH = 30;

    // log p(x) ceiling position (fixed)
    const ceilingY = H * 0.3;

    // ELBO position (animates upward as q improves)
    const elboRise = easedSub(progress, 0.55, 0.85, easeInOut);
    const elboStartY = H * 0.7;
    const elboEndY = H * 0.42;
    const elboY = elboStartY + (elboEndY - elboStartY) * elboRise;

    // Draw ceiling bar: log p(x)
    const ceilP = easedSub(progress, 0.12, 0.25);
    if (ceilP > 0) {
      ctx.globalAlpha = ceilP;

      // Bar
      ctx.fillStyle = colors.accent + '40';
      ctx.fillRect(barLeft, ceilingY, barW * easeOut(ceilP), barH);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.strokeRect(barLeft, ceilingY, barW * easeOut(ceilP), barH);

      ctx.globalAlpha = 1;

      // Label
      fadeInText(ctx, tx('scene7', 'ceilingLabel'), barLeft - 10, ceilingY + barH / 2, ceilP, {
        color: colors.accent, font: `bold 12px ${fonts.body}`, align: 'right'
      });
    }

    // Draw ELBO bar
    const elboP = easedSub(progress, 0.25, 0.4);
    if (elboP > 0) {
      ctx.globalAlpha = elboP;

      // Bar
      ctx.fillStyle = colors.insight + '40';
      ctx.fillRect(barLeft, elboY, barW * easeOut(elboP), barH);
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2;
      ctx.strokeRect(barLeft, elboY, barW * easeOut(elboP), barH);

      ctx.globalAlpha = 1;

      // Label
      fadeInText(ctx, tx('scene7', 'elboLabel'), barLeft - 10, elboY + barH / 2, elboP, {
        color: colors.insight, font: `bold 12px ${fonts.body}`, align: 'right'
      });
    }

    // Draw gap between bars
    const gapP = easedSub(progress, 0.38, 0.55);
    if (gapP > 0) {
      const gapTop = ceilingY + barH;
      const gapBot = elboY;

      // Gap fill
      ctx.fillStyle = colors.warning + '15';
      ctx.globalAlpha = gapP;
      ctx.fillRect(barLeft, gapTop, barW, gapBot - gapTop);
      ctx.globalAlpha = 1;

      // Double-headed arrow showing the gap
      const arrowX = barRight + 15;
      animateArrow(ctx, arrowX, gapTop + 5, arrowX, gapBot - 5, gapP, {
        color: colors.warning, headSize: 6, lineWidth: 2
      });
      animateArrow(ctx, arrowX, gapBot - 5, arrowX, gapTop + 5, gapP, {
        color: colors.warning, headSize: 6, lineWidth: 2
      });

      // KL label
      fadeInText(ctx, tx('scene7', 'gapLabel'), arrowX + 10, (gapTop + gapBot) / 2, gapP, {
        color: colors.warning, font: `bold 11px ${fonts.body}`, align: 'left'
      });
    }

    // Arrow pushing ELBO upward
    const pushP = easedSub(progress, 0.55, 0.8);
    if (pushP > 0 && elboRise < 0.95) {
      const arrowX = barLeft + barW / 2;
      const arrowStartY = elboY + barH + 15;

      // Pulsing upward arrow
      const pulse = 0.7 + 0.3 * Math.sin(progress * 15);
      ctx.globalAlpha = pushP * pulse;
      ctx.fillStyle = colors.insight;
      ctx.font = `bold 20px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('\u25B2', arrowX, arrowStartY); // upward triangle
      ctx.globalAlpha = 1;
    }

    // "Better q closes the gap" label
    fadeInText(ctx, tx('scene7', 'betterQ'), W / 2, H * 0.82, easedSub(progress, 0.7, 0.85), {
      color: colors.insight, font: `bold 12px ${fonts.body}`
    });

    // "Next: Latent Variables" preview
    const nextP = easedSub(progress, 0.88, 1);
    if (nextP > 0) {
      const boxW = W * 0.55;
      const boxH = 30;
      const boxX = (W - boxW) / 2;
      const boxY = H - 45;

      ctx.globalAlpha = nextP;
      r.box(boxX, boxY, boxW, boxH, {
        fill: colors.panelBg, stroke: colors.accent, radius: 6, lineWidth: 1.5
      });
      ctx.globalAlpha = 1;

      fadeInText(ctx, tx('scene7', 'nextTopic'), W / 2, boxY + boxH / 2, nextP, {
        color: colors.accent, font: `bold 13px ${fonts.body}`
      });
    }
  }
});
