// Scene 5: Parameter Savings
// Full table 2^n-1 vs factored chain 2n-1

import { Scene } from '../../engine/scene';
import { colors, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

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
    fadeInText(ctx, tx('scene5', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Formulas: Full table vs Chain
    const fP1 = easedSub(progress, 0.05, 0.18);
    if (fP1 > 0 && state.formulaManager) {
      formulaAppear(state.formulaManager, 'full',
        '\\text{Full: } 2^n - 1',
        25, 16, fP1, { color: colors.error, fontSize: '0.95em' });
    }

    const fP2 = easedSub(progress, 0.1, 0.22);
    if (fP2 > 0 && state.formulaManager) {
      formulaAppear(state.formulaManager, 'chain',
        '\\text{Chain: } 2n - 1',
        75, 16, fP2, { color: colors.insight, fontSize: '0.95em' });
    }

    // Side-by-side comparison bars for n=10
    const comp10P = easedSub(progress, 0.2, 0.5);
    if (comp10P > 0) {
      ctx.save();
      ctx.globalAlpha = comp10P;

      const secY = H * 0.28;
      const barMaxW = W * 0.35;
      const barH = 28;
      const labelX = W * 0.08;

      // n=10 header
      ctx.fillStyle = colors.accent;
      ctx.font = `bold 14px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('n = 10', W / 2, secY - 10);

      // Full table bar: 1023
      const fullBarW = barMaxW * easeOut(Math.min(comp10P * 1.3, 1));
      const fullX = W * 0.25;
      ctx.fillStyle = colors.error;
      ctx.fillRect(fullX, secY + 5, fullBarW, barH);

      ctx.fillStyle = colors.textPrimary;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'left';
      ctx.fillText(tx('scene5', 'fullLabel'), labelX, secY + 5 + barH / 2 + 4);

      ctx.fillStyle = colors.textPrimary;
      ctx.font = `bold 12px ${fonts.mono}`;
      ctx.textAlign = 'left';
      ctx.fillText('1,023', fullX + fullBarW + 8, secY + 5 + barH / 2 + 4);

      // Chain bar: 19
      const chainBarW = (19 / 1023) * barMaxW * easeOut(Math.min(comp10P * 1.3, 1));
      ctx.fillStyle = colors.insight;
      ctx.fillRect(fullX, secY + barH + 15, Math.max(chainBarW, 3), barH);

      ctx.fillStyle = colors.textPrimary;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'left';
      ctx.fillText(tx('scene5', 'factoredLabel'), labelX, secY + barH + 15 + barH / 2 + 4);

      ctx.fillStyle = colors.textPrimary;
      ctx.font = `bold 12px ${fonts.mono}`;
      ctx.fillText('19', fullX + Math.max(chainBarW, 3) + 8, secY + barH + 15 + barH / 2 + 4);

      ctx.restore();
    }

    // Side-by-side comparison for n=30
    const comp30P = easedSub(progress, 0.48, 0.78);
    if (comp30P > 0) {
      ctx.save();
      ctx.globalAlpha = comp30P;

      const secY = H * 0.56;
      const barMaxW = W * 0.35;
      const barH = 28;
      const labelX = W * 0.08;

      // n=30 header
      ctx.fillStyle = colors.accent;
      ctx.font = `bold 14px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('n = 30', W / 2, secY - 10);

      // Full table bar: 1,073,741,823 (takes full width + overflow indicator)
      const fullBarW = barMaxW * easeOut(Math.min(comp30P * 1.3, 1));
      const fullX = W * 0.25;
      ctx.fillStyle = colors.error;
      ctx.fillRect(fullX, secY + 5, fullBarW, barH);

      // Overflow arrows to indicate it keeps going
      const arrowP = easedSub(progress, 0.6, 0.72);
      if (arrowP > 0) {
        ctx.fillStyle = colors.error;
        const arrowX = fullX + fullBarW;
        const arrowY = secY + 5 + barH / 2;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY - barH / 2);
        ctx.lineTo(arrowX + 12, arrowY);
        ctx.lineTo(arrowX, arrowY + barH / 2);
        ctx.closePath();
        ctx.globalAlpha = comp30P * arrowP;
        ctx.fill();
        ctx.globalAlpha = comp30P;
      }

      ctx.fillStyle = colors.textPrimary;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'left';
      ctx.fillText(tx('scene5', 'fullLabel'), labelX, secY + 5 + barH / 2 + 4);

      ctx.fillStyle = colors.error;
      ctx.font = `bold 12px ${fonts.mono}`;
      ctx.textAlign = 'left';
      ctx.fillText('1.07 \u00d7 10\u2079', fullX + fullBarW + 18, secY + 5 + barH / 2 + 4);

      // Chain bar: 59
      const chainBarW = Math.max((59 / 1073741823) * barMaxW * 1000, 4) * easeOut(Math.min(comp30P * 1.3, 1));
      ctx.fillStyle = colors.insight;
      ctx.fillRect(fullX, secY + barH + 15, chainBarW, barH);

      ctx.fillStyle = colors.textPrimary;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'left';
      ctx.fillText(tx('scene5', 'factoredLabel'), labelX, secY + barH + 15 + barH / 2 + 4);

      ctx.fillStyle = colors.insight;
      ctx.font = `bold 12px ${fonts.mono}`;
      ctx.fillText('59', fullX + chainBarW + 8, secY + barH + 15 + barH / 2 + 4);

      ctx.restore();
    }

    // LINEAR! label
    const linearP = easedSub(progress, 0.72, 0.85);
    if (linearP > 0) {
      fadeInText(ctx, tx('scene5', 'linearLabel'), W * 0.78, H * 0.82, linearP, {
        color: colors.warning, font: `bold 18px ${fonts.body}`
      });
    }

    // "Exponential savings" summary
    const summaryP = easedSub(progress, 0.85, 0.97);
    if (summaryP > 0) {
      fadeInText(ctx, tx('scene5', 'savingsLabel'), W / 2, H - 18, summaryP, {
        color: colors.insight, font: `bold 14px ${fonts.body}`
      });
    }
  }
});
