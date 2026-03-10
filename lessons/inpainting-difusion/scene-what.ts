// Scene 1: What is Inpainting? — pixel grid with hole

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { generatePixelGrid, applyMask, drawPixelGrid, drawMaskOverlay } from '../_shared/grid-image-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

const GRID_ROWS = 10;
const GRID_COLS = 14;
const palette = [
  '#4f86c6', '#6eb5ff', '#2c5f8a', '#a8d4ff', '#1a3a5c', // blues
  '#3d7a5f', '#5cb88a', '#2e6b50', '#8fd4b0', // greens
  '#c49245', '#e6b96e', '#9a7030', // golds
];
const grid = generatePixelGrid(GRID_ROWS, GRID_COLS, palette, 42);

// Mask: rectangular hole in the center
const MASK_ROW = 3;
const MASK_COL = 4;
const MASK_H = 4;
const MASK_W = 6;

const maskedGrid = applyMask(grid, MASK_ROW, MASK_COL, MASK_H, MASK_W);

export const scene1 = new Scene({
  id: () => tx('scene1', 'id'),
  duration: 20,
  narration: () => tx('scene1', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene1 as SceneText)?.subtitleCues ?? (text.es.scene1 as SceneText).subtitleCues,
  topic: () => tx('scene1', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene1', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Pixel grid (complete image first)
    const cellSize = Math.min(Math.floor((W * 0.7) / GRID_COLS), Math.floor((H * 0.45) / GRID_ROWS));
    const gridW = GRID_COLS * (cellSize + 1);
    const gridH = GRID_ROWS * (cellSize + 1);
    const gridX = W / 2 - gridW / 2;
    const gridY = H * 0.22;

    // Phase 1: Show complete grid
    const completeP = easedSub(progress, 0.08, 0.25);
    drawPixelGrid(ctx, grid, gridX, gridY, cellSize, completeP);

    // Phase 2: Apply mask (fade to masked version)
    const maskP = easedSub(progress, 0.3, 0.5);
    if (maskP > 0) {
      drawPixelGrid(ctx, maskedGrid, gridX, gridY, cellSize, 1);
      drawMaskOverlay(ctx, gridX, gridY, cellSize, 1, MASK_ROW, MASK_COL, MASK_H, MASK_W, maskP);
    }

    // Labels
    const knownLabelP = easedSub(progress, 0.5, 0.65);
    if (knownLabelP > 0) {
      // Known pixels label (left of grid)
      fadeInText(ctx, tx('scene1', 'knownLabel'), gridX - 12, gridY + gridH / 2 - 16, knownLabelP, {
        color: colors.insight, font: '11px "Segoe UI", system-ui, sans-serif', align: 'right',
      });

      // Arrow pointing to grid
      ctx.save();
      ctx.globalAlpha = knownLabelP;
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(gridX - 8, gridY + gridH / 2 - 12);
      ctx.lineTo(gridX + 2, gridY + gridH / 4);
      ctx.stroke();
      ctx.restore();
    }

    const unknownLabelP = easedSub(progress, 0.55, 0.7);
    fadeInText(ctx, tx('scene1', 'unknownLabel'), W / 2, gridY + gridH + 24, unknownLabelP, {
      color: colors.error, font: '11px "Segoe UI", system-ui, sans-serif',
    });

    // Question: how to fill coherently?
    const questionP = easedSub(progress, 0.7, 0.85);
    if (questionP > 0) {
      ctx.save();
      ctx.globalAlpha = questionP;

      // Thought bubble arrows pointing from known to unknown
      ctx.strokeStyle = colors.warning + '60';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      // Left context arrow
      const maskCenterX = gridX + (MASK_COL + MASK_W / 2) * (cellSize + 1);
      const maskCenterY = gridY + (MASK_ROW + MASK_H / 2) * (cellSize + 1);

      ctx.beginPath();
      ctx.moveTo(gridX + 2 * (cellSize + 1), maskCenterY);
      ctx.lineTo(gridX + MASK_COL * (cellSize + 1) - 2, maskCenterY);
      ctx.stroke();

      // Top context arrow
      ctx.beginPath();
      ctx.moveTo(maskCenterX, gridY + (cellSize + 1));
      ctx.lineTo(maskCenterX, gridY + MASK_ROW * (cellSize + 1) - 2);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.restore();

      fadeInText(ctx, 'p(x_hole | x_context) = ?', W / 2, H - 40, questionP, {
        color: colors.accent, font: '13px "Segoe UI", system-ui, sans-serif',
      });
    }
  },
});
