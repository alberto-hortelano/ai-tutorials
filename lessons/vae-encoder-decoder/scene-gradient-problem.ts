// Scene 2: The Gradient Problem — blocked gradient flow through stochastic sampling

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { formulaAppear } from '../../engine/animation/formula';
import { drawBlock, drawSimpleArrow } from '../_shared/network-utils';
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

    // Title
    fadeInText(ctx, tx('scene2', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Forward pass pipeline: encoder -> sample z -> decoder
    const pipeY = H * 0.3;
    const boxW = W * 0.16;
    const boxH = H * 0.14;
    const encX = W * 0.08;
    const sampleX = W * 0.38;
    const decX = W * 0.68;

    // Encoder box
    const encP = easedSub(progress, 0.05, 0.15);
    drawBlock(ctx, encX, pipeY, boxW, boxH, 'Encoder (phi)', encP, series[0]);

    // Arrow encoder -> sample
    const arr1P = easedSub(progress, 0.12, 0.22);
    if (arr1P > 0) {
      drawSimpleArrow(ctx, encX + boxW, pipeY + boxH / 2, sampleX, pipeY + boxH / 2, arr1P, colors.textMuted);
      // mu, sigma labels along arrow
      ctx.save();
      ctx.globalAlpha = arr1P;
      ctx.fillStyle = colors.textSecondary;
      ctx.font = `10px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('mu, sigma', (encX + boxW + sampleX) / 2, pipeY + boxH / 2 - 10);
      ctx.restore();
    }

    // Sample z box (highlighted as the problem)
    const samP = easedSub(progress, 0.18, 0.3);
    drawBlock(ctx, sampleX, pipeY, boxW, boxH, 'z ~ q(z|x)', samP, colors.warning);

    // Arrow sample -> decoder
    const arr2P = easedSub(progress, 0.25, 0.35);
    if (arr2P > 0) {
      drawSimpleArrow(ctx, sampleX + boxW, pipeY + boxH / 2, decX, pipeY + boxH / 2, arr2P, colors.textMuted);
    }

    // Decoder box
    const decP = easedSub(progress, 0.3, 0.4);
    drawBlock(ctx, decX, pipeY, boxW, boxH, 'Decoder', decP, colors.insight);

    // Forward label
    const fwdP = easedSub(progress, 0.08, 0.18);
    if (fwdP > 0) {
      fadeInText(ctx, 'Forward', W / 2, pipeY - 14, fwdP, {
        color: colors.textDimmed, font: `11px ${fonts.body}`
      });
    }

    // --- Backward gradient flow (bottom half) ---
    const gradY = H * 0.58;

    // Gradient arrows flowing right-to-left (backward)
    const gradDecP = easedSub(progress, 0.4, 0.52);
    if (gradDecP > 0) {
      // Label "Backward gradients"
      fadeInText(ctx, 'Backprop', W / 2, gradY - 14, gradDecP, {
        color: colors.textDimmed, font: `11px ${fonts.body}`
      });

      // Gradient flows from decoder backward
      const gradColor = colors.insight;
      animateArrow(ctx, decX + boxW, gradY + boxH / 2, decX, gradY + boxH / 2, gradDecP, { color: gradColor, lineWidth: 3 });

      // Decoder gradient box
      drawBlock(ctx, decX, gradY, boxW, boxH, 'nabla_theta', gradDecP, colors.insight);
    }

    // Gradient arrow from decoder to sample step
    const gradSamP = easedSub(progress, 0.5, 0.62);
    if (gradSamP > 0) {
      animateArrow(ctx, decX, gradY + boxH / 2, sampleX + boxW, gradY + boxH / 2, gradSamP, {
        color: colors.insight, lineWidth: 3
      });
    }

    // THE WALL: gradient blocked at sampling step
    const wallP = easedSub(progress, 0.55, 0.72);
    if (wallP > 0) {
      ctx.save();
      ctx.globalAlpha = wallP;

      // Brick-wall pattern
      const wallX = sampleX + boxW / 2 - 12;
      const wallW = 24;
      const wallY2 = gradY - 5;
      const wallH2 = boxH + 10;

      ctx.fillStyle = colors.error + '40';
      ctx.fillRect(wallX, wallY2, wallW, wallH2);
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 2;
      ctx.strokeRect(wallX, wallY2, wallW, wallH2);

      // Brick lines
      ctx.strokeStyle = colors.error + '80';
      ctx.lineWidth = 1;
      const brickH = wallH2 / 4;
      for (let row = 1; row < 4; row++) {
        const by = wallY2 + row * brickH;
        ctx.beginPath();
        ctx.moveTo(wallX, by);
        ctx.lineTo(wallX + wallW, by);
        ctx.stroke();
        // Vertical offset
        const vx = row % 2 === 0 ? wallX + wallW / 2 : wallX + wallW / 3;
        ctx.beginPath();
        ctx.moveTo(vx, by - brickH);
        ctx.lineTo(vx, by);
        ctx.stroke();
      }

      // Red X over the sample step
      const xSize = 14;
      const xCx = sampleX + boxW / 2;
      const xCy = gradY + boxH / 2;
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(xCx - xSize, xCy - xSize);
      ctx.lineTo(xCx + xSize, xCy + xSize);
      ctx.moveTo(xCx + xSize, xCy - xSize);
      ctx.lineTo(xCx - xSize, xCy + xSize);
      ctx.stroke();

      // Label under wall
      ctx.fillStyle = colors.error;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene2', 'wallLabel'), sampleX + boxW / 2, gradY + boxH + 18);

      ctx.restore();
    }

    // Blocked label on encoder side
    const blockedP = easedSub(progress, 0.68, 0.78);
    if (blockedP > 0) {
      ctx.save();
      ctx.globalAlpha = blockedP;

      // Dashed gradient arrow that fades out
      ctx.strokeStyle = colors.error + '60';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(sampleX, gradY + boxH / 2);
      ctx.lineTo(encX + boxW, gradY + boxH / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Encoder box grayed out
      drawBlock(ctx, encX, gradY, boxW, boxH, 'nabla_phi = ?', 1, colors.error);

      ctx.fillStyle = colors.error;
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene2', 'blocked'), encX + boxW / 2, gradY + boxH + 18);

      ctx.restore();
    }

    // REINFORCE callout
    const reinP = easedSub(progress, 0.82, 0.95);
    if (reinP > 0) {
      const rx = W / 2, ry = H - 28;
      ctx.save();
      ctx.globalAlpha = reinP;
      ctx.fillStyle = colors.error + '15';
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(rx - 130, ry - 14, 260, 28, 14);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colors.error;
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene2', 'reinforceLabel'), rx, ry + 4);
      ctx.restore();
    }

    // Formula
    const formP = easedSub(progress, 0.12, 0.28);
    if (formP > 0) {
      formulaAppear(state.formulaManager, 'grad-prob',
        '\\nabla_\\phi \\, \\mathbb{E}_{z \\sim q_\\phi}[f(z)] = \\,?',
        50, 15, formP, { color: colors.textPrimary, fontSize: '0.85em' });
    }
  }
});
