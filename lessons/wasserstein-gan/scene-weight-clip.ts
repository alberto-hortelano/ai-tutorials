// Scene 5: Weight Clipping — crude Lipschitz enforcement, Goldilocks problem

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { gaussian } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene5 = new Scene({
  id: () => tx('scene5', 'id'),
  duration: 20,
  narration: () => tx('scene5', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene5 as SceneText)?.subtitleCues ?? (text.es.scene5 as SceneText).subtitleCues,
  topic: () => tx('scene5', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene5', 'title'), W / 2, 25, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    const panelW = (W - 30) / 2;
    const panelTop = 55;
    const panelH = (H - panelTop - 60) * 0.55;

    // Left panel: Weight distribution BEFORE clipping
    const beforeP = easedSub(progress, 0.08, 0.35);
    if (beforeP > 0) {
      const leftX = 15;

      fadeInText(ctx, tx('scene5', 'beforeLabel'), leftX + panelW / 2, panelTop, beforeP, {
        color: colors.textMuted, font: '10px "Segoe UI", system-ui, sans-serif',
      });

      // Normal distribution of weights
      const steps = 150;
      const wMin = -0.5, wMax = 0.5;
      const dw = (wMax - wMin) / steps;
      const toX = (w: number): number => leftX + ((w - wMin) / (wMax - wMin)) * panelW;
      const toY = (y: number): number => panelTop + panelH - y * panelH * 0.85;

      ctx.save();
      ctx.globalAlpha = beforeP;

      // Fill
      ctx.fillStyle = series[0] + '30';
      ctx.beginPath();
      ctx.moveTo(toX(wMin), toY(0));
      for (let i = 0; i <= steps; i++) {
        const w = wMin + i * dw;
        ctx.lineTo(toX(w), toY(gaussian(w, 0, 0.15)));
      }
      ctx.lineTo(toX(wMax), toY(0));
      ctx.closePath();
      ctx.fill();

      // Curve
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const w = wMin + i * dw;
        if (i === 0) ctx.moveTo(toX(w), toY(gaussian(w, 0, 0.15)));
        else ctx.lineTo(toX(w), toY(gaussian(w, 0, 0.15)));
      }
      ctx.stroke();

      ctx.restore();
    }

    // Right panel: Weight distribution AFTER clipping => bimodal
    const afterP = easedSub(progress, 0.3, 0.6);
    if (afterP > 0) {
      const rightX = panelW + 20;

      fadeInText(ctx, tx('scene5', 'afterLabel'), rightX + panelW / 2, panelTop, afterP, {
        color: colors.warning, font: '10px "Segoe UI", system-ui, sans-serif',
      });

      const steps = 150;
      const wMin = -0.5, wMax = 0.5;
      const dw = (wMax - wMin) / steps;
      const c = 0.2; // clip value
      const toX = (w: number): number => rightX + ((w - wMin) / (wMax - wMin)) * panelW;
      const toY = (y: number): number => panelTop + panelH - y * panelH * 0.85;

      // Bimodal: peaks at -c and +c
      const bimodal = (w: number): number => {
        return 0.5 * gaussian(w, -c, 0.03) + 0.5 * gaussian(w, c, 0.03);
      };

      ctx.save();
      ctx.globalAlpha = afterP;

      // Fill
      ctx.fillStyle = colors.warning + '30';
      ctx.beginPath();
      ctx.moveTo(toX(wMin), toY(0));
      for (let i = 0; i <= steps; i++) {
        const w = wMin + i * dw;
        ctx.lineTo(toX(w), toY(bimodal(w)));
      }
      ctx.lineTo(toX(wMax), toY(0));
      ctx.closePath();
      ctx.fill();

      // Curve
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const w = wMin + i * dw;
        if (i === 0) ctx.moveTo(toX(w), toY(bimodal(w)));
        else ctx.lineTo(toX(w), toY(bimodal(w)));
      }
      ctx.stroke();

      // -c and +c markers
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(toX(-c), toY(0));
      ctx.lineTo(toX(-c), panelTop + 15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(toX(c), toY(0));
      ctx.lineTo(toX(c), panelTop + 15);
      ctx.stroke();
      ctx.setLineDash([]);

      fadeInText(ctx, '-c', toX(-c), panelTop + panelH + 14, 1, {
        color: colors.error, font: 'bold 10px "Segoe UI", system-ui, sans-serif',
      });
      fadeInText(ctx, '+c', toX(c), panelTop + panelH + 14, 1, {
        color: colors.error, font: 'bold 10px "Segoe UI", system-ui, sans-serif',
      });

      ctx.restore();
    }

    // Arrow between panels
    const arrP = easedSub(progress, 0.25, 0.4);
    if (arrP > 0) {
      ctx.save();
      ctx.globalAlpha = arrP;
      ctx.strokeStyle = colors.textDimmed;
      ctx.lineWidth = 1.5;
      const arrowY = panelTop + panelH / 2;
      ctx.beginPath();
      ctx.moveTo(panelW - 2, arrowY);
      ctx.lineTo(panelW + 18, arrowY);
      ctx.stroke();
      // Arrowhead
      ctx.fillStyle = colors.textDimmed;
      ctx.beginPath();
      ctx.moveTo(panelW + 18, arrowY);
      ctx.lineTo(panelW + 12, arrowY - 4);
      ctx.lineTo(panelW + 12, arrowY + 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      fadeInText(ctx, 'clip', panelW + 8, arrowY - 10, arrP, {
        color: colors.textDimmed, font: '9px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Goldilocks section
    const goldTop = panelTop + panelH + 35;

    // c too small
    const smallP = easedSub(progress, 0.55, 0.72);
    if (smallP > 0) {
      fadeInText(ctx, tx('scene5', 'cSmallLabel'), W * 0.25, goldTop, smallP, {
        color: colors.error, font: 'bold 11px "Segoe UI", system-ui, sans-serif',
      });
      fadeInText(ctx, 'Vanishing gradients', W * 0.25, goldTop + 16, smallP, {
        color: colors.textMuted, font: '10px "Segoe UI", system-ui, sans-serif',
      });
    }

    // c too large
    const largeP = easedSub(progress, 0.65, 0.82);
    if (largeP > 0) {
      fadeInText(ctx, tx('scene5', 'cLargeLabel'), W * 0.75, goldTop, largeP, {
        color: colors.error, font: 'bold 11px "Segoe UI", system-ui, sans-serif',
      });
      fadeInText(ctx, 'Exploding gradients', W * 0.75, goldTop + 16, largeP, {
        color: colors.textMuted, font: '10px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Goldilocks label
    const goldP = easedSub(progress, 0.82, 1);
    if (goldP > 0) {
      fadeInText(ctx, tx('scene5', 'goldilocksLabel'), W / 2, H - 18, goldP, {
        color: colors.warning, font: 'bold 11px "Segoe UI", system-ui, sans-serif',
      });
    }
  },
});
