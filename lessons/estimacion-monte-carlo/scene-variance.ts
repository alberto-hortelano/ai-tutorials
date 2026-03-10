// Scene 2: Variance — The Enemy
// Side-by-side: gentle function (quick convergence) vs wild (slow). Error band shrinks with N.

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { mulberry32 } from '../_shared/flow-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

function generateGaussianSamples(n: number, seed: number): number[] {
  const rng = mulberry32(seed);
  const samples: number[] = [];
  for (let i = 0; i < n; i++) {
    const u1 = rng() + 1e-10;
    const u2 = rng();
    samples.push(Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2));
  }
  return samples;
}

export const scene2 = new Scene({
  id: () => tx('scene2', 'id'),
  duration: 22,
  narration: () => tx('scene2', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene2 as SceneText)?.subtitleCues ?? (text.es.scene2 as SceneText).subtitleCues,
  topic: () => tx('scene2', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene2', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Formula: Var ∝ 1/N
    formulaAppear(state.formulaManager, 'var-formula',
      '\\text{Var}\\left[\\hat{\\mu}_N\\right] = \\frac{\\text{Var}[f(x)]}{N}',
      50, 13, easedSub(progress, 0.05, 0.18), { color: colors.textPrimary, fontSize: '0.9em' });

    const maxN = 100;
    const allSamples = generateGaussianSamples(maxN, 77);

    // Gentle function: f(x) = x + 1 (low variance under N(0,1))
    const gentleFn = (x: number) => x + 1;
    const gentleTrue = 1.0; // E[x+1] = 0+1 = 1

    // Wild function: f(x) = 10*sin(5x)*exp(-x^2/4) (high variance under N(0,1))
    const wildFn = (x: number) => 10 * Math.sin(5 * x) * Math.exp(-x * x / 4);
    // Approximate true expectation (should be ~0 by symmetry of sin and Gaussian)
    const wildTrue = 0;

    const sampleProg = easedSub(progress, 0.2, 0.85);
    const nVisible = Math.max(1, Math.floor(sampleProg * maxN));

    // Compute running averages for both functions
    const gentleAvgs: number[] = [];
    const wildAvgs: number[] = [];
    let gSum = 0, wSum = 0;
    for (let i = 0; i < maxN; i++) {
      gSum += gentleFn(allSamples[i]);
      wSum += wildFn(allSamples[i]);
      gentleAvgs.push(gSum / (i + 1));
      wildAvgs.push(wSum / (i + 1));
    }

    // --- Left panel: gentle function ---
    const panelW = (W - 20) / 2 - 10;
    const panelTop = H * 0.22;
    const panelH = H * 0.65;
    const leftX = 15;
    const rightX = W / 2 + 10;

    // Helper to draw a convergence panel
    const drawPanel = (
      ox: number, avgs: number[], trueVal: number,
      title: string, color: string,
      yMin: number, yMax: number,
    ) => {
      const pW = panelW;
      const margin = 35;
      const plotL = ox + margin;
      const plotR = ox + pW - 10;
      const plotW = plotR - plotL;
      const plotTop = panelTop + 25;
      const plotH = panelH - 50;

      // Panel title
      const titleP = easedSub(progress, 0.1, 0.2);
      fadeInText(ctx, title, ox + pW / 2, panelTop + 8, titleP, {
        color, font: `bold 12px ${fonts.body}`
      });

      // Axes
      const axesP = easedSub(progress, 0.12, 0.22);
      if (axesP > 0) {
        ctx.globalAlpha = axesP;
        ctx.strokeStyle = colors.axis;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(plotL, plotTop + plotH);
        ctx.lineTo(plotR, plotTop + plotH);
        ctx.moveTo(plotL, plotTop);
        ctx.lineTo(plotL, plotTop + plotH);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // True value line
      if (sampleProg > 0) {
        const trueY = plotTop + plotH - ((trueVal - yMin) / (yMax - yMin)) * plotH;
        ctx.strokeStyle = colors.error;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(plotL, trueY);
        ctx.lineTo(plotR, trueY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Running average line
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        for (let i = 0; i < nVisible; i++) {
          const px = plotL + (i / maxN) * plotW;
          const val = Math.max(yMin, Math.min(yMax, avgs[i]));
          const py = plotTop + plotH - ((val - yMin) / (yMax - yMin)) * plotH;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Error band (standard deviation of f / sqrt(N))
        const bandP = easedSub(progress, 0.5, 0.65);
        if (bandP > 0) {
          // Compute sample variance
          let m2 = 0;
          const fnToUse = color === series[0] ? gentleFn : wildFn;
          for (let i = 0; i < nVisible; i++) {
            const v = fnToUse(allSamples[i]);
            m2 += (v - avgs[nVisible - 1]) * (v - avgs[nVisible - 1]);
          }
          const sampleVar = nVisible > 1 ? m2 / (nVisible - 1) : m2;

          ctx.globalAlpha = bandP * 0.15;
          ctx.fillStyle = color;
          ctx.beginPath();
          for (let n = 1; n <= nVisible; n++) {
            const px = plotL + (n / maxN) * plotW;
            const se = Math.sqrt(sampleVar / n);
            const upper = Math.min(yMax, avgs[n - 1] + se);
            const py = plotTop + plotH - ((upper - yMin) / (yMax - yMin)) * plotH;
            if (n === 1) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          for (let n = nVisible; n >= 1; n--) {
            const px = plotL + (n / maxN) * plotW;
            const se = Math.sqrt(sampleVar / n);
            const lower = Math.max(yMin, avgs[n - 1] - se);
            const py = plotTop + plotH - ((lower - yMin) / (yMax - yMin)) * plotH;
            ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
    };

    // Draw left: gentle
    drawPanel(leftX, gentleAvgs, gentleTrue, tx('scene2', 'gentle'), series[0], -1, 3);

    // Draw right: wild
    drawPanel(rightX, wildAvgs, wildTrue, tx('scene2', 'wild'), series[2], -8, 8);

    // Divider
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(W / 2, panelTop);
    ctx.lineTo(W / 2, panelTop + panelH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Bottom insight
    fadeInText(ctx, tx('scene2', 'varFormula'), W / 2, H - 15, easedSub(progress, 0.88, 1), {
      color: colors.warning, font: `bold 12px ${fonts.body}`
    });
  }
});
