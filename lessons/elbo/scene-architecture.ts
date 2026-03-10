// Scene 7: Summary — Full VAE pipeline with ELBO overlay

import { Scene } from '../../engine/scene';
import { colors, fonts } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { roundRect } from '../../engine/shared/canvas-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene7 = new Scene({
  id: () => tx('scene7', 'id'),
  duration: 24,
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

    // Pipeline layout
    const pipeY = H * 0.28;
    const boxW = W * 0.16;
    const boxH = 50;
    const spacing = W * 0.22;
    const startX = W * 0.08;

    // Node positions
    const nodes = [
      { x: startX,                  label: tx('scene7', 'inputLabel'), type: 'circle' as const },
      { x: startX + spacing,        label: tx('scene7', 'encoderLabel'), type: 'box' as const },
      { x: startX + spacing * 2,    label: tx('scene7', 'sampleLabel'), type: 'diamond' as const },
      { x: startX + spacing * 3,    label: tx('scene7', 'decoderLabel'), type: 'box' as const },
      { x: startX + spacing * 3 + spacing * 0.85, label: tx('scene7', 'outputLabel'), type: 'circle' as const },
    ];

    // Draw pipeline progressively
    const pipeP = easedSub(progress, 0.06, 0.45);
    if (pipeP > 0) {
      ctx.save();

      for (let i = 0; i < nodes.length; i++) {
        const nodeP = easedSub(progress, 0.06 + i * 0.07, 0.2 + i * 0.07);
        if (nodeP <= 0) continue;

        ctx.globalAlpha = nodeP;
        const n = nodes[i];
        const nx = n.x + boxW / 2;

        if (n.type === 'circle') {
          // Input/output circles
          const circR = 22;
          ctx.beginPath();
          ctx.arc(nx, pipeY, circR, 0, Math.PI * 2);
          ctx.fillStyle = i === 0 ? colors.accent + '25' : colors.insight + '25';
          ctx.fill();
          ctx.strokeStyle = i === 0 ? colors.accent : colors.insight;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = i === 0 ? colors.accent : colors.insight;
          ctx.font = `bold 16px ${fonts.body}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(n.label, nx, pipeY);
        } else if (n.type === 'box') {
          // Encoder/decoder boxes
          const isEncoder = i === 1;
          const bColor = isEncoder ? colors.error : colors.insight;
          roundRect(ctx, n.x, pipeY - boxH / 2, boxW, boxH, 8);
          ctx.fillStyle = bColor + '15';
          ctx.fill();
          ctx.strokeStyle = bColor;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = bColor;
          ctx.font = `bold 11px ${fonts.body}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(n.label, nx, pipeY);
        } else if (n.type === 'diamond') {
          // Sampling diamond
          const dSize = 24;
          ctx.beginPath();
          ctx.moveTo(nx, pipeY - dSize);
          ctx.lineTo(nx + dSize, pipeY);
          ctx.lineTo(nx, pipeY + dSize);
          ctx.lineTo(nx - dSize, pipeY);
          ctx.closePath();
          ctx.fillStyle = colors.warning + '20';
          ctx.fill();
          ctx.strokeStyle = colors.warning;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = colors.warning;
          ctx.font = `bold 10px ${fonts.body}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('z', nx, pipeY);
        }

        // Arrow to next node
        if (i < nodes.length - 1) {
          const arrowNodeP = easedSub(progress, 0.12 + i * 0.07, 0.25 + i * 0.07);
          if (arrowNodeP > 0) {
            ctx.globalAlpha = arrowNodeP;
            const from = n.x + boxW + (n.type === 'circle' ? -boxW / 2 + 24 : 2);
            const next = nodes[i + 1];
            const to = next.x + (next.type === 'circle' ? boxW / 2 - 24 : -2);

            ctx.strokeStyle = colors.textMuted;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(from, pipeY);
            ctx.lineTo(to, pipeY);
            ctx.stroke();

            ctx.fillStyle = colors.textMuted;
            ctx.beginPath();
            ctx.moveTo(to, pipeY);
            ctx.lineTo(to - 7, pipeY - 4);
            ctx.lineTo(to - 7, pipeY + 4);
            ctx.closePath();
            ctx.fill();
          }
        }
      }

      // Sampling label below diamond
      const sampleLabelP = easedSub(progress, 0.28, 0.4);
      if (sampleLabelP > 0) {
        ctx.globalAlpha = sampleLabelP;
        ctx.fillStyle = colors.warning;
        ctx.font = `9px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(tx('scene7', 'sampleLabel'), nodes[2].x + boxW / 2, pipeY + 28);
      }

      ctx.restore();
    }

    // ELBO formula overlay
    const formulaP = easedSub(progress, 0.42, 0.6);
    if (formulaP > 0) {
      formulaAppear(state.formulaManager, 'pipeline-elbo',
        '\\mathcal{L} = \\textcolor{#34d399}{\\mathbb{E}_{q_\\phi}[\\log p_\\theta(\\mathbf{x}|\\mathbf{z})]} - \\textcolor{#f87171}{D_{\\text{KL}}(q_\\phi(\\mathbf{z}|\\mathbf{x}) \\| p(\\mathbf{z}))}',
        50, 52, formulaP, { color: colors.textPrimary, fontSize: '0.95em' });
    }

    // Connecting annotations: recon -> decoder, KL -> encoder
    const annotP = easedSub(progress, 0.58, 0.78);
    if (annotP > 0) {
      ctx.save();
      ctx.globalAlpha = annotP;

      // Reconstruction -> Decoder (green curved arrow)
      const decoderCx = nodes[3].x + boxW / 2;
      const annotY1 = H * 0.57;
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(W * 0.45, annotY1);
      ctx.quadraticCurveTo(decoderCx, annotY1 + 15, decoderCx, pipeY + boxH / 2 + 4);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrowhead
      ctx.fillStyle = colors.insight;
      ctx.beginPath();
      ctx.moveTo(decoderCx, pipeY + boxH / 2 + 4);
      ctx.lineTo(decoderCx - 4, pipeY + boxH / 2 + 12);
      ctx.lineTo(decoderCx + 4, pipeY + boxH / 2 + 12);
      ctx.closePath();
      ctx.fill();

      fadeInText(ctx, tx('scene7', 'reconArrow'), W * 0.38, annotY1 + 4, annotP, {
        color: colors.insight, font: `bold 10px ${fonts.body}`, align: 'right',
      });

      // KL -> Encoder (red curved arrow)
      const encoderCx = nodes[1].x + boxW / 2;
      const annotY2 = H * 0.62;
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(W * 0.55, annotY2);
      ctx.quadraticCurveTo(encoderCx, annotY2 + 15, encoderCx, pipeY + boxH / 2 + 4);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = colors.error;
      ctx.beginPath();
      ctx.moveTo(encoderCx, pipeY + boxH / 2 + 4);
      ctx.lineTo(encoderCx - 4, pipeY + boxH / 2 + 12);
      ctx.lineTo(encoderCx + 4, pipeY + boxH / 2 + 12);
      ctx.closePath();
      ctx.fill();

      fadeInText(ctx, tx('scene7', 'klArrow'), W * 0.62, annotY2 + 4, annotP, {
        color: colors.error, font: `bold 10px ${fonts.body}`, align: 'left',
      });

      ctx.restore();
    }

    // Loss label
    const lossP = easedSub(progress, 0.72, 0.85);
    if (lossP > 0) {
      const lossY = H * 0.76;
      ctx.save();
      ctx.globalAlpha = lossP;

      const bw = W * 0.5;
      const bh = 34;
      roundRect(ctx, (W - bw) / 2, lossY - bh / 2, bw, bh, 8);
      ctx.fillStyle = colors.panelBg;
      ctx.fill();
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = colors.textSecondary;
      ctx.font = `13px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene7', 'lossLabel') + '  =  ', W / 2 - 50, lossY);
      ctx.fillStyle = colors.insight;
      ctx.fillText('-Recon', W / 2 + 10, lossY);
      ctx.fillStyle = colors.textSecondary;
      ctx.fillText(' + ', W / 2 + 48, lossY);
      ctx.fillStyle = colors.error;
      ctx.fillText('KL', W / 2 + 68, lossY);

      ctx.restore();
    }

    // Next lesson teaser
    const nextP = easedSub(progress, 0.88, 0.98);
    if (nextP > 0) {
      const nextY = H * 0.92;
      ctx.save();
      ctx.globalAlpha = nextP;

      const bw = W * 0.55;
      const bh = 30;
      roundRect(ctx, (W - bw) / 2, nextY - bh / 2, bw, bh, 6);
      ctx.fillStyle = colors.accent + '12';
      ctx.fill();
      ctx.strokeStyle = colors.accent + '60';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = colors.accent;
      ctx.font = `12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene7', 'nextLabel') + '  \u2192', W / 2, nextY);

      ctx.restore();
    }
  },
});
