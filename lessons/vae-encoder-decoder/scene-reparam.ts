// Scene 3: The Reparameterization Trick — before/after gradient flow

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { drawBlock, drawSimpleArrow } from '../_shared/network-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene3 = new Scene({
  id: () => tx('scene3', 'id'),
  duration: 22,
  narration: () => tx('scene3', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene3 as SceneText)?.subtitleCues ?? (text.es.scene3 as SceneText).subtitleCues,
  topic: () => tx('scene3', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene3', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    const halfW = W / 2;
    const dividerX = halfW - 5;

    // ===== LEFT SIDE: BEFORE (blocked) =====
    const beforeP = easedSub(progress, 0.05, 0.35);
    if (beforeP > 0) {
      ctx.save();
      ctx.globalAlpha = beforeP;

      // "Before" label
      fadeInText(ctx, tx('scene3', 'beforeLabel'), halfW * 0.5, 52, 1, {
        color: colors.error, font: `bold 14px ${fonts.body}`
      });

      const bY = H * 0.28;
      const bBoxW = halfW * 0.28;
      const bBoxH = H * 0.12;

      // phi box
      drawBlock(ctx, halfW * 0.08, bY, bBoxW, bBoxH, 'phi', 1, series[0]);

      // arrow phi -> sample
      drawSimpleArrow(ctx, halfW * 0.08 + bBoxW, bY + bBoxH / 2, halfW * 0.45, bY + bBoxH / 2, 1, colors.textMuted);

      // Sample box
      drawBlock(ctx, halfW * 0.45, bY, bBoxW, bBoxH, 'z ~ q', 1, colors.warning);

      // arrow sample -> loss
      drawSimpleArrow(ctx, halfW * 0.45 + bBoxW, bY + bBoxH / 2, halfW * 0.82, bY + bBoxH / 2, 1, colors.textMuted);

      // Loss box
      drawBlock(ctx, halfW * 0.82, bY, bBoxW * 0.8, bBoxH, 'L', 1, colors.insight);

      // Red X on sample step
      const xCx = halfW * 0.45 + bBoxW / 2;
      const xCy = bY + bBoxH + 16;
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 3;
      const xSz = 10;
      ctx.beginPath();
      ctx.moveTo(xCx - xSz, xCy - xSz);
      ctx.lineTo(xCx + xSz, xCy + xSz);
      ctx.moveTo(xCx + xSz, xCy - xSz);
      ctx.lineTo(xCx - xSz, xCy + xSz);
      ctx.stroke();

      // Backward gradient dashed and blocked
      const gradY = bY + bBoxH + 38;
      ctx.strokeStyle = colors.error + '60';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(halfW * 0.82, gradY);
      ctx.lineTo(halfW * 0.08 + bBoxW, gradY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Blocked gradient label
      ctx.fillStyle = colors.error;
      ctx.font = `bold 10px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('nabla_phi = 0', halfW * 0.5, gradY + 14);

      ctx.restore();
    }

    // Divider line
    const divP = easedSub(progress, 0.3, 0.4);
    if (divP > 0) {
      ctx.save();
      ctx.globalAlpha = divP;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(dividerX, 50);
      ctx.lineTo(dividerX, H - 30);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // ===== RIGHT SIDE: AFTER (reparameterized) =====
    const afterP = easedSub(progress, 0.35, 0.65);
    if (afterP > 0) {
      ctx.save();
      ctx.globalAlpha = afterP;

      // "After" label
      fadeInText(ctx, tx('scene3', 'afterLabel'), halfW + halfW * 0.5, 52, 1, {
        color: colors.insight, font: `bold 14px ${fonts.body}`
      });

      const aY = H * 0.28;
      const aBoxW = halfW * 0.24;
      const aBoxH = H * 0.12;
      const aOff = halfW + 5;

      // phi box
      drawBlock(ctx, aOff + halfW * 0.06, aY, aBoxW, aBoxH, 'phi', 1, series[0]);

      // Arrow phi -> deterministic z
      drawSimpleArrow(ctx, aOff + halfW * 0.06 + aBoxW, aY + aBoxH / 2,
        aOff + halfW * 0.4, aY + aBoxH / 2, 1, colors.textMuted);

      // mu,sigma label on arrow
      ctx.fillStyle = colors.textSecondary;
      ctx.font = `9px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('mu, sigma', aOff + halfW * 0.06 + aBoxW + (halfW * 0.4 - halfW * 0.06 - aBoxW) / 2, aY + aBoxH / 2 - 9);

      // Deterministic computation box (z = mu + sigma * eps)
      drawBlock(ctx, aOff + halfW * 0.4, aY, aBoxW * 1.2, aBoxH, 'z = mu+sigma*eps', 1, colors.insight);

      // Arrow z -> loss
      drawSimpleArrow(ctx, aOff + halfW * 0.4 + aBoxW * 1.2, aY + aBoxH / 2,
        aOff + halfW * 0.82, aY + aBoxH / 2, 1, colors.textMuted);

      // Loss box
      drawBlock(ctx, aOff + halfW * 0.82, aY, aBoxW * 0.7, aBoxH, 'L', 1, colors.insight);

      // Epsilon input from below (external, not through phi)
      const epsX = aOff + halfW * 0.4 + aBoxW * 0.6;
      const epsY = aY + aBoxH + 30;
      ctx.fillStyle = colors.textMuted;
      ctx.font = `10px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene3', 'epsLabel'), epsX, epsY + 4);
      drawSimpleArrow(ctx, epsX, epsY - 8, epsX, aY + aBoxH + 2, 1, colors.textDimmed, 5);

      // Green check on z computation
      const chkX = aOff + halfW * 0.4 + aBoxW * 0.6;
      const chkY = aY - 10;
      ctx.fillStyle = colors.insight;
      ctx.font = `bold 16px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u2713', chkX, chkY);

      // Backward gradient flowing (solid green)
      const gradY = aY + aBoxH + 50;
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(aOff + halfW * 0.82, gradY);
      ctx.lineTo(aOff + halfW * 0.06 + aBoxW, gradY);
      ctx.stroke();
      // arrowhead
      const ahx = aOff + halfW * 0.06 + aBoxW;
      ctx.fillStyle = colors.insight;
      ctx.beginPath();
      ctx.moveTo(ahx, gradY);
      ctx.lineTo(ahx + 7, gradY - 5);
      ctx.lineTo(ahx + 7, gradY + 5);
      ctx.closePath();
      ctx.fill();

      // Gradient flows label
      ctx.fillStyle = colors.insight;
      ctx.font = `bold 10px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene3', 'gradFlowLabel'), aOff + halfW * 0.5, gradY + 14);

      ctx.restore();
    }

    // Formula at bottom
    const fP = easedSub(progress, 0.7, 0.88);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'reparam',
        'z = \\mu_\\phi(x) + \\sigma_\\phi(x) \\cdot \\varepsilon, \\quad \\varepsilon \\sim \\mathcal{N}(0, I)',
        50, 90, fP, { color: colors.textPrimary, fontSize: '0.9em' });
    }

    // Key insight callout
    const keyP = easedSub(progress, 0.88, 0.98);
    if (keyP > 0) {
      const kx = W / 2, ky = H - 22;
      ctx.save();
      ctx.globalAlpha = keyP;
      ctx.fillStyle = colors.insight + '15';
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(kx - 140, ky - 12, 280, 24, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colors.insight;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene3', 'detLabel'), kx, ky + 3);
      ctx.restore();
    }
  }
});
