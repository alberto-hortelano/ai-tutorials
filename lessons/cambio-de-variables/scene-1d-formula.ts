// Scene 2: 1D change of variables formula
// Enhanced: visual proof showing [x, x+dx] → [z, z+dz] interval mapping

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { stdNormalPdf, newtonInverse } from '../_shared/flow-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// f(z) = z³/3 + z (monotonic, invertible)
function fwd(z: number): number { return z * z * z / 3 + z; }
function fwdDeriv(z: number): number { return z * z + 1; }

export const scene2 = new Scene({
  id: () => tx('scene2', 'id'),
  duration: 22,
  narration: () => tx('scene2', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene2 as SceneText)?.subtitleCues ?? (text.es.scene2 as SceneText).subtitleCues,
  topic: () => tx('scene2', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene2', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // --- Visual proof section (top portion) ---
    const proofP = easedSub(progress, 0.05, 0.45);
    if (proofP > 0) {
      ctx.save();
      ctx.globalAlpha = proofP;

      const proofTop = 48;
      const proofH = H * 0.28;
      const proofW = W * 0.8;
      const proofX = (W - proofW) / 2;

      // Two number lines: z-space (top) and x-space (bottom)
      const zLineY = proofTop + 15;
      const xLineY = proofTop + proofH - 10;

      // z line
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(proofX, zLineY);
      ctx.lineTo(proofX + proofW, zLineY);
      ctx.stroke();
      ctx.fillStyle = series[0];
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'left';
      ctx.fillText('z', proofX + proofW + 5, zLineY + 4);

      // x line
      ctx.strokeStyle = series[2];
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(proofX, xLineY);
      ctx.lineTo(proofX + proofW, xLineY);
      ctx.stroke();
      ctx.fillStyle = series[2];
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'left';
      ctx.fillText('x', proofX + proofW + 5, xLineY + 4);

      // Show interval [z, z+dz] on top line and [x, x+dx] on bottom
      const intP = easedSub(progress, 0.1, 0.3);
      if (intP > 0) {
        // Interval on z-line
        const zCenter = 0.45; // fraction of line
        const dzWidth = 0.08;
        const zL = proofX + (zCenter - dzWidth / 2) * proofW;
        const zR = proofX + (zCenter + dzWidth / 2) * proofW;

        ctx.globalAlpha = intP * proofP;
        ctx.fillStyle = series[0] + '40';
        ctx.fillRect(zL, zLineY - 8, zR - zL, 16);
        ctx.strokeStyle = series[0];
        ctx.lineWidth = 2;
        ctx.strokeRect(zL, zLineY - 8, zR - zL, 16);

        ctx.fillStyle = series[0];
        ctx.font = `bold 10px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText('z', zL - 8, zLineY + 4);
        ctx.fillText('z+dz', zR + 16, zLineY + 4);

        // Interval on x-line (wider because f stretches)
        const xCenter = 0.5;
        const dxWidth = 0.15; // f stretches, so dx > dz
        const xL = proofX + (xCenter - dxWidth / 2) * proofW;
        const xR = proofX + (xCenter + dxWidth / 2) * proofW;

        ctx.fillStyle = series[2] + '40';
        ctx.fillRect(xL, xLineY - 8, xR - xL, 16);
        ctx.strokeStyle = series[2];
        ctx.lineWidth = 2;
        ctx.strokeRect(xL, xLineY - 8, xR - xL, 16);

        ctx.fillStyle = series[2];
        ctx.font = `bold 10px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText('x', xL - 8, xLineY + 4);
        ctx.fillText('x+dx', xR + 16, xLineY + 4);

        // Mapping arrows
        const arrowP = easedSub(progress, 0.15, 0.3);
        if (arrowP > 0) {
          ctx.globalAlpha = arrowP * proofP;
          ctx.setLineDash([4, 3]);
          ctx.strokeStyle = colors.textMuted;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo((zL + zR) / 2, zLineY + 8);
          ctx.lineTo((xL + xR) / 2, xLineY - 8);
          ctx.stroke();
          ctx.setLineDash([]);

          // Arrow label: f(z) = x
          ctx.fillStyle = colors.accent;
          ctx.font = `bold 10px ${fonts.body}`;
          ctx.textAlign = 'center';
          ctx.fillText('x = f(z)', (zL + zR) / 2 + 30, (zLineY + xLineY) / 2);

          // Width labels
          ctx.fillStyle = series[0];
          ctx.fillText('dz', (zL + zR) / 2, zLineY - 14);
          ctx.fillStyle = series[2];
          ctx.fillText('dx', (xL + xR) / 2, xLineY + 20);
        }
      }

      // Proof text steps
      const step1P = easedSub(progress, 0.22, 0.32);
      const step2P = easedSub(progress, 0.3, 0.4);

      if (step1P > 0) {
        fadeInText(ctx, tx('scene2', 'proofConserve'), W * 0.82, zLineY + 15, step1P, {
          color: colors.warning, font: `bold 10px ${fonts.mono}`, align: 'center'
        });
      }
      if (step2P > 0) {
        fadeInText(ctx, tx('scene2', 'proofResult'), W * 0.82, xLineY - 12, step2P, {
          color: colors.insight, font: `bold 10px ${fonts.mono}`, align: 'center'
        });
      }

      ctx.restore();
    }

    // --- Distribution panels (bottom portion) ---
    const panelW = W * 0.44;
    const panelTop = H * 0.38;
    const panelH = H - panelTop - 55;
    const gap = W * 0.12;

    // Shared ranges
    const zMin = -3, zMax = 3;
    const xRangeMin = -12, xRangeMax = 12;
    const yMaxPdf = 0.45;

    // Left panel: p_Z(z)
    const leftX = W * 0.03;
    const leftP = easedSub(progress, 0.3, 0.55);
    if (leftP > 0) {
      ctx.save();
      ctx.globalAlpha = leftP;

      const toX = (z: number) => leftX + ((z - zMin) / (zMax - zMin)) * panelW;
      const toY = (y: number) => panelTop + panelH - (y / yMaxPdf) * panelH;

      // Axes
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(leftX, panelTop + panelH);
      ctx.lineTo(leftX + panelW, panelTop + panelH);
      ctx.stroke();

      // Label
      fadeInText(ctx, tx('scene2', 'zLabel'), leftX + panelW / 2, panelTop - 2, 1, {
        color: series[0], font: `bold 12px ${fonts.body}`
      });

      // Gaussian curve
      const steps = 200;
      ctx.fillStyle = series[0] + '25';
      ctx.beginPath();
      ctx.moveTo(toX(zMin), toY(0));
      for (let i = 0; i <= steps; i++) {
        const z = zMin + (i / steps) * (zMax - zMin);
        ctx.lineTo(toX(z), toY(stdNormalPdf(z) * leftP));
      }
      ctx.lineTo(toX(zMax), toY(0));
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = series[0];
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const z = zMin + (i / steps) * (zMax - zMin);
        const px = toX(z), py = toY(stdNormalPdf(z) * leftP);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      ctx.restore();
    }

    // Arrow between panels
    const arrowP = easedSub(progress, 0.48, 0.6);
    if (arrowP > 0) {
      const ax1 = leftX + panelW + 8;
      const ax2 = leftX + panelW + gap - 8;
      const ay = panelTop + panelH / 2;
      ctx.save();
      ctx.globalAlpha = arrowP;
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ax1, ay);
      ctx.lineTo(ax2, ay);
      ctx.stroke();
      // Arrowhead
      ctx.fillStyle = colors.textMuted;
      ctx.beginPath();
      ctx.moveTo(ax2, ay);
      ctx.lineTo(ax2 - 8, ay - 5);
      ctx.lineTo(ax2 - 8, ay + 5);
      ctx.closePath();
      ctx.fill();

      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = colors.accent;
      ctx.fillText('x = f(z)', (ax1 + ax2) / 2, ay - 12);
      ctx.restore();
    }

    // Right panel: p_X(x) via change of variables
    const rightX = leftX + panelW + gap;
    const rightP = easedSub(progress, 0.5, 0.78);
    if (rightP > 0) {
      ctx.save();
      ctx.globalAlpha = rightP;

      const toX = (x: number) => rightX + ((x - xRangeMin) / (xRangeMax - xRangeMin)) * panelW;
      const toY = (y: number) => panelTop + panelH - (y / yMaxPdf) * panelH;

      // Axes
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rightX, panelTop + panelH);
      ctx.lineTo(rightX + panelW, panelTop + panelH);
      ctx.stroke();

      // Label
      fadeInText(ctx, tx('scene2', 'xLabel'), rightX + panelW / 2, panelTop - 2, 1, {
        color: series[2], font: `bold 12px ${fonts.body}`
      });

      // Transformed density p_X(x) = p_Z(z) / |f'(z)|
      const steps = 300;
      ctx.fillStyle = series[2] + '25';
      ctx.beginPath();
      ctx.moveTo(toX(xRangeMin), toY(0));
      for (let i = 0; i <= steps; i++) {
        const x = xRangeMin + (i / steps) * (xRangeMax - xRangeMin);
        const z = newtonInverse(fwd, fwdDeriv, x, x * 0.3);
        const pz = stdNormalPdf(z);
        const absDfInv = 1 / Math.max(fwdDeriv(z), 1e-6);
        const px_val = pz * absDfInv;
        ctx.lineTo(toX(x), toY(px_val * rightP));
      }
      ctx.lineTo(toX(xRangeMax), toY(0));
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = series[2];
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const x = xRangeMin + (i / steps) * (xRangeMax - xRangeMin);
        const z = newtonInverse(fwd, fwdDeriv, x, x * 0.3);
        const pz = stdNormalPdf(z);
        const absDfInv = 1 / Math.max(fwdDeriv(z), 1e-6);
        const px_val = pz * absDfInv;
        const sx = toX(x), sy = toY(px_val * rightP);
        if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // Stretch/compress annotations
      const annoP = easedSub(progress, 0.7, 0.85);
      if (annoP > 0) {
        ctx.globalAlpha = annoP;
        fadeInText(ctx, tx('scene2', 'compressLabel'), toX(0), toY(0.4) - 10, annoP, {
          color: colors.insight, font: `10px ${fonts.body}`, align: 'center'
        });
        fadeInText(ctx, tx('scene2', 'stretchLabel'), toX(8), toY(0.05) + 10, annoP, {
          color: colors.warning, font: `10px ${fonts.body}`, align: 'center'
        });
      }

      ctx.restore();
    }

    // Formula
    const fP = easedSub(progress, 0.82, 0.97);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'cov1d',
        'p_X(x) = p_Z\\bigl(f^{-1}(x)\\bigr)\\cdot\\left|\\frac{df^{-1}}{dx}\\right|',
        50, 92, fP, { color: colors.textPrimary, fontSize: '1.1em' });
    }
  }
});
