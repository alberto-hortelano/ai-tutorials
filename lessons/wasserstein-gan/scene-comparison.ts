// Scene 7: WGAN vs Standard GAN — meaningful loss, no mode collapse

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// Seeded random for deterministic oscillation
function seededRng(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

export const scene7 = new Scene({
  id: () => tx('scene7', 'id'),
  duration: 22,
  narration: () => tx('scene7', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene7 as SceneText)?.subtitleCues ?? (text.es.scene7 as SceneText).subtitleCues,
  topic: () => tx('scene7', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene7', 'title'), W / 2, 25, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    const panelW = (W - 30) / 2;
    const plotTop = 65;
    const plotH = H - plotTop - 65;

    // LEFT: Standard GAN loss (oscillating, uninformative)
    const stdP = easedSub(progress, 0.08, 0.55);
    if (stdP > 0) {
      const leftX = 15;

      fadeInText(ctx, tx('scene7', 'stdTitle'), leftX + panelW / 2, plotTop - 10, stdP, {
        color: series[2], font: 'bold 12px "Segoe UI", system-ui, sans-serif',
      });

      // Axes
      ctx.save();
      ctx.globalAlpha = stdP;
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(leftX + 30, plotTop);
      ctx.lineTo(leftX + 30, plotTop + plotH);
      ctx.lineTo(leftX + panelW, plotTop + plotH);
      ctx.stroke();

      fadeInText(ctx, tx('scene7', 'lossLabel'), leftX + 8, plotTop + plotH / 2, 1, {
        color: colors.textDimmed, font: '8px "Segoe UI", system-ui, sans-serif',
      });
      fadeInText(ctx, tx('scene7', 'iterLabel'), leftX + panelW / 2 + 15, plotTop + plotH + 14, 1, {
        color: colors.textDimmed, font: '8px "Segoe UI", system-ui, sans-serif',
      });

      ctx.restore();

      // Oscillating loss curve
      const steps = 200;
      const nDraw = Math.floor(steps * stdP);
      const rng = seededRng(42);

      ctx.save();
      ctx.globalAlpha = stdP;
      ctx.strokeStyle = series[2];
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      let prevY = 0.5;
      for (let i = 0; i <= nDraw; i++) {
        const t = i / steps;
        const px = leftX + 30 + t * (panelW - 35);
        // Oscillating loss that doesn't converge
        const noise = (rng() - 0.5) * 0.3;
        const base = 0.4 + Math.sin(t * 12) * 0.15 + noise;
        prevY = prevY * 0.7 + base * 0.3;
        const py = plotTop + (1 - prevY) * plotH;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
    }

    // RIGHT: WGAN-GP loss (smooth, decreasing)
    const wganP = easedSub(progress, 0.35, 0.8);
    if (wganP > 0) {
      const rightX = panelW + 20;

      fadeInText(ctx, tx('scene7', 'wganTitle'), rightX + panelW / 2, plotTop - 10, wganP, {
        color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
      });

      // Axes
      ctx.save();
      ctx.globalAlpha = wganP;
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rightX + 30, plotTop);
      ctx.lineTo(rightX + 30, plotTop + plotH);
      ctx.lineTo(rightX + panelW, plotTop + plotH);
      ctx.stroke();

      fadeInText(ctx, tx('scene7', 'lossLabel'), rightX + 8, plotTop + plotH / 2, 1, {
        color: colors.textDimmed, font: '8px "Segoe UI", system-ui, sans-serif',
      });
      fadeInText(ctx, tx('scene7', 'iterLabel'), rightX + panelW / 2 + 15, plotTop + plotH + 14, 1, {
        color: colors.textDimmed, font: '8px "Segoe UI", system-ui, sans-serif',
      });

      ctx.restore();

      // Smooth decreasing loss curve
      const steps = 200;
      const nDraw = Math.floor(steps * wganP);

      ctx.save();
      ctx.globalAlpha = wganP;
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i <= nDraw; i++) {
        const t = i / steps;
        const px = rightX + 30 + t * (panelW - 35);
        // Smooth exponential decay
        const loss = 0.85 * Math.exp(-t * 3) + 0.08;
        const py = plotTop + (1 - loss) * plotH;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Annotations below
    const annoTop = plotTop + plotH + 30;

    // Mode collapse label for standard GAN
    const mcP = easedSub(progress, 0.6, 0.78);
    if (mcP > 0) {
      fadeInText(ctx, tx('scene7', 'modeCollapseLabel'), 15 + panelW / 2, annoTop, mcP, {
        color: colors.error, font: 'bold 10px "Segoe UI", system-ui, sans-serif',
      });

      // X mark
      ctx.save();
      ctx.globalAlpha = mcP;
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 2;
      const xc = 15 + panelW / 2 + 60;
      ctx.beginPath();
      ctx.moveTo(xc - 5, annoTop - 5);
      ctx.lineTo(xc + 5, annoTop + 5);
      ctx.moveTo(xc + 5, annoTop - 5);
      ctx.lineTo(xc - 5, annoTop + 5);
      ctx.stroke();
      ctx.restore();
    }

    // Stable training for WGAN-GP
    const stableP = easedSub(progress, 0.7, 0.88);
    if (stableP > 0) {
      fadeInText(ctx, tx('scene7', 'stableLabel'), panelW + 20 + panelW / 2, annoTop, stableP, {
        color: colors.insight, font: 'bold 10px "Segoe UI", system-ui, sans-serif',
      });

      // Checkmark
      ctx.save();
      ctx.globalAlpha = stableP;
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2;
      const cc = panelW + 20 + panelW / 2 + 65;
      ctx.beginPath();
      ctx.moveTo(cc - 5, annoTop);
      ctx.lineTo(cc - 1, annoTop + 5);
      ctx.lineTo(cc + 7, annoTop - 5);
      ctx.stroke();
      ctx.restore();
    }

    // Final comparison note
    const finalP = easedSub(progress, 0.88, 1);
    if (finalP > 0) {
      fadeInText(ctx, 'Loss <-> Quality', W / 2, H - 12, finalP, {
        color: colors.accent, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
      });
    }
  },
});
