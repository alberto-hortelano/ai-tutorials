// Scene 7: Gallery — progressive transformation with increasing layers

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeInOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateDots } from '../../engine/animation/particles';
import { sampleGaussian2D, sampleTwoMoons, lerpPoints, mulberry32 } from '../_shared/flow-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene7 = new Scene({
  id: () => tx('scene7', 'id'),
  duration: 24,
  narration: () => tx('scene7', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene7 as SceneText)?.subtitleCues ?? (text.es.scene7 as SceneText).subtitleCues,
  topic: () => tx('scene7', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene7', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    const nPts = 150;
    const gaussPts = sampleGaussian2D(nPts, 42);
    const targetPts = sampleTwoMoons(nPts, 0.06, 42);
    const scale = Math.min(W, H) * 0.07;

    // Generate intermediate stages by lerping with noise
    const rng = mulberry32(123);
    const stage1 = gaussPts.map((p, i) => ({
      x: p.x + (targetPts[i].x - p.x) * 0.2 + (rng() - 0.5) * 0.3,
      y: p.y + (targetPts[i].y - p.y) * 0.2 + (rng() - 0.5) * 0.3,
    }));
    const stage2 = gaussPts.map((p, i) => ({
      x: p.x + (targetPts[i].x - p.x) * 0.6 + (rng() - 0.5) * 0.15,
      y: p.y + (targetPts[i].y - p.y) * 0.6 + (rng() - 0.5) * 0.15,
    }));
    const stage3 = gaussPts.map((p, i) => ({
      x: p.x + (targetPts[i].x - p.x) * 0.92 + (rng() - 0.5) * 0.05,
      y: p.y + (targetPts[i].y - p.y) * 0.92 + (rng() - 0.5) * 0.05,
    }));

    const panels = [
      { pts: stage1, label: tx('scene7', 'k1'), color: series[0], start: 0.05, end: 0.3, logLik: -3.2 },
      { pts: stage2, label: tx('scene7', 'k4'), color: series[1], start: 0.22, end: 0.5, logLik: -1.8 },
      { pts: stage3, label: tx('scene7', 'k8'), color: series[2], start: 0.4, end: 0.7, logLik: -0.9 },
      { pts: targetPts, label: tx('scene7', 'target'), color: colors.insight, start: 0.55, end: 0.8, logLik: 0 },
    ];

    const panelW = W * 0.21;
    const panelH = H * 0.45;
    const panelTop = 55;
    const gap = (W - 4 * panelW) / 5;

    panels.forEach((panel, i) => {
      const pP = easedSub(progress, panel.start, panel.end);
      if (pP <= 0) return;

      const px = gap + i * (panelW + gap);
      const cx = px + panelW / 2;
      const cy = panelTop + panelH / 2;

      ctx.save();
      ctx.globalAlpha = pP;

      // Panel
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(px, panelTop, panelW, panelH, 6);
      ctx.stroke();

      // Label
      fadeInText(ctx, panel.label, cx, panelTop - 5, 1, {
        color: panel.color, font: `bold 11px ${fonts.body}`
      });

      // Dots
      const pixPts = panel.pts.map(p => ({
        x: cx + p.x * scale,
        y: cy - p.y * scale,
      }));
      animateDots(ctx, pixPts, Math.min(pP * 2, 1), {
        color: panel.color, radius: 2, sequential: false,
      });

      ctx.restore();
    });

    // Log-likelihood progress bar
    const barP = easedSub(progress, 0.6, 0.85);
    if (barP > 0) {
      const barY = panelTop + panelH + 20;
      const barW = W * 0.7;
      const barH = 16;
      const barX = (W - barW) / 2;

      ctx.save();
      ctx.globalAlpha = barP;

      // Background
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, barH / 2);
      ctx.fill();
      ctx.stroke();

      // Progress
      const fillW = barW * barP * 0.85;
      ctx.fillStyle = colors.insight + '60';
      ctx.beginPath();
      ctx.roundRect(barX, barY, fillW, barH, barH / 2);
      ctx.fill();

      fadeInText(ctx, tx('scene7', 'logLik'), W / 2, barY - 8, 1, {
        color: colors.insight, font: `bold 11px ${fonts.body}`
      });

      ctx.restore();
    }
  }
});
