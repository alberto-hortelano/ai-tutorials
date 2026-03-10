// Scene 3: The Discriminator — D(x) in [0,1], binary classifier

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub, tweenValue } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateDots } from '../../engine/animation/particles';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// Pre-generate real and fake dot positions
const REAL_DOTS: { x: number; y: number }[] = [];
const FAKE_DOTS: { x: number; y: number }[] = [];
for (let i = 0; i < 12; i++) {
  REAL_DOTS.push({
    x: -0.5 + 0.8 * Math.cos(i * 0.9 + 0.3),
    y: -0.3 + 0.6 * Math.sin(i * 1.1 + 0.2)
  });
  FAKE_DOTS.push({
    x: 0.5 + 0.7 * Math.cos(i * 1.2 + 1.5),
    y: 0.3 + 0.5 * Math.sin(i * 0.8 + 0.7)
  });
}

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

    const centerX = W / 2;
    const centerY = H * 0.48;
    const scatterRadius = Math.min(W, H) * 0.25;

    // D(x) box at top-right
    const dBoxP = easedSub(progress, 0.05, 0.2);
    if (dBoxP > 0) {
      const dBoxX = W * 0.82;
      const dBoxY = H * 0.15;
      r.box(dBoxX - 45, dBoxY - 20, 90, 40, {
        fill: colors.panelBg, stroke: colors.accent, radius: 8, lineWidth: 2
      });
      fadeInText(ctx, tx('scene3', 'dBox'), dBoxX, dBoxY, dBoxP, {
        color: colors.accent, font: 'bold 14px "Courier New", monospace'
      });

      // Output range
      fadeInText(ctx, '[0, 1]', dBoxX, dBoxY + 30, dBoxP, {
        color: colors.textDimmed, font: '11px "Courier New", monospace'
      });
    }

    // Real dots (green)
    const realP = easedSub(progress, 0.12, 0.35);
    if (realP > 0) {
      const realPxDots = REAL_DOTS.map(d => ({
        x: centerX + d.x * scatterRadius - scatterRadius * 0.3,
        y: centerY + d.y * scatterRadius
      }));
      animateDots(ctx, realPxDots, realP, {
        color: colors.insight, radius: 6, sequential: true
      });
      fadeInText(ctx, tx('scene3', 'realLabel'), centerX - scatterRadius * 0.5, centerY - scatterRadius - 10, realP, {
        color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif'
      });
    }

    // Fake dots (red)
    const fakeP = easedSub(progress, 0.25, 0.45);
    if (fakeP > 0) {
      const fakePxDots = FAKE_DOTS.map(d => ({
        x: centerX + d.x * scatterRadius + scatterRadius * 0.3,
        y: centerY + d.y * scatterRadius
      }));
      animateDots(ctx, fakePxDots, fakeP, {
        color: colors.error, radius: 6, sequential: true
      });
      fadeInText(ctx, tx('scene3', 'fakeLabel'), centerX + scatterRadius * 0.7, centerY - scatterRadius - 10, fakeP, {
        color: colors.error, font: 'bold 12px "Segoe UI", system-ui, sans-serif'
      });
    }

    // Decision boundary — vertical line that sharpens
    const boundP = easedSub(progress, 0.45, 0.7);
    if (boundP > 0) {
      const boundX = centerX;
      // Boundary starts wide/fuzzy and sharpens
      const blur = 20 * (1 - boundP) + 2;
      ctx.save();
      ctx.globalAlpha = boundP * 0.7;
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = blur;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(boundX, centerY - scatterRadius - 20);
      ctx.lineTo(boundX, centerY + scatterRadius + 20);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      fadeInText(ctx, tx('scene3', 'boundaryLabel'), boundX, centerY + scatterRadius + 40, boundP, {
        color: colors.warning, font: '11px "Segoe UI", system-ui, sans-serif'
      });
    }

    // D values labels: D->1 on real side, D->0 on fake side
    const labelsP = easedSub(progress, 0.65, 0.85);
    if (labelsP > 0) {
      fadeInText(ctx, tx('scene3', 'highLabel'), centerX - scatterRadius * 0.6, centerY + scatterRadius + 55, labelsP, {
        color: colors.insight, font: 'bold 13px "Courier New", monospace'
      });
      fadeInText(ctx, tx('scene3', 'lowLabel'), centerX + scatterRadius * 0.6, centerY + scatterRadius + 55, labelsP, {
        color: colors.error, font: 'bold 13px "Courier New", monospace'
      });
    }

    // Sharpening animation — dots jitter as boundary refines
    const sharpenP = easedSub(progress, 0.7, 0.95);
    if (sharpenP > 0) {
      ctx.save();
      ctx.globalAlpha = sharpenP * 0.4;
      // Redraw all dots at their final clearly-separated positions
      for (let i = 0; i < REAL_DOTS.length; i++) {
        const finalX = centerX + REAL_DOTS[i].x * scatterRadius - scatterRadius * 0.3 - sharpenP * 10;
        const finalY = centerY + REAL_DOTS[i].y * scatterRadius;
        ctx.beginPath();
        ctx.arc(finalX, finalY, 3, 0, Math.PI * 2);
        ctx.fillStyle = colors.insight;
        ctx.fill();
      }
      for (let i = 0; i < FAKE_DOTS.length; i++) {
        const finalX = centerX + FAKE_DOTS[i].x * scatterRadius + scatterRadius * 0.3 + sharpenP * 10;
        const finalY = centerY + FAKE_DOTS[i].y * scatterRadius;
        ctx.beginPath();
        ctx.arc(finalX, finalY, 3, 0, Math.PI * 2);
        ctx.fillStyle = colors.error;
        ctx.fill();
      }
      ctx.restore();
    }
  }
});
