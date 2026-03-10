// Scene 3: Coupling layer idea — split, copy, transform
// Enhanced: explicit block-triangular Jacobian visualization

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut, easeInOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { animateArrow } from '../../engine/animation/arrow';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

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

    const blockH = 28;
    const blockW = W * 0.1;
    const inputX = W * 0.12;
    const outputX = W * 0.55;
    const midY = H * 0.3;
    const d = 3;

    // Input vector blocks (left)
    const inputP = easedSub(progress, 0.05, 0.2);
    if (inputP > 0) {
      ctx.save();
      ctx.globalAlpha = inputP;

      // Top half: z₁ (copied)
      for (let i = 0; i < d; i++) {
        const y = midY - (d - i) * (blockH + 3);
        ctx.fillStyle = series[0] + '50';
        ctx.strokeStyle = series[0];
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(inputX, y, blockW, blockH, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = series[0];
        ctx.font = `10px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(`z\u2081,${i + 1}`, inputX + blockW / 2, y + blockH / 2 + 3);
      }

      // Bottom half: z₂ (transformed)
      for (let i = 0; i < d; i++) {
        const y = midY + 8 + i * (blockH + 3);
        ctx.fillStyle = series[2] + '50';
        ctx.strokeStyle = series[2];
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(inputX, y, blockW, blockH, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = series[2];
        ctx.font = `10px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(`z\u2082,${i + 1}`, inputX + blockW / 2, y + blockH / 2 + 3);
      }

      fadeInText(ctx, 'z\u2081', inputX + blockW / 2, midY - d * (blockH + 3) - 8, 1, {
        color: series[0], font: `bold 11px ${fonts.body}`
      });
      fadeInText(ctx, 'z\u2082', inputX + blockW / 2, midY + 8 + d * (blockH + 3) + 12, 1, {
        color: series[2], font: `bold 11px ${fonts.body}`
      });

      ctx.restore();
    }

    // Copy arrows (z₁ → x₁)
    const copyP = easedSub(progress, 0.2, 0.4);
    if (copyP > 0) {
      for (let i = 0; i < d; i++) {
        const y = midY - (d - i) * (blockH + 3) + blockH / 2;
        animateArrow(ctx, inputX + blockW + 5, y, outputX - 5, y, copyP, {
          color: series[0], lineWidth: 1.5, headSize: 6, dash: [4, 4]
        });
      }
      fadeInText(ctx, tx('scene3', 'copy'), (inputX + blockW + outputX) / 2, midY - d * (blockH + 3) - 3, copyP, {
        color: series[0], font: `bold 10px ${fonts.body}`
      });
    }

    // Transform arrows with coupling function box
    const transP = easedSub(progress, 0.3, 0.55);
    if (transP > 0) {
      ctx.save();
      ctx.globalAlpha = transP;

      const nnX = W * 0.32, nnY = midY + 8, nnW = W * 0.12, nnH = d * (blockH + 3) - 3;
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(nnX, nnY, nnW, nnH, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colors.accent;
      ctx.font = `bold 10px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('m(z\u2081)', nnX + nnW / 2, nnY + nnH / 2 + 3);

      // Arrow from z₁ down to NN
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(inputX + blockW / 2, midY);
      ctx.lineTo(inputX + blockW / 2, nnY + nnH / 2);
      ctx.lineTo(nnX, nnY + nnH / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      fadeInText(ctx, tx('scene3', 'conditioned'), (inputX + blockW / 2 + nnX) / 2, nnY - 6, 1, {
        color: colors.textMuted, font: `9px ${fonts.body}`
      });

      for (let i = 0; i < d; i++) {
        const y = midY + 8 + i * (blockH + 3) + blockH / 2;
        animateArrow(ctx, nnX + nnW + 3, y, outputX - 5, y, 1, {
          color: series[2], lineWidth: 1.5, headSize: 6
        });
      }

      fadeInText(ctx, tx('scene3', 'transform'), (nnX + nnW + outputX) / 2, midY + 8 + d * (blockH + 3) + 8, 1, {
        color: series[2], font: `bold 10px ${fonts.body}`
      });

      ctx.restore();
    }

    // Output blocks (right)
    const outP = easedSub(progress, 0.25, 0.45);
    if (outP > 0) {
      ctx.save();
      ctx.globalAlpha = outP;

      for (let i = 0; i < d; i++) {
        const y = midY - (d - i) * (blockH + 3);
        ctx.fillStyle = series[0] + '50';
        ctx.strokeStyle = series[0];
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(outputX, y, blockW, blockH, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = series[0];
        ctx.font = `10px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(`x\u2081,${i + 1}`, outputX + blockW / 2, y + blockH / 2 + 3);
      }
      for (let i = 0; i < d; i++) {
        const y = midY + 8 + i * (blockH + 3);
        ctx.fillStyle = series[2] + '50';
        ctx.strokeStyle = series[2];
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(outputX, y, blockW, blockH, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = series[2];
        ctx.font = `10px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(`x\u2082,${i + 1}`, outputX + blockW / 2, y + blockH / 2 + 3);
      }

      ctx.restore();
    }

    // --- Block-triangular Jacobian matrix visualization ---
    const jacVisP = easedSub(progress, 0.5, 0.75, easeInOut);
    if (jacVisP > 0) {
      ctx.save();
      ctx.globalAlpha = jacVisP;

      const matX = W * 0.7;
      const matY2 = 55;
      const n = 6; // 6x6 matrix (3+3)
      const cellSz = Math.min((W * 0.25) / n, (H * 0.35) / n);
      const matStartX = matX - (n / 2) * cellSz;
      const matStartY = matY2;

      fadeInText(ctx, tx('scene3', 'jacobianLabel'), matX, matY2 - 10, 1, {
        color: colors.textPrimary, font: `bold 11px ${fonts.body}`
      });

      for (let row = 0; row < n; row++) {
        for (let col = 0; col < n; col++) {
          const cx = matStartX + col * cellSz;
          const cy = matStartY + row * cellSz;

          const isTopLeft = row < 3 && col < 3; // I block
          const isTopRight = row < 3 && col >= 3; // 0 block
          const isBottomLeft = row >= 3 && col < 3; // ∂x₂/∂z₁ block
          const isBottomRight = row >= 3 && col >= 3; // ∂x₂/∂z₂ block

          let fillColor: string;
          let label = '';

          if (isTopLeft) {
            if (row === col) {
              fillColor = series[0] + '60';
              label = '1';
            } else {
              fillColor = colors.panelBg;
              label = '0';
            }
          } else if (isTopRight) {
            fillColor = colors.panelBg;
            label = '0';
          } else if (isBottomLeft) {
            fillColor = colors.textDimmed + '30';
            label = '*';
          } else {
            // Bottom right: diagonal only
            if (row - 3 === col - 3) {
              fillColor = series[1] + '70';
              label = 'd';
            } else {
              fillColor = colors.panelBg;
              label = '0';
            }
          }

          ctx.fillStyle = fillColor;
          ctx.fillRect(cx + 1, cy + 1, cellSz - 2, cellSz - 2);
          ctx.strokeStyle = colors.border;
          ctx.lineWidth = 0.5;
          ctx.strokeRect(cx + 1, cy + 1, cellSz - 2, cellSz - 2);

          ctx.fillStyle = colors.textSecondary;
          ctx.font = `${cellSz * 0.4}px ${fonts.mono}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, cx + cellSz / 2, cy + cellSz / 2);
        }
      }
      ctx.textBaseline = 'alphabetic';

      // Block labels
      const blockLabelP = easedSub(progress, 0.6, 0.72);
      if (blockLabelP > 0) {
        ctx.globalAlpha = blockLabelP * jacVisP;

        // I label (top-left)
        ctx.fillStyle = series[0];
        ctx.font = `bold 9px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(tx('scene3', 'identityBlock'), matStartX + 1.5 * cellSz, matStartY - 3);

        // 0 label (top-right)
        ctx.fillStyle = colors.textDimmed;
        ctx.fillText(tx('scene3', 'zeroBlock'), matStartX + 4.5 * cellSz, matStartY - 3);

        // ∂x₂/∂z₁ label (bottom-left)
        ctx.fillStyle = colors.textMuted;
        ctx.fillText(tx('scene3', 'arbitraryBlock'), matStartX + 1.5 * cellSz, matStartY + n * cellSz + 10);

        // diag label (bottom-right)
        ctx.fillStyle = series[1];
        ctx.fillText(tx('scene3', 'diagBlock'), matStartX + 4.5 * cellSz, matStartY + n * cellSz + 10);
      }

      // Separator lines
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(matStartX, matStartY + 3 * cellSz);
      ctx.lineTo(matStartX + n * cellSz, matStartY + 3 * cellSz);
      ctx.stroke();
      // Vertical
      ctx.beginPath();
      ctx.moveTo(matStartX + 3 * cellSz, matStartY);
      ctx.lineTo(matStartX + 3 * cellSz, matStartY + n * cellSz);
      ctx.stroke();

      ctx.restore();
    }

    // det explanation
    const detP = easedSub(progress, 0.72, 0.85);
    if (detP > 0) {
      fadeInText(ctx, tx('scene3', 'detExplain'), W * 0.72, H * 0.62, detP, {
        color: colors.insight, font: `bold 11px ${fonts.body}`
      });
    }

    // Formula
    const jacP = easedSub(progress, 0.82, 0.97);
    if (jacP > 0) {
      formulaAppear(state.formulaManager, 'coupling-jac',
        'J = \\begin{bmatrix} I & 0 \\\\ \\frac{\\partial \\mathbf{x}_2}{\\partial \\mathbf{z}_1} & \\text{diag}\\!\\left(\\frac{\\partial \\mathbf{x}_2}{\\partial \\mathbf{z}_2}\\right) \\end{bmatrix}',
        50, 90, jacP, { color: colors.textPrimary, fontSize: '0.9em' });
    }
  }
});
