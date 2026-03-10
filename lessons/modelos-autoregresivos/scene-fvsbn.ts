// Scene 2: FVSBN — Fully Visible Sigmoid Belief Network

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { sigmoid } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

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

    // Title
    fadeInText(ctx, tx('scene2', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Full name subtitle
    fadeInText(ctx, tx('scene2', 'fullName'), W / 2, 50, easedSub(progress, 0.03, 0.12), {
      color: colors.textMuted, font: `11px ${fonts.body}`
    });

    // Network diagram: input nodes x1..x4 on left, output nodes (sigmoid) on right
    const N = 5;
    const nodeR = 12;
    const inputX = W * 0.2;
    const outputX = W * 0.75;
    const sigmoidX = W * 0.6;
    const startY = H * 0.22;
    const nodeSpacing = Math.min((H * 0.5) / (N - 1), 40);

    // Draw input nodes (x1..x5)
    const netP = easedSub(progress, 0.08, 0.3);
    if (netP > 0) {
      for (let i = 0; i < N; i++) {
        const nodeP = easedSub(progress, 0.08 + i * 0.03, 0.15 + i * 0.03);
        if (nodeP <= 0) continue;

        const ny = startY + i * nodeSpacing;

        ctx.save();
        ctx.globalAlpha = easeOut(nodeP);

        // Node circle
        ctx.beginPath();
        ctx.arc(inputX, ny, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = series[0] + '40';
        ctx.fill();
        ctx.strokeStyle = series[0];
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.fillStyle = series[0];
        ctx.font = `bold 10px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`x${i + 1}`, inputX, ny);
        ctx.textBaseline = 'alphabetic';

        ctx.restore();
      }
    }

    // Draw weighted connections and output (sigmoid) nodes
    // For output i, draw connections from x1..x(i-1)
    const connP = easedSub(progress, 0.2, 0.6);
    if (connP > 0) {
      for (let i = 1; i < N; i++) {
        const outP = easedSub(progress, 0.2 + i * 0.07, 0.35 + i * 0.07);
        if (outP <= 0) continue;

        const oy = startY + i * nodeSpacing;

        ctx.save();
        ctx.globalAlpha = easeOut(outP);

        // Connections from x1..x(i-1) to output i
        for (let j = 0; j < i; j++) {
          const iy = startY + j * nodeSpacing;
          const lineAlpha = easedSub(progress, 0.22 + i * 0.07 + j * 0.01, 0.3 + i * 0.07 + j * 0.01);
          if (lineAlpha <= 0) continue;

          ctx.save();
          ctx.globalAlpha = lineAlpha * easeOut(outP) * 0.6;
          ctx.strokeStyle = colors.textDimmed;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(inputX + nodeR + 2, iy);
          ctx.lineTo(sigmoidX - nodeR - 2, oy);
          ctx.stroke();

          // Weight label (small wij)
          if (lineAlpha > 0.5 && i < 4) {
            const mx = (inputX + sigmoidX) / 2 - 10 + j * 8;
            const my = (iy + oy) / 2 - 4;
            ctx.fillStyle = colors.textDimmed;
            ctx.font = `8px ${fonts.mono}`;
            ctx.textAlign = 'center';
            ctx.fillText(`w${i}${j + 1}`, mx, my);
          }
          ctx.restore();
        }

        // Sigmoid node (summation + sigmoid)
        ctx.beginPath();
        ctx.arc(sigmoidX, oy, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = colors.accent + '40';
        ctx.fill();
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Sigma symbol inside
        ctx.fillStyle = colors.accent;
        ctx.font = `bold 11px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u03c3', sigmoidX, oy);
        ctx.textBaseline = 'alphabetic';

        // Arrow to output
        ctx.strokeStyle = colors.insight;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sigmoidX + nodeR + 2, oy);
        ctx.lineTo(outputX - nodeR - 2, oy);
        ctx.stroke();

        // Arrowhead
        ctx.fillStyle = colors.insight;
        ctx.beginPath();
        ctx.moveTo(outputX - nodeR - 2, oy);
        ctx.lineTo(outputX - nodeR - 8, oy - 3);
        ctx.lineTo(outputX - nodeR - 8, oy + 3);
        ctx.closePath();
        ctx.fill();

        // Output node
        ctx.beginPath();
        ctx.arc(outputX, oy, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = series[2] + '40';
        ctx.fill();
        ctx.strokeStyle = series[2];
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = series[2];
        ctx.font = `bold 10px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`p${i + 1}`, outputX, oy);
        ctx.textBaseline = 'alphabetic';

        ctx.restore();
      }
    }

    // "Logistic regression" label
    const logP = easedSub(progress, 0.45, 0.6);
    fadeInText(ctx, tx('scene2', 'logistic'), W / 2, startY + N * nodeSpacing + 15, logP, {
      color: colors.accent, font: `bold 12px ${fonts.body}`
    });

    // Sigmoid curve mini diagram
    const sigP = easedSub(progress, 0.55, 0.75);
    if (sigP > 0) {
      const sigCX = W * 0.5;
      const sigCY = H * 0.82;
      const sigW = 80;
      const sigH = 40;

      ctx.save();
      ctx.globalAlpha = easeOut(sigP);

      // Axes
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sigCX - sigW / 2, sigCY + sigH / 2);
      ctx.lineTo(sigCX + sigW / 2, sigCY + sigH / 2);
      ctx.moveTo(sigCX, sigCY - sigH / 2);
      ctx.lineTo(sigCX, sigCY + sigH / 2);
      ctx.stroke();

      // Sigmoid curve
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const steps = 40;
      for (let s = 0; s <= steps * sigP; s++) {
        const t = s / steps;
        const xVal = -6 + 12 * t;
        const yVal = sigmoid(xVal);
        const px = sigCX - sigW / 2 + t * sigW;
        const py = sigCY + sigH / 2 - yVal * sigH;
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Label
      ctx.fillStyle = colors.textMuted;
      ctx.font = `10px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene2', 'sigmoid'), sigCX, sigCY + sigH / 2 + 14);

      ctx.restore();
    }

    // Parameters badge
    const paramP = easedSub(progress, 0.7, 0.85);
    if (paramP > 0) {
      const bx = W / 2;
      const by = H * 0.95;

      ctx.save();
      ctx.globalAlpha = easeOut(paramP);
      ctx.fillStyle = colors.warning + '20';
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bx - 80, by - 14, 160, 28, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.warning;
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene2', 'params'), bx, by + 4);
      ctx.restore();
    }

    // Formula
    const fP = easedSub(progress, 0.85, 0.98);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'fvsbn',
        'p(x_i = 1 \\mid \\mathbf{x}_{<i}) = \\sigma\\!\\left(\\alpha_i + \\sum_{j<i} w_{ij} x_j\\right)',
        50, 90, fP, { color: colors.textPrimary, fontSize: '0.85em' });
    }
  }
});
