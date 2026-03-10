// Scene 2: Why Scores? No Partition Function — cancellation animation

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene2 = new Scene({
  id: () => tx('scene2', 'id'),
  duration: 22,
  narration: () => tx('scene2', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene2 as SceneText)?.subtitleCues ?? (text.es.scene2 as SceneText).subtitleCues,
  topic: () => tx('scene2', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene2', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    const centerY = H * 0.35;
    const lineH = 50;

    // Step 1: The starting expression
    const step1P = easedSub(progress, 0.08, 0.3);
    if (step1P > 0) {
      formulaAppear(state.formulaManager, 'sm-nopart-1',
        '\\nabla_x \\log p(x) = \\nabla_x \\log \\frac{e^{-E(x)}}{Z}',
        50, 30, step1P, { color: colors.textSecondary, fontSize: '1.15em' });
    }

    // Step 2: Split into two terms
    const step2P = easedSub(progress, 0.25, 0.48);
    if (step2P > 0) {
      formulaAppear(state.formulaManager, 'sm-nopart-2',
        '= \\nabla_x \\left[ -E(x) \\right] - \\nabla_x \\log Z',
        50, 44, step2P, { color: colors.textSecondary, fontSize: '1.15em' });
    }

    // Step 3: ∇log Z = 0 with highlight
    const step3P = easedSub(progress, 0.42, 0.62);
    if (step3P > 0) {
      formulaAppear(state.formulaManager, 'sm-nopart-3',
        '= -\\nabla_x E(x) - \\underbrace{\\nabla_x \\log Z}_{\\text{= 0 (const wrt } x\\text{)}}',
        50, 58, step3P, { color: colors.accent, fontSize: '1.15em' });
    }

    // Cancellation effect: strikethrough animation on the log Z term
    const cancelP = easedSub(progress, 0.55, 0.72);
    if (cancelP > 0) {
      // Draw a red line across a zone to symbolize cancellation
      const crossX1 = W * 0.52;
      const crossX2 = W * 0.82;
      const crossY = H * 0.58;
      ctx.save();
      ctx.globalAlpha = cancelP;
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(crossX1, crossY);
      ctx.lineTo(crossX1 + (crossX2 - crossX1) * easeOut(cancelP), crossY);
      ctx.stroke();
      ctx.restore();

      fadeInText(ctx, tx('scene2', 'cancellation'), W / 2, H * 0.68, cancelP, {
        color: colors.insight, font: 'bold 16px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Step 4: Final result
    const resultP = easedSub(progress, 0.7, 0.88);
    if (resultP > 0) {
      formulaAppear(state.formulaManager, 'sm-nopart-result',
        's(x) = -\\nabla_x E(x)',
        50, 80, resultP, { color: colors.insight, fontSize: '1.4em' });
    }

    // Bottom insight
    const insightP = easedSub(progress, 0.88, 1);
    fadeInText(ctx, tx('scene2', 'result'), W / 2, H - 25, insightP, {
      color: colors.insight, font: 'bold 14px "Courier New", monospace',
    });
  },
});
