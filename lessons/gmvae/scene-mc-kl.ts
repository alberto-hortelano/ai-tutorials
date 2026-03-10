// Scene 4: Monte Carlo KL — estimate KL by sampling from q

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { gaussian, gaussianMixturePdf, logGaussian, logSumExp } from '../../engine/shared/math-utils';
import { mulberry32 } from '../_shared/flow-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// q(z|x) parameters (encoder output for one x)
const qMu = 0.8;
const qSigma = 0.6;

// Mixture prior parameters
const mixWeights = [0.2, 0.2, 0.2, 0.2, 0.2];
const mixMeans = [-2.5, -0.8, 0.8, 2.0, 3.2];
const mixStds = [0.5, 0.55, 0.5, 0.6, 0.5];

// Pre-generate L=10 samples from q
const L = 10;
const rng = mulberry32(123);
const samples: number[] = [];
for (let i = 0; i < L; i++) {
  const u1 = rng(), u2 = rng();
  const z = qMu + qSigma * Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
  samples.push(z);
}

// Compute log q(z) - log p(z) for each sample
function logMixture(z: number): number {
  const logTerms: number[] = [];
  for (let k = 0; k < mixWeights.length; k++) {
    logTerms.push(Math.log(mixWeights[k]) + logGaussian(z, mixMeans[k], mixStds[k]));
  }
  return logSumExp(logTerms);
}

const diffs: number[] = samples.map(z => logGaussian(z, qMu, qSigma) - logMixture(z));

// Running average at each step
const runningAvg: number[] = [];
let cumSum = 0;
for (let i = 0; i < L; i++) {
  cumSum += diffs[i];
  runningAvg.push(cumSum / (i + 1));
}

export const scene4 = new Scene({
  id: () => tx('scene4', 'id'),
  duration: 25,
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

    // Formula
    formulaAppear(state.formulaManager, 'mc-kl',
      'D_{KL} \\approx \\frac{1}{L}\\sum_{l=1}^{L}\\bigl[\\log q(z_l) - \\log p(z_l)\\bigr]',
      50, 13, easedSub(progress, 0.05, 0.2));

    // ── Top half: q(z) curve with sample drops ──
    const plotTop = H * 0.2;
    const plotBot = H * 0.52;
    const plotLeft = W * 0.12;
    const plotRight = W * 0.88;
    const plotW = plotRight - plotLeft;
    const plotH = plotBot - plotTop;

    const zMin = -4, zMax = 5;
    const yMax = 0.7;

    const toScreenX = (z: number) => plotLeft + ((z - zMin) / (zMax - zMin)) * plotW;
    const toScreenY = (val: number) => plotBot - (val / yMax) * plotH;

    // Draw axes for the curve plot
    const axesP = easedSub(progress, 0.1, 0.2);
    if (axesP > 0) {
      ctx.globalAlpha = axesP;
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(plotLeft, plotBot);
      ctx.lineTo(plotRight, plotBot);
      ctx.moveTo(plotLeft, plotTop);
      ctx.lineTo(plotLeft, plotBot);
      ctx.stroke();

      ctx.fillStyle = colors.textDimmed;
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('z', plotRight + 8, plotBot + 2);
      ctx.globalAlpha = 1;
    }

    // Draw q(z) curve
    const qCurveP = easedSub(progress, 0.15, 0.3);
    if (qCurveP > 0) {
      ctx.save();
      ctx.globalAlpha = qCurveP;
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 2;
      ctx.beginPath();
      const steps = 200;
      for (let i = 0; i <= steps; i++) {
        const z = zMin + (i / steps) * (zMax - zMin);
        const v = gaussian(z, qMu, qSigma);
        const px = toScreenX(z);
        const py = toScreenY(v);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.fillStyle = series[0];
      ctx.font = '11px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText('q(z)', toScreenX(qMu + qSigma * 1.5) + 5, toScreenY(gaussian(qMu + qSigma * 1.5, qMu, qSigma)) - 2);
      ctx.restore();
    }

    // Draw p(z) mixture curve (dashed)
    const pCurveP = easedSub(progress, 0.2, 0.35);
    if (pCurveP > 0) {
      ctx.save();
      ctx.globalAlpha = pCurveP * 0.7;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      const steps = 200;
      for (let i = 0; i <= steps; i++) {
        const z = zMin + (i / steps) * (zMax - zMin);
        const v = gaussianMixturePdf(z, mixWeights, mixMeans, mixStds);
        const px = toScreenX(z);
        const py = toScreenY(v);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.accent;
      ctx.font = '11px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText('p(z)', toScreenX(3.2) + 5, toScreenY(gaussianMixturePdf(3.2, mixWeights, mixMeans, mixStds)) - 2);
      ctx.restore();
    }

    // Drop sample dots one by one
    const samplesStart = 0.3;
    const samplesEnd = 0.7;
    const samplesRange = samplesEnd - samplesStart;

    for (let i = 0; i < L; i++) {
      const tStart = samplesStart + (i / L) * samplesRange;
      const tEnd = tStart + samplesRange / L;
      const dotP = easedSub(progress, tStart, tEnd);
      if (dotP <= 0) continue;

      const z = samples[i];
      const qVal = gaussian(z, qMu, qSigma);
      const px = toScreenX(z);
      const py = toScreenY(qVal);

      // Drop line from q curve to baseline
      ctx.save();
      ctx.globalAlpha = dotP * 0.4;
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px, plotBot);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Dot on q curve
      ctx.beginPath();
      ctx.arc(px, py, 4 * easeOut(dotP), 0, Math.PI * 2);
      ctx.fillStyle = colors.warning;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // ── Bottom half: running average convergence ──
    const convPlotTop = H * 0.6;
    const convPlotBot = H * 0.88;
    const convPlotH = convPlotBot - convPlotTop;

    const convP = easedSub(progress, 0.4, 0.55);
    if (convP > 0) {
      ctx.globalAlpha = convP;

      // Axes
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(plotLeft, convPlotBot);
      ctx.lineTo(plotRight, convPlotBot);
      ctx.moveTo(plotLeft, convPlotTop);
      ctx.lineTo(plotLeft, convPlotBot);
      ctx.stroke();

      ctx.fillStyle = colors.textDimmed;
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('L (samples)', (plotLeft + plotRight) / 2, convPlotBot + 4);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('KL est.', plotLeft - 4, (convPlotTop + convPlotBot) / 2);

      ctx.globalAlpha = 1;
    }

    // Draw running average bars/line
    const finalKL = runningAvg[L - 1];
    const klMax = Math.max(...runningAvg.map(Math.abs)) * 1.5;
    const klMin = Math.min(0, ...runningAvg) - 0.5;

    for (let i = 0; i < L; i++) {
      const tStart = samplesStart + (i / L) * samplesRange;
      const tEnd = tStart + samplesRange / L;
      const barP = easedSub(progress, tStart + 0.02, tEnd + 0.05);
      if (barP <= 0) continue;

      const bx = plotLeft + ((i + 0.5) / L) * plotW;
      const barVal = runningAvg[i];
      const barNorm = (barVal - klMin) / (klMax - klMin);
      const barScreenY = convPlotBot - barNorm * convPlotH;

      // Bar
      ctx.fillStyle = colors.accent;
      ctx.globalAlpha = 0.7 * barP;
      const barW = (plotW / L) * 0.6;
      ctx.fillRect(bx - barW / 2, Math.min(barScreenY, convPlotBot), barW, Math.abs(convPlotBot - barScreenY) * easeOut(barP));
      ctx.globalAlpha = 1;

      // Value
      if (barP > 0.5) {
        ctx.fillStyle = colors.textMuted;
        ctx.font = '9px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.globalAlpha = (barP - 0.5) * 2;
        ctx.fillText(barVal.toFixed(2), bx, barScreenY - 3);
        ctx.globalAlpha = 1;
      }
    }

    // True KL reference line
    const refP = easedSub(progress, 0.65, 0.8);
    if (refP > 0) {
      const refNorm = (finalKL - klMin) / (klMax - klMin);
      const refY = convPlotBot - refNorm * convPlotH;
      ctx.save();
      ctx.globalAlpha = refP * 0.6;
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(plotLeft, refY);
      ctx.lineTo(plotRight, refY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Converges label
    const convLabelP = easedSub(progress, 0.8, 0.92);
    fadeInText(ctx, tx('scene4', 'convergesLabel'), W / 2, H - 22, convLabelP, {
      color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
    });
  },
});
