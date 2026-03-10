// Scene 7: Beyond Inpainting — application gallery with different mask patterns

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

/** Draw a small grid representing an image with a specific mask pattern */
function drawMiniGrid(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  maskFn: (row: number, col: number, nRows: number, nCols: number) => boolean,
  label: string, color: string, progress: number,
) {
  if (progress <= 0) return;
  const p = easeOut(Math.min(progress, 1));

  ctx.save();
  ctx.globalAlpha = p;

  const nRows = 6;
  const nCols = 8;
  const cellW = w / nCols;
  const cellH = h / nRows;

  for (let r = 0; r < nRows; r++) {
    for (let c = 0; c < nCols; c++) {
      const cx = x + c * cellW;
      const cy = y + r * cellH;
      const isMasked = maskFn(r, c, nRows, nCols);

      if (isMasked) {
        // Unknown: to be generated (colored)
        ctx.fillStyle = color + '40';
        ctx.fillRect(cx, cy, cellW - 1, cellH - 1);
      } else {
        // Known: existing pixel
        ctx.fillStyle = colors.textDimmed + '30';
        ctx.fillRect(cx, cy, cellW - 1, cellH - 1);
      }
    }
  }

  // Border
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);

  // Mask region indicator (colored border on masked area)
  ctx.strokeStyle = color + '80';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  for (let r = 0; r < nRows; r++) {
    for (let c = 0; c < nCols; c++) {
      if (maskFn(r, c, nRows, nCols)) {
        const cx = x + c * cellW;
        const cy = y + r * cellH;
        ctx.strokeRect(cx, cy, cellW - 1, cellH - 1);
      }
    }
  }
  ctx.setLineDash([]);

  // Label
  ctx.fillStyle = color;
  ctx.font = 'bold 11px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + h + 16);

  ctx.restore();
}

export const scene7 = new Scene({
  id: () => tx('scene7', 'id'),
  duration: 22,
  narration: () => tx('scene7', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene7 as SceneText)?.subtitleCues ?? (text.es.scene7 as SceneText).subtitleCues,
  topic: () => tx('scene7', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene7', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Four application cards in a 2x2 grid
    const cardW = W * 0.35;
    const cardH = H * 0.22;
    const gapX = W * 0.08;
    const gapY = 20;
    const startX = W / 2 - cardW - gapX / 2;
    const startY = 60;

    // 1. Inpainting (center hole) - top left
    const inp = easedSub(progress, 0.08, 0.28);
    drawMiniGrid(ctx, startX, startY, cardW, cardH,
      (r, c, nR, nC) => r >= 2 && r < 4 && c >= 3 && c < 6,
      tx('scene7', 'inpaintLabel'), series[0], inp,
    );

    // 2. Outpainting (border unknown) - top right
    const outp = easedSub(progress, 0.22, 0.42);
    drawMiniGrid(ctx, startX + cardW + gapX, startY, cardW, cardH,
      (r, c, nR, nC) => r === 0 || r === nR - 1 || c === 0 || c === nC - 1,
      tx('scene7', 'outpaintLabel'), series[1], outp,
    );

    // 3. Super-resolution (checkerboard-like missing pixels) - bottom left
    const srP = easedSub(progress, 0.38, 0.58);
    drawMiniGrid(ctx, startX, startY + cardH + gapY + 16, cardW, cardH,
      (r, c) => (r + c) % 2 === 1,
      tx('scene7', 'superresLabel'), series[2], srP,
    );

    // 4. Colorization (all pixels have structure, just need color) - bottom right
    const colP = easedSub(progress, 0.5, 0.7);
    drawMiniGrid(ctx, startX + cardW + gapX, startY + cardH + gapY + 16, cardW, cardH,
      (r, c, nR, nC) => true, // all pixels are "unknown" in terms of color
      tx('scene7', 'colorizeLabel'), series[3], colP,
    );

    // Connection lines from center
    const connectP = easedSub(progress, 0.65, 0.8);
    if (connectP > 0) {
      ctx.save();
      ctx.globalAlpha = connectP * 0.3;
      ctx.strokeStyle = colors.textDimmed;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      const centerX = W / 2;
      const centerY = startY + cardH + gapY / 2 + 8;

      // Lines to each card
      const targets = [
        { x: startX + cardW / 2, y: startY + cardH },
        { x: startX + cardW + gapX + cardW / 2, y: startY + cardH },
        { x: startX + cardW / 2, y: startY + cardH + gapY + 16 },
        { x: startX + cardW + gapX + cardW / 2, y: startY + cardH + gapY + 16 },
      ];
      for (const t of targets) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
      }

      ctx.setLineDash([]);
      ctx.restore();
    }

    // Insight box at the bottom
    const insightP = easedSub(progress, 0.8, 0.95);
    if (insightP > 0) {
      ctx.save();
      ctx.globalAlpha = insightP;

      const boxW = W * 0.7;
      const boxX = W / 2 - boxW / 2;
      const boxY = H - 48;
      const boxH = 32;

      ctx.fillStyle = colors.accent + '15';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = colors.accent + '50';
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      ctx.fillStyle = colors.accent;
      ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene7', 'insight'), W / 2, boxY + boxH / 2);

      ctx.restore();
    }
  },
});
