// Scene 2: Vanishing Gradients — D too good, log(1-D(G(z))) ~ 0

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateCurve } from '../../engine/animation/graph';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene2 = new Scene({
  id: () => tx('scene2', 'id'),
  duration: 22,
  narration: () => tx('scene2', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene2 as SceneText)?.subtitleCues ?? (text.es.scene2 as SceneText).subtitleCues,
  topic: () => tx('scene2', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene2', 'title'), W / 2, 30, easedSub(progress, 0, 0.1), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif'
    });

    // Set up viewport for the loss curve
    r.setViewport(0, 1, -7, 0.5);

    // Axes
    const axesP = easedSub(progress, 0.08, 0.22);
    if (axesP > 0) {
      ctx.globalAlpha = axesP;
      r.drawAxes({ xLabel: tx('scene2', 'xLabel'), yLabel: tx('scene2', 'yLabel'), xTicks: 5, yTicks: 4 });
      ctx.globalAlpha = 1;
    }

    // The loss curve: log(1 - D(G(z)))
    // When D(G(z)) is near 0 (D rejects fakes), loss ~ log(1) ~ 0: flat!
    // When D(G(z)) is near 1 (D fooled), loss ~ log(0) ~ -inf
    const lossFn = (d: number): number => {
      const clamped = Math.max(0.001, Math.min(0.999, d));
      return Math.log(1 - clamped);
    };

    const curveP = easedSub(progress, 0.18, 0.45);
    if (curveP > 0) {
      animateCurve(r, lossFn, series[2], curveP, 2.5);
    }

    // Highlight the flat zone near D(G(z)) = 0
    const flatP = easedSub(progress, 0.4, 0.6);
    if (flatP > 0) {
      // Shaded flat region
      ctx.save();
      ctx.globalAlpha = flatP * 0.25;
      ctx.fillStyle = colors.error;
      const x0 = r.toX(0);
      const x1 = r.toX(0.15);
      const y0 = r.toY(0.5);
      const y1 = r.toY(-7);
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      ctx.restore();

      // Flat zone label
      fadeInText(ctx, tx('scene2', 'flatZone'), r.toX(0.07), r.toY(-2), flatP, {
        color: colors.error, font: 'bold 11px "Segoe UI", system-ui, sans-serif'
      });

      // Arrow pointing to flat region
      fadeInText(ctx, tx('scene2', 'dTooGood'), r.toX(0.07), r.toY(-3), flatP, {
        color: colors.textMuted, font: '10px "Segoe UI", system-ui, sans-serif'
      });
    }

    // Gradient visualization: tangent line at D(G(z)) ~ 0 is nearly horizontal
    const gradP = easedSub(progress, 0.55, 0.75);
    if (gradP > 0) {
      const xPt = 0.05;
      const yPt = lossFn(xPt);
      const pxPt = r.toX(xPt);
      const pyPt = r.toY(yPt);

      // Nearly flat tangent line
      ctx.save();
      ctx.globalAlpha = gradP;
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pxPt - 40, pyPt);
      ctx.lineTo(pxPt + 60, pyPt - 2); // almost no slope
      ctx.stroke();
      ctx.setLineDash([]);

      // Dot at the point
      ctx.beginPath();
      ctx.arc(pxPt, pyPt, 5, 0, Math.PI * 2);
      ctx.fillStyle = colors.warning;
      ctx.fill();
      ctx.restore();
    }

    // Desert metaphor — bottom area
    const desertP = easedSub(progress, 0.75, 0.92);
    if (desertP > 0) {
      // Draw a flat desert-like ground
      ctx.save();
      ctx.globalAlpha = desertP * 0.3;
      ctx.fillStyle = colors.warning;
      const groundY = H * 0.88;
      ctx.fillRect(W * 0.15, groundY, W * 0.7, 4);
      ctx.restore();

      // Small dot "lost" on the desert
      ctx.save();
      ctx.globalAlpha = desertP;
      ctx.beginPath();
      ctx.arc(W * 0.5, H * 0.86, 4, 0, Math.PI * 2);
      ctx.fillStyle = colors.error;
      ctx.fill();
      ctx.restore();

      fadeInText(ctx, tx('scene2', 'desertLabel'), W / 2, H - 20, desertP, {
        color: colors.warning, font: 'bold 12px "Segoe UI", system-ui, sans-serif'
      });
    }
  }
});
