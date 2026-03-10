// Scene 7: Bridge to Score Models — ∇_x log p(x) = -∇_x E(x)

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { animateCurve } from '../../engine/animation/graph';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

/** Energy landscape (1D) */
function energyFn(x: number): number {
  return 1.5 + 1.2 * Math.sin(x * 1.1) + 0.5 * Math.cos(x * 2.3);
}

/** Energy gradient (numerical, 1D) */
function energyGrad(x: number): number {
  const dx = 0.01;
  return (energyFn(x + dx) - energyFn(x - dx)) / (2 * dx);
}

/** Score function = -∇E (1D, as a vector field for y=const) */
function scoreFn(x: number, _y: number): { vx: number; vy: number } {
  return { vx: -energyGrad(x), vy: 0 };
}

export const scene7 = new Scene({
  id: () => tx('scene7', 'id'),
  duration: 24,
  narration: () => tx('scene7', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene7 as SceneText)?.subtitleCues ?? (text.es.scene7 as SceneText).subtitleCues,
  topic: () => tx('scene7', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene7', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Energy landscape
    r.setViewport(0, 10, 0, 4);
    const axesP = easedSub(progress, 0.05, 0.18);
    if (axesP > 0) {
      ctx.globalAlpha = axesP;
      r.drawAxes({ xLabel: 'x', yLabel: 'E(x)', xTicks: 5, yTicks: 4 });
      ctx.globalAlpha = 1;
    }

    const curveP = easedSub(progress, 0.1, 0.28);
    if (curveP > 0) {
      animateCurve(r, energyFn, colors.textMuted, curveP, 2);
    }

    // Score = -∇E formula derivation
    const derive1P = easedSub(progress, 0.25, 0.45);
    if (derive1P > 0) {
      formulaAppear(state.formulaManager, 'ebm-bridge-1',
        '\\nabla_x \\log p(x) = \\nabla_x \\log \\frac{e^{-E(x)}}{Z}',
        50, 68, derive1P, { color: colors.textSecondary, fontSize: '1.1em' });
    }

    const derive2P = easedSub(progress, 0.4, 0.58);
    if (derive2P > 0) {
      formulaAppear(state.formulaManager, 'ebm-bridge-2',
        '= -\\nabla_x E(x) - \\underbrace{\\nabla_x \\log Z}_{= 0}',
        50, 80, derive2P, { color: colors.accent, fontSize: '1.1em' });
    }

    // Strikethrough on ∇log Z (Z doesn't depend on x)
    const cancelP = easedSub(progress, 0.52, 0.65);
    if (cancelP > 0) {
      fadeInText(ctx, tx('scene7', 'noZ'), W * 0.75, H * 0.88, cancelP, {
        color: colors.insight, font: 'bold 15px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Final: score = -∇E
    const finalP = easedSub(progress, 0.6, 0.75);
    if (finalP > 0) {
      formulaAppear(state.formulaManager, 'ebm-bridge-final',
        's(x) = \\nabla_x \\log p(x) = -\\nabla_x E(x)',
        50, 92, finalP, { color: colors.insight, fontSize: '1.2em' });
    }

    // Score vector field overlay on the energy landscape
    const fieldP = easedSub(progress, 0.7, 0.9);
    if (fieldP > 0) {
      // Draw horizontal arrows at the surface of the energy landscape
      const nArrows = 16;
      ctx.save();
      ctx.globalAlpha = fieldP * 0.8;
      for (let i = 1; i < nArrows; i++) {
        const x = (i / nArrows) * 10;
        const score = -energyGrad(x);
        const ex = energyFn(x);
        const px = r.toX(x);
        const py = r.toY(ex);
        const arrowLen = Math.min(Math.abs(score) * 12, 25) * Math.sign(score);

        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + arrowLen * fieldP, py);
        ctx.stroke();

        // Arrowhead
        if (Math.abs(arrowLen) > 3) {
          const dir = Math.sign(arrowLen);
          ctx.fillStyle = colors.accent;
          ctx.beginPath();
          ctx.moveTo(px + arrowLen * fieldP, py);
          ctx.lineTo(px + arrowLen * fieldP - dir * 5, py - 3);
          ctx.lineTo(px + arrowLen * fieldP - dir * 5, py + 3);
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // Bridge text
    const bridgeP = easedSub(progress, 0.88, 1);
    fadeInText(ctx, tx('scene7', 'bridge'), W / 2, H - 20, bridgeP, {
      color: colors.accent, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
    });
  },
});
