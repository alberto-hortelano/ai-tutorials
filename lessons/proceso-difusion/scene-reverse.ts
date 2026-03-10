// Scene 4: Reverse Process — Denoising step by step

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { drawDiffusionChain } from '../_shared/diffusion-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

/** Seeded RNG */
function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

/** Generate dots that transition from noise to clusters */
function generateDots(n: number, seed: number) {
  const rng = seededRng(seed);
  const centers = [
    { x: 0.25, y: 0.35 },
    { x: 0.7, y: 0.3 },
    { x: 0.5, y: 0.7 },
  ];
  const dots: { cleanX: number; cleanY: number; noiseX: number; noiseY: number; cluster: number }[] = [];
  for (let i = 0; i < n; i++) {
    const c = Math.floor(rng() * centers.length);
    const cleanX = centers[c].x + (rng() - 0.5) * 0.12;
    const cleanY = centers[c].y + (rng() - 0.5) * 0.12;
    const noiseX = rng();
    const noiseY = rng();
    dots.push({ cleanX, cleanY, noiseX, noiseY, cluster: c });
  }
  return dots;
}

const N_DOTS = 70;
const dots = generateDots(N_DOTS, 55);
const clusterColors = [colors.accent, colors.insight, colors.warning];

export const scene4 = new Scene({
  id: () => tx('scene4', 'id'),
  duration: 24,
  narration: () => tx('scene4', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene4 as SceneText)?.subtitleCues ?? (text.es.scene4 as SceneText).subtitleCues,
  topic: () => tx('scene4', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene4', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Reverse denoising animation: noise -> structure
    const denoiseP = easedSub(progress, 0.1, 0.7);
    const clarity = denoiseP; // 0 = pure noise, 1 = clean

    const dotArea = { x: W * 0.1, y: 55, w: W * 0.8, h: H * 0.45 };

    // Draw evolving dots
    if (easedSub(progress, 0.05, 0.12) > 0) {
      ctx.save();
      const fadeIn = Math.min(easedSub(progress, 0.05, 0.12) * 2, 1);
      ctx.globalAlpha = fadeIn;

      for (let i = 0; i < N_DOTS; i++) {
        const d = dots[i];
        // Interpolate from noise position to clean position
        const px = dotArea.x + (d.noiseX * (1 - clarity) + d.cleanX * clarity) * dotArea.w;
        const py = dotArea.y + (d.noiseY * (1 - clarity) + d.cleanY * clarity) * dotArea.h;

        // Color transitions from gray to cluster color
        const gray = 0.6 * (1 - clarity);
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);

        if (clarity < 0.3) {
          ctx.fillStyle = colors.textDimmed;
        } else {
          ctx.fillStyle = clusterColors[d.cluster];
          ctx.globalAlpha = fadeIn * (clarity * 0.8 + 0.2);
        }
        ctx.fill();

        // Subtle glow for clustered dots
        if (clarity > 0.6) {
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fillStyle = clusterColors[d.cluster] + '15';
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // Step indicator
    const stepP = easedSub(progress, 0.1, 0.7);
    if (stepP > 0) {
      const stepT = Math.floor((1 - stepP) * 1000);
      ctx.save();
      ctx.fillStyle = colors.textMuted;
      ctx.font = '11px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`t = ${stepT}`, W - 20, dotArea.y + 12);
      ctx.restore();
    }

    // Diffusion chain diagram below
    const chainP = easedSub(progress, 0.6, 0.85);
    const chainY = H * 0.7;
    const chainX = W * 0.08;
    const chainW = W * 0.84;

    drawDiffusionChain(ctx, chainX, chainY, chainW, 6, chainP, {
      showReverse: true,
      forwardLabel: tx('scene4', 'forwardLabel'),
      reverseLabel: tx('scene4', 'reverseLabel'),
      stepLabels: ['x_0', 'x_1', '...', '...', 'x_{T-1}', 'x_T'],
    });

    // Labels for endpoints
    const labelP = easedSub(progress, 0.75, 0.88);
    if (labelP > 0) {
      ctx.save();
      ctx.globalAlpha = labelP;
      ctx.font = '11px "Segoe UI", system-ui, sans-serif';

      ctx.fillStyle = colors.insight;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene4', 'endLabel'), chainX, chainY + 50);

      ctx.fillStyle = colors.textDimmed;
      ctx.fillText(tx('scene4', 'startLabel'), chainX + chainW, chainY + 50);

      ctx.restore();
    }
  },
});
