// Scene 3: The IWAE Bound — formula build-up, K=1 is ELBO, inequality chain

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { animateArrow } from '../../engine/animation/arrow';
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
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`,
    });

    // Phase 1: IWAE bound formula
    const f1P = easedSub(progress, 0.08, 0.3);
    if (f1P > 0) {
      formulaAppear(state.formulaManager, 'iwae-bound',
        '\\mathcal{L}_K = \\mathbb{E}_{z_1,\\ldots,z_K \\sim q}\\!\\left[\\log \\frac{1}{K}\\sum_{k=1}^{K} \\frac{p(\\mathbf{x}, z_k)}{q(z_k|\\mathbf{x})}\\right]',
        50, 30, f1P, { color: colors.textPrimary, fontSize: '1.05em' });
    }

    // Phase 2: K=1 case — highlight
    const k1P = easedSub(progress, 0.28, 0.48);
    if (k1P > 0) {
      const boxX = W * 0.08;
      const boxY = H * 0.42;
      const boxW = W * 0.38;
      const boxH = 50;

      ctx.save();
      ctx.globalAlpha = easeOut(k1P) * 0.8;

      // Box
      ctx.fillStyle = series[0] + '15';
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 1.5;
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      ctx.restore();

      fadeInText(ctx, tx('scene3', 'elboCase'), boxX + boxW / 2, boxY + boxH / 2, k1P, {
        color: series[0], font: `bold 14px ${fonts.body}`,
      });

      // Arrow from formula to box
      animateArrow(ctx, boxX + boxW / 2, boxY - 5, boxX + boxW / 2, boxY - 30, k1P, {
        color: series[0] + '80', headSize: 0, dash: [3, 3],
      });
    }

    // Phase 3: K>1 case — tighter
    const kNP = easedSub(progress, 0.42, 0.62);
    if (kNP > 0) {
      const boxX = W * 0.54;
      const boxY = H * 0.42;
      const boxW = W * 0.38;
      const boxH = 50;

      ctx.save();
      ctx.globalAlpha = easeOut(kNP) * 0.8;

      ctx.fillStyle = colors.insight + '15';
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1.5;
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      ctx.restore();

      fadeInText(ctx, tx('scene3', 'tighterCase'), boxX + boxW / 2, boxY + boxH / 2, kNP, {
        color: colors.insight, font: `bold 14px ${fonts.body}`,
      });
    }

    // Phase 4: Inequality chain formula
    const f2P = easedSub(progress, 0.6, 0.8);
    if (f2P > 0) {
      formulaAppear(state.formulaManager, 'inequality',
        '\\mathcal{L}_1 \\;\\leq\\; \\mathcal{L}_K \\;\\leq\\; \\log p(\\mathbf{x})',
        50, 72, f2P, { color: colors.warning, fontSize: '1.15em' });
    }

    // Phase 5: Visual inequality — three bars
    const barsP = easedSub(progress, 0.75, 0.92);
    if (barsP > 0) {
      const barBottom = H * 0.95;
      const barMaxH = H * 0.18;
      const barW = W * 0.08;
      const gap = W * 0.06;
      const startX = W * 0.28;

      const heights = [0.5, 0.75, 1.0]; // L1, LK, log p(x)
      const barColors = [series[0], colors.insight, colors.textPrimary];
      const labels = ['L\u2081', 'L\u2096', 'log p(x)'];

      for (let i = 0; i < 3; i++) {
        const bp = easedSub(progress, 0.75 + i * 0.04, 0.88 + i * 0.04);
        if (bp > 0) {
          const bx = startX + i * (barW + gap);
          const bh = barMaxH * heights[i] * easeOut(bp);

          ctx.save();
          ctx.globalAlpha = easeOut(bp) * 0.85;
          ctx.fillStyle = barColors[i];
          ctx.fillRect(bx, barBottom - bh, barW, bh);
          ctx.restore();

          fadeInText(ctx, labels[i], bx + barW / 2, barBottom + 12, bp, {
            color: barColors[i], font: `bold 10px ${fonts.body}`,
          });
        }
      }

      // <= signs between bars
      if (barsP > 0.5) {
        ctx.save();
        ctx.globalAlpha = (barsP - 0.5) * 2;
        ctx.fillStyle = colors.textMuted;
        ctx.font = `bold 14px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const midY = barBottom - barMaxH * 0.3;
        ctx.fillText('\u2264', startX + barW + gap / 2, midY);
        ctx.fillText('\u2264', startX + 2 * barW + gap * 1.5, midY);
        ctx.restore();
      }
    }

    // Insight
    const insightP = easedSub(progress, 0.93, 1.0);
    fadeInText(ctx, tx('scene3', 'inequalityLabel'), W / 2, H - 16, insightP, {
      color: colors.insight, font: `bold 11px ${fonts.body}`,
    });
  },
});
