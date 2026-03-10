// Scene 3: Label Embedding — one-hot => embedding matrix => dense vector

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { drawBlock } from '../_shared/network-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene3 = new Scene({
  id: () => tx('scene3', 'id'),
  duration: 20,
  narration: () => tx('scene3', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene3 as SceneText)?.subtitleCues ?? (text.es.scene3 as SceneText).subtitleCues,
  topic: () => tx('scene3', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene3', 'title'), W / 2, 25, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    const midY = H * 0.45;

    // One-hot vector
    const ohP = easedSub(progress, 0.08, 0.3);
    if (ohP > 0) {
      const ohX = 20, ohY = midY - 50;
      const cellW = 16, cellH = 16;
      const nClasses = 10;

      ctx.save();
      ctx.globalAlpha = ohP;

      fadeInText(ctx, tx('scene3', 'oneHotLabel'), ohX + (cellW * nClasses) / 2, ohY - 12, 1, {
        color: colors.textMuted, font: '10px "Segoe UI", system-ui, sans-serif',
      });

      for (let i = 0; i < nClasses; i++) {
        const cx = ohX + i * (cellW + 2);
        const isActive = i === 7; // class 7

        ctx.fillStyle = isActive ? colors.warning : colors.panelBg;
        ctx.fillRect(cx, ohY, cellW, cellH);
        ctx.strokeStyle = isActive ? colors.warning : colors.border;
        ctx.lineWidth = 1;
        ctx.strokeRect(cx, ohY, cellW, cellH);

        ctx.fillStyle = isActive ? colors.bodyBg : colors.textDimmed;
        ctx.font = '8px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(isActive ? '1' : '0', cx + cellW / 2, ohY + cellH / 2 + 3);
      }

      // y = 7 label
      fadeInText(ctx, 'y = 7', ohX + (cellW * nClasses) / 2, ohY + cellH + 14, 1, {
        color: colors.warning, font: 'bold 10px "Segoe UI", system-ui, sans-serif',
      });

      ctx.restore();
    }

    // Arrow: one-hot -> embedding matrix
    const arrP1 = easedSub(progress, 0.25, 0.4);
    if (arrP1 > 0) {
      const startX = 205;
      animateArrow(ctx, startX, midY - 42, startX + 35, midY - 42, arrP1, {
        color: colors.textDimmed, lineWidth: 1.5,
      });
    }

    // Embedding matrix
    const embP = easedSub(progress, 0.3, 0.55);
    if (embP > 0) {
      const emX = 250, emY = midY - 70;
      const emW = 70, emH = 55;

      drawBlock(ctx, emX, emY, emW, emH, tx('scene3', 'embMatLabel'), embP, colors.accent);

      // Grid lines inside to suggest matrix
      ctx.save();
      ctx.globalAlpha = embP * 0.3;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 0.5;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(emX + 8, emY + i * (emH / 4));
        ctx.lineTo(emX + emW - 8, emY + i * (emH / 4));
        ctx.stroke();
      }
      for (let j = 1; j < 5; j++) {
        ctx.beginPath();
        ctx.moveTo(emX + j * (emW / 5), emY + 8);
        ctx.lineTo(emX + j * (emW / 5), emY + emH - 8);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Arrow: embedding -> dense vector
    const arrP2 = easedSub(progress, 0.45, 0.6);
    if (arrP2 > 0) {
      animateArrow(ctx, 325, midY - 42, 365, midY - 42, arrP2, {
        color: colors.textDimmed, lineWidth: 1.5,
      });
    }

    // Dense vector e(y)
    const denseP = easedSub(progress, 0.5, 0.7);
    if (denseP > 0) {
      const dvX = 375, dvY = midY - 60;
      const dvW = 20, dvH = 40;

      ctx.save();
      ctx.globalAlpha = denseP;

      // Small vertical rectangle representing dense vector
      const nDims = 6;
      const dimH = dvH / nDims;
      for (let i = 0; i < nDims; i++) {
        const intensity = Math.abs(Math.sin(i * 1.5 + 2));
        ctx.fillStyle = colors.insight + Math.floor(intensity * 200 + 55).toString(16).padStart(2, '0');
        ctx.fillRect(dvX, dvY + i * dimH, dvW, dimH - 1);
      }
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(dvX, dvY, dvW, dvH);

      fadeInText(ctx, tx('scene3', 'denseLabel'), dvX + dvW / 2, dvY + dvH + 14, 1, {
        color: colors.insight, font: 'bold 11px "Segoe UI", system-ui, sans-serif',
      });

      ctx.restore();
    }

    // Concatenation with z
    const concatP = easedSub(progress, 0.65, 0.85);
    if (concatP > 0) {
      const concY = midY + 40;

      ctx.save();
      ctx.globalAlpha = concatP;

      // z vector
      const zX = 120, zW = 35, zH = 30;
      ctx.strokeStyle = colors.textDimmed;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(zX, concY, zW, zH);
      ctx.fillStyle = colors.textMuted;
      ctx.font = '11px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('z', zX + zW / 2, concY + zH / 2 + 4);

      // + sign
      ctx.fillStyle = colors.textSecondary;
      ctx.font = 'bold 16px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('+', zX + zW + 15, concY + zH / 2 + 5);

      // e(y) mini vector
      const eyX = zX + zW + 30, eyW = 20, eyH = 30;
      ctx.fillStyle = colors.insight + '40';
      ctx.fillRect(eyX, concY, eyW, eyH);
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1;
      ctx.strokeRect(eyX, concY, eyW, eyH);
      ctx.fillStyle = colors.insight;
      ctx.font = '9px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('e(y)', eyX + eyW / 2, concY + eyH / 2 + 3);

      // = sign
      ctx.fillStyle = colors.textSecondary;
      ctx.font = 'bold 16px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('=', eyX + eyW + 15, concY + eyH / 2 + 5);

      // Concatenated result
      fadeInText(ctx, tx('scene3', 'concatLabel'), eyX + eyW + 65, concY + eyH / 2, 1, {
        color: colors.accent, font: 'bold 11px "Segoe UI", system-ui, sans-serif', align: 'left',
      });

      ctx.restore();
    }

    // Different class embeddings visualization
    const diffP = easedSub(progress, 0.8, 0.95);
    if (diffP > 0) {
      const baseX = W * 0.55, baseY = midY - 30;

      ctx.save();
      ctx.globalAlpha = diffP;

      const classColors = [series[0], series[1], series[2], series[3]];
      const classLabels = ['0', '3', '5', '7'];
      for (let c = 0; c < 4; c++) {
        const cx = baseX + c * 45;
        const nDims = 4;
        const dimH = 8;
        for (let i = 0; i < nDims; i++) {
          const intensity = Math.abs(Math.sin(i * 1.7 + c * 2.3));
          ctx.fillStyle = classColors[c] + Math.floor(intensity * 200 + 55).toString(16).padStart(2, '0');
          ctx.fillRect(cx, baseY + i * (dimH + 1), 14, dimH);
        }
        ctx.fillStyle = classColors[c];
        ctx.font = '9px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`y=${classLabels[c]}`, cx + 7, baseY + 4 * (dimH + 1) + 12);
      }

      ctx.restore();
    }
  },
});
