// Scene 6: Gradient Penalty (WGAN-GP) — interpolation + penalty lambda*(||grad||-1)^2

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { formulaAppear } from '../../engine/animation/formula';
import { animateDots } from '../../engine/animation/particles';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene6 = new Scene({
  id: () => tx('scene6', 'id'),
  duration: 22,
  narration: () => tx('scene6', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene6 as SceneText)?.subtitleCues ?? (text.es.scene6 as SceneText).subtitleCues,
  topic: () => tx('scene6', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene6', 'title'), W / 2, 25, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Formula
    const fmP = easedSub(progress, 0.05, 0.2);
    if (fmP > 0) {
      formulaAppear(state.formulaManager, 'gp',
        '\\mathcal{L}_{GP} = \\lambda \\, \\mathbb{E}_{\\hat{x}}\\!\\left[\\left(\\|\\nabla_{\\hat{x}} f(\\hat{x})\\| - 1\\right)^2\\right]',
        50, 13, fmP, { color: colors.accent, fontSize: '0.8em' });
    }

    const midY = H * 0.55;
    const plotW = W - 60;
    const plotLeft = 30;

    // Real data points (left cluster)
    const realPts = [
      { x: plotLeft + plotW * 0.1, y: midY - 20 },
      { x: plotLeft + plotW * 0.12, y: midY + 10 },
      { x: plotLeft + plotW * 0.15, y: midY - 5 },
      { x: plotLeft + plotW * 0.08, y: midY + 15 },
      { x: plotLeft + plotW * 0.18, y: midY - 15 },
    ];

    // Fake data points (right cluster)
    const fakePts = [
      { x: plotLeft + plotW * 0.82, y: midY - 15 },
      { x: plotLeft + plotW * 0.85, y: midY + 8 },
      { x: plotLeft + plotW * 0.88, y: midY - 3 },
      { x: plotLeft + plotW * 0.8, y: midY + 20 },
      { x: plotLeft + plotW * 0.9, y: midY - 10 },
    ];

    // Draw real points
    const realP = easedSub(progress, 0.1, 0.3);
    if (realP > 0) {
      animateDots(ctx, realPts, realP, { color: series[0], radius: 5, sequential: false });
      fadeInText(ctx, 'x_real', plotLeft + plotW * 0.12, midY + 35, realP, {
        color: series[0], font: 'bold 10px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Draw fake points
    const fakeP = easedSub(progress, 0.15, 0.35);
    if (fakeP > 0) {
      animateDots(ctx, fakePts, fakeP, { color: series[2], radius: 5, sequential: false });
      fadeInText(ctx, 'x_fake', plotLeft + plotW * 0.85, midY + 35, fakeP, {
        color: series[2], font: 'bold 10px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Interpolation lines connecting real to fake
    const interpP = easedSub(progress, 0.3, 0.6);
    if (interpP > 0) {
      ctx.save();
      ctx.globalAlpha = interpP * 0.4;
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      for (let i = 0; i < Math.min(realPts.length, fakePts.length); i++) {
        ctx.beginPath();
        ctx.moveTo(realPts[i].x, realPts[i].y);
        ctx.lineTo(realPts[i].x + (fakePts[i].x - realPts[i].x) * interpP, realPts[i].y + (fakePts[i].y - realPts[i].y) * interpP);
        ctx.stroke();
      }

      ctx.setLineDash([]);
      ctx.restore();
    }

    // Interpolated points along the lines
    const interpPtsP = easedSub(progress, 0.45, 0.7);
    if (interpPtsP > 0) {
      const interpPts: { x: number; y: number }[] = [];
      for (let i = 0; i < Math.min(realPts.length, fakePts.length); i++) {
        // t is random-ish per pair
        const t = 0.3 + (i * 0.15) % 0.4;
        interpPts.push({
          x: realPts[i].x + (fakePts[i].x - realPts[i].x) * t,
          y: realPts[i].y + (fakePts[i].y - realPts[i].y) * t,
        });
      }

      animateDots(ctx, interpPts, interpPtsP, { color: colors.warning, radius: 4, sequential: false });

      // Gradient arrows at interpolated points (pushed toward norm 1)
      const gradP = easedSub(progress, 0.55, 0.8);
      if (gradP > 0) {
        for (const pt of interpPts) {
          const arrowLen = 20 * gradP;
          // Random-ish angle
          const angle = Math.atan2(fakePts[0].y - realPts[0].y, fakePts[0].x - realPts[0].x) + (pt.x % 0.3);
          animateArrow(ctx, pt.x, pt.y, pt.x + arrowLen * Math.cos(angle), pt.y + arrowLen * Math.sin(angle), gradP, {
            color: colors.insight, lineWidth: 1.5, headSize: 5,
          });
        }

        fadeInText(ctx, tx('scene6', 'gradLabel'), plotLeft + plotW / 2, midY - 40, gradP, {
          color: colors.insight, font: 'bold 11px "Segoe UI", system-ui, sans-serif',
        });
      }

      fadeInText(ctx, tx('scene6', 'interpLabel'), plotLeft + plotW * 0.45, midY + 40, interpPtsP, {
        color: colors.warning, font: '10px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Penalty term explanation
    const penP = easedSub(progress, 0.75, 0.92);
    if (penP > 0) {
      fadeInText(ctx, tx('scene6', 'penaltyLabel'), W / 2, H - 45, penP, {
        color: colors.accent, font: '11px "Segoe UI", system-ui, sans-serif',
      });
      fadeInText(ctx, tx('scene6', 'lambdaLabel'), W / 2, H - 28, penP, {
        color: colors.textMuted, font: '10px "Segoe UI", system-ui, sans-serif',
      });
    }

    if (progress > 0.95) {
      state.formulaManager.hide('gp');
    }
  },
});
