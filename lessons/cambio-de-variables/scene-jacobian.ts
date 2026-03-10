// Scene 3: The Jacobian — 2D grid warping
// Enhanced: shows unit square mapping to parallelogram with Jacobian column vectors

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeInOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { drawWarpedGrid } from '../_shared/flow-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';
import type { Point } from '../../engine/animation/particles';

// Nonlinear 2D transform
function warp(p: Point, t: number): Point {
  const wx = p.x + t * 0.3 * Math.sin(p.y * 1.2);
  const wy = p.y + t * 0.25 * Math.cos(p.x * 0.9);
  return { x: wx, y: wy };
}

export const scene3 = new Scene({
  id: () => tx('scene3', 'id'),
  duration: 22,
  narration: () => tx('scene3', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene3 as SceneText)?.subtitleCues ?? (text.es.scene3 as SceneText).subtitleCues,
  topic: () => tx('scene3', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene3', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    const panelW = W * 0.42;
    const panelTop = 55;
    const panelH = H - panelTop - 85;

    // Grid bounds in data space
    const gMin = -2, gMax = 2;
    const rows = 8, cols = 8;

    // Screen transforms for left panel (z-space)
    const leftX = W * 0.04;
    const lToX = (x: number) => leftX + ((x - gMin) / (gMax - gMin)) * panelW;
    const lToY = (y: number) => panelTop + panelH - ((y - gMin) / (gMax - gMin)) * panelH;

    // Screen transforms for right panel (x-space)
    const rightX = W * 0.54;
    const warpRange = 1.0;
    const rToX = (x: number) => rightX + ((x - (gMin - warpRange)) / ((gMax + warpRange) - (gMin - warpRange))) * panelW;
    const rToY = (y: number) => panelTop + panelH - ((y - (gMin - warpRange)) / ((gMax + warpRange) - (gMin - warpRange))) * panelH;

    // Warp amount animates
    const warpT = easedSub(progress, 0.2, 0.5, easeInOut);

    // Left panel: original grid (z-space)
    const gridP = easedSub(progress, 0.05, 0.25);
    if (gridP > 0) {
      fadeInText(ctx, tx('scene3', 'gridBefore'), leftX + panelW / 2, panelTop - 5, gridP, {
        color: colors.textSecondary, font: `12px ${fonts.body}`
      });
      drawWarpedGrid(ctx, rows, cols, gMin, gMax, gMin, gMax,
        (p) => p, lToX, lToY, colors.axis, gridP * 0.6);

      // Highlight one cell (unit square)
      const cellP = easedSub(progress, 0.15, 0.35);
      if (cellP > 0) {
        const cx1 = 0, cy1 = 0, cx2 = (gMax - gMin) / cols, cy2 = (gMax - gMin) / rows;
        ctx.save();
        ctx.globalAlpha = cellP * 0.4;
        ctx.fillStyle = series[0];
        ctx.fillRect(lToX(cx1), lToY(cy1 + cy2), lToX(cx1 + cx2) - lToX(cx1), lToY(cy1) - lToY(cy1 + cy2));
        ctx.restore();

        // Outline
        ctx.save();
        ctx.globalAlpha = cellP;
        ctx.strokeStyle = series[0];
        ctx.lineWidth = 2;
        ctx.strokeRect(lToX(cx1), lToY(cy1 + cy2), lToX(cx1 + cx2) - lToX(cx1), lToY(cy1) - lToY(cy1 + cy2));
        ctx.restore();

        // Unit square label
        if (cellP > 0.5) {
          fadeInText(ctx, tx('scene3', 'unitSquare'), lToX(cx1 + cx2 / 2), lToY(cy1 + cy2) - 8, (cellP - 0.5) * 2, {
            color: series[0], font: `9px ${fonts.body}`
          });
        }
      }
    }

    // Right panel: warped grid (x-space)
    const warpGridP = easedSub(progress, 0.15, 0.5);
    if (warpGridP > 0) {
      fadeInText(ctx, tx('scene3', 'gridAfter'), rightX + panelW / 2, panelTop - 5, warpGridP, {
        color: colors.textSecondary, font: `12px ${fonts.body}`
      });
      drawWarpedGrid(ctx, rows, cols, gMin, gMax, gMin, gMax,
        (p) => warp(p, warpT), rToX, rToY, series[1], warpGridP * 0.6);

      // Highlight warped cell (parallelogram)
      const cellP2 = easedSub(progress, 0.3, 0.55);
      if (cellP2 > 0) {
        const cx1 = 0, cy1 = 0;
        const cx2 = (gMax - gMin) / cols, cy2 = (gMax - gMin) / rows;
        const corners = [
          warp({ x: cx1, y: cy1 }, warpT),
          warp({ x: cx1 + cx2, y: cy1 }, warpT),
          warp({ x: cx1 + cx2, y: cy1 + cy2 }, warpT),
          warp({ x: cx1, y: cy1 + cy2 }, warpT),
        ];

        ctx.save();
        ctx.globalAlpha = cellP2 * 0.4;
        ctx.fillStyle = series[0];
        ctx.beginPath();
        ctx.moveTo(rToX(corners[0].x), rToY(corners[0].y));
        for (let i = 1; i < 4; i++) ctx.lineTo(rToX(corners[i].x), rToY(corners[i].y));
        ctx.closePath();
        ctx.fill();

        ctx.globalAlpha = cellP2;
        ctx.strokeStyle = series[0];
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Parallelogram label
        if (cellP2 > 0.5) {
          const paraCenter = {
            x: (corners[0].x + corners[2].x) / 2,
            y: (corners[0].y + corners[2].y) / 2,
          };
          fadeInText(ctx, tx('scene3', 'parallelogram'), rToX(paraCenter.x), rToY(paraCenter.y) - 15, (cellP2 - 0.5) * 2, {
            color: series[0], font: `9px ${fonts.body}`
          });
        }

        // Draw Jacobian column vectors as arrows from the origin corner
        const vecP = easedSub(progress, 0.45, 0.65);
        if (vecP > 0) {
          const origin = corners[0];
          const col1End = corners[1]; // ∂f/∂z₁ direction
          const col2End = corners[3]; // ∂f/∂z₂ direction

          ctx.save();
          ctx.globalAlpha = vecP;

          // Column 1 vector (origin -> right neighbor)
          ctx.strokeStyle = series[2];
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(rToX(origin.x), rToY(origin.y));
          ctx.lineTo(rToX(col1End.x), rToY(col1End.y));
          ctx.stroke();
          // Arrowhead
          const a1 = Math.atan2(rToY(col1End.y) - rToY(origin.y), rToX(col1End.x) - rToX(origin.x));
          ctx.fillStyle = series[2];
          ctx.beginPath();
          ctx.moveTo(rToX(col1End.x), rToY(col1End.y));
          ctx.lineTo(rToX(col1End.x) - 8 * Math.cos(a1 - 0.4), rToY(col1End.y) - 8 * Math.sin(a1 - 0.4));
          ctx.lineTo(rToX(col1End.x) - 8 * Math.cos(a1 + 0.4), rToY(col1End.y) - 8 * Math.sin(a1 + 0.4));
          ctx.closePath();
          ctx.fill();

          // Column 1 label
          fadeInText(ctx, tx('scene3', 'col1Label'),
            (rToX(origin.x) + rToX(col1End.x)) / 2,
            (rToY(origin.y) + rToY(col1End.y)) / 2 + 15, vecP, {
              color: series[2], font: `bold 9px ${fonts.body}`
            });

          // Column 2 vector (origin -> top neighbor)
          ctx.strokeStyle = series[3];
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(rToX(origin.x), rToY(origin.y));
          ctx.lineTo(rToX(col2End.x), rToY(col2End.y));
          ctx.stroke();
          // Arrowhead
          const a2 = Math.atan2(rToY(col2End.y) - rToY(origin.y), rToX(col2End.x) - rToX(origin.x));
          ctx.fillStyle = series[3];
          ctx.beginPath();
          ctx.moveTo(rToX(col2End.x), rToY(col2End.y));
          ctx.lineTo(rToX(col2End.x) - 8 * Math.cos(a2 - 0.4), rToY(col2End.y) - 8 * Math.sin(a2 - 0.4));
          ctx.lineTo(rToX(col2End.x) - 8 * Math.cos(a2 + 0.4), rToY(col2End.y) - 8 * Math.sin(a2 + 0.4));
          ctx.closePath();
          ctx.fill();

          // Column 2 label
          fadeInText(ctx, tx('scene3', 'col2Label'),
            (rToX(origin.x) + rToX(col2End.x)) / 2 - 20,
            (rToY(origin.y) + rToY(col2End.y)) / 2, vecP, {
              color: series[3], font: `bold 9px ${fonts.body}`
            });

          ctx.restore();
        }

        // Area ratio label
        const areaP = easedSub(progress, 0.6, 0.75);
        if (areaP > 0) {
          fadeInText(ctx, tx('scene3', 'areaRatio'), rightX + panelW / 2, panelTop + panelH + 10, areaP, {
            color: colors.warning, font: `bold 11px ${fonts.body}`
          });
        }
      }
    }

    // Jacobian formula
    const fP = easedSub(progress, 0.72, 0.92);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'jac',
        'J = \\begin{bmatrix} \\frac{\\partial f_1}{\\partial z_1} & \\frac{\\partial f_1}{\\partial z_2} \\\\ \\frac{\\partial f_2}{\\partial z_1} & \\frac{\\partial f_2}{\\partial z_2} \\end{bmatrix}',
        50, 90, fP, { color: colors.textPrimary, fontSize: '1em' });
    }
  }
});
