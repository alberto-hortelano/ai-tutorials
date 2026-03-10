// Scene 4: Amortized Inference — naive vs amortized side-by-side

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { drawBlock, drawSimpleArrow } from '../_shared/network-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene4 = new Scene({
  id: () => tx('scene4', 'id'),
  duration: 22,
  narration: () => tx('scene4', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene4 as SceneText)?.subtitleCues ?? (text.es.scene4 as SceneText).subtitleCues,
  topic: () => tx('scene4', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene4', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    const halfW = W / 2;
    const divX = halfW;

    // ===== LEFT SIDE: NAIVE =====
    const naiveP = easedSub(progress, 0.05, 0.45);
    if (naiveP > 0) {
      ctx.save();
      ctx.globalAlpha = naiveP;

      // Section title
      fadeInText(ctx, tx('scene4', 'naiveTitle'), halfW * 0.5, 55, 1, {
        color: colors.error, font: `bold 15px ${fonts.body}`
      });

      // Multiple data points, each with its own lambda
      const N = 4;
      const startY = 78;
      const rowH = (H * 0.5) / N;

      for (let i = 0; i < N; i++) {
        const rowP = easedSub(progress, 0.08 + i * 0.06, 0.22 + i * 0.06);
        if (rowP <= 0) continue;

        ctx.save();
        ctx.globalAlpha = rowP * naiveP;

        const ry = startY + i * rowH;

        // x_i circle
        const xR = 12;
        ctx.beginPath();
        ctx.arc(halfW * 0.12, ry + rowH / 2, xR, 0, Math.PI * 2);
        ctx.fillStyle = series[2] + '30';
        ctx.fill();
        ctx.strokeStyle = series[2];
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = series[2];
        ctx.font = `bold 10px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`x${i + 1}`, halfW * 0.12, ry + rowH / 2);

        // Arrow to lambda_i
        drawSimpleArrow(ctx, halfW * 0.12 + xR + 3, ry + rowH / 2,
          halfW * 0.38, ry + rowH / 2, 1, colors.textDimmed, 5);

        // lambda_i box (separate for each)
        const lamW = halfW * 0.28;
        const lamH = rowH * 0.6;
        ctx.fillStyle = colors.error + '15';
        ctx.strokeStyle = colors.error;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(halfW * 0.38, ry + (rowH - lamH) / 2, lamW, lamH, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = colors.error;
        ctx.font = `bold 9px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`lambda_${i + 1}`, halfW * 0.38 + lamW / 2, ry + rowH / 2);

        // Circular arrow representing inner loop optimization
        const loopX = halfW * 0.38 + lamW + 10;
        const loopY = ry + rowH / 2;
        const loopR = 7;
        ctx.strokeStyle = colors.error + '80';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(loopX, loopY, loopR, -0.5, Math.PI * 1.5);
        ctx.stroke();
        // Small arrowhead on the loop
        ctx.fillStyle = colors.error + '80';
        ctx.beginPath();
        ctx.moveTo(loopX + loopR * Math.cos(-0.5), loopY + loopR * Math.sin(-0.5));
        ctx.lineTo(loopX + (loopR + 4) * Math.cos(-0.8), loopY + (loopR + 4) * Math.sin(-0.8));
        ctx.lineTo(loopX + (loopR - 3) * Math.cos(-0.8), loopY + (loopR - 3) * Math.sin(-0.8));
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // Inner loop label
      const ilP = easedSub(progress, 0.25, 0.38);
      if (ilP > 0) {
        fadeInText(ctx, tx('scene4', 'innerLoop'), halfW * 0.5, H * 0.72, ilP, {
          color: colors.error, font: `bold 11px ${fonts.body}`
        });
      }

      // Slow badge
      const slowP = easedSub(progress, 0.35, 0.45);
      if (slowP > 0) {
        const sx = halfW * 0.5, sy = H * 0.82;
        ctx.save();
        ctx.globalAlpha = slowP * naiveP;
        ctx.fillStyle = colors.error + '20';
        ctx.strokeStyle = colors.error;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(sx - 40, sy - 11, 80, 22, 11);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = colors.error;
        ctx.font = `bold 12px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(tx('scene4', 'slowLabel'), sx, sy + 4);
        ctx.restore();
      }

      ctx.restore();
    }

    // Divider
    const divP = easedSub(progress, 0.4, 0.5);
    if (divP > 0) {
      ctx.save();
      ctx.globalAlpha = divP;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(divX, 50);
      ctx.lineTo(divX, H - 15);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // ===== RIGHT SIDE: AMORTIZED =====
    const amortP = easedSub(progress, 0.45, 0.85);
    if (amortP > 0) {
      ctx.save();
      ctx.globalAlpha = amortP;

      // Section title
      fadeInText(ctx, tx('scene4', 'amortizedTitle'), halfW + halfW * 0.5, 55, 1, {
        color: colors.insight, font: `bold 15px ${fonts.body}`
      });

      const N = 4;
      const startY = 78;
      const rowH = (H * 0.5) / N;

      // Single shared encoder (big block on right)
      const encW = halfW * 0.32;
      const encH = H * 0.45;
      const encX = halfW + halfW * 0.45;
      const encY = startY + 5;
      drawBlock(ctx, encX, encY, encW, encH, tx('scene4', 'amortizedDesc'), 1, colors.insight);

      for (let i = 0; i < N; i++) {
        const rowP = easedSub(progress, 0.5 + i * 0.05, 0.65 + i * 0.05);
        if (rowP <= 0) continue;

        ctx.save();
        ctx.globalAlpha = rowP * amortP;

        const ry = startY + i * rowH;

        // x_i circle
        const xR = 12;
        ctx.beginPath();
        ctx.arc(halfW + halfW * 0.12, ry + rowH / 2, xR, 0, Math.PI * 2);
        ctx.fillStyle = series[2] + '30';
        ctx.fill();
        ctx.strokeStyle = series[2];
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = series[2];
        ctx.font = `bold 10px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`x${i + 1}`, halfW + halfW * 0.12, ry + rowH / 2);

        // Arrow to shared encoder
        drawSimpleArrow(ctx, halfW + halfW * 0.12 + xR + 3, ry + rowH / 2,
          encX, encY + (i + 0.5) * (encH / N), 1, colors.insight + '80', 5);

        ctx.restore();
      }

      // One pass label
      const opP = easedSub(progress, 0.7, 0.82);
      if (opP > 0) {
        fadeInText(ctx, tx('scene4', 'onePass'), halfW + halfW * 0.5, H * 0.72, opP, {
          color: colors.insight, font: `bold 11px ${fonts.body}`
        });
      }

      // Fast badge
      const fastP = easedSub(progress, 0.78, 0.88);
      if (fastP > 0) {
        const fx = halfW + halfW * 0.5, fy = H * 0.82;
        ctx.save();
        ctx.globalAlpha = fastP * amortP;
        ctx.fillStyle = colors.insight + '20';
        ctx.strokeStyle = colors.insight;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(fx - 40, fy - 11, 80, 22, 11);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = colors.insight;
        ctx.font = `bold 12px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(tx('scene4', 'fastLabel'), fx, fy + 4);
        ctx.restore();
      }

      ctx.restore();
    }

    // Bottom comparison summary
    const sumP = easedSub(progress, 0.88, 0.98);
    if (sumP > 0) {
      const sy = H - 14;
      ctx.save();
      ctx.globalAlpha = sumP;
      ctx.fillStyle = colors.textMuted;
      ctx.font = `11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('O(N * inner_steps)  vs  O(N * 1)', W / 2, sy);
      ctx.restore();
    }
  }
});
