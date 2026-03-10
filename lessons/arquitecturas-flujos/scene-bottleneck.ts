// Scene 1: Jacobian bottleneck — O(D³) → O(D) with triangular matrices
// Enhanced: cubic cost graph and MNIST example

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeInOut, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene1 = new Scene({
  id: () => tx('scene1', 'id'),
  duration: 20,
  narration: () => tx('scene1', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene1 as SceneText)?.subtitleCues ?? (text.es.scene1 as SceneText).subtitleCues,
  topic: () => tx('scene1', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene1', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // --- Cost graph (left side) showing D³ growth ---
    const graphP = easedSub(progress, 0.05, 0.35);
    if (graphP > 0) {
      ctx.save();
      ctx.globalAlpha = graphP;

      const gLeft = W * 0.05;
      const gRight = W * 0.42;
      const gTop = 50;
      const gBottom = H * 0.55;
      const gW = gRight - gLeft;
      const gH = gBottom - gTop;

      // Axes
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(gLeft, gBottom);
      ctx.lineTo(gRight, gBottom);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(gLeft, gBottom);
      ctx.lineTo(gLeft, gTop);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = colors.textMuted;
      ctx.font = `10px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('D', gRight + 10, gBottom + 5);
      ctx.save();
      ctx.translate(gLeft - 15, gTop + gH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(tx('scene1', 'costLabel'), 0, 0);
      ctx.restore();

      // D ticks
      const dValues = [100, 200, 400, 784];
      const maxD = 800;
      const maxOps = Math.pow(784, 3);

      dValues.forEach(d => {
        const dx = gLeft + (d / maxD) * gW;
        ctx.fillStyle = colors.textDimmed;
        ctx.font = `8px ${fonts.mono}`;
        ctx.textAlign = 'center';
        ctx.fillText(String(d), dx, gBottom + 12);
      });

      // Draw cubic curve with animation
      const drawT = easedSub(progress, 0.1, 0.3);
      const steps = 200;
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= Math.floor(steps * drawT); i++) {
        const d = (i / steps) * maxD;
        const ops = Math.pow(d, 3);
        const sx = gLeft + (d / maxD) * gW;
        const sy = gBottom - (ops / maxOps) * gH * 0.9;
        if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // O(D³) label on the curve
      if (drawT > 0.5) {
        ctx.fillStyle = colors.error;
        ctx.font = `bold 11px ${fonts.body}`;
        ctx.textAlign = 'left';
        ctx.fillText('O(D³)', gLeft + gW * 0.5, gTop + 20);
      }

      // Linear curve for comparison (O(D))
      const linP = easedSub(progress, 0.25, 0.35);
      if (linP > 0) {
        ctx.strokeStyle = colors.insight;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= Math.floor(steps * linP); i++) {
          const d = (i / steps) * maxD;
          const ops = d * 5000; // scale to be visible
          const sx = gLeft + (d / maxD) * gW;
          const sy = gBottom - (ops / maxOps) * gH * 0.9;
          if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        ctx.fillStyle = colors.insight;
        ctx.font = `bold 11px ${fonts.body}`;
        ctx.fillText('O(D)', gLeft + gW * 0.7, gBottom - 20);
      }

      // MNIST marker at D=784
      const mnistP = easedSub(progress, 0.2, 0.32);
      if (mnistP > 0) {
        const mx = gLeft + (784 / maxD) * gW;
        ctx.globalAlpha = mnistP * graphP;
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = colors.warning;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mx, gBottom);
        ctx.lineTo(mx, gTop);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = colors.warning;
        ctx.font = `bold 9px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText('MNIST', mx, gTop - 5);
        ctx.fillText('D=784', mx, gTop + 10);
      }

      ctx.restore();
    }

    // MNIST cost callout
    const mnistCallP = easedSub(progress, 0.3, 0.45);
    if (mnistCallP > 0) {
      ctx.save();
      ctx.globalAlpha = mnistCallP;
      const bx = W * 0.25, by = H * 0.62;
      ctx.fillStyle = colors.warning + '20';
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bx - 100, by - 12, 200, 24, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colors.warning;
      ctx.font = `bold 10px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene1', 'mnistCost'), bx, by + 3);
      ctx.restore();
    }

    // --- Matrix visualizations (right side) ---
    const D = 6;
    const cellSz = Math.min((W * 0.3) / D, (H * 0.4) / D);
    const matY = 60;

    // Right: Full matrix
    const rightCx = W * 0.62;
    const fullP = easedSub(progress, 0.08, 0.25);
    if (fullP > 0) {
      ctx.save();
      ctx.globalAlpha = fullP;
      fadeInText(ctx, tx('scene1', 'fullMatrix'), rightCx, matY - 15, 1, {
        color: colors.error, font: `bold 12px ${fonts.body}`
      });

      for (let row = 0; row < D; row++) {
        for (let c = 0; c < D; c++) {
          const x = rightCx - (D / 2) * cellSz + c * cellSz;
          const y = matY + row * cellSz;
          ctx.fillStyle = series[0] + '50';
          ctx.fillRect(x + 1, y + 1, cellSz - 2, cellSz - 2);
          ctx.strokeStyle = colors.border;
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x + 1, y + 1, cellSz - 2, cellSz - 2);
        }
      }
      ctx.restore();
    }

    // Far right: Triangular matrix
    const triCx = W * 0.87;
    const triP = easedSub(progress, 0.3, 0.55);
    if (triP > 0) {
      ctx.save();
      ctx.globalAlpha = triP;
      fadeInText(ctx, tx('scene1', 'triangular'), triCx, matY - 15, 1, {
        color: colors.insight, font: `bold 12px ${fonts.body}`
      });

      for (let row = 0; row < D; row++) {
        for (let col = 0; col < D; col++) {
          const x = triCx - (D / 2) * cellSz + col * cellSz;
          const y = matY + row * cellSz;

          const isLowerTri = col <= row;
          const isDiag = col === row;

          if (isLowerTri) {
            ctx.fillStyle = isDiag ? series[1] + '80' : series[0] + '30';
            ctx.fillRect(x + 1, y + 1, cellSz - 2, cellSz - 2);
          } else {
            ctx.fillStyle = colors.panelBg;
            ctx.fillRect(x + 1, y + 1, cellSz - 2, cellSz - 2);
            ctx.fillStyle = colors.textDimmed;
            ctx.font = `${cellSz * 0.5}px ${fonts.body}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('0', x + cellSz / 2, y + cellSz / 2);
          }
          ctx.strokeStyle = colors.border;
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x + 1, y + 1, cellSz - 2, cellSz - 2);
        }
      }
      ctx.textBaseline = 'alphabetic';
      ctx.restore();
    }

    // Arrow showing transition
    const arrowP = easedSub(progress, 0.4, 0.55);
    if (arrowP > 0) {
      const ax1 = rightCx + D * cellSz / 2 + 8;
      const ax2 = triCx - D * cellSz / 2 - 8;
      const ay = matY + D * cellSz / 2;
      ctx.save();
      ctx.globalAlpha = arrowP;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(ax1, ay);
      ctx.lineTo(ax2, ay);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.moveTo(ax2, ay);
      ctx.lineTo(ax2 - 8, ay - 5);
      ctx.lineTo(ax2 - 8, ay + 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Cost badges below matrices
    const badgeY = matY + D * cellSz + 20;
    const badge1P = easedSub(progress, 0.2, 0.35);
    const badge2P = easedSub(progress, 0.55, 0.7);

    if (badge1P > 0) {
      ctx.save();
      ctx.globalAlpha = badge1P;
      ctx.fillStyle = colors.error + '30';
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(rightCx - 45, badgeY - 12, 90, 24, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colors.error;
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('O(D\u00B3)', rightCx, badgeY + 4);
      ctx.restore();
    }

    if (badge2P > 0) {
      ctx.save();
      ctx.globalAlpha = badge2P;
      ctx.fillStyle = colors.insight + '30';
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(triCx - 45, badgeY - 12, 90, 24, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colors.insight;
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('O(D)', triCx, badgeY + 4);
      ctx.restore();
    }

    // Formula for diagonal product
    const fP = easedSub(progress, 0.75, 0.92);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'detTri',
        '\\det J_{\\text{tri}} = \\prod_{i=1}^{D} J_{ii}',
        50, 90, fP, { color: colors.textPrimary, fontSize: '1.1em' });
    }
  }
});
