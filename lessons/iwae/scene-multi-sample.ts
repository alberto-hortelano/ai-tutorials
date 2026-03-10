// Scene 2: Multiple Samples — K=5 samples vs 1 sample from q, posterior coverage

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { gaussian } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// Fixed sample positions for determinism
const SINGLE_SAMPLE = 2.0;
const MULTI_SAMPLES = [0.8, 1.6, 2.3, 3.1, 3.8];
const SAMPLE_COLORS = [series[0], series[1], series[2], series[3], series[4]];

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
    fadeInText(ctx, tx('scene2', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`,
    });

    // Layout: two panels side by side
    const panelY = H * 0.16;
    const panelH = H * 0.55;
    const leftX = W * 0.05;
    const leftW = W * 0.42;
    const rightX = W * 0.53;
    const rightW = W * 0.42;

    // Data range
    const zMin = -1, zMax = 6;

    function zToX(z: number, px: number, pw: number): number {
      return px + ((z - zMin) / (zMax - zMin)) * pw;
    }

    // Posterior (true) — mixture of two Gaussians
    function posteriorPdf(z: number): number {
      return 0.6 * gaussian(z, 2.0, 0.8) + 0.4 * gaussian(z, 3.5, 0.6);
    }

    // q (approximate) — single Gaussian
    function qPdf(z: number): number {
      return gaussian(z, 2.3, 1.1);
    }

    // Helper: draw curve in a panel
    function drawPanelCurve(
      fn: (z: number) => number, px: number, pw: number,
      curveColor: string, alpha: number, fillAlpha: number,
    ) {
      const steps = 100;
      const maxVal = 0.55;

      // Fill
      if (fillAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = fillAlpha;
        ctx.fillStyle = curveColor;
        ctx.beginPath();
        ctx.moveTo(zToX(zMin, px, pw), panelY + panelH);
        for (let i = 0; i <= steps; i++) {
          const z = zMin + (i / steps) * (zMax - zMin);
          const val = fn(z);
          const cy = panelY + panelH - (val / maxVal) * panelH * 0.85;
          ctx.lineTo(zToX(z, px, pw), cy);
        }
        ctx.lineTo(zToX(zMax, px, pw), panelY + panelH);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Outline
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = curveColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const z = zMin + (i / steps) * (zMax - zMin);
        const val = fn(z);
        const cy = panelY + panelH - (val / maxVal) * panelH * 0.85;
        if (i === 0) ctx.moveTo(zToX(z, px, pw), cy);
        else ctx.lineTo(zToX(z, px, pw), cy);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Phase 1: Left panel — single sample
    const leftP = easedSub(progress, 0.05, 0.3);
    if (leftP > 0) {
      // Panel label
      fadeInText(ctx, tx('scene2', 'singleLabel'), leftX + leftW / 2, panelY - 10, leftP, {
        color: colors.textMuted, font: `12px ${fonts.body}`,
      });

      // Axis
      ctx.save();
      ctx.globalAlpha = leftP;
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(leftX, panelY + panelH);
      ctx.lineTo(leftX + leftW, panelY + panelH);
      ctx.stroke();
      ctx.restore();

      // q curve
      drawPanelCurve(qPdf, leftX, leftW, series[0], leftP, leftP * 0.15);

      // Posterior (dashed)
      ctx.save();
      ctx.globalAlpha = leftP * 0.5;
      ctx.setLineDash([4, 4]);
      drawPanelCurve(posteriorPdf, leftX, leftW, colors.warning, leftP * 0.5, 0);
      ctx.setLineDash([]);
      ctx.restore();

      // Single dot
      const dotP = easedSub(progress, 0.2, 0.35);
      if (dotP > 0) {
        const dx = zToX(SINGLE_SAMPLE, leftX, leftW);
        const dy = panelY + panelH - 15;
        ctx.save();
        ctx.globalAlpha = easeOut(dotP);
        ctx.beginPath();
        ctx.arc(dx, dy, 7 * easeOut(dotP), 0, Math.PI * 2);
        ctx.fillStyle = series[0];
        ctx.fill();
        ctx.strokeStyle = colors.textPrimary;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }
    }

    // Phase 2: Right panel — K=5 samples
    const rightP = easedSub(progress, 0.3, 0.55);
    if (rightP > 0) {
      // Panel label
      fadeInText(ctx, tx('scene2', 'multiLabel'), rightX + rightW / 2, panelY - 10, rightP, {
        color: colors.textMuted, font: `12px ${fonts.body}`,
      });

      // Axis
      ctx.save();
      ctx.globalAlpha = rightP;
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rightX, panelY + panelH);
      ctx.lineTo(rightX + rightW, panelY + panelH);
      ctx.stroke();
      ctx.restore();

      // q curve
      drawPanelCurve(qPdf, rightX, rightW, series[0], rightP, rightP * 0.15);

      // Posterior (dashed)
      ctx.save();
      ctx.globalAlpha = rightP * 0.5;
      ctx.setLineDash([4, 4]);
      drawPanelCurve(posteriorPdf, rightX, rightW, colors.warning, rightP * 0.5, 0);
      ctx.setLineDash([]);
      ctx.restore();

      // Multiple dots appearing sequentially
      for (let k = 0; k < MULTI_SAMPLES.length; k++) {
        const dp = easedSub(progress, 0.4 + k * 0.06, 0.5 + k * 0.06);
        if (dp > 0) {
          const dx = zToX(MULTI_SAMPLES[k], rightX, rightW);
          const dy = panelY + panelH - 15;
          ctx.save();
          ctx.globalAlpha = easeOut(dp);
          ctx.beginPath();
          ctx.arc(dx, dy, 6 * easeOut(dp), 0, Math.PI * 2);
          ctx.fillStyle = SAMPLE_COLORS[k];
          ctx.fill();
          ctx.strokeStyle = colors.textPrimary;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // Phase 3: Labels for curves
    const labelP = easedSub(progress, 0.6, 0.75);
    if (labelP > 0) {
      fadeInText(ctx, tx('scene2', 'qLabel'), rightX + rightW - 15, panelY + 20, labelP, {
        color: series[0], font: `bold 11px ${fonts.body}`, align: 'right' as CanvasTextAlign,
      });
      fadeInText(ctx, tx('scene2', 'posteriorLabel'), rightX + rightW - 15, panelY + 35, labelP, {
        color: colors.warning, font: `11px ${fonts.body}`, align: 'right' as CanvasTextAlign,
      });
    }

    // Phase 4: Coverage highlight
    const coverP = easedSub(progress, 0.78, 0.92);
    if (coverP > 0) {
      // Highlight coverage area on right panel with a subtle glow
      ctx.save();
      ctx.globalAlpha = coverP * 0.15;
      ctx.fillStyle = colors.insight;
      const coverLeft = zToX(MULTI_SAMPLES[0] - 0.3, rightX, rightW);
      const coverRight = zToX(MULTI_SAMPLES[4] + 0.3, rightX, rightW);
      ctx.fillRect(coverLeft, panelY + panelH * 0.3, coverRight - coverLeft, panelH * 0.65);
      ctx.restore();
    }

    // Insight
    const insightP = easedSub(progress, 0.92, 1.0);
    fadeInText(ctx, tx('scene2', 'topic').split('.')[0], W / 2, H - 16, insightP, {
      color: colors.insight, font: `bold 11px ${fonts.body}`,
    });
  },
});
