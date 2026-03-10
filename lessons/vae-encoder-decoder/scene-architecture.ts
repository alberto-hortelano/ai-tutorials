// Scene 1: VAE Architecture — three blocks with arrows and loss formula

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { drawBlock, drawSimpleArrow } from '../_shared/network-utils';
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

    // Layout for three blocks
    const blockW = W * 0.18;
    const blockH = H * 0.22;
    const midY = H * 0.38;
    const encX = W * 0.12;
    const samX = W * 0.41;
    const decX = W * 0.70;

    // Input x (circle on the left)
    const inputP = easedSub(progress, 0.05, 0.15);
    if (inputP > 0) {
      ctx.save();
      ctx.globalAlpha = inputP;
      ctx.beginPath();
      ctx.arc(encX - 35, midY + blockH / 2, 16, 0, Math.PI * 2);
      ctx.fillStyle = series[2] + '30';
      ctx.fill();
      ctx.strokeStyle = series[2];
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = series[2];
      ctx.font = `bold 14px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene1', 'inputLabel'), encX - 35, midY + blockH / 2);
      ctx.restore();
    }

    // Encoder block
    const encP = easedSub(progress, 0.08, 0.22);
    drawBlock(ctx, encX, midY, blockW, blockH, tx('scene1', 'encoderLabel'), encP, series[0]);

    // Arrow: x -> encoder
    if (encP > 0) {
      drawSimpleArrow(ctx, encX - 18, midY + blockH / 2, encX, midY + blockH / 2, encP, colors.textMuted);
    }

    // mu and sigma outputs from encoder
    const muSigP = easedSub(progress, 0.2, 0.35);
    if (muSigP > 0) {
      const outX = encX + blockW + 8;
      const muY = midY + blockH * 0.3;
      const sigY = midY + blockH * 0.7;

      ctx.save();
      ctx.globalAlpha = muSigP;

      // mu label
      ctx.fillStyle = colors.accent;
      ctx.font = `bold 13px ${fonts.body}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene1', 'muLabel'), outX + 4, muY);

      // sigma label
      ctx.fillStyle = colors.accent;
      ctx.fillText(tx('scene1', 'sigmaLabel'), outX + 4, sigY);

      // Small arrows from encoder edge to labels
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(encX + blockW, muY);
      ctx.lineTo(outX + 2, muY);
      ctx.moveTo(encX + blockW, sigY);
      ctx.lineTo(outX + 2, sigY);
      ctx.stroke();

      ctx.restore();
    }

    // Sampling block
    const samP = easedSub(progress, 0.28, 0.42);
    drawBlock(ctx, samX, midY, blockW, blockH, tx('scene1', 'samplingLabel'), samP, colors.warning);

    // Arrows: mu/sigma -> sampling
    if (samP > 0) {
      const muOutX = encX + blockW + 30;
      const muY = midY + blockH * 0.3;
      const sigY = midY + blockH * 0.7;
      drawSimpleArrow(ctx, muOutX, muY, samX, midY + blockH * 0.4, samP, colors.textMuted);
      drawSimpleArrow(ctx, muOutX, sigY, samX, midY + blockH * 0.6, samP, colors.textMuted);
    }

    // z output from sampling
    const zP = easedSub(progress, 0.4, 0.52);
    if (zP > 0) {
      const zX = samX + blockW + 12;
      const zY = midY + blockH / 2;
      ctx.save();
      ctx.globalAlpha = zP;
      ctx.beginPath();
      ctx.arc(zX, zY, 14, 0, Math.PI * 2);
      ctx.fillStyle = colors.warning + '30';
      ctx.fill();
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = colors.warning;
      ctx.font = `bold 13px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene1', 'zLabel'), zX, zY);
      ctx.restore();

      // Arrow from sampling to z
      drawSimpleArrow(ctx, samX + blockW, zY, zX - 15, zY, zP, colors.textMuted);
    }

    // Decoder block
    const decP = easedSub(progress, 0.48, 0.62);
    drawBlock(ctx, decX, midY, blockW, blockH, tx('scene1', 'decoderLabel'), decP, colors.insight);

    // Arrow: z -> decoder
    if (decP > 0) {
      const zX = samX + blockW + 12;
      drawSimpleArrow(ctx, zX + 15, midY + blockH / 2, decX, midY + blockH / 2, decP, colors.textMuted);
    }

    // Output x_hat
    const outP = easedSub(progress, 0.6, 0.72);
    if (outP > 0) {
      const oxX = decX + blockW + 35;
      const oxY = midY + blockH / 2;
      ctx.save();
      ctx.globalAlpha = outP;
      ctx.beginPath();
      ctx.arc(oxX, oxY, 16, 0, Math.PI * 2);
      ctx.fillStyle = colors.insight + '30';
      ctx.fill();
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = colors.insight;
      ctx.font = `bold 13px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene1', 'outputLabel'), oxX, oxY);
      ctx.restore();

      drawSimpleArrow(ctx, decX + blockW, oxY, oxX - 17, oxY, outP, colors.textMuted);
    }

    // Epsilon input to sampling (from below)
    const epsP = easedSub(progress, 0.35, 0.48);
    if (epsP > 0) {
      const epsX = samX + blockW / 2;
      const epsY = midY + blockH + 40;
      ctx.save();
      ctx.globalAlpha = epsP;

      ctx.fillStyle = colors.textMuted;
      ctx.font = `11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u03B5 ~ N(0,1)', epsX, epsY);

      ctx.restore();
      drawSimpleArrow(ctx, epsX, epsY - 12, epsX, midY + blockH + 2, epsP, colors.textDimmed, 6);
    }

    // Loss formula at bottom
    const lossP = easedSub(progress, 0.75, 0.92);
    if (lossP > 0) {
      formulaAppear(state.formulaManager, 'vae-loss',
        '\\mathcal{L} = -\\text{ELBO} = \\underbrace{-\\mathbb{E}_{q}[\\log p(x|z)]}_{\\text{recon}} + \\underbrace{D_{KL}(q(z|x)\\|p(z))}_{\\text{KL}}',
        50, 88, lossP, { color: colors.textPrimary, fontSize: '0.85em' });
    }
  }
});
