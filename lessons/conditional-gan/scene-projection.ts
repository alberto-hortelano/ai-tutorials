// Scene 4: Projection Discriminator — D(x,y) = sigma(phi(x)^T e(y) + psi(x))

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { drawBlock } from '../_shared/network-utils';
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
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene4', 'title'), W / 2, 25, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Formula
    const fmP = easedSub(progress, 0.05, 0.2);
    if (fmP > 0) {
      formulaAppear(state.formulaManager, 'projD',
        'D(x,y) = \\sigma\\!\\left(\\varphi(x)^\\top e(y) + \\psi(x)\\right)',
        50, 13, fmP, { color: colors.accent, fontSize: '0.9em' });
    }

    const midY = H * 0.52;

    // Input x
    const xP = easedSub(progress, 0.12, 0.3);
    if (xP > 0) {
      const xBoxX = 15, xBoxY = midY - 45, xBoxW = 40, xBoxH = 35;
      ctx.save();
      ctx.globalAlpha = xP;
      ctx.fillStyle = colors.textDimmed + '30';
      ctx.fillRect(xBoxX, xBoxY, xBoxW, xBoxH);
      ctx.strokeStyle = colors.textDimmed;
      ctx.lineWidth = 1;
      ctx.strokeRect(xBoxX, xBoxY, xBoxW, xBoxH);
      fadeInText(ctx, 'x', xBoxX + xBoxW / 2, xBoxY + xBoxH / 2, 1, {
        color: colors.textSecondary, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
      });
      ctx.restore();
    }

    // Feature extractor phi(x)
    const phiP = easedSub(progress, 0.2, 0.42);
    if (phiP > 0) {
      const phiX = 85, phiY = midY - 50, phiW = 70, phiH = 45;
      drawBlock(ctx, phiX, phiY, phiW, phiH, tx('scene4', 'phiLabel'), phiP, series[0]);

      // Arrow from x to phi
      animateArrow(ctx, 60, midY - 27, phiX - 5, midY - 27, phiP, {
        color: colors.textDimmed, lineWidth: 1.5,
      });
    }

    // Embedding e(y)
    const eyP = easedSub(progress, 0.25, 0.45);
    if (eyP > 0) {
      const eyX = 85, eyY = midY + 15, eyW = 70, eyH = 35;
      drawBlock(ctx, eyX, eyY, eyW, eyH, tx('scene4', 'eyLabel'), eyP, colors.warning);

      // y input
      fadeInText(ctx, 'y', 40, eyY + eyH / 2, eyP, {
        color: colors.warning, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
      });
      animateArrow(ctx, 50, eyY + eyH / 2, eyX - 5, eyY + eyH / 2, eyP, {
        color: colors.warning, lineWidth: 1.5,
      });
    }

    // Inner product phi(x)^T e(y)
    const dotP = easedSub(progress, 0.38, 0.6);
    if (dotP > 0) {
      const dotX = 195, dotY = midY - 20, dotW = 80, dotH = 30;

      ctx.save();
      ctx.globalAlpha = dotP;

      // Circle for dot product operation
      ctx.beginPath();
      ctx.arc(dotX + dotW / 2, dotY + dotH / 2, 18, 0, Math.PI * 2);
      ctx.fillStyle = colors.insight + '20';
      ctx.fill();
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = colors.insight;
      ctx.font = 'bold 14px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('\u00b7', dotX + dotW / 2, dotY + dotH / 2 + 4);

      ctx.restore();

      // Arrows to dot product
      animateArrow(ctx, 160, midY - 27, dotX + dotW / 2 - 20, dotY + dotH / 2 - 8, dotP, {
        color: series[0], lineWidth: 1.5,
      });
      animateArrow(ctx, 160, midY + 32, dotX + dotW / 2 - 20, dotY + dotH / 2 + 8, dotP, {
        color: colors.warning, lineWidth: 1.5,
      });

      fadeInText(ctx, tx('scene4', 'dotLabel'), dotX + dotW / 2, dotY - 12, dotP, {
        color: colors.insight, font: '9px "Segoe UI", system-ui, sans-serif',
      });
    }

    // psi(x) branch
    const psiP = easedSub(progress, 0.5, 0.7);
    if (psiP > 0) {
      const psiX = 195, psiY = midY + 30, psiW = 60, psiH = 25;
      drawBlock(ctx, psiX, psiY, psiW, psiH, tx('scene4', 'psiLabel'), psiP, colors.textMuted);

      // Arrow from phi area
      animateArrow(ctx, 160, midY - 15, psiX - 5, psiY + psiH / 2, psiP, {
        color: colors.textDimmed, lineWidth: 1, dash: [3, 3],
      });
    }

    // Sum and sigma
    const sigP = easedSub(progress, 0.6, 0.8);
    if (sigP > 0) {
      const sumX = 310, sumY = midY - 10;

      ctx.save();
      ctx.globalAlpha = sigP;

      // Plus sign
      ctx.fillStyle = colors.textSecondary;
      ctx.font = 'bold 14px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('+', sumX - 15, sumY + 5);

      // Sigma block
      const sigX = sumX, sigW = 55, sigH = 30;
      drawBlock(ctx, sigX, sumY - sigH / 2, sigW, sigH, '\u03c3', sigP, colors.accent);

      ctx.restore();

      // Arrows
      animateArrow(ctx, 255, midY - 10, sumX - 25, sumY, sigP, { color: colors.insight, lineWidth: 1.5 });
      animateArrow(ctx, 260, midY + 42, sumX - 25, sumY + 5, sigP, { color: colors.textMuted, lineWidth: 1.5 });

      // Output
      animateArrow(ctx, sumX + 60, sumY, sumX + 90, sumY, sigP, { color: colors.accent, lineWidth: 1.5 });
      fadeInText(ctx, 'D(x,y)', sumX + 115, sumY, sigP, {
        color: colors.accent, font: 'bold 12px "Segoe UI", system-ui, sans-serif', align: 'left',
      });
    }

    // Comparison: concat vs projection at bottom
    const compP = easedSub(progress, 0.8, 0.95);
    if (compP > 0) {
      const compY = H - 40;
      fadeInText(ctx, tx('scene4', 'concatAlt'), W * 0.25, compY, compP, {
        color: colors.error, font: '10px "Segoe UI", system-ui, sans-serif',
      });
      fadeInText(ctx, tx('scene4', 'projAlt'), W * 0.75, compY, compP, {
        color: colors.insight, font: 'bold 10px "Segoe UI", system-ui, sans-serif',
      });

      // Divider
      ctx.save();
      ctx.globalAlpha = compP;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W / 2, compY - 8);
      ctx.lineTo(W / 2, compY + 8);
      ctx.stroke();
      ctx.restore();
    }

    if (progress > 0.95) {
      state.formulaManager.hide('projD');
    }
  },
});
