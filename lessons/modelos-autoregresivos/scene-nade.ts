// Scene 3: NADE — shared weight matrix, parameter reduction, recursive trick

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut, easeOutBack, easeInOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene3 = new Scene({
  id: () => tx('scene3', 'id'),
  duration: 24,
  narration: () => tx('scene3', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene3 as SceneText)?.subtitleCues ?? (text.es.scene3 as SceneText).subtitleCues,
  topic: () => tx('scene3', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene3', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Two-panel comparison: separate weights vs shared weights
    const panelW = W * 0.4;
    const panelH = H * 0.38;
    const leftX = W * 0.05;
    const rightX = W * 0.55;
    const panelY = 55;

    // Left panel: Separate weights (FVSBN style)
    const leftP = easedSub(progress, 0.05, 0.3);
    if (leftP > 0) {
      ctx.save();
      ctx.globalAlpha = easeOut(leftP);

      // Panel border
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(leftX, panelY, panelW, panelH, 6);
      ctx.stroke();

      // Label
      fadeInText(ctx, tx('scene3', 'separate'), leftX + panelW / 2, panelY + 16, 1, {
        color: colors.error, font: `bold 11px ${fonts.body}`
      });

      // Draw separate connection groups (colored differently)
      const N = 4;
      const inputNodeX = leftX + 25;
      const hiddenNodeX = leftX + panelW / 2;
      const outputNodeX = leftX + panelW - 25;
      const nodeR = 8;
      const nodeSpacing = (panelH - 50) / (N - 1);

      for (let i = 0; i < N; i++) {
        const ny = panelY + 35 + i * nodeSpacing;

        // Input node
        ctx.beginPath();
        ctx.arc(inputNodeX, ny, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = series[0] + '40';
        ctx.fill();
        ctx.strokeStyle = series[0];
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = series[0];
        ctx.font = `bold 7px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`x${i + 1}`, inputNodeX, ny);

        // Output node
        ctx.beginPath();
        ctx.arc(outputNodeX, ny, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = series[2] + '40';
        ctx.fill();
        ctx.strokeStyle = series[2];
        ctx.stroke();
        ctx.fillStyle = series[2];
        ctx.fillText(`p${i + 1}`, outputNodeX, ny);

        // Connections from inputs 0..i-1 to hidden for output i
        // Use different colors to show separate weight sets
        const connColor = series[i % series.length];
        for (let j = 0; j < i; j++) {
          const iy = panelY + 35 + j * nodeSpacing;
          ctx.strokeStyle = connColor + '60';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(inputNodeX + nodeR + 1, iy);
          ctx.lineTo(outputNodeX - nodeR - 1, ny);
          ctx.stroke();
        }
      }
      ctx.textBaseline = 'alphabetic';
      ctx.restore();
    }

    // Right panel: Shared weights (NADE style)
    const rightP = easedSub(progress, 0.2, 0.5);
    if (rightP > 0) {
      ctx.save();
      ctx.globalAlpha = easeOut(rightP);

      // Panel border (highlighted)
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(rightX, panelY, panelW, panelH, 6);
      ctx.stroke();

      // Label
      fadeInText(ctx, tx('scene3', 'shared'), rightX + panelW / 2, panelY + 16, 1, {
        color: colors.insight, font: `bold 11px ${fonts.body}`
      });

      // Draw shared weight matrix connections (all same color)
      const N = 4;
      const inputNodeX = rightX + 25;
      const hiddenNodeX = rightX + panelW * 0.4;
      const outputNodeX = rightX + panelW - 25;
      const nodeR = 8;
      const nodeSpacing = (panelH - 50) / (N - 1);
      const hiddenN = 3;
      const hiddenSpacing = (panelH - 60) / (hiddenN - 1);

      // Input nodes
      for (let i = 0; i < N; i++) {
        const ny = panelY + 35 + i * nodeSpacing;
        ctx.beginPath();
        ctx.arc(inputNodeX, ny, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = series[0] + '40';
        ctx.fill();
        ctx.strokeStyle = series[0];
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = series[0];
        ctx.font = `bold 7px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`x${i + 1}`, inputNodeX, ny);
      }

      // Hidden nodes
      for (let h = 0; h < hiddenN; h++) {
        const hy = panelY + 40 + h * hiddenSpacing;
        ctx.beginPath();
        ctx.arc(hiddenNodeX, hy, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = colors.accent + '40';
        ctx.fill();
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = colors.accent;
        ctx.font = `bold 7px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`h${h + 1}`, hiddenNodeX, hy);
      }

      // Output nodes
      for (let i = 0; i < N; i++) {
        const ny = panelY + 35 + i * nodeSpacing;
        ctx.beginPath();
        ctx.arc(outputNodeX, ny, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = series[2] + '40';
        ctx.fill();
        ctx.strokeStyle = series[2];
        ctx.stroke();
        ctx.fillStyle = series[2];
        ctx.font = `bold 7px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`p${i + 1}`, outputNodeX, ny);
      }

      // Shared connections (all same color = same W)
      const shareP = easedSub(progress, 0.3, 0.5);
      if (shareP > 0) {
        ctx.globalAlpha = easeOut(shareP) * easeOut(rightP);
        for (let i = 0; i < N; i++) {
          const iy = panelY + 35 + i * nodeSpacing;
          for (let h = 0; h < hiddenN; h++) {
            const hy = panelY + 40 + h * hiddenSpacing;
            ctx.strokeStyle = colors.accent + '50';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(inputNodeX + nodeR + 1, iy);
            ctx.lineTo(hiddenNodeX - nodeR - 1, hy);
            ctx.stroke();
          }
        }
        for (let h = 0; h < hiddenN; h++) {
          const hy = panelY + 40 + h * hiddenSpacing;
          for (let i = 0; i < N; i++) {
            const oy = panelY + 35 + i * nodeSpacing;
            ctx.strokeStyle = colors.accent + '50';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(hiddenNodeX + nodeR + 1, hy);
            ctx.lineTo(outputNodeX - nodeR - 1, oy);
            ctx.stroke();
          }
        }
      }

      ctx.textBaseline = 'alphabetic';
      ctx.restore();
    }

    // "W" label on shared connections
    const wLabelP = easedSub(progress, 0.35, 0.5);
    if (wLabelP > 0) {
      const wX = rightX + panelW * 0.3;
      const wY = panelY + panelH / 2 - 2;
      ctx.save();
      ctx.globalAlpha = easeOut(wLabelP);
      ctx.fillStyle = colors.accent;
      ctx.font = `bold 16px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('W', wX, wY);
      ctx.restore();
    }

    // Parameter reduction animation
    const reduceP = easedSub(progress, 0.5, 0.7, easeInOut);
    if (reduceP > 0) {
      const rY = panelY + panelH + 25;

      ctx.save();
      ctx.globalAlpha = easeOut(reduceP);

      // Before: O(n^2 d)
      const beforeX = W * 0.25;
      ctx.fillStyle = colors.error + '20';
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(beforeX - 50, rY - 12, 100, 24, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colors.error;
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene3', 'paramsBefore'), beforeX, rY + 4);

      // Arrow
      const arrowP = easedSub(progress, 0.55, 0.65);
      if (arrowP > 0) {
        const aStartX = beforeX + 55;
        const aEndX = W * 0.75 - 55;
        const ax = aStartX + (aEndX - aStartX) * easeOut(arrowP);
        ctx.strokeStyle = colors.textMuted;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(aStartX, rY);
        ctx.lineTo(ax, rY);
        ctx.stroke();
        if (arrowP > 0.5) {
          ctx.fillStyle = colors.textMuted;
          ctx.beginPath();
          ctx.moveTo(ax, rY);
          ctx.lineTo(ax - 6, rY - 4);
          ctx.lineTo(ax - 6, rY + 4);
          ctx.closePath();
          ctx.fill();
        }
      }

      // After: O(nd)
      const afterP = easedSub(progress, 0.6, 0.7);
      if (afterP > 0) {
        const afterX = W * 0.75;
        ctx.globalAlpha = easeOut(afterP);
        ctx.fillStyle = colors.insight + '20';
        ctx.strokeStyle = colors.insight;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(afterX - 50, rY - 12, 100, 24, 12);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = colors.insight;
        ctx.font = `bold 12px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(tx('scene3', 'paramsAfter'), afterX, rY + 4);
      }

      ctx.restore();
    }

    // Recursive trick label
    const recP = easedSub(progress, 0.7, 0.85);
    if (recP > 0) {
      const recY = panelY + panelH + 60;
      ctx.save();
      ctx.globalAlpha = easeOut(recP);
      ctx.fillStyle = colors.warning + '20';
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(W / 2 - 90, recY - 12, 180, 24, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colors.warning;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene3', 'recursive'), W / 2, recY + 4);
      ctx.restore();
    }

    // Formula
    const fP = easedSub(progress, 0.85, 0.98);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'nade',
        '\\mathbf{h}_i = \\sigma(W_{:,<i}\\,\\mathbf{x}_{<i} + \\mathbf{c}) \\quad\\Rightarrow\\quad \\mathbf{a}_{i+1} = \\mathbf{a}_i + W_{:,i}\\,x_i',
        50, 92, fP, { color: colors.textPrimary, fontSize: '0.8em' });
    }
  }
});
