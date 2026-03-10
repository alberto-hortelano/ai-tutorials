// Scene 5: Quality vs Speed — FID chart

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// Synthetic FID data (steps vs FID, log scale x-axis)
// DDPM: degrades quickly at few steps
const ddpmSteps = [10, 20, 50, 100, 200, 500, 1000];
const ddpmFID   = [180, 120, 60, 28, 15, 8, 5];

// DDIM: maintains quality even at fewer steps
const ddimSteps = [10, 20, 50, 100, 200, 500, 1000];
const ddimFID   = [90, 40, 15, 10, 7, 5.5, 5];

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
    fadeInText(ctx, tx('scene5', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Chart area
    const chartX = W * 0.14;
    const chartY = 60;
    const chartW = W * 0.72;
    const chartH = H * 0.5;

    // Log scale helpers
    const logMin = Math.log10(10);   // 10 steps
    const logMax = Math.log10(1000); // 1000 steps
    const fidMax = 200;

    function toChartX(steps: number): number {
      return chartX + ((Math.log10(steps) - logMin) / (logMax - logMin)) * chartW;
    }
    function toChartY(fid: number): number {
      return chartY + chartH - (fid / fidMax) * chartH;
    }

    // Axes
    const axesP = easedSub(progress, 0.06, 0.18);
    if (axesP > 0) {
      ctx.save();
      ctx.globalAlpha = axesP;

      // Y axis
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(chartX, chartY);
      ctx.lineTo(chartX, chartY + chartH);
      ctx.stroke();

      // X axis
      ctx.beginPath();
      ctx.moveTo(chartX, chartY + chartH);
      ctx.lineTo(chartX + chartW, chartY + chartH);
      ctx.stroke();

      // X-axis ticks (log scale)
      const xTicks = [10, 20, 50, 100, 200, 500, 1000];
      ctx.fillStyle = colors.textDimmed;
      ctx.font = '9px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      for (const t of xTicks) {
        const px = toChartX(t);
        ctx.beginPath();
        ctx.moveTo(px, chartY + chartH);
        ctx.lineTo(px, chartY + chartH + 4);
        ctx.stroke();
        ctx.fillText(String(t), px, chartY + chartH + 14);
      }

      // Y-axis ticks
      ctx.textAlign = 'right';
      for (let fid = 0; fid <= 200; fid += 50) {
        const py = toChartY(fid);
        ctx.beginPath();
        ctx.moveTo(chartX - 4, py);
        ctx.lineTo(chartX, py);
        ctx.stroke();
        ctx.fillText(String(fid), chartX - 6, py + 3);
      }

      // Axis labels
      ctx.fillStyle = colors.textMuted;
      ctx.font = '11px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene5', 'xAxis'), chartX + chartW / 2, chartY + chartH + 30);

      ctx.save();
      ctx.translate(chartX - 36, chartY + chartH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(tx('scene5', 'yAxis'), 0, 0);
      ctx.restore();

      ctx.restore();
    }

    // DDPM curve
    const ddpmP = easedSub(progress, 0.18, 0.45);
    if (ddpmP > 0) {
      const nDraw = Math.floor(ddpmSteps.length * ddpmP);
      ctx.save();
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < nDraw; i++) {
        const px = toChartX(ddpmSteps[i]);
        const py = toChartY(ddpmFID[i]);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Dots
      for (let i = 0; i < nDraw; i++) {
        ctx.beginPath();
        ctx.arc(toChartX(ddpmSteps[i]), toChartY(ddpmFID[i]), 3, 0, Math.PI * 2);
        ctx.fillStyle = colors.error;
        ctx.fill();
      }

      ctx.restore();
    }

    // DDPM label
    const ddpmLabelP = easedSub(progress, 0.35, 0.45);
    fadeInText(ctx, tx('scene5', 'ddpmLabel'), toChartX(15), toChartY(150), ddpmLabelP, {
      color: colors.error, font: 'bold 11px "Segoe UI", system-ui, sans-serif', align: 'left',
    });

    // DDIM curve
    const ddimP = easedSub(progress, 0.4, 0.65);
    if (ddimP > 0) {
      const nDraw = Math.floor(ddimSteps.length * ddimP);
      ctx.save();
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < nDraw; i++) {
        const px = toChartX(ddimSteps[i]);
        const py = toChartY(ddimFID[i]);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Dots
      for (let i = 0; i < nDraw; i++) {
        ctx.beginPath();
        ctx.arc(toChartX(ddimSteps[i]), toChartY(ddimFID[i]), 3, 0, Math.PI * 2);
        ctx.fillStyle = colors.insight;
        ctx.fill();
      }

      ctx.restore();
    }

    // DDIM label
    const ddimLabelP = easedSub(progress, 0.55, 0.65);
    fadeInText(ctx, tx('scene5', 'ddimLabel'), toChartX(15), toChartY(70), ddimLabelP, {
      color: colors.insight, font: 'bold 11px "Segoe UI", system-ui, sans-serif', align: 'left',
    });

    // Sweet spot highlight at ~50 steps
    const sweetP = easedSub(progress, 0.7, 0.85);
    if (sweetP > 0) {
      ctx.save();
      ctx.globalAlpha = sweetP;

      const sx = toChartX(50);
      const sy = toChartY(15);

      // Vertical dashed line at 50 steps
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(sx, chartY);
      ctx.lineTo(sx, chartY + chartH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Circle highlight on DDIM point
      ctx.beginPath();
      ctx.arc(sx, sy, 10, 0, Math.PI * 2);
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sweet spot label
      ctx.fillStyle = colors.warning;
      ctx.font = 'bold 11px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene5', 'sweetSpot'), sx, chartY - 6);

      ctx.restore();
    }
  },
});
