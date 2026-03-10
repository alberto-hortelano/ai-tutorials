// Scene 6: Tensors as images
// Shows pixel grids, MNIST, RGB channels, and flatten

import { Scene } from '../../engine/scene';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { sceneBase, drawTitle } from '../../engine/animation/scene-helpers';
import { formulaAppear } from '../../engine/animation/formula';
import { colors, fonts } from '../../engine/shared/design-tokens';
import { text, tx } from './text';
import { getLang } from '../../engine/i18n';
import { animateArrow } from '../../engine/animation/arrow';
import { drawPixelGrid, drawBadge, genDigit7, genMnistLike } from './tensor-helpers';

export const scene6 = new Scene({
  id: () => tx('scene6', 'id'),
  duration: 22,
  narration: () => tx('scene6', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene6 as any)?.subtitleCues ?? [],
  topic: () => tx('scene6', 'topic'),
  render(progress, ctx, canvas, r, state) {
    const { W, H } = sceneBase(r);
    drawTitle(ctx, tx('scene6', 'title'), W, progress);

    // ── Lazy data generation ──
    const self = this as any;
    if (!self._data) {
      self._data = {
        digit7: genDigit7(),
        mnist: genMnistLike(77),
      };
    }
    const d = self._data;

    const cy = H * 0.50;

    // ── Phase 1 [0.08–0.30]: 8x8 pixel grid showing a "7" ──
    const p1 = easedSub(progress, 0.08, 0.30) * (1 - easedSub(progress, 0.48, 0.55));
    if (p1 > 0) {
      const cellSize = Math.max(8, Math.floor(W * 0.025));
      const gridW = 8 * cellSize;
      const ox = W * 0.25 - gridW / 2;
      const oy = cy - gridW / 2;
      drawPixelGrid(ctx, d.digit7, ox, oy, cellSize, p1);

      // Border around grid
      ctx.save();
      ctx.globalAlpha = p1 * 0.6;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(ox - 1, oy - 1, gridW + 2, gridW + 2);
      ctx.restore();

      drawBadge(ctx, '(8, 8)', ox + gridW / 2, oy + gridW + 22, p1);
      fadeInText(ctx, getLang() === 'es' ? 'Escala de grises' : 'Grayscale',
        ox + gridW / 2, oy - 18, p1, {
          color: colors.textSecondary, font: `13px ${fonts.body}`, align: 'center'
        });
    }

    // ── Phase 2 [0.30–0.55]: MNIST 14x14 with formula ──
    const p2 = easedSub(progress, 0.30, 0.55) * (1 - easedSub(progress, 0.70, 0.78));
    if (p2 > 0) {
      const cellSize = Math.max(5, Math.floor(W * 0.014));
      const gridW = 14 * cellSize;
      const ox = W * 0.65 - gridW / 2;
      const oy = cy - gridW / 2 - 10;
      drawPixelGrid(ctx, d.mnist, ox, oy, cellSize, p2);

      ctx.save();
      ctx.globalAlpha = p2 * 0.6;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      ctx.strokeRect(ox - 1, oy - 1, gridW + 2, gridW + 2);
      ctx.restore();

      drawBadge(ctx, '(1, 28, 28)', ox + gridW / 2, oy + gridW + 22, p2);
      fadeInText(ctx, 'MNIST', ox + gridW / 2, oy - 18, p2, {
        color: colors.accent, font: `bold 14px ${fonts.body}`, align: 'center'
      });

      // Formula
      if (state.formulaManager) {
        formulaAppear(state.formulaManager, 'img-shape',
          'x \\in \\mathbb{R}^{C \\times H \\times W}',
          50, 82, p2, { color: colors.warning, fontSize: '1.0em' });
      }
    } else if (state.formulaManager) {
      formulaAppear(state.formulaManager, 'img-shape',
        'x \\in \\mathbb{R}^{C \\times H \\times W}',
        50, 82, 0, { color: colors.warning, fontSize: '1.0em' });
    }

    // ── Phase 3 [0.55–0.78]: RGB — 3 stacked grids with tints ──
    const p3 = easedSub(progress, 0.55, 0.78) * (1 - easedSub(progress, 0.90, 0.95));
    if (p3 > 0) {
      const cellSize = Math.max(5, Math.floor(W * 0.013));
      const gridW = 14 * cellSize;
      const baseCx = W * 0.3;
      const baseCy = cy - 10;
      const tints = ['#ef4444', '#22c55e', '#3b82f6']; // R, G, B
      const labels = ['R', 'G', 'B'];
      const isoOffX = 14;
      const isoOffY = -12;

      // Draw back to front
      for (let ch = 2; ch >= 0; ch--) {
        const ox = baseCx - gridW / 2 + ch * isoOffX;
        const oy = baseCy - gridW / 2 + ch * isoOffY;
        const chAlpha = p3 * (ch === 0 ? 1 : 0.65);

        // Background panel
        ctx.save();
        ctx.globalAlpha = chAlpha * 0.3;
        ctx.fillStyle = tints[ch];
        ctx.fillRect(ox - 1, oy - 1, gridW + 2, gridW + 2);
        ctx.restore();

        drawPixelGrid(ctx, d.mnist, ox, oy, cellSize, chAlpha, tints[ch]);

        // Channel label
        fadeInText(ctx, labels[ch], ox + gridW + 10, oy + gridW / 2, p3, {
          color: tints[ch], font: `bold 11px ${fonts.mono}`, align: 'left'
        });
      }

      drawBadge(ctx, '(3, H, W)', baseCx, baseCy + gridW / 2 + 30, p3);
      fadeInText(ctx, 'RGB', baseCx, baseCy - gridW / 2 - 24, p3, {
        color: colors.textPrimary, font: `bold 15px ${fonts.body}`, align: 'center'
      });
    }

    // ── Phase 4 [0.78–0.95]: Flatten concept ──
    const p4 = easedSub(progress, 0.78, 0.95);
    if (p4 > 0) {
      const flatY = H * 0.82;

      // Small grid on left
      const miniCell = 3;
      const miniW = 14 * miniCell;
      const miniOx = W * 0.35;
      const miniOy = flatY - miniW / 2;
      drawPixelGrid(ctx, d.mnist, miniOx, miniOy, miniCell, p4);

      // Arrow to the right
      animateArrow(ctx, miniOx + miniW + 10, flatY, miniOx + miniW + 60, flatY, p4, {
        color: colors.textMuted, headSize: 8
      });

      // Thin bar representing flattened vector
      const barX = miniOx + miniW + 70;
      const barW = W * 0.3;
      const barH = 10;
      ctx.save();
      ctx.globalAlpha = p4;
      const gradient = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      gradient.addColorStop(0, colors.accent);
      gradient.addColorStop(1, colors.info);
      ctx.fillStyle = gradient;
      ctx.fillRect(barX, flatY - barH / 2, barW, barH);
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, flatY - barH / 2, barW, barH);
      ctx.restore();

      fadeInText(ctx, '28 × 28 = 784', (barX + barX + barW) / 2, flatY - 14, p4, {
        color: colors.warning, font: `bold 14px ${fonts.mono}`, align: 'center'
      });
      fadeInText(ctx, 'x.view(-1)', barX + barW + 14, flatY, p4, {
        color: colors.textMuted, font: `13px ${fonts.mono}`, align: 'left'
      });
    }

    // ── Phase 5 [0.95–1.00]: Insight ──
    const p5 = easedSub(progress, 0.95, 1.0);
    if (p5 > 0) {
      fadeInText(ctx, tx('scene6', 'insight'), W * 0.5, H * 0.96, p5, {
        color: colors.insight, font: `bold 15px ${fonts.body}`, align: 'center'
      });
    }
  }
});
