// Scene 1: f-Divergence Family — D_f(P||Q) = E_Q[f(p/q)]

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene1 = new Scene({
  id: () => tx('scene1', 'id'),
  duration: 20,
  narration: () => tx('scene1', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene1 as SceneText)?.subtitleCues ?? (text.es.scene1 as SceneText).subtitleCues,
  topic: () => tx('scene1', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.setViewport(0, 3, -1, 4);
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene1', 'title'), W / 2, 25, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Formula overlay
    const fmP = easedSub(progress, 0.05, 0.18);
    if (fmP > 0) {
      formulaAppear(state.formulaManager, 'fDiv', 'D_f(P\\|Q) = \\mathbb{E}_Q\\!\\left[f\\!\\left(\\tfrac{p(x)}{q(x)}\\right)\\right]', 50, 14, fmP, { color: colors.accent, fontSize: '1em' });
    }

    // Axes
    const axesP = easedSub(progress, 0.12, 0.25);
    if (axesP > 0) {
      ctx.globalAlpha = axesP;
      r.drawAxes({ xLabel: 't = p/q', yLabel: 'f(t)', xTicks: 3, yTicks: 4 });
      ctx.globalAlpha = 1;
    }

    // f functions
    const klF = (t: number): number => t > 0.01 ? t * Math.log(t) : 0;
    const chiF = (t: number): number => (t - 1) * (t - 1);
    const revF = (t: number): number => t > 0.01 ? -Math.log(t) : 4;

    const steps = 300;
    const tMin = 0.05, tMax = 3;
    const dt = (tMax - tMin) / steps;

    // KL curve: t log t
    const klP = easedSub(progress, 0.2, 0.45);
    if (klP > 0) {
      ctx.save();
      ctx.globalAlpha = klP;
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const nDraw = Math.floor(steps * klP);
      for (let i = 0; i <= nDraw; i++) {
        const t = tMin + i * dt;
        const px = r.toX(t), py = r.toY(klF(t));
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();

      if (klP > 0.5) {
        fadeInText(ctx, tx('scene1', 'klLabel'), r.toX(2.5) + 5, r.toY(klF(2.5)) - 12, (klP - 0.5) * 2, {
          color: series[0], font: '11px "Segoe UI", system-ui, sans-serif', align: 'left',
        });
      }
    }

    // Chi-squared curve: (t-1)^2
    const chiP = easedSub(progress, 0.35, 0.6);
    if (chiP > 0) {
      ctx.save();
      ctx.globalAlpha = chiP;
      ctx.strokeStyle = series[2];
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const nDraw = Math.floor(steps * chiP);
      for (let i = 0; i <= nDraw; i++) {
        const t = tMin + i * dt;
        const val = Math.min(chiF(t), 4);
        const px = r.toX(t), py = r.toY(val);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();

      if (chiP > 0.5) {
        fadeInText(ctx, tx('scene1', 'chiLabel'), r.toX(2.2), r.toY(Math.min(chiF(2.2), 3.8)) - 12, (chiP - 0.5) * 2, {
          color: series[2], font: '11px "Segoe UI", system-ui, sans-serif', align: 'center',
        });
      }
    }

    // Reverse KL curve: -log t
    const revP = easedSub(progress, 0.5, 0.75);
    if (revP > 0) {
      ctx.save();
      ctx.globalAlpha = revP;
      ctx.strokeStyle = series[3];
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const nDraw = Math.floor(steps * revP);
      for (let i = 0; i <= nDraw; i++) {
        const t = tMin + i * dt;
        const val = Math.min(revF(t), 4);
        const px = r.toX(t), py = r.toY(val);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();

      if (revP > 0.5) {
        fadeInText(ctx, tx('scene1', 'revLabel'), r.toX(0.3), r.toY(revF(0.3)) - 12, (revP - 0.5) * 2, {
          color: series[3], font: '11px "Segoe UI", system-ui, sans-serif', align: 'center',
        });
      }
    }

    // Fixed point (1, 0)
    const dotP = easedSub(progress, 0.7, 0.85);
    if (dotP > 0) {
      r.dot(1, 0, 6 * dotP, colors.insight);
      fadeInText(ctx, tx('scene1', 'fixedPoint'), r.toX(1) + 10, r.toY(0) + 15, dotP, {
        color: colors.insight, font: 'bold 11px "Segoe UI", system-ui, sans-serif', align: 'left',
      });
    }

    // Hide formula at end
    if (progress > 0.95) {
      state.formulaManager.hide('fDiv');
    }
  },
});
