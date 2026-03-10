// Scene 2: MAF — fast density, slow sampling
// Enhanced: shows NADE forward pass computing all conditionals in parallel

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
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

    fadeInText(ctx, tx('scene2', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    const D = 5;
    const boxW = Math.min(W * 0.1, 55);
    const boxH = 30;
    const spacing = boxW + 12;
    const startX = W / 2 - (D * spacing) / 2 + boxW / 2;

    // Sampling panel (top) — sequential, slow
    const sampY = H * 0.18;
    const sampP = easedSub(progress, 0.05, 0.4);
    if (sampP > 0) {
      ctx.save();
      ctx.globalAlpha = sampP;

      fadeInText(ctx, tx('scene2', 'samplingLabel'), W / 2, sampY - 18, 1, {
        color: colors.textSecondary, font: `bold 13px ${fonts.body}`
      });

      // Boxes appear one by one (sequential)
      for (let i = 0; i < D; i++) {
        const boxP = easedSub(progress, 0.1 + i * 0.05, 0.14 + i * 0.05 + 0.04);
        if (boxP <= 0) continue;

        const bx = startX + i * spacing;
        ctx.globalAlpha = boxP * sampP;

        ctx.fillStyle = colors.error + '30';
        ctx.strokeStyle = colors.error;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(bx - boxW / 2, sampY, boxW, boxH, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = colors.error;
        ctx.font = `bold 11px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(`x${i + 1}`, bx, sampY + boxH / 2 + 4);

        // Arrow from previous
        if (i > 0) {
          const prevX = startX + (i - 1) * spacing + boxW / 2 + 3;
          const curX = bx - boxW / 2 - 3;
          ctx.strokeStyle = colors.error;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(prevX, sampY + boxH / 2);
          ctx.lineTo(curX, sampY + boxH / 2);
          ctx.stroke();
          ctx.fillStyle = colors.error;
          ctx.beginPath();
          ctx.moveTo(curX, sampY + boxH / 2);
          ctx.lineTo(curX - 5, sampY + boxH / 2 - 3);
          ctx.lineTo(curX - 5, sampY + boxH / 2 + 3);
          ctx.closePath();
          ctx.fill();
        }
      }

      fadeInText(ctx, tx('scene2', 'slow'), W / 2, sampY + boxH + 16, easedSub(progress, 0.28, 0.38), {
        color: colors.error, font: `bold 12px ${fonts.body}`
      });

      ctx.restore();
    }

    // --- NADE forward pass visualization (middle section) ---
    const nadeY = H * 0.42;
    const nadeP = easedSub(progress, 0.35, 0.65);
    if (nadeP > 0) {
      ctx.save();
      ctx.globalAlpha = nadeP;

      // Input x boxes
      fadeInText(ctx, tx('scene2', 'densityLabel'), W / 2, nadeY - 18, 1, {
        color: colors.textSecondary, font: `bold 13px ${fonts.body}`
      });

      // Input: given x (all at once)
      const inputFlash = easedSub(progress, 0.38, 0.45);
      for (let i = 0; i < D; i++) {
        const bx = startX + i * spacing;
        const alpha = Math.min(inputFlash * 3, 1);
        ctx.globalAlpha = alpha * nadeP;

        ctx.fillStyle = colors.accent + '30';
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(bx - boxW / 2, nadeY, boxW, boxH, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = colors.accent;
        ctx.font = `bold 11px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(`x${i + 1}`, bx, nadeY + boxH / 2 + 4);
      }

      // NADE box (neural network)
      const nadeBoxP = easedSub(progress, 0.43, 0.53);
      if (nadeBoxP > 0) {
        ctx.globalAlpha = nadeBoxP * nadeP;
        const nnY = nadeY + boxH + 10;
        const nnW = D * spacing - 12;
        const nnH = 28;
        const nnX = startX - boxW / 2;

        ctx.fillStyle = colors.panelBg;
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(nnX, nnY, nnW, nnH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = colors.accent;
        ctx.font = `bold 11px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText('NADE', nnX + nnW / 2, nnY + nnH / 2 + 4);

        // Output: all μᵢ, σᵢ simultaneously
        const outP = easedSub(progress, 0.5, 0.58);
        if (outP > 0) {
          const outY = nnY + nnH + 10;
          const outFlash = Math.min(outP * 3, 1);

          for (let i = 0; i < D; i++) {
            const bx = startX + i * spacing;
            ctx.globalAlpha = outFlash * nadeP;

            ctx.fillStyle = colors.insight + '30';
            ctx.strokeStyle = colors.insight;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(bx - boxW / 2, outY, boxW, boxH, 4);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = colors.insight;
            ctx.font = `9px ${fonts.mono}`;
            ctx.textAlign = 'center';
            ctx.fillText(`\u03BC${i + 1},\u03C3${i + 1}`, bx, outY + boxH / 2 + 3);
          }

          // Label
          fadeInText(ctx, tx('scene2', 'nadePass'), W / 2, outY + boxH + 14, outP, {
            color: colors.insight, font: `bold 10px ${fonts.body}`
          });
        }
      }

      // z = (x - μ)/σ in parallel
      const zP = easedSub(progress, 0.58, 0.68);
      if (zP > 0) {
        fadeInText(ctx, tx('scene2', 'parallelZ'), W / 2, nadeY + boxH + 85, zP, {
          color: colors.insight, font: `bold 11px ${fonts.mono}`
        });
      }

      // Fast label
      fadeInText(ctx, tx('scene2', 'fast'), W / 2, nadeY + boxH + 105, easedSub(progress, 0.65, 0.75), {
        color: colors.insight, font: `bold 12px ${fonts.body}`
      });

      ctx.restore();
    }

    // Formula
    const fP = easedSub(progress, 0.8, 0.95);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'maf',
        'z_i = \\frac{x_i - \\mu_i(x_{1:i-1})}{\\sigma_i(x_{1:i-1})}',
        50, 92, fP, { color: colors.textPrimary, fontSize: '1.05em' });
    }
  }
});
