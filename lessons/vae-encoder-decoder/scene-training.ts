// Scene 5: The Training Loop — circular flow diagram + loss curve

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { drawSimpleArrow } from '../_shared/network-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene5 = new Scene({
  id: () => tx('scene5', 'id'),
  duration: 22,
  narration: () => tx('scene5', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene5 as SceneText)?.subtitleCues ?? (text.es.scene5 as SceneText).subtitleCues,
  topic: () => tx('scene5', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene5', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // ===== CIRCULAR FLOW DIAGRAM (top half) =====
    const cx = W * 0.35;
    const cy = H * 0.38;
    const rx = W * 0.22;
    const ry = H * 0.18;

    const steps = [
      { label: tx('scene5', 'stepBatch'), color: series[2], angle: -Math.PI / 2 },
      { label: tx('scene5', 'stepEncoder'), color: series[0], angle: -Math.PI / 6 },
      { label: tx('scene5', 'stepSampling'), color: colors.warning, angle: Math.PI / 4 },
      { label: tx('scene5', 'stepDecoder'), color: colors.insight, angle: 3 * Math.PI / 4 },
      { label: tx('scene5', 'stepLoss'), color: colors.error, angle: 7 * Math.PI / 6 },
      { label: tx('scene5', 'stepBackprop'), color: colors.accent, angle: -5 * Math.PI / 6 },
    ];

    const nodeR = 28;

    steps.forEach((step, i) => {
      const stepP = easedSub(progress, 0.05 + i * 0.06, 0.18 + i * 0.06);
      if (stepP <= 0) return;

      const sx = cx + rx * Math.cos(step.angle);
      const sy = cy + ry * Math.sin(step.angle);

      ctx.save();
      ctx.globalAlpha = stepP;

      // Node circle
      ctx.beginPath();
      ctx.arc(sx, sy, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = step.color + '25';
      ctx.fill();
      ctx.strokeStyle = step.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = step.color;
      ctx.font = `bold 9px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Word wrap for long labels
      const words = step.label.split(' ');
      if (words.length > 1 && step.label.length > 8) {
        ctx.fillText(words[0], sx, sy - 5);
        ctx.fillText(words.slice(1).join(' '), sx, sy + 7);
      } else {
        ctx.fillText(step.label, sx, sy);
      }

      ctx.restore();

      // Arrow to next node
      const nextI = (i + 1) % steps.length;
      const nextStep = steps[nextI];
      const arrP = easedSub(progress, 0.1 + i * 0.06, 0.22 + i * 0.06);
      if (arrP > 0) {
        const nx = cx + rx * Math.cos(nextStep.angle);
        const ny = cy + ry * Math.sin(nextStep.angle);

        // Shorten arrow to not overlap with circles
        const angle = Math.atan2(ny - sy, nx - sx);
        const fromX = sx + (nodeR + 3) * Math.cos(angle);
        const fromY = sy + (nodeR + 3) * Math.sin(angle);
        const toX = nx - (nodeR + 3) * Math.cos(angle);
        const toY = ny - (nodeR + 3) * Math.sin(angle);

        drawSimpleArrow(ctx, fromX, fromY, toX, toY, arrP, colors.textDimmed, 6);
      }
    });

    // Highlight active step based on progress (rotating highlight)
    const activeP = easedSub(progress, 0.45, 0.7);
    if (activeP > 0) {
      const activeIdx = Math.floor(activeP * steps.length) % steps.length;
      const aStep = steps[activeIdx];
      const ax = cx + rx * Math.cos(aStep.angle);
      const ay = cy + ry * Math.sin(aStep.angle);

      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = colors.textPrimary;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ax, ay, nodeR + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // ===== LOSS CURVE (right side, bottom half) =====
    const curveP = easedSub(progress, 0.5, 0.95);
    if (curveP > 0) {
      const chartX = W * 0.58;
      const chartY = H * 0.22;
      const chartW = W * 0.38;
      const chartH = H * 0.7;

      ctx.save();
      ctx.globalAlpha = curveP;

      // Axes
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(chartX, chartY);
      ctx.lineTo(chartX, chartY + chartH);
      ctx.lineTo(chartX + chartW, chartY + chartH);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = colors.textDimmed;
      ctx.font = `10px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('Epoch', chartX + chartW / 2, chartY + chartH + 14);
      ctx.save();
      ctx.translate(chartX - 12, chartY + chartH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Loss', 0, 0);
      ctx.restore();

      const nPts = 50;
      const drawT = easeOut(Math.min(curveP * 1.3, 1));
      const visiblePts = Math.floor(nPts * drawT);

      // Reconstruction loss (green, decreasing)
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < visiblePts; i++) {
        const t = i / nPts;
        const px = chartX + t * chartW;
        const reconVal = 0.8 * Math.exp(-3 * t) + 0.05 + 0.02 * Math.sin(t * 20);
        const py = chartY + (1 - reconVal) * chartH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // KL loss (red, rises then stabilizes)
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < visiblePts; i++) {
        const t = i / nPts;
        const px = chartX + t * chartW;
        const klVal = 0.25 * (1 - Math.exp(-5 * t)) + 0.01 * Math.sin(t * 15);
        const py = chartY + (1 - klVal) * chartH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Total loss (accent, decreasing overall)
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < visiblePts; i++) {
        const t = i / nPts;
        const px = chartX + t * chartW;
        const reconVal = 0.8 * Math.exp(-3 * t) + 0.05;
        const klVal = 0.25 * (1 - Math.exp(-5 * t));
        const totalVal = reconVal + klVal + 0.015 * Math.sin(t * 25);
        const py = chartY + (1 - totalVal) * chartH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Legend
      const legP = easedSub(progress, 0.65, 0.78);
      if (legP > 0) {
        const legX = chartX + chartW * 0.55;
        const legY = chartY + 15;
        const legH = 16;

        ctx.globalAlpha = legP * curveP;

        const entries = [
          { label: tx('scene5', 'reconLabel'), color: colors.insight },
          { label: tx('scene5', 'klLabel'), color: colors.error },
          { label: tx('scene5', 'totalLabel'), color: colors.accent },
        ];

        entries.forEach((e, i) => {
          const ey = legY + i * legH;
          ctx.fillStyle = e.color;
          ctx.fillRect(legX, ey, 12, 3);
          ctx.fillStyle = colors.textSecondary;
          ctx.font = `10px ${fonts.body}`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(e.label, legX + 16, ey + 2);
        });
      }

      ctx.restore();
    }
  }
});
