// Scene 2: The Noise Schedule — linear vs cosine beta_t

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { betaScheduleLinear, betaScheduleCosine, alphaBarSchedule } from '../../engine/shared/math-utils';
import { drawScheduleCurve } from '../_shared/diffusion-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

const T = 200;
const betasLinear = betaScheduleLinear(T);
const betasCosine = betaScheduleCosine(T);
const alphaBarLinear = alphaBarSchedule(betasLinear);
const alphaBarCosine = alphaBarSchedule(betasCosine);

export const scene2 = new Scene({
  id: () => tx('scene2', 'id'),
  duration: 22,
  narration: () => tx('scene2', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene2 as SceneText)?.subtitleCues ?? (text.es.scene2 as SceneText).subtitleCues,
  topic: () => tx('scene2', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene2', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Left chart: beta_t schedules
    const leftX = W * 0.06;
    const chartW = W * 0.38;
    const chartY = 60;
    const chartH = H * 0.35;

    // beta_t label
    const betaLabelP = easedSub(progress, 0.06, 0.14);
    if (betaLabelP > 0) {
      fadeInText(ctx, tx('scene2', 'betaLabel'), leftX + chartW / 2, chartY - 8, betaLabelP, {
        color: colors.textSecondary, font: 'bold 13px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Linear beta
    const linearBetaP = easedSub(progress, 0.1, 0.35);
    drawScheduleCurve(ctx, betasLinear, leftX, chartY, chartW, chartH, linearBetaP, series[0], tx('scene2', 'linearLabel'));

    // Cosine beta
    const cosineBetaP = easedSub(progress, 0.2, 0.45);
    drawScheduleCurve(ctx, betasCosine, leftX, chartY, chartW, chartH, cosineBetaP, series[1], '');

    // Legend for beta chart
    const legendP = easedSub(progress, 0.35, 0.45);
    if (legendP > 0) {
      ctx.save();
      ctx.globalAlpha = legendP;
      const ly = chartY + chartH + 16;

      // Linear
      ctx.fillStyle = series[0];
      ctx.fillRect(leftX, ly, 12, 3);
      ctx.fillStyle = colors.textMuted;
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(tx('scene2', 'linearLabel'), leftX + 16, ly + 4);

      // Cosine
      ctx.fillStyle = series[1];
      ctx.fillRect(leftX + chartW * 0.45, ly, 12, 3);
      ctx.fillStyle = colors.textMuted;
      ctx.fillText(tx('scene2', 'cosineLabel'), leftX + chartW * 0.45 + 16, ly + 4);

      ctx.restore();
    }

    // Right chart: alpha_bar_t schedules
    const rightX = W * 0.56;

    // alpha_bar label
    const abLabelP = easedSub(progress, 0.35, 0.43);
    if (abLabelP > 0) {
      fadeInText(ctx, tx('scene2', 'alphaBarLabel'), rightX + chartW / 2, chartY - 8, abLabelP, {
        color: colors.textSecondary, font: 'bold 13px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Linear alpha_bar
    const linearAbP = easedSub(progress, 0.4, 0.6);
    drawScheduleCurve(ctx, alphaBarLinear, rightX, chartY, chartW, chartH, linearAbP, series[0], '');

    // Cosine alpha_bar
    const cosineAbP = easedSub(progress, 0.45, 0.65);
    drawScheduleCurve(ctx, alphaBarCosine, rightX, chartY, chartW, chartH, cosineAbP, series[1], '');

    // Comparison annotations at bottom
    const compY = chartY + chartH + 50;

    // Linear description
    const linDescP = easedSub(progress, 0.65, 0.78);
    if (linDescP > 0) {
      ctx.save();
      ctx.globalAlpha = linDescP;

      // Linear box
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      const boxW = W * 0.38;
      ctx.strokeRect(leftX, compY, boxW, 50);
      ctx.setLineDash([]);

      ctx.fillStyle = series[0];
      ctx.font = 'bold 12px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene2', 'linearLabel'), leftX + boxW / 2, compY + 18);
      ctx.fillStyle = colors.textMuted;
      ctx.font = '11px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(tx('scene2', 'linearDesc'), leftX + boxW / 2, compY + 36);

      ctx.restore();
    }

    // Cosine description
    const cosDescP = easedSub(progress, 0.72, 0.85);
    if (cosDescP > 0) {
      ctx.save();
      ctx.globalAlpha = cosDescP;

      ctx.strokeStyle = series[1];
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      const boxW = W * 0.38;
      ctx.strokeRect(rightX, compY, boxW, 50);
      ctx.setLineDash([]);

      ctx.fillStyle = series[1];
      ctx.font = 'bold 12px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene2', 'cosineLabel'), rightX + boxW / 2, compY + 18);
      ctx.fillStyle = colors.textMuted;
      ctx.font = '11px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(tx('scene2', 'cosineDesc'), rightX + boxW / 2, compY + 36);

      ctx.restore();
    }
  },
});
