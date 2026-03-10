// Scene 1: Stretching space — uniform dots stretch, density compresses
// Enhanced: shows compression doubling density, then stretch halving density

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut, easeInOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { sampleUniform1D } from '../_shared/flow-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene1 = new Scene({
  id: () => tx('scene1', 'id'),
  duration: 20,
  narration: () => tx('scene1', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene1 as SceneText)?.subtitleCues ?? (text.es.scene1 as SceneText).subtitleCues,
  topic: () => tx('scene1', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene1', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    const samples = sampleUniform1D(30, 0, 4, 7);
    const lineY = H * 0.3;
    const pdfTop = H * 0.44;
    const pdfH = H * 0.38;

    // Phase 1: compress to half (0.15-0.35), Phase 2: stretch to double (0.4-0.6)
    const compressT = easedSub(progress, 0.15, 0.35, easeInOut);
    const stretchT = easedSub(progress, 0.4, 0.6, easeInOut);

    // Factor goes: 1 -> 0.5 (compress), then 0.5 -> 2 (stretch through original)
    let factor: number;
    if (progress < 0.38) {
      factor = 1 - compressT * 0.5; // 1 -> 0.5
    } else {
      factor = 0.5 + stretchT * 1.5; // 0.5 -> 2.0
    }

    // Number line margin
    const margin = W * 0.08;
    const lineW = W - 2 * margin;
    const maxVal = 8;
    const toScreen = (v: number) => margin + (v / maxVal) * lineW;

    // Draw number line
    const lineP = easedSub(progress, 0.05, 0.15);
    if (lineP > 0) {
      ctx.globalAlpha = lineP;
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(margin, lineY);
      ctx.lineTo(margin + lineW, lineY);
      ctx.stroke();

      // Ticks
      for (let v = 0; v <= maxVal; v++) {
        const sx = toScreen(v);
        ctx.beginPath();
        ctx.moveTo(sx, lineY - 5);
        ctx.lineTo(sx, lineY + 5);
        ctx.stroke();
        ctx.fillStyle = colors.textMuted;
        ctx.font = `10px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(String(v), sx, lineY + 18);
      }
      ctx.globalAlpha = 1;
    }

    // Draw dots on line
    const dotsP = easedSub(progress, 0.08, 0.2);
    if (dotsP > 0) {
      for (const s of samples) {
        const val = s * factor;
        const sx = toScreen(val);
        ctx.beginPath();
        ctx.arc(sx, lineY, 4 * easeOut(Math.min(dotsP * 2, 1)), 0, Math.PI * 2);
        ctx.fillStyle = series[0];
        ctx.globalAlpha = 0.8;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Labels above dots — show current state
    if (compressT <= 0.01 && stretchT <= 0.01) {
      fadeInText(ctx, tx('scene1', 'before'), W / 2, lineY - 25, easedSub(progress, 0.1, 0.2), {
        color: colors.textSecondary, font: `12px ${fonts.body}`
      });
    }
    if (compressT > 0.5 && stretchT <= 0.01) {
      fadeInText(ctx, tx('scene1', 'compressLabel'), W / 2, lineY - 25, easedSub(progress, 0.3, 0.38), {
        color: colors.warning, font: `bold 12px ${fonts.body}`
      });
    }
    if (stretchT > 0.5) {
      fadeInText(ctx, tx('scene1', 'after'), W / 2, lineY - 25, easedSub(progress, 0.55, 0.63), {
        color: colors.insight, font: `12px ${fonts.body}`
      });
    }

    // PDF panel
    const pdfP = easedSub(progress, 0.12, 0.25);
    if (pdfP > 0) {
      ctx.globalAlpha = pdfP;

      const currentEnd = 4 * factor;
      const currentH = 1 / currentEnd; // area = 1

      // Axes
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(margin, pdfTop + pdfH);
      ctx.lineTo(margin + lineW, pdfTop + pdfH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(margin, pdfTop + pdfH);
      ctx.lineTo(margin, pdfTop);
      ctx.stroke();

      // y-axis label
      ctx.fillStyle = colors.textMuted;
      ctx.font = `10px ${fonts.body}`;
      ctx.textAlign = 'right';
      ctx.fillText('p(x)', margin - 5, pdfTop + 5);

      // y-axis density reference marks
      const pdfYScale = pdfH / 0.65;
      const refDensities = [0.125, 0.25, 0.5];
      for (const d of refDensities) {
        const ry = pdfTop + pdfH - d * pdfYScale;
        if (ry > pdfTop - 5) {
          ctx.strokeStyle = colors.textDimmed;
          ctx.lineWidth = 0.5;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(margin, ry);
          ctx.lineTo(margin + 20, ry);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = colors.textDimmed;
          ctx.font = `9px ${fonts.mono}`;
          ctx.textAlign = 'right';
          ctx.fillText(d.toString(), margin - 3, ry + 3);
        }
      }

      // PDF rectangle
      const rectH = currentH * pdfYScale;
      const rectW = toScreen(currentEnd) - margin;

      ctx.fillStyle = series[0] + '30';
      ctx.fillRect(margin, pdfTop + pdfH - rectH, rectW, rectH);
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 2;
      ctx.strokeRect(margin, pdfTop + pdfH - rectH, rectW, rectH);

      // Density value label on top of the rectangle
      ctx.fillStyle = colors.textPrimary;
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(`p(x) = ${currentH.toFixed(3)}`, margin + rectW / 2, pdfTop + pdfH - rectH - 10);

      ctx.globalAlpha = 1;
    }

    // "Density DOUBLES" callout during compression
    const compressCallP = easedSub(progress, 0.32, 0.4);
    if (compressCallP > 0 && stretchT < 0.1) {
      fadeInText(ctx, tx('scene1', 'densityDoubles'), W * 0.72, pdfTop + 20, compressCallP, {
        color: colors.warning, font: `bold 13px ${fonts.body}`
      });
    }

    // "Density HALVES" callout during stretching
    const stretchCallP = easedSub(progress, 0.58, 0.68);
    if (stretchCallP > 0) {
      fadeInText(ctx, tx('scene1', 'densityHalves'), W * 0.72, pdfTop + 20, stretchCallP, {
        color: colors.insight, font: `bold 13px ${fonts.body}`
      });
    }

    // Area = 1 label
    const areaP = easedSub(progress, 0.65, 0.78);
    fadeInText(ctx, tx('scene1', 'areaLabel'), W / 2, pdfTop + pdfH + 20, areaP, {
      color: colors.warning, font: `bold 12px ${fonts.body}`
    });

    // Insight: density conservation
    const insP = easedSub(progress, 0.85, 1);
    fadeInText(ctx, tx('scene1', 'insight'), W / 2, H - 18, insP, {
      color: colors.insight, font: `bold 12px ${fonts.body}`
    });
  }
});
