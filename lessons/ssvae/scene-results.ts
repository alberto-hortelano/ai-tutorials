// Scene 7: Results — dramatic bar chart: supervised 70%, SSVAE 95%, full supervised 98%

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

const RESULTS = [
  { accuracy: 70, color: colors.textDimmed },
  { accuracy: 95, color: colors.insight },
  { accuracy: 98, color: series[0] },
];

export const scene7 = new Scene({
  id: () => tx('scene7', 'id'),
  duration: 20,
  narration: () => tx('scene7', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene7 as SceneText)?.subtitleCues ?? (text.es.scene7 as SceneText).subtitleCues,
  topic: () => tx('scene7', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene7', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`,
    });

    // Chart layout
    const chartLeft = W * 0.25;
    const chartRight = W * 0.9;
    const chartTop = H * 0.2;
    const chartBottom = H * 0.78;
    const chartW = chartRight - chartLeft;
    const chartH = chartBottom - chartTop;

    // Y-axis: 0-100%
    const maxAccuracy = 100;

    function accToY(acc: number): number {
      return chartBottom - (acc / maxAccuracy) * chartH;
    }

    // Method labels
    const methods = [
      () => tx('scene7', 'method1'),
      () => tx('scene7', 'method2'),
      () => tx('scene7', 'method3'),
    ];

    // Phase 1: Axes
    const axP = easedSub(progress, 0.06, 0.18);
    if (axP > 0) {
      ctx.save();
      ctx.globalAlpha = axP;

      // Y axis
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(chartLeft, chartTop);
      ctx.lineTo(chartLeft, chartBottom);
      ctx.lineTo(chartRight, chartBottom);
      ctx.stroke();

      // Y-axis ticks
      ctx.fillStyle = colors.textDimmed;
      ctx.font = `10px ${fonts.body}`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let acc = 0; acc <= 100; acc += 20) {
        const y = accToY(acc);
        ctx.fillText(`${acc}%`, chartLeft - 8, y);

        // Grid line
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = colors.axis;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(chartLeft, y);
        ctx.lineTo(chartRight, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // Y-axis label
      fadeInText(ctx, tx('scene7', 'accuracy'), chartLeft - 35, chartTop + chartH / 2, axP, {
        color: colors.textMuted, font: `11px ${fonts.body}`,
      });

      ctx.restore();
    }

    // Phase 2-4: Bars appearing one by one with dramatic reveal
    const barW = chartW * 0.2;
    const gap = chartW * 0.1;
    const totalBarsW = 3 * barW + 2 * gap;
    const startX = chartLeft + (chartW - totalBarsW) / 2;

    for (let i = 0; i < 3; i++) {
      const bp = easedSub(progress, 0.18 + i * 0.18, 0.36 + i * 0.18);
      if (bp > 0) {
        const bx = startX + i * (barW + gap);
        const barTop = accToY(RESULTS[i].accuracy);
        const fullH = chartBottom - barTop;
        const animH = fullH * easeOut(bp);

        // Bar
        ctx.save();
        ctx.globalAlpha = easeOut(bp) * 0.85;
        ctx.fillStyle = RESULTS[i].color;
        ctx.fillRect(bx, chartBottom - animH, barW, animH);

        // Border
        ctx.strokeStyle = RESULTS[i].color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx, chartBottom - animH, barW, animH);
        ctx.restore();

        // Accuracy value on top of bar
        if (bp > 0.6) {
          fadeInText(ctx, `~${RESULTS[i].accuracy}%`, bx + barW / 2, chartBottom - animH - 14, (bp - 0.6) * 2.5, {
            color: RESULTS[i].color, font: `bold 16px ${fonts.body}`,
          });
        }

        // Method label below bar
        fadeInText(ctx, methods[i](), bx + barW / 2, chartBottom + 14, bp, {
          color: colors.textMuted, font: `10px ${fonts.body}`,
        });
      }
    }

    // Phase 5: Highlight the SSVAE bar
    const highlightP = easedSub(progress, 0.78, 0.9);
    if (highlightP > 0) {
      const ssvaeX = startX + 1 * (barW + gap);
      const ssvaeTop = accToY(95);

      // Glow effect
      ctx.save();
      ctx.globalAlpha = easeOut(highlightP) * 0.15;
      ctx.fillStyle = colors.insight;
      ctx.fillRect(ssvaeX - 8, ssvaeTop - 8, barW + 16, chartBottom - ssvaeTop + 16);
      ctx.restore();

      // Glow border
      ctx.save();
      ctx.globalAlpha = easeOut(highlightP) * 0.6;
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(ssvaeX - 4, ssvaeTop - 4, barW + 8, chartBottom - ssvaeTop + 8);
      ctx.restore();
    }

    // Phase 6: Arrow showing the jump from 70% to 95%
    const jumpP = easedSub(progress, 0.82, 0.95);
    if (jumpP > 0) {
      const fromX = startX + barW / 2;
      const toX = startX + (barW + gap) + barW / 2;
      const arrowY = accToY(82); // midpoint

      ctx.save();
      ctx.globalAlpha = easeOut(jumpP) * 0.8;
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);

      // Curved arrow
      ctx.beginPath();
      ctx.moveTo(fromX, arrowY + 10);
      const cpX = (fromX + toX) / 2;
      const cpY = arrowY - 25;
      ctx.quadraticCurveTo(cpX, cpY, toX, arrowY - 10);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrowhead
      const angle = Math.atan2(-10 - cpY, toX - cpX) * 0.5 + Math.PI * 0.25;
      ctx.fillStyle = colors.warning;
      ctx.beginPath();
      ctx.moveTo(toX, arrowY - 10);
      ctx.lineTo(toX - 7 * Math.cos(angle - 0.5), arrowY - 10 - 7 * Math.sin(angle - 0.5));
      ctx.lineTo(toX - 7 * Math.cos(angle + 0.5), arrowY - 10 - 7 * Math.sin(angle + 0.5));
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      fadeInText(ctx, '+25%', cpX, cpY - 8, jumpP, {
        color: colors.warning, font: `bold 13px ${fonts.body}`,
      });
    }

    // Insight
    const insightP = easedSub(progress, 0.93, 1.0);
    fadeInText(ctx, tx('scene7', 'topic').split('.')[0], W / 2, H - 10, insightP, {
      color: colors.insight, font: `bold 11px ${fonts.body}`,
    });
  },
});
