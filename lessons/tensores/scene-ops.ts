// Scene 3: Element-wise operations
// Addition, scalar multiply, ReLU — all preserve shape

import { Scene } from '../../engine/scene';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { sceneBase, drawTitle } from '../../engine/animation/scene-helpers';
import { formulaAppear } from '../../engine/animation/formula';
import { colors, fonts } from '../../engine/shared/design-tokens';
import { text, tx } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';
import { drawGrid, drawCell, genMatrix, valColor } from './tensor-helpers';

export const scene3 = new Scene({
  id: () => tx('scene3', 'id'),
  duration: 20,
  narration: () => tx('scene3', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene3 as SceneText)?.subtitleCues ?? (text.es.scene3 as SceneText).subtitleCues,
  topic: () => tx('scene3', 'topic'),
  render(progress, ctx, canvas, r, state) {
    const { W, H } = sceneBase(r);
    drawTitle(ctx, tx('scene3', 'title'), W, progress);

    // Lazy data
    const self = this as any;
    if (!self._data) {
      const A = genMatrix(3, 3);
      const B = genMatrix(3, 3);
      const C = A.map((row, i) => row.map((v, j) => +((v + B[i][j]).toFixed(1))));
      const k = 2.0;
      const kA = A.map(row => row.map(v => +((v * k).toFixed(1))));
      // ReLU input: mix of positive and negative
      const reluIn = genMatrix(3, 3);
      const reluOut = reluIn.map(row => row.map(v => Math.max(0, v)));
      self._data = { A, B, C, k, kA, reluIn, reluOut };
    }
    const data = self._data;

    const cellW = 40, cellH = 32;
    const centerY = H * 0.48;

    // ── Phase 1: Addition A + B = C [0.08 - 0.35] ──
    const addP = easedSub(progress, 0.08, 0.28);
    if (addP > 0) {
      const fadeOut = progress < 0.35 ? 1 : Math.max(0, 1 - easedSub(progress, 0.35, 0.40));
      const alpha = addP * fadeOut;

      const gap = 30;
      const gridW = 3 * cellW;
      const totalW = gridW * 3 + gap * 4; // A + gap + "+" + gap + B + gap + "=" + gap + C
      const startX = W / 2 - totalW / 2;

      // Grid A
      const aX = startX;
      drawGrid(ctx, data.A, aX, centerY - (3 * cellH) / 2, cellW, cellH, true, alpha);

      // "+"
      const plusX = aX + gridW + gap;
      fadeInText(ctx, '+', plusX, centerY, alpha, {
        color: colors.textPrimary, font: `bold 22px ${fonts.body}`,
      });

      // Grid B
      const bX = plusX + gap;
      drawGrid(ctx, data.B, bX, centerY - (3 * cellH) / 2, cellW, cellH, true, alpha);

      // "="
      const eqX = bX + gridW + gap;
      fadeInText(ctx, '=', eqX, centerY, alpha, {
        color: colors.textPrimary, font: `bold 22px ${fonts.body}`,
      });

      // Grid C
      const cX = eqX + gap;
      drawGrid(ctx, data.C, cX, centerY - (3 * cellH) / 2, cellW, cellH, true, alpha);

      // Label
      fadeInText(ctx, 'A + B = C', W / 2, centerY + (3 * cellH) / 2 + 25, alpha, {
        color: colors.textSecondary, font: `13px ${fonts.body}`,
      });
    }

    // ── Phase 2: Scalar multiply k * A = B [0.35 - 0.60] ──
    const scalarP = easedSub(progress, 0.35, 0.52);
    if (scalarP > 0) {
      const fadeOut = progress < 0.60 ? 1 : Math.max(0, 1 - easedSub(progress, 0.60, 0.65));
      const alpha = scalarP * fadeOut;

      const gap = 30;
      const gridW = 3 * cellW;
      const startX = W / 2 - (gridW * 2 + gap * 4 + 30) / 2;

      // k value
      const kX = startX;
      fadeInText(ctx, `${data.k.toFixed(1)}`, kX + 15, centerY, alpha, {
        color: colors.warning, font: `bold 20px ${fonts.mono}`,
      });

      // "x"
      fadeInText(ctx, '\u00d7', kX + 40, centerY, alpha, {
        color: colors.textPrimary, font: `bold 18px ${fonts.body}`,
      });

      // Grid A
      const aX = kX + 60;
      drawGrid(ctx, data.A, aX, centerY - (3 * cellH) / 2, cellW, cellH, true, alpha);

      // "="
      const eqX = aX + gridW + gap;
      fadeInText(ctx, '=', eqX, centerY, alpha, {
        color: colors.textPrimary, font: `bold 22px ${fonts.body}`,
      });

      // Grid kA
      const kAx = eqX + gap;
      drawGrid(ctx, data.kA, kAx, centerY - (3 * cellH) / 2, cellW, cellH, true, alpha);

      fadeInText(ctx, `k = ${data.k.toFixed(1)}`, W / 2, centerY + (3 * cellH) / 2 + 25, alpha, {
        color: colors.warning, font: `bold 13px ${fonts.body}`,
      });
    }

    // ── Phase 3: ReLU [0.60 - 0.85] ──
    const reluP = easedSub(progress, 0.60, 0.78);
    if (reluP > 0) {
      const alpha = reluP;
      const gap = 50;
      const gridW = 3 * cellW;
      const totalW = gridW * 2 + gap + 30;
      const startX = W / 2 - totalW / 2;

      // Input grid (with negatives visible)
      const inX = startX;
      drawGrid(ctx, data.reluIn, inX, centerY - (3 * cellH) / 2, cellW, cellH, true, alpha);

      // Arrow
      fadeInText(ctx, '\u2192', inX + gridW + gap / 2 - 5, centerY, alpha, {
        color: colors.accent, font: `bold 24px ${fonts.body}`,
      });

      // ReLU label above arrow
      fadeInText(ctx, 'ReLU', inX + gridW + gap / 2 - 5, centerY - 25, alpha, {
        color: colors.accent, font: `bold 13px ${fonts.mono}`,
      });

      // Output grid — negatives become dark (0)
      const outX = inX + gridW + gap;
      const outMat = data.reluOut;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const v = outMat[i][j];
          const cx = outX + j * cellW;
          const cy2 = centerY - (3 * cellH) / 2 + i * cellH;
          if (v <= 0) {
            // Dark cell for zeroed values
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = 'rgba(15,23,42,0.8)';
            const rad = 4;
            ctx.beginPath();
            ctx.moveTo(cx + rad, cy2);
            ctx.arcTo(cx + cellW - 2, cy2, cx + cellW - 2, cy2 + cellH - 2, rad);
            ctx.arcTo(cx + cellW - 2, cy2 + cellH - 2, cx, cy2 + cellH - 2, rad);
            ctx.arcTo(cx, cy2 + cellH - 2, cx, cy2, rad);
            ctx.arcTo(cx, cy2, cx + cellW - 2, cy2, rad);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'rgba(148,163,184,0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = colors.textDimmed;
            ctx.font = `${Math.min(14, (cellH - 2) * 0.4)}px ${fonts.mono}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('0.0', cx + (cellW - 2) / 2, cy2 + (cellH - 2) / 2);
            ctx.restore();
          } else {
            drawCell(ctx, cx, cy2, cellW - 2, cellH - 2, v, true, alpha);
          }
        }
      }

      // Formula
      if (state.formulaManager) {
        formulaAppear(
          state.formulaManager, 'relu',
          '\\text{ReLU}(x) = \\max(0, x)',
          50, 82, alpha,
          { color: colors.warning, fontSize: '1em' },
        );
      }
    }

    // ── Insight [0.85 - 1.00] ──
    const insightP = easedSub(progress, 0.85, 0.93);
    if (insightP > 0) {
      fadeInText(ctx, tx('scene3', 'insight'), W / 2, H - 35, insightP, {
        color: colors.insight, font: `bold 15px ${fonts.body}`,
      });
    }
  },
});
