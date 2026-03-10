// Scene 7: The Divergence Landscape — JSD plateaus vs Wasserstein smooth gradients

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene7 = new Scene({
  id: () => tx('scene7', 'id'),
  duration: 20,
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

    // Shared axes area
    const plotTop = 55;
    const plotH = H - plotTop - 50;
    const plotLeft = 55;
    const plotW = W - plotLeft - 25;

    // Axes
    const axesP = easedSub(progress, 0.05, 0.18);
    if (axesP > 0) {
      ctx.save();
      ctx.globalAlpha = axesP;

      // Y axis
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(plotLeft, plotTop);
      ctx.lineTo(plotLeft, plotTop + plotH);
      ctx.stroke();

      // X axis
      ctx.beginPath();
      ctx.moveTo(plotLeft, plotTop + plotH);
      ctx.lineTo(plotLeft + plotW, plotTop + plotH);
      ctx.stroke();

      fadeInText(ctx, tx('scene7', 'xAxisLabel'), plotLeft + plotW / 2, plotTop + plotH + 18, 1, {
        color: colors.textMuted, font: '10px "Segoe UI", system-ui, sans-serif',
      });
      fadeInText(ctx, tx('scene7', 'yAxisLabel'), 12, plotTop + plotH / 2, 1, {
        color: colors.textMuted, font: '10px "Segoe UI", system-ui, sans-serif',
      });

      ctx.restore();
    }

    const toX = (t: number): number => plotLeft + t * plotW;
    const toY = (v: number): number => plotTop + plotH - v * plotH;

    // JSD curve: constant (log 2) when disjoint, then drops
    const jsdCurve = (t: number): number => {
      if (t < 0.4) return 0.7; // plateau when disjoint
      if (t > 0.9) return 0.02;
      // Sharp transition
      const local = (t - 0.4) / 0.5;
      return 0.7 * (1 - local * local);
    };

    // Wasserstein: smooth linear-ish
    const wassCurve = (t: number): number => {
      return 0.85 * (1 - t);
    };

    const steps = 200;

    // JSD curve
    const jsdP = easedSub(progress, 0.15, 0.5);
    if (jsdP > 0) {
      const nDraw = Math.floor(steps * jsdP);
      ctx.save();
      ctx.globalAlpha = jsdP;

      // Fill under JSD
      ctx.fillStyle = series[2] + '15';
      ctx.beginPath();
      ctx.moveTo(toX(0), toY(0));
      for (let i = 0; i <= nDraw; i++) {
        const t = i / steps;
        ctx.lineTo(toX(t), toY(jsdCurve(t)));
      }
      ctx.lineTo(toX(nDraw / steps), toY(0));
      ctx.closePath();
      ctx.fill();

      // JSD line
      ctx.strokeStyle = series[2];
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i <= nDraw; i++) {
        const t = i / steps;
        if (i === 0) ctx.moveTo(toX(t), toY(jsdCurve(t)));
        else ctx.lineTo(toX(t), toY(jsdCurve(t)));
      }
      ctx.stroke();

      ctx.restore();

      // Plateau annotation
      if (jsdP > 0.5) {
        fadeInText(ctx, tx('scene7', 'jsdLabel'), toX(0.15), toY(0.7) - 15, (jsdP - 0.5) * 2, {
          color: series[2], font: 'bold 11px "Segoe UI", system-ui, sans-serif',
        });

        // Flat gradient arrows on the plateau
        const flatP = (jsdP - 0.5) * 2;
        if (flatP > 0) {
          ctx.save();
          ctx.globalAlpha = flatP * 0.5;
          ctx.strokeStyle = series[2];
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          // Horizontal arrows indicating zero gradient
          for (let i = 0; i < 3; i++) {
            const ax = toX(0.05 + i * 0.12);
            const ay = toY(0.72);
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(ax + 15, ay);
            ctx.stroke();
          }
          ctx.setLineDash([]);
          ctx.restore();
        }
      }
    }

    // Wasserstein curve
    const wassP = easedSub(progress, 0.45, 0.8);
    if (wassP > 0) {
      const nDraw = Math.floor(steps * wassP);
      ctx.save();
      ctx.globalAlpha = wassP;

      // Fill under Wasserstein
      ctx.fillStyle = colors.insight + '15';
      ctx.beginPath();
      ctx.moveTo(toX(0), toY(0));
      for (let i = 0; i <= nDraw; i++) {
        const t = i / steps;
        ctx.lineTo(toX(t), toY(wassCurve(t)));
      }
      ctx.lineTo(toX(nDraw / steps), toY(0));
      ctx.closePath();
      ctx.fill();

      // Wasserstein line
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i <= nDraw; i++) {
        const t = i / steps;
        if (i === 0) ctx.moveTo(toX(t), toY(wassCurve(t)));
        else ctx.lineTo(toX(t), toY(wassCurve(t)));
      }
      ctx.stroke();

      ctx.restore();

      if (wassP > 0.5) {
        fadeInText(ctx, tx('scene7', 'wassLabel'), toX(0.55), toY(wassCurve(0.55)) - 15, (wassP - 0.5) * 2, {
          color: colors.insight, font: 'bold 11px "Segoe UI", system-ui, sans-serif',
        });

        // Gradient arrows along Wasserstein
        const gradP = (wassP - 0.5) * 2;
        if (gradP > 0) {
          ctx.save();
          ctx.globalAlpha = gradP * 0.6;
          for (let i = 0; i < 4; i++) {
            const t0 = 0.1 + i * 0.18;
            const t1 = t0 + 0.08;
            animateArrow(ctx, toX(t0), toY(wassCurve(t0)), toX(t1), toY(wassCurve(t1)), 1, {
              color: colors.insight, lineWidth: 1.5, headSize: 5,
            });
          }
          ctx.restore();
        }
      }
    }

    // Insight
    const insP = easedSub(progress, 0.85, 1);
    if (insP > 0) {
      fadeInText(ctx, tx('scene7', 'insight'), W / 2, H - 18, insP, {
        color: colors.warning, font: 'bold 11px "Segoe UI", system-ui, sans-serif',
      });
    }
  },
});
