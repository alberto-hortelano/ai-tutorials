// Scene: Jacobian Intuition — Why we need det J (balloon/stretching analogy)
// Two rectangles with dots: uniform z-space → stretched x-space

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut, easeInOut } from '../../engine/animation/tween';
import { fadeInText, typewriterText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { sampleUniform1D } from '../_shared/flow-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const sceneJacobianIntuition = new Scene({
  id: () => tx('sceneJacIntuition', 'id'),
  duration: 22,
  narration: () => tx('sceneJacIntuition', 'narration'),
  subtitleCues: () => (text[getLang()]?.sceneJacIntuition as SceneText)?.subtitleCues ?? (text.es.sceneJacIntuition as SceneText).subtitleCues,
  topic: () => tx('sceneJacIntuition', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // ── Phase 0: Title ──
    fadeInText(ctx, tx('sceneJacIntuition', 'title'), W / 2, 28, easedSub(progress, 0, 0.06), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // ── Phase 1: Motivating question ──
    const qP = easedSub(progress, 0.04, 0.16);
    if (qP > 0) {
      typewriterText(ctx, tx('sceneJacIntuition', 'question'), W / 2, 52, qP, {
        color: colors.warning, font: `italic 11px ${fonts.body}`
      });
    }

    // ── Shared geometry ──
    const rectW = W * 0.28;
    const rectH = H * 0.22;
    const rectY = H * 0.24;
    const gapX = W * 0.12;
    const zRectX = W / 2 - gapX / 2 - rectW;    // left rect
    const xRectX = W / 2 + gapX / 2;             // right rect (wider)
    const xRectW = rectW * 1.4;                   // stretched

    // Pre-compute dots (seeded, deterministic)
    const nDots = 20;
    const dotsX = sampleUniform1D(nDots, 0, 1, 123);
    const dotsY = sampleUniform1D(nDots, 0, 1, 456);

    // ── Phase 2: z-space rectangle with uniform dots ──
    const zP = easedSub(progress, 0.12, 0.30, easeOut);
    if (zP > 0) {
      ctx.save();
      ctx.globalAlpha = zP;

      // Rectangle background (uniform shading)
      ctx.fillStyle = series[0] + '18';
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(zRectX, rectY, rectW, rectH, 4);
      ctx.fill();
      ctx.stroke();

      // Label
      ctx.fillStyle = series[0];
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('sceneJacIntuition', 'zSpaceLabel'), zRectX + rectW / 2, rectY - 8);

      // Uniform dots
      for (let i = 0; i < nDots; i++) {
        const dotAlpha = easedSub(progress, 0.14 + i * 0.005, 0.22 + i * 0.005, easeOut);
        if (dotAlpha <= 0) continue;
        const dx = zRectX + 6 + dotsX[i] * (rectW - 12);
        const dy = rectY + 6 + dotsY[i] * (rectH - 12);
        ctx.beginPath();
        ctx.arc(dx, dy, 3, 0, Math.PI * 2);
        ctx.fillStyle = series[0];
        ctx.globalAlpha = zP * dotAlpha * 0.85;
        ctx.fill();
      }

      ctx.restore();
    }

    // ── Phase 3: Arrow "stretches" ──
    const arrowP = easedSub(progress, 0.28, 0.42, easeInOut);
    if (arrowP > 0) {
      ctx.save();
      ctx.globalAlpha = arrowP;

      const arrowY = rectY + rectH / 2;
      const arrowStartX = zRectX + rectW + 6;
      const arrowEndX = xRectX - 6;
      const midX = (arrowStartX + arrowEndX) / 2;

      // Line
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(arrowStartX, arrowY);
      ctx.lineTo(arrowEndX - 4, arrowY);
      ctx.stroke();

      // Arrowhead
      ctx.fillStyle = colors.textMuted;
      ctx.beginPath();
      ctx.moveTo(arrowEndX, arrowY);
      ctx.lineTo(arrowEndX - 7, arrowY - 4);
      ctx.lineTo(arrowEndX - 7, arrowY + 4);
      ctx.closePath();
      ctx.fill();

      // Label
      ctx.fillStyle = colors.warning;
      ctx.font = `bold 10px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('sceneJacIntuition', 'stretchArrow'), midX, arrowY - 10);

      ctx.restore();
    }

    // ── Phase 4: x-space rectangle with non-uniform dots ──
    const xP = easedSub(progress, 0.35, 0.55, easeOut);
    if (xP > 0) {
      ctx.save();
      ctx.globalAlpha = xP;

      // Gradient background: dense (left) → sparse (right)
      const grad = ctx.createLinearGradient(xRectX, 0, xRectX + xRectW, 0);
      grad.addColorStop(0, series[1] + '35');
      grad.addColorStop(1, series[1] + '08');
      ctx.fillStyle = grad;
      ctx.strokeStyle = series[1];
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(xRectX, rectY, xRectW, rectH, 4);
      ctx.fill();
      ctx.stroke();

      // Label
      ctx.fillStyle = series[1];
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('sceneJacIntuition', 'xSpaceLabel'), xRectX + xRectW / 2, rectY - 8);

      // Non-uniform dots: apply x^1.5 transform (cluster left)
      for (let i = 0; i < nDots; i++) {
        const dotAlpha = easedSub(progress, 0.37 + i * 0.005, 0.47 + i * 0.005, easeOut);
        if (dotAlpha <= 0) continue;
        const tx_val = Math.pow(dotsX[i], 1.5); // cluster toward left
        const dx = xRectX + 6 + tx_val * (xRectW - 12);
        const dy = rectY + 6 + dotsY[i] * (rectH - 12);
        ctx.beginPath();
        ctx.arc(dx, dy, 3, 0, Math.PI * 2);
        ctx.fillStyle = series[1];
        ctx.globalAlpha = xP * dotAlpha * 0.85;
        ctx.fill();
      }

      ctx.restore();
    }

    // ── Phase 5: Density annotations ──
    const annP = easedSub(progress, 0.50, 0.65);
    if (annP > 0) {
      const annY = rectY + rectH + 18;

      // "High density" (left side of x-rect)
      fadeInText(ctx, tx('sceneJacIntuition', 'densityHigh'), xRectX + xRectW * 0.2, annY, annP, {
        color: colors.accent, font: `bold 10px ${fonts.body}`
      });

      // "Low density" (right side of x-rect)
      fadeInText(ctx, tx('sceneJacIntuition', 'densityLow'), xRectX + xRectW * 0.8, annY, annP, {
        color: colors.warning, font: `bold 10px ${fonts.body}`
      });
    }

    // ── Phase 6: Explanation text ──
    const expP = easedSub(progress, 0.62, 0.78);
    if (expP > 0) {
      const expY = H * 0.62;
      fadeInText(ctx, tx('sceneJacIntuition', 'jacobianMeasures'), W / 2, expY, expP, {
        color: colors.textSecondary, font: `11px ${fonts.body}`
      });
    }

    // ── Phase 7: Formula ──
    const fmP = easedSub(progress, 0.72, 0.86);
    if (fmP > 0) {
      formulaAppear(state.formulaManager, 'jacInt_eq',
        'p_X(x) = p_Z(f^{-1}(x)) \\cdot \\colorbox{#2d3461}{|\\det J^{-1}|}',
        50, 76, fmP, { color: colors.textPrimary, fontSize: '1.05em' });
    }

    // ── Phase 8: Insight box ──
    const insP = easedSub(progress, 0.86, 0.97);
    if (insP > 0) {
      const insY = H * 0.92;
      ctx.save();
      ctx.globalAlpha = insP;

      ctx.fillStyle = colors.insight + '15';
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(W * 0.15, insY - 12, W * 0.7, 24, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.insight;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('sceneJacIntuition', 'insight'), W / 2, insY + 4);

      ctx.restore();
    }
  }
});
