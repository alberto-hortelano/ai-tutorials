// Scene 5: Broadcasting
// Shows how PyTorch broadcasts a vector across matrix rows

import { Scene } from '../../engine/scene';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { sceneBase, drawTitle } from '../../engine/animation/scene-helpers';
import { formulaAppear } from '../../engine/animation/formula';
import { colors, fonts } from '../../engine/shared/design-tokens';
import { text, tx } from './text';
import { getLang } from '../../engine/i18n';
import { drawGrid, drawBadge, genMatrix } from './tensor-helpers';

export const scene5 = new Scene({
  id: () => tx('scene5', 'id'),
  duration: 22,
  narration: () => tx('scene5', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene5 as any)?.subtitleCues ?? [],
  topic: () => tx('scene5', 'topic'),
  render(progress, ctx, canvas, r, state) {
    const { W, H } = sceneBase(r);
    drawTitle(ctx, tx('scene5', 'title'), W, progress);

    // ── Lazy data generation ──
    const self = this as any;
    if (!self._data) {
      const A = genMatrix(3, 4);
      const b = [
        +((Math.random() * 4 - 2).toFixed(1)),
        +((Math.random() * 4 - 2).toFixed(1)),
        +((Math.random() * 4 - 2).toFixed(1)),
        +((Math.random() * 4 - 2).toFixed(1)),
      ];
      // Compute C = A + broadcast(b)
      const C: number[][] = A.map(row => row.map((v, j) => +(v + b[j]).toFixed(1)));
      // Expanded b: 3 rows identical
      const bExpanded: number[][] = [b.slice(), b.slice(), b.slice()];
      self._data = { A, b, C, bExpanded };
    }
    const d = self._data;

    const cellW = 44;
    const cellH = 32;
    const cy = H * 0.48;

    // ── Phase 1 [0.08–0.30]: Show matrix A and vector b ──
    const p1 = easedSub(progress, 0.08, 0.30) * (1 - easedSub(progress, 0.28, 0.35));
    if (p1 > 0) {
      const axOff = W * 0.15;
      const ayOff = cy - (3 * cellH) / 2;
      drawGrid(ctx, d.A, axOff, ayOff, cellW, cellH, true, p1);
      drawBadge(ctx, 'A (3,4)', axOff + (4 * cellW) / 2, ayOff - 20, p1);

      // Draw vector b as a single row below-right
      const bx = W * 0.55;
      const by = cy + 20;
      drawGrid(ctx, [d.b], bx, by, cellW, cellH, true, p1);
      drawBadge(ctx, 'b (4,)', bx + (4 * cellW) / 2, by - 20, p1);

      // Mismatch indicator
      fadeInText(ctx, '?', W * 0.45, cy, p1, {
        color: colors.warning, font: `bold 28px ${fonts.body}`, align: 'center'
      });
    }

    // ── Phase 2 [0.30–0.55]: Vector b gets replicated (ghost copies) ──
    const p2 = easedSub(progress, 0.30, 0.55) * (1 - easedSub(progress, 0.50, 0.58));
    if (p2 > 0) {
      const axOff = W * 0.08;
      const ayOff = cy - (3 * cellH) / 2;
      drawGrid(ctx, d.A, axOff, ayOff, cellW, cellH, true, 1);
      drawBadge(ctx, 'A (3,4)', axOff + (4 * cellW) / 2, ayOff - 20, 1);

      // Draw ghost copies of b expanding into 3 rows
      const bExpX = W * 0.52;
      const bExpY = cy - (3 * cellH) / 2;
      for (let row = 0; row < 3; row++) {
        const rowAlpha = Math.min(1, p2 * 3 - row * 0.5);
        if (rowAlpha > 0) {
          // Dashed border effect for ghost copies
          ctx.save();
          ctx.setLineDash(rowAlpha < 0.8 ? [4, 4] : []);
          drawGrid(ctx, [d.b], bExpX, bExpY + row * cellH, cellW, cellH, true, Math.max(0.3, rowAlpha));
          ctx.setLineDash([]);
          ctx.restore();
        }
      }
      drawBadge(ctx, 'b → (3,4)', bExpX + (4 * cellW) / 2, bExpY - 20, p2);
    }

    // ── Phase 3 [0.55–0.75]: Result A + expanded_b = C ──
    const p3 = easedSub(progress, 0.55, 0.75);
    if (p3 > 0) {
      const smallCell = 36;
      const smallH = 28;
      const gridY = cy - (3 * smallH) / 2;
      const spacing = 4 * smallCell + 36;

      // A
      const ax = W * 0.04;
      drawGrid(ctx, d.A, ax, gridY, smallCell, smallH, true, p3);
      fadeInText(ctx, 'A', ax + (4 * smallCell) / 2, gridY - 16, p3, {
        color: colors.textSecondary, font: `bold 13px ${fonts.mono}`, align: 'center'
      });

      // "+"
      const plusX = ax + spacing - 18;
      fadeInText(ctx, '+', plusX, cy, p3, {
        color: colors.textPrimary, font: `bold 22px ${fonts.body}`, align: 'center'
      });

      // expanded b
      const bx = ax + spacing;
      drawGrid(ctx, d.bExpanded, bx, gridY, smallCell, smallH, true, p3);
      fadeInText(ctx, 'b_exp', bx + (4 * smallCell) / 2, gridY - 16, p3, {
        color: colors.textSecondary, font: `bold 13px ${fonts.mono}`, align: 'center'
      });

      // "="
      const eqX = bx + spacing - 18;
      fadeInText(ctx, '=', eqX, cy, p3, {
        color: colors.textPrimary, font: `bold 22px ${fonts.body}`, align: 'center'
      });

      // C
      const cx2 = bx + spacing;
      drawGrid(ctx, d.C, cx2, gridY, smallCell, smallH, true, p3);
      fadeInText(ctx, 'C', cx2 + (4 * smallCell) / 2, gridY - 16, p3, {
        color: colors.insight, font: `bold 13px ${fonts.mono}`, align: 'center'
      });
    }

    // ── Phase 4 [0.75–0.92]: DL example text ──
    const p4 = easedSub(progress, 0.75, 0.92);
    if (p4 > 0) {
      fadeInText(ctx, 'y = Wx + b', W * 0.5, H * 0.82, p4, {
        color: colors.warning, font: `bold 20px ${fonts.mono}`, align: 'center'
      });
      fadeInText(ctx, getLang() === 'es' ? 'El bias se suma a cada muestra del batch' : 'The bias is added to every sample in the batch',
        W * 0.5, H * 0.89, p4, {
          color: colors.textMuted, font: `14px ${fonts.body}`, align: 'center'
        });
    }

    // ── Phase 5 [0.92–1.00]: Insight ──
    const p5 = easedSub(progress, 0.92, 1.0);
    if (p5 > 0) {
      fadeInText(ctx, tx('scene5', 'insight'), W * 0.5, H * 0.95, p5, {
        color: colors.insight, font: `bold 15px ${fonts.body}`, align: 'center'
      });
    }
  }
});
