// Scene 4: Hyvärinen's Trick — integration by parts eliminates true score

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene4 = new Scene({
  id: () => tx('scene4', 'id'),
  duration: 24,
  narration: () => tx('scene4', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene4 as SceneText)?.subtitleCues ?? (text.es.scene4 as SceneText).subtitleCues,
  topic: () => tx('scene4', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene4', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    const centerX = W / 2;

    // Before: need true score (shown in red as problem)
    const beforeP = easedSub(progress, 0.08, 0.28);
    if (beforeP > 0) {
      // Box for "before"
      const boxY = H * 0.18;
      r.box(W * 0.08, boxY, W * 0.84, 55, {
        fill: colors.panelBg, stroke: colors.error + '80', radius: 8,
      });
      fadeInText(ctx, tx('scene4', 'before'), centerX, boxY + 18, beforeP, {
        color: colors.error, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
      });
      formulaAppear(state.formulaManager, 'sm-hyv-before',
        'J = \\frac{1}{2} \\mathbb{E}_p\\left[\\| s_\\theta(x) - \\color{red}{\\nabla \\log p_{\\text{data}}} \\|^2\\right]',
        50, 26, beforeP, { color: colors.textSecondary, fontSize: '0.95em' });
    }

    // Magic wand: integration by parts
    const magicP = easedSub(progress, 0.28, 0.5);
    if (magicP > 0) {
      const arrowY1 = H * 0.35;
      const arrowY2 = H * 0.48;
      animateArrow(ctx, centerX, arrowY1, centerX, arrowY2, magicP, {
        color: colors.warning, headSize: 10, lineWidth: 2.5,
      });
      fadeInText(ctx, tx('scene4', 'magic'), centerX + 15, (arrowY1 + arrowY2) / 2, magicP, {
        color: colors.warning, font: 'bold 13px "Segoe UI", system-ui, sans-serif', align: 'left',
      });
    }

    // After: no true score needed (shown in green as solution)
    const afterP = easedSub(progress, 0.45, 0.68);
    if (afterP > 0) {
      const boxY = H * 0.52;
      r.box(W * 0.08, boxY, W * 0.84, 55, {
        fill: colors.panelBg, stroke: colors.insight + '80', radius: 8,
      });
      fadeInText(ctx, tx('scene4', 'after'), centerX, boxY + 18, afterP, {
        color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
      });
      formulaAppear(state.formulaManager, 'sm-hyv-after',
        'J = \\mathbb{E}_p\\left[ \\text{tr}(\\nabla s_\\theta) + \\frac{1}{2} \\| s_\\theta \\|^2 \\right] + \\text{const}',
        50, 60, afterP, { color: colors.insight, fontSize: '1.05em' });
    }

    // Highlight: true score eliminated
    const elimP = easedSub(progress, 0.65, 0.82);
    if (elimP > 0) {
      fadeInText(ctx, tx('scene4', 'eliminated'), centerX, H * 0.77, elimP, {
        color: colors.insight, font: 'bold 16px "Segoe UI", system-ui, sans-serif',
      });

      // Strikethrough on the "before" formula area
      ctx.save();
      ctx.globalAlpha = elimP * 0.6;
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(W * 0.15, H * 0.25);
      ctx.lineTo(W * 0.85, H * 0.25);
      ctx.stroke();
      ctx.restore();
    }

    // Two columns: what we need
    const summaryP = easedSub(progress, 0.8, 0.95);
    if (summaryP > 0) {
      const sumY = H * 0.87;
      fadeInText(ctx, 'tr(\u2207s_\u03b8)', W * 0.35, sumY, summaryP, {
        color: colors.info, font: 'bold 13px "Courier New", monospace',
      });
      fadeInText(ctx, '||s_\u03b8||^2', W * 0.65, sumY, summaryP, {
        color: colors.info, font: 'bold 13px "Courier New", monospace',
      });
      fadeInText(ctx, '+', W * 0.5, sumY, summaryP, {
        color: colors.textDimmed, font: '13px "Segoe UI", system-ui, sans-serif',
      });
    }
  },
});
