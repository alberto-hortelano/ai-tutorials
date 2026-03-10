// Scene 4: Variational Lower Bound — D_f >= sup_T E_P[T] - E_Q[f*(T)]

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { formulaAppear } from '../../engine/animation/formula';
import { gaussian } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene4 = new Scene({
  id: () => tx('scene4', 'id'),
  duration: 22,
  narration: () => tx('scene4', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene4 as SceneText)?.subtitleCues ?? (text.es.scene4 as SceneText).subtitleCues,
  topic: () => tx('scene4', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene4', 'title'), W / 2, 25, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Main formula
    const fmP = easedSub(progress, 0.05, 0.2);
    if (fmP > 0) {
      formulaAppear(state.formulaManager, 'varBound',
        'D_f(P\\|Q) \\geq \\sup_T \\left\\{\\mathbb{E}_P[T(x)] - \\mathbb{E}_Q[f^*(T(x))]\\right\\}',
        50, 14, fmP, { color: colors.accent, fontSize: '0.85em' });
    }

    // Diagram section
    const diagramTop = 90;
    const diagramH = H - diagramTop - 60;

    // P and Q distributions
    const pDist = (x: number): number => gaussian(x, 2, 0.8);
    const qDist = (x: number): number => gaussian(x, 4, 1.2);

    const xMin = -1, xMax = 8;
    const yMax = 0.55;
    const steps = 200;
    const dx = (xMax - xMin) / steps;

    const toX = (x: number): number => 20 + ((x - xMin) / (xMax - xMin)) * (W * 0.55 - 40);
    const toY = (y: number): number => diagramTop + diagramH - (y / yMax) * diagramH;

    // P distribution
    const distP = easedSub(progress, 0.15, 0.35);
    if (distP > 0) {
      ctx.save();
      ctx.globalAlpha = distP;

      // Fill P
      ctx.fillStyle = series[0] + '20';
      ctx.beginPath();
      ctx.moveTo(toX(xMin), toY(0));
      for (let i = 0; i <= steps; i++) {
        const x = xMin + i * dx;
        ctx.lineTo(toX(x), toY(pDist(x)));
      }
      ctx.lineTo(toX(xMax), toY(0));
      ctx.closePath();
      ctx.fill();

      // Curve P
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const x = xMin + i * dx;
        if (i === 0) ctx.moveTo(toX(x), toY(pDist(x)));
        else ctx.lineTo(toX(x), toY(pDist(x)));
      }
      ctx.stroke();

      fadeInText(ctx, 'P', toX(2), toY(pDist(2)) - 10, 1, {
        color: series[0], font: 'bold 12px "Segoe UI", system-ui, sans-serif',
      });

      ctx.restore();
    }

    // Q distribution
    const qP = easedSub(progress, 0.25, 0.45);
    if (qP > 0) {
      ctx.save();
      ctx.globalAlpha = qP;

      ctx.fillStyle = series[2] + '20';
      ctx.beginPath();
      ctx.moveTo(toX(xMin), toY(0));
      for (let i = 0; i <= steps; i++) {
        const x = xMin + i * dx;
        ctx.lineTo(toX(x), toY(qDist(x)));
      }
      ctx.lineTo(toX(xMax), toY(0));
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = series[2];
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const x = xMin + i * dx;
        if (i === 0) ctx.moveTo(toX(x), toY(qDist(x)));
        else ctx.lineTo(toX(x), toY(qDist(x)));
      }
      ctx.stroke();
      ctx.setLineDash([]);

      fadeInText(ctx, 'Q', toX(4), toY(qDist(4)) - 10, 1, {
        color: series[2], font: 'bold 12px "Segoe UI", system-ui, sans-serif',
      });

      ctx.restore();
    }

    // Neural network T box on the right
    const nnP = easedSub(progress, 0.4, 0.65);
    if (nnP > 0) {
      const nnX = W * 0.62;
      const nnY = diagramTop + 20;
      const nnW = W * 0.32;
      const nnH = diagramH * 0.5;

      ctx.save();
      ctx.globalAlpha = nnP;

      // Box
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      const rad = 8;
      ctx.beginPath();
      ctx.moveTo(nnX + rad, nnY);
      ctx.lineTo(nnX + nnW - rad, nnY);
      ctx.quadraticCurveTo(nnX + nnW, nnY, nnX + nnW, nnY + rad);
      ctx.lineTo(nnX + nnW, nnY + nnH - rad);
      ctx.quadraticCurveTo(nnX + nnW, nnY + nnH, nnX + nnW - rad, nnY + nnH);
      ctx.lineTo(nnX + rad, nnY + nnH);
      ctx.quadraticCurveTo(nnX, nnY + nnH, nnX, nnY + nnH - rad);
      ctx.lineTo(nnX, nnY + rad);
      ctx.quadraticCurveTo(nnX, nnY, nnX + rad, nnY);
      ctx.closePath();
      ctx.fillStyle = colors.accent + '15';
      ctx.fill();
      ctx.stroke();

      fadeInText(ctx, tx('scene4', 'neuralLabel'), nnX + nnW / 2, nnY + nnH / 2 - 10, 1, {
        color: colors.accent, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
      });

      // E_P[T] label
      fadeInText(ctx, 'E_P[T(x)]', nnX + nnW / 2, nnY + nnH / 2 + 12, 1, {
        color: series[0], font: '11px "Segoe UI", system-ui, sans-serif',
      });

      // E_Q[f*(T)] label
      fadeInText(ctx, '- E_Q[f*(T(x))]', nnX + nnW / 2, nnY + nnH / 2 + 28, 1, {
        color: series[2], font: '11px "Segoe UI", system-ui, sans-serif',
      });

      ctx.restore();
    }

    // Arrows connecting distributions to T
    const arrowP = easedSub(progress, 0.55, 0.75);
    if (arrowP > 0) {
      const nnX = W * 0.62;
      const nnY = diagramTop + 20;
      const nnH = diagramH * 0.5;

      animateArrow(ctx, W * 0.55, diagramTop + diagramH * 0.3, nnX - 5, nnY + nnH * 0.3, arrowP, {
        color: series[0], lineWidth: 1.5,
      });
      animateArrow(ctx, W * 0.55, diagramTop + diagramH * 0.5, nnX - 5, nnY + nnH * 0.7, arrowP, {
        color: series[2], lineWidth: 1.5,
      });
    }

    // Insight
    const insP = easedSub(progress, 0.82, 1);
    if (insP > 0) {
      fadeInText(ctx, tx('scene4', 'insight'), W / 2, H - 22, insP, {
        color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
      });
    }

    if (progress > 0.95) {
      state.formulaManager.hide('varBound');
    }
  },
});
