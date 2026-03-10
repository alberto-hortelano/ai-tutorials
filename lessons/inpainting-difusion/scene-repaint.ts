// Scene 6: RePaint — forward-backward jumps on timeline

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { drawSimpleArrow } from '../_shared/network-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene6 = new Scene({
  id: () => tx('scene6', 'id'),
  duration: 24,
  narration: () => tx('scene6', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene6 as SceneText)?.subtitleCues ?? (text.es.scene6 as SceneText).subtitleCues,
  topic: () => tx('scene6', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene6', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Horizontal timeline: t=T (left) to t=0 (right)
    const tlX = W * 0.08;
    const tlW = W * 0.84;
    const tlY = H * 0.38;

    // Timeline axis
    const axisP = easedSub(progress, 0.06, 0.15);
    if (axisP > 0) {
      ctx.save();
      ctx.globalAlpha = axisP;

      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tlX, tlY);
      ctx.lineTo(tlX + tlW, tlY);
      ctx.stroke();

      // Tick marks
      for (let i = 0; i <= 10; i++) {
        const px = tlX + (i / 10) * tlW;
        ctx.beginPath();
        ctx.moveTo(px, tlY - 3);
        ctx.lineTo(px, tlY + 3);
        ctx.stroke();
      }

      // Labels
      ctx.fillStyle = colors.textDimmed;
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('t = T', tlX, tlY - 10);
      ctx.textAlign = 'right';
      ctx.fillText('t = 0', tlX + tlW, tlY - 10);

      ctx.restore();
    }

    // Standard reverse path (straight line, dimmed)
    const stdP = easedSub(progress, 0.12, 0.3);
    if (stdP > 0) {
      ctx.save();
      ctx.globalAlpha = stdP * 0.3;
      ctx.strokeStyle = colors.textDimmed;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(tlX, tlY + 30);
      ctx.lineTo(tlX + tlW, tlY + 30);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      fadeInText(ctx, 'Standard', tlX + tlW / 2, tlY + 46, stdP * 0.5, {
        color: colors.textDimmed, font: '9px "Segoe UI", system-ui, sans-serif',
      });
    }

    // RePaint zig-zag path (forward-backward jumps)
    const repaintP = easedSub(progress, 0.25, 0.75);
    if (repaintP > 0) {
      ctx.save();

      // Define the zig-zag path: overall goes right, but with back-forth jumps
      const jumpSize = tlW * 0.08;
      const stepForward = tlW * 0.12;
      const nJumps = 6;
      const zigzagY = tlY + 70;

      const points: { x: number; y: number; type: 'fwd' | 'rev' }[] = [];
      let curX = tlX;
      for (let j = 0; j < nJumps; j++) {
        // Forward (to the right = toward t=0, i.e. denoise)
        points.push({ x: curX, y: zigzagY, type: 'rev' });
        curX += stepForward;
        points.push({ x: curX, y: zigzagY, type: 'rev' });

        // Backward jump (to the left = re-noise)
        if (j < nJumps - 1) {
          points.push({ x: curX, y: zigzagY, type: 'fwd' });
          curX -= jumpSize;
          points.push({ x: curX, y: zigzagY, type: 'fwd' });
        }
      }

      const nDraw = Math.floor(points.length * repaintP);

      for (let i = 0; i < nDraw - 1; i++) {
        const from = points[i];
        const to = points[i + 1];

        ctx.strokeStyle = from.type === 'rev' ? colors.insight : colors.error;
        ctx.lineWidth = 2;
        ctx.globalAlpha = Math.min(repaintP * 2, 1);

        // Offset y for forward vs reverse arrows
        const yOff = from.type === 'fwd' ? -8 : 8;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y + yOff);
        ctx.lineTo(to.x, to.y + yOff);
        ctx.stroke();

        // Arrowhead
        if (i % 2 === 0) {
          const tipX = to.x;
          const tipY = to.y + yOff;
          const dir = to.x > from.x ? 1 : -1;
          ctx.fillStyle = from.type === 'rev' ? colors.insight : colors.error;
          ctx.beginPath();
          ctx.moveTo(tipX, tipY);
          ctx.lineTo(tipX - dir * 5, tipY - 3);
          ctx.lineTo(tipX - dir * 5, tipY + 3);
          ctx.closePath();
          ctx.fill();
        }
      }

      ctx.restore();
    }

    // Legend
    const legendP = easedSub(progress, 0.5, 0.65);
    if (legendP > 0) {
      const legendY = H * 0.62;

      ctx.save();
      ctx.globalAlpha = legendP;

      // Reverse (denoise) arrow
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W * 0.2, legendY);
      ctx.lineTo(W * 0.28, legendY);
      ctx.stroke();

      ctx.fillStyle = colors.insight;
      ctx.beginPath();
      ctx.moveTo(W * 0.28, legendY);
      ctx.lineTo(W * 0.28 - 5, legendY - 3);
      ctx.lineTo(W * 0.28 - 5, legendY + 3);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      fadeInText(ctx, tx('scene6', 'backwardJump'), W * 0.3, legendY, legendP, {
        color: colors.insight, font: '10px "Segoe UI", system-ui, sans-serif', align: 'left',
      });

      // Forward (re-noise) arrow
      if (legendP > 0) {
        ctx.save();
        ctx.globalAlpha = legendP;

        ctx.strokeStyle = colors.error;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(W * 0.6, legendY);
        ctx.lineTo(W * 0.52, legendY);
        ctx.stroke();

        ctx.fillStyle = colors.error;
        ctx.beginPath();
        ctx.moveTo(W * 0.52, legendY);
        ctx.lineTo(W * 0.52 + 5, legendY - 3);
        ctx.lineTo(W * 0.52 + 5, legendY + 3);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      fadeInText(ctx, tx('scene6', 'forwardJump'), W * 0.62, legendY, legendP, {
        color: colors.error, font: '10px "Segoe UI", system-ui, sans-serif', align: 'left',
      });
    }

    // Result insight
    const insightP = easedSub(progress, 0.8, 0.95);
    if (insightP > 0) {
      ctx.save();
      ctx.globalAlpha = insightP;

      const boxW = W * 0.6;
      const boxX = W / 2 - boxW / 2;
      const boxY = H - 55;
      const boxH = 36;

      ctx.fillStyle = colors.insight + '15';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = colors.insight + '50';
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      ctx.fillStyle = colors.insight;
      ctx.font = 'bold 12px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene6', 'improved'), W / 2, boxY + boxH / 2);

      ctx.restore();
    }
  },
});
