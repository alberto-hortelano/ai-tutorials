// Scene 6: Forward vs Reverse KL Revisited — bimodal P with three Q overlays

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { gaussian } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene6 = new Scene({
  id: () => tx('scene6', 'id'),
  duration: 22,
  narration: () => tx('scene6', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene6 as SceneText)?.subtitleCues ?? (text.es.scene6 as SceneText).subtitleCues,
  topic: () => tx('scene6', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene6', 'title'), W / 2, 25, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // P = bimodal
    const pBimodal = (x: number): number => 0.5 * gaussian(x, -2, 0.7) + 0.5 * gaussian(x, 2, 0.7);
    // Forward KL: broad
    const qFwd = (x: number): number => gaussian(x, 0, 2.2);
    // Reverse KL: one mode
    const qRev = (x: number): number => gaussian(x, 2, 0.7);
    // JSD: compromise
    const qJsd = (x: number): number => 0.4 * gaussian(x, -1.5, 1.0) + 0.6 * gaussian(x, 1.8, 0.9);

    const xMin = -6, xMax = 6;
    const yMax = 0.5;
    const steps = 300;
    const dx = (xMax - xMin) / steps;

    const plotTop = 50;
    const plotH = H - plotTop - 55;
    const toX = (x: number): number => 20 + ((x - xMin) / (xMax - xMin)) * (W - 40);
    const toY = (y: number): number => plotTop + plotH - (y / yMax) * plotH;

    // Helper to draw distribution
    const drawDist = (fn: (x: number) => number, color: string, alpha: number, dashed = false, fillAlpha = '15') => {
      ctx.save();
      ctx.globalAlpha = alpha;

      // Fill
      ctx.fillStyle = color + fillAlpha;
      ctx.beginPath();
      ctx.moveTo(toX(xMin), toY(0));
      for (let i = 0; i <= steps; i++) {
        const x = xMin + i * dx;
        ctx.lineTo(toX(x), toY(fn(x)));
      }
      ctx.lineTo(toX(xMax), toY(0));
      ctx.closePath();
      ctx.fill();

      // Curve
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      if (dashed) ctx.setLineDash([6, 4]);
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const x = xMin + i * dx;
        if (i === 0) ctx.moveTo(toX(x), toY(fn(x)));
        else ctx.lineTo(toX(x), toY(fn(x)));
      }
      ctx.stroke();
      if (dashed) ctx.setLineDash([]);

      ctx.restore();
    };

    // Phase 1: P bimodal
    const pP = easedSub(progress, 0.05, 0.25);
    if (pP > 0) {
      drawDist(pBimodal, series[0], pP);
      fadeInText(ctx, tx('scene6', 'pLabel'), toX(-2), toY(pBimodal(-2)) - 12, pP, {
        color: series[0], font: 'bold 11px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Phase 2: Forward KL Q (broad, blurry)
    const fwdP = easedSub(progress, 0.2, 0.45);
    if (fwdP > 0) {
      drawDist(qFwd, colors.info, fwdP, true);
      fadeInText(ctx, tx('scene6', 'qFwdLabel'), toX(0), toY(qFwd(0)) - 12, fwdP, {
        color: colors.info, font: '10px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Phase 3: Reverse KL Q (sharp, one mode)
    const revP = easedSub(progress, 0.4, 0.65);
    if (revP > 0) {
      drawDist(qRev, colors.error, revP, true);
      fadeInText(ctx, tx('scene6', 'qRevLabel'), toX(3.5), toY(qRev(2)) - 5, revP, {
        color: colors.error, font: '10px "Segoe UI", system-ui, sans-serif', align: 'left',
      });
    }

    // Phase 4: JSD Q (compromise)
    const jsdP = easedSub(progress, 0.6, 0.85);
    if (jsdP > 0) {
      drawDist(qJsd, colors.warning, jsdP, true);
      fadeInText(ctx, tx('scene6', 'qJsdLabel'), toX(-4), toY(0.15), jsdP, {
        color: colors.warning, font: '10px "Segoe UI", system-ui, sans-serif', align: 'left',
      });
    }

    // Legend at bottom
    const legP = easedSub(progress, 0.7, 0.9);
    if (legP > 0) {
      const legY = H - 30;
      const legStartX = W * 0.1;
      const spacing = W * 0.27;

      // Forward KL legend
      ctx.save();
      ctx.globalAlpha = legP;
      ctx.fillStyle = colors.info;
      ctx.fillRect(legStartX, legY - 4, 12, 8);
      ctx.restore();
      fadeInText(ctx, 'Forward KL (VAEs)', legStartX + 18, legY, legP, {
        color: colors.info, font: '9px "Segoe UI", system-ui, sans-serif', align: 'left',
      });

      // Reverse KL legend
      ctx.save();
      ctx.globalAlpha = legP;
      ctx.fillStyle = colors.error;
      ctx.fillRect(legStartX + spacing, legY - 4, 12, 8);
      ctx.restore();
      fadeInText(ctx, 'Reverse KL (GANs)', legStartX + spacing + 18, legY, legP, {
        color: colors.error, font: '9px "Segoe UI", system-ui, sans-serif', align: 'left',
      });

      // JSD legend
      ctx.save();
      ctx.globalAlpha = legP;
      ctx.fillStyle = colors.warning;
      ctx.fillRect(legStartX + spacing * 2, legY - 4, 12, 8);
      ctx.restore();
      fadeInText(ctx, 'JSD', legStartX + spacing * 2 + 18, legY, legP, {
        color: colors.warning, font: '9px "Segoe UI", system-ui, sans-serif', align: 'left',
      });
    }

    // Insight
    const insP = easedSub(progress, 0.88, 1);
    if (insP > 0) {
      fadeInText(ctx, tx('scene6', 'insight'), W / 2, H - 12, insP, {
        color: colors.insight, font: 'bold 10px "Segoe UI", system-ui, sans-serif',
      });
    }
  },
});
