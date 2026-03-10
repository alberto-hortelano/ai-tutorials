// Scene 2: The Chain Rule
// Exact factorization but still O(2^n) total parameters

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene2 = new Scene({
  id: () => tx('scene2', 'id'),
  duration: 20,
  narration: () => tx('scene2', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene2 as SceneText)?.subtitleCues ?? (text.es.scene2 as SceneText).subtitleCues,
  topic: () => tx('scene2', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene2', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Chain rule formula via KaTeX
    const formulaP = easedSub(progress, 0.05, 0.2);
    if (formulaP > 0 && state.formulaManager) {
      formulaAppear(state.formulaManager, 'chain',
        'p(x_1, \\ldots, x_n) = \\prod_{i=1}^{n} p(x_i \\mid x_1, \\ldots, x_{i-1})',
        50, 17, formulaP, { color: colors.accent, fontSize: '1em' });
    }

    // Animated factor boxes appearing one by one
    const factors = [
      { label: () => tx('scene2', 'factor1'), params: '1', start: 0.15, end: 0.3 },
      { label: () => tx('scene2', 'factor2'), params: '2', start: 0.25, end: 0.4 },
      { label: () => tx('scene2', 'factor3'), params: '4', start: 0.35, end: 0.5 },
      { label: () => tx('scene2', 'factorN'), params: '2^(n-1)', start: 0.45, end: 0.6 },
    ];

    const boxY = H * 0.38;
    const boxH = 50;
    const boxW = W * 0.18;
    const totalBoxW = factors.length * boxW + (factors.length - 1) * 12;
    const startX = (W - totalBoxW) / 2;

    for (let i = 0; i < factors.length; i++) {
      const f = factors[i];
      const fP = easedSub(progress, f.start, f.end);
      if (fP <= 0) continue;

      const bx = startX + i * (boxW + 12);
      const by = boxY;

      ctx.save();
      ctx.globalAlpha = fP;

      // Box
      ctx.strokeStyle = i < 3 ? series[0] : colors.warning;
      ctx.lineWidth = 2;
      ctx.fillStyle = colors.panelBg;
      ctx.beginPath();
      const rad = 6;
      ctx.moveTo(bx + rad, by);
      ctx.arcTo(bx + boxW, by, bx + boxW, by + boxH, rad);
      ctx.arcTo(bx + boxW, by + boxH, bx, by + boxH, rad);
      ctx.arcTo(bx, by + boxH, bx, by, rad);
      ctx.arcTo(bx, by, bx + boxW, by, rad);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Factor label
      ctx.fillStyle = i < 3 ? series[0] : colors.warning;
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(f.label(), bx + boxW / 2, by + boxH * 0.38);

      // Params count below
      ctx.fillStyle = colors.textMuted;
      ctx.font = `10px ${fonts.mono}`;
      ctx.fillText(f.params + ' params', bx + boxW / 2, by + boxH * 0.72);

      ctx.restore();

      // Multiplication dot between boxes
      if (i > 0 && fP > 0.5) {
        ctx.save();
        ctx.globalAlpha = (fP - 0.5) * 2;
        ctx.fillStyle = colors.textMuted;
        ctx.font = `bold 16px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u00b7', bx - 6, by + boxH / 2);
        ctx.restore();
      }
    }

    // Dots (...) between factor3 and factorN
    const dotsP = easedSub(progress, 0.4, 0.5);
    if (dotsP > 0) {
      const dotX = startX + 2.5 * (boxW + 12) + boxW / 2;
      ctx.save();
      ctx.globalAlpha = dotsP;
      ctx.fillStyle = colors.textMuted;
      ctx.font = `bold 14px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u2026', dotX, boxY + boxH / 2);
      ctx.restore();
    }

    // "Exact" label with checkmark
    const exactP = easedSub(progress, 0.3, 0.45);
    if (exactP > 0) {
      fadeInText(ctx, '\u2713 ' + tx('scene2', 'exactLabel'), W * 0.15, boxY + boxH + 30, exactP, {
        color: colors.insight, font: `bold 13px ${fonts.body}`
      });
    }

    // "But..." section
    const butP = easedSub(progress, 0.55, 0.7);
    if (butP > 0) {
      fadeInText(ctx, tx('scene2', 'butLabel'), W / 2, H * 0.66, butP, {
        color: colors.warning, font: `bold 16px ${fonts.body}`
      });
    }

    // Parameter count breakdown
    const breakdownP = easedSub(progress, 0.65, 0.85);
    if (breakdownP > 0) {
      ctx.save();
      ctx.globalAlpha = breakdownP;

      // Draw parameter count bars growing
      const counts = [1, 2, 4, 8, 16];
      const barY = H * 0.73;
      const barMaxH = H * 0.15;
      const barW = 30;
      const barGap = 15;
      const totalBarW = counts.length * barW + (counts.length - 1) * barGap;
      const barStartX = (W - totalBarW) / 2;
      const maxCount = 16;

      for (let i = 0; i < counts.length; i++) {
        const x = barStartX + i * (barW + barGap);
        const h = (counts[i] / maxCount) * barMaxH * easeOut(Math.min(breakdownP * 1.5 - i * 0.1, 1));
        if (h <= 0) continue;

        ctx.fillStyle = i < 3 ? series[0] : colors.warning;
        ctx.fillRect(x, barY + barMaxH - h, barW, h);

        // Labels
        ctx.fillStyle = colors.textDimmed;
        ctx.font = `10px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const labels = ['p(x\u2081)', 'p(x\u2082|..)', 'p(x\u2083|..)', 'p(x\u2084|..)', 'p(x\u2085|..)'];
        ctx.fillText(labels[i], x + barW / 2, barY + barMaxH + 4);

        ctx.textBaseline = 'bottom';
        ctx.fillStyle = colors.textMuted;
        ctx.font = `9px ${fonts.mono}`;
        ctx.fillText(String(counts[i]), x + barW / 2, barY + barMaxH - h - 2);
      }

      ctx.restore();
    }

    // Total still O(2^n)
    const totalP = easedSub(progress, 0.85, 0.97);
    if (totalP > 0) {
      fadeInText(ctx, tx('scene2', 'totalLabel'), W / 2, H - 18, totalP, {
        color: colors.error, font: `bold 14px ${fonts.body}`
      });
    }
  }
});
