// Scene 6: The Variational Idea — approximate p(z|x) with q_phi(z|x), minimize KL

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { gaussian } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// True posterior: irregular, multi-modal shape
function truePosterior(z: number): number {
  return 0.35 * gaussian(z, -1.0, 0.5) +
         0.45 * gaussian(z, 1.2, 0.7) +
         0.2 * gaussian(z, 3.0, 0.4);
}

// Approximation q: single Gaussian that adjusts to fit
function qApprox(z: number, mu: number, sigma: number): number {
  return gaussian(z, mu, sigma);
}

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
    fadeInText(ctx, tx('scene6', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Plot area
    const plotLeft = W * 0.1;
    const plotRight = W * 0.85;
    const plotW = plotRight - plotLeft;
    const plotTop = H * 0.2;
    const plotBottom = H * 0.7;
    const plotH = plotBottom - plotTop;
    const zMin = -3, zMax = 5;

    const toX = (z: number) => plotLeft + ((z - zMin) / (zMax - zMin)) * plotW;
    const toY = (val: number, maxVal: number) => plotBottom - (val / maxVal) * plotH;

    // Find max for scaling
    let maxTrue = 0;
    for (let z = zMin; z <= zMax; z += 0.05) {
      const v = truePosterior(z);
      if (v > maxTrue) maxTrue = v;
    }
    const scaleFactor = maxTrue * 1.15;

    // Phase 1: Draw axes
    const axesP = easedSub(progress, 0.05, 0.15);
    if (axesP > 0) {
      ctx.save();
      ctx.globalAlpha = axesP;
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(plotLeft, plotBottom);
      ctx.lineTo(plotRight, plotBottom);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(plotLeft, plotBottom);
      ctx.lineTo(plotLeft, plotTop);
      ctx.stroke();

      // z axis label
      ctx.fillStyle = colors.textMuted;
      ctx.font = `11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('z', plotLeft + plotW / 2, plotBottom + 18);
      ctx.restore();
    }

    // Phase 2: True posterior p(z|x) — irregular curve
    const trueP = easedSub(progress, 0.1, 0.35);
    if (trueP > 0) {
      ctx.save();
      ctx.globalAlpha = trueP;

      // Fill
      ctx.fillStyle = series[2] + '20';
      ctx.beginPath();
      ctx.moveTo(toX(zMin), plotBottom);
      const steps = 120;
      for (let i = 0; i <= steps; i++) {
        const z = zMin + (i / steps) * (zMax - zMin);
        const val = truePosterior(z);
        ctx.lineTo(toX(z), toY(val, scaleFactor));
      }
      ctx.lineTo(toX(zMax), plotBottom);
      ctx.closePath();
      ctx.fill();

      // Curve
      ctx.strokeStyle = series[2];
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const z = zMin + (i / steps) * (zMax - zMin);
        const val = truePosterior(z);
        const px = toX(z);
        const py = toY(val, scaleFactor);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Label
      fadeInText(ctx, tx('scene6', 'trueLabel'), plotRight - 10, plotTop + 10, trueP, {
        color: series[2], font: `bold 11px ${fonts.body}`, align: 'right'
      });

      ctx.restore();
    }

    // Phase 3: q_phi approximation — Gaussian that adjusts
    // q moves from poor fit to good fit as progress advances
    const qStartP = easedSub(progress, 0.3, 0.45);
    const qFitP = easedSub(progress, 0.45, 0.85);

    if (qStartP > 0) {
      // q parameters animate: start at mu=0, sigma=2 (wide, centered), move towards mu=0.8, sigma=1.2 (better fit)
      const muStart = 0, muEnd = 0.8;
      const sigStart = 2.0, sigEnd = 1.2;
      const mu = muStart + (muEnd - muStart) * qFitP;
      const sigma = sigStart + (sigEnd - sigStart) * qFitP;

      ctx.save();
      ctx.globalAlpha = qStartP;

      // Find max of q for this configuration
      let maxQ = 0;
      const steps = 120;
      for (let i = 0; i <= steps; i++) {
        const z = zMin + (i / steps) * (zMax - zMin);
        const val = qApprox(z, mu, sigma);
        if (val > maxQ) maxQ = val;
      }

      // Fill
      ctx.fillStyle = series[0] + '18';
      ctx.beginPath();
      ctx.moveTo(toX(zMin), plotBottom);
      for (let i = 0; i <= steps; i++) {
        const z = zMin + (i / steps) * (zMax - zMin);
        const val = qApprox(z, mu, sigma);
        ctx.lineTo(toX(z), toY(val, scaleFactor));
      }
      ctx.lineTo(toX(zMax), plotBottom);
      ctx.closePath();
      ctx.fill();

      // Curve
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const z = zMin + (i / steps) * (zMax - zMin);
        const val = qApprox(z, mu, sigma);
        const px = toX(z);
        const py = toY(val, scaleFactor);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      fadeInText(ctx, tx('scene6', 'approxLabel'), plotRight - 10, plotTop + 28, qStartP, {
        color: series[0], font: `bold 11px ${fonts.body}`, align: 'right'
      });

      ctx.restore();
    }

    // Phase 4: KL gap visualization — shaded area between curves
    const gapP = easedSub(progress, 0.5, 0.85);
    if (gapP > 0) {
      const mu = 0 + 0.8 * qFitP;
      const sigma = 2.0 + (1.2 - 2.0) * qFitP;

      ctx.save();
      ctx.globalAlpha = gapP * 0.3;

      // Shade the difference area
      const steps = 120;
      ctx.fillStyle = colors.warning + '40';
      ctx.beginPath();
      ctx.moveTo(toX(zMin), plotBottom);
      for (let i = 0; i <= steps; i++) {
        const z = zMin + (i / steps) * (zMax - zMin);
        const pVal = truePosterior(z);
        const qVal = qApprox(z, mu, sigma);
        const maxVal = Math.max(pVal, qVal);
        ctx.lineTo(toX(z), toY(maxVal, scaleFactor));
      }
      ctx.lineTo(toX(zMax), plotBottom);
      // Go back via min
      for (let i = steps; i >= 0; i--) {
        const z = zMin + (i / steps) * (zMax - zMin);
        const pVal = truePosterior(z);
        const qVal = qApprox(z, mu, sigma);
        const minVal = Math.min(pVal, qVal);
        ctx.lineTo(toX(z), toY(minVal, scaleFactor));
      }
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // KL gap label with diminishing gap indicator
      const klLabelY = plotBottom + 35;
      const gapText = tx('scene6', 'gapLabel');
      fadeInText(ctx, gapText, W / 2, klLabelY, gapP, {
        color: colors.warning, font: `bold 12px ${fonts.body}`
      });

      // Visual KL bar shrinking
      const barLeft = W * 0.3;
      const barW = W * 0.4;
      const barH = 8;
      const barY = klLabelY + 14;
      const klAmount = 1 - qFitP * 0.65; // shrinks as q improves

      ctx.save();
      ctx.globalAlpha = gapP;

      // Background bar
      ctx.fillStyle = colors.axis + '40';
      ctx.fillRect(barLeft, barY, barW, barH);

      // KL bar (shrinking)
      ctx.fillStyle = colors.warning;
      ctx.fillRect(barLeft, barY, barW * klAmount, barH);

      // Label
      ctx.fillStyle = colors.textMuted;
      ctx.font = `10px ${fonts.body}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('KL', barLeft + barW * klAmount + 6, barY + barH / 2);

      ctx.restore();
    }

    // Phase 5: Formula
    const fP = easedSub(progress, 0.82, 0.96);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'variational',
        'q_\\phi(\\mathbf{z} \\mid \\mathbf{x}) \\approx p(\\mathbf{z} \\mid \\mathbf{x})',
        50, 14, fP, { color: colors.accent, fontSize: '1.1em' });
    }
  }
});
