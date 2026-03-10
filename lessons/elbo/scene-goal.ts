// Scene 1: The Goal — Want to maximize log p(x) but can't compute directly

import { Scene } from '../../engine/scene';
import { colors, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut, easeInOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { roundRect } from '../../engine/shared/canvas-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene1 = new Scene({
  id: () => tx('scene1', 'id'),
  duration: 22,
  narration: () => tx('scene1', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene1 as SceneText)?.subtitleCues ?? (text.es.scene1 as SceneText).subtitleCues,
  topic: () => tx('scene1', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene1', 'title'), W / 2, 30, easedSub(progress, 0, 0.1), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`,
    });

    const centerX = W / 2;
    const ceilingY = H * 0.22;
    const questionY = H * 0.55;

    // Ceiling line: log p(x) as a horizontal line
    const ceilP = easedSub(progress, 0.08, 0.25);
    if (ceilP > 0) {
      const lineLen = W * 0.6 * easeOut(ceilP);
      ctx.save();
      ctx.globalAlpha = ceilP;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 5]);
      ctx.beginPath();
      ctx.moveTo(centerX - lineLen / 2, ceilingY);
      ctx.lineTo(centerX + lineLen / 2, ceilingY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Ceiling label
      fadeInText(ctx, tx('scene1', 'ceilingLabel'), centerX, ceilingY - 16, ceilP, {
        color: colors.accent, font: `bold 14px ${fonts.body}`,
      });
    }

    // Formula: log p(x) = log integral p(x,z)dz
    const formulaP = easedSub(progress, 0.15, 0.35);
    if (formulaP > 0) {
      formulaAppear(state.formulaManager, 'logpx',
        '\\log p(\\mathbf{x}) = \\log \\int p(\\mathbf{x}, \\mathbf{z})\\, d\\mathbf{z}',
        50, 38, formulaP, { color: colors.accent, fontSize: '1.1em' });
    }

    // Intractable label with X mark
    const intractP = easedSub(progress, 0.3, 0.48);
    if (intractP > 0) {
      ctx.save();
      ctx.globalAlpha = intractP;

      // Red X over the integral
      const xSize = 14;
      const xCx = centerX;
      const xCy = H * 0.42;
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(xCx - xSize, xCy - xSize);
      ctx.lineTo(xCx + xSize, xCy + xSize);
      ctx.moveTo(xCx + xSize, xCy - xSize);
      ctx.lineTo(xCx - xSize, xCy + xSize);
      ctx.stroke();

      ctx.restore();

      fadeInText(ctx, tx('scene1', 'intractable'), centerX, H * 0.42 + 26, intractP, {
        color: colors.error, font: `12px ${fonts.body}`,
      });
    }

    // Question mark below ceiling — "Our objective = ?"
    const qP = easedSub(progress, 0.45, 0.65);
    if (qP > 0) {
      ctx.save();
      ctx.globalAlpha = qP;

      // Question mark box
      const boxW = W * 0.4;
      const boxH = 50;
      const boxX = centerX - boxW / 2;
      const boxY = questionY - boxH / 2;
      roundRect(ctx, boxX, boxY, boxW, boxH, 10);
      ctx.fillStyle = colors.panelBg;
      ctx.fill();
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = colors.warning;
      ctx.font = `bold 22px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', centerX, questionY);

      ctx.restore();

      fadeInText(ctx, tx('scene1', 'questionLabel'), centerX, questionY + 42, qP, {
        color: colors.warning, font: `13px ${fonts.body}`,
      });
    }

    // Arrow from ceiling down to question
    const arrowP = easedSub(progress, 0.5, 0.7);
    if (arrowP > 0) {
      const arrowLen = (questionY - 25 - ceilingY - 10) * easeInOut(arrowP);
      ctx.save();
      ctx.globalAlpha = arrowP;
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(centerX, ceilingY + 10);
      ctx.lineTo(centerX, ceilingY + 10 + arrowLen);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrowhead
      if (arrowP > 0.3) {
        const tipY = ceilingY + 10 + arrowLen;
        ctx.fillStyle = colors.textMuted;
        ctx.beginPath();
        ctx.moveTo(centerX, tipY);
        ctx.lineTo(centerX - 5, tipY - 8);
        ctx.lineTo(centerX + 5, tipY - 8);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Need computable bound text
    const needP = easedSub(progress, 0.6, 0.75);
    fadeInText(ctx, tx('scene1', 'needComputable'), centerX, H * 0.72, needP, {
      color: colors.textSecondary, font: `12px ${fonts.body}`,
    });

    // Reveal: question mark transforms to "ELBO"
    const revealP = easedSub(progress, 0.78, 0.95);
    if (revealP > 0) {
      ctx.save();

      // Fade out the question mark box
      const fadeOutQ = 1 - revealP;
      if (fadeOutQ > 0) {
        ctx.globalAlpha = fadeOutQ;
        const boxW = W * 0.4;
        const boxH = 50;
        const boxX = centerX - boxW / 2;
        const boxY = questionY - boxH / 2;
        roundRect(ctx, boxX, boxY, boxW, boxH, 10);
        ctx.fillStyle = colors.panelBg;
        ctx.fill();
        ctx.strokeStyle = colors.warning;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = colors.warning;
        ctx.font = `bold 22px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', centerX, questionY);
      }

      // ELBO reveal box
      ctx.globalAlpha = revealP;
      const elboBoxW = W * 0.4;
      const elboBoxH = 50;
      const elboBoxX = centerX - elboBoxW / 2;
      const elboBoxY = questionY - elboBoxH / 2;
      roundRect(ctx, elboBoxX, elboBoxY, elboBoxW, elboBoxH, 10);
      ctx.fillStyle = colors.insight + '20';
      ctx.fill();
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      const scale = 0.85 + 0.15 * easeOut(revealP);
      ctx.translate(centerX, questionY);
      ctx.scale(scale, scale);
      ctx.fillStyle = colors.insight;
      ctx.font = `bold 26px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene1', 'reveal'), 0, 0);
      ctx.restore();
    }
  },
});
