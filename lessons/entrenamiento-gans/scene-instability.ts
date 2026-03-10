// Scene 5: Training Instability — oscillating losses vs stable supervised

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene5 = new Scene({
  id: () => tx('scene5', 'id'),
  duration: 24,
  narration: () => tx('scene5', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene5 as SceneText)?.subtitleCues ?? (text.es.scene5 as SceneText).subtitleCues,
  topic: () => tx('scene5', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene5', 'title'), W / 2, 30, easedSub(progress, 0, 0.1), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif'
    });

    // Two plots: left = supervised (stable), right = GAN (unstable)
    const plotMargin = 20;
    const plotW = (W - 3 * plotMargin) / 2;
    const plotTop = 60;
    const plotBottom = H - 50;
    const plotH = plotBottom - plotTop;

    // Left plot: Supervised loss — stable, decreasing
    const supP = easedSub(progress, 0.08, 0.45);
    if (supP > 0) {
      const lx = plotMargin;

      // Background
      ctx.save();
      ctx.globalAlpha = supP;
      r.box(lx, plotTop - 5, plotW, plotH + 10, {
        fill: colors.bodyBg, stroke: colors.border, radius: 6, lineWidth: 1
      });
      ctx.restore();

      fadeInText(ctx, tx('scene5', 'supLoss'), lx + plotW / 2, plotTop + 12, supP, {
        color: series[1], font: 'bold 11px "Segoe UI", system-ui, sans-serif'
      });

      // Axes
      ctx.save();
      ctx.globalAlpha = supP;
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      const lAxisX = lx + 30;
      const lAxisY = plotBottom - 15;
      ctx.beginPath();
      ctx.moveTo(lAxisX, plotTop + 25);
      ctx.lineTo(lAxisX, lAxisY);
      ctx.lineTo(lx + plotW - 10, lAxisY);
      ctx.stroke();
      ctx.restore();

      // Smooth decreasing curve
      const curveP = easedSub(progress, 0.15, 0.45);
      if (curveP > 0) {
        ctx.save();
        ctx.globalAlpha = curveP;
        ctx.strokeStyle = series[1];
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const steps = 100;
        const cW = plotW - 40;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          if (t > curveP) break;
          const loss = 1.0 * Math.exp(-3 * t) + 0.1;
          const px = lAxisX + cW * t;
          const py = lAxisY - loss * (plotH * 0.7);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Stable label
      const stableP = easedSub(progress, 0.4, 0.55);
      if (stableP > 0) {
        fadeInText(ctx, tx('scene5', 'stableLabel'), lx + plotW / 2, plotBottom + 12, stableP, {
          color: series[1], font: '10px "Segoe UI", system-ui, sans-serif'
        });
      }
    }

    // Right plot: GAN losses — oscillating chaos
    const ganP = easedSub(progress, 0.3, 0.75);
    if (ganP > 0) {
      const rx = plotMargin * 2 + plotW;

      // Background
      ctx.save();
      ctx.globalAlpha = ganP;
      r.box(rx, plotTop - 5, plotW, plotH + 10, {
        fill: colors.bodyBg, stroke: colors.border, radius: 6, lineWidth: 1
      });
      ctx.restore();

      // Axes
      ctx.save();
      ctx.globalAlpha = ganP;
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      const rAxisX = rx + 30;
      const rAxisY = plotBottom - 15;
      ctx.beginPath();
      ctx.moveTo(rAxisX, plotTop + 25);
      ctx.lineTo(rAxisX, rAxisY);
      ctx.lineTo(rx + plotW - 10, rAxisY);
      ctx.stroke();

      // Iteration label
      ctx.fillStyle = colors.textDimmed;
      ctx.font = '9px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(tx('scene5', 'iterLabel'), rx + plotW / 2, rAxisY + 3);
      ctx.restore();

      const cW = plotW - 40;
      const curveGanP = easedSub(progress, 0.4, 0.75);
      if (curveGanP > 0) {
        const steps = 120;

        // D loss — oscillating
        ctx.save();
        ctx.globalAlpha = curveGanP;
        ctx.strokeStyle = colors.insight;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          if (t > curveGanP) break;
          const loss = 0.5 + 0.3 * Math.sin(t * 18) + 0.15 * Math.sin(t * 7.3 + 1) + 0.1 * Math.cos(t * 25);
          const px = rAxisX + cW * t;
          const py = rAxisY - loss * (plotH * 0.6);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();

        // G loss — oscillating in opposite phase
        ctx.save();
        ctx.globalAlpha = curveGanP;
        ctx.strokeStyle = series[2];
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          if (t > curveGanP) break;
          const loss = 0.6 - 0.25 * Math.sin(t * 18) + 0.2 * Math.cos(t * 11.5 + 2) + 0.1 * Math.sin(t * 30);
          const px = rAxisX + cW * t;
          const py = rAxisY - loss * (plotH * 0.6);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Legend
      const legP = easedSub(progress, 0.55, 0.7);
      if (legP > 0) {
        fadeInText(ctx, tx('scene5', 'ganLossD'), rx + plotW - 15, plotTop + 20, legP, {
          color: colors.insight, font: '10px "Segoe UI", system-ui, sans-serif', align: 'right'
        });
        fadeInText(ctx, tx('scene5', 'ganLossG'), rx + plotW - 15, plotTop + 34, legP, {
          color: series[2], font: '10px "Segoe UI", system-ui, sans-serif', align: 'right'
        });
      }

      // Unstable label
      const unstableP = easedSub(progress, 0.7, 0.85);
      if (unstableP > 0) {
        fadeInText(ctx, tx('scene5', 'unstableLabel'), rx + plotW / 2, plotBottom + 12, unstableP, {
          color: colors.error, font: '10px "Segoe UI", system-ui, sans-serif'
        });
      }
    }
  }
});
