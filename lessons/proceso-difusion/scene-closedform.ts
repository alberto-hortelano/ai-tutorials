// Scene 3: Closed-Form Forward — direct jump to any timestep

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { betaScheduleLinear, alphaBarSchedule, gaussian } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

const T = 1000;
const betas = betaScheduleLinear(T);
const alphaBars = alphaBarSchedule(betas);

export const scene3 = new Scene({
  id: () => tx('scene3', 'id'),
  duration: 22,
  narration: () => tx('scene3', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene3 as SceneText)?.subtitleCues ?? (text.es.scene3 as SceneText).subtitleCues,
  topic: () => tx('scene3', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene3', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Formula: x_t = sqrt(alpha_bar) * x_0 + sqrt(1 - alpha_bar) * epsilon
    const formulaP = easedSub(progress, 0.08, 0.2);
    formulaAppear(state.formulaManager, 'closed-form', 'x_t = \\sqrt{\\bar\\alpha_t}\\, x_0 + \\sqrt{1-\\bar\\alpha_t}\\, \\varepsilon', 50, 16, formulaP, {
      color: colors.accent, fontSize: '1.1em',
    });

    // Mixing dial animation
    const dialP = easedSub(progress, 0.2, 0.8);
    const dialCenterX = W / 2;
    const dialCenterY = H * 0.42;
    const dialRadius = Math.min(W, H) * 0.16;

    if (dialP > 0) {
      ctx.save();
      const dialAlpha = Math.min(dialP * 3, 1);
      ctx.globalAlpha = dialAlpha;

      // Current alpha_bar value based on dial position
      const tIdx = Math.floor(dialP * (T - 1));
      const alphaBar = alphaBars[tIdx];
      const sqrtAb = Math.sqrt(alphaBar);
      const sqrtOneMinusAb = Math.sqrt(1 - alphaBar);

      // Dial arc background
      ctx.beginPath();
      ctx.arc(dialCenterX, dialCenterY, dialRadius, 0, Math.PI * 2);
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 8;
      ctx.stroke();

      // Signal portion (green arc)
      ctx.beginPath();
      ctx.arc(dialCenterX, dialCenterY, dialRadius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * sqrtAb);
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 8;
      ctx.stroke();

      // Noise portion (rose arc, rest)
      ctx.beginPath();
      ctx.arc(dialCenterX, dialCenterY, dialRadius, -Math.PI / 2 + Math.PI * 2 * sqrtAb, -Math.PI / 2 + Math.PI * 2);
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 8;
      ctx.stroke();

      // Center value
      ctx.fillStyle = colors.textPrimary;
      ctx.font = 'bold 14px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`t = ${tIdx}`, dialCenterX, dialCenterY - 10);

      ctx.fillStyle = colors.textMuted;
      ctx.font = '11px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(`\u0101 = ${alphaBar.toFixed(3)}`, dialCenterX, dialCenterY + 8);

      // Signal label
      ctx.fillStyle = colors.insight;
      ctx.font = 'bold 11px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${tx('scene3', 'signalLabel')}: ${(sqrtAb * 100).toFixed(0)}%`, dialCenterX - dialRadius - 14, dialCenterY - 10);

      // Noise label
      ctx.fillStyle = colors.error;
      ctx.textAlign = 'left';
      ctx.fillText(`${tx('scene3', 'noiseLabel')}: ${(sqrtOneMinusAb * 100).toFixed(0)}%`, dialCenterX + dialRadius + 14, dialCenterY - 10);

      // Dial label
      ctx.fillStyle = colors.warning;
      ctx.textAlign = 'center';
      ctx.font = '12px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(tx('scene3', 'dialLabel'), dialCenterX, dialCenterY + dialRadius + 20);

      ctx.restore();
    }

    // Visual: signal vs noise Gaussian curves below
    const curveP = easedSub(progress, 0.35, 0.75);
    if (curveP > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(curveP * 2, 1);

      const tIdx = Math.floor(dialP * (T - 1));
      const alphaBar = alphaBars[Math.min(tIdx, T - 1)];
      const sqrtAb = Math.sqrt(alphaBar);

      const curveY = H * 0.72;
      const curveH = H * 0.18;
      const curveX = W * 0.1;
      const curveW = W * 0.8;

      // Draw signal Gaussian (centered, scaled by sqrt(alpha_bar))
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const x = -3 + 6 * (i / 100);
        const y = gaussian(x, 0, 1) * sqrtAb;
        const px = curveX + (i / 100) * curveW;
        const py = curveY + curveH - y * curveH * 2.5;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Draw noise Gaussian (wider)
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const x = -3 + 6 * (i / 100);
        const sigma = Math.max(Math.sqrt(1 - alphaBar), 0.1);
        const y = gaussian(x, 0, sigma) * (1 - sqrtAb);
        const px = curveX + (i / 100) * curveW;
        const py = curveY + curveH - y * curveH * 2.5;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Mix label
      fadeInText(ctx, tx('scene3', 'mixLabel'), curveX + curveW / 2, curveY - 6, curveP, {
        color: colors.textMuted, font: '11px "Segoe UI", system-ui, sans-serif',
      });

      ctx.restore();
    }

    // Insight at the end
    const insightP = easedSub(progress, 0.85, 0.95);
    if (insightP > 0) {
      fadeInText(ctx, 'q(x_t | x_0) = N(sqrt(alpha_bar_t) x_0, (1 - alpha_bar_t) I)', W / 2, H - 25, insightP, {
        color: colors.accent, font: '12px "Segoe UI", system-ui, sans-serif',
      });
    }
  },
});
