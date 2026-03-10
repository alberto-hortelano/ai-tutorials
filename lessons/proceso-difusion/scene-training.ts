// Scene 5: Training — Predict the Noise

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { drawBlock, drawSimpleArrow } from '../_shared/network-utils';
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
    fadeInText(ctx, tx('scene5', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Training pipeline diagram: x_0 + epsilon -> x_t -> epsilon_theta -> epsilon_hat
    const pipeY = H * 0.35;
    const pipeX = W * 0.04;
    const pipeW = W * 0.92;
    const blockH = 40;
    const blockW = 70;
    const spacing = pipeW / 5;

    // x_0 block
    const x0P = easedSub(progress, 0.08, 0.2);
    const x0X = pipeX;
    drawBlock(ctx, x0X, pipeY - blockH / 2, blockW, blockH, tx('scene5', 'x0Label'), x0P, colors.insight);

    // epsilon block (noise input, above)
    const epsP = easedSub(progress, 0.12, 0.24);
    const epsX = pipeX + spacing * 0.5;
    const epsY = pipeY - blockH * 1.6;
    drawBlock(ctx, epsX - blockW / 2, epsY - blockH / 2, blockW, blockH, tx('scene5', 'epsLabel'), epsP, colors.error);

    // Arrow from x_0 to x_t
    const arr1P = easedSub(progress, 0.2, 0.32);
    const xtX = pipeX + spacing * 1.2;
    drawSimpleArrow(ctx, x0X + blockW + 4, pipeY, xtX - 4, pipeY, arr1P, colors.textMuted);

    // Arrow from epsilon down to x_t
    const arr1bP = easedSub(progress, 0.22, 0.34);
    drawSimpleArrow(ctx, epsX, epsY + blockH / 2 + 4, xtX + blockW / 2, pipeY - blockH / 2 - 4, arr1bP, colors.error + '90');

    // Plus sign between arrows
    const plusP = easedSub(progress, 0.18, 0.28);
    if (plusP > 0) {
      ctx.save();
      ctx.globalAlpha = plusP;
      ctx.fillStyle = colors.textMuted;
      ctx.font = 'bold 16px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+', (x0X + blockW + xtX) / 2, pipeY - blockH * 0.7);
      ctx.restore();
    }

    // x_t block
    const xtP = easedSub(progress, 0.25, 0.37);
    drawBlock(ctx, xtX, pipeY - blockH / 2, blockW, blockH, tx('scene5', 'xtLabel'), xtP, colors.warning);

    // Arrow from x_t to network
    const arr2P = easedSub(progress, 0.35, 0.47);
    const netX = pipeX + spacing * 2.4;
    drawSimpleArrow(ctx, xtX + blockW + 4, pipeY, netX - 4, pipeY, arr2P, colors.textMuted);

    // Network block (epsilon_theta)
    const netP = easedSub(progress, 0.4, 0.52);
    const netW = blockW * 1.3;
    drawBlock(ctx, netX, pipeY - blockH / 2, netW, blockH, tx('scene5', 'netLabel'), netP, colors.accent);

    // Arrow from network to prediction
    const arr3P = easedSub(progress, 0.5, 0.62);
    const predX = pipeX + spacing * 3.8;
    drawSimpleArrow(ctx, netX + netW + 4, pipeY, predX - 4, pipeY, arr3P, colors.textMuted);

    // Predicted epsilon block
    const predP = easedSub(progress, 0.55, 0.67);
    drawBlock(ctx, predX, pipeY - blockH / 2, blockW * 1.1, blockH, tx('scene5', 'predLabel'), predP, colors.accent);

    // Loss calculation area
    const lossY = H * 0.62;

    // Comparison arrows: epsilon and epsilon_hat pointing to loss
    const lossP = easedSub(progress, 0.65, 0.8);
    if (lossP > 0) {
      ctx.save();
      ctx.globalAlpha = lossP;

      // Dashed line from original epsilon to loss area
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(epsX, epsY + blockH / 2 + 4);
      ctx.lineTo(W * 0.35, lossY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Dashed line from predicted epsilon to loss area
      ctx.strokeStyle = colors.accent;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(predX + blockW * 0.55, pipeY + blockH / 2 + 4);
      ctx.lineTo(W * 0.65, lossY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    }

    // Loss box
    const lossBoxP = easedSub(progress, 0.72, 0.85);
    const lossBoxW = W * 0.45;
    const lossBoxX = W / 2 - lossBoxW / 2;
    drawBlock(ctx, lossBoxX, lossY - 4, lossBoxW, 36, tx('scene5', 'lossLabel'), lossBoxP, colors.error);

    // Formula
    const formulaP = easedSub(progress, 0.8, 0.92);
    formulaAppear(state.formulaManager, 'train-loss',
      '\\mathcal{L} = \\mathbb{E}_{t,\\,x_0,\\,\\varepsilon}\\!\\left[\\|\\varepsilon - \\varepsilon_\\theta(x_t, t)\\|^2\\right]',
      50, 85, formulaP, { color: colors.textPrimary, fontSize: '1.1em' });
  },
});
