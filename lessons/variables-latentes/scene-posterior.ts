// Scene 5: The Posterior p(z|x) — Bayes' rule, numerator computable, denominator intractable

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { animateArrow } from '../../engine/animation/arrow';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene5 = new Scene({
  id: () => tx('scene5', 'id'),
  duration: 22,
  narration: () => tx('scene5', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene5 as SceneText)?.subtitleCues ?? (text.es.scene5 as SceneText).subtitleCues,
  topic: () => tx('scene5', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene5', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Phase 1: Question — given x, which z?
    const qP = easedSub(progress, 0.05, 0.2);
    if (qP > 0) {
      // Observed x (a cookie circle)
      const xCircX = W * 0.2;
      const xCircY = H * 0.2;
      ctx.save();
      ctx.globalAlpha = qP;

      ctx.beginPath();
      ctx.arc(xCircX, xCircY, 18, 0, Math.PI * 2);
      ctx.fillStyle = series[0] + 'cc';
      ctx.fill();
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 2;
      ctx.stroke();
      fadeInText(ctx, 'x', xCircX, xCircY, qP, {
        color: colors.textPrimary, font: `bold 14px ${fonts.body}`
      });

      // Question mark and arrow to z?
      const zCircX = W * 0.45;
      animateArrow(ctx, xCircX + 22, xCircY, zCircX - 22, xCircY, qP, {
        color: colors.textMuted, headSize: 7
      });

      // z with question mark
      ctx.beginPath();
      ctx.arc(zCircX, xCircY, 18, 0, Math.PI * 2);
      ctx.fillStyle = colors.panelBg;
      ctx.fill();
      ctx.strokeStyle = colors.textDimmed;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      fadeInText(ctx, 'z = ?', zCircX, xCircY, qP, {
        color: colors.warning, font: `bold 14px ${fonts.body}`
      });

      ctx.restore();
    }

    // Phase 2: Bayes formula — big and central
    const bayesP = easedSub(progress, 0.2, 0.4);
    if (bayesP > 0) {
      formulaAppear(state.formulaManager, 'bayes',
        'p(\\mathbf{z} \\mid \\mathbf{x}) = \\frac{p(\\mathbf{x} \\mid \\mathbf{z}) \\, p(\\mathbf{z})}{p(\\mathbf{x})}',
        50, 42, bayesP, { color: colors.textPrimary, fontSize: '1.3em' });
    }

    // Phase 3: Numerator box — computable (green)
    const numP = easedSub(progress, 0.4, 0.6);
    if (numP > 0) {
      const boxX = W * 0.1;
      const boxY = H * 0.58;
      const boxW = W * 0.35;
      const boxH = H * 0.22;

      ctx.save();
      ctx.globalAlpha = numP;

      // Box
      ctx.fillStyle = colors.insight + '15';
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(boxX + 8, boxY);
      ctx.lineTo(boxX + boxW - 8, boxY);
      ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + 8);
      ctx.lineTo(boxX + boxW, boxY + boxH - 8);
      ctx.quadraticCurveTo(boxX + boxW, boxY + boxH, boxX + boxW - 8, boxY + boxH);
      ctx.lineTo(boxX + 8, boxY + boxH);
      ctx.quadraticCurveTo(boxX, boxY + boxH, boxX, boxY + boxH - 8);
      ctx.lineTo(boxX, boxY + 8);
      ctx.quadraticCurveTo(boxX, boxY, boxX + 8, boxY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Numerator label
      fadeInText(ctx, tx('scene5', 'numeratorLabel'), boxX + boxW / 2, boxY + boxH * 0.35, numP, {
        color: colors.textPrimary, font: `13px ${fonts.body}`
      });

      // Check mark
      fadeInText(ctx, tx('scene5', 'computableLabel'), boxX + boxW / 2, boxY + boxH * 0.7, numP, {
        color: colors.insight, font: `bold 14px ${fonts.body}`
      });

      ctx.restore();
    }

    // Phase 4: Denominator box — intractable (red)
    const denP = easedSub(progress, 0.55, 0.75);
    if (denP > 0) {
      const boxX = W * 0.55;
      const boxY = H * 0.58;
      const boxW = W * 0.35;
      const boxH = H * 0.22;

      ctx.save();
      ctx.globalAlpha = denP;

      // Box
      ctx.fillStyle = colors.error + '15';
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(boxX + 8, boxY);
      ctx.lineTo(boxX + boxW - 8, boxY);
      ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + 8);
      ctx.lineTo(boxX + boxW, boxY + boxH - 8);
      ctx.quadraticCurveTo(boxX + boxW, boxY + boxH, boxX + boxW - 8, boxY + boxH);
      ctx.lineTo(boxX + 8, boxY + boxH);
      ctx.quadraticCurveTo(boxX, boxY + boxH, boxX, boxY + boxH - 8);
      ctx.lineTo(boxX, boxY + 8);
      ctx.quadraticCurveTo(boxX, boxY, boxX + 8, boxY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Denominator label
      fadeInText(ctx, tx('scene5', 'denominatorLabel'), boxX + boxW / 2, boxY + boxH * 0.35, denP, {
        color: colors.textPrimary, font: `13px ${fonts.body}`
      });

      // X mark
      fadeInText(ctx, tx('scene5', 'intractableLabel'), boxX + boxW / 2, boxY + boxH * 0.7, denP, {
        color: colors.error, font: `bold 14px ${fonts.body}`
      });

      ctx.restore();
    }

    // Phase 5: Connecting arrows from formula parts to boxes
    const connP = easedSub(progress, 0.65, 0.8);
    if (connP > 0) {
      ctx.save();
      ctx.globalAlpha = connP;

      // Arrow from formula numerator region to green box
      const numBoxCx = W * 0.1 + W * 0.35 / 2;
      animateArrow(ctx, W * 0.35, H * 0.52, numBoxCx, H * 0.58 - 5, connP, {
        color: colors.insight + 'aa', headSize: 6
      });

      // Arrow from formula denominator region to red box
      const denBoxCx = W * 0.55 + W * 0.35 / 2;
      animateArrow(ctx, W * 0.65, H * 0.52, denBoxCx, H * 0.58 - 5, connP, {
        color: colors.error + 'aa', headSize: 6
      });

      ctx.restore();
    }

    // Phase 6: p(x) = integral reminder
    const remP = easedSub(progress, 0.8, 0.93);
    if (remP > 0) {
      formulaAppear(state.formulaManager, 'px-remind',
        'p(\\mathbf{x}) = \\int p(\\mathbf{x}, \\mathbf{z}) \\, d\\mathbf{z} \\quad \\text{(intractable!)}',
        50, 92, remP, { color: colors.error, fontSize: '0.9em' });
    }
  }
});
