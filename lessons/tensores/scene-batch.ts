// Scene 7: Batches — dimension 0
// Shows how individual images stack into batches for GPU parallelism

import { Scene } from '../../engine/scene';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { sceneBase, drawTitle } from '../../engine/animation/scene-helpers';
import { formulaAppear } from '../../engine/animation/formula';
import { colors, fonts } from '../../engine/shared/design-tokens';
import { text, tx } from './text';
import { getLang } from '../../engine/i18n';
import { drawPixelGrid, drawBadge, genMnistLike } from './tensor-helpers';

export const scene7 = new Scene({
  id: () => tx('scene7', 'id'),
  duration: 22,
  narration: () => tx('scene7', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene7 as any)?.subtitleCues ?? [],
  topic: () => tx('scene7', 'topic'),
  render(progress, ctx, canvas, r, state) {
    const { W, H } = sceneBase(r);
    drawTitle(ctx, tx('scene7', 'title'), W, progress);

    // ── Lazy data generation ──
    const self = this as any;
    if (!self._data) {
      self._data = {
        img0: genMnistLike(42),
        img1: genMnistLike(137),
        img2: genMnistLike(256),
        img3: genMnistLike(999),
      };
    }
    const d = self._data;

    const cy = H * 0.45;

    // ── Phase 1 [0.08–0.30]: Single image with label ──
    const p1 = easedSub(progress, 0.08, 0.30) * (1 - easedSub(progress, 0.26, 0.33));
    if (p1 > 0) {
      const cellSize = Math.max(5, Math.floor(W * 0.016));
      const gridW = 14 * cellSize;
      const ox = W * 0.5 - gridW / 2;
      const oy = cy - gridW / 2;
      drawPixelGrid(ctx, d.img0, ox, oy, cellSize, p1);

      ctx.save();
      ctx.globalAlpha = p1 * 0.5;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      ctx.strokeRect(ox - 1, oy - 1, gridW + 2, gridW + 2);
      ctx.restore();

      fadeInText(ctx, getLang() === 'es' ? '1 muestra' : '1 sample',
        ox + gridW / 2, oy - 18, p1, {
          color: colors.textSecondary, font: `13px ${fonts.body}`, align: 'center'
        });
      drawBadge(ctx, '(1, 28, 28)', ox + gridW / 2, oy + gridW + 22, p1);
    }

    // ── Phase 2 [0.30–0.55]: Stack 4 images in a row ──
    const p2 = easedSub(progress, 0.30, 0.55) * (1 - easedSub(progress, 0.50, 0.58));
    if (p2 > 0) {
      const cellSize = Math.max(4, Math.floor(W * 0.011));
      const gridW = 14 * cellSize;
      const gap = 16;
      const imgs = [d.img0, d.img1, d.img2, d.img3];
      const totalW = 4 * gridW + 3 * gap;
      const startX = W * 0.5 - totalW / 2;
      const oy = cy - gridW / 2;

      for (let i = 0; i < 4; i++) {
        const imgAlpha = Math.min(1, p2 * 4 - i * 0.6);
        if (imgAlpha > 0) {
          const ox = startX + i * (gridW + gap);
          drawPixelGrid(ctx, imgs[i], ox, oy, cellSize, Math.max(0, imgAlpha));

          ctx.save();
          ctx.globalAlpha = Math.max(0, imgAlpha) * 0.5;
          ctx.strokeStyle = colors.accent;
          ctx.lineWidth = 1;
          ctx.strokeRect(ox - 1, oy - 1, gridW + 2, gridW + 2);
          ctx.restore();
        }
      }

      fadeInText(ctx, 'batch_size = 4', W * 0.5, oy - 18, p2, {
        color: colors.warning, font: `bold 14px ${fonts.mono}`, align: 'center'
      });
      drawBadge(ctx, '(4, 1, 28, 28)', W * 0.5, oy + gridW + 22, p2);
    }

    // ── Phase 3 [0.55–0.78]: Two-column comparison ──
    const p3 = easedSub(progress, 0.55, 0.78) * (1 - easedSub(progress, 0.73, 0.80));
    if (p3 > 0) {
      const colY = H * 0.42;
      const colH = H * 0.28;

      // Left column: 1 image (slow)
      const leftX = W * 0.22;
      ctx.save();
      ctx.globalAlpha = p3 * 0.25;
      ctx.fillStyle = colors.panelBg;
      ctx.fillRect(leftX - 50, colY - 10, 100, colH + 20);
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(leftX - 50, colY - 10, 100, colH + 20);
      ctx.restore();

      const miniCell = 3;
      const miniW = 14 * miniCell;
      drawPixelGrid(ctx, d.img0, leftX - miniW / 2, colY + 10, miniCell, p3);

      fadeInText(ctx, getLang() === 'es' ? '1 imagen' : '1 image',
        leftX, colY + miniW + 22, p3, {
          color: colors.textSecondary, font: `12px ${fonts.body}`, align: 'center'
        });
      fadeInText(ctx, getLang() === 'es' ? 'Lento' : 'Slow',
        leftX, colY + miniW + 40, p3, {
          color: colors.error, font: `bold 13px ${fonts.body}`, align: 'center'
        });

      // Right column: batch of 64 (fast) — show many small dots
      const rightX = W * 0.72;
      ctx.save();
      ctx.globalAlpha = p3 * 0.25;
      ctx.fillStyle = colors.panelBg;
      ctx.fillRect(rightX - 80, colY - 10, 160, colH + 20);
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(rightX - 80, colY - 10, 160, colH + 20);
      ctx.restore();

      // Draw 64 tiny squares to represent batch
      ctx.save();
      ctx.globalAlpha = p3;
      const dotSize = 6;
      const dotsPerRow = 8;
      const dotGap = 3;
      const dotsW = dotsPerRow * (dotSize + dotGap) - dotGap;
      const dotStartX = rightX - dotsW / 2;
      const dotStartY = colY + 10;
      for (let i = 0; i < 64; i++) {
        const row = Math.floor(i / dotsPerRow);
        const col = i % dotsPerRow;
        ctx.fillStyle = i % 7 === 0 ? colors.accent : colors.textDimmed;
        ctx.fillRect(
          dotStartX + col * (dotSize + dotGap),
          dotStartY + row * (dotSize + dotGap),
          dotSize, dotSize
        );
      }
      ctx.restore();

      fadeInText(ctx, getLang() === 'es' ? 'Batch de 64' : 'Batch of 64',
        rightX, colY + colH - 16, p3, {
          color: colors.textSecondary, font: `12px ${fonts.body}`, align: 'center'
        });
      fadeInText(ctx, getLang() === 'es' ? 'Paralelo en GPU' : 'GPU parallel',
        rightX, colY + colH + 2, p3, {
          color: colors.insight, font: `bold 13px ${fonts.body}`, align: 'center'
        });
    }

    // ── Phase 4 [0.78–0.92]: Convention (B, C, H, W) with colored parts ──
    const p4 = easedSub(progress, 0.78, 0.92);
    if (p4 > 0) {
      const convY = H * 0.85;
      const dimColors = [colors.warning, colors.accent, colors.info, colors.insight];
      const dimLabels = ['B', 'C', 'H', 'W'];
      const dimValues = ['64', '1', '28', '28'];

      // Draw "(B, C, H, W)" with each letter in its own color
      const partWidth = 50;
      const startX = W * 0.5 - (4 * partWidth) / 2;

      // Opening paren
      fadeInText(ctx, '(', startX - 10, convY, p4, {
        color: colors.textPrimary, font: `bold 18px ${fonts.mono}`, align: 'center'
      });

      for (let i = 0; i < 4; i++) {
        const x = startX + i * partWidth + partWidth / 2;
        fadeInText(ctx, dimLabels[i], x, convY - 12, p4, {
          color: dimColors[i], font: `bold 18px ${fonts.mono}`, align: 'center'
        });
        fadeInText(ctx, dimValues[i], x, convY + 10, p4, {
          color: dimColors[i], font: `14px ${fonts.mono}`, align: 'center'
        });
        // Comma separator
        if (i < 3) {
          fadeInText(ctx, ',', x + partWidth / 2 - 2, convY - 12, p4, {
            color: colors.textMuted, font: `bold 18px ${fonts.mono}`, align: 'center'
          });
        }
      }

      // Closing paren
      fadeInText(ctx, ')', startX + 4 * partWidth + 4, convY, p4, {
        color: colors.textPrimary, font: `bold 18px ${fonts.mono}`, align: 'center'
      });

      // numel
      fadeInText(ctx, 'numel = 50,176', W * 0.5, convY + 30, p4, {
        color: colors.textMuted, font: `13px ${fonts.mono}`, align: 'center'
      });
    }

    // ── Phase 5 [0.92–1.00]: Insight ──
    const p5 = easedSub(progress, 0.92, 1.0);
    if (p5 > 0) {
      fadeInText(ctx, tx('scene7', 'insight'), W * 0.5, H * 0.96, p5, {
        color: colors.insight, font: `bold 15px ${fonts.body}`, align: 'center'
      });
    }
  }
});
