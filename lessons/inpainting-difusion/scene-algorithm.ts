// Scene 5: The Complete Algorithm — vertical timeline with operations

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { drawSimpleArrow } from '../_shared/network-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene5 = new Scene({
  id: () => tx('scene5', 'id'),
  duration: 24,
  narration: () => tx('scene5', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene5 as SceneText)?.subtitleCues ?? (text.es.scene5 as SceneText).subtitleCues,
  topic: () => tx('scene5', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene5', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Vertical timeline: t=T (top) to t=0 (bottom)
    const timelineX = W * 0.12;
    const timelineTop = 60;
    const timelineBottom = H - 35;
    const timelineH = timelineBottom - timelineTop;

    // Timeline axis
    const axisP = easedSub(progress, 0.06, 0.15);
    if (axisP > 0) {
      ctx.save();
      ctx.globalAlpha = axisP;

      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(timelineX, timelineTop);
      ctx.lineTo(timelineX, timelineBottom);
      ctx.stroke();

      // Arrow at bottom
      ctx.fillStyle = colors.axis;
      ctx.beginPath();
      ctx.moveTo(timelineX, timelineBottom);
      ctx.lineTo(timelineX - 4, timelineBottom - 8);
      ctx.lineTo(timelineX + 4, timelineBottom - 8);
      ctx.closePath();
      ctx.fill();

      // Labels
      ctx.fillStyle = colors.textDimmed;
      ctx.font = '11px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('t = T', timelineX + 8, timelineTop + 6);
      ctx.fillText('t = 0', timelineX + 8, timelineBottom - 4);

      ctx.restore();
    }

    // Show 5 timestep rows along the timeline
    const nSteps = 5;
    const stepSpacing = timelineH / (nSteps + 1);
    const opsX = W * 0.22;
    const opsW = W * 0.72;

    // Animated progression through steps
    const stepProgress = easedSub(progress, 0.12, 0.82);

    for (let i = 0; i < nSteps; i++) {
      const stepStart = i / nSteps;
      const stepEnd = (i + 1) / nSteps;
      const localP = Math.max(0, Math.min(1, (stepProgress - stepStart) / (stepEnd - stepStart)));

      if (localP <= 0) continue;

      const y = timelineTop + (i + 1) * stepSpacing;
      const tVal = Math.floor(((nSteps - i) / nSteps) * 1000);

      ctx.save();
      ctx.globalAlpha = easeOut(localP);

      // Timestep marker on timeline
      ctx.beginPath();
      ctx.arc(timelineX, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = colors.warning;
      ctx.fill();

      // t label
      ctx.fillStyle = colors.textMuted;
      ctx.font = '9px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(tx('scene5', 'tLabel', String(tVal)), timelineX - 8, y + 3);

      // Three operation boxes for this step
      const boxH = 20;
      const boxW = opsW * 0.28;
      const gap = opsW * 0.04;

      // Step 1: Denoise
      const op1X = opsX;
      const op1P = Math.max(0, Math.min(1, localP * 3));
      if (op1P > 0) {
        ctx.globalAlpha = easeOut(localP) * op1P;
        ctx.fillStyle = colors.accent + '20';
        ctx.fillRect(op1X, y - boxH / 2, boxW, boxH);
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1;
        ctx.strokeRect(op1X, y - boxH / 2, boxW, boxH);

        ctx.fillStyle = colors.accent;
        ctx.font = '9px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i === 0 ? tx('scene5', 'step1') : 'Denoise', op1X + boxW / 2, y);
      }

      // Step 2: Noise known
      const op2X = opsX + boxW + gap;
      const op2P = Math.max(0, Math.min(1, localP * 3 - 0.5));
      if (op2P > 0) {
        ctx.globalAlpha = easeOut(localP) * op2P;
        ctx.fillStyle = colors.insight + '20';
        ctx.fillRect(op2X, y - boxH / 2, boxW, boxH);
        ctx.strokeStyle = colors.insight;
        ctx.lineWidth = 1;
        ctx.strokeRect(op2X, y - boxH / 2, boxW, boxH);

        ctx.fillStyle = colors.insight;
        ctx.font = '9px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i === 0 ? tx('scene5', 'step2') : 'Noise known', op2X + boxW / 2, y);
      }

      // Step 3: Merge
      const op3X = opsX + 2 * (boxW + gap);
      const op3P = Math.max(0, Math.min(1, localP * 3 - 1));
      if (op3P > 0) {
        ctx.globalAlpha = easeOut(localP) * op3P;
        ctx.fillStyle = colors.warning + '20';
        ctx.fillRect(op3X, y - boxH / 2, boxW, boxH);
        ctx.strokeStyle = colors.warning;
        ctx.lineWidth = 1;
        ctx.strokeRect(op3X, y - boxH / 2, boxW, boxH);

        ctx.fillStyle = colors.warning;
        ctx.font = '9px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i === 0 ? tx('scene5', 'step3') : 'Merge', op3X + boxW / 2, y);
      }

      // Arrows between ops
      if (op1P > 0.5 && op2P > 0) {
        drawSimpleArrow(ctx, op1X + boxW + 2, y, op2X - 2, y, op2P, colors.textDimmed + '60', 4);
      }
      if (op2P > 0.5 && op3P > 0) {
        drawSimpleArrow(ctx, op2X + boxW + 2, y, op3X - 2, y, op3P, colors.textDimmed + '60', 4);
      }

      ctx.restore();
    }

    // Current progress indicator
    if (stepProgress > 0 && stepProgress < 1) {
      const curY = timelineTop + stepProgress * timelineH;
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(timelineX - 6, curY);
      ctx.lineTo(opsX + opsW, curY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  },
});
