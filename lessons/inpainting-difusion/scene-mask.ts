// Scene 2: The Binary Mask — m in {0,1}^n

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

const GRID_ROWS = 8;
const GRID_COLS = 12;

// Mask rectangle
const MASK_ROW = 2;
const MASK_COL = 4;
const MASK_H = 4;
const MASK_W = 4;

export const scene2 = new Scene({
  id: () => tx('scene2', 'id'),
  duration: 20,
  narration: () => tx('scene2', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene2 as SceneText)?.subtitleCues ?? (text.es.scene2 as SceneText).subtitleCues,
  topic: () => tx('scene2', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene2', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Binary mask grid
    const cellSize = Math.min(Math.floor((W * 0.55) / GRID_COLS), Math.floor((H * 0.4) / GRID_ROWS));
    const gridW = GRID_COLS * (cellSize + 2);
    const gridH = GRID_ROWS * (cellSize + 2);
    const gridX = W / 2 - gridW / 2;
    const gridY = H * 0.2;

    const gridP = easedSub(progress, 0.08, 0.35);
    if (gridP > 0) {
      ctx.save();
      ctx.globalAlpha = gridP;

      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          const cx = gridX + col * (cellSize + 2);
          const cy = gridY + row * (cellSize + 2);
          const isMasked = row >= MASK_ROW && row < MASK_ROW + MASK_H &&
                           col >= MASK_COL && col < MASK_COL + MASK_W;

          if (isMasked) {
            // Unknown: dark
            ctx.fillStyle = colors.bodyBg;
            ctx.fillRect(cx, cy, cellSize, cellSize);
            ctx.strokeStyle = colors.error + '60';
            ctx.lineWidth = 1;
            ctx.strokeRect(cx, cy, cellSize, cellSize);

            // "0" label
            ctx.fillStyle = colors.error + '80';
            ctx.font = `${Math.max(cellSize * 0.5, 8)}px "Segoe UI", system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('0', cx + cellSize / 2, cy + cellSize / 2);
          } else {
            // Known: bright
            ctx.fillStyle = colors.insight + '30';
            ctx.fillRect(cx, cy, cellSize, cellSize);
            ctx.strokeStyle = colors.insight + '60';
            ctx.lineWidth = 1;
            ctx.strokeRect(cx, cy, cellSize, cellSize);

            // "1" label
            ctx.fillStyle = colors.insight + '80';
            ctx.font = `${Math.max(cellSize * 0.5, 8)}px "Segoe UI", system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('1', cx + cellSize / 2, cy + cellSize / 2);
          }
        }
      }

      ctx.restore();
    }

    // Legend below grid
    const legendP = easedSub(progress, 0.3, 0.45);
    if (legendP > 0) {
      const legendY = gridY + gridH + 18;

      // Known indicator
      ctx.save();
      ctx.globalAlpha = legendP;
      ctx.fillStyle = colors.insight + '30';
      ctx.fillRect(W * 0.2, legendY, 14, 14);
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1;
      ctx.strokeRect(W * 0.2, legendY, 14, 14);
      ctx.restore();

      fadeInText(ctx, tx('scene2', 'known'), W * 0.2 + 22, legendY + 7, legendP, {
        color: colors.insight, font: '11px "Segoe UI", system-ui, sans-serif', align: 'left',
      });

      // Unknown indicator
      ctx.save();
      ctx.globalAlpha = legendP;
      ctx.fillStyle = colors.bodyBg;
      ctx.fillRect(W * 0.6, legendY, 14, 14);
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 1;
      ctx.strokeRect(W * 0.6, legendY, 14, 14);
      ctx.restore();

      fadeInText(ctx, tx('scene2', 'unknown'), W * 0.6 + 22, legendY + 7, legendP, {
        color: colors.error, font: '11px "Segoe UI", system-ui, sans-serif', align: 'left',
      });
    }

    // Formula
    const formulaP = easedSub(progress, 0.55, 0.72);
    formulaAppear(state.formulaManager, 'mask-formula',
      'p(x_{m=0} \\mid x_{m=1})',
      50, 82, formulaP, { color: colors.accent, fontSize: '1.3em' });

    // m label
    const mLabelP = easedSub(progress, 0.45, 0.6);
    fadeInText(ctx, 'm = {0, 1}^n', W / 2, gridY + gridH + 48, mLabelP, {
      color: colors.textMuted, font: '12px "Segoe UI", system-ui, sans-serif',
    });
  },
});
