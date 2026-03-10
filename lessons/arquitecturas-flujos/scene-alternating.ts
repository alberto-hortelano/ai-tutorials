// Scene 6: Alternating masks — all dimensions get transformed

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene6 = new Scene({
  id: () => tx('scene6', 'id'),
  duration: 22,
  narration: () => tx('scene6', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene6 as SceneText)?.subtitleCues ?? (text.es.scene6 as SceneText).subtitleCues,
  topic: () => tx('scene6', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene6', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    const d = 6; // dimensions
    const blockW = Math.min(W * 0.08, 45);
    const blockH = 28;
    const layerY1 = H * 0.2;
    const layerY2 = H * 0.45;

    // Layer 1: transform right half (indices d/2..d-1)
    const l1P = easedSub(progress, 0.08, 0.4);
    if (l1P > 0) {
      ctx.save();
      ctx.globalAlpha = l1P;
      fadeInText(ctx, tx('scene6', 'layer1'), W / 2, layerY1 - 15, 1, {
        color: series[0], font: `bold 12px ${fonts.body}`
      });

      const startX = W / 2 - (d * (blockW + 4)) / 2;
      for (let i = 0; i < d; i++) {
        const x = startX + i * (blockW + 4);
        const isTransformed = i >= d / 2;
        ctx.fillStyle = isTransformed ? series[2] + '60' : series[0] + '30';
        ctx.strokeStyle = isTransformed ? series[2] : series[0];
        ctx.lineWidth = isTransformed ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(x, layerY1, blockW, blockH, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isTransformed ? series[2] : colors.textMuted;
        ctx.font = `10px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(isTransformed ? 'T' : '=', x + blockW / 2, layerY1 + blockH / 2 + 3);
      }
      ctx.restore();
    }

    // Layer 2: transform left half (indices 0..d/2-1)
    const l2P = easedSub(progress, 0.3, 0.6);
    if (l2P > 0) {
      ctx.save();
      ctx.globalAlpha = l2P;
      fadeInText(ctx, tx('scene6', 'layer2'), W / 2, layerY2 - 15, 1, {
        color: series[3], font: `bold 12px ${fonts.body}`
      });

      const startX = W / 2 - (d * (blockW + 4)) / 2;
      for (let i = 0; i < d; i++) {
        const x = startX + i * (blockW + 4);
        const isTransformed = i < d / 2;
        ctx.fillStyle = isTransformed ? series[3] + '60' : series[0] + '30';
        ctx.strokeStyle = isTransformed ? series[3] : series[0];
        ctx.lineWidth = isTransformed ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(x, layerY2, blockW, blockH, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isTransformed ? series[3] : colors.textMuted;
        ctx.font = `10px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(isTransformed ? 'T' : '=', x + blockW / 2, layerY2 + blockH / 2 + 3);
      }
      ctx.restore();
    }

    // Arrow between layers
    const arrP = easedSub(progress, 0.25, 0.4);
    if (arrP > 0) {
      ctx.save();
      ctx.globalAlpha = arrP;
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 1.5;
      const ax = W / 2;
      ctx.beginPath();
      ctx.moveTo(ax, layerY1 + blockH + 5);
      ctx.lineTo(ax, layerY2 - 5);
      ctx.stroke();
      ctx.fillStyle = colors.textMuted;
      ctx.beginPath();
      ctx.moveTo(ax, layerY2 - 5);
      ctx.lineTo(ax - 4, layerY2 - 12);
      ctx.lineTo(ax + 4, layerY2 - 12);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Checkerboard pattern for images
    const checkP = easedSub(progress, 0.55, 0.8);
    if (checkP > 0) {
      const checkY = H * 0.68;
      const gridSz = Math.min(W * 0.25, H * 0.22);
      const cells = 6;
      const cellSz = gridSz / cells;
      const checkX = W / 2 - gridSz / 2;

      ctx.save();
      ctx.globalAlpha = checkP;

      fadeInText(ctx, tx('scene6', 'checkerboard'), W / 2, checkY - 10, 1, {
        color: colors.textSecondary, font: `11px ${fonts.body}`
      });

      for (let row = 0; row < cells; row++) {
        for (let col = 0; col < cells; col++) {
          const isBlack = (row + col) % 2 === 0;
          ctx.fillStyle = isBlack ? series[2] + '50' : series[3] + '50';
          ctx.fillRect(checkX + col * cellSz, checkY + row * cellSz, cellSz, cellSz);
          ctx.strokeStyle = colors.border;
          ctx.lineWidth = 0.5;
          ctx.strokeRect(checkX + col * cellSz, checkY + row * cellSz, cellSz, cellSz);
        }
      }
      ctx.restore();
    }

    // All dims label
    const allP = easedSub(progress, 0.85, 1);
    fadeInText(ctx, tx('scene6', 'allDims'), W / 2, H - 18, allP, {
      color: colors.insight, font: `bold 12px ${fonts.body}`
    });
  }
});
