// Scene 2: Special Cases — Substituting f to recover KL, reverse KL, JSD, chi-sq

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene2 = new Scene({
  id: () => tx('scene2', 'id'),
  duration: 22,
  narration: () => tx('scene2', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene2 as SceneText)?.subtitleCues ?? (text.es.scene2 as SceneText).subtitleCues,
  topic: () => tx('scene2', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene2', 'title'), W / 2, 25, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // General formula at top
    const genP = easedSub(progress, 0.03, 0.15);
    if (genP > 0) {
      formulaAppear(state.formulaManager, 'general', 'D_f(P\\|Q) = \\mathbb{E}_Q\\!\\left[f\\!\\left(\\tfrac{p}{q}\\right)\\right]', 50, 13, genP, { color: colors.textMuted, fontSize: '0.9em' });
    }

    const rowH = (H - 80) / 4;
    const leftX = 30;
    const midX = W * 0.4;
    const rightX = W * 0.72;

    // Row 1: KL
    const klP = easedSub(progress, 0.1, 0.35);
    if (klP > 0) {
      const y1 = 65;
      ctx.save();
      ctx.globalAlpha = klP;

      // f label
      fadeInText(ctx, 'f(t) = t ln t', leftX + 60, y1 + rowH / 2, 1, {
        color: series[0], font: 'bold 12px "Segoe UI", system-ui, sans-serif', align: 'center',
      });

      // Arrow
      const arrowP = easedSub(progress, 0.15, 0.3);
      if (arrowP > 0) {
        ctx.strokeStyle = colors.textDimmed;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(leftX + 130, y1 + rowH / 2);
        ctx.lineTo(leftX + 130 + 40 * arrowP, y1 + rowH / 2);
        ctx.stroke();
        if (arrowP > 0.5) {
          ctx.fillStyle = colors.textDimmed;
          ctx.beginPath();
          ctx.moveTo(leftX + 175, y1 + rowH / 2);
          ctx.lineTo(leftX + 168, y1 + rowH / 2 - 4);
          ctx.lineTo(leftX + 168, y1 + rowH / 2 + 4);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Result
      fadeInText(ctx, tx('scene2', 'klDerivation'), midX + 80, y1 + rowH / 2, arrowP, {
        color: colors.textSecondary, font: '11px "Segoe UI", system-ui, sans-serif', align: 'center',
      });

      // KL label
      fadeInText(ctx, 'KL(P||Q)', rightX + 40, y1 + rowH / 2, arrowP, {
        color: series[0], font: 'bold 13px "Segoe UI", system-ui, sans-serif', align: 'center',
      });

      ctx.restore();
    }

    // Row 2: Reverse KL
    const revP = easedSub(progress, 0.3, 0.55);
    if (revP > 0) {
      const y2 = 65 + rowH;
      ctx.save();
      ctx.globalAlpha = revP;

      fadeInText(ctx, 'f(t) = -ln t', leftX + 60, y2 + rowH / 2, 1, {
        color: series[3], font: 'bold 12px "Segoe UI", system-ui, sans-serif', align: 'center',
      });

      const arrowP = easedSub(progress, 0.35, 0.5);
      if (arrowP > 0) {
        ctx.strokeStyle = colors.textDimmed;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(leftX + 130, y2 + rowH / 2);
        ctx.lineTo(leftX + 130 + 40 * arrowP, y2 + rowH / 2);
        ctx.stroke();
      }

      fadeInText(ctx, tx('scene2', 'revDerivation'), midX + 80, y2 + rowH / 2, arrowP, {
        color: colors.textSecondary, font: '11px "Segoe UI", system-ui, sans-serif', align: 'center',
      });

      fadeInText(ctx, 'KL(Q||P)', rightX + 40, y2 + rowH / 2, arrowP, {
        color: series[3], font: 'bold 13px "Segoe UI", system-ui, sans-serif', align: 'center',
      });

      ctx.restore();
    }

    // Row 3: Chi-squared
    const chiP = easedSub(progress, 0.5, 0.75);
    if (chiP > 0) {
      const y3 = 65 + rowH * 2;
      ctx.save();
      ctx.globalAlpha = chiP;

      fadeInText(ctx, 'f(t) = (t-1)^2', leftX + 60, y3 + rowH / 2, 1, {
        color: series[2], font: 'bold 12px "Segoe UI", system-ui, sans-serif', align: 'center',
      });

      const arrowP = easedSub(progress, 0.55, 0.7);
      if (arrowP > 0) {
        ctx.strokeStyle = colors.textDimmed;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(leftX + 130, y3 + rowH / 2);
        ctx.lineTo(leftX + 130 + 40 * arrowP, y3 + rowH / 2);
        ctx.stroke();
      }

      fadeInText(ctx, tx('scene2', 'chiDerivation'), midX + 80, y3 + rowH / 2, arrowP, {
        color: colors.textSecondary, font: '11px "Segoe UI", system-ui, sans-serif', align: 'center',
      });

      fadeInText(ctx, 'Chi-sq(P||Q)', rightX + 40, y3 + rowH / 2, arrowP, {
        color: series[2], font: 'bold 13px "Segoe UI", system-ui, sans-serif', align: 'center',
      });

      ctx.restore();
    }

    // Row 4: JSD
    const jsdP = easedSub(progress, 0.7, 0.95);
    if (jsdP > 0) {
      const y4 = 65 + rowH * 3;
      ctx.save();
      ctx.globalAlpha = jsdP;

      fadeInText(ctx, tx('scene2', 'jsdLabel'), W / 2, y4 + rowH / 2 - 8, jsdP, {
        color: series[4], font: '10px "Segoe UI", system-ui, sans-serif', align: 'center',
      });

      fadeInText(ctx, 'JSD(P||Q)', W / 2, y4 + rowH / 2 + 12, jsdP, {
        color: series[4], font: 'bold 13px "Segoe UI", system-ui, sans-serif', align: 'center',
      });

      ctx.restore();
    }

    // Cleanup formulas
    if (progress > 0.95) {
      state.formulaManager.hide('general');
    }
  },
});
