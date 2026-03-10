// Scene 1: Estimating Expectations by Sampling
// E_p[f(x)] ≈ (1/N) Σ f(xi), dots drop from p, running average converges

import { Scene } from '../../engine/scene';
import { colors, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateCurve, animateFill } from '../../engine/animation/graph';
import { formulaAppear } from '../../engine/animation/formula';
import { gaussian } from '../../engine/shared/math-utils';
import { mulberry32 } from '../_shared/flow-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// Pre-generate samples from a Gaussian via inverse-CDF-like accept/reject using seeded RNG
function generateSamples(n: number, mu: number, sigma: number, seed: number): number[] {
  const rng = mulberry32(seed);
  const samples: number[] = [];
  // Box-Muller for 1D Gaussian
  for (let i = 0; i < n; i++) {
    const u1 = rng() + 1e-10;
    const u2 = rng();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    samples.push(mu + sigma * z);
  }
  return samples;
}

export const scene1 = new Scene({
  id: () => tx('scene1', 'id'),
  duration: 22,
  narration: () => tx('scene1', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene1 as SceneText)?.subtitleCues ?? (text.es.scene1 as SceneText).subtitleCues,
  topic: () => tx('scene1', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene1', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // --- Top panel: p(x) and f(x) curves ---
    r.setViewport(-4, 4, 0, 0.5);

    // Axes
    const axesP = easedSub(progress, 0.04, 0.14);
    if (axesP > 0) {
      ctx.globalAlpha = axesP;
      r.drawAxes({ xLabel: 'x', yLabel: '', xTicks: 4, yTicks: 3 });
      ctx.globalAlpha = 1;
    }

    // p(x) = N(0, 1)
    const pFn = (x: number) => gaussian(x, 0, 1);
    const curveProg = easedSub(progress, 0.08, 0.2);
    if (curveProg > 0) {
      animateFill(r, pFn, colors.accent + '20', curveProg);
      animateCurve(r, pFn, colors.accent, curveProg, 2.5);
    }

    // p(x) label
    fadeInText(ctx, tx('scene1', 'pLabel'), r.toX(1.8), r.toY(0.3), easedSub(progress, 0.15, 0.22), {
      color: colors.accent, font: `bold 12px ${fonts.body}`
    });

    // f(x) = x^2 (rescaled to fit)
    const fFn = (x: number) => x * x * 0.04;
    const fCurveProg = easedSub(progress, 0.15, 0.28);
    if (fCurveProg > 0) {
      animateCurve(r, fFn, colors.insight, fCurveProg, 2);
    }

    // f(x) label
    fadeInText(ctx, tx('scene1', 'fLabel') + ' = x^2', r.toX(-2.5), r.toY(0.28), easedSub(progress, 0.2, 0.28), {
      color: colors.insight, font: `bold 11px ${fonts.body}`
    });

    // Formula overlay
    formulaAppear(state.formulaManager, 'mc-formula',
      'E_p[f(x)] \\approx \\frac{1}{N}\\sum_{i=1}^{N} f(x_i)',
      50, 12, easedSub(progress, 0.22, 0.35), { color: colors.textPrimary, fontSize: '1em' });

    // --- Sampling animation ---
    const mu = 0, sigma = 1;
    const maxN = 100;
    const allSamples = generateSamples(maxN, mu, sigma, 42);
    // True E[x^2] for N(0,1) = sigma^2 = 1
    const trueExpectation = 1.0;

    // Number of visible samples based on progress [0.3, 0.85]
    const sampleProg = easedSub(progress, 0.3, 0.85);
    const nVisible = Math.max(1, Math.floor(sampleProg * maxN));

    // Draw sample dots dropping onto x-axis
    if (sampleProg > 0) {
      for (let i = 0; i < nVisible; i++) {
        const xi = allSamples[i];
        if (xi < -4 || xi > 4) continue;
        const px = r.toX(xi);
        const py = r.toY(0);
        const dotAlpha = Math.min(1, (nVisible - i) / 5 + 0.3);
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = colors.warning;
        ctx.globalAlpha = dotAlpha * 0.7;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // --- Bottom panel: running average plot ---
    const bottomTop = H * 0.55;
    const bottomH = H * 0.35;
    const margin = 55;
    const plotRight = W - 25;
    const plotW = plotRight - margin;

    if (sampleProg > 0) {
      // Axes for running average
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(margin, bottomTop + bottomH);
      ctx.lineTo(plotRight, bottomTop + bottomH);
      ctx.moveTo(margin, bottomTop);
      ctx.lineTo(margin, bottomTop + bottomH);
      ctx.stroke();

      // True value horizontal line
      const trueY = bottomTop + bottomH - (trueExpectation / 3) * bottomH;
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(margin, trueY);
      ctx.lineTo(plotRight, trueY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label for true value
      fadeInText(ctx, tx('scene1', 'trueValue'), plotRight - 5, trueY - 10, easedSub(progress, 0.35, 0.42), {
        color: colors.error, font: `10px ${fonts.body}`, align: 'right'
      });

      // Compute running averages
      const averages: number[] = [];
      let sum = 0;
      for (let i = 0; i < nVisible; i++) {
        const xi = allSamples[i];
        sum += xi * xi; // f(x) = x^2
        averages.push(sum / (i + 1));
      }

      // Draw running average line
      ctx.beginPath();
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2;
      for (let i = 0; i < averages.length; i++) {
        const px = margin + (i / maxN) * plotW;
        const val = Math.min(averages[i], 3);
        const py = bottomTop + bottomH - (val / 3) * bottomH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Running average label
      fadeInText(ctx, tx('scene1', 'runningAvg'), W / 2, bottomTop - 5, easedSub(progress, 0.33, 0.4), {
        color: colors.insight, font: `bold 11px ${fonts.body}`
      });

      // N counter
      fadeInText(ctx, tx('scene1', 'nLabel', String(nVisible)), margin + 10, bottomTop + bottomH + 18, easedSub(progress, 0.32, 0.38), {
        color: colors.textMuted, font: `11px ${fonts.body}`, align: 'left'
      });

      // x-axis label
      ctx.fillStyle = colors.textDimmed;
      ctx.font = `10px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('N', margin + plotW / 2, bottomTop + bottomH + 18);
    }
  }
});
