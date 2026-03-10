// Scene 7: Geometric view — with distance landscape and optimizer animation

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub, easeInOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { lerp } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene7 = new Scene({
  id: () => tx('scene7', 'id'),
  duration: 28,
  narration: () => tx('scene7', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene7 as SceneText)?.subtitleCues ?? (text.es.scene7 as SceneText).subtitleCues,
  topic: () => tx('scene7', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene7', 'title'), W / 2, 25, easedSub(progress, 0, 0.06), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif'
    });

    // ---- Left half: Distribution space diagram ----
    const leftW = W * 0.5;
    const cx = leftW * 0.5, cy = H * 0.5;

    // Draw "space of distributions" as a subtle grid
    const gridP = easedSub(progress, 0.04, 0.18);
    if (gridP > 0) {
      ctx.globalAlpha = gridP * 0.12;
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 0.5;
      for (let gx = 0; gx < leftW; gx += 35) {
        ctx.beginPath();
        ctx.moveTo(gx, 42);
        ctx.lineTo(gx, H - 25);
        ctx.stroke();
      }
      for (let gy = 42; gy < H - 25; gy += 35) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(leftW, gy);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      fadeInText(ctx, tx('scene7', 'spaceLabel'), leftW - 8, 43, gridP, {
        color: colors.textDimmed, font: '9px "Segoe UI", system-ui, sans-serif', align: 'right'
      });
    }

    // p_data point
    const pdataX = cx - 60, pdataY = cy - 50;
    const pdataP = easedSub(progress, 0.12, 0.28);
    if (pdataP > 0) {
      ctx.beginPath();
      ctx.arc(pdataX, pdataY, 7 * pdataP, 0, Math.PI * 2);
      ctx.fillStyle = series[0];
      ctx.fill();
      fadeInText(ctx, 'p_data', pdataX - 18, pdataY - 16, pdataP, {
        color: series[0], font: 'bold 12px "Segoe UI", system-ui, sans-serif', align: 'center'
      });
    }

    // Parametric family curve
    const familyCurve = (t: number): { x: number; y: number } => ({
      x: cx + 85 * Math.cos(t * Math.PI * 1.2 + 0.3) - 20,
      y: cy + 70 * Math.sin(t * Math.PI * 1.2 + 0.3) + 25,
    });

    const curvePhase = easedSub(progress, 0.25, 0.5);
    if (curvePhase > 0) {
      ctx.save();
      ctx.globalAlpha = curvePhase;
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let t = 0; t <= 1; t += 0.01) {
        const pt = familyCurve(t);
        if (t === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      fadeInText(ctx, tx('scene7', 'familyLabel'), cx + 85, cy + 100, 1, {
        color: colors.textMuted, font: '11px "Courier New", monospace', align: 'center'
      });
      ctx.restore();
    }

    // MLE point (closest on curve)
    const mleT = 0.42;
    const mlePt = familyCurve(mleT);

    const mlePhase = easedSub(progress, 0.45, 0.65);
    if (mlePhase > 0) {
      // Dashed line from p_data to MLE point
      ctx.save();
      ctx.globalAlpha = mlePhase;
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(pdataX, pdataY);
      const curX = pdataX + (mlePt.x - pdataX) * mlePhase;
      const curY = pdataY + (mlePt.y - pdataY) * mlePhase;
      ctx.lineTo(curX, curY);
      ctx.stroke();
      ctx.setLineDash([]);

      if (mlePhase > 0.5) {
        ctx.beginPath();
        ctx.arc(mlePt.x, mlePt.y, 6 * Math.min(1, (mlePhase - 0.5) * 2), 0, Math.PI * 2);
        ctx.fillStyle = colors.insight;
        ctx.fill();
        fadeInText(ctx, tx('scene7', 'mleLabel'), mlePt.x + 12, mlePt.y - 14, (mlePhase - 0.5) * 2, {
          color: colors.insight, font: 'bold 11px "Segoe UI", system-ui, sans-serif', align: 'left'
        });
      }

      // Label on the line
      const midLX = (pdataX + mlePt.x) / 2;
      const midLY = (pdataY + mlePt.y) / 2;
      fadeInText(ctx, 'D_KL', midLX - 12, midLY - 10, mlePhase, {
        color: colors.error, font: 'bold 10px "Segoe UI", system-ui, sans-serif', align: 'center'
      });

      ctx.restore();
    }

    // ---- Right half: Distance landscape (contour plot) ----
    const rStart = W * 0.54;
    const rW = W * 0.44;
    const rH = H * 0.62;
    const rTop = H * 0.12;

    const landscapeP = easedSub(progress, 0.5, 0.75);
    if (landscapeP > 0) {
      ctx.save();
      ctx.globalAlpha = landscapeP;

      fadeInText(ctx, tx('scene7', 'landscapeTitle'), rStart + rW / 2, rTop - 6, 1, {
        color: colors.accent, font: 'bold 11px "Segoe UI", system-ui, sans-serif'
      });

      // Axes for parameter space
      const axX = rStart + 25;
      const axY = rTop + rH - 10;
      const axW = rW - 40;
      const axH = rH - 25;

      // Axis lines
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(axX, axY);
      ctx.lineTo(axX + axW, axY);
      ctx.moveTo(axX, axY);
      ctx.lineTo(axX, axY - axH);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = colors.textDimmed;
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('\u03b8\u2081', axX + axW / 2, axY + 4);
      ctx.save();
      ctx.translate(axX - 14, axY - axH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('\u03b8\u2082', 0, 0);
      ctx.restore();

      // Contour lines of D_KL(p_data || p_theta)
      // The minimum is at theta* (the MLE solution)
      const optX = axX + axW * 0.55; // theta* x-coordinate
      const optY = axY - axH * 0.45; // theta* y-coordinate

      const contourLevels = [0.15, 0.3, 0.5, 0.75, 1.0];
      const contourColors = [
        colors.insight + '80',
        colors.insight + '50',
        colors.accent + '40',
        colors.warning + '30',
        colors.error + '20',
      ];

      for (let l = contourLevels.length - 1; l >= 0; l--) {
        const level = contourLevels[l];
        const rx = axW * level * 0.42;
        const ry = axH * level * 0.38;

        ctx.strokeStyle = contourColors[l];
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(optX, optY, rx, ry, -0.3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Contour value labels
      ctx.fillStyle = colors.textDimmed;
      ctx.font = '8px "Courier New", monospace';
      ctx.textAlign = 'left';
      for (let l = 0; l < contourLevels.length; l++) {
        const rx = axW * contourLevels[l] * 0.42;
        const labelX = optX + rx * Math.cos(-0.3) + 3;
        const labelY = optY - rx * Math.sin(-0.3);
        if (labelX < axX + axW - 20 && labelY > axY - axH + 10) {
          ctx.fillText(contourLevels[l].toFixed(1), labelX, labelY);
        }
      }

      // Star at optimum
      ctx.beginPath();
      ctx.arc(optX, optY, 5, 0, Math.PI * 2);
      ctx.fillStyle = colors.insight;
      ctx.fill();
      fadeInText(ctx, '\u03b8*', optX + 10, optY - 10, 1, {
        color: colors.insight, font: 'bold 11px "Segoe UI", system-ui, sans-serif', align: 'left'
      });

      // D_KL label
      fadeInText(ctx, 'D_KL(p_data || p_\u03b8)', rStart + rW / 2, axY - axH - 2, 1, {
        color: colors.textDimmed, font: '9px "Courier New", monospace'
      });

      ctx.restore();

      // ---- Optimizer dot rolling downhill ----
      const optPhase = easedSub(progress, 0.7, 0.9);
      if (optPhase > 0) {
        // Optimizer path: start far from optimum, spiral toward it
        const startOX = axX + axW * 0.15;
        const startOY = axY - axH * 0.8;
        const t = easeInOut(optPhase);

        // Create a nice path that curves toward the optimum
        // Using damped spiral approach
        const pathT = t;
        const curOX = lerp(startOX, optX, pathT) + (1 - pathT) * 15 * Math.sin(pathT * Math.PI * 3);
        const curOY = lerp(startOY, optY, pathT) + (1 - pathT) * 10 * Math.cos(pathT * Math.PI * 3);

        // Trail
        ctx.save();
        ctx.strokeStyle = colors.warning + '80';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        const trailSteps = 40;
        for (let s = 0; s <= trailSteps; s++) {
          const tt = (s / trailSteps) * pathT;
          const px = lerp(startOX, optX, tt) + (1 - tt) * 15 * Math.sin(tt * Math.PI * 3);
          const py = lerp(startOY, optY, tt) + (1 - tt) * 10 * Math.cos(tt * Math.PI * 3);
          if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Optimizer dot
        ctx.beginPath();
        ctx.arc(curOX, curOY, 5, 0, Math.PI * 2);
        ctx.fillStyle = colors.warning;
        ctx.fill();
        ctx.strokeStyle = colors.bodyBg;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Start label
        if (optPhase < 0.3) {
          fadeInText(ctx, '\u03b8\u2080', startOX - 10, startOY - 12, 1 - optPhase / 0.3, {
            color: colors.warning, font: '10px "Segoe UI", system-ui, sans-serif', align: 'center'
          });
        }
      }
    }

    // Final text
    const finalP = easedSub(progress, 0.9, 1);
    fadeInText(ctx, tx('scene7', 'insight'), W / 2, H - 18, finalP, {
      color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif'
    });
  }
});
