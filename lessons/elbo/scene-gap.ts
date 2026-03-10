// Scene 6: The Gap — log p(x) = ELBO + D_KL(q||p(z|x))

import { Scene } from '../../engine/scene';
import { colors, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut, easeInOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { roundRect } from '../../engine/shared/canvas-utils';
import { lerp } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene6 = new Scene({
  id: () => tx('scene6', 'id'),
  duration: 24,
  narration: () => tx('scene6', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene6 as SceneText)?.subtitleCues ?? (text.es.scene6 as SceneText).subtitleCues,
  topic: () => tx('scene6', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene6', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`,
    });

    // Main formula: log p(x) = ELBO + KL(q || p(z|x))
    const fP = easedSub(progress, 0.05, 0.22);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'gap-eq',
        '\\log p(\\mathbf{x}) = \\underbrace{\\text{ELBO}}_{\\textcolor{#34d399}{\\leq \\log p(\\mathbf{x})}} + \\underbrace{D_{\\text{KL}}\\!\\left(q(\\mathbf{z}|\\mathbf{x}) \\,\\|\\, p(\\mathbf{z}|\\mathbf{x})\\right)}_{\\textcolor{#f87171}{\\geq\\, 0}}',
        50, 20, fP, { color: colors.textPrimary, fontSize: '0.95em' });
    }

    // Stacked bar chart visualization
    const barRegionLeft = W * 0.15;
    const barW = W * 0.22;
    const barBottom = H * 0.82;
    const totalBarH = H * 0.42;

    // Animated gap shrinking over time
    const shrinkT = easedSub(progress, 0.55, 0.85, easeInOut);
    const gapFraction = lerp(0.45, 0.12, shrinkT);
    const elboFraction = 1 - gapFraction;

    const elboH = totalBarH * elboFraction;
    const gapH = totalBarH * gapFraction;

    // Three stages of the bar (initial, improved, optimized)
    const nBars = 3;
    const barSpacing = W * 0.22;
    const gapFractions = [0.45, 0.25, 0.08];

    const barsP = easedSub(progress, 0.2, 0.55);
    if (barsP > 0) {
      for (let b = 0; b < nBars; b++) {
        const barP = easedSub(progress, 0.2 + b * 0.1, 0.45 + b * 0.1);
        if (barP <= 0) continue;

        const bx = barRegionLeft + b * barSpacing;
        const gFrac = gapFractions[b];
        const eFrac = 1 - gFrac;
        const eH = totalBarH * eFrac * easeOut(barP);
        const gH = totalBarH * gFrac * easeOut(barP);

        ctx.save();
        ctx.globalAlpha = barP;

        // ELBO portion (green, bottom)
        roundRect(ctx, bx, barBottom - eH, barW, eH, 0);
        ctx.fillStyle = colors.insight + 'cc';
        ctx.fill();

        // Gap portion (red, top)
        roundRect(ctx, bx, barBottom - eH - gH, barW, gH, 0);
        ctx.fillStyle = colors.error + 'aa';
        ctx.fill();

        // Outer border
        ctx.strokeStyle = colors.textDimmed;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, barBottom - eH - gH, barW, eH + gH);

        // Divider line between ELBO and gap
        ctx.strokeStyle = colors.textPrimary;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.moveTo(bx, barBottom - eH);
        ctx.lineTo(bx + barW, barBottom - eH);
        ctx.stroke();
        ctx.setLineDash([]);

        // Labels inside bars
        if (eH > 20) {
          ctx.fillStyle = colors.textPrimary;
          ctx.font = `bold 10px ${fonts.body}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tx('scene6', 'elboBar'), bx + barW / 2, barBottom - eH / 2);
        }
        if (gH > 16) {
          ctx.fillStyle = colors.textPrimary;
          ctx.font = `bold 10px ${fonts.body}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tx('scene6', 'gapBar'), bx + barW / 2, barBottom - eH - gH / 2);
        }

        // Total label at top
        ctx.fillStyle = colors.accent;
        ctx.font = `11px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(tx('scene6', 'totalLabel'), bx + barW / 2, barBottom - eH - gH - 6);

        // Progress label at bottom
        const qLabels = ['q\u2080', 'q\u2081', 'q*'];
        ctx.fillStyle = colors.textMuted;
        ctx.font = `11px ${fonts.body}`;
        ctx.textBaseline = 'top';
        ctx.fillText(qLabels[b], bx + barW / 2, barBottom + 6);

        ctx.restore();
      }

      // Horizontal arrows showing improvement between bars
      const arrowP = easedSub(progress, 0.45, 0.6);
      if (arrowP > 0) {
        ctx.save();
        ctx.globalAlpha = arrowP;
        for (let i = 0; i < nBars - 1; i++) {
          const ax1 = barRegionLeft + i * barSpacing + barW + 6;
          const ax2 = barRegionLeft + (i + 1) * barSpacing - 6;
          const ay = barBottom + 14;
          ctx.strokeStyle = colors.textDimmed;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(ax1, ay);
          ctx.lineTo(ax2, ay);
          ctx.stroke();
          ctx.fillStyle = colors.textDimmed;
          ctx.beginPath();
          ctx.moveTo(ax2, ay);
          ctx.lineTo(ax2 - 6, ay - 3);
          ctx.lineTo(ax2 - 6, ay + 3);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // Key insight: KL >= 0 therefore ELBO <= log p(x)
    const insightP = easedSub(progress, 0.62, 0.8);
    if (insightP > 0) {
      const insY = H * 0.45;
      const insX = W * 0.78;

      ctx.save();
      ctx.globalAlpha = insightP;
      const bw = W * 0.35;
      const bh = 42;
      roundRect(ctx, insX - bw / 2, insY - bh / 2, bw, bh, 8);
      ctx.fillStyle = colors.panelBg;
      ctx.fill();
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = colors.warning;
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene6', 'gapExplain'), insX, insY);
      ctx.restore();
    }

    // Bottom insight: better q -> smaller gap
    const bottomP = easedSub(progress, 0.85, 0.96);
    fadeInText(ctx, tx('scene6', 'improveQ'), W / 2, H - 22, bottomP, {
      color: colors.insight, font: `bold 13px ${fonts.body}`,
    });
  },
});
