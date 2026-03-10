// Scene 7: Training normalizing flows via MLE
// Enhanced: two-term loss clearly shown with descriptions

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeInOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { animateDots } from '../../engine/animation/particles';
import { sampleTwoMoons } from '../_shared/flow-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene7 = new Scene({
  id: () => tx('scene7', 'id'),
  duration: 22,
  narration: () => tx('scene7', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene7 as SceneText)?.subtitleCues ?? (text.es.scene7 as SceneText).subtitleCues,
  topic: () => tx('scene7', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene7', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    const plotCx = W / 2;
    const plotCy = H * 0.38;
    const plotScale = Math.min(W, H) * 0.15;

    // Data points (two moons)
    const dataP = easedSub(progress, 0.05, 0.2);
    const dataPts = sampleTwoMoons(120, 0.06, 42);
    if (dataP > 0) {
      const pixPts = dataPts.map(p => ({
        x: plotCx + p.x * plotScale,
        y: plotCy - p.y * plotScale,
      }));
      animateDots(ctx, pixPts, dataP, {
        color: series[0], radius: 2.5, sequential: false,
      });

      fadeInText(ctx, tx('scene7', 'dataLabel'), plotCx + plotScale * 2.2, plotCy - plotScale * 0.8, dataP, {
        color: series[0], font: `11px ${fonts.body}`, align: 'left'
      });
    }

    // Contour lines morphing to fit data
    const contourT = easedSub(progress, 0.2, 0.55, easeInOut);
    if (contourT > 0) {
      ctx.save();
      ctx.globalAlpha = contourT * 0.7;

      const nContours = 5;
      for (let ci = 0; ci < nContours; ci++) {
        const radius = 0.3 + ci * 0.35;
        ctx.strokeStyle = series[2];
        ctx.lineWidth = 1.5 - ci * 0.2;
        ctx.beginPath();

        const steps = 100;
        for (let s = 0; s <= steps; s++) {
          const angle = (s / steps) * Math.PI * 2;
          let cx = Math.cos(angle) * radius;
          let cy = Math.sin(angle) * radius;
          const deformX = cx + contourT * (0.3 * Math.sin(angle * 2) + 0.1 * Math.cos(angle * 3));
          const deformY = cy + contourT * (0.2 * Math.cos(angle * 2) - 0.15 * Math.sin(angle));
          const px = plotCx + deformX * plotScale;
          const py = plotCy - deformY * plotScale;
          if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }

      if (contourT > 0.5) {
        fadeInText(ctx, tx('scene7', 'contoursLabel'), plotCx - plotScale * 2, plotCy + plotScale * 0.5, (contourT - 0.5) * 2, {
          color: series[2], font: `11px ${fonts.body}`, align: 'right'
        });
      }

      ctx.restore();
    }

    // --- Two-term loss visualization ---
    const termY = H * 0.66;
    const termBoxW = W * 0.4;
    const termBoxH = 50;

    // Term 1: Prior likelihood — "How likely is z under the base?"
    const term1P = easedSub(progress, 0.45, 0.62);
    if (term1P > 0) {
      ctx.save();
      ctx.globalAlpha = term1P;
      const bx = W * 0.26;

      // Box
      ctx.fillStyle = series[0] + '15';
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bx - termBoxW / 2, termY - termBoxH / 2, termBoxW, termBoxH, 6);
      ctx.fill();
      ctx.stroke();

      // Term name
      ctx.fillStyle = series[0];
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene7', 'term1'), bx, termY - 8);

      // Description
      ctx.fillStyle = colors.textSecondary;
      ctx.font = `10px ${fonts.body}`;
      ctx.fillText(tx('scene7', 'term1Desc'), bx, termY + 12);

      ctx.restore();
    }

    // Term 2: Volume correction — "How much did we stretch/compress?"
    const term2P = easedSub(progress, 0.55, 0.72);
    if (term2P > 0) {
      ctx.save();
      ctx.globalAlpha = term2P;
      const bx = W * 0.74;

      // Box
      ctx.fillStyle = series[3] + '15';
      ctx.strokeStyle = series[3];
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bx - termBoxW / 2, termY - termBoxH / 2, termBoxW, termBoxH, 6);
      ctx.fill();
      ctx.stroke();

      // Term name
      ctx.fillStyle = series[3];
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene7', 'term2'), bx, termY - 8);

      // Description
      ctx.fillStyle = colors.textSecondary;
      ctx.font = `10px ${fonts.body}`;
      ctx.fillText(tx('scene7', 'term2Desc'), bx, termY + 12);

      ctx.restore();
    }

    // Plus sign between the two terms
    const plusP = easedSub(progress, 0.6, 0.7);
    if (plusP > 0) {
      ctx.save();
      ctx.globalAlpha = plusP;
      ctx.fillStyle = colors.textPrimary;
      ctx.font = `bold 18px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('+', W / 2, termY + 2);
      ctx.restore();
    }

    // "Exact log-likelihood" badge
    const exactP = easedSub(progress, 0.72, 0.82);
    if (exactP > 0) {
      const by = termY + termBoxH / 2 + 18;
      ctx.save();
      ctx.globalAlpha = exactP;
      ctx.fillStyle = colors.insight + '20';
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(W / 2 - 100, by - 12, 200, 24, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colors.insight;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene7', 'exactLL'), W / 2, by + 3);
      ctx.restore();
    }

    // Formula
    const fP = easedSub(progress, 0.82, 0.97);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'train',
        '\\log p(\\mathbf{x}) = \\underbrace{\\log p_Z\\bigl(f^{-1}(\\mathbf{x})\\bigr)}_{\\text{prior}} + \\underbrace{\\log\\left|\\det \\frac{\\partial f^{-1}}{\\partial \\mathbf{x}}\\right|}_{\\text{volume}}',
        50, 92, fP, { color: colors.textPrimary, fontSize: '0.9em' });
    }
  }
});
