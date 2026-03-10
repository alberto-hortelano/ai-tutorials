// Scene 8: MAF Architecture — MADE block + Permute + full pipeline

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene8 = new Scene({
  id: () => tx('scene8', 'id'),
  duration: 24,
  narration: () => tx('scene8', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene8 as SceneText)?.subtitleCues ?? (text.es.scene8 as SceneText).subtitleCues,
  topic: () => tx('scene8', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene8', 'title'), W / 2, 28, easedSub(progress, 0, 0.06), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // ─── MADE block detail (upper section) ───
    const madeP = easedSub(progress, 0.05, 0.35);
    if (madeP > 0) {
      const madeX = W * 0.15;
      const madeY = 55;
      const blockW = W * 0.35;
      const blockH = 70;

      ctx.save();
      ctx.globalAlpha = madeP;

      // MADE outer box
      ctx.fillStyle = colors.accent + '10';
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(madeX, madeY, blockW, blockH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.accent;
      ctx.font = `bold 13px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene8', 'madeBlock'), madeX + blockW / 2, madeY + 16);

      // Input arrow
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(madeX - 25, madeY + blockH / 2);
      ctx.lineTo(madeX - 3, madeY + blockH / 2);
      ctx.stroke();
      ctx.fillStyle = colors.textMuted;
      ctx.beginPath();
      ctx.moveTo(madeX - 3, madeY + blockH / 2);
      ctx.lineTo(madeX - 8, madeY + blockH / 2 - 3);
      ctx.lineTo(madeX - 8, madeY + blockH / 2 + 3);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = colors.textSecondary;
      ctx.font = `10px ${fonts.body}`;
      ctx.textAlign = 'right';
      ctx.fillText(tx('scene8', 'inputLabel'), madeX - 28, madeY + blockH / 2 + 4);

      // Internal masked layers (small rectangles)
      const nLayers = 3;
      const layerW = blockW * 0.22;
      const layerH = 22;
      const layerGap = (blockW - nLayers * layerW) / (nLayers + 1);
      const layerY = madeY + 30;

      for (let i = 0; i < nLayers; i++) {
        const lp = easedSub(progress, 0.1 + i * 0.05, 0.18 + i * 0.05, easeOut);
        if (lp <= 0) continue;

        const lx = madeX + layerGap + i * (layerW + layerGap);
        ctx.globalAlpha = lp * madeP;

        ctx.fillStyle = colors.panelBg;
        ctx.strokeStyle = colors.accent + '80';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(lx, layerY, layerW, layerH, 3);
        ctx.fill();
        ctx.stroke();

        // Connecting arrows
        if (i < nLayers - 1) {
          const aStart = lx + layerW + 2;
          const aEnd = lx + layerW + layerGap - 2;
          ctx.strokeStyle = colors.textDimmed;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(aStart, layerY + layerH / 2);
          ctx.lineTo(aEnd, layerY + layerH / 2);
          ctx.stroke();
        }
      }

      // Output arrow and label
      ctx.globalAlpha = madeP;
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(madeX + blockW + 3, madeY + blockH / 2);
      ctx.lineTo(madeX + blockW + 25, madeY + blockH / 2);
      ctx.stroke();
      ctx.fillStyle = colors.textMuted;
      ctx.beginPath();
      ctx.moveTo(madeX + blockW + 25, madeY + blockH / 2);
      ctx.lineTo(madeX + blockW + 20, madeY + blockH / 2 - 3);
      ctx.lineTo(madeX + blockW + 20, madeY + blockH / 2 + 3);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = colors.insight;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'left';
      ctx.fillText(tx('scene8', 'outputLabel'), madeX + blockW + 28, madeY + blockH / 2 + 4);

      ctx.restore();
    }

    // ─── Mini mask visualization (upper right) ───
    const maskP = easedSub(progress, 0.25, 0.45);
    if (maskP > 0) {
      const maskX = W * 0.62;
      const maskY = 60;
      const cellSize = 22;
      const n = 3;

      ctx.save();
      ctx.globalAlpha = maskP;

      for (let row = 0; row < n; row++) {
        for (let col = 0; col < n; col++) {
          const cx = maskX + col * cellSize;
          const cy = maskY + row * cellSize;
          const allowed = col < row + 1; // lower triangular including diagonal

          ctx.fillStyle = allowed ? colors.insight + '40' : colors.textDimmed + '20';
          ctx.strokeStyle = colors.border;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.rect(cx, cy, cellSize, cellSize);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = allowed ? colors.insight : colors.textDimmed;
          ctx.font = `bold 10px ${fonts.mono}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(allowed ? '1' : '0', cx + cellSize / 2, cy + cellSize / 2);
          ctx.textBaseline = 'alphabetic';
        }
      }

      // Legend
      const legendY = maskY + n * cellSize + 10;
      ctx.fillStyle = colors.insight;
      ctx.font = `9px ${fonts.body}`;
      ctx.textAlign = 'left';
      ctx.fillText(`\u2588 ${tx('scene8', 'maskAllowed')}`, maskX, legendY);
      ctx.fillStyle = colors.textDimmed;
      ctx.fillText(`\u2588 ${tx('scene8', 'maskBlocked')}`, maskX + 70, legendY);

      ctx.restore();
    }

    // ─── PermuteLayer visualization ───
    const permP = easedSub(progress, 0.4, 0.55);
    if (permP > 0) {
      const permX = W * 0.15;
      const permY = H * 0.47;
      const boxW = 60;
      const boxH = 45;

      ctx.save();
      ctx.globalAlpha = permP;

      // Permute box
      ctx.fillStyle = colors.warning + '15';
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(permX, permY, boxW, boxH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.warning;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene8', 'permuteLabel'), permX + boxW / 2, permY + 14);

      // Crossing arrows (visual shuffle)
      const n = 3;
      const inX = permX + 10;
      const outX = permX + boxW - 10;
      const order = [2, 0, 1]; // permutation

      for (let i = 0; i < n; i++) {
        const inY_ = permY + 22 + i * 7;
        const outY_ = permY + 22 + order[i] * 7;

        ctx.strokeStyle = series[i % series.length];
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(inX, inY_);
        ctx.bezierCurveTo(inX + 15, inY_, outX - 15, outY_, outX, outY_);
        ctx.stroke();

        // Dots at endpoints
        ctx.fillStyle = series[i % series.length];
        ctx.beginPath();
        ctx.arc(inX, inY_, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(outX, outY_, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // ─── Full pipeline (bottom) ───
    const pipeP = easedSub(progress, 0.55, 0.9);
    if (pipeP > 0) {
      const pipeY = H * 0.75;
      const K = 5;
      const totalBlocks = K * 2; // MADE + Permute alternating (last has no permute, but simplified)
      const blockW = Math.min(W * 0.08, 42);
      const gap = 6;
      const totalW = totalBlocks * blockW + (totalBlocks - 1) * gap;
      const pipeStartX = W / 2 - totalW / 2;

      ctx.save();
      ctx.globalAlpha = pipeP;

      fadeInText(ctx, tx('scene8', 'pipelineTitle'), W / 2, pipeY - 22, pipeP, {
        color: colors.textSecondary, font: `bold 11px ${fonts.body}`
      });

      // z₀ label
      ctx.fillStyle = series[0];
      ctx.font = `bold 10px ${fonts.body}`;
      ctx.textAlign = 'right';
      ctx.fillText(tx('scene8', 'gaussianLabel'), pipeStartX - 8, pipeY + 4);

      for (let i = 0; i < totalBlocks; i++) {
        const bp = easedSub(progress, 0.55 + i * 0.025, 0.6 + i * 0.025, easeOut);
        if (bp <= 0) continue;

        const bx = pipeStartX + i * (blockW + gap);
        const isPermute = i % 2 === 1;
        const color = isPermute ? colors.warning : colors.accent;

        ctx.globalAlpha = bp * pipeP;

        ctx.fillStyle = color + '20';
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(bx, pipeY - 12, blockW, 24, 3);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.font = `bold ${blockW < 35 ? 7 : 8}px ${fonts.body}`;
        ctx.textAlign = 'center';
        if (isPermute) {
          ctx.fillText('P', bx + blockW / 2, pipeY + 3);
        } else {
          ctx.fillText(`M${Math.floor(i / 2) + 1}`, bx + blockW / 2, pipeY + 3);
        }

        // Arrow
        if (i < totalBlocks - 1) {
          ctx.strokeStyle = colors.textDimmed;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(bx + blockW + 1, pipeY);
          ctx.lineTo(bx + blockW + gap - 1, pipeY);
          ctx.stroke();
        }
      }

      // x label
      ctx.globalAlpha = pipeP;
      ctx.fillStyle = series[1];
      ctx.font = `bold 10px ${fonts.body}`;
      ctx.textAlign = 'left';
      ctx.fillText(tx('scene8', 'dataLabel'), pipeStartX + totalW + 8, pipeY + 4);

      ctx.restore();
    }
  }
});
