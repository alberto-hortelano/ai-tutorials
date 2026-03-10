// Scene 4: Tightening with K — animated bar growing toward ceiling as K increases

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// Simulated bound values: L_K approaches log p(x) with diminishing returns
function boundValue(k: number): number {
  // log p(x) = -85 (target ceiling), ELBO ~ -92
  // L_K ~ -92 + 7 * (1 - 1/sqrt(K))
  return -92 + 7 * (1 - 1 / Math.sqrt(k));
}

const LOG_PX = -85;
const K_VALUES = [1, 2, 5, 10, 20, 50];

export const scene4 = new Scene({
  id: () => tx('scene4', 'id'),
  duration: 20,
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

    // Chart layout
    const chartLeft = W * 0.18;
    const chartRight = W * 0.88;
    const chartTop = H * 0.18;
    const chartBottom = H * 0.78;
    const chartW = chartRight - chartLeft;
    const chartH = chartBottom - chartTop;

    // Value range
    const valMin = -94;
    const valMax = -83;

    function valToY(v: number): number {
      return chartBottom - ((v - valMin) / (valMax - valMin)) * chartH;
    }

    function kToX(idx: number): number {
      return chartLeft + (idx / (K_VALUES.length - 1)) * chartW;
    }

    // Phase 1: Axes
    const axP = easedSub(progress, 0.05, 0.18);
    if (axP > 0) {
      ctx.save();
      ctx.globalAlpha = axP;

      // Axes
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(chartLeft, chartTop);
      ctx.lineTo(chartLeft, chartBottom);
      ctx.lineTo(chartRight, chartBottom);
      ctx.stroke();

      // X-axis labels (K values)
      ctx.fillStyle = colors.textMuted;
      ctx.font = `11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let i = 0; i < K_VALUES.length; i++) {
        ctx.fillText(`K=${K_VALUES[i]}`, kToX(i), chartBottom + 5);
      }

      // Y-axis label
      ctx.save();
      ctx.translate(chartLeft - 30, chartTop + chartH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene4', 'boundLabel'), 0, 0);
      ctx.restore();

      ctx.restore();
    }

    // Phase 2: Ceiling line (log p(x))
    const ceilP = easedSub(progress, 0.12, 0.25);
    if (ceilP > 0) {
      const ceilY = valToY(LOG_PX);
      ctx.save();
      ctx.globalAlpha = ceilP * 0.7;
      ctx.strokeStyle = colors.textPrimary;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(chartLeft, ceilY);
      ctx.lineTo(chartLeft + chartW * easeOut(ceilP), ceilY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      fadeInText(ctx, tx('scene4', 'ceilingLabel'), chartRight + 5, ceilY, ceilP, {
        color: colors.textPrimary, font: `bold 11px ${fonts.body}`, align: 'left' as CanvasTextAlign,
      });
    }

    // Phase 3: Animated bars growing as K increases
    const barsStartP = 0.22;
    const barsEndP = 0.75;
    const animP = easedSub(progress, barsStartP, barsEndP);

    if (animP > 0) {
      const barW = chartW / (K_VALUES.length * 1.8);

      for (let i = 0; i < K_VALUES.length; i++) {
        const entryP = easedSub(progress, barsStartP + i * 0.08, barsStartP + i * 0.08 + 0.12);
        if (entryP > 0) {
          const bv = boundValue(K_VALUES[i]);
          const barTop = valToY(bv);
          const barH = chartBottom - barTop;
          const bx = kToX(i) - barW / 2;

          // Bar
          ctx.save();
          ctx.globalAlpha = easeOut(entryP) * 0.85;
          const t = i / (K_VALUES.length - 1);
          ctx.fillStyle = i === 0 ? series[0] : (i === K_VALUES.length - 1 ? colors.insight : series[0] + 'cc');
          ctx.fillRect(bx, chartBottom - barH * easeOut(entryP), barW, barH * easeOut(entryP));
          ctx.restore();

          // Value label
          if (entryP > 0.6) {
            fadeInText(ctx, bv.toFixed(1), bx + barW / 2, barTop - 8, (entryP - 0.6) * 2.5, {
              color: colors.textMuted, font: `10px ${fonts.body}`,
            });
          }
        }
      }
    }

    // Phase 4: Gap annotation (shrinking gap between last bar and ceiling)
    const gapAnnotP = easedSub(progress, 0.78, 0.92);
    if (gapAnnotP > 0) {
      const lastBv = boundValue(50);
      const lastBarTop = valToY(lastBv);
      const ceilY = valToY(LOG_PX);
      const midY = (lastBarTop + ceilY) / 2;
      const annotX = kToX(K_VALUES.length - 1) + 30;

      // Bracket-like lines
      ctx.save();
      ctx.globalAlpha = easeOut(gapAnnotP);
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(annotX - 5, ceilY);
      ctx.lineTo(annotX, ceilY);
      ctx.lineTo(annotX, lastBarTop);
      ctx.lineTo(annotX - 5, lastBarTop);
      ctx.stroke();
      ctx.restore();

      fadeInText(ctx, tx('scene4', 'gapLabel'), annotX + 8, midY, gapAnnotP, {
        color: colors.error, font: `bold 11px ${fonts.body}`, align: 'left' as CanvasTextAlign,
      });
    }

    // Insight
    const insightP = easedSub(progress, 0.93, 1.0);
    fadeInText(ctx, tx('scene4', 'topic').split('.')[0], W / 2, H - 16, insightP, {
      color: colors.insight, font: `bold 11px ${fonts.body}`,
    });
  },
});
