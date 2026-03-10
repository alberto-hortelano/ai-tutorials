// Scene 1: What is a tensor? — Progressive rank escalation
// Scalar -> Vector -> Matrix -> 3D Tensor

import { Scene } from '../../engine/scene';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { sceneBase, drawTitle } from '../../engine/animation/scene-helpers';
import { formulaAppear } from '../../engine/animation/formula';
import { colors, fonts } from '../../engine/shared/design-tokens';
import { text, tx } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';
import {
  drawCell, drawGrid, drawIsometric3D,
  genMatrix, gen3DTensor,
} from './tensor-helpers';

export const scene1 = new Scene({
  id: () => tx('scene1', 'id'),
  duration: 20,
  narration: () => tx('scene1', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene1 as SceneText)?.subtitleCues ?? (text.es.scene1 as SceneText).subtitleCues,
  topic: () => tx('scene1', 'topic'),
  render(progress, ctx, canvas, r, state) {
    const { W, H } = sceneBase(r);
    drawTitle(ctx, tx('scene1', 'title'), W, progress);

    // Lazy data generation
    const self = this as any;
    if (!self._data) {
      self._data = {
        scalar: +((Math.random() * 4 - 2).toFixed(1)),
        vector: Array.from({ length: 4 }, () => +((Math.random() * 4 - 2).toFixed(1))),
        mat: genMatrix(3, 4),
        tensor3d: gen3DTensor(2, 3, 4),
      };
    }
    const data = self._data;

    const centerY = H * 0.48;

    // ── Phase 1: Rank 0 — Scalar [0.08 - 0.25] ──
    const scalarP = easedSub(progress, 0.08, 0.20);
    if (scalarP > 0) {
      const fadeOut = progress < 0.25 ? 1 : Math.max(0, 1 - easedSub(progress, 0.25, 0.30));
      const alpha = scalarP * fadeOut;

      // Single cell centered
      const cellW = 52, cellH = 42;
      const cx = W / 2 - cellW / 2;
      const cy = centerY - cellH / 2;
      drawCell(ctx, cx, cy, cellW, cellH, data.scalar, true, alpha);

      // Rank label above
      fadeInText(ctx, 'Rank 0 — Scalar', W / 2, centerY - 50, alpha, {
        color: colors.accent, font: `bold 15px ${fonts.body}`,
      });

      // DL example below
      fadeInText(ctx, tx('scene1', 'scalar'), W / 2, centerY + 50, alpha, {
        color: colors.textMuted, font: `13px ${fonts.body}`,
      });

      // Formula
      if (state.formulaManager) {
        formulaAppear(state.formulaManager, 'rank0', 'x \\in \\mathbb{R}', 50, 80, alpha, {
          color: colors.warning, fontSize: '1em',
        });
      }
    }

    // ── Phase 2: Rank 1 — Vector [0.25 - 0.45] ──
    const vectorP = easedSub(progress, 0.25, 0.38);
    if (vectorP > 0) {
      const fadeOut = progress < 0.45 ? 1 : Math.max(0, 1 - easedSub(progress, 0.45, 0.50));
      const alpha = vectorP * fadeOut;

      const cellW = 52, cellH = 42;
      const totalW = 4 * cellW;
      const ox = W / 2 - totalW / 2;
      const oy = centerY - cellH / 2;

      for (let j = 0; j < 4; j++) {
        drawCell(ctx, ox + j * cellW, oy, cellW - 2, cellH - 2, data.vector[j], true, alpha);
      }

      fadeInText(ctx, 'Rank 1 — Vector', W / 2, centerY - 50, alpha, {
        color: colors.accent, font: `bold 15px ${fonts.body}`,
      });

      fadeInText(ctx, tx('scene1', 'vector'), W / 2, centerY + 50, alpha, {
        color: colors.textMuted, font: `13px ${fonts.body}`,
      });

      if (state.formulaManager) {
        formulaAppear(state.formulaManager, 'rank1', '\\mathbf{x} \\in \\mathbb{R}^n', 50, 80, alpha, {
          color: colors.warning, fontSize: '1em',
        });
      }
    }

    // ── Phase 3: Rank 2 — Matrix [0.45 - 0.70] ──
    const matrixP = easedSub(progress, 0.45, 0.58);
    if (matrixP > 0) {
      const fadeOut = progress < 0.70 ? 1 : Math.max(0, 1 - easedSub(progress, 0.70, 0.75));
      const alpha = matrixP * fadeOut;

      const cellW = 48, cellH = 36;
      const rows = 3, cols = 4;
      const totalW = cols * cellW;
      const totalH = rows * cellH;
      const ox = W / 2 - totalW / 2;
      const oy = centerY - totalH / 2;

      drawGrid(ctx, data.mat, ox, oy, cellW, cellH, true, alpha);

      fadeInText(ctx, 'Rank 2 — Matrix', W / 2, oy - 30, alpha, {
        color: colors.accent, font: `bold 15px ${fonts.body}`,
      });

      fadeInText(ctx, tx('scene1', 'matrix'), W / 2, oy + totalH + 22, alpha, {
        color: colors.textMuted, font: `13px ${fonts.body}`,
      });

      if (state.formulaManager) {
        formulaAppear(state.formulaManager, 'rank2', 'X \\in \\mathbb{R}^{m \\times n}', 50, 80, alpha, {
          color: colors.warning, fontSize: '1em',
        });
      }
    }

    // ── Phase 4: Rank 3 — 3D Tensor [0.70 - 0.92] ──
    const tensor3dP = easedSub(progress, 0.70, 0.82);
    if (tensor3dP > 0) {
      const alpha = tensor3dP;
      const cellW = 40, cellH = 30;

      drawIsometric3D(ctx, data.tensor3d, W / 2, centerY + 10, cellW, cellH, alpha);

      fadeInText(ctx, 'Rank 3 — Tensor', W / 2, centerY - 80, alpha, {
        color: colors.accent, font: `bold 15px ${fonts.body}`,
      });

      fadeInText(ctx, tx('scene1', 'tensor3d'), W / 2, centerY + 95, alpha, {
        color: colors.textMuted, font: `13px ${fonts.body}`,
      });

      if (state.formulaManager) {
        formulaAppear(state.formulaManager, 'rank3', '\\mathcal{T} \\in \\mathbb{R}^{d_1 \\times d_2 \\times d_3}', 50, 80, alpha, {
          color: colors.warning, fontSize: '1em',
        });
      }
    }

    // ── Phase 5: Insight [0.92 - 1.00] ──
    const insightP = easedSub(progress, 0.92, 0.98);
    if (insightP > 0) {
      fadeInText(ctx, tx('scene1', 'insight'), W / 2, H - 40, insightP, {
        color: colors.insight, font: `bold 15px ${fonts.body}`,
      });
    }
  },
});
