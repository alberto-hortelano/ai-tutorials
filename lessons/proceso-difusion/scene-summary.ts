// Scene 7: The Full Picture — bidirectional chain

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { drawDiffusionChain } from '../_shared/diffusion-utils';
import { drawSimpleArrow } from '../_shared/network-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene7 = new Scene({
  id: () => tx('scene7', 'id'),
  duration: 22,
  narration: () => tx('scene7', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene7 as SceneText)?.subtitleCues ?? (text.es.scene7 as SceneText).subtitleCues,
  topic: () => tx('scene7', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene7', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    const chainX = W * 0.08;
    const chainW = W * 0.84;
    const nSteps = 6;
    const stepLabels = ['x_0', 'x_1', 'x_2', '...', 'x_{T-1}', 'x_T'];

    // Forward chain (top): data -> noise
    const fwdY = H * 0.3;
    const fwdP = easedSub(progress, 0.1, 0.4);

    // Forward label
    const fwdLabelP = easedSub(progress, 0.08, 0.18);
    fadeInText(ctx, tx('scene7', 'forwardRow'), W / 2, fwdY - 38, fwdLabelP, {
      color: colors.error, font: '12px "Segoe UI", system-ui, sans-serif',
    });

    // Draw forward chain (only forward arrows)
    if (fwdP > 0) {
      const spacing = chainW / (nSteps - 1);
      const nodeR = 14;

      ctx.save();
      ctx.globalAlpha = fwdP;

      // Nodes
      for (let i = 0; i < nSteps; i++) {
        const cx = chainX + i * spacing;
        const nodeColor = i === 0 ? colors.insight : i === nSteps - 1 ? colors.textDimmed : colors.accent;

        ctx.beginPath();
        ctx.arc(cx, fwdY, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor + '30';
        ctx.fill();
        ctx.strokeStyle = nodeColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Labels
        ctx.fillStyle = colors.textSecondary;
        ctx.font = '10px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(stepLabels[i], cx, fwdY + nodeR + 14);
      }

      // Forward arrows
      for (let i = 0; i < nSteps - 1; i++) {
        const sx = chainX + i * spacing + nodeR + 4;
        const ex = chainX + (i + 1) * spacing - nodeR - 4;
        drawSimpleArrow(ctx, sx, fwdY, ex, fwdY, 1, colors.error + '90', 6);
      }

      ctx.restore();
    }

    // Reverse chain (bottom): noise -> data
    const revY = H * 0.62;
    const revP = easedSub(progress, 0.4, 0.7);

    // Reverse label
    const revLabelP = easedSub(progress, 0.38, 0.48);
    fadeInText(ctx, tx('scene7', 'reverseRow'), W / 2, revY - 38, revLabelP, {
      color: colors.insight, font: '12px "Segoe UI", system-ui, sans-serif',
    });

    if (revP > 0) {
      const spacing = chainW / (nSteps - 1);
      const nodeR = 14;

      ctx.save();
      ctx.globalAlpha = revP;

      // Nodes (same positions)
      for (let i = 0; i < nSteps; i++) {
        const cx = chainX + i * spacing;
        const nodeColor = i === 0 ? colors.insight : i === nSteps - 1 ? colors.textDimmed : colors.accent;

        ctx.beginPath();
        ctx.arc(cx, revY, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor + '30';
        ctx.fill();
        ctx.strokeStyle = nodeColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = colors.textSecondary;
        ctx.font = '10px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(stepLabels[i], cx, revY + nodeR + 14);
      }

      // Reverse arrows (right to left)
      for (let i = nSteps - 1; i > 0; i--) {
        const sx = chainX + i * spacing - nodeR - 4;
        const ex = chainX + (i - 1) * spacing + nodeR + 4;
        drawSimpleArrow(ctx, sx, revY, ex, revY, 1, colors.insight + '90', 6);
      }

      ctx.restore();
    }

    // Endpoint labels
    const endP = easedSub(progress, 0.65, 0.78);
    if (endP > 0) {
      ctx.save();
      ctx.globalAlpha = endP;

      // x_0 label (left side)
      ctx.fillStyle = colors.insight;
      ctx.font = 'bold 12px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene7', 'dataNode'), chainX, (fwdY + revY) / 2);

      // x_T label (right side)
      ctx.fillStyle = colors.textDimmed;
      ctx.fillText(tx('scene7', 'noiseNode'), chainX + chainW, (fwdY + revY) / 2);

      // Vertical connecting lines
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      ctx.beginPath();
      ctx.moveTo(chainX, fwdY + 18);
      ctx.lineTo(chainX, revY - 18);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(chainX + chainW, fwdY + 18);
      ctx.lineTo(chainX + chainW, revY - 18);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    }

    // Summary insight box
    const boxP = easedSub(progress, 0.82, 0.95);
    if (boxP > 0) {
      ctx.save();
      ctx.globalAlpha = boxP;

      const boxW = W * 0.8;
      const boxX = W / 2 - boxW / 2;
      const boxY = H - 50;
      const boxH = 36;

      ctx.fillStyle = colors.panelBg;
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = colors.accent + '60';
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      // Two-color text
      ctx.font = '12px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillStyle = colors.error;
      ctx.fillText('Forward: destroy', W / 2 - 85, boxY + boxH / 2);
      ctx.fillStyle = colors.textMuted;
      ctx.fillText('|', W / 2, boxY + boxH / 2);
      ctx.fillStyle = colors.insight;
      ctx.fillText('Reverse: create', W / 2 + 85, boxY + boxH / 2);

      ctx.restore();
    }
  },
});
