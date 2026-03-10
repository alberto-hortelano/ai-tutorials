// Scene 3: Fenchel Conjugate — f*(s) = sup_t{s*t - f(t)}

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene3 = new Scene({
  id: () => tx('scene3', 'id'),
  duration: 22,
  narration: () => tx('scene3', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene3 as SceneText)?.subtitleCues ?? (text.es.scene3 as SceneText).subtitleCues,
  topic: () => tx('scene3', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.setViewport(-0.5, 4, -1, 5);
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene3', 'title'), W / 2, 25, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Formula
    const fmP = easedSub(progress, 0.05, 0.18);
    if (fmP > 0) {
      formulaAppear(state.formulaManager, 'fenchel', 'f^*(s) = \\sup_t \\{s\\cdot t - f(t)\\}', 50, 13, fmP, { color: colors.accent, fontSize: '1em' });
    }

    // Axes
    const axesP = easedSub(progress, 0.1, 0.22);
    if (axesP > 0) {
      ctx.globalAlpha = axesP;
      r.drawAxes({ xLabel: 't', yLabel: 'y', xTicks: 4, yTicks: 5 });
      ctx.globalAlpha = 1;
    }

    // Convex function f(t) = t*log(t) + 0.5 (shifted for visibility)
    const f = (t: number): number => t > 0.05 ? t * Math.log(t) + 0.5 : 0.5;
    const fPrime = (t: number): number => t > 0.05 ? Math.log(t) + 1 : -Infinity;

    // Draw f curve
    const curveP = easedSub(progress, 0.15, 0.35);
    if (curveP > 0) {
      const steps = 300;
      const tMin = 0.05, tMax = 3.5;
      const dt = (tMax - tMin) / steps;
      const nDraw = Math.floor(steps * curveP);

      ctx.save();
      ctx.globalAlpha = curveP;
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i <= nDraw; i++) {
        const t = tMin + i * dt;
        const px = r.toX(t), py = r.toY(f(t));
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();

      fadeInText(ctx, 'f(t)', r.toX(3.2), r.toY(f(3.2)) - 10, curveP, {
        color: series[0], font: 'bold 12px "Segoe UI", system-ui, sans-serif', align: 'center',
      });
    }

    // Animated tangent line sliding along f
    const tangentP = easedSub(progress, 0.3, 0.85);
    if (tangentP > 0) {
      // Tangent point moves from t=0.3 to t=3.0 over progress
      const tTouch = 0.3 + tangentP * 2.5;
      const s = fPrime(tTouch); // slope at touch point
      const yTouch = f(tTouch);

      // Draw tangent line: y = s*(t - tTouch) + yTouch
      ctx.save();
      ctx.globalAlpha = Math.min(tangentP * 2, 0.8);
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      const tLineMin = Math.max(-0.5, tTouch - 2);
      const tLineMax = Math.min(4, tTouch + 2);
      ctx.moveTo(r.toX(tLineMin), r.toY(s * (tLineMin - tTouch) + yTouch));
      ctx.lineTo(r.toX(tLineMax), r.toY(s * (tLineMax - tTouch) + yTouch));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Touch point dot
      r.dot(tTouch, yTouch, 5, colors.warning);

      // Gap visualization: s*t - f(t) at the touch point
      const gapVal = s * tTouch - f(tTouch);
      if (tangentP > 0.3) {
        fadeInText(ctx, tx('scene3', 'tangentLabel'), r.toX(tTouch) + 15, r.toY(yTouch) - 20, (tangentP - 0.3) / 0.7, {
          color: colors.warning, font: '10px "Segoe UI", system-ui, sans-serif', align: 'left',
        });
      }

      // Show gap value
      if (tangentP > 0.5) {
        const gapLabelP = (tangentP - 0.5) / 0.5;
        fadeInText(ctx, `f*(s) = ${gapVal.toFixed(2)}`, W - 20, H - 55, gapLabelP, {
          color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif', align: 'right',
        });
        fadeInText(ctx, `s = ${s.toFixed(2)}`, W - 20, H - 38, gapLabelP, {
          color: colors.textMuted, font: '11px "Segoe UI", system-ui, sans-serif', align: 'right',
        });
      }
    }

    // Duality note
    const dualP = easedSub(progress, 0.88, 1);
    if (dualP > 0) {
      fadeInText(ctx, 'f** = f', W / 2, H - 20, dualP, {
        color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
      });
    }

    if (progress > 0.95) {
      state.formulaManager.hide('fenchel');
    }
  },
});
