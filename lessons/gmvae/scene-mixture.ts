// Scene 2: Mixture of Gaussians Prior — single Gaussian splits into K=5 colored Gaussians

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { gaussian, gaussianMixturePdf, lerp } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// Mixture parameters for K=5 components
const K = 5;
const mixMeans = [-3.0, -1.2, 0.5, 2.0, 3.5];
const mixStds = [0.5, 0.6, 0.45, 0.55, 0.5];
const mixWeights = [0.2, 0.2, 0.2, 0.2, 0.2];

export const scene2 = new Scene({
  id: () => tx('scene2', 'id'),
  duration: 22,
  narration: () => tx('scene2', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene2 as SceneText)?.subtitleCues ?? (text.es.scene2 as SceneText).subtitleCues,
  topic: () => tx('scene2', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.setViewport(-5, 5, 0, 0.55);
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene2', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Axes
    const axesP = easedSub(progress, 0.05, 0.15);
    if (axesP > 0) {
      ctx.globalAlpha = axesP;
      r.drawAxes({ xLabel: 'z', yLabel: 'p(z)', xTicks: 5, yTicks: 4 });
      ctx.globalAlpha = 1;
    }

    // Phase 1: Draw single Gaussian that morphs into mixture
    const singleP = easedSub(progress, 0.12, 0.35);
    const morphP = easedSub(progress, 0.35, 0.65);

    if (singleP > 0 && morphP < 1) {
      // Single standard Gaussian
      const singleFn = (x: number) => gaussian(x, 0, 1.5);
      const remainAlpha = 1 - morphP;
      if (remainAlpha > 0) {
        ctx.globalAlpha = remainAlpha * singleP;
        r.drawCurve(singleFn, colors.textMuted, 2.5);
        ctx.globalAlpha = 1;
      }
    }

    // Label for single Gaussian
    if (singleP > 0 && morphP < 0.5) {
      const labelAlpha = singleP * (1 - morphP * 2);
      fadeInText(ctx, tx('scene2', 'singleLabel'), W / 2, r.toY(gaussian(0, 0, 1.5)) - 15, labelAlpha, {
        color: colors.textMuted, font: '11px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Phase 2: Individual components emerging
    if (morphP > 0) {
      for (let k = 0; k < K; k++) {
        const compDelay = k * 0.08;
        const compP = easedSub(progress, 0.35 + compDelay, 0.65 + compDelay);
        if (compP <= 0) continue;

        // Morph: component center goes from 0 to its final position
        const mu = lerp(0, mixMeans[k], compP);
        const sigma = lerp(1.5, mixStds[k], compP);
        const weight = lerp(1 / K, mixWeights[k], compP);

        const compFn = (x: number) => weight * gaussian(x, mu, sigma);

        ctx.globalAlpha = Math.min(compP * 1.5, 0.85);
        r.drawCurve(compFn, series[k], 2);
        ctx.globalAlpha = 1;
      }
    }

    // Phase 3: Draw the full mixture envelope
    const envelopeP = easedSub(progress, 0.7, 0.85);
    if (envelopeP > 0) {
      const mixFn = (x: number) => gaussianMixturePdf(x, mixWeights, mixMeans, mixStds);
      ctx.globalAlpha = envelopeP * 0.4;
      r.drawCurve(mixFn, colors.textPrimary, 1.5);
      ctx.globalAlpha = 1;
    }

    // Formula
    formulaAppear(state.formulaManager, 'gmm-prior',
      'p(z) = \\sum_{k=1}^{K} \\pi_k\\, \\mathcal{N}(\\mu_k, \\Sigma_k)',
      50, 88, easedSub(progress, 0.55, 0.72));

    // Mixture label
    const mixLabelP = easedSub(progress, 0.72, 0.85);
    fadeInText(ctx, tx('scene2', 'mixtureLabel'), W * 0.85, r.toY(0.45), mixLabelP, {
      color: colors.accent, font: 'bold 12px "Segoe UI", system-ui, sans-serif', align: 'right',
    });

    // Insight
    const insP = easedSub(progress, 0.88, 0.98);
    fadeInText(ctx, tx('scene2', 'insight'), W / 2, H - 22, insP, {
      color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
    });
  },
});
