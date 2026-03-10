// Scene 1: Forward Process — Adding Noise

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

/** Seeded RNG for reproducible dot positions */
function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

/** Generate cluster-based dot positions */
function generateClusters(nDots: number, seed: number): { x: number; y: number; cluster: number }[] {
  const rng = seededRng(seed);
  const centers = [
    { x: 0.25, y: 0.35 },
    { x: 0.7, y: 0.3 },
    { x: 0.45, y: 0.7 },
  ];
  const dots: { x: number; y: number; cluster: number }[] = [];
  for (let i = 0; i < nDots; i++) {
    const c = Math.floor(rng() * centers.length);
    const cx = centers[c].x + (rng() - 0.5) * 0.12;
    const cy = centers[c].y + (rng() - 0.5) * 0.12;
    dots.push({ x: cx, y: cy, cluster: c });
  }
  return dots;
}

/** Generate fixed noise offsets per dot */
function generateNoiseOffsets(nDots: number, seed: number): { dx: number; dy: number }[] {
  const rng = seededRng(seed);
  const offsets: { dx: number; dy: number }[] = [];
  for (let i = 0; i < nDots; i++) {
    // Box-Muller for Gaussian
    const u1 = rng(), u2 = rng();
    const r = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10)));
    offsets.push({ dx: r * Math.cos(2 * Math.PI * u2), dy: r * Math.sin(2 * Math.PI * u2) });
  }
  return offsets;
}

const N_DOTS = 80;
const clusterDots = generateClusters(N_DOTS, 42);
const noiseOffsets = generateNoiseOffsets(N_DOTS, 99);
const clusterColors = [series[0], series[1], series[2]];

export const scene1 = new Scene({
  id: () => tx('scene1', 'id'),
  duration: 22,
  narration: () => tx('scene1', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene1 as SceneText)?.subtitleCues ?? (text.es.scene1 as SceneText).subtitleCues,
  topic: () => tx('scene1', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene1', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Compute noise level from timeline slider
    const timelineP = easedSub(progress, 0.1, 0.85);
    // 5 stages: t=0, 250, 500, 750, 1000
    const noiseLevel = timelineP; // 0..1 maps to t=0..T

    // Draw area for dots
    const dotArea = { x: W * 0.08, y: 60, w: W * 0.84, h: H * 0.55 };

    // Background box
    const boxP = easedSub(progress, 0.05, 0.12);
    if (boxP > 0) {
      ctx.save();
      ctx.globalAlpha = boxP * 0.3;
      ctx.fillStyle = colors.panelBg;
      ctx.fillRect(dotArea.x, dotArea.y, dotArea.w, dotArea.h);
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // Draw dots with progressive noise
    const dotsP = easedSub(progress, 0.08, 0.15);
    if (dotsP > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(dotsP * 2, 1);
      const noiseScale = noiseLevel * 0.4; // max displacement

      for (let i = 0; i < N_DOTS; i++) {
        const base = clusterDots[i];
        const noise = noiseOffsets[i];
        const px = dotArea.x + (base.x + noise.dx * noiseScale) * dotArea.w;
        const py = dotArea.y + (base.y + noise.dy * noiseScale) * dotArea.h;

        // Color fades from cluster color to gray with noise
        const baseColor = clusterColors[base.cluster];
        const alpha = 1 - noiseLevel * 0.6;

        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.globalAlpha = Math.min(dotsP * 2, 1) * alpha;
        ctx.fill();

        // Add gray overlay for noise
        if (noiseLevel > 0.05) {
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = colors.textDimmed;
          ctx.globalAlpha = Math.min(dotsP * 2, 1) * noiseLevel * 0.6;
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // Timeline slider at bottom
    const sliderP = easedSub(progress, 0.08, 0.14);
    if (sliderP > 0) {
      ctx.save();
      ctx.globalAlpha = sliderP;
      const sliderY = dotArea.y + dotArea.h + 30;
      const sliderX = dotArea.x;
      const sliderW = dotArea.w;

      // Track
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sliderX, sliderY);
      ctx.lineTo(sliderX + sliderW, sliderY);
      ctx.stroke();

      // Tick marks and labels at t=0, 250, 500, 750, 1000
      const labels = ['t0Label', 't250Label', 't500Label', 't750Label', 't1000Label'];
      for (let i = 0; i < 5; i++) {
        const frac = i / 4;
        const tx_ = sliderX + frac * sliderW;

        ctx.strokeStyle = colors.textDimmed;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tx_, sliderY - 4);
        ctx.lineTo(tx_, sliderY + 4);
        ctx.stroke();

        ctx.fillStyle = colors.textMuted;
        ctx.font = '10px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(tx('scene1', labels[i]), tx_, sliderY + 16);
      }

      // Current position indicator
      const curX = sliderX + noiseLevel * sliderW;
      ctx.beginPath();
      ctx.arc(curX, sliderY, 6, 0, Math.PI * 2);
      ctx.fillStyle = colors.warning;
      ctx.fill();

      // Left/right labels
      ctx.font = '11px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = colors.insight;
      ctx.fillText(tx('scene1', 'dataLabel'), sliderX, sliderY + 32);
      ctx.textAlign = 'right';
      ctx.fillStyle = colors.textDimmed;
      ctx.fillText(tx('scene1', 'noiseLabel'), sliderX + sliderW, sliderY + 32);

      ctx.restore();
    }

    // Final emphasis
    const endP = easedSub(progress, 0.88, 0.97);
    if (endP > 0) {
      fadeInText(ctx, 'q(x_t | x_{t-1}) = N(x_t; sqrt(1-beta_t) x_{t-1}, beta_t I)', W / 2, H - 30, endP, {
        color: colors.accent, font: '13px "Segoe UI", system-ui, sans-serif',
      });
    }
  },
});
