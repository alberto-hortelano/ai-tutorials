// Scene 6: Denoising Score Matching — add noise, learn to reverse it

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { animateDots } from '../../engine/animation/particles';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// Generate clean data points from a mixture
function sampleClean(seed: number): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  let s = seed;
  const rand = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  for (let i = 0; i < 12; i++) {
    const cluster = rand() > 0.5 ? 0 : 1;
    const cx = cluster === 0 ? 0.3 : 0.7;
    const cy = cluster === 0 ? 0.6 : 0.4;
    pts.push({ x: cx + (rand() - 0.5) * 0.08, y: cy + (rand() - 0.5) * 0.08 });
  }
  return pts;
}

// Generate noisy versions of clean points
function addNoise(clean: { x: number; y: number }[], sigma: number, seed: number): { x: number; y: number }[] {
  let s = seed;
  const rand = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return (s / 0x7fffffff - 0.5) * 2; };
  return clean.map(p => ({
    x: p.x + sigma * rand(),
    y: p.y + sigma * rand(),
  }));
}

const cleanPoints = sampleClean(42);
const noisyPoints = addNoise(cleanPoints, 0.06, 137);

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
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Coordinate mapping for the scatter view
    const margin = 60;
    const plotSize = Math.min(W - margin * 2, H * 0.55);
    const plotX = (W - plotSize) / 2;
    const plotY = H * 0.18;
    const toSX = (v: number) => plotX + v * plotSize;
    const toSY = (v: number) => plotY + (1 - v) * plotSize;

    // Plot border
    const borderP = easedSub(progress, 0.05, 0.15);
    if (borderP > 0) {
      ctx.save();
      ctx.globalAlpha = borderP * 0.2;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(plotX, plotY, plotSize, plotSize);
      ctx.restore();
    }

    // Clean data points (green)
    const cleanP = easedSub(progress, 0.1, 0.3);
    if (cleanP > 0) {
      const pixelClean = cleanPoints.map(p => ({ x: toSX(p.x), y: toSY(p.y) }));
      animateDots(ctx, pixelClean, cleanP, {
        color: colors.insight, radius: 5, sequential: false,
      });
      fadeInText(ctx, tx('scene6', 'cleanData'), toSX(0.3), toSY(0.6) - 18, cleanP, {
        color: colors.insight, font: '10px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Noisy data points (red/orange)
    const noisyP = easedSub(progress, 0.25, 0.45);
    if (noisyP > 0) {
      const pixelNoisy = noisyPoints.map(p => ({ x: toSX(p.x), y: toSY(p.y) }));
      animateDots(ctx, pixelNoisy, noisyP, {
        color: colors.error, radius: 4, sequential: false,
      });
      fadeInText(ctx, tx('scene6', 'noisyData'), toSX(0.7), toSY(0.4) + 22, noisyP, {
        color: colors.error, font: '10px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Arrows from noisy back to clean (the score direction)
    const arrowsP = easedSub(progress, 0.4, 0.7);
    if (arrowsP > 0) {
      ctx.save();
      ctx.globalAlpha = arrowsP * 0.7;
      for (let i = 0; i < cleanPoints.length; i++) {
        const cx = toSX(noisyPoints[i].x);
        const cy = toSY(noisyPoints[i].y);
        const tx2 = toSX(cleanPoints[i].x);
        const ty = toSY(cleanPoints[i].y);
        animateArrow(ctx, cx, cy, tx2, ty, arrowsP, {
          color: colors.accent, headSize: 4, lineWidth: 1.5,
        });
      }
      ctx.restore();

      fadeInText(ctx, tx('scene6', 'arrowLabel'), W / 2, plotY + plotSize + 18, arrowsP, {
        color: colors.accent, font: 'bold 11px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Formula
    const formulaP = easedSub(progress, 0.65, 0.82);
    if (formulaP > 0) {
      formulaAppear(state.formulaManager, 'sm-dsm',
        's(\\tilde{x}) \\approx \\frac{x - \\tilde{x}}{\\sigma^2}',
        50, 85, formulaP, { color: colors.accent, fontSize: '1.3em' });
    }

    // Bottom insight
    const insightP = easedSub(progress, 0.85, 1);
    fadeInText(ctx, tx('scene6', 'equivalent'), W / 2, H - 22, insightP, {
      color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
    });
  },
});
