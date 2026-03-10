// Scene 4: Computing Density (Fast!) — parallel computation diagram

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut, easeOutBack } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene4 = new Scene({
  id: () => tx('scene4', 'id'),
  duration: 20,
  narration: () => tx('scene4', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene4 as SceneText)?.subtitleCues ?? (text.es.scene4 as SceneText).subtitleCues,
  topic: () => tx('scene4', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene4', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    const N = 6;
    const boxW = Math.min(W * 0.1, 50);
    const boxH = 28;
    const spacing = boxW + 14;
    const startX = W / 2 - (N * spacing) / 2 + boxW / 2;

    // Top row: given data x (all appear together)
    const dataY = H * 0.18;
    const dataP = easedSub(progress, 0.05, 0.2);
    if (dataP > 0) {
      fadeInText(ctx, 'x', startX - 30, dataY + boxH / 2, dataP, {
        color: colors.textSecondary, font: `bold 14px ${fonts.body}`
      });

      for (let i = 0; i < N; i++) {
        const bx = startX + i * spacing;

        ctx.save();
        ctx.globalAlpha = easeOut(dataP);

        ctx.fillStyle = series[0] + '30';
        ctx.strokeStyle = series[0];
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(bx - boxW / 2, dataY, boxW, boxH, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = series[0];
        ctx.font = `bold 10px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`x${i + 1}`, bx, dataY + boxH / 2);
        ctx.textBaseline = 'alphabetic';

        ctx.restore();
      }
    }

    // Middle row: NN blocks (all flash simultaneously = parallel)
    const nnY = H * 0.38;
    const nnFlashP = easedSub(progress, 0.2, 0.45);
    if (nnFlashP > 0) {
      // "All in parallel" label
      fadeInText(ctx, tx('scene4', 'parallel'), W / 2, nnY - 16, easedSub(progress, 0.2, 0.3), {
        color: colors.insight, font: `bold 11px ${fonts.body}`
      });

      for (let i = 0; i < N; i++) {
        const bx = startX + i * spacing;

        // All boxes flash at the same time
        const flashAlpha = Math.min(nnFlashP * 2.5, 1);

        ctx.save();
        ctx.globalAlpha = flashAlpha;

        // Arrow from data to NN
        ctx.strokeStyle = colors.textDimmed;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx, dataY + boxH + 2);
        ctx.lineTo(bx, nnY - 1);
        ctx.stroke();
        ctx.fillStyle = colors.textDimmed;
        ctx.beginPath();
        ctx.moveTo(bx, nnY - 1);
        ctx.lineTo(bx - 3, nnY - 6);
        ctx.lineTo(bx + 3, nnY - 6);
        ctx.closePath();
        ctx.fill();

        // NN block
        ctx.fillStyle = colors.accent + '40';
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(bx - boxW / 2, nnY, boxW, boxH, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = colors.accent;
        ctx.font = `bold 9px ${fonts.mono}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('NN', bx, nnY + boxH / 2);
        ctx.textBaseline = 'alphabetic';

        ctx.restore();
      }
    }

    // Bottom row: conditional log probabilities
    const logY = H * 0.58;
    const logP = easedSub(progress, 0.4, 0.6);
    if (logP > 0) {
      for (let i = 0; i < N; i++) {
        const bx = startX + i * spacing;
        const lP = Math.min(logP * 2, 1);

        ctx.save();
        ctx.globalAlpha = easeOut(lP);

        // Arrow from NN to log prob
        ctx.strokeStyle = colors.textDimmed;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx, nnY + boxH + 2);
        ctx.lineTo(bx, logY - 1);
        ctx.stroke();
        ctx.fillStyle = colors.textDimmed;
        ctx.beginPath();
        ctx.moveTo(bx, logY - 1);
        ctx.lineTo(bx - 3, logY - 6);
        ctx.lineTo(bx + 3, logY - 6);
        ctx.closePath();
        ctx.fill();

        // Log prob box
        ctx.fillStyle = series[1] + '30';
        ctx.strokeStyle = series[1];
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(bx - boxW / 2, logY, boxW, boxH, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = series[1];
        ctx.font = `bold 8px ${fonts.mono}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`log p${i + 1}`, bx, logY + boxH / 2);
        ctx.textBaseline = 'alphabetic';

        ctx.restore();
      }
    }

    // Summation: all log probs converge to sum
    const sumP = easedSub(progress, 0.55, 0.75);
    if (sumP > 0) {
      const sumX = W / 2;
      const sumY = H * 0.78;

      ctx.save();
      ctx.globalAlpha = easeOut(sumP);

      // Convergence lines from each log prob to summation
      for (let i = 0; i < N; i++) {
        const bx = startX + i * spacing;
        const lineP = easedSub(progress, 0.55 + i * 0.02, 0.7 + i * 0.02);
        if (lineP > 0) {
          ctx.save();
          ctx.globalAlpha = easeOut(lineP) * easeOut(sumP);
          ctx.strokeStyle = series[1] + '80';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(bx, logY + boxH + 2);
          ctx.lineTo(sumX, sumY - 16);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }
      }

      // Summation symbol circle
      ctx.beginPath();
      ctx.arc(sumX, sumY, 16, 0, Math.PI * 2);
      ctx.fillStyle = colors.insight + '30';
      ctx.fill();
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = colors.insight;
      ctx.font = `bold 16px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u03a3', sumX, sumY);
      ctx.textBaseline = 'alphabetic';

      // Result label
      fadeInText(ctx, tx('scene4', 'logP'), sumX + 30, sumY, easedSub(progress, 0.65, 0.75), {
        color: colors.insight, font: `bold 13px ${fonts.body}`, align: 'left'
      });

      ctx.restore();
    }

    // "One forward pass" label
    const oneP = easedSub(progress, 0.35, 0.5);
    fadeInText(ctx, tx('scene4', 'onePass'), W / 2, nnY + boxH + 14, oneP, {
      color: colors.textMuted, font: `10px ${fonts.body}`
    });

    // FAST badge
    const fastP = easedSub(progress, 0.75, 0.88, easeOutBack);
    if (fastP > 0) {
      const fx = W / 2;
      const fy = H * 0.92;

      ctx.save();
      ctx.globalAlpha = fastP;
      ctx.fillStyle = colors.insight + '25';
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(fx - 60, fy - 16, 120, 32, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.insight;
      ctx.font = `bold 16px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene4', 'fast'), fx, fy + 5);
      ctx.restore();
    }

    // Formula
    const fP = easedSub(progress, 0.88, 0.98);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'density',
        '\\log p(\\mathbf{x}) = \\sum_{i=1}^{n} \\log p(x_i \\mid \\mathbf{x}_{<i})',
        50, 86, fP, { color: colors.textPrimary, fontSize: '0.95em' });
    }
  }
});
