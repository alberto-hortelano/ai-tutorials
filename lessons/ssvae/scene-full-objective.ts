// Scene 6: The Full Objective — three stacking colored bars: labeled ELBO + unlabeled ELBO + alpha*class

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene6 = new Scene({
  id: () => tx('scene6', 'id'),
  duration: 20,
  narration: () => tx('scene6', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene6 as SceneText)?.subtitleCues ?? (text.es.scene6 as SceneText).subtitleCues,
  topic: () => tx('scene6', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene6', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`,
    });

    // Formula
    const f1P = easedSub(progress, 0.06, 0.25);
    if (f1P > 0) {
      formulaAppear(state.formulaManager, 'full-obj',
        '\\mathcal{J} = \\sum_{(x,y)} \\mathcal{L}(x,y) + \\sum_x \\mathcal{U}(x) + \\alpha \\cdot \\mathbb{E}[-\\log q(y|x)]',
        50, 20, f1P, { color: colors.textPrimary, fontSize: '0.9em' });
    }

    // Stacked bar visualization
    const barX = W * 0.35;
    const barW = W * 0.3;
    const barBottom = H * 0.85;
    const totalH = H * 0.48;

    // Three segments (fractions of total)
    const segments = [
      { fraction: 0.35, color: series[0], label: () => tx('scene6', 'labeledTerm') },
      { fraction: 0.45, color: series[1], label: () => tx('scene6', 'unlabeledTerm') },
      { fraction: 0.20, color: series[3], label: () => tx('scene6', 'classTerm') },
    ];

    let cumBottom = barBottom;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const sp = easedSub(progress, 0.22 + i * 0.15, 0.38 + i * 0.15);
      if (sp > 0) {
        const segH = totalH * seg.fraction;
        const animH = segH * easeOut(sp);

        // Segment
        ctx.save();
        ctx.globalAlpha = easeOut(sp) * 0.85;
        ctx.fillStyle = seg.color;
        ctx.fillRect(barX, cumBottom - animH, barW, animH);

        // Border
        ctx.strokeStyle = seg.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, cumBottom - animH, barW, animH);
        ctx.restore();

        // Label to the right
        fadeInText(ctx, seg.label(), barX + barW + 12, cumBottom - segH / 2, sp, {
          color: seg.color, font: `bold 11px ${fonts.body}`, align: 'left' as CanvasTextAlign,
        });

        cumBottom -= segH;
      }
    }

    // Left side: stacked bar bracket with "J"
    const bracketP = easedSub(progress, 0.7, 0.85);
    if (bracketP > 0) {
      const bracketX = barX - 12;
      const topY = barBottom - totalH;

      ctx.save();
      ctx.globalAlpha = easeOut(bracketP);
      ctx.strokeStyle = colors.textPrimary;
      ctx.lineWidth = 1.5;

      // Bracket: | shape
      ctx.beginPath();
      ctx.moveTo(bracketX, barBottom);
      ctx.lineTo(bracketX - 6, barBottom);
      ctx.moveTo(bracketX, barBottom);
      ctx.lineTo(bracketX, topY);
      ctx.lineTo(bracketX - 6, topY);
      ctx.stroke();

      ctx.restore();

      fadeInText(ctx, 'J', bracketX - 18, (barBottom + topY) / 2, bracketP, {
        color: colors.textPrimary, font: `bold 16px ${fonts.body}`,
      });
    }

    // Alpha annotation
    const alphaP = easedSub(progress, 0.78, 0.92);
    if (alphaP > 0) {
      const alphaBoxX = W * 0.08;
      const alphaBoxY = H * 0.88;
      const alphaBoxW = W * 0.3;
      const alphaBoxH = 26;

      ctx.save();
      ctx.globalAlpha = easeOut(alphaP) * 0.7;
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = series[3];
      ctx.lineWidth = 1;
      ctx.fillRect(alphaBoxX, alphaBoxY, alphaBoxW, alphaBoxH);
      ctx.strokeRect(alphaBoxX, alphaBoxY, alphaBoxW, alphaBoxH);
      ctx.restore();

      fadeInText(ctx, tx('scene6', 'alphaLabel'), alphaBoxX + alphaBoxW / 2, alphaBoxY + alphaBoxH / 2, alphaP, {
        color: series[3], font: `bold 10px ${fonts.body}`,
      });
    }

    // Insight
    const insightP = easedSub(progress, 0.93, 1.0);
    fadeInText(ctx, tx('scene6', 'topic').split('.')[0], W / 2, H - 10, insightP, {
      color: colors.insight, font: `bold 11px ${fonts.body}`,
    });
  },
});
