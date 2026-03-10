// Scene 2: Shape — the DNA of a tensor
// Axis labels, badges, DL example, indexing highlight

import { Scene } from '../../engine/scene';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { sceneBase, drawTitle } from '../../engine/animation/scene-helpers';
import { formulaAppear } from '../../engine/animation/formula';
import { colors, fonts } from '../../engine/shared/design-tokens';
import { text, tx } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';
import { drawGrid, drawCell, drawBadge, drawBox, genMatrix } from './tensor-helpers';

export const scene2 = new Scene({
  id: () => tx('scene2', 'id'),
  duration: 18,
  narration: () => tx('scene2', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene2 as SceneText)?.subtitleCues ?? (text.es.scene2 as SceneText).subtitleCues,
  topic: () => tx('scene2', 'topic'),
  render(progress, ctx, canvas, r, state) {
    const { W, H } = sceneBase(r);
    drawTitle(ctx, tx('scene2', 'title'), W, progress);

    // Lazy data
    const self = this as any;
    if (!self._data) {
      self._data = { mat: genMatrix(3, 4) };
    }
    const data = self._data;

    const rows = 3, cols = 4;
    const cellW = 48, cellH = 36;
    const totalW = cols * cellW;
    const totalH = rows * cellH;
    const gridCX = W * 0.35;
    const gridCY = H * 0.42;
    const ox = gridCX - totalW / 2;
    const oy = gridCY - totalH / 2;

    // ── Phase 1: Grid with axis labels [0.08 - 0.30] ──
    const gridP = easedSub(progress, 0.08, 0.22);
    if (gridP > 0) {
      drawGrid(ctx, data.mat, ox, oy, cellW, cellH, true, gridP);

      // Horizontal axis label (dim 1)
      fadeInText(ctx, 'dim 1 (cols: 4)', gridCX, oy + totalH + 22, gridP, {
        color: colors.accent, font: `bold 12px ${fonts.mono}`,
      });

      // Vertical axis label (dim 0)
      ctx.save();
      ctx.globalAlpha = gridP;
      ctx.translate(ox - 22, gridCY);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = colors.accent;
      ctx.font = `bold 12px ${fonts.mono}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('dim 0 (rows: 3)', 0, 0);
      ctx.restore();
    }

    // ── Phase 2: Badges + formula [0.30 - 0.50] ──
    const badgeP = easedSub(progress, 0.30, 0.45);
    if (badgeP > 0) {
      const badgeY = oy + totalH + 55;
      drawBadge(ctx, 'shape: (3, 4)', W * 0.35 - 110, badgeY, badgeP);
      drawBadge(ctx, 'ndim: 2', W * 0.35, badgeY, badgeP);
      drawBadge(ctx, 'numel: 12', W * 0.35 + 100, badgeY, badgeP);

      if (state.formulaManager) {
        formulaAppear(
          state.formulaManager, 'numel',
          '\\text{numel} = \\prod_{i} \\text{shape}[i]',
          50, 82, badgeP,
          { color: colors.warning, fontSize: '1em' },
        );
      }
    }

    // ── Phase 3: DL example — large weight matrix [0.50 - 0.75] ──
    const dlP = easedSub(progress, 0.50, 0.65);
    if (dlP > 0) {
      const rectX = W * 0.65;
      const rectY = H * 0.28;
      const rectW = W * 0.25;
      const rectH = H * 0.30;

      drawBox(ctx, rectX, rectY, rectW, rectH, colors.panelBg, colors.accent, dlP);

      fadeInText(ctx, 'nn.Linear(784, 256)', rectX + rectW / 2, rectY - 14, dlP, {
        color: colors.accent, font: `bold 12px ${fonts.mono}`,
      });

      fadeInText(ctx, 'shape: (256, 784)', rectX + rectW / 2, rectY + rectH / 2 - 10, dlP, {
        color: colors.textSecondary, font: `13px ${fonts.mono}`,
      });

      fadeInText(ctx, '200,704 parameters', rectX + rectW / 2, rectY + rectH / 2 + 14, dlP, {
        color: colors.warning, font: `bold 13px ${fonts.body}`,
      });
    }

    // ── Phase 4: Indexing highlight [0.75 - 0.95] ──
    const idxP = easedSub(progress, 0.75, 0.88);
    if (idxP > 0) {
      // Re-draw grid at full alpha so it stays visible
      drawGrid(ctx, data.mat, ox, oy, cellW, cellH, true, 1);

      // Highlight cell [1][2]
      const hx = ox + 2 * cellW;
      const hy = oy + 1 * cellH;
      ctx.save();
      ctx.globalAlpha = idxP;
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 3;
      ctx.strokeRect(hx - 1, hy - 1, cellW, cellH);
      ctx.restore();

      // Label with value
      const val = data.mat[1][2];
      fadeInText(ctx, `x[1, 2] = ${val.toFixed(1)}`, hx + cellW + 30, hy + cellH / 2, idxP, {
        color: colors.insight, font: `bold 13px ${fonts.mono}`,
      });
    }

    // ── Insight [0.95 - 1.00] ──
    const insightP = easedSub(progress, 0.95, 1.0);
    if (insightP > 0) {
      fadeInText(ctx, tx('scene2', 'insight'), W / 2, H - 35, insightP, {
        color: colors.insight, font: `bold 15px ${fonts.body}`,
      });
    }
  },
});
