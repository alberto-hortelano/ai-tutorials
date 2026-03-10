// Scene 1: The Autoregressive Idea — chain rule, sequential reveal, NN icons

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut, easeOutBack } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { formulaAppear } from '../../engine/animation/formula';
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
    fadeInText(ctx, tx('scene1', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Chain rule label
    const chainP = easedSub(progress, 0.05, 0.15);
    fadeInText(ctx, tx('scene1', 'chainRule'), W / 2, 56, chainP, {
      color: colors.accent, font: `bold 13px ${fonts.body}`
    });

    // Sequential reveal: 7 boxes x1..x7 with NN icons and arrows between them
    const N = 7;
    const boxW = Math.min(W * 0.08, 44);
    const boxH = 30;
    const spacing = boxW + 18;
    const startX = W / 2 - (N * spacing) / 2 + boxW / 2;
    const boxY = H * 0.3;

    for (let i = 0; i < N; i++) {
      const boxP = easedSub(progress, 0.08 + i * 0.06, 0.15 + i * 0.06);
      if (boxP <= 0) continue;

      const bx = startX + i * spacing;

      ctx.save();
      ctx.globalAlpha = easeOut(boxP);

      // Variable box
      ctx.fillStyle = series[0] + '30';
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx - boxW / 2, boxY, boxW, boxH, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = series[0];
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`x${i + 1}`, bx, boxY + boxH / 2);
      ctx.textBaseline = 'alphabetic';

      ctx.restore();

      // Arrow from previous box to current
      if (i > 0) {
        const arrP = easedSub(progress, 0.1 + i * 0.06, 0.17 + i * 0.06);
        if (arrP > 0) {
          const prevX = startX + (i - 1) * spacing + boxW / 2 + 3;
          const curX = bx - boxW / 2 - 3;
          animateArrow(ctx, prevX, boxY + boxH / 2, curX, boxY + boxH / 2, arrP, {
            color: colors.textMuted, headSize: 6, lineWidth: 1.5
          });
        }
      }

      // NN icon (small circle) between boxes, below the arrow
      if (i > 0) {
        const nnP = easedSub(progress, 0.12 + i * 0.06, 0.2 + i * 0.06);
        if (nnP > 0) {
          const nnX = (startX + (i - 1) * spacing + bx) / 2;
          const nnY = boxY + boxH + 18;
          const nnR = 8;

          ctx.save();
          ctx.globalAlpha = easeOut(nnP);

          // NN circle
          ctx.beginPath();
          ctx.arc(nnX, nnY, nnR, 0, Math.PI * 2);
          ctx.fillStyle = colors.accent + '40';
          ctx.fill();
          ctx.strokeStyle = colors.accent;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // NN label
          ctx.fillStyle = colors.accent;
          ctx.font = `bold 7px ${fonts.mono}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('NN', nnX, nnY);
          ctx.textBaseline = 'alphabetic';

          ctx.restore();
        }
      }
    }

    // "No approximations" badge
    const noApproxP = easedSub(progress, 0.55, 0.7, easeOutBack);
    if (noApproxP > 0) {
      const badgeX = W / 2;
      const badgeY = H * 0.58;

      ctx.save();
      ctx.globalAlpha = noApproxP;
      ctx.fillStyle = colors.insight + '20';
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(badgeX - 100, badgeY - 14, 200, 28, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.insight;
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene1', 'noApprox'), badgeX, badgeY + 4);
      ctx.restore();
    }

    // "Exact likelihoods" badge
    const exactP = easedSub(progress, 0.65, 0.8, easeOutBack);
    if (exactP > 0) {
      const badgeX = W / 2;
      const badgeY = H * 0.68;

      ctx.save();
      ctx.globalAlpha = exactP;
      ctx.fillStyle = colors.warning + '20';
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(badgeX - 100, badgeY - 14, 200, 28, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.warning;
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene1', 'exactLik'), badgeX, badgeY + 4);
      ctx.restore();
    }

    // Formula: p(x) = prod p(xi|x<i)
    const fP = easedSub(progress, 0.8, 0.95);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'chain',
        'p(\\mathbf{x}) = \\prod_{i=1}^{n} p(x_i \\mid x_1, \\ldots, x_{i-1})',
        50, 88, fP, { color: colors.textPrimary, fontSize: '1em' });
    }
  }
});
