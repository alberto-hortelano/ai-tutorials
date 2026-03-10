// Scene 1: The Curse of Joint Distributions
// Exponential growth of parameters for n binary variables

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene1 = new Scene({
  id: () => tx('scene1', 'id'),
  duration: 20,
  narration: () => tx('scene1', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene1 as SceneText)?.subtitleCues ?? (text.es.scene1 as SceneText).subtitleCues,
  topic: () => tx('scene1', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene1', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Formula: 2^n - 1 parameters
    const formulaP = easedSub(progress, 0.05, 0.2);
    if (formulaP > 0 && state.formulaManager) {
      formulaAppear(state.formulaManager, 'curse',
        'p(x_1, \\ldots, x_n) \\;\\text{needs}\\; 2^n - 1 \\;\\text{params}',
        50, 18, formulaP, { color: colors.accent, fontSize: '1em' });
    }

    // Small examples: n=2, n=3 as mini-tables
    const smallP = easedSub(progress, 0.15, 0.35);
    if (smallP > 0) {
      ctx.save();
      ctx.globalAlpha = smallP;

      // n=2 table
      const t2x = W * 0.18;
      const t2y = H * 0.38;
      ctx.fillStyle = colors.accent;
      ctx.font = `bold 13px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('n = 2', t2x, t2y - 30);

      // Draw small grid for n=2 (4 entries, 3 free params)
      const cellW = 28, cellH = 20;
      const labels2 = ['00', '01', '10', '11'];
      for (let i = 0; i < 4; i++) {
        const cx = t2x - cellW + (i % 2) * cellW;
        const cy = t2y - 10 + Math.floor(i / 2) * cellH;
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1;
        ctx.strokeRect(cx, cy, cellW, cellH);
        ctx.fillStyle = colors.textMuted;
        ctx.font = `10px ${fonts.mono}`;
        ctx.fillText(labels2[i], cx + cellW / 2, cy + cellH / 2 + 3);
      }
      ctx.fillStyle = series[0];
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.fillText('3 params', t2x, t2y + 42);

      // n=3 table
      const t3x = W * 0.5;
      const t3y = H * 0.38;
      ctx.fillStyle = colors.accent;
      ctx.font = `bold 13px ${fonts.body}`;
      ctx.fillText('n = 3', t3x, t3y - 30);

      const labels3 = ['000', '001', '010', '011', '100', '101', '110', '111'];
      for (let i = 0; i < 8; i++) {
        const cx = t3x - cellW * 2 + (i % 4) * cellW;
        const cy = t3y - 10 + Math.floor(i / 4) * cellH;
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1;
        ctx.strokeRect(cx, cy, cellW, cellH);
        ctx.fillStyle = colors.textMuted;
        ctx.font = `10px ${fonts.mono}`;
        ctx.fillText(labels3[i], cx + cellW / 2, cy + cellH / 2 + 3);
      }
      ctx.fillStyle = series[0];
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.fillText('7 params', t3x, t3y + 42);

      ctx.restore();
    }

    // Bar chart showing exponential growth
    const barsP = easedSub(progress, 0.35, 0.7);
    if (barsP > 0) {
      ctx.save();
      ctx.globalAlpha = barsP;

      const chartX = W * 0.08;
      const chartY = H * 0.58;
      const chartW = W * 0.84;
      const chartH = H * 0.3;

      // Y-axis label
      fadeInText(ctx, tx('scene1', 'paramsLabel'), chartX - 5, chartY + chartH / 2, barsP, {
        color: colors.textMuted, font: `11px ${fonts.body}`
      });

      // Draw bars manually for log-scale visual effect
      const barLabels = ['n=2', 'n=3', 'n=5', 'n=10', 'n=20', 'n=30'];
      const displayHeights = [3, 7, 31, 1023, 1048575, 1073741823];
      // Use log scale for display
      const maxLog = Math.log10(1073741823);
      const n = barLabels.length;
      const barW = (chartW * 0.6) / n;
      const gap = barW * 0.35;
      const totalW = n * barW + (n - 1) * gap;
      const startX = chartX + (chartW - totalW) / 2;

      for (let i = 0; i < n; i++) {
        const x = startX + i * (barW + gap);
        const logH = Math.log10(displayHeights[i] + 1) / maxLog;
        const barH = logH * chartH * 0.85 * Math.min(barsP * 1.5 - i * 0.08, 1);
        if (barH <= 0) continue;
        const y = chartY + chartH - barH;

        // Color gradient: blue for small, red/warning for large
        ctx.fillStyle = i < 3 ? series[0] : i < 5 ? colors.warning : colors.error;
        ctx.fillRect(x, y, barW, barH);

        // Label below
        ctx.fillStyle = colors.textDimmed;
        ctx.font = `11px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(barLabels[i], x + barW / 2, chartY + chartH + 4);

        // Value above bar
        if (barsP > 0.4) {
          ctx.fillStyle = colors.textMuted;
          ctx.font = `9px ${fonts.mono}`;
          ctx.textBaseline = 'bottom';
          const valStr = displayHeights[i] > 999999 ? displayHeights[i].toExponential(0) : String(displayHeights[i]);
          ctx.fillText(valStr, x + barW / 2, y - 2);
        }
      }

      ctx.restore();
    }

    // "Impossible!" label for large n
    const impP = easedSub(progress, 0.75, 0.92);
    if (impP > 0) {
      fadeInText(ctx, tx('scene1', 'impossibleLabel'), W * 0.78, H * 0.62, impP, {
        color: colors.error, font: `bold 14px ${fonts.body}`
      });
    }
  }
});
