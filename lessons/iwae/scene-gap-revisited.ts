// Scene 1: ELBO Gap Revisited — stacked bar showing log p(x) = ELBO + gap

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { animateArrow } from '../../engine/animation/arrow';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene1 = new Scene({
  id: () => tx('scene1', 'id'),
  duration: 20,
  narration: () => tx('scene1', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene1 as SceneText)?.subtitleCues ?? (text.es.scene1 as SceneText).subtitleCues,
  topic: () => tx('scene1', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene1', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`,
    });

    // Stacked bar layout
    const barX = W * 0.3;
    const barW = W * 0.15;
    const barBottom = H * 0.82;
    const totalH = H * 0.55;
    const elboFraction = 0.65;
    const elboH = totalH * elboFraction;
    const gapH = totalH * (1 - elboFraction);

    // Phase 1: total bar (log p(x))
    const totalP = easedSub(progress, 0.08, 0.25);
    if (totalP > 0) {
      ctx.save();
      ctx.globalAlpha = totalP * 0.3;
      ctx.fillStyle = colors.textMuted;
      ctx.fillRect(barX, barBottom - totalH * easeOut(totalP), barW, totalH * easeOut(totalP));
      ctx.restore();

      // log p(x) label on top
      fadeInText(ctx, tx('scene1', 'logpLabel'), barX + barW / 2, barBottom - totalH - 12, totalP, {
        color: colors.textPrimary, font: `bold 13px ${fonts.body}`,
      });
    }

    // Phase 2: ELBO portion (lower part, accent color)
    const elboP = easedSub(progress, 0.2, 0.4);
    if (elboP > 0) {
      ctx.save();
      ctx.globalAlpha = easeOut(elboP) * 0.85;
      ctx.fillStyle = series[0];
      ctx.fillRect(barX, barBottom - elboH * easeOut(elboP), barW, elboH * easeOut(elboP));
      ctx.restore();

      // ELBO label
      fadeInText(ctx, tx('scene1', 'elboLabel'), barX - 10, barBottom - elboH / 2, elboP, {
        color: series[0], font: `bold 12px ${fonts.body}`, align: 'right' as CanvasTextAlign,
      });
    }

    // Phase 3: Gap portion (upper part, warning color)
    const gapP = easedSub(progress, 0.35, 0.55);
    if (gapP > 0) {
      ctx.save();
      ctx.globalAlpha = easeOut(gapP) * 0.85;
      ctx.fillStyle = colors.error;
      const gapTop = barBottom - elboH - gapH * easeOut(gapP);
      ctx.fillRect(barX, gapTop, barW, gapH * easeOut(gapP));
      ctx.restore();

      // Gap label
      fadeInText(ctx, tx('scene1', 'gapLabel'), barX - 10, barBottom - elboH - gapH / 2, gapP, {
        color: colors.error, font: `bold 12px ${fonts.body}`, align: 'right' as CanvasTextAlign,
      });

      // >= 0 annotation
      fadeInText(ctx, '\u2265 0', barX + barW + 10, barBottom - elboH - gapH / 2, gapP, {
        color: colors.error, font: `bold 11px ${fonts.body}`, align: 'left' as CanvasTextAlign,
      });
    }

    // Phase 4: Formula
    const f1P = easedSub(progress, 0.5, 0.7);
    if (f1P > 0) {
      formulaAppear(state.formulaManager, 'elbo-gap',
        '\\log p(\\mathbf{x}) = \\underbrace{\\mathcal{L}}_\\text{ELBO} + \\underbrace{\\mathrm{KL}(q \\| p(z|x))}_{\\geq 0}',
        50, 25, f1P, { color: colors.textPrimary, fontSize: '1.0em' });
    }

    // Phase 5: Question — can we shrink gap?
    const qP = easedSub(progress, 0.72, 0.88);
    if (qP > 0) {
      // Animated arrow pointing at gap
      const arrowStartX = barX + barW + 40;
      const arrowEndX = barX + barW + 8;
      const arrowY = barBottom - elboH - gapH / 2;
      animateArrow(ctx, arrowStartX, arrowY, arrowEndX, arrowY, qP, {
        color: colors.warning, headSize: 7,
      });

      fadeInText(ctx, tx('scene1', 'questionLabel'), arrowStartX + 10, arrowY, qP, {
        color: colors.warning, font: `bold 13px ${fonts.body}`, align: 'left' as CanvasTextAlign,
      });
    }

    // Phase 6: insight
    const insightP = easedSub(progress, 0.9, 1.0);
    fadeInText(ctx, tx('scene1', 'topic').split('.')[0], W / 2, H - 16, insightP, {
      color: colors.insight, font: `bold 11px ${fonts.body}`,
    });
  },
});
