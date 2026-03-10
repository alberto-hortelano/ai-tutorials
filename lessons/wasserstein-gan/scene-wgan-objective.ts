// Scene 3: WGAN Objective — critic with Lipschitz constraint

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateCurve } from '../../engine/animation/graph';
import { formulaAppear } from '../../engine/animation/formula';
import { gaussian } from '../../engine/shared/math-utils';
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
    r.setViewport(-5, 7, -2, 3);
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene3', 'title'), W / 2, 25, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Formula
    const fmP = easedSub(progress, 0.05, 0.2);
    if (fmP > 0) {
      formulaAppear(state.formulaManager, 'wganObj',
        'W(P_r, P_g) = \\max_{\\|f\\|_L \\leq 1} \\; \\mathbb{E}_{x \\sim P_r}[f(x)] - \\mathbb{E}_{x \\sim P_g}[f(x)]',
        50, 14, fmP, { color: colors.accent, fontSize: '0.75em' });
    }

    // Axes
    const axesP = easedSub(progress, 0.12, 0.25);
    if (axesP > 0) {
      ctx.globalAlpha = axesP;
      r.drawAxes({ xLabel: 'x', yLabel: 'f(x)', xTicks: 6, yTicks: 4 });
      ctx.globalAlpha = 1;
    }

    // P_real distribution (background)
    const realDistP = easedSub(progress, 0.15, 0.35);
    if (realDistP > 0) {
      const steps = 200;
      ctx.save();
      ctx.globalAlpha = realDistP * 0.3;
      ctx.fillStyle = series[0];
      ctx.beginPath();
      ctx.moveTo(r.toX(-5), r.toY(-2));
      for (let i = 0; i <= steps; i++) {
        const x = -5 + i * 12 / steps;
        const y = -2 + gaussian(x, -1, 0.8) * 3;
        ctx.lineTo(r.toX(x), r.toY(y));
      }
      ctx.lineTo(r.toX(7), r.toY(-2));
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      fadeInText(ctx, tx('scene3', 'realLabel'), r.toX(-1), r.toY(-1.5), realDistP, {
        color: series[0], font: '10px "Segoe UI", system-ui, sans-serif',
      });
    }

    // P_gen distribution (background)
    const fakeDistP = easedSub(progress, 0.2, 0.4);
    if (fakeDistP > 0) {
      const steps = 200;
      ctx.save();
      ctx.globalAlpha = fakeDistP * 0.3;
      ctx.fillStyle = series[2];
      ctx.beginPath();
      ctx.moveTo(r.toX(-5), r.toY(-2));
      for (let i = 0; i <= steps; i++) {
        const x = -5 + i * 12 / steps;
        const y = -2 + gaussian(x, 3, 1.0) * 3;
        ctx.lineTo(r.toX(x), r.toY(y));
      }
      ctx.lineTo(r.toX(7), r.toY(-2));
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      fadeInText(ctx, tx('scene3', 'fakeLabel'), r.toX(3), r.toY(-1.5), fakeDistP, {
        color: series[2], font: '10px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Critic function: high over real data, low over fakes
    // f(x) = tanh(-(x-1)) gives ~1 at x=-1, ~-1 at x=3
    const criticFn = (x: number): number => Math.tanh(-(x - 1) * 0.8) * 1.5;

    const criticP = easedSub(progress, 0.35, 0.65);
    if (criticP > 0) {
      animateCurve(r, criticFn, colors.warning, criticP, 2.5);

      if (criticP > 0.5) {
        fadeInText(ctx, tx('scene3', 'criticLabel'), r.toX(5.5), r.toY(criticFn(5.5)) - 12, (criticP - 0.5) * 2, {
          color: colors.warning, font: 'bold 11px "Segoe UI", system-ui, sans-serif', align: 'center',
        });
      }
    }

    // Gap annotation: E_real[f] - E_fake[f]
    const gapP = easedSub(progress, 0.6, 0.8);
    if (gapP > 0) {
      const realY = criticFn(-1);
      const fakeY = criticFn(3);

      // Vertical bracket showing the gap
      ctx.save();
      ctx.globalAlpha = gapP;

      // Dashed lines
      ctx.strokeStyle = series[0] + '80';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(r.toX(-1), r.toY(realY));
      ctx.lineTo(W - 40, r.toY(realY));
      ctx.stroke();

      ctx.strokeStyle = series[2] + '80';
      ctx.beginPath();
      ctx.moveTo(r.toX(3), r.toY(fakeY));
      ctx.lineTo(W - 40, r.toY(fakeY));
      ctx.stroke();
      ctx.setLineDash([]);

      // Gap bracket
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W - 35, r.toY(realY));
      ctx.lineTo(W - 30, r.toY(realY));
      ctx.lineTo(W - 30, r.toY(fakeY));
      ctx.lineTo(W - 35, r.toY(fakeY));
      ctx.stroke();

      fadeInText(ctx, tx('scene3', 'gapLabel'), W - 25, (r.toY(realY) + r.toY(fakeY)) / 2, gapP, {
        color: colors.insight, font: 'bold 9px "Segoe UI", system-ui, sans-serif', align: 'left',
      });

      ctx.restore();
    }

    // Lipschitz constraint note
    const lipP = easedSub(progress, 0.78, 0.95);
    if (lipP > 0) {
      fadeInText(ctx, tx('scene3', 'lipLabel'), W / 2, H - 20, lipP, {
        color: colors.textMuted, font: 'bold 11px "Segoe UI", system-ui, sans-serif',
      });
    }

    if (progress > 0.95) {
      state.formulaManager.hide('wganObj');
    }
  },
});
