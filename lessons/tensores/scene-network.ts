// Scene 8: Tensors flowing through the network
// Horizontal pipeline showing shape transformations in a VAE

import { Scene } from '../../engine/scene';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { sceneBase, drawTitle } from '../../engine/animation/scene-helpers';
import { formulaAppear } from '../../engine/animation/formula';
import { colors, fonts } from '../../engine/shared/design-tokens';
import { text, tx } from './text';
import { getLang } from '../../engine/i18n';
import { animateArrow } from '../../engine/animation/arrow';
import { drawBox, drawBadge, drawPixelGrid, genMnistLike } from './tensor-helpers';

export const scene8 = new Scene({
  id: () => tx('scene8', 'id'),
  duration: 24,
  narration: () => tx('scene8', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene8 as any)?.subtitleCues ?? [],
  topic: () => tx('scene8', 'topic'),
  render(progress, ctx, canvas, r, state) {
    const { W, H } = sceneBase(r);
    drawTitle(ctx, tx('scene8', 'title'), W, progress);

    // ── Lazy data generation ──
    const self = this as any;
    if (!self._data) {
      self._data = { img: genMnistLike(42) };
    }
    const d = self._data;

    const cy = H * 0.45;

    // Pipeline layout: evenly spaced nodes across the width
    // Nodes: Input -> Flatten -> Linear(784,256) -> Linear(256,20) -> Linear(20,784) -> Output
    const margin = W * 0.06;
    const pipeW = W - 2 * margin;
    const nodeCount = 6;
    const nodeSpacing = pipeW / (nodeCount - 1);
    const nodeX = (i: number) => margin + i * nodeSpacing;

    const boxW = Math.min(90, nodeSpacing * 0.6);
    const boxH = 34;
    const badgeY = cy + 38;
    const labelY = cy - 38;

    // ── Phase 1 [0.08–0.25]: Input image + badge ──
    const p1 = easedSub(progress, 0.08, 0.25);
    if (p1 > 0) {
      // Small grid icon
      const cellSize = 3;
      const gridW = 14 * cellSize;
      const ix = nodeX(0);
      drawPixelGrid(ctx, d.img, ix - gridW / 2, cy - gridW / 2, cellSize, p1);

      ctx.save();
      ctx.globalAlpha = p1 * 0.5;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      ctx.strokeRect(ix - gridW / 2 - 1, cy - gridW / 2 - 1, gridW + 2, gridW + 2);
      ctx.restore();

      drawBadge(ctx, '(64, 1, 28, 28)', ix, badgeY, p1);
      fadeInText(ctx, 'Input', ix, labelY, p1, {
        color: colors.textSecondary, font: `bold 12px ${fonts.body}`, align: 'center'
      });
    }

    // ── Phase 2 [0.25–0.40]: Arrow -> Flatten badge ──
    const p2 = easedSub(progress, 0.25, 0.40);
    if (p2 > 0) {
      // Arrow from node 0 to node 1
      animateArrow(ctx, nodeX(0) + 28, cy, nodeX(1) - 28, cy, p2, {
        color: colors.textMuted, headSize: 8
      });

      drawBadge(ctx, '(64, 784)', nodeX(1), badgeY, p2);
      fadeInText(ctx, 'x.view(B, -1)', nodeX(1), labelY, p2, {
        color: colors.warning, font: `bold 11px ${fonts.mono}`, align: 'center'
      });

      // Small bar representing flattened vector
      const barW = boxW * 0.9;
      const barH = 8;
      ctx.save();
      ctx.globalAlpha = p2;
      ctx.fillStyle = colors.accent;
      ctx.fillRect(nodeX(1) - barW / 2, cy - barH / 2, barW, barH);
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(nodeX(1) - barW / 2, cy - barH / 2, barW, barH);
      ctx.restore();
    }

    // ── Phase 3 [0.40–0.55]: Arrow -> nn.Linear(784, 256) box -> badge ──
    const p3 = easedSub(progress, 0.40, 0.55);
    if (p3 > 0) {
      animateArrow(ctx, nodeX(1) + 28, cy, nodeX(2) - boxW / 2 - 8, cy, p3, {
        color: colors.textMuted, headSize: 8
      });

      drawBox(ctx, nodeX(2) - boxW / 2, cy - boxH / 2, boxW, boxH,
        colors.panelBg, colors.accent, p3);

      fadeInText(ctx, 'Linear', nodeX(2), cy - 4, p3, {
        color: colors.accent, font: `bold 11px ${fonts.body}`, align: 'center'
      });
      fadeInText(ctx, '784→256', nodeX(2), cy + 10, p3, {
        color: colors.textMuted, font: `10px ${fonts.mono}`, align: 'center'
      });

      drawBadge(ctx, '(64, 256)', nodeX(2), badgeY, p3);
    }

    // ── Phase 4 [0.55–0.70]: Arrow -> nn.Linear(256, 20) -> badge (latent) ──
    const p4 = easedSub(progress, 0.55, 0.70);
    if (p4 > 0) {
      animateArrow(ctx, nodeX(2) + boxW / 2 + 4, cy, nodeX(3) - boxW / 2 - 8, cy, p4, {
        color: colors.textMuted, headSize: 8
      });

      drawBox(ctx, nodeX(3) - boxW / 2, cy - boxH / 2, boxW, boxH,
        colors.panelBg, colors.insight, p4);

      fadeInText(ctx, 'Linear', nodeX(3), cy - 4, p4, {
        color: colors.insight, font: `bold 11px ${fonts.body}`, align: 'center'
      });
      fadeInText(ctx, '256→20', nodeX(3), cy + 10, p4, {
        color: colors.textMuted, font: `10px ${fonts.mono}`, align: 'center'
      });

      drawBadge(ctx, '(64, 20)', nodeX(3), badgeY, p4);
      fadeInText(ctx,
        getLang() === 'es' ? 'espacio latente z' : 'latent space z',
        nodeX(3), labelY, p4, {
          color: colors.insight, font: `bold 12px ${fonts.body}`, align: 'center'
        });
    }

    // ── Phase 5 [0.70–0.85]: Arrow -> nn.Linear(20, 784) -> badge -> arrow -> output badge ──
    const p5 = easedSub(progress, 0.70, 0.85);
    if (p5 > 0) {
      // Arrow to decoder box
      animateArrow(ctx, nodeX(3) + boxW / 2 + 4, cy, nodeX(4) - boxW / 2 - 8, cy, p5, {
        color: colors.textMuted, headSize: 8
      });

      // Decoder box
      drawBox(ctx, nodeX(4) - boxW / 2, cy - boxH / 2, boxW, boxH,
        colors.panelBg, colors.warning, p5);

      fadeInText(ctx, 'Linear', nodeX(4), cy - 4, p5, {
        color: colors.warning, font: `bold 11px ${fonts.body}`, align: 'center'
      });
      fadeInText(ctx, '20→784', nodeX(4), cy + 10, p5, {
        color: colors.textMuted, font: `10px ${fonts.mono}`, align: 'center'
      });

      drawBadge(ctx, '(64, 784)', nodeX(4), badgeY, p5);

      // Arrow to output
      const p5b = easedSub(progress, 0.76, 0.85);
      if (p5b > 0) {
        animateArrow(ctx, nodeX(4) + boxW / 2 + 4, cy, nodeX(5) - 28, cy, p5b, {
          color: colors.textMuted, headSize: 8
        });

        // Output image
        const cellSize = 3;
        const gridW = 14 * cellSize;
        drawPixelGrid(ctx, d.img, nodeX(5) - gridW / 2, cy - gridW / 2, cellSize, p5b);

        ctx.save();
        ctx.globalAlpha = p5b * 0.5;
        ctx.strokeStyle = colors.warning;
        ctx.lineWidth = 1;
        ctx.strokeRect(nodeX(5) - gridW / 2 - 1, cy - gridW / 2 - 1, gridW + 2, gridW + 2);
        ctx.restore();

        drawBadge(ctx, '(64, 1, 28, 28)', nodeX(5), badgeY, p5b);
        fadeInText(ctx, 'reshape', nodeX(5), labelY, p5b, {
          color: colors.warning, font: `bold 12px ${fonts.body}`, align: 'center'
        });
      }
    }

    // ── Phase 6 [0.85–1.00]: Insight ──
    const p6 = easedSub(progress, 0.85, 1.0);
    if (p6 > 0) {
      fadeInText(ctx, tx('scene8', 'insight'), W * 0.5, H * 0.88, p6, {
        color: colors.insight, font: `bold 15px ${fonts.body}`, align: 'center'
      });
    }
  }
});
