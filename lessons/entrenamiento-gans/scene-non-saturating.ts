// Scene 3: Non-Saturating Loss — max log(D(G(z))) instead of min log(1-D(G(z)))

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateCurve } from '../../engine/animation/graph';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene3 = new Scene({
  id: () => tx('scene3', 'id'),
  duration: 22,
  narration: () => tx('scene3', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene3 as SceneText)?.subtitleCues ?? (text.es.scene3 as SceneText).subtitleCues,
  topic: () => tx('scene3', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene3', 'title'), W / 2, 30, easedSub(progress, 0, 0.1), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif'
    });

    // Two side-by-side plots
    const halfW = W / 2 - 15;
    const plotTop = 55;
    const plotBottom = H - 50;
    const plotH = plotBottom - plotTop;

    // Left plot: original loss log(1 - D)
    const leftP = easedSub(progress, 0.08, 0.4);
    if (leftP > 0) {
      // Left plot axes
      ctx.save();
      ctx.globalAlpha = leftP;

      // Background
      r.box(5, plotTop - 5, halfW, plotH + 10, {
        fill: colors.bodyBg, stroke: colors.border, radius: 6, lineWidth: 1
      });

      // Label
      ctx.restore();
      fadeInText(ctx, tx('scene3', 'originalLabel'), halfW / 2 + 5, plotTop + 12, leftP, {
        color: series[2], font: 'bold 11px "Segoe UI", system-ui, sans-serif'
      });

      // Mini axes
      ctx.save();
      ctx.globalAlpha = leftP;
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      const lAxisX = 40;
      const lAxisY = plotBottom - 20;
      ctx.beginPath();
      ctx.moveTo(lAxisX, plotTop + 25);
      ctx.lineTo(lAxisX, lAxisY);
      ctx.lineTo(halfW - 10, lAxisY);
      ctx.stroke();
      ctx.restore();

      // Draw original loss curve: log(1 - d) for d in [0, 1]
      const lCurveP = easedSub(progress, 0.15, 0.4);
      if (lCurveP > 0) {
        ctx.save();
        ctx.globalAlpha = lCurveP;
        ctx.strokeStyle = series[2];
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const steps = 80;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const xEnd = lCurveP;
          if (t > xEnd) break;
          const d = t;
          const loss = Math.log(Math.max(1 - d, 0.001));
          const px = lAxisX + (halfW - 50) * d;
          const py = lAxisY + loss * (plotH * 0.1); // scale: loss is negative
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Weak gradient annotation
      const weakP = easedSub(progress, 0.35, 0.55);
      if (weakP > 0) {
        fadeInText(ctx, tx('scene3', 'weakGrad'), lAxisX + 20, lAxisY - 15, weakP, {
          color: colors.error, font: '10px "Segoe UI", system-ui, sans-serif', align: 'left'
        });
      }
    }

    // Right plot: non-saturating loss -log(D)
    const rightP = easedSub(progress, 0.3, 0.6);
    if (rightP > 0) {
      const rOff = halfW + 25;

      // Background
      ctx.save();
      ctx.globalAlpha = rightP;
      r.box(rOff, plotTop - 5, halfW - 15, plotH + 10, {
        fill: colors.bodyBg, stroke: colors.border, radius: 6, lineWidth: 1
      });
      ctx.restore();

      // Label
      fadeInText(ctx, tx('scene3', 'newLabel'), rOff + (halfW - 15) / 2, plotTop + 12, rightP, {
        color: colors.insight, font: 'bold 11px "Segoe UI", system-ui, sans-serif'
      });

      // Mini axes
      ctx.save();
      ctx.globalAlpha = rightP;
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      const rAxisX = rOff + 35;
      const rAxisY = plotBottom - 20;
      ctx.beginPath();
      ctx.moveTo(rAxisX, plotTop + 25);
      ctx.lineTo(rAxisX, rAxisY);
      ctx.lineTo(rOff + halfW - 25, rAxisY);
      ctx.stroke();
      ctx.restore();

      // Draw non-saturating loss: -log(d) for d in [0.01, 1]
      const rCurveP = easedSub(progress, 0.4, 0.65);
      if (rCurveP > 0) {
        ctx.save();
        ctx.globalAlpha = rCurveP;
        ctx.strokeStyle = colors.insight;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const steps = 80;
        const plotW = halfW - 60;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const xEnd = rCurveP;
          if (t > xEnd) break;
          const d = Math.max(t, 0.01);
          const loss = -Math.log(d);
          // Map: d=0->left, d=1->right; loss=0->baseline, loss=big->top
          const px = rAxisX + plotW * d;
          const py = rAxisY - Math.min(loss, 5) * (plotH * 0.12);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Strong gradient annotation
      const strongP = easedSub(progress, 0.6, 0.75);
      if (strongP > 0) {
        fadeInText(ctx, tx('scene3', 'strongGrad'), rAxisX + 10, rAxisY - plotH * 0.35, strongP, {
          color: colors.insight, font: '10px "Segoe UI", system-ui, sans-serif', align: 'left'
        });
      }
    }

    // Same optimum label
    const optP = easedSub(progress, 0.75, 0.9);
    if (optP > 0) {
      fadeInText(ctx, tx('scene3', 'sameOptimum'), W / 2, H - 25, optP, {
        color: colors.warning, font: 'bold 12px "Segoe UI", system-ui, sans-serif'
      });
    }
  }
});
