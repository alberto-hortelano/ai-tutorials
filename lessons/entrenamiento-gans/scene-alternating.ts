// Scene 1: Alternating Training — D for k steps, G for 1 step

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene1 = new Scene({
  id: () => tx('scene1', 'id'),
  duration: 22,
  narration: () => tx('scene1', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene1 as SceneText)?.subtitleCues ?? (text.es.scene1 as SceneText).subtitleCues,
  topic: () => tx('scene1', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene1', 'title'), W / 2, 30, easedSub(progress, 0, 0.1), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif'
    });

    const dBoxX = W * 0.3;
    const gBoxX = W * 0.7;
    const boxY = H * 0.4;
    const boxW = 140;
    const boxH = 55;

    // D box
    const dP = easedSub(progress, 0.08, 0.22);
    if (dP > 0) {
      ctx.save();
      ctx.globalAlpha = dP;
      r.box(dBoxX - boxW / 2, boxY - boxH / 2, boxW, boxH, {
        fill: colors.panelBg, stroke: colors.insight, radius: 10, lineWidth: 2
      });
      ctx.restore();
      fadeInText(ctx, tx('scene1', 'dBox'), dBoxX, boxY, dP, {
        color: colors.insight, font: 'bold 14px "Segoe UI", system-ui, sans-serif'
      });
    }

    // G box
    const gP = easedSub(progress, 0.15, 0.28);
    if (gP > 0) {
      ctx.save();
      ctx.globalAlpha = gP;
      r.box(gBoxX - boxW / 2, boxY - boxH / 2, boxW, boxH, {
        fill: colors.panelBg, stroke: colors.error, radius: 10, lineWidth: 2
      });
      ctx.restore();
      fadeInText(ctx, tx('scene1', 'gBox'), gBoxX, boxY, gP, {
        color: colors.error, font: 'bold 14px "Segoe UI", system-ui, sans-serif'
      });
    }

    // Cycle arrow from D to G
    const cycleP = easedSub(progress, 0.25, 0.4);
    if (cycleP > 0) {
      animateArrow(ctx, dBoxX + boxW / 2 + 5, boxY, gBoxX - boxW / 2 - 5, boxY, cycleP, {
        color: colors.textMuted, lineWidth: 2
      });
    }

    // Alternating highlight — D steps pulse
    const altP = easedSub(progress, 0.35, 0.85);
    if (altP > 0) {
      // Cycle through: k D steps then 1 G step
      const cycleTime = (altP * 4) % 1; // speed up cycle
      const isDPhase = cycleTime < 0.7; // 70% of cycle is D

      if (isDPhase) {
        // Highlight D box
        ctx.save();
        ctx.globalAlpha = 0.3 + 0.4 * Math.sin(cycleTime * Math.PI / 0.7);
        ctx.strokeStyle = colors.insight;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(dBoxX - boxW / 2 - 5, boxY - boxH / 2 - 5, boxW + 10, boxH + 10, 12);
        ctx.stroke();
        ctx.restore();
      } else {
        // Highlight G box
        ctx.save();
        ctx.globalAlpha = 0.3 + 0.4 * Math.sin((cycleTime - 0.7) * Math.PI / 0.3);
        ctx.strokeStyle = colors.error;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(gBoxX - boxW / 2 - 5, boxY - boxH / 2 - 5, boxW + 10, boxH + 10, 12);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Step count labels
    const stepsP = easedSub(progress, 0.3, 0.45);
    if (stepsP > 0) {
      fadeInText(ctx, tx('scene1', 'kSteps'), dBoxX, boxY + boxH / 2 + 22, stepsP, {
        color: colors.insight, font: 'bold 13px "Courier New", monospace'
      });
      fadeInText(ctx, tx('scene1', 'oneStep'), gBoxX, boxY + boxH / 2 + 22, stepsP, {
        color: colors.error, font: 'bold 13px "Courier New", monospace'
      });
    }

    // Cycle label below
    const cycleLabelP = easedSub(progress, 0.45, 0.6);
    if (cycleLabelP > 0) {
      fadeInText(ctx, tx('scene1', 'cycleLabel'), W / 2, H * 0.72, cycleLabelP, {
        color: colors.textMuted, font: '12px "Segoe UI", system-ui, sans-serif'
      });

      // D D D ... G cycle visualization
      const stepY = H * 0.8;
      const stepW = 30;
      const stepGap = 8;
      const steps = ['D', 'D', 'D', 'G'];
      const startX = W / 2 - (steps.length * (stepW + stepGap)) / 2;

      for (let i = 0; i < steps.length; i++) {
        const sx = startX + i * (stepW + stepGap);
        const isD = steps[i] === 'D';
        const stepAlpha = easedSub(progress, 0.5 + i * 0.04, 0.6 + i * 0.04);
        if (stepAlpha > 0) {
          ctx.save();
          ctx.globalAlpha = stepAlpha;
          r.box(sx, stepY - 12, stepW, 24, {
            fill: isD ? colors.insight + '44' : colors.error + '44',
            stroke: isD ? colors.insight : colors.error,
            radius: 4, lineWidth: 1.5
          });
          ctx.restore();
          fadeInText(ctx, steps[i], sx + stepW / 2, stepY, stepAlpha, {
            color: isD ? colors.insight : colors.error, font: 'bold 12px "Segoe UI", system-ui, sans-serif'
          });
        }
      }

      // Repeat arrow
      const repP = easedSub(progress, 0.7, 0.85);
      if (repP > 0) {
        const lastX = startX + 3 * (stepW + stepGap) + stepW + 10;
        animateArrow(ctx, lastX, stepY, lastX + 30, stepY - 15, repP, {
          color: colors.warning, lineWidth: 1.5, headSize: 6
        });
        fadeInText(ctx, tx('scene1', 'repeatLabel'), lastX + 35, stepY - 15, repP, {
          color: colors.warning, font: '10px "Segoe UI", system-ui, sans-serif', align: 'left'
        });
      }
    }
  }
});
