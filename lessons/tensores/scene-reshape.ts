// Scene 4: Reshape — same data, new form
// Animated cells moving between (2,6) -> (3,4) -> (12,1) layouts

import { Scene } from '../../engine/scene';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { sceneBase, drawTitle } from '../../engine/animation/scene-helpers';
import { formulaAppear } from '../../engine/animation/formula';
import { colors, fonts } from '../../engine/shared/design-tokens';
import { text, tx } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';
import { drawColorCell, RESHAPE_COLORS } from './tensor-helpers';

/** Compute cell positions for a given (rows, cols) layout centered at (cx, cy). */
function layoutPositions(
  rows: number, cols: number, cx: number, cy: number, cellW: number, cellH: number,
): { x: number; y: number }[] {
  const totalW = cols * cellW;
  const totalH = rows * cellH;
  const ox = cx - totalW / 2;
  const oy = cy - totalH / 2;
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      positions.push({ x: ox + j * cellW, y: oy + i * cellH });
    }
  }
  return positions;
}

/** Linear interpolation between two values. */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export const scene4 = new Scene({
  id: () => tx('scene4', 'id'),
  duration: 20,
  narration: () => tx('scene4', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene4 as SceneText)?.subtitleCues ?? (text.es.scene4 as SceneText).subtitleCues,
  topic: () => tx('scene4', 'topic'),
  render(progress, ctx, canvas, r, state) {
    const { W, H } = sceneBase(r);
    drawTitle(ctx, tx('scene4', 'title'), W, progress);

    const cellW = 42, cellH = 34;
    const centerY = H * 0.45;

    // Pre-compute layouts
    const pos26 = layoutPositions(2, 6, W / 2, centerY, cellW, cellH);
    const pos34 = layoutPositions(3, 4, W / 2, centerY, cellW, cellH);
    const pos121 = layoutPositions(12, 1, W / 2, centerY, cellW, cellH);

    // ── Phase 1: Show (2,6) layout [0.08 - 0.30] ──
    const showP = easedSub(progress, 0.08, 0.20);
    if (showP > 0 && progress < 0.30) {
      const alpha = showP;
      for (let i = 0; i < 12; i++) {
        drawColorCell(ctx, pos26[i].x, pos26[i].y, cellW - 2, cellH - 2, RESHAPE_COLORS[i], `${i}`, alpha);
      }

      fadeInText(ctx, 'shape: (2, 6)', W / 2, centerY + cellH + 25, alpha, {
        color: colors.textSecondary, font: `bold 13px ${fonts.mono}`,
      });
    }

    // ── Phase 2: Animate (2,6) -> (3,4) [0.30 - 0.50] ──
    const morph1P = easedSub(progress, 0.30, 0.48);
    if (progress >= 0.30 && progress < 0.50) {
      const t = morph1P;
      for (let i = 0; i < 12; i++) {
        const x = lerp(pos26[i].x, pos34[i].x, t);
        const y = lerp(pos26[i].y, pos34[i].y, t);
        drawColorCell(ctx, x, y, cellW - 2, cellH - 2, RESHAPE_COLORS[i], `${i}`, 1);
      }

      fadeInText(ctx, 'x.view(3, 4)', W / 2, centerY + cellH * 2 + 20, morph1P, {
        color: colors.accent, font: `bold 14px ${fonts.mono}`,
      });

      fadeInText(ctx, 'shape: (3, 4)', W / 2, centerY + cellH * 2 + 42, morph1P, {
        color: colors.textSecondary, font: `13px ${fonts.mono}`,
      });
    }

    // Hold (3,4) briefly
    if (progress >= 0.50 && progress < 0.52) {
      for (let i = 0; i < 12; i++) {
        drawColorCell(ctx, pos34[i].x, pos34[i].y, cellW - 2, cellH - 2, RESHAPE_COLORS[i], `${i}`, 1);
      }
    }

    // ── Phase 3: Animate (3,4) -> (12,1) [0.50 - 0.70] ──
    const morph2P = easedSub(progress, 0.50, 0.68);
    if (progress >= 0.52 && progress < 0.70) {
      const t = morph2P;
      for (let i = 0; i < 12; i++) {
        const x = lerp(pos34[i].x, pos121[i].x, t);
        const y = lerp(pos34[i].y, pos121[i].y, t);
        drawColorCell(ctx, x, y, cellW - 2, cellH - 2, RESHAPE_COLORS[i], `${i}`, 1);
      }

      fadeInText(ctx, 'x.flatten()', W / 2 + cellW * 1.5, centerY, morph2P, {
        color: colors.accent, font: `bold 14px ${fonts.mono}`,
      });

      fadeInText(ctx, 'shape: (12,)', W / 2 + cellW * 1.5, centerY + 22, morph2P, {
        color: colors.textSecondary, font: `13px ${fonts.mono}`,
      });
    }

    // ── Phase 4: Image flatten concept [0.70 - 0.90] ──
    const flattenP = easedSub(progress, 0.70, 0.85);
    if (flattenP > 0) {
      const boxY = centerY - 30;

      // Image box
      const imgSize = 60;
      const imgX = W * 0.30 - imgSize / 2;
      ctx.save();
      ctx.globalAlpha = flattenP;

      // Draw a small grid pattern representing an image
      const gridSize = 6;
      const pixelSize = imgSize / gridSize;
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const brightness = Math.floor(((i + j) % 3) * 80 + 60);
          ctx.fillStyle = `rgb(${brightness},${brightness},${brightness})`;
          ctx.fillRect(imgX + j * pixelSize, boxY + i * pixelSize, pixelSize - 0.5, pixelSize - 0.5);
        }
      }
      ctx.restore();

      fadeInText(ctx, '(1, 28, 28)', W * 0.30, boxY + imgSize + 18, flattenP, {
        color: colors.textSecondary, font: `12px ${fonts.mono}`,
      });

      // Arrow
      fadeInText(ctx, '\u2192', W * 0.50, boxY + imgSize / 2, flattenP, {
        color: colors.accent, font: `bold 24px ${fonts.body}`,
      });

      // Flat vector representation
      const vecX = W * 0.63;
      const vecW = W * 0.25;
      const vecH = 18;
      ctx.save();
      ctx.globalAlpha = flattenP;
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      const rad = 4;
      ctx.beginPath();
      ctx.moveTo(vecX + rad, boxY + imgSize / 2 - vecH / 2);
      ctx.arcTo(vecX + vecW, boxY + imgSize / 2 - vecH / 2, vecX + vecW, boxY + imgSize / 2 + vecH / 2, rad);
      ctx.arcTo(vecX + vecW, boxY + imgSize / 2 + vecH / 2, vecX, boxY + imgSize / 2 + vecH / 2, rad);
      ctx.arcTo(vecX, boxY + imgSize / 2 + vecH / 2, vecX, boxY + imgSize / 2 - vecH / 2, rad);
      ctx.arcTo(vecX, boxY + imgSize / 2 - vecH / 2, vecX + vecW, boxY + imgSize / 2 - vecH / 2, rad);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Dots inside to represent values
      ctx.fillStyle = colors.textMuted;
      ctx.font = `11px ${fonts.mono}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('0.1  0.9  0.0  0.3  ...  0.7  0.2', vecX + vecW / 2, boxY + imgSize / 2);
      ctx.restore();

      fadeInText(ctx, '(784,)', vecX + vecW / 2, boxY + imgSize / 2 + vecH / 2 + 16, flattenP, {
        color: colors.textSecondary, font: `12px ${fonts.mono}`,
      });

      fadeInText(ctx, 'x.view(batch, -1)', W / 2, boxY + imgSize + 50, flattenP, {
        color: colors.accent, font: `bold 13px ${fonts.mono}`,
      });
    }

    // ── Insight [0.90 - 1.00] ──
    const insightP = easedSub(progress, 0.90, 0.97);
    if (insightP > 0) {
      fadeInText(ctx, tx('scene4', 'insight'), W / 2, H - 35, insightP, {
        color: colors.insight, font: `bold 15px ${fonts.body}`,
      });
    }
  },
});
