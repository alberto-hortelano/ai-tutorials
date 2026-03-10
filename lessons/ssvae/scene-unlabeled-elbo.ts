// Scene 4: ELBO for Unlabeled Data — sum over classes, weighted bars, entropy term

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// Example class weights q(y|x) for a 4-class problem
const Q_WEIGHTS = [0.05, 0.60, 0.25, 0.10];
const CLASS_LABELS = ['y=0', 'y=1', 'y=2', 'y=3'];
const CLASS_COLORS = [series[0], series[1], series[2], series[3]];

// ELBO per class (negative, closer to 0 is better)
const CLASS_ELBOS = [-12.3, -8.5, -10.1, -14.0];

export const scene4 = new Scene({
  id: () => tx('scene4', 'id'),
  duration: 22,
  narration: () => tx('scene4', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene4 as SceneText)?.subtitleCues ?? (text.es.scene4 as SceneText).subtitleCues,
  topic: () => tx('scene4', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene4', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`,
    });

    // Formula
    const f1P = easedSub(progress, 0.06, 0.25);
    if (f1P > 0) {
      formulaAppear(state.formulaManager, 'unlabeled-elbo',
        '-\\mathcal{U}(\\mathbf{x}) = \\sum_y q(y|\\mathbf{x})\\,[-\\mathcal{L}(\\mathbf{x},y)] + \\mathcal{H}(q(y|\\mathbf{x}))',
        50, 20, f1P, { color: colors.textPrimary, fontSize: '0.95em' });
    }

    // Bar chart area
    const barAreaX = W * 0.1;
    const barAreaY = H * 0.36;
    const barAreaW = W * 0.55;
    const barAreaH = H * 0.42;

    // Phase 1: Class bars (weighted)
    const barsP = easedSub(progress, 0.2, 0.55);
    if (barsP > 0) {
      const barW = barAreaW * 0.15;
      const gap = barAreaW * 0.08;
      const totalW = 4 * barW + 3 * gap;
      const startX = barAreaX + (barAreaW - totalW) / 2;

      // Axis line
      ctx.save();
      ctx.globalAlpha = barsP;
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(barAreaX, barAreaY + barAreaH);
      ctx.lineTo(barAreaX + barAreaW, barAreaY + barAreaH);
      ctx.stroke();
      ctx.restore();

      for (let i = 0; i < 4; i++) {
        const bp = easedSub(progress, 0.22 + i * 0.06, 0.35 + i * 0.06);
        if (bp > 0) {
          const bx = startX + i * (barW + gap);

          // Bar height proportional to q(y|x) weight
          const maxBarH = barAreaH * 0.85;
          const bh = maxBarH * Q_WEIGHTS[i] * easeOut(bp);

          // Bar
          ctx.save();
          ctx.globalAlpha = easeOut(bp) * 0.8;
          ctx.fillStyle = CLASS_COLORS[i];
          ctx.fillRect(bx, barAreaY + barAreaH - bh, barW, bh);
          ctx.restore();

          // Class label below
          ctx.save();
          ctx.globalAlpha = easeOut(bp);
          ctx.fillStyle = CLASS_COLORS[i];
          ctx.font = `bold 10px ${fonts.body}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(CLASS_LABELS[i], bx + barW / 2, barAreaY + barAreaH + 4);
          ctx.restore();

          // Weight label above bar
          if (bp > 0.5) {
            ctx.save();
            ctx.globalAlpha = (bp - 0.5) * 2;
            ctx.fillStyle = colors.textMuted;
            ctx.font = `9px ${fonts.body}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(`q=${Q_WEIGHTS[i].toFixed(2)}`, bx + barW / 2, barAreaY + barAreaH - bh - 3);
            ctx.restore();
          }
        }
      }

      // Sum label
      fadeInText(ctx, tx('scene4', 'sumLabel'), barAreaX + barAreaW / 2, barAreaY - 8, easedSub(progress, 0.35, 0.48), {
        color: colors.textMuted, font: `11px ${fonts.body}`,
      });
    }

    // Phase 2: Weight explanation (right side)
    const weightP = easedSub(progress, 0.5, 0.65);
    if (weightP > 0) {
      const explX = W * 0.7;
      const explY = H * 0.4;

      fadeInText(ctx, tx('scene4', 'weightLabel'), explX, explY, weightP, {
        color: colors.accent, font: `bold 12px ${fonts.body}`,
      });

      // Show weighted ELBO for each class
      for (let i = 0; i < 4; i++) {
        const ep = easedSub(progress, 0.52 + i * 0.03, 0.6 + i * 0.03);
        if (ep > 0) {
          const ey = explY + 20 + i * 18;
          const weighted = Q_WEIGHTS[i] * CLASS_ELBOS[i];

          ctx.save();
          ctx.globalAlpha = easeOut(ep);
          ctx.fillStyle = CLASS_COLORS[i];
          ctx.font = `10px ${fonts.body}`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${CLASS_LABELS[i]}: ${Q_WEIGHTS[i].toFixed(2)} \u00d7 (${CLASS_ELBOS[i].toFixed(1)}) = ${weighted.toFixed(2)}`, explX - 15, ey);
          ctx.restore();
        }
      }
    }

    // Phase 3: Entropy term
    const entrP = easedSub(progress, 0.68, 0.82);
    if (entrP > 0) {
      const entrY = H * 0.72;
      const entrX = W * 0.7;

      // Compute entropy
      let H_q = 0;
      for (const w of Q_WEIGHTS) {
        if (w > 0) H_q -= w * Math.log2(w);
      }

      // Entropy box
      ctx.save();
      ctx.globalAlpha = easeOut(entrP) * 0.8;
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 1.5;
      const boxW = W * 0.26;
      const boxH = 40;
      ctx.fillRect(entrX - 15, entrY - boxH / 2, boxW, boxH);
      ctx.strokeRect(entrX - 15, entrY - boxH / 2, boxW, boxH);
      ctx.restore();

      fadeInText(ctx, tx('scene4', 'entropyLabel'), entrX - 15 + boxW / 2, entrY - 6, entrP, {
        color: colors.warning, font: `bold 11px ${fonts.body}`,
      });

      fadeInText(ctx, `= ${H_q.toFixed(3)} bits`, entrX - 15 + boxW / 2, entrY + 10, entrP, {
        color: colors.textMuted, font: `10px ${fonts.body}`,
      });
    }

    // Insight
    const insightP = easedSub(progress, 0.9, 1.0);
    fadeInText(ctx, tx('scene4', 'topic').split('.')[0], W / 2, H - 16, insightP, {
      color: colors.insight, font: `bold 11px ${fonts.body}`,
    });
  },
});
