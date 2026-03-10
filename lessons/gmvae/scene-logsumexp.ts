// Scene 5: Log-Sum-Exp Trick — numerical stability for evaluating log p(z)

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { formulaAppear } from '../../engine/animation/formula';
import { logSumExp } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// Demo values
const naiveValues = [500, 501, 502];
const maxVal = Math.max(...naiveValues); // 502
const safeResult = logSumExp(naiveValues); // correct answer

export const scene5 = new Scene({
  id: () => tx('scene5', 'id'),
  duration: 22,
  narration: () => tx('scene5', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene5 as SceneText)?.subtitleCues ?? (text.es.scene5 as SceneText).subtitleCues,
  topic: () => tx('scene5', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene5', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // ── Phase 1: The problem — naive computation ──
    const naiveP = easedSub(progress, 0.08, 0.3);
    const naiveBoxX = W * 0.08;
    const naiveBoxY = H * 0.16;
    const naiveBoxW = W * 0.84;
    const naiveBoxH = H * 0.24;

    if (naiveP > 0) {
      ctx.globalAlpha = naiveP;

      // Box
      r.box(naiveBoxX, naiveBoxY, naiveBoxW, naiveBoxH, {
        fill: colors.panelBg, stroke: colors.error, radius: 8, lineWidth: 1.5,
      });

      // Label: Naive
      ctx.fillStyle = colors.error;
      ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(tx('scene5', 'naiveLabel'), naiveBoxX + 12, naiveBoxY + 10);

      // Expression
      ctx.fillStyle = colors.textSecondary;
      ctx.font = '13px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene5', 'exampleNaive'), naiveBoxX + naiveBoxW / 2, naiveBoxY + naiveBoxH * 0.45);

      // Show each exp() value
      const expY = naiveBoxY + naiveBoxH * 0.72;
      for (let i = 0; i < naiveValues.length; i++) {
        const segW = naiveBoxW / 3;
        const segX = naiveBoxX + segW * i + segW / 2;
        const expP = easedSub(progress, 0.15 + i * 0.03, 0.28 + i * 0.03);
        if (expP > 0) {
          ctx.fillStyle = colors.error;
          ctx.globalAlpha = naiveP * expP;
          ctx.font = '11px "Courier New", monospace';
          ctx.fillText(`e^${naiveValues[i]} = Inf!`, segX, expY);
        }
      }

      ctx.globalAlpha = 1;
    }

    // Overflow flash effect
    const overflowP = easedSub(progress, 0.25, 0.32);
    if (overflowP > 0 && overflowP < 1) {
      ctx.save();
      ctx.globalAlpha = (1 - overflowP) * 0.15;
      ctx.fillStyle = colors.error;
      ctx.fillRect(naiveBoxX, naiveBoxY, naiveBoxW, naiveBoxH);
      ctx.restore();
    }

    // ── Arrow from naive to trick ──
    const arrowP = easedSub(progress, 0.3, 0.4);
    if (arrowP > 0) {
      animateArrow(ctx, W / 2, naiveBoxY + naiveBoxH + 4, W / 2, naiveBoxY + naiveBoxH + 28, arrowP, {
        color: colors.textDimmed, lineWidth: 1.5, headSize: 7,
      });
    }

    // ── Phase 2: The trick — subtract max ──
    const trickP = easedSub(progress, 0.32, 0.55);
    const trickBoxY = naiveBoxY + naiveBoxH + 32;
    const trickBoxH = H * 0.3;

    if (trickP > 0) {
      ctx.globalAlpha = trickP;

      r.box(naiveBoxX, trickBoxY, naiveBoxW, trickBoxH, {
        fill: colors.panelBg, stroke: colors.insight, radius: 8, lineWidth: 1.5,
      });

      // Label: Trick
      ctx.fillStyle = colors.insight;
      ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(tx('scene5', 'trickLabel'), naiveBoxX + 12, trickBoxY + 10);

      // Step 1: find max
      const step1Y = trickBoxY + trickBoxH * 0.3;
      ctx.fillStyle = colors.warning;
      ctx.font = '12px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`m = max(${naiveValues.join(', ')}) = ${maxVal}`, naiveBoxX + naiveBoxW / 2, step1Y);

      // Step 2: subtract max
      const step2P = easedSub(progress, 0.4, 0.52);
      if (step2P > 0) {
        const step2Y = trickBoxY + trickBoxH * 0.52;
        ctx.globalAlpha = trickP * step2P;
        ctx.fillStyle = colors.textSecondary;
        ctx.fillText(tx('scene5', 'exampleSafe'), naiveBoxX + naiveBoxW / 2, step2Y);
      }

      // Step 3: safe values
      const step3P = easedSub(progress, 0.48, 0.58);
      if (step3P > 0) {
        const step3Y = trickBoxY + trickBoxH * 0.74;
        const safeExps = naiveValues.map(v => Math.exp(v - maxVal));
        ctx.globalAlpha = trickP * step3P;
        ctx.fillStyle = colors.insight;
        ctx.font = '11px "Courier New", monospace';
        const safeText = safeExps.map((v, i) => `e^${naiveValues[i] - maxVal}=${v.toFixed(3)}`).join('  ');
        ctx.fillText(safeText, naiveBoxX + naiveBoxW / 2, step3Y);
      }

      ctx.globalAlpha = 1;
    }

    // ── Phase 3: Formula ──
    formulaAppear(state.formulaManager, 'lse-formula',
      '\\log\\!\\sum_k e^{a_k} = m + \\log\\!\\sum_k e^{a_k - m}',
      50, 82, easedSub(progress, 0.55, 0.7));

    // ── Phase 4: Final result ──
    const resultP = easedSub(progress, 0.7, 0.85);
    if (resultP > 0) {
      const resY = H * 0.9;
      fadeInText(ctx, tx('scene5', 'resultLabel', safeResult.toFixed(4)), W / 2, resY, resultP, {
        color: colors.accent, font: 'bold 14px "Courier New", monospace',
      });
    }

    // Stable label
    const stableP = easedSub(progress, 0.85, 0.98);
    fadeInText(ctx, tx('scene5', 'stableLabel'), W / 2, H - 18, stableP, {
      color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
    });
  },
});
