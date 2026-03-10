// Scene 3: Importance Sampling
// Sample from proposal q, weight by p(x)/q(x). Dots from q with radius ∝ importance weight.

import { Scene } from '../../engine/scene';
import { colors, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateCurve, animateFill } from '../../engine/animation/graph';
import { formulaAppear } from '../../engine/animation/formula';
import { gaussian, clamp } from '../../engine/shared/math-utils';
import { mulberry32 } from '../_shared/flow-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

function generateGaussianSamples1D(n: number, mu: number, sigma: number, seed: number): number[] {
  const rng = mulberry32(seed);
  const samples: number[] = [];
  for (let i = 0; i < n; i++) {
    const u1 = rng() + 1e-10;
    const u2 = rng();
    samples.push(mu + sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2));
  }
  return samples;
}

export const scene3 = new Scene({
  id: () => tx('scene3', 'id'),
  duration: 24,
  narration: () => tx('scene3', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene3 as SceneText)?.subtitleCues ?? (text.es.scene3 as SceneText).subtitleCues,
  topic: () => tx('scene3', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene3', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Setup viewport
    r.setViewport(-5, 7, 0, 0.45);

    // Axes
    const axesP = easedSub(progress, 0.04, 0.14);
    if (axesP > 0) {
      ctx.globalAlpha = axesP;
      r.drawAxes({ xLabel: 'x', xTicks: 6, yTicks: 3 });
      ctx.globalAlpha = 1;
    }

    // Target p(x) = N(2, 1) (shifted right)
    const pMu = 2, pSigma = 1;
    const pFn = (x: number) => gaussian(x, pMu, pSigma);

    // Proposal q(x) = N(0, 1.5) (wider, centered at 0)
    const qMu = 0, qSigma = 1.5;
    const qFn = (x: number) => gaussian(x, qMu, qSigma);

    // Draw p(x)
    const pProg = easedSub(progress, 0.08, 0.22);
    if (pProg > 0) {
      animateFill(r, pFn, colors.accent + '18', pProg);
      animateCurve(r, pFn, colors.accent, pProg, 2.5);
    }
    fadeInText(ctx, tx('scene3', 'targetLabel'), r.toX(pMu + 1.8), r.toY(0.32), easedSub(progress, 0.15, 0.22), {
      color: colors.accent, font: `bold 11px ${fonts.body}`
    });

    // Draw q(x)
    const qProg = easedSub(progress, 0.18, 0.32);
    if (qProg > 0) {
      animateFill(r, qFn, colors.insight + '12', qProg);
      animateCurve(r, qFn, colors.insight, qProg, 2);
    }
    fadeInText(ctx, tx('scene3', 'proposalLabel'), r.toX(qMu - 2.5), r.toY(0.22), easedSub(progress, 0.25, 0.32), {
      color: colors.insight, font: `bold 11px ${fonts.body}`
    });

    // Formula
    formulaAppear(state.formulaManager, 'is-formula',
      'E_p[f(x)] = E_q\\!\\left[f(x)\\,\\frac{p(x)}{q(x)}\\right]',
      50, 12, easedSub(progress, 0.28, 0.4), { color: colors.textPrimary, fontSize: '0.95em' });

    // Sample dots from q with importance weights
    const nSamples = 40;
    const samples = generateGaussianSamples1D(nSamples, qMu, qSigma, 123);

    const dotProg = easedSub(progress, 0.4, 0.82);
    if (dotProg > 0) {
      const nVisible = Math.max(1, Math.floor(dotProg * nSamples));

      for (let i = 0; i < nVisible; i++) {
        const xi = samples[i];
        if (xi < -5 || xi > 7) continue;

        const pVal = pFn(xi);
        const qVal = qFn(xi);
        const weight = qVal > 1e-10 ? pVal / qVal : 0;

        // Radius proportional to importance weight (clamped)
        const baseRadius = 3;
        const radius = baseRadius + clamp(weight, 0, 5) * 2.5;

        const px = r.toX(xi);
        const py = r.toY(0) + 5; // Just below x-axis

        // Color encodes weight: low weight = dim, high weight = bright
        const alpha = clamp(0.3 + weight * 0.15, 0.2, 0.9);
        const dotAge = Math.min(1, (nVisible - i) / 3 + 0.5);

        ctx.beginPath();
        ctx.arc(px, py, radius * easeOut(Math.min(dotAge, 1)), 0, Math.PI * 2);
        ctx.fillStyle = colors.warning;
        ctx.globalAlpha = alpha;
        ctx.fill();

        // Small weight label for first few visible dots
        if (i < 8 && dotAge > 0.5) {
          ctx.fillStyle = colors.textMuted;
          ctx.globalAlpha = alpha * 0.8;
          ctx.font = `9px ${fonts.body}`;
          ctx.textAlign = 'center';
          ctx.fillText(`w=${weight.toFixed(1)}`, px, py + radius + 12);
        }
      }
      ctx.globalAlpha = 1;
    }

    // Weight label
    fadeInText(ctx, tx('scene3', 'weightLabel'), W / 2, H - 15, easedSub(progress, 0.85, 1), {
      color: colors.warning, font: `bold 12px ${fonts.body}`
    });
  }
});
