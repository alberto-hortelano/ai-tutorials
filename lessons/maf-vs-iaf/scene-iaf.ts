// Scene 3: IAF — fast sampling, slow density
// Enhanced: explains WHY sampling is fast — autoregressive direction = generation direction

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
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

    fadeInText(ctx, tx('scene3', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    const D = 5;
    const boxW = Math.min(W * 0.1, 55);
    const boxH = 30;
    const spacing = boxW + 12;
    const startX = W / 2 - (D * spacing) / 2 + boxW / 2;

    // --- Sampling panel (top) — parallel, fast ---
    const sampY = H * 0.16;
    const sampP = easedSub(progress, 0.05, 0.45);
    if (sampP > 0) {
      ctx.save();
      ctx.globalAlpha = sampP;

      fadeInText(ctx, tx('scene3', 'samplingLabel'), W / 2, sampY - 18, 1, {
        color: colors.textSecondary, font: `bold 13px ${fonts.body}`
      });

      // Step 1: Sample z (all at once, independent)
      const zFlash = easedSub(progress, 0.08, 0.16);
      for (let i = 0; i < D; i++) {
        const bx = startX + i * spacing;
        const alpha = Math.min(zFlash * 3, 1);
        ctx.globalAlpha = alpha * sampP;

        ctx.fillStyle = series[0] + '30';
        ctx.strokeStyle = series[0];
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(bx - boxW / 2, sampY, boxW, boxH, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = series[0];
        ctx.font = `bold 11px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(`z${i + 1}`, bx, sampY + boxH / 2 + 4);
      }

      // Step 2: Network transforms z → x in one pass
      const netP = easedSub(progress, 0.15, 0.28);
      if (netP > 0) {
        ctx.globalAlpha = netP * sampP;
        const nnY = sampY + boxH + 8;
        const nnW = D * spacing - 12;
        const nnH = 26;
        const nnX = startX - boxW / 2;

        ctx.fillStyle = colors.panelBg;
        ctx.strokeStyle = colors.insight;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(nnX, nnY, nnW, nnH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = colors.insight;
        ctx.font = `bold 10px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(tx('scene3', 'whyFast'), nnX + nnW / 2, nnY + nnH / 2 + 3);
      }

      // Step 3: Output x (all at once)
      const xFlash = easedSub(progress, 0.22, 0.32);
      if (xFlash > 0) {
        const outY = sampY + boxH + 42;
        for (let i = 0; i < D; i++) {
          const bx = startX + i * spacing;
          const alpha = Math.min(xFlash * 3, 1);
          ctx.globalAlpha = alpha * sampP;

          ctx.fillStyle = colors.insight + '30';
          ctx.strokeStyle = colors.insight;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(bx - boxW / 2, outY, boxW, boxH, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = colors.insight;
          ctx.font = `bold 11px ${fonts.body}`;
          ctx.textAlign = 'center';
          ctx.fillText(`x${i + 1}`, bx, outY + boxH / 2 + 4);
        }
      }

      // WHY fast badge
      const whyP = easedSub(progress, 0.28, 0.4);
      if (whyP > 0) {
        ctx.globalAlpha = whyP * sampP;
        fadeInText(ctx, tx('scene3', 'genDirection'), W / 2, sampY + boxH + 82, 1, {
          color: colors.insight, font: `bold 10px ${fonts.body}`
        });
      }

      fadeInText(ctx, tx('scene3', 'fast'), W / 2, sampY + boxH + 100, easedSub(progress, 0.3, 0.4), {
        color: colors.insight, font: `bold 12px ${fonts.body}`
      });

      ctx.restore();
    }

    // --- Density panel (bottom) — sequential, slow ---
    const densY = H * 0.58;
    const densP = easedSub(progress, 0.4, 0.8);
    if (densP > 0) {
      ctx.save();
      ctx.globalAlpha = densP;

      fadeInText(ctx, tx('scene3', 'densityLabel'), W / 2, densY - 18, 1, {
        color: colors.textSecondary, font: `bold 13px ${fonts.body}`
      });

      // Boxes appear one by one (sequential = slow)
      for (let i = 0; i < D; i++) {
        const boxP = easedSub(progress, 0.45 + i * 0.06, 0.49 + i * 0.06 + 0.04);
        if (boxP <= 0) continue;

        const bx = startX + i * spacing;
        ctx.globalAlpha = boxP * densP;

        ctx.fillStyle = colors.error + '30';
        ctx.strokeStyle = colors.error;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(bx - boxW / 2, densY, boxW, boxH, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = colors.error;
        ctx.font = `bold 11px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(`z${i + 1}`, bx, densY + boxH / 2 + 4);

        // Arrow from previous
        if (i > 0) {
          const prevX = startX + (i - 1) * spacing + boxW / 2 + 3;
          const curX = bx - boxW / 2 - 3;
          ctx.strokeStyle = colors.error;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(prevX, densY + boxH / 2);
          ctx.lineTo(curX, densY + boxH / 2);
          ctx.stroke();
          ctx.fillStyle = colors.error;
          ctx.beginPath();
          ctx.moveTo(curX, densY + boxH / 2);
          ctx.lineTo(curX - 5, densY + boxH / 2 - 3);
          ctx.lineTo(curX - 5, densY + boxH / 2 + 3);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Slow label
      fadeInText(ctx, tx('scene3', 'slow'), W / 2, densY + boxH + 18, easedSub(progress, 0.7, 0.8), {
        color: colors.error, font: `bold 12px ${fonts.body}`
      });

      ctx.restore();
    }

    // Formula
    const fP = easedSub(progress, 0.82, 0.97);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'iaf',
        'x_i = \\mu_i(z_{1:i-1}) + \\sigma_i(z_{1:i-1}) \\cdot z_i',
        50, 92, fP, { color: colors.textPrimary, fontSize: '1.05em' });
    }
  }
});
